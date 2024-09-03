const request = require('supertest');
const { app, startServer } = require('../app');
const authService = require('../services/authService');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
  let server;

  beforeAll(async () => {
    server = await startServer(0); // Use port 0 to get a random available port
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('POST /api/auth/generate', () => {
    it('should generate a valid token', async () => {
      const response = await request(app)
        .post('/api/auth/generate')
        .send({ userId: '123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      const validationResult = authService.validateToken(response.body.token);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.user.userId).toBe('123');
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/api/auth/generate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User ID is required');
    });
  });

  describe('POST /api/auth/validate', () => {
    it('should validate a valid token', async () => {
      const token = authService.generateToken('123');
      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ valid: true, user: { userId: '123' } });
    });

    it('should return 401 for an invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ valid: false, error: 'Invalid token' });
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ valid: false, error: 'Token is required' });
    });
  });

  // Test token expiration
  it('should reject an expired token', async () => {
    const token = jwt.sign({ userId: 'testUser' }, config.JWT_SECRET, { expiresIn: '1ms' });
    
    // Wait for the token to expire
    await new Promise(resolve => setTimeout(resolve, 5));

    const response = await request(app)
      .post('/api/auth/validate')
      .send({ token });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('valid', false);
    expect(response.body).toHaveProperty('error', 'Token has expired');
  });
});