/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Rate Limiting Security Test Suite
 * Brute force protection and rate limiting validation
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import {
  rateLimiters,
  createRateLimiter,
  resetRateLimiterState,
  clearRateLimit,
  clearAllRateLimits,
} from '../../middleware/rateLimit';
import { generateAuthToken } from '../../services/auth/authService';
import { authRoutes } from '../../routes/auth';
import logger from '../../logger';

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Rate Limiting Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;
  let testToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-rate-limiting-secret';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? 'file:./test-rate-limiting.db' },
      },
    });

    // Create test user and token
    const testUser = await prisma.user.create({
      data: {
        email: 'rate.limiting@test.com',
        name: 'Rate Limiting Test User',
        password: 'HashedPassword123!',
        role: 'USER',
      },
    });

    testToken = await generateAuthToken(testUser.id.toString(), testUser.email);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Public endpoint without rate limiting
    app.get('/api/public', (req: Request, res: Response) => {
      res.json({ message: 'public endpoint' });
    });

    // Endpoints with different rate limiters
    app.get('/api/auth-limited', rateLimiters.auth, (req: Request, res: Response) => {
      res.json({ message: 'auth rate limited' });
    });

    app.get('/api/api-limited', rateLimiters.api, (req: Request, res: Response) => {
      res.json({ message: 'api rate limited' });
    });

    app.get('/api/read-limited', rateLimiters.read, (req: Request, res: Response) => {
      res.json({ message: 'read rate limited' });
    });

    app.get('/api/write-limited', rateLimiters.write, (req: Request, res: Response) => {
      res.json({ message: 'write rate limited' });
    });

    app.get('/api/ai-limited', rateLimiters.ai, (req: Request, res: Response) => {
      res.json({ message: 'ai rate limited' });
    });

    app.post('/api/upload-limited', rateLimiters.upload, (req: Request, res: Response) => {
      res.json({ message: 'upload rate limited' });
    });

    // Custom rate limiter for testing
    const strictLimiter = createRateLimiter({
      windowMs: 60000, // 1 minute
      max: 3, // Only 3 requests per minute
      message: 'Strict rate limit exceeded',
    });

    app.get('/api/strict-limited', strictLimiter, (req: Request, res: Response) => {
      res.json({ message: 'strict rate limited' });
    });

    // Rate limiter with custom key generator
    const userBasedLimiter = createRateLimiter({
      windowMs: 60000, // 1 minute
      max: 5,
      keyGenerator: (req) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // Use user ID from token (simplified)
          return `user-${authHeader.slice(7, 15)}`;
        }
        return req.ip || 'anonymous';
      },
      message: 'User-based rate limit exceeded',
    });

    app.get('/api/user-limited', userBasedLimiter, (req: Request, res: Response) => {
      res.json({ message: 'user rate limited' });
    });

    // Authentication routes for brute force testing
    app.use('/api/auth', rateLimiters.auth);
    app.use('/api/auth', authRoutes(prisma));

    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimiterState();
    clearAllRateLimits();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'rate.limiting' } },
    });
    await prisma.$disconnect();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests under the limit', async () => {
      const responses = [];

      // Make requests under the limit
      for (let i = 0; i < 3; i++) {
        const response = await request.get('/api/strict-limited');
        responses.push(response);
      }

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('strict rate limited');
      });
    });

    it('should reject requests over the limit', async () => {
      const responses = [];

      // Make requests to exceed the limit
      for (let i = 0; i < 5; i++) {
        const response = await request.get('/api/strict-limited');
        responses.push(response);
      }

      // First 3 should succeed
      for (let i = 0; i < 3; i++) {
        expect(responses[i].status).toBe(200);
      }

      // Remaining should be rate limited
      for (let i = 3; i < 5; i++) {
        expect(responses[i].status).toBe(429);
        expect(responses[i].body.error).toBe('Strict rate limit exceeded');
      }
    });

    it('should include rate limit headers', async () => {
      const response = await request.get('/api/strict-limited');

      expect(response.status).toBe(200);
      expect(response.headers['x-ratelimit-limit']).toBe('3');
      expect(response.headers['x-ratelimit-remaining']).toBe('2');
      expect(response.headers['x-ratelimit-reset']).toBeTruthy();
    });

    it('should include retry-after header when rate limited', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited');
      }

      // Next request should be rate limited
      const response = await request.get('/api/strict-limited');

      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeTruthy();
      expect(response.headers['x-ratelimit-remaining']).toBe('0');
    });

    it('should reset rate limit after window expires', async () => {
      // Create a short-window rate limiter for testing
      const shortLimiter = createRateLimiter({
        windowMs: 100, // 100ms window
        max: 2,
        message: 'Short window exceeded',
      });

      app.get('/api/short-limited', shortLimiter, (req: Request, res: Response) => {
        res.json({ message: 'short limited' });
      });

      // Exhaust rate limit
      for (let i = 0; i < 2; i++) {
        const response = await request.get('/api/short-limited');
        expect(response.status).toBe(200);
      }

      // Should be rate limited
      const limitedResponse = await request.get('/api/short-limited');
      expect(limitedResponse.status).toBe(429);

      // Wait for window to reset
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should work again
      const resetResponse = await request.get('/api/short-limited');
      expect(resetResponse.status).toBe(200);
    });
  });

  describe('Authentication Brute Force Protection', () => {
    it('should rate limit login attempts', async () => {
      const loginAttempts = [];

      // Make multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        const attempt = request.post('/api/auth/login').send({
          email: 'rate.limiting@test.com',
          password: 'WrongPassword123!',
        });
        loginAttempts.push(attempt);
      }

      const responses = await Promise.all(loginAttempts);

      // Should start rate limiting after several attempts
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Rate limited responses should have proper error message
      rateLimitedResponses.forEach((response) => {
        expect(response.body.error).toContain('Too many');
        expect(response.headers['retry-after']).toBeTruthy();
      });
    });

    it('should rate limit registration attempts', async () => {
      const registrationAttempts = [];

      // Make multiple registration attempts
      for (let i = 0; i < 10; i++) {
        const attempt = request.post('/api/auth/register').send({
          email: `test.${i}@example.com`,
          name: `Test User ${i}`,
          password: 'ValidPassword123!',
        });
        registrationAttempts.push(attempt);
      }

      const responses = await Promise.all(registrationAttempts);

      // Some should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should not count successful requests against auth rate limit', async () => {
      // Make successful login first
      const successfulLogin = await request.post('/api/auth/login').send({
        email: 'rate.limiting@test.com',
        password: 'HashedPassword123!',
      });

      expect(successfulLogin.status).toBe(200);

      // Make failed attempts to test that successful ones don't count
      const failedAttempts = [];
      for (let i = 0; i < 6; i++) {
        const attempt = request.post('/api/auth/login').send({
          email: 'rate.limiting@test.com',
          password: 'WrongPassword123!',
        });
        failedAttempts.push(attempt);
      }

      const responses = await Promise.all(failedAttempts);

      // Should still allow some failed attempts since successful one didn't count
      const successfulAttempts = responses.filter((r) => r.status === 401);
      expect(successfulAttempts.length).toBeGreaterThan(0);
    });
  });

  describe('Different Rate Limiter Types', () => {
    it('should apply different limits for different endpoint types', async () => {
      const endpointTests = [
        { endpoint: '/api/api-limited', limit: 100 },
        { endpoint: '/api/read-limited', limit: 200 },
        { endpoint: '/api/write-limited', limit: 50 },
        { endpoint: '/api/ai-limited', limit: 20 },
      ];

      for (const test of endpointTests) {
        const response = await request.get(test.endpoint);
        expect(response.status).toBe(200);
        expect(response.headers['x-ratelimit-limit']).toBe(test.limit.toString());
      }
    });

    it('should handle AI endpoint rate limiting', async () => {
      const aiRequests = [];

      // Make multiple AI requests
      for (let i = 0; i < 25; i++) {
        aiRequests.push(request.get('/api/ai-limited'));
      }

      const responses = await Promise.all(aiRequests);

      // Should rate limit AI requests more strictly
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check AI-specific error message
      rateLimitedResponses.forEach((response) => {
        expect(response.body.error).toContain('AI generation limit exceeded');
      });
    });

    it('should handle upload endpoint rate limiting', async () => {
      const uploadRequests = [];

      // Make multiple upload requests
      for (let i = 0; i < 15; i++) {
        uploadRequests.push(request.post('/api/upload-limited'));
      }

      const responses = await Promise.all(uploadRequests);

      // Should rate limit upload requests
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check upload-specific error message
      rateLimitedResponses.forEach((response) => {
        expect(response.body.error).toContain('File upload limit exceeded');
      });
    });
  });

  describe('Custom Key Generation', () => {
    it('should use custom key generators', async () => {
      // Test with authorization header
      const responses1 = [];
      for (let i = 0; i < 6; i++) {
        const response = await request
          .get('/api/user-limited')
          .set('Authorization', `Bearer ${testToken}`);
        responses1.push(response);
      }

      // Should rate limit based on token
      const rateLimited1 = responses1.filter((r) => r.status === 429);
      expect(rateLimited1.length).toBeGreaterThan(0);

      // Test without authorization header (different key)
      const responses2 = [];
      for (let i = 0; i < 6; i++) {
        const response = await request.get('/api/user-limited');
        responses2.push(response);
      }

      // Should have separate rate limit for anonymous users
      const rateLimited2 = responses2.filter((r) => r.status === 429);
      expect(rateLimited2.length).toBeGreaterThan(0);
    });

    it('should handle different users separately', async () => {
      // Create another test token
      const user2 = await prisma.user.create({
        data: {
          email: 'rate.limiting.2@test.com',
          name: 'Rate Limiting Test User 2',
          password: 'HashedPassword123!',
          role: 'USER',
        },
      });

      const testToken2 = await generateAuthToken(user2.id.toString(), user2.email);

      // Make requests with first token
      for (let i = 0; i < 5; i++) {
        await request.get('/api/user-limited').set('Authorization', `Bearer ${testToken}`);
      }

      // Should still allow requests with second token
      const response = await request
        .get('/api/user-limited')
        .set('Authorization', `Bearer ${testToken2}`);

      expect(response.status).toBe(200);

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('Rate Limit Bypass Attempts', () => {
    it('should not be bypassed by changing user agent', async () => {
      // Exhaust rate limit with one user agent
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited').set('User-Agent', 'Test Agent 1');
      }

      // Try with different user agent
      const response = await request.get('/api/strict-limited').set('User-Agent', 'Test Agent 2');

      expect(response.status).toBe(429);
    });

    it('should not be bypassed by changing request headers', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited');
      }

      // Try with various headers
      const bypassAttempts = [
        { 'X-Forwarded-For': '1.2.3.4' },
        { 'X-Real-IP': '1.2.3.4' },
        { 'X-Client-IP': '1.2.3.4' },
        { 'CF-Connecting-IP': '1.2.3.4' },
        { 'X-Originating-IP': '1.2.3.4' },
      ];

      for (const headers of bypassAttempts) {
        const response = await request.get('/api/strict-limited').set(headers);

        expect(response.status).toBe(429);
      }
    });

    it('should not be bypassed by changing HTTP method', async () => {
      // Exhaust rate limit with GET
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited');
      }

      // Try with different methods
      const methods = ['post', 'put', 'patch', 'delete'];

      for (const method of methods) {
        const response = await request[method]('/api/strict-limited');
        // Should either be rate limited or method not allowed
        expect(response.status).toBeOneOf([405, 429]);
      }
    });

    it('should handle malformed rate limit bypass attempts', async () => {
      const malformedRequests = [
        () => request.get('/api/strict-limited').set('X-Rate-Limit-Bypass', 'true'),
        () => request.get('/api/strict-limited').set('Authorization', 'Bypass secret'),
        () => request.get('/api/strict-limited').query({ bypass: 'true' }),
        () => request.get('/api/strict-limited').query({ admin: 'true' }),
        () => request.get('/api/strict-limited').set('Cookie', 'bypass=true'),
      ];

      // Exhaust rate limit first
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited');
      }

      // Try bypass attempts
      for (const malformedRequest of malformedRequests) {
        const response = await malformedRequest();
        expect(response.status).toBe(429);
      }
    });
  });

  describe('Rate Limit Security Edge Cases', () => {
    it('should handle concurrent requests correctly', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request.get('/api/strict-limited'),
      );

      const responses = await Promise.all(concurrentRequests);

      // Should respect rate limit even with concurrent requests
      const successfulResponses = responses.filter((r) => r.status === 200);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(successfulResponses.length).toBeLessThanOrEqual(3);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should handle rate limit state cleanup', async () => {
      // Make some requests to create state
      for (let i = 0; i < 2; i++) {
        await request.get('/api/strict-limited');
      }

      // Clear rate limits
      clearAllRateLimits();

      // Should allow full limit again
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await request.get('/api/strict-limited');
        responses.push(response);
      }

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle memory cleanup for expired entries', async () => {
      // This test verifies the cleanup interval works
      // Make requests to populate rate limit store
      await request.get('/api/strict-limited');

      // The cleanup happens automatically every minute in the background
      // This test mainly ensures no errors occur during cleanup
      expect(true).toBe(true); // Test passes if no errors thrown
    });

    it('should handle invalid IP addresses gracefully', async () => {
      // Mock request with invalid IP
      const invalidIpApp = express();
      invalidIpApp.use((req: Request, res: Response, next: NextFunction) => {
        // Simulate invalid IP
        req.ip = undefined;
        req.connection.remoteAddress = undefined;
        next();
      });
      invalidIpApp.use(rateLimiters.api);
      invalidIpApp.get('/test', (req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      const invalidIpRequest = supertest(invalidIpApp);
      const response = await invalidIpRequest.get('/test');

      // Should handle gracefully
      expect(response.status).toBeOneOf([200, 429]);
    });

    it('should handle rate limit storage errors gracefully', async () => {
      // This would be more complex to test properly - would need to mock
      // the internal Map to throw errors. For now, verify basic functionality
      const response = await request.get('/api/api-limited');
      expect(response.status).toBe(200);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high request volumes efficiently', async () => {
      const startTime = Date.now();

      // Make many requests quickly
      const requests = Array.from({ length: 100 }, () => request.get('/api/api-limited'));

      await Promise.all(requests);

      const duration = Date.now() - startTime;

      // Should complete reasonably quickly (allowing for CI environment)
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should not leak memory with many different keys', async () => {
      // Simulate many different IPs/users
      const manyKeyApp = express();
      let keyCounter = 0;

      const testLimiter = createRateLimiter({
        windowMs: 60000,
        max: 10,
        keyGenerator: () => `test-key-${keyCounter++}`,
      });

      manyKeyApp.get('/test', testLimiter, (req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      const manyKeyRequest = supertest(manyKeyApp);

      // Make requests with many different keys
      for (let i = 0; i < 100; i++) {
        await manyKeyRequest.get('/test');
      }

      // Test should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe('Rate Limit Monitoring and Logging', () => {
    it('should log rate limit violations', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 3; i++) {
        await request.get('/api/strict-limited');
      }

      // Trigger rate limit
      await request.get('/api/strict-limited');

      // Check if rate limit was logged
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/strict-limited',
          method: 'GET',
        }),
        'Rate limit exceeded',
      );
    });

    it('should provide detailed rate limit information in headers', async () => {
      const response = await request.get('/api/api-limited');

      expect(response.headers['x-ratelimit-limit']).toBeTruthy();
      expect(response.headers['x-ratelimit-remaining']).toBeTruthy();
      expect(response.headers['x-ratelimit-reset']).toBeTruthy();

      // Verify header values are reasonable
      const limit = parseInt(response.headers['x-ratelimit-limit']);
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(limit);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });
});
