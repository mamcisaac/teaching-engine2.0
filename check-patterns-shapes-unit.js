#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function checkPatternsShapesUnit() {
  console.log('🔺 Checking Patterns and Shapes unit lessons...\n');

  const patternsShapesUnitId = 'cmebyc9io0005vjrfypcwi41t';
  
  // Check lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: patternsShapesUnitId
    },
    select: {
      id: true,
      title: true,
      date: true,
      duration: true
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} existing lessons in Patterns and Shapes unit:\n`);
  
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

checkPatternsShapesUnit().catch(console.error);