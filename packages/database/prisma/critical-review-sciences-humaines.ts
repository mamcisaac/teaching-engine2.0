#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewSciencesHumaines() {
  console.log('\n🔍 CRITICAL REVIEW: Sciences humaines Unit Plans');
  console.log('='.repeat(60));
  console.log('Purpose: Ensure ABSOLUTE PERFECTION for Emily\n');
  
  const issues: string[] = [];
  const perfections: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily not found!');
      return;
    }
    
    // Get Sciences humaines unit plans
    const socialStudiesPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences humaines'
        }
      },
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
    
    console.log('1. UNIT PLAN EXISTENCE CHECK');
    console.log('-'.repeat(60));
    
    if (socialStudiesPlans.length === 0) {
      issues.push('No Sciences humaines unit plans found!');
      console.log('❌ No unit plans found');
      return;
    }
    
    console.log(`✅ Found ${socialStudiesPlans.length} unit plans`);
    perfections.push(`${socialStudiesPlans.length} unit plans created`);
    
    console.log('\n2. DATE ALIGNMENT ANALYSIS');
    console.log('-'.repeat(60));
    
    // Check if dates align with school calendar
    const firstUnit = socialStudiesPlans[0];
    const lastUnit = socialStudiesPlans[socialStudiesPlans.length - 1];
    
    const expectedStartDate = '2025-09-04';
    const expectedEndDate = '2026-06-25';
    
    const actualStartDate = firstUnit.startDate.toISOString().split('T')[0];
    const actualEndDate = lastUnit.endDate.toISOString().split('T')[0];
    
    console.log(`First unit starts: ${actualStartDate}`);
    console.log(`Expected first day: ${expectedStartDate}`);
    console.log(`Last unit ends: ${actualEndDate}`);
    console.log(`Expected last day: ${expectedEndDate}`);
    
    if (actualStartDate !== expectedStartDate) {
      issues.push(`First unit starts ${actualStartDate}, should start ${expectedStartDate}`);
    } else {
      perfections.push('First unit starts on correct date');
    }
    
    if (actualEndDate !== expectedEndDate) {
      issues.push(`Last unit ends ${actualEndDate}, should end ${expectedEndDate}`);
    } else {
      perfections.push('Last unit ends on correct date');
    }
    
    // Check for gaps or overlaps
    console.log('\nUnit progression check:');
    for (let i = 0; i < socialStudiesPlans.length - 1; i++) {
      const current = socialStudiesPlans[i];
      const next = socialStudiesPlans[i + 1];
      
      const currentEnd = current.endDate;
      const nextStart = next.startDate;
      const gap = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`  ${current.titleFr} → ${next.titleFr}: ${gap} day gap`);
      
      if (gap < 0) {
        issues.push(`Overlap between ${current.titleFr} and ${next.titleFr}`);
      } else if (gap > 10 && gap < 60) { // Reasonable gaps allowed for breaks
        issues.push(`Large gap (${gap} days) between ${current.titleFr} and ${next.titleFr}`);
      }
    }
    
    console.log('\n3. EXPECTATION COVERAGE VERIFICATION');
    console.log('-'.repeat(60));
    
    // Get all Social Studies expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences humaines',
        grade: 1
      }
    });
    
    console.log(`Total Social Studies expectations: ${allExpectations.length}`);
    
    // Check coverage
    const coveredExpectations = new Set<string>();
    socialStudiesPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectation.code);
      });
    });
    
    console.log(`Expectations covered: ${coveredExpectations.size}/${allExpectations.length}`);
    
    if (coveredExpectations.size !== allExpectations.length) {
      const uncovered = allExpectations.filter(e => !coveredExpectations.has(e.code));
      issues.push(`${uncovered.length} expectations not covered: ${uncovered.map(e => e.code).join(', ')}`);
    } else {
      perfections.push('All Social Studies expectations covered');
    }
    
    // Check for over-coverage
    const expectationUsage: { [key: string]: number } = {};
    socialStudiesPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        const code = ue.expectation.code;
        expectationUsage[code] = (expectationUsage[code] || 0) + 1;
      });
    });
    
    Object.entries(expectationUsage).forEach(([code, count]) => {
      if (count > 2) {
        console.log(`⚠️ ${code} used ${count} times (might be excessive)`);
      }
    });
    
    console.log('\n4. INSTRUCTIONAL HOURS ANALYSIS');
    console.log('-'.repeat(60));
    
    const totalHours = socialStudiesPlans.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const weeklyAverage = (totalHours / 42).toFixed(1);
    
    console.log(`Total instructional hours: ${totalHours}`);
    console.log(`Weekly average: ${weeklyAverage} hours`);
    
    // Check if hours are reasonable for Social Studies
    if (totalHours < 80) {
      issues.push(`Social Studies hours too low: ${totalHours} (recommend 80-150)`);
    } else if (totalHours > 150) {
      issues.push(`Social Studies hours too high: ${totalHours} (recommend 80-150)`);
    } else {
      perfections.push('Appropriate instructional hours allocated');
    }
    
    // Check individual unit hours
    socialStudiesPlans.forEach(unit => {
      const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const hoursPerWeek = (unit.estimatedHours || 0) / weeks;
      
      console.log(`  ${unit.titleFr}: ${unit.estimatedHours} hrs over ${weeks} weeks (${hoursPerWeek.toFixed(1)} hrs/week)`);
      
      if (hoursPerWeek > 5) {
        issues.push(`${unit.titleFr} has excessive weekly hours: ${hoursPerWeek.toFixed(1)}`);
      }
    });
    
    console.log('\n5. CONTENT QUALITY CHECK');
    console.log('-'.repeat(60));
    
    // Check for Grade 1 inappropriate content
    const complexWords = ['analyze', 'synthesize', 'evaluate', 'abstract', 'theoretical', 'hypothesis'];
    let contentIssues = 0;
    
    socialStudiesPlans.forEach(unit => {
      const content = `${unit.description} ${unit.bigIdeas} ${unit.assessmentPlan}`;
      complexWords.forEach(word => {
        if (content.toLowerCase().includes(word)) {
          console.log(`⚠️ Complex word "${word}" found in ${unit.titleFr}`);
          contentIssues++;
        }
      });
    });
    
    if (contentIssues > 0) {
      issues.push(`${contentIssues} instances of complex language found`);
    } else {
      perfections.push('All content is Grade 1 appropriate');
    }
    
    console.log('\n6. FRENCH IMMERSION QUALITY');
    console.log('-'.repeat(60));
    
    let frenchIssues = 0;
    socialStudiesPlans.forEach(unit => {
      if (!unit.titleFr || unit.titleFr === unit.title) {
        console.log(`❌ ${unit.title} missing French title`);
        frenchIssues++;
      }
      if (!unit.descriptionFr || unit.descriptionFr === unit.description) {
        console.log(`❌ ${unit.title} missing French description`);
        frenchIssues++;
      }
      if (!unit.bigIdeasFr || unit.bigIdeasFr === unit.bigIdeas) {
        console.log(`❌ ${unit.title} missing French big ideas`);
        frenchIssues++;
      }
    });
    
    if (frenchIssues > 0) {
      issues.push(`${frenchIssues} French immersion quality issues`);
    } else {
      perfections.push('Complete French immersion support');
    }
    
    console.log('\n7. METADATA COMPLETENESS CHECK');
    console.log('-'.repeat(60));
    
    let metadataIssues = 0;
    socialStudiesPlans.forEach(unit => {
      const required = [
        'essentialQuestions', 'successCriteria', 'differentiationStrategies',
        'indigenousPerspectives', 'environmentalEducation', 'communityConnections',
        'parentCommunicationPlan', 'technologyIntegration', 'socialJusticeConnections'
      ];
      
      required.forEach(field => {
        const value = (unit as any)[field];
        if (!value || (typeof value === 'string' && value.length < 10)) {
          console.log(`⚠️ ${unit.titleFr} has weak ${field}`);
          metadataIssues++;
        }
      });
    });
    
    if (metadataIssues > 0) {
      issues.push(`${metadataIssues} metadata quality issues`);
    } else {
      perfections.push('All metadata is comprehensive');
    }
    
    console.log('\n8. ASSESSMENT QUALITY REVIEW');
    console.log('-'.repeat(60));
    
    // Check for varied assessment strategies
    const assessmentTypes = new Set<string>();
    socialStudiesPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      if (assessment.includes('portfolio')) assessmentTypes.add('portfolio');
      if (assessment.includes('presentation')) assessmentTypes.add('presentation');
      if (assessment.includes('observation')) assessmentTypes.add('observation');
      if (assessment.includes('demonstration')) assessmentTypes.add('demonstration');
      if (assessment.includes('rubric')) assessmentTypes.add('rubric');
    });
    
    console.log(`Assessment variety: ${Array.from(assessmentTypes).join(', ')}`);
    
    if (assessmentTypes.size < 3) {
      issues.push('Limited assessment variety across units');
    } else {
      perfections.push('Good variety in assessment strategies');
    }
    
    console.log('\n9. SOCIAL STUDIES SPECIFIC QUALITY');
    console.log('-'.repeat(60));
    
    // Check for key Social Studies concepts
    const socialStudiesConcepts = ['citizenship', 'community', 'diversity', 'rights', 'responsibilities', 'geography', 'history', 'culture'];
    const conceptsCovered = new Set<string>();
    
    socialStudiesPlans.forEach(unit => {
      const content = `${unit.description} ${unit.bigIdeas} ${unit.keyVocabulary}`.toLowerCase();
      socialStudiesConcepts.forEach(concept => {
        if (content.includes(concept) || content.includes(concept.slice(0, -1))) { // singular form
          conceptsCovered.add(concept);
        }
      });
    });
    
    console.log(`Key concepts covered: ${Array.from(conceptsCovered).join(', ')}`);
    
    if (conceptsCovered.size < 6) {
      issues.push(`Only ${conceptsCovered.size}/8 key Social Studies concepts covered`);
    } else {
      perfections.push('Excellent coverage of Social Studies concepts');
    }
    
    console.log('\n10. CALENDAR CONFLICT CHECK');
    console.log('-'.repeat(60));
    
    // Check for conflicts with known breaks/holidays
    const winterBreakStart = new Date('2025-12-20');
    const winterBreakEnd = new Date('2026-01-04');
    const marchBreakStart = new Date('2026-03-16');
    const marchBreakEnd = new Date('2026-03-20');
    
    let calendarIssues = 0;
    socialStudiesPlans.forEach(unit => {
      // Check if unit starts or ends during breaks
      if ((unit.startDate >= winterBreakStart && unit.startDate <= winterBreakEnd) ||
          (unit.endDate >= winterBreakStart && unit.endDate <= winterBreakEnd)) {
        if (!(unit.startDate < winterBreakStart && unit.endDate > winterBreakEnd)) {
          console.log(`⚠️ ${unit.titleFr} conflicts with winter break`);
          calendarIssues++;
        }
      }
      
      if ((unit.startDate >= marchBreakStart && unit.startDate <= marchBreakEnd) ||
          (unit.endDate >= marchBreakStart && unit.endDate <= marchBreakEnd)) {
        console.log(`⚠️ ${unit.titleFr} conflicts with March break`);
        calendarIssues++;
      }
    });
    
    if (calendarIssues > 0) {
      issues.push(`${calendarIssues} calendar conflicts found`);
    } else {
      perfections.push('Perfect calendar alignment');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('CRITICAL REVIEW SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ PERFECTIONS:');
    perfections.forEach(p => console.log(`  • ${p}`));
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(i => console.log(`  • ${i}`));
      
      console.log('\n⚠️ STATUS: NEEDS IMPROVEMENT');
      console.log('Please address the issues above for perfection.');
    } else {
      console.log('\n🏆 STATUS: ABSOLUTE PERFECTION!');
      console.log('\nThe Sciences humaines unit plans are PERFECT!');
      console.log('✨ All expectations covered');
      console.log('✨ Perfect calendar alignment');
      console.log('✨ Age-appropriate content');
      console.log('✨ Complete French support');
      console.log('✨ Rich metadata and assessments');
      console.log('✨ Ready for September 4, 2025!');
    }
    
    console.log('\n📊 QUALITY METRICS:');
    console.log(`  Unit plans reviewed: ${socialStudiesPlans.length}`);
    console.log(`  Issues found: ${issues.length}`);
    console.log(`  Perfections identified: ${perfections.length}`);
    console.log(`  Quality score: ${perfections.length}/${perfections.length + issues.length}`);
    
  } catch (error) {
    console.error('❌ Critical review error:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Critical review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(60) + '\n');
}

// Run the critical review
criticalReviewSciencesHumaines();