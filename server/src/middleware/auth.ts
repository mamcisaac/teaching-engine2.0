import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.user = { userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Export as 'auth' for consistency with service
export const auth = authMiddleware;

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
