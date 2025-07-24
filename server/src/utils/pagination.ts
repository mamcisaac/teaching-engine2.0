/**
 * Pagination utilities for list endpoints
 * Provides consistent pagination across all API endpoints
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Pagination query schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  links?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * Extract pagination parameters from request query
 */
export function getPaginationParams(req: Request): PaginationOptions {
  const result = paginationSchema.safeParse(req.query);

  if (!result.success) {
    // Return defaults if validation fails
    return {
      page: 1,
      limit: 20,
      sortOrder: 'desc',
    };
  }

  return {
    page: result.data.page || 1,
    limit: result.data.limit || 20,
    sortBy: result.data.sortBy,
    sortOrder: result.data.sortOrder || 'desc',
    search: result.data.search,
  };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  baseUrl?: string,
): PaginatedResponse<T> {
  const totalPages = calculateTotalPages(meta.total, meta.limit);
  const hasNext = meta.page < totalPages;
  const hasPrevious = meta.page > 1;

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages,
      hasNext,
      hasPrevious,
    },
  };

  // Add navigation links if base URL provided
  if (baseUrl && baseUrl !== '') {
    response.links = {};

    const url = new URL(baseUrl);

    // First page
    if (meta.page > 1) {
      url.searchParams.set('page', '1');
      response.links.first = url.toString();
    }

    // Previous page
    if (hasPrevious) {
      url.searchParams.set('page', (meta.page - 1).toString());
      response.links.previous = url.toString();
    }

    // Next page
    if (hasNext) {
      url.searchParams.set('page', (meta.page + 1).toString());
      response.links.next = url.toString();
    }

    // Last page
    if (meta.page < totalPages) {
      url.searchParams.set('page', totalPages.toString());
      response.links.last = url.toString();
    }
  }

  return response;
}

/**
 * Prisma pagination helper
 */
export function getPrismaArgs(options: PaginationOptions): { skip: number; take: number; orderBy?: Record<string, 'asc' | 'desc'> } {
  const skip = calculateOffset(options.page, options.limit);

  const args: {
    skip: number;
    take: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  } = {
    skip,
    take: options.limit,
  };

  // Add sorting
  if (options.sortBy !== null && options.sortBy !== undefined && options.sortBy !== '') {
    args.orderBy = {
      [options.sortBy]: options.sortOrder ?? 'desc',
    };
  }

  return args;
}

/**
 * Create cursor-based pagination for real-time data
 */
export interface CursorPaginationOptions {
  cursor?: string | number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string | number;
  };
}

export function createCursorPaginatedResponse<T>(
  data: T[],
  limit: number,
  getCursor: (item: T) => string | number,
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;

  return {
    data: items,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && items.length > 0 ? getCursor(items[items.length - 1]) : undefined,
    },
  };
}

/**
 * Middleware to validate pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction): void {
  const result = paginationSchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid pagination parameters',
      details: result.error.flatten(),
    });
    return;
  }

  // Attach validated params to request
  (req as Request & { pagination: PaginationQuery }).pagination = result.data;
  next();
}

/**
 * Create pagination metadata for response headers
 */
export function setPaginationHeaders<T>(
  res: Response,
  pagination: PaginatedResponse<T>['pagination'],
) {
  res.set({
    'X-Page': pagination.page.toString(),
    'X-Limit': pagination.limit.toString(),
    'X-Total': pagination.total.toString(),
    'X-Total-Pages': pagination.totalPages.toString(),
    'X-Has-Next': pagination.hasNext.toString(),
    'X-Has-Previous': pagination.hasPrevious.toString(),
  });
}

/**
 * Search filter helper for Prisma
 */
export function createSearchFilter(
  search: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (search === undefined || search === '' || fields.length === 0) {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    })),
  };
}

/**
 * Combine multiple filters for Prisma where clause
 */
export function combineFilters(
  ...filters: (Record<string, unknown> | undefined | null)[]
): Record<string, unknown> | undefined {
  const validFilters = filters.filter((f) => f !== undefined && f !== null);

  if (validFilters.length === 0) {
    return undefined;
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return {
    AND: validFilters,
  };
}

/**
 * Performance optimization: Parallel count and data fetch
 */
export async function fetchPaginatedData<T>(
  countQuery: () => Promise<number>,
  dataQuery: () => Promise<T[]>,
  _options: PaginationOptions,
): Promise<{ data: T[]; total: number }> {
  const [total, data] = await Promise.all([countQuery(), dataQuery()]);

  return { data, total };
}

/**
 * Pagination cache key generator
 */
export function generatePaginationCacheKey(
  entity: string,
  options: PaginationOptions,
  additionalParams?: Record<string, unknown>,
): string {
  const params = {
    ...options,
    ...additionalParams,
  };

  const sortedKeys = Object.keys(params).sort();
  const keyParts = sortedKeys.map((key) => `${key}:${(params as Record<string, unknown>)[key]}`);

  return `pagination:${entity}:${keyParts.join(':')}`;
}
