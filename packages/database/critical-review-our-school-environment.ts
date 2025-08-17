import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticallyReviewOurSchoolEnvironmentLessons() {
  console.log('🔍 CRITICAL PEDAGOGICAL REVIEW: "Our School Environment" Unit');
  console.log('============================================================\n');

  // Get all lessons in the Our School Environment unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Our School Environment',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    },
    include: {
      unitPlan: {
        include: {
          expectations: {
            include: {
              expectation: true
            }
          }
        }
      },
      expectations: {
        include: {
          expectation: true
        }
      }
    },
    orderBy: [
      { date: 'asc' }
    ]
  });

  console.log(`📊 REVIEWING ${lessons.length} LESSONS FOR PEDAGOGICAL EXCELLENCE\n`);

  // Quality metrics
  let pedagogicalScore = 0;
  let maxPossibleScore = 0;
  const qualityChecks = [];

  // 1. ETFO COMPLIANCE REVIEW
  console.log('🎯 1. ETFO COMPLIANCE REVIEW');
  console.log('============================');

  let etfoCompliantCount = 0;
  let properTimingCount = 0;
  let differentiationCount = 0;
  let indigenousCount = 0;
  let assessmentCount = 0;

  lessons.forEach((lesson, index) => {
    const hasProperDuration = lesson.duration === 45;
    const hasProperTiming = 
      lesson.mindsOn?.includes('(8 minutes)') &&
      lesson.action?.includes('(27 minutes)') &&
      lesson.consolidation?.includes('(10 minutes)');
    const hasDifferentiation = 
      lesson.differentiationStrategies && 
      typeof lesson.differentiationStrategies === 'object';
    const hasIndigenous = 
      lesson.indigenousPerspectives && 
      lesson.indigenousPerspectives.length >= 100;
    const hasAssessment = 
      lesson.assessmentNotes && 
      lesson.assessmentNotes.includes('☐');

    if (hasProperDuration && hasProperTiming) etfoCompliantCount++;
    if (hasProperTiming) properTimingCount++;
    if (hasDifferentiation) differentiationCount++;
    if (hasIndigenous) indigenousCount++;
    if (hasAssessment) assessmentCount++;

    console.log(`Lesson ${index + 1}: ${lesson.title}`);
    console.log(`  Duration: ${hasProperDuration ? '✅' : '❌'} ${lesson.duration} min`);
    console.log(`  Timing: ${hasProperTiming ? '✅' : '❌'} Structure timing`);
    console.log(`  Differentiation: ${hasDifferentiation ? '✅' : '❌'} JSON strategies`);
    console.log(`  Indigenous: ${hasIndigenous ? '✅' : '❌'} ${lesson.indigenousPerspectives?.length || 0} chars`);
    console.log(`  Assessment: ${hasAssessment ? '✅' : '❌'} Observable checkboxes`);
    console.log('');
  });

  console.log(`ETFO COMPLIANCE SUMMARY:`);
  console.log(`Duration (45 min): ${etfoCompliantCount}/${lessons.length} (${((etfoCompliantCount/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Proper timing: ${properTimingCount}/${lessons.length} (${((properTimingCount/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Differentiation: ${differentiationCount}/${lessons.length} (${((differentiationCount/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Indigenous perspectives: ${indigenousCount}/${lessons.length} (${((indigenousCount/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Assessment strategies: ${assessmentCount}/${lessons.length} (${((assessmentCount/lessons.length)*100).toFixed(1)}%)`);

  // 2. SCIENCE INQUIRY REVIEW
  console.log('\n🔬 2. SCIENCE INQUIRY PEDAGOGICAL REVIEW');
  console.log('========================================');

  let inquiryScore = 0;
  let handsOnScore = 0;
  let vocabularyScore = 0;

  lessons.forEach((lesson, index) => {
    // Check for inquiry elements
    const hasQuestionFormation = 
      lesson.mindsOn?.toLowerCase().includes('question') ||
      lesson.action?.toLowerCase().includes('question');
    const hasInvestigation = 
      lesson.action?.toLowerCase().includes('investigation') ||
      lesson.action?.toLowerCase().includes('exploration') ||
      lesson.action?.toLowerCase().includes('observation');
    const hasHandsOnActivities = 
      lesson.materials && 
      lesson.materials.length > 0 &&
      lesson.action?.toLowerCase().includes('hands-on') ||
      lesson.action?.toLowerCase().includes('manipulation') ||
      lesson.action?.toLowerCase().includes('exploration');
    const hasScientificVocabulary = 
      lesson.action?.toLowerCase().includes('vocabulaire') ||
      lesson.consolidation?.toLowerCase().includes('mots');

    console.log(`Lesson ${index + 1}: ${lesson.title}`);
    console.log(`  Question formation: ${hasQuestionFormation ? '✅' : '❌'}`);
    console.log(`  Investigation focus: ${hasInvestigation ? '✅' : '❌'}`);
    console.log(`  Hands-on activities: ${hasHandsOnActivities ? '✅' : '❌'}`);
    console.log(`  Scientific vocabulary: ${hasScientificVocabulary ? '✅' : '❌'}`);
    console.log(`  Materials count: ${lesson.materials ? lesson.materials.length : 0}`);

    if (hasQuestionFormation && hasInvestigation) inquiryScore++;
    if (hasHandsOnActivities) handsOnScore++;
    if (hasScientificVocabulary) vocabularyScore++;
  });

  console.log(`\nSCIENCE INQUIRY SUMMARY:`);
  console.log(`Inquiry-based approach: ${inquiryScore}/${lessons.length} (${((inquiryScore/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Hands-on activities: ${handsOnScore}/${lessons.length} (${((handsOnScore/lessons.length)*100).toFixed(1)}%)`);
  console.log(`Vocabulary development: ${vocabularyScore}/${lessons.length} (${((vocabularyScore/lessons.length)*100).toFixed(1)}%)`);

  // 3. CURRICULUM COVERAGE REVIEW
  console.log('\n🎯 3. CURRICULUM COVERAGE REVIEW');
  console.log('=================================');

  const unitExpectations = lessons[0]?.unitPlan.expectations || [];
  const expectationCodes = unitExpectations.map(e => e.expectation.code);
  console.log(`Unit expectations: ${expectationCodes.join(', ')}`);

  // Count how many lessons cover each expectation
  const expectationCoverage = {};
  unitExpectations.forEach(exp => {
    expectationCoverage[exp.expectation.code] = 0;
  });

  lessons.forEach(lesson => {
    lesson.expectations.forEach(exp => {
      if (expectationCoverage[exp.expectation.code] !== undefined) {
        expectationCoverage[exp.expectation.code]++;
      }
    });
  });

  console.log('\nExpectation coverage by lessons:');
  Object.entries(expectationCoverage).forEach(([code, count]) => {
    const expectation = unitExpectations.find(e => e.expectation.code === code);
    console.log(`${code}: ${count} lessons - ${expectation?.expectation.description}`);
  });

  const wellCoveredExpectations = Object.values(expectationCoverage).filter(count => count >= 3).length;
  const coveragePercentage = (wellCoveredExpectations / unitExpectations.length) * 100;

  console.log(`\nCoverage quality: ${wellCoveredExpectations}/${unitExpectations.length} expectations have 3+ lessons (${coveragePercentage.toFixed(1)}%)`);

  // 4. PEDAGOGICAL PROGRESSION REVIEW
  console.log('\n📈 4. PEDAGOGICAL PROGRESSION REVIEW');
  console.log('===================================');

  const progressionElements = [
    'Foundation building (lessons 1-2)',
    'Skill development (lessons 3-6)', 
    'Application (lessons 7-10)',
    'Integration & assessment (lessons 11-12)'
  ];

  console.log('Lesson progression analysis:');
  console.log(`1-2 (Foundation): ${lessons.slice(0,2).map(l => l.title).join(', ')}`);
  console.log(`3-6 (Development): ${lessons.slice(2,6).map(l => l.title).join(', ')}`);
  console.log(`7-10 (Application): ${lessons.slice(6,10).map(l => l.title).join(', ')}`);
  console.log(`11-12 (Integration): ${lessons.slice(10,12).map(l => l.title).join(', ')}`);

  // 5. FRENCH IMMERSION QUALITY REVIEW
  console.log('\n🇫🇷 5. FRENCH IMMERSION QUALITY REVIEW');
  console.log('======================================');

  let frenchQualityScore = 0;
  lessons.forEach((lesson, index) => {
    const hasFrenchContent = 
      lesson.mindsOn && lesson.mindsOn.includes('à') && lesson.mindsOn.includes('les') ||
      lesson.action && lesson.action.includes('des') && lesson.action.includes('avec');
    const hasBilingualMaterials = 
      lesson.materials && lesson.materials.some(m => 
        typeof m === 'string' && (m.includes('bilingual') || m.includes('français')));
    
    if (hasFrenchContent) frenchQualityScore++;
    
    console.log(`Lesson ${index + 1}: French immersion content ${hasFrenchContent ? '✅' : '❌'}`);
  });

  console.log(`French immersion quality: ${frenchQualityScore}/${lessons.length} (${((frenchQualityScore/lessons.length)*100).toFixed(1)}%)`);

  // OVERALL QUALITY ASSESSMENT
  console.log('\n🏆 OVERALL PEDAGOGICAL QUALITY ASSESSMENT');
  console.log('==========================================');

  const scores = {
    'ETFO Compliance': ((etfoCompliantCount + properTimingCount + differentiationCount + indigenousCount + assessmentCount) / (lessons.length * 5)) * 100,
    'Science Inquiry': ((inquiryScore + handsOnScore + vocabularyScore) / (lessons.length * 3)) * 100,
    'Curriculum Coverage': coveragePercentage,
    'French Immersion': (frenchQualityScore / lessons.length) * 100
  };

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

  console.log('\nDETAILED SCORES:');
  Object.entries(scores).forEach(([category, score]) => {
    const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 85 ? 'B+' : score >= 80 ? 'B' : score >= 75 ? 'C+' : score >= 70 ? 'C' : 'NEEDS IMPROVEMENT';
    console.log(`${category}: ${score.toFixed(1)}% (${grade})`);
  });

  console.log(`\nOVERALL PEDAGOGICAL QUALITY: ${overallScore.toFixed(1)}%`);
  
  const overallGrade = overallScore >= 95 ? 'A+ (EXCEPTIONAL)' : 
                     overallScore >= 90 ? 'A (EXCELLENT)' : 
                     overallScore >= 85 ? 'B+ (VERY GOOD)' : 
                     overallScore >= 80 ? 'B (GOOD)' : 
                     overallScore >= 75 ? 'C+ (SATISFACTORY)' : 
                     overallScore >= 70 ? 'C (NEEDS IMPROVEMENT)' : 
                     'UNSATISFACTORY';

  console.log(`FINAL GRADE: ${overallGrade}`);

  // RECOMMENDATIONS
  console.log('\n💡 PEDAGOGICAL RECOMMENDATIONS');
  console.log('==============================');

  if (overallScore >= 90) {
    console.log('✅ These lessons meet exceptional pedagogical standards!');
    console.log('✅ Ready for implementation with high confidence');
    console.log('✅ Can serve as model lessons for other units');
  } else if (overallScore >= 80) {
    console.log('🔄 These lessons meet good standards but could be enhanced:');
    if (scores['Science Inquiry'] < 90) {
      console.log('- Consider adding more explicit hypothesis formation activities');
      console.log('- Increase hands-on investigation components');
    }
    if (scores['French Immersion'] < 90) {
      console.log('- Strengthen French language integration in all activities');
      console.log('- Add more bilingual vocabulary development');
    }
  } else {
    console.log('❌ These lessons need significant improvements before implementation');
    console.log('- Review all areas scoring below 80%');
    console.log('- Consider complete revision of weak lessons');
  }

  console.log('\n🎯 READY FOR NEXT UNIT?');
  console.log('========================');
  if (overallScore >= 85) {
    console.log('✅ YES - This unit quality is sufficient to proceed to Fall Changes unit');
    console.log('📋 Apply these same high standards to the next 24 lessons');
  } else {
    console.log('❌ NO - Improve this unit before proceeding to maintain quality standards');
  }
}

// Run the critical review
criticallyReviewOurSchoolEnvironmentLessons()
  .catch((error) => {
    console.error('❌ Error reviewing lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });