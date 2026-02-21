# API Gateway - Restructuration MVC

## Refactorisation Complétée

Le **API Gateway** a été restructuré avec une **architecture MVC professionnelle**, séparant clairement les responsabilités en couches : routes, contrôleurs, services, et middlewares.

---

## Nouvelle Structure

```
service-api-gateway/
├── src/
│   ├── config/
│   │   └── proxy.config.js              ← Configuration des services
│   ├── controllers/
│   │   ├── health.controller.js         ← Logique health checks
│   │   └── documentation.controller.js  ← Logique documentation
│   ├── services/
│   │   └── gateway.service.js           ← Orchestration & logique métier
│   ├── middlewares/
│   │   ├── rate-limit.middleware.js     ← Rate limiting
│   │   └── error.middleware.js          ← Gestion erreurs centralisée
│   └── routes/
│       ├── index.js                     ← Combinaison de toutes les routes
│       ├── health.routes.js             ← Routes health & stats
│       ├── documentation.routes.js      ← Routes infos gateway
│       └── proxy.routes.js              ← Routes proxy vers microservices
├── app.js                               ← Application (épurée)
├── server.js                            ← Serveur
├── swagger.js                           ← Swagger/OpenAPI
├── ARCHITECTURE.md                      ← Guide architectural
└── ecosystem.config.js                  ← Config PM2
```

---

## Avantages de la Restructuration

| Aspect | Avant | Après |
|--------|-------|-------|
| **app.js** | 153 lignes (monolithe) | 34 lignes (léger) |
| **Organisation** | Tout dans app.js | Séparation claire (routes, controllers, services) |
| **Maintenabilité** | Difficile de naviguer | Facile et intuitive |
| **Testabilité** | Complexe | Chaque couche testable indépendamment |
| **Réutilisabilité** | Services dispersés | Services centralisés et réutilisables |
| **Évolutivité** | Dépendances cachées | Dépendances explicites |

---

## 📚 Description des Fichiers Créés

### 1. `src/config/proxy.config.js`
Configuration centralisée des microservices à proxifier.

```javascript
const PROXY_CONFIG = {
  users: { url, description, routes },
  containers: { url, description, routes }
};
```

**Utilité** : Facile à étendre pour ajouter de nouveaux services.

### 2. `src/services/gateway.service.js`
Service d'orchestration du gateway contenant la logique métier.

**Méthodes** :
- `getGatewayInfo()` - Infos complètes du gateway
- `getServicesInfo()` - Liste détaillée des services
- `getHealthStatus()` - État opérationnel
- `getStats()` - Métriques de performance

### 3. `src/controllers/health.controller.js`
Contrôleur pour les health checks.

**Endpoints** :
- `GET /health` - État du gateway
- `GET /stats` - Statistiques

### 4. `src/controllers/documentation.controller.js`
Contrôleur pour la documentation du gateway.

**Endpoints** :
- `GET /` - Infos du gateway
- `GET /services` - Liste des services

### 5. `src/middlewares/rate-limit.middleware.js`
Rate limiting global (100 req/15min par IP).

- Exclut `/health` et `/api-docs` du limitation
- Configuration Export flexible `applyRateLimit()`

### 6. `src/middlewares/error.middleware.js`
Gestion centralisée des erreurs HTTP.

- Erreurs de proxy (503, 504)
- Erreurs 404 pour routes inconnues
- Logging structuré

### 7. `src/routes/health.routes.js`
Routes pour health checks et statistiques.

```
GET /health   → healthController.getHealth()
GET /stats    → healthController.getStats()
```

### 8. `src/routes/documentation.routes.js`
Routes pour documentation du gateway.

```
GET /          → documentationController.getGatewayInfo()
GET /services  → documentationController.getServices()
```

### 9. `src/routes/proxy.routes.js`
Routes proxy vers tous les microservices.

```
/auth          → forward vers service-users
/users         → forward vers service-users
/notifications → forward vers service-users
/containers    → forward vers service-containers
```

### 10. `src/routes/index.js`
Combinaison de toutes les routes en un seul router.

---

## 🔄 Flux de Requête

