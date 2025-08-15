#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathJanuaryLessonPlans() {
  console.log('🔢 Creating Math Lesson Plans for January - Completing "Addition et soustraction"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Math unit plan for January (continuing Addition et soustraction)
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Addition et soustraction'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Addition et soustraction" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Jan 1-31, 2026 (20 lessons - completing Unit 4)\n`);
    
    // January lessons will be appended to the December unit
    // No need to clear existing plans as we're continuing the same unit
    
    // Create 20 lesson plans for January
    const lessons = [];
    
    // Helper function to create dates in January 2026 (skip weekends and holidays)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        6, 7, 8, 9, 10,     // Week 1: Jan 6-10 (back from break)
        13, 14, 15, 16, 17, // Week 2: Jan 13-17
        20, 21, 22, 23, 24, // Week 3: Jan 20-24  
        27, 28, 29, 30, 31  // Week 4: Jan 27-31
      ];
      return new Date(`2026-01-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: January 6-10 - Back to School, Addition/Subtraction Within 20
    lessons.push({
      title: 'Welcome Back Math Review',
      titleFr: 'Révision mathématiques retour',
      date: getSchoolDay(0),
      mindsOn: 'Fun math warm-ups reviewing December strategies',
      mindsOnFr: 'Échauffements maths amusants révisant stratégies décembre',
      action: 'Review addition and subtraction strategies with games and centers',
      actionFr: 'Réviser stratégies addition soustraction avec jeux et centres',
      consolidation: 'Share favorite strategies, set January math goals',
      consolidationFr: 'Partager stratégies favorites, fixer objectifs janvier',
      frenchConnection: 'New Year vocabulary: "nouvelle année", "objectifs", "recommencer"'
    });
    
    lessons.push({
      title: 'Adding Within 20',
      titleFr: 'Additionner jusqu\'à 20',
      date: getSchoolDay(1),
      mindsOn: 'Use base-10 blocks to represent teen numbers',
      mindsOnFr: 'Utiliser blocs base-10 pour représenter nombres adolescents',
      action: 'Practice addition resulting in numbers 11-20, multiple strategies',
      actionFr: 'Pratiquer addition donnant nombres 11-20, stratégies multiples',
      consolidation: 'Strategy choice discussion, efficient methods',
      consolidationFr: 'Discussion choix stratégies, méthodes efficaces',
      frenchConnection: 'Teen number fluency: "dix-sept", "dix-huit", "dix-neuf", "vingt"'
    });
    
    lessons.push({
      title: 'Subtracting Within 20',
      titleFr: 'Soustraire jusqu\'à 20',
      date: getSchoolDay(2),
      mindsOn: 'Start with teen numbers, subtract single digits',
      mindsOnFr: 'Commencer nombres adolescents, soustraire chiffres simples',
      action: 'Practice subtraction from teen numbers, counting back and up',
      actionFr: 'Pratiquer soustraction nombres adolescents, compter arrière et avant',
      consolidation: 'Compare counting back vs counting up strategies',
      consolidationFr: 'Comparer stratégies compter arrière vs compter avant',
      frenchConnection: 'Subtraction from teens: "dix-huit moins cinq égale treize"'
    });
    
    lessons.push({
      title: 'Missing Number Problems',
      titleFr: 'Problèmes nombres manquants',
      date: getSchoolDay(3),
      mindsOn: 'What number makes this equation true?',
      mindsOnFr: 'Quel nombre rend cette équation vraie?',
      action: 'Solve missing addend and missing subtrahend problems',
      actionFr: 'Résoudre problèmes terme manquant et soustraction manquante',
      consolidation: 'Strategy sharing for finding missing numbers',
      consolidationFr: 'Partager stratégies pour trouver nombres manquants',
      frenchConnection: 'Question words: "quel nombre?", "combien manque?", "qu\'est-ce qui..."'
    });
    
    lessons.push({
      title: 'Two-Step Problems',
      titleFr: 'Problèmes à deux étapes',
      date: getSchoolDay(4),
      mindsOn: 'Stories that require two operations',
      mindsOnFr: 'Histoires qui nécessitent deux opérations',
      action: 'Solve multi-step problems with manipulatives and pictures',
      actionFr: 'Résoudre problèmes multi-étapes avec manipulatifs et images',
      consolidation: 'Break down problem-solving steps, create own problems',
      consolidationFr: 'Décomposer étapes résolution, créer propres problèmes',
      frenchConnection: 'Sequential language: "d\'abord", "ensuite", "puis", "finalement"'
    });
    
    // WEEK 2: January 13-17 - Fluency Development
    lessons.push({
      title: 'Math Fact Fluency',
      titleFr: 'Aisance avec les faits mathématiques',
      date: getSchoolDay(5),
      mindsOn: 'Quick mental math warm-ups, number talks',
      mindsOnFr: 'Échauffements calcul mental rapide, discussions nombres',
      action: 'Practice for automatic recall of addition/subtraction facts to 10',
      actionFr: 'Pratiquer rappel automatique faits addition/soustraction 10',
      consolidation: 'Celebrate progress, identify facts still developing',
      consolidationFr: 'Célébrer progrès, identifier faits en développement',
      frenchConnection: 'Speed practice: "rapidement", "automatiquement", "je sais que..."'
    });
    
    lessons.push({
      title: 'Doubles and Near Doubles',
      titleFr: 'Doubles et presque doubles',
      date: getSchoolDay(6),
      mindsOn: 'Explore double facts and patterns',
      mindsOnFr: 'Explorer faits doubles et motifs',
      action: 'Master doubles facts, use them for near doubles',
      actionFr: 'Maîtriser faits doubles, utiliser pour presque doubles',
      consolidation: 'Demonstrate doubles strategies, create doubles artwork',
      consolidationFr: 'Démontrer stratégies doubles, créer art doubles',
      frenchConnection: 'Doubles vocabulary: "double", "le même", "presque", "un de plus"'
    });
    
    lessons.push({
      title: 'Making Ten Strategy Advanced',
      titleFr: 'Stratégie faire dix avancée',
      date: getSchoolDay(7),
      mindsOn: 'Decompose larger addends to make 10',
      mindsOnFr: 'Décomposer grands termes pour faire 10',
      action: 'Apply making 10 strategy to addition problems beyond 10',
      actionFr: 'Appliquer stratégie faire 10 aux additions au-delà 10',
      consolidation: 'Efficiency discussion, when to use this strategy',
      consolidationFr: 'Discussion efficacité, quand utiliser cette stratégie',
      frenchConnection: 'Breaking apart: "Je casse huit en trois et cinq..."'
    });
    
    lessons.push({
      title: 'Compensation Strategy',
      titleFr: 'Stratégie compensation',
      date: getSchoolDay(8),
      mindsOn: 'Add 10, then adjust back for easier calculations',
      mindsOnFr: 'Ajouter 10, puis ajuster pour calculs plus faciles',
      action: 'Practice adding/subtracting 9 by adding/subtracting 10 then adjusting',
      actionFr: 'Pratiquer ajouter/soustraire 9 en ajoutant 10 puis ajustant',
      consolidation: 'Explain compensation thinking, compare to other strategies',
      consolidationFr: 'Expliquer pensée compensation, comparer autres stratégies',
      frenchConnection: 'Adjustment language: "j\'ajoute dix, puis j\'enlève un"'
    });
    
    lessons.push({
      title: 'Number Line Strategies',
      titleFr: 'Stratégies ligne numérique',
      date: getSchoolDay(9),
      mindsOn: 'Jump along number lines for addition and subtraction',
      mindsOnFr: 'Sauter sur lignes numériques pour addition soustraction',
      action: 'Use number lines as visual tool for calculations',
      actionFr: 'Utiliser lignes numériques comme outil visuel calculs',
      consolidation: 'Create number line posters, explain jumping strategies',
      consolidationFr: 'Créer affiches lignes numériques, expliquer stratégies',
      frenchConnection: 'Movement vocabulary: "sauter", "avancer", "reculer", "arriver à"'
    });
    
    // WEEK 3: January 20-24 - Problem Solving and Applications
    lessons.push({
      title: 'Real World Math',
      titleFr: 'Mathématiques du monde réel',
      date: getSchoolDay(10),
      mindsOn: 'Math problems from classroom and school situations',
      mindsOnFr: 'Problèmes maths situations classe et école',
      action: 'Solve authentic problems using addition and subtraction',
      actionFr: 'Résoudre problèmes authentiques utilisant addition soustraction',
      consolidation: 'Present solutions to real problems, celebrate applications',
      consolidationFr: 'Présenter solutions problèmes réels, célébrer applications',
      frenchConnection: 'Real-world contexts: "à l\'école", "dans la classe", "chez nous"'
    });
    
    lessons.push({
      title: 'Math and Money',
      titleFr: 'Mathématiques et argent',
      date: getSchoolDay(11),
      mindsOn: 'Count coins, make amounts, add coin values',
      mindsOnFr: 'Compter pièces, faire montants, additionner valeurs',
      action: 'Practice adding and subtracting with money contexts',
      actionFr: 'Pratiquer additionner soustraire contextes argent',
      consolidation: 'Money problem solving, classroom store simulation',
      consolidationFr: 'Résolution problèmes argent, simulation magasin classe',
      frenchConnection: 'Money vocabulary: "pièce", "dollar", "coûte", "change", "acheter"'
    });
    
    lessons.push({
      title: 'Time and Addition',
      titleFr: 'Temps et addition',
      date: getSchoolDay(12),
      mindsOn: 'Adding time intervals, elapsed time concepts',
      mindsOnFr: 'Ajouter intervalles temps, concepts temps écoulé',
      action: 'Solve time problems using addition (in 15-minute chunks)',
      actionFr: 'Résoudre problèmes temps utilisant addition (blocs 15 minutes)',
      consolidation: 'Create class schedule problems, time connections',
      consolidationFr: 'Créer problèmes horaire classe, connexions temps',
      frenchConnection: 'Time phrases: "dans quinze minutes", "plus tard", "après"'
    });
    
    lessons.push({
      title: 'Data and Operations',
      titleFr: 'Données et opérations',
      date: getSchoolDay(13),
      mindsOn: 'Create surveys, collect data, analyze with addition/subtraction',
      mindsOnFr: 'Créer sondages, collecter données, analyser avec operations',
      action: 'Use addition and subtraction to interpret graphs and charts',
      actionFr: 'Utiliser addition soustraction pour interpréter graphiques',
      consolidation: 'Present data findings, create math questions from graphs',
      consolidationFr: 'Présenter trouvailles données, créer questions maths graphiques',
      frenchConnection: 'Data language: "plus que", "moins que", "en tout", "différence"'
    });
    
    lessons.push({
      title: 'Estimation and Calculation',
      titleFr: 'Estimation et calcul',
      date: getSchoolDay(14),
      mindsOn: 'Estimate answers before calculating exactly',
      mindsOnFr: 'Estimer réponses avant calculer exactement',
      action: 'Practice estimation strategies, then verify with calculation',
      actionFr: 'Pratiquer stratégies estimation, puis vérifier avec calcul',
      consolidation: 'Compare estimates to actual answers, refine estimation',
      consolidationFr: 'Comparer estimations vraies réponses, raffiner estimation',
      frenchConnection: 'Estimation language: "environ", "à peu près", "proche de"'
    });
    
    // WEEK 4: January 27-31 - Unit Culmination and Assessment
    lessons.push({
      title: 'Strategy Choice',
      titleFr: 'Choix de stratégies',
      date: getSchoolDay(15),
      mindsOn: 'Which strategy works best for this problem?',
      mindsOnFr: 'Quelle stratégie marche le mieux pour ce problème?',
      action: 'Compare multiple strategies for same problems, choose efficiently',
      actionFr: 'Comparer stratégies multiples mêmes problèmes, choisir efficacement',
      consolidation: 'Strategy preference discussion, flexibility celebration',
      consolidationFr: 'Discussion préférences stratégies, célébrer flexibilité',
      frenchConnection: 'Choice language: "je préfère", "c\'est plus facile", "ça marche mieux"'
    });
    
    lessons.push({
      title: 'Math Story Creation',
      titleFr: 'Création histoires mathématiques',
      date: getSchoolDay(16),
      mindsOn: 'What makes a good math story problem?',
      mindsOnFr: 'Qu\'est-ce qui fait bon problème histoire mathématique?',
      action: 'Create and illustrate original math story problems',
      actionFr: 'Créer et illustrer problèmes histoires maths originaux',
      consolidation: 'Share stories with class, solve each other\'s problems',
      consolidationFr: 'Partager histoires avec classe, résoudre problèmes autres',
      frenchConnection: 'Story language: "il était une fois", "alors", "à la fin"'
    });
    
    lessons.push({
      title: 'Math Portfolio Conference',
      titleFr: 'Conférence portfolio mathématiques',
      date: getSchoolDay(17),
      mindsOn: 'Reflect on math growth since December',
      mindsOnFr: 'Réfléchir croissance maths depuis décembre',
      action: 'Organize math work portfolio, prepare for student-led conferences',
      actionFr: 'Organiser portfolio travail maths, préparer conférences menées élèves',
      consolidation: 'Practice explaining math thinking to others',
      consolidationFr: 'Pratiquer expliquer pensée maths aux autres',
      frenchConnection: 'Portfolio language: "mon travail", "j\'ai appris", "je peux faire"'
    });
    
    lessons.push({
      title: 'Addition and Subtraction Assessment',
      titleFr: 'Évaluation addition et soustraction',
      date: getSchoolDay(18),
      mindsOn: 'Show what you know about addition and subtraction',
      mindsOnFr: 'Montrer ce que tu sais sur addition et soustraction',
      action: 'Complete individual assessment of Unit 4 concepts and strategies',
      actionFr: 'Compléter évaluation individuelle concepts et stratégies unité 4',
      consolidation: 'Self-reflection on assessment, celebrate growth',
      consolidationFr: 'Auto-réflexion sur évaluation, célébrer croissance',
      frenchConnection: 'Assessment language: "je sais", "je peux", "j\'ai besoin d\'aide avec"'
    });
    
    lessons.push({
      title: 'Unit 4 Celebration and Preview',
      titleFr: 'Célébration unité 4 et aperçu',
      date: getSchoolDay(19),
      mindsOn: 'Celebrate mastery of addition and subtraction strategies',
      mindsOnFr: 'Célébrer maîtrise stratégies addition et soustraction',
      action: 'Math games festival, demonstrate learning to other classes',
      actionFr: 'Festival jeux maths, démontrer apprentissage autres classes',
      consolidation: 'Preview mental math strategies for February',
      consolidationFr: 'Aperçu stratégies calcul mental pour février',
      frenchConnection: 'Celebration and transition: "j\'ai réussi!", "maintenant je peux...", "prochaine étape"'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating January lesson plans in database...\n');
    
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
          
          // Learning goals emphasizing fluency and strategy choice
          learningGoals: `Students will develop fluency and strategic thinking in addition/subtraction to 20. French language integration`,
          learningGoalsFr: `Les élèves développeront l'aisance et la pensée stratégique en addition/soustraction jusqu'à 20. French language integration`,
          
          materials: JSON.stringify([
            'Base-10 blocks and tens frames',
            'Number lines (0-20)',
            'Double-sided counters',
            'Playing cards and dice',
            'Math strategy charts',
            'Addition/subtraction games',
            'Portfolio folders',
            'Assessment tools'
          ]),
          
          grouping: 'whole class number talks, small group strategy practice, individual assessment, partner games',
          
          // Advanced differentiation for developing fluency
          accommodations: JSON.stringify([
            'Concrete manipulatives available',
            'Visual strategy supports posted',
            'Extended time for processing',
            'Choice of recording methods'
          ]),
          
          modifications: JSON.stringify([
            'Focus on facts to 10 instead of 20',
            'Use calculator for verification',
            'Simplified problem contexts',
            'One strategy focus per lesson'
          ]),
          
          extensions: JSON.stringify([
            'Explore addition/subtraction beyond 20',
            'Create multi-step problems',
            'Teach strategies to younger students',
            'Investigate math patterns'
          ]),
          
          differentiationStrategies: JSON.stringify({
            fluency: 'Multiple practice opportunities with choice of difficulty',
            strategy: 'Encourage personal strategy development and choice',
            assessment: 'Various ways to demonstrate understanding',
            support: 'Flexible grouping based on current needs'
          }),
          
          // Comprehensive assessment
          assessmentType: 'formative and summative',
          assessmentNotes: 'Track strategy development, problem-solving reasoning, computational fluency, and mathematical communication in French. Document student strategy preferences and growing independence.',
          
          // Enhanced substitute support
          isSubFriendly: true,
          subNotes: 'Strategy charts posted around room. Student math portfolios organized by table. Three-part lesson template in binder. Mathematical talk prompts in French available. Emergency math games in labeled container.',
          
          // Rich cross-curricular connections

          // Pedagogical emphasis

          // Unit culmination indicators

        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations - mix of number and problem-solving
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          strand: { in: ['Nombre', 'Numératie', 'Statistiques et probabilité'] }
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
    
    console.log('\n📊 JANUARY MATH LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ January 6-31, 2026 fully planned (20 school days)');
    console.log('✅ Unit 4 "Addition et soustraction" now complete');
    console.log('✅ Addition/subtraction fluency to 20 developed');
    console.log('✅ Multiple strategy instruction and choice');
    console.log('✅ Real-world applications integrated');
    console.log('✅ Assessment and portfolio work included');
    console.log('✅ Transition to mental math strategies prepared');
    console.log('\n🎯 Students ready for Unit 5: Mental Math Strategies in February!');
    
  } catch (error) {
    console.error('❌ Error creating January lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathJanuaryLessonPlans()
  .then(() => console.log('\n🎉 January Math lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });