/**
 * Mock Stability Validation Test
 *
 * This test validates that all database and file parsing mocks are working correctly
 * and that there are no mock state bleeding issues between tests.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { unifiedPrismaClient } from '../mocks/database.unified.mock';
import { mockPdfParse, mockMammoth, mockDocxParser } from '../mocks/file-parsing.mock';
import { DatabaseTestIsolation } from '../utils/database-test-isolation';

describe('Mock Stability Validation', () => {
  beforeEach(() => {
    DatabaseTestIsolation.setupCleanTestState();
  });

  afterEach(() => {
    DatabaseTestIsolation.performCompleteReset();
  });

  describe('Database Mock Stability', () => {
    it('should have all required models available', () => {
      const requiredModels = [
        'user',
        'outcome',
        'outcomeEmbedding',
        'curriculumExpectation',
        'curriculumExpectationEmbedding',
        'curriculumImport',
        'outcomeCluster',
        'subject',
        'milestone',
        'activity',
        'lessonPlan',
        'longRangePlan',
      ];

      requiredModels.forEach((modelName) => {
        expect(unifiedPrismaClient).toHaveProperty(modelName);
        const model = (unifiedPrismaClient as any)[modelName];
        expect(model).toBeDefined();
        expect(model.findUnique).toBeDefined();
        expect(model.findMany).toBeDefined();
        expect(model.create).toBeDefined();
        expect(model.update).toBeDefined();
        expect(model.delete).toBeDefined();
      });
    });

    it('should handle CRUD operations correctly', async () => {
      const testData = {
        id: 'test-id',
        description: 'Test curriculum expectation',
        code: 'TEST-001',
        subject: 'Mathematics',
        grade: 1,
      };

      // Test create operation
      const created = await unifiedPrismaClient.curriculumExpectation.create({
        data: testData,
      });
      expect(created).toMatchObject(testData);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();

      // Test findUnique operation
      const found = await unifiedPrismaClient.curriculumExpectation.findUnique({
        where: { id: testData.id },
      });
      expect(found).toMatchObject({
        ...testData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Test update operation
      const updateData = { description: 'Updated description' };
      const updated = await unifiedPrismaClient.curriculumExpectation.update({
        where: { id: testData.id },
        data: updateData,
      });
      expect(updated.description).toBe(updateData.description);

      // Test delete operation
      const deleted = await unifiedPrismaClient.curriculumExpectation.delete({
        where: { id: testData.id },
      });
      expect(deleted).toMatchObject({
        ...testData,
        ...updateData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle createMany operation correctly', async () => {
      const testData = [
        { description: 'Test 1', code: 'T1', subject: 'Math', grade: 1 },
        { description: 'Test 2', code: 'T2', subject: 'Math', grade: 1 },
      ];

      const result = await unifiedPrismaClient.curriculumExpectation.createMany({
        data: testData,
      });
      expect(result.count).toBe(2);
    });

    it('should handle transactions correctly', async () => {
      const result = await unifiedPrismaClient.$transaction(async (tx) => {
        const created = await tx.curriculumExpectation.create({
          data: {
            description: 'Transaction test',
            code: 'TXN-001',
            subject: 'Math',
            grade: 1,
          },
        });
        return created;
      });

      expect(result).toBeDefined();
      expect(result.description).toBe('Transaction test');
    });

    it('should isolate data between tests', async () => {
      // This test should not see data from previous tests
      const allData = unifiedPrismaClient.getMockData('curriculumExpectation');
      expect(allData).toHaveLength(0);
    });
  });

  describe('File Parsing Mock Stability', () => {
    it('should have PDF parsing mock available', async () => {
      expect(mockPdfParse).toBeDefined();

      const mockBuffer = Buffer.from('Mock PDF content');
      const result = await mockPdfParse(mockBuffer);

      expect(result).toBeDefined();
      expect(result.text).toContain('Mock PDF Content');
      expect(result.numpages).toBe(1);
    });

    it('should have DOCX parsing mock available', async () => {
      expect(mockDocxParser.parseAsync).toBeDefined();

      const mockBuffer = Buffer.from('Mock DOCX content');
      const result = await mockDocxParser.parseAsync(mockBuffer);

      expect(result).toBeDefined();
      expect(result.text).toContain('Mock DOCX Content');
      expect(result.paragraphs).toBeDefined();
    });

    it('should have Mammoth parsing mock available', async () => {
      expect(mockMammoth.extractRawText).toBeDefined();
      expect(mockMammoth.convertToHtml).toBeDefined();

      const mockOptions = { buffer: Buffer.from('Mock content') };

      const textResult = await mockMammoth.extractRawText(mockOptions);
      expect(textResult.value).toContain('Mock DOCX Content');

      const htmlResult = await mockMammoth.convertToHtml(mockOptions);
      expect(htmlResult.value).toContain('<p>Mock DOCX Content</p>');
    });
  });

  describe('Mock Error Handling', () => {
    it('should handle database errors correctly', async () => {
      const testError = new Error('Database connection failed');
      unifiedPrismaClient.setupError('curriculumExpectation', 'create', testError);

      await expect(
        unifiedPrismaClient.curriculumExpectation.create({
          data: { description: 'Test', code: 'T1', subject: 'Math', grade: 1 },
        }),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle file parsing errors correctly', async () => {
      const testError = new Error('Invalid PDF format');
      mockPdfParse.mockRejectedValueOnce(testError);

      await expect(mockPdfParse(Buffer.from('invalid content'))).rejects.toThrow(
        'Invalid PDF format',
      );
    });
  });

  describe('Mock Performance', () => {
    it('should perform database operations quickly', () => {
      const { duration } = DatabaseTestIsolation.measureMockPerformance(() => {
        return unifiedPrismaClient.curriculumExpectation.findMany();
      });

      // Mock operations should be very fast (under 1ms)
      expect(duration).toBeLessThan(1);
    });

    it('should reset state efficiently', () => {
      // Add some data first
      unifiedPrismaClient.seedData('curriculumExpectation', [
        { id: '1', description: 'Test 1', code: 'T1', subject: 'Math', grade: 1 },
        { id: '2', description: 'Test 2', code: 'T2', subject: 'Math', grade: 1 },
      ]);

      const { duration } = DatabaseTestIsolation.measureMockPerformance(() => {
        DatabaseTestIsolation.performCompleteReset();
      });

      // Reset should be fast (under 5ms)
      expect(duration).toBeLessThan(5);

      // Verify reset worked
      const data = unifiedPrismaClient.getMockData('curriculumExpectation');
      expect(data).toHaveLength(0);
    });
  });

  describe('Mock Validation', () => {
    it('should validate that no real database connections are made', () => {
      expect(() => {
        DatabaseTestIsolation.verifyNoRealDatabaseConnections();
      }).not.toThrow();
    });

    it('should provide proper TypeScript types', () => {
      // This test validates that TypeScript compilation works correctly
      const client = unifiedPrismaClient;

      // These should compile without TypeScript errors
      expect(typeof client.curriculumExpectation.findUnique).toBe('function');
      expect(typeof client.$transaction).toBe('function');
      expect(typeof client.$connect).toBe('function');
      expect(typeof client.$disconnect).toBe('function');
    });
  });
});
