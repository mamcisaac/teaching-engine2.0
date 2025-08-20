import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase2ExpectationRedistribution() {
  try {
    console.log('🔧 PHASE 2: CURRICULUM EXPECTATION REDISTRIBUTION');
    console.log('Goal: Achieve perfect 1:1 expectation mapping');
    console.log('===============================================================================');
    
    // Get all expectations and units
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        code: {
          in: ['1C.1', '1C.2', '1LT.1', '1PA.1', '1ER.1']
        }
      }
    });
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: { include: { expectation: true } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT EXPECTATION DISTRIBUTION:');
    units.forEach((unit, index) => {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Unit ${index + 1}: [${unitExpectations.join(', ')}]`);
    });
    
    // Define the redistribution plan
    const redistributionPlan = [
      {
        expectationCode: '1C.1',
        keepInUnit: 1, // Unit 1
        removeFromUnits: [6], // Unit 6
        description: 'Community concepts - belongs in school community unit'
      },
      {
        expectationCode: '1C.2',
        keepInUnit: 2, // Unit 2  
        removeFromUnits: [7], // Unit 7
        description: 'Community helpers - belongs in neighborhood helpers unit'
      },
      {
        expectationCode: '1LT.1',
        keepInUnit: 4, // Unit 4
        removeFromUnits: [5], // Unit 5
        description: 'Location concepts - belongs in neighborhood/city unit'
      },
      {
        expectationCode: '1PA.1',
        keepInUnit: 6, // Unit 6
        removeFromUnits: [1], // Unit 1
        description: 'Civic participation - belongs in citizenship unit'
      },
      {
        expectationCode: '1ER.1',
        keepInUnit: 7, // Unit 7
        removeFromUnits: [2], // Unit 2
        description: 'Global connections - belongs in connected world unit'
      }
    ];
    
    console.log('\n🎯 REDISTRIBUTION PLAN:');
    redistributionPlan.forEach(plan => {
      console.log(`${plan.expectationCode}: Keep in Unit ${plan.keepInUnit}, remove from Unit(s) ${plan.removeFromUnits.join(', ')}`);
      console.log(`  Rationale: ${plan.description}`);
    });
    
    console.log('\n🔧 EXECUTING REDISTRIBUTION...');
    
    for (const plan of redistributionPlan) {
      const expectation = expectations.find(e => e.code === plan.expectationCode);
      if (!expectation) {
        console.log(`❌ Expectation ${plan.expectationCode} not found`);
        continue;
      }
      
      console.log(`\n📝 Processing ${plan.expectationCode}:`);
      
      // Remove from specified units
      for (const unitIndex of plan.removeFromUnits) {
        const unit = units[unitIndex - 1]; // Convert to 0-based index
        
        try {
          // Check if the connection exists
          const existingConnection = await prisma.unitPlanExpectation.findUnique({
            where: {
              unitPlanId_expectationId: {
                unitPlanId: unit.id,
                expectationId: expectation.id
              }
            }
          });
          
          if (existingConnection) {
            await prisma.unitPlanExpectation.delete({
              where: {
                unitPlanId_expectationId: {
                  unitPlanId: unit.id,
                  expectationId: expectation.id
                }
              }
            });
            console.log(`  ✅ Removed ${plan.expectationCode} from Unit ${unitIndex}: ${unit.title}`);
          } else {
            console.log(`  ⚠️ ${plan.expectationCode} was not in Unit ${unitIndex}: ${unit.title}`);
          }
        } catch (error) {
          console.log(`  ❌ Error removing ${plan.expectationCode} from Unit ${unitIndex}:`, error.message);
        }
      }
      
      // Verify it still exists in the keep unit
      const keepUnit = units[plan.keepInUnit - 1];
      const keepConnection = await prisma.unitPlanExpectation.findUnique({
        where: {
          unitPlanId_expectationId: {
            unitPlanId: keepUnit.id,
            expectationId: expectation.id
          }
        }
      });
      
      if (keepConnection) {
        console.log(`  ✅ Confirmed ${plan.expectationCode} remains in Unit ${plan.keepInUnit}: ${keepUnit.title}`);
      } else {
        console.log(`  ⚠️ Adding ${plan.expectationCode} to Unit ${plan.keepInUnit}: ${keepUnit.title}`);
        try {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: keepUnit.id,
              expectationId: expectation.id
            }
          });
          console.log(`  ✅ Added ${plan.expectationCode} to Unit ${plan.keepInUnit}`);
        } catch (error) {
          console.log(`  ❌ Error adding ${plan.expectationCode} to Unit ${plan.keepInUnit}:`, error.message);
        }
      }
    }
    
    console.log('\n📊 VERIFYING NEW DISTRIBUTION:');
    
    // Get updated units
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: { include: { expectation: true } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    const expectationCoverage = {};
    let perfectMapping = true;
    
    updatedUnits.forEach((unit, index) => {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Unit ${index + 1}: [${unitExpectations.join(', ')}]`);
      
      unitExpectations.forEach(code => {
        expectationCoverage[code] = (expectationCoverage[code] || 0) + 1;
      });
    });
    
    console.log('\n🎯 EXPECTATION MAPPING VERIFICATION:');
    for (const [code, count] of Object.entries(expectationCoverage)) {
      if (count === 1) {
        console.log(`✅ ${code}: Perfect (1 unit)`);
      } else {
        console.log(`❌ ${code}: ${count > 1 ? 'Over-covered' : 'Under-covered'} (${count} units)`);
        perfectMapping = false;
      }
    }
    
    if (perfectMapping) {
      console.log('\n🎉 PHASE 2 COMPLETED SUCCESSFULLY!');
      console.log('✅ Perfect 1:1 curriculum expectation mapping achieved');
      console.log('✅ No more pedagogical redundancy');
      console.log('✅ Efficient use of instructional time');
      console.log('\n🔄 Ready for Phase 3: Unit Boundary Redesign');
    } else {
      console.log('\n❌ PHASE 2 INCOMPLETE - Issues remain');
      console.log('Manual intervention may be required');
    }
    
  } catch (error) {
    console.error('❌ Error in Phase 2 expectation redistribution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

phase2ExpectationRedistribution();