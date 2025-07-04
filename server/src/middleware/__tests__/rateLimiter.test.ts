import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { rateLimiter, createRateLimiter } from '../rateLimit';
import { mockRequest, mockResponse, mockNext } from '../../../tests/utils/sharedTestUtils';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis');

describe('Rate Limiter Middleware', () => {
  let req: unknown;
  let res: unknown;
  let next: unknown;
  let mockRedis: unknown;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    
    // Mock Redis client
    mockRedis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(60),
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK')
    };
    
    (Redis as unknown).mockImplementation(() => mockRedis);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    test('should allow requests under limit', async () => {
      req.ip = '192.168.1.1';
      mockRedis.incr.mockResolvedValue(5); // 5 requests

      await rateLimiter(req, res, next);

      expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '95');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should block requests over limit', async () => {
      req.ip = '192.168.1.1';
      mockRedis.incr.mockResolvedValue(101); // Over limit

      await rateLimiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many requests',
        retryAfter: expect.any(Number)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reset limits after window expires', async () => {
      req.ip = '192.168.1.1';
      
      // First request sets expiry
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.ttl.mockResolvedValue(-1); // No TTL set

      await rateLimiter(req, res, next);

      expect(mockRedis.expire).toHaveBeenCalledWith('rate_limit:192.168.1.1', 3600); // 1 hour
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Per-User Rate Limiting', () => {
    test('should track limits per authenticated user', async () => {
      req.user = { userId: '123', role: 'teacher' };
      req.ip = '192.168.1.1';
      
      await rateLimiter(req, res, next);

      expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:user:123');
      expect(mockRedis.incr).not.toHaveBeenCalledWith('rate_limit:192.168.1.1');
      expect(next).toHaveBeenCalled();
    });

    test('should track limits by IP for anonymous users', async () => {
      req.ip = '192.168.1.1';
      // No user object
      
      await rateLimiter(req, res, next);

      expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
      expect(next).toHaveBeenCalled();
    });

    test('should apply different limits for different user roles', async () => {
      const premiumLimiter = createRateLimiter({ 
        windowMs: 60 * 60 * 1000,
        max: 1000 // Higher limit for premium
      });

      req.user = { userId: '123', role: 'premium' };
      mockRedis.incr.mockResolvedValue(500);

      await premiumLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '1000');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '500');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Distributed Attack Prevention', () => {
    test('should track distributed attacks across multiple IPs', async () => {
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      
      for (const ip of ips) {
        req.ip = ip;
        req.headers['user-agent'] = 'suspicious-bot';
        
        await rateLimiter(req, res, next);
        
        expect(mockRedis.incr).toHaveBeenCalledWith(`rate_limit:${ip}`);
      }

      // Check if pattern detection was triggered
      expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:pattern:suspicious-bot');
    });

    test('should block requests from known attack patterns', async () => {
      req.headers['user-agent'] = 'known-attack-bot';
      mockRedis.get.mockResolvedValue('blocked');

      await rateLimiter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Whitelist and Bypass', () => {
    test('should allow whitelisted IPs without rate limiting', async () => {
      req.ip = '10.0.0.1'; // Internal IP
      process.env.RATE_LIMIT_WHITELIST = '10.0.0.0/24';

      await rateLimiter(req, res, next);

      expect(mockRedis.incr).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('should bypass rate limiting for health check endpoints', async () => {
      req.path = '/health';
      
      await rateLimiter(req, res, next);

      expect(mockRedis.incr).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('should have higher limits for API key users', async () => {
      req.headers['x-api-key'] = 'valid-api-key';
      mockRedis.incr.mockResolvedValue(200);

      const apiLimiter = createRateLimiter({
        windowMs: 60 * 60 * 1000,
        max: 500,
        keyGenerator: (req) => req.headers['x-api-key'] || req.ip
      });

      await apiLimiter(req, res, next);

      expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:valid-api-key');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Redis Failure Handling', () => {
    test('should fallback gracefully when Redis is unavailable', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis connection failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await rateLimiter(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Rate limiter Redis error:',
        expect.any(Error)
      );
      expect(next).toHaveBeenCalled(); // Allow request through
      expect(res.status).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should use in-memory fallback when Redis fails', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis down'));
      
      // Multiple requests to test in-memory tracking
      for (let i = 0; i < 5; i++) {
        await rateLimiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      
      // Test that in-memory limiting still works
      req.ip = 'spam-ip';
      for (let i = 0; i < 150; i++) {
        await rateLimiter(req, res, next);
      }

      // Should eventually block
      expect(res.status).toHaveBeenCalledWith(429);
    });

    test('should not block all traffic on Redis failure', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis down'));
      
      // Different IPs should still work
      const ips = Array(10).fill(null).map((_, i) => `192.168.1.${i}`);
      
      for (const ip of ips) {
        req.ip = ip;
        await rateLimiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
    });
  });

  describe('Advanced Features', () => {
    test('should support sliding window rate limiting', async () => {
      const slidingLimiter = createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 10,
        slidingWindow: true
      });

      // Mock sliding window implementation
      mockRedis.zremrangebyscore = jest.fn().mockResolvedValue(0);
      mockRedis.zadd = jest.fn().mockResolvedValue(1);
      mockRedis.zcard = jest.fn().mockResolvedValue(5);

      await slidingLimiter(req, res, next);

      const now = Date.now();
      const windowStart = now - 60000;

      expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith(
        expect.any(String),
        '-inf',
        windowStart
      );
      expect(next).toHaveBeenCalled();
    });

    test('should support custom key generation', async () => {
      const customLimiter = createRateLimiter({
        keyGenerator: (req) => {
          return `${req.ip}:${req.headers['user-agent']}:${req.method}`;
        }
      });

      req.ip = '192.168.1.1';
      req.headers['user-agent'] = 'Mozilla/5.0';
      req.method = 'POST';

      await customLimiter(req, res, next);

      expect(mockRedis.incr).toHaveBeenCalledWith(
        'rate_limit:192.168.1.1:Mozilla/5.0:POST'
      );
    });

    test('should support skip conditions', async () => {
      const conditionalLimiter = createRateLimiter({
        skip: (req) => req.user?.role === 'admin'
      });

      req.user = { userId: '123', role: 'admin' };

      await conditionalLimiter(req, res, next);

      expect(mockRedis.incr).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('should support custom error messages', async () => {
      const customLimiter = createRateLimiter({
        message: 'You have exceeded the rate limit. Please try again later.',
        standardHeaders: true,
        legacyHeaders: false
      });

      mockRedis.incr.mockResolvedValue(101);

      await customLimiter(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: expect.any(Number)
      });
    });
  });

  describe('Headers and Metadata', () => {
    test('should set standard rate limit headers', async () => {
      mockRedis.incr.mockResolvedValue(25);
      mockRedis.ttl.mockResolvedValue(1800); // 30 minutes remaining

      await rateLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '75');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Policy', '100;w=3600');
    });

    test('should include retry-after header when rate limited', async () => {
      mockRedis.incr.mockResolvedValue(101);
      mockRedis.ttl.mockResolvedValue(1800); // 30 minutes

      await rateLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '1800');
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  describe('Endpoint-Specific Limits', () => {
    test('should apply stricter limits to sensitive endpoints', async () => {
      const loginLimiter = createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Only 5 login attempts
        skipSuccessfulRequests: true
      });

      req.path = '/api/auth/login';
      req.body = { email: 'user@test.com', password: 'wrong' };
      mockRedis.incr.mockResolvedValue(3);

      await loginLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');
      expect(next).toHaveBeenCalled();
    });

    test('should have separate limits for different HTTP methods', async () => {
      const methodLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: (req) => {
          switch (req.method) {
            case 'GET': return 100;
            case 'POST': return 20;
            case 'DELETE': return 5;
            default: return 50;
          }
        }
      });

      req.method = 'DELETE';
      mockRedis.incr.mockResolvedValue(4);

      await methodLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
    });
  });
});