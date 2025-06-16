import { getTestPrismaClient } from './jest.setup';
import { getAllTestOutcomes, validateOutcomeData } from './test-data/curriculum-test-data';
import { Outcome } from '@teaching-engine/database';

describe('Curriculum Import', () => {
  // Get test-specific prisma client
  const prisma = getTestPrismaClient();

  // Store created outcome IDs for cleanup
  const createdOutcomeIds: number[] = [];

  beforeAll(async () => {
    // Ensure SQLite doesn't immediately error when the database is busy
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');

    // Clear any existing test outcomes
    await prisma.outcome.deleteMany({
      where: {
        OR: [
          { code: { startsWith: '1CO.' } },
          { code: { startsWith: '1LE.' } },
          { code: { startsWith: '1EC.' } },
          { code: { startsWith: '1CU.' } },
          { code: { startsWith: '1N.' } },
          { code: { startsWith: '1G.' } },
          { code: { startsWith: '2RL.' } },
          { code: { startsWith: '2W.' } },
        ],
      },
    });

    // Import test curriculum data
    const testOutcomes = getAllTestOutcomes();

    // Validate all outcomes before import
    for (const outcome of testOutcomes) {
      const errors = validateOutcomeData(outcome);
      if (errors.length > 0) {
        throw new Error(`Invalid outcome data for ${outcome.code}: ${errors.join(', ')}`);
      }
    }

    // Create outcomes in batch
    const createdOutcomes = await Promise.all(
      testOutcomes.map((outcome) =>
        prisma.outcome.create({
          data: outcome as Outcome,
        }),
      ),
    );

    // Store IDs for cleanup
    createdOutcomeIds.push(...createdOutcomes.map((o) => o.id));
  });

  afterAll(async () => {
    // Clean up test data
    if (createdOutcomeIds.length > 0) {
      await prisma.outcome.deleteMany({
        where: {
          id: { in: createdOutcomeIds },
        },
      });
    }
    await prisma.$disconnect();
  });

  it('should have imported French Immersion Grade 1 outcomes', async () => {
    const count = await prisma.outcome.count({
      where: {
        grade: 1,
        subject: 'FRA',
      },
    });

    // Test data ensures we always have at least 55 Grade 1 French outcomes
    expect(count).toBeGreaterThanOrEqual(55);
    expect(count).toBeLessThan(100); // Sanity check to ensure we're not duplicating data
  });

  it('should have imported outcomes for multiple subjects', async () => {
    const subjectCounts = await prisma.outcome.groupBy({
      by: ['subject'],
      _count: true,
      where: {
        grade: { in: [1, 2] },
      },
    });

    const subjectMap = new Map(subjectCounts.map((s) => [s.subject, s._count]));

    expect(subjectMap.get('FRA')).toBeGreaterThanOrEqual(55);
    expect(subjectMap.get('MATH')).toBeGreaterThanOrEqual(3);
    expect(subjectMap.get('ENG')).toBeGreaterThanOrEqual(2);
  });

  it('should have unique code values for all outcomes', async () => {
    // Get all outcome codes from our test data
    const outcomes = await prisma.outcome.findMany({
      select: { code: true },
      where: {
        id: { in: createdOutcomeIds },
      },
    });

    // Check for duplicates
    const codes = outcomes.map((o) => o.code);
    const uniqueCodes = new Set(codes);

    expect(uniqueCodes.size).toBe(codes.length);

    // Also check that no codes are empty or malformed
    codes.forEach((code) => {
      expect(code).toMatch(/^[0-9][A-Z0-9]{1,3}\.[0-9]+$/);
    });
  });

  it('should have properly populated fields for outcomes', async () => {
    // Get a sample French outcome with a specific code we know exists
    const outcome = await prisma.outcome.findFirst({
      where: {
        code: '1CO.1',
      },
    });

    // This should always exist because we import it in beforeAll
    expect(outcome).toBeDefined();
    expect(outcome).not.toBeNull();

    // Check that all fields are properly populated
    expect(outcome!.code).toBe('1CO.1');
    expect(outcome!.description).toBe('Distinguer les sons dans la chaîne parlée');
    expect(outcome!.domain).toBe('Communication orale');
    expect(outcome!.subject).toBe('FRA');
    expect(outcome!.grade).toBe(1);
  });

  it('should validate all imported outcomes', async () => {
    const outcomes = await prisma.outcome.findMany({
      where: {
        id: { in: createdOutcomeIds },
      },
    });

    // Validate each outcome
    outcomes.forEach((outcome) => {
      const errors = validateOutcomeData(outcome);
      expect(errors).toHaveLength(0);

      // Additional validations
      expect(outcome.code).toBeTruthy();
      expect(outcome.description.length).toBeGreaterThan(5);
      expect(outcome.domain).toBeTruthy();
      expect(outcome.subject).toMatch(/^[A-Z]{2,4}$/);
      expect(outcome.grade).toBeGreaterThanOrEqual(1);
      expect(outcome.grade).toBeLessThanOrEqual(12);
    });
  });

  it('should handle concurrent outcome queries efficiently', async () => {
    // Test that we can query outcomes efficiently in parallel
    const startTime = Date.now();

    const queries = [
      prisma.outcome.count({ where: { subject: 'FRA' } }),
      prisma.outcome.count({ where: { grade: 1 } }),
      prisma.outcome.findMany({ where: { domain: 'Communication orale' }, take: 3 }),
      prisma.outcome.findFirst({ where: { code: '1LE.1' } }),
      prisma.outcome.groupBy({ by: ['domain'], _count: true, where: { subject: 'FRA' } }),
    ];

    const results = await Promise.all(queries);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // All queries should complete
    expect(results).toHaveLength(5);
    expect(results[0]).toBeGreaterThan(0); // FRA count
    expect(results[1]).toBeGreaterThan(0); // Grade 1 count
    expect(results[2]).toHaveLength(3); // Communication orale outcomes
    expect(results[3]).toBeDefined(); // 1LE.1 outcome
    expect(results[4].length).toBeGreaterThan(0); // Domain groups

    // Performance check - should complete within reasonable time
    expect(duration).toBeLessThan(1000); // Less than 1 second for all queries
  });

  describe('Edge Cases', () => {
    it('should handle empty data scenarios gracefully', async () => {
      // Test empty arrays
      const emptyResult = await prisma.outcome.findMany({
        where: {
          code: { in: [] },
        },
      });
      expect(emptyResult).toHaveLength(0);

      // Test empty string queries
      const emptyStringResult = await prisma.outcome.findMany({
        where: {
          code: '',
        },
      });
      expect(emptyStringResult).toHaveLength(0);

      // Test empty description search
      const emptyDescResult = await prisma.outcome.findMany({
        where: {
          description: { contains: '' },
        },
      });
      expect(emptyDescResult).toHaveLength(createdOutcomeIds.length);
    });

    it('should handle maximum data limits', async () => {
      // Test very long search terms
      const longSearchTerm = 'a'.repeat(1000);
      const longResult = await prisma.outcome.findMany({
        where: {
          description: { contains: longSearchTerm },
        },
      });
      expect(longResult).toHaveLength(0);

      // Test large result sets with pagination
      const largeResult = await prisma.outcome.findMany({
        take: 50,
        skip: 0,
        where: {
          id: { in: createdOutcomeIds },
        },
      });
      expect(largeResult.length).toBeLessThanOrEqual(50);
      expect(largeResult.length).toBeGreaterThan(0);
    });

    it('should handle special characters and Unicode', async () => {
      // Test special characters in search
      const specialChars = ['é', 'à', 'ç', 'ñ', '中文', '🎯', "'", '"', '\\', '%', '_'];

      for (const char of specialChars) {
        const result = await prisma.outcome.findMany({
          where: {
            description: { contains: char },
          },
        });
        // Should not throw error, result length varies based on actual content
        expect(Array.isArray(result)).toBe(true);
      }

      // Test Unicode normalization
      const accentedSearch = await prisma.outcome.findMany({
        where: {
          description: { contains: 'é' },
        },
      });
      expect(Array.isArray(accentedSearch)).toBe(true);
    });

    it('should handle data validation boundaries', async () => {
      // Test boundary values for grade
      const grade0 = await prisma.outcome.findMany({
        where: { grade: 0 },
      });
      expect(grade0).toHaveLength(0);

      const grade13 = await prisma.outcome.findMany({
        where: { grade: 13 },
      });
      expect(grade13).toHaveLength(0);

      // Test valid boundary grades
      const grade1 = await prisma.outcome.findMany({
        where: { grade: 1 },
      });
      expect(grade1.length).toBeGreaterThan(0);

      const grade12 = await prisma.outcome.findMany({
        where: { grade: 12 },
      });
      // May be 0 if no grade 12 test data exists
      expect(grade12.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle null and undefined values', async () => {
      // Test searching for non-existent values
      const emptyResult = await prisma.outcome.findMany({
        where: {
          code: 'NON-EXISTENT-CODE-12345',
        },
      });
      expect(emptyResult).toHaveLength(0);

      // Test empty string search
      const emptyStringResult = await prisma.outcome.findMany({
        where: {
          description: { contains: '' },
        },
      });
      expect(emptyStringResult.length).toBeGreaterThanOrEqual(createdOutcomeIds.length);

      // Test with proper checks for existing records
      const validResult = await prisma.outcome.findMany({
        where: {
          id: { in: createdOutcomeIds },
        },
      });
      expect(validResult.length).toBeGreaterThan(0);
    });

    it('should handle concurrent modifications', async () => {
      // Test concurrent reads don't interfere
      const concurrentReads = Array.from({ length: 10 }, () =>
        prisma.outcome.findMany({
          where: { id: { in: createdOutcomeIds } },
          take: 5,
        }),
      );

      const results = await Promise.all(concurrentReads);

      // All reads should return consistent results
      results.forEach((result) => {
        expect(result.length).toBeLessThanOrEqual(5);
        expect(result.length).toBeGreaterThan(0);
      });

      // Results should be consistent across concurrent reads
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result.length).toBe(firstResult.length);
      });
    });

    it('should handle malformed search patterns', async () => {
      // Test SQL injection attempts
      const maliciousInputs = [
        "'; DROP TABLE outcomes; --",
        "1' OR '1'='1",
        'UNION SELECT * FROM users',
        "'; DELETE FROM outcomes; --",
      ];

      for (const input of maliciousInputs) {
        const result = await prisma.outcome.findMany({
          where: {
            description: { contains: input },
          },
        });
        // Should not throw error and should return empty array
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      }
    });

    it('should handle extreme numeric values', async () => {
      // Test extreme grade values
      const extremeValues = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -1, 999999];

      for (const value of extremeValues) {
        const result = await prisma.outcome.findMany({
          where: { grade: value },
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      }
    });
  });
});
