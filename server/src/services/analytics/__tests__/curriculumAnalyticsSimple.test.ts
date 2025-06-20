/**
 * Curriculum Analytics Service Tests
 *
 * Tests heatmap generation and curriculum summary calculations
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { curriculumAnalyticsService } from '../curriculumAnalyticsSimple';
import { analyticsCache } from '../analyticsCache';

describe('CurriculumAnalyticsService', () => {
  beforeEach(() => {
    // Clear cache before each test
    analyticsCache.clear();
  });

  describe('generateHeatmapData', () => {
    it('should generate heatmap data with correct structure', async () => {
      const params = {
        subject: 'Mathematics',
        viewMode: 'planned' as const,
        startWeek: 1,
        endWeek: 5,
      };

      const result = await curriculumAnalyticsService.generateHeatmapData(params);

      // Check structure
      expect(result).toHaveProperty('outcomes');
      expect(result).toHaveProperty('weeks');
      expect(result).toHaveProperty('grid');
      expect(result).toHaveProperty('metadata');

      // Check outcomes
      expect(Array.isArray(result.outcomes)).toBe(true);
      expect(result.outcomes.length).toBeGreaterThan(0);
      result.outcomes.forEach((outcome) => {
        expect(outcome).toHaveProperty('id');
        expect(outcome).toHaveProperty('code');
        expect(outcome).toHaveProperty('label');
        expect(outcome).toHaveProperty('subject');
        expect(outcome).toHaveProperty('domain');
      });

      // Check weeks
      expect(result.weeks).toEqual([1, 2, 3, 4, 5]);

      // Check grid
      expect(typeof result.grid).toBe('object');
      result.outcomes.forEach((outcome) => {
        expect(result.grid[outcome.id]).toBeDefined();
        result.weeks.forEach((week) => {
          expect(typeof result.grid[outcome.id][week]).toBe('number');
          expect(result.grid[outcome.id][week]).toBeGreaterThanOrEqual(0);
        });
      });

      // Check metadata
      expect(result.metadata.viewMode).toBe('planned');
      expect(result.metadata.totalOutcomes).toBe(result.outcomes.length);
      expect(result.metadata.totalWeeks).toBe(5);
      expect(result.metadata.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(result.metadata.coveragePercentage).toBeLessThanOrEqual(100);
    });

    it('should filter outcomes by subject', async () => {
      const mathData = await curriculumAnalyticsService.generateHeatmapData({
        subject: 'Mathematics',
        viewMode: 'taught' as const,
      });

      const scienceData = await curriculumAnalyticsService.generateHeatmapData({
        subject: 'Science',
        viewMode: 'taught' as const,
      });

      // All math outcomes should have Mathematics as subject
      mathData.outcomes.forEach((outcome) => {
        expect(outcome.subject).toBe('Mathematics');
      });

      // All science outcomes should have Science as subject
      scienceData.outcomes.forEach((outcome) => {
        expect(outcome.subject).toBe('Science');
      });

      // Should have different outcomes
      expect(mathData.outcomes[0]?.id).not.toBe(scienceData.outcomes[0]?.id);
    });

    it('should filter outcomes by domain', async () => {
      const result = await curriculumAnalyticsService.generateHeatmapData({
        subject: 'Mathematics',
        domain: 'Number Sense',
        viewMode: 'assessed' as const,
      });

      // All outcomes should have the specified domain
      result.outcomes.forEach((outcome) => {
        expect(outcome.domain).toBe('Number Sense');
      });
    });

    it('should respect week range parameters', async () => {
      const result = await curriculumAnalyticsService.generateHeatmapData({
        viewMode: 'reinforced' as const,
        startWeek: 10,
        endWeek: 15,
      });

      expect(result.weeks).toEqual([10, 11, 12, 13, 14, 15]);
      expect(result.metadata.totalWeeks).toBe(6);
    });

    it('should calculate coverage percentage correctly', async () => {
      const result = await curriculumAnalyticsService.generateHeatmapData({
        viewMode: 'planned' as const,
        startWeek: 1,
        endWeek: 2,
      });

      // Calculate expected coverage
      let totalCells = 0;
      let coveredCells = 0;

      result.outcomes.forEach((outcome) => {
        result.weeks.forEach((week) => {
          totalCells++;
          if (result.grid[outcome.id][week] > 0) {
            coveredCells++;
          }
        });
      });

      const expectedPercentage = Math.round((coveredCells / totalCells) * 100);
      expect(result.metadata.coveragePercentage).toBe(expectedPercentage);
    });

    it('should use cache for repeated calls', async () => {
      const params = {
        subject: 'Mathematics',
        viewMode: 'planned' as const,
      };

      // First call
      const result1 = await curriculumAnalyticsService.generateHeatmapData(params);

      // Second call with same params
      const result2 = await curriculumAnalyticsService.generateHeatmapData(params);

      // Results should be identical (same reference due to caching)
      expect(result1).toBe(result2);
    });
  });

  describe('getCurriculumSummary', () => {
    it('should generate curriculum summary with correct statistics', async () => {
      const result = await curriculumAnalyticsService.getCurriculumSummary({
        subject: 'Mathematics',
      });

      // Check structure
      expect(result).toHaveProperty('totalOutcomes');
      expect(result).toHaveProperty('coveredOutcomes');
      expect(result).toHaveProperty('coveragePercentage');
      expect(result).toHaveProperty('topCoveredOutcomes');
      expect(result).toHaveProperty('leastCoveredOutcomes');
      expect(result).toHaveProperty('averageWeeklyHits');
      expect(result).toHaveProperty('domainImbalance');
      expect(result).toHaveProperty('domainBreakdown');

      // Check values
      expect(result.totalOutcomes).toBeGreaterThan(0);
      expect(result.coveredOutcomes).toBeGreaterThanOrEqual(0);
      expect(result.coveredOutcomes).toBeLessThanOrEqual(result.totalOutcomes);
      expect(result.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercentage).toBeLessThanOrEqual(100);

      // Check top/least covered outcomes
      expect(Array.isArray(result.topCoveredOutcomes)).toBe(true);
      expect(Array.isArray(result.leastCoveredOutcomes)).toBe(true);

      result.topCoveredOutcomes.forEach((outcome) => {
        expect(outcome).toHaveProperty('outcomeId');
        expect(outcome).toHaveProperty('code');
        expect(outcome).toHaveProperty('count');
        expect(outcome.count).toBeGreaterThanOrEqual(0);
      });

      // Check domain breakdown
      expect(typeof result.domainBreakdown).toBe('object');
      Object.values(result.domainBreakdown).forEach((count) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate domain imbalance correctly', async () => {
      const result = await curriculumAnalyticsService.getCurriculumSummary({});

      // Domain imbalance should be true if any domain has >60% of outcomes
      const totalOutcomes = Object.values(result.domainBreakdown).reduce(
        (sum, count) => sum + count,
        0,
      );

      const maxDomainPercentage = Math.max(
        ...Object.values(result.domainBreakdown).map((count) => (count / totalOutcomes) * 100),
      );

      expect(result.domainImbalance).toBe(maxDomainPercentage > 60);
    });

    it('should sort top and least covered outcomes correctly', async () => {
      const result = await curriculumAnalyticsService.getCurriculumSummary({});

      // Top covered should be sorted descending
      for (let i = 1; i < result.topCoveredOutcomes.length; i++) {
        expect(result.topCoveredOutcomes[i - 1].count).toBeGreaterThanOrEqual(
          result.topCoveredOutcomes[i].count,
        );
      }

      // Least covered should be sorted ascending (least first)
      for (let i = 1; i < result.leastCoveredOutcomes.length; i++) {
        expect(result.leastCoveredOutcomes[i - 1].count).toBeLessThanOrEqual(
          result.leastCoveredOutcomes[i].count,
        );
      }
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache entries for specific teacher', async () => {
      // Generate data to cache it
      await curriculumAnalyticsService.generateHeatmapData({
        teacherId: 123,
        viewMode: 'planned' as const,
      });

      // Verify it's cached
      const cacheKey = analyticsCache.generateKey(
        'CurriculumAnalyticsService.generateHeatmapData',
        { teacherId: 123, viewMode: 'planned' },
      );
      expect(analyticsCache.get(cacheKey)).not.toBeNull();

      // Invalidate teacher's cache
      curriculumAnalyticsService.invalidateCache(123);

      // Verify it's cleared
      expect(analyticsCache.get(cacheKey)).toBeNull();
    });

    it('should invalidate all cache entries when no teacher specified', async () => {
      // Generate multiple cached entries
      await curriculumAnalyticsService.generateHeatmapData({
        teacherId: 123,
        viewMode: 'planned' as const,
      });
      await curriculumAnalyticsService.getCurriculumSummary({
        teacherId: 456,
      });

      // Invalidate all
      curriculumAnalyticsService.invalidateCache();

      // Verify all analytics cache is cleared
      const key1 = analyticsCache.generateKey('CurriculumAnalyticsService.generateHeatmapData', {
        teacherId: 123,
        viewMode: 'planned',
      });
      const key2 = analyticsCache.generateKey('CurriculumAnalyticsService.getCurriculumSummary', {
        teacherId: 456,
      });

      expect(analyticsCache.get(key1)).toBeNull();
      expect(analyticsCache.get(key2)).toBeNull();
    });
  });
});
