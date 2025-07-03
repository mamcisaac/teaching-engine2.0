import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../logger.js';
import { prisma } from '../prisma.js';

// Extend Express Request to include user
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        organizationId?: number;
        permissions?: string[];
      };
    }
  }
}

interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  permissions?: string[];
}

/**
 * JWT Authentication middleware
 * Verifies JWT tokens and attaches user information to requests
 */

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
export function generateToken(user: {
  id: number;
  email: string;
  role: string;
  organizationId?: number;
  permissions?: string[];
}): string {
  const payload: TokenPayload = {
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?.toString(),
    permissions: user.permissions || [],
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'teaching-engine',
    audience: 'teaching-engine-users',
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId: userId.toString(), type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'teaching-engine',
  });
}

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies (both 'token' and 'authToken' for compatibility)
  if (req.cookies) {
    if (req.cookies.token) {
      return req.cookies.token;
    }
    if (req.cookies.authToken) {
      return req.cookies.authToken;
    }
  }

  // Check query parameter (for download links)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
}

/**
 * Verify and decode JWT token
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'teaching-engine',
      audience: 'teaching-engine-users',
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('Invalid token');
    } else {
      logger.error({ error }, 'Token verification error');
    }
    return null;
  }
}

/**
 * Main authentication middleware
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Optionally verify user still exists and is active
    // Enable for production or when explicitly requested in tests
    // Check both the path and the original URL for the /me endpoint
    // The /me endpoint always requires fresh user data from database
    const isAuthMeEndpoint =
      req.path === '/me' ||
      req.originalUrl === '/api/auth/me' ||
      req.url === '/api/auth/me' ||
      req.path.endsWith('/me') ||
      req.originalUrl?.endsWith('/me') ||
      (req.baseUrl === '/api/auth' && req.path === '/me') ||
      req.baseUrl + req.path === '/api/auth/me';

    // Debug logging for path matching
    if (req.originalUrl?.includes('/me') || req.path?.includes('/me')) {
      logger.debug(
        {
          path: req.path,
          originalUrl: req.originalUrl,
          url: req.url,
          baseUrl: req.baseUrl,
          isAuthMeEndpoint,
        },
        'Auth /me endpoint path check',
      );
    }

    if (process.env.VERIFY_USER_ON_AUTH === 'true' || isAuthMeEndpoint) {
      const userId = parseInt(decoded.userId, 10);
      if (isNaN(userId)) {
        logger.debug(
          {
            decodedUserId: decoded.userId,
            parsedUserId: userId,
            typeOfDecodedUserId: typeof decoded.userId,
          },
          'Invalid user ID format in token',
        );
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid user ID in token',
        });
        return;
      }

      logger.debug(
        {
          userId,
          isAuthMeEndpoint,
          isTestEnv: process.env.NODE_ENV === 'test',
        },
        'Looking up user in database',
      );

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      });

      if (!user) {
        logger.debug(
          {
            userId,
            decodedUserId: decoded.userId,
            decodedEmail: decoded.email,
            isAuthMeEndpoint,
          },
          'User not found in database during authentication',
        );

        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Update request with fresh user data
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: decoded.organizationId ? parseInt(decoded.organizationId, 10) : undefined,
        permissions: decoded.permissions,
      };
    } else {
      // Use token data directly
      req.user = {
        id: parseInt(decoded.userId, 10),
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId ? parseInt(decoded.organizationId, 10) : undefined,
        permissions: decoded.permissions,
      };
    }

    // Log authentication success
    logger.debug(
      {
        userId: req.user.id,
        path: req.path,
        method: req.method,
      },
      'User authenticated',
    );

    next();
  } catch (error) {
    logger.error(
      {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      'Authentication middleware error',
    );
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = await verifyToken(token);

    if (decoded) {
      req.user = {
        id: parseInt(decoded.userId, 10),
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId ? parseInt(decoded.organizationId, 10) : undefined,
        permissions: decoded.permissions,
      };
    }

    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.error({ error }, 'Optional authentication error');
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.path,
        },
        'Authorization failed - insufficient role',
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Permission-based authorization middleware
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      logger.warn(
        {
          userId: req.user.id,
          userPermissions,
          requiredPermissions,
          path: req.path,
        },
        'Authorization failed - missing permissions',
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Organization-based authorization middleware
 */
export function requireOrganization(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (!req.user.organizationId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Organization membership required',
    });
  }

  next();
}

/**
 * Refresh token endpoint handler
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token required',
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload & {
      type: string;
      userId: string;
    };

    if (decoded.type !== 'refresh') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid token type',
      });
      return;
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId, 10) },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
    });

    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Refresh token error');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid refresh token',
    });
  }
}
