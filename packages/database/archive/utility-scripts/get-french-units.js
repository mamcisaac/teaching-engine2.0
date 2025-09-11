const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getFrenchUnits() {
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    // Get French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });

    // Get French units
    const frenchUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      include: {
        lessonPlans: true,
        expectations: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('CURRENT FRENCH UNITS:');
    console.log('=====================');
    console.log(`Total: ${frenchUnits.length} units, ${frenchUnits.reduce((sum, u) => sum + u.lessonPlans.length, 0)} lessons\n`);

    frenchUnits.forEach((unit, index) => {
      const duration = Math.ceil((new Date(unit.endDate) - new Date(unit.startDate)) / (1000 * 60 * 60 * 24 * 7));
      console.log(`${index + 1}. ${unit.title}`);
      console.log(`   Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`   Duration: ~${duration} weeks`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      console.log(`   Expectations: ${unit.expectations.length}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFrenchUnits();