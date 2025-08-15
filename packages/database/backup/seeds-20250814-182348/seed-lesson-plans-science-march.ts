#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceMarchLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for March - Grade 1 French Immersion...\n');
  console.log('🌱 Unit 5: Growing and Changing - Exploring growth and life cycles\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Growing and Changing unit plan
    const growthUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Grandir et changer'
      }
    });
    
    if (!growthUnit) {
      throw new Error('Growth unit plan "Grandir et changer" not found.');
    }
    
    console.log(`✅ Found unit plan: ${growthUnit.titleFr} (ID: ${growthUnit.id})`);
    console.log(`📅 Duration: Feb 17 - Apr 10, 2026\n`);
    
    // Clear existing March lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: growthUnit.id,
        date: {
          gte: new Date('2026-03-01'),
          lte: new Date('2026-03-31')
        }
      }
    });
    
    console.log('🗑️ Cleared existing March lesson plans\n');
    
    // Create lesson plans for March 2026
    const lessons = [];
    
    // Helper function to create dates in March 2026
    const marDate = (day: number) => new Date(`2026-03-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: March 2-6
    lessons.push({
      title: 'Seeds and Growth',
      titleFr: 'Graines et croissance',
      date: marDate(2), // Monday
      mindsOn: 'Seed exploration - what\'s inside a seed?',
      mindsOnFr: 'Explorer graines - qu\'y a-t-il dans une graine?',
      action: 'Dissect large seeds, plant different seeds, start growth journals',
      actionFr: 'Disséquer grosses graines, planter graines différentes, journaux croissance',
      consolidation: 'Predict which seeds will grow first and why',
      consolidationFr: 'Prédire quelles graines pousseront en premier et pourquoi',
      frenchConnection: 'Seed vocabulary: graine, germer, racine, pousser, planter'
    });
    
    lessons.push({
      title: 'Plant Parts and Functions',
      titleFr: 'Parties des plantes et fonctions',
      date: marDate(4), // Wednesday
      mindsOn: 'Plant investigation - examine different plant parts',
      mindsOnFr: 'Investigation plantes - examiner parties plantes différentes',
      action: 'Dissect flowers, observe roots, stem experiments, leaf functions',
      actionFr: 'Disséquer fleurs, observer racines, expériences tiges, fonctions feuilles',
      consolidation: 'Create plant part books with functions explained',
      consolidationFr: 'Créer livres parties plantes avec fonctions expliquées',
      frenchConnection: 'Plant parts vocabulary: racine, tige, feuille, fleur, fruit'
    });
    
    lessons.push({
      title: 'What Plants Need to Grow',
      titleFr: 'Ce dont les plantes ont besoin pour grandir',
      date: marDate(6), // Friday
      mindsOn: 'Plant needs investigation - missing element experiments',
      mindsOnFr: 'Investigation besoins plantes - expériences éléments manquants',
      action: 'Set up controlled experiments: light, water, soil, air variables',
      actionFr: 'Installer expériences contrôlées: variables lumière, eau, terre, air',
      consolidation: 'Make predictions about plant growth experiments',
      consolidationFr: 'Faire prédictions sur expériences croissance plantes',
      frenchConnection: 'Plant needs vocabulary: lumière, eau, terre, air, nourrir'
    });
    
    // WEEK 2: March 9-13
    lessons.push({
      title: 'Measuring Plant Growth',
      titleFr: 'Mesurer la croissance des plantes',
      date: marDate(9), // Monday
      mindsOn: 'Growth measurement - how do we track plant changes?',
      mindsOnFr: 'Mesurer croissance - comment suivre changements plantes?',
      action: 'Measure plants daily, create growth charts, photograph changes',
      actionFr: 'Mesurer plantes quotidiennement, créer graphiques, photographier changements',
      consolidation: 'Compare growth rates of different plants',
      consolidationFr: 'Comparer vitesses croissance plantes différentes',
      frenchConnection: 'Measurement vocabulary: mesurer, grandir, haut, long, comparer'
    });
    
    lessons.push({
      title: 'Life Cycle of a Plant',
      titleFr: 'Cycle de vie d\'une plante',
      date: marDate(11), // Wednesday
      mindsOn: 'Life cycle cards - put plant growth stages in order',
      mindsOnFr: 'Cartes cycle vie - mettre étapes croissance en ordre',
      action: 'Create plant life cycle wheels, observe seeds at different stages',
      actionFr: 'Créer roues cycle vie plantes, observer graines étapes différentes',
      consolidation: 'Present plant life cycle stories and demonstrations',
      consolidationFr: 'Présenter histoires cycle vie et démonstrations',
      frenchConnection: 'Life cycle vocabulary: cycle, naître, grandir, reproduire, mourir'
    });
    
    lessons.push({
      title: 'Baby Animals',
      titleFr: 'Bébés animaux',
      date: marDate(13), // Friday
      mindsOn: 'Baby animal matching game - match babies to parents',
      mindsOnFr: 'Jeu association bébés animaux - associer bébés aux parents',
      action: 'Research how baby animals are born and cared for',
      actionFr: 'Rechercher comment bébés animaux naissent et sont soignés',
      consolidation: 'Create baby animal care guides',
      consolidationFr: 'Créer guides soins bébés animaux',
      frenchConnection: 'Baby animals vocabulary: bébé, petit, naître, soigner, grandir'
    });
    
    // WEEK 3: March 16-20
    lessons.push({
      title: 'Animal Life Cycles',
      titleFr: 'Cycles de vie des animaux',
      date: marDate(16), // Monday
      mindsOn: 'Butterfly life cycle observation - real caterpillars',
      mindsOnFr: 'Observer cycle vie papillon - vraies chenilles',
      action: 'Set up butterfly garden, document metamorphosis stages',
      actionFr: 'Installer jardin papillons, documenter étapes métamorphose',
      consolidation: 'Compare different animal life cycles',
      consolidationFr: 'Comparer cycles vie animaux différents',
      frenchConnection: 'Metamorphosis vocabulary: chenille, chrysalide, papillon, transformer'
    });
    
    lessons.push({
      title: 'How Animals Grow',
      titleFr: 'Comment les animaux grandissent',
      date: marDate(18), // Wednesday
      mindsOn: 'Animal growth patterns - fast growers vs slow growers',
      mindsOnFr: 'Modèles croissance animaux - croissance rapide vs lente',
      action: 'Research animal growth rates, create growth timelines',
      actionFr: 'Rechercher vitesses croissance, créer chronologies croissance',
      consolidation: 'Present amazing animal growth facts',
      consolidationFr: 'Présenter faits incroyables croissance animaux',
      frenchConnection: 'Animal growth vocabulary: rapide, lent, temps, développer, adulte'
    });
    
    lessons.push({
      title: 'Caring for Baby Animals',
      titleFr: 'Prendre soin des bébés animaux',
      date: marDate(20), // Friday
      mindsOn: 'How do animal parents care for babies?',
      mindsOnFr: 'Comment parents animaux soignent-ils bébés?',
      action: 'Research parental care in different animals, role-play animal families',
      actionFr: 'Rechercher soins parentaux animaux différents, jeux rôle familles',
      consolidation: 'Create animal family care stories',
      consolidationFr: 'Créer histoires soins familles animaux',
      frenchConnection: 'Animal care vocabulary: protéger, nourrir, enseigner, famille, amour'
    });
    
    // WEEK 4: March 23-27
    lessons.push({
      title: 'How Humans Grow',
      titleFr: 'Comment les humains grandissent',
      date: marDate(23), // Monday
      mindsOn: 'Human growth investigation - baby to adult photo sequence',
      mindsOnFr: 'Investigation croissance humaine - séquence photos bébé à adulte',
      action: 'Create personal growth timelines, measure and compare heights',
      actionFr: 'Créer chronologies croissance personnelles, mesurer comparer tailles',
      consolidation: 'Share growth stories and celebrate differences',
      consolidationFr: 'Partager histoires croissance, célébrer différences',
      frenchConnection: 'Human growth vocabulary: bébé, enfant, adolescent, adulte, grandir'
    });
    
    lessons.push({
      title: 'Our Growing Bodies',
      titleFr: 'Nos corps qui grandissent',
      date: marDate(25), // Wednesday
      mindsOn: 'Body changes investigation - what changes as we grow?',
      mindsOnFr: 'Investigation changements corps - qu\'est-ce qui change en grandissant?',
      action: 'Compare baby and adult body proportions, measure body parts',
      actionFr: 'Comparer proportions corps bébé et adulte, mesurer parties corps',
      consolidation: 'Create "How We Grow" body books',
      consolidationFr: 'Créer livres "Comment nous grandissons"',
      frenchConnection: 'Body vocabulary: corps, tête, bras, jambes, changer'
    });
    
    lessons.push({
      title: 'What Helps Us Grow',
      titleFr: 'Ce qui nous aide à grandir',
      date: marDate(27), // Friday
      mindsOn: 'Growth needs brainstorm - what do growing children need?',
      mindsOnFr: 'Remue-méninges besoins croissance - que faut-il aux enfants?',
      action: 'Research healthy growth habits, create growth recipes',
      actionFr: 'Rechercher habitudes croissance saines, créer recettes croissance',
      consolidation: 'Present healthy growth plans to families',
      consolidationFr: 'Présenter plans croissance saine aux familles',
      frenchConnection: 'Growth needs vocabulary: nourriture, exercice, sommeil, santé, grandir'
    });
    
    // WEEK 5: March 30-31 (Short week)
    lessons.push({
      title: 'Growth and Change Museum Preparation',
      titleFr: 'Préparation musée croissance et changement',
      date: marDate(30), // Monday
      mindsOn: 'Growth museum planning - what will we display?',
      mindsOnFr: 'Planification musée croissance - qu\'allons-nous exposer?',
      action: 'Organize growth experiments, create display labels, practice presentations',
      actionFr: 'Organiser expériences croissance, créer étiquettes, pratiquer présentations',
      consolidation: 'Set up growth and change science museum',
      consolidationFr: 'Installer musée sciences croissance et changement',
      frenchConnection: 'Museum vocabulary: musée, exposition, présenter, montrer, apprendre'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating March lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: growthUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // Standard 45-minute science lessons
          grade: 1,
          subject: 'Sciences de la nature',
          language: 'fr',
          
          // Three-part lesson structure
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals with French integration
          learningGoals: `Students will investigate growth and life cycles through hands-on exploration and observation. French language integration`,
          learningGoalsFr: `Les élèves investigueront croissance et cycles de vie par exploration et observation. French language integration`,
          
          materials: JSON.stringify([
            'Seeds and planting materials',
            'Plant observation tools',
            'Growth measurement tools',
            'Life cycle materials',
            'Animal life cycle cards',
            'Science journals',
            'Magnifying glasses',
            'Camera for documentation',
            'French vocabulary cards'
          ]),
          
          grouping: 'whole class investigations, small group planting, individual observations, partner discussions',
          
          // Comprehensive differentiation for growth investigations
          accommodations: JSON.stringify([
            'Visual life cycle supports',
            'Hands-on exploration opportunities',
            'Partner support for measurements',
            'Flexible recording methods',
            'Extended observation time',
            'Multiple ways to show understanding'
          ]),
          
          modifications: JSON.stringify([
            'Simplified life cycle concepts',
            'Picture-based growth tracking',
            'Concrete growth examples',
            'Guided observation sheets',
            'Basic measurement activities'
          ]),
          
          extensions: JSON.stringify([
            'Advanced plant experiments',
            'Research unusual life cycles',
            'Create growth teaching materials',
            'Independent growth investigations',
            'Mentor younger students in planting',
            'Design plant growth experiments'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Growth charts, life cycle diagrams, photo documentation, visual vocabulary',
            kinesthetic: 'Hands-on planting, measurement activities, life cycle acting',
            auditory: 'Growth stories, peer discussions, presentation opportunities',
            support: 'Guided investigations, peer partnerships, visual supports',
            extension: 'Independent research, complex investigations, teaching opportunities'
          }),
          
          // Assessment strategies for growth learning
          assessmentType: 'formative',
          assessmentNotes: 'Observe understanding of growth concepts, measurement skills, life cycle knowledge, French science vocabulary use, collaborative investigation skills',
          
          // Rich cross-curricular connections

            math: 'Measurement skills, data collection, graphing growth, comparing sizes',
            french: 'Growth vocabulary, scientific descriptions, presentation skills',
            art: 'Life cycle illustrations, growth journals, scientific drawings',
            health: 'Human growth and development, healthy habits for growth',
            socialStudies: 'Family growth stories, caring for others, helping community grow'
          }),
          
          // Indigenous perspectives on growth
          indigenousPerspectives: 'Traditional plant knowledge, seasonal growing cycles, respect for all growing things, traditional medicines from plants',
          
          // Environmental education connections
          environmentalEducation: 'Plant importance in ecosystems, caring for growing things, sustainable gardening, protecting habitats for animal growth',
          
          // Technology integration
          technologyIntegration: 'Time-lapse videos of growth, digital measurement tools, growth tracking apps, microscopes for detailed observation',
          
          // Community connections
          communityConnections: 'Local farmers and gardeners, greenhouse visits, community gardens, agricultural societies',
          
          // Sub-friendly design
          isSubFriendly: true,
          subNotes: 'Growth materials in organized bins, plant care instructions posted, measurement tools readily available, backup indoor activities, French vocabulary displayed'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - Growth and life cycles focus`);
      
      // Link relevant curriculum expectations
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1,
          OR: [
            { code: '1.1.1' }, // Living things characteristics (for growth)
            { code: '1.1.2' }  // Human impact on environment (for caring for growing things)
          ]
        }
      });
      
      for (const expectation of expectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log('\n🌱 MARCH GROWTH & CHANGE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive growth investigation lesson plans`);
    console.log('✅ March 2-30, 2026 fully planned');
    console.log('✅ 10 lessons of hands-on growth exploration');
    console.log('✅ Plant and animal life cycle investigations');
    console.log('✅ Human growth and development included');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for diverse learners');
    console.log('✅ Assessment strategies for growth concepts');
    console.log('✅ Sub-friendly with organized materials');
    console.log('✅ Strong Indigenous and environmental connections');
    console.log('\n🌱 Growing and changing investigations ready for March 2026!');
    
  } catch (error) {
    console.error('❌ Error creating March lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceMarchLessonPlans()
  .then(() => console.log('\n🏆 March Growth & Change lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });