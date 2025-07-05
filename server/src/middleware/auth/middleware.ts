import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { AuthRequest, UserRole } from './types';
import { prisma } from '../../prisma.js';
import logger from '../../logger.js';
import { AuthenticationError } from '../errorHandler.js';

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify token
    const payload = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
    };

    logger.debug(`User ${user.email} authenticated successfully`);
    next();
  } catch (_error) {
    if (_error instanceof AuthenticationError) {
      next(_error);
    } else {
      logger.error('Authentication error:', _error);
      next(new AuthenticationError('Authentication failed'));
    }
  }
}

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      logger.warn(
        `Access denied for user ${authReq.user.email} with role ${authReq.user.role}. Required roles: ${allowedRoles.join(', ')}`
      );
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user) {
      (req as AuthRequest).user = {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role as UserRole,
      };
    }

    next();
  } catch (_error) {
    // Log error but continue without authentication
    logger.debug('Optional authentication failed:', _error);
    next();
  }
}

/**
 * Require organization membership
 */
export function requireOrganization(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authReq = req as AuthRequest;
  
  if (!authReq.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  if (!authReq.user.organizationId) {
    return next(new ForbiddenError('Organization membership required'));
  }

  next();
}