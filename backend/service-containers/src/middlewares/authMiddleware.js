import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Pas de token fourni" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer xxx"
  
  if (!token) {
    return res.status(401).json({ error: "Format Bearer invalide" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // Vérifier si l'utilisateur a l'un des rôles autorisés
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => 
      userRoles.includes(role) || userRoles.some(r => r.name === role)
    );

    if (!hasRole) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    next();
  };
};
