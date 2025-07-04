/**
 * BaseService - Base class for all services in the Teaching Engine
 * Provides common functionality and lifecycle management
 */

import { prisma } from '../../prisma.js';
import logger from '../../logger.js';
import { recordDatabaseQuery } from '../../middleware/metrics.js';

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime: Date | null;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  metrics: ServiceMetrics;
  dependencies: Record<string, boolean>;
}

export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly logger: typeof logger;
  protected metrics: ServiceMetrics;
  protected startTime: Date;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = logger.child({ service: serviceName });
    this.startTime = new Date();
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
    };
  }

  /**
   * Initialize the service
   */
  protected async initialize(): Promise<void> {
    this.logger.info(`Initializing ${this.serviceName}`);
  }

  /**
   * Shutdown the service gracefully
   */
  protected async shutdown(): Promise<void> {
    this.logger.info(`Shutting down ${this.serviceName}`);
  }

  /**
   * Get service health status
   */
  public getHealth(): ServiceHealth {
    return {
      status: this.getHealthStatus(),
      uptime: Date.now() - this.startTime.getTime(),
      metrics: { ...this.metrics },
      dependencies: this.checkDependencies(),
    };
  }

  /**
   * Check the health status of the service
   */
  protected getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const errorRate = this.metrics.requestCount > 0 
      ? this.metrics.errorCount / this.metrics.requestCount 
      : 0;

    if (errorRate > 0.5) {
      return 'unhealthy';
    } else if (errorRate > 0.2) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Check dependencies (database, external services, etc.)
   */
  protected checkDependencies(): Record<string, boolean> {
    return {
      database: this.checkDatabaseConnection(),
    };
  }

  /**
   * Check if database connection is healthy
   */
  protected checkDatabaseConnection(): boolean {
    try {
      // Simple check - if prisma is available
      return !!prisma;
    } catch (error) {
      this.logger.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * Record a request execution
   */
  protected recordRequest(duration: number, error?: Error): void {
    this.metrics.requestCount++;
    this.metrics.lastRequestTime = new Date();

    if (error) {
      this.metrics.errorCount++;
      this.logger.error(`Service ${this.serviceName} error:`, error);
    }

    // Update average response time
    const newAverage = (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + duration) 
      / this.metrics.requestCount;
    this.metrics.averageResponseTime = newAverage;
  }

  /**
   * Execute a function with metrics recording
   */
  protected async executeWithMetrics<T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      this.logger.debug(`Executing ${operationName}`);
      const result = await operation();
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.recordRequest(duration, error);
    }
  }

  /**
   * Execute database operation with metrics
   */
  protected async executeDbOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return recordDatabaseQuery(operationName, operation);
  }

  /**
   * Get service name
   */
  public getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Get service metrics
   */
  public getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }
}