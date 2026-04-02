// kafka/init.js - Initialisation Kafka pour service-containers (ES6 modules)
import { getProducer, disconnectKafka, ensureTopicsExist } from './kafkaClient.js';
import { PUBLISHED_TOPICS } from './topics.js';

/**
 * Initialiser Kafka au démarrage
 */
export const initializeKafka = async () => {
  try {
    console.log('🔄 Initialisation de Kafka (service-containers)...');

    // 1. Créer les topics publiés par ce service
    await ensureTopicsExist(PUBLISHED_TOPICS);

    // 2. Initialiser le producteur
    await getProducer();

    console.log('✅ Kafka initialisé - service-containers');
  } catch (error) {
    console.error('❌ Erreur initialisation Kafka:', error.message);
    throw error;
  }
};

/**
 * Gérer l'arrêt gracieux
 */
export const setupKafkaShutdown = () => {
  const signals = ['SIGINT', 'SIGTERM'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n📴 Signal ${signal} reçu - Fermeture de Kafka...`);
      await disconnectKafka();
      process.exit(0);
    });
  });
};
