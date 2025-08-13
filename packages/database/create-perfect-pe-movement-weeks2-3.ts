import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks2and3PELessons() {
  console.log('🏃 CREATING PERFECT PE LESSONS - MON CORPS EN MOUVEMENT - WEEKS 2-3');
  console.log('=' .repeat(60));

  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mon corps en mouvement' }
  });

  if (!unit) {
    console.error('❌ Unit not found');
    return;
  }

  console.log('Found unit:', unit.title);
  console.log('Creating Weeks 2-3 lessons (September 8-19, 2025)');

  // WEEK 2 - MANIPULATION SKILLS
  console.log('\n📅 WEEK 2: MANIPULATION SKILLS');

  // Lesson 5: Monday September 8 - Introduction to Throwing
  const lesson5 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Je lance comme un champion!',
      titleFr: 'Je lance comme un champion!',
      date: new Date('2025-09-08'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 ÉCHAUFFEMENT DES BRAS (5 min)

Cercle d'échauffement dynamique :
- Rouler les épaules (moulins à vent)
- Secouer les bras comme de la gelée
- Faire de grands cercles avec les bras
- Imiter les mouvements :
  * Lancer une pizza dans les airs
  * Pêcher avec une canne
  * Lancer des confettis

Question : "À quoi devons-nous faire attention quand on lance?"
- Regarder où on lance
- Vérifier l'espace autour
- Attendre le signal
      `,
      
      action: `
📚 STATIONS DE LANCER PROGRESSIF (20 min)

Organisation : 4 stations, 5 minutes chacune

Station 1 - LANCER PAR-DESSOUS :
- Sacs de fèves dans des cerceaux
- Distances variées (1m, 2m, 3m)
- Technique : balancer le bras comme une balançoire
- Défi : atteindre le cerceau arc-en-ciel

Station 2 - LANCER PAR-DESSUS :
- Balles en mousse vers des cibles au mur
- Hauteurs différentes
- Technique : bras en arrière, lancer en avant
- Points pour chaque cible touchée

Station 3 - ROULER LA BALLE :
- Faire rouler vers des quilles
- Technique : se pencher, balancer le bras
- Compter les quilles tombées
- Reset par les élèves

Station 4 - LANCER DE PRÉCISION :
- Anneaux sur des cônes
- Foulards dans des boîtes
- Balles dans des paniers
- Célébrer chaque réussite

Rotation au signal du tambourin
Musique motivante en arrière-plan
      `,
      
      consolidation: `
🎯 DÉFI FINAL ET RELAXATION (5 min)

Défi de classe :
- "Combien de sacs pouvons-nous mettre dans le panier géant?"
- Chacun a 2 essais
- Compter ensemble
- Célébrer le total de la classe

Étirements de récupération :
- Étirer les bras vers le ciel
- Secouer doucement les mains
- Rouler les épaules
- Respiration profonde

Réflexion : "Quel type de lancer était le plus facile pour vous?"
      `,
      
      learningGoals: `
- Je peux lancer par-dessous avec contrôle
- Je peux lancer par-dessus vers une cible
- Je peux faire rouler une balle avec précision
- Je peux ajuster ma force selon la distance
      `,
      
      materials: [
        'Sacs de fèves (20-25)',
        'Balles en mousse (15)',
        'Cerceaux de différentes couleurs (6-8)',
        'Cônes avec anneaux',
        'Quilles ou bouteilles en plastique',
        'Cibles au mur (papier ou cerceaux)',
        'Paniers ou boîtes',
        'Foulards légers'
      ],
      
      accommodations: {
        physical: [
          'Distance de lancer ajustée',
          'Objets plus gros et légers',
          'Position assise pour lancer si nécessaire'
        ],
        cognitive: [
          'Une technique à la fois',
          'Démonstration répétée',
          'Partenaire pour rappeler les étapes'
        ],
        visual: [
          'Cibles très colorées et contrastées',
          'Lignes au sol pour le positionnement',
          'Démonstration proche'
        ],
        coordination: [
          'Commencer avec rouler seulement',
          'Objets plus gros',
          'Cibles plus grandes et plus proches'
        ]
      },
      
      modifications: {
        advanced: [
          'Distances plus grandes',
          'Cibles plus petites',
          'Lancer avec la main non-dominante'
        ],
        struggling: [
          'Commencer très proche de la cible',
          'Utiliser des ballons légers',
          'Focus sur un type de lancer'
        ],
        wheelchair: [
          'Hauteur de cibles ajustée',
          'Lancer depuis la position assise',
          'Rampe de lancement si nécessaire'
        ]
      },
      
      assessmentType: 'Formative - Habiletés de lancer',
      assessmentNotes: `
Observation des techniques de lancer :
□ Position du corps appropriée
□ Mouvement fluide du bras
□ Regard vers la cible
□ Ajustement de la force
□ Suivi du mouvement

Progression :
- Début : Exploration
- Milieu : Technique émergente
- Fin : Contrôle amélioré
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 INTRODUCTION AU LANCER

Setup (15 min avant) :
✓ 4 stations installées et étiquetées
✓ Matériel à chaque station
✓ Musique prête (playlist PE Upbeat)

Sécurité critique :
- PERSONNE ne lance sans signal
- Ramasser seulement quand autorisé
- Espace entre les stations

Routine :
1. Échauffement des bras (5 min)
2. Démontrer chaque station rapidement
3. Rotation aux 5 minutes
4. Défi de classe final

Trucs :
- Station 3 (quilles) : les élèves adorent les installer
- Beaucoup d'encouragement pour les tentatives
- Certains ont peur de lancer fort - c'est OK

Rangement : Bacs de couleur pour chaque type de matériel
      `,
      
      differentiationStrategies: {
        process: [
          'Progression individuelle du simple au complexe',
          'Choix de la distance et de la cible',
          'Rythme personnel à chaque station'
        ],
        product: [
          'Différentes façons de démontrer le succès',
          'Auto-évaluation avec cibles atteintes',
          'Portfolio de progrès personnel'
        ],
        content: [
          'Variété d\'objets à lancer',
          'Multiples types de cibles',
          'Complexité graduelle'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 5:', lesson5.title);

  // Lesson 6: Tuesday September 9 - Catching Skills
  const lesson6 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'J\'attrape avec confiance!',
      titleFr: 'J\'attrape avec confiance!',
      date: new Date('2025-09-09'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 MAINS MAGIQUES (5 min)

Préparation des mains pour attraper :
- Montrer les "mains de panier" (forme de bol)
- Montrer les "mains de pince" (attraper petit objet)
- Jeu : "Attrape imaginaire"
  * J'envoie une bulle - mains douces
  * J'envoie un œuf - très délicatement
  * J'envoie une balle - mains prêtes

Pratique avec foulards :
- Lancer et attraper son propre foulard
- Le foulard tombe lentement = plus facile
- "Regardez le foulard jusqu'à vos mains!"
      `,
      
      action: `
📚 PROGRESSION D'ATTRAPAGE (20 min)

1. FOULARDS FLOTTANTS (5 min) :
- Lancer et attraper individuellement
- Lancer haut, tourner, attraper
- Lancer, frapper des mains, attraper
- Échanger avec un partenaire (proche)

2. BALLONS LÉGERS (5 min) :
- Frapper le ballon vers le haut, attraper
- Lancer à deux mains, attraper
- Avec partenaire : rouler, lancer doucement
- "Regardez le ballon tout le temps!"

3. SACS DE FÈVES (5 min) :
- Lancer bas et attraper
- Augmenter progressivement la hauteur
- Attraper avec une main, puis l'autre
- Partenaire lance doucement

4. BALLES EN MOUSSE (5 min) :
- Faire rebondir et attraper
- Lancer contre le mur et attraper
- Avec partenaire (très proche au début)
- Célébrer chaque attrape réussie!

Progression : foulard → ballon → sac → balle
Adapter la distance selon le succès
      `,
      
      consolidation: `
🎯 JEU "PLUIE D'OBJETS" ET CALME (5 min)

Jeu collectif (3 min) :
- Enseignant lance doucement différents objets
- Les élèves essaient d'attraper
- Varier : foulards, ballons, sacs
- Applaudir les efforts

Retour au calme (2 min) :
- Assis en cercle
- Passer un objet imaginaire
- Mimer : lourd, léger, chaud, froid
- Respiration finale

Questions : 
- "Qu'est-ce qui était plus facile à attraper?"
- "Où regardez-vous quand vous attrapez?"
      `,
      
      learningGoals: `
- Je peux attraper un objet qui tombe lentement
- Je peux positionner mes mains correctement
- Je peux suivre l'objet des yeux
- Je peux attraper à différentes hauteurs
      `,
      
      materials: [
        'Foulards colorés (15-20)',
        'Ballons légers (10)',
        'Sacs de fèves (20)',
        'Balles en mousse (10-15)',
        'Cerceaux pour zones de pratique',
        'Musique calme',
        'Autocollants de récompense'
      ],
      
      accommodations: {
        physical: [
          'Objets plus gros et plus lents',
          'Distance très courte',
          'Position assise si nécessaire'
        ],
        cognitive: [
          'Un type d\'objet à la fois',
          'Instructions simples et répétées',
          'Modélisation constante'
        ],
        visual: [
          'Objets très colorés',
          'Fond contrastant',
          'Distance rapprochée'
        ],
        anxiety: [
          'Commencer avec foulards seulement',
          'Pas de pression pour attraper',
          'Célébrer les tentatives'
        ]
      },
      
      modifications: {
        advanced: [
          'Attraper en mouvement',
          'Une main seulement',
          'Yeux fermés avec signal sonore'
        ],
        struggling: [
          'Foulards et ballons seulement',
          'Faire rouler au lieu de lancer',
          'Attraper contre le corps d\'abord'
        ],
        motor: [
          'Objets adaptés (plus gros, texturés)',
          'Utiliser un panier pour attraper',
          'Temps de réaction plus long'
        ]
      },
      
      assessmentType: 'Formative - Habiletés de réception',
      assessmentNotes: `
Grille d'observation - Attraper :
□ Positionne les mains correctement
□ Suit l'objet des yeux
□ Ajuste la position du corps
□ Attrape avec confiance
□ Progresse avec différents objets

Niveau de confort :
- Foulards : ___/10
- Ballons : ___/10
- Sacs : ___/10
- Balles : ___/10
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 LEÇON D'ATTRAPAGE

Matériel par ordre d'utilisation :
1. Foulards (bac rouge)
2. Ballons (sac filet)
3. Sacs de fèves (bac bleu)
4. Balles mousse (bac vert)

Important :
- Progression LENTE - ne pas précipiter
- Certains ont très peur d'attraper
- Beaucoup d'encouragement
- OK de laisser tomber!

Astuces :
- Foulards = succès garanti
- Ballons peuvent éclater (extras disponibles)
- Former les paires par habileté similaire

Sécurité :
- Espace entre les paires
- Pas de lancer fort
- Ramasser après chaque activité

Modification rapide : Si trop difficile, revenir aux foulards
      `,
      
      differentiationStrategies: {
        process: [
          'Progression adaptée individuellement',
          'Choix de l\'objet à attraper',
          'Distance et vitesse variables'
        ],
        product: [
          'Différentes façons de montrer l\'habileté',
          'Succès défini individuellement',
          'Auto-évaluation du progrès'
        ],
        content: [
          'Variété d\'objets du plus facile au plus difficile',
          'Adaptations selon les besoins',
          'Défis optionnels'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 6:', lesson6.title);

  // Lesson 7: Wednesday September 10 - Rolling and Dribbling
  const lesson7 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Je contrôle la balle!',
      titleFr: 'Je contrôle la balle!',
      date: new Date('2025-09-10'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 MA BALLE AMIE (5 min)

Introduction ludique avec une balle :
- Chaque élève a une balle
- "Voici votre nouvelle amie balle!"
- Explorer ensemble :
  * La faire tourner sur place
  * La rouler autour du corps
  * La passer d'une main à l'autre
  * La faire rebondir doucement

Défi : "Pouvez-vous..."
- Faire le tour de la balle?
- Vous asseoir sans la lâcher?
- La tenir avec différentes parties du corps?
      `,
      
      action: `
📚 MAÎTRISE DU CONTRÔLE (20 min)

1. ROULER AVEC PRÉCISION (7 min) :
- Rouler la balle en ligne droite
- Suivre des lignes au sol
- Rouler en zigzag entre les cônes
- Course de relais : rouler jusqu'au cône et retour
- Technique : main derrière la balle, pousser

2. DRIBBLE STATIONNAIRE (6 min) :
- Faire rebondir sur place avec deux mains
- Compter les rebonds
- Varier la hauteur : genou, taille, épaule
- Défi : faire rebondir en tournant
- "Poussez la balle, ne la frappez pas!"

3. DRIBBLE EN MOUVEMENT (7 min) :
- Marcher en dribblant (deux mains)
- Suivre une ligne en dribblant
- Contourner des obstacles
- Jeu "Feu rouge, feu vert" avec dribble
- Toujours regarder devant, pas la balle!

Progression graduelle
Encouragement constant
Musique rythmée pour le dribble
      `,
      
      consolidation: `
🎯 DÉFI DES CHAMPIONS (5 min)

Mini-parcours final :
- Rouler la balle jusqu'au cône
- Dribbler 5 fois sur place
- Rouler jusqu'à la ligne d'arrivée
- Chacun passe, on encourage!

Retour au calme :
- Assis avec sa balle
- La faire rouler doucement sur les jambes
- Massage avec la balle sur les bras
- Respiration : inspirer en levant la balle, expirer en la baissant

Partage : "Montrez votre mouvement préféré avec la balle!"
      `,
      
      learningGoals: `
- Je peux rouler une balle avec contrôle et direction
- Je peux faire rebondir une balle sur place
- Je peux me déplacer en contrôlant ma balle
- Je peux garder mes yeux vers l'avant en dribblant
      `,
      
      materials: [
        'Balles de playground ou balles en caoutchouc (1 par élève)',
        'Cônes pour obstacles (15-20)',
        'Lignes au sol (ruban adhésif)',
        'Cerceaux pour cibles',
        'Musique avec bon rythme',
        'Sifflet pour les signaux'
      ],
      
      accommodations: {
        physical: [
          'Balles plus grosses ou plus molles',
          'Dribble contre le mur au lieu du sol',
          'Rouler seulement si dribble difficile'
        ],
        cognitive: [
          'Une compétence à la fois',
          'Repères visuels au sol',
          'Partenaire pour démontrer'
        ],
        coordination: [
          'Commencer assis pour le dribble',
          'Balle plus grosse et rebond plus lent',
          'Main sur la balle pour guider'
        ],
        sensory: [
          'Balles texturées pour meilleure prise',
          'Espace défini clairement',
          'Réduction du bruit ambiant'
        ]
      },
      
      modifications: {
        advanced: [
          'Dribbler avec une seule main',
          'Parcours plus complexe',
          'Dribbler entre les jambes'
        ],
        struggling: [
          'Tenir la balle et marcher d\'abord',
          'Rouler seulement',
          'Balle plus grosse et molle'
        ],
        wheelchair: [
          'Dribble sur les genoux',
          'Rouler sur une table',
          'Parcours adapté'
        ]
      },
      
      assessmentType: 'Formative - Contrôle d\'objet',
      assessmentNotes: `
Évaluation du contrôle de balle :
□ Roule avec direction intentionnelle
□ Maintient le contrôle en mouvement
□ Dribble avec régularité
□ Garde la tête levée
□ Ajuste la force appropriée

Progrès notable :
- Contrôle stationnaire : ___
- Contrôle en mouvement : ___
- Confiance générale : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 CONTRÔLE DE BALLE

Préparation :
✓ 1 balle par élève (vérifier gonflage)
✓ Parcours simple installé
✓ Lignes au sol visibles

Progression importante :
1. Rouler d'abord (plus facile)
2. Dribble sur place
3. Dribble en mouvement (plus difficile)

Problèmes courants :
- Frapper trop fort = perte de contrôle
- Regarder la balle = collisions
- Solution : "Balle amie" = douceur

Gestion :
- Signal pour arrêter : tenir la balle
- Rotation des activités claire
- Beaucoup d'espace entre les élèves

Astuce : Certains élèves excellent, les utiliser comme démonstrateurs
      `,
      
      differentiationStrategies: {
        process: [
          'Vitesse d\'exécution personnalisée',
          'Choix de la progression',
          'Pratique supplémentaire au besoin'
        ],
        product: [
          'Démonstration individuelle ou en groupe',
          'Auto-évaluation du contrôle',
          'Création de son propre défi'
        ],
        content: [
          'Types de balles variés',
          'Niveaux de difficulté multiples',
          'Adaptations créatives'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 7:', lesson7.title);

  // Lesson 8: Thursday September 11 - Kicking Skills
  const lesson8 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Mes pieds sont magiques!',
      titleFr: 'Mes pieds sont magiques!',
      date: new Date('2025-09-11'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 RÉVEILLE TES PIEDS (5 min)

Activation des pieds et jambes :
- Assis, bouger les orteils (piano imaginaire)
- Dessiner des cercles avec les pieds
- Debout : marcher sur place
  * Sur les talons
  * Sur la pointe des pieds
  * Côté externe/interne des pieds

Jeu "Pieds collants" :
- Marcher avec un sac de fèves sur le pied
- Ne pas le faire tomber
- Varier : vite, lent, en arrière
      `,
      
      action: `
📚 EXPLORATION DU COUP DE PIED (20 min)

1. BOTTER STATIONNAIRE (5 min) :
- Balle immobile devant un mur
- Botter doucement avec l'intérieur du pied
- Augmenter progressivement la force
- Alterner pied droit et gauche
- "Regardez la balle, puis la cible!"

2. PARCOURS DE PRÉCISION (7 min) :
- Botter la balle entre des cônes (portes)
- Suivre un chemin défini
- Arrêter la balle avec le pied
- Technique : côté du pied pour contrôle
- Pointe du pied pour force

3. MINI-SOCCER MODIFIÉ (8 min) :
- Groupes de 4 : 2 contre 2
- Grands buts (entre 2 cônes)
- Pas de gardien
- Rotation après 2 minutes
- Règles simples :
  * Pas de mains
  * Botter doucement
  * Célébrer tous les buts!

Emphase sur le contrôle, pas la force
Sécurité : espace entre les groupes
      `,
      
      consolidation: `
🎯 TIR AU BUT ET RELAXATION (5 min)

Défi final - Tir au but :
- Chacun a 2 essais
- Grand but avec zones de points
- Applaudir chaque tentative
- Compter les points de la classe

Étirements des jambes :
- Flamant rose (tenir une jambe)
- Toucher les orteils
- Papillon assis
- Secouer les jambes doucement

Réflexion : "Avec quelle partie du pied avez-vous le plus de contrôle?"
      `,
      
      learningGoals: `
- Je peux botter une balle avec contrôle
- Je peux utiliser différentes parties de mon pied
- Je peux diriger la balle vers une cible
- Je peux arrêter une balle en mouvement avec mon pied
      `,
      
      materials: [
        'Ballons de soccer en mousse ou légers (10-15)',
        'Cônes pour les buts et parcours (20+)',
        'Sacs de fèves',
        'Ruban adhésif pour marquer les zones',
        'Dossards ou foulards pour les équipes',
        'Cibles au mur (optionnel)'
      ],
      
      accommodations: {
        physical: [
          'Balles plus grosses et plus légères',
          'Distance réduite pour botter',
          'Assis pour botter si nécessaire'
        ],
        cognitive: [
          'Instructions visuelles et verbales',
          'Pratique guidée supplémentaire',
          'Règles simplifiées pour le jeu'
        ],
        coordination: [
          'Balle immobile au début',
          'Cibles plus grandes',
          'Plus de temps pour chaque action'
        ],
        safety: [
          'Zone désignée pour éviter les collisions',
          'Balles très molles',
          'Supervision individuelle si nécessaire'
        ]
      },
      
      modifications: {
        advanced: [
          'Botter en mouvement',
          'Cibles plus petites',
          'Pied non-dominant seulement'
        ],
        struggling: [
          'Faire rouler avec le pied d\'abord',
          'Balle attachée à une corde',
          'Partenaire pour stabiliser la balle'
        ],
        wheelchair: [
          'Utiliser un bâton de hockey',
          'Frapper avec les mains',
          'Rôle d\'arbitre ou coach'
        ]
      },
      
      assessmentType: 'Formative - Habiletés de frappe au pied',
      assessmentNotes: `
Observation du coup de pied :
□ Position du corps équilibrée
□ Contact approprié avec la balle
□ Direction intentionnelle
□ Force contrôlée
□ Arrêt de balle émergent

Points d'amélioration notés :
- Équilibre : ___
- Précision : ___
- Contrôle : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 LEÇON DE COUP DE PIED

Setup crucial :
✓ Espaces de jeu bien délimités
✓ Mur protégé pour les tirs
✓ Ballons souples (sécurité!)

Progression :
1. Stationnaire d'abord
2. En mouvement ensuite
3. Jeu simple à la fin

Sécurité IMPORTANTE :
- Pas de tirs hauts
- Espace entre les groupes
- Signal STOP immédiat si danger

Gestion du mini-soccer :
- Groupes par habileté similaire
- Rotation rapide (2 min)
- Pas de compétition intense

Note : Certains n'ont jamais botté de ballon - patience!
Modification : Si chaos au soccer, revenir au parcours
      `,
      
      differentiationStrategies: {
        process: [
          'Progression individualisée',
          'Choix du niveau de défi',
          'Temps de pratique flexible'
        ],
        product: [
          'Différentes façons de démontrer l\'habileté',
          'Auto et co-évaluation',
          'Célébration des progrès personnels'
        ],
        content: [
          'Variété de tailles de balles',
          'Distance et cibles adaptables',
          'Complexité graduelle'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 8:', lesson8.title);

  // WEEK 3 - MOVEMENT COMBINATIONS AND GAMES
  console.log('\n📅 WEEK 3: MOVEMENT COMBINATIONS');

  // Lesson 9: Monday September 15 - Combining Movements
  const lesson9 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Je combine mes mouvements!',
      titleFr: 'Je combine mes mouvements!',
      date: new Date('2025-09-15'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 SIMON DIT COMPLEXE (5 min)

Version avancée de "Simon dit" :
- Commands simples d'abord
- Puis combinaisons :
  * "Sautez puis tournez"
  * "Marchez et tapez des mains"
  * "Courez sur place et comptez jusqu'à 5"

Défi mémoire :
- 2 actions : sauter + tourner
- 3 actions : sauter + tourner + s'asseoir
- Qui peut se souvenir de 4 actions?
      `,
      
      action: `
📚 CIRCUITS DE MOUVEMENTS COMBINÉS (20 min)

Circuit 1 - LE VOYAGE (6 min) :
Raconter une histoire en mouvement
- Marcher jusqu'à la forêt (cônes verts)
- Sauter par-dessus la rivière (lignes bleues)
- Ramper sous le pont (corde tendue)
- Courir pour échapper à l'ours (jusqu'au cerceau)
- Équilibre sur le tronc (ligne)

Circuit 2 - DÉFI OLYMPIQUE (7 min) :
Enchaînement sportif
- 5 sauts sur place
- Courir jusqu'au cône
- Lancer le sac dans la cible
- Dribbler la balle 3 fois
- Retour en galopant
Chronométrer pour le plaisir (pas compétition)

Circuit 3 - DANSE DES MOUVEMENTS (7 min) :
Sur musique rythmée
- 8 temps : marcher
- 8 temps : sauter
- 8 temps : tourner
- 8 temps : mouvement libre
Répéter la séquence
Ajouter des bras progressivement
      `,
      
      consolidation: `
🎯 CRÉATION ET CALME (5 min)

Création en équipe :
- Groupes de 3
- Créer une séquence de 3 mouvements
- Présenter aux autres
- Applaudir chaque présentation

Relaxation guidée :
- Allongés en étoile
- "Votre corps a travaillé fort"
- Respirer en comptant jusqu'à 4
- Détendre chaque partie du corps

Question : "Quelle combinaison était la plus amusante?"
      `,
      
      learningGoals: `
- Je peux enchaîner plusieurs mouvements
- Je peux me souvenir d'une séquence
- Je peux adapter ma vitesse dans les transitions
- Je peux créer ma propre combinaison
      `,
      
      materials: [
        'Cônes de couleurs variées',
        'Lignes au sol ou cordes',
        'Cerceaux',
        'Sacs de fèves',
        'Balles',
        'Musique rythmée avec tempo clair',
        'Chronomètre (optionnel)',
        'Cartes de mouvements'
      ],
      
      accommodations: {
        physical: [
          'Mouvements adaptés selon capacités',
          'Parcours plus court',
          'Pauses entre les circuits'
        ],
        cognitive: [
          'Séquences plus courtes (2 mouvements)',
          'Aide visuelle pour l\'ordre',
          'Partenaire guide'
        ],
        attention: [
          'Un circuit à la fois',
          'Instructions répétées',
          'Position proche de l\'enseignant'
        ],
        language: [
          'Démonstration complète d\'abord',
          'Pictogrammes pour les séquences',
          'Pair aidant bilingue'
        ]
      },
      
      modifications: {
        advanced: [
          'Séquences de 5-6 mouvements',
          'Vitesse augmentée',
          'Création de circuit complet'
        ],
        struggling: [
          'Deux mouvements maximum',
          'Répétition avant d\'ajouter',
          'Support visuel constant'
        ],
        fatigue: [
          'Mouvements moins intenses',
          'Rôle de démonstrateur',
          'Pauses supplémentaires'
        ]
      },
      
      assessmentType: 'Formative - Coordination et enchaînement',
      assessmentNotes: `
Évaluation des combinaisons :
□ Enchaîne fluidement 2 mouvements
□ Enchaîne 3+ mouvements
□ Maintient le rythme dans les transitions
□ Se souvient des séquences
□ Crée des combinaisons originales

Observation qualitative :
- Fluidité : ___
- Mémoire motrice : ___
- Créativité : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 COMBINAISONS DE MOUVEMENTS

3 Circuits prêts :
1. Histoire (cônes verts = forêt, etc.)
2. Olympique (stations marquées)
3. Danse (zone avec musique)

Timing :
- 5 min échauffement
- 6-7 min par circuit
- 5 min création et calme

Astuces :
- Circuit histoire : très populaire, raconter avec enthousiasme
- Circuit olympique : PAS de compétition
- Circuit danse : certains sont gênés, normaliser

Transition entre circuits : signal clair
Musique : Playlist "Rythmes PE" piste 7-9

Si problème : simplifier à 2 mouvements seulement
      `,
      
      differentiationStrategies: {
        process: [
          'Complexité ajustable des séquences',
          'Vitesse d\'exécution variable',
          'Choix dans l\'ordre des circuits'
        ],
        product: [
          'Présentation solo ou en groupe',
          'Création simple ou complexe',
          'Expression personnelle encouragée'
        ],
        content: [
          'Nombre de mouvements variable',
          'Types de combinaisons diverses',
          'Thèmes adaptés aux intérêts'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 9:', lesson9.title);

  // Lesson 10: Tuesday September 16 - Team Building Games
  const lesson10 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Ensemble, on est plus forts!',
      titleFr: 'Ensemble, on est plus forts!',
      date: new Date('2025-09-16'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 LA TOILE D'ARAIGNÉE (5 min)

Jeu de connexion :
- Cercle assis
- Balle de laine
- "Je m'appelle ___ et j'aime ___"
- Lancer la balle en tenant le fil
- Créer une toile

Observation : "Regardez, nous sommes tous connectés!"
Message : "Quand on travaille ensemble, on crée quelque chose de beau"
      `,
      
      action: `
📚 JEUX DE COOPÉRATION (20 min)

1. LE PARACHUTE IMAGINAIRE (6 min) :
- Grand cercle, tenir un parachute (ou foulards connectés)
- Mouvements ensemble :
  * Petites vagues
  * Grandes vagues
  * Lever haut et s'asseoir dessous
  * Faire voler les balles en mousse
- "Il faut que tout le monde participe!"

2. LES ÎLES QUI RÉTRÉCISSENT (7 min) :
- Cerceaux = îles
- Musique = nager
- Arrêt = trouver une île
- Diminuer les îles progressivement
- Objectif : sauver tout le monde!
- Stratégies : partager, s'entraider, tenir la main

3. LA CHAÎNE DE SAUVETAGE (7 min) :
- Un "sauveur" commence
- Touche quelqu'un = se donnent la main
- Continuent ensemble à sauver
- La chaîne grandit
- Défi : rester connectés
- Fin : tous sauvés et connectés!

Focus sur l'entraide, pas la vitesse
Célébrer la coopération
      `,
      
      consolidation: `
🎯 CERCLE D'APPRÉCIATION (5 min)

Reconnaissance positive :
- Cercle assis
- "J'ai aimé quand ___ a aidé ___"
- "Merci à ___ pour ___"
- Chacun dit une chose positive

Respiration d'équipe :
- Se tenir les mains
- Inspirer ensemble (lever les bras)
- Expirer ensemble (baisser les bras)
- 3 fois en synchronisation

Message final : "Ensemble, on a réussi tous nos défis!"
      `,
      
      learningGoals: `
- Je peux travailler avec mes camarades
- Je peux aider les autres à réussir
- Je peux communiquer dans les jeux d'équipe
- Je peux célébrer les succès du groupe
      `,
      
      materials: [
        'Balle de laine ou corde',
        'Parachute de jeu ou grand tissu',
        'Balles légères en mousse',
        'Cerceaux (8-10)',
        'Musique entraînante',
        'Foulards colorés'
      ],
      
      accommodations: {
        physical: [
          'Participation adaptée au parachute',
          'Aide pour les déplacements',
          'Position assise si nécessaire'
        ],
        social: [
          'Partenaire désigné bienveillant',
          'Rôle spécial dans les jeux',
          'Encouragement supplémentaire'
        ],
        cognitive: [
          'Instructions simplifiées',
          'Démonstration avant chaque jeu',
          'Répétition des règles'
        ],
        sensory: [
          'Position calme dans le cercle',
          'Possibilité de pause',
          'Volume de musique ajusté'
        ]
      },
      
      modifications: {
        advanced: [
          'Leader pour diriger les mouvements',
          'Proposer des stratégies d\'équipe',
          'Aider les plus jeunes'
        ],
        struggling: [
          'Rôles simplifiés',
          'Plus de support physique',
          'Objectifs adaptés'
        ],
        anxious: [
          'Observer d\'abord',
          'Participation graduelle',
          'Jamais forcé de participer'
        ]
      },
      
      assessmentType: 'Formative - Coopération et esprit d\'équipe',
      assessmentNotes: `
Observation des compétences sociales :
□ Communique avec les pairs
□ Aide spontanément
□ Partage l'espace/matériel
□ Encourage les autres
□ Gère la frustration

Comportements positifs notés :
- Entraide : ___
- Communication : ___
- Leadership positif : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 JEUX DE COOPÉRATION

Matériel essentiel :
✓ Parachute dans l'armoire du fond
✓ Cerceaux déjà sortis
✓ Musique : playlist "Coop Games"

Ambiance TRÈS importante :
- Pas de compétition
- Célébrer chaque réussite
- "Ensemble" est le mot-clé

Gestion :
- Toile d'araignée : assis pour sécurité
- Parachute : tenir fermement
- Îles : surveiller les bousculades

Points sensibles :
- Certains n'aiment pas tenir les mains
- Anxiété si îles diminuent trop vite
- Solution : toujours assez d'espace

Fin positive obligatoire : cercle d'appréciation
      `,
      
      differentiationStrategies: {
        process: [
          'Niveau de participation flexible',
          'Rôles variés dans les jeux',
          'Support adapté'
        ],
        product: [
          'Différentes façons de contribuer',
          'Expression de la coopération variée',
          'Succès défini par l\'effort'
        ],
        content: [
          'Complexité des jeux ajustable',
          'Thèmes motivants',
          'Défis progressifs'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 10:', lesson10.title);

  // Lesson 11: Wednesday September 17 - Creative Movement
  const lesson11 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Mon corps danse et s\'exprime!',
      titleFr: 'Mon corps danse et s\'exprime!',
      date: new Date('2025-09-17'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 STATUES ÉMOTIONS (5 min)

Expression corporelle des émotions :
- Musique = bouger librement
- Stop = statue d'une émotion
- Émotions à explorer :
  * Joie : sauter, bras ouverts
  * Tristesse : corps replié
  * Colère : poings serrés
  * Surprise : bouche ouverte, mains levées
  * Peur : se cacher

"Comment votre corps montre les émotions?"
      `,
      
      action: `
📚 EXPLORATION CRÉATIVE DU MOUVEMENT (20 min)

1. ANIMAUX EN MOUVEMENT (6 min) :
Histoire dansée du zoo
- Éléphant : pas lourds, trompe qui balance
- Singe : sauter et grimper
- Serpent : onduler au sol
- Oiseau : voler avec grâce
- Grenouille : sauts accroupis
Musique variée pour chaque animal

2. LES ÉLÉMENTS NATURELS (7 min) :
Devenir la nature
- Vent léger : mouvements doux et flottants
- Tempête : mouvements forts et rapides
- Vague : montée et descente fluide
- Feu : sauts et mouvements vifs
- Arbre : équilibre et balancement
Utiliser tout l'espace

3. CRÉATION D'UNE DANSE (7 min) :
En petits groupes de 4
- Choisir 3 mouvements appris
- Créer une séquence
- Ajouter un début et une fin
- Pratiquer 2 fois
- Présenter aux autres (optionnel)
Musique douce de fond
      `,
      
      consolidation: `
🎯 MIROIR CRÉATIF ET RELAXATION (5 min)

Miroir en musique :
- Paires face à face
- Leader fait mouvements lents
- Suiveur imite
- Changer après 1 minute

Relaxation créative :
- "Vous êtes une bougie qui fond lentement"
- Debout → accroupi → allongé
- Musique très douce
- Respiration profonde

Partage : "Quel personnage avez-vous préféré être?"
      `,
      
      learningGoals: `
- Je peux exprimer des idées avec mon corps
- Je peux bouger de façon créative et originale
- Je peux imiter différents mouvements
- Je peux créer une séquence de danse simple
      `,
      
      materials: [
        'Musiques variées (calme, rythmée, nature)',
        'Foulards colorés pour expression',
        'Images d\'animaux et éléments',
        'Espace libre de mouvement',
        'Tambourin pour les transitions'
      ],
      
      accommodations: {
        physical: [
          'Mouvements adaptés aux capacités',
          'Expression assise possible',
          'Amplitude de mouvement réduite'
        ],
        emotional: [
          'Pas d\'obligation de présenter',
          'Expression individuelle respectée',
          'Encouragement constant'
        ],
        cognitive: [
          'Imitation avant création',
          'Séquences courtes',
          'Support visuel'
        ],
        cultural: [
          'Respect des limites culturelles',
          'Mouvements appropriés',
          'Inclusion de diverses expressions'
        ]
      },
      
      modifications: {
        advanced: [
          'Création de histoire complète',
          'Leader de groupe',
          'Mouvements plus complexes'
        ],
        struggling: [
          'Imitation seulement',
          'Un mouvement à la fois',
          'Partenaire guide'
        ],
        shy: [
          'Expression dans un coin calme',
          'Participation progressive',
          'Pas de présentation obligatoire'
        ]
      },
      
      assessmentType: 'Formative - Expression créative et motrice',
      assessmentNotes: `
Observation de la créativité motrice :
□ Explore différents mouvements
□ Exprime des idées par le corps
□ Imite avec précision
□ Crée des mouvements originaux
□ Participe avec confiance

Expression notée :
- Variété : ___
- Originalité : ___
- Confiance : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 MOUVEMENT CRÉATIF ET EXPRESSION

Ambiance importante :
- Pas de jugement
- Tous les mouvements sont bons
- Encourager l'expression

Musiques prêtes :
1. Animaux : piste 10-14
2. Nature : piste 15-19
3. Création : piste 20 (douce)

Gestion sensible :
- Certains sont très gênés
- Ne jamais forcer la présentation
- Valoriser toute participation

Structure flexible :
- Si groupe timide : plus d'imitation
- Si groupe énergique : plus de création
- Adapter selon l'énergie

Note : Leçon peut être émotionnelle pour certains
      `,
      
      differentiationStrategies: {
        process: [
          'Liberté d\'interprétation',
          'Niveau d\'expression personnel',
          'Participation graduelle'
        ],
        product: [
          'Expression individuelle ou collective',
          'Présentation optionnelle',
          'Formats variés'
        ],
        content: [
          'Thèmes diversifiés',
          'Inspirations multiples',
          'Complexité adaptable'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 11:', lesson11.title);

  // Lesson 12: Thursday September 18 - Assessment and Celebration
  const lesson12 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Célébration de nos apprentissages!',
      titleFr: 'Célébration de nos apprentissages!',
      date: new Date('2025-09-18'),
      duration: 30,
      grade: 1,
      subject: 'Éducation physique',
      language: 'Français',
      
      mindsOn: `
🎯 RAPPEL DE NOS SUCCÈS (5 min)

Voyage dans le temps :
- "Qu'avons-nous appris ces 3 semaines?"
- Montrer avec le corps :
  * Comment on lance?
  * Comment on attrape?
  * Comment on garde l'équilibre?
  * Notre mouvement préféré?

Applaudissements pour tous les apprentissages!
"Aujourd'hui, on va montrer tout ce qu'on sait faire!"
      `,
      
      action: `
📚 OLYMPIADES DE LA RÉUSSITE (20 min)

Parcours célébration - 6 stations (3 min chacune) :

Station 1 - CHAMPION DE L'ÉQUILIBRE :
- Marcher sur la ligne
- Tenir sur un pied (compter ensemble)
- Certificat : "Expert en équilibre"

Station 2 - MAÎTRE DU LANCER :
- Lancer 5 objets différents dans les cibles
- Choisir sa distance
- Certificat : "Pro du lancer"

Station 3 - AS DE L'ATTRAPAGE :
- Attraper foulards, ballons, sacs
- Niveau au choix
- Certificat : "Champion attrapeur"

Station 4 - STAR DU MOUVEMENT :
- Montrer 3 façons de se déplacer
- Créativité encouragée
- Certificat : "Artiste du mouvement"

Station 5 - HÉROS DE LA COOPÉRATION :
- Défi à deux : passer le ballon sans les mains
- Réussir ensemble
- Certificat : "Super coéquipier"

Station 6 - CRÉATEUR DE DANSE :
- Inventer un mouvement original
- Le montrer aux autres
- Certificat : "Danseur créatif"

Chaque station = autocollant de réussite
Musique de célébration
      `,
      
      consolidation: `
🎯 CÉRÉMONIE DE CLÔTURE (5 min)

Parade des champions :
- Marche de victoire autour du gymnase
- Musique de célébration
- Montrer ses autocollants

Cercle de fierté :
- "Ma plus grande réussite est..."
- "J'ai aimé apprendre..."
- Applaudissements pour chacun

Diplôme remis :
"Champion du mouvement - Niveau 1 complété!"

Photo de groupe finale!
      `,
      
      learningGoals: `
- Je peux démontrer les habiletés apprises
- Je peux m'auto-évaluer positivement
- Je peux célébrer mes progrès et ceux des autres
- Je peux être fier de mes apprentissages
      `,
      
      materials: [
        'Certificats/autocollants préparés',
        'Matériel de toutes les leçons',
        'Musique de célébration',
        'Appareil photo',
        'Diplômes "Champion du mouvement"',
        'Cônes pour les stations',
        'Tableau de réussites'
      ],
      
      accommodations: {
        all: [
          'Succès défini individuellement',
          'Adaptation de chaque défi',
          'Célébration de tout effort',
          'Pas de comparaison entre élèves'
        ]
      },
      
      modifications: {
        all: [
          'Niveau de défi personnalisé',
          'Choix dans les démonstrations',
          'Support disponible à chaque station',
          'Réussite garantie pour tous'
        ]
      },
      
      assessmentType: 'Sommative - Célébration des apprentissages',
      assessmentNotes: `
Bilan des 3 semaines - Habiletés maîtrisées :

Locomotion :
□ Marche □ Course □ Saut □ Galop

Manipulation :
□ Lancer □ Attraper □ Rouler □ Botter

Équilibre :
□ Statique □ Dynamique □ Récupération

Coopération :
□ Respect □ Entraide □ Communication

Note globale : Célébrer chaque progrès!
Commentaire positif personnalisé : ___
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 CÉLÉBRATION FINALE - TRÈS IMPORTANT!

Préparation (30 min avant) :
✓ 6 stations installées et décorées
✓ Certificats dans chaque station
✓ Musique de célébration prête
✓ Diplômes signés

Atmosphère festive :
- Beaucoup d'encouragements
- Chaque enfant doit réussir
- Adapter pour garantir le succès

Distribution :
- Autocollant à chaque station
- Diplôme à la fin pour TOUS
- Photo de groupe

Note spéciale :
Cette leçon clôt 3 semaines d'apprentissage
Chaque enfant doit se sentir champion
Aucun échec possible aujourd'hui!

Rangement : Les élèves gardent leur diplôme
      `,
      
      differentiationStrategies: {
        process: [
          'Choix du niveau à chaque station',
          'Temps flexible',
          'Support individualisé'
        ],
        product: [
          'Démonstration personnalisée',
          'Célébration adaptée',
          'Succès individuel valorisé'
        ],
        content: [
          'Défis multiples niveaux',
          'Options variées',
          'Réussite accessible à tous'
        ]
      }
    }
  });

  console.log('✅ Created Lesson 12:', lesson12.title);

  // Friday September 19 - No PE (PD Day noted in calendar)

  console.log('\n✅ Weeks 2-3 Complete! Created 8 perfect PE lessons');
  console.log('📊 Week 2 Summary:');
  console.log('  - Throwing skills development');
  console.log('  - Catching progression');
  console.log('  - Ball control (rolling, dribbling)');
  console.log('  - Kicking fundamentals');
  console.log('📊 Week 3 Summary:');
  console.log('  - Movement combinations');
  console.log('  - Team building and cooperation');
  console.log('  - Creative movement and expression');
  console.log('  - Assessment celebration');
}

createWeeks2and3PELessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());