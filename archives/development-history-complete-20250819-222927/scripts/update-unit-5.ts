import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit5() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 5: Géographie et cartographie');
    
    const richDescription = `Cette unité transforme les jeunes élèves de 6 ans en géographes en herbe, leur donnant les outils fondamentaux pour comprendre et représenter leur monde spatial. Construisant sur leurs explorations de quartier précédentes, les élèves approfondissent leurs compétences cartographiques tout en développant une compréhension plus large de leur place dans le contexte géographique provincial, national et mondial.

L'unité introduit les concepts géographiques essentiels à travers des expériences concrètes et manipulatives. Les élèves progressent de la compréhension de l'espace immédiat (leur bureau, leur classe) vers des concepts plus abstraits (leur province, leur pays, les océans). Ils apprennent que la géographie est l'étude des lieux et des connexions entre les lieux, développant un vocabulaire français riche pour décrire et analyser l'espace.

Un aspect central est la maîtrise progressive des outils cartographiques. Les élèves explorent différents types de cartes - cartes routières, cartes topographiques, globes terrestres, cartes météorologiques - apprenant que chaque type de carte nous raconte une histoire différente sur le même endroit. Ils créent leurs propres cartes, développant une compréhension des symboles, des échelles, des légendes et des directions.

L'exploration des directions cardinales devient un jeu d'apprentissage quotidien. Les élèves utilisent des boussoles simples, observent le soleil et les étoiles, et apprennent à s'orienter dans différents environnements. Ces compétences d'orientation deviennent des outils pratiques qu'ils utilisent dans leur vie quotidienne.

L'intégration de perspectives Mi'kmaq explore respectueusement les méthodes traditionnelles de navigation et d'orientation qui ne dépendent pas de la technologie moderne. Les élèves apprennent comment les peuples autochtones ont navigué sur de vastes territoires en utilisant les étoiles, les modèles de vent, les caractéristiques naturelles et les cycles saisonniers.

La technologie géographique moderne est introduite de manière appropriée à l'âge, avec des explorations simples des applications cartographiques et des concepts GPS. Les élèves comparent les méthodes traditionnelles et modernes de navigation, développant une appréciation pour l'évolution des outils géographiques.

Cette unité établit une fondation solide pour la pensée géographique qui servira les élèves tout au long de leur éducation et leur vie.`;

    const richDescriptionFr = `Cette unité développe de jeunes géographes compétents qui peuvent créer, lire et utiliser des cartes pour comprendre leur monde. En français immersion, les élèves maîtrisent les outils cartographiques essentiels tout en explorant leur place dans la province, le pays et le monde, développant une perspective géographique riche et des compétences pratiques d'orientation.`;

    const profoundBigIdeas = `Les cartes sont des outils puissants qui nous aident à comprendre où nous sommes, où nous allons, et comment les lieux se connectent. Chaque endroit sur Terre a une adresse géographique unique et des caractéristiques spéciales. En apprenant à créer et utiliser des cartes, nous développons les compétences pour explorer et comprendre n'importe quel endroit dans le monde.`;

    const profoundBigIdeasFr = `La géographie nous aide à comprendre notre place dans le monde - de notre classe à notre planète. Les cartes et les outils géographiques sont comme des clés magiques qui ouvrent notre compréhension de tous les endroits merveilleux qui existent et nous aident à naviguer avec confiance.`;

    const meaningfulQuestions = [
      "Comment pouvons-nous utiliser différents types de cartes pour raconter différentes histoires sur le même endroit?",
      "Quels outils et stratégies nous aident à nous orienter et naviguer dans différents environnements?",
      "Comment notre ville se situe-t-elle dans notre province, notre pays, et notre monde?",
      "Quelles sont les similitudes et différences entre les méthodes traditionnelles et modernes de navigation?",
      "Comment pouvons-nous créer des cartes claires et utiles que d'autres personnes peuvent comprendre?",
      "Quelles caractéristiques géographiques importantes nous entourent et comment affectent-elles notre vie quotidienne?"
    ];

    const richVocabulary = [
      "géographie", "cartographie", "géographe", "cartographe", "spatial", "territoire",
      "carte", "plan", "globe", "atlas", "boussole", "navigation", "orientation",
      "direction", "nord", "sud", "est", "ouest", "points cardinaux", "coordonnées",
      "symbole", "légende", "échelle", "distance", "emplacement", "position",
      "continent", "océan", "pays", "province", "région", "frontière", "limite",
      "relief", "montagne", "vallée", "plaine", "rivière", "lac", "côte", "île",
      "climat", "météo", "saison", "température", "précipitation", "vent"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE DES COMPÉTENCES GÉOGRAPHIQUES:
• Portfolios de cartographie documentant la progression des compétences de création de cartes simples vers cartes complexes avec annotations françaises
• Défis d'orientation quotidiens évaluant la capacité d'utiliser directions cardinales et points de repère pour naviguer
• Carnets de géographe où les élèves enregistrent observations météorologiques, caractéristiques géographiques, et découvertes spatiales
• Auto-évaluations sur l'utilisation appropriée des outils géographiques (boussoles, cartes, globes) avec vocabulaire français précis
• Observations lors d'activités de résolution de problèmes géographiques et de navigation collaborative
• Discussions enregistrées démontrant la compréhension des concepts d'échelle, direction, et localisation

TÂCHES DE PERFORMANCE CARTOGRAPHIQUES:
• Création d'un atlas personnel en français: "Mon Monde Géographique" avec cartes progressives de la classe au monde
• Défi de navigation: Utilisation de cartes et boussoles pour guider des camarades dans des chasses au trésor géographiques
• Projet météorologique: Documentation et cartographie des modèles météorologiques locaux sur plusieurs semaines
• Comparaison culturelle: Exploration respectueuse des méthodes de navigation traditionnelles vs modernes

ÉVALUATION SOMMATIVE GÉOGRAPHIQUE COMPLÈTE:
• Projet final: "Expertise Géographique" - démonstration de la maîtrise des outils cartographiques, des concepts spatiaux, et du vocabulaire géographique français à travers une présentation interactive
• Évaluation pratique: Création d'une carte détaillée de l'école avec légende, échelle, et directions pour nouveaux élèves

CRITÈRES DE RÉUSSITE GÉOGRAPHIQUES SPÉCIFIQUES:
• L'élève crée des cartes précises utilisant symboles, légendes, échelles, et directions appropriées
• L'élève utilise efficacement boussoles et autres outils d'orientation pour naviguer dans différents environnements
• L'élève identifie et localise leur ville/province/pays sur différents types de cartes et globes
• L'élève utilise correctement au moins 30 termes de vocabulaire géographique français
• L'élève explique les différences entre méthodes traditionnelles et modernes de navigation
• L'élève démontre compréhension des concepts d'échelle géographique (local à global)`;

    const evidenceBasedDifferentiation = {
      forStruggling: `OUTILS MANIPULABLES CONCRETS: Cartes tactiles en relief, globes surdimensionnés, boussoles simples avec directions colorées pour renforcer l'apprentissage spatial kinésthésique. PROGRESSION GRADUÉE: Séquençage soigneux des compétences cartographiques des plus simples (cartes de bureau) aux plus complexes (cartes mondiales). SUPPORTS VISUELS CONSTANTS: Affiches de références avec vocabulaire géographique français illustré, symboles cartographiques colorés, et aide-mémoires directionnels. PRATIQUE RÉPÉTÉE: Multiples opportunités de pratiquer les mêmes compétences dans différents contextes sans pression d'évaluation. CHOIX D'EXPRESSION: Options pour démontrer compréhension géographique par construction de modèles, dessins détaillés, ou explications orales plutôt qu'uniquement par cartographie écrite.`,
      
      forAdvanced: `CARTOGRAPHIE SOPHISTIQUÉE: Création de cartes multi-couches avec systèmes de coordonnées, projections cartographiques, et analyses géospatiales appropriées à l'âge. RECHERCHE GÉOGRAPHIQUE INDÉPENDANTE: Investigation approfondie de régions géographiques spécifiques avec présentation d'expertise aux camarades. TECHNOLOGIE GÉOSPATIALE: Introduction aux systèmes d'information géographique (SIG) simples et aux outils de cartographie numérique avancés. MENTORAT CARTOGRAPHIQUE: Assistance aux élèves plus jeunes dans le développement de compétences d'orientation et de création de cartes. PROJETS DE TERRAIN: Participation à de vraies activités de cartographie communautaire avec présentation aux autorités locales. CONNEXIONS INTERDISCIPLINAIRES: Intégration des compétences géographiques avec mathématiques, sciences, et arts pour projets enrichis.`,
      
      forELL: `VOCABULAIRE GÉOGRAPHIQUE MULTILINGUE: Dictionnaires géographiques français-langue maternelle avec termes cartographiques et directionnels spécifiques. COMPARAISONS GÉOGRAPHIQUES CULTURELLES: Exploration respectueuse des caractéristiques géographiques de leurs pays d'origine avec cartographie comparative. SUPPORTS FAMILIAUX GÉOGRAPHIQUES: Ressources traduites permettant aux familles de contribuer leurs connaissances géographiques traditionnelles et culturelles. MÉTHODES DE NAVIGATION TRADITIONNELLES: Partage respectueux des méthodes d'orientation de leurs cultures avec traduction et validation. CARTOGRAPHIE CULTURELLE: Création de cartes montrant les connexions géographiques entre leur pays d'origine et le Canada. APPRENTISSAGE COLLABORATIF: Jumelage avec élèves francophones pour pratiquer vocabulaire géographique dans contextes de résolution de problèmes.`
    };

    const authenticIndigenous = `MÉTHODES TRADITIONNELLES MI'KMAQ DE NAVIGATION ET D'ORIENTATION:
L'intégration respectueuse explore les systèmes sophistiqués de navigation Mi'kmaq qui ont permis aux peuples autochtones de naviguer sur de vastes territoires pendant des millénaires sans technologie moderne. Les élèves apprennent comment les navigateurs Mi'kmaq utilisaient les étoiles, les modèles de vent, les caractéristiques côtières, et les cycles naturels.

LECTURE DU PAYSAGE ET NAVIGATION NATURELLE:
Compréhension respectueuse de comment les peuples Mi'kmaq "lisaient" le paysage naturel - utilisant les formations rocheuses, les modèles de végétation, les comportements animaux, et les caractéristiques aquatiques comme systèmes de navigation naturels.

CALENDRIERS SAISONNIERS ET ORIENTATION TEMPORELLE:
Exploration des calendriers traditionnels Mi'kmaq basés sur les cycles naturels, les mouvements stellaires, et les modèles saisonniers, offrant une perspective différente sur l'orientation dans l'espace et le temps.

NOMS DE LIEUX COMME CARTES NARRATIVES:
Apprentissage respectueux de comment les noms de lieux Mi'kmaq traditionnels contenaient des informations géographiques détaillées - direction, caractéristiques du terrain, ressources disponibles, conditions saisonnières - servant comme "cartes verbales" pour la navigation.

CONCEPTS TRADITIONNELS D'ÉCHELLE ET TERRITOIRE:
Compréhension de comment les communautés Mi'kmaq conceptualisaient l'espace territorial, les frontières saisonnières, et les relations géographiques entre différentes régions de leur territoire traditionnel.

SAGESSE GÉOGRAPHIQUE INTERGÉNÉRATIONNELLE:
Reconnaissance respectueuse de comment les connaissances géographiques étaient transmises des aînés aux jeunes à travers des histoires, des chansons, et des expériences pratiques, créant une appréciation pour les méthodes d'apprentissage géographique communautaire.`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE SUR L'APPRENTISSAGE GÉOGRAPHIQUE:

LETTRE D'INTRODUCTION (multilingue disponible):
Cette unité développe les compétences géographiques essentielles de votre enfant! Ils apprendront à créer et utiliser des cartes, à s'orienter avec confiance, et à comprendre leur place dans le monde. Nous célébrons toutes les perspectives géographiques et encourageons le partage d'expériences familiales diverses.

EXPLORATION GÉOGRAPHIQUE FAMILIALE (optionnelle):
• Projets de cartographie familiale de votre quartier, ville d'origine, ou lieux significatifs pour votre famille
• Opportunités de partager des méthodes de navigation ou d'orientation de vos cultures traditionnelles
• Invitation à contribuer des cartes, photos, ou artefacts géographiques de voyages familiaux
• Exploration des différences géographiques entre le Canada et vos pays d'origine

SOUTIEN ÉDUCATIF GÉOGRAPHIQUE À LA MAISON:
• Activités pratiques pour renforcer les compétences d'orientation et le vocabulaire géographique français
• Suggestions pour observer et discuter les caractéristiques géographiques lors de déplacements familiaux
• Ressources pour développer les compétences de lecture de cartes et d'utilisation de boussoles
• Guides pour encourager la curiosité géographique et l'observation environnementale

TECHNOLOGIE GÉOGRAPHIQUE FAMILIALE:
• Introduction appropriée aux applications cartographiques et outils de navigation modernes
• Suggestions pour équilibrer méthodes traditionnelles et technologiques d'orientation
• Ressources pour utiliser la technologie géographique de manière éducative et sécuritaire
• Guides pour explorer ensemble des cartes en ligne et des images satellitaires

