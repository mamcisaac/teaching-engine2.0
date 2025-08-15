#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsFebruaryLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for February - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Textures and Patterns unit plan
    const texturesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les textures et les motifs'
      }
    });
    
    if (!texturesUnit) {
      throw new Error('Textures and Patterns unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${texturesUnit.titleFr} (ID: ${texturesUnit.id})`);
    console.log(`📅 Duration: February 2026 (8 lessons)\n`);
    
    // Clear existing February lesson plans for this unit
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: texturesUnit.id,
        date: {
          gte: new Date('2026-02-01'),
          lte: new Date('2026-02-28')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing February lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 8 lesson plans for February (45 minutes each)
    const lessons = [];
    
    // Helper function to create February dates
    const febDate = (day: number) => new Date(`2026-02-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: February 2-6 (2 lessons) - Introduction to Textures and Patterns
    lessons.push({
      title: 'Texture Discovery Hunt',
      titleFr: 'Chasse à la découverte des textures',
      date: febDate(2),
      learningGoals: 'Students will identify, explore, and categorize different textures in their environment using multiple senses.',
      learningGoalsFr: 'Les élèves identifieront, exploreront et catégoriseront différentes textures dans leur environnement.',
      mindsOn: 'Texture mystery boxes - feel different materials without looking and describe what you feel',
      mindsOnFr: 'Boîtes mystère de texture - toucher différents matériaux sans regarder et décrire ce qu\'on ressent',
      action: 'Create texture collection books by making rubbings and collecting texture samples from around school',
      actionFr: 'Créer livres de collection de textures en faisant frottages et collectant échantillons de texture',
      consolidation: 'Texture sharing circle - present findings and create class texture vocabulary chart',
      consolidationFr: 'Cercle de partage textures - présenter découvertes et créer graphique vocabulaire textures de classe',

      materials: ['Mystery boxes', 'Various textured materials', 'Paper', 'Crayons', 'Collection bags', 'Magnifying glasses'],
      crossCurricular: 'Science: material properties; French: descriptive adjectives; Math: sorting and categorizing'
    });
    
    lessons.push({
      title: 'Pattern Recognition Adventure',
      titleFr: 'Aventure de reconnaissance des motifs',
      date: febDate(4),
      learningGoals: 'Students will identify, analyze, and create simple repeating patterns found in nature and human-made objects.',
      learningGoalsFr: 'Les élèves identifieront, analyseront et créeront des motifs répétitifs simples trouvés dans la nature.',
      mindsOn: 'Pattern scavenger hunt - find patterns in clothing, architecture, and natural objects in classroom',
      mindsOnFr: 'Chasse au trésor de motifs - trouver motifs dans vêtements, architecture et objets naturels',
      action: 'Create pattern strips using stamps, drawing, and collage to show AB, ABC, and ABCD patterns',
      actionFr: 'Créer bandes de motifs avec timbres, dessins et collage pour montrer motifs AB, ABC et ABCD',
      consolidation: 'Pattern parade - arrange our pattern strips to create a classroom pattern museum',
      consolidationFr: 'Parade de motifs - arranger nos bandes de motifs pour créer musée de motifs de classe',

      materials: ['Pattern stamps', 'Ink pads', 'Paper strips', 'Magazines', 'Glue sticks', 'Markers', 'Pattern examples'],
      crossCurricular: 'Math: pattern recognition and creation; Logic: sequence prediction; Music: rhythm patterns'
    });
    
    // WEEK 2: February 9-13 (2 lessons)
    lessons.push({
      title: 'Nature\'s Textures and Patterns',
      titleFr: 'Textures et motifs de la nature',
      date: febDate(9),
      learningGoals: 'Students will observe and recreate textures and patterns found in natural objects through artistic techniques.',
      learningGoalsFr: 'Les élèves observeront et recréeront des textures et motifs trouvés dans objets naturels.',
      mindsOn: 'Nature observation session - examine shells, pinecones, leaves, rocks with magnifying glasses',
      mindsOnFr: 'Session d\'observation nature - examiner coquilles, pommes pin, feuilles, roches avec loupes',
      action: 'Create nature-inspired texture art using leaf printing, shell stamping, and bark rubbing techniques',
      actionFr: 'Créer art texture inspiré nature avec impression feuilles, estampage coquilles, frottage écorce',
      consolidation: 'Nature texture gallery - display and discuss how nature creates beautiful patterns',
      consolidationFr: 'Galerie texture nature - afficher et discuter comment nature crée beaux motifs',

      materials: ['Natural objects', 'Paint', 'Brushes', 'Paper', 'Ink pads', 'Magnifying glasses', 'Collection trays'],
      crossCurricular: 'Science: natural science observation; Biology: plant and animal structures; Environmental education'
    });
    
    lessons.push({
      title: 'Textile Arts Exploration',
      titleFr: 'Exploration des arts textiles',
      date: febDate(11),
      learningGoals: 'Students will explore textile arts by creating woven patterns and fabric texture collages.',
      learningGoalsFr: 'Les élèves exploreront les arts textiles en créant motifs tissés et collages texture tissu.',
      mindsOn: 'Feel fabric samples and discuss how different materials create different textures and patterns',
      mindsOnFr: 'Toucher échantillons tissu et discuter comment différents matériaux créent différentes textures',
      action: 'Create simple paper weaving projects and fabric texture collages with various textile materials',
      actionFr: 'Créer projets simples tissage papier et collages texture tissu avec matériaux textiles variés',
      consolidation: 'Textile art fashion show - model and present our woven creations and fabric art',
      consolidationFr: 'Défilé art textile - modeler et présenter nos créations tissées et art tissu',

      materials: ['Paper strips', 'Fabric scraps', 'Yarn', 'Looms or cardboard', 'Scissors', 'Glue', 'Various textiles'],
      crossCurricular: 'Math: over-under patterns; History: traditional textile arts; Fine motor: weaving coordination'
    });
    
    // WEEK 3: February 16-20 (2 lessons)
    lessons.push({
      title: 'Printmaking with Textures',
      titleFr: 'Impression avec textures',
      date: febDate(16),
      learningGoals: 'Students will create original prints using various textured materials and printing techniques.',
      learningGoalsFr: 'Les élèves créeront impressions originales en utilisant matériaux texturés et techniques impression.',
      mindsOn: 'Explore different printmaking materials - sponges, textured rollers, found objects for printing',
      mindsOnFr: 'Explorer différents matériaux impression - éponges, rouleaux texturés, objets trouvés pour imprimer',
      action: 'Create texture print series using foam printing, string printing, and found object stamping',
      actionFr: 'Créer série impressions texture avec impression mousse, impression ficelle, estampage objets trouvés',
      consolidation: 'Print studio exhibition - arrange our prints to show different texture techniques',
      consolidationFr: 'Exposition studio impression - arranger nos impressions pour montrer différentes techniques texture',

      materials: ['Foam sheets', 'String', 'Found objects', 'Paint', 'Rollers', 'Paper', 'Ink pads', 'Printing press simulation'],
      crossCurricular: 'Science: pressure and transfer; Art history: printmaking traditions; Process skills: step sequences'
    });
    
    lessons.push({
      title: 'Cultural Pattern Study',
      titleFr: 'Étude de motifs culturels',
      date: febDate(18),
      learningGoals: 'Students will explore patterns from different cultures and create their own culturally-inspired pattern art.',
      learningGoalsFr: 'Les élèves exploreront motifs de différentes cultures et créeront leur propre art motifs inspiré culturellement.',
      mindsOn: 'Examine patterns from around the world - African textiles, Indigenous beadwork, Islamic geometric patterns',
      mindsOnFr: 'Examiner motifs du monde entier - textiles africains, perlage autochtone, motifs géométriques islamiques',
      action: 'Design and create cultural pattern artwork inspired by global traditions using various media',
      actionFr: 'Concevoir et créer œuvre motifs culturels inspirée par traditions mondiales avec médias variés',
      consolidation: 'World pattern festival - share our cultural pattern creations and learn about their origins',
      consolidationFr: 'Festival motifs mondiaux - partager nos créations motifs culturels et apprendre leurs origines',

      materials: ['Cultural pattern examples', 'Various art supplies', 'Geometric tools', 'Colored paper', 'Reference books'],
      crossCurricular: 'Social Studies: world cultures; Geography: global awareness; Respect: cultural appreciation'
    });
    
    // WEEK 4: February 23-27 (2 lessons)
    lessons.push({
      title: 'Mixed Media Texture Collage',
      titleFr: 'Collage texture médias mixtes',
      date: febDate(23),
      learningGoals: 'Students will combine various materials and techniques to create complex texture collages with layered effects.',
      learningGoalsFr: 'Les élèves combineront divers matériaux et techniques pour créer collages texture complexes.',
      mindsOn: 'Explore layering techniques - how different materials create depth and interest when combined',
      mindsOnFr: 'Explorer techniques superposition - comment différents matériaux créent profondeur et intérêt combinés',
      action: 'Create mixed media texture collages combining paint, fabric, paper, natural materials, and found objects',
      actionFr: 'Créer collages texture médias mixtes combinant peinture, tissu, papier, matériaux naturels, objets trouvés',
      consolidation: 'Texture art critique - discuss our mixed media pieces and describe the layering effects',
      consolidationFr: 'Critique art texture - discuter nos pièces médias mixtes et décrire effets superposition',

      materials: ['Canvas boards', 'Acrylic paint', 'Fabric pieces', 'Sand', 'Shells', 'Leaves', 'Glue medium', 'Found objects'],
      crossCurricular: 'Art criticism: analysis skills; Language arts: descriptive vocabulary; Science: material properties'
    });
    
    lessons.push({
      title: 'Pattern Design Challenge',
      titleFr: 'Défi conception de motifs',
      date: febDate(25),
      learningGoals: 'Students will design original repeating patterns and apply them to create functional art pieces.',
      learningGoalsFr: 'Les élèves concevront motifs répétitifs originaux et les appliqueront pour créer pièces art fonctionnelles.',
      mindsOn: 'Pattern design thinking - brainstorm original pattern ideas using shapes, colors, and personal symbols',
      mindsOnFr: 'Pensée conception motifs - remue-méninges idées motifs originaux avec formes, couleurs, symboles personnels',
      action: 'Design original patterns and apply them to create wrapping paper, bookmarks, or decorative borders',
      actionFr: 'Concevoir motifs originaux et les appliquer pour créer papier d\'emballage, signets, bordures décoratives',
      consolidation: 'Pattern design studio - present our original patterns and explain our design choices',
      consolidationFr: 'Studio conception motifs - présenter nos motifs originaux et expliquer nos choix de conception',

      materials: ['Paper', 'Design tools', 'Rulers', 'Stamps', 'Markers', 'Colored pencils', 'Templates', 'Examples'],
      crossCurricular: 'Math: geometric patterns; Design thinking: problem solving; Art & design: functional art'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating February lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: texturesUnit.id,
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
          
          grouping: 'whole class exploration, individual creation, partner investigations, group exhibitions and critiques',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Tactile-safe materials for sensory sensitivities',
            'Adapted tools for fine motor challenges',
            'Choice in complexity levels and techniques',
            'Extended exploration and creation time',
            'Visual instruction guides and templates',
            'Partner support for collaborative learning',
            'Alternative expression methods for different abilities'
          ]),
          
          modifications: JSON.stringify([
            'Simplified pattern sequences for emerging learners',
            'Pre-prepared texture samples and materials',
            'Hand-over-hand support for tool use and techniques',
            'Focus on exploration and discovery over finished products',
            'Reduced scope while maintaining creative expression',
            'Alternative materials for allergies or sensitivities',
            'Modified critique participation for comfort levels'
          ]),
          
          extensions: JSON.stringify([
            'Advanced pattern creation and mathematical analysis',
            'Cultural research on traditional textile and pattern arts',
            'Peer teaching of techniques and problem-solving',
            'Multiple technique combination and experimentation',
            'Leadership roles in gallery organization and critique',
            'Cross-unit connections and integrated projects',
            'Independent exploration of printmaking variations'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Sensory accommodations, adapted tools, visual guides, peer partnerships, choice in materials',
            extension: 'Advanced techniques, cultural research, peer teaching, experimental approaches, leadership roles',
            multiModal: 'Tactile, visual, kinesthetic, auditory, and linguistic learning experiences with materials'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: `Multi-faceted observation focusing on: texture and pattern recognition skills, artistic technique development, French vocabulary integration in art contexts, cultural awareness and appreciation, creative problem-solving approaches, collaborative and presentation skills, fine motor skill development through art techniques`,
          
          // Cross-curricular connections

          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Comprehensive material organization with labeled bins and visual inventory sheets, detailed step-by-step instruction posters for each technique, French vocabulary displays with visual supports, safety procedures clearly posted, cleanup protocols with student job charts, alternative activities for early finishers, cultural reference materials displayed'
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
    
    console.log('\n🎨 FEBRUARY ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive texture and pattern arts lessons`);
    console.log('✅ February 2-25, 2026 fully planned');
    console.log('✅ 8 lessons × 45 minutes = 6 hours of texture and pattern arts instruction');
    console.log('✅ Rich tactile and visual learning experiences');
    console.log('✅ Cultural pattern appreciation and respect');
    console.log('✅ Advanced techniques: printmaking, weaving, mixed media');
    console.log('✅ Strong cross-curricular math and science connections');
    console.log('✅ Comprehensive differentiation for all learning needs');
    console.log('✅ Sub-friendly with complete support materials and safety protocols');
    console.log('\n🎉 Texture and pattern exploration in French for February 2026!');
    
  } catch (error) {
    console.error('❌ Error creating February lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsFebruaryLessonPlans()
  .then(() => console.log('\n🏆 February Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });