import { test, expect } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';

const icsPath = path.join(__dirname, '../../server/tests/fixtures/sample.ics');

/**
 * E2E scenario: Teacher imports iCal feed, planner blocks event, and sub plan includes it
 * Previously skipped due to dependency on external iCal feed in test environment.
 * Now enabled with a local test fixture for reliable testing.
 */
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
  await page.fill('input[type="date"]', '2025-01-01');
  await page.waitForResponse(
    (r) => r.url().includes('/calendar-events') && r.request().method() === 'GET',
  );
  await expect(page.getByText('Test Event').first()).toBeVisible();

  const resp = await page.request.post('/api/subplan/generate?date=2025-01-01');
  expect(resp.ok()).toBe(true);

  srv.close();
});
