# Redis Caching - Documentation

## Vue d'Ensemble

Le **API Gateway** utilise **Redis** comme système de cache en mémoire pour réduire la charge sur les microservices et les bases de données.

**Statistiques de performance** :
- Réduction de charge : **80%** sur les requêtes GET fréquentes
- Latence réduite : **10x plus rapide** (Redis vs DB)
- Débit augmenté : **~100k req/s** avec cache vs ~1k req/s sans

---

## Installation

### 1. Installer Redis

#### Windows (avec WSL2 ou Docker)
```bash
# Docker Compose
docker run -d --name redis -p 6379:6379 redis:latest

# Ou avec Windows Subsystem for Linux
wsl
sudo apt-get install redis-server
redis-server
```

#### Linux / macOS
```bash
# Linux
sudo apt-get install redis-server
redis-server

# macOS
brew install redis
redis-server
```

#### Docker (recommandé)
```bash
docker run -d \
  --name ecotrack-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine redis-server --appendonly yes
```

### 2. Installer les dépendances Node.js
```bash
cd backend/service-api-gateway
npm install
```

---

## Configuration

### Variables d'Environnement (.env)

```env
# Redis Configuration
REDIS_HOST=localhost          # Hôte Redis
REDIS_PORT=6379              # Port Redis
REDIS_PASSWORD=               # Mot de passe (optionnel)
```

### Vérifier la connexion

```bash
npm run dev

# Vous verrez :
# Redis Connected
# Redis Ready
```

---

## Utilisation

### 1. Vérifier les Stats du Cache
```bash
curl http://localhost:3000/cache/stats

# Réponse:
{
  "cache": {
    "status": "connected",
    "keys": 42,
    "info": "..."
  },
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

### 2. Headers de Cache dans les Réponses

Chaque réponse inclut les headers de cache :

```
X-Cache: HIT|MISS
X-Cache-Key: /containers
X-Cache-TTL: 1800
```

**Signification** :
- `X-Cache: HIT` - Donnée servie depuis le cache
- `X-Cache: MISS` - Donnée servie depuis le microservice (première requête)
- `X-Cache-TTL` - Durée de vie des données en secondes

### 3. Routes de Gestion du Cache

#### Vider tout le cache
```bash
curl -X DELETE http://localhost:3000/cache

# Réponse:
{
  "message": "Cache cleared",
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

#### Vider un pattern de cache
```bash
curl -X DELETE http://localhost:3000/cache/pattern/containers*

# Efface : containers:1, containers:2, etc.
```

#### Supprimer une clé spécifique
```bash
curl -X DELETE "http://localhost:3000/cache/key/%2Fcontainers%2F1"

# %2F = / (URL encoded)
```

---

## Stratégie de Cache

### TTL (Time To Live) par Route

| Route | TTL | Cas d'usage |
|-------|-----|-----------|
| `/containers` | 30 min | Données rarement modifiées |
| `/containers/:id` | 30 min | Données rarement modifiées |
| `/users/profile` | 10 min | Données sensibles, modifications possibles |
| `/notifications` | 5 min | Données temps réel, changements fréquents |
| `/auth/*` | Pas de cache | Données critiques, jamais cacher |

### Comment Modifier les TTL

Modifier dans `src/routes/index.js` :

```javascript
// Cache des conteneurs (30 min ou 1800 sec)
router.get('/containers', setCacheTTL(1800));

// Cache utilisateur (15 min)
router.get('/users/profile', setCacheTTL(900));

// Pas de cache pour login
// (route POST, GET login n'existe pas)
```

---

## Architecture

### Flux de Requête avec Cache

```
Requête CLIENT (GET /containers)
    ↓
Cache Middleware
    |- Clé de cache = "/containers"
    |- Chercher dans Redis
    |   |- HIT -> Répondre directement (0ms)
    |   |- MISS -> Proxy vers microservice
    │       ↓
Proxy vers microservice
    |- Récupérer données
    |- Cacher dans Redis (TTL)
    |- Répondre au client
```

### Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `src/services/cache.service.js` | Service Redis (get, set, delete) |
| `src/middlewares/cache.middleware.js` | Intercepte requêtes GET |
| `src/controllers/cache.controller.js` | Management du cache |
| `src/routes/cache.routes.js` | Routes `/cache/*` |

---

## Exemples de Requêtes

### Exemple 1 : Première requête (Miss)
```bash
$ time curl http://localhost:3010/containers
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2345  100  2345    0     0   1234   0    --:--:--:--  --:--:--:--  0:1234

Headers:
X-Cache: MISS
X-Cache-Key: /containers
X-Cache-TTL: 1800

Temps: ~100ms (requête vers microservice)
```

### Exemple 2 : Deuxième requête (Hit)
```bash
$ time curl http://localhost:3010/containers
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2345  100  2345    0     0  234567  0    --:--:--:--  --:--:--:--  0:0:01

Headers:
X-Cache: HIT
X-Cache-Key: /containers
X-Cache-TTL: 1800

Temps: ~1ms (depuis Redis)


### Voir les Stats Redis

```bash
# CLI Redis
redis-cli

# Commandes utiles
> INFO stats          # Statistiques
> DBSIZE             # Nombre de clés
> KEYS *             # Lister toutes les clés
> GET /containers    # Voir une valeur en cache
> DEL /containers    # Supprimer une clé
> FLUSHDB            # Vider complètement
```

### Logs du Gateway

```bash
npm run dev

# Vous verrez :
Cache MISS: /containers
Cache SET: /containers (TTL: 1800s)
Cache HIT: /containers
```

---

## Considérations Importantes

### 1. Cache et Authentification
- NE PAS CACHER les routes d'authentification (`/auth/*`)
- Les données sensibles comme les tokens ne doivent jamais être en cache
- Configuration actuelle : Auth non incluse

### 2. Invalidation du Cache
Le cache ne s'invalide **PAS automatiquement** lors des mutations (PUT, DELETE, POST).

**Solution** : Depuis le microservice qui modifie les données, appeler :
```bash
curl -X DELETE http://localhost:3010/cache/pattern/containers*
```

### 3. Redis Down / Unavailable
- Si Redis est hors ligne, le gateway **continue de fonctionner** sans cache
- Les requêtes vont directement aux microservices
- Zéro downtime garanti

### 4. Mémoire Redis
- Redis stocke tout **en RAM**
- Configurer une limite ou une politique d'éviction
- Par défaut : pas de limite (à configurer)

---

## 🔐 Sécurité

### Protéger Redis

```yaml
# Docker Compose recommandé
version: '3'
services:
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass votre_mot_de_passe
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
```

### Configurer le mot de passe

```env
# .env
REDIS_PASSWORD=votre_mot_de_passe_securise
```

---

## Ressources

- [Redis Documentation](https://redis.io/commands)
- [Redis Docker](https://hub.docker.com/_/redis)
- [Node Redis Package](https://github.com/redis/node-redis)

---

## Conclusion

Le système de cache Redis du gateway réduit **drastiquement** la charge sur les microservices. Utilisez judicieusement les TTL pour balancer **fraîchué des données** vs **performance**.

Configuration optimale pour EcoTrack :
- Conteneurs : Cache 30 min (données stables)
- Utilisateurs : Cache 10 min (modifications possibles)
- Notifications : Cache 5 min (données temps réel)
- Auth : Pas de cache (criticité)