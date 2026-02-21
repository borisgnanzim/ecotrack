# Row Level Security pour la table bins

## Objectif
Limiter l’accès aux lignes selon l’utilisateur connecté pour sécurité et confidentialité.

## Activer RLS
```sql
ALTER TABLE "bins" ENABLE ROW LEVEL SECURITY;

Policy Collecteurs
CREATE POLICY "collecteur_select_bins"
ON "bins"
FOR SELECT
USING (assigned_zone = auth.uid());
Policy Admins
CREATE POLICY "admin_select_bins"
ON "bins"
FOR SELECT
USING (role = 'admin');
Test

Créer collecteur_1 et admin_1

Collecteur_1 : ne voit que ses poubelles

Admin_1 : voit toutes les poubelles


---

