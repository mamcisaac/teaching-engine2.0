/**
 * Type-safe request body interfaces and utilities
 */

import type { Request, ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

/**
 * Generic typed request interface with body type
 */
export interface TypedRequest<T = Record<string, unknown>> extends Request<ParamsDictionary, any, T> {
  body: T;
}

/**
 * Request with typed query parameters
 */
export interface TypedQueryRequest<T extends ParsedQs = ParsedQs> extends Request<ParamsDictionary, any, any, T> {
  query: T;
}

/**
 * Request with typed params
 */
export interface TypedParamsRequest<T extends ParamsDictionary = ParamsDictionary> extends Request<T> {
  params: T;
}

/**
 * Request with all typed properties
 */
export interface FullyTypedRequest<
  Body = Record<string, unknown>,
  Query extends ParsedQs = ParsedQs,
  Params extends ParamsDictionary = ParamsDictionary
> extends Request<Params, any, Body, Query> {
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