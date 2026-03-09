const prisma = require("../config/prisma");

exports.createRoute = async (req, res) => {

  try {

    const { date, agent_id } = req.body;

    const route = await prisma.route.create({
      data: {
        date: new Date(date),
        agent_id
      }
    });

    res.json(route);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

exports.getRoutes = async (req, res) => {

  const routes = await prisma.route.findMany({
    include: {
      steps: true
    }
  });

  res.json(routes);
};

exports.getRoute = async (req, res) => {

  const { id } = req.params;

  const route = await prisma.route.findUnique({
    where: { id: parseInt(id) },
    include: { steps: true }
  });

  res.json(route);
};

exports.updateRoute = async (req, res) => {

  const { id } = req.params;

  const route = await prisma.route.update({
    where: { id: parseInt(id) },
    data: req.body
  });

  res.json(route);
};

exports.deleteRoute = async (req, res) => {

  const { id } = req.params;

  await prisma.route.delete({
    where: { id: parseInt(id) }
  });

  res.json({ message: "Route deleted" });
};

exports.assignAgent = async (req, res) => {

  const { id } = req.params;
  const { agent_id } = req.body;

  const route = await prisma.route.update({
    where: { id: parseInt(id) },
    data: { agent_id }
  });

  res.json(route);
};

exports.getAgentRoutes = async (req, res) => {

  const { agentId } = req.params;

  const routes = await prisma.route.findMany({
    where: {
      agent_id: parseInt(agentId)
    }
  });

  res.json(routes);
};