// src/config/index.js

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://order-processing-service:3001',
  stockServiceUrl: process.env.STOCK_SERVICE_URL || 'http://stock-management-service:3003',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
};