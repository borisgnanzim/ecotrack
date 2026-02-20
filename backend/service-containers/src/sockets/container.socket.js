import { io } from "../server.js";

// Enregistrer les événements Socket.IO
export function initializeContainerSockets() {
  io.on("connection", (socket) => {
    console.log("Client connecté:", socket.id);

    // Événement custom: abonnement aux mises à jour d'un conteneur
    socket.on("subscribe_container", (containerId) => {
      const room = `container_${containerId}`;
      socket.join(room);
      console.log(` Client ${socket.id} abonné à ${room}`);
      socket.emit("subscribed", { containerId, message: "Vous recevrez les mises à jour" });
    });

    // Événement custom: désabonnement
    socket.on("unsubscribe_container", (containerId) => {
      const room = `container_${containerId}`;
      socket.leave(room);
      console.log(`Client ${socket.id} désabonné de ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Client déconnecté:", socket.id);
    });
  });
}

// Émettre une mise à jour lors du changement de niveau
export function emitFillLevelUpdate(containerId, niveau) {
  const room = `container_${containerId}`;
  io.to(room).emit("fill_level_updated", {
    containerId,
    niveau,
    timestamp: new Date(),
  });
  console.log(` Mise à jour envoyée à ${room}: niveau ${niveau}%`);
}

// Émettre une alerte critique
export function emitCriticalAlert(containerId, niveau) {
  const room = `container_${containerId}`;
  io.to(room).emit("critical_alert", {
    containerId,
    niveau,
    message: `Conteneur ${containerId} critique (${niveau}%)`,
    timestamp: new Date(),
  });
  console.log(` Alerte critique pour ${room}`);
}
