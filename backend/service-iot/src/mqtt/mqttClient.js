import mqtt from "mqtt";
import dotenv from "dotenv";
import { handleSensorData } from "../services/iot-service.js";

dotenv.config();

const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe("containers/+/data", (err) => {
    if (err) console.error("Subscribe error:", err);
    else console.log("Subscribed to containers/+/data");
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log("MQTT message received:", topic, payload);

    await handleSensorData(payload);

  } catch (e) {
    console.error("Invalid MQTT message:", e.message);
  }
});
console.log("MQTT consumer loaded");
