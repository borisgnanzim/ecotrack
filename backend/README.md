# EcoTrack Backend - Spécifications API

Document technique à destination des développeurs frontend.

---

## Architecture

```
┌─────────────────────────────┐
│   Frontend (Next.js)        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   API Gateway (Port 3010)   │
└──────────────┬──────────────┘
               │
       ┌───────┼───────┬───────────┐
       │       │       │           │
       ▼       ▼       ▼           ▼
   /auth    /users  /containers  /notifications
   (3011)   (3011)    (3012)       (3011)
```

### Ports des Services

| Service | Port | URL Base | Description |
|---------|------|-----------|-------------|
| API Gateway | 3010 | `http://localhost:3010` | Point d'entrée unique, proxy, rate limiting |
| service-users | 3011 | `http://localhost:3011` | Auth, utilisateurs, notifications |
| service-containers | 3012 | `http://localhost:3012` | Gestion conteneurs, WebSocket temps réel |
| service-routes | 3013 | `http://localhost:3013` | Planification tournées, optimisation |
| service-analytics | 3014 | `http://localhost:3014` | Tableaux de bord, rapports, exports |

---

## Vue d'Ensemble des Microservices

EcoTrack utilise une architecture microservices avec **5 services distincts** communiquant via l'API Gateway. Chaque service est autonome, déployable indépendamment et utilise PM2 pour le clustering en production.

### Stack Technique Commune

- **Runtime** : Node.js 18+
- **Framework** : Express.js 5
- **Base de données** : PostgreSQL avec Prisma ORM
- **Communication** : REST API + Kafka pour l'événementiel
- **Documentation** : Swagger/OpenAPI

---

## 1. Service API Gateway (Port 3010)

### Description
Point d'entrée unique pour toutes les requêtes API. Gère le routage, le rate limiting, et la mise en cache.

### Fonctionnalités
- **Proxy** : Routage vers les services internes
- **Rate Limiting** : 100 requêtes/IP/15min (configurable)
- **Cache Redis** : Mise en cache des réponses fréquentes
- **Sécurité** : Helmet, headers de sécurité
- **Documentation** : Swagger UI intégré

### Dépendances Principales
```json
"express": "^5.2.1",
"http-proxy-middleware": "^2.0.9",
"express-rate-limit": "^8.2.1",
"ioredis": "^5.9.3",
"helmet": "^8.1.0"
```

### Scripts
- `npm run dev` - Mode développement
- `npm run pm2:start` - Démarrage PM2
- `npm run pm2:logs` - Logs PM2

---

## 2. Service Users (Port 3011)

### Description
Gestion complète des utilisateurs, authentification JWT, et notifications.

### Fonctionnalités
- **Authentification** : Inscription, connexion, déconnexion (JWT)
- **Gestion Profils** : CRUD utilisateurs avec rôles (citoyen/admin)
- **Notifications** : Stockage local ou delegation HTTP externe
- **Upload Avatars** : Redimensionnement automatique (256x256 WebP via Sharp)
- **Kafka** : Production/consommation de messages pour événements utilisateur

### Dépendances Principales
```json
"@prisma/client": "^5.22.0",
"bcryptjs": "^3.0.3",
"jsonwebtoken": "^9.0.3",
"sharp": "^0.32.1",
"multer": "^1.4.5-lts.1",
"kafkajs": "^2.2.4"
```

### Structure
```
src/
├── config/          # Configuration
├── controllers/     # Logique métier
├── database/        # Connexion Prisma
├── dto/             # Data Transfer Objects
├── middleware/      # Auth, validation
├── models/         # Modèles Prisma wrapper
├── routes/         # Définitions endpoints
├── services/       # Services métier
└── seeders/        # Données initiales
```

### Endpoints Principaux
| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Inscription utilisateur |
| POST | `/auth/login` | Connexion JWT |
| GET | `/auth/me` | Infos utilisateur connecté |
| GET | `/users/profile` | Profil utilisateur |
| PUT | `/users/profile` | Modifier profil |
| POST | `/users/profile/avatar` | Upload avatar |
| GET | `/notifications` | Liste notifications |
| PUT | `/notifications/:id/read` | Marquer comme lu |

---

## 3. Service Containers (Port 3012)

### Description
Gestion des conteneurs de déchets intelligents avec géolocalisation et suivi temps réel.

### Fonctionnalités
- **CRUD Conteneurs** : Création, lecture, mise à jour, suppression
- **Géolocalisation** : PostgreSQL avec extensions `cube` et `earthdistance`
- **Historique Remplissage** : Suivi du niveau de remplissage
- **Statistiques** : Stats globales et par zone
- **Recherche** : Recherche flexible avec filtres
- **Proximité** : Conteneurs à proximité (rayon configurable)
- **WebSocket** : Socket.IO pour notifications temps réel
- **Upload Photo** : Photos des conteneurs via Multer

