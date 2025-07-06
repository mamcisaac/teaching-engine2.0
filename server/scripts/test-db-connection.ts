#!/usr/bin/env tsx
/**
 * Test Database Connection
 * 
 * This script tests the database connection for CI/CD environments
 */

import { PrismaClient } from '@teaching-engine/database';

async function testDatabaseConnection(): Promise<void> {
  console.log('🔗 Testing database connectivity...\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test basic connection
    console.log('Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Test query execution
    console.log('Testing query execution...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executed successfully:', result);

    // Test schema access
    console.log('\nTesting schema access...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    // Test write operation (in transaction to rollback)
    console.log('\nTesting write operation...');
    await prisma.$transaction(async (tx) => {
      const testUser = await tx.user.create({
        data: {
          email: 'test-connection@example.com',
          passwordHash: 'test',
          name: 'Test Connection',
          role: 'TEACHER',
        },
      });
      console.log('✅ Write operation successful');
      
      // Rollback by throwing
      throw new Error('Rollback test write');
    }).catch(error => {
      if (error.message === 'Rollback test write') {
        console.log('✅ Transaction rollback successful');
      } else {
        throw error;
      }
    });

    console.log('\n✅ All database connection tests passed!');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testDatabaseConnection().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});