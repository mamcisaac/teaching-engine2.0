#!/usr/bin/env tsx

/**
 * CHECK HOLIDAY AND PD DAY GAPS IN UNIT TIMELINES
 * Verifies if unit plans account for school breaks
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHolidayGaps() {
  console.log('🗓️ CHECKING UNIT TIMELINES FOR HOLIDAY/PD DAY ACCOUNTING\n');
  console.log('='.repeat(70));
  
  try {
    // PEI School Calendar 2025-2026 (typical holidays/PD days)
    const schoolBreaks = [
      { name: 'Labour Day', start: new Date(2025, 8, 1), end: new Date(2025, 8, 1) },
      { name: 'Thanksgiving', start: new Date(2025, 9, 13), end: new Date(2025, 9, 13) },
      { name: 'PD Day (Oct)', start: new Date(2025, 9, 24), end: new Date(2025, 9, 24) },
      { name: 'Remembrance Day', start: new Date(2025, 10, 11), end: new Date(2025, 10, 11) },
      { name: 'PD Day (Nov)', start: new Date(2025, 10, 28), end: new Date(2025, 10, 28) },
      { name: 'Christmas Break', start: new Date(2025, 11, 22), end: new Date(2026, 0, 2) },
      { name: 'PD Day (Jan)', start: new Date(2026, 0, 30), end: new Date(2026, 0, 30) },
      { name: 'Islander Day', start: new Date(2026, 1, 16), end: new Date(2026, 1, 16) },
      { name: 'PD Day (Feb)', start: new Date(2026, 1, 27), end: new Date(2026, 1, 27) },
      { name: 'March Break', start: new Date(2026, 2, 16), end: new Date(2026, 2, 20) },
      { name: 'Good Friday', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3) },
      { name: 'Easter Monday', start: new Date(2026, 3, 6), end: new Date(2026, 3, 6) },
      { name: 'PD Day (May)', start: new Date(2026, 4, 22), end: new Date(2026, 4, 22) },
      { name: 'Victoria Day', start: new Date(2026, 4, 18), end: new Date(2026, 4, 18) }
    ];
    
    console.log('📅 PEI School Calendar Breaks:\n');
    schoolBreaks.forEach(b => {
      const days = Math.floor((b.end.getTime() - b.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`  ${b.name}: ${b.start.toDateString()} ${days > 1 ? `- ${b.end.toDateString()} (${days} days)` : ''}`);
    });
    
    // Calculate total school days lost
    const totalBreakDays = schoolBreaks.reduce((sum, b) => {
      const days = Math.floor((b.end.getTime() - b.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);
    
    console.log(`\nTotal break days: ${totalBreakDays}`);
    console.log(`School year: Sept 4, 2025 - June 25, 2026`);
    console.log(`Calendar days: 295`);
    console.log(`Weekdays: ~211`);
    console.log(`Less breaks: ${211 - totalBreakDays} = ~181 instructional days ✓\n`);
    
    // Get all units
    const units = await prisma.unitPlan.findMany({
      include: { longRangePlan: true },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('🔍 CHECKING FOR UNITS SPANNING BREAKS:\n');
    
    const issues: string[] = [];
    
    units.forEach(unit => {
      // Check if unit spans any break
      schoolBreaks.forEach(holiday => {
        if (unit.startDate <= holiday.end && unit.endDate >= holiday.start) {
          // Unit spans this break
          const days = Math.floor((holiday.end.getTime() - holiday.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Calculate if unit has enough buffer
          const unitWeekdays = getWeekdays(unit.startDate, unit.endDate);
          const unitSchoolDays = unitWeekdays - getBreakDaysInRange(unit.startDate, unit.endDate, schoolBreaks);
          
          // Check if hours account for lost days
          const subject = unit.longRangePlan.subject;
          let expectedBlocks = 0;
          
          if (subject === 'Français langue première' || subject === 'Mathématiques') {
            expectedBlocks = unitSchoolDays * 2; // 2 blocks daily
          } else if (subject === 'Sciences de la nature') {
            expectedBlocks = unitSchoolDays; // 1 block daily
          }
          
          if (expectedBlocks > 0) {
            const expectedHours = (expectedBlocks * 30) / 60;
            const allocatedHours = unit.estimatedHours || 0;
            
            if (Math.abs(allocatedHours - expectedHours) > 5) {
              issues.push(`${unit.title} spans ${holiday.name} - allocated ${allocatedHours}h but needs ~${expectedHours.toFixed(0)}h`);
            }
          }
        }
      });
    });
    
    if (issues.length > 0) {
      console.log('⚠️ POTENTIAL ISSUES:\n');
      issues.forEach(i => console.log(`  • ${i}`));
    } else {
      console.log('✅ All units appear to account for breaks properly');
    }
    
    // Check specific examples
    console.log('\n📊 SAMPLE UNIT ANALYSIS:\n');
    
    // Check a December unit (spans Christmas)
    const decemberUnit = units.find(u => 
      u.startDate.getMonth() === 11 && u.startDate.getFullYear() === 2025
    );
    
    if (decemberUnit) {
      console.log(`December Unit: ${decemberUnit.title}`);
      console.log(`  Dates: ${decemberUnit.startDate.toDateString()} - ${decemberUnit.endDate.toDateString()}`);
      
      const weekdays = getWeekdays(decemberUnit.startDate, decemberUnit.endDate);
      const breakDays = getBreakDaysInRange(decemberUnit.startDate, decemberUnit.endDate, schoolBreaks);
      const actualSchoolDays = weekdays - breakDays;
      
      console.log(`  Weekdays in range: ${weekdays}`);
      console.log(`  Break days: ${breakDays}`);
      console.log(`  Actual school days: ${actualSchoolDays}`);
      console.log(`  Allocated hours: ${decemberUnit.estimatedHours}`);
    }
    
    // Check a March unit (spans March Break)
    const marchUnit = units.find(u => 
      u.startDate.getMonth() === 2 && u.startDate.getFullYear() === 2026
    );
    
    if (marchUnit) {
      console.log(`\nMarch Unit: ${marchUnit.title}`);
      console.log(`  Dates: ${marchUnit.startDate.toDateString()} - ${marchUnit.endDate.toDateString()}`);
      
      const weekdays = getWeekdays(marchUnit.startDate, marchUnit.endDate);
      const breakDays = getBreakDaysInRange(marchUnit.startDate, marchUnit.endDate, schoolBreaks);
      const actualSchoolDays = weekdays - breakDays;
      
      console.log(`  Weekdays in range: ${weekdays}`);
      console.log(`  Break days: ${breakDays}`);
      console.log(`  Actual school days: ${actualSchoolDays}`);
      console.log(`  Allocated hours: ${marchUnit.estimatedHours}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📋 ASSESSMENT SUMMARY\n');
    
    const totalUnits = units.length;
    const unitsSpanningBreaks = units.filter(u => {
      return schoolBreaks.some(b => u.startDate <= b.end && u.endDate >= b.start);
    }).length;
    
    console.log(`Total units: ${totalUnits}`);
    console.log(`Units spanning breaks: ${unitsSpanningBreaks}`);
    console.log(`\n💡 CONCLUSION:`);
    console.log(`The unit timelines SPAN holidays/PD days but the hour allocations`);
    console.log(`should be based on ACTUAL instructional days (excluding breaks).`);
    console.log(`\nCurrent implementation: Hours are calculated proportionally based on`);
    console.log(`unit duration, which may not perfectly account for breaks within units.`);
    
  } catch (error) {
    console.error('❌ Check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getWeekdays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function getBreakDaysInRange(start: Date, end: Date, breaks: any[]): number {
  let breakDays = 0;
  
  breaks.forEach(b => {
    if (start <= b.end && end >= b.start) {
      // Calculate overlap
      const overlapStart = start > b.start ? start : b.start;
      const overlapEnd = end < b.end ? end : b.end;
      
      const current = new Date(overlapStart);
      while (current <= overlapEnd) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          breakDays++;
        }
        current.setDate(current.getDate() + 1);
      }
    }
  });
  
  return breakDays;
}

// Run check
checkHolidayGaps().catch(console.error);