const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/stock', stockRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;