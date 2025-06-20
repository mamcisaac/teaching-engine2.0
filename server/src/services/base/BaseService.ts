import { PrismaClient, Prisma } from '@teaching-engine/database';
import { prisma } from '../../prisma';
import logger from '../../logger';
import type { Logger } from 'pino';

export interface ServiceMetrics {
  operationCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastOperation: Date;
}

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

export abstract class BaseService {
  protected readonly prisma: PrismaClient;
  protected readonly logger: Logger;
  protected readonly serviceName: string;
  private metrics: ServiceMetrics;

  constructor(serviceName?: string) {
    this.prisma = prisma;
    this.serviceName = serviceName || this.constructor.name;
    this.logger = logger.child({ service: this.serviceName });
    this.metrics = {
      operationCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastOperation: new Date()
    };
  }

  /**
   * Execute a function with retry logic and metrics tracking
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts: RetryOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      exponentialBackoff: true,
      ...options
    };

    const startTime = Date.now();
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      try {
        const result = await operation();
        
        // Update metrics on success
        this.updateMetrics(Date.now() - startTime, false);
        
        if (attempt > 1) {
          this.logger.info({ attempt, serviceName: this.serviceName }, 
            'Operation succeeded after retry');
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt <= opts.maxRetries) {
          const delay = opts.exponentialBackoff 
            ? Math.min(opts.baseDelay * Math.pow(2, attempt - 1), opts.maxDelay)
            : opts.baseDelay;

          this.logger.warn({ 
            error: error.message, 
            attempt, 
            maxRetries: opts.maxRetries,
            nextRetryIn: delay,
            serviceName: this.serviceName
          }, 'Operation failed, retrying');

          await this.sleep(delay);
        }
      }
    }

    // Update metrics on final failure
    this.updateMetrics(Date.now() - startTime, true);
    
    this.logger.error({ 
      error: lastError, 
      attempts: opts.maxRetries + 1,
      serviceName: this.serviceName
    }, 'All retry attempts failed');
    
    throw lastError;
  }

  /**
   * Execute a function within a database transaction
   */
  protected async withTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return await this.withRetry(async () => {
      return await this.prisma.$transaction(operation);
    });
  }

  /**
   * Execute multiple operations in parallel with error handling
   */
  protected async withParallel<T>(
    operations: (() => Promise<T>)[],
    options: { 
      failFast?: boolean;
      maxConcurrency?: number;
    } = {}
  ): Promise<{
    results: (T | null)[];
    errors: (Error | null)[];
    successCount: number;
  }> {
    const { failFast = false, maxConcurrency = 10 } = options;
    const results: (T | null)[] = [];
    const errors: (Error | null)[] = [];
    let successCount = 0;

    // Process operations in batches if max concurrency is set
    const batches = this.createBatches(operations, maxConcurrency);

    for (const batch of batches) {
      const promises = batch.map(async (operation, index) => {
        try {
          const result = await operation();
          results[index] = result;
          errors[index] = null;
          successCount++;
          return result;
        } catch (error) {
          results[index] = null;
          errors[index] = error as Error;
          
          if (failFast) {
            throw error;
          }
          
          this.logger.warn({ 
            error: (error as Error).message, 
            operationIndex: index,
            serviceName: this.serviceName
          }, 'Parallel operation failed');
          
          return null;
        }
      });

      await Promise.all(promises);
      
      if (failFast && errors.some(e => e !== null)) {
        break;
      }
    }

    return { results, errors, successCount };
  }

  /**
   * Standardized error handling
   */
  protected handleError(error: unknown, context?: Record<string, any>): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.logger.error({
      error: errorMessage,
      stack: errorStack,
      context,
      serviceName: this.serviceName
    }, 'Service operation failed');

    // Re-throw with service context
    if (error instanceof Error) {
      error.message = `${this.serviceName}: ${error.message}`;
      throw error;
    }
    
    throw new Error(`${this.serviceName}: ${errorMessage}`);
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(
    params: Record<string, any>, 
    required: string[]
  ): void {
    const missing = required.filter(key => 
      params[key] === undefined || params[key] === null || params[key] === ''
    );

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize and validate input data
   */
  protected sanitizeInput<T extends Record<string, any>>(
    input: T,
    schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array'>
  ): T {
    const sanitized = { ...input };

    for (const [key, expectedType] of Object.entries(schema)) {
      const value = sanitized[key as keyof T];
      
      if (value === undefined || value === null) continue;

      switch (expectedType) {
        case 'string':
          if (typeof value !== 'string') {
            sanitized[key as keyof T] = String(value) as any;
          }
          // Trim whitespace and limit length
          sanitized[key as keyof T] = String(value).trim().slice(0, 1000) as any;
          break;
          
        case 'number':
          if (typeof value !== 'number') {
            const parsed = Number(value);
            if (isNaN(parsed)) {
              throw new Error(`Invalid number value for ${key}: ${value}`);
            }
            sanitized[key as keyof T] = parsed as any;
          }
          break;
          
        case 'boolean':
          if (typeof value !== 'boolean') {
            sanitized[key as keyof T] = Boolean(value) as any;
          }
          break;
          
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`Expected object for ${key}, got ${typeof value}`);
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            throw new Error(`Expected array for ${key}, got ${typeof value}`);
          }
          break;
      }
    }

    return sanitized;
  }

  /**
   * Get service performance metrics
   */
  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset service metrics
   */
  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastOperation: new Date()
    };
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    details: {
      database: boolean;
      metrics: ServiceMetrics;
      uptime: number;
    };
  }> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        healthy: true,
        details: {
          database: true,
          metrics: this.getMetrics(),
          uptime: Date.now() - this.metrics.lastOperation.getTime()
        }
      };
    } catch (error) {
      this.logger.error({ error }, 'Health check failed');
      
      return {
        healthy: false,
        details: {
          database: false,
          metrics: this.getMetrics(),
          uptime: Date.now() - this.metrics.lastOperation.getTime()
        }
      };
    }
  }

  // Private helper methods

  private updateMetrics(responseTime: number, isError: boolean): void {
    this.metrics.operationCount++;
    this.metrics.lastOperation = new Date();
    
    if (isError) {
      this.metrics.errorCount++;
    }
    
    // Update rolling average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.operationCount - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.operationCount;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

export default BaseService;