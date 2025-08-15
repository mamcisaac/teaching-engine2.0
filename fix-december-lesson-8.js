#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson8VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 8 - Holiday Foods');
  console.log('Reducing vocabulary from 5 words to 3 words for perfection');
  console.log('====================================================');

  const lessonId = 'cmecydagf0005vj4777dbwwma';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Action section - reduce from 3 specific foods to 1 specific food
        action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce holiday food vocabulary using pictures or play food: "les biscuits" and practice "les aliments" and "délicieux." Students practice ordering: "Je voudrais..." in the restaurant setup. **Guided Practice (12 min)**: Read a story about a French Canadian family preparing holiday treats. Students identify foods they recognize and practice saying "J\'aime" or "Je n\'aime pas." **Independent Practice (8 min)**: Students draw their favorite holiday food and practice presenting it: "Mon aliment préféré est..." Using vocabulary from previous lessons and new food words.',
        
        actionFr: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce holiday food vocabulary using pictures or play food: "les biscuits" and practice "les aliments" and "délicieux." Students practice ordering: "Je voudrais..." in the restaurant setup. **Guided Practice (12 min)**: Read a story about a French Canadian family preparing holiday treats. Students identify foods they recognize and practice saying "J\'aime" or "Je n\'aime pas." **Independent Practice (8 min)**: Students draw their favorite holiday food and practice presenting it: "Mon aliment préféré est..." Using vocabulary from previous lessons and new food words.',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "Play food or food pictures",
          "Restaurant setup materials",
          "Vocabulary cards: les aliments, délicieux, les biscuits",
          "Simple story about holiday cooking",
          "Drawing paper",
          "Crayons",
          "Chart paper for class menu"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 8 - Holiday Foods');
    console.log('📝 Vocabulary reduced from 5 to 3 words:');
    console.log('   • les aliments (foods - core topic)');
    console.log('   • délicieux (delicious - essential adjective)');
    console.log('   • les biscuits (cookies - concrete & age-appropriate)');
    console.log('');
    console.log('❌ Removed overload words:');
    console.log('   • le gâteau (cake - can be taught later)');
    console.log('   • le chocolat chaud (hot chocolate - too complex phrase)');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson8VocabularyOverload().catch(console.error);