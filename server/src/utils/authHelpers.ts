import type { Response } from 'express';

import type { AuthenticatedRequest } from '../routes/base/middleware';

/**
 * Safely extracts user ID from request, returning error response if not authenticated
 */
export function getUserId(req: AuthenticatedRequest, res: Response): number | null {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return null;
  }
  return req.user.id;
}

/**
 * Type guard to check if request has authenticated user
 */
export function isAuthenticated(req: AuthenticatedRequest): req is AuthenticatedRequest & { user: NonNullable<AuthenticatedRequest['user']> } {
  return req.user?.id !== undefined;
}

/**
 * Middleware-style authentication check
 */
export function requireUser(req: AuthenticatedRequest, res: Response): boolean {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return false;
  }
  return true;
}