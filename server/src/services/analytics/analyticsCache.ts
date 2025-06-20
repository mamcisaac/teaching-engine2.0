/**
 * Analytics Cache Service
 *
 * Provides caching for expensive analytics calculations to improve performance.
 * Uses in-memory cache with TTL and smart invalidation based on data changes.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key for analytics queries
   */
  generateKey(service: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `${service}:${sortedParams}`;
  }
}

export const analyticsCache = new AnalyticsCache();

/**
 * Cache decorator for analytics functions
 */
export function cached<T extends any[], R>(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = analyticsCache.generateKey(
        `${target.constructor.name}.${propertyKey}`,
        args.length > 0 && typeof args[0] === 'object' ? args[0] : {},
      );

      const cached = analyticsCache.get<R>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      analyticsCache.set(cacheKey, result, ttl);
      return result;
    };

    return descriptor;
  };
}
