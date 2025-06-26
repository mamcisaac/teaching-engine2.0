import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { curriculumDiscoveryService } from '../services/curriculumDiscoveryService';

const router = Router();

// Validation schemas
const DiscoveryFilterSchema = z.object({
  province: z.string().optional(),
  grade: z.coerce.number().int().min(0).max(12).optional(),
  subject: z.string().optional(),
  language: z.enum(['en', 'fr', 'both']).optional(),
  documentType: z.enum(['curriculum', 'guideline', 'assessment', 'resource']).optional(),
  downloadStatus: z.enum(['pending', 'downloaded', 'processed', 'failed']).optional(),
});

const ProcessDocumentSchema = z.object({
  documentId: z.string().min(1),
  userId: z.coerce.number().int().positive().optional(),
});

/**
 * Start discovery process for curriculum documents
 * POST /api/curriculum-discovery/discover
 */
router.post('/discover', authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    
    res.json({
      success: true,
      message: 'Discovery process started',
      data: {
        status: 'initiated',
        userId,
        timestamp: new Date().toISOString(),
      },
    });

    // Start discovery process in background
    curriculumDiscoveryService
      .discoverDocuments()
      .then((documents) => {
        console.log(`Discovery completed: ${documents.length} documents found`);
      })
      .catch((error) => {
        console.error('Discovery process failed:', error);
      });
  } catch (error) {
    console.error('Discovery initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start discovery process',
    });
  }
});

/**
 * Get discovered curriculum documents
 * GET /api/curriculum-discovery/documents
 */
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    const filterResult = DiscoveryFilterSchema.safeParse(req.query);
    
    if (!filterResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filter parameters',
        details: filterResult.error.errors,
      });
    }

    const filter = filterResult.data;
    const documents = curriculumDiscoveryService.getDocumentsByFilter(filter);

    res.json({
      success: true,
      data: {
        documents,
        total: documents.length,
        filter,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve discovered documents',
    });
  }
});

/**
 * Get discovery statistics
 * GET /api/curriculum-discovery/stats
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = curriculumDiscoveryService.getDiscoveryStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve discovery statistics',
    });
  }
});

/**
 * Download a specific curriculum document
 * POST /api/curriculum-discovery/download
 */
router.post('/download', authMiddleware, async (req, res) => {
  try {
    const { documentId } = z.object({
      documentId: z.string().min(1),
    }).parse(req.body);

    const result = await curriculumDiscoveryService.downloadDocument(documentId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          documentId,
          filePath: result.filePath,
          message: 'Document downloaded successfully',
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Download failed',
        data: { documentId },
      });
    }
  } catch (error) {
    console.error('Download document error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to download document',
    });
  }
});

/**
 * Process a downloaded document into curriculum import
 * POST /api/curriculum-discovery/process
 */
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const parseResult = ProcessDocumentSchema.parse(req.body);
    const userId = parseResult.userId || Number(req.user!.userId);
    const { documentId } = parseResult;

    const result = await curriculumDiscoveryService.processDocument(documentId, userId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          documentId,
          importId: result.importId,
          message: 'Document processed successfully',
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Processing failed',
        data: { documentId },
      });
    }
  } catch (error) {
    console.error('Process document error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to process document',
    });
  }
});

/**
 * Download and process a document in one step
 * POST /api/curriculum-discovery/download-and-process
 */
router.post('/download-and-process', authMiddleware, async (req, res) => {
  try {
    const { documentId } = z.object({
      documentId: z.string().min(1),
    }).parse(req.body);

    const userId = Number(req.user!.userId);

    // Step 1: Download document
    const downloadResult = await curriculumDiscoveryService.downloadDocument(documentId);
    if (!downloadResult.success) {
      return res.status(400).json({
        success: false,
        error: `Download failed: ${downloadResult.error}`,
        data: { documentId, step: 'download' },
      });
    }

    // Step 2: Process document
    const processResult = await curriculumDiscoveryService.processDocument(documentId, userId);
    if (!processResult.success) {
      return res.status(400).json({
        success: false,
        error: `Processing failed: ${processResult.error}`,
        data: { documentId, step: 'process' },
      });
    }

    res.json({
      success: true,
      data: {
        documentId,
        importId: processResult.importId,
        filePath: downloadResult.filePath,
        message: 'Document downloaded and processed successfully',
      },
    });
  } catch (error) {
    console.error('Download and process error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to download and process document',
    });
  }
});