RECONNAISSANCE DE DIVERSITÉ GÉOGRAPHIQUE:
• Célébration des expériences géographiques diverses des familles (urbaines, rurales, internationales)
• Respect pour les familles qui peuvent avoir des limitations de mobilité ou d'accès géographique
• Alternatives pour les familles qui préfèrent ne pas partager des informations sur leurs origines géographiques
• Support pour familles nouvelles au Canada pour développer leurs connaissances géographiques locales

RESSOURCES GÉOGRAPHIQUES COMMUNAUTAIRES:
• Informations sur les ressources cartographiques et géographiques locales disponibles pour les familles
• Invitation à participer aux événements géographiques communautaires (clubs de cartographie, expositions)
• Connexions aux organisations géographiques éducatives et aux programmes d'exploration familiale
• Support pour accéder aux cartes, boussoles, et autres outils géographiques pour l'apprentissage à la maison`;

    // Update Unit 5
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapo20038vj1wcdq3sxtf' },
      data: {
        description: richDescription,
        descriptionFr: richDescriptionFr,
        bigIdeas: profoundBigIdeas,
        bigIdeasFr: profoundBigIdeasFr,
        essentialQuestions: meaningfulQuestions,
        keyVocabulary: richVocabulary,
        assessmentPlan: comprehensiveAssessment,
        differentiationStrategies: evidenceBasedDifferentiation,
        indigenousPerspectives: authenticIndigenous,
        parentCommunicationPlan: enhancedParentCommunication
      }
    });

    console.log('✅ Unit 5 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 5:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit5();