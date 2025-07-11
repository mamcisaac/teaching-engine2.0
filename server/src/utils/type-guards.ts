/**
 * Type guard utilities for safe type checking and conversion
 */

/**
 * Safely extracts error message from unknown error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Type guard to check if a value is a Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if an object has a specific array property
 */
export function hasArrayProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown[]> {
  return (
    isRecord(obj) &&
    prop in obj &&
    Array.isArray(obj[prop])
  );
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return isRecord(obj) && prop in obj;
}

/**
 * Safely parse JSON with optional default value
 */
export function safeJsonParse<T = unknown>(
  json: string,
  defaultValue?: T
): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Convert unknown value to Record<string, unknown> safely
 */
export function toRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }
  return {};
}

/**
 * Type guard for checking if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safely access nested property with type checking
 */
export function getNestedProperty<T>(
  obj: unknown,
  path: string[],
  defaultValue?: T
): T | undefined {
  let current: unknown = obj;
  
  for (const key of path) {
    if (!isRecord(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current as T;
}

/**
 * Type guard for Express-like request objects
 */
export interface RequestLike {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  headers?: unknown;
  user?: unknown;
}

export function isRequestLike(value: unknown): value is RequestLike {
  return isRecord(value);
}

/**
 * Extract typed body from request
 */
export function getTypedBody<T>(req: RequestLike): T | undefined {
  if (req.body) {
    return req.body as T;
  }
  return undefined;
}

/**
 * Extract typed params from request
 */
export function getTypedParams<T extends Record<string, string>>(
  req: RequestLike
): T | undefined {
  if (isRecord(req.params)) {
    return req.params as T;
  }
  return undefined;
}

/**
 * Extract typed query from request
 */
export function getTypedQuery<T extends Record<string, string | string[]>>(
  req: RequestLike
): T | undefined {
  if (isRecord(req.query)) {
    return req.query as T;
  }
  return undefined;
}