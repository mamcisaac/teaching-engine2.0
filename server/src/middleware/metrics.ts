/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { performance } from 'perf_hooks';

import type { Request, Response, NextFunction } from 'express';

import logger from '../logger.js';

// Simple metrics collection without external dependencies
interface MetricData {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
  type: 'counter' | 'gauge' | 'histogram';
}

interface HistogramBucket {
  le: number; // less than or equal to
  count: number;
}

interface HistogramData {
  buckets: HistogramBucket[];
  sum: number;
  count: number;
}

// In-memory metrics store
class MetricsStore {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, HistogramData>();
  private metrics: MetricData[] = [];

  // Default histogram buckets for response times (in milliseconds)
  private readonly defaultBuckets = [
    1,
    5,
    10,
    25,
    50,
    100,
    250,
    500,
    1000,
    2500,
    5000,
    10000,
    Infinity,
  ];

  constructor() {
    // Initialize core metrics
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP metrics
    this.createHistogram('http_request_duration_ms', 'HTTP request duration in milliseconds');
    this.createCounter('http_requests_total', 'Total number of HTTP requests');
    this.createCounter('http_errors_total', 'Total number of HTTP errors');

    // Database metrics
    this.createHistogram('db_query_duration_ms', 'Database query duration in milliseconds');
    this.createCounter('db_queries_total', 'Total number of database queries');
    this.createCounter('db_errors_total', 'Total number of database errors');

    // Cache metrics
    this.createCounter('cache_hits_total', 'Total cache hits');
    this.createCounter('cache_misses_total', 'Total cache misses');
    this.createGauge('cache_size', 'Current cache size');

    // Application metrics
    this.createGauge('active_connections', 'Number of active connections');
    this.createGauge('memory_usage_bytes', 'Memory usage in bytes');
    this.createGauge('cpu_usage_percent', 'CPU usage percentage');
  }

  createCounter(name: string, _help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, 0);
    }
  }

  createGauge(name: string, _help: string): void {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, 0);
    }
  }

  createHistogram(name: string, _help: string, buckets?: number[]): void {
    if (!this.histograms.has(name)) {
      const histogramBuckets = (buckets ?? this.defaultBuckets).map((le) => ({ le, count: 0 }));
      this.histograms.set(name, {
        buckets: histogramBuckets,
        sum: 0,
        count: 0,
      });
    }
  }

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    const current = this.counters.get(name) ?? 0;
    this.counters.set(name, current + value);

    this.recordMetric({
      name,
      value: current + value,
      labels,
      timestamp: Date.now(),
      type: 'counter',
    });
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    this.gauges.set(name, value);

    this.recordMetric({
      name,
      value,
      labels,
      timestamp: Date.now(),
      type: 'gauge',
    });
  }

  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const histogram = this.histograms.get(name);
    if (!histogram) {
return;
}

    // Update histogram data
    histogram.sum += value;
    histogram.count += 1;

    // Update buckets
    for (const bucket of histogram.buckets) {
      if (value <= bucket.le) {
        bucket.count += 1;
      }
    }

    this.recordMetric({
      name,
      value,
      labels,
      timestamp: Date.now(),
      type: 'histogram',
    });
  }

  private recordMetric(metric: MetricData): void {
    this.metrics.push(metric);

    // Keep only recent metrics (last 1000 entries to prevent memory issues)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  getMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, HistogramData>;
    recent: MetricData[];
  } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
      recent: this.metrics.slice(-100), // Last 100 metrics
    };
  }

  getPrometheusFormat(): string {
    let output = '';

    // Counters
    this.counters.forEach((value, name) => {
      output += `# TYPE ${name} counter\n`;
      output += `${name} ${value}\n`;
    });

    // Gauges
    this.gauges.forEach((value, name) => {
      output += `# TYPE ${name} gauge\n`;
      output += `${name} ${value}\n`;
    });

    // Histograms
    this.histograms.forEach((data, name) => {
      output += `# TYPE ${name} histogram\n`;

      // Buckets
      for (const bucket of data.buckets) {
        const le = bucket.le === Infinity ? '+Inf' : bucket.le.toString();
        output += `${name}_bucket{le="${le}"} ${bucket.count}\n`;
      }

      // Sum and count
      output += `${name}_sum ${data.sum}\n`;
      output += `${name}_count ${data.count}\n`;
    });

    return output;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.metrics = [];
    this.initializeMetrics();
  }
}

// Global metrics store
export const metricsStore = new MetricsStore();

/**
 * HTTP request metrics middleware
 */
export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = performance.now();

  // Increment request counter
  metricsStore.incrementCounter('http_requests_total', {
    method: req.method,
    path: req.path,
    user_agent: req.get('User-Agent')?.substring(0, 50) ?? 'unknown',
  });

  // Override end method to capture response metrics
  const originalEnd = res.end;
  res.end = function (chunk?: unknown, encoding?: unknown) {
    const duration = performance.now() - startTime;

    // Record request duration
    metricsStore.observeHistogram('http_request_duration_ms', duration, {
      method: req.method,
      status_code: res.statusCode.toString(),
      path: req.route?.path ?? req.path,
    });

    // Record errors
    if (res.statusCode >= 400) {
      metricsStore.incrementCounter('http_errors_total', {
        method: req.method,
        status_code: res.statusCode.toString(),
        path: req.route?.path ?? req.path,
      });
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding as BufferEncoding);
  };

  next();
}

/**
 * Database query metrics wrapper
 */
