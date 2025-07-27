// Common type definitions to eliminate unsafe any usage

import type { ZodError } from 'zod';

export interface RequestBody {
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ExpectationRelation {
  expectation: {
    id: string;
  };
}

export interface PlanCount {
  unitPlans?: number;
  lessonPlans?: number;
}

export interface PlanWithCount {
  id: string;
  title?: string;
  date?: string;
  _count?: PlanCount;
  daybookEntry?: { id: string } | null;
}

export interface ParentInfo {
  id?: string;
  title?: string;
  subject?: string;
  grade?: string;
  longRangePlan?: {
    subject?: string;
    grade?: string;
  };
}

// Error types
export interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
  details?: unknown;
}

export interface ErrorWithDetails extends Error {
  details?: Record<string, unknown>;
  statusCode?: number;
}

// Generic record types
export type StringRecord = Record<string, string>;
export type NumberRecord = Record<string, number>;
export type BooleanRecord = Record<string, boolean>;
export type MixedRecord = Record<string, string | number | boolean | null | undefined>;
export type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

// Database result types
export interface DatabaseCountResult {
  field: string | number | boolean | null;
  count: number;
}

export interface DatabaseSumResult {
  field: string | number | boolean | null;
  sum: number;
}

export interface UpsertResult<T> {
  record: T;
  created: boolean;
}

// API and form types
export interface ApiRequestData {
  body?: JsonObject;
  query?: StringRecord;
  params?: StringRecord;
  headers?: StringRecord;
}

export interface FormData {
  [key: string]: string | number | boolean | string[] | File | null | undefined;
}

// Cache types
export interface CacheEntry<T = JsonValue> {
  value: T;
  ttl: number;
  timestamp: number;
}

// Express extensions
export interface ExpressErrorCallback {
  (error?: Error | null): void;
}

export interface ExpressEndArgs {
  chunk?: Buffer | string;
  encoding?: BufferEncoding;
  cb?: () => void;
}

// Validation types
export type ValidationErrorHandler = (error: ZodError, req: unknown) => unknown;

// Utility types
export type SafeAny = unknown;
export type Nullable<T> = T | null | undefined;
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;