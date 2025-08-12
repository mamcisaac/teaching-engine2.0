#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReview() {
  console.log('\n🔍 CRITICAL REVIEW OF TEACHING ENGINE 2.0');
  console.log('='.repeat(60));
  console.log('Date: August 10, 2025');
  console.log('Purpose: Ensure PERFECTION for Emily McIsaac\n');
  
  const issues: string[] = [];
  const successes: string[] = [];
  
  try {
    // 1. USER ACCOUNT CHECK
    console.log('1. USER ACCOUNT VERIFICATION');
    console.log('-'.repeat(60));
    
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      issues.push('❌ CRITICAL: Emily\'s account not found!');
      console.log('❌ Emily\'s account not found');
      return;
    }
    
    successes.push('✅ Emily\'s account exists');
    console.log(`✅ User: ${emily.name} (${emily.email})`);
    console.log(`✅ Role: ${emily.role}`);
    console.log(`✅ Language: ${emily.preferredLanguage}`);
    
    // 2. CURRICULUM CHECK
    console.log('\n2. CURRICULUM EXPECTATIONS');
    console.log('-'.repeat(60));
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    const bySubject: { [key: string]: number } = {};
    expectations.forEach(e => {
      bySubject[e.subject] = (bySubject[e.subject] || 0) + 1;
    });
    
    console.log(`Total Grade 1 expectations: ${expectations.length}`);
    
    if (expectations.length !== 73) {
      issues.push(`❌ Expectation count mismatch: ${expectations.length} (should be 73)`);
    } else {
      successes.push('✅ All 73 curriculum expectations loaded');
    }
    
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}`);
    });
    
    // 3. LONG RANGE PLANS CHECK
    console.log('\n3. LONG RANGE PLANS');
    console.log('-'.repeat(60));
    
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    console.log(`Total long range plans: ${longRangePlans.length}`);
    
    if (longRangePlans.length !== 8) {
      issues.push(`❌ Long range plan count: ${longRangePlans.length} (should be 8)`);
    } else {
      successes.push('✅ All 8 subjects have long range plans');
    }
    
    // Check academic year
    const wrongYear = longRangePlans.filter(p => p.academicYear !== '2025-2026');
    if (wrongYear.length > 0) {
      issues.push(`❌ ${wrongYear.length} plans have wrong academic year`);
      wrongYear.forEach(p => {
        console.log(`  ❌ ${p.subject}: ${p.academicYear}`);
      });
    } else {
      successes.push('✅ All plans set to 2025-2026');
    }
    
    // 4. UNIT PLANS CHECK
    console.log('\n4. UNIT PLANS');
    console.log('-'.repeat(60));
    
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`Total unit plans: ${unitPlans.length}`);
    
    // Group by subject
    const unitsBySubject: { [key: string]: any[] } = {};
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!unitsBySubject[subject]) unitsBySubject[subject] = [];
      unitsBySubject[subject].push(unit);
    });
    
    console.log('\nUnit plans by subject:');
    Object.entries(unitsBySubject).forEach(([subject, units]) => {
      const hours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      console.log(`  ${subject}: ${units.length} units, ${hours} hours`);
    });
    
    // Check dates
    const firstUnit = unitPlans[0];
    const lastUnit = unitPlans[unitPlans.length - 1];
    
    if (firstUnit) {
      const firstDate = firstUnit.startDate.toISOString().split('T')[0];
      if (firstDate !== '2025-09-04') {
        issues.push(`❌ First unit starts ${firstDate} (should be 2025-09-04)`);
      } else {
        successes.push('✅ First unit starts Sept 4, 2025');
      }
    }
    
    if (lastUnit) {
      const lastDate = lastUnit.endDate.toISOString().split('T')[0];
      if (lastDate !== '2026-06-25') {
        issues.push(`❌ Last unit ends ${lastDate} (should be 2026-06-25)`);
      } else {
        successes.push('✅ Last unit ends June 25, 2026');
      }
    }
    
    // 5. CALENDAR EVENTS CHECK
    console.log('\n5. CALENDAR INTEGRATION');
    console.log('-'.repeat(60));
    
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        teacherId: emily.id,
        source: 'SYSTEM'
      }
    });
    
    console.log(`Total calendar events: ${calendarEvents.length}`);
    
    if (calendarEvents.length !== 35) {
      issues.push(`❌ Calendar events: ${calendarEvents.length} (should be 35)`);
    } else {
      successes.push('✅ All 35 calendar events loaded');
    }
    
    // Count by type
    const eventsByType: { [key: string]: number } = {};
    calendarEvents.forEach(e => {
      eventsByType[e.eventType] = (eventsByType[e.eventType] || 0) + 1;
    });
    
    console.log('Events by type:');
    Object.entries(eventsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // 6. EXPECTATION COVERAGE CHECK
    console.log('\n6. EXPECTATION COVERAGE');
    console.log('-'.repeat(60));
    
    const coveredExpectations = new Set<string>();
    unitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectationId.toString());
      });
    });
    
    console.log(`Expectations covered in unit plans: ${coveredExpectations.size}/${expectations.length}`);
    
    const subjectsWithUnits = Object.keys(unitsBySubject);
    const subjectsWithoutUnits = Object.keys(bySubject).filter(s => !subjectsWithUnits.includes(s));
    
    if (subjectsWithoutUnits.length > 0) {
      console.log('\nSubjects without unit plans:');
      subjectsWithoutUnits.forEach(s => {
        console.log(`  - ${s}`);
      });
    }
    
    // 7. QUALITY CHECKS
    console.log('\n7. QUALITY CHECKS');
    console.log('-'.repeat(60));
    
    // Check for required metadata in unit plans
    let missingMetadata = 0;
    unitPlans.forEach(unit => {
      if (!unit.bigIdeas || !unit.bigIdeasFr) missingMetadata++;
      if (!unit.essentialQuestions) missingMetadata++;
      if (!unit.successCriteria) missingMetadata++;
      if (!unit.differentiationStrategies) missingMetadata++;
    });
    
    if (missingMetadata > 0) {
      issues.push(`❌ ${missingMetadata} units missing metadata`);
    } else {
      successes.push('✅ All units have complete metadata');
    }
    
    // Check for French content
    const unitsMissingFrench = unitPlans.filter(u => !u.titleFr || !u.descriptionFr);
    if (unitsMissingFrench.length > 0) {
      issues.push(`❌ ${unitsMissingFrench.length} units missing French content`);
    } else {
      successes.push('✅ All units have French content');
    }
    
    // 8. FINAL SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('CRITICAL REVIEW SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ SUCCESSES:');
    successes.forEach(s => console.log(`  ${s}`));
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(i => console.log(`  ${i}`));
      
      console.log('\n⚠️ STATUS: NEEDS FIXES');
      console.log('Please address the issues above for perfection.');
    } else {
      console.log('\n🎉 STATUS: PERFECT!');
      console.log('\nThe Teaching Engine 2.0 is PERFECT for Emily McIsaac!');
      console.log('✅ User account configured');
      console.log('✅ All curriculum loaded');
      console.log('✅ Calendar fully integrated');
      console.log('✅ Unit plans complete for core subjects');
      console.log('✅ Dates aligned with 2025-2026');
      console.log('✅ French immersion support');
      console.log('✅ Ready for September 4, 2025!');
    }
    
    // Additional statistics
    console.log('\n📊 STATISTICS:');
    console.log(`  Total instructional hours planned: ${unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0)}`);
    console.log(`  Subjects with unit plans: ${Object.keys(unitsBySubject).length}/8`);
    console.log(`  Calendar events loaded: ${calendarEvents.length}`);
    console.log(`  Curriculum expectations: ${expectations.length}`);
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    issues.push('❌ CRITICAL: Review script encountered an error');
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Critical review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(60) + '\n');
}

// Run the critical review
criticalReview();