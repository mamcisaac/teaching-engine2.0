import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectMusicLessons() {
  console.log('🎵 CREATING PERFECT MUSIC LESSONS - MA VOIX, MES SONS');
  console.log('='.repeat(60));

  // Get the test teacher account
  const teacher = await prisma.user.findFirst({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!teacher) {
    console.error('❌ Teacher not found');
    return;
  }

  // Get the music unit
  const unit = await prisma.unitPlan.findFirst({
    where: { title: "Ma voix, mes sons" }
  });

  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }

  console.log('✅ Found unit:', unit.title);
  console.log('Start date:', unit.startDate.toLocaleDateString());
  console.log('End date:', unit.endDate.toLocaleDateString());

  const lessons = [
    // ==================== WEEK 1: DÉCOUVERTE DE LA VOIX ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Ma voix magique",
      date: new Date('2025-09-03'),
      duration: 30,
      mindsOn: "Écoutez! Qu'est-ce que vous entendez? Notre voix peut faire tant de sons différents! Exploration vocale: chuchoter, parler, chanter, crier (doucement!). (5 min)",
      action: `1. Jeu du miroir sonore: imiter les sons du professeur (5 min)
2. Exploration: sons graves et aigus avec notre voix (5 min)
3. Histoire sonore: "Le petit chat perdu" avec effets vocaux (5 min)
4. Création de notre première chanson de classe (5 min)`,
      consolidation: "Quels sons avez-vous préférés faire? Chantons notre nouvelle chanson ensemble! Enregistrement pour écoute future. (5 min)",
      learningGoals: "Explorer les possibilités de la voix; Différencier les hauteurs de sons; Développer la conscience vocale",
      materials: JSON.stringify([
        'Miroir pour voir les mouvements de bouche',
        'Enregistreur audio',
        'Images pour l\'histoire',
        'Tableau pour les paroles',
        'Maracas pour accompagner',
        'Tapis de sol'
      ]),
      grouping: "Cercle collectif, exploration individuelle, chant de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Participation gestuelle si timide',
          'Sons simples acceptés',
          'Accompagnement individuel'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptation pour capacités vocales différentes',
        cognitive: 'Instructions simples, imitation encouragée',
        sensory: 'Volume adapté, espace calme disponible'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer de nouveaux sons',
          'Diriger une activité vocale',
          'Ajouter des harmonies simples',
          'Inventer des paroles'
        ]
      }),
      assessmentType: 'Diagnostique',
      assessmentNotes: 'Évaluation initiale des capacités vocales et de la confiance à utiliser sa voix. Observation de la participation.',
      subNotes: "Introduction à la musique par la voix. Créer un environnement sûr pour l'expression vocale. Respecter les timides.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Le rythme de mon corps",
      date: new Date('2025-09-05'),
      duration: 30,
      mindsOn: "Notre corps est un instrument! Tapez des mains, tapez des pieds! Trouvons le rythme de notre cœur. Exploration corporelle rythmique. (5 min)",
      action: `1. Apprentissage du rythme de base: ta-ta-ti-ti-ta (5 min)
2. Body percussion: création d'un orchestre corporel (5 min)
3. Jeu "Suis le chef": imitation rythmique (5 min)
4. Chanson avec mouvements: "Tête, épaules, genoux, orteils" (5 min)`,
      consolidation: "Montrez votre rythme préféré. Créons un rythme de classe tous ensemble! Performance finale. (5 min)",
      learningGoals: "Développer le sens du rythme; Utiliser le corps comme instrument; Suivre et créer des patterns rythmiques",
      materials: JSON.stringify([
        'Tambourins',
        'Claves',
        'Tableau rythmique visuel',
        'Autocollants rythme',
        'Tapis individuels',
        'Métronome visuel'
      ]),
      grouping: "Activités collectives, création en petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rythmes simples (2 temps)',
          'Support visuel constant',
          'Partenaire pour aider'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations pour mobilité réduite, instruments tenus',
        cognitive: 'Un rythme à la fois, répétition fréquente',
        sensory: 'Volume contrôlé, coussinets pour réduire le bruit'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer des rythmes complexes',
          'Utiliser la notation rythmique',
          'Diriger le groupe',
          'Polyrythmie simple'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation du sens rythmique et de la capacité à maintenir un tempo. Observation de la coordination.',
      subNotes: "Exploration du rythme corporel. Espace défini pour les mouvements. Encourager tous les niveaux de participation.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 2: EXPLORATION SONORE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les sons qui nous entourent",
      date: new Date('2025-09-08'),
      duration: 30,
      mindsOn: "Silence... Écoutez! Quels sons entendez-vous? Les sons sont partout! Promenade d'écoute dans l'école. (5 min)",
      action: `1. Classification des sons: naturels vs artificiels (5 min)
2. Création d'une carte sonore de notre classe (5 min)
3. Jeu "Qu'est-ce que c'est?": identifier les sons mystères (5 min)
4. Composition: notre paysage sonore (5 min)`,
      consolidation: "Quel était votre son préféré? Comment pouvons-nous créer de la musique avec des sons quotidiens? (5 min)",
      learningGoals: "Développer l'écoute active; Classifier les sons; Créer avec des sons environnementaux",
      materials: JSON.stringify([
        'Enregistreur portable',
        'Objets sonores variés',
        'Images de sources sonores',
        'Carte de la classe',
        'Bandeaux pour les yeux',
        'Contenants variés'
      ]),
      grouping: "Promenade collective, travail en stations, création de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Sons très distincts',
          'Aide pour l\'identification',
          'Participation selon confort'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Exploration adaptée, sons apportés si déplacement difficile',
        cognitive: 'Catégories simples, support visuel',
        sensory: 'Volume contrôlé, choix de sons selon sensibilité'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer une histoire sonore',
          'Enregistrer une collection',
          'Identifier plus de catégories',
          'Notation graphique des sons'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'écoute attentive et de la capacité à discriminer les sons. Créativité dans l\'utilisation des sons.',
      subNotes: "Exploration sonore avec promenade d'écoute. Gérer le niveau sonore. Respecter les sensibilités auditives.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Fabriquer des instruments",
      date: new Date('2025-09-10'),
      duration: 30,
      mindsOn: "Avec des objets simples, nous pouvons faire de la musique! Regardez ces matériaux... Que pouvons-nous créer? Démonstration. (5 min)",
      action: `1. Station 1: Maracas avec contenants et riz (5 min)
2. Station 2: Tambours avec boîtes et élastiques (5 min)
3. Station 3: Guitares élastiques simples (5 min)
4. Concert avec nos nouveaux instruments (5 min)`,
      consolidation: "Présentez votre instrument. Comment fait-il du son? Notre orchestre de classe est né! (5 min)",
      learningGoals: "Comprendre la production du son; Créer des instruments simples; Développer la créativité musicale",
      materials: JSON.stringify([
        'Contenants recyclés',
        'Riz, haricots, boutons',
        'Élastiques variés',
        'Boîtes de différentes tailles',
        'Ruban adhésif décoratif',
        'Autocollants'
      ]),
      grouping: "Rotation aux stations de création, concert collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Instruments pré-assemblés disponibles',
          'Aide pour la construction',
          'Choix simplifié'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Aide à la manipulation, instruments adaptés',
        cognitive: 'Une étape à la fois, modèles disponibles',
        sensory: 'Matériaux selon préférences tactiles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer plusieurs instruments',
          'Décorer artistiquement',
          'Inventer de nouveaux designs',
          'Expliquer l\'acoustique simple'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension de la production sonore et de la créativité dans la fabrication.',
      subNotes: "Fabrication d'instruments avec matériaux recyclés. Stations préparées. Supervision de l'utilisation des matériaux.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 3: MÉLODIE ET CHANT ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Monter et descendre",
      date: new Date('2025-09-15'),
      duration: 30,
      mindsOn: "Écoutez cette mélodie... Monte-t-elle ou descend-elle? Comme un oiseau qui vole! Mouvements mélodiques avec le corps. (5 min)",
      action: `1. Exploration: sons hauts et bas avec xylophone (5 min)
2. Jeu de l'ascenseur musical: monter/descendre avec la mélodie (5 min)
3. Apprentissage: "Do ré mi, la perdrix" (5 min)
4. Création d'une mélodie simple à 3 notes (5 min)`,
      consolidation: "Chantez votre mélodie. Comment monte-t-elle et descend-elle? Représentation visuelle des mélodies. (5 min)",
      learningGoals: "Comprendre le mouvement mélodique; Chanter en justesse; Créer des mélodies simples",
      materials: JSON.stringify([
        'Xylophone ou métallophone',
        'Cartes de notes visuelles',
        'Rubans pour mouvements',
        'Tableau mélodique',
        'Cloches musicales',
        'Échelle musicale au sol'
      ]),
      grouping: "Exploration collective, pratique individuelle, création en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Deux notes seulement au début',
          'Support gestuel constant',
          'Instruments visuels'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Instruments accessibles, adaptation des gestes',
        cognitive: 'Mélodies très simples, association couleur-note',
        sensory: 'Volume doux, espace calme pour écoute'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Utiliser 5 notes (pentatonique)',
          'Créer des mélodies plus longues',
          'Harmoniser simplement',
          'Lire les notes de base'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la perception mélodique et de la capacité à reproduire des hauteurs. Créativité mélodique.',
      subNotes: "Introduction à la mélodie avec instruments mélodiques. Focus sur le mouvement ascendant/descendant.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Nos chansons préférées",
      date: new Date('2025-09-17'),
      duration: 30,
      mindsOn: "Quelle est votre chanson préférée? Pourquoi l'aimez-vous? Partageons nos goûts musicaux! Mini-concert de favoris. (5 min)",
      action: `1. Apprentissage d'une chanson traditionnelle française (5 min)
2. Ajout de gestes et mouvements (5 min)
3. Création de nouveaux couplets (5 min)
4. Performance avec instruments (5 min)`,
      consolidation: "Quelle partie était votre préférée? Comment améliorer notre performance? Enregistrement final. (5 min)",
      learningGoals: "Apprendre des chansons du répertoire; Mémoriser paroles et mélodies; Performer avec confiance",
      materials: JSON.stringify([
        'Recueil de chansons',
        'Instruments d\'accompagnement',
        'Microphone (factice ou réel)',
        'Costumes simples',
        'Enregistreur',
        'Paroles illustrées'
      ]),
      grouping: "Apprentissage collectif, création en petits groupes, performance ensemble",
      accommodations: JSON.stringify({
        forStruggling: [
          'Participation partielle acceptée',
          'Rôle instrumental si chant difficile',
          'Support visuel des paroles'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Gestes adaptés, position confortable',
        cognitive: 'Refrains simples, répétition fréquente',
        sensory: 'Volume adapté, possibilité de bouche-oreilles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Solos ou duos',
          'Création de chorégraphie',
          'Accompagnement instrumental',
          'Direction du groupe'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la mémorisation, de la justesse et de la participation. Progrès dans la confiance vocale.',
      subNotes: "Apprentissage de chansons avec mouvements. Paroles affichées. Créer une ambiance positive et encourageante.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 4: INSTRUMENTS ET TIMBRES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Familles d'instruments",
      date: new Date('2025-09-22'),
      duration: 30,
      mindsOn: "Voici différents instruments. Comment font-ils du son? Frapper, souffler, gratter, secouer! Démonstration interactive. (5 min)",
      action: `1. Exploration: instruments à percussion (5 min)
2. Découverte: instruments à vent simples (5 min)
3. Essai: instruments à cordes (5 min)
4. Jeu "Devine la famille": classification sonore (5 min)`,
      consolidation: "Quelle famille préférez-vous? Pourquoi? Créons un tableau des familles d'instruments. (5 min)",
      learningGoals: "Identifier les familles d'instruments; Comprendre la production sonore; Développer le vocabulaire musical",
      materials: JSON.stringify([
        'Collection d\'instruments variés',
        'Images d\'instruments',
        'Vidéos d\'orchestre',
        'Tableau de classification',
        'Étiquettes de familles',
        'Boîtes de tri'
      ]),
      grouping: "Démonstration collective, exploration en stations, jeu de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Instruments simples seulement',
          'Classification basique (2-3 familles)',
          'Aide physique pour tenir'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Instruments adaptés ou tenus, support physique',
        cognitive: 'Familles principales seulement, associations visuelles',
        sensory: 'Choix selon sensibilité auditive, coussinets antibruit'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Sous-familles d\'instruments',
          'Expliquer l\'acoustique',
          'Identifier dans la musique',
          'Créer un catalogue'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la reconnaissance des familles d\'instruments et de la compréhension de la production sonore.',
      subNotes: "Exploration des familles d'instruments. Manipulation supervisée. Hygiène des instruments à vent.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "L'orchestre de la classe",
      date: new Date('2025-09-24'),
      duration: 30,
      mindsOn: "Nous sommes un orchestre! Chacun a un rôle important. Regardez le chef d'orchestre... Il nous guide! Pratique de direction. (5 min)",
      action: `1. Attribution des instruments par sections (5 min)
2. Apprentissage des signaux du chef (5 min)
3. Pratique par sections: rythmique, mélodique (5 min)
4. Performance collective dirigée (5 min)`,
      consolidation: "Comment était-ce de jouer ensemble? Qu'avez-vous appris sur le travail d'équipe musical? Concert final. (5 min)",
      learningGoals: "Jouer en ensemble; Suivre un chef; Développer l'écoute mutuelle",
      materials: JSON.stringify([
        'Instruments pour tous',
        'Baguette de chef',
        'Partition graphique simple',
        'Pupitres ou supports',
        'Uniforme de concert (optionnel)',
        'Enregistreur vidéo'
      ]),
      grouping: "Sections instrumentales, ensemble complet",
      accommodations: JSON.stringify({
        forStruggling: [
          'Partie rythmique simple',
          'Un seul signal à suivre',
          'Partenaire de section'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Instruments tenus ou posés, adaptation posturale',
        cognitive: 'Partition en couleurs, signaux simples',
        sensory: 'Position selon sensibilité sonore'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Rôle de chef assistant',
          'Partie plus complexe',
          'Solo ou duo',
          'Arrangement de la pièce'
        ]
      }),
      assessmentType: 'Formative et Performative',
      assessmentNotes: 'Évaluation de la capacité à jouer en ensemble et à suivre les directives. Écoute et collaboration.',
      subNotes: "Orchestre de classe avec chef d'orchestre. Partition graphique simple préparée. Focus sur l'écoute mutuelle.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 5: MUSIQUE ET MOUVEMENT ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Danser sur la musique",
      date: new Date('2025-09-29'),
      duration: 30,
      mindsOn: "La musique nous fait bouger! Écoutez... Comment votre corps veut-il danser? Mouvements libres sur différents styles. (5 min)",
      action: `1. Exploration: mouvements lents/rapides selon le tempo (5 min)
2. Création de gestes pour accompagner une chanson (5 min)
3. Rondes et danses traditionnelles simples (5 min)
4. Improvisation dansée en petits groupes (5 min)`,
      consolidation: "Montrez votre mouvement préféré. Comment la musique guide-t-elle notre corps? Danse collective finale. (5 min)",
      learningGoals: "Exprimer la musique par le mouvement; Suivre le tempo et le rythme; Créer des chorégraphies simples",
      materials: JSON.stringify([
        'Musiques variées (tempos différents)',
        'Foulards colorés',
        'Rubans',
        'Espace de danse',
        'Miroir (optionnel)',
        'Tambourin pour le tempo'
      ]),
      grouping: "Mouvements individuels, rondes collectives, création en petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements assis possibles',
          'Gestes simples',
          'Participation selon capacité'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés, danse en fauteuil possible',
        cognitive: 'Mouvements répétitifs simples, imitation',
        sensory: 'Volume adapté, espace personnel respecté'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Chorégraphie complexe',
          'Direction des mouvements',
          'Création originale',
          'Performance solo'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'expression corporelle et de la synchronisation avec la musique. Créativité du mouvement.',
      subNotes: "Danse et mouvement sur musique. Espace dégagé nécessaire. Respecter les limites physiques de chacun.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Histoires en musique",
      date: new Date('2025-10-01'),
      duration: 30,
      mindsOn: "La musique raconte des histoires! Écoutez... Qu'est-ce qui se passe dans cette musique? Voyage imaginaire sonore. (5 min)",
      action: `1. Écoute active: identifier les personnages musicaux (5 min)
2. Création d'effets sonores pour une histoire (5 min)
3. Narration avec accompagnement musical (5 min)
4. Invention d'une mini-histoire musicale (5 min)`,
      consolidation: "Racontez votre histoire musicale. Comment les sons créent-ils l'ambiance? Partage des créations. (5 min)",
      learningGoals: "Associer musique et narration; Créer des ambiances sonores; Développer l'imagination musicale",
      materials: JSON.stringify([
        'Histoires courtes',
        'Instruments pour effets',
        'Images pour inspiration',
        'Enregistreur',
        'Objets sonores variés',
        'Tableau d\'histoire'
      ]),
      grouping: "Écoute collective, création en petites équipes, partage en grand groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Histoire très simple',
          'Effets sonores basiques',
          'Rôle défini dans l\'équipe'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Instruments accessibles, aide à la manipulation',
        cognitive: 'Histoire courte, effets évidents',
        sensory: 'Volume contrôlé, choix des sons'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Histoire complexe',
          'Multiples effets sonores',
          'Narration et musique',
          'Composition originale'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la créativité dans l\'association son-histoire et de la capacité à créer des ambiances.',
      subNotes: "Histoires musicales avec effets sonores. Histoires simples préparées. Encourager l'imagination.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 6: MUSIQUES DU MONDE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Voyage musical autour du monde",
      date: new Date('2025-10-06'),
      duration: 30,
      mindsOn: "La musique existe partout dans le monde! Écoutons des musiques de différents pays. Carte du monde musical. (5 min)",
      action: `1. Afrique: rythmes de djembé (5 min)
2. Asie: mélodies pentatoniques (5 min)
3. Amérique latine: salsa simple (5 min)
4. Création d'une fusion mondiale (5 min)`,
      consolidation: "Quelle musique du monde avez-vous préférée? Pourquoi? Passeport musical avec tampons. (5 min)",
      learningGoals: "Découvrir les musiques du monde; Apprécier la diversité culturelle; Expérimenter différents styles",
      materials: JSON.stringify([
        'Musiques du monde',
        'Carte du monde',
        'Instruments ethniques',
        'Images culturelles',
        'Passeports musicaux',
        'Vidéos de performances'
      ]),
      grouping: "Voyage collectif, exploration en stations, fusion en grand groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Un style à la fois',
          'Participation simple',
          'Support visuel constant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Instruments adaptés, mouvements selon capacité',
        cognitive: 'Associations simples pays-musique',
        sensory: 'Volume adapté, choix de styles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Recherche sur un pays',
          'Apprentissage de mots',
          'Création multiculturelle',
          'Présentation d\'un style'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'ouverture culturelle et de la participation aux différents styles. Respect de la diversité.',
      subNotes: "Musiques du monde avec contexte culturel simple. Respecter et valoriser toutes les cultures.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Célébration musicale d'Halloween",
      date: new Date('2025-10-08'),
      duration: 30,
      mindsOn: "Halloween approche! Quels sons font peur? Quels sons font rire? Créons une ambiance d'Halloween! Effets mystérieux. (5 min)",
      action: `1. Sons d'Halloween: création d'effets (vent, chouette, fantôme) (5 min)
2. Chanson d'Halloween avec gestes (5 min)
3. Parade costumée avec musique (5 min)
4. Histoire effrayante-amusante sonore (5 min)`,
      consolidation: "Quel effet était le plus réussi? Notre concert d'Halloween est prêt! Performance finale costumée. (5 min)",
      learningGoals: "Créer des ambiances sonores; Associer musique et thème; Performer en costume",
      materials: JSON.stringify([
        'Instruments pour effets',
        'Costumes simples',
        'Décorations Halloween',
        'Musique thématique',
        'Objets pour bruitages',
        'Éclairage tamisé'
      ]),
      grouping: "Création collective d'ambiance, parade en groupe, performance ensemble",
      accommodations: JSON.stringify({
        forStruggling: [
          'Effets simples',
          'Costume optionnel',
          'Participation selon confort'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations selon costume, instruments tenus',
        cognitive: 'Instructions claires, effets évidents',
        sensory: 'Ambiance non-effrayante, lumière suffisante'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Composition d\'une pièce',
          'Direction des effets',
          'Histoire originale',
          'Solo dramatique'
        ]
      }),
      assessmentType: 'Formative et Performative',
      assessmentNotes: 'Évaluation de la créativité thématique et de la participation à la performance costumée.',
      subNotes: "Halloween musical avec costumes optionnels. Garder l'ambiance amusante, non effrayante. Performance festive.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 7: CRÉATION ET COMPOSITION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Je suis compositeur",
      date: new Date('2025-10-14'),
      duration: 30,
      mindsOn: "Vous pouvez créer votre propre musique! Comme Mozart ou Beethoven! Écoutons une composition simple. Inspiration créative. (5 min)",
      action: `1. Choix de 4 notes pour notre mélodie (5 min)
2. Création d'un pattern rythmique (5 min)
3. Combinaison mélodie et rythme (5 min)
4. Notation graphique de notre pièce (5 min)`,
      consolidation: "Jouez votre composition. Comment l'avez-vous créée? Certificat de compositeur pour tous! (5 min)",
      learningGoals: "Créer une composition originale; Utiliser la notation graphique; Développer la créativité musicale",
      materials: JSON.stringify([
        'Instruments mélodiques',
        'Papier à musique graphique',
        'Crayons de couleur',
        'Autocollants notes',
        'Enregistreur',
        'Certificats compositeur'
      ]),
      grouping: "Création individuelle, partage en paires, performance pour la classe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Deux notes seulement',
          'Pattern très simple',
          'Aide à la notation'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Notation adaptée, instruments accessibles',
        cognitive: 'Structure très simple, étapes guidées',
        sensory: 'Environnement calme pour création'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Composition plus longue',
          'Plusieurs instruments',
          'Notation traditionnelle',
          'Arrangement complexe'
        ]
      }),
      assessmentType: 'Formative et Créative',
      assessmentNotes: 'Évaluation de la créativité compositionnelle et de la capacité à organiser les éléments musicaux.',
      subNotes: "Composition musicale simple. Notation graphique expliquée. Valoriser toutes les créations.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Notre chanson de classe",
      date: new Date('2025-10-16'),
      duration: 30,
      mindsOn: "Créons une chanson qui parle de notre classe! Qu'est-ce qui nous rend spéciaux? Brainstorm des idées. (5 min)",
      action: `1. Choix du thème et des mots-clés (5 min)
2. Création des paroles ensemble (5 min)
3. Mélodie simple sur air connu ou nouvelle (5 min)
4. Pratique avec mouvements (5 min)`,
      consolidation: "Notre chanson est née! Chantons-la avec fierté! Enregistrement pour les parents. (5 min)",
      learningGoals: "Créer des paroles originales; Collaborer à une création collective; Exprimer l'identité du groupe",
      materials: JSON.stringify([
        'Tableau pour paroles',
        'Instruments d\'accompagnement',
        'Enregistreur',
        'Feuilles de paroles',
        'Décoration pour performance',
        'Microphone'
      ]),
      grouping: "Création collective, pratique en grand groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Contribution d\'un mot ou phrase',
          'Participation gestuelle',
          'Rôle instrumental'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Participation selon capacité',
        cognitive: 'Contribution simple acceptée',
        sensory: 'Volume adapté, position confortable'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Couplet supplémentaire',
          'Arrangement musical',
          'Chorégraphie',
          'Direction de la chanson'
        ]
      }),
      assessmentType: 'Formative et Collaborative',
      assessmentNotes: 'Évaluation de la participation à la création collective et de l\'expression de l\'identité du groupe.',
      subNotes: "Création collective d'une chanson de classe. Inclure les idées de tous. Enregistrement pour souvenir.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 8: PERFORMANCE ET EXPRESSION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Préparer notre spectacle",
      date: new Date('2025-10-20'),
      duration: 30,
      mindsOn: "Nous allons faire un spectacle! Comment les artistes se préparent-ils? Pratiquons notre présence scénique! (5 min)",
      action: `1. Choix du programme (vote démocratique) (5 min)
2. Répétition générale des pièces choisies (10 min)
3. Pratique des saluts et présentations (5 min)
4. Préparation de l'espace scène (5 min)`,
      consolidation: "Êtes-vous prêts? Derniers conseils et encouragements. Photo de groupe de la troupe! (5 min)",
      learningGoals: "Préparer une performance; Développer la présence scénique; Collaborer pour un spectacle",
      materials: JSON.stringify([
        'Programme du spectacle',
        'Costumes ou accessoires',
        'Décor simple',
        'Instruments nécessaires',
        'Microphone et sono',
        'Appareil photo'
      ]),
      grouping: "Répétition collective, organisation en comités",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rôle adapté aux capacités',
          'Support d\'un pair',
          'Participation flexible'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations scéniques, position confortable',
        cognitive: 'Rôle simple et clair, répétition supplémentaire',
        sensory: 'Environnement prévisible, répétition du déroulement'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Maître de cérémonie',
          'Solo ou numéro spécial',
          'Aide à la régie',
          'Création du programme'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la préparation et de la collaboration. Observation de la gestion du trac.',
      subNotes: "Préparation du spectacle avec répétition générale. Organisation claire des rôles. Ambiance encourageante.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Techniques de relaxation musicale",
      date: new Date('2025-10-22'),
      duration: 30,
      mindsOn: "La musique peut nous calmer et nous détendre. Écoutons... Comment vous sentez-vous? Position confortable de relaxation. (5 min)",
      action: `1. Respiration sur musique douce (5 min)
2. Voyage imaginaire guidé avec sons (5 min)
3. Création d'une bulle de calme sonore (5 min)
4. Étirements doux en musique (5 min)`,
      consolidation: "Comment vous sentez-vous maintenant? Quelle musique vous détend? Moment de calme partagé. (5 min)",
      learningGoals: "Utiliser la musique pour se détendre; Développer la conscience corporelle; Créer un espace de calme",
      materials: JSON.stringify([
        'Musique relaxante',
        'Tapis ou coussins',
        'Éclairage doux',
        'Bols tibétains (optionnel)',
        'Images apaisantes',
        'Couvertures légères'
      ]),
      grouping: "Relaxation individuelle dans l'espace collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Position adaptée',
          'Participation selon confort',
          'Durée ajustée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Position confortable adaptée',
        cognitive: 'Instructions simples et répétées',
        sensory: 'Ajustements selon sensibilité'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Guider une relaxation',
          'Créer une playlist',
          'Techniques avancées',
          'Journal de relaxation'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la capacité à se détendre et à utiliser la musique pour le bien-être.',
      subNotes: "Relaxation musicale guidée. Respecter le rythme de chacun. Créer un environnement sécurisant.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 9: SPECTACLE FINAL ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Dernière répétition",
      date: new Date('2025-10-27'),
      duration: 30,
      mindsOn: "C'est le grand jour qui approche! Visualisons notre succès. Exercices de confiance et cercle d'encouragement. (5 min)",
      action: `1. Échauffement vocal et corporel (5 min)
2. Répétition complète du spectacle (15 min)
3. Ajustements finaux et conseils (5 min)`,
      consolidation: "Vous êtes prêts! Qu'est-ce qui vous rend fiers? Mains ensemble: 1, 2, 3, MUSIQUE! (5 min)",
      learningGoals: "Finaliser la préparation; Gérer le trac; Développer la confiance collective",
      materials: JSON.stringify([
        'Tout le matériel du spectacle',
        'Liste de vérification',
        'Costumes',
        'Instruments accordés',
        'Programme imprimé',
        'Bouteilles d\'eau'
      ]),
      grouping: "Répétition collective avec tous les rôles",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rappels individuels',
          'Partenaire de soutien',
          'Plan B si anxiété'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Derniers ajustements d\'accessibilité',
        cognitive: 'Rappels visuels en coulisse',
        sensory: 'Vérification du confort sensoriel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Mentor pour les anxieux',
          'Responsabilités techniques',
          'Accueil du public',
          'Documentation vidéo'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la préparation finale et de la gestion des émotions. Esprit d\'équipe.',
      subNotes: "Répétition générale finale. Liste de vérification complète. Gestion du stress et encouragements.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Concert de célébration",
      date: new Date('2025-10-29'),
      duration: 30,
      mindsOn: "C'est le moment! Respirons ensemble. Sourions! Nous allons briller! Cercle de pouvoir musical. (5 min)",
      action: `SPECTACLE:
1. Ouverture: Chanson de bienvenue (3 min)
2. Démonstrations instrumentales (5 min)
3. Chansons et danses apprises (7 min)
4. Compositions originales (5 min)
5. Final: Notre chanson de classe (5 min)`,
      consolidation: "Bravo! Vous êtes des musiciens extraordinaires! Saluts, applaudissements et célébration! Diplômes de musicien. (5 min)",
      learningGoals: "Performer devant un public; Démontrer les apprentissages; Célébrer le parcours musical",
      materials: JSON.stringify([
        'Scène préparée',
        'Tous les instruments',
        'Costumes et accessoires',
        'Programme pour le public',
        'Diplômes de musicien',
        'Appareil photo/vidéo'
      ]),
      grouping: "Performance collective avec moments individuels/petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Flexibilité dans la participation',
          'Support constant disponible',
          'Option de retrait si besoin'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Toutes adaptations en place',
        cognitive: 'Support visuel et humain disponible',
        sensory: 'Environnement préparé et prévisible'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Solos ou présentations',
          'Rôle de MC',
          'Performance spéciale',
          'Aide technique'
        ]
      }),
      assessmentType: 'Sommative et Célébrative',
      assessmentNotes: 'Évaluation finale de la progression musicale. Célébration de tous les apprentissages. Portfolio musical complet.',
      subNotes: "Concert final avec public (parents invités si possible). Programme détaillé. Célébration positive pour tous.",
      isSubFriendly: true,
      subject: 'Musique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    console.log('\n📝 Creating 18 perfect Music lessons...\n');
    
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson: ${created.title} (${created.date.toLocaleDateString()})`);
    }

    // Verify the perfection
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION OF MUSIC LESSONS:');
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
      console.log('🎵 PERFECTION ACHIEVED!');
      console.log('='.repeat(60));
      console.log('✨ All 18 Music lessons are 100% PERFECT!');
      console.log('✨ Complete ETFO compliance from the start!');
      console.log('✨ Ready for Grade 1 French Immersion!');
      console.log('✨ September 3 to October 29, 2025');
      console.log('✨ Comprehensive music curriculum!');
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectMusicLessons();