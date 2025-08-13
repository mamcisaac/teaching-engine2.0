import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks3And4VivreLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 3-4');
  console.log('Unit: Vivre ensemble');
  console.log('Focus: Conflict Resolution and Cooperation');
  console.log('=========================================\n');

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'test.teacher@pei.ca' }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Vivre ensemble'
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
      throw new Error('Unit plan Vivre ensemble not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 8 lessons for Weeks 3-4\n');

    // WEEK 3: Understanding Conflicts (January 19-23, 2026)
    
    // Lesson 9: Les conflits arrivent
    const lesson9 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les conflits arrivent',
        date: new Date('2026-01-19'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que les conflits sont normaux
• Identifier les causes communes de conflits
• Reconnaître leurs émotions dans les conflits`,

        mindsOn: `Les nuages et le soleil (10 min)
• Images: journée ensoleillée vs orageuse
• "Parfois, entre amis, c'est comme la météo"
• Soleil = entente, Nuages = désaccord
• Discussion: Les orages passent toujours!
• Normalisation: Tout le monde a des conflits
• Question: Avez-vous déjà eu un désaccord?`,

        action: `Comprendre les conflits (28 min)

PARTIE 1: Les déclencheurs de conflits (13 min)
• Scénarios typiques de Grade 1:
  - Deux enfants veulent le même jouet
  - Quelqu'un coupe la file
  - Un ami ne veut pas partager
  - Désaccord sur les règles d'un jeu
• Discussion de chaque situation
• "Qu'est-ce qui cause le problème?"
• Validation: "C'est normal de se sentir..."

PARTIE 2: Le thermomètre des émotions (15 min)
• Grand thermomètre visuel
• Gradations: calme → frustré → fâché → très fâché
• Exemples de situations
• "Où suis-je sur le thermomètre?"
• Stratégies pour chaque niveau:
  - Respirer, compter, demander de l'aide
• Pratique avec scénarios`,

        consolidation: `Météo émotionnelle (7 min)
• Création de notre bulletin météo des émotions
• "Aujourd'hui, je me sens..."
• Engagement: Observer nos nuages et soleils
• Affiche du thermomètre pour référence
• Mission: Remarquer quand un conflit commence`,

        materials: JSON.stringify([
          "Images météo (soleil, nuages, orage)",
          "Cartes de scénarios de conflits",
          "Thermomètre des émotions géant",
          "Marqueurs de couleur",
          "Affiche pour la classe",
          "Autocollants météo"
        ]),

        accommodations: JSON.stringify([
          "Support visuel constant pour émotions",
          "Scénarios adaptés aux expériences",
          "Expression non-verbale acceptée",
          "Espace calme disponible",
          "Validation de toutes les émotions"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 émotions de base, support constant",
          onLevel: "Thermomètre complet, stratégies simples",
          advanced: "Nuances émotionnelles, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance des conflits comme normaux
Identification des émotions personnelles
Compréhension des déclencheurs`,

        isSubFriendly: true,
        subNotes: `Focus: Normalisation des conflits et émotions.
Activité principale: Thermomètre émotionnel.
Important: Créer un environnement sécurisant.
Affiche du thermomètre à laisser visible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 10: Écouter avec son cœur
    const lesson10 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Écouter avec son cœur',
        date: new Date('2026-01-20'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Pratiquer l'écoute active
• Comprendre le point de vue de l'autre
• Développer l'empathie`,

        mindsOn: `Le téléphone brisé empathique (10 min)
• Jeu du téléphone mais avec émotions
• "Je me sens triste parce que..."
• Observer comment le message change
• Discussion: Pourquoi c'est difficile?
• Introduction: Écouter vraiment
• Différence: entendre vs écouter avec le cœur`,

        action: `L'art d'écouter (28 min)

PARTIE 1: Les oreilles du cœur (13 min)
• Démonstration: mauvaise écoute vs bonne écoute
• Signes de bonne écoute:
  - Regarder la personne
  - Ne pas interrompre
  - Hocher la tête
  - Poser des questions
• Pratique en dyades
• Un raconte (30 sec), l'autre écoute
• Changement de rôle
• Feedback: "Je me suis senti écouté quand..."

PARTIE 2: Dans les souliers de l'autre (15 min)
• Grandes chaussures symboliques
• Scénario: Deux versions d'une histoire
  - Version A: Point de vue de Sara
  - Version B: Point de vue de Tom
• "Mettons les souliers de Sara... de Tom"
• Réalisation: Deux façons de voir!
• Création: Lunettes magiques d'empathie
• Décoration personnelle`,

        consolidation: `Écouteurs professionnels (7 min)
• Démonstration des lunettes d'empathie
• "Avec mes lunettes, je vois que..."
• Engagement: Une écoute de cœur par jour
• Badge "Écouteur empathique"
• Chanson de l'écoute créée ensemble`,

        materials: JSON.stringify([
          "Grandes chaussures décoratives",
          "Cartons pour lunettes",
          "Matériel de décoration",
          "Cartes de scénarios",
          "Badges écouteur",
          "Affiches signes d'écoute"
        ]),

        accommodations: JSON.stringify([
          "Démonstrations répétées",
          "Partenaire de soutien pour pratique",
          "Temps d'écoute adapté",
          "Support visuel pour signes d'écoute",
          "Expression alternative acceptée"
        ]),

        modifications: JSON.stringify({
          struggling: "Écoute très courte, beaucoup de support",
          onLevel: "Pratique standard de l'écoute active",
          advanced: "Reformulation, questions empathiques"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Démonstration de l'écoute active
Capacité à voir d'autres perspectives
Développement de l'empathie`,

        isSubFriendly: true,
        subNotes: `Focus: Développement de l'écoute active et empathie.
Activité principale: Pratique d'écoute et lunettes d'empathie.
Important: Modéliser constamment la bonne écoute.
Environnement calme nécessaire.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 11: Les mots qui réparent
    const lesson11 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les mots qui réparent',
        date: new Date('2026-01-21'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre à utiliser les messages "Je"
• Exprimer leurs sentiments sans blâmer
• Utiliser des mots qui apaisent`,

        mindsOn: `Mots doux vs mots piquants (10 min)
• Deux sacs: un doux (peluche), un piquant (papier froissé)
• Exemples de mots pour chaque sac
• Toucher: Comment se sentent-ils?
• Discussion: Effet des mots sur les autres
• Introduction: Les mots peuvent guérir
• Mission: Apprendre les mots magiques`,

        action: `Le pouvoir des mots (28 min)

PARTIE 1: Les messages "Je" (13 min)
• Formule magique: "Je me sens... quand... parce que..."
• Exemples:
  - "Je me sens triste quand tu ne partages pas"
  - "Je me sens heureux quand tu m'aides"
• Pratique avec marionnettes
• Transformation de messages "Tu" en "Je"
• "Tu es méchant" → "Je me sens blessé"
• Célébration de chaque transformation

PARTIE 2: La pharmacie des mots (15 min)
• Création d'une "pharmacie" de mots qui guérissent
• Catégories:
  - Mots pour s'excuser (pardon, désolé)
  - Mots pour consoler (ça va aller)
  - Mots pour remercier (merci, j'apprécie)
  - Mots pour encourager (tu peux le faire)
• Prescriptions de mots pour situations
• Chacun crée sa carte de mots préférés`,

        consolidation: `Médecins des mots (7 min)
• Présentation des cartes de mots
• Jeu: Quelle prescription pour ce problème?
• Engagement: Utiliser 3 mots qui réparent
• Diplôme "Médecin des mots"
• Pharmacie affichée dans la classe`,

        materials: JSON.stringify([
          "Sac doux (peluche) et piquant (papier)",
          "Marionnettes",
          "Boîte pharmacie décorative",
          "Cartes de mots",
          "Matériel pour prescriptions",
          "Diplômes médecin des mots"
        ]),

        accommodations: JSON.stringify([
          "Formules simplifiées si nécessaire",
          "Support visuel pour messages Je",
          "Pratique avec adulte d'abord",
          "Cartes de mots illustrées",
          "Répétition fréquente"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 mots de base, formule simple",
          onLevel: "Messages Je complets, variété de mots",
          advanced: "Nuances, aide aux autres pour formuler"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Utilisation des messages Je
Vocabulaire émotionnel élargi
Application des mots qui réparent`,

        isSubFriendly: true,
        subNotes: `Focus: Communication positive et messages Je.
Activité principale: Pharmacie des mots qui guérissent.
Important: Pratiquer les messages Je constamment.
Pharmacie à laisser accessible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 12: Résoudre ensemble
    const lesson12 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Résoudre ensemble',
        date: new Date('2026-01-23'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Apprendre les étapes de résolution de conflits
• Pratiquer la recherche de solutions
• Comprendre le compromis`,

        mindsOn: `Le pont de la paix (10 min)
• Deux côtés séparés par une "rivière"
• Deux élèves veulent traverser
• Problème: Pont trop étroit!
• Solutions proposées par la classe
• Introduction: Trouver des solutions ensemble
• Le pont de la paix nous unit`,

        action: `Constructeurs de solutions (28 min)

PARTIE 1: Les 4 étapes magiques (13 min)
• Affiche des étapes illustrées:
  1. STOP - Respirer (main rouge)
  2. PARLER - Dire ses sentiments (bouche)
  3. ÉCOUTER - Comprendre l'autre (oreilles)
  4. CHERCHER - Trouver une solution (ampoule)
• Pratique avec situation simple
• Tous ensemble, suivre les étapes
• Gestes pour mémoriser

PARTIE 2: Le laboratoire de solutions (15 min)
• Problème: Un seul ballon, deux équipes
• Brainstorm de solutions:
  - Partager le temps
  - Jouer ensemble
  - Tour de rôle
  - Trouver un autre ballon
• Voter pour la meilleure solution
• Essayer la solution choisie
• Célébration: Ça marche!`,

        consolidation: `Ingénieurs de la paix (7 min)
• Révision des 4 étapes avec gestes
• Création d'un rappel visuel personnel
• Engagement: Utiliser les étapes cette semaine
• Certificat "Constructeur de solutions"
• Photo avec le pont de la paix`,

        materials: JSON.stringify([
          "Pont décoratif ou dessiné",
          "Affiche 4 étapes illustrée",
          "Ballon pour démonstration",
          "Matériel pour rappels visuels",
          "Certificats constructeur",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Étapes simplifiées si nécessaire",
          "Support physique pour mémorisation",
          "Pratique en petit groupe",
          "Aide pour générer des solutions",
          "Répétition fréquente des étapes"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 étapes, solutions simples",
          onLevel: "4 étapes, plusieurs solutions",
          advanced: "Médiation entre pairs, solutions créatives"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Mémorisation des étapes de résolution
Capacité à générer des solutions
Application pratique observée`,

        isSubFriendly: true,
        subNotes: `Focus: Processus de résolution de conflits.
Activité principale: Pratique des 4 étapes.
Important: Affiche des étapes bien visible.
Référer aux étapes régulièrement.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 4: Building Cooperation (January 26-30, 2026)

    // Lesson 13: La force de l'équipe
    const lesson13 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La force de l\'équipe',
        date: new Date('2026-01-26'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir que nous sommes plus forts ensemble
• Comprendre les avantages de la coopération
• Identifier les rôles dans une équipe`,

        mindsOn: `Le défi des bâtons (10 min)
• Un bâton seul: facile à casser (démonstration)
• Plusieurs bâtons ensemble: impossible!
• "Nous sommes comme les bâtons"
• Seuls = fragiles, Ensemble = forts
• Discussion: Quand avons-nous besoin des autres?
• Introduction: La magie du travail d'équipe`,

        action: `Équipes en action (28 min)

PARTIE 1: La tour impossible (13 min)
• Défi: Construire la plus haute tour
• Round 1: Chacun seul (2 min)
• Observation: Difficile, tours tombent
• Round 2: En équipes de 4
• WOW! Tours beaucoup plus hautes!
• Discussion: Qu'est-ce qui a changé?
• Réalisation: Ensemble, c'est mieux!

PARTIE 2: Les rôles de chacun (15 min)
• Histoire: Les animaux construisent une maison
• Chaque animal a un talent:
  - Castor: coupe le bois
  - Oiseau: apporte les matériaux
  - Fourmi: organise
  - Ours: porte les charges lourdes
• Discussion: Tous importants!
• Nos talents dans la classe
• Création: Badge de mon talent spécial`,

        consolidation: `Célébration des équipes (7 min)
• Présentation des badges de talents
• "Mon talent spécial est..."
• Formation d'un cercle uni
• Tous se tiennent: Si un tombe, tous tombent!
• Cri d'équipe créé ensemble
• Mission: Remarquer les talents des autres`,

        materials: JSON.stringify([
          "Bâtons ou baguettes",
          "Blocs de construction",
          "Histoire illustrée des animaux",
          "Matériel pour badges",
          "Marqueurs colorés",
          "Minuterie visuelle"
        ]),

        accommodations: JSON.stringify([
          "Groupes équilibrés formés",
          "Rôles adaptés aux capacités",
          "Support pour identifier talents",
          "Participation flexible",
          "Validation de tous les talents"
        ]),

        modifications: JSON.stringify({
          struggling: "Rôle simple, beaucoup de support",
          onLevel: "Participation active standard",
          advanced: "Leadership, organisation d'équipe"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de la force collective
Identification des talents personnels
Participation au travail d'équipe`,

        isSubFriendly: true,
        subNotes: `Focus: Découverte de la force du travail d'équipe.
Activité principale: Tour collaborative et talents.
Important: Valoriser tous les types de talents.
Matériel de construction prêt.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 14: Partager, c'est multiplier
    const lesson14 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Partager, c\'est multiplier',
        date: new Date('2026-01-27'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre que partager enrichit tout le monde
• Pratiquer différentes formes de partage
• Découvrir la joie de partager`,

        mindsOn: `La magie du partage (10 min)
• Une pomme coupée en morceaux
• "Si je garde tout = 1 personne contente"
• "Si je partage = 6 personnes contentes!"
• Le bonheur se multiplie!
• Histoire: La soupe aux cailloux (version courte)
• Question: Que pouvons-nous partager?`,

        action: `Festival du partage (28 min)

PARTIE 1: Le marché du partage (13 min)
• Chacun a 5 jetons de couleurs différentes
• Échange libre pendant 5 minutes
• But: Avoir des couleurs variées
• Observation: Plus on partage, plus on a!
• Discussion: Comment vous sentez-vous?
• Carte de partage: Qui a partagé avec moi?

PARTIE 2: Partager plus que des objets (15 min)
• Stations de partage:
  - Station 1: Partager un sourire
  - Station 2: Partager une idée
  - Station 3: Partager de l'aide
  - Station 4: Partager un talent
• 3 minutes par station
• Carnet de partage: Dessiner ce qu'on a partagé
• Réalisation: On peut tout partager!`,

        consolidation: `Ambassadeurs du partage (7 min)
• Cercle de gratitude
• "Je remercie X d'avoir partagé..."
• Création d'une chaîne de partage
• Certificat "Ambassadeur du partage"
• Défi: 5 partages avant demain`,

        materials: JSON.stringify([
          "Pomme et couteau (sécuritaire)",
          "Jetons de couleurs",
          "Cartes de partage",
          "Matériel pour stations",
          "Carnets de partage",
          "Certificats ambassadeur"
        ]),

        accommodations: JSON.stringify([
          "Support pour les échanges",
          "Partage adapté aux capacités",
          "Options non-matérielles disponibles",
          "Temps flexible aux stations",
          "Aide pour documentation"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 types de partage, support constant",
          onLevel: "Toutes les stations, autonomie",
          advanced: "Organisation du partage, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de partage
Pratique active du partage
Expression de la gratitude`,

        isSubFriendly: true,
        subNotes: `Focus: Apprentissage du partage multiforme.
Activité principale: Marché et stations de partage.
Important: Supervision du partage équitable.
Ambiance positive et encourageante.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 15: Les amis de toutes les couleurs
    const lesson15 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les amis de toutes les couleurs',
        date: new Date('2026-01-28'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer la diversité dans notre classe
• Comprendre que les différences nous enrichissent
• Développer l'inclusion`,

        mindsOn: `L'arc-en-ciel de notre classe (10 min)
• Image d'arc-en-ciel
• "Imaginez un arc-en-ciel d'une seule couleur"
• Ennuyeux! Pas beau!
• "Notre classe est comme un arc-en-ciel"
• Chacun apporte sa couleur unique
• Question: Quelle est votre couleur spéciale?`,

        action: `Célébration de la diversité (28 min)

PARTIE 1: Ce qui nous rend uniques (13 min)
• Miroirs magiques distribués
• Observer: Qu'est-ce qui me rend spécial?
• Partage en cercle:
  - Langues parlées
  - Traditions familiales
  - Talents uniques
  - Préférences diverses
• Graphique humain: Regroupements variés
• Réalisation: Tous différents, tous importants!

PARTIE 2: La courtepointe de l'amitié (15 min)
• Chaque élève décore un carré de tissu/papier
• Représenter ce qui les rend unique
• Dessins, symboles, couleurs personnelles
• Assemblage en courtepointe collective
• Observer: Chaque carré embellit l'ensemble
• Message: Notre diversité nous unit`,

        consolidation: `Unis dans la diversité (7 min)
• Dévoilement de la courtepointe complète
• Chanson: "Nous sommes différents, nous sommes amis"
• Jeu: Trouve quelqu'un qui... (différent de toi)
• Engagement: Célébrer nos différences
• Photo avec notre courtepointe`,

        materials: JSON.stringify([
          "Image arc-en-ciel",
          "Petits miroirs",
          "Carrés de tissu ou papier",
          "Matériel de décoration varié",
          "Colle pour assemblage",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Expression de diversité flexible",
          "Support pour identification",
          "Participation adaptée",
          "Respect de la confidentialité",
          "Options créatives variées"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 éléments uniques, support",
          onLevel: "Expression complète de l'unicité",
          advanced: "Connexions entre diversités, leadership"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance de la diversité
Expression de l'identité personnelle
Attitude inclusive démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration de la diversité et inclusion.
Activité principale: Courtepointe collective.
Important: Environnement très respectueux.
Valoriser toutes les différences.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 16: Notre pacte de paix
    const lesson16 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre pacte de paix',
        date: new Date('2026-01-30'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer un engagement collectif pour la paix
• S'engager personnellement pour le bien-vivre
• Célébrer leurs apprentissages sur la coopération`,

        mindsOn: `Le jardin de la paix (10 min)
• Image d'un beau jardin
• "Pour qu'un jardin pousse, il faut..."
• Eau, soleil, soin, patience
• "Notre classe est un jardin de paix"
• Que faut-il pour le faire pousser?
• Introduction: Créons notre pacte!`,

        action: `Construction du pacte (30 min)

PARTIE 1: Nos promesses de paix (15 min)
• Révision de nos apprentissages:
  - Écouter avec le cœur
  - Utiliser les mots qui réparent
  - Résoudre les conflits ensemble
  - Partager et coopérer
• Chaque élève fait une promesse
• "Je promets de..."
• Écriture/dessin de la promesse
• Signatures officielles

PARTIE 2: Le monument de la paix (15 min)
• Construction collective d'un monument
• Chaque promesse = une pierre
• Empilage soigneux
• Décoration avec symboles de paix
• Ruban autour pour unir
• Installation cérémonielle dans la classe`,

        consolidation: `Gardiens de la paix (5 min)
• Cérémonie officielle
• Serment des gardiens de la paix
• Médailles de gardien remises
• Photo officielle avec le monument
• Engagement: Vivre notre pacte chaque jour
• Applaudissements solennels`,

        materials: JSON.stringify([
          "Image de jardin",
          "Papier pour promesses",
          "Boîtes/blocs pour monument",
          "Matériel de décoration",
          "Ruban décoratif",
          "Médailles gardien de la paix"
        ]),

        accommodations: JSON.stringify([
          "Promesses adaptées aux capacités",
          "Support pour formulation",
          "Expression variée acceptée",
          "Participation flexible",
          "Aide pour signature/dessin"
        ]),

        modifications: JSON.stringify({
          struggling: "Promesse simple avec aide",
          onLevel: "Promesse personnelle complète",
          advanced: "Promesses multiples, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Engagement personnel démontré
Synthèse des apprentissages
Participation à la création collective`,

        isSubFriendly: true,
        subNotes: `Focus: Création du pacte de paix collectif.
Activité principale: Monument des promesses.
Important: Cérémonie solennelle mais joyeuse.
Monument à conserver visible.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 9: Les conflits arrivent');
    console.log('✅ Created Lesson 10: Écouter avec son cœur');
    console.log('✅ Created Lesson 11: Les mots qui réparent');
    console.log('✅ Created Lesson 12: Résoudre ensemble');
    console.log('✅ Created Lesson 13: La force de l\'équipe');
    console.log('✅ Created Lesson 14: Partager, c\'est multiplier');
    console.log('✅ Created Lesson 15: Les amis de toutes les couleurs');
    console.log('✅ Created Lesson 16: Notre pacte de paix');

    console.log('\n📊 WEEKS 3-4 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Vivre ensemble');
    console.log('Dates: January 19-30, 2026');
    console.log('\nWeek 3 Focus:');
    console.log('✅ Understanding conflicts as normal');
    console.log('✅ Active listening and empathy');
    console.log('✅ Words that heal and "I" messages');
    console.log('✅ Conflict resolution steps');
    console.log('\nWeek 4 Focus:');
    console.log('✅ Teamwork and cooperation');
    console.log('✅ Sharing and multiplication of joy');
    console.log('✅ Celebrating diversity');
    console.log('✅ Peace pact creation');
    console.log('\nKey Features:');
    console.log('✅ Emotional literacy development');
    console.log('✅ Practical conflict resolution skills');
    console.log('✅ Community building activities');
    console.log('✅ Inclusive practices');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks3And4VivreLessons().catch(console.error);