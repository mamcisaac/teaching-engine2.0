import { Router } from 'express';
import { getActivityDiscoveryService } from '../services/activityDiscoveryService';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const activityService = getActivityDiscoveryService();

// Search activities
const searchSchema = z.object({
  query: z.string().optional(),
  grade: z.coerce.number().int().min(0).max(12).optional(),
  subject: z.string().optional(),
  durationMin: z.coerce.number().int().positive().optional(),
  durationMax: z.coerce.number().int().positive().optional(),
  materials: z.string().optional().transform(val => val ? val.split(',') : undefined),
  requireAllMaterials: z.coerce.boolean().optional(),
  activityType: z.string().optional().transform(val => val ? val.split(',') : undefined),
  language: z.enum(['en', 'fr']).optional(),
  curriculumAlignment: z.string().optional().transform(val => val ? val.split(',') : undefined),
  sources: z.string().optional().transform(val => val ? val.split(',') : undefined),
  onlyFree: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const params = searchSchema.parse(req.query);
    
    const searchParams = {
      query: params.query || '',
      grade: params.grade,
      subject: params.subject,
      duration: (params.durationMin || params.durationMax) ? {
        min: params.durationMin,
        max: params.durationMax
      } : undefined,
      materials: params.materials,
      requireAllMaterials: params.requireAllMaterials,
      activityType: params.activityType,
      language: params.language,
      curriculumAlignment: params.curriculumAlignment,
      sources: params.sources,
      onlyFree: params.onlyFree,
      limit: params.limit,
      offset: params.offset
    };

    const results = await activityService.search(searchParams, req.user!.id);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Activity search error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to search activities'
    });
  }
});

// Get activity details
router.get('/:source/:externalId', authMiddleware, async (req, res) => {
  try {
    const { source, externalId } = req.params;
    
    const activity = await activityService.getActivity(source, externalId);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity details'
    });
  }
});

// Import activity into lesson plan
const importSchema = z.object({
  activityId: z.string(),
  lessonPlanId: z.string().optional(),
  lessonSection: z.enum(['mindsOn', 'action', 'consolidation']).optional(),
  customizations: z.record(z.any()).optional(),
  notes: z.string().optional()
});

router.post('/import', authMiddleware, async (req, res) => {
  try {
    const params = importSchema.parse(req.body);
    
    const activityImport = await activityService.importActivity(
      params,
      req.user!.id
    );
    
    res.json({
      success: true,
      data: activityImport
    });
  } catch (error) {
    console.error('Import activity error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to import activity'
    });
  }
});

// Rate an activity
const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().optional().nullable(),
  gradeUsed: z.number().int().optional(),
  subjectUsed: z.string().optional(),
  workedWell: z.string().optional(),
  challenges: z.string().optional(),
  wouldRecommend: z.boolean().optional()
});

router.post('/:activityId/rate', authMiddleware, async (req, res) => {
  try {
    const { activityId } = req.params;
    const params = ratingSchema.parse(req.body);
    
    const rating = await activityService.rateActivity(
      activityId,
      params.rating,
      params.review || null,
      {
        gradeUsed: params.gradeUsed,
        subjectUsed: params.subjectUsed,
        workedWell: params.workedWell,
        challenges: params.challenges,
        wouldRecommend: params.wouldRecommend
      },
      req.user!.id
    );
    
    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Rate activity error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to rate activity'
    });
  }
});

// Get activity ratings and reviews
router.get('/:activityId/reviews', authMiddleware, async (req, res) => {
  try {
    const { activityId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const { prisma } = await import('../prisma');
    
    const reviews = await prisma.activityRating.findMany({
      where: { activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });
    
    const totalCount = await prisma.activityRating.count({
      where: { activityId }
    });
    
    res.json({
      success: true,
      data: {
        reviews,
        totalCount
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity reviews'
    });
  }
});

// Get recommended activities for a lesson plan
router.get('/recommendations/:lessonPlanId', authMiddleware, async (req, res) => {
  try {
    const { lessonPlanId } = req.params;
    const { limit = 5 } = req.query;
    
    const recommendations = await activityService.getRecommendedActivities(
      lessonPlanId,
      req.user!.id,
      Number(limit)
    );
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity recommendations'
    });
  }
});

// Get user's imported activities
router.get('/imported', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const { prisma } = await import('../prisma');
    
    const imports = await prisma.activityImport.findMany({
      where: { userId: req.user!.id },
      include: {
        activity: true,
        lessonPlan: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: { lastUsed: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });
    
    const totalCount = await prisma.activityImport.count({
      where: { userId: req.user!.id }
    });
    
    res.json({
      success: true,
      data: {
        imports,
        totalCount
      }
    });
  } catch (error) {
    console.error('Get imported activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get imported activities'
    });
  }
});

export default router;