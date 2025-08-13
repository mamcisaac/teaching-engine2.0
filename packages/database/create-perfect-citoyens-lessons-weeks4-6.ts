import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks4To6CitoyensLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 4-6');
  console.log('Unit: Citoyens responsables');
  console.log('Focus: Understanding Needs and Wants');
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
    console.log('Creating 12 lessons for Weeks 4-6\n');

    // WEEK 4: Understanding Needs vs Wants (April 20-24, 2026)
    
    // Lesson 13: Qu'est-ce qu'un besoin?
    const lesson13 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Qu\'est-ce qu\'un besoin?',
        date: new Date('2026-04-20'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est un besoin essentiel
• Identifier les besoins de base
• Reconnaître l'importance des besoins`,

        mindsOn: `Survivre sur une île déserte (10 min)
• "Imaginez: seuls sur une île!"
• "Qu'est-ce qu'il vous faut absolument?"
• Liste au tableau
• Discussion: Sans quoi on ne peut pas vivre?
• Introduction: Les BESOINS
• Question: Quels sont nos besoins?`,

        action: `Exploration des besoins (28 min)

PARTIE 1: Les 5 besoins essentiels (13 min)
• Présentation avec images:
  1. Nourriture (pour grandir)
  2. Eau (pour vivre)
  3. Abri (maison, sécurité)
  4. Vêtements (protection)
  5. Amour/famille (bonheur)
• Gestes pour mémoriser chaque
• Chanson des besoins créée
• Répétition avec mouvements

PARTIE 2: Ma maison des besoins (15 min)
• Dessin d'une maison
• Dans chaque pièce, un besoin:
  - Cuisine: nourriture
  - Salle de bain: eau
  - Chambre: abri/repos
  - Garde-robe: vêtements
  - Salon: famille/amour
• Décoration personnalisée
• Titre: "Mes besoins essentiels"`,

        consolidation: `Gardiens des besoins (7 min)
• Présentation des maisons
• "Mon besoin le plus important..."
• Réalisation: Nous avons tous les mêmes!
• Badge "Expert des besoins"
• Mission: Observer ses besoins à la maison`,

        materials: JSON.stringify([
          "Images île déserte",
          "Cartes des 5 besoins",
          "Papier maison",
          "Crayons de couleur",
          "Badges expert",
          "Affiches des besoins"
        ]),

        accommodations: JSON.stringify([
          "Support visuel constant",
          "Gestes pour mémorisation",
          "Aide pour dessin",
          "Exemples concrets",
          "Répétition des concepts"
        ]),

        modifications: JSON.stringify({
          struggling: "3 besoins principaux",
          onLevel: "5 besoins, maison complète",
          advanced: "Besoins additionnels, explications"
        }),

        assessmentType: 'Diagnostique',
        assessmentNotes: `Compréhension du concept de besoin
Identification des besoins essentiels
Distinction initiale besoins/désirs`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction aux besoins essentiels.
Activité principale: Maison des besoins.
Important: Concepts fondamentaux clairs.
Exemples concrets et visuels.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 14: Qu'est-ce qu'un désir?
    const lesson14 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Qu\'est-ce qu\'un désir?',
        date: new Date('2026-04-21'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est un désir
• Distinguer désirs et besoins
• Reconnaître que les désirs sont OK mais différents`,

        mindsOn: `Le magasin de jouets (10 min)
• Image d'un magasin de jouets
• "Vous voulez TOUT?"
• "En avez-vous BESOIN pour vivre?"
• Discussion: Différence vouloir/avoir besoin
• Introduction: Les DÉSIRS
• C'est OK de désirer, mais...`,

        action: `Besoins vs Désirs (28 min)

PARTIE 1: Le jeu du tri (13 min)
• Cartes d'objets variés:
  - Pain, eau, maison (BESOINS)
  - Jouets, bonbons, jeux vidéo (DÉSIRS)
• Deux boîtes: Besoins / Désirs
• Tri collectif avec discussion
• "Peut-on vivre sans?"
• Validation: Les désirs rendent heureux!
• Mais les besoins sont prioritaires

PARTIE 2: Mon arbre des souhaits (15 min)
• Tronc = Besoins (solide, important)
• Branches = Désirs (jolis mais pas essentiels)
• Dessiner/écrire:
  - 5 besoins dans le tronc
  - Désirs sur les branches
• Décoration festive
• Message: L'arbre a besoin du tronc!`,

        consolidation: `Sages consommateurs (7 min)
• Comparaison des arbres
• "Un désir que j'ai..."
• "Mais je peux vivre sans!"
• Certificat "Sage consommateur"
• Mission: Identifier besoins/désirs au magasin`,

        materials: JSON.stringify([
          "Image magasin de jouets",
          "Cartes objets variés",
          "Deux boîtes décorées",
          "Papier arbre",
          "Matériel de décoration",
          "Certificats"
        ]),

        accommodations: JSON.stringify([
          "Exemples très concrets",
          "Support pour tri",
          "Aide pour l'arbre",
          "Validation des désirs",
          "Pas de jugement"
        ]),

        modifications: JSON.stringify({
          struggling: "Tri simple, 3-4 items",
          onLevel: "Tri complet, arbre standard",
          advanced: "Nuances, exemples complexes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Distinction besoins/désirs
Capacité de tri approprié
Compréhension de la priorité`,

        isSubFriendly: true,
        subNotes: `Focus: Distinction entre besoins et désirs.
Activité principale: Tri et arbre des souhaits.
Important: Pas de culpabilisation des désirs.
Message équilibré.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 15: Les besoins dans ma famille
    const lesson15 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les besoins dans ma famille',
        date: new Date('2026-04-22'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les besoins familiaux
• Comprendre que chacun contribue
• Apprécier les efforts de la famille`,

        mindsOn: `Qui fait quoi à la maison? (10 min)
• Photos: cuisine, ménage, travail, courses
• "Qui fait ça chez vous?"
• Discussion: Pourquoi font-ils ça?
• Pour répondre aux BESOINS!
• Chacun aide à sa façon
• Question: Comment votre famille répond aux besoins?`,

        action: `Famille et besoins (28 min)

PARTIE 1: Les rôles familiaux (13 min)
• Tableau des contributions:
  - Parents: travail, cuisine, protection
  - Enfants: ranger, aider, apprendre
  - Tous: amour, soutien
• Discussion de chaque rôle
• "Comment ça aide la famille?"
• Reconnaissance de l'importance

PARTIE 2: Carte de remerciement familiale (15 min)
• Création d'une carte spéciale
• "Merci de répondre à nos besoins"
• Dessins de ce que fait la famille:
  - Maman/Papa cuisine
  - Protège la maison
  - Donne des câlins
• Message personnel
• Décoration avec amour`,

        consolidation: `Reconnaissance familiale (7 min)
• Partage des cartes créées
• "Je remercie ma famille pour..."
• Engagement: Aider plus à la maison
• Badge "Helper familial"
• Mission: Donner la carte ce soir`,

        materials: JSON.stringify([
          "Photos d'activités familiales",
          "Tableau des rôles",
          "Papier cartes",
          "Matériel de décoration",
          "Badges helper",
          "Enveloppes"
        ]),

        accommodations: JSON.stringify([
          "Respect des structures familiales diverses",
          "Support pour identification",
          "Aide pour la carte",
          "Flexibilité des exemples",
          "Sensibilité aux situations"
        ]),

        modifications: JSON.stringify({
          struggling: "Carte simple, aide maximale",
          onLevel: "Carte détaillée, reconnaissance",
          advanced: "Analyse des contributions"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance des contributions familiales
Compréhension de l'interdépendance
Expression de gratitude`,

        isSubFriendly: true,
        subNotes: `Focus: Besoins et contributions familiales.
Activité principale: Carte de remerciement.
Important: Respect de toutes les familles.
Message de gratitude.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 16: Les besoins des autres
    const lesson16 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les besoins des autres',
        date: new Date('2026-04-24'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Reconnaître que tous ont des besoins
• Développer l'empathie
• Identifier comment aider les autres`,

        mindsOn: `Tous pareils, tous différents (10 min)
• Photos d'enfants du monde
• "Ont-ils les mêmes besoins que vous?"
• OUI! Nourriture, eau, abri, amour
• Mais parfois difficile à obtenir
• Discussion: Certains manquent de...
• Introduction: Comment aider?`,

        action: `Empathie et action (28 min)

PARTIE 1: Dans leurs souliers (13 min)
• Scénarios d'enfants:
  - Sam n'a pas de lunch
  - Léa a froid (pas de manteau)
  - Tom est seul (besoin d'amis)
• "Comment se sentent-ils?"
• "Quels besoins ne sont pas comblés?"
• Solutions ensemble
• Empathie développée

PARTIE 2: Plan d'aide communautaire (15 min)
• Identification de besoins locaux:
  - Banque alimentaire
  - Collecte de vêtements
  - Visite aux aînés
• Choix d'une action classe
• Affiche de sensibilisation
• Engagement collectif
• Planification simple`,

        consolidation: `Héros des besoins (7 min)
• Présentation du plan d'aide
• "Je peux aider en..."
• Cape de héros communautaire
• Photo de l'équipe d'aide
• Mission: Une bonne action`,

        materials: JSON.stringify([
          "Photos d'enfants variés",
          "Cartes scénarios",
          "Papier affiche",
          "Capes symboliques",
          "Matériel de planification",
          "Images d'organisations"
        ]),

        accommodations: JSON.stringify([
          "Scénarios adaptés",
          "Support émotionnel",
          "Aide pour solutions",
          "Participation flexible",
          "Sensibilité requise"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 scénarios simples",
          onLevel: "Compréhension et solutions",
          advanced: "Plans d'action détaillés"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Développement de l'empathie
Identification des besoins des autres
Engagement à aider`,

        isSubFriendly: true,
        subNotes: `Focus: Empathie et besoins des autres.
Activité principale: Scénarios et plan d'aide.
Important: Ton positif et constructif.
Éviter la pitié, promouvoir l'action.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 5: Making Responsible Choices (April 27 - May 1, 2026)

    // Lesson 17: Faire des choix responsables
    const lesson17 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Faire des choix responsables',
        date: new Date('2026-04-27'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance des choix
• Apprendre à prioriser les besoins
• Développer la prise de décision`,

        mindsOn: `Le dilemme du dollar (10 min)
• Un dollar magique (factice)
• "Vous pouvez acheter..."
• Montrer: pomme OU bonbon
• Discussion: Lequel choisir?
• Pourquoi? (santé vs plaisir)
• Introduction: Choix responsables`,

        action: `Décisions éclairées (28 min)

PARTIE 1: La balance des choix (13 min)
• Balance visuelle
• Scénarios de choix:
  - Nouveau crayon vs jouet (école importante)
  - Fruit vs chips (santé d'abord)
  - Aider maman vs jouer (responsabilité)
• Peser chaque choix
• Discussion: Qu'est-ce qui pèse plus?
• Besoins > Désirs

PARTIE 2: Mon guide de décision (15 min)
• Création d'un guide personnel:
  Questions à se poser:
  1. Est-ce un besoin?
  2. Est-ce bon pour moi?
  3. Est-ce que ça aide les autres?
  4. Mes parents seraient-ils fiers?
• Décoration style carte
• Plastification pour garder`,

        consolidation: `Décideurs champions (7 min)
• Test du guide avec exemples
• "Mon choix responsable sera..."
• Médaille du sage décideur
• Mission: Utiliser le guide cette semaine`,

        materials: JSON.stringify([
          "Dollar factice",
          "Balance visuelle",
          "Cartes scénarios",
          "Papier guide",
          "Plastifieuse",
          "Médailles"
        ]),

        accommodations: JSON.stringify([
          "Scénarios simplifiés",
          "Support pour décisions",
          "Guide adapté",
          "Exemples concrets",
          "Aide au raisonnement"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 questions simples",
          onLevel: "Guide complet, application",
          advanced: "Scénarios complexes, justification"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Processus de décision développé
Application besoins vs désirs
Autonomie guidée`,

        isSubFriendly: true,
        subNotes: `Focus: Prise de décision responsable.
Activité principale: Guide de décision personnel.
Important: Valoriser la réflexion.
Outil pratique à conserver.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 18: L'argent et les choix
    const lesson18 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'L\'argent et les choix',
        date: new Date('2026-04-28'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que l'argent est limité
• Apprendre à faire des choix avec l'argent
• Développer la conscience économique`,

        mindsOn: `La tirelire magique (10 min)
• Tirelire avec 5 pièces (factices)
• "C'est tout ce qu'on a!"
• Montrer 10 objets à "acheter"
• Problème: Pas assez pour tout!
• Discussion: Que faire?
• Introduction: Choisir sagement`,

        action: `Gérer son argent (28 min)

PARTIE 1: Le magasin de la classe (15 min)
• Mini-magasin installé:
  - Section besoins (nourriture factice, vêtements)
  - Section désirs (jouets, bonbons)
• Chaque élève: 10$ fictifs
• Mission: Acheter pour la semaine
• Observation des choix
• Discussion: Qui a acheté quoi?
• Analyse: Besoins d'abord!

PARTIE 2: Ma tirelire à objectifs (13 min)
• Création de 3 tirelires papier:
  1. Besoins (toujours en premier)
  2. Économies (pour plus tard)
  3. Plaisirs (si il reste)
• Décoration de chaque
• Pratique de répartition
• 10 pièces à distribuer`,

        consolidation: `Gestionnaires junior (7 min)
• Présentation des tirelires
• "J'économise pour..."
• Badge "Gestionnaire sage"
• Engagement: Besoins d'abord!
• Photo avec tirelires`,

        materials: JSON.stringify([
          "Tirelire réelle",
          "Argent fictif",
          "Objets pour magasin",
          "Prix affichés",
          "Papier tirelires",
          "Badges gestionnaire"
        ]),

        accommodations: JSON.stringify([
          "Montants simplifiés",
          "Support pour calculs",
          "Aide aux choix",
          "Manipulation concrète",
          "Répétition des concepts"
        ]),

        modifications: JSON.stringify({
          struggling: "5$ seulement, choix guidés",
          onLevel: "10$, autonomie standard",
          advanced: "Budget complexe, épargne"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de la limitation des ressources
Priorisation dans les achats
Introduction à l'épargne`,

        isSubFriendly: true,
        subNotes: `Focus: Gestion basique de l'argent.
Activité principale: Magasin et tirelires.
Important: Concepts simples et concrets.
Message positif sur l'épargne.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 19: Partager avec les autres
    const lesson19 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Partager avec les autres',
        date: new Date('2026-04-29'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance du partage
• Identifier ce qu'on peut partager
• Pratiquer la générosité responsable`,

        mindsOn: `Le gâteau à partager (10 min)
• Image d'un gros gâteau
• "Si vous le gardez tout..."
• "Si vous le partagez..."
• Discussion: Qu'est-ce qui est mieux?
• Plus de sourires avec le partage!
• Question: Que peut-on partager?`,

        action: `Culture du partage (28 min)

PARTIE 1: Inventaire du partage (13 min)
• 3 catégories explorées:
  - Objets (jouets, fournitures)
  - Temps (aide, jeu ensemble)
  - Talents (enseigner, montrer)
• Exemples de chaque
• "J'ai partagé..." (expériences)
• Sentiment après le partage?
• Bonheur multiplié!

PARTIE 2: Boîte de partage de classe (15 min)
• Décoration d'une boîte collective
• Chacun apporte quelque chose:
  - Livre à prêter
  - Crayons supplémentaires
  - Petit jouet à partager
• Règles établies ensemble
• Système de prêt créé
• Inauguration officielle`,

        consolidation: `Champions du partage (7 min)
• Première utilisation de la boîte
• "Je partage parce que..."
• Certificat "Cœur généreux"
• Mission: Partager chaque jour
• Célébration du partage!`,

        materials: JSON.stringify([
          "Image de gâteau",
          "Grande boîte à décorer",
          "Matériel de décoration",
          "Étiquettes pour objets",
          "Certificats",
          "Registre de prêts"
        ]),

        accommodations: JSON.stringify([
          "Partage volontaire seulement",
          "Options variées",
          "Support émotionnel",
          "Respect des possessions",
          "Flexibilité totale"
        ]),

        modifications: JSON.stringify({
          struggling: "Partage simple, guidé",
          onLevel: "Participation standard",
          advanced: "Organisation du système"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Attitude face au partage
Générosité démontrée
Respect des biens communs`,

        isSubFriendly: true,
        subNotes: `Focus: Culture du partage responsable.
Activité principale: Boîte de partage collective.
Important: Partage volontaire uniquement.
Respect des biens de chacun.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 20: Économiser pour l'avenir
    const lesson20 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Économiser pour l\'avenir',
        date: new Date('2026-05-01'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre le concept d'épargne
• Apprendre la patience et la planification
• Développer de bonnes habitudes financières`,

        mindsOn: `La fourmi et la cigale (10 min)
• Histoire simplifiée racontée
• Fourmi: économise pour l'hiver
• Cigale: dépense tout de suite
• Que se passe-t-il en hiver?
• Discussion: Qui a fait le bon choix?
• Introduction: Économiser = sage!`,

        action: `L'art d'économiser (28 min)

PARTIE 1: Objectifs d'épargne (13 min)
• Brainstorm: "Pour quoi économiser?"
  - Gros jouet spécial
  - Cadeau pour maman
  - Sortie spéciale
  - Urgences
• Chacun choisit un objectif
• Dessin de l'objectif
• Calcul simple: Combien faut-il?

PARTIE 2: Plan d'épargne visuel (15 min)
• Création d'un thermomètre d'épargne
• Objectif en haut
• Graduation en dollars
• Décoration motivante
• Stratégies discutées:
  - Petite tirelire
  - Moins de bonbons
  - Aide supplémentaire
• Engagement personnel`,

        consolidation: `Épargnants champions (7 min)
• Présentation des thermomètres
• "J'économise pour..."
• Médaille "Épargnant sage"
• Première "contribution" symbolique
• Photo des futurs millionnaires!`,

        materials: JSON.stringify([
          "Histoire illustrée",
          "Papier thermomètre",
          "Matériel de dessin",
          "Médailles épargnant",
          "Exemples d'objectifs",
          "Calculatrice simple"
        ]),

        accommodations: JSON.stringify([
          "Objectifs adaptés",
          "Montants simplifiés",
          "Support pour plan",
          "Aide aux calculs",
          "Flexibilité des buts"
        ]),

        modifications: JSON.stringify({
          struggling: "Objectif très simple, aide",
          onLevel: "Plan standard structuré",
          advanced: "Multiple objectifs, détails"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'épargne
Capacité de planification
Patience développée`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction à l'épargne.
Activité principale: Thermomètre d'épargne.
Important: Objectifs réalistes.
Message positif sur la patience.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 6: Community Needs (May 4-8, 2026)

    // Lesson 21: Les besoins de notre école
    const lesson21 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les besoins de notre école',
        date: new Date('2026-05-04'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les besoins de l'école
• Comprendre comment contribuer
• Développer l'appartenance scolaire`,

        mindsOn: `Notre école est une maison (10 min)
• "L'école est notre 2e maison"
• Passe beaucoup de temps ici
• Quels sont les besoins de l'école?
• Propreté, matériel, respect...
• Discussion: Comment aider?
• Introduction: Citoyens de l'école!`,

        action: `Améliorer notre école (28 min)

PARTIE 1: Enquête des besoins (13 min)
• Tour d'observation (classe/couloir)
• Liste des besoins identifiés:
  - Cour plus propre
  - Livres pour bibliothèque
  - Plantes pour décorer
  - Plus de jeux
• Vote pour priorités
• Top 3 sélectionnés

PARTIE 2: Plan d'action scolaire (15 min)
• Projet choisi: Embellir la classe
• Étapes planifiées:
  1. Nettoyer et organiser
  2. Créer des décorations
  3. Apporter des plantes
  4. Installer et célébrer
• Responsabilités distribuées
• Calendrier établi`,

        consolidation: `Équipe d'amélioration (7 min)
• Contrat d'engagement signé
• "Pour notre école, je vais..."
• Badge "Citoyen scolaire"
• Photo de l'équipe
• Lancement du projet!`,

        materials: JSON.stringify([
          "Clipboard pour enquête",
          "Papier pour votes",
          "Plan d'action visuel",
          "Badges citoyen",
          "Contrat d'engagement",
          "Matériel de planification"
        ]),

        accommodations: JSON.stringify([
          "Observation guidée",
          "Support pour identification",
          "Rôles adaptés",
          "Participation flexible",
          "Aide à la planification"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple dans le projet",
          onLevel: "Participation active complète",
          advanced: "Leadership, coordination"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Identification des besoins scolaires
Engagement dans l'amélioration
Esprit d'équipe développé`,

        isSubFriendly: true,
        subNotes: `Focus: Besoins et amélioration de l'école.
Activité principale: Projet d'embellissement.
Important: Actions concrètes et réalisables.
Impliquer l'administration.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 22: Les besoins de notre communauté
    const lesson22 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les besoins de notre communauté',
        date: new Date('2026-05-05'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les besoins communautaires
• Comprendre leur rôle de citoyen
• Planifier une action communautaire`,

        mindsOn: `Notre village a besoin de nous (10 min)
• Images de la communauté locale
• "Que voyez-vous?"
• Identification de problèmes:
  - Déchets dans le parc
  - Personnes âgées seules
  - Animaux abandonnés
• Question: Pouvons-nous aider?
• OUI! Même petits!`,

        action: `Action communautaire (28 min)

PARTIE 1: Cartographie des besoins (13 min)
• Carte simple du quartier
• Épingles pour marquer:
  - Endroits à nettoyer
  - Gens qui ont besoin d'aide
  - Améliorations possibles
• Discussion de chaque point
• Priorisation collective
• Choix d'un projet réalisable

PARTIE 2: Notre projet communautaire (15 min)
• Projet choisi: Cartes pour aînés
• Planification détaillée:
  - Créer 20 cartes de bonheur
  - Messages positifs
  - Dessins joyeux
  - Livraison à la résidence
• Matériel listé
• Date fixée
• Rôles assignés`,

        consolidation: `Héros communautaires (7 min)
• Engagement communautaire
• "Je m'engage à..."
• Cape de héros local
• Mission lancée officiellement
• Fierté anticipée!`,

        materials: JSON.stringify([
          "Photos communautaires",
          "Carte du quartier",
          "Épingles colorées",
          "Matériel pour cartes",
          "Capes de héros",
          "Plan de projet"
        ]),

        accommodations: JSON.stringify([
          "Besoins simplifiés",
          "Support pour cartographie",
          "Rôles variés",
          "Participation adaptée",
          "Aide constante"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple au projet",
          onLevel: "Engagement standard",
          advanced: "Leadership du projet"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Vision communautaire développée
Identification de besoins réels
Engagement citoyen`,

        isSubFriendly: true,
        subNotes: `Focus: Besoins communautaires et action.
Activité principale: Projet cartes pour aînés.
Important: Projet réalisable et significatif.
Contact avec partenaires communautaires.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 23: Réalisation du projet
    const lesson23 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réalisation du projet',
        date: new Date('2026-05-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Réaliser leur projet communautaire
• Travailler en équipe efficacement
• Créer avec intention et amour`,

        mindsOn: `Artistes du bonheur (8 min)
• "Aujourd'hui, on crée du bonheur!"
• Rappel: Pour qui? Pourquoi?
• Visualisation: sourires des aînés
• Matériel présenté
• Énergie positive générée
• "Au travail, artistes!"`,

        action: `Production intensive (32 min)

PARTIE 1: Création des cartes (20 min)
• 4 stations de production:
  - Station dessin
  - Station messages
  - Station décoration
  - Station assemblage
• Rotation aux 5 minutes
• Production en série
• Qualité maintenue
• Entraide constante

PARTIE 2: Finalisation et emballage (12 min)
• Vérification qualité
• Signatures ajoutées
• Emballage soigné
• Comptage final: 20+ cartes!
• Boîte décorée pour transport
• Préparation de la présentation`,

        consolidation: `Mission accomplie! (5 min)
• Admiration du travail
• "Nous avons créé..."
• Photos avec les cartes
• Préparation mentale pour livraison
• Fierté immense!`,

        materials: JSON.stringify([
          "Papier cartonné",
          "Matériel d'art complet",
          "Messages pré-écrits",
          "Décorations variées",
          "Boîte de transport",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Tâches selon capacités",
          "Support constant",
          "Flexibilité créative",
          "Aide pour messages",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 cartes simples",
          onLevel: "3-4 cartes complètes",
          advanced: "Production élevée, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Engagement dans la production
Qualité du travail
Collaboration démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Production du projet communautaire.
Activité principale: Création intensive de cartes.
Important: Maintenir la qualité et l'enthousiasme.
Préparation pour la livraison.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 24: Célébration - Impact communautaire
    const lesson24 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration - Impact communautaire',
        date: new Date('2026-05-08'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer leur impact communautaire
• Réfléchir sur l'expérience
• Renforcer l'engagement citoyen`,

        mindsOn: `Retour de mission (10 min)
• Photos de la livraison (si faite)
• Ou simulation de la réaction
• "Les aînés étaient si heureux!"
• Partage des émotions
• Fierté collective ressentie
• "Nous avons fait une différence!"`,

        action: `Célébration et réflexion (30 min)

PARTIE 1: Mur de l'impact (15 min)
• Création d'un mur d'affichage:
  - Photos du projet
  - Cartes exemples
  - Messages de remerciement
  - Dessins de l'expérience
• Titre: "Nous changeons le monde!"
• Décoration collective
• Installation dans le couloir

PARTIE 2: Certificats et engagement (15 min)
• Cérémonie de reconnaissance
• Certificats "Agent de changement"
• Médailles de service communautaire
• Témoignages: "J'ai appris que..."
• Nouvel engagement pris
• Planification du prochain projet`,

        consolidation: `Citoyens actifs pour toujours (5 min)
• Cercle de clôture
• "Un citoyen responsable..."
• Engagement collectif récité
• Photo finale avec certificats
• Applaudissements nourris!`,

        materials: JSON.stringify([
          "Photos du projet",
          "Matériel d'affichage",
          "Certificats",
          "Médailles",
          "Matériel de décoration",
          "Livre d'engagement"
        ]),

        accommodations: JSON.stringify([
          "Participation selon confort",
          "Expression flexible",
          "Support émotionnel",
          "Célébration inclusive",
          "Valorisation de tous"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple",
          onLevel: "Réflexion et célébration complète",
          advanced: "Leadership, planification future"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Impact communautaire réalisé
Réflexion sur l'expérience
Engagement citoyen confirmé`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration de l'impact communautaire.
Activité principale: Mur d'impact et cérémonie.
Important: Valoriser tous les efforts.
Momentum pour projets futurs.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 13: Qu\'est-ce qu\'un besoin?');
    console.log('✅ Created Lesson 14: Qu\'est-ce qu\'un désir?');
    console.log('✅ Created Lesson 15: Les besoins dans ma famille');
    console.log('✅ Created Lesson 16: Les besoins des autres');
    console.log('✅ Created Lesson 17: Faire des choix responsables');
    console.log('✅ Created Lesson 18: L\'argent et les choix');
    console.log('✅ Created Lesson 19: Partager avec les autres');
    console.log('✅ Created Lesson 20: Économiser pour l\'avenir');
    console.log('✅ Created Lesson 21: Les besoins de notre école');
    console.log('✅ Created Lesson 22: Les besoins de notre communauté');
    console.log('✅ Created Lesson 23: Réalisation du projet');
    console.log('✅ Created Lesson 24: Célébration - Impact communautaire');

    console.log('\n📊 WEEKS 4-6 SUMMARY');
    console.log('===================');
    console.log('Created 12 perfect lesson plans for Sciences humaines');
    console.log('Unit: Citoyens responsables');
    console.log('Dates: April 20 - May 8, 2026');
    console.log('\nWeek 4 Focus:');
    console.log('✅ Understanding needs vs wants');
    console.log('✅ Family needs and contributions');
    console.log('✅ Empathy for others\' needs');
    console.log('\nWeek 5 Focus:');
    console.log('✅ Making responsible choices');
    console.log('✅ Money management basics');
    console.log('✅ Sharing and saving');
    console.log('\nWeek 6 Focus:');
    console.log('✅ School and community needs');
    console.log('✅ Community action project');
    console.log('✅ Celebrating impact');
    console.log('\nKey Features:');
    console.log('✅ Economic literacy basics');
    console.log('✅ Empathy development');
    console.log('✅ Community engagement');
    console.log('✅ Practical life skills');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks4To6CitoyensLessons().catch(console.error);