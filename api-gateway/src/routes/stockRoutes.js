const express = require('express');
const router = express.Router();
const apiService = require('../services/apiService');
const config = require('../config');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

router.get('/current', async (req, res, next) => {
  try {
    const response = await apiService.get(`${config.stockServiceUrl}/api/stock/current`);
    res.status(200).json(response.data);
  } catch (error) {
    logger.error('Error in /stock/current:', error.message);
    if (error.code === 'EAI_AGAIN') {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/initialize', authMiddleware, async (req, res, next) => {
  try {
    const response = await apiService.post(`${config.stockServiceUrl}/api/stock/initialize`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    logger.error('Error in /stock/initialize:', error.message);
    if (error.code === 'EAI_AGAIN') {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/reserve', authMiddleware, async (req, res, next) => {
  try {
    const response = await apiService.post(`${config.stockServiceUrl}/api/stock/reserve`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    logger.error('Error in /stock/reserve:', error.message);
    if (error.code === 'EAI_AGAIN') {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;