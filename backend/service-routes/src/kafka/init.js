// kafka/init.js - Initialisation Kafka pour service-routes
const { getProducer, disconnectKafka, ensureTopicsExist } = require('./kafkaClient.js');
const { SUBSCRIBED_TOPICS, PUBLISHED_TOPICS } = require('./topics.js');

/**
 * Initialiser Kafka au démarrage
 */
const initializeKafka = async () => {
  try {
    console.log('🔄 Initialisation de Kafka (service-routes)...');

    // 1. Créer les topics publiés par ce service
    await ensureTopicsExist([...PUBLISHED_TOPICS, ...SUBSCRIBED_TOPICS]);

    // 2. Initialiser le producteur
    await getProducer();

    console.log('✅ Kafka initialisé - service-routes');
  } catch (error) {
    console.error('❌ Erreur initialisation Kafka:', error.message);
    throw error;
  }
};

/**
 * Gérer l'arrêt gracieux
 */
const setupKafkaShutdown = () => {
  const signals = ['SIGINT', 'SIGTERM'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n📴 Signal ${signal} reçu - Fermeture de Kafka...`);
      await disconnectKafka();
      process.exit(0);
    });
  });
};

module.exports = {
  initializeKafka,
  setupKafkaShutdown,
};
