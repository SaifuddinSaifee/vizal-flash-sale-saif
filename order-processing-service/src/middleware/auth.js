const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

const authenticateUser = async (req, res, next) => {
  const token = req.headers['user_authentication_token'];
  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const response = await axios.post(`${config.AUTH_SERVICE_URL}/api/auth/validate`, { token });
    req.user = response.data.user;
    next();
  } catch (error) {
    logger.error('Token validation failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateUser;