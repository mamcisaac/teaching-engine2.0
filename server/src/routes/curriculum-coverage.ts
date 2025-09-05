/**
 * Curriculum Coverage API Routes
 * Tracks which curriculum expectations are covered by lesson plans
 */

import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { authenticate } from '../middleware/auth';
import type { AuthenticatedRequest } from './base/middleware';
import { prisma } from '../prisma';
import { validateRequest } from '../middleware/validation';
import { getErrorMessage } from '../utils/type-guards';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

interface CoverageMetric {
  subject: string;
  total: number;
  covered: number;
  percentage: number;
}

interface UncoveredExpectation {
  id: string;
  code: string;
  description: string;
  descriptionFr?: string | null;
  subject: string;
  grade: number;
  strand: string;
  substrand?: string | null;
  isCovered: boolean;
}

/**
 * GET /api/curriculum-coverage/metrics
 * Returns coverage metrics by subject for the current user
 */
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;

    // Get all curriculum expectations for Grade 1
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 },
      select: {
        id: true,
        subject: true,
        lessonPlans: {
          select: {
            lessonPlan: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    // Calculate coverage by subject
    const coverageBySubject: Record<string, { total: number; covered: number }> = {};

    for (const expectation of allExpectations) {
      const subject = expectation.subject;
      
      if (!coverageBySubject[subject]) {
        coverageBySubject[subject] = { total: 0, covered: 0 };
      }
      
      coverageBySubject[subject].total++;
      
      // Check if this expectation is covered by any of the user's lessons
      const isCovered = expectation.lessonPlans.some(
        le => le.lessonPlan.userId === userId
      );
      
      if (isCovered) {
        coverageBySubject[subject].covered++;
      }
    }

    // Format as metrics array
    const metrics: CoverageMetric[] = Object.entries(coverageBySubject).map(
      ([subject, counts]) => ({
        subject,
        total: counts.total,
        covered: counts.covered,
        percentage: counts.total > 0 
          ? Math.round((counts.covered / counts.total) * 100)
          : 0,
      })
    );

    // Sort by subject name
    metrics.sort((a, b) => a.subject.localeCompare(b.subject));

    res.json({ metrics });
  } catch (error: unknown) {
    logger.error('Error fetching coverage metrics:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to fetch coverage metrics' });
  }
});

/**
 * GET /api/curriculum-coverage/uncovered
 * Returns list of uncovered curriculum expectations with optional filters
 */
const uncoveredQuerySchema = z.object({
  subject: z.string().optional(),
  search: z.string()
    .optional()
    .transform(val => val ? val.replace(/[^\w\s.-]/g, '').substring(0, 100) : val),
  showAll: z.string().transform(val => val === 'true').optional(),
});

router.get('/uncovered', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;
    const { subject, search, showAll } = uncoveredQuerySchema.parse(req.query);

    // Build where clause
    const where: any = { grade: 1 };
    
    if (subject) {
      where.subject = subject;
    }
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionFr: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get expectations with coverage info
    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      include: {
        lessonPlans: {
          select: {
            lessonPlan: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
      orderBy: [
        { subject: 'asc' },
        { strand: 'asc' },
        { code: 'asc' },
      ],
    });

    // Map to include coverage status
    const expectationsWithCoverage: UncoveredExpectation[] = expectations.map(exp => {
      const isCovered = exp.lessonPlans.some(
        le => le.lessonPlan.userId === userId
      );
      
      return {
        id: exp.id,
        code: exp.code,
        description: exp.description,
        descriptionFr: exp.descriptionFr,
        subject: exp.subject,
        grade: exp.grade,
        strand: exp.strand || '',
        substrand: exp.substrand,
        isCovered,
      };
    });

    // Filter to uncovered only unless showAll is true
    const results = showAll 
      ? expectationsWithCoverage
      : expectationsWithCoverage.filter(exp => !exp.isCovered);

    res.json({ expectations: results });
  } catch (error: unknown) {
    logger.error('Error fetching uncovered expectations:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to fetch uncovered expectations' });
  }
});

/**
 * GET /api/curriculum-coverage/by-subject/:subject
 * Returns detailed coverage for a specific subject
 */
router.get('/by-subject/:subject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;
    const { subject } = req.params;

    // Get all expectations for this subject
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        grade: 1,
        subject,
      },
      include: {
        lessonPlans: {
          select: {
            lessonPlan: {
              select: {
                id: true,
                titleFr: true,
                date: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: [
        { strand: 'asc' },
        { code: 'asc' },
      ],
    });

    // Group by strand
    const byStrand: Record<string, {
      total: number;
      covered: number;
      expectations: UncoveredExpectation[];
    }> = {};

    for (const exp of expectations) {
      const strand = exp.strand || 'Other';
      
      if (!byStrand[strand]) {
        byStrand[strand] = {
          total: 0,
          covered: 0,
          expectations: [],
        };
      }
      
      const isCovered = exp.lessonPlans.some(
        le => le.lessonPlan.userId === userId
      );
      
      byStrand[strand].total++;
      if (isCovered) {
        byStrand[strand].covered++;
      }
      
      byStrand[strand].expectations.push({
        id: exp.id,
        code: exp.code,
        description: exp.description,
        descriptionFr: exp.descriptionFr,
        subject: exp.subject,
        grade: exp.grade,
        strand: exp.strand || '',
        substrand: exp.substrand,
        isCovered,
      });
    }

    // Calculate overall stats
    const totalExpectations = expectations.length;
    const coveredExpectations = expectations.filter(exp =>
      exp.lessonPlans.some(le => le.lessonPlan.userId === userId)
    ).length;
    const percentage = totalExpectations > 0
      ? Math.round((coveredExpectations / totalExpectations) * 100)
      : 0;

    res.json({
      subject,
      total: totalExpectations,
      covered: coveredExpectations,
      percentage,
      byStrand,
    });
  } catch (error: unknown) {
    logger.error('Error fetching subject coverage:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to fetch subject coverage' });
  }
});

/**
 * POST /api/curriculum-coverage/plan-lesson
 * Quick-creates a lesson plan linked to a specific expectation
 */
const planLessonSchema = z.object({
  expectationId: z.string(),
  title: z.string().min(1),
  date: z.string().optional(),
  duration: z.number().default(45),
});

/**
 * POST /api/curriculum-coverage/bulk-plan-lessons
 * Creates multiple lesson plans for selected expectations
 */
const bulkPlanLessonsSchema = z.object({
  expectationIds: z.array(z.string()).min(1).max(20),
  baseTitle: z.string().min(1),
  startDate: z.string().optional(),
  duration: z.number().default(45),
});

router.post('/plan-lesson', 
  validateRequest(planLessonSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      const { expectationId, title, date, duration } = req.body;

      // Verify expectation exists
      const expectation = await prisma.curriculumExpectation.findUnique({
        where: { id: expectationId },
      });

      if (!expectation) {
        res.status(404).json({ error: 'Expectation not found' });
        return;
      }

      // Create a basic lesson linked to this expectation
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId,
          titleFr: title,
          title: title,
          unitPlanId: 'temp', // Temporary unit plan ID - will be updated later
          date: date ? new Date(date) : new Date(),
          duration,
          slotNumber: 0,
          mindsOn: `Lesson covering ${expectation.code}: ${expectation.description}`,
          learningGoals: expectation.description,
          assessmentNotes: 'Observation and formative assessment',
          expectations: {
            create: {
              expectationId,
            },
          },
        },
        include: {
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      });

      res.json({ lesson });
    } catch (error: unknown) {
      logger.error('Error creating lesson for expectation:', getErrorMessage(error));
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  }
);

/**
 * POST /api/curriculum-coverage/bulk-plan-lessons
 * Creates multiple lesson plans for selected expectations
 */
router.post('/bulk-plan-lessons',
  validateRequest(bulkPlanLessonsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      const { expectationIds, baseTitle, startDate, duration } = req.body;

      // Verify all expectations exist
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          id: { in: expectationIds },
        },
      });

      if (expectations.length !== expectationIds.length) {
        res.status(400).json({ error: 'Some expectations not found' });
        return;
      }

      // Create lessons for each expectation
      const baseDate = startDate ? new Date(startDate) : new Date();
      const lessons = await Promise.all(
        expectations.map(async (expectation, index) => {
          const lessonDate = new Date(baseDate);
          lessonDate.setDate(baseDate.getDate() + index);

          return prisma.eTFOLessonPlan.create({
            data: {
              userId,
              titleFr: `${baseTitle} - ${expectation.code}`,
              title: `${baseTitle} - ${expectation.code}`,
              unitPlanId: 'temp', // Temporary unit plan ID - will be updated later
              date: lessonDate,
              duration,
              slotNumber: 0,
              mindsOn: `Lesson covering ${expectation.code}: ${expectation.description}`,
              learningGoals: expectation.description,
              assessmentNotes: 'Observation and formative assessment',
              expectations: {
                create: {
                  expectationId: expectation.id,
                },
              },
            },
            include: {
              expectations: {
                include: {
                  expectation: true,
                },
              },
            },
          });
        })
      );

      res.json({ 
        message: `Created ${lessons.length} lesson plans`,
        lessons,
      });
    } catch (error: unknown) {
      logger.error('Error creating bulk lessons:', getErrorMessage(error));
      res.status(500).json({ error: 'Failed to create bulk lessons' });
    }
  }
);

export default router;