import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { generateAuditReport, exportAuditData } from '../services/curriculumAuditService';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const auditRequestSchema = z.object({
  subjectIds: z.array(z.number()).optional(),
  timeframe: z.enum(['term', 'semester', 'year']).default('term'),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

const exportRequestSchema = z.object({
  format: z.enum(['pdf', 'csv', 'json']).default('json'),
  subjectIds: z.array(z.number()).optional(),
  timeframe: z.enum(['term', 'semester', 'year']).default('term'),
  includeDetails: z.boolean().default(true),
});

// Get curriculum audit overview
router.get('/overview', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = auditRequestSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validation.error.flatten(),
      });
    }

    const { subjectIds, timeframe, fromDate, toDate } = validation.data;
    const userIdInt = parseInt(userId);

    // Get user's subjects
    const subjects = await prisma.subject.findMany({
      where: {
        userId: userIdInt,
        ...(subjectIds && subjectIds.length > 0 ? { id: { in: subjectIds } } : {}),
      },
      include: {
        milestones: {
          include: {
            outcomes: true,
          },
        },
      },
    });

    // Get activities for the timeframe
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      };
    } else {
      // Default timeframe calculations
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let startDate: Date;
      const endDate: Date = now;

      switch (timeframe) {
        case 'term':
          // Assume term is 4 months
          startDate = new Date(currentYear, currentMonth - 4, 1);
          break;
        case 'semester':
          // Assume semester is 6 months
          startDate = new Date(currentYear, currentMonth - 6, 1);
          break;
        case 'year':
          // Academic year
          startDate = new Date(currentYear - 1, 8, 1); // September 1st
          break;
        default:
          startDate = new Date(currentYear, currentMonth - 4, 1);
      }

      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const activities = await prisma.activity.findMany({
      where: {
        ...dateFilter,
        milestone: {
          subject: {
            userId: userIdInt,
            ...(subjectIds && subjectIds.length > 0 ? { id: { in: subjectIds } } : {}),
          },
        },
      },
      include: {
        milestone: {
          include: {
            subject: true,
          },
        },
        outcomes: {
          include: {
            outcome: true,
          },
        },
      },
    });

    // Calculate coverage metrics
    const allOutcomes = subjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) => milestone.outcomes),
    );

    const coveredOutcomeIds = new Set(
      activities.flatMap((activity) => activity.outcomes.map((ao) => ao.outcome.id)),
    );

    const totalOutcomes = allOutcomes.length;
    const coveredOutcomes = allOutcomes.filter((outcome) =>
      coveredOutcomeIds.has(outcome.id),
    ).length;
    const uncoveredOutcomes = totalOutcomes - coveredOutcomes;
    const coveragePercentage = totalOutcomes > 0 ? (coveredOutcomes / totalOutcomes) * 100 : 0;

    // Subject-specific metrics
    const subjectMetrics = subjects.map((subject) => {
      const subjectOutcomes = subject.milestones.flatMap((m) => m.outcomes);
      const subjectActivities = activities.filter((a) => a.milestone.subjectId === subject.id);
      const subjectCoveredIds = new Set(
        subjectActivities.flatMap((a) => a.outcomes.map((ao) => ao.outcome.id)),
      );

      const subjectCovered = subjectOutcomes.filter((o) => subjectCoveredIds.has(o.id)).length;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        totalOutcomes: subjectOutcomes.length,
        coveredOutcomes: subjectCovered,
        uncoveredOutcomes: subjectOutcomes.length - subjectCovered,
        coveragePercentage:
          subjectOutcomes.length > 0 ? (subjectCovered / subjectOutcomes.length) * 100 : 0,
        activitiesCount: subjectActivities.length,
        uncoveredOutcomeDetails: subjectOutcomes
          .filter((o) => !subjectCoveredIds.has(o.id))
          .map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
          })),
        recentActivities: subjectActivities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            createdAt: a.createdAt,
          })),
      };
    });

    const auditData = {
      generatedAt: new Date().toISOString(),
      timeframe,
      dateRange: dateFilter.createdAt
        ? {
            from: dateFilter.createdAt.gte,
            to: dateFilter.createdAt.lte,
          }
        : null,
      overallMetrics: {
        totalOutcomes,
        coveredOutcomes,
        uncoveredOutcomes,
        coveragePercentage,
        activitiesCount: activities.length,
        subjectsAudited: subjects.length,
      },
      subjectMetrics,
    };

    res.json(auditData);
  } catch (err) {
    console.error('Error generating audit overview:', err);
    next(err);
  }
});

// Generate detailed audit report
router.post('/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = auditRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { subjectIds, timeframe, fromDate, toDate } = validation.data;

    const report = await generateAuditReport({
      userId: parseInt(userId),
      subjectIds,
      timeframe,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });

    res.json(report);
  } catch (err) {
    console.error('Error generating detailed audit report:', err);
    next(err);
  }
});

// Export audit data in various formats
router.post('/export', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = exportRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid export request',
        details: validation.error.flatten(),
      });
    }

    const { format, subjectIds, timeframe, includeDetails } = validation.data;

    const exportData = await exportAuditData({
      userId: parseInt(userId),
      format,
      subjectIds,
      timeframe,
      includeDetails,
    });

    // Set appropriate headers based on format
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `curriculum-audit-${timeframe}-${timestamp}`;

    switch (format) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        break;
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        break;
      case 'pdf':
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        break;
    }

    res.send(exportData);
  } catch (err) {
    console.error('Error exporting audit data:', err);
    next(err);
  }
});

// Get uncovered outcomes for a specific subject
router.get('/uncovered/:subjectId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const subjectId = parseInt(req.params.subjectId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: parseInt(userId),
      },
      include: {
        milestones: {
          include: {
            outcomes: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Get all outcomes for this subject
    const allOutcomes = subject.milestones.flatMap((m) => m.outcomes);

    // Get covered outcomes
    const activities = await prisma.activity.findMany({
      where: {
        milestone: {
          subjectId,
        },
      },
      include: {
        outcomes: {
          include: {
            outcome: true,
          },
        },
      },
    });

    const coveredOutcomeIds = new Set(
      activities.flatMap((a) => a.outcomes.map((ao) => ao.outcome.id)),
    );

    const uncoveredOutcomes = allOutcomes.filter((outcome) => !coveredOutcomeIds.has(outcome.id));

    res.json({
      subjectId,
      subjectName: subject.name,
      totalOutcomes: allOutcomes.length,
      uncoveredCount: uncoveredOutcomes.length,
      uncoveredOutcomes: uncoveredOutcomes.map((outcome) => ({
        id: outcome.id,
        title: outcome.title,
        description: outcome.description,
        milestone: subject.milestones.find((m) => m.outcomes.some((o) => o.id === outcome.id))
          ?.title,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
