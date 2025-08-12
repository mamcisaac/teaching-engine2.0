#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedAllMathLessonPlans() {
  console.log('🔢 SEEDING ALL MATHEMATICS LESSON PLANS');
  console.log('======================================\n');

  try {
    // Check current lesson plan count
    const currentCount = await prisma.eTFOLessonPlan.count({
      where: { subject: 'Mathématiques' }
    });

    console.log(`📊 Current math lesson plans in database: ${currentCount}`);

    if (currentCount > 0) {
      console.log(`⚠️  Found ${currentCount} existing lesson plans. Clearing them first...`);
      await prisma.eTFOLessonPlan.deleteMany({
        where: { subject: 'Mathématiques' }
      });
      console.log('🗑️ Cleared existing mathematics lesson plans');
    }

    // List of lesson plan seed files for each month
    const monthlySeeds = [
      'seed-lesson-plans-math-september.ts',
      'seed-lesson-plans-math-october.ts', 
      'seed-lesson-plans-math-november.ts',
      'seed-lesson-plans-math-december.ts',
      'seed-lesson-plans-math-january.ts',
      'seed-lesson-plans-math-february.ts',
      'seed-lesson-plans-math-march.ts',
      'seed-lesson-plans-math-april.ts',
      'seed-lesson-plans-math-may.ts',
      'seed-lesson-plans-math-june.ts'
    ];

    let totalSeeded = 0;
    let successfulMonths = 0;

    for (const seedFile of monthlySeeds) {
      const month = seedFile.replace('seed-lesson-plans-math-', '').replace('.ts', '');
      console.log(`\n📅 Seeding ${month.toUpperCase()} lesson plans...`);

      try {
        const seedPath = path.join(__dirname, 'prisma', seedFile);
        
        // Run the seed file
        execSync(`npx tsx "${seedPath}"`, { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        
        // Count lesson plans for this month
        const monthCount = await prisma.eTFOLessonPlan.count({
          where: { 
            subject: 'Mathématiques',
            date: {
              gte: new Date(`2025-${getMonthNumber(month)}-01`),
              lt: new Date(`2025-${getMonthNumber(month) + 1}-01`)
            }
          }
        });

        console.log(`✅ ${month}: Successfully seeded ${monthCount} lesson plans`);
        totalSeeded += monthCount;
        successfulMonths++;

      } catch (error) {
        console.log(`❌ ${month}: Failed to seed - ${error.message}`);
      }
    }

    // Final count
    const finalCount = await prisma.eTFOLessonPlan.count({
      where: { subject: 'Mathématiques' }
    });

    console.log(`\n📊 MATHEMATICS LESSON PLAN SEEDING COMPLETE:`);
    console.log(`✅ Successfully seeded ${successfulMonths}/10 months`);
    console.log(`✅ Total lesson plans created: ${finalCount}`);
    console.log(`✅ Expected: ~180 lessons for the year`);

    if (finalCount >= 150) {
      console.log(`🎉 EXCELLENT! Mathematics lesson plans are comprehensive!`);
    } else if (finalCount >= 100) {
      console.log(`👍 GOOD! Mathematics lesson plans provide solid coverage!`);
    } else {
      console.log(`⚠️  LOW COVERAGE: Only ${finalCount} lesson plans - may need more`);
    }

  } catch (error) {
    console.error('❌ Error seeding math lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getMonthNumber(monthName: string): number {
  const months = {
    'september': 9,
    'october': 10,
    'november': 11,
    'december': 12,
    'january': 1,
    'february': 2,
    'march': 3,
    'april': 4,
    'may': 5,
    'june': 6
  };
  return months[monthName.toLowerCase()] || 1;
}

// Run the seed function
seedAllMathLessonPlans()
  .then(() => console.log('\n🎉 All mathematics lesson plans seeded!'))
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });