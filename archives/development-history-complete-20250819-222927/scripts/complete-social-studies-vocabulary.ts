import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeSocialStudiesVocabulary() {
  console.log('🌍 COMPLETING SOCIAL STUDIES VOCABULARY\n');
  console.log('========================================');
  console.log('🎯 Creating Grade 1 appropriate social studies vocabulary for 5 units');
  console.log('📝 15-25 words per unit, connected to social concepts');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query Social Studies LRP
  const socialLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Sciences humaines' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!socialLRP) {
    console.log('❌ Social Studies LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${socialLRP.title}`);
  console.log(`📊 Units: ${socialLRP.unitPlans.length}\n`);
  
  // Comprehensive social studies vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Moi et mon école
      vocabulary: [
        // Self identity
        {"word": "moi", "definition": "ma propre personne", "category": "identité", "grade_level": "1"},
        {"word": "nom", "definition": "ce qu'on m'appelle", "category": "identité", "grade_level": "1"},
        {"word": "âge", "definition": "nombre d'années que j'ai", "category": "identité", "grade_level": "1"},
        {"word": "unique", "definition": "différent de tous les autres", "category": "identité", "grade_level": "1"},
        {"word": "spécial", "definition": "important et particulier", "category": "identité", "grade_level": "1"},
        {"word": "important", "definition": "qui compte beaucoup", "category": "identité", "grade_level": "1"},
        
        // School vocabulary
        {"word": "école", "definition": "endroit où on apprend", "category": "école", "grade_level": "1"},
        {"word": "classe", "definition": "groupe d'élèves", "category": "école", "grade_level": "1"},
        {"word": "élève", "definition": "enfant qui apprend", "category": "école", "grade_level": "1"},
        {"word": "enseignant", "definition": "personne qui enseigne", "category": "école", "grade_level": "1"},
        {"word": "directeur", "definition": "chef de l'école", "category": "école", "grade_level": "1"},
        {"word": "bibliothèque", "definition": "endroit avec des livres", "category": "école", "grade_level": "1"},
        {"word": "gymnase", "definition": "salle pour le sport", "category": "école", "grade_level": "1"},
        {"word": "cafétéria", "definition": "endroit pour manger", "category": "école", "grade_level": "1"},
        
        // School community
        {"word": "communauté", "definition": "groupe de personnes ensemble", "category": "communauté", "grade_level": "1"},
        {"word": "appartenir", "definition": "faire partie de", "category": "communauté", "grade_level": "1"},
        {"word": "camarade", "definition": "ami de classe", "category": "relations", "grade_level": "1"},
        {"word": "ami", "definition": "personne qu'on aime bien", "category": "relations", "grade_level": "1"},
        {"word": "partager", "definition": "donner une partie", "category": "relations", "grade_level": "1"},
        {"word": "aider", "definition": "donner de l'assistance", "category": "relations", "grade_level": "1"},
        
        // Rules and routines
        {"word": "règle", "definition": "ce qu'on doit faire", "category": "règles", "grade_level": "1"},
        {"word": "routine", "definition": "choses qu'on fait régulièrement", "category": "organisation", "grade_level": "1"},
        {"word": "responsabilité", "definition": "devoir qu'on a", "category": "citoyenneté", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter avec considération", "category": "valeurs", "grade_level": "1"},
        
        // Learning
        {"word": "apprendre", "definition": "acquérir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "grandir", "definition": "devenir plus grand et mature", "category": "développement", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: Ma famille et mon foyer
      vocabulary: [
        // Family vocabulary
        {"word": "famille", "definition": "personnes qui vivent ensemble", "category": "famille", "grade_level": "1"},
        {"word": "parent", "definition": "maman ou papa", "category": "famille", "grade_level": "1"},
        {"word": "mère", "definition": "maman", "category": "famille", "grade_level": "1"},
        {"word": "père", "definition": "papa", "category": "famille", "grade_level": "1"},
        {"word": "frère", "definition": "garçon de la famille", "category": "famille", "grade_level": "1"},
        {"word": "sœur", "definition": "fille de la famille", "category": "famille", "grade_level": "1"},
        {"word": "grand-parent", "definition": "mère ou père du parent", "category": "famille", "grade_level": "1"},
        {"word": "enfant", "definition": "jeune personne", "category": "famille", "grade_level": "1"},
        
        // Home vocabulary
        {"word": "foyer", "definition": "endroit où vit la famille", "category": "foyer", "grade_level": "1"},
        {"word": "maison", "definition": "bâtiment où on habite", "category": "foyer", "grade_level": "1"},
        {"word": "appartement", "definition": "logement dans un immeuble", "category": "foyer", "grade_level": "1"},
        {"word": "chambre", "definition": "pièce pour dormir", "category": "foyer", "grade_level": "1"},
        {"word": "cuisine", "definition": "pièce pour cuisiner", "category": "foyer", "grade_level": "1"},
        {"word": "salon", "definition": "pièce pour se détendre", "category": "foyer", "grade_level": "1"},
        {"word": "adresse", "definition": "lieu où on habite", "category": "géographie", "grade_level": "1"},
        
        // Family roles and relationships
        {"word": "rôle", "definition": "ce qu'on fait dans la famille", "category": "rôles", "grade_level": "1"},
        {"word": "tâche", "definition": "travail à faire", "category": "responsabilités", "grade_level": "1"},
        {"word": "aider", "definition": "donner de l'assistance", "category": "relations", "grade_level": "1"},
        {"word": "prendre soin", "definition": "s'occuper de", "category": "relations", "grade_level": "1"},
        {"word": "aimer", "definition": "avoir de l'affection", "category": "émotions", "grade_level": "1"},
        {"word": "protection", "definition": "garder en sécurité", "category": "soins", "grade_level": "1"},
        
        // Family diversity
        {"word": "diversité", "definition": "différences entre les familles", "category": "diversité", "grade_level": "1"},
        {"word": "tradition", "definition": "habitude familiale", "category": "culture", "grade_level": "1"},
        {"word": "culture", "definition": "façon de vivre", "category": "culture", "grade_level": "1"},
        {"word": "célébration", "definition": "fête familiale", "category": "traditions", "grade_level": "1"},
        
        // Values
        {"word": "respect", "definition": "traiter avec considération", "category": "valeurs", "grade_level": "1"},
        {"word": "confiance", "definition": "croire en quelqu'un", "category": "valeurs", "grade_level": "1"},
        {"word": "sécurité", "definition": "être protégé", "category": "valeurs", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: Notre communauté automnale
      vocabulary: [
        // Community vocabulary
        {"word": "communauté", "definition": "groupe de personnes qui vivent ensemble", "category": "communauté", "grade_level": "1"},
        {"word": "voisin", "definition": "personne qui habite près", "category": "communauté", "grade_level": "1"},
        {"word": "quartier", "definition": "partie de la ville", "category": "géographie", "grade_level": "1"},
        {"word": "rue", "definition": "chemin dans la ville", "category": "géographie", "grade_level": "1"},
        {"word": "village", "definition": "petite communauté", "category": "géographie", "grade_level": "1"},
        {"word": "ville", "definition": "grande communauté", "category": "géographie", "grade_level": "1"},
        
        // Community helpers
        {"word": "policier", "definition": "personne qui protège", "category": "métiers", "grade_level": "1"},
        {"word": "pompier", "definition": "personne qui éteint les feux", "category": "métiers", "grade_level": "1"},
        {"word": "docteur", "definition": "personne qui soigne", "category": "métiers", "grade_level": "1"},
        {"word": "facteur", "definition": "personne qui livre le courrier", "category": "métiers", "grade_level": "1"},
        {"word": "chauffeur", "definition": "personne qui conduit", "category": "métiers", "grade_level": "1"},
        {"word": "vendeur", "definition": "personne qui vend", "category": "métiers", "grade_level": "1"},
        
        // Community places
        {"word": "magasin", "definition": "endroit pour acheter", "category": "lieux", "grade_level": "1"},
        {"word": "hôpital", "definition": "endroit pour soigner", "category": "lieux", "grade_level": "1"},
        {"word": "parc", "definition": "endroit pour jouer dehors", "category": "lieux", "grade_level": "1"},
        {"word": "bibliothèque", "definition": "endroit avec des livres", "category": "lieux", "grade_level": "1"},
        {"word": "poste", "definition": "endroit pour le courrier", "category": "lieux", "grade_level": "1"},
        
        // Autumn community activities
        {"word": "festival", "definition": "grande fête", "category": "événements", "grade_level": "1"},
        {"word": "marché", "definition": "endroit pour vendre fruits et légumes", "category": "événements", "grade_level": "1"},
        {"word": "récolte", "definition": "ramasser les fruits et légumes", "category": "activités", "grade_level": "1"},
        {"word": "célébrer", "definition": "fêter ensemble", "category": "activités", "grade_level": "1"},
        
        // Transportation
        {"word": "autobus", "definition": "véhicule pour transporter", "category": "transport", "grade_level": "1"},
        {"word": "voiture", "definition": "véhicule familial", "category": "transport", "grade_level": "1"},
        {"word": "marcher", "definition": "aller à pied", "category": "transport", "grade_level": "1"},
        
        // Community participation
        {"word": "participer", "definition": "prendre part", "category": "participation", "grade_level": "1"},
        {"word": "contribuer", "definition": "apporter quelque chose", "category": "participation", "grade_level": "1"},
        {"word": "bénévole", "definition": "personne qui aide sans paiement", "category": "participation", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Célébrations et traditions hivernales
      vocabulary: [
        // Winter celebrations
        {"word": "célébration", "definition": "fête joyeuse", "category": "célébrations", "grade_level": "1"},
        {"word": "tradition", "definition": "habitude qu'on garde", "category": "traditions", "grade_level": "1"},
        {"word": "fête", "definition": "moment de joie", "category": "célébrations", "grade_level": "1"},
        {"word": "festival", "definition": "grande célébration", "category": "célébrations", "grade_level": "1"},
        {"word": "cérémonie", "definition": "événement spécial", "category": "rituels", "grade_level": "1"},
        
        // Cultural diversity
        {"word": "culture", "definition": "façon de vivre d'un groupe", "category": "culture", "grade_level": "1"},
        {"word": "origine", "definition": "d'où vient une tradition", "category": "culture", "grade_level": "1"},
        {"word": "héritage", "definition": "ce qu'on reçoit de nos ancêtres", "category": "culture", "grade_level": "1"},
        {"word": "ancêtre", "definition": "personnes de notre famille avant nous", "category": "culture", "grade_level": "1"},
        {"word": "communauté", "definition": "groupe qui partage une culture", "category": "culture", "grade_level": "1"},
        
        // Winter holiday elements
        {"word": "lumière", "definition": "clarté dans l'obscurité", "category": "symboles", "grade_level": "1"},
        {"word": "cadeau", "definition": "objet qu'on offre", "category": "traditions", "grade_level": "1"},
        {"word": "partage", "definition": "donner aux autres", "category": "valeurs", "grade_level": "1"},
        {"word": "générosité", "definition": "qualité de donner", "category": "valeurs", "grade_level": "1"},
        {"word": "gratitude", "definition": "sentiment de reconnaissance", "category": "valeurs", "grade_level": "1"},
        {"word": "famille", "definition": "personnes proches", "category": "relations", "grade_level": "1"},
        
        // Food and traditions
        {"word": "nourriture", "definition": "aliments traditionnels", "category": "traditions", "grade_level": "1"},
        {"word": "recette", "definition": "façon de cuisiner", "category": "traditions", "grade_level": "1"},
        {"word": "repas", "definition": "moment de manger ensemble", "category": "traditions", "grade_level": "1"},
        {"word": "spécialité", "definition": "plat particulier", "category": "traditions", "grade_level": "1"},
        
        // Winter activities
        {"word": "chanson", "definition": "musique avec des mots", "category": "activités", "grade_level": "1"},
        {"word": "danse", "definition": "bouger au rythme", "category": "activités", "grade_level": "1"},
        {"word": "conte", "definition": "histoire traditionnelle", "category": "activités", "grade_level": "1"},
        {"word": "artisanat", "definition": "objets faits à la main", "category": "activités", "grade_level": "1"},
        
        // Values and meanings
        {"word": "signification", "definition": "ce que ça veut dire", "category": "compréhension", "grade_level": "1"},
        {"word": "symbole", "definition": "objet qui représente une idée", "category": "compréhension", "grade_level": "1"},
        {"word": "respect", "definition": "honorer les traditions", "category": "valeurs", "grade_level": "1"},
        {"word": "tolérance", "definition": "accepter les différences", "category": "valeurs", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Notre quartier et voisinage
      vocabulary: [
        // Neighborhood vocabulary
        {"word": "quartier", "definition": "partie de la ville où on habite", "category": "géographie", "grade_level": "1"},
        {"word": "voisinage", "definition": "area près de chez nous", "category": "géographie", "grade_level": "1"},
        {"word": "voisin", "definition": "personne qui habite près", "category": "communauté", "grade_level": "1"},
        {"word": "rue", "definition": "chemin avec des maisons", "category": "géographie", "grade_level": "1"},
        {"word": "avenue", "definition": "grande rue", "category": "géographie", "grade_level": "1"},
        {"word": "coin", "definition": "endroit où se croisent deux rues", "category": "géographie", "grade_level": "1"},
        
        // Mapping concepts
        {"word": "carte", "definition": "dessin qui montre les lieux", "category": "cartes", "grade_level": "1"},
        {"word": "plan", "definition": "carte simple", "category": "cartes", "grade_level": "1"},
        {"word": "direction", "definition": "côté où aller", "category": "orientation", "grade_level": "1"},
        {"word": "nord", "definition": "direction vers le haut", "category": "orientation", "grade_level": "1"},
        {"word": "sud", "definition": "direction vers le bas", "category": "orientation", "grade_level": "1"},
        {"word": "est", "definition": "direction vers la droite", "category": "orientation", "grade_level": "1"},
        {"word": "ouest", "definition": "direction vers la gauche", "category": "orientation", "grade_level": "1"},
        
        // Location vocabulary
        {"word": "près", "definition": "pas loin", "category": "position", "grade_level": "1"},
        {"word": "loin", "definition": "à grande distance", "category": "position", "grade_level": "1"},
        {"word": "à côté", "definition": "juste près", "category": "position", "grade_level": "1"},
        {"word": "en face", "definition": "de l'autre côté", "category": "position", "grade_level": "1"},
        {"word": "entre", "definition": "au milieu de deux", "category": "position", "grade_level": "1"},
        {"word": "derrière", "definition": "à l'arrière", "category": "position", "grade_level": "1"},
        {"word": "devant", "definition": "à l'avant", "category": "position", "grade_level": "1"},
        
        // Neighborhood features
        {"word": "parc", "definition": "espace vert pour jouer", "category": "lieux", "grade_level": "1"},
        {"word": "école", "definition": "endroit pour apprendre", "category": "lieux", "grade_level": "1"},
        {"word": "magasin", "definition": "endroit pour acheter", "category": "lieux", "grade_level": "1"},
        {"word": "centre", "definition": "milieu du quartier", "category": "lieux", "grade_level": "1"},
        
        // Transportation
        {"word": "chemin", "definition": "route pour aller quelque part", "category": "transport", "grade_level": "1"},
        {"word": "sentier", "definition": "petit chemin", "category": "transport", "grade_level": "1"},
        {"word": "pont", "definition": "construction pour traverser", "category": "transport", "grade_level": "1"},
        
        // Community helpers and services
        {"word": "service", "definition": "aide qu'on donne", "category": "services", "grade_level": "1"},
        {"word": "sécurité", "definition": "protection du quartier", "category": "services", "grade_level": "1"},
        {"word": "propreté", "definition": "garder le quartier propre", "category": "services", "grade_level": "1"},
        
        // Citizenship
        {"word": "citoyen", "definition": "personne qui vit dans la communauté", "category": "citoyenneté", "grade_level": "1"},
        {"word": "responsabilité", "definition": "devoir envers le quartier", "category": "citoyenneté", "grade_level": "1"}
      ]
    }
  ];
  
  console.log('📝 ADDING VOCABULARY TO EACH SOCIAL STUDIES UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < socialLRP.unitPlans.length; i++) {
    const unit = socialLRP.unitPlans[i];
    const vocabulary = unitVocabularies[i]?.vocabulary || [];
    
    if (vocabulary.length === 0) {
      console.log(`⚠️ No vocabulary defined for Unit ${i+1}`);
      continue;
    }
    
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        keyVocabulary: vocabulary
      }
    });
    
    console.log(`✅ Unit ${i+1}: ${unit.title}`);
    console.log(`   📝 Added ${vocabulary.length} vocabulary words`);
    console.log(`   📊 Categories: ${[...new Set(vocabulary.map(v => v.category))].join(', ')}`);
    console.log(`   📖 Sample: ${vocabulary.slice(0,3).map(v => v.word).join(', ')}\n`);
  }
  
  // Verify completion
  console.log('🔍 VERIFICATION:\n');
  
  const updatedUnits = await prisma.unitPlan.findMany({
    where: { longRangePlanId: socialLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  let totalWords = 0;
  let allCategories = new Set();
  
  updatedUnits.forEach((unit, i) => {
    const vocab = unit.keyVocabulary as any[];
    if (vocab && vocab.length > 0) {
      totalWords += vocab.length;
      vocab.forEach(item => allCategories.add(item.category));
      console.log(`✅ Unit ${i+1}: ${vocab.length} words`);
    } else {
      console.log(`❌ Unit ${i+1}: No vocabulary`);
    }
  });
  
  console.log('\n📊 FINAL SOCIAL STUDIES VOCABULARY STATISTICS:');
  console.log('═══════════════════════════════════════════════');
  console.log(`📚 Total Social Studies Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 100) {
    console.log('\n🎉 SUCCESS! Social Studies vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate social studies vocabulary');
    console.log('✅ Connected to community, family, and citizenship concepts');
    console.log('✅ Supports French immersion social studies instruction');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeSocialStudiesVocabulary().catch(console.error);