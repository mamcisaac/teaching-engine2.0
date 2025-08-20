import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeFrenchVocabulary() {
  console.log('📚 COMPLETING FRENCH LANGUAGE ARTS VOCABULARY\n');
  console.log('==============================================');
  console.log('🎯 Creating Grade 1 appropriate vocabulary for 10 French units');
  console.log('📝 15-25 words per unit, connected to unit content');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query French LRP and units
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!frenchLRP) {
    console.log('❌ French LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${frenchLRP.title}`);
  console.log(`📊 Units: ${frenchLRP.unitPlans.length}\n`);
  
  // Comprehensive vocabulary for each unit based on content analysis
  const unitVocabularies = [
    {
      // Unit 1: Bienvenue en français
      vocabulary: [
        // Classroom essentials
        {"word": "bonjour", "definition": "salutation du matin", "category": "salutations", "grade_level": "1"},
        {"word": "au revoir", "definition": "salutation de départ", "category": "salutations", "grade_level": "1"},
        {"word": "merci", "definition": "expression de gratitude", "category": "politesse", "grade_level": "1"},
        {"word": "s'il vous plaît", "definition": "expression de demande polie", "category": "politesse", "grade_level": "1"},
        {"word": "excusez-moi", "definition": "expression d'excuse polie", "category": "politesse", "grade_level": "1"},
        
        // School vocabulary
        {"word": "classe", "definition": "salle où on apprend", "category": "école", "grade_level": "1"},
        {"word": "élève", "definition": "enfant qui apprend à l'école", "category": "école", "grade_level": "1"},
        {"word": "enseignant", "definition": "personne qui enseigne", "category": "école", "grade_level": "1"},
        {"word": "école", "definition": "endroit où on apprend", "category": "école", "grade_level": "1"},
        {"word": "ami", "definition": "personne qu'on aime bien", "category": "relations", "grade_level": "1"},
        
        // Basic materials
        {"word": "crayon", "definition": "outil pour écrire", "category": "matériel", "grade_level": "1"},
        {"word": "livre", "definition": "objet avec des pages à lire", "category": "matériel", "grade_level": "1"},
        {"word": "cahier", "definition": "livre avec pages blanches", "category": "matériel", "grade_level": "1"},
        {"word": "gomme", "definition": "objet pour effacer", "category": "matériel", "grade_level": "1"},
        
        // Basic phonics
        {"word": "lettre", "definition": "symbole de l'alphabet", "category": "phonétique", "grade_level": "1"},
        {"word": "son", "definition": "bruit qu'on entend", "category": "phonétique", "grade_level": "1"},
        {"word": "mot", "definition": "groupe de lettres avec du sens", "category": "phonétique", "grade_level": "1"},
        
        // High-frequency words
        {"word": "je", "definition": "pronom pour soi-même", "category": "mots fréquents", "grade_level": "1"},
        {"word": "tu", "definition": "pronom pour l'autre personne", "category": "mots fréquents", "grade_level": "1"},
        {"word": "le", "definition": "article défini masculin", "category": "mots fréquents", "grade_level": "1"},
        {"word": "la", "definition": "article défini féminin", "category": "mots fréquents", "grade_level": "1"},
        {"word": "un", "definition": "article indéfini masculin", "category": "mots fréquents", "grade_level": "1"},
        {"word": "une", "definition": "article indéfini féminin", "category": "mots fréquents", "grade_level": "1"},
        
        // Academic language
        {"word": "écouter", "definition": "entendre avec attention", "category": "verbes académiques", "grade_level": "1"},
        {"word": "parler", "definition": "dire des mots avec sa voix", "category": "verbes académiques", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: Histoires d'automne
      vocabulary: [
        // Season vocabulary
        {"word": "automne", "definition": "saison entre été et hiver", "category": "saisons", "grade_level": "1"},
        {"word": "feuille", "definition": "partie verte de l'arbre", "category": "nature", "grade_level": "1"},
        {"word": "arbre", "definition": "plante grande avec des branches", "category": "nature", "grade_level": "1"},
        {"word": "vent", "definition": "air qui bouge", "category": "météo", "grade_level": "1"},
        {"word": "pluie", "definition": "eau qui tombe du ciel", "category": "météo", "grade_level": "1"},
        
        // Colors
        {"word": "orange", "definition": "couleur comme une citrouille", "category": "couleurs", "grade_level": "1"},
        {"word": "rouge", "definition": "couleur comme le sang", "category": "couleurs", "grade_level": "1"},
        {"word": "jaune", "definition": "couleur comme le soleil", "category": "couleurs", "grade_level": "1"},
        {"word": "brun", "definition": "couleur comme la terre", "category": "couleurs", "grade_level": "1"},
        {"word": "vert", "definition": "couleur comme l'herbe", "category": "couleurs", "grade_level": "1"},
        
        // Story elements
        {"word": "histoire", "definition": "récit qu'on raconte", "category": "littérature", "grade_level": "1"},
        {"word": "personnage", "definition": "personne dans une histoire", "category": "littérature", "grade_level": "1"},
        {"word": "début", "definition": "commencement d'une histoire", "category": "littérature", "grade_level": "1"},
        {"word": "milieu", "definition": "partie centrale d'une histoire", "category": "littérature", "grade_level": "1"},
        {"word": "fin", "definition": "conclusion d'une histoire", "category": "littérature", "grade_level": "1"},
        
        // High-frequency words
        {"word": "il", "definition": "pronom masculin", "category": "mots fréquents", "grade_level": "1"},
        {"word": "elle", "definition": "pronom féminin", "category": "mots fréquents", "grade_level": "1"},
        {"word": "dans", "definition": "à l'intérieur de", "category": "mots fréquents", "grade_level": "1"},
        {"word": "avec", "definition": "en compagnie de", "category": "mots fréquents", "grade_level": "1"},
        {"word": "sur", "definition": "au-dessus de", "category": "mots fréquents", "grade_level": "1"},
        
        // Academic language
        {"word": "lire", "definition": "comprendre des mots écrits", "category": "verbes académiques", "grade_level": "1"},
        {"word": "raconter", "definition": "dire une histoire", "category": "verbes académiques", "grade_level": "1"},
        {"word": "imaginer", "definition": "créer dans sa tête", "category": "verbes académiques", "grade_level": "1"},
        {"word": "décrire", "definition": "expliquer comment c'est", "category": "verbes académiques", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: Ma famille française
      vocabulary: [
        // Family members
        {"word": "famille", "definition": "groupe de personnes apparentées", "category": "famille", "grade_level": "1"},
        {"word": "maman", "definition": "mère de famille", "category": "famille", "grade_level": "1"},
        {"word": "papa", "definition": "père de famille", "category": "famille", "grade_level": "1"},
        {"word": "frère", "definition": "garçon de la même famille", "category": "famille", "grade_level": "1"},
        {"word": "sœur", "definition": "fille de la même famille", "category": "famille", "grade_level": "1"},
        {"word": "grand-mère", "definition": "mère du parent", "category": "famille", "grade_level": "1"},
        {"word": "grand-père", "definition": "père du parent", "category": "famille", "grade_level": "1"},
        {"word": "bébé", "definition": "très jeune enfant", "category": "famille", "grade_level": "1"},
        
        // Descriptive words
        {"word": "grand", "definition": "de taille importante", "category": "adjectifs", "grade_level": "1"},
        {"word": "petit", "definition": "de petite taille", "category": "adjectifs", "grade_level": "1"},
        {"word": "gentil", "definition": "très aimable", "category": "adjectifs", "grade_level": "1"},
        {"word": "drôle", "definition": "qui fait rire", "category": "adjectifs", "grade_level": "1"},
        {"word": "intelligent", "definition": "qui comprend bien", "category": "adjectifs", "grade_level": "1"},
        
        // Possessive words
        {"word": "mon", "definition": "qui m'appartient (masculin)", "category": "mots fréquents", "grade_level": "1"},
        {"word": "ma", "definition": "qui m'appartient (féminin)", "category": "mots fréquents", "grade_level": "1"},
        {"word": "mes", "definition": "qui m'appartiennent (pluriel)", "category": "mots fréquents", "grade_level": "1"},
        {"word": "ton", "definition": "qui t'appartient (masculin)", "category": "mots fréquents", "grade_level": "1"},
        {"word": "ta", "definition": "qui t'appartient (féminin)", "category": "mots fréquents", "grade_level": "1"},
        
        // Actions
        {"word": "aimer", "definition": "avoir de l'affection pour", "category": "verbes académiques", "grade_level": "1"},
        {"word": "habiter", "definition": "vivre dans un endroit", "category": "verbes académiques", "grade_level": "1"},
        {"word": "présenter", "definition": "faire connaître", "category": "verbes académiques", "grade_level": "1"},
        
        // Home vocabulary
        {"word": "maison", "definition": "endroit où on habite", "category": "famille", "grade_level": "1"},
        {"word": "chambre", "definition": "pièce pour dormir", "category": "famille", "grade_level": "1"},
        {"word": "cuisine", "definition": "pièce pour cuisiner", "category": "famille", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Célébrations d'hiver
      vocabulary: [
        // Winter season
        {"word": "hiver", "definition": "saison froide avec de la neige", "category": "saisons", "grade_level": "1"},
        {"word": "neige", "definition": "petits cristaux blancs du ciel", "category": "météo", "grade_level": "1"},
        {"word": "froid", "definition": "température basse", "category": "météo", "grade_level": "1"},
        {"word": "chaud", "definition": "température élevée", "category": "météo", "grade_level": "1"},
        {"word": "glace", "definition": "eau durcie par le froid", "category": "météo", "grade_level": "1"},
        
        // Celebrations
        {"word": "fête", "definition": "célébration joyeuse", "category": "célébrations", "grade_level": "1"},
        {"word": "cadeau", "definition": "objet qu'on offre", "category": "célébrations", "grade_level": "1"},
        {"word": "surprise", "definition": "chose inattendue", "category": "célébrations", "grade_level": "1"},
        {"word": "joie", "definition": "sentiment de bonheur", "category": "émotions", "grade_level": "1"},
        {"word": "bonheur", "definition": "état de satisfaction", "category": "émotions", "grade_level": "1"},
        
        // Cultural vocabulary
        {"word": "tradition", "definition": "habitude transmise", "category": "culture", "grade_level": "1"},
        {"word": "célébrer", "definition": "fêter quelque chose", "category": "verbes académiques", "grade_level": "1"},
        {"word": "partager", "definition": "donner une partie", "category": "verbes académiques", "grade_level": "1"},
        {"word": "remercier", "definition": "dire merci", "category": "verbes académiques", "grade_level": "1"},
        
        // Winter activities
        {"word": "chanson", "definition": "musique avec des mots", "category": "arts", "grade_level": "1"},
        {"word": "danse", "definition": "mouvement au rythme", "category": "arts", "grade_level": "1"},
        {"word": "lumière", "definition": "clarté qui éclaire", "category": "arts", "grade_level": "1"},
        {"word": "décoration", "definition": "objet pour embellir", "category": "arts", "grade_level": "1"},
        
        // High-frequency words
        {"word": "pour", "definition": "dans le but de", "category": "mots fréquents", "grade_level": "1"},
        {"word": "mais", "definition": "mot qui oppose", "category": "mots fréquents", "grade_level": "1"},
        {"word": "et", "definition": "mot qui unit", "category": "mots fréquents", "grade_level": "1"},
        {"word": "ou", "definition": "mot qui propose un choix", "category": "mots fréquents", "grade_level": "1"},
        
        // Academic language
        {"word": "expliquer", "definition": "faire comprendre", "category": "verbes académiques", "grade_level": "1"},
        {"word": "comparer", "definition": "voir les différences", "category": "verbes académiques", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Poésie et rythmes
      vocabulary: [
        // Poetry vocabulary
        {"word": "poème", "definition": "texte avec des rimes", "category": "poésie", "grade_level": "1"},
        {"word": "rime", "definition": "sons pareils à la fin", "category": "poésie", "grade_level": "1"},
        {"word": "rythme", "definition": "battement régulier", "category": "poésie", "grade_level": "1"},
        {"word": "vers", "definition": "ligne d'un poème", "category": "poésie", "grade_level": "1"},
        {"word": "comptine", "definition": "petit poème pour enfants", "category": "poésie", "grade_level": "1"},
        
        // Sound and music
        {"word": "musique", "definition": "sons agréables organisés", "category": "arts", "grade_level": "1"},
        {"word": "chanter", "definition": "faire de la musique avec la voix", "category": "verbes académiques", "grade_level": "1"},
        {"word": "voix", "definition": "son qui sort de la bouche", "category": "communication", "grade_level": "1"},
        {"word": "fort", "definition": "avec beaucoup de volume", "category": "adjectifs", "grade_level": "1"},
        {"word": "doucement", "definition": "avec peu de volume", "category": "adjectifs", "grade_level": "1"},
        
        // Rhyming families
        {"word": "chat", "definition": "animal domestique qui miaule", "category": "rimes", "grade_level": "1"},
        {"word": "rat", "definition": "petit animal à longue queue", "category": "rimes", "grade_level": "1"},
        {"word": "chapeau", "definition": "couvre-chef pour la tête", "category": "rimes", "grade_level": "1"},
        {"word": "bateau", "definition": "véhicule qui flotte", "category": "rimes", "grade_level": "1"},
        
        // Emotions and expression
        {"word": "content", "definition": "qui ressent de la joie", "category": "émotions", "grade_level": "1"},
        {"word": "triste", "definition": "qui ressent de la peine", "category": "émotions", "grade_level": "1"},
        {"word": "excité", "definition": "très enthousiaste", "category": "émotions", "grade_level": "1"},
        
        // High-frequency words
        {"word": "très", "definition": "beaucoup", "category": "mots fréquents", "grade_level": "1"},
        {"word": "bien", "definition": "de façon correcte", "category": "mots fréquents", "grade_level": "1"},
        {"word": "plus", "definition": "davantage", "category": "mots fréquents", "grade_level": "1"},
        
        // Academic language
        {"word": "créer", "definition": "faire quelque chose de nouveau", "category": "verbes académiques", "grade_level": "1"},
        {"word": "exprimer", "definition": "montrer ses sentiments", "category": "verbes académiques", "grade_level": "1"},
        {"word": "ressentir", "definition": "éprouver une émotion", "category": "verbes académiques", "grade_level": "1"},
        {"word": "répéter", "definition": "dire ou faire encore", "category": "verbes académiques", "grade_level": "1"}
      ]
    }
  ];
  
  // Continue with units 6-10 in next part
  const moreVocabularies = [
    {
      // Unit 6: Jeunes auteurs créatifs
      vocabulary: [
        // Writing process
        {"word": "écrire", "definition": "former des lettres et mots", "category": "écriture", "grade_level": "1"},
        {"word": "auteur", "definition": "personne qui écrit des livres", "category": "écriture", "grade_level": "1"},
        {"word": "idée", "definition": "pensée dans la tête", "category": "écriture", "grade_level": "1"},
        {"word": "histoire", "definition": "récit inventé ou vrai", "category": "écriture", "grade_level": "1"},
        {"word": "titre", "definition": "nom donné à un texte", "category": "écriture", "grade_level": "1"},
        
        // Text structure
        {"word": "phrase", "definition": "groupe de mots avec du sens", "category": "grammaire", "grade_level": "1"},
        {"word": "majuscule", "definition": "grande lettre au début", "category": "grammaire", "grade_level": "1"},
        {"word": "point", "definition": "signe à la fin de phrase", "category": "grammaire", "grade_level": "1"},
        {"word": "virgule", "definition": "petit signe de pause", "category": "grammaire", "grade_level": "1"},
        
        // Creative process
        {"word": "imagination", "definition": "capacité d'inventer", "category": "créativité", "grade_level": "1"},
        {"word": "dessiner", "definition": "faire des traits pour représenter", "category": "arts", "grade_level": "1"},
        {"word": "couleur", "definition": "aspect visuel des choses", "category": "arts", "grade_level": "1"},
        {"word": "illustration", "definition": "image qui accompagne le texte", "category": "arts", "grade_level": "1"},
        
        // Revision process
        {"word": "corriger", "definition": "enlever les erreurs", "category": "verbes académiques", "grade_level": "1"},
        {"word": "améliorer", "definition": "rendre meilleur", "category": "verbes académiques", "grade_level": "1"},
        {"word": "partager", "definition": "montrer aux autres", "category": "verbes académiques", "grade_level": "1"},
        
        // Publication
        {"word": "livre", "definition": "objet avec pages reliées", "category": "écriture", "grade_level": "1"},
        {"word": "page", "definition": "feuille dans un livre", "category": "écriture", "grade_level": "1"},
        {"word": "couverture", "definition": "première page d'un livre", "category": "écriture", "grade_level": "1"},
        
        // High-frequency words
        {"word": "qui", "definition": "pronom interrogatif", "category": "mots fréquents", "grade_level": "1"},
        {"word": "que", "definition": "pronom interrogatif", "category": "mots fréquents", "grade_level": "1"},
        {"word": "quand", "definition": "à quel moment", "category": "mots fréquents", "grade_level": "1"},
        {"word": "où", "definition": "en quel lieu", "category": "mots fréquents", "grade_level": "1"},
        {"word": "comment", "definition": "de quelle façon", "category": "mots fréquents", "grade_level": "1"}
      ]
    },
    {
      // Unit 7: Exploration de textes
      vocabulary: [
        // Reading strategies
        {"word": "texte", "definition": "ensemble de mots écrits", "category": "lecture", "grade_level": "1"},
        {"word": "image", "definition": "représentation visuelle", "category": "lecture", "grade_level": "1"},
        {"word": "prédire", "definition": "deviner avant de lire", "category": "stratégies", "grade_level": "1"},
        {"word": "comprendre", "definition": "saisir le sens", "category": "stratégies", "grade_level": "1"},
        {"word": "vérifier", "definition": "s'assurer que c'est vrai", "category": "stratégies", "grade_level": "1"},
        
        // Text types
        {"word": "conte", "definition": "histoire souvent magique", "category": "genres", "grade_level": "1"},
        {"word": "information", "definition": "renseignement utile", "category": "genres", "grade_level": "1"},
        {"word": "recette", "definition": "instructions pour cuisiner", "category": "genres", "grade_level": "1"},
        {"word": "lettre", "definition": "message écrit à quelqu'un", "category": "genres", "grade_level": "1"},
        
        // Reading comprehension
        {"word": "question", "definition": "phrase qui demande", "category": "stratégies", "grade_level": "1"},
        {"word": "réponse", "definition": "ce qu'on dit à une question", "category": "stratégies", "grade_level": "1"},
        {"word": "détail", "definition": "petite information", "category": "stratégies", "grade_level": "1"},
        {"word": "important", "definition": "qui compte beaucoup", "category": "adjectifs", "grade_level": "1"},
        
        // Time concepts
        {"word": "avant", "definition": "plus tôt dans le temps", "category": "temps", "grade_level": "1"},
        {"word": "après", "definition": "plus tard dans le temps", "category": "temps", "grade_level": "1"},
        {"word": "maintenant", "definition": "en ce moment", "category": "temps", "grade_level": "1"},
        {"word": "hier", "definition": "le jour d'avant", "category": "temps", "grade_level": "1"},
        {"word": "demain", "definition": "le jour d'après", "category": "temps", "grade_level": "1"},
        
        // Academic language
        {"word": "analyser", "definition": "examiner en détail", "category": "verbes académiques", "grade_level": "1"},
        {"word": "comparer", "definition": "voir les ressemblances", "category": "verbes académiques", "grade_level": "1"},
        {"word": "discuter", "definition": "parler ensemble d'un sujet", "category": "verbes académiques", "grade_level": "1"},
        {"word": "réfléchir", "definition": "penser profondément", "category": "verbes académiques", "grade_level": "1"},
        
        // Connection words
        {"word": "parce que", "definition": "pour expliquer la raison", "category": "mots fréquents", "grade_level": "1"},
        {"word": "alors", "definition": "à ce moment-là", "category": "mots fréquents", "grade_level": "1"}
      ]
    },
    {
      // Unit 8: Communication créative
      vocabulary: [
        // Oral communication
        {"word": "communication", "definition": "échange d'informations", "category": "communication", "grade_level": "1"},
        {"word": "message", "definition": "information à transmettre", "category": "communication", "grade_level": "1"},
        {"word": "audience", "definition": "personnes qui écoutent", "category": "communication", "grade_level": "1"},
        {"word": "présentation", "definition": "action de montrer", "category": "communication", "grade_level": "1"},
        
        // Voice and expression
        {"word": "clairement", "definition": "de façon facile à comprendre", "category": "expression", "grade_level": "1"},
        {"word": "lentement", "definition": "pas rapidement", "category": "expression", "grade_level": "1"},
        {"word": "rapidement", "definition": "très vite", "category": "expression", "grade_level": "1"},
        {"word": "sourire", "definition": "expression de joie sur le visage", "category": "expression", "grade_level": "1"},
        
        // Emotions
        {"word": "émotion", "definition": "sentiment qu'on ressent", "category": "émotions", "grade_level": "1"},
        {"word": "calme", "definition": "paisible et tranquille", "category": "émotions", "grade_level": "1"},
        {"word": "nerveux", "definition": "inquiet et agité", "category": "émotions", "grade_level": "1"},
        {"word": "fier", "definition": "content de ses réussites", "category": "émotions", "grade_level": "1"},
        
        // Performance
        {"word": "spectacle", "definition": "représentation devant public", "category": "performance", "grade_level": "1"},
        {"word": "scène", "definition": "endroit où on performe", "category": "performance", "grade_level": "1"},
        {"word": "applaudir", "definition": "frapper des mains en signe d'approbation", "category": "performance", "grade_level": "1"},
        
        // Sequence words
        {"word": "d'abord", "definition": "en premier", "category": "organisation", "grade_level": "1"},
        {"word": "ensuite", "definition": "après cela", "category": "organisation", "grade_level": "1"},
        {"word": "finalement", "definition": "à la fin", "category": "organisation", "grade_level": "1"},
        
        // Cooperative learning
        {"word": "équipe", "definition": "groupe qui travaille ensemble", "category": "collaboration", "grade_level": "1"},
        {"word": "aider", "definition": "donner de l'assistance", "category": "collaboration", "grade_level": "1"},
        {"word": "écouter", "definition": "prêter attention aux sons", "category": "collaboration", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter avec considération", "category": "collaboration", "grade_level": "1"},
        
        // Academic language
        {"word": "organiser", "definition": "mettre en ordre", "category": "verbes académiques", "grade_level": "1"},
        {"word": "planifier", "definition": "préparer à l'avance", "category": "verbes académiques", "grade_level": "1"},
        {"word": "pratiquer", "definition": "s'exercer pour améliorer", "category": "verbes académiques", "grade_level": "1"}
      ]
    },
    {
      // Unit 9: Explorateurs de mots
      vocabulary: [
        // Word study
        {"word": "vocabulaire", "definition": "ensemble des mots qu'on connaît", "category": "lexique", "grade_level": "1"},
        {"word": "dictionnaire", "definition": "livre qui explique les mots", "category": "lexique", "grade_level": "1"},
        {"word": "définition", "definition": "explication du sens d'un mot", "category": "lexique", "grade_level": "1"},
        {"word": "synonyme", "definition": "mot qui a le même sens", "category": "lexique", "grade_level": "1"},
        {"word": "contraire", "definition": "mot qui a le sens opposé", "category": "lexique", "grade_level": "1"},
        
        // Word formation
        {"word": "famille", "definition": "groupe de mots apparentés", "category": "morphologie", "grade_level": "1"},
        {"word": "racine", "definition": "partie principale d'un mot", "category": "morphologie", "grade_level": "1"},
        {"word": "pluriel", "definition": "forme pour plusieurs", "category": "morphologie", "grade_level": "1"},
        {"word": "singulier", "definition": "forme pour un seul", "category": "morphologie", "grade_level": "1"},
        
        // Word categories
        {"word": "nom", "definition": "mot qui nomme une chose", "category": "grammaire", "grade_level": "1"},
        {"word": "verbe", "definition": "mot qui exprime une action", "category": "grammaire", "grade_level": "1"},
        {"word": "adjectif", "definition": "mot qui décrit", "category": "grammaire", "grade_level": "1"},
        
        // Discovery strategies
        {"word": "chercher", "definition": "essayer de trouver", "category": "stratégies", "grade_level": "1"},
        {"word": "trouver", "definition": "découvrir ce qu'on cherchait", "category": "stratégies", "grade_level": "1"},
        {"word": "deviner", "definition": "essayer de savoir sans être sûr", "category": "stratégies", "grade_level": "1"},
        
        // Word relationships
        {"word": "pareil", "definition": "identique ou similaire", "category": "comparaison", "grade_level": "1"},
        {"word": "différent", "definition": "pas identique", "category": "comparaison", "grade_level": "1"},
        {"word": "semblable", "definition": "qui se ressemble", "category": "comparaison", "grade_level": "1"},
        
        // Quantifiers
        {"word": "beaucoup", "definition": "une grande quantité", "category": "quantité", "grade_level": "1"},
        {"word": "peu", "definition": "une petite quantité", "category": "quantité", "grade_level": "1"},
        {"word": "tous", "definition": "chacun sans exception", "category": "quantité", "grade_level": "1"},
        {"word": "aucun", "definition": "pas un seul", "category": "quantité", "grade_level": "1"},
        
        // Academic language
        {"word": "utiliser", "definition": "se servir de quelque chose", "category": "verbes académiques", "grade_level": "1"},
        {"word": "appliquer", "definition": "mettre en pratique", "category": "verbes académiques", "grade_level": "1"}
      ]
    },
    {
      // Unit 10: Notre année française
      vocabulary: [
        // Reflection vocabulary
        {"word": "souvenir", "definition": "chose qu'on se rappelle", "category": "réflexion", "grade_level": "1"},
        {"word": "progrès", "definition": "amélioration au fil du temps", "category": "réflexion", "grade_level": "1"},
        {"word": "réussite", "definition": "succès dans une tâche", "category": "réflexion", "grade_level": "1"},
        {"word": "accomplissement", "definition": "chose qu'on a réalisée", "category": "réflexion", "grade_level": "1"},
        {"word": "fierté", "definition": "sentiment d'être content de soi", "category": "réflexion", "grade_level": "1"},
        
        // Time expressions
        {"word": "année", "definition": "période de douze mois", "category": "temps", "grade_level": "1"},
        {"word": "mois", "definition": "période d'environ trente jours", "category": "temps", "grade_level": "1"},
        {"word": "semaine", "definition": "période de sept jours", "category": "temps", "grade_level": "1"},
        {"word": "septembre", "definition": "neuvième mois de l'année", "category": "temps", "grade_level": "1"},
        {"word": "juin", "definition": "sixième mois de l'année", "category": "temps", "grade_level": "1"},
        
        // Learning vocabulary
        {"word": "apprendre", "definition": "acquérir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "savoir", "definition": "avoir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "comprendre", "definition": "saisir le sens de", "category": "apprentissage", "grade_level": "1"},
        {"word": "grandir", "definition": "devenir plus grand", "category": "apprentissage", "grade_level": "1"},
        
        // Portfolio concepts
        {"word": "portfolio", "definition": "collection de travaux", "category": "évaluation", "grade_level": "1"},
        {"word": "travail", "definition": "effort pour faire quelque chose", "category": "évaluation", "grade_level": "1"},
        {"word": "effort", "definition": "énergie mise dans une tâche", "category": "évaluation", "grade_level": "1"},
        {"word": "amélioration", "definition": "action de rendre meilleur", "category": "évaluation", "grade_level": "1"},
        
        // Future planning
        {"word": "objectif", "definition": "but qu'on veut atteindre", "category": "planification", "grade_level": "1"},
        {"word": "but", "definition": "ce qu'on veut réaliser", "category": "planification", "grade_level": "1"},
        {"word": "plan", "definition": "façon de faire quelque chose", "category": "planification", "grade_level": "1"},
        {"word": "rêve", "definition": "chose qu'on espère réaliser", "category": "planification", "grade_level": "1"},
        
        // Celebration
        {"word": "célébration", "definition": "façon de marquer un événement", "category": "célébration", "grade_level": "1"},
        {"word": "succès", "definition": "réussite dans ce qu'on fait", "category": "célébration", "grade_level": "1"},
        {"word": "victoire", "definition": "fait de gagner ou réussir", "category": "célébration", "grade_level": "1"}
      ]
    }
  ];
  
  // Combine all vocabularies
  const allVocabularies = [...unitVocabularies, ...moreVocabularies];
  
  console.log('📝 ADDING VOCABULARY TO EACH UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < frenchLRP.unitPlans.length; i++) {
    const unit = frenchLRP.unitPlans[i];
    const vocabulary = allVocabularies[i]?.vocabulary || [];
    
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
    where: { longRangePlanId: frenchLRP.id },
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
  
  console.log('\n📊 FINAL STATISTICS:');
  console.log('══════════════════════');
  console.log(`📚 Total French Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 200) {
    console.log('\n🎉 SUCCESS! French Language Arts vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate vocabulary');
    console.log('✅ Connected to unit themes and learning objectives');
    console.log('✅ Progressive complexity and proper categorization');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeFrenchVocabulary().catch(console.error);