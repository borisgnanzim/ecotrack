const prisma = require('../config/prisma');
const repo = require('../repositories/route.repository');
const { nearestNeighbor, twoOpt, distance } = require('./optimizer.service');
const { VALID_TRANSITIONS } = require('../constants/route.constants');

const getAll = () => repo.findAll();

const getById = async (id) => {
  const route = await repo.findById(id);
  if (!route) throw { status: 404, message: 'Route non trouvée' };
  return route;
};

const getByAgentId = (agentId) => repo.findByAgentId(agentId);

const create = (dto) =>
  repo.create({
    date: new Date(dto.date),
    startTime: dto.startTime ? new Date(dto.startTime) : null,
    endTime: dto.endTime ? new Date(dto.endTime) : null,
    agentId: dto.agentId || null,
    status: dto.status,
    containerIds: dto.containerIds,
    totalDistance: dto.totalDistance ?? undefined,
    estimatedTime: dto.estimatedTime ?? undefined,
  });

const update = async (id, dto) => {
  const current = await repo.findById(id);
  if (!current) throw { status: 404, message: 'Route non trouvée' };

  // Vérifier la transition de statut si elle est demandée
  if (dto.status !== undefined && dto.status !== current.status) {
    const allowed = VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw {
        status: 422,
        message: `Transition invalide : ${current.status} → ${dto.status}. Transitions autorisées : ${allowed.join(', ') || 'aucune'}`,
      };
    }
  }

  const data = {};
  if (dto.date !== undefined) data.date = new Date(dto.date);
  if (dto.startTime !== undefined) data.startTime = dto.startTime ? new Date(dto.startTime) : null;
  if (dto.endTime !== undefined) data.endTime = dto.endTime ? new Date(dto.endTime) : null;
  if (dto.agentId !== undefined) data.agentId = dto.agentId || null;
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.containerIds !== undefined) data.containerIds = dto.containerIds;
  if (dto.totalDistance !== undefined) data.totalDistance = dto.totalDistance;
  if (dto.estimatedTime !== undefined) data.estimatedTime = dto.estimatedTime;

  // Enregistrer l'heure de début automatiquement si passage à in_progress
  if (dto.status === 'in_progress' && !current.startTime) {
    data.startTime = new Date();
  }

  // Enregistrer l'heure de fin automatiquement si passage à completed
  if (dto.status === 'completed' && !current.endTime) {
    data.endTime = new Date();
  }

  if (Object.keys(data).length === 0) throw { status: 400, message: 'Aucun champ à mettre à jour' };

  return repo.update(id, data);
};

const remove = (id) => repo.remove(id);

const assignAgent = (id, agentId) => repo.update(id, { agentId: agentId || null });

