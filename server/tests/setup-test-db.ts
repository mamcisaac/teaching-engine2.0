import { execSync } from 'child_process';
import { cleanTestDatabase } from './jest.setup';
import { resolve } from 'path';
// PrismaClient and randomBytes are used in the actual test files

export default async function setup() {
  // Clean the test database before running tests
  await cleanTestDatabase();
  
  const root = resolve(__dirname, '..', '..');
  
  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('pnpm --filter @teaching-engine/database db:generate', { 
      stdio: 'inherit', 
      cwd: root 
    });

    // Reset and push the database schema
    console.log('Resetting test database...');
    execSync('pnpm --filter @teaching-engine/database prisma db push --force-reset --skip-generate', { 
      stdio: 'inherit', 
      cwd: root 
    });

    // Seed the test database
    console.log('Seeding test database...');
    execSync('pnpm --filter @teaching-engine/database prisma db seed', { 
      stdio: 'inherit', 
      cwd: root 
    });

    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}
