#!/usr/bin/env tsx

/**
 * ANALYZE UNIT TIMELINE APPROPRIATENESS
 * Checks if unit timelines match the actual lesson needs given the schedule
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeUnitTimelines() {
  console.log('🔍 ANALYZING UNIT TIMELINE APPROPRIATENESS\n');
  console.log('='.repeat(70));
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // Get all units with their timelines
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    // Define lesson requirements per subject
    const lessonRequirements = {
      'Français langue première': { total: 181, frequency: 'daily', minutesPerLesson: 60 },
      'Mathématiques': { total: 181, frequency: 'daily', minutesPerLesson: 45 },
      'Arts visuels': { total: 90, frequency: 'alternating', minutesPerLesson: 45 },
      'Sciences humaines': { total: 91, frequency: 'alternating', minutesPerLesson: 45 },
      'Sciences de la nature': { total: 108, frequency: '3x/week', minutesPerLesson: 45 },
      'Formation personnelle et sociale': { total: 36, frequency: '1x/week', minutesPerLesson: 45 },
      'Flexible Learning': { total: 56, frequency: 'varies', minutesPerLesson: 45 },
      'Éducation physique': { total: 108, frequency: '3x/week', minutesPerLesson: 45 },
      'Music': { total: 54, frequency: '1.5x/week', minutesPerLesson: 45 }
    };
    
    // Group units by subject
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push({
        title: u.title,
        startDate: u.startDate,
        endDate: u.endDate,
        estimatedHours: u.estimatedHours
      });
    });
    
    console.log('📊 SUBJECT-BY-SUBJECT ANALYSIS\n');
    
    // Analyze each subject
    Object.entries(unitsBySubject).forEach(([subject, subjectUnits]) => {
      const req = lessonRequirements[subject];
      if (!req) return;
      
      console.log(`\n${subject}:`);
      console.log(`  Required: ${req.total} lessons (${req.frequency})`);
      console.log(`  Units: ${subjectUnits.length}`);
      
      let totalDays = 0;
      let totalHours = 0;
      let lessonsPerUnit: number[] = [];
      
      subjectUnits.forEach((unit, idx) => {
        // Calculate school days in unit timeline
        const days = getSchoolDays(unit.startDate, unit.endDate);
        totalDays += days;
        totalHours += unit.estimatedHours || 0;
        
        // Calculate expected lessons based on frequency
        let expectedLessons = 0;
        switch (req.frequency) {
          case 'daily':
            expectedLessons = days;
            break;
          case 'alternating':
            expectedLessons = Math.ceil(days / 2);
            break;
          case '3x/week':
            expectedLessons = Math.ceil(days * 3 / 5);
            break;
          case '1x/week':
            expectedLessons = Math.ceil(days / 5);
            break;
          case '1.5x/week':
            expectedLessons = Math.ceil(days * 1.5 / 5);
            break;
          case 'varies':
            expectedLessons = Math.ceil(days * 0.6 / 5); // Rough estimate
            break;
        }
        
        lessonsPerUnit.push(expectedLessons);
        
        // Check if hours match expected lessons
        const expectedHours = expectedLessons * req.minutesPerLesson / 60;
        const hourDiff = Math.abs((unit.estimatedHours || 0) - expectedHours);
        
        console.log(`\n  Unit ${idx + 1}: ${unit.title}`);
        console.log(`    Timeline: ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
        console.log(`    School days: ${days}`);
        console.log(`    Expected lessons: ${expectedLessons}`);
        console.log(`    Allocated hours: ${unit.estimatedHours || 0}`);
        console.log(`    Expected hours: ${expectedHours.toFixed(1)}`);
        
        if (hourDiff > 5) {
          warnings.push(`${subject} - ${unit.title}: Hour mismatch (${unit.estimatedHours} vs ${expectedHours.toFixed(1)} expected)`);
        }
      });
      
      // Check total lessons
      const totalExpectedLessons = lessonsPerUnit.reduce((a, b) => a + b, 0);
      console.log(`\n  TOTAL: ${totalExpectedLessons} lessons possible in timeline`);
      console.log(`  REQUIRED: ${req.total} lessons`);
      
      if (Math.abs(totalExpectedLessons - req.total) > 5) {
        issues.push(`${subject}: Timeline provides ${totalExpectedLessons} lessons but needs ${req.total}`);
      }
    });
    
    // Check for realistic teaching loads
    console.log('\n\n📅 DAILY TEACHING LOAD ANALYSIS\n');
    
    // Sample check for a typical week
    const sampleDate = new Date(2025, 9, 6); // October 6, 2025 (Monday)
    console.log(`Sample week starting ${sampleDate.toDateString()}:\n`);
    
    for (let d = 0; d < 5; d++) {
      const checkDate = new Date(sampleDate);
      checkDate.setDate(checkDate.getDate() + d);
      
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][d];
      const isOddDay = (Math.floor((checkDate.getTime() - new Date(2025, 8, 4).getTime()) / (1000 * 60 * 60 * 24)) % 2) === 0;
      
      console.log(`${dayName} (Day ${isOddDay ? 'A' : 'B'}):`);
      console.log(`  Period 1: Français (60 min)`);
      console.log(`  Period 2: Math (45 min)`);
      console.log(`  Period 3: ${isOddDay ? 'Art' : 'Social Studies'} (45 min)`);
      
      // Specialist block
      if (d === 1 || d === 3) { // Tuesday, Thursday
        console.log(`  Period 4: Music (specialist) - Emily planning`);
      } else {
        console.log(`  Period 4: PE (specialist) - Emily planning`);
      }
      
      // Afternoon rotation
      if (d === 0 || d === 2 || d === 4) { // MWF
        console.log(`  Period 5: Science (45 min)`);
      } else if (d === 3) { // Thursday
        console.log(`  Period 5: Health/FPS (45 min)`);
      } else {
        console.log(`  Period 5: Flex/Planning`);
      }
      
      console.log(`  Period 6: Flexible Learning (45 min)\n`);
    }
    
    // FINAL ASSESSMENT
    console.log('='.repeat(70));
    console.log('\n📊 ASSESSMENT RESULTS\n');
    
    if (issues.length > 0) {
      console.log('❌ CRITICAL ISSUES:');
      issues.forEach(i => console.log(`  • ${i}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(w => console.log(`  • ${w}`));
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ All unit timelines are appropriate!');
    } else {
      console.log('\n💡 RECOMMENDATION:');
      console.log('Some unit timelines may need adjustment to better match the actual teaching schedule.');
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate school days between dates
function getSchoolDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const day = current.getDay();
    // Count weekdays only (Monday = 1, Friday = 5)
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  // Subtract holidays (rough estimate)
  // Christmas break: ~10 days
  // March break: ~5 days
  // PD days: ~5 days
  const holidayAdjustment = estimateHolidays(start, end);
  
  return Math.max(count - holidayAdjustment, 0);
}

function estimateHolidays(start: Date, end: Date): number {
  let holidays = 0;
  
  // Christmas break (Dec 20 - Jan 4)
  if (start <= new Date(2025, 11, 20) && end >= new Date(2025, 11, 20)) {
    holidays += 10;
  }
  
  // March break (estimate)
  if (start <= new Date(2026, 2, 15) && end >= new Date(2026, 2, 15)) {
    holidays += 5;
  }
  
  // PD days (spread throughout year)
  const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
  holidays += Math.floor(months * 0.5); // Roughly 0.5 PD days per month
  
  return holidays;
}

// Run analysis
analyzeUnitTimelines().catch(console.error);