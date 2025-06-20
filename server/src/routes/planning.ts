import { Router } from 'express';
import { parseISO, startOfWeek } from 'date-fns';
import { 
  calculateWeeklyPlanDiagnostics, 
  getPlanningQualityTrend 
} from '../services/planning/weeklyPlanDiagnostics';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/planning/quality-score
 * Get planning quality diagnostics for a specific week
 */
router.get('/quality-score', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { weekStart } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse weekStart or default to current week
    const parsedWeekStart = weekStart 
      ? startOfWeek(parseISO(weekStart as string), { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 });

    const diagnostics = await calculateWeeklyPlanDiagnostics({
      weekStart: parsedWeekStart,
      userId,
    });

    res.json(diagnostics);
  } catch (error) {
    console.error('Error in GET /api/planning/quality-score:', error);
    next(error);
  }
});

/**
 * GET /api/planning/quality-trend
 * Get planning quality trend over time
 */
router.get('/quality-trend', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId;
    const weeks = parseInt(req.query.weeks as string) || 8;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const trend = await getPlanningQualityTrend(userId, weeks);
    res.json(trend);
  } catch (error) {
    console.error('Error in GET /api/planning/quality-trend:', error);
    next(error);
  }
});

export default router;