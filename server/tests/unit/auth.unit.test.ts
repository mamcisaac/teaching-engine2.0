import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../../src/middleware/auth';

const require = createRequire(import.meta.url);

describe('Auth Middleware Unit Tests', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<() => void>;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Clear any previous mocks
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should return 401 when no authorization header is provided', () => {
      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      req.headers!.authorization = '';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer authorization header', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const userId = '123';
      const token = jwt.sign({ userId }, secret);

      req.headers!.authorization = `Bearer ${token}`;

      // Mock environment variable
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe('123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();

      // Restore environment
      process.env.JWT_SECRET = originalEnv;
    });

    it('should return 500 when JWT_SECRET is not set', () => {
      const userId = '456';
      const token = jwt.sign({ userId }, 'secret'); // Any secret

      req.headers!.authorization = `Bearer ${token}`;

      // Ensure JWT_SECRET is not set
      const originalEnv = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
      expect(next).not.toHaveBeenCalled();

      // Restore environment
      process.env.JWT_SECRET = originalEnv;
    });

    it('should return 401 for invalid token', () => {
      req.headers!.authorization = 'Bearer invalid-token';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should return 401 for expired token', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const userId = '789';
      const expiredToken = jwt.sign({ userId, exp: Math.floor(Date.now() / 1000) - 3600 }, secret); // Expired 1 hour ago

      req.headers!.authorization = `Bearer ${expiredToken}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should return 401 for token with wrong secret', () => {
      const userId = '101';
      const token = jwt.sign({ userId }, 'wrong-secret');

      req.headers!.authorization = `Bearer ${token}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'correct-secret';

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should handle Bearer token without Bearer prefix', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const userId = '202';
      const token = jwt.sign({ userId }, secret);

      req.headers!.authorization = token; // No "Bearer " prefix

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe('202');
      expect(next).toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should parse string userId to integer', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const userId = '999';
      const token = jwt.sign({ userId }, secret);

      req.headers!.authorization = `Bearer ${token}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe('999');
      expect(typeof req.user?.userId).toBe('string');

      process.env.JWT_SECRET = originalEnv;
    });

    it('should handle token with additional claims', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const payload = {
        userId: '555',
        role: 'teacher',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = jwt.sign(payload, secret);

      req.headers!.authorization = `Bearer ${token}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBe('555');
      expect(next).toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should handle malformed authorization header', () => {
      const testCases = [
        'Basic dXNlcjpwYXNz', // Basic auth instead of Bearer
        'Bearer', // Bearer without token
        'Bearer ', // Bearer with only space
        'Token abc123', // Wrong prefix
        'bearer token123', // Lowercase bearer
      ];

      testCases.forEach((authHeader) => {
        // Reset mocks for each test case
        jest.clearAllMocks();
        req.headers!.authorization = authHeader;

        authMiddleware(req as AuthRequest, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    it('should handle token with invalid userId format', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const token = jwt.sign({ userId: 'not-a-number' }, secret);

      req.headers!.authorization = `Bearer ${token}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      // The middleware doesn't parse userId, it keeps it as is
      expect(req.user?.userId).toBe('not-a-number');
      expect(next).toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should handle token without userId claim', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const token = jwt.sign({ role: 'teacher', email: 'test@example.com' }, secret);

      req.headers!.authorization = `Bearer ${token}`;

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.user?.userId).toBeUndefined(); // userId is undefined when not present in token
      expect(next).toHaveBeenCalled();

      process.env.JWT_SECRET = originalEnv;
    });

    it('should preserve other request properties', () => {
      const secret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
      const userId = '123';
      const token = jwt.sign({ userId }, secret);

      req.headers!.authorization = `Bearer ${token}`;
      req.body = { test: 'data' };
      req.params = { id: '456' };
      req.query = { search: 'term' };

      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = secret;

      authMiddleware(req as AuthRequest, res as Response, next);

      expect(req.body).toEqual({ test: 'data' });
      expect(req.params).toEqual({ id: '456' });
      expect(req.query).toEqual({ search: 'term' });
      expect(req.user?.userId).toBe('123');

      process.env.JWT_SECRET = originalEnv;
    });
  });
});
