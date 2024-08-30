const fetch = require('node-fetch');
const logger = require('../utils/logger');

const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || 'http://localhost:3000/api/stock';

class StockService {
  static async reserveStock(quantity) {
    try {
      const response = await fetch(`${STOCK_SERVICE_URL}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        logger.warn(`Failed to reserve stock. Status: ${response.status}`);
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error in reserveStock:', error);
      return false;
    }
  }

  static async revertStockReservation(quantity) {
    try {
      const response = await fetch(`${STOCK_SERVICE_URL}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        logger.warn(`Failed to revert stock reservation. Status: ${response.status}`);
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error in revertStockReservation:', error);
      return false;
    }
  }
}

module.exports = StockService;