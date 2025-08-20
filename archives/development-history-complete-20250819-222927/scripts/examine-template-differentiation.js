const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function examineTemplateDifferentiation() {
  try {
    console.log('🔍 EXAMINING 828-CHARACTER TEMPLATE DIFFERENTIATION');
    console.log('==================================================\n');
    
    // Get one unit with the 828-char template to examine it
    const sampleUnit = await prisma.unitPlan.findFirst({
      where: {
        differentiationStrategies: {
          not: null
        }
      }
    });

    if (sampleUnit?.differentiationStrategies) {
      const diff = sampleUnit.differentiationStrategies;
      const diffString = JSON.stringify(diff, null, 2);
      
      console.log('CURRENT TEMPLATE DIFFERENTIATION:');
      console.log('=================================');
      console.log(diffString);
      console.log(`\nLength: ${diffString.length} characters`);
      
      console.log('\nPROBLEMS WITH TEMPLATE:');
      console.log('- Generic language not specific to unit content');
      console.log('- Same strategies for all subjects and topics');
      console.log('- No reference to unit-specific materials or concepts');
      console.log('- No consideration of unit\'s particular learning challenges');
      
    } else {
      console.log('No template found to examine.');
    }

    // Get a few sample units from different subjects for planning
    const sampleUnits = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      take: 5
    });

    console.log('\nSAMPLE UNITS FOR DIFFERENTIATION PLANNING:');
    console.log('==========================================\n');

    sampleUnits.forEach((unit, i) => {
      console.log(`${i+1}. "${unit.title}" (${unit.longRangePlan?.subject})`);
      console.log(`   Description: "${unit.description?.substring(0, 100)}..."`);
      console.log(`   Big Ideas: "${unit.bigIdeas?.substring(0, 80)}..."`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

examineTemplateDifferentiation();