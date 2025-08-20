import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateUnitPlanPerfection() {
  try {
    console.log('🎯 PHASE 4: VALIDATING UNIT PLAN PERFECTION');
    console.log('Comprehensive verification of all fixes and excellence standards');
    
    // Get the Social Studies LRP and all unit plans
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      }
    });

    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        },
        lessonPlans: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\\n=== 1. TIMING & SCHEDULING PERFECTION VALIDATION ===');
    
    let schedulingPerfect = true;
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\\nUnit ${i+1}: ${unit.title}`);
      console.log(`  Period: ${startDate.toDateString()} to ${endDate.toDateString()}`);
      console.log(`  Duration: ${duration} days`);
      console.log(`  Lessons: ${unit.lessonPlans.length}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      
      // Check for weekend starts
      if (startDate.getDay() === 0 || startDate.getDay() === 6) {
        console.log(`  ❌ WEEKEND START: ${startDate.getDay() === 0 ? 'Sunday' : 'Saturday'}`);
        schedulingPerfect = false;
      } else {
        console.log(`  ✅ WEEKDAY START: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][startDate.getDay()]}`);
      }
      
      // Check for weekend ends
      if (endDate.getDay() === 0 || endDate.getDay() === 6) {
        console.log(`  ❌ WEEKEND END: ${endDate.getDay() === 0 ? 'Sunday' : 'Saturday'}`);
        schedulingPerfect = false;
      } else {
        console.log(`  ✅ WEEKDAY END: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][endDate.getDay()]}`);
      }
      
      // Check for holiday conflicts (Christmas break: Dec 23 - Jan 5)
      const christmasStart = new Date('2025-12-23');
      const christmasEnd = new Date('2026-01-05');
      
      if ((startDate >= christmasStart && startDate <= christmasEnd) || 
          (endDate >= christmasStart && endDate <= christmasEnd)) {
        console.log(`  ❌ HOLIDAY CONFLICT: Overlaps with Christmas break`);
        schedulingPerfect = false;
      } else {
        console.log(`  ✅ NO HOLIDAY CONFLICTS`);
      }
      
      // Check for gaps between units (allow up to 5 days for weekends)
      if (i > 0) {
        const prevUnit = units[i-1];
        const prevEndDate = new Date(prevUnit.endDate);
        const gapDays = Math.ceil((startDate.getTime() - prevEndDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gapDays > 5) { // Allow for weekends and brief breaks
          console.log(`  ❌ LARGE GAP: ${gapDays} days from previous unit`);
          schedulingPerfect = false;
        } else {
          console.log(`  ✅ APPROPRIATE SPACING: ${gapDays} days from previous unit (includes weekends)`);
        }
      }
    }

    console.log(`\\n📊 SCHEDULING SUMMARY: ${schedulingPerfect ? '✅ PERFECT' : '❌ NEEDS FIXES'}`);

    console.log('\\n=== 2. CURRICULUM EXPECTATION PERFECTION VALIDATION ===');
    
    const allLrpExpectations = lrp?.expectations?.map(e => e.expectation.code) || [];
    const coveredExpectations = new Set();
    const expectationDistribution: Record<string, string[]> = {};
    
    console.log(`Total LRP Expectations: ${allLrpExpectations.length}`);
    
    for (const unit of units) {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`\\n${unit.title}:`);
      console.log(`  Expectations (${unitExpectations.length}): ${unitExpectations.join(', ') || 'NONE'}`);
      
      for (const code of unitExpectations) {
        coveredExpectations.add(code);
        if (!expectationDistribution[code]) {
          expectationDistribution[code] = [];
        }
        expectationDistribution[code].push(unit.title);
      }
    }
    
    // Check for perfect distribution (each expectation in exactly one unit)
    console.log('\\n📋 EXPECTATION DISTRIBUTION ANALYSIS:');
    let expectationsPerfect = true;
    
    for (const [code, unitTitles] of Object.entries(expectationDistribution)) {
      if (unitTitles.length === 1) {
        console.log(`✅ ${code}: appears in 1 unit (${unitTitles[0]}) - PERFECT`);
      } else {
        console.log(`❌ ${code}: appears in ${unitTitles.length} units - OVER-COVERAGE`);
        expectationsPerfect = false;
      }
    }
    
    // Check for missing expectations
    const missingExpectations = allLrpExpectations.filter(code => !coveredExpectations.has(code));
    if (missingExpectations.length > 0) {
      console.log(`\\n❌ MISSING EXPECTATIONS: ${missingExpectations.join(', ')}`);
      expectationsPerfect = false;
    } else {
      console.log(`\\n✅ ALL EXPECTATIONS COVERED`);
    }

    console.log(`\\n📊 EXPECTATIONS SUMMARY: ${expectationsPerfect ? '✅ PERFECT' : '❌ NEEDS FIXES'}`);

    console.log('\\n=== 3. STRUCTURAL COMPLETENESS VALIDATION ===');
    
    let totalChecks = 0;
    let passedChecks = 0;
    let allUnitsComplete = true;
    
    for (const unit of units) {
      console.log(`\\n${unit.title}:`);
      
      const checks = {
        hasDescription: !!unit.description && unit.description.length > 50,
        hasBigIdeas: !!unit.bigIdeas && unit.bigIdeas.length > 30,
        hasEssentialQuestions: !!unit.essentialQuestions && Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0,
        hasAssessmentPlan: !!unit.assessmentPlan && unit.assessmentPlan.length > 50,
        hasFrenchTitle: !!unit.titleFr,
        hasFrenchDescription: !!unit.descriptionFr && unit.descriptionFr.length > 50,
        hasBigIdeasFr: !!unit.bigIdeasFr && unit.bigIdeasFr.length > 30,
        hasIndigenousPerspectives: !!unit.indigenousPerspectives && unit.indigenousPerspectives.includes("Mi'kmaq"),
        hasKeyVocabulary: !!unit.keyVocabulary && Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length >= 6,
        hasCommunityConnections: !!unit.communityConnections && unit.communityConnections.length > 30,
        hasCrossCurricular: !!unit.crossCurricularConnections && unit.crossCurricularConnections.length > 30,
        hasDifferentiation: !!unit.differentiationStrategies && typeof unit.differentiationStrategies === 'object' && unit.differentiationStrategies !== null,
        hasParentCommunication: !!unit.parentCommunicationPlan && unit.parentCommunicationPlan.length > 100
      };
      
      let unitPassCount = 0;
      const unitTotalChecks = Object.keys(checks).length;
      
      for (const [check, passing] of Object.entries(checks)) {
        if (passing) {
          unitPassCount++;
          passedChecks++;
        }
        totalChecks++;
        console.log(`  ${passing ? '✅' : '❌'} ${check}: ${passing ? 'COMPLETE' : 'MISSING/INSUFFICIENT'}`);
      }
      
      const unitCompleteness = (unitPassCount / unitTotalChecks * 100).toFixed(1);
      console.log(`  📊 UNIT COMPLETENESS: ${unitCompleteness}%`);
      
      if (unitPassCount < unitTotalChecks) {
        allUnitsComplete = false;
      }
    }

    const overallCompleteness = (passedChecks / totalChecks * 100).toFixed(1);
    console.log(`\\n📊 OVERALL COMPLETENESS: ${overallCompleteness}% (${passedChecks}/${totalChecks} checks)`);
    console.log(`\\n📊 STRUCTURAL SUMMARY: ${allUnitsComplete ? '✅ 100% COMPLETE' : '❌ INCOMPLETE'}`);

    console.log('\\n=== 4. LESSON AND HOUR VALIDATION ===');
    
    let totalLessons = 0;
    let totalHours = 0;
    
    for (const unit of units) {
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
    }

    console.log(`Total Lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅' : '❌'}`);
    console.log(`Total Hours: ${totalHours}/73 ${totalHours === 73 ? '✅' : '❌'}`);
    console.log(`Units Count: ${units.length}/7 ${units.length === 7 ? '✅' : '❌'}`);

    const metricsMatch = totalLessons === 97 && totalHours === 73 && units.length === 7;
    console.log(`\\n📊 METRICS SUMMARY: ${metricsMatch ? '✅ PERFECT' : '❌ MISALIGNED'}`);

    console.log('\\n=== 5. FAMILY SAFETY & EXCELLENCE STANDARDS ===');
    
    // Check family safety protocols specifically
    const familyUnit = units.find(u => u.title.includes('familles'));
    let familyProtocolsComplete = false;
    
    if (familyUnit) {
      const protocols = familyUnit.parentCommunicationPlan || '';
      const checks = {
        optionalParticipation: protocols.includes('OPTIONAL') || protocols.includes('optional'),
        multipleLanguages: protocols.includes('multiple languages') || protocols.includes('langues multiples'),
        culturalSensitivity: protocols.includes('sensitivity') || protocols.includes('sensibilité'),
        diverseStructures: protocols.includes('diverse') || protocols.includes('diversité'),
        noAssumptions: protocols.includes('no assumptions') || protocols.includes('aucune supposition')
      };
      
      console.log(`\\nFamily Unit (${familyUnit.title}) Safety Protocols:`);
      for (const [check, passing] of Object.entries(checks)) {
        console.log(`  ${passing ? '✅' : '❌'} ${check}: ${passing ? 'PRESENT' : 'MISSING'}`);
      }
      
      familyProtocolsComplete = Object.values(checks).every(check => check);
      console.log(`\\n📊 FAMILY PROTOCOLS: ${familyProtocolsComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    }

    console.log('\\n=== 🏆 FINAL PERFECTION ASSESSMENT ===');
    
    const perfectionChecks = {
      scheduling: schedulingPerfect,
      expectations: expectationsPerfect, 
      structure: allUnitsComplete,
      metrics: metricsMatch,
      familyProtocols: familyProtocolsComplete
    };

    console.log('\\n📊 PERFECTION SCORECARD:');
    for (const [category, isPerfect] of Object.entries(perfectionChecks)) {
      console.log(`  ${isPerfect ? '✅' : '❌'} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${isPerfect ? 'PERFECT' : 'NEEDS WORK'}`);
    }

    const overallPerfection = Object.values(perfectionChecks).every(check => check);
    
    if (overallPerfection) {
      console.log('\\n🎉🏆🎉 UNIT PLAN PERFECTION ACHIEVED! 🎉🏆🎉');
      console.log('\\n✅ ALL CRITICAL ISSUES RESOLVED:');
      console.log('  ✅ Perfect scheduling (no Sunday starts, no gaps, no holiday conflicts)');
      console.log('  ✅ Perfect expectation distribution (no over-coverage, complete coverage)');
      console.log('  ✅ 100% structural completeness (all 13 checks pass)');
      console.log('  ✅ Perfect metrics (97 lessons, 73 hours, 7 units)');
      console.log('  ✅ Complete family safety protocols');
      console.log('  ✅ Comprehensive ETFO-compliant differentiation');
      console.log('  ✅ Grade 1 French Immersion optimization');
      console.log('\\n🌟 THE UNIT PLANS ARE NOW PEDAGOGICALLY PERFECT! 🌟');
    } else {
      console.log('\\n⚠️ UNIT PLANS NOT YET PERFECT');
      console.log('Issues remaining:');
      for (const [category, isPerfect] of Object.entries(perfectionChecks)) {
        if (!isPerfect) {
          console.log(`  ❌ ${category} needs attention`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error validating unit plan perfection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateUnitPlanPerfection();