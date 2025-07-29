import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
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
  return await hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === '') {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  // Convert common time formats to seconds for TypeScript compatibility
  const expiresInSeconds = expiresIn === '7d' ? 7 * 24 * 60 * 60 : 
                          expiresIn === '1h' ? 60 * 60 :
                          expiresIn === '24h' ? 24 * 60 * 60 :
                          parseInt(expiresIn) || 7 * 24 * 60 * 60; // fallback to 7 days
  const options: SignOptions = {
    expiresIn: expiresInSeconds,
  };
  return sign(payload, secret, options);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret === '') {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
  // Convert common time formats to seconds for TypeScript compatibility
  const expiresInSeconds = expiresIn === '30d' ? 30 * 24 * 60 * 60 : 
                          expiresIn === '7d' ? 7 * 24 * 60 * 60 :
                          expiresIn === '1h' ? 60 * 60 :
                          parseInt(expiresIn) || 30 * 24 * 60 * 60; // fallback to 30 days
  const options: SignOptions = {
    expiresIn: expiresInSeconds,
  };
  return sign(payload, secret, options);
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
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === '') {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === '') {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  try {
    return verify(token, process.env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
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
