import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateHealthFPS() {
  console.log('🔍 HEALTH/FPS INVESTIGATION');
  console.log('============================\n');

  // Check what Health/FPS units exist
  const healthFPSUnits = await prisma.unitPlan.findMany({
    where: { 
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw' // Health/FPS LRP ID
    },
    select: {
      id: true,
      title: true,
      description: true,
      bigIdeas: true,
      estimatedHours: true,
      startDate: true,
      endDate: true,
      keyVocabulary: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Health/FPS Units Found: ${healthFPSUnits.length}`);
  
  for (const [index, unit] of healthFPSUnits.entries()) {
    console.log(`\n🏥 Unit ${index + 1}: "${unit.title}"`);
    console.log(`ID: ${unit.id}`);
    console.log(`Hours: ${unit.estimatedHours}`);
    
    if (unit.startDate && unit.endDate) {
      console.log(`Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    }
    
    if (unit.description) {
      console.log(`Description sample: "${unit.description.substring(0, 100)}..."`);
    }
    
    if (unit.bigIdeas) {
      console.log(`Big Ideas sample: "${unit.bigIdeas.substring(0, 100)}..."`);
    }
    
    if (unit.keyVocabulary) {
      console.log(`Key Vocabulary: "${unit.keyVocabulary}"`);
    } else {
      console.log('❌ No key vocabulary');
    }
  }

  await prisma.$disconnect();
}

investigateHealthFPS().catch(console.error);