import { Router } from 'express';
import multer from 'multer';
import { curriculumImportService } from '../services/curriculumImportService';
import { clusteringService } from '../services/clusteringService';
import logger from '../logger';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, PDF, and DOCX files are allowed.'));
    }
  },
});

// Start a new curriculum import session
router.post('/start', async (req, res, next) => {
  try {
    const { grade, subject, sourceFormat } = req.body;

    if (!grade || !subject || !sourceFormat) {
      return res.status(400).json({ error: 'Missing required fields: grade, subject, sourceFormat' });
    }

    const importId = await curriculumImportService.startImport(
      1, // TODO: Get userId from auth context
      grade,
      subject,
      sourceFormat
    );

    res.json({ importId, message: 'Import session started successfully' });
  } catch (error) {
    logger.error({ error }, 'Failed to start curriculum import');
    next(error);
  }
});

// Upload and process curriculum file
router.post('/:importId/upload', upload.single('file'), async (req, res, next) => {
  try {
    const { importId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let outcomes;
    
    // Parse file based on type
    if (file.mimetype === 'text/csv') {
      const csvContent = file.buffer.toString('utf-8');
      outcomes = curriculumImportService.parseCSV(csvContent);
    } else if (file.mimetype === 'application/pdf') {
      // TODO: Implement PDF parsing
      return res.status(501).json({ error: 'PDF parsing not yet implemented' });
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // TODO: Implement DOCX parsing
      return res.status(501).json({ error: 'DOCX parsing not yet implemented' });
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Process the import
    const result = await curriculumImportService.processImport(importId, outcomes);

    res.json({
      message: 'Import completed successfully',
      ...result,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to process curriculum upload');
    next(error);
  }
});

// Process manual outcome entries
router.post('/:importId/outcomes', async (req, res, next) => {
  try {
    const { importId } = req.params;
    const { outcomes } = req.body;

    if (!Array.isArray(outcomes) || outcomes.length === 0) {
      return res.status(400).json({ error: 'Outcomes must be a non-empty array' });
    }

    // Validate outcome structure
    for (const outcome of outcomes) {
      if (!outcome.code || !outcome.description || !outcome.subject || outcome.grade === undefined) {
        return res.status(400).json({ 
          error: 'Each outcome must have code, description, subject, and grade' 
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
    next(error);
  }
});

// Get import progress
router.get('/:importId/progress', async (req, res, next) => {
  try {
    const { importId } = req.params;
    const progress = await curriculumImportService.getImportProgress(importId);

    if (!progress) {
      return res.status(404).json({ error: 'Import session not found' });
    }

    res.json(progress);
  } catch (error) {
    logger.error({ error }, 'Failed to get import progress');
    next(error);
  }
});

// Cancel an import session
router.post('/:importId/cancel', async (req, res, next) => {
  try {
    const { importId } = req.params;
    const success = await curriculumImportService.cancelImport(importId);

    if (!success) {
      return res.status(404).json({ error: 'Import session not found or already completed' });
    }

    res.json({ message: 'Import cancelled successfully' });
  } catch (error) {
    logger.error({ error }, 'Failed to cancel import');
    next(error);
  }
});

// Get import history
router.get('/history', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const history = await curriculumImportService.getImportHistory(
      1, // TODO: Get userId from auth context
      Number(limit)
    );

    res.json(history);
  } catch (error) {
    logger.error({ error }, 'Failed to get import history');
    next(error);
  }
});

// Trigger clustering for an import
router.post('/:importId/cluster', async (req, res, next) => {
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
    next(error);
  }
});

// Re-cluster with different parameters
router.post('/:importId/recluster', async (req, res, next) => {
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
    next(error);
  }
});

// Get clusters for an import
router.get('/:importId/clusters', async (req, res, next) => {
  try {
    const { importId } = req.params;
    const clusters = await clusteringService.getClusters(importId);

    res.json(clusters);
  } catch (error) {
    logger.error({ error }, 'Failed to get clusters');
    next(error);
  }
});

// Analyze cluster quality
router.get('/:importId/clusters/quality', async (req, res, next) => {
  try {
    const { importId } = req.params;
    const analysis = await clusteringService.analyzeClusterQuality(importId);

    res.json(analysis);
  } catch (error) {
    logger.error({ error }, 'Failed to analyze cluster quality');
    next(error);
  }
});

export default router;