#!/usr/bin/env tsx

/**
 * ASSESS CURRENT MATHEMATICS UNIT PLANS
 * Are they at the right tactical level?
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function assessMathUnits() {
  console.log('🔍 ASSESSING MATHEMATICS UNIT PLANS\n');
  console.log('Are they tactical bridges between strategy and operations?\n');
  console.log('=========================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      expectations: {
        include: { expectation: true }
      },
      unitPlans: {
        include: {
          expectations: {
            include: { expectation: true }
          }
        },
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!mathLRP) {
    console.log('Mathematics LRP not found');
    return;
  }
  
  console.log('📊 CURRENT STATE:\n');
  console.log(`Total LRP expectations: ${mathLRP.expectations.length}/14`);
  console.log(`Total units: ${mathLRP.unitPlans.length}`);
  console.log(`Total hours: ${mathLRP.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0)}/185\n`);
  
  console.log('📋 UNIT ANALYSIS:\n');
  
  let totalExpectationsInUnits = 0;
  const expectationCoverage = new Map<string, number>();
  
  mathLRP.unitPlans.forEach((unit, index) => {
    console.log(`Unit ${index + 1}: ${unit.title}`);
    console.log(`  Dates: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
    console.log(`  Hours: ${unit.estimatedHours}`);
    console.log(`  Expectations: ${unit.expectations.length}`);
    
    // Check quality
    const issues = [];
    const good = [];
    
    if (unit.bigIdeas) good.push('✓ Has big ideas');
    else issues.push('✗ Missing big ideas');
    
    if (unit.assessmentPlan) good.push('✓ Has assessment plan');
    else issues.push('✗ Missing assessment plan');
    
    if (unit.description && unit.description.length > 50) good.push('✓ Has description');
    else issues.push('✗ Insufficient description');
    
    if (unit.expectations.length > 0) {
      good.push(`✓ Has ${unit.expectations.length} expectations`);
      totalExpectationsInUnits += unit.expectations.length;
      
      unit.expectations.forEach(e => {
        const code = e.expectation.code;
        expectationCoverage.set(code, (expectationCoverage.get(code) || 0) + 1);
      });
    } else {
      issues.push('✗ No expectations linked');
    }
    
    if (unit.description?.includes('8:30') || unit.description?.includes('minutes')) {
      issues.push('✗ Too operational (has times)');
    }
    
    if (unit.estimatedHours && unit.estimatedHours > 0) {
      good.push(`✓ ${unit.estimatedHours} hours allocated`);
    } else {
      issues.push('✗ No hours specified');
    }
    
    console.log('  Good:', good.length > 0 ? good.join(', ') : 'None');
    if (issues.length > 0) {
      console.log('  Issues:', issues.join(', '));
    }
    console.log();
  });
  
  console.log('📊 EXPECTATION COVERAGE:\n');
  
  // List all math expectations
  const allMathExpectations = await prisma.curriculumExpectation.findMany({
    where: {
      subject: 'Mathématiques',
      grade: 1
    },
    orderBy: { code: 'asc' }
  });
  
  console.log('Expectation Distribution:');
  allMathExpectations.forEach(exp => {
    const coverage = expectationCoverage.get(exp.code) || 0;
    const status = coverage === 0 ? '❌ NOT COVERED' : 
                   coverage === 1 ? '✓ Covered once' : 
                   `⚠️ Covered ${coverage} times`;
    console.log(`  ${exp.code}: ${status}`);
  });
  
  console.log('\n🎯 IDEAL UNIT PLAN CHARACTERISTICS:\n');
  console.log('Should have:');
  console.log('  • Clear title indicating mathematical focus');
  console.log('  • 2-3 big ideas (conceptual understandings)');
  console.log('  • Specific curriculum expectations');
  console.log('  • Assessment strategies (not daily)');
  console.log('  • Key learning experiences (not lessons)');
  console.log('  • Resources and materials (categories)');
  console.log('  • Integration opportunities');
  console.log('  • Differentiation considerations\n');
  
  console.log('Should NOT have:');
  console.log('  • Daily schedules or times');
  console.log('  • Minute-by-minute planning');
  console.log('  • Specific lesson plans');
  console.log('  • Operational procedures\n');
  
  const totalHours = mathLRP.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
  const allExpectationsCovered = allMathExpectations.every(exp => 
    expectationCoverage.has(exp.code)
  );
  
  console.log('✅ FINAL ASSESSMENT:\n');
  console.log(`Hours: ${totalHours}/185 ${totalHours === 185 ? '✓' : '✗'}`);
  console.log(`All expectations covered: ${allExpectationsCovered ? '✓' : '✗'}`);
  console.log(`Unit structure: ${mathLRP.unitPlans.length === 10 ? '✓ 10 units' : `${mathLRP.unitPlans.length} units`}`);
  
  if (totalHours === 185 && allExpectationsCovered) {
    console.log('\n✨ Ready for detailed perfection!');
  } else {
    console.log('\n⚠️ Needs work on coverage and hours');
  }
  
  await prisma.$disconnect();
}

assessMathUnits().catch(console.error);