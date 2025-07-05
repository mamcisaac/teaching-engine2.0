/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file unitPlanService.test.ts
 * @description Comprehensive tests for UnitPlanService including progress calculations,
 * validation, formatting, and business logic operations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnitPlanService } from '../unitPlanService';
import { UnitPlan, ETFOLessonPlan } from '../../hooks/useETFOPlanning';
import { UnitPlanFormData } from '../../hooks/useUnitPlanForm';

// Mock data
const createMockUnitPlan = (overrides: Partial<UnitPlan> = {}): UnitPlan => ({
  id: 'unit-1',
  title: 'Test Unit',
  description: 'Test unit description',
  startDate: '2023-12-01',
  endDate: '2023-12-31',
  longRangePlanId: 'lrp-1',
  estimatedHours: 20,
  bigIdeas: 'Understanding fractions is fundamental to mathematical literacy',
  essentialQuestions: ['What makes a fraction?', 'How do fractions relate to real life?'],
  successCriteria: ['Students can identify parts of a whole', 'Students can compare fractions'],
  assessmentPlan: 'Formative assessment through observation and exit tickets',
  culminatingTask: 'Create a fraction cookbook',
  keyVocabulary: ['numerator', 'denominator', 'whole'],
  priorKnowledge: 'Students understand whole numbers and basic division',
  crossCurricularConnections: 'Connections to cooking and art',
  learningSkills: ['Problem solving', 'communication'],
  differentiationStrategies: {
    forStruggling: ['visual aids', 'manipulatives'],
    forAdvanced: ['complex problems', 'peer tutoring'],
    forELL: ['vocabulary support', 'visual cues'],
    forIEP: ['modified assessments', 'extra time'],
  },
  indigenousPerspectives: 'Traditional sharing practices',
  environmentalEducation: 'Reducing food waste through proper portioning',
  socialJusticeConnections: 'Fair sharing and equity concepts',
  technologyIntegration: 'Interactive fraction games',
  communityConnections: 'Local bakery visit',
  parentCommunicationPlan: 'Weekly progress updates',
  fieldTripsAndGuestSpeakers: "Bakery and farmer's market",
  expectations: [
    { id: 'B1.1', code: 'B1.1', description: 'Represent fractions' },
    { id: 'B1.2', code: 'B1.2', description: 'Compare fractions' },
    { id: 'B1.3', code: 'B1.3', description: 'Add fractions' },
  ] as any,
  lessonPlans: [],
  _count: {
    lessonPlans: 5,
    expectations: 3,
    resources: 0,
  },
  progress: {
    total: 5,
    completed: 3,
    percentage: 60,
  },
  ...overrides,
});

const createMockFormData = (overrides: Partial<UnitPlanFormData> = {}): UnitPlanFormData => ({
  title: 'Test Unit',
  description: 'Test unit description',
  startDate: '2023-12-01',
  endDate: '2023-12-31',
  longRangePlanId: 'lrp-1',
  estimatedHours: 20,
  bigIdeas: 'Understanding fractions',
  essentialQuestions: ['What makes a fraction?', '', 'How do we use fractions?'],
  successCriteria: ['Identify parts', '', 'Compare fractions'],
  assessmentPlan: 'Formative assessment',
  culminatingTask: 'Fraction cookbook',
  keyVocabulary: ['numerator', 'denominator', ''],
  priorKnowledge: 'Basic division',
  crossCurricularConnections: 'Cooking connections',
  learningSkills: ['Problem solving'],
  differentiationStrategies: {
    forStruggling: ['visual aids', '', 'manipulatives'],
    forAdvanced: ['complex problems', ''],
    forELL: ['vocabulary support', '', 'visual cues'],
    forIEP: ['modified assessments', '', 'extra time'],
  },
  indigenousPerspectives: 'Traditional sharing',
  environmentalEducation: 'Reducing waste',
  socialJusticeConnections: 'Fair sharing',
  technologyIntegration: 'Fraction games',
  communityConnections: 'Bakery visit',
  parentCommunicationPlan: 'Weekly updates',
  fieldTripsAndGuestSpeakers: 'Bakery tour',
  expectationIds: ['B1.1', 'B1.2'],
  ...overrides,
});

const createMockLessonPlan = (id: number, hasEntry = false) => ({
  id,
  title: `Lesson ${id}`,
  daybookEntry: hasEntry ? { id, reflections: 'Good lesson' } : null,
});

