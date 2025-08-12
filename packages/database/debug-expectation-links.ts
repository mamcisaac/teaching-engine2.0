#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugExpectationLinks() {
  console.log('🔍 DEBUGGING EXPECTATION LINKAGES');
  console.log('==================================\n');

  try {
    // Check unitPlanExpectation table
    const allLinks = await prisma.unitPlanExpectation.findMany({
      include: {
        unitPlan: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            longRangePlan: {
              select: {
                subject: true
              }
            }
          }
        },
        expectation: {
          select: {
            code: true,
            subject: true
          }
        }
      }
    });

    console.log(`📊 Total expectation links in database: ${allLinks.length}`);

    // Filter for mathematics
    const mathLinks = allLinks.filter(link => 
      link.unitPlan.longRangePlan.subject === 'Mathématiques'
    );

    console.log(`🔢 Mathematics expectation links: ${mathLinks.length}`);

    if (mathLinks.length > 0) {
      console.log('\nExisting mathematics links:');
      mathLinks.forEach(link => {
        console.log(`  ✓ Unit: ${link.unitPlan.titleFr || link.unitPlan.title} → Expectation: ${link.expectation.code}`);
      });
    } else {
      console.log('❌ NO mathematics expectation links found!');
    }

    // Check if mathematics expectations exist
    const mathExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      },
      select: {
        id: true,
        code: true
      }
    });

    console.log(`\n📚 Mathematics expectations in database: ${mathExpectations.length}`);

    // Check if mathematics unit plans exist
    const mathUnitPlans = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: 'Mathématiques'
        }
      },
      select: {
        id: true,
        title: true,
        titleFr: true
      }
    });

    console.log(`📝 Mathematics unit plans in database: ${mathUnitPlans.length}`);

    // Try to find what went wrong with the linking
    console.log('\n🔍 DIAGNOSTIC CHECKS:');

    // Check if we can find expectation by specific codes
    const testCodes = ['1.N1', '1.N2', '1.N3'];
    
    for (const code of testCodes) {
      const expectation = await prisma.curriculumExpectation.findFirst({
        where: { code: code }
      });
      console.log(`  ${code}: ${expectation ? '✓ Found' : '❌ Not found'} (ID: ${expectation?.id || 'N/A'})`);
    }

    // Check the exact expectation map that would be used in seeding
    console.log('\n📋 Expectation code mapping:');
    const expectationMap = new Map(mathExpectations.map(e => [e.code, e]));
    
    for (const [code, expectation] of expectationMap) {
      console.log(`  ${code} → ID: ${expectation.id}`);
    }

    // Check if there are any orphaned links
    const orphanedLinks = await prisma.unitPlanExpectation.findMany({
      where: {
        OR: [
          { unitPlan: null },
          { expectation: null }
        ]
      }
    });

    console.log(`\n🔗 Orphaned links: ${orphanedLinks.length}`);

    // Try a manual link creation to test
    console.log('\n🧪 TESTING MANUAL LINK CREATION:');
    
    if (mathUnitPlans.length > 0 && mathExpectations.length > 0) {
      const firstUnit = mathUnitPlans[0];
      const firstExpectation = mathExpectations[0];
      
      console.log(`Attempting to link Unit ${firstUnit.id} with Expectation ${firstExpectation.id}`);
      
      try {
        // Check if link already exists
        const existingLink = await prisma.unitPlanExpectation.findFirst({
          where: {
            unitPlanId: firstUnit.id,
            expectationId: firstExpectation.id
          }
        });

        if (existingLink) {
          console.log('  ✓ Link already exists');
        } else {
          // Try to create it
          const newLink = await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: firstUnit.id,
              expectationId: firstExpectation.id
            }
          });
          console.log(`  ✅ Successfully created test link (ID: ${newLink.id})`);
          
          // Clean up test link
          await prisma.unitPlanExpectation.delete({
            where: { id: newLink.id }
          });
          console.log('  🧹 Cleaned up test link');
        }
      } catch (error) {
        console.log(`  ❌ Failed to create link: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugExpectationLinks()
  .then(() => console.log('\n🎉 Debug completed!'))
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });