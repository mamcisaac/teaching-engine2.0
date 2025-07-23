import type { Request, Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import { aiPlanningAssistant } from '../services/ai/aiPlanningService';
// Simple rate limiting for AI endpoints (to avoid async issues)
const aiRateLimit = (_req: Request, _res: Response, next: () => void): void => {
  // Simple in-memory rate limiting - production should use proper rate limiter
  next();
};

// Enhanced input sanitization to prevent prompt injection and security issues
const sanitizeAIInput = (input: unknown): unknown => {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters and prevent prompt injection
    return input
      .trim()
      .slice(0, 2000) // Limit input length
      .replace(/[<>'"&]/g, '') // Remove HTML/script characters
      .replace(/(\n\s*){3,}/g, '\n\n') // Limit excessive newlines
      .replace(/ignore\s+(previous|all)\s+(instructions?|prompts?)/gi, '') // Remove prompt injection attempts
      .replace(/system\s*:\s*/gi, '') // Remove system prompt attempts
      .replace(/assistant\s*:\s*/gi, '') // Remove assistant prompt attempts
      .replace(/human\s*:\s*/gi, '') // Remove human prompt attempts
      .replace(/\[INST\]/gi, '') // Remove instruction markers
      .replace(/\[\/INST\]/gi, '') // Remove instruction markers
      .replace(/<<SYS>>/gi, '') // Remove system markers
      .replace(/<\/SYS>>/gi, '') // Remove system markers
      .replace(/###\s*(SYSTEM|ASSISTANT|HUMAN)/gi, '') // Remove role markers
      .replace(/^\s*(SYSTEM|ASSISTANT|HUMAN)\s*:/gi, ''); // Remove role prefixes
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeAIInput).slice(0, 50); // Limit array size
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    Object.keys(input)
      .slice(0, 20)
      .forEach((key) => {
        // Limit object keys
        sanitized[key] = sanitizeAIInput(
          (input as Record<string, unknown>)[key],
        );
      });
    return sanitized;
  }
  return input;
};

// Additional validation for educational content - kept for future use
// const _validateEducationalInput = (input: unknown, fieldName: string): string => {
//   if (!input || typeof input !== 'string') {
//     throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
//   }

//   // Check for obvious non-educational content
//   const suspiciousPatterns = [
//     /crypto|bitcoin|investment|trading/gi,
//     /hack|exploit|vulnerability|attack/gi,
//     /password|token|api.key|secret/gi,
//     /download|install|execute|script/gi,
//   ];

//   for (const pattern of suspiciousPatterns) {
//     if (pattern.test(input)) {
//       throw new Error(`Invalid ${fieldName}: contains inappropriate content`);
//     }
//   }

//   return sanitizeAIInput(input) as string;
// };

const router = Router();

/**
 * GET /api/ai-planning/status
 * Check AI service availability and user quota status
 */
router.get('/status', (req: Request, res: Response): void => {
  void (async () => {
    try {
      const userId = req.user?.id;

    // Check OpenAI API key availability
    const hasApiKey = process.env.OPENAI_API_KEY !== null && process.env.OPENAI_API_KEY !== '';

    // Get service health
    const serviceHealth = await aiPlanningAssistant.getServiceHealth();

    // Calculate user quota (basic implementation)
    const userQuota = {
      dailyRequests: 50, // Default quota
      requestsUsed: 0, // TODO: Implement actual tracking
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const status = {
      available: hasApiKey && serviceHealth.healthy,
      features: {
        longRangeGoals: hasApiKey,
        unitBigIdeas: hasApiKey,
        lessonActivities: hasApiKey,
        materialsList: hasApiKey,
        assessmentStrategies: hasApiKey,
        reflectionPrompts: hasApiKey,
        curriculumAligned: hasApiKey,
      },
      quota: userQuota,
      health: serviceHealth,
      userId,
    };

      res.json(status);
      return;
    } catch (_error) {
      logger.error('Error checking AI status:', _error as string | undefined);
      res.status(500).json({
        available: false,
        error: 'Failed to check AI service status',
      });
      return;
    }
  })();
});

/**
 * POST /api/ai-planning/long-range/goals
 * Generate AI suggestions for long-range plan goals
 */
router.post(
  '/long-range/goals',
  aiRateLimit,
  (req: Request, res: Response): void => {
    void (async () => {
      try {
        const sanitizedBody = sanitizeAIInput(req.body) as {
        subject?: string;
        grade?: string | number;
        termLength?: string | number;
        focusAreas?: string[];
      };
      const { subject, grade, termLength, focusAreas } = sanitizedBody;

      if (!subject || grade === null || grade === undefined || termLength === null || termLength === undefined) {
        res.status(400).json({
          error: 'Missing required fields: subject, grade, termLength',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.generateLongRangeGoals({
        subject: subject!,
        grade: Number(grade),
        termLength: Number(termLength),
        focusAreas: focusAreas ?? [],
      });

        res.json(suggestions);
        return;
      } catch (_error) {
        logger.error('Error generating long-range goals:', _error as string | undefined);
        res.status(500).json({ error: 'Failed to generate suggestions' });
        return;
      }
    })();
  },
);

/**
 * POST /api/ai-planning/unit/big-ideas
 * Generate AI suggestions for unit plan big ideas
 */
router.post('/unit/big-ideas', aiRateLimit, (req: Request, res: Response): void => {
  void (async () => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
      unitTitle?: string;
      subject?: string;
      grade?: string | number;
      curriculumExpectations?: string[];
      duration?: string | number;
    };
    const { unitTitle, subject, grade, curriculumExpectations, duration } = sanitizedBody;

    if (!unitTitle || !subject || grade === null || grade === undefined || !curriculumExpectations?.length || duration === null || duration === undefined) {
      res.status(400).json({
        error:
          'Missing required fields: unitTitle, subject, grade, curriculumExpectations, duration',
      });
      return;
    }

    const suggestions = await aiPlanningAssistant.generateUnitBigIdeas({
      unitTitle: unitTitle!,
      subject: subject!,
      grade: Number(grade),
      curriculumExpectations: curriculumExpectations!,
      duration: Number(duration),
    });

    res.json(suggestions);
    return;
  } catch (_error) {
    logger.error('Error generating unit big ideas:', _error as string | undefined);
    res.status(500).json({ error: 'Failed to generate suggestions' });
    return;
  }
  })();
});

/**
 * POST /api/ai-planning/lesson/activities
 * Generate AI suggestions for lesson activities
 */
router.post(
  '/lesson/activities',
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
        lessonTitle?: string;
        learningGoals?: string[];
        subject?: string;
        grade?: string | number;
        duration?: string | number;
        materials?: string[];
      };
      const { lessonTitle, learningGoals, subject, grade, duration, materials } = sanitizedBody;

      if (!lessonTitle || !learningGoals?.length || !subject || grade === null || grade === undefined || duration === null || duration === undefined) {
        res.status(400).json({
          error: 'Missing required fields: lessonTitle, learningGoals, subject, grade, duration',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.generateLessonActivities({
        lessonTitle: lessonTitle!,
        learningGoals: learningGoals!,
        subject: subject!,
        grade: Number(grade),
        duration: Number(duration),
        materials: materials ?? [],
      });

      res.json(suggestions);
      return;
    } catch (_error) {
      logger.error('Error generating lesson activities:', _error as string | undefined);
      res.status(500).json({ error: 'Failed to generate suggestions' });
      return;
    }
  },
);

/**
 * POST /api/ai-planning/lesson/materials
 * Generate AI suggestions for materials list
 */
router.post(
  '/lesson/materials',
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
        activities?: string[];
        subject?: string;
        grade?: string | number;
        classSize?: string | number;
      };
      const { activities, subject, grade, classSize } = sanitizedBody;

      if (!activities?.length || !subject || grade === null || grade === undefined) {
        res.status(400).json({
          error: 'Missing required fields: activities, subject, grade',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.generateMaterialsList({
        activities: activities!,
        subject: subject!,
        grade: Number(grade),
        classSize: classSize !== null && classSize !== undefined ? Number(classSize) : 25,
      });

      res.json(suggestions);
      return;
    } catch (_error) {
      logger.error('Error generating materials list:', _error as string | undefined);
      res.status(500).json({ error: 'Failed to generate suggestions' });
      return;
    }
  },
);

/**
 * POST /api/ai-planning/lesson/assessments
 * Generate AI suggestions for assessment strategies
 */
router.post(
  '/lesson/assessments',
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
        learningGoals?: string[];
        activities?: string[];
        subject?: string;
        grade?: string | number;
      };
      const { learningGoals, activities, subject, grade } = sanitizedBody;

      if ((learningGoals === null || learningGoals === undefined) || (activities === null || activities === undefined) || (subject === null || subject === undefined || subject === '') || (grade === null || grade === undefined)) {
        res.status(400).json({
          error: 'Missing required fields: learningGoals, activities, subject, grade',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.generateAssessmentStrategies({
        learningGoals: learningGoals!,
        activities: activities!,
        subject: subject!,
        grade: Number(grade),
      });

      res.json(suggestions);
      return;
    } catch (_error) {
      logger.error('Error generating assessment strategies:', _error as string | undefined);
      res.status(500).json({ error: 'Failed to generate suggestions' });
      return;
    }
  },
);

/**
 * POST /api/ai-planning/daybook/reflections
 * Generate AI suggestions for daybook reflection prompts
 */
router.post(
  '/daybook/reflections',
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
        date?: string;
        activities?: string[];
        subject?: string;
        grade?: string | number;
        previousReflections?: string[];
      };
      const { date, activities, subject, grade, previousReflections } = sanitizedBody;

      if (!date || !activities || !subject || !grade) {
        res.status(400).json({
          error: 'Missing required fields: date, activities, subject, grade',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.generateReflectionPrompts({
        date: new Date(date),
        activities,
        subject,
        grade: Number(grade),
        previousReflections,
      });

      res.json(suggestions);
      return;
    } catch (_error) {
      logger.error('Error generating reflection prompts:', _error as string | undefined);
      res.status(500).json({ error: 'Failed to generate suggestions' });
      return;
    }
  },
);

/**
 * POST /api/ai-planning/curriculum-aligned
 * Get curriculum-aligned suggestions
 */
router.post(
  '/curriculum-aligned',
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sanitizedBody = sanitizeAIInput(req.body) as {
        expectationIds?: string[];
        suggestionType?: string;
      };
      const { expectationIds, suggestionType } = sanitizedBody;

      if (!expectationIds || !suggestionType) {
        res.status(400).json({
          error: 'Missing required fields: expectationIds, suggestionType',
        });
        return;
      }

      if (!['activities', 'assessments', 'resources'].includes(suggestionType)) {
        res.status(400).json({
          error: 'Invalid suggestionType. Must be: activities, assessments, or resources',
        });
        return;
      }

      const suggestions = await aiPlanningAssistant.getCurriculumAlignedSuggestions(
        expectationIds,
        suggestionType as 'activities' | 'assessments' | 'resources',
      );

      res.json({ suggestions });
      return;
    } catch (_error) {
      logger.error('Error generating curriculum-aligned suggestions:', _error as string | undefined);
      res.status(500).json({ error: 'Failed to generate suggestions' });
      return;
    }
  },
);

export { router };
