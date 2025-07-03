/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication Endpoints Router
 * Exposes authentication middleware functions as API endpoints
 */

import { Router } from 'express';
// import { Request, Response, NextFunction } from 'express';
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

// Create router with optional prisma instance for testing
function createAuthRouter(prisma = defaultPrisma) {
  const router = Router();

  // Public endpoints with rate limiting
  router.post('/login', authRateLimiter as any, validateRequest(loginSchema), login);
  router.post('/register', authRateLimiter as any, validateRequest(registerSchema), register);
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

  // Session check endpoint with user verification
  router.get('/me', authenticate, async (req, res) => {
    try {
      // Always verify user exists in database
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
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
  });

  return router;
}

// Export default router instance
const router = createAuthRouter();
export default router;

// Export factory function for testing
export { createAuthRouter };
