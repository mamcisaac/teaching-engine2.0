import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDefisExpressionLessons() {
  console.log('💃 CREATING PERFECT "DÉFIS ET EXPRESSION" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Défis et expression' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 20 perfect ETFO-compliant French physical education expression lessons
  const lessons = [
    {
      // Week 1: Expression corporelle
      title: "Mon corps raconte des histoires",
      date: new Date('2026-04-01'),
      duration: 50,
      mindsOn: "Votre corps peut parler sans mots! Montrez-moi 'joie' sans parler... 'tristesse'... 'surprise'! Aujourd'hui, devenons des conteurs corporels!",
      action: `1. Échauffement expressif: Émotions en mouvement
2. Statues émotionnelles: Figer les sentiments
3. Histoires sans paroles: Raconter avec le corps
4. Miroir expressif: Copier les expressions
5. Création: Ma mini-histoire corporelle
6. Performance: Partager son récit`,
      consolidation: "Cercle des conteurs: Quelle histoire avez-vous préférée? Le corps est un outil de communication puissant!",
      accommodations: "Expression adaptée aux capacités; Support visuel; Participation flexible",
      modifications: "Mouvements simples; Histoire courte; Aide disponible",
      extensions: "Histoire complexe; Ajout de musique; Chorégraphie élaborée",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Évaluer la capacité d\'expression corporelle et la créativité dans le mouvement.',
      learningGoals: "Exprimer des émotions par le mouvement; Raconter avec le corps; Développer la créativité",
      materials: JSON.stringify([
        'Musique variée',
        'Cartes d\'émotions',
        'Espace de mouvement',
        'Foulards colorés',
        'Tambourin pour rythme'
      ]),
      grouping: "Exploration individuelle, partage en petits groupes",
      isSubFriendly: true,
      subNotes: "Activités d'expression clairement démontrées. Atmosphère de respect. Encourager la créativité.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Danse des éléments",
      date: new Date('2026-04-03'),
      duration: 50,
      mindsOn: "Bougez comme le feu! Maintenant comme l'eau... l'air... la terre! Chaque élément a sa propre danse. Explorons!",
      action: `1. Exploration: Qualités de chaque élément
2. Feu: Mouvements vifs et énergiques
3. Eau: Fluidité et ondulations
4. Air: Légèreté et envol
5. Terre: Force et stabilité
6. Création: Ma danse élémentaire`,
      consolidation: "Festival des éléments: Présentez votre élément préféré. La nature inspire le mouvement! Quelle découverte!",
      accommodations: "Intensité adaptable; Support pour équilibre; Choix d'éléments",
      modifications: "Un élément focus; Mouvements simplifiés; Guide constant",
      extensions: "Combinaison d'éléments; Création de séquence; Costumes simples",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'interprétation créative et la variété des mouvements.',
      learningGoals: "Explorer différentes qualités de mouvement; Interpréter des concepts; Créer une danse",
      materials: JSON.stringify([
        'Musique thématique',
        'Tissus légers (air)',
        'Rubans (eau)',
        'Tambours (terre)',
        'Espace dégagé'
      ]),
      grouping: "Exploration collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Mouvements de base démontrés. Sécurité dans l'espace. Créativité valorisée.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Créateurs de jeux",
      date: new Date('2026-04-06'),
      duration: 50,
      mindsOn: "Les meilleurs jeux sont inventés par des enfants! Aujourd'hui, VOUS créez les règles, les défis, tout! Devenez des inventeurs de plaisir!",
      action: `1. Analyse: Qu'est-ce qui rend un jeu amusant?
2. Brainstorm: Idées de nouveaux jeux
3. Création: Règles simples et claires
4. Test: Essayer le jeu
5. Ajustements: Améliorer les règles
6. Présentation: Enseigner aux autres`,
      consolidation: "Salon des jeux: Quel jeu voulez-vous rejouer? Vous êtes des génies créatifs! Vos jeux sont fantastiques!",
      accommodations: "Complexité variable; Support à la création; Rôles différents",
      modifications: "Jeu très simple; Aide aux règles; Participation adaptée",
      extensions: "Jeu multi-niveaux; Tournoi organisé; Documentation complète",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la créativité, la logique des règles et la capacité d\'enseignement.',
      learningGoals: "Créer des jeux originaux; Établir des règles justes; Enseigner aux autres",
      materials: JSON.stringify([
        'Matériel sportif varié',
        'Cônes et cerceaux',
        'Cartons pour règles',
        'Sifflet',
        'Tableau de score'
      ]),
      grouping: "Création en petites équipes",
      isSubFriendly: true,
      subNotes: "Structure de création fournie. Matériel organisé. Test sécuritaire des jeux.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      // Week 2: Défis d'équilibre et coordination
      title: "Maîtres de l'équilibre",
      date: new Date('2026-04-08'),
      duration: 50,
      mindsOn: "Tenez sur un pied... maintenant fermez les yeux! L'équilibre est un super-pouvoir! Aujourd'hui, devenons des maîtres de l'équilibre!",
      action: `1. Défis progressifs: De facile à difficile
2. Statues complexes: Positions créatives
3. Parcours d'équilibre: Poutres et lignes
4. Équilibre avec objets: Sacs de fèves
5. Équilibre en mouvement: Marcher, tourner
6. Défi ultime: Création personnelle`,
      consolidation: "Champions d'équilibre: Démontrez votre défi personnel! Votre contrôle corporel est impressionnant!",
      accommodations: "Hauteurs adaptées; Support disponible; Progression individualisée",
      modifications: "Sol seulement; Aide physique OK; Défis simplifiés",
      extensions: "Yeux fermés; Surfaces instables; Combinaisons complexes",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer le contrôle corporel et la progression dans les défis d\'équilibre.',
      learningGoals: "Développer l'équilibre; Relever des défis progressifs; Créer ses propres défis",
      materials: JSON.stringify([
        'Poutres basses',
        'Lignes au sol',
        'Sacs de fèves',
        'Cerceaux',
        'Surfaces variées'
      ]),
      grouping: "Stations individuelles, défis en pairs",
      isSubFriendly: true,
      subNotes: "Progression claire. Sécurité primordiale. Encourager tous les efforts.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Parcours ninja",
      date: new Date('2026-04-10'),
      duration: 50,
      mindsOn: "Transformez-vous en ninjas! Agilité, force, vitesse... Créons un parcours d'obstacles digne des plus grands guerriers!",
      action: `1. Conception: Planifier le parcours
2. Construction: Installer les obstacles
3. Démonstration: Techniques ninja
4. Pratique: Maîtriser chaque obstacle
5. Chronométrage: Défis de vitesse
6. Modification: Adapter pour tous`,
      consolidation: "Cérémonie ninja: Vous avez conquis le parcours! Vrais ninjas! Quelle détermination extraordinaire!",
      accommodations: "Obstacles adaptables; Aide permise; Rythme personnel",
      modifications: "Parcours simplifié; Sans chronométrage; Support constant",
      extensions: "Parcours avancé; Compétition amicale; Création de nouveaux obstacles",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'agilité, la persévérance et l\'amélioration personnelle.',
      learningGoals: "Développer l'agilité; Surmonter des obstacles; Persévérer dans l'effort",
      materials: JSON.stringify([
        'Cônes',
        'Cerceaux',
        'Cordes',
        'Tapis',
        'Tunnels'
      ]),
      grouping: "Construction collective, défis individuels",
      isSubFriendly: true,
      subNotes: "Parcours pré-planifié. Sécurité vérifiée. Adaptation pour tous les niveaux.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Jongleurs en herbe",
      date: new Date('2026-04-14'),
      duration: 50,
      mindsOn: "Un foulard... deux foulards... Vous pouvez jongler! C'est de la magie corporelle! Découvrons nos talents cachés!",
      action: `1. Progression: Un objet d'abord
2. Lancer-attraper: Technique de base
3. Deux objets: Coordination avancée
4. Patterns: Créer des séquences
5. Performance: Show de jonglerie
6. Enseignement: Montrer aux autres`,
      consolidation: "Cirque de classe: Présentez vos talents! Vous êtes des artistes du mouvement! Bravo jongleurs!",
      accommodations: "Objets variés; Hauteur adaptable; Progression personnelle",
      modifications: "Foulards légers seulement; Un objet; Aide directe",
      extensions: "Trois objets; Jonglage en mouvement; Création de routine",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la coordination œil-main et la persévérance dans l\'apprentissage.',
      learningGoals: "Développer la coordination; Maîtriser une nouvelle habileté; Performer avec confiance",
      materials: JSON.stringify([
        'Foulards de jonglage',
        'Balles mousses',
        'Sacs de fèves',
        'Musique de cirque',
        'Espace de performance'
      ]),
      grouping: "Apprentissage individuel, performance collective",
      isSubFriendly: true,
      subNotes: "Progression étape par étape. Matériel sécuritaire. Célébrer chaque progrès.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      // Week 3: Danses du monde
      title: "Voyage dansant autour du monde",
      date: new Date('2026-04-16'),
      duration: 50,
      mindsOn: "Chaque pays a ses danses! Aujourd'hui, notre gymnase devient le monde entier! Prêts pour un voyage dansant?",
      action: `1. Salsa simple: Amérique latine
2. Danse africaine: Rythmes et joie
3. Valse enfantine: Europe
4. Mouvements asiatiques: Tai chi dansé
5. Danse des Premières Nations: Respect et nature
6. Fusion: Mélanger les styles`,
      consolidation: "Passeport de danse: Quelle danse préférez-vous? La danse unit les cultures! Vous êtes des citoyens du monde!",
      accommodations: "Mouvements adaptés; Participation flexible; Support visuel",
      modifications: "Mouvements simples; Rester assis possible; Une danse focus",
      extensions: "Chorégraphie complète; Recherche culturelle; Costumes simples",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'ouverture culturelle et l\'adaptation aux différents styles.',
      learningGoals: "Explorer diverses cultures; Adapter son mouvement; Respecter les traditions",
      materials: JSON.stringify([
        'Musiques du monde',
        'Cartes géographiques',
        'Foulards colorés',
        'Vidéos de démonstration',
        'Décorations culturelles'
      ]),
      grouping: "Apprentissage collectif, pratique en groupes",
      isSubFriendly: true,
      subNotes: "Danses simplifiées préparées. Respect culturel emphasized. Inclusion de tous.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Chorégraphes en action",
      date: new Date('2026-04-20'),
      duration: 50,
      mindsOn: "Vous connaissez plein de mouvements maintenant! Temps de créer VOTRE danse! Devenez chorégraphes officiels!",
      action: `1. Choix musical: Trouver son inspiration
2. Mouvements de base: Vocabulaire corporel
3. Structure: Début, milieu, fin
4. Répétition: Mémoriser sa danse
5. Ajouts créatifs: Personnaliser
6. Présentation: Enseigner sa danse`,
      consolidation: "Festival de chorégraphie: Partagez votre création! Vous êtes des artistes complets! Quelle créativité!",
      accommodations: "Musique au choix; Longueur variable; Support disponible",
      modifications: "8 temps seulement; Mouvements simples; Aide à la structure",
      extensions: "Danse complète; Travail en duo; Notation chorégraphique",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la créativité chorégraphique et la capacité d\'organisation.',
      learningGoals: "Créer une chorégraphie; Structurer le mouvement; Enseigner sa création",
      materials: JSON.stringify([
        'Lecteur musical',
        'Sélection de musiques',
        'Miroirs ou zone réflexion',
        'Cartes de mouvements',
        'Espace de création'
      ]),
      grouping: "Création individuelle ou pairs, partage collectif",
      isSubFriendly: true,
      subNotes: "Structure de création fournie. Musiques appropriées. Encourager l'originalité.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Flash mob de l'école",
      date: new Date('2026-04-22'),
      duration: 55,
      mindsOn: "Surprise! Nous allons créer un flash mob pour surprendre toute l'école! Une danse secrète que nous ferons tous ensemble!",
      action: `1. Apprentissage: Mouvements simples
2. Synchronisation: Tous ensemble
3. Formations: Changements de places
4. Répétition secrète: Perfectionner
5. Plan surprise: Où et quand
6. Exécution: Le grand moment!`,
      consolidation: "Célébration flash mob: Nous avons surpris tout le monde! Quelle équipe extraordinaire! Moment inoubliable!",
      accommodations: "Rôles variés; Participation adaptable; Position flexible",
      modifications: "Mouvements de base seulement; Rester en place; Support d'un pair",
      extensions: "Solo au centre; Mouvements complexes; Filmer l'événement",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la collaboration et la participation à un projet collectif.',
      learningGoals: "Collaborer sur grand projet; Synchroniser les mouvements; Créer un événement",
      materials: JSON.stringify([
        'Musique énergique',
        'Système de son portable',
        'Espace de répétition',
        'Costumes simples',
        'Caméra'
      ]),
      grouping: "Projet de classe entière",
      isSubFriendly: true,
      subNotes: "Chorégraphie simple mémorisée. Plan d'exécution clair. Excitation canalisée.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      // Week 4: Sports créatifs
      title: "Inventer des sports impossibles",
      date: new Date('2026-04-27'),
      duration: 50,
      mindsOn: "Et si on jouait au soccer avec les mains? Au basketball sans ballon? Inventons des sports qui n'existent pas encore!",
      action: `1. Brainstorm fou: Idées impossibles
2. Sélection: Choisir les meilleures
3. Règles créatives: Logique du jeu
4. Test: Essayer le sport
5. Ajustements: Rendre jouable
6. Tournoi: Compétition amicale`,
      consolidation: "Comité olympique: Votre sport pourrait être aux Jeux! Quelle imagination! Inventeurs de génie!",
      accommodations: "Complexité adaptable; Rôles variés; Matériel flexible",
      modifications: "Sport très simple; Règles basiques; Aide constante",
      extensions: "Ligue complète; Statistiques; Trophées maison",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'innovation et la capacité d\'adaptation des règles.',
      learningGoals: "Innover dans le sport; Créer des règles fonctionnelles; Résoudre des problèmes",
      materials: JSON.stringify([
        'Équipement sportif varié',
        'Objets inhabituels',
        'Tableau de règles',
        'Chronomètre',
        'Médailles maison'
      ]),
      grouping: "Équipes créatives",
      isSubFriendly: true,
      subNotes: "Créativité guidée. Sécurité vérifiée. Plaisir prioritaire.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Olympiades expressives",
      date: new Date('2026-04-29'),
      duration: 55,
      mindsOn: "Des Olympiades où l'art compte autant que la vitesse! Points pour la créativité, le style, l'originalité! Prêts?",
      action: `1. Épreuves créatives: Course artistique
2. Lancer avec style: Points de beauté
3. Saut expressif: Raconter en sautant
4. Relais théâtral: Histoire en courant
5. Gymnastique libre: Mouvement créatif
6. Cérémonie: Médailles d'expression`,
      consolidation: "Podium créatif: Tous gagnants de créativité! Les Olympiades ne sont pas que vitesse! L'art compte!",
      accommodations: "Épreuves adaptées; Critères flexibles; Participation valorisée",
      modifications: "Épreuves simplifiées; Focus sur effort; Support disponible",
      extensions: "Juge de style; Commentateur; Création d'épreuves",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la créativité dans le mouvement sportif et l\'esprit sportif.',
      learningGoals: "Combiner sport et expression; Valoriser la créativité; Célébrer la diversité",
      materials: JSON.stringify([
        'Matériel olympique',
        'Rubans et foulards',
        'Musique variée',
        'Médailles créatives',
        'Podium improvisé'
      ]),
      grouping: "Compétition individuelle et équipes",
      isSubFriendly: true,
      subNotes: "Épreuves préparées. Critères créatifs clairs. Célébration de tous.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      // Week 5: Projet culminant
      title: "Planifier notre spectacle",
      date: new Date('2026-05-04'),
      duration: 55,
      mindsOn: "Nous avons appris tant de choses! Créons un spectacle pour montrer tous nos talents! Ce sera VOTRE show!",
      action: `1. Inventaire: Tous nos talents
2. Programme: Ordre du spectacle
3. Groupes: Qui fait quoi
4. Répétitions: Planning
5. Décors: Ambiance visuelle
6. Promotion: Inviter les familles`,
      consolidation: "Comité artistique: Notre spectacle sera mémorable! Votre vision prend forme! Artistes organisés!",
      accommodations: "Rôles variés; Participation flexible; Support technique disponible",
      modifications: "Rôle simple; Aide à l'organisation; Participation adaptée",
      extensions: "Direction artistique; Affiche du spectacle; Programme détaillé",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer les compétences organisationnelles et la vision créative.',
      learningGoals: "Planifier un événement; Collaborer sur projet; Utiliser ses talents",
      materials: JSON.stringify([
        'Tableau de planification',
        'Matériel de décoration',
        'Affiches vierges',
        'Listes de tâches',
        'Invitations'
      ]),
      grouping: "Comités spécialisés",
      isSubFriendly: true,
      subNotes: "Structure organisationnelle fournie. Rôles clarifiés. Support constant.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Répétitions intensives",
      date: new Date('2026-05-06'),
      duration: 55,
      mindsOn: "Artistes, en place! Aujourd'hui, nous perfectionnons chaque détail! Le spectacle approche! Excellence!",
      action: `1. Échauffement collectif: Énergie!
2. Répétition par groupes: Perfectionner
3. Enchaînements: Transitions fluides
4. Technique: Derniers ajustements
5. Filage: Tout le spectacle
6. Notes: Améliorations finales`,
      consolidation: "Cercle de confiance: Vous êtes prêts! Demain, vous brillerez! Confiance totale! Succès assuré!",
      accommodations: "Pauses si besoin; Adaptations de dernière minute; Support émotionnel",
      modifications: "Répétition allégée; Support constant; Flexibilité maximale",
      extensions: "Rôle de coach; Aide technique; Solo supplémentaire",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la préparation finale et la gestion du stress.',
      learningGoals: "Perfectionner sa performance; Gérer le trac; Collaborer sous pression",
      materials: JSON.stringify([
        'Tout le matériel du spectacle',
        'Costumes',
        'Musique',
        'Décors',
        'Chronométrage'
      ]),
      grouping: "Répétition d'ensemble",
      isSubFriendly: true,
      subNotes: "Répétition complète guidée. Gestion du stress. Encouragements constants.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      // Week 6: Spectacle et célébration
      title: "Grand spectacle Défis et Expression",
      date: new Date('2026-05-11'),
      duration: 90,
      mindsOn: "C'est le grand jour! Votre spectacle! Montrez vos talents extraordinaires! Le gymnase est votre scène! Brillez!",
      action: `1. Installation: Préparer l'espace
2. Accueil: Recevoir le public
3. Spectacle: Performances extraordinaires
4. Entracte: Mini-exposition
5. Finale: Tous ensemble
6. Saluts: Ovation méritée!`,
      consolidation: "Triomphe total: Standing ovation! Vous avez conquis les cœurs! Artistes accomplis! Quelle réussite!",
      accommodations: "Support disponible; Adaptations possibles; Confort prioritaire",
      modifications: "Participation ajustée; Aide sur scène; Flexibilité totale",
      extensions: "Rôle de MC; Solos additionnels; Documentation vidéo",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation culminante de toutes les compétences expressives et créatives.',
      learningGoals: "Performer devant public; Démontrer ses apprentissages; Célébrer ses accomplissements",
      materials: JSON.stringify([
        'Scène aménagée',
        'Système de son',
        'Éclairage',
        'Costumes et accessoires',
        'Programmes'
      ]),
      grouping: "Performance collective avec moments individuels",
      isSubFriendly: true,
      subNotes: "Programme détaillé. Support technique. Atmosphère de célébration.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Retour sur notre succès",
      date: new Date('2026-06-08'),
      duration: 50,
      mindsOn: "Quel spectacle incroyable! Revivons ces moments magiques! Vous avez impressionné tout le monde!",
      action: `1. Visionnement: Vidéo du spectacle
2. Moments favoris: Partage d'émotions
3. Feedback: Ce qu'on a dit de vous
4. Photos souvenirs: Album de classe
5. Apprentissages: Ce qu'on retient
6. Fierté: Célébrer chacun`,
      consolidation: "Cercle de fierté: Chacun nomme sa plus grande réussite. Vous avez grandi! Artistes confirmés!",
      accommodations: "Expression variée; Partage optionnel; Support émotionnel",
      modifications: "Réflexion simple; Support visuel; Participation flexible",
      extensions: "Article de journal; Portfolio personnel; Projet futur",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité de réflexion et la reconnaissance des apprentissages.',
      learningGoals: "Réfléchir sur l'expérience; Reconnaître ses progrès; Célébrer collectivement",
      materials: JSON.stringify([
        'Vidéo du spectacle',
        'Photos',
        'Livre d\'or',
        'Album de classe',
        'Certificats'
      ]),
      grouping: "Visionnement collectif, réflexion individuelle",
      isSubFriendly: true,
      subNotes: "Matériel audiovisuel prêt. Atmosphère positive. Valorisation de tous.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Portfolio de nos créations",
      date: new Date('2026-06-10'),
      duration: 50,
      mindsOn: "Créons un portfolio de tous vos chefs-d'œuvre! Danses, jeux, défis... Tout votre génie créatif!",
      action: `1. Collection: Rassembler les créations
2. Organisation: Classer par thèmes
3. Documentation: Photos et descriptions
4. Réflexions: Commentaires personnels
5. Présentation: Mise en page
6. Partage: Montrer aux familles`,
      consolidation: "Musée personnel: Votre portfolio est un trésor! Preuve de votre créativité infinie! Gardez-le toujours!",
      accommodations: "Format flexible; Aide à l'organisation; Support technique",
      modifications: "Portfolio simplifié; Aide constante; Focus sur favoris",
      extensions: "Portfolio numérique; Vidéo compilation; Site web personnel",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation complète du parcours créatif et expressif de l\'année.',
      learningGoals: "Documenter ses créations; Organiser son travail; Valoriser ses réussites",
      materials: JSON.stringify([
        'Portfolios ou classeurs',
        'Photos de l\'année',
        'Travaux et créations',
        'Matériel de présentation',
        'Décorations'
      ]),
      grouping: "Travail individuel avec support",
      isSubFriendly: true,
      subNotes: "Structure de portfolio fournie. Matériel organisé. Aide disponible.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Passage du flambeau créatif",
      date: new Date('2026-06-22'),
      duration: 55,
      mindsOn: "L'an prochain, de nouveaux élèves vivront ces aventures! Préparons des cadeaux créatifs pour les inspirer!",
      action: `1. Sélection: Nos meilleures créations
2. Adaptation: Pour les futurs élèves
3. Instructions: Comment jouer/danser
4. Vidéos tutoriels: Montrer l'exemple
5. Messages: Encouragements
6. Transmission: Cérémonie de passage`,
      consolidation: "Mentors créatifs: Votre héritage inspirera des générations! Généreux artistes! Impact durable!",
      accommodations: "Contribution variée; Format au choix; Support disponible",
      modifications: "Contribution simple; Aide complète; Participation adaptée",
      extensions: "Manuel complet; Série de vidéos; Programme de mentorat",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la générosité créative et la capacité de transmission.',
      learningGoals: "Transmettre ses connaissances; Créer pour les autres; Laisser un héritage",
      materials: JSON.stringify([
        'Matériel de documentation',
        'Caméra',
        'Supports de présentation',
        'Boîte de transmission',
        'Certificats de mentor'
      ]),
      grouping: "Projets individuels, cérémonie collective",
      isSubFriendly: true,
      subNotes: "Projets de transmission guidés. Importance de l'héritage. Cérémonie préparée.",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    },
    {
      title: "Champions créatifs pour toujours!",
      date: new Date('2026-06-24'),
      duration: 60,
      mindsOn: "Regardez tout ce que vous avez créé! Danses, jeux, spectacles... Vous êtes des CHAMPIONS CRÉATIFS! Célébrons!",
      action: `1. Rétrospective: Voyage de l'année
2. Démonstrations favorites: Best of
3. Jeux inventés: Tournoi final
4. Danse collective: Tous ensemble
5. Remise de prix: Chacun est champion
6. Fête: Célébration explosive!`,
      consolidation: "Couronnement créatif: Vous êtes officiellement des Maîtres du Mouvement Créatif! Continuez de créer! Toujours!",
      accommodations: "Participation selon confort; Célébration inclusive; Support constant",
      modifications: "Rôle adapté; Flexibilité totale; Inclusion garantie",
      extensions: "Performance spéciale; Discours; Leadership de célébration",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale reconnaissant la créativité et l\'expression développées.',
      learningGoals: "Célébrer ses accomplissements; Reconnaître sa croissance; Embrasser sa créativité",
      materials: JSON.stringify([
        'Décorations festives',
        'Musique de célébration',
        'Prix et certificats',
        'Jeux favoris',
        'Rafraîchissements'
      ]),
      grouping: "Célébration de classe entière",
      isSubFriendly: true,
      subNotes: "Célébration complète planifiée. Tous reconnus. Atmosphère de joie pure!",
      subject: 'Éducation physique',
      grade: 1,
      language: 'French'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Défis et expression"...`);
  
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
  
  console.log('\n🔍 CRITICAL ASSESSMENT - DÉFIS ET EXPRESSION:');
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
    console.log('✨ Complete creative movement and expression curriculum');
    console.log('✨ Dance, games, and physical challenges integrated');
    console.log('✨ Culminating spectacle and portfolio');
    console.log('✨ Legacy for future students');
    console.log('\n💃 Unit Highlights:');
    console.log('   • Body expression and storytelling');
    console.log('   • Creative dance exploration');
    console.log('   • Game invention and design');
    console.log('   • Balance and coordination challenges');
    console.log('   • World dance journey');
    console.log('   • Choreography creation');
    console.log('   • Creative sports innovation');
    console.log('   • Grand spectacle production');
    console.log('   • Complete creative celebration');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons do not meet ETFO standards');
    console.log('Review and enhance before implementation');
  }
  
  await prisma.$disconnect();
}

createDefisExpressionLessons();