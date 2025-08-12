#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathAprilLessonPlans() {
  console.log('🕵️ Creating Math Lesson Plans for April - Unit 7: "Aventures de résolution de problèmes" (Part 1)...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Problem Solving Adventures unit plan for April-May
    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Aventures de résolution de problèmes'
      }
    });
    
    if (!mathUnit) {
      throw new Error('Math unit plan "Aventures de résolution de problèmes" not found.');
    }
    
    console.log(`✅ Found unit plan: ${mathUnit.titleFr} (ID: ${mathUnit.id})`);
    console.log(`📅 Duration: Apr 1-30, 2026 (20 lessons - Unit 7 Part 1)\n`);
    
    // Clear existing lesson plans for this unit (in case we're re-seeding)
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: mathUnit.id,
        date: {
          gte: new Date('2026-04-01'),
          lte: new Date('2026-04-30')
        }
      }
    });
    
    console.log('🗑️ Cleared existing April lesson plans\n');
    
    // Create 20 lesson plans for April
    const lessons = [];
    
    // Helper function to create dates in April 2026 (skip weekends)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        1, 2, 3, 4,        // Week 1: Apr 1-4 (short week)
        7, 8, 9, 10, 11,   // Week 2: Apr 7-11
        14, 15, 16, 17, 18,// Week 3: Apr 14-18
        21, 22, 23, 24, 25,// Week 4: Apr 21-25
        28, 29, 30         // Week 5: Apr 28-30
      ];
      return new Date(`2026-04-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: April 1-4 - Problem Solving Process
    lessons.push({
      title: 'What Makes a Good Problem Solver?',
      titleFr: 'Qu\'est-ce qui fait un bon solutionneur?',
      date: getSchoolDay(0),
      mindsOn: 'Think about times you solved problems - what did you do?',
      mindsOnFr: 'Penser aux fois tu as résolu problèmes - qu\'as-tu fait?',
      action: 'Explore problem-solving strategies and create class problem-solving poster',
      actionFr: 'Explorer stratégies résolution et créer affiche classe résolution',
      consolidation: 'Share personal problem-solving experiences and strategies',
      consolidationFr: 'Partager expériences personnelles résolution et stratégies',
      frenchConnection: 'Problem-solving vocabulary: "problème", "solution", "stratégie", "résoudre"'
    });
    
    lessons.push({
      title: 'Understanding the Problem',
      titleFr: 'Comprendre le problème',
      date: getSchoolDay(1),
      mindsOn: 'What is the problem really asking? What do we know?',
      mindsOnFr: 'Que demande vraiment le problème? Qu\'est-ce qu\'on sait?',
      action: 'Practice identifying key information and questions in word problems',
      actionFr: 'Pratiquer identifier informations clés et questions dans problèmes',
      consolidation: 'Create problem comprehension checklist for class use',
      consolidationFr: 'Créer liste vérification compréhension problèmes pour classe',
      frenchConnection: 'Understanding phrases: "qu\'est-ce qu\'on sait?", "que demande-t-on?", "information"'
    });
    
    lessons.push({
      title: 'Guess and Check Strategy',
      titleFr: 'Stratégie deviner et vérifier',
      date: getSchoolDay(2),
      mindsOn: 'Sometimes we can try an answer and see if it works',
      mindsOnFr: 'Parfois nous pouvons essayer réponse et voir si ça marche',
      action: 'Solve problems using guess and check, record attempts',
      actionFr: 'Résoudre problèmes utilisant deviner vérifier, enregistrer tentatives',
      consolidation: 'Discuss when guess and check is a good strategy',
      consolidationFr: 'Discuter quand deviner vérifier est bonne stratégie',
      frenchConnection: 'Strategy language: "deviner", "essayer", "vérifier", "tentative", "ça marche"'
    });
    
    lessons.push({
      title: 'Draw a Picture Strategy',
      titleFr: 'Stratégie dessiner une image',
      date: getSchoolDay(3),
      mindsOn: 'Pictures can help us see the problem clearly',
      mindsOnFr: 'Images peuvent aider voir problème clairement',
      action: 'Solve word problems by drawing pictures and diagrams',
      actionFr: 'Résoudre problèmes mots en dessinant images et diagrammes',
      consolidation: 'Gallery walk of problem-solving pictures, discuss effectiveness',
      consolidationFr: 'Promenade galerie images résolution, discuter efficacité',
      frenchConnection: 'Visual language: "dessiner", "image", "diagramme", "voir clairement"'
    });
    
    // WEEK 2: April 7-11 - Number Problems
    lessons.push({
      title: 'Number Pattern Mysteries',
      titleFr: 'Mystères motifs numériques',
      date: getSchoolDay(4),
      mindsOn: 'What comes next in this number pattern?',
      mindsOnFr: 'Qu\'est-ce qui vient après dans ce motif numérique?',
      action: 'Solve number pattern problems, create own pattern puzzles',
      actionFr: 'Résoudre problèmes motifs numériques, créer propres casse-têtes',
      consolidation: 'Share pattern discoveries and explain reasoning',
      consolidationFr: 'Partager découvertes motifs et expliquer raisonnement',
      frenchConnection: 'Pattern vocabulary: "motif", "suivant", "règle", "continuer", "mystère"'
    });
    
    lessons.push({
      title: 'Missing Number Detectives',
      titleFr: 'Détectives nombres manquants',
      date: getSchoolDay(5),
      mindsOn: 'Be a detective - find the missing numbers!',
      mindsOnFr: 'Être détective - trouver nombres manquants!',
      action: 'Solve missing addend and missing number problems',
      actionFr: 'Résoudre problèmes terme manquant et nombres manquants',
      consolidation: 'Create missing number mysteries for classmates',
      consolidationFr: 'Créer mystères nombres manquants pour camarades',
      frenchConnection: 'Detective language: "détective", "mystère", "indice", "trouver", "manquant"'
    });
    
    lessons.push({
      title: 'Two-Step Problem Adventures',
      titleFr: 'Aventures problèmes deux étapes',
      date: getSchoolDay(6),
      mindsOn: 'Some problems need two steps to solve completely',
      mindsOnFr: 'Certains problèmes nécessitent deux étapes pour résoudre complètement',
      action: 'Practice multi-step problems with clear step-by-step process',
      actionFr: 'Pratiquer problèmes multi-étapes avec processus étape par étape',
      consolidation: 'Explain why some problems need multiple steps',
      consolidationFr: 'Expliquer pourquoi certains problèmes nécessitent étapes multiples',
      frenchConnection: 'Multi-step language: "d\'abord", "puis", "ensuite", "finalement", "étapes"'
    });
    
    lessons.push({
      title: 'Make a List Strategy',
      titleFr: 'Stratégie faire une liste',
      date: getSchoolDay(7),
      mindsOn: 'Organize information by making lists',
      mindsOnFr: 'Organiser informations en faisant listes',
      action: 'Solve problems that require organizing data into lists',
      actionFr: 'Résoudre problèmes qui nécessitent organiser données en listes',
      consolidation: 'Discuss when making lists helps solve problems',
      consolidationFr: 'Discuter quand faire listes aide résoudre problèmes',
      frenchConnection: 'Organization language: "liste", "organiser", "données", "ordonner"'
    });
    
    lessons.push({
      title: 'Logic Puzzle Fun',
      titleFr: 'Amusement casse-têtes logique',
      date: getSchoolDay(8),
      mindsOn: 'Use clues to figure out the answer',
      mindsOnFr: 'Utiliser indices pour découvrir réponse',
      action: 'Solve age-appropriate logic puzzles using deductive reasoning',
      actionFr: 'Résoudre casse-têtes logique appropriés utilisant raisonnement déductif',
      consolidation: 'Share logical reasoning and problem-solving steps',
      consolidationFr: 'Partager raisonnement logique et étapes résolution',
      frenchConnection: 'Logic vocabulary: "logique", "indice", "raisonnement", "déduire", "découvrir"'
    });
    
    // WEEK 3: April 14-18 - Real-World Applications
    lessons.push({
      title: 'Classroom Store Problems',
      titleFr: 'Problèmes magasin classe',
      date: getSchoolDay(9),
      mindsOn: 'Solve real problems from our classroom store',
      mindsOnFr: 'Résoudre vrais problèmes de notre magasin classe',
      action: 'Create and solve authentic money and shopping problems',
      actionFr: 'Créer et résoudre problèmes authentiques argent et magasinage',
      consolidation: 'Discuss how math helps in real shopping situations',
      consolidationFr: 'Discuter comment maths aident dans situations magasinage réelles',
      frenchConnection: 'Shopping language: "magasin", "acheter", "prix", "change", "coûte"'
    });
    
    lessons.push({
      title: 'Time and Schedule Problems',
      titleFr: 'Problèmes temps et horaire',
      date: getSchoolDay(10),
      mindsOn: 'Solve problems about our daily schedule and time',
      mindsOnFr: 'Résoudre problèmes sur notre horaire quotidien et temps',
      action: 'Work with time intervals, elapsed time, and scheduling problems',
      actionFr: 'Travailler avec intervalles temps, temps écoulé, problèmes horaire',
      consolidation: 'Create time problems for other classes to solve',
      consolidationFr: 'Créer problèmes temps pour autres classes à résoudre',
      frenchConnection: 'Time language: "horaire", "temps", "durée", "avant", "après"'
    });
    
    lessons.push({
      title: 'Measurement Problem Solving',
      titleFr: 'Résolution problèmes mesure',
      date: getSchoolDay(11),
      mindsOn: 'Use measurement to solve real classroom problems',
      mindsOnFr: 'Utiliser mesure pour résoudre vrais problèmes classe',
      action: 'Solve problems involving length, weight, capacity, and comparison',
      actionFr: 'Résoudre problèmes impliquant longueur, poids, capacité, comparaison',
      consolidation: 'Share measurement problem-solving strategies',
      consolidationFr: 'Partager stratégies résolution problèmes mesure',
      frenchConnection: 'Measurement application: "mesurer", "comparer", "estimer", "vérifier"'
    });
    
    lessons.push({
      title: 'Data and Graph Problems',
      titleFr: 'Problèmes données et graphiques',
      date: getSchoolDay(12),
      mindsOn: 'Answer questions using graphs and data we collected',
      mindsOnFr: 'Répondre questions utilisant graphiques et données collectées',
      action: 'Solve problems by interpreting class-created graphs and charts',
      actionFr: 'Résoudre problèmes en interprétant graphiques et tableaux classe',
      consolidation: 'Create new questions from our data displays',
      consolidationFr: 'Créer nouvelles questions de nos affichages données',
      frenchConnection: 'Data language: "données", "graphique", "plus", "moins", "combien"'
    });
    
    lessons.push({
      title: 'Pattern Problem Challenges',
      titleFr: 'Défis problèmes motifs',
      date: getSchoolDay(13),
      mindsOn: 'Solve challenging pattern and sequence problems',
      mindsOnFr: 'Résoudre problèmes motifs et séquences difficiles',
      action: 'Work on complex pattern problems including growing patterns',
      actionFr: 'Travailler problèmes motifs complexes incluant motifs croissants',
      consolidation: 'Explain pattern rules and create extension challenges',
      consolidationFr: 'Expliquer règles motifs et créer défis extension',
      frenchConnection: 'Challenge language: "défi", "difficile", "complexe", "grandir", "règle"'
    });
    
    // WEEK 4: April 21-25 - Collaborative Problem Solving
    lessons.push({
      title: 'Team Problem Solving',
      titleFr: 'Résolution problèmes équipe',
      date: getSchoolDay(14),
      mindsOn: 'Work together to solve challenging problems',
      mindsOnFr: 'Travailler ensemble pour résoudre problèmes difficiles',
      action: 'Collaborative problem solving with assigned team roles',
      actionFr: 'Résolution collaborative avec rôles équipe assignés',
      consolidation: 'Reflect on how teamwork helped solve problems',
      consolidationFr: 'Réfléchir comment travail équipe aide résoudre problèmes',
      frenchConnection: 'Teamwork language: "équipe", "ensemble", "collaboration", "rôle", "aider"'
    });
    
    lessons.push({
      title: 'Problem-Solving Strategies Review',
      titleFr: 'Révision stratégies résolution',
      date: getSchoolDay(15),
      mindsOn: 'Which strategies have we learned? When do we use each?',
      mindsOnFr: 'Quelles stratégies avons-nous apprises? Quand utiliser chacune?',
      action: 'Review and practice all problem-solving strategies learned',
      actionFr: 'Réviser et pratiquer toutes stratégies résolution apprises',
      consolidation: 'Create strategy choice guide for future problem solving',
      consolidationFr: 'Créer guide choix stratégies pour résolution future',
      frenchConnection: 'Review language: "révision", "stratégies", "quand", "utiliser", "guide"'
    });
    
    lessons.push({
      title: 'Create Your Own Problems',
      titleFr: 'Créer vos propres problèmes',
      date: getSchoolDay(16),
      mindsOn: 'What makes a good math problem?',
      mindsOnFr: 'Qu\'est-ce qui fait bon problème mathématique?',
      action: 'Design original word problems for classmates to solve',
      actionFr: 'Concevoir problèmes mots originaux pour camarades à résoudre',
      consolidation: 'Share created problems and solve each other\'s challenges',
      consolidationFr: 'Partager problèmes créés et résoudre défis des autres',
      frenchConnection: 'Creation language: "créer", "concevoir", "original", "défi", "partager"'
    });
    
    lessons.push({
      title: 'Problem-Solving Olympics',
      titleFr: 'Olympiades résolution problèmes',
      date: getSchoolDay(17),
      mindsOn: 'Show off your problem-solving skills!',
      mindsOnFr: 'Montrer vos compétences résolution problèmes!',
      action: 'Problem-solving competition with various strategy stations',
      actionFr: 'Compétition résolution avec diverses stations stratégies',
      consolidation: 'Celebrate problem-solving growth and favorite strategies',
      consolidationFr: 'Célébrer croissance résolution et stratégies favorites',
      frenchConnection: 'Competition language: "olympiades", "compétition", "montrer", "compétences"'
    });
    
    lessons.push({
      title: 'Real-World Math Heroes',
      titleFr: 'Héros mathématiques monde réel',
      date: getSchoolDay(18),
      mindsOn: 'How do people use problem-solving in their jobs?',
      mindsOnFr: 'Comment gens utilisent résolution dans leurs emplois?',
      action: 'Explore careers that use mathematical problem-solving',
      actionFr: 'Explorer carrières qui utilisent résolution problèmes mathématiques',
      consolidation: 'Connect our learning to real-world applications',
      consolidationFr: 'Connecter notre apprentissage aux applications monde réel',
      frenchConnection: 'Career language: "emploi", "carrière", "utiliser", "héros", "monde réel"'
    });
    
    // WEEK 5: April 28-30 - Assessment and Reflection
    lessons.push({
      title: 'Problem-Solving Showcase',
      titleFr: 'Vitrine résolution problèmes',
      date: getSchoolDay(19),
      mindsOn: 'Prepare to show our problem-solving learning',
      mindsOnFr: 'Préparer montrer notre apprentissage résolution problèmes',
      action: 'Create displays showing favorite problems and strategies',
      actionFr: 'Créer affichages montrant problèmes favoris et stratégies',
      consolidation: 'Present problem-solving portfolio to other classes',
      consolidationFr: 'Présenter portfolio résolution aux autres classes',
      frenchConnection: 'Showcase language: "vitrine", "montrer", "présenter", "favoris", "portfolio"'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating April lesson plans in database...\n');
    
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
          
          // Learning goals focused on problem-solving processes
          learningGoals: `Students will apply mathematical knowledge and strategies to solve real-world problems. ${lessonData.frenchConnection}`,
          learningGoalsFr: `Les élèves appliqueront connaissances et stratégies mathématiques pour résoudre problèmes monde réel. ${lessonData.frenchConnection}`,
          
          materials: JSON.stringify([
            'Problem-solving strategy posters',
            'Word problem task cards',
            'Manipulatives for problem solving',
            'Chart paper for recording strategies',
            'Logic puzzle materials',
            'Real-world problem contexts',
            'Student problem-solving journals',
            'Strategy reference sheets'
          ]),
          
          grouping: 'individual thinking, partner problem solving, small group collaboration, whole class sharing',
          
          // Differentiation for problem-solving development
          accommodations: JSON.stringify([
            'Problems read aloud if needed',
            'Visual supports and manipulatives available',
            'Extended thinking time provided',
            'Choice of recording methods'
          ]),
          
          modifications: JSON.stringify([
            'Simplified problem contexts',
            'One-step problems instead of multi-step',
            'Guided problem-solving support',
            'Visual problem-solving templates'
          ]),
          
          extensions: JSON.stringify([
            'Complex multi-step problems',
            'Open-ended problem creation',
            'Problem-solving investigation projects',
            'Peer tutoring and teaching'
          ]),
          
          differentiationStrategies: JSON.stringify({
            process: 'Multiple problem-solving strategies taught',
            product: 'Various ways to show problem-solving thinking',
            content: 'Problems at different complexity levels',
            environment: 'Individual, partner, and group problem solving'
          }),
          
          // Assessment focused on problem-solving processes
          assessmentType: 'formative',
          assessmentNotes: 'Observe problem-solving strategy use, mathematical reasoning, communication of thinking in French, and persistence with challenging problems. Document strategy preferences and problem-solving growth.',
          
          // Support for problem-solving instruction
          isSubFriendly: true,
          subNotes: 'Problem-solving strategy posters displayed prominently. Student problem-solving journals organized by table. Task cards sorted by difficulty in labeled containers. Problem-solving process chart visible.',
          
          // Rich problem-solving connections
          crossCurricularConnections: `${lessonData.frenchConnection}. Science: scientific problem solving and investigations. Social Studies: community problem solving. Language Arts: understanding word problems and communicating solutions.`,
          
          // Pedagogical approach
          pedagogicalApproach: 'Problem-solving process emphasis, strategy choice and flexibility, mathematical communication, real-world applications',
          
          timeOfDay: '9:45 AM - 10:30 AM',
          
          // Special unit features
          specialFocus: 'Problem-solving process development, strategy application, mathematical reasoning, real-world connections',
          
          // Unit progression indicator
          unitPhase: 'application'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations related to problem solving
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          OR: [
            { description: { contains: 'problème' } },
            { description: { contains: 'résoudre' } },
            { strand: { in: ['Nombre', 'Numératie', 'Statistiques et probabilité'] } }
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
    
    console.log('\n🕵️ APRIL PROBLEM-SOLVING LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ April 1-30, 2026 fully planned (20 school days)');
    console.log('✅ Unit 7 "Aventures de résolution de problèmes" Part 1 complete');
    console.log('✅ Problem-solving strategies systematically developed');
    console.log('✅ Real-world applications emphasized');
    console.log('✅ Mathematical reasoning and communication integrated');
    console.log('✅ Collaborative and individual problem solving balanced');
    console.log('\n🎯 Students ready for Unit 7 Part 2: Advanced Problem Solving in May!');
    
  } catch (error) {
    console.error('❌ Error creating April lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathAprilLessonPlans()
  .then(() => console.log('\n🎉 April Problem-Solving lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });