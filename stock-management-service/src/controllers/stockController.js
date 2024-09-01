const StockService = require("../services/stockService");
const logger = require("../utils/logger");

class StockController {
  static async initializeStock(req, res) {
    try {
      const { quantity } = req.body;
      const result = await StockService.initializeStock(quantity);
      res.json(result);
    } catch (error) {
      logger.error("Error in initializeStock controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getCurrentStock(req, res) {
    try {
      const result = await StockService.getCurrentStock();
      res.json(result);
    } catch (error) {
      logger.error("Error in getCurrentStock controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async reserveStock(req, res) {
    try {
      const { quantity, user_authentication_token } = req.body;
      logger.info(
        `Reservation attempt with token: ${user_authentication_token}`
      );

      const result = await StockService.reserveStock(quantity);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error("Error in reserveStock controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = StockController;
