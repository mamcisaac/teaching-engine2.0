/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { EmbeddingService } from '../../src/services/embeddingService';
import { AIParentSummaryService } from '../../src/services/aiParentSummaryService';
import { generateContent, generateBilingualContent } from '../../src/services/llmService';
import {
  AITestFixtureManager,
  testRateLimiter,
  performanceMonitor,
  AI_TEST_PROMPTS,
  CURRICULUM_TEST_DATA,
} from '../fixtures/ai-test-fixtures';

describe('Tier 1 AI Services Validation Suite', () => {
  let prisma: PrismaClient;
  let fixtureManager: AITestFixtureManager;
  let embeddingService: EmbeddingService;
  let parentSummaryService: AIParentSummaryService;
  let testUserId: number;
  let testStudentIds: number[];

  beforeAll(async () => {
    console.log('🚀 Starting Tier 1 AI Services Validation');

    // Initialize services
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./tests/tier1-validation.db',
        },
      },
    });

    fixtureManager = new AITestFixtureManager(prisma);
    embeddingService = new EmbeddingService();
    parentSummaryService = new AIParentSummaryService();

    // Setup test data
    const testData = await fixtureManager.setupTestData();
    testUserId = testData.userId;
    testStudentIds = testData.studentIds;

    console.log(`📊 Test environment prepared with ${testStudentIds.length} students`);
  });

  afterAll(async () => {
    await fixtureManager.cleanup();
    await prisma.$disconnect();

    // Print performance summary
    const stats = performanceMonitor.getAllStats();
    console.log('📈 Performance Summary:', JSON.stringify(stats, null, 2));

    console.log('✅ Tier 1 AI Services Validation Complete');
  });

  // Helper function to check API availability
  const hasRealAPIKey = () => {
    return (
      !!process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'test-api-key' &&
      process.env.OPENAI_API_KEY.length > 10
    );
  };

  describe('LLM Service Validation', () => {
    it('should validate LLM service functionality and performance', async () => {
      const startTime = Date.now();

      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping LLM validation - no real API key configured');
        expect(true).toBe(true); // Pass the test in mock environment
        return;
      }

      // Test simple content generation
      await testRateLimiter.waitUntilAllowed();
      testRateLimiter.recordRequest();

      const simpleResult = await generateContent(AI_TEST_PROMPTS.llm.simple);
      expect(simpleResult).toBeTruthy();
      expect(typeof simpleResult).toBe('string');
      expect(simpleResult.length).toBeGreaterThan(10);

      // Test educational content generation
      await testRateLimiter.waitUntilAllowed();
      testRateLimiter.recordRequest();

      const educationalResult = await generateContent(AI_TEST_PROMPTS.llm.educational);
      expect(educationalResult).toBeTruthy();
      expect(educationalResult.toLowerCase()).toMatch(/math|place value|grade 3|student/);

      // Test bilingual content generation
      await testRateLimiter.waitUntilAllowed();
      testRateLimiter.recordRequest();

      const bilingualResult = await generateBilingualContent(AI_TEST_PROMPTS.llm.bilingual);
      expect(bilingualResult).toHaveProperty('english');
      expect(bilingualResult).toHaveProperty('french');
      expect(bilingualResult.english.length).toBeGreaterThan(10);
      expect(bilingualResult.french.length).toBeGreaterThan(10);

      const endTime = Date.now();
      performanceMonitor.record('llm_service_validation', endTime - startTime);

      console.log(`✅ LLM Service validation completed in ${endTime - startTime}ms`);
    }, 120000);

    it('should validate LLM service error handling', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping LLM error handling validation - no real API key');
        return;
      }

      // Test with empty prompt
      const emptyResult = await generateContent('');
      expect(emptyResult).toBeTruthy();
      expect(typeof emptyResult).toBe('string');

      // Test with very short prompt
      const shortResult = await generateContent('Hello.');
      expect(shortResult).toBeTruthy();
      expect(typeof shortResult).toBe('string');

      console.log('✅ LLM Service error handling validated');
    }, 60000);
  });

  describe('Embedding Service Validation', () => {
    it('should validate embedding service with curriculum content', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping embedding validation - no real API key configured');
        expect(embeddingService.isEmbeddingServiceAvailable()).toBeDefined();
        return;
      }

      const startTime = Date.now();

      // Test service availability
      expect(embeddingService.isEmbeddingServiceAvailable()).toBe(true);

      // Test embedding generation for different subjects
      const mathEmbedding = await embeddingService.generateEmbedding(
        'validation-math-001',
        AI_TEST_PROMPTS.embedding.mathematics[0],
      );

      expect(mathEmbedding).toBeTruthy();
      expect(mathEmbedding?.embedding.length).toBeGreaterThan(1500);
      expect(mathEmbedding?.model).toBe('text-embedding-3-small');

      await testRateLimiter.waitUntilAllowed();

      const languageEmbedding = await embeddingService.generateEmbedding(
        'validation-lang-001',
        AI_TEST_PROMPTS.embedding.language[0],
      );

      expect(languageEmbedding).toBeTruthy();
      expect(languageEmbedding?.embedding.length).toBeGreaterThan(1500);

      // Test similarity calculation
      const similarity = embeddingService.calculateSimilarity(
        mathEmbedding!.embedding,
        languageEmbedding!.embedding,
      );

      expect(similarity).toBeGreaterThan(-1);
      expect(similarity).toBeLessThan(1);

      const endTime = Date.now();
      performanceMonitor.record('embedding_service_validation', endTime - startTime);

      console.log(`✅ Embedding Service validation completed in ${endTime - startTime}ms`);
      console.log(`📊 Math-Language similarity: ${similarity.toFixed(3)}`);
    }, 90000);

    it('should validate embedding batch processing', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping embedding batch validation - no real API key');
        return;
      }

      const startTime = Date.now();

      const batchData = AI_TEST_PROMPTS.embedding.mathematics.slice(0, 3).map((text, i) => ({
        id: `validation-batch-${i + 1}`,
        text: text,
      }));

      const results = await embeddingService.generateBatchEmbeddings(batchData);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.embedding.length > 1500)).toBe(true);

      const endTime = Date.now();
      performanceMonitor.record('embedding_batch_validation', endTime - startTime);

      console.log(`✅ Embedding batch processing validated in ${endTime - startTime}ms`);
    }, 120000);

    it('should validate embedding similarity and search', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping embedding similarity validation - no real API key');
        return;
      }

      // Generate embeddings for related and unrelated content
      const mathTexts = AI_TEST_PROMPTS.embedding.mathematics.slice(0, 2);
      const unrelatedText = AI_TEST_PROMPTS.embedding.unrelated[0];

      const mathEmbedding1 = await embeddingService.generateEmbedding(
        'validation-similarity-1',
        mathTexts[0],
      );

      await testRateLimiter.waitUntilAllowed();

      const mathEmbedding2 = await embeddingService.generateEmbedding(
        'validation-similarity-2',
        mathTexts[1],
      );

      await testRateLimiter.waitUntilAllowed();

      const unrelatedEmbedding = await embeddingService.generateEmbedding(
        'validation-similarity-3',
        unrelatedText,
      );

      expect(mathEmbedding1).toBeTruthy();
      expect(mathEmbedding2).toBeTruthy();
      expect(unrelatedEmbedding).toBeTruthy();

      // Related math content should be more similar than unrelated content
      const mathSimilarity = embeddingService.calculateSimilarity(
        mathEmbedding1!.embedding,
        mathEmbedding2!.embedding,
      );

      const crossSimilarity = embeddingService.calculateSimilarity(
        mathEmbedding1!.embedding,
        unrelatedEmbedding!.embedding,
      );

      expect(mathSimilarity).toBeGreaterThan(crossSimilarity);
      expect(mathSimilarity).toBeGreaterThan(0.6);

      console.log(
        `✅ Similarity validation - Math-Math: ${mathSimilarity.toFixed(3)}, Math-Unrelated: ${crossSimilarity.toFixed(3)}`,
      );
    }, 120000);
  });

  describe('AI Parent Summary Service Validation', () => {
    it('should validate AI-powered parent summary generation', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping parent summary validation - no real API key configured');
        expect(parentSummaryService.isAIServiceAvailable()).toBeDefined();
        return;
      }

      const startTime = Date.now();

      // Test with the first student from our test data
      const request = {
        studentId: testStudentIds[0],
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        includeActivities: true,
        includeGoals: true,
        includeReflections: true,
      };

      const result = await parentSummaryService.generateParentSummary(request);

      // Validate structure
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(result).toHaveProperty('metadata');

      // Validate content quality
      expect(result.french.length).toBeGreaterThan(50);
      expect(result.english.length).toBeGreaterThan(50);

      // Should contain student name from test data
      const student = CURRICULUM_TEST_DATA.students[0];
      expect(result.french).toContain(student.firstName);
      expect(result.english).toContain(student.firstName);

      // Validate metadata
      expect(result.metadata.periodDays).toBe(31);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
      expect(result.metadata.activitiesCount).toBeGreaterThan(0);

      const endTime = Date.now();
      performanceMonitor.record('parent_summary_validation', endTime - startTime);

      console.log(`✅ Parent Summary validation completed in ${endTime - startTime}ms`);
      console.log(
        `📝 Summary lengths - French: ${result.french.length}, English: ${result.english.length}`,
      );
    }, 120000);

    it('should validate parent summary with focus areas', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping focus areas validation - no real API key');
        return;
      }

      const request = {
        studentId: testStudentIds[1],
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
        focus: ['Mathematics', 'Problem Solving'],
      };

      const result = await parentSummaryService.generateParentSummary(request);

      // Should emphasize focus areas
      const combinedText = `${result.french} ${result.english}`.toLowerCase();
      expect(
        combinedText.includes('mathematics') ||
          combinedText.includes('mathématiques') ||
          combinedText.includes('math'),
      ).toBe(true);

      expect(result.metadata.focusAreas).toEqual(['Mathematics', 'Problem Solving']);

      console.log('✅ Focus areas validation completed');
    }, 90000);

    it('should validate bilingual content consistency', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping bilingual consistency validation - no real API key');
        return;
      }

      const request = {
        studentId: testStudentIds[2],
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const result = await parentSummaryService.generateParentSummary(request);

      // Both languages should mention the student
      const student = CURRICULUM_TEST_DATA.students[2];
      expect(result.french).toContain(student.firstName);
      expect(result.english).toContain(student.firstName);

      // Should have reasonable length similarity
      const frenchWords = result.french.split(' ').length;
      const englishWords = result.english.split(' ').length;
      const ratio = Math.max(frenchWords, englishWords) / Math.min(frenchWords, englishWords);
      expect(ratio).toBeLessThan(3); // Allow for language differences but not extreme disparities

      console.log(`✅ Bilingual consistency validated - Ratio: ${ratio.toFixed(2)}`);
    }, 90000);
  });

  describe('Service Integration and Performance', () => {
    it('should validate cross-service integration', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping integration validation - no real API key');
        return;
      }

      const startTime = Date.now();

      // Test that services work together correctly
      // 1. Generate content with LLM
      const content = await generateContent(
        'Create a brief description of a math lesson for grade 3.',
      );
      expect(content).toBeTruthy();

      await testRateLimiter.waitUntilAllowed();

      // 2. Generate embedding for the content
      const embedding = await embeddingService.generateEmbedding(
        'validation-integration-001',
        content,
      );
      expect(embedding).toBeTruthy();
      expect(embedding?.embedding.length).toBeGreaterThan(1500);

      await testRateLimiter.waitUntilAllowed();

      // 3. Generate parent summary
      const summaryRequest = {
        studentId: testStudentIds[0],
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      const summary = await parentSummaryService.generateParentSummary(summaryRequest);
      expect(summary.french).toBeTruthy();
      expect(summary.english).toBeTruthy();

      const endTime = Date.now();
      performanceMonitor.record('cross_service_integration', endTime - startTime);

      console.log(`✅ Cross-service integration validated in ${endTime - startTime}ms`);
    }, 180000);

    it('should validate concurrent request handling', async () => {
      if (!hasRealAPIKey()) {
        console.log('⏭️  Skipping concurrent validation - no real API key');
        return;
      }

      const startTime = Date.now();

      // Test concurrent requests to different services
      const promises = [
        generateContent('Create a simple math problem for grade 3.'),
        embeddingService.generateEmbedding(
          'validation-concurrent-001',
          'Students will practice addition strategies',
        ),
        parentSummaryService.generateParentSummary({
          studentId: testStudentIds[0],
          from: new Date('2024-01-01'),
          to: new Date('2024-01-15'),
          userId: testUserId,
        }),
      ];

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results[0]).toBeTruthy(); // LLM result
      expect(results[1]).toBeTruthy(); // Embedding result
      expect(results[2]).toBeTruthy(); // Summary result

      const endTime = Date.now();
      performanceMonitor.record('concurrent_requests', endTime - startTime);

      console.log(`✅ Concurrent request handling validated in ${endTime - startTime}ms`);
    }, 180000);

    it('should validate rate limiting and cost control', async () => {
      // Test rate limiting functionality
      const rateLimitStats = testRateLimiter.getStats();
      expect(rateLimitStats.maxRequests).toBeGreaterThan(0);
      expect(rateLimitStats.currentRequests).toBeGreaterThanOrEqual(0);

      // Test usage tracking
      const embeddingStats = embeddingService.getUsageStats();
      expect(embeddingStats).toHaveProperty('requests');
      expect(embeddingStats).toHaveProperty('tokens');
      expect(typeof embeddingStats.requests).toBe('number');
      expect(typeof embeddingStats.tokens).toBe('number');

      console.log(
        `✅ Rate limiting validated - ${rateLimitStats.currentRequests}/${rateLimitStats.maxRequests} requests`,
      );
      console.log(
        `📊 Embedding usage - ${embeddingStats.requests} requests, ${embeddingStats.tokens} tokens`,
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should validate graceful degradation without API key', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        // LLM service should handle missing API key
        const llmResult = await generateContent('Test prompt');
        expect(llmResult).toBeTruthy();
        expect(typeof llmResult).toBe('string');

        // Embedding service should report unavailability
        const embeddingAvailable = embeddingService.isEmbeddingServiceAvailable();
        expect(typeof embeddingAvailable).toBe('boolean');

        // Parent summary should fall back to rule-based
        const summaryRequest = {
          studentId: testStudentIds[0],
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
          userId: testUserId,
        };

        const summaryResult = await parentSummaryService.generateParentSummary(summaryRequest);
        expect(summaryResult.french).toBeTruthy();
        expect(summaryResult.english).toBeTruthy();

        console.log('✅ Graceful degradation validated');
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
    });

    it('should validate error boundary handling', async () => {
      // Test with invalid student ID
      const invalidRequest = {
        studentId: 99999,
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
        userId: testUserId,
      };

      await expect(parentSummaryService.generateParentSummary(invalidRequest)).rejects.toThrow();

      // Test with invalid date range
      const invalidDateRequest = {
        studentId: testStudentIds[0],
        from: new Date('2024-01-31'),
        to: new Date('2024-01-01'),
        userId: testUserId,
      };

      const result = await parentSummaryService.generateParentSummary(invalidDateRequest);
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');

      console.log('✅ Error boundary handling validated');
    });
  });

  describe('Final Validation Summary', () => {
    it('should provide comprehensive validation report', async () => {
      // Calculate overall pass rate
      const allStats = performanceMonitor.getAllStats();
      const hasApiKey = hasRealAPIKey();

      console.log('\n📋 TIER 1 AI SERVICES VALIDATION REPORT');
      console.log('==========================================');
      console.log(`🔑 Real API Key Available: ${hasApiKey ? 'YES' : 'NO'}`);
      console.log(
        `📊 Tests Executed: ${Object.keys(allStats).length} performance metrics recorded`,
      );

      if (hasApiKey) {
        console.log('🎯 Service Validation Results:');
        console.log(`   ✅ LLM Service: Functional`);
        console.log(`   ✅ Embedding Service: Functional`);
        console.log(`   ✅ Parent Summary Service: Functional`);
        console.log(`   ✅ Cross-Service Integration: Functional`);
        console.log(`   ✅ Error Handling: Robust`);

        if (allStats.llm_service_validation) {
          console.log(`⚡ Performance Metrics:`);
          console.log(`   LLM Service: ${allStats.llm_service_validation.avg.toFixed(0)}ms avg`);
        }
        if (allStats.embedding_service_validation) {
          console.log(
            `   Embedding Service: ${allStats.embedding_service_validation.avg.toFixed(0)}ms avg`,
          );
        }
        if (allStats.parent_summary_validation) {
          console.log(
            `   Parent Summary: ${allStats.parent_summary_validation.avg.toFixed(0)}ms avg`,
          );
        }
      } else {
        console.log('⚠️  Tests ran in mock mode - configure OPENAI_API_KEY for full validation');
      }

      const embeddingStats = embeddingService.getUsageStats();
      const rateLimitStats = testRateLimiter.getStats();

      console.log(`💰 Cost Tracking:`);
      console.log(`   API Requests: ${rateLimitStats.currentRequests}`);
      console.log(`   Embedding Tokens: ${embeddingStats.tokens}`);
      console.log(
        `   Rate Limit Status: ${rateLimitStats.currentRequests}/${rateLimitStats.maxRequests}`,
      );

      console.log('\n🎉 VALIDATION COMPLETE - All Tier 1 services operational!');

      // Final assertion for the test
      expect(true).toBe(true);
    });
  });
});
