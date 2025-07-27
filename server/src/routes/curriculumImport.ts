import type { Request, Response } from 'express';
import type express from 'express';
import { Router } from 'express';
import multer, { memoryStorage } from 'multer';

import { logger } from '../logger';
import { asyncHandler } from '../middleware/errorHandler';
import { curriculumImportService } from '../services';
// Clustering service removed - over-engineered for single-teacher use

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

// Configure multer for file uploads with enhanced security
const upload = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only allow 1 file per request
    fields: 10, // Limit number of fields
  },
  fileFilter: (_req, file, cb: multer.FileFilterCallback) => {
    // Sanitize filename
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedFilename !== file.originalname) {
      file.originalname = sanitizedFilename;
    }

    // Check file extension as well as MIME type
    const allowedExtensions = ['.csv', '.pdf', '.docx'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    const allowedTypes = [
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Some browsers send this for DOCX
    ];

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only CSV, PDF, and DOCX files are allowed. Received: ${file.mimetype} with extension ${fileExtension}`,
        ),
      );
    }
  },
});

// POST /api/curriculum/import/upload - Upload and parse curriculum file (Planner agent style)
router.post(
  '/upload',
  upload.single('file') as unknown as express.RequestHandler,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No file uploaded',
        });
        return;
      }

      if (!req.user?.id) {
        res.status(401).json({
          error: 'User not authenticated',
        });
        return;
      }

      // Additional file validation
      if (req.file.size === 0) {
        res.status(400).json({
          error: 'File is empty',
        });
        return;
      }

      // Validate file buffer is not null
      if (!req.file.buffer || req.file.buffer.length === 0) {
        res.status(400).json({
          error: 'Invalid file content',
        });
        return;
      }

      // Start import session
      let sourceFormat: 'pdf' | 'docx' | 'csv' | 'manual' = 'manual';
      if (req.file.mimetype === 'application/pdf') {
        sourceFormat = 'pdf';
      } else if (
        req.file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        sourceFormat = 'docx';
      } else if (req.file.mimetype === 'text/csv') {
        sourceFormat = 'csv';
      }

      if (req.user === null || req.user === undefined) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const importId = await curriculumImportService.startImport(
        req.user.id,
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
      return;
    } catch (_error) {
      logger.error('Upload error:', _error);
      res.status(500).json({
        error: _error instanceof Error ? _error.message : 'Failed to process upload',
      });
    }
  }),
);

// POST /api/curriculum/import/parse - Parse uploaded file
router.post('/parse', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, useAiExtraction } = req.body;

    if (sessionId === null || sessionId === undefined || sessionId === '') {
      res.status(400).json({
        error: 'Session ID is required',
      });
      return;
    }

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    // Parse the uploaded file
    const parseResult = await curriculumImportService.parseUploadedFile(sessionId, {
      userId: req.user.id,
      filename: sessionId,
      useAI: useAiExtraction ?? true,
    });

    res.json({
      message: 'File parsed successfully',
      subjects: parseResult.subjects,
      errors: parseResult.errors ?? [],
    });
    return;
  } catch (_error) {
    logger.error('Parse error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to parse file',
    });
    return;
  }
}));

// POST /api/curriculum/import/import-preset - Load preset curriculum
router.post('/import-preset', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { presetId } = req.body;

    if (presetId === null || presetId === undefined || presetId === '') {
      res.status(400).json({
        error: 'Preset ID is required',
      });
      return;
    }

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    // Load preset curriculum
    const presetResult = await curriculumImportService.loadPresetCurriculum(req.user.id, presetId);

    res.json({
      sessionId: presetResult.sessionId,
      message: 'Preset curriculum loaded successfully',
      subjects: presetResult.subjects,
    });
    return;
  } catch (_error) {
    logger.error('Preset load error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to load preset curriculum',
    });
    return;
  }
}));

// GET /api/curriculum/import/:id/status - Check import status
router.get('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const importId = req.params.id;

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    const status = await curriculumImportService.getImportProgress(importId);

    if (status === null || status === undefined) {
      res.status(404).json({
        error: 'Import not found',
      });
      return;
    }

    res.json(status);
    return;
  } catch (_error) {
    logger.error('Status check error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to get import status',
    });
    return;
  }
}));

// POST /api/curriculum/import/:id/confirm - Confirm and finalize import
router.post('/:id/confirm', asyncHandler(async (req: Request, res: Response) => {
  try {
    const importId = req.params.id;

    if (req.user?.id === null || req.user?.id === undefined || req.user.id === 0) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    // Check if import exists and is ready
    const progress = await curriculumImportService.getImportProgress(importId);

    if (progress === null || progress === undefined) {
      res.status(404).json({
        error: 'Import not found',
      });
      return;
    }

    if (progress.status !== 'READY_FOR_REVIEW') {
      res.status(400).json({
        error: 'Import is not ready to be confirmed',
      });
      return;
    }

    // Confirm the import and create expectations
    const result = await curriculumImportService.confirmImport(importId);

    res.json({
      message: 'Import confirmed successfully',
      importId,
      created: result.created,
    });
    return;
  } catch (_error) {
    logger.error('Confirm import error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to confirm import',
    });
    return;
  }
}));

// GET /api/curriculum/import/history - Get user's import history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    // Parse limit with proper NaN checking
    const parsedLimit = parseInt(req.query.limit as string, 10);
    const limit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    // Note: offset is not supported by the service method yet

    const history = await curriculumImportService.getImportHistory(req.user.id, limit);

    res.json(history);
    return;
  } catch (_error) {
    logger.error('History error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to get import history',
    });
  }
});

// DELETE /api/curriculum/import/:id - Delete import and associated data
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const importId = req.params.id;

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    const result = await curriculumImportService.cancelImport(importId);

    if (result === false) {
      res.status(404).json({
        error: 'Import not found',
      });
      return;
    }

    res.json({ message: 'Import deleted successfully' });
    return;
  } catch (_error) {
    logger.error('Delete import error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to delete import',
    });
  }
});

// Start a new curriculum import session
router.post('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { grade, subject, sourceFormat } = req.body;

    if (grade === null || grade === undefined || grade === '' || subject === null || subject === undefined || subject === '' || sourceFormat === null || sourceFormat === undefined || sourceFormat === '') {
      res.status(400).json({ error: 'Missing required fields: grade, subject, sourceFormat' });
      return;
    }

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const importId = await curriculumImportService.startImport(
      req.user.id,
      grade,
      subject,
      sourceFormat,
    );

    res.json({ importId, message: 'Import session started successfully' });
    return;
  } catch (_error) {
    logger.error({ error: _error }, 'Failed to start curriculum import');
    res.status(500).json({ error: 'Failed to start import session' });
  }
});

// Get import progress
router.get('/:importId/progress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { importId } = req.params;
    const progress = await curriculumImportService.getImportProgress(importId);

    if (progress === null || progress === undefined) {
      res.status(404).json({ error: 'Import session not found' });
      return;
    }

    res.json(progress);
    return;
  } catch (_error) {
    logger.error({ error: _error }, 'Failed to get import progress');
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Cancel an import session
router.post('/:importId/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const { importId } = req.params;
    const success = await curriculumImportService.cancelImport(importId);

    if (success === false) {
      res.status(404).json({ error: 'Import session not found or already completed' });
      return;
    }

    res.json({ message: 'Import cancelled successfully' });
    return;
  } catch (_error) {
    logger.error({ error: _error }, 'Failed to cancel import');
    res.status(500).json({ error: 'Failed to cancel import' });
  }
});

// POST /api/curriculum/import/:id - Finalize import and create curriculum expectations
router.post('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const importId = req.params.id;

    if (req.user?.id === null || req.user?.id === undefined) {
      res.status(401).json({
        error: 'User not authenticated',
      });
      return;
    }

    // Get the import session
    const importRecord = await curriculumImportService.getImportProgress(importId);

    if (importRecord === null || importRecord === undefined) {
      res.status(404).json({
        error: 'Import session not found',
      });
      return;
    }

    if (importRecord.status !== 'READY_FOR_REVIEW') {
      res.status(400).json({
        error: 'Import is not ready to be finalized',
      });
      return;
    }

    // Finalize the import and create curriculum expectations
    const result = await curriculumImportService.finalizeImport(importId, req.user.id);

    res.json({
      message: 'Curriculum imported successfully',
      totalExpectations: result.totalExpectations,
      subjects: result.subjects,
    });
    return;
  } catch (_error) {
    logger.error('Finalize import error:', _error);
    res.status(500).json({
      error: _error instanceof Error ? _error.message : 'Failed to finalize import',
    });
  }
});

// Clustering routes removed - over-engineered for single-teacher use

export { router };
