import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = parseInt(payload.userId, 10);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
