import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks5And6VivreLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 5-6');
  console.log('Unit: Vivre ensemble');
  console.log('Focus: Fairness and Community Service');
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
    console.log('Creating 8 lessons for Weeks 5-6\n');

    // WEEK 5: Fairness and Justice (February 2-6, 2026)
    
    // Lesson 17: C'est juste ou injuste?
    const lesson17 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'C\'est juste ou injuste?',
        date: new Date('2026-02-02'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Distinguer les situations justes et injustes
• Développer leur sens de la justice
• Comprendre que la justice est importante`,

        mindsOn: `La balance de la justice (10 min)
• Balance à deux plateaux présentée
• Démonstration: équilibré vs déséquilibré
• "La justice, c'est comme cette balance"
• Exemples concrets:
  - 2 biscuits pour 2 enfants = juste
  - 5 biscuits pour 1, 0 pour l'autre = injuste
• Question: Qu'est-ce qui est juste?`,

        action: `Détectives de la justice (28 min)

PARTIE 1: Le tribunal des situations (13 min)
• Scénarios illustrés présentés:
  - Tous ont un tour au jeu
  - Un élève prend tous les crayons
  - Partage égal des collations
  - Quelqu'un triche au jeu
• Vote avec cartons: Juste (vert) ou Injuste (rouge)
• Discussion de chaque situation
• Transformation: Comment rendre juste?

PARTIE 2: Notre code de justice (15 min)
• Création collective du code
• "Dans notre classe, c'est juste quand..."
  - Tout le monde a sa chance
  - Les règles sont pareilles pour tous
  - On partage équitablement
  - On respecte les tours
• Illustration de chaque principe
• Affiche officielle créée`,

        consolidation: `Juges de la justice (7 min)
• Serment des juges justes
• "Je promets d'être juste avec tous"
• Marteau de juge symbolique
• Badge "Gardien de la justice"
• Mission: Repérer l'injustice et agir`,

        materials: JSON.stringify([
          "Balance à plateaux",
          "Cartons verts et rouges",
          "Scénarios illustrés",
          "Grande affiche pour code",
          "Marteau jouet",
          "Badges gardien de justice"
        ]),

        accommodations: JSON.stringify([
          "Exemples concrets et visuels",
          "Support pour comprendre la justice",
          "Vote non-verbal accepté",
          "Participation flexible",
          "Aide pour formulation"
        ]),

        modifications: JSON.stringify({
          struggling: "Concepts très simples, binaire juste/injuste",
          onLevel: "Compréhension standard, nuances simples",
          advanced: "Situations complexes, solutions créatives"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance du juste et de l'injuste
Développement du sens moral
Capacité à transformer l'injustice`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction aux concepts de justice.
Activité principale: Tribunal et code de justice.
Important: Exemples très concrets et clairs.
Affiche du code à laisser visible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 18: Défendre les autres
    const lesson18 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Défendre les autres',
        date: new Date('2026-02-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre à être un allié
• Développer le courage de défendre les autres
• Comprendre comment intervenir de façon sécuritaire`,

        mindsOn: `Le super-héros de la gentillesse (10 min)
• Cape de super-héros présentée
• "Les vrais héros défendent les autres"
• Pas besoin de super-pouvoirs!
• Pouvoirs réels: courage, gentillesse, voix
• Exemples de héros du quotidien
• Question: Comment être un héros?`,

        action: `École des super-héros (28 min)

PARTIE 1: Les pouvoirs de l'allié (13 min)
• 4 super-pouvoirs enseignés:
  1. VOIR - Remarquer l'injustice
  2. DIRE - "Ce n'est pas correct!"
  3. AIDER - Consoler la personne
  4. CHERCHER - Trouver un adulte si besoin
• Pratique de chaque pouvoir
• Gestes de super-héros créés
• Répétition en groupe

PARTIE 2: Missions de héros (15 min)
• Scénarios de pratique:
  - Quelqu'un se moque d'un ami
  - Un élève est exclu du jeu
  - Quelqu'un prend le lunch d'un autre
• Pratique des interventions
• Jeu de rôle: héros, victime, méchant
• Rotation des rôles
• Célébration du courage`,

        consolidation: `Diplôme de super-héros (7 min)
• Cérémonie de graduation
• Remise des capes symboliques
• Serment du héros: "Je protège les autres"
• Photo de la classe des héros
• Mission: Un acte héroïque cette semaine`,

        materials: JSON.stringify([
          "Cape de super-héros",
          "Cartes des 4 pouvoirs",
          "Scénarios de pratique",
          "Diplômes de héros",
          "Capes en papier/tissu",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Interventions adaptées aux capacités",
          "Support pour jeux de rôle",
          "Options non-verbales disponibles",
          "Pratique en petit groupe",
          "Validation du courage à tous niveaux"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 pouvoirs simples, beaucoup de support",
          onLevel: "4 pouvoirs, pratique autonome",
          advanced: "Stratégies complexes, mentorat"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du rôle d'allié
Développement du courage moral
Stratégies d'intervention apprises`,

        isSubFriendly: true,
        subNotes: `Focus: Apprendre à défendre les autres.
Activité principale: École des super-héros.
Important: Sécurité d'abord, chercher l'adulte si nécessaire.
Ambiance ludique mais message sérieux.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 19: L'inclusion pour tous
    const lesson19 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'L\'inclusion pour tous',
        date: new Date('2026-02-04'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est l'inclusion
• Apprendre à inclure tout le monde
• Développer des stratégies d'inclusion`,

        mindsOn: `Le cercle incomplet (10 min)
• Former un cercle, laisser un espace
• "Notre cercle n'est pas complet!"
• Inviter l'élève manquant
• "Maintenant c'est parfait!"
• Discussion: Comment se sent-on dehors du cercle?
• Introduction: L'inclusion = tous dans le cercle`,

        action: `Maîtres de l'inclusion (28 min)

PARTIE 1: Les barrières invisibles (13 min)
• Situations d'exclusion discutées:
  - "Tu ne peux pas jouer, tu es trop petit"
  - "C'est juste pour les garçons/filles"
  - "Tu ne parles pas bien français"
  - "Tu cours pas assez vite"
• Identifier les barrières
• Brainstorm: Comment les enlever?
• Solutions inclusives trouvées

PARTIE 2: Le pont de l'inclusion (15 min)
• Construction d'un pont symbolique
• Chaque planche = stratégie d'inclusion:
  - Inviter quelqu'un de nouveau
  - Adapter le jeu pour tous
  - Aider quelqu'un à comprendre
  - Dire "Viens avec nous!"
• Décoration du pont
• Test: Tout le monde peut traverser!`,

        consolidation: `Ambassadeurs de l'inclusion (7 min)
• Engagement d'inclusion signé
• "Personne ne reste dehors du cercle"
• Ruban d'inclusion remis
• Création du cri: "Tous ensemble!"
• Mission: Inclure quelqu'un chaque jour`,

        materials: JSON.stringify([
          "Matériel pour pont (carton, bois)",
          "Situations d'exclusion illustrées",
          "Papier pour engagement",
          "Rubans d'inclusion",
          "Marqueurs et décoration",
          "Colle et ciseaux"
        ]),

        accommodations: JSON.stringify([
          "Exemples adaptés aux expériences",
          "Support pour identifier l'exclusion",
          "Participation selon confort",
          "Stratégies personnalisées",
          "Célébration de tous les efforts"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 stratégies simples d'inclusion",
          onLevel: "Multiples stratégies, application",
          advanced: "Leadership inclusif, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'inclusion
Identification des barrières
Stratégies d'inclusion développées`,

        isSubFriendly: true,
        subNotes: `Focus: Développement de l'inclusion active.
Activité principale: Construction du pont d'inclusion.
Important: Sensibilité aux expériences d'exclusion.
Message positif et proactif.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 20: Réparation et pardon
    const lesson20 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réparation et pardon',
        date: new Date('2026-02-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre à réparer leurs erreurs
• Comprendre le pouvoir du pardon
• Pratiquer la réconciliation`,

        mindsOn: `Le vase brisé (10 min)
• Vase en papier "cassé" en morceaux
• "Parfois on casse des choses... ou des cœurs"
• Recoller les morceaux ensemble
• "On peut réparer!"
• Discussion: Comment réparer une amitié?
• Introduction: La magie de la réparation`,

        action: `Atelier de réparation (28 min)

PARTIE 1: Les outils de réparation (13 min)
• Boîte à outils de réparation:
  - Outil 1: Excuses sincères
  - Outil 2: Actions réparatrices
  - Outil 3: Promesse de changement
  - Outil 4: Demande de pardon
• Pratique avec marionnettes
• Scénarios: J'ai cassé ton crayon, j'ai dit des mots méchants
• Utilisation des outils

PARTIE 2: Le jardin du pardon (15 min)
• Histoire: Deux amis se disputent
• Plantation symbolique:
  - Graine = l'erreur
  - Eau = les excuses
  - Soleil = le pardon
  - Fleur = l'amitié réparée
• Création de fleurs de pardon
• Échange de fleurs entre pairs`,

        consolidation: `Cérémonie de réconciliation (7 min)
• Cercle de pardon
• "Je pardonne facilement parce que..."
• Poignées de main de réconciliation
• Chanson du pardon créée
• Certificat "Maître de la réparation"`,

        materials: JSON.stringify([
          "Vase en papier déchiré",
          "Boîte à outils décorative",
          "Marionnettes",
          "Matériel pour fleurs",
          "Graines symboliques",
          "Certificats réparation"
        ]),

        accommodations: JSON.stringify([
          "Scénarios adaptés",
          "Support pour excuses",
          "Expression flexible du pardon",
          "Pratique individuelle disponible",
          "Respect du rythme émotionnel"
        ]),

        modifications: JSON.stringify({
          struggling: "Excuses simples, beaucoup de modélisation",
          onLevel: "Processus complet de réparation",
          advanced: "Médiation, aide aux réconciliations"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Capacité à s'excuser sincèrement
Compréhension de la réparation
Pratique du pardon`,

        isSubFriendly: true,
        subNotes: `Focus: Apprentissage de la réparation et du pardon.
Activité principale: Boîte à outils et jardin du pardon.
Important: Atmosphère sécurisante et non-jugeante.
Valoriser le courage de réparer.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 6: Community Service (February 9-13, 2026)

    // Lesson 21: Aider dans notre communauté
    const lesson21 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Aider dans notre communauté',
        date: new Date('2026-02-09'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les besoins dans la communauté
• Comprendre qu'ils peuvent faire une différence
• Planifier des actions d'aide`,

        mindsOn: `Les mains qui aident (10 min)
• Tracer nos mains sur papier
• "Que peuvent faire ces petites mains?"
• Brainstorm: nettoyer, partager, consoler...
• Réalisation: Petites mains, grands gestes!
• Question: Qui a besoin d'aide autour de nous?
• Mission: Devenir des mains qui aident`,

        action: `Détectives des besoins (28 min)

PARTIE 1: Carte des besoins (13 min)
• Explorer (mentalement) notre communauté:
  - École: cour à nettoyer?
  - Voisinage: personnes âgées seules?
  - Environnement: déchets à ramasser?
  - Animaux: oiseaux en hiver?
• Carte des besoins créée
• Points rouges = besoins identifiés
• Discussion: Que pouvons-nous faire?

PARTIE 2: Plan d'action communautaire (15 min)
• Choix de 3 projets réalisables:
  1. Nettoyage de la cour d'école
  2. Cartes pour la résidence de personnes âgées
  3. Mangeoires pour oiseaux
• Équipes formées par intérêt
• Planification simple:
  - Quoi? Quand? Comment?
• Affiches de projet créées`,

        consolidation: `Engagement communautaire (7 min)
• Présentation des plans d'équipe
• Serment des aidants
• "Je m'engage à aider ma communauté"
• Badge "Héros communautaire"
• Calendrier d'action établi`,

        materials: JSON.stringify([
          "Papier pour tracer les mains",
          "Carte de la communauté",
          "Points rouges autocollants",
          "Matériel pour affiches",
          "Badges héros",
          "Calendrier visuel"
        ]),

        accommodations: JSON.stringify([
          "Projets adaptés aux capacités",
          "Rôles variés dans les équipes",
          "Support pour planification",
          "Participation flexible",
          "Options individuelles disponibles"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, rôle de support",
          onLevel: "Planification et participation active",
          advanced: "Leadership de projet, coordination"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Identification des besoins communautaires
Engagement à l'action
Planification collaborative`,

        isSubFriendly: true,
        subNotes: `Focus: Identification des besoins et planification d'aide.
Activité principale: Carte des besoins et projets.
Important: Projets réalistes et faisables.
Préparation pour actions futures.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 22: Le projet de gentillesse
    const lesson22 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Le projet de gentillesse',
        date: new Date('2026-02-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer des actes de gentillesse concrets
• Comprendre l'effet domino de la gentillesse
• Réaliser leur premier projet d'aide`,

        mindsOn: `L'effet domino de gentillesse (10 min)
• Dominos installés en ligne
• Un petit geste (pousser le premier)
• Observer la réaction en chaîne!
• "La gentillesse fonctionne pareil"
• Un sourire → autre sourire → autre...
• Introduction: Notre projet gentillesse`,

        action: `Usine de gentillesse (30 min)

PARTIE 1: Production de gentillesse (20 min)
• 3 stations de création:
  Station 1: Cartes de bonheur
  - Pour la résidence de personnes âgées
  - Dessins joyeux et messages
  
  Station 2: Signets encourageants
  - Pour la bibliothèque
  - Messages positifs
  
  Station 3: Affichettes de sourires
  - Pour les corridors de l'école
  - "Souris, tu es génial!"
• Rotation aux stations
• Production en masse!

PARTIE 2: Emballage avec amour (10 min)
• Décoration des enveloppes
• Ajout de cœurs et étoiles
• Préparation pour livraison
• Comptage: WOW! Tant de gentillesse!`,

        consolidation: `Célébration de la gentillesse (5 min)
• Admiration de notre production
• Photos avec nos créations
• Planification de la distribution
• Prédiction: Combien de sourires?
• Mission: Livraison demain!`,

        materials: JSON.stringify([
          "Dominos",
          "Cartes vierges",
          "Papier pour signets",
          "Matériel d'art varié",
          "Enveloppes",
          "Autocollants et décorations"
        ]),

        accommodations: JSON.stringify([
          "Choix de station selon capacité",
          "Aide pour écriture/dessin",
          "Production adaptée",
          "Travail en équipe encouragé",
          "Temps flexible"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 créations simples, beaucoup d'aide",
          onLevel: "Production normale aux 3 stations",
          advanced: "Production élevée, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Engagement dans la production
Créativité et soin apportés
Compréhension de l'impact`,

        isSubFriendly: true,
        subNotes: `Focus: Production d'actes de gentillesse concrets.
Activité principale: Stations de création.
Important: Ambiance d'usine joyeuse et productive.
Matériel prêt pour chaque station.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 23: La chaîne d'entraide
    const lesson23 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La chaîne d\'entraide',
        date: new Date('2026-02-11'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'interdépendance dans la communauté
• Reconnaître comment chacun aide les autres
• Créer des liens d'entraide`,

        mindsOn: `La toile d'araignée de l'aide (10 min)
• Cercle avec pelote de laine
• "J'ai aidé X en..." (lancer la laine)
• X tient et continue
• Formation d'une toile
• Observer: Tous connectés!
• Si un lâche, la toile s'affaiblit
• Message: Nous dépendons les uns des autres`,

        action: `Réseau d'entraide (28 min)

PARTIE 1: Qui m'aide? Qui j'aide? (13 min)
• Deux colonnes personnelles:
  - Qui m'aide: parents, enseignant, amis...
  - Qui j'aide: petit frère, amis, animaux...
• Réalisation: Je reçois ET je donne!
• Partage en dyades
• Connexions tracées
• Réseau visible de l'entraide

PARTIE 2: Les maillons de la chaîne (15 min)
• Création de maillons en papier
• Sur chaque maillon:
  - Un acte d'aide donné ou reçu
  - Décoration personnelle
• Assemblage en chaîne collective
• Installation dans la classe
• Test de solidité: Forte ensemble!`,

        consolidation: `Gardiens de la chaîne (7 min)
• Contemplation de notre chaîne
• "Un maillon que j'ajoute cette semaine..."
• Engagement à continuer la chaîne
• Poignée de main en chaîne
• Photo avec notre œuvre`,

        materials: JSON.stringify([
          "Pelote de laine",
          "Papier pour maillons",
          "Colle et agrafes",
          "Marqueurs colorés",
          "Matériel de décoration",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Aide pour identifier les connexions",
          "Maillons pré-découpés disponibles",
          "Support pour assemblage",
          "Participation adaptée",
          "Expression flexible"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 maillons simples, aide constante",
          onLevel: "Participation normale, 4-5 maillons",
          advanced: "Multiples connexions, aide à l'assemblage"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'interdépendance
Reconnaissance du donner-recevoir
Contribution à la chaîne collective`,

        isSubFriendly: true,
        subNotes: `Focus: Comprendre l'interdépendance communautaire.
Activité principale: Création de la chaîne d'entraide.
Important: Valoriser tous les types d'aide.
Chaîne à conserver et enrichir.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 24: Célébration de notre communauté bienveillante
    const lesson24 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration de notre communauté bienveillante',
        date: new Date('2026-02-13'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer leurs actions communautaires
• Partager les impacts de leur aide
• Renforcer l'engagement communautaire`,

        mindsOn: `Les échos de nos actions (10 min)
• Retour sur nos projets de la semaine
• Partage des réactions reçues:
  - Sourires à la résidence
  - Remerciements à la bibliothèque
  - Joie dans les corridors
• "Nos petites mains ont fait de grandes choses!"
• Préparation de la célébration`,

        action: `Festival de la bienveillance (30 min)

PARTIE 1: Exposition de nos actions (10 min)
• Stations présentant nos projets:
  - Photos des cartes livrées
  - Témoignages (lettres de remerciement)
  - Chaîne d'entraide exposée
  - Mur de la gentillesse
• Tour guidé par les élèves
• Fierté partagée

PARTIE 2: Spectacle de la bienveillance (15 min)
• Saynètes sur l'entraide
• Chanson de la communauté
• Danse de la gentillesse
• Témoignages: "J'ai aidé et j'ai ressenti..."
• Remise de médailles d'honneur

PARTIE 3: Engagement futur (5 min)
• Capsule temporelle créée:
  - Nos promesses d'aide future
  - Photos de nos projets
  - Messages pour nous-mêmes
• Scellement cérémoniel
• Ouverture prévue en juin`,

        consolidation: `Communauté unie (5 min)
• Grand cercle de clôture
• Mains au centre
• "Ensemble, nous sommes..."
• "BIENVEILLANTS!" (tous)
• Applaudissements nourris
• Distribution de certificats "Citoyen bienveillant"`,

        materials: JSON.stringify([
          "Photos des projets",
          "Lettres de remerciement",
          "Médailles d'honneur",
          "Boîte pour capsule temporelle",
          "Certificats citoyen",
          "Matériel pour spectacle"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés dans le spectacle",
          "Participation selon confort",
          "Support pour témoignages",
          "Options non-verbales",
          "Célébration de tous les efforts"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, soutien constant",
          onLevel: "Participation active complète",
          advanced: "Rôles de leader, organisation"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Démonstration de l'engagement communautaire
Réflexion sur l'impact des actions
Portfolio d'actions complété`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration des actions communautaires.
Activité principale: Festival et spectacle.
Important: Ambiance très festive et valorisante.
Tous les efforts célébrés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 17: C\'est juste ou injuste?');
    console.log('✅ Created Lesson 18: Défendre les autres');
    console.log('✅ Created Lesson 19: L\'inclusion pour tous');
    console.log('✅ Created Lesson 20: Réparation et pardon');
    console.log('✅ Created Lesson 21: Aider dans notre communauté');
    console.log('✅ Created Lesson 22: Le projet de gentillesse');
    console.log('✅ Created Lesson 23: La chaîne d\'entraide');
    console.log('✅ Created Lesson 24: Célébration de notre communauté bienveillante');

    console.log('\n📊 WEEKS 5-6 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Vivre ensemble');
    console.log('Dates: February 2-13, 2026');
    console.log('\nWeek 5 Focus:');
    console.log('✅ Understanding fairness and justice');
    console.log('✅ Being an ally and defender');
    console.log('✅ Practicing inclusion');
    console.log('✅ Learning repair and forgiveness');
    console.log('\nWeek 6 Focus:');
    console.log('✅ Identifying community needs');
    console.log('✅ Kindness project implementation');
    console.log('✅ Understanding interdependence');
    console.log('✅ Celebrating community service');
    console.log('\nKey Features:');
    console.log('✅ Social justice awareness');
    console.log('✅ Active citizenship development');
    console.log('✅ Concrete helping actions');
    console.log('✅ Community engagement');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks5And6VivreLessons().catch(console.error);