// This file is used for debugging login network requests
import { test } from '@playwright/test';

test('debug login network', async ({ page }) => {
  // Enable request interception
  await page.route('**/*', (route) => {
    console.log(`Request: ${route.request().method()} ${route.request().url()}`);
    route.continue();
  });

  // Listen to all responses
  page.on('response', (response) => {
    console.log(`Response: ${response.status()} ${response.statusText()} - ${response.url()}`);
    if (response.status() >= 400) {
      console.log('Error response:', response.status(), response.statusText());
      response
        .text()
        .then((body) => {
          console.log('Response body:', body);
        })
        .catch((e) => console.log('Could not read response body:', e));
    }
  });

  // First try to login via API
  console.log('Making API login request to port 3001...');
  const loginResponse = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'teacher@example.com',
      password: 'password123',
    }),
  });

  console.log('Login response status:', loginResponse.status);
  const loginData = await loginResponse.json().catch(() => ({}));
  console.log('Login response data:', JSON.stringify(loginData, null, 2));

  if (!loginResponse.ok) {
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }

  // Navigate to the login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('Page loaded. Filling login form...');
  await page.fill('#email-address', 'teacher@example.com');
  await page.fill('#password', 'password123');

  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  try {
    await page.waitForURL('**/subjects', { timeout: 10000 });
    console.log('Successfully navigated to subjects page');
  } catch (error) {
    console.error('Navigation to subjects page failed. Current URL:', page.url());
    console.error('Page title:', await page.title());

    // Check for error messages
    const errorMessages = await page.$$eval('*', (elements) =>
      elements
        .filter((el) => {
          const text = el.textContent?.trim() || '';
          return (
            text.length > 0 &&
            text.length < 200 &&
            (text.toLowerCase().includes('error') ||
              text.toLowerCase().includes('fail') ||
              text.toLowerCase().includes('invalid'))
          );
        })
        .map((el) => ({
          text: el.textContent?.trim(),
          tag: el.tagName,
          id: el.id,
          class: el.className,
        })),
    );

    if (errorMessages.length > 0) {
      console.error('Error messages on page:', JSON.stringify(errorMessages, null, 2));
    }

    throw error;
  }
});
