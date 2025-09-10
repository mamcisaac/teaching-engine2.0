import { chromium, FullConfig } from '@playwright/test';
import { ENV } from './env.acceptance';
import { failOn5xx } from './network';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    timezoneId: ENV.TZ,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await failOn5xx(page);

  await page.goto(`${ENV.UI_BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(ENV.EMILY_EMAIL);
  await page.getByLabel(/password|mot de passe/i).fill(ENV.EMILY_PASSWORD);
  await page.getByRole('button', { name: /sign in|se connecter|login/i }).click();

  await page.waitForURL(/planner\/(week|today)/, { timeout: 15000 });
  await context.storageState({ path: 'tests/e2e/auth.json' });
  await browser.close();
}

export default globalSetup;