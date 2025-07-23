/**
 * Common validation utilities for strict boolean expressions
 */

/**
 * Checks if a string is non-empty
 * @param value - The string to check
 * @returns true if the string is non-null, non-undefined, and non-empty
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Checks if a number is valid (not null, undefined, 0, or NaN)
 * @param value - The number to check
 * @returns true if the number is valid
 */
export function isValidNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && value !== 0 && !isNaN(value);
}

/**
 * Checks if a number is defined (not null or undefined, but 0 is allowed)
 * @param value - The number to check
 * @returns true if the number is defined
 */
export function isDefinedNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && !isNaN(value);
}

/**
 * Checks if a boolean is explicitly true or false (not null or undefined)
 * @param value - The boolean to check
 * @returns true if the boolean is explicitly true or false
 */
export function isDefinedBoolean(value: boolean | null | undefined): value is boolean {
  return value !== null && value !== undefined;
}

/**
 * Safely converts a value to a string, returning empty string for null/undefined
 * @param value - The value to convert
 * @returns The string value or empty string
 */
export function toSafeString(value: string | null | undefined): string {
  return value ?? '';
}

/**
 * Safely converts a value to a number, returning 0 for null/undefined
 * @param value - The value to convert
 * @returns The number value or 0
 */
export function toSafeNumber(value: number | null | undefined): number {
  return value ?? 0;
}

/**
 * Safely converts a value to a boolean, returning false for null/undefined
 * @param value - The value to convert
 * @returns The boolean value or false
 */
export function toSafeBoolean(value: boolean | null | undefined): boolean {
  return value ?? false;
}

/**
 * Type guard for checking if a value is defined (not null or undefined)
 * @param value - The value to check
 * @returns true if the value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if an object has a property
 * @param obj - The object to check
 * @param prop - The property name
 * @returns true if the object has the property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return prop in obj;
}

/**
 * Safe array check - ensures value is a non-empty array
 * @param value - The value to check
 * @returns true if the value is a non-empty array
 */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}