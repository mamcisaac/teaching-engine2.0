#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEISocialStudiesLessonPlans() {
  console.log('🏝️ Creating Social Studies "Our Province PEI/Notre province l\'Î.-P.-É." 25 Lesson Plans...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Check if PEI Social Studies unit plan exists, if not create it
    let peiUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre province l\'Î.-P.-É.'
      }
    });
    
    if (!peiUnit) {
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
      peiUnit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: socialStudiesLRP.id,
          title: 'Our Province PEI',
          titleFr: 'Notre province l\'Î.-P.-É.',
          description: 'Students explore Prince Edward Island, learning about its geography, culture, Mi\'kmaq heritage, and what makes PEI special as their island home.',
          descriptionFr: 'Les élèves explorent l\'Île-du-Prince-Édouard, apprenant sur sa géographie, culture, héritage Mi\'kmaq, et ce qui rend l\'Î.-P.-É. spéciale comme leur maison insulaire.',
          bigIdeas: 'Prince Edward Island is a unique province with rich geography, diverse culture, and proud heritage that shapes Islander identity and community.',
          bigIdeasFr: 'L\'Île-du-Prince-Édouard est une province unique avec une géographie riche, une culture diverse et un héritage fier qui façonne l\'identité insulaire et communautaire.',
          startDate: new Date('2025-01-06'),
          endDate: new Date('2025-02-21'),
          estimatedHours: 25, // 25 lessons × 45 minutes each
          assessmentPlan: 'Observations, mapping activities, PEI symbol creation, geography explorations, cultural presentations, Islander identity portfolios',
          indigenousPerspectives: 'Honor Mi\'kmaq heritage as the original inhabitants of Epekwitk (PEI), exploring traditional knowledge of the land, seasonal living, and continuing cultural contributions to Island life.',
          communityConnections: 'Local Mi\'kmaq cultural center visits, Islander guest speakers, PEI museum virtual tours, local farmer interviews, Island artist presentations',
          crossCurricularConnections: 'French vocabulary development, map skills (math), Islander songs (music), PEI landscape art (arts), healthy Island foods (health)',
          culminatingTask: 'Create an "Islander Pride Portfolio" showcasing PEI geography, culture, and personal connections with bilingual reflections and artistic representations',
          keyVocabulary: JSON.stringify([
            { en: 'province', fr: 'province' },
            { en: 'island', fr: 'île' },
            { en: 'Prince Edward Island', fr: 'Île-du-Prince-Édouard' },
            { en: 'Mi\'kmaq', fr: 'Mi\'kmaq' },
            { en: 'Epekwitk', fr: 'Epekwitk' },
            { en: 'Islander', fr: 'Insulaire' },
            { en: 'beach', fr: 'plage' },
            { en: 'potato', fr: 'pomme de terre' },
            { en: 'farm', fr: 'ferme' },
            { en: 'fishing', fr: 'pêche' },
            { en: 'red soil', fr: 'terre rouge' },
            { en: 'county', fr: 'comté' },
            { en: 'bridge', fr: 'pont' },
            { en: 'lighthouse', fr: 'phare' },
            { en: 'mussel', fr: 'moule' },
            { en: 'lobster', fr: 'homard' },
            { en: 'festival', fr: 'festival' },
            { en: 'culture', fr: 'culture' },
            { en: 'heritage', fr: 'patrimoine' },
            { en: 'flag', fr: 'drapeau' }
          ]),
          essentialQuestions: JSON.stringify([
            'What makes Prince Edward Island special?',
            'How does being an island shape how we live?',
            'What is the Mi\'kmaq heritage of Epekwitk?',
            'How do PEI\'s geography and culture connect?',
            'What does it mean to be an Islander?'
          ]),
          learningSkills: JSON.stringify([
            'Geographic thinking and mapping',
            'Cultural awareness and respect',
            'Provincial identity and pride',
            'Communication in French and English',
            'Critical thinking about place and community'
          ]),
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual PEI maps and photos, simplified vocabulary, hands-on geography activities, peer partnerships, extra processing time',
            forIEP: 'Individual accommodations as per IEP, modified expectations, alternative communication methods, flexible participation',
            forELL: 'Visual vocabulary supports, bilingual resources, sentence starters, peer translation assistance, cultural connections',
            forAdvanced: 'Extended research projects, leadership in presentations, detailed mapping activities, cross-curricular connections'
          }),
          performanceTask: JSON.stringify({
            title: 'Islander Pride Portfolio',
            description: 'Students create a comprehensive portfolio showcasing their learning about PEI geography, culture, heritage, and personal Islander identity',
            criteria: ['Accurate PEI geography knowledge', 'Respectful understanding of Mi\'kmaq heritage', 'Use of French vocabulary', 'Personal Islander connections', 'Creative presentation of learning']
          })
        }
      });
      
      console.log(`✅ Created unit plan: ${peiUnit.titleFr} (ID: ${peiUnit.id})`);
    } else {
      console.log(`✅ Found existing unit plan: ${peiUnit.titleFr} (ID: ${peiUnit.id})`);
    }
    
    console.log(`📅 Duration: January 6 - February 21, 2025 (25 lessons)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: peiUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 25 lesson plans across 5 themed weeks
    const lessons = [];
    
    // Helper function to create lesson dates (5 lessons per week, Mon-Fri)
    const getWeekDays = (weekStart: string) => {
      const start = new Date(weekStart);
      return [
        new Date(start), // Monday
        new Date(start.getTime() + 24 * 60 * 60 * 1000), // Tuesday
        new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000), // Wednesday
        new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000), // Thursday
        new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000), // Friday
      ];
    };
    
    // WEEK 1: Introduction to PEI (January 6-10, 2025)
    const week1Days = getWeekDays('2025-01-06');
    
    lessons.push({
      title: 'Welcome to Prince Edward Island',
      titleFr: 'Bienvenue à l\'Île-du-Prince-Édouard',
      date: week1Days[0],
      mindsOn: 'Share what you know about where we live. What makes our home special? Look at PEI shape on the map.',
      mindsOnFr: 'Partager ce que vous savez sur où nous vivons. Qu\'est-ce qui rend notre maison spéciale? Regardez forme Î.-P.-É. sur carte.',
      action: 'Explore large PEI map, identify our island shape, learn PEI is a province, locate PEI in Canada, trace island outline',
      actionFr: 'Explorer grande carte Î.-P.-É., identifier forme île, apprendre Î.-P.-É. est province, localiser en Canada, tracer contour',
      consolidation: 'Share PEI tracings, begin class "PEI Facts" chart, practice saying "Île-du-Prince-Édouard"',
      consolidationFr: 'Partager tracés Î.-P.-É., commencer tableau "Faits Î.-P.-É." classe, pratiquer dire nom complet',
      vocabularyFr: JSON.stringify(['province', 'île', 'Canada']),
      indigenousPerspectives: 'Acknowledge that we live on Epekwitk, the traditional territory of the Mi\'kmaq people who have cared for this island for thousands of years before European settlers arrived.',
      assessmentNotes: '☐ Recognizes PEI island shape ☐ Locates PEI in Canada ☐ Uses basic French vocabulary for province/island',
      materials: JSON.stringify(['Large PEI and Canada maps', 'PEI outline tracings', 'Provincial facts chart', 'French vocabulary cards'])
    });
    
    lessons.push({
      title: 'Our Island Home Shape',
      titleFr: 'La forme de notre maison insulaire',
      date: week1Days[1],
      mindsOn: 'What does PEI look like from above? What shape do you see? Show the shape with your hands.',
      mindsOnFr: 'À quoi ressemble Î.-P.-É. d\'en haut? Quelle forme voyez-vous? Montrez forme avec vos mains.',
      action: 'Compare PEI to familiar shapes, create PEI puzzles, measure island length and width on maps, discuss "crescent" shape',
      actionFr: 'Comparer Î.-P.-É. à formes familières, créer casse-têtes, mesurer longueur largeur sur cartes, discuter forme croissant',
      consolidation: 'Share shape comparisons, complete PEI puzzles together, add shape facts to class chart',
      consolidationFr: 'Partager comparaisons formes, compléter casse-têtes ensemble, ajouter faits forme au tableau classe',
      vocabularyFr: JSON.stringify(['forme', 'croissant', 'long']),
      indigenousPerspectives: 'Learn that Mi\'kmaq peoples knew this island\'s shape intimately, traveling its shores in birchbark canoes and understanding every bay and inlet as part of their homeland.',
      assessmentNotes: '☐ Describes PEI shape accurately ☐ Compares to familiar objects ☐ Shows spatial understanding of island',
      materials: JSON.stringify(['PEI shape puzzles', 'Various shape cards', 'Measuring tools', 'Aerial photos of PEI'])
    });
    
    lessons.push({
      title: 'PEI Provincial Symbols',
      titleFr: 'Symboles provinciaux de l\'Î.-P.-É.',
      date: week1Days[2],
      mindsOn: 'What symbols represent our province? What pictures show PEI? What makes something a symbol?',
      mindsOnFr: 'Quels symboles représentent notre province? Quelles images montrent Î.-P.-É.? Qu\'est-ce qui fait un symbole?',
      action: 'Explore PEI symbols (lady\'s slipper, red oak, blue jay), create symbol cards, learn what each represents',
      actionFr: 'Explorer symboles Î.-P.-É. (sabot de Vénus, chêne rouge, geai bleu), créer cartes symboles, apprendre ce que chaque représente',
      consolidation: 'Match symbols to meanings, discuss why these represent PEI, plan symbol hunt around school',
      consolidationFr: 'Associer symboles aux significations, discuter pourquoi représentent Î.-P.-É., planifier chasse symboles école',
      vocabularyFr: JSON.stringify(['symbole', 'fleur', 'oiseau']),
      indigenousPerspectives: 'Recognize that Mi\'kmaq peoples have their own symbols and meanings for the plants and animals of Epekwitk, with deep spiritual and practical knowledge passed down through generations.',
      assessmentNotes: '☐ Identifies PEI provincial symbols ☐ Explains what symbols represent ☐ Shows understanding of symbols as representations',
      materials: JSON.stringify(['Provincial symbol cards', 'Real or images of lady\'s slipper, red oak, blue jay', 'Symbol matching game', 'Art materials'])
    });
    
    lessons.push({
      title: 'The PEI Provincial Flag',
      titleFr: 'Le drapeau provincial de l\'Î.-P.-É.',
      date: week1Days[3],
      mindsOn: 'What do you notice about the PEI flag? What colors and pictures do you see? How is it different from Canada\'s flag?',
      mindsOnFr: 'Que remarquez-vous sur drapeau Î.-P.-É.? Quelles couleurs et images voyez-vous? Comment différent du drapeau Canada?',
      action: 'Examine PEI flag details, learn about red lion, oak tree, and small trees, compare to other flags, create flag art',
      actionFr: 'Examiner détails drapeau Î.-P.-É., apprendre lion rouge, chêne et petits arbres, comparer autres drapeaux, créer art drapeau',
      consolidation: 'Share flag artwork, practice describing flag in French, discuss flag respect and display',
      consolidationFr: 'Partager œuvres drapeau, pratiquer décrire drapeau en français, discuter respect et affichage drapeau',
      vocabularyFr: JSON.stringify(['drapeau', 'rouge', 'lion']),
      indigenousPerspectives: 'Understand that before colonial flags, Mi\'kmaq peoples had their own symbols and ways of representing their nation and connection to Epekwitk through traditional arts and ceremonies.',
      assessmentNotes: '☐ Describes PEI flag elements ☐ Shows respect for provincial symbols ☐ Compares flags appropriately',
      materials: JSON.stringify(['PEI provincial flag', 'Other provincial and national flags', 'Flag coloring templates', 'Art supplies'])
    });
    
    lessons.push({
      title: 'PEI Location and Neighbors',
      titleFr: 'Emplacement et voisins de l\'Î.-P.-É.',
      date: week1Days[4],
      mindsOn: 'Where is PEI compared to other provinces? What provinces are our neighbors? How do we travel to other places?',
      mindsOnFr: 'Où est Î.-P.-É. comparé aux autres provinces? Quelles provinces sont nos voisines? Comment voyageons-nous ailleurs?',
      action: 'Locate PEI on Canada map, identify neighboring provinces (NB, NS), learn about Confederation Bridge, discuss island isolation',
      actionFr: 'Localiser Î.-P.-É. sur carte Canada, identifier provinces voisines, apprendre pont Confédération, discuter isolement île',
      consolidation: 'Create "PEI and Friends" map, share travel experiences, discuss what makes islands special',
      consolidationFr: 'Créer carte "Î.-P.-É. et amis", partager expériences voyage, discuter ce qui rend îles spéciales',
      vocabularyFr: JSON.stringify(['voisin', 'pont', 'voyage']),
      indigenousPerspectives: 'Learn how Mi\'kmaq peoples traveled between Epekwitk and the mainland, understanding seasonal movements and trade relationships with other Indigenous nations across the Maritimes.',
      assessmentNotes: '☐ Locates PEI relative to other provinces ☐ Understands island geography ☐ Identifies transportation connections',
      materials: JSON.stringify(['Canada map with provinces', 'Confederation Bridge photos', 'Travel method pictures', 'Compass for directions'])
    });
    
    // WEEK 2: PEI Geography (January 13-17, 2025)
    const week2Days = getWeekDays('2025-01-13');
    
    lessons.push({
      title: 'PEI\'s Beautiful Beaches',
      titleFr: 'Les belles plages de l\'Î.-P.-É.',
      date: week2Days[0],
      mindsOn: 'What do you love about PEI beaches? What do you see, hear, and feel at the beach? What makes our beaches special?',
      mindsOnFr: 'Qu\'aimez-vous des plages Î.-P.-É.? Que voyez-vous, entendez-vous, ressentez-vous? Qu\'est-ce qui rend nos plages spéciales?',
      action: 'Explore PEI beach photos, learn about different types of beaches (sand, rock, cliff), create beach sensory chart, discuss beach safety',
      actionFr: 'Explorer photos plages Î.-P.-É., apprendre types plages (sable, roche, falaise), créer tableau sensoriel plage, discuter sécurité',
      consolidation: 'Share favorite beach memories, create class beach safety rules, plan virtual beach exploration',
      consolidationFr: 'Partager souvenirs plages favoris, créer règles sécurité plage classe, planifier exploration plage virtuelle',
      vocabularyFr: JSON.stringify(['plage', 'sable', 'eau']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional knowledge of coastal areas, including seasonal fishing, gathering of medicines and foods from the shore, and understanding of tides and weather patterns.',
      assessmentNotes: '☐ Describes PEI beach features ☐ Identifies different beach types ☐ Understands beach safety',
      materials: JSON.stringify(['PEI beach photo collection', 'Beach safety rule chart', 'Sensory description words', 'Sand and shells for exploration'])
    });
    
    lessons.push({
      title: 'Famous Red Soil of PEI',
      titleFr: 'La terre rouge célèbre de l\'Î.-P.-É.',
      date: week2Days[1],
      mindsOn: 'What color is PEI soil? Why do you think it\'s red? Have you seen red soil in other places?',
      mindsOnFr: 'Quelle couleur est sol Î.-P.-É.? Pourquoi pensez-vous qu\'il est rouge? Avez-vous vu terre rouge ailleurs?',
      action: 'Examine red soil samples, learn why soil is red (iron oxide), compare to other soil colors, create soil color chart',
      actionFr: 'Examiner échantillons terre rouge, apprendre pourquoi rouge (oxyde fer), comparer autres couleurs sol, créer tableau couleurs',
      consolidation: 'Mix red soil colors with paint, discuss how red soil helps farms, appreciate unique PEI feature',
      consolidationFr: 'Mélanger couleurs terre rouge avec peinture, discuter comment terre rouge aide fermes, apprécier caractéristique unique',
      vocabularyFr: JSON.stringify(['terre', 'rouge', 'sol']),
      indigenousPerspectives: 'Learn about Mi\'kmaq understanding of the land, including traditional knowledge of which soils are best for growing traditional plants and how to care for the earth sustainably.',
      assessmentNotes: '☐ Recognizes PEI red soil ☐ Explains why soil is red ☐ Connects soil to agriculture',
      materials: JSON.stringify(['Red soil samples', 'Other soil samples for comparison', 'Magnifying glasses', 'Red paint colors'])
    });
    
    lessons.push({
      title: 'PEI Farms and Agriculture',
      titleFr: 'Fermes et agriculture de l\'Î.-P.-É.',
      date: week2Days[2],
      mindsOn: 'What grows on PEI farms? What do you know about potatoes? What other foods come from PEI?',
      mindsOnFr: 'Qu\'est-ce qui pousse sur fermes Î.-P.-É.? Que savez-vous sur pommes de terre? Quels autres aliments viennent Î.-P.-É.?',
      action: 'Learn about PEI farming (potatoes, carrots, grain), explore farm equipment, discuss how farms feed people, sort PEI vs. other foods',
      actionFr: 'Apprendre agriculture Î.-P.-É. (pommes terre, carottes, grain), explorer équipement ferme, discuter comment fermes nourrissent gens',
      consolidation: 'Create PEI farm map, taste PEI foods, appreciate farmers\' work, plan farmer interview questions',
      consolidationFr: 'Créer carte fermes Î.-P.-É., goûter aliments Î.-P.-É., apprécier travail fermiers, planifier questions entrevue fermier',
      vocabularyFr: JSON.stringify(['ferme', 'pomme de terre', 'fermier']),
      indigenousPerspectives: 'Recognize that Mi\'kmaq peoples have been cultivating and harvesting from this land for thousands of years, including traditional Three Sisters agriculture and seasonal food gathering.',
      assessmentNotes: '☐ Identifies PEI agricultural products ☐ Understands importance of farming ☐ Connects food to local sources',
      materials: JSON.stringify(['PEI farm photos', 'Sample PEI foods (potatoes, carrots)', 'Farm equipment pictures', 'PEI farm map'])
    });
    
    lessons.push({
      title: 'The Three Counties of PEI',
      titleFr: 'Les trois comtés de l\'Î.-P.-É.',
      date: week2Days[3],
      mindsOn: 'How is PEI divided into parts? What county do we live in? What makes each county special?',
      mindsOnFr: 'Comment Î.-P.-É. est divisée en parties? Dans quel comté vivons-nous? Qu\'est-ce qui rend chaque comté spécial?',
      action: 'Learn three counties (Kings, Queens, Prince), locate our county, identify county features and cities, create county fact sheets',
      actionFr: 'Apprendre trois comtés, localiser notre comté, identifier caractéristiques comtés et villes, créer fiches comté',
      consolidation: 'Present county fact sheets, discuss county differences, plan virtual tours of each county',
      consolidationFr: 'Présenter fiches comté, discuter différences comtés, planifier visites virtuelles chaque comté',
      vocabularyFr: JSON.stringify(['comté', 'est', 'ouest']),
      indigenousPerspectives: 'Understand that Mi\'kmaq peoples organized their territory differently, with seasonal camps and traditional territories that crossed what are now county boundaries, based on natural features and resources.',
      assessmentNotes: '☐ Names three PEI counties ☐ Locates home county ☐ Identifies county characteristics',
      materials: JSON.stringify(['PEI county map', 'County fact cards', 'Pictures from each county', 'Our county location markers'])
    });
    
    lessons.push({
      title: 'Rivers and Waterways of PEI',
      titleFr: 'Rivières et voies navigables de l\'Î.-P.-É.',
      date: week2Days[4],
      mindsOn: 'What rivers do you know in PEI? Where does our water come from? How do rivers help the island?',
      mindsOnFr: 'Quelles rivières connaissez-vous Î.-P.-É.? D\'où vient notre eau? Comment rivières aident l\'île?',
      action: 'Explore PEI river map, learn major rivers (Hillsborough, Brudenell, Dunk), discuss water cycle, trace water flow',
      actionFr: 'Explorer carte rivières Î.-P.-É., apprendre rivières principales, discuter cycle eau, tracer écoulement eau',
      consolidation: 'Create water cycle diagram, discuss protecting PEI water, appreciate clean water access',
      consolidationFr: 'Créer diagramme cycle eau, discuter protéger eau Î.-P.-É., apprécier accès eau propre',
      vocabularyFr: JSON.stringify(['rivière', 'eau', 'propre']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional knowledge of waterways as highways for travel and trade, and the sacred importance of keeping waters clean for all living beings, including understanding of seasonal fishing and water ceremonies.',
      assessmentNotes: '☐ Identifies major PEI rivers ☐ Understands water cycle basics ☐ Shows appreciation for clean water',
      materials: JSON.stringify(['PEI river map', 'Water cycle diagram materials', 'Clean water samples', 'River photos'])
    });
    
    // WEEK 3: Island Life (January 20-24, 2025)
    const week3Days = getWeekDays('2025-01-20');
    
    lessons.push({
      title: 'PEI Fishing Industry',
      titleFr: 'Industrie de la pêche à l\'Î.-P.-É.',
      date: week3Days[0],
      mindsOn: 'What do PEI fishers catch? Have you seen fishing boats? What do you know about lobster and mussels?',
      mindsOnFr: 'Qu\'est-ce que pêcheurs Î.-P.-É. attrapent? Avez-vous vu bateaux pêche? Que savez-vous homards et moules?',
      action: 'Learn about PEI seafood (lobster, mussels, oysters, fish), explore fishing equipment, discuss fishing seasons, role-play fishing',
      actionFr: 'Apprendre fruits mer Î.-P.-É. (homard, moules, huîtres, poisson), explorer équipement pêche, discuter saisons, jouer pêche',
      consolidation: 'Sort seafood pictures, discuss fishing safety, appreciate fishers\' hard work, plan seafood tasting',
      consolidationFr: 'Trier images fruits mer, discuter sécurité pêche, apprécier travail dur pêcheurs, planifier dégustation',
      vocabularyFr: JSON.stringify(['pêche', 'homard', 'moule']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional fishing knowledge, including sustainable harvesting practices, seasonal fishing traditions, and the spiritual connection between people and sea creatures that continues today.',
      assessmentNotes: '☐ Identifies PEI seafood ☐ Understands fishing as island industry ☐ Shows respect for fishers',
      materials: JSON.stringify(['PEI seafood pictures', 'Toy fishing equipment', 'Fishing boat images', 'Seafood identification cards'])
    });
    
    lessons.push({
      title: 'Tourism and Visitors to PEI',
      titleFr: 'Tourisme et visiteurs à l\'Î.-P.-É.',
      date: week3Days[1],
      mindsOn: 'Why do people visit PEI? What do tourists like to see and do here? Have you been a tourist somewhere?',
      mindsOnFr: 'Pourquoi gens visitent Î.-P.-É.? Qu\'est-ce que touristes aiment voir et faire ici? Avez-vous été touriste quelque part?',
      action: 'Explore PEI tourist attractions, learn why people visit (beaches, Anne of Green Gables, food), create tourist brochure',
      actionFr: 'Explorer attractions touristiques Î.-P.-É., apprendre pourquoi visitent (plages, Anne aux Pignons Verts, nourriture), créer brochure',
      consolidation: 'Share tourist brochures, role-play welcoming visitors, discuss being good hosts',
      consolidationFr: 'Partager brochures touristiques, jouer accueillir visiteurs, discuter être bons hôtes',
      vocabularyFr: JSON.stringify(['tourisme', 'visiteur', 'attraction']),
      indigenousPerspectives: 'Acknowledge that Mi\'kmaq peoples have always welcomed visitors with traditional hospitality, and recognize the importance of sharing cultural knowledge respectfully with tourists who visit Epekwitk.',
      assessmentNotes: '☐ Identifies PEI tourist attractions ☐ Understands tourism importance ☐ Shows welcoming attitude',
      materials: JSON.stringify(['PEI tourism brochures', 'Tourist attraction photos', 'Brochure-making supplies', 'Welcome signs'])
    });
    
    lessons.push({
      title: 'Anne of Green Gables and PEI',
      titleFr: 'Anne aux Pignons Verts et l\'Î.-P.-É.',
      date: week3Days[2],
      mindsOn: 'Who is Anne of Green Gables? What do you know about this famous PEI character? Why is she important to our island?',
      mindsOnFr: 'Qui est Anne aux Pignons Verts? Que savez-vous ce personnage célèbre Î.-P.-É.? Pourquoi importante pour notre île?',
      action: 'Learn about Anne as PEI\'s famous character, explore Green Gables locations, discuss how stories make places famous',
      actionFr: 'Apprendre Anne comme personnage célèbre Î.-P.-É., explorer lieux Pignons Verts, discuter comment histoires rendent endroits célèbres',
      consolidation: 'Share favorite story characters, discuss how Anne represents PEI spirit, create Anne-inspired artwork',
      consolidationFr: 'Partager personnages histoires favoris, discuter comment Anne représente esprit Î.-P.-É., créer art inspiré Anne',
      vocabularyFr: JSON.stringify(['histoire', 'personnage', 'célèbre']),
      indigenousPerspectives: 'While appreciating Anne\'s story, recognize that this land has much older stories from Mi\'kmaq oral traditions that have been shared for thousands of years about Epekwitk and its people.',
      assessmentNotes: '☐ Knows Anne of Green Gables connection to PEI ☐ Understands stories can make places famous ☐ Appreciates PEI literature',
      materials: JSON.stringify(['Anne of Green Gables book/pictures', 'Green Gables location photos', 'Story character cards', 'Art supplies'])
    });
    
    lessons.push({
      title: 'Island Transportation and Getting Around',
      titleFr: 'Transport insulaire et se déplacer',
      date: week3Days[3],
      mindsOn: 'How do we travel around PEI? How do we get to and from the island? What makes island transportation different?',
      mindsOnFr: 'Comment voyageons-nous autour Î.-P.-É.? Comment arrivons et partons île? Qu\'est-ce qui rend transport insulaire différent?',
      action: 'Explore PEI transportation (cars, bikes, ferries, planes), learn about Confederation Bridge and ferries, discuss island challenges',
      actionFr: 'Explorer transport Î.-P.-É. (autos, vélos, traversiers, avions), apprendre pont Confédération et traversiers, discuter défis île',
      consolidation: 'Create transportation map of PEI, discuss transportation choices, appreciate transportation workers',
      consolidationFr: 'Créer carte transport Î.-P.-É., discuter choix transport, apprécier travailleurs transport',
      vocabularyFr: JSON.stringify(['transport', 'traversier', 'voiture']),
      indigenousPerspectives: 'Learn about traditional Mi\'kmaq transportation including canoes, seasonal travel patterns, and traditional trails across Epekwitk that connected communities and resources.',
      assessmentNotes: '☐ Identifies PEI transportation methods ☐ Understands island transportation challenges ☐ Appreciates transportation connections',
      materials: JSON.stringify(['Transportation pictures', 'PEI road map', 'Confederation Bridge photos', 'Toy vehicles'])
    });
    
    lessons.push({
      title: 'Working and Living on the Island',
      titleFr: 'Travailler et vivre sur l\'île',
      date: week3Days[4],
      mindsOn: 'What jobs do people have on PEI? How is living on an island different? What do you like about island life?',
      mindsOnFr: 'Quels emplois gens ont Î.-P.-É.? Comment vivre sur île différent? Qu\'aimez-vous vie insulaire?',
      action: 'Explore PEI jobs (farming, fishing, tourism, government), discuss island lifestyle, compare to mainland living',
      actionFr: 'Explorer emplois Î.-P.-É. (agriculture, pêche, tourisme, gouvernement), discuter style vie île, comparer vie continent',
      consolidation: 'Create "Islander Jobs" display, share what we love about island life, interview family about island living',
      consolidationFr: 'Créer affichage "Emplois Insulaires", partager ce qu\'on aime vie île, interviewer famille sur vie insulaire',
      vocabularyFr: JSON.stringify(['emploi', 'travail', 'vivre']),
      indigenousPerspectives: 'Recognize that Mi\'kmaq peoples have lived sustainably on Epekwitk for thousands of years, with traditional ways of life that honored seasonal cycles and community cooperation.',
      assessmentNotes: '☐ Identifies island jobs ☐ Understands island lifestyle ☐ Appreciates island living benefits',
      materials: JSON.stringify(['PEI job pictures', 'Island lifestyle photos', 'Interview question cards', 'Comparison charts'])
    });
    
    // WEEK 4: PEI Culture (January 27-31, 2025)
    const week4Days = getWeekDays('2025-01-27');
    
    lessons.push({
      title: 'Mi\'kmaq Heritage of Epekwitk',
      titleFr: 'Patrimoine Mi\'kmaq d\'Epekwitk',
      date: week4Days[0],
      mindsOn: 'Who lived on this island before anyone else? What do you know about Mi\'kmaq people? What does Epekwitk mean?',
      mindsOnFr: 'Qui vivait sur cette île avant tous les autres? Que savez-vous gens Mi\'kmaq? Que signifie Epekwitk?',
      action: 'Learn Epekwitk means "land cradled by the waves," explore Mi\'kmaq traditional life, learn about respect for the land',
      actionFr: 'Apprendre Epekwitk signifie "terre bercée par vagues," explorer vie traditionnelle Mi\'kmaq, apprendre respect terre',
      consolidation: 'Create land acknowledgment, practice saying Epekwitk, discuss continuing Mi\'kmaq presence and culture',
      consolidationFr: 'Créer reconnaissance territoire, pratiquer dire Epekwitk, discuter présence et culture Mi\'kmaq continue',
      vocabularyFr: JSON.stringify(['Mi\'kmaq', 'Epekwitk', 'patrimoine']),
      indigenousPerspectives: 'Honor the Mi\'kmaq as the original inhabitants of Epekwitk, acknowledging their continuing presence, culture, and contributions to Island life. Learn about traditional ecological knowledge and the importance of caring for all relations.',
      assessmentNotes: '☐ Understands Mi\'kmaq as original inhabitants ☐ Shows respect for Indigenous heritage ☐ Knows meaning of Epekwitk',
      materials: JSON.stringify(['Mi\'kmaq cultural images', 'Epekwitk pronunciation guide', 'Traditional land use maps', 'Respect and acknowledgment charts'])
    });
    
    lessons.push({
      title: 'PEI Music and Songs',
      titleFr: 'Musique et chansons de l\'Î.-P.-É.',
      date: week4Days[1],
      mindsOn: 'What music do you hear on PEI? Do you know any Island songs? What makes music special to a place?',
      mindsOnFr: 'Quelle musique entendez-vous Î.-P.-É.? Connaissez-vous chansons insulaires? Qu\'est-ce qui rend musique spéciale à un endroit?',
      action: 'Listen to PEI fiddle music, learn traditional Island songs, explore Celtic influence, practice simple Island melodies',
      actionFr: 'Écouter musique violon Î.-P.-É., apprendre chansons traditionnelles, explorer influence celtique, pratiquer mélodies simples',
      consolidation: 'Share favorite Island songs, discuss how music brings community together, plan musical sharing',
      consolidationFr: 'Partager chansons insulaires favorites, discuter comment musique rassemble communauté, planifier partage musical',
      vocabularyFr: JSON.stringify(['musique', 'chanson', 'violon']),
      indigenousPerspectives: 'Acknowledge Mi\'kmaq traditional songs and drumming that have always been part of Epekwitk, including honor songs, seasonal songs, and songs that connect people to the land and water.',
      assessmentNotes: '☐ Identifies PEI musical traditions ☐ Participates in music activities ☐ Understands music as cultural expression',
      materials: JSON.stringify(['PEI folk music recordings', 'Simple instruments', 'Song lyric sheets', 'Musical activity props'])
    });
    
    lessons.push({
      title: 'Island Festivals and Celebrations',
      titleFr: 'Festivals et célébrations de l\'île',
      date: week4Days[2],
      mindsOn: 'What festivals happen on PEI? How do Islanders celebrate together? What celebrations have you been to?',
      mindsOnFr: 'Quels festivals arrivent Î.-P.-É.? Comment Insulaires célèbrent ensemble? Quelles célébrations avez-vous été?',
      action: 'Learn about PEI festivals (Potato Blossom, Shellfish, Fall Flavours), explore celebration traditions, plan mini classroom festival',
      actionFr: 'Apprendre festivals Î.-P.-É. (Fleur pomme terre, Fruits mer, Saveurs automne), explorer traditions célébration, planifier mini festival classe',
      consolidation: 'Share festival experiences, create festival invitation, discuss importance of community celebrations',
      consolidationFr: 'Partager expériences festival, créer invitation festival, discuter importance célébrations communautaires',
      vocabularyFr: JSON.stringify(['festival', 'célébration', 'tradition']),
      indigenousPerspectives: 'Recognize Mi\'kmaq traditional gatherings and powwows that bring communities together for celebration, sharing, and cultural exchange, honoring ancestors and strengthening community bonds.',
      assessmentNotes: '☐ Names PEI festivals ☐ Understands celebration importance ☐ Participates in planning activities',
      materials: JSON.stringify(['PEI festival photos', 'Celebration planning materials', 'Invitation templates', 'Festival activity props'])
    });
    
    lessons.push({
      title: 'Famous PEI Foods',
      titleFr: 'Aliments célèbres de l\'Î.-P.-É.',
      date: week4Days[3],
      mindsOn: 'What foods is PEI famous for? What do you love to eat that comes from our island? Why are potatoes special here?',
      mindsOnFr: 'Pour quels aliments Î.-P.-É. célèbre? Qu\'aimez-vous manger qui vient notre île? Pourquoi pommes terre spéciales ici?',
      action: 'Explore famous PEI foods (potatoes, seafood, berries, beef), learn about local ingredients, create PEI menu',
      actionFr: 'Explorer aliments célèbres Î.-P.-É. (pommes terre, fruits mer, baies, bœuf), apprendre ingrédients locaux, créer menu Î.-P.-É.',
      consolidation: 'Share PEI menus, taste local foods if possible, discuss eating local benefits',
      consolidationFr: 'Partager menus Î.-P.-É., goûter aliments locaux si possible, discuter avantages manger local',
      vocabularyFr: JSON.stringify(['aliment', 'local', 'délicieux']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional foods from Epekwitk including traditional plants, medicines, and sustainable harvesting practices that have nourished people for thousands of years.',
      assessmentNotes: '☐ Identifies famous PEI foods ☐ Understands local food importance ☐ Shows appreciation for Island agriculture',
      materials: JSON.stringify(['PEI food pictures', 'Sample local foods', 'Menu-making materials', 'Local vs. imported food sorting'])
    });
    
    lessons.push({
      title: 'Arts and Crafts of PEI',
      titleFr: 'Arts et artisanat de l\'Î.-P.-É.',
      date: week4Days[4],
      mindsOn: 'What art do you see on PEI? What do Island artists create? How does art show what\'s special about a place?',
      mindsOnFr: 'Quel art voyez-vous Î.-P.-É.? Qu\'est-ce que artistes insulaires créent? Comment art montre ce qui est spécial endroit?',
      action: 'Explore PEI art (pottery, quilts, paintings), learn about local artists, create Island-inspired artwork',
      actionFr: 'Explorer art Î.-P.-É. (poterie, courtepointes, peintures), apprendre artistes locaux, créer œuvres inspirées île',
      consolidation: 'Share Island artwork, create class art gallery, discuss how art represents place and culture',
      consolidationFr: 'Partager œuvres île, créer galerie art classe, discuter comment art représente lieu et culture',
      vocabularyFr: JSON.stringify(['art', 'artiste', 'créer']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional arts including basket weaving, quillwork, beadwork, and storytelling that continue to be important expressions of culture and connection to Epekwitk.',
      assessmentNotes: '☐ Recognizes PEI artistic traditions ☐ Creates Island-inspired art ☐ Understands art as cultural expression',
      materials: JSON.stringify(['PEI artist examples', 'Art-making supplies', 'Gallery display materials', 'Traditional and contemporary art samples'])
    });
    
    // WEEK 5: Being an Islander (February 3-7, 2025)
    const week5Days = getWeekDays('2025-02-03');
    
    lessons.push({
      title: 'Islander Pride and Identity',
      titleFr: 'Fierté et identité insulaire',
      date: week5Days[0],
      mindsOn: 'What makes you proud to be an Islander? What does it mean to live on PEI? How are Islanders special?',
      mindsOnFr: 'Qu\'est-ce qui vous rend fier être Insulaire? Que signifie vivre Î.-P.-É.? Comment Insulaires sont spéciaux?',
      action: 'Explore Islander characteristics (friendly, welcoming, connected to land and sea), share pride moments, create Islander identity map',
      actionFr: 'Explorer caractéristiques Insulaires (amicaux, accueillants, connectés terre mer), partager moments fierté, créer carte identité',
      consolidation: 'Share Islander identity maps, create class definition of "Islander," celebrate our shared identity',
      consolidationFr: 'Partager cartes identité Insulaire, créer définition classe "Insulaire," célébrer identité partagée',
      vocabularyFr: JSON.stringify(['fierté', 'identité', 'insulaire']),
      indigenousPerspectives: 'Acknowledge that Mi\'kmaq peoples have the deepest Islander identity, with thousands of years of connection to Epekwitk and continuing cultural pride in their homeland.',
      assessmentNotes: '☐ Expresses Islander pride ☐ Identifies Islander characteristics ☐ Shows positive island identity',
      materials: JSON.stringify(['Islander characteristic cards', 'Identity mapping materials', 'Pride reflection sheets', 'Islander celebration props'])
    });
    
    lessons.push({
      title: 'Taking Care of Our Island Home',
      titleFr: 'Prendre soin de notre maison insulaire',
      date: week5Days[1],
      mindsOn: 'How can we take care of PEI? What is our responsibility as Islanders? How do we protect what we love?',
      mindsOnFr: 'Comment prendre soin Î.-P.-É.? Quelle est responsabilité comme Insulaires? Comment protéger ce qu\'on aime?',
      action: 'Discuss environmental stewardship, learn about protecting beaches, waters, and land, create care action plan',
      actionFr: 'Discuter intendance environnementale, apprendre protéger plages, eaux, terre, créer plan action soin',
      consolidation: 'Make environmental promises, plan school/home conservation actions, discuss being good Island stewards',
      consolidationFr: 'Faire promesses environnementales, planifier actions conservation école/maison, discuter être bons intendants île',
      vocabularyFr: JSON.stringify(['protéger', 'environnement', 'responsabilité']),
      indigenousPerspectives: 'Learn from Mi\'kmaq traditional teachings about being stewards of Epekwitk, including the responsibility to care for the land and water for seven generations into the future.',
      assessmentNotes: '☐ Understands environmental responsibility ☐ Suggests care actions ☐ Shows commitment to island stewardship',
      materials: JSON.stringify(['Environmental care posters', 'Action planning sheets', 'Conservation idea cards', 'Stewardship promise certificates'])
    });
    
    lessons.push({
      title: 'Island Communities and Helping',
      titleFr: 'Communautés insulaires et aide',
      date: week5Days[2],
      mindsOn: 'How do Island communities help each other? What makes Islander communities special? How do you help your community?',
      mindsOnFr: 'Comment communautés insulaires s\'entraident? Qu\'est-ce qui rend communautés insulaires spéciales? Comment aidez-vous votre communauté?',
      action: 'Explore Island community spirit, learn about helping traditions, discuss how small communities support each other',
      actionFr: 'Explorer esprit communauté insulaire, apprendre traditions aide, discuter comment petites communautés se soutiennent',
      consolidation: 'Plan community helping project, create helping hands display, make commitment to community service',
      consolidationFr: 'Planifier projet aide communauté, créer affichage mains aidantes, s\'engager service communauté',
      vocabularyFr: JSON.stringify(['communauté', 'aider', 'soutenir']),
      indigenousPerspectives: 'Honor Mi\'kmaq traditional values of community cooperation, sharing, and caring for all community members, which continue to strengthen Island communities today.',
      assessmentNotes: '☐ Understands community cooperation ☐ Suggests helping actions ☐ Shows community commitment',
      materials: JSON.stringify(['Community helping examples', 'Project planning materials', 'Helping hands cutouts', 'Community service ideas'])
    });
    
    lessons.push({
      title: 'Future Dreams for PEI',
      titleFr: 'Rêves d\'avenir pour l\'Î.-P.-É.',
      date: week5Days[3],
      mindsOn: 'What do you dream for PEI\'s future? How do you want our island to grow and change? What should stay the same?',
      mindsOnFr: 'Que rêvez-vous pour avenir Î.-P.-É.? Comment voulez-vous notre île grandir et changer? Qu\'est-ce qui devrait rester pareil?',
      action: 'Share future dreams for PEI, discuss balancing change with tradition, create "Future PEI" artwork and plans',
      actionFr: 'Partager rêves avenir Î.-P.-É., discuter équilibrer changement avec tradition, créer art et plans "Î.-P.-É. Future"',
      consolidation: 'Present future PEI visions, discuss how young people shape the future, make commitments to positive change',
      consolidationFr: 'Présenter visions Î.-P.-É. future, discuter comment jeunes façonnent avenir, s\'engager changement positif',
      vocabularyFr: JSON.stringify(['avenir', 'rêve', 'espoir']),
      indigenousPerspectives: 'Include Mi\'kmaq perspectives on sustainable development and the importance of making decisions that honor the land and benefit seven generations into the future.',
      assessmentNotes: '☐ Expresses positive future vision ☐ Understands role in shaping future ☐ Shows hope and commitment',
      materials: JSON.stringify(['Future vision planning sheets', 'Art supplies for future PEI', 'Dream sharing materials', 'Commitment cards'])
    });
    
    lessons.push({
      title: 'Celebrating Our Island Learning',
      titleFr: 'Célébrer notre apprentissage insulaire',
      date: week5Days[4],
      mindsOn: 'What have we learned about PEI? What are you most proud of knowing? How will you share your Islander knowledge?',
      mindsOnFr: 'Qu\'avons-nous appris sur Î.-P.-É.? De quoi êtes-vous plus fier de savoir? Comment partagerez-vous connaissance insulaire?',
      action: 'Create "Islander Pride Portfolios," practice presenting PEI knowledge, prepare celebration of learning',
      actionFr: 'Créer "Portfolios Fierté Insulaire," pratiquer présenter connaissance Î.-P.-É., préparer célébration apprentissage',
      consolidation: 'Present Islander learning to families, receive Islander certificates, make ongoing commitments to island pride',
      consolidationFr: 'Présenter apprentissage insulaire familles, recevoir certificats Insulaire, s\'engager fierté île continue',
      vocabularyFr: JSON.stringify(['célébrer', 'apprendre', 'partager']),
      indigenousPerspectives: 'Celebrate learning in the spirit of Mi\'kmaq traditional knowledge sharing, recognizing that we are all treaty people with responsibilities to care for Epekwitk together.',
      assessmentNotes: '☐ Presents PEI learning confidently ☐ Demonstrates Islander knowledge ☐ Shows ongoing island commitment',
      materials: JSON.stringify(['Portfolio materials', 'Presentation props', 'Islander certificates', 'Celebration decorations'])
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating PEI Social Studies lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: peiUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // All lessons are 45 minutes as specified
          grade: 1,
          subject: 'Sciences humaines',
          language: 'fr',
          
          // Three-part lesson structure (8 + 27 + 10 = 45 minutes)
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Planning details
          learningGoals: `Students will explore Prince Edward Island as their province, understanding its unique geography, rich culture, Mi'kmaq heritage, and developing Islander identity and pride. French immersion vocabulary development.`,
          learningGoalsFr: `Les élèves exploreront l'Île-du-Prince-Édouard comme leur province, comprenant sa géographie unique, culture riche, héritage Mi'kmaq, et développant identité et fierté insulaire.`,
          
          materials: lessonData.materials,
          
          grouping: 'whole class exploration, partner geography work, individual reflection, small group cultural activities',
          
          // French vocabulary (2-3 terms as required)
          vocabularyFr: lessonData.vocabularyFr,
          
          // Indigenous perspectives (100+ characters as required)
          indigenousPerspectives: lessonData.indigenousPerspectives,
          
          // Assessment notes with checkboxes as requested
          assessmentNotes: lessonData.assessmentNotes,
          assessmentType: 'formative',
          
          // Differentiation strategies in JSON format as required
          accommodations: JSON.stringify([
            'Visual PEI maps and photos',
            'Extended processing time for geographic concepts',
            'Peer partnerships for support',
            'Alternative communication methods'
          ]),
          
          modifications: JSON.stringify([
            'Simplified geographic vocabulary',
            'Reduced written requirements',
            'Focus on hands-on island exploration',
            'Additional visual supports'
          ]),
          
          extensions: JSON.stringify([
            'Extended research about PEI topics',
            'Leadership roles in presentations',
            'Detailed mapping projects',
            'Cross-curricular island connections'
          ]),
          
          // JSON differentiation with required keys
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual PEI supports, simplified vocabulary, hands-on geography activities, peer partnerships, extra processing time for island concepts',
            forIEP: 'Individual accommodations per IEP, modified participation expectations, alternative assessment methods, flexible PEI learning approaches',
            forELL: 'Bilingual PEI vocabulary supports, visual aids, sentence starters, peer translation assistance, cultural connections to home countries',
            forAdvanced: 'Extended PEI research projects, leadership in presentations, detailed mapping activities, cross-curricular island studies'
          }),
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All PEI materials organized in labeled bins, visual schedule posted, province maps displayed, French vocabulary cards visible, clear island activity instructions with pictures'
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
    
    // Link expectations to lessons (distribute evenly)
    const createdLessons = await prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: peiUnit.id },
      orderBy: { date: 'asc' }
    });
    
    // Link expectations across all lessons
    for (let i = 0; i < createdLessons.length; i++) {
      // Cycle through expectations so each lesson gets 1-2 expectations
      const expectationIndex = i % socialStudiesExpectations.length;
      const expectation = socialStudiesExpectations[expectationIndex];
      
      if (expectation) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: createdLessons[i].id,
            expectationId: expectation.id
          }
        });
      }
      
      // Add a second expectation for some lessons to provide more coverage
      if (i < socialStudiesExpectations.length && socialStudiesExpectations[(i + 3) % socialStudiesExpectations.length]) {
        const secondExpectation = socialStudiesExpectations[(i + 3) % socialStudiesExpectations.length];
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: createdLessons[i].id,
            expectationId: secondExpectation.id
          }
        });
      }
    }
    
    // Link expectations to the unit plan as well
    for (const expectation of socialStudiesExpectations) {
      await prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: peiUnit.id,
          expectationId: expectation.id
        }
      });
    }
    
    console.log('\n🏝️ PEI SOCIAL STUDIES "OUR PROVINCE" LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive PEI Social Studies lesson plans`);
    console.log('✅ 5 weeks of daily instruction (Jan 6 - Feb 21, 2025)');
    console.log('✅ 45-minute lessons: mindsOn (8) + action (27) + consolidation (10)');
    console.log('✅ Complete unit plan: "Our Province PEI/Notre province l\'Î.-P.-É."');
    console.log('✅ 2-3 French vocabulary terms per lesson (vocabularyFr)');
    console.log('✅ Indigenous perspectives (100+ chars) honoring Mi\'kmaq heritage');
    console.log('✅ JSON differentiation (forStruggling, forIEP, forELL, forAdvanced)');
    console.log('✅ Assessment notes with checkboxes');
    console.log('✅ Materials: PEI maps, photos, provincial symbols');
    console.log('✅ Focus: provincial identity, geography, culture, Islander pride');
    console.log('✅ Celebrating PEI\'s unique identity and Mi\'kmaq heritage as Epekwitk');
    console.log(`✅ All ${socialStudiesExpectations.length} Grade 1 Social Studies expectations linked`);
    console.log('\n🎉 Emily\'s students ready to explore "Our Province PEI" with Islander pride!');
    
  } catch (error) {
    console.error('❌ Error creating PEI Social Studies lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPEISocialStudiesLessonPlans()
  .then(() => console.log('\n🏆 PEI Social Studies lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });