const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipzon';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db();
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

function getDb() {
  return db;
}

module.exports = { connectToDatabase, getDb };