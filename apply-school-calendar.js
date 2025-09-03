#!/usr/bin/env node

/**
 * Apply Emily's actual school calendar to current lessons
 * This replaces the naive consecutive-day scheduling with proper PEI school dates
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./packages/database/prisma/prisma/dev.db'
    }
  }
});

// Time slot mapping
const TIME_TO_SLOT = {
  '08:45': 1,
  '09:30': 2,
  '10:30': 3,
  '11:15': 4,
  '13:00': 5, // After lunch
  '13:45': 5,
  '14:30': 5
};

async function main() {
  console.log('📅 Applying Emily\'s actual school calendar...');
  
  try {
    // Load Emily's school calendar
    const calendarPath = path.join(__dirname, 'emily-yearly-schedule.json');
    const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
    
    console.log(`📖 Found ${calendar.length} scheduled entries`);
    
    // Find Emily's user account
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found in database!');
    }
    
    console.log(`✅ Found Emily: ${emily.name} (ID: ${emily.id})`);
    
    // Get all current lessons for Emily
    const currentLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${currentLessons.length} current lessons to reschedule`);
    
    // Group calendar entries by subject and date
    const calendarBySubject = {};
    calendar.forEach(entry => {
      if (!calendarBySubject[entry.subject]) {
        calendarBySubject[entry.subject] = [];
      }
      calendarBySubject[entry.subject].push(entry);
    });
    
    // Sort each subject's entries by date
    Object.keys(calendarBySubject).forEach(subject => {
      calendarBySubject[subject].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    console.log('📅 Calendar subjects found:', Object.keys(calendarBySubject));
    
    let updatedCount = 0;
    
    // Update lessons by subject
    for (const lesson of currentLessons) {
      const subject = lesson.unitPlan.longRangePlan.subject;
      
      if (!calendarBySubject[subject]) {
        console.log(`⚠️  No calendar entries for subject: ${subject}`);
        continue;
      }
      
      // Find a calendar entry for this subject (round-robin assignment)
      const subjectEntries = calendarBySubject[subject];
      const entryIndex = updatedCount % subjectEntries.length;
      const calendarEntry = subjectEntries[entryIndex];
      
      if (!calendarEntry) {
        console.log(`⚠️  No more calendar entries for subject: ${subject}`);
        continue;
      }
      
      // Calculate slot number from time
      const slotNumber = TIME_TO_SLOT[calendarEntry.time] || 1;
      
      // Update the lesson with proper date and slot
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          date: new Date(calendarEntry.date + 'T00:00:00.000Z'),
          slotNumber: slotNumber
        }
      });
      
      console.log(`✅ Updated lesson "${lesson.titleFr || lesson.title}" to ${calendarEntry.date} slot ${slotNumber}`);
      updatedCount++;
    }
    
    console.log(`🎉 Successfully rescheduled ${updatedCount} lessons using Emily's school calendar!`);
    
    // Summary of the new schedule
    const scheduleSummary = await prisma.eTFOLessonPlan.groupBy({
      by: ['date'],
      where: {
        userId: emily.id
      },
      _count: true,
      orderBy: {
        date: 'asc'
      }
    });
    
    console.log('\n📊 New schedule summary (first 10 days):');
    scheduleSummary.slice(0, 10).forEach(day => {
      console.log(`  ${day.date.toISOString().split('T')[0]}: ${day._count} lessons`);
    });
    
  } catch (error) {
    console.error('❌ Error applying school calendar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();