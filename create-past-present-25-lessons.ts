#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPastPresentSocialStudiesLessons() {
  console.log('🕰️ Creating Social Studies "Past and Present/Passé et présent" 25 Lesson Plans...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Check if Past and Present unit plan exists, if not create it
    let pastPresentUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Passé et présent'
      }
    });
    
    if (!pastPresentUnit) {
      // Find the Social Studies long range plan
      const socialStudiesLRP = await prisma.longRangePlan.findFirst({
        where: {
          userId: emily.id,
          subject: 'Sciences humaines'
        }
      });
      
      if (!socialStudiesLRP) {
        throw new Error('Social Studies long range plan not found.');
      }
      
      // Create the unit plan
      pastPresentUnit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: socialStudiesLRP.id,
          title: 'Past and Present',
          titleFr: 'Passé et présent',
          description: 'Students explore changes over time through family history, school evolution, community development, technology advances, and heritage preservation. They develop understanding of continuity and change while appreciating their connection to the past.',
          descriptionFr: 'Les élèves explorent les changements au fil du temps à travers l\'histoire familiale, l\'évolution scolaire, le développement communautaire, les progrès technologiques et la préservation du patrimoine. Ils développent une compréhension de la continuité et du changement tout en appréciant leur lien avec le passé.',
          bigIdeas: 'The past shapes our present and helps us understand who we are. Communities, families, and technologies change over time while some traditions and values continue.',
          bigIdeasFr: 'Le passé façonne notre présent et nous aide à comprendre qui nous sommes. Les communautés, familles et technologies changent au fil du temps tandis que certaines traditions et valeurs continuent.',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-03-28'),
          estimatedHours: 25, // 8 weeks × 3.125 lessons × 45 minutes each
          assessmentPlan: 'Timeline creation, oral storytelling, artifact exploration, photo comparisons, heritage sharing, family interviews',
          indigenousPerspectives: 'Honor Mi\'kmaq oral traditions and seven generations thinking. Recognize how Indigenous peoples preserved knowledge through storytelling, ceremony, and connection to land. Acknowledge the continuous presence of Indigenous peoples in PEI before and after European contact.',
          communityConnections: 'Elder interviews, museum visits, historical society presentations, family heritage sharing, local artifact exploration, community timeline creation',
          crossCurricularConnections: 'French vocabulary development (time words), math (measuring time, counting years), arts (heritage crafts, historical artwork), science (simple machines then/now)',
          culminatingTask: 'Create a class heritage museum with family artifacts, community timeline, and bilingual presentations about "then and now" in PEI, demonstrating understanding of change and continuity',
          keyVocabulary: JSON.stringify([
            { en: 'past', fr: 'passé' },
            { en: 'present', fr: 'présent' },
            { en: 'history', fr: 'histoire' },
            { en: 'family', fr: 'famille' },
            { en: 'grandparents', fr: 'grands-parents' },
            { en: 'old', fr: 'ancien/vieux' },
            { en: 'new', fr: 'nouveau' },
            { en: 'then', fr: 'autrefois' },
            { en: 'now', fr: 'maintenant' },
            { en: 'before', fr: 'avant' },
            { en: 'after', fr: 'après' },
            { en: 'change', fr: 'changement' },
            { en: 'same', fr: 'même' },
            { en: 'different', fr: 'différent' },
            { en: 'artifact', fr: 'artefact' },
            { en: 'tradition', fr: 'tradition' },
            { en: 'heritage', fr: 'patrimoine' },
            { en: 'community', fr: 'communauté' },
            { en: 'school', fr: 'école' },
            { en: 'transportation', fr: 'transport' },
            { en: 'technology', fr: 'technologie' },
            { en: 'museum', fr: 'musée' },
            { en: 'story', fr: 'histoire/conte' }
          ]),
          essentialQuestions: JSON.stringify([
            'How has our community changed over time?',
            'What stays the same and what changes in families?',
            'How did children live and learn long ago?',
            'What can we learn from the past?',
            'How do we preserve and share our heritage?'
          ]),
          learningSkills: JSON.stringify([
            'Historical thinking and chronological understanding',
            'Oral communication through storytelling',
            'Critical thinking about change and continuity',
            'Cultural awareness and appreciation',
            'Research and inquiry skills'
          ]),
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual timeline supports, concrete artifacts to handle, simplified vocabulary, peer storytelling partners, family support for interviews',
            forIEP: 'Individual accommodations per IEP, alternative communication methods, modified timeline expectations, sensory artifact exploration',
            forELL: 'Bilingual family interviews, visual vocabulary supports, translation assistance, cultural heritage sharing in home language',
            forAdvanced: 'Extended family research, leadership in museum creation, complex timeline analysis, mentoring younger students'
          }),
          performanceTask: JSON.stringify({
            title: 'Heritage Museum Curator',
            description: 'Students become museum curators, creating exhibits about past and present in their families and community, with artifacts, timelines, and bilingual explanations',
            criteria: ['Demonstrates understanding of change and continuity', 'Uses appropriate time vocabulary in French', 'Shares family heritage respectfully', 'Compares past and present effectively']
          })
        }
      });
      
      console.log(`✅ Created unit plan: ${pastPresentUnit.titleFr} (ID: ${pastPresentUnit.id})`);
    } else {
      console.log(`✅ Found existing unit plan: ${pastPresentUnit.titleFr} (ID: ${pastPresentUnit.id})`);
    }
    
    console.log(`📅 Duration: February 1 - March 28, 2025 (25 lessons over 8 weeks)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: pastPresentUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 25 lesson plans
    const lessons = [];
    
    // Helper function to create lesson dates (Mon, Wed, Fri pattern)
    const getLessonDates = () => {
      const dates = [];
      const startDate = new Date('2025-02-01'); // Saturday, so first lesson Monday Feb 3
      let currentDate = new Date('2025-02-03'); // Start on Monday
      
      // Pattern: Monday, Wednesday, Friday for 8+ weeks
      for (let i = 0; i < 25; i++) {
        dates.push(new Date(currentDate));
        
        // Increment by 2 days (Mon->Wed, Wed->Fri)
        if (currentDate.getDay() === 1) { // Monday
          currentDate.setDate(currentDate.getDate() + 2); // -> Wednesday
        } else if (currentDate.getDay() === 3) { // Wednesday
          currentDate.setDate(currentDate.getDate() + 2); // -> Friday
        } else { // Friday
          currentDate.setDate(currentDate.getDate() + 3); // -> Monday
        }
      }
      
      return dates;
    };
    
    const lessonDates = getLessonDates();
    
    // LESSONS 1-5: FAMILY HISTORY
    lessons.push({
      title: 'My Family Tree',
      titleFr: 'Mon arbre généalogique',
      date: lessonDates[0],
      mindsOn: 'Look at photos of your family. Who are the people in your family? What generations can you see?',
      mindsOnFr: 'Regardez photos de votre famille. Qui sont les personnes? Quelles générations voyez-vous?',
      action: 'Create simple family tree with photos, learn family vocabulary, interview family member about relatives',
      actionFr: 'Créer arbre généalogique simple avec photos, apprendre vocabulaire famille, interviewer membre famille',
      consolidation: 'Share family trees, discuss different family structures, appreciate family diversity',
      consolidationFr: 'Partager arbres généalogiques, discuter structures familiales, apprécier diversité familiale',
      vocabularyFr: JSON.stringify(['famille', 'parents', 'grands-parents']),
      indigenousPerspectives: 'Learn about Mi\'kmaq understanding of extended family including seven generations - those who came before us, those here now, and those who will come after us. Recognize that Indigenous families include the whole community.',
      assessmentNotes: '☐ Creates basic family tree ☐ Uses family vocabulary in French ☐ Shows respect for different family structures',
      materials: JSON.stringify(['Family photos', 'Family tree template', 'Interview questions', 'Art supplies'])
    });

    lessons.push({
      title: 'Grandparents Then and Now',
      titleFr: 'Grands-parents autrefois et maintenant',
      date: lessonDates[1],
      mindsOn: 'Think about your grandparents or elder relatives. What stories do they tell about when they were young?',
      mindsOnFr: 'Pensez à vos grands-parents. Quelles histoires racontent-ils de leur jeunesse?',
      action: 'Listen to grandparent stories, compare childhood then/now, create timeline of grandparent\'s life',
      actionFr: 'Écouter histoires grands-parents, comparer enfance autrefois/maintenant, créer ligne temps vie',
      consolidation: 'Share grandparent stories, identify changes and similarities, plan elder interview',
      consolidationFr: 'Partager histoires, identifier changements et similitudes, planifier entrevue aîné',
      vocabularyFr: JSON.stringify(['grands-parents', 'autrefois', 'jeune']),
      indigenousPerspectives: 'Honor the Mi\'kmaq tradition of respecting elders as knowledge keepers and wisdom sharers. Learn how Indigenous elders pass down important cultural knowledge through storytelling.',
      assessmentNotes: '☐ Listens respectfully to elder stories ☐ Identifies changes over time ☐ Compares past and present experiences',
      materials: JSON.stringify(['Elder interview forms', 'Timeline template', 'Recording device if available', 'Story sharing circle space'])
    });

    lessons.push({
      title: 'Old Family Photos Tell Stories',
      titleFr: 'Les vieilles photos de famille racontent des histoires',
      date: lessonDates[2],
      mindsOn: 'Look closely at old family photos. What do you notice about clothes, houses, and activities?',
      mindsOnFr: 'Regardez attentivement vieilles photos famille. Que remarquez-vous vêtements, maisons, activités?',
      action: 'Examine old photos with magnifying glasses, compare clothing/objects then/now, create photo observations',
      actionFr: 'Examiner vieilles photos avec loupes, comparer vêtements/objets, créer observations photos',
      consolidation: 'Share photo discoveries, discuss what photos tell us about past, start photo timeline',
      consolidationFr: 'Partager découvertes photos, discuter ce que photos nous disent, commencer chronologie photos',
      vocabularyFr: JSON.stringify(['photo', 'vieux', 'vêtements']),
      indigenousPerspectives: 'Recognize that before photography, Indigenous peoples preserved family history through oral traditions, artwork, and ceremonial objects that told stories of ancestors.',
      assessmentNotes: '☐ Makes observations about historical photos ☐ Compares past and present items ☐ Asks thoughtful questions about the past',
      materials: JSON.stringify(['Collection of old family photos', 'Magnifying glasses', 'Observation sheets', 'Photo timeline template'])
    });

    lessons.push({
      title: 'Family Traditions Over Time',
      titleFr: 'Traditions familiales au fil du temps',
      date: lessonDates[3],
      mindsOn: 'What special things does your family do together? What traditions come from long ago?',
      mindsOnFr: 'Quelles choses spéciales votre famille fait ensemble? Quelles traditions viennent de loin?',
      action: 'Share family traditions, explore which are old/new, learn about traditional foods and celebrations',
      actionFr: 'Partager traditions familiales, explorer lesquelles anciennes/nouvelles, apprendre aliments traditionnels',
      consolidation: 'Create class tradition book, discuss why traditions are important, plan tradition sharing',
      consolidationFr: 'Créer livre traditions classe, discuter pourquoi traditions importantes, planifier partage',
      vocabularyFr: JSON.stringify(['tradition', 'célébration', 'nourriture']),
      indigenousPerspectives: 'Learn about Mi\'kmaq traditions like sweetgrass ceremonies, traditional foods, and seasonal celebrations that connect families to their ancestors and the land.',
      assessmentNotes: '☐ Shares family traditions respectfully ☐ Understands tradition connects past and present ☐ Appreciates cultural diversity',
      materials: JSON.stringify(['Tradition sharing template', 'Cultural artifacts if available', 'Tradition book materials', 'Food pictures or samples'])
    });

    lessons.push({
      title: 'Family Stories and Memory Keepers',
      titleFr: 'Histoires de famille et gardiens de mémoire',
      date: lessonDates[4],
      mindsOn: 'Who in your family tells the best stories? What family stories do you know by heart?',
      mindsOnFr: 'Qui dans votre famille raconte les meilleures histoires? Quelles histoires connaissez-vous par cœur?',
      action: 'Practice telling family stories, create memory boxes with special objects, learn about oral tradition',
      actionFr: 'Pratiquer raconter histoires famille, créer boîtes mémoire objets spéciaux, apprendre tradition orale',
      consolidation: 'Share family stories in circle, discuss why stories matter, become family story keepers',
      consolidationFr: 'Partager histoires famille en cercle, discuter pourquoi histoires importantes, devenir gardiens histoires',
      vocabularyFr: JSON.stringify(['histoire', 'mémoire', 'raconter']),
      indigenousPerspectives: 'Honor the Mi\'kmaq oral tradition where stories carry the history, values, and wisdom of the people. Learn how Indigenous families are responsible for keeping stories alive for future generations.',
      assessmentNotes: '☐ Tells family story clearly ☐ Listens respectfully to others\' stories ☐ Understands importance of preserving family memories',
      materials: JSON.stringify(['Story telling circle space', 'Memory box supplies', 'Family story template', 'Special objects for sharing'])
    });

    // LESSONS 6-10: SCHOOL THEN AND NOW
    lessons.push({
      title: 'Schools Long Ago - One Room Schoolhouses',
      titleFr: 'Écoles d\'autrefois - Écoles à une salle',
      date: lessonDates[5],
      mindsOn: 'Imagine all grades learning in one room with one teacher. How would that be different from our school?',
      mindsOnFr: 'Imaginez toutes les années apprenant dans une salle avec un enseignant. Comment serait-ce différent?',
      action: 'Explore one-room schoolhouse photos, compare old/new schools, role-play historical classroom',
      actionFr: 'Explorer photos écoles une salle, comparer écoles anciennes/nouvelles, jouer classe historique',
      consolidation: 'Create then/now school comparison chart, appreciate modern school features, thank school helpers',
      consolidationFr: 'Créer tableau comparaison école, apprécier caractéristiques école moderne, remercier aides école',
      vocabularyFr: JSON.stringify(['école', 'salle', 'enseignant']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq education where children learned from all community members, and knowledge was shared through practical experience and storytelling.',
      assessmentNotes: '☐ Compares old and new schools ☐ Understands how education has changed ☐ Appreciates current learning opportunities',
      materials: JSON.stringify(['Historical school photos', 'Comparison chart template', 'Role-play props (slate, chalk)', 'Modern school feature checklist'])
    });

    lessons.push({
      title: 'School Tools Then and Now',
      titleFr: 'Outils scolaires autrefois et maintenant',
      date: lessonDates[6],
      mindsOn: 'What tools do you use for learning? What did children use long ago before computers and markers?',
      mindsOnFr: 'Quels outils utilisez-vous pour apprendre? Qu\'utilisaient enfants avant ordinateurs et marqueurs?',
      action: 'Compare slate boards to whiteboards, quill pens to pencils, explore old school supplies',
      actionFr: 'Comparer ardoises aux tableaux blancs, plumes aux crayons, explorer anciennes fournitures scolaires',
      consolidation: 'Try writing with old tools, appreciate modern convenience, create school tool timeline',
      consolidationFr: 'Essayer écrire avec anciens outils, apprécier commodité moderne, créer chronologie outils école',
      vocabularyFr: JSON.stringify(['outils', 'ardoise', 'crayon']),
      indigenousPerspectives: 'Recognize that Mi\'kmaq children learned practical skills using natural materials and tools, and that learning happened through observation and hands-on practice.',
      assessmentNotes: '☐ Identifies differences in school tools ☐ Tries using historical tools safely ☐ Appreciates technological improvements',
      materials: JSON.stringify(['Slate boards and chalk', 'Quill pens and ink', 'Old textbooks or replicas', 'Modern school supplies for comparison'])
    });

    lessons.push({
      title: 'Children\'s School Day Long Ago',
      titleFr: 'Journée scolaire des enfants autrefois',
      date: lessonDates[7],
      mindsOn: 'What do you think a school day was like 100 years ago? What subjects did children learn?',
      mindsOnFr: 'Comment pensez-vous qu\'était une journée scolaire il y a 100 ans? Quelles matières apprenaient enfants?',
      action: 'Role-play historical school day, learn old-fashioned lessons, compare subjects then/now',
      actionFr: 'Jouer journée scolaire historique, apprendre leçons anciennes, comparer matières autrefois/maintenant',
      consolidation: 'Discuss what was harder/easier then, appreciate modern learning, plan school museum',
      consolidationFr: 'Discuter ce qui était plus dur/facile, apprécier apprentissage moderne, planifier musée école',
      vocabularyFr: JSON.stringify(['journée', 'leçon', 'matière']),
      indigenousPerspectives: 'Learn how Mi\'kmaq children\'s education included seasonal activities, learning from nature, and developing skills needed for community life.',
      assessmentNotes: '☐ Participates in historical role-play ☐ Compares past and present school experiences ☐ Shows curiosity about historical education',
      materials: JSON.stringify(['Historical lesson plans', 'Period-appropriate activities', 'School day schedule template', 'Dress-up clothes if available'])
    });

    lessons.push({
      title: 'School Buildings and Playgrounds Then and Now',
      titleFr: 'Bâtiments scolaires et cours de récréation autrefois et maintenant',
      date: lessonDates[8],
      mindsOn: 'Look at our school playground. What equipment do we have? What did children play with long ago?',
      mindsOnFr: 'Regardez notre cour d\'école. Quel équipement avons-nous? Avec quoi jouaient enfants autrefois?',
      action: 'Explore playground equipment evolution, learn old-fashioned games, compare school buildings',
      actionFr: 'Explorer évolution équipement cour, apprendre jeux anciens, comparer bâtiments scolaires',
      consolidation: 'Play historical games, appreciate safety improvements, design dream playground',
      consolidationFr: 'Jouer jeux historiques, apprécier améliorations sécurité, concevoir cour de rêve',
      vocabularyFr: JSON.stringify(['cour', 'jeux', 'bâtiment']),
      indigenousPerspectives: 'Explore traditional Mi\'kmaq games and activities that taught children important skills while having fun, often using natural materials.',
      assessmentNotes: '☐ Compares old and new playground equipment ☐ Learns historical games ☐ Understands how school facilities have improved',
      materials: JSON.stringify(['Historical playground photos', 'Traditional game instructions', 'Playground design materials', 'Simple historical game supplies'])
    });

    lessons.push({
      title: 'From Walking to School Buses',
      titleFr: 'De la marche aux autobus scolaires',
      date: lessonDates[9],
      mindsOn: 'How do you get to school? How do you think children got to school before school buses?',
      mindsOnFr: 'Comment venez-vous à l\'école? Comment pensez-vous que enfants venaient à école avant autobus?',
      action: 'Map routes to school, compare transportation methods, learn about school bus safety',
      actionFr: 'Tracer routes vers école, comparer méthodes transport, apprendre sécurité autobus scolaire',
      consolidation: 'Appreciate safe transportation, create transportation timeline, thank bus drivers',
      consolidationFr: 'Apprécier transport sécuritaire, créer chronologie transport, remercier chauffeurs autobus',
      vocabularyFr: JSON.stringify(['transport', 'autobus', 'marcher']),
      indigenousPerspectives: 'Acknowledge that Mi\'kmaq families moved seasonally and children learned while traveling, with the whole journey being part of their education.',
      assessmentNotes: '☐ Identifies different school transportation methods ☐ Understands safety improvements over time ☐ Shows appreciation for school transportation',
      materials: JSON.stringify(['Transportation pictures', 'Route mapping materials', 'School bus safety rules', 'Timeline template'])
    });

    // LESSONS 11-15: COMMUNITY CHANGES
    lessons.push({
      title: 'Old Buildings in Our Community',
      titleFr: 'Anciens bâtiments dans notre communauté',
      date: lessonDates[10],
      mindsOn: 'When you walk through town, which buildings look old? Which look new? How can you tell?',
      mindsOnFr: 'Quand vous marchez en ville, quels bâtiments semblent anciens? Nouveaux? Comment pouvez-vous dire?',
      action: 'Examine photos of community buildings, identify architectural clues about age, create building timeline',
      actionFr: 'Examiner photos bâtiments communautaires, identifier indices architecturaux âge, créer chronologie bâtiments',
      consolidation: 'Share building observations, discuss preservation vs development, plan community walk',
      consolidationFr: 'Partager observations bâtiments, discuter préservation vs développement, planifier promenade communautaire',
      vocabularyFr: JSON.stringify(['bâtiment', 'ancien', 'architecture']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq dwellings like wigwams that were designed to work with the natural environment and could be moved seasonally.',
      assessmentNotes: '☐ Identifies features of old and new buildings ☐ Makes observations about architectural changes ☐ Shows interest in community history',
      materials: JSON.stringify(['Community building photos', 'Building observation sheets', 'Timeline template', 'Magnifying glasses'])
    });

    lessons.push({
      title: 'How People Traveled Long Ago',
      titleFr: 'Comment les gens voyageaient autrefois',
      date: lessonDates[11],
      mindsOn: 'Before cars, how did people get around? How did they travel far distances?',
      mindsOnFr: 'Avant les voitures, comment les gens se déplaçaient? Comment voyageaient-ils loin?',
      action: 'Explore transportation evolution: walking, horses, carriages, trains, cars, planes',
      actionFr: 'Explorer évolution transport: marche, chevaux, calèches, trains, voitures, avions',
      consolidation: 'Create transportation timeline, discuss how travel changes communities, appreciate modern travel',
      consolidationFr: 'Créer chronologie transport, discuter comment voyage change communautés, apprécier voyage moderne',
      vocabularyFr: JSON.stringify(['voyager', 'cheval', 'voiture']),
      indigenousPerspectives: 'Learn about Mi\'kmaq use of canoes for water travel and snowshoes for winter travel, and how Indigenous peoples had sophisticated transportation networks.',
      assessmentNotes: '☐ Sequences transportation methods chronologically ☐ Understands how transportation evolved ☐ Connects transportation to community development',
      materials: JSON.stringify(['Transportation timeline materials', 'Pictures of historical vehicles', 'Model vehicles if available', 'Community map for travel routes'])
    });

    lessons.push({
      title: 'Stores and Shopping Changes',
      titleFr: 'Magasins et changements dans les achats',
      date: lessonDates[12],
      mindsOn: 'Where does your family shop? How do you think people got food and supplies long ago?',
      mindsOnFr: 'Où votre famille fait-elle ses achats? Comment pensez-vous que gens obtenaient nourriture autrefois?',
      action: 'Compare general stores to modern stores, explore different ways of buying things, role-play old store',
      actionFr: 'Comparer magasins généraux aux magasins modernes, explorer différentes façons acheter, jouer ancien magasin',
      consolidation: 'Discuss advantages of different shopping methods, appreciate convenience, thank store workers',
      consolidationFr: 'Discuter avantages différentes méthodes achats, apprécier commodité, remercier travailleurs magasin',
      vocabularyFr: JSON.stringify(['magasin', 'acheter', 'nourriture']),
      indigenousPerspectives: 'Learn about Mi\'kmaq trading networks and seasonal harvesting, where communities shared resources and traded with other nations.',
      assessmentNotes: '☐ Compares old and new shopping methods ☐ Understands how commerce has changed ☐ Appreciates modern conveniences',
      materials: JSON.stringify(['Historical store photos', 'Old-fashioned store props', 'Play money', 'Shopping comparison chart'])
    });

    lessons.push({
      title: 'Jobs and Work in the Past',
      titleFr: 'Emplois et travail dans le passé',
      date: lessonDates[13],
      mindsOn: 'What jobs do people in your family have? What jobs existed long ago that don\'t exist now?',
      mindsOnFr: 'Quels emplois ont les gens de votre famille? Quels emplois existaient autrefois qui n\'existent plus?',
      action: 'Explore historical jobs: blacksmith, miller, seamstress, farmer, compare to modern jobs',
      actionFr: 'Explorer emplois historiques: forgeron, meunier, couturière, fermier, comparer emplois modernes',
      consolidation: 'Role-play historical jobs, discuss how technology changes work, appreciate all workers',
      consolidationFr: 'Jouer emplois historiques, discuter comment technologie change travail, apprécier tous travailleurs',
      vocabularyFr: JSON.stringify(['emploi', 'travail', 'forgeron']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq roles and responsibilities where everyone in the community contributed their skills for the wellbeing of all.',
      assessmentNotes: '☐ Identifies historical and modern jobs ☐ Understands how work has changed ☐ Shows respect for all types of work',
      materials: JSON.stringify(['Historical job pictures', 'Job role-play props', 'Job comparison chart', 'Community worker thank you cards'])
    });

    lessons.push({
      title: 'Community Helpers Then and Now',
      titleFr: 'Aidants communautaires autrefois et maintenant',
      date: lessonDates[14],
      mindsOn: 'Who helps keep our community safe and running smoothly? How did communities help each other long ago?',
      mindsOnFr: 'Qui aide à garder notre communauté sûre et fonctionnelle? Comment communautés s\'aidaient autrefois?',
      action: 'Compare historical and modern community helpers, learn about volunteer firefighters vs professional',
      actionFr: 'Comparer aidants communautaires historiques et modernes, apprendre pompiers volontaires vs professionnels',
      consolidation: 'Thank community helpers, discuss how helping has changed and stayed same, plan helper appreciation',
      consolidationFr: 'Remercier aidants communautaires, discuter comment aide a changé et resté même, planifier appréciation',
      vocabularyFr: JSON.stringify(['aidant', 'communauté', 'pompier']),
      indigenousPerspectives: 'Explore Mi\'kmaq values of collective responsibility where everyone helped each other and community decisions were made together.',
      assessmentNotes: '☐ Compares past and present community helpers ☐ Understands evolution of community services ☐ Shows appreciation for community helpers',
      materials: JSON.stringify(['Community helper photos then/now', 'Thank you card materials', 'Helper comparison chart', 'Community service timeline'])
    });

    // LESSONS 16-20: TECHNOLOGY CHANGES
    lessons.push({
      title: 'Communication Then and Now',
      titleFr: 'Communication autrefois et maintenant',
      date: lessonDates[15],
      mindsOn: 'How do you talk to friends and family? How did people communicate before phones and computers?',
      mindsOnFr: 'Comment parlez-vous aux amis et famille? Comment gens communiquaient avant téléphones et ordinateurs?',
      action: 'Explore communication evolution: letters, telegraph, telephone, email, texting',
      actionFr: 'Explorer évolution communication: lettres, télégraphe, téléphone, courriel, textos',
      consolidation: 'Try old communication methods, appreciate instant communication, write letter to grandparent',
      consolidationFr: 'Essayer anciennes méthodes communication, apprécier communication instantanée, écrire lettre grand-parent',
      vocabularyFr: JSON.stringify(['communication', 'lettre', 'téléphone']),
      indigenousPerspectives: 'Learn about Mi\'kmaq communication through smoke signals, drums, and runners, and how Indigenous peoples had sophisticated communication networks.',
      assessmentNotes: '☐ Sequences communication methods chronologically ☐ Tries historical communication methods ☐ Appreciates communication improvements',
      materials: JSON.stringify(['Communication timeline materials', 'Letter writing supplies', 'Old telephone props if available', 'Communication method pictures'])
    });

    lessons.push({
      title: 'Toys and Games of the Past',
      titleFr: 'Jouets et jeux du passé',
      date: lessonDates[16],
      mindsOn: 'What are your favorite toys and games? What did children play with before video games and plastic toys?',
      mindsOnFr: 'Quels sont vos jouets et jeux favoris? Avec quoi jouaient enfants avant jeux vidéo et jouets plastique?',
      action: 'Explore historical toys: wooden blocks, dolls, hoops, marbles, compare to modern toys',
      actionFr: 'Explorer jouets historiques: blocs bois, poupées, cerceaux, billes, comparer jouets modernes',
      consolidation: 'Play historical games, make simple historical toy, appreciate creativity of past',
      consolidationFr: 'Jouer jeux historiques, fabriquer jouet historique simple, apprécier créativité du passé',
      vocabularyFr: JSON.stringify(['jouet', 'jeu', 'bois']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq toys and games that taught important skills like hand-eye coordination and teamwork while using natural materials.',
      assessmentNotes: '☐ Compares old and new toys ☐ Plays historical games successfully ☐ Appreciates creativity in toy-making',
      materials: JSON.stringify(['Historical toy replicas', 'Toy-making materials', 'Traditional game instructions', 'Toy timeline template'])
    });

    lessons.push({
      title: 'Homes and Daily Life Long Ago',
      titleFr: 'Maisons et vie quotidienne autrefois',
      date: lessonDates[17],
      mindsOn: 'How is your home different from homes 100 years ago? What didn\'t exist in houses then?',
      mindsOnFr: 'Comment votre maison est différente de maisons il y a 100 ans? Qu\'est-ce qui n\'existait pas alors?',
      action: 'Compare historical and modern homes, learn about life without electricity, explore daily chores',
      actionFr: 'Comparer maisons historiques et modernes, apprendre vie sans électricité, explorer corvées quotidiennes',
      consolidation: 'Try historical daily activities, appreciate modern conveniences, thank family for home',
      consolidationFr: 'Essayer activités quotidiennes historiques, apprécier commodités modernes, remercier famille pour maison',
      vocabularyFr: JSON.stringify(['maison', 'électricité', 'corvées']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq seasonal homes and how Indigenous families lived in harmony with the natural cycles and environment.',
      assessmentNotes: '☐ Identifies differences between past and present homes ☐ Understands impact of technology on daily life ☐ Appreciates modern home conveniences',
      materials: JSON.stringify(['Historical home photos', 'Daily life comparison chart', 'Historical chore props', 'Modern home appreciation activity'])
    });

    lessons.push({
      title: 'Food and Cooking Changes',
      titleFr: 'Changements dans la nourriture et la cuisine',
      date: lessonDates[18],
      mindsOn: 'Where does your food come from? How did families get and prepare food before refrigerators and stoves?',
      mindsOnFr: 'D\'où vient votre nourriture? Comment familles obtenaient et préparaient nourriture avant réfrigérateurs?',
      action: 'Explore food preservation methods, compare cooking then/now, learn about seasonal eating',
      actionFr: 'Explorer méthodes conservation nourriture, comparer cuisine autrefois/maintenant, apprendre manger saisonnier',
      consolidation: 'Try simple food preservation, appreciate food availability, thank farmers and cooks',
      consolidationFr: 'Essayer conservation simple nourriture, apprécier disponibilité nourriture, remercier fermiers et cuisiniers',
      vocabularyFr: JSON.stringify(['nourriture', 'cuisine', 'conservation']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq foods and preservation methods like smoking fish and drying berries, and the importance of seasonal harvesting.',
      assessmentNotes: '☐ Understands how food preparation has changed ☐ Appreciates modern food preservation ☐ Shows curiosity about traditional foods',
      materials: JSON.stringify(['Food preservation examples', 'Cooking method pictures', 'Seasonal food chart', 'Simple preservation activity supplies'])
    });

    lessons.push({
      title: 'Tools and Machines Then and Now',
      titleFr: 'Outils et machines autrefois et maintenant',
      date: lessonDates[19],
      mindsOn: 'What tools and machines help you and your family every day? What did people use before these existed?',
      mindsOnFr: 'Quels outils et machines aident vous et votre famille chaque jour? Qu\'utilisaient gens avant ceux-ci?',
      action: 'Compare hand tools to power tools, explore simple machines, understand technology progression',
      actionFr: 'Comparer outils manuels aux outils électriques, explorer machines simples, comprendre progression technologie',
      consolidation: 'Try using simple tools safely, appreciate technology progression, design future tool',
      consolidationFr: 'Essayer utiliser outils simples sécuritairement, apprécier progression technologie, concevoir outil futur',
      vocabularyFr: JSON.stringify(['outil', 'machine', 'technologie']),
      indigenousPerspectives: 'Learn about sophisticated Mi\'kmaq tools and technologies made from natural materials that were perfectly adapted to their purposes.',
      assessmentNotes: '☐ Compares simple and complex tools ☐ Understands technology progression ☐ Uses tools safely and appropriately',
      materials: JSON.stringify(['Historical and modern tool examples', 'Simple machine demonstrations', 'Tool timeline template', 'Future tool design materials'])
    });

    // LESSONS 21-25: PRESERVING HISTORY
    lessons.push({
      title: 'What is a Museum?',
      titleFr: 'Qu\'est-ce qu\'un musée?',
      date: lessonDates[20],
      mindsOn: 'Have you ever been to a museum? What did you see there? Why do people keep old things?',
      mindsOnFr: 'Avez-vous déjà été à un musée? Qu\'avez-vous vu? Pourquoi gens gardent-ils vieilles choses?',
      action: 'Explore museum purposes, learn about artifacts and preservation, plan class museum',
      actionFr: 'Explorer buts musées, apprendre artefacts et préservation, planifier musée classe',
      consolidation: 'Discuss why museums matter, start collecting class artifacts, assign museum roles',
      consolidationFr: 'Discuter pourquoi musées importants, commencer collectionner artefacts classe, assigner rôles musée',
      vocabularyFr: JSON.stringify(['musée', 'artefact', 'préservation']),
      indigenousPerspectives: 'Learn about Indigenous ways of preserving history through sacred objects, oral traditions, and ceremony, and the importance of caring for cultural heritage.',
      assessmentNotes: '☐ Understands museum purpose ☐ Shows care for historical objects ☐ Participates in museum planning',
      materials: JSON.stringify(['Museum photos and brochures', 'Artifact examples', 'Museum planning template', 'Class artifact collection bins'])
    });

    lessons.push({
      title: 'Artifacts Tell Stories',
      titleFr: 'Les artefacts racontent des histoires',
      date: lessonDates[21],
      mindsOn: 'Look at this old object. What do you think it was used for? What story might it tell?',
      mindsOnFr: 'Regardez cet objet ancien. À quoi pensez-vous qu\'il servait? Quelle histoire pourrait-il raconter?',
      action: 'Examine various artifacts, practice artifact detective work, create artifact story cards',
      actionFr: 'Examiner divers artefacts, pratiquer travail détective artefact, créer cartes histoire artefact',
      consolidation: 'Share artifact stories, discuss how objects preserve history, handle artifacts carefully',
      consolidationFr: 'Partager histoires artefacts, discuter comment objets préservent histoire, manipuler artefacts soigneusement',
      vocabularyFr: JSON.stringify(['artefact', 'histoire', 'détective']),
      indigenousPerspectives: 'Respect Indigenous artifacts as sacred objects that carry the stories and spirits of ancestors, requiring special care and cultural protocols.',
      assessmentNotes: '☐ Makes thoughtful observations about artifacts ☐ Creates plausible artifact stories ☐ Handles historical objects with care',
      materials: JSON.stringify(['Collection of artifacts or replicas', 'Magnifying glasses', 'Artifact observation sheets', 'Story card templates'])
    });

    lessons.push({
      title: 'Storytelling Preserves History',
      titleFr: 'Les contes préservent l\'histoire',
      date: lessonDates[22],
      mindsOn: 'What stories have been passed down in your family? How do stories help us remember the past?',
      mindsOnFr: 'Quelles histoires ont été transmises dans votre famille? Comment histoires nous aident rappeler passé?',
      action: 'Practice storytelling techniques, record family stories, learn about oral tradition importance',
      actionFr: 'Pratiquer techniques narration, enregistrer histoires famille, apprendre importance tradition orale',
      consolidation: 'Share recorded stories, discuss storytelling as history preservation, become story keepers',
      consolidationFr: 'Partager histoires enregistrées, discuter narration comme préservation histoire, devenir gardiens histoires',
      vocabularyFr: JSON.stringify(['conte', 'narration', 'tradition']),
      indigenousPerspectives: 'Honor the Mi\'kmaq oral tradition where stories carry history, laws, and teachings, and storytellers have the sacred responsibility of preserving culture.',
      assessmentNotes: '☐ Tells stories with expression and detail ☐ Understands storytelling as history preservation ☐ Shows respect for family and cultural stories',
      materials: JSON.stringify(['Recording device if available', 'Story prompt cards', 'Family story templates', 'Storytelling circle space'])
    });

    lessons.push({
      title: 'Creating Our Heritage Museum',
      titleFr: 'Créer notre musée du patrimoine',
      date: lessonDates[23],
      mindsOn: 'What should we include in our class museum? How can we show the past and present together?',
      mindsOnFr: 'Que devrions-nous inclure dans notre musée classe? Comment montrer passé et présent ensemble?',
      action: 'Organize artifacts by themes, create museum labels, design exhibits about past and present',
      actionFr: 'Organiser artefacts par thèmes, créer étiquettes musée, concevoir expositions passé et présent',
      consolidation: 'Set up museum displays, practice explaining exhibits, prepare for museum opening',
      consolidationFr: 'Installer affichages musée, pratiquer expliquer expositions, préparer ouverture musée',
      vocabularyFr: JSON.stringify(['musée', 'exposition', 'étiquette']),
      indigenousPerspectives: 'Include Indigenous perspectives on heritage and the continuous connection between past, present, and future generations in caring for cultural knowledge.',
      assessmentNotes: '☐ Contributes meaningfully to museum creation ☐ Organizes artifacts logically ☐ Explains exhibits clearly in French and English',
      materials: JSON.stringify(['Museum display materials', 'Label-making supplies', 'Artifact organization system', 'Exhibit design templates'])
    });

    lessons.push({
      title: 'Our Heritage Museum Grand Opening',
      titleFr: 'Grande ouverture de notre musée du patrimoine',
      date: lessonDates[24],
      mindsOn: 'How do you feel about sharing our learning with families? What do you want visitors to know?',
      mindsOnFr: 'Comment vous sentez-vous partager apprentissage avec familles? Que voulez-vous que visiteurs sachent?',
      action: 'Welcome families to museum, give guided tours, demonstrate past and present knowledge',
      actionFr: 'Accueillir familles au musée, donner visites guidées, démontrer connaissances passé et présent',
      consolidation: 'Reflect on learning journey, celebrate heritage preservation, plan future history learning',
      consolidationFr: 'Réfléchir parcours apprentissage, célébrer préservation patrimoine, planifier futur apprentissage histoire',
      vocabularyFr: JSON.stringify(['ouverture', 'visite', 'patrimoine']),
      indigenousPerspectives: 'Celebrate learning in the spirit of Indigenous sharing circles where knowledge is given as a gift to the whole community, strengthening everyone.',
      assessmentNotes: '☐ Shares learning confidently with families ☐ Uses French vocabulary appropriately ☐ Demonstrates understanding of past and present connections',
      materials: JSON.stringify(['Museum guest book', 'Welcome signs in French', 'Reflection journals', 'Heritage celebration materials'])
    });

    // Create all lesson plans in database
    console.log('💾 Creating Past and Present Social Studies lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: pastPresentUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // All lessons are 45 minutes (8 min mindsOn + 27 min action + 10 min consolidation)
          grade: 1,
          subject: 'Sciences humaines',
          language: 'fr',
          
          // Three-part lesson structure
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Learning goals
          learningGoals: `Students will explore changes over time in families, schools, communities, and technology while developing understanding of heritage preservation and the connections between past and present. French immersion vocabulary development.`,
          learningGoalsFr: `Les élèves exploreront les changements au fil du temps dans les familles, écoles, communautés et technologie tout en développant une compréhension de la préservation du patrimoine et des connexions entre passé et présent.`,
          
          materials: lessonData.materials,
          grouping: 'whole class discussion, partner activities, individual reflection, small group exploration, family sharing',
          
          // French vocabulary (2-3 terms as requested)
          vocabularyFr: lessonData.vocabularyFr,
          
          // Indigenous perspectives (100+ characters as requested)
          indigenousPerspectives: lessonData.indigenousPerspectives,
          
          // Assessment notes with checkboxes as requested
          assessmentNotes: lessonData.assessmentNotes,
          assessmentType: 'formative',
          
          // Differentiation strategies in JSON format as requested
          accommodations: JSON.stringify([
            'Visual supports with timeline and photo cards',
            'Extended processing time for comparisons',
            'Peer partnerships for sharing and support',
            'Alternative communication methods for sharing'
          ]),
          
          modifications: JSON.stringify([
            'Simplified past/present vocabulary',
            'Reduced written requirements for timelines',
            'Focus on participation over production',
            'Additional hands-on artifact exploration'
          ]),
          
          extensions: JSON.stringify([
            'Leadership roles in museum creation',
            'Extended family history research',
            'Teaching younger students about past/present',
            'Creating complex timelines and comparisons'
          ]),
          
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual timeline supports, concrete artifacts to handle, simplified vocabulary, peer storytelling partners, family support for heritage sharing',
            forIEP: 'Individual accommodations per IEP, alternative communication methods, modified timeline expectations, sensory artifact exploration opportunities',
            forELL: 'Bilingual family interviews encouraged, visual vocabulary supports, translation assistance, cultural heritage sharing in home language welcomed',
            forAdvanced: 'Extended family research projects, leadership in museum creation, complex timeline analysis, mentoring younger students in historical thinking'
          }),
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All artifacts and materials organized in labeled bins, visual timeline displayed, French vocabulary cards visible, family photo collection available, clear activity instructions with pictures, museum supplies accessible'
        }
      });
      
      lessonCount++;
      console.log(`✅ Created Lesson ${lessonCount}: ${lesson.titleFr}`);
    }
    
    // Link Social Studies curriculum expectations to lessons
    console.log('\n🔗 Linking curriculum expectations to lessons...');
    const socialStudiesExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences humaines',
        grade: 1
      }
    });
    
    console.log(`Found ${socialStudiesExpectations.length} Social Studies expectations`);
    
    // Get the created lessons
    const createdLessons = await prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: pastPresentUnit.id },
      orderBy: { date: 'asc' }
    });
    
    // Link expectations across all lessons
    for (let i = 0; i < createdLessons.length; i++) {
      // Cycle through expectations so each lesson gets 1-2 expectations
      const expectationIndex = i % socialStudiesExpectations.length;
      const expectation = socialStudiesExpectations[expectationIndex];
      
      await prisma.eTFOLessonPlanExpectation.create({
        data: {
          lessonPlanId: createdLessons[i].id,
          expectationId: expectation.id
        }
      });
      
      // Add a second expectation for some lessons
      if (i < socialStudiesExpectations.length && socialStudiesExpectations[(i + 3) % socialStudiesExpectations.length]) {
        const secondExpectation = socialStudiesExpectations[(i + 3) % socialStudiesExpectations.length];
        if (secondExpectation.id !== expectation.id) {
          await prisma.eTFOLessonPlanExpectation.create({
            data: {
              lessonPlanId: createdLessons[i].id,
              expectationId: secondExpectation.id
            }
          });
        }
      }
    }
    
    // Link expectations to the unit plan
    for (const expectation of socialStudiesExpectations) {
      await prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: pastPresentUnit.id,
          expectationId: expectation.id
        }
      });
    }
    
    console.log('\n🕰️ SOCIAL STUDIES "PAST AND PRESENT" LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive Social Studies lesson plans`);
    console.log('✅ 8 weeks of instruction (Feb 1 - Mar 28, 2025)');
    console.log('✅ 45-minute lessons: mindsOn (8) + action (27) + consolidation (10)');
    console.log('✅ Themes: Family History → School Then/Now → Community Changes → Technology → Heritage');
    console.log('✅ Complete unit plan: "Past and Present/Passé et présent"');
    console.log('✅ French immersion vocabulary (2-3 terms per lesson)');
    console.log('✅ Indigenous perspectives (100+ characters each)');
    console.log('✅ JSON differentiation (forStruggling, forIEP, forELL, forAdvanced)');
    console.log('✅ Assessment notes with checkboxes');
    console.log('✅ Materials: old photos, artifacts, timeline materials');
    console.log('✅ Focus: change over time, continuity, heritage preservation');
    console.log('✅ Local PEI history emphasis throughout');
    console.log(`✅ All ${socialStudiesExpectations.length} Grade 1 Social Studies expectations linked`);
    console.log('\n🎉 Emily\'s students ready to explore "Past and Present" in French!');
    
  } catch (error) {
    console.error('❌ Error creating Past and Present lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
createPastPresentSocialStudiesLessons()
  .then(() => console.log('\n🏆 Past and Present lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });