import { execSync } from 'child_process';
import envSetup from './jest.setup';
import { resolve } from 'path';

export default async function setup() {
  await envSetup();
  console.log('Setting up test database...');
  const root = resolve(__dirname, '..', '..');
  execSync('pnpm db:generate', { stdio: 'inherit', cwd: root });
  execSync('pnpm db:deploy', { stdio: 'inherit', cwd: root });
}
