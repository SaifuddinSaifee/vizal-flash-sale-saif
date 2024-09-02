const express = require("express");
const router = express.Router();
const config = require("../config");
const logger = require("../utils/logger");
const apiService = require("../services/apiService");
const authMiddleware = require("../middleware/auth");

router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    // Check stock availability
    const stockResponse = await apiService.get(
      `${config.stockServiceUrl}/api/stock/current`
    );

    if (stockResponse.data.available < req.body.quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Reserve stock
    await apiService.post(`${config.stockServiceUrl}/api/stock/reserve`, {
      quantity: req.body.quantity,
    });

    // Create order
    const orderResponse = await apiService.post(
      `${config.orderServiceUrl}/api/orders/create`,
      {
        ...req.body,
        userId: req.user.id,
      }
    );

    res.status(201).json(orderResponse.data);
  } catch (error) {
    logger.error("Error in /orders/create:", error);
    next(error);
  }
});

router.get("/:orderId", authMiddleware, async (req, res, next) => {
  try {
    const orderResponse = await apiService.get(
      `${config.orderServiceUrl}/api/orders/${req.params.orderId}`
    );
    res.json(orderResponse.data);
  } catch (error) {
    logger.error("Error in /orders/:orderId:", error);
    next(error);
  }
});

module.exports = router;
