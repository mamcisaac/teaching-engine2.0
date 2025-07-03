/**
 * Substitute Plan Routes
 * Comprehensive API for substitute plan generation, management, and access
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { SubstitutePlanService } from '../services/substitutePlanService';
import { prisma } from '../prisma';
import logger from '../logger';

const router = Router();

// Validation schemas
const generateSubPlanSchema = z.object({
  dateFor: z.string().datetime(),
  title: z.string().optional(),
  grade: z.number().int().min(1).max(8).optional(),
  subject: z.string().optional(),
  sourceUnitPlanId: z.string().optional(),
  sourceLessonPlanIds: z.array(z.string()).optional(),
  includeEmergencyInfo: z.boolean().default(true),
  includeClassroomRoutines: z.boolean().default(true),
  customInstructions: z.string().optional(),
});

const saveSubPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dateFor: z.string().datetime(),
  grade: z.number().int().min(1).max(8).optional(),
  subject: z.string().optional(),
  schedule: z.array(z.object({
    time: z.string(),
    activity: z.string(),
    notes: z.string().optional(),
    materials: z.array(z.string()).optional(),
    location: z.string().optional(),
  })),
  classroomRoutines: z.array(z.object({
    category: z.enum(['morning', 'transition', 'dismissal', 'behavior', 'emergency', 'other']),
    title: z.string(),
    description: z.string(),
    timeOfDay: z.string().optional(),
    priority: z.number().int(),
  })),
  emergencyInfo: z.object({
    evacuationProcedure: z.string(),
    lockdownProcedure: z.string(),
    emergencyContacts: z.array(z.object({
      name: z.string(),
      role: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      extension: z.string().optional(),
      availability: z.string().optional(),
    })),
    importantLocations: z.array(z.object({
      name: z.string(),
      location: z.string(),
    })),
  }),
  lessonPlans: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subject: z.string(),
    time: z.string(),
    duration: z.number().int(),
    simplifiedInstructions: z.string(),
    materials: z.array(z.string()),
    accommodations: z.array(z.string()).optional(),
    backupActivity: z.string().optional(),
    learningGoals: z.array(z.string()),
  })),
  behaviorPlan: z.object({
    classExpectations: z.array(z.string()),
    rewardSystem: z.string().optional(),
    consequenceSystem: z.string().optional(),
    specialStrategies: z.array(z.string()).optional(),
  }),
  studentNotes: z.object({
    classSize: z.number().int(),
    generalAchievementLevel: z.string(),
    commonChallenges: z.array(z.string()).optional(),
    successStrategies: z.array(z.string()).optional(),
    groupDynamics: z.string().optional(),
    attentionSpan: z.string().optional(),
    specialConsiderations: z.array(z.string()).optional(),
  }),
  materialsList: z.array(z.object({
    name: z.string(),
    location: z.string(),
    quantity: z.string().optional(),
    notes: z.string().optional(),
    alternatives: z.array(z.string()).optional(),
  })),
  teacherContact: z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    extension: z.string().optional(),
    availability: z.string().optional(),
  }).optional(),
  adminContact: z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    extension: z.string().optional(),
    availability: z.string().optional(),
  }).optional(),
  sourceUnitPlanId: z.string().optional(),
  sourceLessonPlanIds: z.array(z.string()).optional(),
});

const updateSubPlanSchema = saveSubPlanSchema.partial();

const listSubPlansSchema = z.object({
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  offset: z.string().transform(val => parseInt(val, 10)).default('0'),
});

/**
 * Generate substitute plan
 * POST /api/substitute-plans/generate
 */
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = generateSubPlanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const {
      dateFor,
      title,
      grade,
      subject,
      sourceUnitPlanId,
      sourceLessonPlanIds,
      includeEmergencyInfo,
      includeClassroomRoutines,
      customInstructions,
    } = validation.data;

    logger.info(`Generating substitute plan for user ${userId}`, {
      dateFor,
      grade,
      subject,
      sourceUnitPlanId,
      sourceLessonPlanIds,
    });

    const substitutePlan = await SubstitutePlanService.generatePlan({
      userId,
      dateFor: new Date(dateFor),
      title,
      grade,
      subject,
      sourceUnitPlanId,
      sourceLessonPlanIds,
      includeEmergencyInfo,
      includeClassroomRoutines,
      customInstructions,
    });

    res.json({
      success: true,
      data: substitutePlan,
    });
  } catch (error) {
    logger.error('Substitute plan generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all substitute plans for the current user
 * GET /api/substitute-plans
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = listSubPlansSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: validation.error.errors 
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { isActive, dateFrom, dateTo, limit, offset } = validation.data;

    const plans = await SubstitutePlanService.getUserPlans(userId, {
      isActive,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit,
      offset,
    });

    res.json({
      success: true,
      data: plans,
      pagination: {
        limit,
        offset,
        total: plans.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching substitute plans:', error);
    res.status(500).json({ 
      error: 'Failed to fetch substitute plans',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get a specific substitute plan
 * GET /api/substitute-plans/:id
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const planId = req.params.id;
    const plan = await SubstitutePlanService.getPlanById(userId, planId);

    if (!plan) {
      return res.status(404).json({ error: 'Substitute plan not found' });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Error fetching substitute plan:', error);
    res.status(500).json({ 
      error: 'Failed to fetch substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Save a new substitute plan
 * POST /api/substitute-plans
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = saveSubPlanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const planData = validation.data;

    logger.info(`Saving substitute plan for user ${userId}`, {
      title: planData.title,
      dateFor: planData.dateFor,
      grade: planData.grade,
    });

    const plan = await SubstitutePlanService.savePlan(userId, {
      ...planData,
      dateFor: new Date(planData.dateFor),
    } as Parameters<typeof SubstitutePlanService.savePlan>[1]);

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Error saving substitute plan:', error);
    res.status(500).json({ 
      error: 'Failed to save substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update an existing substitute plan
 * PUT /api/substitute-plans/:id
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = updateSubPlanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const planId = req.params.id;
    const updateData = validation.data;

    // Check if plan exists and belongs to user
    const existingPlan = await SubstitutePlanService.getPlanById(userId, planId);
    if (!existingPlan) {
      return res.status(404).json({ error: 'Substitute plan not found' });
    }

    logger.info(`Updating substitute plan ${planId} for user ${userId}`);

    // Convert date string to Date object if provided and prepare update data
    const processedUpdateData: Record<string, unknown> = { ...updateData };
    if (updateData.dateFor) {
      processedUpdateData.dateFor = new Date(updateData.dateFor);
    }

    const plan = await SubstitutePlanService.updatePlan(
      userId, 
      planId, 
      processedUpdateData as Parameters<typeof SubstitutePlanService.updatePlan>[2]
    );

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Error updating substitute plan:', error);
    res.status(500).json({ 
      error: 'Failed to update substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete a substitute plan
 * DELETE /api/substitute-plans/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const planId = req.params.id;

    // Check if plan exists and belongs to user
    const existingPlan = await SubstitutePlanService.getPlanById(userId, planId);
    if (!existingPlan) {
      return res.status(404).json({ error: 'Substitute plan not found' });
    }

    logger.info(`Deleting substitute plan ${planId} for user ${userId}`);

    await SubstitutePlanService.deletePlan(userId, planId);

    res.json({
      success: true,
      message: 'Substitute plan deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting substitute plan:', error);
    res.status(500).json({ 
      error: 'Failed to delete substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Deactivate a substitute plan
 * POST /api/substitute-plans/:id/deactivate
 */
router.post('/:id/deactivate', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const planId = req.params.id;

    // Check if plan exists and belongs to user
    const existingPlan = await SubstitutePlanService.getPlanById(userId, planId);
    if (!existingPlan) {
      return res.status(404).json({ error: 'Substitute plan not found' });
    }

    if (!existingPlan.isActive) {
      return res.status(400).json({ error: 'Substitute plan is already inactive' });
    }

    logger.info(`Deactivating substitute plan ${planId} for user ${userId}`);

    const plan = await SubstitutePlanService.deactivatePlan(userId, planId);

    res.json({
      success: true,
      data: plan,
      message: 'Substitute plan deactivated',
    });
  } catch (error) {
    logger.error('Error deactivating substitute plan:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate substitute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get substitute plan statistics
 * GET /api/substitute-plans/stats
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const [active, inactive, total, recent] = await Promise.all([
      SubstitutePlanService.getUserPlans(userId, { isActive: true }),
      SubstitutePlanService.getUserPlans(userId, { isActive: false }),
      SubstitutePlanService.getUserPlans(userId),
      SubstitutePlanService.getUserPlans(userId, { 
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        limit: 100 
      }),
    ]);

    const stats = {
      total: total.length,
      active: active.length,
      inactive: inactive.length,
      recentlyUsed: recent.filter(p => p.lastUsed).length,
      thisMonth: recent.filter(p => {
        const planDate = new Date(p.dateFor);
        const now = new Date();
        return planDate.getMonth() === now.getMonth() && 
               planDate.getFullYear() === now.getFullYear();
      }).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching substitute plan stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch substitute plan statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get upcoming dates that need substitute plans
 * GET /api/substitute-plans/upcoming-dates
 */
router.get('/upcoming-dates', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get existing plans for the next month
    const existingPlans = await SubstitutePlanService.getUserPlans(userId, {
      dateFrom: new Date(),
      dateTo: nextMonth,
      isActive: true,
    });

    // Get calendar events that might need substitute plans
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        teacherId: userId,
        start: {
          gte: new Date(),
          lte: nextMonth,
        },
        eventType: { in: ['PD_DAY', 'HOLIDAY'] }, // Days when substitutes might be needed
      },
      orderBy: { start: 'asc' },
    });

    const suggestions = upcomingEvents
      .filter(event => {
        // Don't suggest dates that already have plans
        return !existingPlans.some(plan => {
          const planDate = new Date(plan.dateFor);
          const eventDate = new Date(event.start);
          return planDate.toDateString() === eventDate.toDateString();
        });
      })
      .map(event => ({
        date: event.start,
        reason: event.title,
        eventType: event.eventType,
      }))
      .slice(0, 10); // Limit to 10 suggestions

    res.json({
      success: true,
      data: {
        existingPlans: existingPlans.length,
        suggestions,
      },
    });
  } catch (error) {
    logger.error('Error fetching upcoming dates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming dates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;