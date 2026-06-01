# Service Gamification - Exemples d'Utilisation

Base URL: `http://localhost:3015/api/gamification`

## 🎯 Points Management

### 1. Ajouter des points
```bash
curl -X POST http://localhost:3015/api/gamification/points/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "report",
    "points": 10
  }'
```

Response:
```json
{
  "id": "clzn8f7k400001q8z8z8z8z8z",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "report",
  "points": 10,
  "timestamp": "2026-06-01T10:30:00Z"
}
```

### 2. Obtenir le total de points
```bash
curl -X GET http://localhost:3015/api/gamification/points/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalPoints": 120
}
```

## 🏆 Badge Management

### 3. Obtenir les badges d'un utilisateur
```bash
curl -X GET http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/badges
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "badges": [
    {
      "id": "badge-1",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "bd-1",
      "awardedAt": "2026-05-15T10:30:00Z",
      "badge": {
        "id": "bd-1",
        "name": "Débutner",
        "description": "Premier pas en éco-engagement",
        "pointsRequired": 100
      }
    }
  ],
  "count": 1
}
```

### 4. Attribuer un badge (manuel)
```bash
curl -X POST http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/badges/badge-1 \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "id": "ub-123",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "badgeId": "badge-1",
  "awardedAt": "2026-06-01T10:30:00Z",
  "badge": {
    "id": "badge-1",
    "name": "Éco-Warrior",
    "description": "Guerrier écologique confirmé",
    "pointsRequired": 500
  }
}
```

## 🎮 Challenges

### 5. Créer un défi
```bash
curl -X POST http://localhost:3015/api/gamification/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Signaler 10 conteneurs",
    "description": "Signalez 10 conteneurs défectueux ou mal placés",
    "objective": 10,
    "reward": 100,
    "type": "individual",
    "period": "weekly",
    "endDate": "2026-06-08T23:59:59Z"
  }'
```

Response:
```json
{
  "id": "ch-123",
  "title": "Signaler 10 conteneurs",
  "description": "Signalez 10 conteneurs défectueux ou mal placés",
  "objective": 10,
  "reward": 100,
  "type": "individual",
  "period": "weekly",
  "endDate": "2026-06-08T23:59:59Z",
  "createdAt": "2026-06-01T10:30:00Z"
}
```

### 6. Lister les défis actifs
```bash
curl -X GET http://localhost:3015/api/gamification/challenges
```

Response:
```json
{
  "challenges": [
    {
      "id": "ch-123",
      "title": "Signaler 10 conteneurs",
      "objective": 10,
      "reward": 100,
      "type": "individual",
      "period": "weekly",
      "endDate": "2026-06-08T23:59:59Z"
    },
    {
      "id": "ch-124",
      "title": "Zéro débordement du quartier",
      "objective": 50,
      "reward": 250,
      "type": "collective",
      "period": "weekly",
      "endDate": "2026-06-08T23:59:59Z"
    }
  ],
  "count": 2
}
```

### 7. Rejoindre un défi
```bash
curl -X POST http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/challenges/ch-123/join \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "id": "cp-456",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "challengeId": "ch-123",
  "progress": 0,
  "status": "in_progress",
  "joinedAt": "2026-06-01T10:30:00Z",
  "challenge": {
    "id": "ch-123",
    "title": "Signaler 10 conteneurs",
    "objective": 10,
    "reward": 100
  }
}
```

### 8. Mettre à jour la progression
```bash
curl -X PUT http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/challenges/ch-123/progress \
  -H "Content-Type: application/json" \
  -d '{
    "progressIncrement": 5
  }'
```

Response:
```json
{
  "id": "cp-456",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "challengeId": "ch-123",
  "progress": 5,
  "status": "in_progress",
  "completedAt": null,
  "challenge": {
    "id": "ch-123",
    "title": "Signaler 10 conteneurs",
    "objective": 10,
    "reward": 100
  }
}
```

### 9. Obtenir les défis d'un utilisateur
```bash
curl -X GET http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/challenges
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "challenges": [
    {
      "id": "cp-456",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "challengeId": "ch-123",
      "progress": 5,
      "status": "in_progress",
      "joinedAt": "2026-06-01T10:30:00Z",
      "challenge": {
        "id": "ch-123",
        "title": "Signaler 10 conteneurs",
        "objective": 10,
        "reward": 100
      }
    }
  ],
  "count": 1
}
```

