import request from 'supertest';
import app from '@/app';
import { User } from '@/models/User';
import { Session } from '@/models/Session';

describe('Authentication Integration Tests', () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      email: 'integration@example.com',
      username: 'integrationuser',
      password: 'password123',
      firstName: 'Integration',
      lastName: 'Test',
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });
    
    await testUser.save();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh valid token', async () => {
      // First login
      const loginResponse = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        })
        .expect(200);

      const refreshToken = loginResponse.body.tokens.refreshToken;

      // Then refresh
      const response = await request(app.callback())
        .post('/auth/refresh')
        .send({
          refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app.callback())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid token', async () => {
      // First login
      const loginResponse = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        })
        .expect(200);

      const accessToken = loginResponse.body.tokens.accessToken;

      // Then logout
      const response = await request(app.callback())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should reject logout without token', async () => {
      const response = await request(app.callback())
        .post('/auth/logout')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization token required');
    });
  });

  describe('GET /auth/profile', () => {
    it('should get profile with valid token', async () => {
      // First login
      const loginResponse = await request(app.callback())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        })
        .expect(200);

      const accessToken = loginResponse.body.tokens.accessToken;

      // Then get profile
      const response = await request(app.callback())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('integration@example.com');
    });

    it('should reject profile request without token', async () => {
      const response = await request(app.callback())
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization token required');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.callback())
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Authentication service is healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app.callback())
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Fiifi Authentication Service');
      expect(response.body.endpoints).toBeDefined();
    });
  });
});
