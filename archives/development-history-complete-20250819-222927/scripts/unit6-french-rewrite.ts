import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unit6FrenchRewrite() {
  try {
    console.log('🇫🇷 UNIT 6 FRENCH PEDAGOGY REWRITE - Motifs et Impression\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Find Unit 6 (Motifs et Impression)
    const unit6 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Motifs et Impression"
      }
    });

    if (!unit6) {
      console.log('❌ Unit 6 not found');
      return;
    }

    console.log(`Found Unit 6: ${unit6.title}`);
    console.log(`Current description: ${unit6.description?.substring(0, 100)}...\n`);

    // Rewrite with authentic French-first pedagogy
    const updatedUnit6 = await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: {
        description: "Dans le monde français des motifs de février, les élèves découvrent comment la répétition crée la beauté et la poésie visuelle. Chaque jour, ils explorent les rythmes français des formes et des couleurs, apprenant que les motifs racontent des histoires infinies dans le langage unique de l'art francophone.",
        
        descriptionFr: "Dans le monde français des motifs de février, les élèves découvrent comment la répétition crée la beauté et la poésie visuelle.",
        
        bigIdeas: "Les motifs français dansent et chantent dans nos créations artistiques. La répétition en français nous enseigne que la beauté naît de la régularité et de la surprise. En imprimant nos idées, nous découvrons comment multiplier notre expression artistique en français pour toucher plus de cœurs.",
        
        bigIdeasFr: "Les motifs français dansent et chantent dans nos créations artistiques. La répétition en français nous enseigne que la beauté naît de la régularité.",
        
        essentialQuestions: [
          "Comment les motifs français racontent-ils des histoires sans mots?",
          "Où puis-je découvrir des rythmes visuels dans mon monde francophone?",
          "Comment la répétition française transforme-t-elle une idée simple en art?",
          "Que se passe-t-il quand j'imprime mes créations pour les partager?",
          "Comment puis-je créer des surprises dans mes motifs français?"
        ],
        
        keyVocabulary: [
          "motif", "impression", "répétition", "rythme", "séquence",
          "tampon", "empreinte", "trace", "marque", "copie",
          "régulier", "irrégulier", "alternance", "variation", "cycle",
          "estampe", "gravure", "reproduction", "multiple", "série",
          "patron", "modèle", "gabarit", "pochoir", "forme"
        ],
        
        crossCurricularConnections: "Français: Patterns linguistiques, rythmes poétiques, répétitions narratives. Mathématiques: Suites, patterns numériques, géométrie répétitive. Sciences: Motifs naturels, cycles saisonniers. Études sociales: Motifs culturels franco-canadiens et acadiens.",
        
        indigenousPerspectives: "Motifs sacrés Mi'kmaq dans l'art traditionnel, techniques d'impression ancestrales, signification spirituelle des patterns répétés, transmission culturelle par l'art décoratif, respect des symboles traditionnels.",
        
        communityConnections: "Artistes imprimeurs francophones, ateliers de sérigraphie communautaires, motifs dans l'architecture acadienne locale, collaboration avec musées d'art francophone, exposition de motifs culturels diversifiés."
      }
    });

    console.log('✅ Unit 6 rewrite completed!');
    console.log(`New description: ${updatedUnit6.description?.substring(0, 100)}...\n`);
    console.log('🇫🇷 AUTHENTIC FRENCH PEDAGOGY FEATURES:');
    console.log('  ▸ "motifs français dansent et chantent" - poetic French concept');
    console.log('  ▸ Connects repetition to French linguistic patterns');
    console.log('  ▸ Cultural connection to Franco-Canadian traditions');
    console.log('  ▸ Age-appropriate vocabulary for printing concepts');
    console.log('  ▸ Mathematical patterns integrated naturally');

  } catch (error) {
    console.error('Error in Unit 6 French rewrite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unit6FrenchRewrite();