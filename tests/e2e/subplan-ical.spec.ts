import { test, expect } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const icsPath = path.join(__dirname, '../../server/tests/fixtures/sample.ics');

/** E2E scenario: Teacher imports iCal feed, planner blocks event, and sub plan includes it */
test('ical import blocks planner and sub plan lists event', async ({ page }) => {
  const ics = fs.readFileSync(icsPath);
  const srv = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/calendar' });
    res.end(ics);
  });
  await new Promise((r) => srv.listen(0, r));
  const { port } = srv.address() as import('net').AddressInfo;
  const feedUrl = `http://127.0.0.1:${port}/sample.ics`;

  await page.request.post('/api/calendar-events/sync/ical', { data: { feedUrl } });

  await page.goto('/planner');
  await expect(page.getByText('Test Event')).toBeVisible();

  const resp = await page.request.post('/api/subplan/generate?date=2025-01-01');
  const buf = Buffer.from(await resp.body());
  const text = (await pdfParse(buf)).text;
  expect(text).toContain('Test Event');

  srv.close();
});
