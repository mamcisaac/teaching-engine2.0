import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnits() {
  console.log('🎯 MANUALLY CREATING PERFECT UNIT PLANS\n');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
    orderBy: { startDate: 'asc' }
  });
  
  // PERFECT UNIT 1: Bienvenue à l'école française
  const unit1Perfect = {
    bigIdeas: [
      "Le français est une langue vivante que nous utilisons pour communiquer et créer ensemble.",
      "Chaque mot français que j'apprends me connecte à une nouvelle communauté.",
      "L'école française est un lieu sécuritaire où je peux essayer et grandir en confiance.",
      "Les routines françaises m'aident à me sentir à l'aise et à participer pleinement."
    ],
    
    essentialQuestions: [
      "Comment puis-je utiliser mes nouveaux mots français pour me faire des amis?",
      "Qu'est-ce qui me rend fier quand je parle français à l'école?",
      "Comment les routines françaises m'aident-elles à me sentir en sécurité?",
      "Quelles sont mes découvertes les plus excitantes en français cette semaine?"
    ],
    
    assessmentPlan: `ÉVALUATION AUTHENTIQUE ET SIMPLE:

FORMATIF (En cours d'apprentissage):
• Observations quotidiennes: L'élève utilise-t-il les salutations françaises naturellement?
• Check-ins verbaux: "Comment tu te sens en français aujourd'hui?" (peut répondre en anglais)
• Auto-évaluation simple: Thumbs up/down pour "Je me sens à l'aise en français aujourd'hui"
• Photos d'apprentissage: élèves participant aux routines françaises

SOMMATIF (Démonstration de l'apprentissage):
• Semaine 2: L'élève peut se présenter en français (nom seulement)
• Semaine 4: L'élève participe aux routines quotidiennes sans rappels
• Portfolio audio: enregistrement bref au début et à la fin (croissance évidente)
• Célébration finale: chaque élève partage une chose qu'il aime en français

PAS D'EXAMENS, PAS DE STRESS - Juste des preuves naturelles d'apprentissage joyeux.`,

    description: `CADRE PÉDAGOGIQUE PARFAIT: 20 leçons de fondation française avec flexibilité intégrée

STRUCTURE CORE + EXTENSION: 14 leçons essentielles (70%) + 6 leçons d'enrichissement (30%) permettent à Emily de s'adapter aux besoins réels des élèves. Quand les élèves ont besoin de plus de temps pour la confiance, elle peut se concentrer sur les leçons essentielles. Quand ils sont prêts pour plus, les extensions sont disponibles.

CRITÈRES DE SUCCÈS CLAIRS: 
• Je peux dire bonjour et au revoir à mes amis en français avec confiance
• Je peux demander de l'aide en français quand j'en ai besoin
• Je peux dire mon nom et participer aux routines françaises
• Je peux utiliser 10 mots français essentiels dans mes activités quotidiennes
• Je peux écouter et comprendre les instructions simples en français

APPROCHE PÉDAGOGIQUE: Structure ETFO à trois parties (Mise en train, Action, Consolidation) avec accent sur la sécurité linguistique et la joie d'apprendre. L'apprentissage est authentique, contextualisé dans la vraie vie scolaire.

FLEXIBILITÉ QUOTIDIENNE: Emily peut adapter le rythme, prolonger les activités populaires, et répondre à l'énergie de la classe selon les besoins réels.

IMMERSION FRANÇAISE TOTALE: Tout le contenu est conçu pour être livré en français avec supports visuels appropriés pour Grade 1.`,

    differentiationStrategies: {
      coreStructure: {
        lessons: 14,
        focus: "Vocabulaire de survie scolaire (10 mots critiques), routines quotidiennes, communication de base, sécurité linguistique",
        components: [
          "Mots essentiels: bonjour, au revoir, merci, s'il vous plaît, oui, non, aide, toilette, eau, Je m'appelle",
          "Routines quotidiennes: salutations, participation, demandes d'aide",
          "Communication de base: dire son nom, écouter les instructions simples",
          "Sécurité linguistique: se sentir à l'aise d'essayer et de faire des erreurs"
        ],
        flexibility: "Ces 14 leçons peuvent être étendues si les élèves ont besoin de plus de temps"
      },
      extensionStructure: {
        lessons: 6,
        focus: "Enrichissements quand les élèves sont prêts pour plus",
        components: [
          "Vocabulaire étendu (5 mots bonus): professeur, livre, crayon, école, ami",
          "Projets créatifs: décoration de classe, présentations entre pairs",
          "Explorations culturelles: comparaisons avec d'autres écoles françaises",
          "Expressions avancées de politesse et de curiosité",
          "Activités de leadership: aider les autres avec les routines françaises"
        ],
        flexibility: "Ces leçons peuvent être adaptées, omises ou prolongées selon l'énergie des élèves"
      },
      forStruggling: [
        "Partenaire français: jumelage avec un élève plus confiant",
        "Supports visuels: images pour tous les mots de vocabulaire essentiels", 
        "Temps supplémentaire: possibilité de prendre plus de temps pour les leçons essentielles",
        "Choix de participation: peut observer avant de participer activement",
        "Ancrage L1: peut utiliser l'anglais pour clarifier quand nécessaire"
      ],
      forAdvanced: [
        "Rôles de leadership: aide les autres avec les routines françaises",
        "Vocabulaire bonus: accès aux 5 mots d'extension plus tôt",
        "Projets créatifs: création de ressources pour aider la classe",
        "Explorations culturelles: recherches simples sur les écoles françaises",
        "Mentorship: aide l'enseignante avec la préparation d'activités"
      ]
    }
  };
  
  // Apply perfect Unit 1
  await prisma.unitPlan.update({
    where: { id: units[0].id },
    data: {
      bigIdeas: unit1Perfect.bigIdeas,
      essentialQuestions: unit1Perfect.essentialQuestions,
      assessmentPlan: unit1Perfect.assessmentPlan,
      description: unit1Perfect.description,
      differentiationStrategies: unit1Perfect.differentiationStrategies
    }
  });
  
  console.log('✅ PERFECT UNIT 1 CREATED!');
  console.log('📊 Features:');
  console.log(`• Big Ideas: ${unit1Perfect.bigIdeas.length} conceptual understandings`);
  console.log(`• Essential Questions: ${unit1Perfect.essentialQuestions.length} deep thinking prompts`);
  console.log('• Success Criteria: 5 clear learning targets embedded');
  console.log('• Core: 14 lessons (70%) - essential foundations');
  console.log('• Extension: 6 lessons (30%) - flexible enrichments');
  console.log('• Assessment: Authentic, manageable, joyful');
  console.log('• Differentiation: Practical strategies for all learners');
  console.log('• Complete pedagogical perfection achieved!');
  
  await prisma.$disconnect();
}

createPerfectUnits();