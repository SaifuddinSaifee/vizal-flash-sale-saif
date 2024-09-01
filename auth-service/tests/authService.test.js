const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const config = require('../src/config/config');

describe('Auth Service', () => {
  describe('POST /api/auth/generate', () => {
    it('should generate a valid token', async () => {
      const response = await request(app)
        .post('/api/auth/generate')
        .send({ userId: 'testUser' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Verify the token
      const decodedToken = jwt.verify(response.body.token, config.JWT_SECRET);
      expect(decodedToken).toHaveProperty('userId', 'testUser');
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/api/auth/generate')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'User ID is required');
    });
  });

  describe('POST /api/auth/validate', () => {
    it('should validate a valid token', async () => {
      // Generate a valid token first
      const generateResponse = await request(app)
        .post('/api/auth/generate')
        .send({ userId: 'testUser' });

      const { token } = generateResponse.body;

      const validateResponse = await request(app)
        .post('/api/auth/validate')
        .send({ token });

      expect(validateResponse.statusCode).toBe(200);
      expect(validateResponse.body).toHaveProperty('valid', true);
      expect(validateResponse.body.user).toHaveProperty('userId', 'testUser');
    });

    it('should return 401 for an invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token: 'invalidToken' });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Token is required');
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
    expect(response.body).toHaveProperty('error', 'Invalid token');
  });
});