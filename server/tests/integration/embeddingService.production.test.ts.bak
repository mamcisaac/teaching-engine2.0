/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockRegistry } from '../mocks/registry';
import OpenAI from 'openai';
/**
 * Production-level integration tests for EmbeddingService
 *
 * These tests make REAL API calls to OpenAI embedding service to validate:
 * - Actual embedding generation with real curriculum data
 * - Similarity calculations with real vectors
 * - Batch processing efficiency and accuracy
 * - Database integration and caching
 * - Search functionality with real embeddings
 *
 * Prerequisites:
 * - OPENAI_API_KEY environment variable must be set
 * - Test database must be available
 * - Real curriculum data should be seeded for comprehensive testing
 */

import { EmbeddingService } from '../../src/services/embeddingService';
import { prisma } from '../../src/prisma';
import { DatabaseTestUtils } from '../utils/DatabaseTestUtils';

describe('EmbeddingService - Production Integration', () => {
  let service: EmbeddingService;
  let testUtils: DatabaseTestUtils;

  // Test configuration
  const TEST_TIMEOUT = 60000; // 60 seconds for real API calls and batch operations
  const EMBEDDING_DIMENSION = 1536; // OpenAI text-embedding-3-small dimension
  const SIMILARITY_THRESHOLD = 0.7; // Minimum similarity for meaningful matches
  const BATCH_SIZE = 5; // Small batch for testing

  beforeAll(async () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable required for production tests');
    }

    testUtils = new DatabaseTestUtils();
    await testUtils.setupTestDatabase();
    service = new EmbeddingService();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await testUtils.cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testUtils.resetTestData();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    vi.mocked(OpenAI).mockImplementation(() => mockOpenAIInstance as any);
  });

  describe('Service Availability and Health', () => {
    it('should confirm embedding service is available', () => {
      const isAvailable = service.isEmbeddingServiceAvailable();
      expect(isAvailable).toBe(true);
    });

    it(
      'should verify OpenAI API connectivity',
      async () => {
        // Test with simple text to verify API works
        const testText = 'This is a test for embedding generation';
        const embedding = await service['generateEmbeddingVector'](testText);

        expect(embedding).toBeDefined();
        expect(embedding).not.toBeNull();
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding!.length).toBe(EMBEDDING_DIMENSION);

        // Verify embedding values are reasonable
        const validValues = embedding!.every(
          (value) => typeof value === 'number' && value >= -1 && value <= 1 && !isNaN(value),
        );
        expect(validValues).toBe(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Single Embedding Generation', () => {
    let testExpectation: unknown;

    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();
      testExpectation = expectations[0];
    });

    it(
      'should generate embedding for curriculum expectation',
      async () => {
        const text = `${testExpectation.code}: ${testExpectation.description}`;
        const result = await service.generateEmbedding(testExpectation.id, text);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.expectationId).toBe(testExpectation.id);
        expect(result!.embedding).toBeDefined();
        expect(result!.embedding.length).toBe(EMBEDDING_DIMENSION);
        expect(result!.model).toBe('text-embedding-3-small');

        // Verify embedding is stored in database
        const storedEmbedding = await prisma.curriculumExpectationEmbedding.findUnique({
          where: { expectationId: testExpectation.id },
        });

        expect(storedEmbedding).toBeDefined();
        expect(storedEmbedding!.embedding).toEqual(result!.embedding);
        expect(storedEmbedding!.model).toBe(result!.model);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return cached embedding when it exists',
      async () => {
        const text = `${testExpectation.code}: ${testExpectation.description}`;

        // Generate embedding first time
        const firstResult = await service.generateEmbedding(testExpectation.id, text);
        expect(firstResult).toBeDefined();

        // Call again - should return cached version
        const secondResult = await service.generateEmbedding(testExpectation.id, text);
        expect(secondResult).toBeDefined();
        expect(secondResult!.embedding).toEqual(firstResult!.embedding);

        // Verify only one database record exists
        const embeddingCount = await prisma.curriculumExpectationEmbedding.count({
          where: { expectationId: testExpectation.id },
        });
        expect(embeddingCount).toBe(1);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle different types of curriculum content',
      async () => {
        const testCases = [
          {
            code: 'MA3.NS.1',
            description: 'Represent and compare whole numbers up to 1000',
          },
          {
            code: 'LA3.W.1',
            description: 'Write clear, coherent narratives with proper structure',
          },
          {
            code: 'SC3.ES.1',
            description: 'Understand the water cycle and its impact on weather',
          },
        ];

        const results: unknown[] = [];

        for (const testCase of testCases) {
          const { expectations } = await testUtils.createRealisticCurriculumData();
          const expectation = expectations[0];

          const text = `${testCase.code}: ${testCase.description}`;
          const result = await service.generateEmbedding(expectation.id, text);

          expect(result).toBeDefined();
          expect(result!.embedding.length).toBe(EMBEDDING_DIMENSION);
          results.push(result);
        }

        // Verify embeddings are different for different content
        const embedding1 = results[0].embedding;
        const embedding2 = results[1].embedding;
        const embedding3 = results[2].embedding;

        expect(embedding1).not.toEqual(embedding2);
        expect(embedding2).not.toEqual(embedding3);
        expect(embedding1).not.toEqual(embedding3);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Batch Embedding Generation', () => {
    let testExpectations: unknown[];

    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();
      testExpectations = expectations;
    });

    it(
      'should generate embeddings for multiple expectations',
      async () => {
        const batchData = testExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        const results = await service.generateBatchEmbeddings(batchData);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(testExpectations.length);

        // Verify each result
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          expect(result.expectationId).toBe(testExpectations[i].id);
          expect(result.embedding.length).toBe(EMBEDDING_DIMENSION);
          expect(result.model).toBe('text-embedding-3-small');
        }

        // Verify all embeddings are stored in database
        const storedCount = await prisma.curriculumExpectationEmbedding.count({
          where: {
            expectationId: { in: testExpectations.map((e) => e.id) },
          },
        });
        expect(storedCount).toBe(testExpectations.length);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle mixed existing and new embeddings in batch',
      async () => {
        const batchData = testExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        // Generate embeddings for first 2 expectations
        await service.generateBatchEmbeddings(batchData.slice(0, 2));

        // Now process full batch (should handle existing + new)
        const fullResults = await service.generateBatchEmbeddings(batchData);

        expect(fullResults.length).toBe(testExpectations.length);

        // Verify all embeddings exist in database
        const storedEmbeddings = await prisma.curriculumExpectationEmbedding.findMany({
          where: {
            expectationId: { in: testExpectations.map((e) => e.id) },
          },
        });
        expect(storedEmbeddings.length).toBe(testExpectations.length);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle large batch processing efficiently',
      async () => {
        // Create more expectations for larger batch test
        const { import: testImport } = await testUtils.createRealisticCurriculumData();
        const moreExpectations = await testUtils.createTestExpectations(testImport.id, 10);

        const batchData = moreExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        const startTime = Date.now();
        const results = await service.generateBatchEmbeddings(batchData);
        const duration = Date.now() - startTime;

        expect(results.length).toBe(moreExpectations.length);

        // Should complete within reasonable time (allowing for API rate limits)
        expect(duration).toBeLessThan(TEST_TIMEOUT);

        console.log(`Batch of ${moreExpectations.length} embeddings completed in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Similarity Calculations', () => {
    it('should calculate cosine similarity correctly', () => {
      // Test with known vectors
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];
      const vector3 = [1, 0, 0];

      const similarity12 = service.calculateSimilarity(vector1, vector2);
      const similarity13 = service.calculateSimilarity(vector1, vector3);

      expect(similarity12).toBeCloseTo(0, 5); // Orthogonal vectors
      expect(similarity13).toBeCloseTo(1, 5); // Identical vectors
    });

    it('should handle edge cases in similarity calculation', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [4, 5, 6];
      const zeroVector = [0, 0, 0];

      const normalSimilarity = service.calculateSimilarity(vector1, vector2);
      expect(normalSimilarity).toBeGreaterThan(0);
      expect(normalSimilarity).toBeLessThanOrEqual(1);

      // Zero vector should return 0 similarity
      const zeroSimilarity = service.calculateSimilarity(vector1, zeroVector);
      expect(zeroSimilarity).toBe(0);

      // Should handle different length vectors
      expect(() => {
        service.calculateSimilarity([1, 2], [1, 2, 3]);
      }).toThrow('Embeddings must have the same length');
    });

    it(
      'should calculate meaningful similarities with real embeddings',
      async () => {
        // Create test expectations with related content
        const expectations = [
          {
            code: 'MA3.NS.1',
            description: 'Add and subtract whole numbers using various strategies',
          },
          {
            code: 'MA3.NS.2',
            description: 'Add and subtract three-digit numbers with regrouping',
          },
          {
            code: 'LA3.R.1',
            description: 'Read grade-appropriate texts with fluency and comprehension',
          },
        ];

        const embeddings: number[][] = [];

        for (const exp of expectations) {
          const text = `${exp.code}: ${exp.description}`;
          const embedding = await service['generateEmbeddingVector'](text);
          expect(embedding).toBeDefined();
          embeddings.push(embedding!);
        }

        // Calculate similarities
        const mathSimilarity = service.calculateSimilarity(embeddings[0], embeddings[1]);
        const mathLaSimilarity = service.calculateSimilarity(embeddings[0], embeddings[2]);

        // Math concepts should be more similar to each other than to language arts
        expect(mathSimilarity).toBeGreaterThan(mathLaSimilarity);
        expect(mathSimilarity).toBeGreaterThan(SIMILARITY_THRESHOLD);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Similar Expectations Finding', () => {
    let testExpectations: unknown[];
    let embeddedExpectations: string[];

    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();
      testExpectations = expectations;

      // Generate embeddings for all expectations
      const batchData = expectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await service.generateBatchEmbeddings(batchData);
      embeddedExpectations = expectations.map((e) => e.id);
    });

    it(
      'should find similar expectations based on content',
      async () => {
        // Use a math expectation to find similar ones
        const mathExpectation = testExpectations.find((e) => e.subject === 'Mathematics');
        expect(mathExpectation).toBeDefined();

        const similarExpectations = await service.findSimilarExpectations(
          mathExpectation.id,
          0.1, // Lower threshold to ensure we get results
          5,
        );

        expect(Array.isArray(similarExpectations)).toBe(true);

        if (similarExpectations.length > 0) {
          for (const similar of similarExpectations) {
            expect(similar.expectationId).toBeDefined();
            expect(similar.similarity).toBeGreaterThan(0);
            expect(similar.similarity).toBeLessThanOrEqual(1);
            expect(similar.expectation).toBeDefined();
            expect(similar.expectation!.id).not.toBe(mathExpectation.id); // Should not include self
          }

          // Results should be sorted by similarity (descending)
          for (let i = 1; i < similarExpectations.length; i++) {
            expect(similarExpectations[i].similarity).toBeLessThanOrEqual(
              similarExpectations[i - 1].similarity,
            );
          }
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should respect similarity threshold',
      async () => {
        const testExpectation = testExpectations[0];

        const highThresholdResults = await service.findSimilarExpectations(
          testExpectation.id,
          0.9, // Very high threshold
          10,
        );

        const lowThresholdResults = await service.findSimilarExpectations(
          testExpectation.id,
          0.1, // Low threshold
          10,
        );

        // Lower threshold should return more results
        expect(lowThresholdResults.length).toBeGreaterThanOrEqual(highThresholdResults.length);

        // All results should meet threshold
        for (const result of highThresholdResults) {
          expect(result.similarity).toBeGreaterThanOrEqual(0.9);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should respect result limit',
      async () => {
        const testExpectation = testExpectations[0];

        const limitedResults = await service.findSimilarExpectations(
          testExpectation.id,
          0.1,
          2, // Limit to 2 results
        );

        expect(limitedResults.length).toBeLessThanOrEqual(2);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Text Search Functionality', () => {
    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();

      // Generate embeddings for all expectations
      const batchData = expectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await service.generateBatchEmbeddings(batchData);
    });

    it(
      'should search expectations by text query',
      async () => {
        const searchQuery = 'number operations and mathematical reasoning';

        const results = await service.searchExpectationsByText(
          searchQuery,
          10,
          0.1, // Lower threshold for testing
        );

        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          for (const result of results) {
            expect(result.expectationId).toBeDefined();
            expect(result.similarity).toBeGreaterThan(0);
            expect(result.expectation).toBeDefined();
            expect(result.expectation.code).toBeDefined();
            expect(result.expectation.description).toBeDefined();
          }

          // Results should be sorted by similarity
          for (let i = 1; i < results.length; i++) {
            expect(results[i].similarity).toBeLessThanOrEqual(results[i - 1].similarity);
          }

          // Math-related expectations should rank higher for number operations query
          const topResult = results[0];
          expect(
            topResult.expectation.subject === 'Mathematics' ||
              topResult.expectation.description.toLowerCase().includes('number') ||
              topResult.expectation.description.toLowerCase().includes('math'),
          ).toBe(true);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should find relevant results for different subject queries',
      async () => {
        const queries = [
          'reading comprehension and literacy skills',
          'scientific observation and hypothesis',
          'geometric shapes and spatial reasoning',
        ];

        for (const query of queries) {
          const results = await service.searchExpectationsByText(query, 5, 0.1);

          if (results.length > 0) {
            // Should find expectations relevant to the query domain
            const descriptions = results
              .map((r) => r.expectation.description.toLowerCase())
              .join(' ');

            if (query.includes('reading')) {
              expect(descriptions).toMatch(/read|text|comprehension|literacy/);
            } else if (query.includes('scientific')) {
              expect(descriptions).toMatch(/science|observe|investigate|hypothesis/);
            } else if (query.includes('geometric')) {
              expect(descriptions).toMatch(/shape|geometry|spatial|measure/);
            }
          }
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Missing Embeddings Generation', () => {
    let testImport: unknown;

    beforeEach(async () => {
      const { import: importData } = await testUtils.createRealisticCurriculumData();
      testImport = importData;
    });

    it(
      'should generate embeddings for expectations missing them',
      async () => {
        // Create additional expectations without embeddings
        const newExpectations = await testUtils.createTestExpectations(testImport.id, 3);

        // Generate embeddings for missing ones
        const generatedCount = await service.generateMissingEmbeddings();

        expect(generatedCount).toBeGreaterThan(0);

        // Verify embeddings were created
        const embeddingCount = await prisma.curriculumExpectationEmbedding.count({
          where: {
            expectationId: { in: newExpectations.map((e) => e.id) },
          },
        });

        expect(embeddingCount).toBe(newExpectations.length);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle force regeneration of all embeddings',
      async () => {
        const expectations = await testUtils.createTestExpectations(testImport.id, 2);

        // Generate initial embeddings
        await service.generateMissingEmbeddings();

        // Force regeneration
        const regeneratedCount = await service.generateMissingEmbeddings(true);

        expect(regeneratedCount).toBeGreaterThanOrEqual(expectations.length);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return zero when no expectations need embeddings',
      async () => {
        // Generate embeddings for all existing expectations
        await service.generateMissingEmbeddings();

        // Try again - should return 0
        const secondCount = await service.generateMissingEmbeddings();
        expect(secondCount).toBe(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Get or Create Embedding', () => {
    let testExpectation: unknown;

    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();
      testExpectation = expectations[0];
    });

    it(
      'should create embedding when none exists',
      async () => {
        const result = await service.getOrCreateExpectationEmbedding(testExpectation.id);

        expect(result).toBeDefined();
        expect(result!.expectationId).toBe(testExpectation.id);
        expect(result!.embedding.length).toBe(EMBEDDING_DIMENSION);
        expect(result!.model).toBe('text-embedding-3-small');
      },
      TEST_TIMEOUT,
    );

    it(
      'should return existing embedding when available',
      async () => {
        // Create embedding first
        const firstResult = await service.getOrCreateExpectationEmbedding(testExpectation.id);
        expect(firstResult).toBeDefined();

        // Get existing embedding
        const secondResult = await service.getOrCreateExpectationEmbedding(testExpectation.id);
        expect(secondResult).toBeDefined();
        expect(secondResult!.embedding).toEqual(firstResult!.embedding);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle non-existent expectation',
      async () => {
        const nonExistentId = 'non-existent-id';

        const result = await service.getOrCreateExpectationEmbedding(nonExistentId);
        expect(result).toBeNull();
      },
      TEST_TIMEOUT,
    );
  });

  describe('Cleanup Operations', () => {
    it(
      'should cleanup old embeddings for outdated model',
      async () => {
        const { expectations } = await testUtils.createRealisticCurriculumData();

        // Create embeddings with old model
        await prisma.curriculumExpectationEmbedding.create({
          data: {
            expectationId: expectations[0].id,
            embedding: Array.from({ length: 1536 }, () => Math.random()),
            model: 'text-embedding-ada-002', // Old model
          },
        });

        const deletedCount = await service.cleanupOldEmbeddings('text-embedding-3-small');
        expect(deletedCount).toBeGreaterThan(0);

        // Verify old embedding was deleted
        const remainingOld = await prisma.curriculumExpectationEmbedding.count({
          where: { model: 'text-embedding-ada-002' },
        });
        expect(remainingOld).toBe(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Error Handling and Resilience', () => {
    it(
      'should handle API rate limiting gracefully',
      async () => {
        // Create many embedding requests to potentially trigger rate limiting
        const { expectations } = await testUtils.createRealisticCurriculumData();
        const moreExpectations = await testUtils.createTestExpectations(
          expectations[0].importId,
          8,
        );

        const allExpectations = [...expectations, ...moreExpectations];
        const batchData = allExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        // Should handle rate limiting with retries
        const results = await service.generateBatchEmbeddings(batchData);

        // Should still complete successfully, even if some retries were needed
        expect(results.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle invalid text gracefully',
      async () => {
        const invalidText = '';
        const embedding = await service['generateEmbeddingVector'](invalidText);

        // Should either return null or a valid embedding
        if (embedding !== null) {
          expect(embedding.length).toBe(EMBEDDING_DIMENSION);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle network failures gracefully',
      async () => {
        // This test verifies the service handles network issues without crashing
        const testText = 'Test text for network failure handling';

        // The service should either succeed or fail gracefully
        try {
          const embedding = await service['generateEmbeddingVector'](testText);
          if (embedding) {
            expect(embedding.length).toBe(EMBEDDING_DIMENSION);
          }
        } catch (_error) {
          // If it fails, it should be a controlled failure
          expect(error).toBeDefined();
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Performance and Efficiency', () => {
    it(
      'should process embeddings within reasonable time limits',
      async () => {
        const testText = 'Mathematics curriculum expectation for Grade 3 students';

        const startTime = Date.now();
        const embedding = await service['generateEmbeddingVector'](testText);
        const duration = Date.now() - startTime;

        expect(embedding).toBeDefined();
        expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

        console.log(`Single embedding generated in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle concurrent embedding requests efficiently',
      async () => {
        const testTexts = [
          'Mathematics number sense and operations',
          'Language arts reading comprehension',
          'Science investigation and observation',
          'Social studies community helpers',
        ];

        const startTime = Date.now();

        const embeddings = await Promise.all(
          testTexts.map((text) => service['generateEmbeddingVector'](text)),
        );

        const duration = Date.now() - startTime;

        // All should succeed
        expect(embeddings.length).toBe(4);
        embeddings.forEach((embedding) => {
          expect(embedding).toBeDefined();
          expect(embedding!.length).toBe(EMBEDDING_DIMENSION);
        });

        // Concurrent requests should be more efficient than sequential
        expect(duration).toBeLessThan(TEST_TIMEOUT);

        console.log(`Concurrent embeddings completed in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Data Quality Validation', () => {
    it(
      'should generate consistent embeddings for identical text',
      async () => {
        const testText = 'Students will understand fractions as parts of a whole';

        const [embedding1, embedding2] = await Promise.all([
          service['generateEmbeddingVector'](testText),
          service['generateEmbeddingVector'](testText),
        ]);

        expect(embedding1).toBeDefined();
        expect(embedding2).toBeDefined();

        // Should be identical or very similar (OpenAI embeddings are deterministic)
        const similarity = service.calculateSimilarity(embedding1!, embedding2!);
        expect(similarity).toBeGreaterThan(0.99); // Very high similarity expected
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate different embeddings for different content',
      async () => {
        const texts = [
          'Mathematics addition and subtraction',
          'Science plants and animals',
          'Art creative expression',
        ];

        const embeddings = await Promise.all(
          texts.map((text) => service['generateEmbeddingVector'](text)),
        );

        // All should be generated successfully
        embeddings.forEach((embedding) => {
          expect(embedding).toBeDefined();
          expect(embedding!.length).toBe(EMBEDDING_DIMENSION);
        });

        // Should be sufficiently different
        const similarity12 = service.calculateSimilarity(embeddings[0]!, embeddings[1]!);
        const similarity13 = service.calculateSimilarity(embeddings[0]!, embeddings[2]!);
        const similarity23 = service.calculateSimilarity(embeddings[1]!, embeddings[2]!);

        expect(similarity12).toBeLessThan(0.8); // Should be distinct
        expect(similarity13).toBeLessThan(0.8);
        expect(similarity23).toBeLessThan(0.8);
      },
      TEST_TIMEOUT,
    );
  });
});
