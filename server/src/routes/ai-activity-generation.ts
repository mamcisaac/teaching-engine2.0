import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { AIActivityGeneratorService } from '../services/aiActivityGeneratorService';
import { ActivityDiscoveryService } from '../services/activityDiscoveryService';

const router = Router();
const aiGenerator = new AIActivityGeneratorService();
const activityService = new ActivityDiscoveryService();

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

// Schema for activity enhancement request
const enhanceActivitySchema = z.object({
  activityId: z.string(),
  enhancements: z.object({
    addDifferentiation: z.boolean().optional(),
    addAssessment: z.boolean().optional(),
    adaptForGrade: z.number().min(1).max(8).optional(),
    translateTo: z.string().optional(),
    alignToCurriculum: z.array(z.string()).optional(),
  }),
});

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
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const params = generateActivitySchema.parse(req.body);
    let searchResults = undefined;

    // If requested, perform a search first to get inspiration
    if (params.useSearchResults && (params.searchQuery || params.lessonContext)) {
      const searchParams = {
        query: params.searchQuery || params.lessonContext?.title || '',
        gradeLevel: params.lessonContext?.grade,
        subject: params.lessonContext?.subject,
        language: params.specificRequirements?.language || 'fr',
        limit: 5,
      };

      const results = await activityService.search(searchParams, Number(req.user!.id));
      searchResults = results;
    }

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
  } catch (error) {
    console.error('Error generating activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate activity',
    });
  }
});

/**
 * Generate multiple activity variations
 */
router.post('/generate-variations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const params = generateActivitySchema.parse(req.body);
    const count = Math.min(req.body.count || 3, 5); // Max 5 variations

    let searchResults = undefined;

    // If requested, perform a search first
    if (params.useSearchResults && (params.searchQuery || params.lessonContext)) {
      const searchParams = {
        query: params.searchQuery || params.lessonContext?.title || '',
        gradeLevel: params.lessonContext?.grade,
        subject: params.lessonContext?.subject,
        language: params.specificRequirements?.language || 'fr',
        limit: 10,
      };

      const results = await activityService.search(searchParams, Number(req.user!.id));
      searchResults = results;
    }

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
  } catch (error) {
    console.error('Error generating activity variations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate activity variations',
    });
  }
});

/**
 * Enhance an existing activity
 */
router.post('/enhance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const params = enhanceActivitySchema.parse(req.body);

    // Get the activity details
    const activityDetails = await activityService.getActivityDetails(params.activityId);

    if (!activityDetails) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
    }

    // Enhance the activity
    const enhancements = await aiGenerator.enhanceActivity(activityDetails, params.enhancements);

    res.json({
      success: true,
      data: enhancements,
    });
  } catch (error) {
    console.error('Error enhancing activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enhance activity',
    });
  }
});

/**
 * Save a generated activity
 */
router.post('/save', authMiddleware, async (req: Request, res: Response) => {
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
    const savedActivity = await aiGenerator.saveGeneratedActivity(
      activityWithDefaults,
      Number(req.user!.id),
      params.metadata,
    );

    res.json({
      success: true,
      data: savedActivity,
    });
  } catch (error) {
    console.error('Error saving generated activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save generated activity',
    });
  }
});

export default router;
