import { execSync } from 'child_process';

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Run prisma migrate deploy to apply migrations
    execSync('npx prisma migrate deploy --schema=../packages/database/prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: __dirname, // Set the working directory to the scripts directory
      env: {
        ...process.env,
        DATABASE_URL: 'file:../packages/database/prisma/test-db.sqlite',
        PRISMA_SCHEMA_PATH: '../packages/database/prisma/schema.prisma'
      }
    });
    
    console.log('✅ Database migrations applied successfully!');
  } catch (error) {
    console.error('❌ Failed to apply migrations:', error);
    process.exit(1);
  }
}

runMigrations().catch(console.error);
