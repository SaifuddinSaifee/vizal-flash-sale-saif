const redisClient = require("../config/redis");
const logger = require("../utils/logger");

class Stock {
  static STOCK_KEY = "iphone_stock";

  /**
   * Retrieves the current stock of iPhones in the system.
   *
   * @returns {Promise<number>} The current stock of iPhones.
   * @throws {Error} If there is an error retrieving the stock.
   */
  static async getStock() {
    try {
      const stock = await redisClient.get(this.STOCK_KEY);
      return stock ? parseInt(stock, 10) : 0;
    } catch (error) {
      logger.error("Error getting stock:", error);
      throw error;
    }
  }

  /**
   * Sets the initial stock of iPhones in the system to the given quantity.
   *
   * @param {number} quantity - The initial stock quantity.
   * @returns {Promise<void>} - A promise that resolves when the stock is set.
   * @throws {Error} - If there is an error setting the stock.
   */
  static async setInitialStock(quantity) {
    try {
      await redisClient.set(this.STOCK_KEY, quantity);
      logger.info(`Initial stock set to ${quantity}`);
    } catch (error) {
      logger.error("Error setting initial stock:", error);
      throw error;
    }
  }

  /**
   * Decrements the current stock of iPhones in the system by the given quantity.
   *
   * @param {number} quantity - The quantity to decrement the stock by.
   * @returns {Promise<number | null>} The new stock level, or `null` if the stock
   *   level would go below 0.
   * @throws {Error} If there is an error decrementing the stock.
   */
  static async decrementStock(quantity) {
    const multi = await redisClient.multi();

    try {
      multi.decrBy(this.STOCK_KEY, quantity);
      multi.get(this.STOCK_KEY);

      const results = await multi.exec();

      if (!results) {
        throw new Error("Transaction failed");
      }

      const [decrResult, getResult] = results;

      if (decrResult[0]) {
        throw decrResult[0]; // If there was an error in DECRBY
      }

      const newStock = parseInt(getResult[1], 10);

      logger.info(`Remaining iPhone stock: ${newStock}`);

      return newStock >= 0 ? newStock : null;
    } catch (error) {
      logger.error("Error decrementing stock:", error);
      throw error;
    }
  }
}

module.exports = Stock;
