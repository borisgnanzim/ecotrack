const prisma = require("../config/prisma");

exports.createRoute = async (req, res) => {
  try {
    const {
      date,
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
      agent_id,
      status,
      total_distance,
      estimated_time,
      containers_list,
    } = req.body;

    const data = {};
    if (date !== undefined) data.date = new Date(date);
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