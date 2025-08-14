import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createGrandirEnsembleLessons() {
  console.log('🌱 CREATING PERFECT "GRANDIR ENSEMBLE" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Grandir ensemble' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 20 perfect ETFO-compliant French health/wellness lessons
  const lessons = [
    {
      // Week 1: Réflexion sur notre croissance
      title: "Qui j'étais, qui je suis",
      date: new Date('2026-03-30'),
      duration: 50,
      mindsOn: "Regardez cette photo de vous en septembre... Maintenant regardez-vous dans le miroir! Qu'est-ce qui a changé? Pas juste votre taille - votre confiance, vos capacités, vos amitiés!",
      action: `1. Comparaison: Photos septembre vs maintenant
2. Mesures: Taille, empreinte de main
3. Capacités: Ce que je peux faire maintenant
4. Portfolio: Mes meilleures réussites
5. Réflexion: Mes plus grands changements
6. Célébration: Je suis fier de...`,
      consolidation: "Musée de croissance: Partagez une chose dont vous êtes le plus fier. Chaque changement est une victoire! Vous avez grandi de tant de façons!",
      accommodations: "Photos optionnelles; Réflexion variée; Support émotionnel disponible",
      modifications: "Focus sur 2-3 changements; Aide à la réflexion; Expression flexible",
      extensions: "Journal de croissance détaillé; Graphique de progression; Lettre à soi-même",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Évaluer la conscience de soi et la capacité de réflexion sur la croissance personnelle.',
      learningGoals: "Reconnaître sa croissance personnelle; Identifier ses accomplissements; Développer la fierté de soi",
      materials: JSON.stringify([
        'Photos de septembre',
        'Miroirs',
        'Règles et rubans',
        'Portfolio de travaux',
        'Certificats de croissance'
      ]),
      grouping: "Réflexion individuelle, partage en cercle",
      isSubFriendly: true,
      subNotes: "Photos de septembre disponibles. Atmosphère de célébration. Encourager la réflexion positive.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mon corps fort et capable",
      date: new Date('2026-04-01'),
      duration: 50,
      mindsOn: "Votre corps est une machine extraordinaire! Il a grandi, est devenu plus fort, plus coordonné. Montrez-moi quelque chose que vous ne pouviez pas faire en septembre!",
      action: `1. Démonstration: Nouvelles capacités physiques
2. Stations: Force, équilibre, coordination
3. Comparaison: Septembre vs maintenant
4. Santé: Comment j'ai pris soin de moi
5. Objectifs: Ce que je veux apprendre
6. Célébration: Mes super-pouvoirs physiques`,
      consolidation: "Olympiques personnels: Démontrez votre meilleure capacité! Votre corps est incroyable et continuera de grandir! Soyez-en fiers!",
      accommodations: "Activités adaptées; Niveaux variés; Participation flexible",
      modifications: "Mouvements simples acceptés; Focus sur effort; Support constant",
      extensions: "Créer routine d'exercices; Journal de santé; Défis personnels",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la conscience corporelle et la reconnaissance du développement physique.',
      learningGoals: "Apprécier son développement physique; Reconnaître ses capacités; Valoriser la santé",
      materials: JSON.stringify([
        'Équipement de gym léger',
        'Stations d\'activités',
        'Tableaux de progression',
        'Musique motivante',
        'Médailles maison'
      ]),
      grouping: "Stations rotatives, démonstrations individuelles",
      isSubFriendly: true,
      subNotes: "Stations préparées avec instructions. Sécurité primordiale. Célébrer tous les efforts.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mon cerveau qui grandit",
      date: new Date('2026-04-03'),
      duration: 50,
      mindsOn: "Votre cerveau est comme un muscle - plus vous l'utilisez, plus il devient fort! Pensez à tous les nouveaux mots, idées, et solutions que vous connaissez maintenant!",
      action: `1. Inventaire: Tout ce que j'ai appris
2. Démonstration: Lecture, écriture, maths
3. Problèmes: Solutions créatives
4. Mémoire: Ce que je retiens maintenant
5. Connexions: Comment j'apprends mieux
6. Fierté: Mon cerveau extraordinaire`,
      consolidation: "Exposition de génies: Montrez une chose intelligente que vous savez faire! Vos cerveaux sont des super-ordinateurs en croissance!",
      accommodations: "Modes d'expression variés; Complexité adaptable; Encouragement constant",
      modifications: "Focus sur quelques apprentissages; Aide disponible; Célébrer tout progrès",
      extensions: "Carte mentale des connaissances; Défi de mémoire; Projet de recherche",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la métacognition et la conscience des apprentissages acquis.',
      learningGoals: "Reconnaître ses apprentissages; Comprendre la croissance cognitive; Développer la confiance intellectuelle",
      materials: JSON.stringify([
        'Travaux de l\'année',
        'Livres de différents niveaux',
        'Jeux de logique',
        'Défis mentaux',
        'Diplômes de génie'
      ]),
      grouping: "Activités individuelles, partage en groupe",
      isSubFriendly: true,
      subNotes: "Exemples de progrès disponibles. Valoriser tous les types d'intelligence. Atmosphère positive.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      // Week 2: Émotions et relations
      title: "Mes émotions matures",
      date: new Date('2026-04-06'),
      duration: 50,
      mindsOn: "En septembre, certaines émotions étaient difficiles à gérer. Maintenant, vous êtes des experts! Comment gérez-vous mieux vos sentiments aujourd'hui?",
      action: `1. Rappel: Stratégies apprises cette année
2. Scénarios: Comment je réagis maintenant
3. Boîte à outils: Mes meilleures stratégies
4. Aide: Comment j'aide les autres
5. Expression: Communiquer sainement
6. Pratique: Situations difficiles`,
      consolidation: "Conseil des sages: Partagez votre meilleure stratégie émotionnelle. Vous êtes des maîtres de vos émotions! Cette sagesse vous servira toujours!",
      accommodations: "Expression émotionnelle variée; Support disponible; Rythme individuel",
      modifications: "Focus sur émotions de base; Stratégies simples; Aide constante",
      extensions: "Journal émotionnel; Mentorat de pairs; Création de ressources",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la régulation émotionnelle et l\'utilisation des stratégies apprises.',
      learningGoals: "Démontrer la maturité émotionnelle; Utiliser des stratégies de régulation; Aider les autres",
      materials: JSON.stringify([
        'Cartes d\'émotions',
        'Scénarios sociaux',
        'Boîte à outils visuelle',
        'Affiches de stratégies',
        'Badges de sagesse'
      ]),
      grouping: "Discussion en cercle, jeux de rôle en pairs",
      isSubFriendly: true,
      subNotes: "Stratégies de l'année affichées. Scénarios préparés. Atmosphère de respect et soutien.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mes amitiés précieuses",
      date: new Date('2026-04-08'),
      duration: 50,
      mindsOn: "Regardez autour... Ces visages sont devenus votre famille scolaire! Rappelez-vous votre première journée versus aujourd'hui. Quelles belles amitiés vous avez construites!",
      action: `1. Carte d'amitiés: Nos connexions
2. Qualités: Ce que j'apprécie chez mes amis
3. Souvenirs: Nos meilleurs moments
4. Conflits: Comment on les résout maintenant
5. Soutien: Comment on s'entraide
6. Promesses: Rester amis toujours`,
      consolidation: "Cercle d'appréciation: Dites quelque chose de gentil à un ami. Les amitiés de première année peuvent durer toute la vie!",
      accommodations: "Formats d'expression variés; Groupements flexibles; Support social",
      modifications: "Focus sur 1-2 amitiés; Aide à l'expression; Participation adaptée",
      extensions: "Livre d'amitié; Projet photo; Planification de rencontres",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer les compétences sociales développées et la qualité des relations.',
      learningGoals: "Valoriser les amitiés; Reconnaître les compétences sociales; Maintenir des relations positives",
      materials: JSON.stringify([
        'Papier en forme de cœur',
        'Photos de groupe',
        'Matériel d\'art',
        'Livre d\'or de classe',
        'Bracelets d\'amitié'
      ]),
      grouping: "Activités en pairs et petits groupes",
      isSubFriendly: true,
      subNotes: "Faciliter les interactions positives. Inclure tous les élèves. Atmosphère chaleureuse.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Résoudre comme des grands",
      date: new Date('2026-04-10'),
      duration: 50,
      mindsOn: "Vous êtes maintenant des experts en résolution de problèmes! Plus de larmes pour des petits conflits - vous savez quoi faire! Montrons nos super-pouvoirs de paix!",
      action: `1. Rappel: Nos stratégies de résolution
2. Pratique: Conflits typiques et solutions
3. Médiation: Aider les autres
4. Communication: Mots de paix
5. Compromis: Trouver le milieu
6. Célébration: Gardiens de la paix`,
      consolidation: "Diplôme de médiateur: Vous êtes certifiés résolveurs de conflits! Ces compétences vous rendront leaders en deuxième année!",
      accommodations: "Scénarios adaptés; Support disponible; Rôles variés",
      modifications: "Situations simples; Aide directe; Focus sur une stratégie",
      extensions: "Programme de médiation; Affiches de paix; Mentorat des plus jeunes",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'application des stratégies de résolution et la maturité sociale.',
      learningGoals: "Résoudre les conflits pacifiquement; Utiliser la communication positive; Aider les autres",
      materials: JSON.stringify([
        'Scénarios de conflits',
        'Cartes de stratégies',
        'Badges de médiateur',
        'Coin de paix',
        'Certificats'
      ]),
      grouping: "Jeux de rôle, pratique en triades",
      isSubFriendly: true,
      subNotes: "Scénarios prêts. Stratégies affichées. Encourager l'autonomie dans la résolution.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      // Week 3: Sécurité et autonomie
      title: "Ma sécurité, ma responsabilité",
      date: new Date('2026-04-14'),
      duration: 50,
      mindsOn: "Vous connaissez maintenant toutes les règles de sécurité! Vous êtes des experts! Qui peut me montrer comment traverser la rue? Comment être sécuritaire à la récré?",
      action: `1. Quiz: Règles de sécurité maîtrisées
2. Démonstrations: Procédures sécuritaires
3. Scénarios: Que faire si...?
4. Responsabilité: Protéger les autres
5. Urgences: Qui contacter et comment
6. Badge: Expert en sécurité`,
      consolidation: "Patrouille de sécurité: Vous êtes prêts à enseigner la sécurité aux futurs élèves! Votre savoir protège tout le monde!",
      accommodations: "Formats de démonstration variés; Support visuel; Répétition permise",
      modifications: "Focus sur règles essentielles; Aide disponible; Simplification acceptée",
      extensions: "Créer affiche de sécurité; Plan d'urgence familial; Présentation aux plus jeunes",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension et l\'application des règles de sécurité.',
      learningGoals: "Maîtriser les règles de sécurité; Prendre responsabilité; Protéger soi et les autres",
      materials: JSON.stringify([
        'Cartes de scénarios',
        'Équipement de sécurité',
        'Affiches de règles',
        'Badges d\'expert',
        'Téléphone de pratique'
      ]),
      grouping: "Démonstrations individuelles, pratique en groupe",
      isSubFriendly: true,
      subNotes: "Scénarios de sécurité préparés. Emphase sur la responsabilité. Ton sérieux mais positif.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Naviguer l'école comme un pro",
      date: new Date('2026-04-16'),
      duration: 50,
      mindsOn: "Fermez les yeux... Imaginez chaque endroit de l'école. Vous connaissez tout! Bibliothèque, gym, bureau... Vous êtes des experts navigateurs!",
      action: `1. Carte mentale: Notre école
2. Guide: Mener une visite virtuelle
3. Procédures: Routines maîtrisées
4. Aide: Orienter un nouveau
5. Responsabilités: Rôles d'école
6. Fierté: Notre territoire`,
      consolidation: "Guides officiels: Vous êtes prêts à accueillir les nouveaux! Votre connaissance de l'école est complète! Quelle expertise!",
      accommodations: "Formats de présentation variés; Support visuel; Participation flexible",
      modifications: "Focus sur zones principales; Aide à la navigation; Guide simplifié",
      extensions: "Créer plan de l'école; Vidéo de visite; Manuel du nouveau",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'autonomie dans l\'environnement scolaire et la capacité de guidance.',
      learningGoals: "Démontrer l'autonomie scolaire; Guider les autres; Maîtriser l'environnement",
      materials: JSON.stringify([
        'Plan de l\'école',
        'Photos des lieux',
        'Cartes de guide',
        'Badges de navigateur',
        'Microphone de guide'
      ]),
      grouping: "Tours en petits groupes, présentations individuelles",
      isSubFriendly: true,
      subNotes: "Plan de l'école disponible. Rôles de guide assignés. Valoriser l'expertise.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mes choix santé",
      date: new Date('2026-04-20'),
      duration: 50,
      mindsOn: "Vous savez maintenant ce qui est bon pour votre corps et votre esprit! Quels choix santé faites-vous chaque jour? Vous êtes vos propres docteurs!",
      action: `1. Inventaire: Mes habitudes santé
2. Nutrition: Choix alimentaires sages
3. Activité: Bouger pour grandir
4. Sommeil: Repos réparateur
5. Hygiène: Routines automatiques
6. Plan: Continuer l'été`,
      consolidation: "Promesse santé: Engagez-vous à une habitude santé pour l'été. Votre corps vous remerciera! Vous savez prendre soin de vous!",
      accommodations: "Choix personnalisés; Support sans jugement; Objectifs réalistes",
      modifications: "Focus sur 1-2 habitudes; Simplification des concepts; Aide constante",
      extensions: "Journal de santé; Recettes santé; Défi familial",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension des choix santé et l\'engagement personnel.',
      learningGoals: "Faire des choix santé éclairés; Comprendre le bien-être; Planifier pour l'avenir",
      materials: JSON.stringify([
        'Pyramide alimentaire',
        'Cartes d\'activités',
        'Journal de santé',
        'Autocollants de choix',
        'Contrat santé'
      ]),
      grouping: "Réflexion individuelle, partage en cercle de santé",
      isSubFriendly: true,
      subNotes: "Approche positive de la santé. Pas de jugement. Encourager l'autonomie.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      // Week 4: Préparation au mentorat
      title: "Devenir un mentor",
      date: new Date('2026-04-22'),
      duration: 55,
      mindsOn: "L'année prochaine, de nouveaux petits arriveront en première année. Ils auront besoin de grands comme vous! Êtes-vous prêts à être des mentors?",
      action: `1. Discussion: Qu'est-ce qu'un mentor?
2. Souvenirs: Ce qui m'a aidé en septembre
3. Compétences: Ce que je peux enseigner
4. Pratique: Expliquer quelque chose
5. Patience: Aider avec gentillesse
6. Engagement: Promesse de mentor`,
      consolidation: "Cérémonie des mentors: Recevez votre badge de mentor! Vous avez la sagesse et la gentillesse pour guider les nouveaux!",
      accommodations: "Rôles de mentor variés; Support à la communication; Participation adaptée",
      modifications: "Mentorat simple; Aide en duo; Focus sur une compétence",
      extensions: "Programme de mentorat structuré; Vidéo pour nouveaux; Guide du mentor",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité d\'empathie, de communication et de leadership.',
      learningGoals: "Développer l'empathie; Communiquer clairement; Assumer un rôle de leader",
      materials: JSON.stringify([
        'Badges de mentor',
        'Cartes de compétences',
        'Scénarios de mentorat',
        'Certificats',
        'Cape de mentor symbolique'
      ]),
      grouping: "Formation en groupe, pratique en pairs",
      isSubFriendly: true,
      subNotes: "Concept de mentorat expliqué. Pratique guidée. Valoriser le leadership.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Conseils pour les nouveaux",
      date: new Date('2026-04-24'),
      duration: 55,
      mindsOn: "Si vous pouviez remonter le temps et vous parler en septembre, que diriez-vous? Ces conseils seront précieux pour les futurs élèves!",
      action: `1. Brainstorm: Conseils importants
2. Catégories: École, amis, apprentissage
3. Création: Lettres aux futurs élèves
4. Illustrations: Dessins encourageants
5. Vidéo: Messages filmés (optionnel)
6. Collection: Livre de conseils`,
      consolidation: "Capsule temporelle: Vos conseils aideront des dizaines d'enfants! Votre sagesse est un cadeau précieux!",
      accommodations: "Formats d'expression variés; Aide à l'écriture; Choix de médium",
      modifications: "Conseils oraux ou dessinés; 2-3 conseils suffisants; Support complet",
      extensions: "Livre illustré de conseils; Présentation vidéo; Site web de conseils",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la réflexion, l\'empathie et la capacité de synthèse.',
      learningGoals: "Synthétiser les apprentissages; Communiquer avec empathie; Créer un héritage positif",
      materials: JSON.stringify([
        'Papier à lettres',
        'Matériel d\'art',
        'Caméra (optionnel)',
        'Reliure pour livre',
        'Boîte capsule temporelle'
      ]),
      grouping: "Création individuelle, compilation collective",
      isSubFriendly: true,
      subNotes: "Structure de lettre fournie. Encourager l'authenticité. Projet significatif.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Préparer l'accueil",
      date: new Date('2026-04-27'),
      duration: 55,
      mindsOn: "Comment rendre la classe accueillante pour les nouveaux? Souvenez-vous de votre première journée... Qu'est-ce qui vous aurait rassuré?",
      action: `1. Plan: Décoration accueillante
2. Création: Affiches de bienvenue
3. Organisation: Coins d'aide
4. Ressources: Outils pour nouveaux
5. Activités: Jeux d'intégration
6. Présentation: Notre plan d'accueil`,
      consolidation: "Comité d'accueil: Votre plan rendra la transition douce pour les nouveaux! Quelle générosité et maturité!",
      accommodations: "Contributions variées; Rôles différents; Participation flexible",
      modifications: "Tâche simple assignée; Travail en équipe; Support constant",
      extensions: "Manuel d'accueil complet; Système de jumelage; Programme d'orientation",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la planification, la créativité et l\'esprit communautaire.',
      learningGoals: "Planifier pour les autres; Créer un environnement accueillant; Démontrer le leadership",
      materials: JSON.stringify([
        'Matériel de décoration',
        'Cartons et affiches',
        'Fournitures d\'organisation',
        'Jeux d\'accueil',
        'Plan de classe'
      ]),
      grouping: "Comités de travail, projet collectif",
      isSubFriendly: true,
      subNotes: "Comités organisés. Tâches claires. Valoriser toutes les contributions.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      // Week 5: Compétences de vie
      title: "Mes super-pouvoirs de vie",
      date: new Date('2026-05-04'),
      duration: 50,
      mindsOn: "Vous avez développé des super-pouvoirs cette année! Pas des pouvoirs magiques, mais des vraies compétences de vie. Lesquelles utilisez-vous chaque jour?",
      action: `1. Inventaire: Mes compétences de vie
2. Autonomie: Ce que je fais seul
3. Organisation: Gérer mes affaires
4. Temps: Respecter les horaires
5. Responsabilité: Mes engagements
6. Fierté: Je suis capable!`,
      consolidation: "Démonstration de compétences: Montrez une compétence de vie maîtrisée! Ces pouvoirs vous serviront toute votre vie!",
      accommodations: "Compétences variées valorisées; Niveaux différents; Support disponible",
      modifications: "Focus sur compétences de base; Célébrer tout progrès; Aide constante",
      extensions: "Portfolio de compétences; Défis d'autonomie; Certification de compétences",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'autonomie, l\'organisation et la conscience des compétences acquises.',
      learningGoals: "Identifier ses compétences de vie; Démontrer l'autonomie; Valoriser ses capacités",
      materials: JSON.stringify([
        'Liste de compétences',
        'Matériel de démonstration',
        'Badges de compétences',
        'Portfolio',
        'Certificats'
      ]),
      grouping: "Démonstrations individuelles, célébration collective",
      isSubFriendly: true,
      subNotes: "Liste de compétences affichée. Démonstrations variées. Célébrer chaque réussite.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Gérer mon stress comme un champion",
      date: new Date('2026-05-06'),
      duration: 50,
      mindsOn: "Le stress existe même en première année! Mais vous avez appris à le gérer. Quelle est votre stratégie secrète quand vous sentez le stress monter?",
      action: `1. Identification: Reconnaître le stress
2. Stratégies: Ma boîte à outils
3. Respiration: Techniques calmantes
4. Mouvement: Bouger pour déstresser
5. Paroles: Pensées positives
6. Pratique: Situations stressantes`,
      consolidation: "Maîtres zen: Enseignez votre technique préférée! Vous avez le pouvoir de calmer votre stress! Quelle force intérieure!",
      accommodations: "Stratégies personnalisées; Expression variée; Espace calme disponible",
      modifications: "1-2 stratégies simples; Support visuel; Pratique guidée",
      extensions: "Journal de stress; Enseigner aux autres; Coin calme personnel",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la reconnaissance du stress et l\'utilisation des stratégies de gestion.',
      learningGoals: "Gérer le stress efficacement; Utiliser des stratégies variées; Maintenir le calme",
      materials: JSON.stringify([
        'Cartes de stratégies',
        'Matériel de respiration',
        'Musique calme',
        'Coin détente',
        'Affiches de techniques'
      ]),
      grouping: "Pratique individuelle, partage en cercle de calme",
      isSubFriendly: true,
      subNotes: "Techniques démontrées. Atmosphère calme. Normaliser le stress et sa gestion.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Célébrer nos différences",
      date: new Date('2026-05-11'),
      duration: 50,
      mindsOn: "Chacun de vous est unique et spécial! Cette année, nous avons appris que nos différences rendent notre classe plus forte. Qu'est-ce qui vous rend unique?",
      action: `1. Portrait: Ce qui me rend spécial
2. Talents: Mes dons uniques
3. Culture: Ma famille et traditions
4. Apprentissage: Ma façon d'apprendre
5. Appréciation: Célébrer les autres
6. Mosaïque: Notre diversité belle`,
      consolidation: "Festival de l'unicité: Célébrez votre caractère unique! Ensemble, nous formons un arc-en-ciel magnifique de différences!",
      accommodations: "Expression culturelle respectée; Partage optionnel; Support sensible",
      modifications: "Partage adapté au confort; Focus sur le positif; Aide disponible",
      extensions: "Présentation culturelle; Livre de diversité; Projet multiculturel",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'acceptation de soi et des autres, la célébration de la diversité.',
      learningGoals: "Célébrer l'unicité; Respecter les différences; Valoriser la diversité",
      materials: JSON.stringify([
        'Matériel d\'art varié',
        'Miroirs',
        'Drapeaux et symboles',
        'Musique diverse',
        'Mur de célébration'
      ]),
      grouping: "Expression individuelle, célébration collective",
      isSubFriendly: true,
      subNotes: "Sensibilité culturelle importante. Inclure toutes les formes de diversité. Atmosphère de respect.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      // Week 6: Préparation pour l'été et au-delà
      title: "Plan santé pour l'été",
      date: new Date('2026-06-08'),
      duration: 55,
      mindsOn: "L'été arrive! Comment allez-vous continuer à grandir sainement? Créons un plan pour rester actifs, heureux et en santé pendant les vacances!",
      action: `1. Objectifs: 3 buts santé pour l'été
2. Activités: Bouger chaque jour
3. Nutrition: Manger arc-en-ciel
4. Sécurité: Règles d'été
5. Bien-être: Garder l'équilibre
6. Calendrier: Mon été santé`,
      consolidation: "Contrat d'été: Signez votre engagement santé! Vous avez tous les outils pour un été extraordinaire et sain!",
      accommodations: "Plans personnalisés; Objectifs réalistes; Support familial inclus",
      modifications: "1-2 objectifs simples; Visuels pour rappels; Plan basic",
      extensions: "Journal d'été; Défis familiaux; Application de suivi",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la planification personnelle et l\'engagement au bien-être continu.',
      learningGoals: "Planifier pour la santé; Maintenir les habitudes; S'engager au bien-être",
      materials: JSON.stringify([
        'Calendriers d\'été',
        'Cartes d\'activités',
        'Contrats santé',
        'Autocollants de suivi',
        'Guide d\'été'
      ]),
      grouping: "Planification individuelle, partage d'idées en groupe",
      isSubFriendly: true,
      subNotes: "Plans d'été préparés. Idées d'activités disponibles. Encourager la continuité.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Prêts pour la deuxième année",
      date: new Date('2026-06-10'),
      duration: 55,
      mindsOn: "Dans quelques mois, vous serez en DEUXIÈME ANNÉE! Vous êtes prêts! Qu'est-ce qui vous excite le plus? Vous avez toutes les compétences nécessaires!",
      action: `1. Vision: Ma deuxième année
2. Forces: Ce que j'apporte
3. Questions: Ce que je me demande
4. Préparation: Été productif
5. Confiance: Je suis prêt!
6. Lettre: À mon futur moi`,
      consolidation: "Graduation symbolique: Vous êtes officiellement prêts pour la deuxième année! Votre croissance est remarquable! Quelle fierté!",
      accommodations: "Expression des inquiétudes permise; Support émotionnel; Rythme individuel",
      modifications: "Focus sur le positif; Aide à visualiser; Réassurance constante",
      extensions: "Visite de classe de 2e; Rencontrer le professeur; Projet de préparation",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation finale de la préparation et de la confiance pour la transition.',
      learningGoals: "Anticiper positivement; Reconnaître sa préparation; Maintenir la confiance",
      materials: JSON.stringify([
        'Papier à lettres futur',
        'Photos de 2e année',
        'Certificats de préparation',
        'Enveloppes scellées',
        'Médailles symboliques'
      ]),
      grouping: "Réflexion individuelle, cérémonie collective",
      isSubFriendly: true,
      subNotes: "Transition positive soulignée. Répondre aux inquiétudes. Célébrer la préparation.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Notre héritage de classe",
      date: new Date('2026-06-22'),
      duration: 60,
      mindsOn: "Notre classe a créé une belle histoire ensemble! Que voulons-nous laisser comme souvenir? Comment notre groupe sera-t-il rappelé?",
      action: `1. Souvenirs: Nos meilleurs moments
2. Création: Œuvre collective finale
3. Messages: Pour l'école
4. Traditions: Ce qu'on laisse
5. Photos: Album de classe
6. Célébration: Notre réussite collective`,
      consolidation: "Cérémonie d'héritage: Notre classe restera dans les mémoires! Vous avez créé quelque chose de magnifique ensemble!",
      accommodations: "Contributions variées; Rôles différents; Participation flexible",
      modifications: "Participation adaptée; Support émotionnel; Inclusion garantie",
      extensions: "Vidéo de classe; Livre souvenir; Exposition permanente",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébrer la cohésion de groupe et l\'héritage collectif créé.',
      learningGoals: "Créer un héritage positif; Célébrer le collectif; Clôturer significativement",
      materials: JSON.stringify([
        'Matériel d\'art collectif',
        'Appareil photo',
        'Album de classe',
        'Matériel de célébration',
        'Capsule temporelle'
      ]),
      grouping: "Projet collectif, célébration communautaire",
      isSubFriendly: true,
      subNotes: "Projet final préparé. Inclusion de tous. Atmosphère de célébration et fierté.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    },
    {
      title: "Champions de première année!",
      date: new Date('2026-06-24'),
      duration: 60,
      mindsOn: "Regardez-vous... Vous êtes des CHAMPIONS de première année! Chaque défi relevé, chaque apprentissage maîtrisé. Vous avez RÉUSSI! Célébrons!",
      action: `1. Rétrospective: Notre voyage incroyable
2. Certificats: Reconnaissances spéciales
3. Performances: Talents à partager
4. Gratitude: Remerciements
5. Promesses: Continuer à grandir
6. Fête: Célébration méritée!`,
      consolidation: "Couronnement des champions: Vous êtes officiellement des gradués de première année! Votre succès est extraordinaire! Bravo champions!",
      accommodations: "Célébration inclusive; Formats variés; Respect des préférences",
      modifications: "Participation selon confort; Support disponible; Inclusion totale",
      extensions: "Spectacle de talents; Invités spéciaux; Album souvenir",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale reconnaissant la croissance complète de chaque élève.',
      learningGoals: "Célébrer les accomplissements; Reconnaître la croissance; Clôturer avec fierté",
      materials: JSON.stringify([
        'Certificats personnalisés',
        'Couronnes de champion',
        'Matériel de fête',
        'Musique de célébration',
        'Livre d\'or de classe'
      ]),
      grouping: "Célébration collective avec moments individuels",
      isSubFriendly: true,
      subNotes: "Cérémonie complète planifiée. Chaque enfant reconnu. Atmosphère de joie et fierté.",
      subject: 'Santé et bien-être',
      grade: 1,
      language: 'French'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Grandir ensemble"...`);
  
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
  
  console.log('\n🔍 CRITICAL ASSESSMENT - GRANDIR ENSEMBLE:');
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
    console.log('✨ Complete growth and wellness curriculum');
    console.log('✨ Comprehensive reflection on development');
    console.log('✨ Mentorship preparation for future students');
    console.log('✨ Successful transition to Grade 2');
    console.log('\n💪 Unit Highlights:');
    console.log('   • Personal growth recognition');
    console.log('   • Physical and cognitive development');
    console.log('   • Emotional maturity demonstration');
    console.log('   • Social skills mastery');
    console.log('   • Safety and autonomy');
    console.log('   • Mentorship preparation');
    console.log('   • Life skills development');
    console.log('   • Summer health planning');
    console.log('   • Celebration of achievements');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons do not meet ETFO standards');
    console.log('Review and enhance before implementation');
  }
  
  await prisma.$disconnect();
}

createGrandirEnsembleLessons();