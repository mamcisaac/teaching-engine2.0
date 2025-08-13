import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks4to6PELessons() {
  console.log('🏃 CREATING PERFECT PE LESSONS - MON CORPS EN MOUVEMENT - WEEKS 4-6');
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
    // ==================== WEEK 4: JEUX AVEC RÈGLES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Jeux simples avec règles",
      date: new Date('2025-09-22'),
      duration: 40,
      mindsOn: "Qui connaît un jeu avec des règles? Aujourd'hui, nous allons apprendre à jouer ensemble! Discussion sur l'importance des règles dans les jeux et dans la vie. (5 min)",
      action: `1. Échauffement: "Jacques a dit" version active (5 min)
2. Jeu "Feu rouge, feu vert" avec variations (10 min)
3. Introduction du jeu "Chat et souris" avec règles simples (15 min)
4. Pratique du jeu en petits groupes (10 min)`,
      consolidation: "Qu'avez-vous appris sur les règles aujourd'hui? Pourquoi sont-elles importantes? Partage en cercle et réflexion. (5 min)",
      learningGoals: "Comprendre et suivre des règles simples; Jouer en équipe de manière coopérative; Respecter les tours de jeu",
      materials: JSON.stringify([
        'Cônes pour délimiter les espaces',
        'Cerceaux',
        'Ballons variés',
        'Dossards de couleurs',
        'Sifflet',
        'Chronomètre'
      ]),
      grouping: "Petits groupes de 4-5, puis toute la classe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Règles simplifiées avec support visuel',
          'Partenaire pour aider à comprendre',
          'Rôles adaptés (arbitre assistant)'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Zones de jeu adaptées, règles modifiées pour mobilité réduite',
        cognitive: 'Instructions visuelles, répétition des règles, démonstrations'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Rôle de capitaine d\'équipe',
          'Création de variations de règles',
          'Aide aux autres élèves'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Observation de la capacité à suivre les règles et à jouer de manière coopérative. Checklist des habiletés de jeu coopératif.',
      subNotes: "Jeux simples avec règles écrites et illustrées. Focus sur 'Feu rouge, feu vert' et 'Jacques a dit'. Support visuel fourni. Espaces de jeu bien délimités, règles de contact appropriées.",
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
      title: "Course à relais",
      date: new Date('2025-09-23'),
      duration: 40,
      mindsOn: "Avez-vous déjà vu une course de relais aux Jeux olympiques? Aujourd'hui, nous sommes des athlètes! Démonstration du passage de témoin. (5 min)",
      action: `1. Échauffement: course sur place et étirements dynamiques (5 min)
2. Pratique du passage de témoin en marchant puis en courant (10 min)
3. Relais simple en ligne droite (10 min)
4. Relais avec obstacles simples (10 min)
5. Course finale avec toutes les équipes (5 min)`,
      consolidation: "Comment votre équipe a-t-elle travaillé ensemble? Qu'est-ce qui était le plus difficile? Célébration de l'effort de tous. (5 min)",
      learningGoals: "Travailler en équipe efficacement; Développer la vitesse et l'agilité; Encourager ses coéquipiers",
      materials: JSON.stringify([
        'Témoins de relais (ou objets substituts)',
        'Cônes pour marquer les parcours',
        'Dossards d\'équipe',
        'Obstacles variés',
        'Chronomètre',
        'Tableau de score'
      ]),
      grouping: "Équipes de 4-5 élèves, équilibrées en capacité",
      accommodations: JSON.stringify({
        forStruggling: [
          'Distances plus courtes',
          'Marche rapide au lieu de course',
          'Rôle spécial (starter, chronométreur)'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Distance adaptée, marche permise, passage de témoin stationnaire',
        cognitive: 'Parcours simplifié, repères visuels clairs'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Parcours plus complexes',
          'Rôle de chef d\'équipe',
          'Défis supplémentaires (dribble, etc.)'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la technique de passage, de l\'esprit d\'équipe et de l\'effort. Temps chronométrés, progrès individuel noté.',
      subNotes: "Course de relais avec instructions détaillées. Focus sur le passage de témoin et l'esprit d'équipe. Parcours dessiné inclus. Surface de course sécuritaire.",
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
      title: "Jeu du parachute",
      date: new Date('2025-09-25'),
      duration: 40,
      mindsOn: "Regardez ce grand parachute coloré! Ensemble, nous pouvons créer de la magie! Exploration des possibilités. (5 min)",
      action: `1. Exploration libre du parachute (5 min)
2. Vagues: petites, moyennes, grandes (7 min)
3. Pop-corn: faire sauter les balles (8 min)
4. Champignon: soulever et s'asseoir dessous (8 min)
5. Carrousel: tourner en tenant le parachute (7 min)`,
      consolidation: "Jeu calme: bercer doucement le parachute. Qu'avez-vous préféré? Comment avons-nous réussi à travailler ensemble? (5 min)",
      learningGoals: "Coordonner ses mouvements avec le groupe; Suivre des instructions rythmées; Développer la force du haut du corps",
      materials: JSON.stringify([
        'Grand parachute de jeu',
        'Balles légères de différentes tailles',
        'Ballons',
        'Musique rythmée',
        'Espace intérieur ou extérieur dégagé'
      ]),
      grouping: "Toute la classe ensemble autour du parachute",
      accommodations: JSON.stringify({
        forStruggling: [
          'Position adaptée (assis si nécessaire)',
          'Tenir avec une main seulement',
          'Rôle d\'observateur actif'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Participation assise, une main seulement, mouvements adaptés',
        cognitive: 'Instructions simples, démonstrations répétées, participation guidée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Diriger une activité',
          'Créer de nouveaux mouvements',
          'Aider les autres élèves'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la participation, de l\'écoute des consignes et de la coopération. Portfolio photo des activités réussies.',
      subNotes: "Activités de parachute avec séquence détaillée. Cartes visuelles fournies. Focus sur la sécurité et l'inclusion. Espace suffisant autour du parachute.",
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
      title: "Parcours d'aventure",
      date: new Date('2025-09-26'),
      duration: 40,
      mindsOn: "Aujourd'hui, nous sommes des explorateurs dans une jungle d'aventures! Présentation du parcours et des défis. (5 min)",
      action: `Rotation aux stations (5 min chacune):
1. Station 1: Ramper sous les tunnels
2. Station 2: Sauter d'un cerceau à l'autre
3. Station 3: Équilibre sur le banc
4. Station 4: Lancer dans la cible
5. Station 5: Roulade sur matelas
6. Parcours complet chronométré (10 min)`,
      consolidation: "Quelle station était la plus difficile? Comment vous êtes-vous améliorés? Partage des stratégies gagnantes. (5 min)",
      learningGoals: "Naviguer dans un parcours complexe; Utiliser différentes habiletés motrices; Persévérer face aux défis",
      materials: JSON.stringify([
        'Matelas de gymnastique',
        'Bancs suédois',
        'Cerceaux',
        'Cordes à sauter',
        'Tunnels',
        'Cônes et obstacles variés',
        'Chronomètre'
      ]),
      grouping: "Rotation par groupes de 4-5 aux stations",
      accommodations: JSON.stringify({
        forStruggling: [
          'Options alternatives à chaque station',
          'Parcours simplifié',
          'Aide d\'un pair'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Hauteurs et distances adaptées, alternatives pour chaque obstacle',
        cognitive: 'Parcours visuellement marqué, démonstrations répétées'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Défis supplémentaires par station',
          'Chronométrage personnel',
          'Création de nouvelles stations'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Portfolio de progrès avec temps et observations par station. Amélioration du temps personnel.',
      subNotes: "Parcours d'aventure avec plan détaillé des stations. Instructions et adaptations pour chaque station fournies. Matelas de protection.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 5: FITNESS ET HABITUDES SAINES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mon cœur qui bat",
      date: new Date('2025-09-29'),
      duration: 40,
      mindsOn: "Mettez votre main sur votre cœur. Sentez-vous quelque chose? C'est votre cœur qui travaille! Introduction au système cardiovasculaire. (5 min)",
      action: `1. Trouver son pouls au repos (5 min)
2. Activité légère: marche sur place (3 min) + vérifier le pouls
3. Activité modérée: sauts de grenouille (3 min) + vérifier le pouls
4. Activité intense: course sur place (3 min) + vérifier le pouls
5. Retour au calme: respiration profonde (5 min)
6. Comparer les battements à différents moments (5 min)
7. Dessiner un cœur et colorier selon l'intensité (5 min)`,
      consolidation: "Qu'avez-vous remarqué sur votre cœur? Pourquoi est-il important de faire de l'exercice? Discussion et journal de santé. (5 min)",
      learningGoals: "Comprendre que le cœur bat plus vite avec l'exercice; Sentir son pouls; Reconnaître l'importance de l'exercice pour la santé",
      materials: JSON.stringify([
        'Stéthoscopes jouets (optionnel)',
        'Chronomètre',
        'Affiches du corps humain',
        'Autocollants cœur',
        'Musique rythmée',
        'Carnet de santé personnel'
      ]),
      grouping: "Individuel et partenaires pour vérifier le pouls",
      accommodations: JSON.stringify({
        forStruggling: [
          'Activités d\'intensité adaptée',
          'Aide pour trouver le pouls',
          'Représentation visuelle des battements'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Intensité adaptée, exercices assis possibles',
        cognitive: 'Support visuel pour comprendre le pouls, aide individuelle'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Calculer les battements par minute',
          'Créer un graphique des battements',
          'Expliquer aux autres'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Capacité à identifier les changements de rythme cardiaque, participation active. Journal de santé complété.',
      subNotes: "Leçon sur le système cardiovasculaire avec activités graduées. Instructions détaillées pour mesurer le pouls incluses. Intensité progressive.",
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
      title: "Circuit fitness des animaux",
      date: new Date('2025-09-30'),
      duration: 40,
      mindsOn: "Aujourd'hui, nous allons bouger comme différents animaux! Chaque animal a sa façon spéciale de se déplacer. Démonstrations. (5 min)",
      action: `1. Échauffement: parade des animaux (5 min)
2. Station 1: Sauts de kangourou (3 min)
3. Station 2: Marche de l'ours (3 min)
4. Station 3: Pas de crabe (3 min)
5. Station 4: Rampement du serpent (3 min)
6. Station 5: Galop du cheval (3 min)
7. Station 6: Vol de l'oiseau (bras) (3 min)
8. Défi final: zoo en folie - tous les animaux (5 min)`,
      consolidation: "Étirement du chat pour retour au calme. Quel animal était le plus difficile à imiter? Lequel était le plus amusant? (5 min)",
      learningGoals: "Développer la force et l'endurance; Imiter les mouvements des animaux; Maintenir l'effort pendant une durée déterminée",
      materials: JSON.stringify([
        'Cartes d\'animaux avec mouvements',
        'Tapis de sol',
        'Minuterie',
        'Musique énergique',
        'Cônes pour les stations',
        'Tableau de progression'
      ]),
      grouping: "Rotation par petits groupes aux stations",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements modifiés plus simples',
          'Durée réduite par station',
          'Repos supplémentaires autorisés'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Mouvements adaptés selon capacités, alternatives pour chaque animal',
        cognitive: 'Cartes visuelles, démonstrations répétées, imitation guidée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajout de variations complexes',
          'Démonstration pour la classe',
          'Création de nouveaux mouvements d\'animaux'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'effort soutenu, de la forme des mouvements et de la persévérance. Checklist des mouvements maîtrisés.',
      subNotes: "Circuit fitness avec mouvements d'animaux. Cartes visuelles et instructions pour chaque station fournies. Espace suffisant entre élèves.",
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
      title: "Yoga pour enfants",
      date: new Date('2025-10-02'),
      duration: 40,
      mindsOn: "Aujourd'hui, nous allons faire un voyage magique avec notre corps. Nous allons devenir des arbres, des montagnes et des étoiles! (5 min)",
      action: `1. Respiration du ballon: gonfler et dégonfler le ventre (3 min)
2. Salutation au soleil adaptée (5 min)
3. Pose de l'arbre (équilibre) (5 min)
4. Pose du chat et de la vache (5 min)
5. Pose du papillon (5 min)
6. Pose du guerrier (force) (5 min)
7. Pose de l'enfant (repos) (3 min)`,
      consolidation: "Relaxation finale: voyage imaginaire guidé. Comment vous sentez-vous maintenant? Quelle pose avez-vous préférée? (7 min)",
      learningGoals: "Développer la flexibilité et l'équilibre; Apprendre à se détendre et respirer; Améliorer la concentration",
      materials: JSON.stringify([
        'Tapis de yoga ou serviettes',
        'Musique calme',
        'Cartes de poses de yoga pour enfants',
        'Petites peluches pour la respiration',
        'Bougies LED (ambiance)',
        'Huile essentielle de lavande (diffuseur)'
      ]),
      grouping: "Individuel sur tapis, toute la classe ensemble",
      accommodations: JSON.stringify({
        forStruggling: [
          'Poses modifiées avec support',
          'Durée réduite des poses',
          'Position assise ou couchée si nécessaire'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Poses adaptées, support du mur, alternatives assises',
        cognitive: 'Instructions simples, imitation du professeur, cartes visuelles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Poses plus complexes',
          'Tenir les poses plus longtemps',
          'Aider à guider une pose'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la concentration, de l\'effort pour maintenir les poses et de la respiration. Auto-évaluation du bien-être.',
      subNotes: "Session de yoga guidée avec cartes de poses. Histoire de relaxation et musique calme incluses. Ne pas forcer les étirements.",
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
      title: "Défi santé en équipe",
      date: new Date('2025-10-03'),
      duration: 40,
      mindsOn: "Aujourd'hui, c'est le grand défi santé! Chaque équipe va collecter des points en complétant des défis! Explication des règles. (5 min)",
      action: `1. Formation des équipes et choix du nom (5 min)
2. Défi 1: Course d'endurance en équipe (5 min)
3. Défi 2: Quiz sur l'alimentation saine (5 min)
4. Défi 3: Création d'une danse santé (7 min)
5. Défi 4: Dégustation de fruits les yeux bandés (5 min)
6. Défi 5: Affiche des bonnes habitudes (8 min)`,
      consolidation: "Présentation des affiches et célébration. Qu'avez-vous appris sur la santé? Comment pouvez-vous être en meilleure santé? (5 min)",
      learningGoals: "Travailler en équipe vers un objectif commun; Comprendre les différents aspects de la santé; S'encourager mutuellement",
      materials: JSON.stringify([
        'Stations d\'activités variées',
        'Cartes de défis santé',
        'Tableau de points',
        'Récompenses (autocollants)',
        'Fruits pour dégustation',
        'Affiches sur la santé'
      ]),
      grouping: "Équipes de 4-5 élèves pour tous les défis",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rôles adaptés dans l\'équipe',
          'Défis modifiés selon les capacités',
          'Support d\'un pair mentor'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Défis physiques adaptés, alternatives proposées',
        cognitive: 'Questions simplifiées, support visuel pour les défis'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Rôle de capitaine d\'équipe',
          'Défis bonus supplémentaires',
          'Aide à l\'animation des stations'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Évaluation de la participation, de la coopération et de la compréhension des concepts de santé. Affiche de santé créée.',
      subNotes: "Défi santé en équipe avec stations détaillées. Cartes de défis et matériel préparé. Vérifier les allergies alimentaires.",
      isSubFriendly: true,
      subject: 'Éducation physique',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 6: INTRODUCTION AUX SPORTS ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Introduction au soccer",
      date: new Date('2025-10-06'),
      duration: 40,
      mindsOn: "Qui connaît un joueur de soccer célèbre? Aujourd'hui, vous allez apprendre à jouer comme eux! Règles de base du soccer. (5 min)",
      action: `1. Échauffement: course avec mouvements de pieds (5 min)
2. Familiarisation: toucher le ballon avec différentes parties du pied (5 min)
3. Dribble stationnaire puis en mouvement (8 min)
4. Passe à un partenaire (7 min)
5. Tir au but à tour de rôle (7 min)
6. Mini-match 3 contre 3 (8 min)`,
      consolidation: "Qu'est-ce qui était le plus difficile? Qu'avez-vous préféré? Célébration des buts et de l'effort. (5 min)",
      learningGoals: "Apprendre à contrôler le ballon avec les pieds; Développer la coordination pied-œil; Comprendre les règles de base du soccer",
      materials: JSON.stringify([
        'Ballons de soccer taille 3',
        'Cônes pour dribble',
        'Mini-buts ou cônes pour buts',
        'Dossards de couleurs',
        'Sifflet',
        'Lignes de démarcation'
      ]),
      grouping: "Partenaires puis équipes de 3",
      accommodations: JSON.stringify({
        forStruggling: [
          'Ballon plus gros et plus mou',
          'Distance de tir réduite',
          'Rôle de gardien ou arbitre assistant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ballon adapté, zone de jeu réduite, marche permise',
        cognitive: 'Règles simplifiées, repères visuels, démonstrations répétées'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Défis de dribble complexes',
          'Passes en mouvement',
          'Techniques avancées (jonglerie)'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation du contrôle du ballon, de la participation et du respect des règles. Démonstration des habiletés de base.',
      subNotes: "Introduction au soccer avec progression d'exercices. Plan de terrain et règles simplifiées fournis. Chaussures appropriées requises.",
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
      title: "Basketball pour débutants",
      date: new Date('2025-10-07'),
      duration: 40,
      mindsOn: "Avez-vous déjà vu un match de basketball? Les joueurs font rebondir le ballon comme par magie! Démonstration du dribble. (5 min)",
      action: `1. Échauffement: passer et attraper en cercle (5 min)
2. Dribble sur place: main droite, main gauche (7 min)
3. Dribble en déplacement entre les cônes (8 min)
4. Technique de lancer: position et mouvement (5 min)
5. Pratique du lancer dans des cerceaux au sol (7 min)
6. Relais de dribble et lancer (8 min)`,
      consolidation: "Qu'avez-vous trouvé le plus amusant? Le plus difficile? Démonstration des progrès. (5 min)",
      learningGoals: "Apprendre à dribbler et contrôler le ballon; Pratiquer le lancer au panier; Développer la coordination main-œil",
      materials: JSON.stringify([
        'Ballons de basketball taille junior',
        'Paniers ajustables ou cerceaux',
        'Cônes pour parcours',
        'Dossards',
        'Lignes au sol',
        'Musique rythmée'
      ]),
      grouping: "Individuel puis partenaires et petites équipes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Paniers plus bas ou cerceaux au sol',
          'Ballons plus légers',
          'Distance de lancer réduite'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Hauteur de panier adaptée, ballons variés, dribble stationnaire permis',
        cognitive: 'Instructions par étapes, repères visuels, démonstrations multiples'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Dribble avec obstacles',
          'Lancer de plus loin',
          'Combinaisons dribble-passe-lancer'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation du contrôle du ballon, de la technique de lancer et de l\'effort. Nombre de paniers réussis, amélioration personnelle.',
      subNotes: "Introduction au basketball avec progression d'habiletés. Exercices détaillés et adaptations inclus. Surface non glissante requise.",
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
      title: "Hockey sur gazon modifié",
      date: new Date('2025-10-09'),
      duration: 40,
      mindsOn: "Aujourd'hui, nous allons jouer au hockey... mais sans glace! C'est le hockey sur gazon! Règles de sécurité importantes. (5 min)",
      action: `1. Règles de sécurité: tenir le bâton correctement (5 min)
2. Contrôle stationnaire de la balle (5 min)
3. Dribble en ligne droite et en slalom (8 min)
4. Passes avec un partenaire (7 min)
5. Tir au but à tour de rôle (7 min)
6. Mini-match 4 contre 4 avec règles adaptées (8 min)`,
      consolidation: "Comment avez-vous trouvé le contrôle du bâton? Qu'est-ce qui était nouveau pour vous? Rangement sécuritaire. (5 min)",
      learningGoals: "Manipuler un bâton et une balle en sécurité; Développer la coordination œil-main-bâton; Apprendre les passes et le contrôle",
      materials: JSON.stringify([
        'Bâtons de hockey en plastique',
        'Balles ou rondelles en mousse',
        'Cônes pour les buts',
        'Cônes pour parcours',
        'Dossards',
        'Ruban adhésif pour zones'
      ]),
      grouping: "Partenaires puis équipes de 4",
      accommodations: JSON.stringify({
        forStruggling: [
          'Balle plus grosse et plus lente',
          'Zone de jeu réduite',
          'Rôle de gardien avec moins de déplacements'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Bâton plus court, balle plus grosse, zone adaptée',
        cognitive: 'Règles simplifiées, zones colorées, aide d\'un pair'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Parcours techniques complexes',
          'Passes en mouvement',
          'Stratégies d\'équipe'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la manipulation sécuritaire, du contrôle et de la coopération. Démonstration des habiletés de base.',
      subNotes: "Hockey sur gazon avec focus sur la sécurité. Règles détaillées et progression d'exercices fournis. Bâtons toujours bas.",
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
      title: "Mini-olympiades",
      date: new Date('2025-10-10'),
      duration: 40,
      mindsOn: "Bienvenue aux mini-olympiades de notre classe! Chaque équipe représente un pays imaginaire! Cérémonie d'ouverture. (5 min)",
      action: `1. Défilé des équipes (3 min)
2. Épreuve 1: Sprint 20 mètres (5 min)
3. Épreuve 2: Lancer de précision (5 min)
4. Épreuve 3: Saut en longueur (5 min)
5. Épreuve 4: Parcours d'obstacles (7 min)
6. Épreuve 5: Relais final (7 min)`,
      consolidation: "Cérémonie de clôture et remise des médailles. Qu'avez-vous préféré? Comment avez-vous encouragé vos coéquipiers? (8 min)",
      learningGoals: "Appliquer diverses habiletés apprises; Démontrer l'esprit sportif; Célébrer les accomplissements",
      materials: JSON.stringify([
        'Équipement varié des sports pratiqués',
        'Médailles ou certificats',
        'Drapeaux ou bannières d\'équipe',
        'Tableau de pointage',
        'Musique olympique',
        'Podium improvisé'
      ]),
      grouping: "Équipes de 5-6 élèves représentant des pays",
      accommodations: JSON.stringify({
        forStruggling: [
          'Épreuves adaptées aux capacités',
          'Rôles spéciaux (porteur de flamme, annonceur)',
          'Points bonus pour l\'effort'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Distances et hauteurs adaptées, épreuves alternatives',
        cognitive: 'Support visuel pour les épreuves, aide d\'un pair'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Défis supplémentaires dans chaque épreuve',
          'Rôle de capitaine ou officiel',
          'Records personnels à battre'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Portfolio des performances, observation de l\'esprit sportif et de l\'effort. Participation complète et démonstration des habiletés.',
      subNotes: "Mini-olympiades avec épreuves détaillées. Tout le matériel et les instructions sont préparés. Échauffement complet requis.",
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

    console.log('\n🎉 Successfully created all Week 4-6 PE lessons!');
    console.log('Total lessons created:', lessons.length);
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWeeks4to6PELessons();