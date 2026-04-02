require('dotenv').config();
const app = require('./app');
const { initializeKafka, setupKafkaShutdown } = require('./kafka/init.js');
const { initializeAnalyticsSubscriber } = require('./kafka/subscribers/analyticsSubscriber.js');

const port = process.env.PORT || 3014;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Initialiser Kafka
    await initializeKafka();
    
    // Initialiser le consommateur Analytics
    await initializeAnalyticsSubscriber();

    // Setup graceful shutdown
    setupKafkaShutdown();

    // Démarrer le serveur Express
    app.listen(port, () => {
      console.log(`
╔══════════════════════════════════════════╗
║     🎯 Service Analytics Démarré         ║
║     Port: ${port}
║     Env: ${NODE_ENV}
║     Topics: container-*, route-*, user-*
╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error.message);
    process.exit(1);
  }
}

startServer();

// Gestion des erreurs non interceptées
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});