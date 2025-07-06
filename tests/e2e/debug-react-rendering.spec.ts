import { test } from '@playwright/test';

test.describe('Debug React Rendering', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // No auth

  test('check why React is not rendering', async ({ page }) => {
    // Capture console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.toString());
    });

    console.log('Navigating to app root...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait a bit for any async operations
    await page.waitForTimeout(3000);

    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach((msg) => console.log(msg));

    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach((err) => console.log(err));

    // Check if React root exists
    const reactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        innerHTML: root?.innerHTML || 'No root element',
        childNodes: root?.childNodes.length || 0,
      };
    });
    console.log('\n=== REACT ROOT ===');
    console.log(JSON.stringify(reactRoot, null, 2));

    // Check for React fiber
    const hasReactFiber = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return false;
      // Check for React internal properties
      const keys = Object.keys(root);
      return keys.some((key) => key.startsWith('__react'));
    });
    console.log('\nReact Fiber attached:', hasReactFiber);

    // Check network requests
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate to login specifically
    console.log('\nNavigating to login page...');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    console.log('\n=== FAILED REQUESTS ===');
    failedRequests.forEach((req) => console.log(req));

    // Check the HTML structure
    const html = await page.content();
    console.log('\n=== PAGE HTML (first 1000 chars) ===');
    console.log(html.substring(0, 1000));

    // Try to manually check what's happening with Vite/React
    const scriptTags = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      return Array.from(scripts).map((script) => ({
        src: script.src,
        type: script.type,
        innerHTML: script.innerHTML.substring(0, 100),
      }));
    });
    console.log('\n=== SCRIPT TAGS ===');
    console.log(JSON.stringify(scriptTags, null, 2));

    // Take screenshot
    await page.screenshot({
      path: 'test-results/react-debug.png',
      fullPage: true,
    });

    // Final check - see if we can find the login form after waiting longer
    console.log('\nWaiting longer for React to render...');
    await page.waitForTimeout(5000);

    const finalCheck = await page.evaluate(() => {
      return {
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input').length,
        buttons: document.querySelectorAll('button').length,
        bodyText: document.body.innerText,
      };
    });
    console.log('\n=== FINAL CHECK ===');
    console.log(JSON.stringify(finalCheck, null, 2));
  });
});
