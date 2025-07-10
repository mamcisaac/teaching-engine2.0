/**
 * Monitoring Service Integration Tests
 * Tests real monitoring functionality with actual metrics collection and health checks
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { MonitoringService } from '../telemetry';
import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

// Real database connection for tests
const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL,
});

describe('MonitoringService Integration Tests', () => {
  let monitoringService: MonitoringService;
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    monitoringService = new MonitoringService();
    monitoringService.initialize(app);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    monitoringService.shutdown();
  });

  describe('Real Metrics Collection', () => {
    test('should collect real HTTP metrics from Express app', async () => {
      // Setup monitoring middleware
      app.use(monitoringService.httpMetricsMiddleware());

      // Add test routes
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      app.get('/api/slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        res.json({ slow: true });
      });

      app.get('/api/error', (req, res) => {
        res.status(500).json({ error: 'Server error' });
      });

      app.post('/api/data', (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      // Make various requests
      await request(app).get('/api/test').expect(200);
      await request(app).get('/api/test').expect(200);
      await request(app).get('/api/slow').expect(200);
      await request(app).get('/api/error').expect(500);
      await request(app).post('/api/data').send({ name: 'test' }).expect(201);

      // Get collected metrics
      const metrics = await monitoringService.getMetrics();

      expect(metrics.http).toBeDefined();
      expect(metrics.http.totalRequests).toBe(5);
      expect(metrics.http.requestsByMethod).toEqual({
        GET: 4,
        POST: 1,
      });
      expect(metrics.http.requestsByStatus).toEqual({
        '2xx': 4,
        '5xx': 1,
      });
      expect(metrics.http.requestsByPath['/api/test']).toBe(2);
      expect(metrics.http.requestsByPath['/api/slow']).toBe(1);
      
      // Check response time metrics
      expect(metrics.http.responseTime.avg).toBeGreaterThan(0);
      expect(metrics.http.responseTime.p95).toBeGreaterThan(metrics.http.responseTime.avg);
      expect(metrics.http.slowestEndpoints[0].path).toBe('/api/slow');
    });

    test('should track real database query metrics', async () => {
      // Wrap Prisma client with monitoring
      const monitoredPrisma = monitoringService.wrapDatabaseClient(prisma);

      // Perform real database operations
      const startTime = performance.now();
      
      // Create test data
      const user = await monitoredPrisma.user.create({
        data: {
          email: `monitor-test-${Date.now()}@example.com`,
          password: 'hashed',
          name: 'Monitor Test User',
          role: 'teacher',
        },
      });

      // Query operations
      await monitoredPrisma.user.findMany({
        where: { role: 'teacher' },
        take: 10,
      });

      await monitoredPrisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated Name' },
      });

      // Clean up
      await monitoredPrisma.user.delete({
        where: { id: user.id },
      });

      const endTime = performance.now();

      // Get database metrics
      const metrics = await monitoringService.getMetrics();

      expect(metrics.database).toBeDefined();
      expect(metrics.database.totalQueries).toBe(4);
      expect(metrics.database.queriesByOperation).toEqual({
        INSERT: 1,
        SELECT: 1,
        UPDATE: 1,
        DELETE: 1,
      });
      expect(metrics.database.queryTime.total).toBeGreaterThan(0);
      expect(metrics.database.queryTime.avg).toBeGreaterThan(0);
      expect(metrics.database.slowQueries).toBeDefined();
    });

    test('should collect real memory and CPU metrics', async () => {
      const systemMetrics = await monitoringService.collectSystemMetrics();

      expect(systemMetrics.memory).toBeDefined();
      expect(systemMetrics.memory.heapUsed).toBeGreaterThan(0);
      expect(systemMetrics.memory.heapTotal).toBeGreaterThan(0);
      expect(systemMetrics.memory.rss).toBeGreaterThan(0);
      expect(systemMetrics.memory.external).toBeGreaterThanOrEqual(0);

      expect(systemMetrics.cpu).toBeDefined();
      expect(systemMetrics.cpu.user).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.cpu.system).toBeGreaterThanOrEqual(0);
      
      expect(systemMetrics.process).toBeDefined();
      expect(systemMetrics.process.uptime).toBeGreaterThan(0);
      expect(systemMetrics.process.pid).toBe(process.pid);
    });
  });

  describe('Real Health Checks', () => {
    test('should perform real database health check', async () => {
      const health = await monitoringService.checkHealth();

      expect(health.status).toBe('healthy');
      expect(health.checks.database).toBeDefined();
      expect(health.checks.database.status).toBe('healthy');
      expect(health.checks.database.responseTime).toBeGreaterThan(0);
      expect(health.checks.database.responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should detect unhealthy database', async () => {
      // Temporarily break database connection
      await prisma.$disconnect();

      const health = await monitoringService.checkHealth();

      expect(health.status).toBe('unhealthy');
      expect(health.checks.database.status).toBe('unhealthy');
      expect(health.checks.database.error).toBeDefined();

      // Reconnect for other tests
      await prisma.$connect();
    });

    test('should provide comprehensive health endpoint', async () => {
      app.get('/health', monitoringService.healthCheckEndpoint());

      const response = await request(app).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        checks: {
          database: {
            status: 'healthy',
            responseTime: expect.any(Number),
          },
          memory: {
            status: 'healthy',
            heapUsedPercent: expect.any(Number),
          },
          disk: {
            status: 'healthy',
            usage: expect.any(Number),
          },
        },
      });
    });
  });

  describe('Real-time Monitoring', () => {
    test('should stream metrics in real-time via SSE', (done) => {
      app.get('/metrics/stream', monitoringService.metricsStreamEndpoint());

      const eventSource = request(app)
        .get('/metrics/stream')
        .set('Accept', 'text/event-stream');

      let messageCount = 0;
      const messages: unknown[] = [];

      eventSource.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.startsWith('data: ')) {
          const json = safeJsonParse(data.substring(6, {}));
          messages.push(json);
          messageCount++;

          if (messageCount >= 3) {
            eventSource.abort();
            
            // Verify we received periodic updates
            expect(messages.length).toBe(3);
            messages.forEach(msg => {
              expect(msg.timestamp).toBeDefined();
              expect(msg.metrics).toBeDefined();
            });
            
            done();
          }
        }
      });
    });

    test('should track custom business metrics', async () => {
      // Track various business events
      await monitoringService.trackBusinessEvent('lesson.created', {
        userId: 1,
        grade: 5,
        subject: 'Mathematics',
      });

      await monitoringService.trackBusinessEvent('lesson.created', {
        userId: 2,
        grade: 6,
        subject: 'Science',
      });

      await monitoringService.trackBusinessEvent('ai.generation', {
        model: 'gpt-4',
        tokens: 500,
        duration: 1200,
      });

      const metrics = await monitoringService.getMetrics();

      expect(metrics.business).toBeDefined();
      expect(metrics.business.events['lesson.created']).toBe(2);
      expect(metrics.business.events['ai.generation']).toBe(1);
      expect(metrics.business.byGrade).toEqual({
        '5': 1,
        '6': 1,
      });
      expect(metrics.business.bySubject).toEqual({
        'Mathematics': 1,
        'Science': 1,
      });
    });
  });

  describe('Performance Profiling', () => {
    test('should profile code execution with real measurements', async () => {
      const result = await monitoringService.profile('expensive-operation', async () => {
        // Simulate expensive computation
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += Math.sqrt(i);
        }
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return sum;
      });

      const profileData = monitoringService.getProfileData('expensive-operation');
      
      expect(profileData).toBeDefined();
      expect(profileData.executionTime).toBeGreaterThan(50);
      expect(profileData.cpuTime).toBeGreaterThan(0);
      expect(profileData.memoryDelta).toBeDefined();
      expect(result).toBeGreaterThan(0);
    });

    test('should detect performance bottlenecks', async () => {
      // Simulate various operations with different performance characteristics
      for (let i = 0; i < 5; i++) {
        await monitoringService.profile('fast-op', async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
      }

      for (let i = 0; i < 3; i++) {
        await monitoringService.profile('slow-op', async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
        });
      }

      const bottlenecks = monitoringService.identifyBottlenecks();
      
      expect(bottlenecks).toBeDefined();
      expect(bottlenecks[0].operation).toBe('slow-op');
      expect(bottlenecks[0].avgTime).toBeGreaterThan(190);
      expect(bottlenecks[0].impact).toBe('high');
    });
  });

  describe('Error Tracking', () => {
    test('should capture and categorize real errors', async () => {
      app.get('/api/crash', (req, res, next) => {
        throw new Error('Intentional crash for testing');
      });

      app.get('/api/async-crash', async (req, res, next) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Async error');
      });

      app.use(monitoringService.errorTrackingMiddleware());

      // Trigger errors
      await request(app).get('/api/crash').expect(500);
      await request(app).get('/api/async-crash').expect(500);

      const errorMetrics = monitoringService.getErrorMetrics();
      
      expect(errorMetrics.totalErrors).toBe(2);
      expect(errorMetrics.errorsByType['Error']).toBe(2);
      expect(errorMetrics.errorsByPath['/api/crash']).toBe(1);
      expect(errorMetrics.errorsByPath['/api/async-crash']).toBe(1);
      expect(errorMetrics.recentErrors).toHaveLength(2);
      expect(errorMetrics.recentErrors[0].message).toContain('Async error');
    });
  });

  describe('Alerting System', () => {
    test('should trigger alerts based on real metrics', async () => {
      const alerts: unknown[] = [];
      
      monitoringService.onAlert((alert) => {
        alerts.push(alert);
      });

      // Configure alert rules
      monitoringService.configureAlerts({
        highErrorRate: {
          threshold: 0.1, // 10% error rate
          window: '1m',
        },
        slowResponse: {
          threshold: 1000, // 1 second
          percentile: 95,
        },
        memoryUsage: {
          threshold: 0.9, // 90% heap usage
        },
      });

      // Generate errors to trigger alert
      app.get('/api/fail', (req, res) => {
        res.status(500).json({ error: 'Failed' });
      });

      app.use(monitoringService.httpMetricsMiddleware());

      // Make requests - 3 failures out of 10 total (30% error rate)
      for (let i = 0; i < 7; i++) {
        await request(app).get('/api/test').expect(200);
      }
      for (let i = 0; i < 3; i++) {
        await request(app).get('/api/fail').expect(500);
      }

      // Check alerts
      await monitoringService.evaluateAlerts();

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('highErrorRate');
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].value).toBeCloseTo(0.3, 1);
    });
  });

  describe('Metrics Export', () => {
    test('should export metrics in Prometheus format', async () => {
      // Generate some metrics
      app.use(monitoringService.httpMetricsMiddleware());
      app.get('/api/test', (req, res) => res.json({ ok: true }));
      
      await request(app).get('/api/test').expect(200);
      await request(app).get('/api/test').expect(200);

      // Get Prometheus format
      app.get('/metrics', monitoringService.prometheusEndpoint());
      
      const response = await request(app).get('/metrics').expect(200);
      
      expect(response.text).toContain('# HELP http_requests_total');
      expect(response.text).toContain('# TYPE http_requests_total counter');
      expect(response.text).toContain('http_requests_total{method="GET",path="/api/test",status="200"} 2');
    });

    test('should export metrics in JSON format', async () => {
      app.get('/metrics/json', monitoringService.jsonMetricsEndpoint());
      
      const response = await request(app).get('/metrics/json').expect(200);
      
      expect(response.body).toMatchObject({
        timestamp: expect.any(String),
        metrics: expect.any(Object),
      });
    });
  });
});