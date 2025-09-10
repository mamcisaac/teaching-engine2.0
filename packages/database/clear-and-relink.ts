#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAndRelink() {
  console.log('🗑️ CLEARING OLD EXPECTATION LINKS\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get Emily's lesson IDs
  const lessonIds = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    select: { id: true }
  });
  
  const lessonIdList = lessonIds.map(l => l.id);
  
  // Clear all old expectation links for Emily's lessons
  const deletedCount = await prisma.eTFOLessonPlanExpectation.deleteMany({
    where: {
      lessonPlanId: {
        in: lessonIdList
      }
    }
  });
  
  console.log(`✅ Deleted ${deletedCount.count} old expectation links`);
  
  await prisma.$disconnect();
}

clearAndRelink()
  .then(() => {
    console.log('\n🎯 Old links cleared successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to clear links:', error);
    process.exit(1);
  });