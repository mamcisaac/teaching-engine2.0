import request from 'supertest';
import http from 'http';
import app from '../src/index';
import { prisma } from '../src/prisma';
import fs from 'fs';
import path from 'path';

describe('calendar events', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
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
    const res = await request(app).post('/api/calendar-events').send({
      title: 'PD Day',
      start: '2025-01-02T00:00:00.000Z',
      end: '2025-01-02T23:59:59.000Z',
      allDay: true,
      eventType: 'PD_DAY',
    });
    expect(res.status).toBe(201);
    const list = await request(app).get('/api/calendar-events?from=2025-01-01&to=2025-01-03');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
  });

  it('imports events from ical', async () => {
    const res = await request(app)
      .post('/api/calendar-events/sync/ical')
      .send({ feedUrl: baseUrl });
    expect(res.status).toBe(200);
    const events = await prisma.calendarEvent.findMany();
    expect(events.length).toBeGreaterThan(1);
  });
});
