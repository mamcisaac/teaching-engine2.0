import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeMathUnits() {
  try {
    // Query all Math units with expectations
    const mathUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in' // Math LRP ID
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log('=== MATH UNITS ANALYSIS ===\n');
    console.log(`Total Math Units Found: ${mathUnits.length}\n`);

    let totalHours = 0;
    let totalLessons = 0;
    
    mathUnits.forEach((unit, index) => {
      console.log(`\n--- Unit ${index + 1}: ${unit.title} ---`);
      console.log(`ID: ${unit.id}`);
      console.log(`Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`Estimated Hours: ${unit.estimatedHours}`);
      console.log(`Number of Expectations: ${unit.expectations.length}`);
      console.log(`Number of Lesson Plans: ${unit.lessonPlans.length}`);
      
      totalHours += unit.estimatedHours || 0;
      totalLessons += unit.lessonPlans.length;
      
      // Check key pedagogical fields
      console.log('\nPedagogical Completeness:');
      console.log(`- Big Ideas: ${unit.bigIdeas ? '✓' : '✗'}`);
      console.log(`- Essential Questions: ${unit.essentialQuestions ? '✓' : '✗'}`);
      console.log(`- Assessment Plan: ${unit.assessmentPlan ? '✓' : '✗'}`);
      console.log(`- Success Criteria: ${unit.successCriteria ? '✓' : '✗'}`);
      console.log(`- Differentiation Strategies: ${unit.differentiationStrategies ? '✓' : '✗'}`);
      console.log(`- Indigenous Perspectives: ${unit.indigenousPerspectives ? '✓' : '✗'}`);
      console.log(`- Key Vocabulary: ${unit.keyVocabulary ? '✓' : '✗'}`);
      console.log(`- Prior Knowledge: ${unit.priorKnowledge ? '✓' : '✗'}`);
      console.log(`- Cross-Curricular Connections: ${unit.crossCurricularConnections ? '✓' : '✗'}`);
      console.log(`- Community Connections: ${unit.communityConnections ? '✓' : '✗'}`);
      
      // Show expectations if unit has 0
      if (unit.expectations.length === 0) {
        console.log('\n⚠️ WARNING: This unit has NO curriculum expectations assigned!');
      } else {
        console.log('\nExpectations covered:');
        unit.expectations.forEach(exp => {
          console.log(`  - ${exp.expectation.code}: ${exp.expectation.description.substring(0, 50)}...`);
        });
      }
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total Units: ${mathUnits.length}`);
    console.log(`Total Hours Allocated: ${totalHours}`);
    console.log(`Required Hours: 146.25`);
    console.log(`Hour Difference: ${totalHours - 146.25} (${totalHours > 146.25 ? 'OVER' : 'UNDER'})`);
    console.log(`Total Lesson Plans: ${totalLessons}`);
    console.log(`Required Lesson Plans: 195`);
    console.log(`Lesson Plan Gap: ${195 - totalLessons} lessons needed`);
    
    // Check for overlapping dates
    console.log('\n=== DATE OVERLAP CHECK ===');
    for (let i = 0; i < mathUnits.length - 1; i++) {
      const currentUnit = mathUnits[i];
      const nextUnit = mathUnits[i + 1];
      if (currentUnit.endDate >= nextUnit.startDate) {
        console.log(`⚠️ OVERLAP: Unit ${i + 1} ends on ${currentUnit.endDate.toISOString().split('T')[0]} but Unit ${i + 2} starts on ${nextUnit.startDate.toISOString().split('T')[0]}`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing math units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeMathUnits();