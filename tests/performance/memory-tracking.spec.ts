/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Memory Usage Tracking and Alerts
 * Comprehensive memory monitoring for both frontend and backend
 */

import { test, expect, Page } from '@playwright/test';
import { MemoryTracker } from './utils/MemoryTracker';
import { MEMORY_THRESHOLDS, PERFORMANCE_ALERTS } from './config';

interface MemoryAlert {
  type: 'memory_leak' | 'high_usage' | 'gc_inefficiency' | 'heap_overflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentUsage: number;
  threshold: number;
  component: 'frontend' | 'backend' | 'database';
  timestamp: string;
  recommendations: string[];
}

interface MemorySession {
  sessionId: string;
  startTime: string;
  duration: number;
  component: 'frontend' | 'backend' | 'database';
  measurements: Array<{
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    gcCount?: number;
    gcDuration?: number;
  }>;
  alerts: MemoryAlert[];
  leakDetected: boolean;
  peakUsage: number;
  averageUsage: number;
}

class MemoryTrackingSystem {
  private tracker: MemoryTracker;
  private sessions: MemorySession[] = [];
  private alerts: MemoryAlert[] = [];

  constructor() {
    this.tracker = new MemoryTracker();
  }

  async startMemorySession(
    component: 'frontend' | 'backend' | 'database',
    duration: number = 300000,
  ): Promise<MemorySession> {
    const sessionId = `memory-${component}-${Date.now()}`;
    console.log(`🔍 Starting memory tracking session: ${sessionId}`);

    const session: MemorySession = {
      sessionId,
      startTime: new Date().toISOString(),
      duration,
      component,
      measurements: [],
      alerts: [],
      leakDetected: false,
      peakUsage: 0,
      averageUsage: 0,
    };

    if (component === 'frontend') {
      // Frontend memory tracking will be handled in browser context
      session.measurements = await this.tracker.trackFrontendMemory(duration);
    } else if (component === 'backend') {
      session.measurements = await this.tracker.trackBackendMemory(duration);
    } else if (component === 'database') {
      session.measurements = await this.tracker.trackDatabaseMemory(duration);
    }

    // Analyze measurements for leaks and alerts
    session.leakDetected = this.detectMemoryLeak(session.measurements);
    session.peakUsage = Math.max(...session.measurements.map((m) => m.heapUsed));
    session.averageUsage =
      session.measurements.reduce((sum, m) => sum + m.heapUsed, 0) / session.measurements.length;

    // Generate alerts
    session.alerts = this.analyzeMemoryAlerts(session);
    this.alerts.push(...session.alerts);

    this.sessions.push(session);
    return session;
  }

