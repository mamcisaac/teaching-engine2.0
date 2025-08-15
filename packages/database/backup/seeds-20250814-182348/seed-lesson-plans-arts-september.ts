#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsSeptemberLessonPlans() {
  console.log('🎨 Creating Arts Lesson Plans for September - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Arts unit plan for September
    const artsUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Découvrir l\'art dans notre monde'
      }
    });
    
    if (!artsUnit) {
      throw new Error('Arts unit plan "Découvrir l\'art dans notre monde" not found.');
    }
    
    console.log(`✅ Found unit plan: ${artsUnit.titleFr} (ID: ${artsUnit.id})`);
    console.log(`📅 Duration: Sept 4-30, 2025 (8 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: artsUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 8 lesson plans (1 hour each, 2 per week) for September
    const lessons = [];
    
    // Helper function to create dates in September 2025
    const septDate = (day: number) => new Date(`2025-09-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: 2 lessons
    lessons.push({
      title: 'Self-Portrait Introduction',
      titleFr: 'Introduction à l\'autoportrait',
      date: septDate(4),
      mindsOn: 'Look at mirrors, identify facial features, discuss what makes us unique',
      mindsOnFr: 'Regarder miroirs, identifier traits visage, discuter unicité',
      action: 'Create self-portraits with various materials, add names artistically',
      actionFr: 'Créer autoportraits avec matériaux variés, ajouter noms artistiquement',
      consolidation: 'Gallery walk, positive feedback, display in classroom',
      consolidationFr: 'Promenade galerie, rétroaction positive, afficher classe',
      frenchConnection: 'Art vocabulary: dessiner, couleur, forme, visage, créer'
    });
    
    lessons.push({
      title: 'Colors and Emotions',
      titleFr: 'Les couleurs et les émotions',
      date: septDate(5),
      mindsOn: 'How do colors make us feel? Color emotion cards',
      mindsOnFr: 'Comment les couleurs nous font sentir? Cartes émotions',
      action: 'Paint with primary colors, explore color mixing, emotion paintings',
      actionFr: 'Peindre couleurs primaires, mélanger, peintures émotions',
      consolidation: 'Share emotion colors, discuss choices, create class rainbow',
      consolidationFr: 'Partager couleurs émotions, discuter choix, arc-en-ciel classe',
      frenchConnection: 'Color and emotion words: rouge, bleu, jaune, content, triste'
    });
    
    // WEEK 2: 2 lessons
    lessons.push({
      title: 'Texture Exploration',
      titleFr: 'Explorer les textures',
      date: septDate(10),
      mindsOn: 'Texture hunt in classroom, describe how things feel',
      mindsOnFr: 'Chasse aux textures, décrire sensations',
      action: 'Create texture collages, rubbings, tactile art pieces',
      actionFr: 'Créer collages textures, frottages, art tactile',
      consolidation: 'Touch museum, describe textures in French, appreciation',
      consolidationFr: 'Musée toucher, décrire textures en français, appréciation',
      frenchConnection: 'Texture vocabulary: doux, rugueux, lisse, piquant, mou'
    });
    
    lessons.push({
      title: 'Lines and Patterns',
      titleFr: 'Lignes et motifs',
      date: septDate(12),
      mindsOn: 'Find lines in environment, body movement lines',
      mindsOnFr: 'Trouver lignes environnement, lignes mouvements corps',
      action: 'Draw different line types, create pattern art, line sculptures',
      actionFr: 'Dessiner types lignes, créer art motifs, sculptures lignes',
      consolidation: 'Pattern parade, identify patterns in artworks',
      consolidationFr: 'Parade motifs, identifier motifs œuvres',
      frenchConnection: 'Line vocabulary: droit, courbe, zigzag, spirale, répéter'
    });
    
    // WEEK 3: 2 lessons
    lessons.push({
      title: 'Nature Art',
      titleFr: 'L\'art de la nature',
      date: septDate(17),
      mindsOn: 'Collect natural materials, observe nature\'s art',
      mindsOnFr: 'Collecter matériaux naturels, observer art nature',
      action: 'Create nature collages, leaf prints, outdoor sculptures',
      actionFr: 'Créer collages nature, empreintes feuilles, sculptures extérieures',
      consolidation: 'Nature art exhibition, discuss natural beauty',
      consolidationFr: 'Exposition art nature, discuter beauté naturelle',
      frenchConnection: 'Nature vocabulary: feuille, branche, pierre, fleur, naturel'
    });
    
    lessons.push({
      title: 'Community Mural',
      titleFr: 'Murale communautaire',
      date: septDate(19),
      mindsOn: 'What makes our classroom community special?',
      mindsOnFr: 'Qu\'est-ce qui rend notre communauté spéciale?',
      action: 'Collaborate on large mural, each add personal touch',
      actionFr: 'Collaborer grande murale, chacun ajoute touche personnelle',
      consolidation: 'Unveil mural, discuss cooperation, celebrate teamwork',
      consolidationFr: 'Dévoiler murale, discuter coopération, célébrer équipe',
      frenchConnection: 'Community vocabulary: ensemble, partager, ami, aider, groupe'
    });
    
    // WEEK 4: 2 lessons
    lessons.push({
      title: 'Autumn Art Celebration',
      titleFr: 'Célébration d\'art d\'automne',
      date: septDate(24),
      mindsOn: 'Observe autumn changes, collect autumn materials',
      mindsOnFr: 'Observer changements automne, collecter matériaux',
      action: 'Create autumn-themed art, leaf art, seasonal colors',
      actionFr: 'Créer art thème automne, art feuilles, couleurs saison',
      consolidation: 'Autumn art show, describe seasonal changes',
      consolidationFr: 'Exposition art automne, décrire changements saison',
      frenchConnection: 'Autumn vocabulary: automne, orange, brun, tomber, changer'
    });
    
    lessons.push({
      title: 'September Art Portfolio',
      titleFr: 'Portfolio d\'art septembre',
      date: septDate(30),
      mindsOn: 'Review all artwork created, select favorites',
      mindsOnFr: 'Réviser œuvres créées, sélectionner favoris',
      action: 'Organize portfolios, artist statements, prepare presentations',
      actionFr: 'Organiser portfolios, déclarations artiste, préparer présentations',
      consolidation: 'Art exhibition for families, artist talks, celebrate creativity',
      consolidationFr: 'Exposition familles, présentations artiste, célébrer créativité',
      frenchConnection: 'Presentation vocabulary: voici, j\'ai fait, j\'aime, regardez'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: artsUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 60, // All lessons are 1 hour
          grade: 1,
          subject: 'Arts',
          language: 'fr',
          
          // Three-part lesson
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Planning details with French connection
          learningGoals: `Students will explore artistic expression and creativity. French language integration`,
          learningGoalsFr: `Les élèves exploreront l'expression artistique et la créativité. French language integration`,
          
          materials: JSON.stringify([
            'Paper and drawing materials',
            'Paint and brushes',
            'Natural materials',
            'Collage materials',
            'Mirrors',
            'Various art supplies'
          ]),
          
          grouping: 'whole class, individual creation, partner sharing',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Adapted tools (thick brushes, pencil grips)',
            'Choice of materials',
            'Extra time for creation',
            'Partner support'
          ]),
          
          modifications: JSON.stringify([
            'Simplified techniques',
            'Hand-over-hand support',
            'Pre-cut materials available',
            'Focus on process over product'
          ]),
          
          extensions: JSON.stringify([
            'Additional techniques',
            'Artist research',
            'Teach techniques to others',
            'Create artist statement'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Adapted materials, step-by-step guidance, focus on exploration',
            extension: 'Advanced techniques, artist study, peer teaching',
            multiModal: 'Visual, tactile, kinesthetic art experiences'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observation of creative process, effort, use of materials, French vocabulary in art contexts, self-expression',
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'Art materials organized in labeled bins, example artworks displayed, cleanup procedures posted, French art vocabulary visible'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - French language integration`);
      
      // Link Arts expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Arts',
          grade: 1
        },
        take: 2 // Link to first 2 arts expectations
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
    
    console.log('\n🎨 ARTS LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive arts lesson plans`);
    console.log('✅ September 4-30, 2025 fully planned');
    console.log('✅ 8 hours of arts instruction (2 per week)');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Creative exploration focus');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Differentiation in every lesson');
    console.log('✅ Process-focused assessment');
    console.log('✅ Sub-friendly with clear notes');
    console.log('\n🎉 Artistic expression in French for September 2025!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedArtsSeptemberLessonPlans()
  .then(() => console.log('\n🏆 Arts lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });