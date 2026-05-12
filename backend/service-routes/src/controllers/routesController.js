const prisma = require("../config/prisma");
const { nearestNeighbor, twoOpt, distance } = require("../services/routeOptimizer");

exports.createRoute = async (req, res) => {
  try {
    const {
      date,
      start_time,
      end_time,
      agent_id,
      status,
      total_distance,
      estimated_time,
      containers_list,
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Le champ date est requis" });
    }

    const route = await prisma.route.create({
      data: {
        date: new Date(date),
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        agent_id: agent_id !== undefined && agent_id !== null ? agent_id : null,
        status,
        containers_list: Array.isArray(containers_list)
          ? containers_list.map((id) => parseInt(id, 10))
          : [],
        total_distance: total_distance !== undefined ? parseFloat(total_distance) : undefined,
        estimated_time: estimated_time !== undefined ? parseInt(estimated_time, 10) : undefined,
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
      start_time,
      end_time,
      agent_id,
      status,
      total_distance,
      estimated_time,
      containers_list,
    } = req.body;

    const data = {};
    if (date !== undefined) data.date = new Date(date);
    if (start_time !== undefined) data.start_time = start_time ? new Date(start_time) : null;
    if (end_time !== undefined) data.end_time = end_time ? new Date(end_time) : null;
    if (agent_id !== undefined) data.agent_id = agent_id !== null ? agent_id : null;
    if (status !== undefined) data.status = status;
    if (containers_list !== undefined) {
      data.containers_list = Array.isArray(containers_list)
        ? containers_list.map((id) => parseInt(id, 10))
        : [];
    }
    if (total_distance !== undefined) data.total_distance = parseFloat(total_distance);
    if (estimated_time !== undefined) data.estimated_time = parseInt(estimated_time, 10);

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

    res.json({ message: "Route deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;

    const route = await prisma.route.update({
      where: { id },
      data: { agent_id: agent_id !== undefined ? agent_id : null },
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

    const routeContainerIds = Array.isArray(route.containers_list) && route.containers_list.length > 0
      ? route.containers_list
      : route.steps.map((step) => step.container_id);

    const criticalContainers = await prisma.container.findMany({
      where: {
        fill_level: {
          gt: 80,
        },
      },
    });

    const criticalIds = criticalContainers.map((container) => container.id_conteneur);
    const allContainerIds = Array.from(new Set([...routeContainerIds, ...criticalIds]));

    if (!allContainerIds || allContainerIds.length === 0) {
      return res.status(400).json({ error: "Aucun conteneur à optimiser" });
    }

    const containers = await prisma.container.findMany({
      where: {
        id_conteneur: { in: allContainerIds },
      },
    });

    if (!containers || containers.length === 0) {
      return res.status(400).json({ error: "Conteneurs introuvables pour cette route" });
    }

    const containerMap = new Map(containers.map((container) => [container.id_conteneur, container]));
    const points = allContainerIds
      .map((containerId) => containerMap.get(containerId))
      .filter(Boolean)
      .map((container) => ({
        id: container.id_conteneur,
        latitude: container.latitude ?? 0,
        longitude: container.longitude ?? 0,
        fill_level: container.fill_level ?? 0,
      }));

    if (points.length < 2) {
      return res.status(200).json({ message: "Pas assez de points pour optimiser", route });
    }

    const initialRoute = nearestNeighbor(points);
    const optimizedRoute = twoOpt(initialRoute);

    const stepData = optimizedRoute.map((point, index) => {
      const dist = index === 0 ? 0 : distance(optimizedRoute[index - 1], point);
      const travelTime = dist / 0.5; // 30 km/h = 0.5 km/min
      const stopTime = 5; // 5 minutes per container
      const timeFromPrevious = index === 0 ? stopTime : travelTime + stopTime;
      return {
        container_id: point.id,
        step_order: index + 1,
        distance_from_previous: index === 0 ? null : parseFloat(dist.toFixed(2)),
        estimated_time_from_previous: Math.round(timeFromPrevious),
      };
    });

    const totalDistance = optimizedRoute.reduce((sum, point, index) => {
      if (index === 0) return 0;
      return sum + distance(optimizedRoute[index - 1], point);
    }, 0);

    const totalTime = stepData.reduce((sum, step) => sum + step.estimated_time_from_previous, 0);

    const updateData = {
      total_distance: parseFloat(totalDistance.toFixed(2)),
      estimated_time: totalTime,
      containers_list: allContainerIds,
      steps: {
        create: stepData,
      },
    };

    if (route.start_time) {
      updateData.end_time = new Date(route.start_time.getTime() + totalTime * 60000); // add minutes
    }

    await prisma.routeStep.deleteMany({
      where: { route_id: id },
    });

    await prisma.route.update({
      where: { id },
      data: updateData,
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

    // Check if route has steps
    if (!route.steps || route.steps.length === 0) {
      validations.push({ type: "error", message: "La route n'a pas d'étapes définies" });
    }

    // Check total time < 8 hours (480 minutes)
    if (route.estimated_time && route.estimated_time > 480) {
      validations.push({ type: "warning", message: "Le temps estimé dépasse 8 heures" });
    }

    // Check if all containers have valid coordinates
    const invalidContainers = route.steps.filter(
      (step) => !step.container || step.container.latitude == null || step.container.longitude == null
    );
    if (invalidContainers.length > 0) {
      validations.push({
        type: "error",
        message: `Conteneurs sans coordonnées valides: ${invalidContainers.map(s => s.container_id).join(', ')}`
      });
    }

    // Check if start_time and end_time are consistent
    if (route.start_time && route.end_time && route.estimated_time) {
      const calculatedEnd = new Date(route.start_time.getTime() + route.estimated_time * 60000);
      if (Math.abs(route.end_time.getTime() - calculatedEnd.getTime()) > 60000) { // 1 min tolerance
        validations.push({ type: "warning", message: "L'heure de fin ne correspond pas au temps estimé" });
      }
    }

    const isValid = !validations.some(v => v.type === "error");

    res.json({
      route_id: id,
      is_valid: isValid,
      validations,
    });
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

    const orderedSteps = [...route.steps].sort((a, b) => a.step_order - b.step_order);
    const features = orderedSteps
      .filter((step) => step.container && step.container.latitude != null && step.container.longitude != null)
      .map((step) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [step.container.longitude, step.container.latitude],
        },
        properties: {
          step_order: step.step_order,
          container_id: step.container.id_conteneur,
          fill_level: step.container.fill_level,
          address: step.container.id_Zone,
          status: route.status,
        },
      }));

    const lineCoordinates = features.map((feature) => feature.geometry.coordinates);

    const geojson = {
      type: "FeatureCollection",
      features: [
        ...features,
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
          properties: {
            route_id: route.id,
            agent_id: route.agent_id,
            status: route.status,
            total_distance: route.total_distance,
            estimated_time: route.estimated_time,
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
      where: {
        agent_id: agentId,
      },
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