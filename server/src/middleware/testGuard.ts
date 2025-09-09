/**
 * Test Guard Middleware
 * Protects test-only endpoints from being accessible in production
 */

import type { Request, Response, NextFunction } from 'express';

export function testGuard(req: Request, res: Response, next: NextFunction): void {
  const enabled = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  const header = req.get('X-Test-Token');
  const expectedToken = process.env.TEST_SECRET || 'test-secret-token';
  const ok = header === expectedToken;

  if (!enabled || !ok) {
    console.warn('[testGuard] denied', { 
      enabled, 
      hasHeader: !!header, 
      headerMatches: header === expectedToken,
      path: req.path,
      method: req.method 
    });
    return res.status(404).end(); // keep invisibility but log denial
  }
  
  next();
}