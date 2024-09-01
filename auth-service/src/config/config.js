require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h'
};