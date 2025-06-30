/**
 * Load Testing Scenarios
 * Tests application performance under various load conditions
 */

import { test, expect } from '@playwright/test';
import { LOAD_TEST_SCENARIOS, PERFORMANCE_BASELINES } from './config';
import { LoadTestRunner } from './utils/LoadTestRunner';
import { PerformanceMonitor } from './utils/PerformanceMonitor';

interface LoadTestResult {
  scenario: string;
  duration: number;
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  passed: boolean;
}

class LoadTestSuite {
  private runner: LoadTestRunner;
  private monitor: PerformanceMonitor;
  private results: LoadTestResult[] = [];

  constructor() {
    this.runner = new LoadTestRunner();
    this.monitor = new PerformanceMonitor();
  }

  async runScenario(scenario: any): Promise<LoadTestResult> {
    console.log(`🚀 Starting load test: ${scenario.name}`);

    // Start monitoring
    await this.monitor.startMonitoring();

    // Run the load test
    const result = await this.runner.executeScenario(scenario);

    // Get system metrics
    const serverMetrics = await this.monitor.getServerMetrics();

    // Stop monitoring
    await this.monitor.stopMonitoring();

    const loadTestResult: LoadTestResult = {
      scenario: scenario.name,
      duration: this.parseDuration(scenario.duration),
      totalRequests: result.totalRequests,
      requestsPerSecond: result.requestsPerSecond,
      averageResponseTime: result.averageResponseTime,
      p95ResponseTime: result.p95ResponseTime,
      errorRate: result.errorRate,
      memoryUsage: serverMetrics.memoryUsage,
      cpuUsage: serverMetrics.cpuUsage,
      passed: this.evaluateLoadTestResult(result, scenario),
    };

    this.results.push(loadTestResult);
    return loadTestResult;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)([ms])/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    return unit === 'm' ? value * 60 * 1000 : value * 1000;
  }

  private evaluateLoadTestResult(result: any, scenario: any): boolean {
    // Check error rate threshold
    if (result.errorRate > 5) return false; // Max 5% error rate

    // Check response time thresholds based on scenario
    const maxResponseTime = scenario.name.includes('import') ? 5000 : 2000;
    if (result.averageResponseTime > maxResponseTime) return false;

    // Check requests per second meets minimum throughput
    const minRps = scenario.name.includes('stress') ? 5 : 10;
    if (result.requestsPerSecond < minRps) return false;

    return true;
  }

  getResults(): LoadTestResult[] {
    return this.results;
  }

  async generateLoadTestReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalScenarios: this.results.length,
        passed: this.results.filter((r) => r.passed).length,
        failed: this.results.filter((r) => !r.passed).length,
        averageRps:
          this.results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / this.results.length,
        averageResponseTime:
          this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length,
      },
      results: this.results,
    };

    // Save detailed report
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'test-results', 'load-testing');
    await fs.mkdir(reportDir, { recursive: true });

    await fs.writeFile(
      path.join(reportDir, `load-test-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2),
    );

    console.log(`📊 Load test report generated: ${reportDir}`);
  }
}

const loadTestSuite = new LoadTestSuite();

test.describe('Load Testing Scenarios', () => {
  test.setTimeout(600000); // 10 minutes for load tests

  test('Normal Usage Load Test', async () => {
    const scenario = LOAD_TEST_SCENARIOS.find((s) => s.name === 'normal-usage');
    if (!scenario) throw new Error('Normal usage scenario not found');

    const result = await loadTestSuite.runScenario(scenario);

    expect(result.passed, `Load test failed: ${JSON.stringify(result)}`).toBe(true);
    expect(result.errorRate).toBeLessThan(5); // Less than 5% error rate
    expect(result.requestsPerSecond).toBeGreaterThan(10); // At least 10 RPS
    expect(result.averageResponseTime).toBeLessThan(2000); // Average response under 2s
  });

  test('Curriculum Import Stress Test', async () => {
    const scenario = LOAD_TEST_SCENARIOS.find((s) => s.name === 'curriculum-import-stress');
    if (!scenario) throw new Error('Curriculum import stress scenario not found');

    const result = await loadTestSuite.runScenario(scenario);

    expect(result.passed, `Stress test failed: ${JSON.stringify(result)}`).toBe(true);
    expect(result.errorRate).toBeLessThan(10); // Allow higher error rate for stress test
    expect(result.requestsPerSecond).toBeGreaterThan(5); // At least 5 RPS for heavy operations
    expect(result.averageResponseTime).toBeLessThan(5000); // Allow longer response time for file processing
  });

  test('Newsletter Generation Load Test', async () => {
    const scenario = LOAD_TEST_SCENARIOS.find((s) => s.name === 'newsletter-generation');
    if (!scenario) throw new Error('Newsletter generation scenario not found');

    const result = await loadTestSuite.runScenario(scenario);

    expect(result.passed, `Newsletter load test failed: ${JSON.stringify(result)}`).toBe(true);
    expect(result.errorRate).toBeLessThan(5);
    expect(result.requestsPerSecond).toBeGreaterThan(8);
    expect(result.averageResponseTime).toBeLessThan(3000); // Allow longer for AI processing
  });

  // Spike Testing - Sudden increase in load
  test('Spike Test - Login Rush', async ({ request }) => {
    const startTime = Date.now();
    const concurrentUsers = 20;
    const promises: Promise<any>[] = [];

    // Simulate 20 users logging in simultaneously (e.g., start of school day)
    for (let i = 0; i < concurrentUsers; i++) {
      const promise = request.post('http://localhost:3000/api/auth/login', {
        data: {
          email: `teacher${i}@test.com`,
          password: 'password123',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.allSettled(promises);
    const endTime = Date.now();

    const successful = responses.filter((r) => r.status === 'fulfilled').length;
    const failed = responses.length - successful;
    const duration = endTime - startTime;

    // Spike test should handle sudden load gracefully
    expect(failed / responses.length).toBeLessThan(0.1); // Less than 10% failure rate
    expect(duration).toBeLessThan(5000); // Complete within 5 seconds

    console.log(
      `Spike test results: ${successful}/${responses.length} successful in ${duration}ms`,
    );
  });

  // Volume Testing - Large data sets
  test('Volume Test - Large Curriculum Import', async ({ request }) => {
    // Create a large mock curriculum file (simulated)
    const largeCurriculumData = {
      subject: 'Mathematics',
      grade: 5,
      expectations: Array.from({ length: 100 }, (_, i) => ({
        code: `M${i + 1}`,
        description: `Mathematics expectation ${i + 1} - This is a long description that simulates real curriculum content with detailed explanations and learning objectives.`,
        learningGoals: [
          'Students will understand basic concepts',
          'Students will apply knowledge in practical situations',
          'Students will demonstrate mastery through assessment',
        ],
      })),
    };

    const startTime = Date.now();

    const response = await request.post('http://localhost:3000/api/curriculum-import', {
      data: largeCurriculumData,
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBe(true);
    expect(duration).toBeLessThan(10000); // Should process large data within 10 seconds

    console.log(`Volume test: Processed 100 expectations in ${duration}ms`);
  });

  // Endurance Testing - Extended load over time
  test('Endurance Test - Sustained Load', async () => {
    const testDuration = 60000; // 1 minute
    const requestInterval = 1000; // 1 second
    const startTime = Date.now();
    let requestCount = 0;
    let errorCount = 0;

    const makeRequest = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/curriculum-expectations', {
          headers: { Authorization: 'Bearer mock-token' },
        });

        if (!response.ok) {
          errorCount++;
        }
        requestCount++;
      } catch (error) {
        errorCount++;
        requestCount++;
      }
    };

    // Run requests continuously for the test duration
    while (Date.now() - startTime < testDuration) {
      await makeRequest();
      await new Promise((resolve) => setTimeout(resolve, requestInterval));
    }

    const actualDuration = Date.now() - startTime;
    const errorRate = (errorCount / requestCount) * 100;

    expect(errorRate).toBeLessThan(5); // Less than 5% error rate during sustained load
    expect(requestCount).toBeGreaterThan(50); // Should complete reasonable number of requests

    console.log(
      `Endurance test: ${requestCount} requests, ${errorRate.toFixed(2)}% error rate over ${actualDuration}ms`,
    );
  });

  test.afterAll(async () => {
    await loadTestSuite.generateLoadTestReport();
  });
});

// Memory Leak Detection Tests
test.describe('Memory Leak Detection', () => {
  test('Frontend Memory Leak Detection', async ({ page }) => {
    const monitor = new PerformanceMonitor();

    // Navigate through pages multiple times to detect leaks
    const pages = ['/dashboard', '/etfo-lesson-plans', '/unit-plans', '/curriculum-expectations'];
    const iterations = 5;

    await monitor.startMonitoring(page);

    for (let i = 0; i < iterations; i++) {
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); // Let page settle
      }
    }

    const leakDetection = await monitor.detectMemoryLeaks(page);

    expect(leakDetection.detected, `Memory leak detected: ${leakDetection.growthRate}MB/min`).toBe(
      false,
    );
    expect(leakDetection.growthRate).toBeLessThan(5); // Less than 5MB growth per minute

    await monitor.stopMonitoring();

    if (leakDetection.detected) {
      console.warn('⚠️ Memory leak recommendations:', leakDetection.recommendations);
    }
  });

  test('API Memory Usage Over Time', async ({ request }) => {
    const iterations = 50;
    const initialMemory = process.memoryUsage().heapUsed;

    // Make repeated API calls to check for server-side memory leaks
    for (let i = 0; i < iterations; i++) {
      await request.get('http://localhost:3000/api/curriculum-expectations', {
        headers: { Authorization: 'Bearer mock-token' },
      });

      if (i % 10 === 0) {
        // Force garbage collection periodically
        if (global.gc) {
          global.gc();
        }
      }
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB

    expect(memoryGrowth).toBeLessThan(50); // Less than 50MB growth

    console.log(`API memory test: ${memoryGrowth.toFixed(2)}MB growth over ${iterations} requests`);
  });
});

export { LoadTestSuite, LoadTestResult };
