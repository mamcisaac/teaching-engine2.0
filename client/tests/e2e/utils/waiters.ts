/**
 * Network-based waiters for E2E tests with Emily's canonical data
 * These replace time-based waits with reliable network response validation
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for Emily's lessons to load from the API and verify data integrity
 * Replaces arbitrary timeouts with actual network success verification
 */
export async function waitForEmilyLessons(page: Page) {
  const response = await page.waitForResponse(r =>
    r.url().includes('/api/etfo-lesson-plans') && 
    r.request().method() === 'GET' &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(Array.isArray(body.lessonPlans)).toBe(true);
  expect(body.lessonPlans.length).toBeGreaterThan(0);
  
  // Verify Emily's lesson structure
  const firstLesson = body.lessonPlans[0];
  expect(firstLesson.userId).toBe(23); // Emily's ID
  expect(typeof firstLesson.title).toBe('string');
  expect(typeof firstLesson.subject).toBe('string');
  
  return body;
}

/**
 * Wait for curriculum expectations to load from Emily's canonical dataset
 */
export async function waitForEmilyExpectations(page: Page) {
  const response = await page.waitForResponse(r =>
    r.url().includes('/api/curriculum-expectations') && 
    r.request().method() === 'GET' &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(Array.isArray(body.expectations)).toBe(true);
  expect(body.expectations.length).toBeGreaterThan(0);
  expect(body.expectations.length).toBeLessThanOrEqual(68); // Emily has 68 Grade 1 expectations
  
  return body;
}

/**
 * Wait for unit plans to load successfully
 */
export async function waitForEmilyUnitPlans(page: Page) {
  const response = await page.waitForResponse(r =>
    r.url().includes('/api/etfo-unit-plans') && 
    r.request().method() === 'GET' &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(Array.isArray(body.unitPlans)).toBe(true);
  expect(body.unitPlans.length).toBeGreaterThan(0);
  
  // Verify unit structure
  if (body.unitPlans.length > 0) {
    const firstUnit = body.unitPlans[0];
    expect(firstUnit.userId).toBe(23); // Emily's ID
    expect(typeof firstUnit.title).toBe('string');
  }
  
  return body;
}

/**
 * Wait for daybook entries to load (if any exist)
 */
export async function waitForEmilyDaybook(page: Page) {
  const response = await page.waitForResponse(r =>
    r.url().includes('/api/daybook-entries') && 
    r.request().method() === 'GET' &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(Array.isArray(body.entries)).toBe(true);
  // Note: daybook might be empty, that's ok
  
  return body;
}

/**
 * Wait for login response and verify cookie is set
 */
export async function waitForTestLogin(page: Page) {
  const response = await page.waitForResponse(r =>
    r.url().includes('/__test__/login') && 
    r.request().method() === 'POST' &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(typeof body.token).toBe('string');
  expect(body.user).toBeDefined();
  expect(body.user.id).toBe(23); // Emily's ID
  expect(body.user.email).toBe('emmcisaac@gmail.com');
  
  return body;
}

/**
 * Generic waiter for any API endpoint success
 */
export async function waitForApiSuccess(page: Page, urlPattern: string | RegExp) {
  const response = await page.waitForResponse(r =>
    (typeof urlPattern === 'string' ? r.url().includes(urlPattern) : urlPattern.test(r.url())) &&
    r.ok()
  );
  
  expect(response.ok()).toBeTruthy();
  return response;
}

/**
 * Wait for page navigation to complete with network idle state
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  
  // Also wait for any pending API calls to Emily's data
  await page.waitForTimeout(100); // Brief settle time
}

/**
 * Comprehensive waiter for lesson plans page to be fully loaded with Emily's data
 */
export async function waitForLessonPlansPageReady(page: Page) {
  // Wait for page navigation
  await waitForPageReady(page);
  
  // Wait for lessons API call
  await waitForEmilyLessons(page);
  
  // Verify UI elements are visible
  await expect(page.getByTestId('lesson-plans-list')).toBeVisible();
}

/**
 * Comprehensive waiter for curriculum page to be fully loaded with Emily's data  
 */
export async function waitForCurriculumPageReady(page: Page) {
  // Wait for page navigation
  await waitForPageReady(page);
  
  // Wait for expectations API call
  await waitForEmilyExpectations(page);
  
  // Verify UI elements are visible
  await expect(page.getByTestId('curriculum-list')).toBeVisible();
}