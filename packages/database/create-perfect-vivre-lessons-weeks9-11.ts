import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks9To11VivreLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 9-11');
  console.log('Unit: Vivre ensemble');
  console.log('Focus: Global Connections and Performance Task');
  console.log('=========================================\n');

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'test.teacher@pei.ca' }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Vivre ensemble'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (!unitPlan) {
      throw new Error('Unit plan Vivre ensemble not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 12 lessons for Weeks 9-11\n');

    // WEEK 9: Global Connections (March 2-6, 2026)
    
    // Lesson 33: Nous sommes connectés au monde
    const lesson33 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Nous sommes connectés au monde',
        date: new Date('2026-03-02'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que nous faisons partie du monde
• Identifier nos connexions globales
• Développer une conscience planétaire`,

        mindsOn: `Le fil invisible (10 min)
• Pelote de laine colorée
• "D'où vient votre chandail?"
• Tracer le voyage: coton → usine → magasin → nous
• Fil tendu montrant les connexions
• Réalisation: Connectés au monde entier!
• Question: Comment sommes-nous reliés?`,

        action: `Détectives des connexions (28 min)

PARTIE 1: D'où viennent nos choses? (13 min)
• Enquête sur 5 objets de la classe:
  - Crayons: Bois du Canada
  - Bananes: Amérique centrale
  - Jouets: Chine
  - Chocolat: Afrique
  - Papier: Forêts locales
• Carte du monde, épingles placées
• Fils connectant objets aux origines
• WOW! Toile mondiale créée!

PARTIE 2: Nos connexions humaines (15 min)
• Qui dans la classe a de la famille ailleurs?
• Marquage sur la carte
• Langues parlées à la maison
• Nourriture d'autres pays mangée
• Musique d'ailleurs écoutée
• Création: Mon passeport de connexions
• Tampons pour chaque lien`,

        consolidation: `Citoyens du monde (7 min)
• Contemplation de notre carte connectée
• "Je suis connecté au monde par..."
• Badge "Citoyen du monde"
• Engagement: Remarquer les connexions
• Photo avec la carte mondiale`,

        materials: JSON.stringify([
          "Pelote de laine colorée",
          "Carte du monde grande",
          "Épingles et fils",
          "Objets variés de la classe",
          "Passeports vierges",
          "Tampons et badges"
        ]),

        accommodations: JSON.stringify([
          "Connexions simplifiées si nécessaire",
          "Support visuel constant",
          "Aide pour identifier les liens",
          "Participation flexible",
          "Respect des situations familiales"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 connexions simples",
          onLevel: "Multiple connexions identifiées",
          advanced: "Connexions complexes, chaînes d'impact"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience des connexions globales
Compréhension de l'interdépendance
Ouverture sur le monde`,

        isSubFriendly: true,
        subNotes: `Focus: Découverte des connexions mondiales.
Activité principale: Carte des connexions.
Important: Message positif sur la diversité.
Sensibilité aux origines diverses.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 34: Les enfants du monde
    const lesson34 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les enfants du monde',
        date: new Date('2026-03-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir comment vivent d'autres enfants
• Développer l'empathie interculturelle
• Célébrer les similarités et différences`,

        mindsOn: `Une journée ailleurs (10 min)
• Photos d'enfants: Japon, Kenya, Brésil
• "Imaginez votre journée là-bas"
• Similarités: école, jeux, famille
• Différences: maison, nourriture, langue
• Réalisation: Enfants partout!
• Question: Que partageons-nous tous?`,

        action: `Voyage virtuel chez les amis (28 min)

PARTIE 1: Journées parallèles (13 min)
• 4 stations-pays:
  - Japon: Bento, origami, uniforme
  - Kenya: Savane, école en plein air
  - Brésil: Football, carnaval, portugais
  - Arctique: Iglou, pêche, inuktitut
• 3 minutes par station
• Activité typique essayée
• Mot appris dans la langue

PARTIE 2: Lettres aux amis du monde (15 min)
• Choix d'un pays
• Lettre/dessin créé:
  - "Bonjour ami de..."
  - "Voici ma journée"
  - "J'aimerais savoir..."
  - "Nous sommes pareils car..."
• Décoration culturelle
• Enveloppe mondiale créée`,

        consolidation: `Amis sans frontières (7 min)
• Présentation des lettres
• Mur de l'amitié mondiale
• Chanson "Frère Jacques" multilingue
• Poignée de main internationale
• Mission: Apprendre un mot étranger`,

        materials: JSON.stringify([
          "Photos d'enfants du monde",
          "Objets culturels (ou images)",
          "Matériel pour lettres",
          "Carte murale",
          "Musique du monde",
          "Drapeaux miniatures"
        ]),

        accommodations: JSON.stringify([
          "Activités culturelles adaptées",
          "Support pour les lettres",
          "Participation flexible aux stations",
          "Aide pour concepts abstraits",
          "Respect de toutes les cultures"
        ]),

        modifications: JSON.stringify({
          struggling: "2 pays, activités simples",
          onLevel: "4 pays, lettres complètes",
          advanced: "Recherche approfondie, comparaisons"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Empathie interculturelle développée
Curiosité pour d'autres cultures
Expression de connexions humaines`,

        isSubFriendly: true,
        subNotes: `Focus: Découverte de la vie d'enfants ailleurs.
Activité principale: Stations-pays et lettres.
Important: Éviter les stéréotypes.
Célébrer diversité et unité.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 35: Protéger notre planète ensemble
    const lesson35 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Protéger notre planète ensemble',
        date: new Date('2026-03-04'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre notre responsabilité environnementale
• Identifier des actions de protection
• S'engager pour la planète`,

        mindsOn: `La Terre a besoin d'aide (10 min)
• Globe terrestre avec pansements
• "Notre Terre est malade"
• Symptômes: déchets, pollution, chaleur
• "Qui peut l'aider?"
• Nous tous, ensemble!
• Question: Comment être docteurs de la Terre?`,

        action: `Hôpital de la planète (28 min)

PARTIE 1: Diagnostic et traitement (13 min)
• 4 problèmes identifiés:
  - Trop de déchets
  - Gaspillage d'eau
  - Arbres coupés
  - Animaux en danger
• Solutions trouvées:
  - Recycler et réutiliser
  - Fermer les robinets
  - Planter des arbres
  - Protéger les habitats
• Plan de traitement créé

PARTIE 2: Actions concrètes (15 min)
• Création de brigades vertes:
  - Brigade recyclage
  - Brigade économie d'eau
  - Brigade jardinage
  - Brigade protection animale
• Badges et missions attribués
• Affiches de sensibilisation
• Engagement officiel signé`,

        consolidation: `Gardiens de la Terre (7 min)
• Serment des gardiens
• "Je promets de protéger..."
• Cape verte symbolique
• Chanson de la Terre
• Photo de l'équipe verte`,

        materials: JSON.stringify([
          "Globe avec pansements",
          "Matériel pour badges",
          "Papier pour affiches",
          "Capes vertes (tissu/papier)",
          "Matériel de recyclage",
          "Images environnementales"
        ]),

        accommodations: JSON.stringify([
          "Actions adaptées aux capacités",
          "Support visuel pour concepts",
          "Participation flexible",
          "Aide pour engagements",
          "Actions réalisables"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 actions simples",
          onLevel: "Participation à toutes les brigades",
          advanced: "Leadership environnemental"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience environnementale
Identification d'actions concrètes
Engagement démontré`,

        isSubFriendly: true,
        subNotes: `Focus: Responsabilité environnementale.
Activité principale: Brigades vertes.
Important: Actions concrètes et réalisables.
Message positif d'espoir.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 36: La paix dans le monde
    const lesson36 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La paix dans le monde',
        date: new Date('2026-03-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre le concept de paix mondiale
• Identifier comment contribuer à la paix
• Créer des messages de paix`,

        mindsOn: `La colombe de la paix (10 min)
• Colombe en papier présentée
• Symbole universel de paix
• "Que veut dire la paix?"
• Pas de disputes, amitié, sécurité
• Paix: dans la classe → école → monde
• Question: Comment répandre la paix?`,

        action: `Ambassade de la paix (28 min)

PARTIE 1: Mots de paix universels (13 min)
• Apprendre "paix" en 5 langues:
  - Peace (anglais)
  - Paz (espagnol)
  - Salam (arabe)
  - Shalom (hébreu)
  - Heiwa (japonais)
• Gestes de paix créés
• Pratique en chanson
• Bannière multilingue

PARTIE 2: Colombes messagères (15 min)
• Création de colombes en papier
• Messages de paix écrits:
  - Pour notre classe
  - Pour notre école
  - Pour le Canada
  - Pour le monde
• Décoration symbolique
• Mobile de paix assemblé`,

        consolidation: `Envol de la paix (7 min)
• Cérémonie des colombes
• Lecture de messages choisis
• Lancement symbolique
• Engagement: Un geste de paix par jour
• Photo sous le mobile`,

        materials: JSON.stringify([
          "Modèle de colombe",
          "Papier blanc",
          "Mots 'paix' multilingues",
          "Matériel pour mobile",
          "Marqueurs colorés",
          "Fil et supports"
        ]),

        accommodations: JSON.stringify([
          "Mots de paix simplifiés",
          "Support pour messages",
          "Aide pour colombes",
          "Expression flexible",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 mots, message simple",
          onLevel: "Tous les mots, messages complets",
          advanced: "Messages élaborés, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de paix
Expression de messages pacifiques
Engagement pour la paix`,

        isSubFriendly: true,
        subNotes: `Focus: Promotion de la paix mondiale.
Activité principale: Colombes et messages.
Important: Paix commence avec nous.
Message d'espoir universel.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 10: Preparing Our Performance Task (March 9-13, 2026)

    // Lesson 37: Planification de notre village idéal
    const lesson37 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Planification de notre village idéal',
        date: new Date('2026-03-09'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Imaginer une communauté idéale
• Appliquer tous leurs apprentissages
• Planifier collaborativement`,

        mindsOn: `Le village de nos rêves (10 min)
• "Si on créait un village parfait..."
• Brainstorm: Qu'est-ce qu'il faut?
• Maisons, école, parc, règles, amis...
• "Un village où tout le monde est heureux"
• Annonce: Créons ce village ensemble!
• Excitation maximale!`,

        action: `Architectes du bonheur (30 min)

PARTIE 1: Vision collective (10 min)
• Nom du village choisi démocratiquement
• Valeurs fondamentales:
  - Respect et inclusion
  - Justice et équité
  - Entraide et partage
  - Paix et harmonie
• Devise créée ensemble
• Logo dessiné

PARTIE 2: Planification des zones (20 min)
• Plan général tracé:
  - Zone résidentielle (maisons pour tous)
  - Zone éducative (école des rêves)
  - Zone verte (parcs et jardins)
  - Zone communautaire (lieux de rencontre)
  - Zone d'aide (services)
• Équipes formées par zone
• Premières esquisses
• Liste des matériaux nécessaires`,

        consolidation: `Conseil de planification (5 min)
• Présentation des zones
• Validation collective
• Distribution des rôles
• Calendrier de construction
• Cri de ralliement créé`,

        materials: JSON.stringify([
          "Grande feuille pour plan",
          "Matériel de dessin",
          "Post-its pour idées",
          "Règles et compas",
          "Images d'inspiration",
          "Tableau de planification"
        ]),

        accommodations: JSON.stringify([
          "Rôles adaptés aux capacités",
          "Support pour planification",
          "Participation flexible",
          "Aide visuelle constante",
          "Options variées de contribution"
        ]),

        modifications: JSON.stringify({
          struggling: "Contribution simple, beaucoup de support",
          onLevel: "Planification active d'une zone",
          advanced: "Coordination générale, leadership"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Vision créative exprimée
Collaboration dans la planification
Application des valeurs apprises`,

        isSubFriendly: true,
        subNotes: `Focus: Lancement du projet de village idéal.
Activité principale: Planification collaborative.
Important: Tous contribuent selon leurs moyens.
Préparation pour construction.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 38: Construction de l'infrastructure
    const lesson38 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Construction de l\'infrastructure',
        date: new Date('2026-03-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Construire les structures du village
• Travailler en équipes coordonnées
• Appliquer les principes d'inclusion`,

        mindsOn: `Chantier ouvert! (8 min)
• Casques de construction distribués
• "Aujourd'hui, on construit!"
• Révision du plan
• Rappel: Village pour TOUS
• Matériaux présentés
• "Au travail, constructeurs!"`,

        action: `Construction intensive (32 min)

PARTIE 1: Structures essentielles (20 min)
• Équipes au travail:
  - Équipe 1: Maisons inclusives (boîtes décorées)
  - Équipe 2: École accueillante (grande structure)
  - Équipe 3: Parc accessible (espace vert)
  - Équipe 4: Centre communautaire
• Construction avec matériel recyclé
• Attention aux détails inclusifs:
  - Rampes d'accès
  - Espaces pour tous
  - Signalisation claire

PARTIE 2: Connexions et routes (12 min)
• Routes tracées entre zones
• Ponts construits
• Passages piétons marqués
• Éclairage (LED simples)
• Test: Tout est connecté?
• Ajustements nécessaires`,

        consolidation: `Inspection du chantier (5 min)
• Tour du village en construction
• Vérification: Accessible à tous?
• Félicitations aux équipes
• Photo du progrès
• Préparation pour demain`,

        materials: JSON.stringify([
          "Boîtes recyclées variées",
          "Papier construction",
          "Colle et ruban adhésif",
          "Matériel naturel (branches, pierres)",
          "LED et piles",
          "Casques de construction (papier)"
        ]),

        accommodations: JSON.stringify([
          "Tâches selon capacités motrices",
          "Support pour construction",
          "Options de participation",
          "Aide constante disponible",
          "Adaptation des structures"
        ]),

        modifications: JSON.stringify({
          struggling: "Construction simple avec aide",
          onLevel: "Construction autonome en équipe",
          advanced: "Coordination inter-équipes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Collaboration en construction
Application des principes d'inclusion
Créativité dans les solutions`,

        isSubFriendly: true,
        subNotes: `Focus: Construction physique du village.
Activité principale: Travail en équipes.
Important: Sécurité avec matériaux.
Village prend forme!`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 39: Les règles de notre village
    const lesson39 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les règles de notre village',
        date: new Date('2026-03-11'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Établir les règles du village idéal
• Créer une charte communautaire
• Assurer justice et inclusion`,

        mindsOn: `Un village sans règles? (8 min)
• Scénario: Village sans règles
• Chaos imaginé!
• "Nos règles = notre bonheur"
• Rappel de nos valeurs
• Question: Quelles règles pour notre village?
• Préparation de l'assemblée`,

        action: `Assemblée constituante (32 min)

PARTIE 1: Proposition des lois (15 min)
• Catégories de règles:
  - Vivre ensemble (respect, inclusion)
  - Partage des espaces
  - Protection de l'environnement
  - Résolution des conflits
  - Célébrations et traditions
• Propositions de chaque groupe
• Discussion respectueuse
• Vote démocratique

PARTIE 2: Charte du village (17 min)
• Rédaction officielle:
  "Nous, citoyens du Village [Nom], promettons..."
• 10 règles fondamentales
• Illustration de chaque règle
• Signatures de tous
• Décoration solennelle
• Sceau officiel créé`,

        consolidation: `Proclamation officielle (5 min)
• Lecture solennelle de la charte
• Lever de main: "J'accepte!"
• Installation dans le village
• Photo historique
• Applaudissements!`,

        materials: JSON.stringify([
          "Grand parchemin (papier)",
          "Plumes ou beaux stylos",
          "Encre ou marqueurs",
          "Matériel pour sceau",
          "Cadre pour charte",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Règles simplifiées si nécessaire",
          "Support pour propositions",
          "Vote adapté",
          "Aide pour signature",
          "Participation flexible"
        ]),

        modifications: JSON.stringify({
          struggling: "Contribution simple aux règles",
          onLevel: "Participation active complète",
          advanced: "Facilitation, synthèse des idées"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Application des apprentissages sur les règles
Processus démocratique utilisé
Engagement communautaire`,

        isSubFriendly: true,
        subNotes: `Focus: Création des règles du village.
Activité principale: Assemblée et charte.
Important: Processus démocratique respecté.
Document officiel créé.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 40: La vie dans notre village
    const lesson40 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La vie dans notre village',
        date: new Date('2026-03-13'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Animer le village avec des personnages
• Créer des scénarios de vie quotidienne
• Démontrer l'application des valeurs`,

        mindsOn: `Le village s'éveille (8 min)
• "Notre village est prêt... mais vide!"
• Il faut des habitants!
• Qui vivra dans notre village?
• Familles diverses imaginées
• Introduction des personnages
• "Donnons vie à notre village!"`,

        action: `Animation du village (32 min)

PARTIE 1: Création des habitants (12 min)
• Personnages en papier créés:
  - Familles diverses
  - Enfants de tous âges
  - Aînés sages
  - Travailleurs variés
  - Animaux compagnons
• Noms et histoires donnés
• Maisons attribuées
• Installation dans le village

PARTIE 2: Journée au village (20 min)
• Scénarios joués:
  - Matin: Tous à l'école/travail
  - Conflit au parc: Résolution pacifique
  - Midi: Partage communautaire
  - Projet d'entraide
  - Fête du soir
• Application des règles
• Démonstration des valeurs
• Problèmes résolus ensemble`,

        consolidation: `Coucher de soleil (5 min)
• Fin de journée au village
• "Qu'avons-nous appris?"
• Réflexion sur la vie ensemble
• Personnages rangés pour demain
• Fierté du village créé`,

        materials: JSON.stringify([
          "Papier pour personnages",
          "Bâtons de popsicle",
          "Marqueurs et crayons",
          "Petits accessoires",
          "Matériel pour scénarios",
          "Musique d'ambiance"
        ]),

        accommodations: JSON.stringify([
          "Personnages simplifiés",
          "Rôles adaptés dans scénarios",
          "Support pour animation",
          "Participation flexible",
          "Expression variée"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 personnages, scénarios simples",
          onLevel: "Participation active complète",
          advanced: "Narration, scénarios complexes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Application des valeurs dans les scénarios
Créativité dans l'animation
Résolution de problèmes démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Animation et vie du village.
Activité principale: Personnages et scénarios.
Important: Démontrer les apprentissages.
Village vivant et dynamique.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 11: Performance Task - Community Showcase (March 16-20, 2026)

    // Lesson 41: Préparation de la présentation
    const lesson41 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation de la présentation',
        date: new Date('2026-03-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Préparer la présentation du village
• Organiser les rôles de guide
• Répéter les explications`,

        mindsOn: `Visiteurs importants (8 min)
• "Jeudi, des invités spéciaux!"
• Parents, direction, autres classes
• Notre chance de montrer notre village!
• Fierté et responsabilité
• Question: Comment bien présenter?
• Mission: Guides professionnels!`,

        action: `Formation des guides (32 min)

PARTIE 1: Organisation des visites (12 min)
• Parcours de visite établi:
  - Accueil et introduction
  - Zone résidentielle
  - École et apprentissage
  - Espaces communautaires
  - Charte et règles
• Guides assignés par zone
• Scripts simples préparés
• Cartes de guide créées

PARTIE 2: Répétition générale (20 min)
• Pratique des présentations:
  - "Bienvenue dans notre village..."
  - "Ici nous avons construit..."
  - "Nos règles sont..."
  - "Nous avons appris que..."
• Feedback constructif
• Amélioration des présentations
• Confiance renforcée`,

        consolidation: `Prêts pour le grand jour (5 min)
• Derniers ajustements
• Encouragements mutuels
• Distribution des badges de guide
• Photo de l'équipe
• Repos avant le grand jour!`,

        materials: JSON.stringify([
          "Cartes de guide",
          "Badges officiels",
          "Scripts simples",
          "Microphone de pratique",
          "Plan de visite",
          "Costumes/accessoires"
        ]),

        accommodations: JSON.stringify([
          "Rôles selon capacités",
          "Scripts adaptés",
          "Support pour présentation",
          "Options non-verbales",
          "Partenaires de soutien"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple, beaucoup de support",
          onLevel: "Guide d'une zone, présentation standard",
          advanced: "Coordination, introduction générale"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Préparation de la présentation
Confiance développée
Organisation démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Préparation pour la présentation.
Activité principale: Formation et répétition.
Important: Tous ont un rôle valorisant.
Confiance à renforcer.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 42: Finition et embellissement
    const lesson42 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Finition et embellissement',
        date: new Date('2026-03-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Finaliser les détails du village
• Embellir pour la présentation
• Vérifier que tout est parfait`,

        mindsOn: `Les touches finales (8 min)
• "Artistes, à vos pinceaux!"
• Inspection du village
• Qu'est-ce qui manque?
• Liste des améliorations
• Distribution des tâches
• "Rendons-le magnifique!"`,

        action: `Embellissement intensif (32 min)

PARTIE 1: Détails et décorations (17 min)
• Ajouts finaux:
  - Fleurs et arbres
  - Panneaux de signalisation
  - Décorations festives
  - Éclairage amélioré
  - Drapeaux du village
• Nettoyage et organisation
• Vérification de la solidité

PARTIE 2: Éléments de présentation (15 min)
• Création finale:
  - Panneau de bienvenue
  - Carte du village légendée
  - Liste des habitants
  - Album photo du processus
  - Livre d'or pour visiteurs
• Installation stratégique
• Test du parcours de visite`,

        consolidation: `Inspection finale (5 min)
• Tour complet d'inspection
• Check-list vérifiée
• Ajustements de dernière minute
• Photos du village complet
• Fierté collective immense!`,

        materials: JSON.stringify([
          "Matériel de décoration",
          "Peinture et pinceaux",
          "Fleurs artificielles",
          "Panneaux vierges",
          "Matériel d'éclairage",
          "Livre d'or"
        ]),

        accommodations: JSON.stringify([
          "Tâches selon capacités",
          "Support pour détails fins",
          "Participation flexible",
          "Options variées",
          "Aide disponible"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâches simples de décoration",
          onLevel: "Embellissement autonome",
          advanced: "Coordination, touches artistiques"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Attention aux détails
Collaboration finale
Fierté du travail accompli`,

        isSubFriendly: true,
        subNotes: `Focus: Finalisation et embellissement.
Activité principale: Touches finales.
Important: Tout le monde contribue.
Village prêt pour présentation!`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 43: Répétition générale
    const lesson43 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Répétition générale',
        date: new Date('2026-03-18'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Répéter la présentation complète
• Perfectionner leurs rôles
• Gagner en confiance`,

        mindsOn: `Comme les vrais artistes (8 min)
• "Aujourd'hui: répétition générale!"
• Comme au théâtre!
• Importance de la pratique
• Costumes et badges distribués
• Énergie positive générée
• "Action!"`,

        action: `Répétition complète (32 min)

PARTIE 1: Simulation avec public (20 min)
• Autre classe invitée (si possible)
• Présentation complète:
  - Accueil des visiteurs
  - Visite guidée par zones
  - Démonstrations de vie
  - Explication des règles
  - Questions-réponses
• Chronométrage
• Notes d'amélioration

PARTIE 2: Ajustements et perfectionnement (12 min)
• Feedback du public test
• Corrections apportées
• Points à améliorer
• Pratique des parties difficiles
• Encouragements mutuels
• Confiance renforcée`,

        consolidation: `Cercle de confiance (5 min)
• Cercle de motivation
• "Nous sommes prêts parce que..."
• Cri de ralliement final
• Poignées de main
• Repos mérité!`,

        materials: JSON.stringify([
          "Costumes/badges",
          "Microphone",
          "Minuterie",
          "Carnet de notes",
          "Matériel de présentation",
          "Rafraîchissements"
        ]),

        accommodations: JSON.stringify([
          "Support constant disponible",
          "Rôles ajustés si anxiété",
          "Partenaires de soutien",
          "Flexibilité dans participation",
          "Encouragement personnalisé"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simplifié, support maximum",
          onLevel: "Présentation standard pratiquée",
          advanced: "Rôle de leader, improvisation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Maîtrise de la présentation
Confiance développée
Collaboration démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Répétition générale complète.
Activité principale: Simulation de présentation.
Important: Renforcer la confiance.
Ambiance positive et encourageante.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 44: GRANDE PRÉSENTATION - NOTRE VILLAGE IDÉAL
    const lesson44 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'GRANDE PRÉSENTATION - NOTRE VILLAGE IDÉAL',
        date: new Date('2026-03-19'),
        duration: 60, // Extended for the event
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Présenter leur village idéal aux invités
• Démontrer tous leurs apprentissages
• Célébrer 11 semaines de travail`,

        mindsOn: `Le grand moment! (10 min)
• Rassemblement des citoyens
• Dernières vérifications
• Costumes ajustés
• Respiration collective
• "Nous avons travaillé si fort!"
• "Montrons notre village!"
• Portes ouvertes!`,

        action: `PRÉSENTATION OFFICIELLE (45 min)

PARTIE 1: Accueil des invités (10 min)
• Comité d'accueil en place
• "Bienvenue dans notre Village de..."
• Distribution des programmes
• Explication du projet
• Invitation à la visite

PARTIE 2: Visites guidées (25 min)
• Rotation par groupes
• Chaque zone présentée:
  - Histoire de la construction
  - Valeurs représentées
  - Règles appliquées
  - Vie quotidienne démontrée
• Questions des visiteurs
• Réponses fières et claires

PARTIE 3: Cérémonie de clôture (10 min)
• Rassemblement final
• Chant de notre hymne
• Lecture de la charte
• Remerciements aux invités
• Témoignages d'élèves
• Photo de groupe avec le village`,

        consolidation: `Moment de gloire (5 min)
• Applaudissements nourris
• Livre d'or signé par tous
• Félicitations reçues
• Émotion partagée
• Mission accomplie!
• "NOUS AVONS RÉUSSI!"`,

        materials: JSON.stringify([
          "Village complet installé",
          "Programmes imprimés",
          "Livre d'or",
          "Microphone et son",
          "Appareil photo/vidéo",
          "Rafraîchissements"
        ]),

        accommodations: JSON.stringify([
          "Support constant disponible",
          "Rôles adaptés au stress",
          "Espaces calmes disponibles",
          "Flexibilité totale",
          "Célébration de tous"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation supportée, rôle adapté",
          onLevel: "Présentation complète de sa zone",
          advanced: "Maître de cérémonie, leadership"
        }),

        assessmentType: 'Sommative - Performance authentique',
        assessmentNotes: `Démonstration complète des apprentissages
Communication avec public réel
Synthèse de 11 semaines
Portfolio final: Village et présentation`,

        isSubFriendly: false,
        subNotes: `ÉVÉNEMENT SPÉCIAL - Enseignant titulaire requis
Présentation finale aux familles
Point culminant de l'unité
Support administratif souhaitable`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 33: Nous sommes connectés au monde');
    console.log('✅ Created Lesson 34: Les enfants du monde');
    console.log('✅ Created Lesson 35: Protéger notre planète ensemble');
    console.log('✅ Created Lesson 36: La paix dans le monde');
    console.log('✅ Created Lesson 37: Planification de notre village idéal');
    console.log('✅ Created Lesson 38: Construction de l\'infrastructure');
    console.log('✅ Created Lesson 39: Les règles de notre village');
    console.log('✅ Created Lesson 40: La vie dans notre village');
    console.log('✅ Created Lesson 41: Préparation de la présentation');
    console.log('✅ Created Lesson 42: Finition et embellissement');
    console.log('✅ Created Lesson 43: Répétition générale');
    console.log('✅ Created Lesson 44: GRANDE PRÉSENTATION - NOTRE VILLAGE IDÉAL');

    console.log('\n📊 WEEKS 9-11 SUMMARY');
    console.log('===================');
    console.log('Created 12 perfect lesson plans for Sciences humaines');
    console.log('Unit: Vivre ensemble');
    console.log('Dates: March 2-19, 2026');
    console.log('\nWeek 9 Focus:');
    console.log('✅ Global connections awareness');
    console.log('✅ Intercultural understanding');
    console.log('✅ Environmental responsibility');
    console.log('✅ World peace concepts');
    console.log('\nWeek 10 Focus:');
    console.log('✅ Village planning and design');
    console.log('✅ Infrastructure construction');
    console.log('✅ Democratic rule-making');
    console.log('✅ Community animation');
    console.log('\nWeek 11 Focus:');
    console.log('✅ Presentation preparation');
    console.log('✅ Final embellishments');
    console.log('✅ General rehearsal');
    console.log('✅ GRAND PERFORMANCE TASK');
    console.log('\nKey Features:');
    console.log('✅ Culminating authentic assessment');
    console.log('✅ Integration of all unit learnings');
    console.log('✅ Family and community engagement');
    console.log('✅ Student agency and voice');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks9To11VivreLessons().catch(console.error);