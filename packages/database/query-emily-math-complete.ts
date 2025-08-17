import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyMathComplete() {
  console.log('📊 CRITICAL REVIEW: Emily McIsaac (ID 23) - Mathématiques Complete System...\n');

  // Get Long Range Plan
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    },
    include: {
      expectations: {
        include: {
          expectation: true
        }
      },
      unitPlans: {
        include: {
          expectations: {
            include: {
              expectation: true
            }
          },
          lessonPlans: {
            include: {
              expectations: {
                include: {
                  expectation: true
                }
              }
            },
            orderBy: {
              date: 'asc'
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      }
    }
  });

  if (!mathLRP) {
    console.log('❌ No Math Long Range Plan found for Emily McIsaac (ID 23)');
    return;
  }

  console.log('🎯 LONG RANGE PLAN REVIEW:');
  console.log('===========================');
  console.log(`Title: ${mathLRP.title}`);
  console.log(`Academic Year: ${mathLRP.academicYear}`);
  console.log(`Term: ${mathLRP.term}`);
  console.log(`Subject: ${mathLRP.subject}`);
  console.log(`Total Expectations: ${mathLRP.expectations.length}`);
  console.log(`Total Units: ${mathLRP.unitPlans.length}`);

  // Critical Issues in LRP
  console.log('\n❌ LRP CRITICAL ISSUES:');
  console.log('========================');
  
  if (!mathLRP.academicYear || mathLRP.academicYear !== '2025-2026') {
    console.log('⚠️  Academic year issues');
  }

  if (!mathLRP.assessmentOverview || mathLRP.assessmentOverview.length < 100) {
    console.log('⚠️  Inadequate assessment overview');
  }

  if (!mathLRP.differentiationFramework || typeof mathLRP.differentiationFramework !== 'string') {
    console.log('⚠️  Missing/weak differentiation framework');
  }

  // Unit Plans Review
  console.log('\n📚 UNIT PLANS REVIEW:');
  console.log('======================');
  
  let totalLessons = 0;
  let totalHours = 0;
  
  for (const [index, unit] of mathLRP.unitPlans.entries()) {
    console.log(`\n${index + 1}. ${unit.title}`);
    console.log(`   📅 ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    console.log(`   ⏱️  ${unit.estimatedHours} hours`);
    console.log(`   📝 ${unit.lessonPlans.length} lessons`);
    console.log(`   🎯 ${unit.expectations.length} expectations`);
    
    totalLessons += unit.lessonPlans.length;
    totalHours += unit.estimatedHours || 0;

    // Unit Issues
    if (!unit.bigIdeas || unit.bigIdeas.length < 50) {
      console.log(`   ❌ Weak big ideas`);
    }
    
    if (!unit.essentialQuestions || !Array.isArray(JSON.parse(unit.essentialQuestions || '[]'))) {
      console.log(`   ❌ Missing/invalid essential questions`);
    }

    if (!unit.assessmentPlan || unit.assessmentPlan.length < 50) {
      console.log(`   ❌ Inadequate assessment plan`);
    }

    if (unit.lessonPlans.length === 0) {
      console.log(`   ❌ NO LESSONS FOUND`);
    }

    // Calculate timing issues
    const daysBetween = (unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 3600 * 24);
    const schoolDays = Math.floor(daysBetween * 5/7); // Rough estimate
    const expectedLessons = Math.floor(schoolDays * 0.75); // ~45 min math daily

    if (unit.lessonPlans.length < expectedLessons * 0.8) {
      console.log(`   ❌ Likely insufficient lessons (${unit.lessonPlans.length} vs ~${expectedLessons} expected)`);
    }
  }

  console.log(`\n📊 SYSTEM TOTALS:`);
  console.log(`=================`);
  console.log(`Total Lessons: ${totalLessons}`);
  console.log(`Expected: ~226 lessons (as stated)`);
  console.log(`Match: ${totalLessons === 226 ? '✅ YES' : '❌ NO'}`);
  console.log(`Total Hours: ${totalHours}`);

  // Lesson Plans Critical Review
  console.log(`\n🔍 LESSON PLANS CRITICAL ANALYSIS:`);
  console.log(`===================================`);

  let invalidDuration = 0;
  let missingETFO = 0;
  let weakDifferentiation = 0;
  let missingIndigenous = 0;
  let inadequateAssessment = 0;
  let ageInappropriate = 0;

  const allLessons = mathLRP.unitPlans.flatMap(unit => unit.lessonPlans);

  allLessons.forEach((lesson, index) => {
    // Duration check
    if (lesson.duration !== 45) {
      invalidDuration++;
    }

    // ETFO structure check (8/27/10)
    const hasETFOStructure = 
      lesson.mindsOn && lesson.action && lesson.consolidation &&
      lesson.mindsOn.includes('(8 minute') &&
      lesson.action.includes('(27 minute') &&
      lesson.consolidation.includes('(10 minute');
    
    if (!hasETFOStructure) {
      missingETFO++;
    }

    // Differentiation check
    if (!lesson.differentiationStrategies || 
        typeof lesson.differentiationStrategies !== 'object' ||
        !lesson.differentiationStrategies.toString().includes('forStruggling')) {
      weakDifferentiation++;
    }

    // Indigenous perspectives
    if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 100) {
      missingIndigenous++;
    }

    // Assessment check
    if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
      inadequateAssessment++;
    }

    // Age appropriateness for Grade 1 (very basic check)
    const content = `${lesson.mindsOn} ${lesson.action} ${lesson.consolidation}`.toLowerCase();
    if (content.includes('multiply') || content.includes('divide') || content.includes('fraction')) {
      ageInappropriate++;
    }
  });

  console.log(`Duration (not 45 min): ${invalidDuration} lessons`);
  console.log(`Missing ETFO 8/27/10 structure: ${missingETFO} lessons`);
  console.log(`Weak differentiation: ${weakDifferentiation} lessons`);
  console.log(`Missing Indigenous perspectives: ${missingIndigenous} lessons`);
  console.log(`Inadequate assessment: ${inadequateAssessment} lessons`);
  console.log(`Age inappropriate content: ${ageInappropriate} lessons`);

  // Grade 1 specific checks
  console.log(`\n👶 GRADE 1 APPROPRIATENESS:`);
  console.log(`============================`);
  
  const manipulativeCount = allLessons.filter(lesson => 
    (lesson.materials && lesson.materials.toString().toLowerCase().includes('manipulatives')) ||
    (lesson.action && lesson.action.toLowerCase().includes('concrete'))
  ).length;

  console.log(`Lessons with manipulatives/concrete: ${manipulativeCount}/${allLessons.length}`);
  if (manipulativeCount < allLessons.length * 0.8) {
    console.log(`❌ Insufficient hands-on learning for Grade 1`);
  }

  // French vocabulary integration
  const frenchVocabCount = allLessons.filter(lesson =>
    (lesson.titleFr && lesson.titleFr.length > 0) ||
    (lesson.learningGoalsFr && lesson.learningGoalsFr.length > 0)
  ).length;

  console.log(`Lessons with French vocabulary: ${frenchVocabCount}/${allLessons.length}`);
  if (frenchVocabCount < allLessons.length * 0.9) {
    console.log(`❌ Insufficient French integration for immersion`);
  }

  // Sample lesson for detailed review
  if (allLessons.length > 0) {
    console.log(`\n📋 SAMPLE LESSON DETAILED REVIEW:`);
    console.log(`==================================`);
    const sample = allLessons[0];
    console.log(`Title: ${sample.title}`);
    console.log(`Date: ${sample.date.toISOString().split('T')[0]}`);
    console.log(`Duration: ${sample.duration} minutes`);
    console.log(`Unit: ${mathLRP.unitPlans.find(u => u.id === sample.unitPlanId)?.title}`);
    
    console.log(`\nETFO Structure Analysis:`);
    console.log(`MindsOn: ${sample.mindsOn ? 'Present' : 'Missing'}`);
    console.log(`Action: ${sample.action ? 'Present' : 'Missing'}`);
    console.log(`Consolidation: ${sample.consolidation ? 'Present' : 'Missing'}`);
    
    console.log(`\nDifferentiation: ${sample.differentiationStrategies ? 'Present' : 'Missing'}`);
    console.log(`Assessment: ${sample.assessmentNotes ? 'Present' : 'Missing'}`);
    console.log(`Indigenous: ${sample.indigenousPerspectives ? 'Present' : 'Missing'}`);
  }

  // Final Critical Assessment
  console.log(`\n🚨 FINAL CRITICAL ASSESSMENT:`);
  console.log(`==============================`);
  
  const totalIssues = invalidDuration + missingETFO + weakDifferentiation + 
                     missingIndigenous + inadequateAssessment + ageInappropriate;
  
  console.log(`Total Critical Issues: ${totalIssues}`);
  console.log(`Lessons Affected: ${totalIssues}/${allLessons.length} (${Math.round(totalIssues/allLessons.length*100)}%)`);
  
  if (totalIssues === 0) {
    console.log(`✅ PERFECT SYSTEM`);
  } else if (totalIssues < allLessons.length * 0.1) {
    console.log(`🟡 MINOR ISSUES - Good overall`);
  } else if (totalIssues < allLessons.length * 0.3) {
    console.log(`🟠 MODERATE ISSUES - Needs improvement`);
  } else {
    console.log(`🔴 MAJOR ISSUES - Significant problems`);
  }
}

// Run the critical review
queryEmilyMathComplete()
  .catch((error) => {
    console.error('❌ Error in critical review:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });