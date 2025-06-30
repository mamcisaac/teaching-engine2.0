/**
 * Performance Monitor Utility
 * Monitors and collects performance metrics for browser and server
 */

import { Page } from '@playwright/test';
import * as os from 'os';
import { spawn, ChildProcess } from 'child_process';
import { performance } from 'perf_hooks';

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  cpuUsage: number;
}

interface ServerMetrics {
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  responseTime: number; // ms
  activeConnections: number;
  requestsPerSecond: number;
}

interface BrowserMetrics {
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  domNodes: number;
  eventListeners: number;
}

export class PerformanceMonitor {
  private isMonitoring: boolean = false;
  private monitoringProcess: ChildProcess | null = null;
  private metrics: Array<{ timestamp: number; data: any }> = [];
  private startTime: number = 0;

  async startMonitoring(page?: Page): Promise<void> {
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.metrics = [];

    if (page) {
      await this.startBrowserMonitoring(page);
    }

    await this.startServerMonitoring();
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;

    if (this.monitoringProcess) {
      this.monitoringProcess.kill();
      this.monitoringProcess = null;
    }
  }

  private async startBrowserMonitoring(page: Page): Promise<void> {
    // Inject performance monitoring script into the page
    await page.addInitScript(() => {
      (window as any).performanceMetrics = {
        startTime: performance.now(),
        measurements: [],

        measure: function (name: string) {
          const now = performance.now();
          this.measurements.push({
            name,
            timestamp: now,
            memory: (performance as any).memory
              ? {
                  usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                  totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                  jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                }
              : null,
          });
        },

        getMetrics: function () {
          return {
            measurements: this.measurements,
            domNodes: document.querySelectorAll('*').length,
            eventListeners: this.countEventListeners(),
          };
        },

        countEventListeners: function () {
          let count = 0;
          const elements = document.querySelectorAll('*');
          elements.forEach((element) => {
            const events = ['click', 'change', 'submit', 'focus', 'blur', 'keydown', 'keyup'];
            events.forEach((event) => {
              if (element.getAttribute(`on${event}`)) count++;
            });
          });
          return count;
        },
      };

      // Start periodic measurements
      setInterval(() => {
        (window as any).performanceMetrics.measure('periodic');
      }, 1000);
    });
  }

  private async startServerMonitoring(): Promise<void> {
    // Monitor system resources
    const monitorInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitorInterval);
        return;
      }

      const metrics = {
        timestamp: Date.now(),
        data: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          system: {
            loadAverage: os.loadavg(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
          },
        },
      };

      this.metrics.push(metrics);
    }, 1000);
  }

  async getMemoryMetrics(page: Page): Promise<MemoryMetrics> {
    // Get browser memory metrics
    const browserMetrics = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    // Get Node.js process memory
    const processMemory = process.memoryUsage();

    // Estimate CPU usage from recent metrics
    const recentMetrics = this.metrics.slice(-5);
    const avgCpuUsage =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + (m.data.system?.loadAverage[0] || 0), 0) /
          recentMetrics.length
        : 0;

    return {
      heapUsed: browserMetrics?.usedJSHeapSize || processMemory.heapUsed,
      heapTotal: browserMetrics?.totalJSHeapSize || processMemory.heapTotal,
      external: processMemory.external,
      arrayBuffers: processMemory.arrayBuffers,
      cpuUsage: Math.min(avgCpuUsage * 100, 100), // Convert to percentage
    };
  }

  async getServerMetrics(): Promise<ServerMetrics> {
    const recentMetrics = this.metrics.slice(-10);

    if (recentMetrics.length === 0) {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        responseTime: 0,
        activeConnections: 0,
        requestsPerSecond: 0,
      };
    }

    const avgMemory =
      recentMetrics.reduce((sum, m) => sum + m.data.memory.heapUsed, 0) / recentMetrics.length;
    const avgCpu =
      recentMetrics.reduce((sum, m) => sum + (m.data.system.loadAverage[0] || 0), 0) /
      recentMetrics.length;

    return {
      memoryUsage: avgMemory / 1024 / 1024, // Convert to MB
      cpuUsage: Math.min(avgCpu * 100, 100), // Convert to percentage
      responseTime: this.calculateAverageResponseTime(),
      activeConnections: this.estimateActiveConnections(),
      requestsPerSecond: this.calculateRequestsPerSecond(),
    };
  }

  async getBrowserMetrics(page: Page): Promise<BrowserMetrics> {
    const metrics = await page.evaluate(() => {
      const perfMetrics = (window as any).performanceMetrics;
      if (!perfMetrics) {
        return {
          domNodes: document.querySelectorAll('*').length,
          eventListeners: 0,
          measurements: [],
        };
      }
      return perfMetrics.getMetrics();
    });

    const memoryMetrics = await this.getMemoryMetrics(page);

    return {
      memoryUsage: memoryMetrics.heapUsed / 1024 / 1024, // Convert to MB
      cpuUsage: memoryMetrics.cpuUsage,
      renderTime: performance.now() - this.startTime,
      domNodes: metrics.domNodes,
      eventListeners: metrics.eventListeners,
    };
  }

  private calculateAverageResponseTime(): number {
    // This would typically be collected from HTTP request logs
    // For now, return a placeholder based on recent activity
    const recentActivity = this.metrics.slice(-5);
    if (recentActivity.length < 2) return 0;

    const timeDiffs = recentActivity
      .slice(1)
      .map((metric, index) => metric.timestamp - recentActivity[index].timestamp);

    return timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  }

  private estimateActiveConnections(): number {
    // Placeholder - would typically be collected from server monitoring
    return Math.floor(Math.random() * 10) + 1;
  }

  private calculateRequestsPerSecond(): number {
    // Placeholder - would typically be calculated from HTTP logs
    const timeWindow = 5000; // 5 seconds
    const recentMetrics = this.metrics.filter((m) => Date.now() - m.timestamp < timeWindow);

    return (recentMetrics.length / timeWindow) * 1000;
  }

  getHistoricalMetrics(): Array<{ timestamp: number; data: any }> {
    return [...this.metrics];
  }

  async detectMemoryLeaks(page: Page): Promise<{
    detected: boolean;
    growthRate: number; // MB per minute
    recommendations: string[];
  }> {
    const measurements: MemoryMetrics[] = [];
    const measureInterval = 10000; // 10 seconds
    const totalDuration = 60000; // 1 minute

    for (let i = 0; i < totalDuration / measureInterval; i++) {
      const metrics = await this.getMemoryMetrics(page);
      measurements.push(metrics);

      if (i < totalDuration / measureInterval - 1) {
        await new Promise((resolve) => setTimeout(resolve, measureInterval));
      }
    }

    // Calculate memory growth rate
    const initialMemory = measurements[0]?.heapUsed || 0;
    const finalMemory = measurements[measurements.length - 1]?.heapUsed || 0;
    const growthRate = (finalMemory - initialMemory) / 1024 / 1024 / (totalDuration / 60000); // MB per minute

    const detected = growthRate > 5; // More than 5MB growth per minute

    const recommendations: string[] = [];
    if (detected) {
      recommendations.push('Consider implementing manual garbage collection triggers');
      recommendations.push('Review event listener cleanup in component unmounting');
      recommendations.push('Check for circular references in object structures');
      recommendations.push('Monitor large data structures for proper cleanup');
    }

    return {
      detected,
      growthRate,
      recommendations,
    };
  }

  async measurePageLoadTime(
    page: Page,
    url: string,
  ): Promise<{
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  }> {
    await page.goto(url);

    return await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;

      return {
        navigationStart: timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: navigation.responseStart - navigation.requestStart,
        firstContentfulPaint: navigation.domContentLoadedEventStart - navigation.requestStart,
      };
    });
  }
}
