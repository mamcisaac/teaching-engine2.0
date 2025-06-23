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
const daybookEntryCreateSchema = z.object({
  date: z.string().datetime(),
  lessonPlanId: z.string().optional(),
  whatWorked: z.string().optional(),
  whatWorkedFr: z.string().optional(),
  whatDidntWork: z.string().optional(),
  whatDidntWorkFr: z.string().optional(),
  nextSteps: z.string().optional(),
  nextStepsFr: z.string().optional(),
  studentEngagement: z.string().optional(),
  studentChallenges: z.string().optional(),
  studentSuccesses: z.string().optional(),
  notes: z.string().optional(),
  notesFr: z.string().optional(),
  privateNotes: z.string().optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  wouldReuseLesson: z.boolean().optional(),
  expectationCoverage: z.array(z.object({
    expectationId: z.string(),
    coverage: z.enum(['introduced', 'developing', 'consolidated']),
  })).optional(),
});

const daybookEntryUpdateSchema = daybookEntryCreateSchema.partial();

// Get all daybook entries for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { startDate, endDate, hasLessonPlan, rating } = req.query;
    
    const where: Prisma.DaybookEntryWhereInput = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }
    
    if (hasLessonPlan !== undefined) {
      where.lessonPlanId = hasLessonPlan === 'true' ? { not: null } : null;
    }
    
    if (rating) {
      where.overallRating = Number(rating);
    }
    
    const entries = await prisma.daybookEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true,
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
          },
        },
        _count: {
          select: { expectations: true },
        },
      },
    });
    
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// Get a single daybook entry
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const entry = await prisma.daybookEntry.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        lessonPlan: {
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
          },
        },
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Daybook entry not found' });
    }
    
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// Create a new daybook entry
router.post('/', validate(daybookEntryCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationCoverage, ...entryData } = req.body;
    
    // If linking to a lesson plan, verify ownership and no existing entry
    if (entryData.lessonPlanId) {
      const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
        where: {
          id: entryData.lessonPlanId,
          userId,
        },
        include: {
          daybookEntry: true,
        },
      });
      
      if (!lessonPlan) {
        return res.status(404).json({ error: 'Lesson plan not found' });
      }
      
      if (lessonPlan.daybookEntry) {
        return res.status(400).json({ 
          error: 'Lesson plan already has a daybook entry' 
        });
      }
    }
    
    const entry = await prisma.daybookEntry.create({
      data: {
        ...entryData,
        userId,
        date: new Date(entryData.date),
      },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true,
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
          },
        },
        _count: {
          select: { expectations: true },
        },
      },
    });
    
    // Add expectation coverage if provided
    if (expectationCoverage && expectationCoverage.length > 0) {
      await prisma.daybookEntryExpectation.createMany({
        data: expectationCoverage.map((ec: any) => ({
          daybookEntryId: entry.id,
          expectationId: ec.expectationId,
          coverage: ec.coverage,
        })),
        skipDuplicates: true,
      });
      
      // Refetch with expectations
      const updatedEntry = await prisma.daybookEntry.findUnique({
        where: { id: entry.id },
        include: {
          lessonPlan: {
            select: {
              id: true,
              title: true,
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
            },
          },
          expectations: {
            include: { expectation: true },
          },
        },
      });
      
      return res.status(201).json(updatedEntry);
    }
    
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// Update a daybook entry
router.put('/:id', validate(daybookEntryUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationCoverage, ...updateData } = req.body;
    
    // Verify ownership
    const existing = await prisma.daybookEntry.findFirst({
      where: { id: req.params.id, userId },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Daybook entry not found' });
    }
    
    // Prepare update data
    const data: any = { ...updateData };
    if (updateData.date) data.date = new Date(updateData.date);
    
    // Update the entry
    const entry = await prisma.daybookEntry.update({
      where: { id: req.params.id },
      data,
    });
    
    // Update expectation coverage if provided
    if (expectationCoverage !== undefined) {
      // Remove existing coverage
      await prisma.daybookEntryExpectation.deleteMany({
        where: { daybookEntryId: entry.id },
      });
      
      // Add new coverage
      if (expectationCoverage.length > 0) {
        await prisma.daybookEntryExpectation.createMany({
          data: expectationCoverage.map((ec: any) => ({
            daybookEntryId: entry.id,
            expectationId: ec.expectationId,
            coverage: ec.coverage,
          })),
          skipDuplicates: true,
        });
      }
    }
    
    // Refetch with updated relationships
    const updatedEntry = await prisma.daybookEntry.findUnique({
      where: { id: entry.id },
      include: {
        lessonPlan: {
          include: {
            unitPlan: {
              include: {
                longRangePlan: true,
              },
            },
          },
        },
        expectations: {
          include: { expectation: true },
        },
      },
    });
    
    res.json(updatedEntry);
  } catch (err) {
    next(err);
  }
});

// Delete a daybook entry
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify ownership
    const entry = await prisma.daybookEntry.findFirst({
      where: { id: req.params.id, userId },
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Daybook entry not found' });
    }
    
    await prisma.daybookEntry.delete({
      where: { id: req.params.id },
    });
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Get daybook insights and patterns
router.get('/insights/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { startDate, endDate, subject } = req.query;
    
    const where: Prisma.DaybookEntryWhereInput = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }
    
    if (subject) {
      where.lessonPlan = {
        unitPlan: {
          longRangePlan: {
            subject: String(subject),
          },
        },
      };
    }
    
    // Get all entries for the period
    const entries = await prisma.daybookEntry.findMany({
      where,
      select: {
        id: true,
        date: true,
        overallRating: true,
        wouldReuseLesson: true,
        whatWorked: true,
        whatDidntWork: true,
        studentEngagement: true,
        studentChallenges: true,
        lessonPlan: {
          select: {
            unitPlan: {
              select: {
                longRangePlan: {
                  select: { subject: true },
                },
              },
            },
          },
        },
      },
    });
    
    // Calculate insights
    const totalEntries = entries.length;
    const entriesWithRating = entries.filter(e => e.overallRating !== null);
    const avgRating = entriesWithRating.length > 0
      ? entriesWithRating.reduce((sum, e) => sum + (e.overallRating || 0), 0) / entriesWithRating.length
      : null;
    
    const reuseStats = entries.filter(e => e.wouldReuseLesson !== null);
    const reusePercentage = reuseStats.length > 0
      ? Math.round((reuseStats.filter(e => e.wouldReuseLesson).length / reuseStats.length) * 100)
      : null;
    
    // Common themes (would need NLP for real implementation)
    const insights = {
      period: {
        start: startDate || 'all time',
        end: endDate || 'present',
      },
      summary: {
        totalEntries,
        averageRating: avgRating ? Number(avgRating.toFixed(2)) : null,
        reusePercentage,
        entriesWithReflections: entries.filter(e => 
          e.whatWorked || e.whatDidntWork || e.studentEngagement || e.studentChallenges
        ).length,
      },
      trends: {
        ratingTrend: 'stable', // TODO: Calculate actual trend
        engagementTrend: 'improving', // TODO: Analyze text for patterns
      },
      commonThemes: {
        successes: ['Student engagement high', 'Group work effective'], // TODO: Extract from text
        challenges: ['Time management', 'Differentiation needed'], // TODO: Extract from text
        improvements: ['More hands-on activities', 'Better pacing'], // TODO: Extract from text
      },
      recommendations: [
        'Consider incorporating more group activities based on positive feedback',
        'Plan for additional time buffers in complex lessons',
        'Document successful strategies for future reference',
      ],
    };
    
    res.json(insights);
  } catch (err) {
    next(err);
  }
});

export default router;