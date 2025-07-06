/**
 * In-Memory Cache Service
 * Fallback cache implementation for development/testing
 */

import { structuredLogger } from '../../utils/structuredLogger';
import { CacheOptions, CacheStats } from './RedisCache';

interface CacheEntry<T> {
  value: T;
  expires: number;
  tags: string[];
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private config: {
      maxSize?: number;
      defaultTtl?: number;
      cleanupInterval?: number;
    } = {},
  ) {
    // Start cleanup interval
    const interval = config.cleanupInterval || 60000; // 1 minute default
    this.cleanupInterval = setInterval(() => this.cleanup(), interval);
  }

  async connect(): Promise<void> {
    structuredLogger.info('Memory cache initialized');
  }

  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.tagIndex.clear();
    structuredLogger.info('Memory cache disconnected');
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check expiration
    if (entry.expires > 0 && entry.expires < Date.now()) {
      this.cache.delete(key);
      this.removeFromTags(key, entry.tags);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      // Check max size
      if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }

      const ttl = options.ttl || this.config.defaultTtl || 3600;
      const expires = ttl > 0 ? Date.now() + ttl * 1000 : 0;
      const tags = options.tags || [];

      this.cache.set(key, { value, expires, tags });

      // Update tag index
      if (tags.length > 0) {
        this.addToTags(key, tags);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      structuredLogger.error('Memory cache set error', error as Error, { key });
      this.stats.errors++;
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.removeFromTags(key, entry.tags);
    this.stats.deletes++;
    return true;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.removeFromTags(key, entry.tags);
        deleted++;
      }
    }

    this.stats.deletes += deleted;
    return deleted;
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;

    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (!keys) continue;

      for (const key of keys) {
        if (this.cache.delete(key)) {
          totalDeleted++;
        }
      }

      this.tagIndex.delete(tag);
    }

    this.stats.deletes += totalDeleted;
    return totalDeleted;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.resetStats();
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

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

  async healthCheck(): Promise<boolean> {
    return true;
  }

  // Private helper methods

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires > 0 && entry.expires < now) {
        this.cache.delete(key);
        this.removeFromTags(key, entry.tags);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      structuredLogger.debug('Memory cache cleanup', { cleaned });
    }
  }

  private evictOldest(): void {
    // Simple FIFO eviction
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      const entry = this.cache.get(firstKey);
      this.cache.delete(firstKey);
      if (entry) {
        this.removeFromTags(firstKey, entry.tags);
      }
    }
  }

  private addToTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private removeFromTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.hitRate = this.stats.hits / total;
    }
  }
}

// Singleton instance
let memoryCacheInstance: MemoryCache | null = null;

/**
 * Get or create memory cache instance
 */
export function getMemoryCache(): MemoryCache {
  if (!memoryCacheInstance) {
    memoryCacheInstance = new MemoryCache({
      maxSize: 1000,
      defaultTtl: 3600,
      cleanupInterval: 60000,
    });
  }

  return memoryCacheInstance;
}
