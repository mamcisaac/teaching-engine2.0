import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../prisma';

const router = Router();

// Get user's collections
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { includePublic = false } = req.query;

    const where = includePublic
      ? {
          OR: [{ userId: req.user!.id }, { isPublic: true }],
        }
      : { userId: req.user!.id };

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
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collections',
    });
  }
});

// Get collection details with activities
router.get('/:collectionId', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        OR: [{ userId: req.user!.id }, { isPublic: true }],
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
      return res.status(404).json({
        success: false,
        error: 'Collection not found',
      });
    }

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.error('Get collection details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection details',
    });
  }
});

// Create a new collection
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = createCollectionSchema.parse(req.body);

    const collection = await prisma.activityCollection.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic || false,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to create collection',
    });
  }
});

// Update collection
const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

router.put('/:collectionId', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const data = updateCollectionSchema.parse(req.body);

    // Check ownership
    const existing = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId: req.user!.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found or you do not have permission to edit it',
      });
    }

    const updated = await prisma.activityCollection.update({
      where: { id: collectionId },
      data,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to update collection',
    });
  }
});

// Delete collection
router.delete('/:collectionId', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Check ownership
    const existing = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId: req.user!.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found or you do not have permission to delete it',
      });
    }

    await prisma.activityCollection.delete({
      where: { id: collectionId },
    });

    res.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collection',
    });
  }
});

// Add activity to collection
const addActivitySchema = z.object({
  activityId: z.string(),
});

router.post('/:collectionId/activities', authMiddleware, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { activityId } = addActivitySchema.parse(req.body);

    // Check collection ownership
    const collection = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId: req.user!.id,
      },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found or you do not have permission to modify it',
      });
    }

    // Check if activity exists
    const activity = await prisma.externalActivity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
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
  } catch (error) {
    console.error('Add activity to collection error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to add activity to collection',
    });
  }
});

// Remove activity from collection
router.delete('/:collectionId/activities/:activityId', authMiddleware, async (req, res) => {
  try {
    const { collectionId, activityId } = req.params;

    // Check collection ownership
    const collection = await prisma.activityCollection.findFirst({
      where: {
        id: collectionId,
        userId: req.user!.id,
      },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found or you do not have permission to modify it',
      });
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
  } catch (error) {
    console.error('Remove activity from collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove activity from collection',
    });
  }
});

// Get popular/trending collections
router.get('/trending/public', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const collections = await prisma.activityCollection.findMany({
      where: { isPublic: true },
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
      take: Number(limit),
    });

    res.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    console.error('Get trending collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending collections',
    });
  }
});

export default router;
