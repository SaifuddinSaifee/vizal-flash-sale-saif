const express = require('express');
const stockRoutes = require('./routes/stockRoutes');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/stock', stockRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Stock Management Service listening at http://localhost:${port}`);
});

module.exports = app;