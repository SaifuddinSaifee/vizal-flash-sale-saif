const express = require('express');
const { ObjectId } = require('mongodb');
const stockService = require('../services/stockService');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
  const token = req.header('user_authentication_token');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // For simplicity, we're just checking if the token exists
  next();
};

module.exports = (getDb) => {
  router.post('/create', authenticateUser, async (req, res) => {
    try {
      const { userId, quantity } = req.body;
      
      if (quantity > 2) {
        return res.status(400).json({ error: 'Maximum order quantity is 2' });
      }

      const stockAvailable = await stockService.reserveStock(quantity);
      if (!stockAvailable) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

      const db = getDb();
      const result = await db.collection('orders').insertOne({
        userId,
        quantity,
        status: 'created',
        createdAt: new Date()
      });

      res.status(201).json({
        success: true,
        orderId: result.insertedId,
        message: 'Order placed successfully'
      });
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:orderId', authenticateUser, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
      }

      const db = getDb();
      const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, order });
    } catch (error) {
      logger.error('Error fetching order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};