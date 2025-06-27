import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const payload = jwt.verify(token, secret) as { userId: string; email?: string };
    req.user = {
      id: parseInt(payload.userId),
      userId: payload.userId,
      email: payload.email || 'unknown@example.com',
    };
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'JWT_SECRET environment variable is required') {
      console.error('CRITICAL: JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Export as 'auth' for consistency with service
export const auth = authMiddleware;

// Export as requireAuth for consistency with routes
export const requireAuth = authMiddleware;

// Export as authenticate for batch routes
export const authenticate = authMiddleware;

export function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Admin token required' });
  }

  // Check if token matches the admin/wizard token
  if (token !== process.env.WIZARD_TOKEN) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }

  next();
}
