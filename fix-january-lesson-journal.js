#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixJournalWritingLesson() {
  console.log('🔧 MANUAL FIX: French Journal Writing (40% → 100%)');
  console.log('Complete lesson reconstruction for perfection standards');
  console.log('===================================================');

  const lessonId = 'cmecu2o7t000nvjjiqqe9y64h';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Fix duration from 60 to 45 minutes
        duration: 45,
        
        // Complete ETFO structure overhaul with proper timing
        mindsOn: '**Minds On (7 minutes)**: Show examples of simple journal entries with drawings and French words. Introduce "journal," "dessiner," "raconter" while students share what they might want to write about today. Practice saying "Dans mon journal..." together.',
        mindsOnFr: '**Réveil (7 minutes)**: Montrer des exemples d\'entrées de journal simples avec des dessins et des mots français. Introduire "journal," "dessiner," "raconter" pendant que les élèves partagent ce qu\'ils pourraient vouloir écrire aujourd\'hui. Pratiquer ensemble en disant "Dans mon journal..."',
        
        action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce journal writing vocabulary: "journal," "dessiner," "raconter" using real journal examples and modeling how to combine pictures with French words. Students practice saying "J\'aime..." and "Je vois..." for journal ideas. **Guided Practice (12 min)**: Create a class journal entry together on chart paper, with students contributing ideas for drawings and simple French words or phrases. Model thinking aloud about what to draw first, then what French words to add. **Independent Practice (8 min)**: Students create their own journal entry, drawing first and then adding French words they know (colors, numbers, family words from previous lessons).',
        actionFr: '**Action (28 minutes)**: **Introduction (8 min)**: Introduire le vocabulaire d\'écriture de journal: "journal," "dessiner," "raconter" en utilisant de vrais exemples de journaux et en modélisant comment combiner des images avec des mots français. Les élèves pratiquent en disant "J\'aime..." et "Je vois..." pour les idées de journal. **Pratique guidée (12 min)**: Créer ensemble une entrée de journal de classe sur papier graphique, avec les élèves contribuant des idées pour les dessins et des mots ou phrases français simples. Modéliser la réflexion à haute voix sur quoi dessiner d\'abord, puis quels mots français ajouter. **Pratique indépendante (8 min)**: Les élèves créent leur propre entrée de journal, dessinant d\'abord puis ajoutant des mots français qu\'ils connaissent (couleurs, nombres, mots de famille des leçons précédentes).',
        
        consolidation: '**Consolidation (10 minutes)**: Students share their journal entries in small groups, practicing "Dans mon journal, il y a..." Create a class sharing circle where volunteers can share one part of their entry. Close by discussing how journals help us remember special moments in French.',
        consolidationFr: '**Consolidation (10 minutes)**: Les élèves partagent leurs entrées de journal en petits groupes, pratiquant "Dans mon journal, il y a..." Créer un cercle de partage de classe où les volontaires peuvent partager une partie de leur entrée. Terminer en discutant de la façon dont les journaux nous aident à nous souvenir de moments spéciaux en français.',
        
        // Complete materials overhaul
        materials: [
          "Sample journal entries with pictures and French words",
          "Vocabulary cards: journal, dessiner, raconter",
          "Individual journals or writing booklets",
          "Chart paper for class journal modeling",
          "Word banks with familiar French vocabulary",
          "Drawing materials and colored pencils"
        ],
        
        // Observable assessment with checkbox rubrics
        assessmentNotes: 'OBSERVABLE JOURNAL WRITING ASSESSMENT - Circle proficiency level for each:\n1. Combines drawings with French words meaningfully: ☐ Only drawings ☐ Few French words ☐ Some French words ☐ Rich combination of both\n2. Uses familiar French vocabulary accurately: ☐ Uses English only ☐ Some French attempts ☐ Uses French with support ☐ Uses French independently\n3. Shares journal writing confidently: ☐ Reluctant to share ☐ Shares with encouragement ☐ Willing to share ☐ Enthusiastic presenter\n4. Demonstrates personal expression in French: ☐ Copies examples only ☐ Some personal ideas ☐ Clear personal voice ☐ Creative, authentic expression',
        
        // Proper differentiation strategies in JSON format
        modifications: {
          "forStruggling": "Provide journal templates with picture prompts. Allow mostly drawing with 1-2 French words. Use word banks with pictures. Pair with confident French speaker for sharing.",
          "forIEP": "Use journal apps with voice recording. Provide alternative communication methods. Allow extra time for creation. Use visual schedules for journal writing steps.",
          "forELL": "Encourage bilingual journaling initially. Connect to home experiences and family. Provide picture dictionaries. Use familiar topics from home culture.",
          "forAdvanced": "Challenge to write longer French phrases or simple sentences. Encourage detailed drawings with extended vocabulary. Help peers with journal ideas. Create class journal books."
        },
        
        // Authentic Indigenous perspectives
        indigenousPerspectives: 'Connect to Mi\'kmaq oral tradition of sharing daily experiences and stories with community members. Discuss how both traditional storytelling and modern journal writing serve the important purpose of preserving memories and sharing experiences, emphasizing that recording our thoughts and experiences helps keep our stories alive for others.',
        
        // Updated learning goals
        learningGoals: 'Students will express personal experiences through French journal writing, combining drawings with familiar French vocabulary while developing confidence in authentic French communication and self-expression.',
        learningGoalsFr: 'Les élèves exprimeront des expériences personnelles à travers l\'écriture de journal français, combinant des dessins avec un vocabulaire français familier tout en développant la confiance dans la communication française authentique et l\'expression de soi.',
        
        // Sub-friendly notes
        subNotes: 'All journal examples, word banks, and materials provided. Encourage effort over perfection. Focus on personal expression. Model combining pictures with words. Emphasize sharing and celebration of writing.'
      }
    });

    console.log('✅ FIXED: French Journal Writing');
    console.log('📝 IMPROVEMENTS MADE:');
    console.log('   • Duration: 60 → 45 minutes');
    console.log('   • ETFO Structure: Added proper 7+28+10 timing');
    console.log('   • Assessment: Added observable checkbox rubrics');
    console.log('   • Differentiation: Added specific strategies for all learners');
    console.log('   • Indigenous: Added authentic Mi\'kmaq storytelling connections');
    console.log('   • Vocabulary: Limited to 3 words (journal, dessiner, raconter)');
    console.log('   • Materials: Comprehensive personal expression supports');
    console.log('   • Focus: Personal expression through drawings + French words');
    console.log('');
    console.log('🎯 Expected score change: 40% → 100%');
    console.log('📚 Progress: 3 of 10 lessons fixed (worst 3 complete)');
    console.log('🔄 Next: Address differentiation issues in remaining 7 lessons');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixJournalWritingLesson().catch(console.error);