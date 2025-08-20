import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMathUnitsPerfection() {
  console.log('🔧 FIXING MATH UNITS TO PERFECTION...\n');
  
  try {
    // Step 1: Update Units 1-4 hours from 23 to 16.25
    console.log('📊 Step 1: Updating Units 1-4 hours...');
    const units1to4 = [
      'cmebyc9ii0001vjrfkhn13dd1', // Unit 1: Numbers All Around Us
      'cmebyc9im0003vjrf4bfhlo1z', // Unit 2: Making Sense of Numbers
      'cmebyc9io0005vjrfypcwi41t', // Unit 3: Patterns and Shapes
      'cmebyc9iq0007vjrfjbgwmvcv', // Unit 4: Adding and Subtracting
    ];
    
    for (const unitId of units1to4) {
      await prisma.unitPlan.update({
        where: { id: unitId },
        data: { estimatedHours: 16 } // Using 16 since Prisma expects Int
      });
    }
    console.log('✅ Units 1-4 updated to 16 hours each\n');
    
    // Step 2: Update Units 5-8 hours from 22 to 16.25
    console.log('📊 Step 2: Updating Units 5-8 hours...');
    const units5to8 = [
      'cmebyc9ir0009vjrf5bl8l49w', // Unit 5: Mental Math Strategies
      'cmebyc9is000bvjrfmge2bn8k', // Unit 6: Measurement Exploration
      'cmebyc9it000dvjrfyiqtwj9b', // Unit 7: Problem Solving Adventures
      'cmebyc9iu000fvjrfjz3ykc52', // Unit 8: Math Celebration
    ];
    
    for (const unitId of units5to8) {
      await prisma.unitPlan.update({
        where: { id: unitId },
        data: { estimatedHours: 16 } // Using 16 since Prisma expects Int
      });
    }
    console.log('✅ Units 5-8 updated to 16 hours each\n');
    
    // Step 3: Update Unit 9 hours from 15 to 11.25
    console.log('📊 Step 3: Updating Unit 9 hours...');
    await prisma.unitPlan.update({
      where: { id: 'cmeh9o5sg0001vjv00jatq9zn' },
      data: { estimatedHours: 11 } // Using 11 since Prisma expects Int
    });
    console.log('✅ Unit 9 updated to 11 hours\n');
    
    // Step 4: Add expectations to Unit 9
    console.log('📚 Step 4: Adding curriculum expectations to Unit 9...');
    const unit9Expectations = [
      'cmebyc93f000svjqucxi11fbz', // 1.FE2: Sorting and classifying
      'cmebyc93a000hvjqu21ygjts5', // 1.N3: Understanding counting
      'cmebyc93b000jvjqu9kdvuy7u', // 1.N5: Comparing sets
    ];
    
    for (const expectationId of unit9Expectations) {
      await prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: 'cmeh9o5sg0001vjv00jatq9zn',
          expectationId: expectationId
        }
      }).catch(err => {
        // Ignore if already exists
        if (!err.message.includes('Unique constraint')) throw err;
      });
    }
    console.log('✅ Added 3 expectations to Unit 9\n');
    
    // Step 5: Add Community Connections to Unit 9
    console.log('🏘️ Step 5: Adding Community Connections to Unit 9...');
    await prisma.unitPlan.update({
      where: { id: 'cmeh9o5sg0001vjv00jatq9zn' },
      data: {
        communityConnections: 'Students will conduct classroom surveys, analyze school data (e.g., favorite activities, lunch choices), and create graphs to share with families. Guest speaker from local statistics office to show real-world data use. Class data projects displayed at school assembly.'
      }
    });
    console.log('✅ Added Community Connections to Unit 9\n');
    
    // Step 6: Fix date overlap - Adjust Unit 8 end date
    console.log('📅 Step 6: Fixing date overlap between Units 8 and 9...');
    await prisma.unitPlan.update({
      where: { id: 'cmebyc9iu000fvjrfjz3ykc52' }, // Unit 8
      data: {
        endDate: new Date('2026-05-20')
      }
    });
    console.log('✅ Unit 8 end date adjusted to May 20, 2026\n');
    
    // Verification
    console.log('🔍 VERIFICATION: Checking all updates...\n');
    
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      include: {
        expectations: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    let totalHours = 0;
    updatedUnits.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Expectations: ${unit.expectations.length}`);
      console.log(`  Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      totalHours += unit.estimatedHours || 0;
    });
    
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total Units: ${updatedUnits.length}`);
    console.log(`Total Hours: ${totalHours} (Target: 146.25)`);
    console.log(`Hours Difference: ${totalHours - 146.25}`);
    
    // Check Unit 9 specifically
    const unit9 = updatedUnits.find(u => u.id === 'cmeh9o5sg0001vjv00jatq9zn');
    console.log(`\nUnit 9 Status:`);
    console.log(`  Expectations: ${unit9?.expectations.length} (Should be 3)`);
    console.log(`  Community Connections: ${unit9?.communityConnections ? '✅' : '❌'}`);
    
    console.log('\n✨ MATH UNITS PERFECTION COMPLETE! ✨');
    
  } catch (error) {
    console.error('❌ Error fixing math units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMathUnitsPerfection();