import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks10To13CitoyensLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 10-13');
  console.log('Unit: Citoyens responsables');
  console.log('Focus: Leadership and Year-End Performance Task');
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
    console.log('Creating 16 lessons for Weeks 10-13\n');

    // WEEK 10: Leadership Development (June 1-5, 2026)

    // Lesson 37: Je suis un leader
    const lesson37 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Je suis un leader',
        date: new Date('2026-06-01'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Reconnaître leurs qualités de leader
• Comprendre différents styles de leadership
• Identifier comment ils peuvent diriger`,

        mindsOn: `Leaders partout! (10 min)
• Photos: capitaine d'équipe, parent, enseignant
• "Qui est un leader?"
• Surprise: "VOUS êtes tous des leaders!"
• Exemples: aider un ami, montrer l'exemple
• Discussion: Comment mène-t-on?
• Introduction: Découvrons votre style!`,

        action: `Leadership personnel (28 min)

PARTIE 1: Qualités de leader (13 min)
• Étoile du leadership:
  - Gentillesse
  - Courage
  - Écoute
  - Aide
  - Exemple
• Auto-évaluation: "J'ai cette qualité!"
• Exemples personnels partagés
• Fierté de ses forces

PARTIE 2: Mon portrait de leader (15 min)
• Création d'un portrait personnel:
  - Dessin de soi en leader
  - "Je suis un leader quand je..."
  - Mes super-pouvoirs de leader
  - Comment j'aide les autres
• Décoration héroïque
• Titre: "Leader [Prénom]"`,

        consolidation: `Leaders reconnus (7 min)
• Galerie des leaders
• "Je suis fier d'être leader en..."
• Étoile de leader remise
• Photo des futurs leaders
• Mission: Un acte de leadership`,

        materials: JSON.stringify([
          "Photos de leaders variés",
          "Étoile des qualités",
          "Papier portrait",
          "Matériel de décoration",
          "Étoiles de leader",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Qualités adaptées",
          "Support pour identification",
          "Expression flexible",
          "Aide pour portrait",
          "Valorisation de tous"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 qualités simples",
          onLevel: "Portrait complet standard",
          advanced: "Analyse approfondie, exemples"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance de ses forces
Confiance en leadership développée
Expression personnelle`,

        isSubFriendly: true,
        subNotes: `Focus: Reconnaissance du leadership personnel.
Activité principale: Portrait de leader.
Important: Tous sont leaders à leur façon.
Valorisation de chaque style.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 38: Inspirer les autres
    const lesson38 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Inspirer les autres',
        date: new Date('2026-06-02'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'influence positive
• Apprendre à encourager les autres
• Pratiquer le leadership inspirant`,

        mindsOn: `L'effet papillon positif (10 min)
• Histoire: Un sourire qui voyage
• Sourire → ami heureux → aide quelqu'un → chaîne continue
• "Votre exemple influence!"
• Discussion: Comment inspirer?
• Par nos actions, pas juste nos mots!`,

        action: `Inspirateurs en action (28 min)

PARTIE 1: Messages inspirants (13 min)
• Création de cartes d'encouragement:
  - Pour un ami triste
  - Pour quelqu'un qui essaie
  - Pour célébrer un effort
  - Pour dire "tu peux!"
• Messages personnalisés
• Dessins motivants
• Distribution planifiée

PARTIE 2: Défi d'inspiration (15 min)
• Planification d'actions inspirantes:
  - Aider sans qu'on demande
  - Féliciter les efforts
  - Inclure quelqu'un de seul
  - Montrer le bon exemple
• Calendrier de la semaine
• Objectifs personnels
• Journal d'impact préparé`,

        consolidation: `Inspirateurs certifiés (7 min)
• Engagement d'inspiration
• "Cette semaine, je vais inspirer en..."
• Badge inspirateur
• Première action immédiate
• Effet domino lancé!`,

        materials: JSON.stringify([
          "Histoire illustrée",
          "Cartes vierges",
          "Matériel de décoration",
          "Calendrier semaine",
          "Journal d'impact",
          "Badges inspirateur"
        ]),

        accommodations: JSON.stringify([
          "Messages simplifiés",
          "Support pour écriture",
          "Actions adaptées",
          "Flexibilité totale",
          "Aide constante"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 actions simples",
          onLevel: "Plan hebdomadaire complet",
          advanced: "Actions complexes, suivi détaillé"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'influence positive
Capacité d'encouragement
Planification d'actions`,

        isSubFriendly: true,
        subNotes: `Focus: Leadership par l'inspiration.
Activité principale: Messages et plan d'action.
Important: Actions authentiques et sincères.
Suivi quotidien prévu.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 39: Résoudre les problèmes
    const lesson39 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Résoudre les problèmes',
        date: new Date('2026-06-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Développer la résolution de problèmes
• Apprendre à chercher des solutions
• Pratiquer la pensée créative`,

        mindsOn: `Le problème du jour (10 min)
• Scénario: Pas assez de ballons pour tous
• "Que faire?"
• Brainstorm de solutions
• Vote pour la meilleure
• Réalisation: Plusieurs solutions possibles!
• Introduction: Solutionneurs créatifs!`,

        action: `Laboratoire de solutions (28 min)

PARTIE 1: Méthode STAR (13 min)
• Apprentissage de STAR:
  S - Stop (arrêter, respirer)
  T - Think (penser aux options)
  A - Act (agir avec la meilleure)
  R - Review (vérifier si ça marche)
• Pratique avec scénarios
• Application en équipe

PARTIE 2: Défi de solutions (15 min)
• Problèmes de classe à résoudre:
  - Bruit dans les rangs
  - Jouets perdus
  - Conflits de récré
  - Matériel manquant
• Équipes de solution
• Plans créatifs développés
• Présentation des idées`,

        consolidation: `Solutionneurs experts (7 min)
• Meilleure solution votée
• Mise en œuvre planifiée
• Certificat solutionneur
• "Mon problème à résoudre..."
• Mission: Appliquer STAR`,

        materials: JSON.stringify([
          "Scénarios problèmes",
          "Affiche STAR",
          "Papier solutions",
          "Matériel de vote",
          "Certificats",
          "Boîte à problèmes"
        ]),

        accommodations: JSON.stringify([
          "Méthode simplifiée",
          "Support pour solutions",
          "Travail en équipe",
          "Problèmes adaptés",
          "Aide disponible"
        ]),

        modifications: JSON.stringify({
          struggling: "Méthode simple, 1 problème",
          onLevel: "STAR complet, participation",
          advanced: "Problèmes complexes, facilitation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Processus de résolution développé
Créativité dans les solutions
Application de la méthode`,

        isSubFriendly: true,
        subNotes: `Focus: Résolution créative de problèmes.
Activité principale: Méthode STAR et défis.
Important: Valoriser toutes les idées.
Méthode à réutiliser.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 40: Faire une différence
    const lesson40 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Faire une différence',
        date: new Date('2026-06-05'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre leur pouvoir d'impact
• Identifier des façons de contribuer
• S'engager à faire une différence`,

        mindsOn: `Petits gestes, grands impacts (10 min)
• Histoire: L'enfant et les étoiles de mer
• "Je ne peux pas toutes les sauver..."
• "Mais pour celle-ci, ça fait une différence!"
• Discussion: Nos petits gestes comptent
• Exemples vécus cette année
• Introduction: Changeurs du monde!`,

        action: `Agents de changement (28 min)

PARTIE 1: Ma différence cette année (13 min)
• Réflexion sur l'année:
  - J'ai aidé quand...
  - J'ai changé...
  - J'ai appris...
  - J'ai influencé...
• Liste de nos impacts
• Fierté collective
• Réalisation de notre pouvoir

PARTIE 2: Mon engagement futur (15 min)
• Vision pour l'été et l'an prochain:
  - Une cause importante pour moi
  - Comment je vais aider
  - Qui je vais influencer
  - Quel changement je veux voir
• Plan d'action personnel
• Contrat avec soi-même`,

        consolidation: `Changeurs certifiés (7 min)
• Présentation des engagements
• "Je vais faire une différence en..."
• Médaille de changeur du monde
• Photo historique
• Promesse solennelle`,

        materials: JSON.stringify([
          "Histoire illustrée",
          "Papier réflexion",
          "Contrats d'engagement",
          "Médailles",
          "Appareil photo",
          "Boîte à souvenirs"
        ]),

        accommodations: JSON.stringify([
          "Réflexion guidée",
          "Support pour engagement",
          "Expression flexible",
          "Aide à la formulation",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "Réflexion simple, 1 engagement",
          onLevel: "Réflexion complète, plan clair",
          advanced: "Analyse approfondie, multiple actions"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Conscience de son impact
Vision future développée
Engagement personnel fort`,

        isSubFriendly: true,
        subNotes: `Focus: Reconnaissance de l'impact personnel.
Activité principale: Réflexion et engagement.
Important: Célébrer tous les progrès.
Momentum pour l'avenir.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 11: Planning Our Citizenship Fair (June 8-12, 2026)

    // Lesson 41: Notre foire de citoyenneté
    const lesson41 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre foire de citoyenneté',
        date: new Date('2026-06-08'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Planifier une foire de citoyenneté
• Organiser la présentation de leurs apprentissages
• Développer leurs compétences organisationnelles`,

        mindsOn: `La grande célébration (10 min)
• "Nous avons appris TELLEMENT!"
• Liste rapide: digital, besoins, environnement, leadership
• "Comment partager avec tous?"
• Idée: FOIRE DE CITOYENNETÉ!
• Excitation générée
• "Montrons que nous sommes des citoyens responsables!"`,

        action: `Planification de la foire (30 min)

PARTIE 1: Vision collective (10 min)
• Brainstorm des stations:
  - Citoyen numérique
  - Besoins vs désirs
  - Éco-citoyens
  - Leaders en action
  - Projets communautaires
• Vote pour l'organisation
• Thème choisi
• Date confirmée (18 juin)

PARTIE 2: Équipes et responsabilités (20 min)
• Formation de 5 équipes
• Chaque équipe = une station
• Planification initiale:
  - Quoi montrer?
  - Matériel nécessaire?
  - Qui fait quoi?
• Calendrier de préparation
• Engagement signé`,

        consolidation: `Organisateurs officiels (5 min)
• Badges d'organisateur
• Annonce officielle rédigée
• Photo de l'équipe organisatrice
• Mission: Commencer la préparation!
• Enthousiasme maximum!`,

        materials: JSON.stringify([
          "Tableau de planification",
          "Feuilles d'équipe",
          "Calendrier visuel",
          "Badges organisateur",
          "Matériel de vote",
          "Contrats d'équipe"
        ]),

        accommodations: JSON.stringify([
          "Rôles selon capacités",
          "Support pour planification",
          "Équipes équilibrées",
          "Flexibilité des tâches",
          "Aide constante"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple dans l'équipe",
          onLevel: "Participation active standard",
          advanced: "Leadership d'équipe, coordination"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Capacité de planification
Travail d'équipe
Vision d'ensemble développée`,

        isSubFriendly: true,
        subNotes: `Focus: Lancement de la planification de la foire.
Activité principale: Organisation en équipes.
Important: Tous impliqués selon capacités.
Préparation sur 2 semaines.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 42: Préparation station numérique
    const lesson42 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation station numérique',
        date: new Date('2026-06-09'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Préparer la station citoyenneté numérique
• Créer des démonstrations interactives
• Organiser le matériel de présentation`,

        mindsOn: `Rappel numérique (8 min)
• Flash-back: Nos apprentissages numériques
• Sécurité, gentillesse, équilibre
• "Comment montrer ça?"
• Idées de l'équipe
• Plan de station établi`,

        action: `Construction de station (32 min)

PARTIE 1: Matériel de démonstration (17 min)
• Création d'éléments:
  - Affiche des règles de sécurité
  - Jeu du mot de passe
  - Quiz interactif
  - Démonstration de gentillesse
  - Cartes de citoyens numériques
• Production intensive
• Qualité maintenue

PARTIE 2: Mise en place et pratique (15 min)
• Installation de la station
• Disposition du matériel
• Rôles distribués:
  - Accueil
  - Démonstration
  - Jeux
  - Certificats
• Pratique rapide
• Ajustements nécessaires`,

        consolidation: `Station prête! (5 min)
• Vérification finale
• Fierté du travail
• Photo de l'équipe
• Rangement sécurisé
• Prêts pour la foire!`,

        materials: JSON.stringify([
          "Matériel d'affichage",
          "Cartons pour jeux",
          "Ordinateur/tablette",
          "Certificats vierges",
          "Décorations",
          "Table et chaises"
        ]),

        accommodations: JSON.stringify([
          "Tâches selon capacités",
          "Support technique",
          "Rôles adaptés",
          "Aide disponible",
          "Flexibilité"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâche simple, beaucoup d'aide",
          onLevel: "Contribution standard",
          advanced: "Coordination, éléments complexes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Application des connaissances numériques
Créativité dans la présentation
Collaboration d'équipe`,

        isSubFriendly: true,
        subNotes: `Focus: Préparation de la station numérique.
Activité principale: Création du matériel.
Important: Station interactive et engageante.
Matériel à conserver pour la foire.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 43: Préparation stations besoins et environnement
    const lesson43 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation stations besoins et environnement',
        date: new Date('2026-06-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Préparer deux stations thématiques
• Créer des activités participatives
• Organiser les démonstrations`,

        mindsOn: `Deux thèmes importants (8 min)
• Équipe 1: Besoins vs désirs
• Équipe 2: Éco-citoyens
• Révision rapide des concepts
• Brainstorm d'activités
• Énergie créative!`,

        action: `Double production (32 min)

PARTIE 1: Station besoins/désirs (16 min)
• Équipe 1 crée:
  - Jeu de tri géant
  - Arbre des besoins
  - Boutique des choix
  - Quiz familial
• Installation progressive

PARTIE 2: Station environnement (16 min)
• Équipe 2 crée:
  - Bac de recyclage interactif
  - Défi zéro déchet
  - Jardin de classe exposé
  - Promesses vertes
• Mise en place créative`,

        consolidation: `Deux stations prêtes! (5 min)
• Tour des stations
• Félicitations mutuelles
• Photos des équipes
• Matériel sécurisé
• Anticipation grandissante!`,

        materials: JSON.stringify([
          "Matériel de tri",
          "Arbre en carton",
          "Objets recyclables",
          "Plantes du jardin",
          "Affiches vertes",
          "Jeux préparés"
        ]),

        accommodations: JSON.stringify([
          "Division des tâches",
          "Support entre équipes",
          "Rôles flexibles",
          "Aide disponible",
          "Adaptation constante"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple",
          onLevel: "Contribution active",
          advanced: "Leadership de station"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Application thématique
Créativité collaborative
Organisation efficace`,

        isSubFriendly: true,
        subNotes: `Focus: Préparation de 2 stations parallèles.
Activité principale: Production en équipes.
Important: Coordination entre équipes.
Stations interactives.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 44: Répétition générale
    const lesson44 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Répétition générale',
        date: new Date('2026-06-12'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Pratiquer leurs présentations
• Coordonner entre les stations
• Perfectionner l'organisation`,

        mindsOn: `Dernière ligne droite! (8 min)
• "La foire est dans 6 jours!"
• Vérification: Tout est prêt?
• Énergie et focus
• Plan de répétition
• "Montrons notre meilleur!"`,

        action: `Simulation complète (32 min)

PARTIE 1: Installation rapide (7 min)
• Toutes les stations montées
• Disposition optimale
• Matériel vérifié
• Signalisation placée

PARTIE 2: Répétition avec rotation (20 min)
• Groupes de visiteurs simulés
• 4 minutes par station
• Présentations complètes
• Rotation fluide
• Feedback entre pairs

PARTIE 3: Ajustements (5 min)
• Points à améliorer
• Modifications rapides
• Encouragements mutuels`,

        consolidation: `Prêts à impressionner! (5 min)
• Cercle de confiance
• "Nous sommes prêts parce que..."
• Cri de ralliement
• Photo "J-6"
• Excitation maximale!`,

        materials: JSON.stringify([
          "Toutes les stations",
          "Minuteur",
          "Signalisation",
          "Feuilles de feedback",
          "Appareil photo",
          "Liste de vérification"
        ]),

        accommodations: JSON.stringify([
          "Support durant répétition",
          "Rôles ajustés si stress",
          "Pauses possibles",
          "Encouragement constant",
          "Flexibilité"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simplifié, support",
          onLevel: "Présentation complète",
          advanced: "Coordination, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Maîtrise des présentations
Fluidité de l'organisation
Confiance collective`,

        isSubFriendly: true,
        subNotes: `Focus: Répétition générale complète.
Activité principale: Simulation de la foire.
Important: Renforcer la confiance.
Derniers ajustements.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 12: Citizenship Fair Week (June 15-19, 2026)

    // Lesson 45: Finition et décoration
    const lesson45 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Finition et décoration',
        date: new Date('2026-06-15'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Finaliser tous les préparatifs
• Décorer l'espace de la foire
• Créer une ambiance festive`,

        mindsOn: `J-3! (8 min)
• Compte à rebours affiché
• "Mercredi = NOTRE JOUR!"
• Vérification finale
• Énergie festive
• Mission: Rendre tout magnifique!`,

        action: `Embellissement final (32 min)

PARTIE 1: Décoration de l'espace (17 min)
• Bannière "Foire de Citoyenneté"
• Ballons et guirlandes
• Flèches directionnelles
• Affiches de bienvenue
• Ambiance colorée créée

PARTIE 2: Touches finales (15 min)
• Derniers ajouts aux stations
• Vérification du matériel
• Badges pour tous
• Programmes imprimés
• Livre d'or préparé`,

        consolidation: `Tout est parfait! (5 min)
• Tour d'inspection
• Satisfaction collective
• Photo panoramique
• Rangement sécurisé
• Repos avant le grand jour!`,

        materials: JSON.stringify([
          "Décorations festives",
          "Bannière",
          "Ballons",
          "Programmes",
          "Livre d'or",
          "Badges nominatifs"
        ]),

        accommodations: JSON.stringify([
          "Tâches selon capacités",
          "Support pour décoration",
          "Participation flexible",
          "Aide disponible",
          "Repos si nécessaire"
        ]),

        modifications: JSON.stringify({
          struggling: "Décoration simple",
          onLevel: "Participation complète",
          advanced: "Coordination finale"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Attention aux détails
Esprit d'équipe
Préparation minutieuse`,

        isSubFriendly: true,
        subNotes: `Focus: Finalisation et décoration.
Activité principale: Embellissement de l'espace.
Important: Ambiance festive mais organisée.
Tout prêt pour mercredi.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 46: Préparation personnelle
    const lesson46 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation personnelle',
        date: new Date('2026-06-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Se préparer individuellement
• Pratiquer leurs rôles
• Développer leur confiance`,

        mindsOn: `Mon rôle important (8 min)
• Chacun a un rôle spécial
• Révision des responsabilités
• "Vous êtes tous importants!"
• Questions? Inquiétudes?
• Rassurance et encouragement`,

        action: `Préparation individuelle (32 min)

PARTIE 1: Pratique des présentations (17 min)
• Pratique en petits groupes
• Chacun présente sa partie
• Feedback positif
• Amélioration de la fluidité
• Confiance renforcée

PARTIE 2: Préparation personnelle (15 min)
• Création de aide-mémoires
• Décoration des badges
• Révision des points clés
• Visualisation du succès
• Encouragements mutuels`,

        consolidation: `Champions prêts! (5 min)
• Cercle de pouvoir
• "Je suis prêt parce que..."
• High-five collectif
• Derniers encouragements
• Confiance au maximum!`,

        materials: JSON.stringify([
          "Aide-mémoires",
          "Badges personnels",
          "Notes de présentation",
          "Miroirs pour pratique",
          "Marqueurs",
          "Autocollants"
        ]),

        accommodations: JSON.stringify([
          "Pratique adaptée",
          "Support individuel",
          "Temps flexible",
          "Encouragement personnalisé",
          "Options alternatives"
        ]),

        modifications: JSON.stringify({
          struggling: "Pratique intensive avec aide",
          onLevel: "Préparation standard",
          advanced: "Mentorat des autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Confiance personnelle
Maîtrise du contenu
Préparation individuelle`,

        isSubFriendly: true,
        subNotes: `Focus: Préparation individuelle et confiance.
Activité principale: Pratique personnalisée.
Important: Rassurer et encourager chacun.
Tous prêts pour demain.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 47: Dernière répétition
    const lesson47 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Dernière répétition',
        date: new Date('2026-06-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Faire une dernière répétition
• Coordonner parfaitement
• Être totalement prêts`,

        mindsOn: `C'est demain! (8 min)
• Excitation palpable
• "24 heures!"
• Dernière chance de pratiquer
• Énergie focalisée
• "Donnons tout!"`,

        action: `Répétition parfaite (32 min)

PARTIE 1: Run-through complet (20 min)
• Simulation exacte
• Timing chronométré
• Transitions fluides
• Énergie maximale
• Comme si c'était réel

PARTIE 2: Cercle de feedback (12 min)
• Ce qui est parfait
• Derniers petits ajustements
• Encouragements spécifiques
• Solutions aux inquiétudes
• Confiance collective`,

        consolidation: `L'équipe est prête! (5 min)
• Cri de guerre final
• "CITOYENS RESPONSABLES!"
• Poignées de main
• Repos mérité ce soir
• Rendez-vous demain!`,

        materials: JSON.stringify([
          "Toutes les stations",
          "Chronomètre",
          "Micro pour annonces",
          "Musique d'ambiance",
          "Check-list finale",
          "Eau et collations"
        ]),

        accommodations: JSON.stringify([
          "Support constant",
          "Pauses si nécessaire",
          "Encouragement individuel",
          "Flexibilité",
          "Ambiance positive"
        ]),

        modifications: JSON.stringify({
          struggling: "Support maximum, rôle adapté",
          onLevel: "Répétition complète",
          advanced: "Leadership, coordination"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Préparation finale optimale
Coordination parfaite
Confiance totale`,

        isSubFriendly: true,
        subNotes: `Focus: Dernière répétition avant la foire.
Activité principale: Simulation finale.
Important: Confiance et énergie positive.
Repos ce soir!`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 48: GRANDE FOIRE DE CITOYENNETÉ
    const lesson48 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'GRANDE FOIRE DE CITOYENNETÉ',
        date: new Date('2026-06-18'),
        duration: 90, // Extended event
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Présenter leurs apprentissages de l'année
• Démontrer leur citoyenneté responsable
• Célébrer leur croissance`,

        mindsOn: `LE GRAND JOUR! (10 min)
• Rassemblement des citoyens
• Dernière vérification
• Badges épinglés
• Sourires vérifiés
• Énergie au maximum
• "Montrons qui nous sommes!"
• Ouverture officielle!`,

        action: `FOIRE EN ACTION! (75 min)

PARTIE 1: Accueil des invités (15 min)
• Familles arrivent
• Accueil chaleureux
• Distribution des programmes
• Explication du parcours
• Musique d'ambiance

PARTIE 2: Rotations aux stations (45 min)
• Groupes de visiteurs
• 8-10 minutes par station:
  - Citoyenneté numérique: démonstrations sécurité
  - Besoins/Désirs: jeu interactif familial
  - Éco-citoyens: défis verts
  - Leadership: témoignages d'impact
  - Projets communautaires: portfolio d'actions
• Questions-réponses
• Interaction maximale

PARTIE 3: Cérémonie de clôture (15 min)
• Rassemblement final
• Remerciements aux familles
• Témoignages d'élèves
• Remise de diplômes "Citoyen Responsable Certifié"
• Photo de groupe historique
• Applaudissements nourris!`,

        consolidation: `Moment de gloire (5 min)
• Livre d'or signé
• Félicitations reçues
• Larmes de joie
• Fierté immense
• Mission accomplie!
• "NOUS SOMMES DES CITOYENS RESPONSABLES!"`,

        materials: JSON.stringify([
          "Toutes les stations installées",
          "Programmes imprimés",
          "Livre d'or",
          "Diplômes officiels",
          "Micro et son",
          "Appareil photo/vidéo"
        ]),

        accommodations: JSON.stringify([
          "Support constant disponible",
          "Espaces calmes prévus",
          "Rôles flexibles",
          "Pauses possibles",
          "Célébration de tous"
        ]),

        modifications: JSON.stringify({
          struggling: "Support maximum, participation adaptée",
          onLevel: "Présentation complète",
          advanced: "Leadership, maître de cérémonie"
        }),

        assessmentType: 'Sommative - Performance authentique',
        assessmentNotes: `Démonstration complète des apprentissages annuels
Communication avec public réel
Synthèse de toutes les unités
Portfolio vivant de citoyenneté`,

        isSubFriendly: false,
        subNotes: `ÉVÉNEMENT SPÉCIAL - Enseignant titulaire requis
Foire avec familles et communauté
Point culminant de l'année
Support administratif nécessaire`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 49: Réflexion post-foire
    const lesson49 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réflexion post-foire',
        date: new Date('2026-06-19'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Réfléchir sur l'expérience de la foire
• Célébrer leurs succès
• Identifier leurs apprentissages`,

        mindsOn: `Retour sur hier (10 min)
• "C'était INCROYABLE!"
• Partage des moments préférés
• Émotions ressenties
• Feedback des familles
• Fierté partagée
• Réalisation: "Nous l'avons fait!"`,

        action: `Célébration réflexive (28 min)

PARTIE 1: Moments marquants (13 min)
• Tour de table:
  - Mon moment préféré
  - Ce dont je suis le plus fier
  - Ce qui m'a surpris
  - Ce que j'ai appris
• Écoute respectueuse
• Validation mutuelle

PARTIE 2: Livre souvenir de la foire (15 min)
• Création collective:
  - Photos de l'événement
  - Dessins des moments
  - Messages des visiteurs
  - Réflexions personnelles
• Assemblage en album
• Signatures de tous`,

        consolidation: `Fierté éternelle (7 min)
• Contemplation du livre
• "Nous sommes..."
• "EXTRAORDINAIRES!"
• Diplômes distribués
• Accolades collectives
• Moment gravé à jamais`,

        materials: JSON.stringify([
          "Photos de la foire",
          "Papier album",
          "Matériel de collage",
          "Messages des familles",
          "Diplômes",
          "Marqueurs"
        ]),

        accommodations: JSON.stringify([
          "Expression flexible",
          "Support émotionnel",
          "Participation adaptée",
          "Temps de parole respecté",
          "Célébration inclusive"
        ]),

        modifications: JSON.stringify({
          struggling: "Réflexion simple guidée",
          onLevel: "Réflexion complète",
          advanced: "Analyse approfondie"
        }),

        assessmentType: 'Réflexive',
        assessmentNotes: `Métacognition développée
Reconnaissance des apprentissages
Fierté personnelle et collective`,

        isSubFriendly: true,
        subNotes: `Focus: Réflexion et célébration post-foire.
Activité principale: Livre souvenir collectif.
Important: Moment émotionnel important.
Valoriser l'expérience de chacun.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 13: Year-End Reflection (June 22-26, 2026)

    // Lesson 50: Notre voyage de citoyenneté
    const lesson50 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre voyage de citoyenneté',
        date: new Date('2026-06-22'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Revoir le parcours de l'année
• Identifier leur croissance
• Célébrer leur transformation`,

        mindsOn: `Septembre vs Juin (10 min)
• Photos de nous en septembre
• "Regardez comme vous avez grandi!"
• Pas juste en taille!
• En sagesse, gentillesse, responsabilité
• Liste de nos transformations
• "Vous êtes des citoyens maintenant!"`,

        action: `Voyage dans le temps (28 min)

PARTIE 1: Timeline de l'année (13 min)
• Frise chronologique créée:
  - Septembre: Ma famille
  - Novembre: Notre monde
  - Janvier: Vivre ensemble
  - Avril-Juin: Citoyens responsables
• Photos et travaux ajoutés
• Souvenirs partagés

PARTIE 2: Avant/Après personnel (15 min)
• Feuille divisée en deux:
  - Moi en septembre
  - Moi maintenant
• Dessins comparatifs
• "J'ai appris..."
• "Je peux maintenant..."
• Fierté de la croissance`,

        consolidation: `Citoyens accomplis (7 min)
• Présentation des avant/après
• Applaudissements pour chacun
• "La plus grande chose que j'ai apprise..."
• Reconnaissance mutuelle
• Nous avons tous grandi!`,

        materials: JSON.stringify([
          "Photos de septembre",
          "Travaux de l'année",
          "Papier timeline",
          "Feuilles avant/après",
          "Photos actuelles",
          "Marqueurs"
        ]),

        accommodations: JSON.stringify([
          "Réflexion guidée",
          "Support pour timeline",
          "Expression flexible",
          "Aide pour comparaison",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "Réflexion simple, aide maximale",
          onLevel: "Réflexion complète autonome",
          advanced: "Analyse détaillée, connexions"
        }),

        assessmentType: 'Réflexive',
        assessmentNotes: `Conscience de la progression
Auto-évaluation de la croissance
Métacognition développée`,

        isSubFriendly: true,
        subNotes: `Focus: Réflexion sur le parcours annuel.
Activité principale: Timeline et avant/après.
Important: Célébrer toute la croissance.
Moment de fierté collective.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 51: Messages pour l'avenir
    const lesson51 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Messages pour l\'avenir',
        date: new Date('2026-06-23'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer des messages pour septembre
• Transmettre leurs conseils
• Préparer l'avenir`,

        mindsOn: `Lettres du futur (10 min)
• "Si vous pouviez parler à vous en septembre..."
• "Que diriez-vous?"
• Conseils? Encouragements?
• "Et aux futurs Grade 1?"
• Introduction: Capsule temporelle!`,

        action: `Messages temporels (28 min)

PARTIE 1: Lettre à moi-même (15 min)
• Lettre pour septembre prochain:
  - Cher moi de Grade 2...
  - Souviens-toi que...
  - N'oublie pas de...
  - Tu es capable de...
• Dessin inclus
• Enveloppe scellée
• À ouvrir en septembre

PARTIE 2: Guide pour les futurs Grade 1 (13 min)
• Création d'un guide:
  - Conseils pour réussir
  - Ce qui est amusant
  - Ce qui est important
  - Nos meilleurs souvenirs
• Illustrations ajoutées
• Compilation collective`,

        consolidation: `Passeurs de sagesse (7 min)
• Lecture de quelques messages
• Capsule temporelle scellée
• Promesse: Ouvrir en septembre
• Photo avec la capsule
• Transmission accomplie!`,

        materials: JSON.stringify([
          "Papier lettres",
          "Enveloppes",
          "Boîte capsule temporelle",
          "Matériel de scellement",
          "Appareil photo",
          "Matériel de décoration"
        ]),

        accommodations: JSON.stringify([
          "Aide pour l'écriture",
          "Expression par dessin OK",
          "Dictée possible",
          "Support émotionnel",
          "Flexibilité du format"
        ]),

        modifications: JSON.stringify({
          struggling: "Message simple, beaucoup d'aide",
          onLevel: "Lettre complète standard",
          advanced: "Messages détaillés, réflexion profonde"
        }),

        assessmentType: 'Réflexive',
        assessmentNotes: `Projection dans l'avenir
Synthèse des apprentissages
Transmission de connaissances`,

        isSubFriendly: true,
        subNotes: `Focus: Messages pour l'avenir.
Activité principale: Lettres et guide.
Important: Capsule à conserver pour septembre.
Moment de transmission.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 52: Célébration finale
    const lesson52 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration finale - Citoyens pour la vie',
        date: new Date('2026-06-24'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer leur année de citoyenneté
• S'engager pour l'avenir
• Terminer en beauté`,

        mindsOn: `Champions de citoyenneté (10 min)
• Musique de célébration
• "Vous êtes des CHAMPIONS!"
• Rappel de tous nos accomplissements
• Standing ovation pour nous-mêmes
• Émotion et joie
• Dernière célébration ensemble!`,

        action: `Festival de citoyenneté (28 min)

PARTIE 1: Parade des réussites (13 min)
• Défilé avec:
  - Badges de l'année
  - Travaux préférés
  - Photos souvenirs
  - Certificats gagnés
• Musique festive
• Applaudissements constants

PARTIE 2: Cérémonie des promesses (15 min)
• Promesses d'été:
  - Rester de bons citoyens
  - Continuer d'apprendre
  - Aider les autres
  - Protéger l'environnement
• Signature du livre des promesses
• Médailles finales remises
• Photo officielle de promotion`,

        consolidation: `Citoyens pour toujours (7 min)
• Cercle final uni
• Mains au centre
• "Nous sommes et serons toujours..."
• "DES CITOYENS RESPONSABLES!"
• Explosion de joie
• Accolades et larmes de joie
• Au revoir Grade 1, bonjour futur!`,

        materials: JSON.stringify([
          "Musique festive",
          "Tous les badges/certificats",
          "Livre des promesses",
          "Médailles finales",
          "Appareil photo",
          "Décorations festives"
        ]),

        accommodations: JSON.stringify([
          "Participation selon confort",
          "Expression émotionnelle respectée",
          "Support disponible",
          "Flexibilité totale",
          "Célébration inclusive"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation adaptée",
          onLevel: "Célébration complète",
          advanced: "Leadership des célébrations"
        }),

        assessmentType: 'Célébrative',
        assessmentNotes: `Culmination de l'année
Engagement futur
Célébration des accomplissements`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration finale de l'année.
Activité principale: Festival et cérémonie.
Important: Moment très émotionnel.
Fin mémorable de Grade 1.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Note: June 25-26 would be final days with flexible activities

    console.log('✅ Created Lesson 37: Je suis un leader');
    console.log('✅ Created Lesson 38: Inspirer les autres');
    console.log('✅ Created Lesson 39: Résoudre les problèmes');
    console.log('✅ Created Lesson 40: Faire une différence');
    console.log('✅ Created Lesson 41: Notre foire de citoyenneté');
    console.log('✅ Created Lesson 42: Préparation station numérique');
    console.log('✅ Created Lesson 43: Préparation stations besoins et environnement');
    console.log('✅ Created Lesson 44: Répétition générale');
    console.log('✅ Created Lesson 45: Finition et décoration');
    console.log('✅ Created Lesson 46: Préparation personnelle');
    console.log('✅ Created Lesson 47: Dernière répétition');
    console.log('✅ Created Lesson 48: GRANDE FOIRE DE CITOYENNETÉ');
    console.log('✅ Created Lesson 49: Réflexion post-foire');
    console.log('✅ Created Lesson 50: Notre voyage de citoyenneté');
    console.log('✅ Created Lesson 51: Messages pour l\'avenir');
    console.log('✅ Created Lesson 52: Célébration finale - Citoyens pour la vie');

    console.log('\n📊 WEEKS 10-13 SUMMARY');
    console.log('===================');
    console.log('Created 16 perfect lesson plans for Sciences humaines');
    console.log('Unit: Citoyens responsables');
    console.log('Dates: June 1-24, 2026');
    console.log('\nWeek 10 Focus:');
    console.log('✅ Leadership development');
    console.log('✅ Inspiring others');
    console.log('✅ Problem-solving skills');
    console.log('✅ Making a difference');
    console.log('\nWeek 11 Focus:');
    console.log('✅ Planning citizenship fair');
    console.log('✅ Preparing all stations');
    console.log('✅ Rehearsals and practice');
    console.log('\nWeek 12 Focus:');
    console.log('✅ Final preparations');
    console.log('✅ CITIZENSHIP FAIR EVENT');
    console.log('✅ Post-fair reflection');
    console.log('\nWeek 13 Focus:');
    console.log('✅ Year-end reflection');
    console.log('✅ Messages for the future');
    console.log('✅ Final celebration');
    console.log('\nKey Features:');
    console.log('✅ Culminating performance task');
    console.log('✅ Authentic audience engagement');
    console.log('✅ Year-long synthesis');
    console.log('✅ Future-focused reflection');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks10To13CitoyensLessons().catch(console.error);