import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeScienceVocabulary() {
  console.log('🔬 COMPLETING SCIENCE VOCABULARY\n');
  console.log('=================================');
  console.log('🎯 Creating Grade 1 appropriate science vocabulary for 10 units');
  console.log('📝 15-25 words per unit, connected to scientific concepts');
  console.log('🇫🇷 All in French for immersion instruction\n');
  
  // Query Science LRP
  const scienceLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Sciences de la nature' } },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!scienceLRP) {
    console.log('❌ Science LRP not found');
    return;
  }
  
  console.log(`📖 Found: ${scienceLRP.title}`);
  console.log(`📊 Units: ${scienceLRP.unitPlans.length}\n`);
  
  // Comprehensive science vocabulary for each unit
  const unitVocabularies = [
    {
      // Unit 1: Petits scientifiques sécuritaires
      vocabulary: [
        // Safety vocabulary
        {"word": "sécurité", "definition": "état d'être protégé du danger", "category": "sécurité", "grade_level": "1"},
        {"word": "sûr", "definition": "sans danger", "category": "sécurité", "grade_level": "1"},
        {"word": "danger", "definition": "risque de se blesser", "category": "sécurité", "grade_level": "1"},
        {"word": "prudent", "definition": "qui fait attention", "category": "sécurité", "grade_level": "1"},
        {"word": "attention", "definition": "fait de faire très attention", "category": "sécurité", "grade_level": "1"},
        {"word": "protéger", "definition": "garder en sécurité", "category": "sécurité", "grade_level": "1"},
        {"word": "lunettes", "definition": "protection pour les yeux", "category": "sécurité", "grade_level": "1"},
        {"word": "gants", "definition": "protection pour les mains", "category": "sécurité", "grade_level": "1"},
        
        // Scientific method
        {"word": "scientifique", "definition": "personne qui étudie la nature", "category": "science", "grade_level": "1"},
        {"word": "observer", "definition": "regarder attentivement", "category": "méthode", "grade_level": "1"},
        {"word": "découvrir", "definition": "trouver quelque chose de nouveau", "category": "méthode", "grade_level": "1"},
        {"word": "explorer", "definition": "examiner pour apprendre", "category": "méthode", "grade_level": "1"},
        {"word": "expérience", "definition": "test pour apprendre", "category": "méthode", "grade_level": "1"},
        {"word": "question", "definition": "demande pour apprendre", "category": "méthode", "grade_level": "1"},
        {"word": "réponse", "definition": "ce qu'on découvre", "category": "méthode", "grade_level": "1"},
        
        // Scientific tools
        {"word": "loupe", "definition": "outil pour voir plus grand", "category": "outils", "grade_level": "1"},
        {"word": "balance", "definition": "outil pour peser", "category": "outils", "grade_level": "1"},
        {"word": "règle", "definition": "outil pour mesurer", "category": "outils", "grade_level": "1"},
        {"word": "thermomètre", "definition": "outil pour mesurer la température", "category": "outils", "grade_level": "1"},
        
        // Recording observations
        {"word": "noter", "definition": "écrire ce qu'on observe", "category": "enregistrement", "grade_level": "1"},
        {"word": "dessiner", "definition": "faire un dessin de ce qu'on voit", "category": "enregistrement", "grade_level": "1"},
        {"word": "mesurer", "definition": "trouver la taille ou le poids", "category": "enregistrement", "grade_level": "1"},
        {"word": "comparer", "definition": "voir les différences", "category": "enregistrement", "grade_level": "1"},
        
        // Basic science concepts
        {"word": "nature", "definition": "le monde autour de nous", "category": "concepts", "grade_level": "1"},
        {"word": "environnement", "definition": "lieu où vivent les êtres", "category": "concepts", "grade_level": "1"}
      ]
    },
    {
      // Unit 2: Matériaux de notre environnement
      vocabulary: [
        // Materials vocabulary
        {"word": "matériau", "definition": "substance dont sont faits les objets", "category": "matériaux", "grade_level": "1"},
        {"word": "bois", "definition": "matériau qui vient des arbres", "category": "matériaux", "grade_level": "1"},
        {"word": "métal", "definition": "matériau dur et brillant", "category": "matériaux", "grade_level": "1"},
        {"word": "plastique", "definition": "matériau fait par les humains", "category": "matériaux", "grade_level": "1"},
        {"word": "verre", "definition": "matériau transparent et cassant", "category": "matériaux", "grade_level": "1"},
        {"word": "tissu", "definition": "matériau fait de fibres", "category": "matériaux", "grade_level": "1"},
        {"word": "papier", "definition": "matériau fin pour écrire", "category": "matériaux", "grade_level": "1"},
        {"word": "pierre", "definition": "matériau dur de la nature", "category": "matériaux", "grade_level": "1"},
        
        // Properties of materials
        {"word": "dur", "definition": "difficile à casser", "category": "propriétés", "grade_level": "1"},
        {"word": "mou", "definition": "facile à presser", "category": "propriétés", "grade_level": "1"},
        {"word": "lisse", "definition": "surface sans rugosité", "category": "propriétés", "grade_level": "1"},
        {"word": "rugueux", "definition": "surface avec des bosses", "category": "propriétés", "grade_level": "1"},
        {"word": "brillant", "definition": "qui réfléchit la lumière", "category": "propriétés", "grade_level": "1"},
        {"word": "mat", "definition": "qui ne brille pas", "category": "propriétés", "grade_level": "1"},
        {"word": "lourd", "definition": "qui pèse beaucoup", "category": "propriétés", "grade_level": "1"},
        {"word": "léger", "definition": "qui pèse peu", "category": "propriétés", "grade_level": "1"},
        {"word": "flexible", "definition": "qui peut se plier", "category": "propriétés", "grade_level": "1"},
        {"word": "rigide", "definition": "qui ne peut pas se plier", "category": "propriétés", "grade_level": "1"},
        
        // Uses of materials
        {"word": "utiliser", "definition": "se servir de quelque chose", "category": "utilisation", "grade_level": "1"},
        {"word": "fabriquer", "definition": "faire quelque chose", "category": "utilisation", "grade_level": "1"},
        {"word": "construire", "definition": "bâtir avec des matériaux", "category": "utilisation", "grade_level": "1"},
        {"word": "réparer", "definition": "remettre en bon état", "category": "utilisation", "grade_level": "1"},
        
        // Environmental concepts
        {"word": "recycler", "definition": "utiliser à nouveau", "category": "environnement", "grade_level": "1"},
        {"word": "réutiliser", "definition": "utiliser encore", "category": "environnement", "grade_level": "1"},
        {"word": "déchets", "definition": "objets qu'on jette", "category": "environnement", "grade_level": "1"}
      ]
    },
    {
      // Unit 3: Changements saisonniers d'automne
      vocabulary: [
        // Seasonal vocabulary
        {"word": "saison", "definition": "période de l'année avec des caractéristiques", "category": "saisons", "grade_level": "1"},
        {"word": "automne", "definition": "saison entre l'été et l'hiver", "category": "saisons", "grade_level": "1"},
        {"word": "changement", "definition": "devenir différent", "category": "changements", "grade_level": "1"},
        {"word": "transformation", "definition": "grand changement", "category": "changements", "grade_level": "1"},
        
        // Weather vocabulary
        {"word": "temps", "definition": "conditions atmosphériques", "category": "météo", "grade_level": "1"},
        {"word": "température", "definition": "degré de chaud ou froid", "category": "météo", "grade_level": "1"},
        {"word": "froid", "definition": "température basse", "category": "météo", "grade_level": "1"},
        {"word": "frais", "definition": "un peu froid", "category": "météo", "grade_level": "1"},
        {"word": "vent", "definition": "air qui bouge", "category": "météo", "grade_level": "1"},
        {"word": "nuage", "definition": "masse blanche dans le ciel", "category": "météo", "grade_level": "1"},
        {"word": "pluie", "definition": "eau qui tombe du ciel", "category": "météo", "grade_level": "1"},
        
        // Plant changes
        {"word": "feuille", "definition": "partie verte de la plante", "category": "plantes", "grade_level": "1"},
        {"word": "arbre", "definition": "grande plante avec un tronc", "category": "plantes", "grade_level": "1"},
        {"word": "branche", "definition": "partie de l'arbre", "category": "plantes", "grade_level": "1"},
        {"word": "tomber", "definition": "descendre vers le sol", "category": "changements", "grade_level": "1"},
        {"word": "changer", "definition": "devenir différent", "category": "changements", "grade_level": "1"},
        {"word": "jaunir", "definition": "devenir jaune", "category": "changements", "grade_level": "1"},
        {"word": "rougir", "definition": "devenir rouge", "category": "changements", "grade_level": "1"},
        
        // Animal behavior
        {"word": "animal", "definition": "être vivant qui bouge", "category": "animaux", "grade_level": "1"},
        {"word": "préparer", "definition": "se préparer pour l'hiver", "category": "comportements", "grade_level": "1"},
        {"word": "migration", "definition": "voyage vers un endroit chaud", "category": "comportements", "grade_level": "1"},
        {"word": "hibernation", "definition": "long sommeil d'hiver", "category": "comportements", "grade_level": "1"},
        {"word": "fourrure", "definition": "poils d'animal", "category": "adaptations", "grade_level": "1"},
        
        // Observation vocabulary
        {"word": "remarquer", "definition": "voir quelque chose", "category": "observation", "grade_level": "1"},
        {"word": "observer", "definition": "regarder attentivement", "category": "observation", "grade_level": "1"}
      ]
    },
    {
      // Unit 4: Lumière et chaleur hivernales
      vocabulary: [
        // Light vocabulary
        {"word": "lumière", "definition": "clarté qui permet de voir", "category": "lumière", "grade_level": "1"},
        {"word": "soleil", "definition": "étoile qui éclaire la Terre", "category": "lumière", "grade_level": "1"},
        {"word": "rayons", "definition": "lignes de lumière", "category": "lumière", "grade_level": "1"},
        {"word": "brillant", "definition": "qui produit beaucoup de lumière", "category": "lumière", "grade_level": "1"},
        {"word": "sombre", "definition": "avec peu de lumière", "category": "lumière", "grade_level": "1"},
        {"word": "ombre", "definition": "zone sans lumière", "category": "lumière", "grade_level": "1"},
        {"word": "éclairer", "definition": "donner de la lumière", "category": "lumière", "grade_level": "1"},
        {"word": "ampoule", "definition": "objet qui produit de la lumière", "category": "lumière", "grade_level": "1"},
        
        // Heat vocabulary
        {"word": "chaleur", "definition": "sensation de chaud", "category": "chaleur", "grade_level": "1"},
        {"word": "chaud", "definition": "température élevée", "category": "chaleur", "grade_level": "1"},
        {"word": "tiède", "definition": "un peu chaud", "category": "chaleur", "grade_level": "1"},
        {"word": "réchauffer", "definition": "rendre plus chaud", "category": "chaleur", "grade_level": "1"},
        {"word": "refroidir", "definition": "rendre plus froid", "category": "chaleur", "grade_level": "1"},
        {"word": "chauffage", "definition": "système pour réchauffer", "category": "chaleur", "grade_level": "1"},
        
        // Winter vocabulary
        {"word": "hiver", "definition": "saison la plus froide", "category": "saisons", "grade_level": "1"},
        {"word": "neige", "definition": "cristaux d'eau gelée", "category": "hiver", "grade_level": "1"},
        {"word": "glace", "definition": "eau durcie par le froid", "category": "hiver", "grade_level": "1"},
        {"word": "gel", "definition": "température sous zéro", "category": "hiver", "grade_level": "1"},
        {"word": "givre", "definition": "cristaux sur les surfaces", "category": "hiver", "grade_level": "1"},
        
        // Sources of heat and light
        {"word": "feu", "definition": "flammes qui donnent chaleur et lumière", "category": "sources", "grade_level": "1"},
        {"word": "bougie", "definition": "objet qui brûle pour éclairer", "category": "sources", "grade_level": "1"},
        {"word": "lampe", "definition": "objet pour éclairer", "category": "sources", "grade_level": "1"},
        {"word": "radiateur", "definition": "objet qui donne de la chaleur", "category": "sources", "grade_level": "1"},
        
        // Properties
        {"word": "transparent", "definition": "qui laisse passer la lumière", "category": "propriétés", "grade_level": "1"},
        {"word": "opaque", "definition": "qui ne laisse pas passer la lumière", "category": "propriétés", "grade_level": "1"},
        {"word": "réfléchir", "definition": "renvoyer la lumière", "category": "propriétés", "grade_level": "1"}
      ]
    },
    {
      // Unit 5: Croissance et besoins des vivants
      vocabulary: [
        // Living things vocabulary
        {"word": "vivant", "definition": "qui a la vie", "category": "vie", "grade_level": "1"},
        {"word": "non-vivant", "definition": "qui n'a pas la vie", "category": "vie", "grade_level": "1"},
        {"word": "grandir", "definition": "devenir plus grand", "category": "croissance", "grade_level": "1"},
        {"word": "croissance", "definition": "fait de grandir", "category": "croissance", "grade_level": "1"},
        {"word": "développer", "definition": "grandir et changer", "category": "croissance", "grade_level": "1"},
        
        // Plant vocabulary
        {"word": "plante", "definition": "être vivant qui pousse", "category": "plantes", "grade_level": "1"},
        {"word": "graine", "definition": "début d'une plante", "category": "plantes", "grade_level": "1"},
        {"word": "racine", "definition": "partie sous terre", "category": "plantes", "grade_level": "1"},
        {"word": "tige", "definition": "partie droite de la plante", "category": "plantes", "grade_level": "1"},
        {"word": "feuille", "definition": "partie verte", "category": "plantes", "grade_level": "1"},
        {"word": "fleur", "definition": "partie colorée", "category": "plantes", "grade_level": "1"},
        {"word": "fruit", "definition": "partie qui contient les graines", "category": "plantes", "grade_level": "1"},
        
        // Basic needs
        {"word": "besoin", "definition": "ce qui est nécessaire", "category": "besoins", "grade_level": "1"},
        {"word": "eau", "definition": "liquide transparent", "category": "besoins", "grade_level": "1"},
        {"word": "nourriture", "definition": "ce qu'on mange", "category": "besoins", "grade_level": "1"},
        {"word": "air", "definition": "gaz qu'on respire", "category": "besoins", "grade_level": "1"},
        {"word": "abri", "definition": "endroit pour se protéger", "category": "besoins", "grade_level": "1"},
        {"word": "espace", "definition": "place pour grandir", "category": "besoins", "grade_level": "1"},
        
        // Life processes
        {"word": "respirer", "definition": "prendre de l'air", "category": "processus", "grade_level": "1"},
        {"word": "manger", "definition": "prendre de la nourriture", "category": "processus", "grade_level": "1"},
        {"word": "boire", "definition": "prendre de l'eau", "category": "processus", "grade_level": "1"},
        {"word": "dormir", "definition": "se reposer", "category": "processus", "grade_level": "1"},
        
        // Animal vocabulary
        {"word": "animal", "definition": "être vivant qui bouge", "category": "animaux", "grade_level": "1"},
        {"word": "bébé", "definition": "jeune animal", "category": "animaux", "grade_level": "1"},
        {"word": "parent", "definition": "mère ou père", "category": "animaux", "grade_level": "1"},
        {"word": "famille", "definition": "groupe d'animaux apparentés", "category": "animaux", "grade_level": "1"},
        
        // Care vocabulary
        {"word": "soigner", "definition": "prendre soin", "category": "soins", "grade_level": "1"},
        {"word": "protéger", "definition": "garder en sécurité", "category": "soins", "grade_level": "1"}
      ]
    }
  ];
  
  // Continue with units 6-10
  const moreVocabularies = [
    {
      // Unit 6: Forces et mouvements simples
      vocabulary: [
        // Force vocabulary
        {"word": "force", "definition": "poussée ou tirage", "category": "forces", "grade_level": "1"},
        {"word": "pousser", "definition": "exercer une force vers l'avant", "category": "forces", "grade_level": "1"},
        {"word": "tirer", "definition": "exercer une force vers soi", "category": "forces", "grade_level": "1"},
        {"word": "presser", "definition": "appuyer fort", "category": "forces", "grade_level": "1"},
        {"word": "soulever", "definition": "lever vers le haut", "category": "forces", "grade_level": "1"},
        {"word": "tourner", "definition": "faire des rotations", "category": "forces", "grade_level": "1"},
        
        // Movement vocabulary
        {"word": "mouvement", "definition": "fait de bouger", "category": "mouvement", "grade_level": "1"},
        {"word": "bouger", "definition": "changer de place", "category": "mouvement", "grade_level": "1"},
        {"word": "immobile", "definition": "qui ne bouge pas", "category": "mouvement", "grade_level": "1"},
        {"word": "déplacer", "definition": "changer de position", "category": "mouvement", "grade_level": "1"},
        {"word": "vitesse", "definition": "rapidité du mouvement", "category": "mouvement", "grade_level": "1"},
        {"word": "direction", "definition": "côté où on va", "category": "mouvement", "grade_level": "1"},
        
        // Types of movement
        {"word": "rouler", "definition": "bouger en tournant", "category": "types mouvement", "grade_level": "1"},
        {"word": "glisser", "definition": "bouger en contact", "category": "types mouvement", "grade_level": "1"},
        {"word": "rebondir", "definition": "revenir après impact", "category": "types mouvement", "grade_level": "1"},
        {"word": "tomber", "definition": "descendre vers le bas", "category": "types mouvement", "grade_level": "1"},
        {"word": "monter", "definition": "aller vers le haut", "category": "types mouvement", "grade_level": "1"},
        {"word": "descendre", "definition": "aller vers le bas", "category": "types mouvement", "grade_level": "1"},
        
        // Speed vocabulary
        {"word": "rapide", "definition": "qui va vite", "category": "vitesse", "grade_level": "1"},
        {"word": "lent", "definition": "qui va doucement", "category": "vitesse", "grade_level": "1"},
        {"word": "arrêter", "definition": "cesser de bouger", "category": "vitesse", "grade_level": "1"},
        {"word": "commencer", "definition": "débuter le mouvement", "category": "vitesse", "grade_level": "1"},
        
        // Simple machines
        {"word": "machine", "definition": "outil qui aide", "category": "machines", "grade_level": "1"},
        {"word": "roue", "definition": "objet rond qui tourne", "category": "machines", "grade_level": "1"},
        {"word": "plan incliné", "definition": "surface penchée", "category": "machines", "grade_level": "1"},
        {"word": "levier", "definition": "barre qui aide à soulever", "category": "machines", "grade_level": "1"},
        {"word": "faciliter", "definition": "rendre plus facile", "category": "machines", "grade_level": "1"}
      ]
    },
    {
      // Unit 7: Éveil du printemps
      vocabulary: [
        // Spring vocabulary
        {"word": "printemps", "definition": "saison après l'hiver", "category": "saisons", "grade_level": "1"},
        {"word": "éveil", "definition": "réveil de la nature", "category": "changements", "grade_level": "1"},
        {"word": "renouveau", "definition": "recommencement", "category": "changements", "grade_level": "1"},
        {"word": "renaissance", "definition": "nouvelle naissance", "category": "changements", "grade_level": "1"},
        
        // Weather changes
        {"word": "doux", "definition": "température agréable", "category": "météo", "grade_level": "1"},
        {"word": "réchauffer", "definition": "devenir plus chaud", "category": "météo", "grade_level": "1"},
        {"word": "dégel", "definition": "glace qui fond", "category": "météo", "grade_level": "1"},
        {"word": "fondre", "definition": "devenir liquide", "category": "météo", "grade_level": "1"},
        
        // Plant growth
        {"word": "bourgeon", "definition": "début d'une nouvelle pousse", "category": "plantes", "grade_level": "1"},
        {"word": "pousser", "definition": "commencer à grandir", "category": "plantes", "grade_level": "1"},
        {"word": "germer", "definition": "graine qui commence à grandir", "category": "plantes", "grade_level": "1"},
        {"word": "éclore", "definition": "fleur qui s'ouvre", "category": "plantes", "grade_level": "1"},
        {"word": "verdoyer", "definition": "devenir vert", "category": "plantes", "grade_level": "1"},
        {"word": "fleurir", "definition": "produire des fleurs", "category": "plantes", "grade_level": "1"},
        
        // New life
        {"word": "naissance", "definition": "début de la vie", "category": "vie", "grade_level": "1"},
        {"word": "naître", "definition": "commencer à vivre", "category": "vie", "grade_level": "1"},
        {"word": "œuf", "definition": "début de la vie pour certains animaux", "category": "vie", "grade_level": "1"},
        {"word": "petit", "definition": "jeune animal", "category": "animaux", "grade_level": "1"},
        {"word": "nid", "definition": "maison d'oiseau", "category": "animaux", "grade_level": "1"},
        
        // Spring activities
        {"word": "jardiner", "definition": "s'occuper des plantes", "category": "activités", "grade_level": "1"},
        {"word": "planter", "definition": "mettre en terre", "category": "activités", "grade_level": "1"},
        {"word": "semer", "definition": "mettre des graines", "category": "activités", "grade_level": "1"},
        {"word": "arroser", "definition": "donner de l'eau", "category": "activités", "grade_level": "1"},
        
        // Colors of spring
        {"word": "vert", "definition": "couleur des feuilles", "category": "couleurs", "grade_level": "1"},
        {"word": "rose", "definition": "couleur douce", "category": "couleurs", "grade_level": "1"},
        {"word": "violet", "definition": "couleur des violettes", "category": "couleurs", "grade_level": "1"},
        {"word": "coloré", "definition": "avec plusieurs couleurs", "category": "couleurs", "grade_level": "1"}
      ]
    },
    {
      // Unit 8: Notre environnement partagé
      vocabulary: [
        // Environment vocabulary
        {"word": "environnement", "definition": "tout ce qui nous entoure", "category": "environnement", "grade_level": "1"},
        {"word": "habitat", "definition": "lieu de vie des êtres vivants", "category": "environnement", "grade_level": "1"},
        {"word": "écosystème", "definition": "ensemble d'êtres vivants et non-vivants", "category": "environnement", "grade_level": "1"},
        {"word": "nature", "definition": "monde naturel", "category": "environnement", "grade_level": "1"},
        
        // Sharing environment
        {"word": "partager", "definition": "utiliser ensemble", "category": "partage", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter avec soin", "category": "respect", "grade_level": "1"},
        {"word": "protéger", "definition": "garder en sécurité", "category": "protection", "grade_level": "1"},
        {"word": "préserver", "definition": "garder en bon état", "category": "protection", "grade_level": "1"},
        {"word": "conserver", "definition": "utiliser avec modération", "category": "protection", "grade_level": "1"},
        
        // Environmental problems
        {"word": "pollution", "definition": "saleté dans l'environnement", "category": "problèmes", "grade_level": "1"},
        {"word": "déchets", "definition": "choses qu'on jette", "category": "problèmes", "grade_level": "1"},
        {"word": "gaspillage", "definition": "utiliser trop", "category": "problèmes", "grade_level": "1"},
        {"word": "nettoyer", "definition": "rendre propre", "category": "solutions", "grade_level": "1"},
        
        // Conservation actions
        {"word": "recycler", "definition": "transformer pour réutiliser", "category": "actions", "grade_level": "1"},
        {"word": "réutiliser", "definition": "utiliser à nouveau", "category": "actions", "grade_level": "1"},
        {"word": "réduire", "definition": "utiliser moins", "category": "actions", "grade_level": "1"},
        {"word": "économiser", "definition": "ne pas gaspiller", "category": "actions", "grade_level": "1"},
        
        // Natural resources
        {"word": "ressource", "definition": "chose utile de la nature", "category": "ressources", "grade_level": "1"},
        {"word": "eau", "definition": "liquide nécessaire à la vie", "category": "ressources", "grade_level": "1"},
        {"word": "air", "definition": "gaz qu'on respire", "category": "ressources", "grade_level": "1"},
        {"word": "sol", "definition": "terre où poussent les plantes", "category": "ressources", "grade_level": "1"},
        
        // Responsibility
        {"word": "responsabilité", "definition": "devoir de prendre soin", "category": "responsabilité", "grade_level": "1"},
        {"word": "citoyen", "definition": "personne qui vit dans une communauté", "category": "responsabilité", "grade_level": "1"},
        {"word": "communauté", "definition": "groupe de personnes qui vivent ensemble", "category": "responsabilité", "grade_level": "1"},
        {"word": "futur", "definition": "temps qui vient", "category": "responsabilité", "grade_level": "1"},
        
        // Caring actions
        {"word": "soigner", "definition": "prendre soin", "category": "soins", "grade_level": "1"},
        {"word": "aider", "definition": "donner de l'assistance", "category": "soins", "grade_level": "1"}
      ]
    },
    {
      // Unit 9: Sons et vibrations fascinants
      vocabulary: [
        // Sound vocabulary
        {"word": "son", "definition": "ce qu'on entend", "category": "son", "grade_level": "1"},
        {"word": "bruit", "definition": "son fort ou désagréable", "category": "son", "grade_level": "1"},
        {"word": "silence", "definition": "absence de son", "category": "son", "grade_level": "1"},
        {"word": "entendre", "definition": "percevoir les sons", "category": "son", "grade_level": "1"},
        {"word": "écouter", "definition": "faire attention aux sons", "category": "son", "grade_level": "1"},
        
        // Sound properties
        {"word": "fort", "definition": "son avec beaucoup de volume", "category": "propriétés", "grade_level": "1"},
        {"word": "faible", "definition": "son avec peu de volume", "category": "propriétés", "grade_level": "1"},
        {"word": "aigu", "definition": "son haut", "category": "propriétés", "grade_level": "1"},
        {"word": "grave", "definition": "son bas", "category": "propriétés", "grade_level": "1"},
        {"word": "doux", "definition": "son agréable", "category": "propriétés", "grade_level": "1"},
        
        // Vibration vocabulary
        {"word": "vibration", "definition": "mouvement rapide de va-et-vient", "category": "vibrations", "grade_level": "1"},
        {"word": "vibrer", "definition": "bouger très vite", "category": "vibrations", "grade_level": "1"},
        {"word": "secouer", "definition": "faire bouger rapidement", "category": "vibrations", "grade_level": "1"},
        {"word": "trembler", "definition": "bouger avec de petits mouvements", "category": "vibrations", "grade_level": "1"},
        
        // Sound sources
        {"word": "voix", "definition": "son produit par la bouche", "category": "sources", "grade_level": "1"},
        {"word": "instrument", "definition": "objet qui fait de la musique", "category": "sources", "grade_level": "1"},
        {"word": "tambour", "definition": "instrument qu'on frappe", "category": "instruments", "grade_level": "1"},
        {"word": "cloche", "definition": "instrument métallique", "category": "instruments", "grade_level": "1"},
        {"word": "sifflet", "definition": "instrument qu'on souffle", "category": "instruments", "grade_level": "1"},
        
        // Making sounds
        {"word": "frapper", "definition": "donner des coups", "category": "production", "grade_level": "1"},
        {"word": "souffler", "definition": "pousser de l'air", "category": "production", "grade_level": "1"},
        {"word": "gratter", "definition": "frotter avec les doigts", "category": "production", "grade_level": "1"},
        {"word": "secouer", "definition": "agiter rapidement", "category": "production", "grade_level": "1"},
        
        // Sound travel
        {"word": "voyager", "definition": "se déplacer", "category": "propagation", "grade_level": "1"},
        {"word": "se propager", "definition": "se répandre", "category": "propagation", "grade_level": "1"},
        {"word": "écho", "definition": "son qui revient", "category": "propagation", "grade_level": "1"},
        {"word": "résonner", "definition": "produire un écho", "category": "propagation", "grade_level": "1"}
      ]
    },
    {
      // Unit 10: Exposition scientifique de fin d'année
      vocabulary: [
        // Science fair vocabulary
        {"word": "exposition", "definition": "présentation publique", "category": "présentation", "grade_level": "1"},
        {"word": "projet", "definition": "travail qu'on réalise", "category": "projet", "grade_level": "1"},
        {"word": "expérience", "definition": "test scientifique", "category": "projet", "grade_level": "1"},
        {"word": "démonstration", "definition": "action de montrer", "category": "présentation", "grade_level": "1"},
        {"word": "présenter", "definition": "montrer et expliquer", "category": "présentation", "grade_level": "1"},
        
        // Scientific method review
        {"word": "hypothèse", "definition": "idée à vérifier", "category": "méthode", "grade_level": "1"},
        {"word": "prédiction", "definition": "ce qu'on pense qui va arriver", "category": "méthode", "grade_level": "1"},
        {"word": "résultat", "definition": "ce qui arrive", "category": "méthode", "grade_level": "1"},
        {"word": "conclusion", "definition": "ce qu'on apprend", "category": "méthode", "grade_level": "1"},
        
        // Communication
        {"word": "expliquer", "definition": "faire comprendre", "category": "communication", "grade_level": "1"},
        {"word": "décrire", "definition": "dire comment c'est", "category": "communication", "grade_level": "1"},
        {"word": "partager", "definition": "montrer aux autres", "category": "communication", "grade_level": "1"},
        {"word": "enseigner", "definition": "aider à apprendre", "category": "communication", "grade_level": "1"},
        
        // Learning reflection
        {"word": "apprendre", "definition": "acquérir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "découvrir", "definition": "trouver du nouveau", "category": "apprentissage", "grade_level": "1"},
        {"word": "comprendre", "definition": "saisir le sens", "category": "apprentissage", "grade_level": "1"},
        {"word": "savoir", "definition": "avoir des connaissances", "category": "apprentissage", "grade_level": "1"},
        {"word": "progrès", "definition": "amélioration", "category": "apprentissage", "grade_level": "1"},
        
        // Scientific attitudes
        {"word": "curieux", "definition": "qui veut apprendre", "category": "attitudes", "grade_level": "1"},
        {"word": "patient", "definition": "qui sait attendre", "category": "attitudes", "grade_level": "1"},
        {"word": "persévérant", "definition": "qui continue malgré les difficultés", "category": "attitudes", "grade_level": "1"},
        {"word": "observateur", "definition": "qui regarde attentivement", "category": "attitudes", "grade_level": "1"},
        
        // Celebration
        {"word": "célébrer", "definition": "fêter quelque chose", "category": "célébration", "grade_level": "1"},
        {"word": "réussite", "definition": "succès obtenu", "category": "célébration", "grade_level": "1"},
        {"word": "accomplissement", "definition": "chose réalisée", "category": "célébration", "grade_level": "1"},
        {"word": "fierté", "definition": "sentiment de satisfaction", "category": "célébration", "grade_level": "1"},
        
        // Future science
        {"word": "continuer", "definition": "poursuivre", "category": "futur", "grade_level": "1"},
        {"word": "explorer", "definition": "chercher à découvrir", "category": "futur", "grade_level": "1"}
      ]
    }
  ];
  
  // Combine all vocabularies
  const allVocabularies = [...unitVocabularies, ...moreVocabularies];
  
  console.log('📝 ADDING VOCABULARY TO EACH SCIENCE UNIT:\n');
  
  // Update each unit with vocabulary
  for (let i = 0; i < scienceLRP.unitPlans.length; i++) {
    const unit = scienceLRP.unitPlans[i];
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
    where: { longRangePlanId: scienceLRP.id },
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
  
  console.log('\n📊 FINAL SCIENCE VOCABULARY STATISTICS:');
  console.log('═══════════════════════════════════════');
  console.log(`📚 Total Science Units: ${updatedUnits.length}`);
  console.log(`📝 Total Vocabulary Words: ${totalWords}`);
  console.log(`📈 Average per Unit: ${Math.round(totalWords / updatedUnits.length)}`);
  console.log(`🏷️ Categories Used: ${allCategories.size}`);
  console.log(`📋 Category List: ${Array.from(allCategories).sort().join(', ')}`);
  
  if (totalWords >= 200) {
    console.log('\n🎉 SUCCESS! Science vocabulary complete');
    console.log('✅ All units have comprehensive, Grade 1 appropriate science vocabulary');
    console.log('✅ Connected to scientific concepts and inquiry methods');
    console.log('✅ Supports French immersion science instruction');
  } else {
    console.log('\n⚠️ INCOMPLETE: More vocabulary needed');
  }
  
  await prisma.$disconnect();
}

completeScienceVocabulary().catch(console.error);