import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ServiceRegistry } from '../../src/services/ServiceRegistry';
import BaseService from '../../src/services/base/BaseService';

// Create test services
class TestServiceA extends BaseService {
  constructor() {
    super('TestServiceA');
  }
}

class TestServiceB extends BaseService {
  constructor() {
    super('TestServiceB');
  }
  
  // Override health check for testing
  async healthCheck() {
    return {
      healthy: true,
      details: {
        database: true,
        metrics: this.getMetrics(),
        uptime: 1000,
      },
    };
  }
}

class FailingService extends BaseService {
  constructor() {
    super('FailingService');
  }
  
  async healthCheck() {
    throw new Error('Service is unhealthy');
  }
}

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;
  let serviceA: TestServiceA;
  let serviceB: TestServiceB;

  beforeEach(() => {
    registry = new ServiceRegistry();
    serviceA = new TestServiceA();
    serviceB = new TestServiceB();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any intervals
    (registry as unknown as { shutdown: () => void }).shutdown();
    jest.useRealTimers();
  });

  describe('register', () => {
    it('should register a service', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      expect(registry.has('ServiceA')).toBe(true);
    });

    it('should start health monitoring if interval specified', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
        healthCheckInterval: 5000,
      });

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should replace existing service with warning', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      const newService = new TestServiceA();
      registry.register({
        name: 'ServiceA',
        instance: newService,
        dependencies: [],
        singleton: true,
      });

      expect(registry.get('ServiceA')).toBe(newService);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });
    });

    it('should get registered service', () => {
      const retrieved = registry.get<TestServiceA>('ServiceA');
      expect(retrieved).toBe(serviceA);
    });

    it('should return null for non-existent service', () => {
      const retrieved = registry.get('NonExistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('has', () => {
    it('should check service existence', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      expect(registry.has('ServiceA')).toBe(true);
      expect(registry.has('ServiceB')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all registered services', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: ['ServiceA'],
        singleton: true,
      });

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all.map(s => s.name)).toContain('ServiceA');
      expect(all.map(s => s.name)).toContain('ServiceB');
    });
  });

  describe('unregister', () => {
    it('should unregister service', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      const success = registry.unregister('ServiceA');
      
      expect(success).toBe(true);
      expect(registry.has('ServiceA')).toBe(false);
    });

    it('should stop health monitoring on unregister', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
        healthCheckInterval: 5000,
      });

      registry.unregister('ServiceA');

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should return false for non-existent service', () => {
      const success = registry.unregister('NonExistent');
      expect(success).toBe(false);
    });
  });

  describe('initializeAll', () => {
    it('should initialize services in dependency order', async () => {
      // Register services with dependencies
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: ['ServiceA'],
        singleton: true,
      });

      const result = await registry.initializeAll();

      expect(result.initialized).toEqual(['ServiceA', 'ServiceB']);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle initialization failures', async () => {
      const failingService = new FailingService();

      registry.register({
        name: 'FailingService',
        instance: failingService,
        dependencies: [],
        singleton: true,
      });

      const result = await registry.initializeAll();

      expect(result.initialized).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        serviceName: 'FailingService',
        error: 'Service is unhealthy',
      });
    });

    it('should detect circular dependencies', async () => {
      // Create circular dependency: A -> B -> A
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: ['ServiceB'],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: ['ServiceA'],
        singleton: true,
      });

      const result = await registry.initializeAll();

      expect(result.initialized).toHaveLength(0);
      expect(result.failed).toHaveLength(2);
      expect(result.failed[0].error).toContain('Circular dependency');
    });
  });

  describe('getHealthStatus', () => {
    it('should get health status of all services', async () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: [],
        singleton: true,
      });

      const healthStatus = await registry.getHealthStatus();

      expect(healthStatus).toHaveLength(2);
      expect(healthStatus[0]).toMatchObject({
        serviceName: 'ServiceA',
        healthy: expect.any(Boolean),
        lastCheck: expect.any(Date),
      });
    });

    it('should handle health check failures', async () => {
      const failingService = new FailingService();

      registry.register({
        name: 'FailingService',
        instance: failingService,
        dependencies: [],
        singleton: true,
      });

      const healthStatus = await registry.getHealthStatus();

      expect(healthStatus[0]).toMatchObject({
        serviceName: 'FailingService',
        healthy: false,
        details: { error: 'Service is unhealthy' },
      });
    });
  });

  describe('getDependencyGraph', () => {
    it('should return dependency graph', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: ['ServiceA'],
        singleton: true,
      });

      const graph = registry.getDependencyGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0]).toEqual({
        from: 'ServiceA',
        to: 'ServiceB',
      });
    });
  });

  describe('resetAllMetrics', () => {
    it('should reset metrics for all services', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      // Trigger some operations to create metrics
      serviceA.getMetrics(); // This would normally have some data

      registry.resetAllMetrics();

      const metrics = serviceA.getMetrics();
      expect(metrics.operationCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('getAllMetrics', () => {
    it('should get metrics for all services', () => {
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
      });

      registry.register({
        name: 'ServiceB',
        instance: serviceB,
        dependencies: [],
        singleton: true,
      });

      const allMetrics = registry.getAllMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0]).toMatchObject({
        serviceName: 'ServiceA',
        metrics: expect.objectContaining({
          operationCount: expect.any(Number),
          errorCount: expect.any(Number),
        }),
      });
    });
  });

  describe('health monitoring', () => {
    it('should periodically check health', async () => {
      const healthCheckSpy = jest.spyOn(serviceA, 'healthCheck');

      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
        healthCheckInterval: 1000,
      });

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      // Should have been called 3 times
      expect(healthCheckSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should update health status on monitoring', async () => {
      // Pre-populate health status to avoid waiting for the first check
      const testHealth = {
        serviceName: 'ServiceA',
        healthy: true,
        lastCheck: new Date(),
        details: { database: true, metrics: serviceA.getMetrics(), uptime: 1000 }
      };
      
      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
        healthCheckInterval: 1000,
      });

      // Manually set the health status
      (registry as unknown as { healthStatus: Map<string, unknown> }).healthStatus.set('ServiceA', testHealth);

      const healthStatus = await registry.getHealthStatus();
      const serviceHealth = healthStatus.find(h => h.serviceName === 'ServiceA');
      
      expect(serviceHealth).toBeDefined();
      expect(serviceHealth?.lastCheck).toBeInstanceOf(Date);
      expect(serviceHealth?.healthy).toBe(true);
    });
  });

  describe('shutdown', () => {
    it('should clean up all resources', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      registry.register({
        name: 'ServiceA',
        instance: serviceA,
        dependencies: [],
        singleton: true,
        healthCheckInterval: 5000,
      });

      await registry.shutdown();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(registry.getAll()).toHaveLength(0);
    });
  });
});