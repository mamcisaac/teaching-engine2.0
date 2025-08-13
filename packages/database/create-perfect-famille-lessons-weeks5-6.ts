import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks5And6Lessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 5-6');
  console.log('Unit: Ma famille et ma communauté');
  console.log('Focus: Deeper Connections and Performance Task Preparation');
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
        title: 'Ma famille et ma communauté'
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
      throw new Error('Unit plan not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 8 lessons for Weeks 5-6\n');

    // WEEK 5: Our Community Stories (September 29 - October 3, 2025)
    
    // Lesson 17: Les histoires de nos familles
    const lesson17 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les histoires de nos familles',
        date: new Date('2025-09-29'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que chaque famille a des histoires importantes
• Partager une histoire familiale simple
• Écouter avec respect les histoires des autres`,

        mindsOn: `La boîte à histoires (12 min)
• Présentation d'une vieille boîte décorée
• L'enseignant partage une histoire familiale avec objet
• Discussion: Qu'est-ce qu'une histoire de famille?
• Chanson: "Les souvenirs de famille"
• Annonce: Cette semaine, nous collectons nos histoires!`,

        action: `Création de nos histoires familiales (25 min)

PARTIE 1: Préparation de l'histoire (10 min)
• Réflexion guidée: Un moment spécial avec ma famille
• Dessin rapide de ce moment
• Mots-clés ajoutés autour du dessin
• Pratique avec un partenaire

PARTIE 2: Cercle d'histoires (15 min)
• Formation de petits cercles de 4-5 élèves
• Chacun raconte son histoire (2 min)
• Étoile d'or donnée après chaque histoire
• Questions douces des amis
• Rotation pour entendre différentes histoires`,

        consolidation: `Célébration des histoires (8 min)
• Rassemblement en grand cercle
• Partage: Une histoire qui m'a touché
• Création d'une guirlande d'histoires
• Chaque dessin attaché à une corde
• Mission: Apporter un objet familial demain`,

        materials: JSON.stringify([
          "Boîte décorée pour histoires",
          "Objet familial de l'enseignant",
          "Papier et crayons",
          "Étoiles dorées autocollantes",
          "Corde pour guirlande",
          "Pinces à linge décorées"
        ]),

        accommodations: JSON.stringify([
          "Option de dessiner au lieu de raconter",
          "Support individuel pour élèves timides",
          "Groupes stratégiques pour confort",
          "Possibilité de partager avec enseignant seul",
          "Temps supplémentaire si nécessaire"
        ]),

        modifications: JSON.stringify({
          struggling: "Histoire très simple, support visuel, aide pour raconter",
          onLevel: "Histoire standard avec détails appropriés",
          advanced: "Histoire plus complexe, connexions avec autres apprentissages"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Observation de l'écoute respectueuse
Capacité à partager une histoire personnelle
Portfolio: Dessin et histoire documentés`,

        isSubFriendly: true,
        subNotes: `Focus: Partage d'histoires familiales.
Activité principale: Cercles d'histoires avec dessins.
Important: Créer atmosphère respectueuse et sécurisante.
Tous les types d'histoires valorisés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 18: Nos objets précieux
    const lesson18 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Nos objets précieux',
        date: new Date('2025-09-30'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Expliquer pourquoi un objet familial est spécial
• Faire des connexions entre objets et souvenirs
• Respecter les trésors des autres familles`,

        mindsOn: `Le musée des trésors (10 min)
• Disposition soignée des objets apportés
• Musique douce pendant l'installation
• Tour silencieux pour observer
• Retour au cercle: Qu'avez-vous remarqué?
• Introduction: Chaque objet a une histoire`,

        action: `Exposition des objets précieux (28 min)

PARTIE 1: Préparation des exposants (8 min)
• Création d'une étiquette de musée
• Nom de l'objet et famille
• Petit symbole ou dessin
• Installation à sa place d'exposition

PARTIE 2: Visite guidée du musée (20 min)
• Division en 2 groupes
• Groupe 1: Guides du musée (10 min)
• Groupe 2: Visiteurs curieux
• Présentation de 1 minute par objet
• Échange des rôles
• Photos de l'exposition`,

        consolidation: `Cérémonie de gratitude (7 min)
• Cercle avec nos objets
• "Mon objet est spécial parce que..."
• Applaudissements doux après chaque partage
• Chanson: "Les trésors de nos familles"
• Rangement respectueux des objets`,

        materials: JSON.stringify([
          "Tables pour exposition",
          "Étiquettes de musée vierges",
          "Matériel de décoration",
          "Appareil photo",
          "Musique douce",
          "Tissu pour présentation"
        ]),

        accommodations: JSON.stringify([
          "Option d'apporter photo si pas d'objet",
          "Présentation avec support si nécessaire",
          "Possibilité de présenter à petit groupe",
          "Aide pour création d'étiquette",
          "Respect des objets fragiles/précieux"
        ]),

        modifications: JSON.stringify({
          struggling: "Présentation très simple, support constant",
          onLevel: "Présentation standard avec histoire",
          advanced: "Connexions historiques ou culturelles ajoutées"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Capacité à expliquer l'importance de l'objet
Respect démontré pour les objets des autres
Portfolio: Photo avec objet et étiquette`,

        isSubFriendly: true,
        subNotes: `Focus: Exposition d'objets familiaux précieux.
Activité principale: Musée de classe avec visites guidées.
Important: Manipulation respectueuse, supervision constante.
Prévoir sécurité pour objets fragiles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 19: Les liens entre nos familles
    const lesson19 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les liens entre nos familles',
        date: new Date('2025-10-01'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir les connexions entre les familles
• Comprendre comment les familles s'entraident dans la communauté
• Visualiser notre réseau communautaire`,

        mindsOn: `La toile d'araignée communautaire (12 min)
• Cercle debout avec pelote de laine
• L'enseignant commence: "Je connais la famille de..."
• Lance la laine en gardant un bout
• Continue jusqu'à créer une toile
• Observation: Nous sommes tous connectés!`,

        action: `Cartographie de nos connexions (25 min)

PARTIE 1: Découverte des liens (10 min)
• Enquête en dyades: Comment nos familles se connaissent?
• École? Travail? Voisins? Activités?
• Documentation sur papier
• Symboles pour types de connexions

PARTIE 2: Création du réseau visuel (15 min)
• Grande affiche au centre
• Photos de familles en cercle
• Fils de couleur pour connexions
• Couleurs = types de liens
• Étiquettes explicatives ajoutées
• Observation de la complexité du réseau`,

        consolidation: `Célébration de notre réseau (8 min)
• Contemplation de notre œuvre
• Comptage des connexions
• Réflexion: Nous formons vraiment une communauté!
• Chanson avec mouvements: "Tous ensemble"
• Photo devant notre réseau`,

        materials: JSON.stringify([
          "Pelote de laine colorée",
          "Grande affiche",
          "Photos des familles",
          "Fils de différentes couleurs",
          "Colle et ciseaux",
          "Étiquettes",
          "Symboles pré-découpés"
        ]),

        accommodations: JSON.stringify([
          "Support pour identifier connexions",
          "Travail en équipe encouragé",
          "Options visuelles pour documentation",
          "Aide pour manipulation fine",
          "Participation flexible au cercle"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 1-2 connexions simples",
          onLevel: "Identification standard des liens",
          advanced: "Exploration des connexions indirectes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension des connexions communautaires
Participation à la création du réseau
Capacité à identifier des liens`,

        isSubFriendly: true,
        subNotes: `Focus: Connexions entre les familles de la classe.
Activité principale: Création d'un réseau visuel de liens.
Important: Valoriser tous les types de connexions.
Activité très visuelle et collaborative.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 20: Préparation de notre exposition
    const lesson20 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation de notre exposition',
        date: new Date('2025-10-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est une exposition
• Choisir leurs meilleures créations à présenter
• Commencer à préparer notre grande exposition`,

        mindsOn: `L'annonce excitante! (10 min)
• Invitation spéciale présentée (enveloppe dorée)
• Lecture: "Vous êtes invités à notre exposition!"
• Discussion: Qu'est-ce qu'une exposition?
• Exemples: musée, galerie d'art
• Mission: Devenir des organisateurs d'exposition!`,

        action: `Organisation de l'exposition (30 min)

PARTIE 1: Sélection des œuvres (10 min)
• Tour de nos créations des 5 semaines
• Chaque élève choisit 2-3 pièces préférées
• Étoiles collées sur les choix
• Discussion du pourquoi de ces choix

PARTIE 2: Planification spatiale (10 min)
• Visite de l'espace d'exposition
• Décisions collectives: Où placer quoi?
• Zones identifiées: Famille, Communauté, École
• Croquis simple du plan

PARTIE 3: Création des invitations (10 min)
• Modèle d'invitation fourni
• Décoration personnalisée
• Date et heure ajoutées
• Préparation pour envoi à la maison`,

        consolidation: `Anticipation et engagement (5 min)
• Cercle d'excitement
• Chacun nomme ce qu'il a hâte de montrer
• Pratique de notre chanson de bienvenue
• Distribution des invitations
• Promesse: Pratiquer nos présentations!`,

        materials: JSON.stringify([
          "Enveloppe dorée avec invitation",
          "Toutes les créations des 5 semaines",
          "Étoiles autocollantes",
          "Plan de l'espace",
          "Modèles d'invitation",
          "Matériel de décoration"
        ]),

        accommodations: JSON.stringify([
          "Aide pour sélection si indécis",
          "Support pour création d'invitation",
          "Flexibilité dans nombre de pièces choisies",
          "Options de présentation variées",
          "Rôles différents possibles"
        ]),

        modifications: JSON.stringify({
          struggling: "Sélection guidée, invitation simple",
          onLevel: "Participation standard à toutes les étapes",
          advanced: "Rôle de leadership dans l'organisation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Capacité à faire des choix réfléchis
Participation à la planification collective
Engagement dans la préparation`,

        isSubFriendly: true,
        subNotes: `Focus: Début de préparation pour l'exposition finale.
Activité principale: Sélection et organisation des travaux.
Important: Créer excitement pour l'événement.
Invitations prêtes pour la maison.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 6: Performance Task Preparation (October 6-10, 2025)

    // Lesson 21: Nos voix, nos histoires
    const lesson21 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Nos voix, nos histoires',
        date: new Date('2025-10-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Pratiquer la présentation orale de leurs travaux
• Développer la confiance en parlant devant un groupe
• Apprendre à être un bon public`,

        mindsOn: `Le micro magique (10 min)
• Présentation d'un "micro magique" (vrai ou faux)
• Démonstration par l'enseignant
• Le micro donne du courage pour parler!
• Pratique rapide: Dire son nom avec fierté
• Règles du bon public revisitées`,

        action: `Répétition générale - Partie 1 (28 min)

PARTIE 1: Préparation individuelle (8 min)
• Choix de LA pièce à présenter oralement
• Pratique avec carte de notes simples
• 3 points importants identifiés
• Gestes ou mouvements ajoutés

PARTIE 2: Présentations en petits groupes (20 min)
• Groupes de 4-5 élèves
• Mini-scène improvisée
• 2 minutes par présentation
• Applaudissements après chaque
• Feedback positif des pairs
• Rotation des groupes`,

        consolidation: `Célébration du courage (7 min)
• Rassemblement en cercle
• Partage: Comment je me sens après avoir présenté?
• Certificats "Présentateur courageux"
• Encouragements pour demain
• Chanson de confiance créée ensemble`,

        materials: JSON.stringify([
          "Microphone (vrai ou fabriqué)",
          "Cartes de notes",
          "Travaux sélectionnés",
          "Certificats de courage",
          "Espace scène délimité",
          "Minuterie visuelle"
        ]),

        accommodations: JSON.stringify([
          "Option de présenter avec un ami",
          "Support visuel accepté",
          "Temps flexible pour présentation",
          "Possibilité de présenter assis",
          "Alternative: présentation enregistrée"
        ]),

        modifications: JSON.stringify({
          struggling: "Présentation très courte, beaucoup de support",
          onLevel: "Présentation standard de 1-2 minutes",
          advanced: "Présentation plus élaborée, questions du public"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Développement de la confiance observé
Qualité de l'écoute comme public
Progrès dans l'expression orale`,

        isSubFriendly: true,
        subNotes: `Focus: Pratique des présentations orales.
Activité principale: Répétitions en petits groupes.
Important: Créer environnement très supportif.
Encouragement constant, pas de pression.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 22: L'art de notre communauté
    const lesson22 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'L\'art de notre communauté',
        date: new Date('2025-10-07'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer une œuvre collective représentant notre communauté
• Intégrer tous nos apprentissages dans une création
• Travailler ensemble vers un but commun`,

        mindsOn: `Vision de notre œuvre (12 min)
• Rappel de tout ce qu'on a appris
• Brainstorm visuel: Images de notre communauté
• Proposition: Créons une murale ensemble!
• Esquisse collective au tableau
• Distribution des responsabilités`,

        action: `Création de la murale communautaire (28 min)

PARTIE 1: Préparation des éléments (10 min)
• 4 stations de création
• Station 1: Nos familles (dessins/collage)
• Station 2: Nos helpers (figurines en papier)
• Station 3: Notre école (bâtiment collectif)
• Station 4: Nos symboles (cœurs, étoiles, arcs-en-ciel)

PARTIE 2: Assemblage collaboratif (18 min)
• Grande feuille murale au sol
• Placement réfléchi des éléments
• Collage collectif organisé
• Ajout de détails et connexions
• Signatures de tous les artistes
• Photos du processus`,

        consolidation: `Inauguration de la murale (5 min)
• Dévoilement cérémonieux
• Moment de contemplation silencieuse
• Explosion d'applaudissements
• Décision: Où l'accrocher pour l'exposition?
• Photo de groupe devant l'œuvre`,

        materials: JSON.stringify([
          "Papier mural grand format",
          "Matériel de dessin varié",
          "Papier construction coloré",
          "Colle et ciseaux",
          "Paillettes et décorations",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Choix de station selon intérêt/capacité",
          "Outils adaptés disponibles",
          "Travail en équipe encouragé",
          "Rôles variés possibles",
          "Participation à son niveau"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâches simples, beaucoup d'aide",
          onLevel: "Participation standard aux stations",
          advanced: "Coordination d'une station, aide aux autres"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Collaboration et coopération observées
Contribution à l'œuvre collective
Integration des apprentissages visible`,

        isSubFriendly: true,
        subNotes: `Focus: Création d'une murale collective.
Activité principale: Stations d'art puis assemblage.
Important: Tous contribuent, œuvre collaborative.
Protéger les vêtements, espace bien organisé.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 23: Répétition finale
    const lesson23 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Répétition finale',
        date: new Date('2025-10-08'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Faire une répétition complète de l'exposition
• Pratiquer l'accueil des visiteurs
• Perfectionner leurs présentations`,

        mindsOn: `C'est le grand jour... demain! (8 min)
• Annonce excitante: Répétition générale!
• Rappel du déroulement de demain
• Distribution des rôles: guides, présentateurs, accueil
• Badges spéciaux créés
• Énergie positive générée!`,

        action: `Répétition générale complète (32 min)

PARTIE 1: Installation de l'exposition (10 min)
• Mise en place de toutes les œuvres
• Vérification des étiquettes
• Chemins de visite établis
• Stations de présentation identifiées

PARTIE 2: Simulation avec visiteurs (22 min)
• Moitié = exposants, moitié = visiteurs
• Accueil: "Bienvenue à notre exposition!"
• Visites guidées de 10 minutes
• Présentations aux stations
• Échange des rôles
• Ajustements notés`,

        consolidation: `Cercle de confiance (5 min)
• Formation du cercle de pouvoir
• Chacun dit: "Je suis prêt(e)!"
• Cri de ralliement de classe
• High-fives collectifs
• Rappel: Tenue spéciale demain!`,

        materials: JSON.stringify([
          "Toutes les œuvres à exposer",
          "Étiquettes et panneaux",
          "Badges de rôles",
          "Plan de circulation",
          "Microphone",
          "Musique d'ambiance"
        ]),

        accommodations: JSON.stringify([
          "Rôles adaptés aux capacités",
          "Partenaires de support assignés",
          "Scripts simples disponibles",
          "Flexibilité dans les présentations",
          "Espaces calmes identifiés"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple, support constant disponible",
          onLevel: "Participation standard à la répétition",
          advanced: "Rôle de coordination, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Préparation et organisation observées
Confiance démontrée dans les répétitions
Collaboration dans la mise en place`,

        isSubFriendly: true,
        subNotes: `Focus: Répétition générale pour l'exposition.
Activité principale: Simulation complète avec échange de rôles.
Important: Renforcer la confiance, ajustements finaux.
Tout doit être prêt pour demain.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 24: EXPOSITION: Nos familles, notre communauté!
    const lesson24 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'EXPOSITION: Nos familles, notre communauté!',
        date: new Date('2025-10-10'),
        duration: 60, // Extended for the special event
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Présenter leurs apprentissages aux familles et à la communauté
• Démontrer leur compréhension de la famille et communauté
• Célébrer 6 semaines d'apprentissage et de croissance`,

        mindsOn: `Préparation finale et accueil (15 min)
• Arrivée en tenue spéciale
• Derniers ajustements de l'exposition
• Pratique du chant de bienvenue
• Positionnement aux postes
• Portes ouvrent: "Bienvenue!"`,

        action: `L'EXPOSITION EN ACTION! (40 min)

PARTIE 1: Accueil officiel (10 min)
• Mot de bienvenue par les élèves
• Chanson de notre communauté
• Présentation de la murale collective
• Applaudissements!

PARTIE 2: Visite guidée (20 min)
• Familles circulent librement
• Élèves présentent leurs travaux
• Stations interactives actives
• Photos souvenirs prises
• Livre d'or signé

PARTIE 3: Célébration communautaire (10 min)
• Rassemblement pour clôture
• Remerciements aux familles
• Certificats "Expert en communauté"
• Performance finale: notre danse
• Collation communautaire`,

        consolidation: `Réflexion et fierté (5 min)
• Après le départ des invités
• Cercle de fierté formé
• Partage: Mon moment préféré
• Félicitations mutuelles
• Photo de classe victorieuse
• Mission accomplie!`,

        materials: JSON.stringify([
          "Exposition complète installée",
          "Programme de l'événement",
          "Livre d'or",
          "Certificats pour élèves",
          "Appareil photo",
          "Collation simple",
          "Musique d'ambiance"
        ]),

        accommodations: JSON.stringify([
          "Flexibilité dans les présentations",
          "Support disponible en tout temps",
          "Espaces calmes accessibles",
          "Rôles variés selon confort",
          "Pauses permises au besoin"
        ]),

        modifications: JSON.stringify({
          struggling: "Support constant, présentation adaptée",
          onLevel: "Participation complète standard",
          advanced: "Rôles de leadership, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Performance finale évaluée globalement
Portfolio complet de l'unité
Croissance depuis le début documentée
Célébration de tous les progrès`,

        isSubFriendly: false,
        subNotes: `ÉVÉNEMENT SPÉCIAL - Enseignant titulaire requis
Exposition finale avec familles invitées
Culmination de 6 semaines de travail
Support administratif peut être nécessaire`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 17: Les histoires de nos familles');
    console.log('✅ Created Lesson 18: Nos objets précieux');
    console.log('✅ Created Lesson 19: Les liens entre nos familles');
    console.log('✅ Created Lesson 20: Préparation de notre exposition');
    console.log('✅ Created Lesson 21: Nos voix, nos histoires');
    console.log('✅ Created Lesson 22: L\'art de notre communauté');
    console.log('✅ Created Lesson 23: Répétition finale');
    console.log('✅ Created Lesson 24: EXPOSITION: Nos familles, notre communauté!');

    console.log('\n📊 WEEKS 5-6 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Ma famille et ma communauté');
    console.log('Dates: September 29 - October 10, 2025');
    console.log('\nWeek 5 Focus:');
    console.log('✅ Family stories and treasures');
    console.log('✅ Community connections visualization');
    console.log('✅ Beginning exposition preparation');
    console.log('✅ Portfolio curation');
    console.log('\nWeek 6 Focus:');
    console.log('✅ Presentation skills development');
    console.log('✅ Collaborative mural creation');
    console.log('✅ Final rehearsal');
    console.log('✅ GRAND EXPOSITION EVENT');
    console.log('\nKey Features:');
    console.log('✅ Student voice and choice emphasized');
    console.log('✅ Authentic audience engagement');
    console.log('✅ Culminating performance task');
    console.log('✅ Family and community celebration');
    console.log('✅ Portfolio completion and presentation');
    console.log('✅ Demonstration of all learning');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks5And6Lessons().catch(console.error);