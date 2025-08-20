import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit5Expectation() {
  try {
    console.log('🔧 FIXING UNIT 5: Assigning Missing Curriculum Expectation');
    console.log('===============================================================================');
    
    // Get the LRP and its expectations
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: { include: { expectation: true } }
      }
    });
    
    console.log('📋 LRP EXPECTATIONS:');
    const lrpExpectations = lrp.expectations.map(e => e.expectation.code);
    console.log(`Total expected: ${lrpExpectations.join(', ')}`);
    
    // Get current unit distribution
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: { include: { expectation: true } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT DISTRIBUTION:');
    units.forEach((unit, index) => {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Unit ${index + 1} (${unit.title}): [${unitExpectations.join(', ')}]`);
    });
    
    // Find Unit 3 and Unit 5
    const unit3 = units[2]; // 0-based index
    const unit5 = units[4]; // 0-based index
    
    console.log(`\n🎯 ANALYSIS:`);
    console.log(`Unit 3 (${unit3.title}): Has ${unit3.expectations.length} expectations`);
    console.log(`Unit 5 (${unit5.title}): Has ${unit5.expectations.length} expectations`);
    
    // Check if Unit 3 has 2 expectations that can be split
    if (unit3.expectations.length === 2) {
      console.log('\n📝 REDISTRIBUTION PLAN:');
      console.log('Unit 3 has 2 expectations, Unit 5 has 0');
      console.log('Moving one expectation from Unit 3 to Unit 5...');
      
      // Analyze which expectation should move based on content
      const unit3Expectations = unit3.expectations.map(e => ({
        code: e.expectation.code,
        description: e.expectation.description,
        id: e.expectation.id
      }));
      
      console.log('\nUnit 3 Expectations:');
      unit3Expectations.forEach(exp => {
        console.log(`- ${exp.code}: ${exp.description.substring(0, 100)}...`);
      });
      
      console.log(`\nUnit 5 Title: ${unit5.title}`);
      console.log('Unit 5 is about "Géographie et cartographie" (Geography and Cartography)');
      
      // Determine which expectation fits better with geography/cartography
      let expectationToMove = null;
      
      // Look for geography-related content
      for (const exp of unit3Expectations) {
        if (exp.code === '1LT.2' || exp.description.toLowerCase().includes('géographie') || 
            exp.description.toLowerCase().includes('lieu') || exp.description.toLowerCase().includes('carte')) {
          expectationToMove = exp;
          console.log(`\n🎯 DECISION: Moving ${exp.code} to Unit 5 (geographic content)`);
          break;
        }
      }
      
      // If no clear geographic match, move the second one (1LT.2)
      if (!expectationToMove) {
        expectationToMove = unit3Expectations.find(e => e.code === '1LT.2');
        console.log(`\n🎯 DECISION: Moving ${expectationToMove.code} to Unit 5 (better pedagogical balance)`);
      }
      
      if (expectationToMove) {
        console.log('\n🔧 EXECUTING MOVE...');
        
        // Remove from Unit 3
        try {
          await prisma.unitPlanExpectation.delete({
            where: {
              unitPlanId_expectationId: {
                unitPlanId: unit3.id,
                expectationId: expectationToMove.id
              }
            }
          });
          console.log(`✅ Removed ${expectationToMove.code} from Unit 3`);
        } catch (error) {
          console.log(`❌ Error removing from Unit 3:`, error.message);
        }
        
        // Add to Unit 5
        try {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit5.id,
              expectationId: expectationToMove.id
            }
          });
          console.log(`✅ Added ${expectationToMove.code} to Unit 5`);
        } catch (error) {
          console.log(`❌ Error adding to Unit 5:`, error.message);
        }
      }
      
    } else {
      console.log('\n⚠️ Unit 3 does not have 2 expectations. Checking for other solutions...');
      
      // Check what expectations are available
      const allAssignedExpectations = units.flatMap(u => u.expectations.map(e => e.expectation.code));
      const unassignedExpectations = lrpExpectations.filter(code => !allAssignedExpectations.includes(code));
      
      if (unassignedExpectations.length > 0) {
        console.log(`Found unassigned expectations: ${unassignedExpectations.join(', ')}`);
        // Add logic to assign one to Unit 5
      } else {
        console.log('All expectations are assigned. May need manual intervention.');
      }
    }
    
    console.log('\n📊 VERIFYING FINAL DISTRIBUTION:');
    
    // Get updated units
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: { include: { expectation: true } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let allUnitsHaveExpectations = true;
    updatedUnits.forEach((unit, index) => {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Unit ${index + 1}: [${unitExpectations.join(', ')}] ${unitExpectations.length === 0 ? '❌ EMPTY' : '✅'}`);
      if (unitExpectations.length === 0) {
        allUnitsHaveExpectations = false;
      }
    });
    
    if (allUnitsHaveExpectations) {
      console.log('\n🎉 UNIT 5 FIX COMPLETED!');
      console.log('✅ All units now have curriculum expectations');
      console.log('✅ Ready for Phase 3: Unit Boundary Redesign');
    } else {
      console.log('\n❌ ISSUE REMAINS: Some units still lack expectations');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Unit 5 expectation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit5Expectation();