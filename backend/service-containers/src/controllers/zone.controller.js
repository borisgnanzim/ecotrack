import ZoneService from '../services/zone.service.js';
import AdmZip from 'adm-zip';
import { ZonePublisher } from '../../kafka/publishers/zonePublisher.js';

const handleError = (res, err) => {
  if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
  console.error('Zone error:', err.message);
  return res.status(500).json({ error: err.message || 'Erreur serveur' });
};

const zoneController = {
  // ── CRUD ──────────────────────────────────────────────────────────────

  getAll: async (req, res) => {
    try { res.json(await ZoneService.getAll()); }
    catch (err) { handleError(res, err); }
  },

  getById: async (req, res) => {
    try { res.json(await ZoneService.getById(req.params.id)); }
    catch (err) { handleError(res, err); }
  },

  create: async (req, res) => {
    try {
      const zone = await ZoneService.create(req.body);
      ZonePublisher.publishZoneCreated(zone).catch(() => {});
      res.status(201).json(zone);
    }
    catch (err) { handleError(res, err); }
  },

  update: async (req, res) => {
    try {
      const zone = await ZoneService.update(req.params.id, req.body);
      ZonePublisher.publishZoneUpdated(zone).catch(() => {});
      res.json(zone);
    }
    catch (err) { handleError(res, err); }
  },

  delete: async (req, res) => {
    try {
      await ZoneService.delete(req.params.id);
      ZonePublisher.publishZoneDeleted(req.params.id).catch(() => {});
      res.status(204).send();
    }
    catch (err) { handleError(res, err); }
  },

  // ── Containers ────────────────────────────────────────────────────────

  getContainers: async (req, res) => {
    try { res.json(await ZoneService.getContainers(req.params.id)); }
    catch (err) { handleError(res, err); }
  },

  assignContainers: async (req, res) => {
    try {
      const result = await ZoneService.assignContainers(req.params.id, req.body.containerIds);
      ZonePublisher.publishContainersAssigned(req.params.id, req.body.containerIds, result.assigned).catch(() => {});
      res.json(result);
    }
    catch (err) { handleError(res, err); }
  },

  removeContainers: async (req, res) => {
    try { res.json(await ZoneService.removeContainers(req.params.id, req.body.containerIds)); }
    catch (err) { handleError(res, err); }
  },

  // ── Stats & Map ───────────────────────────────────────────────────────

  getGlobalStats: async (req, res) => {
    try { res.json(await ZoneService.getGlobalStats()); }
    catch (err) { handleError(res, err); }
  },

  getZoneStats: async (req, res) => {
    try {
      const zone = await ZoneService.getById(req.params.id);
      res.json({ id: zone.id, name: zone.name, ...zone.stats });
    }
    catch (err) { handleError(res, err); }
  },

  getChoropleth: async (req, res) => {
    try { res.json(await ZoneService.getChoropleth()); }
    catch (err) { handleError(res, err); }
  },

  // ── GeoJSON Import / Export ───────────────────────────────────────────

  exportGeoJSON: async (req, res) => {
    try {
      const geojson = await ZoneService.exportGeoJSON();
      res.set({
        'Content-Type': 'application/geo+json',
        'Content-Disposition': 'attachment; filename="zones.geojson"',
      });
      res.json(geojson);
    }
    catch (err) { handleError(res, err); }
  },

  importGeoJSON: async (req, res) => {
    try {
      let geojson;
      if (req.file) {
        // Uploaded .geojson file
        geojson = JSON.parse(req.file.buffer.toString('utf8'));
      } else {
        // Body is a GeoJSON FeatureCollection
        geojson = req.body;
      }
      const results = await ZoneService.importGeoJSON(geojson);
      res.json({ message: 'Import GeoJSON terminé', ...results });
    }
    catch (err) { handleError(res, err); }
  },

  // ── Shapefile Import / Export ─────────────────────────────────────────

  exportShapefile: async (req, res) => {
    try {
      const zipBuffer = await ZoneService.exportShapefile();
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="zones-shapefile.zip"',
        'Content-Length': zipBuffer.length,
      });
      res.send(zipBuffer);
    }
    catch (err) { handleError(res, err); }
  },

  importShapefile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Fichier ZIP requis (.zip contenant .shp et .dbf)' });
      }

      const zip = new AdmZip(req.file.buffer);
      const entries = zip.getEntries();

      const shpEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.shp'));
      const dbfEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.dbf'));

      if (!shpEntry) {
        return res.status(400).json({ error: 'Fichier .shp introuvable dans le ZIP' });
      }

      const results = await ZoneService.importShapefile(
        shpEntry.getData(),
        dbfEntry?.getData() ?? null,
      );
      res.json({ message: 'Import Shapefile terminé', ...results });
    }
    catch (err) { handleError(res, err); }
  },
};

export default zoneController;
