import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUnitPlanExpectations() {
  try {
    // Get Emily's user
    const emily = await prisma.user.findFirst({
      where: { email: 'emilyangela.mcisaac@edu.pe.ca' }
    });
    
    if (!emily) {
      console.log('Emily user not found');
      return;
    }
    
    console.log('Found Emily, ID:', emily.id);
    
    // Get unit plans with expectations
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      take: 10 // Check first 10
    });
    
    const totalUnits = await prisma.unitPlan.count({ where: { userId: emily.id }});
    console.log('\nTotal unit plans for Emily:', totalUnits);
    console.log('\nChecking first 10 unit plans for expectations:');
    console.log('='.repeat(60));
    
    for (const unit of unitPlans) {
      console.log('\n' + unit.title);
      console.log('  Expectations linked:', unit.expectations.length);
      if (unit.expectations.length > 0) {
        console.log('  Sample expectations:');
        unit.expectations.slice(0, 3).forEach(exp => {
          console.log('    -', exp.expectation.code, ':', exp.expectation.description.substring(0, 60) + '...');
        });
      } else {
        console.log('  ⚠️  NO EXPECTATIONS LINKED');
      }
    }
    
    // Get total count of unit plan expectations
    const totalUnitExpectations = await prisma.unitPlanExpectation.count({
      where: {
        unitPlan: {
          userId: emily.id
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log('- Total unit plans:', totalUnits);
    console.log('- Total expectations linked across all units:', totalUnitExpectations);
    console.log('- Average expectations per unit:', (totalUnitExpectations / totalUnits).toFixed(1));
    
    // Check if curriculum expectations exist
    const totalExpectations = await prisma.curriculumExpectation.count();
    console.log('- Total curriculum expectations in database:', totalExpectations);
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnitPlanExpectations();
