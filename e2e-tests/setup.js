const axios = require('axios');
require('dotenv').config();

const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const initialStock = parseInt(process.env.INITIAL_STOCK, 10) || 1000;

/**
 * Sets up the test environment by initializing stock and generating a test user token
 * @returns {Promise<{token: string}>} The generated authentication token
 */
async function setupTestEnvironment() {
  console.log('Setting up test environment...');
  console.log(`API Gateway URL: ${apiGatewayUrl}`);
  console.log(`Initial Stock: ${initialStock}`);

  try {
    // Generate a test user token
    console.log('Generating test user token...');
    const tokenResponse = await axios.post(`${apiGatewayUrl}/api/auth/generate`, { userId: 'testUser' });
    const token = tokenResponse.data.token;
    console.log('Token generated successfully');

    // Initialize stock
    console.log('Initializing stock...');
    await axios.post(
      `${apiGatewayUrl}/api/stock/initialize`,
      { quantity: initialStock },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Stock initialized successfully');

    return { token };
  } catch (error) {
    console.error('Error setting up test environment:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

module.exports = { setupTestEnvironment };