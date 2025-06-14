import { PrismaClient } from '@prisma/client';

async function testDbConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Try a simple query with a known model from your schema
    const subjects = await prisma.subject.findMany();
    console.log('Subjects in database:', subjects);
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

testDbConnection().catch(console.error);
