#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceAprilLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for April - Grade 1 French Immersion...\n');
  console.log('🌱 Completing Unit 5: Growing and Changing (Apr 1-10)');
  console.log('🌸 Beginning Unit 6: Spring Awakening (Apr 13-May 15)\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get both unit plans
    const growthUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Grandir et changer'
      }
    });
    
    const springUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Le réveil du printemps'
      }
    });
    
    if (!growthUnit || !springUnit) {
      throw new Error('Unit plans not found for April lessons.');
    }
    
    console.log(`✅ Found Growth unit: ${growthUnit.titleFr} (ID: ${growthUnit.id})`);
    console.log(`✅ Found Spring unit: ${springUnit.titleFr} (ID: ${springUnit.id})\n`);
    
    // Clear existing April lesson plans for both units
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: { in: [growthUnit.id, springUnit.id] },
        date: {
          gte: new Date('2026-04-01'),
          lte: new Date('2026-04-30')
        }
      }
    });
    
    console.log('🗑️ Cleared existing April lesson plans\n');
    
    // Create lesson plans for April 2026
    const lessons = [];
    
    // Helper function to create dates in April 2026
    const aprDate = (day: number) => new Date(`2026-04-${day.toString().padStart(2, '0')}`);
    
    // UNIT 5 COMPLETION: April 1-10 (Growing and Changing)
    lessons.push({
      title: 'Growth Investigation Results',
      titleFr: 'Résultats investigation croissance',
      date: aprDate(1), // Wednesday
      unitId: growthUnit.id,
      mindsOn: 'Plant growth check - compare all our growing experiments',
      mindsOnFr: 'Vérification croissance plantes - comparer expériences croissance',
      action: 'Measure plants, analyze growth data, document changes with photos',
      actionFr: 'Mesurer plantes, analyser données croissance, documenter changements photos',
      consolidation: 'Create growth success stories and challenges',
      consolidationFr: 'Créer histoires succès croissance et défis',
      frenchConnection: 'Results vocabulary: résultat, succès, défi, analyser, comparer'
    });
    
    lessons.push({
      title: 'Life Cycles All Around Us',
      titleFr: 'Cycles de vie tout autour de nous',
      date: aprDate(3), // Friday
      unitId: growthUnit.id,
      mindsOn: 'Life cycle hunt - find examples of different life stages',
      mindsOnFr: 'Chasse cycles vie - trouver exemples étapes vie différentes',
      action: 'Document life cycles found in school environment, create cycle displays',
      actionFr: 'Documenter cycles vie trouvés environnement école, créer expositions',
      consolidation: 'Present life cycle discoveries to other classes',
      consolidationFr: 'Présenter découvertes cycles vie aux autres classes',
      frenchConnection: 'Life stages vocabulary: étape, début, milieu, fin, cycle'
    });
    
    lessons.push({
      title: 'Taking Care of Growing Things',
      titleFr: 'Prendre soin des choses qui grandissent',
      date: aprDate(7), // Tuesday
      unitId: growthUnit.id,
      mindsOn: 'Care responsibilities - how do we help things grow?',
      mindsOnFr: 'Responsabilités soins - comment aider choses grandir?',
      action: 'Create care guides for plants and animals, design care schedules',
      actionFr: 'Créer guides soins plantes et animaux, concevoir horaires soins',
      consolidation: 'Commit to caring actions and share with families',
      consolidationFr: 'S\'engager actions soins, partager avec familles',
      frenchConnection: 'Care vocabulary: soigner, responsabilité, aider, engagement, protéger'
    });
    
    lessons.push({
      title: 'Growth and Change Celebration',
      titleFr: 'Célébration croissance et changement',
      date: aprDate(9), // Thursday
      unitId: growthUnit.id,
      mindsOn: 'Growth showcase preparation - celebrate all our learning',
      mindsOnFr: 'Préparation exposition croissance - célébrer apprentissage',
      action: 'Set up growth museum, practice presentations, invite families',
      actionFr: 'Installer musée croissance, pratiquer présentations, inviter familles',
      consolidation: 'Celebrate growth discoveries and transition to spring',
      consolidationFr: 'Célébrer découvertes croissance, transition vers printemps',
      frenchConnection: 'Celebration vocabulary: célébrer, réussite, partager, fierté'
    });
    
    // UNIT 6 BEGINNING: April 14-30 (Spring Awakening)
    lessons.push({
      title: 'Signs of Spring',
      titleFr: 'Signes du printemps',
      date: aprDate(14), // Monday - Unit 6 begins
      unitId: springUnit.id,
      mindsOn: 'Spring observation walk - what changes do we notice?',
      mindsOnFr: 'Promenade observation printemps - quels changements remarquer?',
      action: 'Create spring change journals, document spring evidence with photos',
      actionFr: 'Créer journaux changements printemps, documenter preuves photos',
      consolidation: 'Share spring discoveries and make spring predictions',
      consolidationFr: 'Partager découvertes printemps, faire prédictions printemps',
      frenchConnection: 'Spring vocabulary: printemps, bourgeon, fleurir, vert, nouveau'
    });
    
    lessons.push({
      title: 'Spring Weather Patterns',
      titleFr: 'Régularités météorologiques printanières',
      date: aprDate(16), // Wednesday
      unitId: springUnit.id,
      mindsOn: 'Spring weather investigation - how is spring weather different?',
      mindsOnFr: 'Investigation météo printemps - comment météo printemps différente?',
      action: 'Track spring weather daily, compare to winter data, rain experiments',
      actionFr: 'Suivre météo printemps quotidiennement, comparer données hiver, expériences pluie',
      consolidation: 'Create spring weather reports and predictions',
      consolidationFr: 'Créer bulletins météo printemps et prédictions',
      frenchConnection: 'Spring weather vocabulary: pluie, soleil, doux, vent, nuage'
    });
    
    lessons.push({
      title: 'Plants Wake Up in Spring',
      titleFr: 'Les plantes se réveillent au printemps',
      date: aprDate(18), // Friday
      unitId: springUnit.id,
      mindsOn: 'Plant awakening observation - examine buds and early growth',
      mindsOnFr: 'Observer réveil plantes - examiner bourgeons, croissance précoce',
      action: 'Document plant changes, force branches to bloom, start spring garden',
      actionFr: 'Documenter changements plantes, forcer branches fleurir, jardin printemps',
      consolidation: 'Create plant awakening timeline and care plans',
      consolidationFr: 'Créer chronologie réveil plantes, plans soins',
      frenchConnection: 'Plant spring vocabulary: bourgeon, feuille, fleur, pousser, éclore'
    });
    
    lessons.push({
      title: 'Spring Animal Activities',
      titleFr: 'Activités animales printanières',
      date: aprDate(21), // Monday
      unitId: springUnit.id,
      mindsOn: 'Animal spring behaviors - what are animals doing now?',
      mindsOnFr: 'Comportements animaux printemps - que font animaux maintenant?',
      action: 'Observe spring animal activities, research migration returns, nest building',
      actionFr: 'Observer activités animaux printemps, rechercher retours migration, nidification',
      consolidation: 'Create spring animal activity guides',
      consolidationFr: 'Créer guides activités animaux printemps',
      frenchConnection: 'Spring animals vocabulary: nid, œuf, migration, retour, actif'
    });
    
    lessons.push({
      title: 'Spring Sounds and Smells',
      titleFr: 'Sons et odeurs du printemps',
      date: aprDate(23), // Wednesday
      unitId: springUnit.id,
      mindsOn: 'Sensory spring exploration - what sounds and smells are new?',
      mindsOnFr: 'Exploration sensorielle printemps - quels sons, odeurs nouveaux?',
      action: 'Create spring sensory maps, record spring sounds, smell investigations',
      actionFr: 'Créer cartes sensorielles printemps, enregistrer sons, investigations odeurs',
      consolidation: 'Share spring sensory experiences and create sensory poems',
      consolidationFr: 'Partager expériences sensorielles, créer poèmes sensoriels',
      frenchConnection: 'Senses vocabulary: entendre, sentir, doux, fort, parfum'
    });
    
    lessons.push({
      title: 'How Day Length Changes',
      titleFr: 'Comment la longueur du jour change',
      date: aprDate(25), // Friday
      unitId: springUnit.id,
      mindsOn: 'Daylight investigation - is it light longer now?',
      mindsOnFr: 'Investigation lumière jour - fait-il jour plus longtemps?',
      action: 'Track sunrise/sunset times, shadow experiments, daylight graphing',
      actionFr: 'Suivre heures lever/coucher soleil, expériences ombres, graphiques',
      consolidation: 'Compare spring daylight to winter, predict summer changes',
      consolidationFr: 'Comparer lumière printemps à hiver, prédire changements été',
      frenchConnection: 'Daylight vocabulary: jour, nuit, long, court, lumière'
    });
    
    lessons.push({
      title: 'Spring Colors Everywhere',
      titleFr: 'Couleurs du printemps partout',
      date: aprDate(28), // Monday
      unitId: springUnit.id,
      mindsOn: 'Color hunt - find all the new spring colors',
      mindsOnFr: 'Chasse couleurs - trouver nouvelles couleurs printemps',
      action: 'Create spring color palettes, natural dye experiments, color mixing',
      actionFr: 'Créer palettes couleurs printemps, expériences teintures naturelles, mélanger',
      consolidation: 'Create spring color art gallery and color explanations',
      consolidationFr: 'Créer galerie art couleurs printemps, explications couleurs',
      frenchConnection: 'Color vocabulary: couleur, vert, rose, jaune, mélanger'
    });
    
    lessons.push({
      title: 'Celebrating Spring Changes',
      titleFr: 'Célébrer les changements du printemps',
      date: aprDate(30), // Wednesday
      unitId: springUnit.id,
      mindsOn: 'Spring celebration preparation - how will we celebrate spring?',
      mindsOnFr: 'Préparation célébration printemps - comment célébrer printemps?',
      action: 'Plan spring celebration activities, create spring displays, practice songs',
      actionFr: 'Planifier activités célébration, créer expositions, pratiquer chansons',
      consolidation: 'Spring celebration with families and spring learning showcase',
      consolidationFr: 'Célébration printemps familles, exposition apprentissages printemps',
      frenchConnection: 'Celebration vocabulary: fête, célébrer, joie, partager, printemps'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating April lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: lessonData.unitId,
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
          learningGoals: `Students will observe and document seasonal changes from winter through spring. French language integration`,
          learningGoalsFr: `Les élèves observeront et documenteront changements saisonniers hiver au printemps. French language integration`,
          
          materials: JSON.stringify([
            'Seasonal observation tools',
            'Cameras for documentation',
            'Science journals',
            'Measurement tools',
            'Spring investigation materials',
            'Plant care supplies',
            'Magnifying glasses',
            'French vocabulary cards',
            'Art supplies for displays'
          ]),
          
          grouping: 'whole class observations, small group investigations, individual journaling, partner sharing',
          
          // Comprehensive differentiation
          accommodations: JSON.stringify([
            'Visual supports for seasonal concepts',
            'Hands-on seasonal exploration',
            'Multiple recording options',
            'Partner support for observations',
            'Extended time for documentation',
            'Choice in presentation formats'
          ]),
          
          modifications: JSON.stringify([
            'Simplified seasonal concepts',
            'Picture-based observation guides',
            'Concrete examples of changes',
            'Guided investigation steps',
            'Basic comparison activities'
          ]),
          
          extensions: JSON.stringify([
            'Independent seasonal research',
            'Advanced spring investigations',
            'Create spring teaching materials',
            'Lead nature walks for younger students',
            'Design spring science experiments',
            'Connect to global spring phenomena'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Seasonal change charts, photo documentation, visual vocabulary, diagrams',
            kinesthetic: 'Outdoor investigations, hands-on experiments, building activities',
            auditory: 'Nature sounds, discussions, seasonal stories, songs',
            support: 'Guided observations, peer partnerships, step-by-step guides',
            extension: 'Independent research, complex investigations, leadership roles'
          }),
          
          // Assessment strategies
          assessmentType: lessonData.title.includes('Celebration') ? 'summative' : 'formative',
          assessmentNotes: 'Observe seasonal change understanding, observation skills, French science vocabulary, investigation abilities, collaborative work',
          
          // Rich cross-curricular connections

            math: 'Measurement skills, data collection, graphing changes, time concepts',
            french: 'Seasonal vocabulary, descriptive language, presentation skills',
            art: 'Seasonal art, nature drawings, color exploration, creative displays',
            music: 'Spring songs, nature sounds, seasonal rhythms',
            socialStudies: 'Community spring activities, seasonal celebrations, helping others'
          }),
          
          // Indigenous perspectives
          indigenousPerspectives: 'Traditional seasonal knowledge, spring ceremonies, seasonal rounds, traditional spring foods and medicines',
          
          // Environmental education
          environmentalEducation: 'Spring ecosystem changes, caring for emerging life, climate change effects on seasons, protecting spring habitats',
          
          // Technology integration
          technologyIntegration: 'Digital weather tracking, time-lapse videos of spring changes, photography for documentation, online seasonal resources',
          
          // Community connections
          communityConnections: 'Local naturalists, community gardens, spring festivals, agricultural knowledge sharing, elder seasonal teachings',
          
          // Sub-friendly design
          isSubFriendly: true,
          subNotes: 'Seasonal materials organized in bins, outdoor alternatives prepared, vocabulary visibly displayed, backup indoor activities, clear daily routines'
        }
      });
      
      lessonCount++;
      const unitName = lessonData.unitId === growthUnit.id ? 'Growth & Change' : 'Spring Awakening';
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - ${unitName}`);
      
      // Link relevant curriculum expectations
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1,
          OR: [
            { code: '1.1.1' }, // Living things (for growth and spring life)
            { code: '1.3.1' }, // Daily and seasonal changes
            { code: '1.3.2' }  // Effects of seasonal changes on living things
          ]
        }
      });
      
      // Link appropriate expectations based on unit
      const relevantExpectations = lessonData.unitId === growthUnit.id 
        ? expectations.filter(e => e.code === '1.1.1').slice(0, 1)
        : expectations.filter(e => e.code.startsWith('1.3')).slice(0, 2);
      
      for (const expectation of relevantExpectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log('\n🌱🌸 APRIL SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans`);
    console.log('✅ April 1-30, 2026 fully planned');
    console.log('✅ Unit 5 completion (4 lessons): Growth & Change celebration');
    console.log('✅ Unit 6 beginning (8 lessons): Spring Awakening investigations');
    console.log('✅ Smooth transition between units');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for all learners');
    console.log('✅ Assessment strategies included');
    console.log('✅ Strong seasonal observation focus');
    console.log('✅ Sub-friendly with organized materials');
    console.log('\n🌸 Spring awakening and growth celebration ready for April 2026!');
    
  } catch (error) {
    console.error('❌ Error creating April lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceAprilLessonPlans()
  .then(() => console.log('\n🏆 April Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });