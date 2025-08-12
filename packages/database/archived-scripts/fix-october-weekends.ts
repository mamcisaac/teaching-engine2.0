#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOctoberWeekends() {
  console.log('🔧 Fixing October Weekend Lessons...\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found');
    }
    
    // Get all October lessons
    const octoberLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-10-01'),
          lte: new Date('2025-10-31')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log(`Found ${octoberLessons.length} October lessons to check\n`);
    
    let fixCount = 0;
    
    for (const lesson of octoberLessons) {
      const dayOfWeek = lesson.date.getDay();
      
      // If it's Saturday (6) or Sunday (0), move to next Monday
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
    
    console.log(`\n✅ Fixed ${fixCount} October lessons that were on weekends`);
    
    // Also fix September 29-30 overload by spreading lessons
    console.log('\n🔧 Checking September 29-30 overload...\n');
    
    const sept29Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-09-29')
      }
    });
    
    const sept30Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-09-30')
      }
    });
    
    console.log(`September 29: ${sept29Lessons.length} lessons`);
    console.log(`September 30: ${sept30Lessons.length} lessons`);
    
    // If Sept 29 has more than 4 lessons, move some to Sept 26
    if (sept29Lessons.length > 4) {
      const toMove = sept29Lessons.slice(4); // Get lessons after the first 4
      
      for (const lesson of toMove) {
        const newDate = new Date('2025-09-26'); // Move to Friday Sept 26
        console.log(`📅 Moving "${lesson.titleFr}" from Sept 29 to Sept 26`);
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
      }
      
      console.log(`✅ Moved ${toMove.length} lessons from Sept 29 to Sept 26`);
    }
    
    // If Sept 30 has more than 4 lessons, keep only celebrations
    if (sept30Lessons.length > 4) {
      // Keep only celebration lessons on Sept 30
      const celebrations = sept30Lessons.filter(l => 
        l.titleFr?.toLowerCase().includes('célébration') ||
        l.titleFr?.toLowerCase().includes('celebration')
      );
      
      const toMove = sept30Lessons.filter(l => 
        !l.titleFr?.toLowerCase().includes('célébration') &&
        !l.titleFr?.toLowerCase().includes('celebration')
      ).slice(0, sept30Lessons.length - 4);
      
      for (const lesson of toMove) {
        const newDate = new Date('2025-09-25'); // Move to Thursday Sept 25
        console.log(`📅 Moving "${lesson.titleFr}" from Sept 30 to Sept 25`);
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
      }
      
      console.log(`✅ Moved ${toMove.length} lessons from Sept 30 to distribute load`);
    }
    
    // Final check
    console.log('\n📊 Final Schedule Check:');
    
    const finalCheck = await prisma.eTFOLessonPlan.groupBy({
      by: ['date'],
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-24'),
          lte: new Date('2025-10-07')
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    finalCheck.forEach(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const status = day._count.id > 5 ? '⚠️' : '✅';
      console.log(`${status} ${date.toISOString().split('T')[0]} (${dayName}): ${day._count.id} lessons`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixOctoberWeekends()
  .then(() => console.log('\n✅ Schedule fixes complete!'))
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });