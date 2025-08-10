#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchoolCalendarAlignment() {
  console.log('📅 CHECKING ALIGNMENT WITH PEI SCHOOL CALENDAR 2025-2026\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // PEI School Calendar 2025-2026 (typical structure - may need adjustment)
    const schoolCalendar = {
      firstDay: new Date('2025-09-04'), // Thursday after Labour Day
      holidays: [
        { date: new Date('2025-09-01'), name: 'Labour Day', type: 'holiday' },
        { date: new Date('2025-10-13'), name: 'Thanksgiving Day', type: 'holiday' },
        { date: new Date('2025-11-11'), name: 'Remembrance Day', type: 'holiday' },
        { date: new Date('2025-12-23'), name: 'Christmas Break Starts', type: 'break-start' },
        { date: new Date('2026-01-05'), name: 'Classes Resume', type: 'break-end' },
        { date: new Date('2026-02-17'), name: 'Islander Day', type: 'holiday' },
        { date: new Date('2026-03-02'), name: 'March Break Starts', type: 'break-start' },
        { date: new Date('2026-03-09'), name: 'Classes Resume', type: 'break-end' },
        { date: new Date('2026-04-10'), name: 'Good Friday', type: 'holiday' },
        { date: new Date('2026-04-13'), name: 'Easter Monday', type: 'holiday' },
        { date: new Date('2026-05-18'), name: 'Victoria Day', type: 'holiday' },
        { date: new Date('2026-06-26'), name: 'Last Day of School', type: 'last-day' }
      ],
      pdDays: [
        { date: new Date('2025-09-03'), name: 'PD Day - Before First Day' },
        { date: new Date('2025-10-17'), name: 'October PD Day' },
        { date: new Date('2025-11-07'), name: 'November PD Day' },
        { date: new Date('2026-01-30'), name: 'January PD Day' },
        { date: new Date('2026-04-24'), name: 'April PD Day' },
        { date: new Date('2026-05-01'), name: 'May PD Day' }
      ],
      breaks: [
        { start: new Date('2025-12-23'), end: new Date('2026-01-04'), name: 'Christmas Break' },
        { start: new Date('2026-03-02'), end: new Date('2026-03-08'), name: 'March Break' }
      ]
    };

    // Get all lessons
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });

    console.log(`Total lessons in system: ${allLessons.length}\n`);

    // Check for lessons on holidays
    console.log('🚫 CHECKING FOR LESSONS ON HOLIDAYS/BREAKS:\n');
    
    let lessonsOnHolidays = [];
    let lessonsOnPDDays = [];
    let lessonsDuringBreaks = [];

    // Check holidays
    for (const holiday of schoolCalendar.holidays) {
      const lessonsOnDay = allLessons.filter(l => 
        l.date.toDateString() === holiday.date.toDateString()
      );
      
      if (lessonsOnDay.length > 0) {
        lessonsOnHolidays.push({
          date: holiday.date,
          holiday: holiday.name,
          lessons: lessonsOnDay
        });
      }
    }

    // Check PD Days
    for (const pdDay of schoolCalendar.pdDays) {
      const lessonsOnDay = allLessons.filter(l => 
        l.date.toDateString() === pdDay.date.toDateString()
      );
      
      if (lessonsOnDay.length > 0) {
        lessonsOnPDDays.push({
          date: pdDay.date,
          pdDay: pdDay.name,
          lessons: lessonsOnDay
        });
      }
    }

    // Check breaks
    for (const breakPeriod of schoolCalendar.breaks) {
      const lessonsDuringBreak = allLessons.filter(l => 
        l.date >= breakPeriod.start && l.date <= breakPeriod.end
      );
      
      if (lessonsDuringBreak.length > 0) {
        lessonsDuringBreaks.push({
          break: breakPeriod.name,
          start: breakPeriod.start,
          end: breakPeriod.end,
          lessons: lessonsDuringBreak
        });
      }
    }

    // Report findings
    if (lessonsOnHolidays.length > 0) {
      console.log('❌ LESSONS SCHEDULED ON HOLIDAYS:');
      lessonsOnHolidays.forEach(item => {
        console.log(`\n  ${item.holiday} (${item.date.toDateString()}):`);
        item.lessons.forEach(l => {
          console.log(`    - ${l.titleFr || l.title} (${l.subject})`);
        });
      });
    } else {
      console.log('✅ No lessons scheduled on holidays');
    }

    if (lessonsOnPDDays.length > 0) {
      console.log('\n⚠️ LESSONS SCHEDULED ON PD DAYS:');
      lessonsOnPDDays.forEach(item => {
        console.log(`\n  ${item.pdDay} (${item.date.toDateString()}):`);
        item.lessons.forEach(l => {
          console.log(`    - ${l.titleFr || l.title} (${l.subject})`);
        });
      });
    } else {
      console.log('✅ No lessons scheduled on PD days');
    }

    if (lessonsDuringBreaks.length > 0) {
      console.log('\n❌ LESSONS SCHEDULED DURING BREAKS:');
      lessonsDuringBreaks.forEach(item => {
        console.log(`\n  ${item.break} (${item.start.toDateString()} to ${item.end.toDateString()}):`);
        console.log(`  Found ${item.lessons.length} lessons during this break`);
        item.lessons.slice(0, 5).forEach(l => {
          console.log(`    - ${l.date.toDateString()}: ${l.titleFr || l.title}`);
        });
        if (item.lessons.length > 5) {
          console.log(`    ... and ${item.lessons.length - 5} more`);
        }
      });
    } else {
      console.log('✅ No lessons scheduled during breaks');
    }

    // Check first and last days
    console.log('\n📆 SEMESTER BOUNDARIES CHECK:\n');
    
    const firstLesson = allLessons[0];
    const lastLesson = allLessons[allLessons.length - 1];
    
    console.log(`First lesson date: ${firstLesson?.date.toDateString()}`);
    console.log(`School starts: ${schoolCalendar.firstDay.toDateString()}`);
    
    if (firstLesson && firstLesson.date < schoolCalendar.firstDay) {
      console.log('❌ First lesson is BEFORE school starts!');
    } else {
      console.log('✅ First lesson aligns with school start');
    }

    // Check December lessons end before break
    const decemberLessons = allLessons.filter(l => 
      l.date.getMonth() === 11 && l.date.getFullYear() === 2025
    );
    
    const lastDecLesson = decemberLessons[decemberLessons.length - 1];
    const christmasBreakStart = new Date('2025-12-23');
    
    console.log(`\nLast December lesson: ${lastDecLesson?.date.toDateString()}`);
    console.log(`Christmas break starts: ${christmasBreakStart.toDateString()}`);
    
    if (lastDecLesson && lastDecLesson.date >= christmasBreakStart) {
      console.log('❌ December lessons extend into Christmas break!');
    } else {
      console.log('✅ December lessons end before Christmas break');
    }

    // Check for weekend lessons
    console.log('\n🚫 WEEKEND CHECK:\n');
    
    const weekendLessons = allLessons.filter(l => {
      const day = l.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    if (weekendLessons.length > 0) {
      console.log(`❌ Found ${weekendLessons.length} lessons on weekends:`);
      weekendLessons.slice(0, 5).forEach(l => {
        console.log(`  - ${l.date.toDateString()}: ${l.titleFr || l.title}`);
      });
      if (weekendLessons.length > 5) {
        console.log(`  ... and ${weekendLessons.length - 5} more`);
      }
    } else {
      console.log('✅ No lessons scheduled on weekends');
    }

    // September analysis
    console.log('\n📊 SEPTEMBER 2025 DETAILED ANALYSIS:\n');
    
    const septemberLessons = allLessons.filter(l => 
      l.date.getMonth() === 8 && l.date.getFullYear() === 2025
    );

    const septDates = new Map();
    septemberLessons.forEach(l => {
      const dateStr = l.date.toDateString();
      if (!septDates.has(dateStr)) septDates.set(dateStr, []);
      septDates.get(dateStr).push(l);
    });

    console.log('September teaching days with lessons:');
    [...septDates.keys()].sort().forEach(dateStr => {
      const lessons = septDates.get(dateStr);
      const date = new Date(dateStr);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      
      // Check if it's a holiday or PD day
      const isHoliday = schoolCalendar.holidays.some(h => h.date.toDateString() === dateStr);
      const isPDDay = schoolCalendar.pdDays.some(pd => pd.date.toDateString() === dateStr);
      
      let flag = '';
      if (isHoliday) flag = ' ❌ HOLIDAY';
      if (isPDDay) flag = ' ⚠️ PD DAY';
      if (date.getDay() === 0 || date.getDay() === 6) flag = ' ❌ WEEKEND';
      
      console.log(`  ${dayName} ${dateStr}: ${lessons.length} lessons${flag}`);
    });

    // Calculate actual teaching days
    console.log('\n📈 TEACHING DAYS CALCULATION:\n');
    
    let actualTeachingDays = 0;
    const startDate = new Date('2025-09-04');
    const endDate = new Date('2025-12-22'); // Last day before Christmas break
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dateStr = d.toDateString();
      
      // Skip weekends
      if (day === 0 || day === 6) continue;
      
      // Skip holidays
      const isHoliday = schoolCalendar.holidays.some(h => h.date.toDateString() === dateStr);
      if (isHoliday) continue;
      
      // Skip PD days
      const isPDDay = schoolCalendar.pdDays.some(pd => pd.date.toDateString() === dateStr);
      if (isPDDay) continue;
      
      // Skip breaks
      const isDuringBreak = schoolCalendar.breaks.some(b => d >= b.start && d <= b.end);
      if (isDuringBreak) continue;
      
      actualTeachingDays++;
    }

    const daysWithLessons = new Set(allLessons.filter(l => 
      l.date >= startDate && l.date <= endDate
    ).map(l => l.date.toDateString())).size;

    console.log(`Actual teaching days (Sept 4 - Dec 22): ${actualTeachingDays}`);
    console.log(`Days with lessons scheduled: ${daysWithLessons}`);
    console.log(`Coverage: ${Math.round((daysWithLessons / actualTeachingDays) * 100)}%`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 CALENDAR ALIGNMENT SUMMARY');
    console.log('='.repeat(60) + '\n');

    const issues = [];
    const warnings = [];
    const strengths = [];

    if (lessonsOnHolidays.length > 0) {
      issues.push(`${lessonsOnHolidays.length} holidays have lessons scheduled`);
    } else {
      strengths.push('No lessons on holidays');
    }

    if (lessonsDuringBreaks.length > 0) {
      issues.push('Lessons scheduled during breaks');
    } else {
      strengths.push('Respects all school breaks');
    }

    if (weekendLessons.length > 0) {
      issues.push(`${weekendLessons.length} weekend lessons found`);
    } else {
      strengths.push('No weekend lessons');
    }

    if (lessonsOnPDDays.length > 0) {
      warnings.push(`${lessonsOnPDDays.length} PD days have lessons (may be intentional)`);
    }

    if (issues.length === 0) {
      console.log('✅ PERFECT CALENDAR ALIGNMENT - No issues found!');
    } else {
      console.log('❌ CALENDAR ALIGNMENT ISSUES FOUND:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (strengths.length > 0) {
      console.log('\n✅ STRENGTHS:');
      strengths.forEach(strength => console.log(`   • ${strength}`));
    }

  } catch (error) {
    console.error('❌ Error checking calendar alignment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkSchoolCalendarAlignment()
  .then(() => {
    console.log('\n✅ School calendar alignment check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Calendar check failed:', error);
    process.exit(1);
  });