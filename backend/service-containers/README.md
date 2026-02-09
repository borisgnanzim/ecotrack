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

▶️ Lancer le projet
npm install
attention le prisma est en V6 .
npm install @prisma6.19.2
npx prisma generate
npx prisma migrate dev --name init
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
}
Historique de remplissage

➕ Ajouter un niveau
/containers/:id/fill-history

JSON
{
  "niveau": 70
}

📄 Lire l’historique
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