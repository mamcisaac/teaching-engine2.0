/**
 * Authentication Middleware
 * Extracts and validates JWT tokens from requests
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../logger';

// Express Request type is extended in types/express.d.ts

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // First try to get token from httpOnly cookie
    let token = req.cookies?.authToken;

    // Debug logging (temporary)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Auth Debug:', {
        hasCookies: !!req.cookies,
        hasAuthToken: !!req.cookies?.authToken,
        authHeader: req.headers['authorization'] ? 'present' : 'missing',
        url: req.url,
      });
    }

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (token.length > 1000) {
      // Prevent extremely long tokens
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('CRITICAL: JWT_SECRET environment variable not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      maxAge: '7d', // Maximum token age
    }) as JwtPayload;

    if (!decoded?.userId || !decoded?.email || !decoded?.iat) {
      res.status(403).json({ error: 'Invalid token payload' });
      return;
    }

    // Check token age (extra protection)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    if (now - decoded.iat > maxAge) {
      res.status(403).json({ error: 'Token expired' });
      return;
    }

    // Attach user information to request
    req.user = {
      id: Number(decoded.userId),
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(403).json({ error: 'Token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
    } else {
      logger.error('JWT verification error:', err);
      res.status(403).json({ error: 'Token verification failed' });
    }
  }
}
