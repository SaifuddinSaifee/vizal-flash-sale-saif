const request = require('supertest');
const nock = require('nock');
const app = require('../src/app');
const config = require('../src/config/config');

describe('API Gateway', () => {
  beforeAll(() => {
    // Mock the Auth Service
    nock(config.AUTH_SERVICE_URL)
      .post('/api/auth/validate')
      .reply(200, { valid: true, user: { userId: 'testUser' } });

    // Mock the Order Service
    nock(config.ORDER_SERVICE_URL)
      .get('/api/orders/123')
      .reply(200, { orderId: '123', userId: 'testUser' });

    // Mock the Stock Service
    nock(config.STOCK_SERVICE_URL)
      .get('/api/stock/current')
      .reply(200, { stock: 100 });
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('Routing', () => {
    it('should route /orders requests to the Order Service', async () => {
      const response = await request(app)
        .get('/api/orders/123')
        .set('user_authentication_token', 'validToken');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('orderId', '123');
    });

    it('should route /stock requests to the Stock Service', async () => {
      const response = await request(app)
        .get('/api/stock/current')
        .set('user_authentication_token', 'validToken');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('stock', 100);
    });
  });

  describe('Authentication Middleware', () => {
    it('should allow requests with valid authentication token', async () => {
      const response = await request(app)
        .get('/api/orders/123')
        .set('user_authentication_token', 'validToken');

      expect(response.statusCode).toBe(200);
    });

    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/orders/123');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should reject requests with invalid authentication token', async () => {
      nock(config.AUTH_SERVICE_URL)
        .post('/api/auth/validate')
        .reply(401, { valid: false, error: 'Invalid token' });

      const response = await request(app)
        .get('/api/orders/123')
        .set('user_authentication_token', 'invalidToken');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit requests after exceeding rate limit', async () => {
      const requests = Array(101).fill().map(() => 
        request(app)
          .get('/api/stock/current')
          .set('user_authentication_token', 'validToken')
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.statusCode).toBe(429);
      expect(lastResponse.body).toHaveProperty('error', 'Too many requests');
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors gracefully', async () => {
      nock(config.ORDER_SERVICE_URL)
        .get('/api/orders/error')
        .replyWithError('Internal Server Error');

      const response = await request(app)
        .get('/api/orders/error')
        .set('user_authentication_token', 'validToken');

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });
});