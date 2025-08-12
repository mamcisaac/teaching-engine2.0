#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeUnitTimelineNeeds() {
  // Get all unit plans with lesson counts
  const units = await prisma.unitPlan.findMany({
    include: {
      longRangePlan: true,
      _count: {
        select: { lessonPlans: true }
      }
    },
    orderBy: [
      { longRangePlan: { subject: 'asc' } },
      { title: 'asc' }
    ]
  });
  
  // Group by subject
  const bySubject: Record<string, any[]> = {};
  units.forEach(u => {
    const subject = u.longRangePlan.subject;
    if (!bySubject[subject]) {
      bySubject[subject] = [];
    }
    bySubject[subject].push({
      title: u.title,
      unitNumber: u.unitNumber || 0,
      timeline: u.timeline,
      hours: u.totalHours,
      lessons: u._count.lessonPlans
    });
  });
  
  console.log('CURRENT UNIT STRUCTURE VS ACTUAL NEEDS:');
  console.log('='.repeat(70));
  
  // Required lessons based on schedule frequency
  const needs = {
    'Français langue première': 181,      // Daily
    'Mathématiques': 181,                  // Daily
    'Sciences de la nature': 108,          // 3x/week
    'Sciences humaines': 72,               // 2x/week
    'Arts visuels': 72,                    // 2x/week
    'Éducation physique': 108,             // 3x/week
    'Music': 72,                           // 2x/week
    'Formation personnelle et sociale': 36 // 1x/week
  };
  
  // Calculate monthly distribution (181 days)
  const monthlyDays = {
    September: 18,
    October: 21,
    November: 15,
    December: 15,
    January: 20,
    February: 18,
    March: 17,
    April: 19,
    May: 19,
    June: 19
  };
  
  Object.entries(bySubject).forEach(([subject, units]) => {
    const totalLessons = units.reduce((sum, u) => sum + u.lessons, 0);
    const needed = needs[subject] || 0;
    
    console.log(`\n${subject}:`);
    console.log(`  Current: ${units.length} units, ${totalLessons} lessons`);
    console.log(`  NEEDED: ${needed} lessons total`);
    console.log(`  GAP: ${needed - totalLessons} lessons missing`);
    console.log(`  Average per unit: ${Math.ceil(needed / units.length)} lessons`);
    
    // Show what timeline each unit SHOULD have
    if (units.length > 0) {
      console.log('\n  Recommended Unit Distribution:');
      const lessonsPerUnit = Math.floor(needed / units.length);
      const remainder = needed % units.length;
      
      units.forEach((unit, idx) => {
        const unitLessons = lessonsPerUnit + (idx < remainder ? 1 : 0);
        console.log(`    Unit ${unit.unitNumber || idx + 1}: ${unitLessons} lessons`);
      });
    }
  });
  
  // Show ideal weekly distribution
  console.log('\n' + '='.repeat(70));
  console.log('IDEAL WEEKLY SCHEDULE (285 minutes/day):');
  console.log('='.repeat(70));
  
  const weeklySchedule = {
    'Monday': ['Français (60)', 'Math (45)', 'Science (45)', 'Arts (45)', 'Flex (45)'],
    'Tuesday': ['Français (60)', 'Math (45)', 'Social Studies (45)', 'PE (45)', 'Music (45)'],
    'Wednesday': ['Français (60)', 'Math (45)', 'Science (45)', 'Arts (45)', 'Flex (45)'],
    'Thursday': ['Français (60)', 'Math (45)', 'Social Studies (45)', 'PE (45)', 'Music (45)'],
    'Friday': ['Français (60)', 'Math (45)', 'Science (45)', 'PE (45)', 'Health/FPS (45)']
  };
  
  Object.entries(weeklySchedule).forEach(([day, periods]) => {
    console.log(`\n${day}:`);
    periods.forEach((period, idx) => {
      const time = ['8:30-9:30', '9:45-10:30', '10:45-11:30', '1:00-1:45', '2:00-2:45'][idx];
      console.log(`  ${time}: ${period}`);
    });
  });
  
  // Calculate proper unit timelines
  console.log('\n' + '='.repeat(70));
  console.log('PROPER UNIT TIMELINE DISTRIBUTION:');
  console.log('='.repeat(70));
  
  Object.entries(needs).forEach(([subject, totalLessons]) => {
    const units = bySubject[subject] || [];
    if (units.length === 0) return;
    
    console.log(`\n${subject} (${totalLessons} lessons across ${units.length} units):`);
    
    let monthIndex = 0;
    let monthDay = 0;
    const months = Object.keys(monthlyDays);
    
    units.forEach((unit, idx) => {
      const unitLessons = Math.floor(totalLessons / units.length) + 
                          (idx < totalLessons % units.length ? 1 : 0);
      
      // Calculate timeline based on lesson frequency
      let daysNeeded = 0;
      if (subject.includes('Français') || subject.includes('Mathématiques')) {
        daysNeeded = unitLessons; // Daily
      } else if (subject.includes('Sciences de la nature') || subject.includes('Éducation physique')) {
        daysNeeded = Math.ceil(unitLessons / 3) * 5; // 3x/week
      } else if (subject.includes('Formation personnelle')) {
        daysNeeded = unitLessons * 5; // 1x/week
      } else {
        daysNeeded = Math.ceil(unitLessons / 2) * 5; // 2x/week
      }
      
      // Find appropriate months for this unit
      let startMonth = months[monthIndex];
      let endMonth = startMonth;
      let daysAccumulated = 0;
      
      while (daysAccumulated < daysNeeded && monthIndex < months.length) {
        const availableDays = monthlyDays[months[monthIndex]] - monthDay;
        if (daysAccumulated + availableDays >= daysNeeded) {
          monthDay += (daysNeeded - daysAccumulated);
          endMonth = months[monthIndex];
          break;
        } else {
          daysAccumulated += availableDays;
          monthIndex++;
          monthDay = 0;
          if (monthIndex < months.length) {
            endMonth = months[monthIndex];
          }
        }
      }
      
      console.log(`  Unit ${idx + 1}: ${startMonth}-${endMonth} (${unitLessons} lessons, ~${daysNeeded} days)`);
    });
  });
  
  await prisma.$disconnect();
}

analyzeUnitTimelineNeeds().catch(console.error);