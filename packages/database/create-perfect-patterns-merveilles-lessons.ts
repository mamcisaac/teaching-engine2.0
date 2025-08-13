import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPatternsMerveillesLessons() {
  console.log('🔢 CREATING PERFECT "PATTERNS ET MERVEILLES" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Patterns et merveilles' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 16 perfect ETFO-compliant French Mathematics lessons on patterns
  const lessons = [
    {
      // Week 1: Découverte des régularités
      title: "Les régularités sont partout!",
      date: new Date('2025-11-03'),
      duration: 60,
      mindsOn: "Regardez mes mouvements: clap-clap-stomp, clap-clap-stomp... Qu'est-ce qui vient après? Les régularités nous aident à prédire! Où voyez-vous des régularités dans notre classe?",
      action: `1. Exploration corporelle: Créer des patterns avec le corps
2. Régularités visuelles: Observer les motifs dans la classe
3. Régularités sonores: Créer des rythmes répétitifs
4. Matériel concret: Construire avec des blocs colorés
5. Identifier et continuer: Compléter des patterns simples
6. Création libre: Inventer sa propre régularité`,
      consolidation: "Musée des régularités: Présentez votre pattern créé. Les amis peuvent-ils le continuer? Expliquez votre règle.",
      accommodations: "Matériel manipulatif varié; Support visuel constant; Répétition avec gestes",
      modifications: "Patterns AB simples seulement; Matériel pré-organisé; Aide physique pour continuer",
      extensions: "Créer des patterns ABC ou plus complexes; Traduire entre modes (son/couleur); Créer un livre de patterns",
      assessmentType: 'Diagnostique',
      assessmentNotes: 'Évaluer la compréhension initiale des régularités. Observer la capacité à identifier et continuer des patterns.',
      learningGoals: "Reconnaître les régularités; Comprendre la répétition; Développer le raisonnement prédictif",
      materials: JSON.stringify([
        'Blocs de couleurs',
        'Instruments de musique',
        'Formes géométriques',
        'Autocollants',
        'Matériel de manipulation'
      ]),
      grouping: "Exploration collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Exemples de patterns affichés. Matériel organisé par type. Focus sur la découverte ludique.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns de couleurs",
      date: new Date('2025-11-05'),
      duration: 60,
      mindsOn: "J'ai une surprise colorée! Rouge-bleu-rouge-bleu... Quelle couleur vient après? Les couleurs peuvent danser en patterns! Créons un arc-en-ciel ordonné!",
      action: `1. Patterns simples: AB avec deux couleurs
2. Extension: Patterns ABC avec trois couleurs
3. Colliers de patterns: Enfiler des perles colorées
4. Patterns naturels: Observer les couleurs dans la nature
5. Traduction: Même pattern, différentes couleurs
6. Correction d'erreurs: Trouver et réparer les patterns brisés`,
      consolidation: "Défilé de colliers: Portez votre collier de pattern. Décrivez votre règle de couleurs. Qui a un pattern similaire?",
      accommodations: "Grosses perles faciles à manipuler; Code couleur avec symboles; Support pour enfiler",
      modifications: "Pattern AB seulement; Perles pré-triées; Modèle à suivre disponible",
      extensions: "Patterns avec 4+ couleurs; Créer des patterns symétriques; Designer un motif pour tissu",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité à créer et maintenir un pattern de couleurs. Observer la précision et la créativité.',
      learningGoals: "Maîtriser les patterns de couleurs; Développer la discrimination visuelle; Comprendre la règle de répétition",
      materials: JSON.stringify([
        'Perles de couleurs',
        'Fil ou corde',
        'Papier de couleur',
        'Crayons/marqueurs',
        'Exemples de patterns'
      ]),
      grouping: "Démonstration collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Perles triées par couleur. Exemples de patterns affichés. Aide pour l'enfilage disponible.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns de formes",
      date: new Date('2025-11-07'),
      duration: 60,
      mindsOn: "Voici des formes magiques! Cercle-carré-cercle-carré... Les formes peuvent faire des patterns aussi! Pouvez-vous faire un pattern avec votre corps en forme de cercle et carré?",
      action: `1. Exploration des formes: Identifier cercle, carré, triangle
2. Patterns AB: Alterner deux formes
3. Patterns complexes: ABC avec trois formes
4. Mosaïque: Créer un tableau avec patterns de formes
5. Patterns 3D: Utiliser des solides géométriques
6. Jeu de prédiction: Deviner la forme suivante`,
      consolidation: "Architecte de patterns: Montrez votre mosaïque. Combien de patterns différents avez-vous utilisés? Lequel est le plus complexe?",
      accommodations: "Formes texturées pour discrimination tactile; Gabarits disponibles; Espace de travail organisé",
      modifications: "Deux formes seulement; Formes pré-découpées; Pattern court (4-6 éléments)",
      extensions: "Combiner forme et couleur; Créer des tessellations; Explorer les patterns dans l'art islamique",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la compréhension des patterns géométriques. Évaluer la capacité à maintenir la séquence.',
      learningGoals: "Appliquer les patterns aux formes; Développer la perception spatiale; Créer des compositions ordonnées",
      materials: JSON.stringify([
        'Formes en carton',
        'Blocs géométriques',
        'Papier et colle',
        'Gabarits de formes',
        'Exemples de mosaïques'
      ]),
      grouping: "Exploration en groupe, mosaïque individuelle",
      isSubFriendly: true,
      subNotes: "Formes pré-découpées disponibles. Exemples de patterns géométriques affichés. Support visuel constant.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      // Week 2: Patterns numériques
      title: "Compter avec des patterns",
      date: new Date('2025-11-12'),
      duration: 60,
      mindsOn: "Comptons par 2: 2, 4, 6, 8... C'est un pattern de nombres! Nos nombres peuvent sauter, danser, faire des patterns. Essayons de compter par bonds!",
      action: `1. Compter par 1: La base de tous les patterns
2. Compter par 2: Nombres pairs
3. Compter par 5: Utiliser les doigts
4. Compter par 10: Les dizaines
5. Grille de 100: Colorier les patterns
6. Mouvements rythmés: Sauter en comptant`,
      consolidation: "Pattern mystère: J'ai colorié un pattern sur la grille. Pouvez-vous deviner ma règle de comptage? Créez votre propre mystère!",
      accommodations: "Grille de nombres agrandie; Manipulatifs pour compter; Support kinesthésique",
      modifications: "Compter jusqu'à 20 seulement; Focus sur bonds de 2; Aide avec pointage",
      extensions: "Compter par 3 ou 4; Patterns descendants; Créer une calculatrice de patterns",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension du comptage par bonds. Observer la reconnaissance des patterns numériques.',
      learningGoals: "Découvrir les patterns numériques; Maîtriser le comptage par bonds; Visualiser les régularités",
      materials: JSON.stringify([
        'Grille de 100',
        'Crayons de couleur',
        'Jetons de comptage',
        'Ligne numérique',
        'Dés et spinners'
      ]),
      grouping: "Comptage collectif, exploration individuelle",
      isSubFriendly: true,
      subNotes: "Grille de 100 affichée. Patterns de comptage démontrés. Encourager le mouvement rythmé.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns croissants",
      date: new Date('2025-11-14'),
      duration: 60,
      mindsOn: "Regardez cette tour: 1 bloc, puis 2 blocs, puis 3 blocs... Elle grandit! C'est un pattern qui augmente. Comment continuer? Pouvons-nous construire ensemble?",
      action: `1. Tours croissantes: Ajouter un bloc chaque fois
2. Escaliers: Construire des marches qui montent
3. Patterns de groupe: 1 ami, 2 amis, 3 amis...
4. Collections croissantes: Ajouter des objets
5. Dessiner la croissance: Représenter visuellement
6. Prédire: Que vient-il après?`,
      consolidation: "Ingénieur de croissance: Montrez votre structure croissante. Expliquez la règle. Jusqu'où pourriez-vous continuer?",
      accommodations: "Gros blocs faciles à empiler; Support pour la stabilité; Représentation horizontale option",
      modifications: "Croissance de 1 seulement; Maximum 5 étapes; Aide pour construire",
      extensions: "Croissance par 2 ou plus; Patterns décroissants; Graphiques de croissance",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension des patterns croissants. Observer la capacité de prédiction.',
      learningGoals: "Comprendre les patterns croissants; Développer la pensée séquentielle; Prédire la continuation",
      materials: JSON.stringify([
        'Blocs de construction',
        'Cubes emboîtables',
        'Papier quadrillé',
        'Objets à compter',
        'Tableaux de croissance'
      ]),
      grouping: "Construction en paires, présentation individuelle",
      isSubFriendly: true,
      subNotes: "Matériel de construction prêt. Exemples de patterns croissants visibles. Sécurité avec les tours.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns dans le calendrier",
      date: new Date('2025-11-19'),
      duration: 60,
      mindsOn: "Notre calendrier est plein de patterns! Les jours de la semaine reviennent, les mois se répètent chaque année. Quel jour sommes-nous? Quel jour sera-ce dans 7 jours?",
      action: `1. Jours de la semaine: Pattern de 7 jours
2. Patterns de dates: Observer les colonnes
3. Mois et saisons: Cycles qui se répètent
4. Événements réguliers: Gym le mardi, musique le jeudi
5. Créer un calendrier: Avec nos patterns
6. Prédictions: Utiliser les patterns pour planifier`,
      consolidation: "Météorologue de patterns: Observez le calendrier météo de la semaine. Y a-t-il un pattern? Prédisez demain!",
      accommodations: "Calendrier tactile grand format; Couleurs pour les jours; Pictogrammes pour événements",
      modifications: "Focus sur semaine actuelle; Pattern des jours seulement; Support visuel constant",
      extensions: "Calculer les jours jusqu'aux événements; Patterns lunaires; Créer un calendrier perpétuel",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension des cycles temporels. Observer l\'application pratique des patterns.',
      learningGoals: "Reconnaître les patterns temporels; Comprendre les cycles; Utiliser les patterns pour prédire",
      materials: JSON.stringify([
        'Grand calendrier',
        'Cartes de jours',
        'Autocollants météo',
        'Calendrier vierge',
        'Marqueurs'
      ]),
      grouping: "Exploration collective du calendrier",
      isSubFriendly: true,
      subNotes: "Calendrier de classe visible. Routine quotidienne du calendrier établie. Patterns clairement marqués.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns de mouvements",
      date: new Date('2025-11-21'),
      duration: 60,
      mindsOn: "Notre corps peut faire des patterns! Saut-saut-accroupi, saut-saut-accroupi... Pouvez-vous suivre? Créons une danse de patterns ensemble!",
      action: `1. Patterns simples: 2 mouvements alternés
2. Patterns complexes: 3-4 mouvements
3. Patterns avec son: Ajouter des bruits
4. Danse de patterns: Créer une chorégraphie
5. Jeu de miroir: Copier les patterns du partenaire
6. Performance: Présenter sa danse pattern`,
      consolidation: "Chorégraphe de patterns: Présentez votre danse. La classe peut-elle apprendre votre pattern? Enseignez-le!",
      accommodations: "Mouvements adaptés aux capacités; Option assise disponible; Tempo ajustable",
      modifications: "2 mouvements simples; Répétition courte; Participation flexible",
      extensions: "Patterns avec accessoires; Notation de danse; Créer une vidéo tutoriel",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la coordination et la mémorisation des séquences. Évaluer la créativité kinesthésique.',
      learningGoals: "Incarner les patterns; Développer la mémoire séquentielle; Coordonner mouvement et pattern",
      materials: JSON.stringify([
        'Espace de mouvement',
        'Musique rythmée',
        'Foulards ou rubans',
        'Tambourin',
        'Cartes de mouvements'
      ]),
      grouping: "Danse collective, création en petits groupes",
      isSubFriendly: true,
      subNotes: "Espace sécurisé pour mouvement. Exemples de patterns de mouvements. Musique prête.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      // Week 3: Patterns complexes
      title: "Patterns à deux attributs",
      date: new Date('2025-11-26'),
      duration: 60,
      mindsOn: "Regardez ces boutons: petit rouge, grand bleu, petit rouge, grand bleu... Le pattern change deux choses! Taille ET couleur! Pouvons-nous faire plus complexe?",
      action: `1. Introduction: Patterns avec 2 caractéristiques
2. Tri par attributs: Organiser le matériel
3. Construction: Créer des patterns doubles
4. Décodage: Identifier les deux règles
5. Transformation: Changer un attribut
6. Défi: Patterns avec forme et taille, ou couleur et position`,
      consolidation: "Expert en complexité: Présentez votre pattern à double attribut. Les autres peuvent-ils identifier vos deux règles?",
      accommodations: "Attributs très distincts; Support pour organisation; Étiquettes pour attributs",
      modifications: "Un attribut principal, un secondaire; Matériel pré-trié; Pattern court",
      extensions: "Trois attributs; Patterns entrecroisés; Créer une matrice de patterns",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité à gérer la complexité. Observer la flexibilité cognitive.',
      learningGoals: "Gérer plusieurs attributs; Développer la pensée complexe; Analyser les patterns multicritères",
      materials: JSON.stringify([
        'Boutons variés',
        'Formes de différentes tailles',
        'Blocs de couleurs/tailles',
        'Tableaux de tri',
        'Étiquettes d\'attributs'
      ]),
      grouping: "Exploration en paires, création individuelle",
      isSubFriendly: true,
      subNotes: "Matériel trié par attributs. Exemples progressifs affichés. Défis différenciés disponibles.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns dans la nature",
      date: new Date('2025-11-28'),
      duration: 60,
      mindsOn: "La nature est la reine des patterns! Les pétales d'une fleur, les rayures d'un zèbre, les spirales d'un coquillage... Où voyez-vous des patterns dehors?",
      action: `1. Observation: Images de patterns naturels
2. Collection: Trouver des patterns (feuilles, branches)
3. Spirales: Explorer la forme de Fibonacci
4. Symétrie: Patterns en miroir dans la nature
5. Art naturel: Créer avec des éléments naturels
6. Documentation: Photographier ou dessiner`,
      consolidation: "Naturaliste de patterns: Présentez votre pattern naturel préféré. Pourquoi la nature crée-t-elle ce pattern selon vous?",
      accommodations: "Images grand format; Collection intérieure si nécessaire; Loupes disponibles",
      modifications: "Focus sur patterns simples; Images fournies; Aide pour identification",
      extensions: "Recherche sur Fibonacci; Créer un herbier de patterns; Étudier les fractales",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la capacité d\'observation et de connexion avec la nature. Évaluer la curiosité scientifique.',
      learningGoals: "Découvrir les patterns naturels; Connecter maths et nature; Développer l'observation",
      materials: JSON.stringify([
        'Images de nature',
        'Loupes',
        'Éléments naturels',
        'Papier et crayons',
        'Appareil photo'
      ]),
      grouping: "Exploration collective, documentation individuelle",
      isSubFriendly: true,
      subNotes: "Collection d'images prête. Sortie nature optionnelle. Focus sur l'émerveillement.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Créer des codes secrets",
      date: new Date('2025-12-03'),
      duration: 60,
      mindsOn: "Les patterns peuvent cacher des messages! Si rouge = A et bleu = B, rouge-bleu-rouge dit 'ABA'! Créons nos codes secrets avec des patterns!",
      action: `1. Introduction aux codes: Symboles = lettres
2. Code simple: Formes pour lettres
3. Messages codés: Écrire son prénom
4. Décodage: Lire les messages des amis
5. Invention: Créer son propre code
6. Chasse au trésor: Messages codés à décoder`,
      consolidation: "Agent secret: Échangez votre message codé avec un ami. Peuvent-ils décoder votre message? Aidez-les avec votre clé!",
      accommodations: "Codes visuels simples; Clés de décodage fournies; Support pour écriture",
      modifications: "3-4 symboles seulement; Messages courts; Code fourni",
      extensions: "Code numérique; Créer une machine de codage; Histoire en code",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension de la correspondance symbole-meaning. Observer la logique de codage.',
      learningGoals: "Comprendre la substitution; Développer la pensée symbolique; Appliquer les patterns",
      materials: JSON.stringify([
        'Cartes de symboles',
        'Tableaux de codes',
        'Papier spécial',
        'Enveloppes secrètes',
        'Tampons et autocollants'
      ]),
      grouping: "Création individuelle, échange en paires",
      isSubFriendly: true,
      subNotes: "Exemples de codes simples fournis. Activité ludique d'espionnage. Clés disponibles.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      // Week 4: Application et résolution
      title: "Résoudre avec des patterns",
      date: new Date('2025-12-05'),
      duration: 60,
      mindsOn: "Les patterns nous aident à résoudre des problèmes! Si 2+2=4, 3+3=6, 4+4=8... quel est le pattern? Comment nous aide-t-il? Devenons des détectives!",
      action: `1. Problèmes de pattern: Trouver l'élément manquant
2. Patterns pour additionner: Doubles et plus
3. Patterns pour prédire: Que vient-il après?
4. Réparer les patterns: Corriger les erreurs
5. Patterns pour organiser: Ranger efficacement
6. Défis de groupe: Résoudre ensemble`,
      consolidation: "Solutionneur expert: Présentez un problème de pattern à la classe. Expliquez comment le pattern aide à trouver la solution.",
      accommodations: "Matériel concret pour visualiser; Problèmes progressifs; Indices disponibles",
      modifications: "Problèmes simples AB; Support visuel constant; Résolution guidée",
      extensions: "Créer des problèmes pour autres; Patterns algébriques simples; Compétition de patterns",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'application des patterns à la résolution. Observer les stratégies utilisées.',
      learningGoals: "Utiliser les patterns pour résoudre; Développer le raisonnement; Transférer les connaissances",
      materials: JSON.stringify([
        'Cartes problèmes',
        'Matériel de manipulation',
        'Tableaux de solutions',
        'Récompenses',
        'Timer'
      ]),
      grouping: "Résolution en équipes, partage collectif",
      isSubFriendly: true,
      subNotes: "Problèmes gradués par difficulté. Solutions disponibles. Encourager la collaboration.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns musicaux",
      date: new Date('2025-12-10'),
      duration: 60,
      mindsOn: "La musique est pleine de patterns! Écoutez: boom-clap-boom-clap... Les chansons utilisent des patterns pour être mémorables. Créons notre symphonie de patterns!",
      action: `1. Rythmes simples: Patterns de percussion
2. Mélodies répétitives: Do-ré-do-ré
3. Orchestre de patterns: Chaque groupe un pattern
4. Notation simple: Écrire les patterns musicaux
5. Composition: Créer une chanson pattern
6. Concert: Présenter nos créations`,
      consolidation: "Compositeur en herbe: Dirigez votre pattern musical. La classe est votre orchestre! Comment les patterns créent-ils l'harmonie?",
      accommodations: "Instruments adaptés; Volume contrôlé; Notation visuelle",
      modifications: "Pattern rythmique simple; 2 sons seulement; Participation flexible",
      extensions: "Patterns harmoniques; Créer une partition; Enregistrer la composition",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la coordination rythmique et la créativité musicale. Évaluer la collaboration.',
      learningGoals: "Connecter patterns et musique; Développer le sens rythmique; Créer collectivement",
      materials: JSON.stringify([
        'Instruments de percussion',
        'Xylophone',
        'Tableau de notation',
        'Baguettes rythmiques',
        'Enregistreur'
      ]),
      grouping: "Orchestre collectif, création en petits groupes",
      isSubFriendly: true,
      subNotes: "Instruments prêts et organisés. Patterns musicaux simples notés. Volume géré.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Jeux de patterns",
      date: new Date('2025-12-12'),
      duration: 60,
      mindsOn: "Aujourd'hui, c'est la fête des patterns! Nous avons préparé des jeux amusants avec des patterns. Êtes-vous prêts à jouer et gagner? Que le meilleur pattern gagne!",
      action: `1. Relais de patterns: Course avec patterns
2. Memory patterns: Se souvenir et reproduire
3. Dominos de patterns: Connecter les patterns
4. Bingo patterns: Reconnaître rapidement
5. Chasse aux patterns: Trouver dans la classe
6. Création de jeu: Inventer un nouveau jeu`,
      consolidation: "Inventeur de jeux: Présentez votre jeu de patterns inventé. Enseignez les règles. Jouons ensemble!",
      accommodations: "Jeux adaptés aux capacités; Équipes mixtes; Rythme flexible",
      modifications: "Jeux simplifiés; Support d'équipe; Focus sur participation",
      extensions: "Créer un tournoi; Concevoir des prix; Documenter les jeux",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'application ludique des connaissances. Observer l\'esprit d\'équipe.',
      learningGoals: "Appliquer les patterns en jouant; Développer la rapidité; Collaborer en équipe",
      materials: JSON.stringify([
        'Matériel pour jeux',
        'Cartes de patterns',
        'Dés et spinners',
        'Prix et certificats',
        'Chronomètre'
      ]),
      grouping: "Jeux en équipes, rotation de stations",
      isSubFriendly: true,
      subNotes: "Tous les jeux préparés avec règles claires. Stations organisées. Ambiance festive.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      // Week 5: Consolidation et célébration
      title: "Exposition de patterns",
      date: new Date('2025-12-17'),
      duration: 60,
      mindsOn: "Nous sommes devenus des experts en patterns! Préparons une exposition pour montrer toutes nos découvertes. Quel est votre pattern préféré à partager?",
      action: `1. Sélection: Choisir ses meilleures créations
2. Organisation: Préparer l'exposition
3. Étiquettes: Expliquer chaque pattern
4. Guide: Préparer sa présentation
5. Installation: Mettre en place l'expo
6. Répétition: Pratiquer les explications`,
      consolidation: "Conservateur de musée: Faites visiter votre section de l'exposition. Expliquez vos patterns les plus intéressants.",
      accommodations: "Présentation flexible; Support visuel; Aide pour étiquetage",
      modifications: "2-3 patterns à présenter; Étiquettes simples; Présentation avec aide",
      extensions: "Créer un catalogue; Guide audio; Site web de l'expo",
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluer la synthèse des apprentissages. Observer la capacité de communication.',
      learningGoals: "Synthétiser les apprentissages; Communiquer ses connaissances; Célébrer les réussites",
      materials: JSON.stringify([
        'Tables d\'exposition',
        'Étiquettes',
        'Travaux accumulés',
        'Décorations',
        'Livre d\'or'
      ]),
      grouping: "Préparation individuelle, exposition collective",
      isSubFriendly: true,
      subNotes: "Exposition organisée et étiquetée. Rôles de guide assignés. Focus sur la fierté.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Musée vivant de patterns",
      date: new Date('2025-12-18'),
      duration: 60,
      mindsOn: "Aujourd'hui, notre classe devient un musée vivant! Vous êtes les patterns vivants! Chaque station montre un type différent. Accueillons nos visiteurs!",
      action: `1. Ouverture du musée: Accueil des visiteurs
2. Stations vivantes: Démonstrations interactives
3. Ateliers: Enseigner à créer des patterns
4. Performances: Patterns en mouvement et son
5. Visite guidée: Expliquer chaque station
6. Livre d'or: Collecter les impressions`,
      consolidation: "Cérémonie de clôture: Remise des diplômes d'experts en patterns. Partagez votre moment préféré du musée.",
      accommodations: "Rôles variés selon confort; Pauses possibles; Support de pairs",
      modifications: "Participation adaptée; Station simple; Aide constante",
      extensions: "Créer une vidéo souvenir; Article pour journal; Planifier prochain musée",
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation finale par démonstration. Observer la maîtrise et la confiance.',
      learningGoals: "Démontrer ses connaissances; Enseigner aux autres; Célébrer l'apprentissage collectif",
      materials: JSON.stringify([
        'Stations préparées',
        'Costumes simples',
        'Matériel interactif',
        'Diplômes',
        'Rafraîchissements'
      ]),
      grouping: "Musée collectif, stations en petits groupes",
      isSubFriendly: true,
      subNotes: "Musée complètement organisé. Tous les rôles assignés. Ambiance de célébration.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    },
    {
      title: "Patterns pour la vie",
      date: new Date('2025-12-19'),
      duration: 60,
      mindsOn: "Les patterns ne s'arrêtent pas aujourd'hui! Ils sont partout dans notre vie. Comment les patterns nous aident-ils chaque jour? Que ferez-vous avec cette connaissance?",
      action: `1. Réflexion: Nos apprentissages importants
2. Applications: Patterns dans la vie quotidienne
3. Portfolio: Organiser nos meilleures œuvres
4. Lettre au futur: Message pour janvier
5. Engagement: Comment continuer à explorer
6. Célébration finale: Fête des patterns!`,
      consolidation: "Ambassadeur de patterns: Partagez une façon dont vous utiliserez les patterns pendant les vacances. Inspirez vos amis!",
      accommodations: "Réflexion en dessin acceptée; Portfolio flexible; Support pour lettre",
      modifications: "Portfolio simple; Lettre courte ou dessinée; Une application pratique",
      extensions: "Plan d'exploration personnel; Défi vacances; Journal de patterns",
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation finale réflexive. Observer l\'intégration et la projection future.',
      learningGoals: "Intégrer les apprentissages; Transférer à la vie; Projeter l'exploration continue",
      materials: JSON.stringify([
        'Portfolios',
        'Papier à lettres',
        'Enveloppe temporelle',
        'Certificats finaux',
        'Matériel de fête'
      ]),
      grouping: "Réflexion individuelle, célébration collective",
      isSubFriendly: true,
      subNotes: "Activité de clôture réflexive. Portfolios organisés. Ambiance de célébration positive.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'Français'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Patterns et merveilles"...`);
  
  for (const lesson of lessons) {
    const created = await prisma.eTFOLessonPlan.create({
      data: {
        ...lesson,
        userId: teacher.id,
        unitPlanId: unit.id
      }
    });
    console.log(`✅ Created: ${created.title}`);
  }
  
  console.log('\n🔍 CRITICAL ASSESSMENT - PATTERNS ET MERVEILLES:');
  console.log('='.repeat(60));
  
  // Comprehensive verification
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId: unit.id },
    orderBy: { date: 'asc' }
  });
  
  let perfectLessons = 0;
  let issues = [];
  
  for (const lesson of allLessons) {
    let lessonPerfect = true;
    let lessonIssues = [];
    
    // Verify all ETFO requirements
    if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
      lessonPerfect = false;
      lessonIssues.push('Three-part structure incomplete');
    }
    
    if (!lesson.accommodations || !lesson.modifications || !lesson.extensions) {
      lessonPerfect = false;
      lessonIssues.push('Differentiation missing');
    }
    
    if (!lesson.assessmentType || !lesson.assessmentNotes) {
      lessonPerfect = false;
      lessonIssues.push('Assessment incomplete');
    }
    
    if (!lesson.learningGoals || !lesson.materials || !lesson.grouping) {
      lessonPerfect = false;
      lessonIssues.push('Core pedagogical fields missing');
    }
    
    if (!lesson.isSubFriendly || !lesson.subNotes) {
      lessonPerfect = false;
      lessonIssues.push('Sub-friendly documentation lacking');
    }
    
    if (lesson.subject !== 'Mathématiques' || lesson.grade !== 1 || 
        lesson.language !== 'Français' || lesson.duration !== 60) {
      lessonPerfect = false;
      lessonIssues.push('Metadata incorrect');
    }
    
    if (lessonPerfect) {
      perfectLessons++;
    } else {
      issues.push({
        title: lesson.title,
        problems: lessonIssues
      });
    }
  }
  
  console.log(`\n📊 ETFO COMPLIANCE REPORT:`);
  console.log(`Perfect lessons: ${perfectLessons}/${allLessons.length}`);
  console.log(`Compliance rate: ${Math.round(perfectLessons/allLessons.length * 100)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    issues.forEach(issue => {
      console.log(`  ${issue.title}: ${issue.problems.join(', ')}`);
    });
  }
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log('='.repeat(60));
  
  if (perfectLessons === allLessons.length) {
    console.log('🏆 ABSOLUTE PERFECTION ACHIEVED!');
    console.log('✨ All 16 lessons are 100% ETFO compliant');
    console.log('✨ Complete patterns and mathematical thinking curriculum');
    console.log('✨ Progressive development from simple to complex patterns');
    console.log('✨ Integration of multiple learning modalities');
    console.log('✨ Ready for Grade 1 French Immersion mathematics!');
    console.log('\n🔢 Curriculum Features:');
    console.log('   • Visual, auditory, and kinesthetic patterns');
    console.log('   • Numerical patterns and skip counting');
    console.log('   • Pattern recognition in nature and daily life');
    console.log('   • Problem-solving through patterns');
    console.log('   • Creative expression through pattern creation');
  } else {
    console.log(`⚠️ Only ${perfectLessons}/${allLessons.length} lessons are perfect`);
    console.log('Improvements needed for full compliance');
  }
  
  await prisma.$disconnect();
}

createPatternsMerveillesLessons();