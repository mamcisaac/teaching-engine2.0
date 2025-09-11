import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUnitEnhancements() {
  try {
    // Find Emily's units
    const units = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      select: {
        id: true,
        title: true,
        essentialQuestions: true,
        culminatingTask: true,
        bigIdeas: true,
        bigIdeasFr: true,
        longRangePlan: {
          select: {
            subject: true
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { title: 'asc' }
      ]
    });

    console.log(`Found ${units.length} total units for Emily\n`);

    // Group by subject and analyze
    const unitsBySubject = units.reduce((acc, unit) => {
      const subject = unit.longRangePlan.subject;
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(unit);
      return acc;
    }, {} as Record<string, any[]>);

    let totalUnitsNeedingEssentialQuestions = 0;
    let totalUnitsNeedingCulminatingTasks = 0;
    let totalUnitsNeedingBigIdeasEnhancement = 0;

    console.log('=== UNIT ENHANCEMENT ANALYSIS ===\n');

    Object.entries(unitsBySubject).forEach(([subject, subjectUnits]) => {
      console.log(`📚 ${subject}: ${subjectUnits.length} units`);
      
      let needsEssentialQuestions = 0;
      let needsCulminatingTasks = 0;
      let needsBigIdeasEnhancement = 0;

      subjectUnits.forEach((unit, index) => {
        console.log(`  ${index + 1}. ${unit.title}`);
        
        // Check essential questions
        const hasEssentialQuestions = unit.essentialQuestions && 
          Array.isArray(unit.essentialQuestions) && 
          unit.essentialQuestions.length > 0 &&
          unit.essentialQuestions.some((q: any) => q && typeof q === 'string' && q.trim().length > 0);
        
        if (!hasEssentialQuestions) {
          console.log(`     ❌ Missing essential questions`);
          needsEssentialQuestions++;
        } else {
          console.log(`     ✅ Has ${unit.essentialQuestions.length} essential questions`);
        }

        // Check culminating task
        const hasCulminatingTask = unit.culminatingTask && unit.culminatingTask.trim().length > 0;
        if (!hasCulminatingTask) {
          console.log(`     ❌ Missing culminating task`);
          needsCulminatingTasks++;
        } else {
          console.log(`     ✅ Has culminating task (${unit.culminatingTask.length} chars)`);
        }

        // Check big ideas
        const hasBigIdeas = unit.bigIdeas && unit.bigIdeas.trim().length > 50; // Substantial content
        if (!hasBigIdeas) {
          console.log(`     ❌ Big ideas need enhancement (${unit.bigIdeas ? unit.bigIdeas.length : 0} chars)`);
          needsBigIdeasEnhancement++;
        } else {
          console.log(`     ✅ Has substantial big ideas (${unit.bigIdeas.length} chars)`);
        }

        console.log('');
      });

      console.log(`  Summary for ${subject}:`);
      console.log(`    - Need essential questions: ${needsEssentialQuestions}/${subjectUnits.length}`);
      console.log(`    - Need culminating tasks: ${needsCulminatingTasks}/${subjectUnits.length}`);
      console.log(`    - Need big ideas enhancement: ${needsBigIdeasEnhancement}/${subjectUnits.length}`);
      console.log('');

      totalUnitsNeedingEssentialQuestions += needsEssentialQuestions;
      totalUnitsNeedingCulminatingTasks += needsCulminatingTasks;
      totalUnitsNeedingBigIdeasEnhancement += needsBigIdeasEnhancement;
    });

    console.log('=== OVERALL SUMMARY ===');
    console.log(`Total units: ${units.length}`);
    console.log(`Units needing essential questions: ${totalUnitsNeedingEssentialQuestions}`);
    console.log(`Units needing culminating tasks: ${totalUnitsNeedingCulminatingTasks}`);
    console.log(`Units needing big ideas enhancement: ${totalUnitsNeedingBigIdeasEnhancement}`);

    // Show examples of current content
    console.log('\n=== EXAMPLES OF CURRENT CONTENT ===');
    
    const unitWithContent = units.find(u => 
      u.essentialQuestions && 
      Array.isArray(u.essentialQuestions) && 
      u.essentialQuestions.length > 0 &&
      u.culminatingTask &&
      u.bigIdeas
    );

    if (unitWithContent) {
      console.log(`Example unit: ${unitWithContent.title}`);
      if (unitWithContent.essentialQuestions) {
        console.log(`Essential Questions: ${JSON.stringify(unitWithContent.essentialQuestions, null, 2)}`);
      }
      if (unitWithContent.culminatingTask) {
        console.log(`Culminating Task: ${unitWithContent.culminatingTask}`);
      }
      if (unitWithContent.bigIdeas) {
        console.log(`Big Ideas: ${unitWithContent.bigIdeas.substring(0, 200)}...`);
      }
    }

  } catch (error) {
    console.error('Error checking unit enhancements:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnitEnhancements();