/**
 * Example route handler using structured logging
 * This demonstrates best practices for logging in route handlers
 */

import type { Response, NextFunction } from 'express';
import { Router } from 'express';

import { authenticate } from '../middleware/authenticate';
import { prisma } from '../prisma';
import { getUserId } from '../utils/authHelpers';
import { structuredLogger, PerformanceLogger } from '../utils/logger-migration';
import { withLoggingContext } from '../utils/structuredLogger';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

/**
 * Example: Basic route with structured logging
 */
router.get('/api/example/basic', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) {
return;
}

  // Log the incoming request with context
  structuredLogger.info('Processing example request', {
    userId,
    query: req.query,
  });

  try {
    // Simulate some work
    const result = someBusinessLogic(userId);

    // Log success with relevant data
    structuredLogger.info('Example request completed successfully', {
      userId,
      resultSize: result.length,
    });

    res.json({ data: result });
    return;
  } catch (error: unknown) {
    // Log error with full context
    structuredLogger.error('Failed to process example request', error as Error, {
      userId,
      query: req.query,
    });

    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

/**
 * Example: Route with performance logging
 */
router.get('/api/example/performance', authenticate, async (_req: AuthenticatedRequest, res: Response) => {
  const perfLogger = new PerformanceLogger('example.performance');

  try {
    // Step 1: Database query
    const dbPerfLogger = new PerformanceLogger('example.database.query');
    const users = await prisma.user.findMany({ take: 10 });
    dbPerfLogger.end({ recordCount: users.length });

    // Step 2: External API call
    const apiPerfLogger = new PerformanceLogger('example.external.api');
    const apiResult = simulateExternalApiCall();
    apiPerfLogger.end({ statusCode: apiResult.status });

    // Step 3: Data processing
    const processPerfLogger = new PerformanceLogger('example.data.processing');
    const processed = processData(users, apiResult);
    processPerfLogger.end({ outputSize: processed.length });

    perfLogger.end({
      totalRecords: processed.length,
      success: true,
    });

    res.json({ data: processed });
    return;
  } catch (error: unknown) {
    perfLogger.end({ success: false, error: (error as Error).message });

    structuredLogger.error('Performance example failed', error as Error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

/**
 * Example: Route with child logger context
 */
router.post('/api/example/batch', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const batchId = `batch-${Date.now()}`;

  const userId = getUserId(req, res);
  if (!userId) {
return;
}

  // Create child logger with batch context
  const batchLogger = structuredLogger.child({
    batchId,
    userId,
    itemCount: req.body.items?.length || 0,
  });

  batchLogger.info('Starting batch processing');

  const results = [];
  const errors = [];

  for (const [index, item] of req.body.items.entries()) {
    // Create child logger for each item
    const itemLogger = batchLogger.child({
      itemId: item.id,
      itemIndex: index,
    });

    try {
      itemLogger.debug('Processing item');

      const result = processItem(item);
      results.push(result);

      itemLogger.info('Item processed successfully');
    } catch (error: unknown) {
      itemLogger.error('Failed to process item', error as Error);
      errors.push({ itemId: item.id, error: (error as Error).message });
    }
  }

  batchLogger.info('Batch processing completed', {
    successCount: results.length,
    errorCount: errors.length,
  });

  res.json({
    batchId,
    results,
    errors,
  });
  return;
});

/**
 * Example: Route with correlation context
 */
router.post(
  '/api/example/workflow',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workflowId = `workflow-${Date.now()}`;

    // Run entire workflow with additional context
    await withLoggingContext({ workflowId, stage: 'initialization' }, async () => {
      structuredLogger.info('Starting workflow');

      try {
        // Stage 1: Validation
        await withLoggingContext({ stage: 'validation' }, async () => {
          structuredLogger.debug('Validating input');
          validateWorkflowInput(req.body);
          structuredLogger.info('Validation completed');
        });

        // Stage 2: Processing
        await withLoggingContext({ stage: 'processing' }, async () => {
          structuredLogger.debug('Processing workflow');
          const result = processWorkflow(req.body);
          structuredLogger.info('Processing completed', { resultId: result.id });

          res.json({ workflowId, result });
          return;
        });
      } catch (error: unknown) {
        structuredLogger.error('Workflow failed', error as Error, { workflowId });
        next(error);
      }
    });
  },
);

/**
 * Example: Streaming endpoint with progress logging
 */
router.get('/api/example/stream', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const streamId = `stream-${Date.now()}`;
  
  const userId = getUserId(req, res);
  if (!userId) {
return;
}
  
  const streamLogger = structuredLogger.child({ streamId, userId });

  streamLogger.info('Starting stream');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let processed = 0;
  const total = 100;

  const interval = setInterval(() => {
    processed += 10;

    const progress = Math.min(processed / total, 1);

    streamLogger.debug('Stream progress', {
      processed,
      total,
      progress: `${(progress * 100).toFixed(1)}%`,
    });

    res.write(`data: ${JSON.stringify({ progress, processed, total })}\n\n`);

    if (processed >= total) {
      streamLogger.info('Stream completed', { totalProcessed: processed });
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    streamLogger.warn('Stream closed by client', { processed, completed: processed >= total });
    clearInterval(interval);
  });
});

// Helper functions
function someBusinessLogic(userId: number): string[] {
  return [`item-${userId}-1`, `item-${userId}-2`];
}

function simulateExternalApiCall(): { status: number; data: { message: string } } {
  return { status: 200, data: { message: 'Success' } };
}

function processData(users: { id: number; name: string }[], apiResult: { data: unknown }): { id: number; name: string; apiData: unknown }[] {
  return users.map((u) => ({ ...u, apiData: apiResult.data }));
}

function processItem(item: Record<string, unknown>): Record<string, unknown> {
  return { ...item, processed: true };
}

function validateWorkflowInput(input: { name?: string }): void {
  if (!input.name) {
throw new Error('Name is required');
}
}

function processWorkflow(input: Record<string, unknown>): Record<string, unknown> {
  return { id: Date.now(), ...input, status: 'completed' };
}

export { router };
