Fonctions PostgreSQL pour la logique métier
Contexte

Dans le projet ECOTRACK, les conteneurs intelligents génèrent un grand volume de données via les capteurs IoT.
Afin d’améliorer les performances globales et de réduire la charge côté application backend, une partie de la logique métier est déplacée directement dans la base de données PostgreSQL.

PostgreSQL permet cela grâce aux fonctions PL/pgSQL, qui offrent :

de très bonnes performances pour les agrégations,

une exécution proche des données,

une logique centralisée et réutilisable.

Objectif de la mission

L’objectif de cette mission est de créer une fonction PostgreSQL capable de calculer des statistiques quotidiennes sur les niveaux de remplissage des conteneurs.

La fonction doit :

prendre une date en paramètre,

agréger les données de la table FillHistory,

retourner des statistiques par conteneur.

Structure de la table utilisée

La table FillHistory contient l’historique des mesures des conteneurs.

Colonnes principales :

conteneurId : identifiant du conteneur

fillLevel : niveau de remplissage (en %)

recordedAt : date et heure de la mesure

Fonction implémentée
Description

La fonction daily_container_stats calcule, pour une date donnée :

le niveau moyen de remplissage,

le niveau maximal atteint,

le nombre total de mesures enregistrées.

Code SQL
CREATE OR REPLACE FUNCTION daily_container_stats(p_date DATE)
RETURNS TABLE (
    conteneur_id INT,
    avg_fill_level NUMERIC,
    max_fill_level INT,
    measurements_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        "conteneurId" AS conteneur_id,
        AVG("fillLevel")::NUMERIC(5,2) AS avg_fill_level,
        MAX("fillLevel") AS max_fill_level,
        COUNT(*)::INT AS measurements_count
    FROM "FillHistory"
    WHERE DATE("recordedAt") = p_date
    GROUP BY "conteneurId"
    ORDER BY conteneur_id;
END;
$$;
Tests et validation

La fonction a été testée directement dans PGAdmin.

Exemple de test
SELECT * FROM daily_container_stats(CURRENT_DATE);

Résultat :

une ligne par conteneur ayant des mesures ce jour-là,

statistiques correctement agrégées,

temps d’exécution très faible grâce aux agrégations côté base.

Avantages de cette approche

Performance accrue : calculs réalisés directement par PostgreSQL

Réduction de la charge backend : moins de logique côté API

Réutilisabilité : fonction appelable depuis n’importe quel service

Cohérence métier : une seule source de vérité pour les statistiques

Limites et perspectives

La fonction est exécutée à la demande (pas encore automatisée)

Une automatisation quotidienne est envisageable via :

pg_cron (si supporté par l’instance),

ou un scheduler côté backend.

Conclusion

Cette mission démontre l’intérêt d’exploiter les fonctionnalités avancées de PostgreSQL pour déléguer une partie de la logique métier à la base de données.
Cette approche est particulièrement adaptée aux systèmes à forte volumétrie comme ECOTRACK, où la performance et la scalabilité sont essentielles.

