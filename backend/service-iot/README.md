# Service IoT — EcoTrack

Microservice de collecte, validation et traitement des données des capteurs embarqués dans les conteneurs de déchets intelligents.

---

## Principe de fonctionnement

Chaque conteneur est équipé d'un **capteur IoT** qui mesure en temps réel :
- le niveau de remplissage (0–100 %)
- la température intérieure (°C)
- l'humidité relative (%)

Les capteurs publient leurs données toutes les **5 minutes** via le protocole **MQTT** sur le broker Mosquitto. Le service-iot écoute en permanence, valide chaque message, le stocke en base, génère des alertes automatiques si nécessaire, et notifie **service-containers** via Kafka.

```
Capteur IoT (physique ou simulateur Python)
    │
    │  MQTT  containers/<containerId>/data
    ▼
Mosquitto Broker  (localhost:1883)
    │
    ▼
service-iot  (localhost:3015)
    ├── Validation du payload (UUID, plages de valeurs)
    ├── Stockage → table measurements
    ├── Mise à jour → table sensor_statuses
    ├── Détection alertes → table alerts
    └── Kafka → topic container-fill-level → service-containers
```

---

## Stack technique

| Composant       | Technologie                       |
|-----------------|-----------------------------------|
| Runtime         | Node.js 20+ (ES Modules)          |
| Framework HTTP  | Express.js 5                      |
| Protocole IoT   | MQTT v5 (bibliothèque `mqtt`)     |
| Broker MQTT     | Mosquitto                         |
| Base de données | PostgreSQL (port 5433)            |
| ORM             | Prisma v6                         |
| Messaging       | Apache Kafka (KafkaJS)            |
| Simulateur      | Python 3 + paho-mqtt              |

---

## Structure du projet

```
service-iot/
├── src/
│   ├── app.js                    # Bootstrap Express + scheduler hors-ligne
│   ├── config/
│   │   └── prisma.js             # Client Prisma singleton
│   ├── mqtt/
│   │   └── mqttClient.js         # Connexion MQTT + écoute containers/+/data
│   ├── services/
│   │   └── iot-service.js        # Validation, alertes, Kafka, checkOfflineSensors
│   └── kafka/
│       └── kafkaProducer.js      # Publication vers Kafka (lazy connect)
├── prisma/
│   ├── schema.prisma             # Modèles DB (Measurement, SensorStatus, Alert)
│   └── migrations/
│       ├── 20260512195052_init_iot/
│       └── 20260614164349_uuid_schema/  ← migration UUID (schéma actif)
├── simulator/
│   └── sensor_simulator.py       # Simulateur Python (publication MQTT)
├── .env
└── package.json
```

---

## Variables d'environnement

```env
PORT=3015
DATABASE_URL=postgresql://postgres:password@localhost:5433/iot_db?schema=public
MQTT_URL=mqtt://localhost:1883
KAFKA_BROKERS=localhost:19092
```

---

## Démarrage

### 1. Démarrer le broker MQTT

```bash
mosquitto -d -p 1883
```

### 2. Appliquer les migrations

```bash
cd backend/service-iot
npx prisma migrate deploy
npx prisma generate
```

### 3. Lancer le service

```bash
npm run dev     # développement (nodemon, rechargement auto)
npm start       # production
```

Le service écoute sur `http://localhost:3015`.

---

## Format des messages MQTT

**Topic** : `containers/<containerId>/data`

```json
{
  "containerId": "9a1df64b-03d7-479b-9c28-62b50d3e7f9f",
  "fillLevel": 87,
  "temperature": 24.5,
  "humidity": 62
}
```

| Champ         | Type          | Obligatoire | Contrainte                              |
|---------------|---------------|:-----------:|-----------------------------------------|
| `containerId` | UUID (string) | ✅           | Format UUID v4 valide                   |
| `fillLevel`   | integer       | ✅           | 0 – 100                                 |
| `temperature` | float         | ❌           | En °C (anomalie si < -10 ou > 60)       |
| `humidity`    | float         | ❌           | 0 – 100 (anomalie si < 10 ou > 95)     |

Les messages invalides (UUID malformé, `fillLevel` hors plage, JSON corrompu) sont **ignorés** avec un log `⚠️ Payload invalide`.

---

## Modèles de données

### `measurements` — Historique brut des capteurs

| Colonne       | Type      | Description                          |
|---------------|-----------|--------------------------------------|
| `id`          | UUID (PK) | Identifiant unique                   |
| `containerId` | UUID      | Référence au conteneur               |
| `fillLevel`   | Int       | Niveau de remplissage (%)            |
| `temperature` | Float?    | Température (°C)                     |
| `humidity`    | Float?    | Humidité (%)                         |
| `anomaly`     | Boolean   | `true` si valeur aberrante détectée  |
| `createdAt`   | DateTime  | Horodatage de la mesure              |

### `sensor_statuses` — Dernier état connu par capteur

| Colonne           | Type      | Description                     |
|-------------------|-----------|---------------------------------|
| `id`              | UUID (PK) | Identifiant unique               |
| `containerId`     | UUID (UK) | Référence au conteneur (unique)  |
| `lastFillLevel`   | Int?      | Dernier niveau enregistré        |
| `lastTemperature` | Float?    | Dernière température             |
| `lastHumidity`    | Float?    | Dernière humidité                |
| `lastSeen`        | DateTime? | Horodatage du dernier message    |
| `updatedAt`       | DateTime  | Mis à jour automatiquement       |

### `alerts` — Alertes générées automatiquement

| Colonne       | Type      | Description                      |
|---------------|-----------|----------------------------------|
| `id`          | UUID (PK) | Identifiant unique                |
| `containerId` | UUID      | Conteneur concerné               |
| `type`        | AlertType | Type d'alerte (voir ci-dessous)  |
| `message`     | String    | Description lisible              |
| `resolved`    | Boolean   | `false` = alerte active          |
| `resolvedAt`  | DateTime? | Date de résolution               |
| `createdAt`   | DateTime  | Date de création                 |

---

## Système d'alertes

Les alertes sont générées **automatiquement** à chaque mesure reçue :

| Type                  | Déclencheur                              | Priorité    |
|-----------------------|------------------------------------------|-------------|
| `CRITICAL_FILL`       | `fillLevel > 90 %`                       | 🔴 Critique |
| `TEMPERATURE_ANOMALY` | `temperature < -10 °C` ou `> 60 °C`     | 🟠 Haute    |
| `HUMIDITY_ANOMALY`    | `humidity < 10 %` ou `> 95 %`           | 🟠 Haute    |
| `SENSOR_OFFLINE`      | Aucune donnée depuis **24 h**            | 🟡 Moyenne  |
| `MAINTENANCE`         | Usage manuel                             | 🔵 Info     |

Les alertes `SENSOR_OFFLINE` sont vérifiées par un **scheduler interne toutes les heures** (`setInterval` dans `app.js`). Une seule alerte active par capteur est créée (pas de doublons).

---

## Intégration Kafka

À chaque mesure valide, le service publie en **fire-and-forget** sur le topic `container-fill-level` :

```json
{
  "containerId": "9a1df64b-03d7-479b-9c28-62b50d3e7f9f",
  "fillLevel": 87,
  "temperature": 24.5,
  "humidity": 62,
  "measuredAt": "2026-06-14T16:50:51.760Z"
}
```

Ce message est consommé par **service-containers** pour mettre à jour le `fillLevel` du conteneur en temps réel.

Le producer Kafka se connecte en **lazy** (à la première publication) et maintient la connexion ouverte.

---

## Endpoints REST

| Méthode   | Route                           | Description                              |
|-----------|---------------------------------|------------------------------------------|
| `GET`     | `/health`                       | État du service                          |
| `GET`     | `/alerts`                       | Alertes actives non résolues (max 100)   |
| `PATCH`   | `/alerts/:id/resolve`           | Marquer une alerte comme résolue         |
| `GET`     | `/sensors`                      | Dernier état de tous les capteurs        |
| `GET`     | `/measurements/:containerId`    | 50 dernières mesures d'un conteneur      |

---

## Simulateur Python

Le simulateur `simulator/sensor_simulator.py` génère des données réalistes sans capteurs physiques.

### Prérequis

```bash
pip install paho-mqtt
```

### Lancement

```bash
# Simuler 5 conteneurs avec UUIDs aléatoires, intervalle 30s (test rapide)
python3 simulator/sensor_simulator.py --count 5 --interval 30

# Simuler des conteneurs existants en base, intervalle 5min (production)
python3 simulator/sensor_simulator.py \
  --containers 9a1df64b-03d7-479b-9c28-62b50d3e7f9f 2d7b976c-efe6-4a08-aeca-89942df354fb \
  --interval 300

# Options complètes
python3 simulator/sensor_simulator.py \
  --host localhost \
  --port 1883 \
  --interval 300 \
  --count 10
```

### Comportement simulé

- Le **niveau de remplissage** monte progressivement (+0 à +5 % par cycle) puis se remet à 0 quand le conteneur est plein.
- **5 % des capteurs** sont marqués défaillants au démarrage et envoient des valeurs aberrantes (température hors plage, humidité > 95 %).
- Arrêt propre sur `Ctrl+C` (SIGINT / SIGTERM).

---

## Tests manuels via mosquitto_pub

```bash
# Message normal
mosquitto_pub -h localhost -p 1883 \
  -t "containers/abc/data" \
  -m '{"containerId":"9a1df64b-03d7-479b-9c28-62b50d3e7f9f","fillLevel":75,"temperature":22,"humidity":55}'

# Déclenchement alerte remplissage critique (fillLevel > 90)
mosquitto_pub -h localhost -p 1883 \
  -t "containers/abc/data" \
  -m '{"containerId":"9a1df64b-03d7-479b-9c28-62b50d3e7f9f","fillLevel":95,"temperature":22}'

# Déclenchement alerte anomalie température (> 60 °C)
mosquitto_pub -h localhost -p 1883 \
  -t "containers/abc/data" \
  -m '{"containerId":"9a1df64b-03d7-479b-9c28-62b50d3e7f9f","fillLevel":40,"temperature":75}'

# Payload invalide (ignoré silencieusement)
mosquitto_pub -h localhost -p 1883 \
  -t "containers/abc/data" \
  -m '{"containerId":"pas-un-uuid","fillLevel":50}'
```

---

## Scripts npm

| Commande                    | Description                           |
|-----------------------------|---------------------------------------|
| `npm run dev`               | Démarrage développement (nodemon)     |
| `npm start`                 | Démarrage production                  |
| `npm run prisma:generate`   | Générer le client Prisma              |
| `npm run prisma:migrate`    | Appliquer les migrations              |
