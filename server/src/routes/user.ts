/**
 * User Routes
 * Handles user profile and account management
 */

import { Router, Request } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireAuth } from '@/middleware/auth';
import { validatePassword, hashPassword } from '@/services/authService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export function userRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Get user profile
  router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
    const userId = parseInt((req as AuthenticatedRequest).user!.userId);
    
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
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  }));

  // Update password
  router.put('/password', requireAuth, asyncHandler(async (req, res) => {
    const userId = parseInt((req as AuthenticatedRequest).user!.userId);
    const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
    
    // Validate new password
    await validatePassword(newPassword);
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    res.json({ message: 'Password updated successfully' });
  }));

  // Create user (admin only)
  router.post('/create', requireAuth, asyncHandler(async (req, res) => {
    const userRole = (req as Request & { user?: { role?: string } }).user?.role;
    
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { email, name, role } = req.body;
    
    // Sanitize input
    const sanitizedName = name.replace(/<[^>]*>/g, ''); // Remove HTML tags
    
    const user = await prisma.user.create({
      data: {
        email,
        name: sanitizedName,
        role: role || 'USER',
        password: await hashPassword('TempPassword123!'), // Temporary password
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }));

  // Data validation endpoint
  router.post('/data/validate', asyncHandler(async (req, res) => {
    const data = req.body;
    
    // Type validation
    if (data.age !== undefined && typeof data.age !== 'number') {
      return res.status(400).json({ error: 'Invalid data type: age must be a number' });
    }
    
    if (data.active !== undefined && typeof data.active !== 'boolean') {
      return res.status(400).json({ error: 'Invalid data type: active must be a boolean' });
    }
    
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      return res.status(400).json({ error: 'Invalid data type: tags must be an array' });
    }
    
    if (data.metadata !== undefined && typeof data.metadata !== 'object') {
      return res.status(400).json({ error: 'Invalid data type: metadata must be an object' });
    }
    
    res.json({ valid: true });
  }));

  return router;
}