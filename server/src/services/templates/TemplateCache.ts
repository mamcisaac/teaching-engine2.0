/**
 * Template Cache Service
 * Handles intelligent caching of rendered templates
 */

import { BaseService } from '../base/BaseService';

import type { RenderResult } from './engines/RenderEngine';

export interface CacheOptions {
  maxSize?: number;
  maxAge?: number; // in milliseconds
  enableCompression?: boolean;
}

export interface CacheStats {
  size: number;
  memoryUsage: number;
  hitRate: number;
  maxSize: number;
  maxAge: number;
}

interface CacheEntry {
  result: RenderResult;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class TemplateCache extends BaseService {
  private static instance: TemplateCache;
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxAge: number;
  private enableCompression: boolean;
  private hits = 0;
  private misses = 0;

  private constructor(options: CacheOptions = {}) {
    super('TemplateCache');
    this.maxSize = options.maxSize ?? 1000;
    this.maxAge = options.maxAge ?? 60 * 60 * 1000; // 1 hour default
    this.enableCompression = options.enableCompression ?? false;
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options?: CacheOptions): TemplateCache {
    if (!TemplateCache.instance) {
      TemplateCache.instance = new TemplateCache(options);
    }
    return TemplateCache.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info(`Template cache initialized: maxSize=${this.maxSize}, maxAge=${this.maxAge}ms, enableCompression=${this.enableCompression}`);
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      cacheMap: !!this.cache,
    };
  }

  /**
   * Get cached result
   */
  public get(key: string): RenderResult | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    this.logger.debug(`Cache hit: key=${key}, accessCount=${entry.accessCount}`);
    return entry.result;
  }

  /**
   * Set cache entry
   */
  public set(key: string, result: RenderResult): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    
    this.logger.debug(`Cache entry added: key=${key}, size=${this.cache.size}, contentSize=${this.getContentSize(result)}`);
  }

  /**
   * Remove cache entry
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache entry removed: key=${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    const {size} = this.cache;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    
    this.logger.info(`Template cache cleared: entriesCleared=${size}`);
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const memoryUsage = this.calculateMemoryUsage();
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      size: this.cache.size,
      memoryUsage,
      hitRate,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    };
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache keys
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries by pattern
   */
  public getByPattern(pattern: RegExp): Map<string, RenderResult> {
    const matches = new Map<string, RenderResult>();
    
    for (const [key, entry] of this.cache) {
      if (pattern.test(key)) {
        // Check if expired
        if (Date.now() - entry.timestamp <= this.maxAge) {
          matches.set(key, entry.result);
        } else {
          this.cache.delete(key);
        }
      }
    }

    return matches;
  }

  /**
   * Invalidate cache entries by pattern
   */
  public invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.logger.info(`Cache entries invalidated by pattern: pattern=${pattern.toString()}, invalidated=${invalidated}`);

    return invalidated;
  }

  /**
   * Warm cache with predefined entries
   */
  public async warmCache(entries: { key: string; result: RenderResult }[]): Promise<void> {
    for (const { key, result } of entries) {
      this.set(key, result);
    }

    this.logger.info(`Cache warmed: entriesAdded=${entries.length}`);
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`Evicted LRU cache entry: key=${oldestKey}`);
    }
  }

  /**
   * Start cleanup interval for expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up expired cache entries: cleaned=${cleaned}`);
    }
  }

  /**
   * Calculate total memory usage
   */
  private calculateMemoryUsage(): number {
    let memoryUsage = 0;
    
    for (const entry of this.cache.values()) {
      memoryUsage += this.getContentSize(entry.result);
    }

    return memoryUsage;
  }

  /**
   * Get content size
   */
  private getContentSize(result: RenderResult): number {
    if (typeof result.content === 'string') {
      return result.content.length * 2; // 2 bytes per character
    } else if (Buffer.isBuffer(result.content)) {
      return result.content.length;
    }
    return 0;
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    this.clear();
    this.logger.info('Template cache cleanup completed');
  }
}

// Export singleton instance
export const templateCache = TemplateCache.getInstance();