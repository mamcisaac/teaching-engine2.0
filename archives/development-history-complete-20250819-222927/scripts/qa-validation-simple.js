// Quality Assurance Validation Query - Simple Version
// Comprehensive examination of Emily's Grade 1 French Immersion system

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${__dirname}/packages/database/prisma/dev.db`
    }
  }
});

async function main() {
  console.log('\n🔍 COMPREHENSIVE QUALITY ASSURANCE VALIDATION');
  console.log('==================================================\n');

  try {
    // Get Emily's user ID (assuming she's the primary user)
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });

    if (!emily) {
      console.log('❌ Emily user not found in database');
      // Let's see what users we have
      const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
      });
      console.log('Available users:', allUsers);
      
      if (allUsers.length > 0) {
        // Use the first user as Emily for testing
        const user = allUsers[0];
        console.log(`Using user: ${user.name || user.email} (ID: ${user.id}) as Emily`);
        return await analyzeSystem(user);
      }
      return;
    }

    console.log(`✅ Found Emily: ${emily.name} (ID: ${emily.id})\n`);
    return await analyzeSystem(emily);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function analyzeSystem(user) {
  // 1. LONG RANGE PLANS ANALYSIS
  console.log('📋 LONG RANGE PLANS ANALYSIS');
  console.log('===============================');

  const longRangePlans = await prisma.longRangePlan.findMany({
    where: { userId: user.id },
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
          }
        }
      }
    }
  });

  console.log(`Total Long Range Plans: ${longRangePlans.length}`);

  for (const lrp of longRangePlans) {
    console.log(`\n📚 ${lrp.subject} (Grade ${lrp.grade})`);
    console.log(`   Title: ${lrp.title}`);
    console.log(`   Academic Year: ${lrp.academicYear}`);
    console.log(`   Curriculum Expectations: ${lrp.expectations.length}`);
    console.log(`   Unit Plans: ${lrp.unitPlans.length}`);
    
    if (lrp.unitPlans.length > 0) {
      console.log(`   Unit Details:`);
      lrp.unitPlans.forEach((unit, idx) => {
        const startDate = new Date(unit.startDate).toLocaleDateString();
        const endDate = new Date(unit.endDate).toLocaleDateString();
        console.log(`     ${idx + 1}. ${unit.title} (${startDate} - ${endDate})`);
        console.log(`        Expectations: ${unit.expectations.length}`);
      });
    }
  }

  // 2. CURRICULUM EXPECTATIONS COVERAGE
  console.log('\n\n🎯 CURRICULUM EXPECTATIONS COVERAGE');
  console.log('=====================================');

  const totalExpectations = await prisma.curriculumExpectation.count({
    where: { grade: 1 }
  });

  const coverageBySubject = await prisma.curriculumExpectation.groupBy({
    by: ['subject'],
    where: { grade: 1 },
    _count: { id: true }
  });

  console.log(`Total Grade 1 Curriculum Expectations: ${totalExpectations}\n`);

  for (const subject of coverageBySubject) {
    console.log(`📖 ${subject.subject}: ${subject._count.id} expectations`);
  }

  // 3. UNIT PLANS ANALYSIS
  console.log('\n\n🏗️ UNIT PLANS ANALYSIS');
  console.log('========================');

  const allUnits = await prisma.unitPlan.findMany({
    where: { userId: user.id },
    include: {
      expectations: {
        include: {
          expectation: true
        }
      },
      lessonPlans: true,
      longRangePlan: true
    },
    orderBy: { startDate: 'asc' }
  });

  console.log(`Total Unit Plans: ${allUnits.length}`);

  const unitsBySubject = allUnits.reduce((acc, unit) => {
    const subject = unit.longRangePlan.subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(unit);
    return acc;
  }, {});

  for (const [subject, units] of Object.entries(unitsBySubject)) {
    console.log(`\n📚 ${subject}: ${units.length} units`);
    units.forEach((unit, idx) => {
      const startDate = new Date(unit.startDate).toLocaleDateString();
      const endDate = new Date(unit.endDate).toLocaleDateString();
      const duration = Math.ceil((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
      console.log(`   ${idx + 1}. ${unit.title}`);
      console.log(`      Duration: ${duration} weeks (${startDate} - ${endDate})`);
      console.log(`      Lessons: ${unit.lessonPlans.length}`);
      console.log(`      Expectations: ${unit.expectations.length}`);
    });
  }

  // 4. LESSON PLANS ANALYSIS
  console.log('\n\n📝 LESSON PLANS ANALYSIS');
  console.log('=========================');

  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: user.id },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      },
      expectations: {
        include: {
          expectation: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Total Lesson Plans: ${allLessons.length}`);

  const lessonsBySubject = allLessons.reduce((acc, lesson) => {
    const subject = lesson.unitPlan.longRangePlan.subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(lesson);
    return acc;
  }, {});

  for (const [subject, lessons] of Object.entries(lessonsBySubject)) {
    console.log(`\n📚 ${subject}: ${lessons.length} lessons`);
    console.log(`   Average duration: ${Math.round(lessons.reduce((sum, l) => sum + l.duration, 0) / lessons.length)} minutes`);
    
    // Check ETFO structure compliance
    const structureCompliance = lessons.reduce((acc, lesson) => {
      acc.hasMindsOn += lesson.mindsOn ? 1 : 0;
      acc.hasAction += lesson.action ? 1 : 0;
      acc.hasConsolidation += lesson.consolidation ? 1 : 0;
      acc.hasLearningGoals += lesson.learningGoals ? 1 : 0;
      return acc;
    }, { hasMindsOn: 0, hasAction: 0, hasConsolidation: 0, hasLearningGoals: 0 });

    console.log(`   ETFO Structure Compliance:`);
    console.log(`     Minds On: ${structureCompliance.hasMindsOn}/${lessons.length} (${Math.round(structureCompliance.hasMindsOn/lessons.length*100)}%)`);
    console.log(`     Action: ${structureCompliance.hasAction}/${lessons.length} (${Math.round(structureCompliance.hasAction/lessons.length*100)}%)`);
    console.log(`     Consolidation: ${structureCompliance.hasConsolidation}/${lessons.length} (${Math.round(structureCompliance.hasConsolidation/lessons.length*100)}%)`);
    console.log(`     Learning Goals: ${structureCompliance.hasLearningGoals}/${lessons.length} (${Math.round(structureCompliance.hasLearningGoals/lessons.length*100)}%)`);
  }

  // 5. SYSTEM VALIDATION SUMMARY
  console.log('\n\n✅ SYSTEM VALIDATION SUMMARY');
  console.log('==============================');

  console.log(`📊 Overall Statistics:`);
  console.log(`   Long Range Plans: ${longRangePlans.length}`);
  console.log(`   Unit Plans: ${allUnits.length}`);
  console.log(`   Lesson Plans: ${allLessons.length}`);
  console.log(`   Curriculum Expectations: ${totalExpectations}`);

  // Calculate academic year coverage
  const firstLesson = allLessons[0];
  const lastLesson = allLessons[allLessons.length - 1];
  
  if (firstLesson && lastLesson) {
    const startDate = new Date(firstLesson.date);
    const endDate = new Date(lastLesson.date);
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    console.log(`   Academic Year Coverage: ${totalWeeks} weeks`);
    console.log(`   Start Date: ${startDate.toLocaleDateString()}`);
    console.log(`   End Date: ${endDate.toLocaleDateString()}`);
  }

  // Quality indicators
  console.log(`\n🔍 Quality Indicators:`);
  const frenchLessons = lessonsBySubject['Français langue première']?.length || 0;
  const mathLessons = lessonsBySubject['Mathématiques']?.length || 0;
  const expectedFrenchLessons = 195;
  const expectedMathLessons = 195;
  
  console.log(`   French Lessons: ${frenchLessons}/${expectedFrenchLessons} (${Math.round(frenchLessons/expectedFrenchLessons*100)}%)`);
  console.log(`   Math Lessons: ${mathLessons}/${expectedMathLessons} (${Math.round(mathLessons/expectedMathLessons*100)}%)`);

  return {
    longRangePlans: longRangePlans.length,
    unitPlans: allUnits.length,
    lessonPlans: allLessons.length,
    curriculumExpectations: totalExpectations,
    subjectBreakdown: {
      units: unitsBySubject,
      lessons: lessonsBySubject
    }
  };
}

main().catch(console.error);