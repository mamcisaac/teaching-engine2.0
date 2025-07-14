/**
 * Type definitions for repository operations
 */

// Generic Prisma model delegate interface
export interface PrismaModelDelegate<T, CreateInput, UpdateInput> {
  findUnique(args: { where: { id: number } }): Promise<T | null>;
  findFirst(args: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
  }): Promise<T | null>;
  findMany(args: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    take?: number;
    skip?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
    cursor?: { id: number };
  }): Promise<T[]>;
  create(args: { data: CreateInput }): Promise<T>;
  update(args: { where: { id: number }; data: UpdateInput }): Promise<T>;
  delete(args: { where: { id: number } }): Promise<T>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
}

// Repository error types
export interface RepositoryError extends Error {
  code?: string;
  meta?: unknown;
}

// Type guard to check if an error is a repository error
export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof Error;
}

// Common model types
export interface BaseModel {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Repository operation options
export interface FindManyOptions {
  where?: Record<string, unknown>;
  include?: Record<string, boolean>;
  pagination?: {
    page: number;
    limit: number;
    search?: string;
  };
  searchFields?: string[];
}

export interface FindFirstOptions {
  where?: Record<string, unknown>;
  include?: Record<string, boolean>;
}

export interface CursorPaginationOptions {
  where?: Record<string, unknown>;
  include?: Record<string, boolean>;
  cursor?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: number;
}

// Utility type to ensure model has required properties
export type ModelWithId<T> = T & { id: number };

// Type-safe model accessor helper
export type SafeModelAccess<T extends BaseModel, CreateInput, UpdateInput> = {
  readonly model: PrismaModelDelegate<T, CreateInput, UpdateInput>;
  readonly modelName: string;
};