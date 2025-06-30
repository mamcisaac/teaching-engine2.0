import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { PrismaClient } from '@teaching-engine/database';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('Curriculum Import Performance Tests', () => {
  let service: CurriculumImportService;
  let userId: number;

  beforeAll(async () => {
    service = new CurriculumImportService();
    (service as any).prisma = prisma;

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'perf-test@example.com',
        name: 'Performance Test User',
        passwordHash: 'test',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.curriculumImport.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('CSV Parsing Performance', () => {
    it('should parse 1,000 rows in under 100ms', () => {
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(1000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description for expectation ${i},Mathematics,${(i % 12) + 1},Domain${i % 5}`)
        .join('\n');
      const csv = headers + rows;

      const startTime = performance.now();
      const result = service.parseCSV(csv);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100);
      console.log(`Parsed 1,000 rows in ${(endTime - startTime).toFixed(2)}ms`);
    });

    it('should parse 10,000 rows in under 1 second', () => {
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(10000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description for expectation ${i},Mathematics,${(i % 12) + 1},Domain${i % 5}`)
        .join('\n');
      const csv = headers + rows;

      const startTime = performance.now();
      const result = service.parseCSV(csv);
      const endTime = performance.now();

      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000);
      console.log(`Parsed 10,000 rows in ${(endTime - startTime).toFixed(2)}ms`);
    });

    it('should handle complex CSV with special characters efficiently', () => {
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(5000)
        .fill(null)
        .map((_, i) => {
          const descriptions = [
            `"Complex description with commas, quotes ""like this"", and newlines\nSpanning multiple lines"`,
            `Description with unicode: émoji 🎯 中文 العربية`,
            `Math symbols: ∑ ∏ ∫ √ ≤ ≥ ≠`,
            `Special chars: & < > ' " \\ / | # $ % ^ * ( ) { } [ ]`,
          ];
          return `"M${i}.1",${descriptions[i % descriptions.length]},Mathematics,${(i % 12) + 1},"Domain ${i % 5}"`;
        })
        .join('\n');
      const csv = headers + rows;

      const startTime = performance.now();
      const result = service.parseCSV(csv);
      const endTime = performance.now();

      expect(result).toHaveLength(5000);
      expect(endTime - startTime).toBeLessThan(500);
      console.log(`Parsed 5,000 complex rows in ${(endTime - startTime).toFixed(2)}ms`);
    });
  });

  describe('Database Operations Performance', () => {
    it('should create 1,000 expectations in under 10 seconds', async () => {
      const importId = await service.startImport(userId, 3, 'Mathematics', 'manual');
      
      const expectations = Array(1000).fill(null).map((_, i) => ({
        code: `PERF${i}`,
        description: `Performance test expectation ${i}`,
        strand: 'Test Strand',
        grade: 3,
        subject: 'Mathematics',
      }));

      const startTime = performance.now();
      
      // Batch create expectations
      for (let i = 0; i < expectations.length; i += 100) {
        const batch = expectations.slice(i, i + 100);
        await Promise.all(
          batch.map(exp =>
            prisma.curriculumExpectation.create({
              data: { ...exp, importId },
            })
          )
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000);
      console.log(`Created 1,000 expectations in ${(duration / 1000).toFixed(2)}s`);

      // Cleanup
      await prisma.curriculumExpectation.deleteMany({
        where: { code: { startsWith: 'PERF' } },
      });
    });

    it('should handle concurrent imports efficiently', async () => {
      const importPromises = Array(10).fill(null).map((_, i) =>
        service.startImport(userId, i + 1, `Subject${i}`, 'csv')
      );

      const startTime = performance.now();
      const importIds = await Promise.all(importPromises);
      const endTime = performance.now();

      expect(importIds).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000);
      console.log(`Created 10 concurrent imports in ${(endTime - startTime).toFixed(2)}ms`);

      // Cleanup
      await prisma.curriculumImport.deleteMany({
        where: { id: { in: importIds } },
      });
    });
  });

  describe('Memory Usage Tests', () => {
    it('should handle large file processing without excessive memory usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate a large CSV (10MB)
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(50000)
        .fill(null)
        .map((_, i) => {
          const longDescription = 'A'.repeat(200); // 200 chars per description
          return `M${i}.1,${longDescription},Mathematics,${(i % 12) + 1},Domain${i % 5}`;
        })
        .join('\n');
      const largeCsv = headers + rows;

      // Process the large CSV
      const result = service.parseCSV(largeCsv);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      expect(result).toHaveLength(50000);
      expect(memoryIncrease).toBeLessThan(200); // Should use less than 200MB
      console.log(`Memory increase for 50k rows: ${memoryIncrease.toFixed(2)}MB`);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe('Text Processing Performance', () => {
    it('should chunk large texts efficiently', () => {
      // Generate a large text (1MB)
      const largeText = Array(1000)
        .fill(null)
        .map((_, i) => `Paragraph ${i}: ${'Lorem ipsum dolor sit amet '.repeat(50)}\n\n`)
        .join('');

      const startTime = performance.now();
      const chunks = (service as any).chunkText(largeText, 3000);
      const endTime = performance.now();

      expect(chunks.length).toBeGreaterThan(100);
      expect(endTime - startTime).toBeLessThan(50);
      console.log(`Chunked 1MB text into ${chunks.length} chunks in ${(endTime - startTime).toFixed(2)}ms`);
    });

    it('should detect language efficiently on large texts', () => {
      const frenchText = Array(1000)
        .fill(null)
        .map(() => 'Les élèves doivent apprendre les mathématiques et les sciences. ')
        .join('');

      const startTime = performance.now();
      const isFrench = (service as any).detectLanguage(frenchText);
      const endTime = performance.now();

      expect(isFrench).toBe(true);
      expect(endTime - startTime).toBeLessThan(10);
      console.log(`Language detection on large text took ${(endTime - startTime).toFixed(2)}ms`);
    });
  });

  describe('Import History Performance', () => {
    beforeEach(async () => {
      // Create many import records
      const imports = Array(100).fill(null).map((_, i) => ({
        userId,
        grade: (i % 12) + 1,
        subject: `Subject${i % 5}`,
        sourceFormat: 'csv' as const,
        status: i % 2 === 0 ? 'COMPLETED' : 'FAILED' as const,
        totalOutcomes: Math.floor(Math.random() * 100),
        processedOutcomes: Math.floor(Math.random() * 100),
      }));

      await prisma.curriculumImport.createMany({ data: imports });
    });

    it('should retrieve import history quickly', async () => {
      const startTime = performance.now();
      const history = await service.getImportHistory(userId, 50);
      const endTime = performance.now();

      expect(history).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(100);
      console.log(`Retrieved 50 import records in ${(endTime - startTime).toFixed(2)}ms`);
    });

    it('should retrieve import history with relationships efficiently', async () => {
      const startTime = performance.now();
      const history = await service.getImportHistory(userId, 20);
      const endTime = performance.now();

      expect(history).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(200);
      console.log(`Retrieved 20 import records with relationships in ${(endTime - startTime).toFixed(2)}ms`);
    });
  });

  describe('Stress Tests', () => {
    it('should handle rapid successive parsing operations', async () => {
      const csv = `code,description,subject,grade,domain
M1.1,Test expectation 1,Math,1,Number
M1.2,Test expectation 2,Math,1,Number
M1.3,Test expectation 3,Math,1,Number`;

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = service.parseCSV(csv);
        expect(result).toHaveLength(3);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(1); // Less than 1ms per parse
      console.log(`Average time per parse (1000 iterations): ${avgTime.toFixed(3)}ms`);
    });

    it('should handle multiple concurrent file uploads', async () => {
      const importIds = await Promise.all(
        Array(5).fill(null).map(() =>
          service.startImport(userId, 3, 'Mathematics', 'csv')
        )
      );

      const uploadPromises = importIds.map(async (importId, i) => {
        const file = {
          originalname: `concurrent-${i}.csv`,
          mimetype: 'text/csv',
          size: 1024,
          buffer: Buffer.from(`code,description\nT${i}.1,Test ${i}`),
        } as Express.Multer.File;

        return service.storeUploadedFile(importId, file);
      });

      const startTime = performance.now();
      await Promise.all(uploadPromises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      console.log(`Handled 5 concurrent file uploads in ${(endTime - startTime).toFixed(2)}ms`);

      // Cleanup
      await prisma.curriculumImport.deleteMany({
        where: { id: { in: importIds } },
      });
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle empty or minimal data efficiently', () => {
      const emptyCsv = 'code,description,subject,grade,domain\n';
      
      const startTime = performance.now();
      const result = service.parseCSV(emptyCsv);
      const endTime = performance.now();

      expect(result).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(1);
    });

    it('should handle malformed data gracefully', () => {
      const malformedCsv = `code,description,subject,grade,domain
M1.1,"Unclosed quote
M1.2,Normal line,Math,1,Number
,Missing code,Math,2,Number
M1.4,,Math,3,Number`;

      const startTime = performance.now();
      const result = service.parseCSV(malformedCsv);
      const endTime = performance.now();

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});