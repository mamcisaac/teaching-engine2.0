import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks7to9PELessons() {
  console.log('🏃 CREATING PERFECT PE LESSONS - MON CORPS EN MOUVEMENT - WEEKS 7-9');
  console.log('='.repeat(60));

  // Get the test teacher account
  const teacher = await prisma.user.findFirst({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!teacher) {
    console.error('❌ Teacher not found');
    return;
  }

  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mon corps en mouvement' }
  });

  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }

  console.log('Found unit:', unit.title);

  const lessons = [
    // ==================== WEEK 7: SPORTS D'ÉQUIPE ET COOPÉRATION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Volleyball ballon",
      date: new Date('2025-10-14'),
      duration: 40,
      mindsOn: "Comment peut-on garder un ballon dans les airs en équipe? Aujourd'hui, nous allons apprendre le volleyball avec un gros ballon! (5 min)",
      action: `1. Échauffement: passer le ballon en cercle (5 min)
2. Technique de frappe: deux mains jointes (5 min)
3. Pratique individuelle: garder le ballon en l'air (5 min)
4. Pratique en duos: passes contrôlées (7 min)
5. Jeu simplifié: garder le ballon en l'air en équipe (8 min)
6. Mini-match avec filet bas (10 min)`,
      consolidation: "Qu'est-ce qui était difficile? Comment votre équipe a-t-elle collaboré? Étirements et relaxation. (5 min)",
      learningGoals: "Développer la coordination œil-main; Apprendre les bases du volleyball; Travailler en équipe pour maintenir le ballon en jeu",
      materials: JSON.stringify([
        'Ballons de plage ou ballons légers',
        'Filet bas ou corde',
        'Cônes pour délimiter le terrain',
        'Dossards',
        'Sifflet'
      ]),
      grouping: "Duos puis équipes de 4-5",
      accommodations: JSON.stringify({
        forStruggling: [
          'Ballon plus gros et plus léger',
          'Permettre un rebond',
          'Zone de jeu réduite'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ballon en mousse, hauteur de filet adaptée, attraper permis',
        cognitive: 'Règles simplifiées, signaux visuels, démonstrations répétées'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Service par en-dessous',
          'Rotation des positions',
          'Comptage des points'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la technique de frappe, de la coopération et de l\'effort. Progrès dans le maintien du ballon en jeu.',
      subNotes: "Volleyball adapté avec ballon léger. Instructions détaillées et progressions fournies. Filet ajustable selon le groupe.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Tchoukball initiation",
      date: new Date('2025-10-15'),
      duration: 40,
      mindsOn: "Connaissez-vous le tchoukball? C'est un sport où on lance le ballon sur un trampoline! Démonstration du rebond. (5 min)",
      action: `1. Exploration du trampoline: lancer et attraper (7 min)
2. Technique de lancer sur le trampoline (5 min)
3. Pratique en duos: lancer-attraper (8 min)
4. Jeu de passes avec rebond (8 min)
5. Mini-match simplifié (10 min)`,
      consolidation: "Qu'avez-vous découvert sur le rebond? Comment avez-vous ajusté vos lancers? Discussion et rangement. (5 min)",
      learningGoals: "Découvrir un nouveau sport; Développer la précision du lancer; Anticiper les trajectoires de rebond",
      materials: JSON.stringify([
        'Trampolines de tchoukball (ou cibles inclinées)',
        'Ballons en mousse',
        'Cônes pour zones',
        'Dossards',
        'Ruban pour marquer les zones'
      ]),
      grouping: "Individuel, duos, puis équipes de 3-4",
      accommodations: JSON.stringify({
        forStruggling: [
          'Distance réduite du trampoline',
          'Ballon plus gros et mou',
          'Zone de réception plus large'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Lancer assis ou à genoux permis, cible plus grande',
        cognitive: 'Zones colorées, règles progressives, aide d\'un pair'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Angles de lancer variés',
          'Passes rapides',
          'Stratégies d\'équipe'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension du rebond, de la précision et de l\'adaptation. Participation active.',
      subNotes: "Introduction au tchoukball avec règles simplifiées. Matériel de substitution possible (plan incliné). Focus sécurité.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Ultimate frisbee modifié",
      date: new Date('2025-10-17'),
      duration: 40,
      mindsOn: "Avez-vous déjà fait voler un frisbee? Aujourd'hui, nous allons apprendre à jouer en équipe avec un frisbee! (5 min)",
      action: `1. Technique de lancer du frisbee (7 min)
2. Pratique individuelle: lancer contre le mur (5 min)
3. Passes avec partenaire (8 min)
4. Jeu de passes en mouvement (8 min)
5. Mini-match sans contact (10 min)`,
      consolidation: "Quel type de lancer était le plus facile? Comment avez-vous attrapé le frisbee? Démonstrations des élèves. (5 min)",
      learningGoals: "Apprendre à lancer et attraper un frisbee; Développer la coordination; Jouer en équipe sans contact",
      materials: JSON.stringify([
        'Frisbees en mousse ou anneaux',
        'Cônes pour les zones',
        'Dossards d\'équipe',
        'Lignes de terrain',
        'Musique d\'ambiance'
      ]),
      grouping: "Partenaires puis équipes de 4",
      accommodations: JSON.stringify({
        forStruggling: [
          'Frisbee plus léger ou anneau',
          'Distance de lancer réduite',
          'Attraper avec rebond permis'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Lancer à deux mains permis, zone de jeu adaptée',
        cognitive: 'Cibles visuelles, règles simplifiées, démonstrations multiples'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Différents types de lancers',
          'Passes en mouvement',
          'Marquage défensif léger'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la technique de lancer, de l\'attrapage et du jeu d\'équipe. Respect des règles sans contact.',
      subNotes: "Ultimate frisbee adapté avec frisbee en mousse. Règles sans contact strictes. Plan de terrain fourni.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Jeux coopératifs",
      date: new Date('2025-10-18'),
      duration: 40,
      mindsOn: "Aujourd'hui, nous allons jouer à des jeux où tout le monde gagne ensemble! Qu'est-ce que la coopération? (5 min)",
      action: `1. Le nœud humain: se démêler ensemble (7 min)
2. La traversée de rivière: utiliser des îles pour traverser (8 min)
3. Le parachute coopératif: objectifs communs (8 min)
4. La chenille géante: se déplacer ensemble (7 min)
5. Construction d'une tour humaine (5 min)`,
      consolidation: "Comment avez-vous travaillé ensemble? Qu'est-ce qui a aidé votre équipe à réussir? Célébration collective. (5 min)",
      learningGoals: "Développer l'esprit de coopération; Communiquer efficacement; Résoudre des problèmes en groupe",
      materials: JSON.stringify([
        'Cerceaux',
        'Tapis ou "îles"',
        'Parachute',
        'Cônes',
        'Musique collaborative'
      ]),
      grouping: "Groupes variés selon l'activité",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rôles adaptés dans chaque jeu',
          'Support physique si nécessaire',
          'Instructions simplifiées'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations pour mobilité réduite, alternatives assises',
        cognitive: 'Instructions visuelles, démonstrations, guide étape par étape'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Rôle de leader',
          'Création de nouveaux défis',
          'Aide aux autres'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la coopération, de la communication et de la résolution de problèmes. Esprit d\'équipe.',
      subNotes: "Jeux coopératifs avec instructions détaillées. Focus sur l'inclusion et la réussite collective. Musique fournie.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 8: MOUVEMENT CRÉATIF ET DANSE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Danse créative",
      date: new Date('2025-10-21'),
      duration: 40,
      mindsOn: "La musique nous fait bouger! Comment votre corps veut-il danser sur cette musique? Exploration libre. (5 min)",
      action: `1. Échauffement en musique: parties du corps (5 min)
2. Exploration: niveaux (haut, moyen, bas) (5 min)
3. Exploration: vitesses (lent, rapide) (5 min)
4. Création de mouvements personnels (8 min)
5. Partage en petits groupes (7 min)
6. Danse collective finale (8 min)`,
      consolidation: "Quel mouvement avez-vous préféré créer? Comment la musique vous a-t-elle inspiré? Relaxation. (5 min)",
      learningGoals: "Explorer le mouvement créatif; Exprimer des émotions par le mouvement; Développer la conscience corporelle",
      materials: JSON.stringify([
        'Système de son',
        'Musiques variées',
        'Foulards colorés',
        'Rubans',
        'Espace dégagé'
      ]),
      grouping: "Individuel, petits groupes, puis toute la classe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements assis permis',
          'Imitation encouragée',
          'Participation à son rythme'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés, utilisation de supports, danse assise',
        cognitive: 'Mouvements simples, imitation, musique familière'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Création de séquences',
          'Leadership dans la danse',
          'Improvisation complexe'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'expression créative, de l\'exploration du mouvement et de la participation. Portfolio vidéo possible.',
      subNotes: "Danse créative avec musiques variées fournies. Instructions pour exploration guidée. Focus sur l'expression personnelle.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Danses du monde",
      date: new Date('2025-10-22'),
      duration: 40,
      mindsOn: "Les gens dansent partout dans le monde! Aujourd'hui, nous voyageons par la danse. Montrer la carte du monde. (5 min)",
      action: `1. Danse africaine: mouvements de célébration (8 min)
2. Danse hawaïenne: mouvements fluides (8 min)
3. Danse irlandaise: sauts et pas rapides (8 min)
4. Danse autochtone: cercle et rythme (8 min)
5. Création d'une danse mondiale (6 min)`,
      consolidation: "Quelle danse avez-vous préférée? Qu'avez-vous appris sur les cultures? Danse de clôture ensemble. (5 min)",
      learningGoals: "Découvrir différentes cultures par la danse; Apprendre des mouvements variés; Respecter la diversité culturelle",
      materials: JSON.stringify([
        'Musiques du monde',
        'Images ou vidéos des danses',
        'Carte du monde',
        'Accessoires culturels (optionnel)',
        'Système audio'
      ]),
      grouping: "Toute la classe ensemble",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements simplifiés',
          'Participation partielle acceptée',
          'Rôle de musicien'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés à la mobilité, alternatives assises',
        cognitive: 'Une danse à la fois, répétition, support visuel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Recherche sur les danses',
          'Création de variations',
          'Enseignement aux pairs'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Participation respectueuse, effort pour apprendre les mouvements, appréciation de la diversité.',
      subNotes: "Danses du monde avec musiques et instructions fournies. Contexte culturel inclus. Respecter les traditions.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mime et expression corporelle",
      date: new Date('2025-10-24'),
      duration: 40,
      mindsOn: "Pouvez-vous raconter une histoire sans parler, juste avec votre corps? C'est le mime! Démonstration. (5 min)",
      action: `1. Échauffement: visages expressifs (5 min)
2. Actions simples en mime (brosser les dents, manger) (7 min)
3. Émotions par le corps (joie, tristesse, surprise) (7 min)
4. Animaux en mime (7 min)
5. Histoires courtes en groupe (9 min)
6. Spectacle de mime (5 min)`,
      consolidation: "Qu'est-ce qui était difficile à mimer? Comment avez-vous deviné les actions des autres? Applaudissements. (5 min)",
      learningGoals: "Développer l'expression corporelle; Communiquer sans paroles; Développer l'imagination et la créativité",
      materials: JSON.stringify([
        'Musique douce de fond',
        'Cartes d\'actions',
        'Cartes d\'émotions',
        'Espace de performance',
        'Accessoires simples (optionnel)'
      ]),
      grouping: "Individuel, duos, petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Actions très simples',
          'Mime avec partenaire',
          'Utilisation d\'accessoires'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mime assis ou avec support, gestes adaptés',
        cognitive: 'Actions familières, imitation permise, cartes visuelles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Histoires complexes',
          'Mime abstrait',
          'Direction de scènes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Créativité dans l\'expression, clarté des gestes, participation enthousiaste. Respect des performances des autres.',
      subNotes: "Mime et expression avec cartes d'actions fournies. Musique de fond incluse. Encourager la créativité.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Création de routine gymnique",
      date: new Date('2025-10-25'),
      duration: 40,
      mindsOn: "Les gymnastes créent de belles routines! Aujourd'hui, nous allons créer la nôtre. Vidéo inspirante. (5 min)",
      action: `1. Révision des mouvements de base (5 min)
2. Choix de 5 mouvements personnels (5 min)
3. Ordre et transitions (7 min)
4. Pratique avec musique (8 min)
5. Répétition générale (5 min)
6. Présentations (10 min)`,
      consolidation: "Comment avez-vous choisi vos mouvements? Qu'est-ce qui rendait votre routine spéciale? Félicitations! (5 min)",
      learningGoals: "Créer une séquence de mouvements; Développer la mémoire motrice; Performer devant un public",
      materials: JSON.stringify([
        'Tapis de gymnastique',
        'Musique rythmée',
        'Rubans ou foulards',
        'Cerceaux',
        'Espace de performance'
      ]),
      grouping: "Individuel ou duos",
      accommodations: JSON.stringify({
        forStruggling: [
          'Routine de 3 mouvements',
          'Aide-mémoire visuel',
          'Performance avec partenaire'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés, routine assise possible',
        cognitive: 'Routine simple, répétition guidée, support visuel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Routine plus longue',
          'Utilisation d\'accessoires',
          'Chorégraphie complexe'
        ]
      }),
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation de la créativité, de la mémorisation et de la performance. Effort et amélioration personnelle.',
      subNotes: "Création de routine avec mouvements de base fournis. Musiques disponibles. Support pour les présentations.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 9: RÉVISION ET ACTIVITÉS CULMINANTES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Stations de révision",
      date: new Date('2025-10-28'),
      duration: 40,
      mindsOn: "Nous avons appris tellement de choses! Aujourd'hui, nous révisons nos sports préférés. Rappel des activités. (5 min)",
      action: `Rotation aux stations (6 min chacune):
1. Station soccer: dribble et tir
2. Station basketball: lancer au panier
3. Station gymnastique: parcours
4. Station danse: mouvements libres
5. Station coopération: défi d'équipe`,
      consolidation: "Quelle station était votre préférée? Comment vous êtes-vous améliorés depuis le début? Réflexion. (5 min)",
      learningGoals: "Réviser les habiletés apprises; Démontrer les progrès; Faire des choix d'activités",
      materials: JSON.stringify([
        'Matériel de toutes les activités',
        'Cartes de stations',
        'Musique variée',
        'Chronomètre',
        'Feuilles de progrès'
      ]),
      grouping: "Petits groupes rotatifs",
      accommodations: JSON.stringify({
        forStruggling: [
          'Choix de 3 stations',
          'Temps supplémentaire',
          'Aide d\'un pair'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Stations adaptées, alternatives disponibles',
        cognitive: 'Instructions simplifiées à chaque station, démonstrations'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Défis supplémentaires',
          'Aide à l\'animation',
          'Création de variantes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation des progrès depuis le début de l\'unité. Portfolio de compétences. Auto-évaluation.',
      subNotes: "Stations de révision avec tout le matériel organisé. Instructions à chaque station. Musique variée.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Journée sportive d'Halloween",
      date: new Date('2025-10-29'),
      duration: 40,
      mindsOn: "C'est bientôt l'Halloween! Aujourd'hui, nos jeux ont un thème d'Halloween. Montrez vos costumes sportifs! (5 min)",
      action: `1. Course des monstres (différentes démarches) (7 min)
2. Lancer de bonbons dans le chaudron (7 min)
3. Danse des squelettes (7 min)
4. Relais des sorcières (balais) (7 min)
5. Chasse aux trésors d'Halloween (7 min)`,
      consolidation: "Quel jeu d'Halloween était le plus amusant? Comment avez-vous bougé comme des monstres? Parade finale. (5 min)",
      learningGoals: "Participer à des activités thématiques; Utiliser l'imagination dans le mouvement; Célébrer en bougeant",
      materials: JSON.stringify([
        'Décorations d\'Halloween',
        'Musique d\'Halloween',
        'Chaudrons ou seaux',
        'Balles orange et noires',
        'Accessoires de costume (optionnel)'
      ]),
      grouping: "Activités variées en groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements simplifiés',
          'Participation selon confort',
          'Rôles spéciaux'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Activités adaptées, alternatives non-effrayantes',
        cognitive: 'Instructions claires, démonstrations, participation guidée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Création de nouveaux jeux',
          'Leadership d\'activités',
          'Défis bonus'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Participation enthousiaste, créativité dans les mouvements, esprit de fête. Respect des différences.',
      subNotes: "Activités d'Halloween avec musique thématique. Adaptations pour élèves sensibles. Focus sur le plaisir.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Spectacle de clôture",
      date: new Date('2025-10-30'),
      duration: 40,
      mindsOn: "C'est notre dernière classe de cette unité! Préparons un spectacle pour montrer tout ce que nous avons appris! (5 min)",
      action: `1. Pratique finale des présentations (10 min)
2. Installation de l'espace spectacle (5 min)
3. Spectacle:
   - Démonstrations sportives (8 min)
   - Performances de danse (8 min)
   - Jeux coopératifs (7 min)`,
      consolidation: "Qu'avez-vous préféré apprendre? Comment votre corps est-il devenu plus fort? Certificats et célébration! (7 min)",
      learningGoals: "Démontrer les apprentissages; Célébrer les accomplissements; Réfléchir sur les progrès",
      materials: JSON.stringify([
        'Espace de performance',
        'Système de son',
        'Certificats de participation',
        'Décorations',
        'Appareil photo'
      ]),
      grouping: "Performances individuelles et de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Participation selon capacité',
          'Rôles de soutien',
          'Célébration de tout effort'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations pour tous les numéros, participation flexible',
        cognitive: 'Support pour les présentations, participation guidée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Maître de cérémonie',
          'Performances solo',
          'Aide à l\'organisation'
        ]
      }),
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation finale des compétences acquises. Portfolio complet de l\'unité. Célébration des progrès individuels.',
      subNotes: "Spectacle de clôture avec programme détaillé. Certificats préparés. Musique et organisation fournis.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson: ${created.title} (${created.date.toLocaleDateString()})`);
    }

    console.log('\n🎉 Successfully created all Week 7-9 PE lessons!');
    console.log('Total lessons created:', lessons.length);
    
    // Count total lessons for the unit
    const totalLessons = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: unit.id }
    });
    console.log(`\n📊 Total lessons in "Mon corps en mouvement" unit: ${totalLessons}`);
    
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWeeks7to9PELessons();