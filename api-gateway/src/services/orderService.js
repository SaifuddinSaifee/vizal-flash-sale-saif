const express = require('express');
const orderService = require('../services/orderService');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Create a new order
 * @route POST /orders
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const orderData = { ...req.body, userId: req.user.id };
    const order = await orderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Order creation failed:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * Get order by ID
 * @route GET /orders/:orderId
 */
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.getOrder(req.params.orderId);
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    logger.error(`Failed to get order ${req.params.orderId}:`, error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

module.exports = router;