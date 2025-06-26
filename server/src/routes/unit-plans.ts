import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate, cuidSchema } from '../validation';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Enhanced validation schemas with security measures
const unitPlanCreateSchema = z.object({
  title: z.string().min(1).max(255).regex(/^[^<>]*$/, 'Title cannot contain HTML tags'),
  titleFr: z.string().max(255).regex(/^[^<>]*$/, 'French title cannot contain HTML tags').optional(),
  longRangePlanId: cuidSchema(),
  description: z.string().max(2000).optional(),
  descriptionFr: z.string().max(2000).optional(),
  bigIdeas: z.string().max(2000).optional(),
  bigIdeasFr: z.string().max(2000).optional(),
  essentialQuestions: z.array(z.string().max(500)).max(20).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  estimatedHours: z.number().int().positive().max(1000).optional(),
  assessmentPlan: z.string().max(2000).optional(),
  successCriteria: z.array(z.string().max(500)).max(20).optional(),
  expectationIds: z.array(cuidSchema()).max(50).min(1, 'At least one curriculum expectation must be selected'),

  // ETFO-aligned planning fields with validation
  crossCurricularConnections: z.string().max(1000).optional(),
  learningSkills: z.array(z.string().max(100)).max(10).optional(),
  culminatingTask: z.string().max(1000).optional(),
  keyVocabulary: z.array(z.string().max(100)).max(30).optional(),
  priorKnowledge: z.string().max(1000).optional(),
  parentCommunicationPlan: z.string().max(1000).optional(),
  fieldTripsAndGuestSpeakers: z.string().max(1000).optional(),
  differentiationStrategies: z
    .object({
      forStruggling: z.array(z.string().max(200)).max(10).optional(),
      forAdvanced: z.array(z.string().max(200)).max(10).optional(),
      forELL: z.array(z.string().max(200)).max(10).optional(),
      forIEP: z.array(z.string().max(200)).max(10).optional(),
    })
    .optional(),
  indigenousPerspectives: z.string().max(1000).optional(),
  environmentalEducation: z.string().max(1000).optional(),
  socialJusticeConnections: z.string().max(1000).optional(),
  technologyIntegration: z.string().max(1000).optional(),
  communityConnections: z.string().max(1000).optional(),
});

const unitPlanUpdateSchema = unitPlanCreateSchema.partial().omit({ longRangePlanId: true });

// Get all unit plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, _next) => {
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
    _next(err);
  }
});

// Get a single unit plan
router.get('/:id', async (req: AuthenticatedRequest, res, _next) => {
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
    const completedLessons = unitPlan.lessonPlans.filter((lp) => lp.daybookEntry).length;
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
    _next(err);
  }
});

// Create a new unit plan
router.post('/', validate(unitPlanCreateSchema), async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      expectationIds,
      essentialQuestions,
      successCriteria,
      learningSkills,
      keyVocabulary,
      differentiationStrategies,
      ...planData
    } = req.body;

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

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Create the unit plan
      const unitPlan = await tx.unitPlan.create({
        data: {
          ...planData,
          userId,
          startDate: new Date(planData.startDate),
          endDate: new Date(planData.endDate),
          essentialQuestions: essentialQuestions || [],
          successCriteria: successCriteria || [],
          learningSkills: learningSkills || [],
          keyVocabulary: keyVocabulary || [],
          differentiationStrategies: differentiationStrategies || null,
        },
      });

      // Link curriculum expectations if provided
      if (expectationIds && expectationIds.length > 0) {
        // Validate expectation IDs exist
        const validExpectations = await tx.curriculumExpectation.findMany({
          where: { id: { in: expectationIds } },
          select: { id: true },
        });

        if (validExpectations.length !== expectationIds.length) {
          throw new Error('One or more curriculum expectations not found');
        }

        await tx.unitPlanExpectation.createMany({
          data: expectationIds.map((expectationId: string) => ({
            unitPlanId: unitPlan.id,
            expectationId,
          })),
        });
      }

      // Return the created unit plan with relations
      return await tx.unitPlan.findUnique({
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
          _count: {
            select: {
              lessonPlans: true,
              expectations: true,
            },
          },
        },
      });
    });

    res.status(201).json(result);
  } catch (err) {
    _next(err);
  }
});

// Update a unit plan
router.put(
  '/:id',
  validate(unitPlanUpdateSchema),
  async (req: AuthenticatedRequest, res, _next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        expectationIds,
        essentialQuestions,
        successCriteria,
        learningSkills,
        keyVocabulary,
        differentiationStrategies,
        ...updateData
      } = req.body;

      // Verify ownership
      const existing = await prisma.unitPlan.findFirst({
        where: { id: req.params.id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Unit plan not found' });
      }

      // Prepare update data
      const data: Prisma.UnitPlanUpdateInput = { ...updateData };
      if (updateData.startDate) data.startDate = new Date(updateData.startDate);
      if (updateData.endDate) data.endDate = new Date(updateData.endDate);
      if (essentialQuestions !== undefined) data.essentialQuestions = essentialQuestions;
      if (successCriteria !== undefined) data.successCriteria = successCriteria;
      if (learningSkills !== undefined) data.learningSkills = learningSkills;
      if (keyVocabulary !== undefined) data.keyVocabulary = keyVocabulary;
      if (differentiationStrategies !== undefined)
        data.differentiationStrategies = differentiationStrategies;

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
      _next(err);
    }
  },
);

// Delete a unit plan
router.delete('/:id', async (req: AuthenticatedRequest, res, _next) => {
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
        error: 'Cannot delete unit plan with existing lesson plans',
      });
    }

    await prisma.unitPlan.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    _next(err);
  }
});

// Add a resource to unit plan
router.post('/:id/resources', async (req: AuthenticatedRequest, res, _next) => {
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
        title: String(title),
        type: String(type),
        url: url ? String(url) : null,
        notes: notes ? String(notes) : null,
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
    _next(err);
  }
});

// Duplicate a unit plan
router.post('/duplicate', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sourceId, title, notes: _notes, includeSubItems } = req.body;

    if (!sourceId || !title) {
      return res.status(400).json({ error: 'Source ID and title are required' });
    }

    // Fetch the source unit plan with all relations
    const sourceUnit = await prisma.unitPlan.findFirst({
      where: { id: sourceId, userId },
      include: {
        expectations: true,
        resources: true,
        lessonPlans: includeSubItems ? {
          include: {
            expectations: true,
            resources: true,
          },
        } : false,
      },
    });

    if (!sourceUnit) {
      return res.status(404).json({ error: 'Source unit plan not found' });
    }

    // Create the duplicate in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate new dates (shift to current period)
      const originalDuration = sourceUnit.endDate.getTime() - sourceUnit.startDate.getTime();
      const newStartDate = new Date();
      const newEndDate = new Date(newStartDate.getTime() + originalDuration);

      // Create the duplicate unit plan
      const { id: _, userId: __, createdAt: _createdAt, updatedAt: _updatedAt, lessonPlans, expectations, resources, ...unitData } = sourceUnit;
      
      const newUnit = await tx.unitPlan.create({
        data: {
          ...unitData,
          userId,
          title,
          startDate: newStartDate,
          endDate: newEndDate,
        },
      });

      // Copy expectations
      if (expectations.length > 0) {
        await tx.unitPlanExpectation.createMany({
          data: expectations.map(exp => ({
            unitPlanId: newUnit.id,
            expectationId: exp.expectationId,
          })),
        });
      }

      // Copy resources
      if (resources.length > 0) {
        await tx.unitPlanResource.createMany({
          data: resources.map(({ id: _id, unitPlanId: _unitPlanId, createdAt: _createdAt, ...resource }) => ({
            ...resource,
            unitPlanId: newUnit.id,
          })),
        });
      }

      // Copy lesson plans if requested
      if (includeSubItems && lessonPlans && lessonPlans.length > 0) {
        for (const lesson of lessonPlans) {
          const { id: _, unitPlanId: __, userId: ___, createdAt: _createdAt, updatedAt: _updatedAt, ...lessonData } = lesson;
          const lessonExp = (lesson as { expectations?: Array<{ expectationId: string }> }).expectations || [];
          const lessonRes = (lesson as { resources?: Array<{ id: string; lessonPlanId: string; createdAt: Date; [key: string]: unknown }> }).resources || [];
          
          // Calculate new lesson date based on relative position
          const originalOffset = lesson.date.getTime() - sourceUnit.startDate.getTime();
          const newLessonDate = new Date(newStartDate.getTime() + originalOffset);

          const newLesson = await tx.eTFOLessonPlan.create({
            data: {
              ...lessonData,
              userId,
              unitPlanId: newUnit.id,
              date: newLessonDate,
              title: `${lesson.title} (Copy)`,
            },
          });

          // Copy lesson expectations
          if (lessonExp.length > 0) {
            await tx.eTFOLessonPlanExpectation.createMany({
              data: lessonExp.map(exp => ({
                lessonPlanId: newLesson.id,
                expectationId: exp.expectationId,
              })),
            });
          }

          // Copy lesson resources
          if (lessonRes.length > 0) {
            await tx.eTFOLessonPlanResource.createMany({
              data: lessonRes.map(({ id: _id, lessonPlanId: _lessonPlanId, createdAt: _createdAt, ...resource }) => ({
                ...resource,
                lessonPlanId: newLesson.id,
              })) as Prisma.ETFOLessonPlanResourceCreateManyInput[],
            });
          }
        }
      }

      return newUnit;
    });

    res.status(201).json(result);
  } catch (err) {
    _next(err);
  }
});

export default router;
