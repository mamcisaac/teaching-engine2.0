#!/usr/bin/env tsx
/**
 * Database Integrity Check
 * 
 * This script validates database integrity after tests
 */

import { PrismaClient } from '@teaching-engine/database';

interface IntegrityCheck {
  name: string;
  query: () => Promise<boolean>;
  errorMessage: string;
}

async function checkDatabaseIntegrity(): Promise<void> {
  console.log('🔍 Validating database integrity after tests...\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  const checks: IntegrityCheck[] = [
    {
      name: 'Orphaned lesson plans',
      query: async () => {
        const orphans = await prisma.lessonPlan.count({
          where: {
            userId: null
          }
        });
        return orphans === 0;
      },
      errorMessage: 'Found lesson plans without users'
    },
    {
      name: 'Invalid user roles',
      query: async () => {
        const invalidRoles = await prisma.user.count({
          where: {
            role: {
              notIn: ['TEACHER', 'ADMIN', 'SCHOOL_ADMIN']
            }
          }
        });
        return invalidRoles === 0;
      },
      errorMessage: 'Found users with invalid roles'
    },
    {
      name: 'Orphaned curriculum expectations',
      query: async () => {
        const orphans = await prisma.curriculumExpectation.count({
          where: {
            curriculumId: null
          }
        });
        return orphans === 0;
      },
      errorMessage: 'Found curriculum expectations without curriculum'
    },
    {
      name: 'Invalid grades',
      query: async () => {
        const validGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
        const invalidGrades = await prisma.curriculum.count({
          where: {
            grade: {
              notIn: validGrades
            }
          }
        });
        return invalidGrades === 0;
      },
      errorMessage: 'Found curriculum with invalid grades'
    },
    {
      name: 'Duplicate user emails',
      query: async () => {
        const users = await prisma.user.groupBy({
          by: ['email'],
          having: {
            email: {
              _count: {
                gt: 1
              }
            }
          }
        });
        return users.length === 0;
      },
      errorMessage: 'Found duplicate user emails'
    },
    {
      name: 'Invalid date ranges',
      query: async () => {
        const invalidPlans = await prisma.lessonPlan.findMany({
          where: {
            AND: [
              { startDate: { not: null } },
              { endDate: { not: null } }
            ]
          },
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        });
        
        const invalid = invalidPlans.filter(plan => 
          plan.startDate && plan.endDate && plan.startDate > plan.endDate
        );
        
        return invalid.length === 0;
      },
      errorMessage: 'Found lesson plans with invalid date ranges'
    }
  ];

  let failedChecks = 0;

  try {
    await prisma.$connect();

    for (const check of checks) {
      try {
        console.log(`Checking: ${check.name}...`);
        const passed = await check.query();
        
        if (passed) {
          console.log(`✅ ${check.name}: PASSED`);
        } else {
          console.log(`❌ ${check.name}: FAILED - ${check.errorMessage}`);
          failedChecks++;
        }
      } catch (error) {
        console.log(`❌ ${check.name}: ERROR - ${error.message}`);
        failedChecks++;
      }
    }

    console.log('\n📊 Integrity Check Summary:');
    console.log(`Total checks: ${checks.length}`);
    console.log(`Passed: ${checks.length - failedChecks}`);
    console.log(`Failed: ${failedChecks}`);

    if (failedChecks > 0) {
      console.log('\n❌ Database integrity check failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All database integrity checks passed!');
    }
  } catch (error) {
    console.error('❌ Database integrity check error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check
checkDatabaseIntegrity().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});