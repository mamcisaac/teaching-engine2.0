#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWeekendLessons() {
  console.log('🔧 FIXING WEEKEND LESSONS\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all lessons
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });

    // Find weekend lessons
    const weekendLessons = allLessons.filter(lesson => {
      const day = lesson.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    console.log(`Found ${weekendLessons.length} weekend lessons to fix\n`);

    if (weekendLessons.length > 0) {
      console.log('MOVING WEEKEND LESSONS:');
      console.log('========================\n');

      let moved = 0;
      
      for (const lesson of weekendLessons) {
        const oldDate = new Date(lesson.date);
        const dayOfWeek = oldDate.getDay();
        
        // Calculate how many days to add to get to next weekday
        let daysToAdd = 0;
        if (dayOfWeek === 0) { // Sunday
          daysToAdd = 1; // Move to Monday
        } else if (dayOfWeek === 6) { // Saturday
          daysToAdd = -1; // Move to Friday
        }
        
        // Create new date
        const newDate = new Date(oldDate);
        newDate.setDate(newDate.getDate() + daysToAdd);
        
        // Update the lesson
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
        
        moved++;
        
        const oldDateStr = oldDate.toDateString();
        const newDateStr = newDate.toDateString();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][newDate.getDay()];
        
        console.log(`✅ Moved: ${lesson.titleFr || lesson.title}`);
        console.log(`   From: ${oldDateStr} (Weekend)`);
        console.log(`   To: ${newDateStr} (${dayName})\n`);
      }
      
      console.log(`Successfully moved ${moved} weekend lessons`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 WEEKEND FIX SUMMARY');
    console.log('='.repeat(60));

    const totalLessons = await prisma.eTFOLessonPlan.count({
      where: { userId: emily.id }
    });

    console.log(`\n✅ RESULTS:`);
    console.log(`   • Total lessons: ${totalLessons}`);
    console.log(`   • Weekend lessons fixed: ${weekendLessons.length}`);
    console.log(`   • All lessons now on weekdays: YES`);

  } catch (error) {
    console.error('❌ Error fixing weekend lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixWeekendLessons()
  .then(() => {
    console.log('\n✅ Weekend lesson fixes complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Weekend fix failed:', error);
    process.exit(1);
  });
