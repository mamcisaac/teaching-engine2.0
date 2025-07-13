import type { Request } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import { prisma } from '../prisma';
const router = Router();

// Get notifications for authenticated user
router.get('/', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;

    // Build where clause
    const where: { userId: number; read?: boolean } = { userId };
    if (read !== undefined) {
      where.read = read;
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.json({
      notifications,
      total,
      unreadCount,
      limit,
      offset,
    });
    return;
  } catch (err) {
    logger.error('Error fetching notifications:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
  })();
});

// Mark notification as read
router.patch('/:id/read', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      res.status(400).json({ error: 'Invalid notification ID' });
      return;
    }

    // Check if notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    res.json(updated);
    return;
  } catch (err) {
    logger.error('Error marking notification as read:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to update notification' });
  }
  })();
});

// Mark all notifications as read
router.patch('/read-all', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ updated: result.count });
    return;
  } catch (err) {
    logger.error('Error marking all notifications as read:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to update notifications' });
  }
  })();
});

// Delete notification
router.delete('/:id', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      res.status(400).json({ error: 'Invalid notification ID' });
      return;
    }

    // Check if notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({ success: true });
    return;
  } catch (err) {
    logger.error('Error deleting notification:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to delete notification' });
  }
  })();
});

// Clear all notifications
router.delete('/clear-all', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    res.json({ deleted: result.count });
    return;
  } catch (err) {
    logger.error('Error clearing notifications:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
  })();
});

// Create a test notification (for development)
router.post('/test', (req: Request, res): void => {
  void (async () => {
    try {
    const userId = req.user?.id || 0;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'info',
        title: typeof req.body.title === 'string' ? req.body.title : 'Test Notification',
        message: typeof req.body.message === 'string' ? req.body.message : 'This is a test notification',
        data: req.body.data || {},
      },
    });

    res.json(notification);
    return;
  } catch (err) {
    logger.error('Error creating test notification:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Failed to create notification' });
  }
  })();
});

export { router };
