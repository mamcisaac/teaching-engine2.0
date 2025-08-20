#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryGrowingChangingLessons() {
  console.log('🔍 Querying Growing and Changing unit lessons...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    console.log(`✅ Found Emily's account (ID: ${emily.id})`);
    
    // Get the Growing and Changing unit plan
    const growthUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Grandir et changer'
      }
    });
    
    if (!growthUnit) {
      throw new Error('Growing and Changing unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${growthUnit.titleFr} (ID: ${growthUnit.id})`);
    console.log(`📅 Date range: ${growthUnit.startDate.toDateString()} - ${growthUnit.endDate.toDateString()}`);
    console.log(`⏱️ Estimated hours: ${growthUnit.estimatedHours}\n`);
    
    // Get all lesson plans for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: growthUnit.id
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    console.log(`📚 Found ${lessons.length} lessons for Growing and Changing unit:\n`);
    
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.titleFr} (${lesson.date.toDateString()})`);
      console.log(`   - Title EN: ${lesson.title}`);
      console.log(`   - Duration: ${lesson.duration} minutes`);
      console.log(`   - ID: ${lesson.id}\n`);
    });
    
    console.log(`\n🌱 Total lessons found: ${lessons.length}`);
    
    if (lessons.length < 24) {
      console.log(`⚠️ Expected 24 lessons (for 24 estimated hours), but found ${lessons.length}`);
      console.log('📝 Some lessons may need to be added to reach the full unit scope');
    } else if (lessons.length === 24) {
      console.log('✅ Perfect! Found exactly 24 lessons as expected');
    } else {
      console.log(`📈 Found ${lessons.length} lessons (more than expected 24)`);
    }
    
    return { emily, growthUnit, lessons };
    
  } catch (error) {
    console.error('❌ Error querying lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the query
queryGrowingChangingLessons()
  .then(() => console.log('\n🏆 Query completed successfully!'))
  .catch((error) => {
    console.error('💥 Query failed:', error);
    process.exit(1);
  });