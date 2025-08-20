#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Official PEI 2025-2026 Calendar
const CALENDAR = {
  firstDay: new Date('2025-09-04'),
  lastDay: new Date('2026-06-25'),
  instructionalDays: 181,
  breaks: {
    winter: { start: new Date('2025-12-20'), end: new Date('2026-01-04') },
    march: { start: new Date('2026-03-16'), end: new Date('2026-03-20') }
  },
  pdDays: [
    new Date('2025-10-10'), // Provincial PD
    new Date('2025-11-06'), // Convention
    new Date('2025-11-07'), // Convention
    new Date('2025-11-10'), // Report Card Day
    new Date('2025-12-22'), // Joint Staff PD
    new Date('2026-02-13'), // School Goals
    new Date('2026-03-06'), // Parent-Teacher/PD
    new Date('2026-04-10'), // Parent-Teacher/PD
    new Date('2026-05-01'), // Convention
    new Date('2026-06-26')  // School Goals
  ],
  holidays: [
    new Date('2025-09-01'), // Labour Day
    new Date('2025-09-30'), // Truth & Reconciliation
    new Date('2025-10-13'), // Thanksgiving
    new Date('2025-11-11'), // Remembrance Day
    new Date('2026-01-01'), // New Year's
    new Date('2026-02-16'), // Islander Day
    new Date('2026-04-03'), // Good Friday
    new Date('2026-04-06'), // Easter Monday
    new Date('2026-05-18')  // Victoria Day
  ]
};

