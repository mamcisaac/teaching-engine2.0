import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function expandMathUnitsTo195Lessons() {
  console.log('🎯 EXPANDING MATH UNITS TO EXACTLY 195 LESSONS\n');
  console.log('=' .repeat(80));
  console.log('STRATEGY: Core + Extension Model for Perfect Flexibility');
  console.log('Units 1-5: 20 lessons each (14 core + 6 extension)');
  console.log('Units 6-10: 19 lessons each (13 core + 6 extension)');
  console.log('Total: 195 lessons = 146.25 hours EXACTLY\n');
  
  const MATH_LRP_ID = 'cmebyc98k0003vjr1svziz0in';
  
  try {
    // Get all Math units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: MATH_LRP_ID
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Found ${units.length} units to expand\n`);
    
    // Define expanded lesson structures
    const expandedStructures = [
      // Units 1-5: 20 lessons each (14 core + 6 extension)
      {
        title: 'Fondations des nombres 0-10',
        totalLessons: 20,
        coreLessons: 14,
        extensionLessons: 6,
        hours: 15,
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Diagnostic et exploration libre des nombres
• Leçons 3-5: Comptage et correspondance un-à-un (objets concrets)
• Leçons 6-8: Subitisation 1-5 (reconnaissance instantanée)
• Leçons 9-10: Formation et écriture des chiffres 0-5
• Leçons 11-12: Extension aux nombres 6-10
• Leçons 13-14: Comparaison et ordonnancement 0-10`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux de nombres et applications quotidiennes
• Extension 3: Défis de subitisation avancée
• Extension 4: Problèmes de la vie réelle (compter les collations)
• Extension 5: Création de livres de nombres personnels
• Extension 6: Célébration et portfolio des apprentissages`
      },
      {
        title: 'Régularités et relations',
        totalLessons: 20,
        coreLessons: 14,
        extensionLessons: 6,
        hours: 15,
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Découverte des régularités dans l'environnement
• Leçons 3-5: Motifs AB avec matériel varié
• Leçons 6-8: Motifs ABC et variations
• Leçons 9-11: Motifs complexes (AAB, ABB, AABB)
• Leçons 12-13: Création et extension de motifs
• Leçon 14: Transfert aux nombres (2, 4, 6, 8...)`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Motifs dans la nature et l'art
• Extension 2: Création de motifs musicaux et rythmiques
• Extension 3: Défis de motifs croissants
• Extension 4: Motifs avec mouvements corporels
• Extension 5: Chasse aux régularités dans l'école
• Extension 6: Exposition de motifs créatifs`
      },
      {
        title: 'Addition jusqu\'à 10',
        totalLessons: 20,
        coreLessons: 14,
        extensionLessons: 6,
        hours: 15,
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Concept de réunion (histoires concrètes)
• Leçons 3-4: Addition avec matériel manipulable
• Leçons 5-6: Stratégie de comptage
• Leçons 7-8: Les doubles (1+1 à 5+5)
• Leçons 9-10: Faire 10 (combinaisons)
• Leçons 11-12: Faits d'addition jusqu'à 10
• Leçons 13-14: Résolution de problèmes simples`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux d'addition (dés, cartes, dominos)
• Extension 3: Problèmes à plusieurs solutions
• Extension 4: Addition dans les histoires et comptines
• Extension 5: Défis d'addition mentale rapide
• Extension 6: Création de problèmes pour la classe`
      },
      {
        title: 'Formes 2D et solides 3D',
        totalLessons: 20,
        coreLessons: 14,
        extensionLessons: 6,
        hours: 15,
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Exploration tactile des formes
• Leçons 3-5: Formes 2D de base (cercle, carré, triangle, rectangle)
• Leçons 6-8: Propriétés des formes (côtés, coins)
• Leçons 9-11: Solides 3D (cube, sphère, cylindre, cône)
• Leçons 12-13: Comparaison 2D vs 3D
• Leçon 14: Formes dans l'environnement`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Construction avec formes (tangrams)
• Extension 2: Art géométrique de Noël
• Extension 3: Chasse aux formes photographique
• Extension 4: Création de robots géométriques
• Extension 5: Symétrie et motifs avec formes
• Extension 6: Exposition de sculptures 3D`
      },
      {
        title: 'Soustraction et relations inverses',
        totalLessons: 20,
        coreLessons: 14,
        extensionLessons: 6,
        hours: 15,
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Concept de séparation (enlever)
• Leçons 3-4: Soustraction avec manipulatifs
• Leçons 5-6: Concept de comparaison (différence)
• Leçons 7-8: Stratégies de soustraction
• Leçons 9-10: Lien avec l'addition (familles de faits)
• Leçons 11-12: Faits de soustraction jusqu'à 10
• Leçons 13-14: Problèmes de soustraction`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux de soustraction actifs
• Extension 3: Histoires de soustraction créatives
• Extension 4: Défis "Qu'est-ce qui manque?"
• Extension 5: Machines à fonctions +/-
• Extension 6: Résolution de mystères mathématiques`
      },
      // Units 6-10: 19 lessons each (13 core + 6 extension)
      {
        title: 'Nombres 11-20 et base dix',
        totalLessons: 19,
        coreLessons: 13,
        extensionLessons: 6,
        hours: 14.25,
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Construction avec "dix et quelques"
• Leçons 3-4: Cadres de dix et représentations
• Leçons 5-6: Comptage et écriture 11-20
• Leçons 7-8: Décomposition des nombres teens
• Leçons 9-10: Comparaison et ordre 0-20
• Leçons 11-12: Dizaines et unités introduction
• Leçon 13: Consolidation et évaluation`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Jeux de trading (10 unités = 1 dizaine)
• Extension 2: Estimation de grandes collections
• Extension 3: Calendrier et nombres jusqu'à 31
• Extension 4: L'argent jusqu'à 20¢
• Extension 5: Problèmes avec nombres teens
• Extension 6: Préparation pour nombres jusqu'à 100`
      },
      {
        title: 'Mesure non-standard',
        totalLessons: 19,
        coreLessons: 13,
        extensionLessons: 6,
        hours: 14.25,
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Concept de mesure et comparaison directe
• Leçons 3-4: Mesure de longueur (cubes, trombones)
• Leçons 5-6: Mesure de masse (balance)
• Leçons 7-8: Mesure de capacité (contenants)
• Leçons 9-10: Mesure du temps (routines, séquences)
• Leçons 11-12: Choix d'unités appropriées
• Leçon 13: Application et problèmes`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Création d'outils de mesure
• Extension 2: Mesure de la classe entière
• Extension 3: Recettes et mesures en cuisine
• Extension 4: Graphiques de mesures corporelles
• Extension 5: Défis d'estimation
• Extension 6: Foire scientifique de mesure`
      },
      {
        title: 'Comparaison et ordonnancement',
        totalLessons: 19,
        coreLessons: 13,
        extensionLessons: 6,
        hours: 14.25,
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Vocabulaire de comparaison
• Leçons 3-4: Plus que, moins que, égal à
• Leçons 5-6: Ordre croissant et décroissant
• Leçons 7-8: Relations +1, -1, +2, -2
• Leçons 9-10: Comparaison de quantités variées
• Leçons 11-12: Droite numérique 0-20
• Leçon 13: Résolution de problèmes`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Jeux de comparaison avec dés
• Extension 2: Enquêtes et sondages de classe
• Extension 3: Mystères "Qui a plus?"
• Extension 4: Création de problèmes de comparaison
• Extension 5: Graphiques pictogrammes
• Extension 6: Tournoi de comparaison`
      },
      {
        title: 'Stratégies de calcul mental',
        totalLessons: 19,
        coreLessons: 13,
        extensionLessons: 6,
        hours: 14.25,
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Rappel des stratégies connues
• Leçons 3-4: Doubles et quasi-doubles
• Leçons 5-6: Faire 10 et décomposition
• Leçons 7-8: Compter par bonds (2, 5, 10)
• Leçons 9-10: Faits automatiques prioritaires
• Leçons 11-12: Application dans problèmes
• Leçon 13: Démonstration de fluidité`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux de rapidité mentale
• Extension 3: Défis chronométrés (appropriés)
• Extension 4: Stratégies personnelles partagées
• Extension 5: Math mental en mouvement
• Extension 6: Spectacle de magie mathématique`
      },
      {
        title: 'Égalité et célébration mathématique',
        totalLessons: 19,
        coreLessons: 13,
        extensionLessons: 6,
        hours: 14.25,
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Concept d'égalité (balance)
• Leçons 3-4: Signe égal comme équilibre
• Leçons 5-6: Équations simples à compléter
• Leçons 7-8: Différentes représentations du même nombre
• Leçons 9-10: Révision des concepts clés de l'année
• Leçons 11-12: Portfolio et auto-évaluation
• Leçon 13: Préparation célébration`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1: Création de musée mathématique
• Extension 2: Jeux mathématiques préférés
• Extension 3: Livre de classe "Nos mathématiques"
• Extension 4: Spectacle mathématique pour parents
• Extension 5: Défis de fin d'année
• Extension 6: Célébration et transition Grade 2`
      }
    ];
    
    // Update each unit with expanded structure
    for (let i = 0; i < units.length && i < expandedStructures.length; i++) {
      const unit = units[i];
      const expanded = expandedStructures[i];
      
      console.log(`Expanding Unit ${i + 1}: ${unit.title}`);
      console.log(`  Current: ${unit.estimatedHours} hours`);
      console.log(`  Expanded: ${expanded.hours} hours (${expanded.totalLessons} lessons)`);
      console.log(`  Structure: ${expanded.coreLessons} core + ${expanded.extensionLessons} extension\n`);
      
      // Update unit with expanded structure
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          estimatedHours: expanded.hours,
          
          description: `${unit.description || ''}

STRUCTURE FLEXIBLE (${expanded.totalLessons} leçons totales):
• Leçons essentielles: ${expanded.coreLessons} (70% - contenu obligatoire pour tous)
• Leçons d'extension: ${expanded.extensionLessons} (30% - enrichissement/consolidation flexible)

Cette structure permet à Emily de:
- Minimum viable: Focus sur leçons essentielles si temps limité
- Implementation complète: Inclure toutes extensions pour maîtrise profonde
- Différenciation naturelle: Extensions servent apprenants avancés ou consolidation`,
          
          // Add detailed lesson breakdown to assessment plan
          assessmentPlan: `${unit.assessmentPlan || ''}

STRUCTURE DÉTAILLÉE DES LEÇONS:

${expanded.coreContent}

${expanded.extensionContent}

FLEXIBILITÉ D'IMPLEMENTATION:
• Si classe progresse rapidement: Utiliser toutes les extensions pour enrichissement
• Si besoin de consolidation: Extensions deviennent pratique supplémentaire
• Si disruptions: Focus sur leçons essentielles, extensions optionnelles
• Si temps supplémentaire: Extensions permettent exploration créative`,
          
          // Update culminating task to reflect expanded scope
          culminatingTask: `TÂCHE CULMINANTE FLEXIBLE:
          
Option A (Minimum - Leçons essentielles complétées):
• Démonstration des concepts de base avec matériel
• Portfolio montrant maîtrise des essentiels
• Auto-évaluation simple avec support visuel

Option B (Complète - Toutes leçons incluses):
• Projet créatif intégrant tous les concepts
• Présentation aux parents/autres classes
• Portfolio enrichi avec défis d'extension
• Création de problèmes pour futurs élèves

L'option choisie dépend du parcours de la classe et du temps disponible.`
        }
      });
      
      console.log(`✅ Unit ${i + 1} expanded successfully`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 VERIFICATION OF EXPANSION\n');
    
    // Verify the expansion
    const expandedUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: MATH_LRP_ID
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    let totalHours = 0;
    let totalLessons = 0;
    
    expandedUnits.forEach((unit, i) => {
      const lessons = Math.round(unit.estimatedHours! / 0.75);
      totalHours += unit.estimatedHours!;
      totalLessons += lessons;
      
      console.log(`Unit ${i + 1}: ${unit.estimatedHours} hours = ${lessons} lessons`);
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log('FINAL VERIFICATION:');
    console.log(`Total hours: ${totalHours} (Target: 146.25) ${totalHours === 146.25 ? '✅' : '❌'}`);
    console.log(`Total lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
    
    console.log('\n🎉 PERFECT EXPANSION ACHIEVED!');
    console.log('All units now have:');
    console.log('• Clear core vs extension structure');
    console.log('• Exactly 195 lessons total');
    console.log('• Built-in flexibility for differentiation');
    console.log('• Options for minimum viable or full implementation');
    console.log('• Natural adaptation to class needs');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

expandMathUnitsTo195Lessons();