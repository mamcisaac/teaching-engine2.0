#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathMayLessonPlans() {
  console.log('🚀 Creating Math Lesson Plans for May - Unit 7: "Aventures de résolution de problèmes" (Part 2)...\n');
  
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
    console.log(`📅 Duration: May 1-30, 2026 (20 lessons - Unit 7 Part 2)\n`);
    
    // Don't clear existing plans since this is the same unit as April
    
    // Create 20 lesson plans for May
    const lessons = [];
    
    // Helper function to create dates in May 2026 (skip weekends and May long weekend)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        1, 2,              // Week 1: May 1-2 (short week)
        5, 6, 7, 8, 9,     // Week 2: May 5-9
        12, 13, 14, 15, 16,// Week 3: May 12-16
        20, 21, 22, 23,    // Week 4: May 20-23 (May 19 long weekend)
        26, 27, 28, 29, 30 // Week 5: May 26-30
      ];
      return new Date(`2026-05-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: May 1-2 - Advanced Problem Solving
    lessons.push({
      title: 'Multi-Step Challenge Problems',
      titleFr: 'Problèmes défis multi-étapes',
      date: getSchoolDay(0),
      mindsOn: 'Ready for bigger challenges? Let\'s solve complex problems!',
      mindsOnFr: 'Prêts pour grands défis? Résolvons problèmes complexes!',
      action: 'Tackle challenging multi-step problems requiring multiple strategies',
      actionFr: 'Attaquer problèmes multi-étapes difficiles nécessitant stratégies multiples',
      consolidation: 'Share complex problem-solving journeys and breakthroughs',
      consolidationFr: 'Partager parcours résolution complexes et percées',
      frenchConnection: 'Challenge vocabulary: "défi", "complexe", "difficile", "percée", "réussir"'
    });
    
    lessons.push({
      title: 'Mathematical Investigations',
      titleFr: 'Investigations mathématiques',
      date: getSchoolDay(1),
      mindsOn: 'Investigate patterns and relationships in mathematics',
      mindsOnFr: 'Investiguer motifs et relations en mathématiques',
      action: 'Conduct open-ended mathematical investigations and explorations',
      actionFr: 'Mener investigations mathématiques ouvertes et explorations',
      consolidation: 'Document investigation findings and new discoveries',
      consolidationFr: 'Documenter trouvailles investigations et nouvelles découvertes',
      frenchConnection: 'Investigation language: "investiguer", "explorer", "découvrir", "trouvailles"'
    });
    
    // WEEK 2: May 5-9 - Problem Creation and Sharing
    lessons.push({
      title: 'Problem Authors Workshop',
      titleFr: 'Atelier auteurs problèmes',
      date: getSchoolDay(2),
      mindsOn: 'What makes a well-written math problem?',
      mindsOnFr: 'Qu\'est-ce qui fait problème mathématique bien écrit?',
      action: 'Learn problem-writing techniques and create original problems',
      actionFr: 'Apprendre techniques écriture problèmes et créer problèmes originaux',
      consolidation: 'Edit and improve problem writing with peer feedback',
      consolidationFr: 'Éditer et améliorer écriture problèmes avec rétroaction pairs',
      frenchConnection: 'Writing vocabulary: "auteur", "écrire", "original", "éditer", "améliorer"'
    });
    
    lessons.push({
      title: 'Student-Created Problem Fair',
      titleFr: 'Foire problèmes créés élèves',
      date: getSchoolDay(3),
      mindsOn: 'Share your mathematical problems with the school community',
      mindsOnFr: 'Partager vos problèmes mathématiques avec communauté école',
      action: 'Host problem fair where students present their created problems',
      actionFr: 'Organiser foire problèmes où élèves présentent problèmes créés',
      consolidation: 'Reflect on problem creation process and peer feedback',
      consolidationFr: 'Réfléchir processus création problèmes et rétroaction pairs',
      frenchConnection: 'Presentation language: "présenter", "foire", "communauté", "partager"'
    });
    
    lessons.push({
      title: 'Problem-Solving Detectives',
      titleFr: 'Détectives résolution problèmes',
      date: getSchoolDay(4),
      mindsOn: 'Solve mystery problems that require detective work',
      mindsOnFr: 'Résoudre problèmes mystères qui nécessitent travail détective',
      action: 'Work on logic and reasoning problems with missing information',
      actionFr: 'Travailler problèmes logique et raisonnement avec informations manquantes',
      consolidation: 'Explain detective reasoning and problem-solving clues',
      consolidationFr: 'Expliquer raisonnement détective et indices résolution',
      frenchConnection: 'Detective language: "mystère", "indice", "raisonnement", "déduire"'
    });
    
    lessons.push({
      title: 'Cross-Curricular Problem Solving',
      titleFr: 'Résolution problèmes interdisciplinaire',
      date: getSchoolDay(5),
      mindsOn: 'Math connects to science, social studies, and language arts',
      mindsOnFr: 'Maths connectent sciences, études sociales, et arts langage',
      action: 'Solve problems that integrate multiple subject areas',
      actionFr: 'Résoudre problèmes qui intègrent matières multiples',
      consolidation: 'Discuss how math appears in all areas of learning',
      consolidationFr: 'Discuter comment maths apparaissent dans tous domaines apprentissage',
      frenchConnection: 'Integration language: "connecter", "intégrer", "matières", "domaines"'
    });
    
    lessons.push({
      title: 'Technology Problem Solving',
      titleFr: 'Résolution problèmes technologie',
      date: getSchoolDay(6),
      mindsOn: 'Use technology tools to help solve mathematical problems',
      mindsOnFr: 'Utiliser outils technologiques pour aider résoudre problèmes mathématiques',
      action: 'Explore math apps, calculators, and digital tools for problem solving',
      actionFr: 'Explorer applications maths, calculatrices, outils numériques résolution',
      consolidation: 'Compare technology-assisted and traditional problem solving',
      consolidationFr: 'Comparer résolution assistée technologie et traditionnelle',
      frenchConnection: 'Technology vocabulary: "technologie", "numérique", "calculatrice", "application"'
    });
    
    // WEEK 3: May 12-16 - Mathematical Reasoning and Communication
    lessons.push({
      title: 'Justify Your Thinking',
      titleFr: 'Justifier votre pensée',
      date: getSchoolDay(7),
      mindsOn: 'Explain why your answer makes sense',
      mindsOnFr: 'Expliquer pourquoi votre réponse a du sens',
      action: 'Practice mathematical justification and reasoning explanations',
      actionFr: 'Pratiquer justification mathématique et explications raisonnement',
      consolidation: 'Create justification rubric for mathematical reasoning',
      consolidationFr: 'Créer rubrique justification pour raisonnement mathématique',
      frenchConnection: 'Reasoning language: "justifier", "expliquer", "sens", "raisonnement", "pourquoi"'
    });
    
    lessons.push({
      title: 'Mathematical Debates',
      titleFr: 'Débats mathématiques',
      date: getSchoolDay(8),
      mindsOn: 'Discuss different solutions and approaches respectfully',
      mindsOnFr: 'Discuter solutions et approches différentes respectueusement',
      action: 'Engage in structured mathematical debates about problem solutions',
      actionFr: 'Participer débats mathématiques structurés sur solutions problèmes',
      consolidation: 'Reflect on how mathematical discussion improves understanding',
      consolidationFr: 'Réfléchir comment discussion mathématique améliore compréhension',
      frenchConnection: 'Debate language: "débat", "discuter", "respectueusement", "opinion", "d\'accord"'
    });
    
    lessons.push({
      title: 'Visual Problem Solving',
      titleFr: 'Résolution problèmes visuels',
      date: getSchoolDay(9),
      mindsOn: 'Sometimes problems are best solved with pictures and diagrams',
      mindsOnFr: 'Parfois problèmes mieux résolus avec images et diagrammes',
      action: 'Focus on visual representation strategies for complex problems',
      actionFr: 'Concentrer stratégies représentation visuelle problèmes complexes',
      consolidation: 'Create visual problem-solving guide for future reference',
      consolidationFr: 'Créer guide résolution visuel pour référence future',
      frenchConnection: 'Visual vocabulary: "visuel", "image", "diagramme", "représentation"'
    });
    
    lessons.push({
      title: 'Pattern Investigation Projects',
      titleFr: 'Projets investigation motifs',
      date: getSchoolDay(10),
      mindsOn: 'Investigate mathematical patterns in our world',
      mindsOnFr: 'Investiguer motifs mathématiques dans notre monde',
      action: 'Conduct pattern investigations in nature, art, and architecture',
      actionFr: 'Mener investigations motifs dans nature, art, et architecture',
      consolidation: 'Present pattern findings to school community',
      consolidationFr: 'Présenter trouvailles motifs à communauté école',
      frenchConnection: 'Investigation vocabulary: "projet", "investigation", "nature", "art", "architecture"'
    });
    
    lessons.push({
      title: 'Problem-Solving Olympics Training',
      titleFr: 'Entraînement olympiades résolution',
      date: getSchoolDay(11),
      mindsOn: 'Prepare for our end-of-unit problem-solving celebration',
      mindsOnFr: 'Préparer pour notre célébration résolution fin unité',
      action: 'Practice with olympiad-style problems and team challenges',
      actionFr: 'Pratiquer avec problèmes style olympiade et défis équipe',
      consolidation: 'Strategize team approaches for collaborative problem solving',
      consolidationFr: 'Stratégiser approches équipe pour résolution collaborative',
      frenchConnection: 'Training vocabulary: "entraînement", "olympiade", "préparer", "stratégiser"'
    });
    
    // WEEK 4: May 20-23 - Real-World Applications
    lessons.push({
      title: 'Community Problem Solvers',
      titleFr: 'Solutionneurs problèmes communauté',
      date: getSchoolDay(12),
      mindsOn: 'How can we use math to help our school and community?',
      mindsOnFr: 'Comment utiliser maths pour aider notre école et communauté?',
      action: 'Identify and work on real community problems using mathematics',
      actionFr: 'Identifier et travailler vrais problèmes communauté utilisant mathématiques',
      consolidation: 'Present community problem solutions to local leaders',
      consolidationFr: 'Présenter solutions problèmes communauté aux dirigeants locaux',
      frenchConnection: 'Community language: "communauté", "aider", "dirigeants", "solutions"'
    });
    
    lessons.push({
      title: 'Environmental Math Problems',
      titleFr: 'Problèmes mathématiques environnementaux',
      date: getSchoolDay(13),
      mindsOn: 'Use math to understand and protect our environment',
      mindsOnFr: 'Utiliser maths pour comprendre et protéger notre environnement',
      action: 'Solve problems related to recycling, conservation, and sustainability',
      actionFr: 'Résoudre problèmes liés recyclage, conservation, et durabilité',
      consolidation: 'Create environmental action plan based on mathematical findings',
      consolidationFr: 'Créer plan action environnemental basé trouvailles mathématiques',
      frenchConnection: 'Environment vocabulary: "environnement", "protéger", "recyclage", "durabilité"'
    });
    
    lessons.push({
      title: 'Mathematical Career Exploration',
      titleFr: 'Exploration carrières mathématiques',
      date: getSchoolDay(14),
      mindsOn: 'What careers use the problem-solving skills we\'ve learned?',
      mindsOnFr: 'Quelles carrières utilisent compétences résolution apprises?',
      action: 'Research and role-play careers that require mathematical thinking',
      actionFr: 'Rechercher et jouer rôles carrières nécessitant pensée mathématique',
      consolidation: 'Connect our learning to future possibilities and dreams',
      consolidationFr: 'Connecter notre apprentissage aux possibilités futures et rêves',
      frenchConnection: 'Career vocabulary: "carrière", "emploi", "rechercher", "possibilités", "rêves"'
    });
    
    lessons.push({
      title: 'Family Math Night Preparation',
      titleFr: 'Préparation soirée maths famille',
      date: getSchoolDay(15),
      mindsOn: 'Share our problem-solving learning with our families',
      mindsOnFr: 'Partager notre apprentissage résolution avec nos familles',
      action: 'Prepare presentations and activities for family math night',
      actionFr: 'Préparer présentations et activités pour soirée maths famille',
      consolidation: 'Practice explaining mathematical thinking to family members',
      consolidationFr: 'Pratiquer expliquer pensée mathématique aux membres famille',
      frenchConnection: 'Family vocabulary: "famille", "soirée", "présentation", "membres", "expliquer"'
    });
    
    // WEEK 5: May 26-30 - Unit Culmination
    lessons.push({
      title: 'Problem-Solving Olympics',
      titleFr: 'Olympiades résolution problèmes',
      date: getSchoolDay(16),
      mindsOn: 'Celebrate our problem-solving journey with friendly competition',
      mindsOnFr: 'Célébrer notre parcours résolution avec compétition amicale',
      action: 'Participate in problem-solving olympics with various challenge stations',
      actionFr: 'Participer olympiades résolution avec diverses stations défis',
      consolidation: 'Celebrate problem-solving growth and team collaboration',
      consolidationFr: 'Célébrer croissance résolution et collaboration équipe',
      frenchConnection: 'Olympics vocabulary: "olympiades", "célébrer", "compétition", "amicale", "collaboration"'
    });
    
    lessons.push({
      title: 'Mathematical Autobiography',
      titleFr: 'Autobiographie mathématique',
      date: getSchoolDay(17),
      mindsOn: 'Reflect on your growth as a mathematical problem solver',
      mindsOnFr: 'Réfléchir sur votre croissance comme solutionneur problèmes mathématiques',
      action: 'Create mathematical autobiography documenting problem-solving journey',
      actionFr: 'Créer autobiographie mathématique documentant parcours résolution',
      consolidation: 'Share mathematical growth stories with classmates',
      consolidationFr: 'Partager histoires croissance mathématique avec camarades',
      frenchConnection: 'Reflection vocabulary: "autobiographie", "croissance", "parcours", "documenter"'
    });
    
    lessons.push({
      title: 'Problem-Solving Museum',
      titleFr: 'Musée résolution problèmes',
      date: getSchoolDay(18),
      mindsOn: 'Create museum displays of our best problem-solving work',
      mindsOnFr: 'Créer affichages musée de notre meilleur travail résolution',
      action: 'Curate and set up museum exhibits of problem-solving achievements',
      actionFr: 'Organiser et installer expositions musée réussites résolution',
      consolidation: 'Host museum opening for school community',
      consolidationFr: 'Organiser ouverture musée pour communauté école',
      frenchConnection: 'Museum vocabulary: "musée", "affichage", "exposition", "organiser", "ouverture"'
    });
    
    lessons.push({
      title: 'Reflecting on Problem-Solving Growth',
      titleFr: 'Réfléchir croissance résolution problèmes',
      date: getSchoolDay(19),
      mindsOn: 'How have you grown as a problem solver this year?',
      mindsOnFr: 'Comment avez-vous grandi comme solutionneur cette année?',
      action: 'Complete self-assessment and goal setting for continued growth',
      actionFr: 'Compléter auto-évaluation et fixer objectifs croissance continue',
      consolidation: 'Celebrate problem-solving achievements and set summer goals',
      consolidationFr: 'Célébrer réussites résolution et fixer objectifs été',
      frenchConnection: 'Growth vocabulary: "grandir", "auto-évaluation", "objectifs", "réussites", "été"'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating May lesson plans in database...\n');
    
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
          
          // Learning goals focused on advanced problem-solving
          learningGoals: `Students will demonstrate advanced problem-solving skills and mathematical reasoning. ${lessonData.frenchConnection}`,
          learningGoalsFr: `Les élèves démontreront compétences avancées résolution problèmes et raisonnement mathématique. ${lessonData.frenchConnection}`,
          
          materials: JSON.stringify([
            'Complex problem task cards',
            'Investigation project materials',
            'Technology tools and apps',
            'Community problem resources',
            'Portfolio and documentation materials',
            'Presentation supplies',
            'Museum display materials',
            'Assessment and reflection tools'
          ]),
          
          grouping: 'individual reflection, collaborative investigations, whole class presentations, community connections',
          
          // Advanced differentiation for sophisticated problem solving
          accommodations: JSON.stringify([
            'Multiple problem complexity levels',
            'Various presentation formats available',
            'Extended time for investigations',
            'Choice in problem types and contexts'
          ]),
          
          modifications: JSON.stringify([
            'Simplified investigation projects',
            'Structured problem-solving templates',
            'Guided reflection prompts',
            'Peer support partnerships'
          ]),
          
          extensions: JSON.stringify([
            'Independent research projects',
            'Community problem-solving leadership',
            'Mentoring younger students',
            'Advanced mathematical investigations'
          ]),
          
          differentiationStrategies: JSON.stringify({
            complexity: 'Problems range from accessible to challenging',
            choice: 'Student choice in problem types and approaches',
            support: 'Flexible grouping and mentoring opportunities',
            application: 'Real-world and cross-curricular connections'
          }),
          
          // Comprehensive assessment for unit culmination
          assessmentType: 'summative and formative',
          assessmentNotes: 'Document sophisticated problem-solving strategies, mathematical communication in French, collaborative skills, and reflection on mathematical growth. Portfolio assessment of problem-solving journey.',
          
          // Enhanced support for complex activities
          isSubFriendly: true,
          subNotes: 'Detailed activity instructions in labeled folders. Student problem-solving portfolios accessible. Technology setup instructions provided. Community contact information available for projects.',
          
          // Rich culminating connections
          crossCurricularConnections: `${lessonData.frenchConnection}. All subjects integrated through problem-solving contexts. Community connections through real-world applications. Family engagement through sharing events.`,
          
          // Advanced pedagogical approach
          pedagogicalApproach: 'Student-led investigations, authentic assessment, community connections, reflection and metacognition',
          
          timeOfDay: '9:45 AM - 10:30 AM',
          
          // Special unit features
          specialFocus: 'Advanced problem-solving, mathematical communication, real-world applications, portfolio development',
          
          // Unit culmination indicators
          unitPhase: 'culmination and reflection'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations for problem solving and communication
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1
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
    
    console.log('\n🚀 MAY ADVANCED PROBLEM-SOLVING LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ May 1-30, 2026 fully planned (20 school days)');
    console.log('✅ Unit 7 "Aventures de résolution de problèmes" Part 2 complete');
    console.log('✅ Advanced problem-solving strategies developed');
    console.log('✅ Mathematical communication and justification emphasized');
    console.log('✅ Real-world and community connections integrated');
    console.log('✅ Student investigations and presentations featured');
    console.log('✅ Portfolio development and reflection included');
    console.log('\n🎯 Students ready for Unit 8: Math Celebration in June!');
    
  } catch (error) {
    console.error('❌ Error creating May lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathMayLessonPlans()
  .then(() => console.log('\n🎉 May Advanced Problem-Solving lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });