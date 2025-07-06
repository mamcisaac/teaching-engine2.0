/**
 * Structured logging with correlation IDs
 * Provides consistent, searchable logs with request tracing
 */

import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
import { performance } from 'perf_hooks';

// Async context for storing request metadata
const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export interface LogContext {
  correlationId: string;
  userId?: number;
  requestId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  startTime?: number;
  [key: string]: unknown;
}

export interface LogMeta {
  [key: string]: unknown;
}

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
  TRACE = 'trace',
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const context = asyncLocalStorage.getStore();

    const log = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      correlationId: context?.correlationId || 'no-correlation-id',
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
      ...(context?.sessionId && { sessionId: context.sessionId }),
      ...(info.duration && { duration: info.duration }),
      ...(info.meta && { meta: info.meta }),
      ...(info.error && {
        error: {
          message: info.error.message,
          stack: info.error.stack,
          code: info.error.code,
        },
      }),
    };

    // Add trace context if available
    if (context?.traceId) {
      log.trace = {
        traceId: context.traceId,
        spanId: context.spanId,
        parentSpanId: context.parentSpanId,
      };
    }

    return JSON.stringify(log);
  }),
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'teaching-engine',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      silent: process.env.NODE_ENV === 'test',
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

// Add structured logging methods
export class StructuredLogger {
  private static instance: StructuredLogger;

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Log with automatic context injection
   */
  log(level: LogLevel, message: string, meta?: LogMeta) {
    const context = asyncLocalStorage.getStore();
    const duration = context?.startTime
      ? Math.round(performance.now() - context.startTime)
      : undefined;

    logger.log(level, message, {
      meta,
      duration,
      ...(meta?.error && { error: meta.error }),
    });
  }

  error(message: string, error?: Error, meta?: LogMeta) {
    this.log(LogLevel.ERROR, message, { ...meta, error });
  }

  warn(message: string, meta?: LogMeta) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: LogMeta) {
    this.log(LogLevel.INFO, message, meta);
  }

  http(message: string, meta?: LogMeta) {
    this.log(LogLevel.HTTP, message, meta);
  }

  debug(message: string, meta?: LogMeta) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  trace(message: string, meta?: LogMeta) {
    this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<LogContext>): StructuredLogger {
    const childLogger = new StructuredLogger();
    const parentContext = asyncLocalStorage.getStore() || {};

    // Merge contexts
    const childContext = { ...parentContext, ...additionalContext };

    // Return a proxy that runs in the child context
    return new Proxy(childLogger, {
      get(target, prop) {
        if (typeof target[prop as keyof StructuredLogger] === 'function') {
          return (...args: unknown[]) => {
            return asyncLocalStorage.run(childContext, () => {
              return (target[prop as keyof StructuredLogger] as (...args: unknown[]) => unknown)(
                ...args,
              );
            });
          };
        }
        return target[prop as keyof StructuredLogger];
      },
    });
  }

  /**
   * Start a new span for distributed tracing
   */
  startSpan(name: string, parentSpanId?: string): string {
    const spanId = uuidv4();
    const context = asyncLocalStorage.getStore();

    if (context) {
      context.spanId = spanId;
      context.parentSpanId = parentSpanId || context.spanId;
    }

    this.trace(`Span started: ${name}`, { spanId, parentSpanId });
    return spanId;
  }

  /**
   * End a span and log duration
   */
  endSpan(spanId: string, name: string) {
    const context = asyncLocalStorage.getStore();
    const duration = context?.startTime
      ? Math.round(performance.now() - context.startTime)
      : undefined;

    this.trace(`Span ended: ${name}`, { spanId, duration });
  }
}

/**
 * Express middleware for correlation ID and structured logging
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate or extract correlation ID
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    uuidv4();

  // Generate request ID
  const requestId = uuidv4();

  // Extract trace context if available
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const spanId = req.headers['x-span-id'] as string;
  const parentSpanId = req.headers['x-parent-span-id'] as string;

  // Create context
  const context: LogContext = {
    correlationId,
    requestId,
    traceId,
    spanId: spanId || uuidv4(),
    parentSpanId,
    startTime: performance.now(),
    userId: (req as Request & { user?: { id: number } }).user?.id,
    sessionId: (req as Request & { session?: { id: string } }).session?.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  // Store context in async storage
  asyncLocalStorage.run(context, () => {
    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Trace-ID', traceId);

    // Log request
    const structuredLogger = StructuredLogger.getInstance();
    structuredLogger.http(`${req.method} ${req.path}`, {
      query: req.query,
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
      headers: sanitizeHeaders(req.headers),
    });

    // Log response
    const originalSend = res.send;
    res.send = function (data: unknown) {
      res.send = originalSend;

      const duration = Math.round(performance.now() - context.startTime);

      structuredLogger.http(`${req.method} ${req.path} ${res.statusCode}`, {
        statusCode: res.statusCode,
        duration,
        responseSize: Buffer.byteLength(JSON.stringify(data)),
      });

      return res.send(data);
    };

    next();
  });
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object' || body === null) return body;

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...(body as Record<string, unknown>) };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitize headers to remove sensitive data
 */
function sanitizeHeaders(headers: unknown): unknown {
  if (!headers || typeof headers !== 'object' || headers === null) return headers;

  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...(headers as Record<string, unknown>) };

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Run function with logging context
 */
export async function withLoggingContext<T>(
  context: Partial<LogContext>,
  fn: () => Promise<T>,
): Promise<T> {
  return asyncLocalStorage.run({ ...asyncLocalStorage.getStore(), ...context } as LogContext, fn);
}

/**
 * Get current logging context
 */
export function getLoggingContext(): LogContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Express error handler with structured logging
 */
export function errorLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const structuredLogger = StructuredLogger.getInstance();

  structuredLogger.error('Unhandled error', err, {
    statusCode: res.statusCode,
    path: req.path,
    method: req.method,
  });

  // Continue to next error handler
  next(err);
}

// Export singleton instance
export const structuredLogger = StructuredLogger.getInstance();
