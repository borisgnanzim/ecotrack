# Intégration du Service Gamification

## Vue d'ensemble des dépendances

```
┌─────────────────────────────────────────────────────────┐
│                 Service Gamification                    │
│                                                         │
│  Points → Badges → Défis → Leaderboard → Statistiques │
└────────┬──────────────────────────────┬────────────────┘
         │                              │
         ▼                              ▼
   ┌──────────────────┐        ┌──────────────────┐
   │ Service Users    │        │ Service Notif    │
   │                  │        │                  │
   │ - getUserInfo    │        │ - sendNotif      │
   │ - updateProfile  │        │ - pushNotif      │
   └──────────────────┘        └──────────────────┘
         ▲                              ▲
         │                              │
   Badge gagné ◄────────────┐   ┌──────┘ Badges, Défis complétés
                            │
                   API Gateway
```

## Flux d'Intégration

### 1. Utilisateur signale un conteneur

**Acteur**: Service Containers ou Frontend

```
POST /api/gamification/points/:userId
{
  "action": "report"
}
```

**Réponse**:
```json
{
  "id": "action-123",
  "userId": "user-456",
  "action": "report",
  "points": 10,
  "timestamp": "2026-06-01T10:30:00Z"
}
```

**Effets secondaires**:
- ✅ Points ajoutés
- ✅ Vérifier si badges seront déverrouillés
- ✅ Envoyer notification si badge gagné

### 2. Badge attribué automatiquement

Quand `totalPoints >= badge.pointsRequired`:

```javascript
// Dans GamificationService.checkAndAwardBadges()
const badge = await prisma.badge.findUnique({ where: { name: 'Débutner' } });
await GamificationService.awardBadge(userId, badge.id);

// Envoyer notification via service-users
await fetch('http://service-users:3001/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    type: 'badge_earned',
    title: `Vous avez gagné le badge ${badge.name}!`,
    data: { badgeId: badge.id, badgeName: badge.name }
  })
});
```

### 3. Utilisateur complète un défi

**API Gamification reçoit**:
```
PUT /api/gamification/users/:userId/challenges/:challengeId/progress
{
  "progressIncrement": 1
}
```

**Vérifications**:
- Est-ce que le défi est complet? (`progress >= objective`)
- Si oui:
  - ✅ Ajouter les points de récompense
  - ✅ Marquer comme complété
  - ✅ Envoyer notification

**Notification envoyée**:
```json
{
  "type": "challenge_completed",
  "title": "Défi complété!",
  "body": "Vous avez complété 'Signaler 10 conteneurs' et gagné 100 points!",
  "data": {
    "challengeId": "challenge-1",
    "reward": 100,
    "newTotalPoints": 350
  }
}
```

## Intégrations Cross-Service

### Avec Service Users

#### Récupérer infos utilisateur
```javascript
// Dans GamificationService
const response = await fetch(`http://service-users:3001/api/users/${userId}`);
const user = await response.json();
```

#### Envoyer notifications
```javascript
const notification = {
  userId,
  type: 'gamification_achievement',
  title: 'Nouvel achievement!',
  data: { badgeId, badgeName }
};

await fetch('http://service-users:3001/api/notifications', {
  method: 'POST',
  body: JSON.stringify(notification)
});
```

### Avec Service Containers

#### Récupérer les reports d'un utilisateur
```javascript
// Pour compter les reports
const response = await fetch(`http://service-containers:3002/api/containers/reported-by/${userId}`);
const reports = await response.json();
```

#### Créer des défis basés sur containers
```javascript
// Défi automatique: Récupérer tous les conteneurs critiques
const criticalContainers = await fetch('http://service-containers:3002/api/containers?status=critical');
const count = criticalContainers.length;

