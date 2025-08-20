import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unit7FrenchRewrite() {
  try {
    console.log('🇫🇷 UNIT 7 FRENCH PEDAGOGY REWRITE - Exploration 3D\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Find Unit 7 (Exploration 3D)
    const unit7 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Exploration 3D"
      }
    });

    if (!unit7) {
      console.log('❌ Unit 7 not found');
      return;
    }

    console.log(`Found Unit 7: ${unit7.title}`);
    console.log(`Current description: ${unit7.description?.substring(0, 100)}...\n`);

    // Rewrite with authentic French-first pedagogy
    const updatedUnit7 = await prisma.unitPlan.update({
      where: { id: unit7.id },
      data: {
        description: "Dans l'espace français en trois dimensions de mars, les élèves quittent le monde plat pour découvrir l'art qui vit tout autour d'eux. Chaque jour, ils sculptent leurs idées françaises dans l'argile, construisent leurs rêves avec des matériaux recyclés, et apprennent que l'art français peut être touché de tous les côtés.",
        
        descriptionFr: "Dans l'espace français en trois dimensions de mars, les élèves quittent le monde plat pour découvrir l'art qui vit tout autour d'eux.",
        
        bigIdeas: "L'art français vit dans l'espace comme nous, avec une avant, un arrière, des côtés. En créant en 3D, nous donnons corps à nos idées françaises et les rendons réelles. Nos sculptures racontent des histoires qu'on peut voir de partout, comme la vie elle-même.",
        
        bigIdeasFr: "L'art français vit dans l'espace comme nous, avec une avant, un arrière, des côtés. En créant en 3D, nous donnons corps à nos idées françaises.",
        
        essentialQuestions: [
          "Comment mes idées françaises peuvent-elles prendre forme dans l'espace?",
          "Qu'est-ce qui change quand mon art a une avant et une arrière?",
          "Comment puis-je raconter une histoire française qu'on voit de partout?",
          "Quels matériaux m'aident à construire mes rêves artistiques?",
          "Comment l'art 3D français habite-t-il notre monde comme nous?"
        ],
        
        keyVocabulary: [
          "sculpture", "forme", "espace", "dimension", "volume",
          "hauteur", "largeur", "profondeur", "devant", "derrière",
          "côté", "autour", "construire", "assembler", "modeler",
          "argile", "carton", "papier mâché", "recyclage", "matériau",
          "stable", "équilibre", "support", "base", "structure"
        ],
        
        crossCurricularConnections: "Français: Vocabulaire spatial, descriptions directionnelles. Mathématiques: Géométrie 3D, formes solides, mesures spatiales. Sciences: Propriétés des matériaux, stabilité, équilibre. Études sociales: Sculptures et monuments franco-canadiens.",
        
        indigenousPerspectives: "Sculptures traditionnelles Mi'kmaq, techniques de modelage ancestrales, art cérémoniel tridimensionnel, utilisation respectueuse des matériaux naturels, importance spirituelle des objets sculptés.",
        
        communityConnections: "Sculpteurs francophones locaux, visite d'ateliers de céramique acadiens, monuments et art public francophone, collaboration avec centres d'art communautaires, exposition 3D familiale."
      }
    });

    console.log('✅ Unit 7 rewrite completed!');
    console.log(`New description: ${updatedUnit7.description?.substring(0, 100)}...\n`);
    console.log('🇫🇷 AUTHENTIC FRENCH PEDAGOGY FEATURES:');
    console.log('  ▸ "art qui vit tout autour d\'eux" - spatial French concept');
    console.log('  ▸ Emphasizes giving "corps" (body) to French ideas');
    console.log('  ▸ Natural integration of spatial vocabulary');
    console.log('  ▸ Connects to Franco-Canadian public art');
    console.log('  ▸ March timing for spring construction themes');

  } catch (error) {
    console.error('Error in Unit 7 French rewrite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unit7FrenchRewrite();