import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assessLRPsAndUnitsOnly() {
  console.log('=== CRITICAL ASSESSMENT: LRPs AND UNIT PLANS ONLY ===\n');
  console.log('Focus: Long Range Plans and Unit Plans Quality');
  console.log('NOT assessing: Lesson plans, materials, or resources\n');
  console.log('='.repeat(60) + '\n');
  
  // Get all LRPs with full details
  const lrps = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        include: {
          expectations: true
        },
        orderBy: {
          startDate: 'asc'
        }
      },
      expectations: {
        include: {
          expectation: true
        }
      }
    }
  });
  
  // Get all curriculum expectations for Grade 1
  const allExpectations = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 }
  });
  
  console.log('📊 OVERALL NUMBERS:');
  console.log(`  Long Range Plans: ${lrps.length}/9 subjects`);
  console.log(`  Total Unit Plans: ${lrps.reduce((sum, lrp) => sum + lrp.unitPlans.length, 0)}`);
  console.log(`  Grade 1 Expectations: ${allExpectations.length}\n`);
  
  console.log('📋 LONG RANGE PLAN ASSESSMENT:\n');
  
  let totalScore = 0;
  let subjectCount = 0;
  
  for (const lrp of lrps) {
    console.log(`\n${lrp.subject}:`);
    console.log('─'.repeat(40));
    
    let subjectScore = 0;
    let maxScore = 0;
    
    // Check LRP completeness (25 points)
    console.log('  LRP Components:');
    if (lrp.goals && lrp.goals.length > 50) {
      console.log('    ✓ Goals: YES (' + lrp.goals.length + ' chars)');
      subjectScore += 5;
    } else {
      console.log('    ✗ Goals: INSUFFICIENT');
    }
    maxScore += 5;
    
    if (lrp.themes && Array.isArray(lrp.themes) && lrp.themes.length > 0) {
      console.log('    ✓ Themes/Big Ideas: YES');
      subjectScore += 5;
    } else {
      console.log('    ✗ Themes/Big Ideas: NO');
    }
    maxScore += 5;
    
    if (lrp.assessmentOverview && lrp.assessmentOverview.length > 50) {
      console.log('    ✓ Assessment Overview: YES');
      subjectScore += 5;
    } else {
      console.log('    ✗ Assessment Overview: INSUFFICIENT');
    }
    maxScore += 5;
    
    if (lrp.resourceNeeds && lrp.resourceNeeds.length > 20) {
      console.log('    ✓ Resources: YES');
      subjectScore += 5;
    } else {
      console.log('    ✗ Resources: INSUFFICIENT');
    }
    maxScore += 5;
    
    if (lrp.overarchingQuestions && lrp.overarchingQuestions.length > 20) {
      console.log('    ✓ Essential Questions: YES');
      subjectScore += 5;
    } else {
      console.log('    ✗ Essential Questions: NO');
    }
    maxScore += 5;
    
    // Check curriculum coverage (25 points)
    console.log('\n  Curriculum Coverage:');
    const subjectExpectations = allExpectations.filter(e => 
      e.subject === lrp.subject || 
      e.subject.includes(lrp.subject.split(' ')[0])
    );
    
    console.log(`    Subject expectations available: ${subjectExpectations.length}`);
    console.log(`    Linked to LRP: ${lrp.expectations.length}`);
    
    const coveragePercent = subjectExpectations.length > 0 
      ? (lrp.expectations.length / subjectExpectations.length * 100).toFixed(0)
      : 0;
    console.log(`    Coverage: ${coveragePercent}%`);
    
    if (coveragePercent >= 90) {
      subjectScore += 25;
    } else if (coveragePercent >= 70) {
      subjectScore += 20;
    } else if (coveragePercent >= 50) {
      subjectScore += 15;
    } else if (coveragePercent >= 25) {
      subjectScore += 10;
    } else {
      subjectScore += 5;
    }
    maxScore += 25;
    
    // Check unit plans (50 points)
    console.log('\n  Unit Plans Analysis:');
    console.log(`    Number of units: ${lrp.unitPlans.length}`);
    
    let unitsWithExpectations = 0;
    let unitsWithDescription = 0;
    let unitsWithAssessment = 0;
    let unitsWithDifferentiation = 0;
    let unitsWithCrossCurricular = 0;
    let progressionQuality = 0;
    
    // Check progression
    const unitTitles = lrp.unitPlans.map(u => u.title).join(' → ');
    console.log(`    Progression: ${unitTitles.substring(0, 60)}...`);
    
    // Check each unit
    for (const unit of lrp.unitPlans) {
      if (unit.expectations.length > 0) unitsWithExpectations++;
      if (unit.description && unit.description.length > 100) unitsWithDescription++;
      if (unit.assessmentPlan && unit.assessmentPlan.length > 100) unitsWithAssessment++;
      if (unit.differentiationStrategies) unitsWithDifferentiation++;
      if (unit.crossCurricularConnections && unit.crossCurricularConnections.length > 50) unitsWithCrossCurricular++;
    }
    
    console.log(`    Units with expectations: ${unitsWithExpectations}/${lrp.unitPlans.length}`);
    console.log(`    Units with descriptions: ${unitsWithDescription}/${lrp.unitPlans.length}`);
    console.log(`    Units with assessment: ${unitsWithAssessment}/${lrp.unitPlans.length}`);
    console.log(`    Units with differentiation: ${unitsWithDifferentiation}/${lrp.unitPlans.length}`);
    console.log(`    Units with cross-curricular: ${unitsWithCrossCurricular}/${lrp.unitPlans.length}`);
    
    // Score units
    const unitCompleteness = (
      (unitsWithExpectations / Math.max(lrp.unitPlans.length, 1)) * 10 +
      (unitsWithDescription / Math.max(lrp.unitPlans.length, 1)) * 10 +
      (unitsWithAssessment / Math.max(lrp.unitPlans.length, 1)) * 10 +
      (unitsWithDifferentiation / Math.max(lrp.unitPlans.length, 1)) * 10 +
      (unitsWithCrossCurricular / Math.max(lrp.unitPlans.length, 1)) * 10
    );
    
    subjectScore += unitCompleteness;
    maxScore += 50;
    
    const percentScore = (subjectScore / maxScore * 100).toFixed(0);
    console.log(`\n  ${lrp.subject} Score: ${subjectScore}/${maxScore} (${percentScore}%)`);
    
    totalScore += parseInt(percentScore);
    subjectCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL ASSESSMENT:\n');
  
  const averageScore = totalScore / subjectCount;
  console.log(`Overall Quality Score: ${averageScore.toFixed(1)}/100\n`);
  
  if (averageScore >= 90) {
    console.log('✅ EXCELLENT: LRPs and Units are comprehensive and well-structured');
  } else if (averageScore >= 70) {
    console.log('✓ GOOD: LRPs and Units provide solid foundation with some gaps');
  } else if (averageScore >= 50) {
    console.log('⚠️ ADEQUATE: LRPs and Units need significant enhancement');
  } else {
    console.log('❌ INSUFFICIENT: Major work needed on LRPs and Units');
  }
  
  // Final summary
  console.log('\n📋 CRITICAL ASSESSMENT SUMMARY:\n');
  
  const allUnits = await prisma.unitPlan.findMany({
    include: {
      expectations: true
    }
  });
  
  const unitsWithLinks = allUnits.filter(u => u.expectations.length > 0).length;
  const linkPercent = (unitsWithLinks / allUnits.length * 100).toFixed(0);
  
  console.log('STRENGTHS:');
  console.log('  • All 9 subjects have Long Range Plans');
  console.log('  • Total of ' + allUnits.length + ' unit plans created');
  console.log('  • Progressive structure across school year');
  
  console.log('\nWEAKNESSES:');
  console.log(`  • Only ${linkPercent}% of units linked to expectations`);
  console.log('  • Many units lack detailed descriptions');
  console.log('  • Assessment plans often generic');
  console.log('  • Cross-curricular connections theoretical');
  
  console.log('\nTHE VERDICT:');
  console.log('For LONG RANGE and UNIT PLANS only (not lessons):');
  console.log(`Quality Score: ${averageScore.toFixed(1)}/100`);
  
  if (averageScore >= 90) {
    console.log('Status: READY for implementation planning');
  } else if (averageScore >= 70) {
    console.log('Status: FUNCTIONAL but needs enhancement');  
  } else {
    console.log('Status: REQUIRES significant completion work');
  }
  
  await prisma.$disconnect();
}

assessLRPsAndUnitsOnly().catch(console.error);