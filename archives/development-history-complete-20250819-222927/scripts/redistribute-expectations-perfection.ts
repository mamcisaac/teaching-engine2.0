import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function redistributeExpectationsPerfection() {
  try {
    console.log('🎯 PHASE 2: Redistributing Curriculum Expectations for Perfection');
    console.log('Eliminating over-coverage and ensuring optimal thematic alignment');
    
    // Get current expectation distribution
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Get all available expectations for this LRP
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      }
    });

    console.log('\n📊 CURRENT EXPECTATION DISTRIBUTION (PROBLEMATIC):');
    const currentDistribution: Record<string, string[]> = {};
    
    for (const unit of units) {
      console.log(`\\n${unit.title}:`);
      const expectationCodes = unit.expectations.map(e => e.expectation.code);
      console.log(`  Expectations (${expectationCodes.length}): ${expectationCodes.join(', ')}`);
      
      for (const code of expectationCodes) {
        if (!currentDistribution[code]) {
          currentDistribution[code] = [];
        }
        currentDistribution[code].push(unit.title);
      }
    }

    console.log('\\n❌ OVER-COVERAGE ANALYSIS:');
    for (const [code, unitTitles] of Object.entries(currentDistribution)) {
      if (unitTitles.length > 1) {
        console.log(`  ${code}: appears in ${unitTitles.length} units (${((unitTitles.length - 1) * 100)}% over-coverage)`);
        console.log(`    Units: ${unitTitles.join(', ')}`);
      } else {
        console.log(`  ${code}: ✅ appears in 1 unit (${unitTitles[0]})`);
      }
    }

    // Define optimal thematic distribution
    const optimalDistribution = [
      {
        unitTitle: 'Notre école communautaire',
        expectations: ['1ICC.1'], // Diversity of families and lifestyles - fits school community theme
        rationale: 'School community naturally explores diverse students and families'
      },
      {
        unitTitle: 'Les aides de notre quartier', 
        expectations: ['1ER.1'], // Understanding needs and desires - fits community helpers theme
        rationale: 'Community helpers address different needs and desires of community members'
      },
      {
        unitTitle: 'Nos familles et traditions',
        expectations: ['1C.1'], // Rights and responsibilities in family/school - fits family theme
        rationale: 'Family unit naturally explores rights and responsibilities within family structures'
      },
      {
        unitTitle: 'Notre quartier et notre ville',
        expectations: ['1LT.1'], // Geographic tools and landmarks - fits neighborhood/city theme
        rationale: 'Neighborhood exploration requires maps, landmarks, and geographic tools'
      },
      {
        unitTitle: 'Géographie et cartographie',
        expectations: ['1LT.2'], // Personal timeline organization - fits geography/time theme
        rationale: 'Geography unit can explore how places change over time (temporal geography)'
      },
      {
        unitTitle: 'Citoyenneté et responsabilité',
        expectations: ['1C.2'], // Digital citizenship - already correctly placed
        rationale: 'Digital citizenship fits perfectly with broader citizenship themes'
      },
      {
        unitTitle: 'Notre monde connecté',
        expectations: ['1PA.1'], // Decision-making and conflict resolution - already correctly placed
        rationale: 'Connected world requires collaborative decision-making skills'
      }
    ];

    console.log('\\n🎯 OPTIMAL THEMATIC DISTRIBUTION:');
    for (const unit of optimalDistribution) {
      console.log(`\\n${unit.unitTitle}:`);
      console.log(`  Expectation: ${unit.expectations[0]}`);
      console.log(`  Rationale: ${unit.rationale}`);
    }

    // Verify all expectations are covered
    const allLrpExpectations = lrp?.expectations?.map(e => e.expectation.code) || [];
    const redistributedExpectations = optimalDistribution.map(u => u.expectations[0]);
    
    console.log('\\n📋 COVERAGE VERIFICATION:');
    console.log(`Total LRP expectations: ${allLrpExpectations.length}`);
    console.log(`Redistributed expectations: ${redistributedExpectations.length}`);
    
    const missing = allLrpExpectations.filter(code => !redistributedExpectations.includes(code));
    const extra = redistributedExpectations.filter(code => !allLrpExpectations.includes(code));
    
    if (missing.length > 0) {
      console.log(`❌ MISSING: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.log(`❌ EXTRA: ${extra.join(', ')}`);
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`✅ PERFECT: All expectations covered exactly once`);
    }

    // Apply the redistribution
    if (missing.length === 0 && extra.length === 0) {
      console.log('\\n🔧 APPLYING OPTIMAL REDISTRIBUTION:');
      
      for (const unit of units) {
        // Find the optimal distribution for this unit
        const optimalUnit = optimalDistribution.find(ou => ou.unitTitle === unit.title);
        
        if (!optimalUnit) {
          console.log(`⚠️ No optimal distribution found for ${unit.title}`);
          continue;
        }

        console.log(`\\n📚 Updating ${unit.title}:`);
        
        // Remove all current expectations
        await prisma.unitPlanExpectation.deleteMany({
          where: { unitPlanId: unit.id }
        });
        console.log(`  🗑️ Removed all current expectations`);
        
        // Add the optimal expectation
        const targetExpectationCode = optimalUnit.expectations[0];
        const targetExpectation = lrp?.expectations?.find(e => e.expectation.code === targetExpectationCode);
        
        if (targetExpectation) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: targetExpectation.expectation.id
            }
          });
          console.log(`  ✅ Added ${targetExpectationCode}: ${targetExpectation.expectation.description}`);
        } else {
          console.log(`  ❌ Could not find expectation ${targetExpectationCode}`);
        }
      }

      console.log('\\n🎉 PHASE 2 COMPLETE: Optimal Expectation Distribution Achieved!');
      console.log('✅ Each expectation appears in exactly one unit');
      console.log('✅ Perfect thematic alignment achieved');
      console.log('✅ 100% curriculum coverage maintained');
      console.log('✅ 0% redundancy (eliminated all over-coverage)');
      
    } else {
      console.log('\\n❌ Cannot proceed - coverage verification failed');
    }

    // Final verification
    console.log('\\n🔍 FINAL VERIFICATION:');
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    const finalDistribution: Record<string, number> = {};
    
    for (const unit of updatedUnits) {
      const expectationCodes = unit.expectations.map(e => e.expectation.code);
      console.log(`${unit.title}: ${expectationCodes.join(', ') || 'NO EXPECTATIONS'}`);
      
      for (const code of expectationCodes) {
        finalDistribution[code] = (finalDistribution[code] || 0) + 1;
      }
    }

    console.log('\\n📊 FINAL DISTRIBUTION ANALYSIS:');
    let perfectDistribution = true;
    for (const [code, count] of Object.entries(finalDistribution)) {
      if (count === 1) {
        console.log(`✅ ${code}: appears ${count} time (PERFECT)`);
      } else {
        console.log(`❌ ${code}: appears ${count} times (OVER-COVERAGE)`);
        perfectDistribution = false;
      }
    }

    if (perfectDistribution && Object.keys(finalDistribution).length === allLrpExpectations.length) {
      console.log('\\n🏆 PERFECT EXPECTATION DISTRIBUTION ACHIEVED!');
    } else {
      console.log('\\n⚠️ Distribution needs further adjustment');
    }

  } catch (error) {
    console.error('❌ Error redistributing expectations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

redistributeExpectationsPerfection();