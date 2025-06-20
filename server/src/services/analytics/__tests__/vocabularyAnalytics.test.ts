/**
 * Vocabulary Analytics Service Tests
 *
 * Tests vocabulary growth tracking and bilingual analytics functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { vocabularyAnalyticsService } from '../vocabularyAnalytics';
import { analyticsCache } from '../analyticsCache';

describe('VocabularyAnalyticsService', () => {
  beforeEach(() => {
    // Clear cache before each test
    analyticsCache.clear();
  });

  describe('generateStudentGrowthData', () => {
    it('should generate vocabulary growth data with correct structure', async () => {
      const params = {
        studentId: 1,
        term: 'Term 1',
        weekCount: 10,
      };

      const result = await vocabularyAnalyticsService.generateStudentGrowthData(params);

      // Check structure
      expect(result).toHaveProperty('studentId');
      expect(result).toHaveProperty('studentName');
      expect(result).toHaveProperty('totalWords');
      expect(result).toHaveProperty('wordsThisTerm');
      expect(result).toHaveProperty('weeklyGrowth');
      expect(result).toHaveProperty('domainBreakdown');
      expect(result).toHaveProperty('difficultyProgression');
      expect(result).toHaveProperty('acquisitionRate');
      expect(result).toHaveProperty('targetGrowth');
      expect(result).toHaveProperty('projectedEndOfTerm');

      // Check values
      expect(result.studentId).toBe(1);
      expect(typeof result.studentName).toBe('string');
      expect(result.totalWords).toBeGreaterThanOrEqual(50);
      expect(result.totalWords).toBeLessThanOrEqual(150);
      expect(result.wordsThisTerm).toBeLessThanOrEqual(result.totalWords);
    });

    it('should generate weekly growth data correctly', async () => {
      const result = await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
        weekCount: 5,
      });

      expect(result.weeklyGrowth).toHaveLength(5);

      let previousCumulative = 0;
      result.weeklyGrowth.forEach((week, index) => {
        expect(week).toHaveProperty('week');
        expect(week).toHaveProperty('newWords');
        expect(week).toHaveProperty('cumulativeWords');
        expect(week).toHaveProperty('languages');

        expect(week.week).toBe(index + 1);
        expect(week.newWords).toBeGreaterThanOrEqual(0);
        expect(week.cumulativeWords).toBeGreaterThanOrEqual(previousCumulative);
        expect(week.languages.en).toBeGreaterThanOrEqual(0);
        expect(week.languages.fr).toBeGreaterThanOrEqual(0);
        expect(week.languages.en + week.languages.fr).toBe(week.newWords);

        previousCumulative = week.cumulativeWords;
      });
    });

    it('should calculate domain breakdown with percentages', async () => {
      const result = await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
      });

      const domains = Object.keys(result.domainBreakdown);
      expect(domains.length).toBeGreaterThan(0);

      let totalWords = 0;
      domains.forEach((domain) => {
        const breakdown = result.domainBreakdown[domain];
        expect(breakdown).toHaveProperty('count');
        expect(breakdown).toHaveProperty('percentage');
        expect(breakdown).toHaveProperty('recentWords');

        expect(breakdown.count).toBeGreaterThanOrEqual(0);
        expect(breakdown.percentage).toBeGreaterThanOrEqual(0);
        expect(breakdown.percentage).toBeLessThanOrEqual(100);
        expect(Array.isArray(breakdown.recentWords)).toBe(true);

        totalWords += breakdown.count;
      });

      // Total percentage should be approximately 100
      const totalPercentage = domains.reduce(
        (sum, domain) => sum + result.domainBreakdown[domain].percentage,
        0,
      );
      expect(totalPercentage).toBeGreaterThanOrEqual(95);
      expect(totalPercentage).toBeLessThanOrEqual(105);
    });

    it('should calculate difficulty progression', async () => {
      const result = await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
      });

      const { basic, intermediate, advanced } = result.difficultyProgression;

      expect(basic).toBeGreaterThanOrEqual(0);
      expect(intermediate).toBeGreaterThanOrEqual(0);
      expect(advanced).toBeGreaterThanOrEqual(0);

      const total = basic + intermediate + advanced;
      expect(total).toBeGreaterThan(0);
    });

    it('should calculate acquisition rate based on recent weeks', async () => {
      const result = await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
        weekCount: 10,
      });

      // Acquisition rate should be average of last 4 weeks
      const recentWeeks = result.weeklyGrowth.slice(-4);
      const expectedRate = recentWeeks.reduce((sum, week) => sum + week.newWords, 0) / 4;

      expect(result.acquisitionRate).toBeCloseTo(expectedRate, 1);
    });

    it('should project end of term word count', async () => {
      const result = await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 1,
      });

      const currentCount =
        result.weeklyGrowth[result.weeklyGrowth.length - 1]?.cumulativeWords || 0;
      const remainingWeeks = 10; // Hardcoded in service
      const projectedGrowth = result.acquisitionRate * remainingWeeks;

      expect(result.projectedEndOfTerm).toBeCloseTo(currentCount + projectedGrowth, 0);
    });
  });

  describe('generateBilingualAnalytics', () => {
    it('should generate bilingual analytics with correct structure', async () => {
      const result = await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
      });

      expect(result).toHaveProperty('studentId');
      expect(result).toHaveProperty('cognateConnections');
      expect(result).toHaveProperty('languageBalance');
      expect(result).toHaveProperty('transferPatterns');
      expect(result).toHaveProperty('recommendedCognates');

      expect(result.studentId).toBe(1);
    });

    it('should identify cognate connections', async () => {
      const result = await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
      });

      expect(Array.isArray(result.cognateConnections)).toBe(true);

      result.cognateConnections.forEach((connection) => {
        expect(connection).toHaveProperty('enWord');
        expect(connection).toHaveProperty('frWord');
        expect(connection).toHaveProperty('domain');
        expect(connection).toHaveProperty('similarity');
        expect(connection).toHaveProperty('acquired');

        expect(connection.similarity).toBeGreaterThanOrEqual(0);
        expect(connection.similarity).toBeLessThanOrEqual(100);
        expect(typeof connection.acquired).toBe('boolean');
      });
    });

    it('should calculate language balance', async () => {
      const result = await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
      });

      const { english, french } = result.languageBalance;

      expect(english.count).toBeGreaterThanOrEqual(0);
      expect(french.count).toBeGreaterThanOrEqual(0);
      expect(english.percentage + french.percentage).toBe(100);
    });

    it('should identify transfer patterns', async () => {
      const result = await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
      });

      expect(Array.isArray(result.transferPatterns)).toBe(true);

      result.transferPatterns.forEach((pattern) => {
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('examples');
        expect(pattern).toHaveProperty('strength');

        expect(Array.isArray(pattern.examples)).toBe(true);
        pattern.examples.forEach((example) => {
          expect(example).toHaveProperty('en');
          expect(example).toHaveProperty('fr');
        });

        expect(pattern.strength).toBeGreaterThanOrEqual(0);
        expect(pattern.strength).toBeLessThanOrEqual(100);
      });
    });

    it('should generate cognate recommendations', async () => {
      const result = await vocabularyAnalyticsService.generateBilingualAnalytics({
        studentId: 1,
      });

      expect(Array.isArray(result.recommendedCognates)).toBe(true);

      result.recommendedCognates.forEach((rec) => {
        expect(rec).toHaveProperty('enWord');
        expect(rec).toHaveProperty('frWord');
        expect(rec).toHaveProperty('domain');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('rationale');

        expect(rec.priority).toBeGreaterThanOrEqual(0);
        expect(rec.priority).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('generateClassSummary', () => {
    it('should generate class vocabulary insights', async () => {
      const result = await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
        term: 'Term 1',
      });

      // Check structure
      expect(result).toHaveProperty('classSize');
      expect(result).toHaveProperty('averageWordsPerStudent');
      expect(result).toHaveProperty('topPerformers');
      expect(result).toHaveProperty('strugglingStudents');
      expect(result).toHaveProperty('commonWords');
      expect(result).toHaveProperty('gapWords');
      expect(result).toHaveProperty('domainCoverage');

      expect(result.classSize).toBeGreaterThan(0);
      expect(result.averageWordsPerStudent).toBeGreaterThan(0);
    });

    it('should identify top performers', async () => {
      const result = await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
      });

      expect(Array.isArray(result.topPerformers)).toBe(true);
      expect(result.topPerformers.length).toBeLessThanOrEqual(5);

      // Should be sorted by word count descending
      for (let i = 1; i < result.topPerformers.length; i++) {
        expect(result.topPerformers[i - 1].wordCount).toBeGreaterThanOrEqual(
          result.topPerformers[i].wordCount,
        );
      }

      result.topPerformers.forEach((student) => {
        expect(student).toHaveProperty('studentId');
        expect(student).toHaveProperty('studentName');
        expect(student).toHaveProperty('wordCount');
        expect(student).toHaveProperty('acquisitionRate');
      });
    });

    it('should identify struggling students with recommendations', async () => {
      const result = await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
      });

      expect(Array.isArray(result.strugglingStudents)).toBe(true);

      result.strugglingStudents.forEach((student) => {
        expect(student).toHaveProperty('studentId');
        expect(student).toHaveProperty('studentName');
        expect(student).toHaveProperty('wordCount');
        expect(student).toHaveProperty('recommendations');

        expect(Array.isArray(student.recommendations)).toBe(true);
        expect(student.wordCount).toBeLessThan(result.averageWordsPerStudent * 0.7);
      });
    });

    it('should find common words across class', async () => {
      const result = await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
      });

      expect(Array.isArray(result.commonWords)).toBe(true);

      result.commonWords.forEach((word) => {
        expect(word).toHaveProperty('word');
        expect(word).toHaveProperty('language');
        expect(word).toHaveProperty('studentCount');
        expect(word).toHaveProperty('domain');

        expect(['en', 'fr']).toContain(word.language);
        expect(word.studentCount).toBeGreaterThan(result.classSize * 0.6);
      });
    });

    it('should analyze domain coverage', async () => {
      const result = await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 1,
      });

      expect(typeof result.domainCoverage).toBe('object');

      Object.entries(result.domainCoverage).forEach(([domain, coverage]) => {
        expect(coverage).toHaveProperty('averageWords');
        expect(coverage).toHaveProperty('range');
        expect(coverage).toHaveProperty('distribution');

        expect(coverage.averageWords).toBeGreaterThanOrEqual(0);
        expect(coverage.range.min).toBeLessThanOrEqual(coverage.range.max);
        expect(Array.isArray(coverage.distribution)).toBe(true);
      });
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate student-specific cache', async () => {
      // Generate data to cache it
      await vocabularyAnalyticsService.generateStudentGrowthData({
        studentId: 123,
      });

      // Verify it's cached
      const cacheKey = analyticsCache.generateKey(
        'VocabularyAnalyticsService.generateStudentGrowthData',
        { studentId: 123 },
      );
      expect(analyticsCache.get(cacheKey)).not.toBeNull();

      // Invalidate student's cache
      vocabularyAnalyticsService.invalidateStudentCache(123);

      // Verify it's cleared
      expect(analyticsCache.get(cacheKey)).toBeNull();
    });

    it('should invalidate teacher-specific cache', async () => {
      // Generate data to cache it
      await vocabularyAnalyticsService.generateClassSummary({
        teacherId: 456,
      });

      // Verify it's cached
      const cacheKey = analyticsCache.generateKey(
        'VocabularyAnalyticsService.generateClassInsights',
        { teacherId: 456 },
      );
      expect(analyticsCache.get(cacheKey)).not.toBeNull();

      // Invalidate teacher's cache
      vocabularyAnalyticsService.invalidateTeacherCache(456);

      // Verify it's cleared
      expect(analyticsCache.get(cacheKey)).toBeNull();
    });
  });
});
