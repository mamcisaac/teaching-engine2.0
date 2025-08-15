#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson13VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 13 - Sharing and Community (FINAL LESSON)');
  console.log('Reducing vocabulary from 4 words to 3 words for perfection');
  console.log('============================================================');

  const lessonId = 'cmed3wlhi0005vjs9wyrjov2e';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Action - remove "ensemble" from vocabulary list
        action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce sharing vocabulary: "partager," "la communauté," "aider" using real classroom examples. Students practice sharing classroom materials while using French phrases. **Guided Practice (12 min)**: Read a story about a community working together during winter, identifying examples of sharing and helping. Students discuss how their classroom is a community: "Notre classe est une communauté." **Independent Practice (8 min)**: Students draw or write about one way they can share or help in their community, labeling with French vocabulary from today\'s lesson.',
        actionFr: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce sharing vocabulary: "partager," "la communauté," "aider" using real classroom examples. Students practice sharing classroom materials while using French phrases. **Guided Practice (12 min)**: Read a story about a community working together during winter, identifying examples of sharing and helping. Students discuss how their classroom is a community: "Notre classe est une communauté." **Independent Practice (8 min)**: Students draw or write about one way they can share or help in their community, labeling with French vocabulary from today\'s lesson.',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "Sharing stations with various classroom items",
          "Vocabulary cards: partager, la communauté, aider, je partage, je peux aider",
          "Story about community cooperation",
          "Drawing paper",
          "Crayons",
          "Chart paper for community helpers display"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 13 - Sharing and Community');
    console.log('📝 Vocabulary reduced from 4 to 3 words:');
    console.log('   • partager (to share - core action)');
    console.log('   • la communauté (community - key concept)');
    console.log('   • aider (to help - concrete action)');
    console.log('');
    console.log('❌ Removed overload word:');
    console.log('   • ensemble (together - too abstract for Grade 1)');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    console.log('💡 Pedagogical focus: Sharing actions and community helping');
    console.log('');
    console.log('🎊 ALL 7 VOCABULARY OVERLOAD LESSONS NOW FIXED!');
    console.log('📈 Expected December unit score: 94.6% → 100% (PERFECT)');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson13VocabularyOverload().catch(console.error);