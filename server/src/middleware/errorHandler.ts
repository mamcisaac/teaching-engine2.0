import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../logger';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
  path?: string;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Log the error
  logger.error({
    err,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userId: (req as Request & { user?: { userId?: string } }).user?.userId,
  }, 'Request error');

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.error = err.message;
    response.code = err.code;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        response.error = 'Duplicate entry';
        response.message = 'A record with this value already exists';
        response.code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = 404;
        response.error = 'Record not found';
        response.message = 'The requested record does not exist';
        response.code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        response.error = 'Foreign key constraint failed';
        response.message = 'Referenced record does not exist';
        response.code = 'FOREIGN_KEY_ERROR';
        break;
      case 'P2016':
        statusCode = 400;
        response.error = 'Query interpretation error';
        response.message = 'Invalid query parameters';
        response.code = 'INVALID_QUERY';
        break;
      default:
        statusCode = 400;
        response.error = 'Database operation failed';
        response.message = err.message;
        response.code = `PRISMA_${err.code}`;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    response.error = 'Validation error';
    response.message = 'Invalid data provided';
    response.code = 'VALIDATION_ERROR';
    
    // Extract useful validation info if possible
    const validationMatch = err.message.match(/Argument (\w+): (.+)/);
    if (validationMatch) {
      response.details = {
        field: validationMatch[1],
        issue: validationMatch[2],
      };
    }
  } else if (err instanceof ZodError) {
    // Handle Zod validation errors
    statusCode = 400;
    response.error = 'Validation error';
    response.code = 'VALIDATION_ERROR';
    response.details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.error = 'Invalid token';
    response.code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    response.error = 'Token expired';
    response.code = 'TOKEN_EXPIRED';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    response.error = 'File upload error';
    response.message = err.message;
    response.code = 'FILE_UPLOAD_ERROR';
  } else if (err.message.includes('CORS')) {
    statusCode = 403;
    response.error = 'CORS error';
    response.message = 'Cross-origin request blocked';
    response.code = 'CORS_ERROR';
  } else {
    // Generic error handling
    response.error = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message;
    
    // Don't leak stack traces in production
    if (process.env.NODE_ENV !== 'production') {
      response.details = {
        stack: err.stack,
      };
    }
  }

  res.status(statusCode).json(response);
}

// Catch unhandled routes
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
}

// Common error generators
export const errors = {
  unauthorized: () => new AppError('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => new AppError('Forbidden', 403, 'FORBIDDEN'),
  notFound: (resource: string) => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  badRequest: (message: string) => new AppError(message, 400, 'BAD_REQUEST'),
  conflict: (message: string) => new AppError(message, 409, 'CONFLICT'),
  tooManyRequests: () => new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
  serverError: (message = 'Internal server error') => new AppError(message, 500, 'SERVER_ERROR'),
};