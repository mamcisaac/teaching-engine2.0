import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFallChangesInfo() {
  console.log('📋 GETTING FALL CHANGES UNIT INFO FOR LESSON CREATION');
  console.log('====================================================\n');

  // Get the Fall Changes unit plan
  const unitPlan = await prisma.unitPlan.findFirst({
    where: {
      userId: 23,
      title: 'Fall Changes',
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
    console.log('❌ Fall Changes unit plan not found');
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

  console.log(`\n🍂 FALL CHANGES FOCUS:`);
  console.log('======================');
  console.log(`Expectation: ${unitPlan.expectations[0]?.expectation.code} - ${unitPlan.expectations[0]?.expectation.description}`);
  console.log(`\nKey themes to cover in 24 lessons:`);
  console.log(`- Daily changes in fall (temperature, daylight, weather)`);
  console.log(`- Seasonal effects on plants (leaves, dormancy, seed dispersal)`);
  console.log(`- Animal adaptations (migration, hibernation, food storage)`);
  console.log(`- Human responses to seasonal changes`);
  console.log(`- Observation and measurement of changes over time`);

  console.log(`\n📅 LESSON SCHEDULE (24 lessons):`);
  console.log('================================');
  console.log(`Timeline: ${unitPlan.startDate} to ${unitPlan.endDate}`);
  console.log(`Average: ~1 lesson per day over ~3.5 weeks`);
  console.log(`Structure: Build from basic observations to complex investigations`);
}

// Run the query
getFallChangesInfo()
  .catch((error) => {
    console.error('❌ Error getting Fall Changes info:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });