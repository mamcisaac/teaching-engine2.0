import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks4to6PELessons() {
  console.log('🏃 CREATING PERFECT PE LESSONS - MON CORPS EN MOUVEMENT - WEEKS 4-6');
  console.log('='.repeat(60));

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
      unitPlanId: unit.id,
      lessonNumber: 13,
      title: "Jeux simples avec règles",
      date: new Date('2025-09-22'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Introduction aux jeux avec règles',
      objectives: [
        'Comprendre et suivre des règles simples',
        'Jouer en équipe de manière coopérative',
        'Respecter les tours de jeu'
      ],
      materials: [
        'Cônes pour délimiter les espaces',
        'Cerceaux',
        'Ballons variés',
        'Dossards de couleurs',
        'Sifflet',
        'Chronomètre'
      ],
      lessonPlan: {
        hook: "Qui connaît un jeu avec des règles? Aujourd'hui, nous allons apprendre à jouer ensemble!",
        introduction: "Les jeux avec règles nous aident à jouer ensemble de manière équitable et amusante. Nous devons écouter, comprendre et suivre les règles pour que tout le monde s'amuse.",
        mainActivity: [
          '1. Échauffement: "Jacques a dit" version active (5 min)',
          '2. Jeu "Feu rouge, feu vert" avec variations (10 min)',
          '3. Introduction du jeu "Chat et souris" avec règles simples (15 min)',
          '4. Pratique du jeu en petits groupes (10 min)'
        ],
        conclusion: "Qu'avez-vous appris sur les règles aujourd'hui? Pourquoi sont-elles importantes?"
      },
      assessment: 'Observation de la capacité à suivre les règles et à jouer de manière coopérative',
      homework: 'Jouer à un jeu avec règles à la maison et expliquer les règles à la famille',
      technologyIntegration: 'Utilisation de signaux visuels et sonores pour les changements de jeu',
      realWorldConnections: 'Les règles dans la vie quotidienne (classe, maison, société)',
      standards: ['1.1', '1.2', '2.1'],
      crossCurricularLinks: {
        socialStudies: "Règles et responsabilités dans la communauté",
        math: "Compter les points, comprendre les tours"
      },
      differentiation: {
        forStruggling: [
          'Règles simplifiées avec support visuel',
          'Partenaire pour aider à comprendre',
          'Rôles adaptés (arbitre assistant)'
        ],
        forAdvanced: [
          'Rôle de capitaine d\'équipe',
          'Création de variations de règles',
          'Aide aux autres élèves'
        ]
      },
      resources: [
        'Guide des jeux coopératifs pour le primaire',
        'Affiches visuelles des règles',
        'Vidéos de démonstration des jeux'
      ],
      safetyConsiderations: [
        'Espaces de jeu bien délimités',
        'Règles de contact appropriées',
        'Surveillance des interactions'
      ],
      notes: 'Insister sur le respect mutuel et l\'esprit sportif. Valoriser la participation plutôt que la compétition.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 14,
      title: "Course à relais",
      date: new Date('2025-09-23'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Jeux d\'équipe et relais',
      objectives: [
        'Travailler en équipe efficacement',
        'Développer la vitesse et l\'agilité',
        'Encourager ses coéquipiers'
      ],
      materials: [
        'Témoins de relais (ou objets substituts)',
        'Cônes pour marquer les parcours',
        'Dossards d\'équipe',
        'Obstacles variés',
        'Chronomètre',
        'Tableau de score'
      ],
      lessonPlan: {
        hook: "Avez-vous déjà vu une course de relais aux Jeux olympiques? Aujourd'hui, nous sommes des athlètes!",
        introduction: "Dans une course de relais, chaque membre de l'équipe est important. Nous devons nous passer le témoin et encourager nos amis.",
        mainActivity: [
          '1. Échauffement: course sur place et étirements dynamiques (5 min)',
          '2. Pratique du passage de témoin en marchant puis en courant (10 min)',
          '3. Relais simple en ligne droite (10 min)',
          '4. Relais avec obstacles simples (10 min)',
          '5. Course finale avec toutes les équipes (5 min)'
        ],
        conclusion: "Comment votre équipe a-t-elle travaillé ensemble? Qu'est-ce qui était le plus difficile?"
      },
      assessment: 'Évaluation de la technique de passage, de l\'esprit d\'équipe et de l\'effort',
      homework: 'Pratiquer la course avec un membre de la famille',
      technologyIntegration: 'Chronométrage numérique, musique motivante pour les courses',
      realWorldConnections: 'Sports d\'équipe, importance de la coopération dans la vie',
      standards: ['1.1', '1.3', '2.2'],
      crossCurricularLinks: {
        math: "Mesurer le temps, comparer les distances",
        science: "Le corps en mouvement, l'énergie"
      },
      differentiation: {
        forStruggling: [
          'Distances plus courtes',
          'Marche rapide au lieu de course',
          'Rôle spécial (starter, chronométreur)'
        ],
        forAdvanced: [
          'Parcours plus complexes',
          'Rôle de chef d\'équipe',
          'Défis supplémentaires (dribble, etc.)'
        ]
      },
      resources: [
        'Vidéos de courses de relais',
        'Musique rythmée pour motivation',
        'Certificats de participation'
      ],
      safetyConsiderations: [
        'Surface de course sécuritaire',
        'Zones de passage bien définies',
        'Échauffement approprié'
      ],
      notes: 'Créer des équipes équilibrées. Célébrer l\'effort et l\'amélioration personnelle.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 15,
      title: "Jeu du parachute",
      date: new Date('2025-09-25'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Coopération et coordination de groupe',
      objectives: [
        'Coordonner ses mouvements avec le groupe',
        'Suivre des instructions rythmées',
        'Développer la force du haut du corps'
      ],
      materials: [
        'Grand parachute de jeu',
        'Balles légères de différentes tailles',
        'Ballons',
        'Musique rythmée',
        'Espace intérieur ou extérieur dégagé'
      ],
      lessonPlan: {
        hook: "Regardez ce grand parachute coloré! Ensemble, nous pouvons créer de la magie!",
        introduction: "Le parachute est un outil spécial qui nous permet de jouer tous ensemble. Nous devons écouter et bouger ensemble pour que ça fonctionne.",
        mainActivity: [
          '1. Exploration libre du parachute (5 min)',
          '2. Vagues: petites, moyennes, grandes (7 min)',
          '3. Pop-corn: faire sauter les balles (8 min)',
          '4. Champignon: soulever et s\'asseoir dessous (8 min)',
          '5. Carrousel: tourner en tenant le parachute (7 min)',
          '6. Jeu calme: bercer doucement (5 min)'
        ],
        conclusion: "Qu'avez-vous préféré? Comment avons-nous réussi à travailler ensemble?"
      },
      assessment: 'Observation de la participation, de l\'écoute des consignes et de la coopération',
      homework: 'Dessiner son activité préférée avec le parachute',
      technologyIntegration: 'Musique synchronisée avec les mouvements, vidéo des activités pour révision',
      realWorldConnections: 'Travail d\'équipe, importance de la synchronisation',
      standards: ['1.2', '2.1', '2.3'],
      crossCurricularLinks: {
        music: "Rythme et tempo",
        science: "Forces, mouvement de l'air"
      },
      differentiation: {
        forStruggling: [
          'Position adaptée (assis si nécessaire)',
          'Tenir avec une main seulement',
          'Rôle d\'observateur actif'
        ],
        forAdvanced: [
          'Diriger une activité',
          'Créer de nouveaux mouvements',
          'Aider les autres élèves'
        ]
      },
      resources: [
        'Guide d\'activités avec parachute',
        'Playlist de musique appropriée',
        'Cartes visuelles des activités'
      ],
      safetyConsiderations: [
        'Espace suffisant autour du parachute',
        'Sol non glissant',
        'Surveillance des élèves sous le parachute'
      ],
      notes: 'Activité excellente pour l\'inclusion. Tous les élèves peuvent participer à leur niveau.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 16,
      title: "Parcours d'aventure",
      date: new Date('2025-09-26'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Parcours avec défis variés',
      objectives: [
        'Naviguer dans un parcours complexe',
        'Utiliser différentes habiletés motrices',
        'Persévérer face aux défis'
      ],
      materials: [
        'Matelas de gymnastique',
        'Bancs suédois',
        'Cerceaux',
        'Cordes à sauter',
        'Tunnels',
        'Cônes et obstacles variés',
        'Chronomètre'
      ],
      lessonPlan: {
        hook: "Aujourd'hui, nous sommes des explorateurs dans une jungle d'aventures!",
        introduction: "Notre parcours d'aventure a plusieurs stations. Chaque station est un nouveau défi à relever!",
        mainActivity: [
          '1. Présentation du parcours et démonstration (5 min)',
          '2. Station 1: Ramper sous les tunnels (rotation 5 min)',
          '3. Station 2: Sauter d\'un cerceau à l\'autre (rotation 5 min)',
          '4. Station 3: Équilibre sur le banc (rotation 5 min)',
          '5. Station 4: Lancer dans la cible (rotation 5 min)',
          '6. Station 5: Roulade sur matelas (rotation 5 min)',
          '7. Parcours complet chronométré (10 min)'
        ],
        conclusion: "Quelle station était la plus difficile? Comment vous êtes-vous améliorés?"
      },
      assessment: 'Portfolio de progrès avec temps et observations par station',
      homework: 'Créer un mini-parcours à la maison avec des objets sécuritaires',
      technologyIntegration: 'Tablette pour enregistrer les temps, musique d\'ambiance aventure',
      realWorldConnections: 'Résolution de problèmes, adaptation aux défis',
      standards: ['1.1', '1.2', '1.3'],
      crossCurricularLinks: {
        geography: "Explorer différents environnements",
        language: "Vocabulaire spatial et directionnel"
      },
      differentiation: {
        forStruggling: [
          'Options alternatives à chaque station',
          'Parcours simplifié',
          'Aide d\'un pair'
        ],
        forAdvanced: [
          'Défis supplémentaires par station',
          'Chronométrage personnel',
          'Création de nouvelles stations'
        ]
      },
      resources: [
        'Plans de parcours adaptés',
        'Cartes de station illustrées',
        'Musique thématique d\'aventure'
      ],
      safetyConsiderations: [
        'Matelas de protection',
        'Supervision à chaque station',
        'Vérification du matériel avant usage'
      ],
      notes: 'Rotation des groupes toutes les 5 minutes. Encourager l\'entraide entre élèves.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },

    // ==================== WEEK 5: FITNESS ET HABITUDES SAINES ====================
    {
      unitPlanId: unit.id,
      lessonNumber: 17,
      title: "Mon cœur qui bat",
      date: new Date('2025-09-29'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Système cardiovasculaire et exercice',
      objectives: [
        'Comprendre que le cœur bat plus vite avec l\'exercice',
        'Sentir son pouls',
        'Reconnaître l\'importance de l\'exercice pour la santé'
      ],
      materials: [
        'Stéthoscopes jouets (optionnel)',
        'Chronomètre',
        'Affiches du corps humain',
        'Autocollants cœur',
        'Musique rythmée',
        'Carnet de santé personnel'
      ],
      lessonPlan: {
        hook: "Mettez votre main sur votre cœur. Sentez-vous quelque chose? C'est votre cœur qui travaille!",
        introduction: "Notre cœur est un muscle spécial qui pompe le sang dans tout notre corps. Quand nous bougeons, il travaille plus fort!",
        mainActivity: [
          '1. Trouver son pouls au repos (5 min)',
          '2. Activité légère: marche sur place (3 min) + vérifier le pouls',
          '3. Activité modérée: sauts de grenouille (3 min) + vérifier le pouls',
          '4. Activité intense: course sur place (3 min) + vérifier le pouls',
          '5. Retour au calme: respiration profonde (5 min)',
          '6. Comparer les battements à différents moments (5 min)',
          '7. Dessiner un cœur et colorier selon l\'intensité (5 min)'
        ],
        conclusion: "Qu'avez-vous remarqué sur votre cœur? Pourquoi est-il important de faire de l'exercice?"
      },
      assessment: 'Capacité à identifier les changements de rythme cardiaque, participation active',
      homework: 'Vérifier son pouls après différentes activités à la maison',
      technologyIntegration: 'Application de monitoring cardiaque adaptée aux enfants (démonstration)',
      realWorldConnections: 'Santé cardiaque, habitudes de vie saines',
      standards: ['1.4', '3.1', '3.2'],
      crossCurricularLinks: {
        science: "Le corps humain, le système circulatoire",
        math: "Compter les battements, comparer les nombres"
      },
      differentiation: {
        forStruggling: [
          'Activités d\'intensité adaptée',
          'Aide pour trouver le pouls',
          'Représentation visuelle des battements'
        ],
        forAdvanced: [
          'Calculer les battements par minute',
          'Créer un graphique des battements',
          'Expliquer aux autres'
        ]
      },
      resources: [
        'Vidéo éducative sur le cœur',
        'Chanson sur le système circulatoire',
        'Modèle 3D du cœur'
      ],
      safetyConsiderations: [
        'Intensité progressive des exercices',
        'Surveillance des signes de fatigue',
        'Hydratation régulière'
      ],
      notes: 'Leçon importante pour la conscience corporelle et la santé. Adapter selon les capacités individuelles.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 18,
      title: "Circuit fitness des animaux",
      date: new Date('2025-09-30'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Exercices de conditionnement physique',
      objectives: [
        'Développer la force et l\'endurance',
        'Imiter les mouvements des animaux',
        'Maintenir l\'effort pendant une durée déterminée'
      ],
      materials: [
        'Cartes d\'animaux avec mouvements',
        'Tapis de sol',
        'Minuterie',
        'Musique énergique',
        'Cônes pour les stations',
        'Tableau de progression'
      ],
      lessonPlan: {
        hook: "Aujourd'hui, nous allons bouger comme différents animaux! Chaque animal a sa façon spéciale de se déplacer.",
        introduction: "Les animaux sont très forts et agiles. En imitant leurs mouvements, nous devenons plus forts aussi!",
        mainActivity: [
          '1. Échauffement: parade des animaux (5 min)',
          '2. Station 1: Sauts de kangourou (3 min)',
          '3. Station 2: Marche de l\'ours (3 min)',
          '4. Station 3: Pas de crabe (3 min)',
          '5. Station 4: Rampement du serpent (3 min)',
          '6. Station 5: Galop du cheval (3 min)',
          '7. Station 6: Vol de l\'oiseau (bras) (3 min)',
          '8. Défi final: zoo en folie - tous les animaux (5 min)',
          '9. Retour au calme: étirement du chat (5 min)'
        ],
        conclusion: "Quel animal était le plus difficile à imiter? Lequel était le plus amusant?"
      },
      assessment: 'Observation de l\'effort soutenu, de la forme des mouvements et de la persévérance',
      homework: 'Montrer 3 mouvements d\'animaux à la famille',
      technologyIntegration: 'Vidéos d\'animaux en mouvement, application de timer avec sons d\'animaux',
      realWorldConnections: 'Mouvements naturels, observation de la nature',
      standards: ['1.1', '1.4', '3.1'],
      crossCurricularLinks: {
        science: "Étude des animaux et leurs habitats",
        language: "Vocabulaire des animaux et des actions"
      },
      differentiation: {
        forStruggling: [
          'Mouvements modifiés plus simples',
          'Durée réduite par station',
          'Repos supplémentaires autorisés'
        ],
        forAdvanced: [
          'Ajout de variations complexes',
          'Démonstration pour la classe',
          'Création de nouveaux mouvements d\'animaux'
        ]
      },
      resources: [
        'Affiches des mouvements d\'animaux',
        'Playlist énergique adaptée',
        'Certificats "Expert animalier en forme"'
      ],
      safetyConsiderations: [
        'Espace suffisant entre les élèves',
        'Surface appropriée pour les mouvements au sol',
        'Échauffement progressif'
      ],
      notes: 'Circuit très motivant pour les élèves. Ajuster l\'intensité selon le groupe.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 19,
      title: "Yoga pour enfants",
      date: new Date('2025-10-02'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Flexibilité et relaxation',
      objectives: [
        'Développer la flexibilité et l\'équilibre',
        'Apprendre à se détendre et respirer',
        'Améliorer la concentration'
      ],
      materials: [
        'Tapis de yoga ou serviettes',
        'Musique calme',
        'Cartes de poses de yoga pour enfants',
        'Petites peluches pour la respiration',
        'Bougies LED (ambiance)',
        'Huile essentielle de lavande (diffuseur)'
      ],
      lessonPlan: {
        hook: "Aujourd'hui, nous allons faire un voyage magique avec notre corps. Nous allons devenir des arbres, des montagnes et des étoiles!",
        introduction: "Le yoga nous aide à être forts, flexibles et calmes. C'est comme une danse très lente qui nous fait du bien.",
        mainActivity: [
          '1. Respiration du ballon: gonfler et dégonfler le ventre (3 min)',
          '2. Salutation au soleil adaptée (5 min)',
          '3. Pose de l\'arbre (équilibre) (5 min)',
          '4. Pose du chat et de la vache (5 min)',
          '5. Pose du papillon (5 min)',
          '6. Pose du guerrier (force) (5 min)',
          '7. Pose de l\'enfant (repos) (3 min)',
          '8. Relaxation finale: voyage imaginaire (7 min)'
        ],
        conclusion: "Comment vous sentez-vous maintenant? Quelle pose avez-vous préférée?"
      },
      assessment: 'Observation de la concentration, de l\'effort pour maintenir les poses et de la respiration',
      homework: 'Pratiquer la respiration du ballon avant de dormir',
      technologyIntegration: 'Application de méditation guidée pour enfants, musique de relaxation',
      realWorldConnections: 'Gestion du stress, techniques de relaxation pour la vie',
      standards: ['1.2', '3.3', '3.4'],
      crossCurricularLinks: {
        health: "Bien-être mental et émotionnel",
        science: "Le système respiratoire"
      },
      differentiation: {
        forStruggling: [
          'Poses modifiées avec support',
          'Durée réduite des poses',
          'Position assise ou couchée si nécessaire'
        ],
        forAdvanced: [
          'Poses plus complexes',
          'Tenir les poses plus longtemps',
          'Aider à guider une pose'
        ]
      },
      resources: [
        'Livre de yoga pour enfants',
        'Cartes illustrées des poses',
        'Histoires de relaxation'
      ],
      safetyConsiderations: [
        'Ne pas forcer les étirements',
        'Respecter les limites de chacun',
        'Surface antidérapante'
      ],
      notes: 'Excellente activité pour la gestion des émotions et le retour au calme.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 20,
      title: "Défi santé en équipe",
      date: new Date('2025-10-03'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Activités de groupe pour la santé',
      objectives: [
        'Travailler en équipe vers un objectif commun',
        'Comprendre les différents aspects de la santé',
        'S\'encourager mutuellement'
      ],
      materials: [
        'Stations d\'activités variées',
        'Cartes de défis santé',
        'Tableau de points',
        'Récompenses (autocollants)',
        'Fruits pour dégustation',
        'Affiches sur la santé'
      ],
      lessonPlan: {
        hook: "Aujourd'hui, c'est le grand défi santé! Chaque équipe va collecter des points en complétant des défis!",
        introduction: "Être en santé, c'est bouger, bien manger, bien dormir et être heureux. Voyons comment nous pouvons tous être champions de la santé!",
        mainActivity: [
          '1. Formation des équipes et explication des règles (5 min)',
          '2. Défi 1: Course d\'endurance en équipe (5 min)',
          '3. Défi 2: Quiz sur l\'alimentation saine (5 min)',
          '4. Défi 3: Création d\'une danse santé (7 min)',
          '5. Défi 4: Dégustation de fruits les yeux bandés (5 min)',
          '6. Défi 5: Affiche des bonnes habitudes (8 min)',
          '7. Présentation et célébration (5 min)'
        ],
        conclusion: "Qu'avez-vous appris sur la santé aujourd'hui? Comment pouvez-vous être en meilleure santé?"
      },
      assessment: 'Évaluation de la participation, de la coopération et de la compréhension des concepts de santé',
      homework: 'Créer un plan familial d\'activités santé pour la fin de semaine',
      technologyIntegration: 'Présentation interactive sur la santé, musique motivante',
      realWorldConnections: 'Habitudes de vie saines, prévention des maladies',
      standards: ['2.1', '3.1', '3.2', '3.3'],
      crossCurricularLinks: {
        health: "Nutrition et bien-être",
        science: "Le corps humain et ses besoins"
      },
      differentiation: {
        forStruggling: [
          'Rôles adaptés dans l\'équipe',
          'Défis modifiés selon les capacités',
          'Support d\'un pair mentor'
        ],
        forAdvanced: [
          'Rôle de capitaine d\'équipe',
          'Défis bonus supplémentaires',
          'Aide à l\'animation des stations'
        ]
      },
      resources: [
        'Guide canadien d\'activité physique',
        'Pyramide alimentaire adaptée',
        'Vidéos sur les habitudes saines'
      ],
      safetyConsiderations: [
        'Vérifier les allergies alimentaires',
        'Activités adaptées à tous',
        'Hydratation fréquente'
      ],
      notes: 'Journée spéciale très motivante. Possibilité d\'inviter l\'infirmière scolaire.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },

    // ==================== WEEK 6: INTRODUCTION AUX SPORTS ====================
    {
      unitPlanId: unit.id,
      lessonNumber: 21,
      title: "Introduction au soccer",
      date: new Date('2025-10-06'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Habiletés de base au soccer',
      objectives: [
        'Apprendre à contrôler le ballon avec les pieds',
        'Développer la coordination pied-œil',
        'Comprendre les règles de base du soccer'
      ],
      materials: [
        'Ballons de soccer taille 3',
        'Cônes pour dribble',
        'Mini-buts ou cônes pour buts',
        'Dossards de couleurs',
        'Sifflet',
        'Lignes de démarcation'
      ],
      lessonPlan: {
        hook: "Qui connaît un joueur de soccer célèbre? Aujourd'hui, vous allez apprendre à jouer comme eux!",
        introduction: "Le soccer est un sport où on utilise nos pieds pour contrôler le ballon. C'est le sport le plus populaire au monde!",
        mainActivity: [
          '1. Échauffement: course avec mouvements de pieds (5 min)',
          '2. Familiarisation: toucher le ballon avec différentes parties du pied (5 min)',
          '3. Dribble stationnaire puis en mouvement (8 min)',
          '4. Passe à un partenaire (7 min)',
          '5. Tir au but à tour de rôle (7 min)',
          '6. Mini-match 3 contre 3 (8 min)'
        ],
        conclusion: "Qu'est-ce qui était le plus difficile? Qu'avez-vous préféré?"
      },
      assessment: 'Observation du contrôle du ballon, de la participation et du respect des règles',
      homework: 'Pratiquer le dribble avec une balle à la maison',
      technologyIntegration: 'Vidéo de techniques de base, musique d\'échauffement',
      realWorldConnections: 'Sports professionnels, travail d\'équipe, exercice cardiovasculaire',
      standards: ['1.1', '1.3', '2.1', '2.2'],
      crossCurricularLinks: {
        geography: "Pays où le soccer est populaire",
        math: "Compter les buts, mesurer les distances"
      },
      differentiation: {
        forStruggling: [
          'Ballon plus gros et plus mou',
          'Distance de tir réduite',
          'Rôle de gardien ou arbitre assistant'
        ],
        forAdvanced: [
          'Défis de dribble complexes',
          'Passes en mouvement',
          'Techniques avancées (jonglerie)'
        ]
      },
      resources: [
        'Vidéos de l\'Association canadienne de soccer',
        'Affiches des règles simplifiées',
        'Exercices progressifs de soccer'
      ],
      safetyConsiderations: [
        'Chaussures appropriées',
        'Espace dégagé pour les tirs',
        'Règles de contact limitées'
      ],
      notes: 'Emphase sur le plaisir et la participation plutôt que la compétition.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 22,
      title: "Basketball pour débutants",
      date: new Date('2025-10-07'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Habiletés de base au basketball',
      objectives: [
        'Apprendre à dribbler et contrôler le ballon',
        'Pratiquer le lancer au panier',
        'Développer la coordination main-œil'
      ],
      materials: [
        'Ballons de basketball taille junior',
        'Paniers ajustables ou cerceaux',
        'Cônes pour parcours',
        'Dossards',
        'Lignes au sol',
        'Musique rythmée'
      ],
      lessonPlan: {
        hook: "Avez-vous déjà vu un match de basketball? Les joueurs font rebondir le ballon comme par magie!",
        introduction: "Le basketball est un sport où on doit faire rebondir le ballon et le lancer dans un panier. C'est un excellent exercice pour tout le corps!",
        mainActivity: [
          '1. Échauffement: passer et attraper en cercle (5 min)',
          '2. Dribble sur place: main droite, main gauche (7 min)',
          '3. Dribble en déplacement entre les cônes (8 min)',
          '4. Technique de lancer: position et mouvement (5 min)',
          '5. Pratique du lancer dans des cerceaux au sol (7 min)',
          '6. Relais de dribble et lancer (8 min)'
        ],
        conclusion: "Qu'avez-vous trouvé le plus amusant? Le plus difficile?"
      },
      assessment: 'Évaluation du contrôle du ballon, de la technique de lancer et de l\'effort',
      homework: 'Pratiquer le dribble pendant 5 minutes',
      technologyIntegration: 'Vidéos au ralenti de la technique, tableau de score numérique',
      realWorldConnections: 'Sports d\'équipe, coordination, persévérance',
      standards: ['1.1', '1.3', '2.1'],
      crossCurricularLinks: {
        math: "Trajectoires, angles, comptage des points",
        science: "Gravité et rebonds"
      },
      differentiation: {
        forStruggling: [
          'Paniers plus bas ou cerceaux au sol',
          'Ballons plus légers',
          'Distance de lancer réduite'
        ],
        forAdvanced: [
          'Dribble avec obstacles',
          'Lancer de plus loin',
          'Combinaisons dribble-passe-lancer'
        ]
      },
      resources: [
        'Guide Basketball Canada pour jeunes',
        'Vidéos de techniques adaptées',
        'Jeux de basketball modifiés'
      ],
      safetyConsiderations: [
        'Ballons appropriés à l\'âge',
        'Espace suffisant entre les élèves',
        'Surface non glissante'
      ],
      notes: 'Adapter la hauteur des paniers selon les capacités. Focus sur le plaisir d\'apprendre.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 23,
      title: "Hockey sur gazon modifié",
      date: new Date('2025-10-09'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Introduction au hockey',
      objectives: [
        'Manipuler un bâton et une balle en sécurité',
        'Développer la coordination œil-main-bâton',
        'Apprendre les passes et le contrôle'
      ],
      materials: [
        'Bâtons de hockey en plastique',
        'Balles ou rondelles en mousse',
        'Cônes pour les buts',
        'Cônes pour parcours',
        'Dossards',
        'Ruban adhésif pour zones'
      ],
      lessonPlan: {
        hook: "Aujourd'hui, nous allons jouer au hockey... mais sans glace! C'est le hockey sur gazon!",
        introduction: "Le hockey sur gazon est un sport d'équipe où on utilise un bâton pour contrôler une balle. Il faut être précis et travailler ensemble!",
        mainActivity: [
          '1. Règles de sécurité: tenir le bâton correctement (5 min)',
          '2. Contrôle stationnaire de la balle (5 min)',
          '3. Dribble en ligne droite et en slalom (8 min)',
          '4. Passes avec un partenaire (7 min)',
          '5. Tir au but à tour de rôle (7 min)',
          '6. Mini-match 4 contre 4 avec règles adaptées (8 min)'
        ],
        conclusion: "Comment avez-vous trouvé le contrôle du bâton? Qu'est-ce qui était nouveau pour vous?"
      },
      assessment: 'Observation de la manipulation sécuritaire, du contrôle et de la coopération',
      homework: 'Dessiner les règles de sécurité du hockey',
      technologyIntegration: 'Vidéo des techniques de base, chronomètre pour les rotations',
      realWorldConnections: 'Sports d\'équipe canadiens, coordination complexe',
      standards: ['1.1', '1.3', '2.1', '2.2'],
      crossCurricularLinks: {
        history: "Histoire du hockey au Canada",
        science: "Friction et mouvement"
      },
      differentiation: {
        forStruggling: [
          'Balle plus grosse et plus lente',
          'Zone de jeu réduite',
          'Rôle de gardien avec moins de déplacements'
        ],
        forAdvanced: [
          'Parcours techniques complexes',
          'Passes en mouvement',
          'Stratégies d\'équipe'
        ]
      },
      resources: [
        'Guide Hockey Canada initiation',
        'Vidéos de hockey sur gazon',
        'Règles simplifiées illustrées'
      ],
      safetyConsiderations: [
        'Bâtons toujours bas (pas plus haut que la taille)',
        'Distance sécuritaire entre joueurs',
        'Équipement en mousse seulement'
      ],
      notes: 'Insister fortement sur la sécurité. Aucun contact physique permis.',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    },
    {
      unitPlanId: unit.id,
      lessonNumber: 24,
      title: "Mini-olympiades",
      date: new Date('2025-10-10'),
      duration: 40,
      subject: 'Éducation physique',
      topic: 'Compétition amicale multi-sports',
      objectives: [
        'Appliquer diverses habiletés apprises',
        'Démontrer l\'esprit sportif',
        'Célébrer les accomplissements'
      ],
      materials: [
        'Équipement varié des sports pratiqués',
        'Médailles ou certificats',
        'Drapeaux ou bannières d\'équipe',
        'Tableau de pointage',
        'Musique olympique',
        'Podium improvisé'
      ],
      lessonPlan: {
        hook: "Bienvenue aux mini-olympiades de notre classe! Chaque équipe représente un pays imaginaire!",
        introduction: "Les olympiades célèbrent le sport, l'amitié et le dépassement de soi. Aujourd'hui, nous sommes tous des olympiens!",
        mainActivity: [
          '1. Cérémonie d\'ouverture: défilé des équipes (3 min)',
          '2. Épreuve 1: Sprint 20 mètres (5 min)',
          '3. Épreuve 2: Lancer de précision (5 min)',
          '4. Épreuve 3: Saut en longueur (5 min)',
          '5. Épreuve 4: Parcours d\'obstacles (7 min)',
          '6. Épreuve 5: Relais final (7 min)',
          '7. Cérémonie de clôture et remise des médailles (8 min)'
        ],
        conclusion: "Qu'avez-vous préféré? Comment avez-vous encouragé vos coéquipiers?"
      },
      assessment: 'Portfolio des performances, observation de l\'esprit sportif et de l\'effort',
      homework: 'Raconter son moment préféré des olympiades à la famille',
      technologyIntegration: 'Musique olympique, photos/vidéos des performances, tableau numérique',
      realWorldConnections: 'Jeux olympiques, compétition saine, excellence personnelle',
      standards: ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3'],
      crossCurricularLinks: {
        geography: "Pays participants aux Jeux olympiques",
        history: "Histoire des Jeux olympiques",
        math: "Mesures et comparaisons des performances"
      },
      differentiation: {
        forStruggling: [
          'Épreuves adaptées aux capacités',
          'Rôles spéciaux (porteur de flamme, annonceur)',
          'Points bonus pour l\'effort'
        ],
        forAdvanced: [
          'Défis supplémentaires dans chaque épreuve',
          'Rôle de capitaine ou officiel',
          'Records personnels à battre'
        ]
      },
      resources: [
        'Vidéos inspirantes des Jeux olympiques',
        'Hymne olympique',
        'Modèles de certificats'
      ],
      safetyConsiderations: [
        'Échauffement complet avant les épreuves',
        'Rotation organisée des épreuves',
        'Premiers soins disponibles'
      ],
      notes: 'Journée spéciale culminante de la première partie de l\'unité. Célébrer tous les participants!',
      reflection: '',
      createdAt: new Date('2025-01-27'),
      updatedAt: new Date('2025-01-27')
    }
  ];

  try {
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson ${created.lessonNumber}: ${created.title}`);
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