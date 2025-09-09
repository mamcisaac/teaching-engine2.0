/**
 * Request ID middleware for tracing API calls
 * Adds a unique request ID to each incoming request for error tracking
 */

import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const reqId = (req: Request, _res: Response, next: NextFunction) => {
  (req as any).rid = randomUUID();
  next();
};