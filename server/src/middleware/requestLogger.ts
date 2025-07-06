import { Request, Response, NextFunction } from 'express';
// import '../types/express.js';
import { randomUUID } from 'crypto';
import logger from '../logger.js';
import { performance } from 'perf_hooks';

// Extend Request interface to include logger and timing
interface ExtendedRequest extends Request {
  logger: typeof logger;
  requestId: string;
  startTime: number;
  // Allow for additional properties
  [key: string]: unknown;
}

/**
 * Request logging middleware that provides structured logging for all requests
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const extendedReq = req as ExtendedRequest;
  // Generate unique request ID
  const requestId = randomUUID();
  const startTime = performance.now();

  // Add request ID and timing to request object
  extendedReq.requestId = requestId;
  extendedReq.startTime = startTime;

  // Create child logger with request context
  extendedReq.logger = logger.child({
    requestId,
    method: extendedReq.method,
    url: extendedReq.url,
    userAgent: extendedReq.get('User-Agent'),
    ip: extendedReq.ip || extendedReq.connection.remoteAddress,
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

  function logResponse() {
    if (responseLogged) return;
    responseLogged = true;

    const duration = performance.now() - startTime;

    extendedReq.logger.apiResponse(
      extendedReq as Record<string, unknown>,
      res as unknown as Record<string, unknown>,
      duration,
      {
        responseSize: res.get('Content-Length') || 0,
        cacheStatus: res.get('X-Cache') || 'MISS',
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
  res.json = function (obj: unknown) {
    logResponse();
    return originalJson.call(this, obj);
  };

  res.send = function (body: unknown) {
    logResponse();
    return originalSend.call(this, body);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (this: Response, ...args: any[]): Response {
    logResponse();
    return originalEnd.apply(this, args);
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
        error: error.message,
        stack: error.stack,
      },
      `Response error: ${error.message}`,
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
) {
  const extendedReq = req as ExtendedRequest;
  const requestLogger = extendedReq.logger || logger;

  requestLogger.error(
    {
      unhandledError: true,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method: extendedReq.method,
        url: extendedReq.url,
        headers: sanitizeHeaders(extendedReq.headers),
        body: sanitizeRequestBody(extendedReq.body),
      },
    },
    `Unhandled error: ${error.message}`,
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
) {
  const extendedReq = req as ExtendedRequest;
  const requestLogger = extendedReq.logger || logger;

  requestLogger.security(event, {
    ...details,
    ip: extendedReq.ip || extendedReq.connection.remoteAddress,
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
) {
  const extendedReq = req as ExtendedRequest;
  const requestLogger = extendedReq.logger || logger;

  requestLogger.business(operation, {
    ...context,
    userId: (extendedReq.user as { id?: unknown })?.id,
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
) {
  const extendedReq = req as ExtendedRequest;
  const requestLogger = extendedReq.logger || logger;

  requestLogger.audit(operation, {
    ...details,
    userId: (extendedReq.user as { id?: unknown })?.id,
    ip: extendedReq.ip || extendedReq.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });
}

export default requestLoggingMiddleware;
