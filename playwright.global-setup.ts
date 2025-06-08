import { execSync } from 'child_process';

/**
 * Ensures Playwright browsers are installed before tests run.
 * Skips installation if dependencies cannot be installed.
 */
export default async function globalSetup(): Promise<void> {
  try {
    execSync('pnpm exec playwright install --with-deps', { stdio: 'inherit' });
  } catch {
    console.warn('Playwright install failed; skipping global setup.');
  }
}
