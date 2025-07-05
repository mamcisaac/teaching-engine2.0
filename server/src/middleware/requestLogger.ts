import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger from '../logger.js';
import { performance } from 'perf_hooks';

// Extend Request interface to include logger and timing
interface ExtendedRequest extends Request {
  logger: typeof logger;
  requestId: string;
  startTime: number;
}


/**
 * Request logging middleware that provides structured logging for all requests
 */
export function requestLoggingMiddleware(req: ExtendedRequest, res: Response, next: NextFunction) {
  // Generate unique request ID
  const requestId = randomUUID();
  const startTime = performance.now();
  
  // Add request ID and timing to request object
  req.requestId = requestId;
  req.startTime = startTime;
  
  // Create child logger with request context
  req.logger = logger.child({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });
  
  // Set request ID in main logger for this request
  logger.setRequestId(requestId);
  
  // Log incoming request
  req.logger.apiRequest(req, {
    query: req.query,
    body: sanitizeRequestBody(req.body),
    headers: sanitizeHeaders(req.headers)
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
    
    req.logger.apiResponse(req, res, duration, {
      responseSize: res.get('Content-Length') || 0,
      cacheStatus: res.get('X-Cache') || 'MISS'
    });
    
    // Log slow requests
    if (duration > 2000) {
      req.logger.warn({
        slowRequest: true,
        duration,
        threshold: 2000
      }, `Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
    }
    
    // Log errors
    if (res.statusCode >= 400) {
      const level = res.statusCode >= 500 ? 'error' : 'warn';
      req.logger[level]({
        errorResponse: true,
        statusCode: res.statusCode,
        duration
      }, `Error response: ${req.method} ${req.url} - ${res.statusCode}`);
    }
  }
  
  // Override response methods
  res.json = function(obj: unknown) {
    logResponse();
    return originalJson.call(this, obj);
  };
  
  res.send = function(body: unknown) {
    logResponse();
    return originalSend.call(this, body);
  };
  
  res.end = function(chunk?: unknown, encoding?: unknown) {
    logResponse();
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Handle request completion
  res.on('finish', () => {
    logResponse();
  });
  
  // Handle request errors
  res.on('error', (error) => {
    req.logger.error({
      responseError: true,
      error: error.message,
      stack: error.stack
    }, `Response error: ${error.message}`);
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
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'authorization',
    'jwt', 'sessionId', 'cookie', 'passphrase', 'privateKey'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
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
  const sanitized = { ...headers };
  
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
    'content-type', 'content-length', 'user-agent', 'accept',
    'accept-encoding', 'accept-language', 'cache-control',
    'x-requested-with', 'x-forwarded-for', 'authorization'
  ];
  
  const filtered: Record<string, unknown> = {};
  relevantHeaders.forEach(header => {
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
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) {
  const requestLogger = req.logger || logger;
  
  requestLogger.error({
    unhandledError: true,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: sanitizeHeaders(req.headers),
      body: sanitizeRequestBody(req.body)
    }
  }, `Unhandled error: ${error.message}`);
  
  next(error);
}

/**
 * Security event logging helper
 */
export function logSecurityEvent(
  req: ExtendedRequest,
  event: string,
  details: Record<string, unknown> = {}
) {
  const requestLogger = req.logger || logger;
  
  requestLogger.security(event, {
    ...details,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}

/**
 * Business operation logging helper
 */
export function logBusinessOperation(
  req: ExtendedRequest,
  operation: string,
  context: Record<string, unknown> = {}
) {
  const requestLogger = req.logger || logger;
  
  requestLogger.business(operation, {
    ...context,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
}

/**
 * Audit trail logging helper
 */
export function logAuditEvent(
  req: ExtendedRequest,
  operation: string,
  details: Record<string, unknown> = {}
) {
  const requestLogger = req.logger || logger;
  
  requestLogger.audit(operation, {
    ...details,
    userId: req.user?.id,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString()
  });
}

export default requestLoggingMiddleware;