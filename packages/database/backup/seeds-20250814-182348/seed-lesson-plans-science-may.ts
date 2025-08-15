#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceMayLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for May - Grade 1 French Immersion...\n');
  console.log('🌸 Completing Unit 6: Spring Awakening (May 1-15)');
  console.log('🌍 Beginning Unit 7: Our Impact on Nature (May 19-June 25)\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get both unit plans
    const springUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Le réveil du printemps'
      }
    });
    
    const impactUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre impact sur la nature'
      }
    });
    
    if (!springUnit || !impactUnit) {
      throw new Error('Unit plans not found for May lessons.');
    }
    
    console.log(`✅ Found Spring unit: ${springUnit.titleFr} (ID: ${springUnit.id})`);
    console.log(`✅ Found Impact unit: ${impactUnit.titleFr} (ID: ${impactUnit.id})\n`);
    
    // Clear existing May lesson plans for both units
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: { in: [springUnit.id, impactUnit.id] },
        date: {
          gte: new Date('2026-05-01'),
          lte: new Date('2026-05-31')
        }
      }
    });
    
    console.log('🗑️ Cleared existing May lesson plans\n');
    
    // Create lesson plans for May 2026
    const lessons = [];
    
    // Helper function to create dates in May 2026
    const mayDate = (day: number) => new Date(`2026-05-${day.toString().padStart(2, '0')}`);
    
    // UNIT 6 COMPLETION: May 1-15 (Spring Awakening)
    lessons.push({
      title: 'Spring Garden Investigation',
      titleFr: 'Investigation jardin printanier',
      date: mayDate(2), // Friday
      unitId: springUnit.id,
      mindsOn: 'Garden growth check - how have our plants changed?',
      mindsOnFr: 'Vérification croissance jardin - comment plantes ont changé?',
      action: 'Document garden growth, harvest first spring vegetables, measure plants',
      actionFr: 'Documenter croissance jardin, récolter premiers légumes, mesurer plantes',
      consolidation: 'Create spring garden success story and plan summer care',
      consolidationFr: 'Créer histoire succès jardin printemps, planifier soins été',
      frenchConnection: 'Garden vocabulary: jardin, légume, récolter, mesurer, réussir'
    });
    
    lessons.push({
      title: 'Pollinators in Spring',
      titleFr: 'Pollinisateurs au printemps',
      date: mayDate(5), // Monday
      unitId: springUnit.id,
      mindsOn: 'Pollinator observation - what insects visit our flowers?',
      mindsOnFr: 'Observer pollinisateurs - quels insectes visitent nos fleurs?',
      action: 'Create pollinator observation sheets, build bee hotels, flower investigations',
      actionFr: 'Créer feuilles observation pollinisateurs, hôtels abeilles, investigations fleurs',
      consolidation: 'Share pollinator discoveries and create pollinator protection plans',
      consolidationFr: 'Partager découvertes pollinisateurs, créer plans protection',
      frenchConnection: 'Pollinator vocabulary: abeille, papillon, polliniser, fleur, nectar'
    });
    
    lessons.push({
      title: 'Spring Cleanup Science',
      titleFr: 'Science du nettoyage printanier',
      date: mayDate(7), // Wednesday
      unitId: springUnit.id,
      mindsOn: 'Spring cleanup investigation - what needs cleaning up outside?',
      mindsOnFr: 'Investigation nettoyage printemps - qu\'y a-t-il à nettoyer dehors?',
      action: 'School ground cleanup, sort waste, recycling investigation, compost making',
      actionFr: 'Nettoyage terrain école, trier déchets, investigation recyclage, compost',
      consolidation: 'Present cleanup findings and create maintenance plans',
      consolidationFr: 'Présenter trouvailles nettoyage, créer plans entretien',
      frenchConnection: 'Cleanup vocabulary: nettoyer, déchet, recycler, compost, propre'
    });
    
    lessons.push({
      title: 'Spring Weather Summary',
      titleFr: 'Résumé météo printanière',
      date: mayDate(9), // Friday
      unitId: springUnit.id,
      mindsOn: 'Spring weather review - what patterns did we observe?',
      mindsOnFr: 'Révision météo printemps - quelles régularités observées?',
      action: 'Analyze spring weather data, create weather pattern graphs, compare seasons',
      actionFr: 'Analyser données météo printemps, graphiques régularités, comparer saisons',
      consolidation: 'Present spring weather findings and predict summer patterns',
      consolidationFr: 'Présenter trouvailles météo, prédire régularités été',
      frenchConnection: 'Weather summary vocabulary: résumé, régularité, analyser, prédire'
    });
    
    lessons.push({
      title: 'Preparing for Summer',
      titleFr: 'Se préparer pour l\'été',
      date: mayDate(12), // Monday
      unitId: springUnit.id,
      mindsOn: 'Summer preparation - what changes will summer bring?',
      mindsOnFr: 'Préparation été - quels changements été apportera-t-il?',
      action: 'Research summer changes, create summer observation plans, plant summer seeds',
      actionFr: 'Rechercher changements été, créer plans observation été, planter graines',
      consolidation: 'Share summer predictions and create summer science journals',
      consolidationFr: 'Partager prédictions été, créer journaux sciences été',
      frenchConnection: 'Summer vocabulary: été, chaud, vacances, continuer, observer'
    });
    
    lessons.push({
      title: 'Spring Science Celebration',
      titleFr: 'Célébration sciences du printemps',
      date: mayDate(14), // Wednesday - Unit 6 culmination
      unitId: springUnit.id,
      mindsOn: 'Spring celebration preparation - showcase all spring learning',
      mindsOnFr: 'Préparation célébration printemps - exposer apprentissages printemps',
      action: 'Set up spring science museum, present investigations to families',
      actionFr: 'Installer musée sciences printemps, présenter investigations familles',
      consolidation: 'Celebrate spring discoveries and transition to environmental focus',
      consolidationFr: 'Célébrer découvertes printemps, transition focus environnemental',
      frenchConnection: 'Celebration vocabulary: célébrer, découverte, réussite, partager'
    });
    
    // UNIT 7 BEGINNING: May 19-30 (Our Impact on Nature)
    lessons.push({
      title: 'What is the Environment?',
      titleFr: 'Qu\'est-ce que l\'environnement?',
      date: mayDate(19), // Monday - Unit 7 begins
      unitId: impactUnit.id,
      mindsOn: 'Environment exploration - what is all around us?',
      mindsOnFr: 'Explorer environnement - qu\'est-ce qui nous entoure?',
      action: 'Create environment maps, identify living and non-living parts, ecosystem investigation',
      actionFr: 'Créer cartes environnement, identifier parties vivantes/non-vivantes, écosystème',
      consolidation: 'Present environment discoveries and connections',
      consolidationFr: 'Présenter découvertes environnement et connexions',
      frenchConnection: 'Environment vocabulary: environnement, écosystème, connexion, entourer'
    });
    
    lessons.push({
      title: 'How Humans Use Nature',
      titleFr: 'Comment les humains utilisent la nature',
      date: mayDate(21), // Wednesday
      unitId: impactUnit.id,
      mindsOn: 'Human use investigation - how do we use natural resources?',
      mindsOnFr: 'Investigation utilisation humaine - comment utilisons ressources naturelles?',
      action: 'Research natural resource uses, create resource use maps, daily use tracking',
      actionFr: 'Rechercher usages ressources naturelles, cartes utilisation, suivi quotidien',
      consolidation: 'Share resource use discoveries and discuss needs vs wants',
      consolidationFr: 'Partager découvertes utilisation, discuter besoins vs désirs',
      frenchConnection: 'Resource vocabulary: ressource, utiliser, besoin, désir, naturel'
    });
    
    lessons.push({
      title: 'Pollution Investigation',
      titleFr: 'Investigation pollution',
      date: mayDate(23), // Friday
      unitId: impactUnit.id,
      mindsOn: 'Pollution detective work - find examples of pollution around school',
      mindsOnFr: 'Travail détective pollution - trouver exemples pollution autour école',
      action: 'Document pollution sources, sort types of pollution, investigate effects',
      actionFr: 'Documenter sources pollution, trier types pollution, investiguer effets',
      consolidation: 'Present pollution findings and brainstorm solutions',
      consolidationFr: 'Présenter trouvailles pollution, remue-méninges solutions',
      frenchConnection: 'Pollution vocabulary: pollution, source, effet, solution, problème'
    });
    
    lessons.push({
      title: 'Reduce, Reuse, Recycle',
      titleFr: 'Réduire, réutiliser, recycler',
      date: mayDate(26), // Monday
      unitId: impactUnit.id,
      mindsOn: '3 Rs exploration - how can we help the environment?',
      mindsOnFr: 'Explorer 3 R - comment pouvons aider environnement?',
      action: 'Practice 3 Rs activities, create reuse projects, set up class recycling',
      actionFr: 'Pratiquer activités 3 R, créer projets réutilisation, recyclage classe',
      consolidation: 'Share 3 Rs successes and make family commitments',
      consolidationFr: 'Partager succès 3 R, engagements famille',
      frenchConnection: '3 Rs vocabulary: réduire, réutiliser, recycler, aider, engagement'
    });
    
    lessons.push({
      title: 'Protecting Animal Homes',
      titleFr: 'Protéger les maisons des animaux',
      date: mayDate(28), // Wednesday
      unitId: impactUnit.id,
      mindsOn: 'Animal habitat protection - how do our actions affect animal homes?',
      mindsOnFr: 'Protection habitats animaux - comment nos actions affectent maisons animaux?',
      action: 'Research habitat destruction, create habitat protection plans, build bird houses',
      actionFr: 'Rechercher destruction habitats, créer plans protection, construire nichoirs',
      consolidation: 'Present habitat protection ideas and install bird houses',
      consolidationFr: 'Présenter idées protection habitats, installer nichoirs',
      frenchConnection: 'Habitat vocabulary: habitat, maison, protéger, détruire, construire'
    });
    
    lessons.push({
      title: 'Water Protection',
      titleFr: 'Protection de l\'eau',
      date: mayDate(30), // Friday
      unitId: impactUnit.id,
      mindsOn: 'Water protection investigation - how do we keep water clean?',
      mindsOnFr: 'Investigation protection eau - comment garder eau propre?',
      action: 'Water testing experiments, pollution effects demonstration, conservation activities',
      actionFr: 'Expériences test eau, démonstration effets pollution, activités conservation',
      consolidation: 'Create water protection action plans and share commitments',
      consolidationFr: 'Créer plans action protection eau, partager engagements',
      frenchConnection: 'Water protection vocabulary: eau, propre, tester, pollution, conserver'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating May lesson plans in database...\n');
    
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
          learningGoals: `Students will explore environmental connections and human impact on nature. French language integration`,
          learningGoalsFr: `Les élèves exploreront connexions environnementales et impact humain sur nature. French language integration`,
          
          materials: JSON.stringify([
            'Environmental investigation materials',
            'Magnifying glasses for observations',
            'Collection containers',
            'Science journals',
            'Recycling and reuse materials',
            'Water testing supplies',
            'Building materials for projects',
            'French vocabulary cards',
            'Cameras for documentation'
          ]),
          
          grouping: 'whole class investigations, small group projects, individual reflection, community action groups',
          
          // Comprehensive differentiation
          accommodations: JSON.stringify([
            'Visual supports for environmental concepts',
            'Hands-on environmental activities',
            'Multiple ways to show understanding',
            'Partner support for investigations',
            'Extended time for projects',
            'Choice in action plans'
          ]),
          
          modifications: JSON.stringify([
            'Simplified environmental concepts',
            'Picture-based investigation guides',
            'Concrete examples of impact',
            'Guided action planning',
            'Basic environmental activities'
          ]),
          
          extensions: JSON.stringify([
            'Independent environmental research',
            'Advanced sustainability projects',
            'Lead school environmental initiatives',
            'Create teaching materials for younger students',
            'Connect with community environmental groups',
            'Design innovative solutions'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Environmental impact charts, before/after photos, process diagrams, visual vocabulary',
            kinesthetic: 'Hands-on conservation activities, building projects, outdoor investigations',
            auditory: 'Environmental stories, group discussions, presentation opportunities',
            support: 'Step-by-step action guides, peer partnerships, visual supports',
            extension: 'Independent research projects, leadership opportunities, advanced investigations'
          }),
          
          // Assessment strategies
          assessmentType: lessonData.title.includes('Celebration') ? 'summative' : 'formative',
          assessmentNotes: 'Observe environmental understanding, action planning skills, French science vocabulary, collaborative work, stewardship attitudes',
          
          // Rich cross-curricular connections

            math: 'Data collection on environmental issues, measuring conservation results',
            french: 'Environmental vocabulary, action plan writing, presentation skills',
            art: 'Environmental posters, reuse art projects, nature preservation art',
            socialStudies: 'Community responsibility, citizenship, helping others',
            health: 'Clean environment for health, outdoor activity benefits',
            physicalEducation: 'Active environmental stewardship, outdoor learning'
          }),
          
          // Strong Indigenous perspectives
          indigenousPerspectives: 'Traditional ecological knowledge, seven generations thinking, reciprocal relationship with nature, land as teacher',
          
          // Core environmental education
          environmentalEducation: 'Stewardship responsibility, sustainability practices, climate action, biodiversity protection, renewable resources',
          
          // Technology integration
          technologyIntegration: 'Environmental monitoring apps, digital documentation of changes, online environmental resources, virtual field trips',
          
          // Community connections
          communityConnections: 'Local environmental groups, municipal sustainability programs, Indigenous knowledge keepers, conservation organizations',
          
          // Sub-friendly design
          isSubFriendly: true,
          subNotes: 'Environmental materials in organized bins, outdoor safety protocols posted, action plan templates ready, French vocabulary displayed, backup indoor activities'
        }
      });
      
      lessonCount++;
      const unitName = lessonData.unitId === springUnit.id ? 'Spring Awakening' : 'Our Impact on Nature';
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - ${unitName}`);
      
      // Link relevant curriculum expectations
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: 'Sciences de la nature',
          grade: 1,
          OR: [
            { code: '1.1.2' }, // Human impact on environment
            { code: '1.3.1' }, // Daily and seasonal changes (for spring lessons)
            { code: '1.3.2' }  // Effects of seasonal changes (for spring lessons)
          ]
        }
      });
      
      // Link appropriate expectations based on unit
      const relevantExpectations = lessonData.unitId === springUnit.id 
        ? expectations.filter(e => e.code.startsWith('1.3')).slice(0, 2)
        : expectations.filter(e => e.code === '1.1.2').slice(0, 1);
      
      for (const expectation of relevantExpectations) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log('\n🌸🌍 MAY SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive lesson plans`);
    console.log('✅ May 2-30, 2026 fully planned');
    console.log('✅ Unit 6 completion (6 lessons): Spring Awakening celebration');
    console.log('✅ Unit 7 beginning (6 lessons): Environmental impact investigations');
    console.log('✅ Strong environmental stewardship focus');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for all learners');
    console.log('✅ Action-oriented learning emphasized');
    console.log('✅ Community connections included');
    console.log('✅ Sub-friendly with comprehensive materials');
    console.log('\n🌍 Environmental stewardship and spring celebration ready for May 2026!');
    
  } catch (error) {
    console.error('❌ Error creating May lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceMayLessonPlans()
  .then(() => console.log('\n🏆 May Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });