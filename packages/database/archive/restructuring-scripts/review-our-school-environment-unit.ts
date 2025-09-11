import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewOurSchoolEnvironmentUnit() {
  console.log('🏫 REVIEWING "Our School Environment" Unit - Science Lessons for Emily McIsaac');
  console.log('==============================================================================\n');

  // Get all lessons for the "Our School Environment" unit
  const schoolEnvironmentLessons = await prisma.eTFOLessonPlan.findMany({
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

  console.log(`📊 Found ${schoolEnvironmentLessons.length} lessons in "Our School Environment" unit\n`);

  if (schoolEnvironmentLessons.length === 0) {
    console.log('❌ No lessons found in Our School Environment unit');
    return;
  }

  // Get unit plan details
  const unitPlan = schoolEnvironmentLessons[0]?.unitPlan;
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

  console.log(`\n📝 DETAILED LESSON REVIEW:`);
  console.log('==========================');

  schoolEnvironmentLessons.forEach((lesson, index) => {
    console.log(`\n--- LESSON ${index + 1} ---`);
    console.log(`Title: ${lesson.title}`);
    console.log(`Date: ${lesson.date.toDateString()}`);
    console.log(`Duration: ${lesson.duration} minutes`);
    console.log(`Subject: ${lesson.subject || 'Not set'}`);
    console.log(`Grade: ${lesson.grade || 'Not set'}`);
    
    // Check timing structure
    console.log(`\nStructure Analysis:`);
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    const actionTiming = extractTiming(lesson.action);
    const consolidationTiming = extractTiming(lesson.consolidation);
    
    console.log(`  MindsOn: ${mindsOnTiming || 'No timing found'}`);
    console.log(`  Action: ${actionTiming || 'No timing found'}`);
    console.log(`  Consolidation: ${consolidationTiming || 'No timing found'}`);
    
    // Check MindsOn content
    console.log(`\nMindsOn (first 100 chars): ${lesson.mindsOn?.substring(0, 100) || 'Not set'}...`);
    
    // Check Action content  
    console.log(`Action (first 100 chars): ${lesson.action?.substring(0, 100) || 'Not set'}...`);
    
    // Check Consolidation content
    console.log(`Consolidation (first 100 chars): ${lesson.consolidation?.substring(0, 100) || 'Not set'}...`);
    
    // Check Learning Goals
    console.log(`Learning Goals: ${lesson.learningGoals?.substring(0, 100) || 'Not set'}...`);
    
    // Check Materials
    console.log(`Materials: ${lesson.materials ? JSON.stringify(lesson.materials).substring(0, 100) : 'Not set'}...`);
    
    // Check Expectations Coverage
    console.log(`Linked Expectations: ${lesson.expectations.length}`);
    lesson.expectations.forEach((exp, expIndex) => {
      console.log(`  ${expIndex + 1}. ${exp.expectation.code}`);
    });
    
    // Check Differentiation
    console.log(`Differentiation: ${lesson.differentiationStrategies ? 'Present' : 'Missing'}`);
    
    // Check Indigenous Perspectives
    console.log(`Indigenous Perspectives: ${lesson.indigenousPerspectives ? `"${lesson.indigenousPerspectives.substring(0, 50)}..."` : 'Missing'}`);
    
    // Check Assessment
    console.log(`Assessment Notes: ${lesson.assessmentNotes ? `"${lesson.assessmentNotes.substring(0, 50)}..."` : 'Missing'}`);
  });

  // Analysis Summary
  console.log(`\n📊 UNIT ANALYSIS SUMMARY:`);
  console.log('=========================');
  
  const lessonCount = schoolEnvironmentLessons.length;
  const totalDuration = schoolEnvironmentLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const avgDuration = totalDuration / lessonCount;
  
  const lessons45min = schoolEnvironmentLessons.filter(l => l.duration === 45).length;
  const lessons60min = schoolEnvironmentLessons.filter(l => l.duration === 60).length;
  
  const withTiming = schoolEnvironmentLessons.filter(l => 
    extractTiming(l.mindsOn) && extractTiming(l.action) && extractTiming(l.consolidation)
  ).length;
  
  const withDifferentiation = schoolEnvironmentLessons.filter(l => l.differentiationStrategies).length;
  const withIndigenous = schoolEnvironmentLessons.filter(l => l.indigenousPerspectives).length;
  const withAssessment = schoolEnvironmentLessons.filter(l => l.assessmentNotes).length;
  
  console.log(`Total lessons: ${lessonCount}`);
  console.log(`Total duration: ${totalDuration} minutes (${(totalDuration/60).toFixed(1)} hours)`);
  console.log(`Average duration: ${avgDuration.toFixed(1)} minutes`);
  console.log(`45-minute lessons: ${lessons45min}`);
  console.log(`60-minute lessons: ${lessons60min}`);
  console.log(`Lessons with timing: ${withTiming}/${lessonCount}`);
  console.log(`Lessons with differentiation: ${withDifferentiation}/${lessonCount}`);
  console.log(`Lessons with indigenous perspectives: ${withIndigenous}/${lessonCount}`);
  console.log(`Lessons with assessment notes: ${withAssessment}/${lessonCount}`);

  // Check for gaps or issues
  console.log(`\n🔍 ISSUES TO ADDRESS:`);
  console.log('=====================');
  
  if (lessons60min > 0) {
    console.log(`❌ ${lessons60min} lessons still have 60-minute duration (should be 45)`);
  }
  
  if (withTiming < lessonCount) {
    console.log(`❌ ${lessonCount - withTiming} lessons missing proper timing structure`);
  }
  
  if (withDifferentiation < lessonCount) {
    console.log(`❌ ${lessonCount - withDifferentiation} lessons missing differentiation strategies`);
  }
  
  if (withIndigenous < lessonCount) {
    console.log(`❌ ${lessonCount - withIndigenous} lessons missing indigenous perspectives`);
  }
  
  if (withAssessment < lessonCount) {
    console.log(`❌ ${lessonCount - withAssessment} lessons missing assessment notes`);
  }

  // Check curriculum coverage
  if (unitPlan) {
    const unitExpectations = unitPlan.expectations.map(e => e.expectation.code);
    const lessonExpectations = new Set();
    
    schoolEnvironmentLessons.forEach(lesson => {
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
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(15 minutes)" or "(8 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run the review
reviewOurSchoolEnvironmentUnit()
  .catch((error) => {
    console.error('❌ Error reviewing Our School Environment unit:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });