const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class Stock {
  static async getStock() {
    try {
      const stock = await redisClient.get('iphone_stock');
      return stock ? parseInt(stock, 10) : 0;
    } catch (error) {
      logger.error('Error getting stock:', error);
      throw error;
    }
  }

  static async setInitialStock(quantity) {
    try {
      await redisClient.set('iphone_stock', quantity);
      logger.info(`Initial stock set to ${quantity}`);
    } catch (error) {
      logger.error('Error setting initial stock:', error);
      throw error;
    }
  }

  static async decrementStock(quantity) {
    try {
      const result = await redisClient.decrby('iphone_stock', quantity);
      return result >= 0 ? result : null;
    } catch (error) {
      logger.error('Error decrementing stock:', error);
      throw error;
    }
  }
}

module.exports = Stock;