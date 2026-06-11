const { getProducer, disconnectProducer } = require('./kafkaClient');

const initializeKafka = async () => {
  try {
    await getProducer();
    console.log('Kafka initialized for Gamification Service');
  } catch (error) {
    console.error('Failed to initialize Kafka for Gamification Service:', error);
    throw error;
  }
};

const setupKafkaShutdown = () => {
  process.on('SIGTERM', async () => {
    await disconnectProducer();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await disconnectProducer();
    process.exit(0);
  });
};

module.exports = { initializeKafka, setupKafkaShutdown };