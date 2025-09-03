/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication Endpoints Router
 * Exposes authentication middleware functions as API endpoints
 */

import { isNonEmptyString } from '../shared/utils/typeGuards';
import { prisma as defaultPrisma } from '@teaching-engine/database';
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import {
  login,
  register,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  authenticate,
} from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validateRequest';

// Async middleware wrapper to handle Promise-returning middleware
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  name: z.string().min(1, 'Name is required'),
  organizationId: z.number().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Middleware to validate auth inputs with test-compatible error messages
function validateAuthInputs(isRegister = false): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { email: rawEmail, password } = req.body as { email?: unknown; password?: unknown; name?: unknown };

    // Check for missing or non-string email/password
    if (!isNonEmptyString(rawEmail) || !isNonEmptyString(password)) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // At this point, TypeScript knows email is a string
    const email = rawEmail.trim();
    (req.body as { email: string }).email = email;

    // Check basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // For register, check if name is provided
    if (isRegister && !isNonEmptyString((req.body as { name?: unknown }).name)) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    next();
  };
}

// Create router with optional prisma instance for testing
function createAuthRouter(prisma = defaultPrisma): Router {
  const router = Router();

  // Public endpoints with rate limiting and custom validation
  router.post(
    '/login',
    authRateLimiter,
    validateAuthInputs(false),
    asyncHandler(validateRequest(loginSchema)),
    asyncHandler(login),
  );
  router.post(
    '/register',
    authRateLimiter,
    validateAuthInputs(true),
    asyncHandler(validateRequest(registerSchema)),
    asyncHandler(register),
  );
  router.post(
    '/forgot-password',
    authRateLimiter,
    asyncHandler(validateRequest(forgotPasswordSchema)),
    asyncHandler(forgotPassword),
  );
  router.post(
    '/reset-password',
    authRateLimiter,
    asyncHandler(validateRequest(resetPasswordSchema)),
    asyncHandler(resetPassword),
  );

  // Protected endpoints
  router.post('/logout', asyncHandler(authenticate), logout);
  router.post(
    '/change-password',
    asyncHandler(authenticate),
    asyncHandler(validateRequest(changePasswordSchema)),
    asyncHandler(changePassword),
  );

  // Session check endpoint - authentication middleware handles all error cases
  router.get('/me', asyncHandler(authenticate), asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Always fetch fresh user data from database for /me endpoint
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user === null) {
      // This shouldn't happen as authenticate middleware already checked
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    // Return user data directly in response body
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }));

  // Simple auth check endpoint - returns userId if authenticated
  router.get('/check', asyncHandler(authenticate), (req: Request, res: Response): void => {
    if (!req.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    res.json({ userId });
    return;
  });

  return router;
}

// Export default router instance
const router = createAuthRouter();
export { router };

// Export factory function for testing
export { createAuthRouter };
