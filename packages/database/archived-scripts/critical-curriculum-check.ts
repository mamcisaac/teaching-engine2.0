#!/usr/bin/env tsx

/**
 * CRITICAL CURRICULUM CHECK
 * This script performs a critical analysis to find any issues with the "perfect" curriculum
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalCheck() {
  console.log('🔍 CRITICAL CURRICULUM ANALYSIS\n');
  console.log('='.repeat(70));
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Get all data
    const units = await prisma.unitPlan.findMany({
      include: { 
        longRangePlan: true,
        _count: {
          select: {
            expectations: true,
            lessonPlans: true
          }
        }
      }
    });
    
    const lrps = await prisma.longRangePlan.findMany({
      include: {
        _count: {
          select: { expectations: true }
        }
      }
    });
    
    // CHECK 1: Timeline Issues
    console.log('📅 CHECKING UNIT TIMELINES...');
    
    // Group by subject
    const bySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!bySubject[s]) {
        bySubject[s] = [];
      }
      bySubject[s].push({
        title: u.title,
        start: u.startDate,
        end: u.endDate,
        hours: u.estimatedHours || 0,
        expectations: u._count.expectations
      });
    });
    
    // Analyze each subject
    Object.entries(bySubject).forEach(([subject, subjectUnits]) => {
      // Sort by start date
      subjectUnits.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      console.log(`\n${subject} (${subjectUnits.length} units):`);
      
      let totalHours = 0;
      let hasOverlap = false;
      let hasGaps = false;
      
      subjectUnits.forEach((unit, idx) => {
        totalHours += unit.hours;
        
        // Check dates are reasonable
        if (unit.start > unit.end) {
          issues.push(`❌ ${subject} - ${unit.title}: Start date after end date!`);
        }
        
        // Check for overlaps/gaps with next unit
        if (idx < subjectUnits.length - 1) {
          const next = subjectUnits[idx + 1];
          const gap = Math.floor((next.start.getTime() - unit.end.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gap < 0) {
            hasOverlap = true;
            issues.push(`❌ ${subject}: Units overlap by ${-gap} days`);
          } else if (gap > 30) {
            hasGaps = true;
            warnings.push(`⚠️ ${subject}: ${gap} day gap between units`);
          }
        }
        
        // Check expectations
        if (unit.expectations === 0 && subject !== 'Formation personnelle et sociale') {
          warnings.push(`⚠️ ${unit.title} has no expectations linked`);
        }
      });
      
      console.log(`  • Total hours: ${totalHours}`);
      console.log(`  • Status: ${hasOverlap ? '❌ Has overlaps' : hasGaps ? '⚠️ Has gaps' : '✅ Good'}`);
    });
    
    // CHECK 2: Hours vs Lessons Analysis
    console.log('\n⏱️ CHECKING HOURS VS LESSON NEEDS...');
    
    const needs = {
      'Français langue première': { lessons: 181, minHours: 181, maxHours: 181 },
      'Mathématiques': { lessons: 181, minHours: 135, maxHours: 135 },
      'Sciences de la nature': { lessons: 108, minHours: 81, maxHours: 81 },
      'Sciences humaines': { lessons: 72, minHours: 54, maxHours: 54 },
      'Arts visuels': { lessons: 72, minHours: 54, maxHours: 54 },
      'Éducation physique': { lessons: 108, minHours: 81, maxHours: 81 },
      'Music': { lessons: 72, minHours: 54, maxHours: 54 },
      'Formation personnelle et sociale': { lessons: 36, minHours: 27, maxHours: 27 }
    };
    
    Object.entries(bySubject).forEach(([subject, subjectUnits]) => {
      const totalHours = subjectUnits.reduce((sum, u) => sum + u.hours, 0);
      const need = needs[subject];
      
      if (need) {
        const hoursPerLesson = totalHours / need.lessons;
        console.log(`\n${subject}:`);
        console.log(`  • Allocated: ${totalHours} hours for ${need.lessons} lessons`);
        console.log(`  • Hours per lesson: ${hoursPerLesson.toFixed(2)}`);
        
        if (subject === 'Français langue première' && hoursPerLesson < 1) {
          issues.push(`❌ French needs 60 min lessons but only has ${(hoursPerLesson * 60).toFixed(0)} min per lesson`);
        } else if (hoursPerLesson < 0.75) {
          warnings.push(`⚠️ ${subject} only has ${(hoursPerLesson * 60).toFixed(0)} min per lesson`);
        }
      }
    });
    
    // CHECK 3: Daily Schedule Math
    console.log('\n📐 CHECKING DAILY SCHEDULE...');
    
    const dailyMinutes = {
      period1: 60,  // French
      period2: 45,  // Math
      period3: 45,  // Rotation A
      period4: 45,  // Rotation B
      period5: 45   // Rotation C
    };
    
    const total = Object.values(dailyMinutes).reduce((a, b) => a + b, 0);
    console.log(`  Total instructional minutes: ${total}`);
    console.log(`  Required by PEI: 285`);
    
    if (total !== 285) {
      issues.push(`❌ Daily schedule is ${total} minutes, not 285!`);
    } else {
      console.log(`  ✅ Schedule meets requirements`);
    }
    
    // CHECK 4: Curriculum Expectations
    console.log('\n🎯 CHECKING EXPECTATIONS DISTRIBUTION...');
    
    // Check French has expectations
    const frenchLRP = lrps.find(l => l.subject === 'Français langue première');
    if (frenchLRP && frenchLRP._count.expectations === 0) {
      issues.push('❌ French has 0 expectations linked at LRP level!');
    }
    
    // Check total expectations
    const totalExpectations = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
    const linkedExpectations = await prisma.unitPlanExpectation.count();
    
    console.log(`  Total expectations: ${totalExpectations}`);
    console.log(`  Linked to units: ${linkedExpectations}`);
    
    if (linkedExpectations < totalExpectations) {
      warnings.push(`⚠️ Only ${linkedExpectations}/${totalExpectations} expectations linked`);
    }
    
    // CHECK 5: School Year Coverage
    console.log('\n📆 CHECKING SCHOOL YEAR COVERAGE...');
    
    const allUnits = units.map(u => ({
      subject: u.longRangePlan.subject,
      start: u.startDate,
      end: u.endDate
    }));
    
    const earliest = allUnits.reduce((min, u) => u.start < min ? u.start : min, allUnits[0].start);
    const latest = allUnits.reduce((max, u) => u.end > max ? u.end : max, allUnits[0].end);
    
    console.log(`  Earliest unit: ${earliest.toISOString().split('T')[0]}`);
    console.log(`  Latest unit: ${latest.toISOString().split('T')[0]}`);
    
    const sept4 = new Date(2025, 8, 4);
    const june25 = new Date(2026, 5, 25);
    
    if (earliest > sept4) {
      warnings.push(`⚠️ Units start ${Math.floor((earliest.getTime() - sept4.getTime()) / (1000 * 60 * 60 * 24))} days after school starts`);
    }
    
    if (latest < june25) {
      warnings.push(`⚠️ Units end ${Math.floor((june25.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24))} days before school ends`);
    }
    
    // CHECK 6: Reality Check
    console.log('\n🤔 REALITY CHECK...');
    
    const lessonsPerDay = 830 / 181;
    console.log(`  Lessons per day needed: ${lessonsPerDay.toFixed(1)}`);
    console.log(`  Minutes per day: 285`);
    console.log(`  Average lesson duration: ${(285 / lessonsPerDay).toFixed(0)} minutes`);
    
    // The real issue!
    console.log('\n  ⚠️ WAIT... The math doesn\'t add up!');
    console.log('  If we have 5 periods of 45-60 minutes each day,');
    console.log('  that\'s 5 lessons per day, not 4.6!');
    console.log('  5 lessons × 181 days = 905 lessons, not 830!');
    
    issues.push('❌ CRITICAL: Need 905 lessons (5 per day), not 830!');
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('📊 CRITICAL ANALYSIS RESULTS\n');
    
    if (issues.length > 0) {
      console.log('❌ CRITICAL ISSUES:');
      issues.forEach(i => console.log(`  ${i}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(w => console.log(`  ${w}`));
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log('\n🔴 THE CURRICULUM IS NOT PERFECT!');
      console.log('Major discovery: We need 905 lessons, not 830!');
      console.log('The schedule has 5 periods per day, so:');
      console.log('  • 181 days × 5 periods = 905 lessons total');
      console.log('  • Current planning: 830 lessons');
      console.log('  • GAP: 75 lessons missing!');
    }
    
  } catch (error) {
    console.error('❌ Critical check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run critical check
criticalCheck().catch(console.error);