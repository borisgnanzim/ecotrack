# EcoTrack — Monorepo

## Description
**EcoTrack** est un ensemble de microservices pour la gestion d'actions écologiques (utilisateurs, notifications, conteneurs, etc.). Ce dépôt contient plusieurs services backend (avec clustering PM2), des applications frontend, et de la documentation pour les lancer en local ou en production.

---

## Architecture

### Frontend
- **ecotrack-citoyen-vjs** — application citoyenne (signalement, participation)  
  → `http://localhost:5174`
- **ecotrack-admin-vjs** — application de gestion et d'administration des conteneurs  
  → `http://localhost:5173`

### Backend (Microservices)
- **service-api-gateway** — Passerelle API pour router les requêtes vers les services internes  
  → `http://localhost:3000` (clusterisé avec PM2)
- **service-users** — Gestion des utilisateurs, authentification JWT, notifications  
  → `http://localhost:3002` (clusterisé avec PM2)
- **service-containers** — Gestion des conteneurs, statistiques et historiques de remplissage  
  → `http://localhost:3001` (clusterisé avec PM2)

Chaque service backend utilise **PM2 en mode cluster** pour une meilleure performance (multi-cœurs CPU).

---

## Services Inclus
- `backend/service-api-gateway` — Passerelle API (Express, proxy vers autres services).
- `backend/service-users` — Service utilisateurs (Prisma/Postgres, JWT, notifications). Voir `backend/service-users/README.md`.
- `backend/service-containers` — Service conteneurs (Prisma/Postgres, WebSockets pour temps réel). Voir `backend/service-containers/README.md`.

> D'autres services peuvent être ajoutés dans le dossier `backend/`.

---

## Prérequis 🌐
- Node.js (>= 18 recommandé)
- PostgreSQL (pour les bases de données)
- npm ou yarn
- PM2 (installé globalement : `npm install -g pm2`)
- (Optionnel) MongoDB si des services l'utilisent encore

---

## Quickstart — Lancer les Services

### 1. Cloner et installer les dépendances globales
```bash
git clone <url-du-repo>
cd ecotrack
npm install -g pm2  # Pour le clustering
```

### 2. Configuration des variables d'environnement
Chaque service backend utilise un fichier `.env` pour les configurations importantes (ports, bases de données, etc.). Copiez les exemples :

- Pour `service-api-gateway` :
  ```bash
  cp backend/service-api-gateway/.env.example backend/service-api-gateway/.env
  ```
  Adaptez `PORT=3000`, `USERS_SERVICE_URL=http://localhost:3002`, `CONTAINERS_SERVICE_URL=http://localhost:3001`.

- Pour `service-users` :
  ```bash
  cp backend/service-users/.env.example backend/service-users/.env
  ```
  Adaptez `PORT=3002`, `DATABASE_URL=postgresql://...`, `JWT_SECRET=...`.

- Pour `service-containers` :
  ```bash
  cp backend/service-containers/.env.example backend/service-containers/.env
  ```
  Adaptez `PORT=3001`, `DATABASE_URL=postgresql://...`.

### 3. Préparer les bases de données
Pour les services utilisant Prisma :
```bash
cd backend/service-users
npm run prisma:generate
npm run prisma:migrate

cd ../service-containers
npm run prisma:generate
npm run prisma:migrate
```

### 4. Lancer les services avec PM2 (recommandé pour la performance)
PM2 lance chaque service en mode cluster (multi-instances pour utiliser tous les cœurs CPU).

- **En développement** :
  ```bash
  cd backend/service-api-gateway
  npm run pm2:start

  cd ../service-users
  npm run pm2:start

  cd ../service-containers
  npm run pm2:start
  ```

- **En production** :
  ```bash
  cd backend/service-api-gateway
  npm run pm2:start:prod

  # Répétez pour les autres services
  ```

- **Vérifier et gérer** :
  ```bash
  pm2 list  # Liste des processus
  pm2 logs  # Logs en temps réel
  pm2 monit  # Interface de monitoring
  pm2 stop all  # Arrêter tous
  ```

### 5. Lancer les frontends (optionnel)
```bash
cd front/ecotrack-citoyen-vjs
npm install
npm run dev  # → http://localhost:5174

cd ../ecotrack-admin-vjs
npm install
npm run dev  # → http://localhost:5173
```

---

## Documentation API
Les services exposent Swagger UI pour tester les endpoints :
- **service-users** : `http://localhost:3002/api-docs`
- **service-containers** : `http://localhost:3001/api-docs` (ajustez selon `.env`)

---

## Bonnes Pratiques
- **Variables d'environnement** : Tout dans `.env` (ports, secrets, URLs). Ne commitez jamais `.env` (utilisez `.env.example`).
- **Clustering PM2** : Utilisez PM2 pour la production/dev afin de bénéficier du multi-cœur.
- **Migrations Prisma** : Appliquez après modification du schéma (`npm run prisma:migrate`).
- **Logs** : PM2 stocke les logs dans `logs/` par service.
- **Tests** : Lancez `npm test` dans chaque service.
- **Sécurité** : Changez `JWT_SECRET` en production.

---

## Contribuer
1. Fork / créez une branche
2. Ajoutez des tests et documentation
3. Ouvrez une Pull Request
4. Respectez les conventions : PM2 pour le déploiement, `.env` pour les configs

---

## Documentation
Consultez le dossier `docs/` pour une documentation détaillée :
- **[Architecture](docs/architecture.md)** : Structure technique et composants
- **[API Gateway](docs/gateway-usage.md)** : Guide d'utilisation du gateway et endpoints
- **[API](docs/api.md)** : Endpoints et utilisation des APIs
- **[Sécurité](docs/security.md)** : Mesures de protection implémentées
- **[Performance](docs/performance.md)** : Optimisations et benchmarks
