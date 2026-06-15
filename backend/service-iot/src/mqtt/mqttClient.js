import mqtt from "mqtt";
import { handleSensorData } from "../services/iot-service.js";

const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";

const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

client.on("connect", () => {
  console.log(`✅ MQTT connecté à ${MQTT_URL}`);
  client.subscribe("containers/+/data", (err) => {
    if (err) console.error("❌ Subscribe error:", err.message);
    else console.log("📡 Abonné à containers/+/data");
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    await handleSensorData(payload);
  } catch (e) {
    console.error("❌ Message MQTT invalide:", e.message);
  }
});

client.on("error",       (err) => console.error("❌ MQTT error:", err.message));
client.on("reconnect",   ()    => console.log("🔄 MQTT reconnexion..."));
client.on("offline",     ()    => console.warn("⚠️  MQTT hors-ligne"));
client.on("disconnect",  ()    => console.warn("⚠️  MQTT déconnecté"));

export default client;
