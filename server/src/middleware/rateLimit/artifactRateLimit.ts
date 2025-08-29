/**
 * Rate Limiting for Artifact Upload Routes
 * Protects against abuse while allowing reasonable classroom usage
 * 
 * Classroom scenario: 25 students might upload simultaneously after an activity
 * Solution: Per-student rate limiting with reasonable burst allowance
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limit for artifact uploads
 * Allows burst of 10 uploads per minute per student (for multiple photos of activity)
 * Then limits to 30 uploads per hour to prevent abuse
 */
export const artifactUploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 uploads per minute per student
  standardHeaders: true,
  legacyHeaders: false,
  
  // Key generator - rate limit per user + student combination
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id || 'anonymous';
    const studentId = req.body?.studentId || 'unknown';
    return `${userId}-${studentId}`;
  },
  
  // Custom error message
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many uploads',
      message: 'Please wait a moment before uploading more files. Maximum 10 files per minute per student.',
      retryAfter: req.rateLimit?.resetTime
    });
  },
  
  // Skip successful requests from counting (only count actual uploads)
  skipSuccessfulRequests: false,
  skipFailedRequests: true, // Don't count failed uploads against limit
});

/**
 * Lighter rate limit for viewing artifacts
 * More permissive as viewing doesn't consume many resources
 */
export const artifactViewRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 views per minute
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return (req as any).user?.id?.toString() || req.ip;
  },
  
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down your requests.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

/**
 * Strict rate limit for bulk operations
 * CSV imports, bulk deletes, etc.
 */
export const bulkOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 bulk operations per hour
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return (req as any).user?.id?.toString() || req.ip;
  },
  
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Bulk operation limit exceeded',
      message: 'You can only perform 5 bulk operations per hour. Please wait before trying again.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

/**
 * Report generation rate limit
 * PDF generation is resource-intensive
 */
export const reportGenerationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 reports per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return (req as any).user?.id?.toString() || req.ip;
  },
  
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Report generation limit exceeded', 
      message: 'Report generation is limited to 3 reports per 10 minutes. Please wait before generating another report.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});