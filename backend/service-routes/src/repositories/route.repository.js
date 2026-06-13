const prisma = require('../config/prisma');

const findAll = () =>
  prisma.route.findMany({
    include: { steps: { include: { container: true } }, agent: true },
  });

const findById = (id) =>
  prisma.route.findUnique({
    where: { id },
    include: { steps: { include: { container: true } }, agent: true },
  });

const findByAgentId = (agentId) =>
  prisma.route.findMany({
    where: { agentId },
    include: { steps: { include: { container: true } }, agent: true },
  });

const findPlannedWithContainer = (containerId) =>
  prisma.route.findFirst({
    where: { status: 'planned', containerIds: { has: containerId } },
  });

const findPlannedWithContainerMany = (containerId) =>
  prisma.route.findMany({
    where: { status: 'planned', containerIds: { has: containerId } },
    include: { steps: true },
  });

const findUnassignedPlanned = (limit) =>
  prisma.route.findMany({
    where: { status: 'planned', agentId: null },
    orderBy: { date: 'asc' },
    take: limit,
  });

const create = (data) => prisma.route.create({ data });

const update = (id, data) => prisma.route.update({ where: { id }, data });

const remove = (id) => prisma.route.delete({ where: { id } });

const createWithSteps = (data) => prisma.route.create({ data });

const updateWithSteps = (id, data) => prisma.route.update({ where: { id }, data });

const deleteSteps = (routeId) => prisma.routeStep.deleteMany({ where: { routeId } });

const updateStep = (id, data) => prisma.routeStep.update({ where: { id }, data });

const deleteStepByContainer = (routeId, containerId) =>
  prisma.routeStep.deleteMany({ where: { routeId, containerId } });

module.exports = {
  findAll,
  findById,
  findByAgentId,
  findPlannedWithContainer,
  findPlannedWithContainerMany,
  findUnassignedPlanned,
  create,
  update,
  remove,
  createWithSteps,
  updateWithSteps,
  deleteSteps,
  updateStep,
  deleteStepByContainer,
};
