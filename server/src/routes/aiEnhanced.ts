import { Router } from 'express';
import { auth } from '../middleware/auth';
import { aiActivityGeneratorEnhanced } from '../services/aiActivityGeneratorEnhanced';
import { aiWeeklyPlanGenerator } from '../services/aiWeeklyPlanGenerator';
import { gptPlanningAgent } from '../services/gptPlanningAgent';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../prisma';
import logger from '../logger';

const router = Router();

// All routes require authentication
router.use(auth);

/**
 * Generate activities for multiple outcomes with quality scoring
 * POST /api/ai/activities/generate
 */
router.post(
  '/activities/generate',
  [
    body('outcomeIds').isArray().notEmpty().withMessage('outcomeIds array is required'),
    body('theme').optional().isString(),
    body('languageLevel').optional().isString(),
    body('complexity').optional().isIn(['simple', 'moderate', 'complex']),
    body('generateSeries').optional().isBoolean(),
    body('seriesSize').optional().isInt({ min: 2, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = parseInt(req.user!.userId);
      const params = {
        ...req.body,
        userId,
      };

      const activities = await aiActivityGeneratorEnhanced.generateActivities(params);

      res.json({
        success: true,
        data: activities,
        count: Array.isArray(activities) ? activities.length : 1,
      });
    } catch (error) {
      logger.error('Error generating activities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate activities',
      });
    }
  }
);

/**
 * Analyze curriculum coverage gaps
 * GET /api/ai/curriculum/analyze
 */
router.get(
  '/curriculum/analyze',
  [
    query('subjectId').optional().isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = parseInt(req.user!.userId);
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;

      const analysis = await aiActivityGeneratorEnhanced.analyzeCurriculumGaps(userId, subjectId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error analyzing curriculum:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze curriculum',
      });
    }
  }
);

/**
 * Update activity quality score based on acceptance
 * POST /api/ai/activities/:id/feedback
 */
router.post(
  '/activities/:id/feedback',
  [
    body('accepted').isBoolean().withMessage('accepted field is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const suggestionId = parseInt(req.params.id);
      const { accepted } = req.body;

      await aiActivityGeneratorEnhanced.updateQualityScore(suggestionId, accepted);

      res.json({
        success: true,
        message: 'Feedback recorded',
      });
    } catch (error) {
      logger.error('Error recording feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record feedback',
      });
    }
  }
);

/**
 * Generate AI-powered weekly plan
 * POST /api/ai/plans/generate
 */
router.post(
  '/plans/generate',
  [
    body('weekStart').isISO8601().withMessage('Valid weekStart date is required'),
    body('preferences').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = parseInt(req.user!.userId);
      const { weekStart, preferences } = req.body;

      const plan = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId,
        weekStart,
        preferences,
      });

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      logger.error('Error generating weekly plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate weekly plan',
      });
    }
  }
);

/**
 * Apply generated plan to calendar
 * POST /api/ai/plans/:id/apply
 */
router.post(
  '/plans/:id/apply',
  async (req, res) => {
    try {
      const userId = parseInt(req.user!.userId);
      const planId = parseInt(req.params.id);

      const result = await aiWeeklyPlanGenerator.applyPlanToCalendar(planId, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error applying plan:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to apply plan',
      });
    }
  }
);

/**
 * Start new planning agent session
 * POST /api/ai/agent/sessions
 */
router.post('/agent/sessions', async (req, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const sessionId = await gptPlanningAgent.startSession(userId);

    res.json({
      success: true,
      data: {
        sessionId,
        message: 'Planning assistant ready. How can I help you today?',
      },
    });
  } catch (error) {
    logger.error('Error starting agent session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start planning session',
    });
  }
});

/**
 * Send message to planning agent
 * POST /api/ai/agent/messages
 */
router.post(
  '/agent/messages',
  [
    body('sessionId').notEmpty().withMessage('sessionId is required'),
    body('message').notEmpty().withMessage('message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { sessionId, message } = req.body;

      const response = await gptPlanningAgent.processMessage(sessionId, message);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('Error processing agent message:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process message',
      });
    }
  }
);

/**
 * Get conversation history
 * GET /api/ai/agent/sessions/:sessionId/history
 */
router.get('/agent/sessions/:sessionId/history', async (req, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const { sessionId } = req.params;

    const history = await gptPlanningAgent.getConversationHistory(sessionId, userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Error fetching conversation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation history',
    });
  }
});

/**
 * Get quick action suggestions
 * GET /api/ai/agent/quick-actions
 */
router.get('/agent/quick-actions', async (req, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const actions = await gptPlanningAgent.getQuickActions(userId);

    res.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    logger.error('Error fetching quick actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quick actions',
    });
  }
});

/**
 * Get all generated plans
 * GET /api/ai/plans
 */
router.get('/plans', async (req, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    
    const plans = await prisma.aIGeneratedPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: plans.map(plan => ({
        ...plan,
        planData: JSON.parse(plan.planData),
        parameters: JSON.parse(plan.parameters),
      })),
    });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans',
    });
  }
});

/**
 * Get activity series
 * GET /api/ai/series
 */
router.get('/series', async (req, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    
    const series = await prisma.activitySeries.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: series.map(s => ({
        ...s,
        outcomeIds: JSON.parse(s.outcomeIds),
        metadata: s.metadata ? JSON.parse(s.metadata) : null,
      })),
    });
  } catch (error) {
    logger.error('Error fetching series:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity series',
    });
  }
});

export default router;