describe('UnitPlanService', () => {
  describe('calculateProgress', () => {
    it('should calculate progress correctly with completed lessons', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 5, expectations: 3, resources: 0 },
        lessonPlans: [
          createMockLessonPlan(1, true), // completed
          createMockLessonPlan(2, false), // not completed
          createMockLessonPlan(3, true), // completed
          createMockLessonPlan(4, false), // not completed
          createMockLessonPlan(5, true), // completed
        ] as any,
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(60); // 3 out of 5 lessons completed
    });

    it('should return 0 for unit with no lessons', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 0, expectations: 3, resources: 0 },
        lessonPlans: [],
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(0);
    });

    it('should return 0 for unit with undefined lesson count', () => {
      const unit = createMockUnitPlan({
        _count: undefined as any,
        lessonPlans: [],
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(0);
    });

    it('should handle all lessons completed', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 3, expectations: 3, resources: 0 },
        lessonPlans: [
          createMockLessonPlan(1, true),
          createMockLessonPlan(2, true),
          createMockLessonPlan(3, true),
        ] as any,
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(100);
    });

    it('should handle no lessons completed', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 3, expectations: 3, resources: 0 },
        lessonPlans: [
          createMockLessonPlan(1, false),
          createMockLessonPlan(2, false),
          createMockLessonPlan(3, false),
        ] as any,
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(0);
    });

    it('should handle undefined lessonPlans array', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 3, expectations: 3, resources: 0 },
        lessonPlans: undefined as any,
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(0);
    });

    it('should round progress correctly', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 3, expectations: 3, resources: 0 },
        lessonPlans: [
          createMockLessonPlan(1, true), // completed
          createMockLessonPlan(2, false), // not completed
          createMockLessonPlan(3, false), // not completed
        ] as any,
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(33); // 1/3 = 0.333..., rounded to 33
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date range', () => {
      const result = UnitPlanService.validateDateRange('2023-12-01', '2023-12-31');
      expect(result).toBe(true);
    });

    it('should reject end date before start date', () => {
      const result = UnitPlanService.validateDateRange('2023-12-31', '2023-12-01');
      expect(result).toBe(false);
    });

    it('should accept same start and end date', () => {
      const result = UnitPlanService.validateDateRange('2023-12-15', '2023-12-15');
      expect(result).toBe(true);
    });

    it('should handle different date formats', () => {
      const result = UnitPlanService.validateDateRange(
        '2023-12-01T10:00:00Z',
        '2023-12-31T15:00:00Z',
      );
      expect(result).toBe(true);
    });

    it('should handle invalid date strings', () => {
      const result = UnitPlanService.validateDateRange('invalid-date', '2023-12-31');
      expect(result).toBe(false);
    });
  });

  describe('calculateEstimatedWeeks', () => {
    it('should calculate weeks correctly for typical ranges', () => {
      const testCases = [
        { start: '2023-12-01', end: '2023-12-07', expected: 1 }, // 7 days = 1 week
        { start: '2023-12-01', end: '2023-12-14', expected: 2 }, // 14 days = 2 weeks
        { start: '2023-12-01', end: '2023-12-31', expected: 5 }, // 31 days = 5 weeks
        { start: '2023-12-01', end: '2023-12-01', expected: 1 }, // same day = 1 week (minimum)
      ];

      testCases.forEach(({ start, end, expected }) => {
        const result = UnitPlanService.calculateEstimatedWeeks(start, end);
        expect(result).toBe(expected);
      });
    });

    it('should round up partial weeks', () => {
      // 10 days should round up to 2 weeks
      const result = UnitPlanService.calculateEstimatedWeeks('2023-12-01', '2023-12-10');
      expect(result).toBe(2);
    });

    it('should handle different date formats', () => {
      const result = UnitPlanService.calculateEstimatedWeeks(
        '2023-12-01T00:00:00Z',
        '2023-12-14T23:59:59Z',
      );
      expect(result).toBe(2);
    });

    it('should handle end date before start date', () => {
      const result = UnitPlanService.calculateEstimatedWeeks('2023-12-31', '2023-12-01');
      expect(result).toBe(5); // Should handle absolute difference
    });
  });

  describe('formatForExport', () => {
    it('should format complete unit for export', () => {
      const unit = createMockUnitPlan();

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).toContain('## Description');
      expect(result).toContain('Test unit description');
      expect(result).toContain('## Big Ideas');
      expect(result).toContain('Understanding fractions is fundamental');
      expect(result).toContain('## Essential Questions');
      expect(result).toContain('- What makes a fraction?');
      expect(result).toContain('- How do fractions relate to real life?');
      expect(result).toContain('## Success Criteria');
      expect(result).toContain('- Students can identify parts');
      expect(result).toContain('- Students can compare fractions');
    });

    it('should handle unit without description', () => {
      const unit = createMockUnitPlan({ description: undefined });

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).not.toContain('## Description');
    });

    it('should handle unit without big ideas', () => {
      const unit = createMockUnitPlan({ bigIdeas: undefined });

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).not.toContain('## Big Ideas');
    });

    it('should handle empty essential questions', () => {
      const unit = createMockUnitPlan({ essentialQuestions: [] });

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).not.toContain('## Essential Questions');
    });

    it('should handle undefined essential questions', () => {
      const unit = createMockUnitPlan({ essentialQuestions: undefined as string[] | undefined });

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).not.toContain('## Essential Questions');
    });

    it('should handle empty success criteria', () => {
      const unit = createMockUnitPlan({ successCriteria: [] });

      const result = UnitPlanService.formatForExport(unit);

      expect(result).toContain('# Test Unit');
      expect(result).not.toContain('## Success Criteria');
    });
  });

  describe('prepareFormData', () => {
    it('should filter out empty strings from arrays', () => {
      const formData = createMockFormData();

      const result = UnitPlanService.prepareFormData(formData);

      expect(result.essentialQuestions).toEqual([
        'What makes a fraction?',
        'How do we use fractions?',
      ]);
      expect(result.successCriteria).toEqual(['Identify parts', 'Compare fractions']);
      expect(result.keyVocabulary).toEqual(['numerator', 'denominator']);
    });

    it('should filter differentiation strategies', () => {
      const formData = createMockFormData();

      const result = UnitPlanService.prepareFormData(formData);

      expect(result.differentiationStrategies.forStruggling).toEqual([
        'visual aids',
        'manipulatives',
      ]);
      expect(result.differentiationStrategies.forAdvanced).toEqual(['complex problems']);
      expect(result.differentiationStrategies.forELL).toEqual([
        'vocabulary support',
        'visual cues',
      ]);
      expect(result.differentiationStrategies.forIEP).toEqual([
        'modified assessments',
        'extra time',
      ]);
    });

    it('should handle empty arrays', () => {
      const formData = createMockFormData({
        essentialQuestions: [],
        successCriteria: [],
        keyVocabulary: [],
        differentiationStrategies: {
          forStruggling: [],
          forAdvanced: [],
          forELL: [],
          forIEP: [],
        },
      });

      const result = UnitPlanService.prepareFormData(formData);

      expect(result.essentialQuestions).toEqual([]);
      expect(result.successCriteria).toEqual([]);
      expect(result.keyVocabulary).toEqual([]);
      expect(result.differentiationStrategies.forStruggling).toEqual([]);
    });

    it('should preserve other fields unchanged', () => {
      const formData = createMockFormData();

      const result = UnitPlanService.prepareFormData(formData);

      expect(result.title).toBe('Test Unit');
      expect(result.description).toBe('Test unit description');
      expect(result.startDate).toBe('2023-12-01');
      expect(result.endDate).toBe('2023-12-31');
      expect(result.estimatedHours).toBe(20);
    });
  });

  describe('isComplete', () => {
    it('should return true for complete unit', () => {
      const unit = createMockUnitPlan();

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(true);
    });

    it('should return false for unit missing title', () => {
      const unit = createMockUnitPlan({ title: '' });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should return false for unit missing big ideas', () => {
      const unit = createMockUnitPlan({ bigIdeas: '' });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should return false for unit with empty essential questions', () => {
      const unit = createMockUnitPlan({ essentialQuestions: [] });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should return false for unit with empty success criteria', () => {
      const unit = createMockUnitPlan({ successCriteria: [] });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should return false for unit missing assessment plan', () => {
      const unit = createMockUnitPlan({ assessmentPlan: '' });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should return false for unit with no expectations', () => {
      const unit = createMockUnitPlan({ expectations: [] });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });

    it('should handle undefined fields', () => {
      const unit = createMockUnitPlan({
        title: undefined as any,
        essentialQuestions: undefined as any,
        expectations: undefined as any,
      });

      const result = UnitPlanService.isComplete(unit);

      expect(result).toBe(false);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for different progress levels', () => {
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 100, total: 10, completed: 10 } }),
        ),
      ).toBe('text-green-600');
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 75, total: 10, completed: 7 } }),
        ),
      ).toBe('text-yellow-600');
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 25, total: 10, completed: 2 } }),
        ),
      ).toBe('text-orange-600');
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 0, total: 10, completed: 0 } }),
        ),
      ).toBe('text-gray-600');
    });

    it('should handle missing progress', () => {
      const unit = createMockUnitPlan({ progress: undefined as { total: number; completed: number; percentage: number; } | undefined });

      const result = UnitPlanService.getStatusColor(unit);

      expect(result).toBe('text-gray-600');
    });

    it('should handle edge cases', () => {
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 50, total: 10, completed: 5 } }),
        ),
      ).toBe('text-orange-600');
      expect(
        UnitPlanService.getStatusColor(
          createMockUnitPlan({ progress: { percentage: 51, total: 10, completed: 5 } }),
        ),
      ).toBe('text-yellow-600');
    });
  });

  describe('generateSummary', () => {
    it('should generate correct summary', () => {
      const unit = createMockUnitPlan({
        startDate: '2023-12-01',
        endDate: '2023-12-31', // 31 days = ~5 weeks
        _count: {
          lessonPlans: 8,
          expectations: 5,
          resources: 0,
        },
      });

      const result = UnitPlanService.generateSummary(unit);

      expect(result).toBe('5 weeks • 8 lessons • 5 expectations');
    });

    it('should handle missing counts', () => {
      const unit = createMockUnitPlan({
        startDate: '2023-12-01',
        endDate: '2023-12-14', // 14 days = 2 weeks
        _count: undefined as any,
      });

      const result = UnitPlanService.generateSummary(unit);

      expect(result).toBe('2 weeks • 0 lessons • 0 expectations');
    });

    it('should handle partial counts', () => {
      const unit = createMockUnitPlan({
        startDate: '2023-12-01',
        endDate: '2023-12-07', // 7 days = 1 week
        _count: {
          lessonPlans: 3,
          expectations: undefined as any,
          resources: 0,
        },
      });

      const result = UnitPlanService.generateSummary(unit);

      expect(result).toBe('1 weeks • 3 lessons • 0 expectations');
    });

    it('should handle different date ranges', () => {
      const testCases = [
        { start: '2023-12-01', end: '2023-12-01', expectedWeeks: 1 },
        { start: '2023-12-01', end: '2023-12-10', expectedWeeks: 2 },
        { start: '2023-12-01', end: '2024-01-31', expectedWeeks: 9 },
      ];

      testCases.forEach(({ start, end, expectedWeeks }) => {
        const unit = createMockUnitPlan({
          startDate: start,
          endDate: end,
          _count: { lessonPlans: 5, expectations: 3, resources: 0 },
        });

        const result = UnitPlanService.generateSummary(unit);
        expect(result).toBe(`${expectedWeeks} weeks • 5 lessons • 3 expectations`);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null or undefined inputs gracefully', () => {
      expect(() => UnitPlanService.calculateProgress(null as unknown as UnitPlan)).toThrow();
      expect(() => UnitPlanService.validateDateRange('', '')).not.toThrow();
      expect(() => UnitPlanService.formatForExport(null as unknown as UnitPlan)).toThrow();
      expect(() => UnitPlanService.isComplete(null as unknown as UnitPlan)).toThrow();
    });

    it('should handle very large date ranges', () => {
      const result = UnitPlanService.calculateEstimatedWeeks('2023-01-01', '2024-12-31');
      expect(result).toBeGreaterThan(50); // Should be around 104 weeks (2 years)
    });

    it('should handle invalid date strings', () => {
      const result1 = UnitPlanService.validateDateRange('invalid', 'also-invalid');
      expect(result1).toBe(false);

      const result2 = UnitPlanService.calculateEstimatedWeeks('invalid', 'also-invalid');
      expect(result2).toBe(1); // Should default to minimum
    });

    it('should handle missing properties in formatting', () => {
      const minimalUnit = {
        title: 'Minimal Unit',
      } as UnitPlan;

      const result = UnitPlanService.formatForExport(minimalUnit);

      expect(result).toContain('# Minimal Unit');
      expect(result).not.toContain('## Description');
      expect(result).not.toContain('## Big Ideas');
    });

    it('should handle very small progress calculations', () => {
      const unit = createMockUnitPlan({
        _count: { lessonPlans: 1000, expectations: 3, resources: 0 },
        lessonPlans: [createMockLessonPlan(1, true)] as any, // 1 out of 1000
      });

      const result = UnitPlanService.calculateProgress(unit);
      expect(result).toBe(0); // Should round to 0 for very small percentages
    });

    it('should handle empty strings in form data', () => {
      const formData = createMockFormData({
        essentialQuestions: ['', '   ', '\t'],
        successCriteria: ['', '\n', '  '],
      });

      const result = UnitPlanService.prepareFormData(formData);

      expect(result.essentialQuestions).toEqual([]);
      expect(result.successCriteria).toEqual([]);
    });
  });
});
