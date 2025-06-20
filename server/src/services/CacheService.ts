import BaseService from './base/BaseService';

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number; // Time to live in milliseconds
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  defaultTTL?: number; // Default TTL in milliseconds
  cleanupInterval?: number; // Cleanup interval in milliseconds
  maxSize?: number; // Maximum number of entries
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  memoryUsage: number; // Approximate memory usage in bytes
}

export class CacheService extends BaseService {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0
  };
  private cleanupInterval: NodeJS.Timeout;
  private readonly defaultTTL: number;
  private readonly maxSize: number;
  private readonly cleanupIntervalMs: number;

  constructor(options: CacheOptions = {}) {
    super('CacheService');
    
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.maxSize = options.maxSize || 10000; // Maximum cache entries
    this.cleanupIntervalMs = options.cleanupInterval || 10 * 60 * 1000; // 10 minutes
    
    this.startCleanupTask();
  }

  /**
   * Store a value in the cache
   */
  async set<T>(
    key: string, 
    value: T, 
    options: { ttl?: number; namespace?: string } = {}
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const ttl = options.ttl || this.defaultTTL;
      const now = Date.now();

      const entry: CacheEntry<T> = {
        key: key, // Store original key, not fullKey
        value,
        ttl,
        createdAt: now,
        accessCount: 0,
        lastAccessed: now
      };

      // Check if we need to evict entries to make room
      if (this.cache.size >= this.maxSize) {
        await this.evictLeastUsed();
      }

      this.cache.set(fullKey, entry);
      
      this.logger.debug({ key: fullKey, ttl }, 'Value cached');
    } catch (error) {
      this.handleError(error, { key, options });
    }
  }

  /**
   * Retrieve a value from the cache
   */
  async get<T>(
    key: string, 
    options: { namespace?: string } = {}
  ): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const entry = this.cache.get(fullKey) as CacheEntry<T> | undefined;

      if (!entry) {
        this.stats.misses++;
        this.logger.debug({ key: fullKey }, 'Cache miss');
        return null;
      }

      // Check if entry has expired
      const now = Date.now();
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(fullKey);
        this.stats.misses++;
        this.logger.debug({ key: fullKey }, 'Cache entry expired');
        return null;
      }

      // Update access stats
      entry.accessCount++;
      entry.lastAccessed = now;
      this.stats.hits++;

      this.logger.debug({ key: fullKey, accessCount: entry.accessCount }, 'Cache hit');
      return entry.value;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to get cache value');
      return null;
    }
  }

  /**
   * Get or set a value using a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: { ttl?: number; namespace?: string } = {}
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key, options);
      if (cached !== null) {
        return cached;
      }

      const value = await factory();
      await this.set(key, value, options);
      
      this.logger.debug({ key }, 'Value computed and cached');
      return value;
    } catch (error) {
      this.handleError(error, { key, options });
    }
  }

  /**
   * Delete a value from the cache
   */
  async delete(key: string, options: { namespace?: string } = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const deleted = this.cache.delete(fullKey);
      
      if (deleted) {
        this.logger.debug({ key: fullKey }, 'Cache entry deleted');
      }
      
      return deleted;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to delete cache entry');
      return false;
    }
  }

  /**
   * Clear all entries in a namespace (or entire cache if no namespace)
   */
  async clear(namespace?: string): Promise<number> {
    try {
      let deletedCount = 0;

      if (namespace) {
        const prefix = `${namespace}:`;
        for (const key of this.cache.keys()) {
          if (key.startsWith(prefix)) {
            this.cache.delete(key);
            deletedCount++;
          }
        }
        this.logger.info({ namespace, deletedCount }, 'Namespace cleared');
      } else {
        deletedCount = this.cache.size;
        this.cache.clear();
        this.stats.hits = 0;
        this.stats.misses = 0;
        this.logger.info({ deletedCount }, 'Cache cleared');
      }

      return deletedCount;
    } catch (error) {
      this.logger.error({ error, namespace }, 'Failed to clear cache');
      return 0;
    }
  }

  /**
   * Check if a key exists in the cache
   */
  async has(key: string, options: { namespace?: string } = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const entry = this.cache.get(fullKey);

      if (!entry) return false;

      // Check if expired
      const now = Date.now();
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(fullKey);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to check cache key existence');
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // Approximate memory usage calculation
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += this.estimateEntrySize(entry);
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimal places
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage
    };
  }

  /**
   * Get keys matching a pattern (supports wildcards)
   */
  async getKeys(pattern: string, namespace?: string): Promise<string[]> {
    try {
      const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
      const regex = new RegExp(
        '^' + fullPattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      );

      const matchingKeys: string[] = [];
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          // Remove namespace prefix if present
          const cleanKey = namespace ? key.substring(namespace.length + 1) : key;
          matchingKeys.push(cleanKey);
        }
      }

      return matchingKeys;
    } catch (error) {
      this.logger.error({ error, pattern, namespace }, 'Failed to get matching keys');
      return [];
    }
  }

  /**
   * Set multiple values at once
   */
  async setMultiple<T>(
    entries: { key: string; value: T; ttl?: number }[],
    options: { namespace?: string } = {}
  ): Promise<{ successful: number; failed: string[] }> {
    const operations = entries.map(entry => 
      () => this.set(entry.key, entry.value, { 
        ttl: entry.ttl, 
        namespace: options.namespace 
      })
    );

    const { successCount, errors } = await this.withParallel(operations, { 
      failFast: false 
    });

    const failed = entries
      .filter((_, index) => errors[index] !== null)
      .map(entry => entry.key);

    this.logger.info({ 
      total: entries.length, 
      successful: successCount, 
      failed: failed.length 
    }, 'Batch cache set completed');

    return { successful: successCount, failed };
  }

  /**
   * Get multiple values at once
   */
  async getMultiple<T>(
    keys: string[],
    options: { namespace?: string } = {}
  ): Promise<{ [key: string]: T | null }> {
    const operations = keys.map(key => 
      () => this.get<T>(key, options)
    );

    const { results } = await this.withParallel(operations, { 
      failFast: false 
    });

    const result: { [key: string]: T | null } = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = results[i] as T | null;
    }

    return result;
  }

  /**
   * Extend the TTL of an existing cache entry
   */
  async touch(
    key: string, 
    newTTL: number, 
    options: { namespace?: string } = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const entry = this.cache.get(fullKey);

      if (!entry) return false;

      // Check if expired
      const now = Date.now();
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(fullKey);
        return false;
      }

      entry.ttl = newTTL;
      entry.createdAt = now; // Reset creation time
      entry.lastAccessed = now;

      this.logger.debug({ key: fullKey, newTTL }, 'Cache entry TTL updated');
      return true;
    } catch (error) {
      this.logger.error({ error, key }, 'Failed to update cache entry TTL');
      return false;
    }
  }

  /**
   * Get cache entries sorted by various criteria
   */
  getTopEntries(
    sortBy: 'accessCount' | 'lastAccessed' | 'createdAt' = 'accessCount',
    limit: number = 10
  ): Array<{ key: string; accessCount: number; lastAccessed: Date; createdAt: Date }> {
    const entries = Array.from(this.cache.entries())
      .map(([, entry]) => ({
        key: entry.key, // Use the original key stored in the entry
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        createdAt: entry.createdAt
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case 'accessCount':
            return b.accessCount - a.accessCount;
          case 'lastAccessed':
            return b.lastAccessed - a.lastAccessed;
          case 'createdAt':
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      })
      .slice(0, limit)
      .map(entry => ({
        key: entry.key,
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed),
        createdAt: new Date(entry.createdAt)
      }));

    return entries;
  }

  // Private methods

  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private async evictLeastUsed(): Promise<void> {
    if (this.cache.size === 0) return;

    // Find the least recently used entry
    let lruKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.logger.info({ 
        evictedKey: lruKey, 
        cacheSize: this.cache.size,
        oldestAccess 
      }, 'Evicted LRU cache entry');
    }
  }

  private estimateEntrySize(entry: CacheEntry): number {
    // Rough estimation of memory usage
    const keySize = entry.key.length * 2; // 2 bytes per character (UTF-16)
    const valueSize = this.estimateValueSize(entry.value);
    const overhead = 100; // Approximate overhead for entry metadata
    
    return keySize + valueSize + overhead;
  }

  private estimateValueSize(value: unknown): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') {
      return value.length * 2; // 2 bytes per character
    }
    
    if (typeof value === 'number') {
      return 8; // 64-bit number
    }
    
    if (typeof value === 'boolean') {
      return 1;
    }
    
    if (typeof value === 'object') {
      // Rough estimation for objects
      const jsonString = JSON.stringify(value);
      return jsonString.length * 2;
    }
    
    return 100; // Default estimation
  }

  private startCleanupTask(): void {
    // Clean up expired entries at configured interval
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.createdAt > entry.ttl) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.info({ cleanedCount }, 'Cleaned up expired cache entries');
      }
    }, this.cleanupIntervalMs);
  }

  /**
   * Cleanup resources on service shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const cacheService = new CacheService();