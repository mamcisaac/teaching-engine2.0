/**
 * Upload Middleware for Student Artifacts
 * Handles file uploads with validation, security, and storage integration
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getStorageService } from '../services/storage';

// File type validation configuration
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  videos: [
    'video/mp4',
    'video/quicktime',
    'video/avi',
    'video/webm',
    'video/mov'
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
};

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.videos,
  ...ALLOWED_MIME_TYPES.audio,
  ...ALLOWED_MIME_TYPES.documents
];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,    // 10MB for images
  video: 100 * 1024 * 1024,   // 100MB for videos  
  audio: 25 * 1024 * 1024,    // 25MB for audio
  document: 10 * 1024 * 1024, // 10MB for documents
  default: 25 * 1024 * 1024   // 25MB default (from env config)
};

// Get file category from MIME type
function getFileCategory(mimeType: string): string {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType)) return 'image';
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType)) return 'video';
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType)) return 'audio';
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType)) return 'document';
  return 'unknown';
}

// Enhanced file filter with security validation
function createFileFilter(allowedTypes?: string[]) {
  const allowed = allowedTypes || ALL_ALLOWED_MIME_TYPES;
  
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    // Check MIME type
    if (!allowed.includes(file.mimetype)) {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowed.join(', ')}`));
      return;
    }

    // Validate file extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const category = getFileCategory(file.mimetype);
    
    const extensionValidation: Record<string, string[]> = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      video: ['.mp4', '.mov', '.avi', '.webm'],
      audio: ['.mp3', '.wav', '.ogg', '.aac'],
      document: ['.pdf', '.doc', '.docx', '.txt']
    };

    if (category !== 'unknown' && extensionValidation[category] && !extensionValidation[category].includes(ext)) {
      cb(new Error(`File extension ${ext} does not match MIME type ${file.mimetype}`));
      return;
    }

    // Security: Block potentially dangerous filenames
    const dangerousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.sh$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /\.js$/i,
      /\.html$/i,
      /\.svg$/i // SVG can contain scripts
    ];

    if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
      cb(new Error(`File type potentially dangerous: ${file.originalname}`));
      return;
    }

    cb(null, true);
  };
}

// Memory storage for integration with storage service
const storage = multer.memoryStorage();

// Create upload configurations
export const createUploadMiddleware = (options: {
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  fieldName?: string;
} = {}) => {
  const {
    maxFileSize = parseInt(process.env.UPLOAD_MAX_MB || '25') * 1024 * 1024,
    allowedTypes,
    maxFiles = 10,
    fieldName = 'artifacts'
  } = options;

  return multer({
    storage,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
      fieldSize: 1024 * 1024, // 1MB for form fields
      fields: 50 // Max number of form fields
    },
    fileFilter: createFileFilter(allowedTypes)
  });
};

// Single file upload middleware
export const uploadSingle = (fieldName = 'artifact', options?: {
  maxFileSize?: number;
  allowedTypes?: string[];
}) => {
  return createUploadMiddleware({
    ...options,
    maxFiles: 1,
    fieldName
  }).single(fieldName);
};

// Multiple files upload middleware  
export const uploadMultiple = (fieldName = 'artifacts', options?: {
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) => {
  return createUploadMiddleware({
    ...options,
    fieldName
  }).array(fieldName, options?.maxFiles || 10);
};

// Upload processing middleware - integrates with storage service
export const processUpload = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const storageService = getStorageService();
    const files = req.file ? [req.file] : (req.files as Express.Multer.File[]);
    const uploadResults = [];

    for (const file of files) {
      // Validate file size based on category
      const category = getFileCategory(file.mimetype);
      const maxSize = FILE_SIZE_LIMITS[category as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.default;
      
      if (file.size > maxSize) {
        throw new Error(`File ${file.originalname} exceeds maximum size for ${category} files (${maxSize / (1024 * 1024)}MB)`);
      }

      // Generate secure filename
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 30);
      
      const safeFilename = `${timestamp}_${randomStr}_${baseName}${ext}`;

      // Upload to storage service
      const result = await storageService.uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          folder: `artifacts/${category}s`, // images, videos, audios, documents
          filename: `${category}s/${safeFilename}`,
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.user?.id?.toString() || 'unknown',
            uploadedAt: new Date().toISOString(),
            category,
            size: file.size.toString()
          }
        }
      );

      uploadResults.push({
        originalName: file.originalname,
        filename: safeFilename,
        path: result.path,
        url: result.url,
        size: file.size,
        mimeType: file.mimetype,
        category,
        buffer: file.buffer // CRITICAL: Include buffer for processing
      });
    }

    // Attach upload results to request for use in route handlers
    req.uploadResults = uploadResults;
    
    next();
  } catch (error: unknown) {
    next(error);
  }
};

// Validation middleware for upload requirements
export const validateUploadRequirements = (requirements: {
  minFiles?: number;
  maxFiles?: number;
  requiredFields?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.file ? [req.file] : (req.files as Express.Multer.File[] || []);
    
    if (requirements.minFiles && files.length < requirements.minFiles) {
      res.status(400).json({
        error: `Minimum ${requirements.minFiles} file(s) required`
      });
      return;
    }

    if (requirements.maxFiles && files.length > requirements.maxFiles) {
      res.status(400).json({
        error: `Maximum ${requirements.maxFiles} file(s) allowed`
      });
      return;
    }

    if (requirements.requiredFields) {
      const missingFields = requirements.requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        res.status(400).json({
          error: `Required fields missing: ${missingFields.join(', ')}`
        });
        return;
      }
    }

    next();
  };
};

// Error handler for upload errors
export const handleUploadErrors = (error: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File too large',
        maxSize: `${parseInt(process.env.UPLOAD_MAX_MB || '25')}MB`
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        error: 'Too many files uploaded'
      });
      return;
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        error: 'Unexpected field name in upload'
      });
      return;
    }
  }

  // Handle custom validation errors
  if (error.message.includes('not allowed') || error.message.includes('dangerous')) {
    res.status(400).json({
      error: error.message
    });
    return;
  }

  next(error);
};

/**
 * Student Artifact Upload Middleware Functions
 * Specific handlers for different artifact types
 */

