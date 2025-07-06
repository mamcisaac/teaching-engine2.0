import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { errorReportingService } from '../services/monitoring/errorReportingService';

// Extended Express Request with additional properties
interface ExtendedRequest extends Request {
  id?: string;
  user?: { id: number; email: string; role: string; organizationId?: number };
  startTime?: number;
}

/**
 * Middleware to add request context for error reporting
 */
export const errorContextMiddleware = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Generate request ID if not present
  req.id = req.id || (req.headers['x-request-id'] as string) || uuidv4();

  // Track request start time
  req.startTime = Date.now();

  // Set up user context if authenticated
  if (req.user) {
    errorReportingService.setUserContext({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      organizationId: req.user.organizationId,
    });
  }

  // Add request breadcrumb
  errorReportingService.addBreadcrumb({
    message: `${req.method} ${req.path}`,
    category: 'request',
    level: 'info',
    data: {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.id,
    },
  });

  // Set request context
  errorReportingService.setErrorContext('request', {
    id: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Clean up on response finish
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;

    // Add response breadcrumb
    errorReportingService.addBreadcrumb({
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      category: 'response',
      level: res.statusCode >= 400 ? 'warning' : 'info',
      data: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        requestId: req.id,
      },
    });

    // Clear user context if request is finished
    if (req.user) {
      errorReportingService.setUserContext(null);
    }
  });

  next();
};

/**
 * Middleware to capture authentication errors
 */
export const authErrorMiddleware = (
  err: Error,
  req: ExtendedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (err.name === 'UnauthorizedError' || err.message.includes('auth')) {
    errorReportingService.addBreadcrumb({
      message: 'Authentication error',
      category: 'auth',
      level: 'warning',
      data: {
        error: err.message,
        path: req.path,
        requestId: req.id,
      },
    });
  }

  next(err);
};
