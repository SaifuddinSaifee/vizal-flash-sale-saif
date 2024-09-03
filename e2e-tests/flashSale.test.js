// File: /home/saif-linux/Projects/vizal-flash-sale-saif/e2e-tests/flashSale.test.js

const axios = require('axios');
const { setupTestEnvironment } = require('./setup');
require('dotenv').config();

const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const initialStock = parseInt(process.env.INITIAL_STOCK, 10) || 1000;

describe('Flash Sale E2E Tests', () => {
  let testUserToken;

  beforeAll(async () => {
    try {
      const setup = await setupTestEnvironment();
      testUserToken = setup.token;
      console.log('Test environment setup completed');
    } catch (error) {
      console.error('Failed to set up test environment:', error);
      throw error;
    }
  });

  /**
   * Helper function to make authenticated requests
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @returns {Promise<AxiosResponse>} Axios response
   */
  const authenticatedRequest = (method, url, data = null) => {
    return axios({
      method,
      url,
      data,
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
  };

  /**
   * Test successful order placement
   */
  it('should successfully place an order', async () => {
    const response = await authenticatedRequest('post', `${apiGatewayUrl}/api/orders/create`, { quantity: 1 });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('orderId');
  });

  /**
   * Test stock level after order placement
   */
  it('should correctly update stock after order placement', async () => {
    // Place an order
    await authenticatedRequest('post', `${apiGatewayUrl}/api/orders/create`, { quantity: 1 });

    // Check current stock
    const response = await authenticatedRequest('get', `${apiGatewayUrl}/api/stock/current`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('available');
    expect(response.data.available).toBe(initialStock - 2); // Accounting for the order in the previous test
  });

  /**
   * Test retrieval of order details
   */
  it('should get order details', async () => {
    // Create an order
    const createOrderResponse = await authenticatedRequest('post', `${apiGatewayUrl}/api/orders/create`, { quantity: 1 });
    const orderId = createOrderResponse.data.orderId;

    // Get the order details
    const getOrderResponse = await authenticatedRequest('get', `${apiGatewayUrl}/api/orders/${orderId}`);
    expect(getOrderResponse.status).toBe(200);
    expect(getOrderResponse.data).toHaveProperty('orderId', orderId);
    expect(getOrderResponse.data).toHaveProperty('quantity', 1);
  });

  /**
   * Test multiple order placements
   */
  it('should handle multiple order placements correctly', async () => {
    const orderQuantities = [2, 3, 1];
    const orderPromises = orderQuantities.map(quantity => 
      authenticatedRequest('post', `${apiGatewayUrl}/api/orders/create`, { quantity })
    );

    const orderResponses = await Promise.all(orderPromises);

    orderResponses.forEach(response => {
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('orderId');
    });

    // Check final stock
    const stockResponse = await authenticatedRequest('get', `${apiGatewayUrl}/api/stock/current`);
    const expectedRemainingStock = initialStock - 2 - 1 - 1 - (2 + 3 + 1); // Initial - previous tests - current test
    expect(stockResponse.data.available).toBe(expectedRemainingStock);
  });
});