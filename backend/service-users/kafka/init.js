// kafka/init.js - Initialisation Kafka pour service-users
const { getProducer, disconnectKafka, ensureTopicsExist } = require('./kafkaClient.js');
const { PUBLISHED_TOPICS } = require('./topics.js');

/**
 * Initialiser Kafka au démarrage
 */
const initializeKafka = async () => {
  try {
    console.log('🔄 Initialisation de Kafka (service-users)...');

    // 1. Créer les topics publiés par ce service
    await ensureTopicsExist(PUBLISHED_TOPICS);

    // 2. Initialiser le producteur
    await getProducer();

    console.log('✅ Kafka initialisé - service-users');
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
