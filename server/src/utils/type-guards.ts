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
    const parsed: unknown = JSON.parse(json);
    return parsed as T;
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
 * Type guard for checking if a value matches GeneratedActivity interface
 */
export interface GeneratedActivityLike {
  title: string;
  description: string;
  detailedInstructions: string[];
  duration: number;
  activityType: string;
  materials: string[];
  groupSize: string;
  learningGoals: string[];
  assessmentSuggestions: string[];
  differentiation: {
    support: string[];
    extension: string[];
  };
  safetyConsiderations?: string[];
  technologyRequirements?: string[];
}

/**
 * Type guard for checking if a value matches the GeneratedActivity structure
 */
export function isGeneratedActivityLike(value: unknown): value is GeneratedActivityLike {
  if (!isRecord(value)) {
    return false;
  }

  // Check required string fields
  if (!isString(value.title) || !isString(value.description) || 
      !isString(value.activityType) || !isString(value.groupSize)) {
    return false;
  }

  // Check required number field
  if (!isNumber(value.duration)) {
    return false;
  }

  // Check required array fields
  if (!isArray(value.detailedInstructions) || !isArray(value.materials) ||
      !isArray(value.learningGoals) || !isArray(value.assessmentSuggestions)) {
    return false;
  }

  // Check differentiation object
  if (!isRecord(value.differentiation) || 
      !isArray(value.differentiation.support) || 
      !isArray(value.differentiation.extension)) {
    return false;
  }

  // Optional fields don't need validation if undefined
  if (value.safetyConsiderations !== undefined && !isArray(value.safetyConsiderations)) {
    return false;
  }

  if (value.technologyRequirements !== undefined && !isArray(value.technologyRequirements)) {
    return false;
  }

  return true;
}

/**
 * Safely converts unknown value to GeneratedActivity with defaults
 */
export function toGeneratedActivity(value: unknown): GeneratedActivityLike {
  if (!isRecord(value)) {
    throw new Error('Value is not a valid object');
  }

  const title = isString(value.title) ? value.title : '';
  const description = isString(value.description) ? value.description : '';
  const detailedInstructions = isArray(value.detailedInstructions) ? 
    value.detailedInstructions.filter(isString) : [];
  const duration = isNumber(value.duration) ? value.duration : 30;
  const activityType = isString(value.activityType) ? value.activityType : 'handson';
  const materials = isArray(value.materials) ? 
    value.materials.filter(isString) : [];
  const groupSize = isString(value.groupSize) ? value.groupSize : 'flexible';
  const learningGoals = isArray(value.learningGoals) ? 
    value.learningGoals.filter(isString) : [];
  const assessmentSuggestions = isArray(value.assessmentSuggestions) ? 
    value.assessmentSuggestions.filter(isString) : [];

  // Handle differentiation
  let differentiation = { support: [], extension: [] };
  if (isRecord(value.differentiation)) {
    const support = isArray(value.differentiation.support) ? 
      value.differentiation.support.filter(isString) : [];
    const extension = isArray(value.differentiation.extension) ? 
      value.differentiation.extension.filter(isString) : [];
    differentiation = { support, extension };
  }

  // Handle optional fields
  const safetyConsiderations = isArray(value.safetyConsiderations) ? 
    value.safetyConsiderations.filter(isString) : undefined;
  const technologyRequirements = isArray(value.technologyRequirements) ? 
    value.technologyRequirements.filter(isString) : undefined;

  return {
    title,
    description,
    detailedInstructions,
    duration,
    activityType,
    materials,
    groupSize,
    learningGoals,
    assessmentSuggestions,
    differentiation,
    safetyConsiderations,
    technologyRequirements,
  };
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
  if (req.body !== null && req.body !== undefined) {
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