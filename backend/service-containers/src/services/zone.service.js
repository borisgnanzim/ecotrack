import ZoneRepository from '../repositories/zone.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class ZoneService {
  // ── Stats helpers ────────────────────────────────────────────────────────

  _computeStats(zone) {
    const containers = zone.containers || [];
    const count = containers.length;

    if (count === 0) {
      return { containerCount: 0, avgFillLevel: 0, criticalContainers: 0, maxFillLevel: 0, minFillLevel: 0, statusBreakdown: {}, typeBreakdown: {} };
    }

    const fills = containers.map(c => c.fillLevel ?? 0);
    const avg = fills.reduce((a, b) => a + b, 0) / count;

    const statusBreakdown = {};
    const typeBreakdown = {};
    containers.forEach(c => {
      const s = c.status || 'active';
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
      typeBreakdown[c.type] = (typeBreakdown[c.type] || 0) + 1;
    });

    return {
      containerCount: count,
      avgFillLevel: Math.round(avg * 10) / 10,
      criticalContainers: containers.filter(c => (c.fillLevel ?? 0) >= 80).length,
      maxFillLevel: Math.max(...fills),
      minFillLevel: Math.min(...fills),
      statusBreakdown,
      typeBreakdown,
    };
  }

  _fillCategory(avg) {
    if (avg >= 80) return 'critical';
    if (avg >= 60) return 'high';
    if (avg >= 40) return 'medium';
    return 'low';
  }

  // ── CRUD ────────────────────────────────────────────────────────────────

  async getAll() {
    const zones = await ZoneRepository.findAll();
    return zones.map(z => ({ ...z, stats: this._computeStats(z), containers: undefined }));
  }

  async getById(id) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    return { ...zone, stats: this._computeStats(zone) };
  }

  async create(data) {
    const nameExists = await ZoneRepository.findByName(data.name);
    if (nameExists) throw new ConflictError('Une zone avec ce nom existe déjà');
    return ZoneRepository.create(data);
  }

  async update(id, data) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    if (data.name && data.name !== zone.name) {
      const nameExists = await ZoneRepository.findByName(data.name);
      if (nameExists) throw new ConflictError('Une zone avec ce nom existe déjà');
    }
    return ZoneRepository.update(id, data);
  }

  async delete(id) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    await ZoneRepository.delete(id); // containers.zoneId set to NULL via onDelete: SetNull
  }

  // ── Containers ───────────────────────────────────────────────────────────

  async getContainers(id) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    return zone.containers;
  }

  async assignContainers(id, containerIds) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    const result = await ZoneRepository.assignContainers(id, containerIds);
    return { zoneId: id, assigned: result.count };
  }

  async removeContainers(id, containerIds) {
    const zone = await ZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Zone introuvable');
    const result = await ZoneRepository.removeContainers(containerIds);
    return { zoneId: id, removed: result.count };
  }

  // ── Stats & Map ──────────────────────────────────────────────────────────

  async getGlobalStats() {
    const zones = await ZoneRepository.findAll();
    const zonesStats = zones.map(z => ({ id: z.id, name: z.name, city: z.city, ...this._computeStats(z) }));

    const totalContainers = zonesStats.reduce((s, z) => s + z.containerCount, 0);
    const weightedAvg = totalContainers > 0
      ? zonesStats.reduce((s, z) => s + z.avgFillLevel * z.containerCount, 0) / totalContainers
      : 0;

    return {
      totalZones: zones.length,
      activeZones: zones.filter(z => z.isActive).length,
      totalContainers,
      avgFillLevel: Math.round(weightedAvg * 10) / 10,
      criticalZones: zonesStats.filter(z => z.avgFillLevel >= 80).length,
      zonesStats,
    };
  }

  async getChoropleth() {
    const zones = await ZoneRepository.findAll();

    const features = zones.map(z => {
      const stats = this._computeStats(z);
      const geometry = z.polygon
        || (z.latitude && z.longitude ? { type: 'Point', coordinates: [z.longitude, z.latitude] } : null);

      return {
        type: 'Feature',
        geometry,
        properties: {
          id: z.id,
          name: z.name,
          city: z.city,
          district: z.district,
          isActive: z.isActive,
          avgFillLevel: stats.avgFillLevel,
          containerCount: stats.containerCount,
          criticalContainers: stats.criticalContainers,
          fillCategory: this._fillCategory(stats.avgFillLevel),
        },
      };
    });

    return { type: 'FeatureCollection', features };
  }

  // ── GeoJSON Import / Export ──────────────────────────────────────────────

  async exportGeoJSON() {
    const zones = await ZoneRepository.findAll();

    const features = zones.map(z => {
      const stats = this._computeStats(z);
      return {
        type: 'Feature',
        geometry: z.polygon || null,
        properties: {
          id: z.id,
          name: z.name,
          city: z.city,
          district: z.district,
          description: z.description,
          isActive: z.isActive,
          latitude: z.latitude,
          longitude: z.longitude,
          containerCount: stats.containerCount,
          avgFillLevel: stats.avgFillLevel,
          createdAt: z.createdAt,
          updatedAt: z.updatedAt,
        },
      };
    });

    return { type: 'FeatureCollection', features };
  }

  async importGeoJSON(geojson) {
    if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
      throw new Error('Format invalide — GeoJSON FeatureCollection attendu');
    }

    const results = { created: 0, updated: 0, skipped: 0, errors: [] };

    for (const feature of geojson.features) {
      const p = feature.properties || {};
      try {
        const id = p.id || p.name?.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 20);
        if (!id || !p.name) {
          results.errors.push({ reason: 'id ou name manquant', properties: p });
          results.skipped++;
          continue;
        }

        const data = {
          name: p.name,
          city: p.city || 'Non défini',
          district: p.district || null,
          description: p.description || null,
          isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
          polygon: feature.geometry || null,
          latitude: p.latitude || null,
          longitude: p.longitude || null,
          updatedAt: new Date(),
        };

        const existing = await ZoneRepository.findById(id);
        if (existing) {
          await ZoneRepository.update(id, data);
          results.updated++;
        } else {
          await ZoneRepository.create({ id, ...data });
          results.created++;
        }
      } catch (err) {
        results.errors.push({ reason: err.message, properties: p });
        results.skipped++;
      }
    }

    return results;
  }

  // ── Shapefile Import / Export ────────────────────────────────────────────

  async exportShapefile() {
    const geojson = await this.exportGeoJSON();
    const shpwrite = (await import('shp-write')).default;
    // shp-write returns a Promise<Buffer> (nodebuffer type via JSZip)
    const zipBuffer = await shpwrite.zip(geojson);
    return Buffer.from(zipBuffer);
  }

  async importShapefile(shpBuffer, dbfBuffer) {
    const shapefile = await import('shapefile');
    const geojson = await shapefile.read(shpBuffer, dbfBuffer ?? undefined);
    return this.importGeoJSON(geojson);
  }
}

export default new ZoneService();
