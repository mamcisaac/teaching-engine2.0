import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { logger } from '../../logger';
import { errorCounter } from '../../monitoring/telemetry';
import { errorReportingService } from '../../services/monitoring/errorReportingService';
import { AppError, handleDatabaseError, formatErrorResponse } from '../../utils/errors';

// Extended Express Request with additional properties
interface ExtendedRequest extends Request {
  id?: string;
  user?: {
    id: number;
    email: string;
    role: string;
    organizationId?: number;
    permissions?: string[];
  };
  startTime?: number;
}

// Error logging middleware
export const errorLoggingMiddleware = (
  err: Error | AppError | ZodError,
  req: ExtendedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  // Log error details
  const errorData = {
    error: err,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body as unknown,
    userId: req.user?.id,
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    duration: req.startTime !== undefined && req.startTime !== null && req.startTime > 0 ? Date.now() - req.startTime : undefined,
  };

  // Determine log level based on error type and status
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(errorData, 'Application error');
      // Report server errors to Sentry
      errorReportingService.captureError(err, {
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          headers: req.headers,
        },
        user: req.user,
        requestId: req.id,
        duration: errorData.duration,
      });
    } else if (err.statusCode >= 400) {
      logger.warn(errorData, 'Client error');
      // Only report client errors that might indicate bugs
      if (err.statusCode !== 404 && err.statusCode !== 401) {
        errorReportingService.captureError(err, {
          request: {
            method: req.method,
            path: req.path,
            query: req.query,
          },
          user: req.user,
          requestId: req.id,
        });
      }
    } else {
      logger.info(errorData, 'Handled error');
    }
  } else if (err instanceof ZodError) {
    logger.warn(errorData, 'Validation error');
    // Don't report validation errors to Sentry unless they're unexpected
  } else {
    logger.error(errorData, 'Unhandled error');
    // Always report unhandled errors
    errorReportingService.captureError(err, {
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
        body: req.body as unknown,
      },
      user: req.user,
      requestId: req.id,
      duration: errorData.duration,
    });
  }

  // Track error metrics
  const errorType =
    err instanceof AppError
      ? 'app_error'
      : err instanceof ZodError
        ? 'validation_error'
        : 'unhandled_error';

  const statusCode = err instanceof AppError ? err.statusCode.toString() : '500';

  errorCounter.add(1, {
    type: errorType,
    status: statusCode,
    path: req.path,
    method: req.method,
  });

  next(err);
};

// Main error handler middleware
export const errorHandlerMiddleware = (
  err: Error | AppError | ZodError,
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Don't handle if response was already sent
  if (res.headersSent) {
    next(err); return;
  }

  // Handle database errors
  if ('code' in err && typeof err.code === 'string' && err.code.startsWith('P')) {
    err = handleDatabaseError(err);
  }

  // Handle specific error types
  let statusCode = 500;
  let errorResponse;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorResponse = formatErrorResponse(err, req.id);
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorResponse = formatErrorResponse(err, req.id);
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorResponse = formatErrorResponse(new AppError(401, 'Unauthorized', 'UNAUTHORIZED'), req.id);
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse = formatErrorResponse(
      new AppError(400, err.message || 'Validation failed', 'VALIDATION_ERROR'),
      req.id,
    );
  } else if ('type' in err && err.type === 'entity.too.large') {
    statusCode = 413;
    errorResponse = formatErrorResponse(
      new AppError(413, 'Request entity too large', 'PAYLOAD_TOO_LARGE'),
      req.id,
    );
  } else {
    // Generic error
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'Unknown error';

    errorResponse = formatErrorResponse(
      new AppError(statusCode, message, 'INTERNAL_ERROR'),
      req.id,
    );
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(404, `Cannot ${req.method} ${req.path}`, 'NOT_FOUND');
  next(error);
};

// Async error catcher for route handlers
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line promise/no-callback-in-promise
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Error handler for unhandled promise rejections
export const unhandledRejectionHandler = (reason: unknown, promise: Promise<unknown>): void => {
  logger.error(
    {
      reason,
      promise,
      type: 'unhandledRejection',
    },
    'Unhandled Promise Rejection',
  );

  // Report to error service
  errorReportingService.captureError(reason instanceof Error ? reason : new Error(String(reason)), {
    type: 'unhandledRejection',
    promise: String(promise),
  });

  // In production, you might want to gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    // Give time for logging before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

// Error handler for uncaught exceptions
export const uncaughtExceptionHandler = (error: Error): void => {
  logger.fatal(
    {
      error,
      type: 'uncaughtException',
    },
    'Uncaught Exception',
  );

  // Report critical error
  errorReportingService.captureError(error, {
    type: 'uncaughtException',
    fatal: true,
  });

  // Exit immediately as the process is in an undefined state
  process.exit(1);
};

// Install global error handlers
export const installGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', unhandledRejectionHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Graceful shutdown on SIGINT
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

// Create error boundary middleware for specific routes
export const errorBoundary = (handler: (err: unknown, req: Request, res: Response) => void) => (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    try {
      handler(err, req, res);
    } catch (boundaryError) {
      logger.error({ error: boundaryError, originalError: err }, 'Error boundary failed');
      next(err); // Pass original error
    }
  };
