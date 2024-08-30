const Order = require('../models/Order');
const stockService = require('./stockService');
const logger = require('../utils/logger');

const createOrder = async (userId, quantity) => {
  try {
    // Check and reserve stock
    const stockReserved = await stockService.reserveStock(quantity);
    if (!stockReserved) {
      logger.warn(`Failed to reserve stock for user ${userId}`);
      return { success: false, message: 'Insufficient stock' };
    }

    // Create order in MongoDB
    const orderId = await Order.create({
      userId,
      quantity,
      status: 'created',
    });

    logger.info(`Order created for user ${userId}, quantity: ${quantity}`);
    return { success: true, orderId, message: 'Order placed successfully' };
  } catch (error) {
    logger.error('Error in createOrder:', error);
    // If order creation fails, attempt to revert stock reservation
    await stockService.revertStockReservation(quantity);
    throw error;
  }
};

const getOrder = async (orderId) => {
  try {
    const order = await Order.getById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    return { success: true, order };
  } catch (error) {
    logger.error('Error in getOrder:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrder
};