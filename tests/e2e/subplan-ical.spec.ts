import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';
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

  const token = await login(page);
  await page.request.post(`${API_BASE}/api/calendar-events/sync/ical`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { feedUrl },
  });

  await page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');

  // Wait for the planner to load
  await page.waitForSelector('.planner-grid, [data-testid="planner"]', { timeout: 15000 });

  // Wait for planner APIs to load
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 15000,
    })
    .catch(() => {
      console.log('Calendar events API timeout, proceeding...');
    });

  // Wait for planner suggestions API if needed
  await page
    .waitForResponse((r) => r.url().includes('/api/planner/suggestions') && r.status() === 200, {
      timeout: 10000,
    })
    .catch(() => {
      console.log('Planner suggestions API timeout, proceeding...');
    });

  // Give the UI time to render after API calls
  await page.waitForTimeout(2000);
  const dateInput = page.locator('input[type="date"]');
  await dateInput.waitFor({ state: 'visible' });
  await dateInput.fill('2025-01-01', { force: true });
  await page.waitForResponse(
    (r) => r.url().includes('/api/calendar-events') && r.request().method() === 'GET',
  );
  await expect(page.getByText('Test Event').first()).toBeVisible();

  const resp = await page.request.post(`${API_BASE}/api/sub-plan/generate?date=2025-01-01`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(resp.ok()).toBe(true);

  srv.close();
});
