/**
 * Redis Cache Service
 * Production-ready caching layer with Redis
 */

import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

import { PerformanceLogger } from '../../utils/logger-migration';
import { structuredLogger } from '../../utils/structuredLogger';
import { safeJsonParse } from '../../utils/type-guards';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

export class RedisCache {
  private client: RedisClientType;
  private isConnected = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
  };

  constructor(
    private config: {
      url?: string;
      host?: string;
      port?: number;
      password?: string;
      db?: number;
      keyPrefix?: string;
      defaultTtl?: number;
      maxRetries?: number;
      enableCompression?: boolean;
    } = {},
  ) {
    this.client = createClient({
      url: config.url ?? `redis://${config.host ?? 'localhost'}:${config.port ?? 6379}`,
      password: config.password,
      database: config.db ?? 0,
      socket: {
        reconnectStrategy: (retries) => {
          const maxRetries = config.maxRetries ?? 3;
          if (retries > maxRetries) {
            structuredLogger.error('Redis reconnection failed', new Error('Max retries exceeded'), {
              retries,
              maxRetries,
            });
            return false;
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      structuredLogger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      structuredLogger.info('Redis client ready');
    });

    this.client.on('error', (err) => {
      structuredLogger.error('Redis client error', err);
      this.stats.errors++;
    });

    this.client.on('end', () => {
      structuredLogger.info('Redis client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
return;
}

    try {
      await this.client.connect();
    } catch (error) {
      structuredLogger.error('Failed to connect to Redis', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
return;
}

    try {
      await this.client.quit();
    } catch (error) {
      structuredLogger.error('Failed to disconnect from Redis', error as Error);
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      structuredLogger.warn('Redis not connected, cache bypassed');
      return null;
    }

    const perfLogger = new PerformanceLogger('cache.get');
    const fullKey = this.getFullKey(key);

    try {
      const value = await this.client.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        perfLogger.end({ hit: false, key });
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      const parsed = this.deserializeValue<T>(value);
      perfLogger.end({ hit: true, key, size: value.length });

      return parsed;
    } catch (error) {
      structuredLogger.error('Cache get error', error as Error, { key });
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      structuredLogger.warn('Redis not connected, cache bypassed');
      return false;
    }

    const perfLogger = new PerformanceLogger('cache.set');
    const fullKey = this.getFullKey(key);
    const ttl = options.ttl ?? this.config.defaultTtl ?? 3600; // Default 1 hour

    try {
      const serialized = this.serializeValue(value, options.compress);

      if (ttl > 0) {
        await this.client.setEx(fullKey, ttl, serialized);
      } else {
        await this.client.set(fullKey, serialized);
      }

      // Handle tags
      if (options.tags && options.tags.length > 0) {
        await this.addToTags(fullKey, options.tags);
      }

      this.stats.sets++;
      perfLogger.end({ key, ttl, size: serialized.length });

      return true;
    } catch (error) {
      structuredLogger.error('Cache set error', error as Error, { key });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
return false;
}

    const fullKey = this.getFullKey(key);

    try {
      const result = await this.client.del(fullKey);
      this.stats.deletes++;

      structuredLogger.debug('Cache key deleted', { key, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      structuredLogger.error('Cache delete error', error as Error, { key });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.isConnected) {
return 0;
}

    const fullPattern = this.getFullKey(pattern);

    try {
      const keys = await this.client.keys(fullPattern);
      if (keys.length === 0) {
return 0;
}

      const result = await this.client.del(keys);
      this.stats.deletes += result;

      structuredLogger.info('Cache keys deleted by pattern', { pattern, count: result });
      return result;
    } catch (error) {
      structuredLogger.error('Cache delete by pattern error', error as Error, { pattern });
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    if (!this.isConnected || tags.length === 0) {
return 0;
}

    let totalDeleted = 0;

    try {
      for (const tag of tags) {
        const tagKey = `${this.config.keyPrefix ?? 'cache'}:tag:${tag}`;
        const keys = await this.client.sMembers(tagKey);

        if (keys.length > 0) {
          const deleted = await this.client.del(keys);
          totalDeleted += deleted;

          // Clean up the tag set
          await this.client.del(tagKey);
        }
      }

      structuredLogger.info('Cache invalidated by tags', { tags, deleted: totalDeleted });
      return totalDeleted;
    } catch (error) {
      structuredLogger.error('Cache invalidate by tags error', error as Error, { tags });
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.isConnected) {
return;
}

    try {
      await this.client.flushDb();
      this.resetStats();

      structuredLogger.warn('Cache cleared');
    } catch (error) {
      structuredLogger.error('Cache clear error', error as Error);
      this.stats.errors++;
    }
  }

  /**
   * Get or set cache value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    const perfLogger = new PerformanceLogger('cache.factory');
    const value = await factory();
    perfLogger.end({ key });

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount = 1): Promise<number> {
    if (!this.isConnected) {
return 0;
}

    const fullKey = this.getFullKey(key);

    try {
      const result = await this.client.incrBy(fullKey, amount);
      return result;
    } catch (error) {
      structuredLogger.error('Cache increment error', error as Error, { key });
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
return false;
}

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Private helper methods

  private getFullKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key;
  }

  private serializeValue<T>(value: T, compress?: boolean): string {
    const json = JSON.stringify(value);

    if (compress && this.config.enableCompression && json.length > 1024) {
      // In production, use zlib compression
      // For now, just return JSON
      return json;
    }

    return json;
  }

  private deserializeValue<T>(value: string): T {
    try {
      const parsed = safeJsonParse(value, {});
      if (parsed === undefined) {
        throw new Error('Failed to parse JSON value');
      }
      return parsed as T;
    } catch (error) {
      structuredLogger.error('Cache deserialization error', error as Error);
      throw error;
    }
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.client.multi();

    for (const tag of tags) {
      const tagKey = `${this.config.keyPrefix ?? 'cache'}:tag:${tag}`;
      pipeline.sAdd(tagKey, key);
    }

    await pipeline.exec();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.hitRate = this.stats.hits / total;
    }
  }
}

// Singleton instance
let cacheInstance: RedisCache | null = null;

/**
 * Get or create cache instance
 */
export function getCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache({
      url: process.env.REDIS_URL,
      keyPrefix: 'teaching-engine',
      defaultTtl: 3600,
      enableCompression: true,
    });

    // Auto-connect in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      cacheInstance.connect().catch((error) => {
        structuredLogger.error('Failed to connect to Redis on startup', error);
      });
    }
  }

  return cacheInstance;
}

/**
 * Express middleware for cache
 */
export function cacheMiddleware(keyPattern: string, options: CacheOptions = {}) {
  const cache = getCache();

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyPattern
      .replace(':id', req.params.id ?? '')
      .replace(':userId', (req as Request & { user?: { id: string } }).user?.id ?? 'anonymous');

    // Try to get from cache
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to cache the response
    res.json = function (data: unknown) {
      res.setHeader('X-Cache', 'MISS');

      // Cache the response asynchronously
      cache.set(key, data, options).catch((error) => {
        structuredLogger.error('Failed to cache response', error);
      });

      return originalJson(data);
    };

    next();
    return;
  };
}
