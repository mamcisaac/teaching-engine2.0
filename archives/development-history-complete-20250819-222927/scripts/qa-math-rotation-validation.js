// Math and Rotation Subjects Validation
// Comprehensive quality check for all non-French subjects

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${__dirname}/packages/database/prisma/dev.db`
    }
  }
});

async function main() {
  console.log('\n🔍 MATH & ROTATION SUBJECTS VALIDATION');
  console.log('========================================\n');

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

    // Get all non-French subjects
    const subjects = [
      'Mathématiques',
      'Sciences de la nature', 
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale'
    ];

    for (const subject of subjects) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${subject.toUpperCase()} ANALYSIS`);
      console.log(`${'='.repeat(60)}`);

      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: emily.id,
          subject: subject
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

      if (!lrp) {
        console.log(`❌ No Long Range Plan found for ${subject}`);
        continue;
      }

      console.log(`✅ LRP Found: ${lrp.title}`);
      console.log(`   Academic Year: ${lrp.academicYear}`);
      console.log(`   Units: ${lrp.unitPlans.length}`);
      console.log(`   LRP Expectations: ${lrp.expectations.length}`);

      // Calculate totals
      const totalLessons = lrp.unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
      console.log(`   Total Lessons: ${totalLessons}`);

      // Unit Analysis
      console.log(`\n📋 UNIT BREAKDOWN:`);
      lrp.unitPlans.forEach((unit, idx) => {
        const startDate = new Date(unit.startDate).toLocaleDateString();
        const endDate = new Date(unit.endDate).toLocaleDateString();
        const duration = Math.ceil((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        console.log(`   ${idx + 1}. ${unit.title}`);
        console.log(`      Duration: ${duration} weeks (${startDate} - ${endDate})`);
        console.log(`      Lessons: ${unit.lessonPlans.length}`);
        console.log(`      Expectations: ${unit.expectations.length}`);
        
        // Quality indicators
        const qualityChecks = {
          bigIdeas: unit.bigIdeas ? '✅' : '❌',
          essentialQuestions: unit.essentialQuestions ? '✅' : '❌',
          assessmentPlan: unit.assessmentPlan ? '✅' : '❌',
          differentiation: unit.differentiationStrategies ? '✅' : '❌',
          indigenous: unit.indigenousPerspectives ? '✅' : '❌',
          community: unit.communityConnections ? '✅' : '❌'
        };
        
        console.log(`      Quality: BigIdeas${qualityChecks.bigIdeas} EssentialQ${qualityChecks.essentialQuestions} Assessment${qualityChecks.assessmentPlan} Diff${qualityChecks.differentiation} Indigenous${qualityChecks.indigenous} Community${qualityChecks.community}`);
      });

      // Sample lesson analysis
      const allLessons = lrp.unitPlans.flatMap(unit => unit.lessonPlans);
      if (allLessons.length > 0) {
        console.log(`\n📝 LESSON QUALITY ANALYSIS:`);
        
        // ETFO Structure compliance
        const structureCompliance = allLessons.reduce((acc, lesson) => {
          acc.mindsOn += lesson.mindsOn ? 1 : 0;
          acc.action += lesson.action ? 1 : 0;
          acc.consolidation += lesson.consolidation ? 1 : 0;
          acc.learningGoals += lesson.learningGoals ? 1 : 0;
          return acc;
        }, { mindsOn: 0, action: 0, consolidation: 0, learningGoals: 0 });

        console.log(`   ETFO Structure Compliance:`);
        console.log(`     Minds On: ${structureCompliance.mindsOn}/${allLessons.length} (${Math.round(structureCompliance.mindsOn/allLessons.length*100)}%)`);
        console.log(`     Action: ${structureCompliance.action}/${allLessons.length} (${Math.round(structureCompliance.action/allLessons.length*100)}%)`);
        console.log(`     Consolidation: ${structureCompliance.consolidation}/${allLessons.length} (${Math.round(structureCompliance.consolidation/allLessons.length*100)}%)`);
        console.log(`     Learning Goals: ${structureCompliance.learningGoals}/${allLessons.length} (${Math.round(structureCompliance.learningGoals/allLessons.length*100)}%)`);

        // Duration analysis
        const avgDuration = allLessons.reduce((sum, lesson) => sum + lesson.duration, 0) / allLessons.length;
        console.log(`   Average Duration: ${Math.round(avgDuration)} minutes`);

        // Assessment analysis
        const assessmentTypes = {};
        allLessons.forEach(lesson => {
          const type = lesson.assessmentType || 'Not specified';
          assessmentTypes[type] = (assessmentTypes[type] || 0) + 1;
        });

        console.log(`   Assessment Distribution:`);
        Object.entries(assessmentTypes).forEach(([type, count]) => {
          console.log(`     ${type}: ${count} (${Math.round(count/allLessons.length*100)}%)`);
        });

        // Sample lesson content
        const sampleLesson = allLessons[0];
        console.log(`\n📖 SAMPLE LESSON CONTENT:`);
        console.log(`   Title: ${sampleLesson.title}`);
        console.log(`   Minds On Length: ${sampleLesson.mindsOn ? sampleLesson.mindsOn.length : 0} chars`);
        console.log(`   Action Length: ${sampleLesson.action ? sampleLesson.action.length : 0} chars`);
        console.log(`   Consolidation Length: ${sampleLesson.consolidation ? sampleLesson.consolidation.length : 0} chars`);
        console.log(`   Learning Goals Length: ${sampleLesson.learningGoals ? sampleLesson.learningGoals.length : 0} chars`);
      }

      // Schedule analysis for rotation subjects
      if (subject !== 'Mathématiques') {
        console.log(`\n📅 ROTATION SCHEDULE ANALYSIS:`);
        
        // Calculate total weeks and blocks
        let totalWeeks = 0;
        let blocks = [];
        
        lrp.unitPlans.forEach(unit => {
          const duration = Math.ceil((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
          totalWeeks += duration;
          blocks.push({
            title: unit.title,
            start: new Date(unit.startDate),
            duration: duration
          });
        });
        
        console.log(`   Total Rotation Time: ${totalWeeks} weeks`);
        console.log(`   Number of Blocks: ${blocks.length}`);
        console.log(`   Average Block Duration: ${Math.round(totalWeeks/blocks.length)} weeks`);
        
        // Check for gaps in rotation
        blocks.sort((a, b) => a.start - b.start);
        console.log(`   First Block: ${blocks[0].start.toLocaleDateString()}`);
        console.log(`   Last Block: ${blocks[blocks.length-1].start.toLocaleDateString()}`);
      }
    }

    // OVERALL ROTATION VALIDATION
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`🎯 ROTATION MODEL VALIDATION`);
    console.log(`${'='.repeat(60)}`);

    // Get all rotation units and check for overlap
    const rotationSubjects = ['Sciences de la nature', 'Sciences humaines', 'Arts visuels', 'Formation personnelle et sociale'];
    const allRotationUnits = [];

    for (const subject of rotationSubjects) {
      const lrp = await prisma.longRangePlan.findFirst({
        where: { userId: emily.id, subject: subject },
        include: { unitPlans: true }
      });

      if (lrp) {
        lrp.unitPlans.forEach(unit => {
          allRotationUnits.push({
            subject: subject,
            title: unit.title,
            start: new Date(unit.startDate),
            end: new Date(unit.endDate),
            lessons: 0 // We'll calculate this if needed
          });
        });
      }
    }

    // Sort by start date
    allRotationUnits.sort((a, b) => a.start - b.start);

    console.log(`Total Rotation Units: ${allRotationUnits.length}`);
    console.log(`\nRotation Schedule:`);
    
    let previousEnd = null;
    let overlapCount = 0;
    let gapCount = 0;

    allRotationUnits.forEach((unit, idx) => {
      const startDate = unit.start.toLocaleDateString();
      const endDate = unit.end.toLocaleDateString();
      
      console.log(`${idx + 1}. ${unit.subject}: ${unit.title}`);
      console.log(`   ${startDate} - ${endDate}`);
      
      if (previousEnd) {
        if (unit.start < previousEnd) {
          console.log(`   ⚠️  OVERLAP with previous unit`);
          overlapCount++;
        } else if (unit.start > previousEnd) {
          const gapDays = Math.ceil((unit.start - previousEnd) / (1000 * 60 * 60 * 24));
          if (gapDays > 7) {
            console.log(`   ⚠️  GAP of ${gapDays} days from previous unit`);
            gapCount++;
          }
        }
      }
      
      previousEnd = unit.end;
    });

    console.log(`\nRotation Quality Assessment:`);
    console.log(`   Overlaps: ${overlapCount}`);
    console.log(`   Significant Gaps: ${gapCount}`);
    console.log(`   Rotation Integrity: ${overlapCount === 0 && gapCount === 0 ? '✅ Perfect' : '⚠️  Issues Found'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);