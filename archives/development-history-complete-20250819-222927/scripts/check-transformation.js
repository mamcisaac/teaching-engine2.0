const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransformation() {
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
    select: { 
      title: true,
      description: true
    },
    orderBy: { startDate: 'asc' }
  });

  units.forEach((unit, i) => {
    console.log(`Unit ${i+1}: ${unit.title}`);
    console.log(`Has HANDS-ON: ${unit.description?.includes('HANDS-ON') ? 'YES' : 'NO'}`);
    console.log(`Has FLEXIBILITY: ${unit.description?.includes('FLEXIBILITY') ? 'YES' : 'NO'}`);
    console.log(`Has SCAFFOLDING: ${unit.description?.includes('SCAFFOLDING') ? 'YES' : 'NO'}`);
    console.log(`Description length: ${unit.description?.length || 0} characters`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkTransformation().catch(console.error);