import { randomUUID } from 'crypto';
import { performance } from 'perf_hooks';

import type { Request, Response, NextFunction } from 'express';

// import '../types/express.js';
import { logger } from '../logger';

// Extend Request interface to include logger and timing
interface ExtendedRequest extends Request {
  logger: typeof logger;
  requestId: string;
  startTime: number;
  // Allow for additional properties
  [key: string]: unknown;
}

/**
 * Type guard to check if a request has been extended with logging properties
 */
function isExtendedRequest(req: Request): req is ExtendedRequest {
  return 'requestId' in req && 'startTime' in req && 'logger' in req;
}

/**
 * Safely get extended request properties with fallbacks
 */
function getExtendedRequest(req: Request): ExtendedRequest {
  if (isExtendedRequest(req)) {
    return req;
  }
  // If not extended, cast and add minimal defaults
  // This should not happen in normal flow, but provides safety
  const extendedReq = req as ExtendedRequest;
  extendedReq.requestId = extendedReq.requestId ?? 'unknown';
  extendedReq.startTime = extendedReq.startTime ?? Date.now();
  extendedReq.logger = extendedReq.logger ?? logger;
  return extendedReq;
}

/**
 * Request logging middleware that provides structured logging for all requests
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID and timing
  const requestId = randomUUID();
  const startTime = performance.now();

  // Extend request object with logging properties
  Object.assign(req, {
    requestId,
    startTime,
  });
  
  // Now safely get the extended request
  const extendedReq = getExtendedRequest(req);

  // Create child logger with request context
  extendedReq.logger = logger.child({
    requestId,
    method: extendedReq.method,
    url: extendedReq.url,
    userAgent: extendedReq.get('User-Agent'),
    ip: extendedReq.ip !== null && extendedReq.ip !== undefined && extendedReq.ip !== '' ? extendedReq.ip : extendedReq.connection.remoteAddress,
  });

  // Set request ID in main logger for this request
  logger.setRequestId(requestId);

  // Log incoming request
  extendedReq.logger.apiRequest(extendedReq, {
    query: extendedReq.query,
    body: sanitizeRequestBody(extendedReq.body),
    headers: sanitizeHeaders(extendedReq.headers),
  });

  // Override response methods to log response
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;

  // Track if response has been logged to avoid duplicates
  let responseLogged = false;

  function logResponse(): void {
    if (responseLogged) {
return;
}
    responseLogged = true;

    const duration = performance.now() - startTime;

    extendedReq.logger.apiResponse(
      extendedReq,
      res as unknown as Record<string, unknown>,
      duration,
      {
        responseSize: res.get('Content-Length') !== null && res.get('Content-Length') !== undefined && res.get('Content-Length') !== '' ? res.get('Content-Length') : 0,
        cacheStatus: res.get('X-Cache') !== null && res.get('X-Cache') !== undefined && res.get('X-Cache') !== '' ? res.get('X-Cache') : 'MISS',
      },
    );

    // Log slow requests
    if (duration > 2000) {
      extendedReq.logger.warn(
        {
          slowRequest: true,
          duration,
          threshold: 2000,
        },
        `Slow request detected: ${extendedReq.method} ${extendedReq.url} took ${duration}ms`,
      );
    }

    // Log errors
    if (res.statusCode >= 400) {
      const level = res.statusCode >= 500 ? 'error' : 'warn';
      extendedReq.logger[level](
        {
          errorResponse: true,
          statusCode: res.statusCode,
          duration,
        },
        `Error response: ${extendedReq.method} ${extendedReq.url} - ${res.statusCode}`,
      );
    }
  }

  // Override response methods
  res.json = function (obj: unknown): Response {
    logResponse();
    return originalJson.call(this, obj);
  };

  res.send = function (body: unknown): Response {
    logResponse();
    return originalSend.call(this, body);
  };

  // Override res.end to match all Express Response.end() signatures
  res.end = function (this: Response, chunk?: any, encoding?: any, cb?: any): Response {
    logResponse();
    
    // Use type assertion to bypass strict typing and call original method with arguments
    // This handles all Express Response.end overloads correctly at runtime
    const originalMethod = originalEnd as any;
    
    if (arguments.length === 0) {
      return originalMethod.call(this);
    } else if (arguments.length === 1) {
      return originalMethod.call(this, chunk);
    } else if (arguments.length === 2) {
      return originalMethod.call(this, chunk, encoding);
    } 
      return originalMethod.call(this, chunk, encoding, cb);
    
  };

  // Handle request completion
  res.on('finish', () => {
    logResponse();
  });

  // Handle request errors
  res.on('error', (error) => {
    extendedReq.logger.error(
      {
        responseError: true,
        error: (error instanceof Error ? error.message : String(error)),
        stack: error.stack,
      },
      `Response error: ${(error instanceof Error ? error.message : String(error))}`,
    );
  });

  next();
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body } as Record<string, unknown>;

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'authorization',
    'jwt',
    'sessionId',
    'cookie',
    'passphrase',
    'privateKey',
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach((key) => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers: unknown): unknown {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const sanitized = { ...headers } as Record<string, unknown>;

  // Remove or redact sensitive headers
  if (sanitized.authorization) {
    sanitized.authorization = '[REDACTED]';
  }

  if (sanitized.cookie) {
    sanitized.cookie = '[REDACTED]';
  }

  if (sanitized['x-api-key']) {
    sanitized['x-api-key'] = '[REDACTED]';
  }

  // Keep only relevant headers for logging
  const relevantHeaders = [
    'content-type',
    'content-length',
    'user-agent',
    'accept',
    'accept-encoding',
    'accept-language',
    'cache-control',
    'x-requested-with',
    'x-forwarded-for',
    'authorization',
  ];

  const filtered: Record<string, unknown> = {};
  relevantHeaders.forEach((header) => {
    if (sanitized[header]) {
      filtered[header] = sanitized[header];
    }
  });

  return filtered;
}

/**
 * Error logging middleware - catches and logs unhandled errors
 */
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const extendedReq = getExtendedRequest(req);
  const requestLogger = extendedReq.logger;

  requestLogger.error(
    {
      unhandledError: true,
      error: {
        name: error.name,
        message: (error instanceof Error ? error.message : String(error)),
        stack: error.stack,
      },
      request: {
        method: extendedReq.method,
        url: extendedReq.url,
        headers: sanitizeHeaders(extendedReq.headers),
        body: sanitizeRequestBody(extendedReq.body),
      },
    },
    `Unhandled error: ${(error instanceof Error ? error.message : String(error))}`,
  );

  next(error);
}

/**
 * Security event logging helper
 */
export function logSecurityEvent(
  req: Request,
  event: string,
  details: Record<string, unknown> = {},
): void {
  const extendedReq = getExtendedRequest(req);
  const requestLogger = extendedReq.logger;

  requestLogger.security(event, {
    ...details,
    ip: (extendedReq.ip !== null && extendedReq.ip !== undefined && extendedReq.ip !== '') ? extendedReq.ip : extendedReq.connection.remoteAddress,
    userAgent: extendedReq.get('User-Agent'),
    method: extendedReq.method,
    url: extendedReq.url,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Business operation logging helper
 */
export function logBusinessOperation(
  req: Request,
  operation: string,
  context: Record<string, unknown> = {},
): void {
  const extendedReq = getExtendedRequest(req);
  const requestLogger = extendedReq.logger;

  requestLogger.business(operation, {
    ...context,
    userId: extendedReq.user && typeof extendedReq.user === 'object' && 'id' in extendedReq.user ? (extendedReq.user as { id: unknown }).id : undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Audit trail logging helper
 */
export function logAuditEvent(
  req: Request,
  operation: string,
  details: Record<string, unknown> = {},
): void {
  const extendedReq = getExtendedRequest(req);
  const requestLogger = extendedReq.logger;

  requestLogger.audit(operation, {
    ...details,
    userId: extendedReq.user && typeof extendedReq.user === 'object' && 'id' in extendedReq.user ? (extendedReq.user as { id: unknown }).id : undefined,
    ip: (extendedReq.ip !== null && extendedReq.ip !== undefined && extendedReq.ip !== '') ? extendedReq.ip : extendedReq.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });
}
