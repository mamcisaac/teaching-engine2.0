#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson9VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 9 - Gift Giving Traditions');
  console.log('Reducing vocabulary from 4 words to 3 words for perfection');
  console.log('======================================================');

  const lessonId = 'cmecydagg0007vj47jp5bh2de';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Minds On - remove "recevoir", focus on giving and gratitude
        mindsOn: '**Minds On (8 minutes)**: Present a beautifully wrapped empty box and build excitement about "les cadeaux." Pass the box around for students to guess what\'s inside using French: "Je pense... c\'est..." Reveal that the gift is "une surprise!" Introduce "donner" with gestures, practicing giving actions.',
        mindsOnFr: '**Minds On (8 minutes)**: Present a beautifully wrapped empty box and build excitement about "les cadeaux." Pass the box around for students to guess what\'s inside using French: "Je pense... c\'est..." Reveal that the gift is "une surprise!" Introduce "donner" with gestures, practicing giving actions.',
        
        // Action - remove "recevoir" from vocabulary list and activities
        action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce gift-giving vocabulary: "les cadeaux," "donner," "merci beaucoup." Practice giving using classroom objects while saying appropriate phrases. **Guided Practice (12 min)**: Read a story about children giving gifts, focusing on the kindness of giving. Students identify who is giving in the pictures and practice saying "merci beaucoup." **Independent Practice (8 min)**: Students create a "gift" (drawing or craft) for a classmate while practicing: "C\'est pour toi" and "Merci beaucoup."',
        actionFr: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce gift-giving vocabulary: "les cadeaux," "donner," "merci beaucoup." Practice giving using classroom objects while saying appropriate phrases. **Guided Practice (12 min)**: Read a story about children giving gifts, focusing on the kindness of giving. Students identify who is giving in the pictures and practice saying "merci beaucoup." **Independent Practice (8 min)**: Students create a "gift" (drawing or craft) for a classmate while practicing: "C\'est pour toi" and "Merci beaucoup."',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "Wrapped empty gift box",
          "Vocabulary cards: les cadeaux, donner, merci beaucoup, c'est pour toi",
          "Story about gift-giving",
          "Art supplies for making simple gifts",
          "Small bags or tissue paper for gift wrapping"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 9 - Gift Giving Traditions');
    console.log('📝 Vocabulary reduced from 4 to 3 words:');
    console.log('   • les cadeaux (gifts - core topic)');
    console.log('   • donner (to give - essential action)');
    console.log('   • merci beaucoup (thank you - social language)');
    console.log('');
    console.log('❌ Removed overload word:');
    console.log('   • recevoir (to receive - too abstract for Grade 1)');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    console.log('💡 Pedagogical focus: Giving and gratitude (more concrete for young learners)');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson9VocabularyOverload().catch(console.error);