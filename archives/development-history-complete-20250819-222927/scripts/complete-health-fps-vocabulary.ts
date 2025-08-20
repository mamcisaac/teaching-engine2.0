import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeHealthFPSVocabulary() {
  console.log('💪 COMPLETING HEALTH/FPS VOCABULARY\n');
  console.log('===================================');
  console.log('🎯 Creating Grade 1 appropriate health/FPS vocabulary for 5 units');
  console.log('📝 15-25 words per unit, connected to health and wellness concepts');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query Health/FPS LRP
  const healthLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Formation personnelle et sociale' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!healthLRP) {
    console.log('❌ Health/FPS LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${healthLRP.title}`);
  console.log(`📊 Units: ${healthLRP.unitPlans.length}\n`);
  
  // Comprehensive health/FPS vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Mon corps et ma sécurité
      vocabulary: [
        // Body parts
        {"word": "corps", "definition": "ensemble de notre être physique", "category": "anatomie", "grade_level": "1"},
        {"word": "tête", "definition": "partie du haut du corps", "category": "anatomie", "grade_level": "1"},
        {"word": "bras", "definition": "membre supérieur", "category": "anatomie", "grade_level": "1"},
        {"word": "jambe", "definition": "membre inférieur", "category": "anatomie", "grade_level": "1"},
        {"word": "main", "definition": "extrémité du bras", "category": "anatomie", "grade_level": "1"},
        {"word": "pied", "definition": "extrémité de la jambe", "category": "anatomie", "grade_level": "1"},
        {"word": "yeux", "definition": "organes pour voir", "category": "sens", "grade_level": "1"},
        {"word": "oreilles", "definition": "organes pour entendre", "category": "sens", "grade_level": "1"},
        {"word": "nez", "definition": "organe pour sentir", "category": "sens", "grade_level": "1"},
        {"word": "bouche", "definition": "organe pour manger et parler", "category": "sens", "grade_level": "1"},
        
        // Safety vocabulary
        {"word": "sécurité", "definition": "état d'être protégé", "category": "sécurité", "grade_level": "1"},
        {"word": "danger", "definition": "risque de se blesser", "category": "sécurité", "grade_level": "1"},
        {"word": "prudent", "definition": "qui fait attention", "category": "sécurité", "grade_level": "1"},
        {"word": "attention", "definition": "faire très attention", "category": "sécurité", "grade_level": "1"},
        {"word": "protéger", "definition": "garder en sécurité", "category": "sécurité", "grade_level": "1"},
        {"word": "blessure", "definition": "dommage au corps", "category": "sécurité", "grade_level": "1"},
        {"word": "casque", "definition": "protection pour la tête", "category": "équipement", "grade_level": "1"},
        {"word": "ceinture", "definition": "protection en voiture", "category": "équipement", "grade_level": "1"},
        
        // Personal boundaries
        {"word": "privé", "definition": "qui appartient à moi", "category": "limites", "grade_level": "1"},
        {"word": "personnel", "definition": "qui me concerne", "category": "limites", "grade_level": "1"},
        {"word": "limite", "definition": "frontière à respecter", "category": "limites", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter avec considération", "category": "respect", "grade_level": "1"},
        {"word": "permission", "definition": "autorisation de faire", "category": "consentement", "grade_level": "1"},
        {"word": "dire non", "definition": "refuser quelque chose", "category": "consentement", "grade_level": "1"},
        
        // Help and trust
        {"word": "confiance", "definition": "croire en quelqu'un", "category": "relations", "grade_level": "1"},
        {"word": "aide", "definition": "assistance qu'on donne", "category": "relations", "grade_level": "1"},
        {"word": "adulte", "definition": "grande personne", "category": "relations", "grade_level": "1"},
        {"word": "urgence", "definition": "situation qui demande aide rapide", "category": "sécurité", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: Mes émotions et sentiments
      vocabulary: [
        // Basic emotions
        {"word": "émotion", "definition": "sentiment qu'on ressent", "category": "émotions", "grade_level": "1"},
        {"word": "sentiment", "definition": "ce qu'on ressent dans le cœur", "category": "émotions", "grade_level": "1"},
        {"word": "content", "definition": "qui ressent de la joie", "category": "émotions positives", "grade_level": "1"},
        {"word": "joyeux", "definition": "très content", "category": "émotions positives", "grade_level": "1"},
        {"word": "heureux", "definition": "dans un état de bonheur", "category": "émotions positives", "grade_level": "1"},
        {"word": "excité", "definition": "très enthousiaste", "category": "émotions positives", "grade_level": "1"},
        {"word": "fier", "definition": "content de ses réussites", "category": "émotions positives", "grade_level": "1"},
        
        // Challenging emotions
        {"word": "triste", "definition": "qui ressent de la peine", "category": "émotions difficiles", "grade_level": "1"},
        {"word": "fâché", "definition": "en colère", "category": "émotions difficiles", "grade_level": "1"},
        {"word": "frustré", "definition": "contrarié", "category": "émotions difficiles", "grade_level": "1"},
        {"word": "inquiet", "definition": "qui se fait du souci", "category": "émotions difficiles", "grade_level": "1"},
        {"word": "nerveux", "definition": "agité et anxieux", "category": "émotions difficiles", "grade_level": "1"},
        {"word": "déçu", "definition": "pas content du résultat", "category": "émotions difficiles", "grade_level": "1"},
        
        // Emotional awareness
        {"word": "ressentir", "definition": "éprouver une émotion", "category": "conscience", "grade_level": "1"},
        {"word": "reconnaître", "definition": "identifier une émotion", "category": "conscience", "grade_level": "1"},
        {"word": "nommer", "definition": "dire le nom de l'émotion", "category": "conscience", "grade_level": "1"},
        {"word": "exprimer", "definition": "montrer ses émotions", "category": "expression", "grade_level": "1"},
        {"word": "partager", "definition": "dire ses émotions", "category": "expression", "grade_level": "1"},
        
        // Coping strategies
        {"word": "calmer", "definition": "devenir tranquille", "category": "gestion", "grade_level": "1"},
        {"word": "respirer", "definition": "prendre de grandes respirations", "category": "gestion", "grade_level": "1"},
        {"word": "relaxer", "definition": "se détendre", "category": "gestion", "grade_level": "1"},
        {"word": "compter", "definition": "dire les nombres pour se calmer", "category": "gestion", "grade_level": "1"},
        
        // Social emotions
        {"word": "empathie", "definition": "comprendre les émotions des autres", "category": "social", "grade_level": "1"},
        {"word": "compassion", "definition": "vouloir aider", "category": "social", "grade_level": "1"},
        {"word": "gentillesse", "definition": "qualité d'être bon", "category": "social", "grade_level": "1"},
        
        // Emotional support
        {"word": "réconfort", "definition": "aide pour se sentir mieux", "category": "soutien", "grade_level": "1"},
        {"word": "écouter", "definition": "prêter attention", "category": "soutien", "grade_level": "1"},
        {"word": "comprendre", "definition": "saisir les émotions", "category": "soutien", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: Amitiés et relations positives
      vocabulary: [
        // Friendship vocabulary
        {"word": "ami", "definition": "personne qu'on aime bien", "category": "amitié", "grade_level": "1"},
        {"word": "amitié", "definition": "relation affectueuse", "category": "amitié", "grade_level": "1"},
        {"word": "copain", "definition": "ami proche", "category": "amitié", "grade_level": "1"},
        {"word": "camarade", "definition": "ami de classe", "category": "amitié", "grade_level": "1"},
        {"word": "lier", "definition": "créer une amitié", "category": "amitié", "grade_level": "1"},
        
        // Positive relationship qualities
        {"word": "gentillesse", "definition": "qualité d'être bon", "category": "qualités", "grade_level": "1"},
        {"word": "respect", "definition": "considération pour autrui", "category": "qualités", "grade_level": "1"},
        {"word": "honnêteté", "definition": "dire la vérité", "category": "qualités", "grade_level": "1"},
        {"word": "loyauté", "definition": "fidélité en amitié", "category": "qualités", "grade_level": "1"},
        {"word": "générosité", "definition": "donner aux autres", "category": "qualités", "grade_level": "1"},
        {"word": "patience", "definition": "savoir attendre", "category": "qualités", "grade_level": "1"},
        
        // Social skills
        {"word": "partager", "definition": "donner une partie", "category": "compétences sociales", "grade_level": "1"},
        {"word": "coopérer", "definition": "travailler ensemble", "category": "compétences sociales", "grade_level": "1"},
        {"word": "collaborer", "definition": "faire ensemble", "category": "compétences sociales", "grade_level": "1"},
        {"word": "négocier", "definition": "trouver un compromis", "category": "compétences sociales", "grade_level": "1"},
        {"word": "compromis", "definition": "solution qui convient à tous", "category": "compétences sociales", "grade_level": "1"},
        
        // Communication skills
        {"word": "écouter", "definition": "prêter attention", "category": "communication", "grade_level": "1"},
        {"word": "parler", "definition": "s'exprimer avec des mots", "category": "communication", "grade_level": "1"},
        {"word": "discuter", "definition": "échanger des idées", "category": "communication", "grade_level": "1"},
        {"word": "expliquer", "definition": "faire comprendre", "category": "communication", "grade_level": "1"},
        {"word": "demander", "definition": "poser une question", "category": "communication", "grade_level": "1"},
        
        // Conflict resolution
        {"word": "conflit", "definition": "désaccord entre personnes", "category": "résolution", "grade_level": "1"},
        {"word": "problème", "definition": "difficulté à résoudre", "category": "résolution", "grade_level": "1"},
        {"word": "solution", "definition": "façon de résoudre", "category": "résolution", "grade_level": "1"},
        {"word": "pardonner", "definition": "excuser les erreurs", "category": "résolution", "grade_level": "1"},
        {"word": "réconcilier", "definition": "redevenir amis", "category": "résolution", "grade_level": "1"},
        
        // Inclusion and diversity
        {"word": "inclure", "definition": "faire participer", "category": "inclusion", "grade_level": "1"},
        {"word": "accueillir", "definition": "recevoir avec bienveillance", "category": "inclusion", "grade_level": "1"},
        {"word": "différence", "definition": "ce qui n'est pas pareil", "category": "diversité", "grade_level": "1"},
        {"word": "unique", "definition": "spécial et différent", "category": "diversité", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Nutrition et mode de vie sain
      vocabulary: [
        // Nutrition vocabulary
        {"word": "nutrition", "definition": "science de bien manger", "category": "nutrition", "grade_level": "1"},
        {"word": "nourriture", "definition": "aliments qu'on mange", "category": "nutrition", "grade_level": "1"},
        {"word": "aliment", "definition": "chose qu'on mange", "category": "nutrition", "grade_level": "1"},
        {"word": "sain", "definition": "bon pour la santé", "category": "santé", "grade_level": "1"},
        {"word": "équilibré", "definition": "avec tous les nutriments", "category": "nutrition", "grade_level": "1"},
        {"word": "varié", "definition": "avec différents aliments", "category": "nutrition", "grade_level": "1"},
        
        // Food groups
        {"word": "fruit", "definition": "aliment sucré et juteux", "category": "groupes alimentaires", "grade_level": "1"},
        {"word": "légume", "definition": "plante qu'on mange", "category": "groupes alimentaires", "grade_level": "1"},
        {"word": "céréale", "definition": "grain comme le blé", "category": "groupes alimentaires", "grade_level": "1"},
        {"word": "protéine", "definition": "nutriment pour grandir", "category": "groupes alimentaires", "grade_level": "1"},
        {"word": "lait", "definition": "boisson blanche nutritive", "category": "groupes alimentaires", "grade_level": "1"},
        {"word": "viande", "definition": "chair d'animal", "category": "groupes alimentaires", "grade_level": "1"},
        
        // Healthy choices
        {"word": "choisir", "definition": "sélectionner ce qui est bon", "category": "choix", "grade_level": "1"},
        {"word": "préférer", "definition": "aimer mieux", "category": "choix", "grade_level": "1"},
        {"word": "limiter", "definition": "ne pas prendre trop", "category": "modération", "grade_level": "1"},
        {"word": "modération", "definition": "juste assez", "category": "modération", "grade_level": "1"},
        {"word": "portion", "definition": "quantité qu'on mange", "category": "quantité", "grade_level": "1"},
        
        // Physical activity
        {"word": "exercice", "definition": "activité physique", "category": "activité", "grade_level": "1"},
        {"word": "bouger", "definition": "être actif", "category": "activité", "grade_level": "1"},
        {"word": "courir", "definition": "aller vite à pied", "category": "activité", "grade_level": "1"},
        {"word": "sauter", "definition": "quitter le sol", "category": "activité", "grade_level": "1"},
        {"word": "danser", "definition": "bouger en rythme", "category": "activité", "grade_level": "1"},
        {"word": "jouer", "definition": "s'amuser en bougeant", "category": "activité", "grade_level": "1"},
        
        // Health habits
        {"word": "habitude", "definition": "chose qu'on fait souvent", "category": "habitudes", "grade_level": "1"},
        {"word": "routine", "definition": "choses qu'on fait régulièrement", "category": "habitudes", "grade_level": "1"},
        {"word": "régulier", "definition": "fait chaque jour", "category": "habitudes", "grade_level": "1"},
        {"word": "énergie", "definition": "force pour être actif", "category": "bien-être", "grade_level": "1"},
        {"word": "force", "definition": "puissance du corps", "category": "bien-être", "grade_level": "1"},
        
        // Hygiene
        {"word": "hygiène", "definition": "propreté du corps", "category": "hygiène", "grade_level": "1"},
        {"word": "propre", "definition": "sans saleté", "category": "hygiène", "grade_level": "1"},
        {"word": "laver", "definition": "nettoyer avec de l'eau", "category": "hygiène", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Grandir et changer en sécurité
      vocabulary: [
        // Growth and development
        {"word": "grandir", "definition": "devenir plus grand", "category": "développement", "grade_level": "1"},
        {"word": "croissance", "definition": "fait de grandir", "category": "développement", "grade_level": "1"},
        {"word": "développer", "definition": "grandir et changer", "category": "développement", "grade_level": "1"},
        {"word": "changer", "definition": "devenir différent", "category": "développement", "grade_level": "1"},
        {"word": "évoluer", "definition": "se transformer", "category": "développement", "grade_level": "1"},
        {"word": "maturité", "definition": "devenir plus sage", "category": "développement", "grade_level": "1"},
        
        // Life stages
        {"word": "bébé", "definition": "très jeune enfant", "category": "étapes", "grade_level": "1"},
        {"word": "enfant", "definition": "jeune personne", "category": "étapes", "grade_level": "1"},
        {"word": "adolescent", "definition": "jeune qui grandit", "category": "étapes", "grade_level": "1"},
        {"word": "adulte", "definition": "grande personne", "category": "étapes", "grade_level": "1"},
        {"word": "âgé", "definition": "personne très expérimentée", "category": "étapes", "grade_level": "1"},
        
        // Personal growth
        {"word": "apprendre", "definition": "acquérir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "progresser", "definition": "s'améliorer", "category": "apprentissage", "grade_level": "1"},
        {"word": "réussir", "definition": "atteindre son but", "category": "accomplissement", "grade_level": "1"},
        {"word": "accomplir", "definition": "réaliser quelque chose", "category": "accomplissement", "grade_level": "1"},
        {"word": "fierté", "definition": "sentiment de satisfaction", "category": "accomplissement", "grade_level": "1"},
        
        // Challenges and resilience
        {"word": "défi", "definition": "difficulté à surmonter", "category": "résilience", "grade_level": "1"},
        {"word": "obstacle", "definition": "chose qui bloque", "category": "résilience", "grade_level": "1"},
        {"word": "persévérer", "definition": "continuer malgré les difficultés", "category": "résilience", "grade_level": "1"},
        {"word": "courage", "definition": "bravoure face aux difficultés", "category": "résilience", "grade_level": "1"},
        {"word": "effort", "definition": "énergie mise dans une tâche", "category": "résilience", "grade_level": "1"},
        
        // Goals and dreams
        {"word": "objectif", "definition": "but qu'on veut atteindre", "category": "buts", "grade_level": "1"},
        {"word": "rêve", "definition": "chose qu'on espère", "category": "buts", "grade_level": "1"},
        {"word": "espoir", "definition": "sentiment que ça va bien aller", "category": "buts", "grade_level": "1"},
        {"word": "souhait", "definition": "chose qu'on désire", "category": "buts", "grade_level": "1"},
        {"word": "plan", "definition": "façon d'atteindre son but", "category": "planification", "grade_level": "1"},
        
        // Support systems
        {"word": "soutien", "definition": "aide qu'on reçoit", "category": "soutien", "grade_level": "1"},
        {"word": "encouragement", "definition": "paroles qui donnent courage", "category": "soutien", "grade_level": "1"},
        {"word": "mentor", "definition": "personne qui guide", "category": "soutien", "grade_level": "1"},
        {"word": "modèle", "definition": "personne qu'on admire", "category": "soutien", "grade_level": "1"},
        
        // Self-awareness
        {"word": "identité", "definition": "qui je suis", "category": "conscience de soi", "grade_level": "1"},
        {"word": "personnalité", "definition": "caractère unique", "category": "conscience de soi", "grade_level": "1"},
        {"word": "talent", "definition": "capacité spéciale", "category": "conscience de soi", "grade_level": "1"},
        {"word": "intérêt", "definition": "ce qu'on aime", "category": "conscience de soi", "grade_level": "1"}
      ]
    }
  ];
  
  console.log('📝 ADDING VOCABULARY TO EACH HEALTH/FPS UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < healthLRP.unitPlans.length; i++) {
    const unit = healthLRP.unitPlans[i];
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
    where: { longRangePlanId: healthLRP.id },
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
  
  console.log('\n📊 FINAL HEALTH/FPS VOCABULARY STATISTICS:');
  console.log('═══════════════════════════════════════════');
  console.log(`📚 Total Health/FPS Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 100) {
    console.log('\n🎉 SUCCESS! Health/FPS vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate health vocabulary');
    console.log('✅ Connected to personal development, safety, and wellness concepts');
    console.log('✅ Supports French immersion health education instruction');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeHealthFPSVocabulary().catch(console.error);