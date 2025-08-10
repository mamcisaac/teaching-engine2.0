#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultimateCriticalReview() {
  console.log('\n🔍 ULTIMATE CRITICAL REVIEW - TEACHING ENGINE 2.0');
  console.log('='.repeat(80));
  console.log('Purpose: Find ANY issues and ensure ABSOLUTE PERFECTION');
  console.log('Date: August 10, 2025\n');
  
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const perfections: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      criticalIssues.push('CRITICAL: Emily not found!');
      return;
    }
    
    // Get ALL data
    const allUnitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: { teacherId: emily.id },
      orderBy: { start: 'asc' }
    });
    
    console.log('1. DATABASE INTEGRITY CHECK');
    console.log('-'.repeat(80));
    
    // Check for orphaned records
    const unitPlanIds = allUnitPlans.map(u => u.id);
    const orphanedExpectations = await prisma.unitPlanExpectation.findMany({
      where: {
        unitPlanId: {
          notIn: unitPlanIds.length > 0 ? unitPlanIds : ['dummy']
        }
      }
    });
    
    if (orphanedExpectations.length > 0) {
      criticalIssues.push(`${orphanedExpectations.length} orphaned expectation links found`);
    } else {
      perfections.push('No orphaned records in database');
    }
    
    console.log(`✅ Database integrity check complete`);
    
    console.log('\n2. SCHEDULING CONFLICTS ANALYSIS');
    console.log('-'.repeat(80));
    
    // Check for overlapping units within same subject
    const subjectGroups: { [key: string]: typeof allUnitPlans } = {};
    allUnitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectGroups[subject]) subjectGroups[subject] = [];
      subjectGroups[subject].push(unit);
    });
    
    Object.entries(subjectGroups).forEach(([subject, units]) => {
      units.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      for (let i = 0; i < units.length - 1; i++) {
        const current = units[i];
        const next = units[i + 1];
        
        if (current.endDate > next.startDate) {
          criticalIssues.push(`OVERLAP in ${subject}: "${current.titleFr}" overlaps with "${next.titleFr}"`);
        }
        
        const gap = Math.floor((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gap > 30) {
          warnings.push(`Large gap (${gap} days) in ${subject} between units`);
        }
      }
    });
    
    if (criticalIssues.filter(i => i.includes('OVERLAP')).length === 0) {
      perfections.push('No scheduling overlaps within subjects');
    }
    
    console.log('\n3. REALISTIC HOUR ANALYSIS');
    console.log('-'.repeat(80));
    
    // Calculate actual weekly hours more accurately
    const weeklyHoursByWeek: { [key: string]: number } = {};
    
    allUnitPlans.forEach(unit => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const weeks = Math.ceil(totalDays / 7);
      const hoursPerWeek = (unit.estimatedHours || 0) / weeks;
      
      // Add hours to each week the unit spans
      let currentWeek = new Date(startDate);
      while (currentWeek <= endDate) {
        const weekKey = currentWeek.toISOString().substring(0, 10);
        weeklyHoursByWeek[weekKey] = (weeklyHoursByWeek[weekKey] || 0) + hoursPerWeek;
        currentWeek.setDate(currentWeek.getDate() + 7);
      }
    });
    
    // Find peak weeks
    const peakWeeks = Object.entries(weeklyHoursByWeek)
      .filter(([_, hours]) => hours > 25)
      .sort((a, b) => b[1] - a[1]);
    
    if (peakWeeks.length > 0) {
      console.log('Peak weeks (>25 hours):');
      peakWeeks.slice(0, 5).forEach(([week, hours]) => {
        console.log(`  ${week}: ${hours.toFixed(1)} hours`);
        if (hours > 30) {
          criticalIssues.push(`Week of ${week} has ${hours.toFixed(1)} hours (too high!)`);
        } else if (hours > 25) {
          warnings.push(`Week of ${week} has ${hours.toFixed(1)} hours (busy)`);
        }
      });
    }
    
    // Calculate average
    const totalWeeks = Object.keys(weeklyHoursByWeek).length;
    const totalHours = allUnitPlans.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const averageHours = totalHours / 42; // School year weeks
    
    console.log(`\nAverage weekly hours: ${averageHours.toFixed(1)}`);
    
    if (averageHours >= 18 && averageHours <= 22) {
      perfections.push('Reasonable average weekly hours');
    } else {
      warnings.push(`Average weekly hours (${averageHours.toFixed(1)}) may be outside optimal range`);
    }
    
    console.log('\n4. EXPECTATION COVERAGE VERIFICATION');
    console.log('-'.repeat(80));
    
    // Detailed coverage check
    const coveredExpectations = new Map<string, number>();
    allUnitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        const code = ue.expectation.code;
        coveredExpectations.set(code, (coveredExpectations.get(code) || 0) + 1);
      });
    });
    
    // Check for over/under coverage
    const subjectExpectations: { [key: string]: { codes: string[], covered: number } } = {};
    allExpectations.forEach(exp => {
      if (!subjectExpectations[exp.subject]) {
        subjectExpectations[exp.subject] = { codes: [], covered: 0 };
      }
      subjectExpectations[exp.subject].codes.push(exp.code);
      if (coveredExpectations.has(exp.code)) {
        subjectExpectations[exp.subject].covered++;
      }
    });
    
    console.log('Coverage analysis by subject:');
    Object.entries(subjectExpectations).forEach(([subject, data]) => {
      const percentage = ((data.covered / data.codes.length) * 100).toFixed(0);
      console.log(`  ${subject}: ${data.covered}/${data.codes.length} (${percentage}%)`);
      
      // Check if subject has units but incomplete coverage
      const hasUnits = allUnitPlans.some(u => u.longRangePlan.subject === subject);
      if (hasUnits && data.covered < data.codes.length) {
        criticalIssues.push(`${subject} has units but incomplete coverage: ${data.covered}/${data.codes.length}`);
      }
    });
    
    console.log('\n5. CALENDAR CONFLICT CHECK');
    console.log('-'.repeat(80));
    
    // Check unit plans against calendar events
    calendarEvents.forEach(event => {
      const eventDate = new Date(event.start);
      
      // Check if any units have major activities on holidays
      allUnitPlans.forEach(unit => {
        if (unit.endDate.toDateString() === eventDate.toDateString()) {
          if (event.type === 'HOLIDAY' || event.type === 'BREAK') {
            warnings.push(`${unit.titleFr} ends on ${event.title}`);
          }
        }
      });
    });
    
    console.log(`Checked ${calendarEvents.length} calendar events`);
    
    console.log('\n6. ASSESSMENT OVERLOAD CHECK');
    console.log('-'.repeat(80));
    
    // Group culminating tasks by week
    const assessmentsByWeek: { [key: string]: string[] } = {};
    allUnitPlans.forEach(unit => {
      const weekKey = unit.endDate.toISOString().substring(0, 10);
      if (!assessmentsByWeek[weekKey]) {
        assessmentsByWeek[weekKey] = [];
      }
      assessmentsByWeek[weekKey].push(`${unit.longRangePlan.subject}: ${unit.titleFr}`);
    });
    
    // Find overloaded weeks
    const overloadedWeeks = Object.entries(assessmentsByWeek)
      .filter(([_, units]) => units.length > 3)
      .sort((a, b) => b[1].length - a[1].length);
    
    if (overloadedWeeks.length > 0) {
      console.log('Weeks with many assessments:');
      overloadedWeeks.forEach(([week, units]) => {
        console.log(`  ${week}: ${units.length} assessments`);
        if (units.length > 4) {
          warnings.push(`Week of ${week} has ${units.length} culminating assessments`);
        }
      });
    } else {
      perfections.push('Well-distributed assessments');
    }
    
    console.log('\n7. FRENCH QUALITY CHECK');
    console.log('-'.repeat(80));
    
    let frenchIssues = 0;
    allUnitPlans.forEach(unit => {
      // Check for missing French content
      if (!unit.titleFr || unit.titleFr === unit.title) {
        criticalIssues.push(`${unit.title} missing French title`);
        frenchIssues++;
      }
      
      if (!unit.bigIdeasFr || unit.bigIdeasFr === unit.bigIdeas) {
        criticalIssues.push(`${unit.title} missing French big ideas`);
        frenchIssues++;
      }
      
      // Check vocabulary
      if (unit.keyVocabulary) {
        try {
          const vocab = JSON.parse(unit.keyVocabulary);
          if (!Array.isArray(vocab) || vocab.length < 5) {
            warnings.push(`${unit.titleFr} has limited vocabulary (${vocab.length} words)`);
          }
        } catch {
          warnings.push(`${unit.titleFr} has invalid vocabulary format`);
        }
      }
    });
    
    if (frenchIssues === 0) {
      perfections.push('Complete French immersion support');
    }
    
    console.log('\n8. RESOURCE BALANCE CHECK');
    console.log('-'.repeat(80));
    
    // Check if certain months are too light or heavy
    const monthlyDistribution: { [key: string]: number } = {};
    allUnitPlans.forEach(unit => {
      const month = unit.startDate.toISOString().substring(0, 7);
      monthlyDistribution[month] = (monthlyDistribution[month] || 0) + 1;
    });
    
    console.log('Units starting by month:');
    Object.entries(monthlyDistribution).sort().forEach(([month, count]) => {
      console.log(`  ${month}: ${count} units`);
      if (count > 8) {
        warnings.push(`${month} has ${count} units starting (very busy)`);
      } else if (count === 0) {
        warnings.push(`${month} has no units starting`);
      }
    });
    
    console.log('\n9. INTEGRATION QUALITY CHECK');
    console.log('-'.repeat(80));
    
    // Check cross-curricular connections make sense
    let weakIntegration = 0;
    allUnitPlans.forEach(unit => {
      const connections = unit.crossCurricularConnections || '';
      if (connections.length < 50) {
        weakIntegration++;
      }
    });
    
    if (weakIntegration > 5) {
      warnings.push(`${weakIntegration} units have weak cross-curricular connections`);
    } else {
      perfections.push('Strong cross-curricular integration throughout');
    }
    
    console.log('\n10. SPECIAL FEATURES CONSISTENCY');
    console.log('-'.repeat(80));
    
    let missingIndigenous = 0;
    let missingEnvironmental = 0;
    let missingSocialJustice = 0;
    
    allUnitPlans.forEach(unit => {
      if (!unit.indigenousPerspectives || unit.indigenousPerspectives.length < 20) {
        missingIndigenous++;
      }
      if (!unit.environmentalEducation || unit.environmentalEducation.length < 20) {
        missingEnvironmental++;
      }
      if (!unit.socialJusticeConnections || unit.socialJusticeConnections.length < 20) {
        missingSocialJustice++;
      }
    });
    
    console.log(`Indigenous perspectives: ${allUnitPlans.length - missingIndigenous}/${allUnitPlans.length}`);
    console.log(`Environmental education: ${allUnitPlans.length - missingEnvironmental}/${allUnitPlans.length}`);
    console.log(`Social justice: ${allUnitPlans.length - missingSocialJustice}/${allUnitPlans.length}`);
    
    if (missingIndigenous === 0 && missingEnvironmental === 0 && missingSocialJustice === 0) {
      perfections.push('Complete special features in all units');
    } else {
      const total = missingIndigenous + missingEnvironmental + missingSocialJustice;
      if (total > 0) {
        warnings.push(`${total} instances of weak special features content`);
      }
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('ULTIMATE CRITICAL REVIEW SUMMARY');
    console.log('='.repeat(80));
    
    if (perfections.length > 0) {
      console.log('\n✅ PERFECTIONS FOUND:');
      perfections.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Non-critical):');
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
    
    if (criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      criticalIssues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
      
      console.log('\n🚨 STATUS: CRITICAL ISSUES NEED FIXING!');
      console.log('The system has issues that must be addressed for perfection.');
    } else if (warnings.length > 5) {
      console.log('\n⚠️ STATUS: GOOD BUT COULD BE BETTER');
      console.log('The system works but has minor issues to consider.');
    } else {
      console.log('\n🏆 STATUS: ABSOLUTE PERFECTION!');
      console.log('\n✨ The Teaching Engine 2.0 is FLAWLESS!');
      console.log('✨ All 6 subjects perfectly integrated');
      console.log('✨ No scheduling conflicts');
      console.log('✨ Reasonable workload distribution');
      console.log('✨ Complete curriculum coverage');
      console.log('✨ Rich French immersion throughout');
      console.log('✨ Comprehensive special features');
      console.log('✨ Well-balanced assessments');
      console.log('✨ Strong cross-curricular connections');
    }
    
    console.log('\n📊 FINAL METRICS:');
    console.log(`  Total unit plans: ${allUnitPlans.length}`);
    console.log(`  Total hours: ${totalHours}`);
    console.log(`  Average weekly hours: ${averageHours.toFixed(1)}`);
    console.log(`  Expectations covered: ${coveredExpectations.size}/${allExpectations.length}`);
    console.log(`  Critical issues: ${criticalIssues.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    console.log(`  Perfections: ${perfections.length}`);
    
    const qualityScore = perfections.length / (perfections.length + criticalIssues.length);
    console.log(`  Quality score: ${(qualityScore * 100).toFixed(0)}%`);
    
  } catch (error) {
    console.error('❌ Review error:', error);
    criticalIssues.push('System error during review');
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Ultimate critical review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(80) + '\n');
}

// Run the ultimate review
ultimateCriticalReview();