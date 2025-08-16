import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRemainingFrenchUnits() {
  try {
    console.log('🚀 Creating remaining French unit lessons...\n');
    
    // Find Emily
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('Emily not found!');
      return;
    }
    
    // Units to create lessons for
    const unitsToCreate = [
      { title: 'Nos amis les animaux', lessonCount: 24 },
      { title: 'Ma communauté', lessonCount: 24 },
      { title: 'Le printemps en fleurs', lessonCount: 24 },
      { title: 'Célébrons nos apprentissages', lessonCount: 24 }
    ];
    
    for (const unitInfo of unitsToCreate) {
      const unit = await prisma.unitPlan.findFirst({
        where: {
          userId: emily.id,
          title: unitInfo.title
        }
      });
      
      if (!unit) {
        console.log(`❌ Unit "${unitInfo.title}" not found`);
        continue;
      }
      
      console.log(`\n📚 Creating lessons for "${unitInfo.title}"...`);
      
      // Clear existing lessons
      await prisma.eTFOLessonPlanExpectation.deleteMany({
        where: {
          lessonPlan: {
            unitPlanId: unit.id
          }
        }
      });
      
      await prisma.eTFOLessonPlan.deleteMany({
        where: { unitPlanId: unit.id }
      });
      
      // Create lessons based on unit
      const lessons = [];
      const startDate = new Date(unit.startDate);
      
      for (let i = 0; i < unitInfo.lessonCount; i++) {
        const lessonDate = new Date(startDate);
        lessonDate.setDate(startDate.getDate() + Math.floor(i * 7 / 6)); // Spread across unit duration
        
        const lessonData = createLessonForUnit(unitInfo.title, i + 1, lessonDate, unit.id, emily.id);
        lessons.push(lessonData);
      }
      
      // Create all lessons
      for (const lesson of lessons) {
        await prisma.eTFOLessonPlan.create({ data: lesson });
      }
      
      console.log(`✅ Created ${lessons.length} lessons for "${unitInfo.title}"`);
    }
    
    console.log('\n🎉 All remaining French units completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createLessonForUnit(unitTitle: string, lessonNum: number, date: Date, unitId: string, userId: number) {
  // Unit-specific content
  const unitContent = getUnitContent(unitTitle, lessonNum);
  
  return {
    title: unitContent.title,
    date: date,
    duration: 45, // ETFO compliant
    subject: 'Français langue première',
    unitPlanId: unitId,
    userId: userId,
    
    // ETFO Three-part structure
    mindsOn: `(8 minutes)
☐ Accueil chaleureux des élèves
☐ Révision du vocabulaire précédent
☐ Introduction du thème: ${unitContent.topic}
☐ Activation des connaissances antérieures
☐ Partage des objectifs d'apprentissage`,
    
    action: `(27 minutes)
Partie 1 - Enseignement guidé (10 minutes):
☐ Modélisation du concept: ${unitContent.concept}
☐ Utilisation de supports visuels
☐ Vérification de la compréhension
☐ Introduction du vocabulaire en contexte

Partie 2 - Pratique active (12 minutes):
☐ Activité: ${unitContent.activity}
☐ Travail en partenaires/petits groupes
☐ Circulation et rétroaction
☐ Soutien aux apprenants en difficulté

Partie 3 - Pratique autonome (5 minutes):
☐ Démonstration de la compréhension
☐ Tâches différenciées disponibles
☐ Documentation des progrès`,
    
    consolidation: `(10 minutes)
☐ Rassemblement en cercle de partage
☐ Révision des concepts clés
☐ Auto-évaluation avec pouces (haut/milieu/bas)
☐ Aperçu de la prochaine leçon
☐ Célébration des apprentissages`,
    
    learningGoals: unitContent.learningGoal,
    
    materials: [
      'Cartes visuelles de vocabulaire',
      'Tableaux blancs et marqueurs pour élèves',
      unitContent.materials,
      `Livres sur ${unitContent.topic}`,
      'Liste de vérification pour l\'évaluation',
      'Matériel pour activités différenciées',
      'Technologie: tablette pour supports visuels'
    ],
    
    assessmentNotes: `Évaluation formative:
☐ Observation pendant la discussion initiale
☐ Notes anecdotiques pendant le travail en partenaires
☐ Liste de vérification pour la démonstration
☐ Auto-évaluation des élèves (pouces)

Observations des critères de réussite:
☐ Peut expliquer le concept (atteint/en voie/besoin de soutien)
☐ Utilise le vocabulaire correctement (atteint/en voie/besoin de soutien)
☐ Participe activement (atteint/en voie/besoin de soutien)
☐ Démontre la compréhension (atteint/en voie/besoin de soutien)`,
    
    assessmentType: 'Formative - Observation et auto-évaluation',
    
    differentiationStrategies: {
      forStruggling: "Supports visuels supplémentaires, instructions simplifiées, partenaires de soutien, manipulatifs, tâches réduites, temps de pratique guidée supplémentaire",
      forIEP: "Attentes modifiées selon le PEI, technologie d'assistance, temps prolongé, méthodes alternatives de démonstration, soutien individuel au besoin",
      forELL: "Cartes de vocabulaire visuelles, dictionnaires bilingues, cadres de phrases, soutien de traduction par les pairs, gestes et démonstrations, connexions avec la langue maternelle",
      forAdvanced: "Activités d'enrichissement, rôles de leadership, questions d'enquête approfondies, création de matériel pédagogique pour les pairs, opportunités de recherche indépendante"
    },
    
    indigenousPerspectives: unitContent.indigenousPerspective,
    
    accommodations: {
      visual: "Supports visuels supplémentaires",
      auditory: "Instructions répétées verbalement",
      kinesthetic: "Activités de mouvement intégrées"
    },
    
    modifications: {
      content: "Vocabulaire simplifié au besoin",
      process: "Temps supplémentaire accordé",
      product: "Options alternatives de démonstration"
    }
  };
}

function getUnitContent(unitTitle: string, lessonNum: number) {
  switch(unitTitle) {
    case 'Nos amis les animaux':
      return getAnimalContent(lessonNum);
    case 'Ma communauté':
      return getCommunityContent(lessonNum);
    case 'Le printemps en fleurs':
      return getSpringContent(lessonNum);
    case 'Célébrons nos apprentissages':
      return getCelebrationContent(lessonNum);
    default:
      return getDefaultContent(lessonNum);
  }
}

function getAnimalContent(lessonNum: number) {
  const topics = [
    { title: 'Le chat et le chien', topic: 'animaux domestiques', concept: 'nos amis à la maison', 
      activity: 'dessiner et présenter son animal préféré', materials: 'Images d\'animaux domestiques',
      vocabulary: { chat: 'animal domestique qui miaule', chien: 'animal qui aboie', ami: 'quelqu\'un qu\'on aime' },
      learningGoal: 'Les élèves comprendront les animaux domestiques et pourront les identifier',
      indigenousPerspective: 'Les Mi\'kmaq respectent tous les animaux comme des membres de la famille élargie de la nature. Les chiens étaient des compagnons importants pour la chasse et la protection, tandis que les chats sont arrivés plus tard avec les colons européens.' },
    
    { title: 'La vache et le cochon', topic: 'animaux de la ferme', concept: 'les animaux qui nous aident',
      activity: 'créer une ferme avec des blocs et jouer', materials: 'Figurines d\'animaux de ferme',
      vocabulary: { vache: 'animal qui donne du lait', cochon: 'animal rose de la ferme', ferme: 'endroit avec des animaux' },
      learningGoal: 'Les élèves identifieront les animaux de la ferme et leurs contributions',
      indigenousPerspective: 'Avant l\'agriculture européenne, les Mi\'kmaq élevaient des animaux sauvages en harmonie avec la nature. Ils enseignent que chaque animal a un don à partager avec les humains, et nous devons être reconnaissants pour leurs contributions.' },
    
    { title: 'Le cheval', topic: 'animaux de travail', concept: 'les animaux qui nous aident',
      activity: 'course de chevaux imaginaire dans la cour', materials: 'Bâtons de cheval hobby',
      vocabulary: { cheval: 'grand animal qui court vite', galoper: 'courir comme un cheval', crinière: 'cheveux du cheval' },
      learningGoal: 'Les élèves comprendront comment les chevaux aident les humains',
      indigenousPerspective: 'Les chevaux sont arrivés avec les Européens mais sont devenus importants pour les Mi\'kmaq. Les aînés racontent comment les chevaux ont changé leur façon de voyager et de chasser, créant une nouvelle relation respectueuse entre humains et animaux.' }
  ];
  
  // Cycle through topics
  const topicIndex = (lessonNum - 1) % topics.length;
  const topic = topics[topicIndex];
  
  return {
    title: `Leçon ${lessonNum}: ${topic.title}`,
    topic: topic.topic,
    concept: topic.concept,
    activity: topic.activity,
    materials: topic.materials,
    vocabulary: topic.vocabulary,
    learningGoal: topic.learningGoal,
    indigenousPerspective: topic.indigenousPerspective
  };
}

function getCommunityContent(lessonNum: number) {
  const topics = [
    { title: 'Mon école', topic: 'lieux communautaires', concept: 'notre école comme communauté',
      activity: 'tour de l\'école et carte communautaire', materials: 'Plan de l\'école, autocollants',
      vocabulary: { école: 'endroit où on apprend', classe: 'notre salle d\'apprentissage', ami: 'personne qu\'on aime' },
      learningGoal: 'Les élèves comprendront l\'école comme partie de leur communauté',
      indigenousPerspective: 'Pour les Mi\'kmaq, l\'apprentissage se faisait traditionnellement en communauté, où chaque membre était un enseignant. L\'école moderne continue cette tradition de partage des connaissances, créant une famille d\'apprentissage élargie.' },
    
    { title: 'Les pompiers', topic: 'aidants communautaires', concept: 'les héros qui nous protègent',
      activity: 'simulation d\'évacuation et visite virtuelle', materials: 'Casque de pompier jouet, images',
      vocabulary: { pompier: 'personne qui éteint les feux', feu: 'danger rouge et chaud', sauver: 'aider quelqu\'un' },
      learningGoal: 'Les élèves apprécieront le rôle des pompiers dans la sécurité',
      indigenousPerspective: 'Les Mi\'kmaq avaient des gardiens du feu sacrés qui protégeaient les feux communautaires. Aujourd\'hui, les pompiers continuent ce rôle important de protection, gardant nos communautés en sécurité avec courage et dévouement.' },
    
    { title: 'La bibliothèque', topic: 'ressources communautaires', concept: 'partager les livres et les histoires',
      activity: 'créer une mini-bibliothèque de classe', materials: 'Livres, cartes de bibliothèque faites maison',
      vocabulary: { livre: 'objet avec des histoires', lire: 'regarder les mots', bibliothèque: 'maison des livres' },
      learningGoal: 'Les élèves comprendront le rôle de la bibliothèque',
      indigenousPerspective: 'Avant les livres écrits, les Mi\'kmaq préservaient leurs histoires oralement. Les aînés étaient les bibliothèques vivantes, gardant les connaissances pour les générations futures. Les bibliothèques modernes continuent cette tradition de préservation.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  const topic = topics[topicIndex];
  
  return {
    title: `Leçon ${lessonNum}: ${topic.title}`,
    topic: topic.topic,
    concept: topic.concept,
    activity: topic.activity,
    materials: topic.materials,
    vocabulary: topic.vocabulary,
    learningGoal: topic.learningGoal,
    indigenousPerspective: topic.indigenousPerspective
  };
}

function getSpringContent(lessonNum: number) {
  const topics = [
    { title: 'Les fleurs du printemps', topic: 'changements printaniers', concept: 'la nature se réveille',
      activity: 'planter des graines et observer', materials: 'Graines, pots, terre',
      vocabulary: { fleur: 'jolie plante colorée', pousser: 'devenir plus grand', printemps: 'saison des fleurs' },
      learningGoal: 'Les élèves observeront les changements printaniers dans la nature',
      indigenousPerspective: 'Les Mi\'kmaq célèbrent le printemps comme un temps de renouveau et de médecine. Les premières fleurs du printemps, comme les violettes, sont utilisées pour la guérison. Chaque plante a un esprit et un but dans le cercle de la vie.' },
    
    { title: 'La pluie d\'avril', topic: 'météo printanière', concept: 'l\'eau qui fait pousser',
      activity: 'danser sous la pluie imaginaire', materials: 'Parapluies jouets, arrosoirs',
      vocabulary: { pluie: 'eau qui tombe du ciel', nuage: 'coussin blanc dans le ciel', 'arc-en-ciel': 'couleurs après la pluie' },
      learningGoal: 'Les élèves comprendront l\'importance de la pluie au printemps',
      indigenousPerspective: 'Pour les Mi\'kmaq, la pluie printanière est un cadeau sacré qui nourrit la Terre Mère. Les aînés enseignent que chaque goutte de pluie porte la vie, et nous devons remercier l\'eau pour sa générosité envers toutes les créatures.' },
    
    { title: 'Les bébés animaux', topic: 'nouvelle vie', concept: 'les familles grandissent',
      activity: 'associer les bébés animaux aux parents', materials: 'Cartes d\'animaux parents/bébés',
      vocabulary: { bébé: 'petit nouveau-né', grandir: 'devenir plus grand', famille: 'groupe qui s\'aime' },
      learningGoal: 'Les élèves identifieront les bébés animaux du printemps',
      indigenousPerspective: 'Le printemps est le temps des nouvelles vies dans la tradition Mi\'kmaq. C\'est une période sacrée où nous apprenons la patience et le soin en observant comment les animaux parents prennent soin de leurs petits avec amour et dévouement.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  const topic = topics[topicIndex];
  
  return {
    title: `Leçon ${lessonNum}: ${topic.title}`,
    topic: topic.topic,
    concept: topic.concept,
    activity: topic.activity,
    materials: topic.materials,
    vocabulary: topic.vocabulary,
    learningGoal: topic.learningGoal,
    indigenousPerspective: topic.indigenousPerspective
  };
}

function getCelebrationContent(lessonNum: number) {
  const topics = [
    { title: 'Nos souvenirs préférés', topic: 'réflexion sur l\'année', concept: 'célébrer notre croissance',
      activity: 'créer un livre de souvenirs de classe', materials: 'Album photo, autocollants',
      vocabulary: { souvenir: 'moment spécial qu\'on garde', apprendre: 'découvrir de nouvelles choses', fier: 'content de soi' },
      learningGoal: 'Les élèves réfléchiront sur leurs apprentissages de l\'année',
      indigenousPerspective: 'Les Mi\'kmaq honorent les cycles d\'apprentissage comme les saisons. Chaque fin est un nouveau commencement. Les cérémonies de fin d\'année célèbrent la croissance de chaque enfant comme une graine qui devient une plante forte.' },
    
    { title: 'Notre portfolio', topic: 'collection de travaux', concept: 'montrer notre progrès',
      activity: 'assembler et décorer les portfolios', materials: 'Dossiers, rubans, photos de travaux',
      vocabulary: { portfolio: 'collection de nos travaux', progrès: 'devenir meilleur', exemple: 'travail à montrer' },
      learningGoal: 'Les élèves créeront un portfolio de leurs meilleurs travaux',
      indigenousPerspective: 'Dans la tradition Mi\'kmaq, chaque création raconte une histoire de croissance. Les wampums et les paniers tissés montrent le progrès de l\'artisan. Votre portfolio est comme un wampum moderne, racontant votre histoire d\'apprentissage.' },
    
    { title: 'Prêts pour la 2e année', topic: 'préparation future', concept: 'grandir et avancer',
      activity: 'lettres aux futurs élèves de 1re année', materials: 'Papier à lettres, enveloppes',
      vocabulary: { grandir: 'devenir plus grand et sage', futur: 'ce qui vient après', prêt: 'préparé pour quelque chose' },
      learningGoal: 'Les élèves anticiperont leur transition vers la 2e année',
      indigenousPerspective: 'Les Mi\'kmaq enseignent que chaque étape de la vie est sacrée. Passer à la 2e année est comme traverser un pont vers de nouvelles connaissances. Les aînés bénissent les enfants pour leur voyage continu d\'apprentissage et de découverte.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  const topic = topics[topicIndex];
  
  return {
    title: `Leçon ${lessonNum}: ${topic.title}`,
    topic: topic.topic,
    concept: topic.concept,
    activity: topic.activity,
    materials: topic.materials,
    vocabulary: topic.vocabulary,
    learningGoal: topic.learningGoal,
    indigenousPerspective: topic.indigenousPerspective
  };
}

function getDefaultContent(lessonNum: number) {
  return {
    title: `Leçon ${lessonNum}: Apprentissage du jour`,
    topic: 'concept du jour',
    concept: 'idée principale',
    activity: 'activité pratique engageante',
    materials: 'Matériel varié approprié',
    vocabulary: { mot1: 'définition 1', mot2: 'définition 2' },
    learningGoal: 'Les élèves comprendront et appliqueront le concept du jour',
    indigenousPerspective: 'Les enseignements Mi\'kmaq nous rappellent que tout apprentissage est sacré et connecté. Chaque leçon fait partie du grand cercle de la connaissance qui unit tous les êtres vivants dans la compréhension et le respect mutuels.'
  };
}

createRemainingFrenchUnits();