/**
 * Verify document availability
 * POST /api/curriculum-discovery/verify
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { documentId } = z.object({
      documentId: z.string().min(1),
    }).parse(req.body);

    const isAvailable = await curriculumDiscoveryService.verifyDocument(documentId);

    res.json({
      success: true,
      data: {
        documentId,
        isAvailable,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to verify document',
    });
  }
});

/**
 * Remove a discovered document
 * DELETE /api/curriculum-discovery/documents/:documentId
 */
router.delete('/documents/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required',
      });
    }

    const removed = curriculumDiscoveryService.removeDiscoveredDocument(documentId);

    if (removed) {
      res.json({
        success: true,
        data: {
          documentId,
          message: 'Document removed from discovery results',
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found',
        data: { documentId },
      });
    }
  } catch (error) {
    console.error('Remove document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove document',
    });
  }
});

/**
 * Get discovery sources and their status
 * GET /api/curriculum-discovery/sources
 */
router.get('/sources', authMiddleware, async (req, res) => {
  try {
    // This would be implemented if sources were stored in database
    // For now, return static information about configured sources
    const sources = [
      {
        id: 'pei-gov',
        name: 'Prince Edward Island Department of Education',
        province: 'PE',
        isActive: true,
        lastScanDate: null,
        documentCount: curriculumDiscoveryService.getDocumentsByFilter({ province: 'PE' }).length,
      },
      {
        id: 'ontario-edu',
        name: 'Ontario Ministry of Education',
        province: 'ON',
        isActive: true,
        lastScanDate: null,
        documentCount: curriculumDiscoveryService.getDocumentsByFilter({ province: 'ON' }).length,
      },
      {
        id: 'bc-gov',
        name: 'British Columbia Ministry of Education',
        province: 'BC',
        isActive: true,
        lastScanDate: null,
        documentCount: curriculumDiscoveryService.getDocumentsByFilter({ province: 'BC' }).length,
      },
    ];

    res.json({
      success: true,
      data: {
        sources,
        totalSources: sources.length,
        activeSources: sources.filter(s => s.isActive).length,
      },
    });
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve discovery sources',
    });
  }
});

/**
 * Batch operations for multiple documents
 * POST /api/curriculum-discovery/batch
 */
router.post('/batch', authMiddleware, async (req, res) => {
  try {
    const { operation, documentIds } = z.object({
      operation: z.enum(['download', 'process', 'download-and-process', 'verify']),
      documentIds: z.array(z.string().min(1)).min(1).max(10), // Limit batch size
    }).parse(req.body);

    const userId = Number(req.user!.userId);
    const results: Array<{
      documentId: string;
      success: boolean;
      data?: unknown;
      error?: string;
    }> = [];

    for (const documentId of documentIds) {
      try {
        let result: { success: boolean; [key: string]: unknown };

        switch (operation) {
          case 'download':
            result = await curriculumDiscoveryService.downloadDocument(documentId);
            break;
          case 'process':
            result = await curriculumDiscoveryService.processDocument(documentId, userId);
            break;
          case 'download-and-process': {
            const downloadResult = await curriculumDiscoveryService.downloadDocument(documentId);
            if (downloadResult.success) {
              result = await curriculumDiscoveryService.processDocument(documentId, userId);
              result.filePath = downloadResult.filePath;
            } else {
              result = downloadResult;
            }
            break;
          }
          case 'verify': {
            const isAvailable = await curriculumDiscoveryService.verifyDocument(documentId);
            result = { success: true, isAvailable };
            break;
          }
          default:
            result = { success: false, error: 'Unknown operation' };
        }

        results.push({
          documentId,
          success: result.success,
          data: result.success ? result : undefined,
          error: result.success ? undefined : (result.error as string),
        });
      } catch (error) {
        results.push({
          documentId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Add delay between batch operations to avoid overwhelming sources
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      data: {
        operation,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
        },
      },
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to perform batch operation',
    });
  }
});

export default router;