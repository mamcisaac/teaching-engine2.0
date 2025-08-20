import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  const lrps = await prisma.longRangePlan.findMany({
    where: { userId: 23 },
    select: { 
      id: true, 
      title: true, 
      subject: true, 
      grade: true,
      _count: {
        select: {
          unitPlans: true,
          expectations: true
        }
      }
    }
  });
  
  console.log('=== LONG RANGE PLANS ===');
  for (const lrp of lrps) {
    console.log(`\n${lrp.subject}:`);
    console.log(`  Title: ${lrp.title}`);
    console.log(`  ID: ${lrp.id}`);
    console.log(`  Units: ${lrp._count.unitPlans}`);
    console.log(`  Expectations: ${lrp._count.expectations}`);
  }
  
  console.log('\n=== UNIT PLANS DETAIL ===');
  for (const lrp of lrps) {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      select: {
        id: true,
        title: true,
        estimatedHours: true,
        _count: {
          select: {
            lessonPlans: true,
            expectations: true
          }
        }
      }
    });
    
    console.log(`\n${lrp.subject} Units (${units.length} total):`);
    for (const unit of units) {
      console.log(`  - ${unit.title}`);
      console.log(`    Hours: ${unit.estimatedHours || 'NOT SET'}`);
      console.log(`    Lessons: ${unit._count.lessonPlans}`);
      console.log(`    Expectations: ${unit._count.expectations}`);
    }
  }
  
  console.log('\n=== LESSON PLANS SUMMARY ===');
  const lessons = await prisma.eTFOLessonPlan.count({ where: { userId: 23 } });
  console.log(`Total lessons in database: ${lessons}`);
  
  console.log('\n=== CURRICULUM EXPECTATIONS ===');
  const expectations = await prisma.curriculumExpectation.groupBy({
    by: ['subject'],
    _count: true,
    where: { grade: 1 }
  });
  
  for (const exp of expectations) {
    console.log(`${exp.subject}: ${exp._count} expectations`);
  }
  
  await prisma.$disconnect();
}

audit().catch(console.error);