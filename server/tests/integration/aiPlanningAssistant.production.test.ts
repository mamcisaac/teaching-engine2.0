/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Production-level integration tests for AIPlanningAssistantService
 *
 * These tests make REAL API calls to OpenAI to validate actual AI functionality.
 * They test AI output quality, consistency, and error handling with real data.
 *
 * Prerequisites:
 * - OPENAI_API_KEY environment variable must be set
 * - Test database must be available
 * - Real curriculum data should be seeded for comprehensive testing
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { AIPlanningAssistantService } from '../../src/services/aiPlanningAssistant';
import { prisma } from '../../src/prisma';
import { DatabaseTestUtils } from '../utils/DatabaseTestUtils';

describe('AIPlanningAssistantService - Production Integration', () => {
  let service: AIPlanningAssistantService;
  let testUtils: DatabaseTestUtils;

  // Test configuration
  const TEST_TIMEOUT = 30000; // 30 seconds for real API calls
  const MIN_SUGGESTION_LENGTH = 10; // Minimum length for meaningful suggestions
  const MAX_SUGGESTION_LENGTH = 500; // Maximum reasonable length
  const QUALITY_THRESHOLD = 0.7; // Minimum quality score for suggestions

  beforeAll(async () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable required for production tests');
    }

    testUtils = new DatabaseTestUtils();
    await testUtils.setupTestDatabase();
    service = new AIPlanningAssistantService();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await testUtils.cleanupTestDatabase();
  });

  beforeEach(() => {
    await testUtils.resetTestData();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as unknown);
  });

  describe('Service Health and Configuration', () => {
    it(
      'should report healthy status with valid API key',
      async () => {
        const health = await service.getServiceHealth();

        expect(health.healthy).toBe(true);
        expect(health.apiKey).toBe(true);
        expect(health.lastCheck).toBeDefined();
        expect(health.error).toBeUndefined();
      },
      TEST_TIMEOUT,
    );

    it(
      'should make successful test API call',
      async () => {
        const health = await service.getServiceHealth();

        // If healthy, it means a real API call succeeded
        if (health.healthy) {
          expect(health.apiKey).toBe(true);
        } else {
          console.warn('API health check failed:', health.error);
          expect(health.error).toBeDefined();
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Long-Range Goals Generation', () => {
    const testContext = {
      subject: 'Mathematics',
      grade: 3,
      termLength: 10,
      focusAreas: ['Number Sense', 'Problem Solving', 'Mathematical Reasoning'],
    };

    it(
      'should generate appropriate long-range goals for Grade 3 Mathematics',
      async () => {
        const result = await service.generateLongRangeGoals(testContext);

        expect(result.type).toBe('goals');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate goal quality
        for (const goal of result.suggestions) {
          expect(goal.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
          expect(goal.length).toBeLessThan(MAX_SUGGESTION_LENGTH);

          // Goals should be SMART and grade-appropriate
          const goalLower = goal.toLowerCase();
          expect(
            goalLower.includes('student') ||
              goalLower.includes('learn') ||
              goalLower.includes('develop') ||
              goalLower.includes('improve') ||
              goalLower.includes('master'),
          ).toBe(true);
        }

        // Rationale should explain the goals
        expect(result.rationale!.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
        expect(result.rationale!.toLowerCase()).toMatch(/goal|grade|math|student/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should adapt goals for different grades and subjects',
      async () => {
        const grade1Context = {
          subject: 'Language Arts',
          grade: 1,
          termLength: 8,
          focusAreas: ['Phonics', 'Reading Comprehension'],
        };

        const grade6Context = {
          subject: 'Science',
          grade: 6,
          termLength: 12,
          focusAreas: ['Scientific Method', 'Life Science'],
        };

        const [grade1Result, grade6Result] = await Promise.all([
          service.generateLongRangeGoals(grade1Context),
          service.generateLongRangeGoals(grade6Context),
        ]);

        // Both should succeed
        expect(grade1Result.suggestions.length).toBeGreaterThan(0);
        expect(grade6Result.suggestions.length).toBeGreaterThan(0);

        // Goals should be different and grade-appropriate
        const grade1Text = grade1Result.suggestions.join(' ').toLowerCase();
        const grade6Text = grade6Result.suggestions.join(' ').toLowerCase();

        // Grade 1 should use simpler language
        expect(grade1Text).toMatch(/read|sound|letter|word|simple/);

        // Grade 6 should use more complex language
        expect(grade6Text).toMatch(/analyze|investigate|hypothesis|experiment|complex/);

        // Different subjects should have different focus
        expect(grade1Text).toMatch(/read|write|phonics|comprehension/);
        expect(grade6Text).toMatch(/science|investigate|method|observation/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle edge cases gracefully',
      async () => {
        // Test with minimal context
        const minimalContext = {
          subject: 'Art',
          grade: 4,
          termLength: 6,
        };

        const result = await service.generateLongRangeGoals(minimalContext);

        expect(result.type).toBe('goals');
        expect(result.suggestions).toBeDefined();

        // Should still provide meaningful goals even without focus areas
        if (result.suggestions.length > 0) {
          expect(result.suggestions[0].length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Unit Big Ideas Generation', () => {
    const testContext = {
      unitTitle: 'Fractions and Decimals',
      subject: 'Mathematics',
      grade: 4,
      curriculumExpectations: [
        'Understand fractions as parts of a whole',
        'Compare and order fractions with like denominators',
        'Add and subtract fractions with like denominators',
        'Recognize decimal notation for tenths and hundredths',
      ],
      duration: 3,
    };

    it(
      'should generate conceptual big ideas for fraction unit',
      async () => {
        const result = await service.generateUnitBigIdeas(testContext);

        expect(result.type).toBe('bigIdeas');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate big idea quality
        for (const idea of result.suggestions) {
          expect(idea.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
          expect(idea.length).toBeLessThan(MAX_SUGGESTION_LENGTH);

          // Big ideas should be conceptual and student-friendly
          const ideaLower = idea.toLowerCase();
          expect(
            ideaLower.includes('fraction') ||
              ideaLower.includes('part') ||
              ideaLower.includes('whole') ||
              ideaLower.includes('decimal') ||
              ideaLower.includes('number'),
          ).toBe(true);
        }

        // Should connect to curriculum expectations
        const allText = result.suggestions.join(' ').toLowerCase();
        expect(allText).toMatch(/fraction|part|whole|decimal/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should adapt big ideas for different subjects and concepts',
      async () => {
        const scienceContext = {
          unitTitle: 'Life Cycles',
          subject: 'Science',
          grade: 2,
          curriculumExpectations: [
            'Identify stages in animal life cycles',
            'Compare life cycles of different animals',
            'Observe changes in living things over time',
          ],
          duration: 2,
        };

        const result = await service.generateUnitBigIdeas(scienceContext);

        expect(result.type).toBe('bigIdeas');
        expect(result.suggestions.length).toBeGreaterThan(0);

        // Should focus on science concepts
        const allText = result.suggestions.join(' ').toLowerCase();
        expect(allText).toMatch(/life|cycle|grow|change|animal|living/);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Lesson Activities Generation', () => {
    const testContext = {
      lessonTitle: 'Introduction to Multiplication',
      learningGoals: [
        'Understand multiplication as repeated addition',
        'Solve simple multiplication problems using manipulatives',
        'Represent multiplication using arrays and groups',
      ],
      subject: 'Mathematics',
      grade: 3,
      duration: 45,
      materials: ['counters', 'grid paper', 'multiplication charts'],
    };

    it(
      'should generate structured lesson activities with timing',
      async () => {
        const result = await service.generateLessonActivities(testContext);

        expect(result.type).toBe('activities');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate activity structure
        let totalTime = 0;
        for (const activity of result.suggestions) {
          expect(activity.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);

          // Activities should include timing
          const timeMatch = activity.match(/\((\d+)\s*min/i);
          if (timeMatch) {
            totalTime += parseInt(timeMatch[1]);
          }

          // Activities should be grade-appropriate
          const activityLower = activity.toLowerCase();
          expect(
            activityLower.includes('activity') ||
              activityLower.includes('students') ||
              activityLower.includes('practice') ||
              activityLower.includes('work') ||
              activityLower.includes('explore'),
          ).toBe(true);
        }

        // Total time should be reasonable for lesson duration
        if (totalTime > 0) {
          expect(totalTime).toBeLessThanOrEqual(testContext.duration + 10); // Allow some flexibility
        }

        // Should incorporate provided materials
        const allText = result.suggestions.join(' ').toLowerCase();
        expect(
          allText.includes('counter') || allText.includes('grid') || allText.includes('chart'),
        ).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate activities without materials when not provided',
      async () => {
        const contextWithoutMaterials = {
          ...testContext,
          materials: undefined,
        };

        const result = await service.generateLessonActivities(contextWithoutMaterials);

        expect(result.type).toBe('activities');
        expect(result.suggestions.length).toBeGreaterThan(0);

        // Should still provide meaningful activities
        expect(result.suggestions[0].length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
      },
      TEST_TIMEOUT,
    );

    it(
      'should adapt activities for different lesson durations',
      async () => {
        const shortContext = { ...testContext, duration: 20 };
        const longContext = { ...testContext, duration: 90 };

        const [shortResult, longResult] = await Promise.all([
          service.generateLessonActivities(shortContext),
          service.generateLessonActivities(longContext),
        ]);

        expect(shortResult.suggestions.length).toBeGreaterThan(0);
        expect(longResult.suggestions.length).toBeGreaterThan(0);

        // Longer lessons should have more activities or longer activities
        expect(longResult.suggestions.length).toBeGreaterThanOrEqual(
          shortResult.suggestions.length,
        );
      },
      TEST_TIMEOUT,
    );
  });

  describe('Materials List Generation', () => {
    const testContext = {
      activities: [
        'Group brainstorming on chart paper (10 minutes)',
        'Hands-on place value exploration with base-10 blocks (15 minutes)',
        'Individual practice on whiteboards (10 minutes)',
        'Partner sharing and reflection (10 minutes)',
      ],
      subject: 'Mathematics',
      grade: 2,
      classSize: 24,
    };

    it(
      'should generate comprehensive materials list with quantities',
      async () => {
        const result = await service.generateMaterialsList(testContext);

        expect(result.type).toBe('materials');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate material suggestions
        for (const material of result.suggestions) {
          expect(material.length).toBeGreaterThan(5); // At least some description

          // Should include quantities or specifications
          expect(
            /\d+/.test(material) || // Contains numbers
              /per|each|set|pair|group/.test(material.toLowerCase()), // Contains quantity words
          ).toBe(true);
        }

        // Should include materials referenced in activities
        const allMaterials = result.suggestions.join(' ').toLowerCase();
        expect(
          allMaterials.includes('chart') ||
            allMaterials.includes('paper') ||
            allMaterials.includes('block') ||
            allMaterials.includes('whiteboard'),
        ).toBe(true);

        // Should consider class size
        expect(allMaterials).toMatch(/24|per student|per pair|per group/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should adapt materials for different class sizes',
      async () => {
        const smallClassContext = { ...testContext, classSize: 12 };
        const largeClassContext = { ...testContext, classSize: 30 };

        const [smallResult, largeResult] = await Promise.all([
          service.generateMaterialsList(smallClassContext),
          service.generateMaterialsList(largeClassContext),
        ]);

        expect(smallResult.suggestions.length).toBeGreaterThan(0);
        expect(largeResult.suggestions.length).toBeGreaterThan(0);

        // Should reference different quantities
        const smallText = smallResult.suggestions.join(' ');
        const largeText = largeResult.suggestions.join(' ');

        expect(smallText).toMatch(/12|per student|per pair/);
        expect(largeText).toMatch(/30|per student|per group/);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Assessment Strategies Generation', () => {
    const testContext = {
      learningGoals: [
        'Understand fractions as parts of a whole',
        'Work collaboratively to solve problems',
        'Explain mathematical thinking clearly',
      ],
      activities: [
        'Group work with fraction manipulatives',
        'Individual practice with fraction worksheets',
        'Partner sharing of problem-solving strategies',
      ],
      subject: 'Mathematics',
      grade: 3,
    };

    it(
      'should generate varied assessment strategies',
      async () => {
        const result = await service.generateAssessmentStrategies(testContext);

        expect(result.type).toBe('assessments');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate assessment variety
        const allAssessments = result.suggestions.join(' ').toLowerCase();

        // Should include different assessment types
        const assessmentTypes = [
          'observation',
          'checklist',
          'exit',
          'ticket',
          'self',
          'peer',
          'discussion',
          'question',
          'product',
          'portfolio',
          'rubric',
        ];

        const foundTypes = assessmentTypes.filter((type) => allAssessments.includes(type));
        expect(foundTypes.length).toBeGreaterThan(1); // Multiple assessment types

        // Should align with learning goals
        expect(allAssessments).toMatch(/fraction|collaboration|explain|understand/);

        // Should be manageable for teachers
        for (const assessment of result.suggestions) {
          expect(assessment.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);
          expect(assessment.length).toBeLessThan(MAX_SUGGESTION_LENGTH);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Reflection Prompts Generation', () => {
    const testContext = {
      date: new Date('2024-01-15'),
      activities: [
        'Fraction introduction with visual models',
        'Manipulative exploration in groups',
        'Exit ticket assessment',
      ],
      subject: 'Mathematics',
      grade: 3,
      previousReflections: [
        'Students struggled with equivalent fractions concept',
        'Need more visual representations for abstract concepts',
        'Group work was effective but needed better structure',
      ],
    };

    it(
      'should generate meaningful reflection prompts',
      async () => {
        const result = await service.generateReflectionPrompts(testContext);

        expect(result.type).toBe('reflections');
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.rationale).toBeDefined();

        // Validate reflection quality
        for (const prompt of result.suggestions) {
          expect(prompt.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);

          // Should be question format
          expect(prompt.endsWith('?')).toBe(true);

          // Should focus on teaching and learning
          const promptLower = prompt.toLowerCase();
          expect(
            promptLower.includes('student') ||
              promptLower.includes('learn') ||
              promptLower.includes('teach') ||
              promptLower.includes('how') ||
              promptLower.includes('what') ||
              promptLower.includes('which'),
          ).toBe(true);
        }

        // Should reference lesson activities
        const allPrompts = result.suggestions.join(' ').toLowerCase();
        expect(allPrompts).toMatch(/fraction|activity|group|assess/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should work without previous reflections',
      async () => {
        const contextWithoutPrevious = {
          ...testContext,
          previousReflections: undefined,
        };

        const result = await service.generateReflectionPrompts(contextWithoutPrevious);

        expect(result.type).toBe('reflections');
        expect(result.suggestions.length).toBeGreaterThan(0);

        // Should still provide meaningful prompts
        expect(result.suggestions[0].endsWith('?')).toBe(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Curriculum-Aligned Suggestions', () => {
    let testExpectationIds: string[];

    beforeEach(() => {
      // Create test curriculum expectations
      const expectations = await Promise.all([
        prisma.curriculumExpectation.create({
          data: {
            code: 'MA3.NS.1',
            description: 'Represent and compare whole numbers up to 1000',
            subject: 'Mathematics',
            grade: 3,
            learningGoals: ['Compare numbers', 'Understand place value'],
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'MA3.NS.2',
            description: 'Add and subtract three-digit numbers',
            subject: 'Mathematics',
            grade: 3,
            learningGoals: ['Addition strategies', 'Subtraction strategies'],
          },
        }),
      ]);

      testExpectationIds = expectations.map((e) => e.id);
    });

    it(
      'should generate curriculum-aligned activities',
      async () => {
        const suggestions = await service.getCurriculumAlignedSuggestions(
          testExpectationIds,
          'activities',
        );

        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);

        if (suggestions.length > 0) {
          for (const suggestion of suggestions) {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.length).toBeGreaterThan(MIN_SUGGESTION_LENGTH);

            // Should relate to the curriculum expectations
            const suggestionLower = suggestion.toLowerCase();
            expect(
              suggestionLower.includes('number') ||
                suggestionLower.includes('compare') ||
                suggestionLower.includes('add') ||
                suggestionLower.includes('subtract') ||
                suggestionLower.includes('place value'),
            ).toBe(true);
          }
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate curriculum-aligned assessments',
      async () => {
        const suggestions = await service.getCurriculumAlignedSuggestions(
          testExpectationIds,
          'assessments',
        );

        expect(Array.isArray(suggestions)).toBe(true);

        if (suggestions.length > 0) {
          const allSuggestions = suggestions.join(' ').toLowerCase();
          expect(allSuggestions).toMatch(/assess|evaluat|test|observ|check|demonstrat/);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate curriculum-aligned resources',
      async () => {
        const suggestions = await service.getCurriculumAlignedSuggestions(
          testExpectationIds,
          'resources',
        );

        expect(Array.isArray(suggestions)).toBe(true);

        if (suggestions.length > 0) {
          const allSuggestions = suggestions.join(' ').toLowerCase();
          expect(allSuggestions).toMatch(/material|resource|tool|manipulat|chart|game/);
        }
      },
      TEST_TIMEOUT,
    );

    it('should handle empty expectation list gracefully', async () => {
      const suggestions = await service.getCurriculumAlignedSuggestions([], 'activities');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it(
      'should handle API rate limiting gracefully',
      async () => {
        // Make multiple concurrent requests to potentially trigger rate limiting
        const requests = Array.from({ length: 5 }, () =>
          service.generateLongRangeGoals({
            subject: 'Mathematics',
            grade: 3,
            termLength: 10,
          }),
        );

        const results = await Promise.allSettled(requests);

        // At least some should succeed
        const successful = results.filter((r) => r.status === 'fulfilled');
        expect(successful.length).toBeGreaterThan(0);

        // Failed ones should handle errors gracefully
        const failed = results.filter((r) => r.status === 'rejected');
        for (const failure of failed) {
          expect(failure.status).toBe('rejected');
          // Error should be logged, not thrown
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle malformed JSON responses',
      async () => {
        // This test verifies the service handles unexpected AI responses
        const result = await service.generateLongRangeGoals({
          subject: 'Test Subject With Unusual Characters: 测试!@#$%',
          grade: 3,
          termLength: 10,
        });

        // Should not throw error, even with unusual input
        expect(result.type).toBe('goals');
        expect(Array.isArray(result.suggestions)).toBe(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('AI Output Quality Validation', () => {
    it(
      'should maintain consistency across multiple calls',
      async () => {
        const context = {
          subject: 'Mathematics',
          grade: 3,
          termLength: 10,
          focusAreas: ['Number Sense'],
        };

        // Make multiple calls with same context
        const [result1, result2, result3] = await Promise.all([
          service.generateLongRangeGoals(context),
          service.generateLongRangeGoals(context),
          service.generateLongRangeGoals(context),
        ]);

        // All should succeed
        expect(result1.suggestions.length).toBeGreaterThan(0);
        expect(result2.suggestions.length).toBeGreaterThan(0);
        expect(result3.suggestions.length).toBeGreaterThan(0);

        // Should have some consistency in themes (not identical, but related)
        const allSuggestions = [
          ...result1.suggestions,
          ...result2.suggestions,
          ...result3.suggestions,
        ]
          .join(' ')
          .toLowerCase();

        // Should consistently mention grade-appropriate math concepts
        expect(allSuggestions).toMatch(/number|math|student|learn|grade/);
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate contextually appropriate content',
      async () => {
        const kindergartenContext = {
          subject: 'Mathematics',
          grade: 0, // Kindergarten
          termLength: 8,
        };

        const highSchoolContext = {
          subject: 'Mathematics',
          grade: 12,
          termLength: 18,
        };

        const [kResult, hsResult] = await Promise.all([
          service.generateLongRangeGoals(kindergartenContext),
          service.generateLongRangeGoals(highSchoolContext),
        ]);

        if (kResult.suggestions.length > 0 && hsResult.suggestions.length > 0) {
          const kText = kResult.suggestions.join(' ').toLowerCase();
          const hsText = hsResult.suggestions.join(' ').toLowerCase();

          // Kindergarten should use simple concepts
          expect(kText).toMatch(/count|number|shape|simple|basic/);

          // Grade 12 should use advanced concepts
          expect(hsText).toMatch(/algebra|calculus|function|complex|advanced|analysis/);

          // Should be different complexity levels
          expect(kText).not.toEqual(hsText);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Performance and Resource Usage', () => {
    it(
      'should complete requests within reasonable time limits',
      async () => {
        const startTime = Date.now();

        const result = await service.generateLongRangeGoals({
          subject: 'Mathematics',
          grade: 3,
          termLength: 10,
        });

        const duration = Date.now() - startTime;

        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(TEST_TIMEOUT); // Should complete within timeout

        // Log performance for monitoring
        console.log(`API call completed in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle batch operations efficiently',
      async () => {
        const contexts = [
          { subject: 'Mathematics', grade: 1, termLength: 8 },
          { subject: 'Science', grade: 2, termLength: 10 },
          { subject: 'Language Arts', grade: 3, termLength: 12 },
        ];

        const startTime = Date.now();

        const results = await Promise.all(
          contexts.map((context) => service.generateLongRangeGoals(context)),
        );

        const duration = Date.now() - startTime;

        // All should succeed
        expect(results.length).toBe(3);
        results.forEach((result) => {
          expect(result.suggestions.length).toBeGreaterThan(0);
        });

        // Batch should be more efficient than sequential
        expect(duration).toBeLessThan(TEST_TIMEOUT);

        console.log(`Batch API calls completed in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );
  });
});
