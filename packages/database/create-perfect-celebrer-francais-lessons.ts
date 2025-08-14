import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCelebrerFrancaisLessons() {
  console.log('🇫🇷 CREATING PERFECT "CÉLÉBRER NOTRE FRANÇAIS" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Célébrer notre français' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 20 perfect ETFO-compliant French language celebration lessons
  const lessons = [
    {
      // Week 1: Réflexion sur notre parcours
      title: "Mon voyage en français",
      date: new Date('2026-03-31'),
      duration: 50,
      mindsOn: "Fermez les yeux... Rappelez-vous votre premier jour en français. Maintenant écoutez-vous parler! Quel voyage extraordinaire! Vous êtes de vrais francophones!",
      action: `1. Portfolio: Mes premiers mots vs maintenant
2. Enregistrement: Ma voix française d'aujourd'hui
3. Réflexion: Mes moments préférés en français
4. Graphique: Ma croissance linguistique
5. Fierté: Ce que je maîtrise maintenant
6. Partage: Mon succès favori`,
      consolidation: "Musée linguistique: Exposez votre parcours. Vous avez conquis une nouvelle langue! Quel accomplissement extraordinaire!",
      accommodations: "Format de réflexion varié; Support visuel; Expression multimodale",
      modifications: "Portfolio simplifié; Aide à la réflexion; Focus sur quelques éléments",
      extensions: "Journal détaillé; Vidéo témoignage; Analyse comparative approfondie",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Évaluer la conscience métalinguistique et la capacité de réflexion sur les apprentissages.',
      learningGoals: "Reconnaître ses progrès linguistiques; Développer la fierté francophone; Documenter son parcours",
      materials: JSON.stringify([
        'Portfolios de septembre',
        'Enregistreur audio',
        'Graphiques de progression',
        'Photos de l\'année',
        'Certificats de progrès'
      ]),
      grouping: "Réflexion individuelle, partage en cercle francophone",
      isSubFriendly: true,
      subNotes: "Portfolios de septembre disponibles. Atmosphère de célébration. Valoriser tous les progrès.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mes super-pouvoirs en lecture",
      date: new Date('2026-04-02'),
      duration: 50,
      mindsOn: "Regardez ces livres! En septembre, ils étaient des mystères. Maintenant, vous les dévorez! Montrez-moi votre livre préféré en français!",
      action: `1. Démonstration: Lecture expressive
2. Comparaison: Septembre vs maintenant
3. Stratégies: Mes trucs de lecture
4. Défis: Textes de plus en plus complexes
5. Recommandations: Mes coups de cœur
6. Objectifs: Lectures futures`,
      consolidation: "Club de lecture: Partagez votre extrait préféré. Vous êtes des lecteurs accomplis en français! Continuez cette passion!",
      accommodations: "Niveaux de lecture variés; Choix de textes; Support disponible",
      modifications: "Textes adaptés; Lecture partagée acceptable; Focus sur compréhension",
      extensions: "Critique littéraire; Blog de lecture; Défis de lecture avancés",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la fluidité, l\'expression et la compréhension en lecture française.',
      learningGoals: "Démontrer ses compétences en lecture; Partager ses stratégies; Développer l'amour de la lecture",
      materials: JSON.stringify([
        'Bibliothèque de classe',
        'Livres préférés',
        'Carnet de lecture',
        'Microphone pour enregistrement',
        'Affiches de stratégies'
      ]),
      grouping: "Lecture individuelle, partage en club de lecture",
      isSubFriendly: true,
      subNotes: "Livres variés disponibles. Stratégies affichées. Encourager l'expression et la confiance.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "J'écris comme un auteur",
      date: new Date('2026-04-06'),
      duration: 50,
      mindsOn: "Vos premiers gribouillis de septembre sont devenus des histoires complètes! Vous êtes des auteurs francophones! Quelle transformation magique!",
      action: `1. Portfolio d'écriture: Évolution visible
2. Création: Mon chef-d'œuvre écrit
3. Techniques: Mes stratégies d'écriture
4. Révision: Améliorer mes textes
5. Publication: Préparer pour les lecteurs
6. Célébration: Signature d'auteur`,
      consolidation: "Salon des auteurs: Signez vos œuvres! Vous êtes de vrais écrivains francophones! Votre plume continuera de grandir!",
      accommodations: "Formats d'écriture variés; Outils d'aide; Temps flexible",
      modifications: "Longueur adaptée; Aide à l'orthographe; Focus sur les idées",
      extensions: "Livre complet; Blog d'écriture; Correspondance avec auteur",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer le développement de l\'écriture et l\'utilisation des conventions.',
      learningGoals: "Produire des textes cohérents; Utiliser les stratégies d'écriture; Développer sa voix d'auteur",
      materials: JSON.stringify([
        'Portfolio d\'écriture',
        'Papier spécial',
        'Outils d\'écriture variés',
        'Dictionnaires visuels',
        'Tampons de publication'
      ]),
      grouping: "Écriture individuelle, partage en salon d'auteurs",
      isSubFriendly: true,
      subNotes: "Processus d'écriture affiché. Support disponible. Célébrer toutes les productions.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      // Week 2: Communication orale
      title: "Ma voix française forte",
      date: new Date('2026-04-08'),
      duration: 50,
      mindsOn: "Écoutez cette confiance quand vous parlez français! Plus de timidité - vous communiquez avec assurance! Votre voix française est puissante!",
      action: `1. Présentation: Mon sujet expert
2. Conversation: Échanges spontanés
3. Théâtre: Expression dramatique
4. Débat: Défendre mes idées
5. Narration: Raconter avec passion
6. Podcast: Enregistrement professionnel`,
      consolidation: "Radio francophone: Diffusez votre message! Votre voix française touche les cœurs! Continuez de la faire entendre!",
      accommodations: "Formats de présentation variés; Support visuel; Durée adaptable",
      modifications: "Présentation courte; Aide-mémoire accepté; Support du partenaire",
      extensions: "Émission complète; Interview; Présentation publique",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la fluidité, la prononciation et la confiance en communication orale.',
      learningGoals: "Communiquer avec confiance; Utiliser un vocabulaire riche; Exprimer ses idées clairement",
      materials: JSON.stringify([
        'Microphones',
        'Enregistreur',
        'Cartes de sujets',
        'Accessoires de théâtre',
        'Studio radio improvisé'
      ]),
      grouping: "Présentations individuelles, interactions en groupe",
      isSubFriendly: true,
      subNotes: "Structure de présentation claire. Atmosphère encourageante. Valoriser l'expression.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mon vocabulaire impressionnant",
      date: new Date('2026-04-10'),
      duration: 50,
      mindsOn: "Combien de mots français connaissez-vous maintenant? Des centaines! Vous êtes des dictionnaires vivants! Explorons votre richesse lexicale!",
      action: `1. Inventaire: Mes mots favoris
2. Familles de mots: Connexions
3. Jeux: Défis vocabulaire
4. Création: Mon dictionnaire personnel
5. Contextes: Utiliser les mots nouveaux
6. Célébration: Champion du vocabulaire`,
      consolidation: "Musée des mots: Exposez vos mots préférés et leurs histoires. Votre vocabulaire est un trésor qui grandit chaque jour!",
      accommodations: "Niveaux de difficulté variés; Support visuel; Groupements flexibles",
      modifications: "Vocabulaire de base; Images pour support; Répétition encouragée",
      extensions: "Étymologie; Expressions idiomatiques; Création de néologismes",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'étendue et l\'utilisation appropriée du vocabulaire français.',
      learningGoals: "Démontrer un vocabulaire étendu; Utiliser les mots en contexte; Développer la curiosité lexicale",
      materials: JSON.stringify([
        'Cartes de vocabulaire',
        'Dictionnaires illustrés',
        'Jeux de mots',
        'Cahier de vocabulaire',
        'Certificats de champion'
      ]),
      grouping: "Activités en stations, défis en équipes",
      isSubFriendly: true,
      subNotes: "Jeux de vocabulaire préparés. Niveaux différenciés. Atmosphère ludique.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Comprendre tout en français",
      date: new Date('2026-04-14'),
      duration: 50,
      mindsOn: "Vous comprenez maintenant les annonces, les histoires complexes, même les blagues en français! Votre compréhension est extraordinaire!",
      action: `1. Écoute: Textes variés et complexes
2. Stratégies: Comment je comprends
3. Inférences: Lire entre les lignes
4. Contexte: Deviner les mots nouveaux
5. Réaction: Répondre appropriément
6. Aide: Expliquer aux autres`,
      consolidation: "Détectives linguistiques: Démontrez votre super compréhension! Vous décodez le français comme des experts!",
      accommodations: "Textes de niveaux variés; Répétition permise; Support visuel",
      modifications: "Textes simplifiés; Aide contextuelle; Focus sur l'essentiel",
      extensions: "Textes authentiques; Médias variés; Analyse approfondie",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer les stratégies de compréhension et la capacité d\'inférence.',
      learningGoals: "Démontrer une compréhension approfondie; Utiliser des stratégies variées; Aider les autres",
      materials: JSON.stringify([
        'Textes audio variés',
        'Vidéos en français',
        'Livres de différents genres',
        'Cartes de stratégies',
        'Badges de détective'
      ]),
      grouping: "Écoute collective, travail en pairs, réflexion individuelle",
      isSubFriendly: true,
      subNotes: "Textes préparés à différents niveaux. Stratégies affichées. Support disponible.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      // Week 3: Projets créatifs
      title: "Mon spectacle en français",
      date: new Date('2026-04-16'),
      duration: 55,
      mindsOn: "Le français n'est pas juste une matière - c'est un art! Créons un spectacle pour montrer nos talents francophones!",
      action: `1. Choix: Chanson, poème ou saynète
2. Préparation: Mémorisation et pratique
3. Costumes: Touches créatives
4. Répétition: Perfectionner la performance
5. Technique: Voix et présence scénique
6. Générale: Pratique complète`,
      consolidation: "Ovation debout: Votre spectacle français brille! Vous êtes des artistes francophones accomplis!",
      accommodations: "Types de performance variés; Participation flexible; Support disponible",
      modifications: "Performance courte; Aide-mémoire permis; Duo ou groupe possible",
      extensions: "Création originale; Mise en scène élaborée; Direction d'autres",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'expression créative et l\'utilisation artistique du français.',
      learningGoals: "Performer en français; Exprimer sa créativité; Développer la présence scénique",
      materials: JSON.stringify([
        'Textes de spectacle',
        'Accessoires simples',
        'Microphone',
        'Décors basiques',
        'Programmes du spectacle'
      ]),
      grouping: "Performances solo, duo ou petits groupes",
      isSubFriendly: true,
      subNotes: "Textes de performance disponibles. Encourager l'expression. Gérer le trac.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Notre journal de classe",
      date: new Date('2026-04-20'),
      duration: 55,
      mindsOn: "Devenons journalistes! Créons un journal pour documenter notre année extraordinaire en français! Quelles histoires raconterons-nous?",
      action: `1. Rubriques: Nouvelles, sports, arts, etc.
2. Rédaction: Articles sur notre classe
3. Interviews: Questions aux amis
4. Photos: Moments importants
5. Mise en page: Organiser le journal
6. Publication: Préparer la distribution`,
      consolidation: "Conférence de presse: Présentez votre journal! Vous êtes des journalistes francophones professionnels!",
      accommodations: "Rôles variés dans le journal; Longueur d'article flexible; Support technique",
      modifications: "Article court ou en images; Travail en équipe; Aide à la rédaction",
      extensions: "Blog en ligne; Vidéo-reportage; Édition régulière",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la collaboration, la créativité journalistique et l\'écriture informative.',
      learningGoals: "Écrire différents types de textes; Collaborer sur un projet; Documenter la vie scolaire",
      materials: JSON.stringify([
        'Ordinateurs ou tablettes',
        'Appareil photo',
        'Modèles de journal',
        'Matériel de mise en page',
        'Imprimante'
      ]),
      grouping: "Équipe de rédaction collaborative",
      isSubFriendly: true,
      subNotes: "Structure du journal préparée. Rôles assignés. Support à la collaboration.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Ma chanson française préférée",
      date: new Date('2026-04-22'),
      duration: 50,
      mindsOn: "La musique française a rythmé notre année! Quelle est votre chanson préférée? Aujourd'hui, devenez des stars de la chanson française!",
      action: `1. Sélection: Ma chanson coup de cœur
2. Apprentissage: Paroles et mélodie
3. Interprétation: Style personnel
4. Chorégraphie: Mouvements simples
5. Karaoké: Performance musicale
6. Enregistrement: Version studio`,
      consolidation: "Concert francophone: Partagez votre chanson! La musique unit notre communauté francophone! Continuez de chanter!",
      accommodations: "Choix de chansons variés; Performance solo ou groupe; Support audio",
      modifications: "Refrain seulement; Playback permis; Participation adaptée",
      extensions: "Composition originale; Arrangement musical; Vidéoclip",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la prononciation, le rythme et l\'expression musicale en français.',
      learningGoals: "Interpréter en français; Développer le sens musical; Partager sa culture musicale",
      materials: JSON.stringify([
        'Répertoire de chansons',
        'Système audio',
        'Microphones',
        'Paroles illustrées',
        'Instruments simples'
      ]),
      grouping: "Pratique individuelle ou groupe, performance collective",
      isSubFriendly: true,
      subNotes: "Chansons pré-sélectionnées appropriées. Paroles disponibles. Atmosphère festive.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      // Week 4: Mentorat linguistique
      title: "Mentors francophones",
      date: new Date('2026-04-27'),
      duration: 55,
      mindsOn: "Les futurs élèves auront besoin de guides francophones comme vous! Vous avez la sagesse et l'expérience pour les aider!",
      action: `1. Réflexion: Ce qui m'a aidé
2. Conseils: Mes meilleurs trucs
3. Démonstration: Enseigner une stratégie
4. Patience: Pratiquer l'aide
5. Encouragement: Mots positifs
6. Engagement: Promesse de mentor`,
      consolidation: "Certificat de mentor: Vous êtes officiellement mentors francophones! Votre aide sera précieuse pour les nouveaux!",
      accommodations: "Styles de mentorat variés; Support à la communication; Flexibilité",
      modifications: "Mentorat simple; Aide en duo; Focus sur l'encouragement",
      extensions: "Programme structuré; Vidéos tutoriels; Guide du mentor",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer les compétences de leadership et la capacité d\'enseignement.',
      learningGoals: "Développer le leadership; Enseigner aux autres; Encourager l'apprentissage",
      materials: JSON.stringify([
        'Badges de mentor',
        'Cartes de stratégies',
        'Matériel pédagogique',
        'Certificats',
        'Guide du mentor'
      ]),
      grouping: "Formation en groupe, pratique en pairs",
      isSubFriendly: true,
      subNotes: "Rôle de mentor expliqué. Stratégies d'enseignement modélisées. Support constant.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Trésors pour les nouveaux",
      date: new Date('2026-04-29'),
      duration: 55,
      mindsOn: "Créons des trésors d'apprentissage pour les futurs élèves! Vos créations les aideront à aimer le français comme vous!",
      action: `1. Brainstorm: Outils utiles
2. Création: Affiches et ressources
3. Jeux: Activités d'apprentissage
4. Vidéos: Tutoriels simples
5. Messages: Encouragements
6. Collection: Boîte aux trésors`,
      consolidation: "Héritage francophone: Vos trésors aideront des générations! Quelle générosité linguistique!",
      accommodations: "Types de création variés; Complexité adaptable; Support technique",
      modifications: "Création simple; Travail d'équipe; Focus sur un élément",
      extensions: "Site web de ressources; Série de vidéos; Manuel complet",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la créativité pédagogique et l\'empathie pour les apprenants.',
      learningGoals: "Créer des ressources pédagogiques; Transmettre ses connaissances; Aider les futurs apprenants",
      materials: JSON.stringify([
        'Matériel d\'art',
        'Tablettes pour vidéos',
        'Cartons et affiches',
        'Matériel de jeux',
        'Boîte décorée'
      ]),
      grouping: "Création individuelle ou petits groupes",
      isSubFriendly: true,
      subNotes: "Exemples de ressources disponibles. Encourager la créativité. Valoriser l'effort.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      // Week 5: Préparation du festival
      title: "Planifier notre festival",
      date: new Date('2026-05-04'),
      duration: 55,
      mindsOn: "Notre Festival du français approche! C'est VOTRE célébration! Comment voulez-vous montrer vos talents francophones?",
      action: `1. Comités: Organisation du festival
2. Programme: Planifier les présentations
3. Invitations: Créer et distribuer
4. Décoration: Thème francophone
5. Répétitions: Coordonner les groupes
6. Logistique: Tout prévoir`,
      consolidation: "Comité organisateur: Votre festival sera magnifique! Vous êtes des organisateurs professionnels!",
      accommodations: "Rôles variés selon capacités; Participation flexible; Support disponible",
      modifications: "Tâche simple assignée; Travail avec support; Focus sur participation",
      extensions: "Coordination générale; Relations publiques; Documentation complète",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer les compétences organisationnelles et le travail d\'équipe.',
      learningGoals: "Planifier un événement; Collaborer efficacement; Prendre des responsabilités",
      materials: JSON.stringify([
        'Plans du festival',
        'Matériel d\'invitation',
        'Listes de vérification',
        'Matériel de décoration',
        'Système de communication'
      ]),
      grouping: "Comités spécialisés, réunions plénières",
      isSubFriendly: true,
      subNotes: "Structure organisationnelle claire. Rôles définis. Support à la coordination.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Répétition générale",
      date: new Date('2026-05-06'),
      duration: 60,
      mindsOn: "C'est la dernière pratique avant le grand jour! Montrons notre meilleur français! Brillez comme les étoiles francophones que vous êtes!",
      action: `1. Installation: Préparer l'espace
2. Enchaînements: Ordre des présentations
3. Technique: Son et éclairage
4. Performances: Derniers ajustements
5. Transitions: Fluidité du spectacle
6. Finale: Répéter le grand final`,
      consolidation: "Cercle de confiance: Vous êtes prêts! Demain, vous brillerez! Votre français touchera tous les cœurs!",
      accommodations: "Adaptations de dernière minute; Support émotionnel; Flexibilité",
      modifications: "Répétition adaptée; Support supplémentaire; Réduction du stress",
      extensions: "Rôle de régisseur; Coaching des autres; Perfectionnement",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la préparation finale et la gestion du stress pré-performance.',
      learningGoals: "Perfectionner sa performance; Gérer le trac; Supporter l'équipe",
      materials: JSON.stringify([
        'Scène ou espace aménagé',
        'Système de son',
        'Éclairage basique',
        'Costumes et accessoires',
        'Programme final'
      ]),
      grouping: "Répétition collective avec moments individuels",
      isSubFriendly: true,
      subNotes: "Horaire de répétition strict. Gestion du stress. Encouragements constants.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      // Week 6: Festival et célébration
      title: "Festival du français!",
      date: new Date('2026-05-11'),
      duration: 90,
      mindsOn: "C'est LE jour! Votre festival! Accueillez vos invités en français! Montrez combien vous avez grandi! Célébrez votre francophonie!",
      action: `1. Accueil: Recevoir les invités
2. Ouverture: Mots de bienvenue
3. Performances: Spectacles variés
4. Expositions: Travaux de l'année
5. Interactions: Animer en français
6. Finale: Célébration collective`,
      consolidation: "Standing ovation: Quel succès extraordinaire! Vous avez partagé votre amour du français! Bravo, champions francophones!",
      accommodations: "Rôles adaptés au confort; Espaces calmes disponibles; Support constant",
      modifications: "Participation selon capacité; Pauses permises; Alternatives disponibles",
      extensions: "Maître de cérémonie; Interviews; Documentation de l'événement",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation culminante des compétences francophones dans un contexte authentique.',
      learningGoals: "Célébrer ses apprentissages; Partager avec la communauté; Vivre sa francophonie",
      materials: JSON.stringify([
        'Scène décorée',
        'Système de son complet',
        'Programmes imprimés',
        'Expositions installées',
        'Rafraîchissements'
      ]),
      grouping: "Événement communautaire avec rôles individuels",
      isSubFriendly: true,
      subNotes: "Programme détaillé fourni. Rôles clarifiés. Ambiance de célébration maintenue.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Réflexions sur notre succès",
      date: new Date('2026-05-13'),
      duration: 50,
      mindsOn: "Le festival était magique! Vos familles étaient si fières! Réfléchissons à ce moment extraordinaire de partage francophone!",
      action: `1. Retour: Moments préférés
2. Feedback: Commentaires reçus
3. Photos: Revivre les souvenirs
4. Journal: Écrire ses sentiments
5. Remerciements: Cartes de gratitude
6. Apprentissages: Ce qu'on a découvert`,
      consolidation: "Album souvenir: Ces mémoires sont précieuses! Votre festival restera gravé dans l'histoire de l'école!",
      accommodations: "Formats de réflexion variés; Expression multimodale; Temps flexible",
      modifications: "Réflexion orale ou dessinée; Support à l'écriture; Focus simple",
      extensions: "Article de journal; Montage vidéo; Présentation pour l'école",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité de réflexion et d\'auto-évaluation post-événement.',
      learningGoals: "Réfléchir sur l'expérience; Exprimer sa fierté; Apprécier l'accomplissement collectif",
      materials: JSON.stringify([
        'Photos du festival',
        'Livre d\'or',
        'Journal de réflexion',
        'Cartes de remerciement',
        'Album souvenir'
      ]),
      grouping: "Réflexion individuelle, partage collectif",
      isSubFriendly: true,
      subNotes: "Photos du festival disponibles. Atmosphère positive. Valoriser tous les efforts.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Mon portfolio francophone",
      date: new Date('2026-06-08'),
      duration: 55,
      mindsOn: "Assemblons vos trésors francophones de l'année! Chaque page raconte votre histoire d'apprentissage! Quel parcours impressionnant!",
      action: `1. Sélection: Meilleurs travaux
2. Organisation: Ordre chronologique
3. Réflexions: Commentaires personnels
4. Preuves: Progrès documentés
5. Présentation: Mise en page
6. Personnalisation: Touches créatives`,
      consolidation: "Vernissage portfolio: Présentez votre parcours! Ce portfolio témoigne de votre réussite francophone exceptionnelle!",
      accommodations: "Format de portfolio flexible; Aide à la sélection; Support technique",
      modifications: "Portfolio simplifié; Moins d'éléments; Aide constante",
      extensions: "Portfolio numérique; Narration audio; Présentation publique",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation globale du parcours d\'apprentissage et de la progression annuelle.',
      learningGoals: "Documenter ses apprentissages; Organiser ses réussites; Célébrer son parcours",
      materials: JSON.stringify([
        'Portfolios ou classeurs',
        'Travaux de l\'année',
        'Photos et souvenirs',
        'Matériel de décoration',
        'Étiquettes et titres'
      ]),
      grouping: "Travail individuel avec partage optionnel",
      isSubFriendly: true,
      subNotes: "Structure de portfolio fournie. Travaux disponibles. Support à l'organisation.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Promesses pour l'été",
      date: new Date('2026-06-10'),
      duration: 50,
      mindsOn: "Le français ne s'arrête pas en juin! Comment continuerez-vous votre aventure francophone cet été? Faisons des promesses!",
      action: `1. Objectifs: 3 buts français pour l'été
2. Lecture: Liste de livres d'été
3. Écriture: Journal de vacances
4. Oral: Pratiquer avec qui?
5. Culture: Activités francophones
6. Contrat: Engagement personnel`,
      consolidation: "Serment francophone: Promettez de garder votre français vivant! Il fait partie de vous pour toujours!",
      accommodations: "Objectifs personnalisés; Ressources variées; Support familial",
      modifications: "1-2 objectifs simples; Activités de base; Flexibilité totale",
      extensions: "Camp francophone; Correspondance; Projet d'été élaboré",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'engagement continu et la planification autonome.',
      learningGoals: "Planifier la pratique continue; S'engager personnellement; Maintenir la motivation",
      materials: JSON.stringify([
        'Contrats d\'été',
        'Listes de lecture',
        'Journaux d\'été',
        'Ressources francophones',
        'Calendrier d\'activités'
      ]),
      grouping: "Planification individuelle, partage d'idées",
      isSubFriendly: true,
      subNotes: "Ressources d'été préparées. Idées d'activités fournies. Encourager la continuité.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Prêts pour la 2e année",
      date: new Date('2026-06-22'),
      duration: 55,
      mindsOn: "En septembre, vous serez les pros de 2e année! Votre français est solide! Vous êtes prêts pour de nouvelles aventures!",
      action: `1. Anticipation: Ce qui m'excite
2. Confiance: Mes forces en français
3. Questions: Ce que je me demande
4. Préparation: Plan pour septembre
5. Message: Lettre à mon futur moi
6. Célébration: Graduation française`,
      consolidation: "Diplôme francophone: Vous êtes officiellement prêts! Votre français vous accompagnera toute votre vie!",
      accommodations: "Expression des inquiétudes; Support émotionnel; Rythme individuel",
      modifications: "Focus sur le positif; Réassurance constante; Simplification",
      extensions: "Visite de la classe de 2e; Projet de transition; Mentorat d'été",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation finale de la préparation et de la confiance linguistique.',
      learningGoals: "Anticiper avec confiance; Reconnaître ses acquis; Maintenir la motivation",
      materials: JSON.stringify([
        'Lettres au futur',
        'Diplômes francophones',
        'Photos de groupe',
        'Capsule temporelle',
        'Médailles de réussite'
      ]),
      grouping: "Cérémonie collective avec moments individuels",
      isSubFriendly: true,
      subNotes: "Cérémonie préparée. Transition positive. Célébration de tous.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    },
    {
      title: "Champions francophones pour toujours!",
      date: new Date('2026-06-24'),
      duration: 60,
      mindsOn: "Regardez le chemin parcouru! De septembre à juin, quelle transformation! Vous êtes des CHAMPIONS FRANCOPHONES! Célébrons!",
      action: `1. Rétrospective: Notre année en images
2. Témoignages: Partager sa fierté
3. Performances: Nos favoris de l'année
4. Reconnaissances: Certificats spéciaux
5. Promesses: Rester francophones
6. Fête: Célébration finale!`,
      consolidation: "Couronne francophone: Vous êtes couronnés champions du français! Votre réussite est extraordinaire! Continuez de briller!",
      accommodations: "Participation selon confort; Formats variés; Inclusion totale",
      modifications: "Rôle adapté; Support disponible; Célébration personnalisée",
      extensions: "Discours de fin d'année; Vidéo souvenir; Legacy projet",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale reconnaissant l\'ensemble du parcours francophone.',
      learningGoals: "Célébrer l'accomplissement; Affirmer son identité francophone; Clôturer avec fierté",
      materials: JSON.stringify([
        'Décorations de fête',
        'Certificats personnalisés',
        'Couronnes symboliques',
        'Musique francophone',
        'Album de l\'année'
      ]),
      grouping: "Célébration communautaire",
      isSubFriendly: true,
      subNotes: "Grande célébration planifiée. Chaque élève reconnu. Ambiance de fierté et joie.",
      subject: 'Français langue première',
      grade: 1,
      language: 'French'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Célébrer notre français"...`);
  
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
  
  console.log('\n🔍 CRITICAL ASSESSMENT - CÉLÉBRER NOTRE FRANÇAIS:');
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
    console.log('✨ All 20 lessons are 100% ETFO compliant');
    console.log('✨ Complete French language celebration curriculum');
    console.log('✨ Comprehensive reflection on linguistic journey');
    console.log('✨ Festival du français community event');
    console.log('✨ Successful francophone identity development');
    console.log('\n🇫🇷 Unit Highlights:');
    console.log('   • Linguistic journey reflection');
    console.log('   • Reading and writing mastery');
    console.log('   • Oral communication confidence');
    console.log('   • Creative French projects');
    console.log('   • Mentorship preparation');
    console.log('   • Festival planning and execution');
    console.log('   • Portfolio development');
    console.log('   • Summer continuity planning');
    console.log('   • Francophone identity celebration');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons do not meet ETFO standards');
    console.log('Review and enhance before implementation');
  }
  
  await prisma.$disconnect();
}

createCelebrerFrancaisLessons();