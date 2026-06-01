# 🔗 Diagramme de Cohérence Inter-Services

---

## Architecture Globale (APRÈS Corrections)

```
┌─────────────────────────────────────────────────────────────────┐
│                     ECOTRACK MICROSERVICES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ service-users  │  │ service-routes │  │ service-iod   │   │
│  │   (Auth, JWT)  │  │  (Optimize)    │  │  (Sensors)    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│         │                    │                      │          │
│         │ User.id (UUID)     │ agentId (UUID)     │ containerId
│         │                    │ containerId (UUID)  │ (UUID)   │
│  ┌──────┴────────────────────┴──────────┬─────────┘          │
│  │                                       │                    │
│  ▼                                       ▼                    │
│  ┌────────────────────────────────────────────────┐          │
│  │   service-containers                          │          │
│  │   Container { id: UUID, capacity, status... } │          │
│  │   FillHistory { containerId: UUID }           │          │
│  └────────────────────────────────────────────────┘          │
│         │                       │                            │
│         │ containerId (UUID)    │ containerId (UUID)         │
│         │                       │                            │
│  ┌──────┴─────┐        ┌────────┴──────────┐               │
│  │             │        │                   │               │
│  ▼             ▼        ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ service-analytics                                    │  │
│  │ ContainerMetrics { containerId: UUID,... }         │  │
│  │ AgentMetrics { agentId: UUID,... }                 │  │
│  │ FillPrediction { containerId: UUID,... }           │  │
│  │ Anomaly { containerId: UUID,... }                  │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                   │
│         │ userId (UUID)                                    │
│  ┌──────┴────────────────────────────────────┐           │
│  │                                            │           │
│  ▼                                            ▼           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ service-gamification                                 │  │
│  │ UserAction { userId: UUID, points... }             │  │
│  │ UserBadge { userId: UUID, ... }                     │  │
│  │ ChallengeParticipation { userId: UUID, ... }       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux de Données Entre Services

### 1️⃣ Création d'une Route (service-routes utilise service-containers)

```
CLIENT
  │
  ▼
POST /api/routes
  │
  └─► service-routes:routeController.createRoute()
        │
        ├─► Créer Route avec agentId: UUID ✅
        │   └─ Valide contre service-users User.id (UUID)
        │
        ├─► Créer RouteStep[] avec containerId: UUID ✅
        │   └─ Valide contre service-containers Container.id (UUID)
        │
        └─► Response: Route avec steps
              └─ Tous les IDs sont UUID ✅
```

### 2️⃣ Mise à Jour des Métriques (service-analytics récupère container data)

```
service-containers:
  Container { id: UUID, fillLevel, status, ... }
    │
    ▼ Event: containerId (UUID)
    │
service-analytics:
  ContainerMetrics.create({
    containerId: "550e8400-..." (UUID) ✅
    avgFillLevel: 45.5
    maxFillLevel: 87
    date: NOW()
  })
```

### 3️⃣ Attribution des Points (service-gamification utilise service-users)

```
service-iot:
  Alert { containerId: UUID, type: CRITICAL_FILL }
    │
    ▼ Event: Collection completed
    │
service-gamification:
  UserAction.create({
    userId: "550e8400-..." (UUID) ✅
    action: "collection_completed"
    points: 10
  })
    │
    ▼ Auto-check for badges
    │
service-users:
  Notification.create({
    userId: "550e8400-..." (UUID) ✅
    type: INFO
    message: "🎉 Vous avez gagné le badge Débutant!"
  })
```

---

## Matrice de Compatibilité UUID

### AVANT (Incohérent ❌)

```
service-routes           service-containers      service-iot         service-analytics
├─ User.id: Int         ├─ Container.id: UUID   ├─ containerId: Int  ├─ container_id: Int
├─ Container.id: Int    └─                      └─                   ├─ agent_id: Int
└─                                                                     └─
  ❌ Int → UUID                                          ❌ Int mismatch
  ❌ Int → UUID mismatch                                ❌ Int mismatch
```

### APRÈS (Cohérent ✅)

```
service-routes           service-containers      service-iot           service-analytics
├─ User.id: UUID        ├─ Container.id: UUID   ├─ containerId: UUID  ├─ containerId: UUID
├─ Container.id: UUID   └─                      └─                    ├─ agentId: UUID
└─                                                                      └─
  ✅ Tous UUID                                    ✅ Tous UUID
  ✅ Compatible!                                  ✅ Compatible!
```

---

## Graph de Dépendances (Après)

```
service-users          service-containers         service-routes
    │                       │                          │
    │ User.id (UUID)        │ Container.id (UUID)      │ Routes
    │ + Notification        │ + FillHistory            │ + Steps
    │                       │                          │
    └───────────┬───────────┴───────────┬──────────────┘
                │                       │
                │ (aggregation)         │ (references)
                │                       │
                ▼                       ▼
            service-analytics      service-iot
                │                      │
                ├─ Metrics             ├─ Measurements
                ├─ Predictions         ├─ Alerts
                └─ Reports             └─ SensorStatus
                                           │
                                           │ (userId from routes)
                                           ▼
                                    service-gamification
                                    (bonus on alerts/anomalies)
```

---

## Exemples de Requêtes Inter-Services (APRÈS Corrections)

### ✅ Exemple 1: Récupérer les routes d'un agent avec ses conteneurs

```javascript
// service-routes controller
const agentRoutes = await prisma.route.findMany({
  where: {
    agentId: '550e8400-e29b-41d4-a716-446655440000' // UUID String ✅
  },
  include: {
    agent: {
      select: { id: true, username: true, email: true }
    },
    steps: {
      include: {
        container: {
          select: { id: true, type: true, capacity: true }
        }
      }
    }
  }
});

