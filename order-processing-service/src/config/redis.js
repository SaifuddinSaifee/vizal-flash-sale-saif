const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

module.exports = redisClient;