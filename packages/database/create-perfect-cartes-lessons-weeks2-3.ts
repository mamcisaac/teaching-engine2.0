import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks2And3CartesLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 2-3');
  console.log('Unit: Notre monde en cartes');
  console.log('Focus: Our Community and Beyond');
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
    console.log('Creating 8 lessons for Weeks 2-3\n');

    // WEEK 2: Our Neighborhood Maps (November 10-14, 2025)
    
    // Lesson 5: Notre quartier
    const lesson5 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre quartier',
        date: new Date('2025-11-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les éléments importants de leur quartier
• Comprendre que le quartier entoure l'école
• Reconnaître des points de repère familiers`,

        mindsOn: `Promenade virtuelle (12 min)
• "Marchons ensemble dans notre quartier!"
• Photos de lieux familiers projetées
• Élèves identifient: "C'est le parc!" "La bibliothèque!"
• Discussion: Qu'est-ce qu'un quartier?
• Brainstorm: Qu'y a-t-il dans notre quartier?
• Liste collective au tableau`,

        action: `Exploration du quartier (25 min)

PARTIE 1: Notre quartier vu du ciel (10 min)
• Grande photo aérienne (ou Google Maps simplifié)
• Trouver notre école d'abord
• Identifier ensemble les lieux connus
• Tracer les rues principales avec le doigt
• Observer: Tout est connecté!

PARTIE 2: Carte collaborative du quartier (15 min)
• Grande feuille, école au centre
• Groupes ajoutent différents éléments:
  - Groupe 1: Parcs et espaces verts
  - Groupe 2: Magasins importants
  - Groupe 3: Maisons et appartements
  - Groupe 4: Services (poste, bibliothèque)
• Rotation et ajouts progressifs`,

        consolidation: `Notre quartier à nous (8 min)
• Contemplation de la carte créée
• Chacun place sa maison (approximatif)
• "J'habite près de..."
• Chanson du quartier improvisée
• Photo de notre carte
• Mission: Observer le trajet maison-école`,

        materials: JSON.stringify([
          "Photos du quartier",
          "Photo aérienne ou carte simplifiée",
          "Grande feuille de papier",
          "Marqueurs de couleur",
          "Symboles pré-découpés",
          "Petites maisons en papier",
          "Colle"
        ]),

        accommodations: JSON.stringify([
          "Photos de repères pour support visuel",
          "Travail en groupe pour support",
          "Flexibilité sur localisation exacte",
          "Options tactiles disponibles",
          "Support individuel si nécessaire"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 3-4 lieux principaux",
          onLevel: "Participation standard à la carte",
          advanced: "Ajout de détails, noms de rues"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de quartier
Capacité à identifier des repères
Participation à la création collaborative`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au concept de quartier.
Activité principale: Carte collaborative du quartier.
Important: Respecter la confidentialité des adresses.
Photos du quartier disponibles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 6: Les symboles sur la carte
    const lesson6 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les symboles sur la carte',
        date: new Date('2025-11-11'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les symboles représentent des choses réelles
• Créer et utiliser des symboles cartographiques
• Lire une légende simple`,

        mindsOn: `Le jeu des symboles (10 min)
• Montrer des symboles familiers (🛑 ♻️ 🚻)
• Élèves devinent leur signification
• Discussion: Pourquoi utilise-t-on des symboles?
• Introduction: Les cartes utilisent des symboles!
• Exemples de symboles de carte
• Création rapide: Notre symbole pour l'école`,

        action: `Maîtres des symboles (28 min)

PARTIE 1: Décodage de symboles (8 min)
• Carte mystère avec symboles simples
• Légende à côté
• Ensemble, décoder la carte
• Trouver: arbres, eau, bâtiments, routes
• Célébration de chaque découverte

PARTIE 2: Création de symboles personnalisés (10 min)
• Chaque élève crée 5 symboles
• Pour: maison, arbre, eau, parc, magasin
• Dessins simples et clairs
• Partage avec voisin

PARTIE 3: Application sur notre carte (10 min)
• Reprendre la carte du quartier
• Remplacer certains dessins par symboles
• Créer une légende officielle
• Affichage de la légende`,

        consolidation: `Experts en symboles (7 min)
• Jeu rapide: Flash de symboles
• Élèves nomment ce que ça représente
• Création d'un dictionnaire de symboles
• Badge "Expert en symboles"
• Mission: Chercher des symboles dehors`,

        materials: JSON.stringify([
          "Symboles courants imprimés",
          "Carte avec symboles simples",
          "Papier pour création de symboles",
          "Carte du quartier d'hier",
          "Cartes index pour légende",
          "Badges experts"
        ]),

        accommodations: JSON.stringify([
          "Symboles pré-dessinés disponibles",
          "Support visuel constant",
          "Travail en dyade possible",
          "Répétition des symboles clés",
          "Aide pour création de légende"
        ]),

        modifications: JSON.stringify({
          struggling: "3 symboles de base, support constant",
          onLevel: "5 symboles, création autonome",
          advanced: "Symboles complexes, légende détaillée"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du rôle des symboles
Capacité à créer des symboles clairs
Application des symboles sur carte`,

        isSubFriendly: true,
        subNotes: `Focus: Compréhension et utilisation des symboles cartographiques.
Activité principale: Création et application de symboles.
Important: Garder les symboles simples et clairs.
Légende affichée pour référence.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 7: Mon chemin vers l'école
    const lesson7 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Mon chemin vers l\'école',
        date: new Date('2025-11-12'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Décrire leur trajet vers l'école
• Identifier les repères sur leur chemin
• Comprendre qu'il y a différents chemins possibles`,

        mindsOn: `Les chemins de chacun (12 min)
• "Comment venez-vous à l'école?"
• Tableau: À pied, en auto, en autobus
• Partage: "Sur mon chemin, je vois..."
• Liste des repères mentionnés
• Réalisation: Nous prenons tous des chemins différents!
• Introduction: Traçons nos chemins`,

        action: `Cartographie des trajets (25 min)

PARTIE 1: Mon chemin personnel (15 min)
• Carte simplifiée du quartier (photocopie)
• Chacun trouve sa zone d'habitation (approximative)
• Tracer son chemin vers l'école
• Ajouter 2-3 repères importants
• Colorier son chemin d'une couleur unique

PARTIE 2: Comparaison des chemins (10 min)
• Affichage de quelques cartes
• Observer: Chemins différents, même destination!
• Compter: Qui a le chemin le plus court? Le plus long?
• Discussion: Pourquoi des chemins différents?
• Célébration de la diversité des trajets`,

        consolidation: `Tous les chemins mènent à l'école (8 min)
• Création d'une carte collective des trajets
• Superposition des chemins (transparents)
• Observation: Une toile d'araignée!
• Chanson: "Tous les chemins" (improvisée)
• Mission: Compter les pas jusqu'à l'école`,

        materials: JSON.stringify([
          "Cartes du quartier photocopiées",
          "Crayons de couleur",
          "Transparents ou papier calque",
          "Marqueurs",
          "Grande carte murale",
          "Autocollants repères"
        ]),

        accommodations: JSON.stringify([
          "Aide pour localisation approximative",
          "Repères visuels fournis",
          "Travail avec partenaire possible",
          "Flexibilité sur détails du trajet",
          "Support pour traçage"
        ]),

        modifications: JSON.stringify({
          struggling: "Trajet simple, 1-2 repères",
          onLevel: "Trajet complet, 2-3 repères",
          advanced: "Détails additionnels, trajets alternatifs"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Capacité à visualiser et tracer un trajet
Identification de repères significatifs
Compréhension de la diversité des chemins`,

        isSubFriendly: true,
        subNotes: `Focus: Trajets personnels vers l'école.
Activité principale: Traçage de chemins individuels.
Important: Respecter la confidentialité, rester approximatif.
Cartes photocopiées prêtes.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 8: La chasse au trésor cartographique
    const lesson8 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La chasse au trésor cartographique',
        date: new Date('2025-11-14'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Utiliser une carte pour trouver des objets
• Suivre des directions sur une carte
• Appliquer leurs connaissances cartographiques`,

        mindsOn: `Préparation à l'aventure (10 min)
• Présentation de la carte au trésor de la classe
• "Des pirates ont caché des trésors!"
• Révision rapide: symboles, directions
• Distribution des cartes d'équipe
• Règles de la chasse expliquées
• Cri de ralliement: "Cartographes, en avant!"`,

        action: `La grande chasse au trésor (30 min)

PARTIE 1: Chasse dans la classe (15 min)
• 4 équipes avec cartes différentes
• Chaque carte mène à 3 trésors cachés
• Utilisation des symboles et directions
• Coopération pour décoder
• Célébration à chaque découverte

PARTIE 2: Création de notre chasse (15 min)
• Chaque équipe cache un "trésor"
• Création d'une carte simple pour le trouver
• Ajout de symboles et directions
• Échange de cartes entre équipes
• Nouvelle chasse avec cartes créées`,

        consolidation: `Célébration des cartographes (5 min)
• Rassemblement avec tous les trésors
• Partage: "Le plus difficile était..."
• Médailles de cartographe pour tous
• Photo de groupe avec cartes
• Annonce: Prochaine semaine, le monde!`,

        materials: JSON.stringify([
          "Cartes au trésor préparées",
          "Petits trésors (autocollants, crayons)",
          "Papier pour création de cartes",
          "Symboles de référence",
          "Médailles cartographe",
          "Boîtes ou enveloppes pour trésors"
        ]),

        accommodations: JSON.stringify([
          "Groupes mixtes pour support",
          "Cartes de difficulté variée",
          "Aide disponible si blocage",
          "Options de participation flexibles",
          "Rôles variés dans l'équipe"
        ]),

        modifications: JSON.stringify({
          struggling: "Carte très simple, support constant",
          onLevel: "Carte standard, autonomie en équipe",
          advanced: "Carte complexe, aide aux autres"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Application pratique des concepts de carte
Capacité à lire et créer des cartes simples
Collaboration et résolution de problèmes`,

        isSubFriendly: true,
        subNotes: `Focus: Application ludique des apprentissages cartographiques.
Activité principale: Chasse au trésor avec cartes.
Important: Trésors cachés à l'avance, sécurité.
Activité très engageante et active.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 3: Maps of Our World (November 17-21, 2025)

    // Lesson 9: Notre ville sur la carte
    const lesson9 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre ville sur la carte',
        date: new Date('2025-11-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que notre ville est plus grande que notre quartier
• Identifier des éléments importants de la ville
• Situer notre quartier dans la ville`,

        mindsOn: `Zoom arrière magique (12 min)
• "Imaginons qu'on s'envole très haut!"
• Progression: classe → école → quartier → ?
• Introduction: Notre VILLE!
• Photos ou images de la ville
• Discussion: Qu'est-ce qu'une ville?
• Brainstorm: Que trouve-t-on dans une ville?`,

        action: `Exploration de notre ville (25 min)

PARTIE 1: Tour virtuel de la ville (10 min)
• Carte simplifiée de la ville projetée
• Identifier ensemble: centre-ville, parcs, rivière
• Trouver notre quartier sur la carte
• Observer: Notre quartier est une partie!
• Repérer d'autres quartiers

PARTIE 2: Maquette de ville (15 min)
• Boîtes et matériel recyclé
• Création collective d'une ville 3D
• Zones: résidentielle, commerciale, parcs
• Routes tracées entre les zones
• Notre école placée dans la maquette`,

        consolidation: `Citoyens de notre ville (8 min)
• Tour guidé de notre maquette
• Chacun explique sa contribution
• "Dans notre ville, j'aime..."
• Photo de la maquette
• Fierté: Nous connaissons notre ville!`,

        materials: JSON.stringify([
          "Carte simplifiée de la ville",
          "Photos de lieux importants",
          "Boîtes recyclées variées",
          "Papier construction",
          "Ruban adhésif pour routes",
          "Petites voitures/figurines"
        ]),

        accommodations: JSON.stringify([
          "Support visuel constant",
          "Travail collaboratif encouragé",
          "Flexibilité dans la création",
          "Aide pour concepts spatiaux",
          "Participation adaptée aux capacités"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 2-3 éléments de ville",
          onLevel: "Participation standard à la maquette",
          advanced: "Ajout de détails, connexions complexes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'échelle ville vs quartier
Participation à la création collective
Identification d'éléments urbains`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au concept de ville.
Activité principale: Création d'une maquette de ville.
Important: Matériel recyclé collecté à l'avance.
Activité collaborative et créative.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 10: Notre province - L'Île-du-Prince-Édouard
    const lesson10 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre province - L\'Île-du-Prince-Édouard',
        date: new Date('2025-11-18'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir que nous vivons sur une île
• Reconnaître la forme de l'Î.-P.-É.
• Comprendre que notre province est entourée d'eau`,

        mindsOn: `L'île mystérieuse (10 min)
• Bac d'eau avec "île" en pâte à modeler
• Démonstration: Qu'est-ce qu'une île?
• "Notre province est une île!"
• Présentation de la carte de l'Î.-P.-É.
• Observer la forme unique
• "Ça ressemble à quoi?" (croissant, sourire)`,

        action: `Découverte de notre île (28 min)

PARTIE 1: Exploration de l'Î.-P.-É. (13 min)
• Grande carte de la province au sol
• Marcher le contour de l'île
• Identifier: Charlottetown (capitale), notre ville
• Observer: eau tout autour (Océan Atlantique)
• Placer des coquillages sur les plages
• Compter les ponts vers le continent

PARTIE 2: Notre île en art (15 min)
• Tracer le contour de l'Î.-P.-É.
• Colorier: terre en vert, eau en bleu
• Ajouter: notre ville (point rouge)
• Dessiner: phare, pommes de terre, homards
• Décoration personnelle de notre île`,

        consolidation: `Fiers insulaires (7 min)
• Présentation de nos îles artistiques
• Chanson: "Mon île est belle" (créée)
• Geste: Forme de l'île avec les mains
• Badge: "Je vis sur une île!"
• Mission: Raconter à la famille`,

        materials: JSON.stringify([
          "Bac d'eau et pâte à modeler",
          "Grande carte de l'Î.-P.-É.",
          "Contours de l'île photocopiés",
          "Crayons de couleur",
          "Coquillages",
          "Images de symboles de l'Î.-P.-É.",
          "Badges insulaires"
        ]),

        accommodations: JSON.stringify([
          "Contour pré-tracé disponible",
          "Support pour concepts d'île",
          "Répétition du vocabulaire",
          "Aide pour localisation",
          "Participation flexible"
        ]),

        modifications: JSON.stringify({
          struggling: "Coloriage simple, 1-2 éléments",
          onLevel: "Carte complète avec éléments clés",
          advanced: "Détails additionnels, villes multiples"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept d'île
Reconnaissance de la forme de l'Î.-P.-É.
Fierté provinciale développée`,

        isSubFriendly: true,
        subNotes: `Focus: Découverte de notre province insulaire.
Activité principale: Exploration et art de l'Î.-P.-É.
Important: Développer la fierté locale.
Matériel provincial disponible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 11: Le Canada, notre pays
    const lesson11 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Le Canada, notre pays',
        date: new Date('2025-11-19'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir que l'Î.-P.-É. fait partie du Canada
• Reconnaître le drapeau et la forme du Canada
• Comprendre que le Canada est grand`,

        mindsOn: `Du petit au grand (12 min)
• Poupées russes pour illustrer l'emboîtement
• Moi → Ma famille → Mon école → Ma ville → ?
• Introduction: Mon PAYS, le Canada!
• Présentation du drapeau canadien
• Observer la feuille d'érable
• "Nous sommes Canadiens!"`,

        action: `Exploration du Canada (25 min)

PARTIE 1: Puzzle du Canada (10 min)
• Grand puzzle des provinces simplifié
• Assembler ensemble le Canada
• Trouver et placer l'Î.-P.-É. (si petite!)
• Observer: Le Canada est GRAND!
• Identifier: océans, voisin (États-Unis)

PARTIE 2: Symboles canadiens (15 min)
• Création d'un collage canadien
• Drapeau à colorier
• Images: castor, hockey, montagnes, inukshuk
• Ajouter l'Î.-P.-É. sur la carte
• Décorer avec fierté canadienne`,

        consolidation: `Ô Canada junior (8 min)
• Présentation des collages
• Apprentissage: Première ligne de l'hymne
• Geste de la feuille d'érable
• "Je suis Canadien et j'habite..."
• Photo avec drapeaux
• Célébration de notre pays!`,

        materials: JSON.stringify([
          "Poupées russes ou boîtes emboîtables",
          "Puzzle du Canada",
          "Drapeau canadien",
          "Feuilles d'érable (vraies ou papier)",
          "Images de symboles canadiens",
          "Matériel de collage",
          "Petits drapeaux"
        ]),

        accommodations: JSON.stringify([
          "Support visuel pour concepts",
          "Aide pour puzzle",
          "Répétition des noms",
          "Participation graduelle",
          "Flexibilité dans le collage"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 symboles simples",
          onLevel: "Collage complet avec carte",
          advanced: "Nommer d'autres provinces, détails"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'appartenance au Canada
Reconnaissance des symboles nationaux
Développement de l'identité canadienne`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au Canada.
Activité principale: Puzzle et symboles canadiens.
Important: Développer fierté nationale.
Hymne national (première ligne seulement).`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 12: Célébration cartographique de la semaine
    const lesson12 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration cartographique de la semaine',
        date: new Date('2025-11-21'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Réviser les concepts de ville, province et pays
• Partager leurs apprentissages
• Célébrer leurs progrès en cartographie`,

        mindsOn: `Voyage éclair (10 min)
• "Partons en voyage rapide!"
• Progression sur les cartes: quartier → ville → province → pays
• À chaque étape: "Où sommes-nous?"
• Mouvements: petit (quartier) à grand (pays)
• Préparation du musée de cartes`,

        action: `Festival des cartes (30 min)

PARTIE 1: Exposition de nos œuvres (10 min)
• Installation de toutes nos cartes
• Organisation par échelle
• Étiquettes créées
• Musée improvisé dans la classe

PARTIE 2: Visites guidées (10 min)
• Petits groupes de guides
• Explication de leurs cartes préférées
• Questions des visiteurs (autres élèves)
• Rotation des rôles

PARTIE 3: Jeu de révision géant (10 min)
• Course-relais cartographique
• Questions sur cartes, symboles, directions
• Équipes collaborent
• Célébration de chaque bonne réponse`,

        consolidation: `Maîtres cartographes certifiés (5 min)
• Remise de certificats cartographes
• Photo de groupe avec toutes les cartes
• Cri: "Nous sommes des cartographes!"
• Annonce: Aventures continuent!
• Applaudissements pour tous!`,

        materials: JSON.stringify([
          "Toutes les cartes créées",
          "Étiquettes pour exposition",
          "Questions de révision",
          "Certificats cartographes",
          "Appareil photo",
          "Rubans ou médailles"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés selon confort",
          "Support pour présentations",
          "Questions adaptées",
          "Participation flexible",
          "Célébration de tous les efforts"
        ]),

        modifications: JSON.stringify({
          struggling: "Présentation simple, support disponible",
          onLevel: "Participation complète aux activités",
          advanced: "Rôle de leader, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Démonstration des apprentissages
Capacité à expliquer les concepts
Portfolio: Collection de cartes complétée`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration et révision des apprentissages.
Activité principale: Exposition et jeux de révision.
Important: Atmosphère festive et inclusive.
Tous les travaux valorisés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 5: Notre quartier');
    console.log('✅ Created Lesson 6: Les symboles sur la carte');
    console.log('✅ Created Lesson 7: Mon chemin vers l\'école');
    console.log('✅ Created Lesson 8: La chasse au trésor cartographique');
    console.log('✅ Created Lesson 9: Notre ville sur la carte');
    console.log('✅ Created Lesson 10: Notre province - L\'Île-du-Prince-Édouard');
    console.log('✅ Created Lesson 11: Le Canada, notre pays');
    console.log('✅ Created Lesson 12: Célébration cartographique de la semaine');

    console.log('\n📊 WEEKS 2-3 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Notre monde en cartes');
    console.log('Dates: November 10-21, 2025');
    console.log('\nWeek 2 Focus:');
    console.log('✅ Neighborhood exploration');
    console.log('✅ Map symbols and legends');
    console.log('✅ Personal routes to school');
    console.log('✅ Treasure hunt application');
    console.log('\nWeek 3 Focus:');
    console.log('✅ City understanding');
    console.log('✅ Provincial identity (PEI)');
    console.log('✅ National identity (Canada)');
    console.log('✅ Celebration and review');
    console.log('\nKey Features:');
    console.log('✅ Progressive scale expansion');
    console.log('✅ Local to global connections');
    console.log('✅ Hands-on activities');
    console.log('✅ Identity development');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks2And3CartesLessons().catch(console.error);