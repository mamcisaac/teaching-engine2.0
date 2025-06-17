import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { testDb } from './test-database-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export testDb for use in jest.setup.ts
export { testDb };

export default async function setup() {
  // Initialize the test database manager
  const workerId = 'global-setup';
  await testDb.createTestDatabase(workerId);

  const root = resolve(__dirname, '..', '..');

  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('pnpm --filter @teaching-engine/database db:generate', {
      stdio: 'inherit',
      cwd: root,
    });

    // Reset and push the database schema
    console.log('Resetting test database...');
    execSync(
      'pnpm --filter @teaching-engine/database prisma db push --force-reset --skip-generate',
      {
        stdio: 'inherit',
        cwd: root,
      },
    );

    // Seed the test database
    console.log('Seeding test database...');
    execSync('pnpm --filter @teaching-engine/database prisma db seed', {
      stdio: 'inherit',
      cwd: root,
    });

    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}
