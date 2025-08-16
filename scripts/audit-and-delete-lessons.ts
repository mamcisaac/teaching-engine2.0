import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditAndDeleteLessons() {
  try {
    // Find Emily (user ID 23 based on previous work)
    const emily = await prisma.user.findFirst({
      where: { 
        email: 'emmcisaac@gmail.com'
      }
    });

    if (!emily) {
      console.error('Emily not found!');
      return;
    }

    console.log(`Found Emily with ID: ${emily.id}`);

    // Get all lesson plans
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      include: {
        unitPlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    console.log(`\n📊 CURRENT STATE:`);
    console.log(`Total lessons found: ${allLessons.length}`);

    // Analyze lesson quality issues
    const issues = {
      wrongDuration: 0,
      missingETFOStructure: 0,
      noDifferentiation: 0,
      noAssessment: 0,
      noIndigenous: 0,
      tooMuchVocab: 0,
      noMaterials: 0
    };

    const lessonsToDelete = [];

    for (const lesson of allLessons) {
      let deleteReasons = [];

      // Check duration (should be 45 min, not 60)
      if (lesson.duration !== 45) {
        issues.wrongDuration++;
        deleteReasons.push('wrong duration');
      }

      // Check ETFO structure
      if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
        issues.missingETFOStructure++;
        deleteReasons.push('missing ETFO structure');
      }

      // Check differentiation
      if (!lesson.differentiationStrategies || 
          typeof lesson.differentiationStrategies !== 'object') {
        issues.noDifferentiation++;
        deleteReasons.push('no differentiation JSON');
      }

      // Check assessment
      if (!lesson.assessmentStrategies || 
          !lesson.assessmentStrategies.includes('☐')) {
        issues.noAssessment++;
        deleteReasons.push('no observable checkboxes');
      }

      // Check Indigenous perspectives
      if (!lesson.indigenousPerspectives || 
          lesson.indigenousPerspectives.length < 100) {
        issues.noIndigenous++;
        deleteReasons.push('insufficient Indigenous content');
      }

      // Check vocabulary (Grade 1 should have 2-3 terms max)
      if (lesson.vocabularyFr && 
          typeof lesson.vocabularyFr === 'object' &&
          Object.keys(lesson.vocabularyFr as any).length > 3) {
        issues.tooMuchVocab++;
        deleteReasons.push('vocabulary overload');
      }

      // Check materials
      if (!lesson.materials || lesson.materials.length < 10) {
        issues.noMaterials++;
        deleteReasons.push('insufficient materials');
      }

      // If lesson has 3+ major issues, mark for deletion
      if (deleteReasons.length >= 3) {
        lessonsToDelete.push({
          id: lesson.id,
          title: lesson.title,
          unit: lesson.unitPlan?.title,
          reasons: deleteReasons
        });
      }
    }

    console.log(`\n❌ QUALITY ISSUES FOUND:`);
    console.log(`Wrong duration (not 45 min): ${issues.wrongDuration}`);
    console.log(`Missing ETFO structure: ${issues.missingETFOStructure}`);
    console.log(`No differentiation JSON: ${issues.noDifferentiation}`);
    console.log(`No assessment checkboxes: ${issues.noAssessment}`);
    console.log(`Insufficient Indigenous content: ${issues.noIndigenous}`);
    console.log(`Too much vocabulary: ${issues.tooMuchVocab}`);
    console.log(`Insufficient materials: ${issues.noMaterials}`);

    console.log(`\n🗑️ LESSONS TO DELETE: ${lessonsToDelete.length} of ${allLessons.length}`);

    if (lessonsToDelete.length > 0) {
      console.log('\n⚠️ PREPARING TO DELETE NON-COMPLIANT LESSONS...');
      console.log('First 10 lessons to be deleted:');
      lessonsToDelete.slice(0, 10).forEach(lesson => {
        console.log(`- ${lesson.title} (${lesson.unit}): ${lesson.reasons.join(', ')}`);
      });

      // Confirm deletion
      console.log(`\n🔥 DELETING ${lessonsToDelete.length} NON-COMPLIANT LESSONS...`);
      
      for (const lesson of lessonsToDelete) {
        // Delete expectation mappings first
        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlanId: lesson.id }
        });
        
        // Delete the lesson
        await prisma.eTFOLessonPlan.delete({
          where: { id: lesson.id }
        });
      }

      console.log(`✅ Deleted ${lessonsToDelete.length} non-compliant lessons`);

      // Check remaining lessons
      const remainingLessons = await prisma.eTFOLessonPlan.count({
        where: { userId: emily.id }
      });
      console.log(`\n📊 FINAL STATE: ${remainingLessons} lessons remaining`);
    } else {
      console.log('\n✅ No lessons need deletion (unlikely given audit results)');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditAndDeleteLessons();