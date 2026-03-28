const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Prioritize Authorization header (for multi-role per-tab sessions)
    // over cookies (which are shared/overwritten across tabs)
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      token = req.cookies?.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
        error: 'AUTH_NO_TOKEN',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'AUTH_USER_NOT_FOUND',
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval',
        error: 'AUTH_NOT_APPROVED',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'AUTH_TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
      error: 'AUTH_INVALID_TOKEN',
    });
  }
};

const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        error: 'AUTH_FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = { protect, roleGuard };
