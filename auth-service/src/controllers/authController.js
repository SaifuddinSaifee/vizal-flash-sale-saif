const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Validate a user authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async validateToken(req, res) {
    const { token } = req.body;

    try {
      const user = authService.validateToken(token);
      res.json({ valid: true, user });
    } catch (error) {
      logger.warn('Token validation failed:', error);
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  }

  /**
   * Generate a new token (for demonstration purposes)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateToken(req, res) {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const token = authService.generateToken(userId);
    res.json({ token });
  }
}

module.exports = new AuthController();