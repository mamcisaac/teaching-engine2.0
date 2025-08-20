import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit4() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 4: Notre quartier et notre ville');
    
    const richDescription = `Cette unité transforme le quartier local des élèves en laboratoire vivant d'exploration géographique et civique. Les jeunes apprenants de 6 ans découvrent que leur quartier n'est pas seulement un ensemble de bâtiments et de rues, mais une communauté dynamique remplie d'histoires, de connexions et d'opportunités d'apprentissage. À travers des investigations authentiques en français, ils développent leurs premières compétences cartographiques tout en apprenant à être des citoyens observateurs et responsables.

L'unité commence par des explorations guidées du quartier scolaire immédiat, permettant aux élèves d'observer et documenter les caractéristiques physiques et humaines de leur environnement. Ils apprennent à "lire" leur quartier comme un géographe - identifiant les points de repère, comprenant les modèles de transport, observant l'utilisation des terres, et reconnaissant les connexions entre leur quartier et la ville plus large.

Un aspect central est le développement de compétences cartographiques appropriées à l'âge. Les élèves progressent de la création de cartes simples de leur classe vers des cartes de l'école, puis du quartier, utilisant des symboles, des directions et des échelles appropriées. Ils apprennent que les cartes sont des outils puissants pour comprendre et communiquer sur les lieux.

L'intégration de perspectives Mi'kmaq explore respectueusement le concept de territoire traditionnel et la compréhension Indigenous de la terre comme plus qu'une propriété - comme un être vivant avec lequel nous avons des relations. Les élèves apprennent les noms traditionnels des lieux et développent une appréciation pour la longue histoire humaine de leur région.

Les connexions avec la ville plus large aident les élèves à comprendre leur place dans un contexte géographique plus vaste. Ils explorent comment leur quartier se connecte à d'autres quartiers, comment les services municipaux fonctionnent, et comment ils peuvent contribuer positivement à leur communauté urbaine.

Le développement du vocabulaire français se concentre sur les termes géographiques et civiques essentiels qui permettront aux élèves de décrire et analyser leur environnement spatial avec précision et confiance.`;

    const richDescriptionFr = `Cette unité invite les élèves à devenir des explorateurs géographiques de leur propre quartier et ville. En français immersion, ils découvrent les merveilles cachées de leur environnement local tout en développant des compétences cartographiques essentielles et une compréhension civique de leur place dans la communauté urbaine plus large.`;

    const profoundBigIdeas = `Notre quartier est connecté à notre ville, notre province, notre pays et notre monde de façons importantes. Chaque lieu a une histoire, des caractéristiques spéciales et des connexions qui le rendent unique. En apprenant à observer et comprendre notre environnement local, nous développons les compétences pour comprendre n'importe quel endroit dans le monde.`;

    const profoundBigIdeasFr = `Notre quartier est plus qu'un endroit où nous vivons - c'est une partie importante d'une communauté plus grande qui s'étend de notre rue à notre ville à notre monde. En explorant et comprenant notre quartier, nous apprenons à être des citoyens responsables et des géographes curieux.`;

    const meaningfulQuestions = [
      "Quelles caractéristiques spéciales rendent notre quartier unique et comment pouvons-nous les documenter sur des cartes?",
      "Comment notre quartier se connecte-t-il à d'autres parties de notre ville et pourquoi ces connexions sont-elles importantes?",
      "Quels points de repère nous aident à naviguer dans notre quartier et comment pouvons-nous les utiliser pour créer des cartes utiles?",
      "Comment pouvons-nous être de bons voisins et citoyens responsables dans notre quartier?",
      "Quels changements observons-nous dans notre quartier et comment ces changements affectent-ils notre communauté?",
      "Comment les outils cartographiques nous aident-ils à comprendre et expliquer notre environnement local?"
    ];

    const richVocabulary = [
      "quartier", "ville", "communauté", "voisinage", "municipal", "urbain",
      "rue", "avenue", "boulevard", "intersection", "carrefour", "rond-point",
      "bâtiment", "maison", "appartement", "commerce", "parc", "école", "hôpital",
      "carte", "plan", "direction", "nord", "sud", "est", "ouest", "symbole",
      "point de repère", "emplacement", "adresse", "transport", "circulation",
      "sécurité", "services", "infrastructure", "environnement", "paysage",
      "observation", "exploration", "navigation", "orientation", "géographie"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE GÉOGRAPHIQUE:
• Portfolios d'observation du quartier documentant les changements dans la compréhension spatiale à travers croquis, photos annotées, et descriptions en français
• Carnets de géographe où les élèves enregistrent leurs découvertes lors d'explorations du quartier avec vocabulaire géographique approprié
• Évaluations de compétences cartographiques progressives: de cartes simples de bureau vers cartes complexes du quartier
• Observations lors d'activités de navigation et d'orientation utilisant des directions et points de repère
• Auto-évaluations sur l'utilisation appropriée du vocabulaire français géographique et civique
• Discussions de groupe enregistrées démontrant la compréhension des connexions quartier-ville

TÂCHES DE PERFORMANCE AUTHENTIQUES:
• Création d'un guide de quartier en français pour nouveaux résidents avec cartes, photos, et descriptions
• Projet de cartographie collaborative créant une carte géante du quartier scolaire avec symboles et légendes appropriées
• "Tour de quartier virtuel" présenté en français utilisant la technologie pour partager des découvertes géographiques
• Investigation des changements de quartier à travers des interviews avec résidents de longue date

ÉVALUATION SOMMATIVE GÉOGRAPHIQUE:
• Projet final: "Mon Quartier dans Ma Ville" - présentation multimédia en français démontrant la compréhension des caractéristiques du quartier, des connexions urbaines, et des compétences cartographiques
• Défi de navigation: Utilisation de cartes créées par les élèves pour guider des camarades vers des destinations spécifiques

CRITÈRES DE RÉUSSITE GÉOGRAPHIQUES:
• L'élève identifie et décrit en français au moins 10 caractéristiques importantes du quartier
• L'élève crée des cartes simples mais précises utilisant des symboles et directions appropriées
• L'élève explique au moins 3 connexions entre leur quartier et la ville plus large
• L'élève utilise correctement au moins 25 termes de vocabulaire géographique français
• L'élève démontre des comportements de citoyenneté responsable lors d'explorations du quartier
• L'élève peut naviguer efficacement en utilisant des points de repère et des directions`;

    const evidenceBasedDifferentiation = {
      forStruggling: `SUPPORTS VISUELS SPATIAUX: Cartes en relief, modèles 3D du quartier, et photos annotées pour renforcer l'apprentissage spatial. EXPLORATION STRUCTURÉE: Checklists visuelles avec images pour guider l'observation du quartier et la documentation. CARTES SIMPLIFIÉES: Versions modifiées avec moins de détails et symboles plus grands pour faciliter la compréhension. PARTENARIAT DE NAVIGATION: Jumelage avec des élèves plus expérimentés pour les activités d'exploration et de cartographie. TECHNOLOGIE ASSISTÉE: Utilisation d'applications cartographiques simples avec support audio en français. EXPRESSION ALTERNATIVE: Options pour documenter les apprentissages par dessins, photos, ou enregistrements audio plutôt que seulement par écrit.`,
      
      forAdvanced: `CARTOGRAPHIE AVANCÉE: Création de cartes détaillées avec échelles, légendes complexes, et systèmes de coordonnées appropriés à l'âge. RECHERCHE GÉOGRAPHIQUE: Investigation de l'histoire du développement du quartier et des changements urbains au fil du temps. TECHNOLOGIE GÉOSPATIALE: Introduction aux outils de cartographie numérique et aux concepts de GPS pour l'exploration urbaine. PLANIFICATION CIVIQUE: Participation à de vrais projets d'amélioration du quartier avec présentation aux autorités municipales. MENTORAT GÉOGRAPHIQUE: Assistance aux élèves plus jeunes dans le développement de compétences d'observation et de cartographie. CONNEXIONS RÉGIONALES: Exploration des relations entre leur ville et d'autres communautés de la région Atlantique.`,
      
      forELL: `VOCABULAIRE SPATIAL MULTILINGUE: Dictionnaires géographiques français-langue maternelle avec termes spécifiques au quartier local. COMPARAISONS INTERCULTURELLES: Exploration respectueuse des différences entre les quartiers de leur pays d'origine et leur quartier canadien. SUPPORTS FAMILIAUX: Ressources traduites permettant aux familles de contribuer leurs connaissances géographiques locales. CARTES CULTURELLES: Création de cartes montrant les connexions culturelles et linguistiques dans le quartier. NAVIGATION ASSISTÉE: Support supplémentaire pour comprendre les conventions cartographiques canadiennes. CÉLÉBRATION DE DIVERSITÉ: Reconnaissance des contributions de différentes communautés culturelles au développement du quartier.`
    };

    const authenticIndigenous = `TERRITOIRE TRADITIONNEL MI'KMAQ ET GÉOGRAPHIE SACRÉE:
L'intégration respectueuse explore la compréhension Mi'kmaq de la terre comme un être vivant avec lequel nous avons des relations responsables. Les élèves apprennent que notre quartier et ville se trouvent sur le territoire traditionnel Mi'kmaq avec une histoire riche qui précède de millénaires les développements européens.

NOMS DE LIEUX TRADITIONNELS ET LEUR SIGNIFICATION:
Exploration respectueuse des noms de lieux Mi'kmaq originaux pour la région, comprenant leurs significations et les histoires géographiques qu'ils racontent sur l'environnement naturel et l'utilisation traditionnelle de la terre.

CONCEPTS TRADITIONNELS DE NAVIGATION ET D'ORIENTATION:
Apprentissage sur les méthodes traditionnelles Mi'kmaq de navigation utilisant les étoiles, les modèles saisonniers, les caractéristiques naturelles et les cycles naturels plutôt que seulement les outils technologiques modernes.

GÉOGRAPHIE SAISONNIÈRE ET CYCLES NATURELS:
Compréhension de comment les peuples Mi'kmaq ont traditionnellement organisé leurs activités selon les saisons et les cycles naturels, créant une appréciation pour les rythmes naturels encore présents dans notre environnement urbain.

RESPONSABILITÉ ENVIRONNEMENTALE ET INTENDANCE:
Les enseignements traditionnels sur la responsabilité humaine de prendre soin de la terre, créant des connexions avec la citoyenneté environnementale moderne et la responsabilité de maintenir des quartiers sains et durables.

CONNEXIONS TERRITOIRE-COMMUNAUTÉ:
Compréhension respectueuse de comment les communautés Mi'kmaq traditionnelles étaient organisées en relation avec les caractéristiques géographiques naturelles, offrant des perspectives sur la planification communautaire et les relations humain-environnement.`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE SUR L'EXPLORATION GÉOGRAPHIQUE:

LETTRE D'INTRODUCTION (multilingue disponible):
Cette unité transforme votre quartier en classe d'apprentissage! Votre enfant développera des compétences d'observation géographique et civique tout en explorant leur environnement local en français. Nous respectons la diversité des expériences de quartier et encourageons tous les types de participation familiale.

EXPLORATIONS SÉCURITAIRES DU QUARTIER:
• Permissions détaillées pour toutes les sorties avec itinéraires spécifiques et protocoles de sécurité
• Invitation aux parents/tuteurs à accompagner les explorations selon leur disponibilité
• Alternatives pour les familles qui préfèrent que leur enfant ne participe pas aux sorties extérieures
• Communication claire des objectifs d'apprentissage géographique pour chaque exploration

ENGAGEMENT FAMILIAL GÉOGRAPHIQUE (optionnel):
• Projets de cartographie familiale où vous pouvez partager vos connaissances du quartier
• Opportunités de partager l'histoire familiale de votre connexion au quartier ou à la ville
• Suggestions d'explorations géographiques familiales pour étendre l'apprentissage
• Invitation à contribuer des photos historiques ou des histoires du quartier

SOUTIEN ÉDUCATIF À LA MAISON:
• Activités de vocabulaire géographique français pour renforcer l'apprentissage spatial
• Suggestions pour observer et discuter les caractéristiques du quartier en famille
• Ressources pour développer les compétences de cartographie et de navigation
• Guides pour encourager la citoyenneté responsable et l'appréciation environnementale

RECONNAISSANCE DE DIVERSITÉ RÉSIDENTIELLE:
• Respect pour les familles qui peuvent avoir récemment déménagé ou qui déménagent fréquemment
• Alternatives pour les familles qui vivent dans différents types de logements (appartements, maisons, logements temporaires)
• Sensibilité aux différentes expériences de sécurité et de confort du quartier
• Célébration des perspectives diverses sur la vie urbaine et communautaire

CONNEXIONS COMMUNAUTAIRES:
• Informations sur les ressources géographiques et civiques locales pour les familles
• Invitation à participer aux événements communautaires de quartier selon votre intérêt
• Ressources pour explorer l'histoire locale et les connexions culturelles
• Support pour les familles nouvelles à la région pour développer leurs connexions communautaires`;

    // Update Unit 4
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapnr002fvj1w077gd2cz' },
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

    console.log('✅ Unit 4 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 4:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit4();