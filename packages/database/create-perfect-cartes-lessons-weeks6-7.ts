import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks6And7CartesLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 6-7');
  console.log('Unit: Notre monde en cartes');
  console.log('Focus: Map Skills Mastery and Performance Task');
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
    console.log('Creating 8 lessons for Weeks 6-7\n');

    // WEEK 6: Advanced Map Skills (December 8-12, 2025)
    
    // Lesson 21: Les distances sur la carte
    const lesson21 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les distances sur la carte',
        date: new Date('2025-12-08'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les cartes montrent les distances
• Apprendre le concept "près" et "loin"
• Mesurer des distances simples sur une carte`,

        mindsOn: `Les pas de géant et de fourmi (10 min)
• Marcher comme un géant (grands pas)
• Marcher comme une fourmi (petits pas)
• Compter les pas d'un mur à l'autre
• Discussion: Même distance, pas différents!
• Introduction: Sur les cartes aussi
• Montrer une règle: Notre outil de mesure`,

        action: `Mesurer notre monde (28 min)

PARTIE 1: Distances dans la classe (13 min)
• Plan de la classe affiché
• Mesurer avec une ficelle:
  - Porte à tableau
  - Mon bureau au tapis
  - Fenêtre à bibliothèque
• Reporter sur le plan
• Comparer: réalité vs carte
• Découverte de l'échelle!

PARTIE 2: Près ou loin? (15 min)
• Carte du quartier simplifiée
• Placer des objets: près/loin de l'école
• Utiliser des jetons de couleur:
  - Vert = très près (5 min à pied)
  - Jaune = moyen (10 min)
  - Rouge = loin (15 min+)
• Créer des cercles de distance`,

        consolidation: `Experts en distance (7 min)
• Jeu: "Plus près ou plus loin?"
• Deux lieux montrés, deviner
• Vérification avec la ficelle
• Badge "Mesureur de distances"
• Mission: Compter les pas jusqu'à la cuisine`,

        materials: JSON.stringify([
          "Plan de la classe",
          "Ficelles de couleur",
          "Règles simples",
          "Carte du quartier",
          "Jetons colorés",
          "Badges mesureur"
        ]),

        accommodations: JSON.stringify([
          "Mesures approximatives acceptées",
          "Support pour manipulation",
          "Concepts simplifiés (près/loin)",
          "Travail en équipe encouragé",
          "Aide pour report sur carte"
        ]),

        modifications: JSON.stringify({
          struggling: "Près/loin seulement, support constant",
          onLevel: "Mesures simples, 3 catégories distance",
          advanced: "Échelle simple, calculs basiques"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de distance
Capacité à estimer près/loin
Application sur carte`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction aux distances sur carte.
Activité principale: Mesures et catégorisation.
Important: Garder les concepts simples et concrets.
Matériel de mesure disponible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 22: Créer un plan d'évacuation
    const lesson22 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Créer un plan d\'évacuation',
        date: new Date('2025-12-09'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance des plans de sécurité
• Créer un plan d'évacuation simple
• Appliquer leurs compétences cartographiques pour la sécurité`,

        mindsOn: `La sécurité d'abord (10 min)
• Son de l'alarme d'incendie (doux)
• "Que faisons-nous quand on l'entend?"
• Rappel de notre procédure
• Introduction: Les cartes nous sauvent!
• Montrer le plan d'évacuation de l'école
• Observer: flèches, sorties, point de rencontre`,

        action: `Plans de sécurité (28 min)

PARTIE 1: Notre plan de classe (15 min)
• Plan de la classe vierge
• Identifier ensemble:
  - Les deux sorties
  - Le meilleur chemin
  - Les obstacles à éviter
• Tracer le chemin en vert
• Ajouter des flèches claires
• Symbole pour point de rencontre

PARTIE 2: Mon plan familial (13 min)
• Plan simple de sa maison (schématique)
• Identifier:
  - Ma chambre
  - Les sorties
  - Où se retrouver dehors
• Dessiner le chemin de sortie
• Décorer avec symboles de sécurité`,

        consolidation: `Héros de la sécurité (7 min)
• Présentation des plans familiaux
• "Si le feu arrive, je..."
• Pratique: marcher le chemin
• Certificat "Expert en sécurité"
• Mission: Montrer à la famille!`,

        materials: JSON.stringify([
          "Plan d'évacuation de l'école",
          "Plans de classe vierges",
          "Plans de maison simplifiés",
          "Marqueurs verts et rouges",
          "Flèches autocollantes",
          "Certificats sécurité"
        ]),

        accommodations: JSON.stringify([
          "Plan de maison pré-dessiné",
          "Support pour identification des sorties",
          "Simplification selon besoin",
          "Aide individuelle disponible",
          "Respect des situations familiales"
        ]),

        modifications: JSON.stringify({
          struggling: "Un chemin simple, beaucoup d'aide",
          onLevel: "Plan complet avec symboles",
          advanced: "Plans alternatifs, détails additionnels"
        }),

        assessmentType: 'Formative et pratique',
        assessmentNotes: `Application pratique des compétences cartographiques
Compréhension de la sécurité
Transfert maison-école`,

        isSubFriendly: true,
        subNotes: `Focus: Plans d'évacuation et sécurité.
Activité principale: Création de plans de sécurité.
Important: Message positif, pas d'anxiété.
Lien avec exercices d'évacuation.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 23: Les cartes du futur
    const lesson23 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les cartes du futur',
        date: new Date('2025-12-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Imaginer comment les cartes pourraient changer
• Créer une carte imaginaire du futur
• Utiliser leur créativité avec leurs compétences`,

        mindsOn: `Voyage dans le temps (12 min)
• "Machine à voyager dans le temps!"
• Images: cartes anciennes vs modernes
• "Comment seront les cartes dans 100 ans?"
• Brainstorm fou: hologrammes, 3D, volantes!
• Introduction: Créons la carte du futur!
• Imagination sans limites!`,

        action: `Cartographes du futur (25 min)

PARTIE 1: Notre quartier en 2125 (15 min)
• Carte du quartier comme base
• Ajouter des éléments futuristes:
  - Pistes pour voitures volantes
  - Téléporteurs
  - Parcs sur les toits
  - École flottante
• Nouveaux symboles inventés
• Couleurs brillantes et métalliques

PARTIE 2: Ma carte impossible (10 min)
• Création totalement libre
• Exemples: Carte de l'intérieur d'un arc-en-ciel
• Carte du pays des bonbons
• Carte de mes rêves
• Liberté créative totale`,

        consolidation: `Exposition futuriste (8 min)
• Musée du futur improvisé
• Présentation avec effets sonores
• "Dans le futur, ma carte..."
• Vote: Carte la plus créative
• Photo "Voyageurs du temps"
• Célébration de l'imagination!`,

        materials: JSON.stringify([
          "Images de cartes historiques",
          "Papier métallisé/brillant",
          "Marqueurs fluorescents",
          "Paillettes et autocollants",
          "Matériel de science-fiction",
          "Musique futuriste"
        ]),

        accommodations: JSON.stringify([
          "Liberté créative totale",
          "Pas de mauvaises idées",
          "Support pour l'imagination",
          "Participation flexible",
          "Célébration de toutes les créations"
        ]),

        modifications: JSON.stringify({
          struggling: "Quelques éléments futuristes simples",
          onLevel: "Carte futuriste complète",
          advanced: "Systèmes complexes, explications détaillées"
        }),

        assessmentType: 'Créative et formative',
        assessmentNotes: `Créativité et imagination
Application ludique des concepts
Expression personnelle`,

        isSubFriendly: true,
        subNotes: `Focus: Imagination et cartes du futur.
Activité principale: Création libre et futuriste.
Important: Aucune limite à l'imagination.
Ambiance ludique et créative.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 24: Préparation de notre atlas
    const lesson24 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Préparation de notre atlas',
        date: new Date('2025-12-12'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est un atlas
• Organiser leurs cartes en collection
• Préparer la présentation finale`,

        mindsOn: `Qu'est-ce qu'un atlas? (10 min)
• Présentation d'un vrai atlas
• "Un livre rempli de cartes!"
• Feuilleter ensemble, émerveillement
• Notre mission: Créer NOTRE atlas!
• Inventaire de nos cartes créées
• Organisation nécessaire!`,

        action: `Construction de l'atlas (30 min)

PARTIE 1: Sélection et organisation (10 min)
• Révision de toutes nos cartes
• Choix de 8-10 meilleures
• Ordre logique décidé:
  - Ma chambre → École → Quartier
  - Ville → Province → Pays → Monde
• Numérotation des pages

PARTIE 2: Finition de l'atlas (20 min)
• Page de couverture créée
• Titre: "Atlas de [Prénom]"
• Table des matières simple
• Décoration de chaque page
• Ajout de commentaires: "J'aime cette carte parce que..."
• Reliure simple (agrafage/collage)`,

        consolidation: `Auteurs d'atlas (5 min)
• Signature officielle de l'atlas
• Photo avec son œuvre
• Échange pour admiration mutuelle
• Fierté immense
• Annonce: Grande exposition lundi!`,

        materials: JSON.stringify([
          "Atlas réel pour exemple",
          "Toutes les cartes créées",
          "Papier de couverture",
          "Matériel de reliure",
          "Matériel de décoration",
          "Étiquettes numérotées"
        ]),

        accommodations: JSON.stringify([
          "Nombre de cartes flexible",
          "Aide pour organisation",
          "Support pour reliure",
          "Créativité encouragée",
          "Respect du rythme individuel"
        ]),

        modifications: JSON.stringify({
          struggling: "5-6 cartes, organisation simple",
          onLevel: "8-10 cartes, atlas complet",
          advanced: "Index, légendes détaillées"
        }),

        assessmentType: 'Portfolio sommatif',
        assessmentNotes: `Compilation des apprentissages
Organisation et présentation
Réflexion sur le parcours`,

        isSubFriendly: true,
        subNotes: `Focus: Création d'un atlas personnel.
Activité principale: Organisation et reliure des cartes.
Important: Chaque atlas est unique et précieux.
Matériel de reliure prêt.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 7: Performance Task - Map Exhibition (December 15-19, 2025)

    // Lesson 25: Pratique des présentations
    const lesson25 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Pratique des présentations',
        date: new Date('2025-12-15'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Pratiquer la présentation de leurs cartes
• Développer la confiance pour parler
• Apprendre à être un bon public`,

        mindsOn: `Présentateurs professionnels (10 min)
• Modélisation par l'enseignant
• "Voici ma carte préférée..."
• Voix claire, pointer, sourire
• Introduction du "bâton de parole"
• Règles du bon présentateur
• Règles du bon public`,

        action: `Répétition générale (30 min)

PARTIE 1: Pratique en petits groupes (15 min)
• Groupes de 4 élèves
• Chacun présente 2 cartes
• 2 minutes par présentation
• Questions douces des amis
• Encouragements constants

PARTIE 2: Présentations vedettes (15 min)
• Volontaires devant la classe
• Présentation d'une carte spéciale
• Applaudissements chaleureux
• Feedback positif seulement
• Modélisation de l'excellence`,

        consolidation: `Confiance renforcée (5 min)
• Cercle de confiance
• "Je suis fier de..."
• Poignées de main professionnelles
• Badge "Présentateur expert"
• Prêts pour l'exposition!`,

        materials: JSON.stringify([
          "Bâton de parole",
          "Atlas personnels",
          "Microphone jouet",
          "Badges présentateur",
          "Podium improvisé",
          "Minuterie visuelle"
        ]),

        accommodations: JSON.stringify([
          "Présentation avec ami si besoin",
          "Nombre de cartes flexible",
          "Support visuel accepté",
          "Temps adapté",
          "Alternative non-verbale possible"
        ]),

        modifications: JSON.stringify({
          struggling: "Une carte, beaucoup de support",
          onLevel: "2 cartes, présentation standard",
          advanced: "Présentation élaborée, questions"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Développement des compétences orales
Confiance en présentation
Préparation à l'exposition`,

        isSubFriendly: true,
        subNotes: `Focus: Pratique des présentations orales.
Activité principale: Répétitions en groupes.
Important: Environnement très supportif.
Encouragement constant.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 26: Installation de l'exposition
    const lesson26 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Installation de l\'exposition',
        date: new Date('2025-12-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Organiser l'espace d'exposition
• Préparer l'accueil des visiteurs
• Finaliser tous les détails`,

        mindsOn: `Transformation en musée (10 min)
• "Notre classe devient un musée!"
• Visite d'exemples (photos de musées)
• Planification collective de l'espace
• Attribution des zones
• Création de l'ambiance
• Excitement maximum!`,

        action: `Mise en place professionnelle (30 min)

PARTIE 1: Installation des œuvres (15 min)
• Zones thématiques créées:
  - Cartes locales
  - Cartes du monde
  - Cartes créatives
  - Méga-carte collaborative
• Étiquettes pour chaque œuvre
• Disposition soignée

PARTIE 2: Préparation de l'accueil (15 min)
• Station d'accueil décorée
• Livre d'or préparé
• Programmes créés (simple)
• Parcours fléché
• Musique d'ambiance testée
• Derniers ajustements`,

        consolidation: `Prêts pour le grand jour (5 min)
• Tour final d'inspection
• Ajustements de dernière minute
• Photo "avant l'ouverture"
• Cri de ralliement
• Fierté anticipée!`,

        materials: JSON.stringify([
          "Toutes les cartes et atlas",
          "Étiquettes et panneaux",
          "Décorations thématiques",
          "Livre d'or",
          "Programmes photocopiés",
          "Flèches directionnelles"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés dans l'installation",
          "Tâches selon capacités",
          "Support disponible",
          "Flexibilité dans participation",
          "Respect des besoins individuels"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâches simples d'installation",
          onLevel: "Participation complète à l'installation",
          advanced: "Coordination de zones, leadership"
        }),

        assessmentType: 'Pratique',
        assessmentNotes: `Organisation et collaboration
Préparation minutieuse
Anticipation positive`,

        isSubFriendly: true,
        subNotes: `Focus: Installation complète de l'exposition.
Activité principale: Transformation de la classe.
Important: Tous contribuent selon capacités.
Vérifier la disposition finale.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 27: GRANDE EXPOSITION CARTOGRAPHIQUE
    const lesson27 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'GRANDE EXPOSITION CARTOGRAPHIQUE',
        date: new Date('2025-12-18'),
        duration: 60, // Extended for the event
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Présenter leurs apprentissages cartographiques
• Guider les visiteurs dans l'exposition
• Célébrer 7 semaines d'exploration`,

        mindsOn: `Ouverture officielle (10 min)
• Rassemblement des cartographes
• Dernières vérifications
• Distribution des rôles:
  - Guides
  - Présentateurs
  - Accueil
• Photos officielles
• Ouverture des portes!`,

        action: `L'EXPOSITION EN ACTION! (45 min)

PARTIE 1: Accueil des familles (10 min)
• "Bienvenue à notre musée de cartes!"
• Distribution des programmes
• Explication du parcours
• Invitations à signer le livre d'or

PARTIE 2: Visites guidées (25 min)
• Rotation des guides
• Présentations aux stations:
  - "Voici comment nous avons appris..."
  - "Cette carte montre..."
  - "Nous avons découvert que..."
• Atlas personnels feuilletés
• Questions des visiteurs

PARTIE 3: Activité interactive (10 min)
• Création d'une carte collaborative avec les familles
• Chaque famille ajoute quelque chose
• Célébration collective`,

        consolidation: `Clôture triomphale (5 min)
• Rassemblement final
• Remerciements aux familles
• Chanson des cartographes
• Remise de diplômes "Cartographe certifié"
• Photo de groupe avec visiteurs
• Mission accomplie!`,

        materials: JSON.stringify([
          "Exposition complète installée",
          "Programmes et livre d'or",
          "Diplômes cartographes",
          "Matériel pour carte collaborative",
          "Appareil photo",
          "Rafraîchissements simples"
        ]),

        accommodations: JSON.stringify([
          "Rôles adaptés aux capacités",
          "Support constant disponible",
          "Pauses possibles",
          "Flexibilité totale",
          "Célébration de toutes les contributions"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple, beaucoup de support",
          onLevel: "Participation complète standard",
          advanced: "Rôles de leadership, aide aux autres"
        }),

        assessmentType: 'Performance authentique',
        assessmentNotes: `Démonstration complète des apprentissages
Communication avec public réel
Culmination de l'unité`,

        isSubFriendly: false,
        subNotes: `ÉVÉNEMENT SPÉCIAL - Enseignant titulaire requis
Exposition finale avec familles
Point culminant de 7 semaines
Support administratif souhaitable`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 28: Réflexion et célébration
    const lesson28 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Réflexion et célébration',
        date: new Date('2025-12-19'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Réfléchir sur leurs apprentissages
• Célébrer leurs accomplissements
• Faire des connexions avec le futur`,

        mindsOn: `Retour sur notre voyage (12 min)
• Photos de nos 7 semaines projetées
• "Vous souvenez-vous quand...?"
• Rappel: De zéro à experts!
• Partage des moments préférés
• Fierté collective générée`,

        action: `Célébration finale (25 min)

PARTIE 1: Livre de souvenirs (10 min)
• Page individuelle créée:
  - Ma carte préférée
  - Ce que j'ai appris
  - Mon meilleur souvenir
• Dessins et mots
• Compilation en livre de classe

PARTIE 2: Fête des cartographes (15 min)
• Jeux de cartes inventés
• Chasse au trésor finale
• Danse des continents
• Collation spéciale
• Remise des atlas personnels à garder`,

        consolidation: `Au revoir, cartographes! (8 min)
• Cercle final
• Chacun dit: "Je suis fier de..."
• Certificats finaux remis
• Atlas personnels emportés
• Photo finale du groupe
• Applaudissements nourris!
• "Vous êtes maintenant des experts!"`,

        materials: JSON.stringify([
          "Photos des 7 semaines",
          "Matériel pour livre de souvenirs",
          "Atlas personnels reliés",
          "Certificats finaux",
          "Jeux et activités",
          "Collation de célébration"
        ]),

        accommodations: JSON.stringify([
          "Réflexion adaptée aux capacités",
          "Expression variée acceptée",
          "Participation flexible",
          "Célébration inclusive",
          "Respect de tous les parcours"
        ]),

        modifications: JSON.stringify({
          struggling: "Réflexion simple, support disponible",
          onLevel: "Réflexion complète autonome",
          advanced: "Réflexion approfondie, connexions futures"
        }),

        assessmentType: 'Réflexive et célébrative',
        assessmentNotes: `Auto-évaluation des apprentissages
Métacognition développée
Portfolio final complété`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration et clôture de l'unité.
Activité principale: Réflexion et fête.
Important: Ambiance festive et valorisante.
Atlas remis aux élèves.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 21: Les distances sur la carte');
    console.log('✅ Created Lesson 22: Créer un plan d\'évacuation');
    console.log('✅ Created Lesson 23: Les cartes du futur');
    console.log('✅ Created Lesson 24: Préparation de notre atlas');
    console.log('✅ Created Lesson 25: Pratique des présentations');
    console.log('✅ Created Lesson 26: Installation de l\'exposition');
    console.log('✅ Created Lesson 27: GRANDE EXPOSITION CARTOGRAPHIQUE');
    console.log('✅ Created Lesson 28: Réflexion et célébration');

    console.log('\n📊 WEEKS 6-7 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Notre monde en cartes');
    console.log('Dates: December 8-19, 2025');
    console.log('\nWeek 6 Focus:');
    console.log('✅ Distance concepts');
    console.log('✅ Safety planning with maps');
    console.log('✅ Future imagination');
    console.log('✅ Atlas creation');
    console.log('\nWeek 7 Focus:');
    console.log('✅ Presentation practice');
    console.log('✅ Exhibition setup');
    console.log('✅ GRAND CARTOGRAPHIC EXHIBITION');
    console.log('✅ Reflection and celebration');
    console.log('\nKey Features:');
    console.log('✅ Advanced skill application');
    console.log('✅ Creative expression');
    console.log('✅ Authentic performance task');
    console.log('✅ Family engagement');
    console.log('✅ Complete portfolio creation');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks6And7CartesLessons().catch(console.error);