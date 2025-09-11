import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check users
  const users = await prisma.user.count();
  console.log('Total users:', users);
  
  // Check unit plans
  const unitPlans = await prisma.unitPlan.count();
  console.log('Total unit plans:', unitPlans);
  
  // Check curriculum expectations
  const expectations = await prisma.curriculumExpectation.count();
  console.log('Total curriculum expectations:', expectations);
  
  // Check unit plan expectations
  const unitExpectations = await prisma.unitPlanExpectation.count();
  console.log('Total unit plan expectation links:', unitExpectations);
  
  // Get first unit plan with expectations
  const unitWithExpectations = await prisma.unitPlan.findFirst({
    include: {
      expectations: true
    }
  });
  
  if (unitWithExpectations) {
    console.log('\nSample unit:', unitWithExpectations.title);
    console.log('Expectations linked:', unitWithExpectations.expectations.length);
  } else {
    console.log('\nNo unit plans found or no expectations linked');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
