// Detailed Individual Lesson Check
// Examine specific lessons to understand content quality and expectations linking

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${__dirname}/packages/database/prisma/dev.db`
    }
  }
});

async function main() {
  console.log('\n🔍 DETAILED LESSON QUALITY CHECK');
  console.log('==================================\n');

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

    // Get one lesson with full details
    const sampleLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { 
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Français (Immersion)'
          }
        }
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        unitPlan: {
          include: {
            longRangePlan: true,
            expectations: {
              include: {
                expectation: true
              }
            }
          }
        }
      }
    });

    if (!sampleLesson) {
      console.log('❌ No French lessons found');
      return;
    }

    console.log(`📝 SAMPLE LESSON ANALYSIS`);
    console.log(`Title: ${sampleLesson.title}`);
    console.log(`Date: ${new Date(sampleLesson.date).toLocaleDateString()}`);
    console.log(`Duration: ${sampleLesson.duration} minutes`);
    console.log(`Unit: ${sampleLesson.unitPlan.title}`);
    console.log(`Subject: ${sampleLesson.unitPlan.longRangePlan.subject}`);

    console.log(`\n🎯 ETFO STRUCTURE CONTENT:`);
    console.log(`\nMinds On:`);
    console.log(`${sampleLesson.mindsOn}\n`);
    
    console.log(`Action:`);
    console.log(`${sampleLesson.action}\n`);
    
    console.log(`Consolidation:`);
    console.log(`${sampleLesson.consolidation}\n`);
    
    console.log(`Learning Goals:`);
    console.log(`${sampleLesson.learningGoals}\n`);

    console.log(`📋 EXPECTATIONS ANALYSIS:`);
    console.log(`Lesson Expectations: ${sampleLesson.expectations.length}`);
    console.log(`Unit Expectations: ${sampleLesson.unitPlan.expectations.length}`);
    
    if (sampleLesson.unitPlan.expectations.length > 0) {
      console.log(`\nUnit-level Expectations:`);
      sampleLesson.unitPlan.expectations.forEach((exp, idx) => {
        console.log(`  ${idx + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
      });
    }

    console.log(`\n🎨 ASSESSMENT & DIFFERENTIATION:`);
    console.log(`Assessment Type: ${sampleLesson.assessmentType}`);
    console.log(`Assessment Notes: ${sampleLesson.assessmentNotes ? 'Present' : 'Missing'}`);
    
    if (sampleLesson.accommodations) {
      try {
        const accommodations = JSON.parse(sampleLesson.accommodations);
        console.log(`Accommodations: ${Object.keys(accommodations).length} categories`);
      } catch (e) {
        console.log(`Accommodations: Present (raw data)`);
      }
    }

    if (sampleLesson.differentiationStrategies) {
      console.log(`Differentiation Strategies: Present`);
    }

    // Check a few more lessons for pattern verification
    console.log(`\n\n📊 PATTERN VERIFICATION (10 lessons)`);
    console.log('=====================================');

    const moreLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Français (Immersion)'
          }
        }
      },
      include: {
        expectations: true,
        unitPlan: {
          include: {
            expectations: true
          }
        }
      },
      take: 10
    });

    console.log(`Lessons Analyzed: ${moreLessons.length}`);
    
    let structureCompliance = {
      mindsOn: 0,
      action: 0,
      consolidation: 0,
      learningGoals: 0
    };

    let assessmentTypes = {};
    let lessonExpectations = 0;
    let unitExpectations = 0;

    moreLessons.forEach(lesson => {
      if (lesson.mindsOn) structureCompliance.mindsOn++;
      if (lesson.action) structureCompliance.action++;
      if (lesson.consolidation) structureCompliance.consolidation++;
      if (lesson.learningGoals) structureCompliance.learningGoals++;
      
      const assessType = lesson.assessmentType || 'Not specified';
      assessmentTypes[assessType] = (assessmentTypes[assessType] || 0) + 1;
      
      lessonExpectations += lesson.expectations.length;
      unitExpectations += lesson.unitPlan.expectations.length;
    });

    console.log(`\nETFO Structure Compliance:`);
    console.log(`  Minds On: ${structureCompliance.mindsOn}/${moreLessons.length} (${Math.round(structureCompliance.mindsOn/moreLessons.length*100)}%)`);
    console.log(`  Action: ${structureCompliance.action}/${moreLessons.length} (${Math.round(structureCompliance.action/moreLessons.length*100)}%)`);
    console.log(`  Consolidation: ${structureCompliance.consolidation}/${moreLessons.length} (${Math.round(structureCompliance.consolidation/moreLessons.length*100)}%)`);
    console.log(`  Learning Goals: ${structureCompliance.learningGoals}/${moreLessons.length} (${Math.round(structureCompliance.learningGoals/moreLessons.length*100)}%)`);

    console.log(`\nExpectations Linking:`);
    console.log(`  Average Lesson-level Expectations: ${(lessonExpectations/moreLessons.length).toFixed(1)}`);
    console.log(`  Average Unit-level Expectations: ${(unitExpectations/moreLessons.length).toFixed(1)}`);

    console.log(`\nAssessment Distribution:`);
    Object.entries(assessmentTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} (${Math.round(count/moreLessons.length*100)}%)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);