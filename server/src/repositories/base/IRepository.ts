import type { PaginationOptions, PaginatedResponse } from '../../utils/pagination';

export interface IRepository<T, CreateInput, UpdateInput> {
  findById(id: number): Promise<T | null>;
  findMany(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    pagination?: PaginationOptions;
    searchFields?: string[];
  }): Promise<PaginatedResponse<T>>;
  findFirst(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
  }): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: number, data: UpdateInput): Promise<T>;
  delete(id: number): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(id: number): Promise<boolean>;
  findManyCursor(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    cursor?: number;
    limit?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<{ data: T[]; nextCursor?: number }>;
}
