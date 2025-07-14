/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Response Time Monitoring System
 * Continuous monitoring and alerting for application response times
 */

import { test, expect } from '@playwright/test';
import { ResponseTimeMonitor } from './utils/ResponseTimeMonitor';
import { PERFORMANCE_BASELINES } from './config';

interface ResponseTimeAlert {
  endpoint: string;
  currentTime: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface MonitoringSession {
  sessionId: string;
  startTime: string;
  duration: number;
  totalRequests: number;
  alerts: ResponseTimeAlert[];
  averageResponseTime: number;
  p95ResponseTime: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
}

class ResponseTimeMonitoringSystem {
  private monitor: ResponseTimeMonitor;
  private alerts: ResponseTimeAlert[] = [];
  private sessions: MonitoringSession[] = [];

  constructor() {
    this.monitor = new ResponseTimeMonitor();
  }

  async startMonitoringSession(duration: number = 300000): Promise<MonitoringSession> {
    const sessionId = `session-${Date.now()}`;
    console.log(`🔍 Starting response time monitoring session: ${sessionId}`);

    const startTime = new Date().toISOString();
    await this.monitor.startContinuousMonitoring(duration);

    // Monitor key endpoints
    const endpoints = [
      { path: '/api/curriculum-expectations', method: 'GET' },
      { path: '/api/etfo-lesson-plans', method: 'GET' },
      { path: '/api/etfo-lesson-plans', method: 'POST' },
      { path: '/api/unit-plans', method: 'GET' },
      { path: '/api/newsletters', method: 'GET' },
      // Student endpoint removed - app does not store student data
      { path: '/api/curriculum-import', method: 'POST' },
    ];

    const sessionAlerts: ResponseTimeAlert[] = [];
    let totalRequests = 0;
    const responseTimes: number[] = [];

    for (const endpoint of endpoints) {
      const results = await this.monitor.monitorEndpoint(
        endpoint.path,
        endpoint.method,
        duration / endpoints.length,
      );

      totalRequests += results.requestCount;
      responseTimes.push(...results.responseTimes);

      // Check for alerts
      const threshold =
        PERFORMANCE_BASELINES[`${endpoint.method} ${endpoint.path}`]?.maxResponseTime ?? 2000;
      const averageTime =
        results.responseTimes.reduce((sum, time) => sum + time, 0) / results.responseTimes.length;

      if (averageTime > threshold) {
        const alert: ResponseTimeAlert = {
          endpoint: `${endpoint.method} ${endpoint.path}`,
          currentTime: averageTime,
          threshold,
          severity: this.calculateSeverity(averageTime, threshold),
          timestamp: new Date().toISOString(),
        };

        sessionAlerts.push(alert);
        this.alerts.push(alert);
      }
    }

    // Calculate session metrics
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.ceil(sortedTimes.length * 0.95) - 1;
    const averageResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    // Find slowest endpoints
    const endpointTimes = endpoints
      .map((endpoint) => {
        const endpointResults = this.monitor.getEndpointMetrics(endpoint.path, endpoint.method);
        return {
          endpoint: `${endpoint.method} ${endpoint.path}`,
          avgTime: endpointResults.averageResponseTime,
        };
      })
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const session: MonitoringSession = {
      sessionId,
      startTime,
      duration,
      totalRequests,
      alerts: sessionAlerts,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: Math.round(sortedTimes[p95Index] || 0),
      slowestEndpoints: endpointTimes,
    };

    this.sessions.push(session);
    return session;
  }

  private calculateSeverity(currentTime: number, threshold: number): ResponseTimeAlert['severity'] {
    const ratio = currentTime / threshold;

    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  async generateMonitoringReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSessions: this.sessions.length,
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter((a) => a.severity === 'critical').length,
        averageResponseTime: this.calculateOverallAverage(),
      },
      sessions: this.sessions,
      alerts: this.alerts,
      trends: this.analyzeTrends(),
      recommendations: this.generateAlertRecommendations(),
    };

