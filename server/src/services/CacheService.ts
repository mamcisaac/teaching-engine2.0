/**
 * CacheService - In-memory caching service for the Teaching Engine
 * Provides a simple key-value cache with TTL support
 */

import { BaseService } from './base/BaseService.js';

export interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export class CacheService extends BaseService {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private maxSize: number;
  private defaultTtl: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(options: CacheOptions = {}) {
    super('CacheService');
    
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTtl = options.ttl || 300000; // 5 minutes default
    this.cleanupInterval = null;
    
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.maxSize,
      hitRate: 0,
    };

    this.initialize();
  }

  /**
   * Initialize the cache service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    
    // Start cleanup interval to remove expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute

    this.logger.info('CacheService initialized', {
      maxSize: this.maxSize,
      defaultTtl: this.defaultTtl,
    });
  }

  /**
   * Shutdown the cache service
   */
  protected async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.cache.clear();
    await super.shutdown();
  }

  /**
   * Get a value from the cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.value as T;
  }

  /**
   * Set a value in the cache
   */
  public set(key: string, value: any, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.defaultTtl;
    
    const entry: CacheEntry = {
      value,
      expiresAt: now + timeToLive,
      createdAt: now,
    };

    // Check if we need to make room
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.updateStats();
    
    this.logger.debug('Cache entry set', { key, ttl: timeToLive });
  }

  /**
   * Delete a value from the cache
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.updateStats();
    
    if (deleted) {
      this.logger.debug('Cache entry deleted', { key });
    }
    
    return deleted;
  }

  /**
   * Clear all entries from the cache
   */
  public clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.updateStats();
    
    this.logger.info('Cache cleared');
  }

  /**
   * Check if a key exists in the cache (and is not expired)
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get or set a value (memoization pattern)
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const existing = this.get<T>(key);
    
    if (existing !== null) {
      return existing;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Set a value with a specific expiration time
   */
  public setWithExpiration(key: string, value: any, expiresAt: Date): void {
    const ttl = expiresAt.getTime() - Date.now();
    
    if (ttl <= 0) {
      this.logger.warn('Attempted to set cache entry with past expiration', { key });
      return;
    }

    this.set(key, value, ttl);
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.updateStats();
      this.logger.debug('Cache cleanup completed', { removedCount });
    }
  }

  /**
   * Evict the oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.updateStats();
      this.logger.debug('Evicted oldest cache entry', { key: oldestKey });
    }
  }

  /**
   * Check dependencies specific to cache service
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDependencies = super.checkDependencies();
    
    return {
      ...baseDependencies,
      memory: this.checkMemoryUsage(),
    };
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): boolean {
    try {
      const used = process.memoryUsage();
      const totalMB = used.heapTotal / 1024 / 1024;
      
      // Consider unhealthy if using more than 500MB
      return totalMB < 500;
    } catch (error) {
      this.logger.error('Memory usage check failed:', error);
      return false;
    }
  }
}