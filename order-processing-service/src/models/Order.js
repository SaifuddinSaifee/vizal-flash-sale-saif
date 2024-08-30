const { getDb } = require("../config/mongodb");
const logger = require("../utils/logger");
const { ObjectId } = require('mongodb');

class Order {
  static async create(orderData) {
    const db = getDb();
    try {
      const result = await db.collection("orders").insertOne({
        ...orderData,
        createdAt: new Date(),
      });
      logger.info(`Order created with ID: ${result.insertedId}`);
      return result.insertedId;
    } catch (error) {
      logger.error("Error creating order:", error);
      throw error;
    }
  }

  static async getById(orderId) {
    const db = getDb();
    try {
      return await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }
}

module.exports = Order;
