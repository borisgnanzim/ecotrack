# 📊 Matrice Détaillée des Changements de Schémas

---

## 1️⃣ Service Routes

### AVANT ❌
```prisma
model User {
  id        Int      @id @default(autoincrement())  // ❌ Int!
  // ...doublons User, Container, Route
}

model Route {
  agent_id        Int?              // ❌ Int, doublé
  containers_list Int[]             // ❌ Mauvais type
  status          RouteStatus @default(planned)  // ❌ minuscule
}

enum RouteStatus {
  planned         // ❌ minuscule
  in_progress     // ❌ snake_case
  completed
  cancelled
}
```

### APRÈS ✅
```prisma
model User {
  id            String    @id @default(uuid()) @db.Uuid  // ✅ UUID
  username      String    @unique
  email         String    @unique
  password      String
  // ... (pas de doublon)
}

model Route {
  agentId              String       @db.Uuid    // ✅ UUID, camelCase
  agent                User?        @relation("UserRoutes", fields: [agentId], references: [id])
  containerIds         String[]     @default([]) // ✅ Meilleure sémantique
  status               RouteStatus  @default(PLANNED)  // ✅ CONSTANT_CASE
  startTime            DateTime?     // ✅ camelCase
  endTime              DateTime?     // ✅ camelCase
  totalDistance        Float?       // ✅ camelCase
  estimatedTime        Int?
}

enum RouteStatus {
  PLANNED           // ✅ CONSTANT_CASE
  IN_PROGRESS       // ✅ snake_case vers _
  COMPLETED
  CANCELLED
}
```

**Changements**: 5 doublons supprimés, 15+ champs renommés, types d'ID standardisés

---

## 2️⃣ Service Containers

### AVANT ❌
```prisma
model conteneur {              // ❌ minuscule (non-standard)
  id_conteneur   String    @id @default(uuid()) @db.Uuid
  type_Dechet    String        // ❌ camelCase incohérent
  Statut         String?       // ❌ PascalCase!
  capacite_i     Int?          // ❌ nom obscur
  code_conteneur Int           // ❌ underscore
  photo_url      String?       // ❌ snake_case
}

model FillHistory {
  niveau         Int           // ❌ nom français
  recordedAt     DateTime      // ✅ Ok mais incohérent avec conteneur
  conteneurId    String
}
```

### APRÈS ✅
```prisma
model Container {              // ✅ PascalCase standard
  id            String    @id @default(uuid()) @db.Uuid
  type          String        // ✅ camelCase uniforme
  status        String?       // ✅ camelCase uniforme
  zoneId        String        // ✅ camelCase
  capacity      Int?          // ✅ nom clair
  code          Int           // ✅ simple
  photoUrl      String?       // ✅ camelCase
  createdAt     DateTime      // ✅ uniforme
  updatedAt     DateTime      // ✅ uniforme
  
  fillHistory   FillHistory[] // ✅ relation explicite
}

model FillHistory {
  fillLevel     Int           // ✅ anglais clair
  recordedAt    DateTime      // ✅ cohérent
  containerId   String @db.Uuid  // ✅ cohérent
  container     Container    @relation(fields: [containerId], references: [id])
}
```

**Changements**: 8 champs renommés, noms standardisés, relations ajoutées

---

## 3️⃣ Service IoT

### AVANT ❌
```prisma
model Measurement {
  containerId  Int          // ❌ Int, incompatible avec service-containers (UUID)!
  fillLevel    Int          // ✅ Ok
  // ...
}

model SensorStatus {
  containerId     Int       @unique  // ❌ Int incompatible
  lastSeen        DateTime?
  // ...
}

model Alert {
  containerId  Int          // ❌ Int incompatible
  type         AlertType
  resolved     Boolean      // ❌ pas de resolvedAt
}

enum AlertType {
  CRITICAL_FILL        // ✅ Ok
  SENSOR_OFFLINE       // ✅ Ok
  TEMPERATURE_ANOMALY  // ✅ Ok
  MAINTENANCE          // ❌ manquant HUMIDITY_ANOMALY
}
```

