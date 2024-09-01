const logger = require('../utils/logger');

const authenticateUser = (req, res, next) => {
  const token = req.header('user_authentication_token');
  
  if (!token) {
    logger.warn('Authentication attempt without token');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For this simplified version, we're assuming all non-empty tokens are valid instead of validatng the token here
  req.user = { id: token.substr(0, 10) }; // Use first 10 chars of token as user ID
  next();
};

module.exports = authenticateUser;