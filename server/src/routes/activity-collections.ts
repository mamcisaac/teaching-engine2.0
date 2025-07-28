import { isErrorLike } from '@shared/utils/typeGuards';
import { prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { authMiddleware } from '../middleware/auth';
import { getUserId } from '../utils/authHelpers';
import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Helper function to safely get boolean values
function getSafeBooleanValue(value: unknown): boolean {
  if (value === 'true' || value === true) {
return true;
}
  return false;
}

// Helper function to safely get numeric values
function getSafeNumericValue(value: unknown, defaultValue: number): number {
  if (value === null || value === undefined) {
return defaultValue;
}
  if (typeof value === 'number' && !isNaN(value)) {
return value;
}
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

// Async middleware wrapper to handle promises properly
const asyncMiddleware = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };

// Get user's collections
router.get('/', asyncMiddleware(authMiddleware), asyncMiddleware(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    
    const includePublic = getSafeBooleanValue(req.query.includePublic);

    const where = includePublic
      ? {
          userId, // Single-teacher use - only show user's own collections,
        }
      : { userId };

    const collections = await prisma.activityCollection.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: collections,
    });
  } catch (_error) {
    const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
    logger.error('Get collections error:', errorMessage);
    res.status(500).json({
      success: false,
      error: 'Failed to get collections',
    });
  }
}));

// Get collection details with activities
router.get('/:collectionId', asyncMiddleware(authMiddleware), asyncMiddleware(async (req: AuthenticatedRequest, res: Response) => {

    try {
    const userId = getUserId(req, res);
    if (!userId) return;
    
    const { collectionId } = req.params;

    const collection = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId, // Single-teacher use - only show user's own collections,
      },
      include: {
        items: {
          include: {
            activity: true,
          },
          orderBy: { addedAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!collection) {
      res.status(404).json({
        success: false,
        error: 'Collection not found',
      });
      return;
    }

    res.json({
      success: true,
      data: collection,
    });
    return;
  } catch (_error) {
    const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
    logger.error('Get collection details error:', errorMessage);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection details',
    });
    return;
  }

}));

// Create a new collection
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  // isPublic field removed - single-teacher use only
});

router.post('/', authMiddleware, asyncMiddleware(async (req: AuthenticatedRequest, res: Response) => {

    try {
    const userId = getUserId(req, res);
    if (!userId) return;
    
    const data = createCollectionSchema.parse(req.body);

    const collection = await prisma.activityCollection.create({
      data: {
        name: data.name,
        description: data.description,
        // isPublic removed - single-teacher use only
        userId,
      },
    });

    res.json({
      success: true,
      data: collection,
    });
    return;
  } catch (_error) {
    const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
    logger.error('Create collection error:', errorMessage);
    res.status(400).json({
      success: false,
      error: _error instanceof z.ZodError ? _error.errors : 'Failed to create collection',
    });
    return;
  }

}));

// Update collection
const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  // isPublic field removed - single-teacher use only
});

router.put('/:collectionId', authMiddleware, asyncMiddleware(async (req: AuthenticatedRequest, res: Response) => {

    try {
    const userId = getUserId(req, res);
    if (!userId) return;
    
    const { collectionId } = req.params;
    const data = updateCollectionSchema.parse(req.body);

    // Check ownership
    const existing = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Collection not found or you do not have permission to edit it',
      });
      return;
    }

    const updated = await prisma.activityCollection.update({
      where: { id: collectionId },
      data,
    });

    res.json({
      success: true,
      data: updated,
    });
    return;
  } catch (_error) {
    const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
    logger.error('Update collection error:', errorMessage);
    res.status(400).json({
      success: false,
      error: _error instanceof z.ZodError ? _error.errors : 'Failed to update collection',
    });
    return;
  }

}));

// Delete collection
router.delete(
  '/:collectionId',
  authMiddleware,
  asyncMiddleware(async (req: AuthenticatedRequest, res: Response) => {

      try {
      if (req.user?.id === null || req.user?.id === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const { collectionId } = req.params;

      // Check ownership
      const existing = await prisma.activityCollection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Collection not found or you do not have permission to delete it',
        });
        return;
      }

      await prisma.activityCollection.delete({
        where: { id: collectionId },
      });

      res.json({
        success: true,
        message: 'Collection deleted successfully',
      });
      return;
    } catch (_error) {
      const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
      logger.error('Delete collection error:', errorMessage);
      res.status(500).json({
        success: false,
        error: 'Failed to delete collection',
      });
      return;
    }

  }),
);

// Add activity to collection
const addActivitySchema = z.object({
  activityId: z.string(),
});

router.post(
  '/:collectionId/activities',
  authMiddleware,
  asyncMiddleware(async (req: AuthenticatedRequest, res: Response) => {

      try {
      if (req.user?.id === null || req.user?.id === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const { collectionId } = req.params;
      const { activityId } = addActivitySchema.parse(req.body);

      // Check collection ownership
      const collection = await prisma.activityCollection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
      });

      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found or you do not have permission to modify it',
        });
        return;
      }

      // Check if activity exists
      const activity = await prisma.externalActivity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        res.status(404).json({
          success: false,
          error: 'Activity not found',
        });
        return;
      }

      // Add to collection (upsert to avoid duplicates)
      const item = await prisma.activityCollectionItem.upsert({
        where: {
          collectionId_activityId: {
            collectionId,
            activityId,
          },
        },
        update: {
          addedAt: new Date(), // Update timestamp if re-adding
        },
        create: {
          collectionId,
          activityId,
        },
        include: {
          activity: true,
        },
      });

      res.json({
        success: true,
        data: item,
      });
      return;
    } catch (_error) {
      const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
      logger.error('Add activity to collection error:', errorMessage);
      res.status(400).json({
        success: false,
        error:
          _error instanceof z.ZodError ? _error.errors : 'Failed to add activity to collection',
      });
      return;
    }
  })
);

// Remove activity from collection
router.delete(
  '/:collectionId/activities/:activityId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {

      try {
      if (req.user?.id === null || req.user?.id === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const { collectionId, activityId } = req.params;

      // Check collection ownership
      const collection = await prisma.activityCollection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
      });

      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found or you do not have permission to modify it',
        });
        return;
      }

      await prisma.activityCollectionItem.delete({
        where: {
          collectionId_activityId: {
            collectionId,
            activityId,
          },
        },
      });

      res.json({
        success: true,
        message: 'Activity removed from collection',
      });
      return;
    } catch (_error) {
      const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
      logger.error('Remove activity from collection error:', errorMessage);
      res.status(500).json({
        success: false,
        error: 'Failed to remove activity from collection',
      });
      return;
    }

  },
);

// Get popular/trending collections
router.get(
  '/trending/public',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {

      try {
      if (req.user?.id === null || req.user?.id === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const limit = getSafeNumericValue(req.query.limit, 10);

      const collections = await prisma.activityCollection.findMany({
        where: { userId }, // Single-teacher use - only user's collections
        include: {
          _count: {
            select: { items: true },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ items: { _count: 'desc' } }, { updatedAt: 'desc' }],
        take: limit,
      });

      res.json({
        success: true,
        data: collections,
      });
      return;
    } catch (_error) {
      const errorMessage = isErrorLike(_error) ? _error.message : 'Unknown error';
      logger.error('Get trending collections error:', errorMessage);
      res.status(500).json({
        success: false,
        error: 'Failed to get trending collections',
      });
      return;
    }

  },
);

export { router };
