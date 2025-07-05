/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '../logger';
import { withSpan, dbQueryDuration, dbQueryCounter } from '../monitoring/telemetry';

// Performance measurement class
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor(private name: string) {
    this.startTime = performance.now();
    this.marks = new Map();
  }

  mark(label: string): void {
    this.marks.set(label, performance.now());
  }

  getElapsed(): number {
    return performance.now() - this.startTime;
  }

  getMarkElapsed(label: string): number | null {
    const markTime = this.marks.get(label);
    if (!markTime) return null;
    return markTime - this.startTime;
  }

  log(threshold: number = 1000): void {
    const elapsed = this.getElapsed();
    if (elapsed > threshold) {
      logger.warn(
        {
          operation: this.name,
          duration: elapsed,
          marks: Object.fromEntries(this.marks),
        },
        `Slow operation detected: ${this.name}`,
      );
    } else {
      logger.debug(
        {
          operation: this.name,
          duration: elapsed,
          marks: Object.fromEntries(this.marks),
        },
        `Operation completed: ${this.name}`,
      );
    }
  }

  end(): number {
    const elapsed = this.getElapsed();
    this.log();
    return elapsed;
  }
}

// (...args: unknown[]) => unknown performance wrapper
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T>,
  options: {
    logThreshold?: number;
    throwOnTimeout?: boolean;
    timeout?: number;
  } = {},
): Promise<T> => {
  const timer = new PerformanceTimer(name);
  const { logThreshold = 1000, throwOnTimeout = false, timeout = 30000 } = options;

  try {
    if (timeout && throwOnTimeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Operation ${name} timed out after ${timeout}ms`)),
          timeout,
        );
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      timer.end();
      return result;
    } else {
      const result = await fn();
      const elapsed = timer.end();

      if (elapsed > logThreshold) {
        logger.warn({ operation: name, duration: elapsed }, 'Slow operation');
      }

      return result;
    }
  } catch (_error) {
    timer.end();
    throw _error;
  }
};

// Database query performance wrapper
export const measureDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
): Promise<T> => {
  return withSpan(`db.query.${queryName}`, {}, async (span) => {
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Record metrics
      dbQueryDuration.record(duration, { query: queryName, status: 'success' });
      dbQueryCounter.add(1, { query: queryName, status: 'success' });

      // Log slow queries
      if (duration > 1000) {
        logger.warn(
          {
            query: queryName,
            duration,
          },
          'Slow database query detected',
        );
      }

      span.setAttributes({
        'db.query.name': queryName,
        'db.query.duration': duration,
        'db.query.slow': duration > 1000,
      });

      return result;
    } catch (_error) {
      const duration = performance.now() - startTime;

      // Record error metrics
      dbQueryDuration.record(duration, { query: queryName, status: 'error' });
      dbQueryCounter.add(1, { query: queryName, status: 'error' });

      span.setAttributes({
        'db.query.name': queryName,
        'db.query.duration': duration,
        'db.query.error': true,
      });

      throw _error;
    }
  });
};

// Batch operation performance helper
export const measureBatchOperation = async <T, R>(
  name: string,
  items: T[],
  operation: (item: T) => Promise<R>,
  options: {
    concurrency?: number;
    logProgress?: boolean;
    stopOnError?: boolean;
  } = {},
): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> => {
  const { concurrency = 10, logProgress = true, stopOnError = false } = options;
  const timer = new PerformanceTimer(`batch_${name}`);

  const results: R[] = [];
  const errors: Array<{ item: T; error: Error }> = [];
  let processed = 0;

  // Process in chunks
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);

    const chunkPromises = chunk.map(async (item, index) => {
      try {
        const result = await operation(item);
        results[i + index] = result;
        processed++;

        if (logProgress && processed % 100 === 0) {
          logger.info(
            {
              operation: name,
              processed,
              total: items.length,
              percentage: Math.round((processed / items.length) * 100),
            },
            'Batch operation progress',
          );
        }

        return result;
      } catch (_error) {
        errors.push({ item, error: _error as Error });

        if (stopOnError) {
          throw _error;
        }

        return null;
      }
    });

    await Promise.all(chunkPromises);
  }

  const elapsed = timer.end();

  logger.info(
    {
      operation: name,
      totalItems: items.length,
      successful: results.filter((r) => r !== null).length,
      failed: errors.length,
      duration: elapsed,
      itemsPerSecond: Math.round((items.length / elapsed) * 1000),
    },
    'Batch operation completed',
  );

  return { results, errors };
};

// Memory usage tracker
export const trackMemoryUsage = (operation: string): (() => void) => {
  const startMemory = process.memoryUsage();

  return () => {
    const endMemory = process.memoryUsage();
    const diff = {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
    };

    logger.debug(
      {
        operation,
        memoryDiff: diff,
        memoryDiffMB: {
          rss: Math.round(diff.rss / 1024 / 1024),
          heapTotal: Math.round(diff.heapTotal / 1024 / 1024),
          heapUsed: Math.round(diff.heapUsed / 1024 / 1024),
          external: Math.round(diff.external / 1024 / 1024),
        },
      },
      'Memory usage for operation',
    );
  };
};

// Throttle function execution
export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let lastCall = 0;

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args) as ReturnType<T>;
    }

    return undefined;
  };
};

// Debounce function execution
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(fn(...args) as ReturnType<T>);
      }, delay);
    });
  };
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {},
): Promise<T> => {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 30000, factor = 2, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (_error) {
      lastError = _error;

      if (attempt === maxRetries) {
        throw _error;
      }

      const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);

      if (onRetry) {
        onRetry(_error as Error, attempt + 1);
      }

      logger.debug(
        {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: _error instanceof Error ? _error.message : _error,
        },
        'Retrying operation after failure',
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Simple cache implementation
export class SimpleCache<T> {
  private cache: Map<string, { value: T; expiry: number }>;

  constructor(private ttl: number = 300000) {
    // 5 minutes default
    this.cache = new Map();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T, customTtl?: number): void {
    const expiry = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { value, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}
