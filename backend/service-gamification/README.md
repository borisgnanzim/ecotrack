# Service Gamification 🎮

Gère le système de points, badges, défis et compétitions pour engager les citoyens.

## 📋 Architecture

```
Route → Controller → Service → Prisma → PostgreSQL
```

## 🗄️ Modèles de Données

### UserAction
- Enregistre chaque action d'un utilisateur (report, défi, badge)
- Associé à des points

### Badge
- Définit les badges disponibles (Débutner, Éco-Warrior, Super-Héros)
- Requiert un minimum de points pour être attribué

### UserBadge
- Association entre utilisateurs et badges gagnés
- Enregistre la date d'attribution

### Challenge
- Défis individuels ou collectifs
- Avec objectif, récompense et période

### ChallengeParticipation
- Suivi de la progression d'un utilisateur dans un défi

## 📊 Configuration des Points

```javascript
const POINTS_CONFIG = {
  report: 10,           // Signaler un problème
  challenge_completed: 50, // Compléter un défi
  badge_earned: 5,      // Gagner un badge
};
```

## 🏆 Badges Disponibles

| Badge | Points Requis | Description |
|-------|---------------|-------------|
| Débutner | 100 | Premier pas en éco-engagement |
| Éco-Warrior | 500 | Guerrier écologique confirmé |
| Super-Héros | 1000 | Héros écologique suprême |

## 🔌 Endpoints API

### Points

#### Ajouter des points
```
POST /api/gamification/points/:userId
Content-Type: application/json

{
  "action": "report",
  "points": 10  // optionnel, utilise la valeur par défaut si omis
}
```

#### Obtenir le total de points
```
GET /api/gamification/points/:userId
```

### Badges

#### Obtenir les badges de l'utilisateur
```
GET /api/gamification/users/:userId/badges
```

#### Attribuer un badge
```
POST /api/gamification/users/:userId/badges/:badgeId
```

### Défis

#### Créer un défi
```
POST /api/gamification/challenges
Content-Type: application/json

{
  "title": "Signaler 10 conteneurs",
  "description": "Signalez 10 conteneurs défectueux",
  "objective": 10,
  "reward": 100,
  "type": "individual|collective",
  "period": "weekly|monthly",
  "endDate": "2026-06-08T00:00:00Z"
}
```

#### Lister les défis actifs
```
GET /api/gamification/challenges
```

#### Rejoindre un défi
```
POST /api/gamification/users/:userId/challenges/:challengeId/join
```

#### Mettre à jour la progression
```
PUT /api/gamification/users/:userId/challenges/:challengeId/progress
Content-Type: application/json

{
  "progressIncrement": 5
}
```

#### Obtenir les défis de l'utilisateur
```
GET /api/gamification/users/:userId/challenges
```

### Leaderboard

#### Obtenir le classement
```
GET /api/gamification/leaderboard?limit=50
```

Réponse:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-123",
      "totalPoints": 1250,
      "badgeCount": 3,
      "badges": ["Débutner", "Éco-Warrior", "Super-Héros"]
    }
  ]
}
```

### Statistiques

#### Obtenir les stats d'un utilisateur
```
GET /api/gamification/users/:userId/stats
```

Réponse:
```json
{
  "userId": "user-123",
  "totalPoints": 1250,
  "weeklyPoints": 150,
  "monthlyPoints": 450,
  "badgeCount": 3,
  "badges": [
    {
      "name": "Débutner",
      "awardedAt": "2026-05-15T10:30:00Z"
    }
  ],
  "rank": 5,
  "averagePoints": 420,
  "recentActions": [...],
  "co2Saved": 625  // kg de CO2 économisé
}
```

## 🚀 Installation & Démarrage

```bash
# Installation des dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL

# Générer Prisma Client
npm run prisma:generate

# Créer les tables en base de données
npm run prisma:migrate

# Seeder les données initiales
npx prisma db seed

# Démarrer le service
npm run dev
```

## 🧪 Tests

```bash
npm test
```

## 📝 Flux d'Utilisation

### 1. Utilisateur signale un conteneur
```
POST /api/gamification/points/user-123
{ "action": "report" }
→ +10 points
```

### 2. Utilisateur atteint 100 points
```
→ Badge "Débutner" attribué automatiquement
→ +5 points supplémentaires
```

### 3. Utilisateur rejoint un défi
```
POST /api/gamification/users/user-123/challenges/challenge-1/join
```

### 4. Utilisateur progresse dans le défi
```
PUT /api/gamification/users/user-123/challenges/challenge-1/progress
{ "progressIncrement": 1 }
```

### 5. Défi complété
```
→ +points de récompense
→ Bonus potentiel de badge
```

### 6. Afficher son profil gamification
```
GET /api/gamification/users/user-123/stats
→ Points totaux, badges, classement, impact CO2
```

## 🔄 Intégration avec Autres Services

- **service-users**: Obtenir les infos utilisateur, envoyer notifications
- **service-containers**: Intégrer les reports de conteneurs
- **service-analytics**: Agréger les statistiques gamification

## 🛡️ Middleware Recommandé

Ajouter `authMiddleware` pour valider JWT et `roleMiddleware` pour vérifier les permissions.

```javascript
router.post('/challenges', authMiddleware, roleMiddleware('manager'), GamificationController.createChallenge);
```

## 📚 Ressources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
