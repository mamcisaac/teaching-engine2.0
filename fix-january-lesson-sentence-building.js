#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixSentenceBuildingLesson() {
  console.log('🔧 MANUAL FIX: French Sentence Building (30% → 100%)');
  console.log('Complete lesson overhaul for perfection standards');
  console.log('=================================================');

  const lessonId = 'cmecu2o7s000lvjjiep324umk';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Fix duration from 60 to 45 minutes
        duration: 45,
        
        // Complete ETFO structure overhaul with proper timing
        mindsOn: '**Minds On (7 minutes)**: Display simple French sentences with pictures (Je suis, J\'aime, Je veux) and have students identify words they recognize. Introduce "phrases" and "construire" while students practice saying familiar sentence patterns together.',
        mindsOnFr: '**Réveil (7 minutes)**: Afficher des phrases françaises simples avec des images (Je suis, J\'aime, Je veux) et demander aux élèves d\'identifier les mots qu\'ils reconnaissent. Introduire "phrases" et "construire" pendant que les élèves pratiquent ensemble des modèles de phrases familiers.',
        
        action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce sentence-building vocabulary: "phrases," "construire," "commencer" using word cards and sentence strips. Students practice putting words in order while saying each word aloud. **Guided Practice (12 min)**: Build sentences together using familiar vocabulary (colours, numbers, family words from previous lessons). Students help choose words and discuss sentence order: "Subject-Verb-Object." **Independent Practice (8 min)**: Students build 3 simple sentences using provided word cards, copying them into their writing books with illustrations.',
        actionFr: '**Action (28 minutes)**: **Introduction (8 min)**: Introduire le vocabulaire de construction de phrases: "phrases," "construire," "commencer" en utilisant des cartes de mots et des bandes de phrases. Les élèves pratiquent la mise en ordre des mots tout en disant chaque mot à haute voix. **Pratique guidée (12 min)**: Construire des phrases ensemble en utilisant un vocabulaire familier (couleurs, nombres, mots de famille des leçons précédentes). Les élèves aident à choisir des mots et discutent de l\'ordre des phrases: "Sujet-Verbe-Objet." **Pratique indépendante (8 min)**: Les élèves construisent 3 phrases simples en utilisant les cartes de mots fournies, les copiant dans leurs cahiers d\'écriture avec des illustrations.',
        
        consolidation: '**Consolidation (10 minutes)**: Students read their favorite sentence to a partner: "Ma phrase préférée est..." Create a class sentence collection by posting the best examples. Close by building one final sentence together and celebrating: "Nous construisons des phrases!"',
        consolidationFr: '**Consolidation (10 minutes)**: Les élèves lisent leur phrase préférée à un partenaire: "Ma phrase préférée est..." Créer une collection de phrases de classe en affichant les meilleurs exemples. Terminer en construisant une dernière phrase ensemble et en célébrant: "Nous construisons des phrases!"',
        
        // Complete materials overhaul
        materials: [
          "Picture cards with simple sentence examples",
          "Vocabulary cards: phrases, construire, commencer",
          "Word cards for sentence building (familiar vocabulary)",
          "Sentence strips and holders",
          "Individual writing books",
          "Chart paper for sentence collection"
        ],
        
        // Observable assessment with checkbox rubrics
        assessmentNotes: 'OBSERVABLE SENTENCE BUILDING ASSESSMENT - Circle proficiency level for each:\n1. Identifies French words in sentences: ☐ Few words recognized ☐ Some words recognized ☐ Most words recognized ☐ All words recognized confidently\n2. Builds grammatically correct sentences: ☐ Random word order ☐ Some correct order ☐ Usually correct order ☐ Consistently correct structure\n3. Uses sentence vocabulary appropriately: ☐ Uses English only ☐ Some French attempts ☐ Uses French with support ☐ Uses French independently\n4. Transfers sentences to writing: ☐ Cannot copy ☐ Copies with errors ☐ Copies accurately ☐ Writes from memory',
        
        // Proper differentiation strategies in JSON format
        modifications: {
          "forStruggling": "Provide sentence templates with blanks to fill. Use picture supports for every word. Start with 2-word sentences only. Pair with confident French speaker for support.",
          "forIEP": "Use sentence-building apps or magnetic word tiles. Provide visual sentence structure guides. Allow extra time for construction. Use color-coding for word types (red=action, blue=object).",
          "forELL": "Connect sentence patterns to home language structure. Use cognates when available. Provide picture dictionaries for word meanings. Encourage bilingual sentence building first.",
          "forAdvanced": "Challenge to build longer, more complex sentences. Teach about adding describing words (adjectives). Create sentence-building games for classmates. Help peers with sentence construction."
        },
        
        // Authentic Indigenous perspectives
        indigenousPerspectives: 'Connect to Mi\'kmaq oral tradition where complete thoughts and ideas were shared through structured speech patterns. Discuss how both Mi\'kmaq and French languages have their own beautiful ways of organizing words to express complete ideas, emphasizing that building sentences in any language follows patterns that help us communicate clearly with others.',
        
        // Updated learning goals
        learningGoals: 'Students will construct simple French sentences using familiar vocabulary, demonstrating understanding of basic sentence structure and word order in French while building confidence in written French expression.',
        learningGoalsFr: 'Les élèves construiront des phrases françaises simples en utilisant un vocabulaire familier, démontrant une compréhension de la structure de phrase de base et de l\'ordre des mots en français tout en développant la confiance dans l\'expression française écrite.',
        
        // Sub-friendly notes
        subNotes: 'All word cards, sentence strips, and visual supports provided. Lesson builds on familiar vocabulary from previous lessons. Clear structure with hands-on sentence building activities.'
      }
    });

    console.log('✅ FIXED: French Sentence Building Lesson');
    console.log('📝 IMPROVEMENTS MADE:');
    console.log('   • Duration: 60 → 45 minutes');
    console.log('   • ETFO Structure: Added proper 7+28+10 timing');
    console.log('   • Assessment: Added observable checkbox rubrics');
    console.log('   • Differentiation: Added specific strategies for all learners');
    console.log('   • Indigenous: Added authentic Mi\'kmaq language connections');
    console.log('   • Vocabulary: Limited to 3 words (phrases, construire, commencer)');
    console.log('   • Materials: Comprehensive list with visual supports');
    console.log('');
    console.log('🎯 Expected score change: 30% → 100%');
    console.log('📚 Next: Fix remaining 9 lessons to achieve unit perfection');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSentenceBuildingLesson().catch(console.error);