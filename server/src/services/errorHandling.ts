/**
 * Comprehensive Error Handling and Recovery System
 * Implements circuit breakers, retry logic, and graceful degradation
 * 
 * For a single teacher with 25 students - focuses on reliability over scale
 */

import { logger } from '../logger';

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5, // Failures before opening circuit
    private timeout = 60000, // 1 minute timeout
    private name = 'CircuitBreaker'
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker ${this.name} opened after ${this.failureCount} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} attempts:`, lastError);
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Wrap async operations with comprehensive error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    retries?: number;
    circuitBreaker?: CircuitBreaker;
    fallback?: () => Promise<R>;
    logContext?: string;
  } = {}
) {
  return async (...args: T): Promise<R> => {
    const { retries = 0, circuitBreaker, fallback, logContext = 'Operation' } = options;

    const operation = async () => {
      try {
        return await fn(...args);
      } catch (error) {
        logger.error(`${logContext} failed:`, error);
        throw error;
      }
    };

    try {
      if (circuitBreaker) {
        if (retries > 0) {
          return await circuitBreaker.execute(() => 
            retryWithBackoff(operation, retries)
          );
        } else {
          return await circuitBreaker.execute(operation);
        }
      } else if (retries > 0) {
        return await retryWithBackoff(operation, retries);
      } else {
        return await operation();
      }
    } catch (error) {
      if (fallback) {
        logger.warn(`${logContext} failed, using fallback`);
        return await fallback();
      }
      throw error;
    }
  };
}

/**
 * Database operation wrapper with retry and fallback
 */
export const withDatabaseResilience = <T extends any[], R>(
  dbOperation: (...args: T) => Promise<R>,
  fallbackData?: R
) => {
  const dbCircuitBreaker = new CircuitBreaker(3, 30000, 'Database');
  
  return withErrorHandling(dbOperation, {
    retries: 2,
    circuitBreaker: dbCircuitBreaker,
    fallback: fallbackData ? () => Promise.resolve(fallbackData) : undefined,
    logContext: 'Database operation'
  });
};

/**
 * File processing wrapper with retry and graceful degradation
 */
export const withFileProcessingResilience = <T extends any[], R>(
  fileOperation: (...args: T) => Promise<R>
) => {
  const fileCircuitBreaker = new CircuitBreaker(2, 60000, 'FileProcessing');
  
  return withErrorHandling(fileOperation, {
    retries: 1,
    circuitBreaker: fileCircuitBreaker,
    logContext: 'File processing'
  });
};

/**
 * Storage operation wrapper
 */
export const withStorageResilience = <T extends any[], R>(
  storageOperation: (...args: T) => Promise<R>
) => {
  const storageCircuitBreaker = new CircuitBreaker(3, 45000, 'Storage');
  
  return withErrorHandling(storageOperation, {
    retries: 2,
    circuitBreaker: storageCircuitBreaker,
    logContext: 'Storage operation'
  });
};

/**
 * Graceful degradation for non-critical operations
 */
export async function gracefulDegradation<T>(
  primaryOperation: () => Promise<T>,
  fallbackValue: T,
  operationName = 'Operation'
): Promise<T> {
  try {
    return await primaryOperation();
  } catch (error) {
    logger.warn(`${operationName} failed, using fallback:`, error);
    return fallbackValue;
  }
}

/**
 * Monitor system health and log alerts
 */
export class HealthMonitor {
  private checks = new Map<string, () => Promise<boolean>>();
  private lastResults = new Map<string, boolean>();
  
  addCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }
  
  async runHealthChecks(): Promise<{ healthy: boolean; checks: Record<string, boolean> }> {
    const results: Record<string, boolean> = {};
    let allHealthy = true;
    
    for (const [name, check] of this.checks) {
      try {
        const result = await Promise.race([
          check(),
          new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        
        results[name] = result;
        
        if (!result) {
          allHealthy = false;
          
          // Alert on state change
          if (this.lastResults.get(name) === true) {
            logger.error(`Health check FAILED: ${name}`);
          }
        } else if (this.lastResults.get(name) === false) {
          logger.info(`Health check RECOVERED: ${name}`);
        }
        
        this.lastResults.set(name, result);
      } catch (error) {
        results[name] = false;
        allHealthy = false;
        logger.error(`Health check ERROR: ${name}:`, error);
        this.lastResults.set(name, false);
      }
    }
    
    return { healthy: allHealthy, checks: results };
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();

// Add basic health checks
healthMonitor.addCheck('database', async () => {
  try {
    const { PrismaClient } = await import('@teaching-engine/database');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return true;
  } catch {
    return false;
  }
});

healthMonitor.addCheck('storage', async () => {
  try {
    const fs = await import('fs/promises');
    await fs.access('./server/uploads');
    return true;
  } catch {
    return false;
  }
});

/**
 * Global error handlers for unhandled errors
 */
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught Exception:', error);
    // Give time to log, then exit gracefully
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal('Unhandled Promise Rejection:', reason);
    // Don't exit for unhandled rejections, just log
  });
};

/**
 * Middleware for request-level error handling
 */
export const requestErrorHandler = (
  req: any,
  res: any,
  next: any
) => {
  // Add request timeout
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    }
  }, 30000); // 30 second timeout

  // Clear timeout when response is sent
  res.on('finish', () => clearTimeout(timeout));
  
  next();
};

export default {
  CircuitBreaker,
  retryWithBackoff,
  withErrorHandling,
  withDatabaseResilience,
  withFileProcessingResilience,
  withStorageResilience,
  gracefulDegradation,
  healthMonitor,
  setupGlobalErrorHandlers,
  requestErrorHandler
};