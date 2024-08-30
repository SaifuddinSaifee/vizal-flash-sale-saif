const express = require('express');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate user token
 * @route POST /auth/validate
 */
router.post('/validate', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const user = await authService.validateToken(token);
    res.json({ valid: true, user });
  } catch (error) {
    logger.warn('Token validation failed:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;