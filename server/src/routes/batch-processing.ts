import { Router, Request } from 'express';
import { z } from 'zod';
import { validate, cuidSchema } from '../validation';
import { batchProcessingService } from '../services/batchProcessingService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas for batch operations
const unitPlanBatchSchema = z.object({
  title: z.string().min(1).max(255),
  longRangePlanId: cuidSchema(),
  description: z.string().max(2000).optional(),
  bigIdeas: z.string().max(2000).optional(),
  essentialQuestions: z.array(z.string().max(500)).max(20).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  estimatedHours: z.number().int().positive().max(1000).optional(),
  assessmentPlan: z.string().max(2000).optional(),
  successCriteria: z.array(z.string().max(500)).max(20).optional(),
  expectationIds: z.array(cuidSchema()).max(50).min(1),
  crossCurricularConnections: z.string().max(1000).optional(),
  learningSkills: z.array(z.string().max(100)).max(10).optional(),
  culminatingTask: z.string().max(1000).optional(),
  keyVocabulary: z.array(z.string().max(100)).max(30).optional(),
  priorKnowledge: z.string().max(1000).optional(),
  parentCommunicationPlan: z.string().max(1000).optional(),
  fieldTripsAndGuestSpeakers: z.string().max(1000).optional(),
  differentiationStrategies: z.object({
    forStruggling: z.array(z.string().max(200)).max(10).optional(),
    forAdvanced: z.array(z.string().max(200)).max(10).optional(),
    forELL: z.array(z.string().max(200)).max(10).optional(),
    forIEP: z.array(z.string().max(200)).max(10).optional(),
  }).optional(),
  indigenousPerspectives: z.string().max(1000).optional(),
  environmentalEducation: z.string().max(1000).optional(),
  socialJusticeConnections: z.string().max(1000).optional(),
  technologyIntegration: z.string().max(1000).optional(),
  communityConnections: z.string().max(1000).optional(),
});

const lessonPlanBatchSchema = z.object({
  title: z.string().min(1).max(255),
  unitPlanId: cuidSchema(),
  date: z.string().datetime(),
  duration: z.number().int().min(5).max(480),
  mindsOn: z.string().max(2000).optional(),
  action: z.string().max(2000).optional(),
  consolidation: z.string().max(2000).optional(),
  learningGoals: z.string().max(1000).optional(),
  materials: z.array(z.string().max(200)).max(30).optional(),
  grouping: z.string().max(500).optional(),
  accommodations: z.array(z.string().max(200)).max(20).optional(),
  modifications: z.array(z.string().max(200)).max(20).optional(),
  extensions: z.array(z.string().max(200)).max(20).optional(),
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']).optional(),
  assessmentNotes: z.string().max(1000).optional(),
  isSubFriendly: z.boolean().default(false),
  subNotes: z.string().max(500).optional(),
  expectationIds: z.array(cuidSchema()).max(20).optional(),
});

const batchOperationSchema = z.object({
  operations: z.array(
    z.object({
      type: z.enum(['unit', 'lesson', 'expectation', 'resource']),
      data: z.unknown(), // Will be validated based on type
    })
  ).max(100, 'Maximum 100 operations per batch'),
  options: z.object({
    batchSize: z.number().int().min(1).max(20).default(10),
    maxRetries: z.number().int().min(0).max(5).default(3),
    retryDelay: z.number().int().min(100).max(10000).default(1000),
  }).optional(),
});

// Add operations to batch queue
router.post('/operations', validate(batchOperationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { operations, options: _options = {} } = req.body;

    // Validate each operation based on its type
    const validatedOperations = [];
    for (const operation of operations) {
      let validatedData;
      
      switch (operation.type) {
        case 'unit': {
          const unitResult = unitPlanBatchSchema.safeParse(operation.data);
          if (!unitResult.success) {
            return res.status(400).json({
              error: 'Invalid unit plan data',
              details: unitResult.error.errors,
            });
          }
          validatedData = unitResult.data;
          break;
        }
          
        case 'lesson': {
          const lessonResult = lessonPlanBatchSchema.safeParse(operation.data);
          if (!lessonResult.success) {
            return res.status(400).json({
              error: 'Invalid lesson plan data',
              details: lessonResult.error.errors,
            });
          }
          validatedData = lessonResult.data;
          break;
        }
          
        default:
          return res.status(400).json({
            error: `Unsupported operation type: ${operation.type}`,
          });
      }

      validatedOperations.push({
        type: operation.type,
        data: validatedData,
      });
    }

    // Validate the batch before adding to queue
    const validation = await batchProcessingService.validateBatch(
      validatedOperations.map(op => ({
        ...op,
        id: '',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Batch validation failed',
        details: validation.errors,
        warnings: validation.warnings,
      });
    }

    // Add operations to queue
    const operationIds = await batchProcessingService.addOperations(validatedOperations, userId);

    res.status(201).json({
      message: 'Operations added to batch queue',
      operationIds,
      count: operationIds.length,
      warnings: validation.warnings,
    });
  } catch (error) {
    next(error);
  }
});

// Process batch operations
router.post('/process', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { batchSize = 10, maxRetries = 3, retryDelay = 1000 } = req.body;

    // Validate processing options
    if (batchSize < 1 || batchSize > 20) {
      return res.status(400).json({ error: 'Batch size must be between 1 and 20' });
    }

    if (maxRetries < 0 || maxRetries > 5) {
      return res.status(400).json({ error: 'Max retries must be between 0 and 5' });
    }

    if (retryDelay < 100 || retryDelay > 10000) {
      return res.status(400).json({ error: 'Retry delay must be between 100 and 10000 ms' });
    }

    const result = await batchProcessingService.processBatch(userId, {
      batchSize,
      maxRetries,
      retryDelay,
    });

    res.json({
      message: 'Batch processing completed',
      successful: result.successful,
      failed: result.failed,
      totalProcessed: result.successful + result.failed,
    });
  } catch (error) {
    if (error.message.includes('already in progress')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

// Get batch processing status
router.get('/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = batchProcessingService.getBatchStatus(userId);

    res.json({
      isProcessing: status.isProcessing,
      queueLength: status.queueLength,
      operations: status.operations.map(op => ({
        id: op.id,
        type: op.type,
        status: op.status,
        progress: op.progress || 0,
        errors: op.errors || [],
        retryCount: op.retryCount || 0,
        createdAt: op.createdAt,
        updatedAt: op.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Clear completed operations
router.delete('/completed', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    batchProcessingService.clearCompletedOperations(userId);

    res.json({ message: 'Completed operations cleared from queue' });
  } catch (error) {
    next(error);
  }
});

// Health check for batch processing service
router.get('/health', async (req: AuthenticatedRequest, res, next) => {
  try {
    const health = await batchProcessingService.healthCheck();
    
    res.status(health.healthy ? 200 : 503).json(health);
  } catch (error) {
    next(error);
  }
});

export default router;