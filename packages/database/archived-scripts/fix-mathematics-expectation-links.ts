#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMathematicsExpectationLinks() {
  console.log('🔧 FIXING MATHEMATICS EXPECTATION LINKS');
  console.log('=======================================\n');

  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }

    // Get the Mathématiques long range plan
    const mathPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Mathématiques',
        academicYear: '2025-2026'
      }
    });
    
    if (!mathPlan) {
      throw new Error('Mathématiques long range plan not found.');
    }

    console.log(`✅ Found Mathématiques long range plan (ID: ${mathPlan.id})`);

    // Get all Math expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      }
    });
    
    // Create a map for easy lookup
    const expectationMap = new Map(expectations.map(e => [e.code, e]));
    console.log(`📚 Found ${expectations.length} mathematics expectations`);

    // Get all unit plans for this LRP in the correct order
    const unitPlans = await prisma.unitPlan.findMany({
      where: { longRangePlanId: mathPlan.id },
      orderBy: { startDate: 'asc' }
    });

    console.log(`📝 Found ${unitPlans.length} unit plans`);

    // Clear any existing links for these units
    const existingLinks = await prisma.unitPlanExpectation.findMany({
      where: {
        unitPlan: {
          longRangePlanId: mathPlan.id
        }
      }
    });

    if (existingLinks.length > 0) {
      await prisma.unitPlanExpectation.deleteMany({
        where: {
          unitPlan: {
            longRangePlanId: mathPlan.id
          }
        }
      });
      console.log(`🗑️ Cleared ${existingLinks.length} existing links`);
    }

    // Map unit plans by their French titles to match expectations
    const unitMapping = [
      {
        title: 'Les nombres tout autour de nous',
        expectations: ['1.N1', '1.N2', '1.N3']
      },
      {
        title: 'Comprendre les nombres', 
        expectations: ['1.N4', '1.N5', '1.N6']
      },
      {
        title: 'Régularités et formes',
        expectations: ['1.RR1', '1.RR2', '1.FE2']
      },
      {
        title: 'Addition et soustraction',
        expectations: ['1.N7', '1.N8']
      },
      {
        title: 'Stratégies de calcul mental',
        expectations: ['1.N9', '1.RR3']
      },
      {
        title: 'Explorer la mesure',
        expectations: ['1.FE1']
      },
      {
        title: 'Aventures de résolution de problèmes',
        expectations: [] // Application unit - uses all previous expectations
      },
      {
        title: 'Célébration mathématique',
        expectations: [] // Reflection unit - no new expectations
      }
    ];

    let totalLinks = 0;

    // Create the links
    for (const mapping of unitMapping) {
      const unit = unitPlans.find(u => 
        u.titleFr === mapping.title || u.title === mapping.title
      );

      if (!unit) {
        console.log(`⚠️  Could not find unit: ${mapping.title}`);
        continue;
      }

      console.log(`\n🔗 Linking unit: ${unit.titleFr || unit.title}`);

      for (const expCode of mapping.expectations) {
        const expectation = expectationMap.get(expCode);
        
        if (!expectation) {
          console.log(`  ❌ Could not find expectation: ${expCode}`);
          continue;
        }

        try {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          });
          
          console.log(`  ✅ Linked ${expCode}: ${expectation.description.substring(0, 60)}...`);
          totalLinks++;
        } catch (error) {
          console.log(`  ❌ Failed to link ${expCode}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 LINKING COMPLETE:`);
    console.log(`✅ Successfully created ${totalLinks} expectation links`);

    // Verify the links
    const verifyLinks = await prisma.unitPlanExpectation.findMany({
      where: {
        unitPlan: {
          longRangePlanId: mathPlan.id
        }
      },
      include: {
        unitPlan: {
          select: { titleFr: true, title: true }
        },
        expectation: {
          select: { code: true }
        }
      }
    });

    console.log(`\n🔍 VERIFICATION:`);
    console.log(`Found ${verifyLinks.length} total links for mathematics`);
    
    // Group by unit
    const linksByUnit = verifyLinks.reduce((acc, link) => {
      const unitTitle = link.unitPlan.titleFr || link.unitPlan.title;
      if (!acc[unitTitle]) acc[unitTitle] = [];
      acc[unitTitle].push(link.expectation.code);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [unitTitle, codes] of Object.entries(linksByUnit)) {
      console.log(`  📝 ${unitTitle}: ${codes.join(', ')}`);
    }

    // Check coverage
    const linkedExpectationCodes = verifyLinks.map(link => link.expectation.code);
    const expectedCodes = ['1.N1', '1.N2', '1.N3', '1.N4', '1.N5', '1.N6', '1.N7', '1.N8', '1.N9', '1.RR1', '1.RR2', '1.RR3', '1.FE1', '1.FE2'];
    const missingCodes = expectedCodes.filter(code => !linkedExpectationCodes.includes(code));

    if (missingCodes.length === 0) {
      console.log(`\n✅ PERFECT! All 14 mathematics expectations are now linked to units!`);
    } else {
      console.log(`\n⚠️  Missing expectation links: ${missingCodes.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error fixing expectation links:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMathematicsExpectationLinks()
  .then(() => console.log('\n🎉 Mathematics expectation links fixed!'))
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });