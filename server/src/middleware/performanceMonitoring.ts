import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
  requestsPerMinute: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastReset: Date;
}

interface RequestTiming {
  method: string;
  route: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  memoryBefore: number;
  memoryAfter: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private requestTimings: RequestTiming[] = [];
  private readonly maxTimings = 1000; // Keep last 1000 requests
  private readonly slowRequestThreshold = 1000; // 1 second

  constructor() {
    this.metrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0,
      requestsPerMinute: 0,
      memoryUsage: process.memoryUsage(),
      lastReset: new Date()
    };

    // Update metrics every minute
    setInterval(() => this.updateMetrics(), 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = process.hrtime.bigint();
      const memoryBefore = process.memoryUsage().heapUsed;

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(this: Response, ...args: unknown[]): Response {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const memoryAfter = process.memoryUsage().heapUsed;

        // Record the request timing
        const timing: RequestTiming = {
          method: req.method,
          route: req.route?.path || req.path,
          duration,
          statusCode: res.statusCode,
          timestamp: new Date(),
          memoryBefore,
          memoryAfter
        };

        performanceMonitor.recordRequest(timing);

        // Log slow requests
        if (duration > performanceMonitor.slowRequestThreshold) {
          logger.warn({
            method: req.method,
            route: timing.route,
            duration: `${duration.toFixed(2)}ms`,
            statusCode: res.statusCode,
            memoryDelta: `${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)}MB`
          }, 'Slow request detected');
        }

        // Call original end method and return the response
        return originalEnd.apply(this, args) as Response;
      };

      next();
    };
  }

  recordRequest(timing: RequestTiming): void {
    this.requestTimings.push(timing);
    
    // Keep only the most recent timings
    if (this.requestTimings.length > this.maxTimings) {
      this.requestTimings = this.requestTimings.slice(-this.maxTimings);
    }

    this.metrics.totalRequests++;
    
    // Update average response time (rolling average)
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (totalTime + timing.duration) / this.metrics.totalRequests;

    // Count slow requests
    if (timing.duration > this.slowRequestThreshold) {
      this.metrics.slowRequests++;
    }

    // Update error rate
    if (timing.statusCode >= 400) {
      const totalErrors = this.requestTimings.filter(t => t.statusCode >= 400).length;
      this.metrics.errorRate = (totalErrors / this.requestTimings.length) * 100;
    }
  }

  private updateMetrics(): void {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Calculate requests per minute
    const recentRequests = this.requestTimings.filter(t => t.timestamp > oneMinuteAgo);
    this.metrics.requestsPerMinute = recentRequests.length;
    
    // Update memory usage
    this.metrics.memoryUsage = process.memoryUsage();

    // Log performance summary every 5 minutes
    const minutesSinceReset = (now.getTime() - this.metrics.lastReset.getTime()) / (1000 * 60);
    if (minutesSinceReset >= 5) {
      this.logPerformanceSummary();
      this.resetCounters();
    }
  }

  private logPerformanceSummary(): void {
    const summary = this.getPerformanceSummary();
    
    logger.info({
      performance: summary,
      memoryUsage: {
        heapUsed: `${(this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(this.metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(this.metrics.memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(this.metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`
      }
    }, 'Performance summary');

    // Warn about performance issues
    if (summary.averageResponseTime > 500) {
      logger.warn('High average response time detected');
    }
    
    if (summary.errorRate > 5) {
      logger.warn('High error rate detected');
    }

    if (summary.slowRequestPercentage > 10) {
      logger.warn('High percentage of slow requests detected');
    }
  }

  private resetCounters(): void {
    this.metrics.lastReset = new Date();
    // Keep running totals but reset some metrics
    this.metrics.slowRequests = 0;
  }

  getPerformanceSummary() {
    const slowRequestPercentage = this.metrics.totalRequests > 0 
      ? (this.metrics.slowRequests / this.metrics.totalRequests) * 100 
      : 0;

    const recentTimings = this.requestTimings.slice(-100); // Last 100 requests
    const routeStats = this.getRouteStatistics(recentTimings);

    return {
      totalRequests: this.metrics.totalRequests,
      averageResponseTime: Math.round(this.metrics.averageResponseTime * 100) / 100,
      requestsPerMinute: this.metrics.requestsPerMinute,
      errorRate: Math.round(this.metrics.errorRate * 100) / 100,
      slowRequestPercentage: Math.round(slowRequestPercentage * 100) / 100,
      slowRequestThreshold: this.slowRequestThreshold,
      uptimeMinutes: Math.round((Date.now() - this.metrics.lastReset.getTime()) / (1000 * 60)),
      routeStats
    };
  }

  private getRouteStatistics(timings: RequestTiming[]) {
    const routeMap = new Map<string, { count: number; totalTime: number; errors: number }>();
    
    for (const timing of timings) {
      const key = `${timing.method} ${timing.route}`;
      const stats = routeMap.get(key) || { count: 0, totalTime: 0, errors: 0 };
      
      stats.count++;
      stats.totalTime += timing.duration;
      if (timing.statusCode >= 400) {
        stats.errors++;
      }
      
      routeMap.set(key, stats);
    }

    const routeStats: Array<{
      route: string;
      requestCount: number;
      averageResponseTime: number;
      errorRate: number;
    }> = [];
    for (const [route, stats] of routeMap.entries()) {
      routeStats.push({
        route,
        requestCount: stats.count,
        averageResponseTime: Math.round((stats.totalTime / stats.count) * 100) / 100,
        errorRate: Math.round((stats.errors / stats.count) * 100 * 100) / 100
      });
    }

    // Sort by request count descending
    return routeStats.sort((a, b) => b.requestCount - a.requestCount).slice(0, 10);
  }

  getSlowestEndpoints(limit: number = 10) {
    const routeMap = new Map<string, { times: number[]; errors: number }>();
    
    for (const timing of this.requestTimings) {
      const key = `${timing.method} ${timing.route}`;
      const stats = routeMap.get(key) || { times: [], errors: 0 };
      
      stats.times.push(timing.duration);
      if (timing.statusCode >= 400) {
        stats.errors++;
      }
      
      routeMap.set(key, stats);
    }

    const endpointStats: Array<{
      route: string;
      requestCount: number;
      averageTime: number;
      maxTime: number;
      p95Time: number;
      errorCount: number;
    }> = [];
    for (const [route, stats] of routeMap.entries()) {
      const avgTime = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
      const maxTime = Math.max(...stats.times);
      const p95Time = this.percentile(stats.times, 0.95);
      
      endpointStats.push({
        route,
        requestCount: stats.times.length,
        averageTime: Math.round(avgTime * 100) / 100,
        maxTime: Math.round(maxTime * 100) / 100,
        p95Time: Math.round(p95Time * 100) / 100,
        errorCount: stats.errors
      });
    }

    return endpointStats
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit);
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  getHealthStatus() {
    const summary = this.getPerformanceSummary();
    const memUsageMB = this.metrics.memoryUsage.heapUsed / 1024 / 1024;
    
    const isHealthy = 
      summary.averageResponseTime < 1000 &&
      summary.errorRate < 10 &&
      summary.slowRequestPercentage < 20 &&
      memUsageMB < 512; // 512MB threshold

    return {
      healthy: isHealthy,
      details: {
        responseTime: summary.averageResponseTime < 1000 ? 'good' : 'slow',
        errorRate: summary.errorRate < 5 ? 'good' : summary.errorRate < 10 ? 'warning' : 'critical',
        memoryUsage: memUsageMB < 256 ? 'good' : memUsageMB < 512 ? 'warning' : 'critical',
        performance: summary
      }
    };
  }
}

// Global instance
const performanceMonitor = new PerformanceMonitor();

export { performanceMonitor };
export default performanceMonitor.middleware();