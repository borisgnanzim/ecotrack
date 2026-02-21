# Structure du API Gateway

## Architecture MVC

Le gateway suit une architecture **MVC (Model-View-Controller)** combinée avec le pattern **Service** pour une séparation claire des responsabilités.

```
service-api-gateway/
├── src/
│   ├── config/
│   │   └── proxy.config.js          # Configuration des proxies et services
│   ├── controllers/
│   │   ├── health.controller.js     # Logique pour health checks
│   │   └── documentation.controller.js  # Logique pour documentation
│   ├── services/
│   │   └── gateway.service.js       # Orchestration et logique métier
│   ├── middlewares/
│   │   ├── rate-limit.middleware.js # Rate limiting global
│   │   └── error.middleware.js      # Gestion centralisée des erreurs
│   └── routes/
│       ├── index.js                 # Router principal
│       ├── health.routes.js         # Routes de santé
│       ├── documentation.routes.js  # Routes de documentation
│       └── proxy.routes.js          # Routes proxy vers microservices
├── app.js                           # Application principale (minimal)
├── server.js                        # Serveur (écoute sur le port)
├── swagger.js                       # Configuration Swagger/OpenAPI
├── ecosystem.config.js              # Configuration PM2
└── package.json                     # Dépendances
```

## Flux de Requête

```
Requête HTTP
    ↓
app.js (middleware global: json, urlencoded, swagger, rate limiting)
    ↓
routes/index.js (routeur principal)
    ↓
┌─────────────────────────────────────────────┐
│ Sélection de la route appropriée            │
├─────────────────────────────────────────────┤
│ health.routes.js  → health.controller.js    │
│                   → gateway.service.js      │
│                                             │
│ documentation.routes.js → documentation.controller.js
│                        → gateway.service.js │
│                                             │
│ proxy.routes.js → http-proxy-middleware    │
│               (forward vers service microservice)
└─────────────────────────────────────────────┘
    ↓
Response au client
```

## Description des Couches

### 1. Routes (src/routes/)
Les fichiers de routes définissent les endpoints HTTP et les mappent à des contrôleurs ou des middlewares.

**Fichiers** :
- `index.js` : Combine toutes les routes
- `health.routes.js` : `/health` et `/stats`
- `documentation.routes.js` : `/` et `/services`
- `proxy.routes.js` : `/auth`, `/users`, `/notifications`, `/containers` (proxy)

### 2. Contrôleurs (src/controllers/)
Les contrôleurs gèrent la logique de requête/réponse HTTP.

**Fichiers** :
- `health.controller.js` : Gestion des health checks et stats
- `documentation.controller.js` : Infos du gateway et services

### 3. Services (src/services/)
Les services contiennent la logique métier et l'orchestration.

**Fichiers** :
- `gateway.service.js` : 
  - `getGatewayInfo()` - Infos complètes du gateway
  - `getServicesInfo()` - Liste des services
  - `getHealthStatus()` - État du gateway
  - `getStats()` - Statistiques

### 4. Configuration (src/config/)
Les fichiers de configuration centralisent les paramètres importants.

**Fichiers** :
- `proxy.config.js` : URLs et routes des microservices

### 5. Middlewares (src/middlewares/)
Les middlewares appliquent des transformations ou des vérifications.

**Fichiers** :
- `rate-limit.middleware.js` : Limitation du nombre de requêtes
- `error.middleware.js` : Gestion centralisée des erreurs (500, 404, 503, etc.)

## Endpoints Disponibles

### Health & Monitoring
- `GET /` - Infos du gateway
- `GET /health` - État du gateway
- `GET /services` - Liste des services
- `GET /stats` - Statistiques
- `GET /api-docs` - Documentation Swagger

### Authentification (proxy → service-users)
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`

### Utilisateurs (proxy → service-users)
- `GET /users/profile`
- `PUT /users/profile`
- `POST /users/profile/avatar`

### Notifications (proxy → service-users)
- `GET /notifications`
- `GET /notifications/:id`
- `PUT /notifications/:id/read`

### Conteneurs (proxy → service-containers)
- `GET /containers`
- `POST /containers`
- `GET /containers/:id`
- `PUT /containers/:id`
- `DELETE /containers/:id`
- `GET /containers/:id/history`

## Comment Ajouter une Nouvelle Route

### Exemple : Ajouter une route `/info`

1. **Créer un contrôleur** (`src/controllers/info.controller.js`) :
```javascript
class InfoController {
  getInfo(req, res) {
    res.json({ info: 'Mon information' });
  }
}
module.exports = new InfoController();
```

2. **Créer une route** (`src/routes/info.routes.js`) :
```javascript
const express = require('express');
const router = express.Router();
const infoController = require('../controllers/info.controller');

router.get('/info', infoController.getInfo.bind(infoController));

module.exports = router;
```

3. **Ajouter à l'index des routes** (`src/routes/index.js`) :
```javascript
const infoRoutes = require('./info.routes');
router.use(infoRoutes);
```

## Avantages de cette Structure

✅ **Séparation des responsabilités** - Chaque couche a une fonction claire  
✅ **Maintenabilité** - Code organisé et facile à naviguer  
✅ **Réutilisabilité** - Services et contrôleurs partagés  
✅ **Testabilité** - Chaque couche peut être testée indépendamment  
✅ **Scalabilité** - Facile d'ajouter de nouvelles routes/services  
✅ **Cohérence** - Même pattern pour tout le projet  

## Configuration des Services Proxy

Modifier `src/config/proxy.config.js` pour ajouter de nouveaux services :

```javascript
const PROXY_CONFIG = {
  newService: {
    url: process.env.NEW_SERVICE_URL || 'http://localhost:3003',
    description: 'Description du service',
    routes: ['/newservice']
  }
};
```

Puis ajouter le proxy dans `src/routes/proxy.routes.js` :

```javascript
router.use('/newservice', createProxyMiddleware({
  target: PROXY_CONFIG.newService.url,
  changeOrigin: true
}));
```

## Démarrage

```bash
# Développement
npm run dev

# Production
npm run pm2:start:prod

# Tests
./test-gateway.ps1  # Windows
./test-gateway.sh   # Linux/Mac
```