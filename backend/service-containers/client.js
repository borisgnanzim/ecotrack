const socket = io("http://localhost:3000");

socket.on("connect", () => console.log("Connecté au WebSocket"));

socket.on("container_updated", (data) => {
  console.log("Conteneur mis à jour :", data);
});
