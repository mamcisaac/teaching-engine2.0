#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function checkMakingSenseUnit() {
  console.log('🧮 Checking Making Sense of Numbers unit lessons...\n');

  const makingSenseUnitId = 'cmebyc9im0003vjrf4bfhlo1z';
  
  // Check lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: makingSenseUnitId
    },
    select: {
      id: true,
      title: true,
      date: true,
      duration: true
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} existing lessons in Making Sense of Numbers unit:\n`);
  
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

checkMakingSenseUnit().catch(console.error);