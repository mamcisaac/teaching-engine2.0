import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';

// IMPORTANT: Import the actual services, not mocked versions
// This test is specifically for real API integration
const { EmbeddingService } = require('../../src/services/embeddingService');
const { openai } = require('../../src/services/llmService');
const { PrismaClient } = require('@prisma/client');

// Integration test with real OpenAI API
describe('EmbeddingService Real API Integration', () => {
  let service: EmbeddingService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./tests/test-embeddings.db',
        },
      },
    });

    // Clean up test data
    await prisma.curriculumExpectationEmbedding.deleteMany({
      where: {
        expectationId: {
          startsWith: 'test-',
        },
      },
    });

    service = new EmbeddingService();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.curriculumExpectationEmbedding.deleteMany({
      where: {
        expectationId: {
          startsWith: 'test-',
        },
      },
    });

    await prisma.$disconnect();
  });

  describe('Real API Connectivity', () => {
    it('should detect OpenAI API availability', () => {
      const isAvailable = service.isEmbeddingServiceAvailable();

      if (process.env.OPENAI_API_KEY) {
        expect(isAvailable).toBe(true);
        expect(openai).toBeTruthy();
      } else {
        expect(isAvailable).toBe(false);
      }
    });

    it('should generate real embeddings with OpenAI API', async () => {
      // Skip if no API key configured
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping real API test - no OpenAI API key configured');
        return;
      }

      const testText = 'Students will understand basic addition with single-digit numbers';
      const expectationId = 'test-real-embedding-001';

      const result = await service.generateEmbedding(expectationId, testText);

      expect(result).toBeTruthy();
      expect(result?.expectationId).toBe(expectationId);
      expect(result?.embedding).toBeInstanceOf(Array);
      expect(result?.embedding.length).toBeGreaterThan(0);
      expect(result?.model).toBe('text-embedding-3-small');

      // Verify embedding values are realistic
      expect(
        result?.embedding.every((val) => typeof val === 'number' && val >= -1 && val <= 1),
      ).toBe(true);

      // Verify it was stored in database
      const stored = await prisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId },
      });

      expect(stored).toBeTruthy();
      expect(stored?.embedding).toEqual(result?.embedding);
    }, 30000); // Increase timeout for API call

    it('should handle batch embedding generation with rate limiting', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping real API batch test - no OpenAI API key configured');
        return;
      }

      const expectations = [
        { id: 'test-batch-001', text: 'Mathematics: Addition concepts' },
        { id: 'test-batch-002', text: 'Science: Plant growth observation' },
        { id: 'test-batch-003', text: 'Language: Reading comprehension skills' },
      ];

      const startTime = Date.now();
      const results = await service.generateBatchEmbeddings(expectations);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.embedding.length > 0)).toBe(true);

      // Verify rate limiting worked (should take at least some time)
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(1000); // At least 1 second for rate limiting

      // Check all were stored in database
      for (const exp of expectations) {
        const stored = await prisma.curriculumExpectationEmbedding.findUnique({
          where: { expectationId: exp.id },
        });
        expect(stored).toBeTruthy();
      }

      // Verify usage tracking
      const stats = service.getUsageStats();
      expect(stats.requests).toBeGreaterThan(0);
      expect(stats.tokens).toBeGreaterThan(0);
    }, 45000); // Longer timeout for batch operations

    it('should calculate meaningful similarity between related texts', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping similarity test - no OpenAI API key configured');
        return;
      }

      // Generate embeddings for related and unrelated texts
      const mathResult1 = await service.generateEmbedding(
        'test-sim-math-001',
        'Students will add two single-digit numbers',
      );
      const mathResult2 = await service.generateEmbedding(
        'test-sim-math-002',
        'Students will perform basic addition operations',
      );
      const scienceResult = await service.generateEmbedding(
        'test-sim-science-001',
        'Students will observe plant growth patterns',
      );

      expect(mathResult1?.embedding).toBeTruthy();
      expect(mathResult2?.embedding).toBeTruthy();
      expect(scienceResult?.embedding).toBeTruthy();

      // Calculate similarities
      const mathSimilarity = service.calculateSimilarity(
        mathResult1!.embedding,
        mathResult2!.embedding,
      );
      const crossSimilarity = service.calculateSimilarity(
        mathResult1!.embedding,
        scienceResult!.embedding,
      );

      // Math concepts should be more similar to each other than to science
      expect(mathSimilarity).toBeGreaterThan(crossSimilarity);
      expect(mathSimilarity).toBeGreaterThan(0.7); // High similarity for related content
      expect(crossSimilarity).toBeLessThan(0.7); // Lower similarity for unrelated content
    }, 45000);

    it('should handle API errors gracefully with retries', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping error handling test - no OpenAI API key configured');
        return;
      }

      // Test with extremely long text that might cause issues
      const veryLongText = 'Students will learn about mathematics. '.repeat(1000);
      const expectationId = 'test-error-handling-001';

      const result = await service.generateEmbedding(expectationId, veryLongText);

      // Should either succeed or handle the error gracefully
      if (result === null) {
        // If it failed, verify no partial data was stored
        const stored = await prisma.curriculumExpectationEmbedding.findUnique({
          where: { expectationId },
        });
        expect(stored).toBeNull();
      } else {
        // If it succeeded, verify the result is valid
        expect(result.embedding).toBeInstanceOf(Array);
        expect(result.embedding.length).toBeGreaterThan(0);
      }
    }, 60000);

    it('should find similar expectations using real embeddings', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping similarity search test - no OpenAI API key configured');
        return;
      }

      // First create some test expectations with embeddings
      await service.generateEmbedding(
        'test-search-math-001',
        'Students will solve addition problems with single digits',
      );
      await service.generateEmbedding(
        'test-search-math-002',
        'Students will perform subtraction with two-digit numbers',
      );
      await service.generateEmbedding(
        'test-search-language-001',
        'Students will read simple sentences aloud',
      );

      // Create mock curriculum expectations in the database
      await prisma.curriculumExpectation.createMany({
        data: [
          {
            id: 'test-search-math-001',
            code: 'M1.N1',
            description: 'Students will solve addition problems with single digits',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Number',
            userId: 1,
          },
          {
            id: 'test-search-math-002',
            code: 'M1.N2',
            description: 'Students will perform subtraction with two-digit numbers',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Number',
            userId: 1,
          },
          {
            id: 'test-search-language-001',
            code: 'L1.R1',
            description: 'Students will read simple sentences aloud',
            subject: 'Language',
            grade: 1,
            strand: 'Reading',
            userId: 1,
          },
        ],
      });

      // Search for similar expectations
      const similar = await service.findSimilarExpectations(
        'test-search-math-001',
        0.5, // Lower threshold for test
        5,
      );

      expect(similar.length).toBeGreaterThan(0);

      // Should find the math subtraction expectation as most similar
      const mathExpectation = similar.find((s) => s.expectationId === 'test-search-math-002');
      expect(mathExpectation).toBeTruthy();
      expect(mathExpectation?.similarity).toBeGreaterThan(0.5);

      // Clean up test curriculum expectations
      await prisma.curriculumExpectation.deleteMany({
        where: {
          id: {
            startsWith: 'test-search-',
          },
        },
      });
    }, 60000);
  });

  describe('Cost and Performance Monitoring', () => {
    it('should track token usage accurately', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping cost monitoring test - no OpenAI API key configured');
        return;
      }

      const initialStats = service.getUsageStats();

      await service.generateEmbedding(
        'test-cost-monitoring-001',
        'Short test text for cost tracking',
      );

      const finalStats = service.getUsageStats();

      expect(finalStats.requests).toBe(initialStats.requests + 1);
      expect(finalStats.tokens).toBeGreaterThan(initialStats.tokens);
    }, 30000);

    it('should respect rate limiting configuration', async () => {
      if (!service.isEmbeddingServiceAvailable()) {
        console.log('Skipping rate limiting test - no OpenAI API key configured');
        return;
      }

      const expectations = Array.from({ length: 3 }, (_, i) => ({
        id: `test-rate-limit-${i + 1}`,
        text: `Test embedding text number ${i + 1}`,
      }));

      const startTime = Date.now();
      await service.generateBatchEmbeddings(expectations);
      const endTime = Date.now();

      // Should take at least the configured delay time between requests
      const expectedMinDuration = (expectations.length - 1) * 1000; // 1 second delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(expectedMinDuration * 0.8); // Allow some variance
    }, 45000);
  });
});
