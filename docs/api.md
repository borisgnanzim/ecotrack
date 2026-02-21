# Documentation API

## Vue d'Ensemble
EcoTrack utilise Swagger/OpenAPI pour documenter automatiquement ses endpoints API. Chaque service backend expose une interface Swagger UI pour tester et explorer les APIs.

## Services et URLs Swagger

### Service API Gateway
- **URL Swagger** : `http://localhost:3000/api-docs`
- **Description** : Interface principale pour accéder aux autres services
- **Endpoints principaux** :
  - `/auth/*` - Authentification (proxy vers service-users)
  - `/users/*` - Gestion utilisateurs (proxy vers service-users)
  - `/containers/*` - Gestion conteneurs (proxy vers service-containers)

### Service Users
- **URL Swagger** : `http://localhost:3002/api-docs`
- **Description** : Gestion des utilisateurs, authentification et notifications
- **Endpoints principaux** :
  - `POST /auth/register` - Inscription utilisateur
  - `POST /auth/login` - Connexion
  - `GET /users/profile` - Profil utilisateur
  - `POST /users/profile/avatar` - Upload avatar
  - `GET /notifications` - Liste notifications

### Service Containers
- **URL Swagger** : `http://localhost:3001/api-docs`
- **Description** : Gestion des conteneurs et données de remplissage
- **Endpoints principaux** :
  - `GET /containers` - Liste conteneurs
  - `POST /containers` - Créer conteneur
  - `GET /containers/:id` - Détails conteneur
  - `PUT /containers/:id` - Modifier conteneur
  - `DELETE /containers/:id` - Supprimer conteneur
  - `GET /fullhistory` - Historique remplissage
  - `WebSocket /` - Notifications temps réel

## Authentification API
Toutes les requêtes nécessitant une authentification doivent inclure :
```
Authorization: Bearer <jwt_token>
```

## Formats de Données
- **Content-Type** : `application/json`
- **Encodage** : UTF-8
- **Dates** : Format ISO 8601

## Codes de Réponse
- `200` : Succès
- `201` : Créé
- `400` : Erreur de validation
- `401` : Non autorisé
- `403` : Interdit
- `404` : Non trouvé
- `500` : Erreur serveur

## Rate Limiting
- Limite globale : 100 requêtes/minute par IP
- Limite par endpoint : Variable selon la criticité

## Tests API
Utilisez Swagger UI pour tester les endpoints directement depuis le navigateur, ou des outils comme Postman/Insomnia avec les URLs ci-dessus.

## WebSockets
Le service containers expose des WebSockets pour les notifications temps réel :
- Connexion : `ws://localhost:3001`
- Événements : `containerUpdate`, `fillHistoryUpdate`

## Versioning
Les APIs suivent le versioning via URL : `/v1/endpoint`
Actuellement en v1, extensions futures possibles.