// Detailed French System Validation
// Deep dive into Emily's French lessons for quality assurance

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${__dirname}/packages/database/prisma/dev.db`
    }
  }
});

async function main() {
  console.log('\n🔍 FRENCH SYSTEM DETAILED VALIDATION');
  console.log('=====================================\n');

  try {
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });

    if (!emily) {
      const allUsers = await prisma.user.findMany();
      emily = allUsers[0];
    }

    // Get French Long Range Plan
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        unitPlans: {
          include: {
            expectations: {
              include: {
                expectation: true
              }
            },
            lessonPlans: {
              include: {
                expectations: {
                  include: {
                    expectation: true
                  }
                }
              },
              orderBy: { date: 'asc' }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!frenchLRP) {
      console.log('❌ French Long Range Plan not found');
      return;
    }

    console.log(`✅ French LRP Found: ${frenchLRP.title}`);
    console.log(`   Academic Year: ${frenchLRP.academicYear}`);
    console.log(`   Units: ${frenchLRP.unitPlans.length}`);
    console.log(`   LRP Expectations: ${frenchLRP.expectations.length}\n`);

    // Analyze each unit in detail
    for (let i = 0; i < Math.min(3, frenchLRP.unitPlans.length); i++) {
      const unit = frenchLRP.unitPlans[i];
      console.log(`\n📚 UNIT ${i + 1}: ${unit.title}`);
      console.log('='.repeat(50));
      console.log(`Duration: ${new Date(unit.startDate).toLocaleDateString()} - ${new Date(unit.endDate).toLocaleDateString()}`);
      console.log(`Lessons: ${unit.lessonPlans.length}`);
      console.log(`Unit Expectations: ${unit.expectations.length}`);

      // Unit Quality Analysis
      console.log(`\n🎯 Unit Quality Analysis:`);
      console.log(`   Big Ideas: ${unit.bigIdeas ? '✅' : '❌'}`);
      console.log(`   Essential Questions: ${unit.essentialQuestions ? '✅' : '❌'}`);
      console.log(`   Assessment Plan: ${unit.assessmentPlan ? '✅' : '❌'}`);
      console.log(`   Differentiation Strategies: ${unit.differentiationStrategies ? '✅' : '❌'}`);
      console.log(`   Indigenous Perspectives: ${unit.indigenousPerspectives ? '✅' : '❌'}`);
      console.log(`   Community Connections: ${unit.communityConnections ? '✅' : '❌'}`);

      // Sample a few lessons for detailed analysis
      const sampleLessons = unit.lessonPlans.slice(0, 3);
      console.log(`\n📝 Sample Lessons (First 3):`);
      
      for (let j = 0; j < sampleLessons.length; j++) {
        const lesson = sampleLessons[j];
        console.log(`\n   Lesson ${j + 1}: ${lesson.title}`);
        console.log(`   Date: ${new Date(lesson.date).toLocaleDateString()}`);
        console.log(`   Duration: ${lesson.duration} minutes`);
        
        // ETFO Structure Validation
        console.log(`   ETFO Structure:`);
        console.log(`     Minds On: ${lesson.mindsOn ? '✅' : '❌'} (${lesson.mindsOn ? lesson.mindsOn.length : 0} chars)`);
        console.log(`     Action: ${lesson.action ? '✅' : '❌'} (${lesson.action ? lesson.action.length : 0} chars)`);
        console.log(`     Consolidation: ${lesson.consolidation ? '✅' : '❌'} (${lesson.consolidation ? lesson.consolidation.length : 0} chars)`);
        console.log(`     Learning Goals: ${lesson.learningGoals ? '✅' : '❌'} (${lesson.learningGoals ? lesson.learningGoals.length : 0} chars)`);
        
        // Differentiation Analysis
        if (lesson.differentiationStrategies) {
          try {
            const strategies = JSON.parse(lesson.differentiationStrategies);
            console.log(`   Differentiation Strategies: ✅`);
            console.log(`     Categories: ${Object.keys(strategies).join(', ')}`);
          } catch (e) {
            console.log(`   Differentiation Strategies: ✅ (parsing error)`);
          }
        } else {
          console.log(`   Differentiation Strategies: ❌`);
        }

        // Assessment Integration
        console.log(`   Assessment Type: ${lesson.assessmentType || 'Not specified'}`);
        console.log(`   Assessment Notes: ${lesson.assessmentNotes ? '✅' : '❌'}`);
        
        // Materials and Resources
        if (lesson.materials) {
          try {
            const materials = JSON.parse(lesson.materials);
            console.log(`   Materials: ✅ (${materials.length} items)`);
          } catch (e) {
            console.log(`   Materials: ✅ (parsing error)`);
          }
        } else {
          console.log(`   Materials: ❌`);
        }

        // Expectations Coverage
        console.log(`   Linked Expectations: ${lesson.expectations.length}`);
        if (lesson.expectations.length > 0) {
          lesson.expectations.forEach(exp => {
            console.log(`     - ${exp.expectation.code}: ${exp.expectation.description.substring(0, 60)}...`);
          });
        }
      }

      // Unit-level vocabulary analysis
      if (unit.keyVocabulary) {
        try {
          const vocab = JSON.parse(unit.keyVocabulary);
          console.log(`\n📚 Key Vocabulary: ${vocab.length} words`);
          console.log(`   Sample: ${vocab.slice(0, 5).join(', ')}${vocab.length > 5 ? '...' : ''}`);
        } catch (e) {
          console.log(`\n📚 Key Vocabulary: present (parsing error)`);
        }
      }
    }

    // Overall French System Analysis
    console.log(`\n\n📊 FRENCH SYSTEM SUMMARY`);
    console.log('='.repeat(30));
    
    const totalFrenchLessons = frenchLRP.unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
    console.log(`Total French Lessons: ${totalFrenchLessons}`);
    
    // Vocabulary progression analysis
    let totalVocabulary = 0;
    frenchLRP.unitPlans.forEach(unit => {
      if (unit.keyVocabulary) {
        try {
          const vocab = JSON.parse(unit.keyVocabulary);
          totalVocabulary += vocab.length;
        } catch (e) {
          // Skip units with parsing errors
        }
      }
    });
    console.log(`Total Vocabulary Words: ${totalVocabulary}`);
    
    // Assessment variety analysis
    const allLessons = frenchLRP.unitPlans.flatMap(unit => unit.lessonPlans);
    const assessmentTypes = {};
    allLessons.forEach(lesson => {
      const type = lesson.assessmentType || 'Not specified';
      assessmentTypes[type] = (assessmentTypes[type] || 0) + 1;
    });
    
    console.log(`\nAssessment Type Distribution:`);
    Object.entries(assessmentTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} lessons (${Math.round(count/allLessons.length*100)}%)`);
    });

    // Cultural connections analysis
    let unitsWithCulturalConnections = 0;
    frenchLRP.unitPlans.forEach(unit => {
      if (unit.communityConnections || unit.indigenousPerspectives) {
        unitsWithCulturalConnections++;
      }
    });
    
    console.log(`\nCultural Integration:`);
    console.log(`   Units with Cultural Connections: ${unitsWithCulturalConnections}/${frenchLRP.unitPlans.length} (${Math.round(unitsWithCulturalConnections/frenchLRP.unitPlans.length*100)}%)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);