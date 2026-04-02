// kafka/subscribers/analyticsSubscriber.js - Consommateur d'événements pour analytics
const { createConsumer } = require('../kafkaClient.js');
const { KAFKA_TOPICS, KAFKA_GROUPS, SUBSCRIBED_TOPICS } = require('../topics.js');

/**
 * Initialiser le consommateur d'analytics
 * Écoute tous les événements importants
 */
const initializeAnalyticsSubscriber = async () => {
  await createConsumer(KAFKA_GROUPS.ANALYTICS, SUBSCRIBED_TOPICS, async (message, topic) => {
    try {
      switch (topic) {
        case KAFKA_TOPICS.CONTAINER_FILL_LEVEL:
          await handleContainerFillLevel(message);
          break;
        
        case KAFKA_TOPICS.CONTAINER_CREATED:
          await handleContainerCreated(message);
          break;
        
        case KAFKA_TOPICS.CONTAINER_STATUS_CHANGED:
          await handleContainerStatusChanged(message);
          break;
        
        case KAFKA_TOPICS.ROUTE_COMPLETED:
          await handleRouteCompleted(message);
          break;
        
        case KAFKA_TOPICS.USER_CREATED:
          await handleUserCreated(message);
          break;
        
        case KAFKA_TOPICS.CONTAINER_UPDATED:
          await handleContainerUpdated(message);
          break;
        
        default:
          console.log(`⚠️  Topic non géré: ${topic}`);
      }
    } catch (error) {
      console.error(`❌ Erreur traitement message (${topic}):`, error.message);
    }
  });

  console.log('✅ Analytics Subscriber initialisé');
};

// Handlers d'événements

async function handleContainerFillLevel(event) {
  console.log('📊 Analyse niveau remplissage:', {
    containerId: event.containerId,
    fillPercentage: event.fillPercentage,
    requiresCollection: event.requiresCollection,
  });

  // TODO: Sauvegarder les statistiques dans Redis/DB
  // await storeAnalytics('container_fill_level', event);
  
  if (event.requiresCollection) {
    console.log('🚨 ALERTE: Conteneur près de la limite!', event.containerId);
    // TODO: Notifier les collecteurs
  }
}

async function handleContainerCreated(event) {
  console.log('📈 Nouvelle conteneur créé:', event.containerId);
  // TODO: Mettre à jour les statistiques
}

async function handleContainerStatusChanged(event) {
  console.log('🔄 Statut conteneur changé:', {
    containerId: event.containerId,
    old: event.oldStatus,
    new: event.newStatus,
  });
  // TODO: Logger dans les stats
}

async function handleRouteCompleted(event) {
  console.log('✅ Route complétée:', {
    routeId: event.routeId,
    collectionsCount: event.collectionsCount,
  });
  // TODO: Mettre à jour les statistiques de collections
}

async function handleUserCreated(event) {
  console.log('👤 Nouvel utilisateur:', event.userId);
  // TODO: Mettre à jour les comptes
}

async function handleContainerUpdated(event) {
  console.log('🔧 Conteneur mis à jour:', event.containerId);
  // TODO: Logger les modifications
}

module.exports = {
  initializeAnalyticsSubscriber,
};
