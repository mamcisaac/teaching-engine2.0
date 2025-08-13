import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks7To9CitoyensLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 7-9');
  console.log('Unit: Citoyens responsables');
  console.log('Focus: Environmental Citizenship');
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
        title: 'Citoyens responsables'
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
      throw new Error('Unit plan Citoyens responsables not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 12 lessons for Weeks 7-9\n');

    // WEEK 7: Our Environment Needs Us (May 11-15, 2026)
    
    // Lesson 25: Notre environnement, notre maison
    const lesson25 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre environnement, notre maison',
        date: new Date('2026-05-11'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que l'environnement est notre grande maison
• Identifier les éléments de l'environnement
• Reconnaître notre responsabilité`,

        mindsOn: `La maison de tous (10 min)
• Image: Terre dans une maison de verre
• "La Terre est la maison de qui?"
• Humains, animaux, plantes... TOUS!
• "Que se passe-t-il si la maison est sale?"
• Discussion: Qui nettoie?
• Introduction: Nous sommes les gardiens!`,

        action: `Gardiens de l'environnement (28 min)

PARTIE 1: Inventaire de notre maison (13 min)
• Exploration des éléments:
  - Air (pour respirer)
  - Eau (pour boire)
  - Sol (pour pousser)
  - Arbres (oxygène)
  - Animaux (biodiversité)
• Importance de chaque élément
• "Sans ça, que se passe-t-il?"
• Interconnexion comprise

PARTIE 2: Carte de gardien (15 min)
• Création d'une carte officielle:
  "Gardien de l'environnement"
• Photo/dessin de soi
• Promesses écrites/dessinées:
  - Protéger l'eau
  - Garder l'air propre
  - Respecter la nature
  - Aider les animaux
• Signature solennelle
• Badge de gardien attaché`,

        consolidation: `Serment des gardiens (7 min)
• Lever la main droite
• "Je promets de protéger..."
• "Notre maison la Terre!"
• Remise officielle des cartes
• Photo des nouveaux gardiens
• Mission: Observer l'environnement`,

        materials: JSON.stringify([
          "Image Terre-maison",
          "Photos d'éléments naturels",
          "Cartes de gardien vierges",
          "Badges gardien",
          "Matériel de décoration",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Concepts simplifiés",
          "Support visuel constant",
          "Aide pour promesses",
          "Expression flexible",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 promesses simples",
          onLevel: "Carte complète standard",
          advanced: "Détails écologiques, connexions"
        }),

        assessmentType: 'Diagnostique',
        assessmentNotes: `Compréhension de l'environnement global
Reconnaissance de la responsabilité
Engagement initial`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction à la responsabilité environnementale.
Activité principale: Carte de gardien.
Important: Message positif d'empowerment.
Éviter l'éco-anxiété.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 26: Réduire nos déchets
    const lesson26 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réduire nos déchets',
        date: new Date('2026-05-12'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'impact des déchets
• Apprendre à réduire les déchets
• Développer de bonnes habitudes`,

        mindsOn: `La montagne de déchets (10 min)
• Sac poubelle d'une journée montré
• "Tout ça en UN jour!"
• Multiplication: 365 jours = ?
• Visualisation: Montagne énorme!
• "Où vont les déchets?"
• Introduction: Réduisons!`,

        action: `Zéro déchet junior (28 min)

PARTIE 1: Analyse des déchets (13 min)
• Tri du sac (avec gants):
  - Recyclable
  - Compostable
  - Réutilisable
  - Vrai déchet
• Surprise: Peu de vrais déchets!
• Discussion: Comment éviter?
• Solutions trouvées ensemble

PARTIE 2: Mon kit zéro déchet (15 min)
• Création d'un kit personnel:
  - Bouteille réutilisable (dessinée)
  - Boîte à lunch durable
  - Sac réutilisable
  - Ustensiles lavables
• Plan d'utilisation
• Décoration du "passeport zéro déchet"
• Engagement personnel`,

        consolidation: `Champions zéro déchet (7 min)
• Présentation des kits
• "Mon action sera..."
• Badge "Héros zéro déchet"
• Défi: Une journée sans déchet!
• Photo de l'équipe verte`,

        materials: JSON.stringify([
          "Sac de déchets (propres)",
          "Gants de protection",
          "Bacs de tri",
          "Papier pour kit",
          "Badges héros",
          "Exemples d'objets réutilisables"
        ]),

        accommodations: JSON.stringify([
          "Manipulation supervisée",
          "Concepts adaptés",
          "Support pour solutions",
          "Flexibilité des engagements",
          "Aide constante"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 actions simples",
          onLevel: "Kit complet, engagement",
          advanced: "Plan détaillé, famille impliquée"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience de l'impact des déchets
Solutions pratiques identifiées
Engagement à réduire`,

        isSubFriendly: true,
        subNotes: `Focus: Réduction des déchets.
Activité principale: Kit zéro déchet personnel.
Important: Sécurité lors du tri.
Solutions réalistes pour l'âge.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 27: Réutiliser et recycler
    const lesson27 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réutiliser et recycler',
        date: new Date('2026-05-13'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre la réutilisation et le recyclage
• Apprendre à transformer les déchets
• Développer la créativité écologique`,

        mindsOn: `La magie de la transformation (10 min)
• Bouteille plastique montrée
• "Poubelle ou trésor?"
• Transformation: Pot à crayons!
• Boîte de carton → Maison de poupée
• Discussion: Tout peut avoir 2e vie!
• Introduction: Artistes du recyclage!`,

        action: `Atelier de transformation (28 min)

PARTIE 1: Station recyclage (13 min)
• Apprentissage des symboles:
  - ♻️ = Recyclable
  - Numéros 1-7
  - Bacs de couleurs
• Jeu de tri rapide
• Course au recyclage
• Qui trie le mieux?
• Certificat de trieur expert

PARTIE 2: Création recyclée (15 min)
• Matériaux recyclés disponibles
• Choix de création:
  - Instrument de musique
  - Jouet
  - Décoration
  - Outil utile
• Construction créative
• Fierté de la transformation`,

        consolidation: `Expo recyclage (7 min)
• Présentation des créations
• "J'ai transformé... en..."
• Prix de la créativité
• Engagement: Réutiliser avant jeter
• Photo du musée recyclé`,

        materials: JSON.stringify([
          "Objets recyclables variés",
          "Symboles de recyclage",
          "Matériel de bricolage",
          "Colle, ciseaux, ruban",
          "Certificats",
          "Bacs de tri colorés"
        ]),

        accommodations: JSON.stringify([
          "Aide pour création",
          "Objets pré-sélectionnés",
          "Support pour tri",
          "Flexibilité créative",
          "Sécurité assurée"
        ]),

        modifications: JSON.stringify({
          struggling: "Création très simple",
          onLevel: "Projet standard guidé",
          advanced: "Création complexe, innovation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du recyclage
Créativité dans la réutilisation
Application pratique`,

        isSubFriendly: true,
        subNotes: `Focus: Recyclage et réutilisation créative.
Activité principale: Transformation d'objets.
Important: Sécurité avec matériaux.
Valoriser toutes les créations.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 28: Économiser l'eau
    const lesson28 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Économiser l\'eau',
        date: new Date('2026-05-15'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que l'eau est précieuse
• Identifier les gaspillages d'eau
• Adopter des gestes économes`,

        mindsOn: `L'eau disparaît! (10 min)
• Globe terrestre montré
• "Beaucoup d'eau, mais..."
• Verre d'eau salée vs eau douce
• "Laquelle peut-on boire?"
• Très peu d'eau potable!
• Robinet qui goutte (son)
• Introduction: Chaque goutte compte!`,

        action: `Détectives de l'eau (28 min)

PARTIE 1: Chasse au gaspillage (13 min)
• Tour d'inspection (virtuel):
  - Salle de bain: douche longue
  - Cuisine: robinet ouvert
  - École: fontaine qui coule
  - Jardin: arrosage excessif
• Calcul simple: Gouttes perdues
• Solutions pour chaque lieu
• Engagement personnel

PARTIE 2: Mon plan d'économie d'eau (15 min)
• Création d'un plan visuel:
  - Douche de 5 minutes (sablier)
  - Fermer en brossant les dents
  - Verre pour rincer
  - Réutiliser l'eau (plantes)
• Autocollants rappels créés
• Pour la maison
• Contrat familial`,

        consolidation: `Gardiens de l'eau (7 min)
• Démonstration des gestes
• "Je vais économiser en..."
• Goutte d'eau badge
• Défi: Famille économe
• Mission lancée!`,

        materials: JSON.stringify([
          "Globe terrestre",
          "Eau salée et douce",
          "Images de gaspillage",
          "Papier pour plan",
          "Autocollants",
          "Badges goutte d'eau"
        ]),

        accommodations: JSON.stringify([
          "Concepts simplifiés",
          "Démonstrations visuelles",
          "Aide pour plan",
          "Gestes adaptés",
          "Support constant"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 gestes simples",
          onLevel: "Plan complet familial",
          advanced: "Calculs d'économie, détails"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience de la rareté de l'eau
Identification des gaspillages
Plan d'action personnel`,

        isSubFriendly: true,
        subNotes: `Focus: Conservation de l'eau.
Activité principale: Plan d'économie familial.
Important: Gestes concrets et mesurables.
Impliquer les familles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 8: Green Actions (May 18-22, 2026)
    // Note: May 18 is Victoria Day - no school

    // Lesson 29: Protéger les animaux
    const lesson29 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Protéger les animaux',
        date: new Date('2026-05-19'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre les besoins des animaux
• Identifier comment aider les animaux
• Développer le respect du vivant`,

        mindsOn: `Animaux en détresse (10 min)
• Images: oiseau, écureuil, abeille
• "Ils vivent où?"
• Problèmes identifiés:
  - Habitat détruit
  - Nourriture rare
  - Pollution
• "Pouvons-nous aider?"
• OUI! Même les petits gestes!`,

        action: `Amis des animaux (28 min)

PARTIE 1: Besoins des animaux locaux (13 min)
• Animaux de notre région:
  - Oiseaux (graines, eau, abri)
  - Écureuils (noix, arbres)
  - Insectes (fleurs, pas de pesticides)
  - Animaux domestiques (soins, amour)
• Comment aider chacun?
• Solutions simples identifiées

PARTIE 2: Projet aide-animaux (15 min)
• Choix d'action collective:
  Option 1: Mangeoire à oiseaux
  Option 2: Hôtel à insectes
  Option 3: Jardin de papillons
• Vote démocratique
• Planification du projet
• Matériel listé
• Date de construction fixée`,

        consolidation: `Protecteurs certifiés (7 min)
• Engagement animalier
• "Je protège les animaux en..."
• Badge protecteur
• Photo avec mascotte animale
• Mission: Observer et aider`,

        materials: JSON.stringify([
          "Photos d'animaux locaux",
          "Exemples de projets",
          "Matériel de planification",
          "Badges protecteur",
          "Mascotte peluche",
          "Affiches de vote"
        ]),

        accommodations: JSON.stringify([
          "Projets adaptés",
          "Support émotionnel",
          "Participation flexible",
          "Aide à la planification",
          "Respect des peurs"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple",
          onLevel: "Engagement projet complet",
          advanced: "Leadership, recherche"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Empathie envers les animaux
Identification d'actions concrètes
Engagement collectif`,

        isSubFriendly: true,
        subNotes: `Focus: Protection des animaux locaux.
Activité principale: Projet aide-animaux.
Important: Actions réalisables.
Respect de toutes les créatures.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 30: Planter pour l'avenir
    const lesson30 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Planter pour l\'avenir',
        date: new Date('2026-05-20'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance des plantes
• Apprendre à cultiver et soigner
• S'engager pour le verdissement`,

        mindsOn: `L'arbre magique (10 min)
• Image d'un grand arbre
• "Que nous donne l'arbre?"
• Oxygène, ombre, fruits, beauté
• "Un arbre = 100 ans de cadeaux!"
• Graine montrée
• "De ça... à ÇA!"
• Introduction: Plantons l'avenir!`,

        action: `Jardiniers du futur (28 min)

PARTIE 1: Science du jardinage (13 min)
• Besoins des plantes:
  - Terre (nutriments)
  - Eau (croissance)
  - Soleil (énergie)
  - Amour (attention)
• Cycle de vie démontré
• De la graine à la plante
• Patience nécessaire

PARTIE 2: Notre jardin de classe (15 min)
• Plantation collective:
  - Graines de tournesol (rapide)
  - Haricots (observable)
  - Herbes (utiles)
• Chacun plante dans son pot
• Étiquette avec nom et date
• Journal de croissance commencé
• Responsabilités partagées`,

        consolidation: `Jardiniers certifiés (7 min)
• Arrosage inaugural
• "Ma plante va..."
• Certificat de jardinier
• Photo avec les plantations
• Mission: Soigner chaque jour`,

        materials: JSON.stringify([
          "Image d'arbre",
          "Graines variées",
          "Pots et terre",
          "Arrosoirs",
          "Étiquettes",
          "Journaux de croissance"
        ]),

        accommodations: JSON.stringify([
          "Aide pour plantation",
          "Choix de graines",
          "Support pour journal",
          "Flexibilité des soins",
          "Alternative si allergie"
        ]),

        modifications: JSON.stringify({
          struggling: "Une plante simple",
          onLevel: "Plantation et journal standard",
          advanced: "Expériences, comparaisons"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du cycle végétal
Engagement dans les soins
Patience et responsabilité`,

        isSubFriendly: true,
        subNotes: `Focus: Plantation et soins des végétaux.
Activité principale: Jardin de classe.
Important: Suivi quotidien nécessaire.
Prévoir l'entretien continu.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 31: Transport écologique
    const lesson31 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Transport écologique',
        date: new Date('2026-05-21'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'impact des transports
• Identifier les transports verts
• Encourager les choix écologiques`,

        mindsOn: `La course des transports (10 min)
• Images: voiture, vélo, bus, marche
• "Comment venez-vous à l'école?"
• Nuage de pollution dessiné
• Qui pollue? Qui non?
• Classement du plus au moins vert
• Introduction: Transports amis de la Terre!`,

        action: `Voyageurs verts (28 min)

PARTIE 1: Analyse des transports (13 min)
• Échelle verte créée:
  1. Marche/trottinette (💚💚💚)
  2. Vélo (💚💚💚)
  3. Bus scolaire (💚💚)
  4. Covoiturage (💚)
  5. Auto seule (❤️)
• Avantages de chaque
• Calcul: Si tous marchaient...?

PARTIE 2: Mon plan transport vert (15 min)
• Carte du trajet maison-école
• Options vertes identifiées:
  - Jours de marche
  - Bus possible?
  - Vélo au printemps?
  - Covoiturage organisé?
• Calendrier vert créé
• Engagement familial`,

        consolidation: `Voyageurs responsables (7 min)
• Présentation des plans
• "Je vais essayer de..."
• Badge éco-voyageur
• Défi: Semaine verte transport
• Photo de l'équipe verte`,

        materials: JSON.stringify([
          "Images de transports",
          "Échelle verte visuelle",
          "Cartes de trajets",
          "Calendriers",
          "Badges éco-voyageur",
          "Autocollants verts"
        ]),

        accommodations: JSON.stringify([
          "Respect des contraintes familiales",
          "Options adaptées",
          "Support pour plan",
          "Flexibilité totale",
          "Pas de culpabilisation"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 options simples",
          onLevel: "Plan hebdomadaire",
          advanced: "Calculs CO2, famille impliquée"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience de l'impact transport
Identification d'alternatives
Engagement réaliste`,

        isSubFriendly: true,
        subNotes: `Focus: Transports écologiques.
Activité principale: Plan transport vert.
Important: Respecter toutes les situations.
Message positif sans jugement.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 32: Énergie et économies
    const lesson32 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Énergie et économies',
        date: new Date('2026-05-22'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'énergie et son importance
• Identifier les gaspillages énergétiques
• Adopter des gestes économes`,

        mindsOn: `L'énergie invisible (10 min)
• Interrupteur on/off démontré
• "D'où vient la lumière?"
• Électricité expliquée simplement
• "Comment on la fabrique?"
• Coûts pour la planète
• Introduction: Économisons l'énergie!`,

        action: `Chasseurs d'énergie (28 min)

PARTIE 1: Détective énergie (13 min)
• Inspection de la classe:
  - Lumières inutiles
  - Appareils en veille
  - Fenêtres ouvertes (chauffage)
  - Ordinateurs allumés
• Gaspillages identifiés
• Solutions trouvées
• Responsables nommés

PARTIE 2: Kit économie d'énergie (15 min)
• Création d'outils:
  - Autocollants "Éteins-moi!"
  - Affiches rappel
  - Compteur d'économies
  - Certificats éco-énergie
• Installation dans la classe
• Plan pour la maison`,

        consolidation: `Économes certifiés (7 min)
• Engagement énergétique
• "J'économise en..."
• Badge éclair vert
• Mission: Famille économe
• Éteindre les lumières!`,

        materials: JSON.stringify([
          "Interrupteur démo",
          "Autocollants",
          "Matériel affiches",
          "Compteur visuel",
          "Badges éclair",
          "Certificats"
        ]),

        accommodations: JSON.stringify([
          "Concepts simplifiés",
          "Actions concrètes",
          "Support visuel",
          "Participation adaptée",
          "Flexibilité"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 gestes de base",
          onLevel: "Kit complet, engagement",
          advanced: "Calculs économie, leadership"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'énergie
Identification des économies
Application pratique`,

        isSubFriendly: true,
        subNotes: `Focus: Économies d'énergie.
Activité principale: Kit économie classe/maison.
Important: Actions visibles et mesurables.
Renforcement positif.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 9: Environmental Action (May 25-29, 2026)

    // Lesson 33: Notre éco-école
    const lesson33 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre éco-école',
        date: new Date('2026-05-25'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Évaluer les pratiques écologiques de l'école
• Proposer des améliorations
• S'engager dans un projet école`,

        mindsOn: `École verte ou pas? (10 min)
• Check-list projetée:
  ✓ Recyclage?
  ✓ Compost?
  ✓ Jardin?
  ✓ Économies?
• Évaluation collective
• "Que manque-t-il?"
• Introduction: Rendons l'école plus verte!`,

        action: `Transformation verte (28 min)

PARTIE 1: Audit écologique (13 min)
• Tour d'inspection avec grille:
  - Déchets et recyclage
  - Utilisation de l'eau
  - Énergie
  - Espaces verts
  - Transport
• Notes prises
• Points forts/faibles
• Priorités identifiées

PARTIE 2: Projet éco-école (15 min)
• Choix du projet prioritaire:
  - Brigade recyclage
  - Jardin scolaire
  - Compost collectif
  - Défis éco-classes
• Plan d'action créé
• Présentation à la direction
• Lancement officiel`,

        consolidation: `Éco-leaders (7 min)
• Badges éco-leader
• Serment écologique
• Photo équipe verte
• Annonce dans l'école
• Mission lancée!`,

        materials: JSON.stringify([
          "Check-list écologique",
          "Grilles d'audit",
          "Plan d'action",
          "Badges éco-leader",
          "Matériel présentation",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Inspection guidée",
          "Support pour audit",
          "Rôles variés",
          "Participation flexible",
          "Aide à la présentation"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple",
          onLevel: "Audit et planification",
          advanced: "Leadership, présentation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Évaluation critique constructive
Propositions concrètes
Leadership environnemental`,

        isSubFriendly: true,
        subNotes: `Focus: Projet éco-école.
Activité principale: Audit et planification.
Important: Impliquer l'administration.
Projet réalisable à long terme.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 34: Sensibilisation communautaire
    const lesson34 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Sensibilisation communautaire',
        date: new Date('2026-05-26'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Partager leurs connaissances écologiques
• Créer des outils de sensibilisation
• Influencer positivement leur entourage`,

        mindsOn: `Effet domino vert (10 min)
• Dominos verts installés
• "Si je recycle..."
• "Mon ami voit et recycle..."
• "Sa famille recycle..."
• Effet domino démontré
• Introduction: Répandons le message!`,

        action: `Campagne verte (28 min)

PARTIE 1: Messages d'impact (13 min)
• Création de slogans:
  - "Sauvons la Terre!"
  - "Chaque geste compte!"
  - "Ensemble pour la planète!"
• Affiches de sensibilisation
• Dessins percutants
• Messages clairs et positifs

PARTIE 2: Outils de diffusion (15 min)
• Production d'outils:
  - Macarons verts
  - Signets écologiques
  - Autocollants rappels
  - Mini-guides familiaux
• Production en série
• Préparation distribution`,

        consolidation: `Ambassadeurs verts (7 min)
• Présentation des outils
• Plan de distribution
• Serment ambassadeur
• Photo campagne
• Lancement officiel!`,

        materials: JSON.stringify([
          "Dominos verts",
          "Matériel affiches",
          "Papier macarons",
          "Matériel création",
          "Photocopies",
          "Sacs distribution"
        ]),

        accommodations: JSON.stringify([
          "Messages simplifiés",
          "Support créatif",
          "Production adaptée",
          "Rôles variés",
          "Flexibilité"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 outils simples",
          onLevel: "Production standard",
          advanced: "Coordination campagne"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Communication écologique
Créativité dans les messages
Leadership de sensibilisation`,

        isSubFriendly: true,
        subNotes: `Focus: Campagne de sensibilisation.
Activité principale: Création d'outils.
Important: Messages positifs et motivants.
Distribution planifiée.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 35: Célébration verte
    const lesson35 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration verte',
        date: new Date('2026-05-27'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer leurs actions écologiques
• Partager leurs réussites
• S'engager pour l'avenir`,

        mindsOn: `Notre impact vert (10 min)
• Photos "avant/après" montrées
• Déchets réduits
• Plantes qui poussent
• Économies réalisées
• "Regardez ce qu'on a fait!"
• Fierté collective!`,

        action: `Festival écologique (30 min)

PARTIE 1: Exposition verte (15 min)
• Stands présentant:
  - Projets réalisés
  - Économies mesurées
  - Créations recyclées
  - Jardin de classe
  - Outils créés
• Visiteurs invités
• Guides experts

PARTIE 2: Cérémonie de reconnaissance (15 min)
• Remise de certificats:
  - Gardien de l'environnement
  - Héros zéro déchet
  - Champion du recyclage
  - Jardinier expert
• Témoignages
• Engagements futurs`,

        consolidation: `Promesse verte (5 min)
• Cercle de la Terre
• Mains unies au centre
• "Pour la Terre, nous promettons..."
• Photo finale
• Fête écologique!`,

        materials: JSON.stringify([
          "Photos avant/après",
          "Matériel exposition",
          "Certificats variés",
          "Décorations vertes",
          "Rafraîchissements bio",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Présentation adaptée",
          "Support disponible",
          "Rôles flexibles",
          "Participation variable",
          "Célébration inclusive"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple",
          onLevel: "Présentation standard",
          advanced: "Maître de cérémonie"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Démonstration des apprentissages
Réflexion sur l'impact
Engagement continu`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration des actions écologiques.
Activité principale: Exposition et cérémonie.
Important: Valoriser tous les efforts.
Momentum pour continuer.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 36: Plan d'action familial
    const lesson36 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Plan d\'action familial',
        date: new Date('2026-05-29'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Transférer les apprentissages à la maison
• Créer un plan familial écologique
• Devenir agents de changement`,

        mindsOn: `Ma famille verte (10 min)
• "Qui veut une famille verte?"
• Tous les mains levées!
• "Comment faire?"
• Partager nos connaissances!
• Être l'exemple!
• Introduction: Plan familial!`,

        action: `Stratèges familiaux (28 min)

PARTIE 1: Évaluation familiale (13 min)
• Grille d'évaluation maison:
  - Recyclage fait?
  - Eau économisée?
  - Énergie gaspillée?
  - Déchets réduits?
  - Transport vert?
• Notes mentales prises
• Améliorations possibles

PARTIE 2: Contrat familial vert (15 min)
• Création du contrat:
  "Notre famille s'engage à..."
  - 5 actions concrètes
  - Calendrier de mise en œuvre
  - Récompenses prévues
  - Signatures de tous
• Décoration officielle
• Préparation présentation`,

        consolidation: `Agents du changement (7 min)
• Répétition de la présentation
• "Famille, j'ai une idée!"
• Badge agent du changement
• Mission: Convaincre ce soir!
• Courage et détermination!`,

        materials: JSON.stringify([
          "Grille évaluation",
          "Modèle de contrat",
          "Matériel décoration",
          "Badges agent",
          "Enveloppes",
          "Exemples d'actions"
        ]),

        accommodations: JSON.stringify([
          "Contrat simplifié",
          "Support pour évaluation",
          "Actions adaptées",
          "Flexibilité familiale",
          "Aide à la présentation"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 actions simples",
          onLevel: "Contrat complet standard",
          advanced: "Plan détaillé, calculs"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Transfert des connaissances
Leadership familial
Engagement personnel fort`,

        isSubFriendly: true,
        subNotes: `Focus: Plan d'action familial.
Activité principale: Contrat familial vert.
Important: Respecter toutes les familles.
Suivi prévu la semaine prochaine.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 25: Notre environnement, notre maison');
    console.log('✅ Created Lesson 26: Réduire nos déchets');
    console.log('✅ Created Lesson 27: Réutiliser et recycler');
    console.log('✅ Created Lesson 28: Économiser l\'eau');
    console.log('✅ Created Lesson 29: Protéger les animaux');
    console.log('✅ Created Lesson 30: Planter pour l\'avenir');
    console.log('✅ Created Lesson 31: Transport écologique');
    console.log('✅ Created Lesson 32: Énergie et économies');
    console.log('✅ Created Lesson 33: Notre éco-école');
    console.log('✅ Created Lesson 34: Sensibilisation communautaire');
    console.log('✅ Created Lesson 35: Célébration verte');
    console.log('✅ Created Lesson 36: Plan d\'action familial');

    console.log('\n📊 WEEKS 7-9 SUMMARY');
    console.log('===================');
    console.log('Created 12 perfect lesson plans for Sciences humaines');
    console.log('Unit: Citoyens responsables');
    console.log('Dates: May 11-29, 2026');
    console.log('\nWeek 7 Focus:');
    console.log('✅ Environmental awareness');
    console.log('✅ Waste reduction and recycling');
    console.log('✅ Water conservation');
    console.log('\nWeek 8 Focus:');
    console.log('✅ Animal protection');
    console.log('✅ Planting and gardening');
    console.log('✅ Green transportation');
    console.log('✅ Energy conservation');
    console.log('\nWeek 9 Focus:');
    console.log('✅ Eco-school project');
    console.log('✅ Community awareness campaign');
    console.log('✅ Celebration and family action');
    console.log('\nKey Features:');
    console.log('✅ Concrete environmental actions');
    console.log('✅ School and home connections');
    console.log('✅ Empowerment without anxiety');
    console.log('✅ Measurable impacts');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks7To9CitoyensLessons().catch(console.error);