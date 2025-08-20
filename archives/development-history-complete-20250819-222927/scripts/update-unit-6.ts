import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit6() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 6: Citoyenneté et responsabilité');
    
    const richDescription = `Cette unité transforme les jeunes élèves de 6 ans en citoyens conscients et responsables, leur donnant les outils et la compréhension nécessaires pour contribuer positivement à leur école, leur communauté et leur société. Construisant sur toutes leurs explorations précédentes de communauté, aide mutuelle, famille, géographie et navigation, cette unité synthétise ces apprentissages en une compréhension holistique de ce que signifie être un bon citoyen.

L'unité explore la citoyenneté comme un ensemble de droits ET de responsabilités interconnectés. Les élèves apprennent que les droits ne sont pas des privilèges qu'on reçoit automatiquement, mais des protections importantes qui viennent avec la responsabilité de respecter les droits des autres. Cette compréhension équilibrée développe l'empathie et la considération pour autrui.

Un aspect central est l'exploration pratique de la démocratie en action. Les élèves participent à de vrais processus démocratiques dans leur classe - votant sur des décisions importantes, participant à des débats respectueux, contribuant à l'élaboration de règles et d'accords communautaires. Ils apprennent que la démocratie exige la participation active et respectueuse de tous les membres.

Le développement de compétences de résolution de conflits appropriées à l'âge est intégré throughout. Les élèves apprennent des stratégies concrètes pour résoudre les désaccords pacifiquement, pour communiquer leurs besoins respectueusement, et pour trouver des solutions qui fonctionnent pour tout le monde. Ces compétences deviennent des outils de vie essentiels.

L'intégration de perspectives Mi'kmaq explore respectueusement les systèmes traditionnels de gouvernance autochtone basés sur le consensus, le respect des aînés, et la prise de décision collective. Les élèves apprennent sur les Sept Enseignements Sacrés comme guide pour la citoyenneté responsable et les relations communautaires harmonieuses.

La citoyenneté environnementale est introduite à travers des actions concrètes que les élèves peuvent entreprendre pour prendre soin de leur environnement scolaire et communautaire. Ils développent une compréhension que les citoyens responsables prennent soin des espaces partagés et des ressources communes.

Cette unité culminate l'année en préparant les élèves à être des leaders et des contributeurs positifs dans tous leurs futurs environnements éducatifs et communautaires.`;

    const richDescriptionFr = `Cette unité développe de jeunes citoyens responsables qui comprennent leurs droits et leurs responsabilités. En français immersion, les élèves apprennent à participer démocratiquement, à résoudre les conflits pacifiquement, et à contribuer positivement à leur communauté scolaire et au-delà, développant les compétences civiques essentielles pour toute leur vie.`;

    const profoundBigIdeas = `Être un bon citoyen signifie équilibrer nos droits personnels avec nos responsabilités envers les autres. La démocratie fonctionne quand tout le monde participe respectueusement et considère le bien-être de la communauté entière. Chaque personne, même les enfants, a le pouvoir et la responsabilité de rendre sa communauté meilleure pour tous.`;

    const profoundBigIdeasFr = `La citoyenneté responsable signifie prendre soin de notre communauté et respecter les droits de tous. Quand nous participons démocratiquement et résolvons les conflits pacifiquement, nous créons des communautés où tout le monde peut s'épanouir et se sentir en sécurité et respecté.`;

    const meaningfulQuestions = [
      "Quels sont nos droits importants et quelles responsabilités viennent avec ces droits?",
      "Comment pouvons-nous participer démocratiquement aux décisions qui nous affectent à l'école et dans notre communauté?",
      "Quelles stratégies nous aident à résoudre les conflits de manières qui respectent tout le monde?",
      "Comment pouvons-nous être des leaders positifs qui aident à créer des communautés inclusives et respectueuses?",
      "Quelles actions concrètes pouvons-nous prendre pour améliorer notre école et notre communauté?",
      "Comment les différentes communautés autour du monde pratiquent-elles la citoyenneté responsable et la démocratie?"
    ];

    const richVocabulary = [
      "citoyen", "citoyenneté", "responsabilité", "droits", "devoirs", "obligations",
      "démocratie", "démocratique", "vote", "élection", "participation", "consensus",
      "gouvernement", "règles", "lois", "justice", "équité", "fairness", "égalité",
      "conflit", "résolution", "négociation", "compromis", "médiation", "paix",
      "leadership", "influence", "exemple", "modèle", "inspiration", "courage",
      "respect", "tolérance", "inclusion", "diversité", "acceptation", "empathie",
      "communauté", "bien commun", "intérêt public", "solidarité", "coopération",
      "environnement", "durabilité", "conservation", "protection", "intendance"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE DE LA CITOYENNETÉ EN ACTION:
• Portfolios de citoyenneté documentant la croissance dans les comportements démocratiques et responsables avec réflexions françaises
• Observations lors de processus démocratiques réels (votes, débats, élaboration de règles) avec attention aux compétences de participation respectueuse
• Auto-évaluations guidées sur l'utilisation de stratégies de résolution de conflits et de communication respectueuse en français
• Carnets de leadership où les élèves documentent leurs actions pour améliorer leur communauté scolaire
• Discussions de groupe enregistrées démontrant la compréhension équilibrée des droits et responsabilités
• Projets de service communautaire évalués pour l'impact positif et la réflexion sur la citoyenneté responsable

TÂCHES DE PERFORMANCE CIVIQUES AUTHENTIQUES:
• Participation à un "gouvernement de classe" avec rôles rotatifs et responsabilités démocratiques réelles
• Médiation de vrais conflits mineurs entre camarades utilisant les stratégies apprises
• Organisation d'initiatives d'amélioration scolaire avec présentation aux administrateurs
• Création d'un "guide de citoyenneté" en français pour les nouveaux élèves

ÉVALUATION SOMMATIVE DE CITOYENNETÉ COMPLÈTE:
• Projet final: "Mon Plan d'Action Civique" - identification d'un problème communautaire et développement d'un plan d'action réaliste avec présentation persuasive en français
• Démonstration de leadership: Organisation et facilitation d'une activité démocratique pour d'autres élèves

CRITÈRES DE RÉUSSITE CIVIQUES SPÉCIFIQUES:
• L'élève identifie et explique en français au moins 5 droits et responsabilités importants des citoyens
• L'élève participe constructivement aux processus démocratiques de classe (votes, débats, élaboration de règles)
• L'élève utilise efficacement au moins 3 stratégies de résolution de conflits dans des situations réelles
• L'élève utilise correctement au moins 25 termes de vocabulaire civique français
• L'élève démontre des comportements de leadership positif qui contribuent au bien-être communautaire
• L'élève planifie et exécute au moins une action concrète pour améliorer sa communauté scolaire`;

    const evidenceBasedDifferentiation = {
      forStruggling: `APPRENTISSAGE CIVIQUE CONCRET: Jeux de rôles structurés avec scripts visuels pour pratiquer les interactions démocratiques et les comportements citoyens. SUPPORTS VISUELS CIVIQUES: Affiches de référence avec stratégies de résolution de conflits illustrées et vocabulaire civique français avec images. PARTICIPATION GRADUÉE: Rôles de citoyenneté progressifs commençant par des responsabilités simples et augmentant graduellement en complexité. MODELAGE EXPLICITE: Démonstrations répétées de comportements démocratiques et de leadership positif avec practice guidée. FEEDBACK IMMÉDIAT: Recognition et renforcement constants des comportements civiques positifs pour encourager la croissance continue. CHOIX PERSONNALISÉS: Opportunités de démontrer la citoyenneté de manières qui correspondent aux intérêts et forces individuels.`,
      
      forAdvanced: `LEADERSHIP CIVIQUE AVANCÉ: Rôles de facilitation dans les processus démocratiques de classe avec formation spécialisée en techniques de consensus et médiation. RECHERCHE GOUVERNEMENTALE: Investigation des systèmes démocratiques locaux, provinciaux et fédéraux avec présentation d'expertise aux camarades. PROJETS DE CHANGEMENT SOCIAL: Développement et implémentation d'initiatives réelles pour aborder des problèmes scolaires ou communautaires identifiés. MENTORAT CIVIQUE: Assistance aux élèves plus jeunes dans le développement de compétences démocratiques et de résolution de conflits. ENGAGEMENT COMMUNAUTAIRE: Participation à de vrais processus civiques communautaires avec présentation de perspectives jeunesse. ANALYSE CRITIQUE: Exploration des défis démocratiques contemporains avec propositions de solutions créatives et réfléchies.`,
      
      forELL: `CITOYENNETÉ MULTICULTURELLE: Exploration respectueuse des systèmes démocratiques et traditions civiques de leurs pays d'origine avec comparaisons interculturelles enrichissantes. VOCABULAIRE CIVIQUE MULTILINGUE: Dictionnaires français-langue maternelle avec termes démocratiques et concepts de citoyenneté avec contexte culturel. LEADERSHIP CULTUREL: Opportunités de partager les méthodes traditionnelles de résolution de conflits et de prise de décision de leurs cultures avec traduction. MENTORSHIP LINGUISTIQUE: Jumelage avec élèves francophones pour pratiquer le vocabulaire civique dans des contextes de résolution de problèmes réels. PARTICIPATION SOUTENUE: Support supplémentaire pour comprendre les conventions démocratiques canadiennes avec respect pour leurs expériences civiques antérieures. PONT CULTUREL: Rôles de liaison pour aider d'autres élèves immigrants à comprendre et participer aux processus démocratiques scolaires.`
    };

    const authenticIndigenous = `SYSTÈMES TRADITIONNELS DE GOUVERNANCE MI'KMAQ ET PRISE DE DÉCISION COLLECTIVE:
L'intégration respectueuse explore les méthodes sophistiquées de gouvernance Mi'kmaq basées sur le consensus, le respect des perspectives de tous les membres communautaires, et la prise de décision qui considère l'impact sur sept générations futures.

LES SEPT ENSEIGNEMENTS SACRÉS COMME GUIDE CIVIQUE:
Introduction respectueuse aux Sept Enseignements Sacrés (Sagesse, Amour, Respect, Courage, Honnêteté, Humilité, Vérité) comme cadre pour la citoyenneté responsable et les relations communautaires harmonieuses.

CERCLES DE PAROLE ET DÉMOCRATIE PARTICIPATIVE:
Apprentissage respectueux des traditions de cercles de parole Mi'kmaq où chaque voix est entendue et respectée, offrant un modèle alternatif de démocratie participative basé sur l'écoute profonde et le respect mutuel.

RÔLES TRADITIONNELS DE LEADERSHIP ET RESPONSABILITÉ COLLECTIVE:
Compréhension de comment les communautés Mi'kmaq traditionnelles distribuaient le leadership selon l'expertise et la sagesse plutôt que le pouvoir hiérarchique, créant une appréciation pour le leadership collaboratif.

RÉSOLUTION TRADITIONNELLE DE CONFLITS ET JUSTICE RÉPARATRICE:
Exploration respectueuse des méthodes traditionnelles Mi'kmaq de résolution de conflits qui se concentrent sur la guérison, la réconciliation et la restauration de l'harmonie communautaire plutôt que sur la punition.

RESPONSABILITÉ ENVIRONNEMENTALE COMME CITOYENNETÉ:
Les enseignements traditionnels sur la responsabilité humaine de prendre soin de toute la création, offrant une perspective holistique de la citoyenneté qui s'étend au-delà des relations humaines pour inclure notre responsabilité envers l'environnement naturel.`;

    const enhancedParentCommunication = `COMMUNICATION FAMILIALE SUR LE DÉVELOPPEMENT CIVIQUE:

LETTRE D'INTRODUCTION (multilingue disponible):
Cette unité développe les compétences civiques essentielles de votre enfant! Ils apprendront sur leurs droits et responsabilités, participeront à des processus démocratiques, et développeront des compétences de leadership et de résolution de conflits. Nous célébrons toutes les perspectives sur la citoyenneté et encourageons le partage d'expériences civiques familiales diverses.

DÉMOCRATIE FAMILIALE ET APPRENTISSAGE CIVIQUE (optionnel):
• Suggestions pour pratiquer la prise de décision démocratique en famille selon votre style familial
• Opportunités de partager vos expériences avec la citoyenneté, le vote, et la participation communautaire
• Invitation à discuter les traditions civiques et démocratiques de vos cultures d'origine
• Exploration des différentes façons dont les familles participent à leur communauté

DÉVELOPPEMENT DE COMPÉTENCES CIVIQUES À LA MAISON:
• Stratégies pour encourager la résolution respectueuse de conflits familiaux appropriée à l'âge
• Ressources pour développer le vocabulaire civique français et la compréhension démocratique
• Suggestions pour impliquer votre enfant dans des décisions familiales appropriées
• Guides pour encourager le leadership positif et la responsabilité personnelle à la maison

ENGAGEMENT COMMUNAUTAIRE FAMILIAL (selon votre confort):
• Informations sur les opportunités de participation civique familiale dans votre communauté
• Suggestions pour des projets de service communautaire familiaux appropriés à l'âge
• Ressources pour explorer ensemble les processus démocratiques locaux et provinciaux
• Invitation à partager vos propres expériences de leadership et de service communautaire

RECONNAISSANCE DE DIVERSITÉ CIVIQUE:
• Respect pour les familles qui peuvent avoir des expériences diverses avec les systèmes gouvernementaux
• Célébration des différentes traditions civiques et démocratiques des familles de notre classe
• Alternatives pour les familles qui préfèrent ne pas discuter de politique ou de gouvernement
• Support pour les familles nouvelles au Canada pour comprendre les processus civiques canadiens

RESSOURCES CIVIQUES ÉDUCATIVES:
• Informations sur les ressources gouvernementales et civiques appropriées à l'âge pour les familles
• Guides pour enseigner la citoyenneté responsable et l'engagement démocratique à la maison
• Connexions aux organisations civiques communautaires et aux programmes d'engagement familial
• Support pour accéder aux ressources sur les droits, responsabilités, et processus démocratiques canadiens`;

    // Update Unit 6
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapoe0041vj1wp65vf801' },
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

    console.log('✅ Unit 6 enhanced with world-class content!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New parent communication length: ${enhancedParentCommunication.length} characters`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 6:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit6();