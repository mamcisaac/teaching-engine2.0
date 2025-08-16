#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSocialStudiesNotreLessonPlans() {
  console.log('🏘️ Creating Social Studies "Our Neighbourhood/Notre quartier" 20 Lesson Plans...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Check if Social Studies unit plan exists, if not create it
    let socialStudiesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Notre quartier'
      }
    });
    
    if (!socialStudiesUnit) {
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
      socialStudiesUnit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: socialStudiesLRP.id,
          title: 'Our Neighbourhood',
          titleFr: 'Notre quartier',
          description: 'Students explore their neighbourhood, learning about community helpers, places, and connections that make a community strong.',
          descriptionFr: 'Les élèves explorent leur quartier, apprenant sur les aidants communautaires, les lieux et les connexions qui rendent une communauté forte.',
          bigIdeas: 'Communities are built through relationships, shared spaces, and people who help each other.',
          bigIdeasFr: 'Les communautés sont construites par les relations, les espaces partagés et les personnes qui s\'entraident.',
          startDate: new Date('2025-11-03'),
          endDate: new Date('2025-12-05'),
          estimatedHours: 20, // 5 weeks × 4 lessons × 45 minutes each
          assessmentPlan: 'Observations, mapping activities, community helper interviews, neighbourhood walks',
          indigenousPerspectives: 'Acknowledge traditional territorial lands and Indigenous concepts of community stewardship, sharing, and caring for the land and each other. Explore how Indigenous communities have always emphasized collective responsibility and caring for all members.',
          communityConnections: 'Local police officer visit, firefighter presentation, postal worker interview, neighbourhood walk, local business visits',
          crossCurricularConnections: 'French vocabulary development, map-making (math), safety rules (health), community artwork (arts)',
          culminatingTask: 'Create a class neighbourhood map showing important places and community helpers, with French labels and personal reflections on how we can help our community',
          keyVocabulary: JSON.stringify([
            { en: 'neighbourhood', fr: 'quartier' },
            { en: 'community', fr: 'communauté' },
            { en: 'helper', fr: 'aide' },
            { en: 'safety', fr: 'sécurité' },
            { en: 'map', fr: 'carte' },
            { en: 'police officer', fr: 'policier/policière' },
            { en: 'firefighter', fr: 'pompier/pompière' },
            { en: 'nurse', fr: 'infirmier/infirmière' },
            { en: 'postal worker', fr: 'facteur/factrice' },
            { en: 'store', fr: 'magasin' },
            { en: 'park', fr: 'parc' },
            { en: 'library', fr: 'bibliothèque' },
            { en: 'school', fr: 'école' },
            { en: 'hospital', fr: 'hôpital' },
            { en: 'help', fr: 'aider' },
            { en: 'care', fr: 'soins' },
            { en: 'special', fr: 'spécial' }
          ]),
          essentialQuestions: JSON.stringify([
            'What makes a neighbourhood a community?',
            'How do people in our neighbourhood help each other?',
            'What places in our neighbourhood are important to us?',
            'How can we be good neighbours?',
            'What makes our neighbourhood special?'
          ]),
          learningSkills: JSON.stringify([
            'Collaboration and cooperation',
            'Communication through French and English',
            'Critical thinking about community',
            'Responsibility and citizenship',
            'Self-regulation in group activities'
          ]),
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual supports, peer partnerships, simplified vocabulary, hands-on activities, additional processing time',
            forIEP: 'Individual accommodations as per IEP, modified participation expectations, alternative communication methods',
            forELL: 'Visual vocabulary cards, sentence starters, peer translation support, bilingual resources',
            forAdvanced: 'Leadership roles in activities, extended research projects, mentoring other students, complex mapping activities'
          }),
          performanceTask: JSON.stringify({
            title: 'My Neighbourhood Guide',
            description: 'Students create a bilingual guide to their neighbourhood featuring important places, community helpers, and personal connections',
            criteria: ['Accurate information about community helpers', 'Proper use of French vocabulary', 'Clear explanations of neighbourhood features', 'Evidence of understanding community connections']
          })
        }
      });
      
      console.log(`✅ Created unit plan: ${socialStudiesUnit.titleFr} (ID: ${socialStudiesUnit.id})`);
    } else {
      console.log(`✅ Found existing unit plan: ${socialStudiesUnit.titleFr} (ID: ${socialStudiesUnit.id})`);
    }
    
    console.log(`📅 Duration: November 3 - December 5, 2025 (20 hours)\n`);
    
    // Clear existing lesson plans for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: socialStudiesUnit.id }
    });
    
    console.log('🗑️ Cleared existing lesson plans\n');
    
    // Create 20 lesson plans (4 per week) for 5 weeks
    const lessons = [];
    
    // Helper function to create dates in November-December 2025 (Mon-Thu each week)
    const getWeekDays = (weekStart: string) => {
      const start = new Date(weekStart);
      return [
        new Date(start), // Monday
        new Date(start.getTime() + 24 * 60 * 60 * 1000), // Tuesday
        new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000), // Wednesday
        new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000), // Thursday
      ];
    };
    
    // WEEK 1: Exploring Our Neighbourhood (November 3-6, 2025)
    const week1Days = getWeekDays('2025-11-03');
    
    lessons.push({
      title: 'What is a Neighbourhood?',
      titleFr: 'Qu\'est-ce qu\'un quartier?',
      date: week1Days[0],
      mindsOn: 'Share photos of your home and street. What do you see around your house? Who lives near you?',
      mindsOnFr: 'Partager photos de votre maison et rue. Que voyez-vous autour? Qui habite près?',
      action: 'Define neighbourhood, explore classroom neighbourhood map, discuss what makes a place feel like home, draw their street',
      actionFr: 'Définir quartier, explorer carte classe, discuter ce qui fait sentir maison, dessiner leur rue',
      consolidation: 'Share street drawings, create class definition of neighbourhood, post vocabulary words',
      consolidationFr: 'Partager dessins rue, créer définition classe quartier, afficher vocabulaire',
      vocabularyFr: JSON.stringify(['quartier', 'maison', 'rue']),
      indigenousPerspectives: 'Acknowledge we are learning on traditional Mi\'kmaq territory. Discuss how Indigenous peoples have always known the importance of place and taking care of the land where we live.',
      assessmentNotes: '☐ Participates in discussions about neighbourhood ☐ Uses basic French vocabulary ☐ Shows understanding of home/neighbourhood connection',
      materials: JSON.stringify(['Photos of students\' homes', 'Large neighbourhood map', 'Drawing materials', 'Vocabulary cards'])
    });
    
    lessons.push({
      title: 'Mapping Our Neighbourhood',
      titleFr: 'Cartographier notre quartier',
      date: week1Days[1],
      mindsOn: 'Look at simple maps. What do the symbols mean? Can you find your house on our neighbourhood map?',
      mindsOnFr: 'Regarder cartes simples. Que signifient symboles? Trouvez votre maison sur carte?',
      action: 'Learn map symbols, practice reading simple maps, create individual neighbourhood maps with symbols',
      actionFr: 'Apprendre symboles carte, pratiquer lire cartes, créer cartes quartier avec symboles',
      consolidation: 'Gallery walk of maps, discuss different symbols used, plan neighbourhood walk route',
      consolidationFr: 'Promenade galerie cartes, discuter symboles utilisés, planifier route promenade',
      vocabularyFr: JSON.stringify(['carte', 'symbole', 'direction']),
      indigenousPerspectives: 'Learn about traditional Indigenous ways of knowing places through stories, landmarks, and seasonal knowledge passed down through generations.',
      assessmentNotes: '☐ Identifies basic map symbols ☐ Locates familiar places on map ☐ Creates simple map with symbols',
      materials: JSON.stringify(['Various maps', 'Map symbols cards', 'Large paper for mapping', 'Coloured pencils'])
    });
    
    lessons.push({
      title: 'Important Places Near Us',
      titleFr: 'Lieux importants près de nous',
      date: week1Days[2],
      mindsOn: 'Close your eyes and think of your favourite place in the neighbourhood. What makes it special?',
      mindsOnFr: 'Fermez yeux, pensez lieu favori quartier. Qu\'est-ce qui le rend spécial?',
      action: 'Identify important places (school, stores, parks), categorize places by purpose, add places to class map',
      actionFr: 'Identifier lieux importants, catégoriser lieux par but, ajouter lieux à carte classe',
      consolidation: 'Vote on most important places, discuss why places are important to different people',
      consolidationFr: 'voter lieux plus importants, discuter pourquoi lieux importants pour différentes personnes',
      vocabularyFr: JSON.stringify(['école', 'magasin', 'parc']),
      indigenousPerspectives: 'Recognize that Indigenous communities have sacred and culturally important places that hold deep meaning and must be respected and protected.',
      assessmentNotes: '☐ Names important neighbourhood places ☐ Explains why places are important ☐ Uses French place vocabulary',
      materials: JSON.stringify(['Neighbourhood photos', 'Place category cards', 'Stickers for voting', 'Class map'])
    });
    
    lessons.push({
      title: 'Neighbourhood Walk Preparation',
      titleFr: 'Préparation promenade quartier',
      date: week1Days[3],
      mindsOn: 'What should we look for on our neighbourhood walk? What questions do we have about our area?',
      mindsOnFr: 'Que devrions-nous chercher promenade? Quelles questions avons-nous sur notre région?',
      action: 'Plan observation checklist, practice walking safety rules, prepare clipboards with maps and observation sheets',
      actionFr: 'Planifier liste observation, pratiquer règles sécurité marche, préparer planches avec cartes',
      consolidation: 'Review safety rules, assign walking partners, set expectations for respectful neighbourhood exploration',
      consolidationFr: 'Réviser règles sécurité, assigner partenaires marche, fixer attentes exploration respectueuse',
      vocabularyFr: JSON.stringify(['sécurité', 'observer', 'marcher']),
      indigenousPerspectives: 'Discuss the Indigenous value of walking gently on the land and observing with respect, taking only what is needed and leaving places better than we found them.',
      assessmentNotes: '☐ Knows neighbourhood walk safety rules ☐ Shows readiness for community exploration ☐ Demonstrates respect for neighbourhood',
      materials: JSON.stringify(['Safety rules poster', 'Clipboards and pencils', 'Observation checklists', 'Walking route map'])
    });
    
    // WEEK 2: Community Helpers (November 10-13, 2025)
    const week2Days = getWeekDays('2025-11-10');
    
    lessons.push({
      title: 'Police Officers Keep Us Safe',
      titleFr: 'Les policiers nous protègent',
      date: week2Days[0],
      mindsOn: 'Have you ever seen a police officer? What were they doing? How do they help people?',
      mindsOnFr: 'Avez-vous vu policier? Que faisaient-ils? Comment aident-ils les gens?',
      action: 'Learn about police officer jobs, practice calling 911, role-play asking police for help, safety discussion',
      actionFr: 'Apprendre travail policier, pratiquer appeler 911, jouer demander aide, discussion sécurité',
      consolidation: 'Draw police officer helping someone, share ways police keep neighbourhood safe',
      consolidationFr: 'Dessiner policier aidant quelqu\'un, partager façons policier protège quartier',
      vocabularyFr: JSON.stringify(['policier', 'sécurité', 'protéger']),
      indigenousPerspectives: 'Acknowledge that Indigenous communities have traditional ways of keeping community safety through sharing, caring for elders and children, and collective responsibility.',
      assessmentNotes: '☐ Understands police officer role ☐ Knows when to call for help ☐ Shows respect for community helpers',
      materials: JSON.stringify(['Police officer uniform items', 'Toy phones for 911 practice', 'Safety scenario cards', 'Drawing materials'])
    });
    
    lessons.push({
      title: 'Firefighters and Fire Safety',
      titleFr: 'Pompiers et sécurité incendie',
      date: week2Days[1],
      mindsOn: 'What sounds does a fire truck make? What do firefighters wear? Why is their job important?',
      mindsOnFr: 'Quels sons fait camion pompier? Que portent pompiers? Pourquoi leur travail important?',
      action: 'Explore firefighter equipment, practice stop-drop-roll, create fire escape plan for home',
      actionFr: 'Explorer équipement pompier, pratiquer arrêter-tomber-rouler, créer plan évacuation maison',
      consolidation: 'Share fire safety tips, role-play fire safety scenarios, sing fire safety song',
      consolidationFr: 'Partager conseils sécurité incendie, jouer scénarios, chanter chanson sécurité',
      vocabularyFr: JSON.stringify(['pompier', 'feu', 'sécurité']),
      indigenousPerspectives: 'Learn about traditional Indigenous use of fire for land management, cooking, and ceremonies, and the importance of respecting fire as both helpful and dangerous.',
      assessmentNotes: '☐ Demonstrates fire safety knowledge ☐ Explains firefighter role ☐ Creates basic escape plan',
      materials: JSON.stringify(['Firefighter hat and gear', 'Fire safety books', 'Home floor plan template', 'Fire safety props'])
    });
    
    lessons.push({
      title: 'Doctors and Nurses Help Us Stay Healthy',
      titleFr: 'Médecins et infirmiers nous gardent en santé',
      date: week2Days[2],
      mindsOn: 'When do you visit the doctor? What tools do doctors and nurses use? How do they help you feel better?',
      mindsOnFr: 'Quand visitez-vous médecin? Quels outils utilisent? Comment vous aident se sentir mieux?',
      action: 'Explore medical tools, practice healthy habits, set up classroom doctor\'s office, role-play check-ups',
      actionFr: 'Explorer outils médicaux, pratiquer habitudes saines, installer bureau médecin, jouer examens',
      consolidation: 'Share healthy habits chart, discuss how to stay healthy, thank healthcare workers',
      consolidationFr: 'Partager tableau habitudes saines, discuter rester en santé, remercier travailleurs',
      vocabularyFr: JSON.stringify(['médecin', 'infirmier', 'santé']),
      indigenousPerspectives: 'Honor traditional Indigenous knowledge about healing plants, the connection between mental and physical health, and the role of community in wellness.',
      assessmentNotes: '☐ Identifies medical tools ☐ Names healthy habits ☐ Shows appreciation for healthcare workers',
      materials: JSON.stringify(['Toy medical kit', 'Healthy habits chart', 'Doctor/nurse dress-up clothes', 'Health books'])
    });
    
    lessons.push({
      title: 'Postal Workers Connect Our Community',
      titleFr: 'Facteurs connectent notre communauté',
      date: week2Days[3],
      mindsOn: 'Who brings mail to your house? What kinds of mail do you receive? How does mail travel?',
      mindsOnFr: 'Qui apporte courrier chez vous? Quels types courrier recevez-vous? Comment courrier voyage?',
      action: 'Learn about postal worker job, write letters to classmates, practice addressing envelopes, sort pretend mail',
      actionFr: 'Apprendre travail facteur, écrire lettres camarades, pratiquer adresser enveloppes, trier courrier',
      consolidation: 'Deliver classroom mail, discuss how mail connects people, appreciate postal workers',
      consolidationFr: 'Livrer courrier classe, discuter comment courrier connecte gens, apprécier facteurs',
      vocabularyFr: JSON.stringify(['facteur', 'courrier', 'lettre']),
      indigenousPerspectives: 'Explore traditional Indigenous ways of sending messages through symbols, storytelling, and traveling messengers who connected distant communities.',
      assessmentNotes: '☐ Understands postal worker role ☐ Writes simple letter ☐ Addresses envelope correctly',
      materials: JSON.stringify(['Envelopes and paper', 'Classroom mailbox', 'Address labels', 'Postal worker hat'])
    });
    
    // WEEK 3: Community Places (November 17-20, 2025)
    const week3Days = getWeekDays('2025-11-17');
    
    lessons.push({
      title: 'Stores and Shopping in Our Neighbourhood',
      titleFr: 'Magasins et achats dans notre quartier',
      date: week3Days[0],
      mindsOn: 'What stores do you visit with your family? What do you buy there? Who works in stores?',
      mindsOnFr: 'Quels magasins visitez-vous famille? Qu\'achetez-vous? Qui travaille dans magasins?',
      action: 'Categorize different types of stores, set up classroom store, practice shopping with play money',
      actionFr: 'Catégoriser types magasins, installer magasin classe, pratiquer achats avec argent jouet',
      consolidation: 'Discuss how stores help neighbourhood, practice saying "merci" to store workers, plan store visit',
      consolidationFr: 'Discuter comment magasins aident quartier, pratiquer dire merci, planifier visite magasin',
      vocabularyFr: JSON.stringify(['magasin', 'acheter', 'vendeur']),
      indigenousPerspectives: 'Learn about traditional Indigenous trading and sharing systems where communities supported each other through gift-giving and reciprocal relationships.',
      assessmentNotes: '☐ Names different types of stores ☐ Demonstrates polite shopping behavior ☐ Uses French shopping vocabulary',
      materials: JSON.stringify(['Store pictures', 'Play money and cash register', 'Shopping baskets', 'Store items for dramatic play'])
    });
    
    lessons.push({
      title: 'Parks and Recreation Spaces',
      titleFr: 'Parcs et espaces récréatifs',
      date: week3Days[1],
      mindsOn: 'What is your favourite thing to do at the park? What equipment do you find there? Who takes care of parks?',
      mindsOnFr: 'Activité favorite au parc? Quel équipement trouvez-vous? Qui prend soin parcs?',
      action: 'Design dream playground, learn about park rules and safety, practice park games and activities',
      actionFr: 'Concevoir terrain jeu rêve, apprendre règles parc sécurité, pratiquer jeux activités parc',
      consolidation: 'Share playground designs, create park rules poster, plan class park visit',
      consolidationFr: 'Partager conceptions terrain jeu, créer affiche règles parc, planifier visite parc classe',
      vocabularyFr: JSON.stringify(['parc', 'jouer', 'balançoire']),
      indigenousPerspectives: 'Discuss Indigenous understanding of land as a place for all community members to gather, play, and learn together in harmony with nature.',
      assessmentNotes: '☐ Identifies park features ☐ Knows park safety rules ☐ Designs appropriate playground',
      materials: JSON.stringify(['Park photos', 'Playground design paper', 'Art supplies', 'Park safety rules chart'])
    });
    
    lessons.push({
      title: 'Library: Our Community Learning Place',
      titleFr: 'Bibliothèque: lieu d\'apprentissage communautaire',
      date: week3Days[2],
      mindsOn: 'What do you do at the library? What can you borrow? Who helps you find books?',
      mindsOnFr: 'Que faites-vous bibliothèque? Que pouvez-vous emprunter? Qui aide trouver livres?',
      action: 'Set up classroom library, practice library behavior, learn about library cards, sort books by topic',
      actionFr: 'Installer bibliothèque classe, pratiquer comportement bibliothèque, apprendre cartes, trier livres',
      consolidation: 'Read favourite books quietly, discuss library rules, make library visit plan',
      consolidationFr: 'Lire livres favoris tranquillement, discuter règles, faire plan visite bibliothèque',
      vocabularyFr: JSON.stringify(['bibliothèque', 'livre', 'lire']),
      indigenousPerspectives: 'Honor the Indigenous oral tradition where knowledge was shared through storytelling, and recognize libraries as places that preserve and share knowledge from many cultures.',
      assessmentNotes: '☐ Demonstrates library behavior ☐ Sorts books appropriately ☐ Shows respect for books and learning',
      materials: JSON.stringify(['Class books for library setup', 'Library cards template', 'Book bins for sorting', 'Quiet reading area'])
    });
    
    lessons.push({
      title: 'Schools in Our Community',
      titleFr: 'Écoles dans notre communauté',
      date: week3Days[3],
      mindsOn: 'Who works in our school? What rooms do we have? How does our school help families?',
      mindsOnFr: 'Qui travaille dans école? Quelles salles avons-nous? Comment école aide familles?',
      action: 'Tour school building, interview school staff, create school map, learn about different school jobs',
      actionFr: 'Visiter bâtiment école, interviewer personnel, créer carte école, apprendre différents emplois',
      consolidation: 'Share school staff interviews, appreciate school workers, add school to neighbourhood map',
      consolidationFr: 'Partager entrevues personnel, apprécier travailleurs école, ajouter école carte quartier',
      vocabularyFr: JSON.stringify(['école', 'directeur', 'enseignant']),
      indigenousPerspectives: 'Acknowledge that Indigenous communities have always valued learning and teaching, with knowledge passed from elders to young people in many different ways.',
      assessmentNotes: '☐ Names school staff roles ☐ Shows appreciation for school workers ☐ Creates accurate school map',
      materials: JSON.stringify(['Interview question sheets', 'School map template', 'Camera for documentation', 'Thank you cards'])
    });
    
    // WEEK 4: Neighbourhood Connections (November 24-27, 2025) - Note: Nov 27-29 might be Thanksgiving
    const week4Days = getWeekDays('2025-11-24');
    
    lessons.push({
      title: 'Safety in Our Neighbourhood',
      titleFr: 'Sécurité dans notre quartier',
      date: week4Days[0],
      mindsOn: 'How do you stay safe walking in the neighbourhood? Who can you ask for help?',
      mindsOnFr: 'Comment restez-vous en sécurité marchant quartier? Qui pouvez-vous demander aide?',
      action: 'Learn pedestrian safety rules, practice crossing streets safely, identify trusted adults and safe places',
      actionFr: 'Apprendre règles sécurité piéton, pratiquer traverser rues, identifier adultes confiance lieux sûrs',
      consolidation: 'Create neighbourhood safety map, practice safety scenarios, make safety pledge',
      consolidationFr: 'Créer carte sécurité quartier, pratiquer scénarios sécurité, faire promesse sécurité',
      vocabularyFr: JSON.stringify(['sécurité', 'attention', 'prudent']),
      indigenousPerspectives: 'Learn about Indigenous teaching that emphasizes caring for and protecting all community members, especially children and elders.',
      assessmentNotes: '☐ Demonstrates street safety knowledge ☐ Identifies trusted adults ☐ Makes good safety choices',
      materials: JSON.stringify(['Street safety props', 'Trusted adult photos', 'Safety map template', 'Safety pledge certificate'])
    });
    
    lessons.push({
      title: 'How Neighbours Help Each Other',
      titleFr: 'Comment les voisins s\'entraident',
      date: week4Days[1],
      mindsOn: 'How do people in your neighbourhood help each other? What kind acts have you seen?',
      mindsOnFr: 'Comment gens quartier s\'entraident? Quels actes gentils avez-vous vus?',
      action: 'Share stories of helpful neighbours, brainstorm ways to help others, create kindness coupons',
      actionFr: 'Partager histoires voisins utiles, réfléchir façons aider autres, créer coupons gentillesse',
      consolidation: 'Plan neighbourhood kindness acts, share kindness coupons, make helping hands display',
      consolidationFr: 'Planifier actes gentillesse quartier, partager coupons, faire affichage mains aidantes',
      vocabularyFr: JSON.stringify(['aider', 'gentil', 'voisin']),
      indigenousPerspectives: 'Explore Indigenous values of reciprocity, sharing, and the understanding that when we help others, we strengthen the whole community.',
      assessmentNotes: '☐ Shares examples of helpful behavior ☐ Suggests ways to help others ☐ Shows understanding of community support',
      materials: JSON.stringify(['Kindness coupon template', 'Helping hands cutouts', 'Community helper story books', 'Craft materials'])
    });
    
    lessons.push({
      title: 'Solving Neighbourhood Problems Together',
      titleFr: 'Résoudre problèmes quartier ensemble',
      date: week4Days[2],
      mindsOn: 'What problems might happen in a neighbourhood? How can people work together to solve them?',
      mindsOnFr: 'Quels problèmes arrivent quartier? Comment gens travaillent ensemble pour résoudre?',
      action: 'Discuss neighbourhood problems (litter, broken equipment), brainstorm solutions, role-play problem-solving',
      actionFr: 'Discuter problèmes quartier, réfléchir solutions, jouer résolution problèmes',
      consolidation: 'Choose class neighbourhood project, make action plan, assign helper roles',
      consolidationFr: 'Choisir projet quartier classe, faire plan action, assigner rôles aide',
      vocabularyFr: JSON.stringify(['problème', 'solution', 'ensemble']),
      indigenousPerspectives: 'Learn about Indigenous practices of community decision-making through talking circles and consensus, where everyone\'s voice is heard and respected.',
      assessmentNotes: '☐ Identifies neighbourhood problems ☐ Suggests appropriate solutions ☐ Participates in group problem-solving',
      materials: JSON.stringify(['Problem scenario cards', 'Solution brainstorming chart', 'Action plan template', 'Role assignment cards'])
    });
    
    lessons.push({
      title: 'Being a Good Neighbour',
      titleFr: 'Être un bon voisin',
      date: week4Days[3],
      mindsOn: 'What makes someone a good neighbour? How can you be a good neighbour?',
      mindsOnFr: 'Qu\'est-ce qui fait quelqu\'un bon voisin? Comment pouvez-vous être bon voisin?',
      action: 'Create good neighbour checklist, practice neighbour scenarios, make good neighbour badges',
      actionFr: 'Créer liste bon voisin, pratiquer scénarios voisin, faire badges bon voisin',
      consolidation: 'Share good neighbour pledges, wear good neighbour badges, plan to share learning with families',
      consolidationFr: 'Partager promesses bon voisin, porter badges, planifier partager apprentissage familles',
      vocabularyFr: JSON.stringify(['bon', 'respectueux', 'aimable']),
      indigenousPerspectives: 'Embrace the Indigenous concept of "all my relations" where we understand our connection to all living things and our responsibility to care for each other.',
      assessmentNotes: '☐ Lists good neighbour qualities ☐ Demonstrates good neighbour behavior ☐ Makes commitment to helping community',
      materials: JSON.stringify(['Good neighbour checklist template', 'Badge-making materials', 'Scenario cards', 'Pledge certificates'])
    });
    
    // WEEK 5: Our Special Neighbourhood (December 1-4, 2025)
    const week5Days = getWeekDays('2025-12-01');
    
    lessons.push({
      title: 'What Makes Our Neighbourhood Unique',
      titleFr: 'Ce qui rend notre quartier unique',
      date: week5Days[0],
      mindsOn: 'What special things does our neighbourhood have that other places might not have?',
      mindsOnFr: 'Quelles choses spéciales notre quartier a que autres endroits n\'ont peut-être pas?',
      action: 'Create neighbourhood scavenger hunt, photograph special features, interview community members about history',
      actionFr: 'Créer chasse trésor quartier, photographier caractéristiques spéciales, interviewer membres communauté',
      consolidation: 'Share neighbourhood discoveries, create "What Makes Us Special" display, appreciate uniqueness',
      consolidationFr: 'Partager découvertes quartier, créer affichage "Ce qui nous rend spéciaux", apprécier unicité',
      vocabularyFr: JSON.stringify(['unique', 'spécial', 'différent']),
      indigenousPerspectives: 'Recognize that every place has its own spirit and character, and Indigenous peoples have always honored the unique gifts and features of their traditional territories.',
      assessmentNotes: '☐ Identifies unique neighbourhood features ☐ Shows appreciation for local character ☐ Collects meaningful information',
      materials: JSON.stringify(['Cameras or tablets', 'Scavenger hunt lists', 'Interview question cards', 'Display materials'])
    });
    
    lessons.push({
      title: 'Celebrating Our Community',
      titleFr: 'Célébrer notre communauté',
      date: week5Days[1],
      mindsOn: 'How do people in our neighbourhood celebrate together? What events bring everyone together?',
      mindsOnFr: 'Comment gens quartier célèbrent ensemble? Quels événements rassemblent tout le monde?',
      action: 'Learn about community celebrations, plan class neighbourhood celebration, create invitations',
      actionFr: 'Apprendre célébrations communautaires, planifier célébration quartier classe, créer invitations',
      consolidation: 'Practice celebration activities, prepare neighbourhood showcase, invite special guests',
      consolidationFr: 'Pratiquer activités célébration, préparer vitrine quartier, inviter invités spéciaux',
      vocabularyFr: JSON.stringify(['célébrer', 'fête', 'communauté']),
      indigenousPerspectives: 'Learn about Indigenous traditions of community gatherings, powwows, and celebrations that bring people together to share food, stories, and joy.',
      assessmentNotes: '☐ Understands importance of community celebrations ☐ Participates in planning activities ☐ Shows excitement about sharing learning',
      materials: JSON.stringify(['Celebration planning chart', 'Invitation template', 'Decoration materials', 'Community photos'])
    });
    
    lessons.push({
      title: 'Taking Care of Our Neighbourhood',
      titleFr: 'Prendre soin de notre quartier',
      date: week5Days[2],
      mindsOn: 'How can we take care of our neighbourhood? What can we do to keep it beautiful and safe?',
      mindsOnFr: 'Comment prendre soin quartier? Que faire pour le garder beau et sûr?',
      action: 'Plan neighbourhood care actions, create environmental care guide, practice litter cleanup',
      actionFr: 'Planifier actions soin quartier, créer guide soin environnemental, pratiquer ramassage déchets',
      consolidation: 'Make neighbourhood care pledges, organize care action day, share responsibility ideas',
      consolidationFr: 'Faire promesses soin quartier, organiser journée action soin, partager idées responsabilité',
      vocabularyFr: JSON.stringify(['prendre soin', 'environnement', 'responsabilité']),
      indigenousPerspectives: 'Embrace Indigenous teachings about being stewards of the land and understanding our responsibility to care for the Earth for seven generations into the future.',
      assessmentNotes: '☐ Suggests appropriate care actions ☐ Shows environmental responsibility ☐ Commits to ongoing neighbourhood care',
      materials: JSON.stringify(['Care action planning sheet', 'Cleanup supplies (gloves, bags)', 'Environmental care posters', 'Pledge cards'])
    });
    
    lessons.push({
      title: 'Our Neighbourhood Learning Celebration',
      titleFr: 'Célébration d\'apprentissage de notre quartier',
      date: week5Days[3],
      mindsOn: 'What have we learned about our neighbourhood? What do we want to share with others?',
      mindsOnFr: 'Qu\'avons-nous appris sur quartier? Que voulons-nous partager avec autres?',
      action: 'Present neighbourhood learning to families, showcase maps and projects, demonstrate French vocabulary',
      actionFr: 'Présenter apprentissage quartier familles, présenter cartes projets, démontrer vocabulaire français',
      consolidation: 'Reflect on neighbourhood learning journey, receive good neighbour certificates, plan future community involvement',
      consolidationFr: 'Réfléchir parcours apprentissage quartier, recevoir certificats bon voisin, planifier engagement futur',
      vocabularyFr: JSON.stringify(['présenter', 'partager', 'apprendre']),
      indigenousPerspectives: 'Celebrate learning in the Indigenous tradition of sharing knowledge with the whole community and honoring the connections between all people and places.',
      assessmentNotes: '☐ Presents neighbourhood learning confidently ☐ Uses French vocabulary appropriately ☐ Demonstrates understanding of community connections',
      materials: JSON.stringify(['Presentation materials', 'Good neighbour certificates', 'Reflection journals', 'Community showcase displays'])
    });
    
    // Create all lesson plans in database
    console.log('💾 Creating Social Studies lesson plans in database...\n');
    
    let lessonCount = 0;
    for (const lessonData of lessons) {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          unitPlanId: socialStudiesUnit.id,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // All lessons are 45 minutes as specified
          grade: 1,
          subject: 'Sciences humaines',
          language: 'fr',
          
          // Three-part lesson (8 + 27 + 10 = 45 minutes)
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOnFr,
          action: lessonData.action,
          actionFr: lessonData.actionFr,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidationFr,
          
          // Planning details
          learningGoals: `Students will explore their neighbourhood community, understanding the roles of community helpers, important places, and how people connect and care for each other. French immersion vocabulary development.`,
          learningGoalsFr: `Les élèves exploreront leur communauté de quartier, comprenant les rôles des aidants communautaires, lieux importants, et comment les gens se connectent et prennent soin les uns des autres.`,
          
          materials: lessonData.materials,
          
          grouping: 'whole class discussion, partner activities, individual reflection, small group exploration',
          
          // French vocabulary
          vocabularyFr: lessonData.vocabularyFr,
          
          // Indigenous perspectives
          indigenousPerspectives: lessonData.indigenousPerspectives,
          
          // Assessment notes with checkboxes as requested
          assessmentNotes: lessonData.assessmentNotes,
          assessmentType: 'formative',
          
          // Differentiation strategies in JSON format as requested
          accommodations: JSON.stringify([
            'Visual supports and picture cards',
            'Extended processing time',
            'Peer partnerships for support',
            'Alternative communication methods'
          ]),
          
          modifications: JSON.stringify([
            'Simplified vocabulary and concepts',
            'Reduced written requirements',
            'Focus on participation over perfection',
            'Additional hands-on activities'
          ]),
          
          extensions: JSON.stringify([
            'Leadership roles in group activities',
            'Additional research about community',
            'Teaching younger students',
            'Creating detailed maps and projects'
          ]),
          
          differentiationStrategies: JSON.stringify({
            forStruggling: 'Visual vocabulary cards, peer supports, simplified instructions, hands-on activities, extra processing time',
            forIEP: 'Individual accommodations per IEP, modified participation expectations, alternative assessment methods',
            forELL: 'Bilingual vocabulary supports, visual aids, sentence starters, peer translation assistance',
            forAdvanced: 'Leadership roles, extended research projects, peer mentoring, complex mapping activities'
          }),
          
          // Sub-friendly
          isSubFriendly: true,
          subNotes: 'All materials organized in labeled bins, visual schedule posted, community helper photos displayed, French vocabulary cards visible, clear activity instructions with pictures'
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
      where: { unitPlanId: socialStudiesUnit.id },
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
      
      // Add a second expectation for some lessons to cover all expectations
      if (i < socialStudiesExpectations.length && socialStudiesExpectations[i + socialStudiesExpectations.length]) {
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
          unitPlanId: socialStudiesUnit.id,
          expectationId: expectation.id
        }
      });
    }
    
    console.log('\n🏘️ SOCIAL STUDIES "OUR NEIGHBOURHOOD" LESSON PLANS CREATED!');
    console.log(`✅ ${lessonCount} comprehensive Social Studies lesson plans`);
    console.log('✅ 5 weeks of daily instruction (Nov 3 - Dec 5, 2025)');
    console.log('✅ 45-minute lessons: mindsOn (8) + action (27) + consolidation (10)');
    console.log('✅ Complete unit plan: "Our Neighbourhood/Notre quartier"');
    console.log('✅ French immersion vocabulary in every lesson');
    console.log('✅ Indigenous perspectives throughout');
    console.log('✅ Comprehensive differentiation (forStruggling, forIEP, forELL, forAdvanced)');
    console.log('✅ Assessment notes with checkboxes');
    console.log('✅ Community connections and safety focus');
    console.log('✅ Materials lists and sub-friendly notes');
    console.log(`✅ All ${socialStudiesExpectations.length} Grade 1 Social Studies expectations linked`);
    console.log('\n🎉 Emily\'s students ready to explore "Our Neighbourhood" in French!');
    
  } catch (error) {
    console.error('❌ Error creating Social Studies lesson plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSocialStudiesNotreLessonPlans()
  .then(() => console.log('\n🏆 Social Studies lesson plans completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });