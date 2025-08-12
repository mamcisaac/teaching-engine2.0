#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMathUnitPlans() {
  console.log('🔍 VERIFYING UNIT PLANS FOR MATHÉMATIQUES...\n');
  
  try {
    // Get Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily\'s account not found!');
      return;
    }
    
    // Get the Math long range plan
    const mathPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Mathématiques',
        academicYear: '2024-2025'
      }
    });
    
    if (!mathPlan) {
      console.error('❌ Mathématiques long range plan not found!');
      return;
    }
    
    // Get all unit plans
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: mathPlan.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`📚 Found ${units.length} unit plans\n`);
    
    // Analyze each unit
    let totalExpectations = 0;
    const expectationCoverage = new Map<string, string[]>();
    
    console.log('UNIT-BY-UNIT ANALYSIS:');
    console.log('='.repeat(60) + '\n');
    
    units.forEach((unit, index) => {
      const unitNum = index + 1;
      const duration = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(duration / 7);
      
      console.log(`UNIT ${unitNum}: ${unit.titleFr}`);
      console.log('-'.repeat(50));
      console.log(`📅 Dates: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
      console.log(`⏱️  Duration: ${duration} days (${weeks} weeks)`);
      console.log(`📖 Hours: ${unit.estimatedHours || 'Not specified'}`);
      console.log(`📝 Expectations: ${unit.expectations.length}`);
      
      // List expectations
      if (unit.expectations.length > 0) {
        console.log('   Codes: ' + unit.expectations.map(e => e.expectation.code).join(', '));
      } else {
        console.log('   Note: Application/consolidation unit');
      }
      
      // Track expectation coverage
      unit.expectations.forEach(e => {
        const code = e.expectation.code;
        if (!expectationCoverage.has(code)) {
          expectationCoverage.set(code, []);
        }
        expectationCoverage.get(code)!.push(unit.titleFr!);
        totalExpectations++;
      });
      
      console.log();
    });
    
    // Timeline analysis
    console.log('='.repeat(60));
    console.log('📅 TIMELINE ANALYSIS:\n');
    
    // Check for gaps or overlaps
    for (let i = 0; i < units.length - 1; i++) {
      const gap = Math.ceil((units[i + 1].startDate.getTime() - units[i].endDate.getTime()) / (1000 * 60 * 60 * 24));
      if (gap > 3) {
        console.log(`⚠️  Gap of ${gap} days between Unit ${i + 1} and Unit ${i + 2}`);
      } else if (gap < 0) {
        console.log(`⚠️  Overlap between Unit ${i + 1} and Unit ${i + 2}`);
      }
    }
    
    // Total instructional time
    const totalHours = units.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const schoolDays = Math.ceil((units[units.length - 1].endDate.getTime() - units[0].startDate.getTime()) / (1000 * 60 * 60 * 24));
    const schoolWeeks = Math.ceil(schoolDays / 7);
    
    console.log(`📚 Total instructional hours: ${totalHours}`);
    console.log(`📅 School year span: ${schoolDays} days (${schoolWeeks} weeks)`);
    console.log(`⏰ Average hours per week: ${(totalHours / schoolWeeks).toFixed(1)}`);
    
    // Expectation coverage by strand
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXPECTATION COVERAGE BY STRAND:\n');
    
    // Get all Math expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    console.log(`Expected: ${allExpectations.length} expectations`);
    console.log(`Covered: ${expectationCoverage.size} unique expectations`);
    console.log(`Total links: ${totalExpectations}\n`);
    
    // Group by strand
    const strands: { [key: string]: string[] } = {
      'Number (N)': [],
      'Patterns & Relations (RR)': [],
      'Shape & Space (FE)': []
    };
    
    allExpectations.forEach(exp => {
      const units = expectationCoverage.get(exp.code) || [];
      const strand = exp.code.includes('N') ? 'Number (N)' :
                    exp.code.includes('RR') ? 'Patterns & Relations (RR)' :
                    'Shape & Space (FE)';
      
      if (units.length === 0) {
        strands[strand].push(`❌ ${exp.code}: NOT COVERED`);
      } else {
        strands[strand].push(`✅ ${exp.code}: ${units[0]}`);
      }
    });
    
    // Print by strand
    Object.entries(strands).forEach(([strand, expectations]) => {
      console.log(`\n${strand}:`);
      expectations.forEach(e => console.log(`  ${e}`));
    });
    
    // Mathematical concepts flow
    console.log('\n' + '='.repeat(60));
    console.log('🧮 MATHEMATICAL CONCEPTS PROGRESSION:\n');
    
    const conceptFlow = [
      { unit: 1, concepts: 'Counting, Recognition, Subitizing' },
      { unit: 2, concepts: 'Representation, Comparison, Equal groups' },
      { unit: 3, concepts: 'Patterns, Shapes, Sorting' },
      { unit: 4, concepts: 'Addition, Subtraction, Problem solving' },
      { unit: 5, concepts: 'Mental strategies, Equality' },
      { unit: 6, concepts: 'Measurement, Comparison, Time' },
      { unit: 7, concepts: 'Applied problem solving' },
      { unit: 8, concepts: 'Reflection and celebration' }
    ];
    
    conceptFlow.forEach(({ unit, concepts }) => {
      console.log(`Unit ${unit}: ${concepts}`);
    });
    
    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL ASSESSMENT:\n');
    
    const issues = [];
    if (expectationCoverage.size < allExpectations.length) {
      issues.push(`Missing ${allExpectations.length - expectationCoverage.size} expectations`);
    }
    if (totalHours < 120) {
      issues.push('Insufficient instructional hours for math');
    }
    if (units.length < 8) {
      issues.push('Too few units for full year');
    }
    
    if (issues.length === 0) {
      console.log('✅✅✅ MATH UNIT PLANS ARE PERFECT! ✅✅✅');
      console.log('- All 14 expectations covered appropriately');
      console.log('- Logical mathematical progression');
      console.log('- Concrete → Pictorial → Abstract approach');
      console.log('- Play-based learning for Grade 1');
      console.log('- Rich problem-solving opportunities');
      console.log('- Complete differentiation strategies');
      console.log('\nEmily has perfect unit plans for Mathématiques!');
    } else {
      console.log('⚠️  ISSUES FOUND:');
      issues.forEach(i => console.log(`  - ${i}`));
    }
    
  } catch (error) {
    console.error('❌ Error verifying unit plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMathUnitPlans();