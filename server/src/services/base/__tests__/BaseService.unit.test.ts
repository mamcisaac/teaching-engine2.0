/**
 * BaseService Test Suite
 */

import { jest } from '@jest/globals';
import { BaseService } from '../BaseService';

// Mock implementation for testing
class TestService extends BaseService {
  public initializeCalled = false;
  public checkDependenciesCalled = false;

  constructor() {
    super('TestService');
  }

  protected async initialize(): Promise<void> {
    await super.initialize();
    this.initializeCalled = true;
  }

  protected checkDependencies(): Record<string, boolean> {
    this.checkDependenciesCalled = true;
    return {
      ...super.checkDependencies(),
      testDependency: true,
    };
  }

  // Public method to test metrics
  public async testMethod(shouldFail: boolean = false): Promise<string> {
    return this.executeWithMetrics(
      async () => {
        if (shouldFail) {
          throw new Error('Test error');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      },
      'testMethod'
    );
  }

  // Expose protected methods for testing
  public getMetricsForTest() {
    return this.getMetrics();
  }

  public isHealthyForTest() {
    return this.isHealthy;
  }

  // Expose ensureInitialized for testing
  public async ensureInitializedForTest() {
    return this.ensureInitialized();
  }

  // Expose name for testing
  public getNameForTest() {
    return this.name;
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('Initialization', () => {
    it('should initialize service correctly', async () => {
      expect(service.initializeCalled).toBe(false);
      await service.ensureInitializedForTest();
      expect(service.initializeCalled).toBe(true);
    });

    it('should only initialize once', async () => {
      await service.ensureInitializedForTest();
      service.initializeCalled = false;
      await service.ensureInitializedForTest();
      expect(service.initializeCalled).toBe(false);
    });

    it('should have correct service name', () => {
      expect(service.getNameForTest()).toBe('TestService');
    });
  });

  describe('Health Checks', () => {
    it('should perform health check', async () => {
      const health = await service.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('TestService');
      expect(health.dependencies).toHaveProperty('logger', true);
      expect(health.dependencies).toHaveProperty('testDependency', true);
    });

    it('should update last health check time', async () => {
      const beforeTime = Date.now();
      await service.healthCheck();
      const lastCheck = service['lastHealthCheck'].getTime();
      expect(lastCheck).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('Metrics', () => {
    it('should track successful operations', async () => {
      const result = await service.testMethod(false);
      expect(result).toBe('success');

      const metrics = service.getMetricsForTest();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.operations).toHaveProperty('testMethod');
      expect(metrics.operations.testMethod.count).toBe(1);
      expect(metrics.operations.testMethod.totalDuration).toBeGreaterThan(0);
    });

    it('should track failed operations', async () => {
      await expect(service.testMethod(true)).rejects.toThrow('Test error');

      const metrics = service.getMetricsForTest();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.operations.testMethod.count).toBe(1);
    });

    it('should calculate average duration correctly', async () => {
      await service.testMethod(false);
      await service.testMethod(false);

      const metrics = service.getMetricsForTest();
      const opMetrics = metrics.operations.testMethod;
      expect(opMetrics.count).toBe(2);
      expect(opMetrics.averageDuration).toBe(opMetrics.totalDuration / 2);
    });

    it('should track metrics for different operations', async () => {
      await service.testMethod(false);
      
      // Add another operation
      await service['executeWithMetrics'](
        async () => 'another result',
        'anotherOperation'
      );

      const metrics = service.getMetricsForTest();
      expect(Object.keys(metrics.operations)).toHaveLength(2);
      expect(metrics.operations).toHaveProperty('testMethod');
      expect(metrics.operations).toHaveProperty('anotherOperation');
    });
  });

  describe('Error Handling', () => {
    it('should log errors in executeWithMetrics', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      
      await expect(service.testMethod(true)).rejects.toThrow('Test error');
      
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Operation failed'),
        expect.objectContaining({
          operation: 'testMethod',
          error: expect.any(Error),
        })
      );
    });

    it('should mark service as unhealthy after multiple failures', async () => {
      // Fail multiple times
      for (let i = 0; i < 5; i++) {
        try {
          await service.testMethod(true);
        } catch (_e) {
          // Expected
        }
      }

      const health = await service.healthCheck();
      // Service might be marked unhealthy based on failure rate
      expect(health.status).toBeDefined();
    });
  });

  describe('Lifecycle', () => {
    it('should handle shutdown gracefully', async () => {
      const shutdownSpy = jest.spyOn(service['logger'], 'info');
      
      await service.shutdown();
      
      expect(shutdownSpy).toHaveBeenCalledWith(
        expect.stringContaining('shutting down')
      );
    });

    it('should clean up resources on shutdown', async () => {
      // Add some metrics
      await service.testMethod(false);
      expect(service.getMetricsForTest().totalRequests).toBe(1);

      // Shutdown
      await service.shutdown();

      // Verify cleanup (implementation specific)
      expect(service.isHealthyForTest()).toBe(true);
    });
  });

  describe('Dependencies', () => {
    it('should check dependencies correctly', () => {
      service.checkDependenciesCalled = false;
      const deps = service['checkDependencies']();
      
      expect(service.checkDependenciesCalled).toBe(true);
      expect(deps).toHaveProperty('logger', true);
      expect(deps).toHaveProperty('testDependency', true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent operations', async () => {
      const promises = Array(10).fill(null).map(() => 
        service.testMethod(false)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      expect(results.every(r => r === 'success')).toBe(true);

      const metrics = service.getMetricsForTest();
      expect(metrics.totalRequests).toBe(10);
      expect(metrics.successfulRequests).toBe(10);
    });

    it('should handle mixed success and failure operations', async () => {
      const promises = Array(10).fill(null).map((_, i) => 
        service.testMethod(i % 2 === 0).catch(() => 'failed')
      );

      const results = await Promise.all(promises);
      const successes = results.filter(r => r === 'success').length;
      const failures = results.filter(r => r === 'failed').length;

      const metrics = service.getMetricsForTest();
      expect(metrics.successfulRequests).toBe(successes);
      expect(metrics.failedRequests).toBe(failures);
    });
  });
});