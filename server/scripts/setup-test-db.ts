import { execSync } from 'child_process';

async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  // Set the database URL for the test environment
  const databaseUrl = 'file:../packages/database/prisma/test-db.sqlite';
  process.env.DATABASE_URL = databaseUrl;
  
  try {
    // Run Prisma migrations
    console.log('Running database migrations...');
    execSync('npx prisma migrate reset --force --skip-generate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });
    
    console.log('Database migrations completed successfully');
    
    // Seed the database
    console.log('Seeding database...');
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });
    
    console.log('✅ Test database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupTestDatabase().catch(console.error);
