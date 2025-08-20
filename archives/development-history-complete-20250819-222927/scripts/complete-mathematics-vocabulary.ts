import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeMathematicsVocabulary() {
  console.log('🔢 COMPLETING MATHEMATICS VOCABULARY\n');
  console.log('====================================');
  console.log('🎯 Creating Grade 1 appropriate math vocabulary for 10 units');
  console.log('📝 15-25 words per unit, connected to mathematical concepts');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query Mathematics LRP
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Mathématiques' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!mathLRP) {
    console.log('❌ Mathematics LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${mathLRP.title}`);
  console.log(`📊 Units: ${mathLRP.unitPlans.length}\n`);
  
  // Comprehensive mathematics vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Fondations des nombres 0-10
      vocabulary: [
        // Basic numbers
        {"word": "nombre", "definition": "symbole qui représente une quantité", "category": "nombres", "grade_level": "1"},
        {"word": "chiffre", "definition": "symbole de 0 à 9", "category": "nombres", "grade_level": "1"},
        {"word": "zéro", "definition": "le nombre qui représente rien", "category": "nombres", "grade_level": "1"},
        {"word": "un", "definition": "le premier nombre", "category": "nombres", "grade_level": "1"},
        {"word": "deux", "definition": "nombre après un", "category": "nombres", "grade_level": "1"},
        {"word": "trois", "definition": "nombre après deux", "category": "nombres", "grade_level": "1"},
        {"word": "quatre", "definition": "nombre après trois", "category": "nombres", "grade_level": "1"},
        {"word": "cinq", "definition": "nombre après quatre", "category": "nombres", "grade_level": "1"},
        {"word": "six", "definition": "nombre après cinq", "category": "nombres", "grade_level": "1"},
        {"word": "sept", "definition": "nombre après six", "category": "nombres", "grade_level": "1"},
        {"word": "huit", "definition": "nombre après sept", "category": "nombres", "grade_level": "1"},
        {"word": "neuf", "definition": "nombre après huit", "category": "nombres", "grade_level": "1"},
        {"word": "dix", "definition": "nombre après neuf", "category": "nombres", "grade_level": "1"},
        
        // Counting concepts
        {"word": "compter", "definition": "dire les nombres dans l'ordre", "category": "opérations", "grade_level": "1"},
        {"word": "quantité", "definition": "combien il y en a", "category": "concepts", "grade_level": "1"},
        {"word": "plus", "definition": "davantage", "category": "comparaison", "grade_level": "1"},
        {"word": "moins", "definition": "pas autant", "category": "comparaison", "grade_level": "1"},
        {"word": "égal", "definition": "de même quantité", "category": "comparaison", "grade_level": "1"},
        
        // Mathematical tools
        {"word": "calculer", "definition": "faire des mathématiques", "category": "verbes math", "grade_level": "1"},
        {"word": "résoudre", "definition": "trouver la réponse", "category": "verbes math", "grade_level": "1"},
        
        // Position concepts
        {"word": "premier", "definition": "qui vient en position 1", "category": "position", "grade_level": "1"},
        {"word": "deuxième", "definition": "qui vient en position 2", "category": "position", "grade_level": "1"},
        {"word": "dernier", "definition": "qui vient à la fin", "category": "position", "grade_level": "1"},
        
        // Basic operations vocabulary
        {"word": "problème", "definition": "question mathématique à résoudre", "category": "concepts", "grade_level": "1"},
        {"word": "réponse", "definition": "solution au problème", "category": "concepts", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: Régularités et relations
      vocabulary: [
        // Pattern vocabulary
        {"word": "régularité", "definition": "suite qui se répète", "category": "patterns", "grade_level": "1"},
        {"word": "motif", "definition": "design qui se répète", "category": "patterns", "grade_level": "1"},
        {"word": "suite", "definition": "éléments qui se suivent", "category": "patterns", "grade_level": "1"},
        {"word": "répéter", "definition": "faire encore la même chose", "category": "patterns", "grade_level": "1"},
        {"word": "continuer", "definition": "poursuivre la suite", "category": "patterns", "grade_level": "1"},
        {"word": "prédire", "definition": "deviner ce qui vient après", "category": "patterns", "grade_level": "1"},
        
        // Pattern elements
        {"word": "couleur", "definition": "teinte d'un objet", "category": "attributs", "grade_level": "1"},
        {"word": "forme", "definition": "apparence d'un objet", "category": "attributs", "grade_level": "1"},
        {"word": "taille", "definition": "grandeur d'un objet", "category": "attributs", "grade_level": "1"},
        {"word": "position", "definition": "place d'un objet", "category": "attributs", "grade_level": "1"},
        
        // Sequence concepts
        {"word": "avant", "definition": "qui précède", "category": "séquence", "grade_level": "1"},
        {"word": "après", "definition": "qui suit", "category": "séquence", "grade_level": "1"},
        {"word": "entre", "definition": "au milieu de deux", "category": "séquence", "grade_level": "1"},
        {"word": "suivant", "definition": "qui vient après", "category": "séquence", "grade_level": "1"},
        
        // Mathematical thinking
        {"word": "observer", "definition": "regarder attentivement", "category": "verbes math", "grade_level": "1"},
        {"word": "remarquer", "definition": "voir quelque chose d'important", "category": "verbes math", "grade_level": "1"},
        {"word": "identifier", "definition": "reconnaître quelque chose", "category": "verbes math", "grade_level": "1"},
        {"word": "créer", "definition": "faire quelque chose de nouveau", "category": "verbes math", "grade_level": "1"},
        
        // Relationships
        {"word": "pareil", "definition": "identique", "category": "relations", "grade_level": "1"},
        {"word": "différent", "definition": "pas pareil", "category": "relations", "grade_level": "1"},
        {"word": "semblable", "definition": "presque pareil", "category": "relations", "grade_level": "1"},
        
        // Pattern creation
        {"word": "construire", "definition": "faire une suite", "category": "verbes math", "grade_level": "1"},
        {"word": "dessiner", "definition": "faire des traits", "category": "verbes math", "grade_level": "1"},
        {"word": "organiser", "definition": "mettre en ordre", "category": "verbes math", "grade_level": "1"},
        {"word": "classer", "definition": "grouper par catégories", "category": "verbes math", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: Addition jusqu'à 10
      vocabulary: [
        // Addition vocabulary
        {"word": "addition", "definition": "opération pour ajouter", "category": "opérations", "grade_level": "1"},
        {"word": "additionner", "definition": "faire une addition", "category": "opérations", "grade_level": "1"},
        {"word": "ajouter", "definition": "mettre ensemble", "category": "opérations", "grade_level": "1"},
        {"word": "total", "definition": "résultat de l'addition", "category": "opérations", "grade_level": "1"},
        {"word": "somme", "definition": "résultat quand on additionne", "category": "opérations", "grade_level": "1"},
        
        // Mathematical symbols
        {"word": "plus", "definition": "signe + pour additionner", "category": "symboles", "grade_level": "1"},
        {"word": "égale", "definition": "signe = qui montre le résultat", "category": "symboles", "grade_level": "1"},
        {"word": "équation", "definition": "calcul avec des nombres", "category": "symboles", "grade_level": "1"},
        
        // Counting strategies
        {"word": "compter", "definition": "dire les nombres un par un", "category": "stratégies", "grade_level": "1"},
        {"word": "dénombrer", "definition": "compter pour savoir combien", "category": "stratégies", "grade_level": "1"},
        {"word": "grouper", "definition": "mettre ensemble", "category": "stratégies", "grade_level": "1"},
        {"word": "rassembler", "definition": "réunir en un groupe", "category": "stratégies", "grade_level": "1"},
        
        // Problem solving
        {"word": "problème", "definition": "question mathématique", "category": "résolution", "grade_level": "1"},
        {"word": "solution", "definition": "réponse au problème", "category": "résolution", "grade_level": "1"},
        {"word": "stratégie", "definition": "façon de résoudre", "category": "résolution", "grade_level": "1"},
        {"word": "méthode", "definition": "manière de faire", "category": "résolution", "grade_level": "1"},
        
        // Concrete materials
        {"word": "objet", "definition": "chose qu'on peut toucher", "category": "matériel", "grade_level": "1"},
        {"word": "cube", "definition": "petit bloc pour compter", "category": "matériel", "grade_level": "1"},
        {"word": "jeton", "definition": "pièce pour compter", "category": "matériel", "grade_level": "1"},
        {"word": "collection", "definition": "groupe d'objets", "category": "matériel", "grade_level": "1"},
        
        // Mathematical communication
        {"word": "expliquer", "definition": "dire comment on fait", "category": "communication", "grade_level": "1"},
        {"word": "montrer", "definition": "faire voir", "category": "communication", "grade_level": "1"},
        {"word": "démontrer", "definition": "prouver en montrant", "category": "communication", "grade_level": "1"},
        
        // Number relationships
        {"word": "partie", "definition": "morceau d'un tout", "category": "concepts", "grade_level": "1"},
        {"word": "entier", "definition": "le tout complet", "category": "concepts", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Formes 2D et solides 3D
      vocabulary: [
        // 2D shapes
        {"word": "forme", "definition": "apparence géométrique", "category": "géométrie", "grade_level": "1"},
        {"word": "cercle", "definition": "forme ronde parfaite", "category": "formes 2D", "grade_level": "1"},
        {"word": "carré", "definition": "forme avec 4 côtés égaux", "category": "formes 2D", "grade_level": "1"},
        {"word": "rectangle", "definition": "forme avec 4 côtés et 4 angles droits", "category": "formes 2D", "grade_level": "1"},
        {"word": "triangle", "definition": "forme avec 3 côtés", "category": "formes 2D", "grade_level": "1"},
        {"word": "ovale", "definition": "forme ronde allongée", "category": "formes 2D", "grade_level": "1"},
        
        // 3D solids
        {"word": "solide", "definition": "objet en trois dimensions", "category": "formes 3D", "grade_level": "1"},
        {"word": "cube", "definition": "solide avec 6 faces carrées", "category": "formes 3D", "grade_level": "1"},
        {"word": "sphère", "definition": "solide rond comme une balle", "category": "formes 3D", "grade_level": "1"},
        {"word": "cylindre", "definition": "solide rond et long", "category": "formes 3D", "grade_level": "1"},
        {"word": "cône", "definition": "solide pointu comme un chapeau", "category": "formes 3D", "grade_level": "1"},
        
        // Shape attributes
        {"word": "côté", "definition": "ligne qui forme le bord", "category": "attributs", "grade_level": "1"},
        {"word": "coin", "definition": "endroit où se rencontrent les côtés", "category": "attributs", "grade_level": "1"},
        {"word": "angle", "definition": "coin formé par deux lignes", "category": "attributs", "grade_level": "1"},
        {"word": "face", "definition": "surface plate d'un solide", "category": "attributs", "grade_level": "1"},
        {"word": "arête", "definition": "ligne où se rencontrent deux faces", "category": "attributs", "grade_level": "1"},
        {"word": "sommet", "definition": "point où se rencontrent les arêtes", "category": "attributs", "grade_level": "1"},
        
        // Geometric concepts
        {"word": "plat", "definition": "qui n'a pas d'épaisseur", "category": "propriétés", "grade_level": "1"},
        {"word": "courbe", "definition": "ligne qui n'est pas droite", "category": "propriétés", "grade_level": "1"},
        {"word": "droit", "definition": "ligne parfaitement droite", "category": "propriétés", "grade_level": "1"},
        {"word": "rond", "definition": "qui a la forme d'un cercle", "category": "propriétés", "grade_level": "1"},
        
        // Spatial vocabulary
        {"word": "dedans", "definition": "à l'intérieur", "category": "position", "grade_level": "1"},
        {"word": "dehors", "definition": "à l'extérieur", "category": "position", "grade_level": "1"},
        {"word": "autour", "definition": "tout près en cercle", "category": "position", "grade_level": "1"},
        {"word": "à côté", "definition": "près de", "category": "position", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Soustraction et relations inverses
      vocabulary: [
        // Subtraction vocabulary
        {"word": "soustraction", "definition": "opération pour enlever", "category": "opérations", "grade_level": "1"},
        {"word": "soustraire", "definition": "faire une soustraction", "category": "opérations", "grade_level": "1"},
        {"word": "enlever", "definition": "retirer quelque chose", "category": "opérations", "grade_level": "1"},
        {"word": "retirer", "definition": "prendre quelque chose", "category": "opérations", "grade_level": "1"},
        {"word": "différence", "definition": "résultat de la soustraction", "category": "opérations", "grade_level": "1"},
        {"word": "reste", "definition": "ce qui demeure après avoir enlevé", "category": "opérations", "grade_level": "1"},
        
        // Mathematical symbols
        {"word": "moins", "definition": "signe - pour soustraire", "category": "symboles", "grade_level": "1"},
        {"word": "égale", "definition": "signe = qui montre le résultat", "category": "symboles", "grade_level": "1"},
        
        // Inverse relationships
        {"word": "inverse", "definition": "opération contraire", "category": "relations", "grade_level": "1"},
        {"word": "contraire", "definition": "opposé", "category": "relations", "grade_level": "1"},
        {"word": "défaire", "definition": "annuler ce qu'on a fait", "category": "relations", "grade_level": "1"},
        {"word": "vérifier", "definition": "s'assurer que c'est correct", "category": "relations", "grade_level": "1"},
        
        // Problem types
        {"word": "partir", "definition": "commencer avec une quantité", "category": "problèmes", "grade_level": "1"},
        {"word": "perdre", "definition": "ne plus avoir", "category": "problèmes", "grade_level": "1"},
        {"word": "donner", "definition": "offrir à quelqu'un", "category": "problèmes", "grade_level": "1"},
        {"word": "manger", "definition": "consommer de la nourriture", "category": "problèmes", "grade_level": "1"},
        {"word": "casser", "definition": "briser en morceaux", "category": "problèmes", "grade_level": "1"},
        
        // Counting strategies
        {"word": "reculer", "definition": "compter à l'envers", "category": "stratégies", "grade_level": "1"},
        {"word": "compter", "definition": "dire les nombres dans l'ordre", "category": "stratégies", "grade_level": "1"},
        {"word": "décompter", "definition": "enlever un par un", "category": "stratégies", "grade_level": "1"},
        
        // Mathematical thinking
        {"word": "raisonner", "definition": "réfléchir logiquement", "category": "verbes math", "grade_level": "1"},
        {"word": "analyser", "definition": "examiner attentivement", "category": "verbes math", "grade_level": "1"},
        {"word": "comparer", "definition": "voir les différences", "category": "verbes math", "grade_level": "1"},
        
        // Number sense
        {"word": "diminuer", "definition": "devenir plus petit", "category": "concepts", "grade_level": "1"},
        {"word": "réduire", "definition": "rendre plus petit", "category": "concepts", "grade_level": "1"},
        {"word": "manquer", "definition": "ne pas avoir assez", "category": "concepts", "grade_level": "1"}
      ]
    }
  ];
  
  // Continue with units 6-10
  const moreVocabularies = [
    {
      // Unit 6: Nombres 11-20 et base dix
      vocabulary: [
        // Teen numbers
        {"word": "onze", "definition": "nombre après dix", "category": "nombres", "grade_level": "1"},
        {"word": "douze", "definition": "nombre après onze", "category": "nombres", "grade_level": "1"},
        {"word": "treize", "definition": "nombre après douze", "category": "nombres", "grade_level": "1"},
        {"word": "quatorze", "definition": "nombre après treize", "category": "nombres", "grade_level": "1"},
        {"word": "quinze", "definition": "nombre après quatorze", "category": "nombres", "grade_level": "1"},
        {"word": "seize", "definition": "nombre après quinze", "category": "nombres", "grade_level": "1"},
        {"word": "dix-sept", "definition": "nombre après seize", "category": "nombres", "grade_level": "1"},
        {"word": "dix-huit", "definition": "nombre après dix-sept", "category": "nombres", "grade_level": "1"},
        {"word": "dix-neuf", "definition": "nombre après dix-huit", "category": "nombres", "grade_level": "1"},
        {"word": "vingt", "definition": "nombre après dix-neuf", "category": "nombres", "grade_level": "1"},
        
        // Base ten concepts
        {"word": "dizaine", "definition": "groupe de dix", "category": "base dix", "grade_level": "1"},
        {"word": "unité", "definition": "objet simple", "category": "base dix", "grade_level": "1"},
        {"word": "regrouper", "definition": "faire des groupes", "category": "base dix", "grade_level": "1"},
        {"word": "échanger", "definition": "troquer une chose pour une autre", "category": "base dix", "grade_level": "1"},
        {"word": "représenter", "definition": "montrer d'une autre façon", "category": "base dix", "grade_level": "1"},
        
        // Place value
        {"word": "position", "definition": "place d'un chiffre", "category": "valeur position", "grade_level": "1"},
        {"word": "valeur", "definition": "ce que vaut un chiffre", "category": "valeur position", "grade_level": "1"},
        {"word": "place", "definition": "endroit du chiffre", "category": "valeur position", "grade_level": "1"},
        
        // Counting patterns
        {"word": "motif", "definition": "suite qui se répète", "category": "patterns", "grade_level": "1"},
        {"word": "continuer", "definition": "poursuivre la suite", "category": "patterns", "grade_level": "1"},
        {"word": "saut", "definition": "compter par bonds", "category": "patterns", "grade_level": "1"},
        
        // Mathematical tools
        {"word": "abaque", "definition": "outil pour compter", "category": "matériel", "grade_level": "1"},
        {"word": "bâtonnet", "definition": "tige pour compter", "category": "matériel", "grade_level": "1"},
        {"word": "réglette", "definition": "barre pour les dizaines", "category": "matériel", "grade_level": "1"},
        {"word": "tableau", "definition": "grille pour organiser", "category": "matériel", "grade_level": "1"}
      ]
    },
    {
      // Unit 7: Mesure non-standard
      vocabulary: [
        // Measurement concepts
        {"word": "mesurer", "definition": "trouver la grandeur", "category": "mesure", "grade_level": "1"},
        {"word": "mesure", "definition": "grandeur d'un objet", "category": "mesure", "grade_level": "1"},
        {"word": "longueur", "definition": "distance d'un bout à l'autre", "category": "mesure", "grade_level": "1"},
        {"word": "largeur", "definition": "distance d'un côté à l'autre", "category": "mesure", "grade_level": "1"},
        {"word": "hauteur", "definition": "distance du bas au haut", "category": "mesure", "grade_level": "1"},
        {"word": "taille", "definition": "grandeur d'un objet", "category": "mesure", "grade_level": "1"},
        
        // Non-standard units
        {"word": "unité", "definition": "objet pour mesurer", "category": "unités", "grade_level": "1"},
        {"word": "trombones", "definition": "petits objets pour mesurer", "category": "unités", "grade_level": "1"},
        {"word": "cubes", "definition": "blocs pour mesurer", "category": "unités", "grade_level": "1"},
        {"word": "pas", "definition": "distance d'un pied", "category": "unités", "grade_level": "1"},
        {"word": "empan", "definition": "distance entre pouce et petit doigt", "category": "unités", "grade_level": "1"},
        
        // Comparison vocabulary
        {"word": "plus long", "definition": "de plus grande longueur", "category": "comparaison", "grade_level": "1"},
        {"word": "plus court", "definition": "de plus petite longueur", "category": "comparaison", "grade_level": "1"},
        {"word": "même longueur", "definition": "de longueur égale", "category": "comparaison", "grade_level": "1"},
        {"word": "plus grand", "definition": "de plus grande taille", "category": "comparaison", "grade_level": "1"},
        {"word": "plus petit", "definition": "de plus petite taille", "category": "comparaison", "grade_level": "1"},
        
        // Measurement tools
        {"word": "règle", "definition": "outil pour mesurer", "category": "outils", "grade_level": "1"},
        {"word": "ficelle", "definition": "corde pour mesurer", "category": "outils", "grade_level": "1"},
        {"word": "bande", "definition": "ruban pour mesurer", "category": "outils", "grade_level": "1"},
        
        // Measurement process
        {"word": "aligner", "definition": "mettre en ligne droite", "category": "processus", "grade_level": "1"},
        {"word": "placer", "definition": "mettre à un endroit", "category": "processus", "grade_level": "1"},
        {"word": "compter", "definition": "dire combien d'unités", "category": "processus", "grade_level": "1"},
        {"word": "estimer", "definition": "deviner la mesure", "category": "processus", "grade_level": "1"},
        
        // Attributes to measure
        {"word": "poids", "definition": "lourdeur d'un objet", "category": "attributs", "grade_level": "1"},
        {"word": "capacité", "definition": "quantité qu'un contenant peut tenir", "category": "attributs", "grade_level": "1"},
        {"word": "température", "definition": "degré de chaleur", "category": "attributs", "grade_level": "1"}
      ]
    },
    {
      // Unit 8: Comparaison et ordonnancement
      vocabulary: [
        // Comparison vocabulary
        {"word": "comparer", "definition": "voir les différences", "category": "comparaison", "grade_level": "1"},
        {"word": "ordonner", "definition": "mettre en ordre", "category": "ordonnancement", "grade_level": "1"},
        {"word": "classer", "definition": "organiser par catégories", "category": "ordonnancement", "grade_level": "1"},
        {"word": "ranger", "definition": "mettre en ordre", "category": "ordonnancement", "grade_level": "1"},
        {"word": "trier", "definition": "séparer par groupes", "category": "ordonnancement", "grade_level": "1"},
        
        // Comparative terms
        {"word": "plus que", "definition": "en plus grande quantité", "category": "comparaison", "grade_level": "1"},
        {"word": "moins que", "definition": "en plus petite quantité", "category": "comparaison", "grade_level": "1"},
        {"word": "autant que", "definition": "en même quantité", "category": "comparaison", "grade_level": "1"},
        {"word": "le plus", "definition": "la plus grande quantité", "category": "comparaison", "grade_level": "1"},
        {"word": "le moins", "definition": "la plus petite quantité", "category": "comparaison", "grade_level": "1"},
        
        // Ordering terms
        {"word": "croissant", "definition": "du plus petit au plus grand", "category": "ordre", "grade_level": "1"},
        {"word": "décroissant", "definition": "du plus grand au plus petit", "category": "ordre", "grade_level": "1"},
        {"word": "ordre", "definition": "façon d'organiser", "category": "ordre", "grade_level": "1"},
        {"word": "séquence", "definition": "suite ordonnée", "category": "ordre", "grade_level": "1"},
        
        // Position in sequence
        {"word": "premier", "definition": "qui vient en position 1", "category": "position", "grade_level": "1"},
        {"word": "deuxième", "definition": "qui vient en position 2", "category": "position", "grade_level": "1"},
        {"word": "troisième", "definition": "qui vient en position 3", "category": "position", "grade_level": "1"},
        {"word": "milieu", "definition": "au centre", "category": "position", "grade_level": "1"},
        {"word": "dernier", "definition": "qui vient à la fin", "category": "position", "grade_level": "1"},
        
        // Mathematical symbols
        {"word": "supérieur", "definition": "plus grand que", "category": "symboles", "grade_level": "1"},
        {"word": "inférieur", "definition": "plus petit que", "category": "symboles", "grade_level": "1"},
        {"word": "égal", "definition": "de même valeur", "category": "symboles", "grade_level": "1"},
        
        // Data concepts
        {"word": "information", "definition": "renseignement utile", "category": "données", "grade_level": "1"},
        {"word": "données", "definition": "informations collectées", "category": "données", "grade_level": "1"},
        {"word": "enquête", "definition": "recherche pour obtenir des informations", "category": "données", "grade_level": "1"},
        {"word": "graphique", "definition": "dessin qui montre des données", "category": "données", "grade_level": "1"}
      ]
    },
    {
      // Unit 9: Stratégies de calcul mental
      vocabulary: [
        // Mental math concepts
        {"word": "mental", "definition": "dans la tête", "category": "calcul mental", "grade_level": "1"},
        {"word": "stratégie", "definition": "façon de résoudre", "category": "calcul mental", "grade_level": "1"},
        {"word": "méthode", "definition": "manière de faire", "category": "calcul mental", "grade_level": "1"},
        {"word": "astuce", "definition": "truc pour faciliter", "category": "calcul mental", "grade_level": "1"},
        {"word": "rapidement", "definition": "très vite", "category": "calcul mental", "grade_level": "1"},
        
        // Counting strategies
        {"word": "compter en avant", "definition": "dire les nombres vers le haut", "category": "stratégies", "grade_level": "1"},
        {"word": "compter en arrière", "definition": "dire les nombres vers le bas", "category": "stratégies", "grade_level": "1"},
        {"word": "compter par bonds", "definition": "sauter des nombres", "category": "stratégies", "grade_level": "1"},
        {"word": "doubler", "definition": "multiplier par deux", "category": "stratégies", "grade_level": "1"},
        {"word": "moitié", "definition": "diviser par deux", "category": "stratégies", "grade_level": "1"},
        
        // Number relationships
        {"word": "fait numérique", "definition": "calcul qu'on connaît par cœur", "category": "relations", "grade_level": "1"},
        {"word": "famille", "definition": "groupe de calculs liés", "category": "relations", "grade_level": "1"},
        {"word": "paire", "definition": "groupe de deux", "category": "relations", "grade_level": "1"},
        {"word": "voisin", "definition": "nombre tout près", "category": "relations", "grade_level": "1"},
        
        // Decomposition
        {"word": "décomposer", "definition": "séparer en parties", "category": "décomposition", "grade_level": "1"},
        {"word": "partie", "definition": "morceau d'un tout", "category": "décomposition", "grade_level": "1"},
        {"word": "tout", "definition": "l'ensemble complet", "category": "décomposition", "grade_level": "1"},
        {"word": "séparer", "definition": "diviser en morceaux", "category": "décomposition", "grade_level": "1"},
        
        // Problem solving
        {"word": "résoudre", "definition": "trouver la solution", "category": "résolution", "grade_level": "1"},
        {"word": "réfléchir", "definition": "penser attentivement", "category": "résolution", "grade_level": "1"},
        {"word": "essayer", "definition": "tenter de faire", "category": "résolution", "grade_level": "1"},
        {"word": "vérifier", "definition": "s'assurer que c'est correct", "category": "résolution", "grade_level": "1"},
        
        // Flexibility
        {"word": "flexible", "definition": "qui peut changer", "category": "flexibilité", "grade_level": "1"},
        {"word": "efficace", "definition": "qui fonctionne bien", "category": "flexibilité", "grade_level": "1"},
        {"word": "précis", "definition": "exact", "category": "flexibilité", "grade_level": "1"},
        {"word": "choix", "definition": "option disponible", "category": "flexibilité", "grade_level": "1"}
      ]
    },
    {
      // Unit 10: Égalité et célébration mathématique
      vocabulary: [
        // Equality concepts
        {"word": "égalité", "definition": "fait d'être égal", "category": "égalité", "grade_level": "1"},
        {"word": "équivalent", "definition": "qui a la même valeur", "category": "égalité", "grade_level": "1"},
        {"word": "balance", "definition": "outil qui montre l'égalité", "category": "égalité", "grade_level": "1"},
        {"word": "équilibrer", "definition": "rendre égal des deux côtés", "category": "égalité", "grade_level": "1"},
        {"word": "même", "definition": "identique", "category": "égalité", "grade_level": "1"},
        
        // Mathematical thinking
        {"word": "raisonner", "definition": "utiliser la logique", "category": "pensée math", "grade_level": "1"},
        {"word": "justifier", "definition": "expliquer pourquoi", "category": "pensée math", "grade_level": "1"},
        {"word": "prouver", "definition": "montrer que c'est vrai", "category": "pensée math", "grade_level": "1"},
        {"word": "comprendre", "definition": "saisir le sens", "category": "pensée math", "grade_level": "1"},
        
        // Celebration vocabulary
        {"word": "célébrer", "definition": "fêter quelque chose", "category": "célébration", "grade_level": "1"},
        {"word": "réussite", "definition": "succès obtenu", "category": "célébration", "grade_level": "1"},
        {"word": "accomplissement", "definition": "chose réalisée", "category": "célébration", "grade_level": "1"},
        {"word": "progrès", "definition": "amélioration", "category": "célébration", "grade_level": "1"},
        {"word": "fierté", "definition": "sentiment de satisfaction", "category": "célébration", "grade_level": "1"},
        
        // Mathematical communication
        {"word": "partager", "definition": "montrer aux autres", "category": "communication", "grade_level": "1"},
        {"word": "expliquer", "definition": "faire comprendre", "category": "communication", "grade_level": "1"},
        {"word": "démontrer", "definition": "montrer en faisant", "category": "communication", "grade_level": "1"},
        {"word": "enseigner", "definition": "aider quelqu'un à apprendre", "category": "communication", "grade_level": "1"},
        
        // Portfolio concepts
        {"word": "portfolio", "definition": "collection de travaux", "category": "évaluation", "grade_level": "1"},
        {"word": "travail", "definition": "effort fait pour apprendre", "category": "évaluation", "grade_level": "1"},
        {"word": "amélioration", "definition": "devenir meilleur", "category": "évaluation", "grade_level": "1"},
        {"word": "effort", "definition": "énergie mise dans le travail", "category": "évaluation", "grade_level": "1"},
        
        // Mathematical confidence
        {"word": "confiant", "definition": "sûr de ses capacités", "category": "attitude", "grade_level": "1"},
        {"word": "persévérer", "definition": "continuer malgré les difficultés", "category": "attitude", "grade_level": "1"},
        {"word": "patient", "definition": "qui sait attendre", "category": "attitude", "grade_level": "1"},
        {"word": "curieux", "definition": "qui veut apprendre", "category": "attitude", "grade_level": "1"}
      ]
    }
  ];
  
  // Combine all vocabularies
  const allVocabularies = [...unitVocabularies, ...moreVocabularies];
  
  console.log('📝 ADDING VOCABULARY TO EACH MATHEMATICS UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < mathLRP.unitPlans.length; i++) {
    const unit = mathLRP.unitPlans[i];
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
    where: { longRangePlanId: mathLRP.id },
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
  
  console.log('\n📊 FINAL MATHEMATICS VOCABULARY STATISTICS:');
  console.log('═══════════════════════════════════════════');
  console.log(`📚 Total Mathematics Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 200) {
    console.log('\n🎉 SUCCESS! Mathematics vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate math vocabulary');
    console.log('✅ Connected to mathematical concepts and learning objectives');
    console.log('✅ Supports French immersion mathematics instruction');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeMathematicsVocabulary().catch(console.error);