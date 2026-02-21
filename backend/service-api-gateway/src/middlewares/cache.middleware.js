// src/middlewares/cache.middleware.js
/**
 * Middleware de caching pour les requêtes GET
 */

const cacheService = require('../services/cache.service');

/**
 * Génère une clé de cache basée sur la route et les paramètres
 */
const generateCacheKey = (req) => {
  const { path, query } = req;
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  
  return `${path}${queryString ? '?' + queryString : ''}`;
};

/**
 * Middleware pour vérifier le cache avant de proxifier
 * Utilisé uniquement pour les requêtes GET
 */
const cacheMiddleware = async (req, res, next) => {
  // Ignorer le cache pour les requêtes non-GET
  if (req.method !== 'GET') {
    return next();
  }

  // Générer la clé de cache
  const cacheKey = generateCacheKey(req);

  // Vérifier si les données sont en cache
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) {
    res.set('X-Cache', 'HIT');
    res.set('X-Cache-Key', cacheKey);
    return res.status(200).json(cachedData);
  }

  // Intercepter la méthode json() pour cacher la réponse
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    // Cacher la réponse avec TTL personnalisé
    const ttl = req.cacheTime || 3600; // Par défaut 1h
    cacheService.set(cacheKey, data, ttl);
    
    // Ajouter les headers de cache info
    res.set('X-Cache', 'MISS');
    res.set('X-Cache-Key', cacheKey);
    res.set('X-Cache-TTL', ttl.toString());

    return originalJson(data);
  };

  next();
};

/**
 * Middleware pour définir le TTL du cache pour une route
 * @param {number} seconds - Durée de vie en secondes
 */
const setCacheTTL = (seconds) => {
  return (req, res, next) => {
    req.cacheTime = seconds;
    next();
  };
};

module.exports = {
  cacheMiddleware,
  setCacheTTL,
  generateCacheKey
};
