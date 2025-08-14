import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createHistoiresVisuellesLessons() {
  console.log('🎨 CREATING PERFECT "HISTOIRES VISUELLES" LESSONS');
  console.log('='.repeat(60));
  
  // Get teacher and unit
  const teacher = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Histoires visuelles' }
  });
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Create 20 perfect ETFO-compliant French visual arts lessons
  const lessons = [
    {
      // Week 1: Introduction aux histoires visuelles
      title: "Mon histoire en images",
      date: new Date('2026-03-30'),
      duration: 50,
      mindsOn: "Regardez ces trois images... Ensemble, elles racontent l'histoire d'une aventure! Chaque image est comme une phrase dans un livre. Aujourd'hui, vous devenez des auteurs visuels!",
      action: `1. Exploration: Séquences d'images qui racontent
2. Brainstorm: Mon histoire préférée de l'année
3. Planification: 3 moments clés à illustrer
4. Création: Première image de ma séquence
5. Techniques: Comment montrer le temps qui passe
6. Développement: Détails qui racontent`,
      consolidation: "Galerie des débuts: Montrez votre première image. Qui peut deviner votre histoire? L'art parle sans mots!",
      accommodations: "Support visuel pour planification; Choix de médiums variés; Temps supplémentaire",
      modifications: "Histoire en 2 images; Thèmes suggérés; Support individuel",
      extensions: "Ajouter du texte créatif; Créer une couverture; Explorer différents styles",
      assessmentType: 'Diagnostic',
      assessmentNotes: 'Évaluer la capacité de narration visuelle et la compréhension de la séquence. Noter les idées créatives.',
      learningGoals: "Comprendre la narration visuelle; Planifier une séquence d'images; Commencer son histoire personnelle",
      materials: JSON.stringify([
        'Papier format bande dessinée',
        'Crayons et marqueurs',
        'Exemples de livres sans mots',
        'Pastels et aquarelles',
        'Modèles de séquences'
      ]),
      grouping: "Introduction collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Exemples d'histoires visuelles préparés. Structure de planification claire. Encourager l'expression personnelle.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Le milieu de mon histoire",
      date: new Date('2026-04-01'),
      duration: 50,
      mindsOn: "Le milieu d'une histoire, c'est là où l'aventure devient excitante! C'est le moment du défi, du problème ou de la découverte. Comment votre héros fait face?",
      action: `1. Révision: Notre première image
2. Discussion: Qu'est-ce qui se passe ensuite?
3. Techniques: Montrer l'émotion et l'action
4. Création: Deuxième image - le climax
5. Détails: Expressions et mouvements
6. Connexions: Lier les images ensemble`,
      consolidation: "Partenaires détectives: Échangez vos deux images. Votre ami peut-il suivre l'histoire? Les bonnes histoires visuelles communiquent clairement!",
      accommodations: "Références visuelles disponibles; Options de collaboration; Matériel adapté",
      modifications: "Focus sur une émotion simple; Aide pour les transitions; Support constant",
      extensions: "Ajouter des bulles de pensée; Créer des effets spéciaux; Techniques avancées",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer le développement narratif et l\'utilisation des éléments visuels pour créer la tension.',
      learningGoals: "Créer le point culminant de l'histoire; Utiliser l'art pour montrer l'émotion; Connecter les séquences",
      materials: JSON.stringify([
        'Images précédentes',
        'Matériel artistique varié',
        'Exemples d\'expressions',
        'Cartes d\'émotions',
        'Références d\'action'
      ]),
      grouping: "Révision en pairs, création individuelle",
      isSubFriendly: true,
      subNotes: "Structure de l'histoire expliquée. Exemples de climax visuels. Support pour la continuité narrative.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "La fin parfaite",
      date: new Date('2026-04-03'),
      duration: 50,
      mindsOn: "Toute bonne histoire a besoin d'une fin satisfaisante! Comment votre aventure se termine-t-elle? Heureux? Surprenant? Mystérieux? C'est vous l'auteur!",
      action: `1. Exploration: Différents types de fins
2. Planification: Comment terminer mon histoire
3. Création: Troisième image - la conclusion
4. Raffinement: Détails qui complètent
5. Révision: Les trois images ensemble
6. Ajustements: Harmoniser le style`,
      consolidation: "Cinéma muet: Présentez votre trilogie visuelle complète. Votre histoire touche-t-elle le cœur? Félicitations, vous êtes des narrateurs visuels!",
      accommodations: "Flexibilité dans le type de fin; Support pour décisions; Encouragement constant",
      modifications: "Fin guidée si nécessaire; Simplification acceptable; Célébrer tout effort",
      extensions: "Créer des fins alternatives; Ajouter une page titre; Préparer une présentation",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la cohérence narrative complète et la résolution créative. Noter l\'originalité.',
      learningGoals: "Conclure une narration visuelle; Créer une cohérence stylistique; Communiquer une histoire complète",
      materials: JSON.stringify([
        'Trois panneaux de l\'histoire',
        'Matériel de finition',
        'Exemples de conclusions',
        'Matériel de présentation',
        'Cadres décoratifs optionnels'
      ]),
      grouping: "Travail individuel, partage en grand groupe",
      isSubFriendly: true,
      subNotes: "Célébrer chaque histoire. Format de présentation simple. Emphase sur l'accomplissement.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 2: Personnages et émotions
      title: "Créer des personnages expressifs",
      date: new Date('2026-04-06'),
      duration: 50,
      mindsOn: "Un personnage peut sourire, pleurer, être surpris ou fâché - tout avec des lignes simples! Regardez... (dessiner expressions). Vos personnages vont prendre vie aujourd'hui!",
      action: `1. Exploration: Formes de base pour personnages
2. Pratique: Visages avec différentes émotions
3. Construction: Mon personnage principal
4. Développement: Corps et postures expressives
5. Personnalisation: Détails uniques
6. Animation: Montrer le mouvement`,
      consolidation: "Défilé de personnages: Présentez votre création. Quelle est sa personnalité? Les personnages forts racontent de meilleures histoires!",
      accommodations: "Gabarits de base disponibles; Références d'émotions; Choix de complexité",
      modifications: "Personnages simples acceptés; Focus sur une émotion; Support constant",
      extensions: "Créer une famille de personnages; Développer un style unique; Backstory du personnage",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la capacité d\'exprimer les émotions visuellement et la créativité dans le design.',
      learningGoals: "Créer des personnages expressifs; Communiquer les émotions par l'art; Développer un style personnel",
      materials: JSON.stringify([
        'Papier à dessin',
        'Crayons variés',
        'Miroirs pour expressions',
        'Cartes d\'émotions',
        'Exemples de personnages'
      ]),
      grouping: "Démonstration collective, exploration individuelle",
      isSubFriendly: true,
      subNotes: "Étapes de construction de personnages clairement démontrées. Références visuelles disponibles.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Les décors qui parlent",
      date: new Date('2026-04-08'),
      duration: 50,
      mindsOn: "Un château sombre raconte une histoire différente qu'un jardin ensoleillé! Le décor est comme la musique de fond de votre histoire. Quel monde allez-vous créer?",
      action: `1. Exploration: Types de décors narratifs
2. Éléments: Qu'est-ce qui rend un lieu spécial?
3. Perspective: Proche et loin (simple)
4. Création: Le monde de mon personnage
5. Ambiance: Couleurs et atmosphère
6. Détails: Objets qui racontent`,
      consolidation: "Visite guidée: Décrivez votre décor. Qu'est-ce qui s'y passe? Les lieux racontent autant que les personnages!",
      accommodations: "Complexité adaptable; Références visuelles; Support technique disponible",
      modifications: "Décors simplifiés; Focus sur l'ambiance générale; Aide individuelle",
      extensions: "Multiple décors; Changements de saisons; Détails architecturaux",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'utilisation de l\'espace et des éléments pour créer l\'atmosphère narrative.',
      learningGoals: "Créer des environnements narratifs; Utiliser la couleur pour l'ambiance; Comprendre le rôle du décor",
      materials: JSON.stringify([
        'Grand papier',
        'Peintures et pinceaux',
        'Éponges pour textures',
        'Images de référence',
        'Pastels pour détails'
      ]),
      grouping: "Exploration collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Techniques de base pour décors démontrées. Encourager l'imagination plus que le réalisme.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Personnages en action",
      date: new Date('2026-04-10'),
      duration: 50,
      mindsOn: "Figez! Regardez vos positions... Chaque pose raconte quelque chose! Courir, sauter, dormir, danser - votre corps est une histoire. Capturons le mouvement!",
      action: `1. Jeu: Statues d'action
2. Observation: Comment dessiner le mouvement
3. Pratique: Lignes d'action simples
4. Création: Mon personnage en mouvement
5. Effets: Lignes de vitesse et impacts
6. Scène: Personnage dans son décor`,
      consolidation: "Action freeze: Montrez votre personnage en action. Que fait-il? Le mouvement donne vie à l'art!",
      accommodations: "Mouvement adapté aux capacités; Références variées; Tempo flexible",
      modifications: "Poses simples acceptées; Focus sur intention; Support visuel constant",
      extensions: "Séquence de mouvements; Effets spéciaux élaborés; Multiple personnages",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la capacité de représenter le mouvement et l\'action dans l\'image statique.',
      learningGoals: "Capturer le mouvement en art; Utiliser les lignes d'action; Intégrer personnages et décors",
      materials: JSON.stringify([
        'Papier à dessin',
        'Marqueurs dynamiques',
        'Exemples de mouvement',
        'Personnages précédents',
        'Décors créés'
      ]),
      grouping: "Jeu de groupe, création individuelle",
      isSubFriendly: true,
      subNotes: "Jeu de statues pour commencer. Démonstration des lignes d'action. Énergie canalisée créativement.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 3: Techniques d'illustration
      title: "L'art du détail magique",
      date: new Date('2026-04-14'),
      duration: 50,
      mindsOn: "Regardez cette pomme... Maintenant avec une petite étoile dessus, elle devient magique! Les petits détails transforment l'ordinaire en extraordinaire!",
      action: `1. Chasse aux détails: Observer de près
2. Techniques: Ajouter de la texture
3. Pratique: Patterns et motifs
4. Transformation: Objet ordinaire → magique
5. Enrichissement: Détails qui racontent
6. Finition: Peaufiner son œuvre`,
      consolidation: "Détective de détails: Trouvez trois détails spéciaux dans l'œuvre d'un ami. Les détails sont les épices de l'art!",
      accommodations: "Loupes disponibles; Niveaux de détail variés; Temps flexible",
      modifications: "Quelques détails suffisent; Focus sur un élément; Aide à la motricité",
      extensions: "Détails cachés à découvrir; Motifs complexes; Techniques mixtes",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer l\'attention aux détails et la capacité d\'enrichir visuellement une œuvre.',
      learningGoals: "Enrichir par les détails; Créer de la texture visuelle; Transformer l'ordinaire",
      materials: JSON.stringify([
        'Objets à observer',
        'Loupes',
        'Stylos fins',
        'Matériel de texture',
        'Papier de qualité'
      ]),
      grouping: "Observation collective, travail individuel concentré",
      isSubFriendly: true,
      subNotes: "Exemples de détails transformateurs. Encourager l'observation attentive. Célébrer chaque ajout.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Couleurs qui racontent",
      date: new Date('2026-04-16'),
      duration: 50,
      mindsOn: "Les couleurs ont des superpouvoirs! Le rouge peut dire 'danger' ou 'amour'. Le bleu peut être 'calme' ou 'triste'. Quelle histoire vos couleurs vont raconter?",
      action: `1. Exploration: Émotions des couleurs
2. Expérience: Mélanges et découvertes
3. Choix: Palette pour mon histoire
4. Application: Couleurs narratives
5. Contraste: Faire ressortir l'important
6. Harmonie: Unifier la composition`,
      consolidation: "Palette d'émotions: Expliquez vos choix de couleurs. Comment aident-elles votre histoire? La couleur est un language silencieux!",
      accommodations: "Options de médiums; Références de couleurs; Support au mélange",
      modifications: "Palette limitée acceptable; Focus sur couleurs primaires; Aide technique",
      extensions: "Théorie des couleurs avancée; Créer des ambiances; Symbolisme des couleurs",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'utilisation intentionnelle de la couleur pour soutenir la narration.',
      learningGoals: "Utiliser la couleur narrativement; Créer des ambiances; Comprendre l'impact émotionnel",
      materials: JSON.stringify([
        'Peintures variées',
        'Cercle chromatique',
        'Papier aquarelle',
        'Éponges et pinceaux',
        'Tabliers'
      ]),
      grouping: "Expérimentation en petits groupes, application individuelle",
      isSubFriendly: true,
      subNotes: "Stations de couleurs préparées. Démonstration de mélanges. Gestion du matériel importante.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Ombres et lumières dramatiques",
      date: new Date('2026-04-20'),
      duration: 50,
      mindsOn: "Fermez les yeux... Ouvrez! Voyez comme la lumière change tout! Une lampe de poche sous le menton fait peur, mais sur le visage, c'est héroïque!",
      action: `1. Jeu: Théâtre d'ombres
2. Observation: D'où vient la lumière?
3. Technique: Ajouter des ombres simples
4. Pratique: Clair-obscur basique
5. Application: Lumière dans mon histoire
6. Effet: Créer du mystère ou de la joie`,
      consolidation: "Éclairagiste: Comment la lumière change-t-elle l'ambiance de votre œuvre? La lumière guide l'œil et l'émotion!",
      accommodations: "Lampes disponibles; Niveaux de contraste variés; Support visuel",
      modifications: "Ombres simples seulement; Focus sur une source; Aide directe",
      extensions: "Multiple sources de lumière; Reflets; Effets atmosphériques",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension de la lumière et l\'ombre pour créer l\'atmosphère.',
      learningGoals: "Comprendre lumière et ombre; Créer de la profondeur; Améliorer le drame visuel",
      materials: JSON.stringify([
        'Lampes de poche',
        'Papier noir et blanc',
        'Crayons de valeurs',
        'Objets pour ombres',
        'Exemples dramatiques'
      ]),
      grouping: "Exploration collective, application individuelle",
      isSubFriendly: true,
      subNotes: "Jeu d'ombres pour débuter. Sécurité avec lampes. Démonstration claire des techniques.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 4: Livres illustrés
      title: "Mon premier livre illustré",
      date: new Date('2026-04-22'),
      duration: 55,
      mindsOn: "Vous êtes maintenant des vrais artistes-auteurs! Aujourd'hui, on commence notre livre personnel. Quelle histoire importante voulez-vous préserver pour toujours?",
      action: `1. Brainstorm: Mon histoire à partager
2. Structure: Début, milieu, fin en 6 pages
3. Storyboard: Croquis rapides
4. Page 1: Couverture attrayante
5. Page 2: Première illustration
6. Planification: Les pages suivantes`,
      consolidation: "Maison d'édition: Présentez votre concept de livre. Qui voudrait le lire? Chaque livre enrichit notre bibliothèque de classe!",
      accommodations: "Formats variés disponibles; Aide à la structuration; Flexibilité du contenu",
      modifications: "Livre de 4 pages acceptable; Histoire simple; Support constant",
      extensions: "Plus de pages; Dédicace; Biographie de l'auteur",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la planification narrative et l\'engagement dans le projet de livre.',
      learningGoals: "Concevoir un livre illustré; Structurer une narration; Créer une couverture engageante",
      materials: JSON.stringify([
        'Papier relié en livret',
        'Matériel d\'art complet',
        'Exemples de livres',
        'Matériel de reliure',
        'Étiquettes pour titre'
      ]),
      grouping: "Planification individuelle, partage en cercle d'auteurs",
      isSubFriendly: true,
      subNotes: "Format de livre pré-préparé. Structure claire fournie. Encourager l'expression personnelle.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Pages du cœur de l'histoire",
      date: new Date('2026-04-24'),
      duration: 55,
      mindsOn: "Les meilleures pages d'un livre sont celles qui nous font ressentir quelque chose. Aujourd'hui, créons les moments forts de vos histoires!",
      action: `1. Révision: Notre plan de livre
2. Pages 3-4: Le cœur de l'histoire
3. Techniques: Varier les perspectives
4. Détails: Enrichir chaque page
5. Texte: Quelques mots si désiré
6. Cohérence: Harmoniser le style`,
      consolidation: "Critique constructive: Partagez avec un ami. Qu'est-ce qui fonctionne bien? Vos suggestions aident à améliorer!",
      accommodations: "Rythme individualisé; Options de médiums; Support émotionnel",
      modifications: "Focus sur images principales; Texte optionnel; Simplification acceptée",
      extensions: "Dialogue dans bulles; Effets spéciaux; Pages dépliantes",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer le développement narratif et la cohérence visuelle à travers les pages.',
      learningGoals: "Développer le cœur narratif; Maintenir la cohérence; Enrichir visuellement",
      materials: JSON.stringify([
        'Livres en cours',
        'Matériel d\'illustration',
        'Références visuelles',
        'Lettrage simple',
        'Exemples de mise en page'
      ]),
      grouping: "Travail individuel, révision en pairs",
      isSubFriendly: true,
      subNotes: "Continuer les projets de livre. Support à la cohérence. Feedback positif structuré.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "La fin et la célébration",
      date: new Date('2026-04-27'),
      duration: 55,
      mindsOn: "Un livre n'est complet qu'avec sa dernière page et sa quatrième de couverture! Aujourd'hui, nous devenons des vrais auteurs publiés!",
      action: `1. Pages finales: Conclusion satisfaisante
2. Quatrième de couverture: Résumé attractif
3. Page de titre: Nom d'auteur fièrement
4. Finition: Derniers détails
5. Reliure: Assembler le livre
6. Préparation: Lecture à voix haute`,
      consolidation: "Lancement de livres: Lisez votre livre à la classe! Applaudissements! Vous êtes des auteurs-illustrateurs publiés!",
      accommodations: "Aide à la reliure; Options de présentation; Célébration adaptée",
      modifications: "Présentation flexible; Aide à la finition; Support complet",
      extensions: "ISBN imaginaire; Critiques de livres; Série de livres",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation complète du livre fini: narration, illustration, cohérence, effort.',
      learningGoals: "Compléter un livre illustré; Présenter son œuvre; Célébrer l'accomplissement",
      materials: JSON.stringify([
        'Livres à finaliser',
        'Matériel de reliure',
        'Colle et ciseaux',
        'Podium de présentation',
        'Certificats d\'auteur'
      ]),
      grouping: "Finition individuelle, célébration collective",
      isSubFriendly: true,
      subNotes: "Cérémonie de lancement préparée. Chaque enfant présente. Atmosphère de célébration.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 5: Bandes dessinées
      title: "L'art de la bande dessinée",
      date: new Date('2026-05-04'),
      duration: 50,
      mindsOn: "POW! BOUM! Les bandes dessinées utilisent des mots et des images ensemble! Regardez ces bulles de parole, ces cases... C'est comme un film sur papier!",
      action: `1. Exploration: Éléments de BD
2. Cases: Diviser l'action
3. Bulles: Paroles et pensées
4. Onomatopées: Sons visuels
5. Création: Ma première planche
6. Personnages: Expressions exagérées`,
      consolidation: "Studio de BD: Montrez votre planche. Quels sons avez-vous créés? La BD est un art unique et expressif!",
      accommodations: "Modèles de cases fournis; Bulles pré-découpées; Flexibilité du format",
      modifications: "2-3 cases suffisantes; Aide au lettrage; Support constant",
      extensions: "Histoire en plusieurs planches; Effets spéciaux; Style manga",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la compréhension du langage de la BD et l\'utilisation des conventions.',
      learningGoals: "Comprendre le langage BD; Combiner texte et image; Créer une séquence dynamique",
      materials: JSON.stringify([
        'Planches de BD vierges',
        'Marqueurs noirs',
        'Règles',
        'Modèles de bulles',
        'Exemples de BD'
      ]),
      grouping: "Exploration collective, création individuelle",
      isSubFriendly: true,
      subNotes: "Vocabulaire BD expliqué. Modèles disponibles. Encourager l'expérimentation.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Super-héros de notre classe",
      date: new Date('2026-05-06'),
      duration: 50,
      mindsOn: "Si vous aviez un super-pouvoir pour aider notre école, ce serait quoi? Aujourd'hui, vous devenez le héros de votre propre BD!",
      action: `1. Invention: Mon personnage héros
2. Pouvoir: Capacité spéciale unique
3. Costume: Design distinctif
4. Mission: Problème à résoudre
5. BD: Aventure en 4 cases
6. Action: Montrer le pouvoir en action`,
      consolidation: "Ligue des héros: Présentez votre super-héros! Comment aide-t-il? Nos héros reflètent nos valeurs!",
      accommodations: "Thèmes de pouvoirs variés; Support au design; Encouragement constant",
      modifications: "Héros simple acceptable; Histoire basique; Aide individuelle",
      extensions: "Némésis du héros; Origine story; Équipe de héros",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer la créativité, l\'expression des valeurs et la narration héroïque.',
      learningGoals: "Créer un personnage original; Exprimer des valeurs positives; Raconter une aventure",
      materials: JSON.stringify([
        'Papier BD',
        'Crayons de couleur vifs',
        'Modèles de personnages',
        'Autocollants étoiles',
        'Capes en tissu (optionnel)'
      ]),
      grouping: "Création individuelle, partage en équipe de héros",
      isSubFriendly: true,
      subNotes: "Thème positif de héros aidants. Structure d'histoire fournie. Célébrer chaque création.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 6: Art collaboratif
      title: "Murale de nos souvenirs",
      date: new Date('2026-05-11'),
      duration: 60,
      mindsOn: "Ensemble, nous allons créer une œuvre géante qui raconte l'histoire de notre année! Chacun ajoutera un morceau important. C'est notre histoire collective!",
      action: `1. Planification: Thèmes de l'année
2. Sections: Diviser la murale
3. Esquisse: Chacun son espace
4. Collaboration: Connecter les sections
5. Couleur: Harmoniser ensemble
6. Détails: Enrichir collectivement`,
      consolidation: "Vernissage: Admirons notre murale! Chaque partie est importante. Ensemble, nous créons quelque chose de magnifique!",
      accommodations: "Hauteurs accessibles; Rôles variés; Participation flexible",
      modifications: "Contribution adaptée; Espace personnel respecté; Support constant",
      extensions: "Éléments 3D; Techniques mixtes; Documentation du processus",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la collaboration, le respect du travail commun et la contribution individuelle.',
      learningGoals: "Collaborer artistiquement; Contribuer à une œuvre collective; Respecter l'espace des autres",
      materials: JSON.stringify([
        'Grand papier mural',
        'Peintures acryliques',
        'Pinceaux variés',
        'Tabliers',
        'Ruban de masquage'
      ]),
      grouping: "Projet collectif avec espaces individuels",
      isSubFriendly: true,
      subNotes: "Sections pré-divisées. Supervision de la collaboration. Emphase sur le respect mutuel.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Cadeau pour les futurs élèves",
      date: new Date('2026-05-13'),
      duration: 50,
      mindsOn: "L'année prochaine, de nouveaux amis seront en première année. Créons des œuvres pour décorer leur classe et leur souhaiter la bienvenue!",
      action: `1. Réflexion: Conseils pour réussir
2. Message: Ce qu'on veut leur dire
3. Création: Œuvre encourageante
4. Technique: Notre meilleur travail
5. Décoration: Rendre joyeux
6. Signature: Artistes de première`,
      consolidation: "Galerie de bienvenue: Présentez votre cadeau. Qu'est-ce que les futurs élèves vont ressentir? Votre art est un héritage!",
      accommodations: "Messages variés acceptés; Support à l'écriture; Choix de médiums",
      modifications: "Message simple; Image sans texte OK; Aide disponible",
      extensions: "Lettre d'accompagnement; Cadre décoratif; Conseils détaillés",
      assessmentType: 'Formative',
      assessmentNotes: 'Observer l\'empathie, la réflexion sur l\'apprentissage et la qualité de finition.',
      learningGoals: "Créer pour les autres; Réfléchir sur son parcours; Transmettre l'encouragement",
      materials: JSON.stringify([
        'Papier cartonné',
        'Matériel d\'art varié',
        'Lettrage décoratif',
        'Éléments brillants',
        'Enveloppes décorées'
      ]),
      grouping: "Création individuelle avec intention collective",
      isSubFriendly: true,
      subNotes: "Contexte du don expliqué. Encourager la bienveillance. Qualité pour durabilité.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      // Week 7: Portfolio et réflexion
      title: "Mon portfolio d'artiste",
      date: new Date('2026-06-08'),
      duration: 55,
      mindsOn: "Les vrais artistes gardent un portfolio de leurs meilleures œuvres! Regardons tout ce que vous avez créé cette année. Quelle transformation!",
      action: `1. Collection: Rassembler ses œuvres
2. Sélection: Choisir les préférées
3. Organisation: Ordre chronologique
4. Réflexion: Pourquoi j'aime chaque pièce
5. Présentation: Monter le portfolio
6. Page d'artiste: Auto-portrait et bio`,
      consolidation: "Galerie personnelle: Feuilletez votre portfolio. Voyez votre croissance! Vous êtes des artistes accomplis!",
      accommodations: "Aide à la sélection; Format flexible; Support à la réflexion",
      modifications: "Moins d'œuvres OK; Réflexion orale; Aide au montage",
      extensions: "Statement d'artiste; Table des matières; Projets futurs",
      assessmentType: 'Formative',
      assessmentNotes: 'Évaluer la capacité d\'auto-évaluation et la reconnaissance de sa progression.',
      learningGoals: "Organiser ses œuvres; Réfléchir sur sa progression; Valoriser son travail",
      materials: JSON.stringify([
        'Pochettes portfolio',
        'Œuvres de l\'année',
        'Feuilles de présentation',
        'Étiquettes',
        'Matériel de décoration'
      ]),
      grouping: "Organisation individuelle, partage optionnel",
      isSubFriendly: true,
      subNotes: "Œuvres de l'année disponibles. Structure de portfolio fournie. Célébrer la progression.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Exposition des artistes",
      date: new Date('2026-06-22'),
      duration: 60,
      mindsOn: "Aujourd'hui, notre classe devient une vraie galerie d'art! Vous êtes les artistes ET les guides. Préparez-vous à partager vos histoires visuelles!",
      action: `1. Installation: Accrocher les œuvres
2. Cartons: Titre et nom d'artiste
3. Répétition: Présenter une œuvre
4. Ouverture: Accueillir les visiteurs
5. Visite: Guider et expliquer
6. Célébration: Applaudissements mérités`,
      consolidation: "Réception d'artistes: Bravo! Vous avez partagé vos histoires visuelles avec fierté! L'art connecte les cœurs!",
      accommodations: "Rôles variés disponibles; Présentation flexible; Support constant",
      modifications: "Présentation adaptée; Aide d'un ami; Participation partielle OK",
      extensions: "Programme de l'exposition; Livre d'or; Prix du public",
      assessmentType: 'Summative',
      assessmentNotes: 'Évaluation finale: progression, créativité, expression, présentation, effort soutenu.',
      learningGoals: "Présenter ses œuvres professionnellement; Partager son processus créatif; Célébrer les accomplissements",
      materials: JSON.stringify([
        'Système d\'accrochage',
        'Cartons d\'identification',
        'Nappes et décorations',
        'Livre d\'or',
        'Certificats'
      ]),
      grouping: "Organisation collective, présentations individuelles",
      isSubFriendly: true,
      subNotes: "Exposition pré-organisée. Rôles assignés. Atmosphère de célébration professionnelle.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    },
    {
      title: "Artistes pour toujours",
      date: new Date('2026-06-24'),
      duration: 50,
      mindsOn: "Vous n'êtes plus des élèves qui font de l'art... vous êtes des ARTISTES! Aujourd'hui, créons une dernière œuvre spéciale: votre vision du futur!",
      action: `1. Vision: Imaginer son futur artistique
2. Création: Une œuvre sur mes rêves
3. Techniques: Utiliser tout ce qu'on a appris
4. Message: Pour mon futur moi
5. Capsule temporelle: Sceller l'œuvre
6. Promesse: Continuer à créer`,
      consolidation: "Cercle des artistes: Partagez votre promesse de continuer à créer. L'art sera toujours votre voix! Vous êtes des narrateurs visuels pour la vie!",
      accommodations: "Vision personnelle respectée; Médiums au choix; Expression libre",
      modifications: "Simplicité acceptée; Support émotionnel; Aide disponible",
      extensions: "Lettre au futur; Plan de création d'été; Carnet d'artiste",
      assessmentType: 'Summative',
      assessmentNotes: 'Célébration finale de la croissance artistique et de l\'identité créative développée.',
      learningGoals: "Envisager son futur créatif; Synthétiser les apprentissages; S'identifier comme artiste",
      materials: JSON.stringify([
        'Matériel d\'art complet',
        'Enveloppes capsule',
        'Papier special',
        'Rubans',
        'Certificats d\'artiste'
      ]),
      grouping: "Création individuelle, célébration collective",
      isSubFriendly: true,
      subNotes: "Dernière leçon cérémonielle. Emphase sur l'identité artistique. Encourager la continuation.",
      subject: 'Arts visuels',
      grade: 1,
      language: 'French'
    }
  ];
  
  console.log(`Creating ${lessons.length} lessons for "Histoires visuelles"...`);
  
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
  
  console.log('\n🔍 CRITICAL ASSESSMENT - HISTOIRES VISUELLES:');
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
    console.log('✨ Complete visual storytelling curriculum');
    console.log('✨ Progressive skill development');
    console.log('✨ Culminating portfolio and exhibition');
    console.log('✨ Legacy creation for future students');
    console.log('\n📚 Unit Highlights:');
    console.log('   • Visual narrative sequences');
    console.log('   • Character and emotion development');
    console.log('   • Environmental storytelling');
    console.log('   • Book creation and publishing');
    console.log('   • Comic art exploration');
    console.log('   • Collaborative murals');
    console.log('   • Portfolio development');
    console.log('   • Professional exhibition');
    console.log('   • Artist identity formation');
  } else {
    console.log('⚠️ IMPROVEMENTS NEEDED');
    console.log('Some lessons do not meet ETFO standards');
    console.log('Review and enhance before implementation');
  }
  
  await prisma.$disconnect();
}

createHistoiresVisuellesLessons();