### Dépendances Principales
```json
"@prisma/client": "^6.19.2",
"socket.io": "^4.8.3",
"zod": "^4.3.6",
"helmet": "^8.1.0",
"kafkajs": "^2.2.4"
```

### Structure
```
src/
├── app.js              # Configuration Express
├── server.js           # Bootstrap HTTP + Socket.IO
├── routes/             # Endpoints
├── controllers/        # Logique métier
├── services/           # Services (Container, FillHistory)
├── repositories/       # Accès Prisma
├── middlewares/        # Auth, validation, erreur
├── sockets/            # Socket.IO helpers
├── dtos/               # Data Transfer Objects
└── prisma/             # Client Prisma
```

### Endpoints Principaux
| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/containers` | Liste tous conteneurs |
| GET | `/containers/:id` | Détails conteneur |
| POST | `/containers` | Créer conteneur (admin) |
| PUT | `/containers/:id` | Modifier conteneur (admin) |
| DELETE | `/containers/:id` | Supprimer conteneur (admin) |
| GET | `/containers/stats` | Statistiques globales |
| GET | `/containers/search` | Recherche flexible |
| GET | `/containers/nearby` | Conteneurs à proximité |
| POST | `/containers/:id/fill-history` | Ajouter niveau remplissage |
| GET | `/containers/:id/fill-history` | Historique remplissage |

### WebSocket Events
- `subscribe_container` - Rejoindre room d'un conteneur
- `fill_level_updated` - Niveau modifié
- `critical_alert` - Alerte niveau ≥ 85%

---

## 4. Service Routes (Port 3013)

### Description
Planification et optimisation des tournées de collecte. Intégration Kafka pour la gestion des événements.

### Fonctionnalités
- **Planification Tournées** : Création et gestion des itinéraires
- **Optimisation** : Algorithmes d'optimisation des parcours
- **Assignation** : Attribution des tournées aux véhicules
- **Suivi** : Statut des tournées en temps réel
- **Kafka** : Production et consommation de messages

### Dépendances Principales
```json
"@prisma/client": "^6.19.2",
"express": "^5.2.1",
"kafkajs": "^2.2.4",
"body-parser": "^2.2.2",
"swagger-jsdoc": "^6.2.8"
```

### Structure
```
src/
├── app.js              # Configuration Express
├── server.js           # Serveur principal
├── verifyRoutes.js     # Vérification des routes
├── config/            # Configuration
├── controllers/        # Logique métier
├── middlewares/        # Middlewares Express
├── routes/             # Définitions endpoints
├── services/          # Services métier
└── swagger/           # Documentation API
```

### Endpoints Principaux
| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | Liste des tournées |
| GET | `/routes/:id` | Détails d'une tournée |
| POST | `/routes` | Créer une tournée |
| PUT | `/routes/:id` | Modifier une tournée |
| GET | `/routes/optimize` | Optimiser un itinéraire |

---

## 5. Service Analytics (Port 3014)

### Description
Tableaux de bord, rapports et exports de données. Génération de documents PDF et Excel.

### Fonctionnalités
- **Tableaux de Bord** : Visualisation des métriques clés
- **Rapports** : Génération de rapports périodiques
- **Export** : PDF, Excel, CSV
- **Planification** : Tâches cron pour rapports automatisés
- **Kafka** : Consommation d'événements pour analytics

### Dépendances Principales
```json
"@prisma/client": "^5.22.0",
"pdfkit": "^0.15.0",
"exceljs": "^4.4.0",
"json2csv": "^6.0.0-alpha.2",
"node-cron": "^3.0.3",
"helmet": "^8.1.0"
```

### Structure
```
src/
├── config/            # Configuration
├── controllers/       # Logique métier
├── middlewares/       # Middlewares Express
├── routes/           # Définitions endpoints
├── services/         # Services analytiques
└── utils/            # Utilitaires
```

### Endpoints Principaux
| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Données tableau de bord |
| GET | `/analytics/reports` | Liste des rapports |
| POST | `/analytics/reports/generate` | Générer un rapport |
| GET | `/analytics/export/pdf` | Export PDF |
| GET | `/analytics/export/excel` | Export Excel |
| GET | `/analytics/export/csv` | Export CSV |

---

## Points d'Entrée

### URL de Base
```
http://localhost:3010
```

### Documentation Swagger
```
http://localhost:3010/api-docs
```

---

## Endpoints API (Par domaine)

### 1. Authentification (`/auth`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| POST | `/auth/register` | Créer un compte | ❌ |
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/logout` | Déconnexion | ✅ |
| GET | `/auth/me` | Infos utilisateur connecté | ✅ |

