/**
 * Curriculum Import Orchestrator Integration Tests
 * Tests real curriculum import flows with actual file processing and database operations
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { CurriculumImportOrchestrator } from '../CurriculumImportOrchestrator';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Real database connection for tests
const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL,
});

describe('CurriculumImportOrchestrator Integration Tests', () => {
  let orchestrator: CurriculumImportOrchestrator;
  let testUser: { id: number; email: string };
  let testFilesDir: string;

  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: `curriculum-test-${Date.now()}@example.com`,
        password: 'hashed',
        name: 'Curriculum Test User',
        role: 'teacher',
      },
    });

    // Create temporary directory for test files
    testFilesDir = path.join(__dirname, 'test-files');
    await fs.mkdir(testFilesDir, { recursive: true });

    // Initialize orchestrator with real dependencies
    orchestrator = new CurriculumImportOrchestrator();
  });

  afterAll(async () => {
    // Clean up test user and related data
    if (testUser) {
      await prisma.curriculumImport.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }

    // Clean up test files
    await fs.rm(testFilesDir, { recursive: true, force: true });

    await prisma.$disconnect();
  });

  describe('CSV Import', () => {
    test('should import valid CSV file with curriculum data', async () => {
      // Create test CSV file
      const csvContent = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,5,Mathematics,Understand place value to 1000000
A1.2,Number Sense,5,Mathematics,Compare and order whole numbers
A2.1,Measurement,5,Mathematics,Estimate and measure length
B1.1,Patterning,5,Mathematics,Identify and extend patterns`;

      const csvPath = path.join(testFilesDir, 'valid-curriculum.csv');
      await fs.writeFile(csvPath, csvContent);

      // Import the file
      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      // Verify import session was created
      expect(result.importId).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.totalExpectations).toBe(4);
      expect(result.successCount).toBe(4);
      expect(result.errorCount).toBe(0);

      // Verify expectations were created in database
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          curriculumImports: {
            some: { id: result.importId },
          },
        },
      });

      expect(expectations).toHaveLength(4);
      expect(expectations[0]).toMatchObject({
        expectation: 'A1.1',
        strand: 'Number Sense',
        grade: '5',
        subject: 'Mathematics',
        description: 'Understand place value to 1000000',
      });
    });

    test('should handle CSV with missing required fields', async () => {
      const invalidCsv = `Code,Description
A1.1,Missing required fields
A1.2,Also missing fields`;

      const csvPath = path.join(testFilesDir, 'invalid-curriculum.csv');
      await fs.writeFile(csvPath, invalidCsv);

      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      expect(result.status).toBe('completed_with_errors');
      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]).toContain('Missing required field');
    });

    test('should handle duplicate curriculum codes', async () => {
      const csvWithDuplicates = `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,5,Mathematics,First version
A1.1,Number Sense,5,Mathematics,Duplicate code`;

      const csvPath = path.join(testFilesDir, 'duplicate-curriculum.csv');
      await fs.writeFile(csvPath, csvWithDuplicates);

      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      // Should import first occurrence, skip duplicate
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toContain('Duplicate');
    });

    test('should support different CSV encodings', async () => {
      // UTF-8 with BOM
      const csvWithBOM = '\ufeff' + `Code,Strand,Grade,Subject,Description
A1.1,Number Sense,5,Mathematics,UTF-8 with BOM test`;

      const csvPath = path.join(testFilesDir, 'bom-curriculum.csv');
      await fs.writeFile(csvPath, csvWithBOM);

      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });
  });

  describe('JSON Import', () => {
    test('should import valid JSON file with curriculum data', async () => {
      const jsonData = {
        curriculum: [
          {
            code: 'B1.1',
            strand: 'Geometry',
            grade: 6,
            subject: 'Mathematics',
            description: 'Classify triangles by angles and sides',
            examples: ['Equilateral', 'Isosceles', 'Scalene'],
          },
          {
            code: 'B1.2',
            strand: 'Geometry',
            grade: 6,
            subject: 'Mathematics',
            description: 'Calculate area of triangles',
          },
        ],
      };

      const jsonPath = path.join(testFilesDir, 'curriculum.json');
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      const result = await orchestrator.importFromJSON(testUser.id, jsonPath);

      expect(result.status).toBe('completed');
      expect(result.successCount).toBe(2);

      // Verify data with examples was imported
      const expectation = await prisma.curriculumExpectation.findFirst({
        where: { expectation: 'B1.1' },
      });

      expect(expectation?.examples).toEqual(['Equilateral', 'Isosceles', 'Scalene']);
    });

    test('should validate JSON schema', async () => {
      const invalidJson = {
        wrongFormat: 'This is not valid curriculum data',
      };

      const jsonPath = path.join(testFilesDir, 'invalid.json');
      await fs.writeFile(jsonPath, JSON.stringify(invalidJson));

      await expect(orchestrator.importFromJSON(testUser.id, jsonPath))
        .rejects.toThrow('Invalid JSON format');
    });
  });

  describe('Batch Import with Clustering', () => {
    test('should import and cluster related expectations', async () => {
      const relatedExpectations = `Code,Strand,Grade,Subject,Description
C1.1,Data Management,7,Mathematics,Collect and organize data
C1.2,Data Management,7,Mathematics,Create and interpret graphs
C1.3,Data Management,7,Mathematics,Analyze data trends
C2.1,Probability,7,Mathematics,Calculate theoretical probability
C2.2,Probability,7,Mathematics,Conduct probability experiments`;

      const csvPath = path.join(testFilesDir, 'clustered-curriculum.csv');
      await fs.writeFile(csvPath, relatedExpectations);

      const result = await orchestrator.importWithClustering(testUser.id, csvPath, {
        enableClustering: true,
        clusteringThreshold: 0.7,
      });

      expect(result.clusters).toBeDefined();
      expect(result.clusters.length).toBeGreaterThan(0);

      // Data Management expectations should be clustered together
      const dataCluster = result.clusters.find(c => 
        c.expectations.some(e => e.code === 'C1.1')
      );
      expect(dataCluster).toBeDefined();
      expect(dataCluster?.expectations.length).toBe(3);
    });
  });

  describe('Import Progress Tracking', () => {
    test('should track import progress for large files', async () => {
      // Create a larger CSV file
      const rows = ['Code,Strand,Grade,Subject,Description'];
      for (let i = 1; i <= 100; i++) {
        rows.push(`D${i}.1,Test Strand,8,Mathematics,Test expectation ${i}`);
      }

      const largeCsvPath = path.join(testFilesDir, 'large-curriculum.csv');
      await fs.writeFile(largeCsvPath, rows.join('\n'));

      let progressUpdates = 0;
      const result = await orchestrator.importFromCSV(testUser.id, largeCsvPath, {
        onProgress: (progress) => {
          progressUpdates++;
          expect(progress.current).toBeLessThanOrEqual(progress.total);
          expect(progress.percentage).toBeLessThanOrEqual(100);
        },
      });

      expect(result.successCount).toBe(100);
      expect(progressUpdates).toBeGreaterThan(0);
    });
  });

  describe('Export After Import', () => {
    test('should export imported curriculum in different formats', async () => {
      // First import some data
      const importData = `Code,Strand,Grade,Subject,Description
E1.1,Science Skills,9,Science,Plan scientific investigations
E1.2,Science Skills,9,Science,Collect and record data`;

      const csvPath = path.join(testFilesDir, 'export-test.csv');
      await fs.writeFile(csvPath, importData);

      const importResult = await orchestrator.importFromCSV(testUser.id, csvPath);

      // Export as JSON
      const jsonExport = await orchestrator.exportToJSON(importResult.importId);
      expect(jsonExport.curriculum).toHaveLength(2);
      expect(jsonExport.metadata.exportDate).toBeDefined();

      // Export as CSV
      const csvExport = await orchestrator.exportToCSV(importResult.importId);
      expect(csvExport).toContain('E1.1');
      expect(csvExport).toContain('E1.2');
    });
  });

  describe('Import Validation and Transformation', () => {
    test('should transform grade levels correctly', async () => {
      const gradeVariations = `Code,Strand,Grade,Subject,Description
F1.1,Test,K,Mathematics,Kindergarten expectation
F1.2,Test,Grade 1,Mathematics,Grade 1 expectation
F1.3,Test,9-10,Mathematics,Grade 9-10 expectation`;

      const csvPath = path.join(testFilesDir, 'grade-variations.csv');
      await fs.writeFile(csvPath, gradeVariations);

      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          expectation: { startsWith: 'F1.' },
        },
        orderBy: { expectation: 'asc' },
      });

      expect(expectations[0].grade).toBe('K');
      expect(expectations[1].grade).toBe('1');
      expect(expectations[2].grade).toBe('9-10');
    });

    test('should handle special characters in descriptions', async () => {
      const specialChars = `Code,Strand,Grade,Subject,Description
G1.1,Test,5,Mathematics,"Use symbols like <, >, = to compare"
G1.2,Test,5,Mathematics,"Calculate 50% of quantities"`;

      const csvPath = path.join(testFilesDir, 'special-chars.csv');
      await fs.writeFile(csvPath, specialChars);

      const result = await orchestrator.importFromCSV(testUser.id, csvPath);

      expect(result.successCount).toBe(2);

      const expectations = await prisma.curriculumExpectation.findMany({
        where: { expectation: { startsWith: 'G1.' } },
      });

      expect(expectations[0].description).toContain('<');
      expect(expectations[1].description).toContain('50%');
    });
  });

  describe('Error Recovery', () => {
    test('should handle file read errors gracefully', async () => {
      const nonExistentPath = path.join(testFilesDir, 'does-not-exist.csv');

      await expect(orchestrator.importFromCSV(testUser.id, nonExistentPath))
        .rejects.toThrow();
    });

    test('should rollback on database errors', async () => {
      // Create a CSV that will cause a constraint violation
      const csvContent = `Code,Strand,Grade,Subject,Description
${'X'.repeat(100)}.1,Test,5,Mathematics,Code too long`;

      const csvPath = path.join(testFilesDir, 'constraint-violation.csv');
      await fs.writeFile(csvPath, csvContent);

      const countBefore = await prisma.curriculumExpectation.count();

      try {
        await orchestrator.importFromCSV(testUser.id, csvPath);
      } catch (error: unknown) {
        // Expected to fail
      }

      const countAfter = await prisma.curriculumExpectation.count();
      expect(countAfter).toBe(countBefore); // No partial data should be saved
    });
  });

  describe('Performance', () => {
    test('should handle concurrent imports efficiently', async () => {
      // Create multiple CSV files
      const csvPromises = [];
      for (let i = 0; i < 3; i++) {
        const csvContent = `Code,Strand,Grade,Subject,Description
H${i}.1,Test,5,Mathematics,Concurrent test ${i}`;
        const csvPath = path.join(testFilesDir, `concurrent-${i}.csv`);
        csvPromises.push(fs.writeFile(csvPath, csvContent));
      }
      await Promise.all(csvPromises);

      // Import concurrently
      const importPromises = [];
      for (let i = 0; i < 3; i++) {
        const csvPath = path.join(testFilesDir, `concurrent-${i}.csv`);
        importPromises.push(orchestrator.importFromCSV(testUser.id, csvPath));
      }

      const results = await Promise.all(importPromises);

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe('completed');
        expect(result.successCount).toBe(1);
      });
    });
  });
});