export function recordDatabaseQuery<T>(operation: string, queryFn: () => Promise<T>): Promise<T> {
  const startTime = performance.now();

  metricsStore.incrementCounter('db_queries_total', { operation });

  return queryFn()
    .then((result) => {
      const duration = performance.now() - startTime;
      metricsStore.observeHistogram('db_query_duration_ms', duration, { operation });
      return result;
    })
    .catch((_error) => {
      const duration = performance.now() - startTime;
      metricsStore.observeHistogram('db_query_duration_ms', duration, { operation, error: 'true' });
      metricsStore.incrementCounter('db_errors_total', { operation });
      throw _error;
    });
}

/**
 * Cache metrics helpers
 */
export const cacheMetrics = {
  recordHit: (cacheType: string) => {
    metricsStore.incrementCounter('cache_hits_total', { cache_type: cacheType });
  },

  recordMiss: (cacheType: string) => {
    metricsStore.incrementCounter('cache_misses_total', { cache_type: cacheType });
  },

  setCacheSize: (cacheType: string, size: number) => {
    metricsStore.setGauge('cache_size', size, { cache_type: cacheType });
  },
};

/**
 * System metrics collector
 */
export function collectSystemMetrics() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Memory metrics
    metricsStore.setGauge('memory_usage_bytes', memoryUsage.heapUsed, { type: 'heap_used' });
    metricsStore.setGauge('memory_usage_bytes', memoryUsage.heapTotal, { type: 'heap_total' });
    metricsStore.setGauge('memory_usage_bytes', memoryUsage.external, { type: 'external' });
    metricsStore.setGauge('memory_usage_bytes', memoryUsage.rss, { type: 'rss' });

    // CPU metrics (convert microseconds to percentage)
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    metricsStore.setGauge('cpu_usage_percent', cpuPercent);
  } catch (_error) {
    logger.error('Error collecting system metrics:', _error);
  }
}

/**
 * Start system metrics collection
 */
export function startSystemMetricsCollection(intervalMs = 30000) {
  // Collect initial metrics
  collectSystemMetrics();

  // Set up periodic collection
  const interval = setInterval(collectSystemMetrics, intervalMs);

  // Cleanup on process exit
  process.on('SIGTERM', () => {
 clearInterval(interval); 
});
  process.on('SIGINT', () => {
 clearInterval(interval); 
});

  logger.info(`System metrics collection started with ${intervalMs}ms interval`);

  return interval;
}

/**
 * Performance monitoring decorator for async functions
 */
export function withMetrics<T extends any[], R>(
  metricName: string,
  labels: Record<string, string> = {},
) {
  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const startTime = performance.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;

        metricsStore.observeHistogram(metricName, duration, {
          ...labels,
          method: propertyKey,
          status: 'success',
        });

        return result;
      } catch (_error) {
        const duration = performance.now() - startTime;

        metricsStore.observeHistogram(metricName, duration, {
          ...labels,
          method: propertyKey,
          status: 'error',
        });

        throw _error;
      }
    };

    return descriptor;
  };
}

/**
 * Calculate performance percentiles from histogram data
 */
export function calculatePercentiles(
  histogramData: HistogramData,
  percentiles: number[] = [50, 90, 95, 99],
) {
  const result: Record<string, number> = {};

  for (const p of percentiles) {
    const targetCount = (histogramData.count * p) / 100;
    let cumulativeCount = 0;

    for (const bucket of histogramData.buckets) {
      cumulativeCount += bucket.count;
      if (cumulativeCount >= targetCount) {
        result[`p${p}`] =
          bucket.le === Infinity ? histogramData.sum / histogramData.count : bucket.le;
        break;
      }
    }
  }

  return result;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  const metrics = metricsStore.getMetrics();

  const summary = {
    http: {
      totalRequests: metrics.counters.http_requests_total ?? 0,
      totalErrors: metrics.counters.http_errors_total ?? 0,
      errorRate: 0,
      responseTime: calculatePercentiles(
        metrics.histograms.http_request_duration_ms ?? { buckets: [], sum: 0, count: 0 },
      ),
    },
    database: {
      totalQueries: metrics.counters.db_queries_total ?? 0,
      totalErrors: metrics.counters.db_errors_total ?? 0,
      errorRate: 0,
      queryTime: calculatePercentiles(
        metrics.histograms.db_query_duration_ms ?? { buckets: [], sum: 0, count: 0 },
      ),
    },
    cache: {
      totalHits: metrics.counters.cache_hits_total ?? 0,
      totalMisses: metrics.counters.cache_misses_total ?? 0,
      hitRate: 0,
    },
    system: {
      memoryUsage: metrics.gauges.memory_usage_bytes ?? 0,
      cpuUsage: metrics.gauges.cpu_usage_percent ?? 0,
    },
  };

  // Calculate rates
  if (summary.http.totalRequests > 0) {
    summary.http.errorRate = (summary.http.totalErrors / summary.http.totalRequests) * 100;
  }

  if (summary.database.totalQueries > 0) {
    summary.database.errorRate =
      (summary.database.totalErrors / summary.database.totalQueries) * 100;
  }

  const totalCacheRequests = summary.cache.totalHits + summary.cache.totalMisses;
  if (totalCacheRequests > 0) {
    summary.cache.hitRate = (summary.cache.totalHits / totalCacheRequests) * 100;
  }

  return summary;
}

export default metricsStore;

// Named export for getMetrics function
export const getMetrics = () => metricsStore.getMetrics();
