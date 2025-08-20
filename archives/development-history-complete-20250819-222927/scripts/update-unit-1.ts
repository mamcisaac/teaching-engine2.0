import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit1() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 1: Notre école communautaire');
    
    const richDescription = `Cette unité transforme la compréhension des élèves de leur école en tant que communauté vibrante et inclusive. Les enfants de 6 ans explorent leur école non seulement comme un lieu d'apprentissage, mais comme une microsociété où chaque personne a un rôle précieux et des responsabilités importantes. À travers des investigations quotidiennes en français, les élèves découvrent comment leur école fonctionne, qui y travaille, pourquoi nous avons des règles, et comment ils peuvent contribuer positivement à leur communauté scolaire.

L'unité commence par des cercles de partage matinaux où les élèves expriment ce qu'ils savent déjà sur leur école en français, créant une base solide pour l'apprentissage futur. Les élèves rencontrent et interviewent différents membres du personnel scolaire - du directeur au concierge - en pratiquant leurs compétences de communication orale en français tout en apprenant sur les rôles et responsabilités de chacun.

Un aspect central de cette unité est l'exploration des règles scolaires non comme des restrictions, mais comme des accords communautaires qui nous aident tous à apprendre et grandir ensemble en sécurité. Les élèves participent à des discussions démocratiques simples sur les règles de classe, développant leurs compétences de prise de décision collaborative tout en renforçant leurs compétences linguistiques françaises.

L'intégration de perspectives Mi'kmaq est authentique et respectueuse, explorant les concepts traditionnels de responsabilité communautaire et de prise de décision collective. Les élèves apprennent sur les cercles de parole traditionnels et comment les communautés Mi'kmaq prennent des décisions ensemble, créant des parallèles naturels avec leur propre communauté scolaire.

Cette unité établit une fondation solide pour la citoyenneté responsable tout en développant le vocabulaire français essentiel et les compétences de communication orale nécessaires pour participer pleinement à leur environnement d'immersion française.`;

    const richDescriptionFr = `Cette unité invite les jeunes apprenants à découvrir leur école comme une communauté dynamique où chaque membre contribue au bien-être collectif. En français immersion, les élèves explorent les rôles, les responsabilités et les relations qui rendent leur école spéciale. Ils développent un sentiment d'appartenance et de fierté envers leur communauté scolaire tout en maîtrisant le vocabulaire français essentiel pour naviguer et contribuer à leur environnement éducatif quotidien.`;

    const profoundBigIdeas = `Notre école est une communauté où chaque personne - élève, enseignant, directeur, concierge, secrétaire - a un rôle important et précieux. Quand nous travaillons ensemble avec respect et responsabilité, nous créons un endroit où tout le monde peut apprendre, grandir et s'épanouir. Les règles ne sont pas des punitions, mais des accords qui nous aident à vivre en harmonie et à nous sentir en sécurité pour prendre des risques d'apprentissage.`;

    const profoundBigIdeasFr = `Notre école est une communauté précieuse où chacun contribue au bonheur et à l'apprentissage de tous. Ensemble, nous créons un endroit sûr et accueillant où chaque voix compte et où nous grandissons comme apprenants et comme citoyens responsables.`;

    const meaningfulQuestions = [
      "Qui sont tous les membres spéciaux de notre communauté scolaire et comment nous aident-ils chaque jour?",
      "Comment pouvons-nous montrer du respect et de la reconnaissance envers toutes les personnes qui rendent notre école formidable?", 
      "Pourquoi avons-nous des règles dans notre école et comment nous aident-elles à apprendre ensemble?",
      "Que pouvons-nous faire pour que notre école soit un endroit encore plus accueillant et inclusif?",
      "Comment les décisions sont-elles prises dans notre école et comment pouvons-nous participer de manière respectueuse?"
    ];

    const richVocabulary = [
      "école", "communauté", "directeur/directrice", "enseignant(e)", "élève", 
      "concierge", "secrétaire", "bibliothécaire", "aide-enseignant(e)", "surveillant(e)",
      "règles", "accords", "responsabilité", "respect", "gentillesse", "sécurité",
      "appartenance", "contribution", "coopération", "entraide", "bienveillance",
      "démocratie", "participation", "écoute", "partage", "inclusion"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE CONTINUE:
• Observations quotidiennes de la participation des élèves aux discussions communautaires en français
• Portfolios documentant la compréhension évolutive des rôles scolaires à travers des dessins annotés en français
• Cercles de réflexion hebdomadaires où les élèves partagent leurs apprentissages sur la communauté scolaire
• Auto-évaluations guidées sur la contribution personnelle à la communauté de classe
• Carnets de vocabulaire illustrés avec du nouveau vocabulaire français lié à la communauté
• Jeux de rôles évalués où les élèves démontrent leur compréhension des différents rôles scolaires
• Conversations partenaires enregistrées montrant l'utilisation appropriée du vocabulaire communautaire français

TÂCHES DE PERFORMANCE AUTHENTIQUES:
• Création collaborative d'un livre de classe "Notre École Formidable" avec des contributions individuelles de chaque élève
• Interviews en français avec différents membres du personnel scolaire, documentées avec dessins et phrases simples
• Développement d'accords de classe démocratiques utilisant le processus de prise de décision collaborative
• Visites guidées de l'école que les élèves créent et présentent en français pour les visiteurs

ÉVALUATION SOMMATIVE SIGNIFICATIVE:
• Projet final: "Mon École, Ma Communauté" - une présentation multimédia en français démontrant la compréhension des rôles communautaires, des responsabilités personnelles, et des façons de contribuer positivement
• Rubrique d'évaluation incluant: utilisation appropriée du vocabulaire français, compréhension des concepts communautaires, démonstration de responsabilité personnelle, et communication orale efficace en français

CRITÈRES DE RÉUSSITE SPÉCIFIQUES:
• L'élève identifie et décrit en français au moins 5 rôles différents dans l'école
• L'élève explique pourquoi les règles scolaires sont importantes pour la communauté  
• L'élève démontre des comportements de citoyenneté responsable dans la vie quotidienne de classe
• L'élève utilise correctement au moins 15 termes de vocabulaire français liés à la communauté scolaire
• L'élève participe respectueusement aux discussions et décisions de groupe en français`;

    const evidenceBasedDifferentiation = {
      forStruggling: `SOUTIENS VISUELS ET CONCRETS: Cartes visuelles bilingues pour le vocabulaire de l'école avec photos réelles du personnel. SYSTÈME DE JUMELAGE: Partenariat avec un élève plus expérimenté pour naviguer les routines scolaires et pratiquer le français. COMMUNICATION MULTIMODALE: Tableaux de communication avec images et gestes pour soutenir l'expression en français. TÂCHES MODIFIÉES: Versions simplifiées des interviews avec des questions préparées et support visuel. TEMPS SUPPLÉMENTAIRE: Délais étendus pour les projets avec check-ins fréquents. CHOIX D'EXPRESSION: Options pour démontrer la compréhension par le dessin, la dramatisation, ou l'expression orale selon les forces individuelles.`,
      
      forAdvanced: `RÔLES DE LEADERSHIP: Opportunités de devenir ambassadeurs de l'école, créant des visites guidées en français pour les nouveaux élèves et familles. RECHERCHE APPROFONDIE: Investigation des histoires personnelles des membres du personnel et création de biographies en français. PROJETS D'EXTENSION: Développement d'initiatives d'amélioration de l'école avec présentation au personnel administratif. MENTORAT LINGUISTIQUE: Opportunités d'aider les élèves qui apprennent le français en tant que langue seconde. CITOYENNETÉ ACTIVE: Participation à de vrais comités scolaires adaptés à leur âge. CRÉATION MULTIMÉDIA: Développement de vidéos ou présentations numériques sophistiquées sur la communauté scolaire.`,
      
      forELL: `RESSOURCES MULTILINGUES: Panneaux de bienvenue et cartes de vocabulaire dans les langues maternelles des élèves. PARTENAIRES DE TRADUCTION: Jumelage avec des élèves bilingues pour faciliter la communication et l'intégration. DICTIONNAIRES VISUELS: Création de dictionnaires personnalisés français-langue maternelle avec images de l'école. COMMUNICATION GESTUELLE: Stratégies de communication non-verbale et gestes pour soutenir l'expression. CONNEXIONS CULTURELLES: Opportunities de partager les expériences scolaires de leur pays d'origine et faire des comparaisons respectueuses. SOUTIEN PARENTAL: Ressources traduites pour les familles et invitation à partager leurs propres traditions éducatives.`
    };

    const authenticIndigenous = `PERSPECTIVES TRADITIONNELLES MI'KMAQ SUR LA COMMUNAUTÉ:
L'intégration authentique des enseignements Mi'kmaq explore les concepts traditionnels de responsabilité communautaire et de bien-être collectif. Les élèves apprennent sur Msit No'kmaq (tous nos relations), le principe fondamental que tous les membres d'une communauté sont interconnectés et responsables les uns des autres.

CERCLES DE PAROLE ET PRISE DE DÉCISION:
En s'inspirant des pratiques traditionnelles Mi'kmaq de cercles de parole, les élèves participent à des discussions démocratiques où chaque voix est respectée et entendue. Ils apprennent l'importance de l'écoute attentive et de la prise de décision consensuelle, reflétant les modèles de gouvernance autochtones.

ENSEIGNEMENTS DES AÎNÉS:
L'unité honore l'importance des aînés (personnel scolaire, membres de la communauté) comme détenteurs de sagesse et guides. Les élèves apprennent à montrer le respect approprié envers les aînés et à reconnaître leur rôle crucial dans la transmission des connaissances et traditions.

RESPONSABILITÉ ENVERS LES SEPT GÉNÉRATIONS:
Introduction appropriée à l'âge du concept que nos actions aujourd'hui affectent les générations futures, encourageant les élèves à penser à comment leurs comportements à l'école peuvent créer un héritage positif pour les futurs élèves.

CONNEXION À LA TERRE ET AU TERRITOIRE:
Reconnaissance respectueuse que notre école se trouve sur le territoire traditionnel Mi'kmaq, créant une conscience territoriale et un respect pour l'histoire et la présence continue des peuples autochtones dans cette région.`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE INCLUSIVE ET MULTILINGUE:

LETTRE DE BIENVENUE (disponible en français, anglais, et autres langues sur demande):
Cette unité invite votre enfant à découvrir notre école comme une communauté riche et diversifiée. Nous célébrons toutes les structures familiales et encourageons le partage des expériences scolaires variées de chaque famille. PARTICIPATION OPTIONNELLE: Toutes les activités familiales sont entièrement optionnelles avec des alternatives complètes pour chaque élève.

MISES À JOUR HEBDOMADAIRES:
• Photos et vidéos des apprentissages de votre enfant (avec permissions appropriées)
• Suggestions d'activités d'extension à la maison pour renforcer le vocabulaire français
• Questions de discussion familiale pour approfondir les concepts communautaires  
• Ressources pour soutenir le développement du français à la maison

OPPORTUNITÉS D'ENGAGEMENT FAMILIAL (toutes optionnelles):
• Invitation à partager vos propres expériences scolaires et traditions éducatives
• Opportunités de visiter la classe pour partager votre profession ou expertise
• Contribution au livre de classe avec des histoires familiales (selon votre confort)
• Participation aux célébrations de communauté scolaire selon vos traditions

SOUTIEN POUR FAMILLES DIVERSES:
• Reconnaissance et célébration de toutes les configurations familiales
• Ressources multilingues et support de traduction disponible
• Alternatives complètes pour les élèves qui ne peuvent pas participer aux activités familiales
• Communication culturellement sensible respectant toutes les traditions et valeurs familiales

RESSOURCES ÉDUCATIVES:
• Guides pour soutenir l'apprentissage du français à la maison
• Suggestions de livres et médias qui renforcent les concepts communautaires
• Stratégies pour développer la citoyenneté responsable en famille
• Connexions aux ressources communautaires et culturelles locales`;

    // Update the unit with rich content
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapmo0000vj1wwl61z365' },
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

    console.log('✅ Unit 1 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit1();