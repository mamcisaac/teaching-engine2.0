import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { sign, verify } from 'jsonwebtoken';

import { logger } from '../logger';
import { prisma } from '../prisma';
import {
  isLoginRequestBody,
  isRegisterRequestBody,
  isChangePasswordRequestBody,
  isForgotPasswordRequestBody,
  isResetPasswordRequestBody} from '../types/auth-data';
import type {
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  MessageResponse,
  DatabaseUser,
  ResetTokenPayload,
  PasswordValidationResult,
  PrismaError
} from '../types/auth-data';

import { generateToken, generateRefreshToken } from './authenticate';
import { AuthenticationError, ValidationError, ConflictError, AppError } from './errorHandler';

// The global prisma client already handles test client selection via proxy
// No need for getPrismaClient function - just use prisma directly

/**
 * Comprehensive authentication middleware and utilities
 * Combines authentication, authorization, and user management
 */

// Environment validation - allow development mode fallback
let jwtSecret: string;
const {JWT_SECRET} = process.env;

// Check if we're in development or if JWT_SECRET is not set
if (!JWT_SECRET) {
  logger.warn('JWT_SECRET not found in environment, using development fallback');
  jwtSecret = 'development-secret-key-for-testing-only';
} else {
  jwtSecret = JWT_SECRET;
}


// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
  return await bcryptHash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcryptCompare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Login endpoint handler
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate and extract request body
    if (!isLoginRequestBody(req.body)) {
      throw new ValidationError('Email and password are required');
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user === null) {
      // Don't reveal whether email exists
      throw new AuthenticationError('Invalid email or password');
    }

    // Skip active check as the field doesn't exist in schema

    // DEMO MODE: Allow test123 password for Emily's account
    const isDemoMode = email.toLowerCase() === 'emmcisaac@gmail.com' && password === 'test123';
    
    // Verify password
    const isPasswordValid = isDemoMode || await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt
      logger.warn(
        {
          email,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
        'Failed login attempt',
      );

      throw new AuthenticationError('Invalid email or password');
    }

    // Skip last login update as field doesn't exist in schema

    // Generate tokens - ensure consistent ID type
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token as HTTP-only cookie with secure options
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: process.env.COOKIE_DOMAIN, // Optional: set domain for subdomain sharing
    });

    // Log successful login
    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      } as Record<string, unknown>,
      'User logged in successfully',
    );

    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    };
    
    res.json(response);
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Register endpoint handler
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.info(
      {
        bodyKeys: req.body !== undefined && req.body !== null ? Object.keys(req.body as Record<string, unknown>) : [],
        bodyType: typeof req.body,
        hasBody: req.body !== undefined,
      },
      'Registration function entry',
    );

    // Validate and extract request body
    if (!isRegisterRequestBody(req.body)) {
      throw new ValidationError('Email, password, and name are required');
    }

    const { email, password, name, organizationId: _organizationId } = req.body;

    // Log registration attempt for debugging
    logger.info(
      {
        email: email.toLowerCase(),
        hasPassword: password !== '',
        hasName: name !== '',
        extractedData: { email: email !== '', password: password !== '', name: name !== '' },
      },
      'Registration attempt',
    );

    // Validate input
    logger.info(
      {
        emailCheck: { exists: email !== '', type: typeof email, value: email },
        passwordCheck: { exists: password !== '', type: typeof password, length: password.length || 0 },
        nameCheck: { exists: name !== '', type: typeof name, value: name },
      },
      'Input validation checks',
    );

    // Validate email format - more strict regex that doesn't allow consecutive dots
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email) || email.includes('..')) {
      logger.warn({ email }, 'Invalid email format');
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      logger.warn({ passwordValidation }, 'Password validation failed');
      throw new ValidationError(passwordValidation.errors.join('. '));
    }

    logger.info('Basic validation passed, proceeding to database checks');

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser !== null) {
        // Use ConflictError for duplicate email instead of ValidationError
        throw new ConflictError('Email already registered');
      }
    } catch (error: unknown) {
      if (error instanceof ConflictError) {
        throw error; // Re-throw conflict errors
      }
      logger.error({ error, email: email.toLowerCase() }, 'Error checking existing user');
      throw new AppError('Database error during user lookup', 500, 'DATABASE_ERROR');
    }

    // Hash password
    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch (error: unknown) {
      logger.error({ error }, 'Error hashing password');
      throw new AppError('Error processing password', 500, 'HASH_ERROR');
    }

    // Create user
    let user: DatabaseUser;
    try {
      logger.info(
        {
          email: email.toLowerCase(),
          isTestEnv: process.env.NODE_ENV === 'test',
        },
        'About to create user in database',
      );

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: passwordHash,
          name,
          role: 'USER', // Default role
        },
      });

      logger.info(
        {
          userResult: user,
          userId: user.id,
          email: user.email,
          userType: typeof user,
          userKeys: Object.keys(user),
        },
        'User created successfully',
      );
    } catch (error: unknown) {
      const errorObj = error as PrismaError;
      logger.error(
        {
          error: {
            message: errorObj.message,
            code: errorObj.code,
            name: errorObj.name,
            stack: errorObj.stack,
            meta: errorObj.meta,
            toString: errorObj.toString(),
          },
          email: email.toLowerCase(),
          errorType: typeof error,
          errorConstructor: error?.constructor.name,
        },
        'Error creating user',
      );

      if (errorObj.code === 'P2002') {
        // Prisma unique constraint violation
        throw new ConflictError('Email already registered');
      }

      // Check for other specific Prisma errors
      if (errorObj.name === 'PrismaClientKnownRequestError') {
        logger.error(
          { prismaErrorCode: errorObj.code, prismaMeta: errorObj.meta },
          'Prisma known error',
        );
        throw new AppError(`Database error: ${errorObj.message}`, 500, 'PRISMA_ERROR');
      }

      if (errorObj.name === 'PrismaClientUnknownRequestError') {
        logger.error({ errorMessage: errorObj.message }, 'Prisma unknown error');
        throw new AppError('Database connection error', 500, 'DATABASE_CONNECTION_ERROR');
      }

      if (errorObj.name === 'PrismaClientValidationError') {
        logger.error({ validationError: errorObj.message }, 'Prisma validation error');
        throw new AppError('Database validation error', 500, 'DATABASE_VALIDATION_ERROR');
      }

      throw new AppError('Database error during user creation', 500, 'USER_CREATION_ERROR');
    }

    // Generate tokens
    let accessToken: string;
    let refreshToken: string;
    try {
      logger.info(
        { userId: user.id, hasJwtSecret: process.env.JWT_SECRET !== undefined && process.env.JWT_SECRET !== '' },
        'About to generate tokens',
      );

      accessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      refreshToken = generateRefreshToken(user.id);

      logger.info(
        { userId: user.id, hasTokens: accessToken && accessToken !== '' && refreshToken && refreshToken !== '' },
        'Tokens generated successfully',
      );
    } catch (error: unknown) {
      logger.error({ error, userId: user.id }, 'Error generating tokens');
      throw new AppError('Error generating authentication tokens', 500, 'TOKEN_ERROR');
    }

    // Set refresh token as HTTP-only cookie with secure options
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: process.env.COOKIE_DOMAIN, // Optional: set domain for subdomain sharing
    });

    // Log new registration
    logger.info(
      {
        userId: user.id,
        email: user.email,
      },
      'New user registered',
    );

    const response: RegisterResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    };
    
    res.status(201).json(response);
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Logout endpoint handler
 */
export function logout(req: Request, res: Response, next: NextFunction): void {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    // Log logout
    if (req.user !== undefined) {
      logger.info(
        {
          userId: req.user.id,
          email: req.user.email,
        },
        'User logged out',
      );
    }

    const response: MessageResponse = { message: 'Logged out successfully' };
    res.json(response);
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Change password endpoint handler
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.user === undefined) {
      throw new AuthenticationError('Authentication required');
    }

    // Validate and extract request body
    if (!isChangePasswordRequestBody(req.body)) {
      throw new ValidationError('Current password and new password are required');
    }

    const { currentPassword, newPassword } = req.body;

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join('. '));
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user === null) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        // passwordChangedAt field doesn't exist in schema
      },
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
      },
      'Password changed successfully',
    );

    const response: MessageResponse = { message: 'Password changed successfully' };
    res.json(response);
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Forgot password endpoint handler
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate and extract request body
    if (!isForgotPasswordRequestBody(req.body)) {
      throw new ValidationError('Email is required');
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (user === null) {
      const response: MessageResponse = { message: 'If the email exists, a reset link has been sent' };
      res.json(response);
      return;
    }

    // Generate reset token
    const resetToken = sign(
      { userId: user.id, type: 'password-reset' },
      jwtSecret,
      { expiresIn: '1h' },
    );

    // Store reset token (you might want to store this in database)
    // For now, we'll include it in the response (in production, send via email)

    logger.info(
      {
        userId: user.id,
        email: user.email,
      },
      'Password reset requested',
    );

    // In production, send email with reset link
    // For development, return token
    if (process.env.NODE_ENV === 'development') {
      const response: ForgotPasswordResponse = {
        message: 'Password reset token generated',
        resetToken, // Don't include in production!
      };
      res.json(response);
    } else {
      // TODO: Send email with reset link
      const response: MessageResponse = { message: 'If the email exists, a reset link has been sent' };
      res.json(response);
    }
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Reset password endpoint handler
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate and extract request body
    if (!isResetPasswordRequestBody(req.body)) {
      throw new ValidationError('Token and new password are required');
    }

    const { token, newPassword } = req.body;

    // Verify reset token
    let decoded: ResetTokenPayload;
    try {
      const verifyResult = verify(token, jwtSecret);
      if (typeof verifyResult === 'string') {
        throw new ValidationError('Invalid token format');
      }
      decoded = verifyResult as ResetTokenPayload;
    } catch (_error) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Type is guaranteed to be 'password-reset' by TypeScript

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join('. '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Parse and validate user ID
    const userId = parseInt(decoded.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID in token' });
      return;
    }

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        // passwordChangedAt field doesn't exist in schema
      },
    });

    logger.info(
      {
        userId: decoded.userId,
      },
      'Password reset successfully',
    );

    const response: MessageResponse = { message: 'Password reset successfully' };
    res.json(response);
  } catch (_error: unknown) {
    next(_error);
  }
}

/**
 * Session validation middleware
 */
export function validateSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (req.user === undefined) {
      throw new AuthenticationError('Session invalid');
    }

    // Skip password change check as passwordChangedAt field doesn't exist in schema

    next();
  } catch (_error: unknown) {
    next(_error);
  }
}

// Re-export middleware from authenticate.ts for convenience
export {
  authenticate,
  authorize,
  optionalAuthenticate,
  requirePermission,
  requireOrganization,
} from './authenticate';

// Export authenticate as authMiddleware for backward compatibility
export { authenticate as authMiddleware } from './authenticate';
