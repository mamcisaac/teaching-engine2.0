import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const alertFiltersSchema = z.object({
  type: z.enum(['deadline', 'progress', 'coverage']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  subjectId: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
});

const createAlertSchema = z.object({
  type: z.enum(['deadline', 'progress', 'coverage']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  milestoneId: z.number().int().positive(),
});

// Get all alerts for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = alertFiltersSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.flatten(),
      });
    }

    const filters = validation.data;
    const userIdInt = parseInt(userId);

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { userId: userIdInt };
    if (filters.type) whereClause.type = filters.type;
    if (filters.severity) whereClause.severity = filters.severity;
    if (filters.isRead !== undefined) whereClause.isRead = filters.isRead;
    if (filters.subjectId) {
      whereClause.milestone = {
        subjectId: filters.subjectId,
      };
    }

    const alerts = await prisma.milestoneAlert.findMany({
      where: whereClause,
      include: {
        milestone: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { severity: 'desc' }, // Critical first
        { createdAt: 'desc' }, // Newest first
      ],
    });

    // Transform alerts to include computed fields
    const transformedAlerts = alerts.map((alert) => ({
      ...alert,
      milestoneName: alert.milestone.title,
      subjectName: alert.milestone.subject.name,
      daysUntilDeadline: alert.milestone.targetDate
        ? Math.ceil(
            (new Date(alert.milestone.targetDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : undefined,
    }));

    const unreadCount = await prisma.milestoneAlert.count({
      where: {
        userId: userIdInt,
        isRead: false,
      },
    });

    res.json({
      alerts: transformedAlerts,
      unreadCount,
      totalCount: alerts.length,
    });
  } catch (err) {
    next(err);
  }
});

// Get unread alert count
router.get('/count', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const unreadCount = await prisma.milestoneAlert.count({
      where: {
        userId: parseInt(userId),
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
});

// Create a new alert
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = createAlertSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { type, severity, title, description, milestoneId } = validation.data;
    const userIdInt = parseInt(userId);

    // Verify milestone belongs to user
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        subject: {
          userId: userIdInt,
        },
      },
      include: {
        subject: true,
      },
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or not accessible' });
    }

    const alert = await prisma.milestoneAlert.create({
      data: {
        type,
        severity,
        title,
        description,
        milestoneId,
        userId: userIdInt,
      },
      include: {
        milestone: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const transformedAlert = {
      ...alert,
      milestoneName: alert.milestone.title,
      subjectName: alert.milestone.subject.name,
      daysUntilDeadline: alert.milestone.targetDate
        ? Math.ceil(
            (new Date(alert.milestone.targetDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : undefined,
    };

    res.status(201).json(transformedAlert);
  } catch (err) {
    next(err);
  }
});

// Mark an alert as read
router.patch('/:id/read', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const alertId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify alert belongs to user
    const existingAlert = await prisma.milestoneAlert.findFirst({
      where: {
        id: alertId,
        userId: parseInt(userId),
      },
    });

    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await prisma.milestoneAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Mark all alerts as read
router.patch('/read-all', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.milestoneAlert.updateMany({
      where: {
        userId: parseInt(userId),
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Delete/dismiss an alert
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const alertId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify alert belongs to user
    const existingAlert = await prisma.milestoneAlert.findFirst({
      where: {
        id: alertId,
        userId: parseInt(userId),
      },
    });

    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await prisma.milestoneAlert.delete({
      where: { id: alertId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Get alert statistics
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userIdInt = parseInt(userId);

    const totalAlerts = await prisma.milestoneAlert.count({
      where: { userId: userIdInt },
    });

    const unreadAlerts = await prisma.milestoneAlert.count({
      where: { userId: userIdInt, isRead: false },
    });

    const alertsBySeverity = await prisma.milestoneAlert.groupBy({
      by: ['severity'],
      where: { userId: userIdInt },
      _count: { severity: true },
    });

    const alertsByType = await prisma.milestoneAlert.groupBy({
      by: ['type'],
      where: { userId: userIdInt },
      _count: { type: true },
    });

    const recentAlerts = await prisma.milestoneAlert.findMany({
      where: { userId: userIdInt },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        milestone: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      totalAlerts,
      unreadAlerts,
      readAlerts: totalAlerts - unreadAlerts,
      alertsBySeverity: alertsBySeverity.reduce(
        (acc, item) => {
          acc[item.severity] = item._count.severity;
          return acc;
        },
        {} as Record<string, number>,
      ),
      alertsByType: alertsByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentAlerts: recentAlerts.map((alert) => ({
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        type: alert.type,
        milestoneName: alert.milestone.title,
        subjectName: alert.milestone.subject.name,
        createdAt: alert.createdAt,
        isRead: alert.isRead,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Trigger manual alert check
router.post('/check', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userIdInt = parseInt(userId);

    // Get all milestones for the user
    const milestones = await prisma.milestone.findMany({
      where: {
        subject: {
          userId: userIdInt,
        },
      },
      include: {
        subject: true,
        activities: {
          include: {
            outcomes: true,
          },
        },
        outcomes: true,
      },
    });

    const alertsToCreate = [];
    const now = new Date();

    for (const milestone of milestones) {
      // Check for deadline alerts
      if (milestone.targetDate) {
        const daysUntilDeadline = Math.ceil(
          (new Date(milestone.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Create deadline alerts
        if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
          // Check if alert already exists
          const existingAlert = await prisma.milestoneAlert.findFirst({
            where: {
              userId: userIdInt,
              milestoneId: milestone.id,
              type: 'deadline',
              createdAt: {
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Within last 24 hours
              },
            },
          });

          if (!existingAlert) {
            alertsToCreate.push({
              type: 'deadline',
              severity:
                daysUntilDeadline <= 3 ? 'critical' : daysUntilDeadline <= 5 ? 'high' : 'medium',
              title: `Milestone Deadline Approaching`,
              description: `Milestone "${milestone.title}" in ${milestone.subject.name} is due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}.`,
              milestoneId: milestone.id,
              userId: userIdInt,
            });
          }
        }
      }

      // Check for coverage alerts
      const totalOutcomes = milestone.outcomes.length;
      if (totalOutcomes > 0) {
        const coveredOutcomes = new Set();
        milestone.activities.forEach((activity) => {
          activity.outcomes.forEach((ao) => {
            coveredOutcomes.add(ao.outcomeId);
          });
        });

        const coveragePercentage = (coveredOutcomes.size / totalOutcomes) * 100;

        if (coveragePercentage < 50) {
          // Check if alert already exists
          const existingAlert = await prisma.milestoneAlert.findFirst({
            where: {
              userId: userIdInt,
              milestoneId: milestone.id,
              type: 'coverage',
              createdAt: {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Within last 7 days
              },
            },
          });

          if (!existingAlert) {
            alertsToCreate.push({
              type: 'coverage',
              severity:
                coveragePercentage < 20 ? 'critical' : coveragePercentage < 35 ? 'high' : 'medium',
              title: `Low Curriculum Coverage`,
              description: `Milestone "${milestone.title}" in ${milestone.subject.name} has only ${coveragePercentage.toFixed(1)}% outcome coverage.`,
              milestoneId: milestone.id,
              userId: userIdInt,
            });
          }
        }
      }
    }

    // Create all new alerts
    if (alertsToCreate.length > 0) {
      await prisma.milestoneAlert.createMany({
        data: alertsToCreate,
      });
    }

    res.json({
      message: 'Alert check completed',
      newAlertsCreated: alertsToCreate.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
