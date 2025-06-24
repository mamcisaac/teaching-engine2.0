import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const unitPlanCreateSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().optional(),
  longRangePlanId: z.string().min(1),
  description: z.string().optional(),
  descriptionFr: z.string().optional(),
  bigIdeas: z.string().optional(),
  bigIdeasFr: z.string().optional(),
  essentialQuestions: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  estimatedHours: z.number().int().positive().optional(),
  assessmentPlan: z.string().optional(),
  successCriteria: z.array(z.string()).optional(),
  expectationIds: z.array(z.string()).optional(),
});

const unitPlanUpdateSchema = unitPlanCreateSchema.partial().omit({ longRangePlanId: true });

// Get all unit plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { longRangePlanId, startDate, endDate } = req.query;
    
    const where: Prisma.UnitPlanWhereInput = { userId };
    if (longRangePlanId) where.longRangePlanId = String(longRangePlanId);
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(String(startDate));
      if (endDate) where.startDate.lte = new Date(String(endDate));
    }
    
    const unitPlans = await prisma.unitPlan.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true,
          },
        },
        _count: {
          select: {
            lessonPlans: true,
            expectations: true,
            resources: true,
          },
        },
      },
    });
    
    res.json(unitPlans);
  } catch (err) {
    next(err);
  }
});

// Get a single unit plan
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true,
          },
          orderBy: {
            expectation: { code: 'asc' },
          },
        },
        lessonPlans: {
          orderBy: { date: 'asc' },
          include: {
            _count: {
              select: { expectations: true },
            },
            daybookEntry: {
              select: {
                id: true,
                overallRating: true,
                wouldReuseLesson: true,
              },
            },
          },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!unitPlan) {
      return res.status(404).json({ error: 'Unit plan not found' });
    }
    
    // Calculate progress
    const totalLessons = unitPlan.lessonPlans.length;
    const completedLessons = unitPlan.lessonPlans.filter(lp => lp.daybookEntry).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    res.json({
      ...unitPlan,
      progress: {
        total: totalLessons,
        completed: completedLessons,
        percentage: progress,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create a new unit plan
router.post('/', validate(unitPlanCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationIds, essentialQuestions, successCriteria, ...planData } = req.body;
    
    // Verify user owns the long-range plan
    const longRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        id: planData.longRangePlanId,
        userId,
      },
    });
    
    if (!longRangePlan) {
      return res.status(404).json({ error: 'Long-range plan not found' });
    }
    
    const unitPlan = await prisma.unitPlan.create({
      data: {
        ...planData,
        userId,
        startDate: new Date(planData.startDate),
        endDate: new Date(planData.endDate),
        essentialQuestions: essentialQuestions || [],
        successCriteria: successCriteria || [],
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true,
          },
        },
        _count: {
          select: {
            lessonPlans: true,
            expectations: true,
          },
        },
      },
    });
    
    // Link curriculum expectations if provided
    if (expectationIds && expectationIds.length > 0) {
      // Validate expectation IDs exist
      const validExpectations = await prisma.curriculumExpectation.findMany({
        where: { id: { in: expectationIds } },
        select: { id: true },
      });
      
      if (validExpectations.length !== expectationIds.length) {
        return res.status(400).json({ 
          error: 'One or more curriculum expectations not found',
          provided: expectationIds,
          found: validExpectations.map(e => e.id)
        });
      }
      
      await prisma.unitPlanExpectation.createMany({
        data: expectationIds.map((expectationId: string) => ({
          unitPlanId: unitPlan.id,
          expectationId,
        })),
      });
      
      // Refetch with expectations
      const updatedPlan = await prisma.unitPlan.findUnique({
        where: { id: unitPlan.id },
        include: {
          longRangePlan: {
            select: {
              id: true,
              title: true,
              subject: true,
              grade: true,
            },
          },
          expectations: {
            include: { expectation: true },
          },
          _count: {
            select: {
              lessonPlans: true,
              resources: true,
            },
          },
        },
      });
      
      return res.status(201).json(updatedPlan);
    }
    
    res.status(201).json(unitPlan);
  } catch (err) {
    next(err);
  }
});

// Update a unit plan
router.put('/:id', validate(unitPlanUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationIds, essentialQuestions, successCriteria, ...updateData } = req.body;
    
    // Verify ownership
    const existing = await prisma.unitPlan.findFirst({
      where: { id: req.params.id, userId },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Unit plan not found' });
    }
    
    // Prepare update data
    const data: any = { ...updateData };
    if (updateData.startDate) data.startDate = new Date(updateData.startDate);
    if (updateData.endDate) data.endDate = new Date(updateData.endDate);
    if (essentialQuestions !== undefined) data.essentialQuestions = essentialQuestions;
    if (successCriteria !== undefined) data.successCriteria = successCriteria;
    
    // Update the plan
    const unitPlan = await prisma.unitPlan.update({
      where: { id: req.params.id },
      data,
    });
    
    // Update expectations if provided
    if (expectationIds !== undefined) {
      // Remove existing expectations
      await prisma.unitPlanExpectation.deleteMany({
        where: { unitPlanId: unitPlan.id },
      });
      
      // Add new expectations
      if (expectationIds.length > 0) {
        await prisma.unitPlanExpectation.createMany({
          data: expectationIds.map((expectationId: string) => ({
            unitPlanId: unitPlan.id,
            expectationId,
          })),
          });
      }
    }
    
    // Refetch with updated relationships
    const updatedPlan = await prisma.unitPlan.findUnique({
      where: { id: unitPlan.id },
      include: {
        longRangePlan: true,
        expectations: {
          include: { expectation: true },
        },
        lessonPlans: {
          orderBy: { date: 'asc' },
          include: {
            _count: { select: { expectations: true } },
          },
        },
        resources: true,
      },
    });
    
    res.json(updatedPlan);
  } catch (err) {
    next(err);
  }
});

// Delete a unit plan
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify ownership and check for dependencies
    const unitPlan = await prisma.unitPlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        _count: { select: { lessonPlans: true } },
      },
    });
    
    if (!unitPlan) {
      return res.status(404).json({ error: 'Unit plan not found' });
    }
    
    if (unitPlan._count.lessonPlans > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete unit plan with existing lesson plans' 
      });
    }
    
    await prisma.unitPlan.delete({
      where: { id: req.params.id },
    });
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Add a resource to unit plan
router.post('/:id/resources', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { title, type, url, notes } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    
    // Verify ownership
    const unitPlan = await prisma.unitPlan.findFirst({
      where: { id: req.params.id, userId },
    });
    
    if (!unitPlan) {
      return res.status(404).json({ error: 'Unit plan not found' });
    }
    
    const resource = await prisma.unitPlanResource.create({
      data: {
        unitPlanId: req.params.id,
        title,
        type,
        url,
        notes,
      },
    });
    
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

// Delete a resource
router.delete('/:id/resources/:resourceId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify ownership through unit plan
    const resource = await prisma.unitPlanResource.findFirst({
      where: {
        id: req.params.resourceId,
        unitPlan: {
          id: req.params.id,
          userId,
        },
      },
    });
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    await prisma.unitPlanResource.delete({
      where: { id: req.params.resourceId },
    });
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;