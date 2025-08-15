#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceJanuaryLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for January - Grade 1 French Immersion...\n');
  console.log('❄️ Unit 4: Winter Wonders - Discovering winter\'s impact on our world\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Winter Wonders unit plan
    const winterUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Les merveilles de l\'hiver'
      }
    });
    
    if (!winterUnit) {
      throw new Error('Winter unit plan "Les merveilles de l\'hiver" not found.');
    }
    
    console.log(`✅ Found unit plan: ${winterUnit.titleFr} (ID: ${winterUnit.id})`);
    console.log(`📅 Duration: Jan 5 - Feb 13, 2026\n`);
    
    // Clear existing January lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: winterUnit.id,
        date: {
          gte: new Date('2026-01-01'),
          lte: new Date('2026-01-31')
        }
      }
    });
    
    console.log('🗑️ Cleared existing January lesson plans\n');
    
    // Create lesson plans for January 2026
    const lessons = [];
    
    // Helper function to create dates in January 2026
    const janDate = (day: number) => new Date(`2026-01-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: January 6-10 (School resumes Jan 5, but first science lesson Jan 6)
    lessons.push({
      title: 'Welcome Back to Winter Science',
      titleFr: 'Retour aux sciences d\'hiver',
      date: janDate(6), // Monday
      mindsOn: 'Winter break sharing - what winter changes did we observe?',
      mindsOnFr: 'Partage vacances - quels changements hiver observés?',
      action: 'Create winter observation journals, set up winter weather station',
      actionFr: 'Créer journaux observation hiver, station météo hivernale',
      consolidation: 'Share winter discoveries and make predictions for January',
      consolidationFr: 'Partager découvertes, faire prédictions janvier',
      frenchConnection: 'Winter vocabulary: hiver, froid, neige, glace, observer'
    });
    
    lessons.push({
      title: 'Winter Weather Patterns',
      titleFr: 'Les régularités météorologiques hivernales',
      date: janDate(8), // Wednesday
      mindsOn: 'Temperature investigation - measuring winter temperatures',
      mindsOnFr: 'Investigation température - mesurer températures hiver',
      action: 'Daily weather tracking, create temperature graphs, winter safety rules',
      actionFr: 'Suivi météo quotidien, graphiques température, règles sécurité',
      consolidation: 'Compare winter weather to fall weather patterns',
      consolidationFr: 'Comparer météo hiver aux régularités automne',
      frenchConnection: 'Weather vocabulary: température, thermomètre, degré, mesurer'
    });
    
    lessons.push({
      title: 'Ice and Water Experiments',
      titleFr: 'Expériences glace et eau',
      date: janDate(10), // Friday
      mindsOn: 'Ice exploration - observe ice cubes melting and freezing',
      mindsOnFr: 'Explorer glace - observer glaçons fondre et geler',
      action: 'Freeze and melt experiments, observe state changes, measure time',
      actionFr: 'Expériences geler/fondre, observer changements état, mesurer temps',
      consolidation: 'Discuss when water becomes ice and why',
      consolidationFr: 'Discuter quand eau devient glace et pourquoi',
      frenchConnection: 'States vocabulary: solide, liquide, geler, fondre, changer'
    });
    
    // WEEK 2: January 13-17
    lessons.push({
      title: 'Animals in Winter',
      titleFr: 'Les animaux en hiver',
      date: janDate(13), // Monday
      mindsOn: 'Winter animal mystery - where do animals go in winter?',
      mindsOnFr: 'Mystère animaux hiver - où vont animaux en hiver?',
      action: 'Research winter animal adaptations, create animal winter homes',
      actionFr: 'Rechercher adaptations animaux, créer maisons hiver animaux',
      consolidation: 'Animal adaptation presentations and winter survival strategies',
      consolidationFr: 'Présentations adaptations, stratégies survie hiver',
      frenchConnection: 'Animal adaptation vocabulary: hiberner, migrer, adaptation, survie'
    });
    
    lessons.push({
      title: 'Winter Trees and Plants',
      titleFr: 'Arbres et plantes d\'hiver',
      date: janDate(15), // Wednesday
      mindsOn: 'Tree observation walk - how do trees survive winter?',
      mindsOnFr: 'Promenade arbres - comment arbres survivent hiver?',
      action: 'Compare evergreen and deciduous trees, examine tree protection',
      actionFr: 'Comparer conifères et feuillus, examiner protection arbres',
      consolidation: 'Create tree survival guide for different tree types',
      consolidationFr: 'Créer guide survie arbres pour différents types',
      frenchConnection: 'Tree vocabulary: conifère, feuillu, écorce, branches, survivre'
    });
    
    lessons.push({
      title: 'Snow Science',
      titleFr: 'La science de la neige',
      date: janDate(17), // Friday
      mindsOn: 'Snowflake investigation - examine snow crystals with magnifiers',
      mindsOnFr: 'Investigation flocons - examiner cristaux avec loupes',
      action: 'Create paper snowflakes, observe real snow structure, measure snowfall',
      actionFr: 'Créer flocons papier, observer structure vraie neige, mesurer',
      consolidation: 'Compare different snow types and what makes good snow',
      consolidationFr: 'Comparer types neige différents et bonne neige',
      frenchConnection: 'Snow vocabulary: neige, flocon, cristal, blanc, tomber'
    });
    
    // WEEK 3: January 20-24
    lessons.push({
      title: 'Winter Clothing Investigation',
      titleFr: 'Investigation vêtements d\'hiver',
      date: janDate(20), // Monday
      mindsOn: 'Material warmth test - which fabrics keep us warmest?',
      mindsOnFr: 'Test chaleur matériaux - quels tissus gardent plus chaud?',
      action: 'Test different materials for warmth, design winter clothing',
      actionFr: 'Tester matériaux différents, concevoir vêtements hiver',
      consolidation: 'Fashion show of designed winter clothing with explanations',
      consolidationFr: 'Défilé vêtements hiver conçus avec explications',
      frenchConnection: 'Clothing vocabulary: vêtements, chaud, tissu, porter, protéger'
    });
    
    lessons.push({
      title: 'Winter Sports and Safety',
      titleFr: 'Sports d\'hiver et sécurité',
      date: janDate(22), // Wednesday
      mindsOn: 'Winter activity brainstorm - what can we do safely in winter?',
      mindsOnFr: 'Remue-méninges activités - que faire sécuritairement hiver?',
      action: 'Research winter sports, create safety rules, design winter games',
      actionFr: 'Rechercher sports hiver, créer règles sécurité, concevoir jeux',
      consolidation: 'Present winter safety campaigns to younger students',
      consolidationFr: 'Présenter campagnes sécurité aux élèves plus jeunes',
      frenchConnection: 'Sports vocabulary: patiner, skier, jouer, sécurité, attention'
    });
    
    lessons.push({
      title: 'How We Stay Warm',
      titleFr: 'Comment nous restons au chaud',
      date: janDate(24), // Friday
      mindsOn: 'Body heat investigation - feel warmth from movement and breathing',
      mindsOnFr: 'Investigation chaleur corps - sentir chaleur mouvement, respiration',
      action: 'Experiment with ways to stay warm, create warmth strategies',
      actionFr: 'Expérimenter façons rester chaud, créer stratégies chaleur',
      consolidation: 'Share personal warmth tips and family traditions',
      consolidationFr: 'Partager conseils chaleur personnels, traditions famille',
      frenchConnection: 'Warmth vocabulary: chaud, chaleur, bouger, respirer, corps'
    });
    
    // WEEK 4: January 27-31
    lessons.push({
      title: 'Winter Shadows and Light',
      titleFr: 'Ombres et lumière d\'hiver',
      date: janDate(27), // Monday
      mindsOn: 'Shadow tracking in winter - observe shadows throughout the day',
      mindsOnFr: 'Suivi ombres hiver - observer ombres durant journée',
      action: 'Track shadow changes, compare to fall shadows, measure daylight',
      actionFr: 'Suivre changements ombres, comparer automne, mesurer lumière',
      consolidation: 'Create shadow and light timeline for winter day',
      consolidationFr: 'Créer chronologie ombres et lumière jour hiver',
      frenchConnection: 'Light vocabulary: ombre, lumière, jour, nuit, soleil'
    });
    
    lessons.push({
      title: 'Winter Bird Watching',
      titleFr: 'Observation des oiseaux d\'hiver',
      date: janDate(29), // Wednesday
      mindsOn: 'Winter bird hunt - which birds stay for winter in PEI?',
      mindsOnFr: 'Chasse oiseaux hiver - lesquels restent hiver à l\'Î.-P.-É.?',
      action: 'Create bird identification cards, build bird feeders, track visitors',
      actionFr: 'Créer cartes identification, construire mangeoires, suivre visiteurs',
      consolidation: 'Present bird watching findings and feeding observations',
      consolidationFr: 'Présenter trouvailles observation, observations nourrissage',
      frenchConnection: 'Bird vocabulary: oiseau, voler, nid, manger, observer'
    });
    
    lessons.push({
      title: 'Winter Science Review',
      titleFr: 'Révision sciences d\'hiver',
      date: janDate(31), // Friday
      mindsOn: 'Winter science gallery walk - review all January investigations',
      mindsOnFr: 'Promenade galerie sciences - revoir investigations janvier',
      action: 'Create winter science museum displays, practice presentations',
      actionFr: 'Créer expositions musée sciences hiver, pratiquer présentations',
      consolidation: 'Share winter science learning with families and other classes',
      consolidationFr: 'Partager apprentissage sciences hiver familles, autres classes',
      frenchConnection: 'Review all winter science vocabulary from January'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating January lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: winterUnit.id,
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
          learningGoals: `Students will explore winter science concepts through direct observation and experimentation. French language integration`,
          learningGoalsFr: `Les élèves exploreront les concepts scientifiques d'hiver par observation et expérimentation. French language integration`,
          
          materials: JSON.stringify([
            'Winter observation materials',
            'Thermometers and measuring tools',
            'Magnifying glasses',
            'Science journals',
            'Craft supplies for experiments',
            'French vocabulary cards',
            'Winter clothing samples',
            'Ice and snow for experiments'
          ]),
          
          grouping: 'whole class observations, small group experiments, individual journaling, partner discussions',
          
          // Comprehensive differentiation for winter learning
          accommodations: JSON.stringify([
            'Warm indoor alternatives for outdoor observations',
            'Visual supports for weather concepts',
            'Hands-on exploration opportunities',
            'Partner support for language development',
            'Flexible recording methods',
            'Safety considerations for winter activities'
          ]),
          
          modifications: JSON.stringify([
            'Simplified weather concepts',
            'Picture-based weather tracking',
            'Concrete winter examples',
            'Guided observation sheets',
            'Reduced complexity in experiments'
          ]),
          
          extensions: JSON.stringify([
            'Advanced weather tracking projects',
            'Research Arctic animals',
            'Create winter survival guides',
            'Design winter inventions',
            'Lead younger student activities',
            'Home winter science projects'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Weather charts, winter animal pictures, step-by-step experiment guides',
            kinesthetic: 'Outdoor observations, hands-on experiments, building activities',
            auditory: 'Winter stories, weather songs, group discussions',
            support: 'Guided observation sheets, peer partnerships, visual vocabulary',
            extension: 'Independent research, complex investigations, teaching opportunities'
          }),
          
          // Assessment focused on winter science understanding
          assessmentType: 'formative',
          assessmentNotes: 'Observe winter concept understanding, scientific observation skills, French vocabulary development, safety awareness, collaborative investigation abilities',
          
          // Rich cross-curricular connections

            math: 'Temperature measurement, time tracking, data graphing, comparing quantities',
            french: 'Winter vocabulary, scientific descriptions, weather reporting',
            art: 'Winter drawings, snowflake designs, animal adaptation artwork',
            socialStudies: 'Community winter activities, helping others in winter',
            health: 'Winter safety, staying warm, winter exercise',
            physicalEducation: 'Winter sports awareness, safe winter play'
          }),
          
          // Strong Indigenous perspectives for winter
          indigenousPerspectives: 'Traditional winter survival knowledge, Mi\'kmaq winter teachings, respect for winter as important season, traditional winter activities',
          
          // Environmental education connections
          environmentalEducation: 'Winter ecosystem understanding, helping wildlife in winter, climate change effects on winter patterns, seasonal cycles',
          
          // Technology integration
          technologyIntegration: 'Digital thermometers, weather tracking apps, winter wildlife cameras, time-lapse videos of winter changes',
          
          // Community connections for winter learning
          communityConnections: 'Local weather station visits, winter sports athletes, elder knowledge sharing about PEI winters, winter safety experts',
          
          // Sub-friendly design for winter lessons
          isSubFriendly: true,
          subNotes: 'Winter materials in accessible bins, indoor alternatives prepared, safety protocols clearly posted, French vocabulary displayed, backup videos available, warm-up activities ready'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - Winter science focus`);
      
      // Link relevant curriculum expectations to lessons
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1,
          OR: [
            { code: '1.3.1' }, // Daily and seasonal changes
            { code: '1.3.2' }, // Effects of seasonal changes on living things
            { code: '1.1.1' }  // Living things characteristics (for winter adaptations)
          ]
        }
      });
      
      // Link expectations to lessons appropriately
      for (const expectation of expectations.slice(0, 2)) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log('\n❄️ JANUARY WINTER SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive winter science lesson plans`);
    console.log('✅ January 6-31, 2026 fully planned');
    console.log('✅ 10 lessons of winter wonder investigations');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Winter safety emphasis throughout');
    console.log('✅ Hands-on winter science exploration');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for diverse learners');
    console.log('✅ Assessment strategies for winter learning');
    console.log('✅ Sub-friendly with winter backup plans');
    console.log('✅ Strong Indigenous winter knowledge connections');
    console.log('✅ Environmental education focus');
    console.log('\n❄️ Winter science discovery continues in French for January 2026!');
    
  } catch (error) {
    console.error('❌ Error creating January lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceJanuaryLessonPlans()
  .then(() => console.log('\n🏆 January Winter Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });