/**
 * Authentication Service
 * Core authentication and authorization logic
 */

import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@teaching-engine/database';
import logger from '@/logger';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

/**
 * Generate JWT token for user
 */
export async function generateAuthToken(
  userId: string,
  expiresIn: string = TOKEN_EXPIRY
): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const payload = { userId };
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Validate password strength
 */
export async function validatePassword(password: string): Promise<boolean> {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error('Password does not meet security requirements');
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new Error('Password does not meet security requirements');
  }

  // Check against common passwords
  const commonPasswords = ['password', '123456', 'qwerty'];
  if (commonPasswords.includes(password.toLowerCase())) {
    throw new Error('Password does not meet security requirements');
  }

  return true;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<{ userId: string }> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.verify(token, secret) as { userId: string };
}

/**
 * Authenticate user with email and password
 */
export async function authenticate(
  email: string,
  password: string,
  prisma: PrismaClient
): Promise<AuthResult> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn(`Failed login attempt for email: ${email}`);
    throw new Error('Invalid credentials');
  }

  // Compare password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    logger.warn(`Failed login attempt for user: ${user.id}`);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = await generateAuthToken(user.id.toString());

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: {
      ...userWithoutPassword,
      id: userWithoutPassword.id.toString()
    } as AuthUser,
    token,
  };
}

/**
 * Check user permissions
 */
export async function checkPermissions(
  user: { role?: string; permissions?: string[] },
  requiredPermission: string
): Promise<boolean> {
  // Admin has all permissions
  if (user.role === 'ADMIN') {
    return true;
  }

  // Check specific permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(requiredPermission);
  }

  // Check role-based permissions
  const rolePermissions: Record<string, string[]> = {
    USER: ['read'],
    MODERATOR: ['read', 'write'],
    ADMIN: ['read', 'write', 'delete', 'admin.access'],
  };

  const userPermissions = rolePermissions[user.role || ''] || [];
  return userPermissions.includes(requiredPermission);
}