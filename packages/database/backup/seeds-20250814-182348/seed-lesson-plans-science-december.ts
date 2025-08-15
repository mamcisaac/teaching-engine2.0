#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceDecemberLessonPlans() {
  console.log('🔬 Creating Science Lesson Plans for December - Grade 1 French Immersion...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Energy unit plan for December
    const energyUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'L\'énergie dans nos vies'
      }
    });
    
    if (!energyUnit) {
      throw new Error('Energy unit plan "L\'énergie dans nos vies" not found.');
    }
    
    console.log(`✅ Found unit plan: ${energyUnit.titleFr} (ID: ${energyUnit.id})`);
    console.log(`📅 Duration: Nov 17 - Dec 19, 2025\n`);
    
    // Clear existing December lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { 
        unitPlanId: energyUnit.id,
        date: {
          gte: new Date('2025-12-01'),
          lte: new Date('2025-12-31')
        }
      }
    });
    
    console.log('🗑️ Cleared existing December lesson plans\n');
    
    // Create lesson plans for December 2025
    const lessons = [];
    
    // Helper function to create dates in December 2025
    const decDate = (day: number) => new Date(`2025-12-${day.toString().padStart(2, '0')}`);
    
    // WEEK 1: December 1-5
    lessons.push({
      title: 'Energy from Food',
      titleFr: 'L\'énergie de la nourriture',
      date: decDate(1), // Monday
      mindsOn: 'Food energy game - which foods give us energy?',
      mindsOnFr: 'Jeu énergie alimentaire - quels aliments donnent énergie?',
      action: 'Sort foods by energy content, create healthy energy snacks, discuss body needs',
      actionFr: 'Trier aliments par énergie, créer collations saines, besoins corps',
      consolidation: 'Share energy foods discoveries, plan healthy lunch',
      consolidationFr: 'Partager découvertes, planifier lunch santé',
      frenchConnection: 'Food vocabulary: nourriture, énergie, santé, corps, manger'
    });
    
    lessons.push({
      title: 'Movement and Energy',
      titleFr: 'Mouvement et énergie',
      date: decDate(3), // Wednesday
      mindsOn: 'Energy dance - move fast vs slow, feel heart rate changes',
      mindsOnFr: 'Danse énergie - bouger vite vs lent, sentir cœur',
      action: 'Test energy needed for different activities, create movement chart',
      actionFr: 'Tester énergie activités, créer tableau mouvement',
      consolidation: 'Compare energy use in different movements',
      consolidationFr: 'Comparer usage énergie mouvements différents',
      frenchConnection: 'Movement vocabulary: bouger, courir, marcher, sauter, énergie'
    });
    
    lessons.push({
      title: 'Energy from the Sun',
      titleFr: 'L\'énergie du soleil',
      date: decDate(5), // Friday
      mindsOn: 'Sun observation - how does sunlight make us feel?',
      mindsOnFr: 'Observer soleil - comment lumière nous fait sentir?',
      action: 'Solar experiments: heat absorption, solar oven demonstration, plant needs',
      actionFr: 'Expériences solaires: absorption chaleur, four solaire, besoins plantes',
      consolidation: 'Discuss why sun is important for all life on Earth',
      consolidationFr: 'Discuter pourquoi soleil important pour vie',
      frenchConnection: 'Solar vocabulary: soleil, lumière, chaleur, plante, vie'
    });
    
    // WEEK 2: December 8-12
    lessons.push({
      title: 'Electricity at Home',
      titleFr: 'L\'électricité à la maison',
      date: decDate(8), // Monday
      mindsOn: 'Home energy audit - what uses electricity at home?',
      mindsOnFr: 'Audit énergie maison - qu\'est-ce qui utilise électricité?',
      action: 'Create home electricity map, safety rules, simple circuits',
      actionFr: 'Créer carte électricité maison, règles sécurité, circuits',
      consolidation: 'Present home energy findings to class',
      consolidationFr: 'Présenter trouvailles énergie maison',
      frenchConnection: 'Electricity vocabulary: électricité, courant, sécurité, danger'
    });
    
    lessons.push({
      title: 'Saving Energy at School',
      titleFr: 'Économiser l\'énergie à l\'école',
      date: decDate(10), // Wednesday
      mindsOn: 'Energy waste detectives - find wasted energy in classroom',
      mindsOnFr: 'Détectives gaspillage - trouver énergie gaspillée',
      action: 'Design energy-saving plans, create reminder posters, practice conservation',
      actionFr: 'Concevoir plans économie, créer affiches, pratiquer conservation',
      consolidation: 'Share energy-saving commitments with school',
      consolidationFr: 'Partager engagements économie avec école',
      frenchConnection: 'Conservation vocabulary: économiser, gaspiller, éteindre, fermer'
    });
    
    lessons.push({
      title: 'Wind Energy',
      titleFr: 'L\'énergie du vent',
      date: decDate(12), // Friday
      mindsOn: 'Wind power exploration - feel wind, observe movement',
      mindsOnFr: 'Explorer pouvoir vent - sentir vent, observer mouvement',
      action: 'Build simple wind turbines, test in different winds, measure rotation',
      actionFr: 'Construire éoliennes simples, tester vents, mesurer rotation',
      consolidation: 'Wind energy fair - demonstrate turbine designs',
      consolidationFr: 'Foire énergie éolienne - démontrer conceptions',
      frenchConnection: 'Wind vocabulary: vent, tourner, éolienne, air, bouger'
    });
    
    // WEEK 3: December 15-19 (Final week before break)
    lessons.push({
      title: 'Water Energy',
      titleFr: 'L\'énergie de l\'eau',
      date: decDate(15), // Monday
      mindsOn: 'Water wheel demonstration - how does flowing water create energy?',
      mindsOnFr: 'Roue à eau - comment eau qui coule crée énergie?',
      action: 'Build water wheels, test with different water flows, measure power',
      actionFr: 'Construire roues à eau, tester débits, mesurer puissance',
      consolidation: 'Compare water wheel designs and effectiveness',
      consolidationFr: 'Comparer conceptions roues à eau et efficacité',
      frenchConnection: 'Water energy vocabulary: eau, couler, roue, puissance, rivière'
    });
    
    lessons.push({
      title: 'Energy Conservation Challenge',
      titleFr: 'Défi conservation d\'énergie',
      date: decDate(17), // Wednesday
      mindsOn: 'Family energy challenge - how can families save energy?',
      mindsOnFr: 'Défi famille - comment familles économiser énergie?',
      action: 'Create family energy plans, conservation games, tracking charts',
      actionFr: 'Créer plans famille, jeux conservation, tableaux suivi',
      consolidation: 'Present family energy challenges to parents',
      consolidationFr: 'Présenter défis famille aux parents',
      frenchConnection: 'Family vocabulary: famille, maison, ensemble, aider, partager'
    });
    
    lessons.push({
      title: 'Energy Celebration',
      titleFr: 'Célébration de l\'énergie',
      date: decDate(19), // Friday - Last day before winter break
      mindsOn: 'Energy museum setup - display all energy learning',
      mindsOnFr: 'Musée énergie - exposer apprentissages énergie',
      action: 'Present energy projects to families, demonstrate experiments, share learning',
      actionFr: 'Présenter projets familles, démontrer expériences, partager',
      consolidation: 'Celebrate energy discoveries, preview winter science',
      consolidationFr: 'Célébrer découvertes, aperçu sciences hiver',
      frenchConnection: 'Celebration vocabulary: célébrer, partager, apprendre, découvrir'
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating December lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: energyUnit.id,
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
          learningGoals: `Students will explore energy concepts through hands-on investigations. French language integration`,
          learningGoalsFr: `Les élèves exploreront les concepts d'énergie par investigations. French language integration`,
          
          materials: JSON.stringify([
            'Energy investigation materials',
            'Science journals',
            'Measurement tools',
            'Craft supplies for building',
            'Chart paper',
            'French vocabulary cards'
          ]),
          
          grouping: 'whole class introduction, small group investigations, individual reflection, pairs for sharing',
          
          // Comprehensive differentiation
          accommodations: JSON.stringify([
            'Visual instruction supports',
            'Hands-on exploration opportunities',
            'Partner work for language support',
            'Flexible recording methods',
            'Extended time as needed'
          ]),
          
          modifications: JSON.stringify([
            'Simplified energy concepts',
            'Picture-based vocabulary',
            'Guided investigation steps',
            'Concrete examples only',
            'Reduced complexity in tasks'
          ]),
          
          extensions: JSON.stringify([
            'Advanced energy investigations',
            'Research renewable energy',
            'Create energy inventions',
            'Teach younger students',
            'Home energy audit projects'
          ]),
          
          differentiationStrategies: JSON.stringify({
            visual: 'Energy diagrams, vocabulary cards, demonstration videos',
            kinesthetic: 'Building activities, movement exploration, hands-on experiments',
            auditory: 'Discussion, songs, verbal explanations',
            support: 'Guided practice, peer partners, simplified materials',
            extension: 'Independent research, complex problems, leadership roles'
          }),
          
          // Assessment
          assessmentType: 'formative',
          assessmentNotes: 'Observe energy concept understanding, investigation skills, French vocabulary use, collaborative work, scientific thinking development',
          
          // Indigenous and environmental connections

            math: 'Measuring energy use, graphing data, counting and sorting',
            french: 'Energy vocabulary, scientific explanations in French',
            art: 'Energy posters, invention drawings, creative projects',
            socialStudies: 'Community energy use, helping families save energy',
            health: 'Body energy needs, healthy eating for energy'
          }),
          
          indigenousPerspectives: 'Traditional energy sources, respect for natural resources, sustainable living practices, connection to land',
          
          environmentalEducation: 'Renewable vs non-renewable energy, conservation practices, climate change awareness, personal responsibility',
          
          // Technology integration
          technologyIntegration: 'Digital energy meters, videos of energy sources, online energy games, photo documentation of experiments',
          
          // Community connections
          communityConnections: 'Maritime Electric visit, home energy audits with families, school energy conservation projects',
          
          // Sub-friendly design
          isSubFriendly: true,
          subNotes: 'All materials in labeled energy bins, investigation sheets prepared, safety guidelines posted, French vocabulary displayed, video backup available, clear daily schedule'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} - Focus: Energy concepts`);
      
      // Link Energy expectation to lessons
      const energyExpectation = await prisma.curriculumExpectation.findFirst({
        where: {
          code: '1.2.1',
          subject: 'Sciences de la nature',
          grade: 1
        }
      });
      
      if (energyExpectation) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: energyExpectation.id
          }
        });
      }
    }
    
    console.log('\n🔬 DECEMBER SCIENCE LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive energy lesson plans`);
    console.log('✅ December 1-19, 2025 fully planned');
    console.log('✅ 8 lessons of hands-on energy investigation');
    console.log('✅ Natural French vocabulary integration');
    console.log('✅ Energy conservation focus');
    console.log('✅ Three-part lesson structure maintained');
    console.log('✅ Differentiation for all learners');
    console.log('✅ Assessment strategies included');
    console.log('✅ Sub-friendly with clear materials');
    console.log('✅ Strong environmental education connections');
    console.log('\n🎉 Energy exploration continues in French for December 2025!');
    
  } catch (error) {
    console.error('❌ Error creating December lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScienceDecemberLessonPlans()
  .then(() => console.log('\n🏆 December Science lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });