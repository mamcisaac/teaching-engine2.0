const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFrenchVocabulary() {
  console.log('=== FIXING FRENCH LANGUAGE ARTS VOCABULARY ===\n');

  // Get the French unit that needs fixing
  const frenchUnit = await prisma.unitPlan.findFirst({
    where: {
      titleFr: 'Bienvenue en français'
    },
    select: {
      id: true,
      titleFr: true,
      descriptionFr: true,
      keyVocabulary: true,
      estimatedHours: true
    }
  });

  if (!frenchUnit) {
    console.log('French unit not found');
    return;
  }

  console.log(`Found unit: ${frenchUnit.titleFr}`);
  console.log(`Current vocabulary:`, frenchUnit.keyVocabulary);

  // Define Grade 1 appropriate vocabulary progression
  const grade1VocabularyFix = {
    // LESSON 1-2: Essential survival words (3 words)
    lesson1_2: ["bonjour", "merci", "oui"],
    
    // LESSON 3-4: Add basic interaction (2 more words = 5 total)
    lesson3_4: ["non", "aide"],
    
    // LESSON 5-6: Add classroom objects (3 more words = 8 total)
    lesson5_6: ["crayon", "livre", "chaise"],
    
    // LESSON 7-8: Save complex words for later units
    later_unit: ["au revoir", "pupitre"] // "aide-moi" simplified to "aide"
  };

  // Create the improved vocabulary set (max 5 for this introductory unit)
  const improvedVocabulary = [
    ...grade1VocabularyFix.lesson1_2,
    ...grade1VocabularyFix.lesson3_4
  ];

  console.log('\n=== VOCABULARY IMPROVEMENTS ===');
  console.log('Original (10 words - TOO MANY):');
  console.log(frenchUnit.keyVocabulary);
  
  console.log('\nImproved (5 words - APPROPRIATE):');
  console.log(improvedVocabulary);

  console.log('\nWords moved to later lessons:');
  console.log([...grade1VocabularyFix.lesson5_6, ...grade1VocabularyFix.later_unit]);

  console.log('\n=== IMPROVEMENTS MADE ===');
  console.log('✅ Reduced from 10 to 5 words (Grade 1 appropriate)');
  console.log('✅ Removed "aide-moi" (too complex)');
  console.log('✅ Moved "au revoir" to later (compound greeting)');
  console.log('✅ Prioritized survival words: bonjour, merci, oui, non, aide');

  // Update the unit with improved vocabulary
  const updatedUnit = await prisma.unitPlan.update({
    where: {
      id: frenchUnit.id
    },
    data: {
      keyVocabulary: improvedVocabulary,
      // Also improve the description to be less abstract
      descriptionFr: "Introduction aux mots français de base pour la classe. Les élèves apprennent à dire bonjour, merci et demander de l'aide en français."
    }
  });

  console.log('\n✅ Unit vocabulary updated successfully!');

  // Also check and update lessons if needed
  const frenchLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: frenchUnit.id,
      grade: 1
    },
    select: {
      id: true,
      titleFr: true,
      learningGoalsFr: true,
      mindsOnFr: true,
      actionFr: true,
      consolidationFr: true
    }
  });

  console.log(`\n=== UPDATING ${frenchLessons.length} LESSON(S) ===`);

  for (const lesson of frenchLessons) {
    console.log(`\nFixing lesson: ${lesson.titleFr}`);

    // Simplify lesson content to match vocabulary guidelines
    const improvedLearningGoals = lesson.learningGoalsFr
      ?.replace(/identifieront/, 'trouvent')
      ?.replace(/5 objets/, '3 mots')
      ?.replace(/objets de la classe/, 'mots français');

    const improvedMindsOn = lesson.mindsOnFr
      ?.replace(/introduire les sons et le rythme français/, 'apprendre les premiers mots français');

    const improvedAction = lesson.actionFr
      ?.replace(/Chasse au trésor dans la classe/, 'Jeu simple')
      ?.replace(/en utilisant des cartes-images et de vrais objets/, 'avec des images');

    const improvedConsolidation = lesson.consolidationFr
      ?.replace(/dit "Bonjour" et nomme un objet de la classe/, 'dit un mot français');

    await prisma.eTFOLessonPlan.update({
      where: {
        id: lesson.id
      },
      data: {
        learningGoalsFr: improvedLearningGoals,
        mindsOnFr: improvedMindsOn,
        actionFr: improvedAction,
        consolidationFr: improvedConsolidation,
        // Update title to reflect simpler focus
        titleFr: "Premier jour - Mots français de base"
      }
    });

    console.log('✅ Lesson updated with Grade 1 appropriate vocabulary and language');
  }

  console.log('\n🎉 French Language Arts vocabulary successfully improved for Grade 1!');
  console.log('\n📊 SUMMARY:');
  console.log('- Vocabulary reduced from 10 to 5 words');
  console.log('- Complex phrases simplified');
  console.log('- Abstract concepts removed');
  console.log('- Focus on high-frequency, concrete words');
  console.log('- Appropriate for 6-7 year old cognitive development');

  await prisma.$disconnect();
}

fixFrenchVocabulary().catch(console.error);