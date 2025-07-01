/**
 * Database Test Isolation Utilities
 *
 * Provides utilities to ensure complete isolation between database tests
 * and prevent mock state bleeding that can cause test failures.
 */

import { jest } from '@jest/globals';
import { unifiedPrismaClient } from '../mocks/database.unified.mock.js';

/**
 * Test isolation manager for database operations
 */
export class DatabaseTestIsolation {
  private static originalMockImplementations = new Map();

  /**
   * Save current mock implementations for restoration
   */
  static saveCurrentState(): void {
    this.originalMockImplementations.clear();

    // Save all model implementations
    Object.keys(unifiedPrismaClient).forEach((key) => {
      const model = (unifiedPrismaClient as any)[key];
      if (model && typeof model === 'object' && !jest.isMockFunction(model)) {
        Object.keys(model).forEach((method) => {
          if (jest.isMockFunction(model[method])) {
            this.originalMockImplementations.set(
              `${key}.${method}`,
              model[method].getMockImplementation(),
            );
          }
        });
      }
    });
  }

  /**
   * Restore original mock implementations
   */
  static restoreOriginalState(): void {
    this.originalMockImplementations.forEach((implementation, key) => {
      const [modelName, methodName] = key.split('.');
      const model = (unifiedPrismaClient as any)[modelName];
      if (model?.[methodName]) {
        if (implementation) {
          model[methodName].mockImplementation(implementation);
        } else {
          model[methodName].mockReset();
        }
      }
    });
  }

  /**
   * Complete isolation reset - clears all data and mock history
   */
  static performCompleteReset(): void {
    // Reset all mock data
    unifiedPrismaClient.resetAllMocks();

    // Clear all jest mock call history
    jest.clearAllMocks();

    // Reset all mock implementations to default
    this.restoreOriginalState();
  }

  /**
   * Setup clean state for a test
   */
  static setupCleanTestState(): void {
    this.performCompleteReset();

    // Set up default successful responses
    this.setupDefaultMockBehavior();
  }

  /**
   * Setup default mock behavior for common operations
   */
  private static setupDefaultMockBehavior(): void {
    // Set up basic CRUD operation defaults that most tests expect
    const modelNames = [
      'user',
      'outcome',
      'outcomeEmbedding',
      'curriculumExpectation',
      'curriculumExpectationEmbedding',
      'curriculumImport',
      'outcomeCluster',
    ];

    modelNames.forEach((modelName) => {
      const model = (unifiedPrismaClient as any)[modelName];
      if (model) {
        // findUnique should return null by default (no record found)
        if (model.findUnique && jest.isMockFunction(model.findUnique)) {
          model.findUnique.mockResolvedValue(null);
        }

        // findMany should return empty array by default
        if (model.findMany && jest.isMockFunction(model.findMany)) {
          model.findMany.mockResolvedValue([]);
        }

        // count should return 0 by default
        if (model.count && jest.isMockFunction(model.count)) {
          model.count.mockResolvedValue(0);
        }
      }
    });
  }

  /**
   * Verify no real database connections are made during unit tests
   */
  static verifyNoRealDatabaseConnections(): void {
    // Check that $connect and $disconnect are mocked
    if (!jest.isMockFunction(unifiedPrismaClient.$connect)) {
      throw new Error('Database $connect is not mocked - real database connection detected!');
    }

    if (!jest.isMockFunction(unifiedPrismaClient.$disconnect)) {
      throw new Error('Database $disconnect is not mocked - real database connection detected!');
    }

    // Ensure they haven't been called with real parameters
    const connectCalls = (unifiedPrismaClient.$connect as jest.Mock).mock.calls;
    const disconnectCalls = (unifiedPrismaClient.$disconnect as jest.Mock).mock.calls;

    connectCalls.forEach((call) => {
      if (call.some((arg: any) => typeof arg === 'string' && arg.includes('postgresql://'))) {
        throw new Error('Real database connection string detected in test!');
      }
    });
  }

  /**
   * Setup mock data for a specific test scenario
   */
  static seedTestData(model: string, data: any[]): void {
    unifiedPrismaClient.seedData(model, data);
  }

  /**
   * Setup a specific mock response for testing
   */
  static setupMockResponse(model: string, operation: string, response: any): void {
    unifiedPrismaClient.setupMock(model, operation, response);
  }

  /**
   * Setup a mock error for testing error scenarios
   */
  static setupMockError(model: string, operation: string, error: Error): void {
    unifiedPrismaClient.setupError(model, operation, error);
  }

  /**
   * Get mock data for verification in tests
   */
  static getMockData(model: string): any[] {
    return unifiedPrismaClient.getMockData(model);
  }

  /**
   * Verify that specific operations were called correctly
   */
  static verifyMockCalls(model: string, operation: string, expectedCalls: number = 1): void {
    const modelMock = (unifiedPrismaClient as any)[model];
    if (!modelMock?.[operation]) {
      throw new Error(`Model ${model} or operation ${operation} not found`);
    }

    if (!jest.isMockFunction(modelMock[operation])) {
      throw new Error(`${model}.${operation} is not a mock function`);
    }

    expect(modelMock[operation]).toHaveBeenCalledTimes(expectedCalls);
  }

  /**
   * Performance monitoring for mock operations
   */
  static measureMockPerformance<T>(operation: () => T): { result: T; duration: number } {
    const start = process.hrtime.bigint();
    const result = operation();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    return { result, duration };
  }
}

/**
 * Convenience functions for test setup
 */
export const setupCleanDatabase = () => DatabaseTestIsolation.setupCleanTestState();
export const resetDatabase = () => DatabaseTestIsolation.performCompleteReset();
export const verifyNoRealDb = () => DatabaseTestIsolation.verifyNoRealDatabaseConnections();
export const seedData = (model: string, data: any[]) =>
  DatabaseTestIsolation.seedTestData(model, data);
export const setupMock = (model: string, operation: string, response: any) =>
  DatabaseTestIsolation.setupMockResponse(model, operation, response);
export const setupError = (model: string, operation: string, error: Error) =>
  DatabaseTestIsolation.setupMockError(model, operation, error);
export const getMockData = (model: string) => DatabaseTestIsolation.getMockData(model);
export const verifyMockCalls = (model: string, operation: string, expectedCalls?: number) =>
  DatabaseTestIsolation.verifyMockCalls(model, operation, expectedCalls);

/**
 * Test decorator for automatic database isolation
 */
export function withDatabaseIsolation(testFn: () => void | Promise<void>) {
  return async () => {
    DatabaseTestIsolation.setupCleanTestState();
    try {
      await testFn();
    } finally {
      DatabaseTestIsolation.performCompleteReset();
    }
  };
}

/**
 * Enhanced test utilities specifically for database testing
 */
export const dbTest = {
  setup: setupCleanDatabase,
  reset: resetDatabase,
  verify: verifyNoRealDb,
  seed: seedData,
  mock: setupMock,
  error: setupError,
  data: getMockData,
  calls: verifyMockCalls,
  isolate: withDatabaseIsolation,
};

export default DatabaseTestIsolation;
