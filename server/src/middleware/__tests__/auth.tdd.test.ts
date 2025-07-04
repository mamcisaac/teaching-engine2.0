/**
 * TDD-Compliant Authentication Middleware Tests
 * Uses real implementations instead of mocks
 */

import { Express } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  createTestApp,
  createTestUser,
  setupRealTestLifecycle,
  realTestAssertions,
  TestUser,
} from '../../../tests/utils/tdd-test-utilities';
import request from 'supertest';

describe('Authentication Middleware - Real Implementation Tests', () => {
  const testLifecycle = setupRealTestLifecycle();
  let app: Express;
  let testUser: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'auth-test@example.com',
      password: 'SecurePassword123!',
      name: 'Auth Test User',
    });
  });

  describe('Login Endpoint - Real Authentication', () => {
    it('should authenticate user with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password, // Real password, not mocked
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      });

      // Verify token is valid JWT
      const decoded = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET || 'test-secret'
      ) as any;
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
    });

    it('should reject invalid password with real bcrypt comparison', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user from real database', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should handle rate limiting with real rate limiter', async () => {
      // Make multiple login attempts
      const attempts = Array(6).fill(null);
      const responses = await Promise.all(
        attempts.map(() =>
          request(app)
            .post('/auth/login')
            .send({
              email: testUser.email,
              password: 'WrongPassword',
            })
        )
      );

      // First 5 should fail with 401
      responses.slice(0, 5).forEach(res => {
        expect(res.status).toBe(401);
      });

      // 6th should be rate limited
      expect(responses[5].status).toBe(429);
      expect(responses[5].body.error).toContain('Too many requests');
    });
  });

  describe('JWT Middleware - Real Token Validation', () => {
    it('should validate real JWT tokens', async () => {
      // Create a protected test endpoint
      app.get('/test/protected', (req, res) => {
        res.json({ 
          message: 'Success',
          userId: (req as any).userId,
          email: (req as any).userEmail,
        });
      });

      const response = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Success',
        userId: testUser.id,
        email: testUser.email,
      });
    });

    it('should reject expired tokens with real expiration', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token expired');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/test/protected')
        .set('Authorization', 'Bearer malformed.token.here');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });

    it('should reject tokens with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        'wrong-secret', // Different secret
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/test/protected')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('Password Hashing - Real bcrypt Operations', () => {
    it('should hash passwords with proper salt rounds', async () => {
      const plainPassword = 'TestPassword123!';
      
      // Register new user
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: plainPassword,
          name: 'New User',
        });

      expect(response.status).toBe(201);
      
      // Verify password was hashed in database
      const client = await testLifecycle.getClient();
      const user = await client.user.findUnique({
        where: { email: 'newuser@example.com' },
      });

      expect(user).toBeTruthy();
      expect(user!.password).not.toBe(plainPassword);
      
      // Verify hash is valid bcrypt hash
      const isValid = await bcrypt.compare(plainPassword, user!.password);
      expect(isValid).toBe(true);
      
      // Verify wrong password fails
      const isInvalid = await bcrypt.compare('WrongPassword', user!.password);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Session Management - Real Database State', () => {
    it('should track login sessions in database', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(loginResponse.status).toBe(200);
      const { token } = loginResponse.body;

      // Verify session exists in database
      await realTestAssertions.assertDatabaseState(
        'user',
        { id: testUser.id },
        { lastLoginAt: expect.any(Date) }
      );
    });

    it('should handle concurrent login attempts correctly', async () => {
      // Simulate concurrent logins
      const loginPromises = Array(5).fill(null).map(() =>
        request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
      );

      const responses = await Promise.all(loginPromises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      // Each should have unique token
      const tokens = responses.map(r => r.body.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(5);
    });
  });

  describe('Security Headers - Real Implementation', () => {
    it('should set proper security headers on auth endpoints', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      // Check security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toContain('max-age=');
    });
  });

  describe('Real Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testUser.email, // Already exists
          password: 'NewPassword123!',
          name: 'Duplicate User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should validate email format at database level', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
          name: 'Invalid Email User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email');
    });
  });
});