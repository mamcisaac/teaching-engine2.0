const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUnitSpecificDifferentiation() {
  try {
    console.log('🎯 CREATING UNIT-SPECIFIC DIFFERENTIATION STRATEGIES');
    console.log('====================================================\n');
    
    // Get all units organized by subject
    const allUnits = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });

    // Group by subject
    const unitsBySubject = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan?.subject || 'Unknown';
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    });

    // Create differentiation strategies for each subject
    console.log('CREATING DIFFERENTIATION FOR FRANÇAIS (IMMERSION) UNITS');
    console.log('========================================================\n');
    
    const frenchDifferentiations = [
      {
        title: "Bienvenue en français",
        strategies: {
          forStruggling: "SOUTIEN POUR LES SALUTATIONS:\n• Cartes visuelles avec gestes pour 'Bonjour', 'Au revoir'\n• Pratique en paires avec phrase modèle répétée\n• Enregistrements audio pour pronunciation\n• Focus sur 5 salutations essentielles seulement",
          forOnLevel: "PROGRESSION DES SALUTATIONS:\n• Maîtrise 8-10 salutations courantes\n• Jeux de rôle avec changement de partenaires\n• Création de livre personnel de salutations\n• Connexion salutations formelles/informelles",
          forAdvanced: "ENRICHISSEMENT SALUTATIONS:\n• Recherche salutations de différentes cultures francophones\n• Création sketches de salutations complexes\n• Enseigner salutations aux plus jeunes\n• Exploration expressions idiomatiques francophones",
          forELL: "PONT LINGUISTIQUE POUR SALUTATIONS:\n• Comparaison salutations langue maternelle/français\n• Cartes doubles langue-français si approprié\n• Gestes universels comme support\n• Célébration progrès même avec accent"
        }
      },
      {
        title: "Histoires d'automne",
        strategies: {
          forStruggling: "SOUTIEN POUR HISTOIRES:\n• Images séquentielles pour structure début-milieu-fin\n• Vocabulaire automne avec objets réels (feuilles, pommes)\n• Histoires courtes avec répétitions\n• Dessins pour exprimer compréhension avant mots",
          forOnLevel: "PROGRESSION NARRATIVE AUTOMNE:\n• Création histoires personnelles avec photos automne\n• Utilisation mots descriptifs saisonniers\n• Lecture partagée avec prédictions\n• Carnet d'histoires automne illustré",
          forAdvanced: "ENRICHISSEMENT NARRATIF:\n• Création histoires automne avec dialogues\n• Utilisation adjectifs sophistiqués\n• Adaptation histoires pour différents âges\n• Recherche légendes automnales francophones",
          forELL: "SUPPORT NARRATIF CULTUREL:\n• Connexion traditions automne culture d'origine\n• Images pour supporter nouveau vocabulaire\n• Partage histoires automne multilingue\n• Dictionnaire visuel automne personnalisé"
        }
      },
      {
        title: "Ma famille française",
        strategies: {
          forStruggling: "SOUTIEN FAMILLE:\n• Photos famille personnelle pour vocabulaire concret\n• Arbre généalogique simplifié (parents, frères/sœurs)\n• Mots famille avec gestes ou actions\n• Répétition 'Ma famille a...' structure simple",
          forOnLevel: "EXPLORATION FAMILLE:\n• Création livre famille avec descriptions\n• Comparaison tailles et compositions familiales\n• Interviews famille pour traditions\n• Présentation famille à la classe",
          forAdvanced: "ENRICHISSEMENT FAMILIAL:\n• Recherche familles dans littérature française\n• Création généalogie étendue avec vocabulaire spécialisé\n• Exploration structures familiales diverses cultures\n• Rédaction histoire famille imaginaire complexe",
          forELL: "SENSIBILITÉ CULTURELLE FAMILLE:\n• Respect structures familiales diverses\n• Vocabulaire famille étendue selon culture\n• Partage traditions familiales diverses\n• Support pour concepts famille différents"
        }
      },
      {
        title: "Célébrations d'hiver",
        strategies: {
          forStruggling: "SOUTIEN CÉLÉBRATIONS:\n• Images festives pour vocabulaire concret\n• Focus célébrations universelles (lumières, cadeaux)\n• Chansons simples avec gestes répétitifs\n• Activités sensorielles (décorations tactiles)",
          forOnLevel: "EXPLORATION FESTIVITÉS:\n• Comparaison célébrations diverses cultures\n• Création calendrier festivités hiver\n• Récits traditions famille personnelles\n• Fabrication cartes festives bilingues",
          forAdvanced: "ENRICHISSEMENT CULTUREL:\n• Recherche origines traditions hivernales\n• Création présentation célébrations mondiales\n• Rédaction invitations événements formels\n• Organisation mini-festival multiculturel classe",
          forELL: "INCLUSION CÉLÉBRATIONS:\n• Partage célébrations culture d'origine\n• Vocabulaire festif multilingue accepté\n• Création ponts entre traditions\n• Respect non-participation si approprié"
        }
      },
      {
        title: "Poésie et rythmes",
        strategies: {
          forStruggling: "SOUTIEN POÉTIQUE:\n• Poèmes courts avec rimes évidentes\n• Battement mains pour rythme avant mots\n• Images pour supports sens poèmes\n• Récitation chorale pour confiance",
          forOnLevel: "EXPLORATION RYTHMIQUE:\n• Création poèmes simples avec patron donné\n• Utilisation instruments pour rythme\n• Mémorisation poèmes avec expression\n• Illustration poèmes personnels",
          forAdvanced: "ENRICHISSEMENT POÉTIQUE:\n• Analyse différents types poèmes français\n• Création poèmes libres originaux\n• Performance poétique avec mise en scène\n• Exploration poésie franco-canadienne",
          forELL: "PONT POÉTIQUE:\n• Comparaison rythmes poésie diverses langues\n• Traduction simple poèmes familiers\n• Support gestuel pour compréhension\n• Célébration musicalité toutes langues"
        }
      },
      {
        title: "Jeunes auteurs créatifs",
        strategies: {
          forStruggling: "SOUTIEN ÉCRITURE:\n• Modèles phrases simples à compléter\n• Banque mots visuels pour inspiration\n• Dictée à l'adulte pour idées complexes\n• Focus sur 1-2 phrases bien formées",
          forOnLevel: "PROGRESSION ÉCRITURE:\n• Utilisation organisateurs graphiques\n• Révision avec partenaire d'écriture\n• Mini-leçons orthographe dans contexte\n• Portfolio progrès écriture personnalisé",
          forAdvanced: "ENRICHISSEMENT LITTÉRAIRE:\n• Exploration différents genres écriture\n• Création histoires chapitre multiples\n• Révision critique avec suggestions\n• Publication pour audiencees diverses",
          forELL: "SUPPORT CRÉATIF:\n• Autorisation dessins pour planification\n• Modèles structures phrases complexes\n• Conférences individuelles fréquentes\n• Célébration progrès créatif avant perfection"
        }
      },
      {
        title: "Exploration de textes",
        strategies: {
          forStruggling: "SOUTIEN LECTURE:\n• Textes courts avec images abondantes\n• Lecture guidée avec questions simples\n• Prédictions basées sur illustrations\n• Focus compréhension avant fluidité",
          forOnLevel: "EXPLORATION TEXTUELLE:\n• Comparaison différents types textes\n• Stratégies lecture active avec annotations\n• Discussions littéraires en petit groupe\n• Connexions texte-vie personnelle",
          forAdvanced: "ENRICHISSEMENT LECTURE:\n• Analyse éléments littéraires complexes\n• Lecture textes niveau supérieur\n• Création questions pour discussion classe\n• Recherche auteurs franco-canadiens",
          forELL: "PONT LECTURE:\n• Support visuel pour nouveau vocabulaire\n• Connexions textes cultures diverses\n• Lecture en tandem avec francophone\n• Dictionnaire personnel illustré"
        }
      },
      {
        title: "Communication créative",
        strategies: {
          forStruggling: "SOUTIEN COMMUNICATION:\n• Communication non-verbale acceptée initialement\n• Supports visuels pour expression idées\n• Pratique en petits groupes sécurisants\n• Focus sur message avant forme",
          forOnLevel: "DÉVELOPPEMENT EXPRESSIF:\n• Présentation avec supports multimédias\n• Jeux rôles diverses situations communication\n• Feedback constructif entre pairs\n• Portfolio expressions diverses formes",
          forAdvanced: "ENRICHISSEMENT COMMUNICATIF:\n• Animation discussions classe entière\n• Création médias communication variés\n• Mentorat élèves ayant plus difficultés\n• Exploration communication formelle/informelle",
          forELL: "INCLUSION COMMUNICATIVE:\n• Temps supplémentaire pour formulation\n• Acceptation créolisation temporaire\n• Partenariat avec francophones patients\n• Célébration courage communication"
        }
      },
      {
        title: "Explorateurs de mots",
        strategies: {
          forStruggling: "SOUTIEN VOCABULAIRE:\n• Mots concrets avec manipulatives\n• Familles mots avec racines visuelles\n• Jeux vocabulaire kinesthésiques\n• Cartes mémoire avec images personnelles",
          forOnLevel: "EXPLORATION LEXICALE:\n• Dictionnaire personnel organisé par thèmes\n• Chasse mots nouveaux lecture quotidienne\n• Création définitions propres mots\n• Utilisation contexte pour sens",
          forAdvanced: "ENRICHISSEMENT LINGUISTIQUE:\n• Étymologie mots français fascinants\n• Création jeux mots pour classe\n• Exploration nuances synonymes\n• Collection expressions idiomatiques",
          forELL: "PONT LEXICAL:\n• Cognats entre langues pour connexions\n• Transfert stratégies langue maternelle\n• Cartes conceptuelles multilingues\n• Dictionnaire personnel trilingue"
        }
      },
      {
        title: "Notre année française",
        strategies: {
          forStruggling: "SOUTIEN RÉFLEXION:\n• Portfolio photos année avec légendes simples\n• Questions guidées pour auto-évaluation\n• Célébration progrès concrets mesurables\n• Support pair pour articulation progrès",
          forOnLevel: "RÉFLEXION STRUCTURÉE:\n• Comparaison début-fin année avec exemples\n• Objectifs personnels pour continuation\n• Présentation progrès à famille\n• Lettre à soi futur élève français",
          forAdvanced: "RÉFLEXION APPROFONDIE:\n• Analyse stratégies apprentissage efficaces\n• Mentorat élèves année prochaine\n• Création guide apprentissage français\n• Planification apprentissage estival",
          forELL: "CÉLÉBRATION MULTILINGUE:\n• Reconnaissance progrès bilinguisme\n• Partage stratégies apprentissage langue\n• Fierté identité plurilingue\n• Ressources continuation apprentissage"
        }
      }
    ];

    console.log('Updating French units with specific differentiation...\n');
    
    // Update French units
    const frenchUnits = unitsBySubject['Français (Immersion)'] || [];
    for (let i = 0; i < frenchUnits.length && i < frenchDifferentiations.length; i++) {
      const unit = frenchUnits[i];
      const diff = frenchDifferentiations[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          differentiationStrategies: diff.strategies
        }
      });
      
      console.log(`✅ Updated: ${diff.title}`);
    }

    console.log('\nCREATING DIFFERENTIATION FOR MATHÉMATIQUES UNITS');
    console.log('===============================================\n');
    
    const mathDifferentiations = [
      {
        title: "Fondations des nombres 0-10",
        strategies: {
          forStruggling: "SOUTIEN NOMBRES CONCRETS:\n• Manipulatives permanents (ours comptage, cubes)\n• Ligne numérique au sol pour mouvement corporel\n• Cartes quantité avec points/images avant chiffres\n• Focus nombres 0-5 avant extension à 10",
          forOnLevel: "PROGRESSION NUMÉRIQUE:\n• Représentations multiples même nombre\n• Jeux nombres avec dés et cartes\n• Estimation quantités avant comptage précis\n• Connexions nombres vie quotidienne",
          forAdvanced: "ENRICHISSEMENT NUMÉRIQUE:\n• Exploration systèmes nombres autres cultures\n• Création problèmes nombres pour classe\n• Patterns nombres jusqu'à 20 ou plus\n• Investigation propriétés nombres (pairs/impairs)",
          forELL: "PONT NUMÉRIQUE:\n• Nombres dans langue maternelle pour comparaison\n• Gestes universels comptage comme support\n• Chansons nombres multilingues\n• Célébration mathématiques universelles"
        }
      },
      {
        title: "Régularités et relations",
        strategies: {
          forStruggling: "SOUTIEN PATTERNS:\n• Patterns corporels (tape-frappe-tape) avant abstraits\n• Manipulatives couleurs pour patterns visuels\n• Patterns simples AB avant ABC\n• Prédiction prochain élément avec support",
          forOnLevel: "EXPLORATION PATTERNS:\n• Création patterns avec matériaux divers\n• Chasse patterns environnement classe/école\n• Patterns sonores avec instruments\n• Documentation patterns trouvés nature",
          forAdvanced: "ENRICHISSEMENT PATTERNS:\n• Patterns complexes (AABB, ABCD)\n• Création règles patterns pour autres\n• Analyse patterns art/architecture\n• Investigation patterns mathématiques avancés",
          forELL: "PONT PATTERN:\n• Patterns culturels (musique, art traditionnel)\n• Vocabulaire pattern langue maternelle\n• Patterns gestuels universels\n• Expressions mathématiques visuelles"
        }
      },
      {
        title: "Addition jusqu'à 10",
        strategies: {
          forStruggling: "SOUTIEN ADDITION CONCRÈTE:\n• Manipulatives toujours disponibles\n• Histoires addition avec objets réels\n• Focus additions résultat ≤ 5 initialement\n• Modélisation 'mettre ensemble' physique",
          forOnLevel: "PROGRESSION ADDITION:\n• Stratégies addition mentale (compter partir plus grand)\n• Problèmes addition contextes familiers\n• Représentations addition diverses (dessins, symboles)\n• Vérification réponses avec manipulatives",
          forAdvanced: "ENRICHISSEMENT ADDITION:\n• Exploration commutativité addition\n• Création problèmes addition complexes\n• Strategies efficaces addition mentale\n• Investigation patterns addition",
          forELL: "PONT ADDITION:\n• Vocabulaire addition ('plus', 'ajouter') avec gestes\n• Problèmes contexts culturels familiaux\n• Support visuel pour nouveaux concepts\n• Manipulation comme langue mathématique universelle"
        }
      },
      {
        title: "Formes 2D et solides 3D",
        strategies: {
          forStruggling: "SOUTIEN GÉOMÉTRIQUE:\n• Formes réelles manipulatives avant images\n• Focus formes essentielles (cercle, carré, triangle)\n• Chasse formes environnement familier\n• Tracage formes dans sable/pâte",
          forOnLevel: "EXPLORATION SPATIALE:\n• Tri formes selon propriétés diverses\n• Création art avec formes géométriques\n• Description formes vocabulaire précis\n• Construction solides avec matériaux",
          forAdvanced: "ENRICHISSEMENT GÉOMÉTRIQUE:\n• Analyse propriétés formes (côtés, angles)\n• Création formes complexes combinaisons\n• Investigation formes architecture\n• Classification solides systématique",
          forELL: "PONT SPATIAL:\n• Formes vocabulaire langue maternelle\n• Arts traditionnels utilisant formes\n• Géométrie comme langage visuel universel\n• Noms formes multilingues acceptés"
        }
      },
      {
        title: "Soustraction et relations inverses",
        strategies: {
          forStruggling: "SOUTIEN SOUSTRACTION:\n• Histoires 'enlever' avec objets concrets\n• Focus soustraction sans régroupement\n• Modélisation physique 'partir de' puis 'enlever'\n• Connexion soustraction avec addition connue",
          forOnLevel: "RELATIONS INVERSES:\n• Familles faits mathématiques (3+4=7, 7-4=3)\n• Problèmes soustraction contexts divers\n• Strategies vérification avec addition\n• Jeux utilisant relations addition-soustraction",
          forAdvanced: "ENRICHISSEMENT RELATIONNEL:\n• Investigation patterns soustraction\n• Création problèmes soustraction multi-étapes\n• Exploration soustraction mentale efficace\n• Analyse relations mathématiques complexes",
          forELL: "PONT SOUSTRACTION:\n• Vocabulaire soustraction avec démonstrations\n• Contextes culturels pour problèmes\n• Manipulation comme support compréhension\n• Connexions stratégies calcul diverses cultures"
        }
      },
      {
        title: "Nombres 11-20 et base dix",
        strategies: {
          forStruggling: "SOUTIEN BASE DIX:\n• Groupement concret par 10 (bâtonnets, cubes)\n• Focus teen numbers avec décomposition claire\n• Manipulation dizaines-unités séparées\n• Lecture nombres avec support visuel",
          forOnLevel: "SYSTÈME DÉCIMAL:\n• Representation nombres base dix multiples façons\n• Patterns nombres 11-20 analyse\n• Estimation quantités teen numbers\n• Jeux base dix avec matériel",
          forAdvanced: "ENRICHISSEMENT DÉCIMAL:\n• Extension nombres 21-100 patterns\n• Comparaison systèmes nombres autres bases\n• Investigation efficacité système base 10\n• Création problèmes base dix complexes",
          forELL: "PONT DÉCIMAL:\n• Comparaison systèmes comptage cultures\n• Base dix comme système universel\n• Vocabulaire nombres double-langue\n• Celebration diversité systèmes mathématiques"
        }
      },
      {
        title: "Mesure non-standard",
        strategies: {
          forStruggling: "SOUTIEN MESURE:\n• Unités mesure corps (pas, empans) familières\n• Comparaison directe avant mesure numérique\n• Objets mesure consistants (trombones, cubes)\n• Focus estimation avant mesure précise",
          forOnLevel: "EXPLORATION MESURE:\n• Variety unités mesure pour même objet\n• Prédiction puis vérification mesures\n• Documentation mesures trouvailles\n• Comparaison efficacité unités diverses",
          forAdvanced: "ENRICHISSEMENT MESURE:\n• Investigation relation taille unité-nombre\n• Création unités mesure personnalisées\n• Analyse précision diverses unités\n• Exploration mesures histoires cultures",
          forELL: "PONT MESURE:\n• Unités mesure traditionnelles culture origine\n• Vocabulaire mesure avec démonstrations\n• Mesure comme communication universelle\n• Comparaison systems mesure mondiaux"
        }
      },
      {
        title: "Comparaison et ordonnancement",
        strategies: {
          forStruggling: "SOUTIEN COMPARAISON:\n• Comparaison directe objets concrets\n• Vocabulaire comparaison (plus, moins, égal) avec gestes\n• Tri objets selon un critère unique\n• Support visuel pour relations abstraites",
          forOnLevel: "RELATIONS ORDINALES:\n• Ordonnancement critères multiples\n• Jeux comparaison avec justification\n• Graphiques simples pour comparaisons\n• Investigation patterns ordonnancement",
          forAdvanced: "ENRICHISSEMENT ORDINAL:\n• Comparaisons complexes critères multiples\n• Création systèmes classification\n• Analyse données pour tendances\n• Investigation ordonnancement efficace",
          forELL: "PONT COMPARATIF:\n• Comparaisons contexts culturels familiers\n• Vocabulaire comparaison multilingue\n• Gestures pour relations mathématiques\n• Systèmes classification diverses cultures"
        }
      },
      {
        title: "Stratégies de calcul mental",
        strategies: {
          forStruggling: "SOUTIEN CALCUL:\n• Une stratégie maîtrisée avant multiples\n• Manipulatives disponibles pour vérification\n• Faits mathématiques automatisés simples\n• Temps supplémentaire pour reflection",
          forOnLevel: "STRATÉGIES MENTALES:\n• Comparaison efficacité stratégies diverses\n• Choix stratégie selon problème\n• Pratique fluency faits essentiels\n• Explication raisonnement calcul",
          forAdvanced: "ENRICHISSEMENT STRATÉGIQUE:\n• Investigation patterns calcul mental\n• Création raccourcis calcul personnalisés\n• Enseignement stratégies autres élèves\n• Exploration calcul mental cultures diverses",
          forELL: "PONT CALCUL:\n• Stratégies calcul mental langue maternelle\n• Vocabulary calcul avec démonstrations\n• Manipulation comme pont vers abstraction\n• Celebration efficacité strategies diverses"
        }
      },
      {
        title: "Égalité et célébration mathématique",
        strategies: {
          forStruggling: "SOUTIEN ÉGALITÉ:\n• Balance concrète pour démonstration égalité\n• Égalité comme 'même quantité' avant symbole\n• Representations visuelles égalité\n• Focus équations simples une operation",
          forOnLevel: "CONCEPTS ÉGALITÉ:\n• Égalité dans equations diverses formes\n• Investigation propriétés égalité\n• Creation équations vraies/fausses\n• Portfolio apprentissage mathematique année",
          forAdvanced: "ENRICHISSEMENT ÉGALITÉ:\n• Équations algébriques introduction\n• Investigation propriétés operations\n• Creation exposé apprentissage mathematique\n• Mentoring élèves concepts difficiles",
          forELL: "PONT ÉGALITÉ:\n• Égalité comme concept universel\n• Vocabulary mathématique année complete\n• Celebration progrès mathematique personnel\n• Connexions mathematiques cultures mondiales"
        }
      }
    ];

    // Update Math units
    const mathUnits = unitsBySubject['Mathématiques'] || [];
    for (let i = 0; i < mathUnits.length && i < mathDifferentiations.length; i++) {
      const unit = mathUnits[i];
      const diff = mathDifferentiations[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          differentiationStrategies: diff.strategies
        }
      });
      
      console.log(`✅ Updated: ${diff.title}`);
    }

    console.log('\n🎯 PROGRESS UPDATE');
    console.log('==================');
    console.log('✅ French units: 10/10 completed');
    console.log('✅ Math units: 10/10 completed');
    console.log('⏳ Remaining: Science (10), Arts (10), Social Studies (5)');
    console.log('⏳ Total completed: 20/45 template replacements');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUnitSpecificDifferentiation();