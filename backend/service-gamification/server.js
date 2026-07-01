require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 3015;
const { connectDb } = require('./src/config/postgres');
const { initializeKafka, setupKafkaShutdown } = require('./kafka/init');

async function startServer() {
  try {
    // Kafka non-bloquant — le service démarre même si Kafka est indisponible
    initializeKafka()
      .then(() => setupKafkaShutdown())
      .catch((err) => console.warn('⚠️  Kafka indisponible — les événements ne seront pas consommés.', err.message));

    await connectDb();
    app.listen(port, () => {
      console.log(`✅ Service Gamification running on port ${port}`);
    });
  } catch (err) {
    console.error('Impossible de démarrer le serveur, la connexion à la BD a échoué.', err);
    process.exit(1);
  }
}

startServer();

// Optional: handle unhandled rejections / exceptions to avoid silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});