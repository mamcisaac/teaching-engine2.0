import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks4And5CartesLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 4-5');
  console.log('Unit: Notre monde en cartes');
  console.log('Focus: The World and Special Places');
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
        title: 'Notre monde en cartes'
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
      throw new Error('Unit plan Notre monde en cartes not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 8 lessons for Weeks 4-5\n');

    // WEEK 4: The World Around Us (November 24-28, 2025)
    
    // Lesson 13: Notre planète Terre
    const lesson13 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre planète Terre',
        date: new Date('2025-11-24'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir que la Terre est ronde comme une balle
• Comprendre que la Terre est couverte d'eau et de terre
• Reconnaître que tous les pays sont sur la même planète`,

        mindsOn: `La Terre comme une orange (12 min)
• Présentation d'une orange bleue et verte
• "Notre Terre ressemble à ça!"
• Globe terrestre introduit
• Faire tourner doucement
• Observer: Bleu = eau, Vert/brun = terre
• "Nous sommes ICI!" (pointer le Canada)
• Réalisation: Tout le monde vit sur la même balle!`,

        action: `Exploration de notre planète (25 min)

PARTIE 1: Découverte du globe (10 min)
• Manipulation du globe par petits groupes
• Trouver: océans (beaucoup d'eau!)
• Identifier: continents (grandes terres)
• Chercher: Canada, puis l'Î.-P.-É. (si petit!)
• Observer: D'autres pays loin de nous

PARTIE 2: Notre Terre en art (15 min)
• Cercle bleu sur papier
• Ajouter des continents verts (formes simples)
• Placer un petit point rouge: "Nous sommes ici!"
• Dessiner: nuages, soleil, étoiles autour
• Décorer: "Ma belle planète"`,

        consolidation: `Citoyens de la Terre (8 min)
• Présentation des planètes artistiques
• Chanson: "C'est une petite planète" (simple)
• Geste: Faire une boule avec les mains
• "Nous partageons la Terre avec..."
• Engagement: Prendre soin de notre planète
• Photo avec le globe`,

        materials: JSON.stringify([
          "Orange peinte en bleu et vert",
          "Globe terrestre",
          "Papier bleu en cercles",
          "Papier vert pour continents",
          "Crayons et marqueurs",
          "Images de la Terre de l'espace",
          "Colle et ciseaux"
        ]),

        accommodations: JSON.stringify([
          "Manipulation supervisée du globe",
          "Continents pré-découpés disponibles",
          "Support pour concepts abstraits",
          "Répétition avec gestes",
          "Aide individuelle pour localisation"
        ]),

        modifications: JSON.stringify({
          struggling: "Terre simple, 2-3 continents",
          onLevel: "Terre complète avec continents principaux",
          advanced: "Détails additionnels, noms d'océans"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de la Terre comme sphère
Reconnaissance terre/eau
Début de conscience planétaire`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction à la planète Terre.
Activité principale: Exploration du globe et art.
Important: Concepts abstraits rendus concrets.
Globe disponible pour manipulation.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 14: Les continents et les océans
    const lesson14 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les continents et les océans',
        date: new Date('2025-11-25'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre qu'il y a 7 continents
• Découvrir les océans qui les entourent
• Comprendre que les gens vivent sur tous les continents`,

        mindsOn: `Le puzzle de la Terre (10 min)
• Puzzle géant des continents au sol
• "La Terre est comme un grand puzzle!"
• Assembler ensemble les pièces
• Compter: 1, 2, 3... 7 continents!
• Ajouter l'eau (tissu bleu) entre les pièces
• Chanson des continents (rythmée)`,

        action: `Voyage autour du monde (28 min)

PARTIE 1: Tour des continents (15 min)
• "Embarquons dans notre avion imaginaire!"
• Visite de chaque continent:
  - Amérique du Nord: "Nous sommes ici!"
  - Amérique du Sud: Forêts tropicales
  - Europe: Châteaux et tours
  - Afrique: Animaux sauvages
  - Asie: Le plus grand!
  - Océanie: Kangourous
  - Antarctique: Pingouins et glace
• Images et gestes pour chaque

PARTIE 2: Passeport mondial (13 min)
• Création d'un petit passeport
• Page pour chaque continent visité
• Dessiner un symbole par continent
• Tampon ou autocollant pour chaque
• Fierté: "J'ai voyagé partout!"`,

        consolidation: `Citoyens du monde (7 min)
• Présentation des passeports
• Jeu: "Montre-moi l'Afrique!"
• Rappel: Nous sommes en Amérique du Nord
• Danse des continents
• Mission: Chercher d'où viennent les objets`,

        materials: JSON.stringify([
          "Puzzle des continents grand format",
          "Tissu bleu pour océans",
          "Images de chaque continent",
          "Petits carnets pour passeports",
          "Tampons ou autocollants",
          "Musique du monde",
          "Carte du monde murale"
        ]),

        accommodations: JSON.stringify([
          "Répétition des noms avec gestes",
          "Support visuel constant",
          "Nombre de continents flexible",
          "Aide pour le passeport",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 3-4 continents principaux",
          onLevel: "Tous les continents, symboles simples",
          advanced: "Ajout de pays, océans nommés"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Mémorisation des continents
Compréhension de la diversité mondiale
Création du passeport comme portfolio`,

        isSubFriendly: true,
        subNotes: `Focus: Apprentissage des 7 continents.
Activité principale: Tour du monde imaginaire et passeports.
Important: Rendre le voyage excitant et mémorable.
Images et musique préparées.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 15: Les climats du monde
    const lesson15 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les climats du monde',
        date: new Date('2025-11-26'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir qu'il fait différent temps selon les endroits
• Comprendre: chaud près de l'équateur, froid aux pôles
• Reconnaître notre climat`,

        mindsOn: `La météo mondiale (12 min)
• Images: Désert, jungle, pôle Nord, notre ville
• "Fait-il le même temps partout?"
• Discussion des différences observées
• Introduction: équateur (ligne chaude)
• Pôles (endroits froids)
• Où sommes-nous? (Entre les deux!)`,

        action: `Stations climatiques (25 min)

PARTIE 1: Voyage climatique (15 min)
• 4 stations climatiques:
  - Station Désert: Sable, soleil, chaud
  - Station Jungle: Humide, plantes, pluie
  - Station Pôle: Glace, froid, neige
  - Station Tempéré: Comme chez nous!
• Accessoires et sensations à chaque station
• Rotation de 3-4 minutes

PARTIE 2: Habillons-nous pour le voyage (10 min)
• Papier poupée à habiller
• Choisir vêtements selon le climat
• Désert: Léger et chapeau
• Pôle: Manteau et bottes
• Jungle: Imperméable
• Coller et colorier`,

        consolidation: `Météorologues juniors (8 min)
• Présentation des poupées habillées
• "Pour le désert, j'ai choisi..."
• Bulletin météo mondial improvisé
• Reconnaissance: Notre climat est spécial
• Badge de météorologue`,

        materials: JSON.stringify([
          "Images de différents climats",
          "Sable, fausse neige, plantes",
          "Ventilateur, lampe chauffante (sécuritaire)",
          "Papier poupée et vêtements",
          "Badges météorologue",
          "Globe avec équateur marqué"
        ]),

        accommodations: JSON.stringify([
          "Sensations douces aux stations",
          "Support pour choix de vêtements",
          "Vocabulaire simplifié",
          "Participation flexible",
          "Alternative si sensibilité sensorielle"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 climats, choix guidés",
          onLevel: "4 climats, autonomie dans les choix",
          advanced: "Explication des causes, saisons"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de la diversité climatique
Association climat-vêtements
Conscience géographique élargie`,

        isSubFriendly: true,
        subNotes: `Focus: Découverte des différents climats mondiaux.
Activité principale: Stations sensorielles et habillage.
Important: Sécurité aux stations, supervision.
Matériel sensoriel préparé.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 16: Les animaux du monde
    const lesson16 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les animaux du monde',
        date: new Date('2025-11-28'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir que différents animaux vivent dans différents endroits
• Associer des animaux à leurs continents
• Comprendre l'adaptation aux habitats`,

        mindsOn: `Safari photo mondial (10 min)
• Photos d'animaux du monde entier
• "Où vit le pingouin? Le lion? Le castor?"
• Discussion: Pourquoi là et pas ailleurs?
• Introduction: Les animaux sont adaptés
• Notre animal: Le renard roux de l'Î.-P.-É.!`,

        action: `Zoo mondial dans la classe (28 min)

PARTIE 1: Placement des animaux (13 min)
• Grande carte du monde au sol
• Figurines/images d'animaux
• Placer chaque animal sur son continent:
  - Pingouins → Antarctique
  - Lions → Afrique
  - Pandas → Asie
  - Kangourous → Océanie
  - Ours polaires → Arctique
  - Castors → Amérique du Nord

PARTIE 2: Création d'un animal mondial (15 min)
• Choisir son animal préféré du monde
• Le dessiner dans son habitat
• Ajouter: nourriture, maison, famille
• Écrire/dicter: "Mon animal vit en..."
• Décoration créative`,

        consolidation: `Parade des animaux (7 min)
• Présentation des dessins
• Imiter le cri/mouvement de l'animal
• Jeu: "Qui suis-je?" (mimes)
• Chanson des animaux du monde
• Mission: Observer les animaux locaux`,

        materials: JSON.stringify([
          "Photos d'animaux variés",
          "Carte du monde au sol",
          "Figurines ou images d'animaux",
          "Papier et matériel de dessin",
          "Images d'habitats",
          "Sons d'animaux (optionnel)"
        ]),

        accommodations: JSON.stringify([
          "Nombre d'animaux adapté",
          "Support pour placement",
          "Aide pour l'habitat",
          "Participation au mime flexible",
          "Options variées d'expression"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 animaux principaux",
          onLevel: "6-7 animaux, habitats simples",
          advanced: "Chaînes alimentaires, adaptations"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Association animaux-continents
Compréhension des habitats
Expression créative et scientifique`,

        isSubFriendly: true,
        subNotes: `Focus: Animaux du monde et leurs habitats.
Activité principale: Placement sur carte et création.
Important: Respect de la vie animale.
Figurines et images disponibles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 5: Special Places and Map Skills (December 1-5, 2025)

    // Lesson 17: Les lieux spéciaux pour moi
    const lesson17 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les lieux spéciaux pour moi',
        date: new Date('2025-12-01'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier leurs lieux préférés et importants
• Comprendre que chacun a des lieux spéciaux
• Créer une carte personnelle de leurs lieux`,

        mindsOn: `Mon lieu magique (12 min)
• L'enseignant partage son lieu préféré (photo)
• "Où vous sentez-vous heureux?"
• Tour de table: Mon lieu préféré est...
• Liste au tableau: maison, parc, grand-maman...
• Réalisation: Nous avons tous des lieux spéciaux!
• Introduction: Carte de mes lieux importants`,

        action: `Ma carte du cœur (25 min)

PARTIE 1: Réflexion sur mes lieux (10 min)
• Feuille de réflexion avec questions:
  - Où je me sens en sécurité?
  - Où je joue?
  - Où je vois ma famille?
  - Où j'apprends?
• Dessins rapides ou mots
• Choix de 4-5 lieux importants

PARTIE 2: Création de ma carte personnelle (15 min)
• Papier en forme de cœur
• Placer ses lieux spéciaux
• Relier avec des chemins colorés
• Décorer avec amour et soin
• Ajouter: "La carte de [prénom]"
• Symboles personnels créés`,

        consolidation: `Partage du cœur (8 min)
• Cercle de partage intime
• "Mon lieu le plus spécial est... parce que..."
• Écoute respectueuse
• Applaudissements doux
• Accrochage des cartes du cœur
• Message: Tous les lieux sont importants`,

        materials: JSON.stringify([
          "Photo du lieu préféré de l'enseignant",
          "Papier en forme de cœur",
          "Feuilles de réflexion",
          "Matériel de décoration",
          "Marqueurs colorés",
          "Autocollants cœurs"
        ]),

        accommodations: JSON.stringify([
          "Support pour identification des lieux",
          "Options de représentation variées",
          "Partage optionnel",
          "Aide pour l'organisation spatiale",
          "Respect de la confidentialité"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 lieux, support constant",
          onLevel: "4-5 lieux, création autonome",
          advanced: "Détails, distances relatives, légende"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Expression personnelle des lieux importants
Capacité à organiser spatialement
Développement émotionnel et spatial`,

        isSubFriendly: true,
        subNotes: `Focus: Lieux personnels importants.
Activité principale: Carte du cœur personnelle.
Important: Atmosphère respectueuse et sécurisante.
Respecter tous les choix.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 18: Les cartes nous racontent des histoires
    const lesson18 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les cartes nous racontent des histoires',
        date: new Date('2025-12-02'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les cartes racontent des histoires
• Créer une carte narrative
• Utiliser les cartes pour communiquer`,

        mindsOn: `La carte mystère story (10 min)
• Carte au trésor avec histoire intégrée
• "Cette carte raconte l'aventure de..."
• Suivre l'histoire sur la carte
• Observer: La carte montre le voyage!
• Discussion: Les cartes = histoires visuelles
• Notre tour de raconter!`,

        action: `Cartes narratives (28 min)

PARTIE 1: Histoire collective (13 min)
• Création d'une histoire simple ensemble
• "Le voyage de notre mascotte"
• Tracer le parcours sur grande carte
• Ajouter des événements: 
  - Départ de l'école
  - Rencontre d'un ami
  - Découverte d'un trésor
  - Retour à la maison

PARTIE 2: Ma carte-histoire (15 min)
• Chacun crée sa mini-histoire
• 3-4 étapes simples
• Dessiner le parcours
• Ajouter des images-événements
• Numéroter les étapes
• Décorer comme un livre`,

        consolidation: `Conteurs cartographes (7 min)
• Partage en dyades des cartes-histoires
• "Mon histoire commence..."
• Suivre sur la carte en racontant
• Échange des rôles
• Applaudissements pour les conteurs`,

        materials: JSON.stringify([
          "Carte au trésor narrative",
          "Grande feuille pour histoire collective",
          "Papier format carte",
          "Images-événements pré-découpées",
          "Numéros autocollants",
          "Matériel de décoration"
        ]),

        accommodations: JSON.stringify([
          "Histoire pré-structurée disponible",
          "Support pour séquençage",
          "Images pour aide narrative",
          "Partage avec support",
          "Flexibilité dans la complexité"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 étapes, images fournies",
          onLevel: "3-4 étapes, création mixte",
          advanced: "Histoire complexe, détails riches"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Utilisation narrative des cartes
Séquençage et organisation spatiale
Communication visuelle et orale`,

        isSubFriendly: true,
        subNotes: `Focus: Cartes comme outils narratifs.
Activité principale: Création de cartes-histoires.
Important: Valoriser l'imagination et la créativité.
Exemples disponibles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 19: Les technologies et les cartes
    const lesson19 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les technologies et les cartes',
        date: new Date('2025-12-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir les cartes numériques
• Comprendre le GPS simple
• Comparer cartes papier et numériques`,

        mindsOn: `La magie du GPS (10 min)
• Montrer un téléphone avec carte
• "Comment le téléphone sait où nous sommes?"
• Introduction simple: satellites dans le ciel
• Démonstration: Zoomer avant/arrière
• Trouver notre école sur la carte numérique
• Émerveillement guidé!`,

        action: `Exploration technologique (28 min)

PARTIE 1: Comparaison des cartes (13 min)
• Station 1: Carte papier de la ville
• Station 2: Tablette avec carte numérique
• Observer les différences:
  - Papier: fixe, on peut dessiner
  - Numérique: bouge, zoom, actuelle
• Avantages de chaque type
• Rotation et exploration

PARTIE 2: Notre GPS humain (15 min)
• Jeu de guidage dans la classe
• Un élève = GPS, un autre = voyageur
• GPS guide: "Avance 3 pas, tourne à droite"
• Arriver à destination
• Échanger les rôles
• Célébration de la navigation!`,

        consolidation: `Experts en navigation (7 min)
• Discussion: Quelle carte préférez-vous?
• Avantages de chaque type
• Création d'un vote visuel
• Badge "Navigateur moderne"
• Mission: Observer les GPS en voiture`,

        materials: JSON.stringify([
          "Tablette avec application carte",
          "Cartes papier variées",
          "Images de satellites",
          "Parcours préparé dans la classe",
          "Badges navigateur",
          "Flèches directionnelles"
        ]),

        accommodations: JSON.stringify([
          "Manipulation supervisée de la technologie",
          "Groupes pour exploration numérique",
          "GPS humain avec support",
          "Explications simplifiées",
          "Alternative non-numérique disponible"
        ]),

        modifications: JSON.stringify({
          struggling: "Observation guidée, participation simple",
          onLevel: "Exploration et jeu GPS standard",
          advanced: "Comparaison détaillée, création de route"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension des technologies cartographiques
Capacité à naviguer et guider
Pensée critique sur les outils`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction aux cartes numériques et GPS.
Activité principale: Comparaison et jeu de navigation.
Important: Supervision de la technologie.
Tablette chargée et configurée.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 20: Notre grande carte collaborative
    const lesson20 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre grande carte collaborative',
        date: new Date('2025-12-05'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer une carte géante ensemble
• Appliquer toutes leurs connaissances cartographiques
• Célébrer leurs apprentissages`,

        mindsOn: `Rassemblement des cartographes (10 min)
• Rappel de tout ce qu'on a appris
• "Nous sommes des experts en cartes!"
• Présentation du projet: MEGA-CARTE
• Distribution des responsabilités
• Cri de ralliement: "Cartographes unis!"
• Mise en place du matériel`,

        action: `Construction de la méga-carte (30 min)

PARTIE 1: Planification collective (10 min)
• Décision: Que montrer sur notre carte?
• Vote: Notre communauté complète!
• Attribution des zones:
  - Équipe 1: École et quartier
  - Équipe 2: Ville et parcs
  - Équipe 3: Routes et chemins
  - Équipe 4: Symboles et légende

PARTIE 2: Création collaborative (20 min)
• Travail simultané sur grande surface
• Application de toutes les compétences:
  - Symboles clairs
  - Directions indiquées
  - Échelle respectée (approximative)
  - Couleurs significatives
• Entraide entre équipes
• Assemblage progressif
• Finition collective`,

        consolidation: `Inauguration de notre œuvre (5 min)
• Dévoilement officiel
• Tour guidé par les créateurs
• Photos individuelles avec la carte
• Applaudissements nourris
• Décision: Où l'afficher?
• Fierté collective immense!`,

        materials: JSON.stringify([
          "Papier mural géant (ou plusieurs feuilles)",
          "Marqueurs, crayons, peinture",
          "Règles et formes",
          "Symboles pré-faits",
          "Matériel de collage",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés selon capacités",
          "Support constant disponible",
          "Flexibilité dans la participation",
          "Zones de difficulté adaptée",
          "Célébration de toutes les contributions"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâches simples, beaucoup de support",
          onLevel: "Participation standard en équipe",
          advanced: "Coordination, aide aux autres, détails"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Application intégrée des apprentissages
Collaboration et contribution
Portfolio: Photo avec la carte géante`,

        isSubFriendly: true,
        subNotes: `Focus: Projet collaboratif culminant.
Activité principale: Création de carte géante.
Important: Tous contribuent, célébration finale.
Espace et matériel préparés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 13: Notre planète Terre');
    console.log('✅ Created Lesson 14: Les continents et les océans');
    console.log('✅ Created Lesson 15: Les climats du monde');
    console.log('✅ Created Lesson 16: Les animaux du monde');
    console.log('✅ Created Lesson 17: Les lieux spéciaux pour moi');
    console.log('✅ Created Lesson 18: Les cartes nous racontent des histoires');
    console.log('✅ Created Lesson 19: Les technologies et les cartes');
    console.log('✅ Created Lesson 20: Notre grande carte collaborative');

    console.log('\n📊 WEEKS 4-5 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Notre monde en cartes');
    console.log('Dates: November 24 - December 5, 2025');
    console.log('\nWeek 4 Focus:');
    console.log('✅ Planet Earth introduction');
    console.log('✅ Continents and oceans');
    console.log('✅ World climates');
    console.log('✅ Animals of the world');
    console.log('\nWeek 5 Focus:');
    console.log('✅ Personal special places');
    console.log('✅ Narrative mapping');
    console.log('✅ Technology and GPS');
    console.log('✅ Collaborative mega-map project');
    console.log('\nKey Features:');
    console.log('✅ Global awareness development');
    console.log('✅ Personal connections maintained');
    console.log('✅ Technology integration');
    console.log('✅ Culminating collaborative project');
    console.log('✅ Perfect ETFO alignment throughout');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks4And5CartesLessons().catch(console.error);