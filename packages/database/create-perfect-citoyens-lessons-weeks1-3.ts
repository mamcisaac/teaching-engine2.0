import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWeeks1To3CitoyensLessons() {
  console.log('🎯 CREATING PERFECT LESSON PLANS - WEEKS 1-3');
  console.log('Unit: Citoyens responsables');
  console.log('Focus: Digital Citizenship and Online Safety');
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
        title: 'Citoyens responsables'
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
      throw new Error('Unit plan Citoyens responsables not found');
    }

    console.log('Found unit:', unitPlan.title);
    console.log('Creating 12 lessons for Weeks 1-3\n');

    // WEEK 1: Introduction to Digital World (April 1-3, 2026)
    
    // Lesson 1: Qu'est-ce que le monde numérique?
    const lesson1 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Qu\'est-ce que le monde numérique?',
        date: new Date('2026-04-01'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre ce qu'est le monde numérique
• Identifier les appareils numériques autour d'eux
• Reconnaître que le numérique fait partie de leur vie`,

        mindsOn: `La boîte mystérieuse (10 min)
• Boîte avec objets: livre, tablette, crayon, téléphone
• Élèves devinent et trient
• "Lesquels utilisent l'électricité et l'internet?"
• Introduction: numérique = avec ordinateur/internet
• Discussion: Où voyez-vous le numérique?
• Réalisation: C'est partout!`,

        action: `Exploration du monde numérique (28 min)

PARTIE 1: Chasse aux appareils (13 min)
• Tour de la classe/école (virtuel ou réel)
• Identifier les appareils numériques:
  - Ordinateurs
  - Tablettes
  - Tableau interactif
  - Téléphones
  - Caméras
• Liste créée ensemble
• Dessins rapides de chaque

PARTIE 2: Mon monde numérique (15 min)
• Feuille divisée en 3: Maison/École/Communauté
• Dessiner les appareils dans chaque lieu
• Partage avec partenaire
• Réalisation: Le numérique est partout!
• Création d'une carte mentale collective`,

        consolidation: `Citoyens de deux mondes (7 min)
• "Nous vivons dans deux mondes"
• Monde réel (physique) et monde numérique
• Les deux sont importants!
• Badge "Explorateur numérique"
• Mission: Observer le numérique à la maison`,

        materials: JSON.stringify([
          "Boîte avec objets variés",
          "Images d'appareils numériques",
          "Papier divisé en sections",
          "Marqueurs et crayons",
          "Badges explorateur",
          "Carte mentale grand format"
        ]),

        accommodations: JSON.stringify([
          "Support visuel constant",
          "Exemples concrets et familiers",
          "Travail en dyade possible",
          "Aide pour identification",
          "Flexibilité dans l'expression"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 appareils simples à identifier",
          onLevel: "Identification standard des appareils",
          advanced: "Connexions entre appareils, utilisations"
        }),

        assessmentType: 'Diagnostique',
        assessmentNotes: `Évaluation des connaissances préalables sur le numérique
Compréhension du concept de monde numérique
Capacité à identifier les technologies`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction au concept de monde numérique.
Activité principale: Identification des appareils.
Important: Approche neutre et exploratoire.
Pas de jugement sur l'utilisation.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 2: Je suis un citoyen numérique
    const lesson2 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Je suis un citoyen numérique',
        date: new Date('2026-04-02'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre qu'ils sont des citoyens numériques
• Reconnaître leurs actions en ligne
• Développer une identité numérique positive`,

        mindsOn: `Mon avatar (10 min)
• "Si vous étiez dans un jeu vidéo..."
• Dessiner rapidement son avatar
• Partage: "Mon avatar est..."
• Discussion: C'est vous en ligne!
• Introduction: Citoyen numérique = vous en ligne
• Question: Comment être un bon citoyen?`,

        action: `Citoyenneté numérique (28 min)

PARTIE 1: Bon citoyen partout (13 min)
• Deux colonnes: Monde réel / Monde numérique
• Comportements de bon citoyen:
  - Réel: Être gentil, partager, aider
  - Numérique: Mêmes règles!
• Exemples concrets:
  - Ne pas dire de méchancetés
  - Demander avant de partager
  - Respecter les autres
• Réalisation: Mêmes valeurs partout!

PARTIE 2: Ma carte de citoyen numérique (15 min)
• Création de carte d'identité numérique
• Photo/dessin de soi
• Nom de citoyen (prénom seulement)
• Mes promesses numériques:
  - Je suis gentil
  - Je demande de l'aide
  - Je respecte les autres
• Signature officielle
• Plastification symbolique`,

        consolidation: `Serment du citoyen numérique (7 min)
• Lever la main droite
• "Je promets d'être un bon citoyen..."
• "Dans le monde réel ET numérique!"
• Remise officielle des cartes
• Photo de groupe des citoyens
• Applaudissements!`,

        materials: JSON.stringify([
          "Papier pour avatars",
          "Modèle de carte d'identité",
          "Matériel de décoration",
          "Plastifieuse (ou pochettes)",
          "Appareil photo",
          "Tableau deux colonnes"
        ]),

        accommodations: JSON.stringify([
          "Support pour concept abstrait",
          "Exemples très concrets",
          "Aide pour promesses",
          "Expression flexible",
          "Participation adaptée"
        ]),

        modifications: JSON.stringify({
          struggling: "1-2 promesses simples",
          onLevel: "3 promesses, carte complète",
          advanced: "Promesses détaillées, explications"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'identité numérique
Transfert des valeurs réel-numérique
Engagement personnel`,

        isSubFriendly: true,
        subNotes: `Focus: Introduction à la citoyenneté numérique.
Activité principale: Création de carte d'identité.
Important: Message positif sur l'identité.
Lien avec comportement réel.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 3: La gentillesse en ligne
    const lesson3 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'La gentillesse en ligne',
        date: new Date('2026-04-03'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance de la gentillesse en ligne
• Identifier des comportements gentils numériques
• Pratiquer la communication positive`,

        mindsOn: `Mots qui font mal, mots qui guérissent (10 min)
• Deux cœurs en papier
• Un cœur froissé avec mots méchants
• Un cœur intact avec mots gentils
• "Les mots en ligne sont VRAIS"
• Ils peuvent blesser ou rendre heureux
• Question: Comment être gentil en ligne?`,

        action: `Gentillesse numérique (28 min)

PARTIE 1: Situations en ligne (13 min)
• Scénarios simples présentés:
  - Ami partage un dessin en ligne
  - Quelqu'un fait une erreur dans un jeu
  - Nouveau dans la classe virtuelle
• Pour chaque: Que dire/faire?
• Réponses gentilles modélisées:
  - "Beau dessin!"
  - "Pas grave, tu vas réussir!"
  - "Bienvenue!"

PARTIE 2: Émojis de gentillesse (15 min)
• Exploration des émojis positifs
• Création de notre dictionnaire:
  - 😊 = je suis content
  - ❤️ = j'aime
  - 👍 = bravo
  - 🤗 = câlin virtuel
• Pratique d'envoi de messages gentils
• Chaîne de gentillesse créée`,

        consolidation: `Ambassadeurs de gentillesse (7 min)
• Badge "Gentillesse numérique"
• Engagement: Un message gentil par jour
• Démonstration: Comment ça fait sentir?
• Mission: Répandre la joie en ligne!`,

        materials: JSON.stringify([
          "Deux cœurs en papier",
          "Cartes de scénarios",
          "Tableau d'émojis",
          "Papier pour dictionnaire",
          "Badges gentillesse",
          "Exemples de messages"
        ]),

        accommodations: JSON.stringify([
          "Scénarios simplifiés",
          "Support pour réponses",
          "Émojis limités si nécessaire",
          "Aide pour expression",
          "Modélisation constante"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 émojis, réponses simples",
          onLevel: "Participation standard",
          advanced: "Messages complexes, aide aux autres"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Application de la gentillesse en ligne
Utilisation appropriée des émojis
Communication positive démontrée`,

        isSubFriendly: true,
        subNotes: `Focus: Gentillesse et communication positive en ligne.
Activité principale: Pratique de messages gentils.
Important: Renforcement positif constant.
Éviter les exemples négatifs détaillés.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 4: Vendredi saint - Pas de cours
    // Note: April 4, 2026 would be Good Friday

    // WEEK 2: Online Safety Basics (April 6-10, 2026)

    // Lesson 5: Les informations personnelles
    const lesson5 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les informations personnelles',
        date: new Date('2026-04-06'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Identifier leurs informations personnelles
• Comprendre ce qui est privé
• Apprendre à protéger leurs informations`,

        mindsOn: `Le trésor secret (10 min)
• Coffre au trésor fermé à clé
• "Certaines choses sont précieuses et privées"
• Qu'est-ce qu'on garde secret?
• Discussion: Informations = trésors
• Certaines on partage, d'autres NON
• Introduction: Protégeons nos trésors!`,

        action: `Protection des informations (28 min)

PARTIE 1: Trier les informations (13 min)
• Cartes avec informations:
  - Prénom (OK à partager)
  - Couleur préférée (OK)
  - Adresse (PRIVÉ!)
  - Nom complet (PRIVÉ!)
  - Âge exact (PRIVÉ!)
  - Animal préféré (OK)
• Tri en deux piles: Partager / Garder secret
• Discussion de chaque choix

PARTIE 2: Mon coffre-fort personnel (15 min)
• Création d'un coffre en papier
• Décorer avec cadenas dessiné
• Mettre dedans (dessins/mots):
  - Nom de famille
  - Adresse
  - Téléphone
  - Mots de passe
  - Photos personnelles
• Fermer symboliquement
• Message: "Privé! Ne pas partager!"`,

        consolidation: `Gardiens des secrets (7 min)
• Serment des gardiens
• "Je protège mes informations"
• Règle d'or: En cas de doute, demander!
• Badge "Gardien des secrets"
• Mission: Parler avec les parents`,

        materials: JSON.stringify([
          "Coffre au trésor",
          "Cartes d'informations",
          "Papier pour coffre-fort",
          "Matériel de décoration",
          "Badges gardien",
          "Cadenas symbolique"
        ]),

        accommodations: JSON.stringify([
          "Concepts simplifiés",
          "Support visuel constant",
          "Répétition des règles",
          "Aide pour tri",
          "Exemples personnalisés"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 informations de base",
          onLevel: "Compréhension standard",
          advanced: "Nuances, situations complexes"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Identification des informations privées
Compréhension de la protection
Application des règles de sécurité`,

        isSubFriendly: true,
        subNotes: `Focus: Protection des informations personnelles.
Activité principale: Tri et coffre-fort personnel.
Important: Message clair sur la sécurité.
Impliquer les parents.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 6: Les étrangers en ligne
    const lesson6 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les étrangers en ligne',
        date: new Date('2026-04-07'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre qui sont les étrangers en ligne
• Apprendre les règles de sécurité
• Savoir quand demander de l'aide`,

        mindsOn: `Qui connaissez-vous vraiment? (10 min)
• Photos: famille, amis, enseignant, inconnu
• Trier: Je connais / Je ne connais pas
• "En ligne, on ne voit pas toujours qui c'est"
• Même avec photo ou nom gentil!
• Règle importante: Si je ne connais pas = étranger
• Question: Que faire avec les étrangers?`,

        action: `Sécurité avec les étrangers (28 min)

PARTIE 1: Les règles d'or (13 min)
• 3 règles simples:
  1. NE JAMAIS donner d'informations
  2. NE JAMAIS accepter de rencontrer
  3. TOUJOURS dire à un adulte
• Scénarios pratiques:
  - "Quelqu'un demande où tu habites"
  - "Veux-tu être mon ami?"
  - "Envoie-moi une photo"
• Réponse: "Je dois demander à mes parents"

PARTIE 2: Mon cercle de confiance (15 min)
• Dessiner des cercles concentriques
• Centre: Moi
• Cercle 1: Famille proche
• Cercle 2: Amis et enseignants
• Extérieur: Étrangers
• Qui peut me demander des choses?
• Décoration du cercle de confiance`,

        consolidation: `Super-héros de la sécurité (7 min)
• Cape de sécurité symbolique
• "Mon super-pouvoir: dire NON!"
• "Mon arme secrète: dire à un adulte!"
• Badge "Héros prudent"
• Mission: Montrer le cercle aux parents`,

        materials: JSON.stringify([
          "Photos de personnes variées",
          "Affiches des 3 règles",
          "Papier pour cercles",
          "Cape symbolique",
          "Badges héros",
          "Scénarios illustrés"
        ]),

        accommodations: JSON.stringify([
          "Règles très simplifiées",
          "Répétition constante",
          "Support pour cercle",
          "Langage adapté",
          "Renforcement positif"
        ]),

        modifications: JSON.stringify({
          struggling: "2 règles de base, support maximum",
          onLevel: "3 règles, application standard",
          advanced: "Situations variées, nuances"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension du danger des étrangers
Application des règles de sécurité
Identification du cercle de confiance`,

        isSubFriendly: true,
        subNotes: `Focus: Sécurité avec les étrangers en ligne.
Activité principale: Règles et cercle de confiance.
Important: Ton rassurant mais ferme.
Parents informés du contenu.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 7: Demander la permission
    const lesson7 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Demander la permission',
        date: new Date('2026-04-08'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre quand demander la permission
• Pratiquer la demande d'autorisation
• Développer de bonnes habitudes numériques`,

        mindsOn: `Feu rouge, feu vert (10 min)
• Jeu classique adapté
• Feu vert = OK tout seul
• Feu jaune = Réfléchir
• Feu rouge = STOP! Demander!
• Exemples: jouer dehors, manger bonbon, utiliser tablette
• Introduction: En ligne, beaucoup de feux rouges!`,

        action: `Permission numérique (28 min)

PARTIE 1: Quand demander? (13 min)
• Situations présentées:
  - Télécharger un jeu
  - Regarder une vidéo
  - Créer un compte
  - Donner son nom
  - Cliquer sur publicité
• Classification: Feu vert/jaune/rouge
• Règle: Dans le doute = ROUGE!
• Pratique de la demande polie

PARTIE 2: Contrat familial (15 min)
• Création d'un contrat simple:
  "Je promets de demander avant de..."
  - Télécharger
  - M'inscrire
  - Donner des infos
  - Acheter
• Décoration officielle
• Espace pour signatures
• À rapporter à la maison`,

        consolidation: `Champions de la permission (7 min)
• Jeu rapide: "Je peux...?"
• Réponses en chœur: "Demande d'abord!"
• Badge "Champion prudent"
• Mission: Faire signer le contrat
• Célébration de la prudence!`,

        materials: JSON.stringify([
          "Feux tricolores en carton",
          "Cartes de situations",
          "Modèle de contrat",
          "Matériel de décoration",
          "Badges champion",
          "Exemples visuels"
        ]),

        accommodations: JSON.stringify([
          "Situations très simples",
          "Support visuel constant",
          "Répétition des règles",
          "Aide pour contrat",
          "Langage simplifié"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 situations de base",
          onLevel: "Compréhension standard",
          advanced: "Situations complexes, explications"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Identification des situations nécessitant permission
Pratique de la demande
Engagement familial`,

        isSubFriendly: true,
        subNotes: `Focus: Habitude de demander la permission.
Activité principale: Feux tricolores et contrat.
Important: Impliquer les familles.
Renforcer l'autonomie guidée.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 8: Les mots de passe
    const lesson8 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les mots de passe',
        date: new Date('2026-04-10'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance des mots de passe
• Apprendre à garder les mots de passe secrets
• Développer de bonnes habitudes de sécurité`,

        mindsOn: `La clé magique (10 min)
• Boîte verrouillée avec trésor
• "Comment l'ouvrir?" - Avec une clé!
• "Le mot de passe = clé numérique"
• Protège nos choses importantes
• Si quelqu'un a votre clé...?
• Introduction: Protégeons nos clés!`,

        action: `Sécurité des mots de passe (28 min)

PARTIE 1: Règles des mots de passe (13 min)
• 4 règles simples:
  1. Ne JAMAIS le dire (même aux amis)
  2. Ne JAMAIS l'écrire visible
  3. Parents peuvent savoir
  4. Différent pour chaque chose
• Jeu: "Peux-tu dire ton mot de passe à...?"
  - Meilleur ami? NON!
  - Enseignant? NON!
  - Parents? OUI!
• Pratique du refus poli

PARTIE 2: Coffre à mots de passe (15 min)
• Création d'un coffre familial
• Enveloppe décorée "TOP SECRET"
• Message aux parents inclus
• Explication de l'importance
• Scellé avec autocollant
• À garder à la maison en sécurité`,

        consolidation: `Gardiens des clés (7 min)
• Cérémonie des gardiens
• Clé symbolique remise
• "Je protège mes mots de passe!"
• Badge "Gardien des clés"
• Mission: Expliquer aux parents`,

        materials: JSON.stringify([
          "Boîte avec cadenas",
          "Clés décoratives",
          "Enveloppes",
          "Autocollants SECRET",
          "Badges gardien",
          "Affiches des règles"
        ]),

        accommodations: JSON.stringify([
          "Règles simplifiées",
          "Support visuel",
          "Répétition constante",
          "Aide pour coffre",
          "Exemples concrets"
        ]),

        modifications: JSON.stringify({
          struggling: "2 règles principales",
          onLevel: "4 règles, application",
          advanced: "Concepts avancés, exemples"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'importance des mots de passe
Application des règles de sécurité
Communication avec la famille`,

        isSubFriendly: true,
        subNotes: `Focus: Sécurité des mots de passe.
Activité principale: Règles et coffre secret.
Important: Message clair et simple.
Collaboration parentale essentielle.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // WEEK 3: Being Smart Online (April 13-17, 2026)

    // Lesson 9: Les sites web sécuritaires
    const lesson9 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Les sites web sécuritaires',
        date: new Date('2026-04-13'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Reconnaître les sites web sécuritaires
• Identifier les signes de danger
• Savoir quoi faire face à l'inconnu`,

        mindsOn: `Maisons sûres vs dangereuses (10 min)
• Images: belle maison vs maison abandonnée
• "Où entreriez-vous?"
• Discussion: Pourquoi?
• "Les sites web sont comme des maisons"
• Certains sûrs, d'autres non
• Question: Comment reconnaître?`,

        action: `Détectives de sécurité (28 min)

PARTIE 1: Signes de sécurité (13 min)
• Sites sûrs ont:
  - Cadenas (dans la barre)
  - Connus par parents/école
  - Pour enfants (couleurs, images)
  - Pas de publicités bizarres
• Sites dangereux:
  - Demandent informations
  - Pop-ups partout
  - Choses gratuites promises
• Jeu: Sûr ou pas sûr?

PARTIE 2: Ma liste de sites approuvés (15 min)
• Création d'un carnet de sites
• Page 1: Sites de l'école
• Page 2: Sites approuvés par parents
• Page 3: Règles de sécurité
• Décoration style "passeport web"
• Espace pour nouveaux sites`,

        consolidation: `Navigateurs prudents (7 min)
• Certificat de navigateur prudent
• Règle finale: "Si bizarre = FERMER!"
• "Si doute = DEMANDER!"
• Badge navigateur
• Mission: Montrer le carnet aux parents`,

        materials: JSON.stringify([
          "Images de maisons",
          "Exemples de sites",
          "Carnets vierges",
          "Autocollants cadenas",
          "Certificats et badges",
          "Marqueurs colorés"
        ]),

        accommodations: JSON.stringify([
          "Exemples très visuels",
          "Règles simplifiées",
          "Support pour carnet",
          "Répétition des signes",
          "Aide constante"
        ]),

        modifications: JSON.stringify({
          struggling: "2-3 signes de base",
          onLevel: "Identification standard",
          advanced: "Détails supplémentaires"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Reconnaissance des sites sécuritaires
Application des critères
Création d'outils de référence`,

        isSubFriendly: true,
        subNotes: `Focus: Identification des sites web sûrs.
Activité principale: Carnet de sites approuvés.
Important: Exemples concrets et visuels.
Collaboration avec les familles.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 10: Le temps d'écran équilibré
    const lesson10 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Le temps d\'écran équilibré',
        date: new Date('2026-04-14'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Comprendre l'importance de l'équilibre
• Identifier des activités variées
• Créer un plan d'équilibre personnel`,

        mindsOn: `La balance de la journée (10 min)
• Balance avec deux plateaux
• D'un côté: tablette (lourd)
• Autre côté: vide (déséquilibré!)
• Ajouter: livre, ballon, ami
• Équilibre retrouvé!
• Message: Variété = santé!`,

        action: `Équilibre numérique (28 min)

PARTIE 1: Activités arc-en-ciel (13 min)
• Arc-en-ciel d'activités:
  - Rouge: Écran (jeux, vidéos)
  - Orange: Lecture
  - Jaune: Jeu actif
  - Vert: Nature
  - Bleu: Arts
  - Violet: Amis/famille
• "Une journée arc-en-ciel est belle!"
• Exemples de chaque couleur

PARTIE 2: Mon horaire arc-en-ciel (15 min)
• Création d'un horaire visuel
• Matin/Après-midi/Soir
• Coller des activités variées
• Maximum 2 rouges par jour
• Célébration de la variété
• Engagement personnel`,

        consolidation: `Champions de l'équilibre (7 min)
• Présentation des horaires
• "Mon activité préférée sans écran..."
• Médaille d'équilibre
• Défi: Journée arc-en-ciel demain!
• Photo des champions`,

        materials: JSON.stringify([
          "Balance à plateaux",
          "Arc-en-ciel grand format",
          "Images d'activités",
          "Papier horaire",
          "Colle et ciseaux",
          "Médailles équilibre"
        ]),

        accommodations: JSON.stringify([
          "Concept simplifié",
          "Support visuel constant",
          "Horaire adapté",
          "Flexibilité des choix",
          "Aide pour planification"
        ]),

        modifications: JSON.stringify({
          struggling: "3-4 activités simples",
          onLevel: "Horaire complet varié",
          advanced: "Planification détaillée"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension de l'équilibre
Identification d'activités variées
Engagement personnel`,

        isSubFriendly: true,
        subNotes: `Focus: Équilibre du temps d'écran.
Activité principale: Horaire arc-en-ciel.
Important: Message positif, pas de culpabilisation.
Valoriser toutes les activités.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 11: Être créatif avec la technologie
    const lesson11 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Être créatif avec la technologie',
        date: new Date('2026-04-15'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Découvrir les usages créatifs de la technologie
• Comprendre la différence entre consommer et créer
• Explorer leur créativité numérique`,

        mindsOn: `Consommateur ou créateur? (10 min)
• Deux chapeaux: spectateur vs artiste
• "Regarder YouTube" = spectateur
• "Faire une vidéo" = artiste
• "Jouer un jeu" vs "Inventer un jeu"
• Discussion: Qu'est-ce qui est plus amusant?
• Introduction: Soyons des créateurs!`,

        action: `Créateurs numériques (28 min)

PARTIE 1: Idées de création (13 min)
• Brainstorm de créations possibles:
  - Prendre des photos artistiques
  - Enregistrer une histoire
  - Dessiner sur tablette
  - Créer une chanson
  - Faire une vidéo de danse
• Chacun partage une idée
• Liste collective créée

PARTIE 2: Mon projet créatif (15 min)
• Planification d'un projet simple
• Choix individuel
• Dessin/plan du projet
• Étapes identifiées
• Matériel nécessaire listé
• Présentation aux pairs`,

        consolidation: `Artistes numériques (7 min)
• Galerie des projets planifiés
• "Je vais créer..."
• Béret d'artiste numérique
• Engagement: Créer, pas juste regarder
• Célébration de la créativité!`,

        materials: JSON.stringify([
          "Deux chapeaux différents",
          "Tableau pour brainstorm",
          "Papier projet",
          "Matériel de planification",
          "Bérets d'artiste",
          "Exemples de créations"
        ]),

        accommodations: JSON.stringify([
          "Projets adaptés aux capacités",
          "Support pour planification",
          "Options variées",
          "Aide technique promise",
          "Flexibilité créative"
        ]),

        modifications: JSON.stringify({
          struggling: "Projet très simple",
          onLevel: "Projet standard structuré",
          advanced: "Projet complexe, détaillé"
        }),

        assessmentType: 'Formative',
        assessmentNotes: `Compréhension création vs consommation
Planification créative
Engagement dans la création`,

        isSubFriendly: true,
        subNotes: `Focus: Utilisation créative de la technologie.
Activité principale: Planification de projet.
Important: Valoriser toutes les idées.
Encourager l'expression créative.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    // Lesson 12: Célébration - Citoyens numériques certifiés
    const lesson12 = await prisma.eTFOLessonPlan.create({
      data: {
        userId: user.id,
        unitPlanId: unitPlan.id,
        title: 'Célébration - Citoyens numériques certifiés',
        date: new Date('2026-04-17'),
        duration: 45,
        subject: 'Sciences humaines',
        grade: 1,
        language: 'French',
        
        learningGoals: `Les élèves vont:
• Célébrer leurs apprentissages numériques
• Démontrer leurs connaissances
• S'engager pour l'avenir numérique`,

        mindsOn: `Rappel de notre voyage (10 min)
• Photos/travaux des 3 semaines
• "Regardez tout ce qu'on a appris!"
• Rappel des points importants
• Fierté collective
• Annonce: Graduation numérique!`,

        action: `Cérémonie de certification (30 min)

PARTIE 1: Démonstration des savoirs (15 min)
• Stations de démonstration:
  - Station 1: Informations privées
  - Station 2: Gentillesse en ligne
  - Station 3: Sécurité web
  - Station 4: Équilibre écran
• Rotation rapide
• Tampons collectés

PARTIE 2: Graduation officielle (15 min)
• Cérémonie solennelle
• Appel nominatif
• Remise du diplôme
• Photo individuelle
• Serment final du citoyen numérique
• Applaudissements pour chacun`,

        consolidation: `Citoyens certifiés (5 min)
• Photo de groupe
• Cri: "Citoyens numériques responsables!"
• Engagement futur
• Distribution aux parents
• Célébration finale!`,

        materials: JSON.stringify([
          "Travaux des 3 semaines",
          "Stations préparées",
          "Diplômes officiels",
          "Tampons",
          "Appareil photo",
          "Décorations festives"
        ]),

        accommodations: JSON.stringify([
          "Support aux stations",
          "Aide pour démonstration",
          "Participation adaptée",
          "Célébration inclusive",
          "Valorisation de tous"
        ]),

        modifications: JSON.stringify({
          struggling: "Démonstration simplifiée",
          onLevel: "Participation complète",
          advanced: "Aide aux autres, leadership"
        }),

        assessmentType: 'Sommative',
        assessmentNotes: `Démonstration des apprentissages
Application des connaissances
Portfolio numérique complété`,

        isSubFriendly: true,
        subNotes: `Focus: Célébration et certification.
Activité principale: Cérémonie de graduation.
Important: Ambiance festive et formelle.
Parents informés des apprentissages.`,

        expectations: {
          create: unitPlan.expectations.map(exp => ({
            expectationId: exp.expectationId
          }))
        }
      }
    });

    console.log('✅ Created Lesson 1: Qu\'est-ce que le monde numérique?');
    console.log('✅ Created Lesson 2: Je suis un citoyen numérique');
    console.log('✅ Created Lesson 3: La gentillesse en ligne');
    console.log('✅ Created Lesson 5: Les informations personnelles');
    console.log('✅ Created Lesson 6: Les étrangers en ligne');
    console.log('✅ Created Lesson 7: Demander la permission');
    console.log('✅ Created Lesson 8: Les mots de passe');
    console.log('✅ Created Lesson 9: Les sites web sécuritaires');
    console.log('✅ Created Lesson 10: Le temps d\'écran équilibré');
    console.log('✅ Created Lesson 11: Être créatif avec la technologie');
    console.log('✅ Created Lesson 12: Célébration - Citoyens numériques certifiés');

    console.log('\n📊 WEEKS 1-3 SUMMARY');
    console.log('===================');
    console.log('Created 12 perfect lesson plans for Sciences humaines');
    console.log('Unit: Citoyens responsables');
    console.log('Dates: April 1-17, 2026');
    console.log('\nWeek 1 Focus:');
    console.log('✅ Introduction to digital world');
    console.log('✅ Digital citizenship identity');
    console.log('✅ Online kindness');
    console.log('\nWeek 2 Focus:');
    console.log('✅ Personal information protection');
    console.log('✅ Stranger danger online');
    console.log('✅ Permission and passwords');
    console.log('\nWeek 3 Focus:');
    console.log('✅ Safe websites recognition');
    console.log('✅ Screen time balance');
    console.log('✅ Creative technology use');
    console.log('✅ Certification celebration');
    console.log('\nKey Features:');
    console.log('✅ Age-appropriate digital literacy');
    console.log('✅ Safety-first approach');
    console.log('✅ Family involvement');
    console.log('✅ Positive digital identity');
    console.log('✅ Perfect ETFO alignment');

  } catch (error) {
    console.error('Error creating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createWeeks1To3CitoyensLessons().catch(console.error);