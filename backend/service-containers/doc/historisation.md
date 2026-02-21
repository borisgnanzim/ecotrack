# Historisation SCD Type 2 pour les utilisateurs

## Objectif
Garder un historique complet des modifications pour audit et analyses.

## Table users_history
- user_id, email, name, role, zone
- valid_from, valid_to
- is_current

```sql
CREATE TABLE users_history (
    user_id UUID NOT NULL,
    email TEXT,
    name TEXT,
    role TEXT,
    zone TEXT,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, valid_from)
);

Fonction Trigger
CREATE OR REPLACE FUNCTION users_scd2_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_history
    SET is_current = false,
        valid_to = NOW()
    WHERE user_id = OLD.user_id AND is_current = true;

    INSERT INTO users_history(user_id, email, name, role, zone, valid_from, is_current)
    VALUES (NEW.user_id, NEW.email, NEW.name, NEW.role, NEW.zone, NOW(), true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

Trigger

CREATE TRIGGER users_scd2_trigger
AFTER UPDATE ON conteneur
FOR EACH ROW
EXECUTE FUNCTION users_scd2_trigger();

Test

UPDATE conteneur
SET zone = 'Zone B'
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';

SELECT * FROM users_history WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';

Lignes : ancienne version is_current=false, nouvelle version is_current=true


---

