import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks1And2VivreLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 1-2');
  console.log('Unit: Vivre ensemble');
  console.log('Focus: Introduction to Rules and Living Together');
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
    console.log('Creating 8 lessons for Weeks 1-2\n');

    // WEEK 1: Understanding Rules and Community (January 5-9, 2026)
    
    // Lesson 1: Pourquoi des règles?
    const lesson1 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Pourquoi des règles?',
        date: new Date('2026-01-05'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les règles nous aident à vivre ensemble
• Identifier des règles dans différents contextes
• Reconnaître l'importance des règles pour la sécurité`,

        mindsOn: `Le jeu du chaos (10 min)
• Jeu simple sans règles annoncées
• Confusion naturelle qui émerge
• Arrêt: "Qu'est-ce qui était difficile?"
• Introduction de règles claires
• Rejouer avec règles
• Réflexion: "C'était mieux avec des règles!"
• Question: Pourquoi avons-nous besoin de règles?`,

        action: `Exploration des règles partout (28 min)

PARTIE 1: Chasse aux règles (13 min)
• Images de différents lieux:
  - Terrain de jeu (ne pas pousser)
  - Bibliothèque (chuchoter)
  - Route (traverser au passage)
  - Maison (ranger ses jouets)
• Identifier la règle dans chaque image
• Discussion: Pourquoi cette règle existe?

PARTIE 2: Notre jardin des règles (15 min)
• Grande affiche "jardin" au mur
• Chaque règle = une fleur
• Dessiner/écrire une règle importante
• Coller sa fleur dans le jardin
• Observer: Tant de règles nous aident!
• Décoration collective du jardin`,

        consolidation: `Gardiens des règles (7 min)
• Cercle de réflexion
• "Une règle que j'aime suivre est..."
• Chanson des règles (créée ensemble)
• Badge "Gardien des règles"
• Mission: Observer les règles à la maison`,

        materials: JSON.stringify([
          "Images de situations variées",
          "Grande affiche jardin",
          "Papier en forme de fleurs",
          "Crayons et marqueurs",
          "Colle",
          "Badges gardien"
        ]),

        accommodations: JSON.stringify([
          "Support visuel pour les règles",
          "Exemples concrets et familiers",
          "Participation flexible au jeu",
          "Aide pour l'écriture/dessin",
          "Répétition des concepts clés"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 règles simples, images fournies",
          onLevel: "4-5 règles, création autonome",
          advanced: "Explication du pourquoi, règles complexes"
        }),

        assessmentType: 'Diagnostique et formative',
        assessmentNotes: `Compréhension préalable des règles évaluée
Capacité à identifier l'importance des règles
Participation au jardin des règles`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au concept de règles.
Activité principale: Chasse aux règles et jardin collectif.
Important: Approche positive des règles.
Matériel visuel disponible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 2: Les règles de notre classe
    const lesson2 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les règles de notre classe',
        date: new Date('2026-01-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Participer à la création des règles de classe
• Comprendre que nous créons des règles ensemble
• S'engager à respecter nos règles`,

        mindsOn: `Notre classe idéale (10 min)
• "Fermez les yeux... imaginez la classe parfaite"
• Partage des visions
• Liste: Comment voulons-nous que notre classe soit?
  - Sécuritaire, amusante, calme, amicale
• Question: Quelles règles nous aideraient?
• Introduction: Créons NOS règles!`,

        action: `Création démocratique des règles (28 min)

PARTIE 1: Proposition de règles (13 min)
• Brainstorm en petits groupes
• Chaque groupe propose 2-3 règles
• Présentation au grand groupe
• Regroupement des idées similaires
• Vote pour les 5 plus importantes

PARTIE 2: Notre charte de classe (15 min)
• Les 5 règles choisies affichées
• Illustration de chaque règle
• Signatures/empreintes de tous
• Décoration festive
• Affichage cérémoniel
• Photo officielle avec la charte`,

        consolidation: `Engagement solennel (7 min)
• Cercle de promesse
• Chacun touche la charte
• "Je promets de..."
• Poignée de main avec voisins
• Certificat "Co-créateur des règles"
• Célébration: Nous avons créé nos règles!`,

        materials: JSON.stringify([
          "Grande affiche pour charte",
          "Marqueurs colorés",
          "Matériel de vote (jetons)",
          "Encre pour empreintes",
          "Certificats co-créateur",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Support pour expression d'idées",
          "Vote visuel avec images",
          "Participation flexible",
          "Aide pour signature/empreinte",
          "Répétition des règles choisies"
        ]),

        modifications: JSON.stringify({
          struggling: "Contribution simple, support constant",
          onLevel: "Participation active standard",
          advanced: "Leadership dans la création, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Participation à la création des règles
Compréhension du processus démocratique
Engagement envers les règles`,

        isSubFriendly: true,
        subNotes: `Focus: Création démocratique des règles de classe.
Activité principale: Vote et création de charte.
Important: Tous participent, sentiment d'appartenance.
Processus démocratique simplifié.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 3: Les conséquences des actions
    const lesson3 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les conséquences des actions',
        date: new Date('2026-01-07'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les actions ont des conséquences
• Identifier les conséquences positives et négatives
• Faire des choix réfléchis`,

        mindsOn: `La pierre dans l'eau (10 min)
• Bac d'eau calme
• Lancer une petite pierre
• Observer les ondulations
• "Nos actions sont comme la pierre"
• "Les conséquences sont les vagues"
• Discussion: Les vagues touchent tout
• Introduction: Explorons les conséquences`,

        action: `Cause et effet en action (28 min)

PARTIE 1: Chaînes de conséquences (13 min)
• Scénarios illustrés:
  - Partager son goûter → ami content → amitié
  - Pousser dans la file → ami triste → conflit
  - Aider à ranger → classe propre → tous contents
• Tracer les flèches de conséquences
• Discussion de chaque chaîne

PARTIE 2: Théâtre des choix (15 min)
• Situations jouées en freeze:
  - Quelqu'un laisse tomber ses crayons
  - Un ami est seul à la récré
  - Quelqu'un coupe la file
• Deux fins possibles jouées
• Vote: Quelle fin préférons-nous?
• Célébration des bons choix`,

        consolidation: `Décideurs responsables (7 min)
• Réflexion personnelle
• "Avant d'agir, je pense à..."
• Création d'un aide-mémoire visuel
• Badge "Décideur réfléchi"
• Mission: Faire un bon choix aujourd'hui`,

        materials: JSON.stringify([
          "Bac d'eau et petites pierres",
          "Cartes de scénarios",
          "Flèches en carton",
          "Accessoires pour théâtre",
          "Badges décideur",
          "Papier pour aide-mémoire"
        ]),

        accommodations: JSON.stringify([
          "Scénarios simplifiés si nécessaire",
          "Support pour le théâtre",
          "Participation flexible",
          "Exemples très concrets",
          "Répétition des concepts"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 scénarios simples, support visuel",
          onLevel: "Participation standard aux activités",
          advanced: "Scénarios complexes, multiple conséquences"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension cause-effet
Capacité à anticiper les conséquences
Application dans les choix`,

        isSubFriendly: true,
        subNotes: `Focus: Comprendre les conséquences des actions.
Activité principale: Chaînes de conséquences et théâtre.
Important: Approche positive, apprentissage par l'exemple.
Matériel de théâtre simple disponible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 4: Vivre ensemble dans le respect
    const lesson4 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Vivre ensemble dans le respect',
        date: new Date('2026-01-09'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Définir le respect dans leurs mots
• Identifier des comportements respectueux
• Pratiquer le respect au quotidien`,

        mindsOn: `Le mot magique: RESPECT (10 min)
• Lettres R-E-S-P-E-C-T affichées
• "Que veut dire ce mot pour vous?"
• Exemples d'enfants
• Gestes de respect modélisés
• Chanson du respect avec mouvements
• Question: Comment montrer du respect?`,

        action: `Le respect en action (28 min)

PARTIE 1: Détectives du respect (13 min)
• Photos/images de situations variées
• Identifier: Respect ou non-respect?
• Tri en deux colonnes
• Pour chaque non-respect: Comment faire mieux?
• Transformation positive des situations

PARTIE 2: Jardin du respect (15 min)
• Chaque élève crée une "fleur de respect"
• Centre: son nom
• Pétales: façons de montrer du respect
  - Écouter, partager, aider, attendre son tour
• Assemblage en bouquet de classe
• Affichage "Notre jardin du respect"`,

        consolidation: `Champions du respect (7 min)
• Cercle de respect
• Regard dans les yeux du voisin
• "Je te respecte quand je..."
• Applaudissements respectueux
• Médaille "Champion du respect"
• Défi: 5 gestes de respect aujourd'hui`,

        materials: JSON.stringify([
          "Lettres R-E-S-P-E-C-T grandes",
          "Photos de situations",
          "Papier pour fleurs",
          "Crayons de couleur",
          "Colle pour assemblage",
          "Médailles respect"
        ]),

        accommodations: JSON.stringify([
          "Exemples concrets et visuels",
          "Support pour création de fleur",
          "Participation graduelle",
          "Répétition des gestes de respect",
          "Renforcement positif constant"
        ]),

        modifications: JSON.stringify({
          struggling: "3 gestes de respect, support visuel",
          onLevel: "5 gestes, création autonome",
          advanced: "Explication approfondie, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de respect
Identification de comportements respectueux
Application pratique observée`,

        isSubFriendly: true,
        subNotes: `Focus: Comprendre et pratiquer le respect.
Activité principale: Détectives et jardin du respect.
Important: Modélisation positive constante.
Renforcement des comportements respectueux.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 2: Rights and Responsibilities (January 12-16, 2026)

    // Lesson 5: J'ai des droits!
    const lesson5 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'J\'ai des droits!',
        date: new Date('2026-01-12'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir qu'ils ont des droits
• Identifier des droits fondamentaux des enfants
• Comprendre que tous les enfants ont les mêmes droits`,

        mindsOn: `Qu'est-ce qu'un droit? (12 min)
• "Tous les enfants ont le droit de..."
• Images: enfant qui joue, mange, apprend
• "Un droit = quelque chose que tous méritent"
• Exemples concrets:
  - Droit d'apprendre (école)
  - Droit d'être en sécurité
  - Droit de jouer
• Réalisation: "J'ai des droits!"`,

        action: `Exploration de nos droits (25 min)

PARTIE 1: Les droits en images (10 min)
• Cartes illustrées des droits:
  - Nourriture et eau
  - Maison sécuritaire
  - Éducation
  - Santé/médecin
  - Jouer et s'amuser
  - Être aimé
• Match image-droit
• Discussion de chaque droit

PARTIE 2: Mon livre des droits (15 min)
• Petit livre personnel créé
• Page par droit important
• Dessiner comment on vit ce droit
• "J'ai le droit de... [dessin]"
• Couverture décorée
• Fierté: "Mes droits!"`,

        consolidation: `Célébration des droits (8 min)
• Présentation des livres
• "Mon droit préféré est..."
• Réalisation: Tous ont les mêmes droits!
• Danse des droits (improvisée)
• Badge "Je connais mes droits"`,

        materials: JSON.stringify([
          "Images représentant les droits",
          "Cartes des droits illustrées",
          "Papier pour mini-livres",
          "Matériel de dessin",
          "Agrafeuse pour livres",
          "Badges droits"
        ]),

        accommodations: JSON.stringify([
          "Droits simplifiés et visuels",
          "Support pour création du livre",
          "Nombre de droits flexible",
          "Aide pour concepts abstraits",
          "Exemples très concrets"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 droits de base, images fournies",
          onLevel: "5-6 droits, création autonome",
          advanced: "Tous les droits, explications détaillées"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de droits
Identification des droits fondamentaux
Reconnaissance de l'universalité des droits`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction aux droits des enfants.
Activité principale: Exploration et livre des droits.
Important: Concepts simplifiés et positifs.
Vocabulaire adapté à l'âge.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 6: J'ai aussi des responsabilités
    const lesson6 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'J\'ai aussi des responsabilités',
        date: new Date('2026-01-13'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est une responsabilité
• Identifier leurs responsabilités à l'école et à la maison
• Faire le lien entre droits et responsabilités`,

        mindsOn: `Super-héros responsables (10 min)
• "Les super-héros ont des pouvoirs ET des responsabilités"
• Spider-Man: "Avec le pouvoir vient la responsabilité"
• Discussion: Nos "pouvoirs" = nos capacités
• Nos responsabilités = ce qu'on doit faire
• Exemples: ranger, partager, écouter
• Question: Quelles sont vos responsabilités?`,

        action: `Mes responsabilités partout (28 min)

PARTIE 1: Carte des responsabilités (13 min)
• Trois zones: École, Maison, Communauté
• Brainstorm des responsabilités:
  - École: écouter, ranger, être gentil
  - Maison: aider, ranger chambre
  - Communauté: respecter l'environnement
• Placement sur la carte
• Réalisation: J'ai beaucoup de responsabilités!

PARTIE 2: Balance droits-responsabilités (15 min)
• Balance visuelle (dessinée)
• D'un côté: Mes droits (de hier)
• De l'autre: Mes responsabilités
• Connexions tracées:
  - Droit d'apprendre → Responsabilité d'écouter
  - Droit de jouer → Responsabilité de partager
• Équilibre observé`,

        consolidation: `Engagement responsable (7 min)
• Certificat de responsabilité personnalisé
• Chacun choisit UNE responsabilité focus
• "Cette semaine, je serai responsable de..."
• Signature officielle
• Photo avec certificats
• Fierté d'être responsable!`,

        materials: JSON.stringify([
          "Image de super-héros",
          "Grande carte 3 zones",
          "Post-its ou étiquettes",
          "Balance dessinée",
          "Certificats responsabilité",
          "Marqueurs"
        ]),

        accommodations: JSON.stringify([
          "Responsabilités adaptées aux capacités",
          "Support visuel constant",
          "Exemples personnalisés",
          "Aide pour les connexions",
          "Choix flexible de responsabilité"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 responsabilités simples",
          onLevel: "5-6 responsabilités variées",
          advanced: "Multiples responsabilités, leadership"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de responsabilité
Capacité à identifier ses responsabilités
Lien fait entre droits et responsabilités`,

        isSubFriendly: true,
        subNotes: `Focus: Comprendre les responsabilités personnelles.
Activité principale: Carte et balance droits-responsabilités.
Important: Responsabilités vues positivement.
Lien clair avec les droits.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 7: L'équité pour tous
    const lesson7 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'L\'équité pour tous',
        date: new Date('2026-01-14'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre la différence entre égalité et équité
• Reconnaître que les besoins sont différents
• Développer l'empathie et la compréhension`,

        mindsOn: `Les boîtes pour voir (12 min)
• 3 enfants de tailles différentes (image/démonstration)
• Veulent voir par-dessus une clôture
• Égalité: tous ont la même boîte
• Problème: Le plus petit ne voit toujours pas!
• Équité: chacun a ce dont il a besoin
• Tous peuvent maintenant voir!
• Discussion: Juste vs Égal`,

        action: `L'équité en action (25 min)

PARTIE 1: Besoins différents (10 min)
• Scénarios de classe:
  - Élève qui a besoin de lunettes
  - Élève qui apprend différemment
  - Élève qui parle une autre langue
• Discussion: Comment aider chacun?
• Solutions équitables trouvées ensemble

PARTIE 2: Projet équité (15 min)
• Création d'affiches "Équité dans notre classe"
• Dessiner des situations équitables:
  - Aide supplémentaire si besoin
  - Outils différents pour réussir
  - Patience et compréhension
• Messages positifs ajoutés
• Galerie d'équité créée`,

        consolidation: `Champions de l'équité (8 min)
• Tour de la galerie
• "Pour être équitable, je peux..."
• Engagement: Regarder les besoins, pas juste l'égalité
• Ruban "Champion de l'équité"
• Mission: Pratiquer l'équité cette semaine`,

        materials: JSON.stringify([
          "Image/démonstration des boîtes",
          "Cartes de scénarios",
          "Papier pour affiches",
          "Matériel d'art",
          "Rubans équité",
          "Exemples visuels d'équité"
        ]),

        accommodations: JSON.stringify([
          "Concept simplifié avec exemples concrets",
          "Support visuel important",
          "Discussion guidée",
          "Participation flexible",
          "Répétition du concept clé"
        ]),

        modifications: JSON.stringify({
          struggling: "Concept de base, 1-2 exemples",
          onLevel: "Compréhension standard, création d'affiche",
          advanced: "Exemples complexes, explication aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension équité vs égalité
Capacité à identifier les besoins différents
Développement de l'empathie`,

        isSubFriendly: true,
        subNotes: `Focus: Comprendre l'équité vs égalité.
Activité principale: Scénarios et affiches d'équité.
Important: Concept abstrait rendu concret.
Message positif d'inclusion.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 8: Célébration de notre communauté respectueuse
    const lesson8 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration de notre communauté respectueuse',
        date: new Date('2026-01-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer les apprentissages sur les règles et le respect
• Démontrer leur compréhension des droits et responsabilités
• Renforcer l'engagement communautaire`,

        mindsOn: `Rappel de notre voyage (10 min)
• Photos/travaux des 2 semaines affichés
• "Regardez tout ce qu'on a appris!"
• Rappel rapide: règles, respect, droits, responsabilités
• Question: Comment créer une belle communauté?
• Annonce: Célébrons notre communauté!`,

        action: `Festival de la communauté (30 min)

PARTIE 1: Exposition interactive (15 min)
• Stations des apprentissages:
  - Station 1: Notre charte de classe
  - Station 2: Jardin du respect
  - Station 3: Livres des droits
  - Station 4: Certificats de responsabilité
• Rotation et présentation aux pairs
• Tampons collectés à chaque station

PARTIE 2: Spectacle communautaire (15 min)
• Chanson des règles (tous ensemble)
• Démonstration de respect (saynètes)
• Récitation des droits
• Parade des responsables
• Danse de la communauté
• Applaudissements pour tous!`,

        consolidation: `Engagement futur (5 min)
• Cercle de la communauté
• Mains au centre
• "Nous promettons de vivre ensemble dans..."
• "LE RESPECT!" (tous ensemble)
• Photo de groupe
• Diplômes "Membre extraordinaire de notre communauté"`,

        materials: JSON.stringify([
          "Tous les travaux des 2 semaines",
          "Tampons pour passeport",
          "Musique pour danse",
          "Microphone de spectacle",
          "Diplômes communauté",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés selon confort",
          "Support pour présentations",
          "Participation flexible",
          "Célébration de tous les efforts",
          "Options non-verbales disponibles"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, beaucoup de support",
          onLevel: "Participation active complète",
          advanced: "Rôles de leadership, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Démonstration des apprentissages
Application des concepts appris
Engagement communautaire observé`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration des 2 semaines d'apprentissage.
Activité principale: Exposition et spectacle.
Important: Ambiance festive et inclusive.
Valorisation de tous les progrès.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 1: Pourquoi des règles?');
    console.log('✅ Created Lesson 2: Les règles de notre classe');
    console.log('✅ Created Lesson 3: Les conséquences des actions');
    console.log('✅ Created Lesson 4: Vivre ensemble dans le respect');
    console.log('✅ Created Lesson 5: J\'ai des droits!');
    console.log('✅ Created Lesson 6: J\'ai aussi des responsabilités');
    console.log('✅ Created Lesson 7: L\'équité pour tous');
    console.log('✅ Created Lesson 8: Célébration de notre communauté respectueuse');

    console.log('\n📊 WEEKS 1-2 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Vivre ensemble');
    console.log('Dates: January 5-16, 2026');
    console.log('\nWeek 1 Focus:');
    console.log('✅ Understanding why we need rules');
    console.log('✅ Creating classroom rules together');
    console.log('✅ Understanding consequences');
    console.log('✅ Learning about respect');
    console.log('\nWeek 2 Focus:');
    console.log('✅ Discovering children\'s rights');
    console.log('✅ Understanding responsibilities');
    console.log('✅ Learning about equity vs equality');
    console.log('✅ Community celebration');
    console.log('\nKey Features:');
    console.log('✅ Democratic participation');
    console.log('✅ Rights-based approach');
    console.log('✅ Concrete examples for abstract concepts');
    console.log('✅ Community building focus');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks1And2VivreLessons().catch(console.error);