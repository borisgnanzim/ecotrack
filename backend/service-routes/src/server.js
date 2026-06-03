require("dotenv").config();
const app = require("./app");
const { initializeKafka, setupKafkaShutdown } = require('../kafka/init.js');
const { initializeRoutesSubscriber } = require('../kafka/subscribers/routeSubscriber.js');

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await initializeKafka();
    await initializeRoutesSubscriber();
    setupKafkaShutdown();

    app.listen(PORT, () => {
      console.log(`Routes service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du service routes:', error.message);
    process.exit(1);
  }
}

startServer();