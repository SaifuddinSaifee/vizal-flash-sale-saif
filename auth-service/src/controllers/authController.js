const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
    async generateToken(req, res) {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const token = authService.generateToken(userId);
      res.json({ token });
    }
  
    async validateToken(req, res) {
      const { token } = req.body;
      const result = authService.validateToken(token);
      res.status(result.statusCode).json(result.isValid ? { valid: true, user: result.user } : { valid: false, error: result.error });
    }
  }

module.exports = new AuthController();