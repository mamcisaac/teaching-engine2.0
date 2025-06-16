import { test } from '@playwright/test'; // expect not used in this file

test('debug login page', async ({ page }) => {
  // Clear any existing auth state first
  await page.context().clearCookies();
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Wait for frontend to be ready
  console.log('Waiting for frontend to be ready...');
  for (let i = 0; i < 30; i++) {
    try {
      const frontendResp = await page.request.get('http://localhost:5173');
      if (frontendResp.ok()) {
        console.log('Frontend is ready');
        break;
      }
    } catch (error) {
      console.log(`Frontend check attempt ${i + 1} failed:`, error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Navigate to the login page with extended timeout
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Wait for page to load
  await page.waitForLoadState('load');

  // Give React time to hydrate
  await page.waitForTimeout(2000);

  // Log the page title and URL
  try {
    console.log('Page URL:', page.url());
    const title = await page.title();
    console.log('Page title:', title);
  } catch (error) {
    console.log('Could not get page info:', error);
  }

  // Take a screenshot
  try {
    await page.screenshot({ path: 'test-results/debug-login.png', fullPage: true });
  } catch (error) {
    console.log('Could not take screenshot:', error);
  }

  // Wait for login form elements to appear
  try {
    // Check if we're already authenticated and redirected
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
      console.log('Login form elements found successfully');
    } else {
      console.log('Already authenticated or redirected to:', currentUrl);
    }
  } catch (error) {
    console.log('Login form elements not found within timeout:', error);
    // Continue with test to gather diagnostic information
  }

  // Log all input fields on the page
  try {
    const inputs = await page.$$eval('input', (inputs) =>
      inputs.map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        value: input.value,
        visible: input.offsetParent !== null,
      })),
    );
    console.log('Input fields:', JSON.stringify(inputs, null, 2));
  } catch (error) {
    console.log('Could not evaluate input fields:', error);
  }

  // Log all buttons on the page
  try {
    const buttons = await page.$$eval('button', (buttons) =>
      buttons.map((button) => ({
        text: button.textContent?.trim(),
        type: button.type,
        disabled: button.disabled,
        visible: button.offsetParent !== null,
      })),
    );
    console.log('Buttons:', JSON.stringify(buttons, null, 2));
  } catch (error) {
    console.log('Could not evaluate buttons:', error);
  }

  // Log any forms on the page
  try {
    const forms = await page.$$eval('form', (forms) =>
      forms.map((form) => ({
        id: form.id,
        action: form.action,
        method: form.method,
        visible: form.offsetParent !== null,
      })),
    );
    console.log('Forms:', JSON.stringify(forms, null, 2));
  } catch (error) {
    console.log('Could not evaluate forms:', error);
  }

  // Check if we're being redirected
  if (page.url() !== 'http://localhost:5173/login') {
    console.log('Page was redirected from /login to:', page.url());
  }

  // Log the entire page HTML for debugging
  const html = await page.content();
  console.log('Page HTML (first 1000 chars):', html.substring(0, 1000));
});
