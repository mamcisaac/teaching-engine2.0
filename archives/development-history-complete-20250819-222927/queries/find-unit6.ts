import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUnit6() {
  console.log('🔍 SEARCHING FOR UNIT 6\n');
  console.log('=======================');
  
  // Search for the unit by ID
  const unit6 = await prisma.unitPlan.findFirst({
    where: { id: 'cmej0yaq1000bvjy5fvopp2at' },
    include: {
      longRangePlan: true
    }
  });
  
  if (unit6) {
    console.log('✅ FOUND UNIT 6:');
    console.log(`   Title: ${unit6.title}`);
    console.log(`   ID: ${unit6.id}`);
    console.log(`   LRP ID: ${unit6.longRangePlanId}`);
    console.log(`   LRP Subject: ${unit6.longRangePlan?.subject || 'N/A'}`);
    console.log(`   Start Date: ${unit6.startDate.toISOString().split('T')[0]}`);
    console.log(`   End Date: ${unit6.endDate.toISOString().split('T')[0]}`);
    console.log(`   Hours: ${unit6.estimatedHours}`);
  } else {
    console.log('❌ Unit 6 not found with ID: cmej0yaq1000bvjy5fvopp2at');
  }
  
  // Also search for any unit with "Community, Safety" in title
  const communityUnits = await prisma.unitPlan.findMany({
    where: { 
      title: { contains: 'Community' }
    },
    include: {
      longRangePlan: true
    }
  });
  
  console.log(`\n📖 Found ${communityUnits.length} units with "Community" in title:`);
  communityUnits.forEach(unit => {
    console.log(`\n   Title: ${unit.title}`);
    console.log(`   ID: ${unit.id}`);
    console.log(`   LRP: ${unit.longRangePlan?.subject}`);
    console.log(`   Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
  });
  
  // Get the Health/FPS LRP ID
  const healthLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } }
  });
  
  if (healthLRP) {
    console.log(`\n📚 Health/FPS LRP ID: ${healthLRP.id}`);
    
    // Count units in this LRP
    const unitCount = await prisma.unitPlan.count({
      where: { longRangePlanId: healthLRP.id }
    });
    
    console.log(`   Units in this LRP: ${unitCount}`);
  }
  
  // Search for all Health-related units regardless of LRP
  const healthRelatedUnits = await prisma.unitPlan.findMany({
    where: {
      OR: [
        { title: { contains: 'Health' } },
        { title: { contains: 'Safety' } },
        { title: { contains: 'corps' } },
        { title: { contains: 'émotions' } },
        { title: { contains: 'nutrition' } }
      ]
    },
    include: {
      longRangePlan: true
    },
    orderBy: { startDate: 'asc' }
  });
  
  console.log(`\n📋 All Health/Safety related units (${healthRelatedUnits.length}):`);
  healthRelatedUnits.forEach((unit, i) => {
    console.log(`\n${i+1}. ${unit.title}`);
    console.log(`   ID: ${unit.id}`);
    console.log(`   LRP: ${unit.longRangePlan?.subject}`);
    console.log(`   Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
  });
  
  await prisma.$disconnect();
}

findUnit6().catch(console.error);