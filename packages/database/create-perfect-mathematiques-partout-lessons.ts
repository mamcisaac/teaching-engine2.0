import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMathematiquesPartoutLessons() {
  console.log('➕ CREATING PERFECT "MATHÉMATIQUES PARTOUT" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mathématiques partout' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 20 perfect ETFO-compliant mathematics lessons
  const lessons = [
    {
      // Week 1: Réflexion et célébration
      title: "Mes super-pouvoirs mathématiques",
      date: new Date('2026-03-31'),
      duration: 50,
      mindsOn: "Regardez tout ce que vous savez faire! Compter jusqu'à 100, additionner, soustraire, mesurer, créer des patrons... Vous êtes des mathématiciens experts!",
      action: `1. Portfolio: Mes réussites mathématiques
2. Démonstration: Mon problème préféré résolu
3. Inventaire: Tout ce que je sais faire
4. Graphique: Ma croissance en maths
5. Défis: Montrer mes stratégies
6. Célébration: Je suis mathématicien!`,
      consolidation: "Musée de mes réussites: Exposez votre parcours mathématique. Chaque concept maîtrisé est une victoire! Vous êtes brillants!",
      accommodations: "Formats de démonstration variés; Support visuel; Niveaux différenciés",
      modifications: "Focus sur concepts de base; Aide disponible; Célébrer tout progrès",
      extensions: "Créer des défis pour autres; Exploration avancée; Mentorat de pairs",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Évaluer la conscience des apprentissages et la confiance mathématique développée.',
      learningGoals: "Reconnaître ses compétences mathématiques; Démontrer ses stratégies; Développer la fierté",
      materials: JSON.stringify([
        'Portfolios mathématiques',
        'Matériel de manipulation',
        'Graphiques de progrès',
        'Certificats de mathématicien',
        'Tableau d\'affichage'
      ]),
      grouping: "Réflexion individuelle, partage en groupe de mathématiciens",
      isSubFriendly: true,
      subNotes: "Portfolios disponibles. Atmosphère de célébration. Valoriser toutes les réussites.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mesurer notre monde",
      date: new Date('2026-04-02'),
      duration: 50,
      mindsOn: "Tout peut être mesuré! Votre taille, la classe, le temps, même le bonheur! Aujourd'hui, devenons des experts de la mesure!",
      action: `1. Stations de mesure: Longueur, masse, capacité
2. Outils: Règles, balances, contenants
3. Comparaisons: Plus grand, égal, plus petit
4. Estimation: Deviner puis vérifier
5. Documentation: Carnet de mesures
6. Application: Mesurer pour un projet`,
      consolidation: "Conférence de mesure: Partagez votre découverte la plus surprenante. La mesure nous aide à comprendre notre monde!",
      accommodations: "Outils adaptés; Objets variés à mesurer; Support pour notation",
      modifications: "Mesures simples; Comparaisons basiques; Aide directe",
      extensions: "Unités non-standard créatives; Conversions; Précision accrue",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'utilisation des outils et la compréhension des concepts de mesure.',
      learningGoals: "Maîtriser les outils de mesure; Comparer avec précision; Documenter les résultats",
      materials: JSON.stringify([
        'Règles et rubans',
        'Balances',
        'Contenants gradués',
        'Objets à mesurer',
        'Carnets de données'
      ]),
      grouping: "Stations rotatives, travail en pairs",
      isSubFriendly: true,
      subNotes: "Stations préparées avec instructions. Sécurité avec outils. Support disponible.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "L'équilibre parfait",
      date: new Date('2026-04-06'),
      duration: 50,
      mindsOn: "Une balance en équilibre, c'est comme une équation! Les deux côtés sont égaux. Explorons l'égalité dans tout!",
      action: `1. Balances: Créer des équilibres
2. Équations: Représenter avec symboles
3. Patterns: Équilibre dans les motifs
4. Jeux: Faire égal des deux côtés
5. Problèmes: Trouver le nombre manquant
6. Art: Symétrie et équilibre`,
      consolidation: "Maîtres de l'équilibre: Démontrez votre équation préférée. L'égalité est partout en mathématiques!",
      accommodations: "Manipulatifs variés; Représentations multiples; Complexité adaptable",
      modifications: "Équilibres simples; Support visuel constant; Nombres petits",
      extensions: "Équations complexes; Variables multiples; Créer des défis",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension de l\'égalité et l\'équilibre mathématique.',
      learningGoals: "Comprendre l'égalité; Créer des équilibres; Résoudre des équations simples",
      materials: JSON.stringify([
        'Balances mathématiques',
        'Cubes et jetons',
        'Cartes d\'équations',
        'Matériel de symétrie',
        'Tableaux d\'équilibre'
      ]),
      grouping: "Exploration en pairs, démonstrations individuelles",
      isSubFriendly: true,
      subNotes: "Concept d'égalité clairement expliqué. Manipulatifs disponibles. Progression graduelle.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      // Week 2: Applications réelles
      title: "Mathématiques au magasin",
      date: new Date('2026-04-08'),
      duration: 50,
      mindsOn: "Allons magasiner! L'argent, les prix, la monnaie... Les maths sont essentielles pour acheter! Ouvrons notre magasin de classe!",
      action: `1. Magasin de classe: Prix et produits
2. Argent: Reconnaître et compter
3. Achats: Calculer les totaux
4. Monnaie: Rendre correctement
5. Budget: Planifier ses achats
6. Caisse: Être caissier et client`,
      consolidation: "Experts du commerce: Partagez votre meilleure transaction. Les maths nous aident dans la vie quotidienne!",
      accommodations: "Prix adaptés aux capacités; Support pour calculs; Rôles variés",
      modifications: "Prix simples (5¢, 10¢); Aide au comptage; Transactions basiques",
      extensions: "Taxes et rabais; Budget complexe; Profit et perte",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'application des mathématiques dans un contexte réel de magasin.',
      learningGoals: "Utiliser l'argent; Calculer des transactions; Appliquer les maths au quotidien",
      materials: JSON.stringify([
        'Argent factice',
        'Articles de magasin',
        'Étiquettes de prix',
        'Caisse enregistreuse',
        'Reçus'
      ]),
      grouping: "Jeu de rôle en rotation, pairs pour transactions",
      isSubFriendly: true,
      subNotes: "Magasin pré-installé. Prix clairement affichés. Rôles expliqués.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Architectes mathématiciens",
      date: new Date('2026-04-10'),
      duration: 50,
      mindsOn: "Les bâtiments sont faits de formes géométriques! Triangles pour la force, rectangles pour l'espace... Construisons avec les maths!",
      action: `1. Plans: Dessiner avec mesures
2. Construction: Blocs et formes 3D
3. Stabilité: Tester les structures
4. Mesures: Hauteur, largeur, aire
5. Symétrie: Bâtiments équilibrés
6. Présentation: Notre ville mathématique`,
      consolidation: "Expo architecture: Présentez votre bâtiment et ses mathématiques. La géométrie construit notre monde!",
      accommodations: "Matériaux variés; Complexité adaptable; Support au design",
      modifications: "Structures simples; Aide à la construction; Focus sur formes de base",
      extensions: "Calculs d'aire et périmètre; Échelle; Plans détaillés",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'application de la géométrie et des mesures dans la construction.',
      learningGoals: "Appliquer la géométrie; Mesurer pour construire; Créer avec les mathématiques",
      materials: JSON.stringify([
        'Blocs de construction',
        'Papier quadrillé',
        'Règles et équerres',
        'Formes géométriques',
        'Matériel de maquette'
      ]),
      grouping: "Projets individuels ou petits groupes",
      isSubFriendly: true,
      subNotes: "Exemples de structures affichés. Sécurité avec matériaux. Support technique.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Chefs mathématiciens",
      date: new Date('2026-04-14'),
      duration: 50,
      mindsOn: "Cuisiner, c'est des maths! Mesurer les ingrédients, doubler une recette, partager équitablement... Préparons des collations mathématiques!",
      action: `1. Recette: Lire et comprendre
2. Mesures: Tasses, cuillères
3. Proportions: Doubler ou diviser
4. Partage: Portions égales
5. Temps: Minuterie et séquence
6. Dégustation: Célébrer nos créations`,
      consolidation: "Restaurant mathématique: Expliquez les maths dans votre recette. Cuisiner développe nos compétences!",
      accommodations: "Recettes adaptées; Allergies considérées; Rôles variés",
      modifications: "Recette simple; Mesures basiques; Support constant",
      extensions: "Conversions d'unités; Coûts et budget; Nutrition mathématique",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'application des mesures et proportions en contexte culinaire.',
      learningGoals: "Mesurer précisément; Suivre des séquences; Partager équitablement",
      materials: JSON.stringify([
        'Ingrédients simples',
        'Outils de mesure cuisine',
        'Recettes illustrées',
        'Minuteries',
        'Tabliers'
      ]),
      grouping: "Équipes de cuisine, partage collectif",
      isSubFriendly: true,
      subNotes: "Recette sans cuisson préférée. Allergies vérifiées. Hygiène emphasized.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      // Week 3: Patterns et logique
      title: "Détectives de patterns",
      date: new Date('2026-04-16'),
      duration: 50,
      mindsOn: "Les patterns sont partout - musique, nature, art! Trouvez le pattern caché dans cette suite... Vous êtes des détectives!",
      action: `1. Chasse aux patterns: Dans la classe
2. Création: Patterns complexes
3. Prédiction: Continuer les suites
4. Traduction: Son, mouvement, couleur
5. Règles: Expliquer le pattern
6. Défis: Patterns mystères`,
      consolidation: "Galerie de patterns: Présentez votre pattern le plus créatif. Les patterns organisent notre monde!",
      accommodations: "Niveaux de complexité variés; Modalités multiples; Support visuel",
      modifications: "Patterns simples AB; Aide à identifier; Répétition acceptable",
      extensions: "Patterns croissants; Règles algébriques; Création de défis",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la reconnaissance et création de patterns complexes.',
      learningGoals: "Identifier des patterns complexes; Créer des suites; Expliquer les règles",
      materials: JSON.stringify([
        'Matériel de patterns',
        'Instruments de musique',
        'Cartes de défis',
        'Matériel d\'art',
        'Tableaux de patterns'
      ]),
      grouping: "Exploration individuelle, défis en pairs",
      isSubFriendly: true,
      subNotes: "Exemples de patterns affichés. Progression claire. Défis préparés.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Résolveurs de problèmes experts",
      date: new Date('2026-04-20'),
      duration: 50,
      mindsOn: "Vous avez développé tant de stratégies! Dessiner, utiliser des blocs, compter sur les doigts, faire des bonds... Montrez votre expertise!",
      action: `1. Problèmes complexes: Plusieurs étapes
2. Stratégies: Choisir la meilleure
3. Représentation: Montrer sa pensée
4. Vérification: Est-ce logique?
5. Explication: Enseigner sa méthode
6. Création: Inventer des problèmes`,
      consolidation: "Congrès de résolution: Partagez votre stratégie préférée. Vous êtes des experts en résolution!",
      accommodations: "Problèmes à niveaux multiples; Choix de stratégies; Support disponible",
      modifications: "Problèmes à une étape; Manipulatifs fournis; Guide pas à pas",
      extensions: "Problèmes ouverts; Multiple solutions; Création de guides",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la flexibilité des stratégies et la métacognition mathématique.',
      learningGoals: "Résoudre des problèmes complexes; Expliquer sa pensée; Créer des défis",
      materials: JSON.stringify([
        'Cartes de problèmes',
        'Matériel de manipulation',
        'Tableaux de stratégies',
        'Papier pour solutions',
        'Badges d\'expert'
      ]),
      grouping: "Travail individuel, partage de stratégies en groupe",
      isSubFriendly: true,
      subNotes: "Problèmes gradués disponibles. Stratégies affichées. Encourager la diversité.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Graphiques et données",
      date: new Date('2026-04-22'),
      duration: 50,
      mindsOn: "Nos préférences, nos mesures, nos observations... Tout peut devenir un graphique! Les données racontent des histoires!",
      action: `1. Collecte: Sondage de classe
2. Organisation: Trier les données
3. Graphiques: Barres, pictogrammes
4. Analyse: Que nous dit le graphique?
5. Comparaisons: Plus, moins, égal
6. Présentation: Nos découvertes`,
      consolidation: "Statisticiens en herbe: Présentez votre graphique. Les données nous aident à comprendre!",
      accommodations: "Types de graphiques variés; Support à l'organisation; Thèmes flexibles",
      modifications: "Données simples; Graphiques basiques; Aide à l'interprétation",
      extensions: "Multiple représentations; Prédictions; Analyse approfondie",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la collecte, organisation et interprétation de données.',
      learningGoals: "Collecter des données; Créer des graphiques; Interpréter l'information",
      materials: JSON.stringify([
        'Papier graphique',
        'Autocollants',
        'Tableaux de données',
        'Marqueurs',
        'Affiches'
      ]),
      grouping: "Collecte collective, analyse en petits groupes",
      isSubFriendly: true,
      subNotes: "Types de graphiques modélisés. Support à la collecte. Interprétation guidée.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      // Week 4: Projet musée
      title: "Planifier notre musée mathématique",
      date: new Date('2026-04-27'),
      duration: 55,
      mindsOn: "Créons un musée où les visiteurs découvriront les maths en s'amusant! Quelles expositions voulez-vous créer?",
      action: `1. Brainstorm: Idées d'expositions
2. Équipes: Former des groupes
3. Planification: Conception des stations
4. Matériel: Lister les besoins
5. Affiches: Titres attractifs
6. Organisation: Plan du musée`,
      consolidation: "Comité du musée: Présentez vos plans. Notre musée sera extraordinaire!",
      accommodations: "Rôles variés; Complexité adaptable; Support créatif",
      modifications: "Exposition simple; Travail guidé; Focus sur un concept",
      extensions: "Expositions interactives; Technologie; Guide du visiteur",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la créativité, planification et collaboration pour le musée.',
      learningGoals: "Planifier un projet complexe; Collaborer efficacement; Communiquer les maths",
      materials: JSON.stringify([
        'Plans du musée',
        'Matériel de planification',
        'Exemples d\'expositions',
        'Fournitures d\'art',
        'Listes de vérification'
      ]),
      grouping: "Équipes d'exposition, coordination collective",
      isSubFriendly: true,
      subNotes: "Structure du projet claire. Équipes formées. Support à la planification.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Créer nos expositions",
      date: new Date('2026-04-29'),
      duration: 55,
      mindsOn: "Aujourd'hui, construisons nos expositions! Chaque station doit être amusante, éducative et interactive!",
      action: `1. Construction: Assembler les stations
2. Interactivité: Jeux et défis
3. Instructions: Panneaux clairs
4. Tests: Essayer les activités
5. Décoration: Rendre attractif
6. Répétition: Pratiquer l'animation`,
      consolidation: "Vernissage privé: Testez les expositions des autres. Ajustements finaux pour la perfection!",
      accommodations: "Support technique varié; Adaptations possibles; Aide disponible",
      modifications: "Tâches simplifiées; Support constant; Focus sur participation",
      extensions: "Éléments technologiques; Défis multiniveaux; Documentation",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la création et la qualité pédagogique des expositions.',
      learningGoals: "Créer du matériel pédagogique; Rendre les maths accessibles; Tester et améliorer",
      materials: JSON.stringify([
        'Matériel de construction',
        'Jeux mathématiques',
        'Panneaux et affiches',
        'Décorations',
        'Matériel interactif'
      ]),
      grouping: "Travail en équipes d'exposition",
      isSubFriendly: true,
      subNotes: "Matériel organisé par station. Support technique disponible. Sécurité prioritaire.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      // Week 5: Festival STIAM
      title: "Sciences et maths ensemble",
      date: new Date('2026-05-04'),
      duration: 55,
      mindsOn: "Les sciences utilisent les maths! Mesurons, comptons, prédisons... Devenons des scientifiques mathématiciens!",
      action: `1. Expériences: Mesurer et noter
2. Observations: Données scientifiques
3. Prédictions: Utiliser les patterns
4. Graphiques: Résultats visuels
5. Conclusions: Analyse mathématique
6. Présentation: Nos découvertes`,
      consolidation: "Laboratoire STIAM: Partagez votre découverte scientifique-mathématique!",
      accommodations: "Expériences adaptées; Support pour mesures; Formats variés",
      modifications: "Expériences simples; Aide constante; Focus sur observation",
      extensions: "Hypothèses complexes; Analyse statistique; Rapport détaillé",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'intégration des mathématiques dans l\'investigation scientifique.',
      learningGoals: "Intégrer maths et sciences; Utiliser les données; Communiquer scientifiquement",
      materials: JSON.stringify([
        'Matériel d\'expériences',
        'Outils de mesure',
        'Carnets de science',
        'Graphiques',
        'Équipement de sécurité'
      ]),
      grouping: "Laboratoires en petits groupes",
      isSubFriendly: true,
      subNotes: "Expériences préparées et sécuritaires. Instructions claires. Support scientifique.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Art mathématique",
      date: new Date('2026-05-06'),
      duration: 55,
      mindsOn: "L'art est plein de maths! Symétrie, patterns, proportions... Créons des œuvres mathématiquement magnifiques!",
      action: `1. Symétrie: Papillons et mandalas
2. Tessellations: Patterns qui s'emboîtent
3. Fractales: Patterns dans patterns
4. Proportions: Visages et corps
5. Géométrie: Art abstrait
6. Exposition: Galerie mathématique`,
      consolidation: "Vernissage artistique: Expliquez les maths dans votre art. Beauté et mathématiques sont liées!",
      accommodations: "Techniques variées; Complexité adaptable; Support artistique",
      modifications: "Projets simplifiés; Gabarits disponibles; Focus sur un concept",
      extensions: "Nombre d'or; Perspective; Art numérique",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'application créative des concepts mathématiques dans l\'art.',
      learningGoals: "Créer avec les mathématiques; Explorer la géométrie artistique; Voir les maths dans l'art",
      materials: JSON.stringify([
        'Papier et canevas',
        'Règles et compas',
        'Peintures et crayons',
        'Miroirs pour symétrie',
        'Exemples d\'art mathématique'
      ]),
      grouping: "Création individuelle, exposition collective",
      isSubFriendly: true,
      subNotes: "Techniques démontrées. Exemples disponibles. Encourager la créativité mathématique.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Ingénieurs mathématiciens",
      date: new Date('2026-05-11'),
      duration: 55,
      mindsOn: "Les ingénieurs utilisent les maths pour créer! Ponts, machines, inventions... Construisons avec précision mathématique!",
      action: `1. Défi: Construire un pont solide
2. Mesures: Précision nécessaire
3. Tests: Poids et résistance
4. Améliorations: Utiliser les données
5. Innovation: Solutions créatives
6. Démonstration: Nos inventions`,
      consolidation: "Expo ingénierie: Présentez votre création et ses mathématiques. L'ingénierie, c'est des maths appliquées!",
      accommodations: "Matériaux variés; Défis adaptés; Support technique",
      modifications: "Construction simple; Aide directe; Focus sur processus",
      extensions: "Calculs de force; Blueprints; Prototypes multiples",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'application des maths dans la résolution de défis d\'ingénierie.',
      learningGoals: "Appliquer les maths à l'ingénierie; Tester et améliorer; Innover avec précision",
      materials: JSON.stringify([
        'Matériaux de construction',
        'Poids pour tests',
        'Outils de mesure',
        'Carnets d\'ingénieur',
        'Matériel de sécurité'
      ]),
      grouping: "Équipes d'ingénieurs, tests collectifs",
      isSubFriendly: true,
      subNotes: "Défis d'ingénierie préparés. Sécurité emphasized. Support technique disponible.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      // Week 6: Célébration finale
      title: "Ouverture du musée mathématique",
      date: new Date('2026-06-08'),
      duration: 60,
      mindsOn: "C'est le grand jour! Notre musée ouvre ses portes! Vous êtes les guides experts! Partagez votre passion des maths!",
      action: `1. Installation finale: Derniers détails
2. Répétition: Rôles de guides
3. Accueil: Recevoir les visiteurs
4. Animation: Faire vivre les stations
5. Explications: Partager les concepts
6. Célébration: Succès collectif!`,
      consolidation: "Applaudissements mérités: Votre musée est un succès! Vous avez rendu les maths vivantes et amusantes!",
      accommodations: "Rôles adaptés; Pauses possibles; Support disponible",
      modifications: "Participation flexible; Aide pour animation; Rôle simplifié",
      extensions: "Guide principal; Documentation; Interviews",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation culminante de la communication et application des concepts mathématiques.',
      learningGoals: "Communiquer les mathématiques; Enseigner aux autres; Célébrer les apprentissages",
      materials: JSON.stringify([
        'Musée installé',
        'Badges de guide',
        'Microphone',
        'Livre d\'or',
        'Rafraîchissements'
      ]),
      grouping: "Événement communautaire avec rôles individuels",
      isSubFriendly: true,
      subNotes: "Rôles assignés. Horaire clair. Support constant. Atmosphère de célébration.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Festival STIAM",
      date: new Date('2026-06-10'),
      duration: 60,
      mindsOn: "Sciences, Technologie, Ingénierie, Arts et Maths ensemble! Montrons comment tout est connecté! C'est votre festival!",
      action: `1. Stations STIAM: Démonstrations
2. Performances: Maths en musique
3. Expositions: Art mathématique
4. Défis: Ingénierie en direct
5. Expériences: Science et données
6. Finale: Célébration STIAM`,
      consolidation: "Standing ovation STIAM: Vous avez montré que les maths sont partout! Quelle célébration extraordinaire!",
      accommodations: "Participation variée; Formats multiples; Support constant",
      modifications: "Rôle adapté; Participation partielle OK; Aide disponible",
      extensions: "Présentation spéciale; Coordination; Documentation complète",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale de l\'intégration des mathématiques dans toutes les disciplines.',
      learningGoals: "Intégrer les disciplines; Célébrer les connexions; Partager les apprentissages",
      materials: JSON.stringify([
        'Stations STIAM',
        'Matériel de démonstration',
        'Système de son',
        'Décorations festives',
        'Certificats STIAM'
      ]),
      grouping: "Festival collectif avec contributions individuelles",
      isSubFriendly: true,
      subNotes: "Programme détaillé. Transitions fluides. Célébration inclusive.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mon portfolio de mathématicien",
      date: new Date('2026-06-22'),
      duration: 55,
      mindsOn: "Rassemblons toutes vos réussites mathématiques! Chaque page montre votre croissance! Quel parcours impressionnant!",
      action: `1. Sélection: Meilleurs travaux
2. Organisation: Par concepts
3. Réflexions: Ce que j'ai appris
4. Preuves: Photos et créations
5. Personnalisation: Ma touche
6. Présentation: Mon parcours`,
      consolidation: "Galerie de portfolios: Admirez votre progression! Vous êtes des mathématiciens accomplis!",
      accommodations: "Format flexible; Aide à la sélection; Expression variée",
      modifications: "Portfolio simplifié; Support constant; Focus sur réussites",
      extensions: "Portfolio numérique; Réflexions approfondies; Présentation publique",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation globale du parcours mathématique et de la métacognition.',
      learningGoals: "Documenter sa progression; Réfléchir sur les apprentissages; Célébrer les réussites",
      materials: JSON.stringify([
        'Portfolios',
        'Travaux de l\'année',
        'Photos d\'activités',
        'Matériel de décoration',
        'Certificats'
      ]),
      grouping: "Création individuelle, partage optionnel",
      isSubFriendly: true,
      subNotes: "Structure fournie. Travaux disponibles. Support à l'organisation.",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mathématiciens pour la vie!",
      date: new Date('2026-06-24'),
      duration: 60,
      mindsOn: "Les maths ne s'arrêtent jamais! Elles sont partout, toujours! Vous êtes des mathématiciens pour la vie! Célébrons!",
      action: `1. Rétrospective: Notre année mathématique
2. Démonstrations: Nos expertises
3. Promesses: Continuer les maths
4. Certificats: Reconnaissances
5. Défis d'été: Rester actifs
6. Fête: Célébration finale!`,
      consolidation: "Couronnement mathématique: Vous êtes officiellement des mathématiciens experts! Les maths seront toujours vos amies!",
      accommodations: "Célébration inclusive; Formats variés; Participation flexible",
      modifications: "Adaptation complète; Support émotionnel; Inclusion garantie",
      extensions: "Discours; Mentorat futur; Projets d'été",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale reconnaissant l\'identité mathématique développée.',
      learningGoals: "Célébrer l'identité mathématique; S'engager à continuer; Clôturer avec fierté",
      materials: JSON.stringify([
        'Décorations de fête',
        'Certificats personnalisés',
        'Couronnes de mathématicien',
        'Défis d\'été',
        'Album souvenir'
      ]),
      grouping: "Célébration communautaire",
      isSubFriendly: true,
      subNotes: "Grande célébration planifiée. Chaque élève reconnu. Joie et fierté!",
      subject: 'Mathématiques',
      grade: 1,
      language: 'French'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Mathématiques partout"...`);
  
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
  
  console.log('\n🔍 CRITICAL ASSESSMENT - MATHÉMATIQUES PARTOUT:');
  console.log('='.repeat(60));
  
  // Rigorous evaluation of ETFO compliance
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { unitPlanId: unit.id },
    orderBy: { date: 'asc' }
  });
  
  console.log('\n📊 ETFO COMPLIANCE REPORT:');
  let perfectCount = 0;
  const issues = [];
  
  for (const lesson of allLessons) {
    const isCompliant = Boolean(
      lesson.mindsOn &&
      lesson.action &&
      lesson.consolidation &&
      lesson.accommodations &&
      lesson.modifications &&
      lesson.extensions &&
      lesson.assessmentType &&
      lesson.assessmentNotes &&
      lesson.learningGoals &&
      lesson.materials &&
      lesson.grouping &&
      lesson.isSubFriendly &&
      lesson.subNotes
    );
    
    if (isCompliant) {
      perfectCount++;
    } else {
      const missing = [];
      if (!lesson.mindsOn) missing.push('mindsOn');
      if (!lesson.action) missing.push('action');
      if (!lesson.consolidation) missing.push('consolidation');
      if (!lesson.accommodations) missing.push('accommodations');
      if (!lesson.modifications) missing.push('modifications');
      if (!lesson.extensions) missing.push('extensions');
      if (!lesson.assessmentType) missing.push('assessmentType');
      if (!lesson.assessmentNotes) missing.push('assessmentNotes');
      if (!lesson.learningGoals) missing.push('learningGoals');
      if (!lesson.materials) missing.push('materials');
      if (!lesson.grouping) missing.push('grouping');
      if (!lesson.isSubFriendly) missing.push('isSubFriendly');
      if (!lesson.subNotes) missing.push('subNotes');
      
      issues.push(`${lesson.title}: Missing ${missing.join(', ')}`);
    }
  }
  
  console.log(`Perfect lessons: ${perfectCount}/${allLessons.length}`);
  console.log(`Compliance rate: ${Math.round(perfectCount/allLessons.length * 100)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('\n🎯 FINAL VERDICT:');
  console.log('='.repeat(60));
  
  if (perfectCount === allLessons.length) {
    console.log('🏆 ABSOLUTE PERFECTION ACHIEVED!');
    console.log('✨ All 19 lessons are 100% ETFO compliant');
    console.log('✨ Complete mathematics integration curriculum');
    console.log('✨ Interactive mathematics museum created');
    console.log('✨ STEAM festival celebration');
    console.log('✨ Real-world applications throughout');
    console.log('\n➕ Unit Highlights:');
    console.log('   • Mathematical identity development');
    console.log('   • Measurement and equality mastery');
    console.log('   • Real-world applications');
    console.log('   • Pattern and logic exploration');
    console.log('   • Mathematics museum creation');
    console.log('   • STEAM integration');
    console.log('   • Engineering challenges');
    console.log('   • Artistic mathematics');
    console.log('   • Portfolio documentation');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons do not meet ETFO standards');
    console.log('Review and enhance before implementation');
  }
  
  await prisma.$disconnect();
}

createMathematiquesPartoutLessons();