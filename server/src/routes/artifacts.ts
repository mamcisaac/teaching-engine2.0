/**
 * Student Artifacts API Routes
 * Handles artifact upload, management, and curriculum outcome tagging
 */

import { createHash } from 'crypto';
import { prisma } from '../prisma';

import type { Prisma } from '@teaching-engine/database';
import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

import { logger } from '../logger';
import { 
  artifactUploadRateLimit,
  bulkOperationRateLimit 
} from '../middleware/rateLimit/artifactRateLimit';
import { 
  uploadStudentPhoto,
  uploadStudentVideo, 
  uploadStudentAudio,
  uploadStudentDocument,
  uploadMultipleArtifacts,
  mobileArtifactUpload,
  validateArtifactUpload,
  validateQuickNote,
  handleUploadErrors
} from '../middleware/upload';
import { getFileProcessingService } from '../services/fileProcessingService';
import { getStorageService } from '../services/storage';

const router = Router();

// Types
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  artifact?: Record<string, unknown>; // Artifact data attached by middleware
}

interface ArtifactOutcome {
  outcomeId: string;
  evidenceType: string;
  teacherNote?: string;
  confidenceLevel?: string;
  contextualFactors?: string;
}

// Validation middleware
const validateArtifactId = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Artifact ID is required')
];

const validateOutcomeTagging = [
  body('outcomeId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Outcome ID is required'),
  
  body('evidenceType')
    .isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT'])
    .withMessage('Evidence type must be one of: OBSERVATION, CONVERSATION, PRODUCT'),
  
  body('teacherNote')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Teacher note must be less than 1000 characters'),
  
  body('confidenceLevel')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Confidence level must be one of: LOW, MEDIUM, HIGH'),
  
  body('contextualFactors')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Contextual factors must be less than 500 characters')
];

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// Authentication middleware
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Artifact ownership middleware
const validateArtifactOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const artifactId = req.params.id;
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const artifact = await prisma.studentArtifact.findFirst({
      where: {
        id: artifactId,
        userId: userId
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      }
    });

    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found or access denied' });
      return;
    }

    // Attach artifact to request for use in handlers (properly typed via express.d.ts)
    req.artifact = artifact;
    next();
  } catch (error: unknown) {
    logger.error({ error }, 'Artifact ownership validation error:');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/artifacts/upload/photo
 * Upload a photo artifact
 * Rate limited to 10 uploads per minute per student
 */
router.post('/upload/photo',
  requireAuth,
  artifactUploadRateLimit, // Rate limiting applied
  ...(uploadStudentPhoto as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await handleArtifactUpload(req, res, 'PHOTO');
    } catch (error: unknown) {
      logger.error({ error }, 'Photo upload error:');
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  }
);

/**
 * POST /api/artifacts/upload/video
 * Upload a video artifact
 * Rate limited to prevent abuse
 */
router.post('/upload/video',
  requireAuth,
  artifactUploadRateLimit,
  ...(uploadStudentVideo as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await handleArtifactUpload(req, res, 'VIDEO');
    } catch (error: unknown) {
      logger.error({ error }, 'Video upload error:');
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
);

/**
 * POST /api/artifacts/upload/audio
 * Upload an audio artifact
 * Rate limited to prevent abuse
 */
router.post('/upload/audio',
  requireAuth,
  artifactUploadRateLimit,
  ...(uploadStudentAudio as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await handleArtifactUpload(req, res, 'AUDIO');
    } catch (error: unknown) {
      logger.error({ error }, 'Audio upload error:');
      res.status(500).json({ error: 'Failed to upload audio' });
    }
  }
);

/**
 * POST /api/artifacts/upload/document
 * Upload a document artifact
 * Rate limited to prevent abuse
 */
router.post('/upload/document',
  requireAuth,
  artifactUploadRateLimit,
  ...(uploadStudentDocument as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await handleArtifactUpload(req, res, 'DOCUMENT');
    } catch (error: unknown) {
      logger.error({ error }, 'Document upload error:');
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

/**
 * POST /api/artifacts/upload/mobile
 * Mobile-friendly upload for photos/videos from camera
 * Rate limited to prevent abuse
 */
router.post('/upload/mobile',
  requireAuth,
  artifactUploadRateLimit,
  ...(mobileArtifactUpload as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Determine artifact type based on uploaded file
      const uploadResult = req.uploadResults[0];
      if (!uploadResult) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const artifactType = uploadResult.mimeType.startsWith('image/') ? 'PHOTO' : 'VIDEO';
      await handleArtifactUpload(req, res, artifactType);
    } catch (error: unknown) {
      logger.error({ error }, 'Mobile upload error:');
      res.status(500).json({ error: 'Failed to upload from mobile' });
    }
  }
);

/**
 * POST /api/artifacts/upload/batch
 * Upload multiple artifacts at once
 * Uses bulk operation rate limit
 */
router.post('/upload/batch',
  requireAuth,
  bulkOperationRateLimit,
  ...(uploadMultipleArtifacts as RequestHandler[]),
  validateArtifactUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const uploadResults = req.uploadResults || [];
      if (uploadResults.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const artifacts = [];
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const fileProcessingService = getFileProcessingService();

      for (const uploadResult of uploadResults) {
        // Process file metadata
        const buffer = Buffer.from(''); // In real implementation, get actual buffer
        const metadata = await fileProcessingService.processFile(
          buffer, 
          uploadResult.originalName, 
          uploadResult.mimeType
        );

        // Create artifact record
        const artifact = await prisma.studentArtifact.create({
          data: {
            userId: userId,
            studentId: req.body.studentId,
            artifactType: uploadResult.category.toUpperCase(),
            title: req.body.title || `${uploadResult.category} - ${uploadResult.originalName}`,
            description: req.body.description,
            filePath: uploadResult.path,
            fileName: uploadResult.originalName,
            fileSize: uploadResult.size,
            mimeType: uploadResult.mimeType,
            metadata: JSON.stringify(metadata),
            collectionContext: req.body.collectionContext,
            tags: req.body.tags || undefined,
            dateCollected: req.body.dateCollected ? new Date(req.body.dateCollected) : new Date(),
            isPrivate: req.body.isPrivate || false
          }
        });

        artifacts.push(artifact);
      }

      res.status(201).json({
        message: `Successfully uploaded ${artifacts.length} artifacts`,
        artifacts: artifacts.map(artifact => ({
          id: artifact.id,
          title: artifact.title,
          artifactType: artifact.artifactType,
          filePath: artifact.filePath,
          dateCollected: artifact.dateCollected
        }))
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Batch upload error:');
      res.status(500).json({ error: 'Failed to upload artifacts' });
    }
  }
);

/**
 * POST /api/artifacts/note
 * Create a text-only note artifact
 */
router.post('/note',
  requireAuth,
  validateQuickNote,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const artifact = await prisma.studentArtifact.create({
        data: {
          userId: userId,
          studentId: req.body.studentId,
          artifactType: 'NOTE',
          title: req.body.title,
          description: req.body.description,
          textContent: req.body.textContent,
          collectionContext: req.body.collectionContext,
          tags: req.body.tags || undefined,
          dateCollected: req.body.dateCollected ? new Date(req.body.dateCollected) : new Date(),
          isPrivate: req.body.isPrivate || false
        }
      });

      res.status(201).json({
        id: artifact.id,
        title: artifact.title,
        artifactType: artifact.artifactType,
        textContent: artifact.textContent,
        dateCollected: artifact.dateCollected,
        createdAt: artifact.createdAt
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Note creation error:');
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
);

/**
 * GET /api/artifacts
 * List artifacts with filtering and pagination
 */
router.get('/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const {
        studentId,
        artifactType,
        outcomeId,
        search,
        dateFrom,
        dateTo,
        isPrivate,
        page = '1',
        limit = '20'
      } = req.query;

      // Build where clause
      const where: Prisma.StudentArtifactWhereInput = {
        userId: userId
      };

      if (studentId) {
        where.studentId = studentId as string;
      }

      if (artifactType) {
        where.artifactType = artifactType as string;
      }

      if (outcomeId) {
        where.outcomes = {
          some: {
            outcomeId: outcomeId as string
          }
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { textContent: { contains: search as string } }
        ];
      }

      if (dateFrom || dateTo) {
        where.dateCollected = {};
        if (dateFrom) where.dateCollected.gte = new Date(dateFrom as string);
        if (dateTo) where.dateCollected.lte = new Date(dateTo as string);
      }

      if (typeof isPrivate === 'string') {
        where.isPrivate = isPrivate === 'true';
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Get artifacts with related data
      const [artifacts, total] = await Promise.all([
        prisma.studentArtifact.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { dateCollected: 'desc' },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            outcomes: {
              include: {
                outcome: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    subject: true,
                    strand: true
                  }
                }
              }
            }
          }
        }),
        prisma.studentArtifact.count({ where })
      ]);

      // Format response
      const formattedArtifacts = artifacts.map(artifact => ({
        id: artifact.id,
        title: artifact.title,
        description: artifact.description,
        artifactType: artifact.artifactType,
        filePath: artifact.filePath,
        fileName: artifact.fileName,
        fileSize: artifact.fileSize,
        mimeType: artifact.mimeType,
        textContent: artifact.textContent,
        collectionContext: artifact.collectionContext,
        dateCollected: artifact.dateCollected,
        isPrivate: artifact.isPrivate,
        tags: artifact.tags ? JSON.parse(artifact.tags as string) : null,
        processingStatus: artifact.processingStatus,
        createdAt: artifact.createdAt,
        student: artifact.student,
        outcomes: artifact.outcomes.map(ao => ({
          outcomeId: ao.outcomeId,
          evidenceType: ao.evidenceType,
          teacherNote: ao.teacherNote,
          confidenceLevel: ao.confidenceLevel,
          contextualFactors: ao.contextualFactors,
          dateAssessed: ao.dateAssessed,
          outcome: ao.outcome
        }))
      }));

      res.json({
        artifacts: formattedArtifacts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Artifacts listing error:');
      res.status(500).json({ error: 'Failed to retrieve artifacts' });
    }
  }
);

/**
 * Helper function to handle file upload and artifact creation
 */
async function handleArtifactUpload(req: AuthenticatedRequest, res: Response, artifactType: string): Promise<void> {
  const uploadResult = req.uploadResults[0];
  if (!uploadResult) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const userId = req.user.id;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const fileProcessingService = getFileProcessingService();
  
  // Check storage quota BEFORE processing
  const { checkQuotaBeforeUpload } = await import('../services/quotaManager');
  const quotaCheck = await checkQuotaBeforeUpload(
    req.body.studentId,
    userId,
    uploadResult.size
  );
  
  if (!quotaCheck.allowed) {
    res.status(413).json({
      error: 'Storage quota exceeded',
      message: quotaCheck.reason,
      currentUsage: quotaCheck.currentUsage
    });
    return;
  }

  // Check for duplicate files BEFORE processing
  const duplicateCheck = await fileProcessingService.isDuplicateFile(
    uploadResult.buffer,
    req.body.studentId,
    userId
  );

  if (duplicateCheck.isDuplicate && duplicateCheck.existingArtifact) {
    // File already exists - return existing artifact instead of creating duplicate
    res.status(409).json({
      error: 'Duplicate file detected',
      message: 'This file has already been uploaded for this student',
      existing: {
        id: duplicateCheck.existingArtifact.id,
        title: duplicateCheck.existingArtifact.title,
        fileName: duplicateCheck.existingArtifact.fileName,
        uploadedAt: duplicateCheck.existingArtifact.dateCollected
      }
    });
    return;
  }

  // Queue file processing asynchronously for better performance
  const { queueArtifactProcessing } = await import('../services/queues/init');
  
  // Basic metadata for immediate response
  const basicMetadata = {
    originalName: uploadResult.originalName,
    size: uploadResult.buffer.length,
    mimeType: uploadResult.mimeType,
    checksum: createHash('sha256').update(uploadResult.buffer).digest('hex'),
    isProcessed: false
  };

  // Create artifact and outcomes in a TRANSACTION for data integrity
  // This ensures either everything succeeds or everything rolls back
  const artifact = await prisma.$transaction(async (tx) => {
    // Create the artifact
    const newArtifact = await tx.studentArtifact.create({
      data: {
        userId: userId,
        studentId: req.body.studentId,
        artifactType: artifactType,
        title: req.body.title || `${artifactType} - ${uploadResult.originalName}`,
        description: req.body.description,
        filePath: uploadResult.path,
        fileName: uploadResult.originalName,
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType,
        metadata: JSON.stringify(basicMetadata),
        checksum: basicMetadata.checksum, // Add checksum for duplicate detection
        processingStatus: 'PENDING', // Will be updated by background job
        collectionContext: req.body.collectionContext,
        tags: req.body.tags || undefined,
        dateCollected: req.body.dateCollected ? new Date(req.body.dateCollected) : new Date(),
        isPrivate: req.body.isPrivate || false
      }
    });

    // Handle outcome tagging if provided
    if (req.body.outcomes && Array.isArray(req.body.outcomes)) {
      // Create all outcomes in the same transaction
      await tx.studentArtifactOutcome.createMany({
        data: req.body.outcomes.map((outcome: ArtifactOutcome) => ({
          artifactId: newArtifact.id,
          outcomeId: outcome.outcomeId,
          evidenceType: outcome.evidenceType,
          teacherNote: outcome.teacherNote,
          confidenceLevel: outcome.confidenceLevel || 'MEDIUM',
          contextualFactors: outcome.contextualFactors
        }))
      });

      // Update student progress for each outcome (also in transaction)
      for (const outcome of req.body.outcomes) {
        await tx.studentOutcomeProgress.upsert({
          where: {
            studentId_outcomeId: {
              studentId: req.body.studentId,
              outcomeId: outcome.outcomeId
            }
          },
          update: {
            totalEvidencePieces: {
              increment: 1
            },
            lastAssessedDate: new Date()
          },
          create: {
            studentId: req.body.studentId,
            outcomeId: outcome.outcomeId,
            userId: userId,
            currentLevel: 'NOT_YET',
            totalEvidencePieces: 1,
            lastAssessedDate: new Date()
          }
        });
      }
    }

    return newArtifact;
  }, {
    maxWait: 5000, // Maximum time to wait for transaction slot
    timeout: 10000, // Maximum time for transaction to complete
    isolationLevel: 'Serializable' // SQLite compatible isolation level
  });

  // Queue background processing job after successful transaction
  try {
    const jobId = await queueArtifactProcessing(
      artifactType,
      artifact.id,
      uploadResult.buffer,
      uploadResult.originalName,
      uploadResult.mimeType,
      userId,
      req.body.studentId
    );
    
    logger.info(`Queued processing job ${jobId} for artifact ${artifact.id}`);
  } catch (error: unknown) {
    logger.error({ error }, 'Failed to queue processing job:');
    // Don't fail the upload if queuing fails - file is saved, just not processed
  }

  res.status(201).json({
    id: artifact.id,
    title: artifact.title,
    artifactType: artifact.artifactType,
    filePath: artifact.filePath,
    url: uploadResult.url,
    dateCollected: artifact.dateCollected,
    processingStatus: artifact.processingStatus,
    createdAt: artifact.createdAt
  });
}

/**
 * GET /api/artifacts/:id
 * Get specific artifact details
 */
router.get('/:id',
  requireAuth,
  validateArtifactId,
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const storageService = getStorageService();

      // Get file URL for access
      let fileUrl = null;
      if (artifact.filePath) {
        fileUrl = await storageService.getFileUrl(artifact.filePath as string);
      }

      // Get artifact with all related data
      const fullArtifact = await prisma.studentArtifact.findUnique({
        where: { id: artifact.id as string },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              grade: true
            }
          },
          outcomes: {
            include: {
              outcome: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                  subject: true,
                  strand: true,
                  substrand: true,
                  grade: true
                }
              }
            }
          }
        }
      });

      res.json({
        id: fullArtifact!.id,
        title: fullArtifact!.title,
        description: fullArtifact!.description,
        artifactType: fullArtifact!.artifactType,
        filePath: fullArtifact!.filePath,
        fileName: fullArtifact!.fileName,
        fileSize: fullArtifact!.fileSize,
        mimeType: fullArtifact!.mimeType,
        textContent: fullArtifact!.textContent,
        metadata: fullArtifact!.metadata ? JSON.parse(fullArtifact!.metadata as string) : null,
        collectionContext: fullArtifact!.collectionContext,
        dateCollected: fullArtifact!.dateCollected,
        isPrivate: fullArtifact!.isPrivate,
        tags: fullArtifact!.tags ? JSON.parse(fullArtifact!.tags as string) : null,
        processingStatus: fullArtifact!.processingStatus,
        processingError: fullArtifact!.processingError,
        createdAt: fullArtifact!.createdAt,
        updatedAt: fullArtifact!.updatedAt,
        fileUrl,
        student: fullArtifact!.student,
        outcomes: fullArtifact!.outcomes.map((ao) => ({
          outcomeId: ao.outcomeId,
          evidenceType: ao.evidenceType,
          teacherNote: ao.teacherNote,
          confidenceLevel: ao.confidenceLevel,
          contextualFactors: ao.contextualFactors,
          dateAssessed: ao.dateAssessed,
          outcome: ao.outcome
        }))
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Artifact retrieval error:');
      res.status(500).json({ error: 'Failed to retrieve artifact' });
    }
  }
);

/**
 * PUT /api/artifacts/:id
 * Update artifact metadata (not file)
 */
router.put('/:id',
  requireAuth,
  validateArtifactId,
  [
    body('title')
      .optional()
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1-200 characters'),
    
    body('description')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    
    body('collectionContext')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Collection context must be less than 500 characters'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('textContent')
      .optional()
      .isString()
      .isLength({ max: 5000 })
      .withMessage('Text content must be less than 5000 characters'),
    
    body('isPrivate')
      .optional()
      .isBoolean()
      .withMessage('isPrivate must be a boolean'),
    
    body('dateCollected')
      .optional()
      .isISO8601()
      .withMessage('Date collected must be a valid date')
  ],
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const updateData = req.body;

      const updatedArtifact = await prisma.studentArtifact.update({
        where: { id: artifact.id as string },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.collectionContext && { collectionContext: updateData.collectionContext }),
          ...(updateData.tags && { tags: JSON.stringify(updateData.tags) }),
          ...(updateData.textContent && { textContent: updateData.textContent }),
          ...(typeof updateData.isPrivate === 'boolean' && { isPrivate: updateData.isPrivate }),
          ...(updateData.dateCollected && { dateCollected: new Date(updateData.dateCollected) })
        }
      });

      res.json({
        id: updatedArtifact.id,
        title: updatedArtifact.title,
        description: updatedArtifact.description,
        artifactType: updatedArtifact.artifactType,
        collectionContext: updatedArtifact.collectionContext,
        dateCollected: updatedArtifact.dateCollected,
        isPrivate: updatedArtifact.isPrivate,
        tags: updatedArtifact.tags ? JSON.parse(updatedArtifact.tags as string) : null,
        textContent: updatedArtifact.textContent,
        updatedAt: updatedArtifact.updatedAt
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Artifact update error:');
      res.status(500).json({ error: 'Failed to update artifact' });
    }
  }
);

/**
 * DELETE /api/artifacts/:id
 * Delete artifact and associated files
 */
router.delete('/:id',
  requireAuth,
  validateArtifactId,
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const storageService = getStorageService();

      // Delete associated files from storage
      if (artifact.filePath) {
        try {
          await storageService.deleteFile(artifact.filePath as string);
        } catch (error: unknown) {
          logger.warn({ error }, 'Failed to delete file from storage:');
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete from database (cascade will handle related records)
      await prisma.studentArtifact.delete({
        where: { id: artifact.id as string }
      });

      res.status(204).send();
      return;
    } catch (error: unknown) {
      logger.error({ error }, 'Artifact deletion error:');
      res.status(500).json({ error: 'Failed to delete artifact' });
    }
  }
);

/**
 * POST /api/artifacts/:id/outcomes
 * Tag artifact with curriculum outcome
 */
router.post('/:id/outcomes',
  requireAuth,
  validateArtifactId,
  validateOutcomeTagging,
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const { outcomeId, evidenceType, teacherNote, confidenceLevel, contextualFactors } = req.body;

      // Verify outcome exists
      const outcome = await prisma.curriculumExpectation.findUnique({
        where: { id: outcomeId },
        select: { id: true, code: true, description: true, subject: true, grade: true }
      });

      if (!outcome) {
        res.status(404).json({ error: 'Curriculum outcome not found' });
        return;
      }

      // Check if already tagged
      const existing = await prisma.studentArtifactOutcome.findUnique({
        where: {
          artifactId_outcomeId: {
            artifactId: artifact.id as string,
            outcomeId: outcomeId as string
          }
        }
      });

      if (existing) {
        res.status(400).json({ error: 'Artifact already tagged with this outcome' });
        return;
      }

      // Create outcome tagging
      const outcomeTag = await prisma.studentArtifactOutcome.create({
        data: {
          artifactId: artifact.id as string,
          outcomeId: outcomeId as string,
          evidenceType: evidenceType,
          teacherNote: teacherNote,
          confidenceLevel: confidenceLevel || 'MEDIUM',
          contextualFactors: contextualFactors
        }
      });

      res.status(201).json({
        artifactId: outcomeTag.artifactId,
        outcomeId: outcomeTag.outcomeId,
        evidenceType: outcomeTag.evidenceType,
        teacherNote: outcomeTag.teacherNote,
        confidenceLevel: outcomeTag.confidenceLevel,
        contextualFactors: outcomeTag.contextualFactors,
        dateAssessed: outcomeTag.dateAssessed,
        outcome: outcome
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Outcome tagging error:');
      res.status(500).json({ error: 'Failed to tag outcome' });
    }
  }
);

/**
 * PUT /api/artifacts/:id/outcomes/:outcomeId
 * Update outcome tagging
 */
router.put('/:id/outcomes/:outcomeId',
  requireAuth,
  validateArtifactId,
  param('outcomeId').isString().withMessage('Outcome ID is required'),
  [
    body('evidenceType')
      .optional()
      .isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT'])
      .withMessage('Evidence type must be one of: OBSERVATION, CONVERSATION, PRODUCT'),
    
    body('teacherNote')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Teacher note must be less than 1000 characters'),
    
    body('confidenceLevel')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Confidence level must be one of: LOW, MEDIUM, HIGH'),
    
    body('contextualFactors')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Contextual factors must be less than 500 characters')
  ],
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const outcomeId = req.params.outcomeId;
      if (!outcomeId) {
        res.status(400).json({ error: 'Outcome ID is required' });
        return;
      }
      const updateData = req.body;

      // Update outcome tagging
      const updatedTag = await prisma.studentArtifactOutcome.update({
        where: {
          artifactId_outcomeId: {
            artifactId: artifact.id as string,
            outcomeId: outcomeId as string
          }
        },
        data: {
          ...(updateData.evidenceType && { evidenceType: updateData.evidenceType }),
          ...(updateData.teacherNote && { teacherNote: updateData.teacherNote }),
          ...(updateData.confidenceLevel && { confidenceLevel: updateData.confidenceLevel }),
          ...(updateData.contextualFactors && { contextualFactors: updateData.contextualFactors })
        },
        include: {
          outcome: {
            select: {
              id: true,
              code: true,
              description: true,
              subject: true
            }
          }
        }
      });

      res.json({
        artifactId: updatedTag.artifactId,
        outcomeId: updatedTag.outcomeId,
        evidenceType: updatedTag.evidenceType,
        teacherNote: updatedTag.teacherNote,
        confidenceLevel: updatedTag.confidenceLevel,
        contextualFactors: updatedTag.contextualFactors,
        dateAssessed: updatedTag.dateAssessed,
        outcome: 'outcome' in updatedTag ? updatedTag.outcome : null
      });
      return;
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        res.status(404).json({ error: 'Outcome tagging not found' });
      } else {
        logger.error({ error }, 'Outcome tag update error:');
        res.status(500).json({ error: 'Failed to update outcome tag' });
      }
    }
  }
);

/**
 * DELETE /api/artifacts/:id/outcomes/:outcomeId
 * Remove outcome tagging from artifact
 */
router.delete('/:id/outcomes/:outcomeId',
  requireAuth,
  validateArtifactId,
  param('outcomeId').isString().withMessage('Outcome ID is required'),
  handleValidationErrors,
  validateArtifactOwnership,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const artifact = req.artifact!; // Non-null assertion safe after validateArtifactOwnership
      const outcomeId = req.params.outcomeId;
      if (!outcomeId) {
        res.status(400).json({ error: 'Outcome ID is required' });
        return;
      }

      await prisma.studentArtifactOutcome.delete({
        where: {
          artifactId_outcomeId: {
            artifactId: artifact.id as string,
            outcomeId: outcomeId as string
          }
        }
      });

      res.status(204).send();
      return;
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        res.status(404).json({ error: 'Outcome tagging not found' });
      } else {
        logger.error({ error }, 'Outcome tag deletion error:');
        res.status(500).json({ error: 'Failed to remove outcome tag' });
      }
    }
  }
);

// Apply error handling middleware
router.use(handleUploadErrors);

// Cleanup on module exit
process.on('exit', async () => {
  await prisma.$disconnect();
});

export { router };