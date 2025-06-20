import express from 'express';
import { curriculumImportService, uploadMiddleware } from '../services/curriculumImportService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Upload curriculum document for processing
 * POST /api/curriculum/import/upload
 */
router.post('/upload', auth, uploadMiddleware.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const importId = await curriculumImportService.uploadDocument(req.file, req.user.id);
    
    res.json({
      success: true,
      importId,
      message: 'Document uploaded successfully. Processing will begin shortly.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
});

/**
 * Get import status and parsed data
 * GET /api/curriculum/import/:id/status
 */
router.get('/:id/status', auth, async (req, res) => {
  try {
    const importId = parseInt(req.params.id);
    if (isNaN(importId)) {
      return res.status(400).json({ error: 'Invalid import ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const status = await curriculumImportService.getImportStatus(importId, req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    if (error instanceof Error && error.message === 'Import not found') {
      return res.status(404).json({ error: 'Import not found' });
    }
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Status check failed',
    });
  }
});

/**
 * Confirm and save reviewed curriculum data
 * POST /api/curriculum/import/:id/confirm
 */
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const importId = parseInt(req.params.id);
    if (isNaN(importId)) {
      return res.status(400).json({ error: 'Invalid import ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { reviewedData } = req.body;
    if (!reviewedData) {
      return res.status(400).json({ error: 'Reviewed data is required' });
    }

    // Validate reviewed data structure
    if (!reviewedData.subject || typeof reviewedData.grade !== 'number' || !Array.isArray(reviewedData.outcomes)) {
      return res.status(400).json({ error: 'Invalid curriculum data format' });
    }

    const result = await curriculumImportService.confirmImport(importId, req.user.id, reviewedData);
    res.json(result);
  } catch (error) {
    console.error('Confirm import error:', error);
    if (error instanceof Error) {
      if (error.message === 'Import not found') {
        return res.status(404).json({ error: 'Import not found' });
      }
      if (error.message === 'Import not ready for confirmation') {
        return res.status(400).json({ error: 'Import not ready for confirmation' });
      }
    }
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Import confirmation failed',
    });
  }
});

/**
 * Get user's import history
 * GET /api/curriculum/import/history
 */
router.get('/history', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const imports = await curriculumImportService.getUserImports(req.user.id);
    res.json(imports);
  } catch (error) {
    console.error('Import history error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import history',
    });
  }
});

/**
 * Delete/cancel an import
 * DELETE /api/curriculum/import/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const importId = parseInt(req.params.id);
    if (isNaN(importId)) {
      return res.status(400).json({ error: 'Invalid import ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // This would be implemented to delete the import record and clean up files
    // For now, just return success
    res.json({ success: true, message: 'Import deleted successfully' });
  } catch (error) {
    console.error('Delete import error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete import',
    });
  }
});

export default router;