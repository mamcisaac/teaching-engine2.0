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
const lessonPlanCreateSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().optional(),
  unitPlanId: z.string().min(1),
  date: z.string().datetime(),
  duration: z.number().int().positive(),
  mindsOn: z.string().optional(),
  mindsOnFr: z.string().optional(),
  action: z.string().optional(),
  actionFr: z.string().optional(),
  consolidation: z.string().optional(),
  consolidationFr: z.string().optional(),
  learningGoals: z.string().optional(),
  learningGoalsFr: z.string().optional(),
  materials: z.array(z.string()).optional(),
  grouping: z.string().optional(),
  accommodations: z.array(z.string()).optional(),
  modifications: z.array(z.string()).optional(),
  extensions: z.array(z.string()).optional(),
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']).optional(),
  assessmentNotes: z.string().optional(),
  isSubFriendly: z.boolean().optional(),
  subNotes: z.string().optional(),
  expectationIds: z.array(z.string()).optional(),
});

const lessonPlanUpdateSchema = lessonPlanCreateSchema.partial().omit({ unitPlanId: true });

// Get all lesson plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { unitPlanId, startDate, endDate, isSubFriendly } = req.query;

    const where: Prisma.ETFOLessonPlanWhereInput = { userId };
    if (unitPlanId) where.unitPlanId = String(unitPlanId);
    if (isSubFriendly !== undefined) where.isSubFriendly = isSubFriendly === 'true';
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        unitPlan: {
          select: {
            id: true,
            title: true,
            longRangePlan: {
              select: {
                subject: true,
                grade: true,
              },
            },
          },
        },
        daybookEntry: {
          select: {
            id: true,
            overallRating: true,
            wouldReuseLesson: true,
          },
        },
        _count: {
          select: {
            expectations: true,
            resources: true,
          },
        },
      },
    });

    res.json(lessonPlans);
  } catch (err) {
    _next(err);
  }
});

// Get a single lesson plan
router.get('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true,
          },
        },
        expectations: {
          include: {
            expectation: true,
          },
          orderBy: {
            expectation: { code: 'asc' },
          },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        daybookEntry: true,
      },
    });

    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    res.json(lessonPlan);
  } catch (err) {
    _next(err);
  }
});

// Create a new lesson plan
router.post(
  '/',
  validate(lessonPlanCreateSchema),
  async (req: AuthenticatedRequest, res, _next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { expectationIds, materials, accommodations, modifications, extensions, ...planData } =
        req.body;

      // Verify user owns the unit plan
      const unitPlan = await prisma.unitPlan.findFirst({
        where: {
          id: planData.unitPlanId,
          userId,
        },
      });

      if (!unitPlan) {
        return res.status(404).json({ error: 'Unit plan not found' });
      }

      const lessonPlan = await prisma.eTFOLessonPlan.create({
        data: {
          ...planData,
          userId,
          date: new Date(planData.date),
          materials: materials || [],
          accommodations: accommodations || [],
          modifications: modifications || [],
          extensions: extensions || [],
        },
        include: {
          unitPlan: {
            select: {
              id: true,
              title: true,
              longRangePlan: {
                select: {
                  subject: true,
                  grade: true,
                },
              },
            },
          },
          _count: {
            select: {
              expectations: true,
              resources: true,
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
            found: validExpectations.map((e) => e.id),
          });
        }

        await prisma.eTFOLessonPlanExpectation.createMany({
          data: expectationIds.map((expectationId: string) => ({
            lessonPlanId: lessonPlan.id,
            expectationId,
          })),
        });

        // Refetch with expectations
        const updatedPlan = await prisma.eTFOLessonPlan.findUnique({
          where: { id: lessonPlan.id },
          include: {
            unitPlan: {
              select: {
                id: true,
                title: true,
                longRangePlan: {
                  select: {
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
            expectations: {
              include: { expectation: true },
            },
            _count: {
              select: { resources: true },
            },
          },
        });

        return res.status(201).json(updatedPlan);
      }

      res.status(201).json(lessonPlan);
    } catch (err) {
      _next(err);
    }
  },
);

// Update a lesson plan
router.put(
  '/:id',
  validate(lessonPlanUpdateSchema),
  async (req: AuthenticatedRequest, res, _next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        expectationIds,
        materials,
        accommodations,
        modifications,
        extensions,
        ...updateData
      } = req.body;

      // Verify ownership
      const existing = await prisma.eTFOLessonPlan.findFirst({
        where: { id: req.params.id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Lesson plan not found' });
      }

      // Prepare update data
      const data: Prisma.ETFOLessonPlanUpdateInput = { ...updateData };
      if (updateData.date) data.date = new Date(updateData.date);
      if (materials !== undefined) data.materials = materials;
      if (accommodations !== undefined) data.accommodations = accommodations;
      if (modifications !== undefined) data.modifications = modifications;
      if (extensions !== undefined) data.extensions = extensions;

      // Update the plan
      const lessonPlan = await prisma.eTFOLessonPlan.update({
        where: { id: req.params.id },
        data,
      });

      // Update expectations if provided
      if (expectationIds !== undefined) {
        // Remove existing expectations
        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlanId: lessonPlan.id },
        });

        // Add new expectations
        if (expectationIds.length > 0) {
          await prisma.eTFOLessonPlanExpectation.createMany({
            data: expectationIds.map((expectationId: string) => ({
              lessonPlanId: lessonPlan.id,
              expectationId,
            })),
          });
        }
      }

      // Refetch with updated relationships
      const updatedPlan = await prisma.eTFOLessonPlan.findUnique({
        where: { id: lessonPlan.id },
        include: {
          unitPlan: {
            include: {
              longRangePlan: true,
            },
          },
          expectations: {
            include: { expectation: true },
          },
          resources: true,
          daybookEntry: true,
        },
      });

      res.json(updatedPlan);
    } catch (err) {
      _next(err);
    }
  },
);

// Delete a lesson plan
router.delete('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership and check for dependencies
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        daybookEntry: true,
      },
    });

    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    if (lessonPlan.daybookEntry) {
      return res.status(400).json({
        error: 'Cannot delete lesson plan with existing daybook entry',
      });
    }

    await prisma.eTFOLessonPlan.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    _next(err);
  }
});

// Add a resource to lesson plan
router.post('/:id/resources', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, type, url, content } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    // Verify ownership
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    const resource = await prisma.eTFOLessonPlanResource.create({
      data: {
        lessonPlanId: req.params.id,
        title,
        type,
        url,
        content,
      },
    });

    res.status(201).json(resource);
  } catch (err) {
    _next(err);
  }
});

// Delete a resource
router.delete('/:id/resources/:resourceId', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership through lesson plan
    const resource = await prisma.eTFOLessonPlanResource.findFirst({
      where: {
        id: req.params.resourceId,
        lessonPlan: {
          id: req.params.id,
          userId,
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.eTFOLessonPlanResource.delete({
      where: { id: req.params.resourceId },
    });

    res.status(204).end();
  } catch (err) {
    _next(err);
  }
});

// Generate substitute-friendly version
router.post('/:id/sub-version', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        unitPlan: {
          include: { longRangePlan: true },
        },
        expectations: { include: { expectation: true } },
        resources: true,
      },
    });

    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Generate substitute-friendly version of the lesson plan
    const subVersion = {
      title: lessonPlan.title,
      date: lessonPlan.date,
      duration: lessonPlan.duration,
      subject: lessonPlan.unitPlan.longRangePlan.subject,
      grade: lessonPlan.unitPlan.longRangePlan.grade,
      materials: lessonPlan.materials,
      grouping: lessonPlan.grouping || 'Whole class',
      activities: {
        opening: lessonPlan.mindsOn || 'See detailed plan',
        main: lessonPlan.action || 'See detailed plan',
        closing: lessonPlan.consolidation || 'See detailed plan',
      },
      specialNotes: lessonPlan.subNotes,
      resources: lessonPlan.resources.filter((r) => r.type !== 'teacher-only'),
    };

    res.json(subVersion);
  } catch (err) {
    _next(err);
  }
});

export default router;
