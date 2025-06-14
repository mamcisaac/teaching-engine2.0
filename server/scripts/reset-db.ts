import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function resetDatabase() {
  const dbPath = path.resolve(__dirname, '../../packages/database/prisma/test-db.sqlite');
  
  try {
    // Delete the database file if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️  Deleted existing database file');
    }

    // Run prisma migrate reset
    console.log('🔄 Resetting database...');
    execSync('npx prisma migrate reset --force --schema=../packages/database/prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: __dirname, // Set the working directory to the scripts directory
      env: {
        ...process.env,
        DATABASE_URL: 'file:../packages/database/prisma/test-db.sqlite'
      }
    });

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

resetDatabase().catch(console.error);
