const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using the external Auth Service
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
    const response = await axios.post(`${config.AUTH_SERVICE_URL}/api/auth/validate`, { token }, {
      timeout: 5000 // 5 seconds timeout
    });
    req.user = response.data.user;
    next();
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Token validation failed: ${error.response.status} - ${error.response.data.error}`);
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('Token validation failed: No response received from Auth Service');
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('Token validation failed:', error.message);
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;