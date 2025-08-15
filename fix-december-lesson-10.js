#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson10VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 10 - Holiday Music and Songs');
  console.log('Reducing vocabulary from 5 words to 3 words for perfection');
  console.log('=======================================================');

  const lessonId = 'cmecydagh0009vj47j2ijzjgq';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Minds On - remove "les chansons", keep "la musique" 
        mindsOn: '**Minds On (7 minutes)**: Play soft French holiday music as students enter. Display simple instruments (real or pictures) and introduce "la musique." Students move gently to the music and practice saying "J\'aime la musique!" while exploring rhythm with simple instruments.',
        mindsOnFr: '**Minds On (7 minutes)**: Play soft French holiday music as students enter. Display simple instruments (real or pictures) and introduce "la musique." Students move gently to the music and practice saying "J\'aime la musique!" while exploring rhythm with simple instruments.',
        
        // Action - remove "les instruments", keep "chanter" and "danser"
        action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce music vocabulary: "chanter" and "danser," using actions and real examples. Students practice each action while saying the French word and enjoying "la musique." **Guided Practice (12 min)**: Learn a simple French holiday song with actions (like "Petit Papa Noël" simplified for Grade 1). Students follow along with gestures and simple French words. **Independent Practice (8 min)**: Students choose a simple instrument and practice keeping rhythm while singing. They take turns being the "chef d\'orchestre" (conductor) and leading the group.',
        actionFr: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce music vocabulary: "chanter" and "danser," using actions and real examples. Students practice each action while saying the French word and enjoying "la musique." **Guided Practice (12 min)**: Learn a simple French holiday song with actions (like "Petit Papa Noël" simplified for Grade 1). Students follow along with gestures and simple French words. **Independent Practice (8 min)**: Students choose a simple instrument and practice keeping rhythm while singing. They take turns being the "chef d\'orchestre" (conductor) and leading the group.',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "French holiday music (age-appropriate)",
          "Simple instruments: bells, shakers, rhythm sticks",
          "Vocabulary cards: la musique, chanter, danser",
          "Props for conducting (wand or stick)",
          "Simple French holiday song sheet"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 10 - Holiday Music and Songs');
    console.log('📝 Vocabulary reduced from 5 to 3 words:');
    console.log('   • la musique (music - core concept)');
    console.log('   • chanter (to sing - concrete action)');
    console.log('   • danser (to dance - movement-based action)');
    console.log('');
    console.log('❌ Removed overload words:');
    console.log('   • les chansons (songs - redundant with "la musique")');
    console.log('   • les instruments (instruments - too complex for Grade 1)');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    console.log('💡 Pedagogical focus: Music + concrete actions (sing/dance)');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson10VocabularyOverload().catch(console.error);