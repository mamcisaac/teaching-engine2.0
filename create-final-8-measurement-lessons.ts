#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFinal8MeasurementLessons() {
  console.log('📏 Creating Final 8 Measurement Exploration Lessons for Emily McIsaac\'s Grade 1 French Immersion class...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    console.log(`✅ Found Emily's account (ID: ${emily.id})`);
    
    // Connect to existing Mathematics long range plan
    const mathLongRangePlan = await prisma.longRangePlan.findUnique({
      where: { id: 'cmedpmy9d0003vjpw1vzzden9' }
    });
    
    if (!mathLongRangePlan) {
      throw new Error('Mathematics long range plan not found.');
    }
    
    console.log(`✅ Found mathematics long range plan: ${mathLongRangePlan.title}`);

    // Create the Measurement Exploration unit plan first
    const measurementUnit = await prisma.unitPlan.create({
      data: {
        id: 'cmectx0p2000pvj4pyw3hgsbz',
        userId: emily.id,
        longRangePlanId: mathLongRangePlan.id,
        title: 'Measurement Exploration',
        titleFr: 'Exploration de la mesure',
        description: 'Comprehensive measurement exploration unit covering time, temperature, and measurement tools through hands-on activities and Mi\'kmaq perspectives.',
        descriptionFr: 'Unité d\'exploration de mesure complète couvrant temps, température, et outils de mesure par activités pratiques et perspectives Mi\'kmaq.',
        estimatedHours: 8,
        startDate: new Date('2026-01-26'),
        endDate: new Date('2026-02-06'),
        bigIdeas: 'Measurement helps us understand and describe our world. Different tools and methods can be used to measure various attributes.',
        bigIdeasFr: 'La mesure nous aide à comprendre et décrire notre monde. Différents outils et méthodes peuvent être utilisés pour mesurer divers attributs.',
        essentialQuestions: JSON.stringify([
          'How do we measure time and temperature?',
          'What tools help us measure things?',
          'How did Mi\'kmaq people traditionally measure?'
        ]),
        crossCurricularConnections: JSON.stringify({
          'Sciences de la nature': 'Weather observation and seasonal patterns',
          'Sciences humaines': 'Calendar systems and cultural time concepts',
          'Arts visuels': 'Creating measurement tools and recording charts'
        }),
        indigenousPerspectives: 'Mi\'kmaq traditional measurement knowledge including natural indicators, seasonal cycles, and sustainable practices for understanding and measuring the natural world.',
        keyVocabulary: JSON.stringify([
          'jour, semaine, aujourd\'hui',
          'avant, après, maintenant', 
          'chaud, froid, température',
          'saison, hiver, printemps',
          'nature, extérieur, observer',
          'outils, mesurer, instrument',
          'jeux, jouer, gagner'
        ]),
        differentiationStrategies: JSON.stringify({
          'Visual supports': 'Picture cards, visual schedules, measurement anchor charts',
          'Hands-on materials': 'Concrete manipulatives and measurement tools',
          'Flexible grouping': 'Partner work, small groups, individual choice',
          'Multiple modalities': 'Visual, auditory, kinesthetic learning opportunities'
        }),
        assessmentPlan: 'Formative observation with checkboxes, portfolio collections, peer discussions, and traditional knowledge connections'
      }
    });
    
    console.log(`✅ Created unit plan: ${measurementUnit.titleFr} (ID: ${measurementUnit.id})`);
    
    // Get measurement curriculum expectation
    const measurementExpectation = await prisma.curriculumExpectation.findUnique({
      where: { id: 'cmedpmy47000rvjppyyw7sjm7' }
    });
    
    if (!measurementExpectation) {
      throw new Error('Measurement curriculum expectation not found.');
    }
    
    console.log(`✅ Found measurement expectation: ${measurementExpectation.subject}`);
    
    // Define all 8 lessons with EXACT 45-minute ETFO structure (8/27/10)
    const lessons = [
      // Week 4: Time and Temperature (Jan 26-30)
      {
        // LESSON 1: Monday Jan 26 - Days of the Week
        title: 'Days of the Week',
        titleFr: 'Les jours de la semaine',
        date: new Date('2026-01-26'),
        vocabularyTerms: 'jour, semaine, aujourd\'hui',
        mindsOn: 'Circle time calendar exploration: What day is today? Count days in our week. Students share what they do on different days. Preview French days of the week song.',
        mindsOnFr: 'Exploration du calendrier en cercle: Quel jour sommes-nous? Compter les jours de notre semaine. Les élèves partagent ce qu\'ils font différents jours. Aperçu de la chanson française des jours de la semaine.',
        action: 'Interactive days stations: Station 1: Order days of week cards (français/anglais). Station 2: Yesterday/Today/Tomorrow sorting. Station 3: Mi\'kmaq seasonal calendar exploration. Station 4: Weekly routine recording. Partners practice days pronunciation and create daily activity sequences.',
        actionFr: 'Stations interactives des jours: Station 1: Ordonner cartes des jours (français/anglais). Station 2: Tri hier/aujourd\'hui/demain. Station 3: Exploration calendrier saisonnier Mi\'kmaq. Station 4: Enregistrement routine hebdomadaire. Partenaires pratiquent prononciation jours et créent séquences d\'activités quotidiennes.',
        consolidation: 'Class calendar update with French day names. Share favorite day and why. Preview tomorrow\'s sequencing activities with daily events.',
        consolidationFr: 'Mise à jour calendrier classe avec noms français des jours. Partager jour préféré et pourquoi. Aperçu activités de séquençage de demain avec événements quotidiens.',
        indigenousPerspectives: 'Mi\'kmaq traditional calendar follows natural cycles with thirteen moons, each representing different seasonal activities and ceremonies. Students learn how Mi\'kmaq people organized time around natural phenomena like animal migrations, plant cycles, and weather patterns, showing deep connection to land and seasons.'
      },
      {
        // LESSON 2: Tuesday Jan 27 - Sequencing Daily Events
        title: 'Sequencing Daily Events',
        titleFr: 'Séquencer les événements',
        date: new Date('2026-01-27'),
        vocabularyTerms: 'avant, après, maintenant',
        mindsOn: 'Morning routine mystery: Teacher shows mixed-up pictures of getting ready for school. Students help put in correct order. Discuss "What comes first?" "What happens next?"',
        mindsOnFr: 'Mystère de routine matinale: L\'enseignante montre images mélangées de se préparer pour l\'école. Les élèves aident à mettre en ordre correct. Discuter "Qu\'est-ce qui vient en premier?" "Qu\'est-ce qui arrive ensuite?"',
        action: 'Time sequence challenges: Station 1: Personal daily routine sequencing with photos. Station 2: School day timeline creation. Station 3: Traditional Mi\'kmaq daily patterns (sunrise ceremonies, seasonal tasks). Station 4: French time words matching. Document sequences using drawings and French vocabulary.',
        actionFr: 'Défis de séquence temporelle: Station 1: Séquençage routine quotidienne personnelle avec photos. Station 2: Création ligne de temps journée scolaire. Station 3: Modèles quotidiens traditionnels Mi\'kmaq (cérémonies lever soleil, tâches saisonnières). Station 4: Correspondance mots français de temps. Documenter séquences utilisant dessins et vocabulaire français.',
        consolidation: 'Timeline gallery walk and sharing. Students explain their sequence choices using "avant" and "après". Set up tomorrow\'s hot and cold exploration.',
        consolidationFr: 'Visite de galerie ligne de temps et partage. Les élèves expliquent leurs choix de séquence utilisant "avant" et "après". Préparer exploration chaud et froid de demain.',
        indigenousPerspectives: 'Mi\'kmaq daily life traditionally followed natural rhythms - sunrise prayers, seasonal food gathering, evening storytelling. Time was measured by natural events rather than clocks, teaching children to observe and respect natural cycles for daily planning and seasonal activities.'
      },
      {
        // LESSON 3: Wednesday Jan 28 - Hot and Cold
        title: 'Hot and Cold',
        titleFr: 'Chaud et froid',
        date: new Date('2026-01-28'),
        vocabularyTerms: 'chaud, froid, température',
        mindsOn: 'Temperature mystery boxes: Students feel (safely) warm and cool objects without seeing them. Share observations about hot and cold sensations. Introduce thermometer as temperature tool.',
        mindsOnFr: 'Boîtes mystère de température: Les élèves touchent (sécuritairement) objets chauds et froids sans les voir. Partager observations sur sensations chaudes et froides. Introduire thermomètre comme outil de température.',
        action: 'Temperature investigation centers: Station 1: Indoor/outdoor temperature comparison. Station 2: Hot/cold object sorting with safety rules. Station 3: Mi\'kmaq traditional temperature indicators (animal behavior, plant changes). Station 4: Temperature recording with picture thermometers. Partners predict and measure temperatures.',
        actionFr: 'Centres d\'investigation de température: Station 1: Comparaison température intérieur/extérieur. Station 2: Tri objets chauds/froids avec règles sécurité. Station 3: Indicateurs température traditionnels Mi\'kmaq (comportement animal, changements plantes). Station 4: Enregistrement température avec thermomètres images. Partenaires prédisent et mesurent températures.',
        consolidation: 'Temperature discoveries sharing circle. Create class hot/cold chart with French labels. Discuss clothing choices for different temperatures.',
        consolidationFr: 'Cercle partage découvertes température. Créer graphique chaud/froid classe avec étiquettes françaises. Discuter choix vêtements pour différentes températures.',
        indigenousPerspectives: 'Mi\'kmaq people read natural temperature signs like ice thickness for safe travel, animal coat changes indicating weather shifts, and plant responses to predict seasonal timing. Traditional knowledge included making clothing and shelters appropriate for temperature changes throughout the seasons.'
      },
      {
        // LESSON 4: Thursday Jan 29 - Seasons and Temperature
        title: 'Seasons and Temperature',
        titleFr: 'Saisons et température',
        date: new Date('2026-01-29'),
        vocabularyTerms: 'saison, hiver, printemps',
        mindsOn: 'Seasonal clothing sort: Four baskets with winter, spring, summer, fall clothes. Students match clothing to season and discuss why. Connect to temperature changes throughout year.',
        mindsOnFr: 'Tri vêtements saisonniers: Quatre paniers avec vêtements hiver, printemps, été, automne. Les élèves associent vêtements à saison et discutent pourquoi. Connecter aux changements température durant l\'année.',
        action: 'Seasonal temperature exploration: Station 1: Season and temperature matching activities. Station 2: Local weather patterns investigation. Station 3: Mi\'kmaq thirteen-moon calendar and seasonal temperatures. Station 4: Creating seasonal clothing guides. Record seasonal temperature patterns with drawings.',
        actionFr: 'Exploration température saisonnière: Station 1: Activités correspondance saison et température. Station 2: Investigation modèles météo locaux. Station 3: Calendrier treize lunes Mi\'kmaq et températures saisonnières. Station 4: Création guides vêtements saisonniers. Enregistrer modèles température saisonnière avec dessins.',
        consolidation: 'Seasonal temperature timeline creation. Share observations about how temperature changes affect daily life. Preview tomorrow\'s measurement celebration.',
        consolidationFr: 'Création ligne de temps température saisonnière. Partager observations comment changements température affectent vie quotidienne. Aperçu célébration mesure de demain.',
        indigenousPerspectives: 'Mi\'kmaq thirteen-moon calendar tracks seasonal temperature changes through detailed observations of nature - when maple sap runs, when ice forms, when birds migrate. Each moon period corresponds to specific temperature ranges and seasonal activities essential for survival and cultural practices.'
      },
      {
        // LESSON 5: Friday Jan 30 - Measurement Celebration
        title: 'Measurement Celebration',
        titleFr: 'Célébration de mesure',
        date: new Date('2026-01-30'),
        vocabularyTerms: 'célébrer, fête, mesure',
        mindsOn: 'Measurement museum setup: Display all measurement tools and discoveries from the week. Students become "tour guides" explaining their favorite measurement learning to visitors.',
        mindsOnFr: 'Installation musée de mesure: Afficher tous outils mesure et découvertes de la semaine. Les élèves deviennent "guides touristiques" expliquant leur apprentissage mesure préféré aux visiteurs.',
        action: 'Celebration stations with parent/buddy class visitors: Station 1: Demonstrating time and day skills. Station 2: Temperature tool demonstrations. Station 3: Mi\'kmaq measurement story sharing. Station 4: French vocabulary teaching center. Students teach others their measurement knowledge.',
        actionFr: 'Stations de célébration avec visiteurs parents/classe jumelle: Station 1: Démonstration compétences temps et jour. Station 2: Démonstrations outils température. Station 3: Partage histoires mesure Mi\'kmaq. Station 4: Centre enseignement vocabulaire français. Les élèves enseignent leur connaissance mesure aux autres.',
        consolidation: 'Reflection circle about measurement learning journey. Students share what they\'ll remember most. Certificates of measurement expertise presented.',
        consolidationFr: 'Cercle réflexion sur parcours apprentissage mesure. Les élèves partagent ce qu\'ils se rappelleront le plus. Certificats d\'expertise en mesure présentés.',
        indigenousPerspectives: 'Mi\'kmaq tradition includes sharing knowledge through storytelling and demonstration, ensuring measurement wisdom passes to next generations. Celebration honors the connection between measurement knowledge and respect for natural world that provides all measurement references.'
      },
      // Additional Coverage Lessons (Feb 2-6)
      {
        // LESSON 6: Monday Feb 2 - Measurement in Nature
        title: 'Measurement in Nature',
        titleFr: 'Mesure dans la nature',
        date: new Date('2026-02-02'),
        vocabularyTerms: 'nature, extérieur, observer',
        mindsOn: 'Nature walk preview with measurement mission: Find the longest stick, tallest tree, biggest rock. Students predict what they\'ll discover outside using their measurement skills.',
        mindsOnFr: 'Aperçu promenade nature avec mission mesure: Trouver le plus long bâton, plus grand arbre, plus grosse roche. Les élèves prédisent ce qu\'ils découvriront dehors utilisant leurs compétences mesure.',
        action: 'Outdoor measurement expedition: Station 1: Natural object length comparisons. Station 2: Tree height estimation using body measurements. Station 3: Traditional Mi\'kmaq natural measuring techniques. Station 4: Nature measurement recording with sketches. Collect natural materials for classroom measurement tools.',
        actionFr: 'Expédition mesure extérieure: Station 1: Comparaisons longueur objets naturels. Station 2: Estimation hauteur arbres utilisant mesures corporelles. Station 3: Techniques mesure naturelle traditionnelles Mi\'kmaq. Station 4: Enregistrement mesure nature avec croquis. Collecter matériaux naturels pour outils mesure classe.',
        consolidation: 'Nature measurement discoveries sharing. Sort collected natural materials by size. Plan how to use natural materials as measurement tools tomorrow.',
        consolidationFr: 'Partage découvertes mesure nature. Trier matériaux naturels collectés par taille. Planifier comment utiliser matériaux naturels comme outils mesure demain.',
        indigenousPerspectives: 'Mi\'kmaq people traditionally used natural materials like arm-length branches, handfuls of seeds, and stone weights for measuring. Nature provided all necessary measurement tools, teaching deep observation skills and sustainable practices for gathering and using natural resources respectfully.'
      },
      {
        // LESSON 7: Tuesday Feb 3 - Measurement Tools
        title: 'Measurement Tools',
        titleFr: 'Outils de mesure',
        date: new Date('2026-02-03'),
        vocabularyTerms: 'outils, mesurer, instrument',
        mindsOn: 'Mystery measurement tool investigation: Various measuring tools in covered boxes. Students predict what each tool measures by feeling shape and size before revealing.',
        mindsOnFr: 'Investigation outil mesure mystère: Divers outils mesure dans boîtes couvertes. Les élèves prédisent ce que chaque outil mesure en sentant forme et taille avant révéler.',
        action: 'Measurement tool exploration centers: Station 1: Ruler and measuring tape investigations. Station 2: Balance scale and weighing activities. Station 3: Traditional Mi\'kmaq measuring tools (reconstructed safely). Station 4: Creating personal measurement tools from natural materials. Test tools effectiveness with various objects.',
        actionFr: 'Centres exploration outils mesure: Station 1: Investigations règle et ruban mesurer. Station 2: Balance et activités pesage. Station 3: Outils mesure traditionnels Mi\'kmaq (reconstruits sécuritairement). Station 4: Création outils mesure personnels à partir matériaux naturels. Tester efficacité outils avec divers objets.',
        consolidation: 'Tool effectiveness evaluation and sharing. Compare handmade vs. commercial tools. Organize classroom measurement tool collection for easy access.',
        consolidationFr: 'Évaluation efficacité outils et partage. Comparer outils faits main vs. commerciaux. Organiser collection outils mesure classe pour accès facile.',
        indigenousPerspectives: 'Mi\'kmaq craftspeople created sophisticated measuring tools from available materials - wooden rulers, stone weights, cord measures, and natural containers. Tool-making required understanding of measurement principles and respect for materials, connecting practical skills with cultural values of resourcefulness and sustainability.'
      },
      {
        // LESSON 8: Wednesday Feb 4 - Measurement Games
        title: 'Measurement Games',
        titleFr: 'Jeux de mesure',
        date: new Date('2026-02-04'),
        vocabularyTerms: 'jeux, jouer, gagner',
        mindsOn: 'Measurement guessing game: Display mystery objects, students estimate measurements before revealing actual measurements. Celebrate close estimates and discuss strategies.',
        mindsOnFr: 'Jeu devinettes mesure: Afficher objets mystère, élèves estiment mesures avant révéler mesures réelles. Célébrer estimations proches et discuter stratégies.',
        action: 'Measurement game tournament: Station 1: "Longer or Shorter?" comparison games. Station 2: Estimation challenges with prizes. Station 3: Traditional Mi\'kmaq measuring games adapted for classroom. Station 4: French vocabulary measurement memory games. Teams rotate and earn points for measurement accuracy.',
        actionFr: 'Tournoi jeux mesure: Station 1: Jeux comparaison "Plus long ou plus court?". Station 2: Défis estimation avec prix. Station 3: Jeux mesure traditionnels Mi\'kmaq adaptés pour classe. Station 4: Jeux mémoire vocabulaire mesure français. Équipes font rotation et gagnent points pour précision mesure.',
        consolidation: 'Tournament celebration and prize distribution. Reflect on favorite measurement games and skills learned. Plan measurement applications for future learning.',
        consolidationFr: 'Célébration tournoi et distribution prix. Réfléchir sur jeux mesure préférés et compétences apprises. Planifier applications mesure pour apprentissage futur.',
        indigenousPerspectives: 'Mi\'kmaq children learned measurement through traditional games that developed estimation skills, spatial awareness, and practical applications. Games taught patience, observation, and accuracy while connecting measurement learning to community activities and seasonal celebrations, making learning joyful and culturally meaningful.'
      }
    ];
    
    // Create all lesson plans in database
    console.log('💾 Creating final 8 measurement exploration lessons in database...\n');
    
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
          learningGoals: `Students will explore ${lessonData.title.toLowerCase()} concepts through hands-on activities and Mi'kmaq perspectives. Develop French vocabulary and measurement understanding.`,
          learningGoalsFr: `Les élèves exploreront les concepts ${lessonData.titleFr.toLowerCase()} par activités pratiques et perspectives Mi'kmaq. Développer vocabulaire français et compréhension mesure.`,
          
          // Rich materials for concrete exploration
          materials: JSON.stringify([
            'French vocabulary anchor charts',
            'Mi\'kmaq traditional knowledge resources',
            'Hands-on measurement materials',
            'Visual supports and picture cards',
            'Recording sheets and portfolios',
            'Natural materials and objects',
            'Interactive station materials',
            'Cultural artifacts and images',
            'Temperature tools and calendars',
            'Student collaboration materials'
          ]),
          
          grouping: 'Whole class introduction circles, partner exploration teams, small group station rotations, individual reflection and recording',
          
          // Comprehensive JSON differentiation with all 4 types (100+ characters each)
          accommodations: JSON.stringify([
            'Visual supports with picture cards and symbols for all measurement concepts, enabling students to participate fully regardless of language or processing differences',
            'Concrete manipulatives and hands-on materials available throughout all activities, supporting tactile learners and providing multiple sensory access points',
            'Extended processing time during discussions and activities, with visual cues and gentle prompts to support diverse learning needs and communication styles',
            'Multiple recording methods including drawing, pointing, verbal responses, and concrete demonstrations rather than requiring only written responses for assessments'
          ]),
          
          modifications: JSON.stringify([
            'Simplified measurement concepts focusing on basic comparisons (bigger/smaller, hot/cold) rather than complex sequences, reducing cognitive load while maintaining core learning',
            'Reduced number of measurement comparisons with clear step-by-step visual guides and consistent routine structures to support executive functioning needs',
            'Alternative assessment through careful observation and informal conversation rather than formal written documentation, allowing flexible demonstration of understanding',
            'Dedicated peer buddy support system during all independent work periods, ensuring immediate assistance and positive social modeling are always available'
          ]),
          
          extensions: JSON.stringify([
            'Advanced measurement investigations including creating personal measurement tools, testing effectiveness, and developing measurement hypotheses for classroom applications',
            'Leadership roles as "measurement mentors" teaching concepts to younger students, documenting learning in measurement journals, and presenting to other classes',
            'Deep cultural connections researching Mi\'kmaq traditional measurement wisdom, interviewing community members, and creating presentations about Indigenous knowledge systems',
            'Creative problem-solving challenges designing measurement solutions for real classroom problems and connecting measurement learning to home and community applications'
          ]),
          
          // Enhanced differentiation for diverse learners  
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Provide consistent visual measurement anchor charts, use predictable concrete materials, offer guided practice with teacher support, break complex tasks into smaller sequential steps with immediate feedback',
            forELL: 'Bilingual vocabulary cards with clear images, peer translation support when possible, prioritize hands-on exploration before verbal explanation, provide visual recording options alongside French vocabulary development',
            forAdvanced: 'Open-ended measurement investigations and problem-solving challenges, opportunities to create measurement problems for peers, exploration of complex measurement systems including traditional Indigenous methods',
            forIEP: 'Individualized materials based on specific IEP goals and accommodations, sensory-friendly alternatives, alternative communication methods, modified pacing with built-in breaks and personalized support strategies'
          }),
          
          // Observable assessment with checkboxes as specified
          assessmentType: 'formative observation',
          assessmentNotes: `Observable Assessment Checkboxes:
☐ Demonstrates understanding of time concepts (days, sequence, before/after)
☐ Identifies and describes temperature differences using appropriate vocabulary
☐ Uses measurement tools appropriately and safely during investigations
☐ Applies French vocabulary (${lessonData.vocabularyTerms}) accurately in context
☐ Shows respect and curiosity for Mi'kmaq traditional measurement knowledge
☐ Collaborates effectively with partners during exploration activities and discussions
☐ Records measurement discoveries through drawings, words, or demonstrations
☐ Makes meaningful connections between measurement concepts and daily life experiences
☐ Demonstrates problem-solving strategies when facing measurement challenges
☐ Shows growth in measurement understanding throughout the lesson activities`,
          
          // Enhanced substitute support
          isSubFriendly: true,
          subNotes: 'All measurement materials organized in clearly labeled bins by station. Visual lesson schedule posted showing 8min/27min/10min timing structure. French vocabulary charts and measurement reference posters displayed prominently. Emergency backup activity: students measure classroom objects with their hands. All materials pre-counted and organized. Student helpers assigned for material distribution and collection. Indigenous perspectives information provided respectfully.',
          
          // Mi'kmaq perspectives (100+ characters as specified)
          indigenousPerspectives: lessonData.indigenousPerspectives,
          
          // Vocabulary integrated into learning goals and materials
          
          // Additional pedagogical fields for enhanced lesson quality
          engagementHooks: JSON.stringify([
            'Mystery boxes and guessing activities to spark curiosity',
            'Real-world measurement connections and practical applications', 
            'Traditional Mi\'kmaq measurement wisdom and cultural stories',
            'Hands-on exploration with varied concrete materials and tools'
          ]),
          
          formativeCheckpoints: JSON.stringify([
            'Partner sharing during station rotations and activity transitions',
            'Quick verbal check-ins: "Show me something you measured today"',
            'Thumbs up/down for understanding after each major lesson section',
            'Gallery walk observations with peer feedback and celebration'
          ]),
          
          interventionStrategies: JSON.stringify([
            'Additional teacher modeling and guided practice with immediate feedback',
            'Simplified measurement tasks with fewer variables and clearer structure',
            'Increased peer buddy support during challenging measurement activities',
            'Enhanced visual cues, anchor charts, and vocabulary supports readily available'
          ]),
          
          performanceOpportunities: 'Students demonstrate measurement understanding through hands-on exploration, peer teaching moments, cultural knowledge sharing, and verbal explanations using concrete materials and French vocabulary in meaningful contexts.',
          
          priorKnowledgeCheck: 'Quick assessment of students\' familiarity with time concepts, temperature experiences, and basic French vocabulary related to measurement and comparison from previous lesson experiences.',
          
          reflectionActivities: JSON.stringify([
            'Partner discussions about daily measurement discoveries and applications',
            'Drawing journal entries featuring favorite measurement activities and learning',
            'Class sharing circles about measurement strategies and cultural connections',
            'Home connections: identifying measurement applications in family and community life'
          ])
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr} (${lesson.date.toDateString()})`);
      
      // Link measurement curriculum expectation to each lesson
      if (measurementExpectation) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: measurementExpectation.id
          }
        });
        console.log(`  🔗 Linked to curriculum expectation: Mathématiques measurement`);
      }
    }
    
    console.log('\n📏 FINAL 8 MEASUREMENT EXPLORATION LESSONS COMPLETED!');
    console.log(`✅ ${lessonCount} comprehensive 45-minute lessons created`);
    console.log('✅ Week 4 (Jan 26-30): Time and Temperature focus');
    console.log('✅ Additional Coverage (Feb 2-4): Nature, Tools, Games');
    console.log('✅ ETFO structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('✅ Rich differentiation with all 4 types (100+ characters each)');
    console.log('✅ Observable assessment with ☐ checkboxes');
    console.log('✅ Mi\'kmaq perspectives integrated (100+ characters)');
    console.log('✅ Max 3 vocabulary terms per lesson');
    console.log('✅ French vocabulary focus: jour/semaine, chaud/froid, saison, nature, outils, jeux');
    console.log('✅ Hands-on exploration with concrete materials');
    console.log('✅ Traditional Mi\'kmaq measurement knowledge throughout');
    console.log('✅ Partner collaboration and French immersion integration');
    console.log('✅ Measurement curriculum expectations linked');
    console.log('\n🎯 Emily\'s Grade 1 class ready for comprehensive measurement exploration!');
    
  } catch (error) {
    console.error('❌ Error creating final 8 measurement lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation function
createFinal8MeasurementLessons()
  .then(() => console.log('\n🎉 Final 8 Measurement Exploration lessons completed successfully!'))
  .catch((error) => {
    console.error('💥 Creation failed:', error);
    process.exit(1);
  });