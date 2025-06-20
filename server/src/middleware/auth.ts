import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    userId?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    const userId = parseInt(payload.userId, 10);
    req.userId = userId;
    req.user = { id: userId, userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Export as 'auth' for consistency with service
export const auth = authMiddleware;
