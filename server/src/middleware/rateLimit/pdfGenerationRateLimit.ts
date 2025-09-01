/**
 * Rate Limiting for PDF Generation Routes
 * Protects server resources from excessive PDF generation requests
 * 
 * PDF generation is resource-intensive (Puppeteer, memory, CPU)
 * Must balance teacher needs with server protection
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../../logger';

/**
 * Rate limit for PDF generation
 * Allows 5 PDFs per minute per user, then 20 per hour
 * This prevents abuse while allowing reasonable usage
 */
export const pdfGenerationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // 5 PDFs per minute per user
  standardHeaders: true,
  legacyHeaders: false,
  
  // Key generator - rate limit per authenticated user
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) {
      // For unauthenticated requests, use IP
      return req.ip || 'unknown';
    }
    return `pdf-gen-${userId}`;
  },
  
  // Custom error message
  handler: (req: Request, res: Response) => {
    logger.warn('PDF generation rate limit exceeded', {
      userId: (req as any).user?.id,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many PDF generation requests',
      message: 'Please wait a moment before generating another PDF. Maximum 5 PDFs per minute.',
      retryAfter: req.rateLimit?.resetTime,
      code: 'RATE_LIMIT_EXCEEDED'
    });
  },
  
  // Skip successful requests from counting if they're cached
  skip: (req: Request) => {
    // Check if this is likely a cached response (very fast)
    const startTime = (req as any).startTime;
    if (startTime && Date.now() - startTime < 100) {
      // Likely served from cache, don't count
      return true;
    }
    return false;
  },
  
  skipFailedRequests: true, // Don't count failed PDF generations
});

/**
 * Hourly rate limit for PDF generation
 * Maximum 20 PDFs per hour to prevent sustained abuse
 */
export const pdfGenerationHourlyLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 PDFs per hour per user
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) {
      return req.ip || 'unknown';
    }
    return `pdf-gen-hourly-${userId}`;
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Hourly PDF generation limit exceeded', {
      userId: (req as any).user?.id,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Hourly PDF limit exceeded',
      message: 'You have reached the maximum number of PDF exports for this hour (20). Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
      code: 'HOURLY_LIMIT_EXCEEDED'
    });
  },
  
  skipFailedRequests: true,
});

/**
 * Global PDF generation limit
 * Prevents server overload from all users combined
 */
export const globalPdfGenerationLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 PDFs per minute globally
  standardHeaders: false,
  legacyHeaders: false,
  
  // Use a single global key
  keyGenerator: () => 'global-pdf-generation',
  
  handler: (req: Request, res: Response) => {
    logger.error('Global PDF generation limit exceeded', {
      userId: (req as any).user?.id,
      ip: req.ip,
      path: req.path
    });
    
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'PDF generation service is currently at capacity. Please try again in a few moments.',
      retryAfter: req.rateLimit?.resetTime,
      code: 'SERVICE_OVERLOADED'
    });
  },
  
  skipFailedRequests: true,
});

/**
 * Middleware to track PDF generation start time for cache detection
 */
export const trackPdfGenerationStart = (req: Request, res: Response, next: any) => {
  (req as any).startTime = Date.now();
  next();
};