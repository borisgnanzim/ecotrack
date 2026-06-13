// kafka/subscribers/routeSubscriber.js - Consommateur d'événements pour routes
const { createConsumer } = require('../kafkaClient.js');
const { KAFKA_TOPICS, KAFKA_GROUPS, SUBSCRIBED_TOPICS } = require('../topics.js');
const prisma = require('../../src/config/prisma.js');

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

// Quand un conteneur dépasse 75% de remplissage → créer une route automatique
async function handleContainerFillLevel(event) {
  const { containerId, fillPercentage } = event;

  if (!containerId || fillPercentage <= 75) return;

  // Vérifier qu'il n'y a pas déjà une route planifiée pour ce conteneur
  const existingRoute = await prisma.route.findFirst({
    where: {
      status: 'planned',
      containerIds: { has: containerId },
    },
  });

  if (existingRoute) {
    console.log(`ℹ️  Route planifiée existante pour conteneur ${containerId} (route ${existingRoute.id})`);
    return;
  }

  // Créer une route automatique avec date selon urgence
  const daysOffset = fillPercentage >= 90 ? 1 : 3;
  const collectionDate = new Date();
  collectionDate.setDate(collectionDate.getDate() + daysOffset);

  const route = await prisma.route.create({
    data: {
      date: collectionDate,
      status: 'planned',
      containerIds: [containerId],
      steps: {
        create: [{ containerId, stepOrder: 1 }],
      },
    },
  });

  console.log(`✅ Route automatique créée (id: ${route.id}) pour conteneur ${containerId} à ${fillPercentage}%`);
}

// Quand un conteneur devient défectueux → retirer des routes planifiées
async function handleContainerStatusChanged(event) {
  const { containerId, newStatus } = event;

  if (!containerId || newStatus !== 'broken') return;

  // Trouver toutes les routes planifiées contenant ce conteneur
  const affectedRoutes = await prisma.route.findMany({
    where: {
      status: 'planned',
      containerIds: { has: containerId },
    },
    include: { steps: true },
  });

  if (affectedRoutes.length === 0) return;

  for (const route of affectedRoutes) {
    const remainingIds = route.containerIds.filter((id) => id !== containerId);

    if (remainingIds.length === 0) {
      // Plus aucun conteneur → annuler la route
      await prisma.route.update({
        where: { id: route.id },
        data: { status: 'cancelled' },
      });
      console.log(`🚫 Route ${route.id} annulée (seul conteneur ${containerId} est défectueux)`);
    } else {
      // Retirer le conteneur et renuméroter les étapes
      await prisma.routeStep.deleteMany({
        where: { routeId: route.id, containerId },
      });

      const remainingSteps = route.steps
        .filter((s) => s.containerId !== containerId)
        .sort((a, b) => a.stepOrder - b.stepOrder);

      for (let i = 0; i < remainingSteps.length; i++) {
        await prisma.routeStep.update({
          where: { id: remainingSteps[i].id },
          data: { stepOrder: i + 1 },
        });
      }

      await prisma.route.update({
        where: { id: route.id },
        data: { containerIds: remainingIds },
      });

      console.log(`⚠️  Conteneur ${containerId} retiré de la route ${route.id}`);
    }
  }
}

// Quand un nouvel agent (collecteur) est créé → lui assigner les routes sans agent
async function handleNewUser(event) {
  const { userId, role } = event;

  if (!userId || role !== 'collector') return;

  // Assigner jusqu'à 3 routes planifiées sans agent à ce collecteur
  const unassignedRoutes = await prisma.route.findMany({
    where: {
      status: 'planned',
      agentId: null,
    },
    orderBy: { date: 'asc' },
    take: 3,
  });

  if (unassignedRoutes.length === 0) {
    console.log(`ℹ️  Aucune route sans agent pour le nouveau collecteur ${userId}`);
    return;
  }

  for (const route of unassignedRoutes) {
    await prisma.route.update({
      where: { id: route.id },
      data: { agentId: userId },
    });
  }

  console.log(`✅ ${unassignedRoutes.length} route(s) assignée(s) au nouveau collecteur ${userId}`);
}

module.exports = {
  initializeRoutesSubscriber,
};