### APRÈS ✅
```prisma
model Measurement {
  containerId   String    @db.Uuid    // ✅ UUID compatible!
  fillLevel     Int
  temperature   Float?
  humidity      Float?
  createdAt     DateTime
  anomaly       Boolean
}

model SensorStatus {
  containerId     String @db.Uuid @unique  // ✅ UUID compatible
  lastFillLevel   Int?
  lastTemperature Float?
  lastHumidity    Float?
  lastSeen        DateTime?
  updatedAt       DateTime @updatedAt
}

model Alert {
  containerId   String    @db.Uuid    // ✅ UUID compatible
  type          AlertType
  resolved      Boolean
  resolvedAt    DateTime?             // ✅ Ajouté
  createdAt     DateTime
}

enum AlertType {
  CRITICAL_FILL           // ✅ CONSTANT_CASE
  SENSOR_OFFLINE
  TEMPERATURE_ANOMALY
  HUMIDITY_ANOMALY        // ✅ Ajouté
  MAINTENANCE
}
```

**Changements**: Tous les Int → UUID String, resolvedAt ajouté, indexes ajoutés

---

## 4️⃣ Service Analytics

### AVANT ❌
```prisma
model ContainerMetrics {
  container_id    Int         // ❌ Int, incompatible!
  avg_fill_level  Float       // ❌ snake_case
  max_fill_level  Int         // ❌ snake_case
  collection_count Int        // ❌ snake_case
  total_weight    Float       // ❌ snake_case
}

model AgentMetrics {
  agent_id        Int         // ❌ Int, incompatible!
  routes_completed Int        // ❌ snake_case
  routes_planned  Int         // ❌ snake_case
  total_distance  Float       // ❌ snake_case
}

// 12+ autres champs snake_case
```

### APRÈS ✅
```prisma
model ContainerMetrics {
  containerId     String @db.Uuid   // ✅ UUID compatible
  date            DateTime @db.Date
  avgFillLevel    Float              // ✅ camelCase
  maxFillLevel    Int                // ✅ camelCase
  collectionCount Int                // ✅ camelCase
  totalWeight     Float              // ✅ camelCase
  createdAt       DateTime
}

model AgentMetrics {
  agentId             String @db.Uuid   // ✅ UUID compatible
  date                DateTime @db.Date
  routesCompleted     Int                // ✅ camelCase
  routesPlanned       Int                // ✅ camelCase
  totalDistance       Float              // ✅ camelCase
  totalTime           Int                // ✅ camelCase
  containersCollected Int                // ✅ camelCase
}

// Tous les enums en CONSTANT_CASE
enum AnomalyType {
  SENSOR_FAILURE        // ✅ (était sensor_failure)
  ABNORMAL_FILL_RATE    // ✅ (était abnormal_fill_rate)
  MISSED_COLLECTION
  ROUTE_DEVIATION
  EQUIPMENT_FAILURE
}
```

**Changements**: 15+ champs renommés, 5 enums standardisés, UUID compatibility

---

## 5️⃣ Service Users

### AVANT ⚠️
```prisma
model User {
  id            String         @id @default(uuid())  // ⚠️ Pas @db.Uuid!
  username      String         // ⚠️ Pas @unique
  email         String         @unique
  password      String
  badges        String[]       // ✅ Ok pour JSON array
  createdAt     DateTime
  // ⚠️ Pas updatedAt
  notifications Notification[]
}

model Notification {
  userId    String?        // ⚠️ Optionnel weak FK
  user      User?          @relation(fields: [userId], references: [id])
  type      NotificationType @default(info)  // ⚠️ minuscule
}

enum NotificationType {
  info              // ⚠️ minuscule
  success
  warning
  error
}
```

### APRÈS ✅
```prisma
model User {
  id            String    @id @default(uuid()) @db.Uuid  // ✅ Explicite UUID
  username      String    @unique                         // ✅ Unique pour auth
  email         String    @unique
  password      String
  name          String?
  points        Int       @default(0)
  address       String?
  phone         String?
  avatar        String?
  badges        String[]
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt                      // ✅ Ajouté
  
  notifications Notification[]
  roles         Role[]    @relation("UserRoles")
}

model Notification {
  userId    String        @db.Uuid                       // ✅ Required FK
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType @default(INFO)             // ✅ CONSTANT_CASE
  isRead    Boolean       @default(false)
  createdAt DateTime      @default(now())
  
  @@index([userId])
}

enum NotificationType {
  INFO              // ✅ CONSTANT_CASE
  SUCCESS
  WARNING
  ERROR
}

model Role {
  id    String @id @default(uuid()) @db.Uuid
  name  String @unique
  users User[] @relation("UserRoles")
}
```

