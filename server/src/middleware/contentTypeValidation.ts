import type { Response, NextFunction, Request } from 'express';
import type express from 'express';

import { logger } from '../logger';

/**
 * Validate Content-Type header for JSON endpoints
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  // Only validate POST, PUT, PATCH requests with bodies
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  const contentType = req.headers['content-type'];
  
  // Check if Content-Type is missing or not application/json
  if (!contentType || !contentType.includes('application/json')) {
    logger.warn({
      method: req.method,
      path: req.path,
      contentType,
      expectedContentType: 'application/json'
    }, 'Invalid or missing Content-Type header');

    res.status(400).json({
      error: 'Invalid Content-Type',
      message: 'Content-Type must be application/json for JSON endpoints',
      received: contentType || 'none'
    });
    return;
  }

  next();
}

/**
 * Apply content type validation to auth endpoints
 */
export function applyContentTypeValidation(app: express.Application): void {
  // Apply to auth endpoints specifically
  app.use('/api/auth/login', validateContentType);
  app.use('/api/auth/register', validateContentType);
  app.use('/api/auth/forgot-password', validateContentType);
  app.use('/api/auth/reset-password', validateContentType);
  app.use('/api/auth/refresh', validateContentType);
  
  logger.info('Content-Type validation middleware applied to auth endpoints');
}