const optimize = async (id) => {
  const route = await repo.findById(id);
  if (!route) throw { status: 404, message: 'Route non trouvée' };

  const routeContainerIds =
    Array.isArray(route.containerIds) && route.containerIds.length > 0
      ? route.containerIds
      : route.steps.map((s) => s.containerId);

  const criticalContainers = await prisma.container.findMany({
    where: { fillLevel: { gt: 80 } },
  });

  const criticalIds = criticalContainers.map((c) => c.id);
  const allContainerIds = Array.from(new Set([...routeContainerIds, ...criticalIds]));

  if (allContainerIds.length === 0) throw { status: 400, message: 'Aucun conteneur à optimiser' };

  const containers = await prisma.container.findMany({
    where: { id: { in: allContainerIds } },
  });

  if (containers.length === 0) throw { status: 400, message: 'Conteneurs introuvables pour cette route' };

  const containerMap = new Map(containers.map((c) => [c.id, c]));
  const points = allContainerIds
    .map((cid) => containerMap.get(cid))
    .filter(Boolean)
    .map((c) => ({ id: c.id, latitude: c.latitude ?? 0, longitude: c.longitude ?? 0, fillLevel: c.fillLevel ?? 0 }));

  if (points.length < 2) return {
    route,
    distance_before_km: null,
    distance_after_km: null,
    distance_saved_km: null,
    distance_saved_pct: null,
    critical_containers_added: false,
    added_critical_containers: [],
  };

  // Distance naïve (ordre original) avant optimisation
  const naiveDistance = points.reduce(
    (sum, point, index) => (index === 0 ? 0 : sum + distance(points[index - 1], point)),
    0,
  );

  const optimized = twoOpt(nearestNeighbor(points));

  const stepData = optimized.map((point, index) => {
    const dist = index === 0 ? 0 : distance(optimized[index - 1], point);
    const timeFromPrevious = index === 0 ? 5 : dist / 0.5 + 5;
    return {
      containerId: point.id,
      stepOrder: index + 1,
      distanceFromPrevious: index === 0 ? null : parseFloat(dist.toFixed(2)),
      estimatedTimeFromPrevious: Math.round(timeFromPrevious),
    };
  });

  const optimizedDistance = optimized.reduce(
    (sum, point, index) => (index === 0 ? 0 : sum + distance(optimized[index - 1], point)),
    0,
  );
  const totalTime = stepData.reduce((sum, s) => sum + s.estimatedTimeFromPrevious, 0);

  const savedKm = naiveDistance - optimizedDistance;
  const savedPct = naiveDistance > 0 ? (savedKm / naiveDistance) * 100 : 0;

  await repo.deleteSteps(id);

  await repo.updateWithSteps(id, {
    totalDistance: parseFloat(optimizedDistance.toFixed(2)),
    estimatedTime: totalTime,
    containerIds: allContainerIds,
    ...(route.startTime && { endTime: new Date(route.startTime.getTime() + totalTime * 60000) }),
    steps: { create: stepData },
  });

  const final = await repo.findById(id);
  const addedCritical = criticalIds.filter((cid) => !routeContainerIds.includes(cid));

  return {
    route: final,
    distance_before_km: parseFloat(naiveDistance.toFixed(2)),
    distance_after_km: parseFloat(optimizedDistance.toFixed(2)),
    distance_saved_km: parseFloat(savedKm.toFixed(2)),
    distance_saved_pct: parseFloat(savedPct.toFixed(1)),
    critical_containers_added: addedCritical.length > 0,
    added_critical_containers: addedCritical,
  };
};

const validate = async (id) => {
  const route = await repo.findById(id);
  if (!route) throw { status: 404, message: 'Route non trouvée' };

  const validations = [];

  if (!route.steps || route.steps.length === 0)
    validations.push({ type: 'error', message: "La route n'a pas d'étapes définies" });

  if (route.estimatedTime && route.estimatedTime > 480)
    validations.push({ type: 'warning', message: 'Le temps estimé dépasse 8 heures' });

  const invalidContainers = route.steps.filter(
    (s) => !s.container || s.container.latitude == null || s.container.longitude == null,
  );
  if (invalidContainers.length > 0)
    validations.push({
      type: 'error',
      message: `Conteneurs sans coordonnées valides: ${invalidContainers.map((s) => s.containerId).join(', ')}`,
    });

  if (route.startTime && route.endTime && route.estimatedTime) {
    const calculatedEnd = new Date(route.startTime.getTime() + route.estimatedTime * 60000);
    if (Math.abs(route.endTime.getTime() - calculatedEnd.getTime()) > 60000)
      validations.push({ type: 'warning', message: "L'heure de fin ne correspond pas au temps estimé" });
  }

  return { route_id: id, is_valid: !validations.some((v) => v.type === 'error'), validations };
};

const getMap = async (id) => {
  const route = await repo.findById(id);
  if (!route) throw { status: 404, message: 'Route non trouvée' };

  const ordered = [...route.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const features = ordered
    .filter((s) => s.container && s.container.latitude != null && s.container.longitude != null)
    .map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.container.longitude, s.container.latitude] },
      properties: {
        stepOrder: s.stepOrder,
        containerId: s.container.id,
        fillLevel: s.container.fillLevel,
        zoneId: s.container.zoneId,
        status: route.status,
      },
    }));

  return {
    type: 'FeatureCollection',
    features: [
      ...features,
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: features.map((f) => f.geometry.coordinates) },
        properties: {
          routeId: route.id,
          agentId: route.agentId,
          status: route.status,
          totalDistance: route.totalDistance,
          estimatedTime: route.estimatedTime,
        },
      },
    ],
  };
};

module.exports = { getAll, getById, getByAgentId, create, update, remove, assignAgent, optimize, validate, getMap };