**Changements**: Ajouté @db.Uuid, updatedAt, indexes, roles relation, enums standardisés

---

## 6️⃣ Service Gamification

### ✅ AUCUN CHANGEMENT (Déjà Cohérent!)
```prisma
model UserAction {
  userId    String   @db.Uuid    // ✅ Correct!
  action    String
  points    Int
  timestamp DateTime @default(now())
}

model Challenge {
  id        String   @id @default(cuid())
  title     String
  objective Int
  reward    Int
  // ✅ Tous les champs corrects
}
```

**Changements**: Aucun - Déjà conforme!

---

## 📊 Récapitulatif des Changements

| Service | Avant | Après | Changements |
|---------|-------|-------|-----------|
| routes | 3 doublons ❌ | 0 doublon ✅ | 5 doublons éliminés |
| routes | Int IDs ❌ | UUID IDs ✅ | 2 types convertis |
| routes | 10 snake_case ❌ | camelCase ✅ | 15 champs renommés |
| containers | Noms obscurs ❌ | Clairs ✅ | 8 champs renommés |
| iot | Int ≠ containers ❌ | UUID compatible ✅ | 3 colonnes convertis |
| analytics | 15 snake_case ❌ | camelCase ✅ | 20+ champs renommés |
| users | UUID implicite ⚠️ | Explicite ✅ | Ajouté @db.Uuid |
| gamification | ✅ Bon | ✅ Bon | Aucun |

---

## 🎯 Conformité Finale

```
AVANT: 
  ❌ 3 doublons
  ❌ 5 incompatibilités d'ID
  ❌ 40+ incohérences de nommage
  ❌ 12 enums non-standardisés

APRÈS:
  ✅ 0 doublon
  ✅ 100% UUID compatible
  ✅ camelCase uniforme
  ✅ Enums CONSTANT_CASE
  ✅ Relations explicites
  ✅ Indexes appropriés
```

---

## 📝 Détail par Service

### service-routes
```diff
- AVANT: User { id: Int }
+ APRÈS: User { id: String @db.Uuid }

- AVANT: Container { id_conteneur: Int }
+ APRÈS: Container { id: String @db.Uuid }

- AVANT: route { agent_id, total_distance, estimated_time }
+ APRÈS: route { agentId, totalDistance, estimatedTime }

- AVANT: enum RouteStatus { planned, in_progress }
+ APRÈS: enum RouteStatus { PLANNED, IN_PROGRESS }
```

### service-containers
```diff
- AVANT: model conteneur { id_conteneur, type_Dechet, Statut }
+ APRÈS: model Container { id, type, status }

- AVANT: FillHistory { niveau, recordedAt, conteneurId }
+ APRÈS: FillHistory { fillLevel, recordedAt, containerId }
```

### service-iot
```diff
- AVANT: Measurement { containerId: Int }
+ APRÈS: Measurement { containerId: String @db.Uuid }

- AVANT: Alert { resolved: Boolean }
+ APRÈS: Alert { resolved: Boolean, resolvedAt: DateTime? }

- AVANT: enum AlertType { TEMPERATURE_ANOMALY } (missing HUMIDITY)
+ APRÈS: enum AlertType { TEMPERATURE_ANOMALY, HUMIDITY_ANOMALY }
```

### service-analytics
```diff
- AVANT: ContainerMetrics { container_id: Int, avg_fill_level }
+ APRÈS: ContainerMetrics { containerId: String @db.Uuid, avgFillLevel }

- AVANT: AgentMetrics { agent_id: Int, routes_completed }
+ APRÈS: AgentMetrics { agentId: String @db.Uuid, routesCompleted }

- AVANT: enum AnomalyType { sensor_failure, abnormal_fill_rate }
+ APRÈS: enum AnomalyType { SENSOR_FAILURE, ABNORMAL_FILL_RATE }
```

### service-users
```diff
- AVANT: User { id: String @id @default(uuid()) }
+ APRÈS: User { id: String @id @default(uuid()) @db.Uuid }

- AVANT: Notification { userId: String? }
+ APRÈS: Notification { userId: String @db.Uuid }

- AVANT: enum NotificationType { info, success }
+ APRÈS: enum NotificationType { INFO, SUCCESS }

- AVANT: User { createdAt } (pas d'updatedAt)
+ APRÈS: User { createdAt, updatedAt }
```

