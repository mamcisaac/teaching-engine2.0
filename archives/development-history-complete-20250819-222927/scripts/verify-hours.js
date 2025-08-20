const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyHours() {
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
    orderBy: { startDate: 'asc' }
  });
  
  console.log('UNIT HOURS VERIFICATION:');
  let total = 0;
  units.forEach((unit, i) => {
    console.log(`Unit ${i+1}: ${unit.estimatedHours} hours`);
    total += unit.estimatedHours || 0;
  });
  console.log(`TOTAL: ${total}/72.75 hours ${total === 72.75 ? '✅ PERFECT' : '❌ NEEDS FIX'}`);
  
  await prisma.$disconnect();
}

verifyHours().catch(console.error);