const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countLessonsPerUnit() {
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('Emily not found');
      return;
    }

    // Get all unit plans with lessons
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        lessonPlans: true,
        longRangePlan: true,
        expectations: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\n====================================');
    console.log('LESSON COUNT PER UNIT PLAN');
    console.log('====================================\n');

    let totalLessons = 0;
    const bySubject = {};

    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!bySubject[subject]) {
        bySubject[subject] = { units: [], totalLessons: 0 };
      }
      
      bySubject[subject].units.push({
        title: unit.title,
        lessonCount: unit.lessonPlans.length,
        startDate: unit.startDate,
        endDate: unit.endDate,
        hasExpectations: unit.expectations.length > 0,
        expectationCount: unit.expectations.length
      });
      
      bySubject[subject].totalLessons += unit.lessonPlans.length;
      totalLessons += unit.lessonPlans.length;
    });

    // Display by subject
    for (const [subject, data] of Object.entries(bySubject)) {
      console.log(`\n${subject.toUpperCase()}`);
      console.log('='.repeat(50));
      console.log(`Total Units: ${data.units.length}`);
      console.log(`Total Lessons: ${data.totalLessons}`);
      console.log('-'.repeat(50));
      
      data.units.forEach((unit, index) => {
        console.log(`\n${index + 1}. ${unit.title}`);
        console.log(`   Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
        console.log(`   Lessons: ${unit.lessonCount}`);
        console.log(`   Expectations: ${unit.expectationCount}`);
        console.log(`   Status: ${unit.lessonCount > 0 ? '✓ Has lessons' : '✗ NO LESSONS'}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Units: ${unitPlans.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Units with lessons: ${unitPlans.filter(u => u.lessonPlans.length > 0).length}`);
    console.log(`Units without lessons: ${unitPlans.filter(u => u.lessonPlans.length === 0).length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countLessonsPerUnit();