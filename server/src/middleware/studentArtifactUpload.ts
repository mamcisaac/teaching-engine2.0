/**
 * Student Artifact Upload Middleware
 * Specialized upload handling for ETFO student assessment artifacts
 */

import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { body, validationResult } from 'express-validator';

import { logger } from '../logger';

import { 
  uploadSingle, 
  uploadMultiple, 
  processUpload, 
  validateUploadRequirements,
  ALLOWED_MIME_TYPES 
} from './uploadMiddleware';

// Student artifact upload validation rules
export const studentArtifactValidation = [
  body('studentId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Student ID is required'),
  
  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1-200 characters'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('artifactType')
    .isIn(['PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'NOTE'])
    .withMessage('Artifact type must be one of: PHOTO, VIDEO, AUDIO, DOCUMENT, NOTE'),
  
  body('collectionContext')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Collection context must be less than 500 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1-50 characters'),
  
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
    .withMessage('Date collected must be a valid ISO 8601 date')
];

// Outcome tagging validation (for linking artifacts to curriculum expectations)
export const outcomeTaggingValidation = [
  body('outcomes')
    .optional()
    .isArray()
    .withMessage('Outcomes must be an array'),
  
  body('outcomes.*.outcomeId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Outcome ID is required'),
  
  body('outcomes.*.evidenceType')
    .isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT'])
    .withMessage('Evidence type must be one of: OBSERVATION, CONVERSATION, PRODUCT'),
  
  body('outcomes.*.teacherNote')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Teacher note must be less than 1000 characters'),
  
  body('outcomes.*.confidenceLevel')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Confidence level must be one of: LOW, MEDIUM, HIGH'),
  
  body('outcomes.*.contextualFactors')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Contextual factors must be less than 500 characters')
];

// Middleware to validate student access
export const validateStudentAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.body;
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Import Prisma client
    const { PrismaClient } = await import('@teaching-engine/database');

    try {
      // Verify student exists and belongs to the authenticated teacher
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: userId,
          isActive: true
        }
      });

      if (!student) {
        res.status(404).json({ 
          error: 'Student not found or access denied' 
        });
        return;
      }

      // Attach student info to request for use in handlers
      req.student = student;
      next();
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: unknown) {
    logger.error({ error }, 'Student access validation error:');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to validate curriculum outcome access
export const validateOutcomeAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcomes = req.body.outcomes;
    
    if (!outcomes || !Array.isArray(outcomes) || outcomes.length === 0) {
      return next(); // No outcomes to validate
    }

    // Import Prisma client
    const { PrismaClient } = await import('@teaching-engine/database');

    try {
      const outcomeIds = outcomes.map((o: { outcomeId: string }) => o.outcomeId);
      
      // Verify all outcome IDs exist
      const existingOutcomes = await prisma.curriculumExpectation.findMany({
        where: {
          id: {
            in: outcomeIds
          }
        },
        select: {
          id: true,
          code: true,
          subject: true,
          grade: true
        }
      });

      if (existingOutcomes.length !== outcomeIds.length) {
        const foundIds = existingOutcomes.map(o => o.id);
        const missingIds = outcomeIds.filter((id: string) => !foundIds.includes(id));
        
        res.status(400).json({
          error: 'Invalid curriculum outcome IDs',
          missingOutcomes: missingIds
        });
        return;
      }

      // Attach outcome info to request
      req.outcomes = existingOutcomes;
      next();
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: unknown) {
    logger.error({ error }, 'Outcome access validation error:');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
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

// File type specific upload middleware
export const uploadStudentPhoto = [
  uploadSingle('photo', {
    allowedTypes: ALLOWED_MIME_TYPES.images,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }),
  processUpload
];

export const uploadStudentVideo = [
  uploadSingle('video', {
    allowedTypes: ALLOWED_MIME_TYPES.videos,
    maxFileSize: 100 * 1024 * 1024 // 100MB
  }),
  processUpload
];

export const uploadStudentAudio = [
  uploadSingle('audio', {
    allowedTypes: ALLOWED_MIME_TYPES.audio,
    maxFileSize: 25 * 1024 * 1024 // 25MB
  }),
  processUpload
];

export const uploadStudentDocument = [
  uploadSingle('document', {
    allowedTypes: ALLOWED_MIME_TYPES.documents,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }),
  processUpload
];

// Multiple artifact upload for batch operations
export const uploadMultipleArtifacts = [
  uploadMultiple('artifacts', {
    maxFiles: 5,
    maxFileSize: 25 * 1024 * 1024 // 25MB per file
  }),
  processUpload,
  validateUploadRequirements({
    minFiles: 1,
    maxFiles: 5
  })
];

// Complete artifact upload validation chain
export const validateArtifactUpload = [
  ...studentArtifactValidation,
  handleValidationErrors,
  validateStudentAccess
];

// Complete artifact with outcomes upload validation chain
export const validateArtifactWithOutcomes = [
  ...studentArtifactValidation,
  ...outcomeTaggingValidation,
  handleValidationErrors,
  validateStudentAccess,
  validateOutcomeAccess
];

// Mobile-friendly upload configuration for camera captures
export const mobileArtifactUpload = [
  uploadSingle('artifact', {
    allowedTypes: [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.videos],
    maxFileSize: 50 * 1024 * 1024 // 50MB for mobile captures
  }),
  processUpload
];

// Quick note creation (text-only artifact)
export const validateQuickNote = [
  body('studentId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Student ID is required'),
  
  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required'),
  
  body('textContent')
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Note content is required and must be less than 5000 characters'),
  
  handleValidationErrors,
  validateStudentAccess
];

// Type declarations moved to /src/types/express.d.ts