/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * BaseRouteHandler - Base class for all route handlers in the Teaching Engine
 * Provides common functionality, authentication, and CRUD operations
 */

import type { Response, NextFunction } from 'express';
import { Router } from 'express';
import type { z } from 'zod';

import { logger } from '../../logger';
import { prisma } from '../../prisma';
import type { BaseService } from '../../services/base/BaseService';
import { formatErrorForLogging } from '../../utils/typeGuards';

import type { AuthenticatedRequest } from './middleware';

export type { AuthenticatedRequest };

export interface RouteHandlerOptions {
  routeName: string;
  requireAuth?: boolean;
  rateLimitConfig?: {
    windowMs: number;
    max: number;
  };
}

export interface CrudOperations<T> {
  create: (data: unknown, userId: number) => Promise<T>;
  findMany: (filters: unknown, userId: number) => Promise<T[]>;
  findById: (id: string, userId: number) => Promise<T | null>;
  update: (id: string, data: unknown, userId: number) => Promise<T>;
  delete: (id: string, userId: number) => Promise<boolean>;
}

export abstract class BaseRouteHandler<T = unknown> {
  protected readonly router: Router;
  protected readonly routeName: string;
  protected readonly logger: typeof logger;
  protected readonly requireAuth: boolean;

  constructor(options: RouteHandlerOptions) {
    this.router = Router();
    this.routeName = options.routeName;
    this.requireAuth = options.requireAuth ?? true;
    this.logger = logger.child({ route: options.routeName });

    this.setupRoutes();
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract getService(): BaseService;
  protected abstract getValidationSchemas(): {
    create: z.ZodSchema;
    update: z.ZodSchema;
    query?: z.ZodSchema;
  };
  protected abstract getCrudOperations(): CrudOperations<T>;

  /**
   * Authentication middleware
   */
  protected requireAuthentication = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = req.user.id;
    if (userId === 0) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.userId = userId;
    next();
  };

  /**
   * Async error handler wrapper
   */
  protected asyncHandler = (
    fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>,
  ): ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      void Promise.resolve(fn(req, res, next)).catch(next);
    };

  /**
   * Setup common routes
   */
  protected setupRoutes(): void {
    const middleware = this.requireAuth ? [this.requireAuthentication] : [];

    // GET / - List items
    this.router.get('/', ...middleware, this.asyncHandler(this.handleList.bind(this)));

    // GET /:id - Get single item
    this.router.get('/:id', ...middleware, this.asyncHandler(this.handleGet.bind(this)));

    // POST / - Create item
    this.router.post('/', ...middleware, this.asyncHandler(this.handleCreate.bind(this)));

    // PUT /:id - Update item
    this.router.put('/:id', ...middleware, this.asyncHandler(this.handleUpdate.bind(this)));

    // DELETE /:id - Delete item
    this.router.delete('/:id', ...middleware, this.asyncHandler(this.handleDelete.bind(this)));

    // Allow subclasses to add custom routes
    this.setupCustomRoutes();
  }

  /**
   * Override this method to add custom routes
   */
  protected setupCustomRoutes(): void {
    // Default: no custom routes
  }

  /**
   * Standard CRUD handlers
   */
  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (!userId || userId === 0) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const crudOps = this.getCrudOperations();

      // Validate query parameters if schema provided
      const schemas = this.getValidationSchemas();
      const filters: Record<string, unknown> = schemas.query ? (schemas.query.parse(req.query) as Record<string, unknown>) : (req.query as Record<string, unknown>);

      const items = await crudOps.findMany(filters, userId);
      res.json(items);
      return;
    } catch (error: unknown) {
      this.logger.error(`Error in ${this.routeName} list:`, formatErrorForLogging(error));
      next(error);
    }
  }

  protected async handleGet(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId === null || userId === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
      }
      const crudOps = this.getCrudOperations();

      const item = await crudOps.findById(id, userId);

      if (!item) {
        res.status(404).json({ error: `${this.routeName} not found` });
        return;
      }

      res.json(item);
      return;
    } catch (error: unknown) {
      this.logger.error(`Error in ${this.routeName} get:`, formatErrorForLogging(error));
      next(error);
    }
  }

  protected async handleCreate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId === null || userId === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const schemas = this.getValidationSchemas();
      const data = schemas.create.parse(req.body) as Record<string, unknown>;
      const crudOps = this.getCrudOperations();

      const item = await crudOps.create(data, userId);
      res.status(201).json(item);
    } catch (error: unknown) {
      this.logger.error(`Error in ${this.routeName} create:`, formatErrorForLogging(error));
      next(error);
    }
  }

  protected async handleUpdate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId === null || userId === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
      }
      const schemas = this.getValidationSchemas();
      const data = schemas.update.parse(req.body) as Record<string, unknown>;
      const crudOps = this.getCrudOperations();

      const item = await crudOps.update(id, data, userId);
      res.json(item);
      return;
    } catch (error: unknown) {
      this.logger.error(`Error in ${this.routeName} update:`, formatErrorForLogging(error));
      next(error);
    }
  }

  protected async handleDelete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId === null || userId === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
      }
      const crudOps = this.getCrudOperations();

      const success = await crudOps.delete(id, userId);

      if (!success) {
        res.status(404).json({ error: `${this.routeName} not found` });
        return;
      }

      res.status(204).send();
    } catch (error: unknown) {
      this.logger.error(`Error in ${this.routeName} delete:`, formatErrorForLogging(error));
      next(error);
    }
  }

  /**
   * Helper method to create ownership filter
   */
  protected createOwnershipFilter(userId: number, additionalFilters?: unknown): unknown {
    return {
      AND: [
        {
          OR: [
            { isSystem: true },
            { createdByUserId: userId },
            { userId }, // Alternative ownership field
          ],
        },
        ...(additionalFilters ? [additionalFilters] : []),
      ],
    };
  }

  /**
   * Helper method to validate ownership
   */
  protected async validateOwnership(
    tableName: string,
    id: string,
    userId: number,
  ): Promise<boolean> {
    try {
      // Type-safe access to prisma models
      const model = (prisma as unknown as Record<string, { findFirst?: (args: { where: Record<string, unknown> }) => Promise<unknown> }>)[tableName];
      if (!model || typeof model.findFirst !== 'function') {
        this.logger.error(`Invalid table name: ${tableName}`);
        return false;
      }
      
      const record: unknown = await model.findFirst({
        where: {
          id,
          OR: [{ isSystem: true }, { createdByUserId: userId }, { userId }],
        },
      });
      return record !== null && record !== undefined;
    } catch (error: unknown) {
      this.logger.error(`Error validating ownership for ${tableName}:`, formatErrorForLogging(error));
      return false;
    }
  }

  /**
   * Get the router instance
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get route name
   */
  public getRouteName(): string {
    return this.routeName;
  }
}