---

### 2. Utilisateurs (`/users`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| GET | `/users/profile` | Profil utilisateur | ✅ |
| PUT | `/users/profile` | Modifier profil | ✅ |
| POST | `/users/profile/avatar` | Uploader avatar | ✅ |

---

### 3. Conteneurs (`/containers`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| GET | `/containers` | Liste tous les conteneurs | ❌ |
| GET | `/containers/:id` | Détails d'un conteneur | ❌ |
| POST | `/containers` | Créer un conteneur | ✅ (admin) |
| PUT | `/containers/:id` | Modifier un conteneur | ✅ (admin) |
| DELETE | `/containers/:id` | Supprimer un conteneur | ✅ (admin) |
| GET | `/containers/:id/history` | Historique remplissage | ❌ |
| GET | `/containers/stats` | Statistiques | ❌ |
| GET | `/containers/search` | Rechercher conteneurs | ❌ |
| GET | `/containers/nearby` | Conteneurs à proximité | ❌ |

---

### 4. Notifications (`/notifications`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| GET | `/notifications` | Liste notifications | ✅ |
| GET | `/notifications/:id` | Détails notification | ✅ |
| PUT | `/notifications/:id/read` | Marquer comme lu | ✅ |

---

### 5. Tournées (`/routes`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| GET | `/routes` | Liste des tournées | ❌ |
| GET | `/routes/:id` | Détails d'une tournée | ❌ |
| POST | `/routes` | Créer une tournée | ✅ |
| PUT | `/routes/:id` | Modifier une tournée | ✅ |
| DELETE | `/routes/:id` | Supprimer une tournée | ✅ |

---

### 6. Analytics (`/analytics`)

| Méthode | Endpoint | Description | Auth |
|--------|----------|-------------|-----|
| GET | `/analytics/dashboard` | Tableau de bord | ❌ |
| GET | `/analytics/reports` | Liste rapports | ❌ |
| POST | `/analytics/reports/generate` | Générer rapport | ✅ |
| GET | `/analytics/export/:format` | Export données | ❌ |

---

## Format des Requêtes

### Header Authentification
```http
Authorization: Bearer <token_jwt>
```

### Content-Type
```http
Content-Type: application/json
```

---

## Format des Réponses

### Succès (200, 201)
```json
{
  "data": { ... },
  "message": "Opération réussie"
}
```

### Erreur Validation (400)
```json
{
  "error": "Données invalides",
  "details": [
    { "field": "email", "message": "Email invalide" }
  ]
}
```

### Erreur Auth (401)
```json
{
  "error": "Non autorisé",
  "message": "Token JWT requis"
}
```

### Erreur Forbidden (403)
```json
{
  "error": "Interdit",
  "message": "Accès refusé pour ce rôle"
}
```

### Erreur Not Found (404)
```json
{
  "error": "Non trouvé",
  "message": "Ressource introuvable"
}
```

### Erreur Serveur (500)
```json
{
  "error": "Erreur interne",
  "message": "Une erreur est survenue"
}
```

---

## Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Mauvaise requête |
| 401 | Non authentifié |
| 403 | Interdit |
| 404 | Non trouvé |
| 409 | Conflit (doublon) |
| 500 | Erreur serveur |

---

## Rôles Utilisateurs

| Rôle | Description |
|------|-------------|
| `citizen` | Utilisateur standard |
| `moderator` | Modérateur |
| `admin` | Administrateur |

---

## Exemples de Requêtes

### Connexion
```bash
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Liste conteneurs (avec pagination)
```bash
curl "http://localhost:3010/containers?page=1&limit=20"
```

### Détails conteneur
```bash
curl http://localhost:3010/containers/1
```

### Requête authentifiée
```bash
curl http://localhost:3010/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Variables d'Environnement

```env
# API Gateway
PORT=3010

# Services
USERS_SERVICE_URL=http://localhost:3011
CONTAINERS_SERVICE_URL=http://localhost:3012
ROUTES_SERVICE_URL=http://localhost:3013
ANALYTICS_SERVICE_URL=http://localhost:3014

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=1h

# Kafka
KAFKA_BROKERS=localhost:19092
```

---

## Démarrage

```bash
# Lancer un service
cd backend/service-api-gateway
npm install
npm run dev
```

---

## Ressources

- [Swagger UI](http://localhost:3010/api-docs) - Documentation interactive
- [Architecture](./service-api-gateway/ARCHITECTURE.md) - Détails techniques