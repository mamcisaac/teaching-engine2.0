/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { sign, verify } from 'jsonwebtoken';

import { logger } from '../../logger';

import type { TokenPayload} from './types';
import { JWTConfig as _JWTConfig } from './types';

// JWT Configuration
const config = {
  secret: process.env.JWT_SECRET ?? 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  issuer: 'teaching-engine',
  audience: 'teaching-engine-users',
} as const;

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: {
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
    permissions: user.permissions ?? [],
  };

  return sign(payload, config.secret, {
    expiresIn: '24h',
    issuer: config.issuer,
    audience: config.audience,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: number): string {
  return sign({ userId: userId.toString(), type: 'refresh' }, config.secret, {
    expiresIn: '7d',
    issuer: config.issuer,
    audience: config.audience,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = verify(token, config.secret, {
      issuer: config.issuer,
      audience: config.audience,
    }) as TokenPayload;

    return decoded;
  } catch (_error) {
    logger.error({ error: _error }, 'Token verification failed');
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || authHeader === '') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: {
  id: number;
  email: string;
  role: string;
  organizationId?: number;
  permissions?: string[];
}): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user.id),
  };
}

// Re-export for backward compatibility
export const generateToken = generateAccessToken;
