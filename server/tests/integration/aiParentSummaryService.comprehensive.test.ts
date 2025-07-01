import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import {
  AIParentSummaryService,
  ParentSummaryRequest,
} from '../../src/services/aiParentSummaryService';
import { openai } from '../../src/services/llmService';
import { PrismaClient } from '@prisma/client';

describe('AIParentSummaryService Comprehensive Integration Tests', () => {
  let service: AIParentSummaryService;
  let prisma: PrismaClient;
  let testUserId: number;
  let testStudentId: number;

  beforeEach(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./tests/test-ai-summary.db',
        },
      },
    });

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);

    // Clean up any existing test data
    await cleanupTestData();

    // Create test user and student
    const user = await prisma.user.create({
      data: {
        email: 'test-comprehensive@example.com',
        firstName: 'Test',
        lastName: 'Teacher',
        role: 'TEACHER',
      },
    });
    testUserId = user.id;

    const student = await prisma.student.create({
      data: {
        firstName: 'Sophie',
        lastName: 'Martin',
        grade: 2,
        userId: testUserId,
      },
    });
    testStudentId = student.id;

    service = new AIParentSummaryService();
  });

  afterEach(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    // Clean up in proper order due to foreign key constraints
    await prisma.daybookOutcome.deleteMany({
      where: { daybook: { userId: testUserId } },
    });
    await prisma.studentReflection.deleteMany({
      where: { student: { userId: testUserId } },
    });
    await prisma.studentGoal.deleteMany({
      where: { student: { userId: testUserId } },
    });
    await prisma.daybookEntry.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.curriculumExpectation.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.student.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-comprehensive' } },
    });
  }

  // Helper function to check if real API key is available
  const hasRealAPIKey = () => {
    return (
      !!process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'test-api-key' &&
      process.env.OPENAI_API_KEY.length > 10
    );
  };

  describe('Service Initialization and Configuration', () => {
    it('should initialize service correctly', () => {
      expect(service).toBeInstanceOf(AIParentSummaryService);
      expect(service.isAIServiceAvailable).toBeDefined();
      expect(service.generateParentSummary).toBeDefined();
    });

    it('should correctly detect AI service availability', () => {
      const isAvailable = service.isAIServiceAvailable();

      if (hasRealAPIKey()) {
        expect(isAvailable).toBe(true);
        expect(openai).toBeTruthy();
      } else {
        // In test environment, service might use mocks
        expect(typeof isAvailable).toBe('boolean');
      }
    });
  });

  describe('Real AI-Powered Summary Generation', () => {
    it('should generate comprehensive AI-powered parent summary', async () => {
      if (!hasRealAPIKey()) {
        console.log(
          '⏭️  Skipping AI summary test - OPENAI_API_KEY not configured for production use',
        );
        return;
      }

      // Create comprehensive test data
      await createRichLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        includeActivities: true,
        includeAssessments: true,
        includeGoals: true,
        includeReflections: true,
      };

      const result = await service.generateParentSummary(request);

      // Verify complete structure
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(result).toHaveProperty('metadata');

      // Verify AI-generated content quality
      expect(result.french.length).toBeGreaterThan(150);
      expect(result.english.length).toBeGreaterThan(150);

      // Should contain student name
      expect(result.french).toContain('Sophie Martin');
      expect(result.english).toContain('Sophie Martin');

      // Should contain subject-specific content from our test data
      const frenchLower = result.french.toLowerCase();
      const englishLower = result.english.toLowerCase();

      expect(
        frenchLower.includes('mathématiques') ||
          frenchLower.includes('math') ||
          frenchLower.includes('addition'),
      ).toBe(true);

      expect(
        englishLower.includes('mathematics') ||
          englishLower.includes('math') ||
          englishLower.includes('addition'),
      ).toBe(true);

      // Verify comprehensive metadata
      expect(result.metadata.activitiesCount).toBeGreaterThan(0);
      expect(result.metadata.goalsCount).toBeGreaterThan(1);
      expect(result.metadata.reflectionsCount).toBeGreaterThan(1);
      expect(result.metadata.periodDays).toBe(31);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);

      console.log(
        `📊 Generated summary - French: ${result.french.length} chars, English: ${result.english.length} chars`,
      );
    }, 90000);

    it('should handle specific focus areas in AI generation', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping focus areas test - OPENAI_API_KEY not configured');
        return;
      }

      await createRichLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        focus: ['Mathematics', 'Problem Solving', 'Independence'],
      };

      const result = await service.generateParentSummary(request);

      // Should emphasize the focus areas
      const combinedText = `${result.french} ${result.english}`.toLowerCase();
      expect(
        combinedText.includes('mathématiques') ||
          combinedText.includes('mathematics') ||
          combinedText.includes('math'),
      ).toBe(true);

      expect(
        combinedText.includes('problem') ||
          combinedText.includes('problème') ||
          combinedText.includes('résolution'),
      ).toBe(true);

      expect(
        combinedText.includes('independence') ||
          combinedText.includes('indépendance') ||
          combinedText.includes('autonomie'),
      ).toBe(true);

      // Verify metadata includes focus areas
      expect(result.metadata.focusAreas).toEqual([
        'Mathematics',
        'Problem Solving',
        'Independence',
      ]);
    }, 90000);

    it('should generate meaningful content even with minimal data', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping minimal data test - OPENAI_API_KEY not configured');
        return;
      }

      // Create only minimal test data
      await prisma.studentGoal.create({
        data: {
          description: 'Practice reading daily',
          studentId: testStudentId,
          createdAt: new Date('2024-01-10'),
        },
      });

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Should still generate meaningful content
      expect(result.french.length).toBeGreaterThan(100);
      expect(result.english.length).toBeGreaterThan(100);
      expect(result.french).toContain('Sophie Martin');
      expect(result.english).toContain('Sophie Martin');

      // Should mention the reading goal
      const combinedText = `${result.french} ${result.english}`.toLowerCase();
      expect(
        combinedText.includes('reading') ||
          combinedText.includes('lecture') ||
          combinedText.includes('practice'),
      ).toBe(true);

      // Metadata should reflect minimal data
      expect(result.metadata.activitiesCount).toBe(0);
      expect(result.metadata.goalsCount).toBe(1);
      expect(result.metadata.reflectionsCount).toBe(0);
    }, 60000);

    it('should maintain educational tone and appropriateness', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping educational tone test - OPENAI_API_KEY not configured');
        return;
      }

      await createRichLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Should use positive, educational language
      const positiveEnglishWords = [
        'progress',
        'growth',
        'development',
        'learning',
        'skills',
        'understanding',
        'improvement',
      ];
      const positiveFrenchWords = [
        'progrès',
        'développement',
        'apprentissage',
        'compétences',
        'compréhension',
        'amélioration',
      ];

      const englishText = result.english.toLowerCase();
      const frenchText = result.french.toLowerCase();

      const hasPositiveEnglish = positiveEnglishWords.some((word) => englishText.includes(word));
      const hasPositiveFrench = positiveFrenchWords.some((word) => frenchText.includes(word));

      expect(hasPositiveEnglish || hasPositiveFrench).toBe(true);

      // Should be appropriate for parent communication
      expect(result.english).not.toMatch(/\b(bad|terrible|awful|horrible)\b/i);
      expect(result.french).not.toMatch(/\b(mauvais|terrible|affreux|horrible)\b/i);
    }, 90000);

    it('should handle different time periods effectively', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping time period test - OPENAI_API_KEY not configured');
        return;
      }

      // Create data across different time periods
      await createTimeBasedLearningData();

      // Test short period
      const shortRequest: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-07'), // 1 week
        userId: testUserId,
      };

      const shortResult = await service.generateParentSummary(shortRequest);

      // Test longer period
      const longRequest: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'), // 1 month
        userId: testUserId,
      };

      const longResult = await service.generateParentSummary(longRequest);

      // Both should be meaningful but different in scope
      expect(shortResult.metadata.periodDays).toBe(7);
      expect(longResult.metadata.periodDays).toBe(31);

      expect(shortResult.french.length).toBeGreaterThan(50);
      expect(longResult.french.length).toBeGreaterThan(50);

      // Longer period should generally have more content
      expect(longResult.metadata.activitiesCount).toBeGreaterThanOrEqual(
        shortResult.metadata.activitiesCount,
      );
    }, 120000);
  });

  describe('AI vs Rule-Based Generation Comparison', () => {
    it('should fall back to rule-based generation when AI fails', async () => {
      // Test with invalid API key to force fallback
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'invalid-key-for-testing';

      try {
        await createRichLearningData();

        const request: ParentSummaryRequest = {
          studentId: testStudentId,
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
          userId: testUserId,
        };

        const result = await service.generateParentSummary(request);

        // Should still generate content (rule-based fallback)
        expect(result).toHaveProperty('french');
        expect(result).toHaveProperty('english');
        expect(result).toHaveProperty('metadata');
        expect(result.french.length).toBeGreaterThan(0);
        expect(result.english.length).toBeGreaterThan(0);
        expect(result.french).toContain('Sophie Martin');
        expect(result.english).toContain('Sophie Martin');
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        } else {
          delete process.env.OPENAI_API_KEY;
        }
      }
    }, 45000);

    it('should compare AI vs rule-based generation quality', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping AI vs rule-based comparison - OPENAI_API_KEY not configured');
        return;
      }

      await createRichLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      // Generate AI-powered summary
      const aiResult = await service.generateParentSummary(request);

      // Force rule-based generation by temporarily disabling AI
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        const ruleBasedResult = await service.generateParentSummary(request);

        // Both should work but AI should generally be more detailed
        expect(aiResult.french.length).toBeGreaterThan(0);
        expect(ruleBasedResult.french.length).toBeGreaterThan(0);

        // AI content is typically more varied and detailed
        expect(aiResult.french.length).toBeGreaterThanOrEqual(ruleBasedResult.french.length * 0.5);
        expect(aiResult.english.length).toBeGreaterThanOrEqual(
          ruleBasedResult.english.length * 0.5,
        );

        console.log(`📈 AI vs Rule-based comparison:`);
        console.log(`   AI French: ${aiResult.french.length} chars`);
        console.log(`   Rule-based French: ${ruleBasedResult.french.length} chars`);
        console.log(`   AI English: ${aiResult.english.length} chars`);
        console.log(`   Rule-based English: ${ruleBasedResult.english.length} chars`);
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
    }, 120000);
  });

  describe('Performance and Error Handling', () => {
    it('should handle API rate limiting gracefully', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping rate limiting test - OPENAI_API_KEY not configured');
        return;
      }

      await createRichLearningData();

      // Make multiple requests in rapid succession
      const requests = Array.from({ length: 3 }, () => ({
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      }));

      const startTime = Date.now();
      const results = await Promise.all(requests.map((req) => service.generateParentSummary(req)));
      const endTime = Date.now();

      // All should succeed
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.french.length).toBeGreaterThan(50);
        expect(result.english.length).toBeGreaterThan(50);
      });

      console.log(`⏱️  Multiple AI requests took ${endTime - startTime}ms`);
    }, 180000);

    it('should handle invalid student data gracefully', async () => {
      const request: ParentSummaryRequest = {
        studentId: 99999, // Non-existent student
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      await expect(service.generateParentSummary(request)).rejects.toThrow();
    });

    it('should handle invalid date ranges', async () => {
      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-31'), // Later date
        to: new Date('2024-01-01'), // Earlier date
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Should handle gracefully, possibly with empty or default content
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(result.metadata.periodDays).toBeLessThanOrEqual(0);
    });

    it('should validate user access to student data', async () => {
      const wrongUserId = testUserId + 1000;

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: wrongUserId, // Wrong user ID
      };

      await expect(service.generateParentSummary(request)).rejects.toThrow();
    });
  });

  describe('Content Inclusion Options', () => {
    it('should respect inclusion flags for different content types', async () => {
      await createRichLearningData();

      // Test with only activities
      const activitiesOnlyRequest: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        includeActivities: true,
        includeAssessments: false,
        includeGoals: false,
        includeReflections: false,
      };

      const activitiesResult = await service.generateParentSummary(activitiesOnlyRequest);

      expect(activitiesResult.metadata.activitiesCount).toBeGreaterThan(0);
      expect(activitiesResult.metadata.goalsCount).toBe(0);
      expect(activitiesResult.metadata.reflectionsCount).toBe(0);
      expect(activitiesResult.metadata.assessmentsCount).toBe(0);

      // Test with only goals and reflections
      const goalsReflectionsRequest: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        includeActivities: false,
        includeAssessments: false,
        includeGoals: true,
        includeReflections: true,
      };

      const goalsReflectionsResult = await service.generateParentSummary(goalsReflectionsRequest);

      expect(goalsReflectionsResult.metadata.activitiesCount).toBe(0);
      expect(goalsReflectionsResult.metadata.goalsCount).toBeGreaterThan(0);
      expect(goalsReflectionsResult.metadata.reflectionsCount).toBeGreaterThan(0);
      expect(goalsReflectionsResult.metadata.assessmentsCount).toBe(0);
    });
  });

  // Helper functions for creating test data
  async function createRichLearningData() {
    // Create curriculum expectations
    const mathExpectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'M2.N1',
        description: 'Add and subtract two-digit numbers',
        subject: 'Mathematics',
        grade: 2,
        strand: 'Number',
        userId: testUserId,
      },
    });

    const languageExpectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'L2.R1',
        description: 'Read simple texts with fluency',
        subject: 'Language',
        grade: 2,
        strand: 'Reading',
        userId: testUserId,
      },
    });

    // Create daybook entries with outcomes
    await prisma.daybookEntry.create({
      data: {
        title: 'Mental Math Strategies',
        date: new Date('2024-01-10'),
        subject: 'Mathematics',
        reflection:
          'Students practiced addition strategies. Sophie showed excellent progress with mental math.',
        userId: testUserId,
        outcomes: {
          create: [{ outcomeId: mathExpectation.id }],
        },
      },
    });

    await prisma.daybookEntry.create({
      data: {
        title: 'Guided Reading Session',
        date: new Date('2024-01-15'),
        subject: 'Language',
        reflection:
          'Reading comprehension improving. Sophie asked thoughtful questions about the story.',
        userId: testUserId,
        outcomes: {
          create: [{ outcomeId: languageExpectation.id }],
        },
      },
    });

    // Create student goals
    await prisma.studentGoal.create({
      data: {
        description: 'Master addition facts to 20',
        studentId: testStudentId,
        createdAt: new Date('2024-01-05'),
      },
    });

    await prisma.studentGoal.create({
      data: {
        description: 'Read independently for 15 minutes daily',
        studentId: testStudentId,
        createdAt: new Date('2024-01-08'),
      },
    });

    await prisma.studentGoal.create({
      data: {
        description: 'Improve problem-solving strategies',
        studentId: testStudentId,
        createdAt: new Date('2024-01-12'),
      },
    });

    // Create reflections
    await prisma.studentReflection.create({
      data: {
        content:
          'Sophie demonstrates strong conceptual understanding in mathematics. She can explain her thinking clearly.',
        studentId: testStudentId,
        date: new Date('2024-01-10'),
      },
    });

    await prisma.studentReflection.create({
      data: {
        content:
          'Reading fluency has improved significantly. Sophie enjoys chapter books and discusses characters thoughtfully.',
        studentId: testStudentId,
        date: new Date('2024-01-18'),
      },
    });

    await prisma.studentReflection.create({
      data: {
        content:
          'Works well independently and helps classmates when appropriate. Shows leadership qualities.',
        studentId: testStudentId,
        date: new Date('2024-01-25'),
      },
    });
  }

  async function createTimeBasedLearningData() {
    // Create goals across different dates
    await prisma.studentGoal.create({
      data: {
        description: 'Early January goal: Practice counting by 2s',
        studentId: testStudentId,
        createdAt: new Date('2024-01-02'),
      },
    });

    await prisma.studentGoal.create({
      data: {
        description: 'Mid January goal: Improve writing stamina',
        studentId: testStudentId,
        createdAt: new Date('2024-01-15'),
      },
    });

    await prisma.studentGoal.create({
      data: {
        description: 'Late January goal: Master sight words list 3',
        studentId: testStudentId,
        createdAt: new Date('2024-01-28'),
      },
    });

    // Create reflections across time
    await prisma.studentReflection.create({
      data: {
        content: 'Early progress in counting patterns.',
        studentId: testStudentId,
        date: new Date('2024-01-05'),
      },
    });

    await prisma.studentReflection.create({
      data: {
        content: 'Continued growth in mathematical thinking.',
        studentId: testStudentId,
        date: new Date('2024-01-20'),
      },
    });
  }
});