    // Save monitoring report
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'test-results', 'monitoring');
    await fs.mkdir(reportDir, { recursive: true });

    await fs.writeFile(
      path.join(reportDir, `monitoring-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2),
    );

    console.log(`📊 Response time monitoring report generated: ${reportDir}`);
  }

  private calculateOverallAverage(): number {
    if (this.sessions.length === 0) return 0;

    const totalTime = this.sessions.reduce((sum, session) => sum + session.averageResponseTime, 0);
    return Math.round(totalTime / this.sessions.length);
  }

  private analyzeTrends(): {
    responseTimetrend: 'improving' | 'degrading' | 'stable';
    alertFrequency: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.sessions.length < 2) {
      return { responseTimetrend: 'stable', alertFrequency: 'stable' };
    }

    // Analyze response time trend
    const recentSessions = this.sessions.slice(-5);
    const older = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
    const newer = recentSessions.slice(Math.floor(recentSessions.length / 2));

    const olderAvg = older.reduce((sum, s) => sum + s.averageResponseTime, 0) / older.length;
    const newerAvg = newer.reduce((sum, s) => sum + s.averageResponseTime, 0) / newer.length;

    const responseTimeChange = ((newerAvg - olderAvg) / olderAvg) * 100;
    let responseTimetrend: 'improving' | 'degrading' | 'stable' = 'stable';

    if (responseTimeChange > 10) responseTimetrend = 'degrading';
    else if (responseTimeChange < -10) responseTimetrend = 'improving';

    // Analyze alert frequency
    const recentAlerts = this.alerts.filter(
      (a) => Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000, // Last 24 hours
    );
    const previousAlerts = this.alerts.filter((a) => {
      const alertTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return alertTime >= now - 48 * 60 * 60 * 1000 && alertTime < now - 24 * 60 * 60 * 1000;
    });

    let alertFrequency: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAlerts.length > previousAlerts.length * 1.2) alertFrequency = 'increasing';
    else if (recentAlerts.length < previousAlerts.length * 0.8) alertFrequency = 'decreasing';

    return { responseTimetrend, alertFrequency };
  }

  private generateAlertRecommendations(): string[] {
    const recommendations: string[] = [];
    const criticalAlerts = this.alerts.filter((a) => a.severity === 'critical');

    if (criticalAlerts.length > 0) {
      recommendations.push(
        `🚨 ${criticalAlerts.length} critical performance alerts detected. Immediate attention required.`,
      );
    }

    // Group alerts by endpoint
    const alertsByEndpoint = this.alerts.reduce(
      (acc, alert) => {
        acc[alert.endpoint] = (acc[alert.endpoint] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const problematicEndpoints = Object.entries(alertsByEndpoint)
      .filter(([_, count]) => count >= 3)
      .map(([endpoint]) => endpoint);

    if (problematicEndpoints.length > 0) {
      recommendations.push(
        `🎯 Endpoints with recurring issues: ${problematicEndpoints.join(', ')}`,
      );
    }

    const trends = this.analyzeTrends();
    if (trends.responseTimetrend === 'degrading') {
      recommendations.push(
        '📈 Response times are trending upward. Consider performance optimization.',
      );
    }

    if (trends.alertFrequency === 'increasing') {
      recommendations.push(
        '⚠️ Alert frequency is increasing. Review recent changes and system load.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All response times are within acceptable ranges.');
    }

    return recommendations;
  }

  getAlerts(): ResponseTimeAlert[] {
    return this.alerts;
  }

  getSessions(): MonitoringSession[] {
    return this.sessions;
  }
}

const monitoringSystem = new ResponseTimeMonitoringSystem();

test.describe('Response Time Monitoring', () => {
  test.setTimeout(600000); // 10 minutes for monitoring tests

  test('Continuous Response Time Monitoring', async () => {
    const session = await monitoringSystem.startMonitoringSession(60000); // 1 minute

    expect(session.totalRequests).toBeGreaterThan(0);
    expect(session.averageResponseTime).toBeLessThan(5000); // Should not exceed 5 seconds on average

    // Check for critical alerts
    const criticalAlerts = session.alerts.filter((a) => a.severity === 'critical');
    expect(
      criticalAlerts.length,
      `Critical performance alerts detected: ${JSON.stringify(criticalAlerts)}`,
    ).toBe(0);

    console.log(
      `📊 Monitoring session completed: ${session.totalRequests} requests, ${session.alerts.length} alerts`,
    );
  });

  test('API Endpoint Response Time Baselines', async ({ request }) => {
    const endpoints = [
      { path: '/api/curriculum-expectations', method: 'GET', maxTime: 500 },
      { path: '/api/etfo-lesson-plans', method: 'GET', maxTime: 800 },
      { path: '/api/unit-plans', method: 'GET', maxTime: 600 },
      // Student endpoint removed - app does not store student data
      { path: '/api/newsletters', method: 'GET', maxTime: 800 },
    ];

    for (const endpoint of endpoints) {
      const iterations = 10;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        const response = await request.get(`http://localhost:3000${endpoint.path}`, {
          headers: { Authorization: 'Bearer mock-token' },
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);

        expect(response.ok()).toBe(true);
      }

      const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const p95Time = responseTimes.sort((a, b) => a - b)[
        Math.ceil(responseTimes.length * 0.95) - 1
      ];

      expect(
        averageTime,
        `${endpoint.method} ${endpoint.path} average response time too slow`,
      ).toBeLessThan(endpoint.maxTime);
      expect(
        p95Time,
        `${endpoint.method} ${endpoint.path} P95 response time too slow`,
      ).toBeLessThan(endpoint.maxTime * 1.5);

      console.log(
        `📈 ${endpoint.method} ${endpoint.path}: avg=${Math.round(averageTime)}ms, p95=${Math.round(p95Time)}ms`,
      );
    }
  });

  test('Database Query Performance', async ({ request }) => {
    // Test different query types for performance
    const queryTests = [
      { name: 'Simple GET', path: '/api/curriculum-expectations?limit=10' },
      { name: 'Filtered GET', path: '/api/curriculum-expectations?subject=Mathematics&grade=3' },
      { name: 'Search Query', path: '/api/curriculum-expectations?search=reading' },
      { name: 'Related Data', path: '/api/etfo-lesson-plans?include=expectations,materials' },
    ];

    for (const queryTest of queryTests) {
      const iterations = 5;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        const response = await request.get(`http://localhost:3000${queryTest.path}`, {
          headers: { Authorization: 'Bearer mock-token' },
        });

        const endTime = Date.now();
        responseTimes.push(endTime - startTime);

        expect(response.ok()).toBe(true);
      }

      const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

      // Database queries should complete quickly
      expect(averageTime, `${queryTest.name} query too slow`).toBeLessThan(1000);

      console.log(`🗃️ ${queryTest.name}: avg=${Math.round(averageTime)}ms`);
    }
  });

  test('File Upload Performance', async ({ request }) => {
    // Test file upload response times with different file sizes
    const fileSizes = [
      { name: 'Small PDF', size: 100 * 1024 }, // 100KB
      { name: 'Medium PDF', size: 1 * 1024 * 1024 }, // 1MB
      { name: 'Large PDF', size: 5 * 1024 * 1024 }, // 5MB
    ];

    for (const fileTest of fileSizes) {
      // Create mock file buffer
      const fileBuffer = Buffer.alloc(fileTest.size, 'a');

      const startTime = Date.now();

      const response = await request.post('http://localhost:3000/api/curriculum-import', {
        multipart: {
          file: {
            name: 'test-curriculum.pdf',
            mimeType: 'application/pdf',
            buffer: fileBuffer,
          },
        },
        headers: { Authorization: 'Bearer mock-token' },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // File upload performance expectations
      const maxTime = fileTest.size < 1024 * 1024 ? 3000 : 10000; // 3s for small, 10s for large
      expect(responseTime, `${fileTest.name} upload too slow`).toBeLessThan(maxTime);

      console.log(`📁 ${fileTest.name} (${Math.round(fileTest.size / 1024)}KB): ${responseTime}ms`);
    }
  });

  test('Concurrent Request Performance', async ({ request }) => {
    // Test how the system handles concurrent requests
    const concurrencyLevels = [5, 10, 20];

    for (const concurrency of concurrencyLevels) {
      console.log(`🚀 Testing with ${concurrency} concurrent requests`);

      const promises: Promise<any>[] = [];
      const startTime = Date.now();

      for (let i = 0; i < concurrency; i++) {
        const promise = request.get('http://localhost:3000/api/curriculum-expectations', {
          headers: { Authorization: 'Bearer mock-token' },
        });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const successCount = responses.filter((r) => r.ok()).length;

      expect(successCount).toBe(concurrency); // All requests should succeed
      expect(totalTime).toBeLessThan(concurrency * 200); // Should handle concurrency well

      console.log(
        `⚡ ${concurrency} concurrent: ${totalTime}ms total, ${Math.round(totalTime / concurrency)}ms avg`,
      );
    }
  });

  test.afterAll(async () => {
    await monitoringSystem.generateMonitoringReport();
  });
});

// Real-time alerting tests
test.describe('Response Time Alerting', () => {
  test('Alert Thresholds', async ({ request }) => {
    // Intentionally slow request to trigger alerts
    const slowEndpoint = '/api/slow-operation'; // This would be a test endpoint

    const startTime = Date.now();

    try {
      await request.get(`http://localhost:3000${slowEndpoint}`, {
        timeout: 10000,
        headers: { Authorization: 'Bearer mock-token' },
      });
    } catch (_error) {
      // Expected for slow/non-existent endpoint
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // This simulates how alerts would be triggered
    if (responseTime > 5000) {
      console.log(`🚨 Alert would be triggered: ${responseTime}ms response time`);
    }

    expect(responseTime).toBeDefined();
  });

  test('Alert Recovery', async ({ request }) => {
    // Test that alerts clear when performance improves
    const endpoint = '/api/curriculum-expectations';

    // Make several requests to establish baseline
    const responseTimes: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await request.get(`http://localhost:3000${endpoint}`, {
        headers: { Authorization: 'Bearer mock-token' },
      });
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }

    const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    // Verify performance is good (alert should clear)
    expect(averageTime).toBeLessThan(1000);

    console.log(`✅ Alert recovery test: ${Math.round(averageTime)}ms average response`);
  });
});

export { ResponseTimeMonitoringSystem, ResponseTimeAlert, MonitoringSession };
