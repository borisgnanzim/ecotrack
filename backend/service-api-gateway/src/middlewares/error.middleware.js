// src/middlewares/error.middleware.js
/**
 * Middleware centralisé de gestion des erreurs
 */

/**
 * Middleware pour capturer les erreurs de proxy
 */
const errorHandler = (err, req, res, next) => {
  console.error('Gateway Error:', {
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erreur de proxy (service indisponible)
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service unavailable - Le service proxysé n\'est pas disponible',
      statusCode: 503,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  // Erreur de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'Gateway timeout - Le service proxysé a dépassé le délai d\'attente',
      statusCode: 504,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    statusCode: err.status || 500,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware 404 pour les routes non trouvées
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    statusCode: 404,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /services',
      'GET /stats',
      'GET /api-docs',
      'POST /auth/login',
      'POST /auth/register',
      'GET /users/profile',
      'GET /containers',
      'POST /containers'
    ],
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
