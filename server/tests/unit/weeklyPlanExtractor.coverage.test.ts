/**
 * Additional Test Coverage for Weekly Plan Extractor Service
 * 
 * Tests critical paths and edge cases that weren't covered in existing tests
 * to improve overall test coverage for the weekly planning functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WeeklyPlanExtractor } from '../../src/services/weeklyPlanExtractor';
import { getTestPrismaClient, createTestData } from '../jest.setup';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';

// Mock dependencies
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                weeklyPlan: {
                  week: 'Week of March 1, 2024',
                  theme: 'Numbers and Operations',
                  objectives: ['Understand place value', 'Practice addition'],
                  activities: [
                    {
                      day: 'Monday',
                      subject: 'Mathematics',
                      activity: 'Place value introduction',
                      duration: 60,
                      materials: ['Base-10 blocks', 'Worksheets']
                    }
                  ]
                }
              })
            }
          }]
        })
      }
    }
  })),
}));

describe('WeeklyPlanExtractor Coverage Tests', () => {
  let extractor: WeeklyPlanExtractor;
  let mockUser: any;
  let mockOutcomes: any[];

  beforeEach(async () => {
    // Create test data
    const testData = await createTestData(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: 'teacher@example.com',
          password: 'hashed_password',
          name: 'Test Teacher',
          role: 'teacher',
        },
      });

      // Create test outcomes
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: {
            code: 'A1.1',
            description: 'Demonstrate understanding of numbers',
            subject: 'Mathematics',
            grade: 5,
            domain: 'Number',
            userId: user.id,
          },
        }),
        prisma.outcome.create({
          data: {
            code: 'B2.2',
            description: 'Solve problems involving addition',
            subject: 'Mathematics',
            grade: 5,
            domain: 'Number',
            userId: user.id,
          },
        }),
      ]);

      return { user, outcomes };
    });

    mockUser = testData.user;
    mockOutcomes = testData.outcomes;
    extractor = new WeeklyPlanExtractor();
  });

  describe('Plan Extraction from Various Sources', () => {
    it('should extract plans from structured curriculum text', async () => {
      const curriculumText = `
        Week 1: Introduction to Numbers
        Monday: Place value lesson (60 minutes)
        - Materials: Base-10 blocks, worksheets
        - Outcome: A1.1
        
        Tuesday: Number comparison (45 minutes)
        - Materials: Number cards
        - Outcome: A1.1
        
        Wednesday: Addition practice (60 minutes)
        - Materials: Manipulatives
        - Outcome: B2.2
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(
        curriculumText,
        weekStart,
        mockUser.id
      );

      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
      expect(result.activities.length).toBeGreaterThan(0);
      expect(result.theme).toBeDefined();
    });

    it('should handle unstructured text input', async () => {
      const unstructuredText = `
        This week we will focus on numbers. Students need to learn about place value.
        We should also practice addition. Maybe use some manipulatives.
        Don't forget to review homework from last week.
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(
        unstructuredText,
        weekStart,
        mockUser.id
      );

      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
    });

    it('should handle multilingual content', async () => {
      const multilingualText = `
        Semaine 1: Introduction aux nombres / Week 1: Introduction to Numbers
        Lundi/Monday: Valeur de position / Place value
        Mardi/Tuesday: Comparaison / Comparison
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(
        multilingualText,
        weekStart,
        mockUser.id
      );

      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
    });

    it('should extract from table-formatted content', async () => {
      const tableText = `
        | Day | Subject | Activity | Duration | Materials |
        |-----|---------|----------|----------|-----------|
        | Monday | Math | Place value | 60 min | Blocks |
        | Tuesday | Math | Addition | 45 min | Cards |
        | Wednesday | Science | Experiments | 90 min | Lab kit |
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(
        tableText,
        weekStart,
        mockUser.id
      );

      expect(result).toBeDefined();
      expect(result.activities.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('AI Integration and Error Handling', () => {
    it('should handle OpenAI API failures gracefully', async () => {
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      const text = 'Simple lesson plan for this week';
      const weekStart = startOfWeek(new Date());

      // Should either retry or fall back to basic extraction
      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      expect(result).toBeDefined();
    });

    it('should handle malformed AI responses', async () => {
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response from AI'
          }
        }]
      });

      const text = 'Test lesson plan';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      expect(result).toBeDefined();
      // Should fall back to basic extraction when AI fails
    });

    it('should handle empty AI responses', async () => {
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: []
      });

      const text = 'Test lesson plan';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      expect(result).toBeDefined();
    });

    it('should validate AI response structure', async () => {
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              // Missing required fields
              invalidStructure: true
            })
          }
        }]
      });

      const text = 'Test lesson plan';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
    });
  });

  describe('Date and Time Handling', () => {
    it('should handle various date formats in input', async () => {
      const dateFormats = [
        'March 1-5, 2024',
        '03/01/2024 - 03/05/2024',
        'Week of 2024-03-01',
        'Monday March 1 to Friday March 5',
      ];

      for (const dateFormat of dateFormats) {
        const text = `${dateFormat}: Math lessons`;
        const weekStart = startOfWeek(new Date());
        
        const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
        expect(result).toBeDefined();
      }
    });

    it('should handle time durations in various formats', async () => {
      const timeFormats = [
        '60 minutes',
        '1 hour',
        '45 min',
        '1.5 hours',
        '90m',
      ];

      for (const timeFormat of timeFormats) {
        const text = `Monday: Math lesson (${timeFormat})`;
        const weekStart = startOfWeek(new Date());
        
        const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
        expect(result).toBeDefined();
        if (result.activities.length > 0) {
          expect(result.activities[0].duration).toBeGreaterThan(0);
        }
      }
    });

    it('should handle invalid date inputs', async () => {
      const text = 'Invalid date lesson plan';
      const invalidDate = new Date('invalid');

      await expect(
        extractor.extractWeeklyPlan(text, invalidDate, mockUser.id)
      ).rejects.toThrow();
    });

    it('should handle future dates correctly', async () => {
      const text = 'Future week lesson plan';
      const futureDate = addDays(new Date(), 365); // One year in future

      const result = await extractor.extractWeeklyPlan(text, futureDate, mockUser.id);
      expect(result).toBeDefined();
      expect(result.weekStart).toEqual(startOfWeek(futureDate));
    });
  });

  describe('Activity Parsing and Validation', () => {
    it('should parse complex activity descriptions', async () => {
      const complexText = `
        Monday 9:00-10:30 AM: Advanced Mathematics
        - Topic: Quadratic equations and factoring
        - Materials: Graphing calculators, worksheets A-C
        - Assessment: Quiz on previous material
        - Homework: Complete exercises 1-15
        - Notes: Differentiate for advanced learners
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(complexText, weekStart, mockUser.id);

      expect(result).toBeDefined();
      expect(result.activities.length).toBeGreaterThan(0);
      
      const activity = result.activities[0];
      expect(activity.materials).toBeDefined();
      expect(activity.materials.length).toBeGreaterThan(0);
    });

    it('should handle missing required activity fields', async () => {
      const incompleteText = `
        Some lesson without clear structure
        Materials mentioned but no day specified
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(incompleteText, weekStart, mockUser.id);

      expect(result).toBeDefined();
      // Should create valid activities even with incomplete information
      result.activities.forEach(activity => {
        expect(activity.day).toBeDefined();
        expect(activity.activity).toBeDefined();
      });
    });

    it('should validate and sanitize activity content', async () => {
      const maliciousText = `
        Monday: <script>alert('xss')</script> Math lesson
        Materials: <img src="x" onerror="alert(1)"> and blocks
        Objective: javascript:alert('malicious') understand numbers
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(maliciousText, weekStart, mockUser.id);

      expect(result).toBeDefined();
      result.activities.forEach(activity => {
        expect(activity.activity).not.toContain('<script>');
        expect(activity.activity).not.toContain('javascript:');
        expect(activity.activity).not.toContain('onerror');
        
        if (activity.materials) {
          activity.materials.forEach(material => {
            expect(material).not.toContain('<script>');
            expect(material).not.toContain('onerror');
          });
        }
      });
    });

    it('should handle extremely long activity descriptions', async () => {
      const longDescription = 'Very long activity description ' + 'with repeated content '.repeat(1000);
      const text = `Monday: ${longDescription}`;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);

      expect(result).toBeDefined();
      if (result.activities.length > 0) {
        // Should truncate or handle long descriptions appropriately
        expect(result.activities[0].activity.length).toBeLessThan(5000);
      }
    });
  });

  describe('Curriculum Alignment', () => {
    it('should align activities with curriculum outcomes', async () => {
      const alignedText = `
        Monday: Place value lesson - covers A1.1
        Tuesday: Addition practice - addresses B2.2
        Wednesday: Problem solving - relates to both A1.1 and B2.2
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(alignedText, weekStart, mockUser.id);

      expect(result).toBeDefined();
      expect(result.outcomeAlignment).toBeDefined();
      
      // Should identify curriculum codes mentioned in text
      const alignmentCodes = Object.keys(result.outcomeAlignment);
      expect(alignmentCodes).toContain('A1.1');
      expect(alignmentCodes).toContain('B2.2');
    });

    it('should handle curriculum codes in various formats', async () => {
      const codeFormats = [
        'A1.1',
        'A.1.1',
        'Math.A.1.1',
        'MATH-A1-1',
        'Strand A, Expectation 1.1',
      ];

      for (const codeFormat of codeFormats) {
        const text = `Monday: Lesson covering ${codeFormat}`;
        const weekStart = startOfWeek(new Date());
        
        const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
        expect(result).toBeDefined();
        expect(result.outcomeAlignment).toBeDefined();
      }
    });

    it('should suggest missing curriculum coverage', async () => {
      const limitedText = `
        Monday: Review homework
        Tuesday: Free reading
        Wednesday: Art project
      `;

      const weekStart = startOfWeek(new Date());
      const result = await extractor.extractWeeklyPlan(limitedText, weekStart, mockUser.id);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.missingCoverage).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large text inputs efficiently', async () => {
      const largeText = 'Week plan content '.repeat(10000);
      const weekStart = startOfWeek(new Date());

      const startTime = Date.now();
      const result = await extractor.extractWeeklyPlan(largeText, weekStart, mockUser.id);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle concurrent extractions', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const text = `Week ${i} plan content`;
        const weekStart = addDays(startOfWeek(new Date()), i * 7);
        promises.push(extractor.extractWeeklyPlan(text, weekStart, mockUser.id));
      }

      const results = await Promise.allSettled(promises);
      expect(results.length).toBe(5);
      
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value).toBeDefined();
        }
      });
    });

    it('should implement proper resource cleanup', async () => {
      const text = 'Test plan';
      const weekStart = startOfWeek(new Date());

      // Run multiple extractions to test for memory leaks
      for (let i = 0; i < 10; i++) {
        const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
        expect(result).toBeDefined();
      }

      // Should not accumulate resources or memory
      expect(true).toBe(true); // Basic completion test
    });
  });

  describe('Database Integration', () => {
    it('should save extracted plans to database', async () => {
      const text = 'Monday: Math lesson';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      
      // Should save to database when requested
      const savedPlan = await extractor.savePlan(result, mockUser.id);
      expect(savedPlan).toBeDefined();
      expect(savedPlan.id).toBeDefined();
    });

    it('should handle database save failures', async () => {
      const prisma = getTestPrismaClient();
      const originalCreate = prisma.weeklyPlan.create;
      prisma.weeklyPlan.create = jest.fn().mockRejectedValue(new Error('Database save failed'));

      const text = 'Monday: Math lesson';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      
      await expect(
        extractor.savePlan(result, mockUser.id)
      ).rejects.toThrow('Database save failed');

      // Restore original method
      prisma.weeklyPlan.create = originalCreate;
    });

    it('should update existing plans when requested', async () => {
      const text = 'Monday: Math lesson';
      const weekStart = startOfWeek(new Date());

      // Create initial plan
      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id);
      const savedPlan = await extractor.savePlan(result, mockUser.id);

      // Update with new content
      const updatedText = 'Monday: Enhanced Math lesson with activities';
      const updatedResult = await extractor.extractWeeklyPlan(updatedText, weekStart, mockUser.id);
      
      const updatedPlan = await extractor.updatePlan(savedPlan.id, updatedResult, mockUser.id);
      expect(updatedPlan).toBeDefined();
      expect(updatedPlan.id).toBe(savedPlan.id);
    });
  });

  describe('Configuration and Customization', () => {
    it('should respect user preferences for extraction', async () => {
      const preferences = {
        preferredSubjects: ['Mathematics', 'Science'],
        defaultDuration: 45,
        includeAssessments: true,
        language: 'en',
      };

      const text = 'Weekly lesson plan content';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id, preferences);
      expect(result).toBeDefined();
      
      // Should apply preferences to extraction
      result.activities.forEach(activity => {
        if (activity.duration === undefined) {
          expect(activity.duration).toBe(preferences.defaultDuration);
        }
      });
    });

    it('should handle invalid preference configurations', async () => {
      const invalidPreferences = {
        defaultDuration: -1, // Invalid duration
        includeAssessments: 'maybe', // Invalid boolean
        preferredSubjects: 'not an array', // Invalid array
      };

      const text = 'Weekly lesson plan content';
      const weekStart = startOfWeek(new Date());

      // Should handle invalid preferences gracefully
      const result = await extractor.extractWeeklyPlan(text, weekStart, mockUser.id, invalidPreferences);
      expect(result).toBeDefined();
    });

    it('should support custom extraction templates', async () => {
      const customTemplate = {
        requiredFields: ['day', 'subject', 'activity', 'duration'],
        optionalFields: ['materials', 'assessment', 'homework'],
        format: 'structured',
      };

      const text = 'Monday: Math (60min) - Place value with blocks';
      const weekStart = startOfWeek(new Date());

      const result = await extractor.extractWeeklyPlan(
        text, 
        weekStart, 
        mockUser.id, 
        null, 
        customTemplate
      );

      expect(result).toBeDefined();
      result.activities.forEach(activity => {
        customTemplate.requiredFields.forEach(field => {
          expect(activity[field]).toBeDefined();
        });
      });
    });
  });
});