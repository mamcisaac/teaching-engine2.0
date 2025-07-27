/**
 * API-specific validation utilities for external data
 * Provides validation for common API response patterns
 */

import { isObject, isString, isValidNumber, hasProperty, isError } from './typeGuards';

// Common API response structure
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Validate API response structure
export function isStandardApiResponse<T = unknown>(
  value: unknown
): value is StandardApiResponse<T> {
  if (!isObject(value)) {
    return false;
  }
  
  // Must have success field as boolean
  if (!hasProperty(value, 'success') || typeof value.success !== 'boolean') {
    return false;
  }
  
  // Optional fields validation with explicit checks
  if (hasProperty(value, 'error') && !isString(value.error)) {
    return false;
  }
  if (hasProperty(value, 'message') && !isString(value.message)) {
    return false;
  }
  
  return true;
}

// Paginated response validation
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

export function isPaginatedResponse<T = unknown>(
  value: unknown
): value is PaginatedResponse<T> {
  if (!isObject(value)) {
    return false;
  }
  
  return (
    hasProperty(value, 'items') && Array.isArray(value.items) &&
    hasProperty(value, 'total') && isValidNumber(value.total)
  );
}

// Database query result validation
export function isDatabaseResult(value: unknown): value is Record<string, unknown> | null {
  return value === null || isObject(value);
}

// Request body validation
export function isValidRequestBody(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

// Error handling utilities
export interface ErrorResponse {
  error: string;
  details?: unknown;
}

export function createErrorResponse(error: unknown): ErrorResponse {
  if (isError(error)) {
    return { error: error.message };
  }
  
  if (isObject(error) && hasProperty(error, 'message') && isString(error.message)) {
    return { error: error.message, details: error };
  }
  
  return { error: 'An unknown error occurred' };
}

// JSON parsing with validation
export function safeJsonParse<T = unknown>(
  jsonString: string,
  validator?: (value: unknown) => value is T
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (validator !== null && !validator(parsed)) {
      return { success: false, error: 'Parsed data does not match expected format' };
    }
    
    return { success: true, data: parsed as T };
  } catch (error) {
    return { 
      success: false, 
      error: isError(error) ? error.message : 'Failed to parse JSON' 
    };
  }
}

// Query parameter validation
export function getValidQueryParam(
  params: Record<string, unknown>,
  key: string,
  defaultValue: string
): string {
  const value = params[key];
  return (isString(value) && value.length > 0) ? value : defaultValue;
}

export function getValidNumericParam(
  params: Record<string, unknown>,
  key: string,
  defaultValue: number
): number {
  const value = params[key];
  
  if (isValidNumber(value)) {
    return value;
  }
  
  if (isString(value)) {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  
  return defaultValue;
}

export function getValidBooleanParam(
  params: Record<string, unknown>,
  key: string,
  defaultValue: boolean
): boolean {
  const value = params[key];
  
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  
  return defaultValue;
}

// File upload validation
export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function isValidFileUpload(value: unknown): value is FileUpload {
  return (
    isObject(value) &&
    hasProperty(value, 'filename') && isString(value.filename) &&
    hasProperty(value, 'mimetype') && isString(value.mimetype) &&
    hasProperty(value, 'size') && isValidNumber(value.size) &&
    hasProperty(value, 'buffer') && Buffer.isBuffer(value.buffer)
  );
}

// Authentication data validation
export interface AuthData {
  email: string;
  password?: string;
  token?: string;
}

export function isValidAuthData(value: unknown): value is AuthData {
  if (!isObject(value)) {
    return false;
  }
  
  return (
    hasProperty(value, 'email') && 
    isString(value.email) && 
    value.email.includes('@')
  );
}