import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unit5FrenchRewrite() {
  try {
    console.log('🇫🇷 UNIT 5 FRENCH PEDAGOGY REWRITE - Textures et Matériaux\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Find Unit 5 (Textures et Matériaux)
    const unit5 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Textures et Matériaux"
      }
    });

    if (!unit5) {
      console.log('❌ Unit 5 not found');
      return;
    }

    console.log(`Found Unit 5: ${unit5.title}`);
    console.log(`Current description: ${unit5.description?.substring(0, 100)}...\n`);

    // Rewrite with authentic French-first pedagogy
    const updatedUnit5 = await prisma.unitPlan.update({
      where: { id: unit5.id },
      data: {
        description: "Dans l'univers tactile français de janvier, les élèves découvrent comment leurs mains peuvent « lire » l'art autant que leurs yeux. Chaque jour, ils explorent de nouveaux matériaux en français, enrichissant leur vocabulaire sensoriel tout en créant des œuvres qui racontent l'histoire unique de chaque texture découverte.",
        
        descriptionFr: "Dans l'univers tactile français de janvier, les élèves découvrent comment leurs mains peuvent « lire » l'art autant que leurs yeux.",
        
        bigIdeas: "Les textures parlent français et racontent des histoires que nos mains comprennent. Chaque matériau a sa propre personnalité française et ses secrets à découvrir. En touchant et en créant, nous apprenons un nouveau vocabulaire français qui vit dans nos doigts autant que dans nos mots.",
        
        bigIdeasFr: "Les textures parlent français et racontent des histoires que nos mains comprennent. Chaque matériau a sa propre personnalité française.",
        
        essentialQuestions: [
          "Comment mes mains peuvent-elles « lire » l'art en français?",
          "Quels mots français décrivent ce que je ressens en touchant?",
          "Comment les matériaux de mon monde francophone racontent-ils des histoires?",
          "Que se passe-t-il quand je combine différentes textures françaises?",
          "Comment puis-je créer de nouvelles sensations tactiles en français?"
        ],
        
        keyVocabulary: [
          "texture", "matériau", "tactile", "toucher", "sentir",
          "rugueux", "lisse", "doux", "dur", "épais",
          "mince", "granuleux", "soyeux", "râpeux", "moelleux",
          "tissu", "papier", "sable", "coton", "carton",
          "sensation", "surface", "relief", "contraste", "mélange"
        ],
        
        crossCurricularConnections: "Français: Vocabulaire sensoriel riche, descriptions tactiles poétiques. Mathématiques: Classification des textures, motifs tactiles. Sciences: Propriétés des matériaux, exploration sensorielle. Études sociales: Matériaux traditionnels français et acadiens.",
        
        indigenousPerspectives: "Matériaux naturels traditionnels Mi'kmaq, techniques de préparation respectueuses, texture comme langage spirituel, connexion tactile avec la terre et ses dons, sagesse ancestrale des matériaux.",
        
        communityConnections: "Artisans francophones locaux spécialisés en textiles, visite d'ateliers de métiers d'art acadiens, collaboration avec familles pour découvrir textures culturelles, exposition tactile pour communauté francophone."
      }
    });

    console.log('✅ Unit 5 rewrite completed!');
    console.log(`New description: ${updatedUnit5.description?.substring(0, 100)}...\n`);
    console.log('🇫🇷 AUTHENTIC FRENCH PEDAGOGY FEATURES:');
    console.log('  ▸ Starts from French sensory experience');
    console.log('  ▸ "mains peuvent lire l\'art" - uniquely French concept');
    console.log('  ▸ Grade 1 appropriate French vocabulary');
    console.log('  ▸ Connects to Francophone cultural materials');
    console.log('  ▸ Natural language acquisition through touch');

  } catch (error) {
    console.error('Error in Unit 5 French rewrite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unit5FrenchRewrite();