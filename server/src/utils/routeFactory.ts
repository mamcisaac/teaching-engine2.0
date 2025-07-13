import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../logger.js';

// Base interface for models that might have userId
interface BaseModel {
  id: number;
  userId?: number;
}

interface RouteFactoryOptions<T extends BaseModel = BaseModel> {
  modelName: string;
  prismaModel: {
    findMany: (args: Record<string, unknown>) => Promise<T[]>;
    findUnique: (args: Record<string, unknown>) => Promise<T | null>;
    create: (args: Record<string, unknown>) => Promise<T>;
    update: (args: Record<string, unknown>) => Promise<T>;
    delete: (args: Record<string, unknown>) => Promise<T>;
    count: (args: Record<string, unknown>) => Promise<number>;
  };
  createSchema?: z.ZodSchema<Record<string, unknown>>;
  updateSchema?: z.ZodSchema<Record<string, unknown>>;
  querySchema?: z.ZodSchema<Record<string, unknown>>;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  includeRelations?: Record<string, boolean | object>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  transformResponse?: (data: T) => T;
  beforeCreate?: (
    data: Record<string, unknown>,
    req: Request,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  afterCreate?: (data: T, req: Request) => Promise<void> | void;
  beforeUpdate?: (
    id: number,
    data: Record<string, unknown>,
    req: Request,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  afterUpdate?: (data: T, req: Request) => Promise<void> | void;
  beforeDelete?: (id: number, req: Request) => Promise<void> | void;
  afterDelete?: (id: number, req: Request) => Promise<void> | void;
}

export function createCrudRoutes<T extends BaseModel = BaseModel>(
  options: RouteFactoryOptions<T>,
): Router {
  const router = Router();
  const {
    modelName,
    prismaModel,
    createSchema,
    updateSchema,
    querySchema,
    middleware = [authMiddleware],
    includeRelations = {},
    orderBy = { id: 'desc' },
    transformResponse = (data) => data,
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete,
  } = options;

  // Apply middleware to all routes
  router.use(middleware);

  // GET - List all with optional query params
  router.get('/', async (req: Request, res: Response) => {
    try {
      const query = querySchema ? querySchema.parse(req.query) : req.query;

      const { page = 1, limit = 20, search, ...filters } = query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              // Add more searchable fields as needed
            ],
            ...filters,
          }
        : filters;

      const [items, total] = await Promise.all([
        prismaModel.findMany({
          where,
          include: includeRelations,
          orderBy,
          skip,
          take: Number(limit),
        }),
        prismaModel.count({ where }),
      ]);

      res.json({
        items: items.map(transformResponse),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (_error) {
      logger.error({ error: _error, modelName }, `Error fetching ${modelName}s`);
      res.status(500).json({ message: `Failed to fetch ${modelName}s` });
    }
  });

  // GET - Get single by ID
  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const item = await prismaModel.findUnique({
        where: { id },
        include: includeRelations,
      });

      if (!item) {
        res.status(404).json({ message: `${modelName} not found` });
        return;
      }

      res.json(transformResponse(item));
    } catch (_error) {
      logger.error({ error: _error, modelName, id: req.params.id }, `Error fetching ${modelName}`);
      res.status(500).json({ message: `Failed to fetch ${modelName}` });
    }
  });

  // POST - Create new
  router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      let data = createSchema ? createSchema.parse(req.body) : req.body;

      // Add user ID if authenticated
      if (req.user) {
        data.userId = req.user.id;
      }

      // Run before create hook
      if (beforeCreate) {
        data = await beforeCreate(data, req);
      }

      const item = await prismaModel.create({
        data,
        include: includeRelations,
      });

      // Run after create hook
      if (afterCreate) {
        await afterCreate(item, req);
      }

      res.status(201).json(transformResponse(item));
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: _error.errors });
        return;
      }
      logger.error({ error: _error, modelName }, `Error creating ${modelName}`);
      res.status(500).json({ message: `Failed to create ${modelName}` });
    }
  });

  // PUT - Update by ID
  router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      let data = updateSchema ? updateSchema.parse(req.body) : req.body;

      // Check if item exists
      const existing = await prismaModel.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ message: `${modelName} not found` });
        return;
      }

      // Check ownership if user ID exists
      if (req.user && existing.userId && existing.userId !== req.user.id) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Run before update hook
      if (beforeUpdate) {
        data = await beforeUpdate(id, data, req);
      }

      const item = await prismaModel.update({
        where: { id },
        data,
        include: includeRelations,
      });

      // Run after update hook
      if (afterUpdate) {
        await afterUpdate(item, req);
      }

      res.json(transformResponse(item));
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: _error.errors });
        return;
      }
      logger.error({ error: _error, modelName, id: req.params.id }, `Error updating ${modelName}`);
      res.status(500).json({ message: `Failed to update ${modelName}` });
    }
  });

  // DELETE - Delete by ID
  router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      // Check if item exists
      const existing = await prismaModel.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ message: `${modelName} not found` });
        return;
      }

      // Check ownership if user ID exists
      if (req.user && existing.userId && existing.userId !== req.user.id) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Run before delete hook
      if (beforeDelete) {
        await beforeDelete(id, req);
      }

      await prismaModel.delete({ where: { id } });

      // Run after delete hook
      if (afterDelete) {
        await afterDelete(id, req);
      }

      res.status(204).send();
    } catch (_error) {
      logger.error({ error: _error, modelName, id: req.params.id }, `Error deleting ${modelName}`);
      res.status(500).json({ message: `Failed to delete ${modelName}` });
    }
  });

  return router;
}
