import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@teaching-engine/database';
// Note: Authentication is handled at the route mounting level in index.ts
import { validateRequest } from '../middleware/validateRequest';
import { endOfDay, parseISO } from 'date-fns';
import { prisma } from '../prisma';
import logger from '../logger';
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
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const queryValidation = querySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: queryValidation.error.errors,
      });
    }
    const { start, end, eventType } = queryValidation.data;
    const userId = req.user!.id;

    const where: Prisma.CalendarEventWhereInput = {
      OR: [
        { teacherId: userId },
        { teacherId: null }, // School-wide events
      ],
    };

    if (start) {
      where.start = { gte: parseISO(start) };
    }

    if (end) {
      where.end = { lte: endOfDay(parseISO(end)) };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { start: 'asc' },
    });

    res.json(events);
  } catch (_error) {
    logger.error('Error fetching calendar events:', _error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create a new calendar event
router.post('/', validateRequest(calendarEventSchema), async (req: Request, res: Response) => {
  try {
    const data = req.body as z.infer<typeof calendarEventSchema>;
    const userId = req.user!.id;

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
  } catch (_error) {
    logger.error('Error creating calendar event:', _error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update a calendar event
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    // Convert date strings to Date objects if present
    if (updates.start) updates.start = new Date(updates.start);
    if (updates.end) updates.end = new Date(updates.end);

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: updates,
    });

    res.json(updatedEvent);
  } catch (_error) {
    logger.error('Error updating calendar event:', _error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete a calendar event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (_error) {
    logger.error('Error deleting calendar event:', _error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// Holiday import removed - teachers can add holidays manually as needed

export default router;
