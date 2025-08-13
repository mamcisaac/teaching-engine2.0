import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectArtsLessons() {
  console.log('🎨 CREATING PERFECT ARTS LESSONS - JE M\'EXPRIME PAR L\'ART');
  console.log('='.repeat(60));

  // Get the test teacher account
  const teacher = await prisma.user.findFirst({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!teacher) {
    console.error('❌ Teacher not found');
    return;
  }

  // Get the arts unit
  const unit = await prisma.unitPlan.findFirst({
    where: { title: "Je m'exprime par l'art" }
  });

  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }

  console.log('✅ Found unit:', unit.title);
  console.log('Start date:', unit.startDate.toLocaleDateString());
  console.log('End date:', unit.endDate.toLocaleDateString());

  const lessons = [
    // ==================== WEEK 1: INTRODUCTION À L'ART ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Bienvenue dans le monde de l'art",
      date: new Date('2025-09-03'),
      duration: 40,
      mindsOn: "Qu'est-ce que l'art? Regardons autour de nous - où voyez-vous de l'art dans notre classe? Discussion sur les différentes formes d'art. Présentation d'œuvres d'art variées. (10 min)",
      action: `1. Exploration des matériaux d'art disponibles (5 min)
2. Démonstration de techniques de base: tenir un pinceau, utiliser des crayons (5 min)
3. Création libre: "Mon autoportrait" avec le médium de leur choix (15 min)
4. Promenade de galerie pour voir les œuvres de tous (5 min)`,
      consolidation: "Qu'avez-vous aimé créer aujourd'hui? Comment vous sentez-vous quand vous faites de l'art? Affichage des œuvres sur notre mur d'art. (10 min)",
      learningGoals: "Découvrir différents matériaux artistiques; S'exprimer librement par l'art; Développer la confiance créative",
      materials: JSON.stringify([
        'Papier blanc varié',
        'Crayons de couleur',
        'Crayons de cire',
        'Marqueurs',
        'Peinture et pinceaux',
        'Tabliers'
      ]),
      grouping: "Individuel avec partage en grand groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Choix limité de matériaux pour simplifier',
          'Aide physique pour tenir les outils',
          'Format plus petit si nécessaire'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Outils adaptés (crayons plus gros), support pour le papier',
        cognitive: 'Instructions simplifiées, démonstration individuelle',
        sensory: 'Espace calme disponible, matériaux texturés variés'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajouter des détails supplémentaires',
          'Utiliser plusieurs médiums',
          'Créer un cadre décoratif',
          'Écrire un titre pour leur œuvre'
        ]
      }),
      assessmentType: 'Diagnostique et Formative',
      assessmentNotes: 'Observation de la manipulation des outils, de l\'exploration des matériaux et de l\'expression personnelle. Documentation photographique du premier autoportrait.',
      subNotes: "Introduction à l'art avec exploration libre. Matériaux préparés par stations. Focus sur l'exploration et le plaisir de créer. Aucune attente de perfection.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les couleurs primaires magiques",
      date: new Date('2025-09-05'),
      duration: 40,
      mindsOn: "Voici trois couleurs spéciales: rouge, jaune et bleu. Ce sont les couleurs primaires! Avec seulement ces trois couleurs, nous pouvons créer toutes les autres! Démonstration de mélange. (10 min)",
      action: `1. Exploration tactile: tri d'objets par couleur primaire (5 min)
2. Expérimentation: mélange de peintures primaires (10 min)
3. Création: "Mon paysage en couleurs primaires" (15 min)
4. Nettoyage collaboratif et organisation (5 min)`,
      consolidation: "Quelles nouvelles couleurs avez-vous découvertes? Quelle est votre couleur primaire préférée? Cercle de partage avec les œuvres. (5 min)",
      learningGoals: "Identifier les couleurs primaires; Expérimenter le mélange des couleurs; Créer une composition colorée",
      materials: JSON.stringify([
        'Peinture rouge, jaune, bleue',
        'Palettes de mélange',
        'Pinceaux variés',
        'Papier épais',
        'Contenants d\'eau',
        'Éponges',
        'Objets à trier'
      ]),
      grouping: "Travail individuel avec moments de partage",
      accommodations: JSON.stringify({
        forStruggling: [
          'Peinture dans des contenants anti-renversement',
          'Guide visuel des mélanges',
          'Assistance pour le mélange'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Pinceaux adaptés, peinture au doigt permise',
        cognitive: 'Une couleur à la fois, étapes visuelles',
        sensory: 'Peinture sans odeur, gants disponibles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un cercle chromatique simple',
          'Nommer les couleurs secondaires créées',
          'Peindre un arc-en-ciel',
          'Expérimenter les nuances'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la reconnaissance des couleurs primaires et de la capacité à les mélanger. Observation de l\'expérimentation et de la créativité.',
      subNotes: "Leçon sur les couleurs primaires avec expérimentation. Stations de peinture préparées. Protection des surfaces importante. Tabliers obligatoires.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 2: LIGNES ET FORMES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les lignes dansent",
      date: new Date('2025-09-08'),
      duration: 40,
      mindsOn: "Notre corps peut faire des lignes! Montrez-moi une ligne droite avec votre bras, une ligne courbe avec votre corps. Les lignes sont partout! Mouvement créatif avec musique. (10 min)",
      action: `1. Exploration: tracer différents types de lignes dans le sable/farine (5 min)
2. Pratique: lignes avec différents outils (craies, crayons, pinceaux) (10 min)
3. Création: "Ma danse de lignes" - composition abstraite (15 min)
4. Ajout de couleurs aux lignes (5 min)`,
      consolidation: "Quelle ligne était la plus amusante à créer? Trouvons des lignes dans les œuvres de nos amis. Exposition des créations. (5 min)",
      learningGoals: "Explorer différents types de lignes; Développer le contrôle moteur; Créer des compositions abstraites",
      materials: JSON.stringify([
        'Bacs de sable/farine',
        'Papier grand format',
        'Craies de couleur',
        'Pastels gras',
        'Marqueurs variés',
        'Musique rythmée'
      ]),
      grouping: "Exploration individuelle et création personnelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Lignes pré-tracées à repasser',
          'Outils plus gros et faciles à tenir',
          'Surface plus grande pour le mouvement'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Support pour la main, outils adaptés, travail sur plan incliné',
        cognitive: 'Un type de ligne à la fois, modèles visuels',
        sensory: 'Matériaux variés pour stimulation tactile'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer des motifs avec les lignes',
          'Inventer de nouveaux types de lignes',
          'Raconter une histoire avec les lignes',
          'Combiner lignes fines et épaisses'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation du contrôle moteur, de l\'exploration créative et de la capacité à varier les types de lignes.',
      subNotes: "Exploration des lignes avec mouvements corporels et création artistique. Musique fournie. Espaces de travail délimités.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les formes géométriques amies",
      date: new Date('2025-09-10'),
      duration: 40,
      mindsOn: "Chasseurs de formes! Trouvons des cercles, carrés, triangles et rectangles dans notre classe. Chaque forme a sa personnalité! Jeu de reconnaissance rapide. (10 min)",
      action: `1. Tri et classification de formes découpées (5 min)
2. Traçage de formes avec gabarits (5 min)
3. Création: "Ma maison de formes" - collage géométrique (15 min)
4. Ajout de détails et personnalisation (10 min)`,
      consolidation: "Comptez combien de chaque forme vous avez utilisé. Quelle forme était la plus utile? Présentation des maisons géométriques. (5 min)",
      learningGoals: "Reconnaître les formes géométriques de base; Créer des compositions avec des formes; Développer la motricité fine",
      materials: JSON.stringify([
        'Formes prédécoupées variées',
        'Gabarits de formes',
        'Colle en bâton',
        'Papier de construction coloré',
        'Ciseaux sécuritaires',
        'Crayons et marqueurs'
      ]),
      grouping: "Travail individuel avec moments de partage",
      accommodations: JSON.stringify({
        forStruggling: [
          'Formes plus grandes et prédécoupées',
          'Colle facile à utiliser',
          'Nombre limité de formes'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ciseaux adaptés, formes prédécoupées, aide au collage',
        cognitive: 'Modèle visuel de maison, étapes simplifiées',
        sensory: 'Formes texturées, colle sans odeur'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Découper leurs propres formes',
          'Créer une ville entière',
          'Inventer de nouvelles formes',
          'Ajouter des motifs dans les formes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la reconnaissance des formes, de la capacité à les manipuler et à créer une composition organisée.',
      subNotes: "Travail avec formes géométriques et collage. Formes prédécoupées disponibles. Modèles de maisons affichés pour inspiration.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 3: TEXTURES ET TECHNIQUES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Toucher avec les yeux",
      date: new Date('2025-09-15'),
      duration: 40,
      mindsOn: "Fermez les yeux et touchez ces objets mystères. Comment les décrire? Doux, rugueux, lisse, bosselé? Les textures racontent des histoires! Exploration sensorielle. (10 min)",
      action: `1. Station de frottage: créer des textures sur papier (10 min)
2. Création de textures avec divers outils dans la peinture (10 min)
3. Œuvre collective: "Notre jardin de textures" (10 min)
4. Ajout d'éléments personnels au jardin (5 min)`,
      consolidation: "Quelle texture était la plus surprenante? Comment avez-vous créé cette texture? Tour du jardin de textures. (5 min)",
      learningGoals: "Explorer différentes textures; Utiliser diverses techniques de création de texture; Contribuer à une œuvre collective",
      materials: JSON.stringify([
        'Objets texturés variés',
        'Papier fin pour frottage',
        'Crayons de cire',
        'Peinture épaisse',
        'Outils variés (éponges, fourchettes, brosses)',
        'Grande feuille collective'
      ]),
      grouping: "Rotation aux stations puis travail collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Textures plus évidentes',
          'Aide pour le frottage',
          'Zone définie dans l\'œuvre collective'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Outils faciles à tenir, support pour le papier',
        cognitive: 'Une texture à la fois, démonstration répétée',
        sensory: 'Choix de textures selon préférences sensorielles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un livre de textures',
          'Inventer de nouvelles techniques',
          'Combiner plusieurs textures',
          'Nommer et décrire les textures'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'exploration sensorielle, de l\'expérimentation technique et de la contribution à l\'œuvre collective.',
      subNotes: "Exploration des textures avec stations préparées. Œuvre collective sur grande feuille au mur. Protection du sol importante.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Impression et empreintes",
      date: new Date('2025-09-17'),
      duration: 40,
      mindsOn: "Regardez votre main - elle est unique! Vos empreintes racontent votre histoire. Aujourd'hui, nous allons imprimer avec différents objets! Démonstration de la technique. (10 min)",
      action: `1. Empreintes de mains avec peinture (5 min)
2. Impression avec objets du quotidien (10 min)
3. Création: "Mon jardin d'empreintes" avec divers objets (15 min)
4. Transformation des empreintes en animaux ou objets (5 min)`,
      consolidation: "Quel objet a fait l'empreinte la plus intéressante? Comment avez-vous transformé vos empreintes? Séchage et exposition. (5 min)",
      learningGoals: "Découvrir la technique d'impression; Expérimenter avec différents objets; Développer l'imagination créative",
      materials: JSON.stringify([
        'Tampons encreurs lavables',
        'Peinture en plateaux',
        'Objets variés (éponges, bouchons, légumes)',
        'Papier absorbant',
        'Lingettes humides',
        'Marqueurs pour détails'
      ]),
      grouping: "Travail individuel avec partage de matériel",
      accommodations: JSON.stringify({
        forStruggling: [
          'Objets plus gros et faciles à tenir',
          'Aide pour l\'application de peinture',
          'Une couleur à la fois'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Tampons avec poignées, aide physique pour l\'impression',
        cognitive: 'Étapes visuelles, une technique à la fois',
        sensory: 'Peinture lavable sans odeur, gants disponibles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer des motifs répétitifs',
          'Superposer les impressions',
          'Raconter une histoire avec les empreintes',
          'Créer leurs propres tampons'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la maîtrise de la technique d\'impression et de la créativité dans l\'utilisation des empreintes.',
      subNotes: "Technique d'impression avec objets variés. Stations de peinture protégées. Lingettes et lavabo accessible. Séchage organisé.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 4: NATURE ET ART ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "L'art de la nature",
      date: new Date('2025-09-22'),
      duration: 40,
      mindsOn: "La nature est la première artiste! Observons ces feuilles, branches, et pierres. Quelles formes, couleurs et textures voyez-vous? Création d'un musée naturel temporaire. (10 min)",
      action: `1. Collecte respectueuse d'éléments naturels (si possible à l'extérieur) (10 min)
2. Arrangement: création d'un mandala naturel (10 min)
3. Dessin d'observation de leur création (10 min)
4. Ajout de couleurs imaginaires (5 min)`,
      consolidation: "Qu'avez-vous appris de la nature aujourd'hui? Comment la nature vous inspire-t-elle? Photos des mandalas avant démontage. (5 min)",
      learningGoals: "Observer la beauté dans la nature; Créer avec des matériaux naturels; Développer le respect de l'environnement",
      materials: JSON.stringify([
        'Éléments naturels collectés',
        'Plateaux pour arrangements',
        'Papier et crayons',
        'Aquarelles',
        'Loupes',
        'Appareil photo'
      ]),
      grouping: "Individuel avec moments d'observation collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Collection pré-faite disponible',
          'Modèles de mandalas simples',
          'Aide pour l\'arrangement'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Éléments plus gros, plateau avec rebord',
        cognitive: 'Instructions étape par étape, modèles visuels',
        sensory: 'Choix d\'éléments selon confort sensoriel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un mandala géant en groupe',
          'Identifier et nommer les éléments',
          'Créer une histoire sur leur mandala',
          'Dessiner plusieurs vues'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la créativité dans l\'arrangement, du respect des matériaux naturels et de la capacité d\'observation.',
      subNotes: "Art avec éléments naturels. Collection préparée si sortie impossible. Focus sur l'art éphémère. Photos pour documentation.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Peindre comme les saisons",
      date: new Date('2025-09-24'),
      duration: 40,
      mindsOn: "C'est l'automne! Quelles couleurs voyez-vous dehors? Comment montrer l'automne dans notre art? Observation par la fenêtre et discussion. (10 min)",
      action: `1. Mélange de couleurs automnales (orange, brun, rouge) (10 min)
2. Technique de l'éponge pour créer le feuillage (10 min)
3. Création: "Mon arbre d'automne" avec techniques mixtes (10 min)
4. Ajout de détails (feuilles qui tombent, animaux) (5 min)`,
      consolidation: "Comment votre arbre montre-t-il l'automne? Quelle technique avez-vous préférée? Création d'une forêt d'automne collective. (5 min)",
      learningGoals: "Observer les changements saisonniers; Utiliser les couleurs pour exprimer une saison; Expérimenter des techniques variées",
      materials: JSON.stringify([
        'Peinture (jaune, rouge, brun, orange)',
        'Éponges variées',
        'Pinceaux',
        'Papier blanc et coloré',
        'Colle',
        'Feuilles séchées (optionnel)'
      ]),
      grouping: "Travail individuel puis assemblage collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Couleurs pré-mélangées',
          'Gabarit d\'arbre disponible',
          'Techniques simplifiées'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Éponges avec poignées, peinture au doigt permise',
        cognitive: 'Une technique à la fois, modèle visuel',
        sensory: 'Textures variées, peinture sans odeur'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer les quatre saisons',
          'Ajouter perspective et profondeur',
          'Peindre différents types d\'arbres',
          'Créer un paysage complet'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'observation des caractéristiques saisonnières et de l\'utilisation appropriée des couleurs et techniques.',
      subNotes: "Peinture sur le thème de l'automne. Techniques d'éponge démontrées. Protection des surfaces. Forêt collective sur grand papier.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 5: PORTRAITS ET ÉMOTIONS ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les visages des émotions",
      date: new Date('2025-09-29'),
      duration: 40,
      mindsOn: "Faisons des visages! Montrez-moi content, triste, surpris, fâché. Comment nos visages changent avec nos émotions? Miroirs et exploration. (10 min)",
      action: `1. Pratique: dessiner des expressions simples (cercles avec émotions) (10 min)
2. Observation dans le miroir et croquis rapides (5 min)
3. Création: "Mon livre des émotions" - 4 visages différents (10 min)
4. Coloration et décoration des visages (10 min)`,
      consolidation: "Quelle émotion était la plus difficile à dessiner? Comment vous sentez-vous maintenant? Partage des livres d'émotions. (5 min)",
      learningGoals: "Représenter différentes émotions; Développer l'observation; Exprimer ses sentiments par l'art",
      materials: JSON.stringify([
        'Miroirs individuels',
        'Papier plié en livre',
        'Crayons et marqueurs',
        'Pastels',
        'Autocollants',
        'Photos d\'émotions'
      ]),
      grouping: "Travail individuel avec observation en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Gabarits de visages',
          'Émotions de base seulement',
          'Aide pour l\'observation'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Support pour tenir le miroir, outils adaptés',
        cognitive: 'Une émotion à la fois, modèles visuels',
        sensory: 'Miroirs incassables, espace calme'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajouter le corps entier',
          'Créer des émotions complexes',
          'Écrire des mots pour chaque émotion',
          'Inventer de nouvelles expressions'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la capacité à représenter les émotions et de la conscience émotionnelle exprimée.',
      subNotes: "Exploration des émotions par le dessin. Miroirs et références visuelles disponibles. Ambiance bienveillante importante.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Portrait de mon ami",
      date: new Date('2025-10-01'),
      duration: 40,
      mindsOn: "Regardez bien votre partenaire. Quelle est la couleur de ses yeux? La forme de son nez? Nous allons être des artistes-portraitistes! Observation en paires. (10 min)",
      action: `1. Pratique: les proportions du visage avec guide (5 min)
2. Croquis rapide du partenaire (5 min)
3. Portrait détaillé avec couleurs (15 min)
4. Ajout du décor et personnalisation (5 min)`,
      consolidation: "Montrez le portrait à votre modèle. Qu'est-ce qu'ils aiment? Échange de portraits et remerciements. (10 min)",
      learningGoals: "Observer attentivement un modèle; Représenter un visage humain; Développer l'empathie et l'attention à l'autre",
      materials: JSON.stringify([
        'Papier format portrait',
        'Crayons à mine',
        'Crayons de couleur',
        'Pastels',
        'Gommes à effacer',
        'Guide de proportions'
      ]),
      grouping: "Travail en paires face à face",
      accommodations: JSON.stringify({
        forStruggling: [
          'Ovale pré-tracé pour le visage',
          'Points de repère marqués',
          'Portrait plus simple accepté'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Chevalet ou plan incliné, outils adaptés',
        cognitive: 'Étapes guidées une à la fois, aide visuelle',
        sensory: 'Distance confortable, pauses fréquentes'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajouter ombres et lumières',
          'Dessiner le corps entier',
          'Créer un arrière-plan détaillé',
          'Écrire une description'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'observation, de l\'effort pour représenter fidèlement et du respect envers le modèle.',
      subNotes: "Portraits en paires avec rotation des rôles. Guide de proportions affiché. Atmosphère respectueuse et positive essentielle.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 6: SCULPTURE ET 3D ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Sculpter avec de la pâte",
      date: new Date('2025-10-06'),
      duration: 40,
      mindsOn: "L'art n'est pas toujours plat! Aujourd'hui, nous créons en 3D. Regardez cette pâte à modeler - que pouvez-vous créer? Démonstration de techniques de base. (10 min)",
      action: `1. Exploration: techniques de base (rouler, aplatir, pincer) (5 min)
2. Création de formes simples (boules, serpents, galettes) (5 min)
3. Sculpture: "Mon animal préféré" en pâte à modeler (15 min)
4. Ajout de textures et détails (5 min)`,
      consolidation: "Présentez votre animal. Comment avez-vous fait les pattes? Les yeux? Exposition sur la table des sculptures. (10 min)",
      learningGoals: "Manipuler des matériaux en 3D; Développer la motricité fine; Créer des formes tridimensionnelles",
      materials: JSON.stringify([
        'Pâte à modeler colorée',
        'Outils de modelage',
        'Planches de travail',
        'Cure-dents pour détails',
        'Yeux mobiles',
        'Plateaux d\'exposition'
      ]),
      grouping: "Travail individuel avec partage de matériel",
      accommodations: JSON.stringify({
        forStruggling: [
          'Pâte plus molle',
          'Formes de base pré-faites',
          'Animal simple encouragé'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Pâte adaptée, outils ergonomiques, support',
        cognitive: 'Une partie à la fois, modèle étape par étape',
        sensory: 'Pâte sans odeur, texture alternative si besoin'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer une famille d\'animaux',
          'Ajouter un habitat',
          'Mélanger les couleurs de pâte',
          'Créer des animaux imaginaires'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la manipulation de la pâte, de la créativité dans la forme et de la persévérance.',
      subNotes: "Sculpture avec pâte à modeler. Tables protégées. Outils partagés et nettoyés. Conservation possible des œuvres.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Construction et assemblage",
      date: new Date('2025-10-08'),
      duration: 40,
      mindsOn: "Nous sommes des architectes! Avec des matériaux recyclés, nous pouvons construire des merveilles. Regardez ces boîtes et tubes - que voyez-vous? Tour d'imagination. (10 min)",
      action: `1. Exploration des matériaux et planification (5 min)
2. Construction: base solide et structure (10 min)
3. Assemblage et collage des éléments (10 min)
4. Décoration avec papier et couleurs (10 min)`,
      consolidation: "Qu'avez-vous construit? Comment ça tient debout? Ville collective avec toutes les constructions. (5 min)",
      learningGoals: "Construire en 3D; Résoudre des problèmes d'équilibre; Développer la vision spatiale",
      materials: JSON.stringify([
        'Boîtes variées',
        'Tubes de carton',
        'Colle forte',
        'Ruban adhésif',
        'Papier coloré',
        'Ciseaux',
        'Matériaux de décoration'
      ]),
      grouping: "Travail individuel ou en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Structures plus simples',
          'Aide pour l\'assemblage',
          'Base pré-construite'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Matériaux légers, colle facile, aide physique',
        cognitive: 'Plan simple, une étape à la fois',
        sensory: 'Matériaux propres, colle sans odeur'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajouter des éléments mobiles',
          'Créer plusieurs bâtiments',
          'Inventer une histoire',
          'Ajouter éclairage (LED simple)'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la résolution de problèmes, de la créativité dans la construction et de la persévérance.',
      subNotes: "Construction avec matériaux recyclés. Collection préparée et triée. Espace de construction défini. Sécurité avec la colle.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 7: ART ET CULTURE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Art du monde",
      date: new Date('2025-10-14'),
      duration: 40,
      mindsOn: "L'art existe partout dans le monde! Voyageons avec notre imagination. Voici des œuvres de différents pays. Qu'est-ce qui est différent? Pareil? Exploration visuelle. (10 min)",
      action: `1. Station 1: Motifs africains avec formes géométriques (10 min)
2. Station 2: Fleurs de cerisier japonaises à l'éponge (10 min)
3. Station 3: Art autochtone avec symboles naturels (10 min)`,
      consolidation: "Quelle tradition artistique vous a inspiré? Qu'avez-vous appris? Passeport artistique avec nos créations. (10 min)",
      learningGoals: "Découvrir différentes traditions artistiques; Respecter la diversité culturelle; S'inspirer d'autres cultures",
      materials: JSON.stringify([
        'Images d\'art du monde',
        'Papier varié',
        'Peinture et pinceaux',
        'Éponges',
        'Marqueurs',
        'Modèles de motifs'
      ]),
      grouping: "Rotation en petits groupes aux stations",
      accommodations: JSON.stringify({
        forStruggling: [
          'Motifs simplifiés',
          'Gabarits disponibles',
          'Une technique par station'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Outils adaptés, support pour le papier',
        cognitive: 'Instructions visuelles, aide individuelle',
        sensory: 'Choix de station selon préférence'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Combiner plusieurs styles',
          'Créer leurs propres motifs',
          'Rechercher l\'origine des styles',
          'Créer une œuvre fusion'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation du respect culturel, de l\'exploration de nouveaux styles et de l\'ouverture à la diversité.',
      subNotes: "Exploration de l'art mondial avec stations. Images de référence à chaque station. Contexte culturel simplifié fourni.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Célébration d'Halloween créative",
      date: new Date('2025-10-16'),
      duration: 40,
      mindsOn: "L'Halloween approche! Comment les artistes célèbrent-ils cette fête? Créons de l'art qui fait sourire, pas peur! Brainstorm d'idées amusantes. (10 min)",
      action: `1. Création de masques d'Halloween avec assiettes en carton (15 min)
2. Décoration avec matériaux variés (10 min)
3. Ajout d'élastiques et ajustements (5 min)`,
      consolidation: "Parade de masques! Racontez qui est votre personnage. Photos souvenirs avec les masques. (10 min)",
      learningGoals: "Créer un objet fonctionnel artistique; Célébrer une tradition; Développer l'imagination",
      materials: JSON.stringify([
        'Assiettes en carton',
        'Papier de construction',
        'Plumes, pompons, paillettes',
        'Colle et ciseaux',
        'Élastiques',
        'Marqueurs et peinture'
      ]),
      grouping: "Travail individuel avec parade collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Masque pré-découpé',
          'Décoration simple',
          'Aide pour l\'assemblage'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ciseaux adaptés, aide pour les trous',
        cognitive: 'Modèles disponibles, étapes guidées',
        sensory: 'Matériaux non-irritants, masque optionnel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un costume complet',
          'Ajouter des éléments 3D',
          'Inventer une histoire',
          'Créer plusieurs personnages'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Évaluation de la créativité, de l\'utilisation des matériaux et de la participation à la célébration.',
      subNotes: "Création de masques d'Halloween. Thème positif et amusant. Découpage supervisé. Parade organisée en fin de séance.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 8: TECHNIQUES MIXTES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Collage créatif",
      date: new Date('2025-10-20'),
      duration: 40,
      mindsOn: "Un collage raconte une histoire avec des morceaux! Regardez ces magazines - nous allons créer de nouvelles images. Démonstration de découpage et composition. (10 min)",
      action: `1. Recherche et découpage d'images intéressantes (10 min)
2. Arrangement et composition sur papier (5 min)
3. Collage et assemblage créatif (10 min)
4. Ajout de dessins et décorations (10 min)`,
      consolidation: "Racontez l'histoire de votre collage. Qu'est-ce qui vous a inspiré? Galerie de collages. (5 min)",
      learningGoals: "Composer avec des éléments variés; Développer le sens de la composition; Raconter une histoire visuelle",
      materials: JSON.stringify([
        'Magazines adaptés',
        'Ciseaux sécuritaires',
        'Colle en bâton',
        'Papier de base coloré',
        'Marqueurs et crayons',
        'Éléments décoratifs'
      ]),
      grouping: "Travail individuel avec partage de matériel",
      accommodations: JSON.stringify({
        forStruggling: [
          'Images pré-découpées disponibles',
          'Thème simple suggéré',
          'Aide pour l\'arrangement'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Ciseaux adaptés, images pré-découpées',
        cognitive: 'Nombre limité d\'éléments, guide visuel',
        sensory: 'Magazines sans odeur, colle non-toxique'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un livre de collages',
          'Ajouter du texte',
          'Faire un collage 3D',
          'Créer une série thématique'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la créativité dans la composition, de l\'utilisation de l\'espace et de la narration visuelle.',
      subNotes: "Collage avec magazines présélectionnés (contenu approprié). Tables protégées. Organisation du matériel par stations.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Art avec objets trouvés",
      date: new Date('2025-10-22'),
      duration: 40,
      mindsOn: "Les artistes voient de l'art partout! Ces boutons, ces bouchons, ces rubans peuvent devenir de l'art. Que voyez-vous? Brainstorm créatif. (10 min)",
      action: `1. Exploration et tri des objets par couleur/forme (5 min)
2. Création d'un tableau avec objets collés (15 min)
3. Ajout de peinture et dessins autour des objets (10 min)`,
      consolidation: "Comment avez-vous transformé ces objets? Qu'est-ce qui est devenu quoi? Musée des objets transformés. (10 min)",
      learningGoals: "Voir le potentiel créatif dans les objets quotidiens; Créer des compositions mixtes; Développer l'innovation",
      materials: JSON.stringify([
        'Collection d\'objets variés',
        'Carton rigide',
        'Colle forte',
        'Peinture et pinceaux',
        'Marqueurs',
        'Cadres en carton'
      ]),
      grouping: "Travail individuel créatif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Objets plus gros et faciles',
          'Aide pour le collage',
          'Composition guidée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Objets faciles à manipuler, aide au collage',
        cognitive: 'Tri simple, une catégorie à la fois',
        sensory: 'Objets propres et lisses, gants disponibles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer une sculpture',
          'Peindre les objets avant',
          'Créer un triptyque',
          'Inventer une machine imaginaire'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de l\'innovation, de la transformation créative et de l\'utilisation réfléchie des matériaux.',
      subNotes: "Art avec objets recyclés et trouvés. Collection triée et nettoyée. Colle forte sous supervision. Espace de séchage prévu.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 9: PROJET FINAL ET EXPOSITION ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mon chef-d'œuvre personnel",
      date: new Date('2025-10-27'),
      duration: 40,
      mindsOn: "Vous êtes maintenant des artistes experts! Pour notre exposition, créez votre œuvre préférée. Que voulez-vous montrer au monde? Planification individuelle. (10 min)",
      action: `1. Choix du médium et du sujet (5 min)
2. Croquis ou plan de l'œuvre (5 min)
3. Création de l'œuvre finale (20 min)
4. Signature de l'artiste (5 min)`,
      consolidation: "Donnez un titre à votre œuvre. Pourquoi est-elle spéciale? Préparation pour l'exposition. (5 min)",
      learningGoals: "Synthétiser les apprentissages; Faire des choix artistiques autonomes; Créer une œuvre aboutie",
      materials: JSON.stringify([
        'Tous les matériaux disponibles',
        'Papier de qualité',
        'Cartons de présentation',
        'Étiquettes pour titres',
        'Matériel de choix'
      ]),
      grouping: "Travail individuel autonome",
      accommodations: JSON.stringify({
        forStruggling: [
          'Rappel des techniques apprises',
          'Aide pour le choix',
          'Format adapté'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Outils et support adaptés',
        cognitive: 'Plan simplifié, aide à la décision',
        sensory: 'Environnement calme, matériaux confortables'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer une série d\'œuvres',
          'Utiliser techniques multiples',
          'Créer un cadre',
          'Écrire une description d\'artiste'
        ]
      }),
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation finale de l\'autonomie créative, de l\'application des techniques et de l\'expression personnelle.',
      subNotes: "Projet final avec choix libre. Tous les matériaux disponibles. Support individualisé. Préparation pour exposition.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Exposition et célébration",
      date: new Date('2025-10-29'),
      duration: 40,
      mindsOn: "Bienvenue à notre galerie d'art! Aujourd'hui, nous sommes des artistes professionnels. Comment présenter notre art? Pratique de la présentation. (10 min)",
      action: `1. Installation de l'exposition (10 min)
2. Répétition des présentations (5 min)
3. Vernissage: visite guidée par les artistes (15 min)
4. Livre d'or: dessins et messages (5 min)`,
      consolidation: "Qu'avez-vous appris en 9 semaines? Quel artiste êtes-vous devenu? Certificats d'artiste et célébration. (5 min)",
      learningGoals: "Présenter son travail avec fierté; Apprécier le travail des autres; Célébrer le parcours artistique",
      materials: JSON.stringify([
        'Œuvres encadrées/montées',
        'Étiquettes et titres',
        'Livre d\'or',
        'Certificats',
        'Appareil photo',
        'Rafraîchissements simples'
      ]),
      grouping: "Présentation individuelle et célébration collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Présentation avec support',
          'Option de présenter en petit groupe',
          'Aide pour l\'installation'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Hauteur d\'accrochage adaptée',
        cognitive: 'Présentation guidée, support visuel',
        sensory: 'Espace calme disponible, pauses permises'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Être guide de l\'exposition',
          'Créer le catalogue',
          'Interviewer les artistes',
          'Organiser l\'événement'
        ]
      }),
      assessmentType: 'Sommative et Célébrative',
      assessmentNotes: 'Évaluation finale du portfolio complet, de la présentation et de la progression sur l\'unité.',
      subNotes: "Exposition finale avec toutes les œuvres. Invitations possibles. Organisation spatiale préparée. Ambiance festive et valorisante.",
      isSubFriendly: true,
      subject: 'Arts visuels',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    console.log('\n📝 Creating 18 perfect Arts lessons...\n');
    
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson: ${created.title} (${created.date.toLocaleDateString()})`);
    }

    // Verify the perfection
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION OF ARTS LESSONS:');
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
      console.log('🎨 PERFECTION ACHIEVED!');
      console.log('='.repeat(60));
      console.log('✨ All 18 Arts lessons are 100% PERFECT!');
      console.log('✨ Complete ETFO compliance from the start!');
      console.log('✨ Ready for Grade 1 French Immersion!');
      console.log('✨ September 3 to October 29, 2025');
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectArtsLessons();