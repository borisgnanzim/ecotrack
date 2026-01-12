# EcoTrack — Monorepo

## Description
**EcoTrack** est un ensemble de microservices pour la gestion d'actions écologiques (utilisateurs, notifications, etc.). Ce dépôt contient plusieurs services (backend, éventuellement frontend) et de la documentation pour les lancer en local.

---

## Services inclus
- `backend/service-users` — Service de gestion des utilisateurs et notifications (JWT, Prisma/Postgres). Voir `backend/service-users/README.md` pour la documentation détaillée.

> D'autres services peuvent être ajoutés dans le dossier `backend/`.

---

## Prérequis 🌐
- Node.js (>= 18 recommandé)
- PostgreSQL
- npm
- (Optionnel) MongoDB si des services l'utilisent

---

## Quickstart — Lancer un service
1. Se placer dans le dossier du service :

```bash
cd backend/service-users
```

2. Installer les dépendances :

```bash
npm install
```

3. Configurer les variables d'environnement : créez un fichier `.env` (ou `.env.local`) dans le dossier du service. Exemple :

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrack
JWT_SECRET=une_clef_secrete
MONGO_URI=mongodb://localhost:27017
DB_NAME=ecotrack_db
```

4. Générer Prisma et appliquer les migrations :

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Lancer le service en dev :

```bash
npm run dev
```

---

## Documentation API
Les services exposent souvent Swagger UI. Pour `service-users` :

```
http://localhost:3002/api-docs
```

(adaptez le port selon la configuration dans `.env`).

---

## Bonnes pratiques
- Isoler les variables d'environnement par service.
- Exécuter les migrations Prisma après modification du schéma.
- Documenter chaque service dans son propre `README.md`.

---

## Contribuer
1. Fork / branch
2. Ajouter des tests et documentation
3. Ouvrir une Pull Request