// Response:
{
  routes: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      agentId: '550e8400-e29b-41d4-a716-446655440000', // UUID ✅
      status: 'IN_PROGRESS',
      agent: {
        id: '550e8400-e29b-41d4-a716-446655440000',      // UUID ✅
        username: 'agent_01'
      },
      steps: [
        {
          containerId: '550e8400-e29b-41d4-a716-446655440002', // UUID ✅
          container: {
            id: '550e8400-e29b-41d4-a716-446655440002',  // UUID ✅
            type: 'recyclage',
            capacity: 240
          }
        }
      ]
    }
  ]
}
```

### ✅ Exemple 2: Créer des métriques pour un conteneur

```javascript
// service-analytics
const containerMetrics = await prisma.containerMetrics.create({
  data: {
    containerId: '550e8400-e29b-41d4-a716-446655440002', // UUID ✅
    date: new Date().toISOString().split('T')[0],
    avgFillLevel: 45.2,
    maxFillLevel: 87,
    minFillLevel: 12,
    collectionCount: 3,    // ✅ camelCase
    totalWeight: 250.5,    // ✅ camelCase
    createdAt: new Date()
  }
});

// Les autres services peuvent utiliser cet ID directement
// car il correspond à Container.id ✅
```

### ✅ Exemple 3: Attribuer des points pour une collecte

```javascript
// service-gamification
async function awardPointsForCollection(userId, containerId) {
  // userId vient de service-routes (agentId) ✅
  // containerId vient de service-iot ou service-containers ✅
  
  const userAction = await prisma.userAction.create({
    data: {
      userId: userId,                  // UUID ✅
      action: 'collection_completed',
      points: 10,
      timestamp: new Date()
    }
  });

  // Récupérer les points totaux
  const totalPoints = await prisma.userAction.aggregate({
    where: { userId: userId },        // UUID ✅
    _sum: { points: true }
  });

  // Vérifier les badges
  if (totalPoints._sum.points >= 100) {
    // Créer une notification via service-users
    await notificationService.notify(userId, {
      type: 'SUCCESS',
      message: '🎉 Badge Débutant débloqué!'
    });
  }
}
```

---

## Vérification d'Intégrité Référentielle

### ✅ Avant insertion dans chaque service

```javascript
// Validations que Prisma effectue automatiquement (APRÈS corrections)

// Service-routes: Insérer une route
await prisma.route.create({
  data: {
    agentId: '550e8400-e29b-41d4-a716-446655440000',
    steps: {
      create: [{
        containerId: '550e8400-e29b-41d4-a716-446655440001'
      }]
    }
  }
});

// ✅ Prisma vérifie automatiquement:
// 1. agentId existe dans service-users.User.id
// 2. containerId existe dans service-containers.Container.id
// 3. Types matchent (String UUID vs String UUID) ✅
```

---

## Comparaison: AVANT vs APRÈS

### AVANT ❌ (Problèmes)

```
┌─ service-routes ────────────────┐
│ Route.agentId: Int(5)          │
└────────────────────────────────┘
                 │
                 ▼ MISMATCH! ❌
┌─ service-users ────────────────┐
│ User.id: String UUID           │
└────────────────────────────────┘

ERREUR: Foreign key constraint violation!
"Cannot insert value 5 (Int) into agentId (String UUID)"
```

### APRÈS ✅ (Résolu)

```
┌─ service-routes ────────────────┐
│ Route.agentId: String UUID     │
└────────────────────────────────┘
                 │
                 ▼ MATCH! ✅
┌─ service-users ────────────────┐
│ User.id: String UUID           │
└────────────────────────────────┘

✅ Insertion réussie!
agentId: "550e8400-e29b-41d4-a716-446655440000"
```

---

## Avantages de la Standardisation

### 1. **Scalabilité**
```
❌ AVANT: Int autoincrement
   - Max 2 milliards de records par table
   - Impossible de distribuer les données

✅ APRÈS: UUID
   - Croissance illimitée
   - Peut fragmenter données entre services
   - Peut utiliser UUID v5 pour déterministe si nécessaire
```

### 2. **Intégrité Référentielle**
```
❌ AVANT: Type mismatch (Int vs UUID)
   - Impossible de maintenir FKs entre services
   - Intégrité manuelle dans le code

✅ APRÈS: Types cohérents
   - Prisma vérifie les FKs automatiquement
   - Cascade delete fonctionne
   - Migrations vérifiées au build
```

### 3. **Maintenabilité**
```
❌ AVANT: Noms incohérents
   - agent_id vs agentId
   - type_Dechet vs type
   - avg_fill_level vs avgFillLevel
   - Développeurs confus

✅ APRÈS: Camelcase uniforme
   - agentId partout
   - type partout
   - avgFillLevel partout
   - Code uniforme et lisible
```

### 4. **Documentation Automatique**
```
✅ Après corrections:
   - Prisma Client auto-complète les noms
   - Types TypeScript correctement générés
   - Relations visibles dans schema.prisma
   - Enums standards documentés
```

---

## Migration Checklist (Pour Déploiement)

```bash
☐ npm run prisma:generate    # Dans chaque service
☐ npm run prisma:migrate     # Appliquer les migrations
☐ npx prisma studio          # Valider la structure

☐ Test: User peut être créé avec UUID
☐ Test: Container peut être créé avec UUID
☐ Test: Route peut être créée avec agentId + containerId UUIDs
☐ Test: FKs vérifient les UUIDs correctement
☐ Test: Cascade delete fonctionne

☐ Update API clients avec nouveaux noms de champs
☐ Redéployer tous les services
☐ Valider les logs: pas d'erreurs FK
☐ Tester les flows inter-services
```

