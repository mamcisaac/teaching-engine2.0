import { test, expect } from '@playwright/test';
import { login, API_BASE } from './e2e/helpers';

test('create curriculum expectation and long range plan', async ({ page }) => {
  const token = await login(page);
  
  // Create a curriculum expectation
  const expectationRes = await page.request.post(`${API_BASE}/api/curriculum-expectations`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { 
      code: 'A1.1',
      description: 'Demonstrate reading comprehension strategies',
      strand: 'Reading',
      grade: 3,
      subject: 'Language Arts'
    },
  });
  expect(expectationRes.ok()).toBe(true);
  const expectation = await expectationRes.json();
  expect(expectation.code).toBe('A1.1');

  // Create a long range plan
  const planRes = await page.request.post(`${API_BASE}/api/long-range-plans`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { 
      title: 'Grade 3 Language Arts',
      academicYear: '2024-2025',
      term: 'Full Year',
      grade: 3,
      subject: 'Language Arts',
      description: 'Comprehensive language arts program'
    },
  });
  expect(planRes.ok()).toBe(true);
  const plan = await planRes.json();
  expect(plan.title).toBe('Grade 3 Language Arts');
});

test('navigate to planning dashboard', async ({ page }) => {
  await login(page);
  
  // Navigate to planning dashboard
  await page.goto('/planner/dashboard');
  
  // Check that we're on the right page
  await expect(page).toHaveURL(/.*\/planner\/dashboard/);
  
  // Look for ETFO planning elements
  await expect(page.locator('text=Planning Dashboard')).toBeVisible();
});