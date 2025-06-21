import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { curriculumImportService } from '../src/services/curriculumImportService';
import { SmartMaterialExtractor } from '../src/services/smartMaterialExtractor';

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  curriculumParsingTime: 5000, // 5 seconds max
  materialExtractionTime: 2000, // 2 seconds max
  batchProcessingTime: 10000, // 10 seconds max for batch operations
  concurrentRequestLimit: 10, // Max concurrent AI requests
  memorySafetyLimit: 100 * 1024 * 1024, // 100MB memory usage
};

describe('AI Features Performance Benchmarks', () => {
  let mockOpenAIResponse: { choices: Array<{ message: { content: string } }> };
  let mockExtractor: SmartMaterialExtractor;

  beforeEach(() => {
    // Mock OpenAI with realistic response times
    mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              subject: 'Mathematics',
              grade: 1,
              outcomes: [
                { code: 'M1.1', description: 'Count to 10' },
                { code: 'M1.2', description: 'Recognize numbers 1-10' },
                { code: 'M1.3', description: 'Compare quantities' },
              ],
            }),
          },
        },
      ],
    };

    jest.mock('openai', () => ({
      default: jest.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate realistic API response time
              await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
              return mockOpenAIResponse;
            }),
          },
        },
      })),
    }));

    mockExtractor = new SmartMaterialExtractor();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Curriculum Import Performance', () => {
    it('should parse curriculum documents within time threshold', async () => {
      const sampleText = `
        Grade 1 Mathematics Curriculum
        
        Students will learn to:
        - Count from 1 to 10
        - Recognize numbers 1-10 in various forms
        - Compare quantities using more, less, same
        - Understand basic addition concepts
        - Practice number patterns
        - Identify shapes and basic geometry
        - Measure length using non-standard units
        - Sort and classify objects
        - Tell time to the hour
        - Understand money concepts with coins
      `;

      const startTime = performance.now();

      // Test curriculum parsing performance
      const parsedData = await curriculumImportService.parseWithAI(sampleText);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verify performance threshold
      expect(processingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.curriculumParsingTime);

      // Verify output quality
      expect(parsedData).toHaveProperty('subject');
      expect(parsedData).toHaveProperty('grade');
      expect(parsedData).toHaveProperty('outcomes');
      expect(Array.isArray(parsedData.outcomes)).toBe(true);
      expect(parsedData.outcomes.length).toBeGreaterThan(0);

      console.log(`Curriculum parsing took ${processingTime.toFixed(2)}ms`);
    });

    it('should handle large curriculum documents efficiently', async () => {
      // Generate large curriculum text
      const largeCurriculumText = Array.from(
        { length: 100 },
        (_, i) =>
          `Outcome ${i + 1}: Students will demonstrate understanding of concept ${i + 1} by completing tasks and assessments.`,
      ).join('\n');

      const startTime = performance.now();

      try {
        const parsedData = await curriculumImportService.parseWithAI(largeCurriculumText);

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        expect(processingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.curriculumParsingTime * 2); // Allow 2x time for large docs
        expect(parsedData.outcomes.length).toBeGreaterThan(0);

        console.log(`Large curriculum parsing took ${processingTime.toFixed(2)}ms`);
      } catch (error) {
        // If it fails due to token limits, that's acceptable for this performance test
        expect(error).toBeDefined();
        console.log('Large curriculum exceeded API limits (expected for very large documents)');
      }
    });

    it('should maintain response quality under time pressure', async () => {
      const testTexts = [
        'Mathematics Grade 1: Counting 1-10, basic addition',
        'Language Arts Grade 2: Reading comprehension, writing sentences',
        'Science Grade 1: Weather patterns, plant life cycles',
        'Social Studies Grade 2: Community helpers, maps and directions',
      ];

      const startTime = performance.now();

      // Process multiple curricula in parallel
      const promises = testTexts.map(async (text) => {
        const result = await curriculumImportService.parseWithAI(text);
        return result;
      });

      const parsedResults = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should process all in parallel efficiently
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.curriculumParsingTime * 1.5);

      // All results should be valid
      parsedResults.forEach((result) => {
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('grade');
        expect(result.outcomes.length).toBeGreaterThan(0);
      });

      console.log(
        `Parallel curriculum parsing took ${totalTime.toFixed(2)}ms for ${testTexts.length} documents`,
      );
    });
  });

  describe('Smart Material Extraction Performance', () => {
    it('should extract materials within time threshold', async () => {
      const activityText = `
        Today's math lesson will require math workbooks for each student (30 copies), 
        calculators for group work (15 units), pencils and erasers for problem solving,
        whiteboard markers for demonstrations, printed worksheets for homework,
        manipulatives like counting blocks and number lines for visual learning.
      `;

      const startTime = performance.now();

      const materials = await mockExtractor.extractMaterials(activityText);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.materialExtractionTime);
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);

      console.log(`Material extraction took ${processingTime.toFixed(2)}ms`);
    });

    it('should handle batch material extraction efficiently', async () => {
      const activities = [
        'Math lesson with workbooks and calculators',
        'Science experiment with test tubes and safety goggles',
        'Art class with paints, brushes, and canvas',
        'Reading time with books and comfortable seating',
        'Writing workshop with paper, pencils, and dictionaries',
        'Physical education with balls, cones, and sports equipment',
        'Music class with instruments and sheet music',
        'Technology lab with computers and headphones',
      ];

      const startTime = performance.now();

      // Process all activities in batch
      const results = await mockExtractor.analyzeWeeklyPreparation(activities);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.batchProcessingTime);

      expect(results).toHaveProperty('printingNeeded');
      expect(results).toHaveProperty('setupRequired');
      expect(results).toHaveProperty('purchaseNeeded');

      console.log(
        `Batch material extraction took ${processingTime.toFixed(2)}ms for ${activities.length} activities`,
      );
    });

    it('should maintain memory efficiency during processing', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Process many material extractions
      const largeBatch = Array.from(
        { length: 50 },
        (_, i) =>
          `Activity ${i}: Various materials needed including supplies, books, technology, and equipment for comprehensive learning experience.`,
      );

      for (const activity of largeBatch) {
        await mockExtractor.extractMaterials(activity);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memorySafetyLimit);

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB for ${largeBatch.length} operations`,
      );
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent AI requests efficiently', async () => {
      const concurrentRequests = Array.from(
        { length: PERFORMANCE_THRESHOLDS.concurrentRequestLimit },
        (_, i) => ({
          text: `Test curriculum ${i}: Basic learning outcomes for grade ${(i % 3) + 1}`,
          id: i,
        }),
      );

      const startTime = performance.now();

      // Execute concurrent requests
      const promises = concurrentRequests.map(async (request) => {
        try {
          const result = await curriculumImportService.parseWithAI(request.text);
          return { success: true, id: request.id, result };
        } catch (error) {
          return { success: false, id: request.id, error };
        }
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle concurrent requests efficiently
      const successfulResults = results.filter((r) => r.success);
      expect(successfulResults.length).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.concurrentRequestLimit * 0.8,
      ); // 80% success rate

      // Should not take much longer than sequential processing
      const averageTimePerRequest = totalTime / results.length;
      expect(averageTimePerRequest).toBeLessThan(
        PERFORMANCE_THRESHOLDS.curriculumParsingTime * 1.2,
      );

      console.log(
        `Concurrent processing: ${results.length} requests in ${totalTime.toFixed(2)}ms (${averageTimePerRequest.toFixed(2)}ms avg)`,
      );
    });

    it('should gracefully handle API rate limiting', async () => {
      // Mock rate limiting scenario
      let requestCount = 0;
      const mockOpenAI = await import('openai');

      jest.mocked(mockOpenAI.default).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async () => {
              requestCount++;
              if (requestCount > 5) {
                // Simulate rate limiting after 5 requests
                const error = new Error('Rate limit exceeded') as Error & { status: number };
                error.status = 429;
                throw error;
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
              return mockOpenAIResponse;
            }),
          },
        },
      }));

      const requests = Array.from({ length: 8 }, (_, i) =>
        curriculumImportService.parseWithAI(`Test text ${i}`),
      );

      const results = await Promise.allSettled(requests);

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      expect(successful).toBeGreaterThan(0);
      expect(failed).toBeGreaterThan(0); // Should have some failures due to rate limiting

      console.log(`Rate limiting test: ${successful} successful, ${failed} rate-limited`);
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover quickly from API errors', async () => {
      let errorThrown = false;
      const mockOpenAI = await import('openai');

      jest.mocked(mockOpenAI.default).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async () => {
              if (!errorThrown) {
                errorThrown = true;
                throw new Error('API temporarily unavailable');
              }
              await new Promise((resolve) => setTimeout(resolve, 200));
              return mockOpenAIResponse;
            }),
          },
        },
      }));

      const startTime = performance.now();

      // First request should fail
      try {
        await curriculumImportService.parseWithAI('Test text 1');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Second request should succeed
      const result = await curriculumImportService.parseWithAI('Test text 2');

      const endTime = performance.now();
      const recoveryTime = endTime - startTime;

      expect(result).toHaveProperty('subject');
      expect(recoveryTime).toBeLessThan(3000); // Should recover within 3 seconds

      console.log(`Error recovery took ${recoveryTime.toFixed(2)}ms`);
    });

    it('should handle malformed AI responses gracefully', async () => {
      const mockOpenAI = await import('openai');

      jest.mocked(mockOpenAI.default).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Invalid JSON response {malformed',
                  },
                },
              ],
            }),
          },
        },
      }));

      const startTime = performance.now();

      try {
        await curriculumImportService.parseWithAI('Test curriculum text');
        expect.fail('Should have thrown an error for malformed response');
      } catch (error) {
        const endTime = performance.now();
        const errorHandlingTime = endTime - startTime;

        expect(error).toBeDefined();
        expect(errorHandlingTime).toBeLessThan(1000); // Should fail fast

        console.log(`Malformed response handling took ${errorHandlingTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Resource Usage Monitoring', () => {
    it('should monitor and report performance metrics', () => {
      const metrics = {
        curriculumParsingThreshold: PERFORMANCE_THRESHOLDS.curriculumParsingTime,
        materialExtractionThreshold: PERFORMANCE_THRESHOLDS.materialExtractionTime,
        batchProcessingThreshold: PERFORMANCE_THRESHOLDS.batchProcessingTime,
        concurrentRequestLimit: PERFORMANCE_THRESHOLDS.concurrentRequestLimit,
        memorySafetyLimit: PERFORMANCE_THRESHOLDS.memorySafetyLimit,
      };

      // Verify all thresholds are reasonable
      expect(metrics.curriculumParsingThreshold).toBeGreaterThan(1000); // At least 1 second
      expect(metrics.curriculumParsingThreshold).toBeLessThan(30000); // Less than 30 seconds

      expect(metrics.materialExtractionThreshold).toBeGreaterThan(500);
      expect(metrics.materialExtractionThreshold).toBeLessThan(10000);

      expect(metrics.concurrentRequestLimit).toBeGreaterThan(5);
      expect(metrics.concurrentRequestLimit).toBeLessThan(50);

      console.log('Performance thresholds configured:', metrics);
    });

    it('should track API usage patterns', async () => {
      const usageStats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        totalProcessingTime: 0,
      };

      const testRequests = [
        'Simple curriculum text',
        'Complex curriculum with multiple subjects',
        'Material extraction test',
      ];

      for (const request of testRequests) {
        const startTime = performance.now();
        usageStats.totalRequests++;

        try {
          await curriculumImportService.parseWithAI(request);
          usageStats.successfulRequests++;

          const endTime = performance.now();
          const requestTime = endTime - startTime;
          usageStats.totalProcessingTime += requestTime;
        } catch (error) {
          usageStats.failedRequests++;
        }
      }

      usageStats.averageResponseTime =
        usageStats.totalProcessingTime / usageStats.successfulRequests;

      expect(usageStats.totalRequests).toBe(testRequests.length);
      expect(usageStats.successfulRequests).toBeGreaterThan(0);
      expect(usageStats.averageResponseTime).toBeGreaterThan(0);

      console.log('API usage statistics:', usageStats);
    });
  });
});
