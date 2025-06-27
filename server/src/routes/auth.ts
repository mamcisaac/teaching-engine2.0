/**
 * Authentication Routes
 * Handles user authentication and registration
 */

import { Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { z } from 'zod';
import {
  authenticate,
  generateAuthToken,
  hashPassword,
  validatePassword,
} from '@/services/authService';
import { asyncHandler } from '@/middleware/errorHandler';
import logger from '@/logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export function authRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Login endpoint
  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { email, password } = loginSchema.parse(req.body);

      try {
        const result = await authenticate(email, password, prisma);

        // Set JWT in httpOnly cookie for security
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? ('strict' as const) : ('lax' as const),
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        };

        res.cookie('authToken', result.token, cookieOptions);
        res.json(result);
      } catch (error) {
        logger.warn(`Failed login attempt for email: ${email}`, { error });
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }),
  );

  // Register endpoint
  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const { email, password, name } = registerSchema.parse(req.body);

      // Validate password strength
      await validatePassword(password);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
        },
      });

      // Generate token
      const token = await generateAuthToken(user.id.toString(), user.email);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      // Set JWT in httpOnly cookie for security
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ('strict' as const) : ('lax' as const),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      };

      res.cookie('authToken', token, cookieOptions);
      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    }),
  );

  return router;
}
