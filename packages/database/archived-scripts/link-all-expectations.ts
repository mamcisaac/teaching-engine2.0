#!/usr/bin/env tsx

/**
 * LINK ALL EXPECTATIONS TO ARTS AND FPS LRPS
 * Final step to achieve absolute perfection
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function linkAllExpectations() {
  console.log('🔗 LINKING ALL EXPECTATIONS TO LRPS\n');
  console.log('===================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  // LINK ARTS VISUELS EXPECTATIONS
  console.log('🎨 Linking Arts visuels expectations...\n');
  
  const artsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Arts visuels',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (artsLRP) {
    const artsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    // Clear existing and link all
    await prisma.longRangePlanExpectation.deleteMany({
      where: { longRangePlanId: artsLRP.id }
    });
    
    for (const exp of artsExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: artsLRP.id,
          expectationId: exp.id
        }
      });
      console.log(`✓ Linked: ${exp.code}`);
    }
    
    console.log(`\nArts visuels: ${artsExpectations.length} expectations linked\n`);
  }
  
  // LINK FORMATION PERSONNELLE EXPECTATIONS
  console.log('🌱 Linking Formation personnelle expectations...\n');
  
  const fpsLRP = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Formation personnelle et sociale',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (fpsLRP) {
    const fpsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Formation personnelle et sociale',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    // Clear existing and link all
    await prisma.longRangePlanExpectation.deleteMany({
      where: { longRangePlanId: fpsLRP.id }
    });
    
    for (const exp of fpsExpectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: fpsLRP.id,
          expectationId: exp.id
        }
      });
      console.log(`✓ Linked: ${exp.code}`);
    }
    
    console.log(`\nFormation personnelle: ${fpsExpectations.length} expectations linked\n`);
  }
  
  console.log('✅ ALL EXPECTATIONS NOW LINKED!\n');
  console.log('Ready for final verification...\n');
  
  await prisma.$disconnect();
}

linkAllExpectations().catch(console.error);