  private detectMemoryLeak(measurements: MemorySession['measurements']): boolean {
    if (measurements.length < 10) return false;

    // Calculate memory growth trend
    const firstHalf = measurements.slice(0, Math.floor(measurements.length / 2));
    const secondHalf = measurements.slice(Math.floor(measurements.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.heapUsed, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.heapUsed, 0) / secondHalf.length;

    const growthRate = ((secondAvg - firstAvg) / firstAvg) * 100;

    // Memory leak if growth rate > 50% and absolute growth > 50MB
    return growthRate > 50 && secondAvg - firstAvg > 50 * 1024 * 1024;
  }

  private analyzeMemoryAlerts(session: MemorySession): MemoryAlert[] {
    const alerts: MemoryAlert[] = [];
    const thresholds = MEMORY_THRESHOLDS;

    // Check for high memory usage
    if (session.peakUsage > thresholds.peakUsage * 1024 * 1024) {
      alerts.push({
        type: 'high_usage',
        severity: 'high',
        currentUsage: session.peakUsage / 1024 / 1024,
        threshold: thresholds.peakUsage,
        component: session.component,
        timestamp: new Date().toISOString(),
        recommendations: [
          'Review large object allocations',
          'Implement pagination for large datasets',
          'Consider data streaming for file operations',
        ],
      });
    }

    // Check for memory leaks
    if (session.leakDetected) {
      alerts.push({
        type: 'memory_leak',
        severity: 'critical',
        currentUsage: session.averageUsage / 1024 / 1024,
        threshold: thresholds.maxGrowthRate,
        component: session.component,
        timestamp: new Date().toISOString(),
        recommendations: [
          'Review event listener cleanup',
          'Check for circular references',
          'Implement proper component unmounting',
          'Clear intervals and timeouts',
        ],
      });
    }

    // Check GC efficiency (for backend)
    if (session.component === 'backend') {
      const gcMeasurements = session.measurements.filter((m) => m.gcCount !== undefined);
      if (gcMeasurements.length > 0) {
        const avgGcDuration =
          gcMeasurements.reduce((sum, m) => sum + (m.gcDuration || 0), 0) / gcMeasurements.length;

        if (avgGcDuration > 100) {
          // More than 100ms average GC time
          alerts.push({
            type: 'gc_inefficiency',
            severity: 'medium',
            currentUsage: avgGcDuration,
            threshold: 100,
            component: session.component,
            timestamp: new Date().toISOString(),
            recommendations: [
              'Reduce object allocations in hot paths',
              'Use object pooling for frequently created objects',
              'Review large object handling',
            ],
          });
        }
      }
    }

    return alerts;
  }

  async generateMemoryReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSessions: this.sessions.length,
        leaksDetected: this.sessions.filter((_s) => s.leakDetected).length,
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter((a) => a.severity === 'critical').length,
        peakUsageOverall: Math.max(...this.sessions.map((_s) => s.peakUsage)) / 1024 / 1024,
      },
      sessions: this.sessions,
      alerts: this.alerts,
      recommendations: this.generateMemoryRecommendations(),
    };

    // Save memory report
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'test-results', 'memory-tracking');
    await fs.mkdir(reportDir, { recursive: true });

    await fs.writeFile(
      path.join(reportDir, `memory-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2),
    );

    console.log(`🧠 Memory tracking report generated: ${reportDir}`);
  }

  private generateMemoryRecommendations(): string[] {
    const recommendations: string[] = [];
    const leakSessions = this.sessions.filter((_s) => s.leakDetected);
    const criticalAlerts = this.alerts.filter((a) => a.severity === 'critical');

    if (leakSessions.length > 0) {
      recommendations.push(
        `🚨 Memory leaks detected in ${leakSessions.length} sessions. Immediate investigation required.`,
      );
    }

    if (criticalAlerts.length > 0) {
      recommendations.push(
        `⚠️ ${criticalAlerts.length} critical memory alerts. Review memory management practices.`,
      );
    }

    // Component-specific recommendations
    const frontendSessions = this.sessions.filter((_s) => s.component === 'frontend');
    const backendSessions = this.sessions.filter((_s) => s.component === 'backend');

    if (frontendSessions.some((s) => s.peakUsage > 200 * 1024 * 1024)) {
      recommendations.push(
        '🌐 Frontend memory usage is high. Consider lazy loading and component optimization.',
      );
    }

    if (backendSessions.some((s) => s.peakUsage > 500 * 1024 * 1024)) {
      recommendations.push(
        '⚙️ Backend memory usage is high. Review data processing and caching strategies.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '✅ Memory usage is within acceptable parameters across all components.',
      );
    }

    return recommendations;
  }

  getAlerts(): MemoryAlert[] {
    return this.alerts;
  }

  getSessions(): MemorySession[] {
    return this.sessions;
  }
}

const memorySystem = new MemoryTrackingSystem();

test.describe('Memory Usage Tracking', () => {
  test.setTimeout(600000); // 10 minutes for memory tracking

  test('Frontend Memory Tracking', async ({ page }) => {
    // Navigate through different pages to track memory usage
    const pages = [
      '/dashboard',
      '/etfo-lesson-plans',
      '/unit-plans',
      '/curriculum-expectations',
      '/parent-newsletter',
    ];

    // Inject memory tracking script
    await page.addInitScript(() => {
      (window as any).memoryTracker = {
        measurements: [],
        startTracking: function () {
          const interval = setInterval(() => {
            if ((performance as any).memory) {
              this.measurements.push({
                timestamp: Date.now(),
                heapUsed: (performance as any).memory.usedJSHeapSize,
                heapTotal: (performance as any).memory.totalJSHeapSize,
                heapLimit: (performance as any).memory.jsHeapSizeLimit,
              });
            }
          }, 1000);

          setTimeout(() => clearInterval(interval), 60000); // Track for 1 minute
        },
      };
    });

    await page.goto('/dashboard');
    await page.evaluate(() => (window as any).memoryTracker.startTracking());

    // Navigate through pages to stress test memory
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000); // Let page settle

      // Interact with page elements to trigger more memory usage
      await page
        .locator('button, input, select')
        .first()
        .click()
        .catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(5000); // Wait for GC

    // Get memory measurements
    const measurements = await page.evaluate(() => {
      return (window as any).memoryTracker.measurements;
    });

    expect(measurements.length).toBeGreaterThan(0);

    // Check for memory leaks
    if (measurements.length >= 10) {
      const [firstMeasurement] = measurements;
      const lastMeasurement = measurements[measurements.length - 1];
      const memoryGrowth = lastMeasurement.heapUsed - firstMeasurement.heapUsed;
      const growthMB = memoryGrowth / 1024 / 1024;

      expect(growthMB, `Memory leak detected: ${growthMB.toFixed(2)}MB growth`).toBeLessThan(100);
      console.log(
        `📊 Frontend memory usage: ${growthMB.toFixed(2)}MB growth over ${measurements.length} measurements`,
      );
    }

    // Check peak memory usage
    const peakUsage = Math.max(...measurements.map((m: any) => m.heapUsed));
    const peakUsageMB = peakUsage / 1024 / 1024;

    expect(peakUsageMB, `Peak memory usage too high: ${peakUsageMB.toFixed(2)}MB`).toBeLessThan(
      150,
    );
  });

  test('Backend Memory Tracking', async ({ request }) => {
    const session = await memorySystem.startMemorySession('backend', 60000);

    // Make various API calls to stress backend memory
    const endpoints = [
      { path: '/api/curriculum-expectations', method: 'GET' },
      { path: '/api/etfo-lesson-plans', method: 'GET' },
      { path: '/api/unit-plans', method: 'GET' },
      // Student endpoint removed - app does not store student data
    ];

    // Simulate load by making repeated requests
    for (let i = 0; i < 50; i++) {
      const endpoint = endpoints[i % endpoints.length];

      try {
        await request.get(`http://localhost:3000${endpoint.path}`, {
          headers: { Authorization: 'Bearer mock-token' },
        });
      } catch (_error) {
        // Continue on error
      }

      // Force garbage collection periodically
      if (i % 10 === 0 && global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(session.measurements.length).toBeGreaterThan(0);
    expect(session.leakDetected, `Memory leak detected in backend session`).toBe(false);

    const peakUsageMB = session.peakUsage / 1024 / 1024;
    expect(
      peakUsageMB,
      `Backend peak memory usage too high: ${peakUsageMB.toFixed(2)}MB`,
    ).toBeLessThan(300);

    console.log(
      `⚙️ Backend memory: peak=${peakUsageMB.toFixed(2)}MB, avg=${(session.averageUsage / 1024 / 1024).toFixed(2)}MB`,
    );
  });

  test('Large Data Processing Memory Test', async ({ request }) => {
    // Test memory usage during large data processing operations
    const startMemory = process.memoryUsage();

    // Simulate large curriculum import
    const largeCurriculumData = {
      subject: 'Mathematics',
      grade: 5,
      expectations: Array.from({ length: 500 }, (_, i) => ({
        code: `M${i + 1}`,
        description: `Mathematics expectation ${i + 1} - `.repeat(20), // Large description
        learningGoals: Array.from(
          { length: 10 },
          (_, j) => `Learning goal ${j + 1} for expectation ${i + 1}`,
        ),
      })),
    };

    try {
      await request.post('http://localhost:3000/api/curriculum-import', {
        data: largeCurriculumData,
        headers: { Authorization: 'Bearer mock-token' },
      });
    } catch (_error) {
      // Test is about memory usage, not functionality
    }

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const endMemory = process.memoryUsage();
    const memoryGrowth = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;

    expect(
      memoryGrowth,
      `Excessive memory growth during large data processing: ${memoryGrowth.toFixed(2)}MB`,
    ).toBeLessThan(100);

    console.log(`📊 Large data processing memory growth: ${memoryGrowth.toFixed(2)}MB`);
  });

  test('File Upload Memory Test', async ({ request }) => {
    // Test memory usage during file upload operations
    const fileSizes = [1, 5, 10]; // MB

    for (const sizeMB of fileSizes) {
      const startMemory = process.memoryUsage();

      // Create mock file buffer
      const fileBuffer = Buffer.alloc(sizeMB * 1024 * 1024, 'a');

      try {
        await request.post('http://localhost:3000/api/curriculum-import', {
          multipart: {
            file: {
              name: `test-${sizeMB}mb.pdf`,
              mimeType: 'application/pdf',
              buffer: fileBuffer,
            },
          },
          headers: { Authorization: 'Bearer mock-token' },
        });
      } catch (_error) {
        // Test is about memory usage, not functionality
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const endMemory = process.memoryUsage();
      const memoryGrowth = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;

      // Memory growth should be proportional but not excessive
      const expectedMaxGrowth = sizeMB * 2; // Allow 2x the file size for processing
      expect(
        memoryGrowth,
        `Excessive memory growth for ${sizeMB}MB file: ${memoryGrowth.toFixed(2)}MB`,
      ).toBeLessThan(expectedMaxGrowth);

      console.log(`📁 File upload ${sizeMB}MB: memory growth ${memoryGrowth.toFixed(2)}MB`);
    }
  });

  test('Concurrent Operations Memory Stress', async ({ page, request }) => {
    // Test memory under concurrent frontend and backend operations
    const startTime = Date.now();

    // Start frontend memory tracking
    await page.goto('/dashboard');
    await page.addInitScript(() => {
      (window as any).concurrentMemoryTracker = {
        measurements: [],
        track: function () {
          const measurement = {
            timestamp: Date.now(),
            heapUsed: (performance as any).memory?.usedJSHeapSize ?? 0,
          };
          this.measurements.push(measurement);
        },
      };

      setInterval(() => {
        (window as any).concurrentMemoryTracker.track();
      }, 1000);
    });

    const promises: Promise<any>[] = [];

    // Frontend operations
    promises.push(
      (async () => {
        const pages = ['/etfo-lesson-plans', '/unit-plans', '/curriculum-expectations'];
        for (let i = 0; i < 10; i++) {
          await page.goto(pages[i % pages.length]);
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(500);
        }
      })(),
    );

    // Backend operations
    promises.push(
      (async () => {
        for (let i = 0; i < 20; i++) {
          await request
            .get('http://localhost:3000/api/curriculum-expectations', {
              headers: { Authorization: 'Bearer mock-token' },
            })
            .catch(() => {});
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      })(),
    );

    await Promise.all(promises);

    const measurements = await page.evaluate(() => {
      return (window as any).concurrentMemoryTracker.measurements;
    });

    if (measurements.length >= 2) {
      const [firstMeasurement] = measurements;
      const lastMeasurement = measurements[measurements.length - 1];
      const memoryGrowth = lastMeasurement.heapUsed - firstMeasurement.heapUsed;
      const growthMB = memoryGrowth / 1024 / 1024;

      expect(
        growthMB,
        `Excessive memory growth under concurrent load: ${growthMB.toFixed(2)}MB`,
      ).toBeLessThan(150);
      console.log(`⚡ Concurrent operations memory growth: ${growthMB.toFixed(2)}MB`);
    }
  });

  test.afterAll(async () => {
    await memorySystem.generateMemoryReport();
  });
});

// Memory leak detection tests
test.describe('Memory Leak Detection', () => {
  test('Component Mount/Unmount Cycles', async ({ page }) => {
    // Test for memory leaks in component lifecycle
    await page.goto('/etfo-lesson-plans');

    await page.addInitScript(() => {
      (window as any).leakDetector = {
        initialMemory: 0,
        measurements: [],
        startDetection: function () {
          this.initialMemory = (performance as any).memory?.usedJSHeapSize ?? 0;

          const interval = setInterval(() => {
            const currentMemory = (performance as any).memory?.usedJSHeapSize ?? 0;
            this.measurements.push({
              timestamp: Date.now(),
              memory: currentMemory,
              growth: currentMemory - this.initialMemory,
            });
          }, 500);

          setTimeout(() => clearInterval(interval), 30000); // 30 seconds
        },
      };
    });

    await page.evaluate(() => (window as any).leakDetector.startDetection());

    // Simulate rapid component mounting/unmounting
    for (let i = 0; i < 20; i++) {
      // Navigate to trigger component unmounting/mounting
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.goto('/etfo-lesson-plans');
      await page.waitForLoadState('domcontentloaded');

      // Brief pause
      await page.waitForTimeout(100);
    }

    // Force garbage collection
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(3000); // Wait for GC

    const results = await page.evaluate(() => {
      return (window as any).leakDetector.measurements;
    });

    if (results.length >= 10) {
      const lastResult = results[results.length - 1];
      const finalGrowth = lastResult.growth;
      const growthMB = finalGrowth / 1024 / 1024;

      expect(
        growthMB,
        `Component lifecycle memory leak detected: ${growthMB.toFixed(2)}MB`,
      ).toBeLessThan(50);
      console.log(`🔄 Component lifecycle memory growth: ${growthMB.toFixed(2)}MB`);
    }
  });
});

export { MemoryTrackingSystem, MemoryAlert, MemorySession };
