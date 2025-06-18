import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

interface RouteOptions<T> {
  modelName: keyof PrismaClient;
  includeRelations?: Record<string, boolean | object>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  customValidation?: (data: any) => boolean;
  beforeCreate?: (data: any) => Promise<any> | any;
  afterCreate?: (created: T) => Promise<void> | void;
  beforeUpdate?: (id: number, data: any) => Promise<any> | any;
  afterUpdate?: (updated: T) => Promise<void> | void;
  beforeDelete?: (id: number) => Promise<void> | void;
  afterDelete?: (id: number) => Promise<void> | void;
}

export function createCrudRoutes<T extends { id: number }>(options: RouteOptions<T>) {
  const router = Router();
  const {
    modelName,
    includeRelations = {},
    orderBy = { id: 'desc' },
    customValidation,
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete,
  } = options;

  // @ts-ignore - Dynamic model access
  const model = prisma[modelName];

  // GET all
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await model.findMany({
        include: includeRelations,
        orderBy,
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  // GET by id
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await model.findUnique({
        where: { id: Number(req.params.id) },
        include: includeRelations,
      });
      if (!item) {
        return res.status(404).json({ error: 'Not Found' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST create
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (customValidation && !customValidation(req.body)) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      let data = req.body;
      if (beforeCreate) {
        data = await beforeCreate(data);
      }

      const created = await model.create({
        data,
        include: includeRelations,
      });

      if (afterCreate) {
        await afterCreate(created);
      }

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PUT update
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      if (customValidation && !customValidation(req.body)) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      let data = req.body;
      if (beforeUpdate) {
        data = await beforeUpdate(id, data);
      }

      const updated = await model.update({
        where: { id },
        data,
        include: includeRelations,
      });

      if (afterUpdate) {
        await afterUpdate(updated);
      }

      res.json(updated);
    } catch (err) {
      if ((err as any).code === 'P2025') {
        return res.status(404).json({ error: 'Not Found' });
      }
      next(err);
    }
  });

  // DELETE
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (beforeDelete) {
        await beforeDelete(id);
      }

      await model.delete({
        where: { id },
      });

      if (afterDelete) {
        await afterDelete(id);
      }

      res.status(204).send();
    } catch (err) {
      if ((err as any).code === 'P2025') {
        return res.status(404).json({ error: 'Not Found' });
      }
      next(err);
    }
  });

  return router;
}