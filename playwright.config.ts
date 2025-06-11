import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './playwright.global-setup',
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    env: {
      PORT: '3001',
      VITE_API_BASE_URL: 'http://127.0.0.1:3001',
    },
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
});
