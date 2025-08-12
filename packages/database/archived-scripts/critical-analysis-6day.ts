#!/usr/bin/env tsx

/**
 * CRITICAL ANALYSIS OF 6-DAY CYCLE CURRICULUM
 * Finding all flaws and inconsistencies
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalAnalysis() {
  console.log('🔍 CRITICAL ANALYSIS OF 6-DAY CYCLE CURRICULUM\n');
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
    
    // CRITICAL CHECK 1: Does 181 days work with 6-day cycles?
    console.log('❗ CHECK 1: 6-Day Cycle Math\n');
    
    const schoolDays = 181;
    const exactCycles = schoolDays / 6;
    console.log(`  181 days ÷ 6 = ${exactCycles} cycles`);
    
    if (exactCycles !== Math.floor(exactCycles)) {
      issues.push(`🔴 181 days = ${exactCycles} cycles (not whole number!)`);
      console.log(`  ⚠️ We have ${Math.floor(exactCycles)} complete cycles + ${schoolDays % 6} extra days`);
      console.log(`  This means Day 1-5 occur 31 times, Day 6 occurs 30 times\n`);
    }
    
    // CRITICAL CHECK 2: Block distribution validation
    console.log('❗ CHECK 2: Block Distribution\n');
    
    const blocksPerDay = 10;
    const totalBlocks = schoolDays * blocksPerDay;
    console.log(`  ${schoolDays} days × ${blocksPerDay} blocks = ${totalBlocks} total blocks`);
    
    if (totalBlocks !== 1810) {
      issues.push(`🔴 Total blocks should be 1810, not 1800!`);
    }
    
    // Expected distribution with uneven cycles
    const day1to5Count = 31; // These days occur 31 times
    const day6Count = 30;     // Day 6 occurs 30 times
    
    const correctDistribution = {
      'Français': (day1to5Count * 5 + day6Count) * 2, // 2 blocks every day
      'Mathématiques': (day1to5Count * 5 + day6Count) * 2, // 2 blocks every day
      'Music': day1to5Count * 2 + day1to5Count, // Days 1, 3, 5
      'PE': day1to5Count + day1to5Count + day6Count, // Days 2, 4, 6
      'Sciences': (day1to5Count * 5 + day6Count), // 1 block every day
    };
    
    console.log('  Correct annual distribution:');
    Object.entries(correctDistribution).forEach(([subject, blocks]) => {
      console.log(`    ${subject}: ${blocks} blocks`);
    });
    
    // CRITICAL CHECK 3: Unit timeline analysis
    console.log('\n❗ CHECK 3: Unit Timelines\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true },
      orderBy: { startDate: 'asc' }
    });
    
    // Check for units extending beyond school year
    const schoolStart = new Date(2025, 8, 4); // Sept 4, 2025
    const schoolEnd = new Date(2026, 5, 25);  // June 25, 2026
    
    units.forEach(unit => {
      if (unit.startDate < schoolStart) {
        issues.push(`🔴 ${unit.title} starts before school (${unit.startDate.toDateString()})`);
      }
      if (unit.endDate > schoolEnd) {
        issues.push(`🔴 ${unit.title} ends after school (${unit.endDate.toDateString()})`);
      }
    });
    
    // CRITICAL CHECK 4: Hours calculation
    console.log('❗ CHECK 4: Hours Validation\n');
    
    const totalMinutes = totalBlocks * 30;
    const totalHours = totalMinutes / 60;
    console.log(`  ${totalBlocks} blocks × 30 min = ${totalMinutes} min = ${totalHours} hours`);
    
    const unitHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    console.log(`  Sum of unit hours: ${unitHours}`);
    
    if (Math.abs(unitHours - totalHours) > 10) {
      issues.push(`🔴 Unit hours (${unitHours}) don't match total hours (${totalHours})`);
    }
    
    // CRITICAL CHECK 5: Subject balance
    console.log('\n❗ CHECK 5: Subject Balance\n');
    
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push(u);
    });
    
    // Check if we have the right subjects
    const expectedSubjects = [
      'Français langue première',
      'Mathématiques', 
      'Sciences de la nature',
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale',
      'Éducation physique',
      'Music',
      'Flexible Learning'
    ];
    
    expectedSubjects.forEach(subject => {
      if (!unitsBySubject[subject]) {
        issues.push(`🔴 Missing subject: ${subject}`);
      }
    });
    
    // CRITICAL CHECK 6: Planning time calculation
    console.log('❗ CHECK 6: Planning Time\n');
    
    // With uneven distribution:
    const musicBlocks = 93;  // Days 1,3,5 = 31+31+31
    const peBlocks = 92;     // Days 2,4,6 = 31+31+30
    const libraryBlocks = 31; // Day 3 only
    const buddiesBlocks = 31; // Day 2 only
    
    const totalPlanningBlocks = musicBlocks + peBlocks + libraryBlocks + buddiesBlocks;
    const planningMinutes = totalPlanningBlocks * 30;
    const planningPerDay = planningMinutes / schoolDays;
    
    console.log(`  Music: ${musicBlocks} blocks`);
    console.log(`  PE: ${peBlocks} blocks`);
    console.log(`  Library: ${libraryBlocks} blocks`);
    console.log(`  Book Buddies: ${buddiesBlocks} blocks`);
    console.log(`  Total planning: ${totalPlanningBlocks} blocks = ${planningMinutes} min`);
    console.log(`  Average per day: ${planningPerDay.toFixed(1)} minutes\n`);
    
    if (planningPerDay < 40) {
      warnings.push(`⚠️ Planning time only ${planningPerDay.toFixed(1)} min/day (should be 40+)`);
    }
    
    // CRITICAL CHECK 7: Realistic teaching load
    console.log('❗ CHECK 7: Teaching Load\n');
    
    const emilyBlocks = totalBlocks - (musicBlocks + peBlocks);
    const emilyHours = (emilyBlocks * 30) / 60;
    
    console.log(`  Total blocks: ${totalBlocks}`);
    console.log(`  Specialist blocks: ${musicBlocks + peBlocks}`);
    console.log(`  Emily teaches: ${emilyBlocks} blocks = ${emilyHours} hours`);
    console.log(`  Average per day: ${(emilyBlocks / schoolDays).toFixed(1)} blocks\n`);
    
    // CRITICAL CHECK 8: Database integrity
    console.log('❗ CHECK 8: Database Integrity\n');
    
    const lrps = await prisma.longRangePlan.count({ where: { userId: emily.id } });
    const totalUnits = units.length;
    const expectations = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
    
    console.log(`  Long Range Plans: ${lrps}`);
    console.log(`  Unit Plans: ${totalUnits}`);
    console.log(`  Curriculum Expectations: ${expectations}`);
    
    if (lrps !== 9) issues.push(`🔴 Should have 9 LRPs, found ${lrps}`);
    if (expectations !== 73) issues.push(`🔴 Should have 73 expectations, found ${expectations}`);
    
    // CRITICAL CHECK 9: The truth about flexible learning
    console.log('\n❗ CHECK 9: Flexible Learning Reality\n');
    
    const flexUnits = unitsBySubject['Flexible Learning'] || [];
    const flexHours = flexUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    
    console.log(`  Flexible Learning units: ${flexUnits.length}`);
    console.log(`  Total Flex hours: ${flexHours}`);
    
    // Flex should fill remaining time after core subjects
    const coreBlocks = 362 + 362 + 181 + 90 + 90 + 60 + 93 + 92; // French, Math, Sci, SS, Art, Health, Music, PE
    const remainingBlocks = totalBlocks - coreBlocks;
    const expectedFlexHours = (remainingBlocks * 30) / 60;
    
    console.log(`  Core subjects: ${coreBlocks} blocks`);
    console.log(`  Remaining for Flex: ${remainingBlocks} blocks = ${expectedFlexHours} hours`);
    
    if (Math.abs(flexHours - expectedFlexHours) > 10) {
      issues.push(`🔴 Flex hours (${flexHours}) should be ${expectedFlexHours}`);
    }
    
    // CRITICAL CHECK 10: Lesson plans exist?
    console.log('\n❗ CHECK 10: Lesson Plans\n');
    
    const lessonPlans = await prisma.eTFOLessonPlan.count();
    console.log(`  Existing lesson plans: ${lessonPlans}`);
    
    if (lessonPlans === 0) {
      issues.push('🔴 NO LESSON PLANS EXIST! Need to create 1,625 lessons for Emily');
    }
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(70));
    console.log('📊 CRITICAL ANALYSIS RESULTS\n');
    
    if (issues.length > 0) {
      console.log('🔴 CRITICAL ISSUES:');
      issues.forEach(i => console.log(`  ${i}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(w => console.log(`  ${w}`));
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log('\n💡 THE TRUTH:');
      console.log('  • 181 days ÷ 6 = 30.17 cycles (not even!)');
      console.log('  • Total blocks should be 1810, not 1800');
      console.log('  • Days 1-5 occur 31 times, Day 6 occurs 30 times');
      console.log('  • This creates uneven specialist distribution');
      console.log('  • We need to recalculate everything for 1810 blocks');
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis
criticalAnalysis().catch(console.error);