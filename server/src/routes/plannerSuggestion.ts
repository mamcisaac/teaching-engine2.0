import { Router, Request } from 'express';
import { parseISO, startOfWeek } from 'date-fns';
import { getPlannerSuggestions } from '../services/plannerSuggestions';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

/**
 * GET /api/planner/suggestions
 * Get activity suggestions for the weekly planner
 * Query params:
 *   - weekStart: ISO date string for Monday of the target week (defaults to current week)
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Parse weekStart from query params, default to start of current week
    const weekStartParam = req.query.weekStart as string | undefined;
    const weekStart = weekStartParam
      ? startOfWeek(parseISO(weekStartParam), { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 });

    // Get user ID from authenticated request
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const suggestions = await getPlannerSuggestions(weekStart, userId);
    res.json(suggestions);
  } catch (err) {
    console.error('Error in GET /api/planner/suggestions:', err);
    next(err);
  }
});

export default router;
