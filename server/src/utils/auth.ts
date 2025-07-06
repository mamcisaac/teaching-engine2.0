import bcrypt, { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const options: SignOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  const options: SignOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
