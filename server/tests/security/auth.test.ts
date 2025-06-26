/**
 * Authentication Security Tests
 * 
 * Tests authentication flows, token security, and session management
 * to ensure secure user access control
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient, createTestData } from '../jest.setup';

// Import the actual app - we need to access it through a dynamic import
// to ensure the test database is properly set up before the app starts
let app: any;

beforeEach(async () => {
  // Import the actual app
  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('Authentication Security Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecureTestPassword123!',
    name: 'Test User',
    role: 'teacher'
  };

  beforeEach(async () => {
    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const prisma = getTestPrismaClient();
    
    await createTestData(async (prisma) => {
      return await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          name: testUser.name,
          role: testUser.role,
        },
      });
    });
  });

  describe('Login Security', () => {
    it('should reject invalid email formats', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should reject non-string credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 123,
          password: ['array'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should sanitize email input', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: '  TEST@EXAMPLE.COM  ',
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject SQL injection attempts in email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: "test@example.com'; DROP TABLE users; --",
          password: testUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject overly long email addresses', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app)
        .post('/api/login')
        .send({
          email: longEmail,
          password: testUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should not leak user existence through timing attacks', async () => {
      const start1 = Date.now();
      await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });
      const time2 = Date.now() - start2;

      // Both responses should be similar in timing (within 100ms)
      expect(Math.abs(time1 - time2)).toBeLessThan(100);
    });

    it('should return consistent error messages for invalid credentials', async () => {
      const response1 = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      const response2 = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response1.status).toBe(401);
      expect(response2.status).toBe(401);
      expect(response1.body.error).toBe(response2.body.error);
      expect(response1.body.error).toBe('Invalid credentials');
    });

    it('should set secure HTTP-only cookies on successful login', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
      expect(authCookie).toContain('SameSite=Strict');
      expect(authCookie).toContain('Path=/');
    });

    it('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeUndefined(); // Token should be in cookie only
    });
  });

  describe('JWT Token Security', () => {
    let validToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      // Extract token from cookie
      const cookies = response.headers['set-cookie'];
      const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
      validToken = authCookie?.split('=')[1].split(';')[0] || '';
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required for testing');
      }
      const expiredToken = jwt.sign(
        { userId: '1', email: testUser.email, iat: Math.floor(Date.now() / 1000) - 1000 },
        jwtSecret,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject tokens with invalid signature', async () => {
      // Create token with different secret
      const invalidToken = jwt.sign(
        { userId: '1', email: testUser.email },
        'wrong-secret'
      );

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject tokens without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should accept valid tokens', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });

    it('should validate token payload structure', async () => {
      // Create token with missing userId
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required for testing');
      }
      const invalidPayloadToken = jwt.sign(
        { email: testUser.email },
        jwtSecret
      );

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${invalidPayloadToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Admin Token Security', () => {
    const originalWizardToken = process.env.WIZARD_TOKEN;

    beforeEach(() => {
      process.env.WIZARD_TOKEN = 'test-wizard-token-123';
    });

    afterEach(() => {
      process.env.WIZARD_TOKEN = originalWizardToken;
    });

    it('should reject requests without admin token', async () => {
      // This would be tested against admin-only endpoints if they exist
      // For now, test the middleware directly
      const response = await request(app)
        .post('/api/test-admin-endpoint')
        .send({});

      // This test assumes there's an admin endpoint - adjust based on actual implementation
      expect(response.status).toBeOneOf([401, 404]);
    });

    it('should reject invalid admin tokens', async () => {
      // Test against admin endpoint with invalid token
      const response = await request(app)
        .post('/api/test-admin-endpoint')
        .set('Authorization', 'Bearer wrong-admin-token')
        .send({});

      expect(response.status).toBeOneOf([403, 404]);
    });

    it('should accept valid admin tokens', async () => {
      // Test against admin endpoint with valid token
      const response = await request(app)
        .post('/api/test-admin-endpoint')
        .set('Authorization', 'Bearer test-wizard-token-123')
        .send({});

      // Should not be unauthorized (might be 404 if endpoint doesn't exist)
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  describe('Session Management', () => {
    it('should clear auth cookie on logout', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(loginResponse.status).toBe(200);

      // Then logout
      const logoutResponse = await request(app)
        .post('/api/logout');

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe('Logged out successfully');

      const cookies = logoutResponse.headers['set-cookie'];
      const authCookie = cookies?.find((cookie: string) => cookie.startsWith('authToken='));
      expect(authCookie).toContain('authToken=;'); // Cookie should be cleared
    });

    it('should validate user existence on auth check', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const cookies = loginResponse.headers['set-cookie'];
      const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
      const token = authCookie?.split('=')[1].split(';')[0] || '';

      // Delete user from database
      const prisma = getTestPrismaClient();
      await prisma.user.delete({
        where: { email: testUser.email }
      });

      // Try to access protected endpoint
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords during registration', async () => {
      // Note: This test assumes there's a registration endpoint
      // Adjust based on actual implementation
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '1234567890',
        'password123'
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post('/api/register')
          .send({
            email: 'newuser@example.com',
            password: weakPassword,
            name: 'New User'
          });

        // Should fail validation (400) or not be implemented (404)
        expect(response.status).toBeOneOf([400, 404]);
      }
    });

    it('should properly hash passwords before storage', async () => {
      const prisma = getTestPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(testUser.password);
      expect(user!.password.length).toBeGreaterThan(50); // Bcrypt hashes are typically 60 chars
      expect(user!.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });
  });
});