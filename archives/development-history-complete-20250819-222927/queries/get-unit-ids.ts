import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUnitIds() {
  try {
    console.log('🔍 GETTING CORRECT SOCIAL STUDIES UNIT IDs');
    
    // Get the Social Studies LRP
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' }
    });
    
    console.log(`📋 LRP: ${lrp.title}`);
    
    // Get all units with their IDs
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📚 UNIT IDs AND DETAILS:');
    console.log('=' .repeat(80));
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`UNIT ${unitNum}: ${unit.title}`);
      console.log(`ID: ${unit.id}`);
      console.log(`Dates: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error getting unit IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUnitIds();