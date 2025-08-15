#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsAprilLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for April - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Stories in Art unit plan
    const storiesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les histoires dans l\'art'
      }
    });
    
    if (!storiesUnit) {
      throw new Error('Stories in Art unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${storiesUnit.titleFr} (ID: ${storiesUnit.id})`);
    console.log(`📅 Duration: April 2026 (8 lessons)\n`);
    
    // Clear existing April lesson plans for this unit
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: storiesUnit.id,
        date: {
          gte: new Date('2026-04-01'),
          lte: new Date('2026-04-30')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing April lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 8 lesson plans for April (45 minutes each)
    const lessons = [];
    
    // Helper function to create April dates
    const aprDate = (day: number) => new Date(`2026-04-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: April 6-10 (2 lessons) - Advanced storytelling techniques
    lessons.push({
      title: 'Comic Strip Storytelling',
      titleFr: 'Narration en bandes dessinées',
      date: aprDate(6),
      learningGoals: 'Students will create sequential art in comic strip format to tell stories with beginning, middle, and end.',
      learningGoalsFr: 'Les élèves créeront art séquentiel en format bande dessinée pour raconter histoires avec début, milieu et fin.',
      mindsOn: 'Explore comic strips and graphic novels, identify story elements and visual storytelling techniques',
      mindsOnFr: 'Explorer bandes dessinées et romans graphiques, identifier éléments histoire et techniques narration visuelle',
      action: 'Create 4-panel comic strips telling original stories with characters, dialogue, and clear sequences',
      actionFr: 'Créer bandes dessinées 4 panneaux racontant histoires originales avec personnages, dialogue et séquences claires',
      consolidation: 'Comic book publishing party - bind our comic strips into a class comic book collection',
      consolidationFr: 'Fête publication bandes dessinées - relier nos bandes dessinées en collection livre classe',

      materials: ['Comic strip templates', 'Fine markers', 'Pencils', 'Rulers', 'Comic examples', 'Binding materials'],
      crossCurricular: 'Language Arts: dialogue and sequence; Reading: visual literacy; Writing: story structure'
    });
    
    lessons.push({
      title: 'Folk Tale Illustration',
      titleFr: 'Illustration de contes populaires',
      date: aprDate(8),
      learningGoals: 'Students will illustrate scenes from traditional folk tales, focusing on character and setting details.',
      learningGoalsFr: 'Les élèves illustreront scènes de contes populaires traditionnels, se concentrant sur détails personnages et décors.',
      mindsOn: 'Listen to traditional folk tales and visualize the characters, settings, and key story moments',
      mindsOnFr: 'Écouter contes populaires traditionnels et visualiser personnages, décors et moments clés histoire',
      action: 'Create detailed illustrations of favorite folk tale scenes, showing character emotions and story settings',
      actionFr: 'Créer illustrations détaillées de scènes contes populaires favoris, montrant émotions personnages et décors',
      consolidation: 'Folk tale gallery - display illustrations and retell the stories they represent',
      consolidationFr: 'Galerie contes populaires - afficher illustrations et raconter histoires qu\'elles représentent',

      materials: ['Folk tale books', 'Watercolors', 'Brushes', 'Drawing paper', 'Character reference sheets'],
      crossCurricular: 'Literature: folk tale traditions; Cultural Studies: storytelling heritage; Reading comprehension'
    });
    
    // WEEK 2: April 13-17 (2 lessons) - Community and environment stories
    lessons.push({
      title: 'Community Helper Stories',
      titleFr: 'Histoires d\'aides communautaires',
      date: aprDate(13),
      learningGoals: 'Students will create art that tells stories about community helpers and their important roles in society.',
      learningGoalsFr: 'Les élèves créeront art qui raconte histoires sur aides communautaires et leurs rôles importants.',
      mindsOn: 'Discuss community helpers we know and brainstorm stories about how they help our community',
      mindsOnFr: 'Discuter aides communautaires qu\'on connaît et imaginer histoires comment ils aident notre communauté',
      action: 'Create story artwork showing community helpers in action, with before-and-after problem-solving scenes',
      actionFr: 'Créer œuvres histoire montrant aides communautaires en action, avec scènes avant-après résolution problèmes',
      consolidation: 'Community helper appreciation day - present our artwork and thank local community helpers',
      consolidationFr: 'Journée appréciation aides communautaires - présenter nos œuvres et remercier aides communautaires locaux',

      materials: ['Drawing supplies', 'Community helper photos', 'Before/after templates', 'Thank you card materials'],
      crossCurricular: 'Social Studies: community roles; Citizenship: civic awareness; Career Education: job exploration'
    });
    
    lessons.push({
      title: 'Environmental Story Art',
      titleFr: 'Art d\'histoires environnementales',
      date: aprDate(15),
      learningGoals: 'Students will create artwork that tells stories about environmental care and nature protection.',
      learningGoalsFr: 'Les élèves créeront œuvres qui racontent histoires sur soin environnemental et protection nature.',
      mindsOn: 'Explore environmental stories - how can we show caring for Earth through our artwork?',
      mindsOnFr: 'Explorer histoires environnementales - comment montrer soin pour Terre par nos œuvres?',
      action: 'Create environmental story art showing ways to care for nature and protect our planet',
      actionFr: 'Créer art histoire environnementale montrant façons de prendre soin nature et protéger planète',
      consolidation: 'Earth Day art exhibition - display our environmental stories and make commitments to Earth care',
      consolidationFr: 'Exposition art Jour de la Terre - afficher nos histoires environnementales et prendre engagements',

      materials: ['Recycled materials', 'Natural art supplies', 'Earth-friendly paints', 'Environmental photos'],
      crossCurricular: 'Environmental Studies: Earth care; Science: ecosystems; Citizenship: environmental responsibility'
    });
    
    // WEEK 3: April 20-24 (2 lessons) - Spring and growth stories
    lessons.push({
      title: 'Garden Growth Story Series',
      titleFr: 'Série d\'histoires de croissance de jardin',
      date: aprDate(20),
      learningGoals: 'Students will create a series of artworks showing the story of plant growth from seed to flower.',
      learningGoalsFr: 'Les élèves créeront série d\'œuvres montrant histoire croissance plantes de graine à fleur.',
      mindsOn: 'Observe real seeds, seedlings, and plants to understand the growth story of plants',
      mindsOnFr: 'Observer vraies graines, semis et plantes pour comprendre histoire croissance des plantes',
      action: 'Create 4-part growth story artwork showing seed, sprout, growing plant, and full flower/plant',
      actionFr: 'Créer œuvre histoire croissance 4 parties montrant graine, pousse, plante croissante et fleur/plante complète',
      consolidation: 'Garden story exhibition - arrange our growth series to show the amazing story of plant life',
      consolidationFr: 'Exposition histoires jardin - arranger nos séries croissance pour montrer histoire incroyable vie plantes',

      materials: ['Drawing paper', 'Watercolors', 'Seeds', 'Plant specimens', 'Growth chart templates'],
      crossCurricular: 'Science: plant life cycles; Biology: growth processes; Mathematics: sequence and time'
    });
    
    lessons.push({
      title: 'Animal Family Stories',
      titleFr: 'Histoires de familles d\'animaux',
      date: aprDate(22),
      learningGoals: 'Students will create artwork telling stories about animal families and their spring babies.',
      learningGoalsFr: 'Les élèves créeront œuvres racontant histoires sur familles animales et leurs bébés de printemps.',
      mindsOn: 'Learn about spring baby animals and discuss how animal parents care for their young',
      mindsOnFr: 'Apprendre sur bébés animaux de printemps et discuter comment parents animaux prennent soin jeunes',
      action: 'Create animal family story artwork showing parent animals caring for and teaching their babies',
      actionFr: 'Créer œuvre histoire famille animale montrant parents animaux prenant soin et enseignant leurs bébés',
      consolidation: 'Animal family storytelling - present our artwork and tell the caring stories of animal families',
      consolidationFr: 'Narration familles animales - présenter nos œuvres et raconter histoires soins familles animales',

      materials: ['Animal family photos', 'Drawing supplies', 'Soft pastels', 'Animal reference books'],
      crossCurricular: 'Science: animal life cycles; Biology: animal behavior; Family Studies: caring relationships'
    });
    
    // WEEK 4: April 27-30 (2 lessons) - Creative story techniques
    lessons.push({
      title: 'Dream and Imagination Stories',
      titleFr: 'Histoires de rêves et d\'imagination',
      date: aprDate(27),
      learningGoals: 'Students will create fantastical artwork that tells stories from their dreams and imagination.',
      learningGoalsFr: 'Les élèves créeront œuvres fantastiques qui racontent histoires de leurs rêves et imagination.',
      mindsOn: 'Share dreams and imaginative ideas - what magical or fantastical stories live in our minds?',
      mindsOnFr: 'Partager rêves et idées imaginatives - quelles histoires magiques ou fantastiques vivent dans nos esprits?',
      action: 'Create dream-inspired artwork using fantastical colors, magical elements, and imaginative storytelling',
      actionFr: 'Créer œuvre inspirée rêves utilisant couleurs fantastiques, éléments magiques et narration imaginative',
      consolidation: 'Dream story sharing circle - present our imaginative artworks in a magical storytelling atmosphere',
      consolidationFr: 'Cercle partage histoires rêves - présenter nos œuvres imaginatives dans atmosphère narration magique',

      materials: ['Iridescent paints', 'Glitter', 'Metallic markers', 'Fantasy art examples', 'Dream journals'],
      crossCurricular: 'Creative Writing: imaginative stories; Psychology: dreams and creativity; Literature: fantasy genre'
    });
    
    lessons.push({
      title: 'Story Collaboration Project',
      titleFr: 'Projet de collaboration d\'histoires',
      date: aprDate(29),
      learningGoals: 'Students will work together to create a collaborative story artwork, contributing individual elements to a shared narrative.',
      learningGoalsFr: 'Les élèves travailleront ensemble pour créer œuvre histoire collaborative, contribuant éléments individuels.',
      mindsOn: 'Discuss how different artists can contribute to one big story - planning our collaborative story',
      mindsOnFr: 'Discuter comment différents artistes peuvent contribuer à une grande histoire - planifier notre histoire collaborative',
      action: 'Create individual story elements that combine into one large collaborative story mural or book',
      actionFr: 'Créer éléments histoire individuels qui se combinent en une grande murale histoire collaborative ou livre',
      consolidation: 'Story collaboration celebration - unveil our shared story artwork and celebrate teamwork',
      consolidationFr: 'Célébration collaboration histoire - dévoiler notre œuvre histoire partagée et célébrer travail équipe',

      materials: ['Large mural paper', 'Various art supplies', 'Planning sheets', 'Collaborative story template'],
      crossCurricular: 'Teamwork: collaboration skills; Communication: group planning; Leadership: shared responsibility'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating April lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: storiesUnit.id,
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
          
          grouping: 'whole class storytelling, individual artwork creation, partner collaboration, group presentations and celebrations',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Story templates and visual supports for narrative structure',
            'Choice in storytelling complexity and artistic medium',
            'Extended time for creative story development',
            'Alternative communication methods for story sharing',
            'Partner support for collaborative elements',
            'Adaptive art tools for individual motor needs',
            'Flexible participation in group storytelling activities'
          ]),
          
          modifications: JSON.stringify([
            'Simplified story structures with clear beginning-middle-end',
            'Pre-made character and setting templates',
            'Reduced narrative expectations while maintaining creativity',
            'Visual story prompts and idea generators',
            'Modified collaborative roles based on individual strengths',
            'Alternative story formats (visual only, dictated stories)',
            'Supported participation in group activities'
          ]),
          
          extensions: JSON.stringify([
            'Complex multi-layered storytelling with advanced themes',
            'Research on professional illustrators and storytelling techniques',
            'Peer mentoring in story development and artistic techniques',
            'Leadership roles in collaborative projects and presentations',
            'Cross-curricular story integration with science and social studies',
            'Independent exploration of different storytelling mediums',
            'Advanced artistic techniques for story illustration'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Story templates, visual supports, partner collaboration, choice in complexity and medium',
            extension: 'Advanced storytelling, professional research, peer mentoring, leadership opportunities',
            multiModal: 'Visual, auditory, kinesthetic, collaborative, and individual storytelling experiences'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: `Comprehensive storytelling assessment including: narrative structure understanding, character development skills, visual storytelling techniques, creative expression and imagination, French vocabulary usage in artistic contexts, collaborative skills in group projects, presentation confidence and communication growth, artistic technique development through storytelling`,
          
          // Cross-curricular connections

          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Complete storytelling materials organized with visual inventories, step-by-step instruction posters for each story technique, French vocabulary displays with storytelling terms, example story artworks and templates available, collaborative project guidelines clearly posted, alternative activities for different participation levels, celebration and presentation protocols established'
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
    
    console.log('\n🎨 APRIL ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive storytelling and illustration arts lessons`);
    console.log('✅ April 6-29, 2026 fully planned');
    console.log('✅ 8 lessons × 45 minutes = 6 hours of storytelling arts instruction');
    console.log('✅ Advanced storytelling techniques: comic strips, folk tales, collaborative stories');
    console.log('✅ Spring themes: environmental care, plant growth, animal families');
    console.log('✅ Community connections and citizenship development');
    console.log('✅ Creative imagination and fantasy story exploration');
    console.log('✅ Strong collaborative learning opportunities');
    console.log('✅ Comprehensive differentiation for all storytelling abilities');
    console.log('✅ Sub-friendly with complete instructional support materials');
    console.log('\n🎉 Advanced visual storytelling in French for April 2026!');
    
  } catch (error) {
    console.error('❌ Error creating April lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsAprilLessonPlans()
  .then(() => console.log('\n🏆 April Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });