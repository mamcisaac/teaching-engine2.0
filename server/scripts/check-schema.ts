import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Set up Prisma client with the test database URL
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: 'file:../packages/database/prisma/test-db.sqlite'
    }
  }
});

async function checkSchema() {

  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // List all tables in SQLite
    const result = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `;
    
    console.log('\n📋 Database tables:');
    console.log(JSON.stringify(result, null, 2));

    if (result && Array.isArray(result) && result.length > 0) {
      console.log('\n✅ Database schema looks good!');
    } else {
      console.log('\n❌ No tables found in the database');
    }

  } catch (error) {
    console.error('Error checking database schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema().catch(console.error);
