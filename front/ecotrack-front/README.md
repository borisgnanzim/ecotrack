
# ECOTRACK – Frontend

Frontend de la plateforme **ECOTRACK**, développé avec **Next.js** et **Tailwind CSS**.  
Il consomme les APIs exposées par le backend ECOTRACK (authentification, signalements, dashboard, etc.).

---

## Prérequis

Avant de commencer, assure-toi d’avoir installé :

- **Node.js** ≥ 18
- **npm**, **yarn** ou **pnpm**
- Le **backend ECOTRACK** en cours d’exécution

---

## Installation

### 1️⃣ Lancer le front

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### 2 Lancer le front

A la racine de ce front, il faut mettre ceci dans le fichier .env (à créer s'il n'existe pas)
NEXT_PUBLIC_API_URL=http://localhost:3002
