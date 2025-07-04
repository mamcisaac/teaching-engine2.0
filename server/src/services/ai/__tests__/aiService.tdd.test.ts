/**
 * TDD-Compliant AI Service Tests
 * Uses real service instances with test configurations
 */

import {
  createRealService,
  setupRealTestLifecycle,
  TestDataFactory,
  createTestUser,
  performanceHelpers,
} from '../../../../tests/utils/tdd-test-utilities';
import { AIActivityGeneratorService } from '../../refactored/aiActivityGeneratorService';
import { AIActivityGeneratorService as NewAIService } from '../aiActivityGeneratorService';

describe('AI Service - Real Implementation Tests', () => {
  const testLifecycle = setupRealTestLifecycle();
  let aiService: AIActivityGeneratorService;
  let factory: TestDataFactory;
  let testUser: unknown;

  beforeAll(async () => {
    factory = new TestDataFactory();
    await factory.initialize();
  });

  beforeEach(async () => {
    // Create real service instance with test configuration
    aiService = await createRealService(AIActivityGeneratorService, {
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
      model: 'gpt-3.5-turbo', // Use cheaper model for tests
      maxTokens: 500, // Limit tokens for cost control
      temperature: 0.1, // Low temperature for consistent test results
    });

    testUser = await factory.createUser({
      email: 'ai-test@example.com',
      name: 'AI Test User',
    });
  });

  describe('RED - Write Failing Tests First', () => {
    it('should fail when no curriculum expectations provided', async () => {
      await expect(
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 5,
          expectations: [],
          activityType: 'practice',
        })
      ).rejects.toThrow('At least one curriculum expectation is required');
    });

    it('should fail with invalid grade level', async () => {
      const expectation = await factory.createCurriculumExpectation({
        code: 'MATH.5.1',
        description: 'Add and subtract whole numbers',
        subject: 'Mathematics',
        grade: 5,
      });

      await expect(
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 15, // Invalid grade
          expectations: [expectation.id],
          activityType: 'practice',
        })
      ).rejects.toThrow('Grade must be between 1 and 12');
    });

    it('should fail with unsupported activity type', async () => {
      const expectation = await factory.createCurriculumExpectation();

      await expect(
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 5,
          expectations: [expectation.id],
          activityType: 'unsupported-type' as unknown,
        })
      ).rejects.toThrow('Unsupported activity type');
    });
  });

  describe('GREEN - Implement Minimum Code', () => {
    it('should generate basic math activity with real expectations', async () => {
      // Create real curriculum expectation
      const expectation = await factory.createCurriculumExpectation({
        code: 'MATH.5.NBT.1',
        description: 'Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right',
        subject: 'Mathematics',
        grade: 5,
        strand: 'Number and Operations in Base Ten',
      });

      const result = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Mathematics',
        grade: 5,
        expectations: [expectation.id],
        activityType: 'practice',
        duration: 30,
      });

      // Verify structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('assessmentCriteria');
      expect(result.subject).toBe('Mathematics');
      expect(result.grade).toBe(5);
      expect(result.duration).toBe(30);

      // Verify database persistence
      const client = await testLifecycle.getClient();
      const savedActivity = await client.activity.findUnique({
        where: { id: result.id },
        include: { expectations: true },
      });

      expect(savedActivity).toBeTruthy();
      expect(savedActivity!.title).toBe(result.title);
      expect(savedActivity!.expectations).toHaveLength(1);
      expect(savedActivity!.expectations[0].expectationId).toBe(expectation.id);
    });

    it('should generate science investigation activity', async () => {
      const expectation = await factory.createCurriculumExpectation({
        code: 'SCI.5.ESS.1',
        description: 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact',
        subject: 'Science',
        grade: 5,
        strand: 'Earth and Space Sciences',
      });

      const result = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Science',
        grade: 5,
        expectations: [expectation.id],
        activityType: 'investigation',
        duration: 45,
        additionalContext: 'Focus on local ecosystem interactions',
      });

      expect(result.activityType).toBe('investigation');
      expect(result.subject).toBe('Science');
      expect(result.instructions).toContain('investigate');
      expect(result.materials).toBeInstanceOf(Array);
      expect(result.materials.length).toBeGreaterThan(0);

      // Should include scientific method elements
      expect(
        result.description.toLowerCase().includes('hypothesis') ||
        result.instructions.toLowerCase().includes('observe') ||
        result.assessmentCriteria.toLowerCase().includes('evidence')
      ).toBe(true);
    });
  });

  describe('REFACTOR - Improve Implementation', () => {
    it('should handle multiple expectations with real relationships', async () => {
      // Create related expectations
      const expectations = await Promise.all([
        factory.createCurriculumExpectation({
          code: 'MATH.5.NF.1',
          description: 'Add and subtract fractions with unlike denominators',
          subject: 'Mathematics',
          grade: 5,
          strand: 'Number and Operations - Fractions',
        }),
        factory.createCurriculumExpectation({
          code: 'MATH.5.NF.2',
          description: 'Solve word problems involving addition and subtraction of fractions',
          subject: 'Mathematics',
          grade: 5,
          strand: 'Number and Operations - Fractions',
        }),
      ]);

      const result = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Mathematics',
        grade: 5,
        expectations: expectations.map(e => e.id),
        activityType: 'problem-solving',
        duration: 60,
      });

      // Verify it addresses multiple expectations
      const client = await testLifecycle.getClient();
      const savedActivity = await client.activity.findUnique({
        where: { id: result.id },
        include: { expectations: true },
      });

      expect(savedActivity!.expectations).toHaveLength(2);
      
      // Activity should integrate both concepts
      const content = `${result.description} ${result.instructions}`.toLowerCase();
      expect(content).toContain('fraction');
      expect(content.includes('word problem') || content.includes('problem solving')).toBe(true);
    });

    it('should differentiate activities by grade level', async () => {
      const baseExpectation = {
        code: 'MATH.ADD.1',
        description: 'Add whole numbers',
        subject: 'Mathematics',
        strand: 'Number and Operations',
      };

      // Create expectations for different grades
      const grade1Expectation = await factory.createCurriculumExpectation({
        ...baseExpectation,
        grade: 1,
      });

      const grade5Expectation = await factory.createCurriculumExpectation({
        ...baseExpectation,
        grade: 5,
      });

      // Generate activities for different grades
      const [grade1Activity, grade5Activity] = await Promise.all([
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 1,
          expectations: [grade1Expectation.id],
          activityType: 'practice',
        }),
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 5,
          expectations: [grade5Expectation.id],
          activityType: 'practice',
        }),
      ]);

      // Grade 1 should be simpler
      expect(grade1Activity.title.length).toBeLessThan(grade5Activity.title.length);
      
      // Grade 1 should have simpler vocabulary
      const grade1Content = grade1Activity.description.toLowerCase();
      const grade5Content = grade5Activity.description.toLowerCase();
      
      // Grade 5 should have more complex concepts
      expect(grade5Content.split(' ').length).toBeGreaterThan(
        grade1Content.split(' ').length
      );
    });

    it('should handle edge cases with real data', async () => {
      const expectation = await factory.createCurriculumExpectation({
        code: 'LANG.5.W.1',
        description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information',
        subject: 'Language Arts',
        grade: 5,
        strand: 'Writing',
      });

      // Test with minimal duration
      const shortActivity = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Language Arts',
        grade: 5,
        expectations: [expectation.id],
        activityType: 'practice',
        duration: 10, // Very short
      });

      expect(shortActivity.duration).toBe(10);
      expect(shortActivity.instructions).toBeTruthy();

      // Test with very long context
      const longContext = 'A'.repeat(1000); // Very long context
      const contextActivity = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Language Arts',
        grade: 5,
        expectations: [expectation.id],
        activityType: 'practice',
        additionalContext: longContext,
      });

      expect(contextActivity).toBeTruthy();
      expect(contextActivity.description.length).toBeGreaterThan(0);
    });

    it('should perform well with realistic data volumes', async () => {
      // Create realistic data set
      const { expectations } = await performanceHelpers.createRealisticDataVolume(
        factory,
        testUser.id
      );

      // Measure performance of activity generation
      const duration = await performanceHelpers.measureDatabasePerformance(
        async () => {
          return aiService.generateActivity({
            userId: testUser.id,
            subject: 'Mathematics',
            grade: 5,
            expectations: expectations.slice(0, 3).map(e => e.id),
            activityType: 'practice',
          });
        },
        5000 // 5 second max for AI generation
      );

      console.log(`AI activity generation completed in ${duration}ms`);
    });

    it('should validate activity quality with real AI responses', async () => {
      const expectation = await factory.createCurriculumExpectation({
        code: 'SCI.5.PS.1',
        description: 'Develop a model to describe that matter is made of particles too small to be seen',
        subject: 'Science',
        grade: 5,
        strand: 'Physical Science',
      });

      const activity = await aiService.generateActivity({
        userId: testUser.id,
        subject: 'Science',
        grade: 5,
        expectations: [expectation.id],
        activityType: 'investigation',
        duration: 45,
      });

      // Quality checks for real AI output
      expect(activity.title).toBeTruthy();
      expect(activity.title.length).toBeGreaterThan(10);
      expect(activity.title.length).toBeLessThan(100);

      expect(activity.description).toBeTruthy();
      expect(activity.description.length).toBeGreaterThan(50);

      expect(activity.instructions).toBeTruthy();
      expect(activity.instructions.split('\n').length).toBeGreaterThan(1);

      expect(activity.materials).toBeInstanceOf(Array);
      expect(activity.materials.length).toBeGreaterThan(0);

      expect(activity.assessmentCriteria).toBeTruthy();
      expect(activity.assessmentCriteria.length).toBeGreaterThan(20);

      // Subject-specific validation
      const scienceContent = `${activity.description} ${activity.instructions}`.toLowerCase();
      expect(
        scienceContent.includes('particle') ||
        scienceContent.includes('matter') ||
        scienceContent.includes('atom') ||
        scienceContent.includes('molecule')
      ).toBe(true);
    });
  });

  describe('Error Handling with Real Services', () => {
    it('should handle AI service failures gracefully', async () => {
      // Create service with invalid API key
      const faultyService = await createRealService(AIActivityGeneratorService, {
        apiKey: 'invalid-key',
        maxRetries: 1,
      });

      const expectation = await factory.createCurriculumExpectation();

      await expect(
        faultyService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 5,
          expectations: [expectation.id],
          activityType: 'practice',
        })
      ).rejects.toThrow();
    });

    it('should handle database constraint violations', async () => {
      const expectation = await factory.createCurriculumExpectation();

      // Try to create activity with duplicate ID
      const client = await testLifecycle.getClient();
      const existingActivity = await client.activity.create({
        data: {
          id: 'duplicate-id',
          title: 'Existing Activity',
          description: 'Already exists',
          instructions: 'Test',
          materials: ['test'],
          assessmentCriteria: 'Test criteria',
          subject: 'Mathematics',
          grade: 5,
          duration: 30,
          activityType: 'practice',
          userId: testUser.id,
        },
      });

      // Mock the service to try to use the same ID
      const originalGenerate = aiService.generateActivity;
      aiService.generateActivity = jest.fn().mockImplementation(async (params) => {
        const result = await originalGenerate.call(aiService, params);
        result.id = 'duplicate-id'; // Force duplicate
        return result;
      });

      await expect(
        aiService.generateActivity({
          userId: testUser.id,
          subject: 'Mathematics',
          grade: 5,
          expectations: [expectation.id],
          activityType: 'practice',
        })
      ).rejects.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent activity generation', async () => {
      const expectations = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          factory.createCurriculumExpectation({
            code: `MATH.5.${i}`,
            description: `Math expectation ${i}`,
            subject: 'Mathematics',
            grade: 5,
          })
        )
      );

      // Generate 5 activities concurrently
      const results = await Promise.all(
        expectations.map(expectation =>
          aiService.generateActivity({
            userId: testUser.id,
            subject: 'Mathematics',
            grade: 5,
            expectations: [expectation.id],
            activityType: 'practice',
          })
        )
      );

      // All should succeed
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
      });

      // All should have unique IDs
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });
});