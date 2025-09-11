/**
 * File upload middleware for handling student artifacts
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

// Extend Request type to include uploadResults
declare global {
  namespace Express {
    interface Request {
      uploadResults?: Array<{
        originalName: string;
        path: string;
        size: number;
        mimeType: string;
        category: string;
        buffer: Buffer;
        url?: string;
      }>;
    }
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage (we'll handle file saving ourselves)
const storage = multer.memoryStorage();

// File filter for different artifact types
const photoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const videoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MPEG, QuickTime, and WebM videos are allowed.'));
  }
};

const audioFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, OGG, and WebM audio files are allowed.'));
  }
};

const documentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, and text files are allowed.'));
  }
};

// Create multer instances for different upload types
const uploadPhoto = multer({
  storage,
  fileFilter: photoFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for photos
  }
}).single('file');

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
  }
}).single('file');

const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for audio
  }
}).single('file');

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  }
}).single('file');

const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB total
    files: 10 // Maximum 10 files at once
  }
}).array('files', 10);

const uploadMobile = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for mobile uploads
  }
}).single('file');

// Middleware wrapper to handle multer and process results
const processUpload = (upload: any) => {
  return [
    (req: Request, res: Response, next: NextFunction) => {
      upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large' });
          }
          return res.status(400).json({ error: err.message });
        } else if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        // Process single file
        if (req.file) {
          const fileName = `${Date.now()}-${req.file.originalname}`;
          const filePath = path.join('uploads', fileName);
          const fullPath = path.join(process.cwd(), filePath);
          
          // Save file to disk
          fs.writeFileSync(fullPath, req.file.buffer);
          
          req.uploadResults = [{
            originalName: req.file.originalname,
            path: filePath,
            size: req.file.size,
            mimeType: req.file.mimetype,
            category: req.file.mimetype.split('/')[0],
            buffer: req.file.buffer,
            url: `/uploads/${fileName}`
          }];
        }
        
        // Process multiple files
        if (req.files && Array.isArray(req.files)) {
          req.uploadResults = req.files.map((file) => {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join('uploads', fileName);
            const fullPath = path.join(process.cwd(), filePath);
            
            // Save file to disk
            fs.writeFileSync(fullPath, file.buffer);
            
            return {
              originalName: file.originalname,
              path: filePath,
              size: file.size,
              mimeType: file.mimetype,
              category: file.mimetype.split('/')[0],
              buffer: file.buffer,
              url: `/uploads/${fileName}`
            };
          });
        }
        
        next();
      });
    }
  ];
};

// Export middleware arrays
export const uploadStudentPhoto = processUpload(uploadPhoto);
export const uploadStudentVideo = processUpload(uploadVideo);
export const uploadStudentAudio = processUpload(uploadAudio);
export const uploadStudentDocument = processUpload(uploadDocument);
export const uploadMultipleArtifacts = processUpload(uploadMultiple);
export const mobileArtifactUpload = processUpload(uploadMobile);

// Validation middleware
export const validateArtifactUpload = (req: Request, res: Response, next: NextFunction) => {
  // Check if file was uploaded
  if (!req.uploadResults || req.uploadResults.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Validate required fields
  if (!req.body.studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  next();
};

// Quick note validation (for text-only artifacts)
export const validateQuickNote = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  if (!req.body.textContent || req.body.textContent.trim().length === 0) {
    return res.status(400).json({ error: 'Text content is required' });
  }
  
  if (!req.body.title || req.body.title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  next();
};

// Error handling middleware
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File size too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err) {
    logger.error({ error: err }, 'Upload error:');
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  next();
};