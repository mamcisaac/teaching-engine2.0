#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function checkNumbersUnitLessons() {
  console.log('🔢 Checking Numbers All Around Us unit lessons...\n');

  const numbersUnitId = 'cmebyc9ii0001vjrfkhn13dd1';
  
  // Check lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: numbersUnitId
    },
    select: {
      id: true,
      title: true,
      date: true,
      duration: true
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} existing lessons in Numbers All Around Us unit:\n`);
  
  lessons.forEach((lesson, i) => {
    console.log(`${i+1}. ${lesson.title}`);
    console.log(`   Date: ${lesson.date.toLocaleDateString()}`);
    console.log(`   Duration: ${lesson.duration} minutes\n`);
  });

  console.log(`📊 Summary:`);
  console.log(`   Existing lessons: ${lessons.length}`);
  console.log(`   Target total: 31 lessons`);
  console.log(`   Need to add: ${31 - lessons.length} lessons`);

  await prisma.$disconnect();
}

checkNumbersUnitLessons().catch(console.error);