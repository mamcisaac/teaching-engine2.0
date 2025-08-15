#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLesson7VocabularyOverload() {
  console.log('🔧 MANUAL FIX: Lesson 7 - Holiday Decorations');
  console.log('Reducing vocabulary from 5 words to 3 words for perfection');
  console.log('=====================================================');

  const lessonId = 'cmecydage0003vj47uwhtfrqt';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Action section - remove "les lumières" and "la couronne" from vocabulary introduction
        action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce decoration vocabulary using real items: "l\'étoile" and "les décorations." Students practice pronunciation while handling safe decorations and saying "joli/jolie" to describe them. **Guided Practice (12 min)**: Play "Trouve la décoration" - call out a decoration name and students find it in the room. Then read a simple book about decorating for holidays, pausing to identify decorations. **Independent Practice (8 min)**: Students create their own paper star decoration while practicing saying "mon étoile" and choosing colors using French color words from previous lessons.',
        
        actionFr: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce decoration vocabulary using real items: "l\'étoile" and "les décorations." Students practice pronunciation while handling safe decorations and saying "joli/jolie" to describe them. **Guided Practice (12 min)**: Play "Trouve la décoration" - call out a decoration name and students find it in the room. Then read a simple book about decorating for holidays, pausing to identify decorations. **Independent Practice (8 min)**: Students create their own paper star decoration while practicing saying "mon étoile" and choosing colors using French color words from previous lessons.',
        
        // Update materials to reflect reduced vocabulary
        materials: [
          "Real holiday decorations (safe for handling)",
          "Vocabulary cards: les décorations, joli/jolie, l'étoile", 
          "Simple book about holiday decorating",
          "Construction paper stars",
          "Crayons/markers",
          "Glue sticks", 
          "Classroom decoration display area"
        ]
      }
    });

    console.log('✅ FIXED: Lesson 7 - Holiday Decorations');
    console.log('📝 Vocabulary reduced from 5 to 3 words:');
    console.log('   • les décorations (decorations - core topic)');
    console.log('   • joli/jolie (pretty - essential adjective)');
    console.log('   • l\'étoile (star - main craft activity)');
    console.log('');
    console.log('❌ Removed overload words:');
    console.log('   • les lumières (lights - too advanced)');
    console.log('   • la couronne (crown - too advanced)');
    console.log('');
    console.log('🎯 Expected score change: 90% → 100%');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLesson7VocabularyOverload().catch(console.error);