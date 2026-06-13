require("dotenv").config();
const app = require("./app");
const { initializeKafka, setupKafkaShutdown } = require('../kafka/init.js');
const { initializeRoutesSubscriber } = require('../kafka/subscribers/routeSubscriber.js');

const PORT = process.env.PORT || 3003;

async function startServer() {
  // Start HTTP server first, regardless of Kafka state
  app.listen(PORT, () => {
    console.log(`Routes service running on port ${PORT}`);
  });

  // Kafka init is best-effort — service remains functional without it
  try {
    await initializeKafka();
    await initializeRoutesSubscriber();
    setupKafkaShutdown();
  } catch (error) {
    console.warn('⚠️  Kafka indisponible, service démarre sans Kafka:', error.message);
  }
}

startServer();