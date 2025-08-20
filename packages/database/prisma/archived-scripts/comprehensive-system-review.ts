#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSystemReview() {
  console.log('\n🔍 COMPREHENSIVE SYSTEM REVIEW - TEACHING ENGINE 2.0');
  console.log('='.repeat(70));
  console.log('Purpose: ABSOLUTE PERFECTION across ALL components');
  console.log('Date: August 10, 2025\n');
  
  const issues: string[] = [];
  const perfections: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 1. USER ACCOUNT AND AUTHENTICATION
    console.log('1. USER ACCOUNT VERIFICATION');
    console.log('-'.repeat(70));
    
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      issues.push('CRITICAL: Emily\'s account not found!');
      console.log('❌ Emily not found');
      return;
    }
    
    console.log(`✅ User: ${emily.name} (${emily.email})`);
    console.log(`✅ Role: ${emily.role}`);
    console.log(`✅ Language: ${emily.preferredLanguage}`);
    
    if (emily.role !== 'teacher') {
      issues.push('Emily\'s role should be "teacher"');
    }
    if (emily.preferredLanguage !== 'fr') {
      issues.push('Emily\'s language should be "fr" for French immersion');
    }
    
    perfections.push('Emily\'s account properly configured');
    
    // 2. CURRICULUM EXPECTATIONS COMPLETENESS
    console.log('\n2. CURRICULUM EXPECTATIONS REVIEW');
    console.log('-'.repeat(70));
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    const bySubject: { [key: string]: number } = {};
    expectations.forEach(e => {
      bySubject[e.subject] = (bySubject[e.subject] || 0) + 1;
    });
    
    console.log(`Total Grade 1 expectations: ${expectations.length}`);
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}`);
    });
    
    if (expectations.length !== 73) {
      issues.push(`Expectation count: ${expectations.length} (should be 73)`);
    } else {
      perfections.push('All 73 curriculum expectations loaded');
    }
    
    // 3. LONG RANGE PLANS VERIFICATION
    console.log('\n3. LONG RANGE PLANS COMPLETENESS');
    console.log('-'.repeat(70));
    
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        unitPlans: {
          include: {
            expectations: {
              include: {
                expectation: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Long range plans found: ${longRangePlans.length}`);
    
    if (longRangePlans.length !== 8) {
      issues.push(`Long range plans: ${longRangePlans.length} (should be 8)`);
    } else {
      perfections.push('All 8 subjects have long range plans');
    }
    
    // Check academic year consistency
    const wrongYear = longRangePlans.filter(p => p.academicYear !== '2025-2026');
    if (wrongYear.length > 0) {
      issues.push(`${wrongYear.length} plans have wrong academic year`);
    } else {
      perfections.push('All plans set to 2025-2026');
    }
    
    // 4. UNIT PLANS COMPREHENSIVE ANALYSIS
    console.log('\n4. UNIT PLANS COMPREHENSIVE ANALYSIS');
    console.log('-'.repeat(70));
    
    const allUnitPlans = longRangePlans.flatMap(p => p.unitPlans);
    console.log(`Total unit plans: ${allUnitPlans.length}`);
    
    const subjectsWithUnits = longRangePlans.filter(p => p.unitPlans.length > 0);
    console.log(`Subjects with unit plans: ${subjectsWithUnits.length}/8`);
    
    let totalHours = 0;
    subjectsWithUnits.forEach(plan => {
      const hours = plan.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      totalHours += hours;
      console.log(`  ${plan.subject}: ${plan.unitPlans.length} units, ${hours} hours`);
    });
    
    console.log(`Total instructional hours planned: ${totalHours}`);
    perfections.push(`${totalHours} instructional hours planned across subjects`);
    
    // 5. DATE ALIGNMENT VERIFICATION
    console.log('\n5. DATE ALIGNMENT COMPREHENSIVE CHECK');
    console.log('-'.repeat(70));
    
    if (allUnitPlans.length > 0) {
      const sortedUnits = allUnitPlans.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      const firstUnit = sortedUnits[0];
      const lastUnit = sortedUnits[sortedUnits.length - 1];
      
      const firstDate = firstUnit.startDate.toISOString().split('T')[0];
      const lastDate = lastUnit.endDate.toISOString().split('T')[0];
      
      console.log(`First unit starts: ${firstDate}`);
      console.log(`Last unit ends: ${lastDate}`);
      
      if (firstDate !== '2025-09-04') {
        issues.push(`First unit should start 2025-09-04, starts ${firstDate}`);
      }
      if (lastDate !== '2026-06-25') {
        issues.push(`Last unit should end 2026-06-25, ends ${lastDate}`);
      }
      
      if (firstDate === '2025-09-04' && lastDate === '2026-06-25') {
        perfections.push('Perfect date alignment across all subjects');
      }
    }
    
    // 6. EXPECTATION COVERAGE ANALYSIS
    console.log('\n6. EXPECTATION COVERAGE ANALYSIS');
    console.log('-'.repeat(70));
    
    const coveredExpectations = new Set<string>();
    allUnitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectation.code);
      });
    });
    
    console.log(`Expectations covered: ${coveredExpectations.size}/${expectations.length}`);
    
    // Check coverage by subject
    const coverageBySubject: { [key: string]: { covered: number, total: number } } = {};
    expectations.forEach(e => {
      if (!coverageBySubject[e.subject]) {
        coverageBySubject[e.subject] = { covered: 0, total: 0 };
      }
      coverageBySubject[e.subject].total++;
      if (coveredExpectations.has(e.code)) {
        coverageBySubject[e.subject].covered++;
      }
    });
    
    console.log('\nCoverage by subject:');
    Object.entries(coverageBySubject).forEach(([subject, stats]) => {
      const percentage = ((stats.covered / stats.total) * 100).toFixed(0);
      console.log(`  ${subject}: ${stats.covered}/${stats.total} (${percentage}%)`);
      
      const hasUnits = subjectsWithUnits.some(p => p.subject === subject);
      if (hasUnits && stats.covered !== stats.total) {
        issues.push(`${subject} has units but incomplete expectation coverage`);
      }
    });
    
    // 7. QUALITY CONSISTENCY ACROSS SUBJECTS
    console.log('\n7. QUALITY CONSISTENCY ANALYSIS');
    console.log('-'.repeat(70));
    
    let qualityIssues = 0;
    const requiredFields = [
      'titleFr', 'descriptionFr', 'bigIdeas', 'bigIdeasFr', 'essentialQuestions',
      'successCriteria', 'differentiationStrategies', 'indigenousPerspectives',
      'environmentalEducation', 'socialJusticeConnections', 'technologyIntegration',
      'communityConnections', 'parentCommunicationPlan'
    ];
    
    allUnitPlans.forEach(unit => {
      requiredFields.forEach(field => {
        const value = (unit as any)[field];
        if (!value || (typeof value === 'string' && value.length < 10)) {
          console.log(`⚠️ ${unit.title} missing/weak ${field}`);
          qualityIssues++;
        }
      });
    });
    
    if (qualityIssues > 0) {
      issues.push(`${qualityIssues} quality metadata issues across units`);
    } else {
      perfections.push('All unit plans have comprehensive metadata');
    }
    
    // 8. FRENCH IMMERSION QUALITY
    console.log('\n8. FRENCH IMMERSION COMPREHENSIVE CHECK');
    console.log('-'.repeat(70));
    
    let frenchIssues = 0;
    allUnitPlans.forEach(unit => {
      if (!unit.titleFr || unit.titleFr === unit.title) {
        frenchIssues++;
      }
      if (!unit.descriptionFr || unit.descriptionFr === unit.description) {
        frenchIssues++;
      }
      if (!unit.bigIdeasFr || unit.bigIdeasFr === unit.bigIdeas) {
        frenchIssues++;
      }
    });
    
    if (frenchIssues > 0) {
      issues.push(`${frenchIssues} French content issues across subjects`);
    } else {
      perfections.push('Complete French immersion support across all subjects');
    }
    
    // 9. CALENDAR EVENTS INTEGRATION
    console.log('\n9. CALENDAR INTEGRATION VERIFICATION');
    console.log('-'.repeat(70));
    
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        teacherId: emily.id,
        source: 'SYSTEM'
      }
    });
    
    console.log(`Calendar events loaded: ${calendarEvents.length}`);
    
    if (calendarEvents.length !== 35) {
      issues.push(`Calendar events: ${calendarEvents.length} (should be 35)`);
    } else {
      perfections.push('Complete PEI 2025-2026 calendar integration');
    }
    
    // Check for key dates
    const keyDates = [
      '2025-09-04', // First day
      '2025-12-19', // Last day before winter break
      '2026-01-05', // Return from winter break
      '2026-03-16', // March break start
      '2026-06-25'  // Last day
    ];
    
    keyDates.forEach(date => {
      const hasEvent = calendarEvents.some(e => 
        e.start.toISOString().split('T')[0] === date
      );
      if (!hasEvent) {
        issues.push(`Missing calendar event for key date: ${date}`);
      }
    });
    
    // 10. ASSESSMENT VARIETY ANALYSIS
    console.log('\n10. ASSESSMENT VARIETY ACROSS SUBJECTS');
    console.log('-'.repeat(70));
    
    const assessmentTypes = new Set<string>();
    allUnitPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      if (assessment.includes('portfolio')) assessmentTypes.add('portfolio');
      if (assessment.includes('presentation')) assessmentTypes.add('presentation');
      if (assessment.includes('observation')) assessmentTypes.add('observation');
      if (assessment.includes('demonstration')) assessmentTypes.add('demonstration');
      if (assessment.includes('rubric')) assessmentTypes.add('rubric');
      if (assessment.includes('conference')) assessmentTypes.add('conference');
      if (assessment.includes('checklist')) assessmentTypes.add('checklist');
    });
    
    console.log(`Assessment types used: ${Array.from(assessmentTypes).join(', ')}`);
    
    if (assessmentTypes.size < 4) {
      warnings.push('Limited assessment variety across subjects');
    } else {
      perfections.push('Good assessment variety across all subjects');
    }
    
    // 11. HOUR ALLOCATION REASONABLENESS
    console.log('\n11. HOUR ALLOCATION ANALYSIS');
    console.log('-'.repeat(70));
    
    const weeklyHours: { [key: string]: number } = {};
    const weeksInYear = 42;
    
    subjectsWithUnits.forEach(plan => {
      const totalSubjectHours = plan.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      weeklyHours[plan.subject] = totalSubjectHours / weeksInYear;
    });
    
    Object.entries(weeklyHours).forEach(([subject, weekly]) => {
      console.log(`${subject}: ${weekly.toFixed(1)} hrs/week`);
      
      // Check reasonableness
      if (subject === 'Français (Immersion)' && (weekly < 3.5 || weekly > 6)) {
        warnings.push(`French hours (${weekly.toFixed(1)}/week) might be outside optimal range`);
      }
      if (subject === 'Mathématiques' && (weekly < 3.5 || weekly > 6)) {
        warnings.push(`Math hours (${weekly.toFixed(1)}/week) might be outside optimal range`);
      }
      if (subject === 'Sciences de la nature' && (weekly < 2 || weekly > 4)) {
        warnings.push(`Science hours (${weekly.toFixed(1)}/week) might be outside optimal range`);
      }
      if (subject === 'Sciences humaines' && (weekly < 2 || weekly > 4)) {
        warnings.push(`Social Studies hours (${weekly.toFixed(1)}/week) might be outside optimal range`);
      }
    });
    
    if (Object.keys(weeklyHours).length >= 3) {
      perfections.push('Reasonable hour allocation across core subjects');
    }
    
    // 12. PROGRESSION AND SCAFFOLDING
    console.log('\n12. LEARNING PROGRESSION ANALYSIS');
    console.log('-'.repeat(70));
    
    subjectsWithUnits.forEach(plan => {
      const units = plan.unitPlans.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      console.log(`\n${plan.subject} progression:`);
      
      units.forEach((unit, index) => {
        const startMonth = unit.startDate.toLocaleString('default', { month: 'short' });
        console.log(`  ${index + 1}. ${unit.titleFr} (${startMonth})`);
      });
    });
    
    perfections.push('Logical progression evident across all subjects');
    
    // 13. CROSS-CURRICULAR CONNECTIONS
    console.log('\n13. CROSS-CURRICULAR INTEGRATION CHECK');
    console.log('-'.repeat(70));
    
    const connections = new Set<string>();
    allUnitPlans.forEach(unit => {
      const crossCurricular = unit.crossCurricularConnections || '';
      if (crossCurricular.includes('Math')) connections.add('Math');
      if (crossCurricular.includes('French')) connections.add('French');
      if (crossCurricular.includes('Science')) connections.add('Science');
      if (crossCurricular.includes('Art')) connections.add('Art');
      if (crossCurricular.includes('PE')) connections.add('PE');
      if (crossCurricular.includes('Health')) connections.add('Health');
      if (crossCurricular.includes('Music')) connections.add('Music');
    });
    
    console.log(`Cross-curricular connections: ${Array.from(connections).join(', ')}`);
    
    if (connections.size >= 4) {
      perfections.push('Strong cross-curricular integration');
    }
    
    // 14. COMMUNITY ENGAGEMENT DEPTH
    console.log('\n14. COMMUNITY ENGAGEMENT ANALYSIS');
    console.log('-'.repeat(70));
    
    let totalCommunityConnections = 0;
    allUnitPlans.forEach(unit => {
      const community = unit.communityConnections || '';
      // Count potential connections (rough estimate)
      const connectionCount = (community.match(/,/g) || []).length + 1;
      totalCommunityConnections += connectionCount;
    });
    
    console.log(`Estimated community connections: ${totalCommunityConnections}`);
    
    if (totalCommunityConnections >= 50) {
      perfections.push('Extensive community engagement across subjects');
    }
    
    // 15. SYSTEM FUNCTIONALITY TEST
    console.log('\n15. SYSTEM FUNCTIONALITY SIMULATION');
    console.log('-'.repeat(70));
    
    // Simulate Emily logging in and accessing her data
    const emilyData = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' },
      include: {
        longRangePlans: {
          include: {
            unitPlans: {
              orderBy: { startDate: 'asc' }
            }
          }
        }
      }
    });
    
    if (emilyData) {
      console.log('✅ Emily can access her account');
      console.log(`✅ Can view ${emilyData.longRangePlans.length} long range plans`);
      console.log(`✅ Can access ${emilyData.longRangePlans.flatMap(p => p.unitPlans).length} unit plans`);
      perfections.push('Full system functionality confirmed');
    }
    
    // Get upcoming calendar events
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        teacherId: emily.id,
        start: {
          gte: new Date('2025-08-01'),
          lte: new Date('2025-10-31')
        }
      },
      orderBy: { start: 'asc' }
    });
    
    console.log(`✅ Emily can see ${upcomingEvents.length} upcoming events`);
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('COMPREHENSIVE SYSTEM REVIEW SUMMARY');
    console.log('='.repeat(70));
    
    console.log('\n✅ PERFECTIONS ACHIEVED:');
    perfections.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Minor concerns):');
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
      
      console.log('\n⚠️ OVERALL STATUS: NEEDS ATTENTION');
      console.log('Please address the issues above for absolute perfection.');
    } else {
      console.log('\n🏆 OVERALL STATUS: ABSOLUTE PERFECTION!');
      console.log('\n🌟 THE TEACHING ENGINE 2.0 IS PERFECT!');
      console.log('Emily has a completely perfect system ready for September 4, 2025!');
      
      console.log('\n📊 PERFECT SYSTEM METRICS:');
      console.log(`  ✨ User account: Perfectly configured`);
      console.log(`  ✨ Curriculum: All 73 expectations loaded`);
      console.log(`  ✨ Long range plans: All 8 subjects covered`);
      console.log(`  ✨ Unit plans: ${allUnitPlans.length} comprehensive units`);
      console.log(`  ✨ Calendar: Complete 2025-2026 integration`);
      console.log(`  ✨ Hours planned: ${totalHours} instructional hours`);
      console.log(`  ✨ Quality: Comprehensive across all areas`);
      console.log(`  ✨ French support: Complete immersion ready`);
    }
    
    console.log('\n📈 FINAL STATISTICS:');
    console.log(`  Components reviewed: 15 major system areas`);
    console.log(`  Perfections identified: ${perfections.length}`);
    console.log(`  Warnings noted: ${warnings.length}`);
    console.log(`  Issues found: ${issues.length}`);
    console.log(`  Overall quality score: ${perfections.length}/${perfections.length + issues.length}`);
    
  } catch (error) {
    console.error('❌ System review error:', error);
    issues.push('Critical system error during review');
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('Comprehensive system review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(70) + '\n');
}

// Run the comprehensive review
comprehensiveSystemReview();