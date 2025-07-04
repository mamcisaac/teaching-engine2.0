import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { MonitoringService } from '../telemetry';
import { MetricCollector } from '../metrics';
import { AlertManager } from '../alerts';
import { DashboardService } from '../dashboard';
import { LogAnalyzer } from '../logAnalyzer';
import { HealthChecker } from '../healthCheck';
import { PerformanceMonitor } from '../performance';
import { SpanStatusCode } from '@opentelemetry/api';

// Mock OpenTelemetry
vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: vi.fn(() => ({
      startActiveSpan: vi.fn((name, options, fn) => {
        const mockSpan = {
          setStatus: vi.fn(),
          recordException: vi.fn(),
          setAttributes: vi.fn(),
          end: vi.fn(),
        };
        if (typeof options === 'function') {
          return options(mockSpan);
        }
        return fn(mockSpan);
      }),
    })),
  },
  metrics: {
    getMeter: vi.fn(() => ({
      createCounter: vi.fn(() => ({ add: vi.fn() })),
      createHistogram: vi.fn(() => ({ record: vi.fn() })),
      createGauge: vi.fn(() => ({ record: vi.fn() })),
    })),
  },
  SpanStatusCode: {
    OK: 1,
    ERROR: 2,
  },
}));

// Mock dependencies
vi.mock('../metrics');
vi.mock('../alerts');
vi.mock('../dashboard');
vi.mock('../logAnalyzer');
vi.mock('../healthCheck');
vi.mock('../performance');

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  let mockMetricCollector: jest.Mocked<MetricCollector>;
  let mockAlertManager: jest.Mocked<AlertManager>;
  let mockDashboardService: jest.Mocked<DashboardService>;
  let mockLogAnalyzer: jest.Mocked<LogAnalyzer>;
  let mockHealthChecker: jest.Mocked<HealthChecker>;
  let mockPerformanceMonitor: jest.Mocked<PerformanceMonitor>;

  beforeEach(() => {
    // Create mock instances
    mockMetricCollector = new MetricCollector() as jest.Mocked<MetricCollector>;
    mockAlertManager = new AlertManager() as jest.Mocked<AlertManager>;
    mockDashboardService = new DashboardService() as jest.Mocked<DashboardService>;
    mockLogAnalyzer = new LogAnalyzer() as jest.Mocked<LogAnalyzer>;
    mockHealthChecker = new HealthChecker() as jest.Mocked<HealthChecker>;
    mockPerformanceMonitor = new PerformanceMonitor() as jest.Mocked<PerformanceMonitor>;

    // Set up monitoring service
    monitoringService = new MonitoringService({
      metricCollector: mockMetricCollector,
      alertManager: mockAlertManager,
      dashboardService: mockDashboardService,
      logAnalyzer: mockLogAnalyzer,
      healthChecker: mockHealthChecker,
      performanceMonitor: mockPerformanceMonitor,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Distributed Tracing', () => {
    it('should create and track spans for operations', async () => {
      const operation = async () => {
        return await monitoringService.withSpan('test-operation', async (span) => {
          span.setAttributes({ userId: 1, operation: 'test' });
          return { result: 'success' };
        });
      };

      const result = await operation();

      expect(result).toEqual({ result: 'success' });
      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('operation.count', {
        operation: 'test-operation',
        status: 'success',
      });
    });

    it('should handle errors in spans correctly', async () => {
      const error = new Error('Test error');
      
      const operation = async () => {
        return await monitoringService.withSpan('failing-operation', async (span) => {
          throw error;
        });
      };

      await expect(operation()).rejects.toThrow('Test error');
      
      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('operation.count', {
        operation: 'failing-operation',
        status: 'error',
      });
      expect(mockAlertManager.checkThreshold).toHaveBeenCalledWith('error_rate', expect.any(Number));
    });

    it('should track nested spans', async () => {
      const result = await monitoringService.withSpan('parent-operation', async (parentSpan) => {
        parentSpan.setAttributes({ level: 'parent' });
        
        const childResult = await monitoringService.withSpan('child-operation', async (childSpan) => {
          childSpan.setAttributes({ level: 'child' });
          return 'child-result';
        });

        return { parent: 'result', child: childResult };
      });

      expect(result).toEqual({ parent: 'result', child: 'child-result' });
    });

    it('should measure operation duration', async () => {
      const startTime = Date.now();
      
      await monitoringService.withSpan('timed-operation', async (span) => {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(mockMetricCollector.recordHistogram).toHaveBeenCalledWith(
        'operation.duration',
        expect.any(Number),
        { operation: 'timed-operation' }
      );
    });
  });

  describe('Metrics Collection', () => {
    it('should track API request metrics', async () => {
      await monitoringService.trackApiRequest({
        method: 'GET',
        path: '/api/lessons',
        statusCode: 200,
        duration: 150,
        userId: 1,
      });

      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('api.requests', {
        method: 'GET',
        path: '/api/lessons',
        status: '2xx',
      });

      expect(mockMetricCollector.recordHistogram).toHaveBeenCalledWith(
        'api.request.duration',
        150,
        {
          method: 'GET',
          path: '/api/lessons',
        }
      );
    });

    it('should track database query metrics', async () => {
      await monitoringService.trackDatabaseQuery({
        operation: 'SELECT',
        table: 'lessons',
        duration: 25,
        rowCount: 10,
      });

      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('db.queries', {
        operation: 'SELECT',
        table: 'lessons',
      });

      expect(mockMetricCollector.recordHistogram).toHaveBeenCalledWith(
        'db.query.duration',
        25,
        {
          operation: 'SELECT',
          table: 'lessons',
        }
      );

      expect(mockPerformanceMonitor.checkQueryPerformance).toHaveBeenCalledWith({
        operation: 'SELECT',
        table: 'lessons',
        duration: 25,
      });
    });

    it('should track cache metrics', async () => {
      // Cache hit
      await monitoringService.trackCacheOperation({
        operation: 'get',
        key: 'lesson:123',
        hit: true,
        duration: 2,
      });

      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('cache.hits', {
        operation: 'get',
      });

      // Cache miss
      await monitoringService.trackCacheOperation({
        operation: 'get',
        key: 'lesson:456',
        hit: false,
        duration: 3,
      });

      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('cache.misses', {
        operation: 'get',
      });
    });

    it('should track business metrics', async () => {
      await monitoringService.trackBusinessMetric('lessons.created', 1, {
        userId: 1,
        grade: 5,
        subject: 'Mathematics',
      });

      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('business.lessons.created', {
        grade: 5,
        subject: 'Mathematics',
      });

      await monitoringService.trackBusinessMetric('ai.tokens.used', 500, {
        model: 'gpt-4',
        operation: 'lesson_generation',
      });

      expect(mockMetricCollector.recordGauge).toHaveBeenCalledWith('business.ai.tokens.used', 500, {
        model: 'gpt-4',
        operation: 'lesson_generation',
      });
    });
  });

  describe('Alerting', () => {
    it('should trigger alerts on threshold breach', async () => {
      mockAlertManager.checkThreshold.mockResolvedValue({
        breached: true,
        value: 15,
        threshold: 10,
      });

      await monitoringService.checkAlerts();

      expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
        severity: 'warning',
        title: 'Threshold Breached',
        message: expect.stringContaining('exceeded threshold'),
        metadata: expect.any(Object),
      });
    });

    it('should handle different alert severities', async () => {
      // Critical alert
      mockMetricCollector.getMetric.mockResolvedValue({
        name: 'error_rate',
        value: 0.25, // 25% error rate
      });

      await monitoringService.evaluateErrorRate();

      expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
        severity: 'critical',
        title: 'High Error Rate',
        message: expect.stringContaining('25%'),
      });

      // Warning alert
      mockMetricCollector.getMetric.mockResolvedValue({
        name: 'response_time_p95',
        value: 1500, // 1.5 seconds
      });

      await monitoringService.evaluateResponseTime();

      expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
        severity: 'warning',
        title: 'Slow Response Time',
        message: expect.stringContaining('1500ms'),
      });
    });

    it('should implement alert cooldown', async () => {
      mockAlertManager.checkThreshold.mockResolvedValue({
        breached: true,
        value: 15,
        threshold: 10,
      });

      // First alert should be sent
      await monitoringService.checkAlerts();
      expect(mockAlertManager.sendAlert).toHaveBeenCalledTimes(1);

      // Immediate second check should not send due to cooldown
      await monitoringService.checkAlerts();
      expect(mockAlertManager.sendAlert).toHaveBeenCalledTimes(1);

      // After cooldown period, alert should be sent again
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      await monitoringService.checkAlerts();
      expect(mockAlertManager.sendAlert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dashboard Metrics', () => {
    it('should aggregate metrics for dashboard display', async () => {
      mockMetricCollector.getMetrics.mockResolvedValue([
        { name: 'api.requests', value: 1000, labels: {} },
        { name: 'api.errors', value: 25, labels: {} },
        { name: 'api.response_time_avg', value: 150, labels: {} },
      ]);

      const dashboardData = await monitoringService.getDashboardMetrics();

      expect(dashboardData).toMatchObject({
        overview: {
          totalRequests: 1000,
          errorRate: 2.5,
          avgResponseTime: 150,
        },
      });

      expect(mockDashboardService.formatForDisplay).toHaveBeenCalled();
    });

    it('should provide real-time metrics updates', async () => {
      const metricsStream = monitoringService.getMetricsStream();
      
      const receivedMetrics: any[] = [];
      metricsStream.on('data', (metric) => {
        receivedMetrics.push(metric);
      });

      // Simulate metric updates
      await monitoringService.trackApiRequest({
        method: 'GET',
        path: '/api/lessons',
        statusCode: 200,
        duration: 100,
      });

      expect(receivedMetrics).toHaveLength(1);
      expect(receivedMetrics[0]).toMatchObject({
        type: 'api_request',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Health Checks', () => {
    it('should perform comprehensive health checks', async () => {
      mockHealthChecker.checkDatabase.mockResolvedValue({ healthy: true, latency: 5 });
      mockHealthChecker.checkCache.mockResolvedValue({ healthy: true, latency: 1 });
      mockHealthChecker.checkExternalServices.mockResolvedValue({ healthy: true });

      const health = await monitoringService.getHealthStatus();

      expect(health).toEqual({
        status: 'healthy',
        checks: {
          database: { healthy: true, latency: 5 },
          cache: { healthy: true, latency: 1 },
          external: { healthy: true },
        },
        timestamp: expect.any(Number),
      });
    });

    it('should handle partial health check failures', async () => {
      mockHealthChecker.checkDatabase.mockResolvedValue({ healthy: true, latency: 5 });
      mockHealthChecker.checkCache.mockResolvedValue({ 
        healthy: false, 
        error: 'Connection timeout',
      });
      mockHealthChecker.checkExternalServices.mockResolvedValue({ healthy: true });

      const health = await monitoringService.getHealthStatus();

      expect(health.status).toBe('degraded');
      expect(health.checks.cache.healthy).toBe(false);
    });

    it('should track health check metrics', async () => {
      await monitoringService.performHealthCheck();

      expect(mockMetricCollector.recordGauge).toHaveBeenCalledWith(
        'health.status',
        expect.any(Number),
        { component: 'overall' }
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should identify performance bottlenecks', async () => {
      mockPerformanceMonitor.analyzePerformance.mockResolvedValue({
        bottlenecks: [
          {
            operation: 'database_query',
            avgDuration: 500,
            p95Duration: 1200,
            recommendation: 'Consider adding index on user_id column',
          },
        ],
        trends: {
          responseTime: 'increasing',
          throughput: 'stable',
        },
      });

      const analysis = await monitoringService.getPerformanceAnalysis();

      expect(analysis.bottlenecks).toHaveLength(1);
      expect(analysis.bottlenecks[0].recommendation).toContain('index');
    });

    it('should track memory usage', async () => {
      const memoryUsage = process.memoryUsage();
      
      await monitoringService.trackMemoryUsage();

      expect(mockMetricCollector.recordGauge).toHaveBeenCalledWith(
        'process.memory.heap_used',
        expect.any(Number),
        {}
      );

      expect(mockMetricCollector.recordGauge).toHaveBeenCalledWith(
        'process.memory.heap_total',
        expect.any(Number),
        {}
      );
    });

    it('should detect memory leaks', async () => {
      mockPerformanceMonitor.detectMemoryLeaks.mockResolvedValue({
        detected: true,
        growth: 100, // MB
        duration: 3600, // 1 hour
        recommendation: 'Memory usage growing rapidly. Check for unfreed references.',
      });

      await monitoringService.checkForMemoryLeaks();

      expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
        severity: 'warning',
        title: 'Potential Memory Leak',
        message: expect.stringContaining('100 MB'),
      });
    });
  });

  describe('Log Analysis', () => {
    it('should analyze error patterns', async () => {
      mockLogAnalyzer.analyzeErrors.mockResolvedValue({
        patterns: [
          {
            pattern: 'Database connection timeout',
            count: 15,
            timeRange: '1h',
            firstSeen: new Date('2024-09-20T10:00:00Z'),
            lastSeen: new Date('2024-09-20T11:00:00Z'),
          },
        ],
        totalErrors: 25,
      });

      const analysis = await monitoringService.analyzeErrorLogs();

      expect(analysis.patterns).toHaveLength(1);
      expect(analysis.patterns[0].count).toBe(15);
    });

    it('should detect anomalies in logs', async () => {
      mockLogAnalyzer.detectAnomalies.mockResolvedValue({
        anomalies: [
          {
            type: 'spike',
            metric: 'error_rate',
            value: 50,
            baseline: 5,
            timestamp: new Date(),
          },
        ],
      });

      await monitoringService.detectLogAnomalies();

      expect(mockAlertManager.sendAlert).toHaveBeenCalledWith({
        severity: 'warning',
        title: 'Anomaly Detected',
        message: expect.stringContaining('spike'),
      });
    });
  });

  describe('Custom Metrics', () => {
    it('should allow registration of custom metrics', async () => {
      monitoringService.registerCustomMetric({
        name: 'custom.lesson_quality',
        type: 'gauge',
        description: 'Average lesson quality score',
        labels: ['grade', 'subject'],
      });

      await monitoringService.recordCustomMetric('custom.lesson_quality', 4.5, {
        grade: '5',
        subject: 'Mathematics',
      });

      expect(mockMetricCollector.recordGauge).toHaveBeenCalledWith(
        'custom.lesson_quality',
        4.5,
        {
          grade: '5',
          subject: 'Mathematics',
        }
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete monitoring workflow', async () => {
      // Simulate API request
      const requestStart = Date.now();
      
      await monitoringService.withSpan('api.request', async (span) => {
        span.setAttributes({ method: 'POST', path: '/api/lessons' });
        
        // Track database query
        await monitoringService.trackDatabaseQuery({
          operation: 'INSERT',
          table: 'lessons',
          duration: 50,
          rowCount: 1,
        });

        // Track business metric
        await monitoringService.trackBusinessMetric('lessons.created', 1, {
          userId: 1,
          grade: 5,
        });

        return { lessonId: 123 };
      });

      const requestDuration = Date.now() - requestStart;

      // Track API response
      await monitoringService.trackApiRequest({
        method: 'POST',
        path: '/api/lessons',
        statusCode: 201,
        duration: requestDuration,
        userId: 1,
      });

      // Verify all metrics were collected
      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('api.requests', expect.any(Object));
      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('db.queries', expect.any(Object));
      expect(mockMetricCollector.incrementCounter).toHaveBeenCalledWith('business.lessons.created', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle metric collection failures', async () => {
      mockMetricCollector.incrementCounter.mockRejectedValue(new Error('Metric service unavailable'));

      // Should not throw
      await expect(
        monitoringService.trackApiRequest({
          method: 'GET',
          path: '/api/lessons',
          statusCode: 200,
          duration: 100,
        })
      ).resolves.not.toThrow();
    });

    it('should continue monitoring when alerts fail', async () => {
      mockAlertManager.sendAlert.mockRejectedValue(new Error('Alert service down'));

      // Should not throw
      await expect(monitoringService.checkAlerts()).resolves.not.toThrow();
    });
  });
});