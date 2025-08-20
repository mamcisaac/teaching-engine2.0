import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUnit3() {
  try {
    console.log('📚 MANUALLY ENHANCING UNIT 3: Nos familles et traditions (WITH CHRISTMAS BREAK FIX)');
    
    // First, let's fix the Christmas break violation by deleting lessons during break
    console.log('🎄 FIXING CHRISTMAS BREAK VIOLATION:');
    
    const christmasStart = new Date('2025-12-19');
    const christmasEnd = new Date('2026-01-05');
    
    // Get lessons during Christmas break
    const christmasLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: 'cmehvapnf001mvj1wfpkvqswp',
        date: {
          gte: christmasStart,
          lte: christmasEnd
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log(`Found ${christmasLessons.length} lessons during Christmas break - deleting them:`);
    christmasLessons.forEach(lesson => {
      console.log(`  - ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
    });
    
    // Delete Christmas break lessons
    if (christmasLessons.length > 0) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: {
            in: christmasLessons.map(l => l.id)
          }
        }
      });
      console.log(`✅ Deleted ${christmasLessons.length} Christmas break lessons`);
    }
    
    // Update unit end date to respect Christmas break
    await prisma.unitPlan.update({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      data: {
        endDate: new Date('2025-12-18') // End before Christmas break
      }
    });
    console.log('✅ Updated unit end date to December 18, 2025');
    
    const richDescription = `Cette unité représente l'approche la plus sensible et inclusive possible pour explorer la diversité magnifique des familles tout en maintenant la sécurité émotionnelle de chaque enfant. Reconnaissant que les familles viennent dans toutes les formes et configurations, cette unité célèbre l'amour, les soins et les connexions qui rendent chaque famille spéciale, sans jamais faire d'assumptions sur la structure familiale de qui que ce soit.

L'approche pédagogique est construite sur le principe fondamental que TOUTE participation familiale est entièrement OPTIONNELLE. Les élèves explorent les concepts universels de famille - l'amour, les soins, les traditions, la sécurité, la croissance - à travers des lentilles multiples qui incluent les familles nucléaires, les familles monoparentales, les familles dirigées par les grands-parents, les familles adoptives, les familles d'accueil, les familles recomposées, et toute autre configuration familiale.

L'unité se concentre sur les traditions et célébrations comme des fenêtres vers différentes cultures, mais toujours avec un respect profond pour ceux qui ne célèbrent pas certaines fêtes ou qui ont des expériences familiales complexes. Les élèves apprennent sur la timeline personnelle et les événements de vie importants, développant une compréhension de comment nous grandissons et changeons avec le temps.

L'intégration de perspectives Mi'kmaq est particulièrement riche ici, explorant les concepts traditionnels de famille étendue, les enseignements des sept générations, et l'importance des aînés et des enfants dans la préservation des traditions. Cette perspective offre une vision holistique de la famille qui s'étend au-delà des liens biologiques pour inclure la communauté entière.

Pendant la saison des fêtes (novembre-décembre), l'unité reconnaît et respecte la diversité des traditions tout en créant des alternatives inclusives pour chaque élève. Les activités se concentrent sur les concepts universels de gratitude, générosité et connexion communautaire plutôt que sur des célébrations spécifiques.

Le développement du vocabulaire français se concentre sur les termes familiaux inclusifs et les expressions de sentiment qui permettent aux élèves de décrire leur propre expérience familiale avec fierté et confiance, quelle que soit leur situation.`;

    const richDescriptionFr = `Cette unité célèbre la beauté unique de chaque famille tout en respectant profondément la diversité des structures familiales et des traditions. En français immersion, les élèves explorent comment l'amour, les soins et les connexions spéciales rendent chaque famille précieuse, développant le vocabulaire français pour exprimer leurs propres expériences avec fierté et respect pour tous.`;

    const profoundBigIdeas = `Les familles sont créées par l'amour, les soins et les connexions spéciales - pas par une structure particulière. Chaque famille a des traditions et des façons de montrer l'amour qui la rendent unique et précieuse. Les traditions nous connectent à notre histoire et nous aident à nous sentir appartenir, mais la plus importante tradition est de prendre soin les uns des autres avec gentillesse et respect.`;

    const profoundBigIdeasFr = `Toutes les familles sont spéciales parce qu'elles sont remplies d'amour et de soins. Nos traditions et nos célébrations nous aident à nous connecter avec nos ancêtres et à créer des souvenirs précieux ensemble, mais ce qui rend vraiment une famille importante c'est l'amour qu'elle partage.`;

    const meaningfulQuestions = [
      "Qu'est-ce qui rend chaque famille spéciale et unique, peu importe qui en fait partie?",
      "Comment les familles montrent-elles leur amour et prennent-elles soin les unes des autres de différentes façons?",
      "Quelles traditions et célébrations nous aident à nous sentir connectés et pourquoi sont-elles importantes?",
      "Comment pouvons-nous respecter et célébrer les différentes traditions des familles de notre classe?",
      "Quels événements importants marquent notre croissance et nos changements au fil du temps?",
      "Comment pouvons-nous créer de nouvelles traditions qui incluent et célèbrent tout le monde?"
    ];

    const richVocabulary = [
      "famille", "amour", "soins", "sécurité", "appartenance", "connexion",
      "parent", "grand-parent", "frère", "sœur", "cousin", "cousine", "tante", "oncle",
      "tradition", "célébration", "fête", "culture", "héritage", "coutume", "rituel",
      "généreux", "reconnaissant", "respectueux", "inclusif", "diversité", "unicité",
      "croissance", "changement", "souvenir", "histoire", "passé", "présent", "futur",
      "gentillesse", "partage", "générosité", "gratitude", "honneur", "fierté"
    ];

    const comprehensiveAssessment = `ÉVALUATION FORMATIVE AVEC SENSIBILITÉ FAMILIALE:
• Portfolios de réflexion personnelle où les élèves peuvent choisir comment représenter leur famille (dessins, photos, histoires, symboles)
• Observations respectueuses des discussions de groupe sur les traditions universelles (gratitude, générosité, soins)
• Auto-évaluations guidées sur l'utilisation respectueuse du vocabulaire français pour décrire différents types de familles
• Projets de timeline personnelle OPTIONNELS avec alternatives complètes pour tous les élèves
• Créations artistiques célébrant les concepts universels de famille sans exiger de détails personnels
• Discussions de groupe enregistrées montrant le respect et l'inclusion de différentes perspectives familiales

ALTERNATIVES INCLUSIVES POUR TOUTES LES TÂCHES:
• Pour les élèves qui préfèrent ne pas partager sur leur famille: Focus sur les familles d'animaux, les familles dans les livres, ou les familles de classe
• Pour les élèves avec des expériences familiales complexes: Exploration des familles choisies, des mentors, ou des communautés de soutien
• Pour les élèves de différentes cultures: Célébration de TOUTES les traditions avec égalité et respect

ÉVALUATION SOMMATIVE RESPECTUEUSE:
• Projet final: "Les Familles Sont Partout" - une célébration multimédia des différents types de familles dans le monde, permettant aux élèves de contribuer selon leur confort
• Présentation sur les traditions universelles: Comment différentes cultures montrent l'amour, la gratitude, et les soins familiaux

CRITÈRES DE RÉUSSITE SENSIBLES:
• L'élève utilise correctement le vocabulaire français pour décrire différents types de familles avec respect
• L'élève démontre la compréhension que les familles viennent dans différentes formes et que toutes sont valides
• L'élève explique comment les traditions nous aident à nous connecter, sans être obligé de partager ses propres traditions
• L'élève montre du respect et de l'inclusion envers les différentes expériences familiales de ses camarades
• L'élève comprend comment nous grandissons et changeons avec le temps à travers des exemples appropriés`;

    const evidenceBasedDifferentiation = {
      forStruggling: `SUPPORTS ÉMOTIONNELS ET VISUELS: Options multiples pour représenter la famille (dessins simples, photos, symboles, couleurs) sans exiger des détails. ALTERNATIVES SÉCURITAIRES: Focus sur la "famille de classe" ou les familles d'animaux pour les élèves qui ont besoin d'alternatives. VOCABULAIRE ADAPTÉ: Cartes visuelles avec termes familiaux inclusifs et expressions de sentiment positives. CHOIX PERSONNEL: Liberté complète de choisir quoi partager et comment participer. SOUTIEN ÉMOTIONNEL: Check-ins individuels pour s'assurer du confort émotionnel pendant l'unité. ACTIVITÉS UNIVERSELLES: Focus sur les concepts de soins et gentillesse qui s'appliquent à toutes les situations.`,
      
      forAdvanced: `RECHERCHE CULTURELLE: Investigation respectueuse des traditions familiales de différentes cultures du monde avec présentation multilingue. PROJETS DE SERVICE: Organisation d'initiatives pour soutenir différents types de familles dans la communauté. LEADERSHIP INCLUSIF: Rôles de facilitateurs pour s'assurer que tous les élèves se sentent inclus et respectés. EXPLORATION HISTORIQUE: Recherche sur l'évolution des structures familiales dans différentes sociétés. CRÉATION MULTIMÉDIA: Développement de ressources éducatives sur la diversité familiale pour d'autres classes. MENTORAT ÉMOTIONNEL: Support pour les camarades qui peuvent avoir des expériences familiales difficiles.`,
      
      forELL: `CÉLÉBRATION MULTICULTURELLE: Opportunités de partager les traditions familiales de leurs cultures d'origine avec traduction et soutien. RESSOURCES MULTILINGUES: Matériaux familiaux disponibles dans les langues maternelles avec support de traduction. CONNEXIONS CULTURELLES: Exploration respectueuse des structures familiales traditionnelles de leurs pays d'origine. SOUTIEN LINGUISTIQUE: Jumelage avec des élèves francophones pour pratiquer le vocabulaire familial sensible. ALTERNATIVES CULTURELLES: Reconnaissance que certaines cultures peuvent aborder les discussions familiales différemment. INCLUSION COMPLÈTE: Assurance que toutes les perspectives culturelles sont valorisées et respectées.`
    };

    const authenticIndigenous = `PERSPECTIVES MI'KMAQ SUR LA FAMILLE ÉTENDUE ET LES SEPT GÉNÉRATIONS:
L'intégration respectueuse explore les concepts traditionnels Mi'kmaq de famille qui s'étendent bien au-delà des liens biologiques pour inclure toute la communauté. Les élèves apprennent sur l'interconnexion de toute la vie et comment les familles Mi'kmaq traditionnelles incluent les ancêtres, les générations présentes, et les générations futures.

ENSEIGNEMENT DES SEPT GÉNÉRATIONS:
Introduction appropriée à l'âge au concept que nos actions affectent sept générations dans le passé et sept générations dans le futur, créant une compréhension de responsabilité familiale et communautaire qui transcende le temps.

RÔLES TRADITIONNELS ET RESPECT DES AÎNÉS:
Exploration respectueuse de l'importance des aînés comme détenteurs de sagesse et guides familiaux, créant des connexions avec les grands-parents et figures d'aînés dans les familles des élèves.

CÉRÉMONIES ET TRADITIONS DE CONNEXION:
Compréhension respectueuse de comment les cérémonies traditionnelles Mi'kmaq renforcent les liens familiaux et communautaires, créant des parallèles avec les traditions familiales de tous les élèves.

RELATION AVEC LA TERRE COMME FAMILLE:
Le concept Mi'kmaq que toute la création est interconnectée comme une famille, incluant les animaux, les plantes, et la terre elle-même, offrant une perspective holistique de ce que signifie "famille".

RESPONSABILITÉ COLLECTIVE:
L'enseignement traditionnel que chaque membre de la communauté a la responsabilité de prendre soin de tous les enfants et aînés, pas seulement ceux de leur famille biologique.`;

    const exemplaryFamilySafety = `PROTOCOLES DE SÉCURITÉ FAMILIALE EXEMPLAIRES - LES PLUS COMPLETS POSSIBLES:

APPROCHE FONDAMENTALE: PARTICIPATION ENTIÈREMENT OPTIONNELLE
Chaque activité liée à la famille a des alternatives complètes et égales. Aucun élève n'est jamais obligé de partager des informations personnelles sur sa famille, ses traditions, ou ses circonstances personnelles.

ALTERNATIVES INCLUSIVES POUR CHAQUE ACTIVITÉ:
• Projets sur la famille: Options pour explorer les familles d'animaux, les familles dans les livres, ou créer des familles imaginaires
• Partage de traditions: Focus sur les traditions de classe, les traditions scolaires, ou les traditions culturelles générales
• Timeline personnelle: Alternatives utilisant des personnages fictifs ou des événements historiques généraux
• Projets artistiques familiaux: Options pour créer des œuvres sur l'amitié, la communauté, ou les soins en général

COMMUNICATION MULTILINGUE ET CULTURELLEMENT SENSIBLE:
• Lettres d'information disponibles en français, anglais, et autres langues sur demande
• Reconnaissance explicite que certaines cultures abordent les discussions familiales différemment
• Respect pour les familles qui peuvent préférer la confidentialité pour des raisons religieuses, culturelles, ou personnelles

SOUTIEN POUR SITUATIONS FAMILIALES COMPLEXES:
• Alternatives spécifiques pour les élèves en familles d'accueil, adoptives, ou avec des arrangements de garde complexes
• Support pour les élèves qui peuvent avoir perdu des membres de famille
• Sensibilité aux élèves dont les familles sont séparées géographiquement ou par des circonstances difficiles
• Reconnaissance des familles LGBTQ+ et des structures familiales non-traditionnelles

FORMATION DU PERSONNEL ET PRÉPARATION:
• Formation complète pour tous les enseignants et support staff sur la sensibilité familiale
• Protocoles clairs pour répondre aux questions ou situations sensibles qui peuvent survenir
• Ressources pour soutenir les élèves émotionnellement si l'unité déclenche des réactions difficiles

AUCUNE SUPPOSITION JAMAIS FAITE:
• Aucune supposition sur qui vit avec l'élève
• Aucune supposition sur les traditions religieuses ou culturelles
• Aucune supposition sur les ressources financières ou les circonstances familiales
• Aucune supposition sur les langues parlées à la maison ou les antécédents éducatifs des parents

MESSAGE CONSTANT: TOUTES LES FAMILLES SONT VALIDES, PRÉCIEUSES ET CÉLÉBRÉES.`;

    // Update Unit 3 with the most sensitive content possible
    const updatedUnit = await prisma.unitPlan.update({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
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
        parentCommunicationPlan: exemplaryFamilySafety
      }
    });

    console.log('✅ Unit 3 enhanced with world-class content and exemplary family safety!');
    console.log(`New description length: ${richDescription.length} characters`);
    console.log(`New assessment plan length: ${comprehensiveAssessment.length} characters`);
    console.log(`New vocabulary count: ${richVocabulary.length} terms`);
    console.log(`New family safety protocols length: ${exemplaryFamilySafety.length} characters`);
    
    // Check remaining lessons
    const remainingLessons = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: 'cmehvapnf001mvj1wfpkvqswp' }
    });
    console.log(`Remaining lessons after Christmas break fix: ${remainingLessons}`);

  } catch (error) {
    console.error('❌ Error enhancing Unit 3:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUnit3();