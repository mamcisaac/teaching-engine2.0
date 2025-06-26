import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, CalendarEventType, CalendarEventSource, Prisma } from '@teaching-engine/database';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const calendarEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  allDay: z.boolean().default(false),
  eventType: z.enum(['PD_DAY', 'ASSEMBLY', 'TRIP', 'HOLIDAY', 'CUSTOM']),
  source: z.enum(['MANUAL', 'ICAL_FEED', 'SYSTEM']).default('MANUAL'),
});

const querySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  eventType: z.enum(['PD_DAY', 'ASSEMBLY', 'TRIP', 'HOLIDAY', 'CUSTOM']).optional(),
});

// Get calendar events for a date range
router.get('/', requireAuth, validateRequest({ query: querySchema }), async (req, res) => {
  try {
    const { start, end, eventType } = req.query as z.infer<typeof querySchema>;
    const userId = req.user!.userId;

    const where: Prisma.CalendarEventWhereInput = {
      OR: [
        { teacherId: parseInt(userId) },
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
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create a new calendar event
router.post('/', requireAuth, validateRequest({ body: calendarEventSchema }), async (req, res) => {
  try {
    const data = req.body as z.infer<typeof calendarEventSchema>;
    const userId = req.user!.userId;

    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
        allDay: data.allDay,
        eventType: data.eventType,
        source: data.source,
        teacherId: parseInt(userId),
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update a calendar event
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updates = req.body;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: parseInt(userId),
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
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete a calendar event
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check ownership
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        teacherId: parseInt(userId),
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// Import holidays from a standard calendar
router.post('/import-holidays', requireAuth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.body;

    // Common Ontario school holidays
    const holidays = [
      { title: 'Labour Day', month: 9, day: 1 },
      { title: 'Thanksgiving', month: 10, day: 2 }, // 2nd Monday
      { title: 'Winter Break Start', month: 12, day: 23 },
      { title: 'Winter Break End', month: 1, day: 2 },
      { title: 'Family Day', month: 2, day: 3 }, // 3rd Monday
      { title: 'March Break Start', month: 3, day: 2 }, // 2nd week
      { title: 'March Break End', month: 3, day: 3 },
      { title: 'Good Friday', month: 4, day: 1 }, // Varies
      { title: 'Easter Monday', month: 4, day: 2 }, // Varies
      { title: 'Victoria Day', month: 5, day: 3 }, // Monday before May 25
    ];

    const createdEvents = [];

    for (const holiday of holidays) {
      const date = new Date(year, holiday.month - 1, holiday.day);
      
      const existing = await prisma.calendarEvent.findFirst({
        where: {
          title: holiday.title,
          start: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      });

      if (!existing) {
        const event = await prisma.calendarEvent.create({
          data: {
            title: holiday.title,
            start: startOfDay(date),
            end: endOfDay(date),
            allDay: true,
            eventType: CalendarEventType.HOLIDAY,
            source: CalendarEventSource.SYSTEM,
          },
        });
        createdEvents.push(event);
      }
    }

    res.json({
      message: `Imported ${createdEvents.length} holidays`,
      events: createdEvents,
    });
  } catch (error) {
    console.error('Error importing holidays:', error);
    res.status(500).json({ error: 'Failed to import holidays' });
  }
});

export default router;