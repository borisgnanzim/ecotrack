const prisma = require("../config/prisma");
const { nearestNeighbor, twoOpt, distance } = require("../services/routeOptimizer");

exports.createRoute = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      agentId,
      status,
      totalDistance,
      estimatedTime,
      containerIds,
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Le champ date est requis" });
    }

    const route = await prisma.route.create({
      data: {
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        agentId: agentId || null,
        status: status || "planned",
        containerIds: Array.isArray(containerIds) ? containerIds : [],
        totalDistance: totalDistance !== undefined ? parseFloat(totalDistance) : undefined,
        estimatedTime: estimatedTime !== undefined ? parseInt(estimatedTime, 10) : undefined,
      },
    });

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });

    if (!route) {
      return res.status(404).json({ error: "Route non trouvée" });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      startTime,
      endTime,
      agentId,
      status,
      totalDistance,
      estimatedTime,
      containerIds,
    } = req.body;

    const data = {};
    if (date !== undefined) data.date = new Date(date);
    if (startTime !== undefined) data.startTime = startTime ? new Date(startTime) : null;
    if (endTime !== undefined) data.endTime = endTime ? new Date(endTime) : null;
    if (agentId !== undefined) data.agentId = agentId || null;
    if (status !== undefined) data.status = status;
    if (containerIds !== undefined) data.containerIds = Array.isArray(containerIds) ? containerIds : [];
    if (totalDistance !== undefined) data.totalDistance = parseFloat(totalDistance);
    if (estimatedTime !== undefined) data.estimatedTime = parseInt(estimatedTime, 10);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    const route = await prisma.route.update({
      where: { id },
      data,
    });

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.route.delete({
      where: { id },
    });

    res.json({ message: "Route supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const route = await prisma.route.update({
      where: { id },
      data: { agentId: agentId || null },
    });

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.optimizeRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: { steps: { include: { container: true } } },
    });

    if (!route) {
      return res.status(404).json({ error: "Route non trouvée" });
    }

    const routeContainerIds =
      Array.isArray(route.containerIds) && route.containerIds.length > 0
        ? route.containerIds
        : route.steps.map((step) => step.containerId);

    const criticalContainers = await prisma.container.findMany({
      where: { fillLevel: { gt: 80 } },
    });

    const criticalIds = criticalContainers.map((c) => c.id);
    const allContainerIds = Array.from(new Set([...routeContainerIds, ...criticalIds]));

    if (allContainerIds.length === 0) {
      return res.status(400).json({ error: "Aucun conteneur à optimiser" });
    }

    const containers = await prisma.container.findMany({
      where: { id: { in: allContainerIds } },
    });

    if (containers.length === 0) {
      return res.status(400).json({ error: "Conteneurs introuvables pour cette route" });
    }

    const containerMap = new Map(containers.map((c) => [c.id, c]));
    const points = allContainerIds
      .map((cid) => containerMap.get(cid))
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        latitude: c.latitude ?? 0,
        longitude: c.longitude ?? 0,
        fillLevel: c.fillLevel ?? 0,
      }));

    if (points.length < 2) {
      return res.status(200).json({ message: "Pas assez de points pour optimiser", route });
    }

    const initialRoute = nearestNeighbor(points);
    const optimizedRoute = twoOpt(initialRoute);

    const stepData = optimizedRoute.map((point, index) => {
      const dist = index === 0 ? 0 : distance(optimizedRoute[index - 1], point);
      const travelTime = dist / 0.5; // 30 km/h = 0.5 km/min
      const timeFromPrevious = index === 0 ? 5 : travelTime + 5;
      return {
        containerId: point.id,
        stepOrder: index + 1,
        distanceFromPrevious: index === 0 ? null : parseFloat(dist.toFixed(2)),
        estimatedTimeFromPrevious: Math.round(timeFromPrevious),
      };
    });

    const totalDistance = optimizedRoute.reduce((sum, point, index) => {
      if (index === 0) return 0;
      return sum + distance(optimizedRoute[index - 1], point);
    }, 0);

    const totalTime = stepData.reduce((sum, step) => sum + step.estimatedTimeFromPrevious, 0);

    await prisma.routeStep.deleteMany({ where: { routeId: id } });

    await prisma.route.update({
      where: { id },
      data: {
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        estimatedTime: totalTime,
        containerIds: allContainerIds,
        ...(route.startTime && {
          endTime: new Date(route.startTime.getTime() + totalTime * 60000),
        }),
        steps: { create: stepData },
      },
    });

    const updatedRoute = await prisma.route.findUnique({
      where: { id },
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });

    res.json({
      route: updatedRoute,
      critical_containers_added: criticalIds.some((cid) => !routeContainerIds.includes(cid)),
      added_critical_containers: criticalIds.filter((cid) => !routeContainerIds.includes(cid)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validateRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });

    if (!route) {
      return res.status(404).json({ error: "Route non trouvée" });
    }

    const validations = [];

    if (!route.steps || route.steps.length === 0) {
      validations.push({ type: "error", message: "La route n'a pas d'étapes définies" });
    }

    if (route.estimatedTime && route.estimatedTime > 480) {
      validations.push({ type: "warning", message: "Le temps estimé dépasse 8 heures" });
    }

    const invalidContainers = route.steps.filter(
      (step) => !step.container || step.container.latitude == null || step.container.longitude == null
    );
    if (invalidContainers.length > 0) {
      validations.push({
        type: "error",
        message: `Conteneurs sans coordonnées valides: ${invalidContainers.map((s) => s.containerId).join(", ")}`,
      });
    }

    if (route.startTime && route.endTime && route.estimatedTime) {
      const calculatedEnd = new Date(route.startTime.getTime() + route.estimatedTime * 60000);
      if (Math.abs(route.endTime.getTime() - calculatedEnd.getTime()) > 60000) {
        validations.push({ type: "warning", message: "L'heure de fin ne correspond pas au temps estimé" });
      }
    }

    const isValid = !validations.some((v) => v.type === "error");

    res.json({ route_id: id, is_valid: isValid, validations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRouteMap = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });

    if (!route) {
      return res.status(404).json({ error: "Route non trouvée" });
    }

    const orderedSteps = [...route.steps].sort((a, b) => a.stepOrder - b.stepOrder);
    const features = orderedSteps
      .filter((step) => step.container && step.container.latitude != null && step.container.longitude != null)
      .map((step) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [step.container.longitude, step.container.latitude],
        },
        properties: {
          stepOrder: step.stepOrder,
          containerId: step.container.id,
          fillLevel: step.container.fillLevel,
          zoneId: step.container.zoneId,
          status: route.status,
        },
      }));

    const lineCoordinates = features.map((f) => f.geometry.coordinates);

    const geojson = {
      type: "FeatureCollection",
      features: [
        ...features,
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: lineCoordinates },
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

    res.json(geojson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgentRoutes = async (req, res) => {
  try {
    const { agentId } = req.params;

    const routes = await prisma.route.findMany({
      where: { agentId },
      include: {
        steps: { include: { container: true } },
        agent: true,
      },
    });

    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
