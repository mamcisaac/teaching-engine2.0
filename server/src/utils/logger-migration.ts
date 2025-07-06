/**
 * Logger migration utilities
 * Helps migrate from old logger to structured logger
 */

import { structuredLogger, LogMeta, StructuredLogger } from './structuredLogger';
import * as winston from 'winston';
import { Request, Response } from 'express';

// Legacy logger interface for backward compatibility
interface LegacyLogger {
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  log: (level: string, message: string, ...args: unknown[]) => void;
}

/**
 * Create a backward-compatible logger that uses structured logging
 */
export function createCompatibleLogger(): LegacyLogger {
  return {
    error(message: string, ...args: unknown[]) {
      const [error, meta] = parseArgs(args);
      if (error instanceof Error) {
        structuredLogger.error(message, error, meta);
      } else {
        structuredLogger.error(message, undefined, { ...meta, data: error });
      }
    },

    warn(message: string, ...args: unknown[]) {
      const [data, meta] = parseArgs(args);
      structuredLogger.warn(message, { ...meta, data });
    },

    info(message: string, ...args: unknown[]) {
      const [data, meta] = parseArgs(args);
      structuredLogger.info(message, { ...meta, data });
    },

    debug(message: string, ...args: unknown[]) {
      const [data, meta] = parseArgs(args);
      structuredLogger.debug(message, { ...meta, data });
    },

    log(level: string, message: string, ...args: unknown[]) {
      const [data, meta] = parseArgs(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (structuredLogger as any).log(level, message, { ...meta, data });
    },
  };
}

/**
 * Parse legacy logger arguments
 */
function parseArgs(args: unknown[]): [unknown, LogMeta?] {
  if (args.length === 0) {
    return [undefined, undefined];
  }

  if (args.length === 1) {
    return [args[0], undefined];
  }

  // If last arg looks like metadata, separate it
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'object' && !Array.isArray(lastArg) && !(lastArg instanceof Error)) {
    return [args.slice(0, -1)[0], lastArg];
  }

  return [args[0], { additionalArgs: args.slice(1) }];
}

/**
 * Winston transport that forwards to structured logger
 */
export class StructuredLoggerTransport extends winston.transports.Stream {
  constructor(options?: winston.transports.StreamTransportOptions) {
    super(options);
  }

  log(info: winston.LogEntry, callback: () => void) {
    const { level, message, ...meta } = info;

    // Forward to structured logger
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (structuredLogger as any).log(level, message, meta);

    callback();
  }
}

/**
 * Helper to update log statements in code
 * This is a utility function to help with migration
 */
export function migrateLogStatement(oldStatement: string): string {
  // Pattern: logger.error('message', error) → structuredLogger.error('message', error)
  if (oldStatement.match(/logger\.error\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)\s*\)/)) {
    return oldStatement.replace(
      /logger\.error\s*\(\s*(['"`][^'"`]+['"`])\s*,\s*(\w+)\s*\)/,
      'structuredLogger.error($1, $2)',
    );
  }

  // Pattern: logger.info('message', data) → structuredLogger.info('message', { data })
  if (
    oldStatement.match(/logger\.(info|warn|debug)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/)
  ) {
    return oldStatement.replace(
      /logger\.(info|warn|debug)\s*\(\s*(['"`][^'"`]+['"`])\s*,\s*([^)]+)\s*\)/,
      'structuredLogger.$1($2, { data: $3 })',
    );
  }

  // Pattern: console.log(...) → structuredLogger.info(...)
  if (oldStatement.match(/console\.log\s*\(/)) {
    return oldStatement.replace(/console\.log/, 'structuredLogger.info');
  }

  // Pattern: console.error(...) → structuredLogger.error(...)
  if (oldStatement.match(/console\.error\s*\(/)) {
    return oldStatement.replace(/console\.error/, 'structuredLogger.error');
  }

  return oldStatement;
}

/**
 * Express middleware to add logging methods to request object
 */
export function requestLoggerMiddleware(
  req: Request & {
    logger?: StructuredLogger;
    logInfo?: (message: string, meta?: LogMeta) => void;
    logError?: (message: string, error: Error, meta?: LogMeta) => void;
    logWarn?: (message: string, meta?: LogMeta) => void;
    logDebug?: (message: string, meta?: LogMeta) => void;
    id?: string;
  },
  res: Response,
  next: () => void,
) {
  // Add logger to request for convenience
  req.logger = structuredLogger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  // Helper methods
  req.logInfo = (message: string, meta?: LogMeta) => {
    req.logger.info(message, meta);
  };

  req.logError = (message: string, error: Error, meta?: LogMeta) => {
    req.logger.error(message, error, meta);
  };

  req.logWarn = (message: string, meta?: LogMeta) => {
    req.logger.warn(message, meta);
  };

  req.logDebug = (message: string, meta?: LogMeta) => {
    req.logger.debug(message, meta);
  };

  next();
}

/**
 * Utility to extract correlation ID from various sources
 */
export function extractCorrelationId(source: {
  headers?: Record<string, string>;
  id?: string;
  correlationId?: string;
  requestId?: string;
}): string | undefined {
  // From Express request
  if (source.headers) {
    return source.headers['x-correlation-id'] || source.headers['x-request-id'] || source.id;
  }

  // From context object
  if (source.correlationId) {
    return source.correlationId;
  }

  // From async context
  if (source._correlationId) {
    return source._correlationId;
  }

  return undefined;
}

/**
 * Performance logging helper
 */
export class PerformanceLogger {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();

    structuredLogger.debug(`${operation} started`, {
      operation,
      startTime: this.startTime,
    });
  }

  end(metadata?: LogMeta) {
    const duration = Date.now() - this.startTime;

    structuredLogger.info(`${this.operation} completed`, {
      operation: this.operation,
      duration,
      ...metadata,
    });

    // Log warning for slow operations
    if (duration > 1000) {
      structuredLogger.warn(`Slow operation detected: ${this.operation}`, {
        operation: this.operation,
        duration,
        threshold: 1000,
      });
    }

    return duration;
  }
}

// Re-export for convenience
export {
  structuredLogger,
  correlationMiddleware,
  errorLoggingMiddleware,
} from './structuredLogger';
