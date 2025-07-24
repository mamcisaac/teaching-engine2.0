/**
 * Pagination middleware for list endpoints
 * Automatically adds pagination support to routes
 */

import type { Request, Response, NextFunction, RequestHandler, Router } from 'express';

import { logger } from '../logger';
import type {
  PaginationOptions,
  PaginatedResponse} from '../utils/pagination';
import {
  getPaginationParams,
  createPaginatedResponse,
  setPaginationHeaders,
} from '../utils/pagination';

// Extend Express Request type to include pagination
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
      paginatedResponse?: <T>(data: T[], total: number) => PaginatedResponse<T>;
    }
  }
}

/**
 * Middleware to parse and validate pagination parameters
 */
export function parsePagination(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get and validate pagination params
    const pagination = getPaginationParams(req);

    // Attach to request for use in route handlers
    req.pagination = pagination;

    // Helper function to create paginated response
    req.paginatedResponse = <T>(data: T[], total: number): PaginatedResponse<T> => {
      const response = createPaginatedResponse(
        data,
        {
          page: pagination.page,
          limit: pagination.limit,
          total,
        },
        `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`,
      );

      // Set headers
      setPaginationHeaders(res, response.pagination);

      return response;
    };

    next();
  } catch (error: unknown) {
    logger.error('Pagination parsing error:', error as string | undefined);
    res.status(400).json({
      error: 'Invalid pagination parameters',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Repository pagination helper
 * Wraps repository methods to automatically handle pagination
 */
export function withPagination<T extends { id: number }>(
  repository: {
    findMany: (options: {
      where?: Record<string, unknown>;
      include?: Record<string, boolean>;
      pagination?: PaginationOptions;
      searchFields?: string[];
    }) => Promise<PaginatedResponse<T>>;
    findManyCursor: (options: {
      where?: Record<string, unknown>;
      include?: Record<string, boolean>;
      cursor?: number;
      limit: number;
    }) => Promise<{ data: T[]; nextCursor?: number }>;
  },
  defaultSearchFields: string[] = [],
): {
  findPaginated: (req: Request, options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    searchFields?: string[];
  }) => Promise<PaginatedResponse<T>>;
  findCursorPaginated: (req: Request, options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
  }) => Promise<{ data: T[]; nextCursor?: number }>;
} {
  return {
    async findPaginated(
      req: Request,
      options?: {
        where?: Record<string, unknown>;
        include?: Record<string, boolean>;
        searchFields?: string[];
      },
    ): Promise<PaginatedResponse<T>> {
      const pagination = req.pagination || getPaginationParams(req);

      return repository.findMany({
        where: options?.where,
        include: options?.include,
        pagination,
        searchFields: options?.searchFields ?? defaultSearchFields,
      });
    },

    async findCursorPaginated(
      req: Request,
      options?: {
        where?: Record<string, unknown>;
        include?: Record<string, boolean>;
      },
    ): Promise<{ data: T[]; nextCursor?: number }> {
      const { cursor, limit = '20' } = req.query as { cursor?: string; limit?: string };

      return repository.findManyCursor({
        where: options?.where,
        include: options?.include,
        cursor: cursor !== null && cursor !== '' ? parseInt(cursor) : undefined,
        limit: parseInt(limit),
      });
    },
  };
}

/**
 * Express router wrapper that automatically adds pagination to GET list endpoints
 */

export function paginatedRouter(): Router {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const express = require('express') as { Router: () => Router };
  const router = express.Router();

  // Store original get method
  const originalGet = router.get.bind(router);

  // Override get method to add pagination middleware
  const extendedRouter = router as Router & {
    get: (path: string, ...handlers: RequestHandler[]) => Router;
  };
  
  extendedRouter.get = function (path: string, ...handlers: RequestHandler[]): Router {
    // Only add pagination to list endpoints (root or ending with 's')
    if (path === '/' || path.match(/s$/)) {
      return originalGet(path, parsePagination, ...handlers);
    }
    return originalGet(path, ...handlers);
  };

  return router;
}

/**
 * Async handler wrapper with pagination support
 */
export function paginatedHandler<T>(
  handler: (req: Request, pagination: PaginationOptions) => Promise<{ data: T[]; total: number }>,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = req.pagination || getPaginationParams(req);
      const result = await handler(req, pagination);

      const response = createPaginatedResponse(
        result.data,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        },
        `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`,
      );

      setPaginationHeaders(res, response.pagination);
      res.json(response);
    } catch (error: unknown) {
      next(error);
    }
  };
}

/**
 * Cache-aware pagination middleware
 */
export function cachedPagination(_cacheKeyPrefix: string, _ttl = 60): (req: Request, res: Response, next: NextFunction) => void {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // const _pagination = getPaginationParams(req);
    // const _cacheKey = `${cacheKeyPrefix}:${JSON.stringify({ ...req.query, ...pagination })}`;

    // Try to get from cache (implement cache service)
    // const cached = await cacheService.get(cacheKey);
    // if (cached) {
    //   return res.json(cached);
    // }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to cache the response
    res.json = function (data: unknown): Response {
      // Cache the response
      // cacheService.set(cacheKey, data, ttl);

      return originalJson(data);
    };

    next();
  };
}

/**
 * Performance monitoring for paginated endpoints
 */
export function monitorPagination(metricPrefix: string): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const pagination = req.pagination || getPaginationParams(req);

    // Monitor response
    res.on('finish', (): void => {
      const duration = Date.now() - start;
      logger.info(
        `Pagination metrics - ${metricPrefix}.pagination: page=${pagination.page} limit=${pagination.limit} duration=${duration}ms status=${res.statusCode}`,
      );

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow paginated query - ${req.path}: ${duration}ms`);
      }
    });

    next();
  };
}
