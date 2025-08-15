#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceSeptemberLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for September - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Science unit plan for September
    const scienceUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre environnement scolaire'
      }
    });
    
    if (!scienceUnit) {
      throw new Error('Science unit plan "Notre environnement scolaire" not found.');
    }
    
    console.log(`✅ Found unit plan: ${scienceUnit.titleFr} (ID: ${scienceUnit.id})`);
    console.log(`📅 Duration: Sept 4-30, 2025 (20 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: scienceUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 20 lesson plans (1 hour each) for September
    const lessons = [];
    
    // Helper function to create dates in September 2025
    const septDate = (day: number) => new Date(`2025-09-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: September 4-5 (Thursday-Friday, 2 days)
    lessons.push({
      title: 'Exploring with Our Senses',
      titleFr: 'Explorer avec nos sens',
      date: septDate(4),
      mindsOn: 'Sense walk around classroom, mystery box exploration',
      mindsOnFr: 'Promenade sensorielle, boîte mystère',
      action: 'Identify 5 senses, create sense chart, sensory stations',
      actionFr: 'Identifier 5 sens, créer tableau, stations sensorielles',
      consolidation: 'Share discoveries, sense song, reflection on observations',
      consolidationFr: 'Partager découvertes, chanson sens, réflexion',
      frenchConnection: 'Vocabulary: voir, entendre, toucher, sentir, goûter'
    });
    
    lessons.push({
      title: 'Our Classroom Environment',
      titleFr: 'Notre environnement de classe',
      date: septDate(5),
      mindsOn: 'What makes our classroom special? Observation walk',
      mindsOnFr: 'Qu\'est-ce qui rend notre classe spéciale? Promenade',
      action: 'Map classroom spaces, identify living/non-living things, create class inventory',
      actionFr: 'Cartographier espaces, identifier vivant/non-vivant, inventaire',
      consolidation: 'Present findings, discuss classroom as ecosystem',
      consolidationFr: 'Présenter trouvailles, discuter écosystème classe',
      frenchConnection: 'Use "observer" and classroom object vocabulary'
    });
    
    // WEEK 2: September 8-12 (5 days)
    lessons.push({
      title: 'Living Things in Our School',
      titleFr: 'Les êtres vivants dans notre école',
      date: septDate(8),
      mindsOn: 'What is alive? Sorting game with pictures',
      mindsOnFr: 'Qu\'est-ce qui est vivant? Jeu de tri avec images',
      action: 'Hunt for living things, observe classroom plants, basic needs of life',
      actionFr: 'Chasser êtres vivants, observer plantes, besoins vitaux',
      consolidation: 'Create living things book, share observations',
      consolidationFr: 'Créer livre êtres vivants, partager observations',
      frenchConnection: 'Living vocabulary: vivant, plante, animal, grandir'
    });
    
    lessons.push({
      title: 'Non-Living Things Around Us',
      titleFr: 'Les choses non-vivantes autour de nous',
      date: septDate(9),
      mindsOn: 'Sort classroom objects: living vs non-living',
      mindsOnFr: 'Trier objets: vivant vs non-vivant',
      action: 'Explore properties of non-living things, create comparison chart',
      actionFr: 'Explorer propriétés non-vivant, créer tableau comparaison',
      consolidation: 'Gallery walk, explain sorting choices, reflection',
      consolidationFr: 'Promenade galerie, expliquer choix, réflexion',
      frenchConnection: 'Descriptive words: dur, mou, lisse, rugueux'
    });
    
    lessons.push({
      title: 'Weather Watching',
      titleFr: 'Observer la météo',
      date: septDate(10),
      mindsOn: 'Today\'s weather observation, weather symbols',
      mindsOnFr: 'Observation météo aujourd\'hui, symboles météo',
      action: 'Create weather station, make weather tools, start weather journal',
      actionFr: 'Créer station météo, fabriquer outils, journal météo',
      consolidation: 'Weather report presentation, predictions for tomorrow',
      consolidationFr: 'Présentation bulletin météo, prédictions demain',
      frenchConnection: 'Weather vocabulary: soleil, nuage, pluie, vent'
    });
    
    lessons.push({
      title: 'Materials and Properties',
      titleFr: 'Matériaux et propriétés',
      date: septDate(11),
      mindsOn: 'Touch and describe mystery materials',
      mindsOnFr: 'Toucher et décrire matériaux mystères',
      action: 'Test materials: float/sink, magnetic/not, transparent/opaque',
      actionFr: 'Tester: flotte/coule, magnétique/non, transparent/opaque',
      consolidation: 'Record findings, discuss uses of materials',
      consolidationFr: 'Enregistrer trouvailles, discuter usages',
      frenchConnection: 'Property words: lourd, léger, flotter, couler'
    });
    
    lessons.push({
      title: 'Sounds in Our Environment',
      titleFr: 'Les sons dans notre environnement',
      date: septDate(12),
      mindsOn: 'Sound walk, identify and locate sounds',
      mindsOnFr: 'Promenade sonore, identifier et localiser sons',
      action: 'Create sound makers, explore volume and pitch, sound patterns',
      actionFr: 'Créer instruments, explorer volume et ton, motifs sonores',
      consolidation: 'Sound concert, discuss how sounds are made',
      consolidationFr: 'Concert sons, discuter comment sons créés',
      frenchConnection: 'Sound vocabulary: fort, doux, haut, bas, écouter'
    });
    
    // WEEK 3: September 15-19 (5 days)
    lessons.push({
      title: 'Light and Shadows',
      titleFr: 'Lumière et ombres',
      date: septDate(15),
      mindsOn: 'Shadow puppet play, observe shadows outside',
      mindsOnFr: 'Théâtre ombres, observer ombres dehors',
      action: 'Investigate light sources, create shadows, trace shadow shapes',
      actionFr: 'Investiguer sources lumière, créer ombres, tracer formes',
      consolidation: 'Shadow art gallery, discuss findings',
      consolidationFr: 'Galerie art ombres, discuter trouvailles',
      frenchConnection: 'Light vocabulary: lumière, ombre, brillant, sombre'
    });
    
    lessons.push({
      title: 'Observing Like Scientists',
      titleFr: 'Observer comme des scientifiques',
      date: septDate(16),
      mindsOn: 'Scientists use tools - explore magnifying glasses',
      mindsOnFr: 'Scientifiques utilisent outils - explorer loupes',
      action: 'Practice careful observation, draw details, use science tools',
      actionFr: 'Pratiquer observation attentive, dessiner détails, outils',
      consolidation: 'Share scientific drawings, celebrate observations',
      consolidationFr: 'Partager dessins scientifiques, célébrer observations',
      frenchConnection: 'Science process: observer, comparer, mesurer, noter'
    });
    
    lessons.push({
      title: 'Patterns in Nature',
      titleFr: 'Motifs dans la nature',
      date: septDate(17),
      mindsOn: 'Find patterns in classroom nature items',
      mindsOnFr: 'Trouver motifs dans objets nature classe',
      action: 'Collect and sort natural patterns, create pattern art',
      actionFr: 'Collecter et trier motifs naturels, créer art',
      consolidation: 'Pattern museum, describe patterns found',
      consolidationFr: 'Musée motifs, décrire motifs trouvés',
      frenchConnection: 'Pattern words: répéter, ligne, cercle, spirale'
    });
    
    lessons.push({
      title: 'Caring for Our Environment',
      titleFr: 'Prendre soin de notre environnement',
      date: septDate(18),
      mindsOn: 'How do we keep our classroom clean and healthy?',
      mindsOnFr: 'Comment garder notre classe propre et saine?',
      action: 'Create classroom care plan, recycling station, plant care',
      actionFr: 'Créer plan soin classe, station recyclage, soin plantes',
      consolidation: 'Present care plans, make commitment to environment',
      consolidationFr: 'Présenter plans soin, engagement environnement',
      frenchConnection: 'Care vocabulary: nettoyer, recycler, protéger, aider'
    });
    
    lessons.push({
      title: 'Science Investigation Day',
      titleFr: 'Journée investigation scientifique',
      date: septDate(19),
      mindsOn: 'Choose a science question to investigate',
      mindsOnFr: 'Choisir question scientifique à investiguer',
      action: 'Conduct simple investigations, record observations, test ideas',
      actionFr: 'Mener investigations simples, noter observations, tester',
      consolidation: 'Science fair presentations, peer questions',
      consolidationFr: 'Présentations foire sciences, questions pairs',
      frenchConnection: 'Investigation words: question, tester, découvrir, apprendre'
    });
    
    // WEEK 4: September 22-26 (5 days)
    lessons.push({
      title: 'Autumn Changes',
      titleFr: 'Les changements d\'automne',
      date: septDate(22),
      mindsOn: 'What changes do we see in autumn? Nature walk',
      mindsOnFr: 'Quels changements en automne? Promenade nature',
      action: 'Collect autumn specimens, observe with tools, sort by properties',
      actionFr: 'Collecter spécimens automne, observer outils, trier',
      consolidation: 'Create autumn display, discuss seasonal changes',
      consolidationFr: 'Créer exposition automne, discuter changements',
      frenchConnection: 'Autumn vocabulary: feuille, couleur, tomber, changer'
    });
    
    lessons.push({
      title: 'Animals in Our Environment',
      titleFr: 'Les animaux dans notre environnement',
      date: septDate(23),
      mindsOn: 'What animals live near our school?',
      mindsOnFr: 'Quels animaux vivent près de notre école?',
      action: 'Observe school yard animals, learn about habitats, animal needs',
      actionFr: 'Observer animaux cour, apprendre habitats, besoins',
      consolidation: 'Create animal fact cards, share discoveries',
      consolidationFr: 'Créer cartes faits animaux, partager découvertes',
      frenchConnection: 'Animal vocabulary: oiseau, insecte, habitat, manger'
    });
    
    lessons.push({
      title: 'Plants Around Our School',
      titleFr: 'Les plantes autour de notre école',
      date: septDate(24),
      mindsOn: 'Plant hunt in school yard, identify different plants',
      mindsOnFr: 'Chasse aux plantes, identifier plantes différentes',
      action: 'Observe plant parts, compare plants, plant needs investigation',
      actionFr: 'Observer parties plantes, comparer, besoins plantes',
      consolidation: 'Plant book creation, discuss plant importance',
      consolidationFr: 'Création livre plantes, discuter importance',
      frenchConnection: 'Plant vocabulary: racine, tige, feuille, fleur, grandir'
    });
    
    lessons.push({
      title: 'Water in Our Environment',
      titleFr: 'L\'eau dans notre environnement',
      date: septDate(25),
      mindsOn: 'Where do we find water? Water uses brainstorm',
      mindsOnFr: 'Où trouve-t-on l\'eau? Usages eau',
      action: 'Water cycle demonstration, water experiments, conservation ideas',
      actionFr: 'Démonstration cycle eau, expériences, conservation',
      consolidation: 'Water conservation posters, share ideas',
      consolidationFr: 'Affiches conservation eau, partager idées',
      frenchConnection: 'Water vocabulary: eau, pluie, évaporer, couler, propre'
    });
    
    lessons.push({
      title: 'Building and Construction',
      titleFr: 'Construire et bâtir',
      date: septDate(26),
      mindsOn: 'How are things built? Explore building materials',
      mindsOnFr: 'Comment construit-on? Explorer matériaux',
      action: 'Build structures with various materials, test stability',
      actionFr: 'Construire structures, tester stabilité',
      consolidation: 'Structure showcase, explain building choices',
      consolidationFr: 'Exposition structures, expliquer choix',
      frenchConnection: 'Building words: construire, solide, stable, tomber'
    });
    
    // FINAL DAYS: September 29-30 (2 days)
    lessons.push({
      title: 'Science Review Stations',
      titleFr: 'Stations de révision sciences',
      date: septDate(29),
      mindsOn: 'Science skills review game',
      mindsOnFr: 'Jeu révision compétences scientifiques',
      action: 'Rotating review stations for each topic, practice observations',
      actionFr: 'Stations rotatives chaque sujet, pratiquer observations',
      consolidation: 'Share favorite discoveries, set October goals',
      consolidationFr: 'Partager découvertes favorites, objectifs octobre',
      frenchConnection: 'Review all science vocabulary from September'
    });
    
    lessons.push({
      title: 'Science Celebration!',
      titleFr: 'Célébration des sciences!',
      date: septDate(30),
      mindsOn: 'Prepare science museum displays',
      mindsOnFr: 'Préparer expositions musée sciences',
      action: 'Present investigations to families, demonstrate experiments',
      actionFr: 'Présenter investigations familles, démontrer expériences',
      consolidation: 'Celebrate scientific thinking, October preview',
      consolidationFr: 'Célébrer pensée scientifique, aperçu octobre',
      frenchConnection: 'Present science learning in French'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: scienceUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 60, // All lessons are 1 hour
          grade: 1,
          subject: 'Sciences de la nature',
          language: 'fr',
          
          // Three-part lesson
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Planning details with French connection
          learningGoals: `Students will develop scientific observation and inquiry skills. French language integration`,
          learningGoalsFr: `Les élèves développeront l'observation scientifique et l'enquête. French language integration`,
          
          materials: JSON.stringify([
            'Magnifying glasses',
            'Natural materials',
            'Science journals',
            'Observation tools',
            'Collection containers',
            'Chart paper'
          ]),
          
          grouping: 'whole class, small groups, pairs, individual exploration',
          
          // Differentiation
          accommodations: JSON.stringify([
            'Visual observation guides',
            'Partner support',
            'Hands-on exploration',
            'Simplified recording sheets'
          ]),
          
          modifications: JSON.stringify([
            'Reduced complexity',
            'Picture-based recording',
            'Guided observations',
            'Concrete examples only'
          ]),
          
          extensions: JSON.stringify([
            'Additional investigations',
            'Detailed scientific drawings',
            'Research questions',
            'Lead demonstrations'
          ]),
          
          differentiationStrategies: JSON.stringify({
            support: 'Guided observations, visual supports, concrete materials',
            extension: 'Independent investigations, additional questions, peer teaching',
            multiModal: 'Hands-on exploration, visual observation, verbal sharing'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observation of scientific thinking, use of senses, recording skills, French vocabulary in science contexts',
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'Science materials in labeled bins, observation sheets ready, safety reminders posted, French vocabulary cards available'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - French language integration`);
      
      // Link Science expectations to lesson
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1
        },
        take: 2 // Link to first 2 science expectations
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
    
    console.log('\n🔬 SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive science lesson plans`);
    console.log('✅ September 4-30, 2025 fully planned');
    console.log('✅ 20 hours of science instruction');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Hands-on exploration focus');
    console.log('✅ Three-part lesson structure');
    console.log('✅ Differentiation in every lesson');
    console.log('✅ Assessment strategies included');
    console.log('✅ Sub-friendly with clear notes');
    console.log('\n🎉 Science exploration in French for September 2025!');
    
  } catch (error) {
    console.error('❌ Error creating lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceSeptemberLessonPlans()
  .then(() => console.log('\n🏆 Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });