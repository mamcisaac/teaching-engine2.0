import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import BaseService from '../../src/services/base/BaseService';
import { prisma } from '../../src/prisma';

// Mock Prisma
jest.mock('../../src/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

// Create a test service that extends BaseService
class TestService extends BaseService {
  constructor() {
    super('TestService');
  }

  // Expose protected methods for testing
  async testWithRetry<T>(operation: () => Promise<T>, options?: any) {
    return this.withRetry(operation, options);
  }

  async testWithTransaction<T>(operation: (tx: any) => Promise<T>) {
    return this.withTransaction(operation);
  }

  async testWithParallel<T>(operations: (() => Promise<T>)[], options?: any) {
    return this.withParallel(operations, options);
  }

  testHandleError(error: unknown, context?: Record<string, any>): never {
    return this.handleError(error, context);
  }

  testValidateRequired(params: Record<string, any>, required: string[]) {
    return this.validateRequired(params, required);
  }

  testSanitizeInput<T extends Record<string, any>>(input: T, schema: any) {
    return this.sanitizeInput(input, schema);
  }
}

describe('BaseService', () => {
  let testService: TestService;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    testService = new TestService();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('withRetry', () => {
    it('should execute operation successfully on first try', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await testService.testWithRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const resultPromise = testService.testWithRetry(mockOperation, { maxRetries: 3 });
      
      // Fast-forward through delays
      jest.runAllTimers();
      
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      const resultPromise = testService.testWithRetry(mockOperation, { maxRetries: 2 });
      
      jest.runAllTimers();

      await expect(resultPromise).rejects.toThrow('Persistent failure');
      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure 1'))
        .mockRejectedValueOnce(new Error('Failure 2'))
        .mockResolvedValue('success');

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const resultPromise = testService.testWithRetry(mockOperation, {
        maxRetries: 2,
        baseDelay: 100,
        exponentialBackoff: true,
      });

      // Run timers progressively
      jest.advanceTimersByTime(100); // First retry after 100ms
      jest.advanceTimersByTime(200); // Second retry after 200ms (exponential)

      await resultPromise;

      // Check that delays were applied correctly
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 200);
    });

    it('should respect maxDelay', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success');

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const resultPromise = testService.testWithRetry(mockOperation, {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 2000,
        exponentialBackoff: true,
      });

      jest.runAllTimers();
      await resultPromise;

      // Even with exponential backoff, delay should not exceed maxDelay
      const delays = setTimeoutSpy.mock.calls.map(call => call[1]);
      expect(Math.max(...delays)).toBeLessThanOrEqual(2000);
    });
  });

  describe('withTransaction', () => {
    it('should execute operation within transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      const mockTx = { query: jest.fn() };
      
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const result = await testService.testWithTransaction(mockOperation);

      expect(result).toBe('result');
      expect(mockOperation).toHaveBeenCalledWith(mockTx);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should retry transaction on failure', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Transaction failed'))
        .mockResolvedValue('success');
      
      (mockPrisma.$transaction as jest.Mock)
        .mockRejectedValueOnce(new Error('Transaction failed'))
        .mockImplementation(async (fn) => fn({}));

      const resultPromise = testService.testWithTransaction(mockOperation);
      jest.runAllTimers();
      
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('withParallel', () => {
    it('should execute operations in parallel', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockResolvedValue('result2'),
        jest.fn().mockResolvedValue('result3'),
      ];

      const result = await testService.testWithParallel(operations);

      expect(result.results).toEqual(['result1', 'result2', 'result3']);
      expect(result.errors).toEqual([null, null, null]);
      expect(result.successCount).toBe(3);
      operations.forEach(op => expect(op).toHaveBeenCalledTimes(1));
    });

    it('should handle mixed success and failure', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockRejectedValue(new Error('Failed')),
        jest.fn().mockResolvedValue('result3'),
      ];

      const result = await testService.testWithParallel(operations);

      expect(result.results).toEqual(['result1', null, 'result3']);
      expect(result.errors[0]).toBeNull();
      expect(result.errors[1]).toBeInstanceOf(Error);
      expect(result.errors[2]).toBeNull();
      expect(result.successCount).toBe(2);
    });

    it('should fail fast when option is set', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockRejectedValue(new Error('Failed')),
        jest.fn().mockResolvedValue('result3'),
      ];

      await expect(
        testService.testWithParallel(operations, { failFast: true })
      ).rejects.toThrow('Failed');

      // Third operation should not be called due to fail fast
      expect(operations[2]).not.toHaveBeenCalled();
    });

    it('should respect maxConcurrency', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const operations = Array(10).fill(null).map(() => 
        jest.fn().mockImplementation(async () => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise(resolve => setTimeout(resolve, 10));
          concurrent--;
          return 'result';
        })
      );

      const resultPromise = testService.testWithParallel(operations, { maxConcurrency: 3 });
      jest.runAllTimers();
      
      await resultPromise;

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });

  describe('handleError', () => {
    it('should handle Error instances', () => {
      const error = new Error('Test error');
      
      expect(() => {
        testService.testHandleError(error, { userId: 123 });
      }).toThrow('TestService: Test error');
    });

    it('should handle non-Error objects', () => {
      expect(() => {
        testService.testHandleError('String error');
      }).toThrow('TestService: String error');

      expect(() => {
        testService.testHandleError({ message: 'Object error' });
      }).toThrow('TestService: Unknown error');
    });
  });

  describe('validateRequired', () => {
    it('should pass validation for all required fields present', () => {
      const params = { name: 'Test', age: 25, email: 'test@example.com' };
      
      expect(() => {
        testService.testValidateRequired(params, ['name', 'age', 'email']);
      }).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const params = { name: 'Test', age: null, email: '' };
      
      expect(() => {
        testService.testValidateRequired(params, ['name', 'age', 'email']);
      }).toThrow('Missing required parameters: age, email');
    });

    it('should handle undefined values', () => {
      const params = { name: 'Test' };
      
      expect(() => {
        testService.testValidateRequired(params, ['name', 'age']);
      }).toThrow('Missing required parameters: age');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize string inputs', () => {
      const input = {
        name: '  Test Name  ',
        description: 'A'.repeat(2000),
      };

      const schema = {
        name: 'string' as const,
        description: 'string' as const,
      };

      const result = testService.testSanitizeInput(input, schema);

      expect(result.name).toBe('Test Name');
      expect(result.description).toHaveLength(1000); // Truncated
    });

    it('should convert and validate numbers', () => {
      const input = {
        age: '25',
        price: 'invalid',
      };

      const schema = {
        age: 'number' as const,
        price: 'number' as const,
      };

      const result = testService.testSanitizeInput(input, schema);
      expect(result.age).toBe(25);

      expect(() => {
        testService.testSanitizeInput({ price: 'invalid' }, { price: 'number' as const });
      }).toThrow('Invalid number value for price');
    });

    it('should convert booleans', () => {
      const input = {
        active: 'true',
        enabled: 0,
        visible: 1,
      };

      const schema = {
        active: 'boolean' as const,
        enabled: 'boolean' as const,
        visible: 'boolean' as const,
      };

      const result = testService.testSanitizeInput(input, schema);

      expect(result.active).toBe(true);
      expect(result.enabled).toBe(false);
      expect(result.visible).toBe(true);
    });

    it('should validate object and array types', () => {
      const input = {
        config: { key: 'value' },
        tags: ['tag1', 'tag2'],
      };

      const schema = {
        config: 'object' as const,
        tags: 'array' as const,
      };

      const result = testService.testSanitizeInput(input, schema);

      expect(result.config).toEqual({ key: 'value' });
      expect(result.tags).toEqual(['tag1', 'tag2']);

      expect(() => {
        testService.testSanitizeInput({ config: [] }, schema);
      }).toThrow('Expected object for config');

      expect(() => {
        testService.testSanitizeInput({ tags: 'not an array' }, { tags: 'array' as const });
      }).toThrow('Expected array for tags');
    });
  });

  describe('metrics', () => {
    it('should track operation metrics', async () => {
      const mockOperation = jest.fn()
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('success');

      await testService.testWithRetry(mockOperation);
      
      try {
        await testService.testWithRetry(mockOperation, { maxRetries: 0 });
      } catch (e) {
        // Expected failure
      }
      
      await testService.testWithRetry(mockOperation);

      const metrics = testService.getMetrics();

      expect(metrics.operationCount).toBe(3);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.lastOperation).toBeInstanceOf(Date);
    });

    it('should reset metrics', () => {
      testService.resetMetrics();
      
      const metrics = testService.getMetrics();

      expect(metrics.operationCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is accessible', async () => {
      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const health = await testService.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.details.database).toBe(true);
      expect(health.details.metrics).toBeDefined();
      expect(health.details.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when database is not accessible', async () => {
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const health = await testService.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.details.database).toBe(false);
    });
  });
});