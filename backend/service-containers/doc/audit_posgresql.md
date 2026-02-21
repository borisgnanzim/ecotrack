Audit PostgreSQL – ECOTRACK (Service Containers)

Contexte

Cet audit est réalisé dans le cadre du projet ECOTRACK, dont l’objectif est de préparer la base de données PostgreSQL (hébergée sur Supabase) à un passage à l’échelle important : jusqu’à 10 000 conteneurs connectés générant plus d’un million de mesures par jour.

Toutes les analyses ont été effectuées depuis pgAdmin, connecté à la base Supabase, sans modification préalable du schéma ou des index. Cet audit constitue la baseline avant toute optimisation.

⸻

1. Environnement technique
	•	SGBD : PostgreSQL (Supabase)
	•	Outil d’analyse : pgAdmin 4
	•	Schéma analysé : public
	•	Date de l’audit : à compléter

⸻

2. Taille globale de la base de données

Requête utilisée

SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;

Résultat: 8238 Kb

Base de données	Taille
ecotrack	à compléter

Analyse

Cette valeur représente la taille totale de la base, incluant les données, les index et les tables système. Elle servira de point de comparaison après les optimisations (indexation, partitionnement).

⸻
## Inventaire des tables

Requête utilisée

SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 5;



| Nom de la table        | Taille totale | Taille données | Taille index |
|------------------------|---------------|----------------|--------------|
| conteneur              | 224 KB        | 104 KB         | 120 KB       |
| _prisma_migrations     | 32 KB         | 8 KB           | 24 KB        |
| FillHistory            | 24 KB         | 8 KB           | 16 KB        |

Analyse :

- La table `conteneur` est actuellement la plus volumineuse.
- La taille des index est supérieure à la taille des données,
  ce qui est normal pour une table fortement indexée.
- Les tables `_prisma_migrations` et `FillHistory` sont encore très petites,
  ce qui est cohérent avec un environnement de développement.
- Aucune table ne dépasse actuellement 1 MB : les performances observées
  ne sont donc pas encore liées au volume, mais à la structure et aux requêtes.

4. Nombre de lignes par table

Requête utilisée

SELECT
  relname AS table_name,
  n_live_tup AS estimated_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

Résultats

Table	Nombre de lignes (estimé)
measurements	à compléter
fill_history	1
conteneur.      1001


Analyse

PostgreSQL fournit une estimation du nombre de lignes. Ces valeurs sont suffisantes pour l’audit et confirment les tables critiques en termes de volumétrie.

⸻


## Analyse des index

- La table `conteneur` possède plusieurs index, ce qui explique
  une taille d’index (120 KB) supérieure à la taille des données.
- Les index actuels sont majoritairement de type B-tree (index par défaut).
- Aucun index GIN ou BRIN n’est présent à ce stade.


À ce stade du projet, les index sont suffisants pour un faible volume.
Cependant, avec une projection à plusieurs centaines de millions de lignes,
des index spécialisés (GIN, BRIN) et une stratégie de partitionnement
seront indispensables.
⸻


 ## Vérification des clés primaires


Requête utilisée

SELECT
  relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
AND n.nspname = 'public'
AND NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conrelid = c.oid
  AND contype = 'p'
);

Résultats

Table sans clé primaire
aucune
 
Toutes les tables possèdent une clé primaire.

| Table               | Clé primaire | Présente |
|---------------------|-------------|----------|
| conteneur           | id          | Oui      |
| FillHistory         | id          | Oui      |
| _prisma_migrations  | id          | Oui      |

Aucune table sans clé primaire détectée.

⸻

7. Analyse des types de colonnes

Méthode

Analyse réalisée via :

\d nom_table

Observations
	•	Présence de colonnes TEXT pouvant être remplacées par VARCHAR(n)
	•	Utilisation de TIMESTAMP WITHOUT TIME ZONE pour des données temporelles globales
	•	Absence de colonnes JSONB pour les métadonnées IoT

Analyse

Ces choix impactent la performance et la flexibilité du schéma. Des améliorations sont possibles via :
	•	JSONB pour métadonnées évolutives
	•	TIMESTAMP WITH TIME ZONE pour cohérence temporelle

⸻

## Conclusion de l’audit

- La base est actuellement légère et performante.
- Aucun problème critique détecté à ce stade.
- Les futures problématiques de performance viendront principalement :
  - du volume de la table measurements
  - de requêtes analytiques sans index adaptés
  - de l’absence de partitionnement temporel

Cet audit constitue une baseline fiable pour mesurer les gains
des optimisations à venir.
⸻

Ce document constitue la baseline de performance avant toute optimisation.