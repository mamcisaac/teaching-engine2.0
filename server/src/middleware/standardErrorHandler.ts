import type { Request, Response, NextFunction } from 'express';
// import '../types/express.js';
import { ZodError } from 'zod';

import { logger } from '../logger.js';

import { auditFunctions } from './auditLogger.js';

// Standard error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
}

// Standard error class
export class StandardError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;
  public readonly userMessage?: string;

  constructor(
    type: ErrorType,
    message: string,
    statusCode = 500,
    isOperational = true,
    userMessage?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.userMessage = userMessage;
    this.details = details;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends StandardError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorType.VALIDATION_ERROR,
      message,
      400,
      true,
      'The provided data is invalid. Please check your input and try again.',
      details,
    );
  }
}

export class AuthenticationError extends StandardError {
  constructor(message = 'Authentication required') {
    super(
      ErrorType.AUTHENTICATION_ERROR,
      message,
      401,
      true,
      'Please log in to access this resource.',
    );
  }
}

export class AuthorizationError extends StandardError {
  constructor(message = 'Insufficient permissions') {
    super(
      ErrorType.AUTHORIZATION_ERROR,
      message,
      403,
      true,
      'You do not have permission to perform this action.',
    );
  }
}

export class NotFoundError extends StandardError {
  constructor(resource = 'Resource') {
    super(
      ErrorType.NOT_FOUND_ERROR,
      `${resource} not found`,
      404,
      true,
      `The requested ${resource.toLowerCase()} could not be found.`,
    );
  }
}

export class ConflictError extends StandardError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorType.CONFLICT_ERROR,
      message,
      409,
      true,
      'The request conflicts with the current state of the resource.',
      details,
    );
  }
}

export class RateLimitError extends StandardError {
  constructor(retryAfter?: number) {
    super(
      ErrorType.RATE_LIMIT_ERROR,
      'Rate limit exceeded',
      429,
      true,
      'Too many requests. Please try again later.',
      { retryAfter },
    );
  }
}

export class DatabaseError extends StandardError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorType.DATABASE_ERROR,
      message,
      500,
      true,
      'A database error occurred. Please try again later.',
      details,
    );
  }
}

export class ExternalServiceError extends StandardError {
  constructor(service: string, message: string) {
    super(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      `${service}: ${message}`,
      503,
      true,
      'An external service is currently unavailable. Please try again later.',
    );
  }
}

export class BusinessLogicError extends StandardError {
  constructor(message: string, userMessage?: string, details?: Record<string, unknown>) {
    super(
      ErrorType.BUSINESS_LOGIC_ERROR,
      message,
      400,
      true,
      userMessage ?? 'The operation cannot be completed due to business rules.',
      details,
    );
  }
}

export class FileUploadError extends StandardError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorType.FILE_UPLOAD_ERROR,
      message,
      400,
      true,
      'File upload failed. Please check the file and try again.',
      details,
    );
  }
}

export class AIServiceError extends StandardError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorType.AI_SERVICE_ERROR,
      message,
      503,
      true,
      'AI service is currently unavailable. Please try again later.',
      details,
    );
  }
}

/**
 * Error handler middleware
 */
export function standardErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Default error properties
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL_ERROR;
  let userMessage = 'An unexpected error occurred. Please try again later.';
  let details: Record<string, unknown> = {};

  // Handle different error types
  if (error instanceof StandardError) {
    statusCode = error.statusCode;
    errorType = error.type;
    userMessage = error.userMessage ?? userMessage;
    details = error.details ?? {};
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorType = ErrorType.VALIDATION_ERROR;
    userMessage = 'The provided data is invalid. Please check your input and try again.';
    details = {
      validationErrors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma database errors
    statusCode = 400;
    errorType = ErrorType.DATABASE_ERROR;

    const prismaError = error as unknown as { code: string };
    switch (prismaError.code) {
      case 'P2002':
        userMessage = 'A record with this information already exists.';
        break;
      case 'P2025':
        statusCode = 404;
        errorType = ErrorType.NOT_FOUND_ERROR;
        userMessage = 'The requested record was not found.';
        break;
      default:
        userMessage = 'A database error occurred. Please try again later.';
    }

    details = { prismaCode: prismaError.code };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION_ERROR;
    userMessage = 'Invalid authentication token. Please log in again.';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION_ERROR;
    userMessage = 'Authentication token has expired. Please log in again.';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    errorType = ErrorType.FILE_UPLOAD_ERROR;
    userMessage = 'File upload failed. Please check the file and try again.';
    details = { multerCode: (error as unknown as { code: string }).code };
  }

  // Log the error
  const requestLogger = (req as { logger?: typeof logger }).logger ?? logger;

  if (statusCode >= 500) {
    // Server errors
    requestLogger.error(
      {
        error: {
          name: error.name,
          message: (error).message,
          stack: error.stack,
          type: errorType,
        },
        request: {
          method: req.method,
          url: req.url,
          userId: (req as { user?: { id?: unknown } }).user.id,
          ip: req.ip,
        },
        statusCode,
      },
      `Server error: ${(error).message}`,
    );
  } else {
    // Client errors
    requestLogger.warn(
      {
        error: {
          name: error.name,
          message: (error).message,
          type: errorType,
        },
        request: {
          method: req.method,
          url: req.url,
          userId: (req as { user?: { id?: unknown } }).user.id,
          ip: req.ip,
        },
        statusCode,
      },
      `Client error: ${(error).message}`,
    );
  }

  // Log security events for specific error types
  if ([ErrorType.AUTHENTICATION_ERROR, ErrorType.AUTHORIZATION_ERROR].includes(errorType)) {
    auditFunctions.suspiciousActivity(req, 'Authentication/Authorization Failure', {
      errorType,
      statusCode,
      userAgent: req.get('User-Agent'),
    });
  }

  if (errorType === ErrorType.RATE_LIMIT_ERROR) {
    auditFunctions.rateLimitExceeded(req, 'API Rate Limit');
  }

  // Prepare error response
  const errorResponse: Record<string, unknown> = {
    success: false,
    error: {
      type: errorType,
      message: userMessage,
      ...(process.env.NODE_ENV !== 'production' && {
        details,
        stack: error.stack,
      }),
    },
    timestamp: new Date().toISOString(),
    requestId: (req as { requestId?: string }).requestId,
  };

  // Add retry information for rate limit errors
  if (errorType === ErrorType.RATE_LIMIT_ERROR && details.retryAfter != null) {
    res.set('Retry-After', details.retryAfter.toString());
    errorResponse.retryAfter = details.retryAfter;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: U, next: NextFunction): void => {
    // eslint-disable-next-line promise/no-callback-in-promise
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error factory functions for common errors
 */
export const errorFactory = {
  validation: (message: string, details?: Record<string, unknown>): ValidationError =>
    new ValidationError(message, details),

  notFound: (resource = 'Resource'): NotFoundError => new NotFoundError(resource),

  unauthorized: (message?: string): AuthenticationError => new AuthenticationError(message),

  forbidden: (message?: string): AuthorizationError => new AuthorizationError(message),

  conflict: (message: string, details?: Record<string, unknown>): ConflictError =>
    new ConflictError(message, details),

  rateLimit: (retryAfter?: number): RateLimitError => new RateLimitError(retryAfter),

  database: (message: string, details?: Record<string, unknown>): DatabaseError =>
    new DatabaseError(message, details),

  externalService: (service: string, message: string): ExternalServiceError => new ExternalServiceError(service, message),

  businessLogic: (message: string, userMessage?: string, details?: Record<string, unknown>): BusinessLogicError =>
    new BusinessLogicError(message, userMessage, details),

  fileUpload: (message: string, details?: Record<string, unknown>): FileUploadError =>
    new FileUploadError(message, details),

  aiService: (message: string, details?: Record<string, unknown>): AIServiceError =>
    new AIServiceError(message, details),
};

/**
 * Response helper functions
 */
export const responseHelpers = {
  success: (res: Response, data: unknown, message?: string, statusCode = 200): void => {
    res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  },

  created: (res: Response, data: unknown, message?: string): void => {
    responseHelpers.success(res, data, message, 201);
  },

  noContent: (res: Response): void => {
    res.status(204).send();
  },

  paginated: (
    res: Response,
    data: unknown[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  ): void => {
    res.json({
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  },
};
