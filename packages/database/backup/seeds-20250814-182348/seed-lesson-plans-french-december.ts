#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFrenchDecemberLessonPlans() {
  console.log('🎄 Creating French Lesson Plans for December - "L\'hiver arrive"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the French long range plan
    const frenchLongRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français langue première',
        grade: 1
      }
    });
    
    if (!frenchLongRangePlan) {
      throw new Error('French long range plan not found. Please run long range plans seed first.');
    }
    
    // Get or create the French unit plan for December
    const frenchUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'L\'hiver arrive'
      }
    }) || await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: frenchLongRangePlan.id,
        title: 'Winter is Coming',
        titleFr: 'L\'hiver arrive',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-19'),
        description: 'Winter vocabulary, holiday traditions, and French celebrations',
        descriptionFr: 'Vocabulaire d\'hiver, traditions de fêtes, et célébrations françaises',
        estimatedHours: 15,
        assessmentPlan: 'Observation, oral assessments, written work samples',
        differentiationStrategies: {
          support: 'Visual aids, peer support, sentence frames',
          extension: 'Advanced vocabulary, creative writing, peer teaching'
        },
        keyVocabulary: ['hiver', 'neige', 'froid', 'fêtes', 'décembre', 'célébrer'],
        culminatingTask: 'Winter celebration with French songs and stories'
      }
    });
    
    console.log(`✅ Found/created unit plan: ${frenchUnit.titleFr} (ID: ${frenchUnit.id})`);
    console.log(`📅 Duration: Dec 1-19, 2025 (15 lessons)\n`);
    
    // Clear existing lesson plans for this unit to avoid duplicates
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: frenchUnit.id }
    });
    
    // Create 15 lesson plans for December (Dec 1-19, no school Dec 20-31)
    const lessons = [];
    
    // Helper function to create dates in December 2025
    const getSchoolDay = (dayIndex: number) => {
      const schoolDays = [
        1, 2, 3, 4, 5,      // Week 1: Dec 1-5
        8, 9, 10, 11, 12,   // Week 2: Dec 8-12
        15, 16, 17, 18, 19  // Week 3: Dec 15-19 (last day before break)
      ];
      return new Date(`2025-12-${schoolDays[dayIndex].toString().padStart(2, '0')}`);
    };
    
    // WEEK 1: December 1-5 - Winter Vocabulary and Traditions
    lessons.push({
      title: 'Winter is Coming',
      titleFr: 'L\'hiver arrive',
      date: getSchoolDay(0),
      mindsOn: 'Winter changes observation, what do you notice outside?',
      mindsOnFr: 'Observer changements hiver, que remarques-tu dehors?',
      action: 'Winter vocabulary introduction, create winter word wall, winter clothing discussion',
      actionFr: 'Introduction vocabulaire hiver, créer mur mots hiver, discuter vêtements',
      consolidation: 'Winter preparation checklist in French',
      consolidationFr: 'Liste préparation hiver en français'
    });
    
    lessons.push({
      title: 'Winter Weather',
      titleFr: 'Le temps d\'hiver',
      date: getSchoolDay(1),
      mindsOn: 'Daily weather report in French, weather predictions',
      mindsOnFr: 'Bulletin météo quotidien, prédictions météo',
      action: 'Weather vocabulary, create weather chart, weather expressions practice',
      actionFr: 'Vocabulaire météo, créer graphique météo, pratiquer expressions',
      consolidation: 'Weather reporter role play',
      consolidationFr: 'Jeu de rôle présentateur météo'
    });
    
    lessons.push({
      title: 'December Traditions',
      titleFr: 'Les traditions de décembre',
      date: getSchoolDay(2),
      mindsOn: 'Family December traditions sharing circle',
      mindsOnFr: 'Cercle partage traditions décembre famille',
      action: 'Learn about different December celebrations, vocabulary for holidays',
      actionFr: 'Apprendre différentes célébrations décembre, vocabulaire fêtes',
      consolidation: 'Create class December traditions book',
      consolidationFr: 'Créer livre traditions décembre classe'
    });
    
    lessons.push({
      title: 'Winter Stories',
      titleFr: 'Histoires d\'hiver',
      date: getSchoolDay(3),
      mindsOn: 'Predict story from winter pictures',
      mindsOnFr: 'Prédire histoire à partir images hiver',
      action: 'Read French winter story, story retelling, character discussion',
      actionFr: 'Lire histoire hiver français, raconter, discuter personnages',
      consolidation: 'Illustrate favorite story part',
      consolidationFr: 'Illustrer partie favorite histoire'
    });
    
    lessons.push({
      title: 'Winter Songs',
      titleFr: 'Chansons d\'hiver',
      date: getSchoolDay(4),
      mindsOn: 'Listen to French winter songs, identify familiar words',
      mindsOnFr: 'Écouter chansons hiver, identifier mots familiers',
      action: 'Learn new winter song, practice with movements, create verses',
      actionFr: 'Apprendre nouvelle chanson, pratiquer mouvements, créer couplets',
      consolidation: 'Winter song performance for another class',
      consolidationFr: 'Performance chanson hiver pour autre classe'
    });
    
    // WEEK 2: December 8-12 - Holiday Preparations and Writing
    lessons.push({
      title: 'Holiday Cards',
      titleFr: 'Cartes de fêtes',
      date: getSchoolDay(5),
      mindsOn: 'Examine different holiday cards, identify French greetings',
      mindsOnFr: 'Examiner cartes fêtes, identifier salutations françaises',
      action: 'Create holiday cards with French messages, practice holiday vocabulary',
      actionFr: 'Créer cartes avec messages français, pratiquer vocabulaire',
      consolidation: 'Card exchange with French greetings',
      consolidationFr: 'Échange cartes avec salutations françaises'
    });
    
    lessons.push({
      title: 'Winter Activities',
      titleFr: 'Activités d\'hiver',
      date: getSchoolDay(6),
      mindsOn: 'Brainstorm fun winter activities',
      mindsOnFr: 'Remue-méninges activités amusantes hiver',
      action: 'Learn vocabulary for winter sports and activities, create winter activity book',
      actionFr: 'Apprendre vocabulaire sports hiver, créer livre activités',
      consolidation: 'Vote for favorite winter activity in French',
      consolidationFr: 'Voter activité hiver favorite en français'
    });
    
    lessons.push({
      title: 'Gift of Words',
      titleFr: 'Le cadeau des mots',
      date: getSchoolDay(7),
      mindsOn: 'What kind words can we give as gifts?',
      mindsOnFr: 'Quels mots gentils pouvons-nous offrir?',
      action: 'Create compliment cards in French, practice giving compliments',
      actionFr: 'Créer cartes compliments, pratiquer donner compliments',
      consolidation: 'Compliment circle in French',
      consolidationFr: 'Cercle compliments en français'
    });
    
    lessons.push({
      title: 'Winter Poetry',
      titleFr: 'Poésie d\'hiver',
      date: getSchoolDay(8),
      mindsOn: 'Winter word brainstorm for poetry',
      mindsOnFr: 'Remue-méninges mots hiver pour poésie',
      action: 'Create simple winter poems, practice rhyming words, illustrate poems',
      actionFr: 'Créer poèmes simples, pratiquer rimes, illustrer',
      consolidation: 'Poetry café presentation',
      consolidationFr: 'Présentation café poésie'
    });
    
    lessons.push({
      title: 'December Memories',
      titleFr: 'Souvenirs de décembre',
      date: getSchoolDay(9),
      mindsOn: 'Share favorite December memory',
      mindsOnFr: 'Partager souvenir décembre favori',
      action: 'Write and illustrate December memory, practice past tense phrases',
      actionFr: 'Écrire illustrer souvenir, pratiquer phrases passé',
      consolidation: 'Memory museum walk',
      consolidationFr: 'Promenade musée souvenirs'
    });
    
    // WEEK 3: December 15-19 - Celebrations and Reflection
    lessons.push({
      title: 'Light Celebrations',
      titleFr: 'Célébrations de lumière',
      date: getSchoolDay(10),
      mindsOn: 'Different ways people celebrate with lights',
      mindsOnFr: 'Différentes façons célébrer avec lumières',
      action: 'Learn about light celebrations worldwide, vocabulary for celebrations',
      actionFr: 'Apprendre célébrations lumière mondiales, vocabulaire',
      consolidation: 'Create light celebration display with descriptions',
      consolidationFr: 'Créer exposition célébrations avec descriptions'
    });
    
    lessons.push({
      title: 'Winter Break Plans',
      titleFr: 'Plans vacances d\'hiver',
      date: getSchoolDay(11),
      mindsOn: 'What will you do during winter break?',
      mindsOnFr: 'Que feras-tu pendant vacances hiver?',
      action: 'Future tense practice, create winter break plan book, share plans',
      actionFr: 'Pratiquer futur, créer livre plans vacances, partager',
      consolidation: 'Winter break wishes for classmates',
      consolidationFr: 'Souhaits vacances pour camarades'
    });
    
    lessons.push({
      title: 'Thank You December',
      titleFr: 'Merci décembre',
      date: getSchoolDay(12),
      mindsOn: 'What are we thankful for this December?',
      mindsOnFr: 'De quoi sommes-nous reconnaissants ce décembre?',
      action: 'Create thank you cards in French, practice gratitude expressions',
      actionFr: 'Créer cartes merci, pratiquer expressions gratitude',
      consolidation: 'Gratitude circle in French',
      consolidationFr: 'Cercle gratitude en français'
    });
    
    lessons.push({
      title: 'Winter Concert Practice',
      titleFr: 'Pratique concert d\'hiver',
      date: getSchoolDay(13),
      mindsOn: 'Warm up voices for French songs',
      mindsOnFr: 'Échauffer voix pour chansons françaises',
      action: 'Practice winter concert songs in French, work on pronunciation',
      actionFr: 'Pratiquer chansons concert, travailler prononciation',
      consolidation: 'Dress rehearsal for families',
      consolidationFr: 'Répétition générale pour familles'
    });
    
    lessons.push({
      title: 'December Celebration',
      titleFr: 'Célébration de décembre',
      date: getSchoolDay(14),
      mindsOn: 'Reflect on December French learning',
      mindsOnFr: 'Réfléchir apprentissage français décembre',
      action: 'Winter celebration with French songs, stories, and games',
      actionFr: 'Célébration hiver avec chansons, histoires, jeux',
      consolidation: 'Happy holidays wishes in French',
      consolidationFr: 'Souhaits joyeuses fêtes en français'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating December lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: frenchUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 60, // 1 hour daily French instruction
          grade: 1,
          subject: 'Français langue première',
          language: 'fr',
          
          // Three-part lesson structure
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals
          learningGoals: `Students will develop French vocabulary and communication skills for winter and holiday contexts.`,
          learningGoalsFr: `Les élèves développeront vocabulaire et communication pour contextes hiver et fêtes.`,
          
          materials: JSON.stringify([
            'Winter vocabulary cards',
            'Holiday books in French',
            'Art supplies',
            'Chart paper',
            'French songs recordings',
            'Writing materials'
          ]),
          
          grouping: 'whole class instruction, small group activities, partner work',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Visual vocabulary supports',
            'Sentence starters',
            'Peer support',
            'Movement breaks'
          ]),
          
          modifications: JSON.stringify([
            'Simplified vocabulary',
            'Picture communication',
            'Reduced writing requirements',
            'Native language support when needed'
          ]),
          
          extensions: JSON.stringify([
            'Advanced vocabulary',
            'Creative writing projects',
            'Peer teaching',
            'Additional reading materials'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual aids, repetition, scaffolded activities',
            extension: 'Complex sentences, independent projects',
            multiModal: 'Visual, auditory, kinesthetic, dramatic activities'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observe oral French use, vocabulary acquisition, participation in activities, writing development',
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All materials in labeled bins, vocabulary cards ready, lesson plan in binder, French songs playlist available'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link French expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Français (Immersion)',
          grade: 1,
          strand: { in: ['Communication orale', 'Lecture', 'Écriture'] }
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
    
    console.log('\n🎄 DECEMBER FRENCH LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans`);
    console.log('✅ December 1-19, 2025 fully planned');
    console.log('✅ Winter and holiday themes integrated');
    console.log('✅ Daily French instruction maintained');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Full differentiation support');
    console.log('\n🎉 December French "L\'hiver arrive" ready to teach!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFrenchDecemberLessonPlans()
  .then(() => console.log('\n🏆 December French lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });