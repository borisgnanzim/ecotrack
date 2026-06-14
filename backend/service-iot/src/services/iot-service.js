import prisma from "../config/prisma.js";
import { publishToKafka } from "../kafka/kafkaProducer.js";

// ── Validation ────────────────────────────────────────────────────────────────

function validatePayload(payload) {
  if (!payload.containerId || typeof payload.containerId !== "string") {
    return { valid: false, error: "containerId manquant ou invalide (UUID attendu)" };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(payload.containerId)) {
    return { valid: false, error: `containerId doit être un UUID valide: ${payload.containerId}` };
  }
  if (payload.fillLevel === undefined || payload.fillLevel === null) {
    return { valid: false, error: "fillLevel manquant" };
  }
  const fill = Number(payload.fillLevel);
  if (isNaN(fill) || fill < 0 || fill > 100) {
    return { valid: false, error: `fillLevel hors plage (0-100): ${payload.fillLevel}` };
  }
  if (payload.humidity !== undefined && payload.humidity !== null) {
    const hum = Number(payload.humidity);
    if (isNaN(hum) || hum < 0 || hum > 100) {
      return { valid: false, error: `humidity hors plage (0-100): ${payload.humidity}` };
    }
  }
  return { valid: true };
}

function detectAnomalies(fillLevel, temperature, humidity) {
  const anomalies = [];
  if (temperature !== undefined && temperature !== null) {
    if (temperature < -10 || temperature > 60) anomalies.push("temperature");
  }
  if (humidity !== undefined && humidity !== null) {
    if (humidity < 0 || humidity > 100) anomalies.push("humidity");
  }
  return anomalies;
}

// ── Traitement principal ───────────────────────────────────────────────────────

export async function handleSensorData(payload) {
  const validation = validatePayload(payload);
  if (!validation.valid) {
    console.warn("⚠️  Payload invalide ignoré:", validation.error);
    return;
  }

  const { containerId } = payload;
  const fillLevel   = Number(payload.fillLevel);
  const temperature = payload.temperature != null ? Number(payload.temperature) : null;
  const humidity    = payload.humidity    != null ? Number(payload.humidity)    : null;

  const anomalies = detectAnomalies(fillLevel, temperature, humidity);
  const hasAnomaly = anomalies.length > 0;

  // 1. Enregistrement measurement
  const measurement = await prisma.measurement.create({
    data: { containerId, fillLevel, temperature, humidity, anomaly: hasAnomaly },
  });

  // 2. Mise à jour statut capteur
  await prisma.sensorStatus.upsert({
    where:  { containerId },
    update: { lastFillLevel: fillLevel, lastTemperature: temperature, lastHumidity: humidity, lastSeen: new Date() },
    create: { containerId,  lastFillLevel: fillLevel, lastTemperature: temperature, lastHumidity: humidity, lastSeen: new Date() },
  });

  // 3. Alertes
  await detectAlerts(containerId, fillLevel, temperature, humidity);

  // 4. Kafka → service-containers met à jour son fill_level
  publishToKafka("container-fill-level", {
    containerId,
    fillLevel,
    temperature,
    humidity,
    measuredAt: measurement.createdAt,
  }).catch((err) => console.error("Kafka publish error:", err.message));

  console.log(`✅ [${containerId}] fill=${fillLevel}% temp=${temperature}°C hum=${humidity}%`);
  return measurement;
}

// ── Alertes ───────────────────────────────────────────────────────────────────

async function detectAlerts(containerId, fillLevel, temperature, humidity) {
  const alerts = [];

  if (fillLevel > 90) {
    alerts.push({
      containerId,
      type: "CRITICAL_FILL",
      message: `Conteneur ${containerId} presque plein (${fillLevel}%)`,
    });
  }

  if (temperature !== null && (temperature < -10 || temperature > 60)) {
    alerts.push({
      containerId,
      type: "TEMPERATURE_ANOMALY",
      message: `Température anormale détectée: ${temperature}°C`,
    });
  }

  if (humidity !== null && (humidity < 10 || humidity > 95)) {
    alerts.push({
      containerId,
      type: "HUMIDITY_ANOMALY",
      message: `Humidité anormale détectée: ${humidity}%`,
    });
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
    alerts.forEach((a) => console.warn(`🚨 Alert [${a.type}] container=${containerId}`));
  }
}

// ── Capteurs hors-ligne (appelé par le scheduler) ────────────────────────────

export async function checkOfflineSensors() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h

  const offline = await prisma.sensorStatus.findMany({
    where: {
      lastSeen: { lt: threshold },
    },
  });

  for (const sensor of offline) {
    const alreadyAlerted = await prisma.alert.findFirst({
      where: {
        containerId: sensor.containerId,
        type: "SENSOR_OFFLINE",
        resolved: false,
        createdAt: { gt: threshold },
      },
    });

    if (!alreadyAlerted) {
      await prisma.alert.create({
        data: {
          containerId: sensor.containerId,
          type: "SENSOR_OFFLINE",
          message: `Capteur hors-ligne depuis ${sensor.lastSeen?.toISOString() ?? "inconnu"}`,
        },
      });
      console.warn(`🚨 Alert [SENSOR_OFFLINE] container=${sensor.containerId}`);
    }
  }

  return offline.length;
}
