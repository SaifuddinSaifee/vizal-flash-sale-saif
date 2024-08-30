const Stock = require("../models/Stock");
const logger = require("../utils/logger");

class StockService {
  /**
   * Initializes the stock of iPhones in the system.
   *
   * @param {number} quantity - The initial stock quantity.
   * @returns {Promise<{ success: boolean, message: string }>} - A promise that resolves with the result of initializing the stock.
   * @throws {Error} - If there is an error initializing the stock.
   */
  static async initializeStock(quantity) {
    try {
      await Stock.setInitialStock(quantity);
      return {
        success: true,
        message: `Stock initialized with ${quantity} items`,
      };
    } catch (error) {
      logger.error("Error initializing stock:", error);
      throw error;
    }
  }

  /**
   * Retrieves the current stock of iPhones in the system.
   *
   * @returns {Promise<{ stock: number }>} - A promise that resolves with the current stock of iPhones.
   * @throws {Error} - If there is an error retrieving the stock.
   */
  static async getCurrentStock() {
    try {
      const stock = await Stock.getStock();
      return { stock };
    } catch (error) {
      logger.error("Error getting current stock:", error);
      throw error;
    }
  }

  /**
   * Reserves a certain quantity of iPhones for the user.
   *
   * @param {number} quantity - The quantity to reserve.
   * @returns {Promise<{ success: boolean, message: string, remainingStock?: number }>} - A promise that resolves with the result of reserving stock.
   * @throws {Error} - If there is an error reserving stock.
   */
  static async reserveStock(quantity) {
    try {
      const newStock = await Stock.decrementStock(quantity);
      if (newStock === null) {
        return { success: false, message: "Insufficient stock" };
      }
      return {
        success: true,
        message: `${quantity} items reserved`,
        remainingStock: newStock,
      };
    } catch (error) {
      logger.error("Error reserving stock:", error);
      throw error;
    }
  }
}

module.exports = StockService;
