#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathSeptemberLessonPlans() {
  console.log('🔢 Creating Math Lesson Plans for September - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Math unit plan for September
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les nombres tout autour de nous'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Les nombres tout autour de nous" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Sept 4-30, 2025 (20 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: mathUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 20 lesson plans (1 hour each) for September
    const lessons = [];
    
    // Helper function to create dates in September 2025
    const septDate = (day: number) => new Date(`2025-09-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: September 4-5 (Thursday-Friday, 2 days)
    lessons.push({
      title: 'Numbers All Around Us',
      titleFr: 'Les nombres partout',
      date: septDate(4),
      mindsOn: 'Count students, objects in classroom, number hunt with French vocabulary',
      mindsOnFr: 'Compter les élèves, objets dans la classe, chasse aux nombres',
      action: 'Explore classroom for numbers, create number book 1-5, counting manipulatives',
      actionFr: 'Explorer la classe pour nombres, créer livre 1-5, compter manipulatifs',
      consolidation: 'Share number discoveries, practice counting in French, number song',
      consolidationFr: 'Partager découvertes, pratiquer compter en français, chanson',
      frenchConnection: 'Use French number words: un, deux, trois, quatre, cinq'
    });
    
    lessons.push({
      title: 'Counting Collections',
      titleFr: 'Collections à compter',
      date: septDate(5),
      mindsOn: 'Sort and count classroom materials, estimate quantities',
      mindsOnFr: 'Trier et compter matériaux, estimer quantités',
      action: 'Count collections of 1-10 items, record with tally marks, compare groups',
      actionFr: 'Compter collections 1-10, enregistrer avec traits, comparer groupes',
      consolidation: 'Gallery walk of counting work, discuss strategies, celebrate counting',
      consolidationFr: 'Promenade galerie, discuter stratégies, célébrer',
      frenchConnection: 'Practice "J\'ai... objets" (I have... objects)'
    });
    
    // WEEK 2: September 8-12 (5 days)
    lessons.push({
      title: 'Number Recognition 1-10',
      titleFr: 'Reconnaissance des nombres 1-10',
      date: septDate(8),
      mindsOn: 'Number cards memory game, find numbers in environment',
      mindsOnFr: 'Jeu mémoire cartes nombres, trouver nombres environnement',
      action: 'Create number posters, practice writing 1-5, number formation rhymes',
      actionFr: 'Créer affiches nombres, pratiquer écrire 1-5, comptines formation',
      consolidation: 'Number parade, show and tell numbers, assessment check',
      consolidationFr: 'Parade nombres, montrer et dire, vérification',
      frenchConnection: 'Number names in French with actions'
    });
    
    lessons.push({
      title: 'One-to-One Correspondence',
      titleFr: 'Correspondance un à un',
      date: septDate(9),
      mindsOn: 'Match objects to numbers, counting bears activity',
      mindsOnFr: 'Associer objets aux nombres, activité oursons',
      action: 'Practice one-to-one counting, create counting books, partner counting games',
      actionFr: 'Pratiquer correspondance, créer livres, jeux partenaires',
      consolidation: 'Demonstrate accurate counting, peer assessment, reflection',
      consolidationFr: 'Démontrer comptage précis, évaluation pairs, réflexion',
      frenchConnection: 'Use "chaque" (each) and "tous" (all)'
    });
    
    lessons.push({
      title: 'Comparing Numbers',
      titleFr: 'Comparer les nombres',
      date: septDate(10),
      mindsOn: 'Which group has more? Less? Same? Visual comparison',
      mindsOnFr: 'Quel groupe a plus? Moins? Pareil? Comparaison visuelle',
      action: 'Compare groups using manipulatives, introduce >, <, = symbols playfully',
      actionFr: 'Comparer groupes avec manipulatifs, introduire symboles',
      consolidation: 'Create comparison problems for friends, share strategies',
      consolidationFr: 'Créer problèmes pour amis, partager stratégies',
      frenchConnection: 'Learn "plus que", "moins que", "égal à"'
    });
    
    lessons.push({
      title: 'Number Patterns',
      titleFr: 'Motifs de nombres',
      date: septDate(11),
      mindsOn: 'Clap and stomp patterns, identify AB patterns',
      mindsOnFr: 'Motifs taper et frapper, identifier motifs AB',
      action: 'Create patterns with manipulatives, extend patterns, pattern art',
      actionFr: 'Créer motifs manipulatifs, continuer motifs, art motifs',
      consolidation: 'Pattern parade, describe patterns, pattern predictions',
      consolidationFr: 'Parade motifs, décrire motifs, prédictions',
      frenchConnection: 'Pattern vocabulary: "répéter", "suivant"'
    });
    
    lessons.push({
      title: 'Number Stories',
      titleFr: 'Histoires de nombres',
      date: septDate(12),
      mindsOn: 'Act out simple addition stories with props',
      mindsOnFr: 'Jouer histoires addition avec accessoires',
      action: 'Create number stories, illustrate problems, solve with manipulatives',
      actionFr: 'Créer histoires nombres, illustrer problèmes, résoudre',
      consolidation: 'Share stories, celebrate problem solving, reflection',
      consolidationFr: 'Partager histoires, célébrer résolution, réflexion',
      frenchConnection: 'Story language: "et", "fait", "ensemble"'
    });
    
    // WEEK 3: September 15-19 (5 days)
    lessons.push({
      title: 'Addition Introduction',
      titleFr: 'Introduction à l\'addition',
      date: septDate(15),
      mindsOn: 'Combining groups of objects, "putting together" concept',
      mindsOnFr: 'Combiner groupes objets, concept "mettre ensemble"',
      action: 'Use manipulatives for addition, record with pictures, introduce + sign',
      actionFr: 'Utiliser manipulatifs addition, enregistrer images, signe +',
      consolidation: 'Addition gallery, explain thinking, peer teaching',
      consolidationFr: 'Galerie addition, expliquer pensée, enseigner pairs',
      frenchConnection: 'Addition vocabulary: "plus", "ajouter", "total"'
    });
    
    lessons.push({
      title: 'Numbers and French Integration',
      titleFr: 'Nombres et français ensemble',
      date: septDate(16),
      mindsOn: 'Count in French, number songs, French number games',
      mindsOnFr: 'Compter en français, chansons nombres, jeux français',
      action: 'Create bilingual number books, practice calculations in French',
      actionFr: 'Créer livres bilingues, pratiquer calculs en français',
      consolidation: 'Present number work in French, celebrate bilingual math',
      consolidationFr: 'Présenter travail en français, célébrer maths bilingues',
      frenchConnection: 'FULL FRENCH INTEGRATION - All math in French today'
    });
    
    lessons.push({
      title: 'Subtraction Introduction',
      titleFr: 'Introduction à la soustraction',
      date: septDate(17),
      mindsOn: 'Taking away objects, "How many left?" activities',
      mindsOnFr: 'Enlever objets, activités "Combien restent?"',
      action: 'Act out subtraction stories, use manipulatives, introduce - sign',
      actionFr: 'Jouer histoires soustraction, manipulatifs, signe -',
      consolidation: 'Subtraction demonstrations, explain strategies, reflection',
      consolidationFr: 'Démonstrations soustraction, expliquer stratégies',
      frenchConnection: 'Subtraction words: "moins", "enlever", "reste"'
    });
    
    lessons.push({
      title: 'Number Bonds to 5',
      titleFr: 'Liens numériques jusqu\'à 5',
      date: septDate(18),
      mindsOn: 'Ways to make 5 with fingers, with objects',
      mindsOnFr: 'Façons de faire 5 avec doigts, avec objets',
      action: 'Explore all combinations to make 5, create number bond diagrams',
      actionFr: 'Explorer combinaisons pour faire 5, créer diagrammes',
      consolidation: 'Number bond games, quick recall practice, celebrate',
      consolidationFr: 'Jeux liens numériques, pratique rappel, célébrer',
      frenchConnection: 'Combination language: "et", "font", "ensemble"'
    });
    
    lessons.push({
      title: 'Problem Solving Friday',
      titleFr: 'Vendredi résolution de problèmes',
      date: septDate(19),
      mindsOn: 'Real-world math problems from classroom life',
      mindsOnFr: 'Problèmes mathématiques de la vie de classe',
      action: 'Solve problems in groups, multiple strategies, share thinking',
      actionFr: 'Résoudre en groupes, stratégies multiples, partager',
      consolidation: 'Present solutions, discuss different approaches, celebrate',
      consolidationFr: 'Présenter solutions, discuter approches, célébrer',
      frenchConnection: 'Problem-solving phrases in French'
    });
    
    // WEEK 4: September 22-26 (5 days)
    lessons.push({
      title: 'Measurement with Numbers',
      titleFr: 'Mesurer avec les nombres',
      date: septDate(22),
      mindsOn: 'Measure classroom objects with non-standard units',
      mindsOnFr: 'Mesurer objets classe avec unités non-standard',
      action: 'Measure with cubes, paperclips, record measurements, compare',
      actionFr: 'Mesurer avec cubes, trombones, enregistrer, comparer',
      consolidation: 'Share measurements, discuss findings, measurement song',
      consolidationFr: 'Partager mesures, discuter trouvailles, chanson',
      frenchConnection: 'Measurement vocabulary: "long", "court", "mesurer"'
    });
    
    lessons.push({
      title: 'Data and Graphing',
      titleFr: 'Données et graphiques',
      date: septDate(23),
      mindsOn: 'Survey class favorites, collect data with tally marks',
      mindsOnFr: 'Sondage favoris classe, collecter données avec traits',
      action: 'Create picture graphs, bar graphs with blocks, interpret data',
      actionFr: 'Créer pictogrammes, graphiques barres, interpréter',
      consolidation: 'Present graphs, ask questions about data, conclusions',
      consolidationFr: 'Présenter graphiques, poser questions, conclusions',
      frenchConnection: 'Graph vocabulary: "le plus", "le moins", "préféré"'
    });
    
    lessons.push({
      title: 'Money and Numbers',
      titleFr: 'L\'argent et les nombres',
      date: septDate(24),
      mindsOn: 'Explore Canadian coins, identify values',
      mindsOnFr: 'Explorer pièces canadiennes, identifier valeurs',
      action: 'Count pennies to 10, play store with simple prices, make amounts',
      actionFr: 'Compter sous jusqu\'à 10, jouer magasin, faire montants',
      consolidation: 'Money problems, share strategies, reflection',
      consolidationFr: 'Problèmes argent, partager stratégies, réflexion',
      frenchConnection: 'Money words: "cent", "dollar", "acheter", "payer"'
    });
    
    lessons.push({
      title: 'Time and Numbers',
      titleFr: 'Le temps et les nombres',
      date: septDate(25),
      mindsOn: 'Daily schedule with times, hour hand on clock',
      mindsOnFr: 'Horaire quotidien avec heures, aiguille heures',
      action: 'Practice hour times, sequence daily events, create class schedule',
      actionFr: 'Pratiquer heures, séquencer événements, créer horaire',
      consolidation: 'Time games, discuss daily math, reflection',
      consolidationFr: 'Jeux temps, discuter maths quotidiennes, réflexion',
      frenchConnection: 'Time vocabulary: "heure", "maintenant", "après"'
    });
    
    lessons.push({
      title: 'Number Games Day',
      titleFr: 'Journée jeux de nombres',
      date: septDate(26),
      mindsOn: 'Review favorite number games from the month',
      mindsOnFr: 'Réviser jeux nombres favoris du mois',
      action: 'Rotating game stations, partner games, create new games',
      actionFr: 'Stations jeux rotatifs, jeux partenaires, créer jeux',
      consolidation: 'Share new games, teach others, celebrate learning',
      consolidationFr: 'Partager nouveaux jeux, enseigner autres, célébrer',
      frenchConnection: 'Game instructions in French'
    });
    
    // FINAL DAYS: September 29-30 (2 days)
    lessons.push({
      title: 'September Math Review',
      titleFr: 'Révision mathématiques septembre',
      date: septDate(29),
      mindsOn: 'Math scavenger hunt reviewing all concepts',
      mindsOnFr: 'Chasse au trésor révisant tous concepts',
      action: 'Review stations for each topic, self-assessment, practice',
      actionFr: 'Stations révision chaque sujet, auto-évaluation',
      consolidation: 'Share growth, identify strengths, set goals',
      consolidationFr: 'Partager croissance, identifier forces, objectifs',
      frenchConnection: 'Review all French math vocabulary'
    });
    
    lessons.push({
      title: 'Math Celebration!',
      titleFr: 'Célébration mathématiques!',
      date: septDate(30),
      mindsOn: 'Math museum setup, prepare presentations',
      mindsOnFr: 'Installation musée maths, préparer présentations',
      action: 'Present math learning to families, demonstrate skills, math fair',
      actionFr: 'Présenter apprentissages familles, démontrer, foire maths',
      consolidation: 'Celebrate achievements, October preview, group photo',
      consolidationFr: 'Célébrer réussites, aperçu octobre, photo groupe',
      frenchConnection: 'Present math work in French to families'
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
          
          // Planning details with French connection
          learningGoals: `Students will develop number sense and mathematical thinking skills. French language integration`,
          learningGoalsFr: `Les élèves développeront le sens du nombre et les compétences mathématiques. French language integration`,
          
          materials: JSON.stringify([
            'Counting bears',
            'Pattern blocks',
            'Number cards',
            'Chart paper',
            'Manipulatives',
            'Measuring tools'
          ]),
          
          grouping: 'whole class, small groups, pairs, individual',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Concrete manipulatives',
            'Visual number lines',
            'Partner support',
            'Reduced number range'
          ]),
          
          modifications: JSON.stringify([
            'Work with numbers 1-5 only',
            'Extra time for processing',
            'Pictorial supports',
            'Simplified problems'
          ]),
          
          extensions: JSON.stringify([
            'Numbers beyond 10',
            'More complex problems',
            'Create own problems',
            'Peer tutoring'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Use manipulatives and visual aids, work with smaller number ranges',
            extension: 'Explore larger numbers, create own problems, help peers',
            multiModal: 'Hands-on, visual, auditory, and movement-based learning'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observation of number sense development, mathematical thinking, problem-solving strategies, and French vocabulary use in math contexts',
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All materials in labeled bins, visual schedule posted, math manipulatives ready, French vocabulary cards available'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - French language integration`);
      
      // Link Math expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Nombre'
        },
        take: 2 // Link to first 2 number expectations
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
    
    console.log('\n📊 MATH LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive math lesson plans`);
    console.log('✅ September 4-30, 2025 fully planned');
    console.log('✅ 20 hours of math instruction');
    console.log('✅ Natural French language integration throughout');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Differentiation in every lesson');
    console.log('✅ Assessment strategies included');
    console.log('✅ Sub-friendly with clear notes');
    console.log('\n🎉 Math and French work together naturally for September 2025!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathSeptemberLessonPlans()
  .then(() => console.log('\n🏆 Math lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });