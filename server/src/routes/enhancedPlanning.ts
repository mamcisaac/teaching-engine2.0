import { Router } from 'express';
import { enhancedPlanningService } from '../services/enhancedPlanningService';
import logger from '../logger';

const router = Router();

// Generate intelligent schedule with thematic grouping
router.post('/schedule/generate', async (req, res, next) => {
  try {
    const {
      availableBlocks,
      milestonePriorities = new Map(),
      pacingStrategy = 'relaxed',
      preserveBuffer = true,
      useThematicGrouping = true,
      enableProgressTracking = true,
      considerPrerequisites = true,
      materialPrepTime = 15,
    } = req.body;

    if (!availableBlocks || !Array.isArray(availableBlocks)) {
      return res.status(400).json({
        error: 'Missing required field: availableBlocks (array)',
      });
    }

    const result = await enhancedPlanningService.generateIntelligentSchedule(
      1, // TODO: Get userId from auth context
      {
        availableBlocks,
        milestonePriorities: new Map(
          Object.entries(milestonePriorities).map(([k, v]) => [Number(k), Number(v)]),
        ),
        pacingStrategy,
        preserveBuffer,
        useThematicGrouping,
        enableProgressTracking,
        considerPrerequisites,
        materialPrepTime,
      },
    );

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to generate intelligent schedule');
    next(error);
  }
});

// Suggest activity sequence based on curriculum flow
router.post('/activities/sequence', async (req, res, next) => {
  try {
    const { outcomeIds } = req.body;

    if (!Array.isArray(outcomeIds) || outcomeIds.length === 0) {
      return res.status(400).json({ error: 'outcomeIds must be a non-empty array' });
    }

    const result = await enhancedPlanningService.suggestActivitySequence(outcomeIds);

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to suggest activity sequence');
    next(error);
  }
});

// Optimize schedule based on progress and coverage
router.post('/schedule/optimize', async (req, res, next) => {
  try {
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: 'schedule must be an array of schedule items' });
    }

    const result = await enhancedPlanningService.optimizeScheduleForProgress(
      1, // TODO: Get userId from auth context
      schedule,
    );

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to optimize schedule');
    next(error);
  }
});

export default router;
