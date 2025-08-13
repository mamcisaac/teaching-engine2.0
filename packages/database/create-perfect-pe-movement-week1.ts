import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeek1PELessons() {
  console.log('🏃 CREATING PERFECT PE LESSONS - MON CORPS EN MOUVEMENT - WEEK 1');
  console.log('=' .repeat(60));

  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mon corps en mouvement' }
  });

  if (!unit) {
    console.error('❌ Unit not found');
    return;
  }

  console.log('Found unit:', unit.title);
  console.log('Creating Week 1 lessons (September 2-5, 2025)');

  // Lesson 1: Tuesday September 2 - Introduction to PE and Safety
  const lesson1 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Bienvenue en éducation physique!',
      titleFr: 'Bienvenue en éducation physique!',
      date: new Date('2025-09-02'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 CERCLE DE BIENVENUE (5 min)

Rassemblement au centre du gymnase :
- Les élèves s'assoient en cercle
- Présentation des règles de sécurité avec gestes :
  * STOP = Main levée (arrêt immédiat)
  * ÉCOUTEZ = Mains sur les oreilles
  * REGARDEZ = Pointer les yeux
  * SÉCURITÉ = Pouces en l'air

Jeu d'échauffement "Jacques a dit" :
- Pratiquer les signaux de sécurité
- Mouvements simples : sauter, tourner, s'asseoir
- Renforcer le vocabulaire du corps en français
      `,
      
      action: `
📚 EXPLORATION DU GYMNASE (20 min)

1. Tour guidé du gymnase (5 min) :
- Identifier les zones importantes :
  * Ligne de départ (ligne bleue)
  * Zone de rassemblement (cercle central)
  * Espace de rangement du matériel
  * Fontaine d'eau et sortie d'urgence
- Pratiquer les déplacements sécuritaires

2. Jeu "Les statues musicales" (7 min) :
- Musique = bouger dans l'espace
- Pause = faire une statue
- Varier les mouvements : marcher, sautiller, galoper
- Emphase sur l'espace personnel (bras étendus)

3. Parcours de découverte (8 min) :
- 4 stations simples avec cônes :
  * Station 1 : Sauter par-dessus des lignes
  * Station 2 : Marcher en équilibre sur une ligne
  * Station 3 : Courir autour des cônes
  * Station 4 : Lancer des sacs de fèves dans un cerceau
- Rotation toutes les 2 minutes
- Focus sur la sécurité et le respect de l'espace
      `,
      
      consolidation: `
🎯 RETOUR AU CALME (5 min)

Cercle de réflexion :
- Respiration profonde (3 fois)
- "Qu'avez-vous aimé aujourd'hui?"
- Révision des signaux de sécurité

Étirements guidés :
- Bras vers le ciel (arbre qui pousse)
- Toucher les orteils (cueillir des fleurs)
- Rotation des épaules (moulins à vent)

Félicitations : "Bravo les amis! Vous êtes des champions de la sécurité!"
      `,
      
      learningGoals: `
- Je peux suivre les règles de sécurité du gymnase
- Je peux me déplacer de différentes façons dans l'espace
- Je peux respecter mon espace personnel et celui des autres
- Je peux identifier les différentes zones du gymnase
      `,
      
      materials: [
        'Musique énergique adaptée aux enfants',
        'Cônes de couleurs variées (20)',
        'Cerceaux (4-6)',
        'Sacs de fèves (10-15)',
        'Affiches des signaux de sécurité',
        'Autocollants de récompense'
      ],
      
      accommodations: {
        physical: [
          'Permettre des pauses au besoin',
          'Adapter les mouvements (marcher au lieu de courir)',
          'Espace calme disponible pour repos'
        ],
        cognitive: [
          'Démonstrations visuelles claires',
          'Répétition des consignes avec gestes',
          'Partenaire pour modéliser les activités'
        ],
        sensory: [
          'Volume de musique ajustable',
          'Option de porter des écouteurs antibruit',
          'Signaux visuels en plus des signaux sonores'
        ],
        language: [
          'Gestes et démonstrations pour accompagner les instructions',
          'Vocabulaire simplifié avec répétition',
          'Pairs bilingues pour support'
        ]
      },
      
      modifications: {
        advanced: [
          'Leader pour démontrer les mouvements',
          'Défis supplémentaires aux stations',
          'Aider les autres élèves'
        ],
        struggling: [
          'Commencer avec 2 stations au lieu de 4',
          'Mouvements simplifiés',
          'Plus de temps à chaque station'
        ],
        wheelchair: [
          'Mouvements du haut du corps',
          'Parcours adapté pour fauteuil roulant',
          'Participation comme chronométreur ou coach'
        ]
      },
      
      assessmentType: 'Diagnostique - Observation des habiletés de base',
      assessmentNotes: `
Grille d'observation initiale :
□ Suit les consignes de sécurité
□ Se déplace avec contrôle
□ Respecte l'espace personnel
□ Participe avec enthousiasme
□ Comprend les signaux de base

Noter les élèves nécessitant :
- Support linguistique supplémentaire
- Adaptations physiques
- Encouragement pour participation
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 PREMIÈRE LEÇON D'ÉDUCATION PHYSIQUE

Matériel prêt :
✓ Cônes installés pour le parcours
✓ Musique sur le système audio (playlist "PE Grade 1")
✓ Affiches de sécurité sur le mur

Routine de début :
1. Rassemblement au cercle central
2. Présentation des 4 signaux de sécurité
3. Pratiquer avec "Jacques a dit"

Gestion de classe :
- Signal STOP = arrêt immédiat de toute activité
- Utiliser beaucoup de renforcement positif
- Permettre des pauses d'eau après chaque activité

Notes importantes :
- Certains élèves sont nouveaux au gymnase
- Emphase sur la sécurité cette première semaine
- Garder le rythme dynamique mais sécuritaire

Contact d'urgence : Bureau principal ext. 101
      `,
      
      differentiationStrategies: {
        process: [
          'Choix du niveau d\'intensité des mouvements',
          'Temps flexible aux stations',
          'Options pour démontrer la compréhension'
        ],
        product: [
          'Différentes façons de compléter le parcours',
          'Choix de mouvements créatifs',
          'Auto-évaluation avec émojis'
        ],
        content: [
          'Complexité variable des instructions',
          'Support visuel pour les consignes',
          'Progression graduelle des défis'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 1:', lesson1.title);

  // Lesson 2: Wednesday September 3 - Basic Locomotor Skills
  const lesson2 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Je bouge de toutes les façons!',
      titleFr: 'Je bouge de toutes les façons!',
      date: new Date('2025-09-03'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 ÉCHAUFFEMENT ANIMAL (5 min)

Cercle d'échauffement :
- "Quel animal êtes-vous aujourd'hui?"
- Imiter les animaux en mouvement :
  * Grenouille = sauter accroupi
  * Cheval = galoper
  * Crabe = marcher de côté
  * Éléphant = marcher lourdement
  * Oiseau = courir bras étendus

Transition : "Aujourd'hui, nous allons explorer toutes les façons de bouger notre corps!"
      `,
      
      action: `
📚 STATIONS DE LOCOMOTION (20 min)

Organisation : 4 stations, rotation aux 5 minutes

Station 1 - LA MARCHE CRÉATIVE :
- Marcher comme un géant (grands pas)
- Marcher comme une souris (petits pas)
- Marcher sur la pointe des pieds
- Marcher sur les talons
- Marcher en arrière

Station 2 - LE MONDE DES SAUTS :
- Sauter sur place (2 pieds)
- Sauter en avant/arrière
- Sauter sur un pied (kangourou)
- Sauter par-dessus des lignes
- Sauts en étoile

Station 3 - COURIR EN SÉCURITÉ :
- Courir sur place
- Courir lentement (jogging)
- Courir vite (sprint court)
- Courir en levant les genoux
- Courir en zigzag entre les cônes

Station 4 - MOUVEMENTS SPÉCIAUX :
- Galoper comme un cheval
- Sautiller (skip)
- Pas chassés
- Ramper comme un serpent
- Rouler comme une bûche

Signal de rotation : Tambourin
Musique de fond : Rythmée mais pas trop forte
      `,
      
      consolidation: `
🎯 JEU DE RÉVISION ET CALME (5 min)

"Le chef d'orchestre du mouvement" :
- Un élève choisit un mouvement appris
- Les autres doivent l'imiter
- 3-4 élèves ont un tour

Retour au calme :
- Marche lente autour du gymnase
- Respiration : inspirer en levant les bras, expirer en les baissant
- Étirement final : étoile de mer (bras et jambes écartés)

Réflexion : "Quel était votre mouvement préféré?"
      `,
      
      learningGoals: `
- Je peux démontrer différentes façons de me déplacer
- Je peux contrôler mes mouvements dans l'espace
- Je peux changer de vitesse et de direction
- Je peux nommer les mouvements en français
      `,
      
      materials: [
        'Cônes colorés (16-20)',
        'Lignes de sol ou ruban adhésif',
        'Tambourin ou sifflet',
        'Affiches des mouvements avec images',
        'Musique rythmée',
        'Cerceaux pour délimiter les stations'
      ],
      
      accommodations: {
        physical: [
          'Mouvements adaptés selon les capacités',
          'Aide d\'un partenaire si nécessaire',
          'Options assises pour certains mouvements'
        ],
        cognitive: [
          'Démonstration avant chaque station',
          'Cartes visuelles des mouvements',
          'Répétition des consignes'
        ],
        sensory: [
          'Espace calme si surstimulation',
          'Repères visuels clairs',
          'Volume de musique ajusté'
        ],
        language: [
          'Mouvements modélisés par les pairs',
          'Vocabulaire avec gestes',
          'Instructions simples et répétées'
        ]
      },
      
      modifications: {
        advanced: [
          'Combiner deux mouvements',
          'Créer ses propres variations',
          'Mener une station'
        ],
        struggling: [
          'Commencer avec mouvements de base seulement',
          'Plus de pratique à chaque station',
          'Partenaire pour modéliser'
        ],
        injured: [
          'Mouvements du haut du corps seulement',
          'Rôle de coach ou chronométreur',
          'Adaptations selon la blessure'
        ]
      },
      
      assessmentType: 'Formative - Développement des habiletés locomotrices',
      assessmentNotes: `
Observation des habiletés locomotrices :
□ Marche avec équilibre
□ Court avec contrôle
□ Saute avec coordination
□ Galope avec rythme
□ Change de direction facilement

Niveau de maîtrise :
- Émergent : Besoin de pratique
- En développement : Progresse bien
- Maîtrise : Mouvement fluide et contrôlé
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 LEÇON DE LOCOMOTION

Organisation :
✓ 4 stations déjà installées avec cônes
✓ Affiches des mouvements à chaque station
✓ Musique prête (playlist "Locomotion")

Routine :
1. Échauffement animal (5 min)
2. Explication rapide des 4 stations
3. Rotation aux 5 minutes (signal tambourin)
4. Jeu final et retour au calme

Sécurité :
- Rappeler l'espace personnel
- Signal STOP pour arrêt immédiat
- Pauses d'eau entre les stations

Notes spéciales :
- Station 3 (course) : surveiller étroitement
- Certains élèves peuvent avoir peur de sauter
- Encourager mais ne pas forcer

Matériel de secours : Trousse dans l'armoire du gym
      `,
      
      differentiationStrategies: {
        process: [
          'Vitesse d\'exécution variable',
          'Choix de la complexité des mouvements',
          'Temps de pratique flexible'
        ],
        product: [
          'Démonstration individuelle ou en groupe',
          'Auto-évaluation avec cartes émojis',
          'Portfolio de mouvements maîtrisés'
        ],
        content: [
          'Progression des mouvements simples aux complexes',
          'Options de mouvements variés',
          'Support visuel adapté'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 2:', lesson2.title);

  // Lesson 3: Thursday September 4 - Balance and Coordination
  const lesson3 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'L\'équilibre, c\'est magique!',
      titleFr: 'L\'équilibre, c\'est magique!',
      date: new Date('2025-09-04'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 DÉFI D'ÉQUILIBRE (5 min)

Introduction ludique :
- "Qui peut tenir sur un pied comme un flamant rose?"
- Progression d'équilibre :
  * 2 pieds, yeux ouverts (5 secondes)
  * 2 pieds, yeux fermés (3 secondes)
  * 1 pied, yeux ouverts (3 secondes)
  * 1 pied, bras étendus (3 secondes)

Discussion : "Qu'est-ce qui nous aide à garder l'équilibre?"
- Regarder un point fixe
- Étendre les bras
- Respirer calmement
      `,
      
      action: `
📚 PARCOURS D'ÉQUILIBRE AVENTURE (20 min)

Mise en contexte : "Nous sommes des explorateurs traversant différents terrains!"

1. LA FORÊT DES LIGNES (5 min) :
- Marcher sur des lignes au sol (droites et courbes)
- Varier les défis :
  * En avant, en arrière, de côté
  * Avec un sac de fèves sur la tête
  * En tenant un objet
  * Les yeux fixés sur un point

2. LA RIVIÈRE AUX CROCODILES (5 min) :
- Traverser sur des "pierres" (cerceaux au sol)
- Sauter d'un cerceau à l'autre
- Maintenir l'équilibre 3 secondes dans chaque
- Variante : différentes positions dans chaque cerceau

3. LE PONT SUSPENDU (5 min) :
- Banc suédois retourné (ou ligne épaisse)
- Traverser de différentes façons :
  * Marche normale
  * Pas de souris (petits pas)
  * À quatre pattes
  * Avec aide d'un ami

4. LES STATUES DU MUSÉE (5 min) :
- Cartes avec positions d'équilibre
- Tenir chaque position 5 secondes :
  * L'arbre (sur un pied)
  * L'avion (bras étendus, une jambe levée)
  * La chaise (squat partiel)
  * L'étoile (bras et jambes écartés)
  * Le héros (fente avant)
      `,
      
      consolidation: `
🎯 YOGA DES ANIMAUX (5 min)

Retour au calme avec positions de yoga :
- Le chat : dos rond puis creux
- Le chien : position triangulaire
- Le papillon : assis, plantes des pieds ensemble
- L'enfant : position de repos

Respiration finale :
- Allongés en étoile de mer
- Respirer profondément 3 fois
- "Mon corps est calme et en équilibre"

Partage : "Quelle activité d'équilibre était la plus facile/difficile?"
      `,
      
      learningGoals: `
- Je peux maintenir mon équilibre dans différentes positions
- Je peux me déplacer en gardant mon équilibre
- Je peux utiliser mes bras pour m'aider à garder l'équilibre
- Je peux contrôler mon corps dans l'espace
      `,
      
      materials: [
        'Lignes de sol ou ruban adhésif coloré',
        'Cerceaux (8-10)',
        'Banc suédois ou planche d\'équilibre',
        'Sacs de fèves (15-20)',
        'Cartes de positions d\'équilibre',
        'Cônes pour délimiter les zones',
        'Tapis de yoga ou matelas'
      ],
      
      accommodations: {
        physical: [
          'Tenir le mur ou une main pour support',
          'Positions d\'équilibre adaptées',
          'Temps réduit pour tenir les positions'
        ],
        cognitive: [
          'Une instruction à la fois',
          'Démonstration avant chaque activité',
          'Partenaire pour guider'
        ],
        sensory: [
          'Repères visuels au sol',
          'Environnement calme sans distractions',
          'Pause si vertige ou malaise'
        ],
        anxiety: [
          'Commencer avec défis plus faciles',
          'Encouragement constant',
          'Option de tenir la main d\'un ami'
        ]
      },
      
      modifications: {
        advanced: [
          'Yeux fermés pour certains défis',
          'Tenir les positions plus longtemps',
          'Créer son propre parcours d\'équilibre'
        ],
        struggling: [
          'Deux pieds au lieu d\'un',
          'Lignes plus larges',
          'Support physique disponible'
        ],
        wheelchair: [
          'Équilibre du haut du corps',
          'Mouvements de bras coordonnés',
          'Juge pour les autres'
        ]
      },
      
      assessmentType: 'Formative - Équilibre et coordination',
      assessmentNotes: `
Grille d'évaluation de l'équilibre :
□ Maintient l'équilibre statique (5 sec)
□ Se déplace en équilibre sur une ligne
□ Récupère l'équilibre après perturbation
□ Utilise stratégies pour maintenir l'équilibre
□ Démontre confiance dans les activités

Noter :
- Progrès depuis le début de la leçon
- Stratégies utilisées
- Niveau de confiance
- Besoins de support
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 LEÇON D'ÉQUILIBRE ET COORDINATION

Matériel installé :
✓ Parcours avec lignes au sol (ruban bleu)
✓ Cerceaux disposés pour "la rivière"
✓ Banc suédois en position
✓ Cartes de positions dans le panier

Déroulement :
1. Défi d'équilibre d'ouverture (5 min)
2. 4 activités du parcours (5 min chacune)
3. Yoga de retour au calme (5 min)

Sécurité :
- Tapis autour du banc suédois
- Espace entre les stations
- Supervision étroite du banc

Adaptations courantes :
- Certains ont peur du banc → alternative au sol
- Vertige possible → pauses fréquentes
- Toujours offrir support physique si demandé

Ranger : Élèves aident à ramasser les cerceaux
      `,
      
      differentiationStrategies: {
        process: [
          'Progression individualisée des défis',
          'Choix du niveau de difficulté',
          'Rythme personnel'
        ],
        product: [
          'Démonstration de positions favorites',
          'Création de nouvelles positions',
          'Auto-évaluation du progrès'
        ],
        content: [
          'Variété de défis d\'équilibre',
          'Support visuel et verbal',
          'Complexité ajustable'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 3:', lesson3.title);

  // Lesson 4: Friday September 5 - Spatial Awareness and Games
  const lesson4 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'L\'espace autour de moi',
      titleFr: 'L\'espace autour de moi',
      date: new Date('2025-09-05'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 MA BULLE D'ESPACE (5 min)

Exploration de l'espace personnel :
- "Imaginez une bulle invisible autour de vous"
- Étendre les bras : "C'est la grandeur de votre bulle"
- Activités dans la bulle :
  * Toucher le haut, le bas, les côtés
  * Tourner sans sortir de la bulle
  * Faire l'étoile dans la bulle
  * Rétrécir et grandir la bulle

Déplacement avec bulles :
- Marcher sans faire éclater les bulles des autres
- Signal "FREEZE" = vérifier l'espace
- "Qui peut voir 3 amis sans tourner la tête?"
      `,
      
      action: `
📚 JEUX D'ESPACE ET DE CONSCIENCE (20 min)

1. FEU ROUGE, FEU VERT AMÉLIORÉ (6 min) :
- Feu vert = courir dans l'espace libre
- Feu jaune = marcher lentement
- Feu rouge = stop et statue
- Ajouts spéciaux :
  * Tunnel = passer sous (ramper)
  * Pont = sauter par-dessus
  * Rond-point = tourner sur soi

2. LES ROBOTS ET LES AIMANTS (7 min) :
- Moitié de classe = robots (se déplacent)
- Moitié = aimants (immobiles, bras étendus)
- Robots doivent éviter les aimants
- Si touché = figé 5 secondes
- Changer les rôles après 3 minutes
- Varier : vitesse lente/rapide

3. LE JEU DES ÎLES (7 min) :
- Cerceaux = îles sécuritaires
- Musique = nager dans l'océan (courir)
- Musique arrête = trouver une île
- Réduire le nombre d'îles progressivement
- Partager les îles (coopération)
- Célébrer l'entraide

Emphase constante sur :
- Regarder où on va
- Éviter les collisions
- Respecter l'espace des autres
      `,
      
      consolidation: `
🎯 MIROIR MAGIQUE ET RELAXATION (5 min)

Jeu du miroir (3 min) :
- En paires face à face
- Un leader, un miroir
- Mouvements lents et contrôlés
- Changer de rôle

Relaxation finale (2 min) :
- Allongés en étoile
- "Sentez l'espace autour de vous"
- Respiration : gonfler le ventre comme un ballon
- Expirer lentement

Réflexion cercle :
- "Comment avez-vous évité les collisions?"
- "Qu'est-ce qui vous a aidé à bien bouger dans l'espace?"
- Félicitations pour le respect de l'espace!
      `,
      
      learningGoals: `
- Je peux me déplacer en évitant les obstacles et les autres
- Je peux identifier mon espace personnel
- Je peux changer de direction rapidement et en sécurité
- Je peux coopérer et partager l'espace avec les autres
      `,
      
      materials: [
        'Cerceaux (10-15)',
        'Cônes de couleurs pour délimiter l\'espace',
        'Musique avec pauses faciles',
        'Foulards ou rubans (optionnel)',
        'Sifflet ou tambourin',
        'Affiches feu rouge/jaune/vert'
      ],
      
      accommodations: {
        physical: [
          'Zone de jeu réduite si nécessaire',
          'Marche au lieu de course',
          'Partenaire pour guider'
        ],
        cognitive: [
          'Signaux visuels et auditifs combinés',
          'Répétition des règles avant chaque jeu',
          'Rôles simplifiés'
        ],
        sensory: [
          'Espace défini clairement',
          'Musique volume modéré',
          'Coins calmes disponibles'
        ],
        social: [
          'Partenaire désigné pour les jeux',
          'Rôle spécial (gardien des cerceaux)',
          'Encouragement à participer progressivement'
        ]
      },
      
      modifications: {
        advanced: [
          'Mouvements plus complexes',
          'Leader de jeu',
          'Créer nouvelles règles'
        ],
        struggling: [
          'Espace de jeu plus petit',
          'Vitesse réduite',
          'Plus de cerceaux disponibles'
        ],
        anxious: [
          'Commencer comme observateur',
          'Zone de confort désignée',
          'Participation graduelle'
        ]
      },
      
      assessmentType: 'Formative - Conscience spatiale et coopération',
      assessmentNotes: `
Observation de la conscience spatiale :
□ Évite les collisions constamment
□ Maintient l'espace personnel
□ Change de direction avec contrôle
□ Navigue autour des obstacles
□ Coopère pour partager l'espace

Comportements sociaux :
□ Respecte l'espace des autres
□ Aide les camarades
□ Suit les règles du jeu
□ Gère la frustration
□ Célèbre les succès des autres

Note : Fin de semaine 1 - faire bilan global
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 LEÇON D'ESPACE ET CONSCIENCE CORPORELLE

Setup rapide :
✓ Cerceaux dispersés pour "les îles"
✓ Espace de jeu délimité avec cônes
✓ Musique prête (piste 4 - avec pauses)
✓ Affiches feux de circulation visibles

Séquence :
1. Ma bulle d'espace (5 min)
2. Trois jeux principaux (20 min total)
3. Miroir et relaxation (5 min)

Gestion :
- Signal STOP prioritaire pour sécurité
- Rotation des partenaires pour le miroir
- Surveiller les collisions potentielles

Points d'attention :
- Certains élèves peuvent être bousculés facilement
- Le jeu des îles peut créer de l'anxiété (assurer qu'il y a toujours assez d'espace)
- Fin de première semaine : les élèves peuvent être fatigués

Rangement : Les élèves adorent empiler les cerceaux!
      `,
      
      differentiationStrategies: {
        process: [
          'Vitesse de jeu adaptable',
          'Choix dans les mouvements',
          'Participation progressive'
        ],
        product: [
          'Différentes façons de montrer la compréhension',
          'Leadership dans les jeux',
          'Réflexion par dessin ou verbal'
        ],
        content: [
          'Complexité des jeux ajustable',
          'Règles simplifiées ou enrichies',
          'Défis supplémentaires optionnels'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 4:', lesson4.title);

  console.log('\n✅ Week 1 Complete! Created 4 perfect PE lessons');
  console.log('📊 Summary:');
  console.log('  - Introduction to PE and safety');
  console.log('  - Basic locomotor skills');
  console.log('  - Balance and coordination');
  console.log('  - Spatial awareness and cooperation');
}

createWeek1PELessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());