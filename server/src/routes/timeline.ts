import { Router, Request } from 'express';
import { prisma } from '../prisma';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

// Timeline event type definition
interface TimelineEvent {
  id: string;
  date: Date;
  type: 'activity' | 'assessment' | 'theme' | 'newsletter';
  label: string;
  linkedOutcomeIds: string[];
  subjectId?: number;
  metadata?: {
    score?: number;
    milestoneId?: number;
    endDate?: Date;
  };
}

const router = Router();

// GET /api/timeline/events
router.get('/events', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { from, to, subjectId, outcomeId, themeId } = req.query;
    const userId = Number(req.user?.userId);

    // Parse dates
    const fromDate = from
      ? new Date(from as string)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const toDate = to
      ? new Date(to as string)
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const events: TimelineEvent[] = [];

    // Fetch activities with completed dates
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        completedAt: {
          gte: fromDate,
          lte: toDate,
        },
        ...(subjectId && {
          milestone: {
            subjectId: Number(subjectId),
          },
        }),
        ...(outcomeId && {
          outcomes: {
            some: {
              outcomeId: outcomeId as string,
            },
          },
        }),
      },
      include: {
        milestone: {
          include: {
            subject: true,
          },
        },
        outcomes: true,
      },
    });

    // Transform activities to timeline events
    activities.forEach((activity) => {
      if (activity.completedAt) {
        events.push({
          id: `act-${activity.id}`,
          date: activity.completedAt,
          type: activity.activityType === 'ASSESSMENT' ? 'assessment' : 'activity',
          label: activity.title,
          linkedOutcomeIds: activity.outcomes.map((o) => o.outcomeId),
          subjectId: activity.milestone.subjectId,
          metadata: {
            milestoneId: activity.milestoneId,
          },
        });
      }
    });

    // Fetch assessment results
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: {
        date: {
          gte: fromDate,
          lte: toDate,
        },
        template: {
          userId,
          ...(outcomeId && {
            outcomeIds: {
              contains: outcomeId as string,
            },
          }),
        },
      },
      include: {
        template: true,
      },
    });

    // Transform assessment results to timeline events
    assessmentResults.forEach((result) => {
      const outcomeIds = JSON.parse(result.template.outcomeIds) as string[];
      events.push({
        id: `assess-${result.id}`,
        date: result.date,
        type: 'assessment',
        label: result.template.title,
        linkedOutcomeIds: outcomeIds,
        metadata: {
          score: result.groupScore || undefined,
        },
      });
    });

    // Fetch thematic units
    const thematicUnits = await prisma.thematicUnit.findMany({
      where: {
        userId,
        startDate: {
          lte: toDate,
        },
        endDate: {
          gte: fromDate,
        },
        ...(themeId && {
          id: Number(themeId),
        }),
      },
      include: {
        outcomes: true,
      },
    });

    // Transform thematic units to timeline events
    thematicUnits.forEach((unit) => {
      events.push({
        id: `theme-${unit.id}`,
        date: unit.startDate,
        type: 'theme',
        label: unit.title,
        linkedOutcomeIds: unit.outcomes.map((o) => o.outcomeId),
        metadata: {
          endDate: unit.endDate,
        },
      });
    });

    // Fetch parent messages (newsletters)
    const parentMessages = await prisma.parentMessage.findMany({
      where: {
        userId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        linkedOutcomes: true,
      },
    });

    // Transform parent messages to timeline events
    parentMessages.forEach((message) => {
      events.push({
        id: `newsletter-${message.id}`,
        date: message.createdAt,
        type: 'newsletter',
        label: message.title,
        linkedOutcomeIds: message.linkedOutcomes.map((o) => o.outcomeId),
      });
    });

    // Sort events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    res.json(events);
  } catch (err) {
    next(err);
  }
});

// GET /api/timeline/summary
router.get('/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = Number(req.user?.userId);
    const { from, to } = req.query;

    // Parse dates
    const fromDate = from
      ? new Date(from as string)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const toDate = to ? new Date(to as string) : new Date();

    // Get total outcomes
    const totalOutcomes = await prisma.outcome.count();

    // Get covered outcomes through activities
    const activityOutcomes = await prisma.activityOutcome.findMany({
      where: {
        activity: {
          userId,
          completedAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
      },
      distinct: ['outcomeId'],
    });

    // Get covered outcomes through assessments
    const assessmentTemplates = await prisma.assessmentTemplate.findMany({
      where: {
        userId,
        results: {
          some: {
            date: {
              gte: fromDate,
              lte: toDate,
            },
          },
        },
      },
    });

    // Extract unique outcome IDs from assessments
    const assessmentOutcomeIds = new Set<string>();
    assessmentTemplates.forEach((template) => {
      const outcomeIds = JSON.parse(template.outcomeIds) as string[];
      outcomeIds.forEach((id) => assessmentOutcomeIds.add(id));
    });

    // Combine unique outcome IDs
    const coveredOutcomeIds = new Set([
      ...activityOutcomes.map((ao) => ao.outcomeId),
      ...assessmentOutcomeIds,
    ]);

    // Get next milestone
    const nextMilestone = await prisma.milestone.findFirst({
      where: {
        userId,
        activities: {
          some: {
            completedAt: null,
          },
        },
      },
      orderBy: {
        targetDate: 'asc',
      },
    });

    res.json({
      totalOutcomes,
      coveredOutcomes: coveredOutcomeIds.size,
      coveragePercentage: Math.round((coveredOutcomeIds.size / totalOutcomes) * 100),
      nextMilestone: nextMilestone
        ? {
            id: nextMilestone.id,
            title: nextMilestone.title,
            targetDate: nextMilestone.targetDate,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
