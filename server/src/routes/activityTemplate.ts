import { Router, Request } from 'express';
import {
  getActivitySuggestions,
  getActivityTemplates,
  createActivityTemplate,
} from '../services/activitySuggestionEngine';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

/**
 * GET /api/activities/suggestions
 * Get activity suggestions for current outcomes or themes
 */
router.get('/suggestions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { suggestFor, theme, domain, subject, limit } = req.query;
    const userId = parseInt(req.user?.userId || '0', 10);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const outcomeIds = suggestFor ? String(suggestFor).split(',') : [];
    const themeId = theme ? parseInt(String(theme), 10) : undefined;

    const suggestions = await getActivitySuggestions({
      userId,
      outcomeIds,
      themeId,
      domain: domain ? String(domain) : undefined,
      subject: subject ? String(subject) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 10,
    });

    res.json(suggestions);
  } catch (err) {
    console.error('Error in GET /api/activities/suggestions:', err);
    next(err);
  }
});

/**
 * GET /api/activities/templates
 * Browse activity templates with filtering
 */
router.get('/templates', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { domain, subject, outcomeId, themeId, groupType, search } = req.query;
    const userId = parseInt(req.user?.userId || '0', 10);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const templates = await getActivityTemplates({
      userId,
      domain: domain ? String(domain) : undefined,
      subject: subject ? String(subject) : undefined,
      outcomeId: outcomeId ? String(outcomeId) : undefined,
      themeId: themeId ? parseInt(String(themeId), 10) : undefined,
      groupType: groupType ? String(groupType) : undefined,
      search: search ? String(search) : undefined,
    });

    res.json(templates);
  } catch (err) {
    console.error('Error in GET /api/activities/templates:', err);
    next(err);
  }
});

/**
 * POST /api/activities/templates
 * Create a new activity template
 */
router.post('/templates', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await createActivityTemplate({
      ...req.body,
      createdBy: userId,
    });

    res.status(201).json(template);
  } catch (err) {
    console.error('Error in POST /api/activities/templates:', err);
    next(err);
  }
});

/**
 * POST /api/activities/templates/:id/use
 * Convert a template into an actual activity in a milestone
 */
router.post('/templates/:id/use', async (req: AuthenticatedRequest, res, next) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    const { milestoneId } = req.body;
    const userId = parseInt(req.user?.userId || '0', 10);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!milestoneId) {
      return res.status(400).json({ error: 'milestoneId is required' });
    }

    // This would create an actual activity from the template
    // For now, we'll just return a success message
    res.json({ message: 'Activity created from template', templateId, milestoneId });
  } catch (err) {
    console.error('Error in POST /api/activities/templates/:id/use:', err);
    next(err);
  }
});

export default router;
