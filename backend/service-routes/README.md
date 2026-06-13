# EcoTrack — Service Routes

Microservice de gestion et d'optimisation des tournées de collecte.
Réduit la distance parcourue de **~20%** grâce aux algorithmes TSP (Nearest Neighbor + 2-opt).

---

## Sommaire

- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Endpoints API](#endpoints-api)
- [Authentification](#authentification)
- [Transitions de statut](#transitions-de-statut)
- [Algorithme d'optimisation](#algorithme-doptimisation)
- [Export PDF & Email](#export-pdf--email)
- [Kafka](#kafka)
- [Structure du projet](#structure-du-projet)

---

## Architecture

```
API Gateway (3010)
       │
       ▼
Service Routes (3013)
       │
       ├── PostgreSQL (routes_db)
       ├── Kafka (events)
       └── SMTP (emails PDF)
```

**Stack :**

| Outil | Rôle |
|---|---|
| Express.js 5 | Serveur HTTP |
| Prisma ORM | Accès base de données |
| PostgreSQL | Persistance |
| Zod | Validation des entrées |
| KafkaJS | Événements inter-services |
| PDFKit | Génération de feuilles de route PDF |
| Nodemailer | Envoi email aux agents |
| JWT | Authentification |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# → Éditer .env avec vos valeurs

# 3. Appliquer le schéma en base
npx prisma migrate dev --name init

# 4. Seeder des données de test
npm run seed

# 5. Démarrer le service
npm run dev        # développement (nodemon)
npm start          # production
```

Le service démarre sur **http://localhost:3013**
Documentation Swagger : **http://localhost:3013/docs**

---

## Variables d'environnement

| Variable | Exemple | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5433/routes_db` | URL PostgreSQL |
| `PORT` | `3013` | Port du service |
| `NODE_ENV` | `development` | Environnement |
| `JWT_SECRET` | `jwt-secret` | Secret JWT — **doit correspondre au gateway** |
| `KAFKA_BROKERS` | `localhost:19092` | Adresse(s) Kafka |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | Origines CORS |
| `SMTP_HOST` | `smtp.gmail.com` | Serveur SMTP |
| `SMTP_PORT` | `587` | Port SMTP |
| `SMTP_USER` | `vous@gmail.com` | Adresse email expéditeur |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | Mot de passe d'application Gmail |

---

## Endpoints API

Tous les endpoints requièrent un header `Authorization: Bearer <token>`.

### Tournées (CRUD)

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/routes` | Tous | Lister toutes les tournées |
| `GET` | `/routes/:id` | Tous | Détail d'une tournée |
| `POST` | `/routes` | admin, manager | Créer une tournée |
| `PUT` | `/routes/:id` | admin, manager | Modifier une tournée |
| `DELETE` | `/routes/:id` | admin, manager | Supprimer une tournée |

### Agents

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/routes/agent/:agentId` | Tous | Tournées d'un agent |
| `PUT` | `/routes/:id/assign` | admin, manager | Assigner un agent |

### Optimisation & Validation

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/routes/:id/optimize` | admin, manager | Optimisation TSP + conteneurs critiques |
| `POST` | `/routes/:id/validate` | admin, manager | Vérifier les règles métier |

### Visualisation & Export

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/routes/:id/map` | Tous | Données GeoJSON pour carte |
| `GET` | `/routes/:id/export` | Tous | Télécharger la feuille de route en PDF |
| `POST` | `/routes/:id/send` | admin, manager | Envoyer le PDF par email à l'agent |

---

## Authentification

Le service valide le JWT en double couche :
1. **Gateway** (port 3010) — première validation
2. **Service Routes** (port 3013) — re-validation avec le même secret

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Générer un token de test :**
```bash
cd ../service-api-gateway
node -e "
  const jwt = require('jsonwebtoken');
  console.log(jwt.sign({ id: 'u1', role: 'admin' }, 'jwt-secret', { expiresIn: '24h' }));
"
```

---

## Transitions de statut

Les changements de statut sont contraints — une route ne peut pas sauter d'étape :

```
planned ──→ in_progress ──→ completed
   │               │
   └──→ cancelled  └──→ cancelled
```

| De | Vers | Autorisé |
|---|---|---|
| `planned` | `in_progress` | ✅ |
| `planned` | `cancelled` | ✅ |
| `planned` | `completed` | ❌ 422 |
| `in_progress` | `completed` | ✅ |
| `in_progress` | `cancelled` | ✅ |
| `in_progress` | `planned` | ❌ 422 |
| `completed` | tout | ❌ 422 |
| `cancelled` | tout | ❌ 422 |

Le `startTime` est enregistré automatiquement lors du passage à `in_progress`.
Le `endTime` est enregistré automatiquement lors du passage à `completed`.

---

## Algorithme d'optimisation

`POST /routes/:id/optimize`

**Étapes :**
1. Récupération des conteneurs de la route
2. Ajout automatique des conteneurs critiques (`fillLevel > 80%`)
3. **Nearest Neighbor** — construction d'un itinéraire initial
4. **2-opt** — amélioration par échange d'arêtes jusqu'à convergence
5. Recalcul des étapes, distances et temps estimés

**Réponse :**
```json
{
  "route": { ... },
  "distance_before_km": 32.74,
  "distance_after_km": 26.18,
  "distance_saved_km": 6.56,
  "distance_saved_pct": 20.0,
  "critical_containers_added": true,
  "added_critical_containers": ["uuid-conteneur-1"]
}
```

**Calcul du temps :** 5 min par conteneur + temps de trajet (vitesse moyenne 30 km/h).

---

## Export PDF & Email

### Télécharger le PDF
```bash
GET /routes/:id/export
Authorization: Bearer <token>
# → Retourne un fichier PDF
```

### Envoyer par email à l'agent
```bash
POST /routes/:id/send
Authorization: Bearer <token>
```

L'agent doit être assigné à la route. Si `SMTP_USER`/`SMTP_PASS` ne sont pas configurés, l'endpoint répond sans erreur :
```json
{ "sent": false, "reason": "SMTP non configuré" }
```

**Configuration Gmail :**
1. Activer la validation en 2 étapes sur le compte Google
2. Aller sur **myaccount.google.com/apppasswords**
3. Créer un mot de passe pour `EcoTrack`
4. Renseigner dans `.env` : `SMTP_PASS=xxxxxxxxxxxxxxxxxxxx`

---

## Kafka

### Topics publiés

| Topic | Déclencheur |
|---|---|
| `route-created` | `POST /routes` |
| `route-updated` | `PUT /routes/:id` |
| `route-completed` | Passage au statut `completed` |
| `route-deleted` | `DELETE /routes/:id` |

### Topics écoutés

| Topic | Action |
|---|---|
| `container-fill-level` | Crée une route automatique si `fillLevel > 75%` |
| `container-status-changed` | Retire un conteneur défectueux des routes planifiées |
| `user-created` | Assigne les routes sans agent au nouveau collecteur |

---

## Structure du projet

```
service-routes/
├── prisma/
│   ├── schema.prisma          # Modèles Route, RouteStep, Container, User
│   └── seed.js                # 5 agents, 20 conteneurs, 100 routes de test
└── src/
    ├── config/
    │   └── prisma.js          # Client Prisma
    ├── constants/
    │   └── route.constants.js # ROUTE_STATUS, WRITE_ROLES, VALID_TRANSITIONS
    ├── controllers/
    │   └── route.controller.js # Thin controllers (HTTP in/out uniquement)
    ├── dtos/
    │   └── route.dto.js       # Schémas Zod (Create / Update / Assign)
    ├── kafka/
    │   ├── init.js
    │   ├── kafkaClient.js
    │   ├── topics.js
    │   ├── publishers/
    │   │   └── route.publisher.js
    │   └── subscribers/
    │       └── route.subscriber.js
    ├── middlewares/
    │   ├── authMiddleware.js      # Validation JWT
    │   ├── validate.middleware.js # Validation Zod générique
    │   └── errorHandler.js
    ├── repositories/
    │   └── route.repository.js  # Toutes les requêtes Prisma
    ├── routes/
    │   └── routes.js            # Définition endpoints + JSDoc Swagger
    ├── services/
    │   ├── route.service.js     # Logique métier
    │   ├── optimizer.service.js # Algorithmes TSP (Nearest Neighbor + 2-opt)
    │   ├── pdf.service.js       # Génération PDF avec PDFKit
    │   └── email.service.js     # Envoi email avec Nodemailer
    ├── swagger/
    │   └── swagger.js           # Configuration OpenAPI 3.0
    ├── app.js
    └── server.js
```

---

## Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer avec rechargement automatique (nodemon)
npm run seed       # Remplir la base avec des données de test
npx prisma studio  # Interface graphique pour la base de données
npx prisma migrate dev --name <nom>  # Créer une migration
```
