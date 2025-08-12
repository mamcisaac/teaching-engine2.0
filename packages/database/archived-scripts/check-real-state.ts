import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRealState() {
  console.log('=== ACTUAL DATABASE STATE CHECK ===\n');
  
  // Check users
  const users = await prisma.user.findMany({
    select: { email: true, name: true }
  });
  console.log(`Users: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
  
  // Check curriculum expectations
  const allExpectations = await prisma.curriculumExpectation.count();
  const grade1Expectations = await prisma.curriculumExpectation.count({ 
    where: { grade: 1 } 
  });
  
  // Check by subject
  const subjects = await prisma.curriculumExpectation.groupBy({
    by: ['subject'],
    where: { grade: 1 },
    _count: true
  });
  
  console.log(`\nCurriculum Expectations:`);
  console.log(`  Total: ${allExpectations}`);
  console.log(`  Grade 1: ${grade1Expectations}`);
  console.log(`  By Subject:`);
  subjects.forEach(s => console.log(`    - ${s.subject}: ${s._count}`));
  
  // Check long range plans
  const lrps = await prisma.longRangePlan.count();
  const lrpsBySubject = await prisma.longRangePlan.groupBy({
    by: ['subject'],
    _count: true
  });
  
  console.log(`\nLong Range Plans: ${lrps}`);
  lrpsBySubject.forEach(l => console.log(`  - ${l.subject}: ${l._count}`));
  
  // Check unit plans
  const units = await prisma.unitPlan.count();
  const unitsWithExpectations = await prisma.unitPlan.findMany({
    include: {
      _count: {
        select: { expectations: true }
      }
    }
  });
  
  const unitsWithLinks = unitsWithExpectations.filter(u => u._count.expectations > 0).length;
  
  console.log(`\nUnit Plans: ${units}`);
  console.log(`  With expectation links: ${unitsWithLinks}`);
  console.log(`  Without expectation links: ${units - unitsWithLinks}`);
  
  // Check lesson plans
  const lessons = await prisma.eTFOLessonPlan.count();
  console.log(`\nLesson Plans: ${lessons}`);
  
  // Get sample unit to check content
  const sampleUnit = await prisma.unitPlan.findFirst({
    include: {
      longRangePlan: true,
      expectations: {
        include: {
          expectation: true
        }
      }
    }
  });
  
  if (sampleUnit) {
    console.log(`\nSample Unit Analysis:`);
    console.log(`  Title: ${sampleUnit.title}`);
    console.log(`  Subject: ${sampleUnit.longRangePlan.subject}`);
    console.log(`  Description length: ${sampleUnit.description?.length || 0} chars`);
    console.log(`  Has assessment plan: ${sampleUnit.assessmentPlan ? 'Yes' : 'No'}`);
    console.log(`  Has differentiation: ${sampleUnit.differentiationStrategies ? 'Yes' : 'No'}`);
    console.log(`  Linked expectations: ${sampleUnit.expectations.length}`);
  }
  
  await prisma.$disconnect();
}

checkRealState().catch(console.error);