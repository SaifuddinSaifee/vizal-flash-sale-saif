const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Validate a user authentication token
   * @param {string} token - The user authentication token
   * @returns {Object} The decoded token payload
   * @throws {Error} If the token is invalid
   */
  validateToken(token) {
    try {
      // In a real-world scenario, you'd verify the token's signature
      // For this simplified version, we'll just check if it's a non-empty string
      if (typeof token !== 'string' || token.trim() === '') {
        throw new Error('Invalid token');
      }
      
      // Simulate decoding a JWT
      const payload = { userId: token.substring(0, 10) }; // Use first 10 chars as userId
      logger.info(`Token validated for user: ${payload.userId}`);
      return payload;
    } catch (error) {
      logger.error('Token validation failed:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate a new token (for demonstration purposes)
   * @param {string} userId - The user ID
   * @returns {string} A new JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });
  }
}

module.exports = new AuthService();