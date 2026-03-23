// src/middlewares/rate-limit.middleware.js
/**
 * Middleware de rate limiting pour le gateway
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter global
 * 100 requêtes par 15 minutes par IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP par fenêtre
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
  standardHeaders: true, // Retourne les headers rate limit (RFC 6585)
  legacyHeaders: false, // Désactive les headers X-RateLimit
  // skip: (req) => {
  //   // Exclure certaines routes du rate limiting
  //   //return req.path === '/health' || req.path.startsWith('/api-docs');
  // }
});

/**
 * Middleware pour appliquer le rate limiting
 * Exclut les routes qui ne doivent pas être limitées
 */
const applyRateLimit = (req, res, next) => {
  // if (req.path === '/health' || req.path.startsWith('/api-docs')) {
  //   return next();
  // }
  limiter(req, res, next);
};

module.exports = {
  limiter,
  applyRateLimit
};
