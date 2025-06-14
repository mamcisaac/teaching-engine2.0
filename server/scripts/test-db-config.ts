import { PrismaClient } from '@prisma/client';

async function testDbConfig() {
  // Use a different database file for testing
  process.env.DATABASE_URL = 'file:../packages/database/prisma/test-db.sqlite';
  
  const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
  });

  try {
    console.log('Connecting to test database...');
    await prisma.$connect();
    console.log('Successfully connected to the test database');
    
    // Create a test table if it doesn't exist
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)`;
    console.log('Created test table');
    
    // Insert a test record
    await prisma.$executeRaw`INSERT INTO test_table (name) VALUES ('test')`;
    console.log('Inserted test record');
    
    // Query the test record
    const result = await prisma.$queryRaw`SELECT * FROM test_table`;
    console.log('Test query result:', result);
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from test database');
  }
}

testDbConfig().catch(console.error);
