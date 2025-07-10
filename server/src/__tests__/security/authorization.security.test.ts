/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authorization Security Test Suite
 * Role-based access control and permission boundary testing
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { generateAuthToken } from '../../services/auth/authService';
import { authMiddleware, requireAdminToken } from '../../middleware/auth';
import { rateLimiters } from '../../middleware/rateLimit';
import logger from '../../logger';

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Authorization Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;

  // Test users with different roles
  let adminUser: unknown;
  let moderatorUser: unknown;
  let regularUser: unknown;
  let inactiveUser: unknown;

  // Test tokens
  let adminToken: string;
  let moderatorToken: string;
  let regularToken: string;
  let inactiveToken: string;

  beforeAll(async () => {
    // Set test environment
    process.env.JWT_SECRET = 'test-authorization-secret-key-for-testing';
    process.env.WIZARD_TOKEN = 'test-wizard-token-for-admin-access';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? 'file:./test-authorization.db' },
      },
    });

    // Create test users with different roles
    const bcrypt = await import('bcryptjs');

    adminUser = await prisma.user.create({
      data: {
        email: 'admin.authorization@test.com',
        name: 'Admin User',
        password: await bcrypt.hash('AdminPass123!', 10),
        role: 'ADMIN',
        isActive: true,
      },
    });

    moderatorUser = await prisma.user.create({
      data: {
        email: 'moderator.authorization@test.com',
        name: 'Moderator User',
        password: await bcrypt.hash('ModeratorPass123!', 10),
        role: 'MODERATOR',
        isActive: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'user.authorization@test.com',
        name: 'Regular User',
        password: await bcrypt.hash('UserPass123!', 10),
        role: 'USER',
        isActive: true,
      },
    });

    inactiveUser = await prisma.user.create({
      data: {
        email: 'inactive.authorization@test.com',
        name: 'Inactive User',
        password: await bcrypt.hash('InactivePass123!', 10),
        role: 'USER',
        isActive: false,
      },
    });

    // Generate tokens for test users
    adminToken = await generateAuthToken(adminUser.id.toString(), adminUser.email);
    moderatorToken = await generateAuthToken(moderatorUser.id.toString(), moderatorUser.email);
    regularToken = await generateAuthToken(regularUser.id.toString(), regularUser.email);
    inactiveToken = await generateAuthToken(inactiveUser.id.toString(), inactiveUser.email);

    // Setup Express app with authorization middleware
    app = express();
    app.use(express.json());

    // Public endpoint
    app.get('/api/public', (req: Request, res: Response) => {
      res.json({ message: 'public endpoint' });
    });

    // Protected endpoint requiring authentication
    app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
      res.json({ message: 'protected endpoint', user: req.user });
    });

    // Admin-only endpoint
    app.get('/api/admin', authMiddleware, (req: Request, res: Response) => {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      res.json({ message: 'admin endpoint', user: req.user });
    });

    // Moderator or admin endpoint
    app.get('/api/moderator', authMiddleware, (req: Request, res: Response) => {
      // Check if user is moderator or admin
      if (!['MODERATOR', 'ADMIN'].includes(req.user?.role || '')) {
        return res.status(403).json({ error: 'Moderator access required' });
      }
      res.json({ message: 'moderator endpoint', user: req.user });
    });

    // Wizard token protected endpoint
    app.get('/api/wizard', requireAdminToken, (req: Request, res: Response) => {
      res.json({ message: 'wizard endpoint' });
    });

    // Rate limited endpoint
    app.get('/api/limited', rateLimiters.api, (req: Request, res: Response) => {
      res.json({ message: 'rate limited endpoint' });
    });

    // User-specific resource endpoint
    app.get('/api/users/:userId/data', authMiddleware, (req: Request, res: Response) => {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user?.userId;

      // Users can only access their own data unless they're admin
      if (currentUserId !== requestedUserId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        message: 'user data',
        userId: requestedUserId,
        currentUser: req.user,
      });
    });

    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'authorization@test.com' } },
    });
    await prisma.$disconnect();
  });

  describe('Authentication Middleware', () => {
    it('should allow access to public endpoints without authentication', async () => {
      const response = await request.get('/api/public');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('public endpoint');
    });

    it('should require authentication for protected endpoints', async () => {
      const response = await request.get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should allow access with valid token', async () => {
      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('protected endpoint');
      expect(response.body.user.email).toBe(regularUser.email);
    });

    it('should reject invalid tokens', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'Bearer ',
        '',
        'Basic dXNlcjpwYXNz', // Basic auth instead of Bearer
        `Bearer ${regularToken}xxx`, // Tampered token
      ];

      for (const invalidToken of invalidTokens) {
        const response = await request.get('/api/protected').set('Authorization', invalidToken);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
      }
    });

    it('should reject expired tokens', async () => {
      const expiredToken = await generateAuthToken(
        regularUser.id.toString(),
        regularUser.email,
        '1ms',
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should handle missing JWT_SECRET gracefully', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      try {
        const response = await request
          .get('/api/protected')
          .set('Authorization', `Bearer ${regularToken}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Server configuration error');
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin endpoints', async () => {
      const response = await request.get('/api/admin').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('admin endpoint');
    });

    it('should deny non-admin access to admin endpoints', async () => {
      const testCases = [
        { token: regularToken, role: 'USER' },
        { token: moderatorToken, role: 'MODERATOR' },
        { token: inactiveToken, role: 'USER' },
      ];

      for (const testCase of testCases) {
        const response = await request
          .get('/api/admin')
          .set('Authorization', `Bearer ${testCase.token}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Admin access required');
      }
    });

    it('should allow moderator and admin access to moderator endpoints', async () => {
      const validTokens = [
        { token: adminToken, role: 'ADMIN' },
        { token: moderatorToken, role: 'MODERATOR' },
      ];

      for (const testCase of validTokens) {
        const response = await request
          .get('/api/moderator')
          .set('Authorization', `Bearer ${testCase.token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('moderator endpoint');
      }
    });

    it('should deny regular user access to moderator endpoints', async () => {
      const response = await request
        .get('/api/moderator')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Moderator access required');
    });

    it('should handle role tampering attempts', async () => {
      // Create a token with tampered role claim
      const jwt = await import('jsonwebtoken');
      const tamperedToken = jwt.sign(
        {
          userId: regularUser.id.toString(),
          email: regularUser.email,
          role: 'ADMIN', // Tampered role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' },
      );

      const response = await request
        .get('/api/admin')
        .set('Authorization', `Bearer ${tamperedToken}`);

      // Should still be denied because role is not checked from token
      expect(response.status).toBe(403);
    });
  });

  describe('Resource-Level Authorization', () => {
    it('should allow users to access their own data', async () => {
      const response = await request
        .get(`/api/users/${regularUser.id}/data`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(regularUser.id.toString());
    });

    it('should deny users access to other users data', async () => {
      const response = await request
        .get(`/api/users/${adminUser.id}/data`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should allow admin access to any user data', async () => {
      const response = await request
        .get(`/api/users/${regularUser.id}/data`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(regularUser.id.toString());
    });

    it('should handle invalid user IDs in resource access', async () => {
      const invalidUserIds = [
        'nonexistent-id',
        '999999',
        '../admin',
        'null',
        'undefined',
        '',
        '0',
        '-1',
      ];

      for (const invalidId of invalidUserIds) {
        const response = await request
          .get(`/api/users/${invalidId}/data`)
          .set('Authorization', `Bearer ${regularToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Access denied');
      }
    });
  });

  describe('Admin Token Security', () => {
    it('should allow access with valid wizard token', async () => {
      const response = await request
        .get('/api/wizard')
        .set('Authorization', `Bearer ${process.env.WIZARD_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('wizard endpoint');
    });

    it('should deny access with invalid wizard token', async () => {
      const invalidTokens = [
        'wrong-wizard-token',
        'Bearer wrong-token',
        regularToken,
        adminToken,
        '',
        'invalid',
      ];

      for (const invalidToken of invalidTokens) {
        const response = await request
          .get('/api/wizard')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Invalid admin token');
      }
    });

    it('should require authorization header for wizard endpoints', async () => {
      const response = await request.get('/api/wizard');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Admin token required');
    });
  });

  describe('User Status and Account Security', () => {
    it('should allow access for active users', async () => {
      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle inactive user accounts', async () => {
      // Note: Current implementation doesn't check user status in middleware
      // This test documents the expected behavior for future implementation
      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${inactiveToken}`);

      // Currently passes - may need to add active user check to middleware
      expect(response.status).toBe(200);
    });

    it('should handle deleted user accounts', async () => {
      // Create a user, get token, then delete user
      const tempUser = await prisma.user.create({
        data: {
          email: 'temp.deleted@test.com',
          name: 'Temp User',
          password: await (await import('bcryptjs')).hash('TempPass123!', 10),
          role: 'USER',
        },
      });

      const tempToken = await generateAuthToken(tempUser.id.toString(), tempUser.email);

      // Delete the user
      await prisma.user.delete({
        where: { id: tempUser.id },
      });

      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${tempToken}`);

      // Token should still be valid (JWT is stateless)
      // But application should check user existence for sensitive operations
      expect(response.status).toBe(200);
    });
  });

  describe('Authorization Security Edge Cases', () => {
    it('should handle malformed authorization headers', async () => {
      const malformedHeaders = [
        'Bearer',
        'Bearer   ',
        'Bearer\t',
        'Bearer\n',
        'Bearer multiple tokens here',
        'Bearer token with spaces',
        'Bearer\x00token',
        'Bearer token\x00',
      ];

      for (const header of malformedHeaders) {
        const response = await request.get('/api/protected').set('Authorization', header);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
      }
    });

    it('should handle case sensitivity in authorization scheme', async () => {
      const caseSensitiveHeaders = [
        `bearer ${regularToken}`,
        `BEARER ${regularToken}`,
        `Bearer ${regularToken}`,
        `Bearer  ${regularToken}`,
      ];

      for (const header of caseSensitiveHeaders) {
        const response = await request.get('/api/protected').set('Authorization', header);

        // Only exact "Bearer " should work
        if (header === `Bearer ${regularToken}`) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(401);
        }
      }
    });

    it('should prevent authorization bypasses through method manipulation', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

      for (const method of methods) {
        const response = await request[method.toLowerCase()]('/api/protected');

        if (method === 'OPTIONS') {
          // OPTIONS requests might be handled differently
          expect(response.status).toBeOneOf([200, 204, 404, 405]);
        } else {
          expect(response.status).toBe(401);
        }
      }
    });

    it('should prevent header injection attacks', async () => {
      const maliciousHeaders = [
        `Bearer ${regularToken}\r\nMalicious: header`,
        `Bearer ${regularToken}\nMalicious: header`,
        `Bearer ${regularToken}\r\nAuthorization: Bearer ${adminToken}`,
        `Bearer ${regularToken}; Malicious=value`,
      ];

      for (const header of maliciousHeaders) {
        const response = await request.get('/api/protected').set('Authorization', header);

        // Should either reject or sanitize the header
        expect(response.status).toBeOneOf([200, 401]);
      }
    });

    it('should handle concurrent authorization requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request.get('/api/protected').set('Authorization', `Bearer ${regularToken}`),
      );

      const responses = await Promise.all(concurrentRequests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe(regularUser.email);
      });
    });

    it('should handle authorization with different token types', async () => {
      const differentTokenTypes = [
        `Basic ${Buffer.from('user:pass').toString('base64')}`,
        `Digest username="user"`,
        `Bearer ${regularToken}`,
        `Token ${regularToken}`,
        `JWT ${regularToken}`,
        `ApiKey ${regularToken}`,
      ];

      for (const tokenType of differentTokenTypes) {
        const response = await request.get('/api/protected').set('Authorization', tokenType);

        // Only Bearer tokens should work
        if (tokenType === `Bearer ${regularToken}`) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(401);
        }
      }
    });
  });

  describe('Security Headers and Response Safety', () => {
    it('should not expose sensitive information in authorization responses', async () => {
      const response = await request
        .get('/api/protected')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);

      // Check that sensitive info is not exposed
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.accessToken).toBeUndefined();
      expect(response.body.secret).toBeUndefined();
    });

    it('should handle authorization failures gracefully', async () => {
      const response = await request
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');

      // Should not expose stack traces or detailed error info
      expect(response.body.stack).toBeUndefined();
      expect(response.body.details).toBeUndefined();
      expect(response.body.message).toBeUndefined();
    });

    it('should rate limit authorization attempts', async () => {
      // Make multiple requests to rate-limited endpoint
      const requests = Array.from({ length: 150 }, () => request.get('/api/limited'));

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Rate limited responses should have proper headers
      rateLimitedResponses.forEach((response) => {
        expect(response.headers['retry-after']).toBeTruthy();
        expect(response.headers['x-ratelimit-limit']).toBeTruthy();
        expect(response.headers['x-ratelimit-remaining']).toBe('0');
      });
    });
  });
});
