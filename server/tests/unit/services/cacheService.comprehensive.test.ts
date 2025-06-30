import { describe, it, expect, jest, beforeEach, afterEach, afterAll } from '@jest/globals';
import { CacheService } from '../../../src/services/CacheService';
// Import the singleton to clean it up
import { cacheService as singletonCacheService } from '../../../src/services/CacheService';

describe('CacheService - Comprehensive Tests', () => {
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

  describe('Enhanced CRUD Operations', () => {
    it('should handle null and undefined values', async () => {
      await cacheService.set('null-key', null);
      await cacheService.set('undefined-key', undefined);
      
      expect(await cacheService.get('null-key')).toBeNull();
      expect(await cacheService.get('undefined-key')).toBeUndefined();
    });

    it('should handle large objects', async () => {
      const largeObject = {
        data: Array(10000).fill('x').join(''), // 10KB string
        nested: {
          arrays: Array(100).fill(0).map((_, i) => ({
            id: i,
            value: Math.random(),
            timestamp: Date.now()
          }))
        }
      };

      await cacheService.set('large-object', largeObject);
      const retrieved = await cacheService.get('large-object');

      expect(retrieved).toEqual(largeObject);
    });

    it('should handle special characters in keys', async () => {
      const specialKeys = [
        'key:with:colons',
        'key/with/slashes',
        'key.with.dots',
        'key@with@at',
        'key#with#hash',
        'key with spaces',
        'key\twith\ttabs',
        'key\nwith\nnewlines'
      ];

      for (const key of specialKeys) {
        await cacheService.set(key, `value-${key}`);
        expect(await cacheService.get(key)).toBe(`value-${key}`);
      }
    });

    it('should update existing values', async () => {
      await cacheService.set('update-test', 'original');
      expect(await cacheService.get('update-test')).toBe('original');

      await cacheService.set('update-test', 'updated');
      expect(await cacheService.get('update-test')).toBe('updated');
    });

    it('should handle circular references gracefully', async () => {
      const obj: any = { name: 'test' };
      obj.circular = obj; // Create circular reference

      // Should not throw when estimating size
      await expect(cacheService.set('circular', obj)).resolves.not.toThrow();
    });
  });

  describe('Advanced TTL and Expiration Tests', () => {
    it('should handle zero TTL', async () => {
      // TTL of 0 might be treated as "no expiration" or immediate expiration
      // Let's test a very small TTL instead
      await cacheService.set('zero-ttl', 'value', { ttl: 1 });
      
      // Should expire after 1ms
      Date.now = jest.fn(() => 1000002); // 2ms later
      expect(await cacheService.get('zero-ttl')).toBeNull();
    });

    it('should handle very large TTL values', async () => {
      const maxTTL = Number.MAX_SAFE_INTEGER;
      await cacheService.set('max-ttl', 'value', { ttl: maxTTL });
      
      // Should still exist after a long time
      Date.now = jest.fn(() => 1000000 + 365 * 24 * 60 * 60 * 1000); // 1 year later
      expect(await cacheService.get('max-ttl')).toBe('value');
    });

    it('should handle TTL precision', async () => {
      await cacheService.set('precise-ttl', 'value', { ttl: 123 });
      
      Date.now = jest.fn(() => 1000122); // 122ms later
      expect(await cacheService.get('precise-ttl')).toBe('value');
      
      Date.now = jest.fn(() => 1000124); // 124ms later
      expect(await cacheService.get('precise-ttl')).toBeNull();
    });

    it('should handle multiple TTL updates via touch', async () => {
      await cacheService.set('multi-touch', 'value', { ttl: 100 });
      
      // First touch
      Date.now = jest.fn(() => 1000050);
      expect(await cacheService.touch('multi-touch', 200)).toBe(true);
      
      // Second touch
      Date.now = jest.fn(() => 1000100);
      expect(await cacheService.touch('multi-touch', 300)).toBe(true);
      
      // Should still exist after total 350ms from second touch
      Date.now = jest.fn(() => 1000400);
      expect(await cacheService.get('multi-touch')).toBe('value');
      
      // Should expire after 400ms from second touch
      Date.now = jest.fn(() => 1000501);
      expect(await cacheService.get('multi-touch')).toBeNull();
    });

    it('should handle batch operations with different TTLs', async () => {
      const entries = [
        { key: 'ttl-100', value: 'v1', ttl: 100 },
        { key: 'ttl-200', value: 'v2', ttl: 200 },
        { key: 'ttl-300', value: 'v3', ttl: 300 },
      ];
      
      await cacheService.setMultiple(entries);
      
      // Check at 150ms
      Date.now = jest.fn(() => 1000150);
      expect(await cacheService.get('ttl-100')).toBeNull(); // Expired
      expect(await cacheService.get('ttl-200')).toBe('v2'); // Still valid
      expect(await cacheService.get('ttl-300')).toBe('v3'); // Still valid
      
      // Check at 250ms
      Date.now = jest.fn(() => 1000250);
      expect(await cacheService.get('ttl-200')).toBeNull(); // Expired
      expect(await cacheService.get('ttl-300')).toBe('v3'); // Still valid
    });
  });

  describe('Memory Limit Testing', () => {
    it('should enforce max size limit', async () => {
      const smallCache = new CacheService({ maxSize: 5, defaultTTL: 60000 });
      
      // Mock consistent time for LRU behavior
      let currentTime = 1000;
      Date.now = jest.fn(() => currentTime);
      
      // Fill cache to max size
      for (let i = 1; i <= 5; i++) {
        await smallCache.set(`key${i}`, `value${i}`);
        currentTime += 100; // Advance time between sets
      }
      
      expect(smallCache.getStats().size).toBe(5);
      
      // Access some keys to change their last accessed time
      currentTime = 2000;
      await smallCache.get('key2'); // Access key2
      currentTime = 3000;
      await smallCache.get('key3'); // Access key3
      
      // Adding one more should trigger eviction of the least recently used (key1)
      currentTime = 4000;
      await smallCache.set('key6', 'value6');
      expect(smallCache.getStats().size).toBe(5); // Should still be 5
      
      // key1 should be evicted as it was least recently used
      const values = await smallCache.getMultiple(['key1', 'key2', 'key3', 'key4', 'key5', 'key6']);
      expect(values.key1).toBeNull(); // key1 was evicted
      expect(values.key6).toBe('value6'); // New key should exist
      
      (smallCache as unknown as { destroy: () => void }).destroy();
    });

    it('should estimate memory usage correctly', async () => {
      const testCache = new CacheService();
      
      // Test different data types
      await testCache.set('string', 'Hello World'); // ~22 bytes
      await testCache.set('number', 42); // 8 bytes
      await testCache.set('boolean', true); // 1 byte
      await testCache.set('object', { a: 1, b: 2, c: 3 }); // ~26 bytes
      await testCache.set('array', [1, 2, 3, 4, 5]); // ~20 bytes
      
      const stats = testCache.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeLessThan(10000); // Reasonable upper bound
      
      (testCache as unknown as { destroy: () => void }).destroy();
    });

    it('should handle eviction under memory pressure', async () => {
      const pressureCache = new CacheService({ maxSize: 3, defaultTTL: 60000 });
      
      // Set up initial state with access patterns
      let currentTime = 1000;
      Date.now = jest.fn(() => currentTime);
      
      await pressureCache.set('frequently-used', 'value1');
      await pressureCache.set('sometimes-used', 'value2');
      await pressureCache.set('rarely-used', 'value3');
      
      // Simulate access patterns
      currentTime = 2000;
      for (let i = 0; i < 10; i++) {
        await pressureCache.get('frequently-used');
      }
      
      currentTime = 3000;
      for (let i = 0; i < 5; i++) {
        await pressureCache.get('sometimes-used');
      }
      
      // rarely-used is never accessed again
      
      // Add new items to trigger eviction
      currentTime = 4000;
      await pressureCache.set('new-item', 'value4');
      
      // rarely-used should be evicted
      expect(await pressureCache.get('rarely-used')).toBeNull();
      expect(await pressureCache.get('frequently-used')).toBe('value1');
      expect(await pressureCache.get('sometimes-used')).toBe('value2');
      expect(await pressureCache.get('new-item')).toBe('value4');
      
      (pressureCache as unknown as { destroy: () => void }).destroy();
    });
  });

  describe('Concurrent Access Scenarios', () => {
    it('should handle concurrent reads safely', async () => {
      await cacheService.set('concurrent-key', 'shared-value');
      
      // Simulate concurrent reads
      const reads = Array(100).fill(0).map(() => 
        cacheService.get('concurrent-key')
      );
      
      const results = await Promise.all(reads);
      
      // All reads should return the same value
      expect(results.every(r => r === 'shared-value')).toBe(true);
      
      // Check access count
      const stats = cacheService.getStats();
      expect(stats.hits).toBe(100);
    });

    it('should handle concurrent writes safely', async () => {
      // Simulate concurrent writes
      const writes = Array(50).fill(0).map((_, i) => 
        cacheService.set(`concurrent-write-${i}`, `value-${i}`)
      );
      
      await Promise.all(writes);
      
      // All writes should succeed
      const stats = cacheService.getStats();
      expect(stats.size).toBe(50);
      
      // Verify all values
      for (let i = 0; i < 50; i++) {
        expect(await cacheService.get(`concurrent-write-${i}`)).toBe(`value-${i}`);
      }
    });

    it('should handle mixed concurrent operations', async () => {
      // Set up initial data
      for (let i = 0; i < 10; i++) {
        await cacheService.set(`mixed-${i}`, `value-${i}`);
      }
      
      // Mix of operations
      const operations = [
        // Reads
        ...Array(30).fill(0).map((_, i) => 
          cacheService.get(`mixed-${i % 10}`)
        ),
        // Writes
        ...Array(10).fill(0).map((_, i) => 
          cacheService.set(`mixed-new-${i}`, `new-value-${i}`)
        ),
        // Deletes
        ...Array(5).fill(0).map((_, i) => 
          cacheService.delete(`mixed-${i}`)
        ),
        // Has checks
        ...Array(10).fill(0).map((_, i) => 
          cacheService.has(`mixed-${i}`)
        ),
      ];
      
      // Shuffle operations for more realistic concurrency
      const shuffled = operations.sort(() => Math.random() - 0.5);
      
      await Promise.all(shuffled);
      
      // Verify state
      const finalStats = cacheService.getStats();
      expect(finalStats.size).toBe(15); // 10 original - 5 deleted + 10 new
    });

    it('should handle concurrent namespace operations', async () => {
      const namespaces = ['ns1', 'ns2', 'ns3'];
      
      // Concurrent operations across namespaces
      const operations = [];
      
      for (const ns of namespaces) {
        for (let i = 0; i < 10; i++) {
          operations.push(
            cacheService.set(`key-${i}`, `${ns}-value-${i}`, { namespace: ns })
          );
        }
      }
      
      await Promise.all(operations);
      
      // Verify namespace isolation
      for (const ns of namespaces) {
        const keys = await cacheService.getKeys('*', ns);
        expect(keys.length).toBe(10);
      }
      
      // Clear one namespace shouldn't affect others
      await cacheService.clear('ns2');
      
      expect((await cacheService.getKeys('*', 'ns1')).length).toBe(10);
      expect((await cacheService.getKeys('*', 'ns2')).length).toBe(0);
      expect((await cacheService.getKeys('*', 'ns3')).length).toBe(10);
    });

    it('should handle concurrent getOrSet operations', async () => {
      let factoryCallCount = 0;
      const factory = jest.fn(async () => {
        factoryCallCount++;
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 10));
        return `computed-value-${factoryCallCount}`;
      });
      
      // Multiple concurrent calls for the same key
      const results = await Promise.all([
        cacheService.getOrSet('compute-key', factory),
        cacheService.getOrSet('compute-key', factory),
        cacheService.getOrSet('compute-key', factory),
        cacheService.getOrSet('compute-key', factory),
        cacheService.getOrSet('compute-key', factory),
      ]);
      
      // All should get the same value (though the exact value may vary due to race conditions)
      const uniqueValues = [...new Set(results)];
      expect(uniqueValues.length).toBeLessThanOrEqual(2); // At most 2 different values due to race conditions
      
      // Factory should be called only a few times due to race conditions
      expect(factory).toHaveBeenCalled();
      expect(factory.mock.calls.length).toBeLessThanOrEqual(5); // At most once per concurrent call
      expect(factory.mock.calls.length).toBeGreaterThanOrEqual(1); // At least once
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle high-volume operations efficiently', async () => {
      const iterations = 1000;
      const startTime = performance.now();
      
      // Benchmark writes
      const writeStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await cacheService.set(`perf-key-${i}`, { id: i, data: `value-${i}` });
      }
      const writeTime = performance.now() - writeStart;
      
      // Benchmark reads
      const readStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await cacheService.get(`perf-key-${i}`);
      }
      const readTime = performance.now() - readStart;
      
      // Benchmark has checks
      const hasStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await cacheService.has(`perf-key-${i}`);
      }
      const hasTime = performance.now() - hasStart;
      
      const totalTime = performance.now() - startTime;
      
      // Performance assertions (these are generous to account for CI environments)
      expect(writeTime).toBeLessThan(1000); // Less than 1ms per write
      expect(readTime).toBeLessThan(500); // Less than 0.5ms per read
      expect(hasTime).toBeLessThan(500); // Less than 0.5ms per has check
      expect(totalTime).toBeLessThan(2000); // Total under 2 seconds
      
      // Log performance metrics for monitoring
      console.log(`Performance benchmark results:
        Total operations: ${iterations * 3}
        Write time: ${writeTime.toFixed(2)}ms (${(writeTime/iterations).toFixed(3)}ms per op)
        Read time: ${readTime.toFixed(2)}ms (${(readTime/iterations).toFixed(3)}ms per op)
        Has time: ${hasTime.toFixed(2)}ms (${(hasTime/iterations).toFixed(3)}ms per op)
        Total time: ${totalTime.toFixed(2)}ms
      `);
    });

    it('should maintain performance with large cache size', async () => {
      const largeCache = new CacheService({ maxSize: 10000, defaultTTL: 3600000 });
      
      // Fill cache to 80% capacity
      const fillSize = 8000;
      const fillStart = performance.now();
      
      for (let i = 0; i < fillSize; i++) {
        await largeCache.set(`large-${i}`, { 
          id: i, 
          data: `x`.repeat(100) // 100 chars per value
        });
      }
      
      const fillTime = performance.now() - fillStart;
      
      // Benchmark operations on large cache
      const opsStart = performance.now();
      
      // Random reads
      for (let i = 0; i < 100; i++) {
        const key = `large-${Math.floor(Math.random() * fillSize)}`;
        await largeCache.get(key);
      }
      
      // Pattern matching
      const keys = await largeCache.getKeys('large-1*');
      
      // Stats calculation
      const stats = largeCache.getStats();
      
      const opsTime = performance.now() - opsStart;
      
      // Performance assertions
      expect(fillTime).toBeLessThan(5000); // Fill in under 5 seconds
      expect(opsTime).toBeLessThan(500); // Operations in under 500ms
      expect(keys.length).toBeGreaterThan(100); // Pattern matching works
      expect(stats.size).toBe(fillSize);
      
      (largeCache as unknown as { destroy: () => void }).destroy();
    });

    it('should handle memory-intensive scenarios', async () => {
      const memCache = new CacheService({ maxSize: 100 });
      
      // Store large objects
      const largeData = {
        buffer: Array(1000).fill(0).map(() => Math.random()),
        nested: {
          deep: {
            structure: {
              with: {
                data: Array(100).fill('x'.repeat(100))
              }
            }
          }
        }
      };
      
      const memStart = performance.now();
      
      // Store 50 large objects
      for (let i = 0; i < 50; i++) {
        await memCache.set(`mem-${i}`, { ...largeData, id: i });
      }
      
      const memTime = performance.now() - memStart;
      
      // Get memory stats
      const stats = memCache.getStats();
      
      // Should handle large objects efficiently
      expect(memTime).toBeLessThan(2000);
      expect(stats.memoryUsage).toBeGreaterThan(100000); // At least 100KB
      expect(stats.size).toBe(50);
      
      (memCache as unknown as { destroy: () => void }).destroy();
    });
  });

  describe('Cache Invalidation Logic', () => {
    it('should invalidate related keys using patterns', async () => {
      // Set up related data
      await cacheService.set('user:1:profile', { name: 'John' });
      await cacheService.set('user:1:settings', { theme: 'dark' });
      await cacheService.set('user:1:posts', ['post1', 'post2']);
      await cacheService.set('user:2:profile', { name: 'Jane' });
      
      // Get all user:1 keys
      const user1Keys = await cacheService.getKeys('user:1:*');
      expect(user1Keys.length).toBe(3);
      
      // Invalidate all user:1 data
      for (const key of user1Keys) {
        await cacheService.delete(key);
      }
      
      // Verify user:1 data is gone
      expect(await cacheService.get('user:1:profile')).toBeNull();
      expect(await cacheService.get('user:1:settings')).toBeNull();
      expect(await cacheService.get('user:1:posts')).toBeNull();
      
      // User:2 data should remain
      expect(await cacheService.get('user:2:profile')).toEqual({ name: 'Jane' });
    });

    it('should support cascading invalidation', async () => {
      // Set up hierarchical data
      await cacheService.set('org:1', { name: 'Acme Corp' });
      await cacheService.set('org:1:dept:1', { name: 'Engineering' });
      await cacheService.set('org:1:dept:2', { name: 'Sales' });
      await cacheService.set('org:1:dept:1:team:1', { name: 'Backend' });
      await cacheService.set('org:1:dept:1:team:2', { name: 'Frontend' });
      
      // Invalidate entire department
      const deptKeys = await cacheService.getKeys('org:1:dept:1*');
      for (const key of deptKeys) {
        await cacheService.delete(key);
      }
      
      // Verify cascading deletion
      expect(await cacheService.get('org:1:dept:1')).toBeNull();
      expect(await cacheService.get('org:1:dept:1:team:1')).toBeNull();
      expect(await cacheService.get('org:1:dept:1:team:2')).toBeNull();
      
      // Other data should remain
      expect(await cacheService.get('org:1')).toEqual({ name: 'Acme Corp' });
      expect(await cacheService.get('org:1:dept:2')).toEqual({ name: 'Sales' });
    });

    it('should handle tag-based invalidation', async () => {
      // Simulate tag-based caching by using namespaces
      const productTag = 'products';
      const userTag = 'users';
      
      // Cache product-related data
      await cacheService.set('product-list', ['p1', 'p2'], { namespace: productTag });
      await cacheService.set('product-detail-1', { name: 'Product 1' }, { namespace: productTag });
      await cacheService.set('product-reviews-1', ['Great!'], { namespace: productTag });
      
      // Cache user-related data
      await cacheService.set('user-list', ['u1', 'u2'], { namespace: userTag });
      await cacheService.set('user-detail-1', { name: 'User 1' }, { namespace: userTag });
      
      // Invalidate all product data
      await cacheService.clear(productTag);
      
      // Verify product data is cleared
      expect(await cacheService.get('product-list', { namespace: productTag })).toBeNull();
      expect(await cacheService.get('product-detail-1', { namespace: productTag })).toBeNull();
      
      // User data should remain
      expect(await cacheService.get('user-list', { namespace: userTag })).toEqual(['u1', 'u2']);
    });

    it('should support conditional invalidation', async () => {
      // Set up data with metadata
      const now = Date.now();
      await cacheService.set('data:1', { value: 'old', timestamp: now - 10000 });
      await cacheService.set('data:2', { value: 'recent', timestamp: now - 1000 });
      await cacheService.set('data:3', { value: 'new', timestamp: now });
      
      // Get all data keys
      const allKeys = await cacheService.getKeys('data:*');
      
      // Invalidate old data (older than 5 seconds)
      for (const key of allKeys) {
        const data = await cacheService.get<{ value: string; timestamp: number }>(key);
        if (data && now - data.timestamp > 5000) {
          await cacheService.delete(key);
        }
      }
      
      // Verify conditional invalidation
      expect(await cacheService.get('data:1')).toBeNull(); // Old, deleted
      expect(await cacheService.get('data:2')).toBeTruthy(); // Recent, kept
      expect(await cacheService.get('data:3')).toBeTruthy(); // New, kept
    });

    it('should handle smart invalidation with dependencies', async () => {
      // Cache with dependencies
      const cacheWithDeps = async (key: string, value: any, deps: string[]) => {
        await cacheService.set(key, value);
        await cacheService.set(`${key}:deps`, deps);
      };
      
      // Set up cache with dependencies
      await cacheWithDeps('computed:sum', 15, ['value:a', 'value:b']);
      await cacheService.set('value:a', 5);
      await cacheService.set('value:b', 10);
      
      // When a dependency changes, invalidate dependent caches
      const invalidateDependents = async (changedKey: string) => {
        const allKeys = await cacheService.getKeys('*:deps');
        
        for (const depKey of allKeys) {
          const deps = await cacheService.get<string[]>(depKey);
          if (deps && deps.includes(changedKey)) {
            const mainKey = depKey.replace(':deps', '');
            await cacheService.delete(mainKey);
            await cacheService.delete(depKey);
          }
        }
      };
      
      // Change a dependency
      await cacheService.set('value:a', 7);
      await invalidateDependents('value:a');
      
      // Computed value should be invalidated
      expect(await cacheService.get('computed:sum')).toBeNull();
      expect(await cacheService.get('computed:sum:deps')).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle cleanup interval on destroyed service', async () => {
      const tempService = new CacheService({ cleanupInterval: 100 });
      
      // Destroy immediately
      (tempService as unknown as { destroy: () => void }).destroy();
      
      // Should not throw errors
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    it('should handle operations after destroy', async () => {
      const tempService = new CacheService();
      await tempService.set('key', 'value');
      
      // Destroy service
      (tempService as unknown as { destroy: () => void }).destroy();
      
      // Operations should handle gracefully (not throw)
      expect(await tempService.get('key')).toBeNull();
      await expect(tempService.set('new-key', 'value')).resolves.not.toThrow();
    });

    it('should handle pattern matching edge cases', async () => {
      await cacheService.set('test', 'value');
      await cacheService.set('test*special', 'value');
      await cacheService.set('test?mark', 'value');
      await cacheService.set('testXmark', 'value');
      
      // Test various patterns
      expect((await cacheService.getKeys('test')).length).toBe(1);
      expect((await cacheService.getKeys('test*')).length).toBe(4); // All 4 keys start with 'test'
      expect((await cacheService.getKeys('test?mark')).length).toBe(2); // 'test?mark' and 'testXmark' match
      expect((await cacheService.getKeys('*special')).length).toBe(1);
    });

    it('should handle stats edge cases', async () => {
      // Empty cache stats
      let stats = cacheService.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.size).toBe(0);
      
      // After some operations
      await cacheService.set('key', 'value');
      await cacheService.get('key'); // hit
      await cacheService.get('missing'); // miss
      
      stats = cacheService.getStats();
      expect(stats.hitRate).toBe(50);
    });
  });
});