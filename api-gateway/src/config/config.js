// Configuration file for API Gateway

module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
  
    // Service URLs
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://order-processing-service:3001',
    STOCK_SERVICE_URL: process.env.STOCK_SERVICE_URL || 'http://stock-management-service:3003',
  
    // Timeouts (in milliseconds)
    REQUEST_TIMEOUT: 5000,
  
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100 // per window
  };