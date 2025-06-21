import { Router, Request, Response } from 'express';
import { requireAdminToken } from '../middleware/auth';
import { embeddingService } from '../services/embeddingService';
import logger from '../logger';

const router = Router();

/**
 * @api {get} /embeddings/status Get embedding service status
 * @apiName GetEmbeddingStatus
 * @apiGroup Embeddings
 * @apiDescription Check if the embedding service is available and get statistics
 * 
 * @apiSuccess {Boolean} available Whether the embedding service is available
 * @apiSuccess {Number} totalOutcomes Total number of outcomes in the system
 * @apiSuccess {Number} embeddedOutcomes Number of outcomes with embeddings
 * @apiSuccess {Number} missingEmbeddings Number of outcomes without embeddings
 * @apiSuccess {String} model The embedding model being used
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const available = embeddingService.isEmbeddingServiceAvailable();
    
    if (!available) {
      return res.json({
        available: false,
        message: 'OpenAI API key not configured',
      });
    }

    // Get embedding statistics
    const { prisma } = await import('../prisma');
    
    const totalOutcomes = await prisma.outcome.count();
    const embeddedOutcomes = await prisma.outcomeEmbedding.count();
    
    res.json({
      available: true,
      totalOutcomes,
      embeddedOutcomes,
      missingEmbeddings: totalOutcomes - embeddedOutcomes,
      model: 'text-embedding-3-small',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get embedding status');
    res.status(500).json({ error: 'Failed to get embedding status' });
  }
});

/**
 * @api {post} /embeddings/generate Generate missing embeddings
 * @apiName GenerateEmbeddings
 * @apiGroup Embeddings
 * @apiDescription Generate embeddings for all outcomes that don't have them yet
 * @apiPermission admin
 * 
 * @apiHeader {String} Authorization Admin token required
 * 
 * @apiParam {Boolean} [forceRegenerate=false] Regenerate all embeddings even if they exist
 * 
 * @apiSuccess {Number} generated Number of embeddings generated
 * @apiSuccess {String} message Success message
 */
router.post('/generate', requireAdminToken, async (req: Request, res: Response) => {
  try {
    if (!embeddingService.isEmbeddingServiceAvailable()) {
      return res.status(503).json({ 
        error: 'Embedding service not available',
        message: 'OpenAI API key not configured' 
      });
    }

    const { forceRegenerate = false } = req.body;
    
    logger.info({ forceRegenerate }, 'Starting embedding generation');
    
    const generated = await embeddingService.generateMissingEmbeddings(forceRegenerate);
    
    res.json({
      generated,
      message: `Successfully generated ${generated} embeddings`,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate embeddings');
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

/**
 * @api {get} /embeddings/similar/:outcomeId Find similar outcomes
 * @apiName FindSimilarOutcomes
 * @apiGroup Embeddings
 * @apiDescription Find outcomes similar to a given outcome based on embeddings
 * 
 * @apiParam {String} outcomeId The ID of the outcome to find similar outcomes for
 * @apiParam {Number} [limit=10] Maximum number of similar outcomes to return
 * 
 * @apiSuccess {Array} results Array of similar outcomes with similarity scores
 * @apiSuccess {Object} results.outcome The similar outcome
 * @apiSuccess {Number} results.similarity Similarity score (0-1)
 */
router.get('/similar/:outcomeId', async (req: Request, res: Response) => {
  try {
    if (!embeddingService.isEmbeddingServiceAvailable()) {
      return res.status(503).json({ 
        error: 'Embedding service not available',
        message: 'OpenAI API key not configured' 
      });
    }

    const { outcomeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const results = await embeddingService.findSimilarOutcomes(outcomeId, limit);
    
    res.json({ results });
  } catch (error) {
    logger.error({ error }, 'Failed to find similar outcomes');
    res.status(500).json({ error: 'Failed to find similar outcomes' });
  }
});

/**
 * @api {post} /embeddings/search Search outcomes by text
 * @apiName SearchOutcomes
 * @apiGroup Embeddings
 * @apiDescription Search for outcomes similar to a text query
 * 
 * @apiParam {String} query The text query to search for
 * @apiParam {Number} [limit=10] Maximum number of results to return
 * 
 * @apiSuccess {Array} results Array of matching outcomes with similarity scores
 * @apiSuccess {Object} results.outcome The matching outcome
 * @apiSuccess {Number} results.similarity Similarity score (0-1)
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    if (!embeddingService.isEmbeddingServiceAvailable()) {
      return res.status(503).json({ 
        error: 'Embedding service not available',
        message: 'OpenAI API key not configured' 
      });
    }

    const { query, limit = 10 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query text is required' });
    }
    
    const results = await embeddingService.searchOutcomesByText(query, limit);
    
    res.json({ results });
  } catch (error) {
    logger.error({ error }, 'Failed to search outcomes');
    res.status(500).json({ error: 'Failed to search outcomes' });
  }
});

/**
 * @api {post} /embeddings/outcome/:outcomeId Generate embedding for specific outcome
 * @apiName GenerateOutcomeEmbedding
 * @apiGroup Embeddings
 * @apiDescription Generate or regenerate embedding for a specific outcome
 * @apiPermission admin
 * 
 * @apiHeader {String} Authorization Admin token required
 * 
 * @apiParam {String} outcomeId The ID of the outcome to generate embedding for
 * 
 * @apiSuccess {Object} embedding The generated embedding
 * @apiSuccess {String} message Success message
 */
router.post('/outcome/:outcomeId', requireAdminToken, async (req: Request, res: Response) => {
  try {
    if (!embeddingService.isEmbeddingServiceAvailable()) {
      return res.status(503).json({ 
        error: 'Embedding service not available',
        message: 'OpenAI API key not configured' 
      });
    }

    const { outcomeId } = req.params;
    
    // Get the outcome
    const { prisma } = await import('../prisma');
    
    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
    });
    
    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }
    
    const embedding = await embeddingService.getOrCreateOutcomeEmbedding(outcome);
    
    res.json({
      embedding: {
        id: embedding.id,
        outcomeId: embedding.outcomeId,
        model: embedding.model,
        dimensions: embedding.dimensions,
        createdAt: embedding.createdAt,
        updatedAt: embedding.updatedAt,
      },
      message: 'Embedding generated successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate outcome embedding');
    res.status(500).json({ error: 'Failed to generate outcome embedding' });
  }
});

export default router;