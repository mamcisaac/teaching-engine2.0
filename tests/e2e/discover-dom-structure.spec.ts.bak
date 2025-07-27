import { test } from '@playwright/test';

test('discover login page DOM structure', async ({ page }) => {
  // Clear any existing auth state
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait for React to render
  await page.waitForTimeout(2000);

  // Wait for any element that indicates the app has loaded
  try {
    // Try multiple possible selectors
    const possibleSelectors = [
      'form',
      'input',
      'button',
      '[data-testid]',
      '.login',
      '#login',
      '[class*="login"]',
      'h1',
      'h2',
      'h3',
      'main',
      'div[class*="container"]',
    ];

    let foundElement = false;
    for (const selector of possibleSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements matching: ${selector}`);
          foundElement = true;
        }
      } catch (e) {
        // Ignore errors for individual selectors
      }
    }

    if (!foundElement) {
      console.log('No common elements found, checking page state...');
    }
  } catch (e) {
    console.log('Error checking for elements:', e);
  }

  // Log the current URL (might have been redirected)
  console.log('Current URL:', page.url());

  // Take a screenshot
  await page.screenshot({ path: 'test-results/login-page-discovery.png', fullPage: true });

  // Get the full HTML content
  const html = await page.content();
  console.log('\n=== FULL PAGE HTML ===');
  console.log(html);
  console.log('=== END HTML ===\n');

  // Try to find all input elements using evaluate
  const inputInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    return inputs.map((input) => ({
      id: input.id,
      name: input.name,
      type: input.type,
      placeholder: input.placeholder,
      className: input.className,
      'data-testid': input.getAttribute('data-testid'),
      visible: input.offsetParent !== null,
    }));
  });
  console.log('\n=== INPUT ELEMENTS ===');
  console.log(JSON.stringify(inputInfo, null, 2));

  // Try to find all form elements
  const formInfo = await page.evaluate(() => {
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.map((form) => ({
      id: form.id,
      className: form.className,
      action: form.action,
      method: form.method,
      innerHTML: form.innerHTML.substring(0, 200) + '...',
    }));
  });
  console.log('\n=== FORM ELEMENTS ===');
  console.log(JSON.stringify(formInfo, null, 2));

  // Try to find all buttons
  const buttonInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map((button) => ({
      text: button.textContent?.trim(),
      type: button.type,
      className: button.className,
      'data-testid': button.getAttribute('data-testid'),
      visible: button.offsetParent !== null,
    }));
  });
  console.log('\n=== BUTTON ELEMENTS ===');
  console.log(JSON.stringify(buttonInfo, null, 2));

  // Check for any React-specific attributes
  const reactInfo = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const reactElements = allElements.filter((el) =>
      Array.from(el.attributes).some(
        (attr) =>
          attr.name.startsWith('data-react') ||
          attr.name === 'data-testid' ||
          el.id.includes('react'),
      ),
    );
    return reactElements.slice(0, 10).map((el) => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      attributes: Array.from(el.attributes).map((attr) => ({
        name: attr.name,
        value: attr.value,
      })),
    }));
  });
  console.log('\n=== REACT ELEMENTS ===');
  console.log(JSON.stringify(reactInfo, null, 2));

  // Check the body content
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== BODY TEXT ===');
  console.log(bodyText);
  console.log('=== END BODY TEXT ===\n');

  // Check for any error messages
  const errors = await page.evaluate(() => {
    const errorElements = Array.from(document.querySelectorAll('[class*="error"], .error, .alert'));
    return errorElements.map((el) => ({
      className: el.className,
      text: el.textContent?.trim(),
    }));
  });
  if (errors.length > 0) {
    console.log('\n=== ERROR ELEMENTS ===');
    console.log(JSON.stringify(errors, null, 2));
  }
});
