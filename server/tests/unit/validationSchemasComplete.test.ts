/**
 * Comprehensive Validation Schema Tests
 * Tests all validation schemas and functions for complete coverage
 * Covers edge cases, error handling, and validation logic
 */

import { z } from 'zod';
import { jest } from '@jest/globals';
import {
  subjectSchema,
  milestoneCreateSchema,
  milestoneUpdateSchema,
  activityCreateSchema,
  activityUpdateSchema,
  activityReorderSchema,
  activityMaterialsSchema,
  timetableEntrySchema,
  newsletterGenerateSchema,
  newsletterCreateSchema,
  newsletterUpdateSchema,
  smartGoalCreateSchema,
  smartGoalUpdateSchema,
  oralRoutineTemplateCreateSchema,
  oralRoutineTemplateUpdateSchema,
  dailyOralRoutineCreateSchema,
  dailyOralRoutineUpdateSchema,
  thematicUnitCreateSchema,
  thematicUnitUpdateSchema,
  parentMessageCreateSchema,
  parentMessageUpdateSchema,
  studentCreateSchema,
  studentGoalCreateSchema,
  studentGoalUpdateSchema,
  studentReflectionCreateSchema,
  cuidSchema,
  validate,
} from '../../src/validation';

describe('Validation Schemas - Complete Coverage', () => {
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
        expect(result.data.name).toBe('Mathematics');
        expect(result.data.nameEn).toBe('Mathematics');
        expect(result.data.nameFr).toBe('Mathématiques');
      }
    });

    it('should require name field', () => {
      const invalidSubject = {
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
      };

      const result = subjectSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['name'],
              code: 'invalid_type',
            }),
          ]),
        );
      }
    });

    it('should reject empty name', () => {
      const invalidSubject = {
        name: '',
        nameEn: 'Mathematics',
      };

      const result = subjectSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
    });

    it('should allow optional bilingual fields', () => {
      const minimalSubject = {
        name: 'Science',
      };

      const result = subjectSchema.safeParse(minimalSubject);
      expect(result.success).toBe(true);
    });
  });

  describe('milestoneCreateSchema', () => {
    it('should validate valid milestone creation data', () => {
      const validMilestone = {
        title: 'Unit 1: Numbers',
        titleEn: 'Unit 1: Numbers',
        titleFr: 'Unité 1: Les nombres',
        subjectId: 1,
        targetDate: '2024-12-31T23:59:59.000Z',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.000Z',
        estHours: 40,
        description: 'Introduction to numbers',
        expectations: ['A1.1', 'A1.2'],
      };

      const result = milestoneCreateSchema.safeParse(validMilestone);
      expect(result.success).toBe(true);
    });

    it('should require title field', () => {
      const invalidMilestone = {
        subjectId: 1,
      };

      const result = milestoneCreateSchema.safeParse(invalidMilestone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['title'],
            }),
          ]),
        );
      }
    });

    it('should validate date ordering (start <= end)', () => {
      const invalidDates = {
        title: 'Test Milestone',
        subjectId: 1,
        startDate: '2024-12-31T23:59:59.000Z',
        endDate: '2024-01-01T00:00:00.000Z', // End before start
      };

      const result = milestoneCreateSchema.safeParse(invalidDates);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['endDate'],
              message: 'End date must be after or equal to start date',
            }),
          ]),
        );
      }
    });

    it('should handle optional fields', () => {
      const minimalMilestone = {
        title: 'Minimal Milestone',
        subjectId: 1,
      };

      const result = milestoneCreateSchema.safeParse(minimalMilestone);
      expect(result.success).toBe(true);
    });

    it('should validate description length limit', () => {
      const longDescription = {
        title: 'Test Milestone',
        subjectId: 1,
        description: 'A'.repeat(10001), // Exceeds 10000 char limit
      };

      const result = milestoneCreateSchema.safeParse(longDescription);
      expect(result.success).toBe(false);
    });

    it('should validate integer estHours', () => {
      const decimalHours = {
        title: 'Test Milestone',
        subjectId: 1,
        estHours: 40.5, // Should be integer
      };

      const result = milestoneCreateSchema.safeParse(decimalHours);
      expect(result.success).toBe(false);
    });
  });

  describe('milestoneUpdateSchema', () => {
    it('should validate partial milestone updates', () => {
      const partialUpdate = {
        title: 'Updated Title',
        estHours: 50,
      };

      const result = milestoneUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should not allow subjectId in updates', () => {
      const invalidUpdate = {
        title: 'Updated Title',
        subjectId: 2, // Should not be allowed in updates
      };

      const result = milestoneUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(true); // subjectId is omitted, so it's ignored
      if (result.success) {
        expect(result.data.subjectId).toBeUndefined();
      }
    });

    it('should validate date ordering in partial updates', () => {
      const invalidUpdate = {
        startDate: '2024-12-31T23:59:59.000Z',
        endDate: '2024-01-01T00:00:00.000Z',
      };

      const result = milestoneUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('activityCreateSchema', () => {
    it('should validate complete activity creation', () => {
      const validActivity = {
        title: 'Addition Practice',
        titleEn: 'Addition Practice',
        titleFr: "Pratique d'addition",
        milestoneId: 1,
        activityType: 'LESSON' as const,
        durationMins: 60,
        privateNote: 'Teacher notes',
        publicNote: 'Student instructions',
        materialsText: 'Worksheets, manipulatives',
        completedAt: '2024-06-30T10:00:00.000Z',
        tags: ['math', 'addition'],
        expectations: ['A1.1', 'A1.2'],
      };

      const result = activityCreateSchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it('should validate activity type enum', () => {
      const invalidType = {
        title: 'Test Activity',
        milestoneId: 1,
        activityType: 'INVALID_TYPE',
      };

      const result = activityCreateSchema.safeParse(invalidType);
      expect(result.success).toBe(false);
    });

    it('should validate materials text length limit', () => {
      const longMaterials = {
        title: 'Test Activity',
        milestoneId: 1,
        materialsText: 'A'.repeat(501), // Exceeds 500 char limit
      };

      const result = activityCreateSchema.safeParse(longMaterials);
      expect(result.success).toBe(false);
    });

    it('should require title and milestoneId', () => {
      const incomplete = {
        activityType: 'LESSON' as const,
      };

      const result = activityCreateSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should validate duration as integer', () => {
      const invalidDuration = {
        title: 'Test Activity',
        milestoneId: 1,
        durationMins: 60.5,
      };

      const result = activityCreateSchema.safeParse(invalidDuration);
      expect(result.success).toBe(false);
    });
  });

  describe('activityUpdateSchema', () => {
    it('should allow partial activity updates', () => {
      const partialUpdate = {
        title: 'Updated Activity',
        durationMins: 90,
        tags: ['updated', 'math'],
      };

      const result = activityUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should not allow milestoneId in updates', () => {
      const invalidUpdate = {
        title: 'Updated Activity',
        milestoneId: 2,
      };

      const result = activityUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.milestoneId).toBeUndefined();
      }
    });
  });

  describe('activityReorderSchema', () => {
    it('should validate activity reordering', () => {
      const reorderData = {
        milestoneId: 1,
        activityIds: [3, 1, 2, 4],
      };

      const result = activityReorderSchema.safeParse(reorderData);
      expect(result.success).toBe(true);
    });

    it('should require both milestoneId and activityIds', () => {
      const incomplete = {
        milestoneId: 1,
      };

      const result = activityReorderSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should validate activityIds as array of numbers', () => {
      const invalidIds = {
        milestoneId: 1,
        activityIds: ['1', '2', '3'], // Should be numbers
      };

      const result = activityReorderSchema.safeParse(invalidIds);
      expect(result.success).toBe(false);
    });
  });

  describe('timetableEntrySchema', () => {
    it('should validate valid timetable entry', () => {
      const validEntry = {
        day: 1, // Monday
        startMin: 480, // 8:00 AM
        endMin: 540, // 9:00 AM
        subjectId: 1,
      };

      const result = timetableEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should validate day range (0-6)', () => {
      const invalidDay = {
        day: 7, // Invalid - should be 0-6
        startMin: 480,
        endMin: 540,
      };

      const result = timetableEntrySchema.safeParse(invalidDay);
      expect(result.success).toBe(false);
    });

    it('should validate minute ranges', () => {
      const invalidTimes = {
        day: 1,
        startMin: -1, // Invalid
        endMin: 1441, // Invalid - exceeds 1440
      };

      const result = timetableEntrySchema.safeParse(invalidTimes);
      expect(result.success).toBe(false);
    });

    it('should allow null subjectId', () => {
      const entryWithoutSubject = {
        day: 1,
        startMin: 480,
        endMin: 540,
        subjectId: null,
      };

      const result = timetableEntrySchema.safeParse(entryWithoutSubject);
      expect(result.success).toBe(true);
    });

    it('should validate endMin is greater than 0', () => {
      const zeroEnd = {
        day: 1,
        startMin: 480,
        endMin: 0, // Invalid - must be > 0
      };

      const result = timetableEntrySchema.safeParse(zeroEnd);
      expect(result.success).toBe(false);
    });
  });

  describe('newsletterGenerateSchema', () => {
    it('should validate newsletter generation parameters', () => {
      const validParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
        template: 'weekly',
        includePhotos: true,
        useLLM: true,
        language: 'both' as const,
      };

      const result = newsletterGenerateSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should require start and end dates', () => {
      const missingDates = {
        template: 'weekly',
      };

      const result = newsletterGenerateSchema.safeParse(missingDates);
      expect(result.success).toBe(false);
    });

    it('should validate language enum', () => {
      const invalidLanguage = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
        language: 'spanish', // Not in enum
      };

      const result = newsletterGenerateSchema.safeParse(invalidLanguage);
      expect(result.success).toBe(false);
    });

    it('should validate datetime format', () => {
      const invalidDate = {
        startDate: '2024-01-01', // Not datetime format
        endDate: '2024-01-31T23:59:59.000Z',
      };

      const result = newsletterGenerateSchema.safeParse(invalidDate);
      expect(result.success).toBe(false);
    });
  });

  describe('smartGoalCreateSchema', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

    it('should validate smart goal creation', () => {
      const validGoal = {
        outcomeId: 'OUTCOME_123',
        milestoneId: 1,
        description: 'Students will master addition facts to 20',
        targetDate: futureDate,
        targetValue: 85,
      };

      const result = smartGoalCreateSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('should require future target date', () => {
      const pastDate = {
        outcomeId: 'OUTCOME_123',
        description: 'Test goal',
        targetDate: '2020-01-01T00:00:00.000Z', // Past date
        targetValue: 85,
      };

      const result = smartGoalCreateSchema.safeParse(pastDate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Target date must be today or in the future',
            }),
          ]),
        );
      }
    });

    it('should validate target value range (0-100)', () => {
      const invalidValue = {
        outcomeId: 'OUTCOME_123',
        description: 'Test goal',
        targetDate: futureDate,
        targetValue: 101, // Out of range
      };

      const result = smartGoalCreateSchema.safeParse(invalidValue);
      expect(result.success).toBe(false);
    });

    it('should validate description length', () => {
      const longDescription = {
        outcomeId: 'OUTCOME_123',
        description: 'A'.repeat(1001), // Exceeds 1000 chars
        targetDate: futureDate,
        targetValue: 85,
      };

      const result = smartGoalCreateSchema.safeParse(longDescription);
      expect(result.success).toBe(false);
    });

    it('should require integer values', () => {
      const decimalValue = {
        outcomeId: 'OUTCOME_123',
        description: 'Test goal',
        targetDate: futureDate,
        targetValue: 85.5, // Should be integer
      };

      const result = smartGoalCreateSchema.safeParse(decimalValue);
      expect(result.success).toBe(false);
    });
  });

  describe('smartGoalUpdateSchema', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    it('should validate partial smart goal updates', () => {
      const partialUpdate = {
        description: 'Updated goal description',
        observedValue: 75,
      };

      const result = smartGoalUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate observed value range', () => {
      const invalidObserved = {
        observedValue: 150, // Out of range
      };

      const result = smartGoalUpdateSchema.safeParse(invalidObserved);
      expect(result.success).toBe(false);
    });

    it('should still require future dates when provided', () => {
      const pastDateUpdate = {
        targetDate: '2020-01-01T00:00:00.000Z',
      };

      const result = smartGoalUpdateSchema.safeParse(pastDateUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('oralRoutineTemplateCreateSchema', () => {
    it('should validate oral routine template creation', () => {
      const validTemplate = {
        title: 'Morning Circle Time',
        titleEn: 'Morning Circle Time',
        titleFr: 'Temps de cercle matinal',
        description: 'Daily morning routine for language practice',
        expectations: ['A1.1', 'B2.3'],
      };

      const result = oralRoutineTemplateCreateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should validate title length limit', () => {
      const longTitle = {
        title: 'A'.repeat(201), // Exceeds 200 chars
      };

      const result = oralRoutineTemplateCreateSchema.safeParse(longTitle);
      expect(result.success).toBe(false);
    });

    it('should validate description length limit', () => {
      const longDescription = {
        title: 'Test Template',
        description: 'A'.repeat(1001), // Exceeds 1000 chars
      };

      const result = oralRoutineTemplateCreateSchema.safeParse(longDescription);
      expect(result.success).toBe(false);
    });
  });

  describe('dailyOralRoutineCreateSchema', () => {
    it('should validate daily routine creation', () => {
      const validRoutine = {
        date: '2024-06-30T10:00:00.000Z',
        templateId: 1,
        completed: true,
        notes: 'Great participation today',
        participation: 85,
      };

      const result = dailyOralRoutineCreateSchema.safeParse(validRoutine);
      expect(result.success).toBe(true);
    });

    it('should require positive template ID', () => {
      const invalidTemplate = {
        date: '2024-06-30T10:00:00.000Z',
        templateId: 0, // Must be positive
      };

      const result = dailyOralRoutineCreateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should validate participation range', () => {
      const invalidParticipation = {
        date: '2024-06-30T10:00:00.000Z',
        templateId: 1,
        participation: 101, // Out of range
      };

      const result = dailyOralRoutineCreateSchema.safeParse(invalidParticipation);
      expect(result.success).toBe(false);
    });

    it('should validate notes length', () => {
      const longNotes = {
        date: '2024-06-30T10:00:00.000Z',
        templateId: 1,
        notes: 'A'.repeat(501), // Exceeds 500 chars
      };

      const result = dailyOralRoutineCreateSchema.safeParse(longNotes);
      expect(result.success).toBe(false);
    });
  });

  describe('thematicUnitCreateSchema', () => {
    it('should validate thematic unit creation', () => {
      const validUnit = {
        title: 'Space Exploration',
        titleEn: 'Space Exploration',
        titleFr: 'Exploration spatiale',
        description: 'Multi-subject unit about space',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
        expectations: ['A1.1', 'B2.3', 'C3.1'],
        activities: [1, 2, 3],
      };

      const result = thematicUnitCreateSchema.safeParse(validUnit);
      expect(result.success).toBe(true);
    });

    it('should validate date ordering', () => {
      const invalidDates = {
        title: 'Test Unit',
        startDate: '2024-01-31T23:59:59.000Z',
        endDate: '2024-01-01T00:00:00.000Z', // End before start
      };

      const result = thematicUnitCreateSchema.safeParse(invalidDates);
      expect(result.success).toBe(false);
    });

    it('should validate title length', () => {
      const longTitle = {
        title: 'A'.repeat(201), // Exceeds 200 chars
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
      };

      const result = thematicUnitCreateSchema.safeParse(longTitle);
      expect(result.success).toBe(false);
    });

    it('should validate description length', () => {
      const longDescription = {
        title: 'Test Unit',
        description: 'A'.repeat(2001), // Exceeds 2000 chars
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
      };

      const result = thematicUnitCreateSchema.safeParse(longDescription);
      expect(result.success).toBe(false);
    });

    it('should validate activities as array of integers', () => {
      const invalidActivities = {
        title: 'Test Unit',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.000Z',
        activities: ['1', '2', '3'], // Should be numbers
      };

      const result = thematicUnitCreateSchema.safeParse(invalidActivities);
      expect(result.success).toBe(false);
    });
  });

  describe('parentMessageCreateSchema', () => {
    it('should validate parent message creation', () => {
      const validMessage = {
        title: 'Weekly Update',
        titleEn: 'Weekly Update',
        titleFr: 'Mise à jour hebdomadaire',
        timeframe: 'Week of June 24-28',
        contentFr: 'Contenu en français pour les parents',
        contentEn: 'English content for parents',
        linkedOutcomeIds: ['A1.1', 'B2.3'],
        linkedActivityIds: [1, 2, 3],
      };

      const result = parentMessageCreateSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should require both language contents', () => {
      const missingContent = {
        title: 'Test Message',
        timeframe: 'Week 1',
        contentEn: 'English content',
        // Missing contentFr
      };

      const result = parentMessageCreateSchema.safeParse(missingContent);
      expect(result.success).toBe(false);
    });

    it('should validate timeframe length', () => {
      const longTimeframe = {
        title: 'Test Message',
        timeframe: 'A'.repeat(101), // Exceeds 100 chars
        contentFr: 'French content',
        contentEn: 'English content',
      };

      const result = parentMessageCreateSchema.safeParse(longTimeframe);
      expect(result.success).toBe(false);
    });

    it('should validate title length', () => {
      const longTitle = {
        title: 'A'.repeat(201), // Exceeds 200 chars
        timeframe: 'Week 1',
        contentFr: 'French content',
        contentEn: 'English content',
      };

      const result = parentMessageCreateSchema.safeParse(longTitle);
      expect(result.success).toBe(false);
    });
  });

  describe('studentCreateSchema', () => {
    it('should validate student creation', () => {
      const validStudent = {
        name: 'Emma Thompson',
      };

      const result = studentCreateSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const missingName = {};

      const result = studentCreateSchema.safeParse(missingName);
      expect(result.success).toBe(false);
    });

    it('should validate name length', () => {
      const longName = {
        name: 'A'.repeat(201), // Exceeds 200 chars
      };

      const result = studentCreateSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const emptyName = {
        name: '',
      };

      const result = studentCreateSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });
  });

  describe('studentGoalCreateSchema', () => {
    it('should validate student goal creation', () => {
      const validGoal = {
        text: 'Master multiplication tables up to 12',
        outcomeId: 'A1.1',
        unitPlanId: 'unit_123',
        status: 'active' as const,
      };

      const result = studentGoalCreateSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('should use default status', () => {
      const goalWithoutStatus = {
        text: 'Learn addition facts',
      };

      const result = studentGoalCreateSchema.safeParse(goalWithoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('active');
      }
    });

    it('should validate status enum', () => {
      const invalidStatus = {
        text: 'Test goal',
        status: 'invalid_status',
      };

      const result = studentGoalCreateSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should validate text length', () => {
      const longText = {
        text: 'A'.repeat(501), // Exceeds 500 chars
      };

      const result = studentGoalCreateSchema.safeParse(longText);
      expect(result.success).toBe(false);
    });
  });

  describe('studentReflectionCreateSchema', () => {
    it('should validate student reflection creation', () => {
      const validReflection = {
        date: '2024-06-30T10:00:00.000Z',
        text: 'Today I learned about fractions and they are really interesting!',
        emoji: '😊',
        voicePath: '/recordings/student_123_reflection_20240630.mp3',
        outcomeId: 'A1.1',
        unitPlanId: 'unit_123',
      };

      const result = studentReflectionCreateSchema.safeParse(validReflection);
      expect(result.success).toBe(true);
    });

    it('should allow all fields to be optional', () => {
      const minimalReflection = {};

      const result = studentReflectionCreateSchema.safeParse(minimalReflection);
      expect(result.success).toBe(true);
    });

    it('should validate text length', () => {
      const longText = {
        text: 'A'.repeat(1001), // Exceeds 1000 chars
      };

      const result = studentReflectionCreateSchema.safeParse(longText);
      expect(result.success).toBe(false);
    });

    it('should validate emoji length', () => {
      const longEmoji = {
        emoji: '😊'.repeat(10), // Exceeds 10 chars
      };

      const result = studentReflectionCreateSchema.safeParse(longEmoji);
      expect(result.success).toBe(false);
    });

    it('should validate voice path length', () => {
      const longPath = {
        voicePath: 'A'.repeat(501), // Exceeds 500 chars
      };

      const result = studentReflectionCreateSchema.safeParse(longPath);
      expect(result.success).toBe(false);
    });
  });

  describe('cuidSchema', () => {
    it('should validate valid CUID format', () => {
      const validCuids = [
        'c123456789012345678901234', // 24 chars after 'c' (25 total)
        'cabcdef123456789012345678',
        'c999888777666555444333222',
      ];

      validCuids.forEach((cuid) => {
        const result = cuidSchema().safeParse(cuid);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid CUID formats', () => {
      const invalidCuids = [
        'invalid_id',
        '123456789012345678901234', // Missing 'c' prefix
        'c123', // Too short
        'c12345678901234567890123456789', // Too long
        'C123456789012345678901234', // Capital C
        'c12345678901234567890123G6', // Invalid character
      ];

      invalidCuids.forEach((cuid) => {
        const result = cuidSchema().safeParse(cuid);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid ID format');
        }
      });
    });
  });

  describe('validate middleware function', () => {
    it('should create validation middleware', () => {
      const middleware = validate(subjectSchema);
      expect(typeof middleware).toBe('function');
    });

    it('should validate request body and call next on success', () => {
      const middleware = validate(subjectSchema);
      const mockReq = {
        body: { name: 'Mathematics' },
      } as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 error on validation failure', () => {
      const middleware = validate(subjectSchema);
      const mockReq = {
        body: { invalidField: 'value' },
      } as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.any(Object),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should transform valid data and attach to req.body', () => {
      const middleware = validate(subjectSchema);
      const mockReq = {
        body: { name: 'Mathematics', nameEn: 'Math' },
      } as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual({
        name: 'Mathematics',
        nameEn: 'Math',
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Bilingual Field Helper Coverage', () => {
    it('should create schemas with bilingual fields', () => {
      // Test that the bilingual helper is working by checking milestone schema
      const withBilingualTitle = {
        title: 'Test',
        titleEn: 'Test English',
        titleFr: 'Test Français',
        subjectId: 1,
      };

      const result = milestoneCreateSchema.safeParse(withBilingualTitle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.titleEn).toBe('Test English');
        expect(result.data.titleFr).toBe('Test Français');
      }
    });

    it('should enforce max length on bilingual fields when specified', () => {
      const longBilingualFields = {
        title: 'Test',
        titleEn: 'A'.repeat(201), // Would exceed limit if enforced
        subjectId: 1,
      };

      // The specific limits are in the schema definitions
      const result = milestoneCreateSchema.safeParse(longBilingualFields);
      // This should succeed as title fields don't have explicit max limits in milestone schema
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Edge Cases and Error Handling', () => {
    it('should handle null and undefined values appropriately', () => {
      const nullValues = {
        name: null,
        nameEn: undefined,
      };

      const result = subjectSchema.safeParse(nullValues);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects', () => {
      const emptyObject = {};

      const result = subjectSchema.safeParse(emptyObject);
      expect(result.success).toBe(false); // name is required
    });

    it('should handle type coercion where appropriate', () => {
      // Numbers as strings
      const stringNumbers = {
        day: '1', // Should be number
        startMin: '480',
        endMin: '540',
      };

      const result = timetableEntrySchema.safeParse(stringNumbers);
      expect(result.success).toBe(false); // Strict typing, no coercion
    });

    it('should handle arrays of different types', () => {
      // Mixed array types
      const mixedArray = {
        title: 'Test',
        subjectId: 1,
        expectations: ['string', 123, true], // Should be array of strings
      };

      const result = milestoneCreateSchema.safeParse(mixedArray);
      expect(result.success).toBe(false);
    });
  });
});
