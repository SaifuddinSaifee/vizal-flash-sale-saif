const express = require('express');
const { connectToDatabase } = require('./config/mongodb');
const orderRoutes = require('./routes/orderRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());

app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function connectToDb() {
  try {
    await connectToDatabase();
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

function startServer(port = process.env.PORT || 3001) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Order Processing Service listening at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

// This block only runs if the file is executed directly (not imported as a module)
if (require.main === module) {
  connectToDb()
    .then(() => startServer())
    .catch((error) => {
      logger.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = { app, connectToDb, startServer };