import { Response } from 'express';
import { logger } from '../logger';
import { ZodError } from 'zod';
import { errorCounter } from '../monitoring/telemetry';

// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: any) {
    super(503, `External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR', originalError);
    this.name = 'ExternalServiceError';
  }
}

// Error response formatter
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export const formatErrorResponse = (
  error: AppError | Error | ZodError,
  requestId?: string
): ErrorResponse => {
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  
  if (error instanceof AppError) {
    code = error.code || 'APP_ERROR';
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
};

// Async error handler wrapper
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>): Promise<void> => {
    try {
      await fn(...args);
    } catch (error) {
      const [req, res, next] = args as [any, Response, any];
      
      // Log the error
      logger.error({
        error,
        method: req?.method,
        path: req?.path,
        userId: req?.user?.id,
      }, 'Request handler error');
      
      // Track error metrics
      if (error instanceof AppError) {
        errorCounter.add(1, {
          type: 'app_error',
          code: error.code || 'unknown',
          status: error.statusCode.toString(),
        });
      } else {
        errorCounter.add(1, {
          type: 'unhandled_error',
          status: '500',
        });
      }
      
      // Pass to error handler if next is available
      if (next && typeof next === 'function') {
        next(error);
      } else {
        // Handle error directly
        handleErrorResponse(res, error, req?.id);
      }
    }
  };
};

// Error response handler
export const handleErrorResponse = (
  res: Response,
  error: AppError | Error | ZodError,
  requestId?: string
): void => {
  let statusCode = 500;
  
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
  }
  
  const errorResponse = formatErrorResponse(error, requestId);
  
  res.status(statusCode).json(errorResponse);
};

// Database error handler
export const handleDatabaseError = (error: any): AppError => {
  // Prisma error codes
  if (error.code === 'P2002') {
    return new ConflictError('A record with this value already exists', {
      field: error.meta?.target,
    });
  }
  
  if (error.code === 'P2025') {
    return new NotFoundError('Record', error.meta?.cause);
  }
  
  if (error.code === 'P2003') {
    return new ValidationError('Foreign key constraint failed', {
      field: error.meta?.field_name,
    });
  }
  
  // Generic database error
  return new AppError(500, 'Database operation failed', 'DATABASE_ERROR', error);
};

// Validation error helper
export const throwValidationError = (field: string, message: string): never => {
  throw new ValidationError(`${field}: ${message}`, { field });
};

// Assert helpers
export const assertExists = <T>(
  value: T | null | undefined,
  resource: string,
  id?: string | number
): T => {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource, id);
  }
  return value;
};

export const assertAuthorized = (
  condition: boolean,
  message: string = 'You do not have permission to perform this action'
): void => {
  if (!condition) {
    throw new ForbiddenError(message);
  }
};

export const assertAuthenticated = (userId?: number | null): void => {
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
};

// Error type guards
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isZodError = (error: any): error is ZodError => {
  return error instanceof ZodError;
};