import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { authRequest } from '../test-auth-helper';
import { prisma } from '../../src/prisma';
import { setupAuthenticatedTest } from '../test-setup-helpers';

describe('calendar events', () => {
  const auth = authRequest(app);
  beforeAll(async () => {
    // prisma is imported directly
  });

  beforeEach(async () => {
    // Clean up calendar events before each test to prevent contamination
    await prisma.calendarEvent.deleteMany({});

    // Setup auth for each test to handle database resets
    await setupAuthenticatedTest(prisma, auth);
  });

  it('creates and lists events', async () => {
    const res = await auth.post('/api/calendar-events').send({
      title: 'PD Day',
      start: '2025-01-02T00:00:00.000Z',
      end: '2025-01-02T23:59:59.000Z',
      allDay: true,
      eventType: 'PD_DAY',
    });
    expect(res.status).toBe(201);

    const list = await auth.get('/api/calendar-events?start=2025-01-01&end=2025-01-03');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].title).toBe('PD Day');
  });

  it('handles date range queries', async () => {
    // Create events in different date ranges with distinct dates
    await auth.post('/api/calendar-events').send({
      title: 'Event 1',
      start: '2025-03-05T00:00:00.000Z',
      end: '2025-03-05T23:59:59.000Z',
      allDay: true,
      eventType: 'HOLIDAY',
    });

    await auth.post('/api/calendar-events').send({
      title: 'Event 2',
      start: '2025-03-15T00:00:00.000Z',
      end: '2025-03-15T23:59:59.000Z',
      allDay: true,
      eventType: 'HOLIDAY',
    });

    // Query for specific date range that should only include Event 2
    const list = await auth.get('/api/calendar-events?start=2025-03-10&end=2025-03-20');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].title).toBe('Event 2');
  });

  it('updates calendar events', async () => {
    // Create an event
    const createRes = await auth.post('/api/calendar-events').send({
      title: 'Original Title',
      start: '2025-02-01T00:00:00.000Z',
      end: '2025-02-01T23:59:59.000Z',
      allDay: true,
      eventType: 'HOLIDAY',
    });
    expect(createRes.status).toBe(201);
    const eventId = createRes.body.id;

    // Update the event
    const updateRes = await auth.patch(`/api/calendar-events/${eventId}`).send({
      title: 'Updated Title',
      eventType: 'PD_DAY',
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');
    expect(updateRes.body.eventType).toBe('PD_DAY');
  });

  it('deletes calendar events', async () => {
    // Create an event
    const createRes = await auth.post('/api/calendar-events').send({
      title: 'To Delete',
      start: '2025-03-01T00:00:00.000Z',
      end: '2025-03-01T23:59:59.000Z',
      allDay: true,
      eventType: 'HOLIDAY',
    });
    expect(createRes.status).toBe(201);
    const eventId = createRes.body.id;

    // Delete the event
    const deleteRes = await auth.delete(`/api/calendar-events/${eventId}`);
    expect(deleteRes.status).toBe(204);

    // Verify it's deleted
    const list = await auth.get('/api/calendar-events?start=2025-03-01&end=2025-03-01');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(0);
  });

  describe('Edge Cases', () => {
    it('should handle empty data scenarios gracefully', async () => {
      // Query with no events
      const list = await auth.get('/api/calendar-events?start=2030-01-01&end=2030-12-31');
      expect(list.status).toBe(200);
      expect(list.body).toEqual([]);
    });

    it('should handle invalid date formats', async () => {
      const res = await auth.post('/api/calendar-events').send({
        title: 'Invalid Date Event',
        start: 'invalid-date',
        end: '2025-01-01T00:00:00.000Z',
        eventType: 'HOLIDAY',
      });
      expect(res.status).toBe(400);
    });

    it('should handle overlapping events', async () => {
      // Create first event
      await auth.post('/api/calendar-events').send({
        title: 'Event A',
        start: '2025-04-01T10:00:00.000Z',
        end: '2025-04-01T12:00:00.000Z',
        eventType: 'CUSTOM',
      });

      // Create overlapping event - should succeed
      const res = await auth.post('/api/calendar-events').send({
        title: 'Event B',
        start: '2025-04-01T11:00:00.000Z',
        end: '2025-04-01T13:00:00.000Z',
        eventType: 'CUSTOM',
      });
      expect(res.status).toBe(201);
    });

    it('should validate required fields', async () => {
      const res = await auth.post('/api/calendar-events').send({
        // Missing required fields
        eventType: 'HOLIDAY',
      });
      expect(res.status).toBe(400);
    });
  });
});
