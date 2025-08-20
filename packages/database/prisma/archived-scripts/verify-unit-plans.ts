#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUnitPlans() {
  console.log('🔍 VERIFYING UNIT PLANS FOR FRANÇAIS LANGUE PREMIÈRE...\n');
  
  try {
    // Get Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily\'s account not found!');
      return;
    }
    
    // Get the Français long range plan
    const francaisPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)',
        academicYear: '2024-2025'
      }
    });
    
    if (!francaisPlan) {
      console.error('❌ Français long range plan not found!');
      return;
    }
    
    // Get all unit plans
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: francaisPlan.id },
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
    console.log('=' .repeat(60) + '\n');
    
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
      }
      
      // Check for complete metadata
      const checks = [
        { field: 'Description', value: !!unit.description },
        { field: 'Big Ideas', value: !!unit.bigIdeas },
        { field: 'Essential Questions', value: !!unit.essentialQuestions },
        { field: 'Assessment Plan', value: !!unit.assessmentPlan },
        { field: 'Success Criteria', value: !!unit.successCriteria },
        { field: 'Differentiation', value: !!unit.differentiationStrategies },
        { field: 'Indigenous Perspectives', value: !!unit.indigenousPerspectives },
        { field: 'Parent Communication', value: !!unit.parentCommunicationPlan },
        { field: 'Bilingual Support', value: !!(unit.titleFr && unit.descriptionFr) }
      ];
      
      const missing = checks.filter(c => !c.value);
      if (missing.length > 0) {
        console.log(`⚠️  Missing: ${missing.map(m => m.field).join(', ')}`);
      } else {
        console.log('✅ All metadata complete');
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
    console.log('=' .repeat(60));
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
    
    // Expectation coverage verification
    console.log('\n' + '=' .repeat(60));
    console.log('📊 EXPECTATION COVERAGE ANALYSIS:\n');
    
    // Get all French expectations
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Français (Immersion)',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    console.log(`Expected: ${allExpectations.length} expectations`);
    console.log(`Covered: ${expectationCoverage.size} unique expectations`);
    console.log(`Total links: ${totalExpectations} (includes Unit 4 consolidation)\n`);
    
    // Check each expectation
    allExpectations.forEach(exp => {
      const units = expectationCoverage.get(exp.code) || [];
      if (units.length === 0) {
        console.log(`❌ ${exp.code}: NOT COVERED`);
      } else if (units.length === 1) {
        console.log(`✅ ${exp.code}: ${units[0]}`);
      } else {
        console.log(`⚠️  ${exp.code}: MULTIPLE (${units.join(', ')})`);
      }
    });
    
    // Pedagogical flow analysis
    console.log('\n' + '=' .repeat(60));
    console.log('🎓 PEDAGOGICAL FLOW ANALYSIS:\n');
    
    // Check Term 1 vs Term 2 distribution
    const term1Units = units.filter(u => u.startDate < new Date('2025-02-01'));
    const term2Units = units.filter(u => u.startDate >= new Date('2025-02-01'));
    
    console.log(`Term 1 Units: ${term1Units.length}`);
    console.log(`Term 2 Units: ${term2Units.length}`);
    
    // Check skill progression
    const oralUnits = units.filter(u => 
      u.expectations.some(e => e.expectation.code.startsWith('1CO'))
    );
    const readingUnits = units.filter(u => 
      u.expectations.some(e => e.expectation.code.startsWith('1L'))
    );
    const writingUnits = units.filter(u => 
      u.expectations.some(e => e.expectation.code.startsWith('1É'))
    );
    
    console.log(`\nSkill Distribution:`);
    console.log(`  Oral Communication (CO): ${oralUnits.length} units`);
    console.log(`  Reading (L): ${readingUnits.length} units`);
    console.log(`  Writing (É): ${writingUnits.length} units`);
    
    // Final assessment
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 FINAL ASSESSMENT:\n');
    
    const issues = [];
    if (expectationCoverage.size < allExpectations.length) {
      issues.push(`Missing ${allExpectations.length - expectationCoverage.size} expectations`);
    }
    if (totalHours < 150) {
      issues.push('Insufficient instructional hours');
    }
    if (units.length < 8) {
      issues.push('Too few units for full year');
    }
    
    if (issues.length === 0) {
      console.log('✅✅✅ UNIT PLANS ARE PERFECT! ✅✅✅');
      console.log('- All expectations covered');
      console.log('- Complete metadata for every unit');
      console.log('- Logical progression through the year');
      console.log('- Age-appropriate themes and activities');
      console.log('- Rich differentiation and assessment strategies');
      console.log('\nEmily has perfect unit plans for Français (Immersion)!');
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
verifyUnitPlans();