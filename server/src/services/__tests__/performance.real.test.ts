/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real Performance Tests for Service Layer
 * Testing actual service performance with real implementations and data
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { AIService } from '../ai/aiService';
import { CurriculumImportOrchestrator } from '../curriculum/CurriculumImportOrchestrator';
import { TemplateOrchestrator } from '../templates/TemplateOrchestrator';
import { HandlebarsEngine } from '../templates/engines/HandlebarsEngine';
import { CurriculumValidator } from '../curriculum/validators/CurriculumValidator';
import { prisma } from '../../prisma';
import logger from '../../logger';
import * as fs from 'fs/promises';
import * as path from 'path';

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  AI_RESPONSE_TIME: 15000, // 15 seconds for AI services
  DATABASE_OPERATION_TIME: 1000, // 1 second for DB operations
  TEMPLATE_RENDER_TIME: 500, // 0.5 seconds for template rendering
  VALIDATION_TIME: 1000, // 1 second for validation
  CONCURRENT_OPERATIONS: 10, // Number of concurrent operations
  LARGE_DATASET_SIZE: 500, // Size of large datasets
  MEMORY_LEAK_ITERATIONS: 50, // Iterations for memory leak tests
};

const ENABLE_AI_PERFORMANCE_TESTS = process.env.ENABLE_REAL_AI_TESTS === 'true' || !!process.env.OPENAI_API_KEY;

