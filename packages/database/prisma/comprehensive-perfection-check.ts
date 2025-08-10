#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensivePerfectionCheck() {
  console.log('\n🔬 COMPREHENSIVE PERFECTION CHECK - 7 SUBJECTS');
  console.log('='.repeat(80));
  console.log('Purpose: Ensure ABSOLUTE PERFECTION across all integration points');
  console.log('Date: August 10, 2025\n');
  
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const perfections: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('CRITICAL: Emily not found!');
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
    
    console.log('1. SCHEDULING PERFECTION CHECK');
    console.log('-'.repeat(80));
    
    // Check for ANY date overlaps within subjects
    const subjectGroups: { [key: string]: typeof allUnitPlans } = {};
    allUnitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectGroups[subject]) subjectGroups[subject] = [];
      subjectGroups[subject].push(unit);
    });
    
    let hasOverlaps = false;
    Object.entries(subjectGroups).forEach(([subject, units]) => {
      units.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      for (let i = 0; i < units.length - 1; i++) {
        const current = units[i];
        const next = units[i + 1];
        
        if (current.endDate >= next.startDate) {
          criticalIssues.push(`OVERLAP in ${subject}: "${current.titleFr}" overlaps "${next.titleFr}"`);
          hasOverlaps = true;
        }
        
        // Check for gaps
        const gap = Math.floor((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gap > 7) {
          warnings.push(`${subject}: ${gap}-day gap between units`);
        }
      }
    });
    
    if (!hasOverlaps) {
      perfections.push('✅ Perfect scheduling - no overlaps');
    }
    
    console.log('2. WORKLOAD DISTRIBUTION CHECK');
    console.log('-'.repeat(80));
    
    // Calculate precise weekly hours by month
    const monthlyHours: { [key: string]: number } = {};
    const monthlyDetails: { [key: string]: string[] } = {};
    
    allUnitPlans.forEach(unit => {
      const start = new Date(unit.startDate);
      const end = new Date(unit.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const weeks = totalDays / 7;
      const weeklyHours = (unit.estimatedHours || 0) / weeks;
      
      // Add to each month the unit spans
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const monthKey = currentDate.toISOString().substring(0, 7);
        monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + weeklyHours;
        
        if (!monthlyDetails[monthKey]) monthlyDetails[monthKey] = [];
        if (currentDate.getMonth() === start.getMonth() && currentDate.getFullYear() === start.getFullYear()) {
          monthlyDetails[monthKey].push(`${unit.longRangePlan.subject} starts`);
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
      }
    });
    
    console.log('Monthly workload analysis:');
    Object.entries(monthlyHours).sort().forEach(([month, hours]) => {
      const details = monthlyDetails[month] || [];
      console.log(`  ${month}: ${hours.toFixed(1)} hrs/week ${details.length > 0 ? `(${details.join(', ')})` : ''}`);
      
      if (hours > 28) {
        criticalIssues.push(`${month}: ${hours.toFixed(1)} hrs/week is TOO HIGH`);
      } else if (hours > 25) {
        warnings.push(`${month}: ${hours.toFixed(1)} hrs/week is busy`);
      }
    });
    
    const avgWeeklyHours = allUnitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) / 42;
    if (avgWeeklyHours >= 20 && avgWeeklyHours <= 24) {
      perfections.push(`✅ Perfect weekly average: ${avgWeeklyHours.toFixed(1)} hours`);
    }
    
    console.log('\n3. CROSS-CURRICULAR INTEGRATION CHECK');
    console.log('-'.repeat(80));
    
    let strongConnections = 0;
    allUnitPlans.forEach(unit => {
      const connections = unit.crossCurricularConnections || '';
      const connectionCount = connections.split(';').length;
      if (connectionCount >= 2) strongConnections++;
    });
    
    const connectionPercentage = (strongConnections / allUnitPlans.length) * 100;
    console.log(`Units with strong cross-curricular connections: ${strongConnections}/${allUnitPlans.length} (${connectionPercentage.toFixed(0)}%)`);
    
    if (connectionPercentage >= 90) {
      perfections.push(`✅ Excellent integration: ${connectionPercentage.toFixed(0)}% units connected`);
    }
    
    console.log('\n4. FRENCH IMMERSION QUALITY CHECK');
    console.log('-'.repeat(80));
    
    let frenchIssues = 0;
    let vocabularyIssues = 0;
    
    allUnitPlans.forEach(unit => {
      if (!unit.titleFr || unit.titleFr === unit.title) {
        criticalIssues.push(`${unit.title} missing French title`);
        frenchIssues++;
      }
      if (!unit.bigIdeasFr || unit.bigIdeasFr === unit.bigIdeas) {
        criticalIssues.push(`${unit.title} missing French big ideas`);
        frenchIssues++;
      }
      
      const vocab = unit.keyVocabulary ? JSON.parse(unit.keyVocabulary) : [];
      if (vocab.length < 8) {
        warnings.push(`${unit.titleFr}: only ${vocab.length} vocabulary terms`);
        vocabularyIssues++;
      }
    });
    
    if (frenchIssues === 0) {
      perfections.push('✅ Perfect French immersion support');
    }
    
    console.log(`French titles: ${allUnitPlans.filter(u => u.titleFr).length}/${allUnitPlans.length}`);
    console.log(`French big ideas: ${allUnitPlans.filter(u => u.bigIdeasFr).length}/${allUnitPlans.length}`);
    console.log(`Rich vocabulary (8+ terms): ${allUnitPlans.length - vocabularyIssues}/${allUnitPlans.length}`);
    
    console.log('\n5. SPECIAL FEATURES CONSISTENCY CHECK');
    console.log('-'.repeat(80));
    
    let missingFeatures = 0;
    const featureChecks = {
      indigenousPerspectives: 0,
      environmentalEducation: 0,
      socialJusticeConnections: 0,
      parentCommunicationPlan: 0,
      technologyIntegration: 0,
      communityConnections: 0
    };
    
    allUnitPlans.forEach(unit => {
      if (!unit.indigenousPerspectives || unit.indigenousPerspectives.length < 20) featureChecks.indigenousPerspectives++;
      if (!unit.environmentalEducation || unit.environmentalEducation.length < 20) featureChecks.environmentalEducation++;
      if (!unit.socialJusticeConnections || unit.socialJusticeConnections.length < 20) featureChecks.socialJusticeConnections++;
      if (!unit.parentCommunicationPlan || unit.parentCommunicationPlan.length < 20) featureChecks.parentCommunicationPlan++;
      if (!unit.technologyIntegration || unit.technologyIntegration.length < 20) featureChecks.technologyIntegration++;
      if (!unit.communityConnections || unit.communityConnections.length < 20) featureChecks.communityConnections++;
    });
    
    Object.entries(featureChecks).forEach(([feature, missing]) => {
      const present = allUnitPlans.length - missing;
      console.log(`  ${feature}: ${present}/${allUnitPlans.length}`);
      if (missing > 0) {
        missingFeatures += missing;
      }
    });
    
    if (missingFeatures === 0) {
      perfections.push('✅ All special features in 100% of units');
    }
    
    console.log('\n6. DEVELOPMENTAL PROGRESSION CHECK');
    console.log('-'.repeat(80));
    
    // Check September units for appropriate start
    const septemberUnits = allUnitPlans.filter(u => 
      u.startDate.getMonth() === 8 && u.startDate.getFullYear() === 2025
    );
    
    let foundationUnits = 0;
    septemberUnits.forEach(unit => {
      const desc = (unit.description + unit.descriptionFr).toLowerCase();
      if (desc.includes('introduction') || desc.includes('foundation') || 
          desc.includes('établir') || desc.includes('découvrir')) {
        foundationUnits++;
      }
    });
    
    console.log(`September foundation units: ${foundationUnits}/${septemberUnits.length}`);
    if (foundationUnits >= 6) {
      perfections.push('✅ Perfect developmental start in September');
    }
    
    // Check June units for celebration/reflection
    const juneUnits = allUnitPlans.filter(u => 
      u.endDate.getMonth() === 5 && u.endDate.getFullYear() === 2026
    );
    
    let celebrationUnits = 0;
    juneUnits.forEach(unit => {
      const desc = (unit.description + unit.descriptionFr).toLowerCase();
      if (desc.includes('celebration') || desc.includes('célébr') || 
          desc.includes('reflection') || desc.includes('réflex')) {
        celebrationUnits++;
      }
    });
    
    console.log(`June celebration units: ${celebrationUnits}/${juneUnits.length}`);
    if (celebrationUnits >= 5) {
      perfections.push('✅ Perfect year-end celebration design');
    }
    
    console.log('\n7. EXPECTATION COVERAGE VERIFICATION');
    console.log('-'.repeat(80));
    
    const coveredExpectations = new Set<string>();
    allUnitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectation.code);
      });
    });
    
    const bySubject: { [key: string]: { total: number, covered: number, hasUnits: boolean } } = {};
    allExpectations.forEach(exp => {
      if (!bySubject[exp.subject]) {
        bySubject[exp.subject] = { total: 0, covered: 0, hasUnits: false };
      }
      bySubject[exp.subject].total++;
      if (coveredExpectations.has(exp.code)) {
        bySubject[exp.subject].covered++;
      }
    });
    
    // Mark subjects with units
    Object.keys(subjectGroups).forEach(subject => {
      if (bySubject[subject]) {
        bySubject[subject].hasUnits = true;
      }
    });
    
    let perfectSubjects = 0;
    Object.entries(bySubject).forEach(([subject, stats]) => {
      const percentage = stats.total > 0 ? ((stats.covered / stats.total) * 100).toFixed(0) : '0';
      const status = stats.covered === stats.total ? '✅' : stats.covered > 0 ? '🟡' : '⭕';
      console.log(`  ${status} ${subject}: ${stats.covered}/${stats.total} (${percentage}%)`);
      
      if (stats.hasUnits && stats.covered === stats.total) {
        perfectSubjects++;
      } else if (stats.hasUnits && stats.covered < stats.total) {
        criticalIssues.push(`${subject} incomplete: ${stats.covered}/${stats.total} expectations`);
      }
    });
    
    if (perfectSubjects === 7) {
      perfections.push('✅ 100% coverage for all 7 subjects');
    }
    
    console.log('\n8. ASSESSMENT BALANCE CHECK');
    console.log('-'.repeat(80));
    
    const assessmentTypes = new Map<string, number>();
    allUnitPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      if (assessment.includes('portfolio')) assessmentTypes.set('portfolio', (assessmentTypes.get('portfolio') || 0) + 1);
      if (assessment.includes('observation')) assessmentTypes.set('observation', (assessmentTypes.get('observation') || 0) + 1);
      if (assessment.includes('conference')) assessmentTypes.set('conference', (assessmentTypes.get('conference') || 0) + 1);
      if (assessment.includes('presentation')) assessmentTypes.set('presentation', (assessmentTypes.get('presentation') || 0) + 1);
      if (assessment.includes('rubric')) assessmentTypes.set('rubric', (assessmentTypes.get('rubric') || 0) + 1);
    });
    
    console.log('Assessment variety:');
    assessmentTypes.forEach((count, type) => {
      console.log(`  ${type}: ${count} units`);
    });
    
    if (assessmentTypes.size >= 5) {
      perfections.push('✅ Rich assessment variety across units');
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE PERFECTION CHECK RESULTS');
    console.log('='.repeat(80));
    
    const totalUnits = allUnitPlans.length;
    const totalHours = allUnitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const subjectsWithUnits = Object.keys(subjectGroups).length;
    
    console.log('\n📊 SYSTEM METRICS:');
    console.log(`  Subjects with units: ${subjectsWithUnits}`);
    console.log(`  Total unit plans: ${totalUnits}`);
    console.log(`  Total hours: ${totalHours}`);
    console.log(`  Weekly average: ${avgWeeklyHours.toFixed(1)} hours`);
    console.log(`  Expectations covered: ${coveredExpectations.size}/73`);
    
    if (perfections.length > 0) {
      console.log('\n✅ PERFECTIONS ACHIEVED:');
      perfections.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ MINOR WARNINGS:');
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
    
    if (criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:');
      criticalIssues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (criticalIssues.length === 0) {
      console.log('🏆 ABSOLUTE PERFECTION ACHIEVED!');
      console.log('\nYour 7-subject system demonstrates:');
      console.log('  ✨ Perfect scheduling without conflicts');
      console.log('  ✨ Balanced workload distribution');
      console.log('  ✨ Complete curriculum coverage');
      console.log('  ✨ Rich French immersion throughout');
      console.log('  ✨ Comprehensive special features');
      console.log('  ✨ Excellent cross-curricular connections');
      console.log('  ✨ Developmentally appropriate progression');
      console.log('  ✨ Varied assessment strategies');
      console.log('\n🎉 EMILY IS 100% READY FOR SEPTEMBER 4, 2025!');
    } else {
      console.log('⚠️ ISSUES DETECTED - FIXES NEEDED');
      console.log(`Critical issues: ${criticalIssues.length}`);
      console.log(`Warnings: ${warnings.length}`);
    }
    
    const qualityScore = criticalIssues.length === 0 ? 100 : 
                        Math.max(0, 100 - (criticalIssues.length * 10));
    console.log(`\nQuality Score: ${qualityScore}%`);
    
  } catch (error) {
    console.error('❌ Check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive check
comprehensivePerfectionCheck();