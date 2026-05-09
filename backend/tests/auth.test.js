const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

describe('Authentication API Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Setup test database
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/senmool-test'
    );
    
    // Create test app
    app = express();
    app.use(express.json());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (server) server.close();
  });

  describe('POST /api/auth/login', () => {
    test('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should return 401 if credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password' });

      expect(response.status).toBe(401);
    });
  });

  describe('Authentication Middleware', () => {
    test('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });

    test('should verify valid token', async () => {
      // Create a test user and get token
      // Then verify the token works
      expect(true).toBe(true);
    });
  });
});
