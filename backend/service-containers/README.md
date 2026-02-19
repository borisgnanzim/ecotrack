# 🗑️ Service Conteneur – EcoTrack API

API backend pour la gestion de conteneurs de déchets intelligents :  
création, géolocalisation, statistiques, historique de remplissage et WebSocket temps réel.

---

## 🚀 Stack technique

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM (v6)
- WebSocket (ws)
- Multer (upload images)
- Postman (tests)
- pgAdmin

---

## 📁 Structure du projet
service_contenair/
│
├── src/
│   ├── server.js
│   ├── app.js
│   ├── routes/
│   │   └── container.route.js
│   ├── controllers/
│   │   └── container.controller.js
│
├── prisma/
│   └── schema.prisma
│
├── uploads/
├── .env
├── package.json
└── README.md
---

## ⚙️ Configuration

### 📄 Fichier `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5433/ecotrack"
PORT=3000
Modèles Prisma

🗑️ Conteneur
model conteneur {
  id_conteneur   Int      @id @default(autoincrement())
  code_conteneur Int      @unique
  type_Dechet    String
  Statut         String?  @default("normal")
  id_Zone        String
  capacite_i     Int?
  latitude       Float
  longitude      Float
  photo_url      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  fillHistory    FillHistory[]
}

Historique de remplissage
model FillHistory {
  id          Int      @id @default(autoincrement())
  niveau      Int
  createdAt   DateTime @default(now())

  conteneurId Int
  conteneur   conteneur @relation(fields: [conteneurId], references: [id_conteneur])
}

Lancer le projet
npm install
attention le prisma est en V6 .
npm install @prisma6.19.2
npx prisma generate
npm run dev

Endpoints API

➕ Créer un conteneur
Post
/containers

JSON
{
  "type_Dechet": "plastique",
  "Statut": "normal",
  "id_Zone": "zoneB",
  "capacite_i": 90,
  "code_conteneur": 1005,
  "latitude": 14.6937,
  "longitude": -16.4441
}
Lister les conteneurs
Get
/contenairs
Par id 
/containers/:ID
Supprimer un conteneur
Delete 
/contenairs/:id
Conteneurs proches (méthode Haversine)
GET
/containers/nearby?lat=14.6&lng=-16.4&radius=5
Statistiques 
Get
/containers/stats
Exemple
{
  "total": 1,
  "parType": {
    "recyclage": 1
  },
  "statusCount": {
    "normal": 1
  },
  "totalCapacity": 0,
  "averageFillLevel": null

  ---

  ## Seeding / Peupler la base (1 000 et 10 000 conteneurs)

  Ce dépôt contient un seeder performant : `prisma/seed.js`. Il permet d'insérer par lots un grand nombre
  de `conteneur` pour les tests (script accepte `--count=` ou via npm scripts `seed:1000` / `seed:10000`).

  Prérequis
  - Avoir `DATABASE_URL` configurée dans `backend/service-containers/.env` ou en variable d'environnement.
  - Avoir exécuté les migrations et généré le client Prisma.

  Commandes recommandées (depuis `backend/service-containers`):
  ```bash
  npm install
  npx prisma generate
  # appliquer les migrations (dev ou deploy selon le cas)
  npx prisma migrate dev

  # seed 1000
  npm run seed:1000

  # seed 10000
  npm run seed:10000
  ```

  Alternatives
  - Si tu préfères intégrer avec la commande Prisma `db seed`, ajoute dans `package.json` :
    ```json
    "prisma": { "seed": "node prisma/seed.js" }
    ```
    puis exécute `npx prisma db seed`.

  Notes et bonnes pratiques
  - Le seeder utilise `createMany` par batch pour de meilleures performances et `skipDuplicates: true`.
  - Pour très gros volumes (10k+), surveille l'utilisation mémoire et I/O de la base.
  - Tu peux ajuster la taille des batches dans `prisma/seed.js` si nécessaire.
}
Historique de remplissage

Ajouter un niveau
/containers/:id/fill-history

JSON
{
  "niveau": 70
}

Lire l’historique
GET
/containers/:id/fill-history

WebSocket

Utilisé pour :
	•	mises à jour temps réel
	•	alertes de remplissage
	•	statistiques live

WebSocket vs Socket.IO
WebSocket

###exemple de .en

DATABASE_URL="postgresql://postgres:Passwords@localhost:5433/ecotrack?schema=public"
PORT=3000
USERNAME=postgres
BASE=ecotrack