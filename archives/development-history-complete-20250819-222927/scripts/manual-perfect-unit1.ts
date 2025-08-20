import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnit1() {
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
    orderBy: { startDate: 'asc' },
    take: 1
  });
  
  if (units.length === 0) {
    console.log('No units found');
    return;
  }
  
  const unit = units[0];
  
  const perfectBigIdeas = [
    "Le français est une langue vivante que nous utilisons pour communiquer et créer ensemble.",
    "Chaque mot français que j'apprends me connecte à une nouvelle communauté.",
    "L'école française est un lieu sécuritaire où je peux essayer et grandir en confiance.",
    "Les routines françaises m'aident à me sentir à l'aise et à participer pleinement."
  ];
  
  const perfectQuestions = [
    "Comment puis-je utiliser mes nouveaux mots français pour me faire des amis?",
    "Qu'est-ce qui me rend fier quand je parle français à l'école?",
    "Comment les routines françaises m'aident-elles à me sentir en sécurité?",
    "Quelles sont mes découvertes les plus excitantes en français cette semaine?"
  ];
  
  const perfectDescription = `CADRE PÉDAGOGIQUE PARFAIT: 20 leçons de fondation française avec flexibilité intégrée

STRUCTURE CORE + EXTENSION:
• 14 LEÇONS ESSENTIELLES (70%): Vocabulaire de survie (bonjour, au revoir, merci, aide, toilette, eau, Je m'appelle), routines quotidiennes, communication de base, sécurité linguistique
• 6 LEÇONS D'ENRICHISSEMENT (30%): Vocabulaire étendu, projets créatifs, explorations culturelles, expressions avancées

CRITÈRES DE SUCCÈS CLAIRS:
• Je peux dire bonjour et au revoir à mes amis en français avec confiance
• Je peux demander de l'aide en français quand j'en ai besoin
• Je peux dire mon nom et participer aux routines françaises
• Je peux utiliser 10 mots français essentiels dans mes activités quotidiennes
• Je peux écouter et comprendre les instructions simples en français

APPROCHE PÉDAGOGIQUE: Structure ETFO à trois parties (Mise en train, Action, Consolidation) avec accent sur la sécurité linguistique et la joie d'apprendre. L'apprentissage est authentique, contextualisé dans la vraie vie scolaire.

FLEXIBILITÉ QUOTIDIENNE: Emily peut adapter le rythme, prolonger les activités populaires, et répondre à l'énergie de la classe. Les leçons essentielles peuvent être étendues si nécessaire, les enrichissements peuvent être adaptés selon l'engagement.

IMMERSION FRANÇAISE TOTALE: Tout le contenu est conçu pour être livré en français avec supports visuels appropriés pour Grade 1.`;

  const perfectAssessment = `ÉVALUATION AUTHENTIQUE ET SIMPLE:

FORMATIF (En cours d'apprentissage):
• Observations quotidiennes: L'élève utilise-t-il les salutations françaises naturellement?
• Check-ins verbaux: "Comment tu te sens en français aujourd'hui?" (peut répondre en anglais)
• Auto-évaluation simple: Thumbs up/down pour "Je me sens à l'aise en français"
• Photos d'apprentissage: élèves participant aux routines françaises

SOMMATIF (Démonstration de l'apprentissage):
• Semaine 2: L'élève peut se présenter en français (nom seulement)
• Semaine 4: L'élève participe aux routines quotidiennes sans rappels
• Portfolio audio: enregistrement bref au début et à la fin (croissance évidente)
• Célébration finale: chaque élève partage une chose qu'il aime en français

PAS D'EXAMENS, PAS DE STRESS - Juste des preuves naturelles d'apprentissage joyeux.`;

  await prisma.unitPlan.update({
    where: { id: unit.id },
    data: {
      bigIdeas: perfectBigIdeas,
      essentialQuestions: perfectQuestions,
      description: perfectDescription,
      assessmentPlan: perfectAssessment
    }
  });
  
  console.log('✅ PERFECT UNIT 1 CREATED!');
  console.log('📊 Perfect Features:');
  console.log('• Big Ideas: 4 conceptual understandings');
  console.log('• Essential Questions: 4 deep thinking prompts');
  console.log('• Core: 14 lessons (70%) essential foundations');
  console.log('• Extension: 6 lessons (30%) flexible enrichments');
  console.log('• Success Criteria: 5 clear learning targets');
  console.log('• Assessment: Authentic, manageable, joyful');
  console.log('• Flexibility: Built into every aspect');
  
  await prisma.$disconnect();
}

createPerfectUnit1().catch(console.error);