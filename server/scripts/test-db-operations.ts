import { PrismaClient } from '@prisma/client';

async function testDbOperations() {
  console.log('Starting database test...');
  
  // Set up Prisma client with logging
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Connect to the database
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Test a simple query
    console.log('\nTesting database query...');
    const subjects = await prisma.subject.findMany();
    console.log('Found subjects:', subjects);
    
    // Test creating a new subject
    console.log('\nTesting create operation...');
    const newSubject = await prisma.subject.create({
      data: {
        name: 'Test Subject ' + Date.now(),
      },
    });
    console.log('Created subject:', newSubject);
    
    // Test updating the subject
    console.log('\nTesting update operation...');
    const updatedSubject = await prisma.subject.update({
      where: { id: newSubject.id },
      data: { name: 'Updated Test Subject' },
    });
    console.log('Updated subject:', updatedSubject);
    
    // Test deleting the subject
    console.log('\nTesting delete operation...');
    const deletedSubject = await prisma.subject.delete({
      where: { id: newSubject.id },
    });
    console.log('Deleted subject:', deletedSubject);
    
    console.log('\n✅ All database operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

// Run the test
testDbOperations().catch(console.error);
