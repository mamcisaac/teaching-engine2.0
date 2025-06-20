import BaseService from './base/BaseService';
import logger from '../logger';

export interface ServiceHealth {
  serviceName: string;
  healthy: boolean;
  lastCheck: Date;
  details: any;
}

export interface ServiceRegistration {
  name: string;
  instance: BaseService;
  dependencies: string[];
  singleton: boolean;
  healthCheckInterval?: number;
}

export class ServiceRegistry {
  private services = new Map<string, ServiceRegistration>();
  private healthStatus = new Map<string, ServiceHealth>();
  private healthCheckIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Register a service instance
   */
  register(registration: ServiceRegistration): void {
    if (this.services.has(registration.name)) {
      logger.warn({ serviceName: registration.name }, 'Service already registered, replacing');
    }

    this.services.set(registration.name, registration);
    
    // Start health monitoring if interval specified
    if (registration.healthCheckInterval) {
      this.startHealthMonitoring(registration.name, registration.healthCheckInterval);
    }

    logger.info({ 
      serviceName: registration.name, 
      dependencies: registration.dependencies,
      singleton: registration.singleton
    }, 'Service registered');
  }

  /**
   * Get a service instance
   */
  get<T extends BaseService>(serviceName: string): T | null {
    const registration = this.services.get(serviceName);
    if (!registration) {
      logger.warn({ serviceName }, 'Service not found in registry');
      return null;
    }

    return registration.instance as T;
  }

  /**
   * Check if a service is registered
   */
  has(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  /**
   * Get all registered services
   */
  getAll(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  /**
   * Unregister a service
   */
  unregister(serviceName: string): boolean {
    const registration = this.services.get(serviceName);
    if (!registration) {
      return false;
    }

    // Stop health monitoring
    const interval = this.healthCheckIntervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(serviceName);
    }

    this.services.delete(serviceName);
    this.healthStatus.delete(serviceName);

    logger.info({ serviceName }, 'Service unregistered');
    return true;
  }

  /**
   * Initialize all services in dependency order
   */
  async initializeAll(): Promise<{
    initialized: string[];
    failed: { serviceName: string; error: string }[];
  }> {
    const initialized: string[] = [];
    const failed: { serviceName: string; error: string }[] = [];
    const remaining = new Set(this.services.keys());

    // Initialize services in dependency order
    while (remaining.size > 0) {
      let progress = false;

      for (const serviceName of remaining) {
        const registration = this.services.get(serviceName)!;
        
        // Check if all dependencies are initialized
        const dependenciesMet = registration.dependencies.every(dep => 
          initialized.includes(dep)
        );

        if (dependenciesMet) {
          try {
            // Services extending BaseService have built-in health checks
            await registration.instance.healthCheck();
            initialized.push(serviceName);
            remaining.delete(serviceName);
            progress = true;

            logger.info({ serviceName }, 'Service initialized successfully');
          } catch (error) {
            failed.push({ 
              serviceName, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
            remaining.delete(serviceName);
            progress = true;

            logger.error({ serviceName, error }, 'Service initialization failed');
          }
        }
      }

      // Detect circular dependencies
      if (!progress) {
        const remainingServices = Array.from(remaining);
        logger.error({ remainingServices }, 'Circular dependency detected or missing dependencies');
        
        for (const serviceName of remaining) {
          failed.push({ 
            serviceName, 
            error: 'Circular dependency or missing dependencies' 
          });
        }
        break;
      }
    }

    return { initialized, failed };
  }

  /**
   * Get health status of all services
   */
  async getHealthStatus(): Promise<ServiceHealth[]> {
    const healthChecks = Array.from(this.services.values()).map(async (registration) => {
      try {
        const health = await registration.instance.healthCheck();
        const status: ServiceHealth = {
          serviceName: registration.name,
          healthy: health.healthy,
          lastCheck: new Date(),
          details: health.details
        };

        this.healthStatus.set(registration.name, status);
        return status;
      } catch (error) {
        const status: ServiceHealth = {
          serviceName: registration.name,
          healthy: false,
          lastCheck: new Date(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };

        this.healthStatus.set(registration.name, status);
        return status;
      }
    });

    return await Promise.all(healthChecks);
  }

  /**
   * Get dependency graph of all services
   */
  getDependencyGraph(): {
    nodes: { id: string; label: string }[];
    edges: { from: string; to: string }[];
  } {
    const nodes = Array.from(this.services.values()).map(reg => ({
      id: reg.name,
      label: reg.name
    }));

    const edges: { from: string; to: string }[] = [];
    
    for (const registration of this.services.values()) {
      for (const dependency of registration.dependencies) {
        edges.push({
          from: dependency,
          to: registration.name
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Reset all service metrics
   */
  resetAllMetrics(): void {
    for (const registration of this.services.values()) {
      registration.instance.resetMetrics();
    }
    
    logger.info('All service metrics reset');
  }

  /**
   * Get performance metrics for all services
   */
  getAllMetrics(): { serviceName: string; metrics: any }[] {
    return Array.from(this.services.values()).map(registration => ({
      serviceName: registration.name,
      metrics: registration.instance.getMetrics()
    }));
  }

  /**
   * Gracefully shutdown all services
   */
  async shutdown(): Promise<void> {
    logger.info('Starting service registry shutdown');

    // Stop all health check intervals
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Services don't have explicit shutdown methods in BaseService
    // But we can clear the registry
    this.services.clear();
    this.healthStatus.clear();

    logger.info('Service registry shutdown complete');
  }

  // Private methods

  private startHealthMonitoring(serviceName: string, intervalMs: number): void {
    const interval = setInterval(async () => {
      const registration = this.services.get(serviceName);
      if (!registration) {
        clearInterval(interval);
        this.healthCheckIntervals.delete(serviceName);
        return;
      }

      try {
        const health = await registration.instance.healthCheck();
        const status: ServiceHealth = {
          serviceName,
          healthy: health.healthy,
          lastCheck: new Date(),
          details: health.details
        };

        this.healthStatus.set(serviceName, status);

        if (!health.healthy) {
          logger.warn({ serviceName, details: health.details }, 'Service health check failed');
        }
      } catch (error) {
        logger.error({ serviceName, error }, 'Health check error');
        
        this.healthStatus.set(serviceName, {
          serviceName,
          healthy: false,
          lastCheck: new Date(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }, intervalMs);

    this.healthCheckIntervals.set(serviceName, interval);
  }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry();