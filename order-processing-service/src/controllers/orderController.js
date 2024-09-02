const OrderService = require("../services/orderService");
const logger = require("../utils/logger");

class OrderController {
  static async createOrder(req, res) {
    try {
      const { quantity } = req.body;
      const userId = req.user.userId; // Get userId from authenticated user
      console.log('Creating order for user:', userId);
      const result = await OrderService.createOrder(userId, quantity);
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error("Error in createOrder controller:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const result = await OrderService.getOrder(orderId);
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      logger.error("Error in getOrder controller:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = OrderController;
