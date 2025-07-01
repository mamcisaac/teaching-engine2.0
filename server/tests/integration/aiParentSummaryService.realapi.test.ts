import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import {
  AIParentSummaryService,
  ParentSummaryRequest,
} from '../../src/services/aiParentSummaryService';
import { openai } from '../../src/services/llmService';
import { PrismaClient } from '@prisma/client';

describe('AIParentSummaryService Real API Integration', () => {
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
        email: 'test-ai@example.com',
        firstName: 'Test',
        lastName: 'Teacher',
        role: 'TEACHER',
      },
    });
    testUserId = user.id;

    const student = await prisma.student.create({
      data: {
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: 3,
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
    await prisma.studentReflection.deleteMany({
      where: { student: { userId: testUserId } },
    });
    await prisma.studentGoal.deleteMany({
      where: { student: { userId: testUserId } },
    });
    await prisma.daybookEntry.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.student.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.deleteMany({
      where: { email: 'test-ai@example.com' },
    });
  }

  describe('AI Service Detection', () => {
    it('should correctly detect AI service availability', () => {
      const isAvailable = service.isAIServiceAvailable();

      if (process.env.OPENAI_API_KEY) {
        expect(isAvailable).toBe(true);
        expect(openai).toBeTruthy();
      } else {
        expect(isAvailable).toBe(false);
        expect(openai).toBeNull();
      }
    });
  });

  describe('Real AI-Powered Summary Generation', () => {
    it('should generate AI-powered parent summary with real data', async () => {
      // Skip if no API key configured
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping AI summary test - no OpenAI API key configured');
        return;
      }

      // Create test data
      await createTestLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Verify structure
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(result).toHaveProperty('metadata');

      // Verify content quality (AI-generated should be more detailed)
      expect(result.french.length).toBeGreaterThan(100);
      expect(result.english.length).toBeGreaterThan(100);

      // Should contain student name
      expect(result.french).toContain('Emma Johnson');
      expect(result.english).toContain('Emma Johnson');

      // Should contain subject-specific content
      expect(result.french.toLowerCase()).toMatch(/mathématiques|math|addition/);
      expect(result.english.toLowerCase()).toMatch(/mathematics|math|addition/);

      // Verify metadata
      expect(result.metadata.activitiesCount).toBeGreaterThan(0);
      expect(result.metadata.goalsCount).toBeGreaterThan(0);
      expect(result.metadata.reflectionsCount).toBeGreaterThan(0);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
    }, 60000); // Longer timeout for AI generation

    it('should handle empty data gracefully with AI', async () => {
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping AI empty data test - no OpenAI API key configured');
        return;
      }

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Should still generate meaningful content even with no data
      expect(result.french.length).toBeGreaterThan(50);
      expect(result.english.length).toBeGreaterThan(50);
      expect(result.french).toContain('Emma Johnson');
      expect(result.english).toContain('Emma Johnson');

      // Metadata should reflect empty state
      expect(result.metadata.activitiesCount).toBe(0);
      expect(result.metadata.goalsCount).toBe(0);
      expect(result.metadata.reflectionsCount).toBe(0);
    }, 45000);

    it('should generate bilingual content with proper structure', async () => {
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping bilingual test - no OpenAI API key configured');
        return;
      }

      await createTestLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        focus: ['Mathematics', 'Reading'],
      };

      const result = await service.generateParentSummary(request);

      // Verify both languages have substantive content
      expect(result.french.split(' ').length).toBeGreaterThan(20);
      expect(result.english.split(' ').length).toBeGreaterThan(20);

      // Verify focus areas are mentioned
      expect(result.french.toLowerCase()).toMatch(/mathématiques|lecture/);
      expect(result.english.toLowerCase()).toMatch(/mathematics|reading/);

      // Verify proper structure (should have paragraphs/sections)
      expect(result.french).toMatch(/\.\s+[A-Z]|\n/); // Multiple sentences or line breaks
      expect(result.english).toMatch(/\.\s+[A-Z]|\n/);

      // Verify metadata includes focus areas
      expect(result.metadata.focusAreas).toEqual(['Mathematics', 'Reading']);
    }, 60000);

    it('should handle API errors gracefully', async () => {
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping API error test - no OpenAI API key configured');
        return;
      }

      // Create a request that might stress the API
      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      // This should not throw, even if API has issues
      const result = await service.generateParentSummary(request);

      // Should fall back to rule-based generation if AI fails
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(result).toHaveProperty('metadata');
      expect(result.french.length).toBeGreaterThan(0);
      expect(result.english.length).toBeGreaterThan(0);
    }, 45000);
  });

  describe('AI Performance and Quality', () => {
    it('should generate personalized content based on student data', async () => {
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping personalization test - no OpenAI API key configured');
        return;
      }

      // Create specific learning data
      await prisma.studentGoal.create({
        data: {
          description: 'Master multiplication tables for numbers 1-5',
          studentId: testStudentId,
          createdAt: new Date('2024-01-10'),
        },
      });

      await prisma.studentReflection.create({
        data: {
          content: 'Emma showed excellent progress in understanding multiplication concepts today',
          studentId: testStudentId,
          date: new Date('2024-01-15'),
        },
      });

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Should mention specific concepts from the data
      const combinedText = `${result.french} ${result.english}`.toLowerCase();
      expect(combinedText).toMatch(/multiplication|times|multiply/);
      expect(combinedText).toMatch(/progress|excellent|understanding/);
    }, 60000);

    it('should maintain consistency between French and English versions', async () => {
      if (!service.isAIServiceAvailable()) {
        console.log('Skipping consistency test - no OpenAI API key configured');
        return;
      }

      await createTestLearningData();

      const request: ParentSummaryRequest = {
        studentId: testStudentId,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await service.generateParentSummary(request);

      // Both versions should mention the student name
      expect(result.french).toContain('Emma Johnson');
      expect(result.english).toContain('Emma Johnson');

      // Both should have similar structural complexity
      const frenchWords = result.french.split(' ').length;
      const englishWords = result.english.split(' ').length;
      const wordRatio = Math.max(frenchWords, englishWords) / Math.min(frenchWords, englishWords);
      expect(wordRatio).toBeLessThan(2); // Should be reasonably similar in length
    }, 60000);
  });

  async function createTestLearningData() {
    // Create curriculum expectations
    const mathExpectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'M3.N1',
        description: 'Add and subtract whole numbers to 1000',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Number',
        userId: testUserId,
      },
    });

    // Create daybook entry
    await prisma.daybookEntry.create({
      data: {
        title: 'Addition Practice with Manipulatives',
        date: new Date('2024-01-15'),
        subject: 'Mathematics',
        reflection:
          'Students engaged well with hands-on activities. Emma showed strong understanding.',
        userId: testUserId,
        outcomes: {
          create: [
            {
              outcomeId: mathExpectation.id,
            },
          ],
        },
      },
    });

    // Create student goals
    await prisma.studentGoal.create({
      data: {
        description: 'Improve mental math calculation speed',
        studentId: testStudentId,
        createdAt: new Date('2024-01-05'),
      },
    });

    await prisma.studentGoal.create({
      data: {
        description: 'Develop confidence in problem-solving strategies',
        studentId: testStudentId,
        createdAt: new Date('2024-01-12'),
      },
    });

    // Create reflections
    await prisma.studentReflection.create({
      data: {
        content: 'Great improvement in addition skills. More confident when working independently.',
        studentId: testStudentId,
        date: new Date('2024-01-10'),
      },
    });

    await prisma.studentReflection.create({
      data: {
        content: 'Still working on regrouping concepts. Benefits from visual aids.',
        studentId: testStudentId,
        date: new Date('2024-01-20'),
      },
    });
  }
});
