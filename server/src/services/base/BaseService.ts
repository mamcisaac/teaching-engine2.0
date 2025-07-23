/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * BaseService - Base class for all services in the Teaching Engine
 * Provides common functionality and lifecycle management
 */

import type { Logger } from '../../logger.js';
import { logger } from '../../logger.js';
import { recordDatabaseQuery } from '../../middleware/metrics.js';
import { prisma } from '../../prisma.js';

export interface OperationMetrics {
  count: number;
  totalDuration: number;
  averageDuration: number;
}

export interface ServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  operations: Record<string, OperationMetrics>;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  uptime: number;
  metrics: ServiceMetrics;
  dependencies: Record<string, boolean>;
}

export abstract class BaseService {
  protected readonly name: string;
  protected readonly logger: Logger;
  protected metrics: ServiceMetrics;
  protected startTime: Date;
  protected lastHealthCheck: Date;
  protected healthyState = true;
  private initialized = false;

  constructor(serviceName: string) {
    this.name = serviceName;
    this.logger = logger.child({ service: serviceName });
    this.startTime = new Date();
    this.lastHealthCheck = new Date();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      operations: {},
    };
  }

  /**
   * Ensure the service is initialized
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }
  }

  /**
   * Initialize the service
   */
  protected initialize(): void {
    this.logger.info(`Initializing ${this.name}`);
  }

  /**
   * Shutdown the service gracefully
   */
  public shutdown(): void {
    this.logger.info(`Service ${this.name} shutting down`);
  }

  /**
   * Perform health check
   */
  public healthCheck(): ServiceHealth {
    this.lastHealthCheck = new Date();
    const dependencies = this.checkDependencies();
    
    return {
      status: this.getHealthStatus(),
      service: this.name,
      uptime: Date.now() - this.startTime.getTime(),
      metrics: this.getServiceMetrics(),
      dependencies,
    };
  }

  /**
   * Check the health status of the service
   */
  protected getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.failedRequests / this.metrics.totalRequests 
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
      logger: true,
    };
  }

  /**
   * Check if database connection is healthy
   */
  protected checkDatabaseConnection(): boolean {
    try {
      // Simple check - if prisma is available
      return prisma !== null;
    } catch (_error) {
      this.logger.error({ error: _error }, 'Database connection check failed');
      return false;
    }
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
      
      // Record success
      this.metrics.totalRequests++;
      this.metrics.successfulRequests++;
      
      // Update operation metrics
      const duration = Date.now() - startTime;
      this.updateOperationMetrics(operationName, duration);
      
      return result;
    } catch (_err) {
      error = _err instanceof Error ? _err : new Error(String(_err));
      
      // Record failure
      this.metrics.totalRequests++;
      this.metrics.failedRequests++;
      
      // Update operation metrics
      const duration = Date.now() - startTime;
      this.updateOperationMetrics(operationName, duration);
      
      // Log error
      this.logger.error({ error, operation: operationName }, `Operation failed: ${operationName}`);
      
      throw error;
    }
  }

  /**
   * Update operation-specific metrics
   */
  private updateOperationMetrics(operationName: string, duration: number): void {
    if (!this.metrics.operations[operationName]) {
      this.metrics.operations[operationName] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }

    const opMetrics = this.metrics.operations[operationName];
    opMetrics.count++;
    opMetrics.totalDuration += duration;
    opMetrics.averageDuration = opMetrics.totalDuration / opMetrics.count;
  }

  /**
   * Get service metrics (protected)
   */
  protected getServiceMetrics(): ServiceMetrics {
    return { ...this.metrics };
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
    return this.name;
  }

  /**
   * Check if service is healthy
   */
  public isHealthy(): boolean {
    return this.healthyState;
  }

  /**
   * Get service metrics (public)
   */
  public getMetrics(): ServiceMetrics {
    return {
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      operations: { ...this.metrics.operations },
    };
  }
}