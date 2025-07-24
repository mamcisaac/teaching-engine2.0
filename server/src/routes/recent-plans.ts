import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
const router = Router();

// Track plan access
router.post('/track', async (req: Request, res, _next) => {
  try {
    const userId = req.user.id ?? 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate request body
    const bodySchema = z.object({
      planType: z.string(),
      planId: z.string()
    });
    const { planType, planId } = bodySchema.parse(req.body);

    if (!planType || !planId) {
      res.status(400).json({ error: 'Plan type and ID are required' });
      return;
    }

    // Upsert recent plan access
    await prisma.recentPlanAccess.upsert({
      where: {
        userId_planType_planId: {
          userId,
          planType,
          planId,
        },
      },
      update: {
        lastAccessed: new Date(),
        accessCount: { increment: 1 },
      },
      create: {
        userId,
        planType,
        planId,
        lastAccessed: new Date(),
        accessCount: 1,
      },
    });

    res.json({ success: true });
    return;
  } catch (err) {
    logger.error('Error in recent plans route:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Get recent plans for user
router.get('/', async (req: Request, res, _next) => {
  try {
    const userId = req.user.id ?? 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;

    const recentAccesses = await prisma.recentPlanAccess.findMany({
      where: { userId },
      orderBy: { lastAccessed: 'desc' },
      take: limit,
    });

    // Fetch plan details for each recent access
    const recentPlans = await Promise.all(
      recentAccesses.map(async (access: { planType: string; planId: string; lastAccessed: Date }) => {
        let plan = null;
        let parentInfo = null;

        switch (access.planType) {
          case 'long-range':
            plan = await prisma.longRangePlan.findUnique({
              where: { id: access.planId },
              select: {
                id: true,
                title: true,
                subject: true,
                grade: true,
                academicYear: true,
                _count: {
                  select: { unitPlans: true },
                },
              },
            });
            break;

          case 'unit':
            plan = await prisma.unitPlan.findUnique({
              where: { id: access.planId },
              select: {
                id: true,
                title: true,
                longRangePlan: {
                  select: {
                    id: true,
                    title: true,
                    subject: true,
                    grade: true,
                  },
                },
                _count: {
                  select: { lessonPlans: true },
                },
              },
            });
            if (plan && 'longRangePlan' in plan) {
              parentInfo = plan.longRangePlan;
            }
            break;

          case 'lesson':
            plan = await prisma.eTFOLessonPlan.findUnique({
              where: { id: access.planId },
              select: {
                id: true,
                title: true,
                date: true,
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
                  select: { id: true },
                },
              },
            });
            if (plan && 'unitPlan' in plan) {
              parentInfo = plan.unitPlan;
            }
            break;

          case 'daybook':
            plan = await prisma.daybookEntry.findUnique({
              where: { id: access.planId },
              select: {
                id: true,
                date: true,
                lessonPlan: {
                  select: {
                    id: true,
                    title: true,
                    unitPlan: {
                      select: {
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
              },
            });
            if (plan && 'lessonPlan' in plan && plan.lessonPlan) {
              parentInfo = plan.lessonPlan.unitPlan;
            }
            break;
        }

        if (!plan) {
return null;
}

        // Calculate progress based on plan type
        let progress = undefined;
        let status = 'in-progress';

        if (access.planType === 'long-range' && '_count' in plan && 'unitPlans' in plan._count) {
          // For simplicity, assume progress based on unit count
          progress = Math.min(plan._count.unitPlans * 10, 100);
        } else if (access.planType === 'unit' && '_count' in plan && 'lessonPlans' in plan._count) {
          progress = Math.min(plan._count.lessonPlans * 5, 100);
        } else if (access.planType === 'lesson' && 'daybookEntry' in plan) {
          status = plan.daybookEntry ? 'completed' : 'in-progress';
        }

        return {
          id: plan.id,
          type: access.planType,
          title:
            'title' in plan ? plan.title : `Daybook - ${new Date(plan.date).toLocaleDateString()}`,
          subject: (parentInfo && 'longRangePlan' in parentInfo) ? parentInfo.longRangePlan.subject : 
                   (parentInfo && 'subject' in parentInfo) ? parentInfo.subject : undefined,
          grade: (parentInfo && 'longRangePlan' in parentInfo) ? parentInfo.longRangePlan.grade : 
                 (parentInfo && 'grade' in parentInfo) ? parentInfo.grade : undefined,
          lastAccessed: access.lastAccessed.toISOString(),
          progress,
          status,
          parentTitle: parentInfo?.title,
        };
      }),
    );

    // Filter out null values (deleted plans)
    const validPlans = recentPlans.filter(Boolean);

    res.json(validPlans);
    return;
  } catch (err) {
    logger.error('Error in recent plans route:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Clear recent plans history
router.delete('/clear', async (req: Request, res, _next) => {
  try {
    const userId = req.user.id ?? 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.recentPlanAccess.deleteMany({
      where: { userId },
    });

    res.json({ success: true });
    return;
  } catch (err) {
    logger.error('Error in recent plans route:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export { router };
