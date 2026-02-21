# API Gateway - Guide d'Utilisation

## Vue d'Ensemble
Le **API Gateway** est le point d'entrée unique d'EcoTrack. Il proxy toutes les requêtes vers les microservices appropriés en appliquant des mesures de sécurité et de rate limiting.

## URLs Importantes
- **Gateway** : `http://localhost:3000`
- **Documentation Swagger** : `http://localhost:3000/api-docs`
- **Health Check** : `http://localhost:3000/health`

## Structure des Routes

### 1. Authentification (`/auth`)
Proxy vers le **service-users** (port 3002)

**Endpoints disponibles** :
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/logout` - Déconnexion

**Exemple** :
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Réponse** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "Jean",
    "lastname": "Dupont",
    "roles": ["citizen"]
  }
}
```

### 2. Utilisateurs (`/users`)
Proxy vers le **service-users** (port 3002)

**Endpoints disponibles** :
- `GET /users/profile` - Récupérer le profil utilisateur (Authentification requise)
- `PUT /users/profile` - Modifier le profil (Authentification requise)
- `POST /users/profile/avatar` - Upload avatar (Authentification requise)

**Exemple** :
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <token>"
```

### 3. Notifications (`/notifications`)
Proxy vers le **service-users** (port 3002)

**Endpoints disponibles** :
- `GET /notifications` - Liste des notifications (Authentification requise)
- `GET /notifications/:id` - Détail d'une notification (Authentification requise)
- `PUT /notifications/:id/read` - Marquer comme lue (Authentification requise)

### 4. Conteneurs (`/containers`)
Proxy vers le **service-containers** (port 3001)

**Endpoints disponibles** :
- `GET /containers` - Liste des conteneurs
- `POST /containers` - Créer un conteneur (Authentification + Admin)
- `GET /containers/:id` - Détail d'un conteneur
- `PUT /containers/:id` - Modifier un conteneur (Authentification + Admin)
- `DELETE /containers/:id` - Supprimer un conteneur (Authentification + Admin)
- `GET /containers/:id/history` - Historique de remplissage

**Exemple** :
```bash
curl -X GET http://localhost:3000/containers
```

## Authentification JWT

### Comment Obtenir un Token
1. Appelez `/auth/login` avec vos identifiants
2. Extractez le `token` de la réponse

### Comment Utiliser le Token
Incluez le token dans l'en-tête `Authorization` :
```
Authorization: Bearer <votre_token_jwt>
```

**Exemple avec curl** :
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Exemple avec JavaScript** :
```javascript
const response = await fetch('http://localhost:3000/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Rate Limiting

Le gateway applique un **rate limiting global** :
- **Limite** : 100 requêtes par IP
- **Fenêtre** : 15 minutes
- **Réponse** : 429 Too Many Requests si dépassé

## Codes de Réponse

| Code | Signification |
|------|---|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié (token manquant/invalide) |
| 403 | Non autorisé (permissions insuffisantes) |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

## Health Check

Vérifiez l'état du gateway :
```bash
curl http://localhost:3000/health
```

**Réponse** :
```json
{
  "status": "API Gateway is running",
  "timestamp": "2026-02-21T10:30:00.000Z",
  "uptime": 3600
}
```

## Documentation Détaillée des Services

Pour les scénarios complexes, consultez les docs Swagger des services individuels :
- **Service Users** : http://localhost:3002/api-docs
- **Service Containers** : http://localhost:3001/api-docs

## Démarrer le Gateway

### Mode Développement
```bash
cd backend/service-api-gateway
npm run dev
```

### Mode Production (avec PM2)
```bash
cd backend/service-api-gateway
npm run pm2:start:prod
```

## Variables d'Environnement

Configurez dans `backend/service-api-gateway/.env` :
```env
PORT=3000
NODE_ENV=development
USERS_SERVICE_URL=http://localhost:3002
CONTAINERS_SERVICE_URL=http://localhost:3001
```

## Dépannage

### Le gateway retourne une erreur 503 ?
- Vérifiez que les services backend tournent (service-users et service-containers)
- Vérifiez les URLs dans `.env` (USERS_SERVICE_URL, CONTAINERS_SERVICE_URL)

### Erreur "Token invalide" ?
- Assurez-vous que le token n'a pas expiré
- Reconnectez-vous avec `/auth/login` pour obtenir un nouveau token

### Rate limit atteint ?
- Attendez 15 minutes avant de réessayer
- Chaque IP a sa propre limite

## Exemples Complets

### Scénario 1 : S'inscrire et Récupérer le Profil
```bash
# 1. Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123",
    "firstname": "Alice",
    "lastname": "Martin"
  }'
# → Réponse : { "token": "...", "user": {...} }

# 2. Copier le token
TOKEN="<token_de_la_réponse>"

# 3. Récupérer le profil
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Scénario 2 : Lister et Créer un Conteneur (Admin)
```bash
# 1. Lister les conteneurs (public)
curl -X GET http://localhost:3000/containers

# 2. Créer un conteneur (admin avec token)
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type_Dechet": "papier",
    "Statut": "vide",
    "capacite_i": 100,
    "code_conteneur": "CONT001",
    "latitude": 48.8566,
    "longitude": 2.3522
  }'
```

## Support
Consultez la documentation complète sur `/api-docs` ou contactez l'équipe EcoTrack.