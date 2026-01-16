
const roleMiddleware = (requiredRoles) => (req, res, next) => {
  
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (!req.user.roles || !req.user.roles.some(role => rolesArray.includes(role))) {
    return res.status(403).json({ message: 'Access forbidden' , requiredRoles: rolesArray, userRoles: req.user.roles.map(r => r.name) , user : req.user });
  }
  next();
};

module.exports = roleMiddleware;