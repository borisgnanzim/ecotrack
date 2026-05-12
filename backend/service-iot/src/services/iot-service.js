import prisma from "../config/prisma.js";

/**
 * Validation des données reçues du capteur
 */
function validatePayload(payload) {
  if (!payload.containerId) return { valid: false, error: "Missing containerId" };
  if (payload.fillLevel < 0 || payload.fillLevel > 100)
    return { valid: false, error: "fillLevel must be between 0 and 100" };

  return { valid: true };
}

/**
 * Traitement principal des données capteurs
 */
export async function handleSensorData(payload) {
  // 1. Validation
  const validation = validatePayload(payload);
  if (!validation.valid) {
    console.warn("Invalid payload:", validation.error);
    return;
  }

  const { containerId, fillLevel, temperature, humidity } = payload;

  // 2. Stockage dans Measurement (historique)
  const measurement = await prisma.measurement.create({
    data: {
      containerId,
      fillLevel,
      temperature,
      humidity,
      anomaly: false,
    },
  });

  // 3. Mise à jour du statut du capteur
  await prisma.sensorStatus.upsert({
    where: { containerId },
    update: {
      lastFillLevel: fillLevel,
      lastTemperature: temperature,
      lastHumidity: humidity,
      lastSeen: new Date(),
    },
    create: {
      containerId,
      lastFillLevel: fillLevel,
      lastTemperature: temperature,
      lastHumidity: humidity,
      lastSeen: new Date(),
    },
  });

  // 4. Détection d’alertes
  await detectAlerts(containerId, fillLevel, temperature);

  return measurement;
}

/**
 * Détection des alertes automatiques
 */
async function detectAlerts(containerId, fillLevel, temperature) {
  // Alerte : container presque plein
  if (fillLevel > 90) {
    await prisma.alert.create({
      data: {
        containerId,
        type: "CRITICAL_FILL",
        message: `Container ${containerId} is almost full (${fillLevel}%)`,
      },
    });
  }

  // Alerte : température anormale
  if (temperature && (temperature < -10 || temperature > 60)) {
    await prisma.alert.create({
      data: {
        containerId,
        type: "TEMPERATURE_ANOMALY",
        message: `Abnormal temperature detected: ${temperature}°C`,
      },
    });
  }
}
