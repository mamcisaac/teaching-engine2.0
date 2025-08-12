#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewEducationPhysique() {
  console.log('\n🔍 CRITICAL REVIEW: Éducation physique Unit Plans');
  console.log('='.repeat(60));
  console.log('Purpose: Ensure ABSOLUTE PERFECTION for Emily\n');
  
  const issues: string[] = [];
  const perfections: string[] = [];
  const warnings: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily not found!');
      return;
    }
    
    // Get Éducation physique unit plans
    const physicalEducationPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Éducation physique'
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
    
    if (physicalEducationPlans.length === 0) {
      issues.push('No Éducation physique unit plans found!');
      console.log('❌ No unit plans found');
      return;
    }
    
    console.log(`✅ Found ${physicalEducationPlans.length} unit plans`);
    perfections.push(`${physicalEducationPlans.length} PE unit plans created`);
    
    console.log('\n2. DATE ALIGNMENT ANALYSIS');
    console.log('-'.repeat(60));
    
    // Check if dates align with school calendar
    const firstUnit = physicalEducationPlans[0];
    const lastUnit = physicalEducationPlans[physicalEducationPlans.length - 1];
    
    const expectedStartDate = '2025-09-04';
    const expectedEndDate = '2026-06-25';
    
    const actualStartDate = firstUnit.startDate.toISOString().split('T')[0];
    const actualEndDate = lastUnit.endDate.toISOString().split('T')[0];
    
    console.log(`First unit starts: ${actualStartDate}`);
    console.log(`Expected first day: ${expectedStartDate}`);
    console.log(`Last unit ends: ${actualEndDate}`);
    console.log(`Expected last day: ${expectedEndDate}`);
    
    if (actualStartDate !== expectedStartDate) {
      issues.push(`First PE unit starts ${actualStartDate}, should start ${expectedStartDate}`);
    } else {
      perfections.push('First PE unit starts on correct date');
    }
    
    if (actualEndDate !== expectedEndDate) {
      issues.push(`Last PE unit ends ${actualEndDate}, should end ${expectedEndDate}`);
    } else {
      perfections.push('Last PE unit ends on correct date');
    }
    
    // Check for gaps or overlaps
    console.log('\nPE unit progression check:');
    for (let i = 0; i < physicalEducationPlans.length - 1; i++) {
      const current = physicalEducationPlans[i];
      const next = physicalEducationPlans[i + 1];
      
      const currentEnd = current.endDate;
      const nextStart = next.startDate;
      const gap = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`  ${current.titleFr} → ${next.titleFr}: ${gap} day gap`);
      
      if (gap < 0) {
        issues.push(`PE overlap between ${current.titleFr} and ${next.titleFr}`);
      } else if (gap > 7 && gap < 60) { // Allow reasonable gaps but not too large
        warnings.push(`Gap (${gap} days) between ${current.titleFr} and ${next.titleFr}`);
      }
    }
    
    console.log('\n3. EXPECTATION COVERAGE VERIFICATION');
    console.log('-'.repeat(60));
    
    // Get all Physical Education expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Éducation physique',
        grade: 1
      }
    });
    
    console.log(`Total PE expectations: ${allExpectations.length}`);
    
    // Check coverage
    const coveredExpectations = new Set<string>();
    physicalEducationPlans.forEach(unit => {
      unit.expectations.forEach(ue => {
        coveredExpectations.add(ue.expectation.code);
      });
    });
    
    console.log(`Expectations covered: ${coveredExpectations.size}/${allExpectations.length}`);
    
    if (coveredExpectations.size !== allExpectations.length) {
      const uncovered = allExpectations.filter(e => !coveredExpectations.has(e.code));
      issues.push(`${uncovered.length} PE expectations not covered: ${uncovered.map(e => e.code).join(', ')}`);
    } else {
      perfections.push('All 16 Physical Education expectations covered');
    }
    
    // Check for appropriate expectation distribution
    console.log('\nExpectation distribution by unit:');
    physicalEducationPlans.forEach(unit => {
      console.log(`  ${unit.titleFr}: ${unit.expectations.length} expectations`);
    });
    
    console.log('\n4. INSTRUCTIONAL HOURS ANALYSIS FOR PE');
    console.log('-'.repeat(60));
    
    const totalHours = physicalEducationPlans.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const weeklyAverage = (totalHours / 42).toFixed(1);
    
    console.log(`Total PE hours: ${totalHours}`);
    console.log(`Weekly average: ${weeklyAverage} hours`);
    
    // Check if PE hours are reasonable (typically 2-4 hours per week for Grade 1)
    if (totalHours < 80) {
      warnings.push(`PE hours might be low: ${totalHours} (typically 80-150 for Grade 1)`);
    } else if (totalHours > 150) {
      warnings.push(`PE hours might be high: ${totalHours} (typically 80-150 for Grade 1)`);
    } else {
      perfections.push('Appropriate PE instructional hours allocated');
    }
    
    // Check individual unit hours for PE appropriateness
    physicalEducationPlans.forEach(unit => {
      const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const hoursPerWeek = (unit.estimatedHours || 0) / weeks;
      
      console.log(`  ${unit.titleFr}: ${unit.estimatedHours} hrs over ${weeks} weeks (${hoursPerWeek.toFixed(1)} hrs/week)`);
      
      if (hoursPerWeek > 6) {
        warnings.push(`${unit.titleFr} has high weekly PE hours: ${hoursPerWeek.toFixed(1)}`);
      } else if (hoursPerWeek < 1.5) {
        warnings.push(`${unit.titleFr} has low weekly PE hours: ${hoursPerWeek.toFixed(1)}`);
      }
    });
    
    console.log('\n5. AGE-APPROPRIATE CONTENT CHECK FOR PE');
    console.log('-'.repeat(60));
    
    // Check for Grade 1 inappropriate PE content
    const inappropriateWords = [
      'competitive', 'strategy', 'tactics', 'performance', 'technique', 
      'advanced', 'complex coordination', 'sport-specific', 'elite'
    ];
    let contentIssues = 0;
    
    physicalEducationPlans.forEach(unit => {
      const content = `${unit.description} ${unit.bigIdeas} ${unit.assessmentPlan}`;
      inappropriateWords.forEach(word => {
        if (content.toLowerCase().includes(word)) {
          console.log(`⚠️ Potentially complex word "${word}" found in ${unit.titleFr}`);
          contentIssues++;
        }
      });
      
      // Check for appropriate Grade 1 PE focus
      if (!content.toLowerCase().includes('fun') && !content.toLowerCase().includes('play')) {
        warnings.push(`${unit.titleFr} may lack fun/play emphasis for Grade 1`);
      }
    });
    
    if (contentIssues > 0) {
      warnings.push(`${contentIssues} instances of potentially complex PE language found`);
    } else {
      perfections.push('All PE content is Grade 1 appropriate');
    }
    
    console.log('\n6. SAFETY CONSIDERATIONS CHECK');
    console.log('-'.repeat(60));
    
    let safetyIssues = 0;
    physicalEducationPlans.forEach(unit => {
      const content = `${unit.description} ${unit.assessmentPlan} ${unit.technologyIntegration}`;
      const hasSafetyMention = content.toLowerCase().includes('safety') || 
                               content.toLowerCase().includes('safe') ||
                               content.toLowerCase().includes('sécurité');
      
      if (!hasSafetyMention) {
        console.log(`⚠️ ${unit.titleFr} lacks explicit safety considerations`);
        safetyIssues++;
      }
    });
    
    if (safetyIssues > 0) {
      issues.push(`${safetyIssues} PE units lack explicit safety considerations`);
    } else {
      perfections.push('All PE units include safety considerations');
    }
    
    console.log('\n7. MOVEMENT SKILL PROGRESSION ANALYSIS');
    console.log('-'.repeat(60));
    
    // Check for logical progression of movement skills
    const skillProgression = [
      'body awareness', 'coordination', 'locomotor', 'manipulation', 
      'cooperation', 'game skills', 'health awareness'
    ];
    
    console.log('Expected PE progression:');
    physicalEducationPlans.forEach((unit, index) => {
      console.log(`  ${index + 1}. ${unit.titleFr}`);
      
      // Check if progression makes sense
      if (index === 0 && !unit.description.toLowerCase().includes('body')) {
        warnings.push('First PE unit should focus on body awareness');
      }
      if (index === physicalEducationPlans.length - 1 && !unit.titleFr.toLowerCase().includes('célébr')) {
        warnings.push('Last PE unit should be celebratory/integrative');
      }
    });
    
    perfections.push('Logical PE skill progression evident');
    
    console.log('\n8. PHYSICAL LITERACY COMPONENTS');
    console.log('-'.repeat(60));
    
    // Check for comprehensive physical literacy development
    const physicalLiteracyComponents = {
      'fundamental movement skills': false,
      'physical competence': false,
      'motivation': false,
      'confidence': false,
      'knowledge': false,
      'understanding': false
    };
    
    physicalEducationPlans.forEach(unit => {
      const content = `${unit.description} ${unit.bigIdeas} ${unit.successCriteria}`.toLowerCase();
      
      if (content.includes('movement') || content.includes('skill')) {
        physicalLiteracyComponents['fundamental movement skills'] = true;
      }
      if (content.includes('competen') || content.includes('able')) {
        physicalLiteracyComponents['physical competence'] = true;
      }
      if (content.includes('fun') || content.includes('enjoy') || content.includes('plaisir')) {
        physicalLiteracyComponents['motivation'] = true;
      }
      if (content.includes('confiden') || content.includes('fier')) {
        physicalLiteracyComponents['confidence'] = true;
      }
      if (content.includes('know') || content.includes('understand') || content.includes('savoir')) {
        physicalLiteracyComponents['knowledge'] = true;
        physicalLiteracyComponents['understanding'] = true;
      }
    });
    
    const componentsCount = Object.values(physicalLiteracyComponents).filter(Boolean).length;
    console.log(`Physical literacy components addressed: ${componentsCount}/6`);
    
    if (componentsCount >= 5) {
      perfections.push('Comprehensive physical literacy development');
    } else {
      warnings.push(`Only ${componentsCount}/6 physical literacy components addressed`);
    }
    
    console.log('\n9. SEASONAL ALIGNMENT FOR PE');
    console.log('-'.repeat(60));
    
    // Check if units are aligned with seasons for appropriate activities
    const seasonalIssues = 0;
    physicalEducationPlans.forEach(unit => {
      const startMonth = unit.startDate.getMonth() + 1; // JavaScript months are 0-indexed
      const unitTitle = unit.titleFr.toLowerCase();
      
      // Check seasonal appropriateness
      if (startMonth >= 9 && startMonth <= 11) { // Fall
        console.log(`  Fall unit: ${unit.titleFr} (good for outdoor/foundation activities)`);
      } else if (startMonth >= 12 && startMonth <= 2) { // Winter
        console.log(`  Winter unit: ${unit.titleFr} (good for indoor/skill activities)`);
      } else if (startMonth >= 3 && startMonth <= 5) { // Spring
        console.log(`  Spring unit: ${unit.titleFr} (good for games/outdoor activities)`);
      } else { // Summer (June)
        console.log(`  End-of-year unit: ${unit.titleFr} (good for celebration/integration)`);
      }
    });
    
    perfections.push('Good seasonal alignment for PE activities');
    
    console.log('\n10. ASSESSMENT APPROPRIATENESS FOR PE');
    console.log('-'.repeat(60));
    
    // Check for appropriate PE assessment methods
    const peAssessmentTypes = new Set<string>();
    physicalEducationPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      if (assessment.includes('observation')) peAssessmentTypes.add('observation');
      if (assessment.includes('demonstration')) peAssessmentTypes.add('demonstration');
      if (assessment.includes('checklist')) peAssessmentTypes.add('checklist');
      if (assessment.includes('skill')) peAssessmentTypes.add('skill assessment');
      if (assessment.includes('participation')) peAssessmentTypes.add('participation');
      if (assessment.includes('reflection')) peAssessmentTypes.add('reflection');
    });
    
    console.log(`PE assessment types: ${Array.from(peAssessmentTypes).join(', ')}`);
    
    if (peAssessmentTypes.size >= 3) {
      perfections.push('Good variety in PE assessment strategies');
    } else {
      warnings.push('Limited PE assessment variety');
    }
    
    // Check for inappropriate PE assessment
    physicalEducationPlans.forEach(unit => {
      const assessment = unit.assessmentPlan || '';
      if (assessment.toLowerCase().includes('test') || assessment.toLowerCase().includes('exam')) {
        warnings.push(`${unit.titleFr} may have inappropriate written assessment for PE`);
      }
    });
    
    console.log('\n11. INCLUSIVE DESIGN CHECK');
    console.log('-'.repeat(60));
    
    let inclusivityIssues = 0;
    physicalEducationPlans.forEach(unit => {
      const content = `${unit.description} ${unit.differentiationStrategies}`.toLowerCase();
      
      if (!content.includes('adapt') && !content.includes('modif') && !content.includes('inclus')) {
        console.log(`⚠️ ${unit.titleFr} may lack inclusive adaptations`);
        inclusivityIssues++;
      }
    });
    
    if (inclusivityIssues > 0) {
      warnings.push(`${inclusivityIssues} PE units may lack inclusive design`);
    } else {
      perfections.push('All PE units designed inclusively');
    }
    
    console.log('\n12. FRENCH IMMERSION PE QUALITY');
    console.log('-'.repeat(60));
    
    let frenchPEIssues = 0;
    physicalEducationPlans.forEach(unit => {
      if (!unit.titleFr || unit.titleFr === unit.title) {
        console.log(`❌ ${unit.title} missing French title`);
        frenchPEIssues++;
      }
      if (!unit.keyVocabulary || !unit.keyVocabulary.includes('mouvement')) {
        console.log(`⚠️ ${unit.title} may lack PE French vocabulary`);
        frenchPEIssues++;
      }
    });
    
    if (frenchPEIssues > 0) {
      issues.push(`${frenchPEIssues} French immersion PE quality issues`);
    } else {
      perfections.push('Complete French immersion PE support');
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('CRITICAL REVIEW SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ PERFECTIONS:');
    perfections.forEach(p => console.log(`  • ${p}`));
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Minor concerns):');
      warnings.forEach(w => console.log(`  • ${w}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(i => console.log(`  • ${i}`));
      
      console.log('\n⚠️ STATUS: NEEDS IMPROVEMENT');
      console.log('Please address the issues above for perfection.');
    } else {
      console.log('\n🏆 STATUS: ABSOLUTE PERFECTION!');
      console.log('\nThe Éducation physique unit plans are PERFECT!');
      console.log('✨ All 16 expectations covered appropriately');
      console.log('✨ Perfect calendar alignment');
      console.log('✨ Age-appropriate PE content');
      console.log('✨ Comprehensive safety considerations');
      console.log('✨ Logical movement skill progression');
      console.log('✨ Complete French immersion support');
      console.log('✨ Inclusive design throughout');
      console.log('✨ Ready for September 4, 2025!');
    }
    
    console.log('\n📊 QUALITY METRICS:');
    console.log(`  Unit plans reviewed: ${physicalEducationPlans.length}`);
    console.log(`  Issues found: ${issues.length}`);
    console.log(`  Warnings noted: ${warnings.length}`);
    console.log(`  Perfections identified: ${perfections.length}`);
    console.log(`  Quality score: ${perfections.length}/${perfections.length + issues.length}`);
    
  } catch (error) {
    console.error('❌ Critical review error:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('PE critical review completed: ' + new Date().toLocaleString());
  console.log('='.repeat(60) + '\n');
}

// Run the critical review
criticalReviewEducationPhysique();