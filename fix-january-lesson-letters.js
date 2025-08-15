#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function fixLetterPracticeLesson() {
  console.log('🔧 MANUAL FIX: French Writing Practice - Letters (40% → 100%)');
  console.log('Complete lesson reconstruction for perfection standards');
  console.log('====================================================');

  const lessonId = 'cmecu2o7r000jvjji3xus6psm';

  try {
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: {
        id: lessonId
      },
      data: {
        // Fix duration from 60 to 45 minutes
        duration: 45,
        
        // Complete ETFO structure overhaul with proper timing
        mindsOn: '**Minds On (8 minutes)**: Display large French letters around the room and have students go on a "letter hunt," finding and naming letters they recognize. Introduce "lettres," "écrire," "former" while students practice air-writing their favorite letters with proper formation.',
        mindsOnFr: '**Réveil (8 minutes)**: Afficher de grandes lettres françaises autour de la salle et demander aux élèves de faire une "chasse aux lettres," trouvant et nommant les lettres qu\'ils reconnaissent. Introduire "lettres," "écrire," "former" pendant que les élèves pratiquent l\'écriture dans l\'air de leurs lettres préférées avec une formation appropriée.',
        
        action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce letter practice vocabulary: "lettres," "écrire," "former" using large letter cards and demonstration of proper letter formation. Students practice tracing letters in sand trays while saying French letter names. **Guided Practice (12 min)**: Work through proper formation of 3-4 key letters together (focusing on letters in their names), emphasizing starting points, direction, and letter sounds in French. **Independent Practice (8 min)**: Students practice writing these letters in their writing books, focusing on one letter at a time with careful attention to formation.',
        actionFr: '**Action (27 minutes)**: **Introduction (7 min)**: Introduire le vocabulaire de pratique des lettres: "lettres," "écrire," "former" en utilisant de grandes cartes de lettres et la démonstration de la formation appropriée des lettres. Les élèves pratiquent le traçage des lettres dans des plateaux de sable tout en disant les noms des lettres en français. **Pratique guidée (12 min)**: Travailler ensemble sur la formation appropriée de 3-4 lettres clés (en se concentrant sur les lettres de leurs noms), en mettant l\'accent sur les points de départ, la direction et les sons des lettres en français. **Pratique indépendante (8 min)**: Les élèves pratiquent l\'écriture de ces lettres dans leurs cahiers d\'écriture, en se concentrant sur une lettre à la fois avec une attention particulière à la formation.',
        
        consolidation: '**Consolidation (10 minutes)**: Students choose their best-formed letter to share with a partner, saying "Ma meilleure lettre est..." Create a class "Letter Gallery" by posting everyone\'s best work. Close by writing one letter together in the air while chanting "Nous écrivons bien!"',
        consolidationFr: '**Consolidation (10 minutes)**: Les élèves choisissent leur lettre la mieux formée à partager avec un partenaire, en disant "Ma meilleure lettre est..." Créer une "Galerie de lettres" de classe en affichant le meilleur travail de chacun. Terminer en écrivant une lettre ensemble dans l\'air en scandant "Nous écrivons bien!"',
        
        // Complete materials overhaul
        materials: [
          "Large French letter cards for display",
          "Vocabulary cards: lettres, écrire, former",
          "Sand trays for sensory letter practice",
          "Letter formation guides with arrows",
          "Individual writing books with lined paper",
          "Gallery display area for student work"
        ],
        
        // Observable assessment with checkbox rubrics
        assessmentNotes: 'OBSERVABLE LETTER FORMATION ASSESSMENT - Circle proficiency level for each:\n1. Recognizes French letters by name: ☐ Few letters known ☐ Some letters known ☐ Most letters known ☐ All demonstrated letters known\n2. Forms letters with correct starting point: ☐ Random starting ☐ Sometimes correct ☐ Usually correct ☐ Always starts correctly\n3. Uses proper letter formation direction: ☐ Inconsistent direction ☐ Some correct strokes ☐ Most strokes correct ☐ Proper formation throughout\n4. Uses French letter vocabulary: ☐ Uses English only ☐ Some French attempts ☐ Uses French with support ☐ Uses French independently',
        
        // Proper differentiation strategies in JSON format
        modifications: {
          "forStruggling": "Provide letter tracing sheets with dotted lines. Use hand-over-hand support for formation. Focus on 2 letters only per session. Use larger writing tools and paper.",
          "forIEP": "Adapt writing tools (weighted pencils, grips). Use textured letter cards for tactile learning. Allow alternative recording (magnetic letters, apps). Provide movement breaks during writing.",
          "forELL": "Connect letter formation to home language writing if applicable. Use picture cues alongside letter names. Practice familiar letters from their name first. Encourage sharing about writing in home language.",
          "forAdvanced": "Challenge to write letters in cursive formation. Teach about letter families and stroke patterns. Help demonstrate letter formation to classmates. Practice writing simple words with mastered letters."
        },
        
        // Authentic Indigenous perspectives
        indigenousPerspectives: 'Connect to Mi\'kmaq traditional pictographs and how different cultures have developed their own ways of recording language and meaning through written symbols. Discuss how both traditional Mi\'kmaq symbols and French letters are important ways to preserve language and knowledge, emphasizing respect for all writing systems and the value of learning multiple ways to communicate.',
        
        // Updated learning goals
        learningGoals: 'Students will practice proper French letter formation using multi-sensory approaches, demonstrating correct starting points, stroke direction, and letter recognition while building confidence in French writing fundamentals.',
        learningGoalsFr: 'Les élèves pratiqueront la formation appropriée des lettres françaises en utilisant des approches multisensorielles, démontrant des points de départ corrects, la direction des traits et la reconnaissance des lettres tout en développant la confiance dans les fondamentaux de l\'écriture française.',
        
        // Sub-friendly notes
        subNotes: 'All letter cards, formation guides, and sensory materials provided. Clear demonstration needed for letter formation. Focus on 3-4 letters maximum. Emphasize effort over perfection.'
      }
    });

    console.log('✅ FIXED: French Writing Practice - Letters');
    console.log('📝 IMPROVEMENTS MADE:');
    console.log('   • Duration: 60 → 45 minutes');
    console.log('   • ETFO Structure: Added proper 8+27+10 timing');
    console.log('   • Assessment: Added observable checkbox rubrics');
    console.log('   • Differentiation: Added specific strategies for all learners');
    console.log('   • Indigenous: Added authentic Mi\'kmaq pictograph connections');
    console.log('   • Vocabulary: Limited to 3 words (lettres, écrire, former)');
    console.log('   • Materials: Comprehensive sensory learning supports');
    console.log('   • Focus: Clear letter formation emphasis with multi-sensory approach');
    console.log('');
    console.log('🎯 Expected score change: 40% → 100%');
    console.log('📚 Progress: 2 of 10 lessons fixed, 8 remaining');
    
  } catch (error) {
    console.error('❌ Error fixing lesson:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLetterPracticeLesson().catch(console.error);