describe('Service Layer - Real Performance Tests', () => {
  let aiService: AIService;
  let curriculumOrchestrator: CurriculumImportOrchestrator;
  let templateOrchestrator: TemplateOrchestrator;
  let handlebarsEngine: HandlebarsEngine;
  let curriculumValidator: CurriculumValidator;
  let testUser: any;
  let tempDir: string;

  beforeAll(async () => {
    // Create temp directory for test files
    tempDir = path.join(__dirname, '../../../temp-performance-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: `perf-test-${Date.now()}@example.com`,
        name: 'Performance Test User',
        role: 'TEACHER',
        hashedPassword: 'test-hash',
      },
    });

    logger.info('Performance test setup completed', {
      tempDir,
      testUserId: testUser.id,
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.curriculumExpectation.deleteMany({
      where: { subject: { userId: testUser.id } },
    });
    await prisma.subject.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Initialize services
    if (ENABLE_AI_PERFORMANCE_TESTS) {
      aiService = new AIService({
        apiKey: process.env.OPENAI_API_KEY ?? 'test-key',
        model: 'gpt-3.5-turbo',
        maxTokens: 500, // Lower for performance tests to save costs
      });
    }

    curriculumOrchestrator = CurriculumImportOrchestrator.getInstance();
    templateOrchestrator = TemplateOrchestrator.getInstance();
    handlebarsEngine = new HandlebarsEngine();
    curriculumValidator = CurriculumValidator.createDefault();

    await curriculumOrchestrator.initialize();
    await templateOrchestrator.initialize();
  });

  afterEach(async () => {
    await curriculumOrchestrator.cleanup();
    await templateOrchestrator.cleanup();
  });

  describe('AI Service Performance Tests', () => {
    test('should generate lesson plans within performance threshold', async () => {
      if (!ENABLE_AI_PERFORMANCE_TESTS) {
        test.skip();
        return;
      }

      const lessonInputs = [
        {
          grade: '3',
          subject: 'Math',
          topic: 'Addition',
          duration: 45,
        },
        {
          grade: '4',
          subject: 'Science',
          topic: 'Plants',
          duration: 60,
        },
        {
          grade: '2',
          subject: 'Language',
          topic: 'Reading',
          duration: 30,
        },
      ];

      const results: Array<{ input: any; time: number; success: boolean }> = [];

      for (const input of lessonInputs) {
        const startTime = Date.now();
        try {
          const result = await aiService.generateLesson(input);
          const time = Date.now() - startTime;
          
          results.push({ input, time, success: true });
          
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('activities');
          expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME);
          
          logger.info('AI lesson generation performance', {
            topic: input.topic,
            timeMs: time,
            threshold: PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME,
          });
        } catch (error) {
          results.push({ input, time: Date.now() - startTime, success: false });
          throw _error;
        }
      }

      // Performance analysis
      const averageTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      const maxTime = Math.max(...results.map(r => r.time));
      const successRate = results.filter(r => r.success).length / results.length;

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME);
      expect(successRate).toBe(1); // 100% success rate

      logger.info('AI service performance summary', {
        averageTimeMs: Math.round(averageTime),
        maxTimeMs: maxTime,
        successRate: Math.round(successRate * 100),
        totalRequests: results.length,
      });
    }, PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME * 3 + 5000); // Allow extra time for multiple requests

    test('should handle concurrent AI requests efficiently', async () => {
      if (!ENABLE_AI_PERFORMANCE_TESTS) {
        test.skip();
        return;
      }

      const concurrentInputs = Array.from({ length: 5 }, (_, i) => ({
        grade: '3',
        subject: 'Math',
        topic: `Topic ${i + 1}`,
        duration: 30,
      }));

      const startTime = Date.now();
      const promises = concurrentInputs.map(input => aiService.generateLesson(input));
      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;

      const successfulResults = results.filter(r => r.status === 'fulfilled');
      expect(successfulResults.length).toBeGreaterThan(0);

      // Concurrent requests should be faster than sequential
      const estimatedSequentialTime = concurrentInputs.length * PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME;
      expect(totalTime).toBeLessThan(estimatedSequentialTime);

      logger.info('AI concurrent requests performance', {
        concurrentRequests: concurrentInputs.length,
        successfulRequests: successfulResults.length,
        totalTimeMs: totalTime,
        estimatedSequentialTimeMs: estimatedSequentialTime,
        timeSavingPercent: Math.round(((estimatedSequentialTime - totalTime) / estimatedSequentialTime) * 100),
      });
    }, PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME * 2); // Allow time for concurrent processing
  });

  describe('Curriculum Service Performance Tests', () => {
    test('should import large curriculum datasets efficiently', async () => {
      // Generate large CSV content
      const csvLines = ['Code,Strand,Grade,Subject,Description'];
      for (let i = 1; i <= PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE; i++) {
        const strand = ['Number Sense', 'Measurement', 'Geometry', 'Algebra', 'Data'][i % 5];
        csvLines.push(`A${Math.floor(i/100)+1}.${i%100+1},${strand},5,Mathematics,"Learning expectation ${i}"`);
      }

      const csvContent = csvLines.join('\n');
      const csvPath = path.join(tempDir, 'large-curriculum.csv');
      await fs.writeFile(csvPath, csvContent, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const startTime = Date.now();
      const result = await curriculumOrchestrator.importFromFile(fileBuffer, {
        userId: testUser.id,
        filename: 'large-curriculum.csv',
      });
      const importTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.stats.created).toBe(PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE);
      expect(importTime).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE_OPERATION_TIME * 10); // Allow 10x threshold for large data

      // Verify data integrity
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: { subject: { userId: testUser.id } },
      });
      expect(savedExpectations.length).toBe(PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE);

      logger.info('Large curriculum import performance', {
        expectationsCount: PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE,
        importTimeMs: importTime,
        expectationsPerSecond: Math.round(PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE / (importTime / 1000)),
      });
    });

    test('should validate large datasets efficiently', async () => {
      // Generate large validation dataset
      const largeExpectations = Array.from({ length: PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE }, (_, i) => ({
        code: `A${Math.floor(i/100)+1}.${i%100+1}`,
        description: `This is learning expectation number ${i+1} for testing validation performance`,
        type: i % 10 === 0 ? 'overall' : 'specific',
        strand: ['Number Sense', 'Measurement', 'Geometry', 'Algebra', 'Data'][i % 5],
        keywords: [`keyword${i}`, `test${i}`],
      }));

      const largeCurriculum = {
        grade: 5,
        subject: 'Mathematics',
        source: 'performance-test.csv',
        expectations: largeExpectations,
      };

      const startTime = Date.now();
      const result = curriculumValidator.validate(largeCurriculum);
      const validationTime = Date.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(result.stats.totalExpectations).toBe(PERFORMANCE_THRESHOLDS.LARGE_DATASET_SIZE);
      expect(validationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION_TIME);

      logger.info('Large dataset validation performance', {
        expectationsValidated: result.stats.totalExpectations,
        validationTimeMs: validationTime,
        expectationsPerMs: Math.round(result.stats.totalExpectations / validationTime),
      });
    });

    test('should handle concurrent curriculum operations', async () => {
      const concurrentOperations = Array.from({ length: PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS }, (_, i) => {
        const csvContent = `Code,Strand,Grade,Subject,Description\nA${i}.1,Test Strand,3,Mathematics,"Concurrent test ${i}"`;
        return { content: csvContent, filename: `concurrent-${i}.csv` };
      });

      const startTime = Date.now();
      const promises = concurrentOperations.map(async (op, index) => {
        const tempPath = path.join(tempDir, op.filename);
        await fs.writeFile(tempPath, op.content, 'utf8');
        const fileBuffer = await fs.readFile(tempPath);
        
        return curriculumOrchestrator.importFromFile(fileBuffer, {
          userId: testUser.id,
          filename: op.filename,
        });
      });

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All operations should succeed
      expect(results.every(r => r.success)).toBe(true);
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE_OPERATION_TIME * 5); // Allow 5x for concurrent ops

      const totalExpectations = results.reduce((sum, r) => sum + r.stats.created, 0);
      expect(totalExpectations).toBe(PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS);

      logger.info('Concurrent curriculum operations performance', {
        concurrentOperations: PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS,
        totalTimeMs: totalTime,
        totalExpectations,
        operationsPerSecond: Math.round(PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS / (totalTime / 1000)),
      });
    });
  });

  describe('Template Service Performance Tests', () => {
    test('should render complex templates efficiently', async () => {
      // Create complex lesson plan data
      const complexLessonData = {
        title: 'Complex Mathematics Unit',
        grade: 4,
        subject: 'Mathematics',
        duration: 120,
        date: new Date(),
        objectives: Array.from({ length: 20 }, (_, i) => `Learning objective ${i + 1} with detailed description`),
        activities: Array.from({ length: 15 }, (_, i) => ({
          name: `Activity ${i + 1}`,
          duration: 8,
          description: `Detailed description for activity ${i + 1} including multiple steps and procedures`,
          materials: [`Material A${i}`, `Material B${i}`, `Material C${i}`],
        })),
        assessment: 'Comprehensive assessment including formative and summative evaluation strategies',
      };

      const complexTemplate = {
        id: 'complex-lesson',
        name: 'Complex Lesson Template',
        content: `
          <div class="lesson-plan">
            <header>
              <h1>{{lesson.title}}</h1>
              <div class="metadata">
                <span>Grade: {{lesson.grade}}</span>
                <span>Subject: {{lesson.subject}}</span>
                <span>Duration: {{lesson.duration}} minutes</span>
              </div>
            </header>
            
            <section class="objectives">
              <h2>Learning Objectives ({{length lesson.objectives}})</h2>
              <ol>
                {{#each lesson.objectives}}
                <li>{{this}}</li>
                {{/each}}
              </ol>
            </section>
            
            <section class="activities">
              <h2>Activities ({{length lesson.activities}})</h2>
              {{#each lesson.activities}}
              <div class="activity">
                <h3>{{inc @index}}. {{this.name}} ({{this.duration}} min)</h3>
                <p>{{this.description}}</p>
                <h4>Materials:</h4>
                <ul>
                  {{#each this.materials}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
              </div>
              {{/each}}
            </section>
            
            <section class="assessment">
              <h2>Assessment</h2>
              <p>{{lesson.assessment}}</p>
            </section>
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: ['lesson'],
      };

      const context = {
        data: { lesson: complexLessonData },
        helpers: {},
        partials: {},
      };

      const startTime = Date.now();
      const result = await handlebarsEngine.render(complexTemplate, context);
      const renderTime = Date.now() - startTime;

      expect(result.content).toContain('Complex Mathematics Unit');
      expect(result.content).toContain('Activity 1');
      expect(result.content).toContain('Activity 15');
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TEMPLATE_RENDER_TIME);

      logger.info('Complex template rendering performance', {
        objectivesCount: complexLessonData.objectives.length,
        activitiesCount: complexLessonData.activities.length,
        contentLength: result.content.length,
        renderTimeMs: renderTime,
        charactersPerMs: Math.round(result.content.length / renderTime),
      });
    });

    test('should handle multiple concurrent template renders', async () => {
      const templates = Array.from({ length: PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        content: `<h1>{{title}}</h1><p>Content for template ${i}: {{description}}</p>`,
        format: 'html',
        engine: 'handlebars',
        variables: ['title', 'description'],
      }));

      const contexts = templates.map((_, i) => ({
        data: {
          title: `Title ${i}`,
          description: `This is a description for template ${i} with some content`,
        },
        helpers: {},
        partials: {},
      }));

      const startTime = Date.now();
      const promises = templates.map((template, index) => 
        handlebarsEngine.render(template, contexts[index])
      );
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results.length).toBe(PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS);
      expect(results.every(r => r.content.length > 0)).toBe(true);
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TEMPLATE_RENDER_TIME * 2); // Allow 2x for concurrent ops

      logger.info('Concurrent template rendering performance', {
        templatesRendered: results.length,
        totalTimeMs: totalTime,
        averageRenderTime: Math.round(totalTime / results.length),
        templatesPerSecond: Math.round(results.length / (totalTime / 1000)),
      });
    });

    test('should cache template compilation effectively', async () => {
      const template = {
        id: 'cache-performance-test',
        name: 'Cache Performance Template',
        content: '<h1>{{title}}</h1><p>{{description}}</p><ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul>',
        format: 'html',
        engine: 'handlebars',
        variables: ['title', 'description', 'items'],
      };

      const contexts = Array.from({ length: 20 }, (_, i) => ({
        data: {
          title: `Title ${i}`,
          description: `Description ${i}`,
          items: [`Item ${i}A`, `Item ${i}B`, `Item ${i}C`],
        },
        helpers: {},
        partials: {},
      }));

      // First render (compilation + render)
      const firstRenderStart = Date.now();
      const firstResult = await handlebarsEngine.render(template, contexts[0]);
      const firstRenderTime = Date.now() - firstRenderStart;

      // Subsequent renders (cached compilation)
      const subsequentTimes: number[] = [];
      for (let i = 1; i < contexts.length; i++) {
        const renderStart = Date.now();
        await handlebarsEngine.render(template, contexts[i]);
        subsequentTimes.push(Date.now() - renderStart);
      }

      const averageSubsequentTime = subsequentTimes.reduce((sum, time) => sum + time, 0) / subsequentTimes.length;

      expect(firstResult.content).toContain('Title 0');
      expect(averageSubsequentTime).toBeLessThan(firstRenderTime); // Cached should be faster
      expect(averageSubsequentTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TEMPLATE_RENDER_TIME / 10); // Very fast

      logger.info('Template caching performance', {
        firstRenderTimeMs: firstRenderTime,
        averageSubsequentTimeMs: Math.round(averageSubsequentTime),
        performanceImprovement: Math.round(((firstRenderTime - averageSubsequentTime) / firstRenderTime) * 100),
        subsequentRenders: subsequentTimes.length,
      });
    });
  });

  describe('Memory and Resource Management Tests', () => {
    test('should not have memory leaks in repeated operations', async () => {
      const getMemoryUsage = () => {
        const memInfo = process.memoryUsage();
        return {
          heapUsed: memInfo.heapUsed,
          heapTotal: memInfo.heapTotal,
          external: memInfo.external,
        };
      };

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = getMemoryUsage();

      // Perform repeated operations
      for (let i = 0; i < PERFORMANCE_THRESHOLDS.MEMORY_LEAK_ITERATIONS; i++) {
        // Create and validate curriculum data
        const testData = {
          grade: 3,
          subject: 'Mathematics',
          source: 'memory-test.csv',
          expectations: Array.from({ length: 10 }, (_, j) => ({
            code: `A${i}.${j}`,
            description: `Memory test expectation ${i}-${j}`,
            type: 'specific' as const,
            strand: 'Test Strand',
            keywords: [`test${i}`, `memory${j}`],
          })),
        };

        curriculumValidator.validate(testData);

        // Render template
        const template = {
          id: `memory-test-${i}`,
          name: 'Memory Test Template',
          content: '<h1>{{title}}</h1><p>Iteration: {{iteration}}</p>',
          format: 'html',
          engine: 'handlebars',
          variables: ['title', 'iteration'],
        };

        await handlebarsEngine.render(template, {
          data: { title: 'Memory Test', iteration: i },
          helpers: {},
          partials: {},
        });

        // Clear template cache periodically
        if (i % 10 === 0) {
          handlebarsEngine.clearCache();
        }
      }

      // Force garbage collection again
      if (global.gc) {
        global.gc();
      }

      const finalMemory = getMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.heapUsed) * 100;

      // Memory increase should be reasonable (less than 50% increase)
      expect(memoryIncreasePercent).toBeLessThan(50);

      logger.info('Memory leak test completed', {
        iterations: PERFORMANCE_THRESHOLDS.MEMORY_LEAK_ITERATIONS,
        initialMemoryMB: Math.round(initialMemory.heapUsed / 1024 / 1024),
        finalMemoryMB: Math.round(finalMemory.heapUsed / 1024 / 1024),
        memoryIncreaseMB: Math.round(memoryIncrease / 1024 / 1024),
        memoryIncreasePercent: Math.round(memoryIncreasePercent),
      });
    });

    test('should handle resource cleanup properly', async () => {
      // Test service cleanup
      const testOrchestrator = TemplateOrchestrator.getInstance();
      await testOrchestrator.initialize();

      // Perform operations to allocate resources
      const template = {
        id: 'cleanup-test',
        name: 'Cleanup Test',
        content: '<div>{{content}}</div>',
        format: 'html',
        engine: 'handlebars',
        variables: ['content'],
      };

      for (let i = 0; i < 10; i++) {
        await handlebarsEngine.render(template, {
          data: { content: `Test content ${i}` },
          helpers: {},
          partials: {},
        });
      }

      // Cleanup should not throw errors
      await expect(testOrchestrator.cleanup()).resolves.not.toThrow();

      // Should be able to initialize again after cleanup
      await expect(testOrchestrator.initialize()).resolves.not.toThrow();

      logger.info('Resource cleanup test completed successfully');
    });
  });

  describe('Real-World Scenario Performance Tests', () => {
    test('should handle typical teacher workflow efficiently', async () => {
      if (!ENABLE_AI_PERFORMANCE_TESTS) {
        test.skip();
        return;
      }

      // Simulate a typical teacher workflow:
      // 1. Import curriculum
      // 2. Generate lesson plan
      // 3. Render lesson plan template
      // 4. Validate curriculum data

      const workflowStartTime = Date.now();

      // Step 1: Import curriculum
      const curriculumCsv = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,3,Mathematics,"Read and write numbers to 1000"
A1.2,Number Sense,3,Mathematics,"Compare and order numbers"
B1.1,Measurement,3,Mathematics,"Measure length and height"`;

      const csvPath = path.join(tempDir, 'workflow-curriculum.csv');
      await fs.writeFile(csvPath, curriculumCsv, 'utf8');
      const fileBuffer = await fs.readFile(csvPath);

      const step1Start = Date.now();
      const importResult = await curriculumOrchestrator.importFromFile(fileBuffer, {
        userId: testUser.id,
        filename: 'workflow-curriculum.csv',
      });
      const step1Time = Date.now() - step1Start;

      expect(importResult.success).toBe(true);

      // Step 2: Generate lesson plan
      const step2Start = Date.now();
      const lessonResult = await aiService.generateLesson({
        grade: '3',
        subject: 'Mathematics',
        topic: 'Number Recognition',
        duration: 45,
      });
      const step2Time = Date.now() - step2Start;

      expect(lessonResult).toHaveProperty('title');

      // Step 3: Render lesson plan
      const step3Start = Date.now();
      const templateResult = await handlebarsEngine.render({
        id: 'workflow-template',
        name: 'Workflow Template',
        content: '<h1>{{lesson.title}}</h1><p>Grade: {{lesson.grade}}</p>',
        format: 'html',
        engine: 'handlebars',
        variables: ['lesson'],
      }, {
        data: { lesson: lessonResult },
        helpers: {},
        partials: {},
      });
      const step3Time = Date.now() - step3Start;

      expect(templateResult.content).toContain(lessonResult.title);

      // Step 4: Validate additional curriculum
      const step4Start = Date.now();
      const validationResult = curriculumValidator.validate({
        grade: 3,
        subject: 'Mathematics',
        source: 'additional-curriculum.csv',
        expectations: [
          {
            code: 'C1.1',
            description: 'Identify 2D shapes',
            type: 'specific',
            strand: 'Geometry',
            keywords: ['shapes'],
          },
        ],
      });
      const step4Time = Date.now() - step4Start;

      expect(validationResult.isValid).toBe(true);

      const totalWorkflowTime = Date.now() - workflowStartTime;

      // Performance expectations for complete workflow
      expect(step1Time).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE_OPERATION_TIME);
      expect(step2Time).toBeLessThan(PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME);
      expect(step3Time).toBeLessThan(PERFORMANCE_THRESHOLDS.TEMPLATE_RENDER_TIME);
      expect(step4Time).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATION_TIME);
      expect(totalWorkflowTime).toBeLessThan(PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME + 5000); // AI + 5 seconds for other steps

      logger.info('Teacher workflow performance test completed', {
        step1_ImportTimeMs: step1Time,
        step2_AIGenerationTimeMs: step2Time,
        step3_TemplateRenderTimeMs: step3Time,
        step4_ValidationTimeMs: step4Time,
        totalWorkflowTimeMs: totalWorkflowTime,
        workflowEfficiency: Math.round((totalWorkflowTime / (step1Time + step2Time + step3Time + step4Time)) * 100),
      });
    }, PERFORMANCE_THRESHOLDS.AI_RESPONSE_TIME + 10000); // Allow extra time for complete workflow
  });
});