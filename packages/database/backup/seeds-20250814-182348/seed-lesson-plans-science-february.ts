#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceFebruaryLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for February - Grade 1 French Immersion...\n');
  console.log('❄️ Unit 4: Winter Wonders - Concluding winter science investigations\n');
  
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
    console.log(`📅 Unit completion: Feb 1-13, 2026\n`);
    
    // Clear existing February lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: winterUnit.id,
        date: {
          gte: new Date('2026-02-01'),
          lte: new Date('2026-02-16')
        }
      }
    });
    
    console.log('🗑️ Cleared existing February lesson plans\n');
    
    // Create lesson plans for February 2026 (completing Winter Wonders unit)
    const lessons = [];
    
    // Helper function to create dates in February 2026
    const febDate = (day: number) => new Date(`2026-02-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: February 2-6
    lessons.push({
      title: 'Winter Home Energy Use',
      titleFr: 'Utilisation d\'énergie hivernale à la maison',
      date: febDate(2), // Monday
      mindsOn: 'How does winter change energy use at home?',
      mindsOnFr: 'Comment hiver change utilisation énergie maison?',
      action: 'Compare summer/winter energy bills, investigate heating, insulation experiments',
      actionFr: 'Comparer factures été/hiver, investiguer chauffage, expériences isolation',
      consolidation: 'Create family winter energy saving plans',
      consolidationFr: 'Créer plans famille économiser énergie hiver',
      frenchConnection: 'Energy vocabulary: chauffage, isolation, économiser, facture'
    });
    
    lessons.push({
      title: 'Ice Science Investigations',
      titleFr: 'Investigations scientifiques de la glace',
      date: febDate(4), // Wednesday
      mindsOn: 'What can we learn from ice? Ice cube investigations',
      mindsOnFr: 'Qu\'apprendre de la glace? Investigations glaçons',
      action: 'Freeze different liquids, ice melting races, ice sculptures',
      actionFr: 'Geler liquides différents, courses fondre glace, sculptures glace',
      consolidation: 'Share ice discoveries and create ice fact books',
      consolidationFr: 'Partager découvertes glace, créer livres faits glace',
      frenchConnection: 'Ice vocabulary: glace, geler, fondre, dur, froid'
    });
    
    lessons.push({
      title: 'Winter Animal Tracks',
      titleFr: 'Pistes d\'animaux d\'hiver',
      date: febDate(6), // Friday
      mindsOn: 'Animal detective work - finding winter animal evidence',
      mindsOnFr: 'Travail détective animal - trouver preuves animaux hiver',
      action: 'Create plaster casts of tracks, identify winter animals, track stories',
      actionFr: 'Créer moulages pistes, identifier animaux hiver, histoires pistes',
      consolidation: 'Present animal track findings and winter animal stories',
      consolidationFr: 'Présenter trouvailles pistes, histoires animaux hiver',
      frenchConnection: 'Tracking vocabulary: piste, empreinte, chercher, trouver, animal'
    });
    
    // WEEK 2: February 9-13 (Final week of Winter Wonders unit)
    lessons.push({
      title: 'Winter Water Cycle',
      titleFr: 'Cycle de l\'eau en hiver',
      date: febDate(9), // Monday
      mindsOn: 'Where does water go in winter? Snow and ice observations',
      mindsOnFr: 'Où va eau en hiver? Observations neige et glace',
      action: 'Model winter water cycle, snow melting experiments, precipitation tracking',
      actionFr: 'Modeler cycle eau hiver, expériences fondre neige, suivre précipitations',
      consolidation: 'Create winter water cycle diagrams and explanations',
      consolidationFr: 'Créer diagrammes cycle eau hiver et explications',
      frenchConnection: 'Water cycle vocabulary: cycle, évaporer, condenser, précipitation'
    });
    
    lessons.push({
      title: 'Winter Plant Life',
      titleFr: 'Vie des plantes en hiver',
      date: febDate(11), // Wednesday
      mindsOn: 'Are plants alive in winter? Indoor vs outdoor plant comparison',
      mindsOnFr: 'Plantes vivantes en hiver? Comparaison plantes intérieur/extérieur',
      action: 'Examine dormant plants, force branches to bloom, seed starting',
      actionFr: 'Examiner plantes dormantes, forcer branches fleurir, commencer graines',
      consolidation: 'Discuss plant winter survival strategies and spring preparation',
      consolidationFr: 'Discuter stratégies survie plantes, préparation printemps',
      frenchConnection: 'Plant life vocabulary: dormant, germer, racine, pousser, vie'
    });
    
    lessons.push({
      title: 'Winter Wonders Museum',
      titleFr: 'Musée des merveilles d\'hiver',
      date: febDate(13), // Friday - Unit culmination
      mindsOn: 'Prepare winter science museum - what have we learned?',
      mindsOnFr: 'Préparer musée sciences hiver - qu\'avons-nous appris?',
      action: 'Set up winter science displays, practice presentations, invite families',
      actionFr: 'Installer expositions sciences hiver, pratiquer présentations, inviter familles',
      consolidation: 'Celebrate winter learning and preview spring science',
      consolidationFr: 'Célébrer apprentissage hiver, aperçu sciences printemps',
      frenchConnection: 'Museum vocabulary: exposition, présenter, apprendre, célébrer'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating February lesson plans in database...\n');
    
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
          learningGoals: `Students will complete winter science investigations and synthesize winter learning. French language integration`,
          learningGoalsFr: `Les élèves complèteront investigations sciences hiver et synthétiseront apprentissage. French language integration`,
          
          materials: JSON.stringify([
            'Winter investigation materials',
            'Ice and snow samples',
            'Thermometers and measuring tools',
            'Plaster for track casting',
            'Plant observation materials',
            'Science journals for reflection',
            'French vocabulary cards',
            'Display materials for museum'
          ]),
          
          grouping: 'whole class investigations, small group projects, individual reflection, pairs for peer teaching',
          
          // Comprehensive differentiation
          accommodations: JSON.stringify([
            'Indoor alternatives for outdoor investigations',
            'Visual supports for complex concepts',
            'Hands-on exploration opportunities',
            'Flexible presentation formats',
            'Extended time for reflection',
            'Peer support for language development'
          ]),
          
          modifications: JSON.stringify([
            'Simplified winter science concepts',
            'Picture-based investigation guides',
            'Concrete examples and demonstrations',
            'Guided reflection prompts',
            'Choice in demonstration methods'
          ]),
          
          extensions: JSON.stringify([
            'Independent winter research projects',
            'Advanced ice and snow experiments',
            'Create winter science teaching materials',
            'Lead investigations for younger students',
            'Design winter science fair projects',
            'Connect to global winter phenomena'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Winter science charts, process diagrams, photo documentation',
            kinesthetic: 'Hands-on experiments, outdoor investigations, building models',
            auditory: 'Scientific discussions, winter stories, peer explanations',
            support: 'Step-by-step guides, partner investigations, visual vocabulary',
            extension: 'Complex investigations, research opportunities, teaching roles'
          }),
          
          // Assessment for unit completion
          assessmentType: lessonData.title.includes('Museum') ? 'summative' : 'formative',
          assessmentNotes: 'Assess winter science concept understanding, investigation skills, French science vocabulary, collaborative work, presentation abilities',
          
          // Rich cross-curricular connections

            math: 'Temperature data analysis, measurement skills, time tracking, graphing',
            french: 'Science vocabulary, investigation reports, presentation skills',
            art: 'Winter science illustrations, museum displays, creative presentations',
            socialStudies: 'Community winter preparations, helping others, seasonal changes',
            health: 'Winter safety, seasonal activity choices, healthy winter habits'
          }),
          
          // Indigenous perspectives
          indigenousPerspectives: 'Traditional winter knowledge, seasonal teachings, respect for winter season, traditional winter activities and survival',
          
          // Environmental education
          environmentalEducation: 'Winter ecosystem understanding, climate change impacts on winter, sustainable winter practices, wildlife conservation',
          
          // Technology integration
          technologyIntegration: 'Digital microscopes for ice crystals, weather tracking apps, time-lapse winter videos, digital presentation tools',
          
          // Community connections
          communityConnections: 'Local meteorologist visits, winter sports community, elder winter knowledge sharing, environmental groups',
          
          // Sub-friendly design
          isSubFriendly: true,
          subNotes: 'All winter materials organized in labeled bins, safety protocols posted, indoor backup activities prepared, French vocabulary visibly displayed, video resources available'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - Winter conclusion focus`);
      
      // Link relevant curriculum expectations
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1,
          OR: [
            { code: '1.3.1' }, // Daily and seasonal changes
            { code: '1.3.2' }, // Effects of seasonal changes
            { code: '1.2.1' }  // Energy use (for heating lesson)
          ]
        }
      });
      
      for (const expectation of expectations.slice(0, 2)) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log('\n❄️ FEBRUARY WINTER SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} winter science conclusion lesson plans`);
    console.log('✅ February 2-13, 2026 fully planned');
    console.log('✅ 6 lessons completing Winter Wonders unit');
    console.log('✅ Culminating winter science museum');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for all learners');
    console.log('✅ Assessment strategies included');
    console.log('✅ Strong unit conclusion and transition to spring');
    console.log('✅ Sub-friendly with comprehensive materials');
    console.log('\n❄️ Winter Wonders unit completion ready for February 2026!');
    
  } catch (error) {
    console.error('❌ Error creating February lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceFebruaryLessonPlans()
  .then(() => console.log('\n🏆 February Winter Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });