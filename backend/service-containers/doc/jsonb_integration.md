# Intégration JSONB et Indexation GIN pour FillHistory

## Objectif
Permettre le stockage flexible des métadonnées IoT et optimiser les recherches.

## Ajout de la colonne JSONB
ALTER TABLE "FillHistory" ADD COLUMN metadata JSONB;

## Exemples d’insertion
INSERT INTO "FillHistory" ("conteneurId", "niveau","recordedAt", metadata)
VALUES (2, 75, NOW(),
        '{"temperature": 24, "type_dechet": "plastique", "battery": 85}');


## Requêtes sur JSONB
- metadata->>'temperature' pour lire la température
- metadata ? 'battery' pour vérifier l’existence d’un champ
- metadata @> '{"battery": 85}' pour filtrer sur une valeur

## Indexation
CREATE INDEX idx_fillhistory_metadata
ON "FillHistory"
USING GIN (metadata);

CREATE INDEX idx_fillhistory_metadata_battery
ON "FillHistory"
USING GIN ((metadata->>'battery'));

## Validation
EXPLAIN ANALYZE
SELECT *
FROM "FillHistory"
WHERE metadata @> '{"battery": 85}';

Résultat : PostgreSQL utilise Index Scan au lieu de Seq Scan, requête beaucoup plus rapide.

5️⃣ Avantages

Flexibilité totale pour stocker des métadonnées variables

Requêtes rapides grâce à l’index GIN

Compatibilité avec partitionnement : chaque partition peut avoir ses propres index JSONB