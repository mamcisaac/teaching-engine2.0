import http from 'http';
import { app } from '../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';
import fs from 'fs';
import path from 'path';

describe('calendar events', () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    prisma = getTestPrismaClient();
    await auth.setup();
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.calendarEvent.deleteMany();
    const ics = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample.ics'));
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/calendar' });
      res.end(ics);
    });
    await new Promise((r) => server.listen(0, r));
    const addr = server.address() as import('net').AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}/sample.ics`;
  });

  afterAll(async () => {
    server.close();
    await prisma.calendarEvent.deleteMany();
    await prisma.$disconnect();
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
    const list = await auth.get('/api/calendar-events?from=2025-01-01&to=2025-01-03');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
  });

  it('imports events from ical', async () => {
    const res = await auth.post('/api/calendar-events/sync/ical').send({ feedUrl: baseUrl });
    expect(res.status).toBe(200);
    const events = await prisma.calendarEvent.findMany();
    expect(events.length).toBeGreaterThan(1);
  });

  describe('Edge Cases', () => {
    it('should handle empty data scenarios', async () => {
      // Test with missing required fields
      const missingTitle = await auth.post('/api/calendar-events').send({
        start: '2025-01-02T00:00:00.000Z',
        end: '2025-01-02T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      });
      expect(missingTitle.status).toBe(400);

      const missingStart = await auth.post('/api/calendar-events').send({
        title: 'Test Event',
        end: '2025-01-02T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      });
      expect(missingStart.status).toBe(400);

      // Test empty string values
      const emptyTitle = await auth.post('/api/calendar-events').send({
        title: '',
        start: '2025-01-02T00:00:00.000Z',
        end: '2025-01-02T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      });
      expect(emptyTitle.status).toBe(400);
    });

    it('should handle maximum data limits', async () => {
      // Test extremely long titles
      const longTitle = 'a'.repeat(1000);
      const longTitleRes = await auth.post('/api/calendar-events').send({
        title: longTitle,
        start: '2025-01-02T00:00:00.000Z',
        end: '2025-01-02T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      });
      expect(longTitleRes.status).toBe(400);

      // Test large date ranges
      const largeRange = await auth.post('/api/calendar-events').send({
        title: 'Long Event',
        start: '2025-01-01T00:00:00.000Z',
        end: '2035-12-31T23:59:59.000Z', // 10 year span
        allDay: false,
        eventType: 'OTHER',
      });
      expect([200, 201, 400]).toContain(largeRange.status);
    });

    it('should handle special characters and Unicode', async () => {
      const specialTitles = [
        'Journée pédagogique',
        'Événement spécial',
        'Conference 📅 Day',
        'Event "With Quotes"',
        "Event 'With Apostrophe'",
        'Event\\BackslashTest',
        'Event%PercentTest',
        '事件测试', // Chinese characters
        'Событие', // Cyrillic
        'イベント', // Japanese
      ];

      for (const title of specialTitles) {
        const response = await auth.post('/api/calendar-events').send({
          title,
          start: '2025-01-02T00:00:00.000Z',
          end: '2025-01-02T23:59:59.000Z',
          allDay: true,
          eventType: 'OTHER',
        });
        // Should handle special characters gracefully
        expect([200, 201]).toContain(response.status);
      }
    });

    it('should handle invalid date formats and edge cases', async () => {
      const invalidDates = [
        'invalid-date',
        '2025-13-01T00:00:00.000Z', // Invalid month
        '2025-02-30T00:00:00.000Z', // Invalid day for February
        '2025-01-01T25:00:00.000Z', // Invalid hour
        '2025-01-01T00:61:00.000Z', // Invalid minute
        '2025-01-01T00:00:61.000Z', // Invalid second
        '2025-01-01', // Missing time
        '', // Empty string
        null, // Null value
        undefined, // Undefined value
      ];

      for (const date of invalidDates) {
        const response = await auth.post('/api/calendar-events').send({
          title: 'Test Event',
          start: date,
          end: '2025-01-02T23:59:59.000Z',
          allDay: true,
          eventType: 'PD_DAY',
        });
        expect(response.status).toBe(400);
      }
    });

    it('should handle start/end date validation', async () => {
      // Test end before start
      const endBeforeStart = await auth.post('/api/calendar-events').send({
        title: 'Invalid Range Event',
        start: '2025-01-02T00:00:00.000Z',
        end: '2025-01-01T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      });
      expect(endBeforeStart.status).toBe(400);

      // Test same start and end time
      const sameTime = await auth.post('/api/calendar-events').send({
        title: 'Same Time Event',
        start: '2025-01-02T12:00:00.000Z',
        end: '2025-01-02T12:00:00.000Z',
        allDay: false,
        eventType: 'OTHER',
      });
      expect([200, 201, 400]).toContain(sameTime.status);
    });

    it('should handle timezone edge cases', async () => {
      const timezoneTestCases = [
        {
          start: '2025-03-09T07:00:00.000Z', // UTC during DST transition
          end: '2025-03-09T08:00:00.000Z',
        },
        {
          start: '2025-03-09T02:00:00.000-05:00', // EST during DST transition
          end: '2025-03-09T03:00:00.000-04:00', // EDT after DST transition
        },
        {
          start: '2025-11-02T06:00:00.000Z', // UTC during DST end
          end: '2025-11-02T07:00:00.000Z',
        },
        {
          start: '2025-01-01T00:00:00.000+09:00', // JST
          end: '2025-01-01T01:00:00.000+09:00',
        },
        {
          start: '2025-01-01T23:59:59.999Z', // End of day UTC
          end: '2025-01-02T00:00:00.001Z', // Start of next day UTC
        },
      ];

      for (let i = 0; i < timezoneTestCases.length; i++) {
        const testCase = timezoneTestCases[i];
        const response = await auth.post('/api/calendar-events').send({
          title: `Timezone Test ${i + 1}`,
          start: testCase.start,
          end: testCase.end,
          allDay: false,
          eventType: 'OTHER',
        });

        // Should handle all valid ISO date formats
        expect([200, 201]).toContain(response.status);
      }
    });

    it('should handle leap year edge cases', async () => {
      const leapYearCases = [
        {
          title: 'Leap Day Event',
          start: '2024-02-29T00:00:00.000Z', // Valid leap day
          end: '2024-02-29T23:59:59.000Z',
        },
        {
          title: 'Day Before Leap Day',
          start: '2024-02-28T00:00:00.000Z',
          end: '2024-03-01T00:00:00.000Z', // Spans leap day
        },
        {
          title: 'Non-Leap Year Feb 28',
          start: '2025-02-28T00:00:00.000Z', // Day before non-leap March
          end: '2025-03-01T00:00:00.000Z',
        },
      ];

      for (const testCase of leapYearCases) {
        const response = await auth.post('/api/calendar-events').send({
          ...testCase,
          allDay: true,
          eventType: 'OTHER',
        });

        expect([200, 201]).toContain(response.status);
      }
    });

    it('should handle concurrent event creation and modification', async () => {
      const eventData = {
        title: 'Concurrent Test Event',
        start: '2025-05-01T00:00:00.000Z',
        end: '2025-05-01T23:59:59.000Z',
        allDay: true,
        eventType: 'PD_DAY',
      };

      // Create multiple concurrent event requests
      const concurrentCreations = Array.from({ length: 5 }, (_, i) =>
        auth.post('/api/calendar-events').send({
          ...eventData,
          title: `${eventData.title} ${i + 1}`,
        }),
      );

      const responses = await Promise.all(concurrentCreations);

      // All should succeed since they have different titles
      const successfulCreations = responses.filter((r) => r.status === 201);
      expect(successfulCreations.length).toBe(5);
    });

    it('should handle extreme date ranges and edge dates', async () => {
      const extremeDates = [
        {
          title: 'Year 1900',
          start: '1900-01-01T00:00:00.000Z',
          end: '1900-01-01T23:59:59.000Z',
        },
        {
          title: 'Year 2099',
          start: '2099-12-31T00:00:00.000Z',
          end: '2099-12-31T23:59:59.000Z',
        },
        {
          title: 'Millennium Start',
          start: '2000-01-01T00:00:00.000Z',
          end: '2000-01-01T23:59:59.000Z',
        },
        {
          title: 'Unix Epoch',
          start: '1970-01-01T00:00:00.000Z',
          end: '1970-01-01T23:59:59.000Z',
        },
      ];

      for (const testCase of extremeDates) {
        const response = await auth.post('/api/calendar-events').send({
          ...testCase,
          allDay: true,
          eventType: 'OTHER',
        });

        // Should handle extreme but valid dates
        expect([200, 201]).toContain(response.status);
      }
    });

    it('should handle invalid event types', async () => {
      const invalidEventTypes = ['INVALID_TYPE', '', null, undefined, 123, { nested: 'object' }];

      for (const eventType of invalidEventTypes) {
        const response = await auth.post('/api/calendar-events').send({
          title: 'Invalid Type Event',
          start: '2025-01-02T00:00:00.000Z',
          end: '2025-01-02T23:59:59.000Z',
          allDay: true,
          eventType: eventType as string,
        });

        expect(response.status).toBe(400);
      }
    });

    it('should handle malformed iCal import requests', async () => {
      // Test with invalid URLs
      const invalidUrls = ['not-a-url', 'http://localhost:99999/nonexistent', '', null, undefined];

      for (const url of invalidUrls) {
        const response = await auth.post('/api/calendar-events/sync/ical').send({ feedUrl: url });

        expect(response.status).toBe(400);
      }
    });

    it('should handle query parameter edge cases', async () => {
      // Test with invalid date range queries
      const invalidQueries = [
        '?from=invalid-date&to=2025-01-03',
        '?from=2025-01-01&to=invalid-date',
        '?from=2025-01-03&to=2025-01-01', // from after to
        '?from=&to=',
        '?from=2025-01-01', // missing to
        '?to=2025-01-03', // missing from
      ];

      for (const query of invalidQueries) {
        const response = await auth.get(`/api/calendar-events${query}`);

        // Should handle gracefully, either return 400 or empty results
        expect([200, 400]).toContain(response.status);
      }
    });
  });
});
