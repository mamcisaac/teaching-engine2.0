/**
 * Refactored Auth Middleware Unit Tests
 *
 * This demonstrates the new standardized test patterns:
 * - Using the test framework utilities
 * - Consistent mocking patterns
 * - Better test isolation
 * - Clear test structure
 */

import { jest } from '@jest/globals';
import {
  describe,
  it,
  expect,
  beforeEach,
  isolatedTest,
  AuthHelper,
  MockFactory,
  AssertionHelpers,
} from '../utils/testFramework';
import { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../src/middleware/auth';
import jwt from 'jsonwebtoken';

describe('Auth Middleware - Refactored', () => {
  const authHelper = new AuthHelper();
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<() => void>;

  beforeEach(() => {
    // Clean setup for each test
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Authorization Header Validation', () => {
    it('should reject requests without authorization header', () => {
      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with empty authorization header', () => {
      req.headers!.authorization = '';

      authMiddleware(req as AuthRequest, res as Response, next);

      // The middleware doesn't actually check for empty string, it just removes 'Bearer '
      // So an empty string will fail during JWT verification
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with malformed authorization header', () => {
      req.headers!.authorization = 'InvalidFormat token';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('Token Validation', () => {
    isolatedTest('should accept valid JWT token', async (context) => {
      const userId = 'test-user-123';
      const token = authHelper.createToken(userId);

      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toEqual(userId);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    isolatedTest('should reject expired tokens', async (context) => {
      const userId = 'test-user-456';
      const expiredToken = authHelper.createExpiredToken(userId);

      req.headers!.authorization = `Bearer ${expiredToken}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid tokens', () => {
      req.headers!.authorization = 'Bearer invalid-jwt-token';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should reject tokens with invalid signature', () => {
      // Create token with different secret
      const invalidToken = jwt.sign({ userId: '789' }, 'wrong-secret');

      req.headers!.authorization = `Bearer ${invalidToken}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('Token Extraction', () => {
    it('should extract user data from valid token', () => {
      const userId = 'user-789';
      const additionalClaims = { role: 'admin', email: 'admin@example.com' };
      const token = authHelper.createToken(userId, {
        expiresIn: '2h',
        issuer: 'test-suite',
      });

      // Mock JWT to include additional claims
      jest.spyOn(jwt, 'verify').mockImplementationOnce((token: any, secret: any) => {
        // Return synchronously since that's what the middleware expects
        return { userId, ...additionalClaims };
      });

      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      // The middleware transforms the payload
      expect(req.user).toEqual({
        id: parseInt(userId) || NaN,
        userId,
        email: additionalClaims.email,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should only accept "Bearer " prefix (case-sensitive)', () => {
      const userId = 'case-test-user';
      const token = authHelper.createToken(userId);

      // The middleware only accepts "Bearer " exactly
      req.headers!.authorization = `Bearer ${token}`;
      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe(userId);
      expect(next).toHaveBeenCalled();

      // Test that other variations fail
      const invalidVariations = ['BEARER', 'bearer', 'BeArEr'];

      invalidVariations.forEach((bearerPrefix) => {
        req.user = undefined;
        next.mockClear();
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn().mockReturnThis();

        req.headers!.authorization = `${bearerPrefix} ${token}`;
        authMiddleware(req as AuthRequest, res as Response, next);

        // These should fail because the token will include the prefix
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use JWT_SECRET from environment', () => {
      const originalSecret = process.env.JWT_SECRET;
      const customSecret = 'custom-test-secret-12345';
      process.env.JWT_SECRET = customSecret;

      const userId = 'env-test-user';
      const token = jwt.sign({ userId }, customSecret);

      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe(userId);
      expect(next).toHaveBeenCalled();

      // Restore original
      process.env.JWT_SECRET = originalSecret;
    });

    it('should return 500 error when JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const userId = 'fallback-test-user';
      const token = jwt.sign({ userId }, 'some-secret');

      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      // The middleware returns 500 when JWT_SECRET is missing
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
      expect(next).not.toHaveBeenCalled();

      // Restore original
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle JWT decode errors gracefully', () => {
      // Make sure JWT_SECRET is set so we don't get a 500
      process.env.JWT_SECRET = 'test-secret';

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('JWT decode failed');
      });

      req.headers!.authorization = 'Bearer some-token';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle missing user ID in token', () => {
      // Make sure JWT_SECRET is set
      process.env.JWT_SECRET = 'test-secret';

      // Mock jwt.verify to return a payload without userId
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        return { role: 'admin' }; // No userId field
      });

      req.headers!.authorization = `Bearer some-token`;

      authMiddleware(req as AuthRequest, res as Response, next);

      // The middleware creates a user object even without userId
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBeUndefined();
      expect(req.user?.id).toBeNaN(); // parseInt(undefined) = NaN
      expect(req.user?.email).toBe('unknown@example.com');
      expect(next).toHaveBeenCalled();
    });
  });
});
