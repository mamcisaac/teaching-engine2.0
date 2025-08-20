import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualReviewSocialStudies() {
  try {
    console.log('🔍 MANUAL REVIEW: SOCIAL STUDIES UNIT PLANS');
    console.log('Deep analysis without automated validation');
    
    // Get the Long Range Plan first
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    if (!lrp) {
      console.log('❌ Long Range Plan not found');
      return;
    }
    
    console.log('\n📋 LONG RANGE PLAN ANALYSIS:');
    console.log(`Subject: ${lrp.subject}`);
    console.log(`Grade: ${lrp.grade}`);
    console.log(`Title: ${lrp.title}`);
    console.log(`Description: ${lrp.description?.substring(0, 200)}...`);
    
    const lrpExpectations = lrp.expectations.map(e => e.expectation.code).sort();
    console.log(`LRP Expectations: [${lrpExpectations.join(', ')}]`);
    
    // Get all units with full details
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            title: true,
            date: true,
            duration: true,
            mindsOn: true,
            action: true,
            consolidation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`\nFound ${units.length} units to review\n`);
    
    // Manual analysis of each unit
    console.log('=' .repeat(100));
    console.log('DETAILED UNIT ANALYSIS');
    console.log('=' .repeat(100));
    
    let totalExpectationsCovered = new Set<string>();
    let totalLessons = 0;
    let totalHours = 0;
    let issues: string[] = [];
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`\n📚 UNIT ${unitNum}: ${unit.title}`);
      console.log(`French Title: ${unit.titleFr}`);
      console.log(`Period: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // Check expectations for this unit
      const unitExpectations = unit.expectations.map(e => e.expectation.code).sort();
      console.log(`Expectations: [${unitExpectations.join(', ')}]`);
      unitExpectations.forEach(code => totalExpectationsCovered.add(code));
      
      // Content quality analysis
      console.log('\n🎯 CONTENT QUALITY:');
      console.log(`Description: ${unit.description ? 'YES' : 'MISSING'} (${unit.description?.length || 0} chars)`);
      console.log(`Description FR: ${unit.descriptionFr ? 'YES' : 'MISSING'} (${unit.descriptionFr?.length || 0} chars)`);
      console.log(`Big Ideas: ${unit.bigIdeas ? 'YES' : 'MISSING'} (${unit.bigIdeas?.length || 0} chars)`);
      console.log(`Big Ideas FR: ${unit.bigIdeasFr ? 'YES' : 'MISSING'} (${unit.bigIdeasFr?.length || 0} chars)`);
      
      const hasEssentialQuestions = unit.essentialQuestions && Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0;
      console.log(`Essential Questions: ${hasEssentialQuestions ? 'YES' : 'MISSING'} (${hasEssentialQuestions ? unit.essentialQuestions.length : 0} questions)`);
      
      const hasVocabulary = unit.keyVocabulary && Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length >= 6;
      console.log(`Key Vocabulary: ${hasVocabulary ? 'YES' : 'INSUFFICIENT'} (${unit.keyVocabulary?.length || 0} terms)`);
      
      console.log(`Assessment Plan: ${unit.assessmentPlan ? 'YES' : 'MISSING'} (${unit.assessmentPlan?.length || 0} chars)`);
      console.log(`Indigenous Perspectives: ${unit.indigenousPerspectives ? 'YES' : 'MISSING'} (${unit.indigenousPerspectives?.length || 0} chars)`);
      console.log(`Differentiation: ${unit.differentiationStrategies ? 'YES' : 'MISSING'}`);
      console.log(`Parent Communication: ${unit.parentCommunicationPlan ? 'YES' : 'MISSING'} (${unit.parentCommunicationPlan?.length || 0} chars)`);
      
      // Lesson analysis
      console.log('\n📅 LESSON ANALYSIS:');
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        console.log(`First lesson: ${firstLesson.toDateString()}`);
        console.log(`Last lesson: ${lastLesson.toDateString()}`);
        
        // Check for Christmas break violations
        const christmasStart = new Date('2025-12-19');
        const christmasEnd = new Date('2026-01-05');
        
        const christmasLessons = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= christmasStart && date <= christmasEnd;
        });
        
        if (christmasLessons.length > 0) {
          issues.push(`Unit ${unitNum} has ${christmasLessons.length} lessons during Christmas break`);
          console.log(`⚠️ CHRISTMAS VIOLATION: ${christmasLessons.length} lessons during break`);
        } else {
          console.log(`✅ Christmas break respected`);
        }
        
        // Sample lesson quality
        const sampleLesson = unit.lessonPlans[0];
        console.log(`Sample lesson structure:`);
        console.log(`  Title: ${sampleLesson.title}`);
        console.log(`  Minds On: ${sampleLesson.mindsOn ? 'YES' : 'MISSING'}`);
        console.log(`  Action: ${sampleLesson.action ? 'YES' : 'MISSING'}`);
        console.log(`  Consolidation: ${sampleLesson.consolidation ? 'YES' : 'MISSING'}`);
        console.log(`  Duration: ${sampleLesson.duration} minutes`);
      } else {
        issues.push(`Unit ${unitNum} has no lessons`);
        console.log(`❌ NO LESSONS FOUND`);
      }
      
      // Unit size validation
      if (unit.lessonPlans.length < 12 || unit.lessonPlans.length > 16) {
        issues.push(`Unit ${unitNum} has ${unit.lessonPlans.length} lessons (outside 12-16 range)`);
        console.log(`⚠️ UNIT SIZE: ${unit.lessonPlans.length} lessons (target: 12-16)`);
      } else {
        console.log(`✅ Unit size appropriate: ${unit.lessonPlans.length} lessons`);
      }
      
      console.log('\n' + '-'.repeat(80));
    }
    
    // Overall analysis
    console.log('\n' + '='.repeat(100));
    console.log('OVERALL ANALYSIS');
    console.log('=' .repeat(100));
    
    console.log(`\n📊 QUANTITATIVE ANALYSIS:`);
    console.log(`Total Units: ${units.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Total Hours: ${totalHours}`);
    console.log(`Expectations Covered: ${totalExpectationsCovered.size}/${lrpExpectations.length}`);
    
    // Expectation coverage analysis
    console.log(`\n📋 EXPECTATION COVERAGE:`);
    console.log(`LRP has: [${lrpExpectations.join(', ')}]`);
    console.log(`Units cover: [${Array.from(totalExpectationsCovered).sort().join(', ')}]`);
    
    const uncoveredExpectations = lrpExpectations.filter(code => !totalExpectationsCovered.has(code));
    const extraExpectations = Array.from(totalExpectationsCovered).filter(code => !lrpExpectations.includes(code));
    
    if (uncoveredExpectations.length > 0) {
      issues.push(`Uncovered expectations: ${uncoveredExpectations.join(', ')}`);
      console.log(`❌ UNCOVERED: [${uncoveredExpectations.join(', ')}]`);
    } else {
      console.log(`✅ All LRP expectations covered`);
    }
    
    if (extraExpectations.length > 0) {
      console.log(`⚠️ EXTRA: [${extraExpectations.join(', ')}] (not in LRP)`);
    }
    
    // Target validation
    console.log(`\n🎯 TARGET VALIDATION:`);
    const targetLessons = 97;
    const targetUnits = 7;
    const targetHoursMin = 72.5;
    const targetHoursMax = 73.0;
    
    console.log(`Lessons: ${totalLessons}/${targetLessons} ${totalLessons === targetLessons ? '✅' : '❌'}`);
    console.log(`Units: ${units.length}/${targetUnits} ${units.length === targetUnits ? '✅' : '❌'}`);
    console.log(`Hours: ${totalHours} (target: ${targetHoursMin}-${targetHoursMax}) ${totalHours >= targetHoursMin && totalHours <= targetHoursMax ? '✅' : '❌'}`);
    
    // Issues summary
    console.log(`\n⚠️ ISSUES IDENTIFIED:`);
    if (issues.length === 0) {
      console.log(`✅ NO ISSUES FOUND`);
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Content excellence check
    console.log(`\n🌟 CONTENT EXCELLENCE CHECK:`);
    let contentScore = 0;
    let maxContentScore = 0;
    
    for (const unit of units) {
      maxContentScore += 10; // 10 content elements per unit
      
      if (unit.description && unit.description.length > 100) contentScore++;
      if (unit.descriptionFr && unit.descriptionFr.length > 50) contentScore++;
      if (unit.bigIdeas && unit.bigIdeas.length > 50) contentScore++;
      if (unit.bigIdeasFr && unit.bigIdeasFr.length > 30) contentScore++;
      if (unit.essentialQuestions && Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0) contentScore++;
      if (unit.keyVocabulary && Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length >= 6) contentScore++;
      if (unit.assessmentPlan && unit.assessmentPlan.length > 100) contentScore++;
      if (unit.indigenousPerspectives && unit.indigenousPerspectives.includes("Mi'kmaq")) contentScore++;
      if (unit.differentiationStrategies) contentScore++;
      if (unit.parentCommunicationPlan && unit.parentCommunicationPlan.length > 100) contentScore++;
    }
    
    const contentPercentage = (contentScore / maxContentScore * 100).toFixed(1);
    console.log(`Content completeness: ${contentScore}/${maxContentScore} (${contentPercentage}%)`);
    
    // Final verdict
    console.log(`\n🏆 FINAL VERDICT:`);
    
    const isPerfect = issues.length === 0 && 
                     totalLessons === targetLessons && 
                     units.length === targetUnits && 
                     totalHours >= targetHoursMin && 
                     totalHours <= targetHoursMax &&
                     uncoveredExpectations.length === 0 &&
                     contentScore === maxContentScore;
    
    if (isPerfect) {
      console.log(`🎉 UNITS ARE TRULY PERFECT! 🎉`);
      console.log(`✅ Mathematical precision achieved`);
      console.log(`✅ All expectations covered`);
      console.log(`✅ Content excellence maintained`);
      console.log(`✅ Calendar integration perfect`);
      console.log(`✅ No structural issues`);
    } else {
      console.log(`⚠️ UNITS ARE NOT PERFECT`);
      console.log(`Issues need to be resolved before claiming perfection`);
      
      if (totalLessons !== targetLessons) console.log(`- Lesson count incorrect: ${totalLessons} vs ${targetLessons}`);
      if (units.length !== targetUnits) console.log(`- Unit count incorrect: ${units.length} vs ${targetUnits}`);
      if (totalHours < targetHoursMin || totalHours > targetHoursMax) console.log(`- Hours incorrect: ${totalHours} vs ${targetHoursMin}-${targetHoursMax}`);
      if (uncoveredExpectations.length > 0) console.log(`- Missing expectations: ${uncoveredExpectations.join(', ')}`);
      if (contentScore < maxContentScore) console.log(`- Content incomplete: ${contentPercentage}%`);
      if (issues.length > 0) console.log(`- ${issues.length} structural issues`);
    }
    
  } catch (error) {
    console.error('❌ Error during manual review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualReviewSocialStudies();