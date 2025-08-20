const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeAllUnitDifferentiation() {
  try {
    console.log('🔍 ANALYZING ALL UNIT PLANS FOR DIFFERENTIATION STRATEGIES');
    console.log('=========================================================\n');
    
    // Get all unit plans across all subjects
    const allUnits = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });

    console.log(`Total unit plans found: ${allUnits.length}\n`);

    // Group by subject
    const unitsBySubject = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan?.subject || 'Unknown';
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    });

    console.log('UNITS BY SUBJECT:');
    Object.entries(unitsBySubject).forEach(([subject, units]) => {
      console.log(`📚 ${subject}: ${units.length} units`);
    });

    console.log('\n🔍 DIFFERENTIATION ANALYSIS');
    console.log('============================\n');

    // Analyze differentiation strategies
    const differentiationLengths = new Map();
    const uniqueDifferentiations = new Set();
    let templatedCount = 0;
    let missingCount = 0;

    allUnits.forEach(unit => {
      const diff = unit.differentiationStrategies;
      if (!diff) {
        missingCount++;
        return;
      }

      const diffString = JSON.stringify(diff);
      const length = diffString.length;
      
      if (differentiationLengths.has(length)) {
        differentiationLengths.set(length, differentiationLengths.get(length) + 1);
      } else {
        differentiationLengths.set(length, 1);
      }

      uniqueDifferentiations.add(diffString);
      
      // Check for the mentioned 828-character template
      if (length === 828) {
        templatedCount++;
      }
    });

    console.log(`Units with missing differentiation: ${missingCount}`);
    console.log(`Units with 828-char template: ${templatedCount}`);
    console.log(`Unique differentiation strategies: ${uniqueDifferentiations.size}/${allUnits.length}`);

    console.log('\nDIFFERENTIATION LENGTH DISTRIBUTION:');
    Array.from(differentiationLengths.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([length, count]) => {
        console.log(`  ${length} chars: ${count} units ${count === templatedCount && length === 828 ? '← TEMPLATE PROBLEM' : ''}`);
      });

    console.log('\n📋 DETAILED UNIT ANALYSIS BY SUBJECT');
    console.log('====================================\n');

    for (const [subject, units] of Object.entries(unitsBySubject)) {
      console.log(`\n${subject.toUpperCase()} (${units.length} units):`);
      console.log('─'.repeat(50));
      
      units.forEach((unit, i) => {
        const diff = unit.differentiationStrategies;
        const diffLength = diff ? JSON.stringify(diff).length : 0;
        const expectations = unit.expectations.map(e => e.expectation.code).join(', ');
        
        console.log(`${i+1}. "${unit.title}"`);
        console.log(`   Expectations: [${expectations}]`);
        console.log(`   Differentiation: ${diffLength} chars ${diffLength === 828 ? '← TEMPLATE' : diffLength === 0 ? '← MISSING' : '✓'}`);
        
        if (unit.description) {
          const preview = unit.description.substring(0, 80).replace(/\n/g, ' ');
          console.log(`   Content: "${preview}..."`);
        }
        
        if (unit.bigIdeas) {
          const concepts = unit.bigIdeas.substring(0, 60).replace(/\n/g, ' ');
          console.log(`   Concepts: "${concepts}..."`);
        }
        console.log('');
      });
    }

    console.log('\n🎯 DIFFERENTIATION REQUIREMENTS ANALYSIS');
    console.log('========================================\n');

    // Check what types of differentiation challenges each subject will need
    for (const [subject, units] of Object.entries(unitsBySubject)) {
      console.log(`${subject}:`);
      
      const subjectChallenges = new Set();
      
      units.forEach(unit => {
        // Analyze content for differentiation needs
        const content = `${unit.title} ${unit.description || ''} ${unit.bigIdeas || ''}`.toLowerCase();
        
        if (content.includes('mathématiques') || content.includes('nombre') || content.includes('calcul')) {
          subjectChallenges.add('Mathematical concepts');
        }
        if (content.includes('français') || content.includes('lecture') || content.includes('écriture')) {
          subjectChallenges.add('Language arts');
        }
        if (content.includes('science') || content.includes('expérience') || content.includes('observation')) {
          subjectChallenges.add('Scientific inquiry');
        }
        if (content.includes('art') || content.includes('créatif') || content.includes('expression')) {
          subjectChallenges.add('Creative expression');
        }
        if (content.includes('culture') || content.includes('tradition') || content.includes('communauté')) {
          subjectChallenges.add('Cultural understanding');
        }
        if (content.includes('outil') || content.includes('matériel') || content.includes('technique')) {
          subjectChallenges.add('Tool/material usage');
        }
      });
      
      console.log(`  Key differentiation areas: ${Array.from(subjectChallenges).join(', ')}`);
      console.log(`  Units needing custom differentiation: ${units.length}`);
      console.log('');
    }

    console.log('🔧 RECOMMENDED ACTION PLAN');
    console.log('==========================\n');

    const totalUnitsNeedingWork = allUnits.length - (uniqueDifferentiations.size - (missingCount > 0 ? 1 : 0));
    
    console.log(`1. Replace ${templatedCount} units with 828-char template differentiation`);
    console.log(`2. Create ${missingCount} missing differentiation strategies`);
    console.log(`3. Review and potentially enhance ${uniqueDifferentiations.size} existing unique strategies`);
    console.log(`4. Total units requiring attention: ${totalUnitsNeedingWork}/${allUnits.length}`);
    
    console.log('\nPRIORITY ORDER:');
    console.log('1. French units (language complexity)');
    console.log('2. Math units (abstract concepts)');
    console.log('3. Science units (safety and inquiry)');
    console.log('4. Arts units (creative expression ranges)');
    console.log('5. Social Studies units (cultural sensitivity)');
    console.log('6. FPS/Health units (emotional/physical differences)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeAllUnitDifferentiation();