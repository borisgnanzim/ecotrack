// kafka/subscribers/routeSubscriber.js - Consommateur d'événements pour routes
const { createConsumer } = require('../kafkaClient.js');
const { KAFKA_TOPICS, KAFKA_GROUPS, SUBSCRIBED_TOPICS } = require('../topics.js');

/**
 * Initialiser le consommateur pour service-routes
 * Écoute les événements de conteneurs pour créer/planifier des collectes
 */
const initializeRoutesSubscriber = async () => {
  await createConsumer(KAFKA_GROUPS.ROUTES_SERVICE, SUBSCRIBED_TOPICS, async (message, topic) => {
    try {
      switch (topic) {
        case KAFKA_TOPICS.CONTAINER_FILL_LEVEL:
          await handleContainerFillLevelForRoutes(message);
          break;
        
        case KAFKA_TOPICS.CONTAINER_STATUS_CHANGED:
          await handleContainerStatusChangedForRoutes(message);
          break;
        
        case KAFKA_TOPICS.USER_CREATED:
          await handleNewUserForRoutes(message);
          break;
        
        default:
          console.log(`⚠️  Topic non géré des routes: ${topic}`);
      }
    } catch (error) {
      console.error(`❌ Erreur traitement message route (${topic}):`, error.message);
    }
  });

  console.log('✅ Routes Subscriber initialisé');
};

// Handlers d'événements

async function handleContainerFillLevelForRoutes(event) {
  if (event.fillPercentage > 75) {
    console.log('📍 Création automatique de route pour conteneur plein:', {
      containerId: event.containerId,
      fillPercentage: event.fillPercentage,
    });
    
    // TODO: Créer automatiquement une route de collecte
    // const route = await Route.create({
    //   containerId: event.containerId,
    //   type: 'automatic',
    //   priority: event.fillPercentage > 90 ? 'high' : 'normal',
    // });
    // console.log('✅ Route créée:', route.id);
  }
}

async function handleContainerStatusChangedForRoutes(event) {
  if (event.newStatus === 'broken') {
    console.log('⚠️  Conteneur défectueux, annulation des routes planifiées:', event.containerId);
    
    // TODO: Annuler/reporter les routes prévues pour ce conteneur
    // await Route.updateMany(
    //   { containerId: event.containerId, status: 'pending' },
    //   { status: 'cancelled' }
    // );
  }
}

async function handleNewUserForRoutes(event) {
  if (event.role === 'collector') {
    console.log('👷 Nouveau collecteur disponible:', event.userId);
    
    // TODO: Assigner automatiquement des routes si nécessaire
    // Envoyer notif collecteur de ses routes assignées
  }
}

module.exports = {
  initializeRoutesSubscriber,
};
