import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getMathUnits() {
  console.log('🔍 RETRIEVING EMILY\'S CURRENT MATH UNITS FOR PERFECTION\n');

  // Get Emily's Math Long Range Plan
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: {
      userId: 23,
      subject: 'Mathématiques',
      grade: 1
    },
    include: {
      unitPlans: {
        include: {
          expectations: {
            include: {
              expectation: true
            }
          },
          lessonPlans: {
            orderBy: {
              date: 'asc'
            },
            include: {
              expectations: {
                include: {
                  expectation: true
                }
              }
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
    console.log('❌ No Math LRP found for Emily');
    return;
  }

  console.log(`📚 MATH LONG RANGE PLAN: ${mathLRP.title}`);
  console.log(`📅 Academic Year: ${mathLRP.academicYear}`);
  console.log(`🎯 Grade: ${mathLRP.grade} | Subject: ${mathLRP.subject}\n`);

  console.log(`📊 MATH UNIT STRUCTURE:`);
  console.log(`Total Units: ${mathLRP.unitPlans.length}`);
  console.log(`Total Lessons: ${mathLRP.unitPlans.reduce((total, unit) => total + unit.lessonPlans.length, 0)}\n`);

  // Analyze each unit
  mathLRP.unitPlans.forEach((unit, index) => {
    console.log(`\n🔷 UNIT ${index + 1}: ${unit.title}`);
    console.log(`📅 Duration: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    console.log(`⏰ Estimated Hours: ${unit.estimatedHours || 'Not specified'}`);
    console.log(`📝 Lessons: ${unit.lessonPlans.length}`);
    console.log(`🎯 Expectations: ${unit.expectations.length}`);
    
    if (unit.description) {
      console.log(`📖 Description: ${unit.description.substring(0, 100)}...`);
    }
    
    if (unit.bigIdeas) {
      console.log(`💡 Big Ideas: ${unit.bigIdeas.substring(0, 100)}...`);
    }

    if (unit.titleFr) {
      console.log(`🇫🇷 French Title: ${unit.titleFr}`);
    } else {
      console.log(`❌ Missing French Title`);
    }

    // Check for ETFO compliance elements
    const hasAssessmentPlan = unit.assessmentPlan && unit.assessmentPlan.length > 0;
    const hasDifferentiation = unit.differentiationStrategies && Object.keys(unit.differentiationStrategies as any).length > 0;
    const hasIndigenousPerspectives = unit.indigenousPerspectives && unit.indigenousPerspectives.length > 0;

    console.log(`\n📊 ETFO COMPLIANCE CHECK:`);
    console.log(`- Assessment Plan: ${hasAssessmentPlan ? '✅' : '❌'}`);
    console.log(`- Differentiation: ${hasDifferentiation ? '✅' : '❌'}`);
    console.log(`- Indigenous Perspectives: ${hasIndigenousPerspectives ? '✅' : '❌'}`);

    // Sample lesson analysis
    if (unit.lessonPlans.length > 0) {
      console.log(`\n🔍 SAMPLE LESSON ANALYSIS:`);
      const sampleLesson = unit.lessonPlans[Math.floor(unit.lessonPlans.length / 2)];
      console.log(`Lesson: ${sampleLesson.title}`);
      console.log(`French Title: ${sampleLesson.titleFr || '❌ Missing'}`);
      console.log(`Duration: ${sampleLesson.duration} minutes`);
      console.log(`Has Minds On: ${sampleLesson.mindsOn ? '✅' : '❌'}`);
      console.log(`Has Action: ${sampleLesson.action ? '✅' : '❌'}`);
      console.log(`Has Consolidation: ${sampleLesson.consolidation ? '✅' : '❌'}`);
      console.log(`Has Materials: ${sampleLesson.materials ? '✅' : '❌'}`);
      console.log(`Has Accommodations: ${sampleLesson.accommodations ? '✅' : '❌'}`);
      console.log(`Assessment Notes: ${sampleLesson.assessmentNotes ? '✅' : '❌'}`);
    }
  });

  // Overall Math curriculum expectations coverage
  const totalExpectations = new Set();
  mathLRP.unitPlans.forEach(unit => {
    unit.expectations.forEach(exp => {
      totalExpectations.add(exp.expectation.code);
    });
  });

  console.log(`\n📊 CURRICULUM EXPECTATIONS COVERAGE:`);
  console.log(`Total Unique Expectations: ${totalExpectations.size}`);
  console.log(`Expected for Grade 1 Math: ~20 expectations`);
  
  if (totalExpectations.size < 15) {
    console.log(`❌ CRITICAL: Insufficient curriculum coverage`);
  } else if (totalExpectations.size < 18) {
    console.log(`⚠️ WARNING: Light curriculum coverage`);
  } else {
    console.log(`✅ Good curriculum coverage`);
  }

  return {
    mathLRP,
    unitsCount: mathLRP.unitPlans.length,
    lessonsCount: mathLRP.unitPlans.reduce((total, unit) => total + unit.lessonPlans.length, 0),
    expectationsCount: totalExpectations.size
  };
}

getMathUnits()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });