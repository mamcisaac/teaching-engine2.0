/**
 * Type Guards for Runtime Validation
 * 
 * These utilities provide safe type checking for values that may be 'any' type,
 * particularly useful for:
 * - JSON.parse results
 * - External API responses
 * - Error objects in catch blocks
 * - Dynamic imports
 * - Event handler parameters
 */

// Basic existence check
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Check if value is a non-null object
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Error type guards
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isErrorLike(value: unknown): value is { message: string; [key: string]: unknown } {
  return isObject(value) && typeof value.message === 'string';
}

export function hasErrorMessage(value: unknown): value is { message: string } {
  return isObject(value) && 'message' in value && typeof value.message === 'string';
}

// String validation
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Number validation
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

// Array validation
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isNonEmptyArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

// Function validation
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

// API Response validation
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | { message: string };
  status?: number;
}

export function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T> {
  if (!isObject(value)) {
    return false;
  }
  
  // Check optional fields with explicit null/undefined handling
  if ('data' in value && value.data === null) {
    return false;
  }
  
  if ('error' in value && value.error !== undefined) {
    if (!isString(value.error) && !hasErrorMessage(value.error)) {
      return false;
    }
  }
  
  if ('status' in value && value.status !== undefined && !isValidNumber(value.status)) {
    return false;
  }
  
  return true;
}

// JSON parse result validation
export function tryParseJSON<T = unknown>(
  jsonString: string,
  validator?: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (validator !== undefined) {
      return validator(parsed) ? parsed : null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

// Safe property access
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function hasProperties<K extends string>(
  obj: unknown,
  ...keys: K[]
): obj is Record<K, unknown> {
  return isObject(obj) && keys.every(key => key in obj);
}

// Type guard for common data structures
export interface IdObject {
  id: string | number;
}

export function hasId(value: unknown): value is IdObject {
  return isObject(value) && 
    'id' in value && 
    (isString(value.id) || isValidNumber(value.id));
}

// Safe conditional checks with explicit boolean conversions
export function safeBoolean(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0 && !isNaN(value);
  }
  if (typeof value === 'string') {
    return value.length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return false;
}

// Type guard composers
export function isArrayOf<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(itemGuard);
}

export function isOptional<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): value is T | undefined {
  return value === undefined || guard(value);
}

// Validation result type
export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
}

export function validate<T>(
  value: unknown,
  validator: (value: unknown) => value is T,
  errorMessage = 'Validation failed'
): ValidationResult<T> {
  if (validator(value)) {
    return { isValid: true, value };
  }
  return { isValid: false, error: errorMessage };
}

// Async validation helper
export async function validateAsync<T>(
  value: unknown,
  validator: (value: unknown) => Promise<boolean>,
  transform: (value: unknown) => T,
  errorMessage = 'Async validation failed'
): Promise<ValidationResult<T>> {
  try {
    const isValid = await validator(value);
    if (isValid) {
      return { isValid: true, value: transform(value) };
    }
    return { isValid: false, error: errorMessage };
  } catch (error) {
    return { 
      isValid: false, 
      error: isErrorLike(error) ? error.message : errorMessage 
    };
  }
}

// Domain-specific type guards for teaching engine

// AI Suggestion type guard
export interface AISuggestion {
  type: 'goals' | 'bigIdeas' | 'activities' | 'materials' | 'assessments' | 'reflections';
  suggestions: string[];
  rationale?: string;
}

export function isAISuggestion(value: unknown): value is AISuggestion {
  if (!isObject(value)) {
    return false;
  }
  
  const validTypes = ['goals', 'bigIdeas', 'activities', 'materials', 'assessments', 'reflections'];
  
  return (
    hasProperty(value, 'type') && 
    isString(value.type) && 
    validTypes.includes(value.type) &&
    hasProperty(value, 'suggestions') && 
    isArrayOf(value.suggestions, isString) &&
    (!hasProperty(value, 'rationale') || isOptional(value.rationale, isString))
  );
}

// Event handler type guards for React events
export function isReactEvent(value: unknown): value is { target: unknown } {
  return isObject(value) && hasProperty(value, 'target');
}

export function isInputEvent(value: unknown): value is { target: { value: string } } {
  return (
    isReactEvent(value) && 
    isObject(value.target) && 
    hasProperty(value.target, 'value') && 
    isString(value.target.value)
  );
}

export function isSelectEvent(value: unknown): value is { target: { value: string; checked?: boolean } } {
  return (
    isReactEvent(value) && 
    isObject(value.target) && 
    hasProperty(value.target, 'value') && 
    isString(value.target.value)
  );
}

// Curriculum data type guards
export interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
  content: string;
}

export function isCurriculumExpectation(value: unknown): value is CurriculumExpectation {
  return (
    isObject(value) &&
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'code') && isString(value.code) &&
    hasProperty(value, 'description') && isString(value.description) &&
    hasProperty(value, 'content') && isString(value.content)
  );
}

// Lesson Plan type guards
export interface LessonPlan {
  id?: string;
  title: string;
  date: string | Date;
  duration: number;
  expectations?: string[];
  [key: string]: unknown;
}

export function isLessonPlan(value: unknown): value is LessonPlan {
  return (
    isObject(value) &&
    hasProperty(value, 'title') && isString(value.title) &&
    hasProperty(value, 'date') && (isString(value.date) || value.date instanceof Date) &&
    hasProperty(value, 'duration') && isValidNumber(value.duration) &&
    (!hasProperty(value, 'expectations') || isOptional(value.expectations, (arr): arr is string[] => isArrayOf(arr, isString)))
  );
}

// Unit Plan type guards
export interface UnitPlan {
  id?: string;
  title: string;
  subject: string;
  grade: number;
  [key: string]: unknown;
}

export function isUnitPlan(value: unknown): value is UnitPlan {
  return (
    isObject(value) &&
    hasProperty(value, 'title') && isString(value.title) &&
    hasProperty(value, 'subject') && isString(value.subject) &&
    hasProperty(value, 'grade') && isValidNumber(value.grade)
  );
}

// School Info type guards
export interface SchoolInfo {
  name?: string;
  board?: string;
  [key: string]: unknown;
}

export function isSchoolInfo(value: unknown): value is SchoolInfo {
  return (
    isObject(value) &&
    (!hasProperty(value, 'name') || isOptional(value.name, isString)) &&
    (!hasProperty(value, 'board') || isOptional(value.board, isString))
  );
}

// Date/Time validation
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function isDateLike(value: unknown): value is Date | string {
  return value instanceof Date || isValidDateString(value);
}