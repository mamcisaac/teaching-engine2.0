import { execSync } from 'child_process';

export default async function globalSetup() {
  execSync('pnpm exec playwright install --with-deps', { stdio: 'inherit' });
}
