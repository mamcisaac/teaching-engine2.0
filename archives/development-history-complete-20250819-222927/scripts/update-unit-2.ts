import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit2() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 2: Les aides de notre quartier');
    
    const richDescription = `Cette unité ouvre les yeux des jeunes apprenants sur le réseau incroyable d'aides communautaires qui travaillent ensemble pour maintenir notre quartier sûr, sain et prospère. Les élèves de 6 ans découvrent que leur communauté est comme une grande famille étendue où différentes personnes ont des rôles spécialisés qui contribuent au bien-être de tous. À travers des explorations authentiques en français, ils apprennent à reconnaître, apprécier et remercier les héros quotidiens qui rendent leur vie possible.

L'unité transforme la perception des élèves des "emplois" en "services communautaires essentiels". Plutôt que de simplement identifier les professions, les enfants explorent profondément pourquoi ces rôles existent, comment ils nous aident quotidiennement, et comment nous pouvons montrer notre appréciation. Cette approche développe l'empathie, la gratitude et la compréhension des besoins et désirs communautaires.

Un aspect particulièrement riche de cette unité est l'exploration de la citoyenneté numérique appropriée pour l'âge. Les élèves apprennent comment la technologie nous aide à communiquer avec les aides communautaires (appeler les pompiers, utiliser les sites web de la bibliothèque) tout en développant une compréhension précoce de l'utilisation sécuritaire et respectueuse de la technologie.

L'intégration des perspectives Mi'kmaq honore les rôles traditionnels d'aide communautaire et les concepts de réciprocité. Les élèves apprennent sur les guérisseurs traditionnels, les gardiens de la sagesse, et les systèmes d'entraide mutuelle qui ont soutenu les communautés Mi'kmaq pendant des millénaires.

Des rencontres authentiques avec de vrais aides communautaires - pompiers visitant la classe, interviews avec la bibliothécaire, remerciements écrits aux éboueurs - créent des connexions significatives et renforcent le vocabulaire français dans des contextes réels et motivants.

Cette unité établit une compréhension fondamentale que nous vivons dans un monde interconnecté où chaque personne contribue au bien-être collectif, préparant les élèves à devenir des citoyens reconnaissants et responsables.`;

    const richDescriptionFr = `Cette unité célèbre les héros quotidiens de notre quartier - les pompiers courageux, les médecins attentionnés, les bibliothécaires serviables et tous ceux qui rendent notre communauté spéciale. En français immersion, les élèves découvrent comment ces aides travaillent ensemble comme une grande équipe pour nous garder en sécurité et heureux, tout en développant le vocabulaire français essentiel pour communiquer avec respect et gratitude.`;

    const profoundBigIdeas = `Notre quartier est comme une grande famille où différentes personnes ont des rôles spéciaux pour aider tout le monde. Les aides communautaires ne font pas juste un "travail" - ils prennent soin de nous comme une famille prend soin de ses membres. Quand nous comprenons comment ils nous aident, nous pouvons mieux apprécier leur travail et trouver des façons de les remercier et de les soutenir.`;

    const profoundBigIdeasFr = `Notre communauté est remplie d'aides généreux qui travaillent ensemble pour nous garder en sécurité, en santé et heureux. Chaque aide a un rôle important et nous pouvons tous montrer notre gratitude et notre respect pour leur service précieux.`;

    const meaningfulQuestions = [
      "Qui sont tous les aides spéciaux dans notre quartier et comment nous aident-ils chaque jour de manière différente?",
      "Que se passerait-il dans notre communauté si ces aides n'étaient pas là pour nous aider?",
      "Comment pouvons-nous montrer notre appréciation et notre respect envers les aides communautaires?",
      "Quels besoins importants ont les gens dans notre communauté et comment les aides répondent-ils à ces besoins?",
      "Comment pouvons-nous utiliser la technologie de manière sécuritaire pour communiquer avec les aides quand nous en avons besoin?",
      "Comment pouvons-nous devenir des aides dans notre propre communauté scolaire et familiale?"
    ];

    const richVocabulary = [
      "aide", "communauté", "service", "pompier", "policier", "médecin", "infirmière", 
      "bibliothécaire", "facteur", "éboueur", "chauffeur", "garde-sécurité",
      "urgence", "sécurité", "santé", "protection", "secours", "assistance",
      "reconnaissance", "gratitude", "respect", "appréciation", "remerciement",
      "technologie", "communication", "téléphone", "ordinateur", "sécuritaire",
      "besoin", "désir", "entraide", "coopération", "responsabilité"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE AUTHENTIQUE:
• Observations lors de jeux de rôle évalués où les élèves démontrent leur compréhension des différents rôles d'aides communautaires
• Portfolios de gratitude documentant l'évolution de la compréhension des services communautaires à travers dessins et phrases françaises
• Entrevues guidées en français avec les élèves explorant leur compréhension des besoins communautaires
• Utilisation appropriée du vocabulaire français pendant les centres de jeu dramatique communautaire
• Carnets d'observation des services communautaires lors de sorties dans le quartier
• Auto-évaluations sur la capacité à identifier et remercier les aides communautaires
• Discussions de groupe enregistrées montrant la compréhension des concepts de besoins vs désirs

TÂCHES DE PERFORMANCE SIGNIFICATIVES:
• Projet d'interview communautaire: Les élèves préparent et conduisent des interviews en français avec de vrais aides communautaires
• Création de cartes de remerciement bilingues pour différents services communautaires
• Développement d'un guide de sécurité communautaire approprié à l'âge en français
• Présentation "Un jour dans la vie de..." montrant la compréhension d'un rôle d'aide spécifique

ÉVALUATION SOMMATIVE RICHE:
• Projet final: "Notre Réseau de Héros Communautaires" - une exposition multimédia en français célébrant les aides locaux avec entrevues, photos, dessins et messages de gratitude
• Démonstration de citoyenneté numérique: Comment utiliser la technologie de manière sécuritaire pour obtenir de l'aide en cas de besoin

CRITÈRES DE RÉUSSITE DÉTAILLÉS:
• L'élève identifie et décrit en français au moins 8 types d'aides communautaires différents
• L'élève explique comment au moins 5 aides répondent aux besoins de base de la communauté
• L'élève démontre des stratégies appropriées pour remercier et montrer du respect aux aides
• L'élève utilise correctement au moins 20 termes de vocabulaire français liés aux services communautaires
• L'élève distingue entre les besoins essentiels et les désirs dans le contexte communautaire
• L'élève démontre une compréhension de base de l'utilisation sécuritaire de la technologie pour obtenir de l'aide`;

    const evidenceBasedDifferentiation = {
      forStruggling: `SUPPORTS VISUELS CONCRETS: Cartes illustrées avec photos réelles des aides locaux et leurs outils de travail, étiquetées en français avec support visuel. EXPÉRIENCES SENSORIELLES: Manipulation d'équipements réels (casque de pompier, stéthoscope factice) pour renforcer l'apprentissage tactile. MODÉLISATION GUIDÉE: Démonstrations répétées d'interactions respectueuses avec les aides, avec scripts visuels en français. TÂCHES GRADUÉES: Progression des activités simples d'identification vers des interactions plus complexes. TEMPS ÉTENDU: Opportunités multiples de pratiquer le vocabulaire et les interactions sans pression temporelle. CHOIX D'EXPRESSION: Options pour démontrer la compréhension par dessins, gestes, ou phrases courtes selon les capacités individuelles.`,
      
      forAdvanced: `RECHERCHE APPROFONDIE: Investigation des formations requises, des défis quotidiens et des impacts communautaires de différentes professions d'aide. PROJETS DE SERVICE: Organisation de vraies initiatives de remerciement communautaire (collecte pour les pompiers, cartes pour les travailleurs hospitaliers). LEADERSHIP COMMUNAUTAIRE: Rôles de liaison entre la classe et les aides communautaires pour des projets collaboratifs. ANALYSE CRITIQUE: Exploration des défis systémiques que font face les aides communautaires et propositions de solutions créatives. PRÉSENTATION EXPERTE: Développement de présentations sophistiquées sur des sujets d'aide communautaire pour d'autres classes. CITOYENNETÉ NUMÉRIQUE AVANCÉE: Recherche supervisée sur les ressources communautaires en ligne et création de guides pour d'autres élèves.`,
      
      forELL: `CONNECTIONS CULTURELLES: Exploration respectueuse des aides communautaires dans les pays d'origine des élèves avec comparaisons interculturels. VOCABULAIRE MULTILINGUE: Dictionnaires personnalisés français-langue maternelle pour les termes d'aides communautaires. SUPPORTS FAMILIAUX: Ressources traduites permettant aux familles de contribuer leurs expériences avec les aides dans leurs cultures. COMMUNICATION GESTUELLE: Stratégies non-verbales pour interagir respectueusement avec les aides communautaires. MENTORAT LINGUISTIQUE: Jumelage avec des élèves francophones pour pratiquer les interactions en français. CÉLÉBRATION MULTICULTURELLE: Opportunités de partager comment différentes cultures honorent et remercient leurs aides communautaires.`
    };

    const authenticIndigenous = `CONCEPTS TRADITIONNELS MI'KMAQ D'ENTRAIDE COMMUNAUTAIRE:
L'intégration respectueuse explore les systèmes traditionnels Mi'kmaq d'aide mutuelle et de responsabilité communautaire. Les élèves apprennent sur les rôles traditionnels comme les guérisseurs (puoin), les gardiens de sagesse (gisgu), et les pourvoyeurs communautaires qui ont maintenu les communautés en santé pendant des millénaires.

RÉCIPROCITÉ ET GRATITUDE:
Le principe fondamental Mi'kmaq de réciprocité enseigne que recevoir de l'aide crée une responsabilité de donner en retour quand c'est possible. Les élèves explorent comment ce principe s'applique à leur relation avec les aides communautaires modernes - comment montrer la gratitude par le respect, la coopération et l'aide aux autres.

SYSTÈME TRADITIONNEL DE SOINS COMMUNAUTAIRES:
Les élèves apprennent respectueusement sur les façons traditionnelles dont les communautés Mi'kmaq prenaient soin de tous les membres - des enfants aux aînés - créant des parallèles avec notre système moderne d'aides communautaires.

SAGESSE DES AÎNÉS:
L'importance traditionnelle des aînés comme gardiens de sagesse et conseillers communautaires est explorée, créant des connexions avec les aides modernes qui possèdent l'expérience et la sagesse (médecins expérimentés, bibliothécaires knowledgeable).

CONNEXION À LA TERRE ET AUX RESSOURCES:
Compréhension respectueuse de comment les peuples Mi'kmaq ont traditionnellement partagé et protégé les ressources communautaires, créant des liens avec les aides modernes qui protègent nos ressources communes (parcs, bibliothèques, sécurité publique).`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE INCLUSIVE SUR LES AIDES COMMUNAUTAIRES:

LETTRE D'INTRODUCTION (multilingue disponible):
Cette unité célèbre les héros quotidiens qui rendent notre communauté spéciale. Nous explorons comment différentes personnes nous aident et comment nous pouvons montrer notre gratitude. TOUTES LES FAMILLES SONT INCLUSES: Nous célébrons les expériences diverses avec les aides communautaires et reconnaissons que chaque famille peut avoir des relations différentes avec différents services.

ENGAGEMENT FAMILIAL OPTIONNEL:
• Invitation à partager des histoires sur les aides qui ont été spéciaux pour votre famille
• Opportunités pour les parents qui travaillent dans des services communautaires de visiter la classe
• Projets de remerciement familiaux vers les aides locaux (selon votre confort)
• Exploration des aides communautaires dans vos cultures et pays d'origine

SOUTIEN ÉDUCATIF À LA MAISON:
• Activités de vocabulaire français pour renforcer l'apprentissage des termes d'aides communautaires
• Suggestions pour reconnaître et remercier les aides dans votre vie quotidienne
• Ressources pour discuter des besoins vs désirs dans le contexte familial
• Guides pour une introduction appropriée à l'âge à la citoyenneté numérique

RECONNAISSANCE DE DIVERSITÉ:
• Respect pour les familles qui peuvent avoir eu des expériences difficiles avec certains services
• Alternatives pour les élèves qui ne peuvent pas partager d'expériences familiales spécifiques
• Célébration des différentes façons dont les communautés autour du monde organisent l'aide mutuelle
• Support multilingue et culturellement sensible pour toutes les communications

RESSOURCES COMMUNAUTAIRES:
• Informations sur les services locaux disponibles pour les familles
• Contacts pour les services d'urgence appropriés avec instructions en multiple langues
• Ressources pour enseigner la sécurité et la citoyenneté numérique à la maison
• Connections aux événements communautaires célébrant nos aides locaux`;

    // Update Unit 2 with comprehensive content
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapn3000tvj1wx3pcwkci' },
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

    console.log('✅ Unit 2 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit2();