/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Response Time Monitor
 * Real-time monitoring and tracking of API response times
 */

import { performance } from 'perf_hooks';

interface EndpointMetrics {
  path: string;
  method: string;
  requestCount: number;
  responseTimes: number[];
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorCount: number;
  errorRate: number;
  lastUpdated: string;
}

interface MonitoringConfig {
  baseUrl: string;
  authToken?: string;
  requestInterval: number; // ms between requests
  alertThreshold: number; // ms
  maxRetries: number;
}

interface RequestResult {
  responseTime: number;
  success: boolean;
  statusCode?: number;
  error?: string;
  timestamp: number;
}

export class ResponseTimeMonitor {
  private config: MonitoringConfig;
  private endpointMetrics: Map<string, EndpointMetrics> = new Map();
  private isMonitoring: boolean = false;
  private monitoringIntervals: Set<NodeJS.Timeout> = new Set();

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      requestInterval: 5000, // 5 seconds
      alertThreshold: 2000, // 2 seconds
      maxRetries: 3,
      ...config,
    };
  }

  async startContinuousMonitoring(duration: number = 300000): Promise<void> {
    this.isMonitoring = true;
    console.log(`🔍 Starting continuous monitoring for ${duration}ms`);

    // Set up monitoring to stop after duration
    setTimeout(() => {
      this.stopMonitoring();
    }, duration);
  }

  stopMonitoring(): void {
    this.isMonitoring = false;

    // Clear all monitoring intervals
    this.monitoringIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.monitoringIntervals.clear();

    console.log('🛑 Response time monitoring stopped');
  }

  async monitorEndpoint(
    path: string,
    method: string = 'GET',
    duration: number = 60000,
  ): Promise<EndpointMetrics> {
    const endpointKey = `${method.toUpperCase()} ${path}`;

    if (!this.endpointMetrics.has(endpointKey)) {
      this.initializeEndpointMetrics(path, method);
    }

    const startTime = Date.now();
    const endTime = startTime + duration;

    console.log(`📊 Monitoring ${endpointKey} for ${duration}ms`);

    while (Date.now() < endTime && this.isMonitoring) {
      const result = await this.makeMonitoringRequest(path, method);
      this.updateEndpointMetrics(endpointKey, result);

      // Wait before next request
      await this.delay(this.config.requestInterval);
    }

    return this.endpointMetrics.get(endpointKey)!;
  }

  private initializeEndpointMetrics(path: string, method: string): void {
    const endpointKey = `${method.toUpperCase()} ${path}`;

    const metrics: EndpointMetrics = {
      path,
      method: method.toUpperCase(),
      requestCount: 0,
      responseTimes: [],
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorCount: 0,
      errorRate: 0,
      lastUpdated: new Date().toISOString(),
    };

    this.endpointMetrics.set(endpointKey, metrics);
  }

  private async makeMonitoringRequest(path: string, method: string): Promise<RequestResult> {
    const url = `${this.config.baseUrl}${path}`;
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }

      const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers,
      };

      // Add test data for POST requests
      if (method.toUpperCase() === 'POST') {
        requestOptions.body = JSON.stringify(this.getTestData(path));
      }

      const response = await fetch(url, requestOptions);
      const endTime = performance.now();

      return {
        responseTime: endTime - startTime,
        success: response.ok,
        statusCode: response.status,
        timestamp: Date.now(),
      };
    } catch (_error) {
      const endTime = performance.now();

      return {
        responseTime: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  private getTestData(path: string): any {
    // Return appropriate test data based on endpoint
    switch (path) {
      case '/api/etfo-lesson-plans':
        return {
          title: 'Monitor Test Lesson',
          subject: 'Mathematics',
          grade: 3,
          threePartLessonPlan: {
            minds_on: 'Test minds on',
            action: 'Test action',
            consolidation: 'Test consolidation',
          },
          expectations: [],
        };
      case '/api/curriculum-import':
        return {
          subject: 'Mathematics',
          grade: 3,
          expectations: [
            {
              code: 'M1',
              description: 'Test expectation for monitoring',
              learningGoals: ['Test goal'],
            },
          ],
        };
      default:
        return {};
    }
  }

  private updateEndpointMetrics(endpointKey: string, result: RequestResult): void {
    const metrics = this.endpointMetrics.get(endpointKey)!;

    metrics.requestCount++;
    metrics.responseTimes.push(result.responseTime);

    if (!result.success) {
      metrics.errorCount++;
    }

    // Update calculations
    metrics.averageResponseTime =
      metrics.responseTimes.reduce((sum, time) => sum + time, 0) / metrics.responseTimes.length;
    metrics.minResponseTime = Math.min(metrics.minResponseTime, result.responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, result.responseTime);
    metrics.errorRate = (metrics.errorCount / metrics.requestCount) * 100;

    // Calculate percentiles
    const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.ceil(sortedTimes.length * 0.95) - 1;
    const p99Index = Math.ceil(sortedTimes.length * 0.99) - 1;

    metrics.p95ResponseTime = sortedTimes[p95Index] || 0;
    metrics.p99ResponseTime = sortedTimes[p99Index] || 0;
    metrics.lastUpdated = new Date().toISOString();

    // Check for alerts
    if (result.responseTime > this.config.alertThreshold) {
      this.triggerAlert(endpointKey, result.responseTime);
    }

    this.endpointMetrics.set(endpointKey, metrics);
  }

  private triggerAlert(endpointKey: string, responseTime: number): void {
    const severity = this.calculateAlertSeverity(responseTime);
    console.warn(
      `🚨 [${severity.toUpperCase()}] Response time alert: ${endpointKey} - ${Math.round(responseTime)}ms`,
    );

    // In a real implementation, this would send notifications
    // to monitoring systems like Slack, PagerDuty, etc.
  }

  private calculateAlertSeverity(responseTime: number): string {
    const ratio = responseTime / this.config.alertThreshold;

    if (ratio >= 5) return 'critical';
    if (ratio >= 3) return 'high';
    if (ratio >= 2) return 'medium';
    return 'low';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getEndpointMetrics(path: string, method: string): EndpointMetrics {
    const endpointKey = `${method.toUpperCase()} ${path}`;
    return this.endpointMetrics.get(endpointKey) || this.createEmptyMetrics(path, method);
  }

  private createEmptyMetrics(path: string, method: string): EndpointMetrics {
    return {
      path,
      method: method.toUpperCase(),
      requestCount: 0,
      responseTimes: [],
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorCount: 0,
      errorRate: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  getAllMetrics(): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values());
  }

  getSlowEndpoints(threshold: number = 1000): EndpointMetrics[] {
    return this.getAllMetrics().filter((metrics) => metrics.averageResponseTime > threshold);
  }

  getErrorProneEndpoints(errorRateThreshold: number = 5): EndpointMetrics[] {
    return this.getAllMetrics().filter((metrics) => metrics.errorRate > errorRateThreshold);
  }

  async runHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      totalEndpoints: number;
      slowEndpoints: number;
      errorProneEndpoints: number;
      averageResponseTime: number;
      maxResponseTime: number;
    };
    issues: string[];
  }> {
    const allMetrics = this.getAllMetrics();
    const slowEndpoints = this.getSlowEndpoints();
    const errorProneEndpoints = this.getErrorProneEndpoints();

    const totalResponseTime = allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0);
    const averageResponseTime = allMetrics.length > 0 ? totalResponseTime / allMetrics.length : 0;
    const maxResponseTime = Math.max(...allMetrics.map((m) => m.maxResponseTime), 0);

    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (slowEndpoints.length > 0) {
      issues.push(`${slowEndpoints.length} endpoints are responding slowly`);
      status = 'warning';
    }

    if (errorProneEndpoints.length > 0) {
      issues.push(`${errorProneEndpoints.length} endpoints have high error rates`);
      status = 'warning';
    }

    if (averageResponseTime > 2000) {
      issues.push('Overall average response time is too high');
      status = 'critical';
    }

    if (maxResponseTime > 10000) {
      issues.push('Some endpoints are extremely slow (>10s)');
      status = 'critical';
    }

    return {
      status,
      metrics: {
        totalEndpoints: allMetrics.length,
        slowEndpoints: slowEndpoints.length,
        errorProneEndpoints: errorProneEndpoints.length,
        averageResponseTime: Math.round(averageResponseTime),
        maxResponseTime: Math.round(maxResponseTime),
      },
      issues,
    };
  }

  async generatePerformanceReport(): Promise<{
    timestamp: string;
    summary: any;
    endpoints: EndpointMetrics[];
    recommendations: string[];
  }> {
    const healthCheck = await this.runHealthCheck();
    const allMetrics = this.getAllMetrics();

    const recommendations: string[] = [];

    if (healthCheck.status === 'critical') {
      recommendations.push(
        '🚨 Critical performance issues detected. Immediate optimization required.',
      );
    }

    const slowEndpoints = this.getSlowEndpoints();
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `⚡ Optimize slow endpoints: ${slowEndpoints.map((e) => `${e.method} ${e.path}`).join(', ')}`,
      );
    }

    const errorProneEndpoints = this.getErrorProneEndpoints();
    if (errorProneEndpoints.length > 0) {
      recommendations.push(
        `🔧 Fix error-prone endpoints: ${errorProneEndpoints.map((e) => `${e.method} ${e.path}`).join(', ')}`,
      );
    }

    // Identify endpoints with high variability
    const highVariabilityEndpoints = allMetrics.filter((m) => {
      const variance = m.maxResponseTime - m.minResponseTime;
      return variance > 2000; // More than 2 second variance
    });

    if (highVariabilityEndpoints.length > 0) {
      recommendations.push(
        `📊 High response time variability detected in: ${highVariabilityEndpoints.map((e) => `${e.method} ${e.path}`).join(', ')}`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All endpoints are performing within acceptable parameters.');
    }

    return {
      timestamp: new Date().toISOString(),
      summary: healthCheck,
      endpoints: allMetrics,
      recommendations,
    };
  }

  // Stress testing capabilities
  async stressTestEndpoint(
    path: string,
    method: string = 'GET',
    options: {
      concurrency: number;
      duration: number;
      rampUpTime: number;
    },
  ): Promise<{
    totalRequests: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    maxResponseTime: number;
    errorRate: number;
    responseTimeDistribution: number[];
  }> {
    console.log(`🔥 Stress testing ${method.toUpperCase()} ${path}`);

    const results: RequestResult[] = [];
    const startTime = Date.now();
    const endTime = startTime + options.duration;

    // Calculate requests per interval for ramp-up
    const rampUpIntervals = 10;
    const rampUpStepDuration = options.rampUpTime / rampUpIntervals;
    const maxConcurrentRequests = options.concurrency;

    while (Date.now() < endTime) {
      const elapsed = Date.now() - startTime;
      const currentConcurrency =
        elapsed < options.rampUpTime
          ? Math.ceil((elapsed / options.rampUpTime) * maxConcurrentRequests)
          : maxConcurrentRequests;

      // Launch concurrent requests
      const promises: Promise<RequestResult>[] = [];
      for (let i = 0; i < currentConcurrency; i++) {
        promises.push(this.makeMonitoringRequest(path, method));
      }

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Brief pause between batches
      await this.delay(100);
    }

    // Calculate metrics
    const totalDuration = Date.now() - startTime;
    const successfulRequests = results.filter((r) => r.success);
    const responseTimes = successfulRequests.map((r) => r.responseTime);

    return {
      totalRequests: results.length,
      requestsPerSecond: (results.length / totalDuration) * 1000,
      averageResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      errorRate: ((results.length - successfulRequests.length) / results.length) * 100,
      responseTimeDistribution: responseTimes.sort((a, b) => a - b),
    };
  }
}
