const express = require("express");
const cors = require("cors");
const { initializeKafka, setupKafkaShutdown } = require("../kafka/init.js");
const { initializeRoutesSubscriber } = require("../kafka/subscribers/routeSubscriber.js");

const routes = require("./routes/routes.js");

const app = express();

app.use(cors());
app.use(express.json());

// app.use("/api", routes); 

app.use(routes);
const PORT = process.env.PORT || 3013;

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const server = app.listen(PORT, async () => {
  try {
    // Initialiser Kafka
    await initializeKafka();
    await initializeRoutesSubscriber();
    setupKafkaShutdown();

    console.log(`🚀 Routes service running on port ${PORT}`);
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error.message);
    process.exit(1);
  }
});

// Gestion des erreurs non interceptées
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});