# Partitionnement de FillHistory

## Objectif

La table FillHistory stocke les historiques de remplissage des conteneurs.  
Avec 10 000 conteneurs et 96 mesures/jour, elle peut atteindre 350 millions de lignes par an.  
Pour maintenir les performances, nous avons choisi de **partitionner la table par date**.

---

## Stratégie de partitionnement

- **Type** : RANGE
- **Colonne** : recordedAt
- **Granularité** : mensuelle
- **Nom des partitions** : FillHistory_YYYY_MM (ex: FillHistory_2025_01)

Ce choix permet :
- Un accès rapide aux données filtrées par date grâce au **partition pruning**.
- Une maintenance simple (DROP ou archive des partitions anciennes).
- Une gestion efficace des index par partition.

---

## Implémentation

### 1. Sauvegarde
```sql
CREATE TABLE "FillHistory_backup" AS
SELECT * FROM "FillHistory";

2. Création de la table partitionnée

DROP TABLE IF EXISTS "FillHistory";

CREATE TABLE "FillHistory" (
  id SERIAL,
  "conteneurId" INT NOT NULL,
  fill_level INT NOT NULL,
  "recordedAt" TIMESTAMP NOT NULL
) PARTITION BY RANGE ("recordedAt");

3. Création des partitions mensuelles

CREATE TABLE "FillHistory_2025_01"
PARTITION OF "FillHistory"
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE "FillHistory_2025_02"
PARTITION OF "FillHistory"
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

4. Réinsertion des données

INSERT INTO "FillHistory"
SELECT * FROM "FillHistory_backup";
