// Authentication middleware (placeholder for future JWT implementation)
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // For now, allow all requests
  // In production, implement proper JWT authentication
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
      req.user = user;
    });
  }

  next();
};

// Optional authentication - doesn't block if no token provided
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};