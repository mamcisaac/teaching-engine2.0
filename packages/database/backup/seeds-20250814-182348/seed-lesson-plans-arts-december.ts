#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsDecemberLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for December - Grade 1 French Immersion...\n');
  
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
    console.log(`📅 Duration: December 2025 (6 lessons)\n`);
    
    // Clear existing December lesson plans for this unit
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: winterUnit.id,
        date: {
          gte: new Date('2025-12-01'),
          lte: new Date('2025-12-31')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing December lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 6 lesson plans for December (45 minutes each)
    const lessons = [];
    
    // Helper function to create December dates (avoiding winter break)
    const decDate = (day: number) => new Date(`2025-12-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: December 1-5 (2 lessons)
    lessons.push({
      title: 'Winter Wonderland Collages',
      titleFr: 'Collages de paysage d\'hiver',
      date: decDate(1),
      learningGoals: 'Students will create winter-themed collages using various textures and materials to represent the winter season.',
      learningGoalsFr: 'Les élèves créeront des collages d\'hiver en utilisant diverses textures et matériaux pour représenter la saison hivernale.',
      mindsOn: 'Explore winter photographs and discuss textures we see in winter (snow, ice, bare branches)',
      mindsOnFr: 'Explorer des photos d\'hiver et discuter des textures qu\'on voit en hiver (neige, glace, branches nues)',
      action: 'Create winter scene collages using cotton, foil, tissue paper, and natural materials',
      actionFr: 'Créer des scènes d\'hiver avec coton, papier d\'aluminium, papier de soie et matériaux naturels',
      consolidation: 'Winter gallery walk - describe textures and materials used in French',
      consolidationFr: 'Promenade galerie d\'hiver - décrire textures et matériaux utilisés en français',

      materials: ['Cotton balls', 'Aluminum foil', 'White tissue paper', 'Blue construction paper', 'Glue', 'Scissors', 'Winter photos'],
      crossCurricular: 'Science: winter weather and textures; French: winter vocabulary; Math: geometric shapes in winter scenes'
    });
    
    lessons.push({
      title: 'Cultural Celebration Art',
      titleFr: 'Art de célébrations culturelles',
      date: decDate(3),
      learningGoals: 'Students will explore and create art representing different cultural winter celebrations.',
      learningGoalsFr: 'Les élèves exploreront et créeront de l\'art représentant différentes célébrations culturelles d\'hiver.',
      mindsOn: 'Share family celebration traditions and look at celebration art from different cultures',
      mindsOnFr: 'Partager les traditions familiales et regarder l\'art de célébration de différentes cultures',
      action: 'Create celebration symbols and decorative art inspired by various cultural traditions',
      actionFr: 'Créer des symboles de célébration et art décoratif inspirés par diverses traditions culturelles',
      consolidation: 'Cultural celebration exhibition - present and explain our celebration art',
      consolidationFr: 'Exposition célébrations culturelles - présenter et expliquer notre art de célébration',

      materials: ['Construction paper', 'Markers', 'Crayons', 'Glitter', 'Ribbon', 'Cultural celebration images', 'Glue sticks'],
      crossCurricular: 'Social Studies: cultural traditions; French: celebration vocabulary; Family Studies: family celebrations'
    });
    
    // WEEK 2: December 8-12 (2 lessons)
    lessons.push({
      title: 'Light and Shadow Winter Art',
      titleFr: 'Art d\'hiver avec lumière et ombre',
      date: decDate(8),
      learningGoals: 'Students will explore how light and shadow create beauty in winter art and create luminous winter artwork.',
      learningGoalsFr: 'Les élèves exploreront comment la lumière et l\'ombre créent la beauté dans l\'art d\'hiver.',
      mindsOn: 'Experiment with flashlights and objects to create shadows, observe light through ice cubes',
      mindsOnFr: 'Expérimenter avec lampes de poche et objets pour créer ombres, observer lumière à travers glaçons',
      action: 'Create winter luminaries using tissue paper and battery-operated lights',
      actionFr: 'Créer des luminaires d\'hiver avec papier de soie et lumières à piles',
      consolidation: 'Winter light festival - display illuminated artworks in darkened room',
      consolidationFr: 'Festival de lumières d\'hiver - afficher œuvres illuminées dans salle sombre',

      materials: ['Mason jars', 'Tissue paper', 'Battery LED lights', 'Glue', 'Scissors', 'Winter scene stencils'],
      crossCurricular: 'Science: light and shadow properties; Math: light patterns; Physics: how light travels'
    });
    
    lessons.push({
      title: 'Gift Art Creation',
      titleFr: 'Création d\'art cadeau',
      date: decDate(10),
      learningGoals: 'Students will create handmade gifts using artistic techniques, focusing on thoughtful creation for others.',
      learningGoalsFr: 'Les élèves créeront des cadeaux faits à la main en utilisant des techniques artistiques.',
      mindsOn: 'Discuss what makes a meaningful gift and brainstorm simple art gifts we can create',
      mindsOnFr: 'Discuter ce qui rend un cadeau significatif et réfléchir à des cadeaux artistiques simples',
      action: 'Create personalized bookmarks, painted stones, or decorated photo frames as gifts',
      actionFr: 'Créer signets personnalisés, pierres peintes, ou cadres photos décorés comme cadeaux',
      consolidation: 'Gift wrapping workshop - wrap our art gifts with care and love',
      consolidationFr: 'Atelier emballage cadeaux - emballer nos cadeaux artistiques avec soin et amour',

      materials: ['Cardstock', 'Paint', 'Brushes', 'Smooth stones', 'Picture frames', 'Ribbons', 'Gift bags'],
      crossCurricular: 'Math: measuring and cutting; Social Studies: gift-giving traditions; Character Education: generosity'
    });
    
    // WEEK 3: December 15-19 (2 lessons - before winter break)
    lessons.push({
      title: 'Snow Crystal Art Science',
      titleFr: 'Art scientifique des cristaux de neige',
      date: decDate(15),
      learningGoals: 'Students will observe and recreate the geometric patterns of snow crystals through artistic exploration.',
      learningGoalsFr: 'Les élèves observeront et recréeront les motifs géométriques des cristaux de neige.',
      mindsOn: 'Examine snowflake photos under magnifying glasses, identify symmetrical patterns',
      mindsOnFr: 'Examiner photos de flocons sous loupes, identifier motifs symétriques',
      action: 'Create snowflake art using paper folding, cutting, and decorating techniques',
      actionFr: 'Créer art de flocons avec techniques de pliage, découpage et décoration du papier',
      consolidation: 'Snowflake museum - display and compare the uniqueness of each creation',
      consolidationFr: 'Musée de flocons - afficher et comparer l\'unicité de chaque création',

      materials: ['White paper', 'Scissors', 'Glitter', 'Magnifying glasses', 'Snowflake photos', 'Blue background paper'],
      crossCurricular: 'Math: symmetry and geometric patterns; Science: crystal formation; Geometry: angles and shapes'
    });
    
    lessons.push({
      title: 'Winter Art Portfolio Reflection',
      titleFr: 'Réflexion portfolio d\'art d\'hiver',
      date: decDate(17),
      learningGoals: 'Students will reflect on their artistic growth through winter art creation and organize their work.',
      learningGoalsFr: 'Les élèves réfléchiront sur leur croissance artistique à travers la création artistique d\'hiver.',
      mindsOn: 'Review all December artwork and discuss favorite techniques and discoveries',
      mindsOnFr: 'Réviser toutes les œuvres de décembre et discuter techniques favorites et découvertes',
      action: 'Create winter art portfolio covers and write artist reflections about growth and learning',
      actionFr: 'Créer couvertures portfolio d\'art d\'hiver et écrire réflexions d\'artiste sur croissance',
      consolidation: 'Winter art celebration - share portfolios with families before holiday break',
      consolidationFr: 'Célébration art d\'hiver - partager portfolios avec familles avant vacances',

      materials: ['Folders', 'Decorating supplies', 'Reflection sheets', 'Previous artwork', 'Display boards'],
      crossCurricular: 'Language Arts: written reflection; Self-assessment: growth mindset; Organization: portfolio skills'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating December lesson plans in database...\n');
    
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
          
          grouping: 'whole class discussion, individual creation, partner sharing, gallery walk',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Adapted cutting tools for fine motor needs',
            'Choice of complexity in designs',
            'Extra time for creation process',
            'Visual step-by-step guides',
            'Partner support available'
          ]),
          
          modifications: JSON.stringify([
            'Simplified techniques for emerging learners',
            'Pre-cut materials available',
            'Hand-over-hand support as needed',
            'Focus on exploration over perfection',
            'Alternative materials for allergies'
          ]),
          
          extensions: JSON.stringify([
            'Advanced artistic techniques',
            'Research winter celebrations worldwide',
            'Create instructional guides for classmates',
            'Design multiple variations of projects',
            'Mentor struggling peers'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual aids, step-by-step guidance, adapted tools, choice of materials',
            extension: 'Complex techniques, cultural research, peer mentoring, multiple variations',
            multiModal: 'Visual, tactile, kinesthetic, and auditory art experiences'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: `Observation of: creative process, use of French vocabulary in art context, cultural awareness, artistic technique development, collaboration skills`,
          
          // Cross-curricular connections

          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'All materials organized in labeled bins, visual instructions posted, French vocabulary cards displayed, step-by-step process charts available, cleanup procedures clearly posted'
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
    
    console.log('\n🎨 DECEMBER ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive winter celebration arts lessons`);
    console.log('✅ December 1-17, 2025 fully planned');
    console.log('✅ 6 lessons × 45 minutes = 4.5 hours of winter arts instruction');
    console.log('✅ Rich French vocabulary integration');
    console.log('✅ Cultural celebration focus with inclusivity');
    console.log('✅ Science and math cross-curricular connections');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Comprehensive differentiation strategies');
    console.log('✅ Portfolio development and reflection');
    console.log('✅ Sub-friendly with detailed support materials');
    console.log('\n🎉 Winter artistic celebration in French for December 2025!');
    
  } catch (error) {
    console.error('❌ Error creating December lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsDecemberLessonPlans()
  .then(() => console.log('\n🏆 December Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });