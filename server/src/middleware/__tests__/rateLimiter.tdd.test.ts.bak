/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * TDD-Compliant Rate Limiter Tests
 * Uses real Redis or in-memory store instead of mocks
 */

import { Express } from 'express';
import Redis from 'ioredis';
import {
  createTestApp,
  createTestUser,
  setupRealTestLifecycle,
  TestUser,
} from '../../../tests/utils/tdd-test-utilities';
import request from 'supertest';
import { createRateLimiter, resetRateLimiterState } from '../rateLimit';

describe('Rate Limiter Middleware - Real Implementation Tests', () => {
  const testLifecycle = setupRealTestLifecycle();
  let app: Express;
  let testUser: TestUser;
  let redis: Redis | null = null;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Try to connect to real Redis for tests
    if (process.env.REDIS_URL ?? process.env.TEST_REDIS) {
      try {
        redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379/1');
        await redis.ping();
        // Using real Redis for rate limiter tests
      } catch (_error) {
        // Redis not available, using in-memory store
        redis = null;
      }
    }
  });

  beforeEach(async () => {
    // Reset rate limiter state
    resetRateLimiterState();
    
    // Clear Redis if available
    if (redis) {
      await redis.flushdb();
    }
    
    // Create test user
    testUser = await createTestUser({
      email: 'ratelimit-test@example.com',
      password: 'TestPassword123!',
      name: 'Rate Limit Test User',
    });
  });

  afterAll(async () => {
    if (redis) {
      await redis.quit();
    }
  });

  describe('Basic Rate Limiting - Real Implementation', () => {
    it('should allow requests under the limit', async () => {
      // Create test endpoint with rate limiting
      const limiter = createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // 5 requests per minute
        store: redis || undefined,
      });

      app.get('/test/rate-limit', limiter, (req: Request, res: Response) => {
        res.json({ message: 'Success' });
      });

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test/rate-limit')
          .set('X-Forwarded-For', '192.168.1.100');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
        
        // Check rate limit headers
        expect(response.headers['x-ratelimit-limit']).toBe('5');
        expect(response.headers['x-ratelimit-remaining']).toBe(String(4 - i));
      }

      // 6th request should be blocked
      const blockedResponse = await request(app)
        .get('/test/rate-limit')
        .set('X-Forwarded-For', '192.168.1.100');

      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.error).toContain('Too many requests');
      expect(blockedResponse.headers['retry-after']).toBeDefined();
    });

    it('should track different IPs separately', async () => {
      const limiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 2,
        store: redis || undefined,
      });

      app.post('/test/ip-tracking', limiter, (req: Request, res: Response) => {
        res.json({ ip: req.ip });
      });

      // Make requests from different IPs
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      
      for (const ip of ips) {
        // Each IP should get 2 requests
        for (let i = 0; i < 2; i++) {
          const response = await request(app)
            .post('/test/ip-tracking')
            .set('X-Forwarded-For', ip);

          expect(response.status).toBe(200);
        }

        // 3rd request should fail
        const blocked = await request(app)
          .post('/test/ip-tracking')
          .set('X-Forwarded-For', ip);

        expect(blocked.status).toBe(429);
      }
    });

    it('should reset limits after time window', async () => {
      const limiter = createRateLimiter({
        windowMs: 100, // 100ms window for fast testing
        max: 1,
        store: redis || undefined,
      });

      app.get('/test/window-reset', limiter, (req: Request, res: Response) => {
        res.json({ time: Date.now() });
      });

      // First request succeeds
      const first = await request(app)
        .get('/test/window-reset')
        .set('X-Forwarded-For', '192.168.1.1');
      expect(first.status).toBe(200);

      // Second request immediately fails
      const second = await request(app)
        .get('/test/window-reset')
        .set('X-Forwarded-For', '192.168.1.1');
      expect(second.status).toBe(429);

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should work again
      const third = await request(app)
        .get('/test/window-reset')
        .set('X-Forwarded-For', '192.168.1.1');
      expect(third.status).toBe(200);
    });
  });

  describe('User-Based Rate Limiting', () => {
    it('should track authenticated users separately from IPs', async () => {
      const userLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 3,
        keyGenerator: (req) => {
          return req.user ? `user_${req.user.userId}` : req.ip;
        },
        store: redis || undefined,
      });

      app.get('/test/user-limit', userLimiter, (req: Request, res: Response) => {
        res.json({ userId: (req as unknown).userId });
      });

      // Authenticated requests - should track by user
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/test/user-limit')
          .set('Authorization', `Bearer ${testUser.token}`)
          .set('X-Forwarded-For', `192.168.1.${i}`); // Different IPs

        expect(response.status).toBe(200);
      }

      // 4th request from same user, different IP - should fail
      const blocked = await request(app)
        .get('/test/user-limit')
        .set('Authorization', `Bearer ${testUser.token}`)
        .set('X-Forwarded-For', '10.0.0.1');

      expect(blocked.status).toBe(429);

      // Anonymous request from new IP should work
      const anonymous = await request(app)
        .get('/test/user-limit')
        .set('X-Forwarded-For', '172.16.0.1');

      expect(anonymous.status).toBe(200);
    });

    it('should apply different limits for different user roles', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        email: 'admin@example.com',
        password: 'AdminPass123!',
        name: 'Admin User',
        role: 'ADMIN',
      });

      const roleLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: (req) => {
          const role = (req as unknown).user?.role;
          switch (role) {
            case 'ADMIN': return 100;
            case 'PREMIUM': return 50;
            default: return 10;
          }
        },
        keyGenerator: (req) => req.user ? `user_${req.user.userId}` : req.ip,
        store: redis || undefined,
      });

      app.get('/test/role-limit', roleLimiter, (req: Request, res: Response) => {
        res.json({ role: (req as unknown).user?.role || 'anonymous' });
      });

      // Regular user gets 10 requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/test/role-limit')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
      }

      // 11th request fails
      const userBlocked = await request(app)
        .get('/test/role-limit')
        .set('Authorization', `Bearer ${testUser.token}`);
      expect(userBlocked.status).toBe(429);

      // Admin can make many more requests
      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .get('/test/role-limit')
          .set('Authorization', `Bearer ${adminUser.token}`);
        expect(response.status).toBe(200);
        expect(response.headers['x-ratelimit-limit']).toBe('100');
      }
    });
  });

  describe('Endpoint-Specific Limits', () => {
    it('should apply strict limits to login endpoint', async () => {
      const loginLimiter = createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3, // Only 3 attempts
        skipSuccessfulRequests: true,
        store: redis || undefined,
      });

      app.post('/test/auth/login', loginLimiter, async (req: Request, res: Response) => {
        const { email, password } = req.body;
        
        // Simulate login check
        if (email === testUser.email && password === testUser.password) {
          res.json({ success: true, token: 'fake-token' });
        } else {
          res.status(401).json({ error: 'Invalid credentials' });
        }
      });

      const testIp = '192.168.1.50';

      // Failed login attempts
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/test/auth/login')
          .set('X-Forwarded-For', testIp)
          .send({
            email: 'wrong@example.com',
            password: 'wrongpass',
          });

        expect(response.status).toBe(401);
        expect(response.headers['x-ratelimit-remaining']).toBe(String(2 - i));
      }

      // 4th attempt should be rate limited
      const blocked = await request(app)
        .post('/test/auth/login')
        .set('X-Forwarded-For', testIp)
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass',
        });

      expect(blocked.status).toBe(429);
      expect(blocked.body.error).toContain('Too many requests');

      // Successful login should not count against limit (if implemented)
      // This would require the middleware to check response status
    });

    it('should have different limits for different HTTP methods', async () => {
      const methodLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: (req) => {
          switch (req.method) {
            case 'GET': return 20;
            case 'POST': return 10;
            case 'DELETE': return 2;
            default: return 15;
          }
        },
        store: redis || undefined,
      });

      app.route('/test/resource')
        .get(methodLimiter, (req: Request, res: Response) => res.json({ method: 'GET' }))
        .post(methodLimiter, (req: Request, res: Response) => res.json({ method: 'POST' }))
        .delete(methodLimiter, (req: Request, res: Response) => res.json({ method: 'DELETE' }));

      const testIp = '192.168.1.60';

      // Test DELETE limit (2 requests)
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .delete('/test/resource')
          .set('X-Forwarded-For', testIp);
        expect(response.status).toBe(200);
      }

      // 3rd DELETE should fail
      const deleteBlocked = await request(app)
        .delete('/test/resource')
        .set('X-Forwarded-For', testIp);
      expect(deleteBlocked.status).toBe(429);

      // GET requests should still work (separate limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test/resource')
          .set('X-Forwarded-For', testIp);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Distributed Attack Prevention', () => {
    it('should detect patterns across multiple IPs', async () => {
      const patternLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 5,
        // Custom key that includes user agent for pattern detection
        keyGenerator: (req) => {
          const ua = req.headers['user-agent'] || 'unknown';
          if (ua.includes('bot') || ua.includes('scanner')) {
            return `pattern_${ua}`;
          }
          return req.ip;
        },
        store: redis || undefined,
      });

      app.get('/test/pattern', patternLimiter, (req: Request, res: Response) => {
        res.json({ detected: false });
      });

      // Multiple IPs with same bot user agent
      const botIps = ['192.168.1.10', '192.168.1.11', '192.168.1.12'];
      let totalRequests = 0;

      for (const ip of botIps) {
        for (let i = 0; i < 3; i++) {
          totalRequests++;
          const response = await request(app)
            .get('/test/pattern')
            .set('X-Forwarded-For', ip)
            .set('User-Agent', 'suspicious-bot/1.0');

          if (totalRequests <= 5) {
            expect(response.status).toBe(200);
          } else {
            expect(response.status).toBe(429);
            break;
          }
        }
      }

      // Regular users with different user agents should work
      const regularResponse = await request(app)
        .get('/test/pattern')
        .set('X-Forwarded-For', '192.168.1.99')
        .set('User-Agent', 'Mozilla/5.0');

      expect(regularResponse.status).toBe(200);
    });
  });

  describe('Redis Failure Handling', () => {
    it('should fall back gracefully when Redis is unavailable', async () => {
      // Create limiter with intentionally broken Redis
      const brokenRedis = redis ? new Redis('redis://invalid:6379') : null;
      
      const fallbackLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 3,
        store: brokenRedis || undefined,
        // Enable in-memory fallback
        skipFailedRequests: false,
      });

      app.get('/test/fallback', fallbackLimiter, (req: Request, res: Response) => {
        res.json({ fallback: true });
      });

      // Should still rate limit using in-memory store
      const testIp = '192.168.1.70';
      
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/test/fallback')
          .set('X-Forwarded-For', testIp);
        expect(response.status).toBe(200);
      }

      // 4th request should be blocked even without Redis
      const blocked = await request(app)
        .get('/test/fallback')
        .set('X-Forwarded-For', testIp);
      expect(blocked.status).toBe(429);

      if (brokenRedis) {
        brokenRedis.disconnect();
      }
    });
  });

  describe('Skip Conditions and Whitelisting', () => {
    it('should skip rate limiting for whitelisted IPs', async () => {
      const whitelistLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 1,
        skip: (req) => {
          const whitelist = ['10.0.0.1', '10.0.0.2'];
          return whitelist.includes(req.ip);
        },
        store: redis || undefined,
      });

      app.get('/test/whitelist', whitelistLimiter, (req: Request, res: Response) => {
        res.json({ whitelisted: true });
      });

      // Whitelisted IP can make unlimited requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/test/whitelist')
          .set('X-Forwarded-For', '10.0.0.1');
        expect(response.status).toBe(200);
      }

      // Non-whitelisted IP gets limited
      const response1 = await request(app)
        .get('/test/whitelist')
        .set('X-Forwarded-For', '192.168.1.1');
      expect(response1.status).toBe(200);

      const response2 = await request(app)
        .get('/test/whitelist')
        .set('X-Forwarded-For', '192.168.1.1');
      expect(response2.status).toBe(429);
    });

    it('should skip rate limiting for admin users', async () => {
      const adminUser = await createTestUser({
        email: 'admin-skip@example.com',
        password: 'AdminPass123!',
        role: 'ADMIN',
      });

      const adminSkipLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 1,
        skip: (req) => (req as unknown).user?.role === 'ADMIN',
        keyGenerator: (req) => req.user ? `user_${req.user.userId}` : req.ip,
        store: redis || undefined,
      });

      app.get('/test/admin-skip', adminSkipLimiter, (req: Request, res: Response) => {
        res.json({ role: (req as unknown).user?.role || 'anonymous' });
      });

      // Admin can make unlimited requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/test/admin-skip')
          .set('Authorization', `Bearer ${adminUser.token}`);
        expect(response.status).toBe(200);
      }

      // Regular user gets limited
      const response1 = await request(app)
        .get('/test/admin-skip')
        .set('Authorization', `Bearer ${testUser.token}`);
      expect(response1.status).toBe(200);

      const response2 = await request(app)
        .get('/test/admin-skip')
        .set('Authorization', `Bearer ${testUser.token}`);
      expect(response2.status).toBe(429);
    });
  });

  describe('Performance with Real Data Volumes', () => {
    it('should handle high request volumes efficiently', async () => {
      const performanceLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 100,
        store: redis || undefined,
      });

      app.get('/test/performance', performanceLimiter, (req: Request, res: Response) => {
        res.json({ timestamp: Date.now() });
      });

      const startTime = Date.now();
      const requests = [];

      // Simulate 50 concurrent users making requests
      for (let user = 0; user < 50; user++) {
        const userIp = `192.168.${Math.floor(user / 256)}.${user % 256}`;
        
        // Each user makes 2 requests
        for (let req = 0; req < 2; req++) {
          requests.push(
            request(app)
              .get('/test/performance')
              .set('X-Forwarded-For', userIp)
          );
        }
      }

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All requests should succeed (100 total, at the limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete reasonably fast even with Redis
      expect(duration).toBeLessThan(5000); // 5 seconds max

      // Processed 100 requests in ${duration}ms
    });
  });
});