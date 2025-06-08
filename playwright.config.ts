import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './playwright.global-setup',
  webServer: {
    // Build the production client and start the server to serve static files and API
    command: 'pnpm run build && NODE_ENV=production pnpm --filter server run start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
});
