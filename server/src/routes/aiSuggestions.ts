import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@teaching-engine/database';
import { AIActivitySuggestionService } from '../services/aiSuggestionService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const aiService = new AIActivitySuggestionService(prisma);

// Generate AI suggestion for an outcome
const generateSuggestionSchema = z.object({
  outcomeId: z.string(),
  theme: z.string().optional(),
  languageLevel: z.string().optional(),
});

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { outcomeId, theme, languageLevel } = generateSuggestionSchema.parse(req.body);
    const userId = req.user!.id;

    const suggestion = await aiService.generateActivitySuggestion(outcomeId, userId, {
      theme,
      languageLevel,
    });

    // Parse materials back to array for response
    const response = {
      ...suggestion,
      materials: JSON.parse(suggestion.materials),
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else if (error instanceof Error && error.message === 'Outcome not found') {
      res.status(404).json({ error: 'Outcome not found' });
    } else {
      res.status(500).json({ error: 'Failed to generate suggestion' });
    }
  }
});

// Get uncovered outcomes with optional AI suggestions
const getUncoveredSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  theme: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

router.get('/uncovered', authenticateToken, async (req, res) => {
  try {
    const params = getUncoveredSchema.parse(req.query);
    const userId = req.user!.id;

    const uncoveredOutcomes = await aiService.getUncoveredOutcomes(userId, {
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      theme: params.theme,
      limit: params.limit,
    });

    // Format suggestions with parsed materials
    const formatted = uncoveredOutcomes.map((item) => ({
      outcome: item.outcome,
      suggestion: item.suggestion
        ? {
            ...item.suggestion,
            materials: JSON.parse(item.suggestion.materials),
          }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error getting uncovered outcomes:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request parameters', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to get uncovered outcomes' });
    }
  }
});

// Convert AI suggestion to actual activity
const convertToActivitySchema = z.object({
  suggestionId: z.number(),
  milestoneId: z.number(),
  title: z.string().optional(),
  durationMins: z.number().optional(),
  publicNote: z.string().optional(),
});

router.post('/convert-to-activity', authenticateToken, async (req, res) => {
  try {
    const params = convertToActivitySchema.parse(req.body);

    const activityId = await aiService.convertToActivity(params.suggestionId, params.milestoneId, {
      title: params.title,
      durationMins: params.durationMins,
      publicNote: params.publicNote,
    });

    res.json({ activityId });
  } catch (error) {
    console.error('Error converting suggestion to activity:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else if (error instanceof Error && error.message === 'Suggestion not found') {
      res.status(404).json({ error: 'Suggestion not found' });
    } else {
      res.status(500).json({ error: 'Failed to convert suggestion to activity' });
    }
  }
});

// Get a specific AI suggestion
router.get('/suggestions/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    const suggestion = await prisma.aISuggestedActivity.findUnique({
      where: { id },
      include: { outcome: true },
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    // Check if user owns this suggestion
    if (suggestion.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Parse materials for response
    const response = {
      ...suggestion,
      materials: JSON.parse(suggestion.materials),
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting suggestion:', error);
    res.status(500).json({ error: 'Failed to get suggestion' });
  }
});

// Delete an AI suggestion
router.delete('/suggestions/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    // Check if suggestion exists and user owns it
    const suggestion = await prisma.aISuggestedActivity.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    if (suggestion.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.aISuggestedActivity.delete({
      where: { id },
    });

    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

export { router as aiSuggestionsRouter };
