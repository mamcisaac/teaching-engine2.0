import type { Prisma } from '@teaching-engine/database';
import { endOfDay, parseISO } from 'date-fns';
import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
// Note: Authentication is handled at the route mounting level in index.ts

import { logger } from '../logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { prisma } from '../prisma';
import { getErrorMessage } from '../utils/type-guards';
import { getUserId } from '../utils/authHelpers';

import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Validation schemas
const calendarEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  allDay: z.boolean().default(false),
  eventType: z.enum(['PD_DAY', 'ASSEMBLY', 'TRIP', 'HOLIDAY', 'CUSTOM']),
  source: z.enum(['MANUAL', 'ICAL_FEED']).default('MANUAL'),
});

const querySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  eventType: z.enum(['PD_DAY', 'ASSEMBLY', 'TRIP', 'HOLIDAY', 'CUSTOM']).optional(),
});

// Get calendar events for a date range
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const queryValidation = querySchema.safeParse(req.query);
    if (!queryValidation.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: queryValidation.error.errors,
      });
      return;
    }
    const { start, end, eventType } = queryValidation.data;
    const userId = getUserId(req, res);
    if (!userId) return;

    const where: Prisma.CalendarEventWhereInput = {
      OR: [
        { teacherId: userId },
        { teacherId: null }, // School-wide events
      ],
    };

    if (start !== null && start !== undefined && start !== '') {
      where.start = { gte: parseISO(start) };
    }

    if (end !== null && end !== undefined && end !== '') {
      where.end = { lte: endOfDay(parseISO(end)) };
    }

    if (eventType !== null && eventType !== undefined) {
      where.eventType = eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { start: 'asc' },
    });

    res.json(events);
    return;
    return;
  } catch (_error) {
    logger.error('Error fetching calendar events:', getErrorMessage(_error));
    res.status(500).json({ error: 'Failed to fetch calendar events' });
    return;
  }
}));

// Create a new calendar event
router.post(
  '/',
  validateRequest(calendarEventSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const data = req.body as z.infer<typeof calendarEventSchema>;
      const userId = getUserId(req, res);
      if (!userId) return;

      const event = await prisma.calendarEvent.create({
        data: {
          title: data.title,
          description: data.description,
          start: new Date(data.start),
          end: new Date(data.end),
          allDay: data.allDay,
          eventType: data.eventType,
          source: data.source,
          teacherId: userId,
        },
      });

      res.status(201).json(event);
      return;
    } catch (_error) {
      logger.error('Error creating calendar event:', getErrorMessage(_error));
      res.status(500).json({ error: 'Failed to create calendar event' });
      return;
    }
  }),
);

// Update a calendar event
router.patch('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getUserId(req, res);
    if (!userId) return;
    const updates = req.body;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (event === null || event === undefined) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }

    // Convert date strings to Date objects if present
    if (updates.start !== null && updates.start !== undefined) {
      updates.start = new Date(updates.start);
    }
    if (updates.end !== null && updates.end !== undefined) {
      updates.end = new Date(updates.end);
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: updates,
    });

    res.json(updatedEvent);
    return;
  } catch (_error) {
    logger.error('Error updating calendar event:', getErrorMessage(_error));
    res.status(500).json({ error: 'Failed to update calendar event' });
    return;
  }
}));

// Delete a calendar event
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getUserId(req, res);
    if (!userId) return;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (event === null || event === undefined) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
    return;
  } catch (_error) {
    logger.error('Error deleting calendar event:', getErrorMessage(_error));
    res.status(500).json({ error: 'Failed to delete calendar event' });
    return;
  }
}));

// Holiday import removed - teachers can add holidays manually as needed

export { router };
