import type { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';

import type { AuthUser } from '../middleware/auth/types';

/**
 * Generic typed request interface with proper body, query, and params typing
 */
export interface TypedRequest<
  TBody = unknown,
  TQuery = Query,
  TParams = ParamsDictionary
> extends Request<TParams, unknown, TBody, TQuery> {
  body: TBody;
  query: TQuery;
  params: TParams;
  user?: AuthUser;
}

/**
 * Note: AuthenticatedRequest is now handled via global Express namespace extension
 * See: types/express.d.ts
 */

/**
 * Validated request with validated data
 */
export interface ValidatedRequest<
  TValidated = unknown,
  TBody = unknown,
  TQuery = Query,
  TParams = ParamsDictionary
> extends TypedRequest<TBody, TQuery, TParams> {
  validated?: TValidated;
  validatedBody?: TValidated;
  validatedQuery?: TValidated;
  validatedParams?: TValidated;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: {
    field: string;
    message: string;
    code?: string;
  }[];
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  status: 'success';
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Application-specific error with proper typing
 */
export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  meta?: Record<string, unknown>;
}

/**
 * Async request handler type
 */
export type AsyncRequestHandler<
  TParams = ParamsDictionary,
  TResBody = unknown,
  TReqBody = unknown,
  TReqQuery = Query
> = (
  req: Request<TParams, TResBody, TReqBody, TReqQuery>,
  res: Response<TResBody>,
  next: NextFunction
) => Promise<void>;

/**
 * Typed response helper
 */
export type TypedResponse<T> = Response<SuccessResponse<T> | ErrorResponse>;

/**
 * Create a typed success response
 */
export function successResponse<T>(data: T, meta?: SuccessResponse<T>['meta']): SuccessResponse<T> {
  return {
    status: 'success',
    data,
    ...(meta !== null && { meta }),
  };
}

/**
 * Create a typed error response
 */
export function errorResponse(
  message: string,
  code?: string,
  errors?: ErrorResponse['errors']
): ErrorResponse {
  return {
    status: 'error',
    message,
    ...(code !== null && code !== '' && { code }),
    ...(errors !== null && { errors }),
  };
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    'code' in error &&
    'isOperational' in error &&
    typeof (error as AppError).statusCode === 'number' &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).isOperational === 'boolean'
  );
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard for checking if string is not empty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Safe property access helper
 */
export function getSafeProperty<T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue;
}