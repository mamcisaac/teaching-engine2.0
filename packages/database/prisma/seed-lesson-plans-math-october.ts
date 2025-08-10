#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathOctoberLessonPlans() {
  console.log('🔢 Creating Math Lesson Plans for October - "Comprendre les nombres"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Math unit plan for October
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Comprendre les nombres'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Comprendre les nombres" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Oct 1-31, 2025 (20 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: mathUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 20 lesson plans for October
    const lessons = [];
    
    // Helper function to create dates in October 2025
    const octDate = (day: number) => new Date(`2025-10-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: Building on September's 1-10, moving to teen numbers
    lessons.push({
      title: 'Numbers 11-15',
      titleFr: 'Les nombres 11-15',
      date: octDate(1),
      mindsOn: 'Review 1-10, introduce teen numbers with manipulatives',
      mindsOnFr: 'Réviser 1-10, introduire nombres avec manipulatifs',
      action: 'Build teen numbers with base-10 blocks, practice counting, number books',
      actionFr: 'Construire nombres avec blocs, pratiquer, livres nombres',
      consolidation: 'Teen number parade, show different representations',
      consolidationFr: 'Parade nombres, montrer représentations',
      frenchConnection: 'onze, douze, treize, quatorze, quinze'
    });
    
    lessons.push({
      title: 'Numbers 16-20',
      titleFr: 'Les nombres 16-20',
      date: octDate(2),
      mindsOn: 'Teen number patterns, counting by ones',
      mindsOnFr: 'Motifs nombres, compter par uns',
      action: 'Number line activities, counting collections to 20, number hunt',
      actionFr: 'Activités ligne nombres, compter à 20, chasse nombres',
      consolidation: 'Number 20 celebration, counting achievements',
      consolidationFr: 'Célébration nombre 20, réussites comptage',
      frenchConnection: 'seize, dix-sept, dix-huit, dix-neuf, vingt'
    });
    
    lessons.push({
      title: 'Counting by 2s',
      titleFr: 'Compter par 2',
      date: octDate(3),
      mindsOn: 'Partner counting, pairs of objects',
      mindsOnFr: 'Compter partenaires, paires objets',
      action: 'Skip counting with movement, create counting patterns, pair games',
      actionFr: 'Compter bonds mouvement, créer motifs, jeux paires',
      consolidation: 'Skip counting songs, pattern sharing',
      consolidationFr: 'Chansons comptage, partager motifs',
      frenchConnection: 'deux, quatre, six, huit, dix'
    });
    
    // WEEK 2: Place value understanding
    lessons.push({
      title: 'Tens and Ones',
      titleFr: 'Dizaines et unités',
      date: octDate(6),
      mindsOn: 'Bundle straws into tens, explore grouping',
      mindsOnFr: 'Grouper pailles par dix, explorer groupement',
      action: 'Build numbers with base-10 blocks, tens frames, place value mats',
      actionFr: 'Construire nombres blocs, cadres dix, tapis valeur',
      consolidation: 'Show numbers different ways, explain thinking',
      consolidationFr: 'Montrer nombres différemment, expliquer pensée',
      frenchConnection: 'dizaine, unité, groupe de dix'
    });
    
    lessons.push({
      title: 'Building Numbers',
      titleFr: 'Construire les nombres',
      date: octDate(7),
      mindsOn: 'Mystery number boxes, guess the number',
      mindsOnFr: 'Boîtes nombres mystères, deviner nombre',
      action: 'Build numbers multiple ways, decompose numbers, number puzzles',
      actionFr: 'Construire nombres, décomposer, casse-têtes',
      consolidation: 'Number building challenge, share strategies',
      consolidationFr: 'Défi construction nombres, partager stratégies',
      frenchConnection: 'construire, faire, décomposer'
    });
    
    lessons.push({
      title: 'Comparing to 20',
      titleFr: 'Comparer jusqu\'à 20',
      date: octDate(8),
      mindsOn: 'Which is more? Less? Number comparisons',
      mindsOnFr: 'Lequel est plus? Moins? Comparaisons',
      action: 'Compare numbers with blocks, number line hops, comparison games',
      actionFr: 'Comparer avec blocs, sauts ligne, jeux comparaison',
      consolidation: 'Comparison explanations, justify thinking',
      consolidationFr: 'Explications comparaisons, justifier pensée',
      frenchConnection: 'plus grand que, plus petit que, égal'
    });
    
    lessons.push({
      title: 'Ordering Numbers',
      titleFr: 'Ordonner les nombres',
      date: octDate(9),
      mindsOn: 'Number scramble, put in order',
      mindsOnFr: 'Nombres mélangés, mettre en ordre',
      action: 'Order number cards, create number sequences, human number line',
      actionFr: 'Ordonner cartes, créer séquences, ligne humaine',
      consolidation: 'Explain ordering strategies, check work',
      consolidationFr: 'Expliquer stratégies ordre, vérifier',
      frenchConnection: 'premier, dernier, avant, après'
    });
    
    lessons.push({
      title: 'Number Neighbors',
      titleFr: 'Les voisins des nombres',
      date: octDate(10),
      mindsOn: 'What comes before? After? Between?',
      mindsOnFr: 'Qu\'est-ce qui vient avant? Après? Entre?',
      action: 'Find number neighbors, fill missing numbers, neighbor games',
      actionFr: 'Trouver voisins, compléter nombres, jeux voisins',
      consolidation: 'Number neighbor quiz show, quick recall',
      consolidationFr: 'Jeu questionnaire voisins, rappel rapide',
      frenchConnection: 'avant, après, entre, voisin'
    });
    
    // WEEK 3: October 14 (Thanksgiving Monday), start Tuesday
    lessons.push({
      title: 'Counting Collections',
      titleFr: 'Collections à compter',
      date: octDate(14),
      mindsOn: 'Thanksgiving counting - things we\'re grateful for',
      mindsOnFr: 'Compter reconnaissance - gratitude',
      action: 'Count autumn collections, organize by tens, record counts',
      actionFr: 'Compter collections automne, organiser, enregistrer',
      consolidation: 'Share counting strategies, gratitude circle',
      consolidationFr: 'Partager stratégies, cercle gratitude',
      frenchConnection: 'compter, collection, merci'
    });
    
    lessons.push({
      title: 'Estimating Amounts',
      titleFr: 'Estimer les quantités',
      date: octDate(15),
      mindsOn: 'Estimation jars, quick looks, reasonable guesses',
      mindsOnFr: 'Pots estimation, regards rapides, estimations',
      action: 'Practice estimating, check with counting, estimation stations',
      actionFr: 'Pratiquer estimer, vérifier comptage, stations',
      consolidation: 'Estimation strategies, improving estimates',
      consolidationFr: 'Stratégies estimation, améliorer estimations',
      frenchConnection: 'estimer, environ, à peu près'
    });
    
    lessons.push({
      title: 'Number Bonds to 10',
      titleFr: 'Liens numériques jusqu\'à 10',
      date: octDate(16),
      mindsOn: 'Ways to make 10, rainbow facts',
      mindsOnFr: 'Façons de faire 10, faits arc-en-ciel',
      action: 'Create number bond diagrams, ten frame activities, partner games',
      actionFr: 'Créer diagrammes liens, cadres dix, jeux partenaires',
      consolidation: 'Quick recall practice, number bond celebration',
      consolidationFr: 'Pratique rappel rapide, célébration liens',
      frenchConnection: 'faire dix, ensemble, combinaison'
    });
    
    lessons.push({
      title: 'Doubles Facts',
      titleFr: 'Les doubles',
      date: octDate(17),
      mindsOn: 'Mirror math, doubles in nature',
      mindsOnFr: 'Maths miroir, doubles dans nature',
      action: 'Explore doubles with manipulatives, doubles songs, create doubles book',
      actionFr: 'Explorer doubles manipulatifs, chansons, livre doubles',
      consolidation: 'Doubles quiz, quick recall games',
      consolidationFr: 'Quiz doubles, jeux rappel rapide',
      frenchConnection: 'double, deux fois, pareil'
    });
    
    // WEEK 4: Problem solving with numbers
    lessons.push({
      title: 'Story Problems',
      titleFr: 'Problèmes en histoires',
      date: octDate(20),
      mindsOn: 'Real-life math stories from classroom',
      mindsOnFr: 'Histoires maths vraies de classe',
      action: 'Solve story problems, act them out, draw solutions',
      actionFr: 'Résoudre problèmes, jouer, dessiner solutions',
      consolidation: 'Create own story problems, share with class',
      consolidationFr: 'Créer problèmes, partager avec classe',
      frenchConnection: 'problème, solution, résoudre'
    });
    
    lessons.push({
      title: 'Addition Strategies',
      titleFr: 'Stratégies d\'addition',
      date: octDate(21),
      mindsOn: 'Different ways to add, mental math tricks',
      mindsOnFr: 'Différentes façons additionner, trucs mentaux',
      action: 'Practice counting on, using doubles, making 10 strategy',
      actionFr: 'Pratiquer compter, utiliser doubles, faire 10',
      consolidation: 'Strategy sharing, explain your thinking',
      consolidationFr: 'Partager stratégies, expliquer pensée',
      frenchConnection: 'ajouter, plus, stratégie'
    });
    
    lessons.push({
      title: 'Subtraction Strategies',
      titleFr: 'Stratégies de soustraction',
      date: octDate(22),
      mindsOn: 'Taking away vs counting back',
      mindsOnFr: 'Enlever vs compter à rebours',
      action: 'Practice different subtraction methods, use number line, games',
      actionFr: 'Pratiquer méthodes, utiliser ligne, jeux',
      consolidation: 'Compare strategies, which works best?',
      consolidationFr: 'Comparer stratégies, laquelle meilleure?',
      frenchConnection: 'enlever, moins, différence'
    });
    
    lessons.push({
      title: 'Missing Numbers',
      titleFr: 'Nombres manquants',
      date: octDate(23),
      mindsOn: 'Number mysteries, find the missing number',
      mindsOnFr: 'Mystères nombres, trouver nombre manquant',
      action: 'Solve missing number problems, use balance, number detective work',
      actionFr: 'Résoudre problèmes, utiliser balance, détective',
      consolidation: 'Create missing number puzzles for friends',
      consolidationFr: 'Créer casse-têtes pour amis',
      frenchConnection: 'manquant, trouver, mystère'
    });
    
    lessons.push({
      title: 'Number Patterns',
      titleFr: 'Motifs numériques',
      date: octDate(24),
      mindsOn: 'Pattern hunt in numbers, what comes next?',
      mindsOnFr: 'Chasse motifs nombres, qu\'est-ce qui suit?',
      action: 'Create and extend number patterns, pattern rules, pattern art',
      actionFr: 'Créer étendre motifs, règles, art motifs',
      consolidation: 'Pattern gallery, explain your patterns',
      consolidationFr: 'Galerie motifs, expliquer vos motifs',
      frenchConnection: 'motif, règle, continuer'
    });
    
    // WEEK 5: Halloween week and review
    lessons.push({
      title: 'Halloween Counting',
      titleFr: 'Compter Halloween',
      date: octDate(27),
      mindsOn: 'Halloween items counting, spooky math',
      mindsOnFr: 'Compter items Halloween, maths effrayantes',
      action: 'Halloween math stations, candy counting, costume math',
      actionFr: 'Stations maths Halloween, compter bonbons, maths costumes',
      consolidation: 'Halloween math celebration, share problems',
      consolidationFr: 'Célébration maths Halloween, partager problèmes',
      frenchConnection: 'Halloween vocabulary with numbers'
    });
    
    lessons.push({
      title: 'October Review',
      titleFr: 'Révision octobre',
      date: octDate(28),
      mindsOn: 'Math skills we learned, favorite activities',
      mindsOnFr: 'Compétences apprises, activités favorites',
      action: 'Review stations, practice all skills, math games',
      actionFr: 'Stations révision, pratiquer, jeux maths',
      consolidation: 'Self-assessment, set November goals',
      consolidationFr: 'Auto-évaluation, objectifs novembre',
      frenchConnection: 'réviser, pratiquer, apprendre'
    });
    
    lessons.push({
      title: 'Math Games Day',
      titleFr: 'Journée jeux mathématiques',
      date: octDate(29),
      mindsOn: 'Choose favorite math games from October',
      mindsOnFr: 'Choisir jeux maths favoris octobre',
      action: 'Game stations, partner games, create new games',
      actionFr: 'Stations jeux, jeux partenaires, créer jeux',
      consolidation: 'Game tournament, celebrate learning',
      consolidationFr: 'Tournoi jeux, célébrer apprentissage',
      frenchConnection: 'French number game vocabulary'
    });
    
    lessons.push({
      title: 'October Math Celebration',
      titleFr: 'Célébration mathématique octobre',
      date: octDate(31),
      mindsOn: 'Halloween math excitement, costume counting',
      mindsOnFr: 'Excitation maths Halloween, compter costumes',
      action: 'Math showcase preparation, practice presentations, Halloween math',
      actionFr: 'Préparer vitrine maths, pratiquer, maths Halloween',
      consolidation: 'October celebration, share growth, November preview',
      consolidationFr: 'Célébration octobre, partager croissance, aperçu',
      frenchConnection: 'célébrer, mathématiques, Halloween'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: mathUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 60, // All lessons are 1 hour
          grade: 1,
          subject: 'Mathématiques',
          language: 'fr',
          
          // Three-part lesson
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals with French connection
          learningGoals: `Students will deepen number understanding to 20 and beyond. French connection: ${lessonData.frenchConnection}`,
          learningGoalsFr: `Les élèves approfondiront la compréhension des nombres jusqu'à 20 et plus. ${lessonData.frenchConnection}`,
          
          materials: JSON.stringify([
            'Base-10 blocks',
            'Number cards',
            'Counting collections',
            'Ten frames',
            'Number lines',
            'Manipulatives'
          ]),
          
          grouping: 'whole class, small groups, pairs, individual',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Concrete manipulatives always available',
            'Number line support',
            'Peer partnerships',
            'Visual representations'
          ]),
          
          modifications: JSON.stringify([
            'Work with smaller numbers',
            'Extra time for processing',
            'Concrete materials only',
            'Simplified problems'
          ]),
          
          extensions: JSON.stringify([
            'Numbers beyond 20',
            'More complex problems',
            'Mental math challenges',
            'Create problems for others'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Manipulatives, visual aids, smaller numbers, peer support',
            extension: 'Larger numbers, mental math, problem creation',
            multiModal: 'Concrete, pictorial, abstract representations'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observe number sense development, strategy use, problem-solving approaches, French vocabulary integration',
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'Math manipulatives in labeled bins, number lines posted, French number words visible'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - ${lessonData.frenchConnection}`);
      
      // Link Math expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Nombre'
        },
        take: 2
      });
      
      for (const exp of expectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: exp.id
          }
        });
      }
    }
    
    console.log('\n📊 MATH OCTOBER LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive math lesson plans`);
    console.log('✅ October 1-31, 2025 fully planned');
    console.log('✅ 20 hours of math instruction');
    console.log('✅ Numbers to 20 and beyond');
    console.log('✅ Natural French number vocabulary');
    console.log('✅ Halloween integration');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Differentiation in every lesson');
    console.log('✅ Sub-friendly with clear notes');
    console.log('\n🎉 October Math "Comprendre les nombres" ready!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathOctoberLessonPlans()
  .then(() => console.log('\n🏆 October Math lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });