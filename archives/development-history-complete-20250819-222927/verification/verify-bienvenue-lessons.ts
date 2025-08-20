import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBienvenueETFOStructure() {
  try {
    // Get the unit plan ID
    const unit = await prisma.unitPlan.findFirst({
      where: {
        userId: 23,
        title: "Bienvenue à l'école!"
      }
    });

    if (!unit) {
      console.log('Unit not found');
      return;
    }

    // Get all lessons for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unit.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`\n=== BIENVENUE À L'ÉCOLE ETFO LESSON STRUCTURE VERIFICATION ===`);
    console.log(`Total lessons: ${lessons.length}`);
    console.log(`Unit: ${unit.title} (${unit.startDate.toISOString().split('T')[0]} - ${unit.endDate.toISOString().split('T')[0]})`);

    const issues = [];
    
    lessons.forEach((lesson, index) => {
      console.log(`\n--- LESSON ${index + 1}: ${lesson.title} ---`);
      console.log(`Date: ${lesson.date.toISOString().split('T')[0]}`);
      console.log(`Duration: ${lesson.duration} minutes`);
      
      // Check ETFO structure
      const hasMindsOn = lesson.mindsOn && lesson.mindsOn.trim().length > 0;
      const hasAction = lesson.action && lesson.action.trim().length > 0;
      const hasConsolidation = lesson.consolidation && lesson.consolidation.trim().length > 0;
      
      console.log(`✓ Minds On: ${hasMindsOn ? 'PRESENT' : 'MISSING'}`);
      if (hasMindsOn) {
        const mindsOnLength = lesson.mindsOn!.length;
        console.log(`  Content preview: ${lesson.mindsOn!.substring(0, 100)}...`);
        console.log(`  Length: ${mindsOnLength} characters`);
      }
      
      console.log(`✓ Action: ${hasAction ? 'PRESENT' : 'MISSING'}`);
      if (hasAction) {
        const actionLength = lesson.action!.length;
        console.log(`  Content preview: ${lesson.action!.substring(0, 100)}...`);
        console.log(`  Length: ${actionLength} characters`);
      }
      
      console.log(`✓ Consolidation: ${hasConsolidation ? 'PRESENT' : 'MISSING'}`);
      if (hasConsolidation) {
        const consolidationLength = lesson.consolidation!.length;
        console.log(`  Content preview: ${lesson.consolidation!.substring(0, 100)}...`);
        console.log(`  Length: ${consolidationLength} characters`);
      }

      // Check for Grade 1 appropriate timing
      if (lesson.duration !== 45) {
        issues.push(`Lesson ${index + 1}: Duration is ${lesson.duration} min (should be 45 min for Grade 1)`);
      }

      // Check for missing ETFO components
      if (!hasMindsOn) issues.push(`Lesson ${index + 1}: Missing Minds On section`);
      if (!hasAction) issues.push(`Lesson ${index + 1}: Missing Action section`);  
      if (!hasConsolidation) issues.push(`Lesson ${index + 1}: Missing Consolidation section`);

      // Check for learning goals
      const hasLearningGoals = lesson.learningGoals && lesson.learningGoals.trim().length > 0;
      console.log(`✓ Learning Goals: ${hasLearningGoals ? 'PRESENT' : 'MISSING'}`);
      if (!hasLearningGoals) issues.push(`Lesson ${index + 1}: Missing Learning Goals`);
    });

    console.log(`\n=== VERIFICATION SUMMARY ===`);
    if (issues.length === 0) {
      console.log('🎉 ALL LESSONS FOLLOW PERFECT ETFO STRUCTURE!');
    } else {
      console.log(`⚠️  ISSUES FOUND: ${issues.length}`);
      issues.forEach(issue => console.log(`- ${issue}`));
    }

    console.log(`\nLessons verified: ${lessons.length}/16 expected`);
    
  } catch (error) {
    console.error('Error verifying lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyBienvenueETFOStructure();