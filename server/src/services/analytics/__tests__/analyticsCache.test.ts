/**
 * Analytics Cache Service Tests
 *
 * Tests caching functionality including TTL, invalidation, and key generation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { analyticsCache } from '../analyticsCache';

describe('AnalyticsCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    analyticsCache.clear();
  });

  describe('get/set operations', () => {
    it('should store and retrieve cached data', () => {
      const testData = { value: 'test', count: 42 };
      analyticsCache.set('test-key', testData);

      const retrieved = analyticsCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = analyticsCache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should respect TTL and expire old entries', () => {
      jest.useFakeTimers();

      // Set with 1 second TTL
      analyticsCache.set('expiring-key', 'data', 1000);

      // Should be available immediately
      expect(analyticsCache.get('expiring-key')).toBe('data');

      // Advance time by 1.5 seconds
      jest.advanceTimersByTime(1500);

      // Should be expired
      expect(analyticsCache.get('expiring-key')).toBeNull();

      jest.useRealTimers();
    });

    it('should use default TTL when not specified', () => {
      jest.useFakeTimers();

      analyticsCache.set('default-ttl-key', 'data');

      // Should be available within default TTL (5 minutes)
      jest.advanceTimersByTime(4 * 60 * 1000);
      expect(analyticsCache.get('default-ttl-key')).toBe('data');

      // Should expire after default TTL
      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(analyticsCache.get('default-ttl-key')).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate entries matching pattern', () => {
      analyticsCache.set('user:1:data', 'data1');
      analyticsCache.set('user:2:data', 'data2');
      analyticsCache.set('post:1:data', 'data3');

      analyticsCache.invalidatePattern('user:.*:data');

      expect(analyticsCache.get('user:1:data')).toBeNull();
      expect(analyticsCache.get('user:2:data')).toBeNull();
      expect(analyticsCache.get('post:1:data')).toBe('data3');
    });

    it('should handle special regex characters in patterns', () => {
      analyticsCache.set('data[1]', 'value1');
      analyticsCache.set('data[2]', 'value2');

      analyticsCache.invalidatePattern('data\\[1\\]');

      expect(analyticsCache.get('data[1]')).toBeNull();
      expect(analyticsCache.get('data[2]')).toBe('value2');
    });
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same params', () => {
      const params1 = { userId: 1, type: 'test' };
      const params2 = { userId: 1, type: 'test' };

      const key1 = analyticsCache.generateKey('service', params1);
      const key2 = analyticsCache.generateKey('service', params2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const params1 = { userId: 1, type: 'test' };
      const params2 = { userId: 2, type: 'test' };

      const key1 = analyticsCache.generateKey('service', params1);
      const key2 = analyticsCache.generateKey('service', params2);

      expect(key1).not.toBe(key2);
    });

    it('should sort params for consistent key generation', () => {
      const params1 = { b: 2, a: 1 };
      const params2 = { a: 1, b: 2 };

      const key1 = analyticsCache.generateKey('service', params1);
      const key2 = analyticsCache.generateKey('service', params2);

      expect(key1).toBe(key2);
    });

    it('should handle undefined and null values', () => {
      const params = {
        defined: 'value',
        undefined: undefined,
        null: null,
      };

      const key = analyticsCache.generateKey('service', params);

      expect(key).toContain('defined:value');
      expect(key).toContain('undefined:undefined');
      expect(key).toContain('null:null');
    });
  });

  describe('clear', () => {
    it('should remove all cached entries', () => {
      analyticsCache.set('key1', 'data1');
      analyticsCache.set('key2', 'data2');
      analyticsCache.set('key3', 'data3');

      analyticsCache.clear();

      expect(analyticsCache.get('key1')).toBeNull();
      expect(analyticsCache.get('key2')).toBeNull();
      expect(analyticsCache.get('key3')).toBeNull();
    });
  });

  describe('cached decorator', () => {
    it('should cache method results', async () => {
      const mockService = {
        callCount: 0,
        async getData(params: { id: number }) {
          this.callCount++;
          return { id: params.id, data: `result-${params.id}` };
        },
      };

      // Simulate decorator application
      const originalMethod = mockService.getData;
      mockService.getData = async function (params) {
        const cacheKey = analyticsCache.generateKey('MockService.getData', params);
        const cached = analyticsCache.get(cacheKey);
        if (cached) return cached;

        const result = await originalMethod.call(this, params);
        analyticsCache.set(cacheKey, result);
        return result;
      };

      // First call should execute method
      const result1 = await mockService.getData({ id: 1 });
      expect(mockService.callCount).toBe(1);
      expect(result1).toEqual({ id: 1, data: 'result-1' });

      // Second call should use cache
      const result2 = await mockService.getData({ id: 1 });
      expect(mockService.callCount).toBe(1); // No additional calls
      expect(result2).toEqual({ id: 1, data: 'result-1' });

      // Different params should execute method
      const result3 = await mockService.getData({ id: 2 });
      expect(mockService.callCount).toBe(2);
      expect(result3).toEqual({ id: 2, data: 'result-2' });
    });
  });
});
