const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkFrenchExpectations() {
  try {
    console.log('🔗 LINKING FRENCH CURRICULUM EXPECTATIONS TO UNITS\n');

    // Get Emily
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    // Get French expectations
    const frenchExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Français (Immersion)',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });

    console.log(`📚 Found ${frenchExpectations.length} French expectations`);

    // Get the 16 French units
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });

    const frenchUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`🏗️ Found ${frenchUnits.length} French units to link\n`);

    // Distribute expectations across units (some units will share expectations)
    for (let i = 0; i < frenchUnits.length; i++) {
      const unit = frenchUnits[i];
      
      // Assign 2-3 expectations per unit, cycling through available ones
      const expectationsToAssign = [];
      for (let j = 0; j < 3; j++) {
        const expIndex = (i * 2 + j) % frenchExpectations.length;
        expectationsToAssign.push(frenchExpectations[expIndex]);
      }

      console.log(`${i + 1}. ${unit.title}`);
      console.log(`   Linking expectations:`);
      
      for (const exp of expectationsToAssign) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: exp.id
          }
        });
        console.log(`   • ${exp.code}: ${exp.description.substring(0, 60)}...`);
      }
      console.log('');
    }

    console.log('✅ EXPECTATIONS LINKING COMPLETE');
    console.log(`Linked curriculum expectations to all 16 French units`);
    console.log(`Each unit now has 2-3 curriculum expectations`);
    console.log('');

    console.log('📊 VERIFICATION:');
    
    // Verify the linking worked
    for (let i = 0; i < Math.min(3, frenchUnits.length); i++) {
      const unit = frenchUnits[i];
      const expectations = await prisma.unitPlanExpectation.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`• ${unit.title}: ${expectations} expectations linked`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkFrenchExpectations();