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

    // Start import session
    let sourceFormat: 'pdf' | 'docx' | 'csv' | 'manual' = 'manual';
    if (req.file.mimetype === 'application/pdf') {
      sourceFormat = 'pdf';
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      sourceFormat = 'docx';
    } else if (req.file.mimetype === 'text/csv') {
      sourceFormat = 'csv';
    }

    const importId = await curriculumImportService.startImport(
      parseInt(req.user.userId),
      1, // Default grade, can be updated later
      'General', // Default subject, can be updated later
      sourceFormat,
    );

    // Store file content for parsing
    await curriculumImportService.storeUploadedFile(importId, req.file);

    res.json({
      sessionId: importId,
      message: 'File uploaded successfully',
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process upload',
    });
  }
});

// POST /api/curriculum/import/parse - Parse uploaded file
router.post('/parse', async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId, useAiExtraction } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required',
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    // Parse the uploaded file
    const parseResult = await curriculumImportService.parseUploadedFile(sessionId, {
      useAI: useAiExtraction || true,
    });

    res.json({
      message: 'File parsed successfully',
      subjects: parseResult.subjects,
      errors: parseResult.errors || [],
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to parse file',
    });
  }
});

// POST /api/curriculum/import/import-preset - Load preset curriculum
router.post('/import-preset', async (req: AuthenticatedRequest, res) => {
  try {
    const { presetId } = req.body;

    if (!presetId) {
      return res.status(400).json({
        error: 'Preset ID is required',
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    // Load preset curriculum
    const presetResult = await curriculumImportService.loadPresetCurriculum(
      parseInt(req.user.userId),
      presetId,
    );

    res.json({
      sessionId: presetResult.sessionId,
      message: 'Preset curriculum loaded successfully',
      subjects: presetResult.subjects,
    });
  } catch (error) {
    console.error('Preset load error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load preset curriculum',
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

    const status = await curriculumImportService.getImportProgress(importId);

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

    // Check if import exists and is ready
    const progress = await curriculumImportService.getImportProgress(importId);

    if (!progress) {
      return res.status(404).json({
        error: 'Import not found',
      });
    }

    if (progress.status !== 'READY_FOR_REVIEW') {
      return res.status(400).json({
        error: 'Import is not ready to be confirmed',
      });
    }

    // Confirm the import and create expectations
    const result = await curriculumImportService.confirmImport(importId);

    res.json({
      message: 'Import confirmed successfully',
      importId,
      created: result.created,
    });
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
    // Note: offset is not supported by the service method yet

    const history = await curriculumImportService.getImportHistory(
      parseInt(req.user.userId),
      limit,
    );

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import history',
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

    const result = await curriculumImportService.cancelImport(importId);

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

// POST /api/curriculum/import/:id - Finalize import and create curriculum expectations
router.post('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const importId = req.params.id;

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    // Get the import session
    const importRecord = await curriculumImportService.getImportProgress(importId);

    if (!importRecord) {
      return res.status(404).json({
        error: 'Import session not found',
      });
    }

    if (importRecord.status !== 'READY_FOR_REVIEW') {
      return res.status(400).json({
        error: 'Import is not ready to be finalized',
      });
    }

    // Finalize the import and create curriculum expectations
    const result = await curriculumImportService.finalizeImport(importId, parseInt(req.user.userId));

    res.json({
      message: 'Curriculum imported successfully',
      totalExpectations: result.totalExpectations,
      subjects: result.subjects,
    });
  } catch (error) {
    console.error('Finalize import error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to finalize import',
    });
  }
});

// Clustering Routes (Phase 5)

// Trigger clustering for an import
router.post('/:importId/cluster', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const { options = {} } = req.body;

    const clusters = await clusteringService.clusterExpectations(importId, options);

    res.json({
      message: 'Clustering completed successfully',
      clusters,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to cluster expectations');
    res.status(500).json({ error: 'Failed to cluster expectations' });
  }
});

// Re-cluster with different parameters
router.post('/:importId/recluster', async (req: AuthenticatedRequest, res) => {
  try {
    const { importId } = req.params;
    const { options = {} } = req.body;

    const clusters = await clusteringService.reclusterExpectations(importId, options);

    res.json({
      message: 'Re-clustering completed successfully',
      clusters,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to re-cluster expectations');
    res.status(500).json({ error: 'Failed to re-cluster expectations' });
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
