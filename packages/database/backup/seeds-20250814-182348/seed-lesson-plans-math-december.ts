#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathDecemberLessonPlans() {
  console.log('🔢 Creating Math Lesson Plans for December - "Addition et soustraction"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Math unit plan for December (Addition et soustraction)
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
    console.log(`📅 Duration: Dec 1-31, 2025 (18 lessons)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: mathUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 18 lesson plans for December
    const lessons = [];
    
    // Helper function to create dates in December 2025 (skip weekends)
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        1, 2, 3, 4, 5,     // Week 1: Dec 1-5
        8, 9, 10, 11, 12,  // Week 2: Dec 8-12  
        15, 16, 17, 18, 19,// Week 3: Dec 15-19
        22, 23, 29, 30     // Week 4: Dec 22-23, 29-30 (holiday break)
      ];
      return new Date(`2025-12-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: December 1-5 - Addition Foundations
    lessons.push({
      title: 'Addition Stories',
      titleFr: 'Histoires d\'addition',
      date: getSchoolDay(0),
      mindsOn: 'Act out addition stories with classroom objects and students',
      mindsOnFr: 'Jouer histoires addition avec objets classe et élèves',
      action: 'Create concrete addition problems, use manipulatives, record with pictures',
      actionFr: 'Créer problèmes concrets, manipulatifs, enregistrer avec images',
      consolidation: 'Share addition stories, celebrate different strategies',
      consolidationFr: 'Partager histoires, célébrer stratégies différentes',
      frenchConnection: 'Addition vocabulary: "et", "plus", "font", "ensemble", "ajouter"'
    });
    
    lessons.push({
      title: 'Adding Within 5',
      titleFr: 'Additionner jusqu\'à 5',
      date: getSchoolDay(1),
      mindsOn: 'Review number bonds to 5, finger counting games',
      mindsOnFr: 'Réviser liens numériques 5, jeux comptage doigts',
      action: 'Practice all combinations that make 5, use double-sided counters',
      actionFr: 'Pratiquer combinaisons qui font 5, utiliser compteurs double',
      consolidation: 'Quick recall games, number bond demonstrations',
      consolidationFr: 'Jeux rappel rapide, démonstrations liens numériques',
      frenchConnection: 'Number combinations in French: "deux et trois font cinq"'
    });
    
    lessons.push({
      title: 'Adding Within 10',
      titleFr: 'Additionner jusqu\'à 10',
      date: getSchoolDay(2),
      mindsOn: 'Ten frame activities, ways to make 10',
      mindsOnFr: 'Activités cadre dix, façons de faire 10',
      action: 'Build addition facts to 10, use ten frames and manipulatives',
      actionFr: 'Construire faits addition 10, cadres dix et manipulatifs',
      consolidation: 'Ten frame gallery walk, explain thinking strategies',
      consolidationFr: 'Promenade galerie cadres dix, expliquer stratégies',
      frenchConnection: 'Counting on in French: "sept, huit, neuf, dix"'
    });
    
    lessons.push({
      title: 'Subtraction Stories',
      titleFr: 'Histoires de soustraction',
      date: getSchoolDay(3),
      mindsOn: 'Act out taking away stories, "how many left" scenarios',
      mindsOnFr: 'Jouer histoires enlever, scénarios "combien restent"',
      action: 'Create subtraction problems with manipulatives, cross out pictures',
      actionFr: 'Créer problèmes soustraction, manipulatifs, rayer images',
      consolidation: 'Share subtraction thinking, compare strategies',
      consolidationFr: 'Partager pensée soustraction, comparer stratégies',
      frenchConnection: 'Subtraction vocabulary: "moins", "enlever", "reste", "il y a"'
    });
    
    lessons.push({
      title: 'Subtracting Within 5',
      titleFr: 'Soustraire jusqu\'à 5',
      date: getSchoolDay(4),
      mindsOn: 'Start with 5 objects, take away different amounts',
      mindsOnFr: 'Commencer avec 5 objets, enlever différentes quantités',
      action: 'Practice subtraction facts from 5, use cover-up method',
      actionFr: 'Pratiquer faits soustraction de 5, méthode couvrir',
      consolidation: 'Subtraction fact families, connection to addition',
      consolidationFr: 'Familles faits soustraction, connexion addition',
      frenchConnection: 'Fact family language: "cinq moins deux égale trois"'
    });
    
    // WEEK 2: December 8-12 - Building Fluency
    lessons.push({
      title: 'Addition and Subtraction Together',
      titleFr: 'Addition et soustraction ensemble',
      date: getSchoolDay(5),
      mindsOn: 'Mixed operation stories, real-world contexts',
      mindsOnFr: 'Histoires opérations mélangées, contextes réels',
      action: 'Solve mixed problems, identify when to add or subtract',
      actionFr: 'Résoudre problèmes mélangés, identifier quand additionner',
      consolidation: 'Strategy sharing, problem-solving celebration',
      consolidationFr: 'Partager stratégies, célébration résolution',
      frenchConnection: 'Decision language: "Je dois additionner ou soustraire?"'
    });
    
    lessons.push({
      title: 'Counting On Strategy',
      titleFr: 'Stratégie compter en continuant',
      date: getSchoolDay(6),
      mindsOn: 'Start with larger number, count on with fingers',
      mindsOnFr: 'Commencer avec grand nombre, continuer avec doigts',
      action: 'Practice counting on for addition, use number lines',
      actionFr: 'Pratiquer compter pour addition, utiliser lignes nombres',
      consolidation: 'Demonstrate counting on, explain efficiency',
      consolidationFr: 'Démontrer compter, expliquer efficacité',
      frenchConnection: 'Counting on phrases: "Je commence à sept: huit, neuf, dix"'
    });
    
    lessons.push({
      title: 'Counting Back Strategy',
      titleFr: 'Stratégie compter en reculant',
      date: getSchoolDay(7),
      mindsOn: 'Start with bigger number, count backwards',
      mindsOnFr: 'Commencer avec grand nombre, compter en arrière',
      action: 'Practice counting back for subtraction, use number lines',
      actionFr: 'Pratiquer compter arrière soustraction, lignes nombres',
      consolidation: 'Compare counting strategies, choose efficient methods',
      consolidationFr: 'Comparer stratégies comptage, choisir méthodes',
      frenchConnection: 'Counting back: "Je commence à huit: sept, six, cinq"'
    });
    
    lessons.push({
      title: 'Adding to 15',
      titleFr: 'Additionner jusqu\'à 15',
      date: getSchoolDay(8),
      mindsOn: 'Build teen numbers with base-10 blocks',
      mindsOnFr: 'Construire nombres avec blocs base-10',
      action: 'Practice addition that results in teen numbers',
      actionFr: 'Pratiquer addition qui donne nombres adolescents',
      consolidation: 'Teen number addition strategies, place value connections',
      consolidationFr: 'Stratégies addition nombres, connexions valeur position',
      frenchConnection: 'Teen numbers: "onze, douze, treize, quatorze, quinze"'
    });
    
    lessons.push({
      title: 'Making 10 Strategy',
      titleFr: 'Stratégie faire 10',
      date: getSchoolDay(9),
      mindsOn: 'Ways to decompose numbers to make 10 first',
      mindsOnFr: 'Façons décomposer nombres pour faire 10 d\'abord',
      action: 'Practice making 10 then adding more, use ten frames',
      actionFr: 'Pratiquer faire 10 puis ajouter, utiliser cadres dix',
      consolidation: 'Demonstrate making 10 strategy, celebrate efficiency',
      consolidationFr: 'Démontrer stratégie faire 10, célébrer efficacité',
      frenchConnection: 'Making 10: "Sept et trois font dix, plus deux font douze"'
    });
    
    // WEEK 3: December 15-19 - Problem Solving
    lessons.push({
      title: 'Word Problems',
      titleFr: 'Problèmes écrits',
      date: getSchoolDay(10),
      mindsOn: 'Listen to math stories, identify the question',
      mindsOnFr: 'Écouter histoires maths, identifier la question',
      action: 'Solve word problems using pictures and manipulatives',
      actionFr: 'Résoudre problèmes mots avec images et manipulatifs',
      consolidation: 'Share problem-solving strategies, create own problems',
      consolidationFr: 'Partager stratégies résolution, créer propres problèmes',
      frenchConnection: 'Problem words: "combien", "en tout", "reste", "de plus"'
    });
    
    lessons.push({
      title: 'Math Games Day',
      titleFr: 'Journée jeux mathématiques',
      date: getSchoolDay(11),
      mindsOn: 'Review favorite addition and subtraction games',
      mindsOnFr: 'Réviser jeux addition soustraction favoris',
      action: 'Play math games in stations, practice facts',
      actionFr: 'Jouer jeux maths en stations, pratiquer faits',
      consolidation: 'Share winning strategies, teach games to others',
      consolidationFr: 'Partager stratégies gagnantes, enseigner jeux',
      frenchConnection: 'Game language: "ton tour", "j\'ai gagné", "recommençons"'
    });
    
    lessons.push({
      title: 'Fact Families',
      titleFr: 'Familles de faits',
      date: getSchoolDay(12),
      mindsOn: 'Explore how addition and subtraction are connected',
      mindsOnFr: 'Explorer comment addition et soustraction sont liées',
      action: 'Create fact family triangles, find related facts',
      actionFr: 'Créer triangles familles faits, trouver faits liés',
      consolidation: 'Fact family demonstrations, explain relationships',
      consolidationFr: 'Démonstrations familles faits, expliquer relations',
      frenchConnection: 'Family relationships: "Si 3+4=7, alors 7-4=3"'
    });
    
    lessons.push({
      title: 'Adding Three Numbers',
      titleFr: 'Additionner trois nombres',
      date: getSchoolDay(13),
      mindsOn: 'Look for ways to group three numbers efficiently',
      mindsOnFr: 'Chercher façons grouper trois nombres efficacement',
      action: 'Practice adding three single digits, use grouping strategies',
      actionFr: 'Pratiquer additionner trois chiffres, stratégies groupement',
      consolidation: 'Share grouping strategies, explain thinking',
      consolidationFr: 'Partager stratégies groupement, expliquer pensée',
      frenchConnection: 'Grouping language: "D\'abord je fais... puis j\'ajoute..."'
    });
    
    lessons.push({
      title: 'Holiday Math Problems',
      titleFr: 'Problèmes mathématiques des fêtes',
      date: getSchoolDay(14),
      mindsOn: 'Holiday-themed addition and subtraction scenarios',
      mindsOnFr: 'Scénarios fêtes avec addition et soustraction',
      action: 'Solve holiday math problems, create festive displays',
      actionFr: 'Résoudre problèmes maths fêtes, créer affichages festifs',
      consolidation: 'Holiday math celebration, share problem solutions',
      consolidationFr: 'Célébration maths fêtes, partager solutions',
      frenchConnection: 'Holiday vocabulary: "cadeaux", "décorations", "biscuits"'
    });
    
    // WEEK 4: December 22-23, 29-30 - Review and Assessment
    lessons.push({
      title: 'Math Review Games',
      titleFr: 'Jeux de révision mathématiques',
      date: getSchoolDay(15),
      mindsOn: 'Fun review of all December math concepts',
      mindsOnFr: 'Révision amusante de tous les concepts décembre',
      action: 'Rotating review stations, math centers, group activities',
      actionFr: 'Stations révision rotatives, centres maths, activités groupe',
      consolidation: 'Celebrate December math learning, self-assessment',
      consolidationFr: 'Célébrer apprentissage maths décembre, auto-évaluation',
      frenchConnection: 'Review vocabulary from entire month'
    });
    
    lessons.push({
      title: 'December Math Fair',
      titleFr: 'Foire mathématiques décembre',
      date: getSchoolDay(16),
      mindsOn: 'Prepare math displays showing December learning',
      mindsOnFr: 'Préparer affichages maths montrant apprentissage décembre',
      action: 'Present math work to other classes, demonstrate strategies',
      actionFr: 'Présenter travail maths autres classes, démontrer stratégies',
      consolidation: 'Reflection on growth, goal setting for January',
      consolidationFr: 'Réflexion sur croissance, objectifs pour janvier',
      frenchConnection: 'Presentation skills in French mathematical context'
    });
    
    lessons.push({
      title: 'New Year Math Goals',
      titleFr: 'Objectifs mathématiques nouvelle année',
      date: getSchoolDay(17),
      mindsOn: 'Reflect on math growth since September',
      mindsOnFr: 'Réfléchir croissance maths depuis septembre',
      action: 'Create math learning goals for 2026, design personal math books',
      actionFr: 'Créer objectifs apprentissage maths 2026, concevoir livres maths',
      consolidation: 'Share goals with class, celebrate learning journey',
      consolidationFr: 'Partager objectifs avec classe, célébrer parcours',
      frenchConnection: 'Goal-setting language: "Je veux apprendre...", "Mon objectif..."'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating December lesson plans in database...\n');
    
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
          
          // Learning goals with French integration
          learningGoals: `Students will develop addition and subtraction strategies and fluency to 20. French language integration`,
          learningGoalsFr: `Les élèves développeront des stratégies d'addition et soustraction jusqu'à 20. French language integration`,
          
          materials: JSON.stringify([
            'Base-10 blocks',
            'Double-sided counters',
            'Ten frames',
            'Number lines',
            'Addition/subtraction charts',
            'Manipulatives (bears, cubes)',
            'Story problem cards'
          ]),
          
          grouping: 'whole class instruction, small groups, pairs, individual practice',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Concrete manipulatives for all problems',
            'Visual supports and ten frames',
            'Extra time for processing',
            'Peer support and guidance'
          ]),
          
          modifications: JSON.stringify([
            'Work with smaller number ranges (facts to 5)',
            'Use only concrete materials',
            'Simplified problem contexts',
            'Step-by-step guided practice'
          ]),
          
          extensions: JSON.stringify([
            'Explore numbers beyond 20',
            'Create own story problems',
            'Teach strategies to classmates',
            'Multi-step problems'
          ]),
          
          differentiationStrategies: JSON.stringify({
            concrete: 'Use manipulatives and hands-on materials for all concepts',
            pictorial: 'Draw pictures and use visual representations',
            abstract: 'Move to numbers and symbols when ready',
            multiSensory: 'Movement, songs, and kinesthetic learning'
          }),
          
          // Assessment aligned with Grade 1 expectations
          assessmentType: 'formative',
          assessmentNotes: 'Observe strategy development, mathematical reasoning, problem-solving approaches, and French mathematical vocabulary usage. Note progress on addition/subtraction fluency.',
          
          // Support for substitute teachers
          isSubFriendly: true,
          subNotes: 'All manipulatives organized in labeled bins. Math strategy charts posted. French vocabulary cards available. Three-part lesson structure clearly outlined.',
          
          // Indigenous and environmental connections

          // Additional metadata

        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations
      const mathExpectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Mathématiques',
          grade: 1,
          strand: { in: ['Nombre', 'Numératie'] }
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
    
    console.log('\n📊 DECEMBER MATH LESSON PLANS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans created`);
    console.log('✅ December 1-30, 2025 fully planned (18 school days)');
    console.log('✅ 45-minute lessons (9:45-10:30 AM daily)');
    console.log('✅ Concrete-Pictorial-Abstract progression');
    console.log('✅ Addition and subtraction strategies developed');
    console.log('✅ Natural French language integration');
    console.log('✅ Differentiation for all learners');
    console.log('✅ Problem-solving emphasis');
    console.log('✅ Assessment strategies embedded');
    console.log('✅ Sub-friendly with clear structures');
    console.log('\n🎯 Students will develop fluency with addition/subtraction to 20!');
    
  } catch (error) {
    console.error('❌ Error creating December lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMathDecemberLessonPlans()
  .then(() => console.log('\n🎉 December Math lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });