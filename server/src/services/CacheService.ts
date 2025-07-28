/**
 * Cache Service
 * Simple in-memory cache with TTL support
 */

interface CacheItem<T = unknown> {
  value: T;
  expires: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem>();

  constructor() {
    // Clear expired items every 5 minutes
    setInterval(() => {
      this.clearExpired();
    }, 5 * 60 * 1000);
  }

  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    // Safe type assertion after validation
    return item.value as T;
  }

  set<T = unknown>(key: string, value: T, ttlMs = 3600000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}