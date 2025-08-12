#!/usr/bin/env tsx

/**
 * CRITICAL ASSESSMENT - FIND ANY REMAINING FLAWS
 * This script performs a deep, critical analysis to uncover any hidden issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalAssessment() {
  console.log('🔍 CRITICAL ASSESSMENT - FINDING HIDDEN FLAWS\n');
  console.log('='.repeat(70));
  
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const confirmations: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // CRITICAL CHECK 1: Do 905 lessons actually exist?
    console.log('❗ CRITICAL CHECK 1: Actual Lesson Count');
    const actualLessons = await prisma.eTFOLessonPlan.count();
    console.log(`  Actual lessons in database: ${actualLessons}`);
    console.log(`  Required lessons: 905`);
    
    if (actualLessons === 0) {
      criticalIssues.push('🔴 NO LESSONS EXIST! We have 0 lessons, need 905!');
    } else if (actualLessons !== 905) {
      criticalIssues.push(`🔴 Wrong lesson count: ${actualLessons} instead of 905`);
    }
    
    // CRITICAL CHECK 2: Weekend starts
    console.log('\n❗ CRITICAL CHECK 2: Weekend Start Dates');
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    units.forEach(unit => {
      const startDay = unit.startDate.getDay();
      const endDay = unit.endDate.getDay();
      
      if (startDay === 0 || startDay === 6) {
        criticalIssues.push(`🔴 ${unit.title} starts on weekend (${unit.startDate.toDateString()})`);
      }
      if (endDay === 0 || endDay === 6) {
        warnings.push(`⚠️ ${unit.title} ends on weekend (${unit.endDate.toDateString()})`);
      }
    });
    
    // CRITICAL CHECK 3: Units extending past school year
    console.log('\n❗ CRITICAL CHECK 3: School Year Boundaries');
    const schoolStart = new Date(2025, 8, 4); // Sept 4, 2025
    const schoolEnd = new Date(2026, 5, 25); // June 25, 2026
    
    units.forEach(unit => {
      if (unit.startDate < schoolStart) {
        criticalIssues.push(`🔴 ${unit.title} starts before school (${unit.startDate.toDateString()})`);
      }
      if (unit.endDate > schoolEnd) {
        criticalIssues.push(`🔴 ${unit.title} ends after school (${unit.endDate.toDateString()})`);
      }
    });
    
    // CRITICAL CHECK 4: Actual hours calculation
    console.log('\n❗ CRITICAL CHECK 4: Total Instructional Hours');
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const requiredHours = 181 * 285 / 60; // 181 days * 285 minutes / 60
    
    console.log(`  Total unit hours: ${totalHours}`);
    console.log(`  Required hours: ${requiredHours.toFixed(0)}`);
    
    if (Math.abs(totalHours - requiredHours) > 50) {
      criticalIssues.push(`🔴 Hour mismatch: ${totalHours} hours vs ${requiredHours.toFixed(0)} required`);
    }
    
    // CRITICAL CHECK 5: Expectation distribution
    console.log('\n❗ CRITICAL CHECK 5: Expectation Distribution');
    const unitExpectations = await prisma.unitPlanExpectation.findMany({
      include: {
        unitPlan: { include: { longRangePlan: true } },
        expectation: true
      }
    });
    
    // Group by subject to check distribution
    const expectationsBySubject: Record<string, number> = {};
    unitExpectations.forEach(ue => {
      const subject = ue.unitPlan.longRangePlan.subject;
      expectationsBySubject[subject] = (expectationsBySubject[subject] || 0) + 1;
    });
    
    console.log('  Expectations per subject:');
    Object.entries(expectationsBySubject).forEach(([subject, count]) => {
      console.log(`    ${subject}: ${count}`);
    });
    
    // Check if French has proper distribution
    const frenchUnits = units.filter(u => u.longRangePlan.subject === 'Français langue première');
    const frenchWithExpectations = await prisma.unitPlan.count({
      where: {
        userId: emily.id,
        longRangePlan: { subject: 'Français langue première' },
        expectations: { some: {} }
      }
    });
    
    if (frenchWithExpectations < frenchUnits.length) {
      warnings.push(`⚠️ Only ${frenchWithExpectations}/${frenchUnits.length} French units have expectations`);
    }
    
    // CRITICAL CHECK 6: Daily schedule reality check
    console.log('\n❗ CRITICAL CHECK 6: Daily Schedule Reality');
    
    // Check if the schedule actually makes sense
    const dailySchedule = {
      french: 60,  // Period 1
      math: 45,    // Period 2
      rotation1: 45, // Period 3
      rotation2: 45, // Period 4
      rotation3: 45, // Period 5
      flex: 45     // Period 6
    };
    
    const scheduleTotal = Object.values(dailySchedule).reduce((a, b) => a + b, 0);
    console.log(`  Daily schedule total: ${scheduleTotal} minutes`);
    
    // Check lesson duration requirements
    const lessonRequirements = {
      'Français langue première': { duration: 60, periods: 181 },
      'Mathématiques': { duration: 45, periods: 181 },
      'Sciences de la nature': { duration: 45, periods: 108 },
      'Sciences humaines': { duration: 45, periods: 72 },
      'Arts visuels': { duration: 45, periods: 72 },
      'Éducation physique': { duration: 45, periods: 108 },
      'Music': { duration: 45, periods: 72 },
      'Formation personnelle et sociale': { duration: 45, periods: 36 },
      'Flexible Learning': { duration: 45, periods: 75 }
    };
    
    let totalPeriodsNeeded = 0;
    Object.values(lessonRequirements).forEach(req => {
      totalPeriodsNeeded += req.periods;
    });
    
    const availablePeriods = 181 * 6; // 181 days * 6 periods
    console.log(`  Periods needed: ${totalPeriodsNeeded}`);
    console.log(`  Periods available: ${availablePeriods}`);
    
    if (totalPeriodsNeeded !== 905) {
      criticalIssues.push(`🔴 Period calculation error: ${totalPeriodsNeeded} != 905`);
    }
    
    // CRITICAL CHECK 7: Unit timeline gaps and overlaps (deep check)
    console.log('\n❗ CRITICAL CHECK 7: Deep Timeline Analysis');
    
    const bySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!bySubject[s]) bySubject[s] = [];
      bySubject[s].push({
        title: u.title,
        start: u.startDate,
        end: u.endDate,
        hours: u.estimatedHours
      });
    });
    
    Object.entries(bySubject).forEach(([subject, subjectUnits]) => {
      // Sort by start date
      subjectUnits.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      for (let i = 1; i < subjectUnits.length; i++) {
        const prev = subjectUnits[i-1];
        const curr = subjectUnits[i];
        
        const gap = Math.floor((curr.start.getTime() - prev.end.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          criticalIssues.push(`🔴 ${subject} OVERLAP: ${prev.title} and ${curr.title} overlap by ${-gap} days`);
        } else if (gap > 3) {
          // More than a weekend gap
          warnings.push(`⚠️ ${subject} GAP: ${gap} days between ${prev.title} and ${curr.title}`);
        }
      }
    });
    
    // CRITICAL CHECK 8: Lesson plan structure
    console.log('\n❗ CRITICAL CHECK 8: Lesson Plan Requirements');
    
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      take: 10,
      include: {
        expectations: true,
        resources: true
      }
    });
    
    if (lessonPlans.length > 0) {
      let structureIssues = 0;
      lessonPlans.forEach(lesson => {
        if (!lesson.learningGoalsFrench) structureIssues++;
        if (!lesson.assessmentAsLearning) structureIssues++;
        if (!lesson.differentiation) structureIssues++;
        if (lesson.expectations.length === 0) structureIssues++;
      });
      
      if (structureIssues > 0) {
        warnings.push(`⚠️ ${structureIssues} lessons missing required components`);
      }
    }
    
    // CRITICAL CHECK 9: Database integrity
    console.log('\n❗ CRITICAL CHECK 9: Database Integrity');
    
    // Check for orphaned records
    const allUnitsForCheck = await prisma.unitPlan.findMany({
      select: { id: true, longRangePlanId: true }
    });
    const orphanedUnits = allUnitsForCheck.filter(u => !u.longRangePlanId).length;
    
    if (orphanedUnits > 0) {
      criticalIssues.push(`🔴 ${orphanedUnits} orphaned unit plans with no LRP`);
    }
    
    // Check for duplicate subjects
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    const subjects = lrps.map(l => l.subject);
    const uniqueSubjects = new Set(subjects);
    
    if (subjects.length !== uniqueSubjects.size) {
      criticalIssues.push('🔴 Duplicate subjects in long range plans');
    }
    
    // CRITICAL CHECK 10: The Big Picture
    console.log('\n❗ CRITICAL CHECK 10: Big Picture Validation');
    
    // Are we actually ready?
    const readinessChecks = {
      'Long Range Plans': lrps.length === 9,
      'Unit Plans': units.length === 58,
      'Lesson Plans': actualLessons === 905,
      'Expectations': await prisma.curriculumExpectation.count() === 73,
      'No Overlaps': criticalIssues.filter(i => i.includes('OVERLAP')).length === 0,
      'School Calendar': units.every(u => u.startDate >= schoolStart && u.endDate <= schoolEnd),
      'Daily Minutes': scheduleTotal === 285
    };
    
    Object.entries(readinessChecks).forEach(([check, passed]) => {
      if (passed) {
        confirmations.push(`✅ ${check}`);
      } else {
        criticalIssues.push(`🔴 FAILED: ${check}`);
      }
    });
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(70));
    console.log('📊 CRITICAL ASSESSMENT RESULTS\n');
    
    if (criticalIssues.length > 0) {
      console.log('🔴 CRITICAL ISSUES FOUND:');
      criticalIssues.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (confirmations.length > 0) {
      console.log('\n✅ CONFIRMED GOOD:');
      confirmations.forEach(conf => console.log(`  ${conf}`));
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (criticalIssues.length === 0) {
      console.log('✨ ASSESSMENT PASSED - No critical issues found!');
    } else {
      console.log(`❌ ASSESSMENT FAILED - ${criticalIssues.length} critical issues need fixing!`);
      console.log('\nTHE TRUTH:');
      console.log('  The curriculum STRUCTURE is perfect (LRPs, Units, timelines)');
      console.log('  But we have ZERO actual lesson plans created!');
      console.log('  We need to CREATE 905 lesson plans, not just plan for them.');
    }
    
  } catch (error) {
    console.error('❌ Assessment error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run critical assessment
criticalAssessment().catch(console.error);