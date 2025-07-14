import crypto from 'crypto';

import type { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

import { logger } from '../logger.js';

import { cacheMetrics } from './metrics.js';

// Cache configuration
const DEFAULT_TTL = 300; // 5 minutes in seconds
const MAX_CACHE_SIZE = 1000; // Maximum number of cached items

// Create cache instances for different types of data
const caches = {
  // Short-term cache for API responses (5 minutes)
  api: new NodeCache({
    stdTTL: DEFAULT_TTL,
    maxKeys: MAX_CACHE_SIZE,
    checkperiod: 60, // Check for expired keys every minute
  }),

  // Medium-term cache for curriculum data (30 minutes)
  curriculum: new NodeCache({
    stdTTL: 1800,
    maxKeys: 500,
    checkperiod: 300,
  }),

  // Long-term cache for static data (2 hours)
  static: new NodeCache({
    stdTTL: 7200,
    maxKeys: 200,
    checkperiod: 600,
  }),

  // User-specific cache (10 minutes)
  user: new NodeCache({
    stdTTL: 600,
    maxKeys: 1000,
    checkperiod: 120,
  }),
};

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
}

// Track cache statistics
const stats = {
  api: { hits: 0, misses: 0 },
  curriculum: { hits: 0, misses: 0 },
  static: { hits: 0, misses: 0 },
  user: { hits: 0, misses: 0 },
};

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, prefix = ''): string {
  const userId = req.user?.id ?? 'anonymous';
  const {method} = req;
  const {path} = req;
  const query = JSON.stringify(req.query);
  const body = req.method === 'GET' ? '' : JSON.stringify(req.body);

  const keyData = `${prefix}:${userId}:${method}:${path}:${query}:${body}`;
  return crypto.createHash('md5').update(keyData).digest('hex');
}

/**
 * Check if request should be cached
 */
function shouldCache(req: Request): boolean {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return false;
  }

  // Don't cache authenticated endpoints by default unless explicitly enabled
  if (req.headers.authorization && !(req as Request & { cacheEnabled?: boolean }).cacheEnabled) {
    return false;
  }

  // Don't cache requests with specific headers
  if (req.headers['cache-control'] === 'no-cache') {
    return false;
  }

  return true;
}

/**
 * Generic cache middleware factory
 */
export function createCacheMiddleware(
  cacheType: keyof typeof caches = 'api',
  options: {
    ttl?: number;
    keyPrefix?: string;
    condition?: (req: Request) => boolean;
    skipUserSpecific?: boolean;
  } = {},
) {
  const cache = caches[cacheType];
  const { ttl, keyPrefix = '', condition = shouldCache, skipUserSpecific = false } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    // Check if this request should be cached
    if (!condition(req)) {
      next();
      return;
    }

    try {
      // Generate cache key
      const cacheKey = skipUserSpecific
        ? generateCacheKey(
            {
              path: req.path,
              method: req.method,
              query: req.query,
              body: req.body as Record<string, unknown>,
              headers: req.headers,
              user: undefined,
            } as Request,
            keyPrefix,
          )
        : generateCacheKey(req, keyPrefix);

      // Try to get from cache
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        // Cache hit
        stats[cacheType].hits++;
        cacheMetrics.recordHit(cacheType);
        logger.debug({ cacheType, path: req.path }, `Cache hit for key: ${cacheKey}`);

        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey.substring(0, 8));

        return res.json(cachedResponse);
      }

      // Cache miss - continue to route handler
      stats[cacheType].misses++;
      cacheMetrics.recordMiss(cacheType);

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function (data: unknown) {
        // Cache the response data
        if (res.statusCode === 200 && data) {
          const cacheTTL = ttl ?? cache.options.stdTTL ?? DEFAULT_TTL;
          cache.set(cacheKey, data, cacheTTL);

          logger.debug(
            {
              cacheType,
              path: req.path,
              ttl: cacheTTL,
            },
            `Cached response for key: ${cacheKey}`,
          );
        }

        // Set cache headers
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey.substring(0, 8));

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (_error: unknown) {
      logger.error('Cache middleware error:', _error as string | undefined);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Specific cache middleware for different data types
 */

// API response cache (5 minutes)
export const apiCache = createCacheMiddleware('api', { keyPrefix: 'api' });

// Curriculum data cache (30 minutes)
export const curriculumCache = createCacheMiddleware('curriculum', {
  keyPrefix: 'curriculum',
  ttl: 1800,
});

// Static data cache (2 hours) - user-independent
export const staticCache = createCacheMiddleware('static', {
  keyPrefix: 'static',
  ttl: 7200,
  skipUserSpecific: true,
});

// User-specific data cache (10 minutes)
export const userCache = createCacheMiddleware('user', {
  keyPrefix: 'user',
  ttl: 600,
});

/**
 * Cache invalidation middleware
 */
export function invalidateCache(
  patterns: string[],
  cacheTypes: (keyof typeof caches)[] = ['api', 'user'],
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original methods
    const originalJson = res.json;
    const originalEnd = res.end;

    function invalidateCacheEntries(): void {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheTypes.forEach((cacheType) => {
          const cache = caches[cacheType];
          const keys = cache.keys();

          let invalidatedCount = 0;
          patterns.forEach((pattern) => {
            const regex = new RegExp(pattern);
            keys.forEach((key) => {
              if (regex.test(key)) {
                cache.del(key);
                invalidatedCount++;
              }
            });
          });

          if (invalidatedCount > 0) {
            logger.debug(
              {
                cacheType,
                patterns,
                path: req.path,
              },
              `Invalidated ${invalidatedCount} cache entries`,
            );
          }
        });
      }
    }

    // Override response methods
    res.json = function (data: unknown) {
      invalidateCacheEntries();
      return originalJson.call(this, data);
    };

    res.end = function (
      this: Response,
      chunk?: unknown,
      encoding?: BufferEncoding,
      cb?: () => void,
    ) {
      invalidateCacheEntries();
      return originalEnd.call(this, chunk, encoding!, cb);
    } as Response['end'];

    next();
  };
}

