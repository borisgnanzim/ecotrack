# 🔍 Audit de Cohérence - Schémas Prisma

**Date**: Juin 1, 2026  
**Status**: ⚠️ **PLUSIEURS INCOHÉRENCES DÉTECTÉES**

---

## 📊 Vue d'Ensemble

| Service | Statut | Problèmes |
|---------|--------|-----------|
| service-users | ⚠️ Partiel | UUID User ID, relations manquantes |
| service-containers | ❌ Critique | UUID ID ≠ service-routes (Int) |
| service-routes | 🔴 Critique | **Doublons User/Container/Route, ID incohérents** |
| service-gamification | ✅ Bon | UUID userId cohérent |
| service-iot | ❌ Critique | Int containerId ≠ service-containers UUID |
| service-analytics | ⚠️ Partiel | Références Int container_id |

---

## 🔴 PROBLÈMES CRITIQUES

### 1. **Doublons dans service-routes** ⚠️⚠️⚠️
**Fichier**: `backend/service-routes/prisma/schema.prisma`

```
❌ User défini 2 fois (lignes ~9 et ~45)
❌ Container défini 2 fois (lignes ~21 et ~55)
❌ Route défini 2 fois (lignes ~35 et ~70)
```

**Impact**: Les migrations vont échouer!

**Solution**: Garder UNE SEULE définition avec toutes les relations

---

### 2. **Types d'ID Incohérents** 🆔
```
service-containers:
  ✅ id_conteneur: String @db.Uuid

service-routes:
  ❌ Container.id_conteneur: Int (autoincrement)
  ❌ User.id: Int (autoincrement)

service-gamification:
  ✅ userId: String @db.Uuid

service-iot:
  ❌ containerId: Int
  ❌ Référence service-containers qui utilise UUID!
```

**Problème**: `service-iot` et `service-routes` ne peuvent pas référencer `service-containers` (UUID ≠ Int)

---

### 3. **Naming Conventions Incohérents** 📝
```
Conteneurs:
  service-containers: conteneur (minuscule), id_conteneur
  service-routes: Container (PascalCase), id_conteneur
  service-iot: containerId (camelCase)

Timestamps:
  service-containers: createdAt, updatedAt
  service-routes: created_at, start_time, end_time
  service-users: createdAt
  service-analytics: createdAt

Routes:
  service-routes: created_at (snake_case)
  service-containers: createdAt (camelCase)
```

---

### 4. **Relations Manquantes**
```javascript
// ❌ service-users n'a pas de relation User ↔ Notifications
// Elle existe mais userId optionnel avec référence faible

// ❌ service-routes Container → FillHistory (n'existe pas)
// Mais service-containers a FillHistory

// ✅ service-routes User ↔ Route (OK)
```

---

## 📋 Matrice de Compatibilité

### User ID
| Service | Type | Format | Notes |
|---------|------|--------|-------|
| service-users | String | UUID ✅ | Correct |
| service-routes | Int | autoincrement ❌ | Incohérent! |
| service-gamification | String | UUID ✅ | Correct |

### Container ID
| Service | Type | Format | Notes |
|---------|------|--------|-------|
| service-containers | String | UUID ✅ | Correct |
| service-routes | Int | autoincrement ❌ | INCOMPATIBLE! |
| service-iot | Int | autoincrement ❌ | INCOMPATIBLE! |
| service-analytics | Int | autoincrement ❌ | INCOMPATIBLE! |

---

## 🛠️ CORRECTIONS NÉCESSAIRES

### Priorité 1: URGENT
1. **Supprimer les doublons dans service-routes**
2. **Unifier les types d'ID à UUID pour User et Container**
3. **Standardiser les naming conventions**

### Priorité 2: Important
4. **Ajouter les relations manquantes**
5. **Fixer les timestamps (camelCase partout)**
6. **Documenter les foreign keys**

---

## ✅ RECOMMANDATIONS

### 1. Types d'ID STANDARDISÉS
```prisma
// ✅ À utiliser PARTOUT
model User {
  id          String   @id @default(uuid()) @db.Uuid
  email       String   @unique
  // ...
}

model Container {
  id          String   @id @default(uuid()) @db.Uuid
  code        Int      @unique  // Code spécifique, pas PK
  // ...
}
```

### 2. Naming Convention STANDARDISÉE
```prisma
// ✅ Toujours camelCase pour les champs
model Route {
  id              String    @id @default(uuid()) @db.Uuid
  date            DateTime
  startTime       DateTime?
  endTime         DateTime?
  agentId         String    @db.Uuid
  containerIds    String[]  @default([])
  totalDistance   Float?
  estimatedTime   Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  agent           User      @relation(fields: [agentId], references: [id])
  steps           RouteStep[]
}
```

### 3. Enums CENTRALISÉS
Créer un fichier `shared/enums.prisma`:
```prisma
enum RouteStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AlertType {
  CRITICAL_FILL
  SENSOR_OFFLINE
  TEMPERATURE_ANOMALY
  MAINTENANCE
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}
```

### 4. Relations EXPLICITES
```prisma
// ✅ service-routes
model Container {
  id         String      @id @default(uuid()) @db.Uuid
  routeSteps RouteStep[]
}

model RouteStep {
  id          String    @id @default(uuid()) @db.Uuid
  routeId     String    @db.Uuid
  containerId String    @db.Uuid
  
  route       Route     @relation(fields: [routeId], references: [id])
  container   Container @relation(fields: [containerId], references: [id])
}
```

---

## 📊 Statistiques Audit

```
Total Services: 6
Services avec Schéma: 6

✅ Bon état: 1 (service-gamification)
⚠️ Partiel: 2 (service-users, service-analytics)
❌ Critique: 3 (service-containers, service-routes, service-iot)

Doublons détectés: 3 (User, Container, Route dans service-routes)
Incohérences d'ID: 7
Naming conflicts: 12
Relations manquantes: 2
```

---

## 🎯 Plan d'Action

### Phase 1: Nettoyage (Immédiat)
- [ ] Supprimer les doublons dans service-routes
- [ ] Fixer le schéma service-routes

### Phase 2: Standardisation (Court terme)
- [ ] Unifier les types d'ID à UUID partout
- [ ] Standardiser camelCase pour tous les champs
- [ ] Ajouter les relations manquantes

### Phase 3: Documentation (Moyen terme)
- [ ] Créer schema.md central
- [ ] Documenter toutes les relations inter-services
- [ ] Établir conventions de nommage

### Phase 4: Validation (Avant déploiement)
- [ ] Tester les migrations de tous les services
- [ ] Valider les relations avec Prisma Studio
- [ ] Vérifier l'intégrité des contraintes FK

---

## 📝 Checklist Correction

- [ ] service-routes: Supprimer doublons
- [ ] service-routes: Changer User.id UUID
- [ ] service-routes: Changer Container.id_conteneur UUID
- [ ] service-iot: Changer containerId Int → String UUID
- [ ] service-analytics: Changer container_id Int → String UUID
- [ ] Tous: Standardiser timestamps (camelCase)
- [ ] Tous: Ajouter relations manquantes
- [ ] Tous: Documenter les FK
- [ ] Tous: Tester les migrations

