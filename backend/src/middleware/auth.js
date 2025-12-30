const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, secret);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization failed.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;
