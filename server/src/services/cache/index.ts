/**
 * Unified Cache Service
 * Provides a consistent interface with automatic fallback
 */

import { structuredLogger } from '../../utils/structuredLogger';

import type { MemoryCache} from './MemoryCache';
import { getMemoryCache } from './MemoryCache';
import type { RedisCache, CacheOptions, CacheStats } from './RedisCache';
import { getCache as getRedisCache } from './RedisCache';

export type { CacheOptions, CacheStats } from './RedisCache';
export { cacheMiddleware } from './RedisCache';

export interface ICache {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  deleteByPattern(pattern: string): Promise<number>;
  invalidateByTags(tags: string[]): Promise<number>;
  clear(): Promise<void>;
  getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
  increment(key: string, amount?: number): Promise<number>;
  getStats(): CacheStats;
  resetStats(): void;
  healthCheck(): Promise<boolean>;
}

class UnifiedCache implements ICache {
  private primaryCache: RedisCache | null = null;
  private fallbackCache: MemoryCache;
  private useRedis: boolean;

  constructor() {
    this.useRedis = process.env.REDIS_URL !== undefined && process.env.NODE_ENV !== 'test';
    this.fallbackCache = getMemoryCache();

    if (this.useRedis) {
      try {
        this.primaryCache = getRedisCache();
      } catch (error) {
        structuredLogger.error('Failed to initialize Redis cache', error as Error);
        this.useRedis = false;
      }
    }

    structuredLogger.info('Cache initialized', {
      type: this.useRedis ? 'redis' : 'memory',
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
    });
  }

  async connect(): Promise<void> {
    if (this.primaryCache) {
      try {
        await this.primaryCache.connect();
      } catch (error) {
        structuredLogger.error(
          'Redis connection failed, falling back to memory cache',
          error as Error,
        );
        this.primaryCache = null;
        this.useRedis = false;
      }
    }
    await this.fallbackCache.connect();
  }

  async disconnect(): Promise<void> {
    if (this.primaryCache) {
      await this.primaryCache.disconnect();
    }
    await this.fallbackCache.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    const cache = this.getActiveCache();
    return cache.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    const cache = this.getActiveCache();
    return cache.set(key, value, options);
  }

  async delete(key: string): Promise<boolean> {
    const cache = this.getActiveCache();
    return cache.delete(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const cache = this.getActiveCache();
    return cache.deleteByPattern(pattern);
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    const cache = this.getActiveCache();
    return cache.invalidateByTags(tags);
  }

  async clear(): Promise<void> {
    const cache = this.getActiveCache();
    return cache.clear();
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cache = this.getActiveCache();
    return cache.getOrSet(key, factory, options);
  }

  async increment(key: string, amount?: number): Promise<number> {
    const cache = this.getActiveCache();
    return cache.increment(key, amount);
  }

  getStats(): CacheStats {
    const cache = this.getActiveCache();
    return cache.getStats();
  }

  resetStats(): void {
    const cache = this.getActiveCache();
    cache.resetStats();
  }

  async healthCheck(): Promise<boolean> {
    const cache = this.getActiveCache();
    return cache.healthCheck();
  }

  private getActiveCache(): ICache {
    if (this.primaryCache && this.useRedis) {
      return this.primaryCache;
    }
    return this.fallbackCache;
  }

  isUsingRedis(): boolean {
    return this.useRedis && this.primaryCache !== null;
  }
}

// Singleton instance
let cacheInstance: UnifiedCache | null = null;

/**
 * Get cache instance
 */
export function cache(): ICache {
  if (!cacheInstance) {
    cacheInstance = new UnifiedCache();

    // Auto-connect in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      cacheInstance.connect().catch((error) => {
        structuredLogger.error('Failed to connect cache on startup', error);
      });
    }
  }

  return cacheInstance;
}

/**
 * Cache decorator for methods
 */
export function Cacheable(options: CacheOptions & { keyPrefix?: string } = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheService = cache();
      const keyPrefix =
        options.keyPrefix ||
        `${(target as { constructor: { name: string } }).constructor.name}.${propertyKey}`;
      const key = `${keyPrefix}:${JSON.stringify(args)}`;

      return cacheService.getOrSet(key, () => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function CacheInvalidate(tags: string[] | ((args: unknown[]) => string[])) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      const cacheService = cache();
      const tagsToInvalidate = typeof tags === 'function' ? tags(args) : tags;

      await cacheService.invalidateByTags(tagsToInvalidate);

      return result;
    };

    return descriptor;
  };
}

/**
 * Common cache keys
 */
export const CacheKeys = {
  user: (id: number) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  lessonPlan: (id: string) => `lesson:${id}`,
  lessonPlans: (userId: number, page: number) => `lessons:user:${userId}:page:${page}`,
  curriculumExpectation: (id: string) => `curriculum:${id}`,
  curriculumSearch: (query: string) => `curriculum:search:${query}`,
  aiGeneration: (prompt: string) => `ai:${Buffer.from(prompt).toString('base64').substring(0, 32)}`,
  template: (id: string) => `template:${id}`,
  metrics: (type: string) => `metrics:${type}`,
};

/**
 * Common cache tags
 */
export const CacheTags = {
  user: (id: number) => [`user:${id}`],
  lessonPlans: (userId: number) => [`lessons:user:${userId}`],
  curriculum: () => ['curriculum'],
  ai: () => ['ai'],
  templates: () => ['templates'],
  metrics: () => ['metrics'],
};

/**
 * Cache utilities
 */
export const CacheUtils = {
  /**
   * Clear user-specific cache
   */
  async clearUserCache(userId: number): Promise<void> {
    const cacheService = cache();
    await cacheService.invalidateByTags(CacheTags.user(userId));
    await cacheService.invalidateByTags(CacheTags.lessonPlans(userId));
  },

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUp(): Promise<void> {
    structuredLogger.info('Cache warm-up started');

    // Add warm-up logic here
    // For example, pre-load popular curriculum expectations

    structuredLogger.info('Cache warm-up completed');
  },

  /**
   * Get cache health and statistics
   */
  async getHealth(): Promise<{
    healthy: boolean;
    type: string;
    stats: CacheStats;
  }> {
    const cacheService = cache() as UnifiedCache;
    const healthy = await cacheService.healthCheck();
    const stats = cacheService.getStats();

    return {
      healthy,
      type: cacheService.isUsingRedis() ? 'redis' : 'memory',
      stats,
    };
  },
};
