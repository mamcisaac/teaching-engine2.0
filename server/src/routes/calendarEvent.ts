import { Router } from 'express';
import type { VEvent } from 'node-ical';
import { prisma } from '../prisma';
import { z } from 'zod';
import { validate } from '../validation';

const router = Router();

/**
 * Validation schema for creating calendar events.
 */
const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  allDay: z.boolean().optional().default(false),
  eventType: z.enum(['PD_DAY', 'ASSEMBLY', 'TRIP', 'HOLIDAY', 'CUSTOM']),
  source: z.enum(['MANUAL', 'ICAL_FEED', 'SYSTEM']).optional().default('MANUAL'),
  teacherId: z.number().int().optional(),
  schoolId: z.number().int().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const events = await prisma.calendarEvent.findMany({
      where: {
        ...(from && { start: { gte: new Date(from) } }),
        ...(to && { end: { lte: new Date(to) } }),
      },
      orderBy: { start: 'asc' },
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(eventSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof eventSchema>;
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
        allDay: data.allDay,
        eventType: data.eventType,
        source: data.source,
        teacherId: data.teacherId,
        schoolId: data.schoolId,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

/**
 * Import events from an iCal feed URL and store them as HOLIDAY events.
 */
router.post('/sync/ical', async (req, res, next) => {
  try {
    const { feedUrl } = req.body as { feedUrl: string };
    if (!feedUrl) return res.status(400).json({ error: 'feedUrl required' });
    const ical = await import('node-ical');
    const data = (await ical.async.fromURL(feedUrl)) as Record<string, VEvent>;
    const eventsToCreate = Object.values(data)
      .filter((e): e is VEvent => e.type === 'VEVENT')
      .map((e) => ({
        title: e.summary || 'Untitled',
        description: e.description || undefined,
        start: new Date(e.start),
        end: new Date(e.end),
        allDay: e.datetype === 'date',
        eventType: 'HOLIDAY' as const,
        source: 'ICAL_FEED' as const,
      }));
    const created = await prisma.calendarEvent.createMany({ data: eventsToCreate });
    res.json({ imported: created.count });
  } catch (err) {
    next(err);
  }
});

export default router;
