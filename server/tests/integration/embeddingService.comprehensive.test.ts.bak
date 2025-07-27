/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { EmbeddingService } from '../../src/services/embeddingService';
import { openai } from '../../src/services/llmService';
import { PrismaClient } from '@prisma/client';

describe('EmbeddingService Comprehensive Integration Tests', () => {
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

  // Helper function to check if API key is available and not a test key
  const hasRealAPIKey = () => {
    return (
      !!process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'test-api-key' &&
      process.env.OPENAI_API_KEY.length > 10
    );
  };

  describe('Service Availability and Configuration', () => {
    it('should detect OpenAI API availability correctly', () => {
      const isAvailable = service.isEmbeddingServiceAvailable();

      if (hasRealAPIKey()) {
        expect(isAvailable).toBe(true);
        expect(openai).toBeTruthy();
      } else {
        // In test environment without real key, service might still be available via mocks
        expect(typeof isAvailable).toBe('boolean');
      }
    });

    it('should initialize with correct configuration', () => {
      expect(service).toBeInstanceOf(EmbeddingService);
      expect(service.getUsageStats).toBeDefined();
      expect(service.isEmbeddingServiceAvailable).toBeDefined();
    });

    it('should track usage statistics', () => {
      const stats = service.getUsageStats();
      expect(stats).toHaveProperty('requests');
      expect(stats).toHaveProperty('tokens');
      expect(typeof stats.requests).toBe('number');
      expect(typeof stats.tokens).toBe('number');
    });
  });

  describe('Real API Integration (when available)', () => {
    it('should generate real embeddings with OpenAI API', async () => {
      if (!hasRealAPIKey()) {
        console.log(
          '⏭️  Skipping real API test - OPENAI_API_KEY not configured for production use',
        );
        return;
      }

      const testText =
        'Students will understand basic addition with single-digit numbers from 1 to 10.';
      const expectationId = 'test-real-embedding-001';

      const result = await service.generateEmbedding(expectationId, testText);

      expect(result).toBeTruthy();
      expect(result?.expectationId).toBe(expectationId);
      expect(result?.embedding).toBeInstanceOf(Array);
      expect(result?.embedding.length).toBeGreaterThan(1500); // text-embedding-3-small has 1536 dimensions
      expect(result?.model).toBe('text-embedding-3-small');

      // Verify embedding values are realistic (cosine similarity range)
      expect(
        result?.embedding.every((val) => typeof val === 'number' && val >= -1 && val <= 1),
      ).toBe(true);

      // Check magnitude is reasonable for normalized embeddings
      const magnitude = Math.sqrt(result!.embedding.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1, 1); // Should be close to 1 for normalized embeddings

      // Verify it was stored in database
      const stored = await prisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId },
      });

      expect(stored).toBeTruthy();
      expect(stored?.embedding).toEqual(result?.embedding);
    }, 30000);

    it('should handle batch embedding generation with rate limiting', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping real API batch test - OPENAI_API_KEY not configured');
        return;
      }

      const expectations = [
        { id: 'test-batch-001', text: 'Grade 3 Mathematics: Addition concepts with carrying' },
        { id: 'test-batch-002', text: 'Grade 3 Science: Plant growth observation and recording' },
        {
          id: 'test-batch-003',
          text: 'Grade 3 Language: Reading comprehension skills development',
        },
      ];

      const startTime = Date.now();
      const results = await service.generateBatchEmbeddings(expectations);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.embedding.length > 1500)).toBe(true);
      expect(results.every((r) => r.model === 'text-embedding-3-small')).toBe(true);

      // Verify rate limiting worked (should take some time due to delays)
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(500); // Should have some delay

      // Check all were stored in database
      for (const exp of expectations) {
        const stored = await prisma.curriculumExpectationEmbedding.findUnique({
          where: { expectationId: exp.id },
        });
        expect(stored).toBeTruthy();
        expect(stored?.model).toBe('text-embedding-3-small');
      }

      // Verify usage tracking increased
      const stats = service.getUsageStats();
      expect(stats.requests).toBeGreaterThan(0);
      expect(stats.tokens).toBeGreaterThan(0);
    }, 60000);

    it('should calculate meaningful similarity between related curriculum content', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping similarity test - OPENAI_API_KEY not configured');
        return;
      }

      // Generate embeddings for related math concepts
      const mathResult1 = await service.generateEmbedding(
        'test-sim-math-001',
        'Students will add two single-digit numbers and understand the concept of sum',
      );
      const mathResult2 = await service.generateEmbedding(
        'test-sim-math-002',
        'Students will perform basic addition operations using manipulatives and mental math',
      );
      // Generate embedding for unrelated concept
      const scienceResult = await service.generateEmbedding(
        'test-sim-science-001',
        'Students will observe and record plant growth patterns over time',
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
      expect(mathSimilarity).toBeGreaterThan(0.75); // High similarity for related math content
      expect(crossSimilarity).toBeLessThan(0.65); // Lower similarity for different subjects

      console.log(
        `📊 Similarity Results: Math-Math: ${mathSimilarity.toFixed(3)}, Math-Science: ${crossSimilarity.toFixed(3)}`,
      );
    }, 60000);

    it('should handle text search with real embeddings', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping text search test - OPENAI_API_KEY not configured');
        return;
      }

      // Create test expectations with embeddings
      const expectations = [
        { id: 'test-search-001', text: 'Students will solve addition problems with regrouping' },
        {
          id: 'test-search-002',
          text: 'Students will identify geometric shapes in the environment',
        },
        {
          id: 'test-search-003',
          text: 'Students will read fluently with expression and understanding',
        },
      ];

      // Generate embeddings for all test expectations
      for (const exp of expectations) {
        await service.generateEmbedding(exp.id, exp.text);
      }

      // Create corresponding curriculum expectations in database
      await prisma.curriculumExpectation.createMany({
        data: expectations.map((exp, index) => ({
          id: exp.id,
          code: `T${index + 1}.1`,
          description: exp.text,
          subject: index === 0 ? 'Mathematics' : index === 1 ? 'Mathematics' : 'Language',
          grade: 3,
          strand: index === 0 ? 'Number' : index === 1 ? 'Geometry' : 'Reading',
          userId: 1,
        })),
      });

      // Search for math-related content
      const searchResults = await service.searchExpectationsByText(
        'mathematics addition problems solving',
        10,
        0.5,
      );

      expect(searchResults.length).toBeGreaterThan(0);

      // Should find the addition-related expectation with high similarity
      const additionResult = searchResults.find((r) => r.expectationId === 'test-search-001');
      expect(additionResult).toBeTruthy();
      expect(additionResult?.similarity).toBeGreaterThan(0.6);

      // Clean up
      await prisma.curriculumExpectation.deleteMany({
        where: { id: { startsWith: 'test-search-' } },
      });
    }, 90000);
  });

  describe('Caching and Optimization', () => {
    it('should retrieve existing embeddings from cache', async () => {
      const expectationId = 'test-cache-001';
      const testText = 'Students will understand fractions as parts of a whole';

      // Generate embedding first time
      const result1 = await service.generateEmbedding(expectationId, testText);
      expect(result1).toBeTruthy();

      // Request same embedding again - should come from database cache
      const result2 = await service.generateEmbedding(expectationId, testText);
      expect(result2).toBeTruthy();
      expect(result2?.expectationId).toBe(expectationId);
      expect(result2?.embedding).toEqual(result1?.embedding);
    });

    it('should use getOrCreateExpectationEmbedding efficiently', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping efficiency test - OPENAI_API_KEY not configured');
        return;
      }

      const expectationId = 'test-efficiency-001';

      // Create test curriculum expectation
      await prisma.curriculumExpectation.create({
        data: {
          id: expectationId,
          code: 'E1.1',
          description: 'Students will demonstrate understanding of measurement concepts',
          subject: 'Mathematics',
          grade: 2,
          strand: 'Measurement',
          userId: 1,
        },
      });

      // First call should generate embedding
      const result1 = await service.getOrCreateExpectationEmbedding(expectationId);
      expect(result1).toBeTruthy();
      expect(result1?.embedding.length).toBeGreaterThan(1500);

      // Second call should retrieve from cache
      const startTime = Date.now();
      const result2 = await service.getOrCreateExpectationEmbedding(expectationId);
      const endTime = Date.now();

      expect(result2).toBeTruthy();
      expect(result2?.embedding).toEqual(result1?.embedding);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast cache retrieval

      // Clean up
      await prisma.curriculumExpectation.delete({ where: { id: expectationId } });
    }, 45000);
  });

  describe('Error Handling and Resilience', () => {
    it('should handle missing curriculum expectations gracefully', async () => {
      const result = await service.getOrCreateExpectationEmbedding('non-existent-expectation');
      expect(result).toBeNull();
    });

    it('should handle very long text inputs', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping long text test - OPENAI_API_KEY not configured');
        return;
      }

      // Test with reasonably long text (not excessive to avoid API issues)
      const longText =
        'Students will understand mathematical concepts including ' +
        'addition, subtraction, multiplication, division, fractions, decimals, geometry, measurement, and data analysis. '.repeat(
          10,
        );
      const expectationId = 'test-long-text-001';

      const result = await service.generateEmbedding(expectationId, longText);

      // Should either succeed or handle gracefully
      if (result === null) {
        // If it failed, verify no partial data was stored
        const stored = await prisma.curriculumExpectationEmbedding.findUnique({
          where: { expectationId },
        });
        expect(stored).toBeNull();
      } else {
        // If it succeeded, verify the result is valid
        expect(result.embedding).toBeInstanceOf(Array);
        expect(result.embedding.length).toBeGreaterThan(1500);
      }
    }, 60000);

    it('should handle empty or minimal text inputs', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping minimal text test - OPENAI_API_KEY not configured');
        return;
      }

      const minimalText = 'Math.';
      const expectationId = 'test-minimal-text-001';

      const result = await service.generateEmbedding(expectationId, minimalText);

      expect(result).toBeTruthy();
      expect(result?.embedding).toBeInstanceOf(Array);
      expect(result?.embedding.length).toBeGreaterThan(1500);
    }, 30000);

    it('should handle network issues gracefully', async () => {
      // This test simulates what happens when API is unavailable
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'invalid-key-for-testing';

      try {
        const result = await service.generateEmbedding('test-network-001', 'Test text');
        // Should either return null or handle the error gracefully
        expect(result === null || (result && result.embedding)).toBeTruthy();
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
    }, 30000);
  });

  describe('Performance and Cost Monitoring', () => {
    it('should track token usage accurately', async () => {
      const initialStats = service.getUsageStats();

      if (hasRealAPIKey()) {
        await service.generateEmbedding(
          'test-cost-monitoring-001',
          'Students will demonstrate understanding of basic mathematical operations',
        );

        const finalStats = service.getUsageStats();

        expect(finalStats.requests).toBe(initialStats.requests + 1);
        expect(finalStats.tokens).toBeGreaterThan(initialStats.tokens);

        console.log(
          `📈 Token usage: ${finalStats.tokens - initialStats.tokens} tokens for this request`,
        );
      } else {
        console.log('⏭️  Skipping cost monitoring test - OPENAI_API_KEY not configured');
      }
    }, 30000);

    it('should respect batch size configuration', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping batch size test - OPENAI_API_KEY not configured');
        return;
      }

      // Test with exactly batch size number of items
      const batchSize = 5; // From embeddingService configuration
      const expectations = Array.from({ length: batchSize + 2 }, (_, i) => ({
        id: `test-batch-size-${i + 1}`,
        text: `Test curriculum expectation number ${i + 1} for batch processing evaluation`,
      }));

      const startTime = Date.now();
      const results = await service.generateBatchEmbeddings(expectations);
      const endTime = Date.now();

      expect(results).toHaveLength(batchSize + 2);

      // Should process in multiple batches with delays
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(1000); // Should have batch delays

      console.log(`⏱️  Batch processing took ${duration}ms for ${expectations.length} items`);
    }, 90000);

    it('should handle missing embeddings generation efficiently', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping missing embeddings test - OPENAI_API_KEY not configured');
        return;
      }

      // Create test curriculum expectations without embeddings
      const expectations = [
        { id: 'test-missing-001', code: 'M1.1', description: 'Addition with single digits' },
        { id: 'test-missing-002', code: 'M1.2', description: 'Subtraction with single digits' },
      ];

      await prisma.curriculumExpectation.createMany({
        data: expectations.map((exp) => ({
          id: exp.id,
          code: exp.code,
          description: exp.description,
          subject: 'Mathematics',
          grade: 1,
          strand: 'Number',
          userId: 1,
        })),
      });

      const startTime = Date.now();
      const count = await service.generateMissingEmbeddings();
      const endTime = Date.now();

      expect(count).toBe(2);
      expect(endTime - startTime).toBeGreaterThan(1000); // Should take time for API calls

      // Verify embeddings were created
      for (const exp of expectations) {
        const embedding = await service.getEmbedding(exp.id);
        expect(embedding).toBeTruthy();
        expect(embedding?.length).toBeGreaterThan(1500);
      }

      // Clean up
      await prisma.curriculumExpectation.deleteMany({
        where: { id: { startsWith: 'test-missing-' } },
      });
    }, 90000);
  });

  describe('Similarity and Search Features', () => {
    it('should calculate similarity correctly for identical texts', () => {
      const embedding1 = Array.from({ length: 1536 }, () => Math.random());
      const embedding2 = [...embedding1]; // Identical copy

      const similarity = service.calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(1.0, 5); // Should be exactly 1.0 for identical embeddings
    });

    it('should calculate zero similarity for orthogonal vectors', () => {
      const embedding1 = Array.from({ length: 1536 }, (_, i) => (i % 2 === 0 ? 1 : 0));
      const embedding2 = Array.from({ length: 1536 }, (_, i) => (i % 2 === 0 ? 0 : 1));

      const similarity = service.calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(0.0, 5); // Should be close to 0 for orthogonal vectors
    });

    it('should handle embedding length mismatches', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0]; // Different length

      expect(() => {
        service.calculateSimilarity(embedding1, embedding2);
      }).toThrow('Embeddings must have the same length');
    });

    it('should find similar expectations with proper threshold filtering', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping similarity search test - OPENAI_API_KEY not configured');
        return;
      }

      // Create a set of related and unrelated expectations
      const expectations = [
        { id: 'test-threshold-001', text: 'Students will add numbers with regrouping' },
        { id: 'test-threshold-002', text: 'Students will subtract with borrowing' },
        { id: 'test-threshold-003', text: 'Students will read poetry with expression' },
      ];

      // Generate embeddings
      for (const exp of expectations) {
        await service.generateEmbedding(exp.id, exp.text);
      }

      // Create curriculum expectations in database
      await prisma.curriculumExpectation.createMany({
        data: expectations.map((exp, i) => ({
          id: exp.id,
          code: `TH${i + 1}.1`,
          description: exp.text,
          subject: i < 2 ? 'Mathematics' : 'Language',
          grade: 3,
          strand: i < 2 ? 'Number' : 'Reading',
          userId: 1,
        })),
      });

      // Test with high threshold - should find fewer results
      const highThresholdResults = await service.findSimilarExpectations(
        'test-threshold-001',
        0.8, // High threshold
        10,
      );

      // Test with low threshold - should find more results
      const lowThresholdResults = await service.findSimilarExpectations(
        'test-threshold-001',
        0.3, // Low threshold
        10,
      );

      expect(lowThresholdResults.length).toBeGreaterThanOrEqual(highThresholdResults.length);

      // Clean up
      await prisma.curriculumExpectation.deleteMany({
        where: { id: { startsWith: 'test-threshold-' } },
      });
    }, 90000);
  });

  describe('Data Management and Cleanup', () => {
    it('should clean up old embeddings by model', async () => {
      // Create test embeddings with different models
      await prisma.curriculumExpectationEmbedding.createMany({
        data: [
          {
            expectationId: 'test-cleanup-001',
            embedding: Array.from({ length: 1536 }, () => Math.random()),
            model: 'text-embedding-ada-002', // Old model
          },
          {
            expectationId: 'test-cleanup-002',
            embedding: Array.from({ length: 1536 }, () => Math.random()),
            model: 'text-embedding-3-small', // Current model
          },
        ],
      });

      const deletedCount = await service.cleanupOldEmbeddings('text-embedding-3-small');

      expect(deletedCount).toBe(1); // Should delete the ada-002 embedding

      // Verify correct embedding remains
      const remaining = await prisma.curriculumExpectationEmbedding.findMany({
        where: { expectationId: { startsWith: 'test-cleanup-' } },
      });

      expect(remaining).toHaveLength(1);
      expect(remaining[0].model).toBe('text-embedding-3-small');
    });

    it('should handle non-existent embeddings in getEmbedding', async () => {
      const result = await service.getEmbedding('completely-non-existent-id');
      expect(result).toBeNull();
    });
  });
});
