# 🗑️ Service Conteneur – EcoTrack API

API backend pour la gestion de conteneurs de déchets intelligents : création, géolocalisation,
statistiques, historique de remplissage, upload photo, et notifications temps‑réel via Socket.IO.

---

## 🚀 Stack technique

- **Node.js 18+** (ES modules)
- **Express.js 5**
- **PostgreSQL** avec extensions `cube` & `earthdistance` pour géolocalisation
- **Prisma ORM v6**
- **Socket.IO** pour WebSocket
- **Swagger / OpenAPI** pour documentation interactive
- **Zod** pour validation des payloads
- **jsonwebtoken** pour JWT auth
- **Multer** pour upload photo

---

## 📁 Structure du projet

```
service_contenair/
├── src/
│   ├── app.js          # configuration Express + middlewares
│   ├── server.js       # bootstrap HTTP + Socket.IO + Prisma
│   ├── routes/         # définitions des endpoints
│   ├── controllers/    # logique de conversion requête → service
│   ├── services/       # logique métier (Container, FillHistory,…)
│   ├── repositories/   # accès Prisma vers DB
│   ├── middlewares/    # auth, validation, erreur
│   └── sockets/        # Socket.IO helpers
├── prisma/
│   ├── schema.prisma   # modèle DB
│   ├── seed.js         # seeder de conteneurs
├── uploads/            # stockage local des photos
├── swagger.js          # génération OpenAPI
├── .env                # configuration locale
├── package.json
└── README.md
```

---

## ⚙️ Démarrage rapide

1. **Préparer la base de données**
   - Créez une base PostgreSQL et activez les extensions :
     ```sql
     CREATE EXTENSION IF NOT EXISTS cube;
     CREATE EXTENSION IF NOT EXISTS earthdistance;
     ```
   - Configurez `DATABASE_URL` dans `.env` (voir ci‑dessus).

2. **Installer les dépendances**
   ```bash
   cd backend/service-containers
   npm install
   npm install prisma@6.19.2 --save-dev
   npm install swagger-jsdoc swagger-ui-express jsonwebtoken
   ```

3. **Générer le client Prisma et migrer**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Peupler la base (optionnel)**
   ```bash
   npm run seed:1000     # insère 1000 enregistrements
   npm run seed:10000    # insère 10000
   ```

5. **Lancer le serveur**
   ```bash
   npm run dev
   ```

   - Il écoute par défaut sur le port défini dans `.env` (3001)
   - Swagger UI disponible sur `http://localhost:3001/api-docs`
   - Health check : `GET /health`

---

## 📌 Endpoints principaux

| Méthode | URL                               | Auth   | Description |
|--------:|-----------------------------------|:------:|-------------|
| `GET`   | `/containers`                     | non    | Lister tous |
| `GET`   | `/containers/:id`                 | non    | Détails d’un conteneur |
| `POST`  | `/containers`                     | JWT    | Créer |
| `PUT`   | `/containers/:id`                 | JWT    | Mettre à jour |
| `DELETE`| `/containers/:id`                 | JWT    | Supprimer |
| `GET`   | `/containers/stats`               | non    | Statistiques globales |
| `GET`   | `/containers/search`              | non    | Recherche flexible avec query params |
| `GET`   | `/containers/nearby`              | non    | Conteneurs à proximité (<code>lat, longitude, radius</code>) |
| `POST`  | `/containers/:id/fill-history`    | JWT    | Ajouter niveau remplissage |
| `GET`   | `/containers/:id/fill-history`    | non    | Récupérer historique |
| `/api-docs`                     | Swagger UI | documentation interactive |

📄 Voir Swagger pour description complète et exemples.

### Exemple JSON création
```json
{
  "type_Dechet": "plastique",
  "Statut": "normal",
  "id_Zone": "zoneB",
  "capacite_i": 90,
  "code_conteneur": 1005,
  "latitude": 14.6937,
  "longitude": -16.4441
}
```

### Authentification JWT
- Obtenez un token via le service-users (`/auth/login`)
- Inclure le header `Authorization: Bearer <token>` pour les routes protégées

### WebSocket (Socket.IO)
- Connexion sur le même port que HTTP
- Evénements :
  - `subscribe_container` (rejoindre room)
  - `fill_level_updated` (niveau modifié)
  - `critical_alert` (niveau ≥ 85%)

---

## 🛠️ Scripts utiles

- `npm run dev` – démarrage en mode développement (nodemon)
- `npm run seed:1000` / `seed:10000` – génération de données
- `npm run prisma:migrate` – exécuter migrations
- `npm run prisma:generate` – génèrer le client

---

## 📝 Notes supplémentaires

- Le modèle Prisma se trouve dans `prisma/schema.prisma`.
- Le middleware `authMiddleware` vérifie le JWT et injecte `req.user`.
- Validation Zod appliquée aux payloads via `validate()` middleware.
- Logging minimal mais suffisant pour le développement, améliorer à l’aide d’un logger si besoin.

---

Bonne utilisation ! 🎯

