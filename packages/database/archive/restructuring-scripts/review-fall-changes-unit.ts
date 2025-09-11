import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewFallChangesUnit() {
  console.log('🍂 REVIEWING "Fall Changes" Unit - Science Lessons for Emily McIsaac');
  console.log('====================================================================\n');

  // Get all lessons for the "Fall Changes" unit
  const fallChangesLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Fall Changes',
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
          },
          longRangePlan: {
            select: {
              subject: true,
              title: true
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
      { date: 'asc' },
      { title: 'asc' }
    ]
  });

  console.log(`📊 Found ${fallChangesLessons.length} lessons in "Fall Changes" unit\n`);

  if (fallChangesLessons.length === 0) {
    console.log('❌ No lessons found in Fall Changes unit');
    return;
  }

  // Get unit plan details
  const unitPlan = fallChangesLessons[0]?.unitPlan;
  if (unitPlan) {
    console.log('📚 UNIT PLAN DETAILS:');
    console.log('=====================');
    console.log(`Title: ${unitPlan.title}`);
    console.log(`Subject: ${unitPlan.longRangePlan?.subject}`);
    console.log(`Description: ${unitPlan.description || 'Not set'}`);
    console.log(`Big Ideas: ${unitPlan.bigIdeas || 'Not set'}`);
    console.log(`Start Date: ${unitPlan.startDate}`);
    console.log(`End Date: ${unitPlan.endDate}`);
    console.log(`Estimated Hours: ${unitPlan.estimatedHours || 'Not set'}`);
    
    console.log(`\n🎯 CURRICULUM EXPECTATIONS (${unitPlan.expectations.length}):`);
    unitPlan.expectations.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
    });
  }

  console.log(`\n📝 LESSON QUALITY ASSESSMENT:`);
  console.log('=============================');

  // Quality metrics
  let etfoCompliantCount = 0;
  let properTimingCount = 0;
  let differentiationCount = 0;
  let indigenousCount = 0;
  let assessmentCount = 0;
  let handsOnCount = 0;
  let vocabularyCount = 0;

  fallChangesLessons.forEach((lesson, index) => {
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
    const hasHandsOn = 
      lesson.action?.toLowerCase().includes('hands-on') ||
      lesson.action?.toLowerCase().includes('manipulation') ||
      lesson.action?.toLowerCase().includes('exploration');
    const hasVocabulary = 
      lesson.action?.toLowerCase().includes('vocabulaire') ||
      lesson.consolidation?.toLowerCase().includes('mots');

    if (hasProperDuration && hasProperTiming) etfoCompliantCount++;
    if (hasProperTiming) properTimingCount++;
    if (hasDifferentiation) differentiationCount++;
    if (hasIndigenous) indigenousCount++;
    if (hasAssessment) assessmentCount++;
    if (hasHandsOn) handsOnCount++;
    if (hasVocabulary) vocabularyCount++;

    console.log(`\nLesson ${index + 1}: ${lesson.title}`);
    console.log(`  Date: ${lesson.date.toDateString()}`);
    console.log(`  Duration: ${hasProperDuration ? '✅' : '❌'} ${lesson.duration} min`);
    console.log(`  Timing: ${hasProperTiming ? '✅' : '❌'} Structure timing`);
    console.log(`  Differentiation: ${hasDifferentiation ? '✅' : '❌'} JSON strategies`);
    console.log(`  Indigenous: ${hasIndigenous ? '✅' : '❌'} ${lesson.indigenousPerspectives?.length || 0} chars`);
    console.log(`  Assessment: ${hasAssessment ? '✅' : '❌'} Observable checkboxes`);
    console.log(`  Hands-on: ${hasHandsOn ? '✅' : '❌'} Activities`);
    console.log(`  Vocabulary: ${hasVocabulary ? '✅' : '❌'} Development`);
    console.log(`  Expectations: ${lesson.expectations.length} linked`);
  });

  console.log(`\n📊 QUALITY SUMMARY:`);
  console.log('==================');
  console.log(`Total lessons: ${fallChangesLessons.length}`);
  console.log(`ETFO compliant (45 min + timing): ${etfoCompliantCount}/${fallChangesLessons.length} (${((etfoCompliantCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Proper timing structure: ${properTimingCount}/${fallChangesLessons.length} (${((properTimingCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Differentiation strategies: ${differentiationCount}/${fallChangesLessons.length} (${((differentiationCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Indigenous perspectives: ${indigenousCount}/${fallChangesLessons.length} (${((indigenousCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Assessment notes: ${assessmentCount}/${fallChangesLessons.length} (${((assessmentCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Hands-on activities: ${handsOnCount}/${fallChangesLessons.length} (${((handsOnCount/fallChangesLessons.length)*100).toFixed(1)}%)`);
  console.log(`Vocabulary development: ${vocabularyCount}/${fallChangesLessons.length} (${((vocabularyCount/fallChangesLessons.length)*100).toFixed(1)}%)`);

  // Check curriculum coverage
  if (unitPlan) {
    const unitExpectations = unitPlan.expectations.map(e => e.expectation.code);
    const lessonExpectations = new Set();
    
    fallChangesLessons.forEach(lesson => {
      lesson.expectations.forEach(exp => {
        lessonExpectations.add(exp.expectation.code);
      });
    });
    
    const coveredExpectations = unitExpectations.filter(code => lessonExpectations.has(code));
    const uncoveredExpectations = unitExpectations.filter(code => !lessonExpectations.has(code));
    
    console.log(`\n🎯 CURRICULUM COVERAGE:`);
    console.log('=======================');
    console.log(`Unit expectations: ${unitExpectations.length}`);
    console.log(`Covered by lessons: ${coveredExpectations.length}`);
    console.log(`Coverage: ${((coveredExpectations.length / unitExpectations.length) * 100).toFixed(1)}%`);
    
    if (uncoveredExpectations.length > 0) {
      console.log(`\n❌ UNCOVERED EXPECTATIONS:`);
      uncoveredExpectations.forEach(code => {
        const expectation = unitPlan.expectations.find(e => e.expectation.code === code);
        console.log(`  - ${code}: ${expectation?.expectation.description}`);
      });
    }
  }

  // Calculate overall quality estimate
  const qualityScores = [
    (etfoCompliantCount / fallChangesLessons.length) * 100,
    (handsOnCount / fallChangesLessons.length) * 100,
    (vocabularyCount / fallChangesLessons.length) * 100,
    unitPlan ? ((unitPlan.expectations.length > 0 ? (new Set(fallChangesLessons.flatMap(l => l.expectations.map(e => e.expectation.code))).size / unitPlan.expectations.length) : 0) * 100) : 100
  ];

  const estimatedQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

  console.log(`\n🏆 ESTIMATED OVERALL QUALITY: ${estimatedQuality.toFixed(1)}%`);
  
  const qualityGrade = estimatedQuality >= 95 ? 'A+ (EXCEPTIONAL)' : 
                     estimatedQuality >= 90 ? 'A (EXCELLENT)' : 
                     estimatedQuality >= 85 ? 'B+ (VERY GOOD)' : 
                     estimatedQuality >= 80 ? 'B (GOOD)' : 
                     estimatedQuality >= 75 ? 'C+ (SATISFACTORY)' : 
                     estimatedQuality >= 70 ? 'C (NEEDS IMPROVEMENT)' : 
                     'UNSATISFACTORY';

  console.log(`ESTIMATED GRADE: ${qualityGrade}`);

  console.log(`\n💡 RECOMMENDATIONS:`);
  console.log('==================');
  
  if (estimatedQuality >= 90) {
    console.log('✅ This unit meets high standards and may need only minor enhancements');
  } else if (estimatedQuality >= 70) {
    console.log('🔄 This unit needs significant improvements to reach 95%+ quality');
    console.log('📋 Apply the proven methodology from Our School Environment unit');
  } else if (fallChangesLessons.length === 0) {
    console.log('🆕 No lessons exist - create 24 perfect lessons from scratch');
  } else {
    console.log('❌ This unit needs complete reconstruction');
    console.log('🗑️ Delete existing flawed lessons and rebuild from scratch');
  }

  // Show unit info for lesson creation
  if (unitPlan) {
    console.log(`\n📝 FOR LESSON CREATION:`);
    console.log('======================');
    console.log(`Unit Plan ID: ${unitPlan.id}`);
    console.log(`Timeline: ${unitPlan.startDate} to ${unitPlan.endDate}`);
    console.log(`Expected lessons: 24 (based on timeline)`);
    console.log(`Current lessons: ${fallChangesLessons.length}`);
    console.log(`\nExpectations to cover:`);
    unitPlan.expectations.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
    });
  }
}

// Run the review
reviewFallChangesUnit()
  .catch((error) => {
    console.error('❌ Error reviewing Fall Changes unit:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });