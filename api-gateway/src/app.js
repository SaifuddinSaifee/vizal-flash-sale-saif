const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Auth Service Proxy
app.use('/auth', createProxyMiddleware({ 
  target: config.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {'^/auth' : '/api/auth'}
}));

// Order Service Proxy
app.use('/orders', createProxyMiddleware({ 
  target: config.ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {'^/orders' : '/api/orders'}
}));

// Stock Service Proxy
app.use('/stock', createProxyMiddleware({ 
  target: config.STOCK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {'^/stock' : '/api/stock'}
}));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;