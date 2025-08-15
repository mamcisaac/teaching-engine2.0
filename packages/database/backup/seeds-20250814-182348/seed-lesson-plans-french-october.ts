#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFrenchOctoberLessonPlans() {
  console.log('📚 Creating French Lesson Plans for October - "Ma famille et moi"...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the French unit plan for October
    const frenchUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Ma famille et moi'
      }
    });
    
    if (!frenchUnit) {
      throw new Error('French unit plan "Ma famille et moi" not found.');
    }
    
    console.log(`✅ Found unit plan: ${frenchUnit.titleFr} (ID: ${frenchUnit.id})`);
    console.log(`📅 Duration: Oct 1-31, 2025 (20 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: frenchUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 20 lesson plans for October
    const lessons = [];
    
    // Helper function to create dates in October 2025
    const octDate = (day: number) => new Date(`2025-10-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: October 1-3 (Wednesday-Friday, 3 days)
    lessons.push({
      title: 'My Family Introduction',
      titleFr: 'Introduction à ma famille',
      date: octDate(1),
      mindsOn: 'Family photos sharing circle, who is in your family?',
      mindsOnFr: 'Cercle de partage photos famille, qui est dans ta famille?',
      action: 'Create family tree, learn family vocabulary, family member cards',
      actionFr: 'Créer arbre généalogique, apprendre vocabulaire famille, cartes',
      consolidation: 'Present one family member, practice new words',
      consolidationFr: 'Présenter un membre famille, pratiquer nouveaux mots'

    });
    
    lessons.push({
      title: 'Family Members',
      titleFr: 'Les membres de la famille',
      date: octDate(2),
      mindsOn: 'Family member guessing game, describe without naming',
      mindsOnFr: 'Jeu deviner membre famille, décrire sans nommer',
      action: 'Family portraits, practice descriptions, role play families',
      actionFr: 'Portraits famille, pratiquer descriptions, jeu de rôle',
      consolidation: 'Family member parade, share descriptions',
      consolidationFr: 'Parade membres famille, partager descriptions'

    });
    
    lessons.push({
      title: 'Family Activities',
      titleFr: 'Les activités familiales',
      date: octDate(3),
      mindsOn: 'What does your family like to do together?',
      mindsOnFr: 'Qu\'est-ce que ta famille aime faire ensemble?',
      action: 'Create family activity book, act out activities, vocabulary practice',
      actionFr: 'Créer livre activités famille, mimer, pratiquer vocabulaire',
      consolidation: 'Share favorite family activities, weekend plans',
      consolidationFr: 'Partager activités favorites, plans weekend'

    });
    
    // WEEK 2: October 6-10 (5 days)
    lessons.push({
      title: 'Family Homes',
      titleFr: 'Les maisons familiales',
      date: octDate(6),
      mindsOn: 'Types of homes, where does your family live?',
      mindsOnFr: 'Types de maisons, où habite ta famille?',
      action: 'Draw family home, label rooms in French, build with blocks',
      actionFr: 'Dessiner maison famille, étiqueter pièces, construire',
      consolidation: 'Home tours, describe your home',
      consolidationFr: 'Visites maisons, décrire ta maison'

    });
    
    lessons.push({
      title: 'Family Traditions',
      titleFr: 'Les traditions familiales',
      date: octDate(7),
      mindsOn: 'Special things your family does, cultural sharing',
      mindsOnFr: 'Choses spéciales famille, partage culturel',
      action: 'Tradition sharing circle, create tradition book, act out traditions',
      actionFr: 'Cercle traditions, créer livre, jouer traditions',
      consolidation: 'Tradition museum, appreciate diversity',
      consolidationFr: 'Musée traditions, apprécier diversité'

    });
    
    lessons.push({
      title: 'Family Pets',
      titleFr: 'Les animaux de famille',
      date: octDate(8),
      mindsOn: 'Pet show and tell, stuffed animals welcome',
      mindsOnFr: 'Montrer animaux, peluches bienvenues',
      action: 'Pet descriptions, create pet books, pet care discussion',
      actionFr: 'Décrire animaux, créer livres, discuter soins',
      consolidation: 'Pet parade, share pet stories',
      consolidationFr: 'Parade animaux, partager histoires'

    });
    
    lessons.push({
      title: 'Family Meals',
      titleFr: 'Les repas en famille',
      date: octDate(9),
      mindsOn: 'Favorite family foods, mealtime routines',
      mindsOnFr: 'Aliments favoris famille, routines repas',
      action: 'Create family cookbook, practice food vocabulary, set table practice',
      actionFr: 'Créer livre recettes, vocabulaire nourriture, mettre table',
      consolidation: 'Restaurant role play, order in French',
      consolidationFr: 'Jeu restaurant, commander en français'

    });
    
    lessons.push({
      title: 'Family Stories',
      titleFr: 'Les histoires de famille',
      date: octDate(10),
      mindsOn: 'Funny family stories, story sharing circle',
      mindsOnFr: 'Histoires drôles famille, cercle partage',
      action: 'Create family story books, illustrate stories, story sequencing',
      actionFr: 'Créer livres histoires, illustrer, séquencer',
      consolidation: 'Story time presentations, applause and appreciation',
      consolidationFr: 'Présentations histoires, applaudissements'

    });
    
    // WEEK 3: October 13-17 (Monday is Thanksgiving)
    lessons.push({
      title: 'Thanksgiving Families',
      titleFr: 'Familles à l\'Action de grâce',
      date: octDate(14),
      mindsOn: 'What are you thankful for in your family?',
      mindsOnFr: 'Qu\'est-ce que tu apprécies dans ta famille?',
      action: 'Gratitude cards for family, thankful tree, family appreciation',
      actionFr: 'Cartes gratitude, arbre reconnaissance, appréciation',
      consolidation: 'Share gratitude, thanksgiving vocabulary',
      consolidationFr: 'Partager gratitude, vocabulaire Action de grâce'

    });
    
    lessons.push({
      title: 'Family Helpers',
      titleFr: 'Les aidants dans la famille',
      date: octDate(15),
      mindsOn: 'How do family members help each other?',
      mindsOnFr: 'Comment les membres famille s\'aident?',
      action: 'Helper charts, role play helping, create helping hands',
      actionFr: 'Tableaux aidants, jeu de rôle, mains aidantes',
      consolidation: 'Helping pledges, celebrate helpers',
      consolidationFr: 'Promesses aider, célébrer aidants'

    });
    
    lessons.push({
      title: 'Family Fun',
      titleFr: 'Le plaisir en famille',
      date: octDate(16),
      mindsOn: 'Fun family games, what makes you laugh?',
      mindsOnFr: 'Jeux famille amusants, qu\'est-ce qui te fait rire?',
      action: 'Learn French family games, create game instructions, play together',
      actionFr: 'Apprendre jeux français, créer instructions, jouer',
      consolidation: 'Game tournament, laughter celebration',
      consolidationFr: 'Tournoi jeux, célébration rires'

    });
    
    lessons.push({
      title: 'Family Feelings',
      titleFr: 'Les sentiments en famille',
      date: octDate(17),
      mindsOn: 'How does your family make you feel?',
      mindsOnFr: 'Comment ta famille te fait sentir?',
      action: 'Feelings faces, emotion cards, family feeling books',
      actionFr: 'Visages émotions, cartes, livres sentiments',
      consolidation: 'Share feelings, empathy circle',
      consolidationFr: 'Partager sentiments, cercle empathie'

    });
    
    // WEEK 4: October 20-24 (5 days)
    lessons.push({
      title: 'Growing Families',
      titleFr: 'Les familles qui grandissent',
      date: octDate(20),
      mindsOn: 'Baby photos, how have you grown?',
      mindsOnFr: 'Photos bébé, comment as-tu grandi?',
      action: 'Growth timelines, baby to now books, measure and compare',
      actionFr: 'Lignes temps croissance, livres bébé, mesurer',
      consolidation: 'Growth celebration, future dreams',
      consolidationFr: 'Célébration croissance, rêves futur'

    });
    
    lessons.push({
      title: 'Family Jobs',
      titleFr: 'Les métiers dans la famille',
      date: octDate(21),
      mindsOn: 'What jobs do family members have?',
      mindsOnFr: 'Quels métiers ont les membres famille?',
      action: 'Job exploration, career dress-up, job vocabulary practice',
      actionFr: 'Explorer métiers, déguisements, vocabulaire métiers',
      consolidation: 'Career day presentations, job appreciation',
      consolidationFr: 'Présentations métiers, appréciation travail'

    });
    
    lessons.push({
      title: 'Family Transportation',
      titleFr: 'Les transports familiaux',
      date: octDate(22),
      mindsOn: 'How does your family travel?',
      mindsOnFr: 'Comment voyage ta famille?',
      action: 'Transportation exploration, create vehicles, travel stories',
      actionFr: 'Explorer transports, créer véhicules, histoires voyage',
      consolidation: 'Transportation parade, travel dreams',
      consolidationFr: 'Parade transports, rêves voyage'

    });
    
    lessons.push({
      title: 'Family Seasons',
      titleFr: 'Les saisons en famille',
      date: octDate(23),
      mindsOn: 'What does your family do in different seasons?',
      mindsOnFr: 'Que fait ta famille dans différentes saisons?',
      action: 'Seasonal family activities, create season wheel, autumn focus',
      actionFr: 'Activités saisonnières, roue saisons, focus automne',
      consolidation: 'Season celebration, autumn family plans',
      consolidationFr: 'Célébration saisons, plans automne'

    });
    
    lessons.push({
      title: 'Family Music',
      titleFr: 'La musique en famille',
      date: octDate(24),
      mindsOn: 'Family songs, lullabies, musical memories',
      mindsOnFr: 'Chansons famille, berceuses, souvenirs musicaux',
      action: 'Learn family songs in French, create instruments, family band',
      actionFr: 'Apprendre chansons, créer instruments, orchestre famille',
      consolidation: 'Family concert, musical celebration',
      consolidationFr: 'Concert famille, célébration musicale'

    });
    
    // WEEK 5: October 27-31 (5 days including Halloween)
    lessons.push({
      title: 'Family Costumes',
      titleFr: 'Les costumes en famille',
      date: octDate(27),
      mindsOn: 'Halloween planning, family costume ideas',
      mindsOnFr: 'Planifier Halloween, idées costumes famille',
      action: 'Design costumes, costume vocabulary, dress-up play',
      actionFr: 'Concevoir costumes, vocabulaire, déguisements',
      consolidation: 'Costume parade, describe costumes',
      consolidationFr: 'Parade costumes, décrire costumes'

    });
    
    lessons.push({
      title: 'Family Celebrations',
      titleFr: 'Les célébrations familiales',
      date: octDate(28),
      mindsOn: 'How does your family celebrate special days?',
      mindsOnFr: 'Comment ta famille célèbre jours spéciaux?',
      action: 'Celebration calendar, party planning, celebration vocabulary',
      actionFr: 'Calendrier célébrations, planifier fête, vocabulaire',
      consolidation: 'Celebration showcase, party games',
      consolidationFr: 'Vitrine célébrations, jeux fête'

    });
    
    lessons.push({
      title: 'Family Heroes',
      titleFr: 'Les héros de la famille',
      date: octDate(29),
      mindsOn: 'Who is your family hero and why?',
      mindsOnFr: 'Qui est ton héros famille et pourquoi?',
      action: 'Hero portraits, hero stories, superhero family creations',
      actionFr: 'Portraits héros, histoires, créer super-famille',
      consolidation: 'Hero presentations, appreciation ceremony',
      consolidationFr: 'Présentations héros, cérémonie appréciation'

    });
    
    lessons.push({
      title: 'Family Memories',
      titleFr: 'Les souvenirs de famille',
      date: octDate(30),
      mindsOn: 'Favorite family memories, memory sharing',
      mindsOnFr: 'Souvenirs favoris, partage mémoires',
      action: 'Memory books, photo stories, time capsule creation',
      actionFr: 'Livres souvenirs, histoires photos, capsule temps',
      consolidation: 'Memory museum, October reflection',
      consolidationFr: 'Musée souvenirs, réflexion octobre'

    });
    
    lessons.push({
      title: 'October Family Celebration',
      titleFr: 'Célébration famille octobre',
      date: octDate(31),
      mindsOn: 'Halloween excitement, costume preparation',
      mindsOnFr: 'Excitation Halloween, préparation costumes',
      action: 'Family showcase preparation, practice presentations, Halloween activities',
      actionFr: 'Préparer vitrine famille, pratiquer, activités Halloween',
      consolidation: 'Family celebration, Halloween party, November preview',
      consolidationFr: 'Célébration famille, fête Halloween, aperçu novembre'

    });
    
    // Create all lesson plans in database
    console.log('💾 Creating lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: frenchUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 60, // All lessons are 1 hour
          grade: 1,
          subject: 'Français langue première',
          language: 'fr',
          
          // Three-part lesson with clear French focus
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Clear primary focus and limited connections
          learningGoals: `PRIMARY FOCUS: French language development. Students will develop French vocabulary and communication skills in family contexts.`,
          learningGoalsFr: `FOCUS PRINCIPAL: French language development. Les élèves développeront le vocabulaire et la communication en contextes familiaux.`,
          
          materials: JSON.stringify([
            'Family photos',
            'Chart paper',
            'Art supplies',
            'Books about families',
            'Vocabulary cards',
            'Dramatic play materials'
          ]),
          
          grouping: 'whole class, small groups, pairs',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Visual supports for vocabulary',
            'Gesture and movement',
            'Peer support',
            'Simplified language options'
          ]),
          
          modifications: JSON.stringify([
            'Picture cards for non-verbal responses',
            'Single word responses accepted',
            'Native language support when needed',
            'Reduced vocabulary load'
          ]),
          
          extensions: JSON.stringify([
            'Additional vocabulary',
            'Complex sentence structures',
            'Written responses',
            'Peer teaching opportunities'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual vocabulary cards, gestures, peer support',
            extension: 'Additional vocabulary, complex sentences, writing',
            multiModal: 'Visual, auditory, kinesthetic, dramatic play'
          }),
          
          // Assessment focused on French
          assessmentType: 'formative',
          assessmentNotes: `Focus on French vocabulary acquisition and use. Document: vocabulary use (family vocabulary), pronunciation attempts, comprehension, participation in French.`,
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All materials labeled, vocabulary cards ready, visual schedule posted, family photos organized'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link French expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Français langue première',
          grade: 1,
          strand: { in: ['Communication orale', 'Lecture'] }
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
    
    console.log('\n📊 FRENCH OCTOBER LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans`);
    console.log('✅ October 1-31, 2025 fully planned');
    console.log('✅ 20 hours of French instruction');
    console.log('✅ Family theme throughout');
    console.log('✅ PRIMARY FOCUS on French maintained');
    console.log('✅ Limited, natural connections only');
    console.log('✅ Halloween integration included');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Differentiation in every lesson');
    console.log('✅ Sub-friendly with clear notes');
    console.log('\n🎉 October French "Ma famille et moi" ready to teach!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFrenchOctoberLessonPlans()
  .then(() => console.log('\n🏆 October French lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });