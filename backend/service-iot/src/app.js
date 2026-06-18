import "dotenv/config";
import express from "express";
import "./mqtt/mqttClient.js";
import { checkOfflineSensors } from "./services/iot-service.js";
import prisma from "./config/prisma.js";

const app = express();
app.use(helmet());
app.use(express.json());

// ── Health ─────────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "service-iot", ts: new Date() });
});

// ── Alertes actives ────────────────────────────────────────────────────────────

app.get("/alerts", async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/alerts/:id/resolve", async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { resolved: true, resolvedAt: new Date() },
    });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Statut capteurs ────────────────────────────────────────────────────────────

app.get("/sensors", async (req, res) => {
  try {
    const sensors = await prisma.sensorStatus.findMany({
      orderBy: { lastSeen: "desc" },
    });
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Measurements ───────────────────────────────────────────────────────────────

app.get("/measurements/:containerId", async (req, res) => {
  try {
    const data = await prisma.measurement.findMany({
      where: { containerId: req.params.containerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Scheduler : vérification capteurs hors-ligne (toutes les heures) ──────────

setInterval(async () => {
  try {
    const count = await checkOfflineSensors();
    if (count > 0) console.log(`🔍 ${count} capteur(s) hors-ligne détecté(s)`);
  } catch (err) {
    console.error("Scheduler error:", err.message);
  }
}, 60 * 60 * 1000);

// ── Démarrage ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3013;
app.listen(PORT, () => {
  console.log(`🚀 Service IoT démarré sur le port ${PORT}`);
});
