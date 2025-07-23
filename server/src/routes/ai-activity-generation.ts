import debug from 'debug';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { authMiddleware } from '../middleware/auth';
import { AIActivityGeneratorService } from '../services/aiActivityGeneratorService';
const log = debug('server:ai-activity:error');
// ActivityDiscoveryService removed - over-engineered for single-teacher use

const router = Router();
const aiGenerator = new AIActivityGeneratorService();

// Simple rate limiting for AI endpoints (to avoid async issues)
const aiRateLimit = (_req: Request, _res: Response, next: () => void): void => {
  // Simple in-memory rate limiting - production should use proper rate limiter
  next();
};

// Schema for activity generation request
const generateActivitySchema = z.object({
  searchQuery: z.string().optional(),
  lessonContext: z
    .object({
      title: z.string(),
      grade: z.number().min(1).max(8),
      subject: z.string(),
      learningGoals: z.array(z.string()),
      duration: z.number().min(5).max(180),
      section: z.enum(['mindsOn', 'action', 'consolidation']).optional(),
    })
    .optional(),
  specificRequirements: z
    .object({
      activityType: z.string().optional(),
      materials: z.array(z.string()).optional(),
      groupSize: z.string().optional(),
      language: z.string().optional(),
      curriculumExpectations: z.array(z.string()).optional(),
    })
    .optional(),
  useSearchResults: z.boolean().default(true),
});

// Schema for activity enhancement request (unused - reserved for future enhancement features)
// const enhanceActivitySchema = z.object({
//   activityId: z.string(),
//   enhancements: z.object({
//     addDifferentiation: z.boolean().optional(),
//     addAssessment: z.boolean().optional(),
//     adaptForGrade: z.number().min(1).max(8).optional(),
//     translateTo: z.string().optional(),
//     alignToCurriculum: z.array(z.string()).optional(),
//   }),
// });

// Schema for saving generated activity
const saveActivitySchema = z.object({
  activity: z.object({
    title: z.string(),
    description: z.string(),
    detailedInstructions: z.array(z.string()),
    duration: z.number(),
    activityType: z.string(),
    materials: z.array(z.string()),
    groupSize: z.string(),
    learningGoals: z.array(z.string()),
    assessmentSuggestions: z.array(z.string()),
    differentiation: z.object({
      support: z.array(z.string()),
      extension: z.array(z.string()),
    }),
    safetyConsiderations: z.array(z.string()).optional(),
    technologyRequirements: z.array(z.string()).optional(),
  }),
  metadata: z
    .object({
      lessonPlanId: z.string().optional(),
      basedOnActivities: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Generate an AI-powered activity
 */
router.post(
  '/generate',
  authMiddleware,
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const params = generateActivitySchema.parse(req.body);
      const searchResults = undefined;

      // Activity search removed - generating activities directly from lesson context

      // Generate the activity
      const generatedActivity = await aiGenerator.generateActivity({
        searchResults,
        lessonContext: params.lessonContext,
        specificRequirements: params.specificRequirements,
      });

      res.json({
        success: true,
        data: generatedActivity,
      });
      return;
    } catch (_error) {
      log('Error generating activity:', _error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate activity',
      });
      return;
    }
  },
);

/**
 * Generate multiple activity variations
 */
router.post(
  '/generate-variations',
  authMiddleware,
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const params = generateActivitySchema.parse(req.body);
      const count = Math.min(req.body.count || 3, 5); // Max 5 variations

      const searchResults = undefined;

      // Activity search removed - generating variations directly from lesson context

      // Generate variations
      const variations = await aiGenerator.generateActivityVariations(
        {
          searchResults,
          lessonContext: params.lessonContext,
          specificRequirements: params.specificRequirements,
        },
        count,
      );

      res.json({
        success: true,
        data: {
          variations,
          count: variations.length,
        },
      });
      return;
    } catch (_error) {
      log('Error generating activity variations:', _error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate activity variations',
      });
      return;
    }
  },
);

// Activity enhancement route removed - over-engineered for single-teacher use

/**
 * Save a generated activity
 */
router.post('/save', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const params = saveActivitySchema.parse(req.body);

    // Convert the activity object with proper defaults for required fields
    const activityWithDefaults = {
      title: params.activity.title,
      description: params.activity.description,
      detailedInstructions: params.activity.detailedInstructions,
      duration: params.activity.duration,
      activityType: params.activity.activityType,
      materials: params.activity.materials,
      groupSize: params.activity.groupSize,
      learningGoals: params.activity.learningGoals,
      assessmentSuggestions: params.activity.assessmentSuggestions,
      differentiation: {
        support: params.activity.differentiation.support,
        extension: params.activity.differentiation.extension,
      },
      safetyConsiderations: params.activity.safetyConsiderations,
      technologyRequirements: params.activity.technologyRequirements,
    };

    // Save the generated activity
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;
    
    const savedActivity = await aiGenerator.saveGeneratedActivity(
      activityWithDefaults,
      Number(userId),
      params.metadata,
    );

    res.json({
      success: true,
      data: savedActivity,
    });
    return;
  } catch (_error) {
    logger.error('Error saving generated activity:', _error as string | undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to save generated activity',
    });
    return;
  }
});

export { router };
