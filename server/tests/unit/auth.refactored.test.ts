/**
 * Refactored Auth Middleware Unit Tests
 * 
 * This demonstrates the new standardized test patterns:
 * - Using the test framework utilities
 * - Consistent mocking patterns
 * - Better test isolation
 * - Clear test structure
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  isolatedTest,
  AuthHelper,
  MockFactory,
  AssertionHelpers
} from '../utils/testFramework';
import { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../src/middleware/auth';

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

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with empty authorization header', () => {
      req.headers!.authorization = '';

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with malformed authorization header', () => {
      req.headers!.authorization = 'InvalidFormat token';

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
    });
  });

  describe('Token Validation', () => {
    isolatedTest('should accept valid JWT token', async (context) => {
      const userId = 'test-user-123';
      const token = authHelper.createToken(userId);
      
      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user).toEqual({ userId });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    isolatedTest('should reject expired tokens', async (context) => {
      const userId = 'test-user-456';
      const expiredToken = authHelper.createExpiredToken(userId);
      
      req.headers!.authorization = `Bearer ${expiredToken}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid tokens', () => {
      req.headers!.authorization = 'Bearer invalid-jwt-token';

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
    });

    it('should reject tokens with invalid signature', () => {
      // Create token with different secret
      const jwt = require('jsonwebtoken');
      const invalidToken = jwt.sign({ userId: '789' }, 'wrong-secret');
      
      req.headers!.authorization = `Bearer ${invalidToken}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
    });
  });

  describe('Token Extraction', () => {
    it('should extract user data from valid token', () => {
      const userId = 'user-789';
      const additionalClaims = { role: 'admin', email: 'admin@example.com' };
      const token = authHelper.createToken(userId, {
        expiresIn: '2h',
        issuer: 'test-suite'
      });
      
      // Mock JWT to include additional claims
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementationOnce((token, secret, callback) => {
        callback(null, { userId, ...additionalClaims });
      });
      
      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user).toEqual({ userId, ...additionalClaims });
      expect(next).toHaveBeenCalled();
    });

    it('should handle case-insensitive bearer prefix', () => {
      const userId = 'case-test-user';
      const token = authHelper.createToken(userId);
      
      // Test different case variations
      const bearerVariations = ['Bearer', 'BEARER', 'bearer', 'BeArEr'];
      
      bearerVariations.forEach(bearerPrefix => {
        req.headers!.authorization = `${bearerPrefix} ${token}`;
        
        authMiddleware(req as AuthRequest, res as Response, next);
        
        expect(req.user?.userId).toBe(userId);
        expect(next).toHaveBeenCalled();
        
        // Reset for next iteration
        req.user = undefined;
        next.mockClear();
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use JWT_SECRET from environment', () => {
      const originalSecret = process.env.JWT_SECRET;
      const customSecret = 'custom-test-secret-12345';
      process.env.JWT_SECRET = customSecret;

      const userId = 'env-test-user';
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId }, customSecret);
      
      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe(userId);
      expect(next).toHaveBeenCalled();

      // Restore original
      process.env.JWT_SECRET = originalSecret;
    });

    it('should fall back to default secret when JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const userId = 'fallback-test-user';
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId }, 'secret'); // Default fallback
      
      req.headers!.authorization = `Bearer ${token}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe(userId);
      expect(next).toHaveBeenCalled();

      // Restore original
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle JWT decode errors gracefully', () => {
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('JWT decode failed');
      });
      
      req.headers!.authorization = 'Bearer some-token';

      authMiddleware(req as AuthRequest, res as Response, next);

      AssertionHelpers.assertErrorResponse(
        { status: res.status, body: res.json },
        401,
        'Unauthorized'
      );
    });

    it('should handle missing user ID in token', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithoutUserId = jwt.sign({ role: 'admin' }, 'secret');
      
      req.headers!.authorization = `Bearer ${tokenWithoutUserId}`;

      authMiddleware(req as AuthRequest, res as Response, next);

      // Should still pass but with incomplete user object
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});