// Photo upload middleware
export const uploadStudentPhoto = [
  uploadSingle('photo', { allowedTypes: ALLOWED_MIME_TYPES.images }),
  processUpload
];

// Video upload middleware  
export const uploadStudentVideo = [
  uploadSingle('video', { allowedTypes: ALLOWED_MIME_TYPES.videos }),
  processUpload
];

// Audio upload middleware
export const uploadStudentAudio = [
  uploadSingle('audio', { allowedTypes: ALLOWED_MIME_TYPES.audio }),
  processUpload
];

// Document upload middleware
export const uploadStudentDocument = [
  uploadSingle('document', { allowedTypes: ALLOWED_MIME_TYPES.documents }),
  processUpload
];

// Multiple artifacts upload middleware
export const uploadMultipleArtifacts = [
  uploadMultiple('artifacts', { allowedTypes: ALL_ALLOWED_MIME_TYPES, maxFiles: 5 }),
  processUpload
];

// Mobile artifact upload (single field, any supported type)
export const mobileArtifactUpload = [
  uploadSingle('artifact', { allowedTypes: ALL_ALLOWED_MIME_TYPES }),
  processUpload
];

/**
 * Validation Middleware Functions
 */

// Validate artifact upload requirements
export const validateArtifactUpload = [
  // Add validation logic here as needed
];

// Validate artifact with curriculum outcomes
export const validateArtifactWithOutcomes = [
  // Add outcome validation logic here as needed
];

// Validate quick note creation
export const validateQuickNote = [
  // Add quick note validation logic here as needed
];

// Student access validation
export const validateStudentAccess = (_req: Request, _res: Response, next: NextFunction) => {
  // Add student access validation logic
  next();
};

// Outcome access validation
export const validateOutcomeAccess = (_req: Request, _res: Response, next: NextFunction) => {
  // Add outcome access validation logic
  next();
};

// Handle validation errors
export const handleValidationErrors = (_req: Request, _res: Response, next: NextFunction) => {
  // Add validation error handling
  next();
};

// Upload requirements validation (middleware version)
export const validateUploadRequirementsMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Add upload requirements validation
  next();
};

// Type declarations for Request object extensions
declare global {
  namespace Express {
    interface Request {
      uploadResults?: Array<{
        originalName: string;
        filename: string;
        path: string;
        url: string;
        size: number;
        mimeType: string;
        category: string;
        buffer: Buffer; // File buffer for processing
      }>;
    }
  }
}