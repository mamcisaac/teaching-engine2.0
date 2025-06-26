import express from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import DOMPurify from 'isomorphic-dompurify';

const router = express.Router();

// Rate limiting for state operations
const stateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many state update requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize text content to prevent XSS
const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

// CSRF protection middleware
const csrfProtection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (!origin && !referer) {
      return res.status(403).json({ error: 'CSRF protection: Missing origin/referer header' });
    }
    
    const sourceUrl = origin || (referer ? new URL(referer).origin : '');
    if (!allowedOrigins.includes(sourceUrl)) {
      return res.status(403).json({ error: 'CSRF protection: Invalid origin' });
    }
  }
  
  next();
};

// Secure validation schema for weekly planner state
const WorkingHoursSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/)
});

// Secure schema for draft changes to prevent injection
const DraftChangesSchema = z.object({
  planId: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  content: z.string().max(10000).optional(),
  timestamp: z.number().positive().optional(),
  changes: z.record(z.string().max(100), z.string().max(1000)).optional()
}).strict();

// Secure schema for offline data
const OfflineDataSchema = z.object({
  pendingChanges: z.array(DraftChangesSchema).max(50).optional(),
  timestamp: z.number().positive().optional(),
  syncVersion: z.string().max(50).optional()
}).strict();

const WeeklyPlannerStateSchema = z.object({
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
  offlineData: OfflineDataSchema.optional()
}).strict();

interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
  };
}

// GET /api/planner/state - Get user's planner state
router.get('/state', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.user.userId);
    
    let plannerState = await prisma.weeklyPlannerState.findUnique({
      where: { userId }
    });

    // Create default state if it doesn't exist
    if (!plannerState) {
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
          hasOfflineChanges: false
        }
      });
    }

    // Parse JSON fields for response
    const responseState = {
      ...plannerState,
      workingHours: JSON.parse(plannerState.workingHours),
      draftChanges: plannerState.draftChanges ? JSON.parse(plannerState.draftChanges) : null,
      undoHistory: JSON.parse(plannerState.undoHistory),
      redoHistory: JSON.parse(plannerState.redoHistory),
      offlineData: plannerState.offlineData ? JSON.parse(plannerState.offlineData) : null
    };

    res.json(responseState);
  } catch (error) {
    console.error('Error fetching planner state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/planner/state - Update user's planner state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.put('/state', stateRateLimit as any, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.user.userId);
    
    // Validate the request body
    const validationResult = WeeklyPlannerStateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid planner state data',
        details: validationResult.error.errors
      });
    }

    const stateData = validationResult.data;
    
    // Sanitize text fields to prevent XSS
    const sanitizedDraftChanges = stateData.draftChanges ? {
      ...stateData.draftChanges,
      title: stateData.draftChanges.title ? sanitizeText(stateData.draftChanges.title) : undefined,
      content: stateData.draftChanges.content ? sanitizeText(stateData.draftChanges.content) : undefined,
      changes: stateData.draftChanges.changes ? 
        Object.fromEntries(
          Object.entries(stateData.draftChanges.changes).map(([key, value]) => 
            [sanitizeText(key), sanitizeText(value)]
          )
        ) : undefined
    } : undefined;
    
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
      currentWeekStart: stateData.currentWeekStart ? new Date(stateData.currentWeekStart) : new Date(),
      lastActiveView: stateData.lastActiveView ? sanitizeText(stateData.lastActiveView) : null,
      draftChanges: sanitizedDraftChanges ? JSON.stringify(sanitizedDraftChanges) : null,
      maxHistorySize: stateData.maxHistorySize,
      hasOfflineChanges: stateData.hasOfflineChanges,
      offlineData: stateData.offlineData ? JSON.stringify(stateData.offlineData) : null,
      lastSyncedAt: new Date()
    };

    // Upsert the planner state
    const plannerState = await prisma.weeklyPlannerState.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
        undoHistory: '[]',
        redoHistory: '[]'
      }
    });

    // Parse JSON fields for response
    const responseState = {
      ...plannerState,
      workingHours: JSON.parse(plannerState.workingHours),
      draftChanges: plannerState.draftChanges ? JSON.parse(plannerState.draftChanges) : null,
      undoHistory: JSON.parse(plannerState.undoHistory),
      redoHistory: JSON.parse(plannerState.redoHistory),
      offlineData: plannerState.offlineData ? JSON.parse(plannerState.offlineData) : null
    };

    res.json(responseState);
  } catch (error) {
    console.error('Error updating planner state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/planner/week/:weekStart/state - Get state for specific week
router.get('/week/:weekStart/state', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.user.userId);
    const weekStart = new Date(req.params.weekStart);
    
    if (isNaN(weekStart.getTime())) {
      return res.status(400).json({ error: 'Invalid week start date' });
    }

    // Get lesson plans for the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      include: {
        unitPlan: {
          select: {
            id: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        },
        resources: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get daybook entries for the week
    const daybookEntries = await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get uncovered curriculum expectations for progress tracking
    const allExpectations = await prisma.curriculumExpectation.count({
      where: {
        // Add any filters for user's grade/subject preferences
      }
    });

    const coveredExpectations = await prisma.curriculumExpectation.count({
      where: {
        lessonPlans: {
          some: {
            lessonPlan: {
              userId,
              date: {
                gte: new Date(new Date().getFullYear(), 0, 1), // Start of academic year
                lt: new Date(new Date().getFullYear() + 1, 0, 1)
              }
            }
          }
        }
      }
    });

    const weeklyState = {
      weekStart,
      weekEnd,
      lessonPlans,
      daybookEntries,
      progress: {
        totalExpectations: allExpectations,
        coveredExpectations,
        coveragePercentage: allExpectations > 0 ? Math.round((coveredExpectations / allExpectations) * 100) : 0
      }
    };

    res.json(weeklyState);
  } catch (error) {
    console.error('Error fetching weekly state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/planner/state/reset - Reset planner state to defaults
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post('/state/reset', stateRateLimit as any, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.user.userId);
    
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
      offlineData: null
    };

    const plannerState = await prisma.weeklyPlannerState.upsert({
      where: { userId },
      update: defaultState,
      create: {
        userId,
        ...defaultState
      }
    });

    // Parse JSON fields for response
    const responseState = {
      ...plannerState,
      workingHours: JSON.parse(plannerState.workingHours),
      draftChanges: plannerState.draftChanges ? JSON.parse(plannerState.draftChanges) : null,
      undoHistory: JSON.parse(plannerState.undoHistory),
      redoHistory: JSON.parse(plannerState.redoHistory),
      offlineData: plannerState.offlineData ? JSON.parse(plannerState.offlineData) : null
    };

    res.json(responseState);
  } catch (error) {
    console.error('Error resetting planner state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;