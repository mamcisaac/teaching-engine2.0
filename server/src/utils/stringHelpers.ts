/**
 * Helper utilities for nullable string checks
 * These functions provide consistent patterns for checking string values
 * across the codebase to avoid nullable string conditional warnings
 */

/**
 * Check if a value is a non-empty string
 * @param value - The value to check
 * @returns True if the value is a string with content, false otherwise
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Check if a value exists and is a string (can be empty)
 * @param value - The value to check
 * @returns True if the value is a string (including empty), false otherwise
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is null, undefined, or empty string
 * @param value - The value to check
 * @returns True if the value is null, undefined, or empty string
 */
export function isNullOrEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Get a string value with a fallback
 * @param value - The value to check
 * @param fallback - The fallback value if the input is not a non-empty string
 * @returns The value if it's a non-empty string, otherwise the fallback
 */
export function getStringOrDefault(value: unknown, fallback: string): string {
  return isNonEmptyString(value) ? value : fallback;
}

/**
 * Safely trim a string value
 * @param value - The value to trim
 * @returns The trimmed string or empty string if not a string
 */
export function safeTrim(value: unknown): string {
  return isString(value) ? value.trim() : '';
}