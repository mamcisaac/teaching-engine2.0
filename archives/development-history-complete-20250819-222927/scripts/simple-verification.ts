import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleVerification() {
  console.log('🔍 SIMPLE VERIFICATION OF CURRENT UNIT PLANS\n');
  
  const EMILY_USER_ID = 23;
  
  try {
    // Get all Long Range Plans for Emily
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: EMILY_USER_ID,
        academicYear: '2025-2026'
      },
      include: {
        unitPlans: {
          select: {
            id: true,
            title: true,
            estimatedHours: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });
    
    console.log('Current unit plans in database:\n');
    
    let totalUnits = 0;
    let totalHours = 0;
    
    for (const lrp of longRangePlans) {
      console.log(`${lrp.subject} (${lrp.unitPlans.length} units):`);
      
      for (const unit of lrp.unitPlans) {
        const duration = (new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24);
        const weeks = (duration / 7).toFixed(1);
        console.log(`  - ${unit.title} (${unit.estimatedHours}h, ${weeks}w)`);
      }
      
      const subjectHours = lrp.unitPlans.reduce((sum, unit) => sum + unit.estimatedHours, 0);
      console.log(`  Total hours: ${subjectHours}\n`);
      
      totalUnits += lrp.unitPlans.length;
      totalHours += subjectHours;
    }
    
    console.log(`SUMMARY:`);
    console.log(`Total units: ${totalUnits}`);
    console.log(`Total hours: ${totalHours}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleVerification();