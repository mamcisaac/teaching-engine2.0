/**
 * Notifications Routes
 * Handles user notification management
 */

import { Router, Request } from 'express';
import { z } from 'zod';
import { notificationService, NotificationPreferences } from '../services/notificationService';

const router = Router();

// Validation schemas
const markAsReadSchema = z.object({
  notificationId: z.string().min(1),
});

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  quietHours: z
    .object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })
    .optional(),
  categories: z
    .record(
      z.object({
        enabled: z.boolean(),
        channels: z.array(z.enum(['in_app', 'email', 'push'])),
      }),
    )
    .optional(),
});

// Get user's notifications
router.get('/', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const unreadOnly = req.query.unread === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
    });

    res.json(result);
  } catch (err) {
    console.error('Error getting notifications:', err);
    next(err);
  }
});

// Mark notification as read
router.post('/mark-read', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = markAsReadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { notificationId } = validation.data;

    const success = await notificationService.markAsRead(notificationId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    next(err);
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const markedCount = await notificationService.markAllAsRead(userId);

    res.json({ success: true, markedCount });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    next(err);
  }
});

// Delete a notification
router.delete('/:id', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notificationId = req.params.id;
    const success = await notificationService.deleteNotification(notificationId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting notification:', err);
    next(err);
  }
});

// Get user's notification preferences
router.get('/preferences', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await notificationService.getUserPreferences(userId);
    res.json(preferences);
  } catch (err) {
    console.error('Error getting notification preferences:', err);
    next(err);
  }
});

// Update user's notification preferences
router.put('/preferences', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = updatePreferencesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    await notificationService.updatePreferences(
      userId,
      validation.data as Partial<NotificationPreferences>,
    );

    const updatedPreferences = await notificationService.getUserPreferences(userId);
    res.json(updatedPreferences);
  } catch (err) {
    console.error('Error updating notification preferences:', err);
    next(err);
  }
});

// Send a test notification (for development/testing)
router.post('/test', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only allow in development or test environments
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test notifications not available in production' });
    }

    const notificationId = await notificationService.sendNotification(userId, {
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from Teaching Engine 2.0.',
      priority: 'low',
      channels: ['in_app'],
    });

    res.json({ success: true, notificationId });
  } catch (err) {
    console.error('Error sending test notification:', err);
    next(err);
  }
});

export default router;
