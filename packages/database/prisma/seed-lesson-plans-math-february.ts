#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathFebruaryLessonPlans() {
  console.log('🧠 Creating Math Lesson Plans for February - Unit 5: "Stratégies de calcul mental"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Mental Math Strategies unit plan for February
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Stratégies de calcul mental'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Stratégies de calcul mental" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Feb 2-27, 2026 (18 lessons - Unit 5)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: mathUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 18 lesson plans for February
    const lessons = [];
    
    // Helper function to create dates in February 2026 (skip weekends)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        3, 4, 5, 6,        // Week 1: Feb 3-6 (short week)
        9, 10, 11, 12, 13, // Week 2: Feb 9-13  
        16, 17, 18, 19, 20,// Week 3: Feb 16-20 (Family Day week)
        23, 24, 25, 26, 27 // Week 4: Feb 23-27
      ];
      return new Date(`2026-02-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: February 3-6 - Introduction to Mental Math
    lessons.push({
      title: 'What is Mental Math?',
      titleFr: 'Qu\'est-ce que le calcul mental?',
      date: getSchoolDay(0),
      mindsOn: 'Think about math in your head - no paper, no manipulatives',
      mindsOnFr: 'Penser aux maths dans ta tête - pas papier, pas manipulatifs',
      action: 'Explore simple mental calculations, share thinking strategies',
      actionFr: 'Explorer calculs mentaux simples, partager stratégies pensée',
      consolidation: 'Discuss when mental math is useful in real life',
      consolidationFr: 'Discuter quand calcul mental utile dans vraie vie',
      frenchConnection: 'Mental vocabulary: "dans ma tête", "je pense", "mental", "rapidement"'
    });
    
    lessons.push({
      title: 'Number Talks Introduction',
      titleFr: 'Introduction discussions numériques',
      date: getSchoolDay(1),
      mindsOn: 'Share different ways to solve the same problem mentally',
      mindsOnFr: 'Partager façons différentes résoudre même problème mentalement',
      action: 'Practice number talk routine: see, think, share, listen',
      actionFr: 'Pratiquer routine discussion: voir, penser, partager, écouter',
      consolidation: 'Celebrate different mathematical thinking strategies',
      consolidationFr: 'Célébrer stratégies pensée mathématique différentes',
      frenchConnection: 'Discussion phrases: "je vois", "je pense", "ma façon", "autre idée"'
    });
    
    lessons.push({
      title: 'Count By Patterns',
      titleFr: 'Compter par motifs',
      date: getSchoolDay(2),
      mindsOn: 'Count by 2s, 5s, and 10s mentally with movement',
      mindsOnFr: 'Compter par 2, 5, et 10 mentalement avec mouvement',
      action: 'Use skip counting patterns for mental addition strategies',
      actionFr: 'Utiliser motifs comptage pour stratégies addition mentale',
      consolidation: 'Connect skip counting to repeated addition concepts',
      consolidationFr: 'Connecter comptage bonds aux concepts addition répétée',
      frenchConnection: 'Pattern language: "par deux", "par cinq", "par dix", "motif"'
    });
    
    lessons.push({
      title: 'Benchmark Numbers',
      titleFr: 'Nombres de référence',
      date: getSchoolDay(3),
      mindsOn: 'Use 5 and 10 as helpful numbers for mental math',
      mindsOnFr: 'Utiliser 5 et 10 comme nombres utiles calcul mental',
      action: 'Practice using 5 and 10 as stepping stones in calculations',
      actionFr: 'Pratiquer utiliser 5 et 10 comme tremplins dans calculs',
      consolidation: 'Explain why 5 and 10 are helpful mental math tools',
      consolidationFr: 'Expliquer pourquoi 5 et 10 sont outils utiles calcul mental',
      frenchConnection: 'Reference language: "j\'utilise dix", "je passe par cinq", "référence"'
    });
    
    // WEEK 2: February 9-13 - Strategy Development
    lessons.push({
      title: 'Doubles Plus One',
      titleFr: 'Doubles plus un',
      date: getSchoolDay(4),
      mindsOn: 'If you know 6+6, what is 6+7?',
      mindsOnFr: 'Si tu sais 6+6, qu\'est-ce que 6+7?',
      action: 'Use known doubles to solve near doubles mentally',
      actionFr: 'Utiliser doubles connus pour résoudre presque doubles mentalement',
      consolidation: 'Create doubles plus one strategy posters',
      consolidationFr: 'Créer affiches stratégie doubles plus un',
      frenchConnection: 'Near doubles: "presque double", "un de plus", "proche de"'
    });
    
    lessons.push({
      title: 'Break Apart Strategy',
      titleFr: 'Stratégie décomposer',
      date: getSchoolDay(5),
      mindsOn: 'Break bigger numbers into friendly parts',
      mindsOnFr: 'Casser grands nombres en parties amicales',
      action: 'Decompose numbers to make mental calculations easier',
      actionFr: 'Décomposer nombres pour rendre calculs mentaux plus faciles',
      consolidation: 'Share different ways to break apart the same number',
      consolidationFr: 'Partager façons différentes décomposer même nombre',
      frenchConnection: 'Breaking apart: "je casse", "je sépare", "parties", "plus facile"'
    });
    
    lessons.push({
      title: 'Compensation Thinking',
      titleFr: 'Pensée compensation',
      date: getSchoolDay(6),
      mindsOn: 'Add a little extra, then take away to balance',
      mindsOnFr: 'Ajouter un peu extra, puis enlever pour équilibrer',
      action: 'Practice adding 9 by adding 10 and subtracting 1',
      actionFr: 'Pratiquer ajouter 9 en ajoutant 10 et soustrayant 1',
      consolidation: 'Explain compensation thinking to a friend',
      consolidationFr: 'Expliquer pensée compensation à un ami',
      frenchConnection: 'Compensation: "j\'ajoute dix", "puis j\'enlève un", "équilibrer"'
    });
    
    lessons.push({
      title: 'Equal Groups Thinking',
      titleFr: 'Pensée groupes égaux',
      date: getSchoolDay(7),
      mindsOn: 'See groups of the same size in addition problems',
      mindsOnFr: 'Voir groupes même taille dans problèmes addition',
      action: 'Recognize when numbers can be grouped equally for easier addition',
      actionFr: 'Reconnaître quand nombres peuvent être groupés également',
      consolidation: 'Find equal groups in classroom objects',
      consolidationFr: 'Trouver groupes égaux dans objets classe',
      frenchConnection: 'Equal groups: "groupes égaux", "même taille", "pareil"'
    });
    
    lessons.push({
      title: 'Mental Subtraction Strategies',
      titleFr: 'Stratégies soustraction mentale',
      date: getSchoolDay(8),
      mindsOn: 'Count up or count back - which is easier?',
      mindsOnFr: 'Compter en avant ou en arrière - lequel est plus facile?',
      action: 'Practice mental subtraction using counting up and counting back',
      actionFr: 'Pratiquer soustraction mentale utilisant compter avant et arrière',
      consolidation: 'Choose efficient mental subtraction strategies',
      consolidationFr: 'Choisir stratégies soustraction mentale efficaces',
      frenchConnection: 'Subtraction strategies: "compter en avant", "compter en arrière", "plus facile"'
    });
    
    // WEEK 3: February 16-20 - Equality and Balance
    lessons.push({
      title: 'What Does Equal Mean?',
      titleFr: 'Que signifie égal?',
      date: getSchoolDay(9),
      mindsOn: 'Equal means balanced, the same amount on both sides',
      mindsOnFr: 'Égal signifie équilibré, même quantité des deux côtés',
      action: 'Explore equality with balance scales and equivalent groups',
      actionFr: 'Explorer égalité avec balances et groupes équivalents',
      consolidation: 'Create equal/not equal sorting activity',
      consolidationFr: 'Créer activité trier égal/pas égal',
      frenchConnection: 'Equality language: "égal", "pareil", "équilibré", "même quantité"'
    });
    
    lessons.push({
      title: 'Balance Scale Math',
      titleFr: 'Mathématiques balance',
      date: getSchoolDay(10),
      mindsOn: 'Use balance scales to understand equality visually',
      mindsOnFr: 'Utiliser balances pour comprendre égalité visuellement',
      action: 'Create balanced equations using objects and weights',
      actionFr: 'Créer équations équilibrées utilisant objets et poids',
      consolidation: 'Explain how balance helps us understand equals',
      consolidationFr: 'Expliquer comment balance aide comprendre égal',
      frenchConnection: 'Balance vocabulary: "lourd", "léger", "équilibre", "pencher"'
    });
    
    lessons.push({
      title: 'True or False Equations',
      titleFr: 'Équations vraies ou fausses',
      date: getSchoolDay(11),
      mindsOn: 'Determine if equations are balanced (true) or not',
      mindsOnFr: 'Déterminer si équations sont équilibrées (vraies) ou pas',
      action: 'Evaluate equations mentally without calculating both sides',
      actionFr: 'Évaluer équations mentalement sans calculer deux côtés',
      consolidation: 'Create own true and false equations for friends',
      consolidationFr: 'Créer propres équations vraies et fausses pour amis',
      frenchConnection: 'True/false: "vrai", "faux", "correct", "pas correct"'
    });
    
    lessons.push({
      title: 'Missing Numbers in Equations',
      titleFr: 'Nombres manquants dans équations',
      date: getSchoolDay(12),
      mindsOn: 'What number makes this equation balanced?',
      mindsOnFr: 'Quel nombre rend cette équation équilibrée?',
      action: 'Find missing numbers using mental math and equality thinking',
      actionFr: 'Trouver nombres manquants utilisant calcul mental et pensée égalité',
      consolidation: 'Explain strategies for finding missing numbers',
      consolidationFr: 'Expliquer stratégies pour trouver nombres manquants',
      frenchConnection: 'Missing number language: "quel nombre?", "manque", "mystère"'
    });
    
    lessons.push({
      title: 'Mental Math Games Day',
      titleFr: 'Journée jeux calcul mental',
      date: getSchoolDay(13),
      mindsOn: 'Practice mental math through fun games',
      mindsOnFr: 'Pratiquer calcul mental par jeux amusants',
      action: 'Rotate through mental math game stations',
      actionFr: 'Tourner par stations jeux calcul mental',
      consolidation: 'Share favorite mental math games and strategies',
      consolidationFr: 'Partager jeux et stratégies calcul mental favoris',
      frenchConnection: 'Game language: "jeu", "amusant", "défi", "réussir"'
    });
    
    // WEEK 4: February 23-27 - Application and Assessment
    lessons.push({
      title: 'Strategy Choice and Efficiency',
      titleFr: 'Choix stratégie et efficacité',
      date: getSchoolDay(14),
      mindsOn: 'Which mental math strategy works best for this problem?',
      mindsOnFr: 'Quelle stratégie calcul mental marche mieux pour ce problème?',
      action: 'Compare strategies and choose most efficient for different problems',
      actionFr: 'Comparer stratégies et choisir plus efficace pour problèmes différents',
      consolidation: 'Create strategy choice guidelines for the class',
      consolidationFr: 'Créer guide choix stratégies pour la classe',
      frenchConnection: 'Efficiency language: "plus rapide", "plus facile", "meilleure façon"'
    });
    
    lessons.push({
      title: 'Mental Math in Real Life',
      titleFr: 'Calcul mental dans vraie vie',
      date: getSchoolDay(15),
      mindsOn: 'When do people use mental math in everyday life?',
      mindsOnFr: 'Quand gens utilisent calcul mental dans vie quotidienne?',
      action: 'Solve real-world problems using mental math strategies',
      actionFr: 'Résoudre problèmes monde réel utilisant stratégies calcul mental',
      consolidation: 'Interview family about their mental math use',
      consolidationFr: 'Interviewer famille sur utilisation calcul mental',
      frenchConnection: 'Real life contexts: "magasin", "cuisine", "voyage", "argent"'
    });
    
    lessons.push({
      title: 'Mental Math Portfolio',
      titleFr: 'Portfolio calcul mental',
      date: getSchoolDay(16),
      mindsOn: 'Organize and reflect on mental math strategy learning',
      mindsOnFr: 'Organiser et réfléchir sur apprentissage stratégies calcul mental',
      action: 'Create portfolio showing favorite mental math strategies',
      actionFr: 'Créer portfolio montrant stratégies calcul mental favorites',
      consolidation: 'Present mental math growth to a partner',
      consolidationFr: 'Présenter croissance calcul mental à un partenaire',
      frenchConnection: 'Portfolio language: "ma collection", "mes stratégies", "j\'ai appris"'
    });
    
    lessons.push({
      title: 'Mental Math Celebration',
      titleFr: 'Célébration calcul mental',
      date: getSchoolDay(17),
      mindsOn: 'Celebrate becoming mental math strategists',
      mindsOnFr: 'Célébrer devenir stratèges calcul mental',
      action: 'Mental math olympics with strategy stations',
      actionFr: 'Olympiades calcul mental avec stations stratégies',
      consolidation: 'Set goals for continued mental math development',
      consolidationFr: 'Fixer objectifs pour développement continu calcul mental',
      frenchConnection: 'Celebration language: "champion", "fier", "réussir", "continuer"'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating February lesson plans in database...\n');
    
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
          
          // Learning goals focused on mental strategies
          learningGoals: `Students will develop mental math strategies and understand equality as balance. ${lessonData.frenchConnection}`,
          learningGoalsFr: `Les élèves développeront des stratégies de calcul mental et comprendront l'égalité comme équilibre. ${lessonData.frenchConnection}`,
          
          materials: JSON.stringify([
            'Balance scales and weights',
            'Mental math strategy charts',
            'True/false equation cards',
            'Number talk prompts',
            'Mental math games',
            'Hundreds charts',
            'Strategy recording sheets',
            'Portfolio folders'
          ]),
          
          grouping: 'whole class number talks, individual thinking time, partner sharing, small group games',
          
          // Differentiation for mental math development
          accommodations: JSON.stringify([
            'Think time before sharing',
            'Visual supports for strategies',
            'Choice of number ranges',
            'Multiple ways to show thinking'
          ]),
          
          modifications: JSON.stringify([
            'Work with smaller numbers (to 10)',
            'Use concrete materials if needed',
            'Focus on one strategy at a time',
            'Extended processing time'
          ]),
          
          extensions: JSON.stringify([
            'Work with larger numbers',
            'Combine multiple strategies',
            'Create strategy teaching videos',
            'Challenge problems and puzzles'
          ]),
          
          differentiationStrategies: JSON.stringify({
            mental: 'Build from concrete to mental gradually',
            strategies: 'Focus on personal strategy development',
            communication: 'Multiple ways to explain thinking',
            practice: 'Varied practice opportunities and contexts'
          }),
          
          // Assessment focused on strategy development
          assessmentType: 'formative',
          assessmentNotes: 'Observe mental math strategy development, mathematical reasoning, understanding of equality, and ability to explain thinking in French. Note strategy preferences and growing efficiency.',
          
          // Support for mental math instruction
          isSubFriendly: true,
          subNotes: 'Mental math strategy charts posted. Number talk routine outlined in binder. Games with clear instructions in labeled containers. Student strategy portfolios organized by table.',
          
          // Cross-curricular mental math connections
          crossCurricularConnections: `${lessonData.frenchConnection}. Science: mental estimation in measurements. Social Studies: mental math in community contexts. Arts: patterns and mathematical thinking.`,
          
          // Pedagogical approach
          pedagogicalApproach: 'Number talks routine, think-pair-share, strategy choice emphasis, metacognitive reflection',
          
          timeOfDay: '9:45 AM - 10:30 AM',
          
          // Special unit features
          specialFocus: 'Mental math strategy development, equality understanding, mathematical communication'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations related to mental math and equality
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          OR: [
            { strand: 'Nombre' },
            { strand: 'Numératie' },
            { description: { contains: 'égal' } }
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
    
    console.log('\n🧠 FEBRUARY MENTAL MATH LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ February 3-27, 2026 fully planned (18 school days)');
    console.log('✅ Unit 5 "Stratégies de calcul mental" complete');
    console.log('✅ Mental math strategies developed systematically');
    console.log('✅ Equality and balance concepts integrated');
    console.log('✅ Number talks routine established');
    console.log('✅ Strategy choice and efficiency emphasized');
    console.log('✅ Real-world applications included');
    console.log('\n🎯 Students ready for Unit 6: Measurement Exploration in March!');
    
  } catch (error) {
    console.error('❌ Error creating February lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathFebruaryLessonPlans()
  .then(() => console.log('\n🎉 February Mental Math lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });