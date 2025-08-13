import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectMathLessons() {
  console.log('🔢 CREATING PERFECT MATHEMATICS LESSONS - LES NOMBRES, MES AMIS');
  console.log('='.repeat(60));

  // Get the test teacher account
  const teacher = await prisma.user.findFirst({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!teacher) {
    console.error('❌ Teacher not found');
    return;
  }

  // Get the mathematics unit
  const unit = await prisma.unitPlan.findFirst({
    where: { title: "Les nombres, mes amis" }
  });

  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }

  console.log('✅ Found unit:', unit.title);
  console.log('Start date:', unit.startDate.toLocaleDateString());
  console.log('End date:', unit.endDate.toLocaleDateString());

  const lessons = [
    // ==================== WEEK 1: INTRODUCTION AUX NOMBRES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les nombres dans notre vie",
      date: new Date('2025-09-03'),
      duration: 60,
      mindsOn: "Regardez autour de vous. Où voyez-vous des nombres? Sur l'horloge, les livres, nos doigts! Les nombres sont partout! Chasse aux nombres dans la classe. (10 min)",
      action: `1. Exploration: trouver et documenter des nombres dans la classe (10 min)
2. Création d'un livre de nombres personnel 0-5 (15 min)
3. Jeu de correspondance: nombre et quantité avec manipulatifs (10 min)
4. Chanson des nombres avec mouvements (5 min)
5. Construction de tours avec le nombre exact de blocs (10 min)`,
      consolidation: "Montrez votre nombre préféré avec vos doigts. Pourquoi l'aimez-vous? Créons notre affiche de nombres de classe. (10 min)",
      learningGoals: "Reconnaître les nombres dans l'environnement; Associer nombre et quantité; Développer le sens du nombre",
      materials: JSON.stringify([
        'Cartes de nombres',
        'Manipulatifs variés (cubes, jetons, boutons)',
        'Papier et crayons',
        'Autocollants',
        'Blocs de construction',
        'Affiche vierge'
      ]),
      grouping: "Exploration individuelle, travail en paires, activité collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Commencer avec nombres 0-3',
          'Manipulatifs plus gros',
          'Support visuel constant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulatifs adaptés, support pour écriture',
        cognitive: 'Nombres limités, association un à un',
        sensory: 'Matériel tactile varié, espace calme'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Explorer nombres jusqu\'à 20',
          'Créer des patterns',
          'Écrire les nombres en mots',
          'Problèmes simples'
        ]
      }),
      assessmentType: 'Diagnostique',
      assessmentNotes: 'Évaluation initiale de la reconnaissance des nombres et du comptage. Documentation des connaissances préalables.',
      subNotes: "Introduction aux nombres avec exploration pratique. Manipulatifs préparés par stations. Adaptation selon les besoins.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Compter jusqu'à 10",
      date: new Date('2025-09-05'),
      duration: 60,
      mindsOn: "Combien de sauts pouvez-vous faire? Comptons ensemble! 1, 2, 3... Notre corps nous aide à compter! Comptage actif. (10 min)",
      action: `1. Comptage avec mouvements corporels variés (10 min)
2. Création de collections de 1 à 10 objets (10 min)
3. Jeu "Montre-moi": montrer rapidement une quantité (10 min)
4. Livre à compter collectif: une page par nombre (15 min)
5. Course de comptage: qui peut compter le plus d'objets? (5 min)`,
      consolidation: "Comptez à rebours de 10 à 0 pour la fusée! Comment vous souvenez-vous de l'ordre des nombres? Stratégies partagées. (10 min)",
      learningGoals: "Maîtriser le comptage jusqu'à 10; Développer la correspondance terme à terme; Comprendre la séquence numérique",
      materials: JSON.stringify([
        'Objets à compter variés',
        'Cartes nombres',
        'Dés',
        'Jetons de couleur',
        'Corde à sauter',
        'Livre vierge collectif'
      ]),
      grouping: "Activités de mouvement en groupe, travail individuel, création collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Comptage jusqu\'à 5 d\'abord',
          'Objets plus gros à manipuler',
          'Comptage avec aide physique'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés, comptage assis',
        cognitive: 'Séquence plus courte, répétition fréquente',
        sensory: 'Objets texturés pour le comptage'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Compter par bonds de 2',
          'Compter jusqu\'à 20 ou plus',
          'Problèmes de comptage',
          'Création de patterns numériques'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation du comptage oral et de la correspondance terme à terme. Évaluation de la mémorisation de la séquence.',
      subNotes: "Comptage actif jusqu'à 10. Matériel de manipulation varié disponible. Mouvements pour kinesthésiques.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 2: REPRÉSENTATION DES NOMBRES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Différentes façons de montrer un nombre",
      date: new Date('2025-09-08'),
      duration: 60,
      mindsOn: "Le nombre 5 peut se montrer avec les doigts, des points, des objets... Combien de façons connaissez-vous? Exploration créative. (10 min)",
      action: `1. Station 1: Représenter avec le corps (10 min)
2. Station 2: Dessiner avec des points et images (10 min)
3. Station 3: Construire avec des blocs (10 min)
4. Station 4: Montrer avec des dominos et dés (10 min)
5. Galerie des représentations: tour des créations (10 min)`,
      consolidation: "Quelle façon préférez-vous pour montrer les nombres? Créons notre mur de nombres avec toutes les représentations. (10 min)",
      learningGoals: "Représenter les nombres de différentes façons; Comprendre l'équivalence; Développer la flexibilité numérique",
      materials: JSON.stringify([
        'Matériel de manipulation varié',
        'Papier et marqueurs',
        'Dominos et dés',
        'Blocs de construction',
        'Cartes de représentation',
        'Appareil photo'
      ]),
      grouping: "Rotation aux stations, partage en grand groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Focus sur nombres 1-5',
          'Une représentation à la fois',
          'Modèles visuels fournis'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Matériel adapté, support pour manipulation',
        cognitive: 'Représentations concrètes seulement',
        sensory: 'Choix de matériel selon préférence'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Représenter nombres à 2 chiffres',
          'Créer des équations',
          'Inventer de nouvelles représentations',
          'Expliquer les équivalences'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la capacité à représenter les nombres de multiples façons et à reconnaître l\'équivalence.',
      subNotes: "Représentations multiples avec stations. Matériel organisé par station. Rotation toutes les 10 minutes.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les nombres cachés",
      date: new Date('2025-09-10'),
      duration: 60,
      mindsOn: "J'ai 5 jetons. J'en cache quelques-uns. Combien sont cachés? Devenons des détectives de nombres! Jeu de devinette. (10 min)",
      action: `1. Jeu des boîtes mystères: deviner les quantités cachées (10 min)
2. Subitisation: reconnaître rapidement les quantités (10 min)
3. Création de cartes éclairs personnelles (10 min)
4. Chasse au trésor numérique dans la classe (10 min)
5. Bingo des nombres avec images (10 min)`,
      consolidation: "Quel nombre est le plus facile à reconnaître rapidement? Pourquoi? Test de rapidité avec nos cartes éclairs. (10 min)",
      learningGoals: "Développer la subitisation; Reconnaître rapidement les quantités; Comprendre la conservation du nombre",
      materials: JSON.stringify([
        'Boîtes opaques',
        'Jetons et objets variés',
        'Cartes éclairs',
        'Cartes de bingo',
        'Chronomètre',
        'Récompenses autocollants'
      ]),
      grouping: "Jeux en paires, activité individuelle, jeu collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Quantités jusqu\'à 3',
          'Plus de temps pour observer',
          'Indices visuels supplémentaires'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation assistée si nécessaire',
        cognitive: 'Quantités très petites, répétition',
        sensory: 'Objets contrastés, bon éclairage'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Subitisation jusqu\'à 10',
          'Patterns complexes',
          'Création de défis pour autres',
          'Chronométrage personnel'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la capacité de subitisation et de la reconnaissance rapide des quantités.',
      subNotes: "Jeux de reconnaissance rapide. Matériel mystère préparé. Adaptation du rythme selon les élèves.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 3: COMPARAISON ET ORDRE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Plus grand, plus petit, égal",
      date: new Date('2025-09-15'),
      duration: 60,
      mindsOn: "Qui a plus de crayons? Qui en a moins? Comment le savez-vous? Comparons nos collections! Démonstration visuelle. (10 min)",
      action: `1. Comparaison de collections d'objets réels (10 min)
2. Introduction des symboles <, >, = avec le crocodile (10 min)
3. Jeu de bataille avec cartes de nombres (10 min)
4. Construction de tours: plus haute, plus basse, même hauteur (10 min)
5. Création d'un livre de comparaisons (10 min)`,
      consolidation: "Montrez avec vos bras: plus grand que, plus petit que, égal à. Pratiquons avec des exemples de la classe. (10 min)",
      learningGoals: "Comparer des quantités; Utiliser le vocabulaire de comparaison; Comprendre les symboles mathématiques",
      materials: JSON.stringify([
        'Collections d\'objets variés',
        'Cartes de nombres',
        'Crocodile en carton',
        'Blocs de construction',
        'Balance',
        'Symboles magnétiques'
      ]),
      grouping: "Comparaisons en paires, jeux à deux, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Comparaisons très évidentes',
          'Objets concrets seulement',
          'Symboles avec images'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation assistée, symboles tactiles',
        cognitive: 'Différences très claires, vocabulaire simple',
        sensory: 'Objets contrastés, comparaisons visuelles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Comparer nombres à 2 chiffres',
          'Ordonner 5+ nombres',
          'Créer des inégalités',
          'Résoudre des problèmes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension des comparaisons et de l\'utilisation correcte du vocabulaire et des symboles.',
      subNotes: "Comparaisons avec manipulatifs et symboles. Crocodile affamé pour mémorisation. Jeux de comparaison préparés.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mettre en ordre",
      date: new Date('2025-09-17'),
      duration: 60,
      mindsOn: "Mettez-vous en ligne du plus petit au plus grand! Comment décidez-vous l'ordre? Activité de classement humain. (10 min)",
      action: `1. Ordonner des objets par taille, poids, quantité (10 min)
2. Création d'escaliers de nombres avec cubes (10 min)
3. Jeu de la ligne numérique humaine (10 min)
4. Puzzles de séquences numériques (10 min)
5. Course d'ordre: qui peut ranger le plus vite? (10 min)`,
      consolidation: "Expliquez comment vous avez mis les nombres en ordre. Quelles stratégies utilisez-vous? Création d'une ligne numérique murale. (10 min)",
      learningGoals: "Ordonner les nombres; Comprendre la séquence croissante et décroissante; Développer le raisonnement logique",
      materials: JSON.stringify([
        'Objets de tailles variées',
        'Cartes de nombres',
        'Cubes emboîtables',
        'Corde pour ligne numérique',
        'Pinces à linge numérotées',
        'Puzzles séquentiels'
      ]),
      grouping: "Activité de mouvement collective, travail individuel, jeux en équipes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Séquences de 3-5 nombres',
          'Aide visuelle de la ligne',
          'Manipulation guidée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ordre sur table au lieu de debout',
        cognitive: 'Petites séquences, nombres consécutifs',
        sensory: 'Matériel avec textures différentes'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ordre avec nombres manquants',
          'Compter par bonds',
          'Ordre décroissant',
          'Créer des défis d\'ordre'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la capacité à ordonner et du raisonnement utilisé. Évaluation de la compréhension séquentielle.',
      subNotes: "Activités d'ordre et de séquence. Ligne numérique au sol avec ruban. Matériel de tri préparé.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 4: ADDITION INTRODUCTION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Ajouter, c'est mettre ensemble",
      date: new Date('2025-09-22'),
      duration: 60,
      mindsOn: "J'ai 2 pommes, tu m'en donnes 3. Combien ai-je maintenant? L'addition, c'est combiner! Histoire mathématique visuelle. (10 min)",
      action: `1. Histoires d'addition avec objets réels (10 min)
2. Représentation avec les doigts et le corps (10 min)
3. Introduction du symbole + avec manipulatifs (10 min)
4. Création de problèmes d'addition illustrés (10 min)
5. Jeu de dés: additionner les points (10 min)`,
      consolidation: "Inventez votre propre histoire d'addition. Partagez-la avec un ami. Notre mur d'histoires mathématiques. (10 min)",
      learningGoals: "Comprendre le concept d'addition; Résoudre des problèmes simples; Utiliser le vocabulaire et symboles",
      materials: JSON.stringify([
        'Objets concrets (fruits, jouets)',
        'Dés',
        'Cartes d\'addition',
        'Papier et crayons',
        'Symbole + grand format',
        'Boîtes pour regrouper'
      ]),
      grouping: "Démonstration collective, manipulation en paires, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Addition jusqu\'à 5',
          'Objets concrets toujours',
          'Une étape à la fois'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation assistée, objets plus gros',
        cognitive: 'Sommes très petites, histoires simples',
        sensory: 'Objets familiers et attrayants'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Addition jusqu\'à 20',
          'Trois nombres ou plus',
          'Problèmes écrits',
          'Stratégies mentales'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension du concept d\'addition et de la résolution de problèmes simples.',
      subNotes: "Introduction à l'addition avec histoires concrètes. Manipulatifs variés disponibles. Focus sur le sens, pas la mémorisation.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Stratégies pour additionner",
      date: new Date('2025-09-24'),
      duration: 60,
      mindsOn: "Comment trouvez-vous la réponse à 4 + 3? Montrez-moi vos trucs! Partage de stratégies personnelles. (10 min)",
      action: `1. Stratégie 1: Compter sur les doigts (10 min)
2. Stratégie 2: Compter à partir du plus grand nombre (10 min)
3. Stratégie 3: Utiliser des doubles connus (10 min)
4. Stratégie 4: Faire 10 d'abord (10 min)
5. Pratique avec différentes stratégies (10 min)`,
      consolidation: "Quelle stratégie préférez-vous? Pourquoi? Créons notre affiche de stratégies d'addition. (10 min)",
      learningGoals: "Développer diverses stratégies d'addition; Choisir la stratégie appropriée; Expliquer sa pensée mathématique",
      materials: JSON.stringify([
        'Cadres de 10',
        'Jetons bicolores',
        'Ligne numérique',
        'Cartes de stratégies',
        'Cubes emboîtables',
        'Affiche vierge'
      ]),
      grouping: "Exploration de stratégies en groupe, pratique en paires, partage collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Une stratégie à la fois',
          'Manipulatifs obligatoires',
          'Nombres plus petits'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Stratégies visuelles privilégiées',
        cognitive: 'Stratégie unique maîtrisée d\'abord',
        sensory: 'Matériel tactile pour compter'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Stratégies mentales',
          'Expliquer aux autres',
          'Inventer des stratégies',
          'Défis chronométrés'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation des stratégies utilisées et de la flexibilité. Évaluation de l\'explication du raisonnement.',
      subNotes: "Exploration de stratégies d'addition. Matériel pour chaque stratégie préparé. Valoriser toutes les approches.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 5: SOUSTRACTION INTRODUCTION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Enlever et compter ce qui reste",
      date: new Date('2025-09-29'),
      duration: 60,
      mindsOn: "J'ai 5 biscuits. J'en mange 2. Combien me reste-t-il? La soustraction, c'est enlever! Démonstration gourmande. (10 min)",
      action: `1. Histoires de soustraction avec manipulation (10 min)
2. Jeu "Mange les bonbons": soustraction concrète (10 min)
3. Introduction du symbole - avec démonstration (10 min)
4. Théâtre mathématique: jouer des soustractions (10 min)
5. Création de livres de soustraction illustrés (10 min)`,
      consolidation: "Quelle histoire de soustraction préférez-vous? Comment savez-vous combien il reste? Stratégies partagées. (10 min)",
      learningGoals: "Comprendre le concept de soustraction; Résoudre des problèmes d'enlèvement; Utiliser le vocabulaire approprié",
      materials: JSON.stringify([
        'Objets à enlever (faux bonbons)',
        'Assiettes et contenants',
        'Symbole - grand format',
        'Costumes simples pour théâtre',
        'Papier et matériel d\'art',
        'Cartes de soustraction'
      ]),
      grouping: "Démonstration collective, théâtre en petits groupes, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Soustraction jusqu\'à 5',
          'Manipulation obligatoire',
          'Histoires très simples'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Objets faciles à manipuler',
        cognitive: 'Une action à la fois, nombres petits',
        sensory: 'Objets attrayants mais non distrayants'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Soustraction de 20',
          'Problèmes à étapes',
          'Comparaison add/sous',
          'Création de problèmes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension de la soustraction et de la capacité à résoudre des problèmes concrets.',
      subNotes: "Introduction à la soustraction avec histoires concrètes. Matériel attrayant préparé. Focus sur l'action d'enlever.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Addition et soustraction ensemble",
      date: new Date('2025-10-01'),
      duration: 60,
      mindsOn: "3 + 2 = 5, alors 5 - 2 = ? Ces opérations sont liées! Découvrons comment avec des cubes. Démonstration de la relation. (10 min)",
      action: `1. Exploration: faire et défaire avec cubes (10 min)
2. Familles de faits avec dominos (10 min)
3. Machine à calculer humaine: entrée/sortie (10 min)
4. Résolution de problèmes mixtes (10 min)
5. Création de problèmes pour les amis (10 min)`,
      consolidation: "Comment l'addition et la soustraction sont-elles connectées? Montrez avec vos jetons. Discussion et synthèse. (10 min)",
      learningGoals: "Comprendre la relation inverse; Résoudre des problèmes variés; Développer la flexibilité opératoire",
      materials: JSON.stringify([
        'Cubes emboîtables',
        'Dominos',
        'Jetons réversibles',
        'Cartes de problèmes',
        'Tableau de familles de faits',
        'Machine en carton'
      ]),
      grouping: "Exploration en paires, jeu collectif, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Faits jusqu\'à 5',
          'Une opération puis l\'autre',
          'Support visuel constant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation guidée si nécessaire',
        cognitive: 'Relations simples seulement',
        sensory: 'Matériel structuré et organisé'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Familles de faits complexes',
          'Problèmes à plusieurs étapes',
          'Équations à trous',
          'Défis de logique'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension de la relation entre addition et soustraction. Flexibilité dans la résolution.',
      subNotes: "Connexion addition-soustraction avec manipulatifs. Machine mathématique préparée. Focus sur la réversibilité.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 6: PATTERNS ET RÉGULARITÉS ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les patterns sont partout",
      date: new Date('2025-10-06'),
      duration: 60,
      mindsOn: "Rouge, bleu, rouge, bleu... Qu'est-ce qui vient après? Notre monde est plein de patterns! Cherchons-les! (10 min)",
      action: `1. Création de patterns avec le corps (clap, tap) (10 min)
2. Patterns avec matériel: couleurs, formes, tailles (10 min)
3. Musique et patterns: créer des rythmes (10 min)
4. Patterns dans la nature: observation et dessin (10 min)
5. Défilé de patterns: présentation costumée (10 min)`,
      consolidation: "Quel pattern avez-vous créé? Comment continue-t-il? Exposition de nos patterns créatifs. (10 min)",
      learningGoals: "Identifier et créer des patterns; Prédire la suite; Comprendre la régularité",
      materials: JSON.stringify([
        'Matériel coloré varié',
        'Instruments simples',
        'Images de la nature',
        'Perles et fils',
        'Formes géométriques',
        'Autocollants'
      ]),
      grouping: "Activités de mouvement en groupe, création individuelle, partage collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Patterns AB simples',
          'Support visuel',
          'Répétition guidée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Patterns statiques si mouvement difficile',
        cognitive: 'Patterns très simples, concrets',
        sensory: 'Matériel selon préférences sensorielles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Patterns ABC ou plus',
          'Patterns croissants',
          'Créer des règles complexes',
          'Patterns numériques'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'identification et création de patterns. Capacité à expliquer et continuer les régularités.',
      subNotes: "Exploration des patterns avec matériel varié. Musique et mouvement intégrés. Focus sur la créativité.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Compter par bonds",
      date: new Date('2025-10-08'),
      duration: 60,
      mindsOn: "2, 4, 6, 8... Nous comptons par bonds de 2! C'est plus rapide! Sautons en comptant! Activité physique. (10 min)",
      action: `1. Comptage par 2 avec mouvements (10 min)
2. Comptage par 5 avec les mains (10 min)
3. Comptage par 10 avec matériel base 10 (10 min)
4. Création de chenilles de nombres (bonds) (10 min)
5. Course de comptage par bonds (10 min)`,
      consolidation: "Quel comptage par bonds est le plus utile? Quand l'utilisez-vous? Applications dans la vie. (10 min)",
      learningGoals: "Compter par bonds de 2, 5 et 10; Reconnaître les patterns numériques; Développer l'efficacité du comptage",
      materials: JSON.stringify([
        'Ligne numérique géante',
        'Matériel base 10',
        'Cartes de nombres',
        'Cerceaux pour sauter',
        'Tableau de 100',
        'Autocollants nombres'
      ]),
      grouping: "Activités de mouvement collectives, travail individuel, compétition amicale",
      accommodations: JSON.stringify({
        forStruggling: [
          'Bonds de 2 seulement',
          'Support visuel constant',
          'Comptage jusqu\'à 20'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Comptage assis ou avec gestes adaptés',
        cognitive: 'Un type de bond, nombres plus petits',
        sensory: 'Rythme adapté, volume contrôlé'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Bonds de 3, 4, etc.',
          'Compter à rebours par bonds',
          'Patterns complexes',
          'Jusqu\'à 100 et plus'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation du comptage par bonds et de la reconnaissance des patterns. Fluidité et confiance.',
      subNotes: "Comptage par bonds avec mouvement. Ligne numérique au sol. Adaptation du rythme selon le groupe.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 7: GÉOMÉTRIE ET FORMES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les formes autour de nous",
      date: new Date('2025-10-14'),
      duration: 60,
      mindsOn: "Regardez le tableau... c'est un rectangle! La porte? La fenêtre? Les formes construisent notre monde! Chasse aux formes. (10 min)",
      action: `1. Identification des formes dans l'environnement (10 min)
2. Construction avec blocs géométriques (10 min)
3. Création d'images avec formes (tangrams simples) (10 min)
4. Tri et classification de formes (10 min)
5. Danse des formes: faire les formes avec le corps (10 min)`,
      consolidation: "Quelle forme préférez-vous? Pourquoi? Créons notre musée des formes avec nos créations. (10 min)",
      learningGoals: "Identifier les formes géométriques; Comprendre les propriétés; Créer avec des formes",
      materials: JSON.stringify([
        'Blocs géométriques',
        'Tangrams',
        'Formes découpées',
        'Objets 3D',
        'Colle et papier',
        'Musique pour la danse'
      ]),
      grouping: "Chasse collective, construction individuelle, danse de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Formes de base seulement',
          'Grandes formes à manipuler',
          'Associations concrètes'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Formes adaptées à la préhension',
        cognitive: '3-4 formes principales',
        sensory: 'Formes texturées, couleurs contrastées'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Formes 3D',
          'Propriétés des formes',
          'Créations complexes',
          'Symétrie'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'identification des formes et de la compréhension de leurs propriétés. Créativité géométrique.',
      subNotes: "Exploration des formes avec matériel varié. Tangrams préparés. Lien avec l'environnement quotidien.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mesurer et comparer",
      date: new Date('2025-10-16'),
      duration: 60,
      mindsOn: "Qui est le plus grand? Quelle table est la plus longue? Comment mesurons-nous? Exploration des concepts. (10 min)",
      action: `1. Mesurer avec des unités non-standard (mains, pieds) (10 min)
2. Comparaison de longueurs avec ficelles (10 min)
3. Ordonner par taille: du plus petit au plus grand (10 min)
4. Estimation: combien de cubes de long? (10 min)
5. Création d'un livre des mesures de la classe (10 min)`,
      consolidation: "Qu'avez-vous découvert en mesurant? Pourquoi obtenons-nous des nombres différents? Discussion sur les unités. (10 min)",
      learningGoals: "Mesurer avec unités non-standard; Comparer des longueurs; Développer le sens de la mesure",
      materials: JSON.stringify([
        'Cubes uniformes',
        'Ficelles et rubans',
        'Règles non-standard',
        'Objets à mesurer',
        'Tableau de mesures',
        'Papier graphique'
      ]),
      grouping: "Mesures en paires, comparaisons en groupe, documentation individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mesures simples et courtes',
          'Comparaisons évidentes',
          'Aide pour aligner'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Objets faciles à manipuler',
        cognitive: 'Concepts de base (long/court)',
        sensory: 'Matériel avec bon contraste'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Introduction au cm',
          'Mesurer le périmètre',
          'Estimer puis vérifier',
          'Problèmes de mesure'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la capacité à mesurer et comparer. Compréhension du concept d\'unité.',
      subNotes: "Mesure avec unités non-standard. Matériel de mesure varié. Focus sur la comparaison.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 8: RÉSOLUTION DE PROBLÈMES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Devenir détective mathématique",
      date: new Date('2025-10-20'),
      duration: 60,
      mindsOn: "Un problème est comme un mystère à résoudre! Quelles stratégies utilisez-vous? Boîte à outils du détective. (10 min)",
      action: `1. Stratégie 1: Dessiner le problème (10 min)
2. Stratégie 2: Utiliser du matériel (10 min)
3. Stratégie 3: Faire un tableau (10 min)
4. Stratégie 4: Chercher un pattern (10 min)
5. Résolution en équipe: problème du jour (10 min)`,
      consolidation: "Quelle stratégie vous a le plus aidé? Comment choisissez-vous? Certificats de détective mathématique. (10 min)",
      learningGoals: "Développer des stratégies de résolution; Persévérer face aux défis; Expliquer son raisonnement",
      materials: JSON.stringify([
        'Cartes de stratégies',
        'Matériel de manipulation',
        'Papier et crayons',
        'Problèmes illustrés',
        'Badges de détective',
        'Tableau de stratégies'
      ]),
      grouping: "Exploration de stratégies en groupe, résolution en équipes, partage collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Problèmes très simples',
          'Une stratégie maîtrisée',
          'Support constant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation assistée si nécessaire',
        cognitive: 'Problèmes en une étape',
        sensory: 'Environnement calme pour concentration'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Problèmes multi-étapes',
          'Créer des problèmes',
          'Plusieurs stratégies',
          'Défis logiques'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation des stratégies utilisées et de la persévérance. Capacité à expliquer le raisonnement.',
      subNotes: "Stratégies de résolution avec problèmes gradués. Matériel de support disponible. Valoriser le processus.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mathématiques d'Halloween",
      date: new Date('2025-10-22'),
      duration: 60,
      mindsOn: "Combien de bonbons dans le sac de la sorcière? Les mathématiques d'Halloween sont amusantes! Estimation mystérieuse. (10 min)",
      action: `1. Estimation de bonbons dans des bocaux (10 min)
2. Patterns d'Halloween (fantôme, citrouille, chat) (10 min)
3. Problèmes de bonbons: partage équitable (10 min)
4. Graphique de nos costumes préférés (10 min)
5. Chasse au trésor mathématique d'Halloween (10 min)`,
      consolidation: "Qu'avez-vous appris sur les nombres aujourd'hui? Partageons nos découvertes effrayamment mathématiques! (10 min)",
      learningGoals: "Appliquer les concepts dans un contexte thématique; Résoudre des problèmes amusants; Collecter et représenter des données",
      materials: JSON.stringify([
        'Faux bonbons',
        'Bocaux transparents',
        'Décorations Halloween',
        'Graphique géant',
        'Cartes de chasse au trésor',
        'Autocollants thématiques'
      ]),
      grouping: "Estimations individuelles, patterns en groupe, chasse en équipes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Nombres plus petits',
          'Patterns simples',
          'Aide pour le graphique'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Matériel adapté, participation flexible',
        cognitive: 'Problèmes simplifiés, étapes guidées',
        sensory: 'Éviter le trop effrayant, ambiance contrôlée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Problèmes complexes',
          'Analyse du graphique',
          'Création de défis',
          'Probabilités simples'
        ]
      }),
      assessmentType: 'Formative et Ludique',
      assessmentNotes: 'Évaluation de l\'application des concepts dans un contexte thématique. Engagement et créativité.',
      subNotes: "Mathématiques thématiques Halloween. Ambiance festive mais éducative. Matériel non-effrayant.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 9: RÉVISION ET CÉLÉBRATION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Nos jeux mathématiques préférés",
      date: new Date('2025-10-27'),
      duration: 60,
      mindsOn: "Quels jeux mathématiques aimez-vous le plus? Votons pour créer notre arcade mathématique! Sélection démocratique. (10 min)",
      action: `1. Station 1: Jeux de dés et addition (10 min)
2. Station 2: Bataille de nombres (10 min)
3. Station 3: Patterns créatifs (10 min)
4. Station 4: Magasin de classe (argent) (10 min)
5. Station 5: Construction géométrique (10 min)`,
      consolidation: "Quel jeu vous a fait progresser? Comment? Remise des badges de champion mathématique. (10 min)",
      learningGoals: "Réviser les concepts par le jeu; Appliquer les apprentissages; Développer l'attitude positive",
      materials: JSON.stringify([
        'Tous les jeux de l\'unité',
        'Dés et cartes',
        'Argent scolaire',
        'Matériel de construction',
        'Badges de champion',
        'Tableau des scores'
      ]),
      grouping: "Rotation libre aux stations, jeux en petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Jeux adaptés au niveau',
          'Partenaire de jeu',
          'Règles simplifiées'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Jeux accessibles, matériel adapté',
        cognitive: 'Jeux au niveau approprié',
        sensory: 'Environnement de jeu calme disponible'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer de nouveaux jeux',
          'Enseigner aux autres',
          'Défis supplémentaires',
          'Tournoi amical'
        ]
      }),
      assessmentType: 'Formative et Ludique',
      assessmentNotes: 'Observation de l\'application des concepts dans les jeux. Attitude et collaboration.',
      subNotes: "Arcade mathématique avec stations de jeux. Tout le matériel organisé. Ambiance festive d'apprentissage.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Fête des mathématiques",
      date: new Date('2025-10-29'),
      duration: 60,
      mindsOn: "Nous sommes des mathématiciens! Célébrons tout ce que nous avons appris! Parade des nombres. (10 min)",
      action: `1. Exposition: Nos livres de mathématiques (10 min)
2. Démonstrations: Nos stratégies préférées (10 min)
3. Spectacle: Chanson et danse des nombres (10 min)
4. Concours amical: Défis mathématiques (10 min)
5. Création: Notre murale mathématique collective (10 min)`,
      consolidation: "Qu'avez-vous appris de plus important? Comment les mathématiques vous aident-elles? Diplômes et célébration! (10 min)",
      learningGoals: "Célébrer les apprentissages; Démontrer les compétences; Développer la fierté mathématique",
      materials: JSON.stringify([
        'Travaux des élèves',
        'Matériel de présentation',
        'Musique mathématique',
        'Grande feuille murale',
        'Diplômes personnalisés',
        'Appareil photo'
      ]),
      grouping: "Présentations individuelles et de groupe, création collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Présentation adaptée',
          'Support d\'un pair',
          'Participation flexible'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Participation selon capacités',
        cognitive: 'Démonstration simple valorisée',
        sensory: 'Espace calme si nécessaire'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Présentation complexe',
          'Aide à l\'organisation',
          'Démonstration avancée',
          'Mentorat des pairs'
        ]
      }),
      assessmentType: 'Sommative et Célébrative',
      assessmentNotes: 'Évaluation finale des compétences mathématiques. Portfolio complet. Célébration des progrès.',
      subNotes: "Célébration mathématique avec expositions et démonstrations. Programme détaillé. Parents invités si possible.",
      isSubFriendly: true,
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    console.log('\n📝 Creating 18 perfect Mathematics lessons...\n');
    
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson: ${created.title} (${created.date.toLocaleDateString()})`);
    }

    // Verify the perfection
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION OF MATHEMATICS LESSONS:');
    console.log('='.repeat(60));
    
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: unit.id },
      orderBy: { date: 'asc' }
    });
    
    let fullyCompliant = 0;
    
    for (const lesson of allLessons) {
      const hasThreePart = lesson.mindsOn && lesson.action && lesson.consolidation;
      const hasAssessment = lesson.assessmentType && lesson.assessmentNotes;
      const hasDifferentiation = lesson.accommodations && lesson.modifications && lesson.extensions;
      const isSubReady = lesson.isSubFriendly && lesson.subNotes;
      const hasCore = lesson.learningGoals && lesson.materials && lesson.grouping;
      
      if (hasThreePart && hasAssessment && hasDifferentiation && isSubReady && hasCore) {
        fullyCompliant++;
      }
    }
    
    console.log(`Total lessons created: ${allLessons.length}`);
    console.log(`Fully ETFO compliant: ${fullyCompliant}`);
    console.log(`Compliance rate: ${Math.round(fullyCompliant / allLessons.length * 100)}%`);
    
    if (fullyCompliant === allLessons.length) {
      console.log('\n' + '='.repeat(60));
      console.log('🔢 PERFECTION ACHIEVED!');
      console.log('='.repeat(60));
      console.log('✨ All 18 Mathematics lessons are 100% PERFECT!');
      console.log('✨ Complete ETFO compliance from the start!');
      console.log('✨ Ready for Grade 1 French Immersion!');
      console.log('✨ September 3 to October 29, 2025');
      console.log('✨ Comprehensive mathematics curriculum!');
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectMathLessons();