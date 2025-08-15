#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathMarchLessonPlans() {
  console.log('📏 Creating Math Lesson Plans for March - Unit 6: "Explorer la mesure"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Measurement Exploration unit plan for March
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Explorer la mesure'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Explorer la mesure" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Mar 2-31, 2026 (19 lessons - Unit 6)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: mathUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 19 lesson plans for March
    const lessons = [];
    
    // Helper function to create dates in March 2026 (skip weekends and March break)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        2, 3, 4, 5, 6,      // Week 1: Mar 2-6
        9, 10, 11, 12, 13,  // Week 2: Mar 9-13 (March break week, but some schools vary)
        23, 24, 25, 26, 27, // Week 3: Mar 23-27 (back from March break)
        30, 31              // Week 4: Mar 30-31 (partial week)
      ];
      return new Date(`2026-03-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // Supplement with a few more dates if needed for 19 lessons
    const additionalDays = [16, 17]; // Adding a couple more March days
    
    // WEEK 1: March 2-6 - Introduction to Measurement
    lessons.push({
      title: 'What is Measurement?',
      titleFr: 'Qu\'est-ce que la mesure?',
      date: getSchoolDay(0),
      mindsOn: 'Look around - how can we describe the size of things?',
      mindsOnFr: 'Regarder autour - comment décrire la taille des choses?',
      action: 'Explore measuring with non-standard units around the classroom',
      actionFr: 'Explorer mesurer avec unités non-standard dans la classe',
      consolidation: 'Share discoveries about why we measure things',
      consolidationFr: 'Partager découvertes pourquoi nous mesurons choses',
      frenchConnection: 'Measurement words: "mesurer", "grand", "petit", "long", "court"'
    });
    
    lessons.push({
      title: 'Comparing Lengths',
      titleFr: 'Comparer les longueurs',
      date: getSchoolDay(1),
      mindsOn: 'Which is longer? Which is shorter? How can we tell?',
      mindsOnFr: 'Lequel est plus long? Plus court? Comment savoir?',
      action: 'Direct comparison of objects by placing side by side',
      actionFr: 'Comparaison directe objets en plaçant côte à côte',
      consolidation: 'Order objects from shortest to longest',
      consolidationFr: 'Ordonner objets du plus court au plus long',
      frenchConnection: 'Comparison vocabulary: "plus long", "plus court", "même longueur"'
    });
    
    lessons.push({
      title: 'Measuring with Paperclips',
      titleFr: 'Mesurer avec trombones',
      date: getSchoolDay(2),
      mindsOn: 'How many paperclips long is your desk?',
      mindsOnFr: 'Combien de trombones de long fait ton bureau?',
      action: 'Measure classroom objects using paperclips as units',
      actionFr: 'Mesurer objets classe utilisant trombones comme unités',
      consolidation: 'Record and compare measurement findings',
      consolidationFr: 'Enregistrer et comparer trouvailles mesures',
      frenchConnection: 'Unit language: "trombones de long", "unité", "mesure"'
    });
    
    lessons.push({
      title: 'Measuring with Cubes',
      titleFr: 'Mesurer avec cubes',
      date: getSchoolDay(3),
      mindsOn: 'Different units give different numbers for same object',
      mindsOnFr: 'Unités différentes donnent nombres différents même objet',
      action: 'Measure same objects with cubes and compare to paperclip measurements',
      actionFr: 'Mesurer mêmes objets avec cubes et comparer mesures trombones',
      consolidation: 'Discuss why different units give different measurements',
      consolidationFr: 'Discuter pourquoi unités différentes donnent mesures différentes',
      frenchConnection: 'Comparison phrases: "avec les cubes", "avec les trombones", "différent"'
    });
    
    lessons.push({
      title: 'Body Measurements',
      titleFr: 'Mesures du corps',
      date: getSchoolDay(4),
      mindsOn: 'Use hands, feet, and arms as measuring tools',
      mindsOnFr: 'Utiliser mains, pieds, et bras comme outils mesure',
      action: 'Measure objects using hand spans, foot lengths, arm lengths',
      actionFr: 'Mesurer objets utilisant empans main, longueurs pied, bras',
      consolidation: 'Compare body measurement results between students',
      consolidationFr: 'Comparer résultats mesures corps entre élèves',
      frenchConnection: 'Body parts: "main", "pied", "bras", "empan", "pas"'
    });
    
    // WEEK 2: March 9-13 - Height and Weight
    lessons.push({
      title: 'Measuring Height',
      titleFr: 'Mesurer la hauteur',
      date: getSchoolDay(5),
      mindsOn: 'How tall are you? How tall is the door?',
      mindsOnFr: 'Quelle est ta hauteur? Quelle hauteur fait la porte?',
      action: 'Measure heights of students and classroom objects',
      actionFr: 'Mesurer hauteurs élèves et objets classe',
      consolidation: 'Create height comparison chart for class',
      consolidationFr: 'Créer graphique comparaison hauteurs pour classe',
      frenchConnection: 'Height vocabulary: "hauteur", "grand", "haut", "mesurer debout"'
    });
    
    lessons.push({
      title: 'Heavy and Light',
      titleFr: 'Lourd et léger',
      date: getSchoolDay(6),
      mindsOn: 'Feel different objects - which is heavier?',
      mindsOnFr: 'Sentir objets différents - lequel est plus lourd?',
      action: 'Compare weights by holding objects, use balance scale',
      actionFr: 'Comparer poids en tenant objets, utiliser balance',
      consolidation: 'Sort objects into heavy, medium, and light groups',
      consolidationFr: 'Trier objets en groupes lourd, moyen, léger',
      frenchConnection: 'Weight words: "lourd", "léger", "poids", "peser", "balance"'
    });
    
    lessons.push({
      title: 'Balance Scale Investigations',
      titleFr: 'Investigations balance',
      date: getSchoolDay(7),
      mindsOn: 'What makes the scale tip? What keeps it balanced?',
      mindsOnFr: 'Qu\'est-ce qui fait pencher balance? Qu\'est-ce qui équilibre?',
      action: 'Experiment with balance scales using various objects',
      actionFr: 'Expérimenter avec balances utilisant objets divers',
      consolidation: 'Explain how balance scales help us compare weights',
      consolidationFr: 'Expliquer comment balances aident comparer poids',
      frenchConnection: 'Balance language: "équilibre", "pencher", "plus lourd", "égal"'
    });
    
    lessons.push({
      title: 'Measuring Weight with Units',
      titleFr: 'Mesurer poids avec unités',
      date: getSchoolDay(8),
      mindsOn: 'How many blocks does this book weigh?',
      mindsOnFr: 'Combien de blocs pèse ce livre?',
      action: 'Use standard objects (blocks, coins) to measure weights',
      actionFr: 'Utiliser objets standard (blocs, pièces) pour mesurer poids',
      consolidation: 'Record weight measurements and compare findings',
      consolidationFr: 'Enregistrer mesures poids et comparer trouvailles',
      frenchConnection: 'Weight units: "blocs de poids", "pièces", "unités de poids"'
    });
    
    lessons.push({
      title: 'Capacity Exploration',
      titleFr: 'Exploration capacité',
      date: getSchoolDay(9),
      mindsOn: 'Which container holds more water?',
      mindsOnFr: 'Quel contenant tient plus d\'eau?',
      action: 'Compare capacities of different containers using water/rice',
      actionFr: 'Comparer capacités contenants différents utilisant eau/riz',
      consolidation: 'Order containers from least to most capacity',
      consolidationFr: 'Ordonner contenants de moins à plus de capacité',
      frenchConnection: 'Capacity words: "capacité", "tient", "plein", "vide", "plus"'
    });
    
    // WEEK 3: March 23-27 - Time and Money Measurement
    lessons.push({
      title: 'Time of Day',
      titleFr: 'Moment de la journée',
      date: getSchoolDay(10),
      mindsOn: 'What time do we eat lunch? When do we go home?',
      mindsOnFr: 'À quelle heure mangeons-nous? Quand rentrons-nous?',
      action: 'Explore daily schedule times using classroom clocks',
      actionFr: 'Explorer horaires quotidiens utilisant horloges classe',
      consolidation: 'Create pictorial schedule showing times of day',
      consolidationFr: 'Créer horaire illustré montrant moments journée',
      frenchConnection: 'Time vocabulary: "heure", "temps", "matin", "après-midi", "soir"'
    });
    
    lessons.push({
      title: 'Hours on the Clock',
      titleFr: 'Heures sur l\'horloge',
      date: getSchoolDay(11),
      mindsOn: 'Practice reading hour times like 3 o\'clock, 7 o\'clock',
      mindsOnFr: 'Pratiquer lire heures comme 3 heures, 7 heures',
      action: 'Use demonstration clocks to show and read hour times',
      actionFr: 'Utiliser horloges démonstration pour montrer lire heures',
      consolidation: 'Match analog and digital hour times',
      consolidationFr: 'Associer heures analogiques et numériques',
      frenchConnection: 'Clock language: "horloge", "aiguille", "heures pile", "temps"'
    });
    
    lessons.push({
      title: 'Days, Weeks, Months',
      titleFr: 'Jours, semaines, mois',
      date: getSchoolDay(12),
      mindsOn: 'How long is a day? A week? A month?',
      mindsOnFr: 'Combien dure un jour? Une semaine? Un mois?',
      action: 'Explore calendar patterns and time periods',
      actionFr: 'Explorer motifs calendrier et périodes temps',
      consolidation: 'Create personal calendar showing important dates',
      consolidationFr: 'Créer calendrier personnel montrant dates importantes',
      frenchConnection: 'Calendar words: "jour", "semaine", "mois", "calendrier", "date"'
    });
    
    lessons.push({
      title: 'Money Values',
      titleFr: 'Valeurs argent',
      date: getSchoolDay(13),
      mindsOn: 'Explore Canadian coins and their values',
      mindsOnFr: 'Explorer pièces canadiennes et leurs valeurs',
      action: 'Sort, count, and compare coin values up to 25 cents',
      actionFr: 'Trier, compter, comparer valeurs pièces jusqu\'à 25 cents',
      consolidation: 'Play store with simple coin transactions',
      consolidationFr: 'Jouer magasin avec transactions pièces simples',
      frenchConnection: 'Money vocabulary: "argent", "pièce", "cent", "dollar", "coûte"'
    });
    
    lessons.push({
      title: 'Measuring Money Amounts',
      titleFr: 'Mesurer montants argent',
      date: getSchoolDay(14),
      mindsOn: 'How much money do I have? Can I buy this?',
      mindsOnFr: 'Combien d\'argent ai-je? Puis-je acheter ceci?',
      action: 'Count coin collections and compare to item prices',
      actionFr: 'Compter collections pièces et comparer prix objets',
      consolidation: 'Create classroom store with measurement theme',
      consolidationFr: 'Créer magasin classe avec thème mesure',
      frenchConnection: 'Shopping language: "acheter", "prix", "coûte", "assez", "change"'
    });
    
    // WEEK 4: March 30-31 + Additional Days - Measurement Applications
    lessons.push({
      title: 'Cooking and Measurement',
      titleFr: 'Cuisine et mesure',
      date: getSchoolDay(15),
      mindsOn: 'Recipes use measurement - cups, spoons, time',
      mindsOnFr: 'Recettes utilisent mesure - tasses, cuillères, temps',
      action: 'Explore cooking measurements through simple recipe activity',
      actionFr: 'Explorer mesures cuisine par activité recette simple',
      consolidation: 'Discuss importance of accurate measurement in cooking',
      consolidationFr: 'Discuter importance mesure précise en cuisine',
      frenchConnection: 'Cooking vocabulary: "recette", "tasse", "cuillère", "mesurer", "ingrédient"'
    });
    
    lessons.push({
      title: 'Measurement in Our School',
      titleFr: 'Mesure dans notre école',
      date: getSchoolDay(16),
      mindsOn: 'Find examples of measurement throughout the school',
      mindsOnFr: 'Trouver exemples mesure partout dans école',
      action: 'Measurement scavenger hunt around school building',
      actionFr: 'Chasse au trésor mesures dans bâtiment école',
      consolidation: 'Create map showing measurement discoveries',
      consolidationFr: 'Créer carte montrant découvertes mesures',
      frenchConnection: 'School vocabulary: "école", "partout", "trouver", "découvrir", "exemple"'
    });
    
    // Additional days (17-18) for complete coverage
    lessons.push({
      title: 'Nature Measurements',
      titleFr: 'Mesures dans la nature',
      date: new Date('2026-03-16'),
      mindsOn: 'Measure natural objects - leaves, sticks, rocks',
      mindsOnFr: 'Mesurer objets naturels - feuilles, bâtons, roches',
      action: 'Outdoor measurement exploration with natural materials',
      actionFr: 'Exploration mesures extérieure avec matériaux naturels',
      consolidation: 'Compare indoor and outdoor measurement experiences',
      consolidationFr: 'Comparer expériences mesures intérieur et extérieur',
      frenchConnection: 'Nature vocabulary: "nature", "feuille", "bâton", "roche", "dehors"'
    });
    
    lessons.push({
      title: 'Measurement Tools',
      titleFr: 'Outils de mesure',
      date: new Date('2026-03-17'),
      mindsOn: 'Explore real measurement tools - rulers, scales, measuring cups',
      mindsOnFr: 'Explorer vrais outils mesure - règles, balances, tasses mesure',
      action: 'Compare non-standard and standard measurement tools',
      actionFr: 'Comparer outils mesure non-standard et standard',
      consolidation: 'Discuss when we might use different measurement tools',
      consolidationFr: 'Discuter quand utiliser outils mesure différents',
      frenchConnection: 'Tools vocabulary: "outil", "règle", "balance", "tasse à mesurer"'
    });
    
    lessons.push({
      title: 'Measurement Portfolio',
      titleFr: 'Portfolio mesure',
      date: getSchoolDay(17),
      mindsOn: 'Organize and reflect on measurement learning',
      mindsOnFr: 'Organiser et réfléchir sur apprentissage mesure',
      action: 'Create measurement portfolio showing growth and discoveries',
      actionFr: 'Créer portfolio mesure montrant croissance et découvertes',
      consolidation: 'Share favorite measurement activities with class',
      consolidationFr: 'Partager activités mesure favorites avec classe',
      frenchConnection: 'Portfolio language: "collection", "apprentissage", "favoris", "découvertes"'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating March lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: mathUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // 45 minutes as specified
          grade: 1,
          subject: 'Mathématiques',
          language: 'fr',
          
          // Three-part lesson structure
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals focused on measurement concepts
          learningGoals: `Students will explore measurement concepts through hands-on investigation and comparison. French language integration`,
          learningGoalsFr: `Les élèves exploreront les concepts de mesure par investigation pratique et comparaison. French language integration`,
          
          materials: JSON.stringify([
            'Non-standard units (paperclips, cubes, blocks)',
            'Balance scales and weights',
            'Measuring containers and water/rice',
            'Demonstration clocks',
            'Canadian coins and play money',
            'Rulers and measuring tapes',
            'Calendar and schedule charts',
            'Natural materials for outdoor measuring'
          ]),
          
          grouping: 'hands-on exploration, partner measuring, small group investigations, whole class discussions',
          
          // Differentiation for measurement concepts
          accommodations: JSON.stringify([
            'Variety of measuring tools available',
            'Visual measurement charts and guides',
            'Peer support for recording',
            'Multiple ways to show understanding'
          ]),
          
          modifications: JSON.stringify([
            'Use larger, easier-to-handle measuring tools',
            'Focus on direct comparison before units',
            'Simplified recording sheets',
            'Extended time for hands-on exploration'
          ]),
          
          extensions: JSON.stringify([
            'Introduce standard measurement units',
            'Complex measurement problems',
            'Design measurement investigations',
            'Create measurement how-to guides'
          ]),
          
          differentiationStrategies: JSON.stringify({
            concrete: 'Abundant hands-on measurement experiences',
            comparison: 'Start with direct comparison before units',

            application: 'Real-world measurement contexts'
          }),
          
          // Assessment focused on measurement understanding
          assessmentType: 'formative',
          assessmentNotes: 'Observe measurement reasoning, comparison skills, use of measurement vocabulary in French, and understanding of measurement concepts. Note development of measurement sense.',
          
          // Support for hands-on measurement
          isSubFriendly: true,
          subNotes: 'All measurement materials organized in labeled bins. Measurement vocabulary charts posted. Safety guidelines for using balance scales and water activities. Student measurement journals ready.',
          
          // Rich cross-curricular measurement connections

          // Pedagogical approach

          // Special unit features

        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations related to measurement
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          OR: [
            { description: { contains: 'mesur' } },
            { description: { contains: 'temps' } },
            { description: { contains: 'argent' } },
            { strand: 'Mesure' }
          ]
        },
        take: 2
      });
      
      for (const exp of mathExpectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: exp.id
          }
        });
      }
    }
    
    console.log('\n📏 MARCH MEASUREMENT LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ March 2-31, 2026 fully planned (19 school days)');
    console.log('✅ Unit 6 "Explorer la mesure" complete');
    console.log('✅ Measurement concepts systematically developed');
    console.log('✅ Length, height, weight, capacity, time, money covered');
    console.log('✅ Hands-on exploration emphasized');
    console.log('✅ French measurement vocabulary integrated');
    console.log('✅ Real-world applications throughout');
    console.log('\n🎯 Students ready for Unit 7: Problem Solving Adventures in April!');
    
  } catch (error) {
    console.error('❌ Error creating March lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathMarchLessonPlans()
  .then(() => console.log('\n🎉 March Measurement lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });