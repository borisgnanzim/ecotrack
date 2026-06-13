const routeService = require('../services/route.service');
const { RoutePublisher } = require('../kafka/publishers/route.publisher');

const handleError = (res, err) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error('❌ Erreur interne:', err);
  res.status(500).json({ error: err.message });
};

exports.getRoutes = async (req, res) => {
  try {
    res.json(await routeService.getAll());
  } catch (err) { handleError(res, err); }
};

exports.getRoute = async (req, res) => {
  try {
    res.json(await routeService.getById(req.params.id));
  } catch (err) { handleError(res, err); }
};

exports.getAgentRoutes = async (req, res) => {
  try {
    res.json(await routeService.getByAgentId(req.params.agentId));
  } catch (err) { handleError(res, err); }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await routeService.create(req.body);
    RoutePublisher.publishRouteCreated(route).catch(() => {});
    res.status(201).json(route);
  } catch (err) { handleError(res, err); }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await routeService.update(req.params.id, req.body);
    RoutePublisher.publishRouteUpdated({ id: route.id, changes: req.body, updatedAt: route.updatedAt }).catch(() => {});
    if (route.status === 'completed')
      RoutePublisher.publishRouteCompleted(route.id, route.steps?.length ?? 0, route.totalDistance).catch(() => {});
    res.json(route);
  } catch (err) { handleError(res, err); }
};

exports.deleteRoute = async (req, res) => {
  try {
    await routeService.remove(req.params.id);
    RoutePublisher.publishRouteDeleted(req.params.id).catch(() => {});
    res.json({ message: 'Route supprimée' });
  } catch (err) { handleError(res, err); }
};

exports.assignAgent = async (req, res) => {
  try {
    res.json(await routeService.assignAgent(req.params.id, req.body.agentId));
  } catch (err) { handleError(res, err); }
};

exports.optimizeRoute = async (req, res) => {
  try {
    res.json(await routeService.optimize(req.params.id));
  } catch (err) { handleError(res, err); }
};

exports.validateRoute = async (req, res) => {
  try {
    res.json(await routeService.validate(req.params.id));
  } catch (err) { handleError(res, err); }
};

exports.getRouteMap = async (req, res) => {
  try {
    res.json(await routeService.getMap(req.params.id));
  } catch (err) { handleError(res, err); }
};
