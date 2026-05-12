import express from "express";
import dotenv from "dotenv";
import "./mqtt/mqttClient.js"; // Démarre le client MQTT

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "iot" });
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`IOT service running on port ${PORT}`);
});
