import { Router, Request } from 'express';
import { workflowStateService, ETFOLevel } from '../services/workflowStateService';

const router = Router();

/**
 * GET /api/workflow/state
 * Get the current workflow state for the authenticated user
 */
router.get('/state', async (req: Request, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const workflowState = await workflowStateService.getUserWorkflowState(userId);

    res.json(workflowState);
  } catch (error) {
    console.error('Error fetching workflow state:', error);
    res.status(500).json({ error: 'Failed to fetch workflow state' });
  }
});

/**
 * GET /api/workflow/access/:level
 * Check if user can access a specific level
 */
router.get('/access/:level', async (req: Request, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const level = req.params.level.toUpperCase() as ETFOLevel;

    if (!Object.values(ETFOLevel).includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    const access = await workflowStateService.canAccessLevel(userId, level);
    res.json(access);
  } catch (error) {
    console.error('Error checking level access:', error);
    res.status(500).json({ error: 'Failed to check level access' });
  }
});

/**
 * POST /api/workflow/validate
 * Validate that an entity has all required fields for its level
 */
router.post('/validate', async (req: Request, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { level, entityId } = req.body;

    if (!level || !entityId) {
      return res.status(400).json({ error: 'Missing required fields: level, entityId' });
    }

    const levelEnum = level.toUpperCase() as ETFOLevel;
    if (!Object.values(ETFOLevel).includes(levelEnum)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    const userId = req.user.id;
    const validation = await workflowStateService.validateLevelCompletion(
      userId,
      levelEnum,
      entityId,
    );

    res.json(validation);
  } catch (error) {
    console.error('Error validating level completion:', error);
    res.status(500).json({ error: 'Failed to validate level completion' });
  }
});

/**
 * GET /api/workflow/metadata
 * Get metadata for all workflow levels
 */
router.get('/metadata', async (req: Request, res) => {
  try {
    const { ETFO_LEVEL_METADATA, ETFO_LEVEL_SEQUENCE } = await import(
      '../services/workflowStateService'
    );

    res.json({
      levels: ETFO_LEVEL_METADATA,
      sequence: ETFO_LEVEL_SEQUENCE,
    });
  } catch (error) {
    console.error('Error fetching workflow metadata:', error);
    res.status(500).json({ error: 'Failed to fetch workflow metadata' });
  }
});

export default router;
