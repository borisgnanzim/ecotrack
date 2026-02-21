
Objectif

Éliminer les Seq Scan identifiés en Partie 1 et démontrer :

le choix du bon index

la preuve de son efficacité avec EXPLAIN ANALYZE

une justification technique claire

🧠 Étape 1 – Identifier les colonnes critiques

À partir de l’audit :

Requête	Colonne filtrée	Type de filtre
Historique par conteneur	conteneurId	Égalité (=)
Filtrage temporel	recordedAt	Plage de dates (>=)

👉 Ce sont les colonnes à indexer.

🧩 Étape 2 – Choix du type d’index
🔹 Index sur conteneurId

Type de données : INTEGER

Requête : WHERE conteneurId = X

Type d’index optimal : B-tree (par défaut)

✅ B-tree est parfait pour les égalités

🔹 Index sur recordedAt

Type de données : TIMESTAMP

Requêtes temporelles fréquentes

Données insérées de manière chronologique

👉 Deux options possibles :

B-tree → bon

BRIN → excellent pour très grosses tables temporelles

⚠️ Pour le TP, on commence par B-tree (plus simple et pédagogique).

Étape 3 – Création des index (pgAdmin)

Exécute exactement ces requêtes SQL :

-- Index pour les requêtes par conteneur
CREATE INDEX idx_fillhistory_conteneur
ON "FillHistory" ("conteneurId");

-- Index pour les requêtes temporelles
CREATE INDEX idx_fillhistory_recordedat
ON "FillHistory" ("recordedAt");

### Analyse post-indexation

Les index ont été créés sur les colonnes `conteneurId` et `recordedAt`.
Cependant, PostgreSQL continue d’utiliser un Seq Scan.

Après analyse, ce comportement est normal car la table FillHistory est très
petite (~24 KB, quelques lignes). PostgreSQL estime qu’un scan séquentiel est
moins coûteux qu’un accès indexé.

Ce choix de l’optimiseur est conforme aux bonnes pratiques PostgreSQL.
Sur une table de production contenant plusieurs millions de lignes, ces mêmes
requêtes utiliseraient un Index Scan.