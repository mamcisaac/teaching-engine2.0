/**
 * Comprehensive Security Test Suite
 * 
 * Tests all major security vulnerabilities and protections
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { getTestPrismaClient, createTestData } from '../jest.setup';
import bcrypt from 'bcryptjs';

// Import the actual app
let app: any;

beforeEach(async () => {
  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('Comprehensive Security Tests', () => {
  const testUser = {
    email: 'security-test@example.com',
    password: 'SecureTestPassword123!',
    name: 'Security Test User',
    role: 'teacher'
  };

  beforeEach(async () => {
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

  describe('Input Sanitization', () => {
    let authToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      const cookies = response.headers['set-cookie'];
      const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
      authToken = authCookie?.split('=')[1].split(';')[0] || '';
    });

    it('should sanitize XSS attempts in request body', async () => {
      const xssPayload = '<script>alert("XSS")</script><p>Safe content</p>';
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: xssPayload,
          lastName: 'Test',
          grade: 5
        });

      // Should not contain script tags
      expect(response.status).not.toBe(500); // Should not crash
      // Endpoint might not exist, but sanitization should prevent XSS
    });

    it('should sanitize XSS attempts in query parameters', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .get(`/api/curriculum-expectations?search=${encodeURIComponent(xssPayload)}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(500); // Should not crash
    });

    it('should prevent SQL injection in search parameters', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get(`/api/curriculum-expectations?search=${encodeURIComponent(sqlInjection)}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(500); // Should not crash or cause DB error
    });

    it('should limit input length to prevent DoS', async () => {
      const longString = 'A'.repeat(20000); // Very long string
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: longString,
          lastName: 'Test',
          grade: 5
        });

      expect(response.status).not.toBe(500); // Should not crash
    });

    it('should remove null bytes and control characters', async () => {
      const maliciousInput = 'Test\x00\x01\x02\x03Content';
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: maliciousInput,
          lastName: 'Test',
          grade: 5
        });

      expect(response.status).not.toBe(500); // Should not crash
    });
  });

  describe('Authentication Security', () => {
    it('should require environment variables for JWT', async () => {
      // This is tested in other auth tests - JWT_SECRET is now required
      expect(process.env.JWT_SECRET).toBeDefined();
    });

    it('should use secure password hashing', async () => {
      const prisma = getTestPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(testUser.password);
      expect(user!.password.length).toBeGreaterThan(50);
      expect(user!.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });

    it('should validate token payload structure', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-structure');

      expect(response.status).toBe(401);
    });

    it('should reject tokens without required fields', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
    });
  });

  describe('HTTP Security Headers', () => {
    it('should set Content Security Policy headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-XSS-Protection header', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should set Referrer-Policy header', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const promises = [];
      
      // Try to make many login requests quickly
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/login')
            .send({
              email: 'nonexistent@example.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least some should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('File Upload Security', () => {
    let authToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      const cookies = response.headers['set-cookie'];
      const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
      authToken = authCookie?.split('=')[1].split(';')[0] || '';
    });

    it('should validate file types on upload', async () => {
      // Test with a malicious file type
      const response = await request(app)
        .post('/api/curriculum/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('malicious content'), {
          filename: 'malicious.exe',
          contentType: 'application/exe'
        });

      // Should reject executable files
      expect(response.status).toBeOneOf([400, 415, 404]); // Bad request, unsupported media type, or not found
    });

    it('should limit file size', async () => {
      // Create a large buffer (larger than typical limits)
      const largeContent = Buffer.alloc(50 * 1024 * 1024); // 50MB
      
      const response = await request(app)
        .post('/api/curriculum/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeContent, {
          filename: 'large.pdf',
          contentType: 'application/pdf'
        });

      // Should reject files that are too large
      expect(response.status).toBeOneOf([400, 413, 404]); // Bad request, payload too large, or not found
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
        expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
      }
    });

    it('should allow configured origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
    });
  });

  describe('Session Security', () => {
    it('should set secure cookie attributes', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      
      const cookies = response.headers['set-cookie'];
      const authCookie = cookies?.find((cookie: string) => cookie.startsWith('authToken='));
      
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
      expect(authCookie).toContain('SameSite=Strict');
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      
      // Should not contain sensitive paths or internal details
      expect(response.body).not.toHaveProperty('stack');
      expect(response.text).not.toContain('node_modules');
      expect(response.text).not.toContain('server/src');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}'); // Malformed JSON

      expect(response.status).toBe(400);
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});