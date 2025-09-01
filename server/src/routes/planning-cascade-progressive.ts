import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { getUserId } from '../utils/authHelpers';
import { validate } from '../validation';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

// Schema for node children request
const nodeChildrenSchema = z.object({
  nodeType: z.enum(['root', 'curriculum', 'lrp', 'unit', 'lesson']),
  parentId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  includeProgress: z.coerce.boolean().default(true),
});

// Get root level nodes
router.get(
  '/roots',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { academicYear, subject, grade } = req.query;

      logger.info('Fetching cascade roots', { userId, params: req.query });

      // Build where clause
      const whereClause: any = { userId };
      if (academicYear) whereClause.academicYear = academicYear as string;
      if (subject) whereClause.subject = subject as string;
      if (grade) whereClause.grade = Number(grade);

      // Fetch root level data (LRPs and curriculum summary)
      const [longRangePlans, curriculumStats] = await Promise.all([
        prisma.longRangePlan.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            titleFr: true,
            academicYear: true,
            subject: true,
            grade: true,
            _count: {
              select: {
                unitPlans: true,
                expectations: true,
              },
            },
          },
          orderBy: [
            { academicYear: 'desc' },
            { subject: 'asc' },
            { title: 'asc' },
          ],
          take: 20,
        }),
        prisma.curriculumExpectation.groupBy({
          by: ['subject'],
          where: {
            subject: subject as string | undefined,
            grade: grade ? Number(grade) : undefined,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      const response = {
        longRangePlans: longRangePlans.map(lrp => ({
          id: lrp.id,
          label: lrp.title,
          type: 'lrp',
          hasChildren: lrp._count.unitPlans > 0,
          childrenCount: lrp._count.unitPlans,
          data: lrp,
        })),
        curriculumSummary: {
          total: curriculumStats.reduce((sum, stat) => sum + stat._count.id, 0),
          bySubject: curriculumStats.reduce((acc, stat) => {
            acc[stat.subject] = stat._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Error fetching cascade roots:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cascade roots',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get children for a specific node
router.get(
  '/node/:nodeId/children',
  validate(nodeChildrenSchema, 'query'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { nodeId } = req.params;
      const { nodeType, limit, offset, includeProgress } = req.query as z.infer<typeof nodeChildrenSchema>;

      logger.info('Fetching node children', { userId, nodeId, nodeType });

      let children: any[] = [];
      let totalCount = 0;

      switch (nodeType) {
        case 'lrp':
          // Fetch unit plans for this LRP
          const [units, unitCount] = await Promise.all([
            prisma.unitPlan.findMany({
              where: {
                longRangePlanId: nodeId,
                userId,
              },
              select: {
                id: true,
                title: true,
                titleFr: true,
                startDate: true,
                endDate: true,
                estimatedHours: true,
                _count: {
                  select: {
                    lessonPlans: true,
                    expectations: true,
                  },
                },
              },
              orderBy: { startDate: 'asc' },
              take: limit,
              skip: offset,
            }),
            prisma.unitPlan.count({
              where: {
                longRangePlanId: nodeId,
                userId,
              },
            }),
          ]);

          children = units.map(unit => ({
            id: unit.id,
            label: unit.title,
            type: 'unit',
            hasChildren: unit._count.lessonPlans > 0,
            childrenCount: unit._count.lessonPlans,
            data: unit,
            progress: includeProgress ? {
              total: unit._count.lessonPlans,
              completed: 0, // Would need to query daybook entries
            } : undefined,
          }));
          totalCount = unitCount;
          break;

        case 'unit':
          // Fetch lesson plans for this unit
          const [lessons, lessonCount] = await Promise.all([
            prisma.eTFOLessonPlan.findMany({
              where: {
                unitPlanId: nodeId,
                userId,
              },
              select: {
                id: true,
                title: true,
                titleFr: true,
                date: true,
                duration: true,
                daybookEntry: {
                  select: {
                    id: true,
                    overallRating: true,
                  },
                },
                _count: {
                  select: {
                    expectations: true,
                    resources: true,
                  },
                },
              },
              orderBy: { date: 'asc' },
              take: limit,
              skip: offset,
            }),
            prisma.eTFOLessonPlan.count({
              where: {
                unitPlanId: nodeId,
                userId,
              },
            }),
          ]);

          children = lessons.map(lesson => ({
            id: lesson.id,
            label: lesson.title,
            type: 'lesson',
            hasChildren: false,
            isCompleted: !!lesson.daybookEntry,
            data: lesson,
          }));
          totalCount = lessonCount;
          break;

        case 'curriculum':
          // Fetch curriculum expectations
          const [expectations, expectationCount] = await Promise.all([
            prisma.curriculumExpectation.findMany({
              where: {
                subject: req.query.subject as string | undefined,
                grade: req.query.grade ? Number(req.query.grade) : undefined,
              },
              select: {
                id: true,
                code: true,
                description: true,
                strand: true,
                substrand: true,
                _count: {
                  select: {
                    lessonPlans: true,
                    unitPlans: true,
                  },
                },
              },
              orderBy: [
                { strand: 'asc' },
                { code: 'asc' },
              ],
              take: limit,
              skip: offset,
            }),
            prisma.curriculumExpectation.count({
              where: {
                subject: req.query.subject as string | undefined,
                grade: req.query.grade ? Number(req.query.grade) : undefined,
              },
            }),
          ]);

          children = expectations.map(exp => ({
            id: exp.id,
            label: `${exp.code}: ${exp.description}`,
            type: 'curriculum',
            hasChildren: false,
            data: exp,
            coverage: {
              lessons: exp._count.lessonPlans,
              units: exp._count.unitPlans,
            },
          }));
          totalCount = expectationCount;
          break;
      }

      res.json({
        children,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      });
    } catch (error) {
      logger.error('Error fetching node children:', error);
      res.status(500).json({ 
        error: 'Failed to fetch node children',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Search across all nodes
router.get(
  '/search',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { q, limit = 20 } = req.query;

      if (!q || typeof q !== 'string' || q.length < 2) {
        res.status(400).json({ error: 'Query must be at least 2 characters' });
        return;
      }

      logger.info('Searching cascade', { userId, query: q });

      // Search across all entities
      const [lrps, units, lessons, expectations] = await Promise.all([
        // Search Long Range Plans
        prisma.longRangePlan.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { titleFr: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { goals: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            title: true,
            description: true,
            subject: true,
          },
          take: Number(limit) / 4,
        }),
        
        // Search Unit Plans
        prisma.unitPlan.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { titleFr: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { bigIdeas: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            title: true,
            description: true,
          },
          take: Number(limit) / 4,
        }),
        
        // Search Lesson Plans
        prisma.eTFOLessonPlan.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { titleFr: { contains: q, mode: 'insensitive' } },
              { learningGoals: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            title: true,
            learningGoals: true,
            date: true,
          },
          take: Number(limit) / 4,
        }),
        
        // Search Curriculum Expectations
        prisma.curriculumExpectation.findMany({
          where: {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { descriptionFr: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            code: true,
            description: true,
            subject: true,
          },
          take: Number(limit) / 4,
        }),
      ]);

      // Format results
      const results = [
        ...lrps.map(item => ({
          id: item.id,
          label: item.title,
          type: 'lrp',
          description: item.description,
          data: item,
        })),
        ...units.map(item => ({
          id: item.id,
          label: item.title,
          type: 'unit',
          description: item.description,
          data: item,
        })),
        ...lessons.map(item => ({
          id: item.id,
          label: item.title,
          type: 'lesson',
          description: item.learningGoals,
          data: item,
        })),
        ...expectations.map(item => ({
          id: item.id,
          label: `${item.code}: ${item.description}`,
          type: 'curriculum',
          description: item.subject,
          data: item,
        })),
      ];

      res.json({
        results,
        query: q,
        totalResults: results.length,
      });
    } catch (error) {
      logger.error('Error searching cascade:', error);
      res.status(500).json({ 
        error: 'Failed to search cascade',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Batch fetch multiple nodes (for preloading)
router.post(
  '/batch',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { nodeIds, nodeTypes } = req.body;

      if (!Array.isArray(nodeIds) || !Array.isArray(nodeTypes)) {
        res.status(400).json({ error: 'nodeIds and nodeTypes must be arrays' });
        return;
      }

      logger.info('Batch fetching nodes', { userId, count: nodeIds.length });

      const results: Record<string, any> = {};

      // Group node IDs by type for efficient querying
      const nodesByType = nodeIds.reduce((acc, id, index) => {
        const type = nodeTypes[index];
        if (!acc[type]) acc[type] = [];
        acc[type].push(id);
        return acc;
      }, {} as Record<string, string[]>);

      // Fetch each type in parallel
      const promises = [];

      if (nodesByType.lrp) {
        promises.push(
          prisma.longRangePlan.findMany({
            where: {
              id: { in: nodesByType.lrp },
              userId,
            },
            include: {
              _count: {
                select: {
                  unitPlans: true,
                  expectations: true,
                },
              },
            },
          }).then(items => {
            items.forEach(item => {
              results[item.id] = { type: 'lrp', data: item };
            });
          })
        );
      }

      if (nodesByType.unit) {
        promises.push(
          prisma.unitPlan.findMany({
            where: {
              id: { in: nodesByType.unit },
              userId,
            },
            include: {
              _count: {
                select: {
                  lessonPlans: true,
                  expectations: true,
                },
              },
            },
          }).then(items => {
            items.forEach(item => {
              results[item.id] = { type: 'unit', data: item };
            });
          })
        );
      }

      if (nodesByType.lesson) {
        promises.push(
          prisma.eTFOLessonPlan.findMany({
            where: {
              id: { in: nodesByType.lesson },
              userId,
            },
            include: {
              daybookEntry: true,
              _count: {
                select: {
                  expectations: true,
                  resources: true,
                },
              },
            },
          }).then(items => {
            items.forEach(item => {
              results[item.id] = { type: 'lesson', data: item };
            });
          })
        );
      }

      await Promise.all(promises);

      res.json(results);
    } catch (error) {
      logger.error('Error batch fetching nodes:', error);
      res.status(500).json({ 
        error: 'Failed to batch fetch nodes',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export { router };