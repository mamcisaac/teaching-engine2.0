/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication Endpoints Router
 * Exposes authentication middleware functions as API endpoints
 */

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
function validateAuthInputs(isRegister = false) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let { email } = req.body;
    const { password } = req.body;

    // Check for missing or non-string email/password
    if (email === null || email === undefined || email === '' || 
        password === null || password === undefined || password === '' || 
        typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Trim email whitespace
    email = email.trim();
    req.body.email = email;

    // Check basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // For register, check if name is provided
    if (isRegister && (req.body.name === null || req.body.name === undefined || req.body.name === '')) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    next();
  };
}

// Create router with optional prisma instance for testing
function createAuthRouter(prisma = defaultPrisma) {
  const router = Router();

  // Public endpoints with rate limiting and custom validation
  router.post(
    '/login',
    authRateLimiter,
    validateAuthInputs(false),
    validateRequest(loginSchema),
    login,
  );
  router.post(
    '/register',
    authRateLimiter,
    validateAuthInputs(true),
    validateRequest(registerSchema),
    register,
  );
  router.post(
    '/forgot-password',
    authRateLimiter,
    validateRequest(forgotPasswordSchema),
    forgotPassword,
  );
  router.post(
    '/reset-password',
    authRateLimiter,
    validateRequest(resetPasswordSchema),
    resetPassword,
  );

  // Protected endpoints
  router.post('/logout', authenticate, logout);
  router.post(
    '/change-password',
    authenticate,
    validateRequest(changePasswordSchema),
    changePassword,
  );

  // Session check endpoint - authentication middleware handles all error cases
  router.get('/me', authenticate, (req: Request, res: Response): void => {
    void (async () => {
      try {
      // Always fetch fresh user data from database for /me endpoint
      if (req.user?.id === null || req.user?.id === undefined) {
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
      return;
      return;
    } catch (_error) {
      // This should rarely happen as authenticate middleware handles most errors
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user data',
      });
      return;
    }
    })();
  });

  // Simple auth check endpoint - returns userId if authenticated
  router.get('/check', authenticate, (req: Request, res: Response): void => {
    const userId = req.user?.id;
    if (userId === null || userId === undefined) {
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
