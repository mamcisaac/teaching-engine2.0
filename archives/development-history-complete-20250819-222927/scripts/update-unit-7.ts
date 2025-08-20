import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit7() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 7: Notre monde connecté');
    
    const richDescription = `Cette unité culminante transforme les jeunes élèves de 6 ans en citoyens du monde conscients, leur donnant une perspective globale qui honore leurs connexions locales tout en ouvrant leur compréhension vers les communautés, cultures et environnements du monde entier. Cette unité synthétise tous les apprentissages de l'année - communauté scolaire, aides de quartier, familles et traditions, géographie locale, cartographie mondiale, et citoyenneté responsable - en une compréhension holistique de notre monde interconnecté.

L'unité explore le concept fondamental que nous vivons dans un monde où tout est connecté - nos actions locales ont des impacts globaux, les événements mondiaux affectent notre vie quotidienne, et les défis globaux nécessitent des solutions collaboratives. Les élèves développent une mentalité globale tout en maintenant leurs racines locales et leur identité culturelle.

Un aspect central est l'exploration respectueuse de la diversité culturelle mondiale comme une richesse à célébrer. Les élèves apprennent sur différentes langues, traditions, celebrations, systèmes familiaux, méthodes d'aide communautaire, et pratiques civiques autour du monde, développant une appréciation pour la beauté de la diversité humaine.

La citoyenneté numérique appropriée à l'âge est intégrée throughout, enseignant aux élèves comment utiliser la technologie pour se connecter positivement avec le monde tout en restant sécuritaires et respectueux. Ils apprennent que l'internet peut être un outil puissant pour l'apprentissage, la communication, et l'action positive quand utilisé avec sagesse et guidance appropriée.

L'exploration des besoins et désirs globaux aide les élèves à comprendre que tous les enfants du monde partagent des besoins fondamentaux similaires - nourriture, logement, sécurité, éducation, amour, jeu - même si leurs circumstances et environnements sont différents. Cette compréhension développe l'empathie globale et la responsabilité sociale.

L'intégration de perspectives Mi'kmaq explore respectueusement les concepts traditionnels de connexions globales entre tous les peuples autochtones, les réseaux commerciaux historiques qui connectaient les nations, et la compréhension que toute vie sur Terre est interconnectée et interdépendante.

Cette unité finale prépare les élèves pour leur futur en tant que citoyens du monde responsables qui comprennent leur pouvoir individuel et collectif de créer un impact positif local et global.`;

    const richDescriptionFr = `Cette unité finale ouvre les horizons des élèves vers le monde entier! En français immersion, ils découvrent comment nous sommes tous connectés - de notre classe à la planète - tout en développant une citoyenneté numérique responsable et une appréciation pour la diversité culturelle mondiale qui enrichit notre communauté humaine partagée.`;

    const profoundBigIdeas = `Nous faisons tous partie d'une grande famille humaine mondiale où nos actions locales peuvent avoir des impacts globaux et où les événements mondiaux affectent notre vie quotidienne. La diversité culturelle du monde entier est une richesse précieuse qui nous enseigne de nouvelles façons de vivre, d'apprendre et de prendre soin les uns des autres. Quand nous utilisons la technologie avec sagesse et respect, nous pouvons nous connecter positivement avec des personnes partout dans le monde.`;

    const profoundBigIdeasFr = `Notre monde est comme un grand réseau où tous les endroits et toutes les personnes sont connectés de façons spéciales. En apprenant sur les différentes cultures et en utilisant la technologie de manière respectueuse, nous pouvons devenir de bons amis avec des enfants partout dans le monde et travailler ensemble pour rendre notre planète encore plus belle.`;

    const meaningfulQuestions = [
      "Comment sommes-nous connectés aux enfants et aux familles partout dans le monde, et quelles similitudes partageons-nous?",
      "Quelles traditions et cultures merveilleuses du monde entier peuvent nous enseigner de nouvelles façons de vivre et de célébrer?",
      "Comment pouvons-nous utiliser la technologie de manière sécuritaire et respectueuse pour apprendre sur le monde et nous connecter avec d'autres?",
      "Quels besoins fondamentaux tous les enfants du monde partagent-ils, et comment pouvons-nous aider à répondre à ces besoins?",
      "Comment nos actions dans notre communauté locale peuvent-elles avoir un impact positif sur le monde entier?",
      "Quelles merveilles naturelles et culturelles du monde pouvons-nous explorer et protéger ensemble?"
    ];

    const richVocabulary = [
      "monde", "planète", "global", "international", "universel", "connexion",
      "communication", "technologie", "internet", "ordinateur", "sécuritaire", "respectueux",
      "culture", "tradition", "diversité", "langue", "célébration", "coutume", "héritage",
      "échange", "partage", "commerce", "transport", "voyage", "exploration", "découverte",
      "similitude", "différence", "ressemblance", "unicité", "spécialité", "beauté",
      "besoin", "désir", "nécessité", "aide", "soutien", "collaboration", "coopération",
      "environnement", "nature", "protection", "conservation", "durabilité", "responsabilité",
      "paix", "harmonie", "amitié", "solidarité", "unité", "ensemble", "famille humaine"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE DE LA CONSCIENCE GLOBALE:
• Portfolios de citoyenneté mondiale documentant l'évolution de la compréhension des connexions globales à travers projets, dessins, et réflexions françaises
• Carnets d'exploration culturelle où les élèves enregistrent leurs découvertes sur différentes cultures avec respect et curiosité
• Auto-évaluations guidées sur l'utilisation responsable de la technologie et les compétences de communication globale appropriées
• Observations lors d'activités de communication interculturelle et de collaboration internationale (virtuelle ou par correspondance)
• Discussions de groupe enregistrées démontrant la compréhension des besoins globaux partagés et de la diversité culturelle
• Projets de service global évalués pour l'impact positif et la réflexion sur la citoyenneté mondiale responsable

TÂCHES DE PERFORMANCE GLOBALES AUTHENTIQUES:
• Correspondance avec une classe dans un autre pays (virtuelle ou par lettres) utilisant le français comme langue de communication internationale
• Création d'une "expo mondiale" en français célébrant différentes cultures avec respect et précision
• Développement d'un projet d'action globale approprié à l'âge (sensibilisation environnementale, aide humanitaire, échange culturel)
• Organisation d'une "journée des Nations Unies" pour l'école avec présentations culturelles respectueuses

ÉVALUATION SOMMATIVE DE CITOYENNETÉ MONDIALE:
• Projet final: "Mon Plan d'Action Mondiale" - identification d'un problème global approprié à l'âge et développement d'un plan d'action local avec présentation persuasive en français
• Démonstration de technologie responsable: Création d'une présentation multimédia sur les connexions mondiales utilisant la technologie de manière éthique et sécuritaire

CRITÈRES DE RÉUSSITE MONDIAUX SPÉCIFIQUES:
• L'élève identifie et explique en français au moins 5 façons dont nous sommes connectés au monde entier
• L'élève démontre respect et appréciation pour au moins 3 cultures différentes à travers des présentations ou projets
• L'élève utilise la technologie de manière sécuritaire et respectueuse pour l'apprentissage et la communication globale
• L'élève utilise correctement au moins 30 termes de vocabulaire français liés aux connexions et à la diversité mondiales
• L'élève identifie les besoins globaux partagés et propose des actions concrètes pour aider
• L'élève démontre une compréhension que ses actions locales peuvent avoir des impacts globaux positifs`;

    const evidenceBasedDifferentiation = {
      forStruggling: `CONNEXIONS CONCRÈTES ET VISUELLES: Cartes mondiales interactives, globes terrestres manipulables, et objets culturels authentiques pour rendre les concepts globaux tangibles et accessibles. APPRENTISSAGE MULTISENSORIEL: Expériences culturelles qui engagent tous les sens - musique mondiale, nourriture sécuritaire, textiles, parfums - pour renforcer l'apprentissage global. TECHNOLOGIE ASSISTÉE SIMPLE: Utilisation d'applications éducatives guidées et de ressources numériques adaptées à l'âge avec supervision constante. CONNEXIONS PERSONNELLES: Focus sur les connexions entre leur propre expérience et les expériences d'enfants dans d'autres pays pour rendre l'apprentissage personnel et significatif. EXPRESSION CRÉATIVE: Options pour démontrer l'apprentissage global par l'art, la musique, la danse, ou le jeu dramatique plutôt que seulement par la communication verbale. SUPPORT ÉMOTIONNEL: Guidance pour traiter les émotions qui peuvent survenir en apprenant sur les défis mondiaux de manière appropriée à l'âge.`,
      
      forAdvanced: `RECHERCHE CULTURELLE APPROFONDIE: Investigation indépendante de cultures spécifiques avec présentation d'expertise culturelle aux camarades et à d'autres classes. LEADERSHIP GLOBAL: Rôles de coordination dans des projets de service global et d'échange culturel avec responsabilités de communication internationale. TECHNOLOGIE AVANCÉE: Utilisation sophistiquée d'outils de communication globale, de recherche culturelle, et de création multimédia pour des projets d'impact mondial. ANALYSE CRITIQUE GLOBALE: Exploration des défis mondiaux complexes avec développement de solutions créatives et de plans d'action réalisables. MENTORAT INTERCULTUREL: Assistance aux élèves nouvellement arrivés ou aux élèves ayant des antécédents culturels divers pour faciliter l'intégration et l'échange. PROJET D'ENTREPRISE GLOBALE: Développement d'initiatives réelles pour connecter leur école avec des communautés mondiales de manière significative et durable.`,
      
      forELL: `CÉLÉBRATION CULTURELLE AUTHENTIQUE: Opportunités de partager leur culture d'origine comme experts et enseignants pour leurs camarades avec support de traduction. CONNEXIONS FAMILIALES GLOBALES: Integration respectueuse de leurs expériences internationales, langues maternelles, et perspectives culturelles uniques. LEADERSHIP INTERCULTUREL: Rôles de liaison culturelle pour aider d'autres élèves à comprendre les perspectives internationales et la diversité mondiale. RESSOURCES MULTILINGUES: Accès à des matériaux d'apprentissage global dans leurs langues maternelles pour approfondir la compréhension conceptuelle. COMMUNICATION GLOBALE: Utilisation de leurs compétences multilingues pour faciliter des connexions internationales authentiques pour toute la classe. MENTORSHIP GLOBAL: Jumelage avec des élèves ayant des expériences culturelles similaires pour soutien mutuel et partage d'expertise culturelle.`
    };

    const authenticIndigenous = `RÉSEAUX TRADITIONNELS MI'KMAQ ET CONNEXIONS INTERNATIONALES AUTOCHTONES:
L'intégration respectueuse explore les systèmes sophistiqués de commerce et de communication qui connectaient historiquement les nations Mi'kmaq avec d'autres peuples autochtones à travers l'Amérique du Nord et au-delà, démontrant que les connexions globales ne sont pas un phénomène moderne.

CONCEPTS TRADITIONNELS D'INTERDÉPENDANCE MONDIALE:
Compréhension respectueuse des enseignements Mi'kmaq que toute vie sur Terre est interconnectée et interdépendante, créant une base philosophique pour la citoyenneté mondiale responsable et l'intendance environnementale globale.

SOLIDARITÉ AUTOCHTONE INTERNATIONALE:
Apprentissage approprié à l'âge sur comment les peuples autochtones du monde entier partagent des expériences similaires et travaillent ensemble pour protéger leurs cultures, langues, et territoires traditionnels.

SAGESSE TRADITIONNELLE POUR LES DÉFIS MONDIAUX:
Exploration respectueuse de comment les connaissances et pratiques traditionnelles Mi'kmaq offrent des perspectives précieuses sur les défis globaux contemporains comme le changement climatique, la durabilité, et la coexistence pacifique.

LANGUES AUTOCHTONES COMME PATRIMOINE MONDIAL:
Reconnaissance de la langue Mi'kmaq comme partie du patrimoine linguistique mondial précieux, créant une appréciation pour la diversité linguistique globale et l'importance de préserver toutes les langues.

PROTOCOLES TRADITIONNELS POUR LES RELATIONS INTERCULTURELLES:
Apprentissage des protocoles Mi'kmaq traditionnels pour interagir respectueusement avec d'autres cultures, offrant un cadre pour les relations interculturelles mondiales basées sur le respect mutuel et la réciprocité.`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE SUR L'APPRENTISSAGE GLOBAL:

LETTRE D'INTRODUCTION (multilingue disponible):
Cette unité finale ouvre les horizons de votre enfant vers le monde entier! Ils exploreront les connexions globales, la diversité culturelle, et la citoyenneté numérique responsable. Nous célébrons particulièrement les perspectives internationales et encourageons le partage de vos expériences culturelles familiales uniques.

PARTAGE CULTUREL FAMILIAL (entièrement optionnel):
• Invitation chaleureuse à partager votre culture, traditions, langues, et expériences internationales avec la classe
• Opportunités de contribuer des objets culturels, photos, histoires, ou présentations sur vos pays d'origine
• Participation à notre "expo mondiale" selon votre confort et disponibilité
• Exploration des connexions entre votre héritage culturel et les cultures du monde entier

CITOYENNETÉ NUMÉRIQUE ET SÉCURITÉ TECHNOLOGIQUE:
• Ressources pour superviser et guider l'utilisation appropriée de la technologie à la maison
• Stratégies pour enseigner la communication respectueuse et la sécurité en ligne appropriée à l'âge
• Suggestions pour explorer ensemble des ressources éducatives globales sécuritaires
• Guides pour équilibrer l'exploration numérique avec les connexions du monde réel

CONSCIENCE GLOBALE ET ACTION LOCALE FAMILIALE:
• Suggestions pour des projets de service familial qui connectent à des causes globales
• Ressources pour explorer ensemble les cultures mondiales de manière respectueuse et précise
• Idées pour développer l'empathie globale et la responsabilité environnementale en famille
• Opportunités de participer aux initiatives d'échange culturel et de correspondance internationale

RECONNAISSANCE DE DIVERSITÉ INTERNATIONALE:
• Célébration spéciale des familles avec des antécédents internationaux et multiculturels
• Support pour les familles nouvellement arrivées au Canada pour partager leurs perspectives uniques
• Alternatives respectueuses pour les familles qui préfèrent la confidentialité sur leurs origines
• Ressources pour naviguer les différences culturelles et développer l'appréciation interculturelle

RESSOURCES ÉDUCATIVES MONDIALES:
• Informations sur les ressources culturelles et internationales locales disponibles pour les familles
• Guides pour explorer en sécurité les médias, livres, et ressources éducatives globales avec votre enfant
• Connexions aux organisations culturelles communautaires et aux programmes d'échange familial
• Support pour maintenir et célébrer vos langues maternelles et traditions culturelles à la maison

PRÉPARATION POUR LE FUTUR GLOBAL:
• Stratégies pour continuer à développer la conscience mondiale et les compétences interculturelles
• Ressources pour soutenir l'apprentissage linguistique et l'appréciation culturelle continue
• Suggestions pour maintenir les connexions globales et l'engagement civique mondial de votre enfant`;

    // Update Unit 7
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapop004uvj1w00690v5u' },
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

    console.log('✅ Unit 7 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 7:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit7();