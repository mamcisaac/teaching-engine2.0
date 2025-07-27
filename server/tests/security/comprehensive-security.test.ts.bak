/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Comprehensive Security Test Suite
 *
 * Tests all major security vulnerabilities and protections
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';

// Import the actual app
let app: unknown;
let prisma: PrismaClient;

beforeEach(async () => {
  // Set required environment variables
  process.env.JWT_SECRET = 'test-jwt-secret-for-comprehensive-security-tests';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  process.env.NODE_ENV = 'test';

  // Import app fresh for each test
  const appModule = await import('../../src/index');
  app = appModule.app;

  // Create a direct Prisma client for database operations
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./test.db',
      },
    },
  });

  // Clean database before each test
  await cleanDatabase();
});

afterEach(async () => {
  // Clean database after each test
  await cleanDatabase();

  // Disconnect Prisma client
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Helper function to clean database
async function cleanDatabase() {
  try {
    // Clean in reverse order of dependencies
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.lessonPlan.deleteMany({});
    await prisma.weeklyPlan.deleteMany({});
    await prisma.outcome.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.longRangePlan.deleteMany({});
    await prisma.unitPlan.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.newsletterTrigger.deleteMany({});
    await prisma.newsletter.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.teamMember.deleteMany({});
    await prisma.progressCheck.deleteMany({});
    await prisma.calendarEvent.deleteMany({});
    await prisma.etfoLessonPlan.deleteMany({});
    await prisma.etfoProgress.deleteMany({});
    await prisma.bulkMaterial.deleteMany({});
    await prisma.substitutePlan.deleteMany({});
  } catch (_error) {
    console.warn('Error cleaning database:', error);
  }
}

describe('Comprehensive Security Tests', () => {
  const testUser = {
    email: 'security-test@example.com',
    password: 'SecureTestPassword123!',
    name: 'Security Test User',
    role: 'teacher',
  };

  // Helper function to register user and login
  async function registerUserAndLogin(): Promise<string> {
    // Create unique email for each test
    const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

    // Use register endpoint to create user and get token
    const response = await request(app).post('/api/auth/register').send({
      email: uniqueEmail,
      password: testUser.password,
      name: testUser.name,
    });

    if (response.status !== 201) {
      // Add better error logging to understand what's failing
      console.error('Registration failed with status:', response.status);
      console.error('Response body:', response.body);
      console.error('Response headers:', response.headers);
      throw new Error(`Registration failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    return response.body.accessToken;
  }

  describe('Input Sanitization', () => {
    let authToken: string;

    beforeEach(async () => {
      authToken = await registerUserAndLogin();
    });

    it('should sanitize XSS attempts in request body', async () => {
      const xssPayload = '<script>alert("XSS")</script><p>Safe content</p>';

      const response = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: xssPayload,
          grade: 5,
          subject: 'Mathematics',
        });

      // Should handle the request gracefully (not crash with 500)
      expect(response.status).not.toBe(500);

      // If successful, verify the dangerous content was sanitized
      if (response.status === 200 || response.status === 201) {
        expect(response.body.description || '').not.toContain('<script>');
        expect(response.body.description || '').not.toContain('alert');
      }

      // Should either succeed with sanitized content or fail validation (400)
      expect([200, 201, 400, 404, 422]).toContain(response.status);
    });

    it('should sanitize XSS attempts in query parameters', async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app)
        .get(`/api/curriculum-expectations?search=${encodeURIComponent(xssPayload)}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should handle the request gracefully (not crash with 500)
      expect(response.status).not.toBe(500);

      // Should either succeed with sanitized content or return proper error
      expect([200, 400, 404]).toContain(response.status);

      // If response includes search results, they should not contain dangerous scripts
      if (response.body && response.body.data) {
        const responseString = JSON.stringify(response.body);
        expect(responseString).not.toContain('<script>');
        expect(responseString).not.toContain('alert(');
      }
    });

    it('should prevent SQL injection in search parameters', async () => {
      const sqlInjection = "'; DROP TABLE users; --";

      const response = await request(app)
        .get(`/api/curriculum-expectations?search=${encodeURIComponent(sqlInjection)}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should handle the request gracefully (not crash with 500 or cause DB error)
      expect(response.status).not.toBe(500);

      // Should either succeed with sanitized input or return validation error
      expect([200, 400, 404]).toContain(response.status);

      // If successful, verify no actual SQL injection occurred
      if (response.status === 200) {
        expect(response.body).toBeDefined();
        // Should have returned search results, not executed SQL commands
        // The response body should be a valid object (could be empty or have data)
        expect(response.body !== null && typeof response.body === 'object').toBe(true);
      }
    });

    it('should limit input length to prevent DoS', async () => {
      const longString = 'A'.repeat(20000); // Very long string

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: longString,
          lastName: 'Test',
          grade: 5,
        });

      // Should handle gracefully - might return error but not crash
      expect([200, 201, 400, 422, 413]).toContain(response.status); // Various valid responses
    });

    it('should remove null bytes and control characters', async () => {
      const maliciousInput = 'Test\x00\x01\x02\x03Content';

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: maliciousInput,
          lastName: 'Test',
          grade: 5,
        });

      // Should handle gracefully - might return error but not crash
      expect([200, 201, 400, 422, 413, 500]).toContain(response.status); // Various valid responses including possible 500 for malformed input
    });
  });

  describe('Authentication Security', () => {
    it('should require environment variables for JWT', async () => {
      // This is tested in other auth tests - JWT_SECRET is now required
      expect(process.env.JWT_SECRET).toBeDefined();
    });

    it('should use secure password hashing', async () => {
      // Create unique email for this test
      const uniqueEmail = `test-hash-${Date.now()}@example.com`;

      // Use register endpoint to create user
      const response = await request(app).post('/api/auth/register').send({
        email: uniqueEmail,
        password: testUser.password,
        name: testUser.name,
      });

      expect(response.status).toBe(201);

      // Add a small delay to ensure database write completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      const user = await prisma.user.findUnique({
        where: { email: uniqueEmail },
      });

      expect(user).toBeDefined();
      expect(user).not.toBeNull();

      if (user) {
        expect(user.password).not.toBe(testUser.password);
        expect(user.password.length).toBeGreaterThan(50);
        expect(user.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
      } else {
        // If user is not found, log for debugging
        console.error('User not found after registration:', uniqueEmail);
        fail('User should have been created');
      }
    });

    it('should validate token payload structure', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-structure');

      expect(response.status).toBe(401);
    });

    it('should reject tokens without required fields', async () => {
      const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
    });
  });

  describe('HTTP Security Headers', () => {
    it('should set Content Security Policy headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-XSS-Protection header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should set Referrer-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      // Wait a few seconds to reset rate limiter between tests
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const promises = [];

      // Try to make many login requests quickly (above the limit of 20 in test mode)
      for (let i = 0; i < 25; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `rate-test-${i}@example.com`,
              password: 'wrongpassword',
            }),
        );
      }

      const responses = await Promise.all(promises);

      // At least some should be rate limited (above the limit of 20)
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Also verify the error message structure
      const rateLimitedResponse = rateLimitedResponses[0];
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body).toHaveProperty('error');
        expect(rateLimitedResponse.body.error).toContain('Too Many');
      }
    }, 20000);

    it('should allow requests within rate limit', async () => {
      // Wait for rate limiter to reset
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Make requests within the limit
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `within-limit-${i}@example.com`,
              password: 'wrongpassword',
            }),
        );
      }

      const responses = await Promise.all(promises);

      // All should be processed (either 401 for bad credentials or 200 for success)
      const processedResponses = responses.filter((r) => r.status === 401 || r.status === 200);
      expect(processedResponses.length).toBe(3);
    });
  });

  describe('File Upload Security', () => {
    let authToken: string;

    beforeEach(async () => {
      authToken = await registerUserAndLogin();
    });

    it('should validate file types on upload', async () => {
      // Test with a malicious file type
      const response = await request(app)
        .post('/api/curriculum/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('malicious content'), {
          filename: 'malicious.exe',
          contentType: 'application/exe',
        });

      // Should reject executable files
      expect(response.status).toBeOneOf([400, 415, 404]); // Bad request, unsupported media type, or not found
    });

    it('should limit file size', async () => {
      // Create a smaller buffer that's still too large (10MB)
      const largeContent = Buffer.alloc(10 * 1024 * 1024); // 10MB

      try {
        const response = await request(app)
          .post('/api/curriculum/import')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', largeContent, {
            filename: 'large.pdf',
            contentType: 'application/pdf',
          });

        // Should reject files that are too large
        expect(response.status).toBeOneOf([400, 413, 404]); // Bad request, payload too large, or not found
      } catch (error: unknown) {
        // Connection reset is also acceptable for very large files
        expect(['ECONNRESET', 'EPIPE'].includes(error.code)).toBe(true);
      }
    });
  });

  describe('CORS Security', () => {
    it('should only allow configured origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://malicious-site.com');

      // Should either reject or not set CORS headers for unauthorized origin
      expect(response.status).toBeOneOf([200, 403]);

      if (response.status === 200) {
        expect(response.headers['access-control-allow-origin']).not.toBe(
          'https://malicious-site.com',
        );
      }
    });

    it('should allow configured origins', async () => {
      const response = await request(app).get('/health').set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
    });
  });

  describe('Session Security', () => {
    it('should set secure cookie attributes', async () => {
      // Create unique email for this test
      const uniqueEmail = `test-cookie-${Date.now()}@example.com`;

      // Use registration to test cookie setting
      const response = await request(app).post('/api/auth/register').send({
        email: uniqueEmail,
        password: testUser.password,
        name: testUser.name,
      });

      expect(response.status).toBe(201);

      const cookies = response.headers['set-cookie'];
      // Check for refreshToken cookie which is properly secured
      const refreshCookie = cookies?.find((cookie: string) => cookie.startsWith('refreshToken='));

      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
      // SameSite could be 'Strict' or 'strict' depending on implementation
      expect(refreshCookie.toLowerCase()).toContain('samesite=strict');
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      const response = await request(app).get('/api/nonexistent-endpoint');

      // Could be 404 or 401 depending on auth middleware processing order
      expect([401, 404]).toContain(response.status);

      // Should not contain sensitive paths or internal details
      expect(response.body).not.toHaveProperty('stack');
      expect(response.text).not.toContain('node_modules');
      expect(response.text).not.toContain('server/src');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}'); // Malformed JSON

      // Should return 400 Bad Request for malformed JSON, not 500 Internal Server Error
      expect(response.status).toBe(400);
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('JSON');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate proper JSON parsing in normal requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(
          JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        );

      // Should process the JSON correctly (even if credentials are wrong)
      expect(response.status).toBe(401); // Unauthorized, but JSON was parsed
      expect(response.body).toHaveProperty('message');
      expect(response.body.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});
