import { describe, it, expect, jest } from '@jest/globals';
import {
  secureCookieOptions,
  refreshTokenCookieOptions,
  validateFileUpload,
  sanitizeInput,
} from '../../src/middleware/security';
import { Request, Response, NextFunction } from 'express';

describe('Security Middleware Verification', () => {
  describe('Cookie Security Options', () => {
    it('should have secure cookie configuration', () => {
      expect(secureCookieOptions).toEqual({
        httpOnly: true,
        secure: false, // false in test environment
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    it('should have secure refresh token cookie configuration', () => {
      expect(refreshTokenCookieOptions).toEqual({
        httpOnly: true,
        secure: false, // false in test environment
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    it('should set secure flag in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Re-import to get production settings
      jest.resetModules();
      const securityModule = await import('../../src/middleware/security');
      const prodOptions = securityModule.secureCookieOptions;

      expect(prodOptions.secure).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('File Upload Security', () => {
    it('should validate allowed file types', () => {
      const middleware = validateFileUpload(['application/pdf']);
      const mockNext = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Test valid file
      const validReq = {
        file: {
          mimetype: 'application/pdf',
          size: 1024,
          originalname: 'test.pdf',
        },
      } as any;

      middleware(validReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      // Reset mocks
      mockNext.mockClear();
      mockRes.status.mockClear();

      // Test invalid file type
      const invalidReq = {
        file: {
          mimetype: 'text/javascript',
          size: 1024,
          originalname: 'script.js',
        },
      } as any;

      middleware(invalidReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid File Type',
        message: expect.stringContaining('File type text/javascript is not allowed'),
      });
    });

    it('should reject oversized files', () => {
      const middleware = validateFileUpload();
      const mockNext = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const oversizedReq = {
        file: {
          mimetype: 'application/pdf',
          size: 20 * 1024 * 1024, // 20MB
          originalname: 'large.pdf',
        },
      } as any;

      middleware(oversizedReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'File Too Large',
        message: expect.stringContaining('File size exceeds maximum allowed size'),
      });
    });

    it('should reject files with path traversal attempts', () => {
      const middleware = validateFileUpload();
      const mockNext = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const maliciousReq = {
        file: {
          mimetype: 'application/pdf',
          size: 1024,
          originalname: '../../etc/passwd',
        },
      } as any;

      middleware(maliciousReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid Filename',
        message: 'Filename contains invalid characters',
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should remove XSS attempts', () => {
      const req = {
        body: {
          comment: '<script>alert("xss")</script>Hello',
          name: 'John<script>evil()</script>Doe',
          safe: 'Normal text',
        },
        query: {},
        params: {},
      } as any;

      const mockNext = jest.fn();
      sanitizeInput(req, {} as Response, mockNext);

      expect(req.body.comment).toBe('Hello');
      expect(req.body.name).toBe('JohnDoe');
      expect(req.body.safe).toBe('Normal text');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove event handlers', () => {
      const req = {
        body: {
          link: '<a href="#" onclick="stealCookies()">Click</a>',
          img: '<img src="x" onerror="alert(1)">',
          div: '<div onmouseover="track()">Text</div>',
        },
        query: {},
        params: {},
      } as any;

      const mockNext = jest.fn();
      sanitizeInput(req, {} as Response, mockNext);

      expect(req.body.link).not.toContain('onclick');
      expect(req.body.img).not.toContain('onerror');
      expect(req.body.div).not.toContain('onmouseover');
    });

    it('should trim whitespace and remove null bytes', () => {
      const req = {
        body: {
          username: '  admin  ',
          password: 'pass\x00word',
          email: '\ttab@example.com\n',
        },
        query: {},
        params: {},
      } as any;

      const mockNext = jest.fn();
      sanitizeInput(req, {} as Response, mockNext);

      expect(req.body.username).toBe('admin');
      expect(req.body.password).toBe('password');
      expect(req.body.email).toBe('tab@example.com');
    });

    it('should handle nested objects', () => {
      const req = {
        body: {
          user: {
            profile: {
              bio: '<script>bad</script>Good bio',
              website: 'http://example.com\x00',
            },
          },
        },
        query: {},
        params: {},
      } as any;

      const mockNext = jest.fn();
      sanitizeInput(req, {} as Response, mockNext);

      expect(req.body.user.profile.bio).toBe('Good bio');
      expect(req.body.user.profile.website).toBe('http://example.com');
    });
  });

  describe('Security Headers', () => {
    it('should export comprehensive security middleware', async () => {
      // Import all exports to verify they exist
      const securityModule = await import('../../src/middleware/security');

      expect(securityModule.applySecurityMiddleware).toBeDefined();
      expect(securityModule.corsOptions).toBeDefined();
      expect(securityModule.helmetConfig).toBeDefined();
      expect(securityModule.rateLimitMiddleware).toBeDefined();
      expect(securityModule.authRateLimitMiddleware).toBeDefined();
      expect(securityModule.validateFileUpload).toBeDefined();
      expect(securityModule.securityHeaders).toBeDefined();
      expect(securityModule.sanitizeInput).toBeDefined();
      expect(securityModule.csrfProtection).toBeDefined();
      expect(securityModule.generateCSRFToken).toBeDefined();
    });
  });
});
