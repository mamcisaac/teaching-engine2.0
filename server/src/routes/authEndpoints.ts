/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication Endpoints Router
 * Exposes authentication middleware functions as API endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  login,
  register,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  authenticate,
} from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { authRateLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { prisma as defaultPrisma } from '@teaching-engine/database';

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
  return (req: Request, res: Response, next: NextFunction) => {
    let { email, password } = req.body;

    // Check for missing or non-string email/password
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Trim email whitespace
    email = email.trim();
    req.body.email = email;

    // Check basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // For register, check if name is provided
    if (isRegister && !req.body.name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    next();
  };
}

// Create router with optional prisma instance for testing
function createAuthRouter(prisma = defaultPrisma) {
  const router = Router();

  // Public endpoints with rate limiting and custom validation
  router.post('/login', authRateLimiter as any, validateAuthInputs(false), validateRequest(loginSchema), login);
  router.post('/register', authRateLimiter as any, validateAuthInputs(true), validateRequest(registerSchema), register);
  router.post(
    '/forgot-password',
    authRateLimiter as any,
    validateRequest(forgotPasswordSchema),
    forgotPassword,
  );
  router.post(
    '/reset-password',
    authRateLimiter as any,
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
  router.get('/me', authenticate, async (req, res) => {
    try {
      // Always fetch fresh user data from database for /me endpoint
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        // This shouldn't happen as authenticate middleware already checked
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Return user data directly in response body
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      // This should rarely happen as authenticate middleware handles most errors
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user data',
      });
    }
  });

  // Simple auth check endpoint - returns userId if authenticated
  router.get('/check', authenticate, (req, res) => {
    res.json({ userId: req.user!.id });
  });

  return router;
}

// Export default router instance
const router = createAuthRouter();
export default router;

// Export factory function for testing
export { createAuthRouter };
