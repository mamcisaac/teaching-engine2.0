/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Performance Benchmark Suite
 * Comprehensive performance testing for Teaching Engine 2.0
 */

import { test, expect, Page } from '@playwright/test';
import { performance } from 'perf_hooks';
import { PERFORMANCE_BASELINES, MEMORY_THRESHOLDS } from './config';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { BenchmarkReporter } from './utils/BenchmarkReporter';

interface BenchmarkResult {
  name: string;
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    renderTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  passed: boolean;
  threshold: any;
}

class PerformanceBenchmarkSuite {
  private monitor: PerformanceMonitor;
  private reporter: BenchmarkReporter;
  private results: BenchmarkResult[] = [];

  constructor() {
    this.monitor = new PerformanceMonitor();
    this.reporter = new BenchmarkReporter();
  }

  async runPageBenchmark(page: Page, pageName: string, url: string): Promise<BenchmarkResult> {
    const threshold = PERFORMANCE_BASELINES[`${pageName}-page`];

    // Start monitoring
    await this.monitor.startMonitoring(page);

    const startTime = performance.now();

    // Navigate to page
    await page.goto(url);

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Collect Web Vitals
    const webVitals = await this.collectWebVitals(page);

    // Collect memory metrics
    const memoryMetrics = await this.monitor.getMemoryMetrics(page);

    // Stop monitoring
    await this.monitor.stopMonitoring();

    const result: BenchmarkResult = {
      name: `${pageName}-page`,
      metrics: {
        responseTime,
        memoryUsage: memoryMetrics.heapUsed / 1024 / 1024, // Convert to MB
        cpuUsage: memoryMetrics.cpuUsage,
        renderTime: webVitals.renderTime,
        firstContentfulPaint: webVitals.fcp,
        largestContentfulPaint: webVitals.lcp,
        cumulativeLayoutShift: webVitals.cls,
        firstInputDelay: webVitals.fid,
        timeToInteractive: webVitals.tti,
      },
      passed: this.evaluateThreshold(responseTime, memoryMetrics, threshold),
      threshold,
    };

    this.results.push(result);
    return result;
  }

  async runAPIBenchmark(endpoint: string, options: any = {}): Promise<BenchmarkResult> {
    const threshold = PERFORMANCE_BASELINES[`${options.method || 'GET'} ${endpoint}`];

    const startTime = performance.now();

    // Make API request
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: options.token ? `Bearer ${options.token}` : '',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Collect server metrics (mock implementation)
    const serverMetrics = await this.monitor.getServerMetrics();

    const result: BenchmarkResult = {
      name: `${options.method || 'GET'} ${endpoint}`,
      metrics: {
        responseTime,
        memoryUsage: serverMetrics.memoryUsage,
        cpuUsage: serverMetrics.cpuUsage,
        renderTime: 0, // Not applicable for API
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
      },
      passed: this.evaluateAPIThreshold(responseTime, serverMetrics, threshold),
      threshold,
    };

    this.results.push(result);
    return result;
  }

  private async collectWebVitals(page: Page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          fcp: 0,
          lcp: 0,
          cls: 0,
          fid: 0,
          tti: 0,
          renderTime: 0,
        };

        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.fcp = entries[entries.length - 1]?.startTime || 0;
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.lcp = entries[entries.length - 1]?.startTime || 0;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.fid = entries[0]?.processingStart - entries[0]?.startTime || 0;
        }).observe({ entryTypes: ['first-input'] });

        // Time to Interactive (approximation)
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'domContentLoaded') {
              vitals.tti = entry.startTime;
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });

        // Render time
        vitals.renderTime = performance.now();

        setTimeout(() => resolve(vitals), 1000);
      });
    });
  }

  private evaluateThreshold(responseTime: number, memoryMetrics: any, threshold: any): boolean {
    if (!threshold) return true;

    return (
      responseTime <= threshold.maxResponseTime &&
      memoryMetrics.heapUsed / 1024 / 1024 <= threshold.maxMemoryUsage &&
      memoryMetrics.cpuUsage <= threshold.maxCpuUsage
    );
  }

  private evaluateAPIThreshold(responseTime: number, serverMetrics: any, threshold: any): boolean {
    if (!threshold) return true;

    return (
      responseTime <= threshold.maxResponseTime &&
      serverMetrics.memoryUsage <= threshold.maxMemoryUsage &&
      serverMetrics.cpuUsage <= threshold.maxCpuUsage
    );
  }

  async generateReport(): Promise<void> {
    await this.reporter.generateReport(this.results);
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }
}

// Export singleton instance
export const benchmarkSuite = new PerformanceBenchmarkSuite();

// Playwright test implementations
test.describe('Performance Benchmarks', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate to get token for API tests
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'teacher@test.com',
        password: 'password123',
      },
    });

    const { accessToken } = await loginResponse.json();
    authToken = accessToken;
  });

  test('Dashboard Page Performance', async ({ page }) => {
    const result = await benchmarkSuite.runPageBenchmark(page, 'dashboard', '/dashboard');

    expect(result.passed, `Dashboard performance failed: ${JSON.stringify(result.metrics)}`).toBe(
      true,
    );
    expect(result.metrics.responseTime).toBeLessThan(2000);
    expect(result.metrics.largestContentfulPaint).toBeLessThan(2500);
    expect(result.metrics.cumulativeLayoutShift).toBeLessThan(0.1);
  });

  test('Lesson Plans Page Performance', async ({ page }) => {
    const result = await benchmarkSuite.runPageBenchmark(
      page,
      'lesson-plans',
      '/etfo-lesson-plans',
    );

    expect(
      result.passed,
      `Lesson plans performance failed: ${JSON.stringify(result.metrics)}`,
    ).toBe(true);
    expect(result.metrics.responseTime).toBeLessThan(1500);
    expect(result.metrics.memoryUsage).toBeLessThan(120);
  });

  test('Curriculum Import Page Performance', async ({ page }) => {
    const result = await benchmarkSuite.runPageBenchmark(
      page,
      'curriculum-import',
      '/curriculum-import',
    );

    expect(
      result.passed,
      `Curriculum import performance failed: ${JSON.stringify(result.metrics)}`,
    ).toBe(true);
    expect(result.metrics.responseTime).toBeLessThan(3000);
    expect(result.metrics.memoryUsage).toBeLessThan(200);
  });

  test('API: Get Curriculum Expectations Performance', async () => {
    const result = await benchmarkSuite.runAPIBenchmark('/api/curriculum-expectations', {
      token: authToken,
    });

    expect(result.passed, `API performance failed: ${JSON.stringify(result.metrics)}`).toBe(true);
    expect(result.metrics.responseTime).toBeLessThan(500);
    expect(result.metrics.memoryUsage).toBeLessThan(50);
  });

  test('API: Create Lesson Plan Performance', async () => {
    const result = await benchmarkSuite.runAPIBenchmark('/api/etfo-lesson-plans', {
      method: 'POST',
      token: authToken,
      body: {
        title: 'Performance Test Lesson',
        subject: 'Mathematics',
        grade: 3,
        threePartLessonPlan: {
          minds_on: 'Test minds on',
          action: 'Test action',
          consolidation: 'Test consolidation',
        },
        expectations: [],
      },
    });

    expect(result.passed, `API create performance failed: ${JSON.stringify(result.metrics)}`).toBe(
      true,
    );
    expect(result.metrics.responseTime).toBeLessThan(1000);
    expect(result.metrics.memoryUsage).toBeLessThan(100);
  });

  test.afterAll(async () => {
    await benchmarkSuite.generateReport();
  });
});

export { BenchmarkResult, PerformanceBenchmarkSuite };
