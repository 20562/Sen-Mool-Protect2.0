// Middleware for authentication
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { AuthService } = require('./auth_service');
    const decoded = AuthService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Middleware for role-based access control
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware for permission-based access control
const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasPermission = requiredPermissions.every(perm =>
      req.user.permissions?.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Missing required permissions' });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  permissionMiddleware,
};
