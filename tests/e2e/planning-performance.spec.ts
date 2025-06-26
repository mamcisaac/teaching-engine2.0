import { test, expect, Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

interface PerformanceMetrics {
  loadTime: number;
  ttfb: number; // Time to first byte
  fcp: number;  // First contentful paint
  lcp: number;  // Largest contentful paint
  cls: number;  // Cumulative layout shift
  fid: number;  // First input delay
  memoryUsage?: number;
  jsHeapSize?: number;
}

interface LoadTestResult {
  operation: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
}

class PerformanceTestRunner {
  constructor(private page: Page) {}

  async measurePageLoad(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Start measuring
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics from browser
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      return {
        ttfb: navigation.responseStart - navigation.requestStart,
        fcp: fcp,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      };
    });

    // Get memory usage if available
    const memoryInfo = await this.page.evaluate(() => {
      // @ts-ignore - Chrome specific API
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });

    return {
      loadTime,
      ttfb: metrics.ttfb,
      fcp: metrics.fcp,
      lcp: 0, // Would need additional instrumentation
      cls: 0, // Would need additional instrumentation
      fid: 0, // Would need additional instrumentation
      memoryUsage: memoryInfo?.usedJSHeapSize,
      jsHeapSize: memoryInfo?.totalJSHeapSize
    };
  }

  async measureOperation(operation: () => Promise<void>, iterations: number = 10): Promise<LoadTestResult> {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        await operation();
        const endTime = Date.now();
        
        times.push(endTime - startTime);
        successes++;
      } catch (error) {
        console.error(`Operation failed on iteration ${i}:`, error);
      }
    }

    return {
      operation: 'Custom Operation',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successes / iterations) * 100
    };
  }

  async measureMemoryLeak(operation: () => Promise<void>, iterations: number = 20): Promise<number[]> {
    const memoryMeasurements: number[] = [];

    for (let i = 0; i < iterations; i++) {
      await operation();
      
      // Force garbage collection if available
      if (await this.page.evaluate(() => 'gc' in window)) {
        await this.page.evaluate(() => (window as any).gc());
      }
      
      const memory = await this.page.evaluate(() => {
        // @ts-ignore
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      memoryMeasurements.push(memory);
      
      // Small delay between iterations
      await this.page.waitForTimeout(100);
    }

    return memoryMeasurements;
  }

  async measureNetworkPerformance(): Promise<any> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((acc: number, resource: any) => {
        return acc + (resource.transferSize || 0);
      }, 0);

      const totalTime = resources.reduce((acc: number, resource: any) => {
        return acc + (resource.duration || 0);
      }, 0);

      return {
        totalRequests: resources.length,
        totalSize: totalSize,
        averageTime: totalTime / resources.length,
        slowestResource: resources.reduce((slowest: any, current: any) => {
          return current.duration > (slowest?.duration || 0) ? current : slowest;
        }, null)
      };
    });
  }
}

test.describe('Planning Operations Performance Tests', () => {
  let perfRunner: PerformanceTestRunner;

  test.beforeEach(async ({ page }) => {
    perfRunner = new PerformanceTestRunner(page);
    await loginAsTestUser(page);
  });

  test.describe('Page Load Performance', () => {
    test('Planning Dashboard should load within performance budget', async ({ page }) => {
      const metrics = await perfRunner.measurePageLoad('/dashboard');
      
      // Performance budgets
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.ttfb).toBeLessThan(500); // 500ms TTFB
      expect(metrics.fcp).toBeLessThan(1500); // 1.5 seconds FCP
      
      console.log('Dashboard Load Metrics:', metrics);
    });

    test('Unit Plans page should load efficiently', async ({ page }) => {
      const metrics = await perfRunner.measurePageLoad('/planner/units');
      
      expect(metrics.loadTime).toBeLessThan(2500);
      expect(metrics.ttfb).toBeLessThan(400);
      
      console.log('Unit Plans Load Metrics:', metrics);
    });

    test('Lesson Plans page should load efficiently', async ({ page }) => {
      const metrics = await perfRunner.measurePageLoad('/planner/etfo-lessons');
      
      expect(metrics.loadTime).toBeLessThan(2500);
      expect(metrics.ttfb).toBeLessThan(400);
      
      console.log('Lesson Plans Load Metrics:', metrics);
    });
  });

  test.describe('State Management Performance', () => {
    test('Planner state save operations should be fast', async ({ page }) => {
      await page.goto('/dashboard');
      
      const saveOperation = async () => {
        await page.click('[title="Planner Settings"]');
        await page.selectOption('[data-testid="default-view"]', 'month');
        await page.click('text=Save Preferences');
        await page.waitForLoadState('networkidle');
      };

      const result = await perfRunner.measureOperation(saveOperation, 5);
      
      expect(result.averageTime).toBeLessThan(1000); // 1 second average
      expect(result.maxTime).toBeLessThan(2000); // 2 seconds max
      expect(result.successRate).toBe(100);
      
      console.log('State Save Performance:', result);
    });

    test('Undo/Redo operations should be instant', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Setup initial state
      await page.click('[title="Planner Settings"]');
      await page.selectOption('[data-testid="default-view"]', 'agenda');
      await page.click('text=Save Preferences');
      await page.waitForLoadState('networkidle');

      const undoOperation = async () => {
        await page.click('[title="Undo (Ctrl+Z)"]');
        await page.waitForTimeout(100);
      };

      const result = await perfRunner.measureOperation(undoOperation, 10);
      
      expect(result.averageTime).toBeLessThan(200); // 200ms average
      expect(result.maxTime).toBeLessThan(500); // 500ms max
      expect(result.successRate).toBe(100);
      
      console.log('Undo Operation Performance:', result);
    });

    test('Auto-save should not impact user experience', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Configure fast auto-save
      await page.click('[title="Planner Settings"]');
      await page.check('[data-testid="auto-save"]');
      await page.fill('[data-testid="auto-save-interval"]', '2');
      await page.click('text=Save Preferences');
      
      // Make rapid changes and measure impact
      const rapidChangeOperation = async () => {
        await page.click('[title="Planner Settings"]');
        await page.selectOption('[data-testid="time-slot-duration"]', '60');
        await page.waitForTimeout(100);
        await page.selectOption('[data-testid="time-slot-duration"]', '30');
        await page.waitForTimeout(100);
      };

      const result = await perfRunner.measureOperation(rapidChangeOperation, 5);
      
      // Should handle rapid changes without blocking
      expect(result.averageTime).toBeLessThan(500);
      expect(result.successRate).toBe(100);
      
      console.log('Auto-save Impact Performance:', result);
    });
  });

  test.describe('Data Operations Performance', () => {
    test('Creating lesson plans should be efficient', async ({ page }) => {
      await page.goto('/planner/etfo-lessons');
      
      const createLessonOperation = async () => {
        await page.click('[data-testid="create-lesson-button"]');
        await page.fill('[data-testid="lesson-title"]', `Performance Test Lesson ${Date.now()}`);
        await page.fill('[data-testid="lesson-date"]', '2024-03-15');
        await page.fill('[data-testid="duration"]', '60');
        await page.fill('[data-testid="minds-on"]', 'Quick warm-up activity');
        await page.fill('[data-testid="action"]', 'Main learning activity');
        await page.fill('[data-testid="consolidation"]', 'Summary and assessment');
        await page.click('[data-testid="save-lesson"]');
        await page.waitForLoadState('networkidle');
      };

      const result = await perfRunner.measureOperation(createLessonOperation, 3);
      
      expect(result.averageTime).toBeLessThan(2000); // 2 seconds average
      expect(result.successRate).toBe(100);
      
      console.log('Lesson Creation Performance:', result);
    });

    test('Curriculum coverage calculation should be fast', async ({ page }) => {
      await page.goto('/dashboard');
      
      const checkCoverageOperation = async () => {
        await page.click('text=Curriculum Coverage');
        await page.waitForSelector('[data-testid="curriculum-coverage-chart"]');
      };

      const result = await perfRunner.measureOperation(checkCoverageOperation, 5);
      
      expect(result.averageTime).toBeLessThan(1500); // 1.5 seconds average
      expect(result.successRate).toBe(100);
      
      console.log('Coverage Calculation Performance:', result);
    });
  });

  test.describe('Memory Usage & Leak Detection', () => {
    test('Extended use should not cause memory leaks', async ({ page }) => {
      await page.goto('/dashboard');
      
      const heavyOperation = async () => {
        // Open and close settings multiple times
        await page.click('[title="Planner Settings"]');
        await page.selectOption('[data-testid="default-view"]', 'month');
        await page.click('text=Cancel');
        
        // Navigate between pages
        await page.click('text=Long-Range Plans');
        await page.waitForLoadState('networkidle');
        await page.goBack();
        await page.waitForLoadState('networkidle');
      };

      const memoryMeasurements = await perfRunner.measureMemoryLeak(heavyOperation, 15);
      
      // Check for memory growth trend
      const firstMeasurement = memoryMeasurements[0];
      const lastMeasurement = memoryMeasurements[memoryMeasurements.length - 1];
      const growthRatio = lastMeasurement / firstMeasurement;
      
      expect(growthRatio).toBeLessThan(2.0); // Memory should not double
      
      console.log('Memory Usage Trend:', {
        initial: firstMeasurement,
        final: lastMeasurement,
        growthRatio,
        measurements: memoryMeasurements
      });
    });

    test('State store should manage memory efficiently', async ({ page }) => {
      await page.goto('/dashboard');
      
      const stateOperation = async () => {
        // Perform many state changes
        for (let i = 0; i < 10; i++) {
          await page.click('[title="Planner Settings"]');
          await page.selectOption('[data-testid="default-view"]', i % 2 === 0 ? 'week' : 'month');
          await page.click('text=Save Preferences');
          await page.waitForTimeout(50);
        }
      };

      const memoryBefore = await page.evaluate(() => 
        // @ts-ignore
        (performance as any).memory?.usedJSHeapSize || 0
      );

      await stateOperation();

      // Force garbage collection
      if (await page.evaluate(() => 'gc' in window)) {
        await page.evaluate(() => (window as any).gc());
      }

      const memoryAfter = await page.evaluate(() => 
        // @ts-ignore
        (performance as any).memory?.usedJSHeapSize || 0
      );

      const memoryIncrease = memoryAfter - memoryBefore;
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase

      console.log('State Memory Usage:', {
        before: memoryBefore,
        after: memoryAfter,
        increase: memoryIncrease
      });
    });
  });

  test.describe('Network Performance', () => {
    test('API calls should be optimized', async ({ page }) => {
      await page.goto('/dashboard');
      
      const networkPerf = await perfRunner.measureNetworkPerformance();
      
      expect(networkPerf.totalSize).toBeLessThan(5 * 1024 * 1024); // Less than 5MB total
      expect(networkPerf.averageTime).toBeLessThan(200); // Average request under 200ms
      
      console.log('Network Performance:', networkPerf);
    });

    test('Concurrent operations should not degrade performance', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Simulate concurrent operations
      const concurrentOperations = async () => {
        const promises = [
          page.click('text=Curriculum Coverage'),
          page.click('[title="Planner Settings"]'),
          page.click('[title="Save (Ctrl+S)"]')
        ];
        
        await Promise.all(promises);
        await page.waitForLoadState('networkidle');
      };

      const result = await perfRunner.measureOperation(concurrentOperations, 3);
      
      expect(result.averageTime).toBeLessThan(3000); // Should handle concurrency
      expect(result.successRate).toBe(100);
      
      console.log('Concurrent Operations Performance:', result);
    });
  });

  test.describe('Scalability Testing', () => {
    test('Should handle large datasets efficiently', async ({ page }) => {
      // This would require setting up test data with many lesson plans
      await page.goto('/planner/etfo-lessons');
      
      // Measure load time with large dataset
      const startTime = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds max for large datasets
      
      console.log('Large Dataset Load Time:', loadTime);
    });

    test('Filtering and search should remain fast', async ({ page }) => {
      await page.goto('/planner/etfo-lessons');
      
      const searchOperation = async () => {
        await page.fill('[data-testid="search-input"]', 'mathematics');
        await page.waitForTimeout(300); // Debounce delay
      };

      const result = await perfRunner.measureOperation(searchOperation, 5);
      
      expect(result.averageTime).toBeLessThan(500); // Search should be fast
      expect(result.successRate).toBe(100);
      
      console.log('Search Performance:', result);
    });
  });
});

test.describe('Performance Regression Testing', () => {
  test('Performance should not regress over time', async ({ page }) => {
    // This test would compare against baseline metrics
    const perfRunner = new PerformanceTestRunner(page);
    await loginAsTestUser(page);
    
    const metrics = await perfRunner.measurePageLoad('/dashboard');
    
    // These would be baseline metrics from previous runs
    const baselineMetrics = {
      loadTime: 2000,
      ttfb: 300,
      fcp: 1000
    };
    
    // Allow for some variance (10%)
    const tolerance = 0.1;
    
    expect(metrics.loadTime).toBeLessThan(baselineMetrics.loadTime * (1 + tolerance));
    expect(metrics.ttfb).toBeLessThan(baselineMetrics.ttfb * (1 + tolerance));
    expect(metrics.fcp).toBeLessThan(baselineMetrics.fcp * (1 + tolerance));
    
    console.log('Performance Regression Check:', {
      current: metrics,
      baseline: baselineMetrics,
      tolerance
    });
  });
});

// Utility to run load testing
test.describe('Load Testing', () => {
  test('Should handle multiple concurrent users', async ({ page, context }) => {
    // Simulate multiple user sessions
    const perfRunner = new PerformanceTestRunner(page);
    
    const simulateUser = async () => {
      const newPage = await context.newPage();
      await loginAsTestUser(newPage);
      await newPage.goto('/dashboard');
      
      // Perform typical user actions
      await newPage.click('[title="Planner Settings"]');
      await newPage.selectOption('[data-testid="default-view"]', 'month');
      await newPage.click('text=Save Preferences');
      
      await newPage.close();
    };

    // Run 5 concurrent user simulations
    const userPromises = Array(5).fill(null).map(() => simulateUser());
    const startTime = Date.now();
    
    await Promise.all(userPromises);
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(15000); // 15 seconds for 5 concurrent users
    
    console.log('Concurrent User Load Test:', { totalTime, userCount: 5 });
  });
});