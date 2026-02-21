# Mesures de Sécurité

## Vue d'Ensemble
EcoTrack implémente plusieurs couches de sécurité pour protéger les données utilisateurs et l'intégrité du système. La sécurité est intégrée à tous les niveaux : authentification, autorisation, validation, et protection contre les attaques communes.

## Authentification

### JWT (JSON Web Tokens)
- **Implémentation** : Tokens JWT signés avec HS256
- **Durée de vie** : 24 heures pour les tokens d'accès
- **Stockage** : LocalStorage côté client (à améliorer avec httpOnly cookies en production)
- **Refresh tokens** : Non implémenté (recommandé pour production)
- **Secret** : Configuré via `JWT_SECRET` dans `.env`

### Middleware d'Authentification
- `authMiddleware.js` : Vérifie la présence et validité du token JWT
- Appliqué sur tous les endpoints nécessitant une authentification
- Gestion des erreurs : Retour 401 si token invalide/manquant

## Autorisation

### Système de Rôles
- **Rôles disponibles** : `citizen`, `admin`
- **Middleware** : `roleMiddleware.js` pour vérification des permissions
- **Assignation** : Par défaut `citizen` à l'inscription, modifiable par admin
- **Relations** : Many-to-many via Prisma (User ↔ Role)

### Contrôle d'Accès
- Endpoints publics : Inscription, connexion
- Endpoints utilisateurs : Profil, notifications (rôle citizen+)
- Endpoints admin : Gestion conteneurs, statistiques (rôle admin uniquement)

## Validation des Données

### Validation Entrées
- **Middleware** : `validate.middleware.js` avec Joi ou similaire
- **Règles** : Validation des emails, mots de passe, formats de données
- **Sanitisation** : Suppression des caractères dangereux

### Protection XSS/CSRF
- **Helmet.js** : Headers de sécurité HTTP
- **CORS** : Configuration restrictive des origines autorisées
- **Validation** : Échappement des entrées utilisateur

## Protection contre les Attaques

### Rate Limiting
- **express-rate-limit** : 100 requêtes/minute par IP
- **Configuration** : Appliqué globalement via API Gateway
- **Endpoints sensibles** : Limites plus strictes pour auth

### Upload de Fichiers
- **Validation** : Types MIME autorisés (images uniquement)
- **Taille limite** : 5MB par fichier
- **Traitement** : Redimensionnement avec Sharp (256x256 WebP)
- **Stockage sécurisé** : Dossier `uploads/` avec permissions restrictives

## Sécurité des Données

### Chiffrement
- **Mots de passe** : Hashés avec bcrypt (salt rounds configurable)
- **Données sensibles** : Non stockées en clair
- **Transmission** : HTTPS recommandé en production

### Base de Données
- **Prisma** : Requêtes paramétrées (protection SQL injection)
- **Connexions** : Pooling et timeout configurés
- **Migrations** : Versionnées et auditées

## Monitoring et Logging

### Logs de Sécurité
- **PM2** : Logs séparés (out.log, error.log, combined.log)
- **Événements trackés** :
  - Tentatives de connexion échouées
  - Accès non autorisés
  - Erreurs de validation
  - Uploads suspects

### Alertes
- **Seuils** : Nombre de tentatives de connexion
- **Monitoring** : PM2 monit pour surveillance en temps réel

## Bonnes Pratiques de Développement

### Code Sécurisé
- **Dépendances** : Audit régulier avec `npm audit`
- **Secrets** : Jamais dans le code (toujours .env)
- **Variables d'environnement** : Validation au démarrage

### Tests de Sécurité
- **Tests unitaires** : Validation des middlewares
- **Tests d'intégration** : Scénarios d'authentification
- **Audit** : Revue de code pour vulnérabilités

## Recommandations pour Production

### Améliorations Immédiates
- **HTTPS** : Certificats SSL/TLS
- **Cookies httpOnly** : Pour les tokens JWT
- **CORS strict** : Liste blanche des domaines
- **HSTS** : Headers de sécurité renforcés

### Monitoring Avancé
- **WAF** : Web Application Firewall
- **SIEM** : Collecte centralisée des logs
- **Intrusion Detection** : Surveillance des anomalies

### Conformité
- **RGPD** : Gestion des données personnelles
- **Audit trails** : Traçabilité des actions admin
- **Chiffrement au repos** : Pour les bases de données sensibles

## Contacts Sécurité
En cas de vulnérabilité découverte, contactez l'équipe de développement immédiatement.