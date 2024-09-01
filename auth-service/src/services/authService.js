const jwt = require('jsonwebtoken');
const config = require('../config/config');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });
  }

  validateToken(token) {
    if (!token) {
      return { isValid: false, error: 'Token is required', statusCode: 400 };
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      return { isValid: true, user: { userId: decoded.userId }, statusCode: 200 };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { isValid: false, error: 'Token has expired', statusCode: 401 };
      }
      return { isValid: false, error: 'Invalid token', statusCode: 401 };
    }
  }
}

module.exports = new AuthService();