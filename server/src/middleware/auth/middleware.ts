import type { Request, Response, NextFunction } from 'express';

import { logger } from '../../logger.js';
import { prisma } from '../../prisma.js';
import { AuthenticationError } from '../errorHandler.js';

import { verifyToken, extractTokenFromHeader } from './jwt';
import type { AuthRequest, UserRole } from './types';

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
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
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token === null || token === '') {
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

    if (user === null) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    };

    logger.debug(`User ${user.email} authenticated successfully`);
    next();
  } catch (_error: unknown) {
    if (_error instanceof AuthenticationError) {
      next(_error);
    } else {
      logger.error('Authentication error:', _error as string | undefined);
      next(new AuthenticationError('Authentication failed'));
    }
  }
}

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      next(new AuthenticationError('User not authenticated')); return;
    }

    if (allowedRoles.length === 0) {
      next(); return;
    }

    if (authReq.user.role != null && !allowedRoles.includes(authReq.user.role)) {
      logger.warn(
        `Access denied for user ${authReq.user.email ?? 'unknown'} with role ${authReq.user.role ?? 'unknown'}. Required roles: ${allowedRoles.join(', ')}`,
      );
      next(new ForbiddenError('Insufficient permissions')); return;
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
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token === null || token === '') {
      next(); return;
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

    if (user !== null) {
      (req as AuthRequest).user = {
        id: user.id,
        email: user.email,
        name: (user.name != null && user.name !== '') ? user.name : '',
        role: user.role as UserRole,
      };
    }

    next();
  } catch (_error: unknown) {
    // Log error but continue without authentication
    logger.debug('Optional authentication failed:', _error as string | undefined);
    next();
  }
}

/**
 * Require organization membership
 */
export function requireOrganization(req: Request, _res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    next(new AuthenticationError('User not authenticated')); return;
  }

  if (authReq.user.organizationId === null) {
    next(new ForbiddenError('Organization membership required')); return;
  }

  next();
}
