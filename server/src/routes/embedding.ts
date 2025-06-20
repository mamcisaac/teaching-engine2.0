import { Router } from 'express';
import { embeddingService } from '../services/embeddingService';
import { clusteringService } from '../services/clusteringService';
import { prisma } from '../prisma';
import logger from '../logger';

const router = Router();

// Generate embedding for a single outcome
router.post('/outcomes/:outcomeId', async (req, res, next) => {
  try {
    const { outcomeId } = req.params;

    // Get outcome text
    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
      select: { code: true, description: true },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }

    const text = `${outcome.code}: ${outcome.description}`;
    const result = await embeddingService.generateEmbedding(outcomeId, text);

    if (!result) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    res.json({
      message: 'Embedding generated successfully',
      outcomeId: result.outcomeId,
      model: result.model,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate embedding');
    next(error);
  }
});

// Generate embeddings for multiple outcomes
router.post('/outcomes/batch', async (req, res, next) => {
  try {
    const { outcomeIds } = req.body;

    if (!Array.isArray(outcomeIds) || outcomeIds.length === 0) {
      return res.status(400).json({ error: 'outcomeIds must be a non-empty array' });
    }

    // Get outcome texts
    const outcomes = await prisma.outcome.findMany({
      where: { id: { in: outcomeIds } },
      select: { id: true, code: true, description: true },
    });

    if (outcomes.length === 0) {
      return res.status(404).json({ error: 'No outcomes found' });
    }

    const outcomeData = outcomes.map(o => ({
      id: o.id,
      text: `${o.code}: ${o.description}`,
    }));

    const results = await embeddingService.generateBatchEmbeddings(outcomeData);

    res.json({
      message: 'Embeddings generated successfully',
      total: outcomeIds.length,
      generated: results.length,
      results: results.map(r => ({
        outcomeId: r.outcomeId,
        model: r.model,
      })),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate batch embeddings');
    next(error);
  }
});

// Get embedding for an outcome
router.get('/outcomes/:outcomeId', async (req, res, next) => {
  try {
    const { outcomeId } = req.params;
    const embedding = await embeddingService.getEmbedding(outcomeId);

    if (!embedding) {
      return res.status(404).json({ error: 'Embedding not found' });
    }

    res.json({
      outcomeId,
      embeddingSize: embedding.length,
      hasEmbedding: true,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get embedding');
    next(error);
  }
});

// Find similar outcomes
router.get('/outcomes/:outcomeId/similar', async (req, res, next) => {
  try {
    const { outcomeId } = req.params;
    const { threshold = 0.8, limit = 10 } = req.query;

    const suggestions = await clusteringService.suggestSimilarOutcomes(
      outcomeId,
      Number(threshold),
      Number(limit)
    );

    res.json(suggestions);
  } catch (error) {
    logger.error({ error }, 'Failed to find similar outcomes');
    next(error);
  }
});

// Calculate similarity between two outcomes
router.post('/similarity', async (req, res, next) => {
  try {
    const { outcomeId1, outcomeId2 } = req.body;

    if (!outcomeId1 || !outcomeId2) {
      return res.status(400).json({ error: 'Both outcomeId1 and outcomeId2 are required' });
    }

    const embedding1 = await embeddingService.getEmbedding(outcomeId1);
    const embedding2 = await embeddingService.getEmbedding(outcomeId2);

    if (!embedding1 || !embedding2) {
      return res.status(404).json({ error: 'One or both embeddings not found' });
    }

    const similarity = embeddingService.calculateSimilarity(embedding1, embedding2);

    res.json({
      outcomeId1,
      outcomeId2,
      similarity,
      similarityPercentage: Math.round(similarity * 100),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to calculate similarity');
    next(error);
  }
});

// Cleanup old embeddings
router.delete('/cleanup', async (req, res, next) => {
  try {
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({ error: 'Model parameter is required' });
    }

    const deletedCount = await embeddingService.cleanupOldEmbeddings(model);

    res.json({
      message: 'Cleanup completed successfully',
      deletedCount,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup embeddings');
    next(error);
  }
});

// Get embedding statistics
router.get('/stats', async (req, res, next) => {
  try {
    const totalOutcomes = await prisma.outcome.count();
    const embeddingsCount = await prisma.outcomeEmbedding.count();
    const embeddingsByModel = await prisma.outcomeEmbedding.groupBy({
      by: ['model'],
      _count: true,
    });

    res.json({
      totalOutcomes,
      embeddingsCount,
      coveragePercentage: Math.round((embeddingsCount / totalOutcomes) * 100),
      embeddingsByModel: embeddingsByModel.map(item => ({
        model: item.model,
        count: item._count,
      })),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get embedding stats');
    next(error);
  }
});

export default router;