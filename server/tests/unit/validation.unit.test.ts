import { describe, it, expect } from '@jest/globals';
import {
  subjectSchema,
  milestoneCreateSchema,
  milestoneUpdateSchema,
  activityCreateSchema,
} from '../../src/validation';

describe('Validation Schemas Unit Tests', () => {
  describe('subjectSchema', () => {
    it('should validate valid subject data', () => {
      const validSubject = {
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
      };

      const result = subjectSchema.safeParse(validSubject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSubject);
      }
    });

    it('should require name field', () => {
      const invalidSubject = {
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
      };

      const result = subjectSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidSubject = {
        name: '',
        nameEn: 'Mathematics',
      };

      const result = subjectSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
    });

    it('should allow optional language fields', () => {
      const minimalSubject = {
        name: 'Science',
      };

      const result = subjectSchema.safeParse(minimalSubject);
      expect(result.success).toBe(true);
    });

    it('should handle only English translation', () => {
      const subjectWithEn = {
        name: 'Science',
        nameEn: 'Science',
      };

      const result = subjectSchema.safeParse(subjectWithEn);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nameEn).toBe('Science');
        expect(result.data.nameFr).toBeUndefined();
      }
    });

    it('should handle only French translation', () => {
      const subjectWithFr = {
        name: 'Sciences',
        nameFr: 'Sciences',
      };

      const result = subjectSchema.safeParse(subjectWithFr);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nameFr).toBe('Sciences');
        expect(result.data.nameEn).toBeUndefined();
      }
    });
  });

  describe('milestoneCreateSchema', () => {
    const validMilestone = {
      title: 'Unit 1: Numbers',
      subjectId: 1,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.000Z',
      estHours: 20,
    };

    it('should validate valid milestone data', () => {
      const result = milestoneCreateSchema.safeParse(validMilestone);
      expect(result.success).toBe(true);
    });

    it('should require title and subjectId', () => {
      const invalidMilestone = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
      };

      const result = milestoneCreateSchema.safeParse(invalidMilestone);
      expect(result.success).toBe(false);
    });

    it('should validate that end date is after start date', () => {
      const invalidMilestone = {
        ...validMilestone,
        startDate: '2024-01-31T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.000Z', // Before start date
      };

      const result = milestoneCreateSchema.safeParse(invalidMilestone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('endDate'))).toBe(true);
      }
    });

    it('should allow equal start and end dates', () => {
      const sameDayMilestone = {
        ...validMilestone,
        startDate: '2024-01-15T09:00:00.000Z',
        endDate: '2024-01-15T17:00:00.000Z',
      };

      const result = milestoneCreateSchema.safeParse(sameDayMilestone);
      expect(result.success).toBe(true);
    });

    it('should validate datetime format', () => {
      const invalidDateMilestone = {
        ...validMilestone,
        startDate: '2024-01-01', // Invalid datetime format
      };

      const result = milestoneCreateSchema.safeParse(invalidDateMilestone);
      expect(result.success).toBe(false);
    });

    it('should handle optional fields', () => {
      const minimalMilestone = {
        title: 'Basic Milestone',
        subjectId: 1,
      };

      const result = milestoneCreateSchema.safeParse(minimalMilestone);
      expect(result.success).toBe(true);
    });

    it('should validate estHours is integer', () => {
      const invalidHoursMilestone = {
        ...validMilestone,
        estHours: 20.5, // Should be integer
      };

      const result = milestoneCreateSchema.safeParse(invalidHoursMilestone);
      expect(result.success).toBe(false);
    });

    it('should limit description length', () => {
      const longDescription = 'a'.repeat(10001); // Exceeds 10000 character limit
      const invalidMilestone = {
        ...validMilestone,
        description: longDescription,
      };

      const result = milestoneCreateSchema.safeParse(invalidMilestone);
      expect(result.success).toBe(false);
    });

    it('should allow bilingual titles and descriptions', () => {
      const bilingualMilestone = {
        title: 'Unité 1 : Les nombres',
        titleEn: 'Unit 1: Numbers',
        titleFr: 'Unité 1 : Les nombres',
        subjectId: 1,
        description: 'Description en français',
        descriptionEn: 'Description in English',
        descriptionFr: 'Description en français',
      };

      const result = milestoneCreateSchema.safeParse(bilingualMilestone);
      expect(result.success).toBe(true);
    });

    it('should handle expectations array', () => {
      const milestoneWithExpectations = {
        ...validMilestone,
        expectations: ['MAT-1-N-1', 'MAT-1-N-2', 'MAT-1-PS-1'],
      };

      const result = milestoneCreateSchema.safeParse(milestoneWithExpectations);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expectations).toEqual(['MAT-1-N-1', 'MAT-1-N-2', 'MAT-1-PS-1']);
      }
    });
  });

  describe('milestoneUpdateSchema', () => {
    it('should not require subjectId for updates', () => {
      const updateData = {
        title: 'Updated Title',
        startDate: '2024-02-01T00:00:00.000Z',
        endDate: '2024-02-28T23:59:59.000Z',
      };

      const result = milestoneUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should still validate date constraints', () => {
      const invalidUpdate = {
        title: 'Updated Title',
        startDate: '2024-02-28T00:00:00.000Z',
        endDate: '2024-02-01T23:59:59.000Z', // Before start date
      };

      const result = milestoneUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const partialUpdate = {
        estHours: 30,
      };

      const result = milestoneUpdateSchema.safeParse(partialUpdate);
      if (!result.success) {
        console.error('Validation failed:', result.error);
      }
      expect(result.success).toBe(true);
    });
  });

  describe('activityCreateSchema', () => {
    it('should validate required fields', () => {
      const validActivity = {
        title: 'Introduction to Fractions',
        milestoneId: 1,
      };

      const result = activityCreateSchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it('should require title and milestoneId', () => {
      const invalidActivity = {
        title: 'Activity without milestone',
        // Missing milestoneId
      };

      const result = activityCreateSchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });

    it('should handle bilingual titles', () => {
      const bilingualActivity = {
        title: 'Les fractions',
        titleEn: 'Fractions',
        titleFr: 'Les fractions',
        milestoneId: 1,
      };

      const result = activityCreateSchema.safeParse(bilingualActivity);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidActivity = {
        title: '',
        milestoneId: 1,
      };

      const result = activityCreateSchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });

  describe('Cross-field validation edge cases', () => {
    it('should handle timezone-aware date comparisons', () => {
      const milestone = {
        title: 'Timezone Test',
        subjectId: 1,
        startDate: '2024-01-01T23:59:59.000Z',
        endDate: '2024-01-02T00:00:00.000Z',
      };

      const result = milestoneCreateSchema.safeParse(milestone);
      expect(result.success).toBe(true);
    });

    it('should handle millisecond precision in dates', () => {
      const milestone = {
        title: 'Precision Test',
        subjectId: 1,
        startDate: '2024-01-01T12:00:00.123Z',
        endDate: '2024-01-01T12:00:00.124Z',
      };

      const result = milestoneCreateSchema.safeParse(milestone);
      expect(result.success).toBe(true);
    });

    it('should handle year boundaries correctly', () => {
      const milestone = {
        title: 'Year Boundary Test',
        subjectId: 1,
        startDate: '2023-12-31T23:59:59.999Z',
        endDate: '2024-01-01T00:00:00.000Z',
      };

      const result = milestoneCreateSchema.safeParse(milestone);
      expect(result.success).toBe(true);
    });
  });
});
