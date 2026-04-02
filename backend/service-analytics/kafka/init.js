// kafka/init.js - Initialisation Kafka pour service-analytics
const { getProducer, disconnectKafka, ensureTopicsExist } = require('./kafkaClient.js');
const { SUBSCRIBED_TOPICS } = require('./topics.js');

/**
 * Initialiser Kafka au démarrage
 */
const initializeKafka = async () => {
  try {
    console.log('🔄 Initialisation de Kafka (service-analytics)...');

    // 1. Créer les topics
    await ensureTopicsExist(SUBSCRIBED_TOPICS);

    // 2. Initialiser le producteur (même si non utilisé, pour cohérence)
    await getProducer();

    console.log('✅ Kafka initialisé - service-analytics');
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
