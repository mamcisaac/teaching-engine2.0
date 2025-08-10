#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCompleteSystem() {
  console.log('\n🔬 COMPREHENSIVE SYSTEM VERIFICATION');
  console.log('='.repeat(80));
  console.log('Date: August 10, 2025');
  console.log('Purpose: Verify EVERYTHING is perfect for Emily\n');
  
  const issues: string[] = [];
  const perfections: string[] = [];
  
  try {
    // 1. USER VERIFICATION
    console.log('1. USER ACCOUNT CHECK');
    console.log('-'.repeat(80));
    
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      issues.push('❌ Emily account not found');
      return;
    }
    
    perfections.push('✅ Emily account exists');
    console.log(`✅ User: ${emily.name} (${emily.email})`);
    console.log(`   Role: ${emily.role}`);
    console.log(`   School: ${emily.school}`);
    
    // 2. CURRICULUM EXPECTATIONS
    console.log('\n2. CURRICULUM EXPECTATIONS CHECK');
    console.log('-'.repeat(80));
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    console.log(`Total expectations: ${expectations.length}`);
    
    if (expectations.length !== 73) {
      issues.push(`❌ Expected 73 expectations, found ${expectations.length}`);
    } else {
      perfections.push('✅ All 73 curriculum expectations loaded');
    }
    
    // Count by subject
    const bySubject: { [key: string]: number } = {};
    expectations.forEach(exp => {
      bySubject[exp.subject] = (bySubject[exp.subject] || 0) + 1;
    });
    
    console.log('By subject:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}`);
    });
    
    // 3. LONG RANGE PLANS
    console.log('\n3. LONG RANGE PLANS CHECK');
    console.log('-'.repeat(80));
    
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    console.log(`Total long range plans: ${longRangePlans.length}`);
    
    if (longRangePlans.length !== 8) {
      issues.push(`❌ Expected 8 long range plans, found ${longRangePlans.length}`);
    } else {
      perfections.push('✅ All 8 subject long range plans exist');
    }
    
    longRangePlans.forEach(lrp => {
      console.log(`  ${lrp.subject}: ${lrp.academicYear}`);
    });
    
    // 4. UNIT PLANS
    console.log('\n4. UNIT PLANS CHECK');
    console.log('-'.repeat(80));
    
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: true
      }
    });
    
    console.log(`Total unit plans: ${unitPlans.length}`);
    
    // Count by subject
    const unitsBySubject: { [key: string]: number } = {};
    let totalHours = 0;
    
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      unitsBySubject[subject] = (unitsBySubject[subject] || 0) + 1;
      totalHours += unit.estimatedHours || 0;
    });
    
    console.log('Units by subject:');
    Object.entries(unitsBySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count} units`);
    });
    
    console.log(`\nTotal instructional hours: ${totalHours}`);
    console.log(`Weekly average: ${(totalHours / 42).toFixed(1)} hours`);
    
    if (unitPlans.length < 47) {
      issues.push(`❌ Missing unit plans (found ${unitPlans.length})`);
    } else {
      perfections.push(`✅ ${unitPlans.length} unit plans created`);
    }
    
    // 5. LESSON PLANS
    console.log('\n5. LESSON PLANS CHECK');
    console.log('-'.repeat(80));
    
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      }
    });
    
    console.log(`Total lesson plans: ${lessonPlans.length}`);
    
    if (lessonPlans.length === 0) {
      issues.push('❌ No lesson plans found');
    } else {
      // Group by unit
      const lessonsByUnit: { [key: string]: number } = {};
      lessonPlans.forEach(lesson => {
        const unitTitle = lesson.unitPlan.titleFr || lesson.unitPlan.title;
        lessonsByUnit[unitTitle] = (lessonsByUnit[unitTitle] || 0) + 1;
      });
      
      console.log('Lessons by unit:');
      Object.entries(lessonsByUnit).forEach(([unit, count]) => {
        console.log(`  ${unit}: ${count} lessons`);
      });
      
      perfections.push(`✅ ${lessonPlans.length} lesson plans created`);
    }
    
    // 6. CALENDAR EVENTS
    console.log('\n6. CALENDAR EVENTS CHECK');
    console.log('-'.repeat(80));
    
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: { teacherId: emily.id }
    });
    
    console.log(`Total calendar events: ${calendarEvents.length}`);
    
    if (calendarEvents.length === 0) {
      console.log('⚠️ No calendar events loaded (optional)');
    } else {
      perfections.push(`✅ ${calendarEvents.length} calendar events loaded`);
    }
    
    // 7. SCHEDULING CONFLICTS
    console.log('\n7. SCHEDULING CONFLICTS CHECK');
    console.log('-'.repeat(80));
    
    // Check for unit plan overlaps within subjects
    let conflicts = 0;
    const subjectUnits: { [key: string]: typeof unitPlans } = {};
    
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectUnits[subject]) subjectUnits[subject] = [];
      subjectUnits[subject].push(unit);
    });
    
    Object.entries(subjectUnits).forEach(([subject, units]) => {
      units.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      for (let i = 0; i < units.length - 1; i++) {
        if (units[i].endDate > units[i + 1].startDate) {
          conflicts++;
          issues.push(`❌ Overlap in ${subject}: ${units[i].titleFr} → ${units[i + 1].titleFr}`);
        }
      }
    });
    
    if (conflicts === 0) {
      perfections.push('✅ No scheduling conflicts detected');
    }
    
    // 8. EXPECTATION COVERAGE
    console.log('\n8. EXPECTATION COVERAGE CHECK');
    console.log('-'.repeat(80));
    
    const coveredExpectations = new Set<string>();
    unitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectationId);
      });
    });
    
    console.log(`Expectations covered: ${coveredExpectations.size}/${expectations.length}`);
    
    const coveragePercent = (coveredExpectations.size / expectations.length * 100).toFixed(1);
    if (coveredExpectations.size === expectations.length) {
      perfections.push('✅ 100% expectation coverage');
    } else if (coveredExpectations.size >= 65) {
      perfections.push(`✅ ${coveragePercent}% expectation coverage`);
    } else {
      issues.push(`❌ Only ${coveragePercent}% expectations covered`);
    }
    
    // 9. DATABASE RELATIONSHIPS
    console.log('\n9. DATABASE RELATIONSHIPS CHECK');
    console.log('-'.repeat(80));
    
    // Check if all unit plans have long range plans
    const orphanUnits = unitPlans.filter(u => !u.longRangePlanId);
    if (orphanUnits.length > 0) {
      issues.push(`❌ ${orphanUnits.length} unit plans without long range plans`);
    } else {
      perfections.push('✅ All unit plans linked to long range plans');
    }
    
    // Check if lesson plans have unit plans
    const orphanLessons = lessonPlans.filter(l => !l.unitPlanId);
    if (orphanLessons.length > 0) {
      issues.push(`❌ ${orphanLessons.length} lesson plans without unit plans`);
    } else if (lessonPlans.length > 0) {
      perfections.push('✅ All lesson plans linked to unit plans');
    }
    
    // 10. SYSTEM READINESS
    console.log('\n10. SYSTEM READINESS CHECK');
    console.log('-'.repeat(80));
    
    const septemberUnits = unitPlans.filter(u => 
      u.startDate.getMonth() === 8 && u.startDate.getFullYear() === 2025
    );
    
    console.log(`Units starting in September 2025: ${septemberUnits.length}`);
    
    if (septemberUnits.length === 0) {
      issues.push('❌ No units start in September 2025');
    } else {
      perfections.push(`✅ ${septemberUnits.length} units ready for September 4, 2025`);
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    if (perfections.length > 0) {
      console.log('\n✅ PERFECTIONS:');
      perfections.forEach(p => console.log(`  ${p}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('\n📊 FINAL METRICS:');
    console.log(`  User Account: ${emily ? '✅' : '❌'}`);
    console.log(`  Curriculum: ${expectations.length}/73`);
    console.log(`  Long Range Plans: ${longRangePlans.length}/8`);
    console.log(`  Unit Plans: ${unitPlans.length}`);
    console.log(`  Lesson Plans: ${lessonPlans.length}`);
    console.log(`  Total Hours: ${totalHours}`);
    console.log(`  Issues: ${issues.length}`);
    console.log(`  Perfections: ${perfections.length}`);
    
    const readiness = issues.length === 0 ? '✅ READY' : '❌ NOT READY';
    console.log(`\n  System Status: ${readiness}`);
    
    if (issues.length === 0) {
      console.log('\n' + '🏆'.repeat(20));
      console.log('\n✨ SYSTEM IS PERFECT AND READY! ✨');
      console.log('\nEmily can start teaching on September 4, 2025!');
      console.log('\n' + '🏆'.repeat(20));
    } else {
      console.log('\n⚠️ ISSUES NEED TO BE FIXED');
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    issues.push('System error during verification');
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Verification completed: ' + new Date().toLocaleString());
  console.log('='.repeat(80) + '\n');
}

// Run verification
verifyCompleteSystem();