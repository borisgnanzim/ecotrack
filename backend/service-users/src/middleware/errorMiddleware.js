const ValidationError = require('../dto/ValidationError');

/**
 * Middleware de gestion globale des erreurs
 * Doit être utilisé en dernier dans le fichier app.js
 */
const errorMiddleware = (err, req, res, next) => {
  // Erreur de validation DTO
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
      error: err.message
    });
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
      error: 'Veuillez vous reconnecter'
    });
  }

  // Erreur de base de données Prisma
  if (err.code?.startsWith('P')) {
    const statusCode = err.code === 'P2025' ? 404 : 400;
    const message = err.code === 'P2025' 
      ? 'Ressource non trouvée' 
      : 'Erreur de base de données';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur est survenue';

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;