if (count > 10) {
  // Créer défi collectif de priorité
}
```

### Avec Service Analytics

#### Envoyer statistiques gamification
```javascript
// Analytics peut requérir les stats de gamification
app.get('/api/analytics/gamification/leaderboard', async (req, res) => {
  const leaderboard = await GamificationService.getLeaderboard(100);
  res.json({
    service: 'gamification',
    topUsers: leaderboard.slice(0, 10),
    totalUsers: leaderboard.length,
    timestamp: new Date()
  });
});
```

#### Métriques pour le tableau de bord
```json
{
  "totalUsersActive": 1250,
  "usersWithBadges": 450,
  "totalPointsDistributed": 125000,
  "activeChallenges": 5,
  "leaderboardTopUser": {
    "userId": "user-123",
    "totalPoints": 5000,
    "badges": ["Débutner", "Éco-Warrior", "Super-Héros"]
  }
}
```

## Variables d'Environnement pour Intégration

```env
# .env
PORT=3015

# URLs des autres services
SERVICE_USERS_URL=http://localhost:3001
SERVICE_CONTAINERS_URL=http://localhost:3002
SERVICE_ANALYTICS_URL=http://localhost:3005

# Notification settings
NOTIFICATION_SERVICE=http://localhost:3001/api/notifications
NOTIFY_ON_BADGE=true
NOTIFY_ON_CHALLENGE_COMPLETE=true

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecotrack_gamification
```

## Schéma de Communication Async (Kafka optionnel)

```javascript
// service-gamification/src/kafka/producers.js
const kafka = new Kafka({
  clientId: 'gamification-producer',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:19092']
});

const producer = kafka.producer();

// Publier quand un badge est gagné
await producer.send({
  topic: 'gamification-events',
  messages: [{
    key: userId,
    value: JSON.stringify({
      type: 'BADGE_EARNED',
      userId,
      badgeName: 'Éco-Warrior',
      timestamp: new Date()
    })
  }]
});
```

```javascript
// service-users/src/kafka/consumers.js (écoute les événements gamification)
const consumer = kafka.consumer({ groupId: 'service-users-group' });

await consumer.subscribe({ topic: 'gamification-events' });
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    if (event.type === 'BADGE_EARNED') {
      // Créer notification pour l'utilisateur
      await Notification.create({
        userId: event.userId,
        type: 'badge_earned',
        content: `Vous avez gagné le badge ${event.badgeName}!`
      });
    }
  }
});
```

## Erreurs Courantes et Solutions

### 1. Badge non attribué après points
**Problème**: Utilisateur a 100+ points mais pas le badge Débutner

**Solution**:
```javascript
// Déclencher manuellement
await GamificationService.checkAndAwardBadges(userId, totalPoints);
```

### 2. Défis ne se mettent pas à jour
**Problème**: Progress bloqué à 0

**Vérifications**:
- Utilisateur a-t-il rejoint le défi?
- Défi n'est-il pas expiré?
- `progressIncrement` > 0?

### 3. Leaderboard lent
**Solution**: Ajouter cache Redis
```javascript
// GET /api/gamification/leaderboard avec cache
const cached = await redis.get('leaderboard:top50');
if (cached) return JSON.parse(cached);

const leaderboard = await GamificationService.getLeaderboard(50);
await redis.setex('leaderboard:top50', 300, JSON.stringify(leaderboard));
return leaderboard;
```

## Performance et Scalabilité

### Indexes à ajouter (déjà dans schema.prisma)
```sql
CREATE INDEX idx_user_actions_userid ON user_actions(user_id);
CREATE INDEX idx_user_actions_timestamp ON user_actions(timestamp);
CREATE INDEX idx_user_badges_userid ON user_badges(user_id);
CREATE INDEX idx_challenge_participations_userid ON challenge_participations(user_id);
CREATE INDEX idx_challenge_participations_status ON challenge_participations(status);
```

### Caching Strategy
```
Leaderboard (5 min)
└─ /api/gamification/leaderboard

User Stats (2 min)
└─ /api/gamification/users/:id/stats

Active Challenges (1 min)
└─ /api/gamification/challenges
```

## Testing d'Intégration

```bash
# Test complet du flux
npm test -- gamification.integration.test.js

# Load testing
artillery run load-test.yml
```
