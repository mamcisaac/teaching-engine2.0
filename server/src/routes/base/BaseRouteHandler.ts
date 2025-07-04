/**
 * BaseRouteHandler - Base class for all route handlers in the Teaching Engine
 * Provides common functionality, authentication, and CRUD operations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma.js';
import logger from '../../logger.js';
import { BaseService } from '../../services/base/BaseService.js';

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

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

export abstract class BaseRouteHandler<T = any> {
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
    next: NextFunction
  ): void => {
    const userId = req.user?.id;
    if (!userId) {
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
    fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
  ) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Setup common routes
   */
  protected setupRoutes(): void {
    const middleware = this.requireAuth ? [this.requireAuthentication] : [];

    // GET / - List items
    this.router.get(
      '/',
      ...middleware,
      this.asyncHandler(this.handleList.bind(this))
    );

    // GET /:id - Get single item
    this.router.get(
      '/:id',
      ...middleware,
      this.asyncHandler(this.handleGet.bind(this))
    );

    // POST / - Create item
    this.router.post(
      '/',
      ...middleware,
      this.asyncHandler(this.handleCreate.bind(this))
    );

    // PUT /:id - Update item
    this.router.put(
      '/:id',
      ...middleware,
      this.asyncHandler(this.handleUpdate.bind(this))
    );

    // DELETE /:id - Delete item
    this.router.delete(
      '/:id',
      ...middleware,
      this.asyncHandler(this.handleDelete.bind(this))
    );

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
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const crudOps = this.getCrudOperations();
      
      // Validate query parameters if schema provided
      const schemas = this.getValidationSchemas();
      const filters = schemas.query ? schemas.query.parse(req.query) : req.query;
      
      const items = await crudOps.findMany(filters, userId);
      res.json(items);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, error);
      next(error);
    }
  }

  protected async handleGet(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const crudOps = this.getCrudOperations();
      
      const item = await crudOps.findById(id, userId);
      
      if (!item) {
        res.status(404).json({ error: `${this.routeName} not found` });
        return;
      }
      
      res.json(item);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} get:`, error);
      next(error);
    }
  }

  protected async handleCreate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const schemas = this.getValidationSchemas();
      const data = schemas.create.parse(req.body);
      const crudOps = this.getCrudOperations();
      
      const item = await crudOps.create(data, userId);
      res.status(201).json(item);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} create:`, error);
      next(error);
    }
  }

  protected async handleUpdate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const schemas = this.getValidationSchemas();
      const data = schemas.update.parse(req.body);
      const crudOps = this.getCrudOperations();
      
      const item = await crudOps.update(id, data, userId);
      res.json(item);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} update:`, error);
      next(error);
    }
  }

  protected async handleDelete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const crudOps = this.getCrudOperations();
      
      const success = await crudOps.delete(id, userId);
      
      if (!success) {
        res.status(404).json({ error: `${this.routeName} not found` });
        return;
      }
      
      res.status(204).send();
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} delete:`, error);
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
            { userId: userId } // Alternative ownership field
          ]
        },
        ...(additionalFilters ? [additionalFilters] : [])
      ]
    };
  }

  /**
   * Helper method to validate ownership
   */
  protected async validateOwnership(
    tableName: string,
    id: string,
    userId: number
  ): Promise<boolean> {
    try {
      const record = await (prisma as unknown)[tableName].findFirst({
        where: {
          id,
          OR: [
            { isSystem: true },
            { createdByUserId: userId },
            { userId: userId }
          ]
        }
      });
      return !!record;
    } catch (_error) {
      this.logger.error(`Error validating ownership for ${tableName}:`, error);
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