import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function stepByStepEdit() {
  try {
    console.log('🔧 STEP-BY-STEP MANUAL EDIT - One at a time\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get the October unit (L'Aventure des Lignes)
    const octUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "L'Aventure des Lignes"
      }
    });

    if (!octUnit) {
      console.log("❌ October unit not found");
      return;
    }

    console.log(`Found October unit: ${octUnit.title}`);
    console.log(`Current hours: ${octUnit.estimatedHours}`);
    console.log(`Unit ID: ${octUnit.id}\n`);

    // Update with explicit transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.unitPlan.update({
        where: { id: octUnit.id },
        data: { estimatedHours: 15.75 }
      });
      return updated;
    });

    console.log(`✅ Update result: ${result.estimatedHours} hours`);

    // Immediate verification
    const verified = await prisma.unitPlan.findUnique({
      where: { id: octUnit.id },
      select: { title: true, estimatedHours: true }
    });

    console.log(`🔍 Immediate verification: ${verified?.estimatedHours} hours`);
    
    const lessons = Math.round((verified!.estimatedHours! * 60) / 45);
    console.log(`Calculated lessons: ${lessons}`);

    if (verified!.estimatedHours === 15.75) {
      console.log('✅ October update successful!');
    } else {
      console.log('❌ October update failed');
    }

  } catch (error) {
    console.error('Error in step-by-step edit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

stepByStepEdit();