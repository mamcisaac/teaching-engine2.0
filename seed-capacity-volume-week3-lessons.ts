#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCapacityVolumeWeek3Lessons() {
  console.log('🫗 Creating 4 Capacity and Volume Lessons for Week 3 of Measurement Exploration...\n');
  
  try {
    // Get user by ID 23
    const user = await prisma.user.findUnique({
      where: { id: 23 }
    });
    
    if (!user) {
      throw new Error('User with ID 23 not found.');
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
    console.log(`📅 Creating Week 3 lessons: Jan 19-23, 2026 (Capacity and Volume)\n`);
    
    // Define the 4 lessons with EXACT 45-minute ETFO structure (8/27/10 split)
    const lessons = [
      {
        // LESSON 1: Monday Jan 19 - Full and Empty (Plein et vide)
        title: 'Full and Empty',
        titleFr: 'Plein et vide',
        date: new Date('2026-01-19'),
        mindsOn: 'Circle time exploration: Show two identical containers, one empty and one full of water. Ask students to describe what they see using "full" and "empty". Introduce French vocabulary "plein" and "vide" through visual demonstrations and student predictions.',
        mindsOnFr: 'Exploration en cercle: Montrer deux contenants identiques, un vide et un plein d\'eau. Demander aux élèves de décrire ce qu\'ils voient en utilisant "plein" et "vide". Introduire vocabulaire français par démonstrations visuelles et prédictions d\'élèves.',
        action: 'Hands-on exploration centers: Station 1: Fill containers with water to explore "plein/vide". Station 2: Sort containers by full, half-full, and empty. Station 3: Use sand to fill different sized containers. Station 4: Mi\'kmaq water vessel exploration - learn about traditional birchbark containers and seasonal water collection practices. Partners record discoveries using drawings and French vocabulary.',
        actionFr: 'Centres d\'exploration pratique: Station 1: Remplir contenants avec eau pour explorer "plein/vide". Station 2: Trier contenants par plein, à moitié plein, et vide. Station 3: Utiliser sable pour remplir contenants de tailles différentes. Station 4: Exploration de récipients d\'eau Mi\'kmaq - apprendre sur contenants traditionnels d\'écorce de bouleau et collecte d\'eau saisonnière. Partenaires enregistrent découvertes avec dessins et vocabulaire français.',
        consolidation: 'Gallery walk to observe filling discoveries. Students share one container that was "plein" and one that was "vide". Discuss how we know when something is completely full. Preview tomorrow\'s capacity comparison activities.',
        consolidationFr: 'Visite de galerie pour observer découvertes de remplissage. Les élèves partagent un contenant qui était "plein" et un qui était "vide". Discuter comment on sait quand quelque chose est complètement plein. Aperçu des activités de comparaison de capacité de demain.',
        vocabularyTerms: 'plein/vide, remplir'
      },
      {
        // LESSON 2: Tuesday Jan 20 - Comparing Capacity (Comparer la capacité)
        title: 'Comparing Capacity',
        titleFr: 'Comparer la capacité',
        date: new Date('2026-01-20'),
        mindsOn: 'Mystery container challenge: Present 3 different shaped containers (tall/narrow, short/wide, medium). Students predict which holds the most water before testing. Build anticipation for discovering that shape affects our predictions but not always the actual capacity.',
        mindsOnFr: 'Défi de contenant mystère: Présenter 3 contenants de formes différentes (grand/étroit, court/large, moyen). Les élèves prédisent lequel contient le plus d\'eau avant de tester. Créer anticipation pour découvrir que la forme affecte nos prédictions mais pas toujours la capacité réelle.',
        action: 'Capacity investigation with water and measuring cups: Teams compare containers by filling and pouring. Discover that tall containers don\'t always hold more than wide ones. Use standard measuring cups to verify comparisons. Mi\'kmaq perspective: traditional water storage methods and how ancestors chose containers based on capacity needs for travel and storage.',
        actionFr: 'Investigation de capacité avec eau et tasses à mesurer: Les équipes comparent contenants en remplissant et versant. Découvrir que contenants hauts ne contiennent pas toujours plus que ceux larges. Utiliser tasses à mesurer standard pour vérifier comparaisons. Perspective Mi\'kmaq: méthodes traditionnelles de stockage d\'eau et comment ancêtres choisissaient contenants basé sur besoins de capacité pour voyage et stockage.',
        consolidation: 'Class data sharing: record which containers held the most and least. Discuss surprising discoveries about shape vs. capacity. Students explain their comparison strategies using concrete examples and French vocabulary.',
        consolidationFr: 'Partage de données de classe: enregistrer quels contenants contenaient le plus et le moins. Discuter découvertes surprenantes sur forme vs. capacité. Les élèves expliquent leurs stratégies de comparaison utilisant exemples concrets et vocabulaire français.',
        vocabularyTerms: 'capacité, verser'
      },
      {
        // LESSON 3: Thursday Jan 22 - Measuring with Containers (Mesurer avec contenants)
        title: 'Measuring with Containers',
        titleFr: 'Mesurer avec contenants',
        date: new Date('2026-01-22'),
        mindsOn: 'Teacher demonstration: Fill a large container using small cups while students count. "How many small cups does it take to fill our big container?" Introduce the concept of using one container to measure another\'s capacity.',
        mindsOnFr: 'Démonstration de l\'enseignante: Remplir un grand contenant utilisant petites tasses pendant que les élèves comptent. "Combien de petites tasses faut-il pour remplir notre grand contenant?" Introduire concept d\'utiliser un contenant pour mesurer la capacité d\'un autre.',
        action: 'Container measurement stations with varied materials: Station 1: Measure with small cups, Station 2: Measure with spoons, Station 3: Measure with measuring containers. Station 4: Traditional Mi\'kmaq measuring - using natural containers like shells and gourds. Partners discover that different measuring containers give different numbers, just like with length measurement.',
        actionFr: 'Stations de mesure de contenant avec matériaux variés: Station 1: Mesurer avec petites tasses, Station 2: Mesurer avec cuillères, Station 3: Mesurer avec contenants à mesurer. Station 4: Mesure traditionnelle Mi\'kmaq - utiliser contenants naturels comme coquillages et gourdes. Les partenaires découvrent que différents contenants à mesurer donnent différents nombres, comme avec mesure de longueur.',
        consolidation: 'Data collection and comparison: "Our container holds ___ cups and ___ spoons." Discuss why the numbers are different. Connect to previous length measurement learning and Mi\'kmaq traditional measuring wisdom.',
        consolidationFr: 'Collecte et comparaison de données: "Notre contenant contient ___ tasses et ___ cuillères." Discuter pourquoi les nombres sont différents. Connecter à apprentissage précédent de mesure de longueur et sagesse traditionnelle de mesure Mi\'kmaq.',
        vocabularyTerms: 'mesurer, contenant'
      },
      {
        // LESSON 4: Friday Jan 23 - Water Play Measurement (Mesure avec l'eau)
        title: 'Water Play Measurement',
        titleFr: 'Mesure avec l\'eau',
        date: new Date('2026-01-23'),
        mindsOn: 'Water play setup with various containers and funnels. Students predict which containers will overflow first when filled with water. Build excitement for hands-on water exploration and capacity testing.',
        mindsOnFr: 'Configuration de jeu d\'eau avec contenants variés et entonnoirs. Les élèves prédisent quels contenants déborderont en premier quand remplis d\'eau. Créer excitation pour exploration pratique d\'eau et test de capacité.',
        action: 'Structured water play investigation: Teams use water to test capacity predictions, practice pouring between containers, and explore how water takes the shape of its container. Mi\'kmaq water teachings: traditional water collection from streams and rain, and how our ancestors respected water as sacred. Document observations through drawings and measurements.',
        actionFr: 'Investigation structurée de jeu d\'eau: Les équipes utilisent eau pour tester prédictions de capacité, pratiquer verser entre contenants, et explorer comment eau prend forme de son contenant. Enseignements d\'eau Mi\'kmaq: collecte traditionnelle d\'eau de ruisseaux et pluie, et comment nos ancêtres respectaient eau comme sacrée. Documenter observations par dessins et mesures.',
        consolidation: 'Reflection circle: share most interesting water discovery. Students demonstrate their best pouring technique and explain what they learned about capacity. Celebrate week\'s measurement learning and preview future measurement adventures.',
        consolidationFr: 'Cercle de réflexion: partager découverte d\'eau la plus intéressante. Les élèves démontrent leur meilleure technique de versement et expliquent ce qu\'ils ont appris sur capacité. Célébrer apprentissage de mesure de la semaine et aperçu d\'aventures de mesure futures.',
        vocabularyTerms: 'verser, déborder'
      }
    ];
    
    // Create all lesson plans in database
    console.log('💾 Creating capacity and volume lessons in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: user.id,
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
          
          // Learning goals aligned with capacity and volume curriculum
          learningGoals: `Students will explore capacity and volume concepts through hands-on water play and container comparison activities. Develop understanding of "full/empty" and capacity measurement using concrete materials and French vocabulary.`,
          learningGoalsFr: `Les élèves exploreront les concepts de capacité et volume par des activités pratiques de jeu d'eau et comparaison de contenants. Développer compréhension de "plein/vide" et mesure de capacité utilisant matériaux concrets et vocabulaire français.`,
          
          // Rich materials for concrete exploration
          materials: JSON.stringify([
            'Various sized containers (plastic cups, bowls, bottles)',
            'Water play materials and towels',
            'Sand for alternative filling activities',
            'Measuring cups in different sizes',
            'Funnels for easy pouring',
            'Natural containers (shells, gourds where available)',
            'Student math portfolios for recording',
            'French vocabulary anchor charts',
            'Traditional Mi\'kmaq water vessels (images/examples)',
            'Chart paper for class data collection'
          ]),
          
          grouping: 'Whole class introduction, partner exploration teams, small group water play stations, individual reflection and recording',
          
          // Comprehensive JSON differentiation with all 4 types (100+ characters each)
          accommodations: JSON.stringify([
            'Visual supports with picture cards showing capacity concepts like full, empty, and pouring, allowing students to point or use gestures when verbal expression is challenging during water activities',
            'Concrete manipulatives and water play materials available at all times for tactile learners who need hands-on exploration to understand capacity relationships and volume concepts through physical interaction',
            'Extended processing time during water exploration and discussions, with visual cues and prompts to support students who need additional time to observe and formulate responses about their discoveries',
            'Choice of recording methods including drawing, pointing to pictures, or using physical demonstrations rather than requiring written responses for documenting capacity and volume learning'
          ]),
          
          modifications: JSON.stringify([
            'Simplified capacity tasks focusing on basic "full" and "empty" concepts rather than complex volume comparisons, reducing cognitive load while maintaining core understanding of container capacity',
            'Reduced number of containers to compare (2-3 instead of multiple) and providing step-by-step visual guides for water pouring procedures to support executive functioning and sequencing needs',
            'Alternative assessment through observation and physical demonstration rather than written documentation, allowing students to show understanding through hands-on manipulation and verbal or gestural responses',
            'Peer buddy system for support during water play activities, ensuring students have immediate assistance with pouring techniques and safety procedures when working with water materials'
          ]),
          
          extensions: JSON.stringify([
            'Advanced capacity challenges including estimation before measuring and creating measurement experiments to test which containers hold the most water using scientific prediction methods',
            'Cross-curricular connections to science by exploring how water takes the shape of containers, investigating displacement, and connecting to natural water cycles and traditional water collection methods',
            'Leadership opportunities as "capacity experts" helping younger students learn pouring techniques and teaching water measurement vocabulary to kindergarten classes through peer mentoring activities',
            'Creative problem-solving challenges such as designing the most efficient water container for specific purposes and investigating how different cultures have traditionally measured and stored water'
          ]),
          
          // Enhanced differentiation for diverse learners  
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Provide visual capacity anchor charts, use consistent measuring containers, offer guided practice with teacher support before independent water exploration, break pouring tasks into smaller sequential steps',
            forELL: 'Bilingual vocabulary cards with images of containers and water actions, peer translation support, hands-on exploration before verbal explanation, visual recording options alongside French vocabulary development',
            forAdvanced: 'Open-ended capacity investigations, opportunities to create measurement problems using water for peers, exploration of traditional Indigenous water measurement methods and modern measuring tools',
            forIEP: 'Individualized materials based on IEP goals, waterproof sensory-friendly options, alternative communication methods for describing observations, modified pacing with built-in breaks and support as needed'
          }),
          
          // Observable assessment with checkboxes as specified
          assessmentType: 'formative',
          assessmentNotes: `Observable Assessment Checkboxes:
☐ Identifies when containers are "plein" (full) and "vide" (empty) with accuracy
☐ Compares capacity of different containers using direct filling and pouring methods
☐ Demonstrates understanding that container shape affects appearance but not always capacity
☐ Uses French vocabulary (plein/vide, capacité, verser, mesurer) appropriately in context
☐ Explains capacity comparison strategies using concrete examples and demonstrations
☐ Shows respect for Mi'kmaq traditional water collection and measurement knowledge
☐ Collaborates effectively with partners during water play exploration activities
☐ Records capacity discoveries through drawings, measurements, and French vocabulary words
☐ Makes connections between capacity measurement and real-world water use applications
☐ Demonstrates safe and respectful handling of water materials during hands-on exploration`,
          
          // Enhanced substitute support
          isSubFriendly: true,
          subNotes: 'Water play materials organized in labeled bins with towels readily available. Visual schedule posted showing 8min/27min/10min timing. French vocabulary charts displayed prominently. Emergency backup activity: students compare capacity using dry materials like rice or beans. All containers pre-organized and safety procedures clearly posted. Student helpers assigned for material distribution and cleanup.',
          
          // Mi'kmaq perspectives (100+ characters as specified)
          indigenousPerspectives: 'Mi\'kmaq traditional knowledge includes using natural containers like birchbark vessels, shells, and gourds for water collection and storage. Traditional teachings emphasize the sacred nature of water and its connection to all life. Students learn how Mi\'kmaq ancestors selected containers based on capacity needs for travel, seasonal water collection from streams and rain, and how proper water storage was essential for survival and community well-being.',
          
          // Additional pedagogical fields for enhanced lesson quality
          engagementHooks: JSON.stringify([
            'Mystery water containers to spark curiosity about capacity',
            'Real-world connections to cooking and water storage at home', 
            'Traditional Mi\'kmaq water collection stories and vessel examples',
            'Hands-on water play exploration with varied materials and containers'
          ]),
          
          formativeCheckpoints: JSON.stringify([
            'Partner sharing during water exploration rotations',
            'Quick exit ticket: Draw one container that holds more water',
            'Thumbs up/down for understanding after each water activity',
            'Gallery walk observations and peer feedback on capacity discoveries'
          ]),
          
          interventionStrategies: JSON.stringify([
            'Additional modeling with teacher support for pouring techniques',
            'Simplified capacity comparison tasks with fewer containers',
            'Peer buddy support during challenging water activities',
            'Visual cues and anchor charts for French vocabulary support'
          ]),
          
          performanceOpportunities: 'Students demonstrate capacity understanding through hands-on water exploration, peer teaching moments about pouring techniques, and verbal explanations of their capacity discoveries using concrete materials and French vocabulary.',
          
          priorKnowledgeCheck: 'Quick assessment of students\' understanding of "big" and "small" containers, experience with water play activities, and existing French vocabulary related to containers and liquid measurement.',
          
          reflectionActivities: JSON.stringify([
            'Partner discussion about capacity and volume discoveries',
            'Drawing journal entry of favorite water exploration activity',
            'Class sharing circle about measurement strategies with containers',
            'Connection to home: What containers do we use for water at home?'
          ])
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} (${lesson.date.toDateString()})`);
      
      // Link measurement curriculum expectation to each lesson
      const measurementExpectation = await prisma.curriculumExpectation.findFirst({
        where: {
          id: 'cmebyc93e000rvjqu1f8cfkil' // Measurement Concepts expectation
        }
      });
      
      if (measurementExpectation) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: measurementExpectation.id
          }
        });
        console.log(`  🔗 Linked to curriculum expectation: ${measurementExpectation.descriptionFr || measurementExpectation.description}`);
      }
    }
    
    console.log('\n🫗 CAPACITY AND VOLUME LESSONS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive 45-minute lessons created`);
    console.log('✅ Week 3 (Jan 19-23, 2026): Capacity and Volume exploration');
    console.log('✅ ETFO structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('✅ Rich differentiation with all 4 types (100+ characters each)');
    console.log('✅ Observable assessment with ☐ checkboxes');
    console.log('✅ Mi\'kmaq perspectives integrated (100+ characters)');
    console.log('✅ French vocabulary: plein/vide, capacité, verser, mesurer, contenant, déborder');
    console.log('✅ Hands-on water play and container exploration');
    console.log('✅ Traditional Mi\'kmaq water collection knowledge included');
    console.log('✅ Partner collaboration and French immersion integration');
    console.log('✅ Measurement curriculum expectations linked');
    console.log('\n🎯 Students ready to explore capacity and volume through concrete, culturally responsive water measurement activities!');
    
  } catch (error) {
    console.error('❌ Error creating capacity and volume lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedCapacityVolumeWeek3Lessons()
  .then(() => console.log('\n🎉 Capacity and Volume lessons completed successfully!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });