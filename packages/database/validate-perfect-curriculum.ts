#!/usr/bin/env tsx

/**
 * VALIDATE PERFECT CURRICULUM STRUCTURE
 * This script validates that the hierarchical curriculum structure is perfect and ready for lesson creation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateCurriculum() {
  console.log('🔍 VALIDATING PERFECT CURRICULUM STRUCTURE\n');
  console.log('='.repeat(70));
  
  const issues: string[] = [];
  const successes: string[] = [];
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // VALIDATE LONG RANGE PLANS
    console.log('📚 VALIDATING LONG RANGE PLANS...');
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        _count: {
          select: {
            unitPlans: true,
            expectations: true
          }
        }
      }
    });
    
    if (longRangePlans.length !== 8) {
      issues.push(`❌ Expected 8 long range plans, found ${longRangePlans.length}`);
    } else {
      successes.push('✅ All 8 subject long range plans exist');
    }
    
    longRangePlans.forEach(lrp => {
      console.log(`  ${lrp.subject}:`);
      console.log(`    • Units: ${lrp._count.unitPlans}`);
      console.log(`    • Expectations: ${lrp._count.expectations}`);
      console.log(`    • Has goals: ${lrp.goals ? 'Yes' : 'No'}`);
      console.log(`    • Has themes: ${lrp.themes ? 'Yes' : 'No'}`);
      console.log(`    • Has assessment: ${lrp.assessmentOverview ? 'Yes' : 'No'}`);
      
      if (!lrp.goals) issues.push(`❌ ${lrp.subject} missing essential questions`);
      if (!lrp.themes) issues.push(`❌ ${lrp.subject} missing big ideas`);
      if (!lrp.assessmentOverview) issues.push(`❌ ${lrp.subject} missing teaching strategies`);
    });
    
    // VALIDATE UNIT PLANS
    console.log('\n📋 VALIDATING UNIT PLANS...');
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        _count: {
          select: {
            lessonPlans: true,
            expectations: true,
            resources: true
          }
        }
      }
    });
    
    if (unitPlans.length !== 55) {
      issues.push(`❌ Expected 55 unit plans, found ${unitPlans.length}`);
    } else {
      successes.push('✅ All 55 unit plans exist');
    }
    
    // Group units by subject
    const unitsBySubject: Record<string, any[]> = {};
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    });
    
    // Expected units per subject
    const expectedUnits = {
      'Français langue première': 8,
      'Mathématiques': 8,
      'Sciences de la nature': 7,
      'Sciences humaines': 5,
      'Arts visuels': 6,
      'Formation personnelle et sociale': 6,
      'Éducation physique': 8,
      'Music': 7
    };
    
    Object.entries(expectedUnits).forEach(([subject, expected]) => {
      const actual = unitsBySubject[subject]?.length || 0;
      console.log(`  ${subject}: ${actual}/${expected} units`);
      if (actual !== expected) {
        issues.push(`❌ ${subject} has ${actual} units, expected ${expected}`);
      }
    });
    
    // Check unit timelines
    let unitsWithTimelines = 0;
    let totalEstimatedHours = 0;
    
    unitPlans.forEach(unit => {
      if (unit.startDate && unit.endDate) {
        unitsWithTimelines++;
      } else {
        issues.push(`❌ ${unit.title} missing timeline`);
      }
      
      if (unit.estimatedHours) {
        totalEstimatedHours += unit.estimatedHours;
      }
      
      if (!unit.assessmentPlan) {
        issues.push(`❌ ${unit.title} missing assessment plan`);
      }
      
      if (!unit.differentiationStrategies) {
        issues.push(`❌ ${unit.title} missing differentiation strategies`);
      }
    });
    
    console.log(`\n  Units with timelines: ${unitsWithTimelines}/${unitPlans.length}`);
    console.log(`  Total estimated hours: ${totalEstimatedHours}`);
    
    if (unitsWithTimelines === unitPlans.length) {
      successes.push('✅ All units have proper timelines');
    }
    
    // VALIDATE LESSON PLANS
    console.log('\n📝 VALIDATING LESSON PLANS...');
    const lessonCount = await prisma.eTFOLessonPlan.count();
    
    console.log(`  Current lesson plans: ${lessonCount}`);
    console.log(`  Required lesson plans: 830`);
    console.log(`  Gap: ${830 - lessonCount} lessons needed`);
    
    if (lessonCount === 0) {
      successes.push('✅ Clean slate - ready for lesson creation');
    } else {
      issues.push(`⚠️ ${lessonCount} lesson plans exist - should be 0 for clean restart`);
    }
    
    // VALIDATE CURRICULUM EXPECTATIONS
    console.log('\n🎯 VALIDATING CURRICULUM EXPECTATIONS...');
    const expectations = await prisma.curriculumExpectation.count({
      where: { grade: 1 }
    });
    
    console.log(`  Total Grade 1 expectations: ${expectations}`);
    
    if (expectations === 73) {
      successes.push('✅ All 73 curriculum expectations loaded');
    } else {
      issues.push(`❌ Expected 73 expectations, found ${expectations}`);
    }
    
    // Check expectation distribution
    const unitExpectations = await prisma.unitPlanExpectation.count();
    console.log(`  Expectations linked to units: ${unitExpectations}`);
    
    // CALCULATE LESSON DISTRIBUTION
    console.log('\n📊 LESSON DISTRIBUTION PLAN...');
    const lessonNeeds = {
      'Français langue première': { total: 181, perWeek: 5, duration: 60 },
      'Mathématiques': { total: 181, perWeek: 5, duration: 45 },
      'Sciences de la nature': { total: 108, perWeek: 3, duration: 45 },
      'Sciences humaines': { total: 72, perWeek: 2, duration: 45 },
      'Arts visuels': { total: 72, perWeek: 2, duration: 45 },
      'Éducation physique': { total: 108, perWeek: 3, duration: 45 },
      'Music': { total: 72, perWeek: 2, duration: 45 },
      'Formation personnelle et sociale': { total: 36, perWeek: 1, duration: 45 }
    };
    
    let totalLessonsNeeded = 0;
    let totalMinutesPerWeek = 0;
    
    Object.entries(lessonNeeds).forEach(([subject, needs]) => {
      const units = unitsBySubject[subject] || [];
      const lessonsPerUnit = Math.ceil(needs.total / units.length);
      console.log(`  ${subject}:`);
      console.log(`    • ${needs.total} lessons (${needs.perWeek}x/week, ${needs.duration} min)`);
      console.log(`    • ${units.length} units = ~${lessonsPerUnit} lessons/unit`);
      totalLessonsNeeded += needs.total;
      totalMinutesPerWeek += needs.perWeek * needs.duration;
    });
    
    console.log(`\n  TOTAL: ${totalLessonsNeeded} lessons`);
    console.log(`  Weekly instruction: ${totalMinutesPerWeek} minutes`);
    console.log(`  Daily average: ${Math.round(totalMinutesPerWeek / 5)} minutes`);
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('📊 VALIDATION SUMMARY\n');
    
    if (successes.length > 0) {
      console.log('✅ SUCCESSES:');
      successes.forEach(s => console.log(`  ${s}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES TO FIX:');
      issues.forEach(i => console.log(`  ${i}`));
    } else {
      console.log('\n🎉 PERFECT! No issues found!');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('READY FOR LESSON CREATION:');
    console.log(`  • ${longRangePlans.length} long range plans ✓`);
    console.log(`  • ${unitPlans.length} unit plans ✓`);
    console.log(`  • ${expectations} curriculum expectations ✓`);
    console.log(`  • ${lessonCount} existing lessons (clean slate) ✓`);
    console.log(`  • ${totalLessonsNeeded} lessons to create`);
    console.log('\nNext step: Create 830 lessons distributed across units!');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
validateCurriculum().catch(console.error);