/**
 * Cache warm-up for commonly accessed data
 */
export async function warmUpCache(): Promise<void> {
  logger.info('Starting cache warm-up...');

  try {
    // Warm up static data (can be done without user context)
    // This would typically include:
    // - Curriculum expectations
    // - Subject lists
    // - Grade levels
    // - System templates

    logger.info('Cache warm-up completed');
  } catch (_error: unknown) {
    logger.error('Cache warm-up failed:', _error as string | undefined);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): Record<string, CacheStats> {
  const result: Record<string, CacheStats> = {};

  Object.entries(caches).forEach(([name, cache]) => {
    const cacheStats = stats[name as keyof typeof stats];
    const totalRequests = cacheStats.hits + cacheStats.misses;
    const hitRate = totalRequests > 0 ? (cacheStats.hits / totalRequests) * 100 : 0;

    result[name] = {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalKeys: cache.keys().length,
    };
  });

  return result;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  Object.values(caches).forEach((cache) => {
    cache.flushAll();
  });
  Object.keys(stats).forEach((key) => {
    stats[key as keyof typeof stats] = { hits: 0, misses: 0 };
  });
  logger.info('All caches cleared');
}

/**
 * Clear specific cache type
 */
export function clearCache(cacheType: keyof typeof caches): void {
  caches[cacheType].flushAll();
  stats[cacheType] = { hits: 0, misses: 0 };
  logger.info(`Cache cleared: ${cacheType}`);
}

/**
 * Get cache memory usage
 */
export function getCacheMemoryUsage(): Record<string, { keyCount: number; hits: number; misses: number; ksize: number; vsize: number }> {
  const usage: Record<
    string,
    {
      keyCount: number;
      hits: number;
      misses: number;
      ksize: number;
      vsize: number;
    }
  > = {};

  Object.entries(caches).forEach(([name, cache]) => {
    const keys = cache.keys();
    const stats = cache.getStats();

    usage[name] = {
      keyCount: keys.length,
      hits: stats.hits,
      misses: stats.misses,
      ksize: stats.ksize,
      vsize: stats.vsize,
    };
  });

  return usage;
}

// Cache health check
export function isCacheHealthy(): boolean {
  try {
    // Test each cache by setting and getting a value
    Object.values(caches).forEach((cache) => {
      const testKey = '__health_check__';
      const testValue = Date.now();
      cache.set(testKey, testValue, 1);
      const retrieved = cache.get(testKey);
      if (retrieved !== testValue) {
        throw new Error('Cache health check failed');
      }
      cache.del(testKey);
    });
    return true;
  } catch (_error: unknown) {
    logger.error('Cache health check failed:', _error as string | undefined);
    return false;
  }
}

// Export cache instances for direct access if needed
export { caches };
