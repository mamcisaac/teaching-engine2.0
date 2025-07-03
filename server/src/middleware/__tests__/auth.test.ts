import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { authMiddleware } from '../auth';
import { mockRequest, mockResponse, mockNext, generateTestToken } from '../../../tests/utils/sharedTestUtils';
import jwt from 'jsonwebtoken';

describe('Authentication Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    test('should accept valid JWT token', async () => {
      const user = { id: '123', role: 'teacher' };
      const token = generateTestToken(user);
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('123');
      expect(req.user.role).toBe('teacher');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject missing authorization header', async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No authorization token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject malformed authorization header', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid token format', async () => {
      req.headers.authorization = 'Bearer invalid.token.format';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject expired tokens', async () => {
      const token = generateTestToken(
        { userId: '123' },
        { expiresIn: '-1h' } // Already expired
      );
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject tokens with invalid signature', async () => {
      const token = jwt.sign(
        { userId: '123' },
        'wrong-secret',
        { expiresIn: '1h' }
      );
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token signature'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('User Context', () => {
    test('should attach complete user object to request', async () => {
      const userData = {
        userId: '123',
        email: 'teacher@school.com',
        role: 'teacher',
        permissions: ['create_lesson', 'view_students']
      };
      const token = generateTestToken(userData);
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.user).toEqual(expect.objectContaining(userData));
      expect(next).toHaveBeenCalled();
    });

    test('should handle deleted users gracefully', async () => {
      const token = generateTestToken({ userId: 'deleted-user-id' });
      req.headers.authorization = `Bearer ${token}`;

      // Mock user lookup to return null (deleted user)
      jest.spyOn(authMiddleware, 'validateUser').mockResolvedValue(null);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User no longer exists'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate user is active', async () => {
      const token = generateTestToken({ 
        userId: '123',
        status: 'suspended'
      });
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Account suspended'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Refresh', () => {
    test('should handle refresh token in cookie', async () => {
      const refreshToken = generateTestToken(
        { userId: '123', type: 'refresh' },
        { expiresIn: '7d' }
      );
      req.cookies = { refreshToken };
      req.headers.authorization = 'Bearer expired-access-token';

      await authMiddleware(req, res, next);

      // Should generate new access token
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict'
        })
      );
      expect(next).toHaveBeenCalled();
    });

    test('should reject expired refresh tokens', async () => {
      const refreshToken = generateTestToken(
        { userId: '123', type: 'refresh' },
        { expiresIn: '-1d' } // Expired
      );
      req.cookies = { refreshToken };

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Refresh token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should track refresh token usage', async () => {
      const refreshToken = generateTestToken({
        userId: '123',
        type: 'refresh',
        tokenId: 'refresh-123'
      });
      req.cookies = { refreshToken };

      // Mock token tracking
      const trackUsage = jest.spyOn(authMiddleware, 'trackTokenUsage');

      await authMiddleware(req, res, next);

      expect(trackUsage).toHaveBeenCalledWith('refresh-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Security Headers', () => {
    test('should validate CORS origin', async () => {
      const token = generateTestToken({ userId: '123' });
      req.headers.authorization = `Bearer ${token}`;
      req.headers.origin = 'https://malicious-site.com';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'CORS policy violation'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should enforce HTTPS in production', async () => {
      process.env.NODE_ENV = 'production';
      const token = generateTestToken({ userId: '123' });
      req.headers.authorization = `Bearer ${token}`;
      req.headers['x-forwarded-proto'] = 'http';

      await authMiddleware(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        301,
        expect.stringContaining('https://')
      );
      expect(next).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'test';
    });

    test('should prevent token replay attacks', async () => {
      const token = generateTestToken({
        userId: '123',
        nonce: 'abc123',
        iat: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      });
      req.headers.authorization = `Bearer ${token}`;

      // Mock nonce tracking
      jest.spyOn(authMiddleware, 'isNonceUsed').mockReturnValue(true);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token already used'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Role-Based Access', () => {
    test('should allow access based on role', async () => {
      const token = generateTestToken({
        userId: '123',
        role: 'admin'
      });
      req.headers.authorization = `Bearer ${token}`;
      req.route = { requiredRole: 'admin' };

      await authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for insufficient role', async () => {
      const token = generateTestToken({
        userId: '123',
        role: 'teacher'
      });
      req.headers.authorization = `Bearer ${token}`;
      req.route = { requiredRole: 'admin' };

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should check specific permissions', async () => {
      const token = generateTestToken({
        userId: '123',
        role: 'teacher',
        permissions: ['create_lesson', 'view_students']
      });
      req.headers.authorization = `Bearer ${token}`;
      req.route = { requiredPermission: 'delete_user' };

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required permission: delete_user'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    test('should validate session is active', async () => {
      const token = generateTestToken({
        userId: '123',
        sessionId: 'session-123'
      });
      req.headers.authorization = `Bearer ${token}`;

      // Mock session check
      jest.spyOn(authMiddleware, 'isSessionActive')
        .mockResolvedValue(false);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Session expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should extend session on activity', async () => {
      const token = generateTestToken({
        userId: '123',
        sessionId: 'session-123'
      });
      req.headers.authorization = `Bearer ${token}`;

      const extendSession = jest.spyOn(authMiddleware, 'extendSession');

      await authMiddleware(req, res, next);

      expect(extendSession).toHaveBeenCalledWith('session-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('API Key Authentication', () => {
    test('should accept valid API key', async () => {
      req.headers['x-api-key'] = 'valid-api-key-123';

      jest.spyOn(authMiddleware, 'validateAPIKey')
        .mockResolvedValue({
          userId: 'api-user-123',
          permissions: ['api_access']
        });

      await authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('api-user-123');
      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid API key', async () => {
      req.headers['x-api-key'] = 'invalid-key';

      jest.spyOn(authMiddleware, 'validateAPIKey')
        .mockResolvedValue(null);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid API key'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      req.headers.authorization = 'Bearer valid-token';
      
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should log authentication failures', async () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation();
      req.headers.authorization = 'Bearer invalid-token';

      await authMiddleware(req, res, next);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed'),
        expect.any(Object)
      );
      
      logSpy.mockRestore();
    });
  });
});