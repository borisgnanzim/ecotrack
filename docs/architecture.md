# Architecture d'EcoTrack

## Vue d'Ensemble
EcoTrack est une plateforme de microservices conçue pour la gestion d'actions écologiques, permettant aux citoyens de signaler des problèmes environnementaux et aux administrateurs de gérer les conteneurs de collecte. L'architecture suit un modèle monorepo avec séparation claire entre backend et frontend.

## Structure du Monorepo
```
ecotrack/
├── backend/
│   ├── service-api-gateway/     # Passerelle API
│   ├── service-users/          # Gestion utilisateurs/auth
│   └── service-containers/     # Gestion conteneurs/données
├── front/
│   ├── ecotrack-front/         # App citoyenne
│   └── ecotrack-admin/         # App administration
├── docs/                       # Documentation
└── README.md
```

## Services Backend

### Service API Gateway
- **Technologies** : Node.js, Express, http-proxy-middleware
- **Rôle** : Point d'entrée unique pour toutes les requêtes API
- **Fonctionnalités** :
  - Routage vers les services internes
  - Rate limiting global
  - Logging centralisé
- **Port** : 3000 (clusterisé avec PM2)

### Service Users
- **Technologies** : Node.js, Express, Prisma, PostgreSQL, JWT
- **Rôle** : Gestion des utilisateurs et authentification
- **Fonctionnalités** :
  - Inscription/connexion utilisateurs
  - Gestion des rôles (citizen/admin)
  - Notifications (locales ou externes)
  - Upload d'avatars (Sharp pour redimensionnement WebP)
- **Port** : 3002 (clusterisé avec PM2)

### Service Containers
- **Technologies** : Node.js, Express, Prisma, PostgreSQL, Socket.IO
- **Rôle** : Gestion des conteneurs et données de remplissage
- **Fonctionnalités** :
  - CRUD conteneurs
  - Historique de remplissage en temps réel
  - Statistiques et rapports
  - WebSockets pour notifications temps réel
- **Port** : 3001 (clusterisé avec PM2)

## Applications Frontend

### EcoTrack Front (Citoyenne)
- **Technologies** : Next.js, TypeScript, Tailwind CSS
- **Rôle** : Interface pour les citoyens
- **Fonctionnalités** :
  - Signalement de problèmes
  - Participation aux actions écologiques
  - Profil utilisateur
- **Port** : 3000

### EcoTrack Admin
- **Technologies** : Next.js, TypeScript, Tailwind CSS
- **Rôle** : Interface d'administration
- **Fonctionnalités** :
  - Gestion des conteneurs
  - Tableaux de bord statistiques
  - Gestion utilisateurs
- **Port** : 3001

## Technologies Communes
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : JWT avec middleware personnalisé
- **Déploiement** : PM2 en mode cluster pour performance
- **Configuration** : Variables d'environnement (.env)
- **Tests** : Jest pour les services backend
- **Linting** : ESLint pour la qualité du code

## Communication Inter-Services
- **API Gateway** : Proxy vers les services internes
- **WebSockets** : Pour les notifications temps réel (containers)
- **HTTP/REST** : Communication synchrone entre services
- **Base de données partagée** : PostgreSQL pour persistance

## Sécurité
- Authentification JWT
- Middleware d'autorisation par rôle
- Validation des entrées
- Rate limiting
- Sanitisation des données

## Performance
- **Clustering PM2** : Utilisation de tous les cœurs CPU
- **Compression** : Gzip pour les réponses HTTP
- **Optimisation images** : Redimensionnement automatique des avatars
- **Cache** : Stratégies de cache pour les données fréquemment accédées

## Évolutivité
- Architecture modulaire permettant l'ajout de nouveaux services
- Séparation frontend/backend pour déploiement indépendant
- Configuration externalisée pour différents environnements
- Monitoring avec PM2 pour la production