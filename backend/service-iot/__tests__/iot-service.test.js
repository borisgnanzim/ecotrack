// Prisma et Kafka sont mockés inline (jest.fn() dans la factory) pour éviter
// le problème de hoisting avec "type: module" transformé par Babel.
jest.mock('../src/config/prisma.js', () => ({
  __esModule: true,
  default: {
    measurement: { create: jest.fn() },
    sensorStatus: { upsert: jest.fn(), findMany: jest.fn() },
    alert:        { createMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
  },
}));

jest.mock('../src/kafka/kafkaProducer.js', () => ({
  __esModule: true,
  publishToKafka:   jest.fn().mockResolvedValue(undefined),
  disconnectKafka:  jest.fn().mockResolvedValue(undefined),
}));

const { handleSensorData, checkOfflineSensors } = require('../src/services/iot-service.js');
const prisma          = require('../src/config/prisma.js').default;
const { publishToKafka } = require('../src/kafka/kafkaProducer.js');

// UUID valides pour les tests
const UUID_A = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const UUID_B = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const UUID_C = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

// ─────────────────────────────────────────────────────────────────────────────
describe('handleSensorData', () => {

  const baseMeasurement = {
    id:          'meas-uuid-1',
    containerId: UUID_A,
    fillLevel:   50,
    temperature: 25,
    humidity:    60,
    anomaly:     false,
    createdAt:   new Date('2025-06-01T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.measurement.create.mockResolvedValue(baseMeasurement);
    prisma.sensorStatus.upsert.mockResolvedValue({});
    prisma.alert.createMany.mockResolvedValue({ count: 0 });
  });

  // ── Validation du payload ────────────────────────────────────────
  describe('Validation du payload', () => {

    test('payload valide complet → retourne le measurement créé', async () => {
      const result = await handleSensorData({
        containerId: UUID_A, fillLevel: 50, temperature: 25, humidity: 60,
      });
      expect(result).toMatchObject({ id: 'meas-uuid-1' });
      expect(prisma.measurement.create).toHaveBeenCalledTimes(1);
    });

    test('containerId manquant → retourne undefined sans toucher prisma', async () => {
      const result = await handleSensorData({ fillLevel: 50 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('containerId non-string (nombre) → retourne undefined', async () => {
      const result = await handleSensorData({ containerId: 12345, fillLevel: 50 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('containerId non-UUID (format invalide) → retourne undefined', async () => {
      const result = await handleSensorData({ containerId: 'pas-un-uuid', fillLevel: 50 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('fillLevel manquant → retourne undefined', async () => {
      const result = await handleSensorData({ containerId: UUID_A });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('fillLevel = -1 → retourne undefined (en dessous de 0)', async () => {
      const result = await handleSensorData({ containerId: UUID_A, fillLevel: -1 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('fillLevel = 101 → retourne undefined (au-dessus de 100)', async () => {
      const result = await handleSensorData({ containerId: UUID_A, fillLevel: 101 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('fillLevel = 0 → valide (frontière basse)', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 0 });
      expect(prisma.measurement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fillLevel: 0 }) })
      );
    });

    test('fillLevel = 100 → valide (frontière haute)', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 100 });
      expect(prisma.measurement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fillLevel: 100 }) })
      );
    });

    test('humidity = 101 → retourne undefined (hors plage)', async () => {
      const result = await handleSensorData({ containerId: UUID_A, fillLevel: 50, humidity: 101 });
      expect(result).toBeUndefined();
      expect(prisma.measurement.create).not.toHaveBeenCalled();
    });

    test('temperature et humidity absents → payload valide (champs optionnels)', async () => {
      const result = await handleSensorData({ containerId: UUID_A, fillLevel: 50 });
      expect(result).toBeDefined();
      expect(prisma.measurement.create).toHaveBeenCalled();
    });
  });

  // ── Persistance ──────────────────────────────────────────────────
  describe('Persistance', () => {

    test('convertit les valeurs string en number avant de persister', async () => {
      await handleSensorData({
        containerId: UUID_A,
        fillLevel:   '75',
        temperature: '22.5',
        humidity:    '65',
      });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: {
          containerId: UUID_A,
          fillLevel:   75,
          temperature: 22.5,
          humidity:    65,
          anomaly:     false,
        },
      });
    });

    test('champs optionnels absents → stockés null dans le measurement', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ temperature: null, humidity: null }),
      });
    });

    test('met à jour sensorStatus via upsert avec les bonnes clés', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 22, humidity: 55 });
      expect(prisma.sensorStatus.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where:  { containerId: UUID_A },
          update: expect.objectContaining({ lastFillLevel: 50, lastTemperature: 22, lastHumidity: 55 }),
          create: expect.objectContaining({ containerId: UUID_A, lastFillLevel: 50 }),
        })
      );
    });

    test('publie sur Kafka avec le topic et les données correctes', async () => {
      const createdAt = new Date('2025-06-01T10:00:00Z');
      prisma.measurement.create.mockResolvedValue({ ...baseMeasurement, createdAt });

      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 25, humidity: 60 });

      expect(publishToKafka).toHaveBeenCalledWith('container-fill-level', {
        containerId: UUID_A,
        fillLevel:   50,
        temperature: 25,
        humidity:    60,
        measuredAt:  createdAt,
      });
    });

    test('une erreur Kafka ne fait pas crasher handleSensorData', async () => {
      publishToKafka.mockRejectedValue(new Error('Kafka unreachable'));
      const result = await handleSensorData({ containerId: UUID_A, fillLevel: 50 });
      expect(result).toBeDefined();
      expect(prisma.measurement.create).toHaveBeenCalled();
    });
  });

  // ── Détection d'anomalies (champ anomaly du measurement) ────────
  describe("Détection d'anomalies", () => {

    test('temperature > 60 → anomaly = true', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 61 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ anomaly: true }),
      });
    });

    test('temperature < -10 → anomaly = true', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: -11 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ anomaly: true }),
      });
    });

    test('temperature = 60 (frontière incluse) → anomaly = false', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 60 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ anomaly: false }),
      });
    });

    test('temperature = -10 (frontière incluse) → anomaly = false', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: -10 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ anomaly: false }),
      });
    });

    test('toutes les valeurs dans la plage normale → anomaly = false', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 20, humidity: 60 });
      expect(prisma.measurement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ anomaly: false }),
      });
    });
  });

  // ── Génération d'alertes ─────────────────────────────────────────
  describe("Génération d'alertes", () => {

    test('fillLevel > 90 → alerte CRITICAL_FILL créée', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 91 });
      expect(prisma.alert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'CRITICAL_FILL', containerId: UUID_A }),
        ]),
      });
    });

    test("fillLevel = 90 → pas d'alerte CRITICAL_FILL (seuil strict > 90)", async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 90 });
      expect(prisma.alert.createMany).not.toHaveBeenCalled();
    });

    test('temperature > 60 → alerte TEMPERATURE_ANOMALY', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 65 });
      expect(prisma.alert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'TEMPERATURE_ANOMALY', containerId: UUID_A }),
        ]),
      });
    });

    test('temperature < -10 → alerte TEMPERATURE_ANOMALY', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: -15 });
      expect(prisma.alert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'TEMPERATURE_ANOMALY' }),
        ]),
      });
    });

    test('humidity < 10 → alerte HUMIDITY_ANOMALY', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, humidity: 5 });
      expect(prisma.alert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'HUMIDITY_ANOMALY' }),
        ]),
      });
    });

    test('humidity > 95 → alerte HUMIDITY_ANOMALY', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, humidity: 96 });
      expect(prisma.alert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'HUMIDITY_ANOMALY' }),
        ]),
      });
    });

    test('trois anomalies simultanées → un seul createMany avec les 3 alertes', async () => {
      await handleSensorData({
        containerId: UUID_A, fillLevel: 95, temperature: 70, humidity: 2,
      });
      expect(prisma.alert.createMany).toHaveBeenCalledTimes(1);
      const { data } = prisma.alert.createMany.mock.calls[0][0];
      expect(data).toHaveLength(3);
      const types = data.map((a) => a.type);
      expect(types).toContain('CRITICAL_FILL');
      expect(types).toContain('TEMPERATURE_ANOMALY');
      expect(types).toContain('HUMIDITY_ANOMALY');
    });

    test("toutes les valeurs normales → pas d'appel à alert.createMany", async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 25, humidity: 60 });
      expect(prisma.alert.createMany).not.toHaveBeenCalled();
    });

    test('le message CRITICAL_FILL contient le taux de remplissage', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 95 });
      const { data } = prisma.alert.createMany.mock.calls[0][0];
      const alert = data.find((a) => a.type === 'CRITICAL_FILL');
      expect(alert.message).toContain('95');
    });

    test('le message TEMPERATURE_ANOMALY contient la valeur de température', async () => {
      await handleSensorData({ containerId: UUID_A, fillLevel: 50, temperature: 72 });
      const { data } = prisma.alert.createMany.mock.calls[0][0];
      const alert = data.find((a) => a.type === 'TEMPERATURE_ANOMALY');
      expect(alert.message).toContain('72');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('checkOfflineSensors', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.alert.create.mockResolvedValue({});
    prisma.alert.findFirst.mockResolvedValue(null);
  });

  test('aucun capteur hors-ligne → retourne 0 et aucune alerte créée', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([]);
    const count = await checkOfflineSensors();
    expect(count).toBe(0);
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  test('capteur hors-ligne sans alerte existante → crée une alerte SENSOR_OFFLINE', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([
      { containerId: UUID_A, lastSeen: new Date(Date.now() - 25 * 3600 * 1000) },
    ]);

    const count = await checkOfflineSensors();

    expect(count).toBe(1);
    expect(prisma.alert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        containerId: UUID_A,
        type:        'SENSOR_OFFLINE',
      }),
    });
  });

  test('capteur hors-ligne avec alerte non résolue existante → pas de doublon', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([
      { containerId: UUID_A, lastSeen: new Date(Date.now() - 25 * 3600 * 1000) },
    ]);
    prisma.alert.findFirst.mockResolvedValue({ id: 'alerte-existante' });

    const count = await checkOfflineSensors();

    expect(count).toBe(1);
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  test('3 capteurs hors-ligne → retourne 3 et crée 3 alertes', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([
      { containerId: UUID_A, lastSeen: new Date(Date.now() - 25 * 3600 * 1000) },
      { containerId: UUID_B, lastSeen: new Date(Date.now() - 30 * 3600 * 1000) },
      { containerId: UUID_C, lastSeen: new Date(Date.now() - 48 * 3600 * 1000) },
    ]);

    const count = await checkOfflineSensors();

    expect(count).toBe(3);
    expect(prisma.alert.create).toHaveBeenCalledTimes(3);
  });

  test('mix alerté/non alerté → crée uniquement les alertes manquantes', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([
      { containerId: UUID_A, lastSeen: new Date(Date.now() - 25 * 3600 * 1000) },
      { containerId: UUID_B, lastSeen: new Date(Date.now() - 30 * 3600 * 1000) },
    ]);
    // UUID_A déjà alerté, UUID_B non
    prisma.alert.findFirst
      .mockResolvedValueOnce({ id: 'alerte-existante' })
      .mockResolvedValueOnce(null);

    const count = await checkOfflineSensors();

    expect(count).toBe(2);
    expect(prisma.alert.create).toHaveBeenCalledTimes(1);
    expect(prisma.alert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ containerId: UUID_B }),
    });
  });

  test('la requête filtre les capteurs non vus depuis plus de 24h', async () => {
    prisma.sensorStatus.findMany.mockResolvedValue([]);
    await checkOfflineSensors();

    const query = prisma.sensorStatus.findMany.mock.calls[0][0];
    expect(query.where.lastSeen.lt).toBeInstanceOf(Date);
    const expectedMs = Date.now() - 24 * 60 * 60 * 1000;
    expect(Math.abs(query.where.lastSeen.lt.getTime() - expectedMs)).toBeLessThan(5000);
  });

  test('le message SENSOR_OFFLINE contient la date lastSeen du capteur', async () => {
    const lastSeen = new Date(Date.now() - 25 * 3600 * 1000);
    prisma.sensorStatus.findMany.mockResolvedValue([
      { containerId: UUID_A, lastSeen },
    ]);

    await checkOfflineSensors();

    const { data } = prisma.alert.create.mock.calls[0][0];
    expect(data.message).toContain(lastSeen.toISOString());
  });
});
