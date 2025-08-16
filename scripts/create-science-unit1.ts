import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createScienceUnit1() {
  try {
    console.log('🔬 Creating Science Unit 1: Our School Environment...\n');
    
    // Find Emily
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('Emily not found!');
      return;
    }
    
    // Unit ID for "Our School Environment"
    const unitId = 'cmebyc9nc0001vjrm7qnnwv9i';
    
    // Clear any existing lessons
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
    
    console.log('Creating 14 perfect Science lessons for September...\n');
    
    // Create lessons (14 lessons for Sept 4-26)
    const startDate = new Date('2025-09-04');
    const lessons = [];
    
    for (let i = 0; i < 14; i++) {
      const lessonDate = new Date(startDate);
      // Spread lessons across the unit period
      lessonDate.setDate(startDate.getDate() + Math.floor(i * 1.5));
      
      const lessonData = createPerfectScienceLesson(i + 1, lessonDate, unitId, emily.id);
      lessons.push(lessonData);
    }
    
    // Create all lessons
    for (let i = 0; i < lessons.length; i++) {
      await prisma.eTFOLessonPlan.create({ data: lessons[i] });
      console.log(`✅ Created lesson ${i + 1}/14: ${lessons[i].title}`);
    }
    
    console.log('\n🎉 Science Unit 1 created successfully!');
    console.log('14 perfect lessons featuring:');
    console.log('• 45-minute ETFO structure (8/27/10)');
    console.log('• Inquiry-based learning approach');
    console.log('• Hands-on experiments and explorations');
    console.log('• Science journals integration');
    console.log('• Observable assessment with checkboxes');
    console.log('• JSON differentiation for all learners');
    console.log('• Indigenous science perspectives');
    console.log('• Safety considerations documented');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createPerfectScienceLesson(lessonNumber: number, date: Date, unitId: string, userId: number) {
  const content = getScienceContent(lessonNumber);
  
  return {
    title: content.title,
    date: date,
    duration: 45, // ETFO compliant
    subject: 'Sciences de la nature',
    unitPlanId: unitId,
    userId: userId,
    grade: 1,
    language: 'fr',
    
    // ETFO Three-Part Structure with explicit timing
    mindsOn: `(8 minutes)
☐ Cercle de questionnement scientifique
☐ Question d'enquête du jour: "${content.inquiryQuestion}"
☐ Prédictions dans le journal de sciences
☐ Activation des connaissances: ${content.priorKnowledge}
☐ Introduction du vocabulaire: ${content.vocabulary.map(v => v.term).join(', ')}
☐ Objectif d'apprentissage partagé`,
    
    action: `(27 minutes)
Partie 1 - Exploration guidée (10 minutes):
☐ Démonstration de sécurité: ${content.safetyFocus}
☐ Introduction du matériel d'exploration
☐ Modélisation de l'observation scientifique
☐ Questions pour guider l'enquête

Partie 2 - Investigation pratique (12 minutes):
☐ ${content.investigation}
☐ Observation et documentation (dessins et mots)
☐ Collecte de données en équipes
☐ Circulation et questionnement par l'enseignant
☐ Support pour le vocabulaire scientifique

Partie 3 - Analyse et discussion (5 minutes):
☐ Partage des découvertes en petits groupes
☐ Comparaison des observations
☐ Identification de motifs ou tendances
☐ Connexion aux concepts scientifiques`,
    
    consolidation: `(10 minutes)
☐ Cercle de partage scientifique
☐ ${content.consolidationActivity}
☐ Entrée dans le journal de sciences
☐ Révision du vocabulaire avec gestes
☐ Auto-évaluation: "Qu'est-ce que j'ai appris?" (✓ beaucoup / ~ un peu / ? j'ai des questions)
☐ Aperçu de la prochaine investigation`,
    
    learningGoals: content.learningGoal,
    
    materials: [
      'Journaux de sciences individuels',
      'Crayons et crayons de couleur',
      ...content.specificMaterials,
      'Loupes pour observation',
      'Contenants de collecte',
      'Tableau de données de classe',
      'Affiches de sécurité',
      'Appareil photo/tablette pour documentation'
    ],
    
    assessmentNotes: `Évaluation formative - Observation scientifique:
☐ Pose des questions d'enquête pertinentes
☐ Fait des observations détaillées
☐ Utilise le vocabulaire scientifique: ${content.vocabulary.map(v => v.term).join(', ')}
☐ Enregistre les données dans le journal
☐ Communique les découvertes clairement
☐ Suit les consignes de sécurité

Niveaux de compétence scientifique:
☐ Émergent: Observe avec beaucoup de guidage
☐ En développement: Fait des observations de base
☐ Compétent: Observe et enregistre de façon autonome
☐ Avancé: Fait des connexions et pose des questions approfondies`,
    
    assessmentType: 'Formative - Observation et journal de sciences',
    
    differentiationStrategies: {
      forStruggling: "Partenaire pour l'observation, outils d'enregistrement simplifiés (dessins seulement), vocabulaire réduit, manipulation guidée du matériel, temps supplémentaire pour l'exploration",
      forIEP: "Adaptations selon le PEI: outils technologiques pour documentation, support individuel pour manipulation, pauses sensorielles, espace calme pour observation, communication alternative acceptée",
      forELL: "Vocabulaire scientifique avec images, étiquettes bilingues, partenaire qui traduit, gestes pour concepts, connexions avec expériences personnelles, langue maternelle pour réflexion",
      forAdvanced: "Questions d'enquête supplémentaires, rôle de scientifique en chef, création d'expériences additionnelles, recherche indépendante, présentation des découvertes à la classe"
    },
    
    indigenousPerspectives: content.indigenousPerspective,
    
    accommodations: {
      visual: "Étiquettes visuelles pour tout le matériel, codes couleur pour organisation, agrandissement des feuilles d'observation",
      auditory: "Instructions verbales répétées, signaux visuels pour transitions, environnement calme pour observation",
      kinesthetic: "Manipulation maximale, stations debout, mouvements pour vocabulaire, pauses actives entre observations"
    },
    
    modifications: {
      content: "Nombre d'observations ajusté, concepts simplifiés au besoin",
      process: "Méthodes d'enregistrement variées, temps flexible, support individuel",
      product: "Options pour démontrer l'apprentissage: dessin, oral, démonstration, construction"
    },
    
    engagementHooks: {
      opening: content.hook,
      questioning: ["Qu'est-ce que tu remarques?", "Pourquoi penses-tu que...?", "Que se passerait-il si...?"],
      wonderWall: "Ajouter des questions au mur des merveilles scientifiques"
    },
    
    priorKnowledgeCheck: content.priorKnowledge,
    
    reflectionActivities: {
      student: "Dessine et écris ta découverte préférée dans ton journal",
      teacher: "Noter les misconceptions à adresser, planifier les prochaines investigations basées sur les intérêts observés"
    },
    
    formativeCheckpoints: {
      duringExploration: "Vérifier la manipulation sécuritaire et l'observation active",
      duringRecording: "Supporter l'utilisation du vocabulaire et la documentation",
      duringSharing: "Évaluer la communication des découvertes"
    }
  };
}

function getScienceContent(lessonNumber: number) {
  const contents = [
    // Week 1: Introduction to Scientific Observation
    {
      title: "Leçon 1: Être un scientifique",
      inquiryQuestion: "Comment les scientifiques explorent-ils le monde?",
      priorKnowledge: "Ce que les élèves savent des scientifiques",
      vocabulary: [
        { term: "observer", definition: "regarder attentivement" },
        { term: "scientifique", definition: "personne qui explore" },
        { term: "découvrir", definition: "trouver quelque chose" }
      ],
      safetyFocus: "Règles de base du laboratoire de sciences",
      investigation: "Exploration des outils scientifiques (loupes, règles, balances)",
      consolidationActivity: "Créer notre affiche 'Nous sommes des scientifiques'",
      specificMaterials: ["Outils scientifiques variés", "Blouse de laboratoire", "Lunettes de sécurité"],
      learningGoal: "Les élèves comprendront le rôle d'un scientifique et les outils d'observation",
      hook: "Coffre de scientifique mystérieux à explorer!",
      indigenousPerspective: "Les Mi'kmaq sont des scientifiques traditionnels qui observent la nature depuis des millénaires. Leurs observations détaillées des saisons, des plantes et des animaux ont créé une science profonde. Nous apprenons à observer comme les ancêtres, avec patience et respect pour découvrir les secrets de la nature."
    },
    {
      title: "Leçon 2: Nos sens scientifiques",
      inquiryQuestion: "Comment nos sens nous aident-ils à explorer?",
      priorKnowledge: "Les cinq sens que nous connaissons",
      vocabulary: [
        { term: "sens", definition: "façons de percevoir" },
        { term: "toucher", definition: "sentir avec les mains" },
        { term: "explorer", definition: "découvrir en cherchant" }
      ],
      safetyFocus: "Ne jamais goûter sans permission",
      investigation: "Stations d'exploration sensorielle (textures, sons, odeurs sécuritaires)",
      consolidationActivity: "Carte des sens: quel sens pour quelle découverte?",
      specificMaterials: ["Boîtes mystères", "Objets texturés", "Sons enregistrés"],
      learningGoal: "Les élèves utiliseront leurs sens pour faire des observations scientifiques",
      hook: "Boîtes mystères sensorielles à découvrir!",
      indigenousPerspective: "Les chasseurs et cueilleurs Mi'kmaq utilisaient tous leurs sens pour survivre et prospérer. L'odorat pour trouver des plantes médicinales, l'ouïe pour localiser les animaux, le toucher pour tester les matériaux. Nos sens sont nos premiers outils scientifiques, nous connectant profondément à notre environnement."
    },
    {
      title: "Leçon 3: Vivant ou non-vivant?",
      inquiryQuestion: "Comment savons-nous si quelque chose est vivant?",
      priorKnowledge: "Différences entre vivant et non-vivant",
      vocabulary: [
        { term: "vivant", definition: "qui est en vie" },
        { term: "non-vivant", definition: "qui n'a jamais été vivant" },
        { term: "grandir", definition: "devenir plus grand" }
      ],
      safetyFocus: "Manipulation douce des êtres vivants",
      investigation: "Tri d'objets de la cour d'école: vivant vs non-vivant",
      consolidationActivity: "Créer un tableau de classification vivant/non-vivant",
      specificMaterials: ["Collections de la nature", "Images d'êtres vivants", "Contenants de tri"],
      learningGoal: "Les élèves distingueront les caractéristiques du vivant et du non-vivant",
      hook: "Plante mystère: est-elle vraiment vivante?",
      indigenousPerspective: "Dans la vision Mi'kmaq, tout dans la nature a un esprit - les roches, l'eau, les plantes. Cette perspective nous enseigne le respect pour tout ce qui nous entoure. Même si la science occidentale sépare vivant et non-vivant, nous honorons l'importance de chaque élément dans le cercle de la vie."
    },
    
    // Week 2: Exploring Our School Environment
    {
      title: "Leçon 4: Les plantes de notre école",
      inquiryQuestion: "Quelles plantes vivent autour de notre école?",
      priorKnowledge: "Les parties d'une plante",
      vocabulary: [
        { term: "feuille", definition: "partie verte de la plante" },
        { term: "tige", definition: "partie qui supporte" },
        { term: "racine", definition: "partie dans la terre" }
      ],
      safetyFocus: "Ne pas arracher les plantes, observer seulement",
      investigation: "Chasse aux plantes dans la cour, dessiner 3 plantes différentes",
      consolidationActivity: "Galerie de nos dessins de plantes",
      specificMaterials: ["Planches à dessin", "Guides de plantes locales", "Règles pour mesurer"],
      learningGoal: "Les élèves identifieront et documenteront les plantes de leur environnement",
      hook: "Carte au trésor des plantes secrètes de l'école!",
      indigenousPerspective: "Les Mi'kmaq connaissent chaque plante de leur territoire - certaines pour manger, d'autres pour la médecine, d'autres pour l'artisanat. Sweetgrass est sacré pour la purification. En apprenant les plantes de notre école, nous commençons à connaître notre territoire comme les ancêtres connaissaient le leur."
    },
    {
      title: "Leçon 5: Les animaux de notre école",
      inquiryQuestion: "Quels animaux visitent notre école?",
      priorKnowledge: "Animaux qu'on peut voir dehors",
      vocabulary: [
        { term: "habitat", definition: "maison d'un animal" },
        { term: "traces", definition: "marques laissées" },
        { term: "observer", definition: "regarder sans déranger" }
      ],
      safetyFocus: "Observer à distance, ne pas toucher les animaux",
      investigation: "Recherche de signes d'animaux (nids, traces, plumes)",
      consolidationActivity: "Carte des habitats animaux de notre école",
      specificMaterials: ["Jumelles", "Guides d'identification", "Appareil photo"],
      learningGoal: "Les élèves identifieront les signes de présence animale dans leur environnement",
      hook: "Détective d'animaux: trouvez les indices!",
      indigenousPerspective: "Les Mi'kmaq lisent les signes des animaux comme un livre ouvert - traces, crottes, marques sur les arbres racontent des histoires. Cette connaissance permettait de chasser avec respect, prenant seulement ce qui était nécessaire. Nous apprenons à lire ces mêmes signes dans notre cour d'école."
    },
    {
      title: "Leçon 6: Le sol sous nos pieds",
      inquiryQuestion: "Qu'y a-t-il dans le sol de notre école?",
      priorKnowledge: "Le sol n'est pas juste de la terre",
      vocabulary: [
        { term: "sol", definition: "terre sous nos pieds" },
        { term: "texture", definition: "comment ça se sent" },
        { term: "composant", definition: "partie de quelque chose" }
      ],
      safetyFocus: "Se laver les mains après avoir touché le sol",
      investigation: "Examiner différents échantillons de sol avec loupes",
      consolidationActivity: "Créer des échantillons de sol en pots étiquetés",
      specificMaterials: ["Échantillons de sol", "Tamis", "Pots transparents", "Étiquettes"],
      learningGoal: "Les élèves exploreront la composition et les propriétés du sol",
      hook: "Trésor caché dans le sol: qu'allons-nous trouver?",
      indigenousPerspective: "Pour les Mi'kmaq, le sol est vivant et sacré - c'est la peau de la Terre Mère. Un sol sain produit des plantes saines qui nourrissent tous les êtres. Les ancêtres savaient quel sol était bon pour différentes plantes. Notre exploration nous connecte à cette sagesse ancienne de la terre."
    },
    {
      title: "Leçon 7: L'eau dans notre environnement",
      inquiryQuestion: "Où trouve-t-on l'eau à l'école?",
      priorKnowledge: "L'importance de l'eau pour la vie",
      vocabulary: [
        { term: "eau", definition: "liquide essentiel à la vie" },
        { term: "cycle", definition: "qui revient encore" },
        { term: "évaporer", definition: "devenir vapeur" }
      ],
      safetyFocus: "Ne pas boire l'eau non potable",
      investigation: "Trouver et mapper toutes les sources d'eau de l'école",
      consolidationActivity: "Démonstration simple du cycle de l'eau",
      specificMaterials: ["Contenants d'eau", "Carte de l'école", "Thermomètre"],
      learningGoal: "Les élèves identifieront les sources et usages de l'eau dans leur environnement",
      hook: "Message dans une bouteille sur l'eau!",
      indigenousPerspective: "L'eau est sacrée pour les Mi'kmaq - elle est la sang de la Terre Mère. Chaque goutte d'eau a voyagé à travers les nuages, les rivières, les océans. Les cérémonies de l'eau honorent ce cadeau précieux. Nous apprenons à respecter l'eau comme source de toute vie sur Terre."
    },
    
    // Week 3: Patterns and Changes
    {
      title: "Leçon 8: Les changements quotidiens",
      inquiryQuestion: "Qu'est-ce qui change pendant la journée?",
      priorKnowledge: "Différences entre matin et soir",
      vocabulary: [
        { term: "changer", definition: "devenir différent" },
        { term: "ombre", definition: "zone sombre créée" },
        { term: "température", definition: "chaud ou froid" }
      ],
      safetyFocus: "Protection solaire pour observations extérieures",
      investigation: "Observer et documenter les ombres à différents moments",
      consolidationActivity: "Livre accordéon des changements de la journée",
      specificMaterials: ["Craie pour tracer ombres", "Thermomètre", "Horloge solaire"],
      learningGoal: "Les élèves observeront les changements quotidiens dans leur environnement",
      hook: "L'ombre mystérieuse qui bouge toute seule!",
      indigenousPerspective: "Les Mi'kmaq utilisaient le soleil comme horloge naturelle - la longueur et direction des ombres indiquaient l'heure et la saison. Cette observation quotidienne connectait les gens aux rythmes naturels. Nous apprenons cette même conscience en observant comment notre école change avec le soleil."
    },
    {
      title: "Leçon 9: Les patterns dans la nature",
      inquiryQuestion: "Quels patterns voyez-vous dehors?",
      priorKnowledge: "Reconnaître des patterns simples",
      vocabulary: [
        { term: "pattern", definition: "motif qui se répète" },
        { term: "spirale", definition: "forme qui tourne" },
        { term: "symétrie", definition: "même des deux côtés" }
      ],
      safetyFocus: "Rester sur les sentiers pendant l'exploration",
      investigation: "Chasse aux patterns naturels (feuilles, coquilles, fleurs)",
      consolidationActivity: "Créer de l'art inspiré des patterns naturels",
      specificMaterials: ["Collections de nature", "Papier calque", "Matériel d'art"],
      learningGoal: "Les élèves identifieront et documenteront les patterns dans la nature",
      hook: "Détective de patterns avec loupes magiques!",
      indigenousPerspective: "Les patterns dans la nature sont sacrés pour les Mi'kmaq - spirales des coquillages, cercles des saisons, vagues de l'océan. Ces patterns se retrouvent dans l'art traditionnel, les paniers, les vêtements. La nature est le premier professeur de mathématiques et d'art, montrant l'ordre dans la création."
    },
    {
      title: "Leçon 10: Notre météo locale",
      inquiryQuestion: "Quel temps fait-il aujourd'hui et pourquoi?",
      priorKnowledge: "Types de météo différents",
      vocabulary: [
        { term: "météo", definition: "temps qu'il fait" },
        { term: "nuage", definition: "vapeur d'eau dans le ciel" },
        { term: "prédire", definition: "dire ce qui va arriver" }
      ],
      safetyFocus: "S'habiller selon la météo pour sortir",
      investigation: "Créer une station météo simple, enregistrer les données",
      consolidationActivity: "Bulletin météo de notre école",
      specificMaterials: ["Thermomètre", "Girouette simple", "Pluviomètre", "Tableau météo"],
      learningGoal: "Les élèves observeront et enregistreront les conditions météorologiques",
      hook: "Devenir météorologue de l'école pour une journée!",
      indigenousPerspective: "Les Mi'kmaq prédisaient la météo en observant les nuages, le vent, le comportement des animaux. Ces signes naturels étaient plus fiables que la technologie moderne. Le ciel rouge au coucher annonce du beau temps. Nous apprenons à lire ces mêmes signes que les ancêtres utilisaient."
    },
    
    // Week 4: Caring for Our Environment
    {
      title: "Leçon 11: Prendre soin des plantes",
      inquiryQuestion: "De quoi les plantes ont-elles besoin pour vivre?",
      priorKnowledge: "Les plantes sont vivantes",
      vocabulary: [
        { term: "besoin", definition: "ce qui est nécessaire" },
        { term: "pousser", definition: "grandir" },
        { term: "soin", definition: "s'occuper de" }
      ],
      safetyFocus: "Utiliser les outils de jardinage prudemment",
      investigation: "Planter des graines, créer un plan de soin",
      consolidationActivity: "Journal de croissance de notre plante de classe",
      specificMaterials: ["Graines", "Pots", "Terre", "Arrosoirs", "Étiquettes"],
      learningGoal: "Les élèves comprendront les besoins des plantes et en prendront soin",
      hook: "Adopter une plante pour la classe!",
      indigenousPerspective: "Les Mi'kmaq cultivaient les Trois Sœurs - maïs, haricots, courges - qui s'entraidaient pour pousser. Cette sagesse agricole montre comment les plantes travaillent ensemble. En prenant soin de nos plantes, nous apprenons la responsabilité et la patience que les ancêtres pratiquaient dans leurs jardins."
    },
    {
      title: "Leçon 12: Aider les animaux",
      inquiryQuestion: "Comment pouvons-nous aider les animaux de notre école?",
      priorKnowledge: "Les animaux ont des besoins",
      vocabulary: [
        { term: "abri", definition: "endroit sûr" },
        { term: "nourriture", definition: "ce qu'on mange" },
        { term: "protéger", definition: "garder en sécurité" }
      ],
      safetyFocus: "Ne pas nourrir les animaux sans permission",
      investigation: "Concevoir et créer un habitat pour les insectes",
      consolidationActivity: "Plan d'action pour aider les animaux de l'école",
      specificMaterials: ["Matériaux naturels", "Outils de construction simple", "Guides d'habitats"],
      learningGoal: "Les élèves créeront des habitats pour supporter la vie animale",
      hook: "Mission sauvetage: créer des maisons pour nos amis!",
      indigenousPerspective: "Les Mi'kmaq vivaient en harmonie avec les animaux, prenant seulement ce dont ils avaient besoin et protégeant les habitats. Chaque animal a un rôle important dans l'équilibre de la nature. En créant des habitats, nous continuons cette tradition de coexistence respectueuse avec nos parents animaux."
    },
    {
      title: "Leçon 13: Garder notre école propre",
      inquiryQuestion: "Comment nos actions affectent-elles l'environnement?",
      priorKnowledge: "La pollution nuit à la nature",
      vocabulary: [
        { term: "pollution", definition: "ce qui salit" },
        { term: "recycler", definition: "réutiliser" },
        { term: "composter", definition: "transformer en terre" }
      ],
      safetyFocus: "Porter des gants pour ramasser les déchets",
      investigation: "Audit des déchets de l'école, tri et solutions",
      consolidationActivity: "Affiche 'Gardons notre école verte'",
      specificMaterials: ["Gants", "Sacs de tri", "Balance", "Matériel d'affiche"],
      learningGoal: "Les élèves comprendront l'impact humain et les solutions environnementales",
      hook: "Détective déchets: d'où viennent-ils?",
      indigenousPerspective: "Les Mi'kmaq traditionnels ne créaient aucun déchet - tout retournait à la terre. Chaque objet avait plusieurs vies et utilisations. Cette philosophie zéro déchet nous enseigne à repenser notre consommation. En gardant notre école propre, nous honorons la Terre Mère et assurons un futur sain."
    },
    {
      title: "Leçon 14: Célébrer notre environnement",
      inquiryQuestion: "Pourquoi notre environnement scolaire est-il spécial?",
      priorKnowledge: "Tout ce qu'on a appris sur notre école",
      vocabulary: [
        { term: "célébrer", definition: "honorer quelque chose" },
        { term: "partager", definition: "donner aux autres" },
        { term: "communauté", definition: "groupe qui vit ensemble" }
      ],
      safetyFocus: "Sécurité lors de la présentation extérieure",
      investigation: "Créer un guide de l'environnement de notre école",
      consolidationActivity: "Exposition scientifique pour les autres classes",
      specificMaterials: ["Matériel d'exposition", "Travaux des élèves", "Invitations"],
      learningGoal: "Les élèves partageront leurs connaissances sur l'environnement scolaire",
      hook: "Devenir les experts environnementaux de l'école!",
      indigenousPerspective: "Les Mi'kmaq célèbrent leur connexion à la terre par des cérémonies de gratitude. Partager les connaissances est une responsabilité sacrée pour assurer que la sagesse continue. Notre célébration honore notre apprentissage et notre engagement à protéger ce lieu spécial que nous partageons tous."
    }
  ];
  
  return contents[lessonNumber - 1] || contents[0];
}

createScienceUnit1();