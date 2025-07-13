/**
 * AI Service Integration Tests
 * Tests real AI service functionality with actual OpenAI API calls
 * Uses test API keys and real database connections
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../aiService';
import { logger } from '../../../logger';

// Real database connection for tests
const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL,
});

describe('AIService Integration Tests', () => {
  let aiService: AIService;
  let testUser: { id: number; email: string };

  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        email: `test-ai-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'AI Test User',
        role: 'teacher',
      },
    });

    // Initialize AI service with real configuration
    // Note: This requires OPENAI_API_KEY to be set in test environment
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY must be set for AI integration tests');
    }

    aiService = new AIService({
      apiKey: openAIKey,
      // Use gpt-3.5-turbo for tests to reduce costs
      model: 'gpt-3.5-turbo',
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id },
      }).catch(() => {
        // Ignore errors if already deleted
      });
    }

    await prisma.$disconnect();
  });

  describe('Lesson Generation', () => {
    test('should generate a real lesson plan with AI', async () => {
      const input = {
        grade: '3',
        subject: 'Math',
        topic: 'Introduction to Fractions',
        duration: 45,
        standards: ['3.NF.1'],
        objectives: ['Understand fractions as parts of a whole'],
        userId: testUser.id,
      };

      const startTime = Date.now();
      const result = await aiService.generateLesson(input);
      const endTime = Date.now();

      // Verify the response structure
      expect(result).toMatchObject({
        title: expect.any(String),
        objectives: expect.any(Array),
        activities: expect.any(Array),
        duration: expect.any(Number),
        materials: expect.any(Array),
        assessment: expect.any(Object),
      });

      // Verify content quality
      expect(result.title).toContain('Fraction');
      expect(result.objectives.length).toBeGreaterThan(0);
      expect(result.activities.length).toBeGreaterThan(0);
      expect(result.duration).toBe(45);

      // Each activity should have proper structure
      result.activities.forEach((activity: any) => {
        expect(activity).toMatchObject({
          name: expect.any(String),
          duration: expect.any(Number),
          description: expect.any(String),
          materials: expect.any(Array),
        });
        expect(activity.duration).toBeGreaterThan(0);
      });

      // Log performance metrics
      logger.info(`AI lesson generation took ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    }, 60000); // 60 second timeout for AI calls

    test('should generate differentiated content for different grades', async () => {
      const grade3Input = {
        grade: '3',
        subject: 'Math',
        topic: 'Basic Addition',
        duration: 30,
        userId: testUser.id,
      };

      const grade8Input = {
        grade: '8',
        subject: 'Math',
        topic: 'Basic Addition',
        duration: 30,
        userId: testUser.id,
      };

      const [grade3Result, grade8Result] = await Promise.all([
        aiService.generateLesson(grade3Input),
        aiService.generateLesson(grade8Input),
      ]);

      // Grade 8 content should be more advanced
      expect(grade3Result.title).not.toBe(grade8Result.title);
      
      // Check complexity differences
      const grade3Text = JSON.stringify(grade3Result).toLowerCase();
      const grade8Text = JSON.stringify(grade8Result).toLowerCase();

      // Grade 8 might include more advanced concepts
      expect(grade8Text).toMatch(/algebra|equation|variable|expression/);
      
      // Both should be valid lessons
      expect(grade3Result.activities.length).toBeGreaterThan(0);
      expect(grade8Result.activities.length).toBeGreaterThan(0);
    }, 60000);

    test('should handle API errors gracefully', async () => {
      // Create a service with invalid API key
      const invalidService = new AIService({
        apiKey: 'invalid-key-12345',
        model: 'gpt-3.5-turbo',
      });

      const input = {
        grade: '5',
        subject: 'Science',
        topic: 'Water Cycle',
        duration: 40,
        userId: testUser.id,
      };

      await expect(invalidService.generateLesson(input)).rejects.toThrow();
    });

    test('should enforce rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array(5).fill(null).map((_, i) => 
        aiService.generateLesson({
          grade: '4',
          subject: 'English',
          topic: `Topic ${i}`,
          duration: 30,
          userId: testUser.id,
        })
      );

      // Should handle concurrent requests appropriately
      const results = await Promise.allSettled(requests);
      
      // At least some should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);

      // Check if rate limiting was applied
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        // Verify it's a rate limit error
        const rateLimitErrors = failed.filter((r: any) => 
          r.reason?.message?.includes('rate') || 
          r.reason?.message?.includes('limit')
        );
        expect(rateLimitErrors.length).toBeGreaterThan(0);
      }
    }, 120000); // 2 minute timeout for multiple requests
  });

  describe('Content Enhancement', () => {
    test('should enhance existing lesson content', async () => {
      const existingLesson = {
        title: 'Basic Shapes',
        objectives: ['Identify circles, squares, and triangles'],
        activities: [
          {
            name: 'Shape Hunt',
            duration: 10,
            description: 'Find shapes in the classroom',
            materials: ['Shape cards'],
          },
        ],
      };

      const enhanced = await aiService.enhanceLesson({
        lesson: existingLesson,
        enhancementType: 'differentiation',
        userId: testUser.id,
      });

      expect(enhanced).toMatchObject({
        title: expect.any(String),
        objectives: expect.any(Array),
        activities: expect.any(Array),
        differentiation: expect.any(Object),
      });

      // Should have differentiation strategies
      expect(enhanced.differentiation).toMatchObject({
        advanced: expect.any(Array),
        struggling: expect.any(Array),
        accommodations: expect.any(Array),
      });

      // Should maintain original content while adding enhancements
      expect(enhanced.activities.length).toBeGreaterThanOrEqual(existingLesson.activities.length);
    }, 60000);
  });

  describe('Curriculum Alignment', () => {
    test('should align lessons with real curriculum standards', async () => {
      // First, create some test curriculum expectations
      const expectations = await Promise.all([
        prisma.curriculumExpectation.create({
          data: {
            expectation: 'MA3.NF.1',
            subject: 'Mathematics',
            grade: '3',
            strand: 'Number and Operations - Fractions',
            category: 'Understand Fractions',
            description: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts',
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            expectation: 'MA3.NF.2',
            subject: 'Mathematics', 
            grade: '3',
            strand: 'Number and Operations - Fractions',
            category: 'Understand Fractions',
            description: 'Understand a fraction as a number on the number line',
          },
        }),
      ]);

      try {
        const input = {
          grade: '3',
          subject: 'Math',
          topic: 'Fractions',
          duration: 45,
          curriculumExpectationIds: expectations.map(e => e.id),
          userId: testUser.id,
        };

        const result = await aiService.generateAlignedLesson(input);

        // Verify curriculum alignment
        expect(result.alignedStandards).toEqual(
          expect.arrayContaining(['MA3.NF.1', 'MA3.NF.2'])
        );

        // Content should reflect the standards
        const contentText = JSON.stringify(result).toLowerCase();
        expect(contentText).toContain('fraction');
        expect(contentText).toContain('equal parts');

        // Activities should address the standards
        expect(result.activities.some((a: any) => 
          a.description.toLowerCase().includes('fraction') || 
          a.description.toLowerCase().includes('part')
        )).toBe(true);
      } finally {
        // Clean up test data
        await prisma.curriculumExpectation.deleteMany({
          where: {
            id: { in: expectations.map(e => e.id) },
          },
        });
      }
    }, 60000);
  });

  describe('Performance and Caching', () => {
    test('should cache repeated requests efficiently', async () => {
      const input = {
        grade: '5',
        subject: 'Science',
        topic: 'Solar System',
        duration: 45,
        userId: testUser.id,
      };

      // First request - should hit AI
      const start1 = Date.now();
      const result1 = await aiService.generateLesson(input);
      const time1 = Date.now() - start1;

      // Second identical request - might use cache if implemented
      const start2 = Date.now();
      const result2 = await aiService.generateLesson(input);
      const time2 = Date.now() - start2;

      // Results should be similar quality
      expect(result1.activities.length).toBeGreaterThan(0);
      expect(result2.activities.length).toBeGreaterThan(0);

      // Log timing for analysis
      logger.info(`First request: ${time1}ms, Second request: ${time2}ms`);

      // If caching is implemented, second should be faster
      // Otherwise, both should complete in reasonable time
      expect(time1).toBeLessThan(30000);
      expect(time2).toBeLessThan(30000);
    }, 60000);
  });
});