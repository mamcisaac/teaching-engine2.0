import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeek1CartesLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEK 1');
  console.log('Unit: Notre monde en cartes');
  console.log('Focus: Introduction to Maps and Spatial Awareness');
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
    console.log('Creating 4 lessons for Week 1\n');

    // WEEK 1: Introduction to Maps (November 3-6, 2025)
    
    // Lesson 1: Qu'est-ce qu'une carte?
    const lesson1 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Qu\'est-ce qu\'une carte?',
        date: new Date('2025-11-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est une carte et à quoi elle sert
• Identifier différents types de cartes
• Reconnaître que les cartes nous aident à nous orienter`,

        mindsOn: `Le trésor caché (12 min)
• Présentation d'une vieille carte au trésor (fabriquée)
• "J'ai trouvé cette carte mystérieuse!"
• Observation collective: Que voyez-vous?
• Discussion: À quoi sert une carte?
• Introduction du vocabulaire: carte, chemin, direction
• Mission: Devenir des explorateurs de cartes!`,

        action: `Découverte des cartes (25 min)

PARTIE 1: Station d'exploration (10 min)
• 4 stations avec différents types de cartes
• Station 1: Carte au trésor (imaginaire)
• Station 2: Plan de l'école
• Station 3: Carte de la ville
• Station 4: Globe terrestre
• Rotation rapide, observation guidée

PARTIE 2: Notre première carte (15 min)
• Création d'une carte simple de la classe
• Vue d'oiseau expliquée avec gestes
• Dessiner: porte, fenêtres, bureaux
• Symboles simples introduits
• Chacun ajoute son pupitre avec une étoile`,

        consolidation: `Réflexion cartographique (8 min)
• Partage des cartes créées
• "Ma carte montre..."
• Comparaison: Toutes différentes mais utiles!
• Chanson: "La carte nous guide" (créée ensemble)
• Annonce: Demain, carte de notre école!`,

        materials: JSON.stringify([
          "Carte au trésor fabriquée",
          "Plan de l'école",
          "Carte de la ville",
          "Globe terrestre",
          "Papier grand format",
          "Crayons de couleur",
          "Autocollants étoiles"
        ]),

        accommodations: JSON.stringify([
          "Support visuel constant",
          "Manipulation du globe permise",
          "Travail en dyade possible",
          "Carte pré-dessinée disponible",
          "Temps supplémentaire si nécessaire"
        ]),

        modifications: JSON.stringify({
          struggling: "Carte très simple, beaucoup de support",
          onLevel: "Carte standard avec éléments essentiels",
          advanced: "Ajout de détails, légende simple"
        }),

        assessmentType: 'Diagnostique et formative',
        assessmentNotes: `Évaluation des connaissances préalables sur les cartes
Observation de la compréhension du concept
Portfolio: Première carte créée`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au concept de carte.
Activité principale: Exploration de cartes et création.
Important: Rendre le concept concret et accessible.
Matériel préparé aux stations.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 2: La carte de notre école
    const lesson2 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La carte de notre école',
        date: new Date('2025-11-04'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer une carte mentale de l'école
• Utiliser des symboles simples pour représenter des lieux
• Comprendre la vue d'en haut (vue aérienne)`,

        mindsOn: `Vol d'oiseau au-dessus de l'école (10 min)
• "Imaginons que nous sommes des oiseaux!"
• Fermer les yeux, survoler l'école
• Description guidée de ce qu'on "voit"
• Ouverture des yeux: Dessiner dans l'air
• Introduction: symboles de carte
• Préparation: Explorer notre école!`,

        action: `Cartographie de l'école (28 min)

PARTIE 1: Exploration terrain (10 min)
• Marche d'observation dans l'école
• Arrêts: bibliothèque, gymnase, bureau, cafétéria
• Photos mentales à chaque arrêt
• Questions: Où est-ce? À côté de quoi?
• Retour en classe avec nos observations

PARTIE 2: Construction de la carte (18 min)
• Grande feuille collective au sol
• Commencer par notre classe (point de départ)
• Ajouter les lieux visités
• Symboles simples: 📚 bibliothèque, ⚽ gymnase
• Corridors tracés ensemble
• Chacun place un lieu sur la carte`,

        consolidation: `Notre école en carte (7 min)
• Contemplation de notre œuvre
• Vérification: Tout est là?
• Jeu rapide: "Montre-moi le chemin vers..."
• Affichage de notre carte
• Fierté: Nous sommes des cartographes!`,

        materials: JSON.stringify([
          "Grande feuille de papier",
          "Marqueurs de couleur",
          "Symboles pré-découpés",
          "Colle",
          "Photos de lieux de l'école",
          "Ruban adhésif pour corridors"
        ]),

        accommodations: JSON.stringify([
          "Accompagnement durant la marche",
          "Symboles préparés pour certains",
          "Travail collaboratif encouragé",
          "Support pour placement spatial",
          "Options tactiles disponibles"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 3-4 lieux principaux",
          onLevel: "Carte complète avec lieux essentiels",
          advanced: "Ajout de détails, distances relatives"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de la représentation spatiale
Capacité à placer des éléments relativement
Participation à la création collective`,

        isSubFriendly: true,
        subNotes: `Focus: Carte de l'école vue d'en haut.
Activité principale: Exploration puis cartographie.
Important: Visite guidée pré-arrangée, sécurité.
Carte collective à compléter.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 3: Les directions sur la carte
    const lesson3 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les directions sur la carte',
        date: new Date('2025-11-05'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre les directions de base (devant, derrière, gauche, droite)
• Utiliser les directions pour naviguer
• Comprendre que les cartes nous orientent`,

        mindsOn: `Le robot directionnel (12 min)
• L'enseignant devient un robot
• Les élèves donnent des directions
• "Avance!" "Tourne à droite!" "Stop!"
• Introduction formelle: gauche, droite, devant, derrière
• Pratique avec mouvements corporels
• Chanson des directions avec gestes`,

        action: `Navigation et orientation (25 min)

PARTIE 1: Parcours dans la classe (10 min)
• Création d'un parcours avec ruban adhésif
• Obstacles simples placés
• Navigation à tour de rôle
• Partenaire donne les directions
• Utilisation du vocabulaire directionnel

PARTIE 2: Directions sur notre carte (15 min)
• Reprise de la carte de l'école
• Ajout d'une rose des vents simple
• Nord = haut de la carte (vers tableau)
• Pratique: "La bibliothèque est au nord"
• Jeu: Placer des figurines selon directions
• Tracer des chemins avec le doigt`,

        consolidation: `Maîtres des directions (8 min)
• Jeu rapide: "Simon dit" version directions
• "Simon dit: un pas vers le nord!"
• Révision des directions apprises
• Certificats "Expert en directions"
• Mission: Observer les directions à la maison`,

        materials: JSON.stringify([
          "Ruban adhésif coloré",
          "Obstacles simples (cônes, cerceaux)",
          "Carte de l'école (de hier)",
          "Rose des vents en carton",
          "Figurines ou jetons",
          "Certificats directions"
        ]),

        accommodations: JSON.stringify([
          "Flèches visuelles pour gauche/droite",
          "Partenaire de soutien",
          "Répétition des directions",
          "Mouvements adaptés selon capacité",
          "Support individuel pour orientation"
        ]),

        modifications: JSON.stringify({
          struggling: "2 directions principales (devant/derrière)",
          onLevel: "4 directions de base",
          advanced: "Introduction de nord/sud/est/ouest"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Maîtrise du vocabulaire directionnel
Capacité à suivre et donner des directions
Application sur la carte`,

        isSubFriendly: true,
        subNotes: `Focus: Apprentissage des directions de base.
Activité principale: Navigation et application sur carte.
Important: Beaucoup de mouvement, espace dégagé.
Vocabulaire directionnel affiché.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 4: Ma chambre en carte
    const lesson4 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Ma chambre en carte',
        date: new Date('2025-11-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer une carte personnelle de leur chambre
• Utiliser des symboles pour représenter des objets
• Appliquer les concepts de carte à leur vie`,

        mindsOn: `Tour de chambre imaginaire (10 min)
• "Fermez les yeux, vous êtes dans votre chambre"
• Questions guidées: Où est votre lit? Vos jouets?
• Partage rapide: Ma chambre a...
• Modélisation: L'enseignant dessine SA chambre
• Observation: Comment représenter un lit?
• Introduction: Légende de carte`,

        action: `Création de ma carte personnelle (28 min)

PARTIE 1: Planification (8 min)
• Feuille de brouillon pour réfléchir
• Liste: Qu'est-ce qu'il y a dans ma chambre?
• Choix de 5-6 éléments importants
• Symboles simples décidés
• Plan mental de l'organisation

PARTIE 2: Dessin de la carte (20 min)
• Papier carte individuel
• Commencer par la forme de la chambre
• Placer la porte et fenêtre(s)
• Ajouter les meubles avec symboles
• Colorier avec soin
• Créer une petite légende
• Décoration personnalisée`,

        consolidation: `Exposition de nos chambres (7 min)
• Musée des chambres improvisé
• Tour rapide des créations
• "Dans ma chambre, j'aime..."
• Observation: Toutes différentes!
• Applaudissements pour tous
• Mission: Montrer la carte à la famille!`,

        materials: JSON.stringify([
          "Papier carte format lettre",
          "Crayons de couleur",
          "Règles simples",
          "Exemples de symboles",
          "Autocollants décoratifs",
          "Feuilles de brouillon"
        ]),

        accommodations: JSON.stringify([
          "Carte pré-tracée option disponible",
          "Nombre d'éléments flexible",
          "Support pour symboles",
          "Aide individuelle disponible",
          "Alternative: espace préféré si pas de chambre"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 éléments, symboles fournis",
          onLevel: "5-6 éléments, création autonome",
          advanced: "Légende détaillée, échelle simple"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Application personnelle des concepts de carte
Créativité et précision dans la représentation
Portfolio: Carte personnelle complétée`,

        isSubFriendly: true,
        subNotes: `Focus: Application personnelle du concept de carte.
Activité principale: Création individuelle de carte de chambre.
Important: Respecter tous les espaces de vie.
Alternative pour élèves sans chambre personnelle.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 1: Qu\'est-ce qu\'une carte?');
    console.log('✅ Created Lesson 2: La carte de notre école');
    console.log('✅ Created Lesson 3: Les directions sur la carte');
    console.log('✅ Created Lesson 4: Ma chambre en carte');

    console.log('\n📊 WEEK 1 SUMMARY');
    console.log('===================');
    console.log('Created 4 perfect lesson plans for Sciences humaines');
    console.log('Unit: Notre monde en cartes');
    console.log('Dates: November 3-6, 2025');
    console.log('\nWeek 1 Focus:');
    console.log('✅ Introduction to map concepts');
    console.log('✅ School mapping activity');
    console.log('✅ Directional vocabulary');
    console.log('✅ Personal application (bedroom map)');
    console.log('\nKey Features:');
    console.log('✅ ETFO three-part structure');
    console.log('✅ Developmental appropriateness for Grade 1');
    console.log('✅ Concrete to abstract progression');
    console.log('✅ Personal connections to mapping');
    console.log('✅ Movement and hands-on activities');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeek1CartesLessons().catch(console.error);