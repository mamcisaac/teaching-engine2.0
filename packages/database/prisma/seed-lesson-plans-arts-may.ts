#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsMayLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for May - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get both unit plans (Stories in Art and Our Art Gallery)
    const storiesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les histoires dans l\'art'
      }
    });
    
    const galleryUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre galerie d\'art'
      }
    });
    
    if (!storiesUnit || !galleryUnit) {
      throw new Error('Required unit plans not found.');
    }
    
    console.log(`✅ Found Stories unit: ${storiesUnit.titleFr} (ID: ${storiesUnit.id})`);
    console.log(`✅ Found Gallery unit: ${galleryUnit.titleFr} (ID: ${galleryUnit.id})`);
    console.log(`📅 Duration: May 2026 (8 lessons)\n`);
    
    // Clear existing May lesson plans for both units
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: { in: [storiesUnit.id, galleryUnit.id] },
        date: {
          gte: new Date('2026-05-01'),
          lte: new Date('2026-05-31')
        }
      }
    });
    
    if (existingLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: existingLessons.map(l => l.id) }
        }
      });
      console.log(`🗑️ Cleared ${existingLessons.length} existing May lessons\n`);
    }
    
    // Get Arts curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    // Create 8 lesson plans for May (45 minutes each)
    const lessons = [];
    
    // Helper function to create May dates
    const mayDate = (day: number) => new Date(`2026-05-${day.toString().padStart(2, '0')}T13:00:00`);
    
    // WEEK 1: May 4-8 (2 lessons) - Completing Stories in Art unit
    lessons.push({
      title: 'Storytelling Through Photography',
      titleFr: 'Narration par la photographie',
      date: mayDate(4),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will explore how photographs can tell stories and create photo-story compositions.',
      learningGoalsFr: 'Les élèves exploreront comment les photographies peuvent raconter des histoires et créer compositions photo-histoire.',
      mindsOn: 'Examine family photos and discuss the stories they tell - what do we see in the background, expressions, settings?',
      mindsOnFr: 'Examiner photos familiales et discuter histoires qu\'elles racontent - qu\'est-ce qu\'on voit, expressions, décors?',
      action: 'Take photos around school to create photo stories, then add artistic elements like speech bubbles or decorative frames',
      actionFr: 'Prendre photos autour école pour créer histoires photo, puis ajouter éléments artistiques comme bulles parole',
      consolidation: 'Photo story gallery walk - present our photo stories and discuss the stories they tell',
      consolidationFr: 'Promenade galerie histoires photo - présenter nos histoires photo et discuter histoires qu\'elles racontent',
      vocabulary: ['photographie', 'composition', 'arrière-plan', 'expression', 'cadre', 'bulle', 'décorer', 'présenter'],
      materials: ['Digital cameras/tablets', 'Printed photos', 'Art supplies for decorating', 'Speech bubble templates'],
      crossCurricular: 'Technology: digital photography; Language Arts: photo captions; Media Literacy: visual storytelling'
    });
    
    lessons.push({
      title: 'Class Storybook Creation',
      titleFr: 'Création de livre d\'histoires de classe',
      date: mayDate(6),
      unitPlanId: storiesUnit.id,
      learningGoals: 'Students will collaborate to create a class storybook featuring their original stories and illustrations.',
      learningGoalsFr: 'Les élèves collaboreront pour créer livre d\'histoires de classe avec leurs histoires originales et illustrations.',
      mindsOn: 'Review all our story artwork from this unit and plan how to organize them into a class book',
      mindsOnFr: 'Réviser toutes nos œuvres d\'histoires de cette unité et planifier comment les organiser en livre classe',
      action: 'Select best story artworks, create book pages, add text, and organize our class storybook',
      actionFr: 'Sélectionner meilleures œuvres histoires, créer pages livre, ajouter texte, organiser livre classe',
      consolidation: 'Class storybook launch party - celebrate our published book with families and community',
      consolidationFr: 'Fête lancement livre classe - célébrer notre livre publié avec familles et communauté',
      vocabulary: ['livre', 'publier', 'sélectionner', 'organiser', 'page', 'texte', 'lancement', 'communauté'],
      materials: ['Previous story artworks', 'Book binding materials', 'Computer for text', 'Celebration supplies'],
      crossCurricular: 'Language Arts: book publishing; Technology: digital text; Celebration: community connections'
    });
    
    // WEEK 2: May 11-15 (2 lessons) - Beginning Our Art Gallery unit
    lessons.push({
      title: 'Art Portfolio Curation',
      titleFr: 'Conservation de portfolio d\'art',
      date: mayDate(11),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will curate their art portfolios, selecting their best work and organizing for exhibition.',
      learningGoalsFr: 'Les élèves conserveront leurs portfolios d\'art, sélectionnant leurs meilleures œuvres pour exposition.',
      mindsOn: 'Art portfolio review session - look through all artwork from the year and reflect on growth',
      mindsOnFr: 'Session révision portfolio art - regarder toutes œuvres de l\'année et réfléchir sur croissance',
      action: 'Select 6-8 best artworks from the year, organize by theme or chronology, and prepare for portfolio presentation',
      actionFr: 'Sélectionner 6-8 meilleures œuvres de l\'année, organiser par thème ou chronologie, préparer présentation',
      consolidation: 'Portfolio peer preview - share selected artworks with partner and practice describing artistic choices',
      consolidationFr: 'Aperçu portfolio pairs - partager œuvres sélectionnées avec partenaire et pratiquer décrire choix artistiques',
      vocabulary: ['portfolio', 'conservation', 'sélectionner', 'exposition', 'thème', 'chronologie', 'aperçu', 'choix'],
      materials: ['All year\'s artwork', 'Portfolio folders', 'Organization sheets', 'Reflection guides'],
      crossCurricular: 'Organization: curation skills; Self-reflection: artistic growth; Communication: presentation skills'
    });
    
    lessons.push({
      title: 'Artist Statement Writing',
      titleFr: 'Rédaction de déclaration d\'artiste',
      date: mayDate(13),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will write artist statements describing their artworks and artistic growth throughout the year.',
      learningGoalsFr: 'Les élèves rédigeront déclarations d\'artiste décrivant leurs œuvres et croissance artistique de l\'année.',
      mindsOn: 'Read example artist statements and discuss how artists explain their work and inspiration',
      mindsOnFr: 'Lire exemples déclarations artiste et discuter comment artistes expliquent travail et inspiration',
      action: 'Write simple artist statements for selected portfolio pieces, describing technique, inspiration, and feelings',
      actionFr: 'Écrire déclarations artiste simples pour pièces portfolio sélectionnées, décrivant technique, inspiration, sentiments',
      consolidation: 'Artist statement sharing circle - read our statements aloud and celebrate our artistic voices',
      consolidationFr: 'Cercle partage déclarations artiste - lire déclarations à voix haute et célébrer nos voix artistiques',
      vocabulary: ['déclaration', 'rédaction', 'décrire', 'technique', 'inspiration', 'sentiment', 'voix', 'célébrer'],
      materials: ['Artist statement examples', 'Writing paper', 'Pencils', 'Portfolio artworks', 'Templates'],
      crossCurricular: 'Language Arts: descriptive writing; Self-reflection: artistic analysis; Communication: public speaking'
    });
    
    // WEEK 3: May 18-22 (2 lessons) - Gallery preparation
    lessons.push({
      title: 'Exhibition Design and Layout',
      titleFr: 'Conception et disposition d\'exposition',
      date: mayDate(18),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will design the layout and organization of their art gallery exhibition space.',
      learningGoalsFr: 'Les élèves concevront la disposition et organisation de leur espace exposition galerie d\'art.',
      mindsOn: 'Visit a virtual gallery or examine gallery photos - how is artwork displayed to look its best?',
      mindsOnFr: 'Visiter galerie virtuelle ou examiner photos galeries - comment œuvres affichées pour paraître mieux?',
      action: 'Plan our classroom gallery layout, create exhibition labels, and organize artwork for best presentation',
      actionFr: 'Planifier disposition galerie classe, créer étiquettes exposition, organiser œuvres pour meilleure présentation',
      consolidation: 'Gallery setup rehearsal - practice setting up our exhibition and adjusting for optimal viewing',
      consolidationFr: 'Répétition installation galerie - pratiquer installer exposition et ajuster pour visualisation optimale',
      vocabulary: ['exposition', 'conception', 'disposition', 'espace', 'étiquette', 'présentation', 'répétition', 'optimal'],
      materials: ['Gallery photos', 'Layout planning sheets', 'Labels', 'Display materials', 'Measuring tools'],
      crossCurricular: 'Math: spatial measurement; Design: layout principles; Organization: space planning'
    });
    
    lessons.push({
      title: 'Art Appreciation and Critique Skills',
      titleFr: 'Compétences d\'appréciation et critique d\'art',
      date: mayDate(20),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will develop skills for appreciating and discussing artwork respectfully and constructively.',
      learningGoalsFr: 'Les élèves développeront compétences pour apprécier et discuter œuvres respectueusement et constructivement.',
      mindsOn: 'Learn the language of art appreciation - how to describe what we see, feel, and appreciate in artwork',
      mindsOnFr: 'Apprendre langage appréciation art - comment décrire ce qu\'on voit, ressent, apprécie dans œuvres',
      action: 'Practice giving respectful feedback on artwork using positive language and specific observations',
      actionFr: 'Pratiquer donner rétroaction respectueuse sur œuvres utilisant langage positif et observations spécifiques',
      consolidation: 'Art critique practice session - use our new skills to appreciate and discuss each other\'s portfolio pieces',
      consolidationFr: 'Session pratique critique art - utiliser nouvelles compétences pour apprécier et discuter pièces portfolio',
      vocabulary: ['appréciation', 'critique', 'respectueux', 'constructif', 'langage', 'rétroaction', 'positif', 'observation'],
      materials: ['Art appreciation guides', 'Feedback sentence starters', 'Portfolio artworks', 'Discussion prompts'],
      crossCurricular: 'Communication: constructive feedback; Social Skills: respectful discussion; Critical Thinking: art analysis'
    });
    
    // WEEK 4: May 25-29 (2 lessons) - Gallery exhibition preparation
    lessons.push({
      title: 'Gallery Opening Preparation',
      titleFr: 'Préparation vernissage galerie',
      date: mayDate(25),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will prepare for their gallery opening event, practicing presentation skills and organizing celebration details.',
      learningGoalsFr: 'Les élèves prépareront leur événement vernissage galerie, pratiquant compétences présentation.',
      mindsOn: 'Discuss what happens at a real gallery opening - how do artists present their work to visitors?',
      mindsOnFr: 'Discuter ce qui arrive à vrai vernissage galerie - comment artistes présentent travail aux visiteurs?',
      action: 'Practice presenting our artwork to visitors, prepare welcome speeches, and organize gallery opening details',
      actionFr: 'Pratiquer présenter œuvres aux visiteurs, préparer discours bienvenue, organiser détails vernissage',
      consolidation: 'Gallery opening dress rehearsal - full practice run with roles, presentations, and celebration elements',
      consolidationFr: 'Répétition générale vernissage - pratique complète avec rôles, présentations, éléments célébration',
      vocabulary: ['vernissage', 'événement', 'visiteur', 'discours', 'bienvenue', 'rôle', 'répétition générale', 'élément'],
      materials: ['Presentation guides', 'Speech templates', 'Gallery opening supplies', 'Name tags', 'Celebration materials'],
      crossCurricular: 'Public Speaking: presentation skills; Event Planning: organization; Social Skills: hosting guests'
    });
    
    lessons.push({
      title: 'Artistic Growth Reflection',
      titleFr: 'Réflexion croissance artistique',
      date: mayDate(27),
      unitPlanId: galleryUnit.id,
      learningGoals: 'Students will reflect on their artistic growth throughout the year and set goals for continued artistic development.',
      learningGoalsFr: 'Les élèves réfléchiront sur croissance artistique de l\'année et fixeront objectifs pour développement artistique.',
      mindsOn: 'Compare September self-portraits with current artwork - how have we grown as artists this year?',
      mindsOnFr: 'Comparer autoportraits septembre avec œuvres actuelles - comment avons-nous grandi comme artistes?',
      action: 'Create artistic growth documentation and set goals for future artistic learning and exploration',
      actionFr: 'Créer documentation croissance artistique et fixer objectifs pour apprentissage et exploration artistiques futurs',
      consolidation: 'Growth celebration circle - share our artistic journeys and encourage continued creativity',
      consolidationFr: 'Cercle célébration croissance - partager voyages artistiques et encourager créativité continue',
      vocabulary: ['réflexion', 'croissance', 'comparer', 'développement', 'documentation', 'objectif', 'voyage', 'encourager'],
      materials: ['September artwork', 'Current artwork', 'Growth reflection sheets', 'Goal-setting templates'],
      crossCurricular: 'Self-Assessment: growth documentation; Goal Setting: future planning; Personal Development: reflection skills'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating May lesson plans in database...\n');
    
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
          
          grouping: 'individual reflection and curation, partner sharing and feedback, whole class preparation and celebration',
          
          // Differentiation strategies
          accommodations: JSON.stringify([
            'Portfolio organization support with visual guides',
            'Alternative presentation formats for different comfort levels',
            'Choice in complexity of artist statements and reflections',
            'Extended time for reflection and preparation activities',
            'Partner support for presentation practice',
            'Modified participation levels in gallery opening event',
            'Visual supports for feedback and critique language'
          ]),
          
          modifications: JSON.stringify([
            'Simplified artist statement templates with guided prompts',
            'Reduced portfolio size requirements while maintaining choice',
            'Visual rather than written reflection options',
            'Supported participation in group preparation activities',
            'Modified exhibition roles based on individual strengths',
            'Alternative celebration participation for different comfort levels',
            'Adapted critique participation with sentence starters'
          ]),
          
          extensions: JSON.stringify([
            'Advanced artist statement writing with detailed analysis',
            'Leadership roles in gallery organization and event planning',
            'Mentoring peers in presentation skills and portfolio curation',
            'Research on professional gallery practices and curation',
            'Advanced critique skills with formal art appreciation language',
            'Independent goal-setting for summer artistic exploration',
            'Documentation of teaching others about art processes'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Visual guides, templates, partner support, choice in participation levels, modified expectations',
            extension: 'Leadership opportunities, advanced analysis, peer mentoring, independent research and goal-setting',
            multiModal: 'Visual, written, oral, collaborative, and individual reflection and presentation experiences'
          }),
          
          // Assessment
          assessmentType: 'summative',
          assessmentNotes: `Comprehensive year-end assessment including: portfolio curation skills and artistic choice-making, artist statement quality and self-reflection depth, presentation skills and confidence growth, art appreciation and critique abilities, collaborative skills in gallery preparation, artistic growth documentation and goal-setting, French vocabulary mastery in artistic contexts throughout the year`,
          
          // Cross-curricular connections
          crossCurricularConnections: lessonData.crossCurricular,
          
          // Sub-friendly features
          isSubFriendly: true,
          subNotes: 'Complete portfolio organization materials with visual guides, presentation templates and practice materials, gallery setup instructions with labeled supplies, artist statement examples and templates, celebration planning materials organized, alternative participation options clearly posted, reflection and assessment tools readily available'
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
    
    console.log('\n🎨 MAY ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive portfolio development and gallery preparation lessons`);
    console.log('✅ May 4-27, 2026 fully planned');
    console.log('✅ 8 lessons × 45 minutes = 6 hours of portfolio and gallery arts instruction');
    console.log('✅ Professional artist skills: portfolio curation, artist statements, gallery preparation');
    console.log('✅ Advanced reflection: artistic growth documentation and future goal setting');
    console.log('✅ Community connection: gallery opening event preparation');
    console.log('✅ Critical thinking: art appreciation and constructive critique skills');
    console.log('✅ Celebration preparation: presentation skills and event organization');
    console.log('✅ Comprehensive differentiation for all learning and comfort levels');
    console.log('✅ Sub-friendly with complete gallery preparation support materials');
    console.log('\n🎉 Professional gallery preparation and artistic celebration in French for May 2026!');
    
  } catch (error) {
    console.error('❌ Error creating May lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsMayLessonPlans()
  .then(() => console.log('\n🏆 May Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });