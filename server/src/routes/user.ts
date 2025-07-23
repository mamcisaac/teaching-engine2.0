/**
 * User Routes
 * Handles user profile and account management
 */

import type { PrismaClient } from '@teaching-engine/database';
import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { verifyPassword } from '../middleware/auth/password';
import { asyncHandler } from '../middleware/errorHandler';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
// Authentication middleware available if needed
import { validatePassword } from '../services/auth/authService';

// Use global Express Request type with user: { id: number; email: string }

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export function userRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const repositories = RepositoryFactory.getInstance(prisma);
  const userRepository = repositories.getUserRepository();

  // Get user profile
  router.get(
    '/profile',
    asyncHandler(async (req, res): Promise<void> => {
      if (!req.user.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;

      const user = await userRepository.findByIdWithoutPassword(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
      return;
    }),
  );

  // Update password
  router.put(
    '/password',
    asyncHandler(async (req, res): Promise<void> => {
      if (!req.user.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);

      // Validate new password
      await validatePassword(newPassword);

      // Get user with password
      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isValidPassword: boolean = await verifyPassword(currentPassword, user.password);
      if (isValidPassword !== true) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Update password
      await userRepository.updatePassword(userId, newPassword);

      res.json({ message: 'Password updated successfully' });
      return;
    }),
  );

  // Create user (admin only)
  router.post(
    '/create',
    asyncHandler(async (req, res): Promise<void> => {
      const userRole = (req as Request & { user?: { role?: string } }).user.role;

      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const { email, name, role } = req.body as { email: string; name: string; role?: string };

      // Sanitize input
      const sanitizedName = (name).replace(/<[^>]*>/g, ''); // Remove HTML tags

      const user = await userRepository.createUser({
        email,
        name: sanitizedName,
        role: role ?? 'USER',
        password: 'TempPassword123!', // Temporary password
      });

      res.status(201).json(user);
      return;
    }),
  );

  // Data validation endpoint
  router.post(
    '/data/validate',
    asyncHandler((req, res): void => {
      const data = req.body as Record<string, unknown>;

      // Type validation
      if (data.age !== undefined && typeof data.age !== 'number') {
        res.status(400).json({ error: 'Invalid data type: age must be a number' });
        return;
      }

      if (data.active !== undefined && typeof data.active !== 'boolean') {
        res.status(400).json({ error: 'Invalid data type: active must be a boolean' });
        return;
      }

      if (data.tags !== undefined && !Array.isArray(data.tags)) {
        res.status(400).json({ error: 'Invalid data type: tags must be an array' });
        return;
      }

      if (data.metadata !== undefined && (typeof data.metadata !== 'object' || data.metadata === null)) {
        res.status(400).json({ error: 'Invalid data type: metadata must be an object' });
        return;
      }

      res.json({ valid: true });
      return;
    }),
  );

  return router;
}
