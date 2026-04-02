import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import prisma from "./prisma/client.js";
import { initializeContainerSockets } from "./sockets/container.socket.js";
import { initializeKafka, setupKafkaShutdown } from "../kafka/init.js";

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || "*" },
  transports: ["websocket", "polling"],
});

// Initialiser les sockets
initializeContainerSockets();

const startServer = async () => {
  try {
    // Initialiser Kafka
    await initializeKafka();
    setupKafkaShutdown();

    // Connexion à la DB
    await prisma.$connect();
    console.log(`✅ Database connectée (${NODE_ENV})`);

    // Démarrer le serveur HTTP
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💡 WebSocket disponible`);
      if (NODE_ENV === "development") {
        console.log(`🔗 http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt du serveur...");
  try {
    await prisma.$disconnect();
    console.log("✅ DB déconnectée");
    httpServer.close(() => {
      console.log("✅ Serveur arrêté");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt:", error);
    process.exit(1);
  }
});

startServer();