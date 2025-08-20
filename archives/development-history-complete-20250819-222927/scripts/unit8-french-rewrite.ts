import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unit8FrenchRewrite() {
  try {
    console.log('🇫🇷 UNIT 8 FRENCH PEDAGOGY REWRITE - Art Environnemental\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Find Unit 8 (Art Environnemental)
    const unit8 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Art Environnemental"
      }
    });

    if (!unit8) {
      console.log('❌ Unit 8 not found');
      return;
    }

    console.log(`Found Unit 8: ${unit8.title}`);
    console.log(`Current description: ${unit8.description?.substring(0, 100)}...\n`);

    // Rewrite with authentic French-first pedagogy
    const updatedUnit8 = await prisma.unitPlan.update({
      where: { id: unit8.id },
      data: {
        description: "Dans le printemps français d'avril, les élèves deviennent des artistes-écologues qui créent en harmonie avec la terre. Chaque jour, ils découvrent comment l'art français peut protéger notre planète, transformer les déchets en beauté, et enseigner l'amour de la nature à travers des créations respectueuses et durables.",
        
        descriptionFr: "Dans le printemps français d'avril, les élèves deviennent des artistes-écologues qui créent en harmonie avec la terre.",
        
        bigIdeas: "L'art français et la nature sont partenaires depuis toujours. En créant avec respect pour l'environnement, nous apprenons que nos mains d'artistes peuvent guérir la planète. Chaque création écologique française raconte l'amour que nous portons à notre terre commune.",
        
        bigIdeasFr: "L'art français et la nature sont partenaires depuis toujours. En créant avec respect pour l'environnement, nous apprenons que nos mains d'artistes peuvent guérir la planète.",
        
        essentialQuestions: [
          "Comment mon art français peut-il protéger notre belle planète?",
          "Quels trésors naturels puis-je transformer en art respectueux?",
          "Comment mes créations enseignent-elles l'amour de l'environnement?",
          "Que deviennent nos déchets quand ils rencontrent l'art français?",
          "Comment puis-je être un artiste-écologiste francophone?"
        ],
        
        keyVocabulary: [
          "environnement", "nature", "écologie", "planète", "terre",
          "recycler", "réutiliser", "transformer", "durable", "respectueux",
          "déchets", "matériaux naturels", "feuilles", "branches", "pierres",
          "pollution", "protection", "conservation", "préserver", "soigner",
          "écologiste", "responsable", "avenir", "génération", "héritage"
        ],
        
        crossCurricularConnections: "Français: Vocabulaire environnemental, expression de l'amour de la nature. Mathématiques: Classification écologique, mesures de conservation. Sciences: Cycles naturels, écosystèmes, recyclage. Études sociales: Responsabilité environnementale francophone.",
        
        indigenousPerspectives: "Sagesse écologique Mi'kmaq, utilisation traditionnelle respectueuse des ressources naturelles, art comme gardien de la terre, enseignements ancestraux sur la durabilité, connexion spirituelle avec l'environnement.",
        
        communityConnections: "Éco-artistes francophones locaux, projets environnementaux communautaires acadiens, jardins écologiques francophones, collaborations avec groupes environnementaux, exposition d'art écologique familiale."
      }
    });

    console.log('✅ Unit 8 rewrite completed!');
    console.log(`New description: ${updatedUnit8.description?.substring(0, 100)}...\n`);
    console.log('🇫🇷 AUTHENTIC FRENCH PEDAGOGY FEATURES:');
    console.log('  ▸ "artistes-écologues" - unique French compound concept');
    console.log('  ▸ Emphasizes healing the planet through French art');
    console.log('  ▸ Connects to Francophone environmental responsibility');
    console.log('  ▸ Natural spring timing for environmental themes');
    console.log('  ▸ "terre commune" - shared environmental values');

  } catch (error) {
    console.error('Error in Unit 8 French rewrite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unit8FrenchRewrite();