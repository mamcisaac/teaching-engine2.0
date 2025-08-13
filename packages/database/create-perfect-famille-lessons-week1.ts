import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PERFECT LESSON PLANS - Week 1: Ma famille et ma communauté
 * Grade 1 French Immersion - Sciences humaines
 * 
 * These lesson plans are created through intelligent pedagogical design,
 * following ETFO best practices and developmental appropriateness for 6-year-olds.
 * Each lesson uses the three-part structure and integrates assessment naturally.
 */

async function createWeek1LessonPlans() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEK 1');
  console.log('Unit: Ma famille et ma communauté');
  console.log('=========================================\n');

  // Get the unit plan
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
    console.log('❌ Unit plan not found');
    return;
  }

  console.log(`Found unit: ${unitPlan.title}`);
  console.log(`Creating 4 lessons for Week 1\n`);

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  // Clear existing Week 1 lessons for this unit
  const week1Start = new Date('2025-09-02');
  const week1End = new Date('2025-09-05');
  
  await prisma.eTFOLessonPlan.deleteMany({
    where: {
      unitPlanId: unitPlan.id,
      date: {
        gte: week1Start,
        lte: week1End
      }
    }
  });

  // LESSON 1: Bienvenue à notre communauté de classe
  const lesson1 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Bienvenue à notre communauté de classe',
      titleFr: 'Bienvenue à notre communauté de classe',
      date: new Date('2025-09-02'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Comprendre que notre classe est une communauté
• Identifier les membres de notre communauté de classe
• Reconnaître que chaque personne est unique et importante
• Commencer à développer un sentiment d'appartenance`,
      
      learningGoalsFr: `Les élèves vont:
• Comprendre que notre classe est une communauté
• Identifier les membres de notre communauté de classe
• Reconnaître que chaque personne est unique et importante
• Commencer à développer un sentiment d'appartenance`,
      
      // MINDS ON (15 minutes)
      mindsOn: `Cercle de bienvenue (15 min):
1. Rassemblement en cercle sur le tapis
2. Chanson de bienvenue: "Bonjour mes amis, comment allez-vous?"
3. Jeu de présentation avec balle molle:
   - Dire son nom + une chose qu'on aime
   - Passer la balle doucement à un ami
4. Introduction du mot "communauté" avec gestes
   - "Nous sommes une communauté" (geste de cercle)
   - "Nous sommes ensemble" (mains jointes)`,
      
      mindsOnFr: `Cercle de bienvenue (15 min):
1. Rassemblement en cercle sur le tapis
2. Chanson de bienvenue: "Bonjour mes amis, comment allez-vous?"
3. Jeu de présentation avec balle molle:
   - Dire son nom + une chose qu'on aime
   - Passer la balle doucement à un ami
4. Introduction du mot "communauté" avec gestes
   - "Nous sommes une communauté" (geste de cercle)
   - "Nous sommes ensemble" (mains jointes)`,
      
      // ACTION (25 minutes)
      action: `Création de notre arbre de communauté (25 min):

PARTIE 1: Discussion guidée (10 min)
• Qu'est-ce qu'une communauté? (personnes ensemble, s'entraider, partager)
• Montrer des images de différentes communautés
• Notre classe est une communauté spéciale

PARTIE 2: Activité créative (15 min)
• Grand arbre dessiné sur papier chart
• Chaque enfant:
  - Trace sa main sur papier de couleur
  - Découpe avec aide (motricité fine)
  - Dessine ou colle sa photo au centre
  - Ajoute son nom (avec modèle)
• Coller les mains comme feuilles de l'arbre

Différenciation:
- Soutien: Mains pré-tracées, aide au découpage
- Avancé: Écrire un mot sur ce qu'ils aiment
- Choix: Couleur de papier, décoration`,
      
      actionFr: `Création de notre arbre de communauté (25 min):

PARTIE 1: Discussion guidée (10 min)
• Qu'est-ce qu'une communauté? (personnes ensemble, s'entraider, partager)
• Montrer des images de différentes communautés
• Notre classe est une communauté spéciale

PARTIE 2: Activité créative (15 min)
• Grand arbre dessiné sur papier chart
• Chaque enfant:
  - Trace sa main sur papier de couleur
  - Découpe avec aide (motricité fine)
  - Dessine ou colle sa photo au centre
  - Ajoute son nom (avec modèle)
• Coller les mains comme feuilles de l'arbre

Différenciation:
- Soutien: Mains pré-tracées, aide au découpage
- Avancé: Écrire un mot sur ce qu'ils aiment
- Choix: Couleur de papier, décoration`,
      
      // CONSOLIDATION (5 minutes)
      consolidation: `Célébration de notre communauté (5 min):
• Admirer notre arbre ensemble
• Compter les mains (intégration math)
• Chanter: "Nous sommes une communauté, tous ensemble, tous amis!"
• Chaque enfant touche une main et dit "Bonjour [nom]"
• Placer l'arbre dans un endroit spécial de la classe
• Annonce: "Demain, nous parlerons de nos familles!"`,
      
      consolidationFr: `Célébration de notre communauté (5 min):
• Admirer notre arbre ensemble
• Compter les mains (intégration math)
• Chanter: "Nous sommes une communauté, tous ensemble, tous amis!"
• Chaque enfant touche une main et dit "Bonjour [nom]"
• Placer l'arbre dans un endroit spécial de la classe
• Annonce: "Demain, nous parlerons de nos familles!"`,
      
      materials: {
        required: [
          'Balle molle pour jeu',
          'Grand papier chart avec arbre dessiné',
          'Papier construction (couleurs variées)',
          'Ciseaux adaptés',
          'Colle en bâton',
          'Crayons/marqueurs',
          'Photos des élèves (optionnel)',
          'Images de communautés'
        ],
        optional: [
          'Autocollants pour décoration',
          'Paillettes',
          'Appareil photo pour documentation'
        ]
      },
      
      accommodations: {
        physical: 'Ciseaux adaptés, table ajustable, position flexible',
        cognitive: 'Instructions visuelles, répétition, jumelage avec pair',
        language: 'Vocabulaire visuel, gestes, mots-clés en anglais si nécessaire',
        social: 'Participation graduelle, rôle observateur accepté initialement'
      },
      
      modifications: {
        forIEP: 'Objectifs simplifiés: reconnaître 3 amis, participer à une activité de groupe',
        alternativeActivities: 'Dessin individuel de la classe au lieu du découpage'
      },
      
      extensions: {
        earlyFinishers: 'Dessiner d\'autres membres de la communauté scolaire (directeur, concierge)',
        advancedLearners: 'Créer une phrase: "Dans notre communauté, nous..."',
        homeConnection: 'Dessiner sa famille à la maison pour partager demain'
      },
      
      assessmentType: 'Observation formative',
      
      assessmentNotes: `Observer et noter:
• Participation au cercle de bienvenue
• Capacité à dire son nom et une préférence
• Engagement dans l'activité de l'arbre
• Utilisation du vocabulaire: communauté, ensemble, ami
• Interaction avec les pairs
• Motricité fine lors du découpage`,
      
      differentiationStrategies: {
        forStruggling: 'Support visuel constant, jumelage, mains pré-tracées, répétition du vocabulaire',
        forAdvanced: 'Écriture de mots, aide aux autres, questions de réflexion supplémentaires',
        byInterest: 'Choix de couleurs, style de décoration, partage optionnel',
        byLearningProfile: 'Visuel: images et démonstrations; Kinesthésique: mouvement et manipulation; Auditif: chansons et répétition'
      },
      
      engagementHooks: {
        opening: 'Chanson accueillante avec mouvements',
        duringLesson: 'Création personnelle, photos, mouvement',
        closing: 'Célébration collective de l\'arbre'
      },
      
      formativeCheckpoints: {
        understanding: 'Pouce en l\'air/bas pour vérifier la compréhension',
        participation: 'Observation de l\'engagement',
        vocabulary: 'Écoute de l\'utilisation des mots-clés'
      },
      
      interventionStrategies: {
        tier1: 'Support universel: visuels, modélisation, répétition',
        tier2: 'Petit groupe de soutien pour le vocabulaire',
        tier3: 'Support individuel pour la participation'
      },
      
      performanceOpportunities: 'Présentation de sa main, participation au chant, interaction avec l\'arbre',
      
      priorKnowledgeCheck: 'Discussion: Qui est dans notre classe? Comment s\'appelle notre école?',
      
      reflectionActivities: {
        student: 'Toucher l\'arbre et dire un nom d\'ami',
        teacher: 'Noter les niveaux de participation et de confort'
      },
      
      wheretoFramework: {
        W: 'Nous créons notre communauté de classe',
        H: 'Jeu avec balle, chanson, création personnelle',
        E: 'Discussion, création, célébration',
        R: 'Regarder l\'arbre ensemble, compter, nommer',
        E2: 'Observer la participation et l\'utilisation du vocabulaire',
        T: 'Différents niveaux de support selon les besoins',
        O: 'Cercle → Discussion → Création → Célébration'
      },
      
      grouping: 'Cercle entier → Travail individuel avec support → Cercle entier',
      
      isSubFriendly: true,
      
      subNotes: `Leçon d'introduction à l'unité sur la famille et la communauté.
Focus: Créer un sentiment d'appartenance à la classe.
Activité principale: Arbre de communauté avec empreintes de mains.
Important: Ambiance chaleureuse et accueillante, tous les enfants participent à leur niveau.`,
      
      expectations: {
        create: unitPlan.expectations.slice(0, 1).map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 1: ${lesson1.title}`);

  // LESSON 2: Ma famille unique
  const lesson2 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Ma famille unique et spéciale',
      titleFr: 'Ma famille unique et spéciale',
      date: new Date('2025-09-03'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Reconnaître que chaque famille est unique
• Identifier les membres de leur propre famille
• Utiliser le vocabulaire de la famille en français
• Apprécier la diversité des structures familiales`,
      
      learningGoalsFr: `Les élèves vont:
• Reconnaître que chaque famille est unique
• Identifier les membres de leur propre famille
• Utiliser le vocabulaire de la famille en français
• Apprécier la diversité des structures familiales`,
      
      // MINDS ON (10 minutes)
      mindsOn: `Cercle de partage familial (10 min):
1. Révision: "Nous sommes une communauté de classe"
2. Livre: "Les familles" (montrer différents types de familles)
3. Question: "Qui est dans ta famille?"
4. Partage en cercle avec peluche parlante:
   - Chaque enfant nomme UN membre de sa famille
   - Utiliser les gestes pour maman, papa, frère, sœur, etc.
5. Observation: "Toutes les familles sont différentes et spéciales!"`,
      
      mindsOnFr: `Cercle de partage familial (10 min):
1. Révision: "Nous sommes une communauté de classe"
2. Livre: "Les familles" (montrer différents types de familles)
3. Question: "Qui est dans ta famille?"
4. Partage en cercle avec peluche parlante:
   - Chaque enfant nomme UN membre de sa famille
   - Utiliser les gestes pour maman, papa, frère, sœur, etc.
5. Observation: "Toutes les familles sont différentes et spéciales!"`,
      
      // ACTION (25 minutes)
      action: `Portrait de ma famille (25 min):

PARTIE 1: Vocabulaire actif (8 min)
• Afficher images de membres de famille
• Enseigner/réviser: maman, papa, frère, sœur, bébé, grand-maman, grand-papa
• Chanson avec gestes: "Ma famille" 
• Jeu: "Montre-moi..." (pointer les images)

PARTIE 2: Création artistique (17 min)
• Chaque enfant dessine sa famille
• Matériel varié disponible:
  - Crayons de cire (plus faciles)
  - Crayons de couleur
  - Papier avec cadre pré-dessiné
• Circuler et encourager:
  - "Qui est-ce?"
  - "Quelle belle famille!"
  - Aider à nommer en français

Différenciation:
- Soutien: Formes simples pour représenter les personnes
- Avancé: Ajouter des détails, écrire des noms
- Choix: Style de dessin, couleurs`,
      
      actionFr: `Portrait de ma famille (25 min):

PARTIE 1: Vocabulaire actif (8 min)
• Afficher images de membres de famille
• Enseigner/réviser: maman, papa, frère, sœur, bébé, grand-maman, grand-papa
• Chanson avec gestes: "Ma famille" 
• Jeu: "Montre-moi..." (pointer les images)

PARTIE 2: Création artistique (17 min)
• Chaque enfant dessine sa famille
• Matériel varié disponible:
  - Crayons de cire (plus faciles)
  - Crayons de couleur
  - Papier avec cadre pré-dessiné
• Circuler et encourager:
  - "Qui est-ce?"
  - "Quelle belle famille!"
  - Aider à nommer en français

Différenciation:
- Soutien: Formes simples pour représenter les personnes
- Avancé: Ajouter des détails, écrire des noms
- Choix: Style de dessin, couleurs`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Galerie des familles (10 min):
• Afficher tous les dessins sur le tableau
• Marche de galerie: observer les familles
• Observations guidées:
  - "Je vois des familles grandes et petites"
  - "Certaines ont des animaux"
  - "Toutes les familles sont belles"
• Chaque enfant montre son dessin (optionnel)
• Célébration: "Bravo pour nos belles familles!"
• Lien: Ces dessins iront dans notre portfolio familial`,
      
      consolidationFr: `Galerie des familles (10 min):
• Afficher tous les dessins sur le tableau
• Marche de galerie: observer les familles
• Observations guidées:
  - "Je vois des familles grandes et petites"
  - "Certaines ont des animaux"
  - "Toutes les familles sont belles"
• Chaque enfant montre son dessin (optionnel)
• Célébration: "Bravo pour nos belles familles!"
• Lien: Ces dessins iront dans notre portfolio familial`,
      
      materials: {
        required: [
          'Livre sur les familles diverses',
          'Peluche parlante',
          'Images de vocabulaire familial',
          'Papier à dessin avec cadre',
          'Crayons de cire',
          'Crayons de couleur',
          'Ruban adhésif pour affichage'
        ],
        optional: [
          'Photos de familles diverses',
          'Marqueurs',
          'Autocollants'
        ]
      },
      
      accommodations: {
        physical: 'Support pour tenir les crayons, surface inclinée',
        cognitive: 'Modèles de personnes simples, étapes décomposées',
        language: 'Vocabulaire visuel affiché, répétition, gestes',
        social: 'Partage optionnel, participation flexible'
      },
      
      modifications: {
        forIEP: 'Objectif: identifier 2-3 membres de famille, participation au dessin',
        alternativeActivities: 'Coller des photos au lieu de dessiner'
      },
      
      extensions: {
        earlyFinishers: 'Ajouter la maison de la famille, dessiner les animaux',
        advancedLearners: 'Écrire "Ma famille" ou les noms',
        homeConnection: 'Apporter une photo de famille demain'
      },
      
      assessmentType: 'Observation et production',
      
      assessmentNotes: `Observer et documenter:
• Utilisation du vocabulaire familial
• Représentation de la famille dans le dessin
• Participation aux discussions
• Respect de la diversité des familles
• Développement du langage oral
• Motricité fine dans le dessin`,
      
      differentiationStrategies: {
        forStruggling: 'Modèles visuels, formes simples, vocabulaire de base (2-3 mots)',
        forAdvanced: 'Détails dans les dessins, vocabulaire étendu, aide aux pairs',
        byInterest: 'Choix de matériel artistique, niveau de détail',
        byLearningProfile: 'Visuel: images et modèles; Kinesthésique: gestes pour vocabulaire; Auditif: chanson et répétition'
      },
      
      engagementHooks: {
        opening: 'Livre coloré sur les familles',
        duringLesson: 'Dessin personnel, chanson avec mouvements',
        closing: 'Galerie d\'art des familles'
      },
      
      formativeCheckpoints: {
        vocabulary: 'Jeu "Montre-moi" pour vérifier la compréhension',
        understanding: 'Questions pendant le dessin',
        appreciation: 'Observations pendant la galerie'
      },
      
      interventionStrategies: {
        tier1: 'Visuels et gestes pour tous',
        tier2: 'Pratique supplémentaire du vocabulaire en petit groupe',
        tier3: 'Support individuel pour le dessin et le vocabulaire'
      },
      
      performanceOpportunities: 'Présenter son dessin, utiliser le vocabulaire, participer à la chanson',
      
      priorKnowledgeCheck: 'Révision: Qu\'est-ce qu\'une communauté? Qui fait partie de notre communauté de classe?',
      
      reflectionActivities: {
        student: 'Dire une chose spéciale sur sa famille',
        teacher: 'Noter l\'utilisation du vocabulaire et l\'engagement'
      },
      
      wheretoFramework: {
        W: 'Nous explorons nos familles uniques',
        H: 'Livre engageant, dessin personnel',
        E: 'Vocabulaire, création, partage',
        R: 'Galerie pour voir la diversité',
        E2: 'Observation du vocabulaire et de l\'appréciation',
        T: 'Différents niveaux de complexité dans le dessin',
        O: 'Partage → Vocabulaire → Création → Célébration'
      },
      
      grouping: 'Cercle entier → Travail individuel → Groupe entier pour galerie',
      
      isSubFriendly: true,
      
      subNotes: `Focus: Les familles sont toutes différentes et spéciales.
Activité principale: Dessin de sa famille après vocabulaire.
Important: Respecter toutes les structures familiales.
Matériel de dessin préparé, images de vocabulaire affichées.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 2: ${lesson2.title}`);

  // LESSON 3: Les rôles dans ma famille
  const lesson3 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Les rôles dans ma famille',
      titleFr: 'Les rôles dans ma famille',
      date: new Date('2025-09-04'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Identifier comment les membres de la famille s'entraident
• Reconnaître leur propre rôle dans la famille
• Comprendre que chacun contribue à sa façon
• Développer l'appréciation pour l'entraide familiale`,
      
      learningGoalsFr: `Les élèves vont:
• Identifier comment les membres de la famille s'entraident
• Reconnaître leur propre rôle dans la famille
• Comprendre que chacun contribue à sa façon
• Développer l'appréciation pour l'entraide familiale`,
      
      // MINDS ON (12 minutes)
      mindsOn: `Histoire et discussion (12 min):
1. Rappel avec photos/dessins d'hier
2. Histoire: "Petit Ours aide sa famille" (livre ou histoire inventée)
   - Petit Ours met la table
   - Petit Ours range ses jouets
   - Petit Ours console sa sœur
3. Discussion avec marionnette:
   - "Comment Petit Ours aide sa famille?"
   - "Comment aidez-vous à la maison?"
4. Mouvements: mimer les actions d'aide
   - Mettre la table (gestes)
   - Ranger (gestes)
   - Faire un câlin (gestes)`,
      
      mindsOnFr: `Histoire et discussion (12 min):
1. Rappel avec photos/dessins d'hier
2. Histoire: "Petit Ours aide sa famille" (livre ou histoire inventée)
   - Petit Ours met la table
   - Petit Ours range ses jouets
   - Petit Ours console sa sœur
3. Discussion avec marionnette:
   - "Comment Petit Ours aide sa famille?"
   - "Comment aidez-vous à la maison?"
4. Mouvements: mimer les actions d'aide
   - Mettre la table (gestes)
   - Ranger (gestes)
   - Faire un câlin (gestes)`,
      
      // ACTION (23 minutes)
      action: `Livre "J'aide ma famille" (23 min):

PARTIE 1: Exploration en stations (15 min)
4 stations de jeu dramatique (rotation aux 5 min):
• Station cuisine: mettre la table (assiettes en plastique)
• Station rangement: trier les jouets par couleur
• Station soin: prendre soin des poupées/peluches
• Station jardin: "arroser" les plantes (vaporisateurs vides)

Adulte circule et encourage le vocabulaire:
"Tu aides comme à la maison!"
"Bravo, tu prends soin de..."

PARTIE 2: Création du livre personnel (8 min)
• Livre à 4 pages pré-pliées
• Page 1: "J'aide ma famille"
• Pages 2-4: Dessiner/coller images de comment on aide
• Choix d'images pré-découpées ou dessin
• Adulte aide à écrire les mots

Différenciation:
- Soutien: Images à coller, aide pour tenir le crayon
- Avancé: Écrire des mots, plus de détails
- Choix: Méthode de création (dessin vs collage)`,
      
      actionFr: `Livre "J'aide ma famille" (23 min):

PARTIE 1: Exploration en stations (15 min)
4 stations de jeu dramatique (rotation aux 5 min):
• Station cuisine: mettre la table (assiettes en plastique)
• Station rangement: trier les jouets par couleur
• Station soin: prendre soin des poupées/peluches
• Station jardin: "arroser" les plantes (vaporisateurs vides)

Adulte circule et encourage le vocabulaire:
"Tu aides comme à la maison!"
"Bravo, tu prends soin de..."

PARTIE 2: Création du livre personnel (8 min)
• Livre à 4 pages pré-pliées
• Page 1: "J'aide ma famille"
• Pages 2-4: Dessiner/coller images de comment on aide
• Choix d'images pré-découpées ou dessin
• Adulte aide à écrire les mots

Différenciation:
- Soutien: Images à coller, aide pour tenir le crayon
- Avancé: Écrire des mots, plus de détails
- Choix: Méthode de création (dessin vs collage)`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Cercle de fierté (10 min):
• Retour au cercle avec les livres
• Chaque enfant montre UNE page (choix)
• Groupe répond: "Bravo [nom]! Tu aides!"
• Chanson finale avec gestes:
  "Je peux aider, je peux aider,
   À la maison, je peux aider,
   Ranger, partager, consoler,
   Ma famille, j'aime aider!"
• Livres placés dans le portfolio familial
• Connexion: "Ce soir, aidez à la maison et racontez-nous demain!"`,
      
      consolidationFr: `Cercle de fierté (10 min):
• Retour au cercle avec les livres
• Chaque enfant montre UNE page (choix)
• Groupe répond: "Bravo [nom]! Tu aides!"
• Chanson finale avec gestes:
  "Je peux aider, je peux aider,
   À la maison, je peux aider,
   Ranger, partager, consoler,
   Ma famille, j'aime aider!"
• Livres placés dans le portfolio familial
• Connexion: "Ce soir, aidez à la maison et racontez-nous demain!"`,
      
      materials: {
        required: [
          'Livre/histoire de Petit Ours',
          'Marionnette ours',
          'Matériel pour stations:',
          '- Assiettes/ustensiles en plastique',
          '- Jouets à trier',
          '- Poupées/peluches',
          '- Vaporisateurs vides',
          'Livrets pré-pliés (4 pages)',
          'Images d\'aide pré-découpées',
          'Colle, crayons',
          'Portfolio familial'
        ],
        optional: [
          'Tabliers pour station cuisine',
          'Vraies plantes',
          'Autocollants de récompense'
        ]
      },
      
      accommodations: {
        physical: 'Matériel adapté aux petites mains, positions flexibles',
        cognitive: 'Rotation courte aux stations, support visuel',
        language: 'Modélisation du vocabulaire, phrases simples',
        social: 'Travail en paire possible, participation graduelle'
      },
      
      modifications: {
        forIEP: 'Participer à 2 stations, créer 2 pages du livre',
        alternativeActivities: 'Observer et dessiner au lieu du jeu dramatique'
      },
      
      extensions: {
        earlyFinishers: 'Créer une page supplémentaire, aider un ami',
        advancedLearners: 'Écrire une phrase sur l\'aide',
        homeConnection: 'Faire une action d\'aide à photographier'
      },
      
      assessmentType: 'Observation et portfolio',
      
      assessmentNotes: `Observer et documenter:
• Participation aux stations de jeu dramatique
• Vocabulaire utilisé (aider, ranger, prendre soin)
• Identification d'actions d'aide
• Création du livre personnel
• Interaction positive avec les pairs
• Fierté dans le partage`,
      
      differentiationStrategies: {
        forStruggling: 'Support constant aux stations, images à coller, vocabulaire simplifié',
        forAdvanced: 'Rôle de leader aux stations, écriture émergente, aide aux pairs',
        byInterest: 'Choix de stations préférées, méthode de création',
        byLearningProfile: 'Kinesthésique: stations actives; Visuel: images; Social: travail en groupe'
      },
      
      engagementHooks: {
        opening: 'Marionnette et histoire interactive',
        duringLesson: 'Stations de jeu dramatique actives',
        closing: 'Célébration et chanson'
      },
      
      formativeCheckpoints: {
        understanding: 'Observation aux stations',
        vocabulary: 'Écoute active du langage utilisé',
        application: 'Création du livre personnel'
      },
      
      interventionStrategies: {
        tier1: 'Modélisation à chaque station',
        tier2: 'Support supplémentaire en petit groupe',
        tier3: 'Accompagnement individuel aux stations'
      },
      
      performanceOpportunities: 'Jeu dramatique, présentation du livre, participation à la chanson',
      
      priorKnowledgeCheck: 'Montrer les dessins de famille, nommer les membres',
      
      reflectionActivities: {
        student: 'Partager son livre et sa fierté',
        teacher: 'Noter les types d\'aide identifiés par chaque enfant'
      },
      
      wheretoFramework: {
        W: 'Nous explorons comment nous aidons nos familles',
        H: 'Histoire engageante, stations de jeu',
        E: 'Exploration active par le jeu dramatique',
        R: 'Création du livre pour réfléchir',
        E2: 'Observation et livre comme évaluation',
        T: 'Différentes méthodes de participation',
        O: 'Histoire → Exploration → Création → Partage'
      },
      
      grouping: 'Groupe entier → Petits groupes rotatifs → Individuel → Groupe entier',
      
      isSubFriendly: true,
      
      subNotes: `Focus: Comment les enfants peuvent aider leur famille.
Activité principale: Stations de jeu dramatique puis création de livre.
4 stations préparées (5 min chacune).
Important: Valoriser toutes les formes d'aide, même petites.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 3: ${lesson3.title}`);

  // LESSON 4: Nos traditions familiales
  const lesson4 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Nos traditions familiales spéciales',
      titleFr: 'Nos traditions familiales spéciales',
      date: new Date('2025-09-05'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Comprendre ce qu'est une tradition familiale
• Identifier une tradition de leur famille
• Apprécier la diversité des traditions
• Faire des connexions entre les familles`,
      
      learningGoalsFr: `Les élèves vont:
• Comprendre ce qu'est une tradition familiale
• Identifier une tradition de leur famille
• Apprécier la diversité des traditions
• Faire des connexions entre les familles`,
      
      // MINDS ON (10 minutes)
      mindsOn: `Mystère des traditions (10 min):
1. Sac mystère avec objets de traditions:
   - Bougie (anniversaires)
   - Photo de repas en famille
   - Livre d'histoires
   - Décoration de fête
2. Sortir un objet à la fois:
   "Qu'est-ce que c'est?"
   "Quand utilisons-nous ceci?"
3. Introduction du mot "tradition":
   "Une tradition = quelque chose de spécial qu'on fait ensemble"
4. Exemples simples:
   - Gâteau d'anniversaire
   - Histoire avant de dormir
   - Repas du dimanche
5. "Chaque famille a ses traditions spéciales!"`,
      
      mindsOnFr: `Mystère des traditions (10 min):
1. Sac mystère avec objets de traditions:
   - Bougie (anniversaires)
   - Photo de repas en famille
   - Livre d'histoires
   - Décoration de fête
2. Sortir un objet à la fois:
   "Qu'est-ce que c'est?"
   "Quand utilisons-nous ceci?"
3. Introduction du mot "tradition":
   "Une tradition = quelque chose de spécial qu'on fait ensemble"
4. Exemples simples:
   - Gâteau d'anniversaire
   - Histoire avant de dormir
   - Repas du dimanche
5. "Chaque famille a ses traditions spéciales!"`,
      
      // ACTION (25 minutes)
      action: `Musée des traditions familiales (25 min):

PARTIE 1: Cercle de partage (10 min)
• Invité spécial: Parent/grand-parent/Aîné de la communauté
• Partage une tradition simple avec objet/photo
• Enfants posent des questions
• Enseignant partage aussi une tradition
• Tour de table rapide: "Chez moi, on aime..."
  (manger ensemble, chanter, jouer, etc.)

PARTIE 2: Création de l'exposition (15 min)
• Tables avec 4 centres de création:
  Centre 1: Dessiner un repas de famille
  Centre 2: Décorer un cadre pour photo de famille
  Centre 3: Créer une carte de fête
  Centre 4: Illustrer une activité familiale
• Rotation libre (environ 4 min par centre)
• Chaque création = une tradition
• Afficher sur le "Mur des traditions"

Différenciation:
- Soutien: Modèles visuels, aide individuelle
- Avancé: Ajouter des mots, détails
- Choix: Centre préféré, matériel`,
      
      actionFr: `Musée des traditions familiales (25 min):

PARTIE 1: Cercle de partage (10 min)
• Invité spécial: Parent/grand-parent/Aîné de la communauté
• Partage une tradition simple avec objet/photo
• Enfants posent des questions
• Enseignant partage aussi une tradition
• Tour de table rapide: "Chez moi, on aime..."
  (manger ensemble, chanter, jouer, etc.)

PARTIE 2: Création de l'exposition (15 min)
• Tables avec 4 centres de création:
  Centre 1: Dessiner un repas de famille
  Centre 2: Décorer un cadre pour photo de famille
  Centre 3: Créer une carte de fête
  Centre 4: Illustrer une activité familiale
• Rotation libre (environ 4 min par centre)
• Chaque création = une tradition
• Afficher sur le "Mur des traditions"

Différenciation:
- Soutien: Modèles visuels, aide individuelle
- Avancé: Ajouter des mots, détails
- Choix: Centre préféré, matériel`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Visite du musée des traditions (10 min):
• Marche silencieuse pour observer le mur
• Musique douce de différentes cultures
• Arrêts pour observations:
  "Je vois beaucoup de familles qui mangent ensemble"
  "Les fêtes sont importantes pour plusieurs familles"
  "Nous avons des traditions semblables et différentes"
• Cercle final:
  - Chaque enfant dit UNE tradition qu'il aime
  - Applaudissements pour chaque partage
• Conclusion: "Nos traditions rendent nos familles spéciales!"
• Annonce: "La semaine prochaine, nous continuerons à explorer nos familles et notre communauté!"`,
      
      consolidationFr: `Visite du musée des traditions (10 min):
• Marche silencieuse pour observer le mur
• Musique douce de différentes cultures
• Arrêts pour observations:
  "Je vois beaucoup de familles qui mangent ensemble"
  "Les fêtes sont importantes pour plusieurs familles"
  "Nous avons des traditions semblables et différentes"
• Cercle final:
  - Chaque enfant dit UNE tradition qu'il aime
  - Applaudissements pour chaque partage
• Conclusion: "Nos traditions rendent nos familles spéciales!"
• Annonce: "La semaine prochaine, nous continuerons à explorer nos familles et notre communauté!"`,
      
      materials: {
        required: [
          'Sac mystère avec objets',
          'Objets de traditions (bougie, photos, etc.)',
          'Matériel pour 4 centres:',
          '- Papier et crayons (repas)',
          '- Cadres en carton et décorations',
          '- Cartes vierges et autocollants',
          '- Papier et matériel d\'art',
          'Mur ou panneau d\'affichage',
          'Musique multiculturelle douce'
        ],
        optional: [
          'Appareil photo',
          'Objets culturels additionnels',
          'Tissus colorés pour décoration'
        ]
      },
      
      accommodations: {
        physical: 'Centres accessibles, matériel adapté',
        cognitive: 'Instructions simples, support visuel constant',
        language: 'Vocabulaire avec images, participation non-verbale acceptée',
        social: 'Partage optionnel, travail individuel ou en paire'
      },
      
      modifications: {
        forIEP: 'Objectif: identifier une tradition, participer à 2 centres',
        alternativeActivities: 'Observer et applaudir au lieu de créer'
      },
      
      extensions: {
        earlyFinishers: 'Créer une deuxième tradition, aider à décorer le mur',
        advancedLearners: 'Écrire le nom de la tradition, créer un livre de traditions',
        homeConnection: 'Apporter une photo de tradition familiale lundi'
      },
      
      assessmentType: 'Observation et documentation',
      
      assessmentNotes: `Observer et documenter:
• Compréhension du concept de tradition
• Capacité à identifier une tradition personnelle
• Participation aux centres de création
• Respect et intérêt pour les traditions des autres
• Utilisation du vocabulaire thématique
• Expression de fierté culturelle`,
      
      differentiationStrategies: {
        forStruggling: 'Support individuel aux centres, exemples concrets, une seule tradition',
        forAdvanced: 'Multiples traditions, écriture émergente, rôle d\'assistant',
        byInterest: 'Choix du centre, type de tradition à représenter',
        byLearningProfile: 'Visuel: images et créations; Auditif: musique et partage oral; Kinesthésique: rotation aux centres'
      },
      
      engagementHooks: {
        opening: 'Sac mystère intriguant',
        duringLesson: 'Invité spécial, centres créatifs',
        closing: 'Musée des traditions avec musique'
      },
      
      formativeCheckpoints: {
        concept: 'Questions sur le sac mystère',
        personal: 'Partage en cercle',
        creation: 'Observation aux centres',
        appreciation: 'Commentaires pendant la visite'
      },
      
      interventionStrategies: {
        tier1: 'Exemples visuels multiples',
        tier2: 'Support en petit groupe pour identifier les traditions',
        tier3: 'Aide individuelle pour la connexion personnelle'
      },
      
      performanceOpportunities: 'Partage oral, création artistique, présentation informelle',
      
      priorKnowledgeCheck: 'Révision rapide: famille, communauté, aide',
      
      reflectionActivities: {
        student: 'Nommer sa tradition préférée',
        teacher: 'Noter la diversité des traditions représentées'
      },
      
      wheretoFramework: {
        W: 'Nous découvrons les traditions qui rendent nos familles spéciales',
        H: 'Sac mystère et invité spécial',
        E: 'Exploration par centres créatifs',
        R: 'Musée pour voir la diversité',
        E2: 'Observation de la compréhension et du respect',
        T: 'Multiples façons d\'exprimer les traditions',
        O: 'Mystère → Partage → Création → Célébration'
      },
      
      grouping: 'Groupe entier → Centres individuels/paires → Groupe entier',
      
      isSubFriendly: true,
      
      subNotes: `Dernière leçon de la semaine 1.
Focus: Les traditions familiales et leur diversité.
Activité principale: Centres de création et mur des traditions.
Invité confirmé: [Nom] à 9h15.
Important: Célébrer toutes les traditions, créer un climat inclusif.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 4: ${lesson4.title}`);

  console.log('\n📊 WEEK 1 SUMMARY');
  console.log('=================');
  console.log('Created 4 perfect lesson plans for Sciences humaines');
  console.log('Unit: Ma famille et ma communauté');
  console.log('Dates: September 2-5, 2025');
  console.log('\nKey Features:');
  console.log('✅ ETFO three-part structure');
  console.log('✅ Grade 1 appropriate (15-20 min segments)');
  console.log('✅ French immersion context');
  console.log('✅ Differentiation for all learners');
  console.log('✅ Assessment integrated naturally');
  console.log('✅ Cross-curricular connections');
  console.log('✅ Family and community focus');
  console.log('✅ Play-based learning');
  console.log('✅ Visual supports throughout');
  console.log('✅ Building toward performance task');
}

createWeek1LessonPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());