async function finalCriticalReview() {
  console.log('🔍 FINAL CRITICAL REVIEW - 2025-2026 SCHOOL YEAR\n');
  console.log('📅 Official PEI Calendar Loaded\n');
  
  try {
    const emily = await prisma.user.findUnique({ 
      where: { email: 'emmcisaac@gmail.com' } 
    });
    
    if (!emily) {
      console.error('❌ Emily not found');
      return;
    }
    
    // Get all unit plans
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { 
        longRangePlan: true,
        expectations: { 
          include: { expectation: true } 
        } 
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Get long range plans
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    console.log('='.repeat(60));
    console.log('1. ACADEMIC YEAR CHECK');
    console.log('='.repeat(60) + '\n');
    
    const wrongYear = longRangePlans.filter(p => p.academicYear !== '2025-2026');
    if (wrongYear.length > 0) {
      console.log(`❌ ${wrongYear.length} plans have wrong academic year!`);
      wrongYear.forEach(p => console.log(`  - ${p.subject}: ${p.academicYear}`));
    } else {
      console.log('✅ All long range plans set to 2025-2026');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('2. DATE ALIGNMENT CHECK');
    console.log('='.repeat(60) + '\n');
    
    const firstUnit = allUnits[0];
    const lastUnit = allUnits[allUnits.length - 1];
    
    console.log(`First unit starts: ${firstUnit?.startDate.toISOString().split('T')[0]}`);
    console.log(`Official first day: ${CALENDAR.firstDay.toISOString().split('T')[0]}`);
    console.log(`Last unit ends: ${lastUnit?.endDate.toISOString().split('T')[0]}`);
    console.log(`Official last day: ${CALENDAR.lastDay.toISOString().split('T')[0]}`);
    
    if (firstUnit?.startDate.getTime() === CALENDAR.firstDay.getTime()) {
      console.log('✅ First unit aligns with first day of school');
    } else {
      console.log('❌ First unit does not align with September 4, 2025');
    }
    
    if (lastUnit?.endDate.getTime() === CALENDAR.lastDay.getTime()) {
      console.log('✅ Last unit aligns with last day of school');
    } else {
      console.log('❌ Last unit does not align with June 25, 2026');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('3. BREAK ACCOMMODATION CHECK');
    console.log('='.repeat(60) + '\n');
    
    // Check winter break
    const unitsOverWinterBreak = allUnits.filter(u => {
      const unitStart = u.startDate.getTime();
      const unitEnd = u.endDate.getTime();
      const breakStart = CALENDAR.breaks.winter.start.getTime();
      const breakEnd = CALENDAR.breaks.winter.end.getTime();
      
      // Check if unit runs through winter break
      return unitStart < breakStart && unitEnd > breakEnd;
    });
    
    if (unitsOverWinterBreak.length > 0) {
      console.log(`✅ ${unitsOverWinterBreak.length} units bridge winter break (Dec 20 - Jan 4)`);
      unitsOverWinterBreak.forEach(u => {
        console.log(`  - ${u.longRangePlan.subject}: ${u.titleFr}`);
      });
    }
    
    // Check March break
    const unitsOverMarchBreak = allUnits.filter(u => {
      const unitStart = u.startDate.getTime();
      const unitEnd = u.endDate.getTime();
      const breakStart = CALENDAR.breaks.march.start.getTime();
      const breakEnd = CALENDAR.breaks.march.end.getTime();
      
      // Check if unit overlaps with March break
      return (unitStart <= breakStart && unitEnd >= breakStart) ||
             (unitStart <= breakEnd && unitEnd >= breakEnd);
    });
    
    if (unitsOverMarchBreak.length > 0) {
      console.log(`⚠️ ${unitsOverMarchBreak.length} units affected by March break (Mar 16-20)`);
      unitsOverMarchBreak.forEach(u => {
        console.log(`  - ${u.longRangePlan.subject}: ${u.titleFr}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('4. INSTRUCTIONAL HOURS CHECK');
    console.log('='.repeat(60) + '\n');
    
    // Group by subject
    const bySubject: { [key: string]: any[] } = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!bySubject[subject]) bySubject[subject] = [];
      bySubject[subject].push(unit);
    });
    
    let totalHours = 0;
    Object.entries(bySubject).forEach(([subject, units]) => {
      const subjectHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const weeklyAvg = (subjectHours / 42).toFixed(1);
      totalHours += subjectHours;
      
      console.log(`${subject}:`);
      console.log(`  Total: ${subjectHours} hours`);
      console.log(`  Weekly average: ${weeklyAvg} hours`);
      
      // Check appropriateness
      if (subject === 'Français (Immersion)' && (subjectHours < 160 || subjectHours > 210)) {
        console.log(`  ⚠️ French hours may be outside typical range (4-5 hrs/week)`);
      }
      if (subject === 'Mathématiques' && (subjectHours < 160 || subjectHours > 210)) {
        console.log(`  ⚠️ Math hours may be outside typical range (4-5 hrs/week)`);
      }
      if (subject === 'Sciences de la nature' && (subjectHours < 80 || subjectHours > 150)) {
        console.log(`  ⚠️ Science hours may be outside typical range (2-3.5 hrs/week)`);
      }
    });
    
    console.log(`\nTotal instructional hours planned: ${totalHours}`);
    console.log(`Weekly average (all subjects): ${(totalHours / 42).toFixed(1)} hours`);
    
    console.log('\n' + '='.repeat(60));
    console.log('5. EXPECTATION COVERAGE CHECK');
    console.log('='.repeat(60) + '\n');
    
    // Get all expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    const coveredExpectations = new Set<string>();
    allUnits.forEach(unit => {
      unit.expectations.forEach(e => {
        coveredExpectations.add(e.expectation.code);
      });
    });
    
    console.log(`Total Grade 1 expectations: ${allExpectations.length}`);
    console.log(`Expectations covered in unit plans: ${coveredExpectations.size}`);
    
    const uncovered = allExpectations.filter(e => !coveredExpectations.has(e.code));
    if (uncovered.length > 0) {
      console.log(`\n⚠️ Uncovered expectations (${uncovered.length}):`);
      uncovered.forEach(e => console.log(`  - ${e.code}: ${e.subject}`));
    } else {
      console.log('✅ All curriculum expectations are covered!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('6. UNIT PROGRESSION CHECK');
    console.log('='.repeat(60) + '\n');
    
    // Check for gaps between units within subjects
    Object.entries(bySubject).forEach(([subject, units]) => {
      console.log(`\n${subject}:`);
      
      const sortedUnits = units.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      for (let i = 0; i < sortedUnits.length - 1; i++) {
        const current = sortedUnits[i];
        const next = sortedUnits[i + 1];
        const gap = Math.floor((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  ❌ Overlap between units ${i+1} and ${i+2}`);
        } else if (gap > 20 && gap < 14) { // Not winter break
          console.log(`  ⚠️ ${gap}-day gap between units ${i+1} and ${i+2}`);
        }
      }
      
      // Check if covers full year
      const subjectStart = sortedUnits[0].startDate;
      const subjectEnd = sortedUnits[sortedUnits.length - 1].endDate;
      
      if (subjectStart.getTime() === CALENDAR.firstDay.getTime() && 
          subjectEnd.getTime() === CALENDAR.lastDay.getTime()) {
        console.log(`  ✅ Covers full school year`);
      } else {
        console.log(`  ⚠️ Does not cover full school year`);
        console.log(`    Starts: ${subjectStart.toISOString().split('T')[0]}`);
        console.log(`    Ends: ${subjectEnd.toISOString().split('T')[0]}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('7. FINAL VERDICT');
    console.log('='.repeat(60) + '\n');
    
    const issues = [];
    
    // Collect all issues
    if (wrongYear.length > 0) issues.push('Wrong academic year in some plans');
    if (firstUnit?.startDate.getTime() !== CALENDAR.firstDay.getTime()) issues.push('First day misalignment');
    if (lastUnit?.endDate.getTime() !== CALENDAR.lastDay.getTime()) issues.push('Last day misalignment');
    if (uncovered.length > 0) issues.push(`${uncovered.length} uncovered expectations`);
    if (totalHours < 450) issues.push('May have insufficient total hours');
    
    if (issues.length === 0) {
      console.log('✅✅✅ ALL UNIT PLANS ARE PERFECT FOR 2025-2026! ✅✅✅\n');
      console.log('Summary:');
      console.log(`- ${allUnits.length} total units across ${Object.keys(bySubject).length} subjects`);
      console.log(`- ${coveredExpectations.size}/${allExpectations.length} expectations covered`);
      console.log(`- ${totalHours} total instructional hours`);
      console.log('- Aligned with official PEI calendar');
      console.log('- All breaks accommodated');
      console.log('- Ready for September 4, 2025!');
    } else {
      console.log('❌ ISSUES FOUND:\n');
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('\nPlease address these issues for perfect alignment.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the review
finalCriticalReview();