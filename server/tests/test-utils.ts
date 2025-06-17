import { PrismaClient } from '@teaching-engine/database';
import { expect } from '@jest/globals';

/**
 * Create test utilities for a given Prisma client
 */
export function createTestUtils(prisma: PrismaClient) {
  return {
    /**
     * Get the count of records in a table
     */
    async getTableCount(tableName: string): Promise<number> {
      // Use $queryRawUnsafe for dynamic table names
      const result = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
        `SELECT COUNT(*) as count FROM ${tableName}`,
      );
      return Number(result[0].count);
    },

    /**
     * Expect a specific count in a table
     */
    async expectTableCount(tableName: string, expectedCount: number): Promise<void> {
      const actualCount = await this.getTableCount(tableName);
      expect(actualCount).toBe(expectedCount);
    },

    /**
     * Test transaction isolation between concurrent operations
     */
    async testTransactionIsolation(): Promise<void> {
      // Create multiple subjects concurrently to test isolation
      const operations = Array.from({ length: 5 }, (_, i) =>
        prisma.subject.create({
          data: {
            name: `Isolation Test ${i}`,
          },
        }),
      );

      const results = await Promise.all(operations);
      expect(results).toHaveLength(5);

      // Verify all were created
      const subjects = await prisma.subject.findMany({
        where: { name: { startsWith: 'Isolation Test' } },
      });
      expect(subjects).toHaveLength(5);
    },

    /**
     * Test foreign key constraints
     */
    async testForeignKeyConstraints(): Promise<void> {
      // Attempt to create an activity with non-existent milestone
      await expect(
        prisma.activity.create({
          data: {
            id: 'fk_test',
            title: 'FK Test',
            milestoneId: 'non_existent_milestone',
            type: 'MINDS_ON',
            duration: 30,
            description: 'Test',
          },
        }),
      ).rejects.toThrow();
    },

    /**
     * Test unique constraints
     */
    async testUniqueConstraints(): Promise<void> {
      // Create an outcome with a specific code
      const outcomeCode = 'TEST.UNIQUE.001';
      await prisma.outcome.create({
        data: {
          id: 'unique_test_outcome_1',
          code: outcomeCode,
          description: 'Test unique constraint',
          subject: 'Test Subject',
          grade: 5,
          domain: 'Test Domain',
        },
      });

      // Attempt to create another with the same code
      await expect(
        prisma.outcome.create({
          data: {
            id: 'unique_test_outcome_2',
            code: outcomeCode, // Same code should fail
            description: 'Duplicate code test',
            subject: 'Test Subject',
            grade: 5,
            domain: 'Test Domain',
          },
        }),
      ).rejects.toThrow();
    },

    /**
     * Clean all data from specific tables
     */
    async cleanTables(tableNames: string[]): Promise<void> {
      // Disable foreign key constraints temporarily
      await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF');

      try {
        for (const tableName of tableNames) {
          await prisma.$executeRawUnsafe(`DELETE FROM ${tableName}`);
        }
      } finally {
        // Re-enable foreign key constraints
        await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
      }
    },

    /**
     * Wait for a condition to be true
     */
    async waitFor(
      condition: () => Promise<boolean>,
      timeout: number = 5000,
      interval: number = 100,
    ): Promise<void> {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (await condition()) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    },

    /**
     * Create a test database snapshot
     */
    async createSnapshot(): Promise<Record<string, number>> {
      const tables = ['Subject', 'Milestone', 'Activity', 'Outcome', 'Note'];
      const snapshot: Record<string, number> = {};

      for (const table of tables) {
        snapshot[table] = await this.getTableCount(table);
      }

      return snapshot;
    },

    /**
     * Compare database state with a snapshot
     */
    async compareWithSnapshot(snapshot: Record<string, number>): Promise<void> {
      for (const [table, expectedCount] of Object.entries(snapshot)) {
        const actualCount = await this.getTableCount(table);
        expect(actualCount).toBe(expectedCount);
      }
    },
  };
}

/**
 * Common assertion helpers
 */
export const assertions = {
  /**
   * Assert that two objects match, ignoring specified fields
   */
  objectMatches(
    actual: unknown,
    expected: unknown,
    ignoreFields: string[] = ['id', 'createdAt', 'updatedAt'],
  ): void {
    const actualCopy = { ...actual };
    const expectedCopy = { ...expected };

    // Remove ignored fields
    for (const field of ignoreFields) {
      delete actualCopy[field];
      delete expectedCopy[field];
    }

    expect(actualCopy).toEqual(expectedCopy);
  },

  /**
   * Assert that a promise rejects with a specific error message
   */
  async rejectsWithMessage(promise: Promise<unknown>, expectedMessage: string): Promise<void> {
    await expect(promise).rejects.toThrow(expectedMessage);
  },

  /**
   * Assert that an array contains items matching a predicate
   */
  arrayContains<T>(array: T[], predicate: (item: T) => boolean, expectedCount?: number): void {
    const matches = array.filter(predicate);

    if (expectedCount !== undefined) {
      expect(matches).toHaveLength(expectedCount);
    } else {
      expect(matches.length).toBeGreaterThan(0);
    }
  },

  /**
   * Assert that a date is recent (within the last minute)
   */
  isRecentDate(date: Date | string | null): void {
    if (!date) {
      throw new Error('Date is null or undefined');
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    expect(diffMs).toBeGreaterThanOrEqual(0);
    expect(diffMs).toBeLessThan(60000); // 1 minute
  },
};
