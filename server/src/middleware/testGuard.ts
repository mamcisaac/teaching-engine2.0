/**
 * Test Guard Middleware
 * Protects test-only endpoints from being accessible in production
 */

import type { Request, Response, NextFunction } from 'express';

export function testGuard(req: Request, res: Response, next: NextFunction): void {
  // Only allow in test or development environments
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
    res.sendStatus(404);
    return;
  }

  // Require test secret token
  const testToken = req.get('X-Test-Token');
  const expectedToken = process.env.TEST_SECRET || 'test-secret-token';
  
  if (testToken !== expectedToken) {
    res.sendStatus(403);
    return;
  }

  next();
}