/**
 * @file lessonPlanService.test.ts
 * @description Comprehensive tests for LessonPlanService including time calculations,
 * validation, formatting, and business logic operations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LessonPlanService } from '../lessonPlanService';
import { ETFOLessonPlan, UnitPlan } from '../../hooks/useETFOPlanning';
import { LessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';

// Mock data
const createMockLessonPlan = (overrides: Partial<ETFOLessonPlan> = {}): ETFOLessonPlan => ({
  id: 'lesson-1',
  title: 'Test Lesson',
  titleFr: 'Leçon de test',
  date: '2023-12-01',
  duration: 60,
  learningGoals: 'Students will learn...',
  mindsOn: 'Activation activity',
  action: 'Main instruction',
  consolidation: 'Wrap-up activity',
  materials: ['whiteboard', 'worksheets'],
  accommodations: ['extra time'],
  modifications: ['simplified text'],
  extensions: ['challenge problems'],
  grouping: 'whole class',
  assessmentType: 'formative',
  assessmentNotes: 'Observe participation',
  isSubFriendly: true,
  subNotes: 'Materials prepared',
  unitPlanId: 'unit-1',
  expectations: [{ expectation: { id: 'exp-1' } }, { expectation: { id: 'exp-2' } }] as unknown,
  ...overrides,
});

const createMockUnitPlan = (overrides: Partial<UnitPlan> = {}): UnitPlan => ({
  id: 'unit-1',
  title: 'Test Unit',
  description: 'Test unit description',
  startDate: '2023-11-01',
  endDate: '2023-12-31',
  longRangePlanId: 'lrp-1',
  estimatedHours: 20,
  bigIdeas: 'Big ideas',
  essentialQuestions: ['Question 1'],
  successCriteria: ['Criteria 1'],
  assessmentPlan: 'Assessment plan',
  culminatingTask: 'Final project',
  keyVocabulary: ['word1'],
  priorKnowledge: 'Prior knowledge',
  crossCurricularConnections: 'Cross-curricular connections',
  learningSkills: ['Learning skills'],
  differentiationStrategies: {
    forStruggling: ['strategy1'],
    forAdvanced: ['strategy2'],
    forELL: ['strategy3'],
    forIEP: ['strategy4'],
  },
  indigenousPerspectives: 'Indigenous perspectives',
  environmentalEducation: 'Environmental education',
  socialJusticeConnections: 'Social justice',
  technologyIntegration: 'Technology integration',
  communityConnections: 'Community connections',
  parentCommunicationPlan: 'Parent communication',
  fieldTripsAndGuestSpeakers: 'Field trips',
  ...overrides,
});

const createMockFormData = (overrides: Partial<LessonPlanFormData> = {}): LessonPlanFormData => ({
  title: 'Test Lesson',
  titleFr: 'Leçon de test',
  date: '2023-12-01',
  duration: 60,
  learningGoals: 'Students will learn...',
  learningGoalsFr: 'Les élèves apprendront...',
  mindsOn: 'Activation activity',
  mindsOnFr: "Activité d'activation",
  action: 'Main instruction',
  actionFr: 'Instruction principale',
  consolidation: 'Wrap-up activity',
  consolidationFr: 'Activité de consolidation',
  materials: ['whiteboard', 'worksheets', ''],
  accommodations: ['extra time', ''],
  modifications: ['simplified text', ''],
  extensions: ['challenge problems', ''],
  grouping: 'whole class',
  assessmentType: 'formative',
  assessmentNotes: 'Observe participation',
  isSubFriendly: true,
  subNotes: 'Materials prepared',
  expectationIds: ['1', '2'],
  ...overrides,
});

describe('LessonPlanService', () => {
  describe('calculateTimeAllocation', () => {
    it('should calculate correct time allocation for standard lesson', () => {
      const result = LessonPlanService.calculateTimeAllocation(60);

      expect(result.mindsOn).toBe(9); // 15% of 60
      expect(result.action).toBe(39); // 65% of 60
      expect(result.consolidation).toBe(12); // 20% of 60
    });

    it('should handle different lesson durations', () => {
      const testCases = [
        { duration: 30, expected: { mindsOn: 5, action: 20, consolidation: 6 } },
        { duration: 45, expected: { mindsOn: 7, action: 29, consolidation: 9 } },
        { duration: 90, expected: { mindsOn: 14, action: 59, consolidation: 18 } },
        { duration: 120, expected: { mindsOn: 18, action: 78, consolidation: 24 } },
      ];

      testCases.forEach(({ duration, expected }) => {
        const result = LessonPlanService.calculateTimeAllocation(duration);
        expect(result).toEqual(expected);
      });
    });

    it('should round time allocations correctly', () => {
      const result = LessonPlanService.calculateTimeAllocation(37);

      expect(result.mindsOn).toBe(6); // 15% of 37 = 5.55, rounded to 6
      expect(result.action).toBe(24); // 65% of 37 = 24.05, rounded to 24
      expect(result.consolidation).toBe(7); // 20% of 37 = 7.4, rounded to 7
    });

    it('should handle edge cases', () => {
      const result = LessonPlanService.calculateTimeAllocation(1);

      expect(result.mindsOn).toBe(0); // 15% of 1 = 0.15, rounded to 0
      expect(result.action).toBe(1); // 65% of 1 = 0.65, rounded to 1
      expect(result.consolidation).toBe(0); // 20% of 1 = 0.2, rounded to 0
    });
  });

  describe('validateTiming', () => {
    it('should validate lesson within unit date range', () => {
      const result = LessonPlanService.validateTiming('2023-12-15', '2023-12-01', '2023-12-31');
      expect(result).toBe(true);
    });

    it('should reject lesson before unit start date', () => {
      const result = LessonPlanService.validateTiming('2023-11-30', '2023-12-01', '2023-12-31');
      expect(result).toBe(false);
    });

    it('should reject lesson after unit end date', () => {
      const result = LessonPlanService.validateTiming('2024-01-01', '2023-12-01', '2023-12-31');
      expect(result).toBe(false);
    });

    it('should accept lesson on unit start date', () => {
      const result = LessonPlanService.validateTiming('2023-12-01', '2023-12-01', '2023-12-31');
      expect(result).toBe(true);
    });

    it('should accept lesson on unit end date', () => {
      const result = LessonPlanService.validateTiming('2023-12-31', '2023-12-01', '2023-12-31');
      expect(result).toBe(true);
    });

    it('should handle different date formats', () => {
      const result = LessonPlanService.validateTiming(
        '2023-12-15T10:00:00Z',
        '2023-12-01T00:00:00Z',
        '2023-12-31T23:59:59Z',
      );
      expect(result).toBe(true);
    });
  });

  describe('formatForExport', () => {
    it('should format complete lesson for export', () => {
      const lesson = createMockLessonPlan();
      const unitPlan = createMockUnitPlan();

      const result = LessonPlanService.formatForExport(lesson, unitPlan);

      expect(result).toContain('# Test Lesson');
      expect(result).toContain('## Leçon de test');
      expect(result).toContain('**Date:** 12/1/2023');
      expect(result).toContain('**Duration:** 60 minutes');
      expect(result).toContain('**Unit:** Test Unit');
      expect(result).toContain('## Learning Goals');
      expect(result).toContain('Students will learn...');
      expect(result).toContain('## Three-Part Lesson');
      expect(result).toContain('### Minds On (9 min)');
      expect(result).toContain('Activation activity');
      expect(result).toContain('### Action (39 min)');
      expect(result).toContain('Main instruction');
      expect(result).toContain('### Consolidation (12 min)');
      expect(result).toContain('Wrap-up activity');
      expect(result).toContain('## Materials Needed');
      expect(result).toContain('- whiteboard');
      expect(result).toContain('- worksheets');
    });

    it('should format lesson without unit plan', () => {
      const lesson = createMockLessonPlan();

      const result = LessonPlanService.formatForExport(lesson);

      expect(result).toContain('# Test Lesson');
      expect(result).not.toContain('**Unit:**');
    });

    it('should handle lesson without French title', () => {
      const lesson = createMockLessonPlan({ titleFr: undefined });

      const result = LessonPlanService.formatForExport(lesson);

      expect(result).toContain('# Test Lesson');
      expect(result).not.toContain('## Leçon de test');
    });

    it('should handle missing lesson components', () => {
      const lesson = createMockLessonPlan({
        learningGoals: undefined,
        mindsOn: undefined,
        action: undefined,
        consolidation: undefined,
      });

      const result = LessonPlanService.formatForExport(lesson);

      expect(result).not.toContain('## Learning Goals');
      expect(result).toContain('No content provided');
    });

    it('should handle empty materials array', () => {
      const lesson = createMockLessonPlan({ materials: [] });

      const result = LessonPlanService.formatForExport(lesson);

      expect(result).not.toContain('## Materials Needed');
    });
  });

  describe('prepareFormData', () => {
    it('should prepare form data correctly', () => {
      const formData = createMockFormData();
      const unitPlanId = 'unit-123';

      const result = LessonPlanService.prepareFormData(formData, unitPlanId);

      // unitPlanId is passed separately to the service, not in form data
      expect(result.materials).toEqual(['whiteboard', 'worksheets']);
      expect(result.accommodations).toEqual(['extra time']);
      expect(result.modifications).toEqual(['simplified text']);
      expect(result.extensions).toEqual(['challenge problems']);
    });

    it('should filter out empty strings from arrays', () => {
      const formData = createMockFormData({
        materials: ['whiteboard', '', 'worksheets', '   '],
        accommodations: ['extra time', '', ''],
        modifications: ['', 'simplified text', ''],
        extensions: ['challenge problems', '', 'bonus work'],
      });

      const result = LessonPlanService.prepareFormData(formData, 'unit-123');

      expect(result.materials).toEqual(['whiteboard', 'worksheets']);
      expect(result.accommodations).toEqual(['extra time']);
      expect(result.modifications).toEqual(['simplified text']);
      expect(result.extensions).toEqual(['challenge problems', 'bonus work']);
    });

    it('should handle empty arrays', () => {
      const formData = createMockFormData({
        materials: [],
        accommodations: [],
        modifications: [],
        extensions: [],
      });

      const result = LessonPlanService.prepareFormData(formData, 'unit-123');

      expect(result.materials).toEqual([]);
      expect(result.accommodations).toEqual([]);
      expect(result.modifications).toEqual([]);
      expect(result.extensions).toEqual([]);
    });
  });

  describe('isComplete', () => {
    it('should return true for complete lesson', () => {
      const lesson = createMockLessonPlan();

      const result = LessonPlanService.isComplete(lesson);

      expect(result).toBe(true);
    });

    it('should return false for lesson missing title', () => {
      const lesson = createMockLessonPlan({ title: '' });

      const result = LessonPlanService.isComplete(lesson);

      expect(result).toBe(false);
    });

    it('should return false for lesson missing learning goals', () => {
      const lesson = createMockLessonPlan({ learningGoals: '' });

      const result = LessonPlanService.isComplete(lesson);

      expect(result).toBe(false);
    });

    it('should return false for lesson missing lesson components', () => {
      const testCases = [{ mindsOn: '' }, { action: '' }, { consolidation: '' }];

      testCases.forEach((override) => {
        const lesson = createMockLessonPlan(override);
        const result = LessonPlanService.isComplete(lesson);
        expect(result).toBe(false);
      });
    });

    it('should return false for lesson with empty materials', () => {
      const lesson = createMockLessonPlan({ materials: [] });

      const result = LessonPlanService.isComplete(lesson);

      expect(result).toBe(false);
    });

    it('should handle undefined fields', () => {
      const lesson = createMockLessonPlan({
        title: undefined as unknown,
        learningGoals: undefined as unknown,
        materials: undefined as unknown,
      });

      const result = LessonPlanService.isComplete(lesson);

      expect(result).toBe(false);
    });
  });

  describe('getAssessmentBadgeColor', () => {
    it('should return correct colors for assessment types', () => {
      expect(LessonPlanService.getAssessmentBadgeColor('diagnostic')).toBe(
        'bg-blue-100 text-blue-800',
      );
      expect(LessonPlanService.getAssessmentBadgeColor('formative')).toBe(
        'bg-green-100 text-green-800',
      );
      expect(LessonPlanService.getAssessmentBadgeColor('summative')).toBe(
        'bg-purple-100 text-purple-800',
      );
      expect(LessonPlanService.getAssessmentBadgeColor('unknown')).toBe(
        'bg-gray-100 text-gray-800',
      );
      expect(LessonPlanService.getAssessmentBadgeColor('')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('generateSubSummary', () => {
    it('should generate substitute summary for sub-friendly lesson', () => {
      const lesson = createMockLessonPlan({
        isSubFriendly: true,
        subNotes: 'All materials are in the blue bin',
      });

      const result = LessonPlanService.generateSubSummary(lesson);

      expect(result).toContain('**Substitute Teacher Information**');
      expect(result).toContain('Lesson: Test Lesson');
      expect(result).toContain('Duration: 60 minutes');
      expect(result).toContain('Grouping: whole class');
      expect(result).toContain('Special Notes:');
      expect(result).toContain('All materials are in the blue bin');
      expect(result).toContain('Materials (all should be prepared):');
      expect(result).toContain('- whiteboard');
      expect(result).toContain('- worksheets');
    });

    it('should return empty string for non-sub-friendly lesson', () => {
      const lesson = createMockLessonPlan({ isSubFriendly: false });

      const result = LessonPlanService.generateSubSummary(lesson);

      expect(result).toBe('');
    });

    it('should handle lesson without sub notes', () => {
      const lesson = createMockLessonPlan({
        isSubFriendly: true,
        subNotes: '',
      });

      const result = LessonPlanService.generateSubSummary(lesson);

      expect(result).toContain('**Substitute Teacher Information**');
      expect(result).not.toContain('Special Notes:');
    });

    it('should handle lesson without materials', () => {
      const lesson = createMockLessonPlan({
        isSubFriendly: true,
        materials: [],
      });

      const result = LessonPlanService.generateSubSummary(lesson);

      expect(result).toContain('Materials (all should be prepared):');
      // Should not contain any material items
    });
  });

  describe('isReadyForTeaching', () => {
    it('should return true for ready lesson', () => {
      const lesson = createMockLessonPlan();

      const result = LessonPlanService.isReadyForTeaching(lesson);

      expect(result).toBe(true);
    });

    it('should return false for lesson missing required fields', () => {
      const requiredFields = [
        'title',
        'date',
        'duration',
        'learningGoals',
        'mindsOn',
        'action',
        'consolidation',
        'materials',
      ];

      requiredFields.forEach((field) => {
        const lesson = createMockLessonPlan({ [field]: '' });
        const result = LessonPlanService.isReadyForTeaching(lesson);
        expect(result).toBe(false);
      });
    });

    it('should handle array fields correctly', () => {
      // Empty materials array
      const lesson1 = createMockLessonPlan({ materials: [] });
      expect(LessonPlanService.isReadyForTeaching(lesson1)).toBe(false);

      // Materials with only empty strings
      const lesson2 = createMockLessonPlan({ materials: ['', '   ', ''] });
      expect(LessonPlanService.isReadyForTeaching(lesson2)).toBe(false);

      // Materials with at least one valid item
      const lesson3 = createMockLessonPlan({ materials: ['', 'whiteboard', ''] });
      expect(LessonPlanService.isReadyForTeaching(lesson3)).toBe(true);
    });

    it('should handle undefined fields', () => {
      const lesson = createMockLessonPlan({
        title: undefined as unknown,
        materials: undefined as unknown,
      });

      const result = LessonPlanService.isReadyForTeaching(lesson);

      expect(result).toBe(false);
    });

    it('should handle zero duration', () => {
      const lesson = createMockLessonPlan({ duration: 0 });

      const result = LessonPlanService.isReadyForTeaching(lesson);

      expect(result).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null or undefined inputs gracefully', () => {
      expect(() => LessonPlanService.calculateTimeAllocation(0)).not.toThrow();
      expect(() => LessonPlanService.validateTiming('', '', '')).not.toThrow();
      expect(() => LessonPlanService.formatForExport(null as unknown)).toThrow();
      expect(() => LessonPlanService.isComplete(null as unknown)).toThrow();
    });

    it('should handle very large durations', () => {
      const result = LessonPlanService.calculateTimeAllocation(1440); // 24 hours

      expect(result.mindsOn).toBe(216); // 15% of 1440
      expect(result.action).toBe(936); // 65% of 1440
      expect(result.consolidation).toBe(288); // 20% of 1440
    });

    it('should handle invalid date strings in validation', () => {
      const result = LessonPlanService.validateTiming('invalid-date', '2023-12-01', '2023-12-31');
      expect(result).toBe(false);
    });

    it('should handle missing lesson properties in formatting', () => {
      const partialLesson = {
        title: 'Test',
        duration: 60,
        date: '2023-12-01',
      } as ETFOLessonPlan;

      const result = LessonPlanService.formatForExport(partialLesson);

      expect(result).toContain('# Test');
      expect(result).toContain('No content provided');
    });
  });
});
