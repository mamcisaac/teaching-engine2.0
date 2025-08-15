#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson12VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 12 - Winter Stories and Tales');
  console.log('Reducing vocabulary from 4 words to 3 words for perfection');
  console.log('========================================================');

  const lessonId = 'cmed3wlhh0003vjs91r9w4bsx';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Minds On - remove "les contes", keep "les histoires"
        mindsOn: '**Minds On (7 minutes)**: Create a cozy "story corner" with blankets and dim lighting. Introduce "les histoires" using a special story book. Students practice saying "Raconte-moi une histoire" (Tell me a story) while gathering in the story circle.',
        mindsOnFr: '**Minds On (7 minutes)**: Create a cozy "story corner" with blankets and dim lighting. Introduce "les histoires" using a special story book. Students practice saying "Raconte-moi une histoire" (Tell me a story) while gathering in the story circle.',
        
        // Action - remove "le conte" from vocabulary list
        action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce story vocabulary: "les histoires," "le personnage," "magique" using story props and picture cards. Students practice retelling simple story elements. **Guided Practice (12 min)**: Tell a simple French winter tale with visual supports, pausing for students to predict what happens next: "Qu\'est-ce qui arrive?" Students identify characters and magical elements. **Independent Practice (8 min)**: Students create their own winter story using picture prompts, focusing on one main character and one magical element from today\'s vocabulary.',
        actionFr: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce story vocabulary: "les histoires," "le personnage," "magique" using story props and picture cards. Students practice retelling simple story elements. **Guided Practice (12 min)**: Tell a simple French winter tale with visual supports, pausing for students to predict what happens next: "Qu\'est-ce qui arrive?" Students identify characters and magical elements. **Independent Practice (8 min)**: Students create their own winter story using picture prompts, focusing on one main character and one magical element from today\'s vocabulary.',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "Cozy story corner setup with blankets",
          "Special story book",
          "Vocabulary cards: les histoires, le personnage, magique, raconte-moi",
          "Simple French winter tale with visuals",
          "Story props (characters, magical items)",
          "Picture prompts for story creation",
          "Drawing paper"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 12 - Winter Stories and Tales');
    console.log('📝 Vocabulary reduced from 4 to 3 words:');
    console.log('   • les histoires (stories - core concept)');
    console.log('   • le personnage (character - concrete, visual)');
    console.log('   • magique (magical - story element)');
    console.log('');
    console.log('❌ Removed overload word:');
    console.log('   • les contes (tales - redundant with "les histoires")');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    console.log('💡 Pedagogical focus: Stories with characters and magic');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson12VocabularyOverload().catch(console.error);