import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userId?: number;
}

interface EndpointStats {
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  errors: number;
  lastHour: {
    count: number;
    totalDuration: number;
    errors: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private endpointStats: Map<string, EndpointStats> = new Map();
  private readonly maxMetricsSize = 10000;
  private readonly metricsRetentionMs = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Clean up old metrics every 5 minutes
    setInterval(() => this.cleanupOldMetrics(), 5 * 60 * 1000);
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = new Date(Date.now() - this.metricsRetentionMs);
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoffTime);

    // Update endpoint stats to remove old data
    this.recalculateStats();
  }

  private recalculateStats(): void {
    const newStats = new Map<string, EndpointStats>();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const metric of this.metrics) {
      const key = `${metric.method} ${metric.endpoint}`;
      const stats = newStats.get(key) || {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        avgDuration: 0,
        errors: 0,
        lastHour: {
          count: 0,
          totalDuration: 0,
          errors: 0,
        },
      };

      stats.count++;
      stats.totalDuration += metric.duration;
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
      stats.avgDuration = stats.totalDuration / stats.count;

      if (metric.statusCode >= 400) {
        stats.errors++;
      }

      if (metric.timestamp > hourAgo) {
        stats.lastHour.count++;
        stats.lastHour.totalDuration += metric.duration;
        if (metric.statusCode >= 400) {
          stats.lastHour.errors++;
        }
      }

      newStats.set(key, stats);
    }

    this.endpointStats = newStats;
  }

  recordMetric(metric: PerformanceMetrics): void {
    // Add to metrics array
    this.metrics.push(metric);

    // Prevent unbounded growth
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }

    // Update endpoint stats
    const key = `${metric.method} ${metric.endpoint}`;
    const stats = this.endpointStats.get(key) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      avgDuration: 0,
      errors: 0,
      lastHour: {
        count: 0,
        totalDuration: 0,
        errors: 0,
      },
    };

    stats.count++;
    stats.totalDuration += metric.duration;
    stats.minDuration = Math.min(stats.minDuration, metric.duration);
    stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    stats.avgDuration = stats.totalDuration / stats.count;

    if (metric.statusCode >= 400) {
      stats.errors++;
    }

    // Update last hour stats
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      (m) => m.method === metric.method && m.endpoint === metric.endpoint && m.timestamp > hourAgo,
    );

    stats.lastHour = {
      count: recentMetrics.length,
      totalDuration: recentMetrics.reduce((sum, m) => sum + m.duration, 0),
      errors: recentMetrics.filter((m) => m.statusCode >= 400).length,
    };

    this.endpointStats.set(key, stats);

    // Log slow requests
    if (metric.duration > 1000) {
      logger.warn(
        {
          endpoint: metric.endpoint,
          method: metric.method,
          duration: metric.duration,
          statusCode: metric.statusCode,
          userId: metric.userId,
        },
        'Slow request detected',
      );
    }
  }

  getHealthStatus(): {
    healthy: boolean;
    avgResponseTime: number;
    errorRate: number;
    activeRequests: number;
    slowEndpoints: string[];
  } {
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp > new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
    );

    if (recentMetrics.length === 0) {
      return {
        healthy: true,
        avgResponseTime: 0,
        errorRate: 0,
        activeRequests: 0,
        slowEndpoints: [],
      };
    }

    const avgResponseTime =
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const errors = recentMetrics.filter((m) => m.statusCode >= 500).length;
    const errorRate = errors / recentMetrics.length;

    // Identify slow endpoints (avg > 500ms in last hour)
    const slowEndpoints: string[] = [];
    for (const [endpoint, stats] of this.endpointStats.entries()) {
      if (stats.lastHour.count > 0) {
        const avgDuration = stats.lastHour.totalDuration / stats.lastHour.count;
        if (avgDuration > 500) {
          slowEndpoints.push(endpoint);
        }
      }
    }

    // Health criteria:
    // - Average response time < 1000ms
    // - Error rate < 5%
    // - No more than 3 slow endpoints
    const healthy = avgResponseTime < 1000 && errorRate < 0.05 && slowEndpoints.length <= 3;

    return {
      healthy,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      activeRequests: 0, // This would need to track in-flight requests
      slowEndpoints,
    };
  }

  getPerformanceSummary(): {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    endpointCount: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        endpointCount: 0,
        timeRange: {
          start: new Date(),
          end: new Date(),
        },
      };
    }

    const totalRequests = this.metrics.length;
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const errors = this.metrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = errors / totalRequests;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      endpointCount: this.endpointStats.size,
      timeRange: {
        start: this.metrics[0].timestamp,
        end: this.metrics[this.metrics.length - 1].timestamp,
      },
    };
  }

  getSlowestEndpoints(limit: number = 10): Array<{
    endpoint: string;
    avgDuration: number;
    count: number;
    errorRate: number;
  }> {
    const endpoints = Array.from(this.endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: Math.round(stats.avgDuration),
        count: stats.count,
        errorRate: stats.errors > 0 ? Math.round((stats.errors / stats.count) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);

    return endpoints;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring middleware
 */
export default function performanceMonitoring(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const endpoint = req.route?.path || req.path;

  // Store original end function
  const originalEnd = res.end;
  const originalJson = res.json;
  const originalSend = res.send;

  // Helper to record metrics
  const recordMetrics = () => {
    const duration = Date.now() - start;
    const metric: PerformanceMetrics = {
      endpoint,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userId: req.user?.id,
    };

    performanceMonitor.recordMetric(metric);

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        {
          method: req.method,
          endpoint,
          duration,
          statusCode: res.statusCode,
          userId: req.user?.id,
        },
        'Request completed',
      );
    }
  };

  // Override response methods to capture timing
  res.end = function (...args: unknown[]): Response {
    recordMetrics();
    return originalEnd.apply(res, args as unknown[]);
  };

  res.json = function (body: unknown): Response {
    recordMetrics();
    return originalJson.call(res, body);
  };

  res.send = function (body: unknown): Response {
    recordMetrics();
    return originalSend.call(res, body);
  };

  next();
}

// Export types for testing
export type { PerformanceMetrics, EndpointStats };
