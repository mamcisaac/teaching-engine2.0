import { test } from '@playwright/test';

// This test specifically does NOT use the global auth state
test.describe('Login Page Discovery', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Override global auth state

  test('discover actual login page structure', async ({ page }) => {
    console.log('Starting login page discovery test...');

    // Navigate directly to login
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for React to fully render
    await page.waitForTimeout(2000);

    console.log('Current URL:', page.url());

    // Take screenshot
    await page.screenshot({
      path: 'test-results/login-page-actual.png',
      fullPage: true,
    });

    // Get the page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get all input elements with detailed info
    const inputs = await page.evaluate(() => {
      const inputElements = document.querySelectorAll('input');
      return Array.from(inputElements).map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        className: input.className,
        value: input.value,
        autocomplete: input.autocomplete,
        required: input.required,
        visible: window.getComputedStyle(input).display !== 'none',
        parentForm: input.form
          ? {
              id: input.form.id,
              className: input.form.className,
            }
          : null,
      }));
    });

    console.log('\n=== INPUT ELEMENTS ===');
    console.log(JSON.stringify(inputs, null, 2));

    // Get all forms
    const forms = await page.evaluate(() => {
      const formElements = document.querySelectorAll('form');
      return Array.from(formElements).map((form) => ({
        id: form.id,
        className: form.className,
        action: form.action,
        method: form.method,
        childrenCount: form.children.length,
        innerHTML: form.innerHTML.substring(0, 500) + '...',
      }));
    });

    console.log('\n=== FORM ELEMENTS ===');
    console.log(JSON.stringify(forms, null, 2));

    // Get all buttons
    const buttons = await page.evaluate(() => {
      const buttonElements = document.querySelectorAll('button');
      return Array.from(buttonElements).map((button) => ({
        text: button.textContent?.trim(),
        type: button.type,
        className: button.className,
        disabled: button.disabled,
        visible: window.getComputedStyle(button).display !== 'none',
      }));
    });

    console.log('\n=== BUTTON ELEMENTS ===');
    console.log(JSON.stringify(buttons, null, 2));

    // Get all headings
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map((heading) => ({
        tag: heading.tagName.toLowerCase(),
        text: heading.textContent?.trim(),
        className: heading.className,
      }));
    });

    console.log('\n=== HEADING ELEMENTS ===');
    console.log(JSON.stringify(headings, null, 2));

    // Get body text content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\n=== BODY TEXT CONTENT ===');
    console.log(bodyText);

    // Log the selectors we should use
    console.log('\n=== RECOMMENDED SELECTORS ===');
    if (inputs.length > 0) {
      const emailInput = inputs.find(
        (i) => i.type === 'email' || i.name === 'email' || i.id === 'email-address',
      );
      const passwordInput = inputs.find(
        (i) => i.type === 'password' || i.name === 'password' || i.id === 'password',
      );

      if (emailInput) {
        const emailSelector = emailInput.id
          ? `#${emailInput.id}`
          : `input[name="${emailInput.name}"]`;
        console.log(`Email input selector: ${emailSelector}`);
      }

      if (passwordInput) {
        const passwordSelector = passwordInput.id
          ? `#${passwordInput.id}`
          : `input[name="${passwordInput.name}"]`;
        console.log(`Password input selector: ${passwordSelector}`);
      }
    }

    if (buttons.length > 0) {
      const submitButton = buttons.find(
        (b) =>
          b.type === 'submit' ||
          b.text?.toLowerCase().includes('sign in') ||
          b.text?.toLowerCase().includes('login'),
      );
      if (submitButton) {
        console.log(
          `Submit button selector: button[type="submit"] or button:has-text("${submitButton.text}")`,
        );
      }
    }
  });
});
