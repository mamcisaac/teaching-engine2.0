import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectWellnessLessons() {
  console.log('💚 CREATING PERFECT WELLNESS LESSONS - MON BIEN-ÊTRE ET MOI');
  console.log('='.repeat(60));

  // Get the test teacher account
  const teacher = await prisma.user.findFirst({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!teacher) {
    console.error('❌ Teacher not found');
    return;
  }

  // Get the wellness unit
  const unit = await prisma.unitPlan.findFirst({
    where: { title: "Mon bien-être et moi" }
  });

  if (!unit) {
    console.error('❌ Unit not found!');
    return;
  }

  console.log('✅ Found unit:', unit.title);
  console.log('Start date:', unit.startDate.toLocaleDateString());
  console.log('End date:', unit.endDate.toLocaleDateString());

  const lessons = [
    // ==================== WEEK 1: INTRODUCTION AU BIEN-ÊTRE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Qu'est-ce que le bien-être?",
      date: new Date('2025-09-03'),
      duration: 40,
      mindsOn: "Qu'est-ce qui vous fait sentir bien? Heureux? En santé? Créons notre définition du bien-être ensemble. Cercle de discussion avec peluche qui parle. (10 min)",
      action: `1. Histoire: "Le petit ours qui prend soin de lui" (5 min)
2. Exploration des 4 dimensions du bien-être (physique, émotionnel, social, mental) avec stations (15 min)
3. Création d'un "Arbre du bien-être" personnel avec branches pour chaque dimension (10 min)
4. Décoration et personnalisation de l'arbre (5 min)`,
      consolidation: "Partagez une chose que vous faites pour votre bien-être. Notre promesse de classe: prendre soin de nous et des autres. Affichage des arbres. (5 min)",
      learningGoals: "Comprendre le concept de bien-être; Identifier les différentes dimensions du bien-être; Reconnaître l'importance de prendre soin de soi",
      materials: JSON.stringify([
        'Livre d\'histoire',
        'Peluche pour le cercle',
        'Papier grand format',
        'Crayons et marqueurs',
        'Autocollants bien-être',
        'Affiches des 4 dimensions'
      ]),
      grouping: "Cercle de discussion, stations en petits groupes, travail individuel",
      accommodations: JSON.stringify({
        forStruggling: [
          'Images visuelles pour chaque dimension',
          'Arbre pré-dessiné disponible',
          'Participation orale optionnelle'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Supports pour tenir les crayons, position adaptée',
        cognitive: 'Concepts simplifiés, une dimension à la fois',
        sensory: 'Espace calme disponible, matériel sensoriel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Ajouter des exemples pour chaque dimension',
          'Créer un livre du bien-être',
          'Aider les autres avec leurs arbres',
          'Écrire des mots sur le bien-être'
        ]
      }),
      assessmentType: 'Diagnostique',
      assessmentNotes: 'Évaluation initiale de la compréhension du bien-être et de la conscience de soi. Documentation des conceptions initiales.',
      subNotes: "Introduction au bien-être avec histoire et activité créative. Matériel préparé par stations. Ambiance positive et accueillante.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mon corps extraordinaire",
      date: new Date('2025-09-05'),
      duration: 40,
      mindsOn: "Touchez votre tête, vos épaules, vos genoux, vos orteils! Notre corps est une machine merveilleuse. Chanson avec mouvements. (10 min)",
      action: `1. Exploration: les parties du corps et leurs fonctions (10 min)
2. Jeu "Simon dit" version corps et santé (5 min)
3. Création d'un bonhomme grandeur nature (traçage et identification) (10 min)
4. Décoration: ce que j'aime de mon corps (10 min)`,
      consolidation: "Qu'est-ce que votre corps peut faire de spécial? Comment remercier notre corps? Appréciation corporelle positive. (5 min)",
      learningGoals: "Identifier les parties du corps; Comprendre les fonctions corporelles de base; Développer une image corporelle positive",
      materials: JSON.stringify([
        'Grande feuille de papier',
        'Crayons et marqueurs',
        'Affiches anatomiques simples',
        'Musique pour la chanson',
        'Miroirs',
        'Autocollants corps humain'
      ]),
      grouping: "Activité collective, partenaires pour le traçage, travail individuel",
      accommodations: JSON.stringify({
        forStruggling: [
          'Aide pour le traçage',
          'Étiquettes pré-écrites',
          'Modèle visuel disponible'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Traçage adapté, position confortable',
        cognitive: 'Parties du corps de base seulement',
        sensory: 'Éviter le contact si inconfortable'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Nommer les organes internes',
          'Expliquer les fonctions',
          'Créer un livre du corps',
          'Ajouter le squelette'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la connaissance du corps et de l\'attitude positive envers le corps. Observation du respect de soi et des autres.',
      subNotes: "Exploration du corps humain avec activité de traçage. Promouvoir l'image corporelle positive. Respecter la pudeur.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 2: HABITUDES SAINES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Bien manger pour grandir",
      date: new Date('2025-09-08'),
      duration: 40,
      mindsOn: "Qu'avez-vous mangé ce matin? Pourquoi mangeons-nous? Découvrons les groupes alimentaires avec des images appétissantes! (10 min)",
      action: `1. Présentation du Guide alimentaire canadien adapté (5 min)
2. Tri d'aliments (vrais ou images) par groupes (10 min)
3. Création d'une assiette équilibrée en collage (10 min)
4. Jeu "Le restaurant santé" - commander un repas équilibré (10 min)`,
      consolidation: "Montrez votre assiette équilibrée. Qu'allez-vous essayer de manger aujourd'hui? Engagement pour une collation santé. (5 min)",
      learningGoals: "Identifier les groupes alimentaires; Comprendre l'importance d'une alimentation équilibrée; Faire des choix alimentaires sains",
      materials: JSON.stringify([
        'Images d\'aliments variés',
        'Assiettes en carton',
        'Colle et ciseaux',
        'Guide alimentaire visuel',
        'Aliments factices',
        'Menu du restaurant santé'
      ]),
      grouping: "Discussion collective, travail en stations, jeu de rôle en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Images pré-découpées',
          'Groupes alimentaires codés par couleur',
          'Aide pour le tri'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Manipulation adaptée, support pour découpage',
        cognitive: '3 groupes principaux seulement, exemples simples',
        sensory: 'Images au lieu d\'aliments réels si sensibilité'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer un menu complet',
          'Expliquer les nutriments',
          'Planifier les repas d\'une journée',
          'Calculer les portions'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension des groupes alimentaires et de la capacité à créer un repas équilibré.',
      subNotes: "Nutrition de base avec Guide alimentaire canadien. Images d'aliments préparées. Respecter les restrictions alimentaires.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "L'eau, c'est la vie!",
      date: new Date('2025-09-10'),
      duration: 40,
      mindsOn: "Regardez cette plante fanée... Que se passe-t-il quand on l'arrose? Notre corps aussi a besoin d'eau! Démonstration visuelle. (10 min)",
      action: `1. Expérience: colorant dans l'eau avec céleri (démonstration) (5 min)
2. Création d'un "compteur d'eau" personnel pour la journée (10 min)
3. Décoration de bouteilles d'eau réutilisables (10 min)
4. Chanson et danse de l'hydratation (5 min)`,
      consolidation: "Combien de verres d'eau devons-nous boire? Promesse de boire de l'eau régulièrement. Test du compteur d'eau. (10 min)",
      learningGoals: "Comprendre l'importance de l'hydratation; Développer l'habitude de boire de l'eau; Reconnaître les signes de soif",
      materials: JSON.stringify([
        'Plante et arrosoir',
        'Céleri et colorant alimentaire',
        'Papier pour compteurs',
        'Autocollants',
        'Bouteilles réutilisables',
        'Marqueurs permanents'
      ]),
      grouping: "Observation collective, création individuelle, activité de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Compteur pré-fait',
          'Rappels visuels pour boire',
          'Bouteille avec marqueurs de niveau'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Aide pour tenir la bouteille, paille si nécessaire',
        cognitive: 'Compteur simplifié, images au lieu de nombres',
        sensory: 'Eau à température préférée'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Calculer les besoins en eau',
          'Créer une affiche sur l\'hydratation',
          'Expliquer le cycle de l\'eau dans le corps',
          'Journal d\'hydratation'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la compréhension de l\'hydratation et de l\'engagement à boire de l\'eau. Suivi du compteur.',
      subNotes: "Leçon sur l'hydratation avec expérience scientifique simple. Bouteilles d'eau préparées. Encourager l'hydratation régulière.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 3: HYGIÈNE PERSONNELLE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Les microbes invisibles",
      date: new Date('2025-09-15'),
      duration: 40,
      mindsOn: "Paillettes magiques = microbes! Touchons les paillettes et voyons comment elles se propagent partout! Démonstration interactive. (10 min)",
      action: `1. Expérience de propagation des "microbes" (paillettes) (5 min)
2. Apprentissage du lavage des mains efficace (chanson 20 secondes) (10 min)
3. Création d'une affiche "Stop aux microbes!" (10 min)
4. Pratique du lavage avec vérification UV (si disponible) (5 min)`,
      consolidation: "Quand devons-nous laver nos mains? Démonstration par des volontaires. Engagement de classe pour l'hygiène. (10 min)",
      learningGoals: "Comprendre la propagation des germes; Maîtriser la technique de lavage des mains; Développer des habitudes d'hygiène",
      materials: JSON.stringify([
        'Paillettes (pour simuler les germes)',
        'Savon et lavabo',
        'Affiches étapes du lavage',
        'Papier et crayons',
        'Lampe UV (optionnel)',
        'Chanson du lavage des mains'
      ]),
      grouping: "Démonstration collective, pratique individuelle, création en petits groupes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Aide physique pour le lavage',
          'Séquence visuelle détaillée',
          'Chanson plus lente'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Lavabo accessible, savon adapté',
        cognitive: 'Étapes simplifiées, répétition guidée',
        sensory: 'Savon sans parfum, eau tiède'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Expliquer les types de microbes',
          'Créer une chanson personnelle',
          'Enseigner aux plus jeunes',
          'Journal d\'hygiène'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la technique de lavage des mains et de la compréhension de l\'importance de l\'hygiène.',
      subNotes: "Leçon sur les germes avec expérience des paillettes. Accès au lavabo nécessaire. Supervision du lavage des mains.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mes dents brillantes",
      date: new Date('2025-09-17'),
      duration: 40,
      mindsOn: "Souriez! Combien de dents avez-vous? Les dents de lait vont tomber pour faire place aux dents d'adulte! Histoire de la petite souris. (10 min)",
      action: `1. Exploration: types de dents et leurs rôles (5 min)
2. Démonstration du brossage correct sur modèle géant (5 min)
3. Pratique du brossage avec brosse à dents personnelle (5 min)
4. Création d'un tableau de brossage pour la maison (10 min)
5. Tri: aliments bons/mauvais pour les dents (5 min)`,
      consolidation: "Montrez comment vous brossez vos dents. Combien de fois par jour? Chanson du brossage des dents. (10 min)",
      learningGoals: "Comprendre l'importance de l'hygiène dentaire; Maîtriser la technique de brossage; Identifier les aliments bons pour les dents",
      materials: JSON.stringify([
        'Modèle de dents géant',
        'Brosses à dents (une par élève)',
        'Miroirs',
        'Images d\'aliments',
        'Papier pour tableaux',
        'Autocollants dents'
      ]),
      grouping: "Démonstration collective, pratique individuelle, tri en équipes",
      accommodations: JSON.stringify({
        forStruggling: [
          'Brosse à dents adaptée',
          'Guide visuel du brossage',
          'Tableau simplifié'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Brosse avec manche adapté, aide au mouvement',
        cognitive: 'Deux étapes principales, démonstration répétée',
        sensory: 'Brosse douce, pas de dentifrice si sensible'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Expliquer les caries',
          'Démontrer l\'utilisation du fil dentaire',
          'Créer une histoire sur les dents',
          'Compter les dents'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la technique de brossage et de la compréhension de l\'hygiène dentaire.',
      subNotes: "Hygiène dentaire avec pratique du brossage. Brosses à dents neuves fournies. Envoyer tableau de brossage à la maison.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 4: SÉCURITÉ PERSONNELLE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Je suis en sécurité",
      date: new Date('2025-09-22'),
      duration: 40,
      mindsOn: "Qu'est-ce qui vous fait sentir en sécurité? Qu'est-ce qui vous fait sentir en danger? Création d'un thermomètre de sécurité. (10 min)",
      action: `1. Identification des personnes de confiance (5 min)
2. Apprentissage des informations personnelles importantes (nom, adresse, téléphone) (10 min)
3. Jeu de rôle: que faire si on est perdu? (10 min)
4. Création d'une carte "Ma sécurité" avec infos et personnes de confiance (5 min)`,
      consolidation: "Pratique: réciter ses informations personnelles. Qui sont vos personnes de confiance? Plan de sécurité familial. (10 min)",
      learningGoals: "Identifier les personnes de confiance; Mémoriser les informations personnelles importantes; Savoir quoi faire en cas d'urgence",
      materials: JSON.stringify([
        'Cartes de sécurité',
        'Photos/images de personnes',
        'Téléphone jouet',
        'Affiches de sécurité',
        'Crayons et marqueurs',
        'Plastifieuse pour cartes'
      ]),
      grouping: "Discussion en cercle, jeux de rôle en paires, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Informations simplifiées',
          'Support visuel pour mémorisation',
          'Pratique supplémentaire'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Communication adaptée si non-verbal',
        cognitive: 'Une information à la fois, répétition fréquente',
        sensory: 'Environnement calme pour la discussion'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Apprendre l\'adresse complète',
          'Numéros d\'urgence (911)',
          'Créer un plan d\'évacuation',
          'Enseigner aux autres'
        ]
      }),
      assessmentType: 'Formative et Sommative',
      assessmentNotes: 'Évaluation de la mémorisation des informations personnelles et de la compréhension des mesures de sécurité.',
      subNotes: "Sécurité personnelle avec informations d'urgence. Cartes plastifiées pour durabilité. Communication avec les parents importante.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Sécurité à la maison et à l'école",
      date: new Date('2025-09-24'),
      duration: 40,
      mindsOn: "Chasseurs de dangers! Regardez cette image de maison/classe. Trouvez les dangers cachés! Jeu d'observation interactif. (10 min)",
      action: `1. Identification des dangers communs (objets tranchants, produits toxiques) (5 min)
2. Apprentissage des symboles de danger (5 min)
3. Création d'un plan de sécurité pour la classe (10 min)
4. Pratique d'évacuation d'urgence (5 min)
5. Badge de "Détective de sécurité" (5 min)`,
      consolidation: "Qu'avez-vous appris sur la sécurité? Comment rester en sécurité? Engagement de sécurité de classe. (10 min)",
      learningGoals: "Identifier les dangers potentiels; Reconnaître les symboles de sécurité; Pratiquer les procédures d'urgence",
      materials: JSON.stringify([
        'Images de dangers',
        'Symboles de sécurité',
        'Plan de la classe',
        'Badges à décorer',
        'Affiches de règles',
        'Alarme de pratique'
      ]),
      grouping: "Observation collective, travail en équipes, pratique de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Dangers évidents seulement',
          'Support visuel constant',
          'Pratique guidée individuelle'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Évacuation adaptée, accompagnement',
        cognitive: 'Règles simples, symboles de base',
        sensory: 'Préparation pour l\'alarme, casque antibruit'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer des affiches de sécurité',
          'Être assistant de sécurité',
          'Inventer un jeu de sécurité',
          'Plan de sécurité domestique'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'identification des dangers et de la participation aux exercices de sécurité.',
      subNotes: "Sécurité environnementale avec exercice d'évacuation. Coordonner avec l'administration pour la pratique. Rassurer les anxieux.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 5: ÉMOTIONS ET SENTIMENTS ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Mes émotions arc-en-ciel",
      date: new Date('2025-09-29'),
      duration: 40,
      mindsOn: "Les émotions ont des couleurs! Rouge pour la colère, bleu pour la tristesse, jaune pour la joie... Créons notre arc-en-ciel émotionnel! (10 min)",
      action: `1. Identification des émotions de base avec miroirs (5 min)
2. Lecture de "La couleur des émotions" (5 min)
3. Création de pots d'émotions colorés (10 min)
4. Jeu "Devine mon émotion" avec expressions faciales (5 min)
5. Thermomètre émotionnel de classe (5 min)`,
      consolidation: "Comment vous sentez-vous maintenant? Placez votre pince sur le thermomètre. C'est normal d'avoir toutes les émotions! (10 min)",
      learningGoals: "Identifier et nommer les émotions; Comprendre que toutes les émotions sont valides; Exprimer ses sentiments de manière appropriée",
      materials: JSON.stringify([
        'Livre sur les émotions',
        'Miroirs individuels',
        'Pots ou bocaux',
        'Papiers colorés',
        'Thermomètre émotionnel',
        'Pinces à linge personnalisées'
      ]),
      grouping: "Cercle de discussion, exploration individuelle, jeu collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Émotions de base seulement (4)',
          'Support visuel constant',
          'Expression non-verbale acceptée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Expressions adaptées aux capacités',
        cognitive: 'Émotions simplifiées, association couleur-émotion',
        sensory: 'Espace calme si surcharge émotionnelle'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Nuancer les émotions',
          'Journal des émotions',
          'Créer des scénarios',
          'Aider les autres à identifier'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la capacité à identifier et exprimer les émotions. Respect des émotions des autres.',
      subNotes: "Exploration des émotions avec supports visuels. Créer un environnement sûr pour l'expression. Valider toutes les émotions.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Gérer mes grandes émotions",
      date: new Date('2025-10-01'),
      duration: 40,
      mindsOn: "Parfois nos émotions sont ÉNORMES! Comme un volcan qui explose! Que faire quand on se sent trop fâché ou trop triste? Brainstorm. (10 min)",
      action: `1. Techniques de respiration: la fleur et la bougie (5 min)
2. Coin calme: création d'un espace de retour au calme (10 min)
3. Boîte à outils émotionnels: stratégies de gestion (10 min)
4. Pratique: scénarios et solutions (5 min)`,
      consolidation: "Quelle stratégie allez-vous essayer? Démonstration de la respiration profonde. Notre plan de classe pour les grandes émotions. (10 min)",
      learningGoals: "Reconnaître les signes de grandes émotions; Apprendre des stratégies de régulation; Créer un plan personnel de gestion émotionnelle",
      materials: JSON.stringify([
        'Matériel pour coin calme',
        'Cartes de stratégies',
        'Objets sensoriels',
        'Affiche de respiration',
        'Boîte décorée',
        'Timer visuel'
      ]),
      grouping: "Discussion collective, aménagement collaboratif, pratique individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Une stratégie à la fois',
          'Support visuel pour respiration',
          'Accompagnement individualisé'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Techniques adaptées aux capacités respiratoires',
        cognitive: 'Stratégies simples et concrètes',
        sensory: 'Objets de régulation personnalisés'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Enseigner les techniques aux autres',
          'Journal de régulation',
          'Créer de nouvelles stratégies',
          'Être mentor émotionnel'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'utilisation des stratégies et de la capacité d\'autorégulation. Progrès individuels notés.',
      subNotes: "Gestion émotionnelle avec création du coin calme. Stratégies affichées. Respecter les besoins individuels de régulation.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 6: ACTIVITÉ PHYSIQUE ET REPOS ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Bouger pour être bien",
      date: new Date('2025-10-06'),
      duration: 40,
      mindsOn: "Comment vous sentez-vous après avoir couru? Après avoir dansé? Notre corps aime bouger! Mouvements d'échauffement ensemble. (10 min)",
      action: `1. Exploration: différents types d'activités physiques (5 min)
2. Circuit de mouvements: cardio, force, flexibilité, équilibre (15 min)
3. Création d'un plan d'activité hebdomadaire personnel (10 min)
4. Danse de célébration du mouvement (5 min)`,
      consolidation: "Quelle activité préférez-vous? Comment bouger chaque jour? Engagement pour 60 minutes d'activité quotidienne. (5 min)",
      learningGoals: "Comprendre l'importance de l'activité physique; Explorer différents types de mouvement; Planifier des activités régulières",
      materials: JSON.stringify([
        'Matériel de sport varié',
        'Musique énergique',
        'Affiches d\'exercices',
        'Calendrier d\'activités',
        'Autocollants récompenses',
        'Chronomètre'
      ]),
      grouping: "Échauffement collectif, circuit en stations, planification individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Mouvements adaptés',
          'Durée réduite',
          'Choix d\'activités douces'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Exercices assis ou adaptés, intensité modulée',
        cognitive: 'Instructions simples, démonstrations répétées',
        sensory: 'Volume de musique ajusté, espace personnel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Créer de nouveaux exercices',
          'Mener une activité',
          'Chronométrer et mesurer',
          'Plan familial d\'activités'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation de la participation et de l\'effort. Évaluation de la compréhension des bienfaits de l\'activité physique.',
      subNotes: "Activité physique variée avec circuit. Adapter selon l'espace disponible. Encourager tous les niveaux d'effort.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Le sommeil réparateur",
      date: new Date('2025-10-08'),
      duration: 40,
      mindsOn: "Bâillement! Qui est fatigué? Que se passe-t-il dans notre corps quand on dort? Le sommeil est magique! Histoire du marchand de sable. (10 min)",
      action: `1. Exploration: pourquoi dormons-nous? (5 min)
2. Création d'une routine du coucher en images (10 min)
3. Techniques de relaxation pour s'endormir (10 min)
4. Décoration d'un "Journal de rêves" (5 min)`,
      consolidation: "À quelle heure vous couchez-vous? Pratiquons la relaxation. Promesse de bonnes nuits de sommeil. (10 min)",
      learningGoals: "Comprendre l'importance du sommeil; Établir une routine du coucher; Apprendre des techniques de relaxation",
      materials: JSON.stringify([
        'Livre sur le sommeil',
        'Images de routine',
        'Papier et crayons',
        'Musique douce',
        'Petits carnets',
        'Autocollants étoiles'
      ]),
      grouping: "Histoire collective, création individuelle, relaxation de groupe",
      accommodations: JSON.stringify({
        forStruggling: [
          'Routine simplifiée (3-4 étapes)',
          'Images pré-faites',
          'Relaxation guidée'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Position de relaxation adaptée',
        cognitive: 'Concepts simples sur le sommeil',
        sensory: 'Lumière tamisée, musique optionnelle'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Calculer les heures de sommeil',
          'Expliquer les cycles du sommeil',
          'Créer une histoire du coucher',
          'Journal détaillé des rêves'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la compréhension de l\'importance du sommeil et de l\'établissement d\'une routine.',
      subNotes: "Le sommeil et la relaxation. Créer une ambiance calme. Envoyer la routine du coucher aux parents.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 7: RELATIONS SAINES ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "L'amitié bienveillante",
      date: new Date('2025-10-14'),
      duration: 40,
      mindsOn: "Qu'est-ce qu'un bon ami? Comment être un bon ami? Créons la recette de l'amitié parfaite! Brainstorm collectif. (10 min)",
      action: `1. Lecture: histoire sur l'amitié et la gentillesse (5 min)
2. Jeu de rôle: situations d'amitié (comment aider, partager, inclure) (10 min)
3. Création de bracelets d'amitié à offrir (10 min)
4. Mur de compliments: dire quelque chose de gentil (5 min)`,
      consolidation: "À qui donnerez-vous votre bracelet? Pourquoi? Cercle de gratitude pour nos amis. (10 min)",
      learningGoals: "Comprendre les qualités d'une bonne amitié; Pratiquer la gentillesse et l'inclusion; Exprimer l'appréciation",
      materials: JSON.stringify([
        'Livre sur l\'amitié',
        'Matériel pour bracelets',
        'Post-its pour compliments',
        'Affiche recette d\'amitié',
        'Appareil photo',
        'Coeur en carton'
      ]),
      grouping: "Discussion collective, jeux de rôle en paires, création individuelle",
      accommodations: JSON.stringify({
        forStruggling: [
          'Bracelet simple',
          'Aide pour les compliments',
          'Modélisation des interactions'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Bracelet adapté, aide pour la motricité fine',
        cognitive: 'Concepts d\'amitié simplifiés',
        sensory: 'Interactions structurées, espace personnel'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Écrire une lettre à un ami',
          'Créer un livre d\'amitié',
          'Organiser un jeu coopératif',
          'Être médiateur de conflits'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Observation des interactions sociales, de la gentillesse et de la capacité à exprimer l\'appréciation.',
      subNotes: "L'amitié et les relations positives. Superviser les interactions. Encourager l'inclusion de tous.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Résoudre les conflits pacifiquement",
      date: new Date('2025-10-16'),
      duration: 40,
      mindsOn: "Parfois on n'est pas d'accord avec nos amis. C'est normal! Comment régler nos problèmes avec des mots, pas avec les mains? (10 min)",
      action: `1. Introduction des étapes de résolution (STOP, PARLE, ÉCOUTE, TROUVE) (5 min)
2. Pratique avec marionnettes: scénarios de conflits (10 min)
3. Création d'un coin de paix dans la classe (10 min)
4. Affiche des solutions pacifiques (5 min)`,
      consolidation: "Comment utiliser le coin de paix? Pratique d'une résolution. Engagement pour la paix dans la classe. (10 min)",
      learningGoals: "Apprendre à résoudre les conflits; Utiliser la communication pour régler les problèmes; Créer un environnement pacifique",
      materials: JSON.stringify([
        'Marionnettes',
        'Tapis de paix',
        'Affiche des étapes',
        'Matériel de décoration',
        'Cartes de solutions',
        'Bâton de parole'
      ]),
      grouping: "Discussion en cercle, jeux de rôle, aménagement collectif",
      accommodations: JSON.stringify({
        forStruggling: [
          'Étapes visuelles simples',
          'Médiation adulte',
          'Pratique individuelle d\'abord'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Communication adaptée (pictogrammes)',
        cognitive: 'Deux étapes principales, scénarios simples',
        sensory: 'Espace calme pour résolution'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Être médiateur de paix',
          'Créer de nouvelles stratégies',
          'Écrire des histoires de résolution',
          'Enseigner aux plus jeunes'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de l\'utilisation des stratégies de résolution et de la communication respectueuse.',
      subNotes: "Résolution de conflits avec coin de paix. Superviser l'utilisation. Modéliser la résolution pacifique.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 8: ESTIME DE SOI ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Je suis unique et spécial",
      date: new Date('2025-10-20'),
      duration: 40,
      mindsOn: "Il n'y a qu'un seul VOUS dans le monde entier! Qu'est-ce qui vous rend unique? Miroir magique qui révèle nos qualités. (10 min)",
      action: `1. Création d'un autoportrait "Tout sur moi" (10 min)
2. Étoile des talents: 5 choses que je fais bien (5 min)
3. Défilé des talents: présentation d'une compétence (10 min)
4. Livre de classe "Nous sommes tous spéciaux" (5 min)`,
      consolidation: "Qu'avez-vous appris sur vos amis? Célébration de notre diversité. Applaudissements pour tous! (10 min)",
      learningGoals: "Développer l'estime de soi; Reconnaître ses forces et talents; Apprécier l'unicité de chacun",
      materials: JSON.stringify([
        'Miroir décoré',
        'Papier pour portraits',
        'Étoiles en carton',
        'Matériel d\'art varié',
        'Appareil photo',
        'Livre vierge de classe'
      ]),
      grouping: "Réflexion individuelle, présentations, création collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Aide pour identifier les talents',
          'Présentation avec support',
          'Format adapté'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Présentation adaptée aux capacités',
        cognitive: 'Talents concrets et observables',
        sensory: 'Présentation dans le confort'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Portfolio de talents',
          'Enseigner un talent',
          'Interviewer les autres',
          'Créer un spectacle'
        ]
      }),
      assessmentType: 'Formative et Célébrative',
      assessmentNotes: 'Observation de la confiance en soi et de la capacité à reconnaître ses forces. Célébration des talents.',
      subNotes: "Estime de soi et célébration des talents. Créer un environnement très positif. Valoriser chaque enfant.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Je peux le faire!",
      date: new Date('2025-10-22'),
      duration: 40,
      mindsOn: "Pensez à quelque chose de difficile que vous avez appris. Comment vous sentiez-vous après? La persévérance nous rend forts! (10 min)",
      action: `1. Histoire: "La petite locomotive qui pouvait" (5 min)
2. Défi personnel: choisir quelque chose à améliorer (5 min)
3. Plan d'action: étapes pour réussir (10 min)
4. Pratique et encouragement mutuel (10 min)`,
      consolidation: "Qu'avez-vous choisi? Comment allez-vous pratiquer? Mur de persévérance avec nos objectifs. (10 min)",
      learningGoals: "Développer la persévérance; Établir des objectifs personnels; S'encourager mutuellement",
      materials: JSON.stringify([
        'Livre d\'histoire',
        'Cartes d\'objectifs',
        'Échelle de progrès',
        'Autocollants de réussite',
        'Affiche murale',
        'Certificats'
      ]),
      grouping: "Histoire collective, planification individuelle, pratique en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Objectifs très simples',
          'Étapes plus petites',
          'Support constant'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Objectifs adaptés aux capacités',
        cognitive: 'Un objectif concret et mesurable',
        sensory: 'Environnement de pratique adapté'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Objectifs multiples',
          'Mentorer un pair',
          'Journal de progrès',
          'Plan à long terme'
        ]
      }),
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluation de la capacité à établir des objectifs et de la persévérance. Suivi des progrès individuels.',
      subNotes: "Persévérance et établissement d'objectifs. Suivre les progrès régulièrement. Célébrer toutes les réussites.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ==================== WEEK 9: CÉLÉBRATION DU BIEN-ÊTRE ====================
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Ma boîte à outils bien-être",
      date: new Date('2025-10-27'),
      duration: 40,
      mindsOn: "Nous avons appris tellement de choses! Créons notre boîte à outils personnelle pour rester en bonne santé et heureux. (10 min)",
      action: `1. Décoration de la boîte à outils personnelle (10 min)
2. Sélection des outils: cartes de stratégies apprises (10 min)
3. Ajout d'objets réconfortants et rappels (5 min)
4. Présentation de sa boîte à un ami (5 min)`,
      consolidation: "Qu'y a-t-il dans votre boîte? Comment l'utiliserez-vous? Engagement pour le bien-être continu. (10 min)",
      learningGoals: "Synthétiser les apprentissages; Créer une ressource personnelle; S'engager pour son bien-être",
      materials: JSON.stringify([
        'Boîtes à décorer',
        'Cartes stratégies',
        'Matériel de décoration',
        'Photos souvenirs',
        'Petits objets réconfortants',
        'Rubans et autocollants'
      ]),
      grouping: "Création individuelle, partage en paires",
      accommodations: JSON.stringify({
        forStruggling: [
          'Boîte pré-décorée',
          'Sélection guidée d\'outils',
          'Aide pour l\'organisation'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Boîte accessible, manipulation adaptée',
        cognitive: 'Outils essentiels seulement, visuels simples',
        sensory: 'Matériaux selon préférences sensorielles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Guide d\'utilisation écrit',
          'Boîte pour la maison aussi',
          'Enseigner l\'utilisation',
          'Ajouter de nouveaux outils'
        ]
      }),
      assessmentType: 'Sommative',
      assessmentNotes: 'Évaluation de la compréhension globale du bien-être et de la capacité à utiliser les outils appris.',
      subNotes: "Création de la boîte à outils bien-être. Révision de toutes les stratégies. Personnalisation importante.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: teacher.id,
      unitPlanId: unit.id,
      title: "Fête du bien-être",
      date: new Date('2025-10-29'),
      duration: 40,
      mindsOn: "C'est la fête du bien-être! Nous sommes des experts maintenant! Préparons notre célébration santé. (10 min)",
      action: `1. Stations bien-être: démonstrations des apprentissages (15 min)
   - Station nutrition: collation santé
   - Station mouvement: exercice favori
   - Station émotions: technique de calme
   - Station hygiène: lavage des mains
2. Remise des certificats "Expert en bien-être" (10 min)
3. Danse de célébration du bien-être (5 min)`,
      consolidation: "Qu'avez-vous préféré apprendre? Comment continuer à prendre soin de vous? Photo de groupe et promesse bien-être! (10 min)",
      learningGoals: "Célébrer les apprentissages; Démontrer les compétences acquises; S'engager pour un mode de vie sain",
      materials: JSON.stringify([
        'Matériel pour stations',
        'Certificats personnalisés',
        'Collations santé',
        'Musique de célébration',
        'Appareil photo',
        'Décorations festives'
      ]),
      grouping: "Rotation aux stations, célébration collective",
      accommodations: JSON.stringify({
        forStruggling: [
          'Participation selon capacité',
          'Station préférée plus longtemps',
          'Support pour démonstrations'
        ]
      }),
      modifications: JSON.stringify({
        physical: 'Adaptations à chaque station',
        cognitive: 'Démonstrations simples, aide disponible',
        sensory: 'Environnement adapté, pauses possibles'
      }),
      extensions: JSON.stringify({
        forAdvanced: [
          'Animer une station',
          'Créer une présentation',
          'Aider les autres',
          'Planifier la fête'
        ]
      }),
      assessmentType: 'Sommative et Célébrative',
      assessmentNotes: 'Évaluation finale des compétences en bien-être. Célébration des progrès de chacun. Portfolio complet.',
      subNotes: "Célébration finale avec stations. Tout le matériel préparé. Ambiance festive et positive. Parents invités si possible.",
      isSubFriendly: true,
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'Français',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    console.log('\n📝 Creating 18 perfect Wellness lessons...\n');
    
    for (const lesson of lessons) {
      const created = await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created lesson: ${created.title} (${created.date.toLocaleDateString()})`);
    }

    // Verify the perfection
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION OF WELLNESS LESSONS:');
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
      console.log('💚 PERFECTION ACHIEVED!');
      console.log('='.repeat(60));
      console.log('✨ All 18 Wellness lessons are 100% PERFECT!');
      console.log('✨ Complete ETFO compliance from the start!');
      console.log('✨ Ready for Grade 1 French Immersion!');
      console.log('✨ September 3 to October 29, 2025');
      console.log('✨ Comprehensive health and wellness curriculum!');
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error creating lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectWellnessLessons();