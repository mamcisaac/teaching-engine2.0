#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsJanuaryLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for January - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Winter Celebrations Through Art unit plan
    const winterUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les célébrations d\'hiver par l\'art'
      }
    });
    
    if (!winterUnit) {
      throw new Error('Winter Celebrations unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${winterUnit.titleFr} (ID: ${winterUnit.id})`);
    console.log(`📅 Duration: January 2026 (8 lessons)\n`);
    
    // Clear existing January lesson plans for this unit
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: winterUnit.id,
        date: {
          gte: new Date('2026-01-01'),
          lte: new Date('2026-01-31')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing January lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 8 lesson plans for January (45 minutes each)
    const lessons = [];
    
    // Helper function to create January dates
    const janDate = (day: number) => new Date(`2026-01-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: January 6-10 (2 lessons) - Back from winter break
    lessons.push({
      title: 'New Year Resolution Art',
      titleFr: 'Art de résolutions du Nouvel An',
      date: janDate(6),
      learningGoals: 'Students will create visual representations of their hopes and goals for the new year through artistic expression.',
      learningGoalsFr: 'Les élèves créeront des représentations visuelles de leurs espoirs et objectifs pour la nouvelle année.',
      mindsOn: 'Share winter break experiences and discuss what we hope to learn or do this year',
      mindsOnFr: 'Partager expériences des vacances d\'hiver et discuter ce qu\'on espère apprendre cette année',
      action: 'Create "dream clouds" artwork showing personal goals using watercolors and collage techniques',
      actionFr: 'Créer œuvres "nuages de rêves" montrant objectifs personnels avec aquarelles et collage',
      consolidation: 'Goal gallery - present our dreams and encourage each other\'s aspirations',
      consolidationFr: 'Galerie d\'objectifs - présenter nos rêves et encourager les aspirations des autres',
      vocabulary: ['nouvelle année', 'résolution', 'objectif', 'rêve', 'espoir', 'apprendre', 'grandir', 'réussir'],
      materials: ['Watercolor paper', 'Watercolor paints', 'Brushes', 'Cotton balls', 'Magazines', 'Glue sticks', 'Markers'],
      crossCurricular: 'Personal Development: goal setting; French: future tense expressions; Health: positive thinking'
    });
    
    lessons.push({
      title: 'Winter Animal Art Study',
      titleFr: 'Étude artistique des animaux d\'hiver',
      date: janDate(8),
      learningGoals: 'Students will observe and recreate winter animals using various artistic techniques and learn about animal adaptations.',
      learningGoalsFr: 'Les élèves observeront et recréeront des animaux d\'hiver en utilisant diverses techniques artistiques.',
      mindsOn: 'Explore winter animal photos and videos, discuss how animals survive winter',
      mindsOnFr: 'Explorer photos et vidéos d\'animaux d\'hiver, discuter comment animaux survivent l\'hiver',
      action: 'Create winter animal art using mixed media - foxes, rabbits, owls, deer with winter coats',
      actionFr: 'Créer art d\'animaux d\'hiver avec médias mixtes - renards, lapins, chouettes, cerfs avec manteaux d\'hiver',
      consolidation: 'Winter animal parade - share our animals and their winter survival strategies',
      consolidationFr: 'Parade animaux d\'hiver - partager nos animaux et leurs stratégies de survie hivernale',
      vocabulary: ['animal', 'hiver', 'fourrure', 'survivre', 'adaptation', 'renard', 'lapin', 'chouette'],
      materials: ['Construction paper', 'Fur textured paper', 'Cotton', 'Paint', 'Pastels', 'Animal reference photos'],
      crossCurricular: 'Science: animal adaptations; Geography: Arctic animals; Biology: animal characteristics'
    });
    
    // WEEK 2: January 13-17 (2 lessons)
    lessons.push({
      title: 'Ice and Snow Printmaking',
      titleFr: 'Impression avec glace et neige',
      date: janDate(13),
      learningGoals: 'Students will explore printmaking techniques using winter materials to create unique textural artworks.',
      learningGoalsFr: 'Les élèves exploreront les techniques d\'impression en utilisant des matériaux d\'hiver.',
      mindsOn: 'Examine ice cubes with objects frozen inside, discuss textures and patterns created by freezing',
      mindsOnFr: 'Examiner glaçons avec objets gelés dedans, discuter textures et motifs créés par le gel',
      action: 'Create prints using ice blocks, salt, and paint to make unique winter texture patterns',
      actionFr: 'Créer impressions avec blocs de glace, sel et peinture pour faire motifs uniques de texture d\'hiver',
      consolidation: 'Ice print gallery - observe how melting ice creates unexpected artistic effects',
      consolidationFr: 'Galerie impressions glace - observer comment la glace qui fond crée des effets artistiques inattendus',
      vocabulary: ['impression', 'glace', 'fondre', 'motif', 'texture', 'unique', 'gel', 'cristal'],
      materials: ['Ice cubes', 'Watercolor paper', 'Liquid watercolors', 'Salt', 'Leaves/objects for freezing', 'Towels'],
      crossCurricular: 'Science: states of matter, freezing/melting; Physics: temperature effects; Chemistry: crystallization'
    });
    
    lessons.push({
      title: 'Acadian Winter Traditions Art',
      titleFr: 'Art des traditions acadiennes d\'hiver',
      date: janDate(15),
      learningGoals: 'Students will explore Acadian winter traditions through artistic creation, connecting with local cultural heritage.',
      learningGoalsFr: 'Les élèves exploreront les traditions acadiennes d\'hiver par la création artistique.',
      mindsOn: 'Learn about traditional Acadian winter activities and crafts through stories and images',
      mindsOnFr: 'Apprendre sur les activités et métiers traditionnels acadiens d\'hiver par histoires et images',
      action: 'Create traditional Acadian-inspired winter crafts - woven place mats, painted spoons, folk art',
      actionFr: 'Créer métiers traditionnels acadiens inspirés - sets de table tissés, cuillères peintes, art populaire',
      consolidation: 'Acadian winter festival - display crafts and share what we learned about Acadian culture',
      consolidationFr: 'Festival acadien d\'hiver - afficher métiers et partager ce qu\'on a appris sur culture acadienne',
      vocabulary: ['acadien', 'tradition', 'héritage', 'culture', 'métier', 'tisser', 'populaire', 'festival'],
      materials: ['Wooden spoons', 'Acrylic paint', 'Paper strips for weaving', 'Traditional patterns', 'Cultural images'],
      crossCurricular: 'Social Studies: Acadian history; Cultural Studies: local heritage; French: Acadian expressions'
    });
    
    // WEEK 3: January 20-24 (2 lessons)
    lessons.push({
      title: 'Clay Winter Sculptures',
      titleFr: 'Sculptures d\'hiver en argile',
      date: janDate(20),
      learningGoals: 'Students will explore three-dimensional art by creating winter-themed clay sculptures and learn basic clay techniques.',
      learningGoalsFr: 'Les élèves exploreront l\'art tridimensionnel en créant des sculptures d\'hiver en argile.',
      mindsOn: 'Feel and explore air-dry clay, discuss the difference between 2D and 3D art',
      mindsOnFr: 'Toucher et explorer argile qui sèche à l\'air, discuter différence entre art 2D et 3D',
      action: 'Create small winter sculptures - snowmen, winter trees, animals, or winter symbols',
      actionFr: 'Créer petites sculptures d\'hiver - bonhommes de neige, arbres d\'hiver, animaux, ou symboles d\'hiver',
      consolidation: 'Sculpture garden setup - arrange our clay pieces in a winter landscape display',
      consolidationFr: 'Installation jardin de sculptures - arranger nos pièces d\'argile dans affichage paysage d\'hiver',
      vocabulary: ['argile', 'sculpture', 'tridimensionnel', '3D', 'former', 'créer', 'sécher', 'jardin'],
      materials: ['Air-dry clay', 'Clay tools', 'Water bowls', 'Protective table covers', 'Paint for finishing'],
      crossCurricular: 'Math: 3D shapes and dimensions; Science: properties of clay; Fine Motor: hand strengthening'
    });
    
    lessons.push({
      title: 'Winter Landscape Painting',
      titleFr: 'Peinture de paysage d\'hiver',
      date: janDate(22),
      learningGoals: 'Students will create winter landscape paintings using various brush techniques and color mixing for atmospheric effects.',
      learningGoalsFr: 'Les élèves créeront des peintures de paysage d\'hiver en utilisant diverses techniques de pinceau.',
      mindsOn: 'Observe winter landscape photographs and paintings, identify foreground, middle ground, background',
      mindsOnFr: 'Observer photos et peintures de paysages d\'hiver, identifier premier plan, plan moyen, arrière-plan',
      action: 'Paint winter landscapes using sponges for trees, brush techniques for snow, and color blending',
      actionFr: 'Peindre paysages d\'hiver avec éponges pour arbres, techniques pinceau pour neige, mélange couleurs',
      consolidation: 'Landscape exhibition - create a winter art gallery with artist statements',
      consolidationFr: 'Exposition paysages - créer galerie d\'art d\'hiver avec déclarations d\'artiste',
      vocabulary: ['paysage', 'premier plan', 'arrière-plan', 'pinceau', 'éponge', 'mélanger', 'atmosphère'],
      materials: ['Canvas boards', 'Acrylic paints', 'Various brushes', 'Sponges', 'Palette paper', 'Water containers'],
      crossCurricular: 'Geography: landscape features; Science: weather and seasons; Art History: landscape painting'
    });
    
    // WEEK 4: January 27-31 (2 lessons)
    lessons.push({
      title: 'Mi\'kmaq Winter Art Traditions',
      titleFr: 'Traditions artistiques mi\'kmaq d\'hiver',
      date: janDate(27),
      learningGoals: 'Students will learn about and create art inspired by Mi\'kmaq winter traditions and seasonal activities.',
      learningGoalsFr: 'Les élèves apprendront et créeront de l\'art inspiré par les traditions mi\'kmaq d\'hiver.',
      mindsOn: 'Explore Mi\'kmaq winter stories and traditional winter activities through images and narratives',
      mindsOnFr: 'Explorer histoires mi\'kmaq d\'hiver et activités traditionnelles par images et récits',
      action: 'Create art inspired by Mi\'kmaq winter symbols, stories, and traditional winter activities',
      actionFr: 'Créer art inspiré par symboles mi\'kmaq d\'hiver, histoires et activités traditionnelles d\'hiver',
      consolidation: 'Storytelling circle - share our Mi\'kmaq-inspired art and discuss what we learned',
      consolidationFr: 'Cercle de contes - partager notre art inspiré mi\'kmaq et discuter ce qu\'on a appris',
      vocabulary: ['Mi\'kmaq', 'tradition', 'symbole', 'histoire', 'activité', 'hiver', 'cercle', 'respecter'],
      materials: ['Natural materials', 'Earth-tone paints', 'Feathers', 'Traditional pattern examples', 'Natural paper'],
      crossCurricular: 'Social Studies: Indigenous cultures; History: First Nations; Respect: cultural appreciation'
    });
    
    lessons.push({
      title: 'Winter Art Portfolio Celebration',
      titleFr: 'Célébration du portfolio d\'art d\'hiver',
      date: janDate(29),
      learningGoals: 'Students will reflect on their winter art journey and prepare a celebration of their artistic growth.',
      learningGoalsFr: 'Les élèves réfléchiront sur leur parcours artistique d\'hiver et prépareront une célébration.',
      mindsOn: 'Review all winter artwork from December and January, select favorites and discuss growth',
      mindsOnFr: 'Réviser toutes les œuvres d\'hiver de décembre et janvier, sélectionner favoris et discuter croissance',
      action: 'Organize winter art portfolios and create exhibition labels with artist statements',
      actionFr: 'Organiser portfolios art d\'hiver et créer étiquettes exposition avec déclarations d\'artiste',
      consolidation: 'Winter art celebration - invite families to view our winter art exhibition',
      consolidationFr: 'Célébration art d\'hiver - inviter familles à voir notre exposition d\'art d\'hiver',
      vocabulary: ['portfolio', 'exposition', 'célébration', 'croissance', 'fier', 'famille', 'partager', 'réussir'],
      materials: ['Portfolio folders', 'Exhibition labels', 'Display boards', 'Reflection sheets', 'Celebration supplies'],
      crossCurricular: 'Language Arts: written reflection; Self-Assessment: growth documentation; Public Speaking: presentations'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating January lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: winterUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // All lessons are 45 minutes
          grade: 1,
          subject: 'Arts visuels',
          language: 'fr',
          
          // Three-part lesson structure
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals
          learningGoals: lessonData.learningGoals,
          learningGoalsFr: lessonData.learningGoalsFr,
          
          materials: JSON.stringify(lessonData.materials),
          
          keyVocabulary: JSON.stringify(lessonData.vocabulary),
          
          grouping: 'whole class exploration, individual creation, partner sharing, group exhibitions',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Adapted art tools for varying motor skills',
            'Choice in artistic complexity and techniques',
            'Extended time for creation and exploration',
            'Visual instruction cards and step-by-step guides',
            'Partner or peer support system',
            'Alternative materials for sensitivities'
          ]),
          
          modifications: JSON.stringify([
            'Simplified artistic techniques for emerging learners',
            'Pre-prepared materials and templates available',
            'Hand-over-hand guidance for fine motor support',
            'Focus on creative process over finished product',
            'Alternative expression methods for different abilities',
            'Reduced project scope while maintaining creativity'
          ]),
          
          extensions: JSON.stringify([
            'Advanced artistic techniques and skill development',
            'Cultural and historical research projects',
            'Peer teaching and mentoring opportunities',
            'Multiple variations and experimental approaches',
            'Leadership roles in gallery organization',
            'Cross-curricular integration projects'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual aids, adapted tools, step-by-step guidance, template options, peer partnerships',
            extension: 'Advanced techniques, cultural research, peer mentoring, experimental approaches, leadership roles',
            multiModal: 'Visual, tactile, kinesthetic, auditory, and linguistic learning experiences'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: `Comprehensive observation of: creative process development, French vocabulary usage in artistic contexts, cultural awareness and appreciation, artistic technique progression, collaborative skills, self-reflection abilities`,
          
          // Cross-curricular connections
          crossCurricularConnections: lessonData.crossCurricular,
          
          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Complete materials organized in clearly labeled bins with visual inventory, step-by-step instruction posters, French vocabulary word walls, cultural reference images displayed, cleanup procedures with visual guides, alternative activity suggestions for varying abilities'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
      
      // Link curriculum expectations (rotate through all 4)
      const expectationIndex = (lessonCount - 1) % expectations.length;
      if (expectations[expectationIndex]) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectations[expectationIndex].id
          }
        });
      }
    }
    
    console.log('\n🎨 JANUARY ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive winter arts lessons`);
    console.log('✅ January 6-29, 2026 fully planned');
    console.log('✅ 8 lessons × 45 minutes = 6 hours of winter arts instruction');
    console.log('✅ Rich cultural integration (Acadian, Mi\'kmaq traditions)');
    console.log('✅ Advanced technique introduction (clay, printmaking, landscapes)');
    console.log('✅ Strong cross-curricular connections');
    console.log('✅ Portfolio development and family celebration');
    console.log('✅ Comprehensive differentiation for all learners');
    console.log('✅ Sub-friendly with complete support materials');
    console.log('\n🎉 Cultural winter art exploration in French for January 2026!');
    
  } catch (error) {
    console.error('❌ Error creating January lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsJanuaryLessonPlans()
  .then(() => console.log('\n🏆 January Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });