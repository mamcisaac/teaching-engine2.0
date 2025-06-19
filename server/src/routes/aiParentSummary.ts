import { Router, Request } from 'express';
import { generateParentSummary } from '../services/aiParentSummaryService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

/**
 * POST /api/ai-parent-summary
 * Generate AI-based parent summary for a student
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { studentId, from, to, focus } = req.body;
    const userId = parseInt(req.user?.userId || '0', 10);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!studentId || !from || !to) {
      return res.status(400).json({
        error: 'studentId, from, and to dates are required',
      });
    }

    const summary = await generateParentSummary({
      studentId: parseInt(studentId, 10),
      from: new Date(from),
      to: new Date(to),
      focus: focus || [],
      userId,
    });

    res.json(summary);
  } catch (err) {
    console.error('Error in POST /api/ai-parent-summary:', err);
    next(err);
  }
});

export default router;
