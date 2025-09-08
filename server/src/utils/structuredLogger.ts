/**
 * Structured logging with correlation IDs
 * Provides consistent, searchable logs with request tracing
 */

import { AsyncLocalStorage } from 'async_hooks';
import { performance } from 'perf_hooks';

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

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

export type LogMeta = Record<string, unknown>;

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
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const context = asyncLocalStorage.getStore();

    const log = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      correlationId: context.correlationId ?? 'no-correlation-id',
      ...(context.userId !== undefined ? { userId: context.userId } : {}),
      ...(context.requestId !== undefined && context.requestId !== '' ? { requestId: context.requestId } : {}),
      ...(context.sessionId !== undefined && context.sessionId !== '' ? { sessionId: context.sessionId } : {}),
      ...(info.duration !== undefined ? { duration: info.duration } : {}),
      ...(info.meta !== undefined ? { meta: info.meta } : {}),
      ...(info.error !== null && typeof info.error === 'object' && 'message' in info.error ? {
        error: {
          message: (info.error as Error).message,
          stack: (info.error as Error).stack,
          code: (info.error as { code?: string }).code,
        },
      } : {}),
    };

    // Add trace context if available
    if (context.traceId !== undefined && context.traceId !== '') {
      (log as Record<string, unknown>).trace = {
        traceId: context.traceId,
        spanId: context.spanId,
        parentSpanId: context.parentSpanId,
      };
    }

    return JSON.stringify(log);
  }),
);

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: logFormat,
  defaultMeta: {
    service: 'teaching-engine',
    environment: process.env.NODE_ENV ?? 'development',
    version: process.env.APP_VERSION ?? '1.0.0',
  },
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      silent: process.env.NODE_ENV === 'test',
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
          }),
          new transports.File({
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
  private static instance: StructuredLogger | undefined;

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Log with automatic context injection
   */
  log(level: LogLevel, message: string, meta?: LogMeta): void {
    const context = asyncLocalStorage.getStore();
    const duration = context.startTime !== undefined
      ? Math.round(performance.now() - context.startTime)
      : undefined;

    logger.log(level, message, {
      meta,
      duration,
      ...(meta.error !== undefined ? { error: meta.error } : {}),
    });
  }

  error(message: string, error?: Error, meta?: LogMeta): void {
    this.log(LogLevel.ERROR, message, { ...meta, error });
  }

  warn(message: string, meta?: LogMeta): void {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log(LogLevel.INFO, message, meta);
  }

  http(message: string, meta?: LogMeta): void {
    this.log(LogLevel.HTTP, message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  trace(message: string, meta?: LogMeta): void {
    this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<LogContext>): StructuredLogger {
    const childLogger = new StructuredLogger();
    const parentContext = asyncLocalStorage.getStore() ?? {};

    // Merge contexts
    const childContext = { ...parentContext, ...additionalContext };

    // Return a proxy that runs in the child context
    return new Proxy(childLogger, {
      get(target, prop): unknown {
        if (typeof target[prop as keyof StructuredLogger] === 'function') {
          return (...args: unknown[]) => 
            asyncLocalStorage.run(childContext as LogContext, () => 
              (target[prop as keyof StructuredLogger] as (...args: unknown[]) => unknown)(
                ...args,
              )
            );
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
      context.parentSpanId = parentSpanId ?? context.spanId;
    }

    this.trace(`Span started: ${name}`, { spanId, parentSpanId });
    return spanId;
  }

  /**
   * End a span and log duration
   */
  endSpan(spanId: string, name: string): void {
    const context = asyncLocalStorage.getStore();
    const duration = context.startTime !== undefined
      ? Math.round(performance.now() - context.startTime)
      : undefined;

    this.trace(`Span ended: ${name}`, { spanId, duration });
  }
}

/**
 * Express middleware for correlation ID and structured logging
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate or extract correlation ID
  const correlationId =
    (req.headers['x-correlation-id'] as string | undefined) ??
    (req.headers['x-request-id'] as string | undefined) ??
    uuidv4();

  // Generate request ID
  const requestId = uuidv4();

  // Extract trace context if available
  const traceId = (req.headers['x-trace-id'] as string | undefined) ?? uuidv4();
  const spanId = req.headers['x-span-id'] as string;
  const parentSpanId = req.headers['x-parent-span-id'] as string;

  // Create context
  const context: LogContext = {
    correlationId,
    requestId,
    traceId,
    spanId: spanId !== undefined ? spanId : uuidv4(),
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
    res.send = function (data: unknown): Response {
      res.send = originalSend;

      const duration = context.startTime !== undefined ? Math.round(performance.now() - context.startTime) : 0;

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
  if (body === null || body === undefined || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...(body as Record<string, unknown>) };

  for (const field of sensitiveFields) {
    if (sanitized[field] !== null) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitize headers to remove sensitive data
 */
function sanitizeHeaders(headers: unknown): unknown {
  if (headers === null || headers === undefined || typeof headers !== 'object') {
    return headers;
  }

  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...(headers as Record<string, unknown>) };

  for (const header of sensitiveHeaders) {
    if (sanitized[header] !== null) {
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
  const currentContext = asyncLocalStorage.getStore() ?? {};
  return asyncLocalStorage.run({ ...currentContext, ...context } as LogContext, fn);
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
): void {
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
