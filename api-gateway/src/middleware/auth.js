const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const apiService = require('../services/apiService');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Validate the token with the Auth Service
    const validationResponse = await apiService.post(
      `${config.authServiceUrl}/api/auth/validate`,
      { token }
    );

    if (validationResponse.data.valid) {
      req.user = decoded;
      next();
    } else {
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid authentication token' });
    } else {
      res.status(500).json({ error: 'Internal server error during authentication' });
    }
  }
};

module.exports = authMiddleware;