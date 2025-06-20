import express from 'express';
import multer from 'multer';
import { curriculumImportService } from '../services/curriculumImportService';
import { clusteringService } from '../services/clusteringService';
import logger from '../logger';

// Get auth from the extended request
interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
  };
}

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, PDF, and DOCX files are allowed.'));
    }
  },
});

// POST /api/curriculum/import/upload - Upload and parse curriculum file (Planner agent style)
router.post('/upload', upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const result = await curriculumImportService.processUpload(req.file, parseInt(req.user.userId));

    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process upload',
    });
  }
});

// GET /api/curriculum/import/:id/status - Check import status
router.get('/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const importId = req.params.id;

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const status = await curriculumImportService.getImportStatus(
      importId,
      parseInt(req.user.userId),
    );

    if (!status) {
      return res.status(404).json({
        error: 'Import not found',
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import status',
    });
  }
});

// POST /api/curriculum/import/:id/confirm - Confirm and finalize import
router.post('/:id/confirm', async (req: AuthenticatedRequest, res) => {
  try {
    const importId = req.params.id;

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const result = await curriculumImportService.confirmImport(importId, parseInt(req.user.userId));

    res.json(result);
  } catch (error) {
    console.error('Confirm import error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to confirm import',
    });
  }
});

// GET /api/curriculum/import/history - Get user's import history
router.get('/history', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await curriculumImportService.getImportHistory(parseInt(req.user.userId), {
      limit,
      offset,
    });

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import history',
    });
  }
});

// GET /api/curriculum/import/:id/outcomes - Get outcomes from import
router.get('/:id/outcomes', async (req: AuthenticatedRequest, res) => {
  try {
    const importId = req.params.id;

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const outcomes = await curriculumImportService.getImportOutcomes(
      importId,
      parseInt(req.user.userId),
    );

    res.json(outcomes);
  } catch (error) {
    console.error('Get outcomes error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import outcomes',
    });
  }
});

// DELETE /api/curriculum/import/:id - Delete import and associated data
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const importId = req.params.id;

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const result = await curriculumImportService.deleteImport(importId, parseInt(req.user.userId));

    if (!result) {
      return res.status(404).json({
        error: 'Import not found',
      });
    }

    res.json({ message: 'Import deleted successfully' });
  } catch (error) {
    console.error('Delete import error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete import',
    });
  }
});

// Phase 5 Routes - Additional clustering functionality

// Start a new curriculum import session
router.post('/start', async (req: AuthenticatedRequest, res) => {
  try {
    const { grade, subject, sourceFormat } = req.body;

    if (!grade || !subject || !sourceFormat) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: grade, subject, sourceFormat' });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const importId = await curriculumImportService.startImport(
      parseInt(req.user.userId),
      grade,
      subject,
      sourceFormat,
    );

    res.json({ importId, message: 'Import session started successfully' });
  } catch (error) {
    logger.error({ error }, 'Failed to start curriculum import');
    res.status(500).json({ error: 'Failed to start import session' });
  }
});

// Process manual outcome entries
router.post('/:importId/outcomes', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const { outcomes } = req.body;

    if (!Array.isArray(outcomes) || outcomes.length === 0) {
      return res.status(400).json({ error: 'Outcomes must be a non-empty array' });
    }

    // Validate outcome structure
    for (const outcome of outcomes) {
      if (
        !outcome.code ||
        !outcome.description ||
        !outcome.subject ||
        outcome.grade === undefined
      ) {
        return res.status(400).json({
          error: 'Each outcome must have code, description, subject, and grade',
        });
      }
    }

    const result = await curriculumImportService.processImport(importId, outcomes);

    res.json({
      message: 'Outcomes imported successfully',
      ...result,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to process manual outcomes');
    res.status(500).json({ error: 'Failed to process outcomes' });
  }
});

// Get import progress
router.get('/:importId/progress', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const progress = await curriculumImportService.getImportProgress(importId);

    if (!progress) {
      return res.status(404).json({ error: 'Import session not found' });
    }

    res.json(progress);
  } catch (error) {
    logger.error({ error }, 'Failed to get import progress');
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Cancel an import session
router.post('/:importId/cancel', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const success = await curriculumImportService.cancelImport(importId);

    if (!success) {
      return res.status(404).json({ error: 'Import session not found or already completed' });
    }

    res.json({ message: 'Import cancelled successfully' });
  } catch (error) {
    logger.error({ error }, 'Failed to cancel import');
    res.status(500).json({ error: 'Failed to cancel import' });
  }
});

// Clustering Routes (Phase 5)

// Trigger clustering for an import
router.post('/:importId/cluster', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const { options = {} } = req.body;

    const clusters = await clusteringService.clusterOutcomes(importId, options);

    res.json({
      message: 'Clustering completed successfully',
      clusters,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to cluster outcomes');
    res.status(500).json({ error: 'Failed to cluster outcomes' });
  }
});

// Re-cluster with different parameters
router.post('/:importId/recluster', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const { options = {} } = req.body;

    const clusters = await clusteringService.reclusterOutcomes(importId, options);

    res.json({
      message: 'Re-clustering completed successfully',
      clusters,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to re-cluster outcomes');
    res.status(500).json({ error: 'Failed to re-cluster outcomes' });
  }
});

// Get clusters for an import
router.get('/:importId/clusters', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const clusters = await clusteringService.getClusters(importId);

    res.json(clusters);
  } catch (error) {
    logger.error({ error }, 'Failed to get clusters');
    res.status(500).json({ error: 'Failed to get clusters' });
  }
});

// Analyze cluster quality
router.get('/:importId/clusters/quality', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const analysis = await clusteringService.analyzeClusterQuality(importId);

    res.json(analysis);
  } catch (error) {
    logger.error({ error }, 'Failed to analyze cluster quality');
    res.status(500).json({ error: 'Failed to analyze cluster quality' });
  }
});

export default router;
