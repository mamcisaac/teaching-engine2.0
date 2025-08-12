#!/usr/bin/env tsx

/**
 * Calendar Validator for Teaching Engine 2.0
 * Ensures all lessons comply with PEI School Calendar 2025-2026
 * Run this anytime to verify calendar compliance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete PEI School Calendar 2025-2026
const SCHOOL_CALENDAR = {
  year: '2025-2026',
  firstDay: '2025-09-03',
  lastDay: '2026-06-26',
  
  holidays: [
    '2025-09-01', // Labour Day
    '2025-10-14', // Thanksgiving
    '2025-11-11', // Remembrance Day
    '2026-02-17', // Islander Day
    '2026-04-10', // Good Friday
    '2026-04-13', // Easter Monday
    '2026-05-18', // Victoria Day
  ],
  
  pdDays: [
    '2025-09-02', // September PD
    '2025-10-17', // October PD
    '2025-11-07', // November PD
    '2026-01-30', // January PD
    '2026-02-27', // February PD
    '2026-04-24', // April PD
    '2026-05-01', // May PD
    '2026-06-29', // June PD (after school)
  ],
  
  breaks: [
    { name: 'Christmas', start: '2025-12-22', end: '2026-01-04' },
    { name: 'March', start: '2026-03-09', end: '2026-03-13' }
  ]
};

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  stats: {
    totalLessons: number;
    holidayConflicts: number;
    pdDayConflicts: number;
    weekendLessons: number;
    breakConflicts: number;
  };
}

async function validateCalendar(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    stats: {
      totalLessons: 0,
      holidayConflicts: 0,
      pdDayConflicts: 0,
      weekendLessons: 0,
      breakConflicts: 0
    }
  };

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('User not found');

    // Get all lessons
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });

    result.stats.totalLessons = lessons.length;

    // Check each lesson for calendar compliance
    for (const lesson of lessons) {
      const dateStr = lesson.date.toISOString().split('T')[0];
      const dayOfWeek = lesson.date.getDay();

      // Check weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        result.issues.push(`Weekend lesson: ${lesson.titleFr || lesson.title} on ${lesson.date.toDateString()}`);
        result.stats.weekendLessons++;
        result.isValid = false;
      }

      // Check holidays
      if (SCHOOL_CALENDAR.holidays.includes(dateStr)) {
        // Exception for Remembrance Day ceremony
        if (dateStr === '2025-11-11' && 
            (lesson.title?.includes('Ceremony') || lesson.titleFr?.includes('Cérémonie'))) {
          result.warnings.push(`Remembrance Day ceremony scheduled (appropriate)`);
        } else {
          result.issues.push(`Holiday conflict: ${lesson.titleFr || lesson.title} on ${lesson.date.toDateString()}`);
          result.stats.holidayConflicts++;
          result.isValid = false;
        }
      }

      // Check PD days
      if (SCHOOL_CALENDAR.pdDays.includes(dateStr)) {
        result.issues.push(`PD Day conflict: ${lesson.titleFr || lesson.title} on ${lesson.date.toDateString()}`);
        result.stats.pdDayConflicts++;
        result.isValid = false;
      }

      // Check breaks
      for (const breakPeriod of SCHOOL_CALENDAR.breaks) {
        const lessonDate = new Date(dateStr);
        const breakStart = new Date(breakPeriod.start);
        const breakEnd = new Date(breakPeriod.end);
        
        if (lessonDate >= breakStart && lessonDate <= breakEnd) {
          result.issues.push(`${breakPeriod.name} break conflict: ${lesson.titleFr || lesson.title} on ${lesson.date.toDateString()}`);
          result.stats.breakConflicts++;
          result.isValid = false;
        }
      }
    }

    // Add summary warnings
    if (result.stats.totalLessons === 0) {
      result.warnings.push('No lessons found in system');
    }

    const firstSemesterCount = lessons.filter(l => 
      l.date >= new Date('2025-09-01') && l.date <= new Date('2025-12-31')
    ).length;

    const secondSemesterCount = lessons.filter(l => 
      l.date >= new Date('2026-01-01') && l.date <= new Date('2026-06-30')
    ).length;

    if (secondSemesterCount === 0 && firstSemesterCount > 0) {
      result.warnings.push('Second semester has no lessons yet (only unit plans)');
    }

  } catch (error) {
    result.isValid = false;
    result.issues.push(`Validation error: ${error}`);
  }

  return result;
}

// Display validation results
function displayResults(result: ValidationResult) {
  console.log('\n📅 CALENDAR VALIDATION RESULTS');
  console.log('=' + '='.repeat(50));

  if (result.isValid) {
    console.log('\n✅ CALENDAR IS FULLY COMPLIANT!\n');
  } else {
    console.log('\n❌ CALENDAR COMPLIANCE ISSUES FOUND\n');
  }

  console.log('📊 STATISTICS:');
  console.log(`   Total lessons: ${result.stats.totalLessons}`);
  console.log(`   Holiday conflicts: ${result.stats.holidayConflicts}`);
  console.log(`   PD day conflicts: ${result.stats.pdDayConflicts}`);
  console.log(`   Weekend lessons: ${result.stats.weekendLessons}`);
  console.log(`   Break conflicts: ${result.stats.breakConflicts}`);

  if (result.issues.length > 0) {
    console.log('\n❌ ISSUES:');
    result.issues.slice(0, 10).forEach(issue => {
      console.log(`   • ${issue}`);
    });
    if (result.issues.length > 10) {
      console.log(`   ... and ${result.issues.length - 10} more issues`);
    }
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }

  console.log('\n' + '='.repeat(51));
}

// Main execution
async function main() {
  console.log('🔍 Teaching Engine 2.0 - Calendar Validator');
  console.log('Checking compliance with PEI School Calendar 2025-2026...');

  try {
    const result = await validateCalendar();
    displayResults(result);
    
    if (!result.isValid) {
      console.log('\n💡 TO FIX ISSUES:');
      console.log('   1. Run: npx tsx fix-calendar-conflicts.ts');
      console.log('   2. Run: npx tsx fix-pd-days-final.ts');
      console.log('   3. Run this validator again to confirm');
    }
    
    process.exit(result.isValid ? 0 : 1);
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();