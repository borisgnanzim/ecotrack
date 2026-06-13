require("dotenv").config();
const app = require("./app");
const { initializeKafka, setupKafkaShutdown } = require('./kafka/init');
const { initializeRoutesSubscriber } = require('./kafka/subscribers/route.subscriber');

const PORT = process.env.PORT || 3013;

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Routes service running on port ${PORT}`);
  });

  try {
    await initializeKafka();
    await initializeRoutesSubscriber();
    setupKafkaShutdown();
  } catch (error) {
    console.warn('⚠️  Kafka indisponible, service démarre sans Kafka:', error.message);
  }
}

startServer();
