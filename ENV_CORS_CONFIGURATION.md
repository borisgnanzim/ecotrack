# Configuration CORS avec Variables d'Environnement

## Vue d'ensemble
À partir de maintenant, les `allowedOrigins` (origines autorisées pour les requêtes CORS) sont externalisées dans les variables d'environnement plutôt que d'être codées en dur.

## Configuration par Micro-service

Chaque micro-service dispose maintenant d'une variable d'environnement `ALLOWED_ORIGINS` qui vous permet de spécifier les origines autorisées.

### Variable d'Environnement

**`ALLOWED_ORIGINS`** (optionnel)
- **Format**: Liste d'URLs séparées par des virgules
- **Valeur par défaut**: Si non spécifiée, les origines par défaut pour le développement local sont utilisées
- **Exemple**: `http://localhost:3000,http://localhost:5173,https://example.com`

### Fichiers Modifiés

1. **service-users**: `backend/service-users/app.js`
2. **service-api-gateway**: `backend/service-api-gateway/app.js`
3. **service-routes**: `backend/service-routes/src/app.js`
4. **service-analytics**: `backend/service-analytics/app.js`
5. **service-containers**: `backend/service-containers/src/app.js`

## Utilisation

### Développement Local (Défaut)

Sans définir `ALLOWED_ORIGINS`, les origines suivantes sont acceptées par défaut :
```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3003
http://localhost:3010
http://localhost:5173
http://localhost:5174
http://localhost:4173
http://127.0.0.1:3000
http://127.0.0.1:3001
http://127.0.0.1:3002
http://127.0.0.1:3003
http://127.0.0.1:5173
http://127.0.0.1:4173
```

### Configuration Personnalisée

Pour spécifier vos propres origines, ajoutez cette ligne à votre fichier `.env` :

```bash
# .env pour service-users
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://app.example.com
```

```bash
# .env pour service-api-gateway
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://api.example.com
```

### Production

Pour un environnement de production, configurez uniquement les domaines autorisés :

```bash
# Production
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

## Logique de Parsing

La fonction parse les origines comme suit :
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  : getDefaultOrigins();
```

- Les espaces autour de chaque URL sont automatiquement supprimés
- Les origines vides sont ignorées
- Si la variable n'est pas définie, les valeurs par défaut sont utilisées

## Exemple Complet

### Fichier .env pour service-users

```env
PORT=3011
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrack
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://myapp.com
```

## Notes

- Les origines doivent inclure le protocole (`http://` ou `https://`)
- Les requêtes sans origine (ex: requêtes backend-à-backend, curl) sont toujours autorisées
- La casse d'une URL compte lors de la comparaison
- Les espaces dans la liste des origines sont automatiquement nettoyés
