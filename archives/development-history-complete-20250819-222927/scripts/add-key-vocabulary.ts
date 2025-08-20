import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addKeyVocabulary() {
  console.log('📚 ADDING KEY VOCABULARY TO FRENCH LANGUAGE ARTS UNITS\n');
  console.log('========================================================');
  
  // Query French LRP
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { id: 'cmebyc98h0001vjr1cvh4knsh' }
  });
  
  if (!frenchLRP) {
    console.log('❌ French LRP not found');
    return;
  }
  
  // Get all units
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  console.log(`📊 Found ${units.length} units\n`);
  
  // Check current vocabulary status
  let missingVocab = 0;
  units.forEach((unit, i) => {
    if (!unit.keyVocabulary || (Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length === 0)) {
      missingVocab++;
      console.log(`❌ Unit ${i+1}: ${unit.title} - Missing vocabulary`);
    } else {
      console.log(`✅ Unit ${i+1}: ${unit.title} - Has vocabulary`);
    }
  });
  
  console.log(`\n📋 Status: ${missingVocab} units missing vocabulary\n`);
  
  // Define comprehensive vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Bienvenue en français
      vocabulary: [
        // Classroom essentials
        {"word": "bonjour", "definition": "hello/good morning", "category": "salutations"},
        {"word": "au revoir", "definition": "goodbye", "category": "salutations"},
        {"word": "merci", "definition": "thank you", "category": "politesse"},
        {"word": "s'il vous plaît", "definition": "please", "category": "politesse"},
        {"word": "classe", "definition": "classroom", "category": "école"},
        {"word": "élève", "definition": "student", "category": "école"},
        {"word": "professeur", "definition": "teacher", "category": "école"},
        {"word": "ami(e)", "definition": "friend", "category": "relations"},
        
        // School materials
        {"word": "crayon", "definition": "pencil", "category": "matériel"},
        {"word": "livre", "definition": "book", "category": "matériel"},
        {"word": "cahier", "definition": "notebook", "category": "matériel"},
        {"word": "gomme", "definition": "eraser", "category": "matériel"},
        
        // Basic phonics focus
        {"word": "a", "definition": "letter a sound", "category": "phonétique"},
        {"word": "e", "definition": "letter e sound", "category": "phonétique"},
        {"word": "i", "definition": "letter i sound", "category": "phonétique"},
        {"word": "o", "definition": "letter o sound", "category": "phonétique"},
        {"word": "u", "definition": "letter u sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "je", "definition": "I", "category": "mots fréquents"},
        {"word": "tu", "definition": "you", "category": "mots fréquents"},
        {"word": "le/la", "definition": "the", "category": "mots fréquents"},
        {"word": "un/une", "definition": "a/an", "category": "mots fréquents"},
        {"word": "est", "definition": "is", "category": "mots fréquents"},
        
        // Academic language
        {"word": "écouter", "definition": "to listen", "category": "verbes académiques"},
        {"word": "parler", "definition": "to speak", "category": "verbes académiques"},
        {"word": "regarder", "definition": "to look", "category": "verbes académiques"},
        {"word": "répéter", "definition": "to repeat", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 2: Histoires d'automne
      vocabulary: [
        // Season vocabulary
        {"word": "automne", "definition": "autumn/fall", "category": "saison"},
        {"word": "feuille", "definition": "leaf", "category": "nature"},
        {"word": "arbre", "definition": "tree", "category": "nature"},
        {"word": "orange", "definition": "orange (color)", "category": "couleurs"},
        {"word": "rouge", "definition": "red", "category": "couleurs"},
        {"word": "jaune", "definition": "yellow", "category": "couleurs"},
        {"word": "brun", "definition": "brown", "category": "couleurs"},
        
        // Story elements
        {"word": "histoire", "definition": "story", "category": "littérature"},
        {"word": "personnage", "definition": "character", "category": "littérature"},
        {"word": "début", "definition": "beginning", "category": "littérature"},
        {"word": "milieu", "definition": "middle", "category": "littérature"},
        {"word": "fin", "definition": "end", "category": "littérature"},
        
        // Phonics focus - consonants
        {"word": "m", "definition": "letter m sound", "category": "phonétique"},
        {"word": "n", "definition": "letter n sound", "category": "phonétique"},
        {"word": "l", "definition": "letter l sound", "category": "phonétique"},
        {"word": "r", "definition": "letter r sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "il/elle", "definition": "he/she", "category": "mots fréquents"},
        {"word": "dans", "definition": "in", "category": "mots fréquents"},
        {"word": "avec", "definition": "with", "category": "mots fréquents"},
        {"word": "sur", "definition": "on", "category": "mots fréquents"},
        {"word": "sous", "definition": "under", "category": "mots fréquents"},
        
        // Academic language
        {"word": "lire", "definition": "to read", "category": "verbes académiques"},
        {"word": "comprendre", "definition": "to understand", "category": "verbes académiques"},
        {"word": "raconter", "definition": "to tell/narrate", "category": "verbes académiques"},
        {"word": "imaginer", "definition": "to imagine", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 3: Ma famille française
      vocabulary: [
        // Family members
        {"word": "maman", "definition": "mom", "category": "famille"},
        {"word": "papa", "definition": "dad", "category": "famille"},
        {"word": "frère", "definition": "brother", "category": "famille"},
        {"word": "sœur", "definition": "sister", "category": "famille"},
        {"word": "grand-mère", "definition": "grandmother", "category": "famille"},
        {"word": "grand-père", "definition": "grandfather", "category": "famille"},
        {"word": "famille", "definition": "family", "category": "famille"},
        
        // Descriptive words
        {"word": "grand(e)", "definition": "big/tall", "category": "adjectifs"},
        {"word": "petit(e)", "definition": "small/little", "category": "adjectifs"},
        {"word": "gentil(le)", "definition": "kind/nice", "category": "adjectifs"},
        {"word": "drôle", "definition": "funny", "category": "adjectifs"},
        
        // Phonics focus - digraphs
        {"word": "ch", "definition": "ch sound", "category": "phonétique"},
        {"word": "ou", "definition": "ou sound", "category": "phonétique"},
        {"word": "on", "definition": "on nasal sound", "category": "phonétique"},
        {"word": "an/en", "definition": "an/en nasal sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "mon/ma", "definition": "my", "category": "mots fréquents"},
        {"word": "ton/ta", "definition": "your", "category": "mots fréquents"},
        {"word": "son/sa", "definition": "his/her", "category": "mots fréquents"},
        {"word": "nous", "definition": "we", "category": "mots fréquents"},
        {"word": "vous", "definition": "you (formal/plural)", "category": "mots fréquents"},
        
        // Academic language
        {"word": "décrire", "definition": "to describe", "category": "verbes académiques"},
        {"word": "présenter", "definition": "to present", "category": "verbes académiques"},
        {"word": "aimer", "definition": "to like/love", "category": "verbes académiques"},
        {"word": "habiter", "definition": "to live", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 4: Célébrations d'hiver
      vocabulary: [
        // Winter celebrations
        {"word": "hiver", "definition": "winter", "category": "saison"},
        {"word": "neige", "definition": "snow", "category": "météo"},
        {"word": "fête", "definition": "celebration/party", "category": "célébrations"},
        {"word": "cadeau", "definition": "gift", "category": "célébrations"},
        {"word": "lumière", "definition": "light", "category": "célébrations"},
        {"word": "chanson", "definition": "song", "category": "célébrations"},
        
        // Cultural vocabulary
        {"word": "tradition", "definition": "tradition", "category": "culture"},
        {"word": "célébrer", "definition": "to celebrate", "category": "culture"},
        {"word": "partager", "definition": "to share", "category": "culture"},
        {"word": "remercier", "definition": "to thank", "category": "culture"},
        
        // Phonics focus - soft sounds
        {"word": "oi", "definition": "oi sound (wa)", "category": "phonétique"},
        {"word": "eau", "definition": "eau sound (o)", "category": "phonétique"},
        {"word": "eu", "definition": "eu sound", "category": "phonétique"},
        {"word": "in", "definition": "in nasal sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "pour", "definition": "for", "category": "mots fréquents"},
        {"word": "mais", "definition": "but", "category": "mots fréquents"},
        {"word": "et", "definition": "and", "category": "mots fréquents"},
        {"word": "ou", "definition": "or", "category": "mots fréquents"},
        {"word": "parce que", "definition": "because", "category": "mots fréquents"},
        
        // Academic language
        {"word": "expliquer", "definition": "to explain", "category": "verbes académiques"},
        {"word": "comparer", "definition": "to compare", "category": "verbes académiques"},
        {"word": "découvrir", "definition": "to discover", "category": "verbes académiques"},
        {"word": "apprendre", "definition": "to learn", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 5: Poésie et rythmes
      vocabulary: [
        // Poetry vocabulary
        {"word": "poème", "definition": "poem", "category": "poésie"},
        {"word": "rime", "definition": "rhyme", "category": "poésie"},
        {"word": "rythme", "definition": "rhythm", "category": "poésie"},
        {"word": "vers", "definition": "verse/line", "category": "poésie"},
        {"word": "comptine", "definition": "nursery rhyme", "category": "poésie"},
        
        // Sound and music
        {"word": "son", "definition": "sound", "category": "musique"},
        {"word": "musique", "definition": "music", "category": "musique"},
        {"word": "chanter", "definition": "to sing", "category": "musique"},
        {"word": "danser", "definition": "to dance", "category": "musique"},
        
        // Phonics focus - rhyming patterns
        {"word": "at/chat/rat", "definition": "at rhyme family", "category": "phonétique"},
        {"word": "ou/chou/fou", "definition": "ou rhyme family", "category": "phonétique"},
        {"word": "on/bon/son", "definition": "on rhyme family", "category": "phonétique"},
        {"word": "eur/fleur/cœur", "definition": "eur rhyme family", "category": "phonétique"},
        
        // High-frequency words
        {"word": "très", "definition": "very", "category": "mots fréquents"},
        {"word": "bien", "definition": "well/good", "category": "mots fréquents"},
        {"word": "plus", "definition": "more", "category": "mots fréquents"},
        {"word": "moins", "definition": "less", "category": "mots fréquents"},
        {"word": "beaucoup", "definition": "a lot", "category": "mots fréquents"},
        
        // Academic language
        {"word": "créer", "definition": "to create", "category": "verbes académiques"},
        {"word": "inventer", "definition": "to invent", "category": "verbes académiques"},
        {"word": "exprimer", "definition": "to express", "category": "verbes académiques"},
        {"word": "ressentir", "definition": "to feel", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 6: Jeunes auteurs créatifs
      vocabulary: [
        // Writing process
        {"word": "écrire", "definition": "to write", "category": "écriture"},
        {"word": "auteur", "definition": "author", "category": "écriture"},
        {"word": "idée", "definition": "idea", "category": "écriture"},
        {"word": "brouillon", "definition": "draft", "category": "écriture"},
        {"word": "réviser", "definition": "to revise", "category": "écriture"},
        {"word": "publier", "definition": "to publish", "category": "écriture"},
        
        // Text structure
        {"word": "titre", "definition": "title", "category": "structure"},
        {"word": "phrase", "definition": "sentence", "category": "structure"},
        {"word": "mot", "definition": "word", "category": "structure"},
        {"word": "lettre", "definition": "letter", "category": "structure"},
        {"word": "majuscule", "definition": "capital letter", "category": "structure"},
        {"word": "point", "definition": "period", "category": "structure"},
        
        // Phonics focus - spelling patterns
        {"word": "é/er/ez", "definition": "é sound variations", "category": "phonétique"},
        {"word": "c/ç", "definition": "soft c sound", "category": "phonétique"},
        {"word": "g/gu", "definition": "hard g sound", "category": "phonétique"},
        {"word": "ph", "definition": "ph sound (f)", "category": "phonétique"},
        
        // High-frequency words
        {"word": "qui", "definition": "who", "category": "mots fréquents"},
        {"word": "que", "definition": "that/what", "category": "mots fréquents"},
        {"word": "quand", "definition": "when", "category": "mots fréquents"},
        {"word": "où", "definition": "where", "category": "mots fréquents"},
        {"word": "comment", "definition": "how", "category": "mots fréquents"},
        
        // Academic language
        {"word": "planifier", "definition": "to plan", "category": "verbes académiques"},
        {"word": "organiser", "definition": "to organize", "category": "verbes académiques"},
        {"word": "corriger", "definition": "to correct", "category": "verbes académiques"},
        {"word": "améliorer", "definition": "to improve", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 7: Exploration de textes
      vocabulary: [
        // Reading strategies
        {"word": "texte", "definition": "text", "category": "lecture"},
        {"word": "image", "definition": "picture/image", "category": "lecture"},
        {"word": "indice", "definition": "clue", "category": "lecture"},
        {"word": "prédire", "definition": "to predict", "category": "lecture"},
        {"word": "vérifier", "definition": "to verify", "category": "lecture"},
        
        // Text types
        {"word": "conte", "definition": "tale/story", "category": "genres"},
        {"word": "information", "definition": "information", "category": "genres"},
        {"word": "instructions", "definition": "instructions", "category": "genres"},
        {"word": "description", "definition": "description", "category": "genres"},
        
        // Phonics focus - complex sounds
        {"word": "ien/ienne", "definition": "ien sound", "category": "phonétique"},
        {"word": "tion", "definition": "tion sound", "category": "phonétique"},
        {"word": "eil/eille", "definition": "eil sound", "category": "phonétique"},
        {"word": "ail/aille", "definition": "ail sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "avant", "definition": "before", "category": "mots fréquents"},
        {"word": "après", "definition": "after", "category": "mots fréquents"},
        {"word": "pendant", "definition": "during", "category": "mots fréquents"},
        {"word": "maintenant", "definition": "now", "category": "mots fréquents"},
        {"word": "toujours", "definition": "always", "category": "mots fréquents"},
        
        // Academic language
        {"word": "analyser", "definition": "to analyze", "category": "verbes académiques"},
        {"word": "questionner", "definition": "to question", "category": "verbes académiques"},
        {"word": "réfléchir", "definition": "to reflect/think", "category": "verbes académiques"},
        {"word": "discuter", "definition": "to discuss", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 8: Communication créative
      vocabulary: [
        // Oral communication
        {"word": "voix", "definition": "voice", "category": "communication"},
        {"word": "fort", "definition": "loud/strong", "category": "communication"},
        {"word": "doucement", "definition": "softly", "category": "communication"},
        {"word": "clairement", "definition": "clearly", "category": "communication"},
        {"word": "présentation", "definition": "presentation", "category": "communication"},
        
        // Expression
        {"word": "émotion", "definition": "emotion", "category": "expression"},
        {"word": "content(e)", "definition": "happy", "category": "expression"},
        {"word": "triste", "definition": "sad", "category": "expression"},
        {"word": "excité(e)", "definition": "excited", "category": "expression"},
        {"word": "calme", "definition": "calm", "category": "expression"},
        
        // Phonics focus - liaison
        {"word": "les amis", "definition": "liaison z sound", "category": "phonétique"},
        {"word": "un ours", "definition": "liaison n sound", "category": "phonétique"},
        {"word": "petit ami", "definition": "liaison t sound", "category": "phonétique"},
        {"word": "grand homme", "definition": "liaison d sound", "category": "phonétique"},
        
        // High-frequency words
        {"word": "alors", "definition": "so/then", "category": "mots fréquents"},
        {"word": "donc", "definition": "therefore", "category": "mots fréquents"},
        {"word": "enfin", "definition": "finally", "category": "mots fréquents"},
        {"word": "d'abord", "definition": "first", "category": "mots fréquents"},
        {"word": "ensuite", "definition": "then/next", "category": "mots fréquents"},
        
        // Academic language
        {"word": "communiquer", "definition": "to communicate", "category": "verbes académiques"},
        {"word": "persuader", "definition": "to persuade", "category": "verbes académiques"},
        {"word": "convaincre", "definition": "to convince", "category": "verbes académiques"},
        {"word": "collaborer", "definition": "to collaborate", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 9: Explorateurs de mots
      vocabulary: [
        // Word study
        {"word": "vocabulaire", "definition": "vocabulary", "category": "lexique"},
        {"word": "dictionnaire", "definition": "dictionary", "category": "lexique"},
        {"word": "définition", "definition": "definition", "category": "lexique"},
        {"word": "synonyme", "definition": "synonym", "category": "lexique"},
        {"word": "contraire", "definition": "opposite", "category": "lexique"},
        
        // Word formation
        {"word": "préfixe", "definition": "prefix", "category": "morphologie"},
        {"word": "suffixe", "definition": "suffix", "category": "morphologie"},
        {"word": "racine", "definition": "root word", "category": "morphologie"},
        {"word": "pluriel", "definition": "plural", "category": "morphologie"},
        
        // Phonics focus - word families
        {"word": "famille de mots", "definition": "word family", "category": "phonétique"},
        {"word": "petit/petite/petitesse", "definition": "word variations", "category": "phonétique"},
        {"word": "grand/grandir/grandeur", "definition": "word variations", "category": "phonétique"},
        {"word": "jour/journée/journal", "definition": "word variations", "category": "phonétique"},
        
        // High-frequency words
        {"word": "même", "definition": "same/even", "category": "mots fréquents"},
        {"word": "autre", "definition": "other", "category": "mots fréquents"},
        {"word": "chaque", "definition": "each", "category": "mots fréquents"},
        {"word": "tous", "definition": "all", "category": "mots fréquents"},
        {"word": "aucun", "definition": "none", "category": "mots fréquents"},
        
        // Academic language
        {"word": "chercher", "definition": "to search/look for", "category": "verbes académiques"},
        {"word": "trouver", "definition": "to find", "category": "verbes académiques"},
        {"word": "utiliser", "definition": "to use", "category": "verbes académiques"},
        {"word": "appliquer", "definition": "to apply", "category": "verbes académiques"}
      ]
    },
    {
      // Unit 10: Notre année française
      vocabulary: [
        // Reflection vocabulary
        {"word": "souvenir", "definition": "memory", "category": "réflexion"},
        {"word": "progrès", "definition": "progress", "category": "réflexion"},
        {"word": "réussite", "definition": "success", "category": "réflexion"},
        {"word": "fierté", "definition": "pride", "category": "réflexion"},
        {"word": "accomplissement", "definition": "achievement", "category": "réflexion"},
        
        // Time expressions
        {"word": "année", "definition": "year", "category": "temps"},
        {"word": "mois", "definition": "month", "category": "temps"},
        {"word": "semaine", "definition": "week", "category": "temps"},
        {"word": "hier", "definition": "yesterday", "category": "temps"},
        {"word": "demain", "definition": "tomorrow", "category": "temps"},
        
        // Phonics review - all sounds
        {"word": "alphabet", "definition": "alphabet", "category": "phonétique"},
        {"word": "voyelle", "definition": "vowel", "category": "phonétique"},
        {"word": "consonne", "definition": "consonant", "category": "phonétique"},
        {"word": "syllabe", "definition": "syllable", "category": "phonétique"},
        
        // High-frequency words review
        {"word": "pouvoir", "definition": "to be able", "category": "mots fréquents"},
        {"word": "vouloir", "definition": "to want", "category": "mots fréquents"},
        {"word": "savoir", "definition": "to know", "category": "mots fréquents"},
        {"word": "devoir", "definition": "must/to have to", "category": "mots fréquents"},
        {"word": "faire", "definition": "to do/make", "category": "mots fréquents"},
        
        // Academic language
        {"word": "évaluer", "definition": "to evaluate", "category": "verbes académiques"},
        {"word": "célébrer", "definition": "to celebrate", "category": "verbes académiques"},
        {"word": "continuer", "definition": "to continue", "category": "verbes académiques"},
        {"word": "progresser", "definition": "to progress", "category": "verbes académiques"}
      ]
    }
  ];
  
  // Update each unit with vocabulary
  console.log('\n📝 ADDING VOCABULARY TO UNITS:\n');
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const vocabulary = unitVocabularies[i]?.vocabulary || [];
    
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        keyVocabulary: vocabulary
      }
    });
    
    console.log(`✅ Unit ${i+1}: Added ${vocabulary.length} vocabulary items`);
    console.log(`   Categories: ${[...new Set(vocabulary.map(v => v.category))].join(', ')}`);
  }
  
  // Verify updates
  console.log('\n📊 VERIFICATION:\n');
  
  const updatedUnits = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  let totalVocab = 0;
  updatedUnits.forEach((unit, i) => {
    const vocabCount = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary.length : 0;
    totalVocab += vocabCount;
    console.log(`Unit ${i+1}: ${vocabCount} vocabulary items`);
  });
  
  console.log(`\n🎉 SUCCESS! Added ${totalVocab} total vocabulary items across ${units.length} units`);
  console.log('\n📚 VOCABULARY FEATURES:');
  console.log('✅ Grade 1 developmentally appropriate');
  console.log('✅ Connected to unit themes and big ideas');
  console.log('✅ Includes phonics, high-frequency words, and academic language');
  console.log('✅ Culturally inclusive and diverse');
  console.log('✅ Scaffolded from simple to complex');
  console.log('✅ Formatted as JSON with word, definition, and category');
  
  await prisma.$disconnect();
}

addKeyVocabulary().catch(console.error);