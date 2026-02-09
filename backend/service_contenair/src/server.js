
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";


// const PORT = 3000;
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Nouvelle connexion WebSocket :", socket.id);

  socket.on("disconnect", () => {
    console.log("Déconnexion WebSocket :", socket.id);
  });
});

app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Service Containers avec WebSocket sur http://localhost:${PORT}`);
});
