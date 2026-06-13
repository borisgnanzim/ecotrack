const { createConsumer } = require('../kafkaClient');
const { KAFKA_TOPICS, KAFKA_GROUPS, SUBSCRIBED_TOPICS } = require('../topics');
const prisma = require('../../config/prisma');

const initializeRoutesSubscriber = async () => {
  await createConsumer(KAFKA_GROUPS.ROUTES_SERVICE, SUBSCRIBED_TOPICS, async (message, topic) => {
    try {
      switch (topic) {
        case KAFKA_TOPICS.CONTAINER_FILL_LEVEL:
          await handleContainerFillLevel(message);
          break;
        case KAFKA_TOPICS.CONTAINER_STATUS_CHANGED:
          await handleContainerStatusChanged(message);
          break;
        case KAFKA_TOPICS.USER_CREATED:
          await handleNewUser(message);
          break;
        default:
          console.log(`⚠️  Topic non géré: ${topic}`);
      }
    } catch (error) {
      console.error(`❌ Erreur traitement message (${topic}):`, error.message);
    }
  });
  console.log('✅ Routes Subscriber initialisé');
};

async function handleContainerFillLevel({ containerId, fillPercentage }) {
  if (!containerId || fillPercentage <= 75) return;

  const existing = await prisma.route.findFirst({
    where: { status: 'planned', containerIds: { has: containerId } },
  });
  if (existing) return;

  const daysOffset = fillPercentage >= 90 ? 1 : 3;
  const collectionDate = new Date();
  collectionDate.setDate(collectionDate.getDate() + daysOffset);

  const route = await prisma.route.create({
    data: {
      date: collectionDate,
      status: 'planned',
      containerIds: [containerId],
      steps: { create: [{ containerId, stepOrder: 1 }] },
    },
  });
  console.log(`✅ Route automatique créée (${route.id}) — conteneur ${containerId} à ${fillPercentage}%`);
}

async function handleContainerStatusChanged({ containerId, newStatus }) {
  if (!containerId || newStatus !== 'broken') return;

  const routes = await prisma.route.findMany({
    where: { status: 'planned', containerIds: { has: containerId } },
    include: { steps: true },
  });

  for (const route of routes) {
    const remaining = route.containerIds.filter((id) => id !== containerId);
    if (remaining.length === 0) {
      await prisma.route.update({ where: { id: route.id }, data: { status: 'cancelled' } });
      console.log(`🚫 Route ${route.id} annulée — conteneur ${containerId} défectueux`);
    } else {
      await prisma.routeStep.deleteMany({ where: { routeId: route.id, containerId } });
      const sorted = route.steps
        .filter((s) => s.containerId !== containerId)
        .sort((a, b) => a.stepOrder - b.stepOrder);
      for (let i = 0; i < sorted.length; i++) {
        await prisma.routeStep.update({ where: { id: sorted[i].id }, data: { stepOrder: i + 1 } });
      }
      await prisma.route.update({ where: { id: route.id }, data: { containerIds: remaining } });
      console.log(`⚠️  Conteneur ${containerId} retiré de la route ${route.id}`);
    }
  }
}

async function handleNewUser({ userId, role }) {
  if (!userId || role !== 'collector') return;

  const unassigned = await prisma.route.findMany({
    where: { status: 'planned', agentId: null },
    orderBy: { date: 'asc' },
    take: 3,
  });

  for (const route of unassigned) {
    await prisma.route.update({ where: { id: route.id }, data: { agentId: userId } });
  }

  if (unassigned.length > 0)
    console.log(`✅ ${unassigned.length} route(s) assignée(s) au nouveau collecteur ${userId}`);
}

module.exports = { initializeRoutesSubscriber };
