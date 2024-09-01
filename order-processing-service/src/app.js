const express = require('express');
const { MongoClient } = require('mongodb');
const logger = require('./utils/logger');

const app = express();
let db;

app.use(express.json());

async function connectToDb() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/flipzon');
  await client.connect();
  db = client.db();
  logger.info('Connected to MongoDB');
  return db;
}

function getDb() {
  return db;
}

// Move the route import here, after the db connection is established
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  await connectToDb();
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    logger.info(`Order Processing Service listening at http://localhost:${port}`);
  });
}

module.exports = { app, connectToDb, getDb, startServer };