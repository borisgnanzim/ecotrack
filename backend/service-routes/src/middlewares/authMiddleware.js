const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Format Bearer invalide' });
  }

  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET non défini dans .env');
    return res.status(500).json({ error: 'Configuration serveur invalide' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    // JWT signé par service-users avec { roles: [...] } (tableau)
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : req.user.role ? [req.user.role] : [];

    if (!allowedRoles.some(r => userRoles.includes(r))) {
      return res.status(403).json({ error: `Accès refusé — rôle requis : ${allowedRoles.join(' ou ')}` });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
