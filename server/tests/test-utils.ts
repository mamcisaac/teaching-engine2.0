/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enhanced Test Utilities for Real Implementation Testing
 * Provides utilities for testing with real database operations and services
 */

import { PrismaClient } from '@teaching-engine/database';
import { expect } from '@jest/globals';

// Enhanced configuration for real testing
interface TestUtilsConfig {
  enableTransactions?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableDataValidation?: boolean;
  cleanupStrategy?: 'transaction' | 'truncate' | 'none';
}

// Performance monitoring interface
interface PerformanceMetrics {
  queryTime: number;
  queryCount: number;
  isAcceptable: boolean;
}

/**
 * Create enhanced test utilities for real implementation testing
 */
export function createTestUtils(prisma: PrismaClient, config: TestUtilsConfig = {}) {
  const {
    enableTransactions = true,
    enablePerformanceMonitoring = false,
    enableDataValidation = true,
    cleanupStrategy = 'transaction'
  } = config;
  let queryMetrics: PerformanceMetrics = { queryTime: 0, queryCount: 0, isAcceptable: true };

  // Performance monitoring wrapper
  async function withPerformanceMonitoring<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (!enablePerformanceMonitoring) {
      return operation();
    }

    const start = performance.now();
    queryMetrics.queryCount++;
    
    try {
      const result = await operation();
      const duration = performance.now() - start;
      queryMetrics.queryTime += duration;
      queryMetrics.isAcceptable = queryMetrics.queryTime < 100; // Total under 100ms
      
      if (duration > 50) {
        console.warn(`Slow query detected in ${operationName}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      console.error(`Query failed in ${operationName}:`, error);
      throw error;
    }
  }

  return {
    /**
     * Get the count of records in a table with performance monitoring
     */
    async getTableCount(tableName: string): Promise<number> {
      return withPerformanceMonitoring(async () => {
        const result = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
          `SELECT COUNT(*) as count FROM ${tableName}`,
        );
        return Number(result[0].count);
      }, `getTableCount(${tableName})`);
    },

    /**
     * Expect a specific count in a table with enhanced validation
     */
    async expectTableCount(tableName: string, expectedCount: number): Promise<void> {
      const actualCount = await this.getTableCount(tableName);
      
      if (enableDataValidation) {
        // Additional validation for data integrity
        if (actualCount !== expectedCount) {
          console.warn(`Table count mismatch for ${tableName}: expected ${expectedCount}, got ${actualCount}`);
          
          // Log additional context for debugging
          if (actualCount > expectedCount) {
            console.warn('More records than expected - possible test data leakage');
          } else {
            console.warn('Fewer records than expected - possible deletion or transaction issue');
          }
        }
      }
      
      expect(actualCount).toBe(expectedCount);
    },

    /**
     * Test transaction isolation with real concurrent operations
     */
    async testTransactionIsolation(): Promise<void> {
      return withPerformanceMonitoring(async () => {
        // Create multiple subjects concurrently to test real isolation
        const testId = `isolation-${Date.now()}`;
        const operations = Array.from({ length: 5 }, (_, i) =>
          prisma.subject.create({
            data: {
              name: `${testId}-Subject-${i}`,
              code: `ISO${i}`,
            },
          }),
        );

        const results = await Promise.all(operations);
        expect(results).toHaveLength(5);

        // Verify all were created with proper isolation
        const subjects = await prisma.subject.findMany({
          where: { name: { startsWith: testId } },
        });
        expect(subjects).toHaveLength(5);

        // Verify data integrity
        if (enableDataValidation) {
          const uniqueNames = new Set(subjects.map(s => s.name));
          expect(uniqueNames.size).toBe(5); // All names should be unique
        }
      }, 'testTransactionIsolation');
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
      const differences: Array<{ table: string; expected: number; actual: number }> = [];
      
      for (const [table, expectedCount] of Object.entries(snapshot)) {
        const actualCount = await this.getTableCount(table);
        if (actualCount !== expectedCount) {
          differences.push({ table, expected: expectedCount, actual: actualCount });
        }
      }
      
      if (differences.length > 0 && enableDataValidation) {
        console.warn('Snapshot differences detected:', differences);
      }
      
      for (const [table, expectedCount] of Object.entries(snapshot)) {
        const actualCount = await this.getTableCount(table);
        expect(actualCount).toBe(expectedCount);
      }
    },

    /**
     * Create realistic test data with proper relationships
     */
    async createRealisticTestData(config: {
      users?: number;
      subjects?: number;
      outcomes?: number;
      lessonPlans?: number;
      withRelationships?: boolean;
    } = {}) {
      const {
        users = 1,
        subjects = 2,
        outcomes = 5,
        lessonPlans = 3,
        withRelationships = true
      } = config;

      return withPerformanceMonitoring(async () => {
        const created: any = {
          users: [],
          subjects: [],
          outcomes: [],
          lessonPlans: []
        };

        // Create users
        for (let i = 0; i < users; i++) {
          const user = await prisma.user.create({
            data: {
              email: `test-user-${Date.now()}-${i}@example.com`,
              name: `Test User ${i}`,
              password: 'hashedPassword123',
              role: 'USER',
            }
          });
          created.users.push(user);
        }

        // Create subjects
        for (let i = 0; i < subjects; i++) {
          const subject = await prisma.subject.create({
            data: {
              name: `Test Subject ${i}`,
              code: `TS${i}`,
            }
          });
          created.subjects.push(subject);
        }

        // Create outcomes with realistic relationships
        if (withRelationships && created.subjects.length > 0) {
          for (let i = 0; i < outcomes; i++) {
            const subject = created.subjects[i % created.subjects.length];
            const outcome = await prisma.outcome.create({
              data: {
                code: `${subject.code}.${i + 1}`,
                description: `Test outcome ${i + 1} for ${subject.name}`,
                subject: subject.name,
                grade: Math.floor(Math.random() * 8) + 1, // Grades 1-8
                domain: `Domain ${Math.floor(i / 2) + 1}`,
              }
            });
            created.outcomes.push(outcome);
          }
        }

        return created;
      }, 'createRealisticTestData');
    },

    /**
     * Test with realistic large datasets
     */
    async testWithLargeDataset(
      dataSize: number,
      testFn: (data: any) => Promise<void>
    ): Promise<{ performance: PerformanceMetrics; success: boolean }> {
      const startTime = performance.now();
      queryMetrics = { queryTime: 0, queryCount: 0, isAcceptable: true };

      try {
        // Create large realistic dataset
        const data = await this.createRealisticTestData({
          users: Math.max(1, Math.floor(dataSize / 100)),
          subjects: Math.max(1, Math.floor(dataSize / 50)),
          outcomes: dataSize,
          withRelationships: true
        });

        await testFn(data);
        
        const totalTime = performance.now() - startTime;
        return {
          performance: {
            ...queryMetrics,
            queryTime: totalTime,
            isAcceptable: totalTime < 5000 // Under 5 seconds for large datasets
          },
          success: true
        };
      } catch (error) {
        console.error('Large dataset test failed:', error);
        return {
          performance: queryMetrics,
          success: false
        };
      }
    },

    /**
     * Performance metrics and monitoring
     */
    getPerformanceMetrics: () => queryMetrics,
    resetPerformanceMetrics: () => {
      queryMetrics = { queryTime: 0, queryCount: 0, isAcceptable: true };
    },

    /**
     * Enhanced cleanup with configurable strategy
     */
    async cleanup(strategy: 'transaction' | 'truncate' | 'selective' = cleanupStrategy): Promise<void> {
      return withPerformanceMonitoring(async () => {
        switch (strategy) {
          case 'transaction':
            // Transaction rollback handled by test setup
            break;
          
          case 'truncate':
            await this.cleanTables(['Activity', 'Outcome', 'Subject', 'User']);
            break;
          
          case 'selective':
            // Only clean test data created in this session
            await prisma.user.deleteMany({
              where: {
                email: { contains: `test-user-${Date.now().toString().slice(0, -3)}` }
              }
            });
            break;
        }
      }, 'cleanup');
    },

    /**
     * Real implementation testing utilities
     */
    real: {
      // Test real service interactions
      async testServiceIntegration<T>(
        service: any,
        method: string,
        args: any[],
        expectedBehavior: (result: T) => boolean
      ): Promise<boolean> {
        try {
          const result = await service[method](...args);
          return expectedBehavior(result);
        } catch (error) {
          console.error(`Service integration test failed for ${method}:`, error);
          return false;
        }
      },

      // Test real API endpoints
      async testEndpoint(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        data?: any,
        headers?: Record<string, string>
      ): Promise<{ status: number; response: any; responseTime: number }> {
        const start = performance.now();
        
        try {
          // This would need actual fetch implementation in test environment
          const response = { status: 200, data: {} }; // Placeholder
          const responseTime = performance.now() - start;
          
          return {
            status: response.status,
            response: response.data,
            responseTime
          };
        } catch (error) {
          const responseTime = performance.now() - start;
          throw { error, responseTime };
        }
      },

      // Validate data integrity across relationships
      async validateDataIntegrity(): Promise<boolean> {
        try {
          // Check foreign key constraints
          const orphanedActivities = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM Activity a 
            LEFT JOIN Milestone m ON a.milestoneId = m.id 
            WHERE m.id IS NULL
          `;
          
          // Check for duplicate codes in outcomes
          const duplicateOutcomes = await prisma.$queryRaw`
            SELECT code, COUNT(*) as count 
            FROM Outcome 
            GROUP BY code 
            HAVING COUNT(*) > 1
          `;
          
          return Array.isArray(orphanedActivities) && 
                 orphanedActivities.length === 0 &&
                 Array.isArray(duplicateOutcomes) && 
                 duplicateOutcomes.length === 0;
        } catch (error) {
          console.error('Data integrity validation failed:', error);
          return false;
        }
      }
    }
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
