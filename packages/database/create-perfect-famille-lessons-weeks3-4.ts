import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks3And4Lessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 3-4');
  console.log('Unit: Ma famille et ma communauté');
  console.log('Focus: Community Helpers and School Community');
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
      throw new Error('Unit plan not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 8 lessons for Weeks 3-4\n');

    // WEEK 3: Community Helpers (September 15-19, 2025)
    
    // Lesson 9: Les gens qui nous aident
    const lesson9 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les gens qui nous aident',
        date: new Date('2025-09-15'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les personnes qui nous aident dans notre communauté
• Comprendre différents métiers et rôles
• Apprécier ceux qui contribuent à notre bien-être`,


        mindsOn: `Mystère des métiers (12 min)
• Boîte mystère avec objets représentant différents métiers
• Les élèves touchent et devinent: stéthoscope, craie, badge de police
• Chanson: "Les gens de mon quartier" avec mouvements
• Question du jour: "Qui vous a aidé cette semaine?"
• Partage en dyades puis avec la classe`,

        action: `Exploration des aides communautaires (25 min)

PARTIE 1: Carte de notre communauté (10 min)
• Grande carte au sol avec différents lieux
• Élèves placent des figurines de différents métiers
• Discussion: Qui travaille où? Comment nous aident-ils?

PARTIE 2: Stations de métiers (15 min)
• Station 1: Coin médecin (prendre soin de poupées)
• Station 2: Coin enseignant (enseigner à des peluches)
• Station 3: Coin pompier (éteindre des "feux" - cônes rouges)
• Station 4: Coin épicier (organiser la nourriture)
• Rotation toutes les 4 minutes avec signal musical

Observation: Comment chaque métier aide les autres?`,

        consolidation: `Cercle de gratitude (8 min)
• Création collective: "Notre livre de merci"
• Chaque élève dessine rapidement une personne qui l'aide
• Partage: "Je remercie... parce que..."
• Chanson finale avec tous les métiers mentionnés
• Préparation: Demain, un invité spécial!`,

        materials: JSON.stringify([
          "Boîte mystère avec objets de métiers",
          "Grande carte de communauté au sol",
          "Figurines ou images de métiers",
          "Matériel pour stations (trousse médicale jouet, tableau, cônes, aliments plastiques)",
          "Papier et crayons pour livre de merci",
          "Musique pour transitions"
        ]),

        accommodations: JSON.stringify([
          "Support visuel: images de métiers affichées",
          "Mouvement intégré pour élèves kinesthésiques",
          "Jumelage stratégique pour support linguistique",
          "Options de réponse: verbal, dessin, ou mime",
          "Espace calme disponible si surstimulation"
        ]),

        modifications: JSON.stringify({
          struggling: "Images pré-découpées de métiers, support individuel aux stations",
          onLevel: "Activités standards avec encouragement à élaborer",
          advanced: "Créer des connexions entre métiers, ajouter des détails aux dessins"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Observation aux stations (formative)
Auto-évaluation: Quel métier m'intéresse? (comme apprentissage)
Contribution au livre de merci collectif (sommative)`,

        isSubFriendly: true,
        subNotes: `Focus: Les gens qui nous aident dans la communauté.
Activité principale: Stations de métiers et carte communautaire.
Important: Valoriser tous les métiers, créer sentiment de gratitude.
Matériel préparé, invité confirmé pour demain.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 10: Un héros dans notre classe (Guest speaker)
    const lesson10 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Un héros dans notre classe',
        date: new Date('2025-09-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Poser des questions pertinentes à un travailleur communautaire
• Écouter activement et respectueusement
• Comprendre l'importance d'un métier spécifique`,

        mindsOn: `Préparation pour notre invité (10 min)
• Rappel: Qui vient nous visiter? (ex: infirmière, pompier)
• Pratique de nos questions préparées hier
• Révision des règles d'écoute active
• Création rapide de badges "Journaliste junior"
• Positionnement en demi-cercle accueillant`,

        action: `Rencontre avec un héros communautaire (25 min)

PARTIE 1: Présentation de l'invité (10 min)
• L'invité se présente avec objets/uniforme
• Démonstration ou histoire de leur travail
• Moments interactifs (essayer un casque, écouter le cœur)

PARTIE 2: Interview des journalistes juniors (10 min)
• Élèves posent leurs questions préparées
• Questions spontanées encouragées
• L'invité peut poser des questions aussi!

PARTIE 3: Activité avec l'invité (5 min)
• Activité pratique liée au métier
• Photo de groupe avec l'invité
• Remise d'un certificat "Ami de notre classe"`,

        consolidation: `Célébration et réflexion (10 min)
• Applaudissements et mercis à l'invité
• Après le départ: Qu'avons-nous appris?
• Dessin rapide: Mon moment préféré
• Ajout au livre de merci commencé hier
• Annonce: Nous serons des héros demain!`,

        materials: JSON.stringify([
          "Badges journaliste junior",
          "Questions préparées sur carte",
          "Chaise spéciale pour l'invité",
          "Certificat pour l'invité",
          "Appareil photo",
          "Matériel de dessin"
        ]),

        accommodations: JSON.stringify([
          "Position flexible pendant la présentation",
          "Questions visuelles pour élèves timides",
          "Possibilité de poser question via enseignant",
          "Pause mouvement si nécessaire",
          "Support individuel pour élèves anxieux"
        ]),

        modifications: JSON.stringify({
          struggling: "Questions simples pré-formulées, dessins au lieu de mots",
          onLevel: "Questions préparées avec possibilité d'improviser",
          advanced: "Questions de suivi, connexions avec apprentissages antérieurs"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Qualité d'écoute et d'engagement observée
Réflexion personnelle sur ce qui a surpris
Contribution aux questions et dessins`,

        isSubFriendly: true,
        subNotes: `Focus: Visite d'un travailleur communautaire.
Invité confirmé: [Nom] à [heure].
Questions préparées disponibles.
Important: Créer atmosphère respectueuse et curieuse.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 11: Nous sommes des aides!
    const lesson11 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Nous sommes des aides!',
        date: new Date('2025-09-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier comment nous pouvons aider dans notre communauté
• Pratiquer des actes d'aide concrets
• Développer l'empathie et la responsabilité sociale`,

        mindsOn: `Les super-pouvoirs d'aide (10 min)
• Chanson: "J'ai des mains pour aider" avec gestes
• Discussion: Comment les enfants de 6 ans peuvent aider?
• Création de capes imaginaires de super-aidants
• Chaque élève nomme son "super-pouvoir d'aide"
• Mission du jour: Utiliser nos pouvoirs!`,

        action: `Stations d'aide communautaire (25 min)

ROTATION DE 4 STATIONS (6 min chacune):

Station 1: Aide à la bibliothèque
• Organiser les livres par taille/couleur
• Réparer les livres avec du ruban
• Créer des marque-pages pour les autres

Station 2: Aide environnementale
• Trier le recyclage (vrais objets propres)
• Arroser les plantes de la classe
• Créer des affiches "Protégeons la nature"

Station 3: Aide aux plus jeunes
• Préparer des jeux pour la maternelle
• Pratiquer comment montrer/enseigner
• Créer des cartes d'encouragement

Station 4: Aide à la communauté scolaire
• Préparer le matériel pour demain
• Nettoyer/organiser un espace
• Messages positifs pour le corridor`,

        consolidation: `Célébration des aidants (10 min)
• Rassemblement avec nos "capes" imaginaires
• Partage: "J'ai aidé en..."
• Remise de badges "Super-aidant du jour"
• Photo de classe des super-aidants
• Défi: Une aide à la maison ce soir!`,

        materials: JSON.stringify([
          "Foulards ou tissu pour capes imaginaires",
          "Livres à réparer, ruban adhésif",
          "Matériel de recyclage propre",
          "Arrosoirs, plantes",
          "Matériel d'art pour affiches et cartes",
          "Badges super-aidant"
        ]),

        accommodations: JSON.stringify([
          "Choix de station selon intérêt",
          "Jumelage pour support",
          "Tâches adaptées selon capacité",
          "Pauses mouvement entre stations",
          "Reconnaissance de tous les efforts"
        ]),

        modifications: JSON.stringify({
          struggling: "Tâches simples et concrètes, support visuel",
          onLevel: "Tâches standards avec autonomie progressive",
          advanced: "Leadership aux stations, créer nouvelles idées d'aide"
        }),

        assessmentType: 'Formative et comme apprentissage',
        assessmentNotes: `Observation de l'engagement et de l'entraide
Auto-évaluation: Comment je me sens quand j'aide?
Portfolio: Photo/dessin de mon aide préférée`,

        isSubFriendly: true,
        subNotes: `Focus: Les enfants comme aidants communautaires.
Activité principale: 4 stations d'aide pratique.
Important: Valoriser tous les efforts d'aide.
Matériel préparé pour chaque station.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 12: La carte de notre communauté
    const lesson12 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La carte de notre communauté',
        date: new Date('2025-09-18'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer une représentation visuelle de notre communauté
• Identifier les lieux importants et qui y travaille
• Comprendre les connexions entre les lieux`,

        mindsOn: `Voyage imaginaire (10 min)
• "Fermons les yeux... nous survolons notre communauté"
• Description guidée des lieux vus d'en haut
• Ouverture des yeux: Qu'avons-nous vu?
• Liste collective des lieux importants
• Introduction: Créons notre propre carte!`,

        action: `Construction de la carte communautaire (28 min)

PARTIE 1: Planification (8 min)
• Grande feuille au sol (2m x 2m)
• Décision collective: Où est notre école? (centre)
• Discussion: Quels lieux autour?
• Attribution des espaces sur la carte

PARTIE 2: Création collaborative (15 min)
• Groupes de 4 travaillent sur différentes sections
• Groupe 1: École et terrain de jeu
• Groupe 2: Commerces (épicerie, pharmacie)
• Groupe 3: Services (poste de pompiers, hôpital)
• Groupe 4: Espaces communautaires (parc, bibliothèque)
• Utilisation de blocs, dessins, étiquettes

PARTIE 3: Connexions (5 min)
• Tracer les routes avec ruban adhésif
• Ajouter les figurines de personnes
• Placer les véhicules appropriés`,

        consolidation: `Tour de notre communauté (7 min)
• Visite guidée de la carte par les créateurs
• Chaque groupe présente sa section
• Questions: Comment aller de... à...?
• Célébration: Notre communauté est complète!
• Annonce: Semaine prochaine, notre école!`,

        materials: JSON.stringify([
          "Grande feuille de papier (2m x 2m)",
          "Blocs de construction",
          "Matériel de dessin",
          "Étiquettes pour lieux",
          "Ruban adhésif coloré pour routes",
          "Figurines et véhicules jouets"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés dans les groupes",
          "Support visuel avec photos réelles",
          "Possibilité de travailler debout/assis",
          "Tâches adaptées aux capacités",
          "Espace pour observation si besoin"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 2-3 lieux familiers, support individuel",
          onLevel: "Création standard avec détails appropriés",
          advanced: "Ajouter services additionnels, créer légende de carte"
        }),

        assessmentType: 'Formative et sommative',
        assessmentNotes: `Observation de la collaboration et compréhension spatiale
Réflexion: Mon lieu préféré et pourquoi
Contribution à la carte collective (portfolio)`,

        isSubFriendly: true,
        subNotes: `Focus: Création d'une carte communautaire collaborative.
Activité principale: Construction en groupes de la carte.
Important: Tous participent, valoriser toutes les contributions.
Matériel prêt, groupes pré-assignés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 4: Our School Community (September 22-26, 2025)

    // Lesson 13: Notre école, notre deuxième maison
    const lesson13 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre école, notre deuxième maison',
        date: new Date('2025-09-22'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'école comme une communauté
• Identifier tous les gens qui rendent notre école spéciale
• Développer la fierté et l'appartenance scolaire`,

        mindsOn: `L'école mystère (12 min)
• Indices photo: Coins de l'école photographiés
• Élèves devinent les endroits
• Discussion: Qui rend ces endroits spéciaux?
• Chanson de l'école avec mouvements
• Question: Pourquoi notre école est-elle unique?`,

        action: `Exploration de notre communauté scolaire (25 min)

PARTIE 1: Safari photo de l'école (15 min)
• Petite visite de l'école en groupes
• Mission: Trouver et saluer 5 personnes différentes
• Prendre des "photos mentales" ou dessins rapides
• Visiter: bureau, conciergerie, cuisine, bibliothèque
• Collecte d'indices pour notre musée d'école

PARTIE 2: Création du musée de l'école (10 min)
• Retour en classe avec nos découvertes
• Création d'un tableau "Notre école"
• Sections: Personnes, Lieux, Ce qu'on aime
• Ajout de dessins et mots
• Décoration avec couleurs de l'école`,

        consolidation: `Cérémonie de fierté scolaire (8 min)
• Présentation de notre musée
• Chacun nomme sa personne préférée à l'école
• Création d'un cri de ralliement de classe
• Photo devant notre musée
• Mission: Dire merci à quelqu'un de l'école`,

        materials: JSON.stringify([
          "Photos mystères de l'école",
          "Tableau ou grande affiche",
          "Matériel de dessin",
          "Appareil photo ou tablette",
          "Couleurs de l'école (papier, tissu)",
          "Autocollants ou décorations"
        ]),

        accommodations: JSON.stringify([
          "Accompagnement pour élèves anxieux durant visite",
          "Option de rester près de l'enseignant",
          "Rôles variés dans le groupe",
          "Support visuel pour communication",
          "Temps de calme si surstimulation"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 3 personnes clés, dessins simples",
          onLevel: "Exploration standard avec documentation",
          advanced: "Interview de personnel, création de carte détaillée"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Observation durant la visite et création
Auto-évaluation: Comment je contribue à l'école?
Contribution au musée de l'école`,

        isSubFriendly: true,
        subNotes: `Focus: L'école comme communauté.
Activité principale: Safari photo et création de musée.
Important: Créer sentiment d'appartenance et fierté.
Visite préarrangée, personnel prévenu.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 14: Les règles qui nous protègent
    const lesson14 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les règles qui nous protègent',
        date: new Date('2025-09-23'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance des règles pour notre sécurité
• Identifier les règles de notre école et classe
• Pratiquer le respect des règles`,

        mindsOn: `Le jeu sans règles (10 min)
• Essayons un jeu simple sans règles annoncées
• Confusion naturelle qui émerge
• Discussion: Qu'est-ce qui était difficile?
• Refaire avec des règles claires
• Réflexion: Les règles nous aident!`,

        action: `Exploration des règles protectrices (25 min)

PARTIE 1: Détectives de règles (10 min)
• Images de situations scolaires
• Identifier: Quelle règle? Pourquoi?
• Catégoriser: Sécurité, Respect, Apprentissage
• Discussion sur chaque catégorie

PARTIE 2: Création de notre charte (15 min)
• Nos 5 règles d'or de classe
• Chaque règle avec image/symbole
• Signatures/empreintes de tous
• Décoration collective
• Affichage cérémoniel`,

        consolidation: `Engagement communautaire (10 min)
• Serment de la classe (tous ensemble)
• Jeu: "Que ferais-tu si...?" (scénarios)
• Badges de "Gardien des règles"
• Chanson des règles créée ensemble
• Mission: Observer une règle importante`,

        materials: JSON.stringify([
          "Images de situations scolaires",
          "Grande affiche pour charte",
          "Matériel pour symboles/dessins",
          "Encre pour empreintes",
          "Badges gardien des règles",
          "Scénarios préparés"
        ]),

        accommodations: JSON.stringify([
          "Règles en images pour support visuel",
          "Répétition et pratique des règles",
          "Jumelage pour compréhension",
          "Mouvements pour mémorisation",
          "Renforcement positif constant"
        ]),

        modifications: JSON.stringify({
          struggling: "Focus sur 3 règles essentielles avec images",
          onLevel: "Compréhension standard des 5 règles",
          advanced: "Création de règles additionnelles, explication des conséquences"
        }),

        assessmentType: 'Formative et comme apprentissage',
        assessmentNotes: `Observation de la compréhension durant discussions
Auto-évaluation: Quelle règle est difficile pour moi?
Participation à la création de la charte`,

        isSubFriendly: true,
        subNotes: `Focus: Importance et compréhension des règles.
Activité principale: Création de charte de classe.
Important: Approche positive des règles comme protection.
Matériel préparé, scénarios disponibles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 15: Célébrer nos différences
    const lesson15 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébrer nos différences',
        date: new Date('2025-09-24'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Reconnaître que nos différences nous rendent spéciaux
• Célébrer la diversité dans notre classe
• Développer l'appréciation mutuelle`,

        mindsOn: `Le bouquet de fleurs différentes (10 min)
• Présentation: Bouquet avec fleurs variées
• Discussion: Toutes différentes, toutes belles
• Connexion: Nous sommes comme ce bouquet
• Chanson: "Nous sommes tous différents"
• Partage: Une chose unique sur moi`,

        action: `Festival de nos talents (28 min)

PARTIE 1: Découverte des talents (8 min)
• Brainstorm: Qu'est-ce qu'un talent?
• Chacun identifie un talent/intérêt
• Création de "cartes de talent"
• Décoration personnalisée

PARTIE 2: Marché des talents (15 min)
• Installation de mini-stations
• 2 minutes par personne pour montrer/expliquer
• Rotation pour voir tous les talents
• Applaudissements et encouragements
• Photos des démonstrations

PARTIE 3: Mosaïque de classe (5 min)
• Assemblage des cartes de talent
• Création d'une mosaïque murale
• Observation: Quelle belle diversité!`,

        consolidation: `Célébration de notre arc-en-ciel (7 min)
• Cercle avec nos cartes
• Chanson de célébration créée ensemble
• Compliments en chaîne
• Photo de notre mosaïque
• Message: Nos différences nous enrichissent!`,

        materials: JSON.stringify([
          "Bouquet de fleurs variées",
          "Cartes vierges pour talents",
          "Matériel de décoration",
          "Espace pour mini-stations",
          "Appareil photo",
          "Grande affiche pour mosaïque"
        ]),

        accommodations: JSON.stringify([
          "Talents variés acceptés (physiques, créatifs, sociaux)",
          "Support pour identifier talents",
          "Options de présentation (montrer, dire, dessiner)",
          "Encouragement constant",
          "Espace calme si anxiété"
        ]),

        modifications: JSON.stringify({
          struggling: "Un talent simple, support pour présentation",
          onLevel: "Présentation standard du talent",
          advanced: "Multiple talents, aide aux autres pour découvrir"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Observation de l'appréciation des différences
Réflexion: Qu'ai-je appris sur mes amis?
Création et présentation de carte de talent`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration de la diversité et des talents uniques.
Activité principale: Festival de talents et mosaïque.
Important: Valoriser tous les talents, créer inclusion.
Espace organisé pour stations, matériel prêt.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 16: Grande célébration de notre communauté!
    const lesson16 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Grande célébration de notre communauté!',
        date: new Date('2025-09-26'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer tout ce que nous avons appris sur la communauté
• Partager nos créations et découvertes
• Renforcer notre sentiment d'appartenance`,

        mindsOn: `Préparation de la célébration (10 min)
• Rappel de notre voyage de 4 semaines
• Installation de nos créations (musée, carte, mosaïque)
• Pratique de notre cri de ralliement
• Distribution des rôles pour la célébration
• Excitement building: C'est NOTRE fête!`,

        action: `Festival communautaire de classe (30 min)

PARTIE 1: Exposition vivante (10 min)
• Tour guidé de nos créations
• Livre de merci (semaine 3)
• Carte communautaire (semaine 3)
• Musée de l'école (semaine 4)
• Mosaïque des talents (semaine 4)

PARTIE 2: Performances et partages (10 min)
• Chanson des métiers
• Présentation de nos héros
• Démonstration de talents
• Lecture de nos règles d'or

PARTIE 3: Activités festives (10 min)
• Jeux communautaires appris
• Danse de célébration
• Création d'un livre collectif
• Photos souvenirs`,

        consolidation: `Clôture et engagement futur (5 min)
• Cercle de gratitude
• Chacun nomme un apprentissage important
• Remise de certificats "Membre extraordinaire de notre communauté"
• Photo de groupe finale
• Promesse: Continuer à être une communauté unie!`,

        materials: JSON.stringify([
          "Toutes les créations des 4 semaines",
          "Certificats pour chaque élève",
          "Musique pour danse",
          "Appareil photo",
          "Livre vierge pour création collective",
          "Décorations festives"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés selon confort",
          "Options de participation",
          "Support pour présentations",
          "Espace calme disponible",
          "Célébration de tous les efforts"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, support constant",
          onLevel: "Participation active standard",
          advanced: "Rôles de leadership, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Observation de la participation et de la fierté
Réflexion finale sur les apprentissages
Portfolio: Compilation des 4 semaines`,

        isSubFriendly: true,
        subNotes: `Focus: Grande célébration de l'unité communauté.
Activité principale: Festival avec exposition et performances.
Important: Tous participent, ambiance festive et inclusive.
Toutes créations installées, certificats prêts.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 9: Les gens qui nous aident');
    console.log('✅ Created Lesson 10: Un héros dans notre classe');
    console.log('✅ Created Lesson 11: Nous sommes des aides!');
    console.log('✅ Created Lesson 12: La carte de notre communauté');
    console.log('✅ Created Lesson 13: Notre école, notre deuxième maison');
    console.log('✅ Created Lesson 14: Les règles qui nous protègent');
    console.log('✅ Created Lesson 15: Célébrer nos différences');
    console.log('✅ Created Lesson 16: Grande célébration de notre communauté!');

    console.log('\n📊 WEEKS 3-4 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Ma famille et ma communauté');
    console.log('Dates: September 15-26, 2025');
    console.log('\nWeek 3 Focus:');
    console.log('✅ Community helpers and roles');
    console.log('✅ Guest speaker integration');
    console.log('✅ Children as helpers');
    console.log('✅ Community mapping');
    console.log('\nWeek 4 Focus:');
    console.log('✅ School as community');
    console.log('✅ Rules and safety');
    console.log('✅ Celebrating diversity');
    console.log('✅ Grand celebration finale');
    console.log('\nKey Features:');
    console.log('✅ ETFO three-part structure throughout');
    console.log('✅ Perfect developmental appropriateness');
    console.log('✅ Progressive skill building');
    console.log('✅ Family and community engagement');
    console.log('✅ Portfolio development continues');
    console.log('✅ Building toward final performance task');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks3And4Lessons().catch(console.error);