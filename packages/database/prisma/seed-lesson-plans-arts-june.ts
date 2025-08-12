#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsJuneLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for June - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Our Art Gallery unit plan
    const galleryUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre galerie d\'art'
      }
    });
    
    if (!galleryUnit) {
      throw new Error('Our Art Gallery unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${galleryUnit.titleFr} (ID: ${galleryUnit.id})`);
    console.log(`📅 Duration: June 2026 (4 lessons - completing school year)\n`);
    
    // Clear existing June lesson plans for this unit
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: galleryUnit.id,
        date: {
          gte: new Date('2026-06-01'),
          lte: new Date('2026-06-30')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing June lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 4 lesson plans for June (45 minutes each) - school ends June 25
    const lessons = [];
    
    // Helper function to create June dates
    const junDate = (day: number) => new Date(`2026-06-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: June 1-5 (2 lessons) - Final gallery preparations and opening
    lessons.push({
      title: 'Gallery Opening Celebration',
      titleFr: 'Célébration vernissage galerie',
      date: junDate(1),
      learningGoals: 'Students will host their art gallery opening, presenting their work to families and community with confidence and pride.',
      learningGoalsFr: 'Les élèves accueilleront vernissage galerie d\'art, présentant travail aux familles avec confiance et fierté.',
      mindsOn: 'Final gallery setup and opening circle - prepare our hearts and minds to share our artistic journey',
      mindsOnFr: 'Installation finale galerie et cercle ouverture - préparer cœurs et esprits partager voyage artistique',
      action: 'Host gallery opening event, present artworks to visitors, give gallery tours, and celebrate artistic achievements',
      actionFr: 'Accueillir événement vernissage, présenter œuvres aux visiteurs, donner visites galerie, célébrer réussites artistiques',
      consolidation: 'Artists\' celebration circle - reflect on the joy of sharing our art with our community',
      consolidationFr: 'Cercle célébration artistes - réfléchir sur joie de partager notre art avec communauté',
      vocabulary: ['vernissage', 'accueillir', 'visiteur', 'présenter', 'visite', 'réussite', 'fierté', 'communauté'],
      materials: ['Gallery display materials', 'Artist name tags', 'Celebration refreshments', 'Guest book', 'Cameras'],
      crossCurricular: 'Public Speaking: presentation confidence; Community: family engagement; Celebration: achievement recognition'
    });
    
    lessons.push({
      title: 'Art Legacy Project',
      titleFr: 'Projet héritage artistique',
      date: junDate(3),
      learningGoals: 'Students will create a lasting artistic legacy for the school, contributing to a permanent art installation.',
      learningGoalsFr: 'Les élèves créeront héritage artistique durable pour école, contribuant à installation artistique permanente.',
      mindsOn: 'Discuss how we can leave a beautiful artistic gift for future Grade 1 students to enjoy',
      mindsOnFr: 'Discuter comment laisser beau cadeau artistique pour futurs élèves de 1re année à apprécier',
      action: 'Create collaborative mural or tile installation that will remain at school as our artistic legacy',
      actionFr: 'Créer murale collaborative ou installation tuiles qui restera à école comme notre héritage artistique',
      consolidation: 'Legacy installation ceremony - install our permanent artwork with dedication and celebration',
      consolidationFr: 'Cérémonie installation héritage - installer œuvre permanente avec dédicace et célébration',
      vocabulary: ['héritage', 'durable', 'permanent', 'installation', 'futur', 'cadeau', 'dédicace', 'cérémonie'],
      materials: ['Tiles or mural materials', 'Permanent paints', 'Installation tools', 'Dedication plaque materials'],
      crossCurricular: 'Community: school contribution; Legacy: lasting impact; Collaboration: group achievement'
    });
    
    // WEEK 2: June 8-12 (1 lesson) - Art appreciation and future goals
    lessons.push({
      title: 'Famous Artists Exploration',
      titleFr: 'Exploration d\'artistes célèbres',
      date: junDate(8),
      learningGoals: 'Students will explore famous artists and their techniques, connecting their own artistic growth to professional art.',
      learningGoalsFr: 'Les élèves exploreront artistes célèbres et leurs techniques, connectant croissance artistique à art professionnel.',
      mindsOn: 'Explore artworks by famous artists and find connections to techniques we\'ve learned this year',
      mindsOnFr: 'Explorer œuvres d\'artistes célèbres et trouver connexions aux techniques apprises cette année',
      action: 'Create artwork inspired by famous artists, using techniques and styles we\'ve learned throughout the year',
      actionFr: 'Créer œuvre inspirée par artistes célèbres, utilisant techniques et styles appris pendant l\'année',
      consolidation: 'Artist inspiration gallery - display our famous artist inspired works and discuss connections',
      consolidationFr: 'Galerie inspiration artiste - afficher œuvres inspirées artistes célèbres et discuter connexions',
      vocabulary: ['célèbre', 'professionnel', 'technique', 'style', 'inspiration', 'connexion', 'explorer', 'apprendre'],
      materials: ['Famous artist prints', 'Various art supplies', 'Artist information cards', 'Inspiration worksheets'],
      crossCurricular: 'Art History: famous artists; Cultural Studies: art appreciation; Connections: technique application'
    });
    
    // WEEK 3: June 15-19 (1 lesson) - Year-end celebration and closure
    lessons.push({
      title: 'Artistic Journey Celebration',
      titleFr: 'Célébration du voyage artistique',
      date: junDate(15),
      learningGoals: 'Students will celebrate their complete artistic journey, reflect on growth, and prepare for continued creativity.',
      learningGoalsFr: 'Les élèves célébreront voyage artistique complet, réfléchiront sur croissance, prépareront créativité continue.',
      mindsOn: 'Create an artistic timeline of our year, remembering favorite projects and biggest discoveries',
      mindsOnFr: 'Créer ligne temps artistique de notre année, se souvenir projets favoris et plus grandes découvertes',
      action: 'Complete artistic journey books with reflections, photos, and plans for summer art exploration',
      actionFr: 'Compléter livres voyage artistique avec réflexions, photos, plans pour exploration artistique été',
      consolidation: 'Final artists\' circle - share artistic journey books and commit to continued creative exploration',
      consolidationFr: 'Cercle final artistes - partager livres voyage artistique et s\'engager exploration créative continue',
      vocabulary: ['voyage', 'complet', 'ligne temps', 'découverte', 'réflexion', 'été', 's\'engager', 'continuer'],
      materials: ['Journey book templates', 'Year\'s artwork photos', 'Art supply take-home kits', 'Summer art challenges'],
      crossCurricular: 'Reflection: year-end summary; Goal Setting: summer plans; Personal Growth: artistic development'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating June lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: galleryUnit.id,
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
          
          grouping: 'celebration circles, individual reflection, community presentation, collaborative legacy creation',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Flexible participation levels in gallery opening presentation',
            'Choice in complexity of legacy project contributions',
            'Alternative reflection formats for different communication styles',
            'Extended time for journey book completion and sharing',
            'Partner support for presentation and reflection activities',
            'Visual supports for timeline and memory creation',
            'Modified celebration participation based on comfort levels'
          ]),
          
          modifications: JSON.stringify([
            'Simplified journey book templates with guided prompts',
            'Supported participation in community presentation event',
            'Visual rather than written reflection options available',
            'Modified legacy project scope while maintaining contribution',
            'Alternative celebration activities for individual needs',
            'Reduced expectations while celebrating all achievements',
            'Flexible timeline activities with personal accomplishments focus'
          ]),
          
          extensions: JSON.stringify([
            'Leadership roles in gallery opening event organization',
            'Advanced journey book creation with detailed artistic analysis',
            'Mentoring younger students in artistic techniques',
            'Research project on famous artists and advanced techniques',
            'Planning and leading legacy project installation',
            'Advanced summer artistic exploration goal setting',
            'Documentation and teaching of artistic growth to others'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Flexible participation, visual supports, partner assistance, modified expectations, alternative formats',
            extension: 'Leadership opportunities, advanced analysis, peer mentoring, independent research, detailed planning',
            multiModal: 'Visual, auditory, kinesthetic, collaborative, reflective, and celebratory learning experiences'
          }),
          
          // Assessment
          assessmentType: 'summative',
          assessmentNotes: `Final comprehensive assessment encompassing: full year artistic growth and achievement, presentation skills and confidence in gallery opening, collaborative skills in legacy project creation, self-reflection abilities in journey documentation, art appreciation and connection to professional artists, goal-setting skills for continued artistic development, French vocabulary mastery and usage in artistic contexts throughout entire year`,
          
          // Cross-curricular connections
          crossCurricularConnections: lessonData.crossCurricular,
          
          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Complete celebration and reflection materials organized with clear instructions, gallery opening procedures posted with student role descriptions, legacy project materials prepared with safety guidelines, journey book templates and examples available, summer art challenge materials prepared for take-home, alternative participation options for all comfort levels clearly outlined'
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
    
    console.log('\n🎨 JUNE ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive year-end celebration and reflection lessons`);
    console.log('✅ June 1-15, 2026 fully planned');
    console.log('✅ 4 lessons × 45 minutes = 3 hours of celebration and legacy arts instruction');
    console.log('✅ Community celebration: gallery opening with family and community engagement');
    console.log('✅ Lasting legacy: permanent school art installation contribution');
    console.log('✅ Professional connections: famous artist exploration and technique connections');
    console.log('✅ Complete reflection: artistic journey documentation and growth celebration');
    console.log('✅ Future preparation: summer art exploration planning and goal setting');
    console.log('✅ Comprehensive differentiation for all celebration and reflection needs');
    console.log('✅ Sub-friendly with complete celebration and legacy project support');
    console.log('\n🎉 Triumphant artistic year completion and community celebration in French for June 2026!');
    
    // Final curriculum summary
    console.log('\n🏆 COMPLETE ARTS CURRICULUM EXPANSION SUMMARY:');
    console.log('📊 TOTAL LESSONS: 72 lessons (45 minutes each)');
    console.log('📅 DURATION: September 4, 2025 - June 15, 2026');
    console.log('🎯 FREQUENCY: 2 lessons per week (Monday & Wednesday 1:00-1:45 PM)');
    console.log('📚 UNITS COVERED:');
    console.log('   • Unit 1: Discovering Art in Our World (8 lessons)');
    console.log('   • Unit 2: Colors and Feelings (16 lessons)');
    console.log('   • Unit 3: Winter Celebrations Through Art (16 lessons)');
    console.log('   • Unit 4: Textures and Patterns (12 lessons)');
    console.log('   • Unit 5: Stories in Art (12 lessons)');
    console.log('   • Unit 6: Our Art Gallery (8 lessons)');
    console.log('🌟 FEATURES:');
    console.log('   ✅ Complete Grade 1 curriculum expectation coverage');
    console.log('   ✅ Rich French vocabulary integration');
    console.log('   ✅ Cultural connections (Mi\'kmaq, Acadian, global)');
    console.log('   ✅ Cross-curricular integration (Math, Science, Language Arts)');
    console.log('   ✅ Comprehensive differentiation strategies');
    console.log('   ✅ Sub-friendly with detailed support materials');
    console.log('   ✅ Community engagement and family celebration');
    console.log('   ✅ Professional artist skills and techniques');
    console.log('   ✅ Portfolio development and reflection');
    console.log('   ✅ Legacy project and lasting school contribution');
    
  } catch (error) {
    console.error('❌ Error creating June lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsJuneLessonPlans()
  .then(() => console.log('\n🏆 June Arts lesson plans completed! 🎨✨'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });