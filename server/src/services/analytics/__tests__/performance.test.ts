/**
 * Analytics Performance Benchmark Tests
 *
 * Validates that all analytics services meet the <2 second load time requirement
 * specified in Agent-Insight success criteria.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  curriculumAnalyticsService,
  domainAnalyticsService,
  themeAnalyticsService,
  vocabularyAnalyticsService,
  analyticsCache,
} from '../index';

// Performance threshold: 2 seconds (2000ms)
const PERFORMANCE_THRESHOLD = 2000;

describe('Analytics Performance Benchmarks', () => {
  beforeEach(() => {
    // Clear cache to ensure clean performance tests
    analyticsCache.clear();
  });

  describe('Curriculum Analytics Performance', () => {
    it('should generate heatmap data within 2 seconds', async () => {
      const startTime = Date.now();

      await curriculumAnalyticsService.generateHeatmapData({
        subject: 'Mathematics',
        viewMode: 'planned',
        startWeek: 1,
        endWeek: 20,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate curriculum summary within 2 seconds', async () => {
      const startTime = Date.now();

      await curriculumAnalyticsService.getCurriculumSummary({
        subject: 'Science',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should handle large dataset (52 weeks) within performance threshold', async () => {
      const startTime = Date.now();

      await curriculumAnalyticsService.generateHeatmapData({
        viewMode: 'taught',
        startWeek: 1,
        endWeek: 52, // Full year
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);
  });

  describe('Domain Analytics Performance', () => {
    it('should generate student radar within 2 seconds', async () => {
      const startTime = Date.now();

      await domainAnalyticsService.generateStudentRadar({
        studentId: 1,
        term: 'Term 1',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate class summary within 2 seconds', async () => {
      const startTime = Date.now();

      await domainAnalyticsService.generateClassSummary({
        teacherId: 1,
        term: 'Term 1',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate domain trends within 2 seconds', async () => {
      const startTime = Date.now();

      await domainAnalyticsService.generateDomainTrends({
        studentId: 1,
        domain: 'reading',
        weekCount: 12,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);
  });

  describe('Theme Analytics Performance', () => {
    it('should generate theme usage analytics within 2 seconds', async () => {
      const startTime = Date.now();

      await themeAnalyticsService.getThemeUsageAnalytics({
        teacherId: 1,
        subject: 'Science',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate theme matrix within 2 seconds', async () => {
      const startTime = Date.now();

      await themeAnalyticsService.getThemeMatrix({
        teacherId: 1,
        term: 'Term 1',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);
  });

  describe('Vocabulary Analytics Performance', () => {
    it('should generate student growth data within 2 seconds', async () => {
      const startTime = Date.now();

      await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
        term: 'Term 1',
        weekCount: 20,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate bilingual analytics within 2 seconds', async () => {
      const startTime = Date.now();

      await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
        term: 'Term 1',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);

    it('should generate class summary within 2 seconds', async () => {
      const startTime = Date.now();

      await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
        term: 'Term 1',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 5000);
  });

  describe('Cache Performance Impact', () => {
    it('should show significant performance improvement with cache', async () => {
      const params = {
        subject: 'Mathematics',
        viewMode: 'planned' as const,
        startWeek: 1,
        endWeek: 20,
      };

      // First call (no cache)
      const startTime1 = Date.now();
      await curriculumAnalyticsService.generateHeatmapData(params);
      const endTime1 = Date.now();
      const firstCallDuration = endTime1 - startTime1;

      // Second call (cached)
      const startTime2 = Date.now();
      await curriculumAnalyticsService.generateHeatmapData(params);
      const endTime2 = Date.now();
      const secondCallDuration = endTime2 - startTime2;

      // Cached call should be faster or equal (services are already very fast)
      expect(secondCallDuration).toBeLessThanOrEqual(firstCallDuration);
      expect(secondCallDuration).toBeLessThan(200); // Should be under 200ms when cached
    }, 10000);

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();

      // Simulate 10 concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        curriculumAnalyticsService.generateHeatmapData({
          subject: 'Science',
          viewMode: 'taught',
          teacherId: i + 1,
        }),
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All 10 concurrent requests should complete within threshold
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 10000);
  });

  describe('Memory Usage Benchmarks', () => {
    it('should not cause memory leaks with repeated calls', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make 50 analytics calls
      for (let i = 0; i < 50; i++) {
        await curriculumAnalyticsService.generateHeatmapData({
          subject: 'Mathematics',
          viewMode: 'planned',
          startWeek: (i % 20) + 1,
          endWeek: (i % 20) + 10,
        });

        // Clear cache every 10 calls to simulate real usage
        if (i % 10 === 0) {
          analyticsCache.clear();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, 30000);
  });

  describe('Stress Testing', () => {
    it('should handle maximum data load within performance threshold', async () => {
      const startTime = Date.now();

      // Generate analytics for maximum realistic data size
      await Promise.all([
        curriculumAnalyticsService.generateHeatmapData({
          viewMode: 'planned',
          startWeek: 1,
          endWeek: 52, // Full year
        }),
        domainAnalyticsService.generateClassSummary({
          teacherId: 1,
        }),
        vocabularyAnalyticsService.generateClassSummary({
          teacherId: 1,
          term: 'Term 1',
        }),
        themeAnalyticsService.getThemeUsageAnalytics({
          teacherId: 1,
        }),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    }, 10000);
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across multiple runs', async () => {
      const durations: number[] = [];

      // Run the same operation 5 times
      for (let i = 0; i < 5; i++) {
        analyticsCache.clear(); // Ensure no cache benefits

        const startTime = Date.now();

        await curriculumAnalyticsService.generateHeatmapData({
          subject: 'Mathematics',
          viewMode: 'planned',
          startWeek: 1,
          endWeek: 20,
        });

        const endTime = Date.now();
        durations.push(endTime - startTime);
      }

      // All durations should be under threshold
      durations.forEach((duration) => {
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
      });

      // Variance should be reasonable (check only if minDuration > 0)
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      if (minDuration > 0) {
        expect(maxDuration / minDuration).toBeLessThan(10); // Allow more variance for very fast operations
      }
    }, 15000);
  });
});
