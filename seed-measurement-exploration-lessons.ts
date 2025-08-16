#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMeasurementExplorationLessons() {
  console.log('📏 Creating 4 Measurement Exploration Lessons for Emily McIsaac\'s Grade 1 French Immersion class...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Measurement Exploration unit plan
    const measurementUnit = await prisma.unitPlan.findUnique({
      where: {
        id: 'cmectx0p2000pvj4pyw3hgsbz'
      }
    });
    
    if (!measurementUnit) {
      throw new Error('Measurement Exploration unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${measurementUnit.title} (ID: ${measurementUnit.id})`);
    console.log(`📅 Creating Week 1 lessons: Jan 5-9, 2026 (Length and Height)\n`);
    
    // Clear any existing lessons for this unit to avoid duplicates
    await prisma.eTFOLessonPlan.deleteMany({
      where: {
        unitPlanId: measurementUnit.id,
        userId: emily.id
      }
    });
    
    // Define the 4 lessons with EXACT 45-minute ETFO structure
    const lessons = [
      {
        // LESSON 1: Monday Jan 5 - Introduction to Measurement
        title: 'Introduction to Measurement',
        titleFr: 'Introduction à la mesure',
        date: new Date('2026-01-05'),
        mindsOn: 'Circle time discussion: What can we measure in our classroom? Explore length of desk vs. pencil. Students share observations about "long" and "short" objects around them.',
        mindsOnFr: 'Discussion en cercle: Qu\'est-ce qu\'on peut mesurer dans notre classe? Explorer longueur du bureau vs. crayon. Les élèves partagent observations sur objets "longs" et "courts".',
        action: 'Learning centers rotation: Station 1: Compare classroom objects (long/short). Station 2: Order 5 ribbon pieces by length. Station 3: Find objects longer than their hand. Station 4: Mi\'kmaq measurement stories with natural objects. Partner talk throughout using French vocabulary.',
        actionFr: 'Rotation de centres d\'apprentissage: Station 1: Comparer objets de classe (long/court). Station 2: Ordonner 5 rubans par longueur. Station 3: Trouver objets plus longs que leur main. Station 4: Histoires de mesure Mi\'kmaq avec objets naturels. Discussion entre partenaires en français.',
        consolidation: 'Gallery walk to see discoveries. Share one thing that was "plus long" and one that was "plus court". Preview tomorrow\'s comparing activity.',
        consolidationFr: 'Visite de galerie pour voir découvertes. Partager une chose "plus longue" et une "plus courte". Aperçu de l\'activité de comparaison de demain.',
        vocabularyTerms: 'long/court, mesurer'
      },
      {
        // LESSON 2: Tuesday Jan 6 - Comparing Lengths
        title: 'Comparing Lengths',
        titleFr: 'Comparer les longueurs',
        date: new Date('2026-01-06'),
        mindsOn: 'Mystery box with 3 hidden objects of different lengths. Students predict which is longest without seeing. Reveal and compare using direct comparison (side by side).',
        mindsOnFr: 'Boîte mystère avec 3 objets cachés de longueurs différentes. Les élèves prédisent lequel est le plus long sans voir. Révéler et comparer par comparaison directe (côte à côte).',
        action: 'Hands-on exploration with partner teams: Use string, blocks, and paper strips to compare lengths. Practice ordering 3-5 objects from shortest to longest. Document findings with drawings and French words. Mi\'kmaq teaching: traditional measuring with arm spans and footsteps.',
        actionFr: 'Exploration pratique par équipes de partenaires: Utiliser ficelle, blocs, et bandes de papier pour comparer longueurs. Pratiquer ordonner 3-5 objets du plus court au plus long. Documenter découvertes avec dessins et mots français. Enseignement Mi\'kmaq: mesure traditionnelle avec envergure et pas.',
        consolidation: 'Share ordering strategies. Discuss why direct comparison works best. Students demonstrate their best comparison technique to class.',
        consolidationFr: 'Partager stratégies d\'ordonnement. Discuter pourquoi comparaison directe fonctionne mieux. Les élèves démontrent leur meilleure technique de comparaison à la classe.',
        vocabularyTerms: 'plus long/plus court, comparer'
      },
      {
        // LESSON 3: Thursday Jan 8 - Measuring with Non-standard Units
        title: 'Measuring with Non-standard Units',
        titleFr: 'Mesurer avec unités non-standard',
        date: new Date('2026-01-08'),
        mindsOn: 'Teacher measures desk with paper clips while students count. Ask: "How many paper clips long is our desk?" Introduce concept of using objects to measure.',
        mindsOnFr: 'L\'enseignante mesure le bureau avec des trombones pendant que les élèves comptent. Demander: "Combien de trombones de long fait notre bureau?" Introduire le concept d\'utiliser des objets pour mesurer.',
        action: 'Measurement investigation stations with concrete materials: Station 1: Measure with blocks, Station 2: Measure with paper clips, Station 3: Measure with hand spans, Station 4: Traditional Mi\'kmaq units (seeds, stones). Partners record findings and compare results. Discover that different units give different numbers.',
        actionFr: 'Stations d\'investigation de mesure avec matériel concret: Station 1: Mesurer avec blocs, Station 2: Mesurer avec trombones, Station 3: Mesurer avec envergures de main, Station 4: Unités traditionnelles Mi\'kmaq (graines, pierres). Les partenaires enregistrent découvertes et comparent résultats. Découvrir que différentes unités donnent différents nombres.',
        consolidation: 'Class data collection: "Our desk is ___ blocks long and ___ paper clips long." Discuss why numbers are different. Make connections to Mi\'kmaq traditional measuring wisdom.',
        consolidationFr: 'Collecte de données de classe: "Notre bureau fait ___ blocs de long et ___ trombones de long." Discuter pourquoi les nombres sont différents. Faire connections avec sagesse traditionnelle de mesure Mi\'kmaq.',
        vocabularyTerms: 'unité, compter'
      },
      {
        // LESSON 4: Friday Jan 9 - Ordering by Length
        title: 'Ordering by Length',
        titleFr: 'Ordonner par longueur',
        date: new Date('2026-01-09'),
        mindsOn: 'Line up 5 students by height (with permission). Discuss how we put them in order from shortest to tallest. Connect to ordering objects by length.',
        mindsOnFr: 'Aligner 5 élèves par taille (avec permission). Discuter comment on les met en ordre du plus petit au plus grand. Connecter à ordonner objets par longueur.',
        action: 'Ordering challenge centers with rich materials: Create length sequences with ribbons, straws, construction paper strips. Mix up pre-cut strips and put in order. Use traditional Mi\'kmaq practice of organizing materials by size for different purposes. Teams work together to create and check each other\'s sequences.',
        actionFr: 'Centres de défi d\'ordonnement avec matériaux riches: Créer séquences de longueur avec rubans, pailles, bandes de papier construction. Mélanger bandes pré-coupées et mettre en ordre. Utiliser pratique traditionnelle Mi\'kmaq d\'organiser matériaux par taille pour différents buts. Les équipes travaillent ensemble pour créer et vérifier séquences des autres.',
        consolidation: 'Gallery walk of ordered sequences. Students explain their strategies for ordering. Celebrate success and preview next week\'s measurement adventures.',
        consolidationFr: 'Visite de galerie des séquences ordonnées. Les élèves expliquent leurs stratégies d\'ordonnement. Célébrer succès et aperçu des aventures de mesure de la semaine prochaine.',
        vocabularyTerms: 'ordonner, séquence'
      }
    ];
    
    // Create all lesson plans in database
    console.log('💾 Creating measurement exploration lessons in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: measurementUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // EXACTLY 45 minutes as specified
          grade: 1,
          subject: 'Mathématiques',
          language: 'fr',
          
          // ETFO Three-part lesson structure: Minds On (8min) + Action (27min) + Consolidation (10min)
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals aligned with measurement curriculum
          learningGoals: `Students will explore measurement concepts through hands-on comparison and ordering activities. Develop understanding of length and height using concrete materials and French vocabulary.`,
          learningGoalsFr: `Les élèves exploreront les concepts de mesure par des activités pratiques de comparaison et d'ordonnement. Développer compréhension de longueur et hauteur utilisant matériaux concrets et vocabulaire français.`,
          
          // Rich materials for concrete exploration
          materials: JSON.stringify([
            'Base-10 blocks for measuring',
            'Paper clips for non-standard units',
            'Colorful ribbons and string pieces',
            'Construction paper strips',
            'Plastic straws of various lengths',
            'Natural objects (stones, shells, sticks)',
            'Student math portfolios',
            'French vocabulary anchor charts',
            'Traditional Mi\'kmaq measuring tools (where available)',
            'Chart paper for recording discoveries'
          ]),
          
          grouping: 'Whole class introduction, partner exploration teams, small group rotations, individual reflection and recording',
          
          // Comprehensive JSON differentiation with all 4 types (100+ characters each)
          accommodations: JSON.stringify([
            'Visual supports with picture cards showing measurement concepts, allowing students to point to demonstrate understanding when verbal expression is challenging',
            'Concrete manipulatives available at all times for tactile learners who need hands-on exploration to grasp measurement relationships and spatial concepts',
            'Extended processing time during discussions and activities, with visual cues and prompts to support students who need additional time to formulate responses',
            'Choice of recording methods including drawing, pointing, or using concrete materials rather than requiring written responses for all assessments'
          ]),
          
          modifications: JSON.stringify([
            'Simplified measurement tasks focusing on "longer" and "shorter" comparisons rather than complex ordering sequences, reducing cognitive load while maintaining core concepts',
            'Reduced number of objects to compare (3 instead of 5) and providing step-by-step visual guides for measurement procedures to support executive functioning needs',
            'Alternative assessment through observation and conversation rather than written documentation, allowing students to demonstrate understanding through verbal or physical responses',
            'Peer buddy system for support during independent work time, ensuring students have immediate assistance and modeling available when needed'
          ]),
          
          extensions: JSON.stringify([
            'Advanced measurement challenges including estimation before measuring and creating their own measurement tools using non-standard units found in nature',
            'Cross-curricular connections to science by measuring plant growth, exploring how different animals measure their environment, and investigating measurement in natural phenomena',
            'Leadership opportunities as "measurement mentors" helping younger students learn comparison concepts and teaching measurement vocabulary to kindergarten classes',
            'Creative problem-solving challenges such as designing the "perfect" measurement tool for specific classroom objects and investigating how measurement helps in construction and building'
          ]),
          
          // Enhanced differentiation for diverse learners  
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Provide visual measurement anchor charts, use consistent concrete materials, offer guided practice with teacher support before independent exploration, break tasks into smaller sequential steps',
            forELL: 'Bilingual vocabulary cards with images, peer translation support, hands-on exploration before verbal explanation, visual recording options alongside French vocabulary development',
            forAdvanced: 'Open-ended measurement investigations, opportunities to create measurement problems for peers, exploration of multiple measurement systems including traditional Indigenous methods',
            forIEP: 'Individualized materials based on IEP goals, sensory-friendly options, alternative communication methods, modified pacing with built-in breaks and support as needed'
          }),
          
          // Observable assessment with checkboxes as specified
          assessmentType: 'formative observation',
          assessmentNotes: `Observable Assessment Checkboxes:
☐ Uses direct comparison to determine which object is longer/shorter
☐ Orders 3-5 objects from shortest to longest with accuracy
☐ Demonstrates understanding of non-standard units by counting correctly
☐ Uses French vocabulary (long/court, plus long/plus court, mesurer) in context
☐ Explains measurement strategy using concrete examples
☐ Shows respect for Mi'kmaq traditional measurement knowledge
☐ Collaborates effectively with partners during exploration activities
☐ Records discoveries through drawings and/or French words
☐ Makes connections between measurement and real-world applications
☐ Demonstrates curiosity and engagement during hands-on measurement tasks`,
          
          // Enhanced substitute support
          isSubFriendly: true,
          subNotes: 'Measurement materials organized in labeled bins by station. Visual schedule posted showing 8min/27min/10min timing. French vocabulary charts displayed prominently. Emergency backup activity: students measure classroom objects with their hands. All materials pre-counted and ready. Student helpers assigned for material distribution.',
          
          // Mi'kmaq perspectives (100+ characters as specified)
          indigenousPerspectives: 'Mi\'kmaq traditional knowledge includes measuring using natural objects like stones, shells, and arm spans. Traditional teachings emphasize that everything in nature has its proper size and proportion for its purpose. Students learn how Mi\'kmaq ancestors used body measurements and natural materials for building, crafting, and daily life activities, showing respect for traditional wisdom.',
          
          // Additional pedagogical fields for enhanced lesson quality
          engagementHooks: JSON.stringify([
            'Mystery measurement boxes to spark curiosity',
            'Real-world connections to building and construction', 
            'Traditional Mi\'kmaq measurement stories and practices',
            'Hands-on exploration with varied concrete materials'
          ]),
          
          formativeCheckpoints: JSON.stringify([
            'Partner sharing during center rotations',
            'Quick exit ticket: Draw one thing longer than your pencil',
            'Thumbs up/down for understanding after each section',
            'Gallery walk observations and peer feedback'
          ]),
          
          interventionStrategies: JSON.stringify([
            'Additional modeling with teacher support',
            'Simplified comparison tasks with fewer objects',
            'Peer buddy support during challenging activities',
            'Visual cues and anchor charts for vocabulary support'
          ]),
          
          performanceOpportunities: 'Students demonstrate measurement understanding through hands-on exploration, peer teaching moments, and verbal explanations of their measurement strategies using concrete materials and French vocabulary.',
          
          priorKnowledgeCheck: 'Quick assessment of students\' understanding of "big" and "small" concepts, familiarity with comparing objects, and existing French vocabulary related to size and description.',
          
          reflectionActivities: JSON.stringify([
            'Partner discussion about measurement discoveries',
            'Drawing journal entry of favorite measurement activity',
            'Class sharing circle about measurement strategies',
            'Connection to home: What do we measure at home?'
          ])
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} (${lesson.date.toDateString()})`);
      
      // Link measurement curriculum expectation to each lesson
      const measurementExpectation = await prisma.curriculumExpectation.findFirst({
        where: {
          id: 'cmebyc93e000rvjqu1f8cfkil' // Measurement Concepts expectation found earlier
        }
      });
      
      if (measurementExpectation) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: measurementExpectation.id
          }
        });
        console.log(`  🔗 Linked to curriculum expectation: ${measurementExpectation.titleFr}`);
      }
    }
    
    console.log('\n📏 MEASUREMENT EXPLORATION LESSONS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive 45-minute lessons created`);
    console.log('✅ Week 1 (Jan 5-9, 2026): Length and Height exploration');
    console.log('✅ ETFO structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('✅ Rich differentiation with all 4 types (100+ characters each)');
    console.log('✅ Observable assessment with ☐ checkboxes');
    console.log('✅ Mi\'kmaq perspectives integrated (100+ characters)');
    console.log('✅ French vocabulary: long/court, plus long/plus court, mesurer, comparer, unité, ordonner, séquence');
    console.log('✅ Hands-on exploration with concrete materials');
    console.log('✅ Traditional Mi\'kmaq measurement knowledge included');
    console.log('✅ Partner collaboration and French immersion integration');
    console.log('✅ Measurement curriculum expectations linked');
    console.log('\n🎯 Students ready to explore length and height through concrete, culturally responsive measurement activities!');
    
  } catch (error) {
    console.error('❌ Error creating measurement exploration lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMeasurementExplorationLessons()
  .then(() => console.log('\n🎉 Measurement Exploration lessons completed successfully!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });