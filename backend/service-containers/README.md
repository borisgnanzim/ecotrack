# Service Containers & Zones — EcoTrack

Service de gestion des conteneurs de déchets intelligents et des zones géographiques de collecte.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Runtime | Node.js 20+ (ES Modules) |
| Framework | Express.js 5 |
| Base de données | PostgreSQL + extensions `cube` & `earthdistance` |
| ORM | Prisma v6 |
| Validation | Zod v4 |
| Authentification | JWT (`jsonwebtoken`) |
| Messaging | Apache Kafka (KafkaJS) |
| WebSocket | Socket.IO |
| Upload fichiers | Multer (mémoire) |
| GeoJSON/Shapefile | `shapefile`, `shp-write`, `adm-zip` |
| Documentation | Swagger UI (swagger-jsdoc + swagger-ui-express) |

---

## Structure du projet

```
service-containers/
├── src/
│   ├── app.js                  # Express + middlewares + routes
│   ├── server.js               # Bootstrap HTTP + Socket.IO + Prisma
│   ├── routes/
│   │   ├── container.routes.js
│   │   └── zone.routes.js
│   ├── controllers/
│   │   ├── container.controller.js
│   │   ├── fullhistory.controller.js
│   │   └── zone.controller.js
│   ├── services/
│   │   ├── container.service.js
│   │   ├── fillhistory.service.js
│   │   └── zone.service.js
│   ├── repositories/
│   │   ├── container.repository.js
│   │   ├── fillhistory.repository.js
│   │   └── zone.repository.js
│   ├── dtos/
│   │   ├── container.dto.js
│   │   ├── fillhistory.dto.js
│   │   └── zone.dto.js
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Vérification JWT → req.user
│   │   ├── validate.middleware.js  # Validation Zod
│   │   └── error.middleware.js
│   └── sockets/
│       └── container.socket.js
├── kafka/
│   ├── kafkaClient.js
│   ├── init.js                 # Création des topics au démarrage
│   ├── topics.js               # Constantes des topics
│   └── publishers/
│       ├── containerPublisher.js
│       └── zonePublisher.js
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── uploads/                    # Photos conteneurs (stockage local)
├── swagger.js                  # Définition OpenAPI 3.0
├── .env
└── package.json
```

---

## Variables d'environnement

Créer un fichier `.env` à la racine du service :

```env
PORT=3012
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrack_containers
JWT_SECRET=votre_secret_jwt

# Kafka
KAFKA_BROKERS=localhost:19092
KAFKA_CLIENT_ID=service-containers
```

---

## Démarrage rapide

### 1. Préparer PostgreSQL

```sql
CREATE DATABASE ecotrack_containers;
\c ecotrack_containers
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
```

### 2. Installer les dépendances

```bash
cd backend/service-containers
npm install
```

### 3. Générer le client Prisma et migrer

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Peupler la base (optionnel)

```bash
npm run seed:100     # 100 conteneurs (défaut)
npm run seed:1000    # 1 000 conteneurs
npm run seed:10000   # 10 000 conteneurs
```

Le seed crée d'abord 12 zones réelles au Sénégal (Dakar, Pikine, Guédiawaye, Rufisque), puis les conteneurs géolocalisés dans ces zones.

### 5. Lancer le serveur

```bash
npm run dev          # développement (nodemon)
```

Le service écoute sur `http://localhost:3012` (ou `PORT` dans `.env`).

---

## Documentation API

| URL | Description |
|-----|-------------|
| `http://localhost:3012/api-docs` | Swagger UI — documentation interactive complète |
| `GET /health` | Health check |

---

## Endpoints

### Conteneurs

| Méthode | Route | Auth | Description |
|---------|-------|:----:|-------------|
| `GET` | `/containers` | — | Lister tous les conteneurs |
| `GET` | `/containers/stats` | — | Statistiques globales |
| `GET` | `/containers/search` | — | Recherche (type, status, zoneId…) |
| `GET` | `/containers/nearby` | — | Conteneurs à proximité GPS (`lat`, `lng`, `radius`) |
| `GET` | `/containers/:id` | — | Détail d'un conteneur |
| `POST` | `/containers` | JWT | Créer un conteneur |
| `PUT` | `/containers/:id` | JWT | Mettre à jour |
| `DELETE` | `/containers/:id` | JWT | Supprimer |
| `GET` | `/containers/:id/fill-history` | — | Historique de remplissage |
| `POST` | `/containers/:id/fill-history` | JWT | Ajouter un niveau de remplissage |
| `POST` | `/containers/:id/photo` | JWT | Upload photo (multipart/form-data) |

### Zones géographiques

| Méthode | Route | Auth | Description |
|---------|-------|:----:|-------------|
| `GET` | `/zones` | — | Lister toutes les zones (avec stats) |
| `GET` | `/zones/stats` | — | Statistiques globales toutes zones |
| `GET` | `/zones/choropleth` | — | GeoJSON choroplèthe (taux de remplissage) |
| `GET` | `/zones/export/geojson` | — | Exporter toutes les zones en GeoJSON |
| `POST` | `/zones/import/geojson` | JWT | Importer zones depuis GeoJSON |
| `GET` | `/zones/export/shapefile` | — | Exporter en Shapefile (.zip) |
| `POST` | `/zones/import/shapefile` | JWT | Importer depuis Shapefile (.zip) |
| `GET` | `/zones/:id` | — | Détail zone + conteneurs + stats |
| `POST` | `/zones` | JWT | Créer une zone |
| `PUT` | `/zones/:id` | JWT | Mettre à jour |
| `DELETE` | `/zones/:id` | JWT | Supprimer (conteneurs → zoneId=null) |
| `GET` | `/zones/:id/stats` | — | Statistiques d'une zone |
| `GET` | `/zones/:id/containers` | — | Conteneurs de la zone |
| `PATCH` | `/zones/:id/containers/assign` | JWT | Assigner des conteneurs |
| `PATCH` | `/zones/:id/containers/remove` | JWT | Retirer des conteneurs |

---

## Exemples de requêtes

### Créer un conteneur

```json
POST /containers
{
  "type": "plastique",
  "status": "normal",
  "zoneId": "ZD-PLAT",
  "capacity": 240,
  "fillLevel": 0,
  "latitude": 14.6937,
  "longitude": -17.4441
}
```

### Créer une zone

```json
POST /zones
{
  "id": "ZD-PLAT",
  "name": "Zone Plateau",
  "city": "Dakar",
  "district": "Plateau",
  "latitude": 14.6937,
  "longitude": -17.4441,
  "polygon": {
    "type": "Polygon",
    "coordinates": [[
      [-17.45, 14.69], [-17.43, 14.69],
      [-17.43, 14.70], [-17.45, 14.70],
      [-17.45, 14.69]
    ]]
  }
}
```

### Assigner des conteneurs à une zone

```json
PATCH /zones/ZD-PLAT/containers/assign
{
  "containerIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ]
}
```

---

## Authentification

Tous les endpoints de modification (POST, PUT, PATCH, DELETE) requièrent un token JWT :

```http
Authorization: Bearer <token>
```

Le token s'obtient via le service-users (`POST /auth/login`).

---

## WebSocket (Socket.IO)

Connexion sur le même port que HTTP.

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `subscribe_container` | client → serveur | Rejoindre la room d'un conteneur |
| `fill_level_updated` | serveur → client | Niveau de remplissage modifié |
| `critical_alert` | serveur → client | Alerte niveau ≥ 85% |

---

## Événements Kafka publiés

| Topic | Déclencheur |
|-------|-------------|
| `container-created` | Création d'un conteneur |
| `container-updated` | Mise à jour |
| `container-deleted` | Suppression |
| `container-fill-level` | Nouveau niveau de remplissage |
| `container-status-changed` | Changement de statut |
| `zone-created` | Création d'une zone |
| `zone-updated` | Mise à jour d'une zone |
| `zone-deleted` | Suppression d'une zone |
| `zone-containers-assigned` | Assignation de conteneurs à une zone |

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrage développement (nodemon) |
| `npm run seed:100` | Seed 100 conteneurs + 12 zones |
| `npm run seed:1000` | Seed 1 000 conteneurs |
| `npm run seed:10000` | Seed 10 000 conteneurs |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Appliquer les migrations |
| `npm run pm2:start` | Démarrer avec PM2 |
| `npm run pm2:restart` | Redémarrer avec PM2 |
| `npm run pm2:logs` | Voir les logs PM2 |
