const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEmilyScience() {
  try {
    // Check Emily's account
    console.log('=== Emily\'s Account (ID 23) ===');
    const emily = await prisma.user.findUnique({
      where: {
        id: 23
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    if (!emily) {
      console.log('Emily (ID 23) not found!');
      return;
    }
    
    console.log(`Found: ${emily.name} (${emily.email})`);

    // Check Emily's Science-related unit plans
    console.log('\n=== Emily\'s Unit Plans ===');
    const allUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 23
      },
      include: {
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                subject: true,
                description: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${allUnits.length} total unit plans`);
    
    const scienceUnits = allUnits.filter(unit => 
      unit.longRangePlan?.subject?.toLowerCase().includes('science') ||
      unit.longRangePlan?.subject?.toLowerCase().includes('sciences') ||
      unit.expectations.some(exp => exp.expectation.subject.toLowerCase().includes('science'))
    );
    
    console.log(`Found ${scienceUnits.length} Science-related unit plans`);
    scienceUnits.forEach(unit => {
      console.log(`Unit ${unit.id}: ${unit.title} / ${unit.titleFr}`);
      console.log(`  Long Range Plan Subject: ${unit.longRangePlan?.subject}`);
      console.log(`  Dates: ${unit.startDate?.toISOString().split('T')[0]} to ${unit.endDate?.toISOString().split('T')[0]}`);
      console.log(`  Big Ideas: ${unit.bigIdeas}`);
      console.log(`  Big Ideas FR: ${unit.bigIdeasFr}`);
      console.log(`  Science Expectations: ${unit.expectations.filter(exp => 
        exp.expectation.subject.toLowerCase().includes('science')).length}`);
      console.log('');
    });

    // Check Emily's Science-related lessons
    console.log('\n=== Emily\'s Lessons ===');
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: 23
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: {
              select: {
                subject: true,
                title: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${allLessons.length} total lessons`);
    
    const scienceLessons = allLessons.filter(lesson => 
      lesson.subject?.toLowerCase().includes('science') ||
      lesson.unitPlan?.longRangePlan?.subject?.toLowerCase().includes('science') ||
      lesson.unitPlan?.longRangePlan?.subject?.toLowerCase().includes('sciences')
    );
    
    console.log(`Found ${scienceLessons.length} Science lessons`);
    scienceLessons.forEach(lesson => {
      console.log(`Lesson ${lesson.id}: ${lesson.title} / ${lesson.titleFr}`);
      console.log(`  Subject: ${lesson.subject}`);
      console.log(`  Date: ${lesson.date?.toISOString().split('T')[0]}`);
      console.log(`  Unit: ${lesson.unitPlanId}`);
      console.log(`  Unit Plan Subject: ${lesson.unitPlan?.longRangePlan?.subject}`);
      console.log('');
    });

    // Check all Science curriculum expectations available
    console.log('\n=== Available Science Curriculum Expectations ===');
    const scienceExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences de la nature',
        grade: 1
      },
      select: {
        id: true,
        code: true,
        description: true,
        strand: true,
        subject: true
      }
    });
    
    console.log(`Found ${scienceExpectations.length} Sciences de la nature expectations for Grade 1`);
    scienceExpectations.forEach(exp => {
      console.log(`${exp.code}: ${exp.strand}`);
      console.log(`  ${exp.description}`);
      console.log('');
    });


  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmilyScience();