import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unit9FrenchRewrite() {
  try {
    console.log('🇫🇷 UNIT 9 FRENCH PEDAGOGY REWRITE - Techniques Avancées\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Find Unit 9 (Techniques Avancées)
    const unit9 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Techniques Avancées"
      }
    });

    if (!unit9) {
      console.log('❌ Unit 9 not found');
      return;
    }

    console.log(`Found Unit 9: ${unit9.title}`);
    console.log(`Current description: ${unit9.description?.substring(0, 100)}...\n`);

    // Rewrite with authentic French-first pedagogy
    const updatedUnit9 = await prisma.unitPlan.update({
      where: { id: unit9.id },
      data: {
        description: "Dans le mai français de la maîtrise artistique, les élèves deviennent de vrais artistes francophones qui combinent toutes leurs compétences avec confiance et créativité. Chaque jour, ils choisissent leurs techniques préférées, mélangent leurs apprentissages, et créent des œuvres qui montrent leur parcours magnifique d'artistes français accomplis.",
        
        descriptionFr: "Dans le mai français de la maîtrise artistique, les élèves deviennent de vrais artistes francophones qui combinent toutes leurs compétences avec confiance.",
        
        bigIdeas: "Nous sommes maintenant de véritables artistes français avec une boîte à outils remplie de techniques magiques. En combinant nos apprentissages, nous créons notre style artistique unique en français. Nos choix artistiques racontent qui nous sommes comme créateurs francophones accomplis.",
        
        bigIdeasFr: "Nous sommes maintenant de véritables artistes français avec une boîte à outils remplie de techniques magiques. En combinant nos apprentissages, nous créons notre style unique.",
        
        essentialQuestions: [
          "Comment puis-je combiner toutes mes techniques françaises préférées?",
          "Qu'est-ce qui rend mon style artistique français unique et spécial?",
          "Quelles sont mes forces d'artiste francophone accomplı?",
          "Comment mes choix artistiques racontent-ils mon histoire française?",
          "Quel genre d'artiste français suis-je en train de devenir?"
        ],
        
        keyVocabulary: [
          "avancé", "technique", "maîtrise", "combiner", "mélanger",
          "choisir", "décider", "style", "unique", "personnel",
          "accomplı", "expert", "compétent", "habile", "confiant",
          "créativité", "innovation", "expérimentation", "signature", "identité",
          "portfolio", "réflexion", "progrès", "évolution", "fierté"
        ],
        
        crossCurricularConnections: "Français: Vocabulaire de la réflexion artistique, expression de l'accomplissement. Mathématiques: Combinaisons de techniques, évaluation de progrès. Sciences: Innovation et expérimentation. Études sociales: Identité culturelle francophone artistique.",
        
        indigenousPerspectives: "Maîtrise traditionnelle Mi'kmaq des techniques artistiques, transmission intergénérationnelle des compétences, célébration de l'accomplissement artistique, art comme expression de l'identité culturelle, respect pour l'expertise acquise.",
        
        communityConnections: "Maîtres artistes francophones locaux, mentorat artistique communautaire, célébration des accomplissements artistiques, galeries d'art francophone, inspiration par des artistes professionnels acadiens."
      }
    });

    console.log('✅ Unit 9 rewrite completed!');
    console.log(`New description: ${updatedUnit9.description?.substring(0, 100)}...\n`);
    console.log('🇫🇷 AUTHENTIC FRENCH PEDAGOGY FEATURES:');
    console.log('  ▸ "vrais artistes francophones" - identity formation');
    console.log('  ▸ "boîte à outils remplie de techniques magiques" - metaphor');
    console.log('  ▸ Emphasizes artistic identity in French');
    console.log('  ▸ May timing for culminating mastery');
    console.log('  ▸ Celebration of Francophone artistic accomplishment');

  } catch (error) {
    console.error('Error in Unit 9 French rewrite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unit9FrenchRewrite();