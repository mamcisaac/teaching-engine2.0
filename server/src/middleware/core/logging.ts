import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../logger';
import { addSpanAttributes } from '../../monitoring/telemetry';
import { AuditEventType } from '../auditLogger';

// Extended request interface
interface LoggedRequest extends Request {
  id?: string;
  startTime?: number;
  user?: {
    id: number;
    email: string;
    role: string;
    organizationId?: number;
    permissions?: string[];
  };
}

// Sanitize sensitive data from logs
const sanitizeData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data;

  const sensitive = ['password', 'token', 'secret', 'authorization', 'cookie'];
  const sanitized = { ...data } as Record<string, unknown>;

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitive.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

// Main request logging middleware
export const requestLoggingMiddleware = (
  req: LoggedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Generate request ID
  req.id = req.id || uuidv4();
  req.startTime = Date.now();

  // Add to response locals for other middleware
  res.locals.requestId = req.id;

  // Set request ID header
  res.setHeader('X-Request-ID', req.id);

  // Add OpenTelemetry attributes
  addSpanAttributes({
    'http.request_id': req.id,
    'http.method': req.method,
    'http.path': req.path,
    'http.user_agent': req.get('user-agent') || 'unknown',
  });

  // Log request
  const requestLog: Record<string, unknown> = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: sanitizeData(req.query),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  };

  // Don't log body for GET requests or file uploads
  if (req.method !== 'GET' && !req.is('multipart/form-data')) {
    requestLog.body = sanitizeData(req.body);
  }

  logger.info(requestLog, 'Incoming request');

  // Capture response
  const originalSend = res.send;
  res.send = function (data: unknown) {
    res.locals.body = data;
    return originalSend.call(this, data);
  };

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0);
    const responseLog: Record<string, unknown> = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    };

    // Add response size if available
    const contentLength = res.get('content-length');
    if (contentLength) {
      responseLog.responseSize = parseInt(contentLength, 10);
    }

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(responseLog, 'Request failed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(responseLog, 'Request failed with client error');
    } else if (duration > 2000) {
      logger.warn(responseLog, 'Slow request detected');
    } else {
      logger.info(responseLog, 'Request completed');
    }

    // Add metrics attributes
    addSpanAttributes({
      'http.status_code': res.statusCode,
      'http.response_time': duration,
    });
  });

  next();
};

// Re-export AuditEventType from auditLogger
export { AuditEventType };

// Audit logging for sensitive operations
export interface AuditEvent {
  eventType: AuditEventType;
  userId?: number;
  userEmail?: string;
  targetResource?: string;
  targetId?: string | number;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userAgent?: string;
}

// Audit logger
export const auditLog = (req: LoggedRequest, event: AuditEvent): void => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    eventType: event.eventType,
    userId: event.userId || req.user?.id,
    userEmail: event.userEmail || req.user?.email,
    targetResource: event.targetResource,
    targetId: event.targetId,
    metadata: sanitizeData(event.metadata),
    severity: event.severity || 'low',
    ip: event.ip || req.ip,
    userAgent: event.userAgent || req.get('user-agent'),
    method: req.method,
    path: req.path,
  };

  // Log based on severity
  switch (event.severity) {
    case 'critical':
      logger.fatal(auditEntry, `AUDIT [${event.eventType}]`);
      break;
    case 'high':
      logger.error(auditEntry, `AUDIT [${event.eventType}]`);
      break;
    case 'medium':
      logger.warn(auditEntry, `AUDIT [${event.eventType}]`);
      break;
    default:
      logger.info(auditEntry, `AUDIT [${event.eventType}]`);
  }
};

// Audit middleware factory
export const auditMiddleware = (
  eventType: AuditEventType,
  options: {
    targetResource?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    condition?: (req: Request) => boolean;
  } = {},
) => {
  return (req: LoggedRequest, res: Response, next: NextFunction): void => {
    // Check condition if provided
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Log on response finish
    res.on('finish', () => {
      if (res.statusCode < 400) {
        auditLog(req, {
          eventType,
          targetResource: options.targetResource,
          targetId: req.params.id,
          severity: options.severity,
          metadata: {
            statusCode: res.statusCode,
            body: sanitizeData(req.body),
          },
        });
      }
    });

    next();
  };
};

// Performance logging middleware
export const performanceLoggingMiddleware = (
  req: LoggedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const segments: { name: string; start: number; end?: number }[] = [];

  // Add performance tracking methods
  res.locals.perfMark = (name: string) => {
    segments.push({ name, start: Date.now() });
  };

  res.locals.perfMeasure = (name: string) => {
    const segment = segments.find((s) => s.name === name && !s.end);
    if (segment) {
      segment.end = Date.now();
    }
  };

  // Log performance on finish
  res.on('finish', () => {
    const totalDuration = Date.now() - (req.startTime || 0);
    const measurements = segments
      .filter((s) => s.end)
      .map((s) => ({
        name: s.name,
        duration: s.end! - s.start,
      }));

    if (measurements.length > 0 || totalDuration > 1000) {
      logger.info(
        {
          requestId: req.id,
          totalDuration,
          measurements,
          path: req.path,
          method: req.method,
        },
        'Request performance metrics',
      );
    }
  });

  next();
};

// Development logging middleware
export const developmentLoggingMiddleware = (
  req: LoggedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  // Log all headers in development
  logger.debug(
    {
      requestId: req.id,
      headers: req.headers,
      method: req.method,
      path: req.path,
    },
    'Development: Request headers',
  );

  next();
};
