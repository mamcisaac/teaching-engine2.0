import { test } from '@playwright/test'; // expect not used in this file

test('debug login page', async ({ page }) => {
  // Navigate to the login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login');

  // Log the page title and URL
  console.log('Page URL:', page.url());
  console.log('Page title:', await page.title());

  // Take a screenshot
  await page.screenshot({ path: 'test-results/debug-login.png', fullPage: true });

  // Log all input fields on the page
  const inputs = await page.$$eval('input', (inputs) =>
    inputs.map((input) => ({
      id: input.id,
      name: input.name,
      type: input.type,
      placeholder: input.placeholder,
      value: input.value,
      outerHTML: input.outerHTML,
    })),
  );
  console.log('Input fields:', JSON.stringify(inputs, null, 2));

  // Log all buttons on the page
  const buttons = await page.$$eval('button', (buttons) =>
    buttons.map((button) => ({
      text: button.textContent?.trim(),
      type: button.type,
      disabled: button.disabled,
      outerHTML: button.outerHTML,
    })),
  );
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  // Log any forms on the page
  const forms = await page.$$eval('form', (forms) =>
    forms.map((form) => ({
      id: form.id,
      action: form.action,
      method: form.method,
      innerHTML: form.innerHTML,
    })),
  );
  console.log('Forms:', JSON.stringify(forms, null, 2));

  // Log the entire page HTML for debugging
  const html = await page.content();
  console.log('Page HTML (first 1000 chars):', html.substring(0, 1000));
});
