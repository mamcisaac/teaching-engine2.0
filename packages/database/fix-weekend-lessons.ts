#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWeekendLessons() {
  console.log('🔧 Fixing Weekend Lesson Dates...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get all September lessons scheduled on weekends
    const weekendLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log(`Found ${weekendLessons.length} lessons to check\n`);
    
    let fixCount = 0;
    
    for (const lesson of weekendLessons) {
      const dayOfWeek = lesson.date.getDay();
      
      // If it's Saturday (6) or Sunday (0), move to Monday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const oldDate = lesson.date.toISOString().split('T')[0];
        
        // Calculate days to add to get to Monday
        let daysToAdd = 0;
        if (dayOfWeek === 0) { // Sunday
          daysToAdd = 1; // Move to Monday
        } else if (dayOfWeek === 6) { // Saturday
          daysToAdd = 2; // Move to Monday
        }
        
        const newDate = new Date(lesson.date);
        newDate.setDate(newDate.getDate() + daysToAdd);
        
        console.log(`📅 Moving "${lesson.titleFr}" from ${oldDate} (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}) to ${newDate.toISOString().split('T')[0]} (Monday)`);
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
        
        fixCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixCount} lessons that were on weekends`);
    
    // Verify no more weekend lessons
    const remainingWeekendLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      }
    });
    
    let weekendCount = 0;
    remainingWeekendLessons.forEach(lesson => {
      const day = lesson.date.getDay();
      if (day === 0 || day === 6) {
        weekendCount++;
      }
    });
    
    if (weekendCount === 0) {
      console.log('✅ All lessons are now on weekdays!');
    } else {
      console.log(`⚠️ Still ${weekendCount} lessons on weekends - may need manual adjustment`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixWeekendLessons()
  .then(() => console.log('\n✅ Date fixing complete!'))
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });