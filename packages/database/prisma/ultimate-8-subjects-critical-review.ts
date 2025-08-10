#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultimate8SubjectsCriticalReview() {
  console.log('\n🔬 ULTIMATE CRITICAL REVIEW - ALL 8 SUBJECTS');
  console.log('='.repeat(80));
  console.log('Purpose: Find ANY imperfections in the complete system');
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
    
    // Get ALL unit plans
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
    
    console.log('1. MUSIC UNIT PLANS QUALITY CHECK');
    console.log('-'.repeat(80));
    
    const musicUnits = allUnitPlans.filter(u => u.longRangePlan.subject === 'Music');
    console.log(`Music units found: ${musicUnits.length}`);
    
    // Check Music expectations coverage
    const musicExpectations = allExpectations.filter(e => e.subject === 'Music');
    const coveredMusicCodes = new Set<string>();
    
    musicUnits.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredMusicCodes.add(ue.expectation.code);
      });
      
      // Check quality of each Music unit
      if (!unit.titleFr || unit.titleFr === unit.title) {
        criticalIssues.push(`Music unit "${unit.title}" missing French title`);
      }
      if (!unit.bigIdeasFr) {
        criticalIssues.push(`Music unit "${unit.title}" missing French big ideas`);
      }
      if (!unit.keyVocabulary || JSON.parse(unit.keyVocabulary).length < 8) {
        warnings.push(`Music unit "${unit.title}" has limited vocabulary`);
      }
    });
    
    console.log(`Music expectations covered: ${coveredMusicCodes.size}/${musicExpectations.length}`);
    musicExpectations.forEach(exp => {
      if (!coveredMusicCodes.has(exp.code)) {
        criticalIssues.push(`Music expectation ${exp.code} not covered`);
      }
    });
    
    if (coveredMusicCodes.size === musicExpectations.length) {
      perfections.push('✅ All 8 Music expectations covered');
    }
    
    console.log('\n2. COMPLETE SYSTEM OVERVIEW');
    console.log('-'.repeat(80));
    
    const subjectStats: { [key: string]: { units: number, hours: number, expectations: number } } = {};
    
    allUnitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { units: 0, hours: 0, expectations: 0 };
      }
      subjectStats[subject].units++;
      subjectStats[subject].hours += unit.estimatedHours || 0;
      subjectStats[subject].expectations = unit.expectations.length;
    });
    
    let totalUnits = 0;
    let totalHours = 0;
    
    console.log('Subject Summary:');
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      console.log(`  ${subject}: ${stats.units} units, ${stats.hours} hours`);
      totalUnits += stats.units;
      totalHours += stats.hours;
    });
    
    console.log(`\nTOTAL: ${totalUnits} units, ${totalHours} hours`);
    console.log(`Weekly average: ${(totalHours / 42).toFixed(1)} hours`);
    
    if (totalUnits !== 53) {
      criticalIssues.push(`Expected 53 units, found ${totalUnits}`);
    } else {
      perfections.push('✅ Perfect unit count: 53 units');
    }
    
    console.log('\n3. SCHEDULING CONFLICTS CHECK');
    console.log('-'.repeat(80));
    
    // Check for overlaps within each subject
    const subjectGroups: { [key: string]: typeof allUnitPlans } = {};
    allUnitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectGroups[subject]) subjectGroups[subject] = [];
      subjectGroups[subject].push(unit);
    });
    
    let overlapCount = 0;
    Object.entries(subjectGroups).forEach(([subject, units]) => {
      units.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      for (let i = 0; i < units.length - 1; i++) {
        const current = units[i];
        const next = units[i + 1];
        
        if (current.endDate >= next.startDate) {
          criticalIssues.push(`OVERLAP in ${subject}: "${current.titleFr}" overlaps "${next.titleFr}"`);
          overlapCount++;
        }
      }
    });
    
    if (overlapCount === 0) {
      perfections.push('✅ No scheduling conflicts detected');
    }
    
    console.log('\n4. WORKLOAD DISTRIBUTION ANALYSIS');
    console.log('-'.repeat(80));
    
    // More accurate monthly calculation
    const monthlyHours: { [key: string]: number } = {};
    const monthlySubjects: { [key: string]: Set<string> } = {};
    
    allUnitPlans.forEach(unit => {
      const start = new Date(unit.startDate);
      const end = new Date(unit.endDate);
      const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const weeklyHours = (unit.estimatedHours || 0) / weeks;
      
      const startMonth = start.toISOString().substring(0, 7);
      monthlyHours[startMonth] = (monthlyHours[startMonth] || 0) + weeklyHours;
      
      if (!monthlySubjects[startMonth]) {
        monthlySubjects[startMonth] = new Set();
      }
      monthlySubjects[startMonth].add(unit.longRangePlan.subject);
    });
    
    console.log('Monthly workload with all 8 subjects:');
    Object.entries(monthlyHours).sort().forEach(([month, hours]) => {
      const subjects = monthlySubjects[month] ? monthlySubjects[month].size : 0;
      console.log(`  ${month}: ${hours.toFixed(1)} hrs/week (${subjects} subjects starting)`);
      
      if (hours > 28) {
        warnings.push(`${month}: ${hours.toFixed(1)} hrs/week is very busy`);
      } else if (hours < 8 && month !== '2025-12' && month !== '2026-01') {
        warnings.push(`${month}: ${hours.toFixed(1)} hrs/week might be light`);
      }
    });
    
    const avgHours = totalHours / 42;
    if (avgHours >= 22 && avgHours <= 26) {
      perfections.push(`✅ Perfect weekly average: ${avgHours.toFixed(1)} hours`);
    }
    
    console.log('\n5. EXPECTATION COVERAGE VERIFICATION');
    console.log('-'.repeat(80));
    
    const coveredExpectations = new Set<string>();
    allUnitPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectation.code);
      });
    });
    
    const bySubject: { [key: string]: { total: number, covered: number } } = {};
    allExpectations.forEach(exp => {
      if (!bySubject[exp.subject]) {
        bySubject[exp.subject] = { total: 0, covered: 0 };
      }
      bySubject[exp.subject].total++;
      if (coveredExpectations.has(exp.code)) {
        bySubject[exp.subject].covered++;
      }
    });
    
    console.log('Coverage by subject:');
    let perfectCoverage = 0;
    Object.entries(bySubject).forEach(([subject, stats]) => {
      const percentage = ((stats.covered / stats.total) * 100).toFixed(0);
      const status = stats.covered === stats.total ? '✅' : '❌';
      console.log(`  ${status} ${subject}: ${stats.covered}/${stats.total} (${percentage}%)`);
      
      if (stats.covered === stats.total) {
        perfectCoverage++;
      } else if (stats.covered < stats.total) {
        criticalIssues.push(`${subject}: Missing ${stats.total - stats.covered} expectations`);
      }
    });
    
    if (perfectCoverage === 8) {
      perfections.push('✅ 100% coverage for all 8 subjects');
    }
    
    console.log(`\nTOTAL: ${coveredExpectations.size}/73 expectations covered`);
    
    console.log('\n6. SPECIAL FEATURES CONSISTENCY');
    console.log('-'.repeat(80));
    
    let missingFeatures = 0;
    allUnitPlans.forEach(unit => {
      const features = [
        'indigenousPerspectives',
        'environmentalEducation',
        'socialJusticeConnections',
        'parentCommunicationPlan',
        'technologyIntegration',
        'communityConnections'
      ];
      
      features.forEach(feature => {
        if (!unit[feature] || unit[feature].length < 20) {
          missingFeatures++;
          console.log(`  Missing ${feature} in ${unit.titleFr}`);
        }
      });
    });
    
    if (missingFeatures === 0) {
      perfections.push('✅ All special features in 100% of units');
    } else {
      criticalIssues.push(`${missingFeatures} special features missing`);
    }
    
    console.log('\n7. CROSS-CURRICULAR INTEGRATION');
    console.log('-'.repeat(80));
    
    let strongConnections = 0;
    let weakConnections = 0;
    
    allUnitPlans.forEach(unit => {
      const connections = unit.crossCurricularConnections || '';
      const connectionCount = connections.split(';').filter(c => c.trim()).length;
      
      if (connectionCount >= 3) {
        strongConnections++;
      } else if (connectionCount < 2) {
        weakConnections++;
        warnings.push(`Weak connections in ${unit.titleFr}`);
      }
    });
    
    console.log(`Strong cross-curricular connections: ${strongConnections}/${totalUnits}`);
    if (strongConnections >= 45) {
      perfections.push('✅ Excellent cross-curricular integration');
    }
    
    console.log('\n8. FRENCH IMMERSION QUALITY');
    console.log('-'.repeat(80));
    
    let frenchIssues = 0;
    allUnitPlans.forEach(unit => {
      if (!unit.titleFr || unit.titleFr === unit.title) {
        frenchIssues++;
        criticalIssues.push(`${unit.title} missing proper French title`);
      }
      if (!unit.bigIdeasFr || unit.bigIdeasFr === unit.bigIdeas) {
        frenchIssues++;
        criticalIssues.push(`${unit.title} missing French big ideas`);
      }
    });
    
    if (frenchIssues === 0) {
      perfections.push('✅ Perfect French immersion support');
    }
    
    console.log('\n9. ASSESSMENT VARIETY');
    console.log('-'.repeat(80));
    
    const assessmentTypes = new Set<string>();
    allUnitPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      ['portfolio', 'observation', 'rubric', 'conference', 'presentation', 'self-assessment', 'peer'].forEach(type => {
        if (assessment.toLowerCase().includes(type)) {
          assessmentTypes.add(type);
        }
      });
    });
    
    console.log(`Assessment types used: ${assessmentTypes.size}`);
    if (assessmentTypes.size >= 6) {
      perfections.push('✅ Rich assessment variety');
    }
    
    console.log('\n10. SEPTEMBER & JUNE ALIGNMENT');
    console.log('-'.repeat(80));
    
    const septemberUnits = allUnitPlans.filter(u => 
      u.startDate.getMonth() === 8 && u.startDate.getFullYear() === 2025
    );
    
    const juneUnits = allUnitPlans.filter(u => 
      u.endDate.getMonth() === 5 && u.endDate.getFullYear() === 2026
    );
    
    console.log(`September units: ${septemberUnits.length}`);
    console.log(`June units: ${juneUnits.length}`);
    
    if (septemberUnits.length === 10 && juneUnits.length >= 7) {
      perfections.push('✅ Perfect start and end alignment');
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('ULTIMATE CRITICAL REVIEW SUMMARY');
    console.log('='.repeat(80));
    
    if (perfections.length > 0) {
      console.log('\n✅ PERFECTIONS ACHIEVED:');
      perfections.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ MINOR WARNINGS:');
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
    
    if (criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      criticalIssues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }
    
    console.log('\n📊 FINAL METRICS:');
    console.log(`  Total subjects: 8`);
    console.log(`  Total units: ${totalUnits}`);
    console.log(`  Total hours: ${totalHours}`);
    console.log(`  Weekly average: ${(totalHours / 42).toFixed(1)} hours`);
    console.log(`  Expectations covered: ${coveredExpectations.size}/73`);
    console.log(`  Critical issues: ${criticalIssues.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    console.log(`  Perfections: ${perfections.length}`);
    
    const qualityScore = criticalIssues.length === 0 ? 100 : 
                        Math.max(0, 100 - (criticalIssues.length * 5));
    console.log(`  Quality score: ${qualityScore}%`);
    
    if (criticalIssues.length === 0 && coveredExpectations.size === 73) {
      console.log('\n' + '🏆'.repeat(20));
      console.log('\n✨ ABSOLUTE PERFECTION ACHIEVED! ✨');
      console.log('\nEmily\'s Teaching Engine 2.0 is PERFECT!');
      console.log('\n' + '🏆'.repeat(20));
    } else {
      console.log('\n⚠️ ISSUES NEED FIXING BEFORE PERFECTION');
    }
    
  } catch (error) {
    console.error('❌ Review error:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Critical review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(80) + '\n');
}

// Run the ultimate critical review
ultimate8SubjectsCriticalReview();