#!/usr/bin/env tsx

/**
 * BRUTAL HONESTY CHECK
 * What's ACTUALLY in the database vs what we've been claiming
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function brutalHonestyCheck() {
  console.log('🔍 BRUTAL HONESTY CHECK - THE ACTUAL TRUTH\n');
  console.log('='.repeat(70));
  
  const lies: string[] = [];
  const truths: string[] = [];
  const halfTruths: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      lies.push('❌ Emily McIsaac doesn\'t even exist in the database!');
      return;
    }
    
    // CHECK 1: Do lesson plans actually exist?
    console.log('💀 CHECK 1: Lesson Plans\n');
    const lessonCount = await prisma.eTFOLessonPlan.count();
    console.log(`  Actual lesson plans in database: ${lessonCount}`);
    console.log(`  We claimed we need: 1,569 for Emily`);
    if (lessonCount === 0) {
      lies.push('🔴 ZERO lesson plans exist! We keep saying "ready for creation" but nothing exists!');
    }
    
    // CHECK 2: Are units actually pedagogically sound?
    console.log('\n💀 CHECK 2: Unit Pedagogy\n');
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: true
      }
    });
    
    let unitsWithoutAssessment = 0;
    let unitsWithoutDifferentiation = 0;
    let unitsWithoutCrossCurricular = 0;
    let unitsWithGenericContent = 0;
    
    units.forEach(unit => {
      if (!unit.assessmentPlan || unit.assessmentPlan.length < 50) {
        unitsWithoutAssessment++;
      }
      if (!unit.differentiationStrategies) {
        unitsWithoutDifferentiation++;
      }
      if (!unit.crossCurricularConnections || unit.crossCurricularConnections.length < 20) {
        unitsWithoutCrossCurricular++;
      }
      
      // Check for generic/placeholder content
      if (unit.description?.includes('[') && unit.description?.includes(']')) {
        unitsWithGenericContent++;
      }
    });
    
    console.log(`  Units without real assessment plans: ${unitsWithoutAssessment}/${units.length}`);
    console.log(`  Units without differentiation: ${unitsWithoutDifferentiation}/${units.length}`);
    console.log(`  Units without cross-curricular: ${unitsWithoutCrossCurricular}/${units.length}`);
    console.log(`  Units with placeholder content: ${unitsWithGenericContent}/${units.length}`);
    
    if (unitsWithoutAssessment > 10) {
      halfTruths.push('⚠️ We said units have assessment plans, but many are generic/missing');
    }
    
    // CHECK 3: The 6-day cycle math
    console.log('\n💀 CHECK 3: 6-Day Cycle Math\n');
    const actualDays = 181;
    const cycles = actualDays / 6;
    console.log(`  181 days ÷ 6 = ${cycles} cycles`);
    console.log(`  We have ${Math.floor(cycles)} complete cycles + ${actualDays % 6} extra day(s)`);
    
    const totalBlocks = actualDays * 10;
    console.log(`  Total blocks: ${totalBlocks} (not 1800 as initially claimed)`);
    
    if (totalBlocks !== 1810) {
      truths.push('✅ We correctly fixed the math to 1810 blocks');
    }
    
    // CHECK 4: Are expectations really linked?
    console.log('\n💀 CHECK 4: Curriculum Expectations\n');
    
    const expectations = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
    const lrpExpectations = await prisma.longRangePlanExpectation.count();
    const unitExpectations = await prisma.unitPlanExpectation.count();
    
    console.log(`  Total Grade 1 expectations: ${expectations}`);
    console.log(`  Expectations linked to LRPs: ${lrpExpectations}`);
    console.log(`  Expectations linked to Units: ${unitExpectations}`);
    
    if (unitExpectations < expectations) {
      halfTruths.push(`⚠️ Only ${unitExpectations}/${expectations} expectations linked to units`);
    }
    
    // CHECK 5: Do units actually have the claimed progressions?
    console.log('\n💀 CHECK 5: Learning Progressions\n');
    
    const mathUnits = units.filter(u => u.longRangePlan.subject === 'Mathématiques');
    const hasNewMathTitles = mathUnits.some(u => 
      u.title.includes('Number Sense Foundations') || 
      u.title.includes('Mathematical Thinking')
    );
    
    if (hasNewMathTitles) {
      truths.push('✅ Math units were updated with progressive titles');
    } else {
      lies.push('🔴 Math units still have old titles, not the progressive ones we claimed');
    }
    
    // CHECK 6: Holiday accounting
    console.log('\n💀 CHECK 6: Holiday Accounting\n');
    
    const totalUnitHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const expectedHours = 905;
    const hourDifference = Math.abs(totalUnitHours - expectedHours);
    
    console.log(`  Total unit hours: ${totalUnitHours}`);
    console.log(`  Expected hours: ${expectedHours}`);
    console.log(`  Difference: ${hourDifference} hours`);
    
    if (hourDifference < 20) {
      truths.push('✅ Holiday accounting was properly implemented');
    } else {
      halfTruths.push(`⚠️ Hour totals off by ${hourDifference} hours`);
    }
    
    // CHECK 7: French-Math integration
    console.log('\n💀 CHECK 7: French-Math Integration\n');
    
    const frenchUnits = units.filter(u => u.longRangePlan.subject === 'Français langue première');
    const hasMathIntegration = frenchUnits.filter(u => 
      u.crossCurricularConnections?.toLowerCase().includes('math')
    ).length;
    
    console.log(`  French units with math integration: ${hasMathIntegration}/${frenchUnits.length}`);
    
    if (hasMathIntegration === frenchUnits.length) {
      truths.push('✅ All French units have math integration');
    } else if (hasMathIntegration > 0) {
      halfTruths.push(`⚠️ Only ${hasMathIntegration}/${frenchUnits.length} French units have math integration`);
    } else {
      lies.push('🔴 NO French units have math integration despite claims');
    }
    
    // CHECK 8: The "perfect" claims
    console.log('\n💀 CHECK 8: "Perfect" Claims\n');
    
    const perfectClaims = [
      { claim: '1810 blocks calculated correctly', actual: totalBlocks === 1810 },
      { claim: 'All units have differentiation', actual: unitsWithoutDifferentiation === 0 },
      { claim: 'All expectations linked', actual: unitExpectations >= expectations },
      { claim: 'Zero lesson plans ready', actual: lessonCount === 0 },
      { claim: 'Holiday accounting done', actual: hourDifference < 20 },
      { claim: 'Progressions implemented', actual: hasNewMathTitles }
    ];
    
    perfectClaims.forEach(p => {
      console.log(`  ${p.claim}: ${p.actual ? '✅ TRUE' : '❌ FALSE'}`);
      if (!p.actual && !lies.some(l => l.includes(p.claim))) {
        lies.push(`🔴 Claimed "${p.claim}" but it's false`);
      }
    });
    
    // CHECK 9: Database integrity
    console.log('\n💀 CHECK 9: Database Integrity\n');
    
    const lrps = await prisma.longRangePlan.count({ where: { userId: emily.id } });
    const totalUnits = units.length;
    
    console.log(`  Long Range Plans: ${lrps} (should be 9)`);
    console.log(`  Unit Plans: ${totalUnits} (should be 60)`);
    console.log(`  Curriculum Expectations: ${expectations} (should be 73)`);
    
    if (lrps === 9 && totalUnits === 60 && expectations === 73) {
      truths.push('✅ Database structure is correct');
    } else {
      lies.push(`🔴 Database structure wrong: ${lrps} LRPs, ${totalUnits} units, ${expectations} expectations`);
    }
    
    // CHECK 10: The ultimate truth
    console.log('\n💀 CHECK 10: The Ultimate Truth\n');
    
    const hasLessonPlans = lessonCount > 0;
    const hasRealPedagogy = unitsWithoutAssessment < 5 && unitsWithoutDifferentiation < 5;
    const mathIsCorrect = totalBlocks === 1810;
    const structureExists = lrps > 0 && totalUnits > 0;
    
    console.log(`  Has actual lesson plans: ${hasLessonPlans}`);
    console.log(`  Has real pedagogy: ${hasRealPedagogy}`);
    console.log(`  Math is correct: ${mathIsCorrect}`);
    console.log(`  Structure exists: ${structureExists}`);
    
    // FINAL BRUTAL REPORT
    console.log('\n' + '='.repeat(70));
    console.log('💀 BRUTAL HONESTY REPORT\n');
    
    if (truths.length > 0) {
      console.log('✅ ACTUAL TRUTHS:');
      truths.forEach(t => console.log(`  ${t}`));
    }
    
    if (halfTruths.length > 0) {
      console.log('\n⚠️ HALF-TRUTHS/EXAGGERATIONS:');
      halfTruths.forEach(h => console.log(`  ${h}`));
    }
    
    if (lies.length > 0) {
      console.log('\n🔴 LIES/FALSE CLAIMS:');
      lies.forEach(l => console.log(`  ${l}`));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎭 THE REAL TRUTH:\n');
    
    if (lessonCount === 0) {
      console.log('We have a STRUCTURE for a curriculum but NO ACTUAL LESSONS.');
      console.log('It\'s like having blueprints for a house but no house built.');
    }
    
    if (unitsWithGenericContent > 20) {
      console.log('\nMany units have PLACEHOLDER content, not real pedagogical design.');
      console.log('We\'ve been moving numbers around but not creating actual teaching content.');
    }
    
    const overallScore = Math.max(0, 
      100 - 
      (lies.length * 20) - 
      (halfTruths.length * 10) - 
      (lessonCount === 0 ? 30 : 0)
    );
    
    console.log(`\n📊 HONESTY SCORE: ${overallScore}/100`);
    
    if (overallScore >= 80) {
      console.log('✅ Mostly honest - good structural work, needs content');
    } else if (overallScore >= 50) {
      console.log('⚠️ Mixed truth - structure exists but many exaggerations');
    } else {
      console.log('❌ Mostly fictional - fundamental work still needed');
    }
    
    console.log('\n🔨 WHAT ACTUALLY NEEDS TO BE DONE:');
    console.log('  1. CREATE 1,569 actual lesson plans (currently 0)');
    console.log('  2. Write real differentiation strategies for each unit');
    console.log('  3. Develop actual assessment rubrics');
    console.log('  4. Create concrete cross-curricular activities');
    console.log('  5. Design specific learning materials');
    console.log('  6. Build actual French-Math integration activities');
    console.log('  7. Develop real Indigenous perspectives content');
    
  } catch (error) {
    console.error('❌ Brutal check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the brutal check
brutalHonestyCheck().catch(console.error);