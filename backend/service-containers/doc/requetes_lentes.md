Analyse des Requêtes Lentes – ECOTRACK
Contexte

Dans le cadre de l’audit de performance PostgreSQL (PARTIE 1), plusieurs requêtes représentatives ont été analysées à l’aide de EXPLAIN ANALYZE.
L’objectif est d’identifier les schémas d’accès problématiques qui deviendront critiques lorsque le volume de données augmentera (jusqu’à plusieurs centaines de millions de lignes).

Les tests ont été réalisés depuis pgAdmin sur une base Supabase de développement.

## Requête lente n°1 : Historique par conteneur

```sql

EXPLAIN ANALYZE
SELECT *
FROM "FillHistory"
WHERE "conteneurId" = 2;

Resultat:
            Query plan

1 - "Seq Scan on ""FillHistory""  (cost=0.00..31.25 rows=8 width=20) 
        (actual time=0. 080..0.081 rows=1.00 loops=1)"
2-  "  Filter: (""conteneurId"" = 2)"
3-  "  Buffers: shared hit=1"
4-  "Planning Time: 0.195 ms"
5-  "Execution Time: 0.113 ms"

Analyse

PostgreSQL effectue un Sequential Scan (Seq Scan) sur toute la table FillHistory

Aucun index n’est utilisé sur la colonne conteneurId

Le filtrage est effectué après lecture complète de la table

Le temps d’exécution est faible car la table est encore petite

Problème identifié

⚠️ Scalabilité critique
Dans un contexte de production avec :

milliers de conteneurs

historique de remplissage sur plusieurs années

Cette requête déclenchera :

un scan complet de centaines de millions de lignes

une dégradation sévère des performances

Cause principale

Absence d’index sur la colonne conteneurId

Requête lente n°2 : Filtrage temporel

EXPLAIN ANALYZE
SELECT * FROM "FillHistory"
WHERE "recordedAt" >= NOW() - INTERVAL '7 days';

resultat:

            Query plan
1-  "Seq Scan on ""FillHistory""  (cost=0.00..39.75 rows=567 width=20) 
        (actual time=0.041..0.042 rows=1.00 loops=1)"
2-  "  Filter: (""recordedAt"" >= (now() - '7 days'::interval))"
3-  "  Buffers: shared hit=1"
4-  "Planning Time: 0.509 ms"
5-  "Execution Time: 0.058 ms"

Analyse

PostgreSQL effectue également un Sequential Scan

La condition temporelle est appliquée après lecture complète

Aucune stratégie d’optimisation temporelle n’est en place

Problème identifié

⚠️ Requête typique de dashboard

Ce type de requête est extrêmement fréquent :

graphiques journaliers

statistiques hebdomadaires

monitoring temps réel

Sans index ou partitionnement :

les performances se dégraderont linéairement avec la taille de la table

Cause principale

Absence d’index sur la colonne recordedAt

Table non partitionnée par date

Conclusion – Audit des Requêtes
Requête	Problème	Risque en production
Filtrage par conteneur	Seq Scan	Très élevé
Filtrage temporel	Seq Scan	Critique
Absence d’index	Générale	Scalabilité impossible

👉 Ces problèmes seront traités dans :

PARTIE 2.1 : Indexation stratégique

PARTIE 2.2 : Partitionnement déclaratif

P

