# Configuration Real-time – ECOTRACK

## 1. Objectif

Mettre à jour le dashboard ECOTRACK en temps réel lors des nouvelles mesures IoT
sans polling, en utilisant les fonctionnalités realtime de Supabase basées sur PostgreSQL.

---

## 2. Principe du Realtime Supabase

Supabase utilise :
- La réplication logique PostgreSQL
- Des WebSockets
- Une publication PostgreSQL nommée `supabase_realtime`

Chaque modification (INSERT / UPDATE / DELETE) sur une table publiée
déclenche un événement envoyé aux clients connectés.

---

## 3. Activation du realtime sur les tables

Activation réalisée via SQL (PGAdmin) :

```sql
ALTER PUBLICATION supabase_realtime
ADD TABLE "FillHistory";

La table est désormais surveillée par Supabase Realtime.

4. Test de fonctionnement

Insertion test :

INSERT INTO "FillHistory"(conteneurId, fillLevel, recordedAt)
VALUES (2, 87, NOW());

Résultat attendu :

Un événement realtime est émis instantanément

Les clients abonnés reçoivent la nouvelle donnée

5. Exemple d’abonnement côté frontend
supabase
  .channel('fillhistory-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'FillHistory'
    },
    (payload) => {
      console.log('Nouvelle mesure', payload.new)
    }
  )
  .subscribe()
6. Filtrage des événements

Exemple : écouter uniquement un conteneur spécifique

filter: 'conteneurId=eq.2'

Cela permet :

Moins de trafic réseau

Meilleures performances frontend

Scalabilité du dashboard

7. Cas d’usage ECOTRACK

Dashboard temps réel

Alertes automatiques (fillLevel > 85%)

Carte des conteneurs mise à jour en continu

Réduction du polling inutile

8. Conclusion

Le realtime Supabase permet à ECOTRACK de réagir instantanément aux données IoT,
d’améliorer l’expérience utilisateur et de réduire la charge serveur.


---
