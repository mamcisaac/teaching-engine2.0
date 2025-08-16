import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEnergyUnit3() {
  try {
    console.log('⚡ Creating Science Unit 3: Energy in Our Lives / L\'énergie dans nos vies...\n');
    
    // Find Emily
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('Emily not found!');
      return;
    }
    
    console.log(`✅ Found user: ${emily.name} (ID: ${emily.id})`);
    
    // Unit ID for "Energy in Our Lives"
    const unitId = 'cmebyc9nh0005vjrmch1x7vfb';
    
    // Verify unit exists
    const unit = await prisma.unitPlan.findUnique({
      where: { id: unitId }
    });
    
    if (!unit) {
      console.error('Unit not found!');
      return;
    }
    
    console.log(`✅ Found unit: ${unit.title}`);
    
    // Clear any existing lessons for this unit
    console.log('🧹 Clearing existing lessons...');
    await prisma.eTFOLessonPlanExpectation.deleteMany({
      where: {
        lessonPlan: {
          unitPlanId: unitId
        }
      }
    });
    
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitId }
    });
    
    console.log('✅ Cleared existing lessons\n');
    
    console.log('Creating 16 perfect Energy lessons for October 28 - November 21, 2025...\n');
    
    // Create lessons (16 lessons from Oct 28 - Nov 21)
    const startDate = new Date('2025-10-28');
    const lessons = [];
    
    // Schedule lessons across 4 weeks (4 lessons per week)
    const weekDays = [1, 2, 4, 5]; // Monday, Tuesday, Thursday, Friday
    let currentWeek = 0;
    let dayIndex = 0;
    
    for (let i = 0; i < 16; i++) {
      const lessonDate = new Date(startDate);
      
      // Calculate which week and day
      currentWeek = Math.floor(i / 4);
      dayIndex = i % 4;
      
      // Set to correct week
      lessonDate.setDate(startDate.getDate() + (currentWeek * 7));
      
      // Adjust to correct day of week (Mon=1, Tue=2, Thu=4, Fri=5)
      const targetDay = weekDays[dayIndex];
      const currentDay = lessonDate.getDay();
      const dayDifference = targetDay - currentDay;
      lessonDate.setDate(lessonDate.getDate() + dayDifference);
      
      const lessonData = createPerfectEnergyLesson(i + 1, lessonDate, unitId, emily.id);
      lessons.push(lessonData);
    }
    
    // Create all lessons
    for (let i = 0; i < lessons.length; i++) {
      await prisma.eTFOLessonPlan.create({ data: lessons[i] });
      console.log(`✅ Created lesson ${i + 1}/16: ${lessons[i].title}`);
    }
    
    console.log('\n🎉 Energy Unit 3 created successfully!');
    console.log('16 perfect lessons featuring:');
    console.log('• 45-minute ETFO structure (8/27/10)');
    console.log('• Energy exploration and experimentation');
    console.log('• Solar energy investigations');
    console.log('• Energy conservation practices');
    console.log('• Electrical safety awareness');
    console.log('• Observable assessment with checkboxes');
    console.log('• JSON differentiation for all learners');
    console.log('• Mi\'kmaq traditional energy knowledge');
    console.log('• Science journal integration');
    console.log('• Hands-on energy experiments');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createPerfectEnergyLesson(lessonNumber, date, unitId, userId) {
  const content = getEnergyContent(lessonNumber);
  
  return {
    title: content.title,
    titleFr: content.titleFr,
    date: date,
    duration: 45, // ETFO compliant
    subject: 'Sciences de la nature',
    unitPlanId: unitId,
    userId: userId,
    grade: 1,
    language: 'fr',
    
    // ETFO Three-Part Structure with explicit timing
    mindsOn: `(8 minutes)
☐ Cercle d'enquête énergétique
☐ Question d'investigation: "${content.inquiryQuestion}"
☐ Prédictions énergétiques dans le journal de sciences
☐ Connexion aux expériences énergétiques: ${content.priorKnowledge}
☐ Vocabulaire énergétique du jour: ${content.vocabulary.map(v => v.term).join(', ')}
☐ Objectif d'apprentissage énergétique partagé`,

    mindsOnFr: `(8 minutes)
☐ Cercle d'enquête énergétique
☐ Question d'investigation: "${content.inquiryQuestion}"
☐ Prédictions énergétiques dans le journal de sciences
☐ Connexion aux expériences énergétiques: ${content.priorKnowledge}
☐ Vocabulaire énergétique du jour: ${content.vocabulary.map(v => v.term).join(', ')}
☐ Objectif d'apprentissage énergétique partagé`,
    
    action: `(27 minutes)
Partie 1 - Exploration énergétique guidée (10 minutes):
☐ Démonstration de sécurité: ${content.safetyFocus}
☐ Introduction du matériel d'expérimentation énergétique
☐ Modélisation de l'observation scientifique de l'énergie
☐ Questions pour guider l'enquête énergétique

Partie 2 - Investigation énergétique pratique (12 minutes):
☐ ${content.investigation}
☐ Observation et documentation énergétique (dessins et mots)
☐ Collecte de données énergétiques en équipes
☐ Circulation et questionnement énergétique par l'enseignant
☐ Support pour le vocabulaire énergétique scientifique

Partie 3 - Analyse énergétique et discussion (5 minutes):
☐ Partage des découvertes énergétiques en petits groupes
☐ Comparaison des observations d'énergie
☐ Identification de motifs énergétiques ou tendances
☐ Connexion aux concepts d'énergie scientifiques`,

    actionFr: `(27 minutes)
Partie 1 - Exploration énergétique guidée (10 minutes):
☐ Démonstration de sécurité: ${content.safetyFocus}
☐ Introduction du matériel d'expérimentation énergétique
☐ Modélisation de l'observation scientifique de l'énergie
☐ Questions pour guider l'enquête énergétique

Partie 2 - Investigation énergétique pratique (12 minutes):
☐ ${content.investigation}
☐ Observation et documentation énergétique (dessins et mots)
☐ Collecte de données énergétiques en équipes
☐ Circulation et questionnement énergétique par l'enseignant
☐ Support pour le vocabulaire énergétique scientifique

Partie 3 - Analyse énergétique et discussion (5 minutes):
☐ Partage des découvertes énergétiques en petits groupes
☐ Comparaison des observations d'énergie
☐ Identification de motifs énergétiques ou tendances
☐ Connexion aux concepts d'énergie scientifiques`,
    
    consolidation: `(10 minutes)
☐ Cercle de partage énergétique scientifique
☐ ${content.consolidationActivity}
☐ Entrée énergétique dans le journal de sciences
☐ Révision du vocabulaire énergétique avec gestes
☐ Auto-évaluation énergétique: "Qu'est-ce que j'ai appris sur l'énergie?" (✓ beaucoup / ~ un peu / ? j'ai des questions)
☐ Aperçu de la prochaine investigation énergétique`,

    consolidationFr: `(10 minutes)
☐ Cercle de partage énergétique scientifique
☐ ${content.consolidationActivity}
☐ Entrée énergétique dans le journal de sciences
☐ Révision du vocabulaire énergétique avec gestes
☐ Auto-évaluation énergétique: "Qu'est-ce que j'ai appris sur l'énergie?" (✓ beaucoup / ~ un peu / ? j'ai des questions)
☐ Aperçu de la prochaine investigation énergétique`,
    
    learningGoals: content.learningGoal,
    learningGoalsFr: content.learningGoal,
    
    materials: [
      'Journaux de sciences énergétiques individuels',
      'Crayons et crayons de couleur',
      ...content.specificMaterials,
      'Matériel de sécurité électrique',
      'Loupes pour observation énergétique',
      'Contenants d\'expérimentation',
      'Tableau de données énergétiques de classe',
      'Affiches de sécurité énergétique',
      'Appareil photo/tablette pour documentation énergétique'
    ],

    vocabularyFr: content.vocabulary.reduce((acc, v) => {
      acc[v.term] = v.definition;
      return acc;
    }, {}),
    
    assessmentNotes: `Évaluation formative - Observation énergétique scientifique:
☐ Pose des questions d'enquête énergétique pertinentes
☐ Fait des observations détaillées sur l'énergie
☐ Utilise le vocabulaire énergétique scientifique: ${content.vocabulary.map(v => v.term).join(', ')}
☐ Enregistre les données énergétiques dans le journal
☐ Communique les découvertes énergétiques clairement
☐ Suit les consignes de sécurité énergétique

Niveaux de compétence énergétique scientifique:
☐ Émergent: Observe l'énergie avec beaucoup de guidage
☐ En développement: Fait des observations énergétiques de base
☐ Compétent: Observe et enregistre l'énergie de façon autonome
☐ Avancé: Fait des connexions énergétiques et pose des questions approfondies`,
    
    assessmentType: 'formative',
    
    differentiationStrategies: {
      forStruggling: "Partenaire pour l'observation énergétique, outils d'enregistrement simplifiés (dessins seulement), vocabulaire énergétique réduit, manipulation guidée du matériel énergétique, temps supplémentaire pour l'exploration énergétique",
      forIEP: "Adaptations selon le PEI: outils technologiques pour documentation énergétique, support individuel pour manipulation énergétique, pauses sensorielles, espace calme pour observation énergétique, communication alternative acceptée",
      forELL: "Vocabulaire énergétique scientifique avec images, étiquettes bilingues énergétiques, partenaire qui traduit les concepts d'énergie, gestes pour concepts énergétiques, connexions énergétiques avec expériences personnelles",
      forAdvanced: "Questions d'enquête énergétique supplémentaires, rôle de scientifique énergétique en chef, création d'expériences énergétiques additionnelles, recherche énergétique indépendante, présentation des découvertes énergétiques"
    },
    
    indigenousPerspectives: content.indigenousPerspective,
    
    accommodations: {
      visual: "Étiquettes visuelles pour tout le matériel énergétique, codes couleur pour organisation énergétique, agrandissement des feuilles d'observation énergétique",
      auditory: "Instructions verbales répétées pour sécurité énergétique, signaux visuels pour transitions énergétiques, environnement calme pour observation énergétique",
      kinesthetic: "Manipulation maximale du matériel énergétique, stations debout pour expériences, mouvements pour vocabulaire énergétique, pauses actives entre observations énergétiques"
    },
    
    modifications: {
      content: "Nombre d'observations énergétiques ajusté, concepts énergétiques simplifiés au besoin",
      process: "Méthodes d'enregistrement énergétique variées, temps flexible pour expériences, support individuel énergétique",
      product: "Options pour démontrer l'apprentissage énergétique: dessin, oral, démonstration, construction énergétique"
    },
    
    engagementHooks: {
      opening: content.hook,
      questioning: ["Qu'est-ce que tu remarques sur l'énergie?", "Pourquoi penses-tu que cette énergie...?", "Que se passerait-il si nous changions l'énergie?"],
      wonderWall: "Ajouter des questions énergétiques au mur des merveilles scientifiques"
    },
    
    priorKnowledgeCheck: content.priorKnowledge,
    
    reflectionActivities: {
      student: "Dessine et écris ta découverte énergétique préférée dans ton journal",
      teacher: "Noter les misconceptions énergétiques à adresser, planifier les prochaines investigations énergétiques basées sur les intérêts observés"
    },
    
    formativeCheckpoints: {
      duringExploration: "Vérifier la manipulation sécuritaire énergétique et l'observation active de l'énergie",
      duringRecording: "Supporter l'utilisation du vocabulaire énergétique et la documentation",
      duringSharing: "Évaluer la communication des découvertes énergétiques"
    }
  };
}

function getEnergyContent(lessonNumber) {
  const contents = [
    // Week 1: Introduction to Energy (Oct 28 - Nov 1)
    {
      title: "Leçon 1: Qu'est-ce que l'énergie?",
      titleFr: "Leçon 1: Qu'est-ce que l'énergie?",
      inquiryQuestion: "Qu'est-ce qui fait bouger les choses autour de nous?",
      priorKnowledge: "Les élèves bougent et voient des choses bouger",
      vocabulary: [
        { term: "énergie", definition: "ce qui fait bouger ou changer" },
        { term: "mouvement", definition: "action de bouger" },
        { term: "force", definition: "ce qui pousse ou tire" }
      ],
      safetyFocus: "Règles de base pour l'exploration sécuritaire de l'énergie",
      investigation: "Explorer différentes façons de faire bouger des objets (pousser, tirer, souffler)",
      consolidationActivity: "Créer notre affiche 'L'énergie fait bouger les choses'",
      specificMaterials: ["Ballons", "Balles de différentes tailles", "Ressorts", "Élastiques", "Aimants"],
      learningGoal: "Les élèves comprendront que l'énergie est nécessaire pour créer le mouvement",
      hook: "Boîte mystérieuse qui bouge toute seule - qu'est-ce qui la fait bouger?",
      indigenousPerspective: "Les Mi'kmaq comprennent l'énergie comme la force vitale qui anime tout dans la création. Le vent, l'eau, le feu et la terre contiennent tous des énergies puissantes que nos ancêtres respectaient et utilisaient avec sagesse. Cette énergie sacrée nous connecte tous dans le cercle de la vie et nous enseigne l'interdépendance."
    },
    {
      title: "Leçon 2: L'énergie autour de nous",
      titleFr: "Leçon 2: L'énergie autour de nous",
      inquiryQuestion: "Où voyons-nous l'énergie dans notre classe?",
      priorKnowledge: "L'énergie fait bouger les choses",
      vocabulary: [
        { term: "lumière", definition: "énergie qui nous aide à voir" },
        { term: "son", definition: "énergie que nous entendons" },
        { term: "chaleur", definition: "énergie qui nous réchauffe" }
      ],
      safetyFocus: "Ne pas toucher les prises électriques",
      investigation: "Chasse aux énergies dans la classe (lumières, sons, chaleur)",
      consolidationActivity: "Carte des énergies de notre classe",
      specificMaterials: ["Lampes de poche", "Objets qui font du bruit", "Thermomètre simple", "Autocollants colorés"],
      learningGoal: "Les élèves identifieront différentes formes d'énergie dans leur environnement",
      hook: "Détective d'énergie avec lunettes spéciales!",
      indigenousPerspective: "Les Mi'kmaq reconnaissent l'énergie dans tous les aspects de la nature - le chant des oiseaux, la chaleur du soleil, la lumière des étoiles. Chaque son, chaque lumière raconte une histoire et a un but dans l'équilibre naturel. Nous apprenons à écouter et observer ces énergies avec le même respect que nos ancêtres."
    },
    {
      title: "Leçon 3: L'énergie lumineuse",
      titleFr: "Leçon 3: L'énergie lumineuse",
      inquiryQuestion: "D'où vient la lumière et comment nous aide-t-elle?",
      priorKnowledge: "La lumière nous aide à voir",
      vocabulary: [
        { term: "brillant", definition: "qui donne beaucoup de lumière" },
        { term: "sombre", definition: "qui a peu de lumière" },
        { term: "ombre", definition: "zone sans lumière" }
      ],
      safetyFocus: "Ne jamais regarder directement le soleil ou les lumières très fortes",
      investigation: "Créer des ombres avec différentes sources de lumière",
      consolidationActivity: "Théâtre d'ombres avec nos découvertes",
      specificMaterials: ["Lampes de poche", "Objets variés", "Écran blanc", "Papier coloré transparent"],
      learningGoal: "Les élèves exploreront les propriétés et sources de l'énergie lumineuse",
      hook: "Spectacle de lumière magique dans une classe obscure!",
      indigenousPerspective: "Pour les Mi'kmaq, la lumière du soleil est un cadeau sacré du Créateur qui donne la vie à toutes les plantes et nous réchauffe. Les feux traditionnels apportaient lumière et chaleur pour les cérémonies et la survie. Nous honorons la lumière comme source de vie et guide spirituel dans notre voyage."
    },
    {
      title: "Leçon 4: L'énergie sonore",
      titleFr: "Leçon 4: L'énergie sonore",
      inquiryQuestion: "Comment les sons sont-ils créés et comment voyagent-ils?",
      priorKnowledge: "Nous entendons différents sons",
      vocabulary: [
        { term: "vibration", definition: "mouvement très rapide" },
        { term: "fort", definition: "son avec beaucoup d'énergie" },
        { term: "doux", definition: "son avec peu d'énergie" }
      ],
      safetyFocus: "Protéger nos oreilles des sons trop forts",
      investigation: "Explorer comment les objets vibrent pour créer des sons",
      consolidationActivity: "Orchestre de la classe avec instruments faits maison",
      specificMaterials: ["Élastiques", "Boîtes vides", "Grains de riz", "Tambours improvisés", "Bouchons d'oreilles"],
      learningGoal: "Les élèves comprendront que le son est créé par les vibrations",
      hook: "Téléphone magique avec cordes pour parler à distance!",
      indigenousPerspective: "Les sons des tambours Mi'kmaq portent les prières vers le Créateur et connectent la communauté dans la célébration. Chaque animal, chaque élément de la nature a sa propre voix qui enseigne et guide. En écoutant attentivement, nous apprenons les leçons que la nature partage à travers ses sons sacrés."
    },

    // Week 2: Energy Sources (Nov 4 - Nov 8)
    {
      title: "Leçon 5: L'énergie du soleil",
      titleFr: "Leçon 5: L'énergie du soleil",
      inquiryQuestion: "Comment le soleil nous donne-t-il de l'énergie?",
      priorKnowledge: "Le soleil nous réchauffe et éclaire",
      vocabulary: [
        { term: "solaire", definition: "qui vient du soleil" },
        { term: "réchauffer", definition: "devenir plus chaud" },
        { term: "rayons", definition: "lumière qui voyage" }
      ],
      safetyFocus: "Protection solaire et observation sécuritaire du soleil",
      investigation: "Expériences avec l'énergie solaire (réchauffer l'eau, sécher des objets)",
      consolidationActivity: "Journal de l'énergie solaire pendant la journée",
      specificMaterials: ["Bouteilles d'eau", "Thermomètres", "Papier noir et blanc", "Lunettes de soleil", "Chronomètre"],
      learningGoal: "Les élèves découvriront comment l'énergie solaire affecte notre environnement",
      hook: "Cuisinière solaire magique pour réchauffer notre collation!",
      indigenousPerspective: "Le soleil est le grand-père dans la tradition Mi'kmaq, source de toute vie et énergie sur Terre. Les ancêtres suivaient le soleil pour savoir quand planter, récolter et voyager. Cette énergie sacrée nourrit nos corps, nos esprits et nos âmes. Nous remercions chaque jour pour ce cadeau généreux."
    },
    {
      title: "Leçon 6: L'énergie du vent",
      titleFr: "Leçon 6: L'énergie du vent",
      inquiryQuestion: "Comment pouvons-nous utiliser la force du vent?",
      priorKnowledge: "Le vent peut pousser les choses",
      vocabulary: [
        { term: "vent", definition: "air qui bouge" },
        { term: "pousser", definition: "faire avancer avec force" },
        { term: "voile", definition: "tissu qui attrape le vent" }
      ],
      safetyFocus: "Faire attention au vent fort dehors",
      investigation: "Construire des moulins à vent et tester leur efficacité",
      consolidationActivity: "Course de voitures à voile dans la cour",
      specificMaterials: ["Papier construction", "Épingles", "Bâtonnets", "Petites voitures", "Tissus légers", "Sèche-cheveux"],
      learningGoal: "Les élèves comprendront comment l'énergie éolienne peut être capturée et utilisée",
      hook: "Défi ingénieur: créer la meilleure machine à vent!",
      indigenousPerspective: "Les Mi'kmaq lisaient les vents pour naviguer sur l'océan et prédire la météo. Chaque direction de vent apportait des messages différents et guidait les décisions importantes. Le vent porte nos prières et connecte tous les êtres vivants. Nous respectons sa puissance et apprenons de sa sagesse."
    },
    {
      title: "Leçon 7: L'énergie de l'eau",
      titleFr: "Leçon 7: L'énergie de l'eau",
      inquiryQuestion: "Comment l'eau en mouvement peut-elle faire du travail?",
      priorKnowledge: "L'eau peut couler et pousser",
      vocabulary: [
        { term: "couler", definition: "l'eau qui se déplace" },
        { term: "courant", definition: "eau qui bouge vite" },
        { term: "roue", definition: "objet rond qui tourne" }
      ],
      safetyFocus: "Rester loin des rivières rapides, attention aux éclaboussures",
      investigation: "Construire des roues à eau simples et observer leur rotation",
      consolidationActivity: "Démonstration de mini-centrale hydraulique",
      specificMaterials: ["Contenants d'eau", "Cuillères en plastique", "Bâtonnets", "Tubes", "Entonnoirs", "Serviettes"],
      learningGoal: "Les élèves exploreront comment l'énergie hydraulique peut être transformée en mouvement",
      hook: "Rivière miniature dans la classe avec moulin magique!",
      indigenousPerspective: "L'eau est sacrée pour les Mi'kmaq - c'est le sang de la Terre Mère qui donne la vie. Les chutes d'eau et rivières rapides étaient des lieux de pouvoir spirituel et des sources d'énergie pour moudre le grain. Nous respectons l'eau comme force de vie qui nettoie, nourrit et énergise notre monde."
    },
    {
      title: "Leçon 8: La nourriture comme énergie",
      titleFr: "Leçon 8: La nourriture comme énergie",
      inquiryQuestion: "Comment la nourriture nous donne-t-elle de l'énergie?",
      priorKnowledge: "Nous mangeons pour grandir et être forts",
      vocabulary: [
        { term: "carburant", definition: "ce qui donne de l'énergie" },
        { term: "grandir", definition: "devenir plus grand" },
        { term: "fort", definition: "avoir beaucoup d'énergie" }
      ],
      safetyFocus: "Hygiène alimentaire et allergies",
      investigation: "Comparer notre énergie avant et après la collation",
      consolidationActivity: "Pyramide des aliments énergétiques",
      specificMaterials: ["Collations saines", "Graphiques d'énergie", "Images d'aliments", "Balance simple"],
      learningGoal: "Les élèves comprendront que la nourriture fournit l'énergie nécessaire à leur corps",
      hook: "Test de super-héros: quelle nourriture nous donne le plus de pouvoir?",
      indigenousPerspective: "Les Mi'kmaq honoraient chaque animal et plante qui donnait sa vie pour nourrir le peuple. Les cérémonies de gratitude reconnaissaient que toute nourriture est énergie sacrée transformée. Les ancêtres savaient quels aliments donnaient force pour chasser, sagesse pour décider, et endurance pour voyager. Nous remercions pour chaque repas."
    },

    // Week 3: Using Energy (Nov 11 - Nov 15)
    {
      title: "Leçon 9: L'énergie à l'école",
      titleFr: "Leçon 9: L'énergie à l'école",
      inquiryQuestion: "Comment utilisons-nous l'énergie dans notre école?",
      priorKnowledge: "Il y a des lumières et des ordinateurs à l'école",
      vocabulary: [
        { term: "électricité", definition: "énergie qui voyage dans les fils" },
        { term: "brancher", definition: "connecter à l'électricité" },
        { term: "utiliser", definition: "se servir de quelque chose" }
      ],
      safetyFocus: "Sécurité électrique absolue - ne jamais toucher les prises",
      investigation: "Audit énergétique de l'école (compter les lumières, ordinateurs, etc.)",
      consolidationActivity: "Carte énergétique de notre école",
      specificMaterials: ["Tablettes à pince", "Crayons", "Autocollants de couleurs", "Plan de l'école"],
      learningGoal: "Les élèves identifieront les utilisations de l'énergie dans leur environnement scolaire",
      hook: "Mission détective: trouvez tous les appareils énergétiques!",
      indigenousPerspective: "Les Mi'kmaq utilisaient l'énergie naturelle pour leurs besoins - feu pour cuisiner et se réchauffer, vent pour voyager, eau pour transporter. Chaque utilisation d'énergie était réfléchie et respectueuse. Nous apprenons cette même sagesse en comprenant comment notre école utilise l'énergie et comment nous pouvons être responsables."
    },
    {
      title: "Leçon 10: L'énergie à la maison",
      titleFr: "Leçon 10: L'énergie à la maison",
      inquiryQuestion: "Quelles énergies utilisons-nous chez nous?",
      priorKnowledge: "Il y a des appareils qui fonctionnent à la maison",
      vocabulary: [
        { term: "appareil", definition: "machine qui aide" },
        { term: "cuisiner", definition: "préparer la nourriture" },
        { term: "éclairer", definition: "donner de la lumière" }
      ],
      safetyFocus: "Règles de sécurité énergétique à la maison",
      investigation: "Dessiner et classer les appareils énergétiques de la maison",
      consolidationActivity: "Présentation 'Ma maison énergétique'",
      specificMaterials: ["Magazines avec appareils", "Papier grand format", "Ciseaux sécuritaires", "Colle"],
      learningGoal: "Les élèves reconnaîtront l'utilisation de l'énergie dans la vie quotidienne",
      hook: "Construire la maison du futur avec toutes ses énergies!",
      indigenousPerspective: "Dans les wigwams traditionnels Mi'kmaq, chaque source d'énergie avait sa place sacrée - le feu central pour chaleur et lumière, l'orientation vers le soleil levant pour énergie spirituelle. La famille travaillait ensemble pour conserver et respecter l'énergie. Ces traditions nous enseignent la coopération et la gratitude énergétique."
    },
    {
      title: "Leçon 11: Machines simples et énergie",
      titleFr: "Leçon 11: Machines simples et énergie",
      inquiryQuestion: "Comment les machines nous aident-elles à utiliser notre énergie?",
      priorKnowledge: "Certains outils rendent le travail plus facile",
      vocabulary: [
        { term: "machine", definition: "outil qui aide au travail" },
        { term: "levier", definition: "bâton qui aide à soulever" },
        { term: "facile", definition: "qui demande moins d'effort" }
      ],
      safetyFocus: "Utilisation sécuritaire des outils simples",
      investigation: "Tester des leviers, roues et poulies simples",
      consolidationActivity: "Défi: déplacer un objet lourd avec différentes machines",
      specificMaterials: ["Planches", "Supports", "Poulies simples", "Cordes", "Objets à déplacer", "Roues"],
      learningGoal: "Les élèves découvriront comment les machines simples transforment l'énergie",
      hook: "Défi de l'architecte: construire la meilleure machine!",
      indigenousPerspective: "Les Mi'kmaq créaient des outils ingénieux qui multipliaient leur force - leviers pour déplacer les roches, poulies pour hisser les canots, roues pour transporter. Chaque outil était fabriqué avec respect pour l'arbre ou la pierre qui donnait sa vie. Ces innovations montrent la sagesse de travailler avec la nature, pas contre elle."
    },
    {
      title: "Leçon 12: L'énergie humaine et mouvement",
      titleFr: "Leçon 12: L'énergie humaine et mouvement",
      inquiryQuestion: "Comment notre corps utilise-t-il l'énergie pour bouger?",
      priorKnowledge: "Nous bougeons avec nos muscles",
      vocabulary: [
        { term: "muscle", definition: "partie du corps qui bouge" },
        { term: "battre", definition: "mouvement du cœur" },
        { term: "respirer", definition: "prendre de l'air" }
      ],
      safetyFocus: "Échauffement avant l'exercice, hydratation",
      investigation: "Mesurer notre pouls et respiration avant/après l'exercice",
      consolidationActivity: "Démonstration de notre 'moteur humain'",
      specificMaterials: ["Chronomètres", "Graphiques de données", "Miroirs", "Bouteilles d'eau"],
      learningGoal: "Les élèves comprendront comment leur corps transforme l'énergie en mouvement",
      hook: "Devenir des machines humaines et découvrir notre moteur!",
      indigenousPerspective: "Les Mi'kmaq comprenaient le corps comme un cadeau sacré du Créateur, temple de l'esprit qui doit être honoré et soigné. Les danses traditionnelles célébraient l'énergie vitale et connectaient le peuple aux rythmes de la terre. Chaque mouvement avait un sens spirituel et énergétique profond dans la culture."
    },

    // Week 4: Saving Energy (Nov 18 - Nov 21)
    {
      title: "Leçon 13: Conservation d'énergie",
      titleFr: "Leçon 13: Conservation d'énergie",
      inquiryQuestion: "Comment pouvons-nous économiser l'énergie?",
      priorKnowledge: "Parfois nous gaspillons l'énergie",
      vocabulary: [
        { term: "économiser", definition: "utiliser moins" },
        { term: "gaspiller", definition: "utiliser sans besoin" },
        { term: "éteindre", definition: "arrêter une machine" }
      ],
      safetyFocus: "Demander à un adulte avant d'éteindre des appareils",
      investigation: "Identifier le gaspillage d'énergie et proposer des solutions",
      consolidationActivity: "Création d'affiches 'Économisons l'énergie'",
      specificMaterials: ["Papier d'affiche", "Marqueurs", "Autocollants", "Appareils photo"],
      learningGoal: "Les élèves développeront des stratégies pour conserver l'énergie",
      hook: "Mission sauvetage: sauver l'énergie de l'école!",
      indigenousPerspective: "Les Mi'kmaq vivaient selon le principe de prendre seulement ce qui était nécessaire et d'utiliser chaque partie de ce qui était pris. Cette philosophie de non-gaspillage respectait l'énergie de tous les êtres vivants. Nous apprenons cette sagesse ancienne pour protéger les ressources énergétiques pour les sept générations futures."
    },
    {
      title: "Leçon 14: Audit énergétique de la classe",
      titleFr: "Leçon 14: Audit énergétique de la classe",
      inquiryQuestion: "Combien d'énergie utilise notre classe?",
      priorKnowledge: "Notre classe utilise différentes énergies",
      vocabulary: [
        { term: "audit", definition: "compter soigneusement" },
        { term: "mesurer", definition: "trouver la quantité" },
        { term: "rapport", definition: "document qui explique" }
      ],
      safetyFocus: "Observer seulement, ne pas toucher aux appareils électriques",
      investigation: "Compter et documenter tous les usages d'énergie de la classe",
      consolidationActivity: "Créer notre rapport d'audit énergétique",
      specificMaterials: ["Tableaux de données", "Calculatrices simples", "Appareils photo", "Graphiques"],
      learningGoal: "Les élèves conduiront un audit énergétique systématique",
      hook: "Inspecteurs énergétiques officiels de la classe!",
      indigenousPerspective: "Les Mi'kmaq étaient des observateurs méticuleux qui suivaient les cycles énergétiques de la nature - migration des animaux, croissance des plantes, changements des marées. Cette attention aux détails assurait la survie et la prospérité. Nous appliquons cette même observation attentive à notre utilisation moderne de l'énergie."
    },
    {
      title: "Leçon 15: Plan d'énergie de la classe",
      titleFr: "Leçon 15: Plan d'énergie de la classe",
      inquiryQuestion: "Comment notre classe peut-elle devenir plus efficace énergétiquement?",
      priorKnowledge: "Nous savons comment économiser l'énergie",
      vocabulary: [
        { term: "plan", definition: "idées organisées pour agir" },
        { term: "efficace", definition: "qui marche bien" },
        { term: "améliorer", definition: "rendre mieux" }
      ],
      safetyFocus: "Suivre le plan avec supervision d'adultes",
      investigation: "Développer et tester des stratégies d'économie d'énergie",
      consolidationActivity: "Présenter notre plan énergétique à d'autres classes",
      specificMaterials: ["Papier grand format", "Marqueurs colorés", "Minuteries", "Graphiques de suivi"],
      learningGoal: "Les élèves créeront un plan d'action pour l'efficacité énergétique",
      hook: "Architectes du futur: concevoir la classe énergétique parfaite!",
      indigenousPerspective: "Les conseils Mi'kmaq planifiaient soigneusement l'utilisation des ressources pour assurer la durabilité. Chaque décision considérait l'impact sur sept générations futures. Cette sagesse de planification à long terme nous guide pour créer des solutions énergétiques responsables qui honorent notre devoir envers les générations à venir."
    },
    {
      title: "Leçon 16: Célébration de l'énergie",
      titleFr: "Leçon 16: Célébration de l'énergie",
      inquiryQuestion: "Comment pouvons-nous partager nos connaissances énergétiques?",
      priorKnowledge: "Nous avons appris beaucoup sur l'énergie",
      vocabulary: [
        { term: "célébrer", definition: "honorer nos accomplissements" },
        { term: "partager", definition: "donner nos connaissances" },
        { term: "expert", definition: "personne qui sait beaucoup" }
      ],
      safetyFocus: "Sécurité lors des démonstrations énergétiques",
      investigation: "Préparer des démonstrations énergétiques pour les visiteurs",
      consolidationActivity: "Foire énergétique de la classe avec expériences",
      specificMaterials: ["Stations d'expériences", "Travaux des élèves", "Matériel de démonstration", "Invitations"],
      learningGoal: "Les élèves partageront leur expertise énergétique avec la communauté scolaire",
      hook: "Festival de l'énergie: devenez les professeurs d'énergie!",
      indigenousPerspective: "Les Mi'kmaq célébraient les cycles énergétiques de la nature par des pow-wows et cérémonies qui honoraient le soleil, la lune, les saisons. Partager les connaissances était une responsabilité sacrée pour assurer que la sagesse continue. Notre célébration honore notre apprentissage et notre engagement à protéger l'énergie pour tous."
    }
  ];
  
  return contents[lessonNumber - 1] || contents[0];
}

createEnergyUnit3();