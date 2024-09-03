const axios = require('axios');
const { setupTestEnvironment } = require('./setup');
require('dotenv').config();

const apiGatewayUrl = process.env.API_GATEWAY_URL || "http://localhost:3000";
const initialStock = parseInt(process.env.INITIAL_STOCK, 10) || 1000;

describe('Flash Sale E2E Edge Cases', () => {
  let testUserToken;

  beforeAll(async () => {
    const setup = await setupTestEnvironment();
    testUserToken = setup.token;
  });

  /**
   * Test order placement when stock is exhausted
   */
  it('should fail to place an order when stock is exhausted', async () => {
    // First, exhaust the stock
    const orderPromises = [];
    for (let i = 0; i < initialStock; i++) {
      orderPromises.push(axios.post(
        `${apiGatewayUrl}/api/orders/create`,
        { quantity: 1 },
        { headers: { 'Authorization': `Bearer ${testUserToken}` } }
      ));
    }
    await Promise.all(orderPromises);

    // Now try to place one more order
    try {
      await axios.post(
        `${apiGatewayUrl}/api/orders/create`,
        { quantity: 1 },
        { headers: { 'Authorization': `Bearer ${testUserToken}` } }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('error', 'Insufficient stock');
    }
  });

  /**
   * Test order placement with invalid quantity
   */
  it('should fail to place an order with invalid quantity', async () => {
    const invalidQuantities = [0, -1, 'abc', null, undefined, 1.5];

    for (const quantity of invalidQuantities) {
      try {
        await axios.post(
          `${apiGatewayUrl}/api/orders/create`,
          { quantity },
          { headers: { 'Authorization': `Bearer ${testUserToken}` } }
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
      }
    }
  });

  /**
   * Test retrieval of non-existent order
   */
  it('should fail to get order details with invalid order ID', async () => {
    try {
      await axios.get(
        `${apiGatewayUrl}/api/orders/invalidOrderId`,
        { headers: { 'Authorization': `Bearer ${testUserToken}` } }
      );
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data).toHaveProperty('error');
    }
  });

  /**
   * Test order placement without authentication
   */
  it('should fail to place an order without authentication', async () => {
    try {
      await axios.post(
        `${apiGatewayUrl}/api/orders/create`,
        { quantity: 1 }
      );
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('error');
    }
  });

  /**
   * Test concurrent order placements
   */
  it('should handle concurrent order placements correctly', async () => {
    // Reset stock for this test
    await axios.post(`${apiGatewayUrl}/api/stock/initialize`, { quantity: 10 });

    const concurrentOrders = 20;
    const orderPromises = [];

    for (let i = 0; i < concurrentOrders; i++) {
      orderPromises.push(axios.post(
        `${apiGatewayUrl}/api/orders/create`,
        { quantity: 1 },
        { headers: { 'Authorization': `Bearer ${testUserToken}` } }
      ));
    }

    const results = await Promise.allSettled(orderPromises);

    const successfulOrders = results.filter(r => r.status === 'fulfilled').length;
    const failedOrders = results.filter(r => r.status === 'rejected').length;

    expect(successfulOrders).toBe(10); // Only 10 orders should succeed
    expect(failedOrders).toBe(10); // The rest should fail due to insufficient stock

    // Verify final stock is 0
    const stockResponse = await axios.get(`${apiGatewayUrl}/api/stock/current`);
    expect(stockResponse.data.available).toBe(0);
  });
});