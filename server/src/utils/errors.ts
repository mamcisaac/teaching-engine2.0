/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import logger from '../logger';
import { ZodError } from 'zod';
import { errorCounter } from '../monitoring/telemetry';

// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
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
  constructor(message: string, details?: unknown) {
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
  constructor(service: string, originalError?: unknown) {
    super(503, `External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR', originalError);
    this.name = 'ExternalServiceError';
  }
}

// Error response formatter
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId?: string;
  };
}

export const formatErrorResponse = (
  error: AppError | Error | ZodError,
  requestId?: string,
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
    details = error.errors.map((err) => ({
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
export const asyncHandler = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
): ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>): Promise<void> => {
    try {
      await fn(...args);
    } catch (_error) {
      const [req, res, next] = args as unknown as [any, Response, any];

      // Log the error
      logger.error(
        {
          error: _error,
          method: req?.method,
          path: req?.path,
          userId: req?.user?.id,
        },
        'Request handler error',
      );

      // Track error metrics
      if (_error instanceof AppError) {
        errorCounter.add(1, {
          type: 'app_error',
          code: _error.code || 'unknown',
          status: _error.statusCode.toString(),
        });
      } else {
        errorCounter.add(1, {
          type: 'unhandled_error',
          status: '500',
        });
      }

      // Pass to error handler if next is available
      if (next && typeof next === 'function') {
        next(_error);
      } else {
        // Handle error directly
        handleErrorResponse(res, _error, req?.id);
      }
    }
  };
};

// Error response handler
export const handleErrorResponse = (
  res: Response,
  error: AppError | Error | ZodError,
  requestId?: string,
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
export const handleDatabaseError = (error: unknown): AppError => {
  // Prisma error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as {
      code: string;
      meta?: { target?: string; cause?: string; field_name?: string };
    };

    if (prismaError.code === 'P2002') {
      return new ConflictError('A record with this value already exists', {
        field: prismaError.meta?.target,
      });
    }

    if (prismaError.code === 'P2025') {
      return new NotFoundError('Record', prismaError.meta?.cause);
    }

    if (prismaError.code === 'P2003') {
      return new ValidationError('Foreign key constraint failed', {
        field: prismaError.meta?.field_name,
      });
    }
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
  id?: string | number,
): T => {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource, id);
  }
  return value;
};

export const assertAuthorized = (
  condition: boolean,
  message: string = 'You do not have permission to perform this action',
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
export const isAppError = (error: Error): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (error: Error): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isZodError = (error: Error): error is ZodError => {
  return error instanceof ZodError;
};
