import { describe, it, expect, jest, beforeEach, afterEach, afterAll } from '@jest/globals';
import { CacheService } from '../../src/services/CacheService';
// Import the singleton to clean it up
import { cacheService as singletonCacheService } from '../../src/services/CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;
  let originalDateNow: () => number;

  beforeEach(() => {
    cacheService = new CacheService();
    // Mock Date.now for consistent testing
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000000);
  });

  afterEach(() => {
    Date.now = originalDateNow;
    // Clean up the service
    (cacheService as unknown as { destroy: () => void }).destroy();
  });

  afterAll(() => {
    // Clean up the singleton instance that was created on import
    (singletonCacheService as unknown as { destroy: () => void }).destroy();
  });

  describe('set and get', () => {
    it('should store and retrieve values', async () => {
      await cacheService.set('key1', 'value1');
      const result = await cacheService.get('key1');

      expect(result).toBe('value1');
    });

    it('should store complex objects', async () => {
      const complexObject = {
        name: 'Test',
        nested: { value: 42 },
        array: [1, 2, 3],
      };

      await cacheService.set('complex', complexObject);
      const result = await cacheService.get('complex');

      expect(result).toEqual(complexObject);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent');

      expect(result).toBeNull();
    });

    it('should respect TTL', async () => {
      await cacheService.set('ttl-test', 'value', { ttl: 100 }); // 100ms TTL

      // Should exist initially
      expect(await cacheService.get('ttl-test')).toBe('value');

      // Mock time passage
      Date.now = jest.fn(() => 1000150); // 150ms later

      // Should be expired
      expect(await cacheService.get('ttl-test')).toBeNull();
    });

    it('should use namespace', async () => {
      await cacheService.set('key', 'value1', { namespace: 'ns1' });
      await cacheService.set('key', 'value2', { namespace: 'ns2' });
      await cacheService.set('key', 'value3'); // No namespace

      expect(await cacheService.get('key', { namespace: 'ns1' })).toBe('value1');
      expect(await cacheService.get('key', { namespace: 'ns2' })).toBe('value2');
      expect(await cacheService.get('key')).toBe('value3');
    });

    it('should track access count', async () => {
      await cacheService.set('access-test', 'value');

      // Access multiple times
      await cacheService.get('access-test');
      await cacheService.get('access-test');
      await cacheService.get('access-test');

      // Get the internal entry to check access count
      const cache = (cacheService as unknown as { cache: Map<string, unknown> }).cache;
      const entry = cache.get('access-test');

      expect(entry.accessCount).toBe(3);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      await cacheService.set('cached', 'existing');
      const factory = jest.fn().mockResolvedValue('new value');

      const result = await cacheService.getOrSet('cached', factory);

      expect(result).toBe('existing');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should compute and cache value if not exists', async () => {
      const factory = jest.fn().mockResolvedValue('computed');

      const result = await cacheService.getOrSet('new-key', factory);

      expect(result).toBe('computed');
      expect(factory).toHaveBeenCalledTimes(1);

      // Verify it was cached
      expect(await cacheService.get('new-key')).toBe('computed');
    });

    it('should handle factory errors', async () => {
      const factory = jest.fn().mockRejectedValue(new Error('Factory failed'));

      await expect(cacheService.getOrSet('error-key', factory)).rejects.toThrow('Factory failed');
    });
  });

  describe('delete', () => {
    it('should delete existing keys', async () => {
      await cacheService.set('to-delete', 'value');
      const deleted = await cacheService.delete('to-delete');

      expect(deleted).toBe(true);
      expect(await cacheService.get('to-delete')).toBeNull();
    });

    it('should return false for non-existent keys', async () => {
      const deleted = await cacheService.delete('non-existent');

      expect(deleted).toBe(false);
    });

    it('should delete with namespace', async () => {
      await cacheService.set('key', 'value', { namespace: 'ns' });
      const deleted = await cacheService.delete('key', { namespace: 'ns' });

      expect(deleted).toBe(true);
      expect(await cacheService.get('key', { namespace: 'ns' })).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all entries', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      await cacheService.set('key3', 'value3');

      const count = await cacheService.clear();

      expect(count).toBe(3);
      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
      expect(await cacheService.get('key3')).toBeNull();
    });

    it('should clear only namespace entries', async () => {
      await cacheService.set('key1', 'value1', { namespace: 'ns1' });
      await cacheService.set('key2', 'value2', { namespace: 'ns1' });
      await cacheService.set('key3', 'value3', { namespace: 'ns2' });
      await cacheService.set('key4', 'value4'); // No namespace

      const count = await cacheService.clear('ns1');

      expect(count).toBe(2);
      expect(await cacheService.get('key1', { namespace: 'ns1' })).toBeNull();
      expect(await cacheService.get('key2', { namespace: 'ns1' })).toBeNull();
      expect(await cacheService.get('key3', { namespace: 'ns2' })).toBe('value3');
      expect(await cacheService.get('key4')).toBe('value4');
    });
  });

  describe('has', () => {
    it('should check key existence', async () => {
      await cacheService.set('exists', 'value');

      expect(await cacheService.has('exists')).toBe(true);
      expect(await cacheService.has('not-exists')).toBe(false);
    });

    it('should check expired keys', async () => {
      await cacheService.set('expires', 'value', { ttl: 100 });

      expect(await cacheService.has('expires')).toBe(true);

      Date.now = jest.fn(() => 1000150); // 150ms later

      expect(await cacheService.has('expires')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      // Set some values
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');

      // Create some hits and misses
      await cacheService.get('key1'); // Hit
      await cacheService.get('key2'); // Hit
      await cacheService.get('key3'); // Miss
      await cacheService.get('key4'); // Miss

      const stats = cacheService.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(50); // 50%
      expect(stats.size).toBe(2);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should handle zero requests', () => {
      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('getKeys', () => {
    beforeEach(async () => {
      await cacheService.set('user:1', 'John');
      await cacheService.set('user:2', 'Jane');
      await cacheService.set('post:1', 'Post 1');
      await cacheService.set('key', 'value', { namespace: 'app' });
    });

    it('should get keys with exact match', async () => {
      const keys = await cacheService.getKeys('user:1');

      expect(keys).toEqual(['user:1']);
    });

    it('should get keys with wildcard', async () => {
      const userKeys = await cacheService.getKeys('user:*');

      expect(userKeys).toHaveLength(2);
      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');
    });

    it('should get keys with namespace', async () => {
      await cacheService.set('key1', 'value1', { namespace: 'app' });
      await cacheService.set('key2', 'value2', { namespace: 'app' });

      const keys = await cacheService.getKeys('*', 'app');

      expect(keys).toHaveLength(3); // 'key', 'key1', 'key2'
      expect(keys).toContain('key');
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('setMultiple and getMultiple', () => {
    it('should set multiple values', async () => {
      const entries = [
        { key: 'multi1', value: 'value1' },
        { key: 'multi2', value: 'value2', ttl: 1000 },
        { key: 'multi3', value: 'value3' },
      ];

      const result = await cacheService.setMultiple(entries);

      expect(result.successful).toBe(3);
      expect(result.failed).toHaveLength(0);

      // Verify all were set
      expect(await cacheService.get('multi1')).toBe('value1');
      expect(await cacheService.get('multi2')).toBe('value2');
      expect(await cacheService.get('multi3')).toBe('value3');
    });

    it('should get multiple values', async () => {
      await cacheService.set('get1', 'value1');
      await cacheService.set('get2', 'value2');
      // get3 doesn't exist

      const result = await cacheService.getMultiple(['get1', 'get2', 'get3']);

      expect(result).toEqual({
        get1: 'value1',
        get2: 'value2',
        get3: null,
      });
    });
  });

  describe('touch', () => {
    it('should extend TTL of existing entry', async () => {
      await cacheService.set('touch-test', 'value', { ttl: 100 });

      // Move time forward 50ms
      Date.now = jest.fn(() => 1000050);

      // Extend TTL
      const success = await cacheService.touch('touch-test', 200);
      expect(success).toBe(true);

      // Move forward another 150ms (total 200ms from original)
      Date.now = jest.fn(() => 1000200);

      // Should still exist due to extended TTL
      expect(await cacheService.get('touch-test')).toBe('value');
    });

    it('should return false for non-existent key', async () => {
      const success = await cacheService.touch('non-existent', 1000);

      expect(success).toBe(false);
    });

    it('should return false for expired entry', async () => {
      await cacheService.set('expired', 'value', { ttl: 100 });

      Date.now = jest.fn(() => 1000150);

      const success = await cacheService.touch('expired', 1000);

      expect(success).toBe(false);
    });
  });

  describe('getTopEntries', () => {
    beforeEach(async () => {
      // Set up entries with different access patterns
      await cacheService.set('popular', 'value');
      await cacheService.set('moderate', 'value');
      await cacheService.set('rare', 'value');

      // Create access patterns - popular will be accessed last in this sequence
      for (let i = 0; i < 10; i++) await cacheService.get('popular');
      for (let i = 0; i < 5; i++) await cacheService.get('moderate');
      await cacheService.get('rare');
    });

    it('should get top entries by access count', () => {
      const top = cacheService.getTopEntries('accessCount', 2);

      expect(top).toHaveLength(2);
      expect(top[0].key).toBe('popular');
      expect(top[0].accessCount).toBe(10);
      expect(top[1].key).toBe('moderate');
      expect(top[1].accessCount).toBe(5);
    });

    it('should get top entries by last accessed', async () => {
      // Create a fresh cache service for this test with long TTL
      const testCache = new CacheService({ defaultTTL: 60 * 60 * 1000 }); // 1 hour TTL

      // Start with a reasonable time
      let currentTime = 1000;
      Date.now = jest.fn(() => currentTime);

      // Set up entries
      await testCache.set('popular', 'value');
      await testCache.set('moderate', 'value');
      await testCache.set('rare', 'value');

      // Access them in a specific order with different times
      currentTime = 2000;
      await testCache.get('moderate');

      currentTime = 3000;
      await testCache.get('popular');

      currentTime = 4000;
      await testCache.get('rare'); // Access 'rare' most recently

      // Get top entries by last accessed
      const top = testCache.getTopEntries('lastAccessed', 3);

      expect(top).toHaveLength(3);

      // Should be ordered by most recent first
      expect(top[0].key).toBe('rare');
      expect(top[1].key).toBe('popular');
      expect(top[2].key).toBe('moderate');

      // Clean up
      (testCache as unknown as { destroy: () => void }).destroy();
    });
  });

  describe('eviction', () => {
    it('should evict least recently used when reaching max size', async () => {
      // Mock Date.now for consistent timestamps
      let currentTime = 1000;
      Date.now = jest.fn(() => currentTime);

      // Set max size to a small number for testing with long TTL
      const smallCacheService = new CacheService({ maxSize: 3, defaultTTL: 60 * 60 * 1000 }); // 1 hour TTL

      // Add 3 items at time 1000
      await smallCacheService.set('key1', 'value1');
      await smallCacheService.set('key2', 'value2');
      await smallCacheService.set('key3', 'value3');

      // Check initial state
      expect(smallCacheService.getStats().size).toBe(3);

      // Access key1 at time 2000
      currentTime = 2000;
      await smallCacheService.get('key1');

      // Access key2 at time 3000
      currentTime = 3000;
      await smallCacheService.get('key2');

      // key3 should now be the least recently used (still at time 1000)
      // key1 was accessed at 2000
      // key2 was accessed at 3000

      // Add a 4th item at time 4000 - should evict key3 (least recently used)
      currentTime = 4000;
      await smallCacheService.set('key4', 'value4');

      // Check final state - should have exactly 3 items
      const finalStats = smallCacheService.getStats();
      expect(finalStats.size).toBe(3);

      // key3 should be evicted (least recently used)
      const key3Value = await smallCacheService.get('key3');
      expect(key3Value).toBeNull();

      // These should still exist
      const key1Value = await smallCacheService.get('key1');
      const key2Value = await smallCacheService.get('key2');
      const key4Value = await smallCacheService.get('key4');

      expect(key1Value).toBe('value1');
      expect(key2Value).toBe('value2');
      expect(key4Value).toBe('value4');

      (smallCacheService as unknown as { destroy: () => void }).destroy();
    });
  });

  describe('cleanup task', () => {
    it('should clean up expired entries periodically', async () => {
      jest.useFakeTimers();

      // Mock Date.now to control time
      const startTime = 1000000;
      Date.now = jest.fn(() => startTime);

      // Create a new service with shorter cleanup interval for testing
      const testService = new CacheService({ cleanupInterval: 1000 });

      // Set some entries with short TTL
      await testService.set('expire1', 'value', { ttl: 100 });
      await testService.set('expire2', 'value', { ttl: 100 });
      await testService.set('keep', 'value', { ttl: 10000 });

      // Verify all entries exist
      expect(testService.getStats().size).toBe(3);

      // Advance time past TTL for expire1 and expire2
      Date.now = jest.fn(() => startTime + 200);

      // Trigger cleanup by advancing timer to cleanup interval
      jest.advanceTimersByTime(1000);

      // Only 'keep' should remain
      const stats = testService.getStats();
      expect(stats.size).toBe(1);
      expect(await testService.get('keep')).toBe('value');
      expect(await testService.get('expire1')).toBeNull();
      expect(await testService.get('expire2')).toBeNull();

      (testService as unknown as { destroy: () => void }).destroy();
      jest.useRealTimers();
    });
  });
});