```
Requête HTTP
    ↓
app.js (middlewares globaux)
    ├── express.json()
    ├── swagger ui (/api-docs)
    ├── rate limiting
    └── routes
         ↓
routes/index.js (dispatcher)
    ├── health.routes.js
    │   ├── GET /health    → health.controller → gateway.service
    │   └── GET /stats     → health.controller → gateway.service
    ├── documentation.routes.js
    │   ├── GET /          → documentation.controller → gateway.service
    │   └── GET /services  → documentation.controller → gateway.service
    └── proxy.routes.js
        ├── /auth          → http-proxy-middleware → service-users
        ├── /users         → http-proxy-middleware → service-users
        ├── /notifications → http-proxy-middleware → service-users
        └── /containers    → http-proxy-middleware → service-containers
```

---

## Démarrage

### Mode Développement
```bash
npm run dev        # avec nodemon
# ou
node server.js     # direct
```

### Mode Production
```bash
npm run pm2:start:prod
```

### Vérifier que ça fonctionne
```bash
curl http://localhost:3010/health
curl http://localhost:3010/
curl http://localhost:3010/api-docs  # Swagger
```

---

## 📝 Comment Ajouter une Nouvelle Route

### Exemple : Ajouter `/newroute`

**1. Créer un contrôleur** (`src/controllers/new.controller.js`) :
```javascript
class NewController {
  getNew(req, res) {
    res.json({ data: 'Mon contenu' });
  }
}
module.exports = new NewController();
```

**2. Créer une route** (`src/routes/new.routes.js`) :
```javascript
const express = require('express');
const newController = require('../controllers/new.controller');
const router = express.Router();

router.get('/newroute', newController.getNew.bind(newController));

module.exports = router;
```

**3. Ajouter à index.js** :
```javascript
const newRoutes = require('./new.routes');
router.use(newRoutes);
```

---

## Test des Endpoints

### Route Racine
```bash
curl http://localhost:3010
# Retourne les infos du gateway et services disponibles
```

### Health Check
```bash
curl http://localhost:3010/health
# Retourne : { status, timestamp, uptime, environment, proxies }
```

### Services
```bash
curl http://localhost:3010/services
# Retourne la liste complète des services avec URLs
```

### Stats
```bash
curl http://localhost:3010/stats
# Retourne : { timestamp, uptime, memory, servicedProxies }
```

### Proxy Test (Authentification)
```bash
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123"}'
# Forward automatiquement vers service-users
```

---

## Comparaison Avant/Après

### Avant (Monolithe)
```javascript
// app.js - 153 lignes !
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

app.get('/health', (req, res) => { ... });
app.use('/auth', createProxyMiddleware({ ... }));
app.use('/users', createProxyMiddleware({ ... }));
// ... duplique partout l'erreur handling, logs, etc.
```

### Après (MVC)
```javascript
// app.js - 34 lignes !
const routes = require('./src/routes');
const { applyRateLimit } = require('./src/middlewares/rate-limit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');

app.use(applyRateLimit);      // Simple !
app.use(routes);               // Simple !
app.use(errorHandler);         // Simple !
```

---

## Sécurité

- Rate limiting (100 req/15min par IP)
- Error handling centralisé (pas de data sensible exposée)
- Validation des proxies avec gestion des erreurs 503/504
- Logging structuré des erreurs

---

## Documentation Supplémentaire

Consultez [ARCHITECTURE.md](./ARCHITECTURE.md) pour :
- Diagramme détaillé du flux
- Comment ajouter de nouveaux services
- Description complète de chaque couche
- Patterns et bonnes pratiques

---

## Points Clés

1. **app.js épuré** - Contient juste l'orchestration, pas de logique métier
2. **Services centralisés** - `gateway.service.js` contient toute la logique réutilisable
3. **Contrôleurs simples** - Juste du mapping requête → réponse
4. **Routes déclaratives** - Clair et lisible
5. **Middlewares réutilisables** - Rate limiting, error handling partagés
6. **Config externalisée** - Facile de changer les URLs de services

---

## Conclusion

Le **API Gateway** est maintenant structuré professionnellement selon les standards MVC de Node.js/Express. Le code est **maintenable**, **testable**, **évolutif** et suit les **bonnes pratiques** de l'industrie.

Prêt pour la production!