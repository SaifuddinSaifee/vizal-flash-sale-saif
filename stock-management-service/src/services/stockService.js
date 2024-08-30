const Stock = require('../models/Stock');
const logger = require('../utils/logger');

class StockService {
  static async initializeStock(quantity) {
    try {
      await Stock.setInitialStock(quantity);
      return { success: true, message: `Stock initialized with ${quantity} items` };
    } catch (error) {
      logger.error('Error initializing stock:', error);
      throw error;
    }
  }

  static async getCurrentStock() {
    try {
      const stock = await Stock.getStock();
      return { stock };
    } catch (error) {
      logger.error('Error getting current stock:', error);
      throw error;
    }
  }

  static async reserveStock(quantity) {
    try {
      const newStock = await Stock.decrementStock(quantity);
      if (newStock === null) {
        return { success: false, message: 'Insufficient stock' };
      }
      return { success: true, message: `${quantity} items reserved`, remainingStock: newStock };
    } catch (error) {
      logger.error('Error reserving stock:', error);
      throw error;
    }
  }
}

module.exports = StockService;