import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeArtsVocabulary() {
  console.log('🎨 COMPLETING ARTS VOCABULARY\n');
  console.log('=============================');
  console.log('🎯 Creating Grade 1 appropriate arts vocabulary for 10 units');
  console.log('📝 15-25 words per unit, connected to artistic concepts');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query Arts LRP
  const artsLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Arts visuels' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!artsLRP) {
    console.log('❌ Arts LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${artsLRP.title}`);
  console.log(`📊 Units: ${artsLRP.unitPlans.length}\n`);
  
  // Comprehensive arts vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Premiers pas artistiques
      vocabulary: [
        // Basic art vocabulary
        {"word": "art", "definition": "création belle et expressive", "category": "art général", "grade_level": "1"},
        {"word": "artiste", "definition": "personne qui crée de l'art", "category": "art général", "grade_level": "1"},
        {"word": "création", "definition": "chose qu'on fait", "category": "processus", "grade_level": "1"},
        {"word": "créer", "definition": "faire quelque chose de nouveau", "category": "processus", "grade_level": "1"},
        {"word": "dessiner", "definition": "faire des traits", "category": "techniques", "grade_level": "1"},
        {"word": "dessin", "definition": "image faite avec des traits", "category": "œuvres", "grade_level": "1"},
        
        // Basic materials
        {"word": "crayon", "definition": "outil pour dessiner", "category": "matériaux", "grade_level": "1"},
        {"word": "papier", "definition": "surface pour dessiner", "category": "matériaux", "grade_level": "1"},
        {"word": "pinceau", "definition": "outil pour peindre", "category": "matériaux", "grade_level": "1"},
        {"word": "peinture", "definition": "couleur liquide", "category": "matériaux", "grade_level": "1"},
        {"word": "feutre", "definition": "crayon avec de l'encre", "category": "matériaux", "grade_level": "1"},
        {"word": "craie", "definition": "bâton pour colorier", "category": "matériaux", "grade_level": "1"},
        
        // Basic colors
        {"word": "couleur", "definition": "teinte qu'on voit", "category": "couleurs", "grade_level": "1"},
        {"word": "rouge", "definition": "couleur du sang", "category": "couleurs", "grade_level": "1"},
        {"word": "bleu", "definition": "couleur du ciel", "category": "couleurs", "grade_level": "1"},
        {"word": "jaune", "definition": "couleur du soleil", "category": "couleurs", "grade_level": "1"},
        {"word": "vert", "definition": "couleur de l'herbe", "category": "couleurs", "grade_level": "1"},
        {"word": "orange", "definition": "couleur du fruit", "category": "couleurs", "grade_level": "1"},
        {"word": "violet", "definition": "couleur des violettes", "category": "couleurs", "grade_level": "1"},
        
        // Basic art elements
        {"word": "ligne", "definition": "trait qu'on dessine", "category": "éléments", "grade_level": "1"},
        {"word": "point", "definition": "marque ronde", "category": "éléments", "grade_level": "1"},
        {"word": "forme", "definition": "contour d'un objet", "category": "éléments", "grade_level": "1"},
        
        // Creative process
        {"word": "observer", "definition": "regarder attentivement", "category": "processus", "grade_level": "1"},
        {"word": "imaginer", "definition": "créer dans sa tête", "category": "processus", "grade_level": "1"},
        {"word": "expérimenter", "definition": "essayer différentes façons", "category": "processus", "grade_level": "1"},
        {"word": "expression", "definition": "montrer ses sentiments", "category": "créativité", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: L'aventure des lignes et formes
      vocabulary: [
        // Line vocabulary
        {"word": "ligne", "definition": "trait continu", "category": "lignes", "grade_level": "1"},
        {"word": "droite", "definition": "ligne sans courbe", "category": "lignes", "grade_level": "1"},
        {"word": "courbe", "definition": "ligne qui tourne", "category": "lignes", "grade_level": "1"},
        {"word": "zigzag", "definition": "ligne avec des angles", "category": "lignes", "grade_level": "1"},
        {"word": "pointillé", "definition": "ligne faite de points", "category": "lignes", "grade_level": "1"},
        {"word": "épaisse", "definition": "ligne grosse", "category": "lignes", "grade_level": "1"},
        {"word": "fine", "definition": "ligne mince", "category": "lignes", "grade_level": "1"},
        
        // Shape vocabulary
        {"word": "forme", "definition": "contour d'un objet", "category": "formes", "grade_level": "1"},
        {"word": "cercle", "definition": "forme ronde", "category": "formes", "grade_level": "1"},
        {"word": "carré", "definition": "forme avec 4 côtés égaux", "category": "formes", "grade_level": "1"},
        {"word": "rectangle", "definition": "forme avec 4 côtés", "category": "formes", "grade_level": "1"},
        {"word": "triangle", "definition": "forme avec 3 côtés", "category": "formes", "grade_level": "1"},
        {"word": "ovale", "definition": "forme ronde allongée", "category": "formes", "grade_level": "1"},
        
        // Directions and movement
        {"word": "vertical", "definition": "ligne qui monte", "category": "directions", "grade_level": "1"},
        {"word": "horizontal", "definition": "ligne qui va de côté", "category": "directions", "grade_level": "1"},
        {"word": "diagonal", "definition": "ligne en biais", "category": "directions", "grade_level": "1"},
        {"word": "mouvement", "definition": "impression de bouger", "category": "expression", "grade_level": "1"},
        
        // Patterns
        {"word": "motif", "definition": "design qui se répète", "category": "patterns", "grade_level": "1"},
        {"word": "répéter", "definition": "faire encore", "category": "patterns", "grade_level": "1"},
        {"word": "alterné", "definition": "qui change de place", "category": "patterns", "grade_level": "1"},
        {"word": "régulier", "definition": "toujours pareil", "category": "patterns", "grade_level": "1"},
        
        // Composition
        {"word": "composition", "definition": "façon d'organiser", "category": "composition", "grade_level": "1"},
        {"word": "organiser", "definition": "mettre en place", "category": "composition", "grade_level": "1"},
        {"word": "équilibre", "definition": "tout est bien placé", "category": "composition", "grade_level": "1"},
        {"word": "centre", "definition": "milieu de l'image", "category": "composition", "grade_level": "1"},
        
        // Tools and techniques
        {"word": "règle", "definition": "outil pour tracer droit", "category": "outils", "grade_level": "1"},
        {"word": "tracer", "definition": "dessiner une ligne", "category": "techniques", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: La magie des couleurs
      vocabulary: [
        // Primary colors
        {"word": "primaire", "definition": "couleur de base", "category": "couleurs de base", "grade_level": "1"},
        {"word": "rouge", "definition": "couleur primaire chaude", "category": "couleurs de base", "grade_level": "1"},
        {"word": "bleu", "definition": "couleur primaire froide", "category": "couleurs de base", "grade_level": "1"},
        {"word": "jaune", "definition": "couleur primaire claire", "category": "couleurs de base", "grade_level": "1"},
        
        // Secondary colors
        {"word": "secondaire", "definition": "couleur mélangée", "category": "mélanges", "grade_level": "1"},
        {"word": "vert", "definition": "bleu et jaune mélangés", "category": "mélanges", "grade_level": "1"},
        {"word": "orange", "definition": "rouge et jaune mélangés", "category": "mélanges", "grade_level": "1"},
        {"word": "violet", "definition": "rouge et bleu mélangés", "category": "mélanges", "grade_level": "1"},
        
        // Color mixing
        {"word": "mélanger", "definition": "combiner des couleurs", "category": "techniques", "grade_level": "1"},
        {"word": "mélange", "definition": "nouvelle couleur créée", "category": "techniques", "grade_level": "1"},
        {"word": "palette", "definition": "surface pour mélanger", "category": "outils", "grade_level": "1"},
        
        // Color properties
        {"word": "clair", "definition": "couleur pâle", "category": "propriétés", "grade_level": "1"},
        {"word": "foncé", "definition": "couleur intense", "category": "propriétés", "grade_level": "1"},
        {"word": "brillant", "definition": "couleur qui brille", "category": "propriétés", "grade_level": "1"},
        {"word": "mat", "definition": "couleur qui ne brille pas", "category": "propriétés", "grade_level": "1"},
        {"word": "transparent", "definition": "couleur qu'on voit à travers", "category": "propriétés", "grade_level": "1"},
        
        // Color emotions
        {"word": "chaud", "definition": "couleur comme le feu", "category": "température", "grade_level": "1"},
        {"word": "froid", "definition": "couleur comme la glace", "category": "température", "grade_level": "1"},
        {"word": "joyeux", "definition": "couleur qui rend heureux", "category": "émotions", "grade_level": "1"},
        {"word": "calme", "definition": "couleur qui apaise", "category": "émotions", "grade_level": "1"},
        
        // Painting techniques
        {"word": "peindre", "definition": "appliquer de la couleur", "category": "techniques", "grade_level": "1"},
        {"word": "peinture", "definition": "couleur liquide", "category": "matériaux", "grade_level": "1"},
        {"word": "pinceau", "definition": "outil pour peindre", "category": "outils", "grade_level": "1"},
        {"word": "tamponer", "definition": "appuyer doucement", "category": "techniques", "grade_level": "1"},
        {"word": "étaler", "definition": "répandre la couleur", "category": "techniques", "grade_level": "1"},
        
        // Color effects
        {"word": "contraste", "definition": "différence entre couleurs", "category": "effets", "grade_level": "1"},
        {"word": "harmonie", "definition": "couleurs qui vont bien ensemble", "category": "effets", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Arts des fêtes hivernales
      vocabulary: [
        // Winter themes
        {"word": "hiver", "definition": "saison froide", "category": "saisons", "grade_level": "1"},
        {"word": "neige", "definition": "cristaux blancs", "category": "nature", "grade_level": "1"},
        {"word": "flocon", "definition": "petit morceau de neige", "category": "nature", "grade_level": "1"},
        {"word": "givre", "definition": "cristaux sur les surfaces", "category": "nature", "grade_level": "1"},
        {"word": "glace", "definition": "eau durcie par le froid", "category": "nature", "grade_level": "1"},
        
        // Holiday art
        {"word": "fête", "definition": "célébration joyeuse", "category": "célébrations", "grade_level": "1"},
        {"word": "décoration", "definition": "objet pour embellir", "category": "célébrations", "grade_level": "1"},
        {"word": "ornement", "definition": "objet décoratif", "category": "célébrations", "grade_level": "1"},
        {"word": "guirlande", "definition": "décoration en chaîne", "category": "célébrations", "grade_level": "1"},
        {"word": "carte", "definition": "message décoré", "category": "créations", "grade_level": "1"},
        
        // Light and winter colors
        {"word": "lumière", "definition": "clarté qui éclaire", "category": "effets", "grade_level": "1"},
        {"word": "scintiller", "definition": "briller par petits éclats", "category": "effets", "grade_level": "1"},
        {"word": "blanc", "definition": "couleur de la neige", "category": "couleurs", "grade_level": "1"},
        {"word": "argent", "definition": "couleur métallique claire", "category": "couleurs", "grade_level": "1"},
        {"word": "or", "definition": "couleur métallique dorée", "category": "couleurs", "grade_level": "1"},
        
        // Craft techniques
        {"word": "découper", "definition": "couper avec des ciseaux", "category": "techniques", "grade_level": "1"},
        {"word": "coller", "definition": "attacher avec de la colle", "category": "techniques", "grade_level": "1"},
        {"word": "plier", "definition": "rabattre sur soi", "category": "techniques", "grade_level": "1"},
        {"word": "assembler", "definition": "mettre ensemble", "category": "techniques", "grade_level": "1"},
        
        // Materials
        {"word": "papier", "definition": "matériau fin", "category": "matériaux", "grade_level": "1"},
        {"word": "carton", "definition": "papier épais", "category": "matériaux", "grade_level": "1"},
        {"word": "tissu", "definition": "matériau souple", "category": "matériaux", "grade_level": "1"},
        {"word": "brillant", "definition": "matériau qui scintille", "category": "matériaux", "grade_level": "1"},
        {"word": "ciseaux", "definition": "outil pour couper", "category": "outils", "grade_level": "1"},
        {"word": "colle", "definition": "produit pour attacher", "category": "outils", "grade_level": "1"},
        
        // Cultural elements
        {"word": "tradition", "definition": "habitude qu'on garde", "category": "culture", "grade_level": "1"},
        {"word": "symbole", "definition": "objet qui représente", "category": "culture", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Textures et matériaux
      vocabulary: [
        // Texture vocabulary
        {"word": "texture", "definition": "sensation au toucher", "category": "textures", "grade_level": "1"},
        {"word": "toucher", "definition": "sentir avec les doigts", "category": "sens", "grade_level": "1"},
        {"word": "lisse", "definition": "surface sans rugosité", "category": "textures", "grade_level": "1"},
        {"word": "rugueux", "definition": "surface avec des bosses", "category": "textures", "grade_level": "1"},
        {"word": "doux", "definition": "agréable au toucher", "category": "textures", "grade_level": "1"},
        {"word": "rude", "definition": "désagréable au toucher", "category": "textures", "grade_level": "1"},
        {"word": "moelleux", "definition": "souple et confortable", "category": "textures", "grade_level": "1"},
        {"word": "dur", "definition": "résistant à la pression", "category": "textures", "grade_level": "1"},
        
        // Materials
        {"word": "matériau", "definition": "substance pour créer", "category": "matériaux", "grade_level": "1"},
        {"word": "sable", "definition": "petits grains", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "coquillage", "definition": "maison d'animal marin", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "feuille", "definition": "partie de la plante", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "bois", "definition": "matériau de l'arbre", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "pierre", "definition": "roche dure", "category": "matériaux naturels", "grade_level": "1"},
        
        // Fabric and soft materials
        {"word": "tissu", "definition": "matériau souple", "category": "matériaux souples", "grade_level": "1"},
        {"word": "laine", "definition": "fibres d'animal", "category": "matériaux souples", "grade_level": "1"},
        {"word": "coton", "definition": "fibres de plante", "category": "matériaux souples", "grade_level": "1"},
        {"word": "feutre", "definition": "tissu épais", "category": "matériaux souples", "grade_level": "1"},
        {"word": "soie", "definition": "fil brillant", "category": "matériaux souples", "grade_level": "1"},
        
        // Collage techniques
        {"word": "collage", "definition": "art de coller ensemble", "category": "techniques", "grade_level": "1"},
        {"word": "coller", "definition": "fixer avec de la colle", "category": "techniques", "grade_level": "1"},
        {"word": "superposer", "definition": "mettre l'un sur l'autre", "category": "techniques", "grade_level": "1"},
        {"word": "juxtaposer", "definition": "mettre côte à côte", "category": "techniques", "grade_level": "1"},
        
        // Artistic effects
        {"word": "relief", "definition": "surface qui ressort", "category": "effets", "grade_level": "1"},
        {"word": "contraste", "definition": "différence marquée", "category": "effets", "grade_level": "1"},
        {"word": "motif", "definition": "design décoratif", "category": "design", "grade_level": "1"},
        {"word": "impression", "definition": "marque laissée", "category": "techniques", "grade_level": "1"}
      ]
    }
  ];
  
  // Continue with units 6-10
  const moreVocabularies = [
    {
      // Unit 6: Impression et motifs
      vocabulary: [
        // Printing vocabulary
        {"word": "impression", "definition": "marque faite par pression", "category": "impression", "grade_level": "1"},
        {"word": "imprimer", "definition": "faire une marque", "category": "impression", "grade_level": "1"},
        {"word": "estampe", "definition": "image imprimée", "category": "impression", "grade_level": "1"},
        {"word": "empreinte", "definition": "marque laissée", "category": "impression", "grade_level": "1"},
        {"word": "tampon", "definition": "objet pour imprimer", "category": "outils", "grade_level": "1"},
        {"word": "rouleau", "definition": "cylindre pour étaler", "category": "outils", "grade_level": "1"},
        
        // Pattern vocabulary
        {"word": "motif", "definition": "design qui se répète", "category": "motifs", "grade_level": "1"},
        {"word": "répétition", "definition": "action de refaire", "category": "motifs", "grade_level": "1"},
        {"word": "rythme", "definition": "répétition régulière", "category": "motifs", "grade_level": "1"},
        {"word": "symétrie", "definition": "équilibre des deux côtés", "category": "motifs", "grade_level": "1"},
        {"word": "alternance", "definition": "changement régulier", "category": "motifs", "grade_level": "1"},
        
        // Simple printing materials
        {"word": "pomme de terre", "definition": "légume pour tampon", "category": "matériaux", "grade_level": "1"},
        {"word": "éponge", "definition": "objet qui absorbe", "category": "matériaux", "grade_level": "1"},
        {"word": "bouchon", "definition": "objet rond pour tampon", "category": "matériaux", "grade_level": "1"},
        {"word": "feuille", "definition": "partie de plante", "category": "matériaux", "grade_level": "1"},
        
        // Printing techniques
        {"word": "presser", "definition": "appuyer fort", "category": "techniques", "grade_level": "1"},
        {"word": "encrer", "definition": "mettre de l'encre", "category": "techniques", "grade_level": "1"},
        {"word": "reporter", "definition": "transférer l'image", "category": "techniques", "grade_level": "1"},
        {"word": "sécher", "definition": "laisser s'évaporer", "category": "techniques", "grade_level": "1"},
        
        // Design concepts
        {"word": "géométrique", "definition": "avec des formes précises", "category": "design", "grade_level": "1"},
        {"word": "naturel", "definition": "qui vient de la nature", "category": "design", "grade_level": "1"},
        {"word": "abstrait", "definition": "qui ne représente rien", "category": "design", "grade_level": "1"},
        {"word": "décoratif", "definition": "fait pour embellir", "category": "design", "grade_level": "1"},
        
        // Visual effects
        {"word": "superposition", "definition": "mettre l'un sur l'autre", "category": "effets", "grade_level": "1"},
        {"word": "transparence", "definition": "qu'on voit à travers", "category": "effets", "grade_level": "1"},
        {"word": "opacité", "definition": "qu'on ne voit pas à travers", "category": "effets", "grade_level": "1"},
        {"word": "netteté", "definition": "clarté de l'image", "category": "qualité", "grade_level": "1"}
      ]
    },
    {
      // Unit 7: Exploration 3D et sculpture
      vocabulary: [
        // 3D vocabulary
        {"word": "tridimensionnel", "definition": "qui a longueur, largeur et hauteur", "category": "3D", "grade_level": "1"},
        {"word": "volume", "definition": "espace occupé", "category": "3D", "grade_level": "1"},
        {"word": "sculpture", "definition": "art en trois dimensions", "category": "3D", "grade_level": "1"},
        {"word": "sculpter", "definition": "créer en trois dimensions", "category": "techniques", "grade_level": "1"},
        {"word": "hauteur", "definition": "dimension verticale", "category": "dimensions", "grade_level": "1"},
        {"word": "largeur", "definition": "dimension horizontale", "category": "dimensions", "grade_level": "1"},
        {"word": "profondeur", "definition": "dimension vers l'arrière", "category": "dimensions", "grade_level": "1"},
        
        // Sculpture materials
        {"word": "argile", "definition": "terre molle pour modeler", "category": "matériaux", "grade_level": "1"},
        {"word": "pâte à modeler", "definition": "matériau souple coloré", "category": "matériaux", "grade_level": "1"},
        {"word": "sable", "definition": "petits grains pour construire", "category": "matériaux", "grade_level": "1"},
        {"word": "blocs", "definition": "pièces pour construire", "category": "matériaux", "grade_level": "1"},
        {"word": "carton", "definition": "papier épais", "category": "matériaux", "grade_level": "1"},
        
        // Sculpting techniques
        {"word": "modeler", "definition": "façonner avec les mains", "category": "techniques", "grade_level": "1"},
        {"word": "pincer", "definition": "serrer avec les doigts", "category": "techniques", "grade_level": "1"},
        {"word": "rouler", "definition": "faire des formes rondes", "category": "techniques", "grade_level": "1"},
        {"word": "aplatir", "definition": "rendre plat", "category": "techniques", "grade_level": "1"},
        {"word": "creuser", "definition": "faire un trou", "category": "techniques", "grade_level": "1"},
        {"word": "assembler", "definition": "mettre ensemble", "category": "techniques", "grade_level": "1"},
        
        // 3D shapes
        {"word": "cube", "definition": "forme carrée en 3D", "category": "formes 3D", "grade_level": "1"},
        {"word": "sphère", "definition": "forme ronde comme une balle", "category": "formes 3D", "grade_level": "1"},
        {"word": "cylindre", "definition": "forme comme un tube", "category": "formes 3D", "grade_level": "1"},
        {"word": "pyramide", "definition": "forme pointue", "category": "formes 3D", "grade_level": "1"},
        
        // Spatial concepts
        {"word": "équilibre", "definition": "stabilité de la forme", "category": "composition", "grade_level": "1"},
        {"word": "stable", "definition": "qui ne tombe pas", "category": "composition", "grade_level": "1"},
        {"word": "fragile", "definition": "qui se casse facilement", "category": "propriétés", "grade_level": "1"},
        {"word": "solide", "definition": "résistant et fort", "category": "propriétés", "grade_level": "1"},
        
        // Construction
        {"word": "construire", "definition": "bâtir", "category": "processus", "grade_level": "1"},
        {"word": "empiler", "definition": "mettre l'un sur l'autre", "category": "processus", "grade_level": "1"}
      ]
    },
    {
      // Unit 8: Art environnemental printanier
      vocabulary: [
        // Spring themes
        {"word": "printemps", "definition": "saison du renouveau", "category": "saisons", "grade_level": "1"},
        {"word": "renouveau", "definition": "recommencement", "category": "nature", "grade_level": "1"},
        {"word": "croissance", "definition": "fait de grandir", "category": "nature", "grade_level": "1"},
        {"word": "bourgeon", "definition": "début d'une nouvelle pousse", "category": "nature", "grade_level": "1"},
        {"word": "fleur", "definition": "partie colorée de la plante", "category": "nature", "grade_level": "1"},
        {"word": "pétale", "definition": "partie de la fleur", "category": "nature", "grade_level": "1"},
        
        // Environmental art
        {"word": "environnement", "definition": "nature qui nous entoure", "category": "environnement", "grade_level": "1"},
        {"word": "naturel", "definition": "qui vient de la nature", "category": "environnement", "grade_level": "1"},
        {"word": "écologique", "definition": "qui respecte la nature", "category": "environnement", "grade_level": "1"},
        {"word": "recycler", "definition": "utiliser à nouveau", "category": "environnement", "grade_level": "1"},
        {"word": "réutiliser", "definition": "utiliser encore", "category": "environnement", "grade_level": "1"},
        
        // Natural materials
        {"word": "branche", "definition": "partie de l'arbre", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "bâton", "definition": "morceau de bois", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "caillou", "definition": "petite pierre", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "graine", "definition": "début d'une plante", "category": "matériaux naturels", "grade_level": "1"},
        {"word": "mousse", "definition": "petite plante verte", "category": "matériaux naturels", "grade_level": "1"},
        
        // Outdoor art techniques
        {"word": "land art", "definition": "art fait dans la nature", "category": "techniques", "grade_level": "1"},
        {"word": "installation", "definition": "art arrangé dans l'espace", "category": "techniques", "grade_level": "1"},
        {"word": "arrangement", "definition": "façon d'organiser", "category": "techniques", "grade_level": "1"},
        {"word": "éphémère", "definition": "qui ne dure pas longtemps", "category": "concepts", "grade_level": "1"},
        
        // Spring colors
        {"word": "tendre", "definition": "couleur douce", "category": "couleurs", "grade_level": "1"},
        {"word": "pastel", "definition": "couleur pâle", "category": "couleurs", "grade_level": "1"},
        {"word": "vif", "definition": "couleur intense", "category": "couleurs", "grade_level": "1"},
        {"word": "frais", "definition": "couleur claire", "category": "couleurs", "grade_level": "1"},
        
        // Art and nature connection
        {"word": "observer", "definition": "regarder la nature", "category": "processus", "grade_level": "1"},
        {"word": "inspirer", "definition": "donner des idées", "category": "processus", "grade_level": "1"},
        {"word": "imiter", "definition": "copier la nature", "category": "processus", "grade_level": "1"},
        {"word": "respecter", "definition": "prendre soin de", "category": "valeurs", "grade_level": "1"}
      ]
    },
    {
      // Unit 9: Techniques artistiques avancées
      vocabulary: [
        // Advanced techniques
        {"word": "technique", "definition": "façon de faire", "category": "techniques", "grade_level": "1"},
        {"word": "maîtrise", "definition": "bien savoir faire", "category": "compétences", "grade_level": "1"},
        {"word": "habileté", "definition": "capacité à bien faire", "category": "compétences", "grade_level": "1"},
        {"word": "précision", "definition": "exactitude du geste", "category": "compétences", "grade_level": "1"},
        
        // Mixed media
        {"word": "média", "definition": "matériau artistique", "category": "matériaux", "grade_level": "1"},
        {"word": "mélange", "definition": "combinaison de techniques", "category": "techniques", "grade_level": "1"},
        {"word": "combiner", "definition": "utiliser ensemble", "category": "techniques", "grade_level": "1"},
        {"word": "superposer", "definition": "mettre par-dessus", "category": "techniques", "grade_level": "1"},
        
        // Advanced painting
        {"word": "dégradé", "definition": "passage graduel de couleur", "category": "peinture", "grade_level": "1"},
        {"word": "fondu", "definition": "mélange doux", "category": "peinture", "grade_level": "1"},
        {"word": "ombrage", "definition": "zones sombres", "category": "peinture", "grade_level": "1"},
        {"word": "lumière", "definition": "zones claires", "category": "peinture", "grade_level": "1"},
        
        // Drawing techniques
        {"word": "esquisse", "definition": "dessin rapide", "category": "dessin", "grade_level": "1"},
        {"word": "croquis", "definition": "dessin simple", "category": "dessin", "grade_level": "1"},
        {"word": "détail", "definition": "petite partie précise", "category": "dessin", "grade_level": "1"},
        {"word": "proportion", "definition": "taille comparée", "category": "dessin", "grade_level": "1"},
        
        // Artistic styles
        {"word": "style", "definition": "façon personnelle de faire", "category": "styles", "grade_level": "1"},
        {"word": "réaliste", "definition": "qui ressemble au vrai", "category": "styles", "grade_level": "1"},
        {"word": "imaginaire", "definition": "qui vient de l'imagination", "category": "styles", "grade_level": "1"},
        {"word": "expressif", "definition": "qui montre des émotions", "category": "styles", "grade_level": "1"},
        
        // Art tools
        {"word": "palette", "definition": "planche pour mélanger", "category": "outils", "grade_level": "1"},
        {"word": "chevalet", "definition": "support pour peindre", "category": "outils", "grade_level": "1"},
        {"word": "spatule", "definition": "outil plat pour étaler", "category": "outils", "grade_level": "1"},
        
        // Artistic effects
        {"word": "effet", "definition": "résultat visuel", "category": "effets", "grade_level": "1"},
        {"word": "contraste", "definition": "différence marquée", "category": "effets", "grade_level": "1"},
        {"word": "harmonie", "definition": "accord agréable", "category": "effets", "grade_level": "1"},
        {"word": "dynamisme", "definition": "impression de mouvement", "category": "effets", "grade_level": "1"}
      ]
    },
    {
      // Unit 10: Notre galerie d'art française
      vocabulary: [
        // Gallery vocabulary
        {"word": "galerie", "definition": "lieu d'exposition d'art", "category": "exposition", "grade_level": "1"},
        {"word": "exposition", "definition": "présentation d'œuvres", "category": "exposition", "grade_level": "1"},
        {"word": "œuvre", "definition": "création artistique", "category": "art", "grade_level": "1"},
        {"word": "collection", "definition": "groupe d'œuvres", "category": "exposition", "grade_level": "1"},
        {"word": "présenter", "definition": "montrer au public", "category": "exposition", "grade_level": "1"},
        {"word": "encadrer", "definition": "mettre dans un cadre", "category": "présentation", "grade_level": "1"},
        
        // Art appreciation
        {"word": "admirer", "definition": "regarder avec plaisir", "category": "appréciation", "grade_level": "1"},
        {"word": "apprécier", "definition": "reconnaître la beauté", "category": "appréciation", "grade_level": "1"},
        {"word": "beauté", "definition": "qualité de ce qui est beau", "category": "esthétique", "grade_level": "1"},
        {"word": "esthétique", "definition": "sens du beau", "category": "esthétique", "grade_level": "1"},
        {"word": "critique", "definition": "commentaire sur l'art", "category": "appréciation", "grade_level": "1"},
        
        // Reflection and growth
        {"word": "progrès", "definition": "amélioration des capacités", "category": "développement", "grade_level": "1"},
        {"word": "développement", "definition": "croissance des compétences", "category": "développement", "grade_level": "1"},
        {"word": "réflexion", "definition": "pensée sur son travail", "category": "développement", "grade_level": "1"},
        {"word": "amélioration", "definition": "devenir meilleur", "category": "développement", "grade_level": "1"},
        
        // Portfolio concepts
        {"word": "portfolio", "definition": "collection de ses œuvres", "category": "portfolio", "grade_level": "1"},
        {"word": "sélection", "definition": "choix des meilleures œuvres", "category": "portfolio", "grade_level": "1"},
        {"word": "favori", "definition": "œuvre qu'on préfère", "category": "portfolio", "grade_level": "1"},
        
        // Sharing art
        {"word": "partager", "definition": "montrer aux autres", "category": "communication", "grade_level": "1"},
        {"word": "expliquer", "definition": "dire comment on a fait", "category": "communication", "grade_level": "1"},
        {"word": "inspiration", "definition": "idée qui donne envie de créer", "category": "créativité", "grade_level": "1"},
        {"word": "fierté", "definition": "sentiment de satisfaction", "category": "émotions", "grade_level": "1"},
        
        // Art community
        {"word": "artiste", "definition": "personne qui crée de l'art", "category": "communauté", "grade_level": "1"},
        {"word": "public", "definition": "personnes qui regardent", "category": "communauté", "grade_level": "1"},
        {"word": "visiteur", "definition": "personne qui vient voir", "category": "communauté", "grade_level": "1"},
        
        // Celebration
        {"word": "célébrer", "definition": "fêter les réussites", "category": "célébration", "grade_level": "1"},
        {"word": "accomplissement", "definition": "réussite personnelle", "category": "célébration", "grade_level": "1"},
        {"word": "réussite", "definition": "succès artistique", "category": "célébration", "grade_level": "1"}
      ]
    }
  ];
  
  // Combine all vocabularies
  const allVocabularies = [...unitVocabularies, ...moreVocabularies];
  
  console.log('📝 ADDING VOCABULARY TO EACH ARTS UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < artsLRP.unitPlans.length; i++) {
    const unit = artsLRP.unitPlans[i];
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
    where: { longRangePlanId: artsLRP.id },
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
  
  console.log('\n📊 FINAL ARTS VOCABULARY STATISTICS:');
  console.log('═══════════════════════════════════════');
  console.log(`📚 Total Arts Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 200) {
    console.log('\n🎉 SUCCESS! Arts vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate arts vocabulary');
    console.log('✅ Connected to artistic elements, techniques, and creative processes');
    console.log('✅ Supports French immersion arts instruction');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeArtsVocabulary().catch(console.error);