## 🏅 Leaderboard

### 10. Obtenir le classement (Top 50)
```bash
curl -X GET "http://localhost:3015/api/gamification/leaderboard?limit=50"
```

Response:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "totalPoints": 1500,
      "badgeCount": 3,
      "badges": ["Débutner", "Éco-Warrior", "Super-Héros"]
    },
    {
      "rank": 2,
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "totalPoints": 1250,
      "badgeCount": 2,
      "badges": ["Débutner", "Éco-Warrior"]
    },
    {
      "rank": 3,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "totalPoints": 120,
      "badgeCount": 0,
      "badges": []
    }
  ],
  "count": 3
}
```

### 11. Obtenir le top 10
```bash
curl -X GET "http://localhost:3015/api/gamification/leaderboard?limit=10"
```

## 📊 Statistics

### 12. Obtenir les statistiques d'un utilisateur
```bash
curl -X GET http://localhost:3015/api/gamification/users/550e8400-e29b-41d4-a716-446655440000/stats
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalPoints": 120,
  "weeklyPoints": 45,
  "monthlyPoints": 85,
  "badgeCount": 0,
  "badges": [],
  "rank": 3,
  "averagePoints": 512,
  "recentActions": [
    {
      "id": "action-1",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "action": "report",
      "points": 10,
      "timestamp": "2026-06-01T10:30:00Z"
    }
  ],
  "co2Saved": 60
}
```

## 🎁 Rewards

### 13. Attribuer une récompense
```bash
curl -X POST http://localhost:3015/api/gamification/reward/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "reward": "discount_10_percent"
  }'
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "reward": "discount_10_percent",
  "status": "awarded",
  "awardedAt": "2026-06-01T10:30:00Z"
}
```

## 🔍 Test Workflow Complet

```bash
#!/bin/bash

# Variables
USER_ID="550e8400-e29b-41d4-a716-446655440000"
BASE_URL="http://localhost:3015/api/gamification"

echo "1️⃣ Créer un défi..."
CHALLENGE=$(curl -s -X POST $BASE_URL/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Challenge",
    "objective": 5,
    "reward": 50,
    "type": "individual",
    "period": "weekly",
    "endDate": "2026-12-31T23:59:59Z"
  }')

CHALLENGE_ID=$(echo $CHALLENGE | jq -r '.id')
echo "Challenge créé: $CHALLENGE_ID"

echo "2️⃣ Utilisateur rejoint le défi..."
curl -s -X POST $BASE_URL/users/$USER_ID/challenges/$CHALLENGE_ID/join

echo "3️⃣ Ajouter des points..."
curl -s -X POST $BASE_URL/points/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{ "action": "report" }'

echo "4️⃣ Progresser dans le défi..."
curl -s -X PUT $BASE_URL/users/$USER_ID/challenges/$CHALLENGE_ID/progress \
  -H "Content-Type: application/json" \
  -d '{ "progressIncrement": 5 }'

echo "5️⃣ Afficher les stats..."
curl -s -X GET $BASE_URL/users/$USER_ID/stats | jq

echo "6️⃣ Afficher le classement..."
curl -s -X GET $BASE_URL/leaderboard | jq
```

## ⚠️ Gestion des Erreurs

### Badge déjà attribué
```bash
curl -X POST http://localhost:3015/api/gamification/users/user-1/badges/badge-1
```

Response:
```json
{
  "error": "Badge already awarded",
  "code": "ALREADY_EXISTS"
}
```

### Utilisateur non trouvé dans défi
```bash
curl -X PUT http://localhost:3015/api/gamification/users/user-1/challenges/invalid-challenge/progress \
  -H "Content-Type: application/json" \
  -d '{ "progressIncrement": 1 }'
```

Response:
```json
{
  "error": "User not participating in this challenge",
  "code": "GAME_ERROR"
}
```

### Validation manquante
```bash
curl -X POST http://localhost:3015/api/gamification/points/user-1 \
  -H "Content-Type: application/json" \
  -d '{ }'
```

Response:
```json
{
  "error": "Action is required",
  "code": "VALIDATION_ERROR"
}
```
