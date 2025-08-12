#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditMathematicsCurrentState() {
  console.log('🔍 AUDITING MATHEMATICS CURRENT STATE');
  console.log('=====================================\n');

  try {
    // Check curriculum expectations
    const mathExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });

    console.log('📚 CURRICULUM EXPECTATIONS:');
    console.log(`Found ${mathExpectations.length} mathematics expectations`);
    
    if (mathExpectations.length > 0) {
      console.log('\nExisting expectations:');
      mathExpectations.forEach(exp => {
        console.log(`  ✓ ${exp.code}: ${exp.description}`);
      });
    } else {
      console.log('❌ NO mathematics expectations found in database!');
    }

    // Check if we have all 14 expected
    const expectedCodes = [
      '1.N1', '1.N2', '1.N3', '1.N4', '1.N5', '1.N6', '1.N7', '1.N8', '1.N9',
      '1.RR1', '1.RR2', '1.RR3', '1.FE1', '1.FE2'
    ];

    const missingCodes = expectedCodes.filter(code => 
      !mathExpectations.find(exp => exp.code === code)
    );

    if (missingCodes.length > 0) {
      console.log(`\n⚠️  MISSING ${missingCodes.length} expectations:`);
      missingCodes.forEach(code => console.log(`  ❌ ${code}`));
    } else {
      console.log('\n✅ All 14 mathematics expectations are present!');
    }

    // Check long range plans
    console.log('\n\n📅 LONG RANGE PLANS:');
    const mathLongRangePlans = await prisma.longRangePlan.findMany({
      where: {
        subject: 'Mathématiques'
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${mathLongRangePlans.length} mathematics long range plans`);
    mathLongRangePlans.forEach(plan => {
      console.log(`  ✓ ${plan.title} (${plan.academicYear}) - User: ${plan.user.email}`);
    });

    // Check unit plans
    console.log('\n\n📝 UNIT PLANS:');
    let totalMathUnits = 0;
    
    for (const lrp of mathLongRangePlans) {
      const units = await prisma.unitPlan.findMany({
        where: {
          longRangePlanId: lrp.id
        },
        orderBy: { startDate: 'asc' },
        include: {
          expectations: {
            include: {
              expectation: true
            }
          }
        }
      });

      console.log(`\nLong Range Plan: ${lrp.title}`);
      console.log(`Units found: ${units.length}`);
      
      if (units.length > 0) {
        units.forEach((unit, index) => {
          const expectationCodes = unit.expectations.map(e => e.expectation.code).join(', ');
          console.log(`  ${index + 1}. ${unit.titleFr || unit.title}`);
          console.log(`     Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
          console.log(`     Hours: ${unit.estimatedHours}`);
          console.log(`     Expectations: ${expectationCodes || 'None'}`);
        });
        
        totalMathUnits += units.length;
      } else {
        console.log('  ❌ No unit plans found for this long range plan');
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`  Curriculum Expectations: ${mathExpectations.length}/14`);
    console.log(`  Long Range Plans: ${mathLongRangePlans.length}`);
    console.log(`  Unit Plans: ${totalMathUnits}/8 expected`);

    // Check lesson plans
    console.log('\n\n📖 LESSON PLANS:');
    const mathLessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        subject: 'Mathématiques'
      }
    });

    console.log(`Found ${mathLessonPlans.length} mathematics lesson plans`);

    // Calculate total time allocation
    const totalUnitHours = await prisma.unitPlan.aggregate({
      where: {
        longRangePlan: {
          subject: 'Mathématiques'
        }
      },
      _sum: {
        estimatedHours: true
      }
    });

    console.log(`\n⏱️  TIME ALLOCATION:`);
    console.log(`  Total unit hours: ${totalUnitHours._sum.estimatedHours || 0}`);
    console.log(`  Expected for year: ~180 hours (30min x 360 lessons)`);

    // Identify critical gaps
    console.log('\n\n🚨 CRITICAL GAPS IDENTIFIED:');
    
    if (mathExpectations.length < 14) {
      console.log(`  ❌ Missing ${14 - mathExpectations.length} curriculum expectations`);
    }
    
    if (totalMathUnits < 8) {
      console.log(`  ❌ Missing ${8 - totalMathUnits} unit plans`);
    }
    
    if (missingCodes.length > 0) {
      console.log(`  ❌ Specific missing expectation codes: ${missingCodes.join(', ')}`);
    }

    if (mathExpectations.length === 14 && totalMathUnits === 8 && missingCodes.length === 0) {
      console.log('  ✅ No critical gaps found - all components appear to be implemented!');
    }

  } catch (error) {
    console.error('❌ Error during audit:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the audit
auditMathematicsCurrentState()
  .then(() => console.log('\n🎉 Mathematics audit completed!'))
  .catch((error) => {
    console.error('💥 Audit failed:', error);
    process.exit(1);
  });