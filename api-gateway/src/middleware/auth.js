const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  const token = req.header('user_authentication_token');
  
  if (!token) {
    logger.warn('Authentication attempt without token');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await authService.validateToken(token);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token validation failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;