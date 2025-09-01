import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { getUserId } from '../utils/authHelpers';
import { validate } from '../validation';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

// Query schema for cascade data
const cascadeQuerySchema = z.object({
  academicYear: z.string().regex(/^\d{4}-\d{4}$/).optional(),
  subject: z.string().optional(),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  includeProgress: z.coerce.boolean().default(true),
  includeDaybook: z.coerce.boolean().default(false),
  depth: z.enum(['curriculum', 'lrp', 'units', 'lessons', 'full']).default('full'),
});

// Get planning cascade hierarchy
router.get(
  '/',
  validate(cascadeQuerySchema, 'query'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { academicYear, subject, grade, includeProgress, includeDaybook, depth } = req.query as z.infer<typeof cascadeQuerySchema>;

      logger.info('Fetching planning cascade', { userId, params: req.query });

      // Build where clause for filtering
      const whereClause: any = { userId };
      if (academicYear) whereClause.academicYear = academicYear;
      if (subject) whereClause.subject = subject;
      if (grade) whereClause.grade = grade;

      // Determine include depth based on requested depth
      const getIncludeConfig = (requestedDepth: string) => {
        const baseInclude = {
          expectations: {
            include: {
              expectation: true,
            },
          },
          _count: {
            select: {
              unitPlans: true,
              expectations: true,
            },
          },
        };

        if (requestedDepth === 'lrp') return baseInclude;

        const unitInclude = {
          ...baseInclude,
          unitPlans: {
            include: {
              expectations: {
                include: {
                  expectation: true,
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
            orderBy: { startDate: 'asc' as const },
          },
        };

        if (requestedDepth === 'units') return unitInclude;

        const lessonInclude = {
          ...baseInclude,
          unitPlans: {
            include: {
              expectations: {
                include: {
                  expectation: true,
                },
              },
              lessonPlans: {
                include: {
                  expectations: {
                    include: {
                      expectation: true,
                    },
                  },
                  _count: {
                    select: {
                      resources: true,
                      expectations: true,
                    },
                  },
                },
                orderBy: { date: 'asc' as const },
              },
              _count: {
                select: {
                  lessonPlans: true,
                  expectations: true,
                  resources: true,
                },
              },
            },
            orderBy: { startDate: 'asc' as const },
          },
        };

        if (requestedDepth === 'lessons') return lessonInclude;

        // Full depth includes daybook entries
        return {
          ...baseInclude,
          unitPlans: {
            include: {
              expectations: {
                include: {
                  expectation: true,
                },
              },
              lessonPlans: {
                include: {
                  expectations: {
                    include: {
                      expectation: true,
                    },
                  },
                  daybookEntry: includeDaybook ? true : false,
                  _count: {
                    select: {
                      resources: true,
                      expectations: true,
                    },
                  },
                },
                orderBy: { date: 'asc' as const },
              },
              _count: {
                select: {
                  lessonPlans: true,
                  expectations: true,
                  resources: true,
                },
              },
            },
            orderBy: { startDate: 'asc' as const },
          },
        };
      };

      // Fetch long range plans with hierarchical data
      const longRangePlans = await prisma.longRangePlan.findMany({
        where: whereClause,
        include: getIncludeConfig(depth),
        orderBy: [
          { academicYear: 'desc' },
          { subject: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      // Fetch curriculum expectations if requested
      let curriculumData = null;
      if (depth === 'curriculum' || depth === 'full') {
        const expectationWhere: any = {};
        if (subject) expectationWhere.subject = subject;
        if (grade) expectationWhere.grade = grade;

        const expectations = await prisma.curriculumExpectation.findMany({
          where: expectationWhere,
          include: {
            _count: {
              select: {
                lessonPlans: true,
                unitPlans: true,
                longRangePlans: true,
              },
            },
          },
          orderBy: [
            { subject: 'asc' },
            { strand: 'asc' },
            { code: 'asc' },
          ],
        });

        // Calculate coverage statistics
        const totalExpectations = expectations.length;
        const coveredExpectations = expectations.filter(
          exp => exp._count.lessonPlans > 0 || exp._count.unitPlans > 0
        ).length;

        curriculumData = {
          total: totalExpectations,
          covered: coveredExpectations,
          coveragePercentage: totalExpectations > 0 
            ? Math.round((coveredExpectations / totalExpectations) * 100) 
            : 0,
          expectations: expectations.map(exp => ({
            ...exp,
            coverage: {
              lessonCount: exp._count.lessonPlans,
              unitCount: exp._count.unitPlans,
              lrpCount: exp._count.longRangePlans,
            },
          })),
        };
      }

      // Calculate progress metrics if requested
      let progressMetrics = null;
      if (includeProgress) {
        const totalUnits = longRangePlans.reduce((sum, lrp) => sum + (lrp._count?.unitPlans || 0), 0);
        const totalLessons = longRangePlans.reduce((sum, lrp) => 
          sum + (lrp.unitPlans?.reduce((unitSum, unit) => 
            unitSum + (unit._count?.lessonPlans || 0), 0) || 0), 0);
        
        const completedLessons = longRangePlans.reduce((sum, lrp) => 
          sum + (lrp.unitPlans?.reduce((unitSum, unit) => 
            unitSum + (unit.lessonPlans?.filter(lesson => 
              lesson.daybookEntry !== null && lesson.daybookEntry !== undefined).length || 0), 0) || 0), 0);

        progressMetrics = {
          totalLongRangePlans: longRangePlans.length,
          totalUnits,
          totalLessons,
          completedLessons,
          completionPercentage: totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0,
        };
      }

      // Structure the cascade response
      const cascadeData = {
        curriculum: curriculumData,
        longRangePlans: longRangePlans.map(lrp => ({
          ...lrp,
          progress: includeProgress && lrp.unitPlans ? {
            totalUnits: lrp._count?.unitPlans || 0,
            totalLessons: lrp.unitPlans.reduce((sum, unit) => sum + (unit._count?.lessonPlans || 0), 0),
            completedLessons: lrp.unitPlans.reduce((sum, unit) => 
              sum + (unit.lessonPlans?.filter(lesson => 
                lesson.daybookEntry !== null && lesson.daybookEntry !== undefined).length || 0), 0),
          } : undefined,
        })),
        metrics: progressMetrics,
      };

      res.json(cascadeData);
    } catch (error) {
      logger.error('Error fetching planning cascade:', error);
      res.status(500).json({ 
        error: 'Failed to fetch planning cascade',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get cascade summary (lightweight version)
router.get(
  '/summary',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);

      const summary = await prisma.$transaction([
        // Count curriculum expectations by subject
        prisma.curriculumExpectation.groupBy({
          by: ['subject'],
          _count: {
            id: true,
          },
        }),
        // Count long range plans
        prisma.longRangePlan.count({
          where: { userId },
        }),
        // Count unit plans
        prisma.unitPlan.count({
          where: { userId },
        }),
        // Count lesson plans
        prisma.eTFOLessonPlan.count({
          where: { userId },
        }),
        // Count daybook entries
        prisma.daybookEntry.count({
          where: { userId },
        }),
      ]);

      const [expectations, lrpCount, unitCount, lessonCount, daybookCount] = summary;

      res.json({
        curriculum: {
          bySubject: expectations.reduce((acc, exp) => {
            acc[exp.subject] = exp._count.id;
            return acc;
          }, {} as Record<string, number>),
          total: expectations.reduce((sum, exp) => sum + exp._count.id, 0),
        },
        planning: {
          longRangePlans: lrpCount,
          unitPlans: unitCount,
          lessonPlans: lessonCount,
          daybookEntries: daybookCount,
          completionRate: lessonCount > 0 ? Math.round((daybookCount / lessonCount) * 100) : 0,
        },
      });
    } catch (error) {
      logger.error('Error fetching cascade summary:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cascade summary',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export { router };