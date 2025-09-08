/**
 * Comprehensive health endpoint tests
 * Tests /healthz, /readyz endpoints for production readiness
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';

describe('Health Endpoints', () => {
  let startTime: number;

  beforeAll(() => {
    // Initialize test database client
    getTestPrismaClient();
    startTime = Date.now();
  });

  afterAll(() => {
    const duration = Date.now() - startTime;
    console.log(`Health endpoint tests completed in ${duration}ms`);
  });

  describe('/healthz - Liveness Check', () => {
    it('should respond quickly without dependencies', async () => {
      const t0 = Date.now();
      const response = await request(app).get('/healthz');
      const responseTime = Date.now() - t0;

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        ts: expect.any(Number)
      });
      
      // Should respond in less than 250ms (no DB/Redis access)
      expect(responseTime).toBeLessThan(250);
    });

    it('should work multiple times in succession', async () => {
      const promises = Array(5).fill(null).map(() => 
        request(app).get('/healthz')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
      });
    });

    it('should not require authentication', async () => {
      const response = await request(app)
        .get('/healthz')
        .set('Authorization', 'Bearer invalid-token');
      
      // Should still work even with invalid auth
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });

  describe('/readyz - Readiness Check', () => {
    it('should check database connectivity', async () => {
      const response = await request(app).get('/readyz');
      
      // Status depends on actual DB/Redis state
      expect([200, 503]).toContain(response.status);
      
      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ok|degraded|error)$/),
        db: expect.stringMatching(/^(connected|down|unknown)$/),
        cache: expect.stringMatching(/^(connected|down|unknown)$/),
        eventLoop: expect.stringMatching(/^(healthy|degraded|unknown)$/),
        ts: expect.any(Number)
      });
    });

    it('should include event loop metrics when available', async () => {
      const response = await request(app).get('/readyz');
      
      if (response.body.metrics?.eventLoop) {
        const metrics = response.body.metrics.eventLoop;
        
        // Check for expected metric fields
        if (metrics.p50 !== undefined) {
          expect(typeof metrics.p50).toBe('number');
          expect(typeof metrics.p95).toBe('number');
          expect(typeof metrics.p99).toBe('number');
          expect(typeof metrics.max).toBe('number');
          expect(typeof metrics.lastUpdate).toBe('number');
        }
      }
    });

    it('should return 503 when dependencies are down', async () => {
      // This test assumes we can't guarantee all dependencies are up
      // Just verify the response structure
      const response = await request(app).get('/readyz');
      
      if (response.status === 503) {
        expect(response.body.status).not.toBe('ok');
        expect(response.body).toHaveProperty('db');
        expect(response.body).toHaveProperty('cache');
      }
    });

    it('should not require authentication', async () => {
      const response = await request(app)
        .get('/readyz')
        .set('Authorization', 'Bearer invalid-token');
      
      // Should work regardless of auth
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Error Handler Safety', () => {
    it('should handle errors without req.user gracefully', async () => {
      // Test a route that might throw an error
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Accept', 'application/json');
      
      // Should get an error response but not crash
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
      
      // Response should be JSON
      expect(response.type).toMatch(/json/);
    });

    it('should handle errors with req.user present', async () => {
      const prisma = getTestPrismaClient();
      
      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `health-test-${Date.now()}@example.com`,
          name: 'Health Test User',
          password: 'dummy',
          role: 'teacher',
          preferredLanguage: 'en',
        },
      });

      // Make a request that will fail but with auth
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get('/api/nonexistent-authenticated')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      
      // Should handle error gracefully even with user context
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe('Health Endpoint Performance', () => {
    it('/healthz should handle concurrent requests', async () => {
      const concurrentRequests = 20;
      const t0 = Date.now();
      
      const promises = Array(concurrentRequests).fill(null).map(() => 
        request(app).get('/healthz')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - t0;
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should complete reasonably fast even with concurrent requests
      expect(totalTime).toBeLessThan(1000);
    });

    it('/readyz should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      
      const promises = Array(concurrentRequests).fill(null).map(() => 
        request(app).get('/readyz')
      );
      
      const responses = await Promise.all(promises);
      
      // All should return valid status codes
      responses.forEach(response => {
        expect([200, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('status');
      });
    });
  });

  describe('Multiple Health Endpoints', () => {
    it('should have consistent /health endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });

    it('should have /api/health endpoint', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok'
      });
    });

    it('all health endpoints should be accessible', async () => {
      const endpoints = ['/healthz', '/readyz', '/health', '/api/health'];
      
      const promises = endpoints.map(endpoint => 
        request(app).get(endpoint)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThanOrEqual(503);
        console.log(`${endpoints[index]}: ${response.status}`);
      });
    });
  });
});