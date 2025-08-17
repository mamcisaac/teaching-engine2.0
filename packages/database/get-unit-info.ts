import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUnitInfo() {
  console.log('📋 GETTING UNIT PLAN AND CURRICULUM EXPECTATION INFO');
  console.log('====================================================\n');

  // Get the Our School Environment unit plan
  const unitPlan = await prisma.unitPlan.findFirst({
    where: {
      userId: 23,
      title: 'Our School Environment',
      longRangePlan: {
        subject: 'Sciences de la nature'
      }
    },
    include: {
      longRangePlan: {
        select: {
          title: true,
          subject: true
        }
      },
      expectations: {
        include: {
          expectation: true
        }
      }
    }
  });

  if (!unitPlan) {
    console.log('❌ Unit plan not found');
    return;
  }

  console.log('📚 UNIT PLAN DETAILS:');
  console.log('=====================');
  console.log(`ID: ${unitPlan.id}`);
  console.log(`Title: ${unitPlan.title}`);
  console.log(`Long Range Plan: ${unitPlan.longRangePlan?.title}`);
  console.log(`Subject: ${unitPlan.longRangePlan?.subject}`);
  console.log(`Start Date: ${unitPlan.startDate}`);
  console.log(`End Date: ${unitPlan.endDate}`);
  console.log(`Description: ${unitPlan.description}`);
  console.log(`Big Ideas: ${unitPlan.bigIdeas}`);

  console.log(`\n🎯 CURRICULUM EXPECTATIONS (${unitPlan.expectations.length}):`);
  console.log('===========================================');
  
  unitPlan.expectations.forEach((exp, index) => {
    console.log(`\n${index + 1}. EXPECTATION ID: ${exp.expectation.id}`);
    console.log(`   Code: ${exp.expectation.code}`);
    console.log(`   Description: ${exp.expectation.description}`);
    console.log(`   Strand: ${exp.expectation.strand}`);
    console.log(`   Substrand: ${exp.expectation.substrand || 'None'}`);
  });

  // For lesson creation script
  console.log(`\n📝 FOR LESSON CREATION SCRIPT:`);
  console.log('==============================');
  console.log(`const unitPlanId = "${unitPlan.id}";`);
  console.log(`const expectationIds = [`);
  unitPlan.expectations.forEach((exp, index) => {
    console.log(`  "${exp.expectation.id}"${index < unitPlan.expectations.length - 1 ? ',' : ''}`);
  });
  console.log(`];`);

  console.log(`\n🎯 EXPECTATIONS TO COVER:`);
  console.log('========================');
  unitPlan.expectations.forEach((exp, index) => {
    console.log(`${index + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
  });
}

// Run the query
getUnitInfo()
  .catch((error) => {
    console.error('❌ Error getting unit info:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });