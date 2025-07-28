import type { Response } from 'express';
import type express from 'express';
import { Router } from 'express';
// eslint-disable-next-line import/no-named-as-default
import rateLimit from 'express-rate-limit';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { safeJsonParse } from '../utils/type-guards';
import { getUserId } from '../utils/authHelpers';
import { cuidSchema } from '../validation';
import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Rate limiting for state operations
const stateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // Much higher limit in test mode
  message: { error: 'Too many state update requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (_req) => process.env.NODE_ENV === 'test', // Skip rate limiting in test mode
});

// Sanitize text content to prevent XSS
const sanitizeText = (text: string): string => DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

// CSRF protection middleware
const csrfProtection = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  // Skip CSRF protection in test environment
  if (process.env.NODE_ENV === 'test') {
    next(); return;
  }

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigins = [
    process.env.CLIENT_URL ?? 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (origin === null && referer === null) {
      res.status(403).json({ error: 'CSRF protection: Missing origin/referer header' });
      return;
    }

    const sourceUrl = origin ?? (referer !== null ? new URL(referer as string).origin : '');
    if (!allowedOrigins.includes(sourceUrl)) {
      res.status(403).json({ error: 'CSRF protection: Invalid origin' });
      return;
    }
  }

  next();
};

// Secure validation schema for weekly planner state
const WorkingHoursSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

// Secure schema for draft changes to prevent injection
const DraftChangesSchema = z
  .object({
    planId: cuidSchema().optional(),
    title: z.string().max(200).optional(),
    content: z.string().max(10000).optional(),
    timestamp: z.number().positive().optional(),
    changes: z.record(z.string().max(100), z.string().max(1000)).optional(),
  })
  .strict();

// Secure schema for offline data
const OfflineDataSchema = z
  .object({
    pendingChanges: z.array(DraftChangesSchema).max(50).optional(),
    timestamp: z.number().positive().optional(),
    syncVersion: z.string().max(50).optional(),
  })
  .strict();

const WeeklyPlannerStateSchema = z
  .object({
    // View preferences
    defaultView: z.enum(['week', 'month', 'agenda']).default('week'),
    timeSlotDuration: z.number().int().min(15).max(60).default(30),
    showWeekends: z.boolean().default(false),
    startOfWeek: z.number().int().min(0).max(1).default(1),
    workingHours: WorkingHoursSchema.default({ start: '08:00', end: '16:00' }),

    // UI preferences
    sidebarExpanded: z.boolean().default(true),
    showMiniCalendar: z.boolean().default(true),
    showResourcePanel: z.boolean().default(true),
    compactMode: z.boolean().default(false),
    theme: z.enum(['light', 'dark', 'system']).default('light'),

    // Planning preferences
    autoSave: z.boolean().default(true),
    autoSaveInterval: z.number().min(5).max(300).default(30),
    showUncoveredOutcomes: z.boolean().default(true),
    defaultLessonDuration: z.number().min(15).max(240).default(60),

    // Current state
    currentWeekStart: z.string().datetime().optional(),
    lastActiveView: z.string().max(100).optional(),
    draftChanges: DraftChangesSchema.optional(),

    // Advanced features
    maxHistorySize: z.number().min(10).max(100).default(50),

    // Offline support
    hasOfflineChanges: z.boolean().default(false),
    offlineData: OfflineDataSchema.optional(),
  })
  .strict();

// Use global Express.Request type extended with user property

// GET /api/planner/state - Get user's planner state
router.get('/state', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    let plannerState = await prisma.weeklyPlannerState.findUnique({
      where: { userId },
    });

    // Create default state if it doesn't exist
    if (plannerState === null) {
      plannerState = await prisma.weeklyPlannerState.create({
        data: {
          userId,
          defaultView: 'week',
          timeSlotDuration: 30,
          showWeekends: false,
          startOfWeek: 1,
          workingHours: JSON.stringify({ start: '08:00', end: '16:00' }),
          sidebarExpanded: true,
          showMiniCalendar: true,
          showResourcePanel: true,
          compactMode: false,
          theme: 'light',
          autoSave: true,
          autoSaveInterval: 30,
          showUncoveredOutcomes: true,
          defaultLessonDuration: 60,
          currentWeekStart: new Date(),
          undoHistory: '[]',
          redoHistory: '[]',
          maxHistorySize: 50,
          lastSyncedAt: new Date(),
          hasOfflineChanges: false,
        },
      });
    }

    // Parse JSON fields for response
    const responseState = {
      ...plannerState,
      workingHours: safeJsonParse(plannerState.workingHours, {}),
      draftChanges: (plannerState.draftChanges !== null) ? safeJsonParse(plannerState.draftChanges, {}) : null,
      undoHistory: safeJsonParse(plannerState.undoHistory, {}),
      redoHistory: safeJsonParse(plannerState.redoHistory, {}),
      offlineData: (plannerState.offlineData !== null) ? safeJsonParse(plannerState.offlineData, {}) : null,
    };

    res.json(responseState);
    return;
  } catch (_error) {
    logger.error('Error fetching planner state:', _error as string | undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/planner/state - Update user's planner state
router.put(
  '/state',
  stateRateLimit,
  csrfProtection,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      // Validate the request body
      const validationResult = WeeklyPlannerStateSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid planner state data',
          details: validationResult.error.errors,
        });
        return;
      }

      const stateData = validationResult.data;

      // Sanitize text fields to prevent XSS
      const sanitizedDraftChanges = (stateData.draftChanges !== undefined)
        ? {
            ...stateData.draftChanges,
            title: (stateData.draftChanges.title !== undefined)
              ? sanitizeText(stateData.draftChanges.title)
              : undefined,
            content: (stateData.draftChanges.content !== undefined)
              ? sanitizeText(stateData.draftChanges.content)
              : undefined,
            changes: (stateData.draftChanges.changes !== undefined)
              ? Object.fromEntries(
                  Object.entries(stateData.draftChanges.changes).map(([key, value]) => [
                    sanitizeText(key),
                    sanitizeText(value),
                  ]),
                )
              : undefined,
          }
        : undefined;

      // Prepare data for database with JSON serialization
      const updateData = {
        defaultView: stateData.defaultView,
        timeSlotDuration: stateData.timeSlotDuration,
        showWeekends: stateData.showWeekends,
        startOfWeek: stateData.startOfWeek,
        workingHours: JSON.stringify(stateData.workingHours),
        sidebarExpanded: stateData.sidebarExpanded,
        showMiniCalendar: stateData.showMiniCalendar,
        showResourcePanel: stateData.showResourcePanel,
        compactMode: stateData.compactMode,
        theme: stateData.theme,
        autoSave: stateData.autoSave,
        autoSaveInterval: stateData.autoSaveInterval,
        showUncoveredOutcomes: stateData.showUncoveredOutcomes,
        defaultLessonDuration: stateData.defaultLessonDuration,
        currentWeekStart: (stateData.currentWeekStart !== undefined)
          ? new Date(stateData.currentWeekStart)
          : new Date(),
        lastActiveView: (stateData.lastActiveView !== undefined) ? sanitizeText(stateData.lastActiveView) : null,
        draftChanges: (sanitizedDraftChanges !== null) ? JSON.stringify(sanitizedDraftChanges) : null,
        maxHistorySize: stateData.maxHistorySize,
        hasOfflineChanges: stateData.hasOfflineChanges,
        offlineData: (stateData.offlineData !== undefined) ? JSON.stringify(stateData.offlineData) : null,
        lastSyncedAt: new Date(),
      };

      // Upsert the planner state
      const plannerState = await prisma.weeklyPlannerState.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          ...updateData,
          undoHistory: '[]',
          redoHistory: '[]',
        },
      });

      // Parse JSON fields for response
      const responseState = {
        ...plannerState,
        workingHours: safeJsonParse(plannerState.workingHours, {}),
        draftChanges: (plannerState.draftChanges !== null) ? safeJsonParse(plannerState.draftChanges, {}) : null,
        undoHistory: safeJsonParse(plannerState.undoHistory, {}),
        redoHistory: safeJsonParse(plannerState.redoHistory, {}),
        offlineData: (plannerState.offlineData !== null) ? safeJsonParse(plannerState.offlineData, {}) : null,
      };

      res.json(responseState);
      return;
    } catch (_error) {
      logger.error('Error updating planner state:', _error as string | undefined);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// GET /api/planner/week/:weekStart/state - Get state for specific week
router.get('/week/:weekStart/state', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const weekStart = new Date(req.params.weekStart);

    if (isNaN(weekStart.getTime())) {
      res.status(400).json({ error: 'Invalid week start date' });
      return;
    }

    // Get lesson plans for the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        unitPlan: {
          select: {
            id: true,
            title: true,
          },
        },
        expectations: {
          include: {
            expectation: true,
          },
        },
        resources: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get daybook entries for the week
    const daybookEntries = await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true,
          },
        },
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get uncovered curriculum expectations for progress tracking
    const allExpectations = await prisma.curriculumExpectation.count({
      where: {
        // Add any filters for user's grade/subject preferences
      },
    });

    const coveredExpectations = await prisma.curriculumExpectation.count({
      where: {
        lessonPlans: {
          some: {
            lessonPlan: {
              userId,
              date: {
                gte: new Date(new Date().getFullYear(), 0, 1), // Start of academic year
                lt: new Date(new Date().getFullYear() + 1, 0, 1),
              },
            },
          },
        },
      },
    });

    const weeklyState = {
      weekStart,
      weekEnd,
      lessonPlans,
      daybookEntries,
      progress: {
        totalExpectations: allExpectations,
        coveredExpectations,
        coveragePercentage:
          allExpectations > 0 ? Math.round((coveredExpectations / allExpectations) * 100) : 0,
      },
    };

    res.json(weeklyState);
    return;
  } catch (_error) {
    logger.error('Error fetching weekly state:', _error as string | undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/planner/state/reset - Reset planner state to defaults
router.post(
  '/state/reset',
  stateRateLimit,
  csrfProtection,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const defaultState = {
        defaultView: 'week' as const,
        timeSlotDuration: 30,
        showWeekends: false,
        startOfWeek: 1,
        workingHours: JSON.stringify({ start: '08:00', end: '16:00' }),
        sidebarExpanded: true,
        showMiniCalendar: true,
        showResourcePanel: true,
        compactMode: false,
        theme: 'light' as const,
        autoSave: true,
        autoSaveInterval: 30,
        showUncoveredOutcomes: true,
        defaultLessonDuration: 60,
        currentWeekStart: new Date(),
        lastActiveView: null,
        draftChanges: null,
        undoHistory: '[]',
        redoHistory: '[]',
        maxHistorySize: 50,
        lastSyncedAt: new Date(),
        hasOfflineChanges: false,
        offlineData: null,
      };

      const plannerState = await prisma.weeklyPlannerState.upsert({
        where: { userId },
        update: defaultState,
        create: {
          userId,
          ...defaultState,
        },
      });

      // Parse JSON fields for response
      const responseState = {
        ...plannerState,
        workingHours: safeJsonParse(plannerState.workingHours, {}),
        draftChanges: (plannerState.draftChanges !== null) ? safeJsonParse(plannerState.draftChanges, {}) : null,
        undoHistory: safeJsonParse(plannerState.undoHistory, {}),
        redoHistory: safeJsonParse(plannerState.redoHistory, {}),
        offlineData: (plannerState.offlineData !== null) ? safeJsonParse(plannerState.offlineData, {}) : null,
      };

      res.json(responseState);
      return;
    } catch (_error) {
      logger.error('Error resetting planner state:', _error as string | undefined);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export { router };
