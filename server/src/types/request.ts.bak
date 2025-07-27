/**
 * Type-safe request body interfaces and utilities
 */

import type { Request } from 'express';

/**
 * Generic typed request interface with body type
 */
export interface TypedRequest<T = Record<string, unknown>> extends Request {
  body: T;
}

/**
 * Request with typed query parameters
 */
export interface TypedQueryRequest<T = Record<string, unknown>> extends Request {
  query: T;
}

/**
 * Request with typed params
 */
export interface TypedParamsRequest<T = Record<string, unknown>> extends Request {
  params: T;
}

/**
 * Request with all typed properties
 */
export interface FullyTypedRequest<
  Body = Record<string, unknown>,
  Query = Record<string, unknown>,
  Params = Record<string, unknown>
> extends Request {
  body: Body;
  query: Query;
  params: Params;
}

/**
 * Safe body extraction with type assertion
 */
export function getTypedBody<T>(req: Request): T {
  return req.body as T;
}

/**
 * Safe query extraction with type assertion
 */
export function getTypedQuery<T>(req: Request): T {
  return req.query as T;
}

/**
 * Safe params extraction with type assertion
 */
export function getTypedParams<T>(req: Request): T {
  return req.params as T;
}