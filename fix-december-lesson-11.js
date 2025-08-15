#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson11VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 11 - Preparing for Celebrations');
  console.log('Reducing vocabulary from 6 words to 3 words for perfection');
  console.log('=======================================================');

  const lessonId = 'cmed3wlhe0001vjs9ei4ozglg';

  try {
    // Update the lesson with reduced vocabulary
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Fix Minds On - remove "se préparer" and "les célébrations"
        mindsOn: '**Minds On (8 minutes)**: Display a party planning checklist with pictures and introduce "préparer." Students share what their families do to prepare for holidays. Practice saying "Nous préparons" while acting out preparation activities like decorating and cooking.',
        mindsOnFr: '**Minds On (8 minutes)**: Display a party planning checklist with pictures and introduce "préparer." Students share what their families do to prepare for holidays. Practice saying "Nous préparons" while acting out preparation activities like decorating and cooking.',
        
        // Fix Action - reduce vocabulary list from 4 to 3 words
        action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce preparation vocabulary: "préparer," "organiser," "inviter" using action cards and role-play. Students practice each action while saying the French word. **Guided Practice (12 min)**: Read a story about a family preparing for a holiday celebration, identifying all the preparation activities. Students help "plan" a class celebration by choosing activities from picture cards. **Independent Practice (8 min)**: Students create their own celebration preparation list using pictures and simple French words from today\'s lesson.',
        actionFr: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce preparation vocabulary: "préparer," "organiser," "inviter" using action cards and role-play. Students practice each action while saying the French word. **Guided Practice (12 min)**: Read a story about a family preparing for a holiday celebration, identifying all the preparation activities. Students help "plan" a class celebration by choosing activities from picture cards. **Independent Practice (8 min)**: Students create their own celebration preparation list using pictures and simple French words from today\'s lesson.',
        
        // Fix Materials - update vocabulary cards list
        materials: [
          "Party planning checklist with pictures",
          "Vocabulary cards: préparer, organiser, inviter",
          "Story about celebration preparation", 
          "Picture cards of preparation activities",
          "Drawing paper",
          "Crayons", 
          "Chart paper for class plan"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 11 - Preparing for Celebrations');
    console.log('📝 Vocabulary reduced from 6 to 3 words:');
    console.log('   • préparer (prepare)');
    console.log('   • organiser (organize)');
    console.log('   • inviter (invite)');
    console.log('');
    console.log('❌ Removed overload words:');
    console.log('   • se préparer (reflexive - too complex)');
    console.log('   • les célébrations (abstract - too complex)');
    console.log('   • planifier (abstract - too complex)');
    console.log('');
    console.log('🎯 Expected score change: 85% → 100%');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson11VocabularyOverload().catch(console.error);