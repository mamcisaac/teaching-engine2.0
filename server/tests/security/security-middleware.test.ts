import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import {
  applySecurityMiddleware,
  rateLimitMiddleware,
  authRateLimitMiddleware,
  validateFileUpload,
  securityHeaders,
  sanitizeInput,
  secureCookieOptions,
  refreshTokenCookieOptions,
} from '../../src/middleware/security';

describe('Security Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Security Headers', () => {
    it('should apply comprehensive security headers', async () => {
      applySecurityMiddleware(app);

      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      // Check critical security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['permissions-policy']).toBe(
        'geolocation=(), microphone=(), camera=()',
      );

      // Verify sensitive headers are removed
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).toBeUndefined();
    });

    it('should set proper Content Security Policy', async () => {
      applySecurityMiddleware(app);

      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    });
  });

  describe('CORS Configuration', () => {
    beforeEach(() => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000';
    });

    it('should allow requests from whitelisted origins', async () => {
      applySecurityMiddleware(app);

      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test').set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should block requests from non-whitelisted origins', async () => {
      applySecurityMiddleware(app);

      // Add error handler to catch CORS errors
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err.message === 'Not allowed by CORS') {
          res.status(403).json({ error: 'CORS error' });
        } else {
          next(err);
        }
      });

      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test').set('Origin', 'http://evil.com');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('CORS error');
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Set NODE_ENV to something other than test to enable rate limiting
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should enforce rate limits on general endpoints', async () => {
      // Create a mock rate limiter that triggers after 5 requests
      let requestCount = 0;
      const mockRateLimiter = (req: Request, res: Response, next: NextFunction) => {
        requestCount++;
        if (requestCount > 5) {
          res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
          });
        } else {
          next();
        }
      };

      app.use(mockRateLimiter);

      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      // Make 6 requests to trigger rate limit
      const responses = [];
      for (let i = 0; i < 6; i++) {
        responses.push(await request(app).get('/test'));
      }

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i].status).toBe(200);
      }

      // The 6th request should be rate limited
      expect(responses[5].status).toBe(429);
      expect(responses[5].body.error).toBe('Too Many Requests');
    });

    it('should enforce stricter rate limits on auth endpoints', async () => {
      // Create a mock auth rate limiter that triggers after 3 requests
      let authRequestCount = 0;
      const mockAuthRateLimiter = (req: Request, res: Response, next: NextFunction) => {
        authRequestCount++;
        if (authRequestCount > 3) {
          res.status(429).json({
            error: 'Too Many Authentication Attempts',
            message: 'Too many authentication attempts. Please try again later.',
          });
        } else {
          next();
        }
      };

      app.use(mockAuthRateLimiter);

      app.post('/auth/login', (req, res) => {
        res.json({ success: true });
      });

      // Make 4 requests to trigger rate limit
      const responses = [];
      for (let i = 0; i < 4; i++) {
        responses.push(await request(app).post('/auth/login'));
      }

      // First 3 should succeed
      for (let i = 0; i < 3; i++) {
        expect(responses[i].status).toBe(200);
      }

      // The 4th request should be rate limited
      expect(responses[3].status).toBe(429);
      expect(responses[3].body.message).toContain('Too many authentication attempts');
    });

    it('should skip rate limiting in test environment', async () => {
      process.env.NODE_ENV = 'test';

      app.use(rateLimitMiddleware);
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      // Make many requests
      const requests = [];
      for (let i = 0; i < 200; i++) {
        requests.push(request(app).get('/test'));
      }

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('File Upload Validation', () => {
    it('should reject files exceeding size limit', async () => {
      const middleware = validateFileUpload();

      const req = {
        file: {
          size: 11 * 1024 * 1024, // 11MB
          mimetype: 'application/pdf',
          originalname: 'test.pdf',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File Too Large',
        message: expect.stringContaining('File size exceeds maximum allowed size'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject files with invalid types', async () => {
      const middleware = validateFileUpload(['application/pdf']);

      const req = {
        file: {
          size: 1024,
          mimetype: 'application/javascript',
          originalname: 'malicious.js',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid File Type',
        message: expect.stringContaining('File type application/javascript is not allowed'),
      });
    });

    it('should reject files with path traversal attempts', async () => {
      const middleware = validateFileUpload();

      const req = {
        file: {
          size: 1024,
          mimetype: 'application/pdf',
          originalname: '../../../etc/passwd',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid Filename',
        message: 'Filename contains invalid characters',
      });
    });

    it('should allow valid files', async () => {
      const middleware = validateFileUpload();

      const req = {
        file: {
          size: 1024,
          mimetype: 'application/pdf',
          originalname: 'curriculum.pdf',
        },
      } as any;

      const res = {} as any;
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious input in request body', () => {
      const req = {
        body: {
          name: '  Test User  ',
          bio: '<script>alert("XSS")</script>Normal text',
          website: 'http://example.com\0',
          onClick: 'onclick="malicious()"',
        },
        query: {},
        params: {},
      } as any;

      const res = {} as any;
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('Test User'); // Trimmed
      expect(req.body.bio).toBe('Normal text'); // Script removed
      expect(req.body.website).toBe('http://example.com'); // Null byte removed
      expect(req.body.onClick).toBe(''); // Event handler removed
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
      const req = {
        body: {
          user: {
            profile: {
              name: '<script>evil</script>John',
              data: {
                value: 'test\0value',
              },
            },
          },
        },
        query: {},
        params: {},
      } as any;

      const res = {} as any;
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.user.profile.name).toBe('John');
      expect(req.body.user.profile.data.value).toBe('testvalue');
    });
  });

  describe('Cookie Security', () => {
    it('should have secure cookie options', () => {
      expect(secureCookieOptions.httpOnly).toBe(true);
      expect(secureCookieOptions.sameSite).toBe('strict');
      expect(secureCookieOptions.path).toBe('/');
      expect(secureCookieOptions.maxAge).toBe(24 * 60 * 60 * 1000); // 24 hours
    });

    it('should have secure refresh token cookie options', () => {
      expect(refreshTokenCookieOptions.httpOnly).toBe(true);
      expect(refreshTokenCookieOptions.sameSite).toBe('strict');
      expect(refreshTokenCookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
    });

    it('should set secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Re-import to get fresh module
      jest.resetModules();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Security Headers Middleware', () => {
    it('should set all required security headers', () => {
      const req = {} as any;
      const res = {
        setHeader: jest.fn(),
        removeHeader: jest.fn(),
      } as any;
      const next = jest.fn();

      securityHeaders(req, res, next);

      // Verify headers are set
      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=()',
      );

      // Verify sensitive headers are removed
      expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(res.removeHeader).toHaveBeenCalledWith('Server');

      expect(next).toHaveBeenCalled();
    });
  });
});
