/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real Curriculum Import Orchestrator Tests
 * Testing actual file parsing, database operations, and data transformation
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { CurriculumImportOrchestrator } from '../CurriculumImportOrchestrator';
import { prisma } from '../../../prisma';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../../logger';

// Real test data
const REAL_CSV_CONTENT = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,3,Mathematics,"Read and write numbers to 1000"
A1.2,Number Sense,3,Mathematics,"Compare and order numbers to 1000"
A1.3,Number Sense,3,Mathematics,"Understand place value to hundreds"
B1.1,Measurement,3,Mathematics,"Measure length using standard units"
B1.2,Measurement,3,Mathematics,"Tell time to the nearest minute"
C1.1,Geometry,3,Mathematics,"Identify 2D and 3D shapes"`;

const REAL_JSON_CONTENT = {
  subject: "Science",
  grade: 4,
  expectations: [
    {
      code: "S4.1",
      strand: "Life Systems",
      description: "Demonstrate understanding of animal habitats"
    },
    {
      code: "S4.2", 
      strand: "Matter and Energy",
      description: "Investigate properties of light and sound"
    },
    {
      code: "S4.3",
      strand: "Earth and Space",
      description: "Identify components of soil"
    }
  ]
};

describe('CurriculumImportOrchestrator - Real Implementation Tests', () => {
  let orchestrator: CurriculumImportOrchestrator;
  let testUserId: number;
  let tempDir: string;
  let testUser: any;

  beforeAll(async () => {
    // Create temporary directory for test files
    tempDir = path.join(__dirname, '../../../../temp-test-files');
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up temporary directory
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    orchestrator = CurriculumImportOrchestrator.getInstance();
    await orchestrator.initialize();

    // Create a real test user
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'TEACHER',
        hashedPassword: 'test-hash',
      },
    });
    testUserId = testUser.id;

    logger.info('Test setup complete', { testUserId });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.curriculumExpectation.deleteMany({
      where: {
        subject: {
          userId: testUserId,
        },
      },
    });
    
    await prisma.subject.deleteMany({
      where: {
        userId: testUserId,
      },
    });

    await prisma.curriculumImport.deleteMany({
      where: {
        userId: testUserId,
      },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('Real File Parsing', () => {
    test('should parse real CSV file content', async () => {
      const csvPath = path.join(tempDir, 'test-curriculum.csv');
      await fs.writeFile(csvPath, REAL_CSV_CONTENT, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'test-curriculum.csv',
        validate: true,
        dryRun: true, // Don't save to DB for this test
      });

      expect(result.success).toBe(true);
      expect(result.stats.totalExpectations).toBe(6);
      expect(result.validation?.isValid).toBe(true);
      
      logger.info('CSV parsing test completed', {
        totalExpectations: result.stats.totalExpectations,
        isValid: result.validation?.isValid,
      });
    });

    test('should parse real JSON file content', async () => {
      const jsonPath = path.join(tempDir, 'test-curriculum.json');
      await fs.writeFile(jsonPath, JSON.stringify(REAL_JSON_CONTENT, null, 2), 'utf8');

      const fileBuffer = await fs.readFile(jsonPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'test-curriculum.json',
        validate: true,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.stats.totalExpectations).toBe(3);
      expect(result.validation?.isValid).toBe(true);

      logger.info('JSON parsing test completed', {
        totalExpectations: result.stats.totalExpectations,
        isValid: result.validation?.isValid,
      });
    });

    test('should handle malformed CSV content', async () => {
      const malformedCsv = `Code,Strand,Grade
A1.1,Number Sense
Invalid line with missing columns
A1.2,Geometry,3,Mathematics,"Valid line after invalid"`;

      const csvPath = path.join(tempDir, 'malformed.csv');
      await fs.writeFile(csvPath, malformedCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'malformed.csv',
        validate: true,
        dryRun: true,
      });

      // Should handle malformed content gracefully
      expect(result.validation).toBeDefined();
      if (result.validation?.errors) {
        expect(result.validation.errors.length).toBeGreaterThan(0);
      }

      logger.info('Malformed CSV test completed', {
        success: result.success,
        errorCount: result.validation?.errors?.length || 0,
      });
    });
  });

  describe('Real Database Operations', () => {
    test('should create new curriculum data in database', async () => {
      const csvPath = path.join(tempDir, 'math-curriculum.csv');
      await fs.writeFile(csvPath, REAL_CSV_CONTENT, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'math-curriculum.csv',
        validate: true,
        overwrite: false,
      });

      expect(result.success).toBe(true);
      expect(result.stats.created).toBeGreaterThan(0);
      expect(result.subjectId).toBeDefined();

      // Verify data was actually saved to database
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
        include: {
          subject: true,
        },
      });

      expect(savedExpectations.length).toBe(6);
      expect(savedExpectations[0].subject.name).toBe('Mathematics');
      expect(savedExpectations[0].grade).toBe(3);

      // Verify specific expectation content
      const numberSenseExpectations = savedExpectations.filter(
        e => e.strand === 'Number Sense'
      );
      expect(numberSenseExpectations.length).toBe(3);

      logger.info('Database creation test completed', {
        created: result.stats.created,
        subjectId: result.subjectId,
        savedCount: savedExpectations.length,
      });
    });

    test('should update existing curriculum data', async () => {
      // First import
      const csvPath = path.join(tempDir, 'initial-curriculum.csv');
      await fs.writeFile(csvPath, REAL_CSV_CONTENT, 'utf8');
      const fileBuffer1 = await fs.readFile(csvPath);

      const result1 = await orchestrator.importFromFile(fileBuffer1, {
        userId: testUserId,
        filename: 'initial-curriculum.csv',
        overwrite: false,
      });

      expect(result1.success).toBe(true);
      expect(result1.stats.created).toBe(6);

      // Second import with modified data
      const updatedContent = REAL_CSV_CONTENT.replace(
        'Read and write numbers to 1000',
        'Read and write numbers to 1000 with confidence'
      );

      const csvPath2 = path.join(tempDir, 'updated-curriculum.csv');
      await fs.writeFile(csvPath2, updatedContent, 'utf8');
      const fileBuffer2 = await fs.readFile(csvPath2);

      const result2 = await orchestrator.importFromFile(fileBuffer2, {
        userId: testUserId,
        filename: 'updated-curriculum.csv',
        overwrite: true,
      });

      expect(result2.success).toBe(true);
      expect(result2.stats.updated).toBeGreaterThan(0);

      // Verify update
      const updatedExpectation = await prisma.curriculumExpectation.findFirst({
        where: {
          code: 'A1.1',
          subject: {
            userId: testUserId,
          },
        },
      });

      expect(updatedExpectation?.description).toContain('with confidence');

      logger.info('Database update test completed', {
        updated: result2.stats.updated,
        newDescription: updatedExpectation?.description,
      });
    });

    test('should handle concurrent imports safely', async () => {
      const createCsvContent = (prefix: string) => `Code,Strand,Grade,Subject,Description
${prefix}1.1,Number Sense,2,Mathematics,"First expectation for ${prefix}"
${prefix}1.2,Number Sense,2,Mathematics,"Second expectation for ${prefix}"`;

      const csv1Path = path.join(tempDir, 'concurrent1.csv');
      const csv2Path = path.join(tempDir, 'concurrent2.csv');
      
      await fs.writeFile(csv1Path, createCsvContent('A'), 'utf8');
      await fs.writeFile(csv2Path, createCsvContent('B'), 'utf8');

      const fileBuffer1 = await fs.readFile(csv1Path);
      const fileBuffer2 = await fs.readFile(csv2Path);

      // Run concurrent imports
      const [result1, result2] = await Promise.all([
        orchestrator.importFromFile(fileBuffer1, {
          userId: testUserId,
          filename: 'concurrent1.csv',
        }),
        orchestrator.importFromFile(fileBuffer2, {
          userId: testUserId,
          filename: 'concurrent2.csv',
        }),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Verify both imports succeeded
      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
      });

      expect(allExpectations.length).toBe(4);

      logger.info('Concurrent import test completed', {
        result1Created: result1.stats.created,
        result2Created: result2.stats.created,
        totalExpectations: allExpectations.length,
      });
    });
  });

  describe('Real Data Validation', () => {
    test('should validate curriculum structure with real data', async () => {
      const invalidCsv = `Code,Strand,Grade,Subject,Description
,Number Sense,3,Mathematics,"Missing code"
A1.2,Invalid-Strand!,3,Mathematics,"Invalid strand characters"
A1.3,Number Sense,InvalidGrade,Mathematics,"Invalid grade"
A1.4,Number Sense,3,,"Missing subject"
A1.5,Number Sense,3,Mathematics,""`;

      const csvPath = path.join(tempDir, 'invalid-curriculum.csv');
      await fs.writeFile(csvPath, invalidCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'invalid-curriculum.csv',
        validate: true,
        validationOptions: {
          strictMode: true,
          allowEmptyFields: false,
        },
      });

      expect(result.validation).toBeDefined();
      expect(result.validation?.isValid).toBe(false);
      expect(result.validation?.errors.length).toBeGreaterThan(0);

      // Should not save invalid data
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
      });

      expect(savedExpectations.length).toBe(0);

      logger.info('Validation test completed', {
        isValid: result.validation?.isValid,
        errorCount: result.validation?.errors.length,
        savedCount: savedExpectations.length,
      });
    });

    test('should validate against real curriculum standards', async () => {
      const validOntarioCsv = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense and Numeration,3,Mathematics,"demonstrate an understanding of numbers up to 1000"
B1.1,Measurement,3,Mathematics,"estimate, measure, and record length"
C1.1,Geometry and Spatial Sense,3,Mathematics,"identify and compare various polygons"
D1.1,Patterning and Algebra,3,Mathematics,"identify, extend, and create repeating patterns"
E1.1,Data Management and Probability,3,Mathematics,"collect and organize primary data"`;

      const csvPath = path.join(tempDir, 'ontario-curriculum.csv');
      await fs.writeFile(csvPath, validOntarioCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'ontario-curriculum.csv',
        validate: true,
        validationOptions: {
          strictMode: false,
          allowEmptyFields: false,
          validateStandards: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result.validation?.isValid).toBe(true);
      expect(result.stats.created).toBe(5);

      // Verify all curriculum strands were recognized
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
        distinct: ['strand'],
      });

      const strands = savedExpectations.map(e => e.strand);
      expect(strands).toContain('Number Sense and Numeration');
      expect(strands).toContain('Measurement');
      expect(strands).toContain('Geometry and Spatial Sense');

      logger.info('Standards validation test completed', {
        created: result.stats.created,
        uniqueStrands: strands.length,
      });
    });
  });

  describe('Real Data Transformation', () => {
    test('should transform and normalize real curriculum data', async () => {
      const mixedFormatCsv = `Code,Strand,Grade,Subject,Description
a1.1,number sense,3,math,"read numbers to 1000"
A1.2,NUMBER SENSE,3,MATHEMATICS,"write numbers to 1000"
A.1.3,"Number Sense",3," Mathematics ","compare numbers"`;

      const csvPath = path.join(tempDir, 'mixed-format.csv');
      await fs.writeFile(csvPath, mixedFormatCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'mixed-format.csv',
      });

      expect(result.success).toBe(true);

      // Verify normalization
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
        include: {
          subject: true,
        },
      });

      expect(savedExpectations.length).toBe(3);

      // Check normalization
      savedExpectations.forEach(expectation => {
        expect(expectation.code).toMatch(/^[A-Z]\d+\.\d+$/); // Normalized code format
        expect(expectation.strand).toBe('Number Sense'); // Normalized strand
        expect(expectation.subject.name).toBe('Mathematics'); // Normalized subject
        expect(expectation.description).not.toMatch(/^\s+|\s+$/); // Trimmed description
      });

      logger.info('Data transformation test completed', {
        normalizedCount: savedExpectations.length,
        sampleCode: savedExpectations[0]?.code,
        sampleStrand: savedExpectations[0]?.strand,
      });
    });

    test('should merge duplicate expectations intelligently', async () => {
      const duplicatesCsv = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,3,Mathematics,"Read and write numbers to 1000"
A1.1,Number Sense,3,Mathematics,"Read and write numbers up to 1000"
A1.2,Number Sense,3,Mathematics,"Compare numbers"
A1.2,Number Sense,3,Mathematics,"Compare and order numbers"`;

      const csvPath = path.join(tempDir, 'duplicates.csv');
      await fs.writeFile(csvPath, duplicatesCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'duplicates.csv',
      });

      expect(result.success).toBe(true);

      // Should merge duplicates
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
      });

      // Should have merged duplicates into 2 unique expectations
      expect(savedExpectations.length).toBe(2);

      const codes = savedExpectations.map(e => e.code);
      expect(codes).toContain('A1.1');
      expect(codes).toContain('A1.2');

      // Check that the better description was kept
      const a11Expectation = savedExpectations.find(e => e.code === 'A1.1');
      expect(a11Expectation?.description).toContain('Read and write numbers');

      logger.info('Duplicate merging test completed', {
        uniqueExpectations: savedExpectations.length,
        mergedDescription: a11Expectation?.description,
      });
    });
  });

  describe('Real Performance Testing', () => {
    test('should handle large curriculum files efficiently', async () => {
      // Generate large curriculum data
      const largeCurriculumLines = ['Code,Strand,Grade,Subject,Description'];
      
      for (let grade = 1; grade <= 6; grade++) {
        for (let strand = 1; strand <= 5; strand++) {
          for (let expectation = 1; expectation <= 20; expectation++) {
            const code = `G${grade}S${strand}E${expectation}`;
            const strandName = `Strand ${strand}`;
            const description = `Learning expectation ${expectation} for grade ${grade} strand ${strand}`;
            largeCurriculumLines.push(`${code},${strandName},${grade},Mathematics,"${description}"`);
          }
        }
      }

      const largeCsv = largeCurriculumLines.join('\n');
      const csvPath = path.join(tempDir, 'large-curriculum.csv');
      await fs.writeFile(csvPath, largeCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const startTime = Date.now();
      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'large-curriculum.csv',
      });
      const importTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.stats.created).toBe(600); // 6 grades × 5 strands × 20 expectations

      // Should complete within reasonable time
      expect(importTime).toBeLessThan(30000); // 30 seconds

      // Verify data integrity
      const savedExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: {
            userId: testUserId,
          },
        },
      });

      expect(savedExpectations.length).toBe(600);

      // Check distribution across grades
      for (let grade = 1; grade <= 6; grade++) {
        const gradeExpectations = savedExpectations.filter(e => e.grade === grade);
        expect(gradeExpectations.length).toBe(100); // 5 strands × 20 expectations
      }

      logger.info('Large file performance test completed', {
        expectationsCreated: result.stats.created,
        importTimeMs: importTime,
        expectationsPerSecond: Math.round(result.stats.created / (importTime / 1000)),
      });
    }, 60000); // 60 second timeout

    test('should batch database operations for optimal performance', async () => {
      const batchTestLines = ['Code,Strand,Grade,Subject,Description'];
      
      // Create 150 expectations to test batching
      for (let i = 1; i <= 150; i++) {
        batchTestLines.push(`B${i},Batch Strand,4,Mathematics,"Batch expectation ${i}"`);
      }

      const batchCsv = batchTestLines.join('\n');
      const csvPath = path.join(tempDir, 'batch-test.csv');
      await fs.writeFile(csvPath, batchCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      // Monitor database calls (this would require instrumentation in production)
      const startTime = Date.now();
      const result = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'batch-test.csv',
      });
      const batchTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.stats.created).toBe(150);

      // Should be reasonably fast for 150 records
      expect(batchTime).toBeLessThan(10000); // 10 seconds

      logger.info('Batch performance test completed', {
        batchSize: result.stats.created,
        batchTimeMs: batchTime,
        recordsPerSecond: Math.round(result.stats.created / (batchTime / 1000)),
      });
    });
  });

  describe('Real Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      // Test with invalid file buffer
      const invalidBuffer = Buffer.from('', 'utf8');

      const result = await orchestrator.importFromFile(invalidBuffer, {
        userId: testUserId,
        filename: 'empty.csv',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
      expect(result.stats.errors).toBeGreaterThan(0);

      logger.info('File system error test completed', {
        success: result.success,
        message: result.message,
      });
    });

    test('should handle database constraint violations', async () => {
      const constraintTestCsv = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,3,Mathematics,"First expectation"`;

      const csvPath = path.join(tempDir, 'constraint-test.csv');
      await fs.writeFile(csvPath, constraintTestCsv, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      // Import once successfully
      const result1 = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'constraint-test.csv',
      });

      expect(result1.success).toBe(true);

      // Import again with different data but same code (should update, not fail)
      const updatedCsv = constraintTestCsv.replace(
        'First expectation',
        'Updated expectation'
      );

      const csvPath2 = path.join(tempDir, 'constraint-test-2.csv');
      await fs.writeFile(csvPath2, updatedCsv, 'utf8');

      const fileBuffer2 = await fs.readFile(csvPath2);

      const result2 = await orchestrator.importFromFile(fileBuffer2, {
        userId: testUserId,
        filename: 'constraint-test-2.csv',
        overwrite: true,
      });

      expect(result2.success).toBe(true);
      expect(result2.stats.updated).toBe(1);

      logger.info('Constraint handling test completed', {
        firstImport: result1.stats.created,
        secondImport: result2.stats.updated,
      });
    });
  });

  describe('Real Integration Testing', () => {
    test('should integrate with search service', async () => {
      // Import some curriculum data
      const csvPath = path.join(tempDir, 'search-test.csv');
      await fs.writeFile(csvPath, REAL_CSV_CONTENT, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const importResult = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'search-test.csv',
      });

      expect(importResult.success).toBe(true);

      // Test search functionality
      const searchResults = await orchestrator.searchExpectations({
        query: 'number',
        filters: { grade: 3 },
      });

      expect(Array.isArray(searchResults)).toBe(true);
      expect(searchResults.length).toBeGreaterThan(0);

      logger.info('Search integration test completed', {
        imported: importResult.stats.created,
        searchResults: searchResults.length,
      });
    });

    test('should integrate with stats service', async () => {
      // Import curriculum data
      const csvPath = path.join(tempDir, 'stats-test.csv');
      await fs.writeFile(csvPath, REAL_CSV_CONTENT, 'utf8');

      const fileBuffer = await fs.readFile(csvPath);

      const importResult = await orchestrator.importFromFile(fileBuffer, {
        userId: testUserId,
        filename: 'stats-test.csv',
      });

      expect(importResult.success).toBe(true);

      // Test stats functionality
      const overallStats = await orchestrator.getImportStats();
      const subjectStats = await orchestrator.getSubjectStats(importResult.subjectId!);
      const coverageStats = await orchestrator.getCoverageStats();

      expect(overallStats).toBeDefined();
      expect(subjectStats).toBeDefined();
      expect(coverageStats).toBeDefined();

      logger.info('Stats integration test completed', {
        subjectId: importResult.subjectId,
        hasOverallStats: !!overallStats,
        hasSubjectStats: !!subjectStats,
        hasCoverageStats: !!coverageStats,
      });
    });
  });
});