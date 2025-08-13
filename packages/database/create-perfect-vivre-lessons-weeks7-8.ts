import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks7And8VivreLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 7-8');
  console.log('Unit: Vivre ensemble');
  console.log('Focus: Democratic Participation and Leadership');
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
    console.log('Creating 8 lessons for Weeks 7-8\n');

    // WEEK 7: Democratic Participation (February 16-20, 2026)
    
    // Lesson 25: La démocratie dans notre classe
    const lesson25 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La démocratie dans notre classe',
        date: new Date('2026-02-16'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est la démocratie
• Apprendre que chaque voix compte
• Pratiquer le vote démocratique`,

        mindsOn: `Le roi décide vs Nous décidons (10 min)
• Scénario 1: Le roi choisit tout seul
• "Le roi dit: On mange des brocolis!"
• Réactions? Pas juste!
• Scénario 2: On vote ensemble
• "Qui veut des pommes? Des oranges?"
• Compter les votes, majorité gagne
• Discussion: Quelle façon préférez-vous?
• Introduction: La démocratie = décider ensemble`,

        action: `Démocratie en action (28 min)

PARTIE 1: Notre première élection (13 min)
• Choix à faire: Mascotte de classe
• 3 candidats proposés (animaux)
• Campagne éclair:
  - Présentation de chaque option
  - Pourquoi voter pour moi?
• Bureau de vote installé
• Bulletins secrets distribués
• Vote officiel, urne utilisée
• Dépouillement public
• Annonce du gagnant!

PARTIE 2: Les décisions démocratiques (15 min)
• Liste de décisions à prendre:
  - Nom de notre coin lecture
  - Chanson du vendredi
  - Jeu de récréation préféré
• Processus pour chaque:
  - Propositions
  - Discussion
  - Vote
• Respect du résultat
• Même si pas mon choix = j'accepte`,

        consolidation: `Citoyens démocrates (7 min)
• Réflexion sur le processus
• "J'ai aimé voter parce que..."
• Carte d'électeur officielle créée
• Badge "Citoyen démocrate"
• Mission: Observer les votes dans la vie`,

        materials: JSON.stringify([
          "Couronne pour le roi",
          "Urne de vote",
          "Bulletins de vote",
          "Isoloir improvisé",
          "Cartes d'électeur",
          "Badges citoyen"
        ]),

        accommodations: JSON.stringify([
          "Vote avec images si nécessaire",
          "Support pour comprendre le processus",
          "Aide pour remplir bulletin",
          "Participation flexible",
          "Respect des choix individuels"
        ]),

        modifications: JSON.stringify({
          struggling: "Vote simple avec aide, concepts de base",
          onLevel: "Participation complète au processus",
          advanced: "Rôle d'organisateur, aide au dépouillement"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du concept de démocratie
Participation au vote
Respect des décisions majoritaires`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction pratique à la démocratie.
Activité principale: Élection de mascotte et votes.
Important: Processus formel mais accessible.
Matériel de vote préparé.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 26: Avoir une voix
    const lesson26 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Avoir une voix',
        date: new Date('2026-02-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre leur droit d'expression
• Apprendre à exprimer leurs opinions
• Développer la confiance pour parler`,

        mindsOn: `Le microphone magique (10 min)
• Microphone spécial présenté
• "Avec ce micro, votre voix est importante"
• Tour rapide: "Mon idée est..."
• Validation: Toutes les idées comptent!
• Discussion: Qui peut avoir des idées?
• Réponse: TOUT LE MONDE!`,

        action: `Amplifier nos voix (28 min)

PARTIE 1: La tribune des idées (13 min)
• Installation d'une tribune officielle
• Thème: Améliorer notre classe
• Chacun peut proposer une idée
• 1 minute au microphone
• Applaudissements pour le courage
• Liste des idées compilée
• Vote pour les 3 meilleures

PARTIE 2: Les voix différentes (15 min)
• Exploration des façons de s'exprimer:
  - Parler fort
  - Écrire/dessiner
  - Gestes et signes
  - Art et musique
• Stations d'expression:
  - Dire son idée
  - Dessiner son idée
  - Mimer son idée
  - Chanter son idée
• Message: Toutes les voix sont valides`,

        consolidation: `Porte-paroles officiels (7 min)
• Certificat de porte-parole
• "Ma voix compte parce que..."
• Engagement: Exprimer mes idées
• Micro tournant institué
• Photo à la tribune`,

        materials: JSON.stringify([
          "Microphone (vrai ou factice)",
          "Tribune/podium improvisé",
          "Tableau pour idées",
          "Matériel pour stations",
          "Certificats porte-parole",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Expression adaptée aux capacités",
          "Temps de parole flexible",
          "Support pour formulation",
          "Options non-verbales valorisées",
          "Encouragement constant"
        ]),

        modifications: JSON.stringify({
          struggling: "Expression simple, beaucoup de support",
          onLevel: "Expression autonome variée",
          advanced: "Facilitation, aide aux autres à s'exprimer"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Confiance dans l'expression
Utilisation de diverses formes
Respect des voix des autres`,

        isSubFriendly: true,
        subNotes: `Focus: Développement de la confiance pour s'exprimer.
Activité principale: Tribune et stations d'expression.
Important: Valoriser toutes les formes d'expression.
Environnement très supportif.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 27: Les leaders parmi nous
    const lesson27 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les leaders parmi nous',
        date: new Date('2026-02-18'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier les qualités d'un bon leader
• Reconnaître le leadership en chacun
• Pratiquer le leadership positif`,

        mindsOn: `Qui est le chef? (10 min)
• Jeu: Suivez le chef (sans parler)
• Observer: Comment savait-on qui suivre?
• Discussion: Qu'est-ce qu'un leader?
• Pas seulement commander!
• Leader = aider, montrer, inspirer
• Question: Qui peut être un leader?
• Réponse: Nous tous!`,

        action: `École de leadership (28 min)

PARTIE 1: Les super-pouvoirs du leader (13 min)
• 5 pouvoirs essentiels:
  1. Écouter les autres
  2. Aider ceux qui ont besoin
  3. Montrer l'exemple
  4. Encourager l'équipe
  5. Être juste avec tous
• Démonstration de chaque pouvoir
• Pratique en petits groupes
• Jeux de rôle: leader positif

PARTIE 2: Leader d'un jour (15 min)
• Rotation de mini-responsabilités:
  - Chef de rang
  - Responsable du matériel
  - Leader de jeu
  - Capitaine d'équipe
  - Médiateur de conflits
• 3 minutes par rôle
• Observer différents styles
• Feedback positif constant`,

        consolidation: `Diplôme de leadership (7 min)
• Réflexion: "Mon style de leader est..."
• Création de badge personnalisé
• Engagement: Un acte de leadership
• Reconnaissance mutuelle
• Photo des leaders de demain`,

        materials: JSON.stringify([
          "Cartes des 5 pouvoirs",
          "Badges de responsabilités",
          "Matériel pour badges personnalisés",
          "Diplômes de leadership",
          "Props pour jeux de rôle",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Leadership adapté aux forces",
          "Rôles selon capacités",
          "Support dans les responsabilités",
          "Durée flexible",
          "Valorisation de tous les styles"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 pouvoirs simples, beaucoup de support",
          onLevel: "Tous les pouvoirs, rotation complète",
          advanced: "Mentorat, leadership complexe"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du leadership positif
Démonstration des qualités de leader
Confiance dans le rôle`,

        isSubFriendly: true,
        subNotes: `Focus: Développement du leadership positif.
Activité principale: École de leadership et rotation.
Important: Leadership = service, pas pouvoir.
Tous ont du potentiel de leader.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 28: Notre conseil de classe
    const lesson28 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre conseil de classe',
        date: new Date('2026-02-20'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer un conseil de classe démocratique
• Apprendre à représenter les autres
• Établir des processus de décision collective`,

        mindsOn: `Le parlement des enfants (10 min)
• Photo du parlement (simplifié)
• "Les adultes se réunissent pour décider"
• Nous aussi, nous pouvons!
• Introduction: Notre conseil de classe
• Rôles: président, secrétaire, membres
• Mission: Prendre des décisions ensemble`,

        action: `Formation du conseil (30 min)

PARTIE 1: Élection du conseil (15 min)
• Candidatures ouvertes pour:
  - Président (anime les réunions)
  - Secrétaire (note les idées)
  - Responsable du temps
  - Gardien des règles
• Discours de 30 secondes
• Vote secret
• Installation officielle
• Remise des insignes

PARTIE 2: Première réunion (15 min)
• Ordre du jour simple:
  1. Problème: Bruit dans les rangs
  2. Solutions proposées
  3. Discussion respectueuse
  4. Vote sur la solution
  5. Plan d'action
• Processus formel mais accessible
• Décision prise ensemble
• Procès-verbal illustré`,

        consolidation: `Conseil permanent (5 min)
• Félicitations au conseil élu
• Calendrier: Réunion chaque vendredi
• Boîte à suggestions installée
• Engagement de tous à participer
• Photo officielle du premier conseil`,

        materials: JSON.stringify([
          "Photo de parlement",
          "Insignes pour les rôles",
          "Urne et bulletins",
          "Maillet en bois (sécuritaire)",
          "Cahier de procès-verbal",
          "Boîte à suggestions"
        ]),

        accommodations: JSON.stringify([
          "Rôles adaptés aux capacités",
          "Support pour les candidatures",
          "Aide pendant les réunions",
          "Participation flexible",
          "Rotation future des rôles"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, rôle de support",
          onLevel: "Candidature et participation active",
          advanced: "Rôles de leadership, facilitation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du processus démocratique
Participation à l'élection
Engagement dans le conseil`,

        isSubFriendly: true,
        subNotes: `Focus: Création d'un conseil de classe démocratique.
Activité principale: Élection et première réunion.
Important: Processus sérieux mais adapté à l'âge.
Structure à maintenir toute l'année.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 8: Building Our Community Identity (February 23-27, 2026)

    // Lesson 29: Nos traditions de classe
    const lesson29 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Nos traditions de classe',
        date: new Date('2026-02-23'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer des traditions de classe uniques
• Comprendre l'importance des rituels collectifs
• Renforcer l'identité du groupe`,

        mindsOn: `Les traditions familiales (10 min)
• "Que fait votre famille chaque année?"
• Partage: anniversaires, fêtes, rituels
• Discussion: Pourquoi c'est important?
• Ça nous unit, c'est spécial pour nous!
• Proposition: Créons NOS traditions!
• Brainstorm: Que pourrait-on faire?`,

        action: `Créateurs de traditions (28 min)

PARTIE 1: Nos rituels quotidiens (13 min)
• Création de rituels uniques:
  - Salutation du matin (geste secret)
  - Chanson du lundi
  - Danse du vendredi
  - Cercle de gratitude du jeudi
• Pratique de chaque rituel
• Vote pour les préférés
• Adoption officielle

PARTIE 2: Nos célébrations spéciales (15 min)
• Calendrier de célébrations:
  - Fête des 100 jours d'école
  - Journée pyjama mensuelle
  - Festival des talents
  - Anniversaire de notre classe
• Planification simple
• Comités formés
• Affiches créées
• Enthousiasme généré!`,

        consolidation: `Gardiens des traditions (7 min)
• Livre des traditions commencé
• Première page: Nos rituels
• Signatures de tous
• Pratique du rituel de fin de journée
• Engagement à maintenir nos traditions`,

        materials: JSON.stringify([
          "Calendrier grand format",
          "Livre vierge pour traditions",
          "Matériel pour affiches",
          "Marqueurs colorés",
          "Appareil photo",
          "Décorations festives"
        ]),

        accommodations: JSON.stringify([
          "Participation adaptée aux capacités",
          "Rituels flexibles",
          "Support pour les célébrations",
          "Options variées",
          "Respect des différences culturelles"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple aux rituels",
          onLevel: "Création active de traditions",
          advanced: "Leadership dans l'organisation"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Contribution aux traditions
Participation aux rituels
Engagement dans l'identité collective`,

        isSubFriendly: true,
        subNotes: `Focus: Création de traditions de classe.
Activité principale: Rituels et célébrations.
Important: Traditions simples et réalisables.
À intégrer dans la routine.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 30: Notre hymne et nos symboles
    const lesson30 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre hymne et nos symboles',
        date: new Date('2026-02-24'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer un hymne de classe
• Designer des symboles représentatifs
• Développer la fierté collective`,

        mindsOn: `Symboles qui nous unissent (10 min)
• Montrer: drapeau canadien, logo école
• "Ces symboles nous représentent"
• Discussion: Que montrent-ils?
• Nos valeurs, notre identité!
• Proposition: Créons nos propres symboles!
• Excitation: Notre drapeau, notre chanson!`,

        action: `Atelier de symboles (30 min)

PARTIE 1: Notre hymne de classe (15 min)
• Mélodie simple choisie (air connu)
• Paroles créées ensemble:
  - Notre classe est...
  - Nous sommes...
  - Ensemble nous...
• Couplet et refrain
• Pratique avec mouvements
• Enregistrement audio
• Fierté immense!

PARTIE 2: Notre drapeau et blason (15 min)
• Éléments à inclure:
  - Nos couleurs (vote)
  - Notre mascotte
  - Symboles de nos valeurs
  - Notre devise
• Création collective sur grand tissu
• Chacun ajoute un élément
• Signatures autour
• Installation cérémonielle`,

        consolidation: `Cérémonie d'inauguration (5 min)
• Levée officielle du drapeau
• Chant de notre hymne
• Récitation de notre devise
• Photos avec nos symboles
• Moment solennel et joyeux`,

        materials: JSON.stringify([
          "Exemples de drapeaux",
          "Grand tissu blanc",
          "Peinture pour tissu",
          "Enregistreur audio",
          "Matériel musical simple",
          "Support pour drapeau"
        ]),

        accommodations: JSON.stringify([
          "Participation selon capacités vocales",
          "Contribution flexible au drapeau",
          "Support pour création",
          "Options non-verbales",
          "Respect de tous les apports"
        ]),

        modifications: JSON.stringify({
          struggling: "Participation simple, support constant",
          onLevel: "Contribution active à la création",
          advanced: "Leadership artistique, coordination"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Contribution créative aux symboles
Participation à l'hymne
Fierté collective démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Création de symboles identitaires.
Activité principale: Hymne et drapeau de classe.
Important: Tous contribuent selon leurs moyens.
Symboles à utiliser régulièrement.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 31: Notre musée de classe
    const lesson31 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre musée de classe',
        date: new Date('2026-02-25'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Créer un musée de nos accomplissements
• Documenter notre histoire collective
• Célébrer notre parcours`,

        mindsOn: `Les musées gardent les souvenirs (10 min)
• "Qui a visité un musée?"
• Les musées gardent les choses importantes
• Photos de musées variés
• Notre classe a une histoire aussi!
• Proposition: Créons notre musée!
• Que mettre dedans?`,

        action: `Construction du musée (28 min)

PARTIE 1: Collection des artefacts (13 min)
• Catégories d'exposition:
  - Nos premières œuvres (septembre)
  - Nos projets spéciaux
  - Photos de moments importants
  - Nos règles et chartes
  - Créations collectives
• Sélection des pièces
• Étiquetage avec dates
• Organisation par thèmes

PARTIE 2: Mise en exposition (15 min)
• Zones créées dans la classe:
  - Coin "Nos débuts"
  - Mur "Nos réussites"
  - Table "Nos créations"
  - Panneau "Notre évolution"
• Installation soignée
• Cartels explicatifs
• Parcours de visite établi`,

        consolidation: `Inauguration du musée (7 min)
• Coupure de ruban officielle
• Première visite guidée
• "Mesdames et messieurs, voici..."
• Photos des conservateurs
• Livre d'or ouvert`,

        materials: JSON.stringify([
          "Travaux depuis septembre",
          "Photos de l'année",
          "Étiquettes et cartels",
          "Ruban pour inauguration",
          "Livre d'or",
          "Supports d'exposition"
        ]),

        accommodations: JSON.stringify([
          "Rôles variés dans le musée",
          "Contribution selon capacités",
          "Support pour étiquetage",
          "Participation flexible",
          "Valorisation de tous les travaux"
        ]),

        modifications: JSON.stringify({
          struggling: "Aide à la sélection, tâches simples",
          onLevel: "Participation complète à l'organisation",
          advanced: "Rôle de conservateur principal"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Réflexion sur le parcours collectif
Organisation et documentation
Fierté des accomplissements`,

        isSubFriendly: true,
        subNotes: `Focus: Création d'un musée de classe.
Activité principale: Collection et exposition.
Important: Valoriser tout le parcours depuis septembre.
Musée à enrichir continuellement.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 32: Notre livre d'or
    const lesson32 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Notre livre d\'or',
        date: new Date('2026-02-27'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Documenter les moments précieux
• Créer une mémoire collective
• Célébrer l'unité de la classe`,

        mindsOn: `Les souvenirs précieux (10 min)
• Boîte de souvenirs personnels montrée
• "J'ai gardé ça parce que..."
• Discussion: Pourquoi garder des souvenirs?
• Pour se rappeler les bons moments!
• Notre classe a des souvenirs précieux
• Créons un livre pour les garder!`,

        action: `Création du livre d'or (30 min)

PARTIE 1: Pages thématiques (15 min)
• Sections du livre:
  - "Nos premières fois" (première journée, etc.)
  - "Nos moments drôles"
  - "Nos défis surmontés"
  - "Nos célébrations"
  - "Nos amitiés"
• Contribution à chaque section
• Dessins, mots, photos
• Décoration collaborative

PARTIE 2: Messages personnels (15 min)
• Page individuelle pour chacun
• "Ce que j'aime dans notre classe"
• "Mon meilleur souvenir"
• "Mes amis sont..."
• Illustration personnelle
• Signatures et dédicaces mutuelles`,

        consolidation: `Scellement du livre (5 min)
• Lecture de quelques pages
• Émotion partagée
• Livre placé dans coffre spécial
• Promesse: Ouvrir en juin
• Photo avec notre trésor`,

        materials: JSON.stringify([
          "Grand livre vierge ou cahier",
          "Photos imprimées",
          "Matériel d'art varié",
          "Colle et ciseaux",
          "Coffre ou boîte spéciale",
          "Appareil photo"
        ]),

        accommodations: JSON.stringify([
          "Expression adaptée (dessin, dictée)",
          "Support pour souvenirs",
          "Pages personnelles flexibles",
          "Aide pour écriture",
          "Respect de la participation choisie"
        ]),

        modifications: JSON.stringify({
          struggling: "Contribution simple, beaucoup d'aide",
          onLevel: "Pages complètes, expression autonome",
          advanced: "Organisation, aide aux autres"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Réflexion sur l'expérience collective
Expression des sentiments d'appartenance
Portfolio émotionnel complété`,

        isSubFriendly: true,
        subNotes: `Focus: Documentation des souvenirs collectifs.
Activité principale: Création du livre d'or.
Important: Moment émotionnel, atmosphère spéciale.
Livre à rouvrir en fin d'année.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 25: La démocratie dans notre classe');
    console.log('✅ Created Lesson 26: Avoir une voix');
    console.log('✅ Created Lesson 27: Les leaders parmi nous');
    console.log('✅ Created Lesson 28: Notre conseil de classe');
    console.log('✅ Created Lesson 29: Nos traditions de classe');
    console.log('✅ Created Lesson 30: Notre hymne et nos symboles');
    console.log('✅ Created Lesson 31: Notre musée de classe');
    console.log('✅ Created Lesson 32: Notre livre d\'or');

    console.log('\n📊 WEEKS 7-8 SUMMARY');
    console.log('===================');
    console.log('Created 8 perfect lesson plans for Sciences humaines');
    console.log('Unit: Vivre ensemble');
    console.log('Dates: February 16-27, 2026');
    console.log('\nWeek 7 Focus:');
    console.log('✅ Understanding democracy');
    console.log('✅ Finding and using voice');
    console.log('✅ Developing leadership');
    console.log('✅ Creating class council');
    console.log('\nWeek 8 Focus:');
    console.log('✅ Building class traditions');
    console.log('✅ Creating identity symbols');
    console.log('✅ Documenting our history');
    console.log('✅ Celebrating our unity');
    console.log('\nKey Features:');
    console.log('✅ Democratic participation skills');
    console.log('✅ Leadership development');
    console.log('✅ Identity building');
    console.log('✅ Collective memory creation');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks7And8VivreLessons().catch(console.error);