/**
 * Test Performance Monitoring Utility
 * Tracks and reports on test execution performance
 */

import { performance } from 'perf_hooks';

interface TestMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryStart: NodeJS.MemoryUsage;
  memoryEnd?: NodeJS.MemoryUsage;
  memoryDelta?: number;
  status?: 'passed' | 'failed' | 'skipped';
}

interface PerformanceReport {
  totalTests: number;
  totalDuration: number;
  averageDuration: number;
  slowestTests: TestMetric[];
  memoryLeaks: TestMetric[];
  failedTests: TestMetric[];
}

export class TestPerformanceMonitor {
  private static testMetrics = new Map<string, TestMetric>();
  private static suiteStartTime = performance.now();
  private static enabled = process.env.MONITOR_TEST_PERFORMANCE === 'true';
  
  static startTest(testName: string): void {
    if (!this.enabled) return;
    
    this.testMetrics.set(testName, {
      name: testName,
      startTime: performance.now(),
      memoryStart: process.memoryUsage(),
    });
  }
  
  static endTest(testName: string, status: 'passed' | 'failed' | 'skipped' = 'passed'): void {
    if (!this.enabled) return;
    
    const metric = this.testMetrics.get(testName);
    if (!metric) return;
    
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.memoryEnd = process.memoryUsage();
    metric.memoryDelta = metric.memoryEnd.heapUsed - metric.memoryStart.heapUsed;
    metric.status = status;
    
    // Real-time alerts for slow tests
    if (metric.duration > 1000) { // 1 second
      console.warn(`⚠️  Slow test detected: ${testName} took ${metric.duration.toFixed(2)}ms`);
    }
    
    // Real-time alerts for memory leaks
    if (metric.memoryDelta > 50 * 1024 * 1024) { // 50MB
      console.warn(`⚠️  Memory leak suspected in: ${testName} (${(metric.memoryDelta / 1024 / 1024).toFixed(2)}MB increase)`);
    }
  }
  
  static generateReport(): PerformanceReport {
    const metrics = Array.from(this.testMetrics.values());
    const completedTests = metrics.filter(m => m.duration !== undefined);
    
    const totalDuration = performance.now() - this.suiteStartTime;
    const totalTestDuration = completedTests.reduce((sum, m) => sum + (m.duration || 0), 0);
    
    const slowestTests = completedTests
      .filter(m => m.duration! > 500) // Tests slower than 500ms
      .sort((a, b) => b.duration! - a.duration!)
      .slice(0, 10);
    
    const memoryLeaks = completedTests
      .filter(m => m.memoryDelta && m.memoryDelta > 10 * 1024 * 1024) // 10MB threshold
      .sort((a, b) => b.memoryDelta! - a.memoryDelta!)
      .slice(0, 10);
    
    const failedTests = completedTests.filter(m => m.status === 'failed');
    
    return {
      totalTests: metrics.length,
      totalDuration,
      averageDuration: totalTestDuration / completedTests.length,
      slowestTests,
      memoryLeaks,
      failedTests,
    };
  }
  
  static printReport(): void {
    if (!this.enabled) return;
    
    const report = this.generateReport();
    
    console.log('\n📊 Test Performance Report');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${report.totalTests}`);
    console.log(`   Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Average Test Duration: ${report.averageDuration.toFixed(2)}ms`);
    
    if (report.slowestTests.length > 0) {
      console.log(`\n🐌 Top 10 Slowest Tests:`);
      report.slowestTests.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.name}: ${test.duration!.toFixed(2)}ms`);
      });
    }
    
    if (report.memoryLeaks.length > 0) {
      console.log(`\n💾 Potential Memory Leaks:`);
      report.memoryLeaks.forEach((test, i) => {
        const mbIncrease = (test.memoryDelta! / 1024 / 1024).toFixed(2);
        console.log(`   ${i + 1}. ${test.name}: +${mbIncrease}MB`);
      });
    }
    
    if (report.failedTests.length > 0) {
      console.log(`\n❌ Failed Tests: ${report.failedTests.length}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════\n');
  }
  
  static reset(): void {
    this.testMetrics.clear();
    this.suiteStartTime = performance.now();
  }
  
  static enable(): void {
    this.enabled = true;
  }
  
  static disable(): void {
    this.enabled = false;
  }
  
  // Helper to measure async function performance
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startTest(name);
    try {
      const result = await fn();
      this.endTest(name, 'passed');
      return result;
    } catch (error) {
      this.endTest(name, 'failed');
      throw error;
    }
  }
  
  // Helper to measure sync function performance
  static measure<T>(
    name: string,
    fn: () => T
  ): T {
    this.startTest(name);
    try {
      const result = fn();
      this.endTest(name, 'passed');
      return result;
    } catch (error) {
      this.endTest(name, 'failed');
      throw error;
    }
  }
  
  // Export metrics for external analysis
  static exportMetrics(): TestMetric[] {
    return Array.from(this.testMetrics.values());
  }
  
  // Import metrics from previous run for comparison
  static compareWithPrevious(previousMetrics: TestMetric[]): void {
    const currentMetrics = this.exportMetrics();
    
    console.log('\n📊 Performance Comparison with Previous Run');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const previousMap = new Map(previousMetrics.map(m => [m.name, m]));
    
    let improved = 0;
    let regressed = 0;
    const significantChanges: Array<{
      name: string;
      previousDuration: number;
      currentDuration: number;
      change: number;
    }> = [];
    
    currentMetrics.forEach(current => {
      const previous = previousMap.get(current.name);
      if (previous && previous.duration && current.duration) {
        const change = ((current.duration - previous.duration) / previous.duration) * 100;
        
        if (Math.abs(change) > 10) { // 10% threshold
          significantChanges.push({
            name: current.name,
            previousDuration: previous.duration,
            currentDuration: current.duration,
            change,
          });
          
          if (change < 0) improved++;
          else regressed++;
        }
      }
    });
    
    console.log(`\n✅ Improved: ${improved} tests`);
    console.log(`⚠️  Regressed: ${regressed} tests`);
    
    if (significantChanges.length > 0) {
      console.log('\n📈 Significant Changes:');
      significantChanges
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 10)
        .forEach(change => {
          const emoji = change.change < 0 ? '✅' : '⚠️';
          const sign = change.change > 0 ? '+' : '';
          console.log(
            `   ${emoji} ${change.name}: ${change.previousDuration.toFixed(2)}ms → ${change.currentDuration.toFixed(2)}ms (${sign}${change.change.toFixed(1)}%)`
          );
        });
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════\n');
  }
}

// Jest integration
if (typeof global !== 'undefined' && global.afterAll) {
  global.afterAll(() => {
    TestPerformanceMonitor.printReport();
  });
}