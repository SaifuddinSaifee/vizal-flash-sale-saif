const express = require('express');
const stockService = require('../services/stockService');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Get current stock
 * @route GET /stock/current
 */
router.get('/current', async (req, res) => {
  try {
    const stock = await stockService.getCurrentStock();
    res.json(stock);
  } catch (error) {
    logger.error('Failed to get current stock:', error);
    res.status(500).json({ error: 'Failed to get current stock' });
  }
});

/**
 * Reserve stock
 * @route POST /stock/reserve
 */
router.post('/reserve', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const result = await stockService.reserveStock(quantity);
    res.json(result);
  } catch (error) {
    logger.error('Stock reservation failed:', error);
    res.status(500).json({ error: 'Failed to reserve stock' });
  }
});

module.exports = router;