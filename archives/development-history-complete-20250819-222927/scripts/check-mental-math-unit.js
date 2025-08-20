#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function checkMentalMathUnit() {
  console.log('🧠 Checking Mental Math Strategies unit lessons...\n');

  const mentalMathUnitId = 'cmebyc9ir0009vjrf5bl8l49w';
  
  // Check lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: mentalMathUnitId
    },
    select: {
      id: true,
      title: true,
      date: true,
      duration: true
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} existing lessons in Mental Math Strategies unit:\n`);
  
  lessons.forEach((lesson, i) => {
    console.log(`${i+1}. ${lesson.title}`);
    console.log(`   Date: ${lesson.date.toLocaleDateString()}`);
    console.log(`   Duration: ${lesson.duration} minutes\n`);
  });

  console.log(`📊 Summary:`);
  console.log(`   Existing lessons: ${lessons.length}`);
  console.log(`   Target total: 30 lessons`);
  console.log(`   Need to add: ${30 - lessons.length} lessons`);

  await prisma.$disconnect();
}

checkMentalMathUnit().catch(console.error);