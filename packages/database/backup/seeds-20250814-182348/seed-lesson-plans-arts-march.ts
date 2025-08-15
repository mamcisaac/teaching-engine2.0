#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsMarchLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for March - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get both unit plans (Textures/Patterns and Stories in Art)
    const texturesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les textures et les motifs'
      }
    });
    
    const storiesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les histoires dans l\'art'
      }
    });
    
    if (!texturesUnit || !storiesUnit) {
      throw new Error('Required unit plans not found.');
    }
    
    console.log(`✅ Found Textures unit: ${texturesUnit.titleFr} (ID: ${texturesUnit.id})`);
    console.log(`✅ Found Stories unit: ${storiesUnit.titleFr} (ID: ${storiesUnit.id})`);
    console.log(`📅 Duration: March 2026 (8 lessons)\n`);
    
    // Clear existing March lesson plans for both units
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: { in: [texturesUnit.id, storiesUnit.id] },
        date: {
          gte: new Date('2026-03-01'),
          lte: new Date('2026-03-31')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing March lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 8 lesson plans for March (45 minutes each)
    const lessons = [];
    
    // Helper function to create March dates
    const marDate = (day: number) => new Date(`2026-03-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: March 2-6 (2 lessons) - Completing Textures and Patterns unit
    lessons.push({
      title: 'Collaborative Texture Quilt',
      titleFr: 'Courtepointe collaborative de textures',
      date: marDate(2),
      unitPlanId: texturesUnit.id,
      learningGoals: 'Students will collaborate to create a class texture quilt, combining individual squares into a unified artwork.',
      learningGoalsFr: 'Les élèves collaboreront pour créer une courtepointe de textures de classe, combinant carrés individuels.',
      mindsOn: 'Examine traditional quilts and discuss how individual pieces create a beautiful whole',
      mindsOnFr: 'Examiner courtepointes traditionnelles et discuter comment pièces individuelles créent un beau tout',
      action: 'Create individual textured quilt squares using various materials and techniques learned this unit',
      actionFr: 'Créer carrés individuels de courtepointe texturés utilisant matériaux et techniques variés appris',
      consolidation: 'Assemble class quilt and celebrate our collaborative texture artwork',
      consolidationFr: 'Assembler courtepointe de classe et célébrer notre œuvre collaborative de textures',

      materials: ['Fabric squares', 'Various texture materials', 'Glue', 'Sewing supplies', 'Backing fabric', 'Display materials'],
      crossCurricular: 'Math: geometric shapes and patterns; Social Studies: quilting traditions; Teamwork: collaboration'
    });
    
    lessons.push({
      title: 'Pattern Mathematics',
      titleFr: 'Mathématiques des motifs',
      date: marDate(4),
      unitPlanId: texturesUnit.id,
      learningGoals: 'Students will explore the mathematical concepts in patterns through artistic creation and analysis.',
      learningGoalsFr: 'Les élèves exploreront les concepts mathématiques dans les motifs par création artistique.',
      mindsOn: 'Pattern detective work - find mathematical rules in various pattern examples',
      mindsOnFr: 'Travail de détective motifs - trouver règles mathématiques dans exemples de motifs variés',
      action: 'Create mathematical pattern art using counting, shapes, and geometric progressions',
      actionFr: 'Créer art motifs mathématiques utilisant comptage, formes et progressions géométriques',
      consolidation: 'Pattern math museum - display and explain the mathematical rules in our pattern art',
      consolidationFr: 'Musée mathématiques motifs - afficher et expliquer règles mathématiques dans notre art motifs',

      materials: ['Graph paper', 'Geometric shapes', 'Counters', 'Rulers', 'Colored pencils', 'Pattern charts'],
      crossCurricular: 'Math: pattern analysis, counting, geometry; Logic: rule identification; Problem solving'
    });
    
    // WEEK 2: March 9-13 (2 lessons) - Beginning Stories in Art unit
    lessons.push({
      title: 'Pictures Tell Stories',
      titleFr: 'Les images racontent des histoires',
      date: marDate(9),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will understand how visual images can communicate stories and emotions without words.',
      learningGoalsFr: 'Les élèves comprendront comment les images visuelles peuvent communiquer histoires et émotions.',
      mindsOn: 'Silent storytelling - examine wordless picture books and discuss what stories the images tell',
      mindsOnFr: 'Narration silencieuse - examiner livres d\'images sans mots et discuter histoires que racontent images',
      action: 'Create a series of 3 pictures that tell a simple story from beginning to end',
      actionFr: 'Créer série de 3 images qui racontent histoire simple du début à la fin',
      consolidation: 'Story gallery walk - guess the stories being told through classmates\' picture sequences',
      consolidationFr: 'Promenade galerie histoires - deviner histoires racontées par séquences images des camarades',

      materials: ['Drawing paper', 'Markers', 'Crayons', 'Wordless picture books', 'Story sequence templates'],
      crossCurricular: 'Language Arts: storytelling elements; Reading: visual literacy; Communication: non-verbal expression'
    });
    
    lessons.push({
      title: 'Character Creation Studio',
      titleFr: 'Studio de création de personnages',
      date: marDate(11),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will design original characters for their stories, focusing on visual characteristics that show personality.',
      learningGoalsFr: 'Les élèves concevront personnages originaux pour leurs histoires, se concentrant sur caractéristiques visuelles.',
      mindsOn: 'Character analysis - examine favorite storybook characters and discuss how we know their personalities',
      mindsOnFr: 'Analyse personnages - examiner personnages favoris de livres et discuter comment on connaît leurs personnalités',
      action: 'Design and draw original characters, showing their personalities through visual details',
      actionFr: 'Concevoir et dessiner personnages originaux, montrant leurs personnalités par détails visuels',
      consolidation: 'Character casting call - introduce our characters and describe their personalities',
      consolidationFr: 'Audition de personnages - présenter nos personnages et décrire leurs personnalités',

      materials: ['Drawing paper', 'Colored pencils', 'Character worksheets', 'Mirror', 'Costume props', 'Character examples'],
      crossCurricular: 'Language Arts: character development; Drama: character traits; Psychology: personality understanding'
    });
    
    // WEEK 3: March 16-20 (2 lessons) - Spring theme integration
    lessons.push({
      title: 'Spring Story Illustrations',
      titleFr: 'Illustrations d\'histoires de printemps',
      date: marDate(16),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will create illustrations that capture the essence of spring and tell stories of renewal and growth.',
      learningGoalsFr: 'Les élèves créeront illustrations qui capturent essence du printemps et racontent histoires de renouveau.',
      mindsOn: 'Spring observation walk - notice signs of spring and brainstorm spring stories',
      mindsOnFr: 'Promenade observation printemps - remarquer signes printemps et imaginer histoires printemps',
      action: 'Illustrate spring stories showing growth, renewal, baby animals, and blooming flowers',
      actionFr: 'Illustrer histoires printemps montrant croissance, renouveau, bébés animaux, fleurs qui fleurissent',
      consolidation: 'Spring story festival - share our spring illustrations and the stories they tell',
      consolidationFr: 'Festival histoires printemps - partager nos illustrations printemps et histoires qu\'elles racontent',

      materials: ['Watercolors', 'Brushes', 'Paper', 'Spring photos', 'Pressed flowers', 'Green art supplies'],
      crossCurricular: 'Science: plant growth, animal life cycles; Seasons: spring observations; Environmental awareness'
    });
    
    lessons.push({
      title: 'Easter and Spring Celebration Art',
      titleFr: 'Art de célébration de Pâques et printemps',
      date: marDate(18),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will create art that tells the story of Easter and spring celebrations in their families and communities.',
      learningGoalsFr: 'Les élèves créeront art qui raconte histoire de Pâques et célébrations printemps dans familles.',
      mindsOn: 'Share family Easter and spring traditions, look at celebration art from different cultures',
      mindsOnFr: 'Partager traditions familiales Pâques et printemps, regarder art célébration de différentes cultures',
      action: 'Create celebration story art showing personal family traditions and spring celebrations',
      actionFr: 'Créer art histoire célébration montrant traditions familiales personnelles et célébrations printemps',
      consolidation: 'Celebration story sharing - present our family celebration stories through our artwork',
      consolidationFr: 'Partage histoires célébration - présenter nos histoires célébrations familiales par nos œuvres',

      materials: ['Art supplies', 'Pastel colors', 'Egg shapes', 'Spring decorations', 'Family photos', 'Cultural examples'],
      crossCurricular: 'Social Studies: family traditions; Cultural Studies: celebration diversity; Religious Studies: Easter story'
    });
    
    // WEEK 4: March 23-27 (2 lessons) - Continuing Stories in Art
    lessons.push({
      title: 'Storytelling Through Emotions',
      titleFr: 'Raconter par les émotions',
      date: marDate(23),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will explore how facial expressions and body language in art can tell emotional stories.',
      learningGoalsFr: 'Les élèves exploreront comment expressions faciales et langage corporel dans l\'art racontent histoires émotionnelles.',
      mindsOn: 'Emotion mirror work - practice making different facial expressions and observe how they change stories',
      mindsOnFr: 'Travail miroir émotions - pratiquer différentes expressions faciales et observer changements histoires',
      action: 'Create emotion story artworks showing characters with clear expressions that tell their stories',
      actionFr: 'Créer œuvres histoire émotions montrant personnages avec expressions claires qui racontent histoires',
      consolidation: 'Emotion story theater - act out the emotions from our artworks and guess the stories',
      consolidationFr: 'Théâtre histoires émotions - jouer émotions de nos œuvres et deviner histoires',

      materials: ['Mirrors', 'Drawing materials', 'Emotion cards', 'Drama props', 'Expression examples'],
      crossCurricular: 'Drama: emotional expression; Psychology: emotions and feelings; Communication: non-verbal cues'
    });
    
    lessons.push({
      title: 'My Life Story Art',
      titleFr: 'Art de l\'histoire de ma vie',
      date: marDate(25),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will create autobiographical art that tells important stories from their own lives.',
      learningGoalsFr: 'Les élèves créeront art autobiographique qui raconte histoires importantes de leurs propres vies.',
      mindsOn: 'Memory sharing circle - share important memories and discuss what makes a memory special',
      mindsOnFr: 'Cercle de partage souvenirs - partager souvenirs importants et discuter ce qui rend souvenir spécial',
      action: 'Create personal life story artwork showing important events, people, and places in their lives',
      actionFr: 'Créer œuvre histoire vie personnelle montrant événements, personnes et lieux importants de leurs vies',
      consolidation: 'Life story gallery - present personal artworks and share what makes each story special',
      consolidationFr: 'Galerie histoires vie - présenter œuvres personnelles et partager ce qui rend chaque histoire spéciale',

      materials: ['Art paper', 'Family photos', 'Drawing supplies', 'Collage materials', 'Personal artifacts'],
      crossCurricular: 'Language Arts: autobiography; Personal Development: self-reflection; Family Studies: family importance'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating March lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: lessonData.unitPlanId,
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
          
          grouping: 'whole class discussion, individual creation, partner collaboration, group presentations and exhibitions',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Alternative communication methods for story sharing',
            'Visual supports for story sequence understanding',
            'Choice in complexity of story elements',
            'Extended time for creative development',
            'Partner support for collaborative activities',
            'Adaptive tools for fine motor challenges',
            'Flexible presentation formats for comfort'
          ]),
          
          modifications: JSON.stringify([
            'Simplified story structures for emerging learners',
            'Pre-made story templates and character outlines',
            'Guided story development with teacher support',
            'Focus on visual expression over detailed narratives',
            'Reduced expectations while maintaining creativity',
            'Alternative materials for accessibility needs',
            'Modified critique participation for individual comfort'
          ]),
          
          extensions: JSON.stringify([
            'Complex multi-part story development and illustration',
            'Research on professional illustrators and storytellers',
            'Peer mentoring in character development and storytelling',
            'Advanced artistic techniques for story illustration',
            'Leadership roles in story presentation events',
            'Cross-curricular story integration projects',
            'Independent exploration of different art mediums for storytelling'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual story supports, templates, partner collaboration, choice in expression methods',
            extension: 'Advanced storytelling, professional artist research, peer teaching, leadership opportunities',
            multiModal: 'Visual, auditory, kinesthetic, dramatic, and linguistic storytelling experiences'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: `Comprehensive assessment including: visual storytelling skill development, character creation and development abilities, emotional expression through art, personal story sharing comfort and growth, French vocabulary integration in artistic contexts, collaborative skills in group activities, presentation and communication growth`,
          
          // Cross-curricular connections

          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Complete lesson materials organized in labeled containers, visual instruction posters for each activity, French vocabulary displays with story-related terms, example artworks and stories displayed, step-by-step process charts, alternative activities for different skill levels, safety and cleanup procedures clearly posted'
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
    
    console.log('\n🎨 MARCH ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive transition and storytelling arts lessons`);
    console.log('✅ March 2-25, 2026 fully planned');
    console.log('✅ 8 lessons × 45 minutes = 6 hours of arts instruction');
    console.log('✅ Seamless transition from Textures/Patterns to Stories in Art');
    console.log('✅ Spring season and cultural celebration integration');
    console.log('✅ Personal storytelling and character development focus');
    console.log('✅ Strong cross-curricular language arts connections');
    console.log('✅ Comprehensive differentiation for all learning styles');
    console.log('✅ Sub-friendly with complete instructional support');
    console.log('\n🎉 Creative storytelling through visual art in French for March 2026!');
    
  } catch (error) {
    console.error('❌ Error creating March lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsMarchLessonPlans()
  .then(() => console.log('\n🏆 March Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });