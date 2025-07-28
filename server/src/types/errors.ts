/**
 * Comprehensive error type definitions for type-safe error handling
 */

/**
 * Base error interface that extends the standard Error
 */
export interface BaseError extends Error {
  code?: string;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

/**
 * Error with a code property (common in Node.js errors)
 */
export interface ErrorWithCode extends Error {
  code: string;
}

/**
 * Error with errno property (common in system errors)
 */
export interface SystemError extends ErrorWithCode {
  errno?: number;
  syscall?: string;
  path?: string;
}

/**
 * Database error with additional metadata
 */
export interface DatabaseError extends BaseError {
  code: string;
  meta?: {
    target?: string[];
    modelName?: string;
    [key: string]: unknown;
  };
}

/**
 * Validation error with field-specific errors
 */
export interface ValidationError extends BaseError {
  errors?: {
    field: string;
    message: string;
    value?: unknown;
  }[];
}

/**
 * HTTP error with status code
 */
export interface HttpError extends BaseError {
  statusCode: number;
  expose?: boolean;
}

/**
 * Type guard for ErrorWithCode
 */
export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as ErrorWithCode).code === 'string'
  );
}

/**
 * Type guard for SystemError
 */
export function isSystemError(error: unknown): error is SystemError {
  return (
    isErrorWithCode(error) &&
    ('errno' in error || 'syscall' in error || 'path' in error)
  );
}

/**
 * Type guard for DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as DatabaseError).code === 'string' &&
    ('meta' in error || (error as DatabaseError).code.startsWith('P'))
  );
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return (
    error instanceof Error &&
    'errors' in error &&
    Array.isArray((error as ValidationError).errors)
  );
}

/**
 * Type guard for HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as HttpError).statusCode === 'number'
  );
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error !== null && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Safe error code extraction
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isErrorWithCode(error)) {
    return error.code;
  }
  
  if (error !== null && typeof error === 'object' && 'code' in error) {
    const {code} = (error as Record<string, unknown>);
    return typeof code === 'string' ? code : undefined;
  }
  
  return undefined;
}

/**
 * Safe error stack extraction
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  
  if (error !== null && typeof error === 'object' && 'stack' in error) {
    const {stack} = (error as Record<string, unknown>);
    return typeof stack === 'string' ? stack : undefined;
  }
  
  return undefined;
}