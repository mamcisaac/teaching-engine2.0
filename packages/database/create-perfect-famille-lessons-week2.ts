import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PERFECT LESSON PLANS - Week 2: Ma famille et ma communauté
 * Grade 1 French Immersion - Sciences humaines
 * 
 * Week 2 Focus: Family diversity and roles
 * Building on Week 1's foundation to explore how families are different yet similar
 * 
 * Created through intelligent pedagogical design following ETFO best practices
 * Each lesson carefully crafted for 6-year-old developmental needs
 */

async function createWeek2LessonPlans() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEK 2');
  console.log('Unit: Ma famille et ma communauté');
  console.log('Focus: Diversity and Roles in Families');
  console.log('=========================================\n');

  // Get the unit plan
  const unitPlan = await prisma.unitPlan.findFirst({
    where: {
      title: 'Ma famille et ma communauté'
    },
    include: {
      expectations: {
        include: {
          expectation: true
        }
      }
    }
  });

  if (!unitPlan) {
    console.log('❌ Unit plan not found');
    return;
  }

  console.log(`Found unit: ${unitPlan.title}`);
  console.log(`Creating 4 lessons for Week 2\n`);

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'test.teacher@pei.ca' }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  // Clear existing Week 2 lessons for this unit
  const week2Start = new Date('2025-09-08');
  const week2End = new Date('2025-09-12');
  
  await prisma.eTFOLessonPlan.deleteMany({
    where: {
      unitPlanId: unitPlan.id,
      date: {
        gte: week2Start,
        lte: week2End
      }
    }
  });

  // LESSON 5: Différentes familles, même amour
  const lesson5 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Différentes familles, même amour',
      titleFr: 'Différentes familles, même amour',
      date: new Date('2025-09-08'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Reconnaître différentes structures familiales
• Comprendre que l'amour est présent dans toutes les familles
• Développer le respect pour la diversité familiale
• Utiliser le vocabulaire de l'inclusion`,
      
      learningGoalsFr: `Les élèves vont:
• Reconnaître différentes structures familiales
• Comprendre que l'amour est présent dans toutes les familles
• Développer le respect pour la diversité familiale
• Utiliser le vocabulaire de l'inclusion`,
      
      // MINDS ON (10 minutes)
      mindsOn: `Puzzle des familles (10 min):
1. Révision du mur des traditions (semaine 1)
2. Présenter 4 puzzles de familles différentes:
   - Famille avec 2 mamans et enfants
   - Famille monoparentale avec papa
   - Famille multigénérationnelle (grands-parents)
   - Famille avec parents et enfant adopté
3. Groupes de 4-5 assemblent un puzzle
4. Présentation: "Voici une famille!"
5. Observation guidée:
   "Toutes ces familles sont différentes"
   "Qu'est-ce qui est pareil?" (amour, soin, ensemble)`,
      
      mindsOnFr: `Puzzle des familles (10 min):
1. Révision du mur des traditions (semaine 1)
2. Présenter 4 puzzles de familles différentes:
   - Famille avec 2 mamans et enfants
   - Famille monoparentale avec papa
   - Famille multigénérationnelle (grands-parents)
   - Famille avec parents et enfant adopté
3. Groupes de 4-5 assemblent un puzzle
4. Présentation: "Voici une famille!"
5. Observation guidée:
   "Toutes ces familles sont différentes"
   "Qu'est-ce qui est pareil?" (amour, soin, ensemble)`,
      
      // ACTION (25 minutes)
      action: `Livre vivant des familles (25 min):

PARTIE 1: Histoire interactive (10 min)
• Livre: "Familles du monde" ou création maison
• Arrêts fréquents pour observations:
  "Cette famille a deux papas!"
  "Cette famille vit avec grand-maman!"
  "Cette famille a un enfant!"
  "Cette famille a cinq enfants!"
• Refrain répété: "C'est une famille avec de l'amour!"
• Gestes pour "famille" et "amour"

PARTIE 2: Notre livre de classe (15 min)
• Chaque enfant reçoit une page de livre
• En-tête: "Une famille c'est..."
• Choix d'activité:
  A) Dessiner sa propre famille
  B) Dessiner une famille du livre
  C) Créer une famille imaginaire
• Ajouter un cœur pour montrer l'amour
• Écriture émergente ou dictée: mot clé
• Assembler en livre de classe

Différenciation:
- Soutien: Formes pré-découpées pour personnages
- Avancé: Écrire une phrase sur la famille
- Choix: Type de famille à représenter`,
      
      actionFr: `Livre vivant des familles (25 min):

PARTIE 1: Histoire interactive (10 min)
• Livre: "Familles du monde" ou création maison
• Arrêts fréquents pour observations:
  "Cette famille a deux papas!"
  "Cette famille vit avec grand-maman!"
  "Cette famille a un enfant!"
  "Cette famille a cinq enfants!"
• Refrain répété: "C'est une famille avec de l'amour!"
• Gestes pour "famille" et "amour"

PARTIE 2: Notre livre de classe (15 min)
• Chaque enfant reçoit une page de livre
• En-tête: "Une famille c'est..."
• Choix d'activité:
  A) Dessiner sa propre famille
  B) Dessiner une famille du livre
  C) Créer une famille imaginaire
• Ajouter un cœur pour montrer l'amour
• Écriture émergente ou dictée: mot clé
• Assembler en livre de classe

Différenciation:
- Soutien: Formes pré-découpées pour personnages
- Avancé: Écrire une phrase sur la famille
- Choix: Type de famille à représenter`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Cercle d'amour familial (10 min):
• Assis en cercle avec le nouveau livre
• Tourner les pages ensemble
• Pour chaque page: "Regardez cette belle famille!"
• Compter les différents types de familles
• Jeu: "Famille, famille, amour!" (comme canard, canard, oie)
  - Un enfant marche autour du cercle
  - Touche les têtes: "famille, famille..."
  - Dit "amour!" et court
• Chanson finale: "Les familles, les familles,
  Toutes différentes, toutes spéciales,
  Avec de l'amour, avec de l'amour,
  C'est ça une famille!"
• Livre placé dans notre bibliothèque de classe`,
      
      consolidationFr: `Cercle d'amour familial (10 min):
• Assis en cercle avec le nouveau livre
• Tourner les pages ensemble
• Pour chaque page: "Regardez cette belle famille!"
• Compter les différents types de familles
• Jeu: "Famille, famille, amour!" (comme canard, canard, oie)
  - Un enfant marche autour du cercle
  - Touche les têtes: "famille, famille..."
  - Dit "amour!" et court
• Chanson finale: "Les familles, les familles,
  Toutes différentes, toutes spéciales,
  Avec de l'amour, avec de l'amour,
  C'est ça une famille!"
• Livre placé dans notre bibliothèque de classe`,
      
      materials: {
        required: [
          '4 puzzles de familles diverses (10-12 pièces)',
          'Livre sur la diversité familiale',
          'Pages de livre pré-imprimées',
          'Crayons et marqueurs',
          'Autocollants cœurs',
          'Formes de personnages pré-découpées',
          'Reliure ou anneaux pour assembler',
          'Colle'
        ],
        optional: [
          'Photos de familles diverses',
          'Paillettes pour décoration',
          'Tissu pour couverture du livre'
        ]
      },
      
      accommodations: {
        physical: 'Puzzles avec grosses pièces, support pour écriture',
        cognitive: 'Vocabulaire simplifié, répétition des concepts clés',
        language: 'Support visuel constant, gestes pour vocabulaire',
        social: 'Choix de partage, travail individuel accepté'
      },
      
      modifications: {
        forIEP: 'Objectif: reconnaître 2 types de familles, participer au jeu',
        alternativeActivities: 'Coller des images au lieu de dessiner'
      },
      
      extensions: {
        earlyFinishers: 'Créer une deuxième page, décorer la couverture',
        advancedLearners: 'Écrire "Cette famille aime..." avec détails',
        homeConnection: 'Partager le concept de diversité familiale à la maison'
      },
      
      assessmentType: 'Observation et production',
      
      assessmentNotes: `Observer et documenter:
• Réaction à la diversité familiale
• Utilisation du vocabulaire d'inclusion
• Respect démontré pour toutes les familles
• Participation aux discussions
• Représentation dans le dessin
• Interaction positive avec le matériel`,
      
      differentiationStrategies: {
        forStruggling: 'Puzzles plus simples, formes pour tracer, support constant',
        forAdvanced: 'Création de familles complexes, écriture de phrases, aide aux pairs',
        byInterest: 'Choix du type de famille, style artistique libre',
        byLearningProfile: 'Visuel: images multiples; Kinesthésique: puzzles et jeu; Social: travail de groupe'
      },
      
      engagementHooks: {
        opening: 'Puzzles mystères de familles',
        duringLesson: 'Livre interactif, création personnelle',
        closing: 'Jeu actif et chanson'
      },
      
      formativeCheckpoints: {
        understanding: 'Questions pendant l\'histoire',
        respect: 'Observation des réactions à la diversité',
        vocabulary: 'Utilisation des mots "famille" et "amour"'
      },
      
      interventionStrategies: {
        tier1: 'Modélisation du respect et de l\'inclusion',
        tier2: 'Discussion en petit groupe sur les familles',
        tier3: 'Support individuel pour l\'acceptation'
      },
      
      performanceOpportunities: 'Présentation du puzzle, contribution au livre, participation au jeu',
      
      priorKnowledgeCheck: 'Rappel: nos familles de la semaine dernière, nos traditions',
      
      reflectionActivities: {
        student: 'Nommer ce qui rend une famille spéciale',
        teacher: 'Noter les attitudes envers la diversité'
      },
      
      wheretoFramework: {
        W: 'Nous découvrons que les familles sont toutes différentes et spéciales',
        H: 'Puzzles intrigants et livre coloré',
        E: 'Exploration active de la diversité',
        R: 'Livre de classe pour réfléchir',
        E2: 'Observation du respect et de la compréhension',
        T: 'Multiples façons d\'explorer les familles',
        O: 'Puzzles → Histoire → Création → Célébration'
      },
      
      grouping: 'Petits groupes → Groupe entier → Individuel → Groupe entier',
      
      isSubFriendly: true,
      
      subNotes: `Leçon sur la diversité familiale et l'inclusion.
Focus: Toutes les familles sont différentes mais ont de l'amour.
Activité principale: Création d'un livre de classe sur les familles.
Important: Message positif sur TOUTES les structures familiales.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 5: ${lesson5.title}`);

  // LESSON 6: Les grands et les petits dans ma famille
  const lesson6 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Les grands et les petits dans ma famille',
      titleFr: 'Les grands et les petits dans ma famille',
      date: new Date('2025-09-09'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Identifier les différentes générations dans les familles
• Comprendre les rôles des grands-parents, parents et enfants
• Reconnaître comment chaque génération contribue
• Apprécier la sagesse des aînés`,
      
      learningGoalsFr: `Les élèves vont:
• Identifier les différentes générations dans les familles
• Comprendre les rôles des grands-parents, parents et enfants
• Reconnaître comment chaque génération contribue
• Apprécier la sagesse des aînés`,
      
      // MINDS ON (12 minutes)
      mindsOn: `Photos mystères des générations (12 min):
1. Montrer 3 photos mystères (dos tourné):
   - Photo de bébé
   - Photo de parent
   - Photo de grand-parent
2. Indices pour deviner:
   "Cette personne ne marche pas encore" (bébé)
   "Cette personne travaille/conduit" (parent)  
   "Cette personne a des cheveux blancs" (grand-parent)
3. Révéler et discuter:
   "Qui a un bébé dans sa famille?"
   "Qui a des grands-parents?"
4. Ligne du temps physique:
   - 3 enfants représentent: bébé, parent, grand-parent
   - Se placer en ordre d'âge
   - Classe aide: "Plus jeune! Plus vieux!"
5. Concept: "Les familles ont des personnes de différents âges"`,
      
      mindsOnFr: `Photos mystères des générations (12 min):
1. Montrer 3 photos mystères (dos tourné):
   - Photo de bébé
   - Photo de parent
   - Photo de grand-parent
2. Indices pour deviner:
   "Cette personne ne marche pas encore" (bébé)
   "Cette personne travaille/conduit" (parent)  
   "Cette personne a des cheveux blancs" (grand-parent)
3. Révéler et discuter:
   "Qui a un bébé dans sa famille?"
   "Qui a des grands-parents?"
4. Ligne du temps physique:
   - 3 enfants représentent: bébé, parent, grand-parent
   - Se placer en ordre d'âge
   - Classe aide: "Plus jeune! Plus vieux!"
5. Concept: "Les familles ont des personnes de différents âges"`,
      
      // ACTION (23 minutes)
      action: `Arbre générationnel de classe (23 min):

PARTIE 1: Visiteur spécial (8 min)
• Grand-parent ou aîné de la communauté visite
• Apporte objet de son enfance
• Raconte UNE histoire simple de "quand j'étais petit"
• Enfants posent 2-3 questions
• Photo avec la classe

PARTIE 2: Notre arbre des générations (15 min)
• Grand arbre dessiné sur papier chart
• 3 niveaux marqués:
  - Bas: Enfants (nous!)
  - Milieu: Parents
  - Haut: Grands-parents
• Chaque enfant:
  - Dessine/colle sa photo en bas
  - Dessine 1-2 personnes de sa famille aux autres niveaux
  - Utilise couleurs différentes pour chaque génération
• Options:
  - Photos apportées de la maison
  - Dessins simples
  - Symboles (cœurs, étoiles)

Différenciation:
- Soutien: Aide pour placer sur l'arbre
- Avancé: Ajouter arrière-grands-parents
- Sensibilité: OK si pas de grands-parents (autres aînés)`,
      
      actionFr: `Arbre générationnel de classe (23 min):

PARTIE 1: Visiteur spécial (8 min)
• Grand-parent ou aîné de la communauté visite
• Apporte objet de son enfance
• Raconte UNE histoire simple de "quand j'étais petit"
• Enfants posent 2-3 questions
• Photo avec la classe

PARTIE 2: Notre arbre des générations (15 min)
• Grand arbre dessiné sur papier chart
• 3 niveaux marqués:
  - Bas: Enfants (nous!)
  - Milieu: Parents
  - Haut: Grands-parents
• Chaque enfant:
  - Dessine/colle sa photo en bas
  - Dessine 1-2 personnes de sa famille aux autres niveaux
  - Utilise couleurs différentes pour chaque génération
• Options:
  - Photos apportées de la maison
  - Dessins simples
  - Symboles (cœurs, étoiles)

Différenciation:
- Soutien: Aide pour placer sur l'arbre
- Avancé: Ajouter arrière-grands-parents
- Sensibilité: OK si pas de grands-parents (autres aînés)`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Chanson des générations (10 min):
• Observer l'arbre complété ensemble
• Compter combien de grands-parents, parents, enfants
• Chanson avec gestes (air: Frère Jacques):
  "Les grands-parents, les grands-parents, (mains en haut)
   Sont plus vieux, sont plus vieux, (barbe/cheveux)
   Les parents au milieu, les parents au milieu, (mains au milieu)
   Prennent soin, prennent soin, (câlin)
   Les enfants, les enfants, (mains en bas)
   Grandissent bien, grandissent bien!" (grandir)
• Jeu rapide: Teacher dit "Grands-parents!" - lever les mains
  "Parents!" - mains au milieu
  "Enfants!" - toucher le sol
• Message: "Chaque génération est importante dans la famille"
• Remercier le visiteur avec applaudissements`,
      
      consolidationFr: `Chanson des générations (10 min):
• Observer l'arbre complété ensemble
• Compter combien de grands-parents, parents, enfants
• Chanson avec gestes (air: Frère Jacques):
  "Les grands-parents, les grands-parents, (mains en haut)
   Sont plus vieux, sont plus vieux, (barbe/cheveux)
   Les parents au milieu, les parents au milieu, (mains au milieu)
   Prennent soin, prennent soin, (câlin)
   Les enfants, les enfants, (mains en bas)
   Grandissent bien, grandissent bien!" (grandir)
• Jeu rapide: Teacher dit "Grands-parents!" - lever les mains
  "Parents!" - mains au milieu
  "Enfants!" - toucher le sol
• Message: "Chaque génération est importante dans la famille"
• Remercier le visiteur avec applaudissements`,
      
      materials: {
        required: [
          '3 photos mystères (générations)',
          'Grand papier avec arbre dessiné',
          'Photos des enfants',
          'Matériel de dessin',
          'Colle',
          'Marqueurs de couleur',
          'Appareil photo pour visiteur',
          'Objet du visiteur'
        ],
        optional: [
          'Photos de famille apportées',
          'Autocollants générationnels',
          'Cadre pour photo de classe'
        ]
      },
      
      accommodations: {
        physical: 'Placement flexible pour l\'arbre, support pour dessiner',
        cognitive: 'Concepts simplifiés à 3 générations, aide visuelle',
        language: 'Vocabulaire avec gestes, répétition des termes',
        social: 'Participation au niveau de confort, sensibilité aux situations familiales'
      },
      
      modifications: {
        forIEP: 'Identifier 2 générations, participation partielle acceptée',
        alternativeActivities: 'Observer et applaudir au lieu de créer'
      },
      
      extensions: {
        earlyFinishers: 'Ajouter plus de détails, dessiner les animaux de famille',
        advancedLearners: 'Créer une ligne du temps familiale, écrire les âges',
        homeConnection: 'Interviewer un grand-parent ou aîné'
      },
      
      assessmentType: 'Observation et interaction',
      
      assessmentNotes: `Observer et documenter:
• Compréhension des générations
• Respect pour les aînés durant la visite
• Placement approprié sur l'arbre
• Vocabulaire générationnel utilisé
• Participation à la chanson et au jeu
• Sensibilité aux différentes structures`,
      
      differentiationStrategies: {
        forStruggling: 'Support visuel pour les générations, aide au placement, vocabulaire de base',
        forAdvanced: 'Générations supplémentaires, détails sur les rôles, écriture d\'âges',
        byInterest: 'Choix de représentation (dessin/photo/symbole)',
        byLearningProfile: 'Visuel: photos et arbre; Kinesthésique: jeu de mouvement; Auditif: chanson'
      },
      
      engagementHooks: {
        opening: 'Photos mystères intrigantes',
        duringLesson: 'Visiteur spécial avec histoire',
        closing: 'Chanson active avec mouvements'
      },
      
      formativeCheckpoints: {
        understanding: 'Placement sur l\'arbre',
        vocabulary: 'Utilisation des termes générationnels',
        respect: 'Interaction avec le visiteur'
      },
      
      interventionStrategies: {
        tier1: 'Support visuel pour tous',
        tier2: 'Pratique en petit groupe des concepts',
        tier3: 'Support individuel pour les situations familiales complexes'
      },
      
      performanceOpportunities: 'Questions au visiteur, présentation de l\'arbre, participation à la chanson',
      
      priorKnowledgeCheck: 'Rappel du livre des familles diverses d\'hier',
      
      reflectionActivities: {
        student: 'Dire une chose apprise du visiteur',
        teacher: 'Noter la compréhension des générations'
      },
      
      wheretoFramework: {
        W: 'Nous explorons les différentes générations dans les familles',
        H: 'Photos mystères et visiteur spécial',
        E: 'Création de l\'arbre générationnel',
        R: 'Observer l\'arbre complet',
        E2: 'Vérifier le placement et la compréhension',
        T: 'Différentes façons de représenter',
        O: 'Mystère → Visiteur → Création → Chanson'
      },
      
      grouping: 'Groupe entier → Groupe entier avec visiteur → Individuel → Groupe entier',
      
      isSubFriendly: true,
      
      subNotes: `Focus: Les générations dans les familles.
Visiteur: [Nom] arrive à 9h15 (confirmé).
Activité principale: Arbre générationnel de classe.
Important: Sensibilité pour enfants sans grands-parents.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 6: ${lesson6.title}`);

  // LESSON 7: Comment les familles s'entraident
  const lesson7 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Comment les familles s\'entraident',
      titleFr: 'Comment les familles s\'entraident',
      date: new Date('2025-09-11'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Identifier différentes façons dont les familles s'entraident
• Reconnaître l'importance de la coopération familiale
• Comprendre que chacun peut contribuer selon ses capacités
• Développer l'empathie et le désir d'aider`,
      
      learningGoalsFr: `Les élèves vont:
• Identifier différentes façons dont les familles s'entraident
• Reconnaître l'importance de la coopération familiale
• Comprendre que chacun peut contribuer selon ses capacités
• Développer l'empathie et le désir d'aider`,
      
      // MINDS ON (10 minutes)
      mindsOn: `La chaîne d'entraide (10 min):
1. Debout en cercle, se tenir les mains
2. Enseignant commence: "Dans ma famille, je..."
   - Serre doucement la main droite
   - "...aide en préparant le souper"
3. L'enfant à droite continue:
   - Sent la pression, dit comment il aide
   - Passe au suivant
4. La "vague d'aide" fait le tour
5. Observation: "Wow! Regardez toutes les façons d'aider!"
6. Deuxième tour rapide:
   - Cette fois: "Ma famille m'aide en..."
   - Exemples: me lisant des histoires, me consolant
7. Message: "Nous aidons ET nous recevons de l'aide"`,
      
      mindsOnFr: `La chaîne d'entraide (10 min):
1. Debout en cercle, se tenir les mains
2. Enseignant commence: "Dans ma famille, je..."
   - Serre doucement la main droite
   - "...aide en préparant le souper"
3. L'enfant à droite continue:
   - Sent la pression, dit comment il aide
   - Passe au suivant
4. La "vague d'aide" fait le tour
5. Observation: "Wow! Regardez toutes les façons d'aider!"
6. Deuxième tour rapide:
   - Cette fois: "Ma famille m'aide en..."
   - Exemples: me lisant des histoires, me consolant
7. Message: "Nous aidons ET nous recevons de l'aide"`,
      
      // ACTION (25 minutes)
      action: `Mains aidantes de notre classe (25 min):

PARTIE 1: Centres d'entraide (15 min)
4 centres rotatifs (4 min chacun):

Centre 1: "Cuisine familiale"
• Préparer une "salade" (papier déchiré coloré)
• Mettre la table avec vaisselle de jeu
• "Chacun aide à sa façon"

Centre 2: "Réconfort"
• Peluches et poupées "tristes"
• Pratiquer: consoler, câliner, écouter
• Couvertures et mouchoirs

Centre 3: "Jardinage ensemble"
• Planter des "graines" (boutons) dans terre de jeu
• Arroser avec vaporisateurs
• "Grand-papa montre, je fais"

Centre 4: "Ménage en équipe"
• Trier des objets par couleur/taille
• Plier des serviettes
• "Plus rapide ensemble!"

PARTIE 2: Mains aidantes (10 min)
• Tracer sa main sur papier de couleur
• Dans chaque doigt, dessiner/écrire une façon d'aider
• Pouce = ce que je fais bien
• Décorer avec cœurs
• Afficher autour de notre arbre communautaire

Différenciation:
- Soutien: Images d'aide à coller, aide pour tracer
- Avancé: Écrire des mots, ajouter qui on aide
- Choix: Méthode de décoration`,
      
      actionFr: `Mains aidantes de notre classe (25 min):

PARTIE 1: Centres d'entraide (15 min)
4 centres rotatifs (4 min chacun):

Centre 1: "Cuisine familiale"
• Préparer une "salade" (papier déchiré coloré)
• Mettre la table avec vaisselle de jeu
• "Chacun aide à sa façon"

Centre 2: "Réconfort"
• Peluches et poupées "tristes"
• Pratiquer: consoler, câliner, écouter
• Couvertures et mouchoirs

Centre 3: "Jardinage ensemble"
• Planter des "graines" (boutons) dans terre de jeu
• Arroser avec vaporisateurs
• "Grand-papa montre, je fais"

Centre 4: "Ménage en équipe"
• Trier des objets par couleur/taille
• Plier des serviettes
• "Plus rapide ensemble!"

PARTIE 2: Mains aidantes (10 min)
• Tracer sa main sur papier de couleur
• Dans chaque doigt, dessiner/écrire une façon d'aider
• Pouce = ce que je fais bien
• Décorer avec cœurs
• Afficher autour de notre arbre communautaire

Différenciation:
- Soutien: Images d'aide à coller, aide pour tracer
- Avancé: Écrire des mots, ajouter qui on aide
- Choix: Méthode de décoration`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Musée des mains aidantes (10 min):
• Marche silencieuse pour voir toutes les mains
• Musique douce "Nous sommes une famille"
• Arrêts pour observations:
  "Je vois beaucoup d'aide pour la cuisine!"
  "Plusieurs enfants aident avec les animaux!"
  "L'aide au ménage est populaire!"
• Retour au cercle
• Jeu "Popcorn d'aide":
  - Un enfant dit une façon d'aider
  - "Saute" (petit saut) si tu fais ça aussi
• Message final: "Quand tout le monde aide un peu,
  la famille est heureuse!"
• Défi: "Ce soir, faites UNE chose pour aider à la maison"`,
      
      consolidationFr: `Musée des mains aidantes (10 min):
• Marche silencieuse pour voir toutes les mains
• Musique douce "Nous sommes une famille"
• Arrêts pour observations:
  "Je vois beaucoup d'aide pour la cuisine!"
  "Plusieurs enfants aident avec les animaux!"
  "L'aide au ménage est populaire!"
• Retour au cercle
• Jeu "Popcorn d'aide":
  - Un enfant dit une façon d'aider
  - "Saute" (petit saut) si tu fais ça aussi
• Message final: "Quand tout le monde aide un peu,
  la famille est heureuse!"
• Défi: "Ce soir, faites UNE chose pour aider à la maison"`,
      
      materials: {
        required: [
          'Matériel pour 4 centres:',
          '- Papier coloré, vaisselle de jeu',
          '- Peluches, couvertures, mouchoirs',
          '- Boutons, bacs, terre de jeu, vaporisateurs',
          '- Objets à trier, serviettes',
          'Papier pour tracer les mains',
          'Crayons et marqueurs',
          'Ciseaux',
          'Colle',
          'Autocollants cœurs',
          'Images d\'aide (optionnel)'
        ],
        optional: [
          'Tabliers pour centre cuisine',
          'Vraies plantes',
          'Musique familiale douce'
        ]
      },
      
      accommodations: {
        physical: 'Centres accessibles, outils adaptés, positions flexibles',
        cognitive: 'Instructions simples avec démonstration, rotation guidée',
        language: 'Vocabulaire visuel affiché, gestes pour actions',
        social: 'Travail en paire possible, participation graduelle'
      },
      
      modifications: {
        forIEP: 'Participer à 2 centres, identifier 3 façons d\'aider',
        alternativeActivities: 'Observer et encourager au lieu de faire'
      },
      
      extensions: {
        earlyFinishers: 'Créer une deuxième main, aider aux centres',
        advancedLearners: 'Écrire des phrases complètes, créer une affiche d\'entraide',
        homeConnection: 'Carte de "défi d\'aide" pour la maison'
      },
      
      assessmentType: 'Observation pratique',
      
      assessmentNotes: `Observer et documenter:
• Participation active aux centres
• Identification de façons d'aider
• Coopération avec les pairs
• Empathie démontrée (centre réconfort)
• Vocabulaire d'entraide utilisé
• Fierté dans le partage`,
      
      differentiationStrategies: {
        forStruggling: 'Support constant aux centres, images pour la main, encouragement',
        forAdvanced: 'Rôles de leader aux centres, écriture de phrases, aide aux autres',
        byInterest: 'Choix du centre préféré pour plus de temps',
        byLearningProfile: 'Kinesthésique: centres actifs; Visuel: démonstrations; Social: travail d\'équipe'
      },
      
      engagementHooks: {
        opening: 'Chaîne physique d\'entraide',
        duringLesson: 'Centres pratiques variés',
        closing: 'Jeu de popcorn actif'
      },
      
      formativeCheckpoints: {
        understanding: 'Observation aux centres',
        application: 'Contenu des mains aidantes',
        empathy: 'Comportement au centre réconfort'
      },
      
      interventionStrategies: {
        tier1: 'Modélisation à chaque centre',
        tier2: 'Support en petit groupe pour identifier l\'aide',
        tier3: 'Accompagnement individuel aux centres'
      },
      
      performanceOpportunities: 'Démonstration aux centres, présentation de la main, participation au jeu',
      
      priorKnowledgeCheck: 'Rappel: les générations s\'entraident',
      
      reflectionActivities: {
        student: 'Nommer sa façon préférée d\'aider',
        teacher: 'Noter les types d\'aide les plus mentionnés'
      },
      
      wheretoFramework: {
        W: 'Nous découvrons comment les familles s\'entraident',
        H: 'Chaîne d\'entraide physique',
        E: 'Exploration par centres pratiques',
        R: 'Mains aidantes pour réfléchir',
        E2: 'Observation de la participation et compréhension',
        T: 'Différents centres pour différents intérêts',
        O: 'Cercle → Centres → Création → Célébration'
      },
      
      grouping: 'Cercle entier → Petits groupes rotatifs → Individuel → Groupe entier',
      
      isSubFriendly: true,
      
      subNotes: `Focus: L'entraide familiale.
4 centres préparés (voir plan).
Rotation aux 4 minutes (timer).
Activité principale: Mains aidantes à afficher.
Important: Valoriser toutes les formes d'aide.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 7: ${lesson7.title}`);

  // LESSON 8: Célébration de nos familles (Mini-culmination Week 2)
  const lesson8 = await prisma.eTFOLessonPlan.create({
    data: {
      userId: user.id,
      unitPlanId: unitPlan.id,
      title: 'Célébration de nos familles!',
      titleFr: 'Célébration de nos familles!',
      date: new Date('2025-09-12'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'French',
      
      learningGoals: `Les élèves vont:
• Célébrer l'apprentissage des deux premières semaines
• Partager leurs connaissances sur les familles
• Présenter leur travail avec fierté
• Renforcer les liens famille-école`,
      
      learningGoalsFr: `Les élèves vont:
• Célébrer l'apprentissage des deux premières semaines
• Partager leurs connaissances sur les familles
• Présenter leur travail avec fierté
• Renforcer les liens famille-école`,
      
      // MINDS ON (8 minutes)
      mindsOn: `Préparation de notre musée (8 min):
1. Annonce excitante: "Aujourd'hui, c'est notre célébration!"
2. Tour rapide de nos créations:
   - Arbre communautaire (semaine 1)
   - Mur des traditions
   - Livre des familles diverses
   - Arbre générationnel
   - Mains aidantes
3. Pratique de présentation:
   - Chaque rangée pratique UNE chose à dire
   - "Voici notre..." "Nous avons appris..."
4. Préparation de l'espace:
   - Placer les travaux en "stations"
   - Ajouter des flèches et décorations
5. Chanson de bienvenue à pratiquer:
   "Bienvenue à nos familles,
    Venez voir nos merveilles!"`,
      
      mindsOnFr: `Préparation de notre musée (8 min):
1. Annonce excitante: "Aujourd'hui, c'est notre célébration!"
2. Tour rapide de nos créations:
   - Arbre communautaire (semaine 1)
   - Mur des traditions
   - Livre des familles diverses
   - Arbre générationnel
   - Mains aidantes
3. Pratique de présentation:
   - Chaque rangée pratique UNE chose à dire
   - "Voici notre..." "Nous avons appris..."
4. Préparation de l'espace:
   - Placer les travaux en "stations"
   - Ajouter des flèches et décorations
5. Chanson de bienvenue à pratiquer:
   "Bienvenue à nos familles,
    Venez voir nos merveilles!"`,
      
      // ACTION (27 minutes)
      action: `Musée vivant des familles (27 min):

PARTIE 1: Accueil des invités (5 min)
• Familles arrivent (15 min de visite prévue)
• Enfants: Chanson de bienvenue
• Distribution de "passeports" aux visiteurs
• Explication: 5 stations à visiter

PARTIE 2: Visites guidées (15 min)
5 stations avec guides enfants:
1. Arbre communautaire - "Notre classe famille"
2. Traditions - "Nos traditions spéciales"
3. Livre des familles - "Toutes différentes"
4. Générations - "Grands et petits"
5. Mains aidantes - "Comment nous aidons"

• 3 minutes par station
• Enfants-guides expliquent (2-3 par station)
• Visiteurs posent questions
• Tampon/autocollant sur passeport

PARTIE 3: Activité collective (7 min)
• Création d'une guirlande familiale
• Chaque famille décore un anneau de papier
• Écrire/dessiner un mot sur la famille
• Assembler en grande chaîne
• Message: "Toutes nos familles connectées!"

Différenciation:
- Soutien: Jumelage pour présentation
- Avancé: Rôle de guide principal
- Choix: Station préférée à présenter`,
      
      actionFr: `Musée vivant des familles (27 min):

PARTIE 1: Accueil des invités (5 min)
• Familles arrivent (15 min de visite prévue)
• Enfants: Chanson de bienvenue
• Distribution de "passeports" aux visiteurs
• Explication: 5 stations à visiter

PARTIE 2: Visites guidées (15 min)
5 stations avec guides enfants:
1. Arbre communautaire - "Notre classe famille"
2. Traditions - "Nos traditions spéciales"
3. Livre des familles - "Toutes différentes"
4. Générations - "Grands et petits"
5. Mains aidantes - "Comment nous aidons"

• 3 minutes par station
• Enfants-guides expliquent (2-3 par station)
• Visiteurs posent questions
• Tampon/autocollant sur passeport

PARTIE 3: Activité collective (7 min)
• Création d'une guirlande familiale
• Chaque famille décore un anneau de papier
• Écrire/dessiner un mot sur la famille
• Assembler en grande chaîne
• Message: "Toutes nos familles connectées!"

Différenciation:
- Soutien: Jumelage pour présentation
- Avancé: Rôle de guide principal
- Choix: Station préférée à présenter`,
      
      // CONSOLIDATION (10 minutes)
      consolidation: `Cercle de gratitude (10 min):
• Familles et enfants en grand cercle
• Chanson finale ensemble:
  "Merci à nos familles, (applaudir)
   Pour tout votre amour, (mains sur cœur)
   Nous sommes une communauté, (se tenir les mains)
   Ensemble pour toujours!" (lever les mains)
• Tour de gratitude rapide:
  - Enfants: "Merci d'être venus!"
  - Parents: "Merci de nous inviter!"
• Photo de groupe avec la guirlande
• Distribution:
  - Certificat "Expert des familles" pour chaque enfant
  - Petit livret souvenir des 2 semaines
• Message de clôture:
  "Nous continuerons à explorer notre communauté!"
• Applaudissements et au revoir musical`,
      
      consolidationFr: `Cercle de gratitude (10 min):
• Familles et enfants en grand cercle
• Chanson finale ensemble:
  "Merci à nos familles, (applaudir)
   Pour tout votre amour, (mains sur cœur)
   Nous sommes une communauté, (se tenir les mains)
   Ensemble pour toujours!" (lever les mains)
• Tour de gratitude rapide:
  - Enfants: "Merci d'être venus!"
  - Parents: "Merci de nous inviter!"
• Photo de groupe avec la guirlande
• Distribution:
  - Certificat "Expert des familles" pour chaque enfant
  - Petit livret souvenir des 2 semaines
• Message de clôture:
  "Nous continuerons à explorer notre communauté!"
• Applaudissements et au revoir musical`,
      
      materials: {
        required: [
          'Tous les travaux des 2 semaines affichés',
          'Passeports visiteurs (cartes)',
          'Tampons ou autocollants',
          'Anneaux de papier pour guirlande',
          'Marqueurs et crayons',
          'Ruban ou ficelle pour assembler',
          'Certificats pré-imprimés',
          'Livrets souvenirs',
          'Appareil photo',
          'Flèches directionnelles',
          'Musique d\'ambiance'
        ],
        optional: [
          'Ballons pour décoration',
          'Rafraîchissements simples',
          'Microphone pour présentations'
        ]
      },
      
      accommodations: {
        physical: 'Espaces accessibles entre stations, sièges disponibles',
        cognitive: 'Présentations simples, support des pairs',
        language: 'Phrases courtes préparées, gestes acceptés',
        social: 'Rôles variés selon confort, participation flexible'
      },
      
      modifications: {
        forIEP: 'Rôle d\'assistant, présentation d\'une phrase, participation partielle',
        alternativeActivities: 'Accueillir aux portes, distribuer les passeports'
      },
      
      extensions: {
        earlyFinishers: 'Aider à guider, décorer l\'espace, accueillir',
        advancedLearners: 'MC de l\'événement, présentation bilingue',
        homeConnection: 'Livret souvenir à compléter à la maison'
      },
      
      assessmentType: 'Performance authentique',
      
      assessmentNotes: `Observer et documenter:
• Capacité à présenter leur travail
• Fierté démontrée
• Interaction avec les visiteurs
• Utilisation du vocabulaire appris
• Collaboration durant l'événement
• Participation à la célébration

NOTE: Évaluation sommative de la progression des 2 semaines`,
      
      differentiationStrategies: {
        forStruggling: 'Phrases simples fournies, jumelage avec ami, rôle de support',
        forAdvanced: 'Leadership de station, explication détaillée, aide aux autres',
        byInterest: 'Choix de station à présenter, style de présentation',
        byLearningProfile: 'Verbal: présentation orale; Kinesthésique: démonstration; Visuel: pointer les travaux'
      },
      
      engagementHooks: {
        opening: 'Excitation de la célébration',
        duringLesson: 'Vrais visiteurs, rôles importants',
        closing: 'Certificats et photos'
      },
      
      formativeCheckpoints: {
        preparation: 'Pratique de présentation',
        performance: 'Observation durant les visites',
        celebration: 'Participation au cercle final'
      },
      
      interventionStrategies: {
        tier1: 'Pratique en groupe classe',
        tier2: 'Répétition supplémentaire avec support',
        tier3: 'Rôle adapté selon les besoins'
      },
      
      performanceOpportunities: 'Présentation aux stations, chanson, interaction avec visiteurs',
      
      priorKnowledgeCheck: 'Tour de tous les travaux créés',
      
      reflectionActivities: {
        student: 'Dire leur moment préféré des 2 semaines',
        teacher: 'Noter la croissance de chaque enfant'
      },
      
      wheretoFramework: {
        W: 'Nous célébrons notre apprentissage sur les familles',
        H: 'Événement spécial avec vrais visiteurs',
        E: 'Présentation active de leur travail',
        R: 'Regarder tout ce qu\'on a appris',
        E2: 'Performance authentique devant public',
        T: 'Différents rôles selon les forces',
        O: 'Préparation → Accueil → Visite → Célébration'
      },
      
      grouping: 'Groupe entier → Stations mixtes → Collectif avec familles',
      
      isSubFriendly: false, // Important event requiring regular teacher
      
      subNotes: `ÉVÉNEMENT SPÉCIAL - Ne pas manquer!
Célébration des 2 premières semaines.
Familles invitées 9h30-10h00.
Tout le matériel est préparé.
Rôles des enfants assignés.`,
      
      expectations: {
        create: unitPlan.expectations.map(exp => ({
          expectationId: exp.expectationId
        }))
      }
    }
  });

  console.log(`✅ Created Lesson 8: ${lesson8.title}`);

  console.log('\n📊 WEEK 2 SUMMARY');
  console.log('=================');
  console.log('Created 4 perfect lesson plans for Sciences humaines');
  console.log('Unit: Ma famille et ma communauté');
  console.log('Dates: September 8-12, 2025');
  console.log('\nWeek 2 Focus:');
  console.log('✅ Family diversity and inclusion');
  console.log('✅ Generations and roles');
  console.log('✅ How families help each other');
  console.log('✅ Mini-celebration with families');
  console.log('\nKey Features:');
  console.log('✅ ETFO three-part structure maintained');
  console.log('✅ Developmental appropriateness for Grade 1');
  console.log('✅ Guest speakers integrated');
  console.log('✅ Family engagement event');
  console.log('✅ Building portfolio for final performance task');
  console.log('✅ Assessment through authentic performance');
  console.log('✅ Cross-curricular connections throughout');
}